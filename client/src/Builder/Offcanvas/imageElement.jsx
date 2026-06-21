import { useCallback, useEffect, useMemo, useRef, useState,Fragment } from "react";
import { Box, Button, ButtonGroup, Stack, Typography } from "@mui/material";
import Switch from "@mui/material/Switch";
import { styled } from "@mui/material/styles";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import {
  Bold,
  Check,
  ChevronLeft,
  ChevronRight,
  Circle,
  Link,
  Play,
  Sun,
  Sparkles,
  Image,
} from "lucide-react";
import lodash from "lodash";
import ImageModal from "../imageModal";
import {
  BANNER_CAPTION_DEFAULTS_BY_EDGE,
  BANNER_CAPTION_EDGE_OPTIONS,
  BANNER_CAPTION_SLIDE_MAX,
  BANNER_CAPTION_SLIDE_MIN,
  defaultBannerCaptionSlideVertical,
  normalizeBannerCaptionEdge,
} from "../Layouts/Elements/bannerCaptionLayout";
import {
  IMAGE_ASPECT_DEFAULT,
  IMAGE_ASPECT_OPTIONS,
  getImageBadgePositionsForPanel,
  IMAGE_BADGE_SIZES,
  IMAGE_BADGE_VARIANTS,
  IMAGE_BADGE_OPACITY_DEFAULT,
  IMAGE_BRIGHTNESS_DEFAULT,
  IMAGE_MARGIN_TOP_DEFAULT,
  IMAGE_MARGIN_BOTTOM_DEFAULT,
  IMAGE_CORNER_RADIUS_MAX_PX,
  getImageCornerRadiusValue,
  imageBrightnessFilterStyle,
  imageCornerRadiusStyle,
  mergeImageBadge,
  patchImageCornerRadius,
} from "../Layouts/Elements/imageAspectConfig";
import { swatchSelectedCheckClassName } from "../Layouts/Elements/swatchCheckClass";
import { THEME_PANEL_BASIC_COLOR_SWATCHES } from "../themePanelBasicColors";
import { setColor } from "../../../function";
import ImageBadge from "../Layouts/Elements/ImageBadge";

/** โหมดแก้สี badge — เลื่อนซ้าย/ขวาเหมือนตำแหน่ง/ขนาด */
const BADGE_COLOR_MODES = [
  { value: "background", label: "สีพื้นหลัง" },
  { value: "text", label: "สีข้อความ" },
];

const LINK_TARGET_OPTIONS = [
  { value: "_self", label: "ลิงค์หน้าเดิม" },
  { value: "_blank", label: "เปิดหน้าใหม่" },
];
const IMAGE_HOVER_EXTRA_OPTIONS = [
  { value: "none", label: "ไม่มี" },
  { value: "icon", label: "ไอคอน" },
  { value: "button", label: "ปุ่มกด" },
];
const IMAGE_OVERLAY_EXTRA_OPTIONS = [
  { value: "none", label: "ไม่มี" },
  { value: "icon", label: "ไอคอน" },
  { value: "button", label: "ปุ่มกด" },
];

const OPTION_CHIP_RADIUS = "0.375rem";
const CHIP_BORDER = "#e2e8f0";
const CHIP_BORDER_DARK = "rgba(255, 255, 255, 0.1)";
const CHIP_BG = "#ffffff";
const CHIP_BG_HOVER = "#f8fafc";
const CHIP_BG_DARK = "rgba(30, 41, 59, 0.9)";
const CHIP_BG_DARK_HOVER = "rgba(30, 41, 59, 1)";

const groupButtonSx = (selected, accent) => {
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

const groupRootSx = {
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

/** ธีมกล่อง preview (พื้นหลัง / ข้อความว่าง) */
const PREVIEW_THEME = {
  header: "#3c4353",
  divider: "#e0e0e0",
  canvasBg: "#e9eaed",
  placeholder: "#8e94a0",
  radius: "5px",
};

const CORNER_TARGETS = [
  { value: "all", label: "รอบด้าน" },
  { value: "tl", label: "บนซ้าย" },
  { value: "tr", label: "บนขวา" },
  { value: "bl", label: "ล่างซ้าย" },
  { value: "br", label: "ล่างขวา" },
];

/** ชุดคลาสเดียวกับปรับ Opacity สีธีม — Offcanvas/container.jsx */
const THEME_RANGE_INPUT_CLASS = `
                    w-full cursor-pointer appearance-none h-2 rounded-full
                    bg-zinc-200
                    dark:bg-zinc-700

                    theme-range-fill-track

                    [&::-webkit-slider-runnable-track]:border-0
                    [&::-moz-range-track]:border-0

                    [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-emerald-300
                    dark:[&::-webkit-slider-thumb]:bg-emerald-300
                    [&::-webkit-slider-thumb]:bg-slate-900
                    [&::-webkit-slider-thumb]:border-0

                    [&::-moz-range-thumb]:cursor-pointer
                    [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4
                    [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:bg-emerald-300
                    [&::-moz-range-thumb]:border-0
                  `;



const BTN = ({handleClick,btnClass,style,label=null,icon=null,})=>{

  const Icon = icon?.Icon
  const className = icon?.className
  const strokeWidth = icon?.strokeWidth

  return( <button
    type="button"
    onClick={handleClick}
    className={btnClass}
    style={style}
  >
     {icon && (
      <Icon className={className} strokeWidth={strokeWidth}/>
    )}
    {label && (
      <>{label}</>
    )}
   
    
  </button>)
}

const BTN2 = ({handleClick,sx,label=null,icon=null,})=>{

  const Icon = icon?.Icon
  const className = icon?.className
  const strokeWidth = icon?.strokeWidth
  const size = icon?.size

  return(  <Button
    onClick={handleClick}
    sx={sx}
  >
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "5px",
      }}
    >
      {icon ? (
        <Icon
          className={className}
          strokeWidth={strokeWidth}
          size={size}
          aria-hidden
        />
      ) : null}
      {label}
    </Box>
  </Button>)
}


/** Switch แบบเดียวกับ Section «เส้นคั่นคอลัมน์» — Offcanvas/container.jsx AntSwitch */
const ImagePanelAntSwitch = styled(Switch, {
  shouldForwardProp: (prop) => prop !== "accentColor",
})(({ theme, accentColor = "#0d9488" }) => ({
  width: 28,
  height: 16,
  padding: 0,
  display: "flex",
  "&:active": {
    "& .MuiSwitch-thumb": {
      width: 15,
    },
    "& .MuiSwitch-switchBase.Mui-checked": {
      transform: "translateX(9px)",
    },
  },
  "& .MuiSwitch-switchBase": {
    padding: 2,
    "&.Mui-checked": {
      transform: "translateX(12px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        opacity: 1,
        backgroundColor: accentColor,
      },
    },
  },
  "& .MuiSwitch-thumb": {
    boxShadow: "0 2px 4px 0 rgb(0 35 11 / 20%)",
    width: 12,
    height: 12,
    borderRadius: 6,
    transition: theme.transitions.create(["width"], {
      duration: 200,
    }),
  },
  "& .MuiSwitch-track": {
    borderRadius: 8,
    opacity: 1,
    backgroundColor: "rgba(0,0,0,.25)",
    boxSizing: "border-box",
    ".dark &": { backgroundColor: "rgba(255,255,255,.25)" },
  },
}));

const MainLabel = ({
  label,
  value = NaN,
  mb = 0.75,
  handleSwitch = null,
  checked = "-",
  textColor = null,
  switchLabel = null,
  /** ถ้ากำหนด (เช่น 2) แสดงทศนิยมแทน Math.round */
  valueDecimals = null,
}) => {
  const accent = textColor || "#0d9488";
  const valueDisplay =
    !isNaN(value) && valueDecimals != null && valueDecimals >= 0
      ? Number(value).toFixed(valueDecimals)
      : !isNaN(value)
        ? String(Math.round(Number(value)))
        : null;
  return (
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
        mb,
        fontVariantNumeric: "tabular-nums",
        ".dark &": { color: "rgba(255,255,255,0.78)" },
      }}
    >
      {label}{" "}
      {valueDisplay != null && (
        <span className="text-slate-400 dark:text-slate-400">
          {valueDisplay}
        </span>
      )}
      <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
      {checked !== "-" && (
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <ImagePanelAntSwitch
            accentColor={accent}
            inputProps={{
              "aria-label": switchLabel || label,
            }}
            checked={Boolean(checked)}
            onChange={handleSwitch}
          />
          {switchLabel ? (
            <Typography sx={{ fontSize: 13 }}>{switchLabel}</Typography>
          ) : null}
        </Stack>
      )}
    </Typography>
  );
};

const Field = ({value,handleChange,placeholder,id,type,className})=>{
  return(                  <input
    id={id}
    type={type}
    className={className}
    placeholder={placeholder}
    value={value}
    onChange={handleChange}
    autoComplete="off"
  />)
}

const SelectLine = ({prev,next,value,prevAria,nextAria,groupAria})=>{

  return(     
    <div
    className="flex items-center justify-between gap-0.5 rounded-lg border border-slate-200 bg-white px-0.5 py-0.5 dark:border-white/10 dark:bg-slate-800/90"
    role={groupAria !== "-" ? "group" : undefined}
    aria-label={groupAria}
  >
    <button
      type="button"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
      onClick={prev}
      aria-label={prevAria}
    >
      <ChevronLeft className="size-4" strokeWidth={2} aria-hidden />
    </button>

    <span className="min-w-0 flex-1 truncate text-center text-[11px] font-normal text-slate-800 dark:text-white/90">
      {value}
    </span>

    <button
      type="button"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
      onClick={next}
      aria-label={nextAria}
    >
      <ChevronRight className="size-4" strokeWidth={2} aria-hidden />
    </button>
  </div>)

}

const Range = ({ min, max, step, value, handleChange, pos, textColor }) => (
  <input
    type="range"
    min={min}
    max={max}
    value={value}
    step={step}
    onChange={handleChange}
    className={THEME_RANGE_INPUT_CLASS}
    style={{
      ["--pos"]: `${pos}%`,
      ["--fill"]: textColor || "#0d9488",
    }}
  />
);

const ImageElementOffcanvas = ({
  element,
  onUpdate,
  close,
  textColor,
  theme,
  layoutElementType = "img",
  panelTitle = "Image",
  showImageLink = true,
}) => {
  const layoutSyncRafRef = useRef(0);
  const pendingLayoutRef = useRef(null);
  const [AI,setAI] = useState({
    useAI:false,
    promt:""
  })
  /** อ้างอิง element จาก parent ล่าสุด — กันชน rAF แล้ว snapshot ไม่มี src/type */
  const elementRef = useRef(element);
  elementRef.current = element;

  /** ห้ามเรียก onUpdate ภายใน setState updater — รวมเฟรมด้วย rAF ลดการชนกันของ snapshot */
  const scheduleLayoutSync = useCallback(
    (next) => {
      const base = elementRef.current || {};
      const merged = {
        ...base,
        ...next,
        type: next?.type ?? base?.type ?? layoutElementType,
        id: next?.id != null ? next.id : base?.id,
        src: next?.src != null && next.src !== "" ? next.src : base?.src,
      };
      pendingLayoutRef.current = lodash.cloneDeep(merged);
      if (layoutSyncRafRef.current) {
        cancelAnimationFrame(layoutSyncRafRef.current);
      }
      layoutSyncRafRef.current = requestAnimationFrame(() => {
        layoutSyncRafRef.current = 0;
        const snapshot = pendingLayoutRef.current;
        pendingLayoutRef.current = null;
        if (snapshot) onUpdate?.(snapshot);
      });
    },
    [onUpdate, layoutElementType]
  );

  const [data, setData] = useState(element);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [badgeColorMode, setBadgeColorMode] = useState(
    BADGE_COLOR_MODES[0].value
  );
  const [cornerTarget, setCornerTarget] = useState("all");

  const currentAspect = data?.aspectRatio ?? IMAGE_ASPECT_DEFAULT;
  const brightness =
    data?.brightness ?? IMAGE_BRIGHTNESS_DEFAULT;
  const previewBrightnessStyle = imageBrightnessFilterStyle(brightness);
  const cornerRadius = getImageCornerRadiusValue(data?.borderRadius, cornerTarget);
  const previewCornerStyle = imageCornerRadiusStyle(
    data?.borderRadius,
    currentAspect
  );
  const badgeMergeOpts = useMemo(
    () => ({ elementType: layoutElementType }),
    [layoutElementType]
  );
  const badgeMerged = mergeImageBadge(data?.badge, badgeMergeOpts);
  const badgePositionOptions = useMemo(
    () =>
      getImageBadgePositionsForPanel(
        layoutElementType,
        badgeMerged.variant
      ),
    [layoutElementType, badgeMerged.variant]
  );

  /* sync จาก parent เมื่อเปลี่ยน element คนละตัว — object เดียวกัน (id เดิม) ไม่ทับ state หลังเลือกรูปจากคลัง */
  useEffect(() => {
    if (!element?.id) return;
    // Always sync latest element payload from parent so toggle-off state
    // (e.g. imageHoverExtras: []) is not kept stale in local offcanvas state.
    setData(element);
  }, [element]);

  useEffect(() => {
    setBadgeColorMode(BADGE_COLOR_MODES[0].value);
    setCornerTarget("all");
  }, [element?.id]);

  const handleSrcChange = (src) => {
    setData((prev) => {
      const next = { ...prev, src };
      scheduleLayoutSync(next);
      return next;
    });
  };

  const handleAspectRatioChange = (aspectRatio) => {
    setData((prev) => {
      const next = { ...prev, aspectRatio };
      scheduleLayoutSync(next);
      return next;
    });
  };

  const handleBrightnessChange = (value) => {
    setData((prev) => {
      const next = { ...prev, brightness: value };
      scheduleLayoutSync(next);
      return next;
    });
  };

  const BANNER_CAPTION_FONT_MIN = 12;
  const BANNER_CAPTION_FONT_MAX = 56;
  const bannerCaptionFontSizeRaw = Number(data?.bannerCaptionFontSize);
  const bannerCaptionFontSize = Number.isFinite(bannerCaptionFontSizeRaw)
    ? Math.min(
        BANNER_CAPTION_FONT_MAX,
        Math.max(BANNER_CAPTION_FONT_MIN, bannerCaptionFontSizeRaw)
      )
    : 48;

  const handleBannerCaptionFontSizeChange = (value) => {
    setData((prev) => {
      const next = { ...prev, bannerCaptionFontSize: value };
      scheduleLayoutSync(next);
      return next;
    });
  };

  const BANNER_LETTER_SPACING_MIN = 0;
  const BANNER_LETTER_SPACING_MAX = 15;
  const bannerCaptionLetterSpacingRaw = Number(data?.bannerCaptionLetterSpacing);
  const bannerCaptionLetterSpacing = Number.isFinite(
    bannerCaptionLetterSpacingRaw
  )
    ? Math.min(
        BANNER_LETTER_SPACING_MAX,
        Math.max(BANNER_LETTER_SPACING_MIN, bannerCaptionLetterSpacingRaw)
      )
    : 6;

  const handleBannerCaptionLetterSpacingChange = (value) => {
    setData((prev) => {
      const next = { ...prev, bannerCaptionLetterSpacing: value };
      scheduleLayoutSync(next);
      return next;
    });
  };

  const bannerCaptionSlideVerticalRaw = Number(
    data?.bannerCaptionSlideVertical
  );
  const bannerCaptionSlideVertical = Number.isFinite(
    bannerCaptionSlideVerticalRaw
  )
    ? Math.round(
        Math.min(
          BANNER_CAPTION_SLIDE_MAX,
          Math.max(BANNER_CAPTION_SLIDE_MIN, bannerCaptionSlideVerticalRaw)
        )
      )
    : defaultBannerCaptionSlideVertical();

  const bannerCaptionEdgeNormalized = normalizeBannerCaptionEdge(
    data?.bannerCaptionEdgePosition
  );
  const bannerCaptionHorizontalLayout =
    bannerCaptionEdgeNormalized === "bottom";
  const bannerCaptionSlideVerticalStep = 1;

  const handleBannerCaptionSlideVerticalChange = (value) => {
    setData((prev) => {
      const next = { ...prev, bannerCaptionSlideVertical: value };
      scheduleLayoutSync(next);
      return next;
    });
  };

  const bannerCaptionSlideHorizontalRaw = Number(
    data?.bannerCaptionSlideHorizontal
  );
  const bannerCaptionSlideHorizontal = Number.isFinite(
    bannerCaptionSlideHorizontalRaw
  )
    ? Math.round(
        Math.min(
          BANNER_CAPTION_SLIDE_MAX,
          Math.max(BANNER_CAPTION_SLIDE_MIN, bannerCaptionSlideHorizontalRaw)
        )
      )
    : 0;

  const handleBannerCaptionSlideHorizontalChange = (value) => {
    setData((prev) => {
      const next = { ...prev, bannerCaptionSlideHorizontal: value };
      scheduleLayoutSync(next);
      return next;
    });
  };

  const bannerCaptionEdgeLabel =
    BANNER_CAPTION_EDGE_OPTIONS.find(
      (o) =>
        o.value ===
        normalizeBannerCaptionEdge(data?.bannerCaptionEdgePosition)
    )?.label ?? "แนวนอน";

  const bannerCaptionTextColorRaw = data?.bannerCaptionTextColor ?? "#FFFFFF";
  const bannerCaptionTextOpacityRaw = Number(data?.bannerCaptionTextOpacity);
  const bannerCaptionTextOpacity = Number.isFinite(bannerCaptionTextOpacityRaw)
    ? Math.max(0, Math.min(255, bannerCaptionTextOpacityRaw))
    : 255;

  const handleBannerCaptionTextColorChange = (colorValue) => {
    setData((prev) => {
      const next = { ...prev, bannerCaptionTextColor: colorValue };
      scheduleLayoutSync(next);
      return next;
    });
  };

  const handleBannerCaptionTextOpacityChange = (value) => {
    setData((prev) => {
      const next = { ...prev, bannerCaptionTextOpacity: value };
      scheduleLayoutSync(next);
      return next;
    });
  };

  const cycleBannerCaptionEdge = (delta) => {
    const cur = normalizeBannerCaptionEdge(data?.bannerCaptionEdgePosition);
    const idx = BANNER_CAPTION_EDGE_OPTIONS.findIndex((o) => o.value === cur);
    const base = idx === -1 ? 0 : idx;
    const next =
      (base + delta + BANNER_CAPTION_EDGE_OPTIONS.length) %
      BANNER_CAPTION_EDGE_OPTIONS.length;
    setData((prev) => {
      const nextEdge = BANNER_CAPTION_EDGE_OPTIONS[next].value;
      const defaults = BANNER_CAPTION_DEFAULTS_BY_EDGE[nextEdge] ?? BANNER_CAPTION_DEFAULTS_BY_EDGE.bottom;
      const n = {
        ...prev,
        bannerCaptionEdgePosition: nextEdge,
        ...defaults,
      };
      scheduleLayoutSync(n);
      return n;
    });
  };

  const handleCornerRadiusChange = (value) => {
    setData((prev) => {
      const next = {
        ...prev,
        borderRadius: patchImageCornerRadius(prev?.borderRadius, cornerTarget, value),
      };
      scheduleLayoutSync(next);
      return next;
    });
  };

  const handleBadgePatch = (patch) => {
    console.log(patch);
    setData((prev) => {
      const next = {
        ...prev,
        badge: mergeImageBadge(
          { ...(prev.badge || {}), ...patch },
          badgeMergeOpts
        ),
      };
      scheduleLayoutSync(next);
      return next;
    });
  };

  const handleLinkPatch = (patch) => {
    setData((prev) => {
      const next = { ...prev, ...patch };
      scheduleLayoutSync(next);
      return next;
    });
  };

  const cycleBadgeOption = (key, list, delta) => {
    const idx = list.findIndex((o) => o.value === badgeMerged[key]);
    const base = idx === -1 ? 0 : idx;
    const next = (base + delta + list.length) % list.length;
    handleBadgePatch({ [key]: list[next].value });
  };

  const cycleBadgeColorMode = (delta) => {
    const idx = BADGE_COLOR_MODES.findIndex((o) => o.value === badgeColorMode);
    const base = idx === -1 ? 0 : idx;
    const next =
      (base + delta + BADGE_COLOR_MODES.length) % BADGE_COLOR_MODES.length;
    setBadgeColorMode(BADGE_COLOR_MODES[next].value);
  };

  const badgeColorModeLabel =
    BADGE_COLOR_MODES.find((o) => o.value === badgeColorMode)?.label ?? "";

  const badgeOpacitySliderRaw =
    badgeColorMode === "text"
      ? Number(badgeMerged.textOpacity)
      : Number(badgeMerged.backgroundOpacity);
  const badgeOpacitySliderValue = Number.isFinite(badgeOpacitySliderRaw)
    ? Math.max(0, Math.min(255, badgeOpacitySliderRaw))
    : IMAGE_BADGE_OPACITY_DEFAULT;

  const badgePosLabel =
    badgePositionOptions.find((o) => o.value === badgeMerged.position)
      ?.label ?? "";
  const badgeVariantLabel =
    IMAGE_BADGE_VARIANTS.find((o) => o.value === badgeMerged.variant)
      ?.label ?? "";
  const badgeSizeLabel =
    IMAGE_BADGE_SIZES.find((o) => o.value === badgeMerged.size)?.label ?? "";

  const allColors = useMemo(() => {
    if (!theme?.mainColor?.length) return [];
    const mc = theme.mainColor.map((_, i) => ({ type: "mainColor", index: i }));
    const tc = (theme.textColor || []).map((_, i) => ({
      type: "textColor",
      index: i,
    }));
    const oc = (theme.otherColor || []).map((_, i) => ({
      type: "otherColor",
      index: i,
    }));
    const basic = THEME_PANEL_BASIC_COLOR_SWATCHES;
    return [...mc, ...tc, ...oc, ...basic];
  }, [theme]);

  const isCarouselSlideEdit = Boolean(element?.__carouselSlideEdit);
  const isListItemImageEdit = Boolean(data?.__listItemImageEdit);
  const isListBoxItemImageEdit = Boolean(data?.__listBoxItemImageEdit);
  const isCompoundListImageEdit =
    isListItemImageEdit || isListBoxItemImageEdit;
  const _csl = element?.__carouselSlideEdit;
  const _perView = Number(_csl?.perViewDesktop) || 1;
  const _colSize = Number(_csl?.colSize) || 12;
  /* เตือนเมื่อพื้นที่ต่อสไลด์เล็กเกินไป:
     ยกเว้น perView=3 + colSize>=6 (อย่างน้อยครึ่งหน้า → แต่ละสไลด์ยังกว้างพอ) */
  const showCarouselBadgeWarn = isCarouselSlideEdit && !(
    _perView <= 2 ||
    (_perView === 3 && _colSize >= 6)
  );
  const linkEnabled = Boolean(data?.linkEnabled);
  const linkUrl = typeof data?.linkUrl === "string" ? data.linkUrl : "";
  const linkTarget = data?.linkTarget === "_blank" ? "_blank" : "_self";
  const slideLinkMode = data?.slideLinkMode ?? "url";
  const slideVideoEmbed = typeof data?.slideVideoEmbed === "string" ? data.slideVideoEmbed : "";
  const imageMarginTopRaw = Number(data?.imageMarginTop);
  const imageMarginTop = Number.isFinite(imageMarginTopRaw)
    ? Math.max(0, Math.min(80, imageMarginTopRaw))
    : IMAGE_MARGIN_TOP_DEFAULT;
  const imageMarginBottomRaw = Number(data?.imageMarginBottom);
  const imageMarginBottom = Number.isFinite(imageMarginBottomRaw)
    ? Math.max(0, Math.min(80, imageMarginBottomRaw))
    : IMAGE_MARGIN_BOTTOM_DEFAULT;
  const isVideoPanel = layoutElementType === "vid";
  const isImageHoverPanel = layoutElementType === "imgh" || layoutElementType === "imgo";
  const isImageOverlayPanel = layoutElementType === "imgo";
  const imageHoverBackgroundEnabled = isImageHoverPanel
    ? data?.imageHoverBackgroundEnabled !== false
    : false;
  const imageHoverBackgroundColorRaw =
    data?.imageHoverBackgroundColor ?? { type: "mainColor", index: 0 };
  const imageHoverBackgroundOpacityRaw = Number(data?.imageHoverBackgroundOpacity);
  const imageHoverBackgroundOpacity = Number.isFinite(imageHoverBackgroundOpacityRaw)
    ? Math.max(0, Math.min(255, imageHoverBackgroundOpacityRaw))
    : 255;
  const imageHoverExtraOptions = isImageOverlayPanel
    ? IMAGE_OVERLAY_EXTRA_OPTIONS
    : IMAGE_HOVER_EXTRA_OPTIONS;
  const imageHoverExtras = (() => {
    const raw = Array.isArray(data?.imageHoverExtras)
      ? data.imageHoverExtras
      : isImageOverlayPanel
      ? []
      : ["none"];
    const clean = raw.filter((v) =>
      imageHoverExtraOptions.some((opt) => opt.value === v)
    );
    if (isImageOverlayPanel) return clean;
    return clean.length ? clean : ["none"];
  })();
  const imageHoverContentOffsetYRaw = Number(data?.imageHoverContentOffsetY);
  const imageHoverContentOffsetY = Number.isFinite(imageHoverContentOffsetYRaw)
    ? Math.max(0, Math.min(100, imageHoverContentOffsetYRaw))
    : isImageOverlayPanel
      ? 90
      : 62;
  const videoEmbedInputValue = (() => {
    const raw = typeof data?.src === "string" ? data.src.trim() : "";
    if (!raw) return "";
    const lower = raw.toLowerCase();
    if (
      lower.includes("youtube.com/embed/") ||
      lower.includes("youtube.com/watch") ||
      lower.includes("youtu.be/")
    ) {
      return raw;
    }
    return "";
  })();

  const handleImageHoverExtraToggle = (value) => {
    setData((prev) => {
      const currentRaw = Array.isArray(prev?.imageHoverExtras)
        ? prev.imageHoverExtras
        : [];

      if (isImageOverlayPanel) {
        const current = currentRaw.filter((v) =>
          IMAGE_OVERLAY_EXTRA_OPTIONS.some((opt) => opt.value === v)
        );

        let next;
        if (value === "none") {
          // "ไม่มี" = hide icon and button
          next = ["none"];
        } else if (current.includes(value)) {
          // uncheck icon/button
          next = current.filter((v) => v !== value);
          const hasIcon = next.includes("icon");
          const hasButton = next.includes("button");
          if (!hasIcon && !hasButton) {
            next = ["none"];
          } else {
            next = next.filter((v) => v !== "none");
          }
        } else {
          // check icon/button and clear none
          next = [...current.filter((v) => v !== "none"), value];
        }

        scheduleLayoutSync({
          id: prev?.id,
          type: prev?.type,
          imageHoverExtras: next,
        });

        const n = { ...prev, imageHoverExtras: next };
        scheduleLayoutSync(n);
        return n;
      }

      const current = currentRaw.filter((v) =>
        IMAGE_HOVER_EXTRA_OPTIONS.some((opt) => opt.value === v)
      );

      let next;
      if (value === "none") {
        next = ["none"];
      } else {
        if (current.includes(value)) {
          next = current.filter((v) => v !== value);
        } else {
          next = [...current.filter((v) => v !== "none"), value];
        }
        const hasIcon = next.includes("icon");
        const hasButton = next.includes("button");
        if (!hasIcon && !hasButton) {
          next = ["none"];
        }
      }

      const n = { ...prev, imageHoverExtras: next };
      scheduleLayoutSync(n);
      return n;
    });
  };


  const selectLineInputs = [
    {
      label: "ตำแหน่ง",
      title: "position",
      value: badgePosLabel,
      prevAria: "ตำแหน่งก่อนหน้า",
      nextAria: "ตำแหน่งถัดไป",
      onPrev: () => cycleBadgeOption("position", badgePositionOptions, -1),
      onNext: () => cycleBadgeOption("position", badgePositionOptions, 1),
    },
    {
      label: "รูปทรง",
      title: "variant",
      value: badgeVariantLabel,
      prevAria: "รูปทรงก่อนหน้า",
      nextAria: "รูปทรงถัดไป",
      onPrev: () => cycleBadgeOption("variant", IMAGE_BADGE_VARIANTS, -1),
      onNext: () => cycleBadgeOption("variant", IMAGE_BADGE_VARIANTS, 1),
    },
    {
      label: "ขนาด",
      title: "size",
      value: badgeSizeLabel,
      prevAria: "ขนาดก่อนหน้า",
      nextAria: "ขนาดถัดไป",
      onPrev: () => cycleBadgeOption("size", IMAGE_BADGE_SIZES, -1),
      onNext: () => cycleBadgeOption("size", IMAGE_BADGE_SIZES, 1),
    },
    {
      label: "สีพื้นหลัง - สีข้อความ",
      title: "colorMode",
      value: badgeColorModeLabel,
      prevAria: "โหมดสีก่อนหน้า",
      nextAria: "โหมดสีถัดไป",
      onPrev: () => cycleBadgeColorMode(-1),
      onNext: () => cycleBadgeColorMode(1),
      groupAria: "สลับแก้สีพื้นหลังหรือสีข้อความ",
    },
  ];

  const btnStyle = {
    backgroundColor: textColor || "#0d9488",
    color: "#fff",
    boxShadow: "0 1px 2px rgb(0 0 0 / 0.12)",
  };
  

  const btnClass1 = "inline-flex h-8 items-center font-normal justify-center rounded-md border px-1 text-[11px] font-medium leading-none transition"
  const btnClass2 = "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border transition"
  const activeClass =
  "border-transparent text-white shadow-sm";

const normalClass =
  "border-slate-200 bg-white text-slate-800 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800/90 dark:text-slate-100 dark:hover:bg-slate-800";


  return (
    <aside
      className={`
     flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden bg-white dark:bg-gray-900/80 border-r border-slate-200 dark:border-white/10 `}
    >
      <div className="shrink-0 px-6 pt-5 pb-3 flex items-center justify-between bg-gray-100">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 font-bold tracking-wide text-slate-800 dark:text-white/90">
            {panelTitle}
          </span>
          <span
            className="inline-flex min-w-0 max-w-full items-center rounded-md border border-[#333333] bg-[#333333] px-2 py-0.5 text-[11px] font-mono font-bold leading-none text-white tabular-nums dark:border-[#333333] dark:bg-[#333333] dark:text-white"
            title={String(data?.id ?? "")}
          >
            <span className="truncate">{data?.id}</span>
          </span>
        </div>
        <button
          type="button"
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-white/70"
          onClick={() => close(null, null, null)}
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
      <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain px-4 pb-6 w-full">
        <ul className="mt-4 pl-1 space-y-5">
          <li>
            <Box sx={{ pr: 0.5 }}>
              {!isCompoundListImageEdit && (
              <div
                className="mb-2 grid w-full grid-cols-4 gap-1"
                role="group"
                aria-label="อัตราส่วนภาพ"
              >
                {IMAGE_ASPECT_OPTIONS.map((opt) => {
                  const {value,label} = opt 
                  const selected = currentAspect === value;
                  const chipLabel =
                    opt.value === "auto" ? "ต้นฉบับ" : label;
                  return (
                    <Fragment key={value}>
                      <BTN label={chipLabel}  handleClick={() => handleAspectRatioChange(value)} btnClass={`
                  ${btnClass1}
                  ${selected ? activeClass : normalClass}
                  
                  `} style={selected ? btnStyle : undefined}/>
                    
                    </Fragment>
                   
                  );
                })}
              </div>
              )}

              <Box>
              <Box
                sx={{
                  bgcolor: PREVIEW_THEME.canvasBg,
                  borderRadius: PREVIEW_THEME.radius,
                  width: "100%",
                  height: 220,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {data?.src ? (
                  <Box
                    component="img"
                    src={data.src}
                    alt=""
                    sx={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                    draggable={false}
                  />
                ) : (
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography
                      sx={{
                        color: PREVIEW_THEME.placeholder,
                        fontSize: 14,
                        fontWeight: 400,
                      }}
                    >
                      ไม่มีรูปภาพ
                    </Typography>
                  </Box>
                )}
              </Box>
              </Box>
              
            </Box>
            <>
            <Box       sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  width: "100%",
                  mt:1,
                }}>
                  <BTN2 handleClick={(e) => {
                    e.currentTarget.blur();
                    requestAnimationFrame(() => setPickerOpen(true));
                  }} icon={{
                    Icon: Image,
                    strokeWidth:2.5,
                    className:"h-4 w-4",
                  }} label="อัปโหลดรูปภาพ" sx={{
                     "& .MuiButton-startIcon > *:nth-of-type(1)": {
                    fontSize: 18,
                  },
                  boxShadow: "none",
                  "&:hover": { boxShadow: "none" },
                  backgroundColor: textColor,
                  fontSize: 12,
                  height: 28,
                  width:"100%",color:"#ffffff",
                  py:2,}}/>
                     <BTN2 handleClick={() =>setAI(prev=>{
                      const next = {...prev}
                      next.useAI = !next.useAI
                      return next
                     })} icon={{
                    Icon:Sparkles,
                    className:"size-4 text-cyan-300",
                    strokeWidth:1.75,
                  }}  sx={{
                    "& .MuiButton-startIcon > *:nth-of-type(1)": {
                   fontSize: 18,
                 },
                 boxShadow: "none",
                 "&:hover": { boxShadow: "none" },
                 backgroundColor: textColor,
                 fontSize: 12,
                 height: 28,
                 width:28,color:"#ffffff",
                 py:2,}} />

            </Box>
           {AI.useAI && (  <Box sx={{ width: "100%", px: 0.25, mt: 2 }}>
              <div className="mb-3 mt-[-5px]">
     
              
              <textarea
                      type="text"
                      className="resize-none w-full min-h-[70px] rounded-md border border-slate-200 bg-white px-2.5 py-2 text-[13px] leading-snug text-slate-800 outline-none transition placeholder:text-slate-400  dark:border-white/10 dark:bg-slate-900/80 dark:text-white/90 dark:placeholder:text-slate-500 "
                      placeholder="ระบุคำสั่งเพื่อให้ AI สร้างภาพ TOKEN ของคุณจะลดลง"
                      value={AI.promt}
                      onChange={(e) =>
                        setAI(prev=>{
                          const next = {...prev}
                          next.promt = e.target.value
                          return next
                        })
                      }
                      autoComplete="off"
                    />
                    
                     <BTN2 handleClick={() =>console.log(1)}  sx={{
                    "& .MuiButton-startIcon > *:nth-of-type(1)": {
                   fontSize: 18,
                 },
                 boxShadow: "none",
                 "&:hover": { boxShadow: "none" },
                 backgroundColor: textColor,
                 fontSize: 12,
                 height: 28,
                 width:"100%",color:"#ffffff",
                 py:2,}} label="สร้างรูปภาพด้วย AI"/>
                
              
              </div>


            </Box>)}
            </>
            


            <Box sx={{ width: "100%", px: 0.25, mt: 1.5 }}>
            <MainLabel label="ปรับแสงรูปภาพ" value={brightness}/>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 0.25,
                }}
                aria-label="ปรับแสงรูปภาพ เข้มถึงสว่าง"
              >
                <Sun
                  className="size-4 shrink-0 text-slate-950 dark:text-slate-500"
                  strokeWidth={2}
                  aria-hidden
                />
                {/* ดีไซน์เดียวกับปรับ Opacity สีธีม — Offcanvas/container.jsx */}
                <div className="min-w-0 flex-1 pt-[2px] pb-[2px] px-[5px]">
                  <Range
                    min={-100}
                    max={100}
                    value={brightness}
                    step={1}
                    handleChange={(e) =>
                      handleBrightnessChange(Number(e.target.value))
                    }
                    pos={((brightness + 100) / 200) * 100}
                    textColor={textColor}
                  />
                </div>
                <Sun
                  className="size-4 shrink-0 text-slate-400 dark:text-slate-400"
                  strokeWidth={2}
                  aria-hidden
                />
              </Box>
            </Box>

            <Box sx={{ width: "100%", px: 0.25, mt: 2 }}>
            <MainLabel label="ความโค้งมนรูปภาพ" value={cornerRadius}/>
              <div className="mb-2 grid grid-cols-5 gap-1 mt-3">
                {CORNER_TARGETS.map((opt) => {
                  const {value,label} = opt
                  const active = cornerTarget === value;
                  const handleClick = () => setCornerTarget(value)
                  return (
                    <Fragment key={value}>
                      <BTN label={label} active={active} handleClick={handleClick} 
                      btnClass={`
                      ${btnClass1}
                      ${active ? activeClass : normalClass}
                      
                      `} style={active ? btnStyle : undefined}/>
                    </Fragment>
                  );
                })}
              </div>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  px: 0.25,
                }}
                aria-label={`ความโค้งมนรูปภาพ ${
                  CORNER_TARGETS.find((o) => o.value === cornerTarget)?.label ||
                  "รอบด้าน"
                } ${Math.round(cornerRadius)} พิกเซล`}
              >
                <div className="w-full pt-[2px] pb-[2px] px-[5px]">
                  <input
                    type="range"
                    min={0}
                    max={IMAGE_CORNER_RADIUS_MAX_PX}
                    value={cornerRadius}
                    step={1}
                    onChange={(e) =>
                      handleCornerRadiusChange(Number(e.target.value))
                    }
                    className={THEME_RANGE_INPUT_CLASS}
                    style={{
                      ["--pos"]: `${
                        (cornerRadius / IMAGE_CORNER_RADIUS_MAX_PX) * 100
                      }%`,
                      ["--fill"]: textColor || "#0d9488",
                    }}
                  />
                </div>
              </Box>
            </Box>

            {!isCompoundListImageEdit && !isImageHoverPanel && (
            <Box sx={{ width: "100%", px: 0.25, mt: 2 }}>
              {layoutElementType === "bnr" && (
                <Box sx={{ width: "100%", px: 0.25, mb: 2 }}>
                  <div className="mb-3">
             <MainLabel
                label="ข้อความพิเศษ"
                mb={1.25}
                textColor={textColor}
                {...(layoutElementType !== "bnr"
                  ? {
                      handleSwitch: () =>
                        handleBadgePatch({
                          hover: !Boolean(badgeMerged.hover),
                        }),
                      checked: badgeMerged.hover,
                      switchLabel: "เมาส์สัมผัส",
                    }
                  : {})}
              />
                <div className="flex items-center gap-2">
                
              
                  <Field
                    value={badgeMerged.label}
                    handleChange={(e) =>
                      handleBadgePatch({ label: e.target.value })
                    }
                    placeholder={
                      layoutElementType === "bnr"
                        ? "ข้อความบนแบนเนอร์ — เว้นว่างคือปิด"
                        : "ข้อความบนรูปภาพ - เว้นว่าง คือ ปิดการใช้งาน"
                    }
                    id="img-badge-label-input"
                    type="text"
                    className="h-10 w-full rounded-md border border-slate-200 bg-white px-2.5 py-2 text-[13px] leading-snug text-slate-800 outline-none transition placeholder:text-slate-400 dark:border-white/10 dark:bg-slate-900/80 dark:text-white/90 dark:placeholder:text-slate-500 "
                  />
                  <BTN
                    handleClick={() =>
                      handleBadgePatch({ bold: !Boolean(badgeMerged.bold) })
                    }
                    icon={{
                      Icon: Bold,
                      className: "size-4",
                      strokeWidth: 2.5,
                    }}
                    btnClass={`
                  ${btnClass2}
                  ${badgeMerged.bold ? activeClass : normalClass}
                  
                  `}
                    style={badgeMerged.bold ? btnStyle : undefined}
                  />
                </div>
                {showCarouselBadgeWarn && (
                  <p className="mt-1.5 text-[11px] leading-snug" style={{ color: "#b91c1b" }}>
                    ไม่เหมาะสม พื้นที่เล็กเกินไป
                  </p>
                )}
              </div>
              {/* สีข้อความ – banner only */}
              <div className="mt-3 mb-1">
                <MainLabel
                  label="สีข้อความ"
                  mb={1}
                  textColor={textColor}
                />
                <div className="w-full rounded-md bg-white px-[0px] pb-[5px] pt-[2px] dark:bg-zinc-800">
                  <div className="px-[5px] pb-2">
                    <input
                      type="range"
                      min={0}
                      max={255}
                      step={1}
                      value={bannerCaptionTextOpacity}
                      onChange={(e) =>
                        handleBannerCaptionTextOpacityChange(Number(e.target.value))
                      }
                      className={THEME_RANGE_INPUT_CLASS}
                      style={{
                        ["--pos"]: `${(bannerCaptionTextOpacity / 255) * 100}%`,
                        ["--fill"]: textColor || "#0d9488",
                      }}
                      aria-label={`ความโปร่งใสสีข้อความ ${bannerCaptionTextOpacity}`}
                    />
                  </div>
                  <div className="grid grid-cols-10 place-items-center gap-x-0 gap-y-[6px]">
                    {allColors.map((color, i) => {
                      const bgColor =
                        typeof color === "string"
                          ? color
                          : theme?.[color.type]?.[color.index];
                      if (bgColor == null) return null;
                      const selected =
                        lodash.isEqual(bannerCaptionTextColorRaw, color) ||
                        bannerCaptionTextColorRaw === color;
                      let margin = "";
                      if (i % 8 !== 0 && (i + 1) % 8 !== 0) {
                        margin += "mx-[65.75px] ";
                      }
                      return (
                        <div className={`${margin}`} key={i}>
                          <button
                            type="button"
                            className="flex size-[25px] items-center justify-center rounded-full border"
                            style={{ backgroundColor: bgColor }}
                            onClick={() => handleBannerCaptionTextColorChange(color)}
                            aria-label={`เลือกสีข้อความ ${bgColor}`}
                          >
                            {selected && (
                              <Check
                                className={swatchSelectedCheckClassName(bgColor)}
                                strokeWidth={4}
                              />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
                  <div className="mt-3 w-full min-w-0">
                    <div className="mb-3 flex min-w-0 items-center gap-2">
                      <MainLabel label="ตำแหน่ง" mb={0} />
                    </div>
                    <SelectLine
                      prev={() => cycleBannerCaptionEdge(-1)}
                      next={() => cycleBannerCaptionEdge(1)}
                      prevAria="ตำแหน่งก่อนหน้า"
                      nextAria="ตำแหน่งถัดไป"
                      groupAria="ตำแหน่งข้อความแบนเนอร์"
                      value={bannerCaptionEdgeLabel}
                    />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="min-w-0">
                      <MainLabel
                        label="ขนาดข้อความ"
                        value={bannerCaptionFontSize}
                        mb={0.75}
                        textColor={textColor}
                      />
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          px: 0.25,
                        }}
                        aria-label={`ขนาดข้อความพิเศษ ${bannerCaptionFontSize} พิกเซล`}
                      >
                        <div className="min-w-0 flex-1 pt-[2px] pb-[2px] px-[5px]">
                          <input
                            type="range"
                            min={BANNER_CAPTION_FONT_MIN}
                            max={BANNER_CAPTION_FONT_MAX}
                            step={1}
                            value={bannerCaptionFontSize}
                            onChange={(e) =>
                              handleBannerCaptionFontSizeChange(
                                Number(e.target.value)
                              )
                            }
                            className={THEME_RANGE_INPUT_CLASS}
                            style={{
                              ["--pos"]: `${
                                ((bannerCaptionFontSize -
                                  BANNER_CAPTION_FONT_MIN) /
                                  (BANNER_CAPTION_FONT_MAX -
                                    BANNER_CAPTION_FONT_MIN)) *
                                100
                              }%`,
                              ["--fill"]: textColor || "#0d9488",
                            }}
                          />
                        </div>
                      </Box>
                    </div>
                    <div className="min-w-0">
                      <MainLabel
                        label="ระยะห่างตัวอักษร"
                        value={bannerCaptionLetterSpacing}
                        mb={0.75}
                        textColor={textColor}
                      />
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          px: 0.25,
                        }}
                        aria-label={`ระยะห่างตัวอักษร ${bannerCaptionLetterSpacing} พิกเซล`}
                      >
                        <div className="min-w-0 flex-1 pt-[2px] pb-[2px] px-[5px]">
                          <input
                            type="range"
                            min={BANNER_LETTER_SPACING_MIN}
                            max={BANNER_LETTER_SPACING_MAX}
                            step={1}
                            value={bannerCaptionLetterSpacing}
                            onChange={(e) =>
                              handleBannerCaptionLetterSpacingChange(
                                Number(e.target.value)
                              )
                            }
                            className={THEME_RANGE_INPUT_CLASS}
                            style={{
                              ["--pos"]: `${
                                ((bannerCaptionLetterSpacing -
                                  BANNER_LETTER_SPACING_MIN) /
                                  (BANNER_LETTER_SPACING_MAX -
                                    BANNER_LETTER_SPACING_MIN)) *
                                100
                              }%`,
                              ["--fill"]: textColor || "#0d9488",
                            }}
                          />
                        </div>
                      </Box>
                    </div>
                  </div>
                  <div className="mt-3 grid w-full grid-cols-2 gap-3 px-0.25">
                    <div className="min-w-0">
                      <MainLabel
                        label="เลื่อนขึ้น - ลง"
                        value={bannerCaptionSlideVertical}
                        mb={0.75}
                        textColor={textColor}
                      />
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          px: 0.25,
                        }}
                        aria-label={`เลื่อนขึ้นลง ค่า ${bannerCaptionSlideVertical} ${
                          bannerCaptionHorizontalLayout
                            ? "ล่างสุดชิดขอบล่างรูป บนสุดชิดขอบบนรูป แนวนอนใกล้สุด/ต่ำสุดยื่นใต้หรือเหนือรูปค่อยๆ ถึง 10% กลาง 0"
                            : "ล่างสุดขอบล่างรูป บนสุดขอบบนรูป กลาง 0"
                        }`}
                      >
                        <div className="min-w-0 flex-1 pt-[2px] pb-[2px] px-[5px]">
                          <input
                            type="range"
                            min={BANNER_CAPTION_SLIDE_MIN}
                            max={BANNER_CAPTION_SLIDE_MAX}
                            step={bannerCaptionSlideVerticalStep}
                            value={bannerCaptionSlideVertical}
                            onChange={(e) =>
                              handleBannerCaptionSlideVerticalChange(
                                Number(e.target.value)
                              )
                            }
                            className={THEME_RANGE_INPUT_CLASS}
                            style={{
                              ["--pos"]: `${
                                ((bannerCaptionSlideVertical -
                                  BANNER_CAPTION_SLIDE_MIN) /
                                  (BANNER_CAPTION_SLIDE_MAX -
                                    BANNER_CAPTION_SLIDE_MIN)) *
                                100
                              }%`,
                              ["--fill"]: textColor || "#0d9488",
                            }}
                          />
                        </div>
                      </Box>
                    </div>
                    <div className="min-w-0">
                      <MainLabel
                        label="เลื่อนซ้าย - ขวา"
                        value={bannerCaptionSlideHorizontal}
                        mb={0.75}
                        textColor={textColor}
                      />
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          px: 0.25,
                        }}
                        aria-label={`เลื่อนซ้ายขวา ค่า ${bannerCaptionSlideHorizontal} ซ้ายสุดขอบซ้ายรูป ขวาสุดขอบขวารูป กลาง 0`}
                      >
                        <div className="min-w-0 flex-1 pt-[2px] pb-[2px] px-[5px]">
                          <input
                            type="range"
                            min={BANNER_CAPTION_SLIDE_MIN}
                            max={BANNER_CAPTION_SLIDE_MAX}
                            step={1}
                            value={bannerCaptionSlideHorizontal}
                            onChange={(e) =>
                              handleBannerCaptionSlideHorizontalChange(
                                Number(e.target.value)
                              )
                            }
                            className={THEME_RANGE_INPUT_CLASS}
                            style={{
                              ["--pos"]: `${
                                ((bannerCaptionSlideHorizontal -
                                  BANNER_CAPTION_SLIDE_MIN) /
                                  (BANNER_CAPTION_SLIDE_MAX -
                                    BANNER_CAPTION_SLIDE_MIN)) *
                                100
                              }%`,
                              ["--fill"]: textColor || "#0d9488",
                            }}
                          />
                        </div>
                      </Box>
                    </div>
                  </div>
                </Box>
              )}
              {layoutElementType !== "bnr" && (
              <div className="mb-3">
             <MainLabel
                label="ข้อความพิเศษ"
                mb={1.25}
                textColor={textColor}
                handleSwitch={() =>
                  handleBadgePatch({
                    hover: !Boolean(badgeMerged.hover),
                  })
                }
                checked={badgeMerged.hover}
                switchLabel="เมาส์สัมผัส"
              />
                <div className="flex items-center gap-2">
                
              
                  <Field
                    value={badgeMerged.label}
                    handleChange={(e) =>
                      handleBadgePatch({ label: e.target.value })
                    }
                    placeholder="ข้อความบนรูปภาพ - เว้นว่าง คือ ปิดการใช้งาน"
                    id="img-badge-label-input"
                    type="text"
                    className="h-10 w-full rounded-md border border-slate-200 bg-white px-2.5 py-2 text-[13px] leading-snug text-slate-800 outline-none transition placeholder:text-slate-400 dark:border-white/10 dark:bg-slate-900/80 dark:text-white/90 dark:placeholder:text-slate-500 "
                  />
                  <BTN
                    handleClick={() =>
                      handleBadgePatch({ bold: !Boolean(badgeMerged.bold) })
                    }
                    icon={{
                      Icon: Bold,
                      className: "size-4",
                      strokeWidth: 2.5,
                    }}
                    btnClass={`
                  ${btnClass2}
                  ${badgeMerged.bold ? activeClass : normalClass}
                  
                  `}
                    style={badgeMerged.bold ? btnStyle : undefined}
                  />
                </div>
                {showCarouselBadgeWarn && (
                  <p className="mt-1.5 text-[11px] leading-snug" style={{ color: "#b91c1b" }}>
                    ไม่เหมาะสม พื้นที่เล็กเกินไป
                  </p>
                )}
              </div>
              )}

              {layoutElementType !== "bnr" && (
              <>
              <div className="mb-1 grid grid-cols-2 gap-x-3 gap-y-3">
  {selectLineInputs.map((item) => {
    const {label,title,value,prevAria,nextAria,onPrev,onNext} = item 
    const groupAria = item ?.groupAria || "-"
    return(
      <div key={title}>
        <div className="mb-3 flex items-center gap-2">
          <MainLabel label={label} mb={0} />
        </div>
      <SelectLine prev={onPrev} next={onNext} prevAria={prevAria} nextAria={nextAria} groupAria={groupAria} value={value}/>
        
      </div>
    )
  })}
</div>
              <div className="mt-2 w-full rounded-md bg-white px-[0px] pb-[5px] pt-[2px] dark:bg-zinc-800">
                <div className="px-[5px] pb-2">
                  <Range
                    min={0}
                    max={255}
                    value={badgeOpacitySliderValue}
                    step={1}
                    handleChange={(e) => {
                      const v = Number(e.target.value);
                      handleBadgePatch(
                        badgeColorMode === "text"
                          ? { textOpacity: v }
                          : { backgroundOpacity: v }
                      );
                    }}
                    pos={(badgeOpacitySliderValue / 255) * 100}
                    textColor={textColor}
                  />
                </div>
                <div className="grid grid-cols-10 place-items-center gap-x-0 gap-y-[6px]">
                  {allColors.map((color, i) => {
                    const bgColor =
                      typeof color === "string"
                        ? color
                        : theme?.[color.type]?.[color.index];
                    if (bgColor == null) return null;
                    const value = color;
                    const activeValue =
                      badgeColorMode === "text"
                        ? badgeMerged.textColor
                        : badgeMerged.backgroundColor;
                    const selected =
                      lodash.isEqual(activeValue, value) ||
                      activeValue === value;
                    let margin = "";
                    if (i % 8 !== 0 && (i + 1) % 8 !== 0) {
                      margin += "mx-[65.75px] ";
                    }
                    return (
                      <div className={`${margin}`} key={i}>
                        <button
                          type="button"
                          className="flex size-[25px] items-center justify-center rounded-full border"
                          style={{ backgroundColor: bgColor }}
                          onClick={() =>
                            handleBadgePatch(
                              badgeColorMode === "text"
                                ? { textColor: value }
                                : { backgroundColor: value }
                            )
                          }
                          aria-label={`เลือกสี ${bgColor}`}
                        >
                          {selected && (
                            <Check
                              className={swatchSelectedCheckClassName(bgColor)}
                              strokeWidth={4}
                            />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
              </>
              )}
            </Box>
            )}

            {isImageHoverPanel && (
              <Box sx={{ width: "100%", px: 0.25, mt: 2 }}>
                <MainLabel
                  label={isImageOverlayPanel ? "สีพื้นหลัง" : "พื้นหลัง Hover"}
                  mb={1}
                  textColor={textColor}
                />
                <div className="w-full rounded-md bg-white px-[0px] pb-[5px] pt-[2px] dark:bg-zinc-800">
                  <div className="px-[5px] pb-2">
                    <Range
                      min={0}
                      max={255}
                      value={imageHoverBackgroundOpacity}
                      step={1}
                      handleChange={(e) =>
                        handleLinkPatch({
                          imageHoverBackgroundOpacity: Number(e.target.value) || 0,
                        })
                      }
                      pos={(imageHoverBackgroundOpacity / 255) * 100}
                      textColor={textColor}
                    />
                  </div>
                  <div className="grid grid-cols-10 place-items-center gap-x-0 gap-y-[6px]">
                    {allColors.map((color, i) => {
                      const bgColor =
                        typeof color === "string"
                          ? color
                          : theme?.[color.type]?.[color.index];
                      if (bgColor == null) return null;
                      const selected =
                        lodash.isEqual(imageHoverBackgroundColorRaw, color) ||
                        imageHoverBackgroundColorRaw === color;
                      let margin = "";
                      if (i % 8 !== 0 && (i + 1) % 8 !== 0) {
                        margin += "mx-[65.75px] ";
                      }
                      return (
                        <div className={`${margin}`} key={`img-hover-bg-${i}`}>
                          <button
                            type="button"
                            className="flex size-[25px] items-center justify-center rounded-full border"
                            style={{ backgroundColor: bgColor }}
                            onClick={() =>
                              handleLinkPatch({
                                imageHoverBackgroundColor: color,
                              })
                            }
                            aria-label={`เลือกสีพื้นหลัง Hover ${bgColor}`}
                          >
                            {selected ? (
                              <Check
                                className={swatchSelectedCheckClassName(bgColor)}
                                strokeWidth={4}
                              />
                            ) : null}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {isImageOverlayPanel && (
                  <Box sx={{ mt: 1.75 }}>
                    <MainLabel
                      label="เลื่อนขึ้น - ลง"
                      mb={1}
                      value={imageHoverContentOffsetY}
                      textColor={textColor}
                    />
                    <div className="w-full rounded-md bg-white px-[5px] pb-[5px] pt-[2px] dark:bg-zinc-800">
                      <Range
                        min={0}
                        max={100}
                        value={imageHoverContentOffsetY}
                        step={1}
                        handleChange={(e) =>
                          handleLinkPatch({
                            imageHoverContentOffsetY: Number(e.target.value) || 0,
                          })
                        }
                        pos={imageHoverContentOffsetY}
                        textColor={textColor}
                      />
                    </div>
                  </Box>
                )}
                <Box sx={{ mt: 1.75 }}>
                  <MainLabel label="องค์ประกอบอื่นๆ" mb={1} textColor={textColor} />
                  <ButtonGroup
                    fullWidth
                    variant="outlined"
                    disableElevation
                    color="inherit"
                    aria-label="องค์ประกอบอื่นๆบนพื้นหลัง"
                    sx={groupRootSx}
                  >
                    {imageHoverExtraOptions.map((opt) => {
                      const selected = imageHoverExtras.includes(opt.value);
                      return (
                        <BTN2
                          key={opt.value}
                          handleClick={() => handleImageHoverExtraToggle(opt.value)}
                          icon={
                            selected
                              ? {
                                  Icon: Check,
                                  strokeWidth: 3,
                                  className: "size-3.5 shrink-0",
                                }
                              : null
                          }
                          label={opt.label}
                          sx={groupButtonSx(selected, textColor)}
                        />
                      );
                    })}
                  </ButtonGroup>
                </Box>
              </Box>
            )}

            {!isImageHoverPanel && (isVideoPanel ? (
              <Box sx={{ width: "100%", px: 0.25, mt: 2 }}>
                <div className="mb-3 flex items-center gap-2">
                  <MainLabel label=" Embed Youtube"/>
                  <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
                </div>
                <div className="flex items-stretch overflow-hidden rounded-md border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900/80">

                  <div className="grid w-10 shrink-0 place-items-center border-r border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-800/80">
                    <Play
                      className="size-4"
                      strokeWidth={0}
                      fill="#333333"
                      color="#333333"
                      aria-hidden
                    />
                  </div>
                  <Field value={videoEmbedInputValue} handleChange={(e) => handleSrcChange(e.target.value)} placeholder="https://www.youtube.com/embed/..." id="img-badge-label-input" type="text" className="w-full bg-transparent px-2.5 py-2 text-[13px] leading-snug text-slate-800 outline-none transition placeholder:text-slate-400  dark:text-white/90 dark:placeholder:text-slate-500"/>
                </div>
              </Box>
            ) : isCarouselSlideEdit || layoutElementType === "bnr" || isListBoxItemImageEdit ? (
              <Box sx={{ width: "100%", px: 0.25, mt: 2 }}>
                <div className="mb-3 flex items-center gap-2">
                  <MainLabel label="ลิงก์ URL" mb={0} checked={linkEnabled} handleSwitch={(e) => handleLinkPatch({ linkEnabled: e.target.checked })} textColor={textColor}/>
                </div>
                {linkEnabled && (
                  <div className="space-y-2">
                    <ButtonGroup fullWidth variant="outlined" disableElevation color="inherit" aria-label="รูปแบบลิงก์" sx={groupRootSx}>
                      {[
                        { value: "url", label: "Link URL" },
                        { value: "lightbox", label: "Lightbox" },
                        { value: "video", label: "Video Youtube" },
                      ].map((opt) => {
                        const selected = slideLinkMode === opt.value;
                        return (
                          <BTN2
                            key={opt.value}
                            handleClick={() => handleLinkPatch({ slideLinkMode: opt.value })}
                            label={opt.label}
                            sx={groupButtonSx(selected, textColor)}
                          />
                        );
                      })}
                    </ButtonGroup>
                    {/* Link URL form */}
                    {slideLinkMode === "url" && (
                      <div className="space-y-1">
                        <div className="flex items-stretch overflow-hidden rounded-md border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900/80">
                          <div className="grid w-10 shrink-0 place-items-center border-r border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-800/80">
                            <Link className="size-4" strokeWidth={2.5} color="#333333" aria-hidden />
                          </div>
                          <input
                            type="text"
                            inputMode="url"
                            className="w-full bg-transparent px-2.5 py-2 text-[13px] leading-snug text-slate-800 outline-none transition placeholder:text-slate-400 dark:text-white/90 dark:placeholder:text-slate-500"
                            placeholder="h t t p s : / / w w w . l i n k . c o m"
                            value={linkUrl}
                            onChange={(e) => handleLinkPatch({ linkUrl: e.target.value })}
                            autoComplete="off"
                          />
                        </div>
                        <ButtonGroup fullWidth variant="outlined" disableElevation color="inherit" aria-label="รูปแบบลิงค์" sx={groupRootSx}>
                          {LINK_TARGET_OPTIONS.map((opt) => {
                            const selected = linkTarget === opt.value;
                            return (
                              <BTN2
                                key={opt.value}
                                handleClick={() => handleLinkPatch({ linkTarget: opt.value === "_blank" ? "_blank" : "_self" })}
                                label={opt.label}
                                sx={groupButtonSx(selected, textColor)}
                              />
                            );
                          })}
                        </ButtonGroup>
                      </div>
                    )}
                    {/* Video Youtube form */}
                    {slideLinkMode === "video" && (
                      <div className="flex items-stretch overflow-hidden rounded-md border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900/80">
                        <div className="grid w-10 shrink-0 place-items-center border-r border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-800/80">
                          <Play className="size-4" strokeWidth={0} fill="#333333" color="#333333" aria-hidden />
                        </div>
                        <input
                          type="text"
                          inputMode="url"
                          className="w-full bg-transparent px-2.5 py-2 text-[13px] leading-snug text-slate-800 outline-none transition placeholder:text-slate-400 dark:text-white/90 dark:placeholder:text-slate-500"
                          placeholder="V i d e o  E m b e d"
                          value={slideVideoEmbed}
                          onChange={(e) => handleLinkPatch({ slideVideoEmbed: e.target.value })}
                          autoComplete="off"
                        />
                      </div>
                    )}
                    {/* Lightbox: no additional form */}
                  </div>
                )}
              </Box>
            ) : showImageLink && !isListBoxItemImageEdit && (
              <Box sx={{ width: "100%", px: 0.25, mt: 2 }}>
                <div className="mb-3 flex items-center gap-2">
                  <MainLabel label="ลิงก์ URL" mb={0} checked={linkEnabled} handleSwitch={(e) => handleLinkPatch({ linkEnabled: e.target.checked })} textColor={textColor}/>
                </div>
                {linkEnabled && (
                  <div className="space-y-1">
                    <input
                      type="text"
                      inputMode="url"
                      className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-2 text-[13px] leading-snug text-slate-800 outline-none transition placeholder:text-slate-400  dark:border-white/10 dark:bg-slate-900/80 dark:text-white/90 dark:placeholder:text-slate-500 "
                      placeholder="h t t p s : / / w w w . l i n k . c o m"
                      value={linkUrl}
                      onChange={(e) =>
                        handleLinkPatch({ linkUrl: e.target.value })
                      }
                      autoComplete="off"
                    />
                    <ButtonGroup
                      fullWidth
                      variant="outlined"
                      disableElevation
                      color="inherit"
                      aria-label="รูปแบบลิงค์"
                      sx={groupRootSx}
                    >
                      {LINK_TARGET_OPTIONS.map((opt) => {
                        const {label,value} = opt
                        const selected = linkTarget === value;
                        return (
                          <Fragment key={value}>
                           
                            <BTN2 handleClick={() =>
                              handleLinkPatch({
                                linkTarget:
                                  opt.value === "_blank" ? "_blank" : "_self",
                              })} icon={selected?{
                    Icon:Check,
                    strokeWidth:3,
                    className:"size-3.5 shrink-0"
                  }:null} label={label} sx={groupButtonSx(selected, textColor)}/>

                          </Fragment>
                          
                        );
                      })}
                    </ButtonGroup>
                  </div>
                )}
              </Box>
            ))}

            {!isCarouselSlideEdit && !isCompoundListImageEdit && !isImageHoverPanel && <Box sx={{ width: "100%", px: 0.25, mt: 2, mb: 3 }}>
              <div className="grid w-full grid-cols-2 gap-x-3 gap-y-3">
                <Box sx={{ minWidth: 0 }}>
                  <MainLabel label="ระยะด้านบน" value={imageMarginTop} mb={0.35} />
                  <div className="min-w-0 px-[2px] pb-[2px] pt-[2px]">
                    <Range
                      min={0}
                      max={80}
                      step={1}
                      value={imageMarginTop}
                      handleChange={(e) =>
                        handleLinkPatch({
                          imageMarginTop: Number(e.target.value) || 0,
                        })
                      }
                      pos={(imageMarginTop / 80) * 100}
                      textColor={textColor}
                    />
                  </div>
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <MainLabel
                    label="ระยะด้านล่าง"
                    value={imageMarginBottom}
                    mb={0.35}
                  />
                  <div className="min-w-0 px-[2px] pb-[2px] pt-[2px]">
                    <Range
                      min={0}
                      max={80}
                      step={1}
                      value={imageMarginBottom}
                      handleChange={(e) =>
                        handleLinkPatch({
                          imageMarginBottom: Number(e.target.value) || 0,
                        })
                      }
                      pos={(imageMarginBottom / 80) * 100}
                      textColor={textColor}
                    />
                  </div>
                </Box>
              </div>
            </Box>}

          </li>
        </ul>
      </nav>
      <ImageModal
        openModal={pickerOpen}
        setOpenModal={setPickerOpen}
        handleChange={(url) => {
          handleSrcChange(url);
          setPickerOpen(false);
        }}
      />
    </aside>
  );
};

export default ImageElementOffcanvas;
