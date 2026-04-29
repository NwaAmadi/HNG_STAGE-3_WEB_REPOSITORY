import { getCsrfTokenFromCookie } from "@/lib/cookies";
import { toBackendUrl } from "@/lib/public-config";

type ApiFetchOptions = RequestInit & {
  retryOnAuth?: boolean;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function refreshSession() {
  const response = await fetch(toBackendUrl("/api/auth/refresh"), {
    method: "POST",
    credentials: "include"
  });

  if (!response.ok) {
    throw new ApiError("Your session has expired. Please sign in again.", response.status);
  }

  return response;
}

export async function apiFetch<T = unknown>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { retryOnAuth = true, headers, method = "GET", ...rest } = options;
  const nextHeaders = new Headers(headers);
  const upperMethod = method.toUpperCase();
  const targetUrl = toBackendUrl(path);

  if (path.startsWith("/api/profiles")) {
    nextHeaders.set("X-API-Version", "1");
  }

  if (upperMethod === "POST" || upperMethod === "DELETE") {
    const csrfToken = getCsrfTokenFromCookie();
    if (csrfToken) {
      nextHeaders.set("X-CSRF-Token", csrfToken);
    }
  }

  const response = await fetch(targetUrl, {
    method: upperMethod,
    credentials: "include",
    headers: nextHeaders,
    ...rest
  });

  if (response.status === 401 && retryOnAuth && path !== "/api/auth/refresh") {
    await refreshSession();
    return apiFetch<T>(path, { ...options, retryOnAuth: false });
  }

  if (!response.ok) {
    let message = "Request failed.";

    try {
      const errorPayload = (await response.json()) as { message?: string };
      if (errorPayload.message) {
        message = errorPayload.message;
      }
    } catch {
      if (response.statusText) {
        message = response.statusText;
      }
    }

    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }

  return (await response.text()) as T;
}
