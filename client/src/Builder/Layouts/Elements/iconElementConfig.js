import { normalizeButtonLayoutAlign } from "./buttonElementConfig";
import {
  resolveThemeOrHexColor,
  applyOpacityToCssColor,
} from "./imageAspectConfig";

/** กรอบไอคอน element แบบ icon (ไม่ใช่ list) — Panel: 20–31 เพิ่มจากเดิม, 32–160 เหมือนเดิม */
export const ICON_STANDALONE_CONTAINER_MIN = 20;
export const ICON_STANDALONE_CONTAINER_MAX = 160;

export const ICON_ELEMENT_DEFAULTS = {
  faIcon: { name: "faStar", type: "fas" },
  backgroundColor: "#333333",
  backgroundOpacity: 255,
  iconColor: "#ffffff",
  iconOpacity: 255,
  iconSize: 28,
  containerSize: 64,
  /** "circle" | "rounded" */
  iconShape: "circle",
  iconCornerRadius: 12,
  borderColor: { type: "textColor", index: 0 },
  borderOpacity: 255,
  borderEnabled: true,
  /** 0 = ไม่มีกรอบ, สูงสุด 6px */
  borderWidth: 0,
  /** "solid" | "dotted" | "dashed" */
  borderStyle: "solid",
  /** "outside" | "center" | "inside" — ตำแหน่งเส้นกรอบเทียบกล่องพื้นหลัง */
  borderPosition: "outside",
  /** จัดไอคอนในแนวนอนของคอลัมน์ — เหมือนปุ่ม: start | center | end */
  iconLayoutAlign: "start",
  /** ระยะบน/ล่าง (px) — ค่าเริ่มต้นแผง iCons */
  iconMarginTop: 8,
  iconMarginBottom: 8,
  /** ระยะห่างระหว่างไอคอนในแถวเดียวกัน (px) */
  iconRowGap: 8,
  /** แสดงเส้นคั่นระหว่างไอคอนในแถวเดียวกัน */
  iconRowDividerEnabled: false,
  /** รูปแบบเส้นคั่น: solid | dashed | dotted */
  iconRowDividerStyle: "solid",
  /** สีเส้นคั่นระหว่างไอคอน */
  iconRowDividerColor: { type: "textColor", index: 0 },
  /** ความทึบสีเส้นคั่น (0-255) */
  iconRowDividerOpacity: 255,
  linkEnabled: false,
  linkUrl: "",
  linkTarget: "_self",
};

function numOr(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function mergeIconElement(elementData) {
  return {
    ...ICON_ELEMENT_DEFAULTS,
    ...(elementData && typeof elementData === "object"
      ? Object.fromEntries(
          Object.entries(elementData).filter(([, v]) => v !== undefined)
        )
      : {}),
  };
}

/** ตรวจว่ามีไอคอน FA ใช้งานได้จริง */
export function isValidFaIconRef(faIcon) {
  if (!faIcon || typeof faIcon !== "object") return false;
  const { name, type } = faIcon;
  if (typeof name !== "string" || typeof type !== "string" || !name || !type)
    return false;
  return type === "fas" || type === "fab" || type === "far";
}

export function resolveIconBackgroundCss(elementData, theme) {
  const s = mergeIconElement(elementData);
  const raw = resolveThemeOrHexColor(s.backgroundColor, theme);
  const op = numOr(s.backgroundOpacity, ICON_ELEMENT_DEFAULTS.backgroundOpacity);
  const o = Math.max(0, Math.min(255, op));
  if (raw == null) return theme?.mainColor?.[0] ?? "#374151";
  return applyOpacityToCssColor(raw, o);
}

export function resolveIconGlyphColor(elementData, theme) {
  const s = mergeIconElement(elementData);
  const raw = resolveThemeOrHexColor(s.iconColor, theme);
  const op = numOr(s.iconOpacity, ICON_ELEMENT_DEFAULTS.iconOpacity);
  const o = Math.max(0, Math.min(255, op));
  if (raw == null) return "#ffffff";
  return applyOpacityToCssColor(raw, o);
}

export function resolveIconBorderCss(elementData, theme) {
  const s = mergeIconElement(elementData);
  const raw = resolveThemeOrHexColor(s.borderColor, theme);
  const op = numOr(s.borderOpacity, ICON_ELEMENT_DEFAULTS.borderOpacity);
  const o = Math.max(0, Math.min(255, op));
  if (raw == null) return "#94a3b8";
  return applyOpacityToCssColor(raw, o);
}

export function normalizeIconBorderStyle(value) {
  const v = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (v === "dotted" || v === "dashed") return v;
  return "solid";
}

export function normalizeIconBorderPosition(value) {
  const v = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (v === "center" || v === "inside") return v;
  return "outside";
}

/** กล่องครอบไอคอนบนแคนวาส — กว้างเต็มคอลัมน์แล้วจัดซ้าย/กลาง/ขวา */
export function getIconOuterContainerSx(elementData) {
  const s = mergeIconElement(elementData);
  const a = normalizeButtonLayoutAlign(s.iconLayoutAlign);
  const jc =
    a === "start" ? "flex-start" : a === "end" ? "flex-end" : "center";
  return {
    width: "100%",
    display: "flex",
    justifyContent: jc,
    alignItems: "center",
    flexWrap: "nowrap",
  };
}
