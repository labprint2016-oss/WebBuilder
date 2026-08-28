/** ค่า default เมื่อข้อมูลเก่าไม่มีฟิลด์ aspectRatio */
export const IMAGE_ASPECT_DEFAULT = "auto";

/** ระยะบน/ล่าง (px) สำหรับ img / lbx / vid — ค่าเริ่มต้นแผง Image */
export const IMAGE_MARGIN_TOP_DEFAULT = 8;
export const IMAGE_MARGIN_BOTTOM_DEFAULT = 8;

/** สไลเดอร์ปรับแสง: กลาง 0, ซ้าย (-100) เข้มขึ้น, ขวา (+100) สว่างขึ้น */
export const IMAGE_BRIGHTNESS_DEFAULT = 0;

/** แปลงค่าสไลเดอร์เป็น style สำหรับ CSS filter brightness (เปอร์เซ็นต์) */
export function imageBrightnessFilterStyle(sliderValue) {
  const n = Number(sliderValue);
  const t = Number.isFinite(n) ? n : IMAGE_BRIGHTNESS_DEFAULT;
  const clamped = Math.max(-100, Math.min(100, t));
  const pct = 100 + (clamped / 100) * 55;
  return { filter: `brightness(${pct}%)` };
}

/** มุมมนเป็นพิกเซล — ซ้ายสุดสไลเดอร์ = 0px, ขวาสุด = โค้งเต็มที่ (px) */
export const IMAGE_CORNER_RADIUS_DEFAULT = 12;
export const IMAGE_CORNER_RADIUS_MAX_PX = 200;
export const IMAGE_CORNER_RADIUS_KEYS = ["tl", "tr", "bl", "br"];

/** อัตราส่วน 1:1 จาก panel (รองรับ "1/1" หรือ "1:1") */
export function isImageAspectOneToOne(aspectRatio) {
  const v = String(aspectRatio ?? "")
    .trim()
    .replace(/\s+/g, "")
    .replace(":", "/");
  return v === "1/1";
}

/**
 * มุมมนรูป — เมื่อ 1:1 + โค้งสุด (สไลเดอร์ขวาสุด) ใช้ 50% ให้เป็นวงกลมเสมอ
 * ไม่พึ่ง px กับขนาดจริง (padding คอลัมน์เปลี่ยนก็ยังเป็นวงกลม)
 */
export function imageCornerRadiusStyle(pxValue, aspectRatio) {
  const corners = normalizeImageCornerRadius(pxValue);
  const allCornersEqual = IMAGE_CORNER_RADIUS_KEYS.every(
    (k) => corners[k] === corners.tl
  );
  const allMax = IMAGE_CORNER_RADIUS_KEYS.every(
    (k) => corners[k] >= IMAGE_CORNER_RADIUS_MAX_PX
  );

  if (allCornersEqual) {
    if (corners.tl === 0) return { borderRadius: 0 };
    if (isImageAspectOneToOne(aspectRatio) && allMax) {
      return { borderRadius: "50%" };
    }
    return { borderRadius: `${corners.tl}px` };
  }

  return {
    borderTopLeftRadius: `${corners.tl}px`,
    borderTopRightRadius: `${corners.tr}px`,
    borderBottomLeftRadius: `${corners.bl}px`,
    borderBottomRightRadius: `${corners.br}px`,
  };
}

export function normalizeImageCornerRadius(value) {
  const clamp = (n) =>
    Math.max(0, Math.min(IMAGE_CORNER_RADIUS_MAX_PX, Number(n) || 0));

  if (value && typeof value === "object") {
    return {
      tl: clamp(value.tl),
      tr: clamp(value.tr),
      bl: clamp(value.bl),
      br: clamp(value.br),
    };
  }

  const base =
    value === undefined || value === null
      ? IMAGE_CORNER_RADIUS_DEFAULT
      : Number(value);
  const v = clamp(Number.isFinite(base) ? base : IMAGE_CORNER_RADIUS_DEFAULT);
  return { tl: v, tr: v, bl: v, br: v };
}

export function getImageCornerRadiusValue(value, target = "all") {
  const corners = normalizeImageCornerRadius(value);
  if (target === "all") {
    return IMAGE_CORNER_RADIUS_KEYS.every((k) => corners[k] === corners.tl)
      ? corners.tl
      : Math.round(
          (corners.tl + corners.tr + corners.bl + corners.br) /
            IMAGE_CORNER_RADIUS_KEYS.length
        );
  }
  if (!IMAGE_CORNER_RADIUS_KEYS.includes(target)) return corners.tl;
  return corners[target];
}

export function patchImageCornerRadius(currentValue, target, nextValue) {
  const corners = normalizeImageCornerRadius(currentValue);
  const clamped = Math.max(
    0,
    Math.min(IMAGE_CORNER_RADIUS_MAX_PX, Number(nextValue) || 0)
  );
  if (target === "all") {
    return { tl: clamped, tr: clamped, bl: clamped, br: clamped };
  }
  if (!IMAGE_CORNER_RADIUS_KEYS.includes(target)) return corners;
  return { ...corners, [target]: clamped };
}

/** ความทึบสี badge — ช่วงเดียวกับ Column opacityColor (0–255) */
export const IMAGE_BADGE_OPACITY_DEFAULT = 255;

/** Badge บนรูป — ปรับจาก Panel รูปภาพ */
export const IMAGE_BADGE_DEFAULT = {
  show: false,
  label: "",
  bold: false,
  position: "tl",
  size: "13",
  variant: "pill",
  textAlign: "center",
  backgroundOpacity: IMAGE_BADGE_OPACITY_DEFAULT,
  textOpacity: IMAGE_BADGE_OPACITY_DEFAULT,
};

/**
 * @param {object} [options]
 * @param {"img"|"lbx"|"vid"} [options.elementType] — Lightbox/Video ใช้กฎตำแหน่งตามรูปทรง badge
 */
export function mergeImageBadge(badge, options) {
  if (!badge || typeof badge !== "object") return { ...IMAGE_BADGE_DEFAULT };
  const elementType =
    options?.elementType === "lbx" || options?.elementType === "vid"
      ? options.elementType
      : "img";
  /* ไม่ให้คีย์ undefined ทับ default (เช่น label หายแล้ว element บน canvas พัง) */
  const cleaned = Object.fromEntries(
    Object.entries(badge).filter(([, v]) => v !== undefined)
  );
  const merged = { ...IMAGE_BADGE_DEFAULT, ...cleaned };
  /* migrate ค่า size เก่า (xs/sm/md) -> เลขใหม่ */
  if (merged.size === "xs") merged.size = "11";
  if (merged.size === "sm") merged.size = "13";
  if (merged.size === "md") merged.size = "16";
  /* ปิดการใช้งานทรงเหลี่ยม: migrate ค่าที่มีอยู่เดิมให้เป็นมุมมน */
  if (merged.variant === "square") merged.variant = "soft";
  const variant = merged.variant;

  if (elementType === "img") {
    /* Image — ทรงเหลี่ยม: กลางบน-กลางล่างเท่านั้น */
    if (variant === "square") {
      if (merged.position !== "tc" && merged.position !== "bc") {
        merged.position = "tc";
      }
    }
  } else {
    /* Lightbox — วงกลม/แคปซูล/มุมมน = สี่มุม; เหลี่ยม = กลางบน-กลางล่าง */
    if (
      variant === "circle" ||
      variant === "pill" ||
      variant === "soft"
    ) {
      if (["cc", "tc", "bc"].includes(merged.position)) merged.position = "tl";
    } else if (variant === "square") {
      if (merged.position !== "tc" && merged.position !== "bc") {
        merged.position = "tc";
      }
    } else {
      if (merged.position !== "tc" && merged.position !== "bc") {
        merged.position = "tc";
      }
    }
  }
  return merged;
}

/**
 * สีจากธีม `{ type, index }` (เช่น Column) หรือสตริง hex — คืน string สำหรับ CSS หรือ null
 */
export function resolveThemeOrHexColor(value, theme) {
  if (value === undefined || value === null) return null;
  if (typeof value === "string") {
    const t = value.trim();
    return t === "" ? null : t;
  }
  if (theme && typeof value === "object" && value.type) {
    const idx = Number(value.index);
    if (!Number.isFinite(idx)) return null;
    const arr = theme[value.type];
    if (Array.isArray(arr) && arr[idx] != null) return arr[idx];
  }
  return null;
}

/**
 * ใส่ alpha ให้สี CSS (#rgb / #rrggbb หรือ rgb(...)) — opacity255 0–255 แบบ Column
 */
export function applyOpacityToCssColor(cssColor, opacity255) {
  if (cssColor == null || typeof cssColor !== "string") return cssColor;
  const raw = Number(opacity255);
  const a =
    Math.max(
      0,
      Math.min(
        255,
        Number.isFinite(raw) ? raw : IMAGE_BADGE_OPACITY_DEFAULT
      )
    ) / 255;
  const s = cssColor.trim();
  if (s.startsWith("rgba(")) return s;
  if (s.startsWith("rgb(")) {
    const parts = s.match(/\d+/g);
    if (parts?.length >= 3)
      return `rgba(${parts[0]},${parts[1]},${parts[2]},${a})`;
    return s;
  }
  if (!s.startsWith("#")) return s;
  let h = s.slice(1);
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (h.length !== 6) return s;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return s;
  return `rgba(${r},${g},${b},${a})`;
}

/**
 * ลิงก์บน element รูป — คืนค่า props สำหรับ `<a>` เมื่อเปิดใช้และมี URL
 * linkTarget `_self` = หน้าเดิม, `_blank` = แท็บใหม่
 */
export function resolveImageLinkAttrs(elementData) {
  if (!elementData?.linkEnabled) return null;
  const href =
    typeof elementData.linkUrl === "string"
      ? elementData.linkUrl.trim()
      : "";
  if (!href) return null;
  const target =
    elementData.linkTarget === "_blank" ? "_blank" : "_self";
  return {
    href,
    target,
    ...(target === "_blank" ? { rel: "noopener noreferrer" } : {}),
  };
}

/** ลิงก์ปุ่มคู่ — slot 1 = ปุ่มซ้าย (linkEnabled/linkUrl/…), slot 2 = ปุ่มขวา */
export function resolveButtonDualSlotLinkAttrs(elementData, slot = 1) {
  const s = slot === 2 ? 2 : 1;
  const enabledKey = s === 2 ? "linkEnabled2" : "linkEnabled";
  const urlKey = s === 2 ? "linkUrl2" : "linkUrl";
  const targetKey = s === 2 ? "linkTarget2" : "linkTarget";
  if (!elementData?.[enabledKey]) return null;
  const href =
    typeof elementData[urlKey] === "string"
      ? elementData[urlKey].trim()
      : "";
  if (!href) return null;
  const target =
    elementData[targetKey] === "_blank" ? "_blank" : "_self";
  return {
    href,
    target,
    ...(target === "_blank" ? { rel: "noopener noreferrer" } : {}),
  };
}

/** ข้อความย่อจากสัดส่วน (ใช้เมื่อ badge.label ว่าง) */
export function aspectBadgeText(ar) {
  const v = ar || IMAGE_ASPECT_DEFAULT;
  if (v === "auto") return "ต้นฉบับ";
  return String(v).replace("/", ":");
}

export const IMAGE_BADGE_POSITIONS = [
  { value: "tl", label: "ซ้ายบน" },
  { value: "tr", label: "ขวาบน" },
  { value: "tc", label: "กลางบน" },
  { value: "bl", label: "ซ้ายล่าง" },
  { value: "br", label: "ขวาล่าง" },
  { value: "bc", label: "กลางล่าง" },
  { value: "cc", label: "ตรงกลาง" },
];

export const IMAGE_BADGE_POSITION_STYLE = {
  tl: { left: "20px", top: "20px", right: "auto", bottom: "auto", transform: "none" },
  tr: { right: "20px", top: "20px", left: "auto", bottom: "auto", transform: "none" },
  bl: { left: "20px", bottom: "20px", right: "auto", top: "auto", transform: "none" },
  br: { right: "20px", bottom: "20px", left: "auto", top: "auto", transform: "none" },
  tc: { left: "50%", top: "20px", right: "auto", bottom: "auto", transform: "translateX(-50%)" },
  bc: { left: "50%", bottom: "20px", right: "auto", top: "auto", transform: "translateX(-50%)" },
  cc: { left: "50%", top: "50%", right: "auto", bottom: "auto", transform: "translate(-50%, -50%)" },
};

export function applyImageBadgePreview(elementId, badge, theme) {
  const id = String(elementId ?? "");
  if (!id) return;
  const b = mergeImageBadge(badge);
  const position = String(b.position || "tl");
  const pos = IMAGE_BADGE_POSITION_STYLE[position] || IMAGE_BADGE_POSITION_STYLE.tl;
  const customBg = resolveThemeOrHexColor(b.backgroundColor, theme);
  const customFg = resolveThemeOrHexColor(b.textColor, theme);
  const bgOp = Number(b.backgroundOpacity);
  const txOp = Number(b.textOpacity);
  queryImagePreviewNodes(id, "data-image-badge-id").forEach((node) => {
    node.style.left = pos.left;
    node.style.top = pos.top;
    node.style.right = pos.right;
    node.style.bottom = pos.bottom;
    node.style.transform = pos.transform;
    node.style.fontWeight = b.bold ? "700" : "400";
    if (customBg) {
      node.style.backgroundColor = applyOpacityToCssColor(customBg, bgOp);
    }
    if (customFg) {
      node.style.color = applyOpacityToCssColor(customFg, txOp);
    }
    const text = typeof b.label === "string" ? b.label : "";
    if (node.textContent !== text) node.textContent = text;
  });
}

const BADGE_CORNER_VALUES = new Set(["tl", "tr", "bl", "br"]);

const LIGHTBOX_BADGE_POSITIONS_MID = [
  { value: "tc", label: "กลางบน" },
  { value: "bc", label: "กลางล่าง" },
];

/**
 * รายการตำแหน่งใน Panel
 * — รูปภาพ: มุมสี่ + ตรงกลาง
 * — Lightbox + วงกลม: มุมสี่ (เหมือนเดิม)
 * — Lightbox + แคปซูล/มุมมน/เหลี่ยม: กลางบน / กลางล่าง เท่านั้น
 */
export function getImageBadgePositionsForPanel(layoutElementType, variant) {
  if (layoutElementType !== "lbx" && layoutElementType !== "vid") {
    if (variant === "square") return LIGHTBOX_BADGE_POSITIONS_MID;
    return IMAGE_BADGE_POSITIONS;
  }
  if (
    variant === "circle" ||
    variant === "pill" ||
    variant === "soft"
  ) {
    return IMAGE_BADGE_POSITIONS.filter((p) => BADGE_CORNER_VALUES.has(p.value));
  }
  if (variant === "square") {
    return LIGHTBOX_BADGE_POSITIONS_MID;
  }
  return LIGHTBOX_BADGE_POSITIONS_MID;
}

export const IMAGE_BADGE_SIZES = [
  { value: "11", label: "11" },
  { value: "12", label: "12" },
  { value: "13", label: "13" },
  { value: "14", label: "14" },
  { value: "15", label: "15" },
  { value: "16", label: "16" },
  { value: "18", label: "18" },
  { value: "20", label: "20" },
];

export const IMAGE_BADGE_VARIANTS = [
  { value: "pill", label: "แคปซูล" },
  { value: "soft", label: "มุมมน" },
  { value: "circle", label: "วงกลม" },
];

export const IMAGE_BADGE_TEXT_ALIGNS = [
  { value: "start", label: "ข้อความชิดซ้าย" },
  { value: "center", label: "ข้อความกึ่งกลาง" },
];

/** ตัวเลือกสัดส่วน — value ใช้กับ CSS aspect-ratio (รูปแบบเช่น 1/1, 16/9) */
export const IMAGE_ASPECT_OPTIONS = [
  { value: "auto", label: "ตามรูปต้นฉบับ", hint: "ไม่บังคับกรอบ" },
  { value: "1/1", label: "1:1", hint: "สี่เหลี่ยมจัตุรัส" },
  { value: "4/3", label: "4:3", hint: "จอคลาสสิก / นิตยสาร" },
  { value: "3/4", label: "3:4", hint: "แนวตั้งคลาสสิก" },
  { value: "3/2", label: "3:2", hint: "กล้อง DSLR แนวนอน" },
  { value: "2/3", label: "2:3", hint: "กล้อง DSLR แนวตั้ง" },
  { value: "16/9", label: "16:9", hint: "วิดีโอ / แบนเนอร์" },
  { value: "9/16", label: "9:16", hint: "สตอรี่ / รีลส์" },
];

/** ขนาดไอคอนจำลองสัดส่วน (px) — width x height */
export const aspectPreviewDims = (value) => {
  switch (value) {
    case "1/1":
      return { w: 22, h: 22 };
    case "4/3":
      return { w: 26, h: 20 };
    case "3/4":
      return { w: 18, h: 24 };
    case "3/2":
      return { w: 30, h: 20 };
    case "2/3":
      return { w: 18, h: 27 };
    case "16/9":
      return { w: 32, h: 18 };
    case "9/16":
      return { w: 16, h: 28 };
    default:
      return { w: 28, h: 18 };
  }
};

function escapeAttrSelector(id) {
  const raw = String(id ?? "");
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(raw);
  }
  return raw.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function queryImagePreviewNodes(elementId, attr) {
  const id = String(elementId ?? "");
  if (!id || typeof document === "undefined") return [];
  return Array.from(
    document.querySelectorAll(`[${attr}="${escapeAttrSelector(id)}"]`)
  );
}

function applyStyleObject(node, styles) {
  if (!node || !styles) return;
  Object.entries(styles).forEach(([key, value]) => {
    if (value == null || value === "") return;
    node.style[key] = typeof value === "number" ? `${value}px` : String(value);
  });
}

function applyImageCornerRadiusToNode(node, pxValue, aspectRatio) {
  if (!node) return;
  node.style.removeProperty("border-radius");
  node.style.removeProperty("border-top-left-radius");
  node.style.removeProperty("border-top-right-radius");
  node.style.removeProperty("border-bottom-left-radius");
  node.style.removeProperty("border-bottom-right-radius");
  applyStyleObject(node, imageCornerRadiusStyle(pxValue, aspectRatio));
}

/** Live preview on canvas — หลีกเลี่ยงการ re-render แผง Image ตอนลากสไลเดอร์ / คลิกสัดส่วน */
export function applyImageCanvasPreview(elementId, nextData) {
  const id = String(elementId ?? "");
  if (!id) return;
  const aspect = String(nextData?.aspectRatio || IMAGE_ASPECT_DEFAULT)
    .trim()
    .replace(/\s+/g, "")
    .replace(":", "/");
  const mt = Number(nextData?.imageMarginTop);
  const mb = Number(nextData?.imageMarginBottom);
  const marginTop = Number.isFinite(mt) ? mt : IMAGE_MARGIN_TOP_DEFAULT;
  const marginBottom = Number.isFinite(mb) ? mb : IMAGE_MARGIN_BOTTOM_DEFAULT;
  const brightness = imageBrightnessFilterStyle(
    nextData?.brightness ?? IMAGE_BRIGHTNESS_DEFAULT
  );

  queryImagePreviewNodes(id, "data-image-wrap-id").forEach((wrap) => {
    wrap.style.marginTop = `${marginTop}px`;
    wrap.style.marginBottom = `${marginBottom}px`;
    applyImageCornerRadiusToNode(wrap, nextData?.borderRadius, aspect);
  });
  queryImagePreviewNodes(id, "data-image-frame-id").forEach((node) => {
    const isImg = String(node.tagName || "").toLowerCase() === "img";
    applyImageCornerRadiusToNode(node, nextData?.borderRadius, aspect);
    applyStyleObject(node, brightness);
    if (!aspect || aspect === "auto") {
      if (isImg) {
        node.style.removeProperty("aspect-ratio");
        node.style.removeProperty("object-fit");
      }
      return;
    }
    node.style.aspectRatio = aspect;
    if (isImg) {
      node.style.width = "100%";
      node.style.height = "auto";
      node.style.objectFit = "cover";
    }
  });
  queryImagePreviewNodes(id, "data-image-radius-id").forEach((node) => {
    applyImageCornerRadiusToNode(node, nextData?.borderRadius, aspect);
  });
}

export function clearImageCanvasPreview(elementId) {
  const id = String(elementId ?? "");
  if (!id) return;
  queryImagePreviewNodes(id, "data-image-frame-id").forEach((node) => {
    if (String(node.tagName || "").toLowerCase() !== "img") return;
    node.style.removeProperty("aspect-ratio");
    node.style.removeProperty("object-fit");
  });
}

export function overlayContentTopPx(frameHeight, contentHeight, offsetY, insetPx = 5) {
  const inset = Math.max(0, Number(insetPx) || 5);
  const minTop = inset;
  const maxTop = Math.max(minTop, Number(frameHeight) - Number(contentHeight) - inset);
  const ratio = Math.max(0, Math.min(100, Number(offsetY) || 0)) / 100;
  return minTop + (maxTop - minTop) * ratio;
}

/** Live preview ตำแหน่งข้อความ Overlay — ไม่ re-render แผงตอนลากสไลเดอร์ */
export function applyOverlayContentOffsetPreview(elementId, offsetY) {
  const id = String(elementId ?? "");
  if (!id) return;
  queryImagePreviewNodes(id, "data-overlay-frame-id").forEach((frame) => {
    const content =
      frame.querySelector(`[data-overlay-content-id="${escapeAttrSelector(id)}"]`) ||
      null;
    if (!content) return;
    const frameHeight = Number(frame.clientHeight) || 0;
    const contentHeight =
      Number(content.offsetHeight) || Number(content.scrollHeight) || 0;
    if (frameHeight <= 0 || contentHeight <= 0) return;
    const inset = Number(frame.getAttribute("data-overlay-inset"));
    content.style.top = `${overlayContentTopPx(
      frameHeight,
      contentHeight,
      offsetY,
      Number.isFinite(inset) ? inset : 5
    )}px`;
  });
}
