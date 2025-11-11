import { get } from "@vercel/edge-config";
import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/((?!api|favicon.ico).*)"], // _next 제외하지 않음!
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

  // 🔥 핵심: 쿠키 확인 (HTML이든 정적 파일이든)
  const deploymentCookie = req.cookies.get("__bg_deployment");
  let selectedDomain: string | null = null;

  const url = new URL(req.url);
  const isDocument = req.headers.get("sec-fetch-dest") === "document";
  
  // RSC, Prefetch는 제외
  if (url.searchParams.has("_rsc") || req.headers.get("purpose") === "prefetch") {
    return NextResponse.next();
  }

  if (deploymentCookie?.value) {
    // 쿠키 있음 - HTML이든 정적 파일이든 같은 배포 사용
    selectedDomain = deploymentCookie.value;
  } else if (isDocument) {
    // 쿠키 없고 HTML 문서 요청 - 새로 선택
    selectedDomain = selectBlueGreenDeploymentDomain(blueGreenConfig);
  } else {
    // 쿠키 없고 정적 파일 요청 - 현재 배포 사용
    return NextResponse.next();
  }

  const servingDomain = process.env.VERCEL_URL;

  if (!selectedDomain || servingDomain === selectedDomain) {
    const response = NextResponse.next();
    if (servingDomain && isDocument) {
      response.cookies.set("__bg_deployment", servingDomain, {
        sameSite: "strict",
        httpOnly: true,
        maxAge: 60 * 60 * 24,
        path: "/",
      });
    }
    return response;
  }

  // 다른 배포로 프록시 (HTML + 정적 파일 모두)
  const headers = new Headers(req.headers);
  headers.set("x-deployment-override", selectedDomain);
  headers.set(
    "x-vercel-protection-bypass",
    process.env.VERCEL_AUTOMATION_BYPASS_SECRET || "unknown"
  );

  const proxyUrl = new URL(req.url);
  proxyUrl.hostname = selectedDomain;

  try {
    const proxyResponse = await fetch(proxyUrl, {
      headers,
      redirect: "manual",
    });

    const response = new NextResponse(proxyResponse.body, {
      status: proxyResponse.status,
      statusText: proxyResponse.statusText,
      headers: proxyResponse.headers,
    });

    // HTML 요청일 때만 쿠키 설정
    if (isDocument) {
      response.cookies.set("__bg_deployment", selectedDomain, {
        sameSite: "strict",
        httpOnly: true,
        maxAge: 60 * 60 * 24,
        path: "/",
      });
    }

    return response;
  } catch (error) {
    console.error("Proxy fetch failed:", error);
    return NextResponse.next();
  }
}

function selectBlueGreenDeploymentDomain(
  blueGreenConfig: BlueGreenConfig
): string | null {
  const random = Math.random() * 100;

  const selected =
    random < blueGreenConfig.trafficGreenPercent
      ? blueGreenConfig.deploymentDomainGreen
      : blueGreenConfig.deploymentDomainBlue;

  if (!selected) {
    console.error("Blue green configuration error", blueGreenConfig);
    return null;
  }

  if (/^https?:\/\//.test(selected)) {
    try {
      return new URL(selected).hostname;
    } catch (error) {
      console.error("Invalid URL in config:", selected);
      return null;
    }
  }

  return selected;
}