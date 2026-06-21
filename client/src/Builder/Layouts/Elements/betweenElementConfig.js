export const BETWEEN_ELEMENT_DEFAULTS = {
  type: "btw",
  id: "Btw-",
  betweenTextMode: "both",
  betweenLeftText: "Bangkok",
  betweenRightText: "Japan",
  betweenFrameEnabled: false,
  betweenFrameColor: "#d4d4d8",
  betweenFrameColorOpacity: 255,
  betweenGlass: 55,
  betweenInsetX: 10,
  betweenInsetY: 8,
  betweenFontSize: 15,
  betweenBold: false,
  betweenLineStyle: "dashed",
  betweenLineColor: { type: "textColor", index: 0 },
  betweenLineOpacity: 255,
  betweenLineWidth: 1,
  betweenLineGap: 8,
  betweenRadius: 18,
  betweenIcon: { name: "faStar", type: "fas" },
  betweenIconSize: 18,
  betweenIconColor: "#ffffff",
  betweenIconColorOpacity: 255,
  betweenIconBgColor: "#000000",
  betweenIconBgOpacity: 255,
  betweenIconCircleSize: 36,
  betweenIconShape: "circle",
  betweenIconCornerRadius: 12,
  betweenMarginTop: 8,
  betweenMarginBottom: 8,
  preview: { label: "Between", icon: "horizontal_rule" },
};

const LINE_STYLES = new Set(["solid", "dashed", "dotted"]);
const ICON_TYPES = new Set(["fas", "fab", "far"]);
const TEXT_MODES = new Set(["none", "left", "right", "both"]);
const ICON_SHAPES = new Set(["circle", "rounded"]);

const clamp = (v, min, max, fallback) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
};

export function mergeBetweenElement(data) {
  if (!data || typeof data !== "object") {
    return { ...BETWEEN_ELEMENT_DEFAULTS, type: "btw" };
  }

  const merged = { ...BETWEEN_ELEMENT_DEFAULTS, ...data, type: "btw" };
  const icon = data.betweenIcon && typeof data.betweenIcon === "object" ? data.betweenIcon : {};
  const iconType = typeof icon.type === "string" && ICON_TYPES.has(icon.type) ? icon.type : "fas";

  return {
    ...merged,
    id: data.id,
    betweenTextMode: TEXT_MODES.has(merged.betweenTextMode) ? merged.betweenTextMode : "both",
    betweenLeftText:
      typeof merged.betweenLeftText === "string"
        ? merged.betweenLeftText
        : BETWEEN_ELEMENT_DEFAULTS.betweenLeftText,
    betweenRightText:
      typeof merged.betweenRightText === "string"
        ? merged.betweenRightText
        : BETWEEN_ELEMENT_DEFAULTS.betweenRightText,
    betweenFrameEnabled: merged.betweenFrameEnabled === true,
    betweenFrameColor:
      merged.betweenFrameColor ??
      merged.betweenTextColor ??
      BETWEEN_ELEMENT_DEFAULTS.betweenFrameColor,
    betweenFrameColorOpacity: clamp(
      merged.betweenFrameColorOpacity ?? merged.betweenTextColorOpacity,
      0,
      255,
      BETWEEN_ELEMENT_DEFAULTS.betweenFrameColorOpacity
    ),
    betweenGlass: clamp(merged.betweenGlass, 0, 100, BETWEEN_ELEMENT_DEFAULTS.betweenGlass),
    betweenInsetX: clamp(merged.betweenInsetX, 0, 24, BETWEEN_ELEMENT_DEFAULTS.betweenInsetX),
    betweenInsetY: clamp(merged.betweenInsetY, 0, 16, BETWEEN_ELEMENT_DEFAULTS.betweenInsetY),
    betweenFontSize: clamp(merged.betweenFontSize, 12, 96, BETWEEN_ELEMENT_DEFAULTS.betweenFontSize),
    betweenLineWidth: clamp(merged.betweenLineWidth, 1, 12, BETWEEN_ELEMENT_DEFAULTS.betweenLineWidth),
    betweenLineGap: clamp(merged.betweenLineGap, 0, 40, BETWEEN_ELEMENT_DEFAULTS.betweenLineGap),
    betweenRadius: clamp(merged.betweenRadius, 0, 64, BETWEEN_ELEMENT_DEFAULTS.betweenRadius),
    betweenIconSize: clamp(merged.betweenIconSize, 10, 64, BETWEEN_ELEMENT_DEFAULTS.betweenIconSize),
    betweenIconCircleSize: clamp(
      merged.betweenIconCircleSize,
      28,
      180,
      BETWEEN_ELEMENT_DEFAULTS.betweenIconCircleSize
    ),
    betweenIconShape: ICON_SHAPES.has(merged.betweenIconShape)
      ? merged.betweenIconShape
      : BETWEEN_ELEMENT_DEFAULTS.betweenIconShape,
    betweenIconCornerRadius: clamp(
      merged.betweenIconCornerRadius,
      0,
      48,
      BETWEEN_ELEMENT_DEFAULTS.betweenIconCornerRadius
    ),
    betweenMarginTop: clamp(merged.betweenMarginTop, 0, 80, BETWEEN_ELEMENT_DEFAULTS.betweenMarginTop),
    betweenMarginBottom: clamp(
      merged.betweenMarginBottom,
      0,
      80,
      BETWEEN_ELEMENT_DEFAULTS.betweenMarginBottom
    ),
    betweenBold: merged.betweenBold === true,
    betweenLineStyle: LINE_STYLES.has(merged.betweenLineStyle) ? merged.betweenLineStyle : "dashed",
    betweenIcon: {
      name: typeof icon.name === "string" && icon.name.trim() ? icon.name.trim() : "faStar",
      type: iconType,
    },
  };
}
