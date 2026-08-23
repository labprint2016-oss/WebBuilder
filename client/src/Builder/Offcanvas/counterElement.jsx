import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Button, ButtonGroup, Switch, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Check,
} from "lucide-react";
import lodash from "lodash";
import Range, { applyRangeFillPos } from "../HTML/Range";
import SelectLine from "../HTML/SelectLine";
import { swatchSelectedCheckClassName } from "../Layouts/Elements/swatchCheckClass";
import { THEME_PANEL_BASIC_COLOR_SWATCHES } from "../themePanelBasicColors";
import {
  COUNTER_ELEMENT_DEFAULTS,
  mergeCounterElement,
} from "../Layouts/Elements/counterElementConfig";
import { PANEL_BTN_GROUP, panelGroupButtonSx } from "../panelControlSx";
import { usePanelSliderPreview } from "../panelPreviewStore";

const finiteNumberOr = (value, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

/** กล่อง input group — พื้นหลัง/กรอบตาม Dashboard (dash-input) */
const INPUT_GROUP_CLASS =
  "dash-input flex h-10 min-w-0 flex-1 items-stretch overflow-hidden rounded-md border border-slate-200 bg-white text-left dark:border-white/10 dark:bg-[#27272a]";

/** ครึ่งซ้าย–ขวาในกล่อง */
const INPUT_GROUP_HALF_CLASS =
  "flex min-w-0 min-h-0 flex-1 items-stretch border-slate-200 first:border-r dark:border-white/10";

/** ป้าย addon ด้านหน้าช่องตัวเลข */
const INPUT_GROUP_ADDON_CLASS =
  "flex w-[4.85rem] shrink-0 flex-col items-center justify-center gap-0.5 bg-transparent px-2 py-1.5 text-center text-[11px] font-semibold leading-tight tracking-tight";

/** เส้นแบ่งระหว่างป้ายกับช่องพิมพ์ */
const INPUT_GROUP_ADDON_DIVIDER = "border-r border-slate-200 dark:border-white/10";

/** ตัวเลขในกล่อง */
const INPUT_GROUP_INPUT_CLASS =
  "min-h-0 min-w-0 flex-1 border-0 bg-transparent px-2.5 py-2 text-[13px] tabular-nums leading-snug text-slate-800 outline-none placeholder:text-slate-400 focus-visible:outline-none dark:text-white/90 dark:placeholder:text-slate-500";

/** ข้อความทั่วไปในกล่อง (ความประกอบ) — ไม่บังคับ tabular-nums */
const INPUT_GROUP_TEXT_INPUT_CLASS = INPUT_GROUP_INPUT_CLASS.replace(
  "tabular-nums ",
  ""
);

/** ป้าย addon สำหรับด้านซ้าย/ขวา */
const COMPOSITION_ADDON_CLASS =
  "flex w-[5.35rem] shrink-0 flex-col items-center justify-center gap-0.5 bg-transparent px-2 py-1.5 text-center text-[11px] font-semibold leading-tight tracking-tight";

const ADDON_LABEL_STYLE = {
  color: "var(--dash-panel-btn-group-inactive-text, #64748b)",
};

const optionChipStyle = (selected) =>
  selected
    ? {
        backgroundColor: PANEL_BTN_GROUP.active,
        color: PANEL_BTN_GROUP.activeText,
        borderColor: PANEL_BTN_GROUP.border,
        boxShadow: "0 1px 2px rgb(0 0 0 / 0.12)",
      }
    : {
        backgroundColor: PANEL_BTN_GROUP.inactive,
        color: PANEL_BTN_GROUP.inactiveText,
        borderColor: PANEL_BTN_GROUP.border,
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

/** Switch แบบ Section อื่นใน Offcanvas — เหมือน headingElement HeadingPanelAntSwitch */
const CounterPanelAntSwitch = styled(Switch, {
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

const BOLD_BTN_BASE =
  "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border transition outline-none focus-visible:ring-2 focus-visible:ring-slate-400/60 dark:focus-visible:ring-white/25";

const OPTION_CHIP_RADIUS = "0.375rem";

const groupButtonSx = panelGroupButtonSx;

const groupRootSx = {
  width: "100%",
  boxShadow: "none",
  "& .MuiButton-root": { boxShadow: "none" },
  "& .MuiButtonGroup-grouped": { borderRadius: "0 !important" },
  "& .MuiButtonGroup-grouped:first-of-type": {
    borderTopLeftRadius: `${OPTION_CHIP_RADIUS} !important`,
    borderBottomLeftRadius: `${OPTION_CHIP_RADIUS} !important`,
  },
  "& .MuiButtonGroup-grouped:last-of-type": {
    borderTopRightRadius: `${OPTION_CHIP_RADIUS} !important`,
    borderBottomRightRadius: `${OPTION_CHIP_RADIUS} !important`,
  },
};

const COUNTER_ROW_DIVIDER_STYLE_OPTIONS = [
  { value: "solid", label: "ตรง" },
  { value: "dashed", label: "ประ" },
  { value: "dotted", label: "จุด" },
];

const COUNTER_COLOR_MODES_BASE = [{ value: "text", label: "สีข้อความ" }];
const COUNTER_COLOR_MODE_DIVIDER = { value: "divider", label: "สีเส้นคั่น" };

const MainLabel = ({
  label,
  mb = 0.75,
  value = null,
  checked = null,
  handleSwitch = null,
  color = null,
  switchLabel = "",
}) => (
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
    {value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value)) ? (
      <span className="text-slate-400 dark:text-slate-400">{Math.round(Number(value))}</span>
    ) : null}
    <div className="dash-heading-rule min-w-0 flex-1 border-b" />
    {typeof checked === "boolean" && typeof handleSwitch === "function" ? (
      <span className="inline-flex shrink-0 items-center gap-1.5">
        <CounterPanelAntSwitch
          className="shrink-0"
          accentColor={color || "#0d9488"}
          checked={checked}
          onChange={handleSwitch}
          inputProps={{ "aria-label": String(label || "") }}
        />
        {switchLabel ? (
          <span className="text-[11px] font-normal text-slate-500 dark:text-white/55">
            {switchLabel}
          </span>
        ) : null}
      </span>
    ) : null}
  </Typography>
);

const FullWidthRangeRow = ({
  mainLabel,
  valueForLabel,
  min,
  max,
  step = 1,
  value,
  onChange,
  onCommit,
  posPct,
  trackAriaLabel,
  accentColor,
  mt = 0,
  labelMb = 0.25,
  formatLabelValue = null,
}) => {
  const valueTextRef = useRef(null);
  const rangeInputRef = useRef(null);
  const writeLabel = (nextValue) => {
    if (valueTextRef.current && !isNaN(nextValue)) {
      valueTextRef.current.textContent = formatLabelValue
        ? formatLabelValue(nextValue)
        : String(Math.round(nextValue));
    }
  };
  const handleRangeChange = (nextValue) => {
    const el = rangeInputRef.current;
    if (el) applyRangeFillPos(el, min, max);
    writeLabel(nextValue);
    onChange(nextValue);
  };
  return (
  <Box sx={{ width: "100%", px: 0.25, mt }} aria-label={trackAriaLabel}>
    {mainLabel != null ? (
      <div className="mb-0">
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
            mb: labelMb,
            fontVariantNumeric: "tabular-nums",
            ".dark &": { color: "var(--dash-panel-heading, #f8fafc)" },
          }}
        >
          {mainLabel}{" "}
          {!isNaN(valueForLabel) && (
            <span
              ref={valueTextRef}
              className="text-slate-400 dark:text-slate-400"
            >
              {formatLabelValue
                ? formatLabelValue(valueForLabel)
                : Math.round(valueForLabel)}
            </span>
          )}
          <div className="dash-heading-rule min-w-0 flex-1 border-b" />
        </Typography>
      </div>
    ) : null}
    <div className="w-full pt-[2px] pb-[2px] px-[2px]">
      <Range
        min={min}
        max={max}
        step={step}
        value={value}
        uncontrolled
        inputRef={rangeInputRef}
        handleChange={(e) => handleRangeChange(Number(e.target.value))}
        onCommit={onCommit}
        pos={posPct}
        color={accentColor || "#0d9488"}
        className={THEME_RANGE_INPUT_CLASS}
      />
    </div>
  </Box>
  );
};

const CounterElementOffcanvas = ({ element, onUpdate, close, textColor, theme }) => {
  const [data, setData] = useState(() => mergeCounterElement(element));
  const dataRef = useRef(data);
  const rangeGestureActiveRef = useRef(false);
  const [counterColorMode, setCounterColorMode] = useState(
    COUNTER_COLOR_MODES_BASE[0].value
  );
  const merged = useMemo(() => mergeCounterElement(data), [data]);

  const { updateSlider, commitSlider, hasActiveSlider } = usePanelSliderPreview({
    type: "ctn",
    targetIds: [element?.id],
    data,
    setData,
    onCommit: (latest) => {
      const next = mergeCounterElement(latest);
      dataRef.current = next;
      setData(next);
      onUpdate?.(next);
    },
  });

  const hasActiveSliderRef = useRef(hasActiveSlider);
  hasActiveSliderRef.current = hasActiveSlider;
  if (!hasActiveSlider()) {
    dataRef.current = data;
  }

  useEffect(() => {
    if (hasActiveSliderRef.current()) return;
    setData(mergeCounterElement(element));
  }, [element?.id, element]);
  useEffect(() => {
    setCounterColorMode(COUNTER_COLOR_MODES_BASE[0].value);
  }, [element?.id]);

  const patch = useCallback(
    (partial) => {
      const next = mergeCounterElement({ ...dataRef.current, ...partial });
      dataRef.current = next;
      setData(next);
      onUpdate?.(next);
    },
    [onUpdate]
  );

  const patchSlider = (partial) => {
    const next = mergeCounterElement({ ...dataRef.current, ...partial });
    dataRef.current = next;
    updateSlider(() => next, { setData: false });
    return next;
  };

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

  const chipSelected = (active, chip) => {
    if (
      active &&
      typeof active === "object" &&
      chip &&
      typeof chip === "object"
    ) {
      return lodash.isEqual(active, chip);
    }
    if (typeof active === "string" && typeof chip === "string") {
      return active.toLowerCase() === chip.toLowerCase();
    }
    return false;
  };

  const startValue = Math.min(
    10_000_000,
    Math.max(-10_000_000, Number(merged.counterStartValue) || 0)
  );
  const targetValue = Math.min(
    10_000_000,
    Math.max(-10_000_000, Number(merged.counterTargetValue) || 0)
  );
  const durationMs = Math.min(
    20_000,
    Math.max(200, Number(merged.counterDurationMs) || 800)
  );
  const fontSize = Math.min(
    120,
    Math.max(12, Number(merged.counterFontSize) || 42)
  );
  const opacity = Math.min(
    255,
    Math.max(0, finiteNumberOr(merged.counterColorOpacity, 255))
  );
  const compositionFontSize = Math.min(
    120,
    Math.max(10, Number(merged.counterCompositionFontSize) || 18)
  );
  const compositionOpacity = Math.min(
    255,
    Math.max(0, finiteNumberOr(merged.counterCompositionColorOpacity, 255))
  );
  const compositionGapPx = Math.min(
    64,
    Math.max(0, finiteNumberOr(merged.counterCompositionGapPx, 32))
  );
  const marginTopRaw = Number(merged.counterMarginTop);
  const marginBottomRaw = Number(merged.counterMarginBottom);
  const marginTop = Number.isFinite(marginTopRaw)
    ? Math.min(80, Math.max(0, marginTopRaw))
    : COUNTER_ELEMENT_DEFAULTS.counterMarginTop;
  const marginBottom = Number.isFinite(marginBottomRaw)
    ? Math.min(80, Math.max(0, marginBottomRaw))
    : COUNTER_ELEMENT_DEFAULTS.counterMarginBottom;
  const inCounterRowGroup =
    typeof merged?.counterRowGroupId === "string" &&
    merged.counterRowGroupId.trim() !== "";
  const counterRowMemberCountRaw = Number(merged?.__counterRowGroupCount);
  const counterRowMemberCount = Number.isFinite(counterRowMemberCountRaw)
    ? counterRowMemberCountRaw
    : 0;
  const showCounterRowGapControl =
    inCounterRowGroup && (counterRowMemberCount <= 0 || counterRowMemberCount > 1);
  const counterColorModesEffective =
    showCounterRowGapControl && merged?.counterRowDividerEnabled === true
      ? COUNTER_COLOR_MODES_BASE.concat([COUNTER_COLOR_MODE_DIVIDER])
      : COUNTER_COLOR_MODES_BASE;
  const counterColorModeLabel =
    counterColorModesEffective.find((o) => o.value === counterColorMode)
      ?.label ?? "";
  const cycleCounterColorMode = (delta) => {
    const list = counterColorModesEffective;
    const idx = list.findIndex((o) => o.value === counterColorMode);
    const base = idx === -1 ? 0 : idx;
    const next = (base + delta + list.length) % list.length;
    setCounterColorMode(list[next].value);
  };
  useEffect(() => {
    if (
      counterColorMode === COUNTER_COLOR_MODE_DIVIDER.value &&
      !(showCounterRowGapControl && merged?.counterRowDividerEnabled === true)
    ) {
      setCounterColorMode(COUNTER_COLOR_MODES_BASE[0].value);
    }
  }, [
    counterColorMode,
    showCounterRowGapControl,
    merged?.counterRowDividerEnabled,
  ]);
  const activeCounterColorSwatch =
    counterColorMode === COUNTER_COLOR_MODE_DIVIDER.value
      ? merged?.counterRowDividerColor ??
        COUNTER_ELEMENT_DEFAULTS.counterRowDividerColor
      : merged?.counterColor ?? COUNTER_ELEMENT_DEFAULTS.counterColor;
  const counterRowGapRaw = Number(merged?.counterRowGap);
  const counterRowGap = Number.isFinite(counterRowGapRaw)
    ? Math.max(0, Math.min(80, counterRowGapRaw))
    : COUNTER_ELEMENT_DEFAULTS.counterRowGap;
  const counterDividerOpacity = Math.max(
    0,
    Math.min(
      255,
      Number(merged?.counterRowDividerOpacity) ||
        COUNTER_ELEMENT_DEFAULTS.counterRowDividerOpacity
    )
  );
  const counterDividerStyleRaw = String(merged?.counterRowDividerStyle || "solid")
    .trim()
    .toLowerCase();
  const counterDividerStyle =
    counterDividerStyleRaw === "dashed" || counterDividerStyleRaw === "dotted"
      ? counterDividerStyleRaw
      : "solid";
  const counterThemeOpacitySliderValue =
    counterColorMode === COUNTER_COLOR_MODE_DIVIDER.value
      ? counterDividerOpacity
      : opacity;
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
      <div className="shrink-0 px-6 pt-5 pb-3 flex items-center justify-between dash-panel-header bg-gray-100 dark:bg-slate-800/60">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 font-bold tracking-wide">
            Counter
          </span>
          <button
            type="button"
            className="inline-flex shrink-0 items-center rounded-md border border-[#333333] bg-[#333333] px-1.5 py-0.5 text-[11px] font-mono font-bold leading-none text-white tabular-nums dark:border-[#333333] dark:bg-[#333333] dark:text-white"
            title={String(merged?.id ?? "")}
            aria-label={`คัดลอก ID ${String(merged?.id ?? "")}`}
            onClick={() => {
              const id = String(merged?.id ?? "");
              if (!id || typeof navigator?.clipboard?.writeText !== "function") return;
              navigator.clipboard.writeText(id).catch(() => {});
            }}
          >
            {(() => {
              const id = String(merged?.id ?? "");
              const maxChars = 15;
              return id.length > maxChars ? `${id.slice(0, maxChars)}…` : id;
            })()}
          </button>
        </div>
        <button
          type="button"
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-white/70"
          onClick={() => close?.(null, null, null)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain px-4 pb-6 w-full">
        <ul className="mt-4 pl-1 space-y-2">
          <li>
            <Box sx={{ width: "100%", px: 0.25, pt: 0.5 }}>
              <div className="mb-1">
                <MainLabel label="ตัวเลข" />
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    width: "100%",
                    gap: "10px",
                  }}
                >
                  <div className={INPUT_GROUP_CLASS}>
                    <div className={INPUT_GROUP_HALF_CLASS}>
                      <span
                        className={`${INPUT_GROUP_ADDON_CLASS} ${INPUT_GROUP_ADDON_DIVIDER}`}
                        style={ADDON_LABEL_STYLE}
                      >
                        เริ่มต้น
                      </span>
                      <input
                        id="counter-start-value"
                        type="number"
                        className={INPUT_GROUP_INPUT_CLASS}
                        placeholder="0"
                        value={String(startValue)}
                        onChange={(e) =>
                          patch({
                            counterStartValue: Number(e.target.value || 0),
                          })
                        }
                        autoComplete="off"
                      />
                    </div>
                    <div className={INPUT_GROUP_HALF_CLASS}>
                      <span
                        className={`${INPUT_GROUP_ADDON_CLASS} ${INPUT_GROUP_ADDON_DIVIDER}`}
                        style={ADDON_LABEL_STYLE}
                      >
                        สิ้นสุด
                      </span>
                      <input
                        id="counter-target-value"
                        type="number"
                        className={INPUT_GROUP_INPUT_CLASS}
                        placeholder="500"
                        value={String(targetValue)}
                        onChange={(e) =>
                          patch({
                            counterTargetValue: Number(e.target.value || 0),
                          })
                        }
                        autoComplete="off"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="ตัวหนา"
                    aria-pressed={Boolean(merged.counterBold)}
                    onClick={() =>
                      patch({ counterBold: !merged.counterBold })
                    }
                    className={BOLD_BTN_BASE}
                    style={optionChipStyle(Boolean(merged.counterBold))}
                  >
                    <Bold className="size-4" strokeWidth={2.5} aria-hidden />
                  </button>
                </Box>
              </div>
              <FullWidthRangeRow
                mainLabel="ความเร็ว"
                valueForLabel={durationMs}
                min={200}
                max={10000}
                step={100}
                value={durationMs}
                onChange={(v) => patchSlider({ counterDurationMs: v })}
                onCommit={(_, reason) => commitSlider(reason)}
                posPct={((durationMs - 200) / 9800) * 100}
                trackAriaLabel="ความเร็วการนับ"
                accentColor={textColor}
                mt={2}
                labelMb={0.35}
              />
              <FullWidthRangeRow
                mainLabel="ขนาดข้อความ"
                valueForLabel={fontSize}
                min={12}
                max={120}
                step={1}
                value={fontSize}
                onChange={(v) => patchSlider({ counterFontSize: v })}
                onCommit={(_, reason) => commitSlider(reason)}
                posPct={((fontSize - 12) / 108) * 100}
                trackAriaLabel="ขนาดตัวเลข"
                accentColor={textColor}
                mt={1.25}
                labelMb={0.35}
              />
            </Box>
          </li>

          {showCounterRowGapControl ? (
            <li>
              <MainLabel
                label="ระยะห่างเคาน์เตอร์"
                value={counterRowGap}
                mb={0.35}
                checked={merged?.counterRowDividerEnabled === true}
                handleSwitch={(e) =>
                  patch({ counterRowDividerEnabled: e.target.checked })
                }
                color={textColor}
                switchLabel="เส้นคั่น"
              />
              <div className="px-[2px] pb-[2px] pt-[2px]">
                <Range
                  min={0}
                  max={80}
                  step={1}
                  value={counterRowGap}
                  pos={(counterRowGap / 80) * 100}
                  color={textColor}
                  handleChange={(e) =>
                    patch({ counterRowGap: Number(e.target.value) || 0 })
                  }
                  className={THEME_RANGE_INPUT_CLASS}
                />
              </div>
              {merged?.counterRowDividerEnabled === true ? (
                <div className="mt-3">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                      รูปแบบเส้นคั่น
                    </span>
                    <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                  </div>
                  <ButtonGroup
                    fullWidth
                    variant="outlined"
                    disableElevation
                    color="inherit"
                    aria-label="เลือกรูปแบบเส้นคั่นเคาน์เตอร์"
                    sx={groupRootSx}
                  >
                    {COUNTER_ROW_DIVIDER_STYLE_OPTIONS.map((opt) => {
                      const selected = counterDividerStyle === opt.value;
                      return (
                        <Button
                          key={opt.value}
                          color="inherit"
                          onClick={() =>
                            patch({ counterRowDividerStyle: opt.value })
                          }
                          sx={groupButtonSx(selected, textColor)}
                        >
                          {opt.label}
                        </Button>
                      );
                    })}
                  </ButtonGroup>
                </div>
              ) : null}
            </li>
          ) : null}

          <li>
            <Box sx={{ width: "100%", px: 0.25, pt: 1 }}>
              <MainLabel
                label={
                  showCounterRowGapControl &&
                  merged?.counterRowDividerEnabled === true
                    ? "สีข้อความ - สีเส้นคั่น"
                    : "สีข้อความ"
                }
                mb={0.5}
              />
              {counterColorModesEffective.length > 1 ? (
                <div className="mb-1 mt-3.5">
                  <SelectLine
                    prev={() => cycleCounterColorMode(-1)}
                    next={() => cycleCounterColorMode(1)}
                    value={counterColorModeLabel}
                  />
                </div>
              ) : null}
              <div className="mt-1 dash-card w-full rounded-md bg-white px-[0px] pb-[5px] pt-[2px] dark:bg-zinc-800">
                <div className="px-[5px] pb-2">
                  <Range
                    min={0}
                    max={255}
                    value={counterThemeOpacitySliderValue}
                    step={1}
                    handleChange={(e) =>
                      patch(
                        counterColorMode === COUNTER_COLOR_MODE_DIVIDER.value
                          ? {
                              counterRowDividerOpacity:
                                Number(e.target.value) || 0,
                            }
                          : { counterColorOpacity: Number(e.target.value) || 0 }
                      )
                    }
                    pos={(counterThemeOpacitySliderValue / 255) * 100}
                    color={textColor || "#0d9488"}
                    className={THEME_RANGE_INPUT_CLASS}
                  />
                </div>
                <div className="grid grid-cols-10 place-items-center gap-x-0 gap-y-[6px] px-[5px] pb-0">
                  {allColors.map((color, i) => {
                    const bgColor =
                      typeof color === "string"
                        ? color
                        : theme?.[color.type]?.[color.index];
                    if (bgColor == null) return null;
                    const selected = chipSelected(activeCounterColorSwatch, color);
                    return (
                      <div key={i} className="">
                        <button
                          type="button"
                          className="flex size-[25px] items-center justify-center rounded-full border border-slate-200 dark:border-white/15"
                          style={{ backgroundColor: bgColor }}
                          onClick={() =>
                            patch(
                              counterColorMode === COUNTER_COLOR_MODE_DIVIDER.value
                                ? { counterRowDividerColor: color }
                                : { counterColor: color }
                            )
                          }
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
          </li>

          <li>
            <Box sx={{ width: "100%", px: 0.25, pt: 0.5 }}>
              <div className="mb-2 flex w-full items-center gap-2 pr-0.5">
                <Typography
                  component="div"
                  sx={{
                    flexShrink: 0,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--dash-panel-heading, #0f172a)",
                    ".dark &": { color: "var(--dash-panel-heading, #f8fafc)" },
                  }}
                >
                  ข้อความประกอบ
                </Typography>
                <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                <CounterPanelAntSwitch
                  className="shrink-0"
                  accentColor={textColor || "#0d9488"}
                  checked={Boolean(merged.counterCompositionEnabled)}
                  onChange={(e) =>
                    patch({ counterCompositionEnabled: e.target.checked })
                  }
                  inputProps={{ "aria-label": "เปิดความประกอบ" }}
                />
              </div>
              {merged.counterCompositionEnabled ? (
                <div className={INPUT_GROUP_CLASS}>
                  <div className={INPUT_GROUP_HALF_CLASS}>
                    <span
                      className={`${COMPOSITION_ADDON_CLASS} ${INPUT_GROUP_ADDON_DIVIDER}`}
                      style={ADDON_LABEL_STYLE}
                    >
                      ด้านซ้าย
                    </span>
                    <input
                      id="counter-composition-left"
                      type="text"
                      className={INPUT_GROUP_TEXT_INPUT_CLASS}
                      placeholder=""
                      value={
                        typeof merged.counterCompositionLeft === "string"
                          ? merged.counterCompositionLeft
                          : ""
                      }
                      onChange={(e) =>
                        patch({
                          counterCompositionLeft: String(
                            e.target.value ?? ""
                          ).slice(0, 120),
                        })
                      }
                      maxLength={120}
                      autoComplete="off"
                    />
                  </div>
                  <div className={INPUT_GROUP_HALF_CLASS}>
                    <span
                      className={`${COMPOSITION_ADDON_CLASS} ${INPUT_GROUP_ADDON_DIVIDER}`}
                      style={ADDON_LABEL_STYLE}
                    >
                      ด้านขวา
                    </span>
                    <input
                      id="counter-composition-right"
                      type="text"
                      className={INPUT_GROUP_TEXT_INPUT_CLASS}
                      placeholder=""
                      value={
                        typeof merged.counterCompositionRight === "string"
                          ? merged.counterCompositionRight
                          : ""
                      }
                      onChange={(e) =>
                        patch({
                          counterCompositionRight: String(
                            e.target.value ?? ""
                          ).slice(0, 120),
                        })
                      }
                      maxLength={120}
                      autoComplete="off"
                    />
                  </div>
                </div>
              ) : null}
              {merged.counterCompositionEnabled ? (
                <>
                  <FullWidthRangeRow
                    mainLabel="ระยะห่างบนล่าง"
                    valueForLabel={compositionGapPx}
                    min={0}
                    max={64}
                    step={1}
                    value={compositionGapPx}
                    onChange={(v) => patch({ counterCompositionGapPx: v })}
                    posPct={(compositionGapPx / 64) * 100}
                    trackAriaLabel="ระยะห่างบนล่าง"
                    accentColor={textColor}
                    mt={2}
                    labelMb={0.35}
                    formatLabelValue={(v) => {
                      const off = Math.round(v) - 32;
                      if (off === 0) return "0";
                      return `${off > 0 ? "+" : ""}${off}`;
                    }}
                  />
                  <FullWidthRangeRow
                    mainLabel="ขนาดข้อความประกอบ"
                    valueForLabel={compositionFontSize}
                    min={10}
                    max={120}
                    step={1}
                    value={compositionFontSize}
                    onChange={(v) =>
                      patchSlider({ counterCompositionFontSize: v })
                    }
                    onCommit={(_, reason) => commitSlider(reason)}
                    posPct={((compositionFontSize - 10) / 110) * 100}
                    trackAriaLabel="ขนาดข้อความประกอบ"
                    accentColor={textColor}
                    mt={2}
                    labelMb={0.35}
                  />
                  <Box sx={{ width: "100%", mt: 2 }}>
                    <MainLabel label="สีข้อความประกอบ" mb={0.5} />
                    <div className="mt-1 dash-card w-full rounded-md bg-white px-[0px] pb-[5px] pt-[2px] dark:bg-zinc-800">
                      <div className="px-[5px] pb-2">
                        <Range
                          min={0}
                          max={255}
                          value={compositionOpacity}
                          step={1}
                          handleChange={(e) =>
                            patchSlider({
                              counterCompositionColorOpacity:
                                Number(e.target.value) || 0,
                            })
                          }
                          onCommit={(_, reason) => commitSlider(reason)}
                          pos={(compositionOpacity / 255) * 100}
                          color={textColor || "#0d9488"}
                          className={THEME_RANGE_INPUT_CLASS}
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
                            merged.counterCompositionColor,
                            color
                          );
                          return (
                            <div key={i} className="">
                              <button
                                type="button"
                                className="flex size-[25px] items-center justify-center rounded-full border border-slate-200 dark:border-white/15"
                                style={{ backgroundColor: bgColor }}
                                onClick={() => {
                                  patchSlider({
                                    counterCompositionColor: color,
                                  });
                                  commitSlider("color");
                                }}
                                aria-label={`เลือกสีความประกอบ ${bgColor}`}
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
                </>
              ) : null}
            </Box>
          </li>

          <li>
            <Box sx={{ width: "100%", px: 0.25, pt: 0.5 }}>
              <div className="mb-3 flex items-center gap-2">
                <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                  ตำแหน่งการจัดวาง
                </span>
                <div className="dash-heading-rule min-w-0 flex-1 border-b" />
              </div>
              <ButtonGroup
                variant="outlined"
                fullWidth
                disableElevation
                color="inherit"
                aria-label="จัดวาง Counter ชิดซ้าย ตรงกลาง หรือชิดขวา"
                sx={groupRootSx}
              >
                {[
                  { value: "left", Icon: AlignLeft, label: "ชิดซ้าย" },
                  { value: "center", Icon: AlignCenter, label: "ตรงกลาง" },
                  { value: "right", Icon: AlignRight, label: "ชิดขวา" },
                ].map(({ value, Icon, label }) => {
                  const sel = (merged.counterAlign ?? "center") === value;
                  return (
                    <Button
                      key={value}
                      color="inherit"
                      title={label}
                      onClick={() => patch({ counterAlign: value })}
                      sx={{ ...groupButtonSx(sel, textColor), minHeight: 36 }}
                    >
                      <Icon size={(void Icon, 15)} strokeWidth={3.5} />
                    </Button>
                  );
                })}
              </ButtonGroup>
            </Box>
          </li>

          <li>
            <div className="grid w-full grid-cols-2 gap-x-3 gap-y-3 px-0.5">
              <FullWidthRangeRow
                mainLabel="ระยะบน"
                valueForLabel={marginTop}
                min={0}
                max={80}
                step={1}
                value={marginTop}
                onChange={(v) => patchSlider({ counterMarginTop: v })}
                onCommit={(_, reason) => commitSlider(reason)}
                posPct={(marginTop / 80) * 100}
                trackAriaLabel="ระยะด้านบน"
                accentColor={textColor}
                mt={1}
                labelMb={0.35}
              />
              <FullWidthRangeRow
                mainLabel="ระยะล่าง"
                valueForLabel={marginBottom}
                min={0}
                max={80}
                step={1}
                value={marginBottom}
                onChange={(v) => patchSlider({ counterMarginBottom: v })}
                onCommit={(_, reason) => commitSlider(reason)}
                posPct={(marginBottom / 80) * 100}
                trackAriaLabel="ระยะด้านล่าง"
                accentColor={textColor}
                mt={1}
                labelMb={0.35}
              />
            </div>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default CounterElementOffcanvas;
