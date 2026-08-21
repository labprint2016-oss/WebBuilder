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

/** ระยะว่างระหว่างพื้นหลังไอคอนกับเส้นกรอบ (px) รอบด้าน */
export const ICON_BORDER_OUTSET_GAP_PX = 5;

/** รัศมีมุมสำหรับ fill / กรอบ นอก-ใน-กลาง — ใช้ทั้ง canvas และ live preview */
export function getIconShapeMetrics(elementData) {
  const s = mergeIconElement(elementData);
  const shape = s.iconShape === "rounded" ? "rounded" : "circle";
  const radiusPx = Math.max(
    0,
    numOr(s.iconCornerRadius, ICON_ELEMENT_DEFAULTS.iconCornerRadius)
  );
  const containerPx = Math.max(
    ICON_STANDALONE_CONTAINER_MIN,
    Math.min(
      ICON_STANDALONE_CONTAINER_MAX,
      numOr(s.containerSize, ICON_ELEMENT_DEFAULTS.containerSize)
    )
  );
  const borderWidthPx = Math.max(
    0,
    Math.min(6, numOr(s.borderWidth, ICON_ELEMENT_DEFAULTS.borderWidth))
  );
  const gap = ICON_BORDER_OUTSET_GAP_PX;
  const centerWrapSize = containerPx + borderWidthPx;
  const outsideWrapSize = containerPx + 2 * gap + 2 * borderWidthPx;
  if (shape === "circle") {
    return {
      shape,
      radiusPx,
      containerPx,
      borderWidthPx,
      gap,
      centerWrapSize,
      fillRadius: "50%",
      outerRadius: "50%",
      insetRadius: "50%",
      centerOuterRadius: "50%",
    };
  }
  return {
    shape,
    radiusPx,
    containerPx,
    borderWidthPx,
    gap,
    centerWrapSize,
    fillRadius: `${Math.min(radiusPx, containerPx / 2)}px`,
    outerRadius: `${Math.min(
      radiusPx + gap + borderWidthPx,
      outsideWrapSize / 2
    )}px`,
    insetRadius: `${Math.max(
      0,
      Math.min(radiusPx - gap, (containerPx - 2 * gap) / 2)
    )}px`,
    centerOuterRadius: `${Math.min(
      radiusPx + borderWidthPx / 2,
      centerWrapSize / 2
    )}px`,
  };
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

function escapeAttrSelector(id) {
  const raw = String(id ?? "");
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(raw);
  }
  return raw.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function queryIconPreviewNodes(elementId, attr) {
  const id = String(elementId ?? "");
  if (!id || typeof document === "undefined") return [];
  return Array.from(
    document.querySelectorAll(`[${attr}="${escapeAttrSelector(id)}"]`)
  );
}

/** Live-drag preview on canvas DOM — avoids React re-render every tick. */
export function applyIconCanvasPreview(elementId, nextData, theme) {
  const id = String(elementId ?? "");
  if (!id) return;
  const s = mergeIconElement(nextData);
  const isList = nextData?.type === "list";
  const mt = isList
    ? numOr(nextData?.listMarginTop, 0)
    : numOr(s.iconMarginTop, ICON_ELEMENT_DEFAULTS.iconMarginTop);
  const mb = isList
    ? numOr(nextData?.listMarginBottom, 0)
    : numOr(s.iconMarginBottom, ICON_ELEMENT_DEFAULTS.iconMarginBottom);
  const iconSize = numOr(s.iconSize, ICON_ELEMENT_DEFAULTS.iconSize);
  const metrics = getIconShapeMetrics(nextData);
  const container = metrics.containerPx;
  const radiusByKind = {
    fill: metrics.fillRadius,
    outer: metrics.outerRadius,
    inset: metrics.insetRadius,
    "center-outer": metrics.centerOuterRadius,
  };
  const borderEnabled = s.borderEnabled !== false;
  const fillCss = borderEnabled
    ? resolveIconBackgroundCss(nextData, theme)
    : "transparent";
  const glyphCss = resolveIconGlyphColor(nextData, theme);
  const borderCssColor = resolveIconBorderCss(nextData, theme);

  queryIconPreviewNodes(id, "data-icon-wrap-id").forEach((wrap) => {
    wrap.style.marginTop = `${mt}px`;
    wrap.style.marginBottom = `${mb}px`;
  });
  queryIconPreviewNodes(id, "data-icon-fill-id").forEach((box) => {
    box.style.width = `${container}px`;
    box.style.height = `${container}px`;
    box.style.minWidth = `${container}px`;
    box.style.minHeight = `${container}px`;
    box.style.borderRadius = metrics.fillRadius;
    box.style.backgroundColor = fillCss;
  });
  queryIconPreviewNodes(id, "data-icon-radius-id").forEach((node) => {
    const kind = node.getAttribute("data-icon-radius-kind") || "fill";
    node.style.borderRadius = radiusByKind[kind] || metrics.fillRadius;
    if (kind === "fill") node.style.backgroundColor = fillCss;
  });
  queryIconPreviewNodes(id, "data-icon-border-id").forEach((node) => {
    node.style.borderColor = borderCssColor;
  });
  queryIconPreviewNodes(id, "data-icon-glyph-id").forEach((node) => {
    node.style.width = `${iconSize}px`;
    node.style.height = `${iconSize}px`;
    node.style.fontSize = `${iconSize}px`;
    node.style.color = glyphCss;
    node.querySelectorAll("svg").forEach((svg) => {
      svg.style.color = glyphCss;
    });
  });
}

export function clearIconCanvasPreview(elementId) {
  const id = String(elementId ?? "");
  if (!id) return;
  queryIconPreviewNodes(id, "data-icon-wrap-id").forEach((wrap) => {
    wrap.style.removeProperty("margin-top");
    wrap.style.removeProperty("margin-bottom");
  });
  queryIconPreviewNodes(id, "data-icon-fill-id").forEach((box) => {
    box.style.removeProperty("width");
    box.style.removeProperty("height");
    box.style.removeProperty("min-width");
    box.style.removeProperty("min-height");
    box.style.removeProperty("border-radius");
    box.style.removeProperty("background-color");
  });
  queryIconPreviewNodes(id, "data-icon-radius-id").forEach((node) => {
    node.style.removeProperty("border-radius");
    node.style.removeProperty("background-color");
  });
  queryIconPreviewNodes(id, "data-icon-border-id").forEach((node) => {
    node.style.removeProperty("border-color");
  });
  queryIconPreviewNodes(id, "data-icon-glyph-id").forEach((node) => {
    node.style.removeProperty("width");
    node.style.removeProperty("height");
    node.style.removeProperty("font-size");
    node.style.removeProperty("color");
    node.querySelectorAll("svg").forEach((svg) => {
      svg.style.removeProperty("color");
    });
  });
}
