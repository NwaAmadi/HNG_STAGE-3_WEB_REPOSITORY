import { NextRequest, NextResponse } from "next/server";
import { getBackendBaseUrl } from "@/lib/config";

function rewriteOAuthLocation(location: string, request: NextRequest) {
  const portalOrigin = request.nextUrl.origin;

  try {
    const url = new URL(location);

    if (url.hostname === "github.com" && url.pathname === "/login/oauth/authorize") {
      const backendBaseUrl = getBackendBaseUrl();
      const backendCallback = new URL("/auth/github/callback", backendBaseUrl).toString();
      const portalCallback = new URL("/auth/github/callback", portalOrigin).toString();

      if (url.searchParams.get("redirect_uri") === backendCallback) {
        url.searchParams.set("redirect_uri", portalCallback);
      }
    }

    const backendOrigin = new URL(getBackendBaseUrl()).origin;
    if (url.origin === backendOrigin) {
      return location.replace(backendOrigin, portalOrigin);
    }

    return url.toString();
  } catch {
    return location;
  }
}

async function proxyRequest(request: NextRequest, path: string[]) {
  const backendBaseUrl = getBackendBaseUrl();
  const targetUrl = new URL(`/auth/${path.join("/")}`, backendBaseUrl);
  targetUrl.search = request.nextUrl.search;
  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.arrayBuffer();

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");
  headers.set("x-forwarded-host", request.headers.get("host") ?? request.nextUrl.host);
  headers.set("x-forwarded-proto", request.nextUrl.protocol.replace(":", ""));
  headers.set(
    "x-forwarded-port",
    request.nextUrl.port || (request.nextUrl.protocol === "https:" ? "443" : "80")
  );

  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body,
    redirect: "manual"
  });

  const nextResponse = new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText
  });

  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === "content-encoding") {
      return;
    }

    if (key.toLowerCase() === "location") {
      nextResponse.headers.append(key, rewriteOAuthLocation(value, request));
      return;
    }

    nextResponse.headers.append(key, value);
  });

  return nextResponse;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}
