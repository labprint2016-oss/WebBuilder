import { setColor } from "../../../../function";

export const COUNTER_ELEMENT_DEFAULTS = {
  type: "ctn",
  counterStartValue: 0,
  counterTargetValue: 500,
  counterDurationMs: 800,
  counterTrigger: "viewport",
  counterDirection: "up",
  counterFontSize: 42,
  counterBold: true,
  counterAlign: "left",
  counterColor: "#333333",
  counterColorOpacity: 255,
  counterMarginTop: 8,
  counterMarginBottom: 8,
  counterCompositionEnabled: false,
  counterCompositionLeft: "",
  counterCompositionRight: "",
  counterCompositionFontSize: 18,
  counterCompositionColor: { type: "textColor", index: 0 },
  counterCompositionColorOpacity: 255,
  /** ระยะห่างระหว่าง counter ในแถวเดียวกัน (px) */
  counterRowGap: 8,
  /** แสดงเส้นคั่นระหว่าง counter ในแถวเดียวกัน */
  counterRowDividerEnabled: false,
  /** สีเส้นคั่นระหว่าง counter */
  counterRowDividerColor: { type: "textColor", index: 0 },
  /** ความทึบสีเส้นคั่น (0-255) */
  counterRowDividerOpacity: 255,
  /** รูปแบบเส้นคั่น: solid | dashed | dotted */
  counterRowDividerStyle: "solid",
  /**
   * สไลด์ «ระยะห่างบนล่าง» เก็บ 0–64 แมปเป็น translateY ของข้อความประกอบ: (ค่า - 32) px
   * ค่า 32 = กลาง, ต่ำกว่าเลื่อนขึ้น, สูงกว่าเลื่อนลง
   */
  counterCompositionGapPx: 32,
};

export function mergeCounterElement(data) {
  if (!data || typeof data !== "object") {
    return { ...COUNTER_ELEMENT_DEFAULTS, type: "ctn" };
  }
  return {
    ...COUNTER_ELEMENT_DEFAULTS,
    ...data,
    type: data.type ?? "ctn",
    id: data.id,
  };
}

function escapeAttrSelector(id) {
  const raw = String(id ?? "");
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(raw);
  }
  return raw.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function queryCounterPreviewNodes(elementId, attr) {
  const id = String(elementId ?? "");
  if (!id || typeof document === "undefined") return [];
  return Array.from(
    document.querySelectorAll(`[${attr}="${escapeAttrSelector(id)}"]`)
  );
}

/** Live-drag preview on canvas DOM — avoids React re-render every tick. */
export function applyCounterCanvasPreview(elementId, nextData, theme) {
  const id = String(elementId ?? "");
  if (!id) return;
  const merged = mergeCounterElement(nextData);
  const fontSize = Math.min(
    120,
    Math.max(12, Number(merged.counterFontSize) || 42)
  );
  const compositionFontSize = Math.min(
    120,
    Math.max(10, Number(merged.counterCompositionFontSize) || 18)
  );
  const compositionColor = setColor(
    theme,
    merged.counterCompositionColor,
    merged.counterCompositionColorOpacity ?? 255
  );

  queryCounterPreviewNodes(id, "data-counter-number-id").forEach((node) => {
    node.style.fontSize = `${fontSize}px`;
  });
  queryCounterPreviewNodes(id, "data-counter-composition-id").forEach((node) => {
    node.style.fontSize = `${compositionFontSize}px`;
    node.style.color = compositionColor;
  });
}

export function clearCounterCanvasPreview(elementId) {
  const id = String(elementId ?? "");
  if (!id) return;
  queryCounterPreviewNodes(id, "data-counter-number-id").forEach((node) => {
    node.style.removeProperty("font-size");
  });
  queryCounterPreviewNodes(id, "data-counter-composition-id").forEach((node) => {
    node.style.removeProperty("font-size");
    node.style.removeProperty("color");
  });
}
