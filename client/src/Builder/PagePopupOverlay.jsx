import React, { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import {
  IMAGE_BRIGHTNESS_DEFAULT,
  IMAGE_CORNER_RADIUS_DEFAULT,
  IMAGE_CORNER_RADIUS_MAX_PX,
  imageBrightnessFilterStyle,
  imageCornerRadiusStyle,
} from "./Layouts/Elements/imageAspectConfig";

const POPUP_MIN_PX = 400;
const POPUP_MAX_PX = 600;
const POPUP_CONTENT_DELAY_MS = 500;
const POPUP_ANIMATION_TYPES = new Set([
  "none",
  "fade-in",
  "zoom-in",
  "slide-in-up",
  "slide-in-down",
]);

function normalizePagePopup(raw) {
  const base = raw && typeof raw === "object" ? raw : {};
  const brightnessRaw = Number(base.brightness);
  const radiusRaw = Number(base.borderRadius);
  return {
    enabled: base.enabled === true,
    src: typeof base.src === "string" ? base.src : "",
    brightness: Number.isFinite(brightnessRaw)
      ? Math.max(-100, Math.min(100, brightnessRaw))
      : IMAGE_BRIGHTNESS_DEFAULT,
    borderRadius: Number.isFinite(radiusRaw)
      ? Math.max(0, Math.min(IMAGE_CORNER_RADIUS_MAX_PX, radiusRaw))
      : IMAGE_CORNER_RADIUS_DEFAULT,
    animationType: POPUP_ANIMATION_TYPES.has(base.animationType)
      ? base.animationType
      : "fade-in",
    linkUrl: typeof base.linkUrl === "string" ? base.linkUrl : "",
    linkTarget: "_self",
  };
}

const ANIMATION_CSS = `
@keyframes pagePopupBackdropIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes pagePopupFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes pagePopupZoomIn {
  from { opacity: 0; transform: scale(0.88); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes pagePopupSlideUp {
  from { opacity: 0; transform: translate3d(0, 28px, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}
@keyframes pagePopupSlideDown {
  from { opacity: 0; transform: translate3d(0, -28px, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}
`;

function resolveAnimationName(animationType) {
  switch (animationType) {
    case "zoom-in":
      return "pagePopupZoomIn";
    case "slide-in-up":
      return "pagePopupSlideUp";
    case "slide-in-down":
      return "pagePopupSlideDown";
    case "fade-in":
      return "pagePopupFadeIn";
    case "none":
    default:
      return null;
  }
}

function clampPopupWidth(naturalWidth, viewportWidth) {
  const raw = Number(naturalWidth);
  const base = Number.isFinite(raw) && raw > 0 ? raw : POPUP_MIN_PX;
  const clamped = Math.max(POPUP_MIN_PX, Math.min(POPUP_MAX_PX, Math.round(base)));
  const vwCap = Math.max(280, Math.floor((Number(viewportWidth) || 1200) - 32));
  return Math.min(clamped, vwCap);
}

const POPUP_SEEN_PREFIX = "wb:page-popup:seen:";
/** เวลาตอนหน้าถูก unload (refresh / ปิด tab / ปิด browser) */
const POPUP_PAGEHIDE_KEY = "wb:page-popup:pagehide";
/** ตั้งตอน unload — โหลดรอบถัดไปจะเช็คว่าเป็น refresh หรือ session ใหม่ */
const POPUP_PENDING_CHECK_KEY = "wb:page-popup:check-session";
/**
 * ห่างจาก pagehide เกินนี้ = รอบเปิด browser ใหม่ (ไม่ใช่ refresh)
 * refresh มักโหลดต่อภายในไม่กี่ร้อย ms
 */
const POPUP_NEW_SESSION_GAP_MS = 2500;

const popupSessionKey = (pageId) =>
  `${POPUP_SEEN_PREFIX}${String(pageId || "default")}`;

const clearAllPopupSeenFlags = () => {
  try {
    const keys = [];
    for (let i = 0; i < window.sessionStorage.length; i += 1) {
      const key = window.sessionStorage.key(i);
      if (key && key.startsWith(POPUP_SEEN_PREFIX)) keys.push(key);
    }
    keys.forEach((key) => window.sessionStorage.removeItem(key));
  } catch {
    /* ignore */
  }
};

const markPageHideTimestamp = () => {
  try {
    window.localStorage.setItem(POPUP_PAGEHIDE_KEY, String(Date.now()));
    window.sessionStorage.setItem(POPUP_PENDING_CHECK_KEY, "1");
  } catch {
    /* ignore */
  }
};

/**
 * Chrome มัก restore sessionStorage หลังปิดเปิด browser
 * เช็คเฉพาะหลัง unload: refresh = ช่องว่างสั้น / ปิด browser = ช่องว่างยาว
 */
const syncBrowserPopupSession = () => {
  if (typeof window === "undefined") return;
  try {
    if (window.sessionStorage.getItem(POPUP_PENDING_CHECK_KEY) !== "1") {
      return;
    }
    window.sessionStorage.removeItem(POPUP_PENDING_CHECK_KEY);

    const now = Date.now();
    const lastHide = Number(window.localStorage.getItem(POPUP_PAGEHIDE_KEY) || 0);
    if (!lastHide || now - lastHide > POPUP_NEW_SESSION_GAP_MS) {
      clearAllPopupSeenFlags();
    }
  } catch {
    /* ignore */
  }
};

const hasSeenPopupThisSession = (pageId) => {
  if (typeof window === "undefined") return true;
  try {
    return window.sessionStorage.getItem(popupSessionKey(pageId)) === "1";
  } catch {
    return false;
  }
};

const markPopupSeenThisSession = (pageId) => {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(popupSessionKey(pageId), "1");
  } catch {
    /* ignore */
  }
};

/** ลงทะเบียนครั้งเดียวทั้งแอป — จับตอนหน้าถูก unload */
let pageHideListenerBound = false;
const ensurePageHideListener = () => {
  if (typeof window === "undefined" || pageHideListenerBound) return;
  pageHideListenerBound = true;
  window.addEventListener("pagehide", markPageHideTimestamp);
  window.addEventListener("beforeunload", markPageHideTimestamp);
};

if (typeof window !== "undefined") {
  ensurePageHideListener();
}

/**
 * กัน React Strict Mode (dev) remount แล้วคิดว่าเคยเห็นแล้วจึงไม่โชว์
 * รีเซ็ตเองเมื่อโหลดหน้าใหม่ (module ใหม่)
 */
const showingKeysThisPageLoad = new Set();
const dismissedKeysThisPageLoad = new Set();

/**
 * PopUp หน้าเว็บ — แสดงครั้งเดียวต่อรอบเปิด browser
 * refresh ไม่โชว์ซ้ำ / ปิด browser แล้วเปิดใหม่จึงโชว์อีก
 */
export default function PagePopupOverlay({ pagePopup = null, pageId = "" }) {
  const popup = useMemo(() => normalizePagePopup(pagePopup), [pagePopup]);
  const [showBackdrop, setShowBackdrop] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [displayWidth, setDisplayWidth] = useState(POPUP_MIN_PX);
  const [naturalWidth, setNaturalWidth] = useState(POPUP_MIN_PX);
  const [naturalRatio, setNaturalRatio] = useState(16 / 9);
  const storageKey = String(pageId || "default");

  const dismiss = () => {
    markPopupSeenThisSession(pageId);
    dismissedKeysThisPageLoad.add(storageKey);
    showingKeysThisPageLoad.delete(storageKey);
    setShowBackdrop(false);
    setShowContent(false);
  };

  useEffect(() => {
    ensurePageHideListener();
  }, []);

  useEffect(() => {
    if (!popup.enabled || !popup.src) {
      setShowBackdrop(false);
      setShowContent(false);
      return undefined;
    }

    /* ปิด browser แล้วเปิดใหม่ (ช่องว่างหลัง pagehide ยาว) → เคลียร์ flag */
    syncBrowserPopupSession();

    if (dismissedKeysThisPageLoad.has(storageKey)) {
      setShowBackdrop(false);
      setShowContent(false);
      return undefined;
    }

    const seenBefore = hasSeenPopupThisSession(pageId);
    const showingThisLoad = showingKeysThisPageLoad.has(storageKey);

    /* refresh ใน session เดิม — ไม่แสดงซ้ำ (ยกเว้น remount รอบ Strict Mode) */
    if (seenBefore && !showingThisLoad) {
      setShowBackdrop(false);
      setShowContent(false);
      return undefined;
    }

    showingKeysThisPageLoad.add(storageKey);
    markPopupSeenThisSession(pageId);
    setShowBackdrop(true);
    setShowContent(false);
    const timer = setTimeout(
      () => setShowContent(true),
      POPUP_CONTENT_DELAY_MS
    );
    return () => clearTimeout(timer);
  }, [popup.enabled, popup.src, pageId, storageKey]);

  useEffect(() => {
    if (!popup.enabled || !popup.src || typeof window === "undefined") return;
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      const nw = Number(img.naturalWidth) || POPUP_MIN_PX;
      const nh = Number(img.naturalHeight) || Math.round((nw * 9) / 16);
      setNaturalWidth(nw);
      setNaturalRatio(nw > 0 && nh > 0 ? nw / nh : 16 / 9);
      setDisplayWidth(clampPopupWidth(nw, window.innerWidth));
    };
    img.onerror = () => {
      if (cancelled) return;
      setNaturalWidth(POPUP_MIN_PX);
      setNaturalRatio(16 / 9);
      setDisplayWidth(clampPopupWidth(POPUP_MIN_PX, window.innerWidth));
    };
    img.src = popup.src;
    return () => {
      cancelled = true;
    };
  }, [popup.enabled, popup.src]);

  useEffect(() => {
    if (!showBackdrop || typeof window === "undefined") return undefined;
    const onResize = () => {
      setDisplayWidth(clampPopupWidth(naturalWidth, window.innerWidth));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [showBackdrop, naturalWidth]);

  if (!showBackdrop || !popup.enabled || !popup.src) return null;

  const height = Math.max(
    1,
    Math.round(displayWidth / Math.max(0.2, naturalRatio))
  );
  const brightnessStyle = imageBrightnessFilterStyle(popup.brightness);
  const cornerStyle = imageCornerRadiusStyle(popup.borderRadius, "auto");
  const animationName = resolveAnimationName(popup.animationType);
  const linkUrl = String(popup.linkUrl || "").trim();
  const hasLink = Boolean(linkUrl);

  const imageNode = (
    <img
      src={popup.src}
      alt=""
      draggable={false}
      className="block h-full w-full object-cover"
      style={{ ...brightnessStyle, ...cornerStyle }}
    />
  );

  return (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="PopUp"
      onClick={dismiss}
      style={{
        animationName: "pagePopupBackdropIn",
        animationDuration: "220ms",
        animationTimingFunction: "ease-out",
        animationFillMode: "both",
      }}
    >
      <style>{ANIMATION_CSS}</style>
      {showContent ? (
        <div
          className="relative"
          style={{
            width: displayWidth,
            height,
            maxWidth: "calc(100vw - 32px)",
            ...(animationName
              ? {
                  animationName,
                  animationDuration: "420ms",
                  animationTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                  animationFillMode: "both",
                }
              : {}),
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            aria-label="ปิด PopUp"
            className="absolute -right-2 -top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[#333333] text-white shadow-md transition hover:bg-black"
            onClick={dismiss}
          >
            <X size={18} strokeWidth={3.5} />
          </button>
          {hasLink ? (
            <a
              href={linkUrl}
              target="_self"
              rel="noopener noreferrer"
              className="block h-full w-full overflow-hidden"
              style={cornerStyle}
            >
              {imageNode}
            </a>
          ) : (
            <div className="h-full w-full overflow-hidden" style={cornerStyle}>
              {imageNode}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
