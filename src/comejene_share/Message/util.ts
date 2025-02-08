import type { ComejeneContentStyle } from "./ContentStyle";

export function paddingToCss(padding: ComejeneContentStyle["padding"]): string {
  return [padding.top, padding.right, padding.bottom, padding.left]
    .map(p => `${p}px`)
    .join(" ");
}
