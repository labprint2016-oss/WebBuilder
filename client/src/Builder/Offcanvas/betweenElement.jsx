import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Button, ButtonGroup, Switch, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Check } from "lucide-react";
import lodash from "lodash";
import Range from "../HTML/Range";
import { swatchSelectedCheckClassName } from "../Layouts/Elements/swatchCheckClass";
import { THEME_PANEL_BASIC_COLOR_SWATCHES } from "../themePanelBasicColors";
import {
  BETWEEN_ELEMENT_DEFAULTS,
  mergeBetweenElement,
} from "../Layouts/Elements/betweenElementConfig";

const THEME_RANGE_INPUT_CLASS = `
  w-full cursor-pointer appearance-none h-2 rounded-full
  bg-zinc-200 dark:bg-zinc-700 theme-range-fill-track
  [&::-webkit-slider-runnable-track]:border-0 [&::-moz-range-track]:border-0
  [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none
  [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full
  [&::-webkit-slider-thumb]:bg-slate-900 dark:[&::-webkit-slider-thumb]:bg-emerald-300
  [&::-webkit-slider-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer
  [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full
  [&::-moz-range-thumb]:bg-emerald-300 [&::-moz-range-thumb]:border-0
`;

const MainLabel = ({ label, value, valueText, mb = 0.5 }) => (
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
    {label}
    {value != null ? (
      <span className="text-slate-400 dark:text-slate-400">
        {valueText ?? Math.round(value)}
      </span>
    ) : null}
    <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
  </Typography>
);

const LINE_STYLE_OPTIONS = [
  { value: "solid", label: "ธรรมดา" },
  { value: "dashed", label: "เส้นประ" },
  { value: "dotted", label: "จุด" },
];
const TEXT_MODE_OPTIONS = [
  { value: "none", label: "ไม่มีข้อความ" },
  { value: "left", label: "ซ้าย" },
  { value: "right", label: "ขวา" },
  { value: "both", label: "ซ้าย - ขวา" },
];

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

const BetweenPanelSwitch = styled(Switch, {
  shouldForwardProp: (prop) => prop !== "accentColor",
})(({ theme, accentColor = "#0d9488" }) => ({
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
      "& + .MuiSwitch-track": { opacity: 1, backgroundColor: accentColor },
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

const BetweenElementOffcanvas = ({ element, onUpdate, close, textColor, theme }) => {
  const [data, setData] = useState(() => mergeBetweenElement(element));

  useEffect(() => {
    setData(mergeBetweenElement(element));
  }, [element]);

  const merged = useMemo(() => mergeBetweenElement(data), [data]);

  const patch = useCallback(
    (partial) => {
      const next = mergeBetweenElement({ ...data, ...partial });
      setData(next);
      onUpdate?.(lodash.cloneDeep(next));
    },
    [data, onUpdate]
  );

  const allColors = useMemo(() => {
    if (!theme?.mainColor?.length) return [];
    const mc = theme.mainColor.map((_, i) => ({ type: "mainColor", index: i }));
    const tc = (theme.textColor || []).map((_, i) => ({ type: "textColor", index: i }));
    const oc = (theme.otherColor || []).map((_, i) => ({ type: "otherColor", index: i }));
    return [...mc, ...tc, ...oc, ...THEME_PANEL_BASIC_COLOR_SWATCHES];
  }, [theme]);

  const chipSelected = (active, chip) => {
    if (typeof active === "string" && typeof chip === "string") {
      return active.toLowerCase() === chip.toLowerCase();
    }
    if (active && chip && typeof active === "object" && typeof chip === "object") {
      return lodash.isEqual(active, chip);
    }
    return false;
  };

  const numericOrDefault = (value, fallback) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  };
  const fontSize = numericOrDefault(merged.betweenFontSize, BETWEEN_ELEMENT_DEFAULTS.betweenFontSize);
  const lineWidth = numericOrDefault(
    merged.betweenLineWidth,
    BETWEEN_ELEMENT_DEFAULTS.betweenLineWidth
  );
  const lineWidthText = Number.isFinite(lineWidth)
    ? (Math.round(lineWidth * 10) / 10).toFixed(1).replace(/\.0$/, "")
    : "1";
  const lineGap = numericOrDefault(merged.betweenLineGap, BETWEEN_ELEMENT_DEFAULTS.betweenLineGap);
  const radius = numericOrDefault(merged.betweenRadius, BETWEEN_ELEMENT_DEFAULTS.betweenRadius);
  const marginTop = numericOrDefault(
    merged.betweenMarginTop,
    BETWEEN_ELEMENT_DEFAULTS.betweenMarginTop
  );
  const marginBottom = numericOrDefault(
    merged.betweenMarginBottom,
    BETWEEN_ELEMENT_DEFAULTS.betweenMarginBottom
  );
  const backgroundOpacity = Math.min(
    255,
    Math.max(0, Number(merged.betweenFrameColorOpacity) ?? 255)
  );
  const glassLevel = Math.min(100, Math.max(0, Number(merged.betweenGlass) ?? 0));
  const insetX = Math.min(24, Math.max(0, Number(merged.betweenInsetX) ?? 0));
  const insetY = Math.min(16, Math.max(0, Number(merged.betweenInsetY) ?? 0));

  return (
    <aside className="flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden bg-white dark:bg-gray-900/80 border-r border-slate-200 dark:border-white/10">
      <div className="shrink-0 px-6 pt-5 pb-3 flex items-center justify-between bg-gray-100 dark:bg-slate-800/60">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 font-bold tracking-wide text-slate-800 dark:text-white/90">
            Between
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

      <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain px-4 pb-8 w-full">
        <ul className="mt-4 pl-1 space-y-4">
          <li>
            <Box sx={{ width: "100%", px: 0.25, pt: 0.5 }}>
              <MainLabel label="รูปแบบ" mb={1.25} />
              <div className="mt-2">
                <ButtonGroup variant="outlined" fullWidth sx={dividerGroupRootSx}>
                  {TEXT_MODE_OPTIONS.map((opt) => {
                    const selected = merged.betweenTextMode === opt.value;
                    return (
                      <Button
                        key={opt.value}
                        color="inherit"
                        onClick={() => patch({ betweenTextMode: opt.value })}
                        sx={dividerBtnSx(selected, textColor)}
                      >
                        {opt.label}
                      </Button>
                    );
                  })}
                </ButtonGroup>
              </div>
            </Box>
          </li>
          <li>
            <div className="grid w-full grid-cols-2 gap-x-3 px-0.5">
              {merged.betweenTextMode !== "none" ? (
                <Box sx={{ width: "100%", px: 0.25, pt: 0.5 }}>
                  <MainLabel label="ขนาดข้อความ" value={fontSize} mb={0.3} />
                  <div className="w-full px-[2px] pt-[2px] pb-[2px]">
                    <Range
                      min={12}
                      max={96}
                      step={1}
                      value={fontSize}
                      handleChange={(e) => patch({ betweenFontSize: Number(e.target.value) })}
                      pos={((fontSize - 12) / 84) * 100}
                      color={textColor || "#0d9488"}
                      className={THEME_RANGE_INPUT_CLASS}
                    />
                  </div>
                </Box>
              ) : null}
              <Box
                className={merged.betweenTextMode === "none" ? "col-span-2" : undefined}
                sx={{ width: "100%", px: 0.25, pt: 0.5 }}
              >
                <MainLabel label="ระยะห่างรอบไอคอน" value={lineGap} mb={0.3} />
                <div className="w-full px-[2px] pt-[2px] pb-[2px]">
                  <Range
                    min={0}
                    max={40}
                    step={1}
                    value={lineGap}
                    handleChange={(e) => patch({ betweenLineGap: Number(e.target.value) })}
                    pos={(lineGap / 40) * 100}
                    color={textColor || "#0d9488"}
                    className={THEME_RANGE_INPUT_CLASS}
                  />
                </div>
              </Box>
            </div>
          </li>

          <li>
            <Box sx={{ width: "100%", px: 0.25, pt: 0 }}>
              <MainLabel label="เส้นคั่น" mb={0.5} />
              <div className="mt-1">
                <ButtonGroup variant="outlined" fullWidth sx={dividerGroupRootSx}>
                  {LINE_STYLE_OPTIONS.map((opt) => {
                    const selected = merged.betweenLineStyle === opt.value;
                    return (
                      <Button
                        key={opt.value}
                        color="inherit"
                        onClick={() => patch({ betweenLineStyle: opt.value })}
                        sx={dividerBtnSx(selected, textColor)}
                      >
                        {opt.label}
                      </Button>
                    );
                  })}
                </ButtonGroup>
              </div>

              <div className="mt-1">
                <div className="mt-0.5 w-full px-[2px] pt-[2px] pb-[2px]">
                  <Range
                    min={0}
                    max={255}
                    step={1}
                    value={Math.min(255, Math.max(0, Number(merged.betweenLineOpacity) ?? 255))}
                    handleChange={(e) =>
                      patch({ betweenLineOpacity: Number(e.target.value) || 0 })
                    }
                    pos={(
                      Math.min(255, Math.max(0, Number(merged.betweenLineOpacity) ?? 255)) / 255
                    ) * 100}
                    color={textColor || "#0d9488"}
                    className={THEME_RANGE_INPUT_CLASS}
                  />
                </div>
                <div className="mt-2 grid grid-cols-10 place-items-center gap-y-[6px]">
                  {allColors.map((color, i) => {
                    const bgColor = typeof color === "string" ? color : theme?.[color.type]?.[color.index];
                    if (!bgColor) return null;
                    const selected = chipSelected(merged.betweenLineColor, color);
                    return (
                      <button
                        key={`line-${i}`}
                        type="button"
                        className="flex size-[25px] items-center justify-center rounded-full border border-slate-200 dark:border-white/15"
                        style={{ backgroundColor: bgColor }}
                        onClick={() => patch({ betweenLineColor: color })}
                      >
                        {selected ? (
                          <Check className={swatchSelectedCheckClassName(bgColor)} strokeWidth={4} />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3">
                  <MainLabel label="ความหนา" value={lineWidth} valueText={lineWidthText} mb={0.3} />
                  <div className="w-full px-[2px] pt-[2px] pb-[2px]">
                    <Range
                      min={1}
                      max={12}
                      step={0.1}
                      value={lineWidth}
                      handleChange={(e) => patch({ betweenLineWidth: Number(e.target.value) })}
                      pos={((lineWidth - 1) / 11) * 100}
                      color={textColor || "#0d9488"}
                      className={THEME_RANGE_INPUT_CLASS}
                    />
                  </div>
                </div>
              </div>
            </Box>
          </li>

          <li>
            <Box sx={{ width: "100%", px: 0.25, pt: 0 }}>
              <div className="mb-1 flex w-full items-center gap-2 pr-0.5">
                <Typography
                  component="div"
                  sx={{
                    flexShrink: 0,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "rgb(51 65 85)",
                    ".dark &": { color: "rgba(255,255,255,0.78)" },
                  }}
                >
                  สีกรอบ
                </Typography>
                <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
                <BetweenPanelSwitch
                  className="shrink-0"
                  accentColor={textColor || "#0d9488"}
                  checked={Boolean(merged.betweenFrameEnabled)}
                  onChange={(e) => patch({ betweenFrameEnabled: e.target.checked })}
                  inputProps={{ "aria-label": "เปิดสีกรอบ" }}
                />
              </div>
              {merged.betweenFrameEnabled ? (
                <>
                  <div className="mb-2 w-full px-[2px] pt-[2px] pb-[2px]">
                    <Range
                      min={0}
                      max={255}
                      step={1}
                      value={backgroundOpacity}
                      handleChange={(e) =>
                        patch({ betweenFrameColorOpacity: Number(e.target.value) || 0 })
                      }
                      pos={(backgroundOpacity / 255) * 100}
                      color={textColor || "#0d9488"}
                      className={THEME_RANGE_INPUT_CLASS}
                    />
                  </div>
                  <div className="grid grid-cols-10 place-items-center gap-y-[6px]">
                    {allColors.map((color, i) => {
                      const bgColor = typeof color === "string" ? color : theme?.[color.type]?.[color.index];
                      if (!bgColor) return null;
                      const selected = chipSelected(merged.betweenFrameColor, color);
                      return (
                        <button
                          key={`txt-${i}`}
                          type="button"
                          className="flex size-[25px] items-center justify-center rounded-full border border-slate-200 dark:border-white/15"
                          style={{ backgroundColor: bgColor }}
                          onClick={() => patch({ betweenFrameColor: color })}
                        >
                          {selected ? (
                            <Check className={swatchSelectedCheckClassName(bgColor)} strokeWidth={4} />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : null}
            </Box>
          </li>

          {merged.betweenFrameEnabled ? (
            <li>
              <Box sx={{ width: "100%", px: 0.25, pt: 0.5 }}>
                <div className="grid grid-cols-2 gap-x-3">
                  <div>
                    <MainLabel label="ความโค้งมน" value={radius} mb={0.3} />
                    <div className="w-full px-[2px] pt-[2px] pb-[2px]">
                      <Range
                        min={0}
                        max={64}
                        step={1}
                        value={radius}
                        handleChange={(e) => patch({ betweenRadius: Number(e.target.value) })}
                        pos={(radius / 64) * 100}
                        color={textColor || "#0d9488"}
                        className={THEME_RANGE_INPUT_CLASS}
                      />
                    </div>
                  </div>
                  <div>
                    <MainLabel label="กรอบเบลอ" value={glassLevel} mb={0.3} />
                    <div className="w-full px-[2px] pt-[2px] pb-[2px]">
                      <Range
                        min={0}
                        max={100}
                        step={1}
                        value={glassLevel}
                        handleChange={(e) =>
                          patch({ betweenGlass: Number(e.target.value) || 0 })
                        }
                        pos={glassLevel}
                        color={textColor || "#0d9488"}
                        className={THEME_RANGE_INPUT_CLASS}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-x-3">
                  <div>
                    <MainLabel label="ระยะกรอบซ้าย-ขวา" value={insetX} mb={0.3} />
                    <div className="w-full px-[2px] pt-[2px] pb-[2px]">
                      <Range
                        min={0}
                        max={24}
                        step={1}
                        value={insetX}
                        handleChange={(e) => patch({ betweenInsetX: Number(e.target.value) || 0 })}
                        pos={(insetX / 24) * 100}
                        color={textColor || "#0d9488"}
                        className={THEME_RANGE_INPUT_CLASS}
                      />
                    </div>
                  </div>
                  <div>
                    <MainLabel label="ระยะกรอบบน-ล่าง" value={insetY} mb={0.3} />
                    <div className="w-full px-[2px] pt-[2px] pb-[2px]">
                      <Range
                        min={0}
                        max={16}
                        step={1}
                        value={insetY}
                        handleChange={(e) => patch({ betweenInsetY: Number(e.target.value) || 0 })}
                        pos={(insetY / 16) * 100}
                        color={textColor || "#0d9488"}
                        className={THEME_RANGE_INPUT_CLASS}
                      />
                    </div>
                  </div>
                </div>
              </Box>
            </li>
          ) : null}

          <li>
            <div className="grid w-full grid-cols-2 gap-x-3 px-0.5">
              <Box sx={{ width: "100%", px: 0.25, pt: 0 }}>
                <MainLabel label="ระยะบน" value={marginTop} mb={0.3} />
                <div className="w-full px-[2px] pt-[2px] pb-[2px]">
                  <Range
                    min={0}
                    max={80}
                    step={1}
                    value={marginTop}
                    handleChange={(e) => patch({ betweenMarginTop: Number(e.target.value) })}
                    pos={(marginTop / 80) * 100}
                    color={textColor || "#0d9488"}
                    className={THEME_RANGE_INPUT_CLASS}
                  />
                </div>
              </Box>
              <Box sx={{ width: "100%", px: 0.25, pt: 0 }}>
                <MainLabel label="ระยะล่าง" value={marginBottom} mb={0.3} />
                <div className="w-full px-[2px] pt-[2px] pb-[2px]">
                  <Range
                    min={0}
                    max={80}
                    step={1}
                    value={marginBottom}
                    handleChange={(e) => patch({ betweenMarginBottom: Number(e.target.value) })}
                    pos={(marginBottom / 80) * 100}
                    color={textColor || "#0d9488"}
                    className={THEME_RANGE_INPUT_CLASS}
                  />
                </div>
              </Box>
            </div>
          </li>

        </ul>
      </nav>
    </aside>
  );
};

export default BetweenElementOffcanvas;
