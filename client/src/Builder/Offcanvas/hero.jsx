import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { panelGroupButtonSx } from "../panelControlSx";
import {
  Box,
  Button,
  ButtonGroup,
  FormControl,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import Switch from "@mui/material/Switch";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Copy,
  Hand,
  Menu,
  Pause,
  Play,
  Sparkles,
  Trash2,
} from "lucide-react";
import lodash from "lodash";
import ImageModal from "../imageModal";
import Range from "../HTML/Range";
import { swatchSelectedCheckClassName } from "../Layouts/Elements/swatchCheckClass";
import { THEME_PANEL_BASIC_COLOR_SWATCHES } from "../themePanelBasicColors";
import { getTheme } from "../../../Functions/theme";

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
    "&.Mui-checked": {
      transform: "translateX(12px)",
      color: "#fff",
      "& + .MuiSwitch-track": { opacity: 1, backgroundColor: "#333333" },
    },
  },
  "& .MuiSwitch-thumb": {
    boxShadow: "0 2px 4px 0 rgb(0 35 11 / 20%)",
    width: 12,
    height: 12,
    borderRadius: 6,
    transition: theme.transitions.create(["width"], { duration: 200 }),
  },
  "& .MuiSwitch-track": {
    borderRadius: 8,
    opacity: 1,
    backgroundColor: "rgba(0,0,0,.25)",
    boxSizing: "border-box",
  },
}));

const HERO_PANEL_TABS = [
  { id: "slideshow", label: "สไลด์โชว์" },
  { id: "settings", label: "ตั้งค่า" },
  { id: "layer", label: "เลย์เยอร์" },
];
const SLIDE_DISPLAY_OPTIONS = [
  { value: "fade", label: "ค่อยๆจาง" },
  { value: "slide", label: "เลื่อนซ้าย" },
  { value: "slide-right", label: "เลื่อนขวา" },
];
const HERO_LAYER_LIBRARY_ITEMS = [
  { type: "text", label: "Text", icon: "format_size", iconType: "material" },
  { type: "heading", label: "Heading", icon: Sparkles },
  { type: "button", label: "Button", icon: Hand },
  { type: "icon", label: "Icons", icon: "token", iconType: "material" },
  { type: "image", label: "Image", icon: "image", iconType: "material" },
  { type: "rectangle", label: "Rectangle", icon: "crop_square", iconType: "material" },
  { type: "circle", label: "Circle", icon: "circle", iconType: "material" },
];
const HERO_LAYER_ANIMATION_TYPES = [
  { value: "fade-in", label: "ค่อยๆ แสดง" },
  { value: "slide-in-down", label: "เลื่อนจากบน" },
  { value: "slide-in-left", label: "เลื่อนจากซ้าย" },
  { value: "slide-in-right", label: "เลื่อนจากขวา" },
  { value: "slide-in-up", label: "เลื่อนจากล่าง" },
  { value: "zoom-in", label: "ซูมเข้า" },
  { value: "zoom-out", label: "ซูมออก" },
];
const HERO_LAYER_ANIMATION_DEFAULTS = {
  animationEnabled: false,
  animationType: "fade-in",
  animationDurationMs: 800,
  animationDelayMs: 0,
  animationEasing: "ease-out",
  animationOnce: true,
};
const HERO_LAYER_ANIMATION_PREVIEW_EVENT = "builder:hero-layer-animation-preview";
const normalizeLayerItemsWithZIndex = (layerItems) => {
  if (!Array.isArray(layerItems) || layerItems.length === 0) return [];
  return layerItems
    .map((item, index) => ({
      ...(item && typeof item === "object" ? lodash.cloneDeep(item) : {}),
      id: String(item?.id || `hero-layer-${Date.now()}-${index}`),
      zIndex: Number.isFinite(Number(item?.zIndex)) ? Number(item.zIndex) : index + 1,
      animationEnabled: item?.animationEnabled === true,
      animationType: HERO_LAYER_ANIMATION_TYPES.some((entry) => entry.value === item?.animationType)
        ? item.animationType
        : HERO_LAYER_ANIMATION_DEFAULTS.animationType,
      animationDurationMs: Number.isFinite(Number(item?.animationDurationMs))
        ? Math.max(100, Math.min(5000, Number(item.animationDurationMs)))
        : HERO_LAYER_ANIMATION_DEFAULTS.animationDurationMs,
      animationDelayMs: Number.isFinite(Number(item?.animationDelayMs))
        ? Math.max(0, Math.min(3000, Number(item.animationDelayMs)))
        : HERO_LAYER_ANIMATION_DEFAULTS.animationDelayMs,
      animationEasing: HERO_LAYER_ANIMATION_DEFAULTS.animationEasing,
      animationOnce: true,
    }))
    .sort((a, b) => Number(a.zIndex) - Number(b.zIndex))
    .map((item, index) => ({
      ...item,
      zIndex: index + 1,
    }));
};
const getLayerItemTitle = (item) => {
  if (typeof item?.label === "string" && item.label.trim()) return item.label;
  if (item?.type === "image") return "Image";
  if (item?.type === "heading") return "Heading";
  if (item?.type === "text") return "Text";
  if (item?.type === "button") return "Button";
  if (item?.type === "button-dual") return "Button Dual";
  if (item?.type === "icon") return "Icon";
  if (item?.type === "rectangle") return "Rectangle";
  if (item?.type === "circle") return "Circle";
  return "Layer";
};
const BULLET_SHAPE_OPTIONS = [
  { value: "circle", label: "กลม" },
  { value: "square", label: "สี่เหลี่ยม" },
  { value: "rounded", label: "มุมมน" },
];
const HERO_SVG_DIVIDER_TYPE_OPTIONS = [
  { value: "wave", label: "Wave" },
  { value: "curve", label: "Curve" },
  { value: "cloud", label: "Freeform" },
  { value: "cloudSoft", label: "Cloud" },
  { value: "triangle", label: "Triangle" },
  { value: "arrowSplit", label: "Arrow Split" },
  { value: "zigzag", label: "Zigzag" },
];
const HERO_SVG_DIVIDER_HEIGHT_MIN = 24;
const HERO_SVG_DIVIDER_HEIGHT_MAX = 180;
const HERO_SVG_DIVIDER_DENSITY_MIN = 0.5;
const HERO_SVG_DIVIDER_DENSITY_MAX = 10;
const HERO_SVG_DIVIDER_SIZE_MIN = 0.5;
const HERO_SVG_DIVIDER_SIZE_MAX = 2.5;
const SLIDE_DURATION_MS_MIN = 1000;
const SLIDE_DURATION_MS_MAX = 20000;
const SLIDE_DURATION_MS_STEP = 100;
const HERO_BG_FOCUS_MIN = 0;
const HERO_BG_FOCUS_MAX = 100;
const HERO_BG_ZOOM_MIN = 80;
const HERO_BG_ZOOM_MAX = 100;
const HERO_BACKGROUND_CONTROL_DEVICE_SET = new Set(["Tablet", "Mobile"]);

const OPTION_CHIP_RADIUS = "0.375rem";
const CHIP_BORDER = "#e2e8f0";
const CHIP_BORDER_DARK = "rgba(255, 255, 255, 0.1)";
const CHIP_BG = "#ffffff";
const CHIP_BG_HOVER = "#f8fafc";
const CHIP_BG_DARK = "rgba(30, 41, 59, 0.9)";
const CHIP_BG_DARK_HOVER = "rgba(30, 41, 59, 1)";

const sectionLikeGroupButtonSx = panelGroupButtonSx;

const sectionLikeGroupRootSx = {
  width: "100%",
  alignItems: "stretch",
  boxShadow: "none",
  "& .MuiButton-root": {
    boxShadow: "none",
  },
  "& .MuiButtonGroup-grouped": {
    borderRadius: "0 !important",
    flex: "1 1 0",
    minWidth: 0,
    height: 34,
    minHeight: 34,
    maxHeight: 34,
    boxSizing: "border-box",
  },
  "& .MuiButtonGroup-grouped:first-of-type": {
    borderTopLeftRadius: `${OPTION_CHIP_RADIUS} !important`,
    borderBottomLeftRadius: `${OPTION_CHIP_RADIUS} !important`,
  },
  "& .MuiButtonGroup-grouped:last-of-type": {
    borderTopRightRadius: `${OPTION_CHIP_RADIUS} !important`,
    borderBottomRightRadius: `${OPTION_CHIP_RADIUS} !important`,
  },
  "& .MuiButtonGroup-grouped.MuiButton-outlined": {
    borderColor: "var(--dash-panel-btn-group-border, #e2e8f0) !important",
  },
  "& .MuiButtonGroup-grouped.MuiButton-outlined:not(:last-of-type)": {
    borderRightColor: "var(--dash-panel-btn-group-border, #e2e8f0) !important",
  },
  ".dark & .MuiButtonGroup-grouped.MuiButton-outlined": {
    borderColor: "var(--dash-panel-btn-group-border, #e2e8f0) !important",
  },
  ".dark & .MuiButtonGroup-grouped.MuiButton-outlined:not(:last-of-type)": {
    borderRightColor: "var(--dash-panel-btn-group-border, #e2e8f0) !important",
  },
};
const AnimationSelectInput = ({ value, onChange, options }) => {
  const OPTION_HEIGHT = 35;
  const selectStyle = {
    "& .MuiTypography-root": { fontSize: 13, color: "#050505" },
    "& .MuiSvgIcon-root": { color: "#050505" },
    "& .MuiOutlinedInput-root": {
      height: OPTION_HEIGHT,
      bgcolor: "var(--dash-panel-btn-group-inactive, #ffffff)",
    },
    "& .MuiSelect-select": {
      height: `${OPTION_HEIGHT}px !important`,
      minHeight: `${OPTION_HEIGHT}px !important`,
      display: "flex",
      alignItems: "center",
      py: 0,
      boxSizing: "border-box",
      pl: "10px",
      pr: "32px",
    },
    "& .MuiOutlinedInput-notchedOutline, \
     & .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline, \
     & .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline, \
     & .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline": {
      borderWidth: 1,
      borderColor: CHIP_BORDER,
    },
    ".dark & .MuiTypography-root": { color: "#ffffff" },
    ".dark & .MuiSvgIcon-root": { color: "#ffffff" },
    ".dark & .MuiOutlinedInput-root": { bgcolor: "var(--dash-panel-btn-group-inactive, #27272a)" },
    ".dark & .MuiOutlinedInput-notchedOutline, \
     .dark & .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline, \
     .dark & .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline, \
     .dark & .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline": {
      borderColor: CHIP_BORDER_DARK,
    },
  };
  return (
    <FormControl fullWidth sx={selectStyle}>
      <Select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        input={<OutlinedInput notched={false} />}
        aria-label="เลือกรูปแบบแอนิเมชั่น"
        MenuProps={{
          PaperProps: {
            elevation: 0,
            sx: {
              boxShadow: "none",
              borderRadius: 1,
              border: 1,
              borderColor: CHIP_BORDER,
              "& .MuiList-root": { py: 0, bgcolor: "var(--dash-panel-btn-group-inactive, #ffffff)" },
              "& .MuiMenuItem-root": {
                height: OPTION_HEIGHT,
                minHeight: OPTION_HEIGHT,
                py: 0.25,
                px: 1,
                fontSize: 13,
                gap: 0.5,
                borderBottom: 1,
                borderBottomColor: CHIP_BORDER,
                ":last-child": { borderBottom: 0 },
              },
              ".dark &": {
                borderColor: CHIP_BORDER_DARK,
                "& .MuiList-root": { bgcolor: "var(--dash-panel-btn-group-inactive, #27272a)" },
                "& .MuiMenuItem-root": {
                  borderBottomColor: CHIP_BORDER_DARK,
                },
              },
            },
          },
          MenuListProps: { dense: true },
        }}
      >
        {options.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
            sx={{
              "& .MuiTypography-root": { fontSize: 13, color: "#050505" },
              "&.Mui-selected": {
                backgroundColor: "#374151",
                "& .MuiTypography-root": { color: "#ffffff" },
              },
              "&.Mui-selected:hover": {
                backgroundColor: "#374151",
              },
              ".dark & .MuiTypography-root": { color: "#ffffff" },
            }}
          >
            <ListItemText primary={option.label} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

const buildDefaultHeroSection = () => ({
  id: "HeroSec-1",
  heroHeight: 400,
  slides: [{ id: "hero-slide-1", name: "Slide 1", displayMode: "fade", durationSec: 5, layerItems: [] }],
  activeSlideId: "hero-slide-1",
  activeLayerItemId: null,
  isAutoPlay: false,
  slideDisplayMode: "fade",
  slideDurationSec: 5,
  bulletShape: "circle",
  bulletSize: 10,
  bulletColor: "#454b57",
  bulletBottomOffset: 12,
  isGradient: false,
  backgroundColor: "#ffffff",
  backgroundColorGradient: [
    { type: "mainColor", index: 0 },
    { type: "mainColor", index: 1 },
  ],
  opacityColor: 255,
  opacityColorGradient: [255, 255],
  degrees: 90,
  backgroundImage: "",
  backgroundVideo: "",
  backgroundPositionX: 50,
  backgroundPositionY: 50,
  backgroundZoom: 100,
  backgroundFrameOnly: false,
  imageBrightness: 100,
  opacityImage: 1,
  blur: 0,
  parallaxEnabled: false,
  svgDividerEnabled: false,
  svgDividerType: "wave",
  svgDividerHeight: 64,
  svgDividerDensity: 1,
  svgDividerSize: 1,
  svgDividerColor: "#ffffff",
});
const createDefaultSlides = () => [
  { id: "hero-slide-1", name: "Slide 1", displayMode: "fade", durationSec: 5, layerItems: [] },
];

function HeroOffcanvas({ element, updateHero: onUpdate, close, textColor, device = "Desktop" }) {
  const [activeTab, setActiveTab] = useState("settings");
  const [data, setData] = useState(() => ({ ...buildDefaultHeroSection(), ...(element || {}) }));
  const [updated, setUpdated] = useState(false);
  const [backgroundPickerOpen, setBackgroundPickerOpen] = useState(false);
  const [gradientStop, setGradientStop] = useState("start");
  const [theme, setTheme] = useState(null);
  const [layerAnimationPreviewMap, setLayerAnimationPreviewMap] = useState({});
  const layerAnimationPreviewTimersRef = useRef({});
  const layerListItemRefsRef = useRef(new Map());
  const layerListPrevPositionsRef = useRef({});
  const layerListAnimationReadyRef = useRef(false);
  const slideListItemRefsRef = useRef(new Map());
  const slideListPrevPositionsRef = useRef({});
  const slideListAnimationReadyRef = useRef(false);
  const themeColors = useMemo(() => {
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
  const baseSwatches = useMemo(
    () =>
      THEME_PANEL_BASIC_COLOR_SWATCHES.map((item) =>
        typeof item === "string" ? item : item?.value
      ).filter(Boolean),
    []
  );
  const allColors = useMemo(() => [...themeColors, ...baseSwatches], [themeColors, baseSwatches]);

  useEffect(() => {
    if (!element) return;
    const merged = { ...buildDefaultHeroSection(), ...element };
    setUpdated(false);
    setData((prev) => (lodash.isEqual(prev, merged) ? prev : merged));
  }, [element, device]);

  useEffect(() => {
    getTheme("68d37327bedb0efab7dacafb")
      .then((res) => setTheme(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!updated) return;
    onUpdate?.(lodash.cloneDeep(data));
    setUpdated(false);
  }, [updated, data, onUpdate]);

  const resolveColor = (value) => {
    if (typeof value === "string") return value;
    if (value && typeof value === "object") {
      const palette = theme?.[value.type];
      if (Array.isArray(palette)) {
        return palette[value.index] || null;
      }
    }
    return null;
  };

  const gradientIndex = gradientStop === "end" ? 1 : 0;
  const slides = Array.isArray(data.slides) && data.slides.length > 0 ? data.slides : createDefaultSlides();
  const activeSlideId = slides.some((slide) => slide.id === data.activeSlideId)
    ? data.activeSlideId
    : slides[0]?.id;
  const activeSlide = slides.find((slide) => slide.id === activeSlideId) || slides[0] || null;
  const buildSlideId = () => `hero-slide-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
  const activeIsGradient = Boolean(activeSlide?.isGradient ?? data.isGradient);
  const activeSolidColor = activeSlide?.backgroundColor ?? data.backgroundColor;
  const activeSolidOpacity = Number(activeSlide?.opacityColor ?? data.opacityColor ?? 255);
  const activeGradientColors = Array.isArray(activeSlide?.backgroundColorGradient)
    ? activeSlide.backgroundColorGradient
    : Array.isArray(data.backgroundColorGradient)
      ? data.backgroundColorGradient
      : [{ type: "mainColor", index: 0 }, { type: "mainColor", index: 1 }];
  const activeGradientOpacities = Array.isArray(activeSlide?.opacityColorGradient)
    ? activeSlide.opacityColorGradient
    : Array.isArray(data.opacityColorGradient)
      ? data.opacityColorGradient
      : [255, 255];
  const activeGradientOpacity = Number(activeGradientOpacities?.[gradientIndex] ?? 255);
  const activeGradientColor = activeGradientColors?.[gradientIndex] ?? allColors[0];
  const gradientDegree = Math.max(0, Math.min(360, Number(activeSlide?.degrees ?? data.degrees ?? 90)));
  const heroHeight = Math.max(400, Math.min(800, Number(data.heroHeight ?? 400)));
  const activeBackgroundImage = activeSlide?.backgroundImage ?? data.backgroundImage ?? "";
  const activeBackgroundVideo = activeSlide?.backgroundVideo ?? data.backgroundVideo ?? "";
  const hasActiveBackgroundMedia = Boolean(activeBackgroundImage || activeBackgroundVideo);
  const activeBackgroundPositionX = Math.max(
    HERO_BG_FOCUS_MIN,
    Math.min(
      HERO_BG_FOCUS_MAX,
      (() => {
        const parsed = Number(activeSlide?.backgroundPositionX ?? data.backgroundPositionX ?? 50);
        return Number.isFinite(parsed) ? parsed : 50;
      })()
    )
  );
  const activeBackgroundPositionY = Math.max(
    HERO_BG_FOCUS_MIN,
    Math.min(
      HERO_BG_FOCUS_MAX,
      (() => {
        const parsed = Number(activeSlide?.backgroundPositionY ?? data.backgroundPositionY ?? 50);
        return Number.isFinite(parsed) ? parsed : 50;
      })()
    )
  );
  const activeBackgroundZoom = Math.max(
    HERO_BG_ZOOM_MIN,
    Math.min(
      HERO_BG_ZOOM_MAX,
      (() => {
        const parsed = Number(activeSlide?.backgroundZoom ?? data.backgroundZoom ?? 100);
        return Number.isFinite(parsed) ? parsed : 100;
      })()
    )
  );
  const activeBackgroundFrameOnly =
    (activeSlide?.backgroundFrameOnly ?? data.backgroundFrameOnly ?? false) === true;
  const showBackgroundPositionControls = HERO_BACKGROUND_CONTROL_DEVICE_SET.has(device);
  const parsedImageBrightness = Number(activeSlide?.imageBrightness ?? data.imageBrightness);
  const activeImageBrightness = Number.isFinite(parsedImageBrightness)
    ? Math.max(0, Math.min(200, Math.round(parsedImageBrightness)))
    : Math.max(
        0,
        Math.min(200, Math.round(Number(activeSlide?.opacityImage ?? data.opacityImage ?? 1) * 100))
      );
  const blurAmount = Math.max(0, Math.min(100, Number(activeSlide?.blur ?? data.blur ?? 0)));
  const normalizedSlideDisplayMode =
    data.slideDisplayMode === "none" ? "slide-right" : data.slideDisplayMode;
  const slideDisplayMode = SLIDE_DISPLAY_OPTIONS.some((item) => item.value === normalizedSlideDisplayMode)
    ? normalizedSlideDisplayMode
    : "fade";
  const isAutoPlay = data.isAutoPlay === true;
  const slideDurationSec = Math.max(1, Math.min(20, Number(data.slideDurationSec ?? 5) || 5));
  const slideDurationMs = Math.round(slideDurationSec * 1000);
  const bulletShape = BULLET_SHAPE_OPTIONS.some((item) => item.value === data.bulletShape)
    ? data.bulletShape
    : "circle";
  const bulletSize = Math.max(6, Math.min(24, Number(data.bulletSize ?? 10)));
  const bulletBottomOffset = Math.max(0, Math.min(80, Number(data.bulletBottomOffset ?? 12)));
  const bulletColor = data.bulletColor ?? "#454b57";
  const svgDividerEnabled = data.svgDividerEnabled === true;
  const normalizedSvgDividerType =
    data.svgDividerType === "tilt"
      ? "cloud"
      : data.svgDividerType === "triangleCurve"
        ? "arrowSplit"
        : data.svgDividerType;
  const svgDividerType = HERO_SVG_DIVIDER_TYPE_OPTIONS.some(
    (item) => item.value === normalizedSvgDividerType
  )
    ? normalizedSvgDividerType
    : "wave";
  const svgDividerHeight = Math.max(
    HERO_SVG_DIVIDER_HEIGHT_MIN,
    Math.min(HERO_SVG_DIVIDER_HEIGHT_MAX, Number(data.svgDividerHeight ?? 64))
  );
  const parsedSvgDividerDensity = Number(data.svgDividerDensity);
  const svgDividerDensity = Number.isFinite(parsedSvgDividerDensity)
    ? Math.max(
        HERO_SVG_DIVIDER_DENSITY_MIN,
        Math.min(HERO_SVG_DIVIDER_DENSITY_MAX, parsedSvgDividerDensity)
      )
    : 1;
  const parsedSvgDividerSize = Number(data.svgDividerSize);
  const svgDividerSize = Number.isFinite(parsedSvgDividerSize)
    ? Math.max(
        HERO_SVG_DIVIDER_SIZE_MIN,
        Math.min(HERO_SVG_DIVIDER_SIZE_MAX, parsedSvgDividerSize)
      )
    : 1;
  const svgDividerColor = data.svgDividerColor ?? "#ffffff";

  const updateActiveSlideVisual = (field, value) => {
    if (!activeSlideId) return;
    const nextSlides = slides.map((slide) =>
      slide.id === activeSlideId ? { ...slide, [field]: value } : slide
    );
    setSlidesState(nextSlides, activeSlideId);
  };
  const updateActiveSlideVisuals = (patch) => {
    if (!activeSlideId || !patch || typeof patch !== "object") return;
    const nextSlides = slides.map((slide) =>
      slide.id === activeSlideId ? { ...slide, ...patch } : slide
    );
    setSlidesState(nextSlides, activeSlideId);
  };

  const handleSolidColor = (value) => {
    updateActiveSlideVisual("backgroundColor", value);
  };

  const handleGradientColor = (value) => {
    const next = Array.isArray(activeGradientColors)
      ? [...activeGradientColors]
      : [allColors[0], allColors[1] || allColors[0]];
    next[gradientIndex] = value;
    updateActiveSlideVisual("backgroundColorGradient", next);
  };

  const handleOpacity = (value) => {
    updateActiveSlideVisual("opacityColor", Number(value));
  };

  const handleGradientOpacity = (value) => {
    const next = Array.isArray(activeGradientOpacities) ? [...activeGradientOpacities] : [255, 255];
    next[gradientIndex] = Number(value);
    updateActiveSlideVisual("opacityColorGradient", next);
  };
  const setSlidesState = (nextSlides, nextActiveSlideId = null) => {
    const baseSlides =
      Array.isArray(nextSlides) && nextSlides.length > 0 ? nextSlides : createDefaultSlides();
    const safeSlides = baseSlides.map((slide, index) => {
      const base = slide && typeof slide === "object" ? { ...slide } : {};
      return {
        ...base,
        id: String(base.id || `hero-slide-${Date.now()}-${index}`),
        name: String(base.name || `Slide ${index + 1}`),
        displayMode: base.displayMode || "fade",
        durationSec: Number.isFinite(Number(base.durationSec))
          ? Math.max(1, Math.min(20, Number(base.durationSec)))
          : 5,
        layerItems: normalizeLayerItemsWithZIndex(base.layerItems),
      };
    });
    const safeActiveId = safeSlides.some((slide) => slide.id === nextActiveSlideId)
      ? nextActiveSlideId
      : safeSlides[0]?.id;
    setUpdated(true);
    setData((prev) => ({
      ...prev,
      slides: safeSlides,
      activeSlideId: safeActiveId,
    }));
  };
  const getNextSlideNumber = () => {
    const maxNum = slides.reduce((max, slide) => {
      const name = String(slide?.name || "").trim();
      const match = name.match(/^slide\s*(\d+)$/i);
      if (!match) return max;
      const num = Number(match[1]);
      if (!Number.isFinite(num)) return max;
      return Math.max(max, num);
    }, 0);
    return maxNum + 1;
  };
  const updateBulletSetting = (field, value) => {
    setUpdated(true);
    setData((prev) => ({ ...prev, [field]: value }));
  };
  const updateSectionSetting = (field, value) => {
    setUpdated(true);
    setData((prev) => ({ ...prev, [field]: value }));
  };
  const moveSlideAtIndex = (fromIndex, direction) => {
    const targetIndex = fromIndex + direction;
    if (targetIndex < 0 || targetIndex >= slides.length) return;
    const nextSlides = [...slides];
    const [moved] = nextSlides.splice(fromIndex, 1);
    nextSlides.splice(targetIndex, 0, moved);
    setSlidesState(nextSlides, activeSlideId || moved?.id);
  };
  const activeLayerItems = useMemo(
    () => normalizeLayerItemsWithZIndex(activeSlide?.layerItems),
    [activeSlide?.layerItems]
  );
  const activeLayerItemsForPanel = useMemo(
    () => [...activeLayerItems].sort((a, b) => Number(b.zIndex) - Number(a.zIndex)),
    [activeLayerItems]
  );
  useLayoutEffect(() => {
    const nextPositions = {};
    layerListItemRefsRef.current.forEach((node, layerId) => {
      if (!node || !node.isConnected) return;
      nextPositions[layerId] = node.getBoundingClientRect().top;
    });
    if (!layerListAnimationReadyRef.current) {
      layerListPrevPositionsRef.current = nextPositions;
      layerListAnimationReadyRef.current = true;
      return;
    }
    Object.entries(nextPositions).forEach(([layerId, nextTop]) => {
      const prevTop = layerListPrevPositionsRef.current[layerId];
      if (!Number.isFinite(prevTop)) return;
      const deltaY = prevTop - nextTop;
      if (Math.abs(deltaY) < 0.5) return;
      const node = layerListItemRefsRef.current.get(layerId);
      if (!node) return;
      node.style.transition = "none";
      node.style.transform = `translateY(${deltaY}px)`;
      node.style.willChange = "transform";
      window.requestAnimationFrame(() => {
        node.style.transition = "transform 220ms cubic-bezier(0.22, 1, 0.36, 1)";
        node.style.transform = "translateY(0)";
        const cleanup = () => {
          node.style.transition = "";
          node.style.willChange = "";
          node.removeEventListener("transitionend", cleanup);
        };
        node.addEventListener("transitionend", cleanup);
      });
    });
    layerListPrevPositionsRef.current = nextPositions;
  }, [activeLayerItemsForPanel]);
  useLayoutEffect(() => {
    const nextPositions = {};
    slideListItemRefsRef.current.forEach((node, slideId) => {
      if (!node || !node.isConnected) return;
      nextPositions[slideId] = node.getBoundingClientRect().top;
    });
    if (!slideListAnimationReadyRef.current) {
      slideListPrevPositionsRef.current = nextPositions;
      slideListAnimationReadyRef.current = true;
      return;
    }
    Object.entries(nextPositions).forEach(([slideId, nextTop]) => {
      const prevTop = slideListPrevPositionsRef.current[slideId];
      if (!Number.isFinite(prevTop)) return;
      const deltaY = prevTop - nextTop;
      if (Math.abs(deltaY) < 0.5) return;
      const node = slideListItemRefsRef.current.get(slideId);
      if (!node) return;
      node.style.transition = "none";
      node.style.transform = `translateY(${deltaY}px)`;
      node.style.willChange = "transform";
      window.requestAnimationFrame(() => {
        node.style.transition = "transform 220ms cubic-bezier(0.22, 1, 0.36, 1)";
        node.style.transform = "translateY(0)";
        const cleanup = () => {
          node.style.transition = "";
          node.style.willChange = "";
          node.removeEventListener("transitionend", cleanup);
        };
        node.addEventListener("transitionend", cleanup);
      });
    });
    slideListPrevPositionsRef.current = nextPositions;
  }, [slides]);
  const activeLayerItemId =
    typeof data?.activeLayerItemId === "string" ? data.activeLayerItemId : null;
  const activeSelectedLayerItem = useMemo(() => {
    if (!activeLayerItemId) return null;
    return activeLayerItems.find((item) => item?.id === activeLayerItemId) || null;
  }, [activeLayerItemId, activeLayerItems]);
  const isActiveLayerPreviewPlaying =
    Boolean(activeLayerItemId) && layerAnimationPreviewMap[activeLayerItemId] === true;
  const emitLayerAnimationPreview = (layerId, playing) => {
    const safeLayerId = typeof layerId === "string" ? layerId.trim() : "";
    if (!safeLayerId || typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent(HERO_LAYER_ANIMATION_PREVIEW_EVENT, {
        detail: {
          sectionId: String(data?.id || ""),
          layerId: safeLayerId,
          playing: playing === true,
        },
      })
    );
  };
  const clearLayerAnimationPreviewTimer = (layerId) => {
    const safeLayerId = typeof layerId === "string" ? layerId.trim() : "";
    if (!safeLayerId) return;
    const timer = layerAnimationPreviewTimersRef.current[safeLayerId];
    if (timer) {
      window.clearTimeout(timer);
      delete layerAnimationPreviewTimersRef.current[safeLayerId];
    }
  };
  const stopLayerAnimationPreview = (layerId) => {
    const safeLayerId = typeof layerId === "string" ? layerId.trim() : "";
    if (!safeLayerId) return;
    clearLayerAnimationPreviewTimer(safeLayerId);
    setLayerAnimationPreviewMap((prev) => ({ ...prev, [safeLayerId]: false }));
    emitLayerAnimationPreview(safeLayerId, false);
  };
  const getLayerAnimationPreviewRuntimeMs = (layerItem) => {
    const safeDuration = Number.isFinite(Number(layerItem?.animationDurationMs))
      ? Math.max(100, Math.min(5000, Number(layerItem.animationDurationMs)))
      : HERO_LAYER_ANIMATION_DEFAULTS.animationDurationMs;
    const safeDelay = Number.isFinite(Number(layerItem?.animationDelayMs))
      ? Math.max(0, Math.min(3000, Number(layerItem.animationDelayMs)))
      : HERO_LAYER_ANIMATION_DEFAULTS.animationDelayMs;
    return safeDuration + safeDelay + 120;
  };
  const startLayerAnimationPreview = (layerItem) => {
    const safeLayerId = typeof layerItem?.id === "string" ? layerItem.id.trim() : "";
    if (!safeLayerId) return;
    clearLayerAnimationPreviewTimer(safeLayerId);
    setLayerAnimationPreviewMap((prev) => ({ ...prev, [safeLayerId]: true }));
    emitLayerAnimationPreview(safeLayerId, true);
    layerAnimationPreviewTimersRef.current[safeLayerId] = window.setTimeout(() => {
      stopLayerAnimationPreview(safeLayerId);
    }, getLayerAnimationPreviewRuntimeMs(layerItem));
  };
  useEffect(() => {
    return () => {
      const timers = layerAnimationPreviewTimersRef.current;
      Object.keys(timers).forEach((layerId) => {
        window.clearTimeout(timers[layerId]);
      });
      layerAnimationPreviewTimersRef.current = {};
    };
  }, []);
  const setActiveLayerSelection = (layerId) => {
    const nextLayerId = typeof layerId === "string" && layerId.trim() ? layerId : null;
    if ((data?.activeLayerItemId || null) === nextLayerId) return;
    setUpdated(true);
    setData((prev) => ({
      ...prev,
      activeLayerItemId: nextLayerId,
    }));
  };
  const updateActiveSlideLayerItems = (updater) => {
    if (!activeSlideId) return;
    const nextSlides = slides.map((slide) => {
      if (slide.id !== activeSlideId) return slide;
      const currentLayerItems = normalizeLayerItemsWithZIndex(slide.layerItems);
      const nextLayerItemsRaw =
        typeof updater === "function" ? updater(currentLayerItems) : updater;
      return {
        ...slide,
        layerItems: normalizeLayerItemsWithZIndex(nextLayerItemsRaw),
      };
    });
    setSlidesState(nextSlides, activeSlideId);
  };
  const updateActiveLayerAnimation = (patch) => {
    if (!activeLayerItemId || !patch || typeof patch !== "object") return;
    updateActiveSlideLayerItems((currentLayerItems) =>
      currentLayerItems.map((layerItem) =>
        layerItem?.id === activeLayerItemId ? { ...layerItem, ...patch } : layerItem
      )
    );
  };
  const moveLayerZIndex = (layerId, direction) => {
    updateActiveSlideLayerItems((currentLayerItems) => {
      const ordered = normalizeLayerItemsWithZIndex(currentLayerItems);
      const currentIndex = ordered.findIndex((item) => item.id === layerId);
      if (currentIndex === -1) return ordered;
      const targetIndex = currentIndex + direction;
      if (targetIndex < 0 || targetIndex >= ordered.length) return ordered;
      const swapped = [...ordered];
      const temp = swapped[currentIndex];
      swapped[currentIndex] = swapped[targetIndex];
      swapped[targetIndex] = temp;
      return swapped.map((item, index) => ({
        ...item,
        zIndex: index + 1,
      }));
    });
  };
  const applyLayerDragGhostPreview = (event, itemType) => {
    if (itemType !== "image" || !event?.dataTransfer || typeof document === "undefined") return;
    const ghost = document.createElement("div");
    ghost.style.width = "120px";
    ghost.style.height = "74px";
    ghost.style.display = "flex";
    ghost.style.alignItems = "center";
    ghost.style.justifyContent = "center";
    ghost.style.border = "1px solid rgba(100,116,139,0.55)";
    ghost.style.borderRadius = "6px";
    ghost.style.background = "rgba(226,232,240,0.8)";
    ghost.style.color = "#334155";
    ghost.style.position = "fixed";
    ghost.style.top = "-9999px";
    ghost.style.left = "-9999px";
    ghost.style.pointerEvents = "none";
    ghost.style.zIndex = "2147483647";
    ghost.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#475569" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"></path></svg>';
    document.body.appendChild(ghost);
    event.dataTransfer.setDragImage(ghost, 60, 37);
    window.setTimeout(() => {
      if (ghost.parentNode) ghost.parentNode.removeChild(ghost);
    }, 0);
  };
  return (
    <aside className="dash-panel sm:block h-full min-h-0 overflow-hidden border-r border-slate-200 dark:border-white/10 w-[400px] flex flex-col">
      <div className="flex h-full min-h-0 flex-col">
      <div className="dash-panel-header shrink-0 flex items-center justify-between border-b border-slate-200 bg-gray-100 px-6 pt-3 pb-2 dark:border-white/10 dark:bg-slate-800/70">
        <div className="font-semibold tracking-wide">
          ตั้งค่า Hero
        </div>
        <button
          type="button"
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-white/70"
          onClick={() => close?.(null, null, null)}
          aria-label="ปิดแผงตั้งค่า Hero"
          title="ปิดแผงตั้งค่า Hero"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path
              fillRule="evenodd"
              d="M15.78 4.22a.75.75 0 010 1.06L10.06 11l5.72 5.72a.75.75 0 11-1.06 1.06l-6.25-6.25a.75.75 0 010-1.06l6.25-6.25a.75.75 0 011.06 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
      <div className="w-full mt-[12px] shrink-0 px-5">
        <ButtonGroup
          fullWidth
          variant="outlined"
          disableElevation
          color="inherit"
          aria-label="สลับแถบตั้งค่า Hero"
          sx={sectionLikeGroupRootSx}
        >
          {HERO_PANEL_TABS.map((tab) => (
            <Button
              key={tab.id}
              color="inherit"
              onClick={() => setActiveTab(tab.id)}
              sx={sectionLikeGroupButtonSx(
                activeTab === tab.id,
                textColor || "#000000"
              )}
            >
              {tab.label}
            </Button>
          ))}
        </ButtonGroup>
      </div>

      {activeTab === "slideshow" && (
        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 pb-10 text-[13px]">
          <div className="mb-2">
            <div className="mb-2 flex items-center gap-2">
              <span className="dash-panel-label text-[13px] font-bold">
                ความสูง
              </span>
              <span className="text-slate-400 dark:text-slate-400 text-[13px] tabular-nums">
                {Math.round(heroHeight)}
              </span>
              <div className="dash-heading-rule min-w-0 flex-1 border-b" />
            </div>
            <div className="px-[5px] pb-2">
              <Range
                min={400}
                max={800}
                value={heroHeight}
                step={1}
                handleChange={(e) => {
                  const next = Number(e.target.value);
                  setUpdated(true);
                  setData((prev) => ({
                    ...prev,
                    heroHeight: Math.min(800, Math.max(400, Number.isFinite(next) ? next : 400)),
                  }));
                }}
                pos={((heroHeight - 400) / (800 - 400)) * 100}
                color={textColor || "#333333"}
              />
            </div>
          </div>
          <div className="overflow-hidden rounded-md border border-slate-200 dark:border-white/10">
            {slides.map((slide, index) => {
              const isActive = slide.id === activeSlideId;
              return (
                <div
                  key={slide.id}
                  className={`flex items-center justify-between px-3 py-[10.5px] ${
                    index !== slides.length - 1 ? "border-b border-slate-200 dark:border-white/10" : ""
                  }`}
                  ref={(node) => {
                    if (node) {
                      slideListItemRefsRef.current.set(slide.id, node);
                    } else {
                      slideListItemRefsRef.current.delete(slide.id);
                    }
                  }}
                >
                  <button
                    type="button"
                    className="flex min-w-0 items-center gap-2 text-left"
                    onClick={() => setSlidesState(slides, slide.id)}
                  >
                    <Menu size={14} className="text-slate-400" />
                    <span className={`truncate text-[12.5px] ${isActive ? "font-semibold" : ""}`}>
                      {slide.name || `Slide ${index + 1}`}
                    </span>
                  </button>
                  <div className="ml-3 flex items-center gap-1">
                    <button
                      type="button"
                      className="flex items-center justify-center px-3 border-r border-slate-200 dark:border-white/10"
                      onClick={() => {
                        const duplicate = {
                          ...lodash.cloneDeep(slide),
                          id: buildSlideId(),
                          name: `Slide ${getNextSlideNumber()}`,
                        };
                        const nextSlides = [...slides];
                        nextSlides.splice(index + 1, 0, duplicate);
                        setSlidesState(nextSlides, duplicate.id);
                      }}
                      title="คัดลอก Slide"
                    >
                      <Copy size={14} style={{ opacity: 0.6 }} />
                    </button>
                    <button
                      type="button"
                      className="flex items-center justify-center px-3 border-r border-slate-200 dark:border-white/10"
                      onClick={() => {
                        if (slides.length <= 1) return;
                        const nextSlides = slides.filter((item) => item.id !== slide.id);
                        const fallback = nextSlides[Math.max(index - 1, 0)] || nextSlides[0];
                        setSlidesState(nextSlides, fallback?.id);
                      }}
                      title="ลบ Slide"
                    >
                      <Trash2
                        size={14}
                        style={{ opacity: slides.length <= 1 ? 0.35 : 0.6 }}
                        color={slides.length <= 1 ? "#9ca3af" : undefined}
                      />
                    </button>
                    <button
                      type="button"
                      className="flex h-[26px] w-[26px] items-center justify-center rounded border border-slate-200 text-slate-600 disabled:cursor-not-allowed disabled:opacity-35 dark:border-white/15 dark:text-white/70"
                      onClick={() => moveSlideAtIndex(index, -1)}
                      disabled={index === 0}
                      title="เลื่อนขึ้น"
                      aria-label="เลื่อน Slide ขึ้น"
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button
                      type="button"
                      className="flex h-[26px] w-[26px] items-center justify-center rounded border border-slate-200 text-slate-600 disabled:cursor-not-allowed disabled:opacity-35 dark:border-white/15 dark:text-white/70"
                      onClick={() => moveSlideAtIndex(index, 1)}
                      disabled={index === slides.length - 1}
                      title="เลื่อนลง"
                      aria-label="เลื่อน Slide ลง"
                    >
                      <ArrowDown size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Button
              type="button"
              variant="contained"
              sx={{
                boxShadow: "none",
                "&:hover": { boxShadow: "none" },
                backgroundColor: textColor || "#374151",
                fontSize: 12,
                height: 28,
                minWidth: "auto",
                px: 1.5,
              }}
              onClick={() => {
                const nextSlide = {
                  id: buildSlideId(),
                  name: `Slide ${getNextSlideNumber()}`,
                  displayMode: slideDisplayMode,
                  durationSec: slideDurationSec,
                  layerItems: [],
                };
                setSlidesState([...slides, nextSlide], nextSlide.id);
              }}
            >
              +
            </Button>
            <Button
              type="button"
              variant="contained"
              sx={{
                boxShadow: "none",
                "&:hover": { boxShadow: "none" },
                backgroundColor: textColor || "#374151",
                fontSize: 12,
                height: 28,
                minWidth: "auto",
                px: 1.5,
              }}
              onClick={() => {
                setUpdated(true);
                setData((prev) => ({ ...prev, isAutoPlay: !prev.isAutoPlay }));
              }}
            >
              {isAutoPlay ? "หยุด" : "เล่น"}
            </Button>
          </div>
          <div className="mt-5">
            <div className="mb-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="dash-panel-label text-[13px] font-bold">
                  การแสดงผล
                </span>
                <div className="dash-heading-rule min-w-0 flex-1 border-b" />
              </div>
              <ButtonGroup
                fullWidth
                variant="outlined"
                disableElevation
                color="inherit"
                sx={sectionLikeGroupRootSx}
              >
                {SLIDE_DISPLAY_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    color="inherit"
                    onClick={() => {
                      setUpdated(true);
                      setData((prev) => ({
                        ...prev,
                        slideDisplayMode: option.value,
                        slides: (Array.isArray(prev.slides) ? prev.slides : []).map((slide) => ({
                          ...slide,
                          displayMode: option.value,
                        })),
                      }));
                    }}
                    sx={sectionLikeGroupButtonSx(slideDisplayMode === option.value, textColor)}
                  >
                    {option.label}
                  </Button>
                ))}
              </ButtonGroup>
            </div>

            <div className="mb-1 flex items-center gap-1">
              <span className="shrink-0 text-[12px] font-semibold text-slate-600 dark:text-white/70">
                เวลาแสดงผล
              </span>
              <span className="text-[12px] tabular-nums text-slate-400 dark:text-slate-400">
                {slideDurationMs} ms
              </span>
              <div className="dash-heading-rule min-w-0 flex-1 border-b" />
            </div>
            <div className="mt-[8px]">
              <Range
                min={SLIDE_DURATION_MS_MIN}
                max={SLIDE_DURATION_MS_MAX}
                step={SLIDE_DURATION_MS_STEP}
                value={slideDurationMs}
                handleChange={(e) => {
                  const nextDurationMs = Math.max(
                    SLIDE_DURATION_MS_MIN,
                    Math.min(SLIDE_DURATION_MS_MAX, Number(e.target.value) || SLIDE_DURATION_MS_MAX)
                  );
                  const nextDurationSec = nextDurationMs / 1000;
                  setUpdated(true);
                  setData((prev) => ({
                    ...prev,
                    slideDurationSec: nextDurationSec,
                    slides: (Array.isArray(prev.slides) ? prev.slides : []).map((slide) => ({
                      ...slide,
                      durationSec: nextDurationSec,
                    })),
                  }));
                }}
                pos={
                  ((slideDurationMs - SLIDE_DURATION_MS_MIN) /
                    (SLIDE_DURATION_MS_MAX - SLIDE_DURATION_MS_MIN)) *
                  100
                }
                color={textColor || "#333333"}
              />
            </div>

            <div className="mb-[13px] mt-5 flex items-center gap-2">
              <span className="dash-panel-label text-[13px] font-bold">
                ตั้งค่า Bullet
              </span>
              <div className="dash-heading-rule min-w-0 flex-1 border-b" />
            </div>

            <div className="mb-3">
              <ButtonGroup
                fullWidth
                variant="outlined"
                disableElevation
                color="inherit"
                sx={sectionLikeGroupRootSx}
              >
                {BULLET_SHAPE_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    color="inherit"
                    onClick={() => updateBulletSetting("bulletShape", option.value)}
                    sx={sectionLikeGroupButtonSx(bulletShape === option.value, textColor)}
                  >
                    {option.label}
                  </Button>
                ))}
              </ButtonGroup>
            </div>

            <div className="mb-3">
              <div className="grid grid-cols-10 place-items-center gap-y-[6px] px-[5px]">
                {allColors.map((color, i) => {
                  const bgColor = resolveColor(color);
                  if (bgColor == null) return null;
                  const selected = lodash.isEqual(bulletColor, color);
                  return (
                    <button
                      key={`bullet-color-${String(color)}-${i}`}
                      type="button"
                      className="flex size-[25px] items-center justify-center rounded-full border border-slate-200 dark:border-white/15"
                      style={{ backgroundColor: bgColor }}
                      onClick={() => updateBulletSetting("bulletColor", color)}
                    >
                      {selected ? (
                        <Check className={swatchSelectedCheckClassName(bgColor)} strokeWidth={4} />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-[16px] grid grid-cols-12 gap-3">
              <div className="col-span-6">
                <div className="mb-1 flex items-center gap-1">
                  <span className="shrink-0 text-[12px] font-semibold text-slate-600 dark:text-white/70">
                    ขนาด
                  </span>
                  <span className="text-[12px] tabular-nums text-slate-400 dark:text-slate-400">
                    {Math.round(bulletSize)}
                  </span>
                  <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                </div>
                <div className="mt-[8px]">
                  <Range
                    min={6}
                    max={24}
                    step={1}
                    value={bulletSize}
                    handleChange={(e) => updateBulletSetting("bulletSize", Number(e.target.value))}
                    pos={((bulletSize - 6) / (24 - 6)) * 100}
                    color={textColor || "#333333"}
                  />
                </div>
              </div>
              <div className="col-span-6">
                <div className="mb-1 flex items-center gap-1">
                  <span className="shrink-0 text-[12px] font-semibold text-slate-600 dark:text-white/70">
                    ระยะห่างขอบ
                  </span>
                  <span className="text-[12px] tabular-nums text-slate-400 dark:text-slate-400">
                    {Math.round(bulletBottomOffset)}
                  </span>
                  <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                </div>
                <div className="mt-[8px]">
                  <Range
                    min={0}
                    max={80}
                    step={1}
                    value={bulletBottomOffset}
                    handleChange={(e) =>
                      updateBulletSetting("bulletBottomOffset", Number(e.target.value))
                    }
                    pos={(bulletBottomOffset / 80) * 100}
                    color={textColor || "#333333"}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <nav className="flex-1 min-h-0 px-5 pb-10 overflow-y-auto">
          <div className="mt-4 mb-2 flex items-center gap-2">
            <span className="dash-panel-label text-[13px] font-bold">
              สีพื้นหลัง
            </span>
            <div className="dash-heading-rule min-w-0 flex-1 border-b" />
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <AntSwitch
                checked={activeIsGradient}
                onChange={() => updateActiveSlideVisual("isGradient", !activeIsGradient)}
              />
              <span className="text-[13px] text-slate-400 dark:text-slate-400">
                สีไล่โทน
              </span>
            </Stack>
          </div>

          {!activeIsGradient ? (
            <Box sx={{ width: "100%", pt: 0.5 }}>
              <div className="px-[5px] pb-2">
                <Range
                  min={0}
                  max={255}
                  value={activeSolidOpacity}
                  step={1}
                  handleChange={(e) => handleOpacity(e.target.value)}
                  pos={(activeSolidOpacity / 255) * 100}
                  color={textColor || "#333333"}
                />
              </div>
              <div className="grid grid-cols-10 place-items-center gap-y-[6px] px-[5px]">
                {allColors.map((color, i) => {
                  const bgColor = resolveColor(color);
                  if (bgColor == null) return null;
                  const selected = lodash.isEqual(activeSolidColor, color);
                  return (
                    <button
                      key={`${String(color)}-${i}`}
                      type="button"
                      className="flex size-[25px] items-center justify-center rounded-full border border-slate-200 dark:border-white/15"
                      style={{ backgroundColor: bgColor }}
                      onClick={() => handleSolidColor(color)}
                    >
                      {selected ? (
                        <Check className={swatchSelectedCheckClassName(bgColor)} strokeWidth={4} />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </Box>
          ) : (
            <>
              <ButtonGroup
                fullWidth
                variant="outlined"
                disableElevation
                color="inherit"
                aria-label="เลือกจุดไล่โทนที่แก้สี"
                sx={{ ...sectionLikeGroupRootSx, mt: 1 }}
              >
                <Button
                  onClick={() => setGradientStop("start")}
                  color="inherit"
                  sx={sectionLikeGroupButtonSx(gradientStop === "start", textColor)}
                >
                  จุดเริ่ม
                </Button>
                <Button
                  onClick={() => setGradientStop("end")}
                  color="inherit"
                  sx={sectionLikeGroupButtonSx(gradientStop === "end", textColor)}
                >
                  จุดสิ้น
                </Button>
              </ButtonGroup>
              <Box sx={{ width: "100%", pt: 1 }}>
                <div className="px-[5px] pb-2">
                  <Range
                    min={0}
                    max={255}
                    value={activeGradientOpacity}
                    step={1}
                    handleChange={(e) => handleGradientOpacity(e.target.value)}
                    pos={(activeGradientOpacity / 255) * 100}
                    color={textColor || "#333333"}
                  />
                </div>
                <div className="grid grid-cols-10 place-items-center gap-y-[6px] px-[5px]">
                  {allColors.map((color, i) => {
                    const bgColor = resolveColor(color);
                    if (bgColor == null) return null;
                    const selected = lodash.isEqual(activeGradientColor, color);
                    return (
                      <button
                        key={`${String(color)}-gradient-${i}`}
                        type="button"
                        className="flex size-[25px] items-center justify-center rounded-full border border-slate-200 dark:border-white/15"
                        style={{ backgroundColor: bgColor }}
                        onClick={() => handleGradientColor(color)}
                      >
                        {selected ? (
                          <Check className={swatchSelectedCheckClassName(bgColor)} strokeWidth={4} />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </Box>
              <Box sx={{ width: "100%", px: 0.25, mt: 2 }}>
                <Typography
                  component="div"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    flex: 1,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--dash-panel-heading, #0f172a)",
                    mb: 0.35,
                    fontVariantNumeric: "tabular-nums",
                    ".dark &": { color: "var(--dash-panel-heading, #f8fafc)" },
                  }}
                >
                  องศาไล่โทน{" "}
                  <span className="text-slate-400 dark:text-slate-400">
                    {Math.round(gradientDegree)}
                  </span>
                  <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                </Typography>
                <div className="w-full pt-0 pb-[2px] px-[2px]">
                  <Range
                    min={0}
                    max={360}
                    step={1}
                    value={gradientDegree}
                    handleChange={(e) => {
                      const next = Number(e.target.value);
                      updateActiveSlideVisual(
                        "degrees",
                        Math.min(360, Math.max(0, Number.isFinite(next) ? next : 0))
                      );
                    }}
                    pos={(gradientDegree / 360) * 100}
                    color={textColor || "#333333"}
                  />
                </div>
              </Box>
            </>
          )}

          <div className="mt-[17px] mb-[13px] flex items-center gap-2">
            <span className="dash-panel-label text-[13px] font-bold">
              ภาพพื้นหลัง
            </span>
            <div className="dash-heading-rule min-w-0 flex-1 border-b" />
          </div>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
            <Button
              type="button"
              variant="contained"
              startIcon={<ImageOutlinedIcon />}
              onClick={() => setBackgroundPickerOpen(true)}
              sx={{
                "& .MuiButton-startIcon > *:nth-of-type(1)": { fontSize: 18 },
                boxShadow: "none",
                "&:hover": { boxShadow: "none" },
                backgroundColor: textColor || "#374151",
                fontSize: 12,
                height: 28,
              }}
            >
              รูปภาพ - วีดีโอ
            </Button>
            <Button
              variant="contained"
              sx={{
                ml: "auto",
                minWidth: 48,
                boxShadow: "none",
                "&:hover": { boxShadow: "none" },
                backgroundColor: textColor || "#374151",
                fontSize: 12,
                height: 28,
              }}
              onClick={() => {
                updateActiveSlideVisuals({
                  backgroundImage: "",
                  backgroundVideo: "",
                });
              }}
              disabled={!hasActiveBackgroundMedia}
            >
              ลบ
            </Button>
          </Box>

          {hasActiveBackgroundMedia ? (
            <>
              {activeBackgroundVideo ? (
                <video
                  src={activeBackgroundVideo}
                  className="mt-3 block h-[200px] w-full rounded-md object-cover"
                  muted
                  playsInline
                  preload="auto"
                  onLoadedData={(event) => {
                    const videoElement = event.currentTarget;
                    videoElement.currentTime = 0.01;
                    videoElement.pause();
                  }}
                />
              ) : (
                <img
                  src={activeBackgroundImage}
                  className="mt-3 block h-[200px] w-full rounded-md object-cover"
                />
              )}

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <div className="mb-1 flex items-center gap-1">
                    <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                      ความสว่างรูปภาพ
                    </span>
                    <span className="text-[12px] tabular-nums text-slate-400 dark:text-slate-400">
                      {activeImageBrightness}
                    </span>
                    <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                  </div>
                  <Range
                    min={0}
                    max={200}
                    step={1}
                    value={activeImageBrightness}
                    handleChange={(e) => {
                      const next = Number(e.target.value);
                      updateActiveSlideVisual(
                        "imageBrightness",
                        Math.min(200, Math.max(0, Number.isFinite(next) ? next : 100))
                      );
                    }}
                    pos={(activeImageBrightness / 200) * 100}
                    color={textColor || "#333333"}
                  />
                </div>
                <div className="col-span-1">
                  <div className="mb-1 flex items-center gap-1">
                    <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                      เบลอภาพ
                    </span>
                    <span className="text-[12px] tabular-nums text-slate-400 dark:text-slate-400">
                      {Math.round(blurAmount)}
                    </span>
                    <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                  </div>
                  <Range
                    min={0}
                    max={100}
                    step={1}
                    value={blurAmount}
                    handleChange={(e) => {
                      const next = Number(e.target.value);
                      updateActiveSlideVisual(
                        "blur",
                        Math.min(100, Math.max(0, Number.isFinite(next) ? next : 0))
                      );
                    }}
                    pos={blurAmount}
                    color={textColor || "#333333"}
                  />
                </div>
              </div>
              {showBackgroundPositionControls ? (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="col-span-1">
                    <div className="mb-1 flex items-center gap-1">
                      <span className="shrink-0 text-[12px] font-semibold text-slate-600 dark:text-white/70">
                        ตำแหน่ง X
                      </span>
                      <span className="text-[12px] tabular-nums text-slate-400 dark:text-slate-400">
                        {Math.round(activeBackgroundPositionX)}%
                      </span>
                      <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                    </div>
                    <Range
                      min={HERO_BG_FOCUS_MIN}
                      max={HERO_BG_FOCUS_MAX}
                      step={1}
                      value={activeBackgroundPositionX}
                      handleChange={(e) => {
                        const next = Number(e.target.value);
                        updateActiveSlideVisual(
                          "backgroundPositionX",
                          Math.max(
                            HERO_BG_FOCUS_MIN,
                            Math.min(HERO_BG_FOCUS_MAX, Number.isFinite(next) ? next : 0)
                          )
                        );
                      }}
                      pos={activeBackgroundPositionX}
                      color={textColor || "#333333"}
                    />
                  </div>
                  <div className="col-span-1">
                    <div className="mb-1 flex items-center gap-1">
                      <span className="shrink-0 text-[12px] font-semibold text-slate-600 dark:text-white/70">
                        ตำแหน่ง Y
                      </span>
                      <span className="text-[12px] tabular-nums text-slate-400 dark:text-slate-400">
                        {Math.round(activeBackgroundPositionY)}%
                      </span>
                      <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                    </div>
                    <Range
                      min={HERO_BG_FOCUS_MIN}
                      max={HERO_BG_FOCUS_MAX}
                      step={1}
                      value={activeBackgroundPositionY}
                      handleChange={(e) => {
                        const next = Number(e.target.value);
                        updateActiveSlideVisual(
                          "backgroundPositionY",
                          Math.max(
                            HERO_BG_FOCUS_MIN,
                            Math.min(HERO_BG_FOCUS_MAX, Number.isFinite(next) ? next : 0)
                          )
                        );
                      }}
                      pos={activeBackgroundPositionY}
                      color={textColor || "#333333"}
                    />
                  </div>
                </div>
              ) : null}
              {showBackgroundPositionControls ? (
                <div className="mt-4">
                  <div className="mb-1 flex items-center gap-1">
                    <span className="shrink-0 text-[12px] font-semibold text-slate-600 dark:text-white/70">
                      ซูมพื้นหลัง
                    </span>
                    <span className="text-[12px] tabular-nums text-slate-400 dark:text-slate-400">
                      {Math.round(activeBackgroundZoom)}%
                    </span>
                    <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-white/60">
                      เฉพาะส่วน
                    </span>
                    <AntSwitch
                      checked={activeBackgroundFrameOnly}
                      onChange={() => {
                        updateActiveSlideVisual("backgroundFrameOnly", !activeBackgroundFrameOnly);
                      }}
                    />
                  </div>
                  <Range
                    min={HERO_BG_ZOOM_MIN}
                    max={HERO_BG_ZOOM_MAX}
                    step={1}
                    value={activeBackgroundZoom}
                    handleChange={(e) => {
                      const next = Number(e.target.value);
                      updateActiveSlideVisual(
                        "backgroundZoom",
                        Math.max(
                          HERO_BG_ZOOM_MIN,
                          Math.min(HERO_BG_ZOOM_MAX, Number.isFinite(next) ? next : 100)
                        )
                      );
                    }}
                    pos={
                      ((activeBackgroundZoom - HERO_BG_ZOOM_MIN) /
                        (HERO_BG_ZOOM_MAX - HERO_BG_ZOOM_MIN)) *
                      100
                    }
                    color={textColor || "#333333"}
                  />
                </div>
              ) : null}

            </>
          ) : (
            <button
              type="button"
              className="mb-[5px] mt-3 flex min-h-[150px] w-full items-center justify-center rounded-md border-0 bg-gray-200 px-3 py-6 text-sm dark:bg-zinc-800"
              onClick={() => setBackgroundPickerOpen(true)}
            >
              <span className="text-[13px] font-medium text-gray-500 dark:text-gray-400">
                ไม่มีรูปภาพ/วิดีโอ
              </span>
            </button>
          )}

          <div className="mt-6 mb-2 flex items-center gap-2">
            <span className="dash-panel-label text-[13px] font-bold">
              เพิ่มเติม (Divider SVG)
            </span>
            <div className="dash-heading-rule min-w-0 flex-1 border-b" />
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <AntSwitch
                checked={svgDividerEnabled}
                onChange={() => {
                  setUpdated(true);
                  setData((prev) => ({
                    ...prev,
                    svgDividerEnabled: !(prev?.svgDividerEnabled === true),
                  }));
                }}
              />
            </Stack>
          </div>
          {svgDividerEnabled ? (
            <div className="space-y-4">
              <div className="mt-4">
                <AnimationSelectInput
                  value={svgDividerType}
                  onChange={(nextValue) => updateSectionSetting("svgDividerType", nextValue)}
                  options={HERO_SVG_DIVIDER_TYPE_OPTIONS}
                />
              </div>
              {svgDividerType !== "triangle" && svgDividerType !== "arrowSplit" ? (
                <div className="grid grid-cols-2 gap-x-2">
                  <div className="col-span-1">
                    <div className="mb-1 flex items-center gap-1">
                      <span className="shrink-0 dash-panel-label text-[13px] font-bold">
                        ความสูง
                      </span>
                      <span className="text-[12px] tabular-nums text-slate-400 dark:text-slate-400">
                        {Math.round(svgDividerHeight)}
                      </span>
                      <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                    </div>
                    <Range
                      min={HERO_SVG_DIVIDER_HEIGHT_MIN}
                      max={HERO_SVG_DIVIDER_HEIGHT_MAX}
                      step={1}
                      value={svgDividerHeight}
                      handleChange={(event) =>
                        updateSectionSetting("svgDividerHeight", Number(event.target.value))
                      }
                      pos={
                        ((svgDividerHeight - HERO_SVG_DIVIDER_HEIGHT_MIN) /
                          (HERO_SVG_DIVIDER_HEIGHT_MAX - HERO_SVG_DIVIDER_HEIGHT_MIN)) *
                        100
                      }
                      color={textColor || "#333333"}
                    />
                  </div>
                  <div className="col-span-1">
                    <div className="mb-1 flex items-center gap-1">
                      <span className="shrink-0 dash-panel-label text-[13px] font-bold">
                        ความถี่
                      </span>
                      <span className="text-[12px] tabular-nums text-slate-400 dark:text-slate-400">
                        {svgDividerDensity.toFixed(1)}
                      </span>
                      <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                    </div>
                    <Range
                      min={HERO_SVG_DIVIDER_DENSITY_MIN}
                      max={HERO_SVG_DIVIDER_DENSITY_MAX}
                      step={0.1}
                      value={svgDividerDensity}
                      handleChange={(event) =>
                        updateSectionSetting("svgDividerDensity", Number(event.target.value))
                      }
                      pos={
                        ((svgDividerDensity - HERO_SVG_DIVIDER_DENSITY_MIN) /
                          (HERO_SVG_DIVIDER_DENSITY_MAX - HERO_SVG_DIVIDER_DENSITY_MIN)) *
                        100
                      }
                      color={textColor || "#333333"}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <div className="mb-1 flex items-center gap-1">
                      <span className="shrink-0 dash-panel-label text-[13px] font-bold">
                        ความสูง
                      </span>
                      <span className="text-[12px] tabular-nums text-slate-400 dark:text-slate-400">
                        {Math.round(svgDividerHeight)}
                      </span>
                      <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                    </div>
                    <Range
                      min={HERO_SVG_DIVIDER_HEIGHT_MIN}
                      max={HERO_SVG_DIVIDER_HEIGHT_MAX}
                      step={1}
                      value={svgDividerHeight}
                      handleChange={(event) =>
                        updateSectionSetting("svgDividerHeight", Number(event.target.value))
                      }
                      pos={
                        ((svgDividerHeight - HERO_SVG_DIVIDER_HEIGHT_MIN) /
                          (HERO_SVG_DIVIDER_HEIGHT_MAX - HERO_SVG_DIVIDER_HEIGHT_MIN)) *
                        100
                      }
                      color={textColor || "#333333"}
                    />
                  </div>
                  <div>
                    <div className="mb-1 flex items-center gap-1">
                      <span className="shrink-0 text-[12px] font-semibold text-slate-600 dark:text-white/70">
                        ขนาด
                      </span>
                      <span className="text-[12px] tabular-nums text-slate-400 dark:text-slate-400">
                        {svgDividerSize.toFixed(1)}
                      </span>
                      <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                    </div>
                    <Range
                      min={HERO_SVG_DIVIDER_SIZE_MIN}
                      max={HERO_SVG_DIVIDER_SIZE_MAX}
                      step={0.1}
                      value={svgDividerSize}
                      handleChange={(event) =>
                        updateSectionSetting("svgDividerSize", Number(event.target.value))
                      }
                      pos={
                        ((svgDividerSize - HERO_SVG_DIVIDER_SIZE_MIN) /
                          (HERO_SVG_DIVIDER_SIZE_MAX - HERO_SVG_DIVIDER_SIZE_MIN)) *
                        100
                      }
                      color={textColor || "#333333"}
                    />
                  </div>
                </>
              )}
              <div>
                <div className="grid grid-cols-10 place-items-center gap-y-[6px] px-[5px]">
                  {allColors.map((color, i) => {
                    const bgColor = resolveColor(color);
                    if (bgColor == null) return null;
                    const selected = lodash.isEqual(svgDividerColor, color);
                    return (
                      <button
                        key={`divider-color-${String(color)}-${i}`}
                        type="button"
                        className="flex size-[25px] items-center justify-center rounded-full border border-slate-200 dark:border-white/15"
                        style={{ backgroundColor: bgColor }}
                        onClick={() => updateSectionSetting("svgDividerColor", color)}
                      >
                        {selected ? (
                          <Check className={swatchSelectedCheckClassName(bgColor)} strokeWidth={4} />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}
        </nav>
      )}

      {activeTab === "layer" && (
        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-6 pb-10">
          <div className="mb-4 flex items-center gap-3">
            <span className="text-[15px] font-semibold text-slate-700 dark:text-white/85">
              Elements พื้นฐาน
            </span>
            <div className="h-px min-w-0 flex-1 bg-slate-200 dark:bg-white/15" />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {HERO_LAYER_LIBRARY_ITEMS.map((item, index) => {
              const ItemIcon = item.icon;
              return (
                <button
                  key={`${item.type}-${index}`}
                  type="button"
                  draggable
                  onDragStart={(event) => {
                    const payload = JSON.stringify({
                      source: "hero-layer-library",
                      type: item.type,
                      label: item.label,
                    });
                    event.dataTransfer.effectAllowed = "copy";
                    event.dataTransfer.setData("application/x-hero-layer-item", payload);
                    event.dataTransfer.setData("text/plain", payload);
                    applyLayerDragGhostPreview(event, item.type);
                  }}
                  className="group flex min-h-[68px] flex-col items-center justify-center rounded-xl bg-slate-100/80 px-2 py-1.5 transition-colors hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10"
                >
                  <div
                    className="mb-0.5 flex h-9 w-9 items-center justify-center"
                    style={{ color: "var(--dash-panel-heading, #0f172a)" }}
                  >
                    {item.iconType === "material" ? (
                      <span
                        className="material-symbols-outlined text-[28px] leading-none"
                        style={{ color: "inherit" }}
                      >
                        {String(item.icon || "")}
                      </span>
                    ) : (
                      <ItemIcon className="h-6 w-6" style={{ color: "inherit" }} />
                    )}
                  </div>
                  <span className="text-[11px] font-medium text-slate-700 dark:text-white/85">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-5 mb-4 flex items-center gap-2">
            <span className="dash-panel-label text-[13px] font-semibold">
              รายการทั้งหมด{" "}
              <span className="text-[12px] tabular-nums text-slate-400 dark:text-slate-400">
                {activeLayerItemsForPanel.length}
              </span>
            </span>
            <div className="dash-heading-rule min-w-0 flex-1 border-b" />
          </div>
          <div className="space-y-2">
            {activeLayerItemsForPanel.length === 0 ? (
              <div className="rounded-md border border-dashed border-slate-200 px-3 py-2 text-[12px] text-slate-400 dark:border-white/10 dark:text-white/50">
                ยังไม่มี Layer ใน Slide นี้
              </div>
            ) : (
              activeLayerItemsForPanel.map((layer, index) => {
                const isTopMost = Number(layer?.zIndex) >= activeLayerItemsForPanel.length;
                const isBottomMost = Number(layer?.zIndex) <= 1;
                const isActiveLayer = layer?.id === activeLayerItemId;
                return (
                  <div
                    key={layer?.id || `layer-item-${index}`}
                    ref={(node) => {
                      const layerId = typeof layer?.id === "string" ? layer.id : "";
                      if (!layerId) return;
                      if (node) {
                        layerListItemRefsRef.current.set(layerId, node);
                      } else {
                        layerListItemRefsRef.current.delete(layerId);
                      }
                    }}
                    className={`flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 px-2 py-2 dark:border-white/10 ${
                      isActiveLayer ? "ring-1 ring-slate-300 dark:ring-white/20" : ""
                    }`}
                    onClick={() => setActiveLayerSelection(layer?.id)}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <span
                        className="inline-flex h-[26px] min-w-[38px] items-center justify-center rounded border border-slate-200 px-1 text-[10px] font-semibold dark:border-white/15"
                        style={{
                          backgroundColor: isActiveLayer ? "#333333" : "#f1f5f9",
                          color: isActiveLayer ? "#ffffff" : "#64748b",
                        }}
                      >
                        Z{Number(layer?.zIndex) || index + 1}
                      </span>
                      <span className="truncate text-[12px] font-medium text-slate-700 dark:text-white/80">
                        {getLayerItemTitle(layer)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        let nextAnimationEnabled = false;
                        updateActiveSlideLayerItems((currentLayerItems) =>
                          currentLayerItems.map((layerItem) =>
                            layerItem?.id === layer?.id
                              ? (() => {
                                  nextAnimationEnabled = layerItem?.animationEnabled !== true;
                                  return {
                                    ...layerItem,
                                    animationEnabled: nextAnimationEnabled,
                                  };
                                })()
                              : layerItem
                          )
                        );
                        if (nextAnimationEnabled === false) {
                          stopLayerAnimationPreview(layer?.id);
                        }
                      }}
                      className={`inline-flex h-[26px] min-w-[48px] items-center justify-center rounded border px-2 text-[10px] font-semibold ${
                        layer?.animationEnabled === true
                          ? "border-emerald-500 bg-emerald-600 text-white"
                          : "border-slate-200 bg-white text-slate-600 dark:border-white/15 dark:bg-white/5 dark:text-white/70"
                      }`}
                      aria-label="เปิดปิดแอนิเมชั่นของ Layer"
                      title="เปิดปิดแอนิเมชั่นของ Layer"
                    >
                      แอนิเมชั่น
                    </button>
                    <button
                      type="button"
                      disabled={isTopMost}
                      onClick={() => moveLayerZIndex(layer?.id, 1)}
                      className="inline-flex h-[26px] w-[26px] items-center justify-center rounded border border-slate-200 text-slate-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/15 dark:text-white/70"
                      aria-label="Bring layer forward"
                      title="ขึ้นหน้า"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={isBottomMost}
                      onClick={() => moveLayerZIndex(layer?.id, -1)}
                      className="inline-flex h-[26px] w-[26px] items-center justify-center rounded border border-slate-200 text-slate-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/15 dark:text-white/70"
                      aria-label="Send layer backward"
                      title="ลงหลัง"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        const deletingLayerId =
                          typeof layer?.id === "string" && layer.id.trim() ? layer.id : null;
                        if (!deletingLayerId) return;
                        updateActiveSlideLayerItems((currentLayerItems) =>
                          currentLayerItems.filter((layerItem) => layerItem?.id !== deletingLayerId)
                        );
                        if (activeLayerItemId === deletingLayerId) {
                          setActiveLayerSelection(null);
                        }
                        stopLayerAnimationPreview(deletingLayerId);
                      }}
                      className="inline-flex h-[26px] w-[26px] items-center justify-center rounded border border-slate-200 text-slate-600 dark:border-white/15 dark:text-white/70"
                      aria-label="Delete layer"
                      title="ลบ Layer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
          {activeSelectedLayerItem?.animationEnabled === true ? (
            <div className="mt-5">
              <div className="mb-2 flex items-center gap-2">
                <span className="dash-panel-label text-[13px] font-semibold">
                  แอนิเมชั่น
                </span>
                <div className="dash-heading-rule min-w-0 flex-1 border-b" />
              </div>
              <div className="space-y-3 py-1">
                <div className="flex items-stretch gap-2">
                  <div className="min-w-0 flex-1">
                    <AnimationSelectInput
                      value={
                        activeSelectedLayerItem?.animationType ||
                        HERO_LAYER_ANIMATION_DEFAULTS.animationType
                      }
                      onChange={(nextValue) =>
                        updateActiveLayerAnimation({ animationType: nextValue })
                      }
                      options={HERO_LAYER_ANIMATION_TYPES}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="contained"
                    onClick={() => {
                      if (isActiveLayerPreviewPlaying) {
                        stopLayerAnimationPreview(activeSelectedLayerItem?.id);
                        return;
                      }
                      startLayerAnimationPreview(activeSelectedLayerItem);
                    }}
                    sx={{
                      minWidth: 35,
                      width: 35,
                      height: 35,
                      px: 0,
                      borderRadius: "6px",
                      textTransform: "none",
                      fontSize: "11px",
                      fontWeight: 700,
                      boxShadow: "none",
                      border: "1px solid var(--dash-panel-btn-group-active, #333333)",
                      color: "var(--dash-panel-btn-group-active-text, #ffffff)",
                      backgroundColor: "var(--dash-panel-btn-group-active, #333333)",
                      "&:hover": {
                        backgroundColor: "var(--dash-panel-btn-group-active, #333333)",
                        boxShadow: "none",
                      },
                    }}
                    aria-label={isActiveLayerPreviewPlaying ? "หยุดพรีวิวแอนิเมชัน" : "เล่นพรีวิวแอนิเมชัน"}
                    title={isActiveLayerPreviewPlaying ? "หยุดพรีวิวแอนิเมชัน" : "เล่นพรีวิวแอนิเมชัน"}
                  >
                    {isActiveLayerPreviewPlaying ? (
                      <Pause className="h-3.5 w-3.5" strokeWidth={2.6} />
                    ) : (
                      <Play className="h-3.5 w-3.5" strokeWidth={2.6} />
                    )}
                  </Button>
                </div>

                <div>
                  <div className="mb-1 flex items-center gap-1">
                    <span className="text-[12px] font-medium text-slate-700 dark:text-white/80">
                      ระยะเวลา
                    </span>
                    <span className="text-[12px] tabular-nums text-slate-400">
                      {Math.round(
                        Number(
                          activeSelectedLayerItem?.animationDurationMs ??
                            HERO_LAYER_ANIMATION_DEFAULTS.animationDurationMs
                        )
                      )}{" "}
                      ms
                    </span>
                    <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                  </div>
                  <Range
                    min={100}
                    max={5000}
                    step={100}
                    value={Number(
                      activeSelectedLayerItem?.animationDurationMs ??
                        HERO_LAYER_ANIMATION_DEFAULTS.animationDurationMs
                    )}
                    handleChange={(event) =>
                      updateActiveLayerAnimation({
                        animationDurationMs: Math.max(
                          100,
                          Math.min(5000, Number(event.target.value) || 100)
                        ),
                      })
                    }
                    pos={
                      ((Number(
                        activeSelectedLayerItem?.animationDurationMs ??
                          HERO_LAYER_ANIMATION_DEFAULTS.animationDurationMs
                      ) -
                        100) /
                        (5000 - 100)) *
                      100
                    }
                    color={textColor || "#333333"}
                  />
                </div>

                <div>
                  <div className="mb-1 flex items-center gap-1">
                    <span className="text-[12px] font-medium text-slate-700 dark:text-white/80">
                      หน่วงเวลา
                    </span>
                    <span className="text-[12px] tabular-nums text-slate-400">
                      {Math.round(
                        Number(
                          activeSelectedLayerItem?.animationDelayMs ??
                            HERO_LAYER_ANIMATION_DEFAULTS.animationDelayMs
                        )
                      )}{" "}
                      ms
                    </span>
                    <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                  </div>
                  <Range
                    min={0}
                    max={3000}
                    step={100}
                    value={Number(
                      activeSelectedLayerItem?.animationDelayMs ??
                        HERO_LAYER_ANIMATION_DEFAULTS.animationDelayMs
                    )}
                    handleChange={(event) =>
                      updateActiveLayerAnimation({
                        animationDelayMs: Math.max(
                          0,
                          Math.min(3000, Number(event.target.value) || 0)
                        ),
                      })
                    }
                    pos={
                      (Number(
                        activeSelectedLayerItem?.animationDelayMs ??
                          HERO_LAYER_ANIMATION_DEFAULTS.animationDelayMs
                      ) /
                        3000) *
                      100
                    }
                    color={textColor || "#333333"}
                  />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
      </div>

      <ImageModal
        openModal={backgroundPickerOpen}
        setOpenModal={setBackgroundPickerOpen}
        allowVideo
        handleChange={(payload) => {
          if (payload && typeof payload === "object") {
            const selectedType = payload.mediaType === "video" ? "video" : "image";
            const selectedUrl = payload.url || "";
            updateActiveSlideVisuals({
              backgroundImage: selectedType === "image" ? selectedUrl : "",
              backgroundVideo: selectedType === "video" ? selectedUrl : "",
            });
            return;
          }
          const selectedUrl = typeof payload === "string" ? payload : "";
          updateActiveSlideVisuals({
            backgroundImage: selectedUrl,
            backgroundVideo: "",
          });
        }}
      />
    </aside>
  );
}

export default HeroOffcanvas;
