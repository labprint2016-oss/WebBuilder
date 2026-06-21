import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Button, ButtonGroup, Stack } from "@mui/material";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Monitor,
  Plus,
  Minus,
  Smartphone,
  Tablet,
  Trash2,
} from "lucide-react";
import lodash from "lodash";
import Range from "../HTML/Range";
import MainLabel from "../HTML/MainLabel";
import { swatchSelectedCheckClassName } from "../Layouts/Elements/swatchCheckClass";
import { THEME_PANEL_BASIC_COLOR_SWATCHES } from "../themePanelBasicColors";
import { mergeDataSliderElement } from "../Layouts/Elements/dataSliderElementConfig";

const ITEM_LIST_MAX = 12;
const ITEM_LIST_MIN = 1;
const stepperBtnClass =
  "flex h-[34px] w-9 shrink-0 items-center justify-center border-0 bg-white text-[12px] font-normal text-slate-700 transition hover:bg-slate-50 dark:bg-slate-900/80 dark:text-white/90 dark:hover:bg-white/10";
const stepperMidNumericClass =
  "flex h-[34px] min-w-[2.25rem] flex-1 items-stretch justify-center border-x border-slate-200 bg-white px-0.5 dark:border-white/10 dark:bg-slate-900/80";
const perViewIconAddonClass =
  "flex h-[34px] w-9 shrink-0 items-center justify-center border-r border-slate-200 bg-slate-50 text-slate-600 dark:border-white/10 dark:bg-slate-800/70 dark:text-white/75";
const perViewTextInputClass =
  "h-[34px] min-w-0 w-0 flex-1 border-0 bg-white px-2 pr-1 text-[12px] font-normal tabular-nums text-slate-800 outline-none ring-0 placeholder:text-slate-400 focus:outline-none dark:bg-slate-900/80 dark:text-white/90 dark:placeholder:text-white/40";
const perViewSpinnerBtnClass =
  "flex flex-1 min-h-0 w-full items-center justify-center border-0 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 disabled:pointer-events-none disabled:opacity-35 dark:bg-slate-900/80 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white/90";
const CAROUSEL_PERVIEW_INPUTS = [
  {
    id: "data-slider-pv-d",
    field: "dataSliderPerViewDesktop",
    min: 1,
    max: 4,
    Icon: Monitor,
    deviceLabel: "เดสก์ท็อป",
  },
  {
    id: "data-slider-pv-t",
    field: "dataSliderPerViewTablet",
    min: 1,
    max: 3,
    Icon: Tablet,
    deviceLabel: "แท็บเล็ต",
  },
  {
    id: "data-slider-pv-m",
    field: "dataSliderPerViewMobile",
    min: 1,
    max: 2,
    Icon: Smartphone,
    deviceLabel: "มือถือ",
  },
];

function parsePerViewDigits(raw, min, max) {
  const digits = String(raw).replace(/[^\d]/g, "");
  if (digits === "") return null;
  const n = parseInt(digits, 10);
  if (!Number.isFinite(n)) return null;
  return Math.min(max, Math.max(min, n));
}

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

const OPTION_CHIP_RADIUS = "0.375rem";
const CHIP_BORDER = "#e2e8f0";
const CHIP_BORDER_DARK = "rgba(255, 255, 255, 0.1)";
const CHIP_BG = "#ffffff";
const CHIP_BG_HOVER = "#f8fafc";
const CHIP_BG_DARK = "rgba(30, 41, 59, 0.9)";
const CHIP_BG_DARK_HOVER = "rgba(30, 41, 59, 1)";

const sectionLayoutGroupButtonSx = (selected, accent) => {
  const a = accent || "#0d9488";
  return {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    minHeight: 34,
    py: 0,
    px: 0.5,
    textTransform: "none",
    lineHeight: 1.2,
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

const chipSelected = (active, chip) => {
  if (active && typeof active === "object" && chip && typeof chip === "object") {
    return lodash.isEqual(active, chip);
  }
  if (typeof active === "string" && typeof chip === "string") {
    return active.toLowerCase() === chip.toLowerCase();
  }
  return false;
};

const DataSliderElementOffcanvas = ({
  element,
  onUpdate,
  close,
  textColor = "#0d9488",
  theme,
}) => {
  const layoutSyncRafRef = useRef(0);
  const pendingRef = useRef(null);
  const elementRef = useRef(element);
  elementRef.current = element;

  const scheduleLayoutSync = useCallback(
    (next) => {
      const base = elementRef.current || {};
      const merged = {
        ...base,
        ...next,
        type: next?.type ?? base?.type ?? "dts",
        id: next?.id != null ? next.id : base?.id,
      };
      pendingRef.current = lodash.cloneDeep(merged);
      if (layoutSyncRafRef.current) cancelAnimationFrame(layoutSyncRafRef.current);
      layoutSyncRafRef.current = requestAnimationFrame(() => {
        layoutSyncRafRef.current = 0;
        const snapshot = pendingRef.current;
        pendingRef.current = null;
        if (snapshot) onUpdate?.(snapshot);
      });
    },
    [onUpdate]
  );

  const [data, setData] = useState(() => mergeDataSliderElement(element));

  useEffect(() => {
    setData(mergeDataSliderElement(element));
  }, [element]);

  useEffect(
    () => () => {
      if (layoutSyncRafRef.current) cancelAnimationFrame(layoutSyncRafRef.current);
    },
    []
  );

  const patch = (partial) => {
    setData((prev) => {
      const merged = mergeDataSliderElement({ ...prev, ...partial });
      scheduleLayoutSync(merged);
      return merged;
    });
  };

  const patchItems = (updater) => {
    setData((prev) => {
      const mergedPrev = mergeDataSliderElement(prev);
      const current = Array.isArray(mergedPrev.dataSliderItems)
        ? mergedPrev.dataSliderItems
        : [];
      const nextItems = updater(current);
      const merged = mergeDataSliderElement({
        ...mergedPrev,
        dataSliderItems: nextItems,
        dataSliderItemCount: nextItems.length,
      });
      scheduleLayoutSync(merged);
      return merged;
    });
  };

  const addItem = () => {
    patchItems((current) => {
      if (current.length >= ITEM_LIST_MAX) return current;
      const idx = current.length + 1;
      return [
        ...current,
        { id: `slide-${Date.now()}-${idx}`, label: `Slide ${idx}`, disabled: false, elements: [] },
      ];
    });
  };

  const removeItem = (itemId) => {
    patchItems((current) => {
      if (current.length <= ITEM_LIST_MIN) return current;
      return current.filter((it) => it.id !== itemId);
    });
  };

  const duplicateItem = (itemId) => {
    patchItems((current) => {
      if (current.length >= ITEM_LIST_MAX) return current;
      const idx = current.findIndex((it) => it.id === itemId);
      if (idx === -1) return current;
      const src = lodash.cloneDeep(current[idx]);
      const next = [...current];
      next.splice(idx + 1, 0, {
        ...src,
        id: `slide-${Date.now()}-${idx + 1}`,
        label:
          typeof src?.label === "string" && src.label.trim() !== ""
            ? `${src.label} (copy)`
            : `Slide ${idx + 2}`,
      });
      return next;
    });
  };

  const items = data.dataSliderItems || [];
  const activeId = items.some((it) => it.id === data.dataSliderActiveId)
    ? data.dataSliderActiveId
    : items[0]?.id;
  const navShape = data?.dataSliderNavShape === "circle" ? "circle" : "square";
  const marginTop = Math.max(0, Math.min(80, Number(data?.dataSliderMarginTop) || 8));
  const marginBottom = Math.max(0, Math.min(80, Number(data?.dataSliderMarginBottom) || 8));
  const navColorOpacity = Math.max(
    0,
    Math.min(255, Number(data?.dataSliderNavColorOpacity) || 255)
  );
  const navActiveColorOpacity = Math.max(
    0,
    Math.min(255, Number(data?.dataSliderNavActiveColorOpacity) || 255)
  );

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
    return [...mc, ...tc, ...oc, ...THEME_PANEL_BASIC_COLOR_SWATCHES];
  }, [theme]);

  return (
    <aside className="flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden bg-white dark:bg-gray-900/80 border-r border-slate-200 dark:border-white/10">
      <div className="shrink-0 px-6 pt-5 pb-3 flex items-center justify-between bg-gray-100 dark:bg-gray-900/50">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 font-bold tracking-wide text-slate-800 dark:text-white/90">
            Data Slider
          </span>
          <span className="inline-flex min-w-0 max-w-full items-center rounded-md border border-[#333333] bg-[#333333] px-2 py-0.5 text-[11px] font-mono font-bold leading-none text-white tabular-nums">
            <span className="truncate">{data?.id}</span>
          </span>
        </div>
        <button
          type="button"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-white/70"
          onClick={() => close(null, null, null)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <path fillRule="evenodd" d="M15.78 4.22a.75.75 0 010 1.06L10.06 11l5.72 5.72a.75.75 0 11-1.06 1.06l-6.25-6.25a.75.75 0 010-1.06l6.25-6.25a.75.75 0 011.06 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain px-4 pb-8 w-full">
        <ul className="mt-4 pl-1 space-y-5">
          <li>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="mb-3 mt-1 flex items-center gap-2">
                  <span className="shrink-0 text-[13px] font-semibold text-slate-700 dark:text-white/80">
                    จำนวนรายการ
                  </span>
                  <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
                </div>
                <NumericStepper
                  value={data.dataSliderItemCount}
                  min={1}
                  max={12}
                  decLabel="ลดจำนวนไอเทม"
                  incLabel="เพิ่มจำนวนไอเทม"
                  onChange={(n) => patch({ dataSliderItemCount: n })}
                />
              </div>
              <div>
                <div className="mb-3 mt-1 flex items-center gap-2">
                  <span className="shrink-0 text-[13px] font-semibold text-slate-700 dark:text-white/80">
                    ระยะห่าง
                  </span>
                  <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
                </div>
                <NumericStepper
                  value={Math.max(0, Number(data.dataSliderGap) || 0)}
                  min={0}
                  max={48}
                  decLabel="ลดระยะห่างระหว่างไอเทม"
                  incLabel="เพิ่มระยะห่างระหว่างไอเทม"
                  onChange={(n) => patch({ dataSliderGap: n })}
                />
              </div>
            </div>
          </li>

          <li>
            <div className="mb-3 mt-1 flex items-center gap-2">
              <span className="shrink-0 text-[13px] font-semibold text-slate-700 dark:text-white/80">
                จำนวนไอเทมที่แสดง
              </span>
              <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
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
                      value={String(data[field])}
                      onChange={(e) => {
                        const nextVal = parsePerViewDigits(
                          e.target.value,
                          min,
                          max
                        );
                        if (nextVal === null) return;
                        patch({ [field]: nextVal });
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
                        disabled={data[field] >= max}
                        aria-label={`เพิ่มจำนวนไอเทมที่แสดง (${deviceLabel})`}
                        onClick={() => {
                          const cur = Number(data[field]);
                          const v = Number.isFinite(cur) ? cur : min;
                          if (v >= max) return;
                          patch({ [field]: v + 1 });
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
                        disabled={data[field] <= min}
                        aria-label={`ลดจำนวนไอเทมที่แสดง (${deviceLabel})`}
                        onClick={() => {
                          const cur = Number(data[field]);
                          const v = Number.isFinite(cur) ? cur : min;
                          if (v <= min) return;
                          patch({ [field]: v - 1 });
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
          </li>

          <li>
            <div className="mb-2 mt-1 flex items-center gap-2">
              <span className="shrink-0 text-[13px] font-semibold text-slate-700 dark:text-white/80">
                ปุ่มเลื่อน
              </span>
              <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
            </div>
            <ButtonGroup
              fullWidth
              variant="outlined"
              disableElevation
              color="inherit"
              sx={sectionLayoutGroupRootSx}
            >
              <Button
                color="inherit"
                sx={sectionLayoutGroupButtonSx(navShape === "square", textColor)}
                onClick={() => patch({ dataSliderNavShape: "square" })}
              >
                เหลี่ยม
              </Button>
              <Button
                color="inherit"
                sx={sectionLayoutGroupButtonSx(navShape === "circle", textColor)}
                onClick={() => patch({ dataSliderNavShape: "circle" })}
              >
                วงกลม
              </Button>
            </ButtonGroup>
          </li>

          <li>
            <MainLabel label="สีปุ่มหน้าแสดงผล" mb={0.5} />
            <Range
              min={0}
              max={255}
              step={1}
              value={navActiveColorOpacity}
              handleChange={(e) =>
                patch({
                  dataSliderNavActiveColorOpacity: Number(e.target.value) || 255,
                })
              }
              pos={(navActiveColorOpacity / 255) * 100}
              color={textColor}
            />
            <div className="mt-2 grid grid-cols-10 place-items-center gap-x-0 gap-y-[6px]">
              {allColors.map((color, i) => {
                const bgColor =
                  typeof color === "string" ? color : theme?.[color.type]?.[color.index];
                if (bgColor == null) return null;
                const selected = chipSelected(data?.dataSliderNavActiveColor, color);
                return (
                  <button
                    key={`active-${i}`}
                    type="button"
                    className="flex size-[25px] items-center justify-center rounded-full border border-slate-200 dark:border-white/15"
                    style={{ backgroundColor: bgColor }}
                    onClick={() => patch({ dataSliderNavActiveColor: color })}
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
                );
              })}
            </div>
          </li>

          <li>
            <MainLabel label="สีปุ่มหน้าอื่นๆ" mb={0.5} />
            <Range
              min={0}
              max={255}
              step={1}
              value={navColorOpacity}
              handleChange={(e) =>
                patch({
                  dataSliderNavColorOpacity: Number(e.target.value) || 255,
                })
              }
              pos={(navColorOpacity / 255) * 100}
              color={textColor}
            />
            <div className="mt-2 grid grid-cols-10 place-items-center gap-x-0 gap-y-[6px]">
              {allColors.map((color, i) => {
                const bgColor =
                  typeof color === "string" ? color : theme?.[color.type]?.[color.index];
                if (bgColor == null) return null;
                const selected = chipSelected(data?.dataSliderNavColor, color);
                return (
                  <button
                    key={`inactive-${i}`}
                    type="button"
                    className="flex size-[25px] items-center justify-center rounded-full border border-slate-200 dark:border-white/15"
                    style={{ backgroundColor: bgColor }}
                    onClick={() => patch({ dataSliderNavColor: color })}
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
                );
              })}
            </div>
          </li>

          <li>
            <div className="grid w-full grid-cols-2 gap-x-3 gap-y-4 px-0.5">
              <div className="min-w-0">
                <MainLabel label={`ระยะด้านบน ${marginTop}`} mb={0.4} />
                <Range
                  min={0}
                  max={80}
                  step={1}
                  value={marginTop}
                  handleChange={(e) =>
                    patch({ dataSliderMarginTop: Number(e.target.value) || 0 })
                  }
                  pos={(marginTop / 80) * 100}
                  color={textColor}
                />
              </div>
              <div className="min-w-0">
                <MainLabel label={`ระยะด้านล่าง ${marginBottom}`} mb={0.4} />
                <Range
                  min={0}
                  max={80}
                  step={1}
                  value={marginBottom}
                  handleChange={(e) =>
                    patch({ dataSliderMarginBottom: Number(e.target.value) || 0 })
                  }
                  pos={(marginBottom / 80) * 100}
                  color={textColor}
                />
              </div>
            </div>
          </li>

          <li>
            <div className="mb-3 mt-1 flex items-center gap-2">
              <span className="shrink-0 text-[13px] font-semibold text-slate-700 dark:text-white/80">
                รายการทั้งหมด
              </span>
              <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
              <button
                type="button"
                disabled={items.length >= ITEM_LIST_MAX}
                title={items.length >= ITEM_LIST_MAX ? "ถึงจำนวนสูงสุดแล้ว (12)" : "เพิ่มสไลด์"}
                className="inline-flex min-h-[26px] shrink-0 items-center justify-center rounded-md px-2 py-1 text-[12px] font-medium leading-snug text-white transition hover:opacity-90 disabled:pointer-events-none disabled:opacity-35"
                style={{ backgroundColor: "#333333" }}
                onClick={addItem}
              >
                เพิ่มสไลด์
              </button>
            </div>
            <Stack spacing={1}>
              {items.map((item, idx) => {
                const isActive = item.id === activeId;
                return (
                  <div
                    key={item.id}
                    className="min-w-0 rounded-md border border-slate-200 dark:border-white/10"
                  >
                    <div className="flex min-h-[36px] min-w-0 items-center gap-2 px-2 py-1">
                      <button
                        type="button"
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-semibold text-white"
                        style={{ backgroundColor: "#333333" }}
                        title={
                          isActive
                            ? "สไลด์นี้กำลังแสดงผลบนแคนวาส"
                            : "เลือกสไลด์นี้เป็นสไลด์แสดงผลบนแคนวาส"
                        }
                        aria-pressed={isActive}
                        onClick={() => patch({ dataSliderActiveId: item.id })}
                      >
                        {isActive ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : idx + 1}
                      </button>
                      <span className="min-w-0 flex-1 truncate text-[12px] text-slate-700 dark:text-white/80">
                        รายการที่ {idx + 1}
                      </span>
                      <div className="ml-auto flex shrink-0 items-center gap-0.5">
                        <button
                          type="button"
                          disabled={idx === 0}
                          title="เลื่อนลำดับขึ้น"
                          aria-label="เลื่อนลำดับขึ้น"
                          className="rounded p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-35 dark:hover:bg-white/10 dark:hover:text-white/80"
                          onClick={() => {
                            if (idx === 0) return;
                            patchItems((current) => {
                              const next = [...current];
                              [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                              return next;
                            });
                          }}
                        >
                          <ArrowUp className="h-3 w-3" strokeWidth={2.25} />
                        </button>
                        <button
                          type="button"
                          disabled={idx >= items.length - 1}
                          title="เลื่อนลำดับลง"
                          aria-label="เลื่อนลำดับลง"
                          className="rounded p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-35 dark:hover:bg-white/10 dark:hover:text-white/80"
                          onClick={() => {
                            if (idx >= items.length - 1) return;
                            patchItems((current) => {
                              const next = [...current];
                              [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
                              return next;
                            });
                          }}
                        >
                          <ArrowDown className="h-3 w-3" strokeWidth={2.25} />
                        </button>
                        <button
                          type="button"
                          disabled={items.length >= ITEM_LIST_MAX}
                          title={
                            items.length >= ITEM_LIST_MAX
                              ? "ถึงจำนวนสูงสุดแล้ว (12)"
                              : "คัดลอกหน้า"
                          }
                          aria-label="คัดลอกหน้า"
                          className="rounded p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-35 dark:hover:bg-white/10 dark:hover:text-white/80"
                          onClick={() => duplicateItem(item.id)}
                        >
                          <Copy className="h-3.5 w-3.5" strokeWidth={2} />
                        </button>
                        <button
                          type="button"
                          disabled={items.length <= ITEM_LIST_MIN}
                          title={items.length <= ITEM_LIST_MIN ? "ต้องมีอย่างน้อย 1 สไลด์" : "ลบสไลด์นี้"}
                          className="rounded p-0.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:pointer-events-none disabled:opacity-35 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </Stack>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default DataSliderElementOffcanvas;
