import { get } from "@vercel/edge-config";
import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};

interface BlueGreenConfig {
  deploymentDomainBlue: string;
  deploymentDomainGreen: string;
  trafficGreenPercent: number;
}

export async function middleware(req: NextRequest) {
  if (process.env.NODE_ENV !== "production") {
    return NextResponse.next();
  }

  if (req.method !== "GET") {
    return NextResponse.next();
  }

  // RSC 요청 제외
  const url = new URL(req.url);
  if (url.searchParams.has("_rsc")) {
    return NextResponse.next();
  }

  // Prefetch 요청 제외
  if (req.headers.get("purpose") === "prefetch") {
    return NextResponse.next();
  }

  // HTML 문서 요청만 처리
  if (req.headers.get("sec-fetch-dest") !== "document") {
    return NextResponse.next();
  }

  if (/vercel/i.test(req.headers.get("user-agent") || "")) {
    return NextResponse.next();
  }

  if (!process.env.EDGE_CONFIG) {
    return NextResponse.next();
  }

  const blueGreenConfig = await get<BlueGreenConfig>(
    "blue-green-configuration"
  );

  if (!blueGreenConfig) {
    return NextResponse.next();
  }

  const deploymentCookie = req.cookies.get("__bg_deployment");
  let selectedDomain: string;

  if (deploymentCookie?.value) {
    selectedDomain = deploymentCookie.value;
  } else {
    selectedDomain = selectBlueGreenDeploymentDomain(blueGreenConfig);
  }

  const servingDomain = process.env.VERCEL_URL;

  if (!selectedDomain || servingDomain === selectedDomain) {
    const response = NextResponse.next();
    response.cookies.set("__bg_deployment", servingDomain || "", {
      sameSite: "strict",
      httpOnly: true,
      maxAge: 60 * 60 * 24,
      path: "/",
    });
    return response;
  }

  const headers = new Headers(req.headers);
  headers.set("x-deployment-override", selectedDomain);
  headers.set(
    "x-vercel-protection-bypass",
    process.env.VERCEL_AUTOMATION_BYPASS_SECRET || "unknown"
  );

  const proxyUrl = new URL(req.url);
  proxyUrl.hostname = selectedDomain;

  const proxyResponse = await fetch(proxyUrl, {
    headers,
    redirect: "manual",
  });

  const response = new NextResponse(proxyResponse.body, {
    status: proxyResponse.status,
    statusText: proxyResponse.statusText,
    headers: proxyResponse.headers,
  });

  response.cookies.set("__bg_deployment", selectedDomain, {
    sameSite: "strict",
    httpOnly: true,
    maxAge: 60 * 60 * 24,
    path: "/",
  });

  return response;
}

function selectBlueGreenDeploymentDomain(blueGreenConfig: BlueGreenConfig) {
  const random = Math.random() * 100;

  const selected =
    random < blueGreenConfig.trafficGreenPercent
      ? blueGreenConfig.deploymentDomainGreen
      : blueGreenConfig.deploymentDomainBlue || process.env.VERCEL_URL;

  if (!selected) {
    console.error("Blue green configuration error", blueGreenConfig);
  }

  if (/^http/.test(selected || "")) {
    return new URL(selected || "").hostname;
  }

  return selected;
}