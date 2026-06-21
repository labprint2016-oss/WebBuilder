import {
  IMAGE_CORNER_RADIUS_MAX_PX,
  applyOpacityToCssColor,
  imageCornerRadiusStyle,
  isImageAspectOneToOne,
  mergeImageBadge,
  normalizeImageCornerRadius,
  resolveThemeOrHexColor,
} from "./imageAspectConfig";

/* ห่างจากขอบรูป 20px ทุกมุม */
const POSITION_CLASS = {
  tl: "left-[20px] top-[20px]",
  tr: "right-[20px] top-[20px]",
  bl: "left-[20px] bottom-[20px]",
  br: "right-[20px] bottom-[20px]",
  tc: "left-1/2 top-[20px] -translate-x-1/2",
  bc: "left-1/2 bottom-[20px] -translate-x-1/2",
  /* กึ่งกลางภาพ — max-w ยังคุมไม่ให้ล้นขอบซ้ายขวา */
  cc: "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
};

const POSITION_CLASS_EDGE_8 = {
  tl: "left-[20px] top-[20px]",
  tr: "right-[20px] top-[20px]",
  bl: "left-[20px] bottom-[20px]",
  br: "right-[20px] bottom-[20px]",
  tc: "left-1/2 top-[20px] -translate-x-1/2",
  bc: "left-1/2 bottom-[20px] -translate-x-1/2",
};

const SIZE_CLASS = {
  "11": "gap-1 text-[11px] px-2 py-0.5",
  "12": "gap-1 text-[12px] px-2.5 py-1",
  "13": "gap-1 text-[13px] px-2.5 py-1",
  "14": "gap-1 text-[14px] px-2.5 py-1",
  "15": "gap-1 text-[15px] px-3 py-1.5",
  "16": "gap-1 text-[16px] px-3 py-1.5",
  "18": "gap-1 text-[18px] px-3.5 py-2",
  "20": "gap-1 text-[20px] px-4 py-2",
};

/** ขนาดตัวอักษรอย่างเดียว — ใช้กับ Lightbox square เต็มความกว้าง + padding ข้อความแยกจาก SIZE_CLASS */
const SIZE_TEXT_ONLY = {
  "11": "text-[11px]",
  "12": "text-[12px]",
  "13": "text-[13px]",
  "14": "text-[14px]",
  "15": "text-[15px]",
  "16": "text-[16px]",
  "18": "text-[18px]",
  "20": "text-[20px]",
};

const VARIANT_CLASS = {
  pill: "rounded-full",
  soft: "rounded-lg",
  square: "rounded-none",
  circle:
    "inline-flex aspect-square max-h-[5.5rem] max-w-[5.5rem] min-h-9 min-w-9 items-center justify-center overflow-hidden rounded-full px-1.5 py-1.5",
};

const TEXT_ALIGN_CLASS = {
  start: "justify-start text-left",
  center: "justify-center text-center",
};

/**
 * Badge ซ้อนบนรูป — ควบคุมจาก Panel (element.badge)
 * theme — สีอ้างอิง `{ type, index }` + ฟอนต์ข้อความธีม (`theme.text.value` เหมือน element ข้อความ)
 */
const ImageBadge = ({
  badge,
  aspectRatio,
  imageBorderRadius,
  theme,
  className = "",
  elementType = "img",
}) => {
  const b = mergeImageBadge(badge, { elementType });
  const bodyFontClass =
    typeof theme?.text?.value === "string" ? theme.text.value.trim() : "";

  const raw =
    typeof b.label === "string" ? b.label.trim() : "";
  /* เว้นข้อความว่าง = ไม่แสดง badge (ตาม placeholder ใน Panel) */
  if (raw === "") return null;

  const text = raw;

  const useEightPixelEdgeGap =
    b.variant === "pill" || b.variant === "soft";
  const posMap = useEightPixelEdgeGap
    ? { ...POSITION_CLASS, ...POSITION_CLASS_EDGE_8 }
    : POSITION_CLASS;
  const pos = posMap[b.position] || posMap.tl;
  const sz = SIZE_CLASS[b.size] || SIZE_CLASS["13"];
  const sizeTextOnly =
    SIZE_TEXT_ONLY[b.size] || SIZE_TEXT_ONLY["13"];
  const vr = VARIANT_CLASS[b.variant] || VARIANT_CLASS.pill;
  const ta = TEXT_ALIGN_CLASS[b.textAlign] || TEXT_ALIGN_CLASS.center;
  const isPillOrSoft = b.variant === "pill" || b.variant === "soft";
  const alignClass = isPillOrSoft ? "justify-center text-center" : ta;
  const isSquareEdgeBand =
    b.variant === "square" && (b.position === "tc" || b.position === "bc");
  const positionClass = isSquareEdgeBand
    ? b.position === "bc"
      ? "left-0 bottom-0"
      : "left-0 top-0"
    : pos;
  const widthClass = isSquareEdgeBand
    ? "w-full max-w-full rounded-none box-border"
    : "max-w-[calc(100%-40px)]";
  /* ข้อความห่างขอบกรอบแถบ 13px รอบด้าน — ไม่ใช้ padding จาก SIZE_CLASS ซ้อน */
  const lightboxSquarePadding = isSquareEdgeBand ? "p-[13px]" : "";
  const pillSoftInnerPadding = isPillOrSoft ? "py-[8px] px-[10px]" : "";
  const sizeClassForRender =
    isSquareEdgeBand || isPillOrSoft ? sizeTextOnly : sz;

  const customBg = resolveThemeOrHexColor(b.backgroundColor, theme);
  const customFg = resolveThemeOrHexColor(b.textColor, theme);
  const bgOp = Number(b.backgroundOpacity);
  const txOp = Number(b.textOpacity);
  const style = {};
  if (customBg)
    style.backgroundColor = applyOpacityToCssColor(customBg, bgOp);
  if (customFg) style.color = applyOpacityToCssColor(customFg, txOp);
  if (isSquareEdgeBand) {
    const corners = normalizeImageCornerRadius(imageBorderRadius);
    const fullCircle =
      isImageAspectOneToOne(aspectRatio) &&
      corners.tl >= IMAGE_CORNER_RADIUS_MAX_PX &&
      corners.tr >= IMAGE_CORNER_RADIUS_MAX_PX &&
      corners.bl >= IMAGE_CORNER_RADIUS_MAX_PX &&
      corners.br >= IMAGE_CORNER_RADIUS_MAX_PX;
    if (fullCircle) {
      if (b.position === "tc") {
        style.borderTopLeftRadius = "50%";
        style.borderTopRightRadius = "50%";
      } else {
        style.borderBottomLeftRadius = "50%";
        style.borderBottomRightRadius = "50%";
      }
    } else if (b.position === "tc") {
      style.borderTopLeftRadius = `${corners.tl}px`;
      style.borderTopRightRadius = `${corners.tr}px`;
    } else {
      style.borderBottomLeftRadius = `${corners.bl}px`;
      style.borderBottomRightRadius = `${corners.br}px`;
    }
  } else if (
    imageBorderRadius != null &&
    b.variant !== "circle" &&
    b.variant !== "pill" &&
    b.variant !== "soft"
  ) {
    /* พื้นหลังข้อความ — มุมโค้งตามรูป (ยกเว้นวงกลม/แคปซูล/มุมมน + เคสแถบ square ที่กำหนดมุมเองด้านบน) */
    Object.assign(style, imageCornerRadiusStyle(imageBorderRadius, aspectRatio));
  }

  const bgClass = customBg ? "" : "bg-slate-950/80 dark:bg-slate-950/85";
  const fgClass = customFg ? "" : "text-white";
  /* ไม่มี border / ring — ใช้เบลอให้อ่านง่าย */
  const chrome = "backdrop-blur-md";
  const fontWeightClass = b.bold ? "font-bold" : "font-normal";

  return (
    <span
      className={`pointer-events-none absolute z-20 inline-flex min-w-0 select-none items-center truncate border-0 leading-none ring-0 outline-none ${fontWeightClass} ${bodyFontClass} ${chrome} ${bgClass} ${fgClass} ${positionClass} ${widthClass} ${lightboxSquarePadding} ${pillSoftInnerPadding} ${sizeClassForRender} ${vr} ${alignClass} ${className}`.trim()}
      style={Object.keys(style).length ? style : undefined}
      aria-hidden
    >
      {text}
    </span>
  );
};

export default ImageBadge;
