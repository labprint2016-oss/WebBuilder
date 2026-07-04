import { useEffect, useMemo, useState } from "react";
import { Box, Button, ButtonGroup, Stack, Tab, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import Switch from "@mui/material/Switch";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  Copy,
  Hand,
  Menu,
  Sparkles,
  Trash2,
} from "lucide-react";
import lodash from "lodash";
import { TabContext, TabList } from "@mui/lab";
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
  { id: "slideshow", label: "SlideShow" },
  { id: "settings", label: "ตั้งค่า" },
  { id: "layer", label: "Layer" },
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
  { value: "slide-in-left", label: "เลื่อนจากซ้าย" },
  { value: "slide-in-right", label: "เลื่อนจากขวา" },
  { value: "slide-in-up", label: "เลื่อนจากล่าง" },
  { value: "zoom-in", label: "ซูมเข้า" },
  { value: "zoom-out", label: "ซูมออก" },
];
const HERO_LAYER_ANIMATION_EASINGS = [
  { value: "ease", label: "Ease" },
  { value: "ease-out", label: "Ease Out" },
  { value: "ease-in-out", label: "Ease InOut" },
  { value: "linear", label: "Linear" },
];
const HERO_LAYER_ANIMATION_DEFAULTS = {
  animationEnabled: false,
  animationType: "fade-in",
  animationDurationMs: 800,
  animationDelayMs: 0,
  animationEasing: "ease-out",
  animationOnce: true,
};
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
      animationEasing: HERO_LAYER_ANIMATION_EASINGS.some((entry) => entry.value === item?.animationEasing)
        ? item.animationEasing
        : HERO_LAYER_ANIMATION_DEFAULTS.animationEasing,
      animationOnce: item?.animationOnce !== false,
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

const OPTION_CHIP_RADIUS = "0.375rem";
const CHIP_BORDER = "#e2e8f0";
const CHIP_BORDER_DARK = "rgba(255, 255, 255, 0.1)";
const CHIP_BG = "#ffffff";
const CHIP_BG_HOVER = "#f8fafc";
const CHIP_BG_DARK = "rgba(30, 41, 59, 0.9)";
const CHIP_BG_DARK_HOVER = "rgba(30, 41, 59, 1)";

const sectionLikeGroupButtonSx = (selected, accent) => {
  const a = accent || "#0d9488";
  return {
    flex: 1,
    fontSize: 11,
    minHeight: 34,
    py: 0.75,
    px: 0.5,
    textTransform: "none",
    lineHeight: 1.25,
    boxShadow: "none",
    ...(selected
      ? {
          backgroundColor: a,
          color: "#fff",
          borderColor: "transparent",
          "&:hover": {
            backgroundColor: a,
            borderColor: "transparent",
          },
        }
      : {
          color: "#1e293b",
          borderColor: `${CHIP_BORDER} !important`,
          backgroundColor: CHIP_BG,
          "&:hover": {
            borderColor: `${CHIP_BORDER} !important`,
            backgroundColor: CHIP_BG_HOVER,
          },
          ".dark &": {
            color: "#f1f5f9",
            borderColor: `${CHIP_BORDER_DARK} !important`,
            backgroundColor: CHIP_BG_DARK,
            "&:hover": {
              borderColor: `${CHIP_BORDER_DARK} !important`,
              backgroundColor: CHIP_BG_DARK_HOVER,
            },
          },
        }),
    "&.Mui-focusVisible": {
      outline: `2px solid ${a}`,
      outlineOffset: 1,
      boxShadow: "none",
    },
    "& .MuiTouchRipple-child": {
      backgroundColor: a,
    },
  };
};

const sectionLikeGroupRootSx = {
  width: "100%",
  boxShadow: "none",
  "& .MuiButton-root": {
    boxShadow: "none",
  },
  "& .MuiButtonGroup-grouped": {
    borderRadius: "0 !important",
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
    borderColor: `${CHIP_BORDER} !important`,
  },
  "& .MuiButtonGroup-grouped.MuiButton-outlined:not(:last-of-type)": {
    borderRightColor: `${CHIP_BORDER} !important`,
  },
  ".dark & .MuiButtonGroup-grouped.MuiButton-outlined": {
    borderColor: `${CHIP_BORDER_DARK} !important`,
  },
  ".dark & .MuiButtonGroup-grouped.MuiButton-outlined:not(:last-of-type)": {
    borderRightColor: `${CHIP_BORDER_DARK} !important`,
  },
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
  opacityImage: 1,
  blur: 0,
  parallaxEnabled: false,
});
const createDefaultSlides = () => [
  { id: "hero-slide-1", name: "Slide 1", displayMode: "fade", durationSec: 5, layerItems: [] },
];

function HeroOffcanvas({ element, updateHero: onUpdate, textColor }) {
  const [activeTab, setActiveTab] = useState("settings");
  const [data, setData] = useState(() => ({ ...buildDefaultHeroSection(), ...(element || {}) }));
  const [updated, setUpdated] = useState(false);
  const [backgroundPickerOpen, setBackgroundPickerOpen] = useState(false);
  const [gradientStop, setGradientStop] = useState("start");
  const [theme, setTheme] = useState(null);
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
    setData((prev) => (lodash.isEqual(prev, merged) ? prev : merged));
  }, [element]);

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
  const activeOpacityImage = Number(activeSlide?.opacityImage ?? data.opacityImage ?? 1);
  const opacityPercent = Math.max(
    0,
    Math.min(100, Math.round((activeOpacityImage || 0) * 100))
  );
  const blurAmount = Math.max(0, Math.min(100, Number(activeSlide?.blur ?? data.blur ?? 0)));
  const activeParallaxEnabled = Boolean(activeSlide?.parallaxEnabled ?? data.parallaxEnabled);
  const normalizedSlideDisplayMode =
    data.slideDisplayMode === "none" ? "slide-right" : data.slideDisplayMode;
  const slideDisplayMode = SLIDE_DISPLAY_OPTIONS.some((item) => item.value === normalizedSlideDisplayMode)
    ? normalizedSlideDisplayMode
    : "fade";
  const isAutoPlay = data.isAutoPlay === true;
  const slideDurationSec = Math.max(1, Math.min(20, Number(data.slideDurationSec ?? 5) || 5));
  const bulletShape = BULLET_SHAPE_OPTIONS.some((item) => item.value === data.bulletShape)
    ? data.bulletShape
    : "circle";
  const bulletSize = Math.max(6, Math.min(24, Number(data.bulletSize ?? 10)));
  const bulletBottomOffset = Math.max(0, Math.min(80, Number(data.bulletBottomOffset ?? 12)));
  const bulletColor = data.bulletColor ?? "#454b57";

  const updateActiveSlideVisual = (field, value) => {
    if (!activeSlideId) return;
    const nextSlides = slides.map((slide) =>
      slide.id === activeSlideId ? { ...slide, [field]: value } : slide
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
  const activeLayerItems = useMemo(
    () => normalizeLayerItemsWithZIndex(activeSlide?.layerItems),
    [activeSlide?.layerItems]
  );
  const activeLayerItemsForPanel = useMemo(
    () => [...activeLayerItems].sort((a, b) => Number(b.zIndex) - Number(a.zIndex)),
    [activeLayerItems]
  );
  const activeLayerItemId =
    typeof data?.activeLayerItemId === "string" ? data.activeLayerItemId : null;
  const activeSelectedLayerItem = useMemo(() => {
    if (!activeLayerItemId) return null;
    return activeLayerItems.find((item) => item?.id === activeLayerItemId) || null;
  }, [activeLayerItemId, activeLayerItems]);
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
    <aside className="sm:block overflow-hidden border-r border-slate-200 dark:border-white/10 w-[400px] bg-white dark:bg-gray-900/80">
      <TabContext value={activeTab}>
      <div className="px-6 mt-5 flex items-center justify-between">
        <div className="font-semibold tracking-wide">
          ตั้งค่า <span className="text-gray-400">Hero</span>
        </div>
      </div>
      <div className="w-full mt-[12px]">
        <TabList
          variant="fullWidth"
          onChange={(e, newValue) => {
            setActiveTab(newValue);
          }}
          sx={{
            px: "20px",
            "& .MuiTabs-flexContainer": {
              width: "100%",
            },
          }}
          TabIndicatorProps={{
            sx: {
              backgroundColor: "#676767",
              height: 3,
              borderRadius: 999,
            },
          }}
        >
          {HERO_PANEL_TABS.map((tab) => (
            <Tab
              key={tab.id}
              label={tab.label}
              value={tab.id}
              sx={{
                flex: 1,
                minWidth: 0,
                maxWidth: "none",
                textTransform: "none",
                fontSize: 13,
                height: 52,
                backgroundColor: activeTab === tab.id ? "#454b57" : "#b5b5b6",
                borderRightWidth: 1,
                borderRightStyle: "solid",
                borderRightColor: "rgba(0,0,0,0.15)",
                "&:last-of-type": { borderRightWidth: 0 },
                color: "#454b57",
                fontWeight: 500,
                "&.Mui-selected": {
                  color: "white",
                  fontWeight: 600,
                },
              }}
            />
          ))}
        </TabList>
      </div>

      {activeTab === "slideshow" && (
        <div className="px-5 py-4 text-[13px]">
          <div className="mb-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-[13px] font-bold text-slate-700 dark:text-white/80">
                ความสูง
              </span>
              <span className="text-slate-400 dark:text-slate-400 text-[13px] tabular-nums">
                {Math.round(heroHeight)}
              </span>
              <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
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
                      className="flex items-center justify-center px-3"
                      onClick={() => {
                        if (slides.length <= 1) return;
                        const swapWith = index === slides.length - 1 ? 0 : index + 1;
                        const nextSlides = [...slides];
                        const temp = nextSlides[index];
                        nextSlides[index] = nextSlides[swapWith];
                        nextSlides[swapWith] = temp;
                        setSlidesState(nextSlides, slide.id);
                      }}
                      title="สลับตำแหน่ง"
                    >
                      <ArrowUpDown size={14} style={{ opacity: 0.6 }} />
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
                <span className="text-[13px] font-bold text-slate-700 dark:text-white/80">
                  การแสดงผล
                </span>
                <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
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
                {Math.round(slideDurationSec)} วิ
              </span>
              <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
            </div>
            <div className="mt-[8px]">
              <Range
                min={1}
                max={20}
                step={1}
                value={slideDurationSec}
                handleChange={(e) => {
                  const nextDuration = Math.max(1, Math.min(20, Number(e.target.value) || 5));
                  setUpdated(true);
                  setData((prev) => ({
                    ...prev,
                    slideDurationSec: nextDuration,
                    slides: (Array.isArray(prev.slides) ? prev.slides : []).map((slide) => ({
                      ...slide,
                      durationSec: nextDuration,
                    })),
                  }));
                }}
                pos={((slideDurationSec - 1) / (20 - 1)) * 100}
                color={textColor || "#333333"}
              />
            </div>

            <div className="mb-2 mt-5 flex items-center gap-2">
              <span className="text-[13px] font-bold text-slate-700 dark:text-white/80">
                ตั้งค่า Bullet
              </span>
              <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
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
                  <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
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
                  <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
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
        <nav className="px-5 pb-6 overflow-y-auto h-[calc(100%-64px)]">
          <div className="mt-4 mb-2 flex items-center gap-2">
            <span className="text-[13px] font-bold text-slate-700 dark:text-white/80">
              สีพื้นหลังแบบสีพื้น
            </span>
            <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <AntSwitch
                checked={activeIsGradient}
                onChange={() => updateActiveSlideVisual("isGradient", !activeIsGradient)}
              />
              <Typography sx={{ fontSize: 13 }}>สีไล่โทน</Typography>
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
                    color: "rgb(51 65 85)",
                    mb: 0.35,
                    fontVariantNumeric: "tabular-nums",
                    ".dark &": { color: "rgba(255,255,255,0.78)" },
                  }}
                >
                  องศาไล่โทน{" "}
                  <span className="text-slate-400 dark:text-slate-400">
                    {Math.round(gradientDegree)}
                  </span>
                  <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
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

          <div className="mt-6 mb-2 flex items-center gap-2">
            <span className="text-[13px] font-bold text-slate-700 dark:text-white/80">
              ภาพพื้นหลัง
            </span>
            <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
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
              คลังรูปภาพ
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
                updateActiveSlideVisual("backgroundImage", "");
              }}
              disabled={!activeBackgroundImage}
            >
              ลบ
            </Button>
          </Box>

          {activeBackgroundImage ? (
            <>
              <img
                src={activeBackgroundImage}
                className="mt-3 block h-[200px] w-full rounded-md object-cover"
              />

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <div className="mb-1 flex items-center gap-1">
                    <span className="shrink-0 text-[13px] font-semibold text-slate-700 dark:text-white/80">
                      โปร่งแสง
                    </span>
                    <span className="text-[12px] tabular-nums text-slate-400 dark:text-slate-400">
                      {opacityPercent}
                    </span>
                    <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
                  </div>
                  <Range
                    min={0}
                    max={100}
                    step={1}
                    value={opacityPercent}
                    handleChange={(e) => {
                      const next = Number(e.target.value);
                      updateActiveSlideVisual(
                        "opacityImage",
                        Math.min(1, Math.max(0, (Number.isFinite(next) ? next : 100) / 100))
                      );
                    }}
                    pos={opacityPercent}
                    color={textColor || "#333333"}
                  />
                </div>
                <div className="col-span-1">
                  <div className="mb-1 flex items-center gap-1">
                    <span className="shrink-0 text-[13px] font-semibold text-slate-700 dark:text-white/80">
                      เบลอภาพ
                    </span>
                    <span className="text-[12px] tabular-nums text-slate-400 dark:text-slate-400">
                      {Math.round(blurAmount)}
                    </span>
                    <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
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

              <div className="mt-5 mb-2 flex items-center gap-2">
                <span className="text-[13px] font-bold text-slate-700 dark:text-white/80">
                  เพิ่มมิติพื้นหลัง
                </span>
                <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <AntSwitch
                    checked={activeParallaxEnabled}
                    onChange={() => {
                      updateActiveSlideVisual("parallaxEnabled", !activeParallaxEnabled);
                    }}
                  />
                </Stack>
              </div>
            </>
          ) : (
            <button
              type="button"
              className="mb-[5px] mt-3 flex min-h-[150px] w-full items-center justify-center rounded-md border-0 bg-gray-200 px-3 py-6 text-sm dark:bg-zinc-800"
              onClick={() => setBackgroundPickerOpen(true)}
            >
              <span className="text-[13px] font-medium text-gray-500 dark:text-gray-400">
                ไม่มีรูปภาพ
              </span>
            </button>
          )}
        </nav>
      )}

      {activeTab === "layer" && (
        <div className="px-5 py-6">
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
                  <div className="mb-0.5 flex h-9 w-9 items-center justify-center text-slate-700 dark:text-white/80">
                    {item.iconType === "material" ? (
                      <span
                        className="material-symbols-outlined text-[28px] leading-none"
                        style={{ color: "#333333" }}
                      >
                        {String(item.icon || "")}
                      </span>
                    ) : (
                      <ItemIcon className="h-6 w-6" />
                    )}
                  </div>
                  <span className="text-[11px] font-medium text-slate-700 dark:text-white/85">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-5 mb-2 flex items-center gap-2">
            <span className="text-[13px] font-semibold text-slate-700 dark:text-white/80">
              Layer Items
            </span>
            <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
            <span className="text-[11px] text-slate-400 dark:text-white/50">
              {activeLayerItemsForPanel.length}
            </span>
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
                    className={`flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 bg-white px-2 py-2 dark:border-white/10 dark:bg-white/5 ${
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
                        updateActiveSlideLayerItems((currentLayerItems) =>
                          currentLayerItems.map((layerItem) =>
                            layerItem?.id === layer?.id
                              ? { ...layerItem, animationEnabled: layerItem?.animationEnabled !== true }
                              : layerItem
                          )
                        );
                      }}
                      className={`inline-flex h-[26px] min-w-[48px] items-center justify-center rounded border px-2 text-[10px] font-semibold ${
                        layer?.animationEnabled === true
                          ? "border-emerald-500 bg-emerald-600 text-white"
                          : "border-slate-200 bg-white text-slate-600 dark:border-white/15 dark:bg-white/5 dark:text-white/70"
                      }`}
                      aria-label="เปิดปิด Animation ของ Layer"
                      title="เปิดปิด Animation ของ Layer"
                    >
                      Anim
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
                  </div>
                );
              })
            )}
          </div>
          <div className="mt-5">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-[13px] font-semibold text-slate-700 dark:text-white/80">
                Animation
              </span>
              <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
            </div>
            {!activeSelectedLayerItem ? (
              <div className="rounded-md border border-dashed border-slate-200 px-3 py-2 text-[12px] text-slate-400 dark:border-white/10 dark:text-white/50">
                เลือก Layer เพื่อปรับ Animation
              </div>
            ) : (
              <div className="space-y-3 rounded-md border border-slate-200 bg-white px-3 py-3 dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[12px] font-medium text-slate-700 dark:text-white/80">
                    เปิดใช้งาน
                  </span>
                  <AntSwitch
                    checked={activeSelectedLayerItem?.animationEnabled === true}
                    onChange={(event) =>
                      updateActiveLayerAnimation({
                        animationEnabled: event.target.checked,
                      })
                    }
                    inputProps={{
                      "aria-label": "เปิดปิด Animation ของ Layer ที่เลือก",
                      title: "เปิดปิด Animation ของ Layer ที่เลือก",
                    }}
                  />
                </div>
                {activeSelectedLayerItem?.animationEnabled === true ? (
                  <>
                    <div>
                      <div className="mb-1 text-[12px] font-medium text-slate-700 dark:text-white/80">
                        รูปแบบ
                      </div>
                      <select
                        className="h-[32px] w-full rounded-md border border-slate-200 bg-white px-2 text-[12px] text-slate-700 outline-none dark:border-white/15 dark:bg-slate-900/70 dark:text-white/80"
                        value={activeSelectedLayerItem?.animationType || HERO_LAYER_ANIMATION_DEFAULTS.animationType}
                        onChange={(event) =>
                          updateActiveLayerAnimation({ animationType: event.target.value })
                        }
                        aria-label="เลือกรูปแบบ Animation"
                      >
                        {HERO_LAYER_ANIMATION_TYPES.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
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
                        <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
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
                        <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
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

                    <div>
                      <div className="mb-1 text-[12px] font-medium text-slate-700 dark:text-white/80">
                        Easing
                      </div>
                      <select
                        className="h-[32px] w-full rounded-md border border-slate-200 bg-white px-2 text-[12px] text-slate-700 outline-none dark:border-white/15 dark:bg-slate-900/70 dark:text-white/80"
                        value={
                          activeSelectedLayerItem?.animationEasing ||
                          HERO_LAYER_ANIMATION_DEFAULTS.animationEasing
                        }
                        onChange={(event) =>
                          updateActiveLayerAnimation({ animationEasing: event.target.value })
                        }
                        aria-label="เลือก easing ของ Animation"
                      >
                        {HERO_LAYER_ANIMATION_EASINGS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[12px] font-medium text-slate-700 dark:text-white/80">
                        เล่นครั้งเดียว
                      </span>
                      <AntSwitch
                        checked={activeSelectedLayerItem?.animationOnce !== false}
                        onChange={(event) =>
                          updateActiveLayerAnimation({
                            animationOnce: event.target.checked,
                          })
                        }
                        inputProps={{
                          "aria-label": "Animation เล่นครั้งเดียว",
                          title: "Animation เล่นครั้งเดียว",
                        }}
                      />
                    </div>
                  </>
                ) : null}
              </div>
            )}
          </div>
        </div>
      )}

      <ImageModal
        openModal={backgroundPickerOpen}
        setOpenModal={setBackgroundPickerOpen}
        handleChange={(url) => {
          updateActiveSlideVisual("backgroundImage", url);
        }}
      />
      </TabContext>
    </aside>
  );
}

export default HeroOffcanvas;
