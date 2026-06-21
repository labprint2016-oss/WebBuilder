import lodash from "lodash";
import {
  normalizeParagraph,
  ALIGN_CLASS,
  SEGMENT_CLASS,
} from "../../richText/richTextParagraphModel";
import { isValidFaIconRef, mergeIconElement } from "./iconElementConfig";
import { sliceListItemImageForPanel } from "./listElementConfig";

/** ฟิลด์ไอคอนต่อช่อง List Box — sync จากแผง Icons (ดับเบิลคลิกไอคอน) */
export const LIST_BOX_ITEM_ICON_KEYS = [
  "faIcon",
  "backgroundColor",
  "backgroundOpacity",
  "iconColor",
  "iconOpacity",
  "borderColor",
  "borderOpacity",
  "borderWidth",
  "borderStyle",
  "borderPosition",
  "linkEnabled",
  "linkUrl",
  "linkTarget",
];

/** ไอคอนเริ่มต้นต่อช่อง (ลำดับเดียวกับ LIST_BOX_DEFAULT_TITLES) */
export const LIST_BOX_DEFAULT_ICONS = [
  { name: "faBrush", type: "fas" },
  { name: "faUpDownLeftRight", type: "fas" },
  { name: "faStar", type: "fas" },
  { name: "faChessKnight", type: "fas" },
];

function listBoxDefaultIconAt(i) {
  const icons = LIST_BOX_DEFAULT_ICONS;
  return { ...icons[i % icons.length] };
}

/**
 * สีไอคอนแบบเริ่มต้นตอนเปิดกรอบ (ขาวบนวง mainColor) — ยังไม่ถือว่าผู้ใช้กำหนดจากแผง Icons
 */
export function isListBoxImplicitFramedOnlyGlyphColor(iconColor, iconOpacity) {
  const op = Number(iconOpacity);
  const opDefault = !Number.isFinite(op) || Math.round(op) === 255;
  if (!opDefault) return false;
  if (iconColor == null) return true;
  if (typeof iconColor === "object" && iconColor !== null) return false;
  if (typeof iconColor === "string") {
    const t = iconColor.replace(/\s/g, "").toLowerCase();
    return t === "#fff" || t === "#ffffff" || t === "white";
  }
  return false;
}

/** เปิดกรอบ: ไม่ให้ไอคอนเป็น mainColor ช่องเดียวกับพื้นหลังวง (เช่น หลังแก้จากแผงเมื่อปิดกรอบ) */
export function migrateListBoxItemsGlyphMainColor0ToWhiteWhenFramingOn(listBoxItems) {
  if (!Array.isArray(listBoxItems)) return listBoxItems;
  return listBoxItems.map((it) => {
    const ic = it?.iconColor;
    const isMain0 =
      ic &&
      typeof ic === "object" &&
      ic.type === "mainColor" &&
      Number(ic.index) === 0;
    if (!isMain0) return it;
    return { ...it, iconColor: "#ffffff" };
  });
}

/** ปิดกรอบ: แสดงไอคอนด้วย mainColor แทนขาวเมื่อยังเป็นค่าเริ่มต้นแบบมีกรอบ */
export function listBoxItemIconElWithFramelessGlyphDefault(iconEl, listBoxIconFrameEnabled) {
  const frameOn = listBoxIconFrameEnabled !== false;
  if (frameOn || !iconEl || typeof iconEl !== "object") return iconEl;
  if (
    !isListBoxImplicitFramedOnlyGlyphColor(iconEl.iconColor, iconEl.iconOpacity)
  ) {
    return iconEl;
  }
  return { ...iconEl, iconColor: { type: "mainColor", index: 0 } };
}

/** หัวข้อเริ่มต้นต่อช่อง — แก้ข้อความ/ระยะตัวอักษรใน Modal ได้ภายหลัง */
export const LIST_BOX_DEFAULT_TITLES = [
  "DESIGNER",
  "DRAG & DROP",
  "CUSTOMIZE",
  "OWN UNIQUE",
];

export function createListBoxDefaultTitleParagraph(titleText) {
  const text = String(titleText || "").trim() || LIST_BOX_DEFAULT_TITLES[0];
  return normalizeParagraph({
    type: "paragraph",
    alignClass: ALIGN_CLASS.center,
    segments: [
      {
        text,
        classes: [SEGMENT_CLASS.bold],
        style: {
          fontSize: "13px",
          lineHeight: "21px",
          letterSpacing: "0.2em",
        },
      },
    ],
  });
}

function emptyItem(i) {
  const title = LIST_BOX_DEFAULT_TITLES[i % LIST_BOX_DEFAULT_TITLES.length];
  return {
    title,
    titleParagraph: createListBoxDefaultTitleParagraph(title),
    body: "",
    faIcon: listBoxDefaultIconAt(i),
    src: "",
    aspectRatio: "1 / 1",
    borderRadius: 8,
    backgroundColor: { type: "mainColor", index: 0 },
    backgroundOpacity: 255,
    iconColor: "#ffffff",
    iconOpacity: 255,
    linkEnabled: false,
    linkUrl: "",
    linkTarget: "_self",
    slideLinkMode: "url",
    slideVideoEmbed: "",
  };
}

/** เส้นแบ่งช่องกริด — ปุ่มเดียวกับ List iCons (ไม่มี / ตรง / ประ / จุด) */
export const LIST_BOX_GRID_DIVIDER_OPTIONS = [
  { value: "none", label: "ไม่มี" },
  { value: "solid", label: "ตรง" },
  { value: "dashed", label: "ประ" },
  { value: "dotted", label: "จุด" },
];

function normalizeListBoxGridDividerStyle(v) {
  if (v === "none" || v === "solid" || v === "dashed" || v === "dotted") return v;
  return "dashed";
}

/** รูปทรงพื้นหลังไอคอน — เหมือน Icons panel */
export const LIST_BOX_ICON_SHAPE_OPTIONS = [
  { value: "circle", label: "วงกลม" },
  { value: "rounded", label: "มุมมน" },
];

/** ค่า listBoxVariant ที่รองรับ — สอดคล้องชื่อกับ Carousel */
export const LIST_BOX_VARIANT_OPTIONS = [
  { value: "icon_text", label: "ไอคอน + ข้อความ" },
  { value: "image_text", label: "ภาพ + ข้อความ" },
  { value: "image", label: "ภาพ" },
  { value: "text", label: "ข้อความ" },
];

const LIST_BOX_VARIANT_VALUES = LIST_BOX_VARIANT_OPTIONS.map((o) => o.value);

function normalizeListBoxVariant(v) {
  return LIST_BOX_VARIANT_VALUES.includes(v) ? v : "icon_text";
}

function normalizeListBoxIconShape(v) {
  return v === "rounded" ? "rounded" : "circle";
}

export const LIST_BOX_ELEMENT_DEFAULTS = {
  listBoxVariant: "icon_text",
  listBoxItems: LIST_BOX_DEFAULT_TITLES.map((title, i) => ({
    title,
    titleParagraph: createListBoxDefaultTitleParagraph(title),
    body: "",
    faIcon: listBoxDefaultIconAt(i),
    src: "",
    aspectRatio: "1 / 1",
    borderRadius: 8,
    backgroundColor: { type: "mainColor", index: 0 },
    backgroundOpacity: 255,
    iconColor: "#ffffff",
    iconOpacity: 255,
  })),
  listBoxItemCount: 4,
  listBoxPerViewDesktop: 2,
  listBoxPerViewTablet: 2,
  listBoxPerViewMobile: 1,
  /** โหมดไอคอน + ข้อความ — ขนาดพื้นหลังวงกลม (px) */
  listBoxIconBgWidth: 56,
  /** โหมดไอคอน + ข้อความ — ขนาดไอคอน (px) */
  listBoxIconSize: 26,
  /** โหมดไอคอน + ข้อความ — เปิดใช้พื้นหลังไอคอน (เหมือน List iCons) */
  listBoxIconFrameEnabled: true,
  /** circle | rounded — ใช้เมื่อเปิดกรอบ */
  listBoxIconShape: "circle",
  /** มุมมน (px) เมื่อ listBoxIconShape === rounded */
  listBoxIconCornerRadius: 12,
  listBoxMarginTop: 8,
  listBoxMarginBottom: 8,
  /**
   * กรอบเต็ม — Switch ปิด = เส้นแบ่งแบบเดิม (เส้นประระหว่างช่อง)
   * เปิด = ใช้ปุ่มไม่มี/ตรง/ประ/จุด + สี และกรอบรอบเนื้อหาด้านในแต่ละช่อง
   */
  listBoxGridFullFrameEnabled: false,
  /** ประ = เส้นประ (ค่าเริ่มต้นในแผงเส้นคั่น) */
  listBoxGridDividerStyle: "dashed",
  listBoxGridDividerColor: "#d8d8d8",
  listBoxGridDividerOpacity: 255,
};

export function mergeListBoxElement(raw) {
  const base = lodash.merge({}, LIST_BOX_ELEMENT_DEFAULTS, raw || {});
  const count = Math.min(
    12,
    Math.max(1, Number(base.listBoxItemCount) || base.listBoxItems?.length || 4)
  );
  let items = Array.isArray(base.listBoxItems)
    ? lodash.cloneDeep(base.listBoxItems)
    : [];
  while (items.length < count) items.push(emptyItem(items.length));
  if (items.length > count) items = items.slice(0, count);

  items = items.map((it, i) => {
    const def = emptyItem(i);
    const br = Number(it?.borderRadius);
    const borderRadius = Number.isFinite(br)
      ? Math.max(0, Math.min(32, Math.round(br)))
      : def.borderRadius;
    const arRaw = typeof it?.aspectRatio === "string" ? it.aspectRatio.trim() : "";
    const aspectRatio = arRaw || def.aspectRatio;
    const out = {
      title: typeof it?.title === "string" ? it.title : def.title,
      body: typeof it?.body === "string" ? it.body : "",
      faIcon: isValidFaIconRef(it?.faIcon) ? it.faIcon : listBoxDefaultIconAt(i),
      src: typeof it?.src === "string" ? it.src : "",
      aspectRatio,
      borderRadius,
    };
    if (it?.titleParagraph && typeof it.titleParagraph === "object") {
      out.titleParagraph = lodash.cloneDeep(it.titleParagraph);
      const segs = out.titleParagraph?.segments;
      if (!Array.isArray(segs) || segs.length === 0) {
        out.titleParagraph = createListBoxDefaultTitleParagraph(out.title);
      }
    } else {
      out.titleParagraph = createListBoxDefaultTitleParagraph(out.title);
    }
    if (it?.bodyParagraph && typeof it.bodyParagraph === "object") {
      out.bodyParagraph = lodash.cloneDeep(it.bodyParagraph);
    }
    Object.assign(
      out,
      lodash.pickBy(lodash.pick(it, LIST_BOX_ITEM_ICON_KEYS), (v) => v !== undefined)
    );
    const sl = it?.slideLinkMode;
    out.slideLinkMode =
      sl === "lightbox" || sl === "video" || sl === "url" ? sl : "url";
    out.slideVideoEmbed =
      typeof it?.slideVideoEmbed === "string" ? it.slideVideoEmbed : "";
    return out;
  });

  const gridDividerStyleNorm = normalizeListBoxGridDividerStyle(
    base.listBoxGridDividerStyle
  );
  const listBoxGridFullFrameEnabled =
    typeof base.listBoxGridFullFrameEnabled === "boolean"
      ? base.listBoxGridFullFrameEnabled
      : base.listBoxGridDividerEnabled === true;

  return {
    ...lodash.omit(base, [
      "listBoxGap",
      "listBoxNavColor",
      "listBoxNavColorOpacity",
      "listBoxNavActiveColor",
      "listBoxNavActiveColorOpacity",
      "listBoxIconBackgroundColor",
      "listBoxIconBackgroundOpacity",
      "listBoxIconGlyphColor",
      "listBoxIconGlyphOpacity",
    ]),
    listBoxItemCount: count,
    listBoxItems: items,
    listBoxPerViewDesktop: Math.min(
      4,
      Math.max(1, Number(base.listBoxPerViewDesktop) || 1)
    ),
    listBoxPerViewTablet: Math.min(
      3,
      Math.max(1, Number(base.listBoxPerViewTablet) || 1)
    ),
    listBoxPerViewMobile: Math.min(
      2,
      Math.max(1, Number(base.listBoxPerViewMobile) || 1)
    ),
    listBoxVariant: normalizeListBoxVariant(base.listBoxVariant),
    listBoxIconBgWidth: Math.max(
      20,
      Math.min(160, Math.round(Number(base.listBoxIconBgWidth) || 56))
    ),
    listBoxIconSize: Math.max(
      12,
      Math.min(96, Math.round(Number(base.listBoxIconSize) || 26))
    ),
    listBoxIconFrameEnabled: base.listBoxIconFrameEnabled !== false,
    listBoxIconShape: normalizeListBoxIconShape(base.listBoxIconShape),
    listBoxIconCornerRadius: Math.max(
      0,
      Math.min(80, Math.round(Number(base.listBoxIconCornerRadius) || 12))
    ),
    listBoxGridFullFrameEnabled,
    listBoxGridDividerStyle: gridDividerStyleNorm,
    /** คงฟิลด์เก่าให้ payload ที่อ่าน flag เดิม */
    listBoxGridDividerEnabled:
      listBoxGridFullFrameEnabled && gridDividerStyleNorm !== "none",
    listBoxGridDividerColor:
      base.listBoxGridDividerColor ?? LIST_BOX_ELEMENT_DEFAULTS.listBoxGridDividerColor,
    listBoxGridDividerOpacity: Math.max(
      0,
      Math.min(
        255,
        Number.isFinite(Number(base.listBoxGridDividerOpacity))
          ? Math.round(Number(base.listBoxGridDividerOpacity))
          : LIST_BOX_ELEMENT_DEFAULTS.listBoxGridDividerOpacity
      )
    ),
  };
}

/** ฟิลด์ที่ sync จากแคนวาส → แผง List Box */
export function pickListBoxOffcanvasSync(e) {
  return {
    id: e.id,
    type: e.type,
    listBoxItems: e.listBoxItems,
    listBoxItemCount: e.listBoxItemCount,
    listBoxPerViewDesktop: e.listBoxPerViewDesktop,
    listBoxPerViewTablet: e.listBoxPerViewTablet,
    listBoxPerViewMobile: e.listBoxPerViewMobile,
    listBoxVariant: e.listBoxVariant,
    listBoxIconBgWidth: e.listBoxIconBgWidth,
    listBoxIconSize: e.listBoxIconSize,
    listBoxIconFrameEnabled: e.listBoxIconFrameEnabled,
    listBoxIconShape: e.listBoxIconShape,
    listBoxIconCornerRadius: e.listBoxIconCornerRadius,
    listBoxMarginTop: e.listBoxMarginTop,
    listBoxMarginBottom: e.listBoxMarginBottom,
    listBoxGridFullFrameEnabled: e.listBoxGridFullFrameEnabled,
    listBoxGridDividerEnabled: e.listBoxGridDividerEnabled,
    listBoxGridDividerStyle: e.listBoxGridDividerStyle,
    listBoxGridDividerColor: e.listBoxGridDividerColor,
    listBoxGridDividerOpacity: e.listBoxGridDividerOpacity,
  };
}

/** เปิดแผง Icons จากดับเบิลคลิกไอคอนใน List Box (รายการละไอคอน) */
export function sliceListBoxItemIconForPanel(item, listBoxRoot, itemIndex) {
  const merged = mergeListBoxElement(listBoxRoot || {});
  const it = item || {};
  const frameOn = merged.listBoxIconFrameEnabled !== false;
  const idx = Number(itemIndex);
  const safeIdx = Number.isFinite(idx) && idx >= 0 ? idx : 0;
  const fa = isValidFaIconRef(it.faIcon) ? it.faIcon : listBoxDefaultIconAt(safeIdx);
  const fromItem = lodash.omit(
    lodash.pick(it, LIST_BOX_ITEM_ICON_KEYS),
    "faIcon"
  );
  const fromItemForPanel = listBoxItemIconElWithFramelessGlyphDefault(
    fromItem,
    merged.listBoxIconFrameEnabled
  );
  return mergeIconElement({
    type: "icon",
    id: `${merged.id || "lstb"}__lbico${safeIdx}`,
    faIcon: fa,
    iconSize: merged.listBoxIconSize,
    containerSize: merged.listBoxIconBgWidth,
    borderEnabled: frameOn,
    iconShape: merged.listBoxIconShape === "rounded" ? "rounded" : "circle",
    iconCornerRadius: merged.listBoxIconCornerRadius,
    __listBoxItemIconEdit: {
      listBoxElementId: merged.id,
      itemIndex: safeIdx,
    },
    ...fromItemForPanel,
  });
}

/** แยก payload จาก IconElementOffcanvas → รายการ (ไอคอน/สีต่อช่อง) + ระดับ List Box (กรอบรวม) — ขนาดไอคอนใช้ listBoxIconSize จากแผง List Box เท่านั้น */
export function splitListBoxItemIconPayload(payload) {
  const p = payload || {};
  const itemUpdate = lodash.pickBy(
    lodash.pick(p, LIST_BOX_ITEM_ICON_KEYS),
    (v) => v !== undefined
  );
  const sharedUpdate = {};
  if (p.containerSize !== undefined) {
    sharedUpdate.listBoxIconBgWidth = Math.max(
      20,
      Math.min(160, Math.round(Number(p.containerSize)) || 56)
    );
  }
  if (p.borderEnabled !== undefined) {
    sharedUpdate.listBoxIconFrameEnabled = Boolean(p.borderEnabled);
  }
  if (p.iconShape !== undefined) {
    sharedUpdate.listBoxIconShape = p.iconShape === "rounded" ? "rounded" : "circle";
  }
  if (p.iconCornerRadius !== undefined) {
    sharedUpdate.listBoxIconCornerRadius = Math.max(
      0,
      Math.min(80, Math.round(Number(p.iconCornerRadius)) || 12)
    );
  }
  return { itemUpdate, sharedUpdate };
}

/** เปิดแผง Image จากดับเบิลคลิกรูปใน List Box */
export function sliceListBoxItemImageForPanel(item, listBoxRoot, itemIndex) {
  const merged = mergeListBoxElement(listBoxRoot || {});
  const idx = Number(itemIndex);
  const safeIdx = Number.isFinite(idx) && idx >= 0 ? idx : 0;
  const base = sliceListItemImageForPanel(item, merged, safeIdx);
  return {
    ...lodash.omit(base, ["__listItemImageEdit"]),
    id: `${merged.id || "lstb"}__lbimg${safeIdx}`,
    __listBoxItemImageEdit: {
      listBoxElementId: merged.id,
      itemIndex: safeIdx,
    },
  };
}
