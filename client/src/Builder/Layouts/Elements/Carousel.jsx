import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight, CircleFadingPlus, Image as ImageIcon, Play } from "lucide-react";
import SegmentedRichText from "../../richText/SegmentedRichText";
import Icon from "./Icon";
import ImageBadge from "./ImageBadge";
import { opacity_2_hex, setColor } from "../../../../function";
import {
  IMAGE_BRIGHTNESS_DEFAULT,
  imageBrightnessFilterStyle,
  imageCornerRadiusStyle,
  normalizeImageCornerRadius,
} from "./imageAspectConfig";
import { normalizeParagraph } from "../../richText/richTextParagraphModel";
import {
  CAROUSEL_IMAGE_TEXT_CAPTION_DEMO,
  mergeCarouselElement,
  sliceSlideIconForPanel,
} from "./carouselElementConfig";
import { usePanelPreview } from "../../panelPreviewStore";
import { useBuilderContextStore } from "../../store/builderContextStore";

/** ข้อความ placeholder จากค่าเริ่มต้นรายการไอเทม — แสดงบนแคนวาสเป็น demo caption แทน */
const ITEM_CAPTION_PLACEHOLDER_RE = /^iTem\s*-\s*\d+$/i;

function plainTextFromCaptionParagraph(cp) {
  if (!cp || !Array.isArray(cp.segments) || cp.segments.length < 1) return "";
  return cp.segments
    .map((seg) => (seg && seg.text != null ? String(seg.text) : ""))
    .join("")
    .trim();
}

/** เฉพาะแคนวาส builder: รูปภาพ+ข้อความ / ไอคอน+ข้อความ แสดง demo แทน iTem-n */
function captionParagraphForCanvasDisplay(
  slide,
  variant,
  isBuilderCanvas
) {
  const cp = slide?.captionParagraph;
  if (
    !isBuilderCanvas ||
    (variant !== "image_text" && variant !== "icon_text") ||
    !cp
  ) {
    return cp;
  }
  const plain = plainTextFromCaptionParagraph(cp);
  if (!ITEM_CAPTION_PLACEHOLDER_RE.test(plain)) return cp;
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

const variantShowsImage = (v) => v === "image" || v === "image_text";

/** reference เสถียร — ถ้า return [] ใหม่ทุกครั้ง Embla จะเห็นว่า plugins เปลี่ยนแล้ว reset */
const NO_EMBLA_PLUGINS = [];

/** คง index สไลด์ล่าสุดต่อ element — กรณี Embla viewport ถูก destroy/re-create เมื่อ parent re-render (hover คอลัมน์อื่น ฯลฯ) */
const lastCarouselSnapByElementId = new Map();

/** maxSnapIndex = จำนวน bullet − 1 = ceil(n / perView) − 1 (โหมดเลื่อนทีละหน้า) */
function readClampedSnapFromMap(id, maxSnapIndex) {
  if (!id || maxSnapIndex < 0) return 0;
  const raw = lastCarouselSnapByElementId.get(id);
  const max = Math.max(0, Math.floor(maxSnapIndex));
  if (typeof raw !== "number" || !Number.isFinite(raw)) return 0;
  return Math.max(0, Math.min(Math.floor(raw), max));
}

function perViewForDevice(device, s) {
  if (device === "Mobile") return s.carouselPerViewMobile;
  if (device === "Tablet") return s.carouselPerViewTablet;
  return s.carouselPerViewDesktop;
}

/** สีจุด/ลูกศร carousel — รองรับ hex หรืออ้างอิงธีม { type, index } + opacity 0–255 */
function resolveCarouselNavVisualColor(
  theme,
  raw,
  fallback = "#e2e8f0",
  opacity = 255
) {
  const op = Number.isFinite(Number(opacity))
    ? Math.max(0, Math.min(255, Math.round(Number(opacity))))
    : 255;
  const src = raw == null || raw === "" ? fallback : raw;
  if (typeof src === "string") {
    return src + opacity_2_hex(op);
  }
  if (
    typeof src === "object" &&
    src.type &&
    theme?.[src.type] &&
    theme[src.type][src.index] != null
  ) {
    return setColor(theme, src, op);
  }
  return typeof fallback === "string"
    ? fallback + opacity_2_hex(op)
    : fallback;
}

const Carousel = ({
  elementData: rawElementData,
  selected,
  hover,
  builderMode: builderModeProp,
  device: deviceProp = "Desktop",
  isSiteRuntime = false,
  /** false = แคนวาส builder — ไม่เล่น autoplay; หน้าเผยแพร่ส่ง true เมื่อต้องการ autoplay */
  allowAutoplay = false,
  theme,
  animationForElement = "transition-all duration-200 ease-in-out will-change-transform",
  editorHoverMeta,
}) => {
  const panelPreview = usePanelPreview("crl", rawElementData?.id);
  const storeDevice = useBuilderContextStore((state) => state.device);
  const storeBuilderMode = useBuilderContextStore((state) => state.builderMode);
  const device = isSiteRuntime
    ? deviceProp
    : storeDevice || deviceProp || "Desktop";
  const builderMode = isSiteRuntime
    ? builderModeProp
    : storeBuilderMode || builderModeProp;
  const isCompactDevice = device !== "Desktop";
  const isMobile = device === "Mobile";
  const elementData = panelPreview
    ? { ...rawElementData, ...panelPreview }
    : rawElementData;
  const s = mergeCarouselElement(elementData);
  const slides = s.carouselSlides || [];
  const perView = perViewForDevice(device, s);
  const pv = Math.max(1, perView);
  /** จำนวน “หน้า” สำหรับ bullet = ceil(จำนวนสไลด์ / จำนวนที่แสดง) — เศษสุดท้ายเป็นหน้าสั้น (เช่น 5÷2=3 หน้า) */
  const pageCount =
    slides.length < 1 ? 0 : Math.max(1, Math.ceil(slides.length / pv));
  const maxSnapIdx = Math.max(0, pageCount - 1);
  /** อ่านครั้งเดียวต่อเมื่อ id / จำนวนหน้าเปลี่ยน — ใส่เป็น startIndex ให้ Embla เปิดมาที่หน้าที่ถูกต้องทันที ลดเฟรมวูบไป snap 0 */
  const persistedStartIndex = useMemo(
    () => readClampedSnapFromMap(elementData?.id, maxSnapIdx),
    [elementData?.id, maxSnapIdx]
  );
  const slidesToScrollGroup = slides.length > pv ? pv : 1;
  const isEditor = builderMode === "Editor Mode";
  const isLayoutMode = builderMode === "Layout Mode";
  const useLayoutSelectionFrame = isLayoutMode && selected;
  /** บนแคนวาส builder ปิด loop — โหมด loop โคลน DOM ทำให้ดับเบิลคลิก/เลขสไลด์ผิดคู่และ hover แล้ว reInit กระพริบ */
  const isBuilderCanvas = isEditor || isLayoutMode;
  /** loop เปิดเมื่อมีสไลด์พอ — ต้องใส่ margin หลังสไลด์สุดท้ายด้วย ไม่งั้นโคลนสไลด์แรกติดกับสไลด์จริงสุดท้าย */
  const useLoop = slides.length > pv * 2 && !isBuilderCanvas;
  const gap = s.carouselGap;
  const variant = s.carouselVariant || "image";

  const plugins = useMemo(() => {
    if (!allowAutoplay || !s.carouselAutoplay) return NO_EMBLA_PLUGINS;
    return [
      Autoplay({
        delay: s.carouselAutoplayDelayMs,
        stopOnInteraction: true,
        stopOnMouseEnter: true,
      }),
    ];
  }, [allowAutoplay, s.carouselAutoplay, s.carouselAutoplayDelayMs]);

  /** ห้ามสร้าง object ใหม่ทุก render — parent (เช่น Column mouseleave → setHover) re-render แล้ว Embla จะ reset ไปสไลด์แรก */
  const emblaOptions = useMemo(
    () => {
      void slides.length;
      void pv;
      return {
        align: "start",
        loop: useLoop,
        startIndex: persistedStartIndex,
        /** trimSnaps ทำให้ snap สุดท้องชิดแล้ว flex gap ระหว่างสไลด์ที่เห็นหายไป — ปิดเพื่อคงระยะห่าง */
        containScroll: false,
        slidesToScroll: slidesToScrollGroup,
        /** แคนวาส builder: ปิดลากสไลด์ — ไม่งั้น drag handler แย่ง pointer ทำให้ดับเบิลคลิกแก้รูป/ข้อความใช้ได้แค่หน้าแรก */
        watchDrag: !isBuilderCanvas,
      };
    },
    [
      slides.length,
      pv,
      slidesToScrollGroup,
      useLoop,
      isBuilderCanvas,
      persistedStartIndex,
    ]
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions, plugins);

  const [selectedIdx, setSelectedIdx] = useState(() =>
    readClampedSnapFromMap(
      elementData?.id,
      Math.max(
        0,
        (() => {
          const n = (elementData?.carouselSlides || []).length;
          const p = Math.max(
            1,
            perViewForDevice(device, mergeCarouselElement(elementData))
          );
          return n < 1 ? 0 : Math.ceil(n / p) - 1;
        })()
      )
    )
  );
  /** กัน event select ระหว่าง reInit / scrollTo (snap=0 ชั่วคราว) เขียน state แล้ว bullet กระพริบ */
  const suppressPersistRef = useRef(false);

  const scrollToPersisted = useCallback(
    (api) => {
      if (!api || slides.length < 1) return;
      const id = elementData?.id;
      const saved = readClampedSnapFromMap(id, maxSnapIdx);
      const cur = api.selectedScrollSnap();
      if (cur === saved) {
        setSelectedIdx(saved);
        return;
      }
      suppressPersistRef.current = true;
      api.scrollTo(saved, true);
      setSelectedIdx(saved);
      if (id != null) lastCarouselSnapByElementId.set(id, saved);
      queueMicrotask(() => {
        suppressPersistRef.current = false;
      });
    },
    [elementData?.id, slides.length, maxSnapIdx]
  );

  const persistSnapFromApi = useCallback(() => {
    if (!emblaApi || suppressPersistRef.current) return;
    let idx = emblaApi.selectedScrollSnap();
    idx = Math.max(0, Math.min(idx, maxSnapIdx));
    const id = elementData?.id;
    if (id != null) lastCarouselSnapByElementId.set(id, idx);
    setSelectedIdx(idx);
  }, [emblaApi, elementData?.id, maxSnapIdx]);

  useEffect(() => {
    if (!emblaApi) return;
    /** ห้ามเรียก persist ก่อน scrollToPersisted — instance ใหม่อ่าน snap ได้ 0 แล้วทับ Map ที่เคยเป็น 2 */
    emblaApi.on("select", persistSnapFromApi);
    return () => {
      emblaApi.off("select", persistSnapFromApi);
    };
  }, [emblaApi, persistSnapFromApi]);

  /**
   * ซิงก์หลัง init / reInit ของ Embla เท่านั้น — ไม่ยิง scrollTo ซ้ำทุก render (ทำให้กระพริบ)
   * ไม่เรียก reInit มือ: hook จะ reInit เองเมื่อ options เปลี่ยน
   */
  useEffect(() => {
    if (!emblaApi) return;
    const sync = () => scrollToPersisted(emblaApi);
    emblaApi.on("init", sync);
    emblaApi.on("reInit", sync);
    return () => {
      emblaApi.off("init", sync);
      emblaApi.off("reInit", sync);
    };
  }, [emblaApi, scrollToPersisted]);

  const slideFlexBasis =
    pv <= 1
      ? "100%"
      : `calc((100% - ${gap * (pv - 1)}px) / ${pv})`;

  const navBtnClass =
    s.carouselNavShape === "circle"
      ? `rounded-full p-0 ${isMobile ? "h-8 w-8" : "h-9 w-9"}`
      : `rounded-md ${isMobile ? "h-8 min-w-[2rem] px-1.5" : "h-9 min-w-[2.25rem] px-2"}`;

  const captionCanvasBlock =
    isLayoutMode ? "pointer-events-none select-none" : "";
  const defaultCaptionColor = useMemo(
    () => setColor(theme, theme?.textColor?.[0], 255),
    [theme]
  );
  const canClickSlideImage =
    isEditor && (variant === "image" || variant === "image_text");
  const canClickSlideIcon = isEditor && variant === "icon_text";
  /** Canvas builder — ไม่แสดงลูกศรซ้าย/ขวา (ใช้ bullet อย่างเดียว); หน้าเผยแพร่ไม่ส่ง builderMode จะยังมีลูกศร */
  const hideEdgeArrowsOnCanvas =
    builderMode === "Editor Mode" || builderMode === "Layout Mode";

  /**
   * โหมดรูป / รูป+ข้อความ — ห้ามใส่ rounded-lg ที่กรอบนอก: มันบังคับมุมบนค้างแม้ความโค้งรูป = 0
   * มุมมนจาก slide.borderRadius อยู่ที่กล่องรูป (+ มุมล่าง caption ใน image_text / icon_text)
   * icon_text: ไม่มีกรอบพื้นหลังรอบไอคอน — ระยะไอคอน–ข้อความ 15px ด้วย gap
   * โหมดออกแบบ + เลือกลบ: ไม่ใส่ ring รอบทั้งสไลด์ — ใช้กรอบเฉพาะข้อความ (SegmentedRichText / บล็อก text slide)
   */
  const slideFrameClass =
    variant === "icon_text"
      ? "flex flex-col overflow-hidden gap-[15px]"
      : variant === "image_text" || variant === "image"
        ? "flex flex-col overflow-hidden"
        : "flex flex-col overflow-hidden rounded-lg border border-slate-200/80 bg-white dark:border-white/10 dark:bg-slate-900/40";
  /** สไลด์แบบ text — ไม่มี SegmentedRichText; ใช้สไตล์ลบให้สอดคล้องกับ caption */
  const layoutDeleteTextChrome = selected
    ? !useLayoutSelectionFrame
      ? "rounded-md border border-dashed border-red-400 bg-red-300/10 p-2"
      : ""
    : "";

  return (
    <div
      className="w-full min-w-0 max-w-full"
      style={{
        marginTop: s.carouselMarginTop,
        marginBottom: s.carouselMarginBottom,
      }}
      onMouseEnter={() => hover?.({ id: elementData.id })}
      onMouseLeave={() => hover?.(false)}
    >
      <div
        className={
          useLayoutSelectionFrame
            ? `relative min-w-0 px-0 ${isCompactDevice ? "py-1.5" : "py-2"}`
            : "min-w-0"
        }
      >
        <div
          className={
            useLayoutSelectionFrame
              ? `min-w-0 origin-center transform-gpu transition-transform duration-150 ${
                  isCompactDevice ? "" : "scale-[0.96]"
                }`
              : "min-w-0"
          }
        >
          <div className="relative min-w-0">
            <div className="min-w-0 overflow-hidden" ref={emblaRef}>
              <div className="flex touch-pan-y items-start" style={{ marginLeft: 0 }}>
                {slides.map((slide, i) => {
              const captionDisplayParagraph = captionParagraphForCanvasDisplay(
                slide,
                variant,
                isBuilderCanvas
              );
              const capCorners =
                variant === "image_text" || variant === "icon_text"
                  ? normalizeImageCornerRadius(slide.borderRadius)
                  : null;
              const captionBottomRadiusStyle =
                capCorners != null
                  ? {
                      borderBottomLeftRadius: `${capCorners.bl}px`,
                      borderBottomRightRadius: `${capCorners.br}px`,
                    }
                  : undefined;
              return (
              <div
                key={i}
                className="mb-0 min-w-0 shrink-0 grow-0 pb-0"
                style={{
                  flex: `0 0 ${slideFlexBasis}`,
                  marginRight:
                    i < slides.length - 1 || useLoop ? gap : 0,
                }}
                data-carousel-slide-index={i}
              >
                <div className={slideFrameClass}>
                  {variantShowsImage(variant) && (() => {
                    const isThisImageHovered =
                      isEditor &&
                      editorHoverMeta?.partType === "carousel" &&
                      editorHoverMeta?.partName === "image" &&
                      editorHoverMeta?.itemIndex === String(i);
                    const slideCorners = normalizeImageCornerRadius(slide.borderRadius);
                    const allCornersEqual =
                      slideCorners.tr === slideCorners.tl &&
                      slideCorners.br === slideCorners.tl &&
                      slideCorners.bl === slideCorners.tl;
                    const hoverClipPath = `inset(0 round ${
                      allCornersEqual
                        ? `${slideCorners.tl}px`
                        : `${slideCorners.tl}px ${slideCorners.tr}px ${slideCorners.br}px ${slideCorners.bl}px`
                    })`;
                    return (
                    <div
                      className={`relative w-full overflow-hidden ${
                        variant === "image"
                          ? ""
                          : "bg-slate-100 dark:bg-slate-800"
                      } ${canClickSlideImage ? "cursor-pointer" : ""}`}
                      data-carousel-part="image"
                      style={{
                        aspectRatio: slide.aspectRatio || "16 / 9",
                        ...imageCornerRadiusStyle(
                          slide.borderRadius,
                          slide.aspectRatio || "16 / 9"
                        ),
                        ...(isThisImageHovered
                          ? {
                              clipPath: hoverClipPath,
                              transition: "clip-path .18s ease",
                            }
                          : {}),
                      }}
                      data-carousel-slide-image="1"
                      data-carousel-slide-index={i}
                    >
                      {typeof slide.src === "string" && slide.src.trim() !== "" ? (
                        <img
                          src={slide.src}
                          alt=""
                          className="h-full w-full object-cover"
                          style={{
                            ...imageBrightnessFilterStyle(
                              slide.brightness ?? IMAGE_BRIGHTNESS_DEFAULT
                            ),
                            ...(isThisImageHovered
                              ? {
                                  transform: "scale(1.11)",
                                  transformOrigin: "center",
                                  transition: "transform .18s ease, opacity .18s ease",
                                  opacity: 0.97,
                                }
                              : {}),
                          }}
                          draggable={false}
                          data-carousel-slide-image="1"
                          data-carousel-slide-index={i}
                        />
                      ) : (
                        <div
                          className={`${slide.slideLinkMode === "lightbox" || slide.slideLinkMode === "video" ? "relative" : "flex items-center justify-center"} h-full w-full bg-slate-100 dark:bg-slate-800`}
                          style={isThisImageHovered ? {
                            transform: "scale(1.11)",
                            transformOrigin: "center",
                            transition: "transform .18s ease, opacity .18s ease",
                            opacity: 0.97,
                          } : undefined}
                          data-carousel-slide-image="1"
                          data-carousel-slide-index={i}
                          aria-label={`สไลด์ ${i + 1} — ยังไม่มีรูป`}
                        >
                          <ImageIcon
                            className={`${slide.slideLinkMode === "lightbox" || slide.slideLinkMode === "video" ? `absolute right-[15px] top-[15px] z-[4] ${isMobile ? "h-6 w-6" : "h-8 w-8"}` : isMobile ? "h-8 w-8" : "h-10 w-10"} text-slate-400 dark:text-white/35`}
                            strokeWidth={1.5}
                            aria-hidden
                          />
                        </div>
                      )}
                      {slide.badge && (
                        <div className="pointer-events-none">
                          <ImageBadge
                            badge={slide.badge}
                            aspectRatio={slide.aspectRatio || "16 / 9"}
                            imageBorderRadius={slide.borderRadius}
                            theme={theme}
                            elementType="img"
                          />
                        </div>
                      )}
                      {slide.slideLinkMode === "lightbox" && (
                        <div className="pointer-events-none absolute inset-0 z-[5] grid place-items-center">
                          <div
                            className="grid place-items-center rounded-full"
                            style={{
                              width: "clamp(34px, 14%, 50px)",
                              aspectRatio: "1",
                              backgroundColor: setColor(theme, theme?.mainColor?.[1], 200),
                            }}
                          >
                            <CircleFadingPlus className="h-[60%] w-[60%] text-white" strokeWidth={2} aria-hidden />
                          </div>
                        </div>
                      )}
                      {slide.slideLinkMode === "video" && (
                        <div className="pointer-events-none absolute inset-0 z-[5] grid place-items-center">
                          <div
                            className="grid place-items-center rounded-full"
                            style={{
                              width: "clamp(34px, 14%, 50px)",
                              aspectRatio: "1",
                              backgroundColor: setColor(theme, theme?.mainColor?.[1], 200),
                            }}
                          >
                            <Play className="h-[55%] w-[55%] text-white" strokeWidth={2.2} aria-hidden />
                          </div>
                        </div>
                      )}
                    </div>
                    );
                  })()}
                  {variant === "icon_text" && (
                    <div
                      className={`relative flex w-full min-w-0 max-w-full items-center justify-center ${
                        canClickSlideIcon ? "cursor-pointer" : ""
                      }`}
                      data-carousel-part="icon"
                      data-carousel-slide-icon="1"
                      data-carousel-slide-index={i}
                    >
                      <Icon
                        elementData={{
                          id: `${elementData?.id ?? "crl"}__sl${i}`,
                          type: "icon",
                          ...sliceSlideIconForPanel(slide),
                        }}
                        selected={false}
                        hover={() => {}}
                        theme={theme}
                        builderMode={builderMode}
                      />
                    </div>
                  )}
                  {(variant === "image_text" || variant === "icon_text") && (
                    <div
                      className={`flex min-w-0 flex-col justify-start text-center [overflow-wrap:anywhere] ${
                        isCompactDevice ? "px-2 pb-2" : "px-4 pb-3"
                      } ${
                        variant === "icon_text" ? "pt-0" : isCompactDevice ? "pt-2" : "pt-[11px]"
                      } ${captionCanvasBlock || ""}`}
                      data-carousel-part="caption"
                      style={captionBottomRadiusStyle}
                      data-carousel-slide-caption="1"
                      data-carousel-slide-index={i}
                    >
                      <SegmentedRichText
                        renderSignature={`${elementData?.id ?? ""}|${i}|${JSON.stringify(captionDisplayParagraph ?? null)}`}
                        elementData={{
                          label: "",
                          textParagraph: captionDisplayParagraph,
                        }}
                        themeTextClass={theme?.text?.value}
                        animationClass={animationForElement}
                        selected={!useLayoutSelectionFrame && selected}
                        defaultColor={defaultCaptionColor}
                        defaultFontSizePx={14}
                        verticalMarginPx={0}
                      />
                    </div>
                  )}
                  {variant === "text" && (
                    <div
                      className={`min-w-0 space-y-1 text-left [overflow-wrap:anywhere] ${
                        isCompactDevice ? "px-2 py-2" : "px-3 py-3"
                      } ${layoutDeleteTextChrome}`}
                    >
                      {slide.title ? (
                        <div className="text-sm font-semibold text-slate-800 dark:text-white/90">
                          {slide.title}
                        </div>
                      ) : null}
                      {slide.subtitle ? (
                        <div className="text-xs leading-snug text-slate-600 dark:text-white/70">
                          {slide.subtitle}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
              );
                })}
              </div>
            </div>

            {slides.length > 1 && !hideEdgeArrowsOnCanvas && (
              <>
                <button
                  type="button"
                  aria-label="ก่อนหน้า"
                  className={`absolute left-1 top-1/2 z-[2] -translate-y-1/2 border border-slate-200 bg-white/95 text-slate-700 shadow-sm backdrop-blur-sm transition hover:bg-white dark:border-white/10 dark:bg-slate-900/90 dark:text-white ${navBtnClass}`}
                  style={{
                    color: resolveCarouselNavVisualColor(
                      theme,
                      s.carouselNavActiveColor,
                      "#0d9488",
                      s.carouselNavActiveColorOpacity
                    ),
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    emblaApi?.scrollPrev();
                  }}
                >
                  <ChevronLeft className="mx-auto h-5 w-5" />
                </button>
                <button
                  type="button"
                  aria-label="ถัดไป"
                  className={`absolute right-1 top-1/2 z-[2] -translate-y-1/2 border border-slate-200 bg-white/95 text-slate-700 shadow-sm backdrop-blur-sm transition hover:bg-white dark:border-white/10 dark:bg-slate-900/90 dark:text-white ${navBtnClass}`}
                  style={{
                    color: resolveCarouselNavVisualColor(
                      theme,
                      s.carouselNavActiveColor,
                      "#0d9488",
                      s.carouselNavActiveColorOpacity
                    ),
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    emblaApi?.scrollNext();
                  }}
                >
                  <ChevronRight className="mx-auto h-5 w-5" />
                </button>
              </>
            )}
          </div>

          {pageCount > 1 && (
            <div
              className={`flex min-w-0 justify-center ${
                isCompactDevice
                  ? "flex-nowrap gap-1.5 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                  : "flex-wrap gap-2"
              } ${
                variant === "image"
                  ? isCompactDevice
                    ? "mt-3"
                    : "mt-5"
                  : isCompactDevice
                    ? "mt-2"
                    : "mt-3"
              }`}
            >
              {Array.from({ length: pageCount }, (_, pageIdx) => {
                const active = pageIdx === selectedIdx;
                return (
                  <button
                    key={pageIdx}
                    type="button"
                    aria-label={`ไปหน้า ${pageIdx + 1} จาก ${pageCount} (${pv} สไลด์ต่อหน้า)`}
                    className={`transition-none ${s.carouselNavShape === "circle" ? "h-3 w-3 rounded-full" : "h-2 w-4 rounded-sm"}`}
                    style={{
                      backgroundColor: active
                        ? resolveCarouselNavVisualColor(
                            theme,
                            s.carouselNavActiveColor,
                            "#0d9488",
                            s.carouselNavActiveColorOpacity
                          )
                        : resolveCarouselNavVisualColor(
                            theme,
                            s.carouselNavColor,
                            "#e2e8f0",
                            s.carouselNavColorOpacity
                          ),
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      emblaApi?.scrollTo(pageIdx);
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
        {useLayoutSelectionFrame && (
          <>
            <div className="pointer-events-none absolute left-[-2px] right-[-2px] top-[1px] bottom-[1px] rounded-md bg-red-300/10" />
            <span className="pointer-events-none absolute left-[-1px] top-[2px] h-2.5 w-2.5 border-l-2 border-t-2 border-red-400" />
            <span className="pointer-events-none absolute right-[-1px] top-[2px] h-2.5 w-2.5 border-r-2 border-t-2 border-red-400" />
            <span className="pointer-events-none absolute bottom-[2px] left-[-1px] h-2.5 w-2.5 border-b-2 border-l-2 border-red-400" />
            <span className="pointer-events-none absolute bottom-[2px] right-[-1px] h-2.5 w-2.5 border-b-2 border-r-2 border-red-400" />
          </>
        )}
      </div>
    </div>
  );
};

export default Carousel;
