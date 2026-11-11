export function customizeSvg(
  svg: string,
  options: { strokeWidth?: number; size?: number; color?: string },
) {
  const output = svg.replace(/<svg\b([^>]*)>/, (_, attributes: string) => {
    let attrs = attributes;
    if (options.strokeWidth !== undefined)
      attrs =
        attrs.replace(/\s+stroke-width="[^"]*"/g, "") +
        ` stroke-width="${options.strokeWidth}"`;
    if (options.size !== undefined)
      attrs =
        attrs.replace(/\s+(?:width|height)="[^"]*"/g, "") +
        ` width="${options.size}" height="${options.size}"`;
    return `<svg${attrs}>`;
  });
  return options.color
    ? output.replaceAll("currentColor", options.color)
    : output;
}
export function withStrokeWidth(svg: string, strokeWidth?: number) {
  return strokeWidth === undefined ? svg : customizeSvg(svg, { strokeWidth });
}
