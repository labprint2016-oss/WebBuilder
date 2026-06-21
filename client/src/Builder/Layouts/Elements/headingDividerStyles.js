import { setColor } from "../../../../function";
import {
  HEADING_DIVIDER_SPAN_WIDE_THRESHOLD,
  mergeHeadingElement,
} from "./headingElementConfig";

const DIVIDER_POSITIONS = new Set(["left", "both", "right", "bottom"]);

const DIVIDER_STYLES = new Set(["solid", "dashed", "dotted"]);

/** ค่าเก่าที่ไม่ใช้แล้ว → solid */
const LEGACY_DIVIDER_STYLE = {
  double: "solid",
  ridge: "solid",
  groove: "solid",
  inset: "solid",
};

function normalizeDividerStyle(raw) {
  const mapped = LEGACY_DIVIDER_STYLE[raw] ?? raw;
  const s = mapped || "solid";
  return DIVIDER_STYLES.has(s) ? s : "solid";
}

function dividerColor(theme, h) {
  return setColor(
    theme,
    h.headingDividerColor ?? { type: "mainColor", index: 0 },
    h.headingDividerOpacity ?? 255
  );
}

function lineStrokeStyle(w, style, c) {
  return {
    width: "100%",
    height: 0,
    borderBottomWidth: w,
    borderBottomStyle: style,
    borderBottomColor: c,
    boxSizing: "content-box",
  };
}

function isDividerSpanWide(spanPct) {
  const p = Math.min(100, Math.max(10, spanPct));
  return p >= HEADING_DIVIDER_SPAN_WIDE_THRESHOLD;
}

/** โหมดแคบ — จำกัดความกว้างขาเส้น; โหมดกว้าง → ไม่จำกัด (เต็มพื้นที่คอลัมน์ที่ flex ให้) */
function lineWrapperMaxWidth(pos, spanPct) {
  if (isDividerSpanWide(spanPct)) {
    return {};
  }
  const p = Math.min(100, Math.max(10, spanPct));
  if (pos === "both") {
    return { maxWidth: `${Math.min(49, Math.round(p / 2))}%` };
  }
  return { maxWidth: `${Math.min(92, p)}%` };
}

/** จัดข้อความในแถวเส้นสองข้าง (grid คอลัมน์กลาง) ให้สอดคล้องชิดซ้าย/กลาง/ขวา */
function textJustifySelfForGrid(textAlign) {
  if (textAlign === "right") return "end";
  if (textAlign === "center") return "center";
  return "start";
}

/**
 * เส้นใต้ — โหมดกว้าง: เต็มคอลัมน์ + margin ตามจัดหัวข้อ;
 * โหมดแคบ (shrinkToText): ความกว้างเท่าข้อความ อยู่ใน inline-block แล้วใช้ width 100% ของกล่องนั้น
 */
function underlineTrackStyleForBottom(
  textAlign,
  spanPct,
  gap,
  shrinkToText
) {
  if (shrinkToText) {
    return {
      width: "100%",
      marginTop: gap,
      marginLeft: 0,
      marginRight: 0,
      boxSizing: "border-box",
    };
  }
  const p = Math.min(100, Math.max(10, spanPct));
  const wide = isDividerSpanWide(p);
  const base = {
    width: wide ? "100%" : `${p}%`,
    marginTop: gap,
    boxSizing: "border-box",
  };
  if (textAlign === "right") {
    return { ...base, marginLeft: "auto", marginRight: 0 };
  }
  if (textAlign === "center") {
    return { ...base, marginLeft: "auto", marginRight: "auto" };
  }
  return { ...base, marginLeft: 0, marginRight: "auto" };
}

function buildBottomDividerSpec(textAlign, spanPct, gap, lineStroke) {
  const shrinkToText = !isDividerSpanWide(spanPct);
  return {
    variant: "bottom",
    textAlign,
    bottomOuterStyle: {
      width: "100%",
      boxSizing: "border-box",
      textAlign,
    },
    bottomInnerWrapStyle: shrinkToText
      ? {
          display: "inline-block",
          maxWidth: "100%",
          verticalAlign: "top",
        }
      : {
          width: "100%",
          display: "block",
          boxSizing: "border-box",
        },
    textBlockStyle: shrinkToText
      ? {
          display: "block",
          boxSizing: "border-box",
          textAlign,
        }
      : {
          width: "100%",
          display: "block",
          boxSizing: "border-box",
          textAlign,
        },
    underlineTrackStyle: underlineTrackStyleForBottom(
      textAlign,
      spanPct,
      gap,
      shrinkToText
    ),
    lineStroke,
  };
}

/**
 * แถบเส้นซ้ายของหัวข้อ: ชิดซ้าย = เส้นดึงจากขอบซ้าย; กลาง = กลุ่มเส้น+ข้อความอยู่กลาง; ชิดขวา = กลุ่มชิดขวาเส้นดึงไปทางซ้ายของข้อความ
 */
function flexJustifyForLeftBar(textAlign) {
  if (textAlign === "right") return "flex-end";
  if (textAlign === "center") return "center";
  return "flex-start";
}

/**
 * แถบเส้นขวาของหัวข้อ: ชิดขวา = เส้นดึงไปขอบขวา; กลาง = กลางแถว; ชิดซ้าย = กลุ่มชิดซ้าย
 */
function flexJustifyForRightBar(textAlign) {
  if (textAlign === "left") return "flex-start";
  if (textAlign === "center") return "center";
  return "flex-end";
}

/**
 * สำหรับเรนเดอร์ — bottom = ข้อความ + เส้นใต้ความกว้างตาม %;
 * sides = flex (ซ้าย/ขวา) หรือ grid (สองข้าง) + maxWidth ตาม %
 */
export function getHeadingDividerSpec(theme, elementData) {
  const h = mergeHeadingElement(elementData);
  if (!h.headingDividerEnabled) {
    return { variant: "none" };
  }

  const posRaw = h.headingDividerPosition || "bottom";
  const pos = DIVIDER_POSITIONS.has(posRaw) ? posRaw : "bottom";
  const w = Math.min(
    12,
    Math.max(1, Number(h.headingDividerWidth) || 2)
  );
  const style = normalizeDividerStyle(h.headingDividerStyle);
  const gap = Math.min(
    32,
    Math.max(0, Number(h.headingDividerGap) ?? 8)
  );
  const spanPct = Math.min(
    100,
    Math.max(10, Number(h.headingDividerSpanPercent) ?? 100)
  );
  const c = dividerColor(theme, h);
  const lineStroke = lineStrokeStyle(w, style, c);

  const textAlign = h.headingAlign || "left";

  const lineWrapperStyle = lineWrapperMaxWidth(pos, spanPct);

  if (pos === "bottom") {
    return buildBottomDividerSpec(textAlign, spanPct, gap, lineStroke);
  }

  const rowBase = {
    display: "flex",
    width: "100%",
    alignItems: "center",
    columnGap: gap,
    boxSizing: "border-box",
  };

  if (pos === "left") {
    return {
      variant: "sides",
      rowStyle: {
        ...rowBase,
        justifyContent: flexJustifyForLeftBar(textAlign),
      },
      lineStroke,
      lineWrapperStyle,
      showBefore: true,
      showAfter: false,
      textAlign,
    };
  }
  if (pos === "right") {
    return {
      variant: "sides",
      rowStyle: {
        ...rowBase,
        justifyContent: flexJustifyForRightBar(textAlign),
      },
      lineStroke,
      lineWrapperStyle,
      showBefore: false,
      showAfter: true,
      textAlign,
    };
  }
  if (pos === "both") {
    const barCap = lineWrapperMaxWidth("both", spanPct);
    return {
      variant: "sides-grid",
      gridStyle: {
        display: "grid",
        width: "100%",
        gridTemplateColumns: "1fr max-content 1fr",
        alignItems: "center",
        columnGap: gap,
        boxSizing: "border-box",
      },
      leftCellOuter: {
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        minWidth: 0,
      },
      rightCellOuter: {
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        minWidth: 0,
      },
      barInnerStyle: {
        width: "100%",
        ...barCap,
        display: "flex",
        alignItems: "center",
        boxSizing: "border-box",
      },
      midSpanStyle: {
        justifySelf: textJustifySelfForGrid(textAlign),
        minWidth: 0,
      },
      lineStroke,
      textAlign,
    };
  }

  return buildBottomDividerSpec(textAlign, spanPct, gap, lineStroke);
}
