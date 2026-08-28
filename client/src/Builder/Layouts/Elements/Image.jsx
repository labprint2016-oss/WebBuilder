import {
  IMAGE_ASPECT_DEFAULT,
  IMAGE_BRIGHTNESS_DEFAULT,
  IMAGE_MARGIN_TOP_DEFAULT,
  IMAGE_MARGIN_BOTTOM_DEFAULT,
  imageBrightnessFilterStyle,
  imageCornerRadiusStyle,
  overlayContentTopPx,
  resolveImageLinkAttrs,
} from "./imageAspectConfig";
import {
  BUTTON_STYLE_DEFAULTS,
  getButtonMuiSx,
  getButtonMuiVariant,
  isButtonLinkIconDefined,
} from "./buttonElementConfig";
import {
  ICON_ELEMENT_DEFAULTS,
  mergeIconElement,
  isValidFaIconRef,
  resolveIconBackgroundCss,
  resolveIconGlyphColor,
} from "./iconElementConfig";
import {
  BANNER_CAPTION_SLIDE_MAX,
  BANNER_CAPTION_SLIDE_MIN,
  bannerCaptionHorizontalBleedsOutsideFrame,
  defaultBannerCaptionSlideVertical,
  getBannerCaptionLayout,
} from "./bannerCaptionLayout";
import ImageBadge from "./ImageBadge";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Image as ImagePlaceholderIcon, CircleFadingPlus, Play } from "lucide-react";
import { Button } from "@mui/material";
import { setFont } from "../../../../function";
import { setColor } from "../../../../function";
import IconAwsome from "../../IconAwsome";
import { SegmentedRichTextInner } from "../../richText/SegmentedRichText";
import { migrateLabelToParagraph } from "../../richText/richTextParagraphModel";
import { usePanelPreview } from "../../panelPreviewStore";
import { useBuilderContextStore } from "../../store/builderContextStore";

const hasImageSrc = (s) => typeof s === "string" && s.trim() !== "";
const DEFAULT_IMAGE_HOVER_TEXT =
  "Design your own unique website without writing code, and bring your ideas to life with beauty, simplicity, and creativity";
const IMAGE_HOVER_EXTRA_NONE = "none";
const IMAGE_HOVER_EXTRA_ICON = "icon";
const IMAGE_HOVER_EXTRA_BUTTON = "button";

/** ตำแหน่งไอคอนรูป placeholder เมื่อยังไม่มี src — `topRight` ใช้กับ Video/Lightbox */
const Image = ({
  elementData: committedElementData,
  selected,
  hover,
  animationForElement,
  theme,
  overlay = null,
  disableLink = false,
  placeholderIconPosition = "center",
  /** ส่งจาก Element — ใช้กัน <img>/<a> ดักโฟกัส/ลิงก์ใน Layout Mode ให้คลิกไปที่กล่องเลือก + คีย์ลัด */
  builderMode: builderModeProp,
  device: deviceProp = "Desktop",
  isSiteRuntime = false,
  isPanelOpen = false,
  isHoverLocked = false,
  prioritizeLoad = false,
}) => {
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
  const previewType =
    committedElementData?.type === "imgo"
      ? "imgo"
      : committedElementData?.type === "imgh"
        ? "imgh"
        : committedElementData?.type === "bnr"
          ? "bnr"
          : committedElementData?.type === "vid"
            ? "vid"
            : committedElementData?.type === "lbx"
              ? "lbx"
              : "img";
  const panelPreview = usePanelPreview(
    previewType,
    committedElementData?.id || null
  );
  const elementData = panelPreview || committedElementData;
  const {
    src,
    id,
    aspectRatio: arRaw,
    brightness: brRaw,
    borderRadius: radRaw,
  } = elementData;

  const aspectRatio = arRaw || IMAGE_ASPECT_DEFAULT;
  const isPreviewMode = builderMode === "Preview Mode";
  // Reserve image slot in preview when aspect ratio is auto to reduce CLS.
  const previewReservedAspectRatio =
    isPreviewMode && aspectRatio === "auto" ? "16/9" : aspectRatio;
  const brightnessStyle = imageBrightnessFilterStyle(
    brRaw ?? IMAGE_BRIGHTNESS_DEFAULT
  );
  const cornerStyle = imageCornerRadiusStyle(radRaw, previewReservedAspectRatio);

  const isFixed = previewReservedAspectRatio !== "auto";
  const linkAttrsBase = disableLink ? null : resolveImageLinkAttrs(elementData);

  const marginTopRaw = Number(elementData?.imageMarginTop);
  const marginBottomRaw = Number(elementData?.imageMarginBottom);
  const marginTopPx = Number.isFinite(marginTopRaw)
    ? marginTopRaw
    : IMAGE_MARGIN_TOP_DEFAULT;
  const marginBottomPx = Number.isFinite(marginBottomRaw)
    ? marginBottomRaw
    : IMAGE_MARGIN_BOTTOM_DEFAULT;

  const [isHover, setIsHover] = useState(false);

  const isLayoutMode = builderMode === "Layout Mode";
  const layoutPointerBlock = isLayoutMode ? "pointer-events-none" : "";
  const suppressSelectedOverlay = elementData?.__dtsSuppressImageSelectedOverlay === true;
  const selectedOverlayClass =
    typeof elementData?.__selectedOverlayClass === "string" &&
    elementData.__selectedOverlayClass.trim()
      ? elementData.__selectedOverlayClass.trim()
      : "bg-red-500/50";

  const isBanner = elementData?.type === "bnr";
  const isImageHover = elementData?.type === "imgh" || elementData?.type === "imgo";
  const isImageOverlay = elementData?.type === "imgo";
  const isOverlayPendingInit =
    isImageOverlay && elementData?.__overlayPanelInitialized === false;
  const isOverlayPreviewWhilePanelOpen =
    isOverlayPendingInit && Boolean(isPanelOpen);
  const imageHoverBackgroundEnabled = isImageHover
    ? isOverlayPendingInit
      ? isOverlayPreviewWhilePanelOpen
      : elementData?.imageHoverBackgroundEnabled !== false
    : false;
  const imageHoverBackgroundOpacityRaw = Number(
    elementData?.imageHoverBackgroundOpacity
  );
  const imageHoverBackgroundOpacity = Number.isFinite(imageHoverBackgroundOpacityRaw)
    ? Math.max(0, Math.min(255, imageHoverBackgroundOpacityRaw))
    : 255;
  const imageHoverBackgroundColorResolved =
    isImageHover && imageHoverBackgroundEnabled
      ? setColor(
          theme,
          elementData?.imageHoverBackgroundColor ?? { type: "mainColor", index: 0 },
          imageHoverBackgroundOpacity
        ) || "rgba(15,23,42,0.45)"
      : null;
  const imageHoverBackgroundColorTransparent =
    isImageHover && imageHoverBackgroundEnabled
      ? setColor(
          theme,
          elementData?.imageHoverBackgroundColor ?? { type: "mainColor", index: 0 },
          0
        ) || "rgba(15,23,42,0)"
      : null;
  const imageHoverBackgroundGradient =
    isImageHover && imageHoverBackgroundColorResolved && imageHoverBackgroundColorTransparent
      ? `linear-gradient(180deg, ${imageHoverBackgroundColorTransparent} 0%, ${imageHoverBackgroundColorResolved} 100%)`
      : null;
  const imageHoverOverlayBackgroundStyle = isImageOverlay
    ? {
        backgroundColor: "transparent",
        backgroundImage: imageHoverBackgroundGradient || "none",
      }
    : {
        backgroundColor: imageHoverBackgroundColorResolved || "transparent",
        backgroundImage: "none",
      };
  const imageHoverText =
    typeof elementData?.imageHoverText === "string" &&
    elementData.imageHoverText.trim() !== ""
      ? elementData.imageHoverText
      : DEFAULT_IMAGE_HOVER_TEXT;
  const imageHoverParagraph = useMemo(
    () => {
      const tp = elementData?.imageHoverTextParagraph;
      if (tp && Array.isArray(tp.segments) && tp.segments.length > 0) {
        return migrateLabelToParagraph({
          label: imageHoverText,
          textParagraph: tp,
        });
      }
      return migrateLabelToParagraph({
        textParagraph: {
          type: "paragraph",
          alignClass: "text-center",
          segments: [{ text: imageHoverText, classes: [], style: {} }],
        },
      });
    },
    [imageHoverText, elementData?.imageHoverTextParagraph]
  );
  const imageHoverExtras = (() => {
    const raw = Array.isArray(elementData?.imageHoverExtras)
      ? elementData.imageHoverExtras
      : [];

    if (isImageOverlay) {
      // Overlay uses direct toggle logic: checked => show, unchecked => hide
      return raw.filter((v) =>
        [IMAGE_HOVER_EXTRA_NONE, IMAGE_HOVER_EXTRA_ICON, IMAGE_HOVER_EXTRA_BUTTON].includes(v)
      );
    }

    const clean = raw.filter((v) =>
      [IMAGE_HOVER_EXTRA_NONE, IMAGE_HOVER_EXTRA_ICON, IMAGE_HOVER_EXTRA_BUTTON].includes(v)
    );
    if (clean.includes(IMAGE_HOVER_EXTRA_NONE)) {
      return [IMAGE_HOVER_EXTRA_NONE];
    }
    return clean;
  })();
  const showImageHoverIcon = imageHoverExtras.includes(IMAGE_HOVER_EXTRA_ICON);
  const showImageHoverButton = imageHoverExtras.includes(IMAGE_HOVER_EXTRA_BUTTON);
  const hideImagePlaceholderIcon = isImageHover && Boolean(isPanelOpen);
  const imageHoverDefaultIconElement = mergeIconElement({
    type: "icon",
    ...(elementData?.imageHoverIconElement || {}),
  });
  const imageHoverDefaultFaIcon = imageHoverDefaultIconElement.faIcon;
  const showImageHoverDefaultFaIcon = isValidFaIconRef(imageHoverDefaultFaIcon);
  const imageHoverDefaultIconBg = resolveIconBackgroundCss(
    imageHoverDefaultIconElement,
    theme
  );
  const imageHoverDefaultIconColor = resolveIconGlyphColor(
    imageHoverDefaultIconElement,
    theme
  );
  const imageHoverDefaultIconSize =
    Number(imageHoverDefaultIconElement?.iconSize ?? ICON_ELEMENT_DEFAULTS.iconSize) || 28;
  const imageHoverDefaultContainerSize =
    Number(imageHoverDefaultIconElement?.containerSize ?? ICON_ELEMENT_DEFAULTS.containerSize) || 64;
  const imageHoverIconShape =
    imageHoverDefaultIconElement?.iconShape === "rounded" ? "rounded" : "circle";
  const imageHoverIconCornerRadiusRaw = Number(
    imageHoverDefaultIconElement?.iconCornerRadius
  );
  const imageHoverIconCornerRadius = Number.isFinite(imageHoverIconCornerRadiusRaw)
    ? Math.max(0, imageHoverIconCornerRadiusRaw)
    : 12;
  const imageHoverIconBorderRadius =
    imageHoverIconShape === "circle"
      ? "50%"
      : `${Math.min(imageHoverIconCornerRadius, imageHoverDefaultContainerSize / 2)}px`;
  const imageHoverIconMarginTopRaw = Number(imageHoverDefaultIconElement?.iconMarginTop);
  const imageHoverIconMarginTop = Number.isFinite(imageHoverIconMarginTopRaw)
    ? Math.max(0, Math.min(80, imageHoverIconMarginTopRaw))
    : 8;
  const imageHoverIconMarginBottomRaw = Number(
    imageHoverDefaultIconElement?.iconMarginBottom
  );
  const imageHoverIconMarginBottom = Number.isFinite(imageHoverIconMarginBottomRaw)
    ? Math.max(0, Math.min(80, imageHoverIconMarginBottomRaw))
    : 8;
  const imageHoverButtonElement = {
    type: "btn",
    ...BUTTON_STYLE_DEFAULTS,
    label: "Button Click",
    linkIcon: { name: "faShieldHalved", type: "fas" },
    ...(elementData?.imageHoverButtonElement || {}),
  };
  const imageHoverButtonVariant = getButtonMuiVariant(imageHoverButtonElement);
  const imageHoverButtonSx = getButtonMuiSx(
    imageHoverButtonElement,
    theme,
    imageHoverButtonVariant
  );
  const imageHoverButtonLinkIcon = imageHoverButtonElement.linkIcon;
  const showImageHoverButtonIcon = isButtonLinkIconDefined(imageHoverButtonLinkIcon);
  const imageHoverButtonFullWidth = Boolean(imageHoverButtonElement?.buttonFullWidth);
  const imageHoverButtonMarginTopRaw = Number(imageHoverButtonElement?.buttonMarginTop);
  const imageHoverButtonMarginTop = Number.isFinite(imageHoverButtonMarginTopRaw)
    ? Math.max(0, Math.min(80, imageHoverButtonMarginTopRaw))
    : BUTTON_STYLE_DEFAULTS.buttonMarginTop;
  const imageHoverButtonMarginBottomRaw = Number(
    imageHoverButtonElement?.buttonMarginBottom
  );
  const imageHoverButtonMarginBottom = Number.isFinite(
    imageHoverButtonMarginBottomRaw
  )
    ? Math.max(0, Math.min(80, imageHoverButtonMarginBottomRaw))
    : BUTTON_STYLE_DEFAULTS.buttonMarginBottom;
  const imageHoverContentOffsetYRaw = Number(elementData?.imageHoverContentOffsetY);
  const imageHoverContentOffsetY = isOverlayPreviewWhilePanelOpen
    ? 90
    : Number.isFinite(imageHoverContentOffsetYRaw)
      ? Math.max(0, Math.min(100, imageHoverContentOffsetYRaw))
      : 62;
  const imageHoverFrameRef = useRef(null);
  const imageHoverContentRef = useRef(null);
  const imageHoverMetricsRef = useRef({ frameHeight: 0, contentHeight: 0 });
  const imageHoverLastTopPxRef = useRef(5);
  const [imageHoverMetricsTick, setImageHoverMetricsTick] = useState(0);
  const overlayContentInset = isImageOverlay
    ? isMobile
      ? 12
      : isCompactDevice
        ? 8
        : 5
    : 5;
  const isBuilderLayoutMode = builderMode === "Layout Mode";
  const isBuilderEditorMode = builderMode === "Editor Mode";
  const disableHoverPreviewInBuilder =
    isImageHover && imageHoverBackgroundEnabled && isBuilderLayoutMode;
  const showStaticImageHoverBgInBuilder =
    disableHoverPreviewInBuilder && Boolean(isPanelOpen);
  const showStickyImageHoverInEditor =
    isImageHover &&
    imageHoverBackgroundEnabled &&
    isBuilderEditorMode &&
    Boolean(isHoverLocked);
  const disableImageHoverMotion = isBuilderLayoutMode || isImageOverlay;
  const showImageOverlayAlways =
    isImageOverlay && imageHoverBackgroundEnabled;
  const isImageHoverOverlayVisible =
    showImageOverlayAlways ||
    (disableHoverPreviewInBuilder && showStaticImageHoverBgInBuilder) ||
    showStickyImageHoverInEditor;
  useLayoutEffect(() => {
    if (!isImageHover || !imageHoverBackgroundEnabled) return undefined;
    const frameEl = imageHoverFrameRef.current;
    const contentEl = imageHoverContentRef.current;
    if (!frameEl || !contentEl) return undefined;
    const computeMetrics = () => {
      const frameHeight = Number(frameEl.clientHeight) || 0;
      const contentHeight =
        Number(contentEl.offsetHeight) || Number(contentEl.scrollHeight) || 0;
      if (frameHeight <= 0 || contentHeight <= 0) return;
      const prev = imageHoverMetricsRef.current;
      if (
        Math.abs((prev.frameHeight || 0) - frameHeight) < 0.5 &&
        Math.abs((prev.contentHeight || 0) - contentHeight) < 0.5
      ) {
        return;
      }
      imageHoverMetricsRef.current = { frameHeight, contentHeight };
      setImageHoverMetricsTick((v) => v + 1);
    };
    computeMetrics();
    let resizeObserver = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => computeMetrics());
      resizeObserver.observe(frameEl);
      resizeObserver.observe(contentEl);
    }
    if (typeof window !== "undefined") {
      window.addEventListener("resize", computeMetrics);
    }
    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", computeMetrics);
      }
    };
  }, [
    isImageHover,
    imageHoverBackgroundEnabled,
    imageHoverText,
    showImageHoverIcon,
    showImageHoverButton,
    device,
  ]);
  const imageHoverContentTopPx = useMemo(() => {
    void imageHoverMetricsTick;
    const frameHeight = Number(imageHoverMetricsRef.current?.frameHeight) || 0;
    const contentHeight = Number(imageHoverMetricsRef.current?.contentHeight) || 0;
    if (frameHeight <= 0 || contentHeight <= 0) {
      return imageHoverLastTopPxRef.current;
    }
    const nextTop = isImageOverlay
      ? overlayContentTopPx(
          frameHeight,
          contentHeight,
          imageHoverContentOffsetY,
          overlayContentInset
        )
      : overlayContentTopPx(frameHeight, contentHeight, 50);
    imageHoverLastTopPxRef.current = nextTop;
    return nextTop;
  }, [
    imageHoverContentOffsetY,
    imageHoverMetricsTick,
    isImageOverlay,
    overlayContentInset,
  ]);
  const badgeHoverEnabled =
    !isBanner && Boolean(elementData?.badge?.hover);
  const badgeLabelRaw =
    typeof elementData?.badge?.label === "string"
      ? elementData.badge.label.trim()
      : "";
  const showImageBadge = !isBanner && badgeLabelRaw !== "";
  const bannerCaptionRaw =
    typeof elementData?.badge?.label === "string"
      ? elementData.badge.label.trim()
      : "";
  const showBannerCaption = isBanner && bannerCaptionRaw !== "";
  const bannerCaptionFontSizeRaw = Number(elementData?.bannerCaptionFontSize);
  const bannerCaptionFontSizePx = Number.isFinite(bannerCaptionFontSizeRaw)
    ? Math.min(56, Math.max(12, bannerCaptionFontSizeRaw))
    : 48;
  const bannerCaptionLetterSpacingRaw = Number(
    elementData?.bannerCaptionLetterSpacing
  );
  const bannerCaptionLetterSpacingPx = Number.isFinite(
    bannerCaptionLetterSpacingRaw
  )
    ? Math.min(15, Math.max(0, bannerCaptionLetterSpacingRaw))
    : 6;
  const bannerCaptionSlideVerticalRaw = Number(
    elementData?.bannerCaptionSlideVertical
  );
  const bannerCaptionSlideVerticalPx = Number.isFinite(
    bannerCaptionSlideVerticalRaw
  )
    ? Math.min(
        BANNER_CAPTION_SLIDE_MAX,
        Math.max(BANNER_CAPTION_SLIDE_MIN, bannerCaptionSlideVerticalRaw)
      )
    : defaultBannerCaptionSlideVertical();

  const bannerCaptionSlideHorizontalRaw = Number(
    elementData?.bannerCaptionSlideHorizontal
  );
  const bannerCaptionSlideHorizontalPx = Number.isFinite(
    bannerCaptionSlideHorizontalRaw
  )
    ? Math.min(
        BANNER_CAPTION_SLIDE_MAX,
        Math.max(BANNER_CAPTION_SLIDE_MIN, bannerCaptionSlideHorizontalRaw)
      )
    : 0;

  const bannerCaptionLayout = isBanner
    ? getBannerCaptionLayout(
        elementData?.bannerCaptionEdgePosition,
        bannerCaptionSlideVerticalPx,
        bannerCaptionSlideHorizontalPx
      )
    : null;

  const bannerCaptionColorResolved = isBanner
    ? (setColor(theme, elementData?.bannerCaptionTextColor, elementData?.bannerCaptionTextOpacity ?? 255) || "#ffffff")
    : null;

  const bannerSlideLinkMode = isBanner ? (elementData?.slideLinkMode ?? "url") : null;
  const linkAttrs = disableLink ? null : (
    isBanner && bannerSlideLinkMode !== "url"
      ? null
      : linkAttrsBase
  );

  const bannerHorizontalCaptionOverflowVisible =
    isBanner &&
    showBannerCaption &&
    bannerCaptionHorizontalBleedsOutsideFrame(
      elementData?.bannerCaptionEdgePosition,
      bannerCaptionSlideVerticalPx,
      bannerCaptionSlideHorizontalPx
    );

  const placeholderIconTopRight = hideImagePlaceholderIcon ? null : (
    <ImagePlaceholderIcon
      className="pointer-events-none absolute right-[15px] top-[15px] z-[4] h-8 w-8 text-gray-400"
      strokeWidth={1.5}
      aria-hidden
    />
  );

  const placeholder =
    placeholderIconPosition === "topRight" ? (
      isFixed ? (
        <div
          className={`absolute inset-0 bg-gray-100 ${animationForElement}`}
          style={cornerStyle}
          aria-hidden
        >
          {placeholderIconTopRight}
        </div>
      ) : (
        <div
          className={`relative min-h-[260px] w-full bg-gray-100 ${animationForElement}`}
          style={cornerStyle}
          aria-hidden
        >
          {placeholderIconTopRight}
        </div>
      )
    ) : isFixed ? (
      <div
        className={`absolute inset-0 flex items-center justify-center bg-gray-100 ${animationForElement}`}
        style={cornerStyle}
        aria-hidden
      >
        {hideImagePlaceholderIcon ? null : (
          <ImagePlaceholderIcon
            className="h-10 w-10 text-gray-400"
            strokeWidth={1.5}
            aria-hidden
          />
        )}
      </div>
    ) : (
      <div
        className={`flex min-h-[260px] w-full items-center justify-center bg-gray-100 ${animationForElement}`}
        style={cornerStyle}
        aria-hidden
      >
        {hideImagePlaceholderIcon ? null : (
          <ImagePlaceholderIcon
            className="h-10 w-10 text-gray-400"
            strokeWidth={1.5}
            aria-hidden
          />
        )}
      </div>
    );

  const inner = isFixed ? (
    <div
      data-image-frame-id={id}
      data-image-radius-id={id}
      className={`relative w-full overflow-hidden ${animationForElement}`}
      style={{ aspectRatio: previewReservedAspectRatio, ...cornerStyle }}
    >
      {hasImageSrc(src) ? (
        <img
          draggable={false}
          tabIndex={isLayoutMode ? -1 : undefined}
          src={src}
          alt=""
          loading={isPreviewMode ? (prioritizeLoad ? "eager" : "lazy") : undefined}
          fetchPriority={isPreviewMode && prioritizeLoad ? "high" : undefined}
          decoding="async"
          data-image-radius-id={id}
          className={`absolute inset-0 h-full w-full object-cover ${layoutPointerBlock}`}
          style={{ ...brightnessStyle, ...cornerStyle }}
        />
      ) : (
        placeholder
      )}
    </div>
  ) : hasImageSrc(src) ? (
    <img
      draggable={false}
      tabIndex={isLayoutMode ? -1 : undefined}
      src={src}
      alt=""
      loading={isPreviewMode ? (prioritizeLoad ? "eager" : "lazy") : undefined}
      fetchPriority={isPreviewMode && prioritizeLoad ? "high" : undefined}
      decoding="async"
      data-image-frame-id={id}
      data-image-radius-id={id}
      className={`${animationForElement} h-auto w-full ${layoutPointerBlock}`}
      style={{ ...brightnessStyle, ...cornerStyle }}
    />
  ) : (
    placeholder
  );

  return (
    <div
      data-image-wrap-id={id}
      data-image-radius-id={id}
      className={`relative block w-full min-w-0 max-w-full ${
        bannerHorizontalCaptionOverflowVisible
          ? "overflow-visible"
          : "overflow-hidden"
      }${
        badgeHoverEnabled ||
        (isImageHover &&
          imageHoverBackgroundEnabled &&
          !showImageOverlayAlways &&
          !disableHoverPreviewInBuilder)
          ? " group/image-hover"
          : ""
      }`}
      style={{
        ...cornerStyle,
        marginTop: marginTopPx,
        marginBottom: marginBottomPx,
      }}
      onMouseEnter={() => {
        hover?.({ id });
        setIsHover(true);
      }}
      onMouseLeave={() => {
        setIsHover(false);
      }}
      onMouseMove={() => {
        setIsHover(true);
      }}
    >
      {linkAttrs ? (
        <a
          {...linkAttrs}
          className={`block w-full text-inherit no-underline outline-none focus-visible:ring-2 focus-visible:ring-slate-400/50 ${layoutPointerBlock}`}
        >
          {inner}
        </a>
      ) : (
        inner
      )}
      {isImageHover && imageHoverBackgroundEnabled && imageHoverBackgroundColorResolved && (
        <div
          className={`absolute inset-0 z-[6] ${
            disableImageHoverMotion
              ? "transition-none"
              : "transition-opacity duration-150 ease-out"
          } ${
            showImageOverlayAlways
              ? "pointer-events-auto opacity-100"
              : disableHoverPreviewInBuilder
              ? showStaticImageHoverBgInBuilder
                ? "pointer-events-auto opacity-100"
                : "pointer-events-none opacity-0"
              : showStickyImageHoverInEditor
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0 group-hover/image-hover:pointer-events-auto group-hover/image-hover:opacity-100"
          }`}
          style={{
            ...cornerStyle,
          }}
          aria-hidden
        >
          <div
            className={`absolute inset-0 ${
              disableImageHoverMotion
                ? "transition-none"
                : "transition-opacity duration-800 ease-[cubic-bezier(0.22,1,0.36,1)]"
            } ${
              isImageHoverOverlayVisible
                ? "opacity-100"
                : "opacity-0 group-hover/image-hover:opacity-100"
            }`}
            style={{
              ...cornerStyle,
              ...imageHoverOverlayBackgroundStyle,
            }}
          />
          <div
            ref={imageHoverFrameRef}
            data-overlay-frame-id={id}
            data-overlay-inset={overlayContentInset}
            className={`relative h-full w-full min-w-0 ${
              isMobile ? "px-3" : isCompactDevice ? "px-4" : "px-5"
            }`}
          >
            <div
              ref={imageHoverContentRef}
              data-overlay-content-id={id}
              className={`absolute flex min-w-0 flex-col items-center gap-1.5 text-center ${
                isImageOverlay
                  ? isMobile
                    ? "w-full max-w-full"
                    : isCompactDevice
                      ? "w-[94%] max-w-[94%]"
                      : "w-[92%] max-w-[92%]"
                  : isMobile
                    ? "w-[96%] max-w-[96%]"
                    : "w-[92%] max-w-[92%]"
              } ${
                disableImageHoverMotion
                  ? "transition-none"
                  : "transition-all duration-550 ease-[cubic-bezier(0.22,1,0.36,1)]"
              } ${
                isImageHoverOverlayVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-2 group-hover/image-hover:opacity-100 group-hover/image-hover:translate-y-0"
              }`}
              style={{
                left: "50%",
                top: `${imageHoverContentTopPx}px`,
                transform: "translateX(-50%)",
                maxHeight: `calc(100% - ${overlayContentInset * 2}px)`,
                overflow: "hidden",
              }}
            >
              {showImageHoverIcon ? (
                <div
                  data-image-hover-part="icon"
                  className="grid max-w-full place-items-center"
                  style={{
                    width: imageHoverDefaultContainerSize,
                    maxWidth: "100%",
                    aspectRatio: "1 / 1",
                    backgroundColor: imageHoverDefaultIconBg,
                    borderRadius: imageHoverIconBorderRadius,
                    marginTop: imageHoverIconMarginTop,
                    marginBottom: imageHoverIconMarginBottom,
                  }}
                >
                  {showImageHoverDefaultFaIcon ? (
                    <IconAwsome
                      iconName={imageHoverDefaultFaIcon.name}
                      iconType={imageHoverDefaultFaIcon.type}
                      style={{
                        fontSize: imageHoverDefaultIconSize,
                        color: imageHoverDefaultIconColor,
                      }}
                    />
                  ) : null}
                </div>
              ) : null}
              <div
                data-image-hover-part="text"
                className="w-full min-w-0 [overflow-wrap:anywhere]"
                style={{
                  color: "#ffffff",
                }}
              >
                <SegmentedRichTextInner
                  paragraph={imageHoverParagraph}
                  baseClassName={`line-clamp-4 text-[14px] leading-[1.5] ${
                    theme?.text?.value ?? ""
                  }`}
                  baseStyle={{
                    color: "#ffffff",
                    fontFamily: setFont(theme?.text?.value) || undefined,
                  }}
                />
              </div>
              {showImageHoverButton ? (
                <div
                  data-image-hover-part="button"
                  className="max-w-full min-w-0"
                  style={{
                    width: imageHoverButtonFullWidth ? "100%" : "auto",
                    maxWidth: "100%",
                    alignSelf: imageHoverButtonFullWidth ? "stretch" : "center",
                    marginTop: imageHoverButtonMarginTop,
                    marginBottom: imageHoverButtonMarginBottom,
                  }}
                >
                  <Button
                    variant={imageHoverButtonVariant}
                    disableElevation
                    sx={{
                      ...imageHoverButtonSx,
                      maxWidth: "100%",
                      minWidth: 0,
                      fontFamily: setFont(theme?.text?.value) || undefined,
                      pointerEvents: "none",
                    }}
                  >
                    {showImageHoverButtonIcon ? (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          verticalAlign: "middle",
                          marginRight: 6,
                          lineHeight: 0,
                        }}
                      >
                        <IconAwsome
                          iconName={imageHoverButtonLinkIcon.name}
                          iconType={imageHoverButtonLinkIcon.type}
                          style={{ fontSize: "1.05em" }}
                        />
                      </span>
                    ) : null}
                    {imageHoverButtonElement?.label || "Button Click"}
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
  <div className="pointer-events-none">
  {overlay}
  </div>
      

      <div
        className={`pointer-events-none absolute inset-0 z-10 ${
          selected && !suppressSelectedOverlay ? selectedOverlayClass : "hidden"
        }`}
        style={cornerStyle}
      />

      {showImageBadge && (
        <div
          className={`pointer-events-none${
            badgeHoverEnabled
              ? " opacity-0 transition-opacity duration-150 group-hover/image-hover:opacity-100"
              : ""
          }`}
        >
          <ImageBadge
            elementId={id}
            badge={elementData.badge}
            aspectRatio={previewReservedAspectRatio}
            imageBorderRadius={elementData.borderRadius}
            theme={theme}
            elementType={
              elementData?.type === "lbx"
                ? "lbx"
                : elementData?.type === "vid"
                  ? "vid"
                  : "img"
            }
          />
        </div>
      )}
      {isBanner && elementData?.linkEnabled && bannerSlideLinkMode === "lightbox" && (
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
      {isBanner && elementData?.linkEnabled && bannerSlideLinkMode === "video" && (
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
      {showBannerCaption && bannerCaptionLayout && (
        <div className={bannerCaptionLayout.motionFrameClass}>
          <div
            className={bannerCaptionLayout.midRowClass}
            style={bannerCaptionLayout.midRowStyle}
          >
            <div
              aria-hidden
              className="min-h-0 min-w-0 shrink-0"
              style={bannerCaptionLayout.spacerLeftStyle}
            />
            <div
              className={`${bannerCaptionLayout.stripClass} ${
                theme?.textHeading?.value ?? ""
              } ${elementData?.badge?.bold ? "font-bold" : "font-medium"}`}
              style={bannerCaptionLayout.stripStyle}
            >
              <div className={bannerCaptionLayout.innerClass}>
                <span
                  className={bannerCaptionLayout.captionSpanClass}
                  style={{
                    fontFamily: setFont(theme?.textHeading?.value) || undefined,
                    fontSize: `${bannerCaptionFontSizePx}px`,
                    letterSpacing: `${bannerCaptionLetterSpacingPx}px`,
                    color: bannerCaptionColorResolved ?? "#ffffff",
                    ...bannerCaptionLayout.captionSpanStyle,
                  }}
                >
                  {bannerCaptionRaw}
                </span>
              </div>
            </div>
            <div
              aria-hidden
              className="min-h-0 min-w-0 shrink-0"
              style={bannerCaptionLayout.spacerRightStyle}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Image