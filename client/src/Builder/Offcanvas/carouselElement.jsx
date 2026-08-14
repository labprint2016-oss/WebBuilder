import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Box, Button, ButtonGroup, Stack, Typography } from "@mui/material";
import Switch from "@mui/material/Switch";
import { styled } from "@mui/material/styles";
import { panelGroupButtonSx } from "../panelControlSx";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronUp,
  Minus,
  Monitor,
  Plus,
  Smartphone,
  Tablet,
  Trash2,
} from "lucide-react";
import lodash from "lodash";
import Field from "../HTML/Field";
import SelectLine from "../HTML/SelectLine";
import {
  CAROUSEL_ELEMENT_DEFAULTS,
  mergeCarouselElement,
} from "../Layouts/Elements/carouselElementConfig";
import { swatchSelectedCheckClassName } from "../Layouts/Elements/swatchCheckClass";
import { THEME_PANEL_BASIC_COLOR_SWATCHES } from "../themePanelBasicColors";
import {
  getBuilderPanelOpenStartedAt,
  markBuilderPanelMounted,
  usePanelSliderPreview,
} from "../panelPreviewStore";

const carouselPanelPerfEnabled =
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).get("carouselPerf") === "1";

/** โหมดไอเทม — ปุ่มข้อความ สไตล์เดียวกับ Section «รูปแบบการแสดงผล» (container.jsx) */
const CAROUSEL_VARIANT_OPTIONS = [
  { value: "image", label: "รูปภาพ" },
  { value: "image_text", label: "รูปภาพ + ข้อความ" },
  { value: "icon_text", label: "ไอคอน + ข้อความ" },
];

/** ความสูง 34px — stepper / per-view / ปุ่มกลุ่ม MUI ให้เท่ากัน */
const stepperBtnClass =
  "flex h-[34px] w-9 shrink-0 items-center justify-center border-0 bg-white text-[12px] font-normal text-slate-700 transition hover:bg-slate-50 dark:bg-slate-900/80 dark:text-white/90 dark:hover:bg-white/10";
const stepperMidClass =
  "flex h-[34px] min-w-0 flex-1 items-center justify-center border-x border-slate-200 bg-white px-2 text-left text-[12px] font-normal tabular-nums text-slate-800 dark:border-white/10 dark:bg-slate-900/80 dark:text-white/90";

/** ช่องกลางแบบพิมพ์ได้ — min แคบพอให้ปุ่ม ± กว้างเท่ากัน; พอแสดงเลข 2 หลัก */
const stepperMidNumericClass =
  "flex h-[34px] min-w-[2.25rem] flex-1 items-stretch justify-center border-x border-slate-200 bg-white px-0.5 dark:border-white/10 dark:bg-slate-900/80";

/** input group จำนวนไอเทมต่ออุปกรณ์ — ไอคอนเหมือน header (Desktop/Tablet/Mobile) */
const CAROUSEL_PERVIEW_INPUTS = [
  {
    id: "carousel-pv-d",
    field: "carouselPerViewDesktop",
    min: 1,
    max: 4,
    Icon: Monitor,
    deviceLabel: "เดสก์ท็อป",
  },
  {
    id: "carousel-pv-t",
    field: "carouselPerViewTablet",
    min: 1,
    max: 3,
    Icon: Tablet,
    deviceLabel: "แท็บเล็ต",
  },
  {
    id: "carousel-pv-m",
    field: "carouselPerViewMobile",
    min: 1,
    max: 2,
    Icon: Smartphone,
    deviceLabel: "มือถือ",
  },
];

const perViewIconAddonClass =
  "flex h-[34px] w-9 shrink-0 items-center justify-center border-r border-slate-200 bg-slate-50 text-slate-600 dark:border-white/10 dark:bg-slate-800/70 dark:text-white/75";

const perViewTextInputClass =
  "h-[34px] min-w-0 w-0 flex-1 border-0 bg-white px-2 pr-1 text-[12px] font-normal tabular-nums text-slate-800 outline-none ring-0 placeholder:text-slate-400 focus:outline-none dark:bg-slate-900/80 dark:text-white/90 dark:placeholder:text-white/40";

/** ปุ่มลูกศรขึ้น/ลง — ครึ่งความสูงแถว 17px รวม 34px เท่า input */
const perViewSpinnerBtnClass =
  "flex flex-1 min-h-0 w-full items-center justify-center border-0 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 disabled:pointer-events-none disabled:opacity-35 dark:bg-slate-900/80 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white/90";

/** ปุ่มลูกศรสลับลำดับไอเทม — แถวการ์ด */
const itemRowReorderBtnClass =
  "rounded p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-35 dark:hover:bg-white/10 dark:hover:text-white/80";

/** กรอกเฉพาะตัวเลข — ไม่มีลูกศร spinner (ใช้ type=text) */
function parsePerViewDigits(raw, min, max) {
  const digits = raw.replace(/[^\d]/g, "");
  if (digits === "") return null;
  const n = parseInt(digits, 10);
  if (!Number.isFinite(n)) return null;
  return Math.min(max, Math.max(min, n));
}

/** กรอกตัวเลขในช่อง stepper — clamp ตอน blur / Enter */
function parseStepperDigits(raw, min, max) {
  const digits = String(raw).replace(/[^\d]/g, "");
  if (digits === "") return null;
  const n = parseInt(digits, 10);
  if (!Number.isFinite(n)) return null;
  return Math.min(max, Math.max(min, n));
}

function NumericStepper({ value, min, max, onChange, decLabel, incLabel }) {
  const [text, setText] = useState(String(value));
  useEffect(() => {
    setText(String(value));
  }, [value]);

  const commitText = useCallback(
    (raw) => {
      const n = parseStepperDigits(raw, min, max);
      if (n === null) {
        setText(String(value));
        return;
      }
      onChange(n);
      setText(String(n));
    },
    [min, max, onChange, value]
  );

  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));
  return (
    <div className="flex w-full overflow-hidden rounded-md border border-slate-200 dark:border-white/10">
      <button
        type="button"
        className={stepperBtnClass}
        aria-label={decLabel}
        onClick={dec}
      >
        <Minus className="h-3.5 w-3.5 shrink-0" strokeWidth={2.2} />
      </button>
      <div className={stepperMidNumericClass} style={{ cursor: "text" }}>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          aria-label={`กรอกตัวเลข ${min}–${max} (หรือใช้ปุ่ม + −)`}
          size={Math.max(2, String(max).length)}
          className="box-border h-full min-h-0 w-full min-w-0 border-0 bg-transparent px-0.5 py-0 text-center text-[12px] font-normal tabular-nums leading-none text-slate-800 outline-none ring-0 dark:text-white/90"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => commitText(text)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commitText(text);
              e.currentTarget.blur();
            }
          }}
        />
      </div>
      <button
        type="button"
        className={stepperBtnClass}
        aria-label={incLabel}
        onClick={inc}
      >
        <Plus className="h-3.5 w-3.5 shrink-0" strokeWidth={2.2} />
      </button>
    </div>
  );
}

/** สไตล์ปุ่มกลุ่ม — คัดลอกจาก Panel Section (Offcanvas/container.jsx) */
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

const CAROUSEL_MARGIN_SLIDER_MAX = 80;

const CarouselMarginLabel = ({ label, value, mb = 0.35 }) => (
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
      mb,
      fontVariantNumeric: "tabular-nums",
      ".dark &": { color: "var(--dash-panel-heading, #f8fafc)" },
    }}
  >
    {label}{" "}
    <span className="text-slate-400 dark:text-slate-400">
      {Math.round(value)}
    </span>
    <div className="dash-heading-rule min-w-0 flex-1 border-b" />
  </Typography>
);

const CarouselMarginRange = ({ value, onChange, textColor }) => (
  <input
    type="range"
    min={0}
    max={CAROUSEL_MARGIN_SLIDER_MAX}
    step={1}
    defaultValue={value}
    onChange={onChange}
    className={THEME_RANGE_INPUT_CLASS}
    style={{
      ["--pos"]: `${(value / CAROUSEL_MARGIN_SLIDER_MAX) * 100}%`,
      ["--fill"]: textColor || "#0d9488",
    }}
  />
);

const CAROUSEL_NAV_COLOR_MODES = [
  { key: "active", label: "สีปุ่มหน้าแสดงผล" },
  { key: "inactive", label: "สีปุ่มหน้าอื่นๆ" },
];

/** สีปุ่มนำทาง 2 โหมด — เลื่อนซ้าย/ขวาในแถบหัวข้อ ชุดสีด้านล่างตามโหมด */
function CarouselNavDualThemeColorBlock({
  elementId,
  draft,
  setDraft,
  commit,
  textColor,
  allColors,
  theme,
  rangeClass,
}) {
  const [modeIndex, setModeIndex] = useState(0);

  useEffect(() => {
    setModeIndex(0);
  }, [elementId]);

  const mode = CAROUSEL_NAV_COLOR_MODES[modeIndex] ?? CAROUSEL_NAV_COLOR_MODES[0];
  const isInactive = mode.key === "inactive";

  const chipSelected = (active, chip) => {
    if (typeof active === "string" && typeof chip === "string") {
      return active.toLowerCase() === chip.toLowerCase();
    }
    if (
      active &&
      typeof active === "object" &&
      chip &&
      typeof chip === "object"
    ) {
      return lodash.isEqual(active, chip);
    }
    return false;
  };

  const opacityVal = isInactive
    ? Math.max(0, Math.min(255, Number(draft.carouselNavColorOpacity) || 255))
    : Math.max(0, Math.min(255, Number(draft.carouselNavActiveColorOpacity) || 255));

  const activeColor = isInactive
    ? draft.carouselNavColor
    : draft.carouselNavActiveColor;

  const opacityAriaLabel = isInactive
    ? "ความโปร่งแสงสีจุดนำทางเมื่อไม่เลือก"
    : "ความโปร่งแสงสีจุดนำทางเมื่อแสดงผล";

  const onOpacityChange = (v) => {
    const m = mergeCarouselElement({
      ...draft,
      ...(isInactive
        ? { carouselNavColorOpacity: v }
        : { carouselNavActiveColorOpacity: v }),
    });
    setDraft(m);
    commit(m);
  };

  const onPickSwatch = (value) => {
    const m = mergeCarouselElement({
      ...draft,
      ...(isInactive
        ? { carouselNavColor: value }
        : { carouselNavActiveColor: value }),
    });
    setDraft(m);
    commit(m);
  };

  const nModes = CAROUSEL_NAV_COLOR_MODES.length;
  const goPrev = () =>
    setModeIndex((i) => (i <= 0 ? nModes - 1 : i - 1));
  const goNext = () =>
    setModeIndex((i) => (i >= nModes - 1 ? 0 : i + 1));

  return (
    <div className="mt-2 dash-card w-full rounded-md bg-white px-[0px] pb-[5px] pt-[2px] dark:bg-zinc-800">
      <SelectLine prev={goPrev} next={goNext} value={mode.label} />

      <div className="px-[5px] pb-2">
        <input
          type="range"
          min={0}
          max={255}
          step={1}
          defaultValue={opacityVal}
          onChange={(e) => onOpacityChange(Number(e.target.value))}
          className={rangeClass}
          style={{
            ["--pos"]: `${(opacityVal / 255) * 100}%`,
            ["--fill"]: textColor || "#0d9488",
          }}
          aria-label={opacityAriaLabel}
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
          const selected =
            chipSelected(activeColor, value) || activeColor === value;

          let margin = "";
          if (i % 8 !== 0 && (i + 1) % 8 !== 0) {
            margin += "mx-[65.75px] ";
          }

          return (
            <div className={margin} key={`${mode.key}-${i}`}>
              <button
                type="button"
                className="flex size-[25px] items-center justify-center rounded-full border"
                style={{ backgroundColor: bgColor }}
                onClick={() => onPickSwatch(value)}
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
  );
}

const CarouselElementOffcanvas = ({
  element,
  onUpdate,
  close,
  textColor,
  theme,
}) => {
  const initialRenderStartedAtRef = useRef(
    carouselPanelPerfEnabled ? performance.now() : 0
  );
  const panelTargetId = element?.id;
  const panelOpenStartedAtRef = useRef(
    getBuilderPanelOpenStartedAt("Carousel", panelTargetId) ??
      window.__carouselPanelOpenPerf?.startedAt ??
      null
  );
  const mountBreakdownLoggedRef = useRef(false);
  /** Switch แบบ Panel Section «สีพื้นหลังแบบสีพื้น» (container.jsx MainLabel) */
  const AntSwitch = useMemo(() => {
    const accent = textColor || "#0d9488";
    return styled(Switch)(({ theme }) => ({
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
            backgroundColor: accent,
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
  }, [textColor]);

  const rangeGestureActiveRef = useRef(false);
  const draftRef = useRef(null);
  const panelDraftFrameRef = useRef(null);
  const pendingPanelDraftRef = useRef(null);
  const [draft, setDraftState] = useState(() => mergeCarouselElement(element));
  draftRef.current = draft;
  const setDraft = useCallback((update) => {
    const next =
      typeof update === "function" ? update(draftRef.current) : update;
    draftRef.current = next;
    if (!rangeGestureActiveRef.current) {
      pendingPanelDraftRef.current = next;
      if (panelDraftFrameRef.current == null) {
        panelDraftFrameRef.current = requestAnimationFrame(() => {
          panelDraftFrameRef.current = null;
          const pending = pendingPanelDraftRef.current;
          pendingPanelDraftRef.current = null;
          if (pending) setDraftState(pending);
        });
      }
    }
  }, []);
  const elementRef = useRef(element);
  elementRef.current = element;
  const layoutSyncScheduledRef = useRef(false);
  const pendingLayoutRef = useRef(null);

  useLayoutEffect(() => {
    if (!mountBreakdownLoggedRef.current) {
      mountBreakdownLoggedRef.current = true;
      if (carouselPanelPerfEnabled) {
        const now = performance.now();
        console.info("[Carousel Panel Mount Breakdown]", {
          target: String(panelTargetId || ""),
          openToPanelCommitMs: panelOpenStartedAtRef.current
            ? Math.round((now - panelOpenStartedAtRef.current) * 100) / 100
            : null,
          panelRenderToCommitMs:
            Math.round((now - initialRenderStartedAtRef.current) * 100) / 100,
          slideCount: Array.isArray(draft?.carouselSlides)
            ? draft.carouselSlides.length
            : 0,
          variant: draft?.carouselVariant,
        });
      }
    }
    markBuilderPanelMounted("Carousel", panelTargetId);
  }, [panelTargetId]);

  useEffect(() => {
    setDraft(mergeCarouselElement(element));
  }, [element]);

  useEffect(
    () => () => {
      if (panelDraftFrameRef.current != null) {
        cancelAnimationFrame(panelDraftFrameRef.current);
      }
      panelDraftFrameRef.current = null;
      pendingPanelDraftRef.current = null;
    },
    []
  );

  const scheduleLayoutSync = useCallback(
    (next) => {
      const base = elementRef.current || {};
      const changedFields = Object.keys(next || {}).filter(
        (key) => !Object.is(base?.[key], next?.[key])
      );
      pendingLayoutRef.current = {
        snapshot: next,
        changedFields,
        queuedAt: carouselPanelPerfEnabled ? performance.now() : 0,
      };
      if (layoutSyncScheduledRef.current) return;
      layoutSyncScheduledRef.current = true;
      queueMicrotask(() => {
        layoutSyncScheduledRef.current = false;
        const pending = pendingLayoutRef.current;
        pendingLayoutRef.current = null;
        if (!pending?.snapshot) return;
        const updateStartedAt = carouselPanelPerfEnabled
          ? performance.now()
          : 0;
        onUpdate?.(pending.snapshot, {
          changedFields: pending.changedFields,
        });
        if (carouselPanelPerfEnabled) {
          console.info("[Carousel Panel Perf] update", {
            target: pending.snapshot?.id,
            fields: pending.changedFields,
            queueMs:
              Math.round((updateStartedAt - pending.queuedAt) * 100) / 100,
            updateDispatchMs:
              Math.round((performance.now() - updateStartedAt) * 100) / 100,
          });
        }
      });
    },
    [onUpdate]
  );

  const { updateSlider, commitSlider } = usePanelSliderPreview({
    type: "crl",
    targetIds: [panelTargetId],
    data: draft,
    setData: setDraft,
    onCommit: (latest) => {
      setDraft(latest);
      scheduleLayoutSync(latest);
    },
  });

  const commit = useCallback(
    (next) => {
      const cleaned = mergeCarouselElement(next);
      if (rangeGestureActiveRef.current) {
        updateSlider(() => cleaned);
        return;
      }
      scheduleLayoutSync(cleaned);
    },
    [scheduleLayoutSync, updateSlider]
  );

  const slides = draft.carouselSlides || [];

  const marginTopDefault = CAROUSEL_ELEMENT_DEFAULTS.carouselMarginTop;
  const marginBottomDefault = CAROUSEL_ELEMENT_DEFAULTS.carouselMarginBottom;
  const carouselMarginTop = Number.isFinite(Number(draft.carouselMarginTop))
    ? Math.max(
        0,
        Math.min(CAROUSEL_MARGIN_SLIDER_MAX, Number(draft.carouselMarginTop))
      )
    : marginTopDefault;
  const carouselMarginBottom = Number.isFinite(
    Number(draft.carouselMarginBottom)
  )
    ? Math.max(
        0,
        Math.min(CAROUSEL_MARGIN_SLIDER_MAX, Number(draft.carouselMarginBottom))
      )
    : marginBottomDefault;

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

  return (
    <aside
      className="dash-panel flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden border-r border-slate-200 dark:border-white/10"
      style={{ color: textColor || undefined }}
      onPointerDownCapture={(event) => {
        if (
          event.target instanceof HTMLInputElement &&
          event.target.type === "range"
        ) {
          rangeGestureActiveRef.current = true;
        }
      }}
      onInputCapture={(event) => {
        if (
          event.target instanceof HTMLInputElement &&
          event.target.type === "range"
        ) {
          const min = Number(event.target.min);
          const max = Number(event.target.max);
          const value = Number(event.target.value);
          if (
            Number.isFinite(min) &&
            Number.isFinite(max) &&
            max > min &&
            Number.isFinite(value)
          ) {
            event.target.style.setProperty(
              "--pos",
              `${((value - min) / (max - min)) * 100}%`
            );
          }
        }
      }}
      onPointerUp={() => {
        if (!rangeGestureActiveRef.current) return;
        rangeGestureActiveRef.current = false;
        commitSlider("pointerup");
      }}
      onPointerCancel={() => {
        if (!rangeGestureActiveRef.current) return;
        rangeGestureActiveRef.current = false;
        commitSlider("pointercancel");
      }}
    >
      <div className="shrink-0 px-6 pt-5 pb-3 flex items-center justify-between dash-panel-header bg-gray-100">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 font-bold tracking-wide">
            Carousel
          </span>
          <span
            className="inline-flex min-w-0 max-w-full items-center rounded-md border border-[#333333] bg-[#333333] px-2 py-0.5 text-[11px] font-mono font-bold leading-none text-white tabular-nums dark:border-[#333333] dark:bg-[#333333] dark:text-white"
            title={String(element?.id ?? "")}
          >
            <span className="truncate">{element?.id}</span>
          </span>
        </div>
        <button
          type="button"
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-white/70"
          onClick={() => close?.(null, null, null)}
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
        <ul className="mt-4 pl-1 space-y-5 list-none">
          <li>
            <Stack spacing={2}>
          <Box>
            <div className="mb-3 mt-1 flex items-center gap-2">
              <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                รูปแบบไอเทม
              </span>
              <div className="dash-heading-rule min-w-0 flex-1 border-b" />
            </div>
            <ButtonGroup
              fullWidth
              variant="outlined"
              disableElevation
              color="inherit"
              aria-label="รูปแบบไอเทม"
              sx={sectionLayoutGroupRootSx}
            >
              {CAROUSEL_VARIANT_OPTIONS.map(({ value, label }) => {
                const selected = draft.carouselVariant === value;
                return (
                  <Button
                    key={value}
                    color="inherit"
                    sx={{
                      ...sectionLayoutGroupButtonSx(selected, textColor),
                      fontWeight: 400,
                    }}
                    onClick={() => {
                      const next = { ...draft, carouselVariant: value };
                      const m = mergeCarouselElement(next);
                      setDraft(m);
                      commit(m);
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "5px",
                        fontWeight: 400,
                      }}
                    >
                      {label}
                    </Box>
                  </Button>
                );
              })}
            </ButtonGroup>
          </Box>

          <Box>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="mb-3 mt-1 flex items-center gap-2">
                  <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                    จำนวนรายการ
                  </span>
                  <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                </div>
                <NumericStepper
                  value={draft.carouselItemCount}
                  min={1}
                  max={12}
                  decLabel="ลดจำนวนไอเทม"
                  incLabel="เพิ่มจำนวนไอเทม"
                  onChange={(n) => {
                    const next = { ...draft, carouselItemCount: n };
                    const m = mergeCarouselElement(next);
                    setDraft(m);
                    commit(m);
                  }}
                />
              </div>
              <div>
                <div className="mb-3 mt-1 flex items-center gap-2">
                  <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                    ระยะห่าง
                  </span>
                  <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                </div>
                <NumericStepper
                  value={draft.carouselGap}
                  min={0}
                  max={48}
                  decLabel="ลดระยะห่างระหว่างไอเทม"
                  incLabel="เพิ่มระยะห่างระหว่างไอเทม"
                  onChange={(n) => {
                    const m = mergeCarouselElement({ ...draft, carouselGap: n });
                    setDraft(m);
                    commit(m);
                  }}
                />
              </div>
              <Box sx={{ minWidth: 0 }}>
                <CarouselMarginLabel
                  label="ระยะด้านบน"
                  value={carouselMarginTop}
                  mb={0.35}
                />
                <div className="min-w-0 px-[2px] pb-[2px] pt-[2px]">
                  <CarouselMarginRange
                    value={carouselMarginTop}
                    textColor={textColor}
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      const v = Number.isFinite(n)
                        ? Math.max(0, Math.min(CAROUSEL_MARGIN_SLIDER_MAX, n))
                        : marginTopDefault;
                      const m = mergeCarouselElement({
                        ...draft,
                        carouselMarginTop: v,
                      });
                      setDraft(m);
                      commit(m);
                    }}
                  />
                </div>
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <CarouselMarginLabel
                  label="ระยะด้านล่าง"
                  value={carouselMarginBottom}
                  mb={0.35}
                />
                <div className="min-w-0 px-[2px] pb-[2px] pt-[2px]">
                  <CarouselMarginRange
                    value={carouselMarginBottom}
                    textColor={textColor}
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      const v = Number.isFinite(n)
                        ? Math.max(0, Math.min(CAROUSEL_MARGIN_SLIDER_MAX, n))
                        : marginBottomDefault;
                      const m = mergeCarouselElement({
                        ...draft,
                        carouselMarginBottom: v,
                      });
                      setDraft(m);
                      commit(m);
                    }}
                  />
                </div>
              </Box>
            </div>
          </Box>

          <Box>
            <div className="mb-3 mt-1 flex items-center gap-2">
              <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                จำนวนไอเทมที่แสดง
              </span>
              <div className="dash-heading-rule min-w-0 flex-1 border-b" />
            </div>
            <Stack direction="row" spacing={1} className="w-full">
              {CAROUSEL_PERVIEW_INPUTS.map(
                ({ id, field, min, max, Icon, deviceLabel }) => (
                  <div
                    key={id}
                    className="flex min-w-0 flex-1 overflow-hidden rounded-md border border-slate-200 dark:border-white/10"
                  >
                    <span
                      className={perViewIconAddonClass}
                      title={deviceLabel}
                      aria-hidden
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.75} />
                    </span>
                    <input
                      id={id}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="off"
                      aria-label={`จำนวนไอเทมที่แสดง — ${deviceLabel}`}
                      className={perViewTextInputClass}
                      value={String(draft[field])}
                      onChange={(e) => {
                        const nextVal = parsePerViewDigits(
                          e.target.value,
                          min,
                          max
                        );
                        if (nextVal === null) return;
                        const m = mergeCarouselElement({
                          ...draft,
                          [field]: nextVal,
                        });
                        setDraft(m);
                        commit(m);
                      }}
                    />
                    <div
                      className="flex h-[34px] w-8 shrink-0 flex-col divide-y divide-slate-200 overflow-hidden border-l border-slate-200 dark:divide-white/10 dark:border-white/10"
                      role="group"
                      aria-label={`ปรับจำนวน — ${deviceLabel}`}
                    >
                      <button
                        type="button"
                        className={perViewSpinnerBtnClass}
                        disabled={draft[field] >= max}
                        aria-label={`เพิ่มจำนวนไอเทมที่แสดง (${deviceLabel})`}
                        onClick={() => {
                          const cur = Number(draft[field]);
                          const v = Number.isFinite(cur) ? cur : min;
                          if (v >= max) return;
                          const m = mergeCarouselElement({
                            ...draft,
                            [field]: v + 1,
                          });
                          setDraft(m);
                          commit(m);
                        }}
                      >
                        <ChevronUp
                          className="h-3.5 w-3.5"
                          strokeWidth={2.25}
                          aria-hidden
                        />
                      </button>
                      <button
                        type="button"
                        className={perViewSpinnerBtnClass}
                        disabled={draft[field] <= min}
                        aria-label={`ลดจำนวนไอเทมที่แสดง (${deviceLabel})`}
                        onClick={() => {
                          const cur = Number(draft[field]);
                          const v = Number.isFinite(cur) ? cur : min;
                          if (v <= min) return;
                          const m = mergeCarouselElement({
                            ...draft,
                            [field]: v - 1,
                          });
                          setDraft(m);
                          commit(m);
                        }}
                      >
                        <ChevronDown
                          className="h-3.5 w-3.5"
                          strokeWidth={2.25}
                          aria-hidden
                        />
                      </button>
                    </div>
                  </div>
                )
              )}
            </Stack>
          </Box>


          <Box>
            <div className="mb-3 mt-1 flex items-center gap-2">
              <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                ปุ่มเลื่อน
              </span>
              <div className="dash-heading-rule min-w-0 flex-1 border-b" />
            </div>
            <ButtonGroup
              fullWidth
              variant="outlined"
              disableElevation
              color="inherit"
              sx={{ ...sectionLayoutGroupRootSx, mb: 1 }}
            >
              <Button
                color="inherit"
                sx={sectionLayoutGroupButtonSx(
                  draft.carouselNavShape === "square",
                  textColor
                )}
                onClick={() => {
                  const m = mergeCarouselElement({
                    ...draft,
                    carouselNavShape: "square",
                  });
                  setDraft(m);
                  commit(m);
                }}
              >
                เหลี่ยม
              </Button>
              <Button
                color="inherit"
                sx={sectionLayoutGroupButtonSx(
                  draft.carouselNavShape === "circle",
                  textColor
                )}
                onClick={() => {
                  const m = mergeCarouselElement({
                    ...draft,
                    carouselNavShape: "circle",
                  });
                  setDraft(m);
                  commit(m);
                }}
              >
                วงกลม
              </Button>
            </ButtonGroup>
            <div className="mb-1 mt-2">
              <CarouselNavDualThemeColorBlock
                elementId={element?.id}
                draft={draft}
                setDraft={setDraft}
                commit={commit}
                textColor={textColor}
                allColors={allColors}
                theme={theme}
                rangeClass={THEME_RANGE_INPUT_CLASS}
              />
            </div>
          </Box>

          <Box>
            <div className="mb-0 mt-1 flex items-center gap-2">
              <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                แสดงผลอัตโนมัติ
              </span>
              <div className="dash-heading-rule min-w-0 flex-1 border-b" />
              <AntSwitch
                checked={Boolean(draft.carouselAutoplay)}
                onChange={(e) => {
                  const on = e.target.checked;
                  const m = mergeCarouselElement({
                    ...draft,
                    carouselAutoplay: on,
                    ...(on ? { carouselAutoplayDelayMs: 4500 } : {}),
                  });
                  setDraft(m);
                  commit(m);
                }}
                inputProps={{
                  "aria-label":
                    "สไลด์อัตโนมัติ — ใช้บนหน้าเว็บจริง ช่วงห่าง 4.5 วินาที",
                }}
              />
            </div>
          </Box>

          <Box>
            <div className="mb-3 flex items-center gap-2">
              <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                รายการทั้งหมด
              </span>
              <div className="dash-heading-rule min-w-0 flex-1 border-b" />
            </div>
            <div className="flex flex-col gap-1.5">
              {slides.map((sl, idx) => (
                <div
                  key={idx}
                  className="min-w-0 rounded-md border border-slate-200 dark:border-white/10"
                >
                  {/* Row header */}
                  <div className="flex min-h-[36px] min-w-0 items-center gap-2 px-2 py-1">
                    {/* Badge */}
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-semibold text-white"
                      style={{ backgroundColor: "#333333" }}
                    >
                      {idx + 1}
                    </span>
                    {/* Label */}
                    <span className="min-w-0 flex-1 truncate text-[12px] text-slate-700 dark:text-white/80">
                      ไอเทมรายการที่ {idx + 1}
                    </span>
                    {/* Reorder + Delete */}
                    <div className="ml-auto flex shrink-0 items-center gap-0.5">
                      <button
                        type="button"
                        disabled={idx === 0}
                        title="เลื่อนลำดับขึ้น"
                        aria-label="เลื่อนลำดับขึ้น"
                        className={itemRowReorderBtnClass}
                        onClick={() => {
                          if (idx === 0) return;
                          const nextSlides = [...slides];
                          [nextSlides[idx - 1], nextSlides[idx]] = [
                            nextSlides[idx],
                            nextSlides[idx - 1],
                          ];
                          const m = mergeCarouselElement({
                            ...draft,
                            carouselSlides: nextSlides,
                          });
                          setDraft(m);
                          commit(m);
                        }}
                      >
                        <ArrowUp className="h-3 w-3" strokeWidth={2.25} />
                      </button>
                      <button
                        type="button"
                        disabled={idx >= slides.length - 1}
                        title="เลื่อนลำดับลง"
                        aria-label="เลื่อนลำดับลง"
                        className={itemRowReorderBtnClass}
                        onClick={() => {
                          if (idx >= slides.length - 1) return;
                          const nextSlides = [...slides];
                          [nextSlides[idx], nextSlides[idx + 1]] = [
                            nextSlides[idx + 1],
                            nextSlides[idx],
                          ];
                          const m = mergeCarouselElement({
                            ...draft,
                            carouselSlides: nextSlides,
                          });
                          setDraft(m);
                          commit(m);
                        }}
                      >
                        <ArrowDown className="h-3 w-3" strokeWidth={2.25} />
                      </button>
                      <button
                        type="button"
                        disabled={slides.length <= 1}
                        title={slides.length <= 1 ? "ต้องมีอย่างน้อย 1 ไอเทม" : "ลบไอเทมนี้"}
                        aria-label="ลบไอเทมนี้"
                        className="rounded p-0.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:pointer-events-none disabled:opacity-35 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                        onClick={() => {
                          if (slides.length <= 1) return;
                          const nextSlides = slides.filter((_, j) => j !== idx);
                          const m = mergeCarouselElement({
                            ...draft,
                            carouselSlides: nextSlides,
                            carouselItemCount: nextSlides.length,
                          });
                          setDraft(m);
                          commit(m);
                        }}
                      >
                        <Trash2 className="h-3 w-3" strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                  {/* Text variant: title + subtitle inputs */}
                  {draft.carouselVariant === "text" && (
                    <div className="flex flex-col gap-1 border-t border-slate-100 px-2 pb-2 pt-1.5 dark:border-white/10">
                      <Field
                        type="text"
                        value={sl.title ?? ""}
                        handleChange={(e) => {
                          const nextSlides = slides.map((row, j) =>
                            j === idx ? { ...row, title: e.target.value } : row
                          );
                          const m = mergeCarouselElement({
                            ...draft,
                            carouselSlides: nextSlides,
                          });
                          setDraft(m);
                          commit(m);
                        }}
                        placeholder="หัวข้อ"
                        id={`carousel-t-${idx}`}
                        className="h-8 w-full rounded border border-slate-200 bg-white px-2 text-[12px] dark:border-white/10 dark:bg-slate-900/80"
                      />
                      <Field
                        type="text"
                        value={sl.subtitle ?? ""}
                        handleChange={(e) => {
                          const nextSlides = slides.map((row, j) =>
                            j === idx ? { ...row, subtitle: e.target.value } : row
                          );
                          const m = mergeCarouselElement({
                            ...draft,
                            carouselSlides: nextSlides,
                          });
                          setDraft(m);
                          commit(m);
                        }}
                        placeholder="คำอธิบาย"
                        id={`carousel-s-${idx}`}
                        className="h-8 w-full rounded border border-slate-200 bg-white px-2 text-[12px] dark:border-white/10 dark:bg-slate-900/80"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Box>
        </Stack>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default CarouselElementOffcanvas;
