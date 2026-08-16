export function segmentInlineStyle(style) {
  const source = style && typeof style === "object" ? style : {};
  const inlineStyle = {};
  if (source.color) inlineStyle.color = source.color;
  if (source.fontSize) inlineStyle.fontSize = source.fontSize;
  if (source.lineHeight) inlineStyle.lineHeight = source.lineHeight;
  if (source.letterSpacing) inlineStyle.letterSpacing = source.letterSpacing;
  return Object.keys(inlineStyle).length ? inlineStyle : undefined;
}
