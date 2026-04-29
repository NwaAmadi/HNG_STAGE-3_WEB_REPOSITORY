export function getBackendBaseUrl() {
  const value = process.env.BACKEND_API_BASE_URL;

  if (!value) {
    throw new Error("BACKEND_API_BASE_URL is not set.");
  }

  const normalizedValue =
    value.startsWith("http://") || value.startsWith("https://")
      ? value
      : `https://${value}`;

  try {
    return new URL(normalizedValue).toString().replace(/\/+$/, "");
  } catch {
    throw new Error(
      "BACKEND_API_BASE_URL must be a valid URL such as https://your-backend.vercel.app"
    );
  }
}
