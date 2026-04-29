function normalizePublicUrl(value: string) {
  const normalizedValue =
    value.startsWith("http://") || value.startsWith("https://")
      ? value
      : `https://${value}`;

  try {
    return new URL(normalizedValue).toString().replace(/\/+$/, "");
  } catch {
    return "";
  }
}

export function getPublicBackendBaseUrl() {
  const value = process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL;

  if (!value) {
    return "";
  }

  return normalizePublicUrl(value);
}

export function toBackendUrl(path: string) {
  const baseUrl = getPublicBackendBaseUrl();

  if (!baseUrl || !path.startsWith("/")) {
    return path;
  }

  return `${baseUrl}${path}`;
}
