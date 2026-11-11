import type { CSSProperties } from "react";
import type { IconRecord } from "./registry";
const files = import.meta.glob("/public/icons/*.svg", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;
export function getSvg(icon: IconRecord) {
  return files["/public" + icon.svgPath];
}
export function IconArt({
  icon,
  size = 32,
  color = "currentColor",
}: {
  icon: IconRecord;
  size?: number;
  color?: string;
}) {
  const svg = getSvg(icon);
  return (
    <span
      className="icon-art"
      aria-hidden="true"
      style={{ width: size, height: size, color } as CSSProperties}
      dangerouslySetInnerHTML={{ __html: svg ?? "" }}
    />
  );
}
