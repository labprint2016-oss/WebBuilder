import {
  IMAGE_BRIGHTNESS_DEFAULT,
  IMAGE_CORNER_RADIUS_DEFAULT,
  IMAGE_CORNER_RADIUS_MAX_PX,
} from "./Layouts/Elements/imageAspectConfig";

export const POPUP_ANIMATION_OPTIONS = [
  { value: "none", label: "ไม่มี" },
  { value: "fade-in", label: "ค่อยๆ แสดง" },
  { value: "zoom-in", label: "ซูมเข้า" },
  { value: "slide-in-up", label: "เลื่อนจากล่าง" },
  { value: "slide-in-down", label: "เลื่อนจากบน" },
];

export const DEFAULT_PAGE_POPUP = {
  enabled: false,
  src: "",
  brightness: IMAGE_BRIGHTNESS_DEFAULT,
  borderRadius: IMAGE_CORNER_RADIUS_DEFAULT,
  animationType: "fade-in",
  linkUrl: "",
  /** โหลดทับหน้าเดิมอัตโนมัติ */
  linkTarget: "_self",
};

export function normalizePagePopup(raw) {
  const base = raw && typeof raw === "object" ? raw : {};
  const brightnessRaw = Number(base.brightness);
  const radiusRaw = Number(base.borderRadius);
  const animationType = POPUP_ANIMATION_OPTIONS.some(
    (option) => option.value === base.animationType
  )
    ? base.animationType
    : DEFAULT_PAGE_POPUP.animationType;
  return {
    enabled: base.enabled === true,
    src: typeof base.src === "string" ? base.src : "",
    brightness: Number.isFinite(brightnessRaw)
      ? Math.max(-100, Math.min(100, brightnessRaw))
      : DEFAULT_PAGE_POPUP.brightness,
    borderRadius: Number.isFinite(radiusRaw)
      ? Math.max(0, Math.min(IMAGE_CORNER_RADIUS_MAX_PX, radiusRaw))
      : DEFAULT_PAGE_POPUP.borderRadius,
    animationType,
    linkUrl: typeof base.linkUrl === "string" ? base.linkUrl : "",
    linkTarget: "_self",
  };
}
