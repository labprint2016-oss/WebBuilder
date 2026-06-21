import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Button, ButtonGroup, Typography } from "@mui/material";
import { Check } from "lucide-react";
import Range from "../HTML/Range";
import { THEME_PANEL_BASIC_COLOR_SWATCHES } from "../themePanelBasicColors";
import { swatchSelectedCheckClassName } from "../Layouts/Elements/swatchCheckClass";
import {
  DIVIDER_STYLE_OPTIONS,
  mergeDividerElement,
} from "../Layouts/Elements/dividerElementConfig";

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
  [&::-webkit-slider-thumb]:bg-slate-900
  dark:[&::-webkit-slider-thumb]:bg-emerald-300
  [&::-webkit-slider-thumb]:border-0
  [&::-moz-range-thumb]:cursor-pointer
  [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4
  [&::-moz-range-thumb]:rounded-full
  [&::-moz-range-thumb]:bg-emerald-300
  [&::-moz-range-thumb]:border-0
`;

const dividerGroupRootSx = {
  width: "100%",
  boxShadow: "none",
  "& .MuiButton-root": { boxShadow: "none" },
  "& .MuiButtonGroup-grouped": { borderRadius: "0 !important" },
  "& .MuiButtonGroup-grouped:first-of-type": {
    borderTopLeftRadius: "0.375rem !important",
    borderBottomLeftRadius: "0.375rem !important",
  },
  "& .MuiButtonGroup-grouped:last-of-type": {
    borderTopRightRadius: "0.375rem !important",
    borderBottomRightRadius: "0.375rem !important",
  },
  "& .MuiButtonGroup-grouped.MuiButton-outlined": {
    borderColor: "#e2e8f0 !important",
  },
  ".dark & .MuiButtonGroup-grouped.MuiButton-outlined": {
    borderColor: "rgba(255,255,255,0.1) !important",
  },
};

const dividerBtnSx = (selected, accent) => {
  const a = accent || "#0d9488";
  return {
    flex: 1,
    fontSize: 11,
    minHeight: 34,
    py: 0,
    px: 0.5,
    textTransform: "none",
    lineHeight: 1.15,
    whiteSpace: "nowrap",
    overflow: "hidden",
    color: selected ? "#ffffff" : "#334155",
    borderColor: selected ? `${a} !important` : undefined,
    backgroundColor: selected ? a : "#ffffff",
    "&:hover": {
      backgroundColor: selected ? a : "#f8fafc",
      borderColor: selected ? `${a} !important` : undefined,
    },
    ".dark &": {
      color: selected ? "#ffffff" : "rgba(255,255,255,0.88)",
      backgroundColor: selected ? a : "rgba(15,23,42,0.6)",
      "&:hover": {
        backgroundColor: selected ? a : "rgba(255,255,255,0.08)",
      },
    },
  };
};

const MainLabel = ({ label, value }) => (
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
      mb: 0.5,
      fontVariantNumeric: "tabular-nums",
      ".dark &": { color: "rgba(255,255,255,0.78)" },
    }}
  >
    {label}
    {Number.isFinite(Number(value)) ? (
      <span className="text-slate-400 dark:text-slate-400">{value}</span>
    ) : null}
    <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
  </Typography>
);

const DividerElementOffcanvas = ({ element, onUpdate, close, textColor, theme }) => {
  const [data, setData] = useState(() => mergeDividerElement(element));
  const accent = textColor || "#0d9488";

  useEffect(() => {
    setData(mergeDividerElement(element));
  }, [element]);

  const merged = useMemo(() => mergeDividerElement(data), [data]);

  const allColors = useMemo(() => {
    if (!theme?.mainColor?.length) return [];
    const mc = theme.mainColor.map((_, i) => ({ type: "mainColor", index: i }));
    const tc = (theme.textColor || []).map((_, i) => ({ type: "textColor", index: i }));
    const oc = (theme.otherColor || []).map((_, i) => ({ type: "otherColor", index: i }));
    return [...mc, ...tc, ...oc, ...THEME_PANEL_BASIC_COLOR_SWATCHES];
  }, [theme]);

  const patch = useCallback(
    (partial) => {
      const next = mergeDividerElement({ ...data, ...partial });
      setData(next);
      onUpdate?.(next);
    },
    [data, onUpdate]
  );

  const chipSelected = (active, chip) =>
    typeof active === "object" &&
    active &&
    typeof chip === "object" &&
    chip &&
    active.type === chip.type &&
    active.index === chip.index;

  const dividerWeight = Number.isFinite(Number(merged.dividerWeight))
    ? Number(merged.dividerWeight)
    : 1;
  const dividerWeightLabel = dividerWeight.toFixed(1);

  return (
    <aside className="flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden bg-white dark:bg-gray-900/80 border-r border-slate-200 dark:border-white/10">
      <div className="shrink-0 px-6 pt-5 pb-3 flex items-center justify-between bg-gray-100 dark:bg-slate-800/60">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 font-bold tracking-wide text-slate-800 dark:text-white/90">
            Divider
          </span>
          <span
            className="inline-flex min-w-0 max-w-full items-center rounded-md border border-[#333333] bg-[#333333] px-2 py-0.5 text-[11px] font-mono font-bold leading-none text-white tabular-nums"
            title={String(merged?.id ?? "")}
          >
            <span className="truncate">{merged?.id ?? "-"}</span>
          </span>
        </div>
        <button
          type="button"
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-white/70"
          onClick={() => close?.(null, null, null)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain px-4 pb-14 w-full">
        <ul className="mt-4 pl-1 space-y-5">
          <li>
            <MainLabel label="รูปแบบ" />
            <ButtonGroup
              fullWidth
              variant="outlined"
              disableElevation
              color="inherit"
              className="mt-1"
              sx={dividerGroupRootSx}
            >
              {DIVIDER_STYLE_OPTIONS.map((opt) => {
                const selected = merged.dividerStyle === opt.value;
                return (
                  <Button
                    key={opt.value}
                    color="inherit"
                    sx={dividerBtnSx(selected, accent)}
                    onClick={() => patch({ dividerStyle: opt.value })}
                  >
                    {opt.label}
                  </Button>
                );
              })}
            </ButtonGroup>
          </li>

          <li>
            <MainLabel label="ความหนา" value={dividerWeightLabel} />
            <div className="w-full pt-[2px] pb-[2px] px-[2px]">
              <Range
                min={0.1}
                max={12}
                step={0.1}
                value={dividerWeight}
                handleChange={(e) => patch({ dividerWeight: Number(e.target.value) })}
                pos={((dividerWeight - 0.1) / (12 - 0.1)) * 100}
                color={accent}
                className={THEME_RANGE_INPUT_CLASS}
              />
            </div>
          </li>

          <li>
            <MainLabel label="สีเส้นคั่น" />
            <div className="mt-1 rounded-md bg-white px-1 pb-1.5 pt-0 dark:bg-zinc-800">
              <div className="px-1 pb-2 pt-0">
                <input
                  type="range"
                  min={0}
                  max={255}
                  step={1}
                  value={merged.dividerOpacity}
                  className={THEME_RANGE_INPUT_CLASS}
                  style={{
                    "--fill": accent,
                    "--pos": `${(merged.dividerOpacity / 255) * 100}%`,
                  }}
                  aria-label="ความโปร่งแสงสีเส้นคั่น"
                  onChange={(e) => patch({ dividerOpacity: Number(e.target.value) })}
                />
              </div>
              <div className="grid grid-cols-10 place-items-center gap-y-[6px]">
                {allColors.map((color, i) => {
                  const bgColor =
                    typeof color === "string" ? color : theme?.[color.type]?.[color.index];
                  if (!bgColor) return null;
                  const selected = chipSelected(merged.dividerColor, color) || merged.dividerColor === color;
                  return (
                    <button
                      key={`${i}-${bgColor}`}
                      type="button"
                      className="flex size-[25px] items-center justify-center rounded-full border border-slate-200 dark:border-white/10"
                      style={{ backgroundColor: bgColor }}
                      aria-label={`สีเส้นคั่น ${bgColor}`}
                      onClick={() => patch({ dividerColor: color })}
                    >
                      {selected ? (
                        <Check
                          className={swatchSelectedCheckClassName(bgColor)}
                          strokeWidth={4}
                          size={11}
                        />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </li>

          <li>
            <div className="grid grid-cols-2 gap-x-2">
              <div className="col-span-1">
                <Box sx={{ width: "100%", px: 0.25 }}>
                  <MainLabel label="ระยะบน" value={merged.dividerMarginTop} />
                  <div className="w-full pt-[2px] pb-[2px] px-[2px]">
                    <Range
                      min={0}
                      max={80}
                      step={1}
                      value={merged.dividerMarginTop}
                      handleChange={(e) => patch({ dividerMarginTop: Number(e.target.value) })}
                      pos={(merged.dividerMarginTop / 80) * 100}
                      color={accent}
                      className={THEME_RANGE_INPUT_CLASS}
                    />
                  </div>
                </Box>
              </div>
              <div className="col-span-1">
                <Box sx={{ width: "100%", px: 0.25 }}>
                  <MainLabel label="ระยะล่าง" value={merged.dividerMarginBottom} />
                  <div className="w-full pt-[2px] pb-[2px] px-[2px]">
                    <Range
                      min={0}
                      max={80}
                      step={1}
                      value={merged.dividerMarginBottom}
                      handleChange={(e) => patch({ dividerMarginBottom: Number(e.target.value) })}
                      pos={(merged.dividerMarginBottom / 80) * 100}
                      color={accent}
                      className={THEME_RANGE_INPUT_CLASS}
                    />
                  </div>
                </Box>
              </div>
            </div>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default DividerElementOffcanvas;
