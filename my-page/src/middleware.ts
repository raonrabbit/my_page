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
  // 개발 환경에서는 블루-그린 비활성화
  if (process.env.NODE_ENV !== "production") {
    return NextResponse.next();
  }

  // GET 요청이면서 HTML 문서 요청만 처리
  if (req.method !== "GET") {
    return NextResponse.next();
  }
  if (req.headers.get("sec-fetch-dest") !== "document") {
    return NextResponse.next();
  }

  // Vercel 배포 시스템의 요청은 스킵
  if (/vercel/i.test(req.headers.get("user-agent") || "")) {
    return NextResponse.next();
  }

  // 이미 미들웨어가 실행됐다면 스킵
  if (req.headers.get("x-deployment-override")) {
    return getDeploymentWithCookieBasedOnEnvVar();
  }

  if (!process.env.EDGE_CONFIG) {
    console.warn("EDGE_CONFIG env variable not set. Skipping blue-green.");
    return NextResponse.next();
  }

  // Edge Config에서 블루-그린 설정 가져오기
  const blueGreenConfig = await get<BlueGreenConfig>(
    "blue-green-configuration"
  );

  if (!blueGreenConfig) {
    console.warn("No blue-green configuration found");
    return NextResponse.next();
  }

  const servingDeploymentDomain = process.env.VERCEL_URL;
  const selectedDeploymentDomain =
    selectBlueGreenDeploymentDomain(blueGreenConfig);

  if (!selectedDeploymentDomain) {
    return NextResponse.next();
  }

  // 선택된 배포가 현재 배포와 같으면 쿠키만 설정
  if (servingDeploymentDomain === selectedDeploymentDomain) {
    return getDeploymentWithCookieBasedOnEnvVar();
  }

  // 다른 배포로 프록시
  const headers = new Headers(req.headers);
  headers.set("x-deployment-override", selectedDeploymentDomain);
  headers.set(
    "x-vercel-protection-bypass",
    process.env.VERCEL_AUTOMATION_BYPASS_SECRET || "unknown"
  );

  const url = new URL(req.url);
  url.hostname = selectedDeploymentDomain;

  return fetch(url, {
    headers,
    redirect: "manual",
  });
}

// 랜덤으로 Blue 또는 Green 선택
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

function getDeploymentWithCookieBasedOnEnvVar() {
  const response = NextResponse.next();
  // 클라이언트 사이드 네비게이션에서도 같은 배포를 유지하기 위한 쿠키
  response.cookies.set("__vdpl", process.env.VERCEL_DEPLOYMENT_ID || "", {
    sameSite: "strict",
    httpOnly: true,
    maxAge: 60 * 60 * 24, // 24시간
  });
  return response;
}
