export function stableKey(item: any, index: number): string {
  try {
    if (item == null) return `i-${index}`;
    if (typeof item === "string" || typeof item === "number") {
      const s = String(item).slice(0, 40);
      return `${s}-${index}`;
    }
    if (typeof item === "object") {
      return (
        (item.id as string) ||
        (item.key as string) ||
        (item.slug as string) ||
        (item.title as string) ||
        (item.name as string) ||
        (item.label as string) ||
        (item.path as string) ||
        (item.href as string) ||
        `i-${index}`
      );
    }
    return `i-${index}`;
  } catch (e) {
    return `i-${index}`;
  }
}
