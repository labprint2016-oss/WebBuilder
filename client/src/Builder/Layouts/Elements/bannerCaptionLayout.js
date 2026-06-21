/** ช่วงค่า slider เลื่อนขึ้น-ลง / ซ้าย-ขวา */
export const BANNER_CAPTION_SLIDE_MIN = -100;
export const BANNER_CAPTION_SLIDE_MAX = 100;

/** เลยขอบรูปเล็กน้อย (px) — แกน เลื่อนซ้าย-ขวา ที่สุดขอบ (ใช้แนวตั้งเท่านั้น) */
export const BANNER_CAPTION_EDGE_BLEED_PX = 2;

/**
 * แนวนอน: ยื่นนอกขอบรูปสูงสุด (% ของขนาดรูป) ทั้งแนวตั้งและแนวนอน
 * slide = ±100 → ยื่น ±POKE_PCT เหนือ/ใต้ หรือ ซ้าย/ขวา
 * สูตร: pct = 50 ± slide × (50 + POKE_PCT) / 100
 */
export const BANNER_CAPTION_HORIZONTAL_POKE_PCT = 10;

/** ตำแหน่งแถบข้อความ Banner */
export const BANNER_CAPTION_EDGE_OPTIONS = [
  { value: "bottom", label: "แนวนอน" },
  { value: "left", label: "แนวตั้งด้านซ้าย" },
  { value: "right", label: "แนวตั้งด้านขวา" },
];

export function normalizeBannerCaptionEdge(v) {
  if (v === "left" || v === "right") return v;
  return "bottom";
}

/** ค่าเริ่มต้น slider เลื่อนขึ้น-ลง */
export function defaultBannerCaptionSlideVertical() {
  return 0;
}

/**
 * ค่าเริ่มต้นของ caption เมื่อเปลี่ยนตำแหน่ง (หรือสร้าง Banner ใหม่)
 * ปรับที่นี่ที่เดียว — ใช้ใน cycleBannerCaptionEdge และ Server/element.js
 */
export const BANNER_CAPTION_DEFAULTS_BY_EDGE = {
  bottom: {
    bannerCaptionSlideVertical: -75,
    bannerCaptionSlideHorizontal: 0,
    bannerCaptionFontSize: 40,
  },
  left: {
    bannerCaptionSlideVertical: 0,
    bannerCaptionSlideHorizontal: -80,
    bannerCaptionFontSize: 40,
  },
  right: {
    bannerCaptionSlideVertical: 0,
    bannerCaptionSlideHorizontal: 80,
    bannerCaptionFontSize: 40,
  },
};

function clampBannerCaptionSlide(slideRaw) {
  const s = Number(slideRaw);
  if (!Number.isFinite(s)) return defaultBannerCaptionSlideVertical();
  return Math.min(BANNER_CAPTION_SLIDE_MAX, Math.max(BANNER_CAPTION_SLIDE_MIN, s));
}

/**
 * แนวนอน: คำนวณตำแหน่ง % เชิงเส้น
 *   slide +100 → -POKE_PCT%  (เหนือรูป / ซ้ายของรูป)
 *   slide    0 →       50%   (กึ่งกลาง)
 *   slide -100 → 100+POKE_PCT%  (ใต้รูป / ขวาของรูป)
 * ใช้ทั้ง top (ขึ้น-ลง) และ left (ซ้าย-ขวา)
 */
function linearPct(slide) {
  const half = 50 + BANNER_CAPTION_HORIZONTAL_POKE_PCT; // 60 ด้วยค่า default
  return 50 - (slide / 100) * half;
}

/**
 * แถบยื่นออกนอกกรอบรูป → ต้อง overflow-visible บน wrapper
 * ประมาณตามความสูง/ความกว้างแถบ ≈ 15–20% (generous threshold)
 * ใช้ได้ทุก edge
 */
export function bannerCaptionHorizontalBleedsOutsideFrame(
  edgeRaw,
  slideVerticalRaw,
  slideHorizontalRaw = 0
) {
  const edge = normalizeBannerCaptionEdge(edgeRaw);
  const sH = clampBannerCaptionSlide(slideHorizontalRaw);
  const left = linearPct(-sH); // slideH +100 = ขวา → invert sign

  if (edge === "bottom") {
    const sV = clampBannerCaptionSlide(slideVerticalRaw);
    const top = linearPct(sV);
    return top < 20 || top > 80 || left < 20 || left > 80;
  }

  // แนวตั้ง: ตรวจเฉพาะแกนซ้าย-ขวา (แกนขึ้น-ลงใช้ระบบเดิม ไม่ยื่นนอก)
  return left < 20 || left > 80;
}

/**
 * แถบข้อความ Banner
 *
 * แนวนอน (bottom):
 *   ทั้งแนวตั้งและแนวนอนใช้สูตรเชิงเส้นเดียวกัน
 *   midRow ยึดจุด (leftPct%, topPct%) แล้ว translate(-50%, -50%)
 *   → strip auto-width, ตำแหน่ง % ของขนาดรูป ไม่ขยับเมื่อ aspect ratio เปลี่ยน
 *
 * แนวตั้ง (left / right):
 *   -100 / +100 = ขอบล่าง/บนของกล่องข้อความชิดขอบรูป (ตรรกะเดิม)
 */
export function getBannerCaptionLayout(edgeRaw, slideVerticalPx, slideHorizontalPx) {
  const edge = normalizeBannerCaptionEdge(edgeRaw);
  const slide = clampBannerCaptionSlide(slideVerticalPx);

  const slideHRaw = Number(slideHorizontalPx);
  const slideH = Number.isFinite(slideHRaw)
    ? Math.min(BANNER_CAPTION_SLIDE_MAX, Math.max(BANNER_CAPTION_SLIDE_MIN, slideHRaw))
    : 0;

  const motionFrameClass =
    "pointer-events-none absolute inset-0 z-[8] min-h-0 min-w-0";

  let spacerLeftStyle = { flexGrow: 0, flexShrink: 0, flexBasis: 0, minWidth: 0 };
  let spacerRightStyle = { flexGrow: 0, flexShrink: 0, flexBasis: 0, minWidth: 0 };
  let midRowStyle;
  let midRowClass = "flex min-h-0 min-w-0 ";
  let stripClass = "flex min-w-0 leading-none text-white ";
  const stripStyle = {};
  let innerClass = "flex min-w-0 ";
  let captionSpanClass;
  let captionSpanStyle;

  if (edge === "bottom") {
    /* ── แนวนอน ── เชิงเส้นทั้งสองแกน ── */
    const topPct = linearPct(slide);
    // slideH +100 = ขวา → left เพิ่ม → ใช้ลบ sign เพื่อให้ +100 = ขวา
    const leftPct = linearPct(-slideH);

    midRowStyle = {
      position: "absolute",
      left: `${leftPct}%`,
      top: `${topPct}%`,
      transform: "translate(-50%, -50%)",
      minWidth: 0,
    };

    midRowClass += "items-center ";
    stripClass += "flex-row items-center justify-center px-4 py-3 ";
    innerClass += "items-center justify-center ";
    captionSpanClass = "min-w-0 break-words";
    captionSpanStyle = undefined;
  } else {
    /* ── แนวตั้ง (left / right) ──
     * ขึ้น-ลง: ตรรกะเดิม (top + translateY)
     * ซ้าย-ขวา: เชิงเส้นเหมือนแนวนอน (left: leftPct% + translateX(-50%))
     *   slideH -100 = เลยขอบซ้าย, slideH +100 = เลยขอบขวา
     */
    const pV = (slide + 100) / 200;
    const flushBottom = slide <= BANNER_CAPTION_SLIDE_MIN + 0.75;
    const flushTop = slide >= BANNER_CAPTION_SLIDE_MAX - 0.75;
    const tyPct = (1 - pV) * -100;
    const topPct = (1 - pV) * 100;
    // slideH +100 = ขวา → leftPct เพิ่ม → invert sign ใน linearPct
    const leftPct = linearPct(-slideH);

    midRowStyle = {
      position: "absolute",
      left: `${leftPct}%`,
      top: `${topPct}%`,
      transform: `translate(-50%, ${tyPct}%)`,
      minWidth: 0,
    };

    const stripPadInset = 12;
    midRowClass += "items-stretch ";
    if (edge === "left") {
      stripClass +=
        "min-h-0 flex-col items-stretch justify-center px-3 ";
      stripStyle.paddingTop = flushTop ? 0 : stripPadInset;
      stripStyle.paddingBottom = flushBottom ? 0 : stripPadInset;
    } else {
      stripClass +=
        "min-h-0 flex-col items-end justify-center px-3 ";
      stripStyle.paddingTop = flushTop ? 0 : stripPadInset;
      stripStyle.paddingBottom = flushBottom ? 0 : stripPadInset;
    }
    captionSpanClass = "min-w-0 whitespace-nowrap";
    captionSpanStyle =
      edge === "left"
        ? { transform: "rotate(-270deg)", transformOrigin: "center center" }
        : { transform: "rotate(-90deg)", transformOrigin: "center center" };
  }

  stripClass += "text-center ";

  return {
    motionFrameClass: motionFrameClass.trim(),
    spacerLeftStyle,
    spacerRightStyle,
    midRowClass: midRowClass.trim(),
    midRowStyle,
    stripClass: stripClass.trim(),
    stripStyle,
    innerClass: innerClass.trim().replace(/\s+/g, " "),
    captionSpanClass,
    captionSpanStyle,
  };
}
