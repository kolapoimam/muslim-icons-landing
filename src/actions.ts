import { trackEvent } from "./analytics";
import { getSvg } from "./IconArt";
import type { IconRecord } from "./registry";
export async function copyText(text: string) {
  if (!navigator.clipboard?.writeText)
    throw new Error(
      "Clipboard unavailable. Select and copy the code manually.",
    );
  await navigator.clipboard.writeText(text);
}
export function downloadSvg(icon: IconRecord, color: string, size: number) {
  const source = getSvg(icon);
  if (!source)
    throw new Error("This SVG is unavailable. Please try another icon.");
  const svg = source
    .replace(
      /<svg\b([^>]*)>/,
      (_, attrs: string) =>
        `<svg${attrs.replace(/\s(?:width|height)="[^"]*"/g, "")} width="${size}" height="${size}">`,
    )
    .replaceAll("currentColor", color);
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.download = `${icon.name}.svg`;
  document.body.append(link);
  link.click();
  trackEvent("download_svg", {
    icon_name: icon.name,
    icon_category: icon.category,
    icon_size: size,
    icon_color: color,
    available_in_package: icon.availableInPackage,
  });
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
