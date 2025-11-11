import { get } from "@vercel/edge-config";
import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
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

  if (req.headers.get("sec-fetch-dest") !== "document") {
    return NextResponse.next();
  }

  if (/vercel/i.test(req.headers.get("user-agent") || "")) {
    return NextResponse.next();
  }

  if (!process.env.EDGE_CONFIG) {
    console.warn("EDGE_CONFIG env variable not set. Skipping blue-green.");
    return NextResponse.next();
  }

  const blueGreenConfig = await get<BlueGreenConfig>(
    "blue-green-configuration"
  );

  if (!blueGreenConfig) {
    console.warn("No blue-green configuration found");
    return NextResponse.next();
  }

  // 🔥 쿠키로 세션 고정 (Skew Protection)
  const deploymentCookie = req.cookies.get("__bg_deployment");
  let selectedDomain: string;

  if (deploymentCookie?.value) {
    // 이미 배포가 할당된 사용자 - 같은 배포 유지
    selectedDomain = deploymentCookie.value;
  } else {
    // 새 사용자 - 랜덤 선택
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

  // 다른 배포로 프록시
  const headers = new Headers(req.headers);
  headers.set("x-deployment-override", selectedDomain);
  headers.set(
    "x-vercel-protection-bypass",
    process.env.VERCEL_AUTOMATION_BYPASS_SECRET || "unknown"
  );

  const url = new URL(req.url);
  url.hostname = selectedDomain;

  const proxyResponse = await fetch(url, {
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

function selectBlueGreenDeploymentDomain(blueGreenConfig: BlueGreenConfig): string {
  const random = Math.random() * 100;

  const selected =
    random < blueGreenConfig.trafficGreenPercent
      ? blueGreenConfig.deploymentDomainGreen
      : blueGreenConfig.deploymentDomainBlue || process.env.VERCEL_URL;

  if (!selected) {
    console.error("Blue green configuration error", blueGreenConfig);
    // 기본값으로 현재 도메인 반환
    return process.env.VERCEL_URL || "";
  }

  if (/^http/.test(selected)) {
    return new URL(selected).hostname;
  }

  return selected;
}