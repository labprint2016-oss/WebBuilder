export const DIVIDER_ELEMENT_DEFAULTS = {
  type: "divider",
  id: "divi-",
  dividerStyle: "dashed",
  dividerColor: "#d8d8d8",
  dividerOpacity: 255,
  dividerWeight: 1,
  dividerMarginTop: 8,
  dividerMarginBottom: 8,
  preview: { label: "Divider", icon: "insert_page_break" },
};

export const DIVIDER_STYLE_OPTIONS = [
  { value: "solid", label: "เส้นตรง" },
  { value: "dotted", label: "จุด" },
  { value: "dashed", label: "ประ" },
];

export function mergeDividerElement(data) {
  const base = data && typeof data === "object" ? data : {};
  const merged = { ...DIVIDER_ELEMENT_DEFAULTS, ...base, type: "divider" };
  const style = ["solid", "dotted", "dashed"].includes(merged.dividerStyle)
    ? merged.dividerStyle
    : DIVIDER_ELEMENT_DEFAULTS.dividerStyle;
  const opacityRaw = Number(merged.dividerOpacity);
  const marginTopRaw = Number(merged.dividerMarginTop);
  const marginBottomRaw = Number(merged.dividerMarginBottom);
  const weightRaw = Number(merged.dividerWeight);
  return {
    ...merged,
    dividerStyle: style,
    dividerOpacity: Number.isFinite(opacityRaw)
      ? Math.max(0, Math.min(255, Math.round(opacityRaw)))
      : DIVIDER_ELEMENT_DEFAULTS.dividerOpacity,
    dividerWeight: Number.isFinite(weightRaw)
      ? Math.max(0.1, Math.min(12, Math.round(weightRaw * 10) / 10))
      : DIVIDER_ELEMENT_DEFAULTS.dividerWeight,
    dividerMarginTop: Number.isFinite(marginTopRaw)
      ? Math.max(0, Math.min(80, Math.round(marginTopRaw)))
      : DIVIDER_ELEMENT_DEFAULTS.dividerMarginTop,
    dividerMarginBottom: Number.isFinite(marginBottomRaw)
      ? Math.max(0, Math.min(80, Math.round(marginBottomRaw)))
      : DIVIDER_ELEMENT_DEFAULTS.dividerMarginBottom,
  };
}
