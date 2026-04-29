import { NextRequest, NextResponse } from "next/server";
import { getBackendBaseUrl } from "@/lib/config";

async function proxyRequest(request: NextRequest, path: string[]) {
  const backendBaseUrl = getBackendBaseUrl();
  const targetUrl = new URL(`${backendBaseUrl}/api/${path.join("/")}`);
  targetUrl.search = request.nextUrl.search;
  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.arrayBuffer();

  const headers = new Headers(request.headers);
  headers.set("host", targetUrl.host);
  headers.delete("content-length");

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
