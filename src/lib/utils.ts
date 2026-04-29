export function cleanObject(input: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== "" && value !== "undefined")
  );
}

export function buildQueryString(input: Record<string, string>) {
  return new URLSearchParams(cleanObject(input)).toString();
}

export function getPositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.floor(parsed);
}
