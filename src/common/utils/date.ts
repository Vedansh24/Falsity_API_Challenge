export function toIsoString(value: Date | string | number): string {
  return new Date(value).toISOString();
}
