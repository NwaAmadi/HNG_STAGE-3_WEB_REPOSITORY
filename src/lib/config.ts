export function getBackendBaseUrl() {
  const value = process.env.BACKEND_API_BASE_URL;

  if (!value) {
    throw new Error("BACKEND_API_BASE_URL is not set.");
  }

  return value.replace(/\/+$/, "");
}
