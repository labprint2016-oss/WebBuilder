import lodash from "lodash";
import { normalizeParagraph } from "../../richText/richTextParagraphModel";
import { THEME_PANEL_BASIC_COLOR_SWATCHES } from "../../themePanelBasicColors";
import { mergeIconElement } from "./iconElementConfig";
import {
  IMAGE_MARGIN_BOTTOM_DEFAULT,
  IMAGE_MARGIN_TOP_DEFAULT,
} from "./imageAspectConfig";

/** ไอคอน default หมุนเวียนสำหรับ item ใหม่ */
const LIST_DEFAULT_ICONS = [
  "faShieldHalved",
  "faCircleCheck",
  "faStar",
  "faLightbulb",
  "faHeart",
  "faBolt",
];

const LIST_DEMO_TEXTS = [
  "Design your own unique website",
  "Build pages quickly and easily",
  "Customize to match your brand",
];

/** ข้อความตัวอย่าง List iCons — ต่อแถว (เพิ่มรายการ / ค่าเริ่มต้นให้สอดคล้อง Server/element.js) */
const LIST_ICONS_DEMO_TEXTS = ["No Code", "Elements", "Modern"];

/** ข้อความเริ่มต้น List iMage — ทุกแถวและตอนเพิ่มรายการ (บรรทัดคั่นด้วย \\n) */
export const LIST_IMAGE_DEFAULT_TEXT = `CLOUD Server - WEB Builder
Build website for Quickly and Easily`;

/** ข้อความขวา (ข้อความประกอบ) เมื่อเปิดใช้ — ค่าเริ่มต้นต่อแถว */
export const LIST_IMAGE_ASIDE_DEFAULT_TEXT = "99$";

/** List iMage — ค่าเริ่มต้นเฉพาะโหมดรูป (ไม่แก้ LIST_ELEMENT_DEFAULTS เพื่อไม่กระทบ List iCons) */
export const LIST_IMAGE_DEFAULT_CONTAINER_SIZE = 60;
export const LIST_IMAGE_DEFAULT_LIST_MARGIN = 8;
export const LIST_IMAGE_DEFAULT_CAPTION_FONT_SIZE = 18;

/** ค่า default ของ element-level shared fields */
export const LIST_ELEMENT_DEFAULTS = {
  /* shared icon styling — พื้นหลังกรอบไอคอน = ช่อง #333333 ในแถบสีพื้นฐาน */
  backgroundColor: "#333333",
  backgroundOpacity: 255,
  iconColor: "#ffffff",
  iconOpacity: 255,
  iconSize: 19,
  containerSize: 36,
  iconShape: "circle",
  iconCornerRadius: 12,
  borderColor: { type: "textColor", index: 0 },
  borderOpacity: 255,
  borderWidth: 0,
  borderStyle: "solid",
  borderPosition: "outside",
  iconLayoutAlign: "center",
  iconMarginTop: 0,
  iconMarginBottom: 0,
  /* shared text styling */
  listTextColor: "#000000",
  listTextOpacity: 255,
  listTextSize: 14,
  /* shared spacing */
  listMarginTop: 8,
  listMarginBottom: 8,
  listItemRowGap: 8,
  listIconTextGapPx: 12,
  /* shared divider */
  listDividerEnabled: true,
  listDividerStyle: "dotted",
  listDividerColor: "#d8d8d8",
  listDividerOpacity: 255,
  /** List iTems: เส้นคั่นแนวตั้งเดียวกลางคอลัมน์ไอคอน (แทนเส้นคั่นแนวนอนระหว่างแถว) */
  listVerticalTimelineDivider: false,
  /** List iTems + List iMage (ไม่ใช่ iCons): start | end (ข้อความเต็มแถวชิดขวา) | split (กลุ่มข้อความ+ไอคอนชิดขวา) */
  listItemsIconAlign: "start",
  /** List iMage + split เท่านั้น — สลับด้าน: textLeft = ข้อความซ้าย+รูปขวา | imageLeft = รูปซ้าย+ข้อความขวา (สะท้อนกัน) */
  listImageSplitArrangement: "textLeft",
  /* List iCons alignment */
  listIconsAlign: "flex-start",
  /* List iCons layout: "row" = icon ซ้าย + text ขวา, "column" = icon บน + text ล่าง */
  listIconsLayout: "row",
  /** List iCons — การแสดงผล: iconText | icon | text */
  listIconsDisplayMode: "iconText",
  /** List iTems เท่านั้น — กรอบ/ขนาดรวม (เหมือน List Box ที่ระดับ element) */
  listItemIconFrameEnabled: true,
  listItemIconShape: "circle",
  listItemIconCornerRadius: 12,
  listItemIconBgWidth: 36,
  listItemIconSize: 19,
  /** List iTems — กรอบแถว (เหมือน Between) */
  listItemRowFrameEnabled: false,
  listItemRowFrameColor: "#d4d4d8",
  listItemRowFrameOpacity: 255,
  listItemRowFrameRadius: 18,
  listItemRowFrameGlass: 55,
  /** List iCons — พื้นหลังไอคอน (ปิดเป็นค่าเริ่มต้น) */
  listIconsFrameEnabled: false,
  listIconsIconShape: "circle",
  listIconsIconCornerRadius: 12,
  listIconsIconBgWidth: 36,
  listIconsIconSize: 18,
  /* compound */
  listItemCount: 3,
  listItems: Array.from({ length: 3 }, (_, i) => ({
    faIcon: { name: LIST_DEFAULT_ICONS[i % LIST_DEFAULT_ICONS.length], type: "fas" },
    listText: LIST_DEMO_TEXTS[i % LIST_DEMO_TEXTS.length],
    listTextParagraph: null,
  })),
};

/** สีหลัง merge ตอนกรอบ List iCons เปิด — ใช้คืนค่าเมื่อปิดกรอบหลังแก้จากแผง Icon */
export function buildListIconsFramedAppearanceSnapshot(listItems) {
  const rows = Array.isArray(listItems) ? listItems : [];
  return rows.map((it) =>
    lodash.cloneDeep(
      lodash.pick(it || {}, ["iconColor", "backgroundColor", "backgroundOpacity"])
    )
  );
}

/** fields ที่อยู่ใน listItems[idx] (icon + text per-item) */
export const LIST_ITEM_ICON_KEYS = [
  "faIcon",
  "backgroundColor",
  "backgroundOpacity",
  "iconColor",
  "iconOpacity",
  "iconSize",
  "containerSize",
  "iconShape",
  "iconCornerRadius",
  "borderColor",
  "borderOpacity",
  "borderWidth",
  "borderStyle",
  "borderPosition",
  "iconLayoutAlign",
  "borderEnabled",
  "linkEnabled",
  "linkUrl",
  "linkTarget",
];

/** fields ที่เป็น shared ระดับ element (divider + margin + text style) */
const LIST_SHARED_KEYS = [
  "listDividerEnabled",
  "listDividerStyle",
  "listDividerColor",
  "listDividerOpacity",
  "listVerticalTimelineDivider",
  "listItemsIconAlign",
  "listImageSplitArrangement",
  "listMarginTop",
  "listMarginBottom",
  "listItemRowGap",
  "listTextColor",
  "listTextOpacity",
  "listTextSize",
  "listIconTextGapPx",
  "listTextGapAdjust",
  "iconMarginTop",
  "iconMarginBottom",
];

/** List iCons — แถว (ไอคอนซ้าย + ข้อความขวา): fallback เมื่อรายการไม่มี iconSize */
export const LIST_ICONS_DEFAULT_ICON_SIZE_ROW = 18;
/** List iCons — คอลัมน์ (ไอคอนบน + ข้อความล่าง): fallback เมื่อรายการไม่มี iconSize */
export const LIST_ICONS_DEFAULT_ICON_SIZE_COLUMN = 24;

/** ขนาดไอคอน fallback สำหรับ canvas / panel เมื่อ item ไม่มี iconSize */
export function listIconsFallbackIconSize(elementRoot) {
  if (elementRoot?.listIconsElement !== true) {
    return LIST_ELEMENT_DEFAULTS.iconSize;
  }
  return elementRoot?.listIconsLayout === "column"
    ? LIST_ICONS_DEFAULT_ICON_SIZE_COLUMN
    : LIST_ICONS_DEFAULT_ICON_SIZE_ROW;
}

/** List iTems — ขนาดไอคอน default สำหรับแผง / slice (รวม listItemIconSize) */
export function listItemsPanelDefaultIconSize(elementRoot) {
  if (elementRoot?.listIconsElement === true) {
    return listIconsFallbackIconSize(elementRoot);
  }
  const raw = Number(
    elementRoot?.listItemIconSize ??
      elementRoot?.iconSize ??
      LIST_ELEMENT_DEFAULTS.listItemIconSize
  );
  return Math.max(
    12,
    Math.min(96, Number.isFinite(raw) ? Math.round(raw) : LIST_ELEMENT_DEFAULTS.listItemIconSize)
  );
}

/**
 * สลับกรอบ List iTems: ค่าสี glyph ถัดไป หรือ undefined = ไม่อัปเดตฟิลด์ iconColor
 * (ไม่แตะเมื่อผู้ใช้ตั้งสีจากแผง Icons แล้ว — ไม่ใช่ค่าเริ่มต้นแบบมีกรอบ/ไม่มีกรอบ)
 */
export function listItemGlyphColorAfterFrameToggle(frameEnabled, currentIconColor) {
  const frameless = THEME_PANEL_BASIC_COLOR_SWATCHES[0];
  const framed = LIST_ELEMENT_DEFAULTS.iconColor;
  if (frameEnabled) {
    if (currentIconColor === frameless) return framed;
    return undefined;
  }
  if (
    currentIconColor === undefined ||
    currentIconColor === null ||
    currentIconColor === framed
  ) {
    return frameless;
  }
  return undefined;
}

/**
 * พื้นหลังไอคอนที่ยังไม่ได้กำหนดเอง (#333333 หรือสีขาว) — ใช้เปลี่ยนเป็น Check MainColor
 * เมื่อเปิดกรอบ List iCons (สี glyph ใช้ listItemGlyphColorAfterFrameToggle / mainColor → #ffffff)
 */
export function listIconsIconBgIsDefaultPaletteGray(bg) {
  if (bg == null) return true;
  if (typeof bg !== "string") return false;
  const low = bg.trim().toLowerCase();
  if (low === String(LIST_ELEMENT_DEFAULTS.backgroundColor).toLowerCase()) return true;
  if (low === "#ffffff" || low === "#fff") return true;
  return false;
}

const LIST_ITEM_IMAGE_DEFAULT_BADGE = {
  show: false,
  label: "",
  bold: false,
  position: "tl",
  size: "13",
  variant: "pill",
  textAlign: "center",
  hover: false,
};

/** ฟิลด์รูปต่อแถว — sync กับ ImageElementOffcanvas / mergeListItemImageFromPanel */
export const LIST_ITEM_IMAGE_PATCH_KEYS = [
  "src",
  "aspectRatio",
  "brightness",
  "borderRadius",
  "imageMarginTop",
  "imageMarginBottom",
  "badge",
  "linkEnabled",
  "linkUrl",
  "linkTarget",
  "slideLinkMode",
  "slideVideoEmbed",
];

/** สร้าง payload เปิดแผง Image สำหรับแก้รูปต่อแถว List iMage */
export function sliceListItemImageForPanel(item, elementRoot, itemIndex) {
  const it = item || {};
  return {
    type: "img",
    id: `${elementRoot?.id || "list"}__li${itemIndex}`,
    src: it.src ?? "",
    aspectRatio: it.aspectRatio ?? "auto",
    brightness: it.brightness ?? 0,
    borderRadius: it.borderRadius ?? 12,
    imageMarginTop: it.imageMarginTop ?? IMAGE_MARGIN_TOP_DEFAULT,
    imageMarginBottom: it.imageMarginBottom ?? IMAGE_MARGIN_BOTTOM_DEFAULT,
    badge: it.badge ?? { ...LIST_ITEM_IMAGE_DEFAULT_BADGE },
    linkEnabled: it.linkEnabled,
    linkUrl: it.linkUrl,
    linkTarget: it.linkTarget,
    slideLinkMode:
      it.slideLinkMode === "lightbox" || it.slideLinkMode === "video"
        ? it.slideLinkMode
        : "url",
    slideVideoEmbed:
      typeof it.slideVideoEmbed === "string" ? it.slideVideoEmbed : "",
    __listItemImageEdit: {
      listElementId: elementRoot?.id,
      itemIndex,
    },
  };
}

export function mergeListItemImageFromPanel(item, panelPayload) {
  const img = lodash.pickBy(
    lodash.pick(panelPayload, LIST_ITEM_IMAGE_PATCH_KEYS),
    (v) => v !== undefined
  );
  return { ...item, ...img };
}

/** สร้าง item ใหม่ว่างๆ โดยดึง icon styling จาก element root */
function emptyListItem(index, elementRoot) {
  if (elementRoot?.listImageElement === true) {
    return {
      listText: LIST_IMAGE_DEFAULT_TEXT,
      listAsideText: elementRoot?.listImageCaptionEnabled
        ? LIST_IMAGE_ASIDE_DEFAULT_TEXT
        : "",
      listTextParagraph: null,
      src: "",
      aspectRatio: "auto",
      brightness: 0,
      borderRadius: 12,
      imageMarginTop: IMAGE_MARGIN_TOP_DEFAULT,
      imageMarginBottom: IMAGE_MARGIN_BOTTOM_DEFAULT,
      badge: { ...LIST_ITEM_IMAGE_DEFAULT_BADGE },
      linkEnabled: false,
      linkUrl: "",
      linkTarget: "_self",
      containerSize:
        elementRoot?.containerSize ?? LIST_IMAGE_DEFAULT_CONTAINER_SIZE,
      iconShape: elementRoot?.iconShape ?? LIST_ELEMENT_DEFAULTS.iconShape,
      iconCornerRadius:
        elementRoot?.iconCornerRadius ?? LIST_ELEMENT_DEFAULTS.iconCornerRadius,
    };
  }
  return {
    faIcon: {
      name: LIST_DEFAULT_ICONS[index % LIST_DEFAULT_ICONS.length],
      type: "fas",
    },
    listText: elementRoot?.listIconsElement
      ? LIST_ICONS_DEMO_TEXTS[index % LIST_ICONS_DEMO_TEXTS.length]
      : "Design your own unique website",
    listTextParagraph: null,
    /* inherit shared icon styling จาก element root */
    ...(() => {
      if (elementRoot?.listIconsElement === true) {
        /* List iCons — กรอบเปิด: พื้นหลัง MainColor + glyph #ffffff (คง faIcon ต่อแถว) */
        const iconsFrameOn = elementRoot?.listIconsFrameEnabled === true;
        return {
          backgroundColor: iconsFrameOn
            ? listIconsIconBgIsDefaultPaletteGray(elementRoot?.backgroundColor)
              ? { type: "mainColor", index: 0 }
              : (elementRoot?.backgroundColor ?? { type: "mainColor", index: 0 })
            : (elementRoot?.backgroundColor ?? LIST_ELEMENT_DEFAULTS.backgroundColor),
          backgroundOpacity: iconsFrameOn
            ? 255
            : (elementRoot?.backgroundOpacity ?? LIST_ELEMENT_DEFAULTS.backgroundOpacity),
          iconColor: (() => {
            if (!iconsFrameOn) {
              const rootIcon = elementRoot?.iconColor;
              const next = listItemGlyphColorAfterFrameToggle(false, rootIcon);
              if (next !== undefined) return next;
              return rootIcon ?? LIST_ELEMENT_DEFAULTS.iconColor;
            }
            const rootIcon = elementRoot?.iconColor ?? LIST_ELEMENT_DEFAULTS.iconColor;
            const next = listItemGlyphColorAfterFrameToggle(true, rootIcon);
            return next !== undefined ? next : rootIcon;
          })(),
          borderEnabled: !iconsFrameOn ? false : true,
          iconSize:
            elementRoot?.listIconsIconSize ??
            listIconsFallbackIconSize(elementRoot),
          containerSize:
            elementRoot?.listIconsIconBgWidth ??
            elementRoot?.containerSize ??
            LIST_ELEMENT_DEFAULTS.listIconsIconBgWidth,
          iconShape:
            elementRoot?.listIconsIconShape ??
            elementRoot?.iconShape ??
            LIST_ELEMENT_DEFAULTS.listIconsIconShape,
          iconCornerRadius:
            elementRoot?.listIconsIconCornerRadius ??
            elementRoot?.iconCornerRadius ??
            LIST_ELEMENT_DEFAULTS.listIconsIconCornerRadius,
        };
      }
      /* List iTems / List iMage */
      return {
        backgroundColor:
          elementRoot?.backgroundColor ?? LIST_ELEMENT_DEFAULTS.backgroundColor,
        backgroundOpacity:
          elementRoot?.backgroundOpacity ?? LIST_ELEMENT_DEFAULTS.backgroundOpacity,
        iconColor: (() => {
          if (elementRoot?.listItemIconFrameEnabled === false) {
            const rootIcon = elementRoot?.iconColor;
            const next = listItemGlyphColorAfterFrameToggle(false, rootIcon);
            if (next !== undefined) return next;
            return rootIcon ?? LIST_ELEMENT_DEFAULTS.iconColor;
          }
          return elementRoot?.iconColor ?? LIST_ELEMENT_DEFAULTS.iconColor;
        })(),
        iconSize:
          elementRoot?.iconSize ??
          elementRoot?.listItemIconSize ??
          LIST_ELEMENT_DEFAULTS.listItemIconSize,
        containerSize:
          elementRoot?.containerSize ??
          elementRoot?.listItemIconBgWidth ??
          LIST_ELEMENT_DEFAULTS.listItemIconBgWidth,
        iconShape:
          elementRoot?.iconShape ??
          elementRoot?.listItemIconShape ??
          LIST_ELEMENT_DEFAULTS.iconShape,
        iconCornerRadius:
          elementRoot?.iconCornerRadius ??
          elementRoot?.listItemIconCornerRadius ??
          LIST_ELEMENT_DEFAULTS.iconCornerRadius,
        borderEnabled:
          elementRoot?.listItemIconFrameEnabled === false ? false : true,
      };
    })(),
    iconOpacity:
      elementRoot?.iconOpacity ?? LIST_ELEMENT_DEFAULTS.iconOpacity,
    borderColor:
      elementRoot?.borderColor ?? LIST_ELEMENT_DEFAULTS.borderColor,
    borderOpacity:
      elementRoot?.borderOpacity ?? LIST_ELEMENT_DEFAULTS.borderOpacity,
    borderWidth:
      elementRoot?.borderWidth ?? LIST_ELEMENT_DEFAULTS.borderWidth,
    borderStyle:
      elementRoot?.borderStyle ?? LIST_ELEMENT_DEFAULTS.borderStyle,
    borderPosition:
      elementRoot?.borderPosition ?? LIST_ELEMENT_DEFAULTS.borderPosition,
    iconLayoutAlign:
      elementRoot?.iconLayoutAlign ?? LIST_ELEMENT_DEFAULTS.iconLayoutAlign,
    linkEnabled: false,
    linkUrl: "",
    linkTarget: "_self",
  };
}

/**
 * Normalize/merge ข้อมูล list element
 * - รองรับ legacy (ไม่มี listItems) โดย migrate จาก root-level fields
 * - รองรับทั้ง List Item และ List iCons compound
 */
export function mergeListElement(raw) {

  let items;

  if (Array.isArray(raw?.listItems) && raw.listItems.length > 0) {
    items = lodash.cloneDeep(raw.listItems);
  } else if (raw?.listImageElement === true) {
    items = [
      {
        listText:
          typeof raw?.listText === "string" && raw.listText.trim()
            ? raw.listText
            : raw?.listDescription
              ? `${raw.listTitle || ""}\n${raw.listDescription}`
              : raw?.listTitle || LIST_IMAGE_DEFAULT_TEXT,
        listAsideText: (() => {
          if (typeof raw?.listAsideText === "string" && raw.listAsideText.trim())
            return raw.listAsideText;
          if (typeof raw?.listImageCaption === "string" && raw.listImageCaption.trim())
            return raw.listImageCaption;
          if (raw?.listImageCaptionEnabled) return LIST_IMAGE_ASIDE_DEFAULT_TEXT;
          return "";
        })(),
        listTextParagraph: raw?.listTextParagraph ?? null,
        src: raw?.src ?? "",
        aspectRatio: raw?.aspectRatio ?? "auto",
        brightness: raw?.brightness ?? 0,
        borderRadius: raw?.borderRadius ?? 12,
        imageMarginTop: raw?.imageMarginTop ?? IMAGE_MARGIN_TOP_DEFAULT,
        imageMarginBottom: raw?.imageMarginBottom ?? IMAGE_MARGIN_BOTTOM_DEFAULT,
        badge: raw?.badge ?? { ...LIST_ITEM_IMAGE_DEFAULT_BADGE },
        linkEnabled: raw?.linkEnabled ?? false,
        linkUrl: raw?.linkUrl ?? "",
        linkTarget: raw?.linkTarget ?? "_self",
        containerSize:
          raw?.containerSize ?? LIST_IMAGE_DEFAULT_CONTAINER_SIZE,
        iconShape: raw?.iconShape ?? LIST_ELEMENT_DEFAULTS.iconShape,
        iconCornerRadius:
          raw?.iconCornerRadius ?? LIST_ELEMENT_DEFAULTS.iconCornerRadius,
      },
    ];
  } else {
    /* Legacy migration: สร้าง item เดียวจาก root-level fields */
    items = [
      {
        faIcon: raw?.faIcon ?? { name: "faShieldHalved", type: "fas" },
        listText:
          typeof raw?.listText === "string" && raw.listText.trim()
            ? raw.listText
            : raw?.listDescription
              ? `${raw.listTitle || ""}\n${raw.listDescription}`
              : raw?.listTitle || LIST_DEMO_TEXTS[0],
        listTextParagraph: raw?.listTextParagraph ?? null,
        backgroundColor:
          raw?.backgroundColor ?? LIST_ELEMENT_DEFAULTS.backgroundColor,
        backgroundOpacity:
          raw?.backgroundOpacity ?? LIST_ELEMENT_DEFAULTS.backgroundOpacity,
        iconColor: raw?.iconColor ?? LIST_ELEMENT_DEFAULTS.iconColor,
        iconOpacity:
          raw?.iconOpacity ?? LIST_ELEMENT_DEFAULTS.iconOpacity,
        iconSize: raw?.iconSize ?? LIST_ELEMENT_DEFAULTS.iconSize,
        containerSize:
          raw?.containerSize ?? LIST_ELEMENT_DEFAULTS.containerSize,
        iconShape: raw?.iconShape ?? LIST_ELEMENT_DEFAULTS.iconShape,
        iconCornerRadius:
          raw?.iconCornerRadius ?? LIST_ELEMENT_DEFAULTS.iconCornerRadius,
        borderColor:
          raw?.borderColor ?? LIST_ELEMENT_DEFAULTS.borderColor,
        borderOpacity:
          raw?.borderOpacity ?? LIST_ELEMENT_DEFAULTS.borderOpacity,
        borderWidth:
          raw?.borderWidth ?? LIST_ELEMENT_DEFAULTS.borderWidth,
        borderStyle:
          raw?.borderStyle ?? LIST_ELEMENT_DEFAULTS.borderStyle,
        borderPosition:
          raw?.borderPosition ?? LIST_ELEMENT_DEFAULTS.borderPosition,
        iconLayoutAlign:
          raw?.iconLayoutAlign ?? LIST_ELEMENT_DEFAULTS.iconLayoutAlign,
      },
    ];
  }

  /* clamp item count */
  const count = Math.min(
    12,
    Math.max(1, Number(raw?.listItemCount) || items.length)
  );

  /* pad / trim */
  while (items.length < count) items.push(emptyListItem(items.length, raw));
  if (items.length > count) items = items.slice(0, count);

  /* normalize listTextParagraph ของแต่ละ item */
  items = items.map((item) => {
    const tp = item.listTextParagraph;
    return {
      ...item,
      listTextParagraph:
        tp &&
        typeof tp === "object" &&
        Array.isArray(tp.segments) &&
        tp.segments.length > 0
          ? normalizeParagraph(tp)
          : null,
    };
  });

  /* List iMage — ข้อความชิดขวา (listAsideText) ต่อแถว + migrate จาก listImageCaption เดิม */
  if (raw?.listImageElement) {
    const legacy =
      typeof raw.listImageCaption === "string" && String(raw.listImageCaption).trim()
        ? String(raw.listImageCaption).trim()
        : "";
    items = items.map((it, i) => {
      const cur = typeof it.listAsideText === "string" ? it.listAsideText : "";
      const useLegacy = legacy && i === 0 && !String(cur).trim();
      return {
        ...it,
        listAsideText: useLegacy ? legacy : cur,
      };
    });
  }

  const base = {
    ...lodash.omit(raw, [
      "listIconsPerViewDesktop",
      "listIconsPerViewTablet",
      "listIconsPerViewMobile",
    ]),
    listItemCount: items.length,
    listItems: items,
  };

  if (base.listIconsElement === true) {
    const dm = base.listIconsDisplayMode;
    base.listIconsDisplayMode = ["iconText", "icon", "text"].includes(dm)
      ? dm
      : "iconText";
  } else {
    delete base.listIconsDisplayMode;
  }

  if (base.listImageElement !== true) {
    delete base.listImageSplitArrangement;
  } else {
    const sa = base.listImageSplitArrangement;
    base.listImageSplitArrangement = sa === "imageLeft" ? "imageLeft" : "textLeft";
  }

  if (!base.listImageElement && !base.listIconsElement) {
    base.listItemIconFrameEnabled = base.listItemIconFrameEnabled !== false;
    base.listItemIconBgWidth = Math.max(
      28,
      Math.min(
        160,
        Math.round(
          Number(base.listItemIconBgWidth) || LIST_ELEMENT_DEFAULTS.listItemIconBgWidth
        )
      )
    );
    base.listItemIconSize = Math.max(
      12,
      Math.min(
        96,
        Math.round(Number(base.listItemIconSize) || LIST_ELEMENT_DEFAULTS.listItemIconSize)
      )
    );
    base.listItemIconShape = base.listItemIconShape === "rounded" ? "rounded" : "circle";
    base.listItemIconCornerRadius = Math.max(
      0,
      Math.min(
        80,
        Math.round(
          Number(base.listItemIconCornerRadius) ||
            LIST_ELEMENT_DEFAULTS.listItemIconCornerRadius
        )
      )
    );
  } else {
    delete base.listItemIconFrameEnabled;
    delete base.listItemIconBgWidth;
    delete base.listItemIconSize;
    delete base.listItemIconShape;
    delete base.listItemIconCornerRadius;
  }

  base.listItemRowFrameEnabled = base.listItemRowFrameEnabled === true;
  base.listItemRowFrameOpacity = Math.max(
    0,
    Math.min(
      255,
      Math.round(
        Number.isFinite(Number(base.listItemRowFrameOpacity))
          ? Number(base.listItemRowFrameOpacity)
          : LIST_ELEMENT_DEFAULTS.listItemRowFrameOpacity
      )
    )
  );
  base.listItemRowFrameRadius = Math.max(
    0,
    Math.min(
      64,
      Math.round(
        Number.isFinite(Number(base.listItemRowFrameRadius))
          ? Number(base.listItemRowFrameRadius)
          : LIST_ELEMENT_DEFAULTS.listItemRowFrameRadius
      )
    )
  );
  base.listItemRowFrameGlass = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        Number.isFinite(Number(base.listItemRowFrameGlass))
          ? Number(base.listItemRowFrameGlass)
          : LIST_ELEMENT_DEFAULTS.listItemRowFrameGlass
      )
    )
  );

  if (base.listIconsElement === true) {
    base.listIconsFrameEnabled = base.listIconsFrameEnabled === true;
    base.listIconsIconShape = base.listIconsIconShape === "rounded" ? "rounded" : "circle";
    base.listIconsIconCornerRadius = Math.max(
      0,
      Math.min(
        80,
        Math.round(
          Number(base.listIconsIconCornerRadius) ||
            LIST_ELEMENT_DEFAULTS.listIconsIconCornerRadius
        )
      )
    );
    base.listIconsIconBgWidth = Math.max(
      28,
      Math.min(
        160,
        Math.round(
          Number(base.listIconsIconBgWidth) || LIST_ELEMENT_DEFAULTS.listIconsIconBgWidth
        )
      )
    );
    base.listIconsIconSize = Math.max(
      12,
      Math.min(
        96,
        Math.round(
          Number(base.listIconsIconSize) || LIST_ELEMENT_DEFAULTS.listIconsIconSize
        )
      )
    );
  } else {
    delete base.listIconsFrameEnabled;
    delete base.listIconsIconShape;
    delete base.listIconsIconCornerRadius;
    delete base.listIconsIconBgWidth;
    delete base.listIconsIconSize;
  }

  if (base.listIconsElement !== true) {
    delete base.listIconsFramedAppearanceSnapshot;
  } else if (base.listIconsFrameEnabled !== true) {
    delete base.listIconsFramedAppearanceSnapshot;
  }

  /* List iCons + กรอบเริ่มต้นเปิด — พื้นหลัง default/ขาว → MainColor, glyph mainColor เดียวกับพื้น → #ffffff (คง faIcon ต่อแถว) */
  if (base.listIconsElement === true && base.listIconsFrameEnabled === true) {
    base.listItems = (base.listItems || []).map((it) => {
      if (!it || it.borderEnabled !== true) return it;
      const patch = {};
      const bgTouchedByPanel = Boolean(it.listIconsBgPanelTouched);
      const glyphTouchedByPanel = Boolean(it.listIconsGlyphPanelTouched);
      if (!bgTouchedByPanel && listIconsIconBgIsDefaultPaletteGray(it.backgroundColor)) {
        patch.backgroundColor = { type: "mainColor", index: 0 };
        patch.backgroundOpacity = 255;
      }
      let nextIcon = glyphTouchedByPanel
        ? undefined
        : listItemGlyphColorAfterFrameToggle(true, it.iconColor);
      const effectiveBgForGlyphContrast = bgTouchedByPanel
        ? it.backgroundColor
        : listIconsIconBgIsDefaultPaletteGray(it.backgroundColor)
          ? { type: "mainColor", index: 0 }
          : it.backgroundColor;
      const glyphSameAsFill =
        it.iconColor &&
        typeof it.iconColor === "object" &&
        it.iconColor.type === "mainColor" &&
        effectiveBgForGlyphContrast &&
        typeof effectiveBgForGlyphContrast === "object" &&
        effectiveBgForGlyphContrast.type === "mainColor" &&
        Number(it.iconColor.index) === Number(effectiveBgForGlyphContrast.index);
      if (nextIcon === undefined && glyphSameAsFill) {
        nextIcon = LIST_ELEMENT_DEFAULTS.iconColor;
      }
      if (nextIcon !== undefined) patch.iconColor = nextIcon;
      if (Object.keys(patch).length === 0) return it;
      return { ...it, ...patch };
    });
    if (listIconsIconBgIsDefaultPaletteGray(base.backgroundColor)) {
      base.backgroundColor = { type: "mainColor", index: 0 };
    }
    const rootNextIcon = listItemGlyphColorAfterFrameToggle(true, base.iconColor);
    if (rootNextIcon !== undefined) base.iconColor = rootNextIcon;
  }

  if (!raw?.listImageElement) return base;
  const cfs = Number(raw.listImageCaptionFontSize);
  const coy = Number(raw.listImageCaptionOffsetY);
  const capOp = Number(raw.listImageCaptionColorOpacity);
  const listImageCaptionColorOpacity = Number.isFinite(capOp)
    ? Math.min(255, Math.max(0, Math.round(capOp)))
    : Number.isFinite(Number(raw.listTextOpacity))
      ? Math.min(255, Math.max(0, Math.round(Number(raw.listTextOpacity))))
      : LIST_ELEMENT_DEFAULTS.listTextOpacity;
  const listImageCaptionColor =
    raw.listImageCaptionColor !== undefined && raw.listImageCaptionColor !== null
      ? raw.listImageCaptionColor
      : raw.listTextColor !== undefined && raw.listTextColor !== null
        ? raw.listTextColor
        : { type: "textColor", index: 0 };
  return {
    ...lodash.omit(base, ["listImageCaption"]),
    listImageCaptionEnabled: Boolean(raw.listImageCaptionEnabled),
    listImageCaptionFontSize: Math.min(
      28,
      Math.max(10, Number.isFinite(cfs) ? cfs : LIST_IMAGE_DEFAULT_CAPTION_FONT_SIZE)
    ),
    listImageCaptionOffsetY: Math.min(
      32,
      Math.max(-32, Number.isFinite(coy) ? coy : 0)
    ),
    listImageCaptionColor,
    listImageCaptionColorOpacity,
  };
}

/** ข้อมูลที่ส่งเข้า IconElementOffcanvas สำหรับแก้ไขไอคอนต่อ item */
export function sliceListItemIconForPanel(item, elementRoot) {
  const mergedRoot = mergeListElement(elementRoot || {});
  const fromItem = lodash.pick(item || {}, LIST_ITEM_ICON_KEYS);
  const isListIcons = mergedRoot.listIconsElement === true;
  const defaultIconSizeForPanel = listItemsPanelDefaultIconSize(mergedRoot);
  const listItemsDefaults = isListIcons
    ? { iconSize: defaultIconSizeForPanel }
    : {
        iconSize: defaultIconSizeForPanel,
        containerSize: mergedRoot.listItemIconBgWidth,
        iconShape:
          mergedRoot.listItemIconShape === "rounded" ? "rounded" : "circle",
        iconCornerRadius: mergedRoot.listItemIconCornerRadius,
      };
  return mergeIconElement({
    type: "list",
    id: "list-item-icon",
    listIconsElement: isListIcons,
    iconMarginTop: mergedRoot.iconMarginTop ?? 0,
    iconMarginBottom: mergedRoot.iconMarginBottom ?? 0,
    /* shared divider/margin สำหรับ UI ของ offcanvas */
    listDividerEnabled:
      mergedRoot.listDividerEnabled ?? LIST_ELEMENT_DEFAULTS.listDividerEnabled,
    listDividerStyle:
      mergedRoot.listDividerStyle ?? LIST_ELEMENT_DEFAULTS.listDividerStyle,
    listDividerColor:
      mergedRoot.listDividerColor ?? LIST_ELEMENT_DEFAULTS.listDividerColor,
    listDividerOpacity:
      mergedRoot.listDividerOpacity ?? LIST_ELEMENT_DEFAULTS.listDividerOpacity,
    listMarginTop: mergedRoot.listMarginTop ?? LIST_ELEMENT_DEFAULTS.listMarginTop,
    listMarginBottom:
      mergedRoot.listMarginBottom ?? LIST_ELEMENT_DEFAULTS.listMarginBottom,
    borderEnabled: isListIcons
      ? item?.borderEnabled === true || false
      : mergedRoot.listItemIconFrameEnabled === false
        ? false
        : item?.borderEnabled !== false,
    ...listItemsDefaults,
    ...fromItem,
  });
}

/**
 * แยก payload จาก IconElementOffcanvas เป็น per-item และ shared
 * คืนค่า { itemUpdate, sharedUpdate }
 */
export function splitListItemIconPayload(payload) {
  const itemUpdate = lodash.pickBy(
    lodash.pick(payload, LIST_ITEM_ICON_KEYS),
    (v) => v !== undefined
  );
  const sharedUpdate = lodash.pickBy(
    lodash.pick(payload, LIST_SHARED_KEYS),
    (v) => v !== undefined
  );
  return { itemUpdate, sharedUpdate };
}

/** fields ที่ใช้ sync "List" offcanvas */
export function pickListOffcanvasSync(e) {
  return {
    id: e.id,
    type: e.type,
    listItemCount: e.listItemCount,
    listItems: e.listItems,
    listDividerEnabled: e.listDividerEnabled,
    listDividerStyle: e.listDividerStyle,
    listDividerColor: e.listDividerColor,
    listDividerOpacity: e.listDividerOpacity,
    listVerticalTimelineDivider: e.listVerticalTimelineDivider,
    listItemsIconAlign: e.listItemsIconAlign,
    listMarginTop: e.listMarginTop,
    listMarginBottom: e.listMarginBottom,
    listItemRowGap: e.listItemRowGap,
    listTextColor: e.listTextColor,
    listTextOpacity: e.listTextOpacity,
    listTextSize: e.listTextSize,
    listIconsAlign: e.listIconsAlign,
    listIconsLayout: e.listIconsLayout,
    listIconsDisplayMode: e.listIconsDisplayMode,
    listImageSplitArrangement: e.listImageSplitArrangement,
    listIconsElement: e.listIconsElement,
    listImageElement: e.listImageElement,
    listIconTextGapPx: e.listIconTextGapPx,
    listImageCaptionEnabled: e.listImageCaptionEnabled,
    listImageCaptionFontSize: e.listImageCaptionFontSize,
    listImageCaptionOffsetY: e.listImageCaptionOffsetY,
    listImageCaptionColor: e.listImageCaptionColor,
    listImageCaptionColorOpacity: e.listImageCaptionColorOpacity,
    listItemIconFrameEnabled: e.listItemIconFrameEnabled,
    listItemIconShape: e.listItemIconShape,
    listItemIconCornerRadius: e.listItemIconCornerRadius,
    listItemIconBgWidth: e.listItemIconBgWidth,
    listItemIconSize: e.listItemIconSize,
    listItemRowFrameEnabled: e.listItemRowFrameEnabled,
    listItemRowFrameColor: e.listItemRowFrameColor,
    listItemRowFrameOpacity: e.listItemRowFrameOpacity,
    listItemRowFrameRadius: e.listItemRowFrameRadius,
    listItemRowFrameGlass: e.listItemRowFrameGlass,
    listIconsFrameEnabled: e.listIconsFrameEnabled,
    listIconsIconShape: e.listIconsIconShape,
    listIconsIconCornerRadius: e.listIconsIconCornerRadius,
    listIconsIconBgWidth: e.listIconsIconBgWidth,
    listIconsIconSize: e.listIconsIconSize,
    listIconsFramedAppearanceSnapshot: e.listIconsFramedAppearanceSnapshot,
  };
}
