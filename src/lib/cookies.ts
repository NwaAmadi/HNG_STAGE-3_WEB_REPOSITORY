export function getCsrfTokenFromCookie() {
  if (typeof document === "undefined") {
    return "";
  }

  const token = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith("insighta_csrf_token="))
    ?.split("=")[1];

  return token ? decodeURIComponent(token) : "";
}
