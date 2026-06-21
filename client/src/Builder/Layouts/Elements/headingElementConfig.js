/** ค่าเริ่มต้น Heading element — ผสานกับข้อมูลเก่าที่ยังไม่มีฟิลด์ใหม่ */
export const HEADING_ELEMENT_DEFAULTS = {
  label: "Design your own unique",
  headingFontSize: 28,
  headingBold: true,
  headingAlign: "left",
  headingColor: { type: "mainColor", index: 0 },
  headingColorOpacity: 255,
  headingTextGradient: false,
  headingColor2: { type: "mainColor", index: 1 },
  headingColor2Opacity: 255,
  headingGradientDegrees: 90,
  headingMarginTop: 8,
  headingMarginBottom: 8,
  headingLetterSpacing: 0,
  headingLineHeight: 1.35,
  headingDividerEnabled: false,
  /** ตำแหน่งเส้นคั่น: ซ้าย | สองข้าง | ขวา | ล่าง */
  headingDividerPosition: "bottom",
  /** solid | dashed | dotted */
  headingDividerStyle: "solid",
  headingDividerWidth: 2,
  headingDividerColor: { type: "mainColor", index: 0 },
  headingDividerOpacity: 255,
  /** ระยะห่างข้อความกับเส้น (px) */
  headingDividerGap: 8,
  /** ความกว้างเส้น (%) — UI ปุ่ม กว้าง≈100 / แคบ≈34; ล่าง=ความกว้างเส้นใต้; ข้าง=เพดานขาเส้น */
  headingDividerSpanPercent: 100,
};

/** ปุ่มความกว้างเส้นคั่น — เก็บเป็น % ใน headingDividerSpanPercent */
export const HEADING_DIVIDER_SPAN_WIDE = 100;
export const HEADING_DIVIDER_SPAN_NARROW = 34;
/** ค่า ≥ นี้ถือว่าโหมด “กว้าง” (เส้นเต็มความกว้างคอลัมน์) */
export const HEADING_DIVIDER_SPAN_WIDE_THRESHOLD = 68;

export function mergeHeadingElement(data) {
  if (!data || typeof data !== "object") {
    return { ...HEADING_ELEMENT_DEFAULTS, type: "heading" };
  }
  return {
    ...HEADING_ELEMENT_DEFAULTS,
    ...data,
    type: data.type ?? "heading",
    id: data.id,
  };
}
