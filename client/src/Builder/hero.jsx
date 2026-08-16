import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlignLeft,
  AlignCenter,
  Bold,
  Check,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Settings,
  Star,
} from "lucide-react";
import { styled } from "@mui/material/styles";
import Switch from "@mui/material/Switch";
import ImageModal from "./imageModal";
import ServiceIcon from "./ServiceIcon";
import IconAwsome from "./IconAwsome";
import { THEME_PANEL_BASIC_COLOR_SWATCHES } from "./themePanelBasicColors";
import Range from "./HTML/Range";
import { swatchSelectedCheckClassName } from "./Layouts/Elements/swatchCheckClass";

const createDefaultHeroSlides = () => [
  { id: "hero-slide-1", name: "Slide 1", displayMode: "fade", durationSec: 5, layerItems: [] },
];
const HERO_SVG_DIVIDER_TYPE_SET = new Set([
  "none",
  "wave",
  "curve",
  "cloud",
  "cloudSoft",
  "tilt",
  "triangle",
  "arrowSplit",
  "zigzag",
]);
const HERO_SVG_DIVIDER_HEIGHT_MIN = 24;
const HERO_SVG_DIVIDER_HEIGHT_MAX = 180;
const HERO_SVG_DIVIDER_DENSITY_MIN = 0.5;
const HERO_SVG_DIVIDER_DENSITY_MAX = 10;
const HERO_SVG_DIVIDER_SIZE_MIN = 0.5;
const HERO_SVG_DIVIDER_SIZE_MAX = 2.5;
const HERO_BG_FOCUS_MIN = 0;
const HERO_BG_FOCUS_MAX = 100;
const HERO_BG_ZOOM_MIN = 80;
const HERO_BG_ZOOM_MAX = 100;
const HERO_PREVIEW_FRAME_WIDTH_BY_DEVICE = {
  Tablet: 768,
  Mobile: 375,
};
const HERO_SVG_DIVIDER_VIEWBOX_WIDTH = 1200;
const HERO_SVG_DIVIDER_VIEWBOX_HEIGHT = 120;
const HERO_SVG_DIVIDER_PATHS = {
  wave: "M0,48 C40,24 80,24 120,48 C160,72 200,72 240,48 C280,24 320,24 360,48 C400,72 440,72 480,48 C520,24 560,24 600,48 C640,72 680,72 720,48 C760,24 800,24 840,48 C880,72 920,72 960,48 C1000,24 1040,24 1080,48 C1120,72 1160,72 1200,48 L1200,120 L0,120 Z",
  curve: "M0,8 C40,8 70,72 130,74 C210,78 230,8 310,8 C380,8 420,118 500,112 C560,106 570,44 600,42 C630,40 640,106 700,112 C780,120 820,8 900,8 C980,8 1030,74 1090,74 C1150,74 1160,8 1200,8 L1200,120 L0,120 Z",
  cloud: "M0,92 C22,92 30,80 46,80 C62,80 70,92 88,92 C108,92 118,74 138,74 C158,74 168,92 190,92 C214,92 228,62 256,62 C284,62 298,92 324,92 C354,92 370,42 410,42 C450,42 466,92 500,92 C526,92 538,68 562,68 C586,68 600,92 626,92 C654,92 670,56 702,56 C734,56 750,92 778,92 C806,92 820,70 844,70 C868,70 882,92 910,92 C942,92 956,48 994,48 C1032,48 1048,92 1080,92 C1110,92 1124,74 1148,74 C1172,74 1184,92 1200,92 L1200,120 L0,120 Z",
  cloudSoft:
    "M870.17,713.77a38,38,0,0,0-34.25,21.48,24.73,24.73,0,0,0-3.78-.29,24.38,24.38,0,0,0-12.91,3.69,24.38,24.38,0,0,0-16-6.63,30.51,30.51,0,0,0-49.66-12.1,38.21,38.21,0,0,0-64.11-9.25,19.87,19.87,0,0,0-26.17,2.22,29.56,29.56,0,0,0-19.93,1.42h-2.13a19,19,0,0,0-18-13,18.69,18.69,0,0,0-5.21.74,45,45,0,0,0-84.91-9,19,19,0,0,0-27.52,13,29.62,29.62,0,0,0-24.27,7,29.75,29.75,0,0,0-8.49-1.24,28.16,28.16,0,0,0-3.19.18,35.89,35.89,0,0,0-68.38,10.78,21.69,21.69,0,0,0-26.71,5.53,19.83,19.83,0,0,0-12.12-4.12H362a19.83,19.83,0,0,0-9.06,2.18,20,20,0,0,0-24-10.69,31.59,31.59,0,0,0-61.51-8,19,19,0,0,0-25,18c0,.27,0,.53,0,.79a13.4,13.4,0,0,0-11.59,1.22A30.53,30.53,0,0,0,175.17,732a24.36,24.36,0,0,0-15.95,6.63A24.38,24.38,0,0,0,146.31,735a24.73,24.73,0,0,0-3.78.29,38,38,0,0,0-34.25-21.48c-.45,0-.89,0-1.34,0V770H871.51V713.8C871.06,713.79,870.62,713.77,870.17,713.77Z",
  triangle: "M0,92 L560,92 L600,54 L640,92 L1200,92 L1200,120 L0,120 Z",
  zigzag: "M0,120 L100,36 L200,120 L300,36 L400,120 L500,36 L600,120 L700,36 L800,120 L900,36 L1000,120 L1100,36 L1200,120 Z",
};
const HERO_SVG_DIVIDER_PATH_META = {
  cloudSoft: {
    baseWidth: 764.57,
    transform: "translate(-106.94 -650)",
  },
};
const buildTriangleDividerPath = (size) => {
  const safeSize = Number.isFinite(Number(size))
    ? Math.max(HERO_SVG_DIVIDER_SIZE_MIN, Math.min(HERO_SVG_DIVIDER_SIZE_MAX, Number(size)))
    : 1;
  const normalized =
    (safeSize - HERO_SVG_DIVIDER_SIZE_MIN) /
    (HERO_SVG_DIVIDER_SIZE_MAX - HERO_SVG_DIVIDER_SIZE_MIN);
  const baseY = 92;
  const centerX = 600;
  const halfWidth = 20 + normalized * 240;
  const peakRise = 20 + normalized * 72;
  const peakY = Math.max(8, baseY - peakRise);
  const leftX = Math.max(0, centerX - halfWidth);
  const rightX = Math.min(HERO_SVG_DIVIDER_VIEWBOX_WIDTH, centerX + halfWidth);
  return `M0,${baseY} L${leftX},${baseY} L${centerX},${peakY} L${rightX},${baseY} L1200,${baseY} L1200,120 L0,120 Z`;
};
const buildArrowSplitDividerPath = (size) => {
  const safeSize = Number.isFinite(Number(size))
    ? Math.max(HERO_SVG_DIVIDER_SIZE_MIN, Math.min(HERO_SVG_DIVIDER_SIZE_MAX, Number(size)))
    : 1;
  const baseY = 92;
  const centerX = 600;
  const shapeScale = safeSize;
  const baseWingHalfWidth = 110;
  const basePeakRise = 84;
  const baseCuspGap = 6;
  const shoulderControlFactor = 0.88;
  const wingHalfWidth = baseWingHalfWidth * shapeScale;
  const leftWingX = Math.max(0, centerX - wingHalfWidth);
  const rightWingX = Math.min(HERO_SVG_DIVIDER_VIEWBOX_WIDTH, centerX + wingHalfWidth);
  const peakY = Math.max(0, baseY - basePeakRise * shapeScale);
  const cuspHandleY = Math.min(baseY - 1, peakY + baseCuspGap * shapeScale);
  const leftCurveCtrlX1 = leftWingX + wingHalfWidth * shoulderControlFactor;
  const rightCurveCtrlX2 = rightWingX - wingHalfWidth * shoulderControlFactor;
  return `M0,${baseY} L${leftWingX},${baseY} C${leftCurveCtrlX1},${baseY} ${centerX},${cuspHandleY} ${centerX},${peakY} C${centerX},${cuspHandleY} ${rightCurveCtrlX2},${baseY} ${rightWingX},${baseY} L1200,${baseY} L1200,120 L0,120 Z`;
};
const HERO_LAYER_ITEM_TYPES = new Set([
  "image",
  "rectangle",
  "circle",
  "text",
  "heading",
  "button",
  "button-dual",
  "icon",
  // Backward compatibility for previously dropped items
  "button-primary",
  "button-secondary",
  "dual-icon",
]);
const TEXT_LAYER_MIN_WIDTH = 100;
const TEXT_LAYER_MIN_HEIGHT = 40;
const TEXT_LAYER_DEFAULT_FONT_SIZE = 14;
const HEADING_LAYER_DEFAULT_FONT_SIZE = 42;
const HEADING_LAYER_INITIAL_WIDTH_BOOST_PX = 80;
const TEXT_LAYER_MIN_FONT_SIZE = 10;
const TEXT_LAYER_MAX_FONT_SIZE = 120;
const TEXT_LAYER_HORIZONTAL_PADDING = 12;
const TEXT_LAYER_VERTICAL_PADDING = 8;
const TEXT_LAYER_CHAR_WIDTH_FACTOR = 0.62;
const TEXT_LAYER_LINE_HEIGHT_FACTOR = 1.2;
const TEXT_LAYER_MIN_LINE_HEIGHT = 0.8;
const TEXT_LAYER_MAX_LINE_HEIGHT = 3;
const HEADING_LAYER_MIN_LETTER_SPACING = 0;
const HEADING_LAYER_MAX_LETTER_SPACING = 20;
const TEXT_LAYER_FONT_WEIGHT_NORMAL = 500;
const TEXT_LAYER_FONT_WEIGHT_BOLD = 700;
const HERO_LAYER_ANIMATION_DEFAULTS = {
  animationEnabled: false,
  animationType: "fade-in",
  animationDurationMs: 800,
  animationDelayMs: 0,
  animationEasing: "ease-out",
  animationOnce: true,
};
const HERO_LAYER_ANIMATION_PREVIEW_EVENT = "builder:hero-layer-animation-preview";
const HERO_LAYER_ANIMATION_TYPES = new Set([
  "fade-in",
  "slide-in-down",
  "slide-in-left",
  "slide-in-right",
  "slide-in-up",
  "zoom-in",
  "zoom-out",
]);
const HERO_LAYER_ANIMATION_KEYFRAMES = `
@keyframes heroLayerAnimFadeIn {
  from { opacity: 0; transform: translate3d(0, 10px, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}
@keyframes heroLayerAnimSlideInDown {
  from { opacity: 0; transform: translate3d(0, -44px, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}
@keyframes heroLayerAnimSlideInLeft {
  from { opacity: 0; transform: translate3d(-64px, 0, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}
@keyframes heroLayerAnimSlideInRight {
  from { opacity: 0; transform: translate3d(64px, 0, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}
@keyframes heroLayerAnimSlideInUp {
  from { opacity: 0; transform: translate3d(0, 44px, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}
@keyframes heroLayerAnimZoomIn {
  from { opacity: 0; transform: scale(0.72); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes heroLayerAnimZoomOut {
  from { opacity: 0; transform: scale(1.28); }
  to { opacity: 1; transform: scale(1); }
}
`;
const IMAGE_LAYER_DEFAULT_WIDTH = 120;
const IMAGE_LAYER_DEFAULT_HEIGHT = 74;
const IMAGE_LAYER_MIN_WIDTH = 60;
const IMAGE_LAYER_MIN_HEIGHT = 40;
const IMAGE_LAYER_MAX_WIDTH = 5000;
const IMAGE_LAYER_MAX_HEIGHT = 5000;
const IMAGE_LAYER_MAX_OVERFLOW_RATIO = 0.85;
const ICON_LAYER_DEFAULT_SIZE = 42;
const ICON_LAYER_MIN_SIZE = 20;
const ICON_LAYER_MAX_SIZE = 3000;
const ICON_LAYER_FRAME_GAP_PX = 8;
const BUTTON_LAYER_DEFAULT_WIDTH = 150;
const BUTTON_LAYER_DEFAULT_HEIGHT = 42;
const BUTTON_DUAL_LAYER_DEFAULT_WIDTH = 210;
const BUTTON_LAYER_MIN_WIDTH = 80;
const BUTTON_LAYER_MIN_HEIGHT = 32;
const BUTTON_LAYER_BASE_FONT_SIZE = 12;
const BUTTON_DUAL_LAYER_BASE_FONT_SIZE = 11;
const BUTTON_LAYER_MIN_FONT_SIZE = 8;
const BUTTON_LAYER_MAX_FONT_SIZE = 72;
const BUTTON_LAYER_DEFAULT_RADIUS = 8;
const RECTANGLE_LAYER_DEFAULT_WIDTH = 140;
const RECTANGLE_LAYER_DEFAULT_HEIGHT = 84;
const RECTANGLE_LAYER_MIN_WIDTH = 40;
const RECTANGLE_LAYER_MIN_HEIGHT = 40;
const CIRCLE_LAYER_DEFAULT_SIZE = 90;
const CIRCLE_LAYER_MIN_SIZE = 40;
const CLIPBOARD_BLOCK_TAGS = new Set([
  "ADDRESS",
  "ARTICLE",
  "ASIDE",
  "BLOCKQUOTE",
  "DIV",
  "DL",
  "DT",
  "DD",
  "FIELDSET",
  "FIGCAPTION",
  "FIGURE",
  "FOOTER",
  "FORM",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "HEADER",
  "HR",
  "LI",
  "MAIN",
  "NAV",
  "OL",
  "P",
  "PRE",
  "SECTION",
  "TABLE",
  "TR",
  "UL",
]);

const normalizeClipboardText = (value) =>
  String(value ?? "")
    .split("\u0000")
    .join("")
    .replace(/\r\n?/g, "\n");

const extractSafePlainTextFromHtml = (html) => {
  if (typeof html !== "string" || !html.trim() || typeof DOMParser === "undefined") {
    return "";
  }
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    doc
      .querySelectorAll("script,style,noscript,iframe,object,embed,link,meta")
      .forEach((node) => node.remove());

    const chunks = [];
    const pushNewline = () => {
      if (chunks.length === 0) return;
      const last = chunks[chunks.length - 1];
      if (!String(last).endsWith("\n")) {
        chunks.push("\n");
      }
    };
    const walk = (node) => {
      if (!node) return;
      if (node.nodeType === 3) {
        chunks.push(node.nodeValue || "");
        return;
      }
      if (node.nodeType !== 1) return;
      const tag = String(node.nodeName || "").toUpperCase();
      if (tag === "BR") {
        chunks.push("\n");
        return;
      }
      const isBlock = CLIPBOARD_BLOCK_TAGS.has(tag);
      if (isBlock) pushNewline();
      node.childNodes.forEach((child) => walk(child));
      if (isBlock) pushNewline();
    };

    doc.body?.childNodes.forEach((child) => walk(child));
    return normalizeClipboardText(chunks.join(""));
  } catch {
    return "";
  }
};
const resolveThemeFontFamily = (fontToken) => {
  if (typeof fontToken !== "string") return "";
  const trimmed = fontToken.trim();
  if (!trimmed) return "";
  if (!trimmed.startsWith("font-")) return trimmed;
  const cutFont = trimmed.replace("font-", "");
  let shouldUppercaseNext = false;
  let nextFont = "";
  for (let i = 0; i < cutFont.length; i += 1) {
    const ch = cutFont[i];
    if (ch === "-") {
      nextFont += shouldUppercaseNext ? "" : " ";
      shouldUppercaseNext = true;
      continue;
    }
    if (shouldUppercaseNext || i === 0) {
      nextFont += ch.toUpperCase();
      shouldUppercaseNext = false;
    } else {
      nextFont += ch;
    }
  }
  return nextFont || trimmed;
};
const AntSwitch = styled(Switch)(({ theme }) => ({
  width: 28,
  height: 16,
  padding: 0,
  display: "flex",
  "&:active": {
    "& .MuiSwitch-thumb": { width: 15 },
    "& .MuiSwitch-switchBase.Mui-checked": { transform: "translateX(9px)" },
  },
  "& .MuiSwitch-switchBase": {
    padding: 2,
    color: "#ffffff",
    "&.Mui-checked": {
      transform: "translateX(12px)",
      color: "#ffffff",
      "& + .MuiSwitch-track": {
        opacity: 1,
        backgroundColor: "var(--dash-panel-switch-on, #333333)",
      },
    },
  },
  "& .MuiSwitch-thumb": {
    boxShadow: "0 2px 4px 0 rgb(0 35 11 / 20%)",
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#ffffff",
    color: "#ffffff",
    transition: theme.transitions.create(["width"], { duration: 200 }),
  },
  "& .MuiSwitch-track": {
    borderRadius: 8,
    opacity: 1,
    backgroundColor: "var(--dash-panel-switch-off, rgba(0,0,0,.25))",
    boxSizing: "border-box",
  },
}));

const getSafeLayerZIndex = (item, fallbackIndex = 0) => {
  const parsed = Number(item?.zIndex);
  if (Number.isFinite(parsed)) return parsed;
  return fallbackIndex + 1;
};
const HERO_RESPONSIVE_DEVICES = new Set(["Tablet", "Mobile"]);
const stripHeroDeviceSections = (section) => {
  if (!section || typeof section !== "object") return {};
  const nextSection = { ...section };
  delete nextSection.deviceSections;
  return nextSection;
};
const resolveHeroSectionByDevice = (section, device) => {
  const baseSection = stripHeroDeviceSections(section);
  if (!HERO_RESPONSIVE_DEVICES.has(device)) return baseSection;
  const overrideSectionRaw = section?.deviceSections?.[device];
  if (!overrideSectionRaw || typeof overrideSectionRaw !== "object") {
    return baseSection;
  }
  const overrideSection = stripHeroDeviceSections(overrideSectionRaw);
  return {
    ...baseSection,
    ...overrideSection,
  };
};

function HeroPage({ heroSection, theme, openOffcavanas, updateHeroSection, device = "Desktop", readOnly = false }) {
  const [isHoverSection, setIsHoverSection] = useState(false);
  const deviceRef = useRef(device);
  const heroSectionRef = useRef(heroSection);
  useEffect(() => {
    deviceRef.current = device;
  }, [device]);
  useEffect(() => {
    heroSectionRef.current = heroSection;
  }, [heroSection]);
  const editableHeroSection = useMemo(
    () => resolveHeroSectionByDevice(heroSection, device),
    [heroSection, device]
  );
  const sectionData = useMemo(() => {
    return {
      heroHeight: 400,
      latestColID: 3,
      isFluid: false,
      isGradient: false,
      paddingTop: 30,
      paddingBottom: 30,
      sectionOverlapTop: 0,
      sectionOverlapTopDesktop: 0,
      sectionOverlapTopTablet: 0,
      sectionOverlapTopMobile: 0,
      opacityImage: 1,
      imageBrightness: 100,
      opacityColor: 255,
      opacityColorGradient: [255, 255],
      backgroundImage: "",
      backgroundVideo: "",
      backgroundPositionX: 50,
      backgroundPositionY: 50,
      backgroundZoom: 100,
      backgroundFrameOnly: false,
      backgroundColor: "#ffffff",
      backgroundColorGradient: [
        { type: "mainColor", index: 0 },
        { type: "mainColor", index: 1 },
      ],
      degrees: 90,
      blur: 0,
      gridBorder: false,
      noColumnGap: false,
      parallaxEnabled: false,
      svgDividerEnabled: false,
      svgDividerType: "wave",
      svgDividerHeight: 64,
      svgDividerDensity: 1,
      svgDividerSize: 1,
      svgDividerColor: "#ffffff",
      columnDividerStyle: "dashed",
      columnDividerColor: "#d8d8d8",
      columnDividerOpacity: 255,
      columnDividerVerticalLengthPercent: 95,
      slides: createDefaultHeroSlides(),
      activeSlideId: "hero-slide-1",
      isAutoPlay: false,
      slideDisplayMode: "fade",
      slideDurationSec: 5,
      bulletShape: "circle",
      bulletSize: 10,
      bulletColor: "#454b57",
      bulletBottomOffset: 12,
      activeLayerItemId: null,
      ...editableHeroSection,
      id: String(editableHeroSection?.id || "HeroSec-1"),
      _sectionIndex: 0,
      _isSplitSection: false,
    };
  }, [editableHeroSection]);

  const handleUpdateSection = useCallback(
    (nextSection) => {
      if (!updateHeroSection) return;
      const currentDevice = deviceRef.current;
      const currentHeroSection = heroSectionRef.current;
      const sanitizedNextSection = stripHeroDeviceSections(nextSection);
      if (!HERO_RESPONSIVE_DEVICES.has(currentDevice)) {
        const preservedDeviceSections =
          currentHeroSection?.deviceSections && typeof currentHeroSection.deviceSections === "object"
            ? { ...currentHeroSection.deviceSections }
            : undefined;
        updateHeroSection({
          ...sanitizedNextSection,
          ...(preservedDeviceSections ? { deviceSections: preservedDeviceSections } : {}),
        });
        return;
      }
      const rootSection = stripHeroDeviceSections(currentHeroSection);
      const prevDeviceSections =
        currentHeroSection?.deviceSections && typeof currentHeroSection.deviceSections === "object"
          ? { ...currentHeroSection.deviceSections }
          : {};
      updateHeroSection({
        ...rootSection,
        deviceSections: {
          ...prevDeviceSections,
          [currentDevice]: sanitizedNextSection,
        },
      });
    },
    [updateHeroSection]
  );

  const resolveColor = useCallback(
    (value) => {
      if (typeof value === "string") return value;
      if (value && typeof value === "object") {
        const palette = theme?.[value.type];
        if (Array.isArray(palette)) {
          return palette[value.index] || "#ffffff";
        }
      }
      return "#ffffff";
    },
    [theme]
  );

  const opacityToHex = useCallback((value) => {
    const safe = Math.max(0, Math.min(255, Number(value) || 0));
    return safe.toString(16).toUpperCase().padStart(2, "0");
  }, []);

  const heroHeight = Math.max(400, Math.min(800, Number(sectionData.heroHeight ?? 400)));
  const heroPreviewViewportWidth = useMemo(() => {
    const deviceWidth = HERO_PREVIEW_FRAME_WIDTH_BY_DEVICE[device];
    if (Number.isFinite(deviceWidth)) return `${deviceWidth}px`;
    return "100%";
  }, [device]);
  const heroPreviewViewportMaxWidth = device === "Desktop" ? "1280px" : "100%";
  const slides = useMemo(
    () =>
      Array.isArray(sectionData.slides) && sectionData.slides.length > 0
        ? sectionData.slides
        : createDefaultHeroSlides(),
    [sectionData.slides]
  );
  const activeSlideIndex = useMemo(() => {
    const idx = slides.findIndex((slide) => slide.id === sectionData.activeSlideId);
    return idx >= 0 ? idx : 0;
  }, [slides, sectionData.activeSlideId]);
  const [previewSlideIndex, setPreviewSlideIndex] = useState(activeSlideIndex);
  const safePreviewSlideIndex =
    slides.length > 0 ? ((previewSlideIndex % slides.length) + slides.length) % slides.length : 0;
  const activeSlide = slides[safePreviewSlideIndex] || slides[0] || null;
  const candidateSlideMode =
    sectionData.slideDisplayMode === "none" ? "slide-right" : sectionData.slideDisplayMode;
  const slideDisplayMode =
    candidateSlideMode === "slide" ||
    candidateSlideMode === "slide-right" ||
    candidateSlideMode === "fade"
      ? candidateSlideMode
      : "fade";
  const fadeDurationMs = 1150;
  const slideDurationMs = 760;
  const isAutoPlay = sectionData.isAutoPlay === true;
  const parsedSlideDurationSec = Number(sectionData.slideDurationSec);
  const slideDurationSec = Number.isFinite(parsedSlideDurationSec)
    ? Math.max(1, Math.min(20, parsedSlideDurationSec))
    : 5;
  const [slideTransition, setSlideTransition] = useState(null);
  const previousPreviewSlideIndexRef = useRef(safePreviewSlideIndex);
  const previewDropRef = useRef(null);
  const textMeasureCanvasRef = useRef(null);
  const dragLayerMetaRef = useRef(null);
  const [dragLayerId, setDragLayerId] = useState(null);
  const [layerDragDraft, setLayerDragDraft] = useState({});
  const resizeLayerMetaRef = useRef(null);
  const [resizeLayerId, setResizeLayerId] = useState(null);
  const [layerResizeDraft, setLayerResizeDraft] = useState({});
  const [selectedLayerId, setSelectedLayerId] = useState(null);
  const [editingTextLayerId, setEditingTextLayerId] = useState(null);
  const [editingTextDrafts, setEditingTextDrafts] = useState({});
  const [layerAnimationPreviewState, setLayerAnimationPreviewState] = useState({});
  const [buttonColorPickTarget, setButtonColorPickTarget] = useState("bg");
  const [isLayerImagePickerOpen, setIsLayerImagePickerOpen] = useState(false);
  const [isLayerIconPickerOpen, setIsLayerIconPickerOpen] = useState(false);
  const themeTextFontFamily = useMemo(
    () => resolveThemeFontFamily(theme?.text?.value),
    [theme?.text?.value]
  );
  const themeHeadingFontFamily = useMemo(
    () => resolveThemeFontFamily(theme?.textHeading?.value),
    [theme?.textHeading?.value]
  );
  const setSelectedLayerWithSync = useCallback(
    (layerId) => {
      const nextLayerId = layerId || null;
      setSelectedLayerId(nextLayerId);
      if ((sectionData?.activeLayerItemId || null) === nextLayerId) return;
      handleUpdateSection({
        ...sectionData,
        activeLayerItemId: nextLayerId,
      });
    },
    [handleUpdateSection, sectionData]
  );
  const buildSlideVisual = useCallback(
    (slide) => {
      const isGradient = Boolean(slide?.isGradient ?? sectionData.isGradient);
      const solidColor = slide?.backgroundColor ?? sectionData.backgroundColor;
      const gradientColors = Array.isArray(slide?.backgroundColorGradient)
        ? slide.backgroundColorGradient
        : sectionData.backgroundColorGradient;
      const solidOpacity = Number(slide?.opacityColor ?? sectionData.opacityColor ?? 255);
      const gradientOpacities = Array.isArray(slide?.opacityColorGradient)
        ? slide.opacityColorGradient
        : sectionData.opacityColorGradient;
      const degrees = Number(slide?.degrees ?? sectionData.degrees ?? 90);
      const selectedBackgroundVideo = slide?.backgroundVideo ?? sectionData.backgroundVideo;
      const selectedBackgroundImage = slide?.backgroundImage ?? sectionData.backgroundImage;
      const backgroundVideo = selectedBackgroundVideo || "";
      const backgroundImage = backgroundVideo ? "" : selectedBackgroundImage;
      const backgroundPositionX = Math.max(
        HERO_BG_FOCUS_MIN,
        Math.min(
          HERO_BG_FOCUS_MAX,
          (() => {
            const parsed = Number(slide?.backgroundPositionX ?? sectionData.backgroundPositionX ?? 50);
            return Number.isFinite(parsed) ? parsed : 50;
          })()
        )
      );
      const backgroundPositionY = Math.max(
        HERO_BG_FOCUS_MIN,
        Math.min(
          HERO_BG_FOCUS_MAX,
          (() => {
            const parsed = Number(slide?.backgroundPositionY ?? sectionData.backgroundPositionY ?? 50);
            return Number.isFinite(parsed) ? parsed : 50;
          })()
        )
      );
      const backgroundZoom = Math.max(
        HERO_BG_ZOOM_MIN,
        Math.min(
          HERO_BG_ZOOM_MAX,
          (() => {
            const parsed = Number(slide?.backgroundZoom ?? sectionData.backgroundZoom ?? 100);
            return Number.isFinite(parsed) ? parsed : 100;
          })()
        )
      );
      const backgroundFrameOnly =
        (slide?.backgroundFrameOnly ?? sectionData.backgroundFrameOnly ?? false) === true;
      const parsedImageBrightness = Number(slide?.imageBrightness ?? sectionData.imageBrightness);
      const imageBrightness = Number.isFinite(parsedImageBrightness)
        ? Math.max(0, Math.min(200, parsedImageBrightness))
        : Math.max(0, Math.min(200, Number(slide?.opacityImage ?? sectionData.opacityImage ?? 1) * 100));
      const blurPx = Math.max(0, Number(slide?.blur ?? sectionData.blur ?? 0));
      const parallaxEnabled = Boolean(slide?.parallaxEnabled ?? sectionData.parallaxEnabled);
      const background = isGradient
        ? (() => {
            const c1 = resolveColor(gradientColors?.[0]);
            const c2 = resolveColor(gradientColors?.[1]);
            const o1 = opacityToHex(gradientOpacities?.[0] ?? 255);
            const o2 = opacityToHex(gradientOpacities?.[1] ?? 255);
            return `linear-gradient(${degrees}deg, ${c1}${o1} 0%, ${c2}${o2} 100%)`;
          })()
        : `${resolveColor(solidColor)}${opacityToHex(solidOpacity)}`;
      return {
        background,
        backgroundImage,
        backgroundVideo,
        backgroundPositionX,
        backgroundPositionY,
        backgroundZoom,
        backgroundFrameOnly,
        imageBrightness,
        blurPx,
        blurBleedPx: blurPx > 0 ? Math.ceil(blurPx * 2.2) : 0,
        parallaxEnabled,
      };
    },
    [
      sectionData.isGradient,
      sectionData.backgroundColor,
      sectionData.backgroundColorGradient,
      sectionData.opacityColor,
      sectionData.opacityColorGradient,
      sectionData.degrees,
      sectionData.backgroundImage,
      sectionData.backgroundVideo,
      sectionData.backgroundPositionX,
      sectionData.backgroundPositionY,
      sectionData.backgroundZoom,
      sectionData.backgroundFrameOnly,
      sectionData.imageBrightness,
      sectionData.opacityImage,
      sectionData.blur,
      sectionData.parallaxEnabled,
      resolveColor,
      opacityToHex,
    ]
  );
  const activeSlideVisual = useMemo(() => buildSlideVisual(activeSlide), [buildSlideVisual, activeSlide]);
  const fromSlideVisual = useMemo(() => {
    if (!slideTransition) return null;
    return buildSlideVisual(slides[slideTransition.fromIndex] || null);
  }, [slideTransition, slides, buildSlideVisual]);
  const bulletShape = ["circle", "square", "rounded"].includes(sectionData.bulletShape)
    ? sectionData.bulletShape
    : "circle";
  const parsedBulletSize = Number(sectionData.bulletSize);
  const bulletSize = Number.isFinite(parsedBulletSize)
    ? Math.max(6, Math.min(24, parsedBulletSize))
    : 10;
  const parsedBulletBottomOffset = Number(sectionData.bulletBottomOffset);
  const bulletBottomOffset = Number.isFinite(parsedBulletBottomOffset)
    ? Math.max(0, Math.min(80, parsedBulletBottomOffset))
    : 12;
  const bulletColor = (() => {
    if (typeof sectionData.bulletColor === "string") return sectionData.bulletColor;
    if (sectionData.bulletColor && typeof sectionData.bulletColor === "object") {
      const palette = theme?.[sectionData.bulletColor.type];
      if (Array.isArray(palette)) {
        const picked = palette[sectionData.bulletColor.index];
        if (typeof picked === "string" && picked.trim()) return picked;
      }
    }
    return "#454b57";
  })();
  const bulletRadius =
    bulletShape === "circle" ? "9999px" : bulletShape === "rounded" ? "4px" : "0px";
  const svgDividerEnabled = sectionData.svgDividerEnabled === true;
  const normalizedSvgDividerType =
    sectionData.svgDividerType === "tilt"
      ? "cloud"
      : sectionData.svgDividerType === "triangleCurve"
        ? "arrowSplit"
        : sectionData.svgDividerType;
  const svgDividerType = HERO_SVG_DIVIDER_TYPE_SET.has(normalizedSvgDividerType)
    ? normalizedSvgDividerType
    : "wave";
  const parsedDividerHeight = Number(sectionData.svgDividerHeight);
  const svgDividerHeight = Number.isFinite(parsedDividerHeight)
    ? Math.max(HERO_SVG_DIVIDER_HEIGHT_MIN, Math.min(HERO_SVG_DIVIDER_HEIGHT_MAX, parsedDividerHeight))
    : 64;
  const parsedDividerDensity = Number(sectionData.svgDividerDensity);
  const svgDividerDensity = Number.isFinite(parsedDividerDensity)
    ? Math.max(
        HERO_SVG_DIVIDER_DENSITY_MIN,
        Math.min(HERO_SVG_DIVIDER_DENSITY_MAX, parsedDividerDensity)
      )
    : 1;
  const parsedDividerSize = Number(sectionData.svgDividerSize);
  const svgDividerSize = Number.isFinite(parsedDividerSize)
    ? Math.max(HERO_SVG_DIVIDER_SIZE_MIN, Math.min(HERO_SVG_DIVIDER_SIZE_MAX, parsedDividerSize))
    : 1;
  const svgDividerColor = (() => {
    const resolved = resolveColor(sectionData.svgDividerColor ?? "#ffffff");
    if (typeof resolved === "string" && resolved.trim()) return resolved;
    return "#ffffff";
  })();
  const svgDividerPath = (() => {
    if (!svgDividerEnabled || svgDividerType === "none") return null;
    if (svgDividerType === "triangle") return buildTriangleDividerPath(svgDividerSize);
    if (svgDividerType === "arrowSplit") return buildArrowSplitDividerPath(svgDividerSize);
    return HERO_SVG_DIVIDER_PATHS[svgDividerType] || null;
  })();
  const svgDividerPathMeta = svgDividerPath ? HERO_SVG_DIVIDER_PATH_META[svgDividerType] ?? null : null;
  const svgDividerPathBaseWidth =
    svgDividerPathMeta?.baseWidth ?? HERO_SVG_DIVIDER_VIEWBOX_WIDTH;
  const svgDividerPathTransform = svgDividerPathMeta?.transform ?? null;
  const isSingleTriangleDivider =
    svgDividerType === "triangle" || svgDividerType === "arrowSplit";
  const svgDividerSegmentWidth = isSingleTriangleDivider
    ? HERO_SVG_DIVIDER_VIEWBOX_WIDTH
    : HERO_SVG_DIVIDER_VIEWBOX_WIDTH / Math.max(svgDividerDensity, 0.01);
  const svgDividerSegmentScaleX = svgDividerSegmentWidth / svgDividerPathBaseWidth;
  const svgDividerSegmentCount = svgDividerPath
    ? isSingleTriangleDivider
      ? 1
      : svgDividerDensity >= 1
        ? Math.ceil(svgDividerDensity)
        : 1
    : 0;
  const svgDividerSegmentOffsetX = svgDividerPath
    ? isSingleTriangleDivider
      ? 0
      : svgDividerDensity >= 1
        ? 0
        : (HERO_SVG_DIVIDER_VIEWBOX_WIDTH - svgDividerSegmentWidth) / 2
    : 0;
  const themeColorTokens = useMemo(() => {
    const main = Array.isArray(theme?.mainColor)
      ? theme.mainColor.map((_, index) => ({ type: "mainColor", index }))
      : [];
    const text = Array.isArray(theme?.textColor)
      ? theme.textColor.map((_, index) => ({ type: "textColor", index }))
      : [];
    const other = Array.isArray(theme?.otherColor)
      ? theme.otherColor.map((_, index) => ({ type: "otherColor", index }))
      : [];
    return [...main, ...text, ...other];
  }, [theme]);
  const previewShapeColorTokens = useMemo(() => {
    return [...themeColorTokens, ...THEME_PANEL_BASIC_COLOR_SWATCHES];
  }, [themeColorTokens]);
  const activeLayerItems = useMemo(
    () => (Array.isArray(activeSlide?.layerItems) ? activeSlide.layerItems : []),
    [activeSlide?.layerItems]
  );
  const sortedLayerItems = useMemo(() => {
    return activeLayerItems
      .map((item, index) => ({
        ...(item || {}),
        __originalIndex: index,
        __safeZIndex: getSafeLayerZIndex(item, index),
      }))
      .sort(
        (a, b) =>
          Number(a.__safeZIndex) - Number(b.__safeZIndex) ||
          Number(a.__originalIndex) - Number(b.__originalIndex)
      );
  }, [activeLayerItems]);
  const selectedImageLayerId = useMemo(() => {
    if (!selectedLayerId) return null;
    const found = activeLayerItems.find(
      (item) => item?.id === selectedLayerId && item?.type === "image"
    );
    return found?.id || null;
  }, [activeLayerItems, selectedLayerId]);
  const selectedIconLayerId = useMemo(() => {
    if (!selectedLayerId) return null;
    const found = activeLayerItems.find(
      (item) => item?.id === selectedLayerId && item?.type === "icon"
    );
    return found?.id || null;
  }, [activeLayerItems, selectedLayerId]);
  const selectedTextLayerId = useMemo(() => {
    if (!selectedLayerId) return null;
    const found = activeLayerItems.find(
      (item) =>
        item?.id === selectedLayerId &&
        (item?.type === "text" || item?.type === "heading")
    );
    return found?.id || null;
  }, [activeLayerItems, selectedLayerId]);
  const selectedImageLayer = useMemo(() => {
    if (!selectedImageLayerId) return null;
    const found = activeLayerItems.find(
      (item) => item?.id === selectedImageLayerId && item?.type === "image"
    );
    return found || null;
  }, [activeLayerItems, selectedImageLayerId]);
  const selectedIconLayer = useMemo(() => {
    if (!selectedIconLayerId) return null;
    const found = activeLayerItems.find(
      (item) => item?.id === selectedIconLayerId && item?.type === "icon"
    );
    return found || null;
  }, [activeLayerItems, selectedIconLayerId]);
  const selectedTextLayer = useMemo(() => {
    if (!selectedTextLayerId) return null;
    const found = activeLayerItems.find(
      (item) =>
        item?.id === selectedTextLayerId &&
        (item?.type === "text" || item?.type === "heading")
    );
    return found || null;
  }, [activeLayerItems, selectedTextLayerId]);
  const selectedButtonLayer = useMemo(() => {
    if (!selectedLayerId) return null;
    const found = activeLayerItems.find((item) => item?.id === selectedLayerId);
    if (!found) return null;
    if (
      found.type !== "button" &&
      found.type !== "button-primary" &&
      found.type !== "button-dual" &&
      found.type !== "button-secondary"
    ) {
      return null;
    }
    return found;
  }, [activeLayerItems, selectedLayerId]);
  const selectedShapeLayer = useMemo(() => {
    if (!selectedLayerId) return null;
    const found = activeLayerItems.find((item) => item?.id === selectedLayerId);
    if (!found) return null;
    if (found.type !== "rectangle" && found.type !== "circle") return null;
    return found;
  }, [activeLayerItems, selectedLayerId]);
  const selectedShapeFillColor = selectedShapeLayer?.fillColor ?? "#ffffff";
  const selectedShapeFillOpacity = (() => {
    const parsed = Number(selectedShapeLayer?.fillOpacity);
    if (Number.isFinite(parsed)) return Math.max(0, Math.min(255, parsed));
    return 51;
  })();
  const selectedShapeFillOpacityPercent = Math.max(
    0,
    Math.min(100, Math.round((selectedShapeFillOpacity / 255) * 100))
  );
  const selectedShapeFillBlur = (() => {
    const parsed = Number(selectedShapeLayer?.fillBlur);
    if (Number.isFinite(parsed)) return Math.max(0, Math.min(100, parsed));
    return 0;
  })();
  const selectedShapeRadius = (() => {
    if (selectedShapeLayer?.type !== "rectangle") return 0;
    const parsed = Number(selectedShapeLayer?.shapeRadius);
    if (Number.isFinite(parsed)) return Math.max(0, Math.min(100, parsed));
    return 8;
  })();
  const selectedShapeStrokeEnabled = selectedShapeLayer?.shapeStrokeEnabled === true;
  const selectedImageOpacityPercent = (() => {
    const parsed = Number(selectedImageLayer?.imageOpacity);
    if (Number.isFinite(parsed)) return Math.max(0, Math.min(100, parsed));
    return 100;
  })();
  const selectedImageBlur = (() => {
    const parsed = Number(selectedImageLayer?.imageBlur);
    if (Number.isFinite(parsed)) return Math.max(0, Math.min(100, parsed));
    return 0;
  })();
  const selectedImageBrightness = (() => {
    const parsed = Number(selectedImageLayer?.imageBrightness);
    if (Number.isFinite(parsed)) return Math.max(0, Math.min(200, parsed));
    return 100;
  })();
  const selectedIconColor = selectedIconLayer?.iconColor ?? "#334155";
  const selectedTextColor = selectedTextLayer?.textColor ?? "#ffffff";
  const selectedButtonBgColor = selectedButtonLayer?.buttonBgColor ?? "#ffffff";
  const selectedButtonTextColor = selectedButtonLayer?.buttonTextColor ?? "#334155";
  const selectedIconOpacityPercent = (() => {
    const parsed = Number(selectedIconLayer?.iconOpacity);
    if (Number.isFinite(parsed)) return Math.max(0, Math.min(100, parsed));
    return 100;
  })();
  const selectedTextOpacityPercent = (() => {
    const parsed = Number(selectedTextLayer?.textOpacity);
    if (Number.isFinite(parsed)) return Math.max(0, Math.min(100, parsed));
    return 90;
  })();
  const selectedButtonOpacityPercent = (() => {
    const parsed = Number(selectedButtonLayer?.buttonOpacity);
    if (Number.isFinite(parsed)) return Math.max(0, Math.min(100, parsed));
    return 100;
  })();
  const selectedButtonRadius = (() => {
    const parsed = Number(selectedButtonLayer?.buttonRadius);
    if (Number.isFinite(parsed)) return Math.max(0, Math.min(100, parsed));
    return BUTTON_LAYER_DEFAULT_RADIUS;
  })();
  const selectedButtonFontSizeBase = (() => {
    const parsed = Number(selectedButtonLayer?.buttonFontSizeBase);
    const fallback =
      selectedButtonLayer?.type === "button-dual" ||
      selectedButtonLayer?.type === "button-secondary"
        ? BUTTON_DUAL_LAYER_BASE_FONT_SIZE
        : BUTTON_LAYER_BASE_FONT_SIZE;
    if (Number.isFinite(parsed)) {
      return Math.max(BUTTON_LAYER_MIN_FONT_SIZE, Math.min(BUTTON_LAYER_MAX_FONT_SIZE, parsed));
    }
    return fallback;
  })();
  const selectedIconShadowEnabled = selectedIconLayer?.iconShadowEnabled === true;
  const selectedTextShadowEnabled = selectedTextLayer?.textShadowEnabled === true;
  const selectedTextBold = selectedTextLayer?.textBold === true;
  const selectedHeadingStrokeEnabled = selectedTextLayer?.textStrokeEnabled === true;
  const selectedTextAlign = selectedTextLayer?.textAlign === "left" ? "left" : "center";
  const selectedTextLineHeight = (() => {
    const parsed = Number(selectedTextLayer?.textLineHeight);
    if (Number.isFinite(parsed)) {
      return Math.max(TEXT_LAYER_MIN_LINE_HEIGHT, Math.min(TEXT_LAYER_MAX_LINE_HEIGHT, parsed));
    }
    return TEXT_LAYER_LINE_HEIGHT_FACTOR;
  })();
  const selectedHeadingLetterSpacing = (() => {
    const parsed = Number(selectedTextLayer?.textLetterSpacing);
    if (Number.isFinite(parsed)) {
      return Math.max(
        HEADING_LAYER_MIN_LETTER_SPACING,
        Math.min(HEADING_LAYER_MAX_LETTER_SPACING, parsed)
      );
    }
    return 0;
  })();
  const isSameColorToken = useCallback((left, right) => {
    if (typeof left === "string" || typeof right === "string") {
      return String(left || "") === String(right || "");
    }
    if (!left || !right || typeof left !== "object" || typeof right !== "object") return false;
    return left.type === right.type && Number(left.index) === Number(right.index);
  }, []);
  const calculateTextLayerBoxSize = useCallback((
    textValue,
    fontSizeValue,
    forcedWidth = null,
    charWidthFactor = TEXT_LAYER_CHAR_WIDTH_FACTOR,
    fontWeight = 500,
    allowWrap = true,
    horizontalPaddingPx = TEXT_LAYER_HORIZONTAL_PADDING,
    verticalPaddingPx = TEXT_LAYER_VERTICAL_PADDING,
    lineHeightFactor = TEXT_LAYER_LINE_HEIGHT_FACTOR,
    fontFamilyValue = null,
    letterSpacingValue = 0
  ) => {
    const safeFontSize = Math.max(
      TEXT_LAYER_MIN_FONT_SIZE,
      Math.min(TEXT_LAYER_MAX_FONT_SIZE, Number(fontSizeValue) || TEXT_LAYER_DEFAULT_FONT_SIZE)
    );
    const safeCharWidthFactor = Math.max(
      0.35,
      Number(charWidthFactor) || TEXT_LAYER_CHAR_WIDTH_FACTOR
    );
    const safeHorizontalPadding = Math.max(0, Number(horizontalPaddingPx) || 0);
    const safeVerticalPadding = Math.max(0, Number(verticalPaddingPx) || 0);
    const safeLineHeight = Math.max(
      TEXT_LAYER_MIN_LINE_HEIGHT,
      Math.min(TEXT_LAYER_MAX_LINE_HEIGHT, Number(lineHeightFactor) || TEXT_LAYER_LINE_HEIGHT_FACTOR)
    );
    const safeLetterSpacing = Math.max(0, Number(letterSpacingValue) || 0);
    const safeFontFamily =
      typeof fontFamilyValue === "string" && fontFamilyValue.trim()
        ? fontFamilyValue
        : 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
    const text = String(textValue || "Text");
    const charCount = Math.max(1, text.length);
    let measuredTextWidth = null;
    let measuredGlyphWidth = null;
    let textMeasureContext = null;
    if (typeof document !== "undefined") {
      if (!textMeasureCanvasRef.current) {
        textMeasureCanvasRef.current = document.createElement("canvas");
      }
      const context = textMeasureCanvasRef.current.getContext("2d");
      if (context) {
        textMeasureContext = context;
        const safeFontWeight = Math.max(100, Math.min(900, Number(fontWeight) || 500));
        context.font = `${safeFontWeight} ${safeFontSize}px ${safeFontFamily}`;
        const metrics = context.measureText(text);
        measuredTextWidth = metrics.width;
        const left = Number(metrics.actualBoundingBoxLeft);
        const right = Number(metrics.actualBoundingBoxRight);
        if (Number.isFinite(left) && Number.isFinite(right)) {
          measuredGlyphWidth = left + right;
        }
      }
    }
    const fallbackTextWidth = charCount * safeFontSize * safeCharWidthFactor;
    const measuredWidth = Number.isFinite(Number(measuredTextWidth))
      ? Number(measuredTextWidth)
      : 0;
    const glyphWidth = Number.isFinite(Number(measuredGlyphWidth))
      ? Number(measuredGlyphWidth)
      : 0;
    const dominantMeasuredWidth = Math.max(measuredWidth, glyphWidth);
    const naturalTextWidth =
      dominantMeasuredWidth > 0 ? dominantMeasuredWidth : fallbackTextWidth;
    const letterSpacingWidth = Math.max(0, charCount - 1) * safeLetterSpacing;
    const noWrapBuffer = allowWrap ? safeFontSize * 0.35 : 2;
    const avgCharWidth = Math.max(
      1,
      dominantMeasuredWidth > 0
        ? dominantMeasuredWidth / charCount
        : safeFontSize * safeCharWidthFactor
    );
    const naturalWidth = Math.max(
      TEXT_LAYER_MIN_WIDTH,
      Math.round(naturalTextWidth + letterSpacingWidth + safeHorizontalPadding * 2 + noWrapBuffer)
    );
    const width = Number.isFinite(Number(forcedWidth))
      ? Math.max(TEXT_LAYER_MIN_WIDTH, Math.min(IMAGE_LAYER_MAX_WIDTH, Number(forcedWidth)))
      : naturalWidth;
    const innerWidth = Math.max(1, width - safeHorizontalPadding * 2);
    const charsPerLine = allowWrap
      ? Math.max(1, Math.floor(innerWidth / avgCharWidth))
      : charCount;
    let lines = allowWrap ? Math.max(1, Math.ceil(charCount / charsPerLine)) : 1;
    if (allowWrap && textMeasureContext) {
      let lineCount = 1;
      let lineWidth = 0;
      for (const ch of text) {
        if (ch === "\n") {
          lineCount += 1;
          lineWidth = 0;
          continue;
        }
        const chWidth = Math.max(0, textMeasureContext.measureText(ch).width);
        const nextCharWidth = chWidth + (lineWidth > 0 ? safeLetterSpacing : 0);
        if (lineWidth > 0 && lineWidth + nextCharWidth > innerWidth) {
          lineCount += 1;
          lineWidth = chWidth;
        } else {
          lineWidth += nextCharWidth;
        }
      }
      lines = Math.max(1, lineCount);
    }
    const height = Math.max(
      TEXT_LAYER_MIN_HEIGHT,
      Math.round(lines * safeFontSize * safeLineHeight + safeVerticalPadding * 2)
    );
    return { width, height, fontSize: safeFontSize };
  }, []);
  const buildSafeTextFontSize = useCallback(
    (rawFontSize) => {
      return Math.max(
        TEXT_LAYER_MIN_FONT_SIZE,
        Math.min(TEXT_LAYER_MAX_FONT_SIZE, Number(rawFontSize) || TEXT_LAYER_DEFAULT_FONT_SIZE)
      );
    },
    []
  );
  const buildSafeImageSize = useCallback((rawWidth, rawHeight) => {
    const safeWidth = Math.max(
      IMAGE_LAYER_MIN_WIDTH,
      Math.min(IMAGE_LAYER_MAX_WIDTH, Number(rawWidth) || IMAGE_LAYER_DEFAULT_WIDTH)
    );
    const safeHeight = Math.max(
      IMAGE_LAYER_MIN_HEIGHT,
      Math.min(IMAGE_LAYER_MAX_HEIGHT, Number(rawHeight) || IMAGE_LAYER_DEFAULT_HEIGHT)
    );
    return { width: safeWidth, height: safeHeight };
  }, []);
  const buildSafeRectangleSize = useCallback((rawWidth, rawHeight) => {
    const safeWidth = Math.max(
      RECTANGLE_LAYER_MIN_WIDTH,
      Math.min(IMAGE_LAYER_MAX_WIDTH, Number(rawWidth) || RECTANGLE_LAYER_DEFAULT_WIDTH)
    );
    const safeHeight = Math.max(
      RECTANGLE_LAYER_MIN_HEIGHT,
      Math.min(IMAGE_LAYER_MAX_HEIGHT, Number(rawHeight) || RECTANGLE_LAYER_DEFAULT_HEIGHT)
    );
    return { width: safeWidth, height: safeHeight };
  }, []);
  const buildSafeCircleStretchSize = useCallback((rawWidth, rawHeight) => {
    const safeWidth = Math.max(
      CIRCLE_LAYER_MIN_SIZE,
      Math.min(IMAGE_LAYER_MAX_WIDTH, Number(rawWidth) || CIRCLE_LAYER_DEFAULT_SIZE)
    );
    const safeHeight = Math.max(
      CIRCLE_LAYER_MIN_SIZE,
      Math.min(IMAGE_LAYER_MAX_HEIGHT, Number(rawHeight) || CIRCLE_LAYER_DEFAULT_SIZE)
    );
    return { width: safeWidth, height: safeHeight };
  }, []);
  useCallback((rawSize) => {
    return buildSafeCircleStretchSize(rawSize, rawSize);
  }, [buildSafeCircleStretchSize]);
  const buildSafeIconSize = useCallback((rawSize) => {
    const safeSize = Math.max(
      ICON_LAYER_MIN_SIZE,
      Math.min(ICON_LAYER_MAX_SIZE, Number(rawSize) || ICON_LAYER_DEFAULT_SIZE)
    );
    return { width: safeSize, height: safeSize };
  }, []);
  const buildSafeButtonSize = useCallback((rawWidth, rawHeight) => {
    const safeWidth = Math.max(
      BUTTON_LAYER_MIN_WIDTH,
      Math.min(IMAGE_LAYER_MAX_WIDTH, Number(rawWidth) || BUTTON_LAYER_DEFAULT_WIDTH)
    );
    const safeHeight = Math.max(
      BUTTON_LAYER_MIN_HEIGHT,
      Math.min(IMAGE_LAYER_MAX_HEIGHT, Number(rawHeight) || BUTTON_LAYER_DEFAULT_HEIGHT)
    );
    return { width: safeWidth, height: safeHeight };
  }, []);
  const buildSafeHeadingWidth = useCallback((rawWidth) => {
    const parsed = Number(rawWidth);
    if (!Number.isFinite(parsed)) return TEXT_LAYER_MIN_WIDTH;
    return Math.max(TEXT_LAYER_MIN_WIDTH, Math.min(IMAGE_LAYER_MAX_WIDTH, parsed));
  }, []);

  useEffect(() => {
    if (previewSlideIndex === activeSlideIndex) return;
    setPreviewSlideIndex(activeSlideIndex);
  }, [activeSlideIndex, previewSlideIndex]);
  useEffect(() => {
    const nextActiveLayerId = sectionData?.activeLayerItemId || null;
    if (selectedLayerId === nextActiveLayerId) return;
    setSelectedLayerId(nextActiveLayerId);
  }, [sectionData?.activeLayerItemId, selectedLayerId]);
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handleLayerAnimationPreview = (event) => {
      const detail = event?.detail || {};
      const incomingSectionId =
        typeof detail.sectionId === "string" ? detail.sectionId : "";
      if (incomingSectionId && incomingSectionId !== String(sectionData?.id || "")) return;
      const layerId = typeof detail.layerId === "string" ? detail.layerId.trim() : "";
      if (!layerId) return;
      const shouldPlay = detail.playing === true;
      setLayerAnimationPreviewState((prev) => {
        const prevEntry = prev[layerId];
        const runKey = shouldPlay
          ? Number(prevEntry?.runKey || 0) + 1
          : Number(prevEntry?.runKey || 0);
        return {
          ...prev,
          [layerId]: {
            playing: shouldPlay,
            runKey,
          },
        };
      });
    };
    window.addEventListener(
      HERO_LAYER_ANIMATION_PREVIEW_EVENT,
      handleLayerAnimationPreview
    );
    return () => {
      window.removeEventListener(
        HERO_LAYER_ANIMATION_PREVIEW_EVENT,
        handleLayerAnimationPreview
      );
    };
  }, [sectionData?.id]);
  useEffect(() => {
    if (!editingTextLayerId) return;
    if (selectedLayerId !== editingTextLayerId) {
      setEditingTextDrafts((prev) => {
        if (!Object.prototype.hasOwnProperty.call(prev, editingTextLayerId)) return prev;
        const next = { ...prev };
        delete next[editingTextLayerId];
        return next;
      });
      setLayerResizeDraft((prev) => {
        if (!Object.prototype.hasOwnProperty.call(prev, editingTextLayerId)) return prev;
        const next = { ...prev };
        delete next[editingTextLayerId];
        return next;
      });
      setEditingTextLayerId(null);
    }
  }, [editingTextLayerId, selectedLayerId]);

  useEffect(() => {
    if (!isAutoPlay || slides.length <= 1) return;
    const timer = window.setTimeout(() => {
      setPreviewSlideIndex((prev) => (prev + 1) % slides.length);
    }, slideDurationSec * 1000);
    return () => window.clearTimeout(timer);
  }, [isAutoPlay, slides.length, slideDurationSec, safePreviewSlideIndex]);

  useEffect(() => {
    const previousIndex = previousPreviewSlideIndexRef.current;
    if (previousIndex === safePreviewSlideIndex) return;
    if (
      slideDisplayMode === "slide" ||
      slideDisplayMode === "slide-right" ||
      slideDisplayMode === "fade"
    ) {
      setSlideTransition({
        fromIndex: previousIndex,
        toIndex: safePreviewSlideIndex,
        key: `${previousIndex}-${safePreviewSlideIndex}-${Date.now()}`,
      });
    } else {
      setSlideTransition(null);
    }
    previousPreviewSlideIndexRef.current = safePreviewSlideIndex;
  }, [safePreviewSlideIndex, slideDisplayMode]);

  useEffect(() => {
    if (!slideTransition) return;
    const transitionDurationMs =
      slideDisplayMode === "fade" ? fadeDurationMs : slideDurationMs;
    const timer = window.setTimeout(() => {
      setSlideTransition(null);
    }, transitionDurationMs);
    return () => window.clearTimeout(timer);
  }, [slideTransition, fadeDurationMs, slideDurationMs, slideDisplayMode]);

  const patchSlides = useCallback(
    (nextSlides, nextActiveSlideId = null, nextActiveLayerItemId = undefined) => {
      const safeSlides = Array.isArray(nextSlides) && nextSlides.length > 0
        ? nextSlides
        : createDefaultHeroSlides();
      const safeActiveId = nextActiveSlideId || safeSlides[0]?.id || null;
      const safeActiveLayerId =
        typeof nextActiveLayerItemId === "string" && nextActiveLayerItemId.trim()
          ? nextActiveLayerItemId
          : nextActiveLayerItemId === null
            ? null
            : (sectionData?.activeLayerItemId || null);
      handleUpdateSection({
        ...sectionData,
        slides: safeSlides,
        activeSlideId: safeActiveId,
        activeLayerItemId: safeActiveLayerId,
      });
    },
    [handleUpdateSection, sectionData]
  );

  const handleSelectSlide = useCallback(
    (slideId) => {
      patchSlides(slides, slideId);
    },
    [patchSlides, slides]
  );
  const updateLayerItemPosition = useCallback(
    (layerId, nextX, nextY) => {
      if (!layerId || !activeSlide?.id) return;
      const nextSlides = slides.map((slide) => {
        if (slide.id !== activeSlide.id) return slide;
        const currentLayerItems = Array.isArray(slide.layerItems) ? slide.layerItems : [];
        return {
          ...slide,
          layerItems: currentLayerItems.map((item) =>
            item?.id === layerId ? { ...item, x: nextX, y: nextY } : item
          ),
        };
      });
      patchSlides(nextSlides, activeSlide.id);
    },
    [activeSlide?.id, patchSlides, slides]
  );
  const updateLayerItemSize = useCallback(
    (
      layerId,
      nextWidth,
      nextHeight,
      nextFontSize = null,
      nextX = null,
      nextY = null,
      extraPatch = null
    ) => {
      if (!layerId || !activeSlide?.id) return;
      const hasNextFontSize = typeof nextFontSize === "number" && Number.isFinite(nextFontSize);
      const hasNextX = typeof nextX === "number" && Number.isFinite(nextX);
      const hasNextY = typeof nextY === "number" && Number.isFinite(nextY);
      const safeExtraPatch =
        extraPatch && typeof extraPatch === "object" && !Array.isArray(extraPatch)
          ? extraPatch
          : null;
      const nextSlides = slides.map((slide) => {
        if (slide.id !== activeSlide.id) return slide;
        const currentLayerItems = Array.isArray(slide.layerItems) ? slide.layerItems : [];
        return {
          ...slide,
          layerItems: currentLayerItems.map((item) =>
            item?.id === layerId
              ? {
                  ...item,
                  width: nextWidth,
                  height: nextHeight,
                  ...(hasNextFontSize ? { fontSize: nextFontSize } : {}),
                  ...(hasNextX ? { x: nextX } : {}),
                  ...(hasNextY ? { y: nextY } : {}),
                  ...(item?.type === "text" || item?.type === "heading"
                    ? { isTextResized: true }
                    : {}),
                  ...(item?.type === "image" ? { isImageResized: true } : {}),
                  ...(item?.type === "button" ||
                    item?.type === "button-primary" ||
                    item?.type === "button-dual" ||
                    item?.type === "button-secondary"
                    ? { isButtonResized: true }
                    : {}),
                  ...(safeExtraPatch || {}),
                }
              : item
          ),
        };
      });
      patchSlides(nextSlides, activeSlide.id);
    },
    [activeSlide?.id, patchSlides, slides]
  );
  const updateLayerItemImage = useCallback(
    (layerId, nextImageUrl, nextWidth = null, nextHeight = null) => {
      if (!layerId || !activeSlide?.id) return;
      const hasSizeOverride =
        typeof nextWidth === "number" &&
        Number.isFinite(nextWidth) &&
        typeof nextHeight === "number" &&
        Number.isFinite(nextHeight);
      const nextSlides = slides.map((slide) => {
        if (slide.id !== activeSlide.id) return slide;
        const currentLayerItems = Array.isArray(slide.layerItems) ? slide.layerItems : [];
        return {
          ...slide,
          layerItems: currentLayerItems.map((item) =>
            item?.id === layerId
              ? {
                  ...item,
                  imageUrl: nextImageUrl || "",
                  ...(hasSizeOverride
                    ? {
                        width: Number(nextWidth),
                        height: Number(nextHeight),
                      }
                    : {}),
                }
              : item
          ),
        };
      });
      patchSlides(nextSlides, activeSlide.id);
    },
    [activeSlide?.id, patchSlides, slides]
  );
  const updateLayerItemStyle = useCallback(
    (layerId, stylePatch) => {
      if (!layerId || !activeSlide?.id || !stylePatch || typeof stylePatch !== "object") return;
      const nextSlides = slides.map((slide) => {
        if (slide.id !== activeSlide.id) return slide;
        const currentLayerItems = Array.isArray(slide.layerItems) ? slide.layerItems : [];
        return {
          ...slide,
          layerItems: currentLayerItems.map((item) =>
            item?.id === layerId ? { ...item, ...stylePatch } : item
          ),
        };
      });
      patchSlides(nextSlides, activeSlide.id);
    },
    [activeSlide?.id, patchSlides, slides]
  );
  const handleLayerImageChange = useCallback(
    (url) => {
      if (!selectedImageLayerId) return;
      const nextUrl = typeof url === "string" ? url.trim() : "";
      const targetLayerId = selectedImageLayerId;
      const targetLayerItem = activeLayerItems.find(
        (item) => item?.id === targetLayerId && item?.type === "image"
      );
      const baseSize = buildSafeImageSize(targetLayerItem?.width, targetLayerItem?.height);
      if (!nextUrl) {
        updateLayerItemImage(targetLayerId, "");
        return;
      }
      if (typeof window === "undefined" || typeof window.Image !== "function") {
        updateLayerItemImage(targetLayerId, nextUrl, baseSize.width, baseSize.height);
        return;
      }
      const imageProbe = new window.Image();
      imageProbe.onload = () => {
        const naturalWidth = Number(imageProbe.naturalWidth);
        const naturalHeight = Number(imageProbe.naturalHeight);
        if (!Number.isFinite(naturalWidth) || !Number.isFinite(naturalHeight) || naturalHeight <= 0) {
          updateLayerItemImage(targetLayerId, nextUrl, baseSize.width, baseSize.height);
          return;
        }
        const aspectRatio = naturalWidth / naturalHeight;
        let nextWidth = baseSize.width;
        let nextHeight = nextWidth / aspectRatio;
        if (!Number.isFinite(nextHeight) || nextHeight <= 0) {
          nextHeight = baseSize.height;
        }
        let safeSize = buildSafeImageSize(nextWidth, nextHeight);
        if (Math.abs((safeSize.width / safeSize.height) - aspectRatio) > 0.001) {
          nextHeight = safeSize.width / aspectRatio;
          safeSize = buildSafeImageSize(safeSize.width, nextHeight);
        }
        updateLayerItemImage(targetLayerId, nextUrl, safeSize.width, safeSize.height);
      };
      imageProbe.onerror = () => {
        updateLayerItemImage(targetLayerId, nextUrl, baseSize.width, baseSize.height);
      };
      imageProbe.src = nextUrl;
    },
    [activeLayerItems, buildSafeImageSize, selectedImageLayerId, updateLayerItemImage]
  );
  const updateSelectedShapeStyle = useCallback(
    (stylePatch) => {
      if (!selectedShapeLayer?.id) return;
      updateLayerItemStyle(selectedShapeLayer.id, stylePatch);
    },
    [selectedShapeLayer?.id, updateLayerItemStyle]
  );
  const updateSelectedImageStyle = useCallback(
    (stylePatch) => {
      if (!selectedImageLayer?.id) return;
      updateLayerItemStyle(selectedImageLayer.id, stylePatch);
    },
    [selectedImageLayer?.id, updateLayerItemStyle]
  );
  const updateSelectedIconStyle = useCallback(
    (stylePatch) => {
      if (!selectedIconLayer?.id) return;
      updateLayerItemStyle(selectedIconLayer.id, stylePatch);
    },
    [selectedIconLayer?.id, updateLayerItemStyle]
  );
  const updateSelectedTextStyle = useCallback(
    (stylePatch) => {
      if (!selectedTextLayer?.id) return;
      updateLayerItemStyle(selectedTextLayer.id, stylePatch);
    },
    [selectedTextLayer?.id, updateLayerItemStyle]
  );
  const updateSelectedButtonStyle = useCallback(
    (stylePatch) => {
      if (!selectedButtonLayer?.id) return;
      updateLayerItemStyle(selectedButtonLayer.id, stylePatch);
    },
    [selectedButtonLayer?.id, updateLayerItemStyle]
  );
  const commitTextText = useCallback(
    (layerId, rawText, fallbackText = null) => {
      if (!layerId) return;
      const targetLayer = activeLayerItems.find((item) => item?.id === layerId) || null;
      const defaultText =
        typeof fallbackText === "string" && fallbackText.trim()
          ? fallbackText.trim()
          : targetLayer?.type === "heading"
            ? "Heading"
            : targetLayer?.type === "button" ||
                targetLayer?.type === "button-primary" ||
                targetLayer?.type === "button-dual" ||
                targetLayer?.type === "button-secondary"
              ? "Button"
            : "Text";
      const normalizedText = String(rawText ?? "")
        .replace(/\r\n?/g, "\n")
        .split("\n")
        .map((line) => line.replace(/\s+/g, " ").trim())
        .join("\n")
        .trim();
      updateLayerItemStyle(layerId, {
        text: normalizedText || defaultText,
      });
    },
    [activeLayerItems, updateLayerItemStyle]
  );
  const startTextEditing = useCallback(
    (layerId) => {
      if (!layerId) return;
      const currentLayer = activeLayerItems.find((item) => item?.id === layerId) || null;
      const isButtonLayer =
        currentLayer?.type === "button" ||
        currentLayer?.type === "button-primary" ||
        currentLayer?.type === "button-dual" ||
        currentLayer?.type === "button-secondary";
      const defaultText =
        currentLayer?.type === "heading"
          ? "Heading"
          : currentLayer?.type === "button" ||
              currentLayer?.type === "button-primary" ||
              currentLayer?.type === "button-dual" ||
              currentLayer?.type === "button-secondary"
            ? "Button"
            : "Text";
      const initialText = String(currentLayer?.text || currentLayer?.label || defaultText);
      setSelectedLayerWithSync(layerId);
      setEditingTextDrafts((prev) => ({
        ...prev,
        [layerId]: initialText,
      }));
      setEditingTextLayerId(layerId);
      if (typeof window !== "undefined") {
        window.requestAnimationFrame(() => {
          const editorEl = document.querySelector(`[data-text-editor-id="${layerId}"]`);
          if (!(editorEl instanceof HTMLElement)) return;
          editorEl.setAttribute("dir", "ltr");
          editorEl.style.direction = "ltr";
          editorEl.style.unicodeBidi = "plaintext";
          editorEl.style.writingMode = "horizontal-tb";
          if (isButtonLayer) {
            editorEl.style.textAlign = "left";
          }
          editorEl.focus();
          if (editorEl instanceof HTMLInputElement || editorEl instanceof HTMLTextAreaElement) {
            const caretPos = editorEl.value.length;
            editorEl.setSelectionRange(caretPos, caretPos);
            return;
          }
          const selection = window.getSelection?.();
          if (!selection) return;
          const range = document.createRange();
          range.selectNodeContents(editorEl);
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
        });
      }
    },
    [activeLayerItems, setSelectedLayerWithSync]
  );
  const getSanitizedClipboardText = useCallback((event) => {
    const plain = event?.clipboardData?.getData("text/plain");
    if (typeof plain === "string" && plain.length > 0) {
      return normalizeClipboardText(plain);
    }
    const html = event?.clipboardData?.getData("text/html");
    return extractSafePlainTextFromHtml(html);
  }, []);
  const insertTextAtCursor = useCallback((textToInsert) => {
    if (typeof window === "undefined" || typeof document === "undefined") return;
    const selection = window.getSelection?.();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    range.deleteContents();
    const textNode = document.createTextNode(textToInsert);
    range.insertNode(textNode);
    range.setStartAfter(textNode);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }, []);
  const deleteLayerItem = useCallback(
    (layerId) => {
      if (!layerId || !activeSlide?.id) return;
      const nextSlides = slides.map((slide) => {
        if (slide.id !== activeSlide.id) return slide;
        const currentLayerItems = Array.isArray(slide.layerItems) ? slide.layerItems : [];
        return {
          ...slide,
          layerItems: currentLayerItems.filter((item) => item?.id !== layerId),
        };
      });
      const nextSelectedLayerId = selectedLayerId === layerId ? null : selectedLayerId;
      setSelectedLayerId(nextSelectedLayerId);
      handleUpdateSection({
        ...sectionData,
        slides: nextSlides,
        activeSlideId: activeSlide.id,
        activeLayerItemId: nextSelectedLayerId,
      });
    },
    [activeSlide?.id, handleUpdateSection, sectionData, selectedLayerId, slides]
  );
  const addLayerItemToActiveSlide = useCallback(
    (nextLayerItem, nextSelectedLayerId = undefined) => {
      if (!nextLayerItem || !activeSlide?.id) return;
      const nextSlides = slides.map((slide) => {
        if (slide.id !== activeSlide.id) return slide;
        const currentLayerItems = Array.isArray(slide.layerItems) ? slide.layerItems : [];
        return {
          ...slide,
          layerItems: [...currentLayerItems, nextLayerItem],
        };
      });
      const hasSelectedLayerOverride = typeof nextSelectedLayerId !== "undefined";
      const safeSelectedLayerId = hasSelectedLayerOverride
        ? (
            typeof nextSelectedLayerId === "string" && nextSelectedLayerId.trim()
              ? nextSelectedLayerId
              : null
          )
        : undefined;
      if (hasSelectedLayerOverride) {
        setSelectedLayerId(safeSelectedLayerId);
      }
      patchSlides(nextSlides, activeSlide.id, safeSelectedLayerId);
    },
    [activeSlide?.id, patchSlides, slides]
  );
  const buildLayerItemFromType = useCallback((type, x, y, index, zIndex) => {
    const safeType = HERO_LAYER_ITEM_TYPES.has(type) ? type : null;
    if (!safeType) return null;
    const base = {
      id: `hero-layer-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: safeType,
      x,
      y,
      zIndex,
      ...HERO_LAYER_ANIMATION_DEFAULTS,
    };
    if (safeType === "image")
      return {
        ...base,
        label: "Image",
        width: IMAGE_LAYER_DEFAULT_WIDTH,
        height: IMAGE_LAYER_DEFAULT_HEIGHT,
        isImageResized: false,
        imageOpacity: 100,
        imageBlur: 0,
        imageBrightness: 100,
      };
    if (safeType === "rectangle")
      return {
        ...base,
        label: "Rectangle",
        width: RECTANGLE_LAYER_DEFAULT_WIDTH,
        height: RECTANGLE_LAYER_DEFAULT_HEIGHT,
        isRectangleResized: false,
        fillColor: "#ffffff",
        fillOpacity: 51,
        fillBlur: 0,
        shapeRadius: 8,
        shapeStrokeEnabled: false,
      };
    if (safeType === "circle")
      return {
        ...base,
        label: "Circle",
        width: CIRCLE_LAYER_DEFAULT_SIZE,
        height: CIRCLE_LAYER_DEFAULT_SIZE,
        isCircleResized: false,
        fillColor: "#ffffff",
        fillOpacity: 51,
        fillBlur: 0,
        shapeStrokeEnabled: false,
      };
    if (safeType === "text")
      return {
        ...base,
        label: "Text",
        text: "Text",
        width: calculateTextLayerBoxSize(
          "Text",
          TEXT_LAYER_DEFAULT_FONT_SIZE,
          null,
          TEXT_LAYER_CHAR_WIDTH_FACTOR,
          TEXT_LAYER_FONT_WEIGHT_NORMAL,
          true,
          TEXT_LAYER_HORIZONTAL_PADDING,
          TEXT_LAYER_VERTICAL_PADDING,
          TEXT_LAYER_LINE_HEIGHT_FACTOR,
          themeTextFontFamily
        ).width,
        height: calculateTextLayerBoxSize(
          "Text",
          TEXT_LAYER_DEFAULT_FONT_SIZE,
          null,
          TEXT_LAYER_CHAR_WIDTH_FACTOR,
          TEXT_LAYER_FONT_WEIGHT_NORMAL,
          true,
          TEXT_LAYER_HORIZONTAL_PADDING,
          TEXT_LAYER_VERTICAL_PADDING,
          TEXT_LAYER_LINE_HEIGHT_FACTOR,
          themeTextFontFamily
        ).height,
        fontSize: TEXT_LAYER_DEFAULT_FONT_SIZE,
        isTextResized: false,
        textColor: "#ffffff",
        textOpacity: 90,
        textShadowEnabled: false,
        textBold: false,
        textAlign: "center",
        textStrokeEnabled: false,
        textLetterSpacing: 0,
        textLineHeight: TEXT_LAYER_LINE_HEIGHT_FACTOR,
      };
    if (safeType === "heading")
      return {
        ...base,
        label: "Heading",
        text: "Heading",
        width: buildSafeHeadingWidth(
          calculateTextLayerBoxSize(
            "Heading",
            HEADING_LAYER_DEFAULT_FONT_SIZE,
            null,
            TEXT_LAYER_CHAR_WIDTH_FACTOR,
            TEXT_LAYER_FONT_WEIGHT_NORMAL,
            true,
            TEXT_LAYER_HORIZONTAL_PADDING,
            TEXT_LAYER_VERTICAL_PADDING,
            TEXT_LAYER_LINE_HEIGHT_FACTOR,
            themeHeadingFontFamily || themeTextFontFamily
          ).width +
            HEADING_LAYER_INITIAL_WIDTH_BOOST_PX
        ),
        height: calculateTextLayerBoxSize(
          "Heading",
          HEADING_LAYER_DEFAULT_FONT_SIZE,
          null,
          TEXT_LAYER_CHAR_WIDTH_FACTOR,
          TEXT_LAYER_FONT_WEIGHT_NORMAL,
          true,
          TEXT_LAYER_HORIZONTAL_PADDING,
          TEXT_LAYER_VERTICAL_PADDING,
          TEXT_LAYER_LINE_HEIGHT_FACTOR,
          themeHeadingFontFamily || themeTextFontFamily
        ).height,
        fontSize: HEADING_LAYER_DEFAULT_FONT_SIZE,
        isTextResized: false,
        textColor: "#ffffff",
        textOpacity: 90,
        textShadowEnabled: false,
        textBold: false,
        textAlign: "center",
        textStrokeEnabled: false,
        textLetterSpacing: 0,
        textLineHeight: TEXT_LAYER_LINE_HEIGHT_FACTOR,
      };
    if (safeType === "button" || safeType === "button-primary")
      return {
        ...base,
        label: "Button",
        text: "Button",
        variant: "primary",
        buttonBgColor: "#ffffff",
        buttonTextColor: "#0f172a",
        buttonOpacity: 100,
        buttonRadius: BUTTON_LAYER_DEFAULT_RADIUS,
        buttonFontSizeBase: BUTTON_LAYER_BASE_FONT_SIZE,
        width: BUTTON_LAYER_DEFAULT_WIDTH,
        height: BUTTON_LAYER_DEFAULT_HEIGHT,
        isButtonResized: false,
      };
    if (safeType === "button-dual" || safeType === "button-secondary")
      return {
        ...base,
        label: "Button Dual",
        text: "Button Dual",
        variant: "dual",
        buttonBgColor: "#ffffff",
        buttonTextColor: "#0f172a",
        buttonOpacity: 100,
        buttonRadius: BUTTON_LAYER_DEFAULT_RADIUS,
        buttonFontSizeBase: BUTTON_DUAL_LAYER_BASE_FONT_SIZE,
        buttonSecondaryBgColor: "#ffffff",
        buttonSecondaryTextColor: "#0f172a",
        buttonSecondaryBorderColor: "#ffffff",
        width: BUTTON_DUAL_LAYER_DEFAULT_WIDTH,
        height: BUTTON_LAYER_DEFAULT_HEIGHT,
        isButtonResized: false,
      };
    if (safeType === "icon")
      return {
        ...base,
        label: "Icon",
        text: `Icon ${index + 1}`,
        width: ICON_LAYER_DEFAULT_SIZE,
        height: ICON_LAYER_DEFAULT_SIZE,
        isIconResized: false,
        faIcon: {
          name: "faStar",
          type: "fas",
        },
        iconColor: "#334155",
        iconOpacity: 100,
        iconShadowEnabled: false,
      };
    if (safeType === "dual-icon")
      return { ...base, label: "Dual Icon", text: `Dual Icon ${index + 1}`, variant: "legacy" };
    return base;
  }, [
    buildSafeHeadingWidth,
    calculateTextLayerBoxSize,
    themeHeadingFontFamily,
    themeTextFontFamily,
  ]);
  const handleLayerDrop = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      const rawPayload =
        event.dataTransfer.getData("application/x-hero-layer-item") ||
        event.dataTransfer.getData("text/plain");
      if (!rawPayload || !previewDropRef.current) return;
      let payload = null;
      try {
        payload = JSON.parse(rawPayload);
      } catch {
        payload = null;
      }
      if (!payload || payload.source !== "hero-layer-library") return;
      const dropRect = previewDropRef.current.getBoundingClientRect();
      const localX = Math.max(24, Math.min(dropRect.width - 24, event.clientX - dropRect.left));
      const localY = Math.max(24, Math.min(dropRect.height - 24, event.clientY - dropRect.top));
      const nextZIndex = activeLayerItems.reduce(
        (max, item, index) => Math.max(max, getSafeLayerZIndex(item, index)),
        0
      ) + 1;
      const nextLayerItem = buildLayerItemFromType(
        payload.type,
        localX,
        localY,
        activeLayerItems.length,
        nextZIndex
      );
      const shouldSelectNewLayer =
        nextLayerItem?.type === "text" ||
        nextLayerItem?.type === "heading" ||
        nextLayerItem?.type === "button" ||
        nextLayerItem?.type === "button-primary" ||
        nextLayerItem?.type === "button-dual" ||
        nextLayerItem?.type === "button-secondary" ||
        nextLayerItem?.type === "image" ||
        nextLayerItem?.type === "rectangle" ||
        nextLayerItem?.type === "circle" ||
        nextLayerItem?.type === "icon";
      const nextSelectedLayerId = shouldSelectNewLayer
        ? nextLayerItem?.id || null
        : (sectionData?.activeLayerItemId || null);
      addLayerItemToActiveSlide(nextLayerItem, nextSelectedLayerId);
    },
    [activeLayerItems, addLayerItemToActiveSlide, buildLayerItemFromType, sectionData?.activeLayerItemId]
  );
  const buildSafeLayerPoint = useCallback((rawX, rawY, layerType = null, layerWidth = null, layerHeight = null) => {
    const dropRect = previewDropRef.current?.getBoundingClientRect();
    if (!dropRect) return null;
    if (layerType === "image") {
      const safeImageSize = buildSafeImageSize(layerWidth, layerHeight);
      const maxOverflowWidth =
        Math.max(safeImageSize.width, safeImageSize.height) * IMAGE_LAYER_MAX_OVERFLOW_RATIO;
      const maxOverflowHeight = safeImageSize.height * IMAGE_LAYER_MAX_OVERFLOW_RATIO;
      const minX = safeImageSize.width / 2 - maxOverflowWidth;
      const maxX = dropRect.width + maxOverflowWidth - safeImageSize.width / 2;
      const minY = safeImageSize.height / 2 - maxOverflowHeight;
      const maxY = dropRect.height + maxOverflowHeight - safeImageSize.height / 2;
      const safeX = Math.max(minX, Math.min(maxX, rawX));
      const safeY = Math.max(minY, Math.min(maxY, rawY));
      return { x: safeX, y: safeY };
    }
    if (layerType === "rectangle" || layerType === "circle") {
      const extraX = dropRect.width;
      const extraY = dropRect.height;
      const safeX = Math.max(-extraX, Math.min(dropRect.width + extraX, rawX));
      const safeY = Math.max(-extraY, Math.min(dropRect.height + extraY, rawY));
      return { x: safeX, y: safeY };
    }
    const safeX = Math.max(24, Math.min(dropRect.width - 24, rawX));
    const safeY = Math.max(24, Math.min(dropRect.height - 24, rawY));
    return { x: safeX, y: safeY };
  }, [buildSafeImageSize]);
  const endLayerDrag = useCallback(() => {
    const meta = dragLayerMetaRef.current;
    if (!meta) return;
    dragLayerMetaRef.current = null;
    const draft = layerDragDraft[meta.layerId];
    const moved =
      draft &&
      Number.isFinite(Number(draft.x)) &&
      Number.isFinite(Number(draft.y)) &&
      (Math.abs(Number(draft.x) - Number(meta.startX)) > 0.5 ||
        Math.abs(Number(draft.y) - Number(meta.startY)) > 0.5);
    if (moved) {
      updateLayerItemPosition(meta.layerId, Number(draft.x), Number(draft.y));
    }
    setLayerDragDraft((prev) => {
      if (!Object.prototype.hasOwnProperty.call(prev, meta.layerId)) return prev;
      const next = { ...prev };
      delete next[meta.layerId];
      return next;
    });
    setDragLayerId(null);
  }, [layerDragDraft, updateLayerItemPosition]);
  const endLayerResize = useCallback(() => {
    const meta = resizeLayerMetaRef.current;
    if (!meta) return;
    resizeLayerMetaRef.current = null;
    const draft = layerResizeDraft[meta.layerId];
    if (draft && Number.isFinite(Number(draft.width)) && Number.isFinite(Number(draft.height))) {
      const nextButtonFontSizeBase = Number(draft.buttonFontSizeBase);
      const buttonFontPatch = Number.isFinite(nextButtonFontSizeBase)
        ? { buttonFontSizeBase: nextButtonFontSizeBase }
        : null;
      updateLayerItemSize(
        meta.layerId,
        Number(draft.width),
        Number(draft.height),
        Number.isFinite(Number(draft.fontSize)) ? Number(draft.fontSize) : null,
        Number.isFinite(Number(draft.x)) ? Number(draft.x) : null,
        Number.isFinite(Number(draft.y)) ? Number(draft.y) : null,
        buttonFontPatch
      );
    }
    setLayerResizeDraft((prev) => {
      if (!Object.prototype.hasOwnProperty.call(prev, meta.layerId)) return prev;
      const next = { ...prev };
      delete next[meta.layerId];
      return next;
    });
    setResizeLayerId(null);
  }, [layerResizeDraft, updateLayerItemSize]);
  const moveLayerDrag = useCallback(
    (event) => {
      const meta = dragLayerMetaRef.current;
      if (!meta || !previewDropRef.current) return;
      event.preventDefault();
      const dropRect = previewDropRef.current.getBoundingClientRect();
      const rawX = event.clientX - dropRect.left - meta.pointerOffsetX;
      const rawY = event.clientY - dropRect.top - meta.pointerOffsetY;
      const safePoint = buildSafeLayerPoint(
        rawX,
        rawY,
        meta.layerType,
        meta.layerWidth,
        meta.layerHeight
      );
      if (!safePoint) return;
      setLayerDragDraft((prev) => {
        const current = prev[meta.layerId];
        if (current?.x === safePoint.x && current?.y === safePoint.y) return prev;
        return {
          ...prev,
          [meta.layerId]: safePoint,
        };
      });
    },
    [buildSafeLayerPoint]
  );
  const startLayerDrag = useCallback(
    (event, layerItem, currentX, currentY, currentWidth = null, currentHeight = null) => {
      if (!layerItem?.id || !previewDropRef.current || resizeLayerMetaRef.current) return;
      event.preventDefault();
      event.stopPropagation();
      const dropRect = previewDropRef.current.getBoundingClientRect();
      dragLayerMetaRef.current = {
        layerId: layerItem.id,
        layerType: layerItem.type || null,
        startX: currentX,
        startY: currentY,
        layerWidth: Number.isFinite(Number(currentWidth)) ? Number(currentWidth) : null,
        layerHeight: Number.isFinite(Number(currentHeight)) ? Number(currentHeight) : null,
        pointerOffsetX: event.clientX - (dropRect.left + currentX),
        pointerOffsetY: event.clientY - (dropRect.top + currentY),
      };
      setDragLayerId(layerItem.id);
      setLayerDragDraft((prev) => ({
        ...prev,
        [layerItem.id]: { x: currentX, y: currentY },
      }));
    },
    []
  );
  const moveLayerResize = useCallback(
    (event) => {
      const meta = resizeLayerMetaRef.current;
      if (!meta) return;
      event.preventDefault();
      const deltaX = event.clientX - meta.startClientX;
      const deltaY = event.clientY - meta.startClientY;
      if (meta.mode === "image" || meta.mode === "icon") {
        const isIconMode = meta.mode === "icon";
        const horizontalDelta = meta.corner.includes("e") ? deltaX : -deltaX;
        const verticalDelta = meta.corner.includes("s") ? deltaY : -deltaY;
        const widthScale = (meta.startWidth + horizontalDelta) / Math.max(1, meta.startWidth);
        const heightScale = (meta.startHeight + verticalDelta) / Math.max(1, meta.startHeight);
        const rawScale =
          Math.abs(widthScale - 1) >= Math.abs(heightScale - 1) ? widthScale : heightScale;
        const minScale = Math.max(
          (isIconMode ? ICON_LAYER_MIN_SIZE : IMAGE_LAYER_MIN_WIDTH) / Math.max(1, meta.startWidth),
          (isIconMode ? ICON_LAYER_MIN_SIZE : IMAGE_LAYER_MIN_HEIGHT) / Math.max(1, meta.startHeight)
        );
        const maxScale = Math.min(
          (isIconMode ? ICON_LAYER_MAX_SIZE : IMAGE_LAYER_MAX_WIDTH) / Math.max(1, meta.startWidth),
          (isIconMode ? ICON_LAYER_MAX_SIZE : IMAGE_LAYER_MAX_HEIGHT) / Math.max(1, meta.startHeight)
        );
        const safeScale = Math.max(minScale, Math.min(maxScale, Number(rawScale) || 1));
        const safeSize = isIconMode
          ? buildSafeIconSize(Math.round(meta.startWidth * safeScale))
          : {
              width: Math.round(meta.startWidth * safeScale),
              height: Math.round(meta.startHeight * safeScale),
            };
        setLayerResizeDraft((prev) => {
          const current = prev[meta.layerId];
          if (current?.width === safeSize.width && current?.height === safeSize.height) {
            return prev;
          }
          return {
            ...prev,
            [meta.layerId]: safeSize,
          };
        });
        return;
      }
      if (meta.mode === "image-edge") {
        let nextWidth = meta.startWidth;
        let nextHeight = meta.startHeight;
        let nextX = meta.startX;
        let nextY = meta.startY;
        if (meta.edge === "e" || meta.edge === "w") {
          const rawWidth = meta.edge === "e" ? meta.startWidth + deltaX : meta.startWidth - deltaX;
          const safeWidth = Math.max(
            IMAGE_LAYER_MIN_WIDTH,
            Math.min(IMAGE_LAYER_MAX_WIDTH, Number(rawWidth) || meta.startWidth)
          );
          const widthDelta = safeWidth - meta.startWidth;
          nextWidth = safeWidth;
          nextX = meta.edge === "e"
            ? meta.startX + widthDelta / 2
            : meta.startX - widthDelta / 2;
        } else if (meta.edge === "s" || meta.edge === "n") {
          const rawHeight = meta.edge === "s" ? meta.startHeight + deltaY : meta.startHeight - deltaY;
          const safeHeight = Math.max(
            IMAGE_LAYER_MIN_HEIGHT,
            Math.min(IMAGE_LAYER_MAX_HEIGHT, Number(rawHeight) || meta.startHeight)
          );
          const heightDelta = safeHeight - meta.startHeight;
          nextHeight = safeHeight;
          nextY = meta.edge === "s"
            ? meta.startY + heightDelta / 2
            : meta.startY - heightDelta / 2;
        }
        setLayerResizeDraft((prev) => {
          const current = prev[meta.layerId];
          if (
            current?.width === nextWidth &&
            current?.height === nextHeight &&
            current?.x === nextX &&
            current?.y === nextY
          ) {
            return prev;
          }
          return {
            ...prev,
            [meta.layerId]: {
              width: nextWidth,
              height: nextHeight,
              x: nextX,
              y: nextY,
            },
          };
        });
        return;
      }
      if (meta.mode === "icon-edge") {
        let nextSize = meta.startWidth;
        let nextX = meta.startX;
        let nextY = meta.startY;
        if (meta.edge === "e" || meta.edge === "w") {
          const rawSize = meta.edge === "e" ? meta.startWidth + deltaX : meta.startWidth - deltaX;
          const safeSize = buildSafeIconSize(rawSize).width;
          const sizeDelta = safeSize - meta.startWidth;
          nextSize = safeSize;
          nextX = meta.edge === "e"
            ? meta.startX + sizeDelta / 2
            : meta.startX - sizeDelta / 2;
        } else if (meta.edge === "s" || meta.edge === "n") {
          const rawSize = meta.edge === "s" ? meta.startHeight + deltaY : meta.startHeight - deltaY;
          const safeSize = buildSafeIconSize(rawSize).height;
          const sizeDelta = safeSize - meta.startHeight;
          nextSize = safeSize;
          nextY = meta.edge === "s"
            ? meta.startY + sizeDelta / 2
            : meta.startY - sizeDelta / 2;
        }
        setLayerResizeDraft((prev) => {
          const current = prev[meta.layerId];
          if (
            current?.width === nextSize &&
            current?.height === nextSize &&
            current?.x === nextX &&
            current?.y === nextY
          ) {
            return prev;
          }
          return {
            ...prev,
            [meta.layerId]: {
              width: nextSize,
              height: nextSize,
              x: nextX,
              y: nextY,
            },
          };
        });
        return;
      }
      if (meta.mode === "text-edge") {
        let nextWidth = meta.startWidth;
        let nextX = meta.startX;
        if (meta.edge === "e" || meta.edge === "w") {
          const rawWidth = meta.edge === "e" ? meta.startWidth + deltaX : meta.startWidth - deltaX;
          const safeWidth = buildSafeHeadingWidth(rawWidth);
          const widthDelta = safeWidth - meta.startWidth;
          nextWidth = safeWidth;
          nextX = meta.edge === "e"
            ? meta.startX + widthDelta / 2
            : meta.startX - widthDelta / 2;
        }
        const safeTextSize = calculateTextLayerBoxSize(
          meta.textValue || "Text",
          meta.startFontSize || TEXT_LAYER_DEFAULT_FONT_SIZE,
          nextWidth,
          meta.textCharWidthFactor || TEXT_LAYER_CHAR_WIDTH_FACTOR,
          meta.textFontWeight || TEXT_LAYER_FONT_WEIGHT_NORMAL,
          meta.textAllowWrap !== false,
          meta.textHorizontalPadding ?? TEXT_LAYER_HORIZONTAL_PADDING,
          meta.textVerticalPadding ?? TEXT_LAYER_VERTICAL_PADDING,
          meta.textLineHeight ?? TEXT_LAYER_LINE_HEIGHT_FACTOR,
          meta.textFontFamily ?? null,
          meta.textLetterSpacing ?? 0
        );
        setLayerResizeDraft((prev) => {
          const current = prev[meta.layerId];
          if (
            current?.width === nextWidth &&
            current?.height === safeTextSize.height &&
            current?.x === nextX &&
            current?.y === meta.startY
          ) {
            return prev;
          }
          return {
            ...prev,
            [meta.layerId]: {
              width: nextWidth,
              height: safeTextSize.height,
              x: nextX,
              y: meta.startY,
            },
          };
        });
        return;
      }
      if (meta.mode === "rectangle") {
        const horizontalDelta = meta.corner.includes("e") ? deltaX : -deltaX;
        const verticalDelta = meta.corner.includes("s") ? deltaY : -deltaY;
        const widthScale = (meta.startWidth + horizontalDelta) / Math.max(1, meta.startWidth);
        const heightScale = (meta.startHeight + verticalDelta) / Math.max(1, meta.startHeight);
        const rawScale =
          Math.abs(widthScale - 1) >= Math.abs(heightScale - 1) ? widthScale : heightScale;
        const isRectangleLayer = meta.layerType === "rectangle";
        const minScale = Math.max(
          (isRectangleLayer ? RECTANGLE_LAYER_MIN_WIDTH : IMAGE_LAYER_MIN_WIDTH) /
            Math.max(1, meta.startWidth),
          (isRectangleLayer ? RECTANGLE_LAYER_MIN_HEIGHT : IMAGE_LAYER_MIN_HEIGHT) /
            Math.max(1, meta.startHeight)
        );
        const maxScale = Math.min(
          IMAGE_LAYER_MAX_WIDTH / Math.max(1, meta.startWidth),
          IMAGE_LAYER_MAX_HEIGHT / Math.max(1, meta.startHeight)
        );
        const safeScale = Math.max(minScale, Math.min(maxScale, Number(rawScale) || 1));
        const safeSize = isRectangleLayer
          ? buildSafeRectangleSize(
              Math.round(meta.startWidth * safeScale),
              Math.round(meta.startHeight * safeScale)
            )
          : buildSafeImageSize(
              Math.round(meta.startWidth * safeScale),
              Math.round(meta.startHeight * safeScale)
            );
        const isButtonLayer =
          meta.layerType === "button" ||
          meta.layerType === "button-primary" ||
          meta.layerType === "button-dual" ||
          meta.layerType === "button-secondary";
        const fallbackButtonFontSize =
          meta.layerType === "button-dual" || meta.layerType === "button-secondary"
            ? BUTTON_DUAL_LAYER_BASE_FONT_SIZE
            : BUTTON_LAYER_BASE_FONT_SIZE;
        const startButtonFontSize = Number.isFinite(Number(meta.startButtonFontSize))
          ? Number(meta.startButtonFontSize)
          : fallbackButtonFontSize;
        const nextButtonFontSizeBase = isButtonLayer
          ? Math.max(
              BUTTON_LAYER_MIN_FONT_SIZE,
              Math.min(BUTTON_LAYER_MAX_FONT_SIZE, Math.round(startButtonFontSize * safeScale))
            )
          : null;
        setLayerResizeDraft((prev) => {
          const current = prev[meta.layerId];
          if (
            current?.width === safeSize.width &&
            current?.height === safeSize.height &&
            (!isButtonLayer || current?.buttonFontSizeBase === nextButtonFontSizeBase)
          ) {
            return prev;
          }
          return {
            ...prev,
            [meta.layerId]: isButtonLayer
              ? {
                  ...safeSize,
                  buttonFontSizeBase: nextButtonFontSizeBase,
                }
              : safeSize,
          };
        });
        return;
      }
      if (meta.mode === "rectangle-edge") {
        let nextWidth = meta.startWidth;
        let nextHeight = meta.startHeight;
        let nextX = meta.startX;
        let nextY = meta.startY;
        const isRectangleLayer = meta.layerType === "rectangle";
        if (meta.edge === "e" || meta.edge === "w") {
          const rawWidth = meta.edge === "e" ? meta.startWidth + deltaX : meta.startWidth - deltaX;
          const safeSize = isRectangleLayer
            ? buildSafeRectangleSize(rawWidth, meta.startHeight)
            : buildSafeImageSize(rawWidth, meta.startHeight);
          const widthDelta = safeSize.width - meta.startWidth;
          nextWidth = safeSize.width;
          nextHeight = safeSize.height;
          nextX = meta.edge === "e"
            ? meta.startX + widthDelta / 2
            : meta.startX - widthDelta / 2;
        } else if (meta.edge === "s" || meta.edge === "n") {
          const rawHeight = meta.edge === "s" ? meta.startHeight + deltaY : meta.startHeight - deltaY;
          const safeSize = isRectangleLayer
            ? buildSafeRectangleSize(meta.startWidth, rawHeight)
            : buildSafeImageSize(meta.startWidth, rawHeight);
          const heightDelta = safeSize.height - meta.startHeight;
          nextWidth = safeSize.width;
          nextHeight = safeSize.height;
          nextY = meta.edge === "s"
            ? meta.startY + heightDelta / 2
            : meta.startY - heightDelta / 2;
        }
        setLayerResizeDraft((prev) => {
          const current = prev[meta.layerId];
          if (
            current?.width === nextWidth &&
            current?.height === nextHeight &&
            current?.x === nextX &&
            current?.y === nextY
          ) {
            return prev;
          }
          return {
            ...prev,
            [meta.layerId]: {
              width: nextWidth,
              height: nextHeight,
              x: nextX,
              y: nextY,
            },
          };
        });
        return;
      }
      if (meta.mode === "circle") {
        const horizontalDelta = meta.corner.includes("e") ? deltaX : -deltaX;
        const verticalDelta = meta.corner.includes("s") ? deltaY : -deltaY;
        const widthScale = (meta.startWidth + horizontalDelta) / Math.max(1, meta.startWidth);
        const heightScale = (meta.startHeight + verticalDelta) / Math.max(1, meta.startHeight);
        const rawScale =
          Math.abs(widthScale - 1) >= Math.abs(heightScale - 1) ? widthScale : heightScale;
        const minScale = Math.max(
          CIRCLE_LAYER_MIN_SIZE / Math.max(1, meta.startWidth),
          CIRCLE_LAYER_MIN_SIZE / Math.max(1, meta.startHeight)
        );
        const maxScale = Math.min(
          IMAGE_LAYER_MAX_WIDTH / Math.max(1, meta.startWidth),
          IMAGE_LAYER_MAX_HEIGHT / Math.max(1, meta.startHeight)
        );
        const safeScale = Math.max(minScale, Math.min(maxScale, Number(rawScale) || 1));
        const safeSize = buildSafeCircleStretchSize(
          Math.round(meta.startWidth * safeScale),
          Math.round(meta.startHeight * safeScale)
        );
        setLayerResizeDraft((prev) => {
          const current = prev[meta.layerId];
          if (current?.width === safeSize.width && current?.height === safeSize.height) {
            return prev;
          }
          return {
            ...prev,
            [meta.layerId]: safeSize,
          };
        });
        return;
      }
      if (meta.mode === "circle-edge") {
        let nextWidth = meta.startWidth;
        let nextHeight = meta.startHeight;
        let nextX = meta.startX;
        let nextY = meta.startY;
        if (meta.edge === "e" || meta.edge === "w") {
          const rawWidth = meta.edge === "e" ? meta.startWidth + deltaX : meta.startWidth - deltaX;
          const safeSize = buildSafeCircleStretchSize(rawWidth, meta.startHeight);
          const widthDelta = safeSize.width - meta.startWidth;
          nextWidth = safeSize.width;
          nextHeight = safeSize.height;
          nextX = meta.edge === "e"
            ? meta.startX + widthDelta / 2
            : meta.startX - widthDelta / 2;
        } else if (meta.edge === "s" || meta.edge === "n") {
          const rawHeight = meta.edge === "s" ? meta.startHeight + deltaY : meta.startHeight - deltaY;
          const safeSize = buildSafeCircleStretchSize(meta.startWidth, rawHeight);
          const heightDelta = safeSize.height - meta.startHeight;
          nextWidth = safeSize.width;
          nextHeight = safeSize.height;
          nextY = meta.edge === "s"
            ? meta.startY + heightDelta / 2
            : meta.startY - heightDelta / 2;
        }
        setLayerResizeDraft((prev) => {
          const current = prev[meta.layerId];
          if (
            current?.width === nextWidth &&
            current?.height === nextHeight &&
            current?.x === nextX &&
            current?.y === nextY
          ) {
            return prev;
          }
          return {
            ...prev,
            [meta.layerId]: {
              width: nextWidth,
              height: nextHeight,
              x: nextX,
              y: nextY,
            },
          };
        });
        return;
      }
      if (meta.layerType === "text" || meta.layerType === "heading") {
        const horizontalDelta = meta.corner.includes("e") ? deltaX : -deltaX;
        const verticalDelta = meta.corner.includes("s") ? deltaY : -deltaY;
        const widthScale = (meta.startWidth + horizontalDelta) / Math.max(1, meta.startWidth);
        const heightScale = (meta.startHeight + verticalDelta) / Math.max(1, meta.startHeight);
        const rawScale =
          Math.abs(widthScale - 1) >= Math.abs(heightScale - 1) ? widthScale : heightScale;
        const minScale = Math.max(
          TEXT_LAYER_MIN_WIDTH / Math.max(1, meta.startWidth),
          TEXT_LAYER_MIN_FONT_SIZE / Math.max(1, meta.startFontSize)
        );
        const maxScale = Math.min(
          IMAGE_LAYER_MAX_WIDTH / Math.max(1, meta.startWidth),
          TEXT_LAYER_MAX_FONT_SIZE / Math.max(1, meta.startFontSize)
        );
        const safeScale = Math.max(minScale, Math.min(maxScale, Number(rawScale) || 1));
        const nextWidth = buildSafeHeadingWidth(meta.startWidth * safeScale);
        const nextFontSize = buildSafeTextFontSize(meta.startFontSize * safeScale);
        const safeSize = calculateTextLayerBoxSize(
          meta.textValue,
          nextFontSize,
          nextWidth,
          meta.textCharWidthFactor || TEXT_LAYER_CHAR_WIDTH_FACTOR,
          meta.textFontWeight || TEXT_LAYER_FONT_WEIGHT_NORMAL,
          meta.textAllowWrap !== false,
          meta.textHorizontalPadding ?? TEXT_LAYER_HORIZONTAL_PADDING,
          meta.textVerticalPadding ?? TEXT_LAYER_VERTICAL_PADDING,
          meta.textLineHeight ?? TEXT_LAYER_LINE_HEIGHT_FACTOR,
          meta.textFontFamily ?? null,
          meta.textLetterSpacing ?? 0
        );
        setLayerResizeDraft((prev) => {
          const current = prev[meta.layerId];
          if (
            current?.width === safeSize.width &&
            current?.height === safeSize.height &&
            current?.fontSize === nextFontSize
          ) {
            return prev;
          }
          return {
            ...prev,
            [meta.layerId]: {
              ...safeSize,
              fontSize: nextFontSize,
            },
          };
        });
        return;
      }
      let nextHeight = meta.startHeight;
      if (meta.corner.includes("s")) nextHeight = meta.startHeight + deltaY;
      if (meta.corner.includes("n")) nextHeight = meta.startHeight - deltaY;
      const heightRatio = Math.max(0.2, nextHeight / Math.max(1, meta.startHeight));
      const nextFontSize = buildSafeTextFontSize(
        meta.startFontSize * heightRatio,
        meta.textValue
      );
      const safeSize = calculateTextLayerBoxSize(
        meta.textValue,
        nextFontSize,
        null,
        meta.textCharWidthFactor || TEXT_LAYER_CHAR_WIDTH_FACTOR,
        meta.textFontWeight || TEXT_LAYER_FONT_WEIGHT_NORMAL,
        meta.textAllowWrap !== false,
        meta.textHorizontalPadding ?? TEXT_LAYER_HORIZONTAL_PADDING,
        meta.textVerticalPadding ?? TEXT_LAYER_VERTICAL_PADDING,
        meta.textLineHeight ?? TEXT_LAYER_LINE_HEIGHT_FACTOR,
        meta.textFontFamily ?? null,
        meta.textLetterSpacing ?? 0
      );
      setLayerResizeDraft((prev) => {
        const current = prev[meta.layerId];
        if (
          current?.width === safeSize.width &&
          current?.height === safeSize.height &&
          current?.fontSize === nextFontSize
        ) {
          return prev;
        }
        return {
          ...prev,
          [meta.layerId]: {
            ...safeSize,
            fontSize: nextFontSize,
          },
        };
      });
    },
    [
      buildSafeCircleStretchSize,
      buildSafeHeadingWidth,
      buildSafeIconSize,
      buildSafeImageSize,
      buildSafeRectangleSize,
      buildSafeTextFontSize,
      calculateTextLayerBoxSize,
    ]
  );
  const startLayerResize = useCallback(
    (
      event,
      layerItem,
      currentWidth,
      currentHeight,
      currentFontSize,
      corner,
      mode = "text",
      currentX = null,
      currentY = null
    ) => {
      if (!layerItem?.id) return;
      event.preventDefault();
      event.stopPropagation();
      dragLayerMetaRef.current = null;
      setDragLayerId(null);
      if (mode === "image") {
        const safeSize = buildSafeImageSize(currentWidth, currentHeight);
        resizeLayerMetaRef.current = {
          layerId: layerItem.id,
          startClientX: event.clientX,
          startClientY: event.clientY,
          startWidth: safeSize.width,
          startHeight: safeSize.height,
          corner,
          mode: "image",
        };
        setResizeLayerId(layerItem.id);
        setLayerResizeDraft((prev) => ({
          ...prev,
          [layerItem.id]: safeSize,
        }));
        return;
      }
      if (mode === "icon") {
        const safeSize = buildSafeIconSize(Math.max(currentWidth, currentHeight));
        resizeLayerMetaRef.current = {
          layerId: layerItem.id,
          startClientX: event.clientX,
          startClientY: event.clientY,
          startWidth: safeSize.width,
          startHeight: safeSize.height,
          corner,
          mode: "icon",
        };
        setResizeLayerId(layerItem.id);
        setLayerResizeDraft((prev) => ({
          ...prev,
          [layerItem.id]: safeSize,
        }));
        return;
      }
      if (mode === "image-edge") {
        const safeSize = buildSafeImageSize(currentWidth, currentHeight);
        resizeLayerMetaRef.current = {
          layerId: layerItem.id,
          startClientX: event.clientX,
          startClientY: event.clientY,
          startWidth: safeSize.width,
          startHeight: safeSize.height,
          startX: Number.isFinite(Number(currentX))
            ? Number(currentX)
            : Number.isFinite(Number(layerItem?.x))
              ? Number(layerItem.x)
              : 0,
          startY: Number.isFinite(Number(currentY))
            ? Number(currentY)
            : Number.isFinite(Number(layerItem?.y))
              ? Number(layerItem.y)
              : 0,
          edge: corner,
          mode: "image-edge",
        };
        setResizeLayerId(layerItem.id);
        setLayerResizeDraft((prev) => ({
          ...prev,
          [layerItem.id]: {
            width: safeSize.width,
            height: safeSize.height,
            x: Number.isFinite(Number(currentX))
              ? Number(currentX)
              : Number.isFinite(Number(layerItem?.x))
                ? Number(layerItem.x)
                : 0,
            y: Number.isFinite(Number(currentY))
              ? Number(currentY)
              : Number.isFinite(Number(layerItem?.y))
                ? Number(layerItem.y)
                : 0,
          },
        }));
        return;
      }
      if (mode === "icon-edge") {
        const safeSize = buildSafeIconSize(Math.max(currentWidth, currentHeight));
        resizeLayerMetaRef.current = {
          layerId: layerItem.id,
          startClientX: event.clientX,
          startClientY: event.clientY,
          startWidth: safeSize.width,
          startHeight: safeSize.height,
          startX: Number.isFinite(Number(currentX))
            ? Number(currentX)
            : Number.isFinite(Number(layerItem?.x))
              ? Number(layerItem.x)
              : 0,
          startY: Number.isFinite(Number(currentY))
            ? Number(currentY)
            : Number.isFinite(Number(layerItem?.y))
              ? Number(layerItem.y)
              : 0,
          edge: corner,
          mode: "icon-edge",
        };
        setResizeLayerId(layerItem.id);
        setLayerResizeDraft((prev) => ({
          ...prev,
          [layerItem.id]: {
            width: safeSize.width,
            height: safeSize.height,
            x: Number.isFinite(Number(currentX))
              ? Number(currentX)
              : Number.isFinite(Number(layerItem?.x))
                ? Number(layerItem.x)
                : 0,
            y: Number.isFinite(Number(currentY))
              ? Number(currentY)
              : Number.isFinite(Number(layerItem?.y))
                ? Number(layerItem.y)
                : 0,
          },
        }));
        return;
      }
      if (mode === "text-edge") {
        const safeWidth = buildSafeHeadingWidth(currentWidth);
        const safeFontSize = buildSafeTextFontSize(
          Number(currentFontSize) || TEXT_LAYER_DEFAULT_FONT_SIZE
        );
        const safeTextFontWeight = layerItem?.textBold === true
          ? TEXT_LAYER_FONT_WEIGHT_BOLD
          : TEXT_LAYER_FONT_WEIGHT_NORMAL;
        const safeTextFontFamily =
          layerItem?.type === "heading"
            ? themeHeadingFontFamily || themeTextFontFamily
            : themeTextFontFamily;
        const safeTextLetterSpacing =
          layerItem?.type === "heading"
            ? Math.max(
                HEADING_LAYER_MIN_LETTER_SPACING,
                Math.min(HEADING_LAYER_MAX_LETTER_SPACING, Number(layerItem?.textLetterSpacing) || 0)
              )
            : 0;
        const safeTextLineHeight = (() => {
          const parsed = Number(layerItem?.textLineHeight);
          if (Number.isFinite(parsed)) {
            return Math.max(TEXT_LAYER_MIN_LINE_HEIGHT, Math.min(TEXT_LAYER_MAX_LINE_HEIGHT, parsed));
          }
          return TEXT_LAYER_LINE_HEIGHT_FACTOR;
        })();
        const layerTextValue =
          layerItem?.text || layerItem?.label || (layerItem?.type === "heading" ? "Heading" : "Text");
        const safeSize = calculateTextLayerBoxSize(
          layerTextValue,
          safeFontSize,
          safeWidth,
          TEXT_LAYER_CHAR_WIDTH_FACTOR,
          safeTextFontWeight,
          true,
          TEXT_LAYER_HORIZONTAL_PADDING,
          TEXT_LAYER_VERTICAL_PADDING,
          safeTextLineHeight,
          safeTextFontFamily,
          safeTextLetterSpacing
        );
        resizeLayerMetaRef.current = {
          layerId: layerItem.id,
          startClientX: event.clientX,
          startClientY: event.clientY,
          startWidth: safeWidth,
          startHeight: safeSize.height,
          startFontSize: safeFontSize,
          textValue: layerTextValue,
          startX: Number.isFinite(Number(currentX))
            ? Number(currentX)
            : Number.isFinite(Number(layerItem?.x))
              ? Number(layerItem.x)
              : 0,
          startY: Number.isFinite(Number(currentY))
            ? Number(currentY)
            : Number.isFinite(Number(layerItem?.y))
              ? Number(layerItem.y)
              : 0,
          edge: corner,
          mode: "text-edge",
          textCharWidthFactor: TEXT_LAYER_CHAR_WIDTH_FACTOR,
          textFontWeight: safeTextFontWeight,
          textAllowWrap: true,
          textHorizontalPadding: TEXT_LAYER_HORIZONTAL_PADDING,
          textVerticalPadding: TEXT_LAYER_VERTICAL_PADDING,
          textLineHeight: safeTextLineHeight,
          textFontFamily: safeTextFontFamily,
          textLetterSpacing: safeTextLetterSpacing,
        };
        setResizeLayerId(layerItem.id);
        setLayerResizeDraft((prev) => ({
          ...prev,
          [layerItem.id]: {
            width: safeWidth,
            height: safeSize.height,
            x: Number.isFinite(Number(currentX))
              ? Number(currentX)
              : Number.isFinite(Number(layerItem?.x))
                ? Number(layerItem.x)
                : 0,
            y: Number.isFinite(Number(currentY))
              ? Number(currentY)
              : Number.isFinite(Number(layerItem?.y))
                ? Number(layerItem.y)
                : 0,
          },
        }));
        return;
      }
      if (mode === "rectangle") {
        const safeSize = layerItem?.type === "rectangle"
          ? buildSafeRectangleSize(currentWidth, currentHeight)
          : buildSafeImageSize(currentWidth, currentHeight);
        const isButtonLayer =
          layerItem?.type === "button" ||
          layerItem?.type === "button-primary" ||
          layerItem?.type === "button-dual" ||
          layerItem?.type === "button-secondary";
        const fallbackButtonFontSize =
          layerItem?.type === "button-dual" || layerItem?.type === "button-secondary"
            ? BUTTON_DUAL_LAYER_BASE_FONT_SIZE
            : BUTTON_LAYER_BASE_FONT_SIZE;
        const safeButtonFontSizeBase = isButtonLayer
          ? Math.max(
              BUTTON_LAYER_MIN_FONT_SIZE,
              Math.min(
                BUTTON_LAYER_MAX_FONT_SIZE,
                Number(layerItem?.buttonFontSizeBase) || fallbackButtonFontSize
              )
            )
          : null;
        resizeLayerMetaRef.current = {
          layerId: layerItem.id,
          startClientX: event.clientX,
          startClientY: event.clientY,
          startWidth: safeSize.width,
          startHeight: safeSize.height,
          layerType: layerItem?.type || null,
          startButtonFontSize: safeButtonFontSizeBase,
          corner,
          mode: "rectangle",
        };
        setResizeLayerId(layerItem.id);
        setLayerResizeDraft((prev) => ({
          ...prev,
          [layerItem.id]: isButtonLayer
            ? {
                ...safeSize,
                buttonFontSizeBase: safeButtonFontSizeBase,
              }
            : safeSize,
        }));
        return;
      }
      if (mode === "rectangle-edge") {
        const safeSize = layerItem?.type === "rectangle"
          ? buildSafeRectangleSize(currentWidth, currentHeight)
          : buildSafeImageSize(currentWidth, currentHeight);
        resizeLayerMetaRef.current = {
          layerId: layerItem.id,
          startClientX: event.clientX,
          startClientY: event.clientY,
          startWidth: safeSize.width,
          startHeight: safeSize.height,
          layerType: layerItem?.type || null,
          startX: Number.isFinite(Number(currentX))
            ? Number(currentX)
            : Number.isFinite(Number(layerItem?.x))
              ? Number(layerItem.x)
              : 0,
          startY: Number.isFinite(Number(currentY))
            ? Number(currentY)
            : Number.isFinite(Number(layerItem?.y))
              ? Number(layerItem.y)
              : 0,
          edge: corner,
          mode: "rectangle-edge",
        };
        setResizeLayerId(layerItem.id);
        setLayerResizeDraft((prev) => ({
          ...prev,
          [layerItem.id]: {
            width: safeSize.width,
            height: safeSize.height,
            x: Number.isFinite(Number(currentX))
              ? Number(currentX)
              : Number.isFinite(Number(layerItem?.x))
                ? Number(layerItem.x)
                : 0,
            y: Number.isFinite(Number(currentY))
              ? Number(currentY)
              : Number.isFinite(Number(layerItem?.y))
                ? Number(layerItem.y)
                : 0,
          },
        }));
        return;
      }
      if (mode === "circle") {
        const safeSize = buildSafeCircleStretchSize(currentWidth, currentHeight);
        resizeLayerMetaRef.current = {
          layerId: layerItem.id,
          startClientX: event.clientX,
          startClientY: event.clientY,
          startWidth: safeSize.width,
          startHeight: safeSize.height,
          corner,
          mode: "circle",
        };
        setResizeLayerId(layerItem.id);
        setLayerResizeDraft((prev) => ({
          ...prev,
          [layerItem.id]: safeSize,
        }));
        return;
      }
      if (mode === "circle-edge") {
        const safeSize = buildSafeCircleStretchSize(currentWidth, currentHeight);
        resizeLayerMetaRef.current = {
          layerId: layerItem.id,
          startClientX: event.clientX,
          startClientY: event.clientY,
          startWidth: safeSize.width,
          startHeight: safeSize.height,
          startX: Number.isFinite(Number(currentX))
            ? Number(currentX)
            : Number.isFinite(Number(layerItem?.x))
              ? Number(layerItem.x)
              : 0,
          startY: Number.isFinite(Number(currentY))
            ? Number(currentY)
            : Number.isFinite(Number(layerItem?.y))
              ? Number(layerItem.y)
              : 0,
          edge: corner,
          mode: "circle-edge",
        };
        setResizeLayerId(layerItem.id);
        setLayerResizeDraft((prev) => ({
          ...prev,
          [layerItem.id]: {
            width: safeSize.width,
            height: safeSize.height,
            x: Number.isFinite(Number(currentX))
              ? Number(currentX)
              : Number.isFinite(Number(layerItem?.x))
                ? Number(layerItem.x)
                : 0,
            y: Number.isFinite(Number(currentY))
              ? Number(currentY)
              : Number.isFinite(Number(layerItem?.y))
                ? Number(layerItem.y)
                : 0,
          },
        }));
        return;
      }
      const safeFontSize = buildSafeTextFontSize(
        Number(currentFontSize) || TEXT_LAYER_DEFAULT_FONT_SIZE,
        layerItem?.text
      );
      const safeSize = (() => {
        const layerTextValue =
          layerItem?.text || layerItem?.label || (layerItem?.type === "heading" ? "Heading" : "Text");
        const safeTextFontWeight = layerItem?.textBold === true
          ? TEXT_LAYER_FONT_WEIGHT_BOLD
          : TEXT_LAYER_FONT_WEIGHT_NORMAL;
        const safeTextFontFamily =
          layerItem?.type === "heading"
            ? themeHeadingFontFamily || themeTextFontFamily
            : themeTextFontFamily;
        const safeTextLetterSpacing =
          layerItem?.type === "heading"
            ? Math.max(
                HEADING_LAYER_MIN_LETTER_SPACING,
                Math.min(HEADING_LAYER_MAX_LETTER_SPACING, Number(layerItem?.textLetterSpacing) || 0)
              )
            : 0;
        const safeTextLineHeight = (() => {
          const parsed = Number(layerItem?.textLineHeight);
          if (Number.isFinite(parsed)) {
            return Math.max(TEXT_LAYER_MIN_LINE_HEIGHT, Math.min(TEXT_LAYER_MAX_LINE_HEIGHT, parsed));
          }
          return TEXT_LAYER_LINE_HEIGHT_FACTOR;
        })();
        if (layerItem?.type === "text" || layerItem?.type === "heading") {
          return calculateTextLayerBoxSize(
            layerTextValue,
            safeFontSize,
            currentWidth,
            TEXT_LAYER_CHAR_WIDTH_FACTOR,
            safeTextFontWeight,
            true,
            TEXT_LAYER_HORIZONTAL_PADDING,
            TEXT_LAYER_VERTICAL_PADDING,
            safeTextLineHeight,
            safeTextFontFamily,
            safeTextLetterSpacing
          );
        }
        return calculateTextLayerBoxSize(layerTextValue, safeFontSize);
      })();
      resizeLayerMetaRef.current = {
        layerId: layerItem.id,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startWidth: safeSize.width,
        startHeight: safeSize.height,
        startFontSize: safeFontSize,
        textValue:
          layerItem?.text || layerItem?.label || (layerItem?.type === "heading" ? "Heading" : "Text"),
        layerType: layerItem?.type || null,
        textCharWidthFactor: TEXT_LAYER_CHAR_WIDTH_FACTOR,
        textFontWeight:
          layerItem?.textBold === true
            ? TEXT_LAYER_FONT_WEIGHT_BOLD
            : TEXT_LAYER_FONT_WEIGHT_NORMAL,
        textAllowWrap: true,
        textHorizontalPadding: TEXT_LAYER_HORIZONTAL_PADDING,
        textVerticalPadding: TEXT_LAYER_VERTICAL_PADDING,
        textLineHeight: (() => {
          const parsed = Number(layerItem?.textLineHeight);
          if (Number.isFinite(parsed)) {
            return Math.max(TEXT_LAYER_MIN_LINE_HEIGHT, Math.min(TEXT_LAYER_MAX_LINE_HEIGHT, parsed));
          }
          return TEXT_LAYER_LINE_HEIGHT_FACTOR;
        })(),
        textFontFamily:
          layerItem?.type === "heading"
            ? themeHeadingFontFamily || themeTextFontFamily
            : themeTextFontFamily,
        textLetterSpacing:
          layerItem?.type === "heading"
            ? Math.max(
                HEADING_LAYER_MIN_LETTER_SPACING,
                Math.min(HEADING_LAYER_MAX_LETTER_SPACING, Number(layerItem?.textLetterSpacing) || 0)
              )
            : 0,
        corner,
        mode: "text",
      };
      setResizeLayerId(layerItem.id);
      setLayerResizeDraft((prev) => ({
        ...prev,
        [layerItem.id]: {
          ...safeSize,
          fontSize: safeFontSize,
        },
      }));
    },
    [
      buildSafeCircleStretchSize,
      buildSafeHeadingWidth,
      buildSafeIconSize,
      buildSafeImageSize,
      buildSafeRectangleSize,
      buildSafeTextFontSize,
      calculateTextLayerBoxSize,
      themeHeadingFontFamily,
      themeTextFontFamily,
    ]
  );
  const sectionDataRef = useRef(sectionData);
  sectionDataRef.current = sectionData;
  const handleUpdateSectionRef = useRef(handleUpdateSection);
  handleUpdateSectionRef.current = handleUpdateSection;
  useEffect(() => {
    if (!dragLayerId) return undefined;
    const onMouseMove = (event) => moveLayerDrag(event);
    const onMouseUp = () => endLayerDrag();
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragLayerId, endLayerDrag, moveLayerDrag]);
  useEffect(() => {
    const onMouseMove = (event) => moveLayerResize(event);
    const onMouseUp = () => endLayerResize();
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [endLayerResize, moveLayerResize]);
  useEffect(() => {
    setLayerDragDraft({});
    setDragLayerId(null);
    dragLayerMetaRef.current = null;
    setLayerResizeDraft({});
    setResizeLayerId(null);
    resizeLayerMetaRef.current = null;
    setSelectedLayerId(null);
    setEditingTextLayerId(null);
    setEditingTextDrafts({});
    setIsLayerImagePickerOpen(false);
    setIsLayerIconPickerOpen(false);
    const latestSectionData = sectionDataRef.current;
    if ((latestSectionData?.activeLayerItemId || null) !== null) {
      handleUpdateSectionRef.current({
        ...latestSectionData,
        activeLayerItemId: null,
      });
    }
  }, [activeSlide?.id]);
  useEffect(() => {
    const onKeyDown = (event) => {
      if (!selectedLayerId) return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      const isDeleteKey =
        event.key === "Delete" ||
        event.key === "Backspace" ||
        event.code === "Delete" ||
        event.code === "Backspace" ||
        event.keyCode === 8 ||
        event.keyCode === 46;
      if (isDeleteKey) {
        event.preventDefault();
        event.stopPropagation();
        deleteLayerItem(selectedLayerId);
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [deleteLayerItem, selectedLayerId]);
  const renderLayerPreviewItem = useCallback((item) => {
    if (!item || !item.type) return null;
    const buildLayerFillColor = () => {
      const baseColor = resolveColor(item?.fillColor || "#ffffff") || "#ffffff";
      const parsedOpacity = Number(item?.fillOpacity);
      const safeOpacity = Number.isFinite(parsedOpacity)
        ? Math.max(0, Math.min(255, parsedOpacity))
        : 51;
      return `${baseColor}${opacityToHex(safeOpacity)}`;
    };
    const buildLayerFillBlur = () => {
      const parsedBlur = Number(item?.fillBlur);
      return Number.isFinite(parsedBlur) ? Math.max(0, Math.min(100, parsedBlur)) : 0;
    };
    if (item.type === "image") {
      const imageUrl = typeof item?.imageUrl === "string" ? item.imageUrl : "";
      const parsedOpacity = Number(item?.imageOpacity);
      const safeOpacity = Number.isFinite(parsedOpacity) ? Math.max(0, Math.min(100, parsedOpacity)) : 100;
      const parsedBlur = Number(item?.imageBlur);
      const safeBlur = Number.isFinite(parsedBlur) ? Math.max(0, Math.min(100, parsedBlur)) : 0;
      const parsedBrightness = Number(item?.imageBrightness);
      const safeBrightness = Number.isFinite(parsedBrightness)
        ? Math.max(0, Math.min(200, parsedBrightness))
        : 100;
      if (imageUrl.trim()) {
        return (
          <div className="h-full w-full">
            <img
              src={imageUrl}
              alt=""
              className="h-full w-full object-cover"
              style={{
                opacity: safeOpacity / 100,
                filter: `blur(${safeBlur}px) brightness(${safeBrightness}%)`,
              }}
              draggable={false}
            />
          </div>
        );
      }
      return (
        <div className="flex h-full w-full items-center justify-center rounded-md text-slate-700">
          <ImageIcon className="h-6 w-6" />
        </div>
      );
    }
    if (item.type === "rectangle") {
      const parsedRadius = Number(item?.shapeRadius);
      const safeRadius = Number.isFinite(parsedRadius) ? Math.max(0, Math.min(100, parsedRadius)) : 8;
      return (
        <div
          className="h-full w-full"
          style={{
            borderRadius: `${safeRadius}px`,
            backgroundColor: item?.shapeStrokeEnabled === true ? "transparent" : buildLayerFillColor(),
            filter: `blur(${buildLayerFillBlur()}px)`,
            border: item?.shapeStrokeEnabled === true ? `2px solid ${buildLayerFillColor()}` : "none",
            boxSizing: "border-box",
          }}
        />
      );
    }
    if (item.type === "circle") {
      return (
        <div
          className="h-full w-full rounded-full"
          style={{
            backgroundColor: item?.shapeStrokeEnabled === true ? "transparent" : buildLayerFillColor(),
            filter: `blur(${buildLayerFillBlur()}px)`,
            border: item?.shapeStrokeEnabled === true ? `2px solid ${buildLayerFillColor()}` : "none",
            boxSizing: "border-box",
          }}
        />
      );
    }
    if (item.type === "text" || item.type === "heading") {
      const defaultLabel = item.type === "heading" ? "Heading" : "Text";
      const safeFontSize = Math.max(
        TEXT_LAYER_MIN_FONT_SIZE,
        Math.min(
          TEXT_LAYER_MAX_FONT_SIZE,
          Number(item?.fontSize) ||
            (item.type === "heading" ? HEADING_LAYER_DEFAULT_FONT_SIZE : TEXT_LAYER_DEFAULT_FONT_SIZE)
        )
      );
      const committedTextValue = String(item?.text || item?.label || defaultLabel);
      const isTextEditing = editingTextLayerId === item?.id;
      const safeTextValue = committedTextValue;
      const safeTextColor = resolveColor(item?.textColor || "#ffffff") || "#ffffff";
      const safeTextAlign = item?.textAlign === "left" ? "left" : "center";
      const safeTextFontWeight = item?.textBold === true
        ? TEXT_LAYER_FONT_WEIGHT_BOLD
        : TEXT_LAYER_FONT_WEIGHT_NORMAL;
      const safeTextFontFamily =
        item.type === "heading"
          ? themeHeadingFontFamily || themeTextFontFamily
          : themeTextFontFamily;
      const safeTextLetterSpacing =
        item.type === "heading"
          ? Math.max(
              HEADING_LAYER_MIN_LETTER_SPACING,
              Math.min(HEADING_LAYER_MAX_LETTER_SPACING, Number(item?.textLetterSpacing) || 0)
            )
          : 0;
      const isHeadingStrokeEnabled = item.type === "heading" && item?.textStrokeEnabled === true;
      const shouldRenderHeadingStroke = isHeadingStrokeEnabled && !isTextEditing;
      const headingStrokeWidthPx = Math.max(0.8, Math.min(1.3, safeFontSize * 0.02));
      const resolvedTextFontWeight = safeTextFontWeight;
      const safeTextLineHeight = (() => {
        const parsed = Number(item?.textLineHeight);
        if (Number.isFinite(parsed)) {
          return Math.max(TEXT_LAYER_MIN_LINE_HEIGHT, Math.min(TEXT_LAYER_MAX_LINE_HEIGHT, parsed));
        }
        return TEXT_LAYER_LINE_HEIGHT_FACTOR;
      })();
      const parsedTextOpacity = Number(item?.textOpacity);
      const safeTextOpacity = Number.isFinite(parsedTextOpacity)
        ? Math.max(0, Math.min(100, parsedTextOpacity))
        : 90;
      const textShadowFilter =
        item?.textShadowEnabled === true ? "drop-shadow(0 2px 4px rgba(15, 23, 42, 0.28))" : "none";
      return (
        <div
          data-text-editor-id={item?.id || undefined}
          dir="ltr"
          className={`flex h-full w-full items-center overflow-hidden px-2 py-1 ${
            isTextEditing
              ? "justify-start text-left"
              : safeTextAlign === "left"
                ? "justify-start text-left"
                : "justify-center text-center"
          } ${
            item.type === "heading"
              ? "whitespace-normal break-all"
              : "whitespace-pre-wrap break-words"
          } focus:outline-none focus-visible:outline-none ${
            isTextEditing ? "cursor-text" : "cursor-pointer"
          }`}
          contentEditable={isTextEditing}
          suppressContentEditableWarning={isTextEditing}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          data-gramm="false"
          data-gramm_editor="false"
          data-enable-grammarly="false"
          style={{
            fontSize: `${safeFontSize}px`,
            lineHeight: safeTextLineHeight,
            fontWeight: resolvedTextFontWeight,
            fontFamily: safeTextFontFamily || undefined,
            letterSpacing: `${safeTextLetterSpacing}px`,
            color: shouldRenderHeadingStroke ? "transparent" : safeTextColor,
            WebkitTextFillColor: shouldRenderHeadingStroke ? "transparent" : safeTextColor,
            WebkitTextStroke: shouldRenderHeadingStroke
              ? `${headingStrokeWidthPx}px ${safeTextColor}`
              : "0px transparent",
            paintOrder: "stroke fill",
            caretColor: safeTextColor,
            opacity: safeTextOpacity / 100,
            filter: shouldRenderHeadingStroke ? "none" : textShadowFilter,
            textRendering: "optimizeLegibility",
            outline: "none",
            boxShadow: "none",
            direction: "ltr",
            unicodeBidi: "plaintext",
            writingMode: "horizontal-tb",
          }}
          onMouseDown={(event) => {
            if (isTextEditing) {
              event.stopPropagation();
            }
          }}
          onDoubleClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            startTextEditing(item?.id || null);
          }}
          onBlur={(event) => {
            if (!isTextEditing) return;
            commitTextText(
              item?.id || null,
              event.currentTarget.textContent,
              item.type === "heading" ? "Heading" : "Text"
            );
            setEditingTextDrafts((prev) => {
              if (!Object.prototype.hasOwnProperty.call(prev, item?.id)) return prev;
              const next = { ...prev };
              delete next[item.id];
              return next;
            });
            setLayerResizeDraft((prev) => {
              if (!Object.prototype.hasOwnProperty.call(prev, item?.id)) return prev;
              const next = { ...prev };
              delete next[item.id];
              return next;
            });
            setEditingTextLayerId((current) => (current === item?.id ? null : current));
          }}
          onInput={(event) => {
            if (!isTextEditing || !item?.id) return;
            const nextText = String(event.currentTarget.textContent ?? "");
            setEditingTextDrafts((prev) =>
              prev[item.id] === nextText
                ? prev
                : {
                    ...prev,
                    [item.id]: nextText,
                  }
            );
            const measuredWidth = buildSafeHeadingWidth(
              Number.isFinite(Number(item?.width)) ? Number(item.width) : TEXT_LAYER_MIN_WIDTH
            );
            const measuredSize = calculateTextLayerBoxSize(
              nextText || (item.type === "heading" ? "Heading" : "Text"),
              safeFontSize,
              measuredWidth,
              TEXT_LAYER_CHAR_WIDTH_FACTOR,
              safeTextFontWeight,
              true,
              TEXT_LAYER_HORIZONTAL_PADDING,
              TEXT_LAYER_VERTICAL_PADDING,
              safeTextLineHeight,
              safeTextFontFamily,
              safeTextLetterSpacing
            );
            setLayerResizeDraft((prev) => ({
              ...prev,
              [item.id]: {
                width: measuredWidth,
                height: measuredSize.height,
              },
            }));
          }}
          onPaste={(event) => {
            if (!isTextEditing || !item?.id) return;
            event.preventDefault();
            event.stopPropagation();
            const safePastedText = getSanitizedClipboardText(event);
            if (!safePastedText) return;
            insertTextAtCursor(safePastedText);
            const editorEl = event.currentTarget;
            if (typeof window !== "undefined") {
              window.requestAnimationFrame(() => {
                const nextText = String(editorEl.textContent ?? "");
                setEditingTextDrafts((prev) =>
                  prev[item.id] === nextText
                    ? prev
                    : {
                        ...prev,
                        [item.id]: nextText,
                      }
                );
                const measuredWidth = buildSafeHeadingWidth(
                  Number.isFinite(Number(item?.width)) ? Number(item.width) : TEXT_LAYER_MIN_WIDTH
                );
                const measuredSize = calculateTextLayerBoxSize(
                  nextText || (item.type === "heading" ? "Heading" : "Text"),
                  safeFontSize,
                  measuredWidth,
                  TEXT_LAYER_CHAR_WIDTH_FACTOR,
                  safeTextFontWeight,
                  true,
                  TEXT_LAYER_HORIZONTAL_PADDING,
                  TEXT_LAYER_VERTICAL_PADDING,
                  safeTextLineHeight,
                  safeTextFontFamily,
                  safeTextLetterSpacing
                );
                setLayerResizeDraft((prev) => ({
                  ...prev,
                  [item.id]: {
                    width: measuredWidth,
                    height: measuredSize.height,
                  },
                }));
              });
            }
          }}
          onKeyDown={(event) => {
            if (!isTextEditing) return;
            if (event.key === "Enter") {
              if (item.type === "heading") {
                event.preventDefault();
                event.currentTarget.blur();
              } else {
                event.stopPropagation();
              }
              return;
            }
            if (event.key === "Escape") {
              event.preventDefault();
              event.stopPropagation();
              event.currentTarget.textContent = committedTextValue;
              setEditingTextDrafts((prev) => {
                if (!Object.prototype.hasOwnProperty.call(prev, item?.id)) return prev;
                const next = { ...prev };
                delete next[item.id];
                return next;
              });
              setLayerResizeDraft((prev) => {
                if (!Object.prototype.hasOwnProperty.call(prev, item?.id)) return prev;
                const next = { ...prev };
                delete next[item.id];
                return next;
              });
              setEditingTextLayerId((current) => (current === item?.id ? null : current));
              event.currentTarget.blur();
            }
          }}
        >
          {safeTextValue}
        </div>
      );
    }
    if (item.type === "button" || item.type === "button-primary") {
      const baseButtonFontSize = Math.max(
        BUTTON_LAYER_MIN_FONT_SIZE,
        Math.min(
          BUTTON_LAYER_MAX_FONT_SIZE,
          Number(item?.buttonFontSizeBase) || BUTTON_LAYER_BASE_FONT_SIZE
        )
      );
      const buttonFontSize = baseButtonFontSize;
      const isButtonEditing = editingTextLayerId === item?.id;
      const committedButtonText = String(item?.text || "Button");
      const liveDraftButtonText =
        isButtonEditing && typeof editingTextDrafts[item?.id] === "string"
          ? editingTextDrafts[item.id]
          : null;
      const safeButtonText = liveDraftButtonText ?? committedButtonText;
      const safePrimaryBg = resolveColor(item?.buttonBgColor || "#0f172a") || "#0f172a";
      const safePrimaryText = resolveColor(item?.buttonTextColor || "#ffffff") || "#ffffff";
      const safeButtonOpacity = Math.max(
        0,
        Math.min(100, Number(item?.buttonOpacity) || 100)
      );
      const safeButtonRadius = Math.max(
        0,
        Math.min(100, Number(item?.buttonRadius) || BUTTON_LAYER_DEFAULT_RADIUS)
      );
      return (
        <div
          className="flex h-full w-full items-center justify-center px-3 py-2 font-semibold shadow-sm"
          style={{
            fontSize: `${buttonFontSize}px`,
            lineHeight: 1.2,
            fontFamily: themeTextFontFamily || undefined,
            backgroundColor: safePrimaryBg,
            color: safePrimaryText,
            opacity: safeButtonOpacity / 100,
            borderRadius: `${safeButtonRadius}px`,
          }}
        >
          {isButtonEditing ? (
            <input
              data-text-editor-id={item?.id || undefined}
              dir="ltr"
              type="text"
              value={safeButtonText}
              className="w-full cursor-text appearance-none bg-transparent text-left outline-none"
              style={{
                direction: "ltr",
                unicodeBidi: "plaintext",
                writingMode: "horizontal-tb",
              }}
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
              data-gramm="false"
              data-gramm_editor="false"
              data-enable-grammarly="false"
              onMouseDown={(event) => event.stopPropagation()}
              onChange={(event) => {
                if (!item?.id) return;
                const nextText = String(event.currentTarget.value ?? "");
                setEditingTextDrafts((prev) =>
                  prev[item.id] === nextText
                    ? prev
                    : {
                        ...prev,
                        [item.id]: nextText,
                      }
                );
              }}
              onPaste={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              onBlur={(event) => {
                commitTextText(item?.id || null, event.currentTarget.value, "Button");
                setEditingTextDrafts((prev) => {
                  if (!Object.prototype.hasOwnProperty.call(prev, item?.id)) return prev;
                  const next = { ...prev };
                  delete next[item.id];
                  return next;
                });
                setEditingTextLayerId((current) => (current === item?.id ? null : current));
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  event.currentTarget.blur();
                  return;
                }
                if (event.key === "Escape") {
                  event.preventDefault();
                  event.stopPropagation();
                  setEditingTextDrafts((prev) => {
                    if (!Object.prototype.hasOwnProperty.call(prev, item?.id)) return prev;
                    const next = { ...prev };
                    delete next[item.id];
                    return next;
                  });
                  setEditingTextLayerId((current) => (current === item?.id ? null : current));
                  event.currentTarget.blur();
                }
              }}
            />
          ) : (
            <div
              data-text-editor-id={item?.id || undefined}
              dir="ltr"
              className="w-full cursor-pointer whitespace-pre-wrap break-words text-center outline-none"
              style={{
                direction: "ltr",
                unicodeBidi: "plaintext",
                writingMode: "horizontal-tb",
              }}
            >
              {safeButtonText}
            </div>
          )}
        </div>
      );
    }
    if (item.type === "button-dual" || item.type === "button-secondary") {
      const baseButtonFontSize = Math.max(
        BUTTON_LAYER_MIN_FONT_SIZE,
        Math.min(
          BUTTON_LAYER_MAX_FONT_SIZE,
          Number(item?.buttonFontSizeBase) || BUTTON_DUAL_LAYER_BASE_FONT_SIZE
        )
      );
      const buttonFontSize = baseButtonFontSize;
      const isButtonEditing = editingTextLayerId === item?.id;
      const committedButtonText = String(item?.text || "Button Dual");
      const liveDraftButtonText =
        isButtonEditing && typeof editingTextDrafts[item?.id] === "string"
          ? editingTextDrafts[item.id]
          : null;
      const safeButtonText = liveDraftButtonText ?? committedButtonText;
      const safePrimaryBg = resolveColor(item?.buttonBgColor || "#0f172a") || "#0f172a";
      const safePrimaryText = resolveColor(item?.buttonTextColor || "#ffffff") || "#ffffff";
      const safeButtonOpacity = Math.max(
        0,
        Math.min(100, Number(item?.buttonOpacity) || 100)
      );
      const safeButtonRadius = Math.max(
        0,
        Math.min(100, Number(item?.buttonRadius) || BUTTON_LAYER_DEFAULT_RADIUS)
      );
      const safeSecondaryBg =
        resolveColor(item?.buttonSecondaryBgColor || "rgba(255,255,255,0.15)") || "rgba(255,255,255,0.15)";
      const safeSecondaryText =
        resolveColor(item?.buttonSecondaryTextColor || "#ffffff") || "#ffffff";
      const safeSecondaryBorder =
        resolveColor(item?.buttonSecondaryBorderColor || "rgba(255,255,255,0.8)") || "rgba(255,255,255,0.8)";
      return (
        <div className="flex h-full w-full items-center gap-1" style={{ opacity: safeButtonOpacity / 100 }}>
          <div
            className="flex h-full flex-1 items-center justify-center px-3 py-2 font-semibold shadow-sm"
            style={{
              fontSize: `${buttonFontSize}px`,
              lineHeight: 1.2,
              fontFamily: themeTextFontFamily || undefined,
              backgroundColor: safePrimaryBg,
              color: safePrimaryText,
              borderTopLeftRadius: `${safeButtonRadius}px`,
              borderBottomLeftRadius: `${safeButtonRadius}px`,
            }}
          >
            {isButtonEditing ? (
              <input
                data-text-editor-id={item?.id || undefined}
                dir="ltr"
                type="text"
                value={safeButtonText}
                className="w-full cursor-text appearance-none bg-transparent text-left outline-none"
                style={{
                  direction: "ltr",
                  unicodeBidi: "plaintext",
                  writingMode: "horizontal-tb",
                }}
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="off"
                data-gramm="false"
                data-gramm_editor="false"
                data-enable-grammarly="false"
                onMouseDown={(event) => event.stopPropagation()}
                onChange={(event) => {
                  if (!item?.id) return;
                  const nextText = String(event.currentTarget.value ?? "");
                  setEditingTextDrafts((prev) =>
                    prev[item.id] === nextText
                      ? prev
                      : {
                          ...prev,
                          [item.id]: nextText,
                        }
                  );
                }}
                onPaste={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                onBlur={(event) => {
                  commitTextText(item?.id || null, event.currentTarget.value, "Button");
                  setEditingTextDrafts((prev) => {
                    if (!Object.prototype.hasOwnProperty.call(prev, item?.id)) return prev;
                    const next = { ...prev };
                    delete next[item.id];
                    return next;
                  });
                  setEditingTextLayerId((current) => (current === item?.id ? null : current));
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    event.currentTarget.blur();
                    return;
                  }
                  if (event.key === "Escape") {
                    event.preventDefault();
                    event.stopPropagation();
                    setEditingTextDrafts((prev) => {
                      if (!Object.prototype.hasOwnProperty.call(prev, item?.id)) return prev;
                      const next = { ...prev };
                      delete next[item.id];
                      return next;
                    });
                    setEditingTextLayerId((current) => (current === item?.id ? null : current));
                    event.currentTarget.blur();
                  }
                }}
              />
            ) : (
              <div
                data-text-editor-id={item?.id || undefined}
                dir="ltr"
                className="w-full cursor-pointer whitespace-pre-wrap break-words text-center outline-none"
                style={{
                  direction: "ltr",
                  unicodeBidi: "plaintext",
                  writingMode: "horizontal-tb",
                }}
              >
                {safeButtonText}
              </div>
            )}
          </div>
          <div
            className="flex h-full flex-1 items-center justify-center border px-3 py-2 font-semibold"
            style={{
              fontSize: `${buttonFontSize}px`,
              lineHeight: 1.2,
              fontFamily: themeTextFontFamily || undefined,
              backgroundColor: safeSecondaryBg,
              color: safeSecondaryText,
              borderColor: safeSecondaryBorder,
              borderTopRightRadius: `${safeButtonRadius}px`,
              borderBottomRightRadius: `${safeButtonRadius}px`,
            }}
          >
            Button
          </div>
        </div>
      );
    }
    if (item.type === "icon") {
      const safeIconColor = resolveColor(item?.iconColor || "#334155") || "#334155";
      const parsedIconOpacity = Number(item?.iconOpacity);
      const safeIconOpacity = Number.isFinite(parsedIconOpacity)
        ? Math.max(0, Math.min(100, parsedIconOpacity))
        : 100;
      const iconShadowFilter =
        item?.iconShadowEnabled === true ? "drop-shadow(0 2px 4px rgba(15, 23, 42, 0.18))" : "none";
      const safeIconName =
        typeof item?.faIcon?.name === "string" ? item.faIcon.name : null;
      const safeIconType =
        item?.faIcon?.type === "fab" || item?.faIcon?.type === "far" ? item.faIcon.type : "fas";
      const hasCustomIcon = Boolean(safeIconName);
      const iconSizePx = Math.round(
        Math.max(
          1,
          Math.min(
            Number(item?.width) || ICON_LAYER_DEFAULT_SIZE,
            Number(item?.height) || ICON_LAYER_DEFAULT_SIZE
          ) - ICON_LAYER_FRAME_GAP_PX * 2
        )
      );
      return (
        <div className="relative h-full w-full">
          <div
            className="absolute left-1/2 top-1/2 flex items-center justify-center"
            style={{
              width: iconSizePx,
              height: iconSizePx,
              lineHeight: 1,
              transform: "translate(-50%, -50%)",
            }}
          >
            {hasCustomIcon ? (
              <IconAwsome
                iconName={safeIconName}
                iconType={safeIconType}
                style={{
                  fontSize: iconSizePx,
                  width: "100%",
                  height: "100%",
                  color: safeIconColor,
                  opacity: safeIconOpacity / 100,
                  filter: iconShadowFilter,
                  display: "block",
                  verticalAlign: "0",
                }}
              />
            ) : (
              <Star
                style={{
                  width: "100%",
                  height: "100%",
                  display: "block",
                  color: safeIconColor,
                  opacity: safeIconOpacity / 100,
                  filter: iconShadowFilter,
                }}
              />
            )}
          </div>
        </div>
      );
    }
    if (item.type === "dual-icon") {
      return (
        <div className="flex items-center gap-2">
          <span className="h-[20px] w-[20px] rounded-full bg-white/90" />
          <span className="h-[20px] w-[20px] rounded-full border border-white/80 bg-transparent" />
        </div>
      );
    }
    return null;
  }, [
    buildSafeHeadingWidth,
    calculateTextLayerBoxSize,
    commitTextText,
    editingTextDrafts,
    editingTextLayerId,
    getSanitizedClipboardText,
    insertTextAtCursor,
    opacityToHex,
    resolveColor,
    startTextEditing,
    themeHeadingFontFamily,
    themeTextFontFamily,
  ]);
  const renderSceneVisualLayer = (visual, extraStyle = undefined, options = undefined) => {
    if (!visual) return null;
    const includeMedia = options?.includeMedia !== false;
    const includeBackground = options?.includeBackground !== false;
    const backgroundZoomScale = Math.max(
      0.1,
      (Number.isFinite(Number(visual.backgroundZoom)) ? Number(visual.backgroundZoom) : 100) / 100
    );
    const isBackgroundZoomOut = backgroundZoomScale < 1;
    const backgroundFitMode = isBackgroundZoomOut ? "contain" : "cover";
    return (
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{
          willChange: "opacity, transform, filter",
          ...(extraStyle || {}),
        }}
      >
        {includeMedia && visual.backgroundVideo ? (
          <video
            className="absolute"
            style={{
              zIndex: 1,
              top: visual.blurBleedPx > 0 ? -visual.blurBleedPx : 0,
              left: visual.blurBleedPx > 0 ? -visual.blurBleedPx : 0,
              width:
                visual.blurBleedPx > 0
                  ? `calc(100% + ${visual.blurBleedPx * 2}px)`
                  : "100%",
              height:
                visual.blurBleedPx > 0
                  ? `calc(100% + ${visual.blurBleedPx * 2}px)`
                  : "100%",
              objectFit: backgroundFitMode,
              objectPosition: `${visual.backgroundPositionX}% ${visual.backgroundPositionY}%`,
              transform: `scale(${backgroundZoomScale})`,
              transformOrigin: `${visual.backgroundPositionX}% ${visual.backgroundPositionY}%`,
              filter: `blur(${visual.blurPx}px) brightness(${visual.imageBrightness}%)`,
            }}
            src={visual.backgroundVideo}
            autoPlay
            muted
            loop
            playsInline
          />
        ) : includeMedia && visual.backgroundImage ? (
          <div
            className="absolute bg-cover bg-center bg-no-repeat"
            style={{
              zIndex: 1,
              top: visual.blurBleedPx > 0 ? -visual.blurBleedPx : 0,
              right: visual.blurBleedPx > 0 ? -visual.blurBleedPx : 0,
              bottom: visual.blurBleedPx > 0 ? -visual.blurBleedPx : 0,
              left: visual.blurBleedPx > 0 ? -visual.blurBleedPx : 0,
              backgroundRepeat: "no-repeat",
              backgroundImage: `url(${visual.backgroundImage})`,
              backgroundPosition: `${visual.backgroundPositionX}% ${visual.backgroundPositionY}%`,
              backgroundSize: backgroundFitMode,
              transform: `scale(${backgroundZoomScale})`,
              transformOrigin: `${visual.backgroundPositionX}% ${visual.backgroundPositionY}%`,
              filter: `blur(${visual.blurPx}px) brightness(${visual.imageBrightness}%)`,
              backgroundAttachment: visual.parallaxEnabled ? "fixed" : "scroll",
            }}
          />
        ) : null}
        {includeBackground && visual.background ? (
          <div
            className="absolute inset-0"
            style={{
              zIndex: 2,
              background: visual.background,
            }}
          />
        ) : null}
      </div>
    );
  };
  const isSlideLeftMode = slideDisplayMode === "slide";
  const isSlideRightMode = slideDisplayMode === "slide-right";
  const isFadeMode = slideDisplayMode === "fade";
  const shouldRenderSlideTransition =
    (isSlideLeftMode || isSlideRightMode) && slideTransition && fromSlideVisual && activeSlideVisual;
  const shouldRenderFadeTrack =
    isFadeMode && slideTransition && fromSlideVisual && activeSlideVisual;
  const shouldClipBackgroundToPreviewFrame =
    Boolean(activeSlideVisual?.backgroundFrameOnly) || Boolean(fromSlideVisual?.backgroundFrameOnly);
  const shouldUseDeviceColorBleedMode = device === "Tablet" || device === "Mobile";
  const shouldClipSceneMediaToPreviewFrame =
    shouldClipBackgroundToPreviewFrame || shouldUseDeviceColorBleedMode;
  const previewFrameDeviceWidth = HERO_PREVIEW_FRAME_WIDTH_BY_DEVICE[device];
  const desktopFrameInsetX =
    typeof heroPreviewViewportMaxWidth === "string" &&
    heroPreviewViewportMaxWidth.trim().endsWith("px")
      ? `max(0px, calc((100% - ${heroPreviewViewportMaxWidth}) / 2))`
      : "6%";
  const previewFrameClipInsetX = Number.isFinite(previewFrameDeviceWidth)
    ? `max(0px, calc((100% - ${previewFrameDeviceWidth}px) / 2))`
    : desktopFrameInsetX;
  const previewFrameGuideInsetX = Number.isFinite(previewFrameDeviceWidth)
    ? `max(0px, calc((100% - ${previewFrameDeviceWidth}px) / 2))`
    : desktopFrameInsetX;
  const previewFrameMediaClipStyle = shouldClipSceneMediaToPreviewFrame
    ? {
        clipPath: `inset(0 ${previewFrameClipInsetX} 0 ${previewFrameClipInsetX})`,
      }
    : undefined;
  const previewFrameBoundsStyle = {
    width: heroPreviewViewportWidth,
    maxWidth: heroPreviewViewportMaxWidth,
    height: heroHeight,
  };
  const renderPreviewFrameSideGuides = () => {
    if (shouldClipBackgroundToPreviewFrame) return null;
    return (
      <>
        <div
          className="pointer-events-none absolute inset-y-0 z-[6] border-l border-dashed border-white/50"
          style={{ left: previewFrameGuideInsetX }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 z-[6] border-r border-dashed border-white/50"
          style={{ right: previewFrameGuideInsetX }}
          aria-hidden
        />
      </>
    );
  };
  const renderSceneVisualTrack = (layerOptions = undefined) => {
    if (shouldRenderSlideTransition) {
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {renderSceneVisualLayer(
            fromSlideVisual,
            {
              zIndex: 2,
              animation: isSlideRightMode
                ? `heroSceneSlideOutRight ${slideDurationMs}ms cubic-bezier(0.22,1,0.36,1) both`
                : `heroSceneSlideOutLeft ${slideDurationMs}ms cubic-bezier(0.22,1,0.36,1) both`,
            },
            layerOptions
          )}
          {renderSceneVisualLayer(
            activeSlideVisual,
            {
              zIndex: 1,
              animation: isSlideRightMode
                ? `heroSceneSlideInRight ${slideDurationMs}ms cubic-bezier(0.22,1,0.36,1) both`
                : `heroSceneSlideInLeft ${slideDurationMs}ms cubic-bezier(0.22,1,0.36,1) both`,
            },
            layerOptions
          )}
        </div>
      );
    }
    if (shouldRenderFadeTrack) {
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {renderSceneVisualLayer(
            fromSlideVisual,
            {
              zIndex: 1,
              animation: `heroSceneFadeOut ${fadeDurationMs}ms cubic-bezier(0.16, 1, 0.3, 1) both`,
            },
            layerOptions
          )}
          {renderSceneVisualLayer(
            activeSlideVisual,
            {
              zIndex: 2,
              animation: `heroSceneFadeIn ${fadeDurationMs}ms cubic-bezier(0.16, 1, 0.3, 1) both`,
            },
            layerOptions
          )}
        </div>
      );
    }
    return renderSceneVisualLayer(activeSlideVisual, undefined, layerOptions);
  };
  const sceneVisualContent = renderSceneVisualTrack();
  const sceneVisualMediaContent = shouldUseDeviceColorBleedMode
    ? renderSceneVisualTrack({ includeMedia: true, includeBackground: false })
    : sceneVisualContent;
  const sceneVisualColorContent = shouldUseDeviceColorBleedMode
    ? renderSceneVisualTrack({ includeMedia: false, includeBackground: true })
    : null;
  const selectedTopControlMode = selectedShapeLayer
    ? "shape"
    : selectedImageLayer
      ? "image"
      : selectedButtonLayer
        ? "button"
      : selectedTextLayer
        ? "text"
      : selectedIconLayer
        ? "icon"
        : null;
  const hasTopStyleControls = Boolean(selectedTopControlMode) && !readOnly;

  if (readOnly) {
    return (
      <div className="w-full">
        <div
          className="relative overflow-hidden"
          style={{
            paddingTop: sectionData.paddingTop,
            paddingBottom: sectionData.paddingBottom,
          }}
        >
          {shouldUseDeviceColorBleedMode ? (
            <>
              <div className="pointer-events-none absolute inset-0 z-0" style={previewFrameMediaClipStyle}>
                {sceneVisualMediaContent}
              </div>
              <div className="pointer-events-none absolute inset-0 z-[1]">
                {sceneVisualColorContent}
              </div>
            </>
          ) : shouldClipBackgroundToPreviewFrame ? (
            <div className="pointer-events-none absolute inset-0 z-0" style={previewFrameMediaClipStyle}>
              {sceneVisualMediaContent}
            </div>
          ) : (
            sceneVisualMediaContent
          )}
          {svgDividerPath ? (
            <div
              className="pointer-events-none absolute inset-x-0 z-[3]"
              style={{
                bottom: 0,
                height: `${svgDividerHeight}px`,
                ...(previewFrameMediaClipStyle || {}),
              }}
              aria-hidden
            >
              <svg
                viewBox={`0 0 ${HERO_SVG_DIVIDER_VIEWBOX_WIDTH} ${HERO_SVG_DIVIDER_VIEWBOX_HEIGHT}`}
                preserveAspectRatio="none"
                className="h-full w-full"
              >
                {Array.from({ length: svgDividerSegmentCount }).map((_, index) => (
                  <g
                    key={`hero-divider-segment-${index}`}
                    transform={`translate(${svgDividerSegmentOffsetX + index * svgDividerSegmentWidth} 0) scale(${svgDividerSegmentScaleX} 1)`}
                  >
                    <path
                      d={svgDividerPath}
                      fill={svgDividerColor}
                      transform={svgDividerPathTransform || undefined}
                    />
                  </g>
                ))}
              </svg>
            </div>
          ) : null}
          <div
            className={`relative z-10 mx-auto flex items-center justify-center bg-transparent ${
              shouldClipBackgroundToPreviewFrame ? "overflow-hidden" : ""
            }`}
            style={{
              ...previewFrameBoundsStyle,
            }}
          >
            <div className="pointer-events-none absolute inset-0 z-10">
              {sortedLayerItems.map((item, index) => {
                const fallbackIndex = Number.isFinite(Number(item?.__originalIndex))
                  ? Number(item.__originalIndex)
                  : index;
                const canOverflowSection =
                  item?.type === "image" || item?.type === "rectangle" || item?.type === "circle";
                const x = Number.isFinite(Number(item?.x))
                  ? canOverflowSection
                    ? Math.max(-4000, Math.min(4000, Number(item.x)))
                    : Math.max(24, Math.min(4000, Number(item.x)))
                  : 96 + fallbackIndex * 24;
                const y = Number.isFinite(Number(item?.y))
                  ? canOverflowSection
                    ? Math.max(-4000, Math.min(4000, Number(item.y)))
                    : Math.max(24, Math.min(4000, Number(item.y)))
                  : 96 + fallbackIndex * 24;
                const width = Number(item?.width);
                const height = Number(item?.height);
                return (
                  <div
                    key={item?.id || `layer-${index}`}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${x}px`,
                      top: `${y}px`,
                      zIndex: Number(item?.__safeZIndex || 1),
                      ...(Number.isFinite(width) ? { width: `${width}px` } : {}),
                      ...(Number.isFinite(height) ? { height: `${height}px` } : {}),
                    }}
                  >
                    {renderLayerPreviewItem(item)}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <style>{`
          @keyframes heroSceneFadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
          }
          @keyframes heroSceneFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes heroSceneSlideOutLeft {
            from { transform: translateX(0); }
            to { transform: translateX(-100%); }
          }
          @keyframes heroSceneSlideInLeft {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
          @keyframes heroSceneSlideOutRight {
            from { transform: translateX(0); }
            to { transform: translateX(100%); }
          }
          @keyframes heroSceneSlideInRight {
            from { transform: translateX(-100%); }
            to { transform: translateX(0); }
          }
          ${HERO_LAYER_ANIMATION_KEYFRAMES}
        `}</style>
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto px-4 pb-4 pt-0 sm:px-6 sm:pb-6 sm:pt-0">
      <div className="min-h-[600px] px-4 pb-4 pt-0">
        <div
          className="mx-auto w-full overflow-x-auto overflow-y-hidden transition-all duration-300 ease-out"
          style={{
            marginTop: "0.5rem",
            marginBottom: "0.5rem",
            minHeight: "52px",
            paddingTop: hasTopStyleControls ? "0.25rem" : "0",
            opacity: 1,
            pointerEvents: hasTopStyleControls ? "auto" : "none",
          }}
        >
          <div
            className={`mx-auto flex items-center gap-1 px-2 py-1 ${
              hasTopStyleControls ? "w-max" : "h-[52px] w-full justify-center"
            }`}
          >
            {!hasTopStyleControls ? (
              <span
                className="text-[13px] font-medium"
                style={{ color: "var(--dash-panel-heading, #0f172a)" }}
              >
                คลิกเลือก Element เพื่อปรับแต่งค่าต่างๆ
              </span>
            ) : null}
            {selectedTopControlMode === "shape" ||
            selectedTopControlMode === "button" ||
            selectedTopControlMode === "icon" ||
            selectedTopControlMode === "text" ? (
              <div
                className="mr-[10px] flex shrink-0 flex-nowrap items-center gap-1 py-1"
              >
                {selectedTopControlMode === "button" ? (
                  <div className="mr-1 flex shrink-0 items-center gap-1">
                    <div className="inline-flex h-[28px] items-center gap-1">
                      <button
                        type="button"
                        className="dash-select-line-field flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-md"
                        onClick={() => setButtonColorPickTarget("bg")}
                        disabled={buttonColorPickTarget === "bg"}
                        aria-label="เลือกสีปุ่ม"
                        title="เลื่อนไปเลือกสีปุ่ม"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2.5} />
                      </button>
                      <div className="dash-select-line-field flex h-[28px] min-w-0 items-center justify-center rounded-md px-2">
                        <span className="dash-select-line-value whitespace-nowrap text-center text-[11px] font-medium">
                          {buttonColorPickTarget === "bg" ? "สีปุ่ม" : "สีข้อความ"}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="dash-select-line-field flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-md"
                        onClick={() => setButtonColorPickTarget("text")}
                        disabled={buttonColorPickTarget === "text"}
                        aria-label="เลือกสีข้อความปุ่ม"
                        title="เลื่อนไปเลือกสีข้อความปุ่ม"
                      >
                        <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                ) : null}
                <div
                  className={`flex shrink-0 flex-nowrap items-center gap-1 ${
                    selectedTopControlMode === "button" ? "pr-1" : ""
                  }`}
                >
                  {previewShapeColorTokens.map((colorToken, index) => {
                    const swatchColor = resolveColor(colorToken);
                    if (!swatchColor) return null;
                    const selected = isSameColorToken(
                      selectedTopControlMode === "shape"
                        ? selectedShapeFillColor
                        : selectedTopControlMode === "button"
                          ? buttonColorPickTarget === "bg"
                            ? selectedButtonBgColor
                            : selectedButtonTextColor
                        : selectedTopControlMode === "icon"
                          ? selectedIconColor
                          : selectedTextColor,
                      colorToken
                    );
                    return (
                      <button
                        key={`preview-shape-color-${index}`}
                        type="button"
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-300 dark:border-white/30"
                        style={{ backgroundColor: swatchColor }}
                        onClick={() => {
                          if (selectedTopControlMode === "shape") {
                            updateSelectedShapeStyle({ fillColor: colorToken });
                          } else if (selectedTopControlMode === "button") {
                            updateSelectedButtonStyle(
                              buttonColorPickTarget === "bg"
                                ? { buttonBgColor: colorToken }
                                : { buttonTextColor: colorToken }
                            );
                          } else if (selectedTopControlMode === "icon") {
                            updateSelectedIconStyle({ iconColor: colorToken });
                          } else {
                            updateSelectedTextStyle({ textColor: colorToken });
                          }
                        }}
                        aria-label={
                          selectedTopControlMode === "shape"
                            ? `Shape color ${index + 1}`
                            : selectedTopControlMode === "button"
                              ? buttonColorPickTarget === "bg"
                                ? `Button background color ${index + 1}`
                                : `Button text color ${index + 1}`
                            : selectedTopControlMode === "icon"
                              ? `Icon color ${index + 1}`
                              : `Text color ${index + 1}`
                        }
                        title={
                          selectedTopControlMode === "shape"
                            ? "เปลี่ยนสีรูปทรง"
                            : selectedTopControlMode === "button"
                              ? buttonColorPickTarget === "bg"
                                ? "เปลี่ยนสีพื้นหลังปุ่ม"
                                : "เปลี่ยนสีข้อความปุ่ม"
                            : selectedTopControlMode === "icon"
                              ? "เปลี่ยนสีไอคอน"
                              : "เปลี่ยนสีข้อความ"
                        }
                      >
                        {selected ? (
                          <Check
                            className={`${swatchSelectedCheckClassName(swatchColor)} h-[13px] w-[13px]`}
                            strokeWidth={4}
                          />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
                {selectedTopControlMode === "text" ? (
                  <div className="ml-3 flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-md border ${
                        selectedTextBold
                          ? "border-slate-700 bg-slate-900 text-white"
                          : "border-slate-300 bg-white text-slate-700"
                      }`}
                      onClick={() =>
                        updateSelectedTextStyle({
                          textBold: !selectedTextBold,
                        })
                      }
                      aria-label="สลับตัวหนาข้อความ"
                      title="สลับตัวหนาข้อความ"
                    >
                      <Bold className="h-3.5 w-3.5" strokeWidth={2.8} />
                    </button>
                    <button
                      type="button"
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-md border ${
                        selectedTextAlign === "left"
                          ? "border-slate-700 bg-slate-900 text-white"
                          : "border-slate-300 bg-white text-slate-700"
                      }`}
                      onClick={() => updateSelectedTextStyle({ textAlign: "left" })}
                      aria-label="จัดข้อความชิดซ้าย"
                      title="จัดข้อความชิดซ้าย"
                    >
                      <AlignLeft className="h-3.5 w-3.5" strokeWidth={2.8} />
                    </button>
                    <button
                      type="button"
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-md border ${
                        selectedTextAlign === "center"
                          ? "border-slate-700 bg-slate-900 text-white"
                          : "border-slate-300 bg-white text-slate-700"
                      }`}
                      onClick={() => updateSelectedTextStyle({ textAlign: "center" })}
                      aria-label="จัดข้อความกึ่งกลาง"
                      title="จัดข้อความกึ่งกลาง"
                    >
                      <AlignCenter className="h-3.5 w-3.5" strokeWidth={2.8} />
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
            {selectedTopControlMode === "image" ? (
              <div className="flex shrink-0 items-center gap-2">
                <span className="shrink-0 text-[12px] font-semibold" style={{ color: "#333333" }}>
                  ความสว่าง{" "}
                  <span style={{ color: "#9ca3af" }}>{Math.round(selectedImageBrightness)}</span>
                </span>
                <div className="shrink-0 w-fit px-[2px]">
                  <Range
                    min={0}
                    max={200}
                    step={1}
                    value={selectedImageBrightness}
                    handleChange={(event) =>
                      updateSelectedImageStyle({ imageBrightness: Number(event.target.value) })
                    }
                    pos={(selectedImageBrightness / 200) * 100}
                  />
                </div>
              </div>
            ) : null}
            {selectedTopControlMode === "shape" && selectedShapeLayer?.type === "rectangle" ? (
              <div className="flex shrink-0 items-center gap-2">
                <span className="shrink-0 text-[12px] font-semibold" style={{ color: "#333333" }}>
                  ความโค้ง <span style={{ color: "#9ca3af" }}>{Math.round(selectedShapeRadius)}</span>
                </span>
                <div className="shrink-0 w-fit px-[2px]">
                  <Range
                    min={0}
                    max={100}
                    step={1}
                    value={selectedShapeRadius}
                    handleChange={(event) =>
                      updateSelectedShapeStyle({
                        shapeRadius: Math.max(0, Math.min(100, Number(event.target.value) || 0)),
                      })
                    }
                    pos={selectedShapeRadius}
                  />
                </div>
              </div>
            ) : null}
            {hasTopStyleControls ? (
              <div className="flex shrink-0 items-center gap-2">
                <span className="shrink-0 text-[12px] font-semibold" style={{ color: "#333333" }}>
                  โปร่งแสง{" "}
                  <span style={{ color: "#9ca3af" }}>
                    {selectedTopControlMode === "shape"
                      ? selectedShapeFillOpacityPercent
                      : selectedTopControlMode === "image"
                        ? selectedImageOpacityPercent
                        : selectedTopControlMode === "button"
                          ? selectedButtonOpacityPercent
                        : selectedTopControlMode === "icon"
                          ? selectedIconOpacityPercent
                          : selectedTextOpacityPercent}
                  </span>
                </span>
                <div className="shrink-0 w-fit px-[2px]">
                  <Range
                    min={0}
                    max={100}
                    step={1}
                    value={
                      selectedTopControlMode === "shape"
                        ? selectedShapeFillOpacityPercent
                        : selectedTopControlMode === "image"
                          ? selectedImageOpacityPercent
                          : selectedTopControlMode === "button"
                            ? selectedButtonOpacityPercent
                          : selectedTopControlMode === "icon"
                            ? selectedIconOpacityPercent
                            : selectedTextOpacityPercent
                    }
                    handleChange={(event) => {
                      const nextPercent = Math.max(0, Math.min(100, Number(event.target.value) || 0));
                      if (selectedTopControlMode === "shape") {
                        const nextOpacity = Math.round((nextPercent / 100) * 255);
                        updateSelectedShapeStyle({ fillOpacity: nextOpacity });
                      } else if (selectedTopControlMode === "image") {
                        updateSelectedImageStyle({ imageOpacity: nextPercent });
                      } else if (selectedTopControlMode === "button") {
                        updateSelectedButtonStyle({ buttonOpacity: nextPercent });
                      } else if (selectedTopControlMode === "icon") {
                        updateSelectedIconStyle({ iconOpacity: nextPercent });
                      } else {
                        updateSelectedTextStyle({ textOpacity: nextPercent });
                      }
                    }}
                    pos={
                      selectedTopControlMode === "shape"
                        ? selectedShapeFillOpacityPercent
                        : selectedTopControlMode === "image"
                          ? selectedImageOpacityPercent
                          : selectedTopControlMode === "button"
                            ? selectedButtonOpacityPercent
                          : selectedTopControlMode === "icon"
                            ? selectedIconOpacityPercent
                            : selectedTextOpacityPercent
                    }
                  />
                </div>
              </div>
            ) : null}
            {selectedTopControlMode === "text" && selectedTextLayer?.type !== "heading" ? (
              <div className="flex shrink-0 items-center gap-2">
                <span className="shrink-0 text-[12px] font-semibold" style={{ color: "#333333" }}>
                  ระยะบรรทัด{" "}
                  <span style={{ color: "#9ca3af" }}>{selectedTextLineHeight.toFixed(2)}</span>
                </span>
                <div className="shrink-0 w-fit px-[2px]">
                  <Range
                    min={TEXT_LAYER_MIN_LINE_HEIGHT}
                    max={TEXT_LAYER_MAX_LINE_HEIGHT}
                    step={0.05}
                    value={selectedTextLineHeight}
                    handleChange={(event) =>
                      updateSelectedTextStyle({
                        textLineHeight: Math.max(
                          TEXT_LAYER_MIN_LINE_HEIGHT,
                          Math.min(TEXT_LAYER_MAX_LINE_HEIGHT, Number(event.target.value) || 0)
                        ),
                      })
                    }
                    pos={
                      ((selectedTextLineHeight - TEXT_LAYER_MIN_LINE_HEIGHT) /
                        (TEXT_LAYER_MAX_LINE_HEIGHT - TEXT_LAYER_MIN_LINE_HEIGHT)) *
                      100
                    }
                  />
                </div>
              </div>
            ) : null}
            {selectedTopControlMode === "text" && selectedTextLayer?.type === "heading" ? (
              <div className="flex shrink-0 items-center gap-2">
                <span className="shrink-0 text-[12px] font-semibold" style={{ color: "#333333" }}>
                  ระยะห่าง{" "}
                  <span style={{ color: "#9ca3af" }}>{selectedHeadingLetterSpacing.toFixed(1)}</span>
                </span>
                <div className="shrink-0 w-fit px-[2px]">
                  <Range
                    min={HEADING_LAYER_MIN_LETTER_SPACING}
                    max={HEADING_LAYER_MAX_LETTER_SPACING}
                    step={0.1}
                    value={selectedHeadingLetterSpacing}
                    handleChange={(event) =>
                      updateSelectedTextStyle({
                        textLetterSpacing: Math.max(
                          HEADING_LAYER_MIN_LETTER_SPACING,
                          Math.min(HEADING_LAYER_MAX_LETTER_SPACING, Number(event.target.value) || 0)
                        ),
                      })
                    }
                    pos={
                      ((selectedHeadingLetterSpacing - HEADING_LAYER_MIN_LETTER_SPACING) /
                        (HEADING_LAYER_MAX_LETTER_SPACING - HEADING_LAYER_MIN_LETTER_SPACING)) *
                      100
                    }
                  />
                </div>
              </div>
            ) : null}
            {selectedTopControlMode === "button" ? (
              <div className="flex shrink-0 items-center gap-2">
                <span className="shrink-0 text-[12px] font-semibold" style={{ color: "#333333" }}>
                  ขนาด{" "}
                  <span style={{ color: "#9ca3af" }}>
                    {Math.round(selectedButtonFontSizeBase)}
                  </span>
                </span>
                <div className="shrink-0 w-fit px-[2px]">
                  <Range
                    min={BUTTON_LAYER_MIN_FONT_SIZE}
                    max={BUTTON_LAYER_MAX_FONT_SIZE}
                    step={1}
                    value={selectedButtonFontSizeBase}
                    handleChange={(event) =>
                      updateSelectedButtonStyle({
                        buttonFontSizeBase: Math.max(
                          BUTTON_LAYER_MIN_FONT_SIZE,
                          Math.min(BUTTON_LAYER_MAX_FONT_SIZE, Number(event.target.value) || 0)
                        ),
                      })
                    }
                    pos={
                      ((selectedButtonFontSizeBase - BUTTON_LAYER_MIN_FONT_SIZE) /
                        (BUTTON_LAYER_MAX_FONT_SIZE - BUTTON_LAYER_MIN_FONT_SIZE)) *
                      100
                    }
                  />
                </div>
              </div>
            ) : null}
            {selectedTopControlMode === "button" ? (
              <div className="flex shrink-0 items-center gap-2">
                <span className="shrink-0 text-[12px] font-semibold" style={{ color: "#333333" }}>
                  โค้งมน{" "}
                  <span style={{ color: "#9ca3af" }}>
                    {Math.round(selectedButtonRadius)}
                  </span>
                </span>
                <div className="shrink-0 w-fit px-[2px]">
                  <Range
                    min={0}
                    max={100}
                    step={1}
                    value={selectedButtonRadius}
                    handleChange={(event) =>
                      updateSelectedButtonStyle({
                        buttonRadius: Math.max(0, Math.min(100, Number(event.target.value) || 0)),
                      })
                    }
                    pos={selectedButtonRadius}
                  />
                </div>
              </div>
            ) : null}
            {selectedTopControlMode === "text" && selectedTextLayer?.type === "heading" ? (
              <div className="flex shrink-0 items-center gap-2 pl-1">
                <span className="shrink-0 text-[12px] font-semibold" style={{ color: "#333333" }}>
                  เส้น
                </span>
                <AntSwitch
                  checked={selectedHeadingStrokeEnabled}
                  onChange={(event) =>
                    updateSelectedTextStyle({
                      textStrokeEnabled: event.target.checked,
                    })
                  }
                  inputProps={{
                    "aria-label": "เปิดปิดเส้นข้อความ Heading",
                    title: "เปิดปิดเส้นข้อความ Heading",
                  }}
                />
              </div>
            ) : null}
            {selectedTopControlMode === "icon" || selectedTopControlMode === "text" ? (
              <div className="flex shrink-0 items-center gap-2 pl-1">
                <span className="shrink-0 text-[12px] font-semibold" style={{ color: "#333333" }}>
                  เงา
                </span>
                <AntSwitch
                  checked={
                    selectedTopControlMode === "icon"
                      ? selectedIconShadowEnabled
                      : selectedTextShadowEnabled
                  }
                  onChange={(event) => {
                    if (selectedTopControlMode === "icon") {
                      updateSelectedIconStyle({
                        iconShadowEnabled: event.target.checked,
                      });
                    } else {
                      updateSelectedTextStyle({
                        textShadowEnabled: event.target.checked,
                      });
                    }
                  }}
                  inputProps={{
                    "aria-label":
                      selectedTopControlMode === "icon"
                        ? "เปิดปิดเงาไอคอน"
                        : "เปิดปิดเงาข้อความ",
                    title:
                      selectedTopControlMode === "icon"
                        ? "เปิดปิดเงาไอคอน"
                        : "เปิดปิดเงาข้อความ",
                  }}
                />
              </div>
            ) : null}
            {selectedTopControlMode === "shape" || selectedTopControlMode === "image" ? (
              <div className="flex shrink-0 items-center gap-2">
                <span className="shrink-0 text-[12px] font-semibold" style={{ color: "#333333" }}>
                  เบลอ{" "}
                  <span style={{ color: "#9ca3af" }}>
                    {Math.round(selectedTopControlMode === "shape" ? selectedShapeFillBlur : selectedImageBlur)}
                  </span>
                </span>
                <div className="shrink-0 w-fit px-[2px]">
                  <Range
                    min={0}
                    max={100}
                    step={1}
                    value={selectedTopControlMode === "shape" ? selectedShapeFillBlur : selectedImageBlur}
                    handleChange={(event) =>
                      selectedTopControlMode === "shape"
                        ? updateSelectedShapeStyle({ fillBlur: Number(event.target.value) })
                        : updateSelectedImageStyle({ imageBlur: Number(event.target.value) })
                    }
                    pos={selectedTopControlMode === "shape" ? selectedShapeFillBlur : selectedImageBlur}
                  />
                </div>
              </div>
            ) : null}
            {selectedTopControlMode === "shape" ? (
              <div className="flex shrink-0 items-center gap-2 pl-1">
                <span className="shrink-0 text-[12px] font-semibold" style={{ color: "#333333" }}>
                  เส้น
                </span>
                <AntSwitch
                  checked={selectedShapeStrokeEnabled}
                  onChange={(event) =>
                    updateSelectedShapeStyle({
                      shapeStrokeEnabled: event.target.checked,
                    })
                  }
                  inputProps={{
                    "aria-label": "เปิดปิดเส้นขอบ Shape",
                    title: "เปิดปิดเส้นขอบ Shape",
                  }}
                />
              </div>
            ) : null}
          </div>
        </div>
        <div
          className="relative overflow-hidden p-10"
          style={{
            paddingTop: sectionData.paddingTop,
            paddingBottom: sectionData.paddingBottom,
          }}
          onClick={() => openOffcavanas?.("Hero", sectionData, handleUpdateSection)}
          onMouseEnter={() => setIsHoverSection(true)}
          onMouseLeave={() => setIsHoverSection(false)}
        >
          {shouldUseDeviceColorBleedMode ? (
            <>
              <div className="pointer-events-none absolute inset-0 z-0" style={previewFrameMediaClipStyle}>
                {sceneVisualMediaContent}
              </div>
              <div className="pointer-events-none absolute inset-0 z-[1]">
                {sceneVisualColorContent}
              </div>
            </>
          ) : shouldClipBackgroundToPreviewFrame ? (
            <div className="pointer-events-none absolute inset-0 z-0" style={previewFrameMediaClipStyle}>
              {sceneVisualMediaContent}
            </div>
          ) : (
            sceneVisualMediaContent
          )}
          {renderPreviewFrameSideGuides()}
          {svgDividerPath ? (
            <div
              className="pointer-events-none absolute inset-x-0 z-[3]"
              style={{
                bottom: 0,
                height: `${svgDividerHeight}px`,
                ...(previewFrameMediaClipStyle || {}),
              }}
              aria-hidden
            >
              <svg
                viewBox={`0 0 ${HERO_SVG_DIVIDER_VIEWBOX_WIDTH} ${HERO_SVG_DIVIDER_VIEWBOX_HEIGHT}`}
                preserveAspectRatio="none"
                className="h-full w-full"
              >
                {Array.from({ length: svgDividerSegmentCount }).map((_, index) => (
                  <g
                    key={`hero-divider-segment-${index}`}
                    transform={`translate(${svgDividerSegmentOffsetX + index * svgDividerSegmentWidth} 0) scale(${svgDividerSegmentScaleX} 1)`}
                  >
                    <path
                      d={svgDividerPath}
                      fill={svgDividerColor}
                      transform={svgDividerPathTransform || undefined}
                    />
                  </g>
                ))}
              </svg>
            </div>
          ) : null}
          {isHoverSection && (
            <div className="absolute -left-px -top-px z-20">
              <button
                type="button"
                className="bg-gray-900 px-[6px] py-[6px] text-white"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openOffcavanas?.("Hero", sectionData, handleUpdateSection);
                }}
                aria-label="Section settings"
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>
          )}
          <div
            className={`relative z-10 mx-auto flex items-center justify-center bg-transparent text-[13px] text-slate-500 ${
              shouldClipBackgroundToPreviewFrame ? "overflow-hidden" : ""
            }`}
            style={{
              ...previewFrameBoundsStyle,
            }}
            ref={previewDropRef}
            onMouseDown={(event) => {
              const target = event.target;
              if (target instanceof Element && target.closest('[data-hero-layer-item="true"]')) return;
              setSelectedLayerWithSync(null);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = "copy";
            }}
            onDrop={handleLayerDrop}
          >
            <div className="pointer-events-none absolute inset-0 z-10">
              {sortedLayerItems.map((item, index) => {
                const fallbackIndex = Number.isFinite(Number(item?.__originalIndex))
                  ? Number(item.__originalIndex)
                  : index;
                const canOverflowSection =
                  item?.type === "image" || item?.type === "rectangle" || item?.type === "circle";
                const baseX = Number.isFinite(Number(item?.x))
                  ? canOverflowSection
                    ? Math.max(-4000, Math.min(4000, Number(item.x)))
                    : Math.max(24, Math.min(4000, Number(item.x)))
                  : 96 + fallbackIndex * 24;
                const baseY = Number.isFinite(Number(item?.y))
                  ? canOverflowSection
                    ? Math.max(-4000, Math.min(4000, Number(item.y)))
                    : Math.max(24, Math.min(4000, Number(item.y)))
                  : 96 + fallbackIndex * 24;
                const draftPoint = layerDragDraft[item?.id];
                const draftSize = layerResizeDraft[item?.id];
                const x = Number.isFinite(Number(draftSize?.x))
                  ? Number(draftSize.x)
                  : Number.isFinite(Number(draftPoint?.x))
                    ? Number(draftPoint.x)
                    : baseX;
                const y = Number.isFinite(Number(draftSize?.y))
                  ? Number(draftSize.y)
                  : Number.isFinite(Number(draftPoint?.y))
                    ? Number(draftPoint.y)
                    : baseY;
                const isTextElement = item?.type === "text" || item?.type === "heading";
                const isHeadingElement = item?.type === "heading";
                const isButtonElement =
                  item?.type === "button" ||
                  item?.type === "button-primary" ||
                  item?.type === "button-dual" ||
                  item?.type === "button-secondary";
                const isImageElement = item?.type === "image";
                const isRectangleElement = item?.type === "rectangle";
                const isCircleElement = item?.type === "circle";
                const isIconElement = item?.type === "icon";
                const isResizableElement =
                  isTextElement ||
                  isButtonElement ||
                  isImageElement ||
                  isRectangleElement ||
                  isCircleElement ||
                  isIconElement;
                const isSelected = isResizableElement && selectedLayerId === item?.id;
                const textHandleSizeClass = "h-[10px] w-[10px]";
                const baseFontSize = Math.max(
                  TEXT_LAYER_MIN_FONT_SIZE,
                  Math.min(
                    TEXT_LAYER_MAX_FONT_SIZE,
                    Number(item?.fontSize) ||
                      (isHeadingElement ? HEADING_LAYER_DEFAULT_FONT_SIZE : TEXT_LAYER_DEFAULT_FONT_SIZE)
                  )
                );
                const committedLayerTextValue = String(
                  item?.text || item?.label || (isHeadingElement ? "Heading" : "Text")
                );
                const liveDraftLayerTextValue =
                  editingTextLayerId === item?.id &&
                  typeof editingTextDrafts[item?.id] === "string"
                    ? editingTextDrafts[item.id]
                    : null;
                const layerTextValue = liveDraftLayerTextValue ?? committedLayerTextValue;
                const textCharWidthFactor = TEXT_LAYER_CHAR_WIDTH_FACTOR;
                const textFontWeight = item?.textBold === true
                  ? TEXT_LAYER_FONT_WEIGHT_BOLD
                  : TEXT_LAYER_FONT_WEIGHT_NORMAL;
                const textFontFamily = isHeadingElement
                  ? themeHeadingFontFamily || themeTextFontFamily
                  : themeTextFontFamily;
                const textLetterSpacing = isHeadingElement
                  ? Math.max(
                      HEADING_LAYER_MIN_LETTER_SPACING,
                      Math.min(HEADING_LAYER_MAX_LETTER_SPACING, Number(item?.textLetterSpacing) || 0)
                    )
                  : 0;
                const textLineHeight = (() => {
                  const parsed = Number(item?.textLineHeight);
                  if (Number.isFinite(parsed)) {
                    return Math.max(TEXT_LAYER_MIN_LINE_HEIGHT, Math.min(TEXT_LAYER_MAX_LINE_HEIGHT, parsed));
                  }
                  return TEXT_LAYER_LINE_HEIGHT_FACTOR;
                })();
                const textAllowWrap = true;
                const textHorizontalPadding = TEXT_LAYER_HORIZONTAL_PADDING;
                const textVerticalPadding = TEXT_LAYER_VERTICAL_PADDING;
                const fontSize = Number.isFinite(Number(draftSize?.fontSize))
                  ? Number(draftSize.fontSize)
                  : baseFontSize;
                const textBoxSize = calculateTextLayerBoxSize(
                  layerTextValue,
                  fontSize,
                  null,
                  textCharWidthFactor,
                  textFontWeight,
                  textAllowWrap,
                  textHorizontalPadding,
                  textVerticalPadding,
                  textLineHeight,
                  textFontFamily,
                  textLetterSpacing
                );
                const baseTextWidth = buildSafeHeadingWidth(
                  Number.isFinite(Number(item?.width))
                    ? Number(item.width)
                    : textBoxSize.width
                );
                const textWidth = isTextElement
                  ? (Number.isFinite(Number(draftSize?.width))
                      ? buildSafeHeadingWidth(draftSize.width)
                      : baseTextWidth)
                  : null;
                const textWrappedBoxSize = isTextElement
                  ? calculateTextLayerBoxSize(
                      layerTextValue,
                      fontSize,
                      textWidth,
                      textCharWidthFactor,
                      textFontWeight,
                      textAllowWrap,
                      textHorizontalPadding,
                      textVerticalPadding,
                      textLineHeight,
                      textFontFamily,
                      textLetterSpacing
                    )
                  : null;
                const baseImageSize = buildSafeImageSize(item?.width, item?.height);
                const baseRectangleSize = buildSafeRectangleSize(item?.width, item?.height);
                const baseButtonSize = buildSafeButtonSize(item?.width, item?.height);
                const baseCircleSize = buildSafeCircleStretchSize(item?.width, item?.height);
                const baseIconSize = buildSafeIconSize(
                  Math.max(Number(item?.width) || 0, Number(item?.height) || 0)
                );
                const width = isTextElement
                  ? textWidth
                  : isButtonElement
                    ? Number.isFinite(Number(draftSize?.width))
                      ? Number(draftSize.width)
                      : baseButtonSize.width
                  : isImageElement
                    ? Number.isFinite(Number(draftSize?.width))
                      ? Number(draftSize.width)
                      : baseImageSize.width
                  : isRectangleElement
                    ? Number.isFinite(Number(draftSize?.width))
                      ? Number(draftSize.width)
                      : baseRectangleSize.width
                    : isCircleElement
                      ? Number.isFinite(Number(draftSize?.width))
                        ? Number(draftSize.width)
                        : baseCircleSize.width
                    : isIconElement
                      ? Number.isFinite(Number(draftSize?.width))
                        ? Number(draftSize.width)
                        : baseIconSize.width
                    : null;
                const height = isTextElement
                  ? textWrappedBoxSize?.height ?? textBoxSize.height
                  : isButtonElement
                    ? Number.isFinite(Number(draftSize?.height))
                      ? Number(draftSize.height)
                      : baseButtonSize.height
                  : isImageElement
                    ? Number.isFinite(Number(draftSize?.height))
                      ? Number(draftSize.height)
                      : baseImageSize.height
                  : isRectangleElement
                    ? Number.isFinite(Number(draftSize?.height))
                      ? Number(draftSize.height)
                      : baseRectangleSize.height
                    : isCircleElement
                      ? Number.isFinite(Number(draftSize?.height))
                        ? Number(draftSize.height)
                        : baseCircleSize.height
                    : isIconElement
                      ? Number.isFinite(Number(draftSize?.height))
                        ? Number(draftSize.height)
                        : baseIconSize.height
                    : null;
                const layerAnimationEnabled = item?.animationEnabled === true;
                const layerAnimationType = HERO_LAYER_ANIMATION_TYPES.has(item?.animationType)
                  ? item.animationType
                  : HERO_LAYER_ANIMATION_DEFAULTS.animationType;
                const layerAnimationDurationMs = Number.isFinite(Number(item?.animationDurationMs))
                  ? Math.max(100, Math.min(5000, Number(item.animationDurationMs)))
                  : HERO_LAYER_ANIMATION_DEFAULTS.animationDurationMs;
                const layerAnimationDelayMs = Number.isFinite(Number(item?.animationDelayMs))
                  ? Math.max(0, Math.min(3000, Number(item.animationDelayMs)))
                  : HERO_LAYER_ANIMATION_DEFAULTS.animationDelayMs;
                const layerAnimationEasing = HERO_LAYER_ANIMATION_DEFAULTS.animationEasing;
                const layerAnimationOnce = true;
                const previewState = layerAnimationPreviewState[item?.id];
                const isLayerPreviewPlaying = previewState?.playing === true;
                const layerPreviewRunKey = Number(previewState?.runKey || 0);
                const showSelectionFrame = isSelected && !isLayerPreviewPlaying;
                const shouldApplyLayerAnimation =
                  (layerAnimationEnabled && !isSelected) || isLayerPreviewPlaying;
                const layerAnimationName = shouldApplyLayerAnimation
                  ? layerAnimationType === "slide-in-down"
                    ? "heroLayerAnimSlideInDown"
                    : layerAnimationType === "slide-in-left"
                    ? "heroLayerAnimSlideInLeft"
                    : layerAnimationType === "slide-in-right"
                      ? "heroLayerAnimSlideInRight"
                      : layerAnimationType === "slide-in-up"
                        ? "heroLayerAnimSlideInUp"
                        : layerAnimationType === "zoom-in"
                          ? "heroLayerAnimZoomIn"
                          : layerAnimationType === "zoom-out"
                            ? "heroLayerAnimZoomOut"
                            : "heroLayerAnimFadeIn"
                  : null;
                const layerAnimationStyle = layerAnimationName
                  ? {
                      animationName: layerAnimationName,
                      animationDuration: `${layerAnimationDurationMs}ms`,
                      animationDelay: `${layerAnimationDelayMs}ms`,
                      animationTimingFunction: layerAnimationEasing,
                      animationIterationCount: isLayerPreviewPlaying
                        ? 1
                        : layerAnimationOnce
                          ? 1
                          : "infinite",
                      animationFillMode: isLayerPreviewPlaying ? "none" : "both",
                      willChange: "transform, opacity",
                    }
                  : null;
                const layerRenderKeyBase = item?.id || `hero-layer-item-${index}`;
                const layerRenderKey =
                  layerPreviewRunKey > 0
                    ? `${layerRenderKeyBase}-${layerPreviewRunKey}`
                    : layerRenderKeyBase;
                return (
                  <div
                    key={layerRenderKey}
                    data-hero-layer-item="true"
                    className={`pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 select-none ${
                      isTextElement
                        ? "cursor-pointer"
                        : isButtonElement ||
                            isImageElement ||
                            isRectangleElement ||
                            isCircleElement ||
                            isIconElement
                          ? (isSelected ? "cursor-grab" : "cursor-pointer")
                          : "cursor-move"
                    }`}
                    style={{
                      left: `${x}px`,
                      top: `${y}px`,
                      zIndex: Number(item?.__safeZIndex || 1),
                      ...(isResizableElement ? { width: `${width}px`, height: `${height}px` } : {}),
                    }}
                    onMouseDown={(event) => {
                      if (
                        isTextElement &&
                        editingTextLayerId !== item?.id &&
                        event.currentTarget instanceof HTMLElement
                      ) {
                        const rect = event.currentTarget.getBoundingClientRect();
                        const localX = event.clientX - rect.left;
                        const localY = event.clientY - rect.top;
                        const edgeHit = 16;
                        const nearLeft = localX <= edgeHit;
                        const nearRight = localX >= rect.width - edgeHit;
                        const nearTop = localY <= edgeHit;
                        const nearBottom = localY >= rect.height - edgeHit;
                        const cornerKey = nearLeft && nearTop
                          ? "nw"
                          : nearRight && nearTop
                            ? "ne"
                            : nearLeft && nearBottom
                              ? "sw"
                              : nearRight && nearBottom
                                ? "se"
                                : null;
                        if (cornerKey) {
                          setSelectedLayerWithSync(item?.id || null);
                          startLayerResize(event, item, width, height, fontSize, cornerKey, "text", x, y);
                          return;
                        }
                        if (nearLeft || nearRight) {
                          setSelectedLayerWithSync(item?.id || null);
                          startLayerResize(
                            event,
                            item,
                            width,
                            height,
                            fontSize,
                            nearLeft ? "w" : "e",
                            "text-edge",
                            x,
                            y
                          );
                          return;
                        }
                      }
                      if (isResizableElement) {
                        setSelectedLayerWithSync(item?.id || null);
                      }
                      if ((isTextElement || isButtonElement) && editingTextLayerId === item?.id) return;
                      startLayerDrag(event, item, x, y, width, height);
                    }}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      if (isResizableElement) {
                        setSelectedLayerWithSync(item?.id || null);
                      }
                    }}
                    onDoubleClick={(event) => {
                      if (!isImageElement && !isIconElement && !isTextElement && !isButtonElement) return;
                      event.preventDefault();
                      event.stopPropagation();
                      setSelectedLayerWithSync(item?.id || null);
                      if (isImageElement) {
                        setIsLayerImagePickerOpen(true);
                      } else if (isIconElement) {
                        setIsLayerIconPickerOpen(true);
                      } else if (isTextElement || isButtonElement) {
                        startTextEditing(item?.id || null);
                      }
                    }}
                  >
                    {isResizableElement ? (
                      <div
                        className={`relative h-full w-full ${
                          isCircleElement
                            ? showSelectionFrame
                              ? "rounded-md border border-white/80 bg-transparent shadow-[0_0_0_1px_rgba(0,0,0,0.2)]"
                              : "rounded-md border border-transparent bg-transparent"
                            : isRectangleElement
                              ? showSelectionFrame
                                ? "rounded-md border border-white/80 bg-transparent shadow-[0_0_0_1px_rgba(0,0,0,0.15)]"
                                : "rounded-md border border-transparent bg-transparent"
                            : isImageElement
                              ? showSelectionFrame
                                ? "rounded-md border border-white/80 bg-transparent shadow-[0_0_0_1px_rgba(0,0,0,0.15)]"
                                : "rounded-md border border-transparent bg-transparent"
                            : isIconElement
                              ? showSelectionFrame
                                ? "rounded-md border border-white/80 bg-transparent shadow-[0_0_0_1px_rgba(0,0,0,0.15)]"
                                : "rounded-md border border-transparent bg-transparent"
                            : isButtonElement
                              ? showSelectionFrame
                                ? "rounded-md border border-white/80 bg-transparent shadow-[0_0_0_1px_rgba(0,0,0,0.15)]"
                                : "rounded-md border border-transparent bg-transparent"
                            : isTextElement
                              ? showSelectionFrame
                                ? "rounded-md border border-white/80 bg-transparent shadow-[0_0_0_1px_rgba(0,0,0,0.15)]"
                                : "rounded-md border border-transparent bg-transparent"
                            : showSelectionFrame
                              ? "rounded-md border border-white/80 bg-black/20 shadow-[0_0_0_1px_rgba(0,0,0,0.15)]"
                              : "rounded-md border border-transparent bg-black/10"
                        }`}
                        style={layerAnimationStyle || undefined}
                      >
                        {isImageElement && showSelectionFrame && (
                          <button
                            type="button"
                            className="absolute -top-8 right-0 z-10 rounded bg-black/80 px-2 py-1 text-[10px] font-medium text-white"
                            onMouseDown={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                            }}
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              setIsLayerImagePickerOpen(true);
                            }}
                          >
                            เปลี่ยนรูป
                          </button>
                        )}
                        {renderLayerPreviewItem({
                          ...item,
                          fontSize,
                          width,
                          height,
                          ...(isButtonElement &&
                          Number.isFinite(Number(draftSize?.buttonFontSizeBase))
                            ? { buttonFontSizeBase: Number(draftSize.buttonFontSizeBase) }
                            : {}),
                        })}
                        {showSelectionFrame &&
                          [
                            { key: "nw", className: "-left-[5px] -top-[5px] cursor-nwse-resize" },
                            { key: "ne", className: "-right-[5px] -top-[5px] cursor-nesw-resize" },
                            { key: "sw", className: "-bottom-[5px] -left-[5px] cursor-nesw-resize" },
                            { key: "se", className: "-bottom-[5px] -right-[5px] cursor-nwse-resize" },
                          ].map((handle) => (
                            <span
                              key={`${item?.id}-${handle.key}`}
                              data-resize-handle="true"
                              className={`absolute z-20 ${
                                isTextElement ? textHandleSizeClass : "h-[10px] w-[10px]"
                              } pointer-events-auto rounded-[2px] border border-slate-700 bg-white ${handle.className}`}
                              onMouseDown={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                startLayerResize(
                                  event,
                                  item,
                                  width,
                                  height,
                                  isTextElement ? fontSize : null,
                                  handle.key,
                                  isImageElement
                                    ? "image"
                                    : isRectangleElement
                                      ? "rectangle"
                                      : isTextElement
                                        ? "text"
                                      : isButtonElement
                                        ? "rectangle"
                                      : isCircleElement
                                        ? "circle"
                                      : isIconElement
                                        ? "icon"
                                      : "text",
                                  x,
                                  y
                                );
                              }}
                            />
                          ))}
                        {(isButtonElement || isImageElement || isRectangleElement || isCircleElement || isIconElement) &&
                          showSelectionFrame &&
                          [
                            { key: "w", className: "-left-[5px] top-1/2 -translate-y-1/2 cursor-ew-resize" },
                            { key: "e", className: "-right-[5px] top-1/2 -translate-y-1/2 cursor-ew-resize" },
                            { key: "n", className: "left-1/2 -top-[5px] -translate-x-1/2 cursor-ns-resize" },
                            { key: "s", className: "-bottom-[5px] left-1/2 -translate-x-1/2 cursor-ns-resize" },
                          ].map((handle) => (
                            <span
                              key={`${item?.id}-edge-${handle.key}`}
                              data-resize-handle="true"
                              className={`absolute h-[10px] w-[10px] pointer-events-auto rounded-[2px] border border-slate-700 bg-white ${handle.className}`}
                              onMouseDown={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                startLayerResize(
                                  event,
                                  item,
                                  width,
                                  height,
                                  null,
                                  handle.key,
                                  isImageElement
                                    ? "image-edge"
                                    : isRectangleElement
                                      ? "rectangle-edge"
                                    : isButtonElement
                                      ? "rectangle-edge"
                                    : isCircleElement
                                      ? "circle-edge"
                                      : "icon-edge",
                                  x,
                                  y
                                );
                              }}
                            />
                          ))}
                        {isTextElement &&
                          showSelectionFrame &&
                          [
                            { key: "w", className: "-left-[5px] top-1/2 -translate-y-1/2 cursor-ew-resize" },
                            { key: "e", className: "-right-[5px] top-1/2 -translate-y-1/2 cursor-ew-resize" },
                          ].map((handle) => (
                            <span
                              key={`${item?.id}-text-edge-${handle.key}`}
                              data-resize-handle="true"
                              className={`absolute z-20 ${textHandleSizeClass} pointer-events-auto rounded-[2px] border border-slate-700 bg-white ${handle.className}`}
                              onMouseDown={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                startLayerResize(
                                  event,
                                  item,
                                  width,
                                  height,
                                  fontSize,
                                  handle.key,
                                  "text-edge",
                                  x,
                                  y
                                );
                              }}
                            />
                          ))}
                        {(isTextElement ||
                          isButtonElement ||
                          isImageElement ||
                          isRectangleElement ||
                          isCircleElement ||
                          isIconElement) &&
                          showSelectionFrame &&
                          resizeLayerId === item?.id && (
                          <div className="pointer-events-none absolute left-1/2 top-full mt-[10px] min-w-[80px] -translate-x-1/2 rounded bg-white px-2 py-1 text-center text-[10px] font-medium tracking-wide text-black shadow-sm">
                            {isTextElement
                              ? resizeLayerMetaRef.current?.layerId === item?.id &&
                                  resizeLayerMetaRef.current?.mode === "text-edge"
                                ? `${Math.round(width)} × ${Math.round(height)}`
                                : `${isHeadingElement ? "Heading" : "Text"} ${Math.round(fontSize)}`
                              : `${Math.round(width)} × ${Math.round(height)}`}
                          </div>
                        )}
                      </div>
                    ) : (
                      renderLayerPreviewItem(item)
                    )}
                  </div>
                );
              })}
            </div>
            <div
              className="absolute left-1/2 z-20 flex -translate-x-1/2 items-center gap-2"
              style={{ bottom: bulletBottomOffset }}
            >
              {slides.map((slide, index) => {
                const active = slide.id === activeSlide?.id;
                return (
                  <button
                    key={`dot-${slide.id}`}
                    type="button"
                    className="transition-opacity"
                    style={{
                      width: `${bulletSize}px`,
                      height: `${bulletSize}px`,
                      minWidth: `${bulletSize}px`,
                      minHeight: `${bulletSize}px`,
                      borderRadius: bulletRadius,
                      backgroundColor: bulletColor,
                      opacity: active ? 1 : 0.35,
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setPreviewSlideIndex(index);
                      handleSelectSlide(slide.id);
                    }}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <ImageModal
        openModal={isLayerImagePickerOpen}
        setOpenModal={setIsLayerImagePickerOpen}
        handleChange={handleLayerImageChange}
      />
      <ServiceIcon
        header="เลือกไอคอน"
        icon={selectedIconLayer?.faIcon}
        open={isLayerIconPickerOpen}
        onClose={() => setIsLayerIconPickerOpen(false)}
        handleChange={(iconRef) => {
          updateSelectedIconStyle({ faIcon: iconRef });
        }}
        darkColor="#333333"
        darkMode="light"
      />
      <style>{`
        @keyframes heroSceneFadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes heroSceneFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes heroSceneSlideOutLeft {
          from { transform: translateX(0); }
          to { transform: translateX(-100%); }
        }
        @keyframes heroSceneSlideInLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes heroSceneSlideOutRight {
          from { transform: translateX(0); }
          to { transform: translateX(100%); }
        }
        @keyframes heroSceneSlideInRight {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        ${HERO_LAYER_ANIMATION_KEYFRAMES}
      `}</style>
    </main>
  );
}

export default HeroPage;
