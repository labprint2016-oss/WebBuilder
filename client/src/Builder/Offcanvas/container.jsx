import {
  memo,
  startTransition,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getTheme } from "../../../Functions/theme";
import { panelGroupButtonSx } from "../panelControlSx";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  ButtonGroup,
  Input,
  InputAdornment,
  Box,
  Slider,
  Typography,
} from "@mui/material";
import { isNull } from "lodash";
import { Check, Monitor, Smartphone, Tablet } from "lucide-react";
import { styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import Stack from '@mui/material/Stack';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import { swatchSelectedCheckClassName } from "../Layouts/Elements/swatchCheckClass";
import { THEME_PANEL_BASIC_COLOR_SWATCHES } from "../themePanelBasicColors";
import {
  normalizeContainerOverlapFields,
  overlapFieldKeyForTab,
  overlapSliderResolvedValue,
} from "../Layouts/sectionOverlapDevice";
import Range from "../HTML/Range";
import ImageModal from "../imageModal";
import { setColor } from "../../../function";
import {
  getBuilderPanelOpenStartedAt,
  markBuilderPanelMounted,
  usePanelSliderPreview,
} from "../panelPreviewStore";

const sectionPanelPerfEnabled =
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).get("structurePerf") === "1";

/** ระยะห่าง Section ด้านบน/ล่าง: อย่างน้อย 0–200; ถ้าข้อมูลเดิมเกิน 200 จะขยาย max ของ slider ให้ลากลงมาได้ */
const SECTION_VERTICAL_PADDING_MAX = 200;

/** ปุ่มเลือกรูปแบบการแสดงผล — สไตล์เดียวกับ panel ไอคอน «รูปทรงกรอบ» */
const OPTION_CHIP_RADIUS = "0.375rem";
const CHIP_BORDER = "#e2e8f0";
const CHIP_BORDER_DARK = "rgba(255, 255, 255, 0.1)";
const CHIP_BG = "#ffffff";
const CHIP_BG_HOVER = "#f8fafc";
const CHIP_BG_DARK = "rgba(30, 41, 59, 0.9)";
const CHIP_BG_DARK_HOVER = "rgba(30, 41, 59, 1)";

const sectionLayoutGroupButtonSx = panelGroupButtonSx;

const sectionLayoutGroupRootSx = {
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

const SECTION_DISPLAY_LAYOUT_OPTIONS = [
  { value: true, label: "ความกว้างเต็มจอ" },
  { value: false, label: "ความกว้างมาตรฐาน" },
];

/** จุดไล่โทน — รูปแบบเดียวกับ panel Heading (สีข้อความ) */
const SECTION_GRADIENT_STOPS = [
  { value: "start", label: "จุดเริ่ม" },
  { value: "end", label: "จุดสิ้น" },
];

/** รูปแบบเส้นคั่นคอลัมน์ — เหมือน Heading (เส้นคั่น) */
const COLUMN_DIVIDER_STYLES = [
  { value: "solid", label: "ตรง" },
  { value: "dashed", label: "ประ" },
  { value: "dotted", label: "จุด" },
];

const FluidButtons = memo(function FluidButtons({
  value,
  textColor,
  onSelect,
}) {
  const [isFluid, setIsFluid] = useState(value === true);
  useEffect(() => {
    setIsFluid(value === true);
  }, [value]);
  return (
    <ButtonGroup
      fullWidth
      variant="outlined"
      disableElevation
      color="inherit"
      aria-label="รูปแบบการแสดงผล"
      sx={sectionLayoutGroupRootSx}
    >
      {SECTION_DISPLAY_LAYOUT_OPTIONS.map((opt) => {
        const selected = opt.value === isFluid;
        return (
          <Button
            key={String(opt.value)}
            color="inherit"
            data-perf-control={opt.label}
            onClick={() => {
              if (isFluid === opt.value) return;
              setIsFluid(opt.value);
              onSelect(opt.value);
            }}
            sx={sectionLayoutGroupButtonSx(selected, textColor)}
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
              {opt.label}
            </Box>
          </Button>
        );
      })}
    </ButtonGroup>
  );
});

const SectionGradientColorCard = memo(function SectionGradientColorCard({
  elementId,
  startOpacity,
  endOpacity,
  startSelectedValue,
  endSelectedValue,
  allColors,
  theme,
  textColor,
  onOpacity,
  onColor,
  onCommit,
}) {
  const [picker, setPicker] = useState("start");
  const gi = picker === "end" ? 1 : 0;
  const opacity = Number(gi === 1 ? endOpacity : startOpacity) || 0;
  const selectedValue = gi === 1 ? endSelectedValue : startSelectedValue;

  return (
    <>
      <ButtonGroup
        fullWidth
        variant="outlined"
        disableElevation
        color="inherit"
        aria-label="เลือกจุดไล่โทนที่แก้สี"
        sx={{ ...sectionLayoutGroupRootSx, mb: 0, mt: 0.5 }}
      >
        {SECTION_GRADIENT_STOPS.map((opt) => {
          const selected = picker === opt.value;
          return (
            <Button
              key={opt.value}
              color="inherit"
              data-perf-control={`ไล่โทน ${opt.label}`}
              onClick={() => {
                if (picker === opt.value) return;
                setPicker(opt.value);
              }}
              sx={sectionLayoutGroupButtonSx(selected, textColor)}
            >
              {opt.label}
            </Button>
          );
        })}
      </ButtonGroup>
      <Box sx={{ width: "100%", px: 0.25, pt: 0.75 }}>
        <div className="mt-2 dash-card w-full rounded-md bg-white px-[0px] pb-[5px] pt-[2px] dark:bg-zinc-800">
          <div className="px-[5px] pb-2">
            <Range
              key={`section-opacity-gradient-${elementId}-${gi}`}
              min={0}
              max={255}
              value={opacity}
              uncontrolled
              step={1}
              handleChange={(e) =>
                onOpacity(
                  "opacityColorGradient",
                  Number(e.target.value),
                  gi
                )
              }
              onCommit={onCommit}
              pos={(opacity / 255) * 100}
              color={textColor || "#0d9488"}
            />
          </div>
          <div className="grid grid-cols-10 place-items-center gap-x-0 gap-y-[6px] px-[5px] pb-0">
            {allColors.map((color, i) => {
              const bgColor =
                typeof color === "string"
                  ? color
                  : theme?.[color.type]?.[color.index];
              if (bgColor == null) return null;
              const value = color;
              let margin = "";
              if (i % 8 !== 0 && (i + 1) % 8 !== 0) {
                margin += "mx-[65.75px] ";
              }
              const selected = isSamePanelColorValue(selectedValue, value);
              return (
                <div className={margin} key={i}>
                  <button
                    type="button"
                    className="flex size-[25px] items-center justify-center rounded-full border border-slate-200 dark:border-white/15"
                    style={{ backgroundColor: bgColor }}
                    onClick={() => onColor(value, gi)}
                    aria-label={`เลือกสี ${bgColor}`}
                  >
                    {selected ? (
                      <Check
                        className={swatchSelectedCheckClassName(bgColor)}
                        strokeWidth={4}
                        aria-hidden
                      />
                    ) : null}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </Box>
    </>
  );
});

const DividerStyleButtons = memo(function DividerStyleButtons({
  value,
  textColor,
  onSelect,
}) {
  const [selected, setSelected] = useState(value || "dashed");
  useEffect(() => {
    setSelected(value || "dashed");
  }, [value]);
  return (
    <ButtonGroup
      fullWidth
      variant="outlined"
      disableElevation
      color="inherit"
      aria-label="รูปแบบเส้นคั่นคอลัมน์"
      sx={{ ...sectionLayoutGroupRootSx, mb: 0 }}
    >
      {COLUMN_DIVIDER_STYLES.map((opt) => {
        const isSelected = selected === opt.value;
        return (
          <Button
            key={opt.value}
            color="inherit"
            data-perf-control={`เส้นคั่น ${opt.label}`}
            onClick={() => {
              if (selected === opt.value) return;
              setSelected(opt.value);
              onSelect(opt.value);
            }}
            sx={{
              ...sectionLayoutGroupButtonSx(isSelected, textColor),
              minWidth: 0,
              px: 0.35,
              fontSize: 10,
            }}
          >
            {opt.label}
          </Button>
        );
      })}
    </ButtonGroup>
  );
});

const OVERLAP_DEVICE_TABS = [
  { id: "desktop", ariaLabel: "คอมพิวเตอร์", Icon: Monitor },
  { id: "tablet", ariaLabel: "แท็บเล็ต", Icon: Tablet },
  { id: "mobile", ariaLabel: "มือถือ", Icon: Smartphone },
];
const SPLIT_SECTION_PREVIEW_FIELDS = [
  "paddingTop",
  "paddingBottom",
  "isFluid",
  "sectionOverlapTop",
  "sectionOverlapTopDesktop",
  "sectionOverlapTopTablet",
  "sectionOverlapTopMobile",
];
const selectSplitSectionPreview = (value) =>
  Object.fromEntries(
    SPLIT_SECTION_PREVIEW_FIELDS.filter((key) => key in value).map((key) => [
      key,
      value[key],
    ])
  );

function isSamePanelColorValue(a, b) {
  if (Object.is(a, b)) return true;
  if (a && b && typeof a === "object" && typeof b === "object") {
    return a.type === b.type && a.index === b.index;
  }
  if (typeof a === "string" && typeof b === "string") {
    return a.toLowerCase() === b.toLowerCase();
  }
  return false;
}

function getSectionSwitchChecked(label, data) {
  if (label === "เส้นคั่นคอลัมน์") {
    return data?.noColumnGap ? false : Boolean(data?.gridBorder);
  }
  if (label === "ไม่มีช่องว่างระหว่างคอลัมน์") {
    return Boolean(data?.noColumnGap);
  }
  if (label === "เพิ่มมิติพื้นหลัง") {
    return Boolean(data?.parallaxEnabled);
  }
  return Boolean(data?.isGradient);
}

function buildSectionSwitchNext(label, data) {
  if (label === "ไม่มีช่องว่างระหว่างคอลัมน์") {
    const nextNoGap = !data.noColumnGap;
    return {
      fields: ["noColumnGap", "gridBorder"],
      next: {
        ...data,
        noColumnGap: nextNoGap,
        gridBorder: nextNoGap ? false : data.gridBorder,
      },
    };
  }
  if (label === "เส้นคั่นคอลัมน์") {
    if (data.noColumnGap) return null;
    return {
      fields: ["gridBorder"],
      next: { ...data, gridBorder: !data.gridBorder },
    };
  }
  if (label === "เพิ่มมิติพื้นหลัง") {
    return {
      fields: ["parallaxEnabled"],
      next: { ...data, parallaxEnabled: !data.parallaxEnabled },
    };
  }
  return {
    fields: ["isGradient"],
    next: { ...data, isGradient: !data.isGradient },
  };
}

function MainLabel({
  label,
  metricValue,
  compact,
  metricRef,
  data,
  onToggle,
}) {
  const w =
    label === "Padding Top"
      ? "w-[85px]"
      : label === "Padding Bottom"
        ? "w-[64px]"
        : "flex-1";
  const isBgColorLabel = [
    "สีพื้นหลังแบบสีพื้น",
    "สีพื้นหลังแบบไล่โทน",
  ].includes(label);
  const colorSwitch = [
    "สีพื้นหลังแบบสีพื้น",
    "สีพื้นหลังแบบไล่โทน",
    "เส้นคั่นคอลัมน์",
    "ไม่มีช่องว่างระหว่างคอลัมน์",
    "เพิ่มมิติพื้นหลัง",
  ].includes(label);
  const displayLabel = isBgColorLabel ? "สีพื้นหลัง" : label;
  const typography = isBgColorLabel ? "สีไล่โทน" : "";
  const showMetric =
    metricValue !== undefined &&
    metricValue !== null &&
    Number.isFinite(Number(metricValue));
  return (
    <div
      className={
        compact
          ? "mb-1 mt-0 flex items-center gap-2"
          : "mt-5 mb-2 flex items-center gap-2"
      }
    >
      <span className="dash-panel-label text-[13px] font-bold">
        {displayLabel}
      </span>
      {showMetric && (
        <span
          ref={metricRef}
          className="text-[13px] font-semibold tabular-nums text-slate-400 dark:text-slate-400"
        >
          {Math.round(Number(metricValue))}
        </span>
      )}
      <div className={`dash-heading-rule border-b ${w}`} />
      {colorSwitch && (
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <AntSwitch
            disableRipple
            inputProps={{ "aria-label": label }}
            sx={{
              "& .MuiSwitch-switchBase": { transition: "none" },
              "& .MuiSwitch-thumb": { transition: "none" },
              "& .MuiSwitch-track": { transition: "none" },
            }}
            checked={getSectionSwitchChecked(label, data)}
            onChange={() => onToggle?.(label)}
          />
          {typography ? (
            <Typography
              className="text-slate-400 dark:text-slate-400"
              sx={{ fontSize: 13 }}
            >
              {typography}
            </Typography>
          ) : null}
        </Stack>
      )}
    </div>
  );
}

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
    transition: theme.transitions.create(["width"], { duration: 200 }),
  },
  "& .MuiSwitch-track": {
    borderRadius: 8,
    opacity: 1,
    backgroundColor: "rgba(0,0,0,.25)",
    boxSizing: "border-box",
    ".dark &": { backgroundColor: "rgba(255,255,255,.25)" },
  },
}));

const ContainerOffcanvas = ({
  element,
  updateContainer: onUpdate,
  close,
  textColor,
  theme: themeProp,
}) => {
  const initialRenderStartedAtRef = useRef(
    sectionPanelPerfEnabled ? performance.now() : 0
  );
  const panelTargetId = element?.id;
  const panelOpenStartedAtRef = useRef(
    getBuilderPanelOpenStartedAt("Container", panelTargetId) ??
      window.__sectionPanelOpenPerf?.startedAt ??
      null
  );
  const mountBreakdownLoggedRef = useRef(false);
  useState(localStorage.getItem("darkTextColor"))



  const [data, setData] = useState(() =>
    normalizeContainerOverlapFields(element ?? {})
  );
  const elementRef = useRef(element);
  elementRef.current = element;
  const lastCommittedDataRef = useRef(data);
  const syncedElementIdRef = useRef(element?.id);
  const pendingChangedFieldsRef = useRef([]);
  const dividerLengthValueRef = useRef(null);
  const paddingTopValueRef = useRef(null);
  const paddingBottomValueRef = useRef(null);
  const overlapValueRef = useRef(null);
  const blurValueRef = useRef(null);
  const sectionPadNodesRef = useRef([]);
  const [loadedTheme, setLoadedTheme] = useState(null);
  const theme = themeProp || loadedTheme;
  const isFirstSection = (element?._sectionIndex ?? 0) === 0;
  const isSplitSection = Boolean(element?._isSplitSection);
  const sectionGradientDegreeValueRef = useRef(null);
  const backgroundImagePreviewRef = useRef(null);
  const backgroundImageOpacityValueRef = useRef(null);
  const [backgroundPickerOpen, setBackgroundPickerOpen] = useState(false);
  const [overlapDeviceTab, setOverlapDeviceTab] = useState("desktop");
  useLayoutEffect(() => {
    if (!mountBreakdownLoggedRef.current) {
      mountBreakdownLoggedRef.current = true;
      if (sectionPanelPerfEnabled) {
        const now = performance.now();
        console.info("[Section Panel Mount Breakdown]", {
          target: String(panelTargetId || ""),
          openToPanelCommitMs: panelOpenStartedAtRef.current
            ? Math.round((now - panelOpenStartedAtRef.current) * 100) / 100
            : null,
          panelRenderToCommitMs:
            Math.round((now - initialRenderStartedAtRef.current) * 100) / 100,
        });
      }
    }
    markBuilderPanelMounted("Container", panelTargetId);
  }, [panelTargetId]);
  const splitPreviewTargetIds =
    Array.isArray(element?._previewTargetIds) &&
    element._previewTargetIds.length > 0
      ? element._previewTargetIds
      : [element?.id];
  const escapeSectionAttr = (id) =>
    typeof CSS !== "undefined" && typeof CSS.escape === "function"
      ? CSS.escape(String(id))
      : String(id).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const findSectionCanvasRoot = (id) => {
    if (typeof document === "undefined" || !id) return null;
    const key = String(id);
    return (
      document.getElementById(key) ||
      document.querySelector(`[data-split-secid="${escapeSectionAttr(key)}"]`)
    );
  };
  const getSectionCanvasNode = () => findSectionCanvasRoot(data?.id);
  const getSectionCanvasNodes = () => {
    if (typeof document === "undefined") return [];
    const ids = [
      ...new Set(
        [data?.id, ...splitPreviewTargetIds]
          .filter(Boolean)
          .map((id) => String(id))
      ),
    ];
    return ids.map((id) => findSectionCanvasRoot(id)).filter(Boolean);
  };
  const collectSectionPadNodes = () => {
    if (sectionPadNodesRef.current.length === 0) {
      sectionPadNodesRef.current = getSectionCanvasNodes()
        .map((root) => root.querySelector("[data-section-pad]"))
        .filter(Boolean);
    }
    return sectionPadNodesRef.current;
  };
  const applySectionPaddingPreview = (field, value) => {
    const px = `${Number(value) || 0}px`;
    collectSectionPadNodes().forEach((node) => {
      node.style[field] = px;
    });
  };
  const applySectionOverlapPreview = (value) => {
    const px = Number(value) || 0;
    getSectionCanvasNodes().forEach((root) => {
      const visual = root.querySelector("[data-section-visual]");
      const pad = root.querySelector("[data-section-pad]");
      const guide = root.querySelector("[data-section-overlap-guide]");
      if (visual) {
        if (px > 0) {
          visual.style.overflow = "visible";
          visual.style.marginBottom = `-${px}px`;
        } else {
          visual.style.overflow = "";
          visual.style.marginBottom = "";
        }
      }
      if (pad) {
        pad.style.transform = px > 0 ? `translateY(-${px}px)` : "";
      }
      if (guide) {
        guide.style.bottom = `${px}px`;
      }
    });
  };
  const applySectionBackgroundOpacityPreview = (value) => {
    const opacity = String(Math.max(0, Math.min(1, Number(value) || 0)));
    getSectionCanvasNodes().forEach((root) => {
      const bg = root.querySelector("[data-section-bg]");
      if (bg) bg.style.opacity = opacity;
    });
  };
  const applySectionBackgroundColorPreview = (nextData) => {
    if (!theme || !nextData) return;
    const color = nextData.isGradient
      ? setColor(
          theme,
          nextData.backgroundColorGradient,
          nextData.opacityColorGradient,
          nextData.degrees
        )
      : setColor(theme, nextData.backgroundColor, nextData.opacityColor);
    if (!color) return;
    getSectionCanvasNodes().forEach((root) => {
      const visual = root.querySelector("[data-section-visual]");
      if (visual) visual.style.background = color;
    });
  };
  const applySectionDividerStylePreview = (style) => {
    const normalized =
      style === "dotted" ? "dotted" : style === "solid" ? "solid" : "dashed";
    getSectionCanvasNodes().forEach((root) => {
      root.style.setProperty("--section-divider-style", normalized);
      root.querySelectorAll(".column-area").forEach((node) => {
        if (node.classList.contains("border")) {
          node.style.borderStyle = `var(--section-divider-style, ${normalized})`;
        }
      });
      root.querySelectorAll("[data-section-divider-line]").forEach((node) => {
        node.style.borderRightStyle = `var(--section-divider-style, ${normalized})`;
        node.style.borderBottomStyle = `var(--section-divider-style, ${normalized})`;
      });
    });
  };
  const clearDividerCssPreview = () => {
    const node = getSectionCanvasNode();
    node?.style.removeProperty("--section-divider-length");
    node?.style.removeProperty("--section-divider-color");
    sectionPadNodesRef.current = [];
  };
  const normalizeForCommit = (value) => {
    const normalized = { ...value };
    for (const key in normalized) {
      if (normalized[key] === "") normalized[key] = 0;
    }
    return normalized;
  };
  const commitData = (latest) => {
    const normalized = normalizeForCommit(latest);
    const changedFields = pendingChangedFieldsRef.current;
    pendingChangedFieldsRef.current = [];
    lastCommittedDataRef.current = normalized;
    onUpdate(normalized, normalized.id, {
      panelChangedFields: changedFields,
    });
  };
  const {
    updateSlider,
    commitSlider,
    sliderCommitProps,
  } = usePanelSliderPreview({
    type: "section",
    targetIds: [element?.id],
    mirroredTargetIds: splitPreviewTargetIds.filter(
      (id) => String(id) !== String(element?.id)
    ),
    selectMirroredData: selectSplitSectionPreview,
    data,
    setData,
    onCommit: (latest) => {
      setData(latest);
      commitData(latest);
    },
  });
  const handleRangeCommit = (_value, reason) => {
    clearDividerCssPreview();
    commitSlider(reason || "range-commit");
  };


  useEffect(() => {
    if (themeProp) return;
    getTheme("68d37327bedb0efab7dacafb")
      .then((res) => {
        setLoadedTheme(res.data);

      })
      .catch((err) => console.log(err));
  },[themeProp]);

  const sectionPaddingSliderMax = (v) =>
    Math.max(SECTION_VERTICAL_PADDING_MAX, Number(v) || 0);
  const latestPaddingValue = (field) => {
    const live = Number(data?.[field]);
    return Number.isFinite(live) ? live : 0;
  };

  const handlePadding = (field, valueOrUpdater) => {
    pendingChangedFieldsRef.current = [field];
    const current = latestPaddingValue(field);
    let next =
      typeof valueOrUpdater === "function"
        ? valueOrUpdater(current)
        : valueOrUpdater;
    if (next === "") return;
    next = Number(next);
    if (Number.isNaN(next) || next < 0) return;
    const cap = Math.max(SECTION_VERTICAL_PADDING_MAX, Number(current) || 0);
    next = Math.min(cap, next);
    applySectionPaddingPreview(field, next);
    const labelRef =
      field === "paddingTop" ? paddingTopValueRef : paddingBottomValueRef;
    if (labelRef.current) {
      labelRef.current.textContent = String(Math.round(next));
    }
    updateSlider((prev) => ({ ...prev, [field]: next }), {
      setData: false,
      publish: false,
    });
  };

  const applySectionFluidPreview = (isFluidValue) => {
    getSectionCanvasNodes().forEach((root) => {
      const pad = root.querySelector("[data-section-pad]");
      if (!pad) return;
      pad.classList.add("w-full");
      pad.classList.toggle("max-w-[1280px]", isFluidValue !== true);
    });
  };
  const changeFluid = (value) => {
    pendingChangedFieldsRef.current = ["isFluid"];
    applySectionFluidPreview(value);
    const next = updateSlider(
      (prev) => ({ ...prev, isFluid: value }),
      { setData: false, publish: false, trackPerf: false }
    );
    startTransition(() => {
      commitData(next);
    });
  };
  const handleSectionSwitch = (label) => {
    const result = buildSectionSwitchNext(label, data);
    if (!result) return;
    pendingChangedFieldsRef.current = result.fields;
    setData(result.next);
    commitData(result.next);
  };

  const handleColor = (value,index=null) => {
    pendingChangedFieldsRef.current = [
      isNull(index) ? "backgroundColor" : "backgroundColorGradient",
    ];
    const next = { ...data };
    if (!isNull(index)) {
      const bgc = [...(data.backgroundColorGradient || [])];
      bgc[index] = value;
      next.backgroundColorGradient = bgc;
    } else {
      next.backgroundColor = value;
    }
    applySectionBackgroundColorPreview(next);
    setData(next);
    commitData(next);
  };


  const handleOpacity = (field,value,index=null) => {
    pendingChangedFieldsRef.current = [field];
    if (field === "blur" && isNull(index)) {
      const blurPx = `${Number(value) || 0}px`;
      getSectionCanvasNodes().forEach((root) => {
        const bg = root.querySelector("[data-section-bg]");
        if (bg) bg.style.filter = `blur(${blurPx})`;
      });
      if (blurValueRef.current) {
        blurValueRef.current.textContent = `${Number(value) || 0}%`;
      }
      updateSlider(
        (prev) => ({ ...prev, blur: value }),
        { publish: false, setData: false }
      );
      return;
    }
    if (field === "columnDividerOpacity" && isNull(index)) {
      const node = getSectionCanvasNode();
      const color = setColor(
        theme,
        data?.columnDividerColor ??
          THEME_PANEL_BASIC_COLOR_SWATCHES[2],
        value
      );
      if (color) {
        node?.style.setProperty("--section-divider-color", color);
      }
      updateSlider(
        (prev) => ({ ...prev, [field]: value }),
        { publish: false, setData: false }
      );
      return;
    }
    if(!isNull(index)){
      updateSlider(
        (prev) => {
          const opct = [...(prev[field] || [])];
          opct[index] = value;
          const next = { ...prev, [field]: opct };
          applySectionBackgroundColorPreview(next);
          return next;
        },
        { setData: false, publish: false }
      );
    }else{
      updateSlider(
        (prev) => {
          const next = { ...prev, [field]: value };
          applySectionBackgroundColorPreview(next);
          return next;
        },
        { setData: false, publish: false }
      );
    }
  }

  useEffect(() => {
    const currentElement = elementRef.current;
    const nextId = currentElement?.id;
    if (syncedElementIdRef.current === nextId) return;
    syncedElementIdRef.current = nextId;
    const nextData = normalizeContainerOverlapFields(currentElement ?? {});
    setData(nextData);
    lastCommittedDataRef.current = nextData;
    pendingChangedFieldsRef.current = [];
    setOverlapDeviceTab("desktop");
  }, [panelTargetId]);

  const overlapSliderValue = overlapSliderResolvedValue(
    data,
    overlapDeviceTab
  );
  const setOverlapForTab = (tab, v) => {
    const key = overlapFieldKeyForTab(tab);
    pendingChangedFieldsRef.current =
      tab === "desktop" ? [key, "sectionOverlapTop"] : [key];
    applySectionOverlapPreview(v);
    if (overlapValueRef.current) {
      overlapValueRef.current.textContent = String(Math.round(v));
    }
    updateSlider(
      (prev) => {
        const next = { ...prev, [key]: v };
        if (tab === "desktop") {
          next.sectionOverlapTop = v;
        }
        return next;
      },
      { setData: false, publish: false }
    );
  };

  /** หลังโคลนคอลัมน์บน canvas ค่า latestColID จาก parent อัปเดต — ผสมเข้า draft โดยไม่รีเซ็ตฟิลด์อื่น */
  useEffect(() => {
    if (!element?.id) return;
    const lc = element.latestColID;
    if (lc == null) return;
    setData((prev) => {
      if (!prev || prev.id !== element.id) return prev;
      if (prev.latestColID === lc) return prev;
      return { ...prev, latestColID: lc };
    });
  }, [element?.id, element?.latestColID]);

  const basicColors = THEME_PANEL_BASIC_COLOR_SWATCHES;
  /** สีเส้นคั่นเริ่มต้น = basicColors[2] เทาอ่อน (รายการก่อนสีขาว) — ตรงช่องที่ติ๊กในแผง */
  const defaultColumnDividerSwatchColor = basicColors[2];

  const allColors = useMemo(() => {
    if (!theme) return basicColors;
    return [
      ...(theme.mainColor || []).map((_, index) => ({
        type: "mainColor",
        index,
      })),
      ...(theme.textColor || []).map((_, index) => ({
        type: "textColor",
        index,
      })),
      ...(theme.otherColor || []).map((_, index) => ({
        type: "otherColor",
        index,
      })),
      ...basicColors,
    ];
  }, [basicColors, theme]);
  const colorlabels = ["สีพื้นหลังแบบสีพื้น","สีพื้นหลังแบบไล่โทน"];

  const sectionGradientDegRaw = Number(data.degrees);
  const sectionGradientDeg = Number.isFinite(sectionGradientDegRaw)
    ? Math.min(360, Math.max(0, sectionGradientDegRaw))
    : 0;

  const columnDividerStyle = data.columnDividerStyle || "dashed";
  const columnDividerOpacity = data.columnDividerOpacity ?? 255;
  const columnDividerColorVal = (() => {
    const fallback = defaultColumnDividerSwatchColor;
    let c = data.columnDividerColor ?? fallback;
    if (
      c &&
      typeof c === "object" &&
      c.type &&
      Array.isArray(theme?.[c.type]) &&
      theme[c.type].length > 0 &&
      typeof c.index === "number"
    ) {
      const max = theme[c.type].length - 1;
      if (c.index > max) c = { ...c, index: max };
    }
    return c;
  })();
  const rawColumnDividerVertLen = Number(
    data.columnDividerVerticalLengthPercent
  );
  const columnDividerVerticalLengthPct = Math.min(
    100,
    Math.max(
      10,
      Number.isFinite(rawColumnDividerVertLen)
        ? rawColumnDividerVertLen
        : 95
    )
  );

  const chipSelected = (active, chip) => isSamePanelColorValue(active, chip);




  return (
    <aside
      className="dash-panel flex h-full min-h-0 w-full flex-col overflow-hidden border-r border-slate-200 dark:border-white/10"
      style={{ contain: "layout style" }}
    >
      <div className="shrink-0 flex items-center justify-between border-b border-slate-200 dash-panel-header bg-gray-100 px-6 pt-5 pb-3 dark:border-white/10">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 font-bold tracking-wide">
            Section
          </span>
          <span
            className="inline-flex min-w-0 max-w-full items-center rounded-md border border-[#333333] bg-[#333333] px-2 py-0.5 text-[11px] font-mono font-bold leading-none text-white tabular-nums dark:border-[#333333] dark:bg-[#333333] dark:text-white"
            title={String(data.id ?? "")}
          >
            <span className="truncate">{data.id}</span>
          </span>
        </div>
        <button
          type="button"
          data-perf-control="ปิดแผง"
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-white/70"
          onClick={() => {
            commitSlider("close");
            close(null, null, null);
          }}
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
      <nav className="dash-panel flex-1 min-h-0 px-4 pb-6 overflow-y-auto w-full">
        <ul className="mt-1 pl-1">
          <li>
            {/* ระยะบน / ล่าง — Slider แบบเดียวกับ panel รูปภาพ */}
            <Box sx={{ width: "100%", px: 0.25, mt: 3 }}>
              <div className="grid w-full grid-cols-2 gap-x-3 gap-y-3">
                <Box sx={{ minWidth: 0 }}>
                  <MainLabel
                    label="ระยะห่างด้านบน"
                    metricValue={Number(data.paddingTop) || 0}
                    metricRef={paddingTopValueRef}
                    compact
                    data={data}
                    onToggle={handleSectionSwitch}
                  />
                  <div className="min-w-0 px-[2px] pb-[2px] pt-[2px]">
                    <Range
                      key={`section-padding-top-${element?.id}`}
                      min={0}
                      max={sectionPaddingSliderMax(data.paddingTop)}
                      step={1}
                      value={Number(data.paddingTop) || 0}
                      uncontrolled
                      handleChange={(e) =>
                        handlePadding(
                          "paddingTop",
                          Number(e.target.value) || 0
                        )
                      }
                      onCommit={handleRangeCommit}
                      pos={
                        ((Number(data.paddingTop) || 0) /
                          sectionPaddingSliderMax(data.paddingTop)) *
                        100
                      }
                      color={textColor}
                    />
                  </div>
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <MainLabel
                    label="ระยะห่างด้านล่าง"
                    metricValue={Number(data.paddingBottom) || 0}
                    metricRef={paddingBottomValueRef}
                    compact
                    data={data}
                    onToggle={handleSectionSwitch}
                  />
                  <div className="min-w-0 px-[2px] pb-[2px] pt-[2px]">
                    <Range
                      key={`section-padding-bottom-${element?.id}`}
                      min={0}
                      max={sectionPaddingSliderMax(data.paddingBottom)}
                      step={1}
                      value={Number(data.paddingBottom) || 0}
                      uncontrolled
                      handleChange={(e) =>
                        handlePadding(
                          "paddingBottom",
                          Number(e.target.value) || 0
                        )
                      }
                      onCommit={handleRangeCommit}
                      pos={
                        ((Number(data.paddingBottom) || 0) /
                          sectionPaddingSliderMax(data.paddingBottom)) *
                        100
                      }
                      color={textColor}
                    />
                  </div>
                </Box>
              </div>
            </Box>

            {/* ซ้อนทับ Section บน — ซ่อนสำหรับ Section แรกและ Split section */}
            {!isFirstSection && !isSplitSection && <Box sx={{ width: "100%", px: 0.25, mt: 3 }}>
              <MainLabel
                label="ซ้อนทับ Section บน"
                metricValue={overlapSliderValue}
                metricRef={overlapValueRef}
                compact
                data={data}
                onToggle={handleSectionSwitch}
              />
              <div className="mt-2">
                <ButtonGroup
                  fullWidth
                  variant="outlined"
                  disableElevation
                  color="inherit"
                  aria-label="เลือกอุปกรณ์สำหรับระยะซ้อนทับ"
                  sx={sectionLayoutGroupRootSx}
                >
                  {OVERLAP_DEVICE_TABS.map((tab) => {
                    const selected = overlapDeviceTab === tab.id;
                    const Icon = tab.Icon;
                    return (
                      <Button
                        key={tab.id}
                        color="inherit"
                        data-perf-control={`ซ้อนทับ ${tab.ariaLabel}`}
                        aria-label={tab.ariaLabel}
                        aria-pressed={selected}
                        onClick={() => setOverlapDeviceTab(tab.id)}
                        sx={{
                          ...sectionLayoutGroupButtonSx(selected, textColor),
                          minWidth: 0,
                          px: 0.5,
                        }}
                      >
                        <Icon
                          className="size-[18px] shrink-0"
                          strokeWidth={2.5}
                          aria-hidden
                        />
                      </Button>
                    );
                  })}
                </ButtonGroup>
              </div>
              <div className="min-w-0 px-[2px] pb-[2px] pt-[10px]">
                <Range
                  key={`section-overlap-${element?.id}-${overlapDeviceTab}`}
                  min={0}
                  max={300}
                  step={1}
                  value={overlapSliderValue}
                  uncontrolled
                  handleChange={(e) => {
                    const v = Number(e.target.value) || 0;
                    setOverlapForTab(overlapDeviceTab, v);
                  }}
                  onCommit={handleRangeCommit}
                  pos={(overlapSliderValue / 300) * 100}
                  color={textColor}
                />
              </div>
              {overlapSliderValue > 0 && (
                <p className="mt-1 text-[11px] leading-snug text-slate-400 dark:text-white/35">
                  เพิ่ม ระยะห่างด้านล่าง ของ Section บน เพื่อเผื่อพื้นที่ (ปรับต่ออุปกรณ์ที่เลือก)
                </p>
              )}
            </Box>}

            {/* รูปแบบการแสดงผล — ปุ่มกลุ่มแบบ panel ไอคอน «รูปทรงกรอบ» */}
            <div className="mb-3 mt-4 flex items-center gap-2">
              <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                รูปแบบการแสดงผล
              </span>
              <div className="dash-heading-rule min-w-0 flex-1 border-b" />
            </div>
            <FluidButtons
              value={data.isFluid === true}
              textColor={textColor}
              onSelect={changeFluid}
            />


              {/* BG color */}
            <MainLabel
              label={data.isGradient?colorlabels[1]:colorlabels[0]}
              data={data}
              onToggle={handleSectionSwitch}
            />

            {!data.isGradient ? (
              // Solid — รูปแบบเดียวกับ panel Heading (สีข้อความ): กล่องขาว + สไลด์ความทึบ + ตารางสี
              <Box sx={{ width: "100%", px: 0.25, pt: 0 }}>
                <div className="mt-2 dash-card w-full rounded-md bg-white px-[0px] pb-[5px] pt-[2px] dark:bg-zinc-800">
                  <div className="px-[5px] pb-2">
                    <Range
                      key={`section-opacity-solid-${element?.id}`}
                      min={0}
                      max={255}
                      value={Number(data.opacityColor) || 0}
                      uncontrolled
                      step={1}
                      handleChange={(e) =>
                        handleOpacity(
                          "opacityColor",
                          Number(e.target.value)
                        )
                      }
                      onCommit={handleRangeCommit}
                      pos={((Number(data.opacityColor) || 0) / 255) * 100}
                      color={textColor || "#0d9488"}
                    />
                  </div>
                  <div className="grid grid-cols-10 place-items-center gap-x-0 gap-y-[6px] px-[5px] pb-0">
                    {allColors.map((color, i) => {
                      const bgColor =
                        typeof color === "string"
                          ? color
                          : theme?.[color.type]?.[color.index];
                      if (bgColor == null) return null;
                      const value = color;
                      let margin = "";
                      if (i % 8 !== 0 && (i + 1) % 8 !== 0) {
                        margin += "mx-[65.75px] ";
                      }
                      const selected = isSamePanelColorValue(
                        data.backgroundColor,
                        value
                      );
                      return (
                        <div className={margin} key={i}>
                          <button
                            type="button"
                            className="flex size-[25px] items-center justify-center rounded-full border border-slate-200 dark:border-white/15"
                            style={{ backgroundColor: bgColor }}
                            onClick={() => handleColor(value)}
                            aria-label={`เลือกสี ${bgColor}`}
                          >
                            {selected ? (
                              <Check
                                className={swatchSelectedCheckClassName(
                                  bgColor
                                )}
                                strokeWidth={4}
                                aria-hidden
                              />
                            ) : null}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Box>
            ) : (
              <>
                <SectionGradientColorCard
                  elementId={element?.id}
                  startOpacity={data.opacityColorGradient?.[0]}
                  endOpacity={data.opacityColorGradient?.[1]}
                  startSelectedValue={data.backgroundColorGradient?.[0]}
                  endSelectedValue={data.backgroundColorGradient?.[1]}
                  allColors={allColors}
                  theme={theme}
                  textColor={textColor}
                  onOpacity={handleOpacity}
                  onColor={handleColor}
                  onCommit={handleRangeCommit}
                />

                <Box
                  sx={{ width: "100%", px: 0.25, mt: 1 }}
                  aria-label="องศาไล่โทน"
                >
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
                    <span
                      ref={sectionGradientDegreeValueRef}
                      className="text-slate-400 dark:text-slate-400"
                    >
                      {Math.round(sectionGradientDeg)}
                    </span>
                    <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                  </Typography>
                  <div className="w-full pt-0 pb-[2px] px-[2px]">
                    <Range
                      key={`section-gradient-degree-${element?.id}`}
                      min={0}
                      max={360}
                      step={1}
                      value={sectionGradientDeg}
                      uncontrolled
                      handleChange={(e) => {
                        const v = Number(e.target.value);
                        const nextDegrees = Math.min(
                          360,
                          Math.max(0, Number.isFinite(v) ? v : 0)
                        );
                        pendingChangedFieldsRef.current = ["degrees"];
                        if (sectionGradientDegreeValueRef.current) {
                          sectionGradientDegreeValueRef.current.textContent =
                            String(Math.round(nextDegrees));
                        }
                        updateSlider(
                          (prev) => {
                            const next = {
                              ...prev,
                              degrees: nextDegrees,
                            };
                            applySectionBackgroundColorPreview(next);
                            return next;
                          },
                          { setData: false, publish: false }
                        );
                      }}
                      onCommit={handleRangeCommit}
                      pos={(sectionGradientDeg / 360) * 100}
                      color={textColor || "#0d9488"}
                    />
                  </div>
                </Box>
              </>
            )}

<MainLabel label="ภาพพื้นหลัง" data={data} onToggle={handleSectionSwitch} />



<Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>

    <Button
      type="button"
      variant="contained"
      data-perf-control="คลังรูปภาพ"
      startIcon={<ImageOutlinedIcon />}
      onClick={(e) => {
        e.currentTarget.blur();
        requestAnimationFrame(() => setBackgroundPickerOpen(true));
      }}
      sx={{
        "& .MuiButton-startIcon > *:nth-of-type(1)": {
          fontSize: 18,
        },
        boxShadow: "none",
        "&:hover": { boxShadow: "none" },
        backgroundColor: textColor,
        fontSize: 12,
        height: 28,
      }}
    >
      คลังรูปภาพ
    </Button>


    <Button
      variant="contained"
      data-perf-control="ลบภาพพื้นหลัง"
      sx={{
        ml: "auto",
        minWidth: 48,
        px: 1.75,
        py: 0.25,
        boxShadow: "none",
        "&:hover": { boxShadow: "none" },
        backgroundColor: textColor,
        ".dark &": { backgroundColor: textColor },
        fontSize: 12,
        height: 28,
        lineHeight: 1.2,
      }}
      onClick={() => {
        pendingChangedFieldsRef.current = [
          "backgroundImage",
          "opacityImage",
        ];
        const next = { ...data, backgroundImage: "", opacityImage: 1 };
        setData(next);
        commitData(next);
      }}
      disabled={!data.backgroundImage}
    >
      ลบ
    </Button>
</Box>


   

    







    {data.backgroundImage ? (
      <div className="mt-3 w-full">
          <img
            ref={backgroundImagePreviewRef}
            src={data.backgroundImage}
            className="rounded-md"
            style={{opacity:data.opacityImage}}
          />


          <div className="mt-4 flex items-center gap-3">
  <span className="w-13 shrink-0 tracking-[0.4px] text-sm text-zinc-900 dark:text-white/80">
    โปร่งแสง
  </span>
 <input
    key={`section-background-opacity-${element?.id}-${data.backgroundImage}`}
    type="range"
    min={0}
    max={1}
    step={0.01}
    defaultValue={data.opacityImage}
    onChange={(e) => {
      const nextOpacity = Math.min(
        1,
        Math.max(0, Number(e.target.value) || 0)
      );
      e.currentTarget.style.setProperty("--pos", `${nextOpacity * 100}%`);
      if (backgroundImagePreviewRef.current) {
        backgroundImagePreviewRef.current.style.opacity = String(nextOpacity);
      }
      if (backgroundImageOpacityValueRef.current) {
        backgroundImageOpacityValueRef.current.textContent =
          `${Math.round(nextOpacity * 100)}%`;
      }
      pendingChangedFieldsRef.current = ["opacityImage"];
      applySectionBackgroundOpacityPreview(nextOpacity);
      updateSlider(
        (prev) => ({ ...prev, opacityImage: nextOpacity }),
        { setData: false, publish: false }
      );
    }}
    {...sliderCommitProps}
    className={`
    w-full cursor-pointer appearance-none h-2 rounded-full
    bg-zinc-200
    dark:bg-zinc-700


    theme-range-fill-track

    [&::-webkit-slider-runnable-track]:border-0
    [&::-moz-range-track]:border-0

    [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none
    [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
    [&::-webkit-slider-thumb]:rounded-full
    [&::-webkit-slider-thumb]:bg-emerald-300
    dark:[&::-webkit-slider-thumb]:bg-emerald-300
    [&::-webkit-slider-thumb]:bg-slate-900
    [&::-webkit-slider-thumb]:border-0

    [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4
    [&::-moz-range-thumb]:rounded-full
    [&::-moz-range-thumb]:bg-emerald-300
    [&::-moz-range-thumb]:border-0
  `}
  style={{ ['--pos']: `${data.opacityImage * 100}%` ,['--fill']:textColor,}}
  /><span
  ref={backgroundImageOpacityValueRef}
  className="w-8 shrink-0 text-right text-xs tabular-nums text-zinc-600 dark:text-zinc-400 flex items-center">
  {Math.round(data.opacityImage * 100)}%
</span></div>

<div className="mt-4 flex items-center gap-3">
  <span className="w-13 shrink-0 text-sm text-zinc-900 dark:text-white/80 text-[12px]">
    เบลอภาพ
  </span>
 <input
    key={`section-blur-${element?.id}-${data.backgroundImage}`}
    type="range"
    min={0}
    max={100}
    step={1}
    defaultValue={data.blur}
    onChange={(e) => {
      e.currentTarget.style.setProperty("--pos", `${Number(e.target.value) || 0}%`);
      handleOpacity("blur", Number(e.target.value));
    }}
    {...sliderCommitProps}
    className={`
    w-full cursor-pointer appearance-none h-2 rounded-full
    bg-zinc-200
    dark:bg-zinc-700


    theme-range-fill-track

    [&::-webkit-slider-runnable-track]:border-0
    [&::-moz-range-track]:border-0

    [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none
    [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
    [&::-webkit-slider-thumb]:rounded-full
    [&::-webkit-slider-thumb]:bg-emerald-300
    dark:[&::-webkit-slider-thumb]:bg-emerald-300
    [&::-webkit-slider-thumb]:bg-slate-900
    [&::-webkit-slider-thumb]:border-0

    [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4
    [&::-moz-range-thumb]:rounded-full
    [&::-moz-range-thumb]:bg-emerald-300
    [&::-moz-range-thumb]:border-0
  `}
  style={{ ['--pos']: `${data.blur}%` ,['--fill']:textColor,}}
  /><span
  ref={blurValueRef}
  className="w-8 shrink-0 text-right text-xs tabular-nums text-zinc-600 dark:text-zinc-400 flex items-center">
  {data.blur}%
</span></div>
 
</div>

                    
 
    ):(
      <button
        type="button"
        data-perf-control="เลือกภาพพื้นหลัง"
        className="mb-[5px] mt-3 flex min-h-[150px] w-full min-w-0 cursor-pointer items-center justify-center rounded-md border-0 bg-gray-200 px-3 py-6 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 dark:bg-zinc-800 dark:focus-visible:outline-white/30"
        onClick={() => setBackgroundPickerOpen(true)}
      >
        <span className="text-[13px] font-medium text-gray-500 dark:text-gray-400">
          ไม่มีรูปภาพ
        </span>
      </button>
    )}

            {/* เพิ่มมิติพื้นหลัง — อยู่เหนือเส้นคั่นคอลัมน์ */}
            <MainLabel
              label="เพิ่มมิติพื้นหลัง"
              data={data}
              onToggle={handleSectionSwitch}
            />

            {/* ไม่มีช่องว่างระหว่างคอลัมน์ */}
            <MainLabel
              label="ไม่มีช่องว่างระหว่างคอลัมน์"
              data={data}
              onToggle={handleSectionSwitch}
            />

            {/* เส้นคั่นคอลัมน์ */}
            {!data.noColumnGap && (
              <MainLabel
                label="เส้นคั่นคอลัมน์"
                data={data}
                onToggle={handleSectionSwitch}
              />
            )}

            {data.gridBorder && !data.noColumnGap ? (
              <Box sx={{ width: "100%", px: 0.25, pt: 0.75 }}>
                <Typography
                  component="div"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    minWidth: 0,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--dash-panel-heading, #0f172a)",
                    mb: 0.75,
                    ".dark &": { color: "var(--dash-panel-heading, #f8fafc)" },
                  }}
                >
                  <span className="shrink-0">รูปแบบเส้น</span>
                  <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                </Typography>
                <DividerStyleButtons
                  value={columnDividerStyle}
                  textColor={textColor}
                  onSelect={(style) => {
                    pendingChangedFieldsRef.current = ["columnDividerStyle"];
                    applySectionDividerStylePreview(style);
                    const next = updateSlider(
                      (prev) => ({ ...prev, columnDividerStyle: style }),
                      { setData: false, publish: false, trackPerf: false }
                    );
                    startTransition(() => {
                      commitData(next);
                    });
                  }}
                />
                <Box sx={{ width: "100%", mt: 1.5, pt: "5px" }}>
                  <Typography
                    component="div"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      minWidth: 0,
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--dash-panel-heading, #0f172a)",
                      mb: 0.35,
                      ".dark &": { color: "var(--dash-panel-heading, #f8fafc)" },
                    }}
                  >
                    <span className="shrink-0">ความยาวเส้นคั่น (ตั้ง-นอน)</span>
                    <span
                      ref={dividerLengthValueRef}
                      className="text-slate-400 dark:text-slate-400 tabular-nums"
                    >
                      {Math.round(columnDividerVerticalLengthPct)}%
                    </span>
                    <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                  </Typography>
                  <div className="w-full px-[2px] pb-[2px] pt-[2px]">
                    <Range
                      key={`section-divider-length-${element?.id}`}
                      min={10}
                      max={100}
                      step={1}
                      value={columnDividerVerticalLengthPct}
                      uncontrolled
                      handleChange={(e) => {
                        const v = Number(e.target.value);
                        pendingChangedFieldsRef.current = [
                          "columnDividerVerticalLengthPercent",
                        ];
                        const nextLength = Math.min(
                          100,
                          Math.max(10, Number.isFinite(v) ? v : 100)
                        );
                        getSectionCanvasNode()?.style.setProperty(
                          "--section-divider-length",
                          `${nextLength}%`
                        );
                        if (dividerLengthValueRef.current) {
                          dividerLengthValueRef.current.textContent =
                            `${Math.round(nextLength)}%`;
                        }
                        e.currentTarget.style.setProperty(
                          "--pos",
                          `${((nextLength - 10) / 90) * 100}%`
                        );
                        updateSlider(
                          (prev) => ({
                            ...prev,
                            columnDividerVerticalLengthPercent: nextLength,
                          }),
                          { publish: false, setData: false }
                        );
                      }}
                      onCommit={handleRangeCommit}
                      pos={
                        ((columnDividerVerticalLengthPct - 10) / (100 - 10)) *
                        100
                      }
                      color={textColor || "#0d9488"}
                    />
                  </div>
                </Box>
                <Typography
                  component="div"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    minWidth: 0,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--dash-panel-heading, #0f172a)",
                    mt: 1.5,
                    mb: 0.25,
                    ".dark &": { color: "var(--dash-panel-heading, #f8fafc)" },
                  }}
                >
                  <span className="shrink-0">สีเส้นคั่น</span>
                  <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                </Typography>
                <div className="mt-1 dash-card w-full rounded-md bg-white px-[0px] pb-[5px] pt-[2px] dark:bg-zinc-800">
                  <div className="px-[5px] pb-2">
                    <Range
                      key={`section-divider-opacity-${element?.id}`}
                      min={0}
                      max={255}
                      value={Number(columnDividerOpacity) || 0}
                      uncontrolled
                      step={1}
                      handleChange={(e) => {
                        const nextOpacity = Number(e.target.value);
                        e.currentTarget.style.setProperty(
                          "--pos",
                          `${(nextOpacity / 255) * 100}%`
                        );
                        handleOpacity(
                          "columnDividerOpacity",
                          nextOpacity
                        );
                      }}
                      onCommit={handleRangeCommit}
                      pos={
                        ((Number(columnDividerOpacity) || 0) / 255) * 100
                      }
                      color={textColor || "#0d9488"}
                    />
                  </div>
                  <div className="grid grid-cols-10 place-items-center gap-x-0 gap-y-[6px] px-[5px] pb-0">
                    {allColors.map((color, i) => {
                      const bgColor =
                        typeof color === "string"
                          ? color
                          : theme?.[color.type]?.[color.index];
                      if (bgColor == null) return null;
                      const selected = chipSelected(
                        columnDividerColorVal,
                        color
                      );
                      let margin = "";
                      if (i % 8 !== 0 && (i + 1) % 8 !== 0) {
                        margin += "mx-[65.75px] ";
                      }
                      return (
                        <div className={margin} key={i}>
                          <button
                            type="button"
                            className="flex size-[25px] items-center justify-center rounded-full border border-slate-200 dark:border-white/15"
                            style={{ backgroundColor: bgColor }}
                            onClick={() => {
                              pendingChangedFieldsRef.current = [
                                "columnDividerColor",
                              ];
                              const nextData = {
                                ...data,
                                columnDividerColor: color,
                              };
                              setData(nextData);
                              commitData(nextData);
                            }}
                            aria-label={`สีเส้นคั่น ${bgColor}`}
                          >
                            {selected ? (
                              <Check
                                className={swatchSelectedCheckClassName(
                                  bgColor
                                )}
                                strokeWidth={4}
                                aria-hidden
                              />
                            ) : null}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Box>
            ) : null}

          </li>
        </ul>
      </nav>
      {backgroundPickerOpen ? (
      <ImageModal
        openModal={backgroundPickerOpen}
        setOpenModal={setBackgroundPickerOpen}
        handleChange={(url) => {
          pendingChangedFieldsRef.current = ["backgroundImage"];
          const next = { ...data, backgroundImage: url };
          setData(next);
          commitData(next);
        }}
      />
      ) : null}
    </aside>
  );
}

export default ContainerOffcanvas;
