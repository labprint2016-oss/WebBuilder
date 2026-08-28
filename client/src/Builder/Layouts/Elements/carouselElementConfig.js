import lodash from "lodash";
import { normalizeParagraph } from "../../richText/richTextParagraphModel";
import { mergeIconElement } from "./iconElementConfig";
import {
  IMAGE_MARGIN_BOTTOM_DEFAULT,
  IMAGE_MARGIN_TOP_DEFAULT,
} from "./imageAspectConfig";

/** ข้อความตัวอย่างใต้รูป (รูปภาพ + ข้อความ) บน Canvas */
export const CAROUSEL_IMAGE_TEXT_CAPTION_DEMO =
  "Design your own unique website";

function createDefaultCaptionParagraph() {
  return normalizeParagraph({
    type: "paragraph",
    alignClass: "text-center",
    segments: [
      {
        text: CAROUSEL_IMAGE_TEXT_CAPTION_DEMO,
        classes: ["font-medium"],
        style: {
          color: "#000000",
          fontSize: "14px",
          lineHeight: "22px",
          letterSpacing: "0px",
        },
      },
    ],
  });
}

export const CAROUSEL_VARIANTS = [
  { value: "image", label: "รูปภาพ" },
  { value: "image_text", label: "รูปภาพ + ข้อความ" },
  { value: "icon_text", label: "ไอคอน + ข้อความ" },
  { value: "text", label: "ข้อความ" },
];

const CAROUSEL_DEFAULT_ICONS = ["faStar", "faHeart", "faLightbulb"];

export const CAROUSEL_ELEMENT_DEFAULTS = {
  carouselVariant: "image_text",
  carouselSlides: Array.from({ length: 6 }, (_, i) => ({
    src: "",
    aspectRatio: "16 / 9",
    borderRadius: 8,
    title: "",
    subtitle: CAROUSEL_IMAGE_TEXT_CAPTION_DEMO,
    faIcon: { name: CAROUSEL_DEFAULT_ICONS[i % 3], type: "fas" },
  })),
  carouselItemCount: 6,
  carouselPerViewDesktop: 3,
  carouselPerViewTablet: 2,
  carouselPerViewMobile: 1,
  carouselGap: 12,
  carouselNavShape: "square",
  /** จุดนำทางเมื่อไม่ active — สีเดิม (neutral) */
  carouselNavColor: "#e2e8f0",
  carouselNavColorOpacity: 255,
  /** จุด active / ลูกศร — สีหลักของธีม (mainColor ตัวที่ 1) */
  carouselNavActiveColor: { type: "mainColor", index: 0 },
  carouselNavActiveColorOpacity: 255,
  carouselAutoplay: false,
  carouselAutoplayDelayMs: 4500,
  carouselMarginTop: 8,
  carouselMarginBottom: 8,
};

const emptySlide = () => ({
  src: "",
  aspectRatio: "16 / 9",
  borderRadius: 8,
  title: "",
  subtitle: "",
  faIcon: { name: "faStar", type: "fas" },
  captionParagraph: createDefaultCaptionParagraph(),
});

export function mergeCarouselElement(raw) {
  const base = lodash.merge({}, CAROUSEL_ELEMENT_DEFAULTS, raw || {});
  const count = Math.min(
    12,
    Math.max(1, Number(base.carouselItemCount) || base.carouselSlides?.length || 6)
  );
  let slides = Array.isArray(base.carouselSlides)
    ? lodash.cloneDeep(base.carouselSlides)
    : [];
  while (slides.length < count) slides.push(emptySlide());
  if (slides.length > count) slides = slides.slice(0, count);
  const variant = base.carouselVariant || "image";
  slides = slides.map((sl) => {
    let cp = sl.captionParagraph;
    if (
      !cp ||
      typeof cp !== "object" ||
      !Array.isArray(cp.segments) ||
      cp.segments.length < 1
    ) {
      const legacy =
        variant === "image_text" || variant === "icon_text"
          ? String(sl.subtitle ?? "").trim()
          : [sl.title, sl.subtitle].filter(Boolean).join("\n").trim();
      const text = legacy || CAROUSEL_IMAGE_TEXT_CAPTION_DEMO;
      cp = normalizeParagraph({
        type: "paragraph",
        alignClass: "text-center",
        segments: [
          {
            text,
            classes: ["font-medium"],
            style: {
              color: "#000000",
              fontSize: "14px",
              lineHeight: "22px",
              letterSpacing: "0px",
            },
          },
        ],
      });
    } else {
      cp = normalizeParagraph(cp);
    }
    if (variant === "image_text" || variant === "icon_text") {
      cp = { ...cp, alignClass: "text-center" };
    }
    return { ...sl, captionParagraph: cp };
  });
  const op255 = (v) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return 255;
    return Math.max(0, Math.min(255, Math.round(n)));
  };

  return {
    ...base,
    carouselItemCount: count,
    carouselSlides: slides,
    carouselPerViewDesktop: Math.min(
      4,
      Math.max(1, Number(base.carouselPerViewDesktop) || 1)
    ),
    carouselPerViewTablet: Math.min(
      3,
      Math.max(1, Number(base.carouselPerViewTablet) || 1)
    ),
    carouselPerViewMobile: Math.min(
      2,
      Math.max(1, Number(base.carouselPerViewMobile) || 1)
    ),
    carouselGap: Math.max(8, Number(base.carouselGap) || 8),
    carouselAutoplayDelayMs: Math.max(
      2000,
      Number(base.carouselAutoplayDelayMs) || 4500
    ),
    carouselNavColorOpacity: op255(base.carouselNavColorOpacity),
    carouselNavActiveColorOpacity: op255(base.carouselNavActiveColorOpacity),
  };
}

export function sliceSlideImageForPanel(slide) {
  if (!slide || typeof slide !== "object") return {};
  return {
    src: slide.src ?? "",
    aspectRatio: slide.aspectRatio ?? "16 / 9",
    brightness: slide.brightness ?? 0,
    borderRadius: slide.borderRadius ?? 8,
    imageMarginTop: slide.imageMarginTop ?? IMAGE_MARGIN_TOP_DEFAULT,
    imageMarginBottom: slide.imageMarginBottom ?? IMAGE_MARGIN_BOTTOM_DEFAULT,
    badge: slide.badge,
    linkEnabled: slide.linkEnabled,
    linkUrl: slide.linkUrl,
    linkTarget: slide.linkTarget,
    slideLinkMode: slide.slideLinkMode,
    slideVideoEmbed: slide.slideVideoEmbed,
  };
}

export function mergeSlideImageFromPanel(slide, panelPayload) {
  const img = lodash.pickBy(
    sliceSlideImageForPanel(panelPayload),
    (v) => v !== undefined
  );
  return {
    ...slide,
    ...img,
  };
}

/** ฟิลด์จากแผงไอคอนที่เก็บในสไลด์ carousel (ไอคอน + ข้อความ) */
const CAROUSEL_SLIDE_ICON_KEYS = [
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
  "linkEnabled",
  "linkUrl",
  "linkTarget",
];

/** ข้อมูลส่งเข้า IconElementOffcanvas เมื่อแก้ไอคอนต่อสไลด์ */
export function sliceSlideIconForPanel(slide) {
  const fromSlide = lodash.pick(slide || {}, CAROUSEL_SLIDE_ICON_KEYS);
  return mergeIconElement({
    type: "icon",
    id: "carousel-slide-icon",
    iconMarginTop: 0,
    iconMarginBottom: 0,
    iconLayoutAlign: "center",
    ...fromSlide,
  });
}

export function mergeSlideIconFromPanel(slide, panelPayload) {
  const picked = lodash.pickBy(
    lodash.pick(panelPayload, CAROUSEL_SLIDE_ICON_KEYS),
    (v) => v !== undefined
  );
  return {
    ...slide,
    ...picked,
    iconMarginTop: 0,
    iconMarginBottom: 0,
  };
}
