import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Button, ButtonGroup, Stack, Typography } from "@mui/material";
import Switch from "@mui/material/Switch";
import { styled } from "@mui/material/styles";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Check,
} from "lucide-react";
import lodash from "lodash";
import { setColor } from "../../../function";
import { swatchSelectedCheckClassName } from "../Layouts/Elements/swatchCheckClass";
import { THEME_PANEL_BASIC_COLOR_SWATCHES } from "../themePanelBasicColors";
import Field from "../HTML/Field";
import Range from "../HTML/Range";
import {
  HEADING_ELEMENT_DEFAULTS,
  HEADING_DIVIDER_SPAN_NARROW,
  HEADING_DIVIDER_SPAN_WIDE,
  HEADING_DIVIDER_SPAN_WIDE_THRESHOLD,
  mergeHeadingElement,
} from "../Layouts/Elements/headingElementConfig";

const HEADING_ALIGN_OPTIONS = [
  { value: "left", ariaLabel: "ชิดซ้าย", Icon: AlignLeft },
  { value: "center", ariaLabel: "กลาง", Icon: AlignCenter },
  { value: "right", ariaLabel: "ชิดขวา", Icon: AlignRight },
];

const HEADING_GRADIENT_PICK = [
  { value: "start", label: "จุดเริ่ม" },
  { value: "end", label: "จุดสิ้น" },
];

const HEADING_DIVIDER_POSITIONS = [
  { value: "left", label: "ซ้าย" },
  { value: "both", label: "สองข้าง" },
  { value: "right", label: "ขวา" },
  { value: "bottom", label: "ล่าง" },
];

/** solid | dashed | dotted */
const HEADING_DIVIDER_STYLES = [
  { value: "solid", label: "ตรง" },
  { value: "dashed", label: "ประ" },
  { value: "dotted", label: "จุด" },
];

const CHIP_BORDER = "#e2e8f0";
const CHIP_BORDER_DARK = "rgba(255, 255, 255, 0.1)";
const CHIP_BG = "#ffffff";
const CHIP_BG_HOVER = "#f8fafc";
const CHIP_BG_DARK = "rgba(30, 41, 59, 0.9)";
const CHIP_BG_DARK_HOVER = "rgba(30, 41, 59, 1)";
const OPTION_CHIP_RADIUS = "0.375rem";

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

/** ชุดคลาสเดียวกับปรับแสงรูปภาพ — imageElement.jsx */
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

/** Switch แบบ Section «เส้นคั่นคอลัมน์» — Offcanvas/container.jsx AntSwitch */
const HeadingPanelAntSwitch = styled(Switch, {
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

/** เหมือน imageElement — ไม่ส่ง handleSwitch / switchLabel = ไม่มีสวิตช์เมาส์สัมผัส */
const MainLabel = ({
  label,
  value = NaN,
  mb = 0.75,
  handleSwitch = null,
  checked = "-",
  textColor: accent = null,
  switchLabel = null,
  /** แสดงค่าข้างหัวข้อแบบกำหนดเอง (เช่นทศนิยม) — ถ้าไม่ส่งใช้ Math.round */
  formatValue = null,
}) => {
  const trackAccent = accent || "#0d9488";
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
      {!isNaN(value) && (
        <span className="text-slate-400 dark:text-slate-400">
          {formatValue ? formatValue(value) : Math.round(value)}
        </span>
      )}
      <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
      {checked !== "-" && (
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <HeadingPanelAntSwitch
            accentColor={trackAccent}
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

/** หัวข้อย่อยเส้นคั่น — สีข้อความและเส้นคั่นแนวราบเหมือน MainLabel ของ “สีข้อความ” */
const DividerSubheading = ({ children, mb = 0.75 }) => (
  <Typography
    component="div"
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1,
      minWidth: 0,
      fontSize: 13,
      fontWeight: 600,
      color: "rgb(51 65 85)",
      mb,
      ".dark &": { color: "rgba(255,255,255,0.78)" },
    }}
  >
    <span className="shrink-0">{children}</span>
    <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
  </Typography>
);

const HEADING_LABEL_FIELD_CLASS =
  "min-w-0 flex-1 h-10 rounded-md border border-slate-200 bg-white px-2.5 py-2 text-[13px] leading-snug text-slate-800 outline-none transition placeholder:text-slate-400 dark:border-white/10 dark:bg-slate-900/80 dark:text-white/90 dark:placeholder:text-slate-500";

/** สไลด์เต็มความกว้าง — สไตล์แทร็ก/นิ้วเหมือนปรับแสงรูป แต่ไม่มีไอคอนข้าง */
const FullWidthRangeRow = ({
  mainLabel,
  valueForLabel,
  min,
  max,
  step = 1,
  value,
  onChange,
  posPct,
  trackAriaLabel,
  accentColor,
  mt = 1.5,
  /** ระยะใต้หัวข้อก่อนแทร็ก — ค่าเริ่มต้นเท่า “ระยะด้านบน”; ลดได้เมื่อต้องการชิดสไลด์กับหัวข้อ */
  labelMb = 1.25,
  rangeWrapClassName = "w-full pt-[2px] pb-[2px] px-[2px]",
  formatLabelValue = null,
}) => (
  <Box sx={{ width: "100%", px: 0.25, mt }} aria-label={trackAriaLabel}>
    {mainLabel != null ? (
      <MainLabel
        label={mainLabel}
        value={valueForLabel}
        mb={labelMb}
        formatValue={formatLabelValue}
      />
    ) : null}
    <div className={rangeWrapClassName}>
      <Range
        min={min}
        max={max}
        step={step}
        value={value}
        handleChange={(e) => onChange(Number(e.target.value))}
        pos={posPct}
        color={accentColor || "#0d9488"}
        className={THEME_RANGE_INPUT_CLASS}
      />
    </div>
  </Box>
);

const BOLD_BTN_ACTIVE =
  "border-transparent text-white shadow-sm";
const BOLD_BTN_NORMAL =
  "border-slate-200 bg-white text-slate-800 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800/90 dark:text-slate-100 dark:hover:bg-slate-800";
const BOLD_BTN_BASE =
  "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border transition outline-none focus-visible:ring-2 focus-visible:ring-slate-400/60 dark:focus-visible:ring-white/25";

const HeadingElementOffcanvas = ({
  element,
  onUpdate,
  close,
  textColor,
  theme,
}) => {
  const layoutSyncRafRef = useRef(0);
  const pendingLayoutRef = useRef(null);
  const elementRef = useRef(element);
  elementRef.current = element;

  const scheduleLayoutSync = useCallback(
    (next) => {
      const base = elementRef.current || {};
      const merged = {
        ...base,
        ...next,
        type: next?.type ?? base.type ?? "heading",
        id: next?.id != null ? next.id : base?.id,
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
    [onUpdate]
  );

  const [data, setData] = useState(element);
  const [headingGradientPicker, setHeadingGradientPicker] = useState("start");

  useEffect(() => {
    if (!element?.id) return;
    setData((prev) => {
      if (!prev || prev.id !== element.id) return element;
      return prev;
    });
  }, [element]);

  useEffect(() => {
    if (!Boolean(data?.headingTextGradient)) {
      setHeadingGradientPicker("start");
    }
  }, [data?.id, data?.headingTextGradient]);

  const patch = (partial) => {
    setData((prev) => {
      const next = { ...prev, ...partial };
      scheduleLayoutSync(next);
      return next;
    });
  };

  const merged = useMemo(() => mergeHeadingElement(data), [data]);

  const boldBtnActiveStyle = useMemo(
    () => ({
      backgroundColor: textColor || "#0d9488",
      color: "#fff",
      boxShadow: "0 1px 2px rgb(0 0 0 / 0.12)",
    }),
    [textColor]
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

  const fontSize = Math.min(
    72,
    Math.max(
      12,
      Number(merged.headingFontSize) || HEADING_ELEMENT_DEFAULTS.headingFontSize
    )
  );
  const lineGapFromHeading = Math.min(
    32,
    Math.max(
      0,
      Number(merged.headingDividerGap) ??
        HEADING_ELEMENT_DEFAULTS.headingDividerGap
    )
  );
  const letterSpacing = Math.min(
    8,
    Math.max(
      -2,
      Number(merged.headingLetterSpacing) ??
        HEADING_ELEMENT_DEFAULTS.headingLetterSpacing
    )
  );

  const headingOpacity = merged.headingColorOpacity ?? 255;
  const activeHeadingColorKey =
    merged.headingTextGradient && headingGradientPicker === "end"
      ? "headingColor2"
      : "headingColor";

  const headingGradientDegRaw = Number(merged.headingGradientDegrees);
  const headingGradientDeg = Number.isFinite(headingGradientDegRaw)
    ? Math.min(360, Math.max(0, headingGradientDegRaw))
    : HEADING_ELEMENT_DEFAULTS.headingGradientDegrees;

  const dividerWidth = Math.min(
    12,
    Math.max(
      1,
      Number(merged.headingDividerWidth) ||
        HEADING_ELEMENT_DEFAULTS.headingDividerWidth
    )
  );
  const dividerGap = Math.min(
    32,
    Math.max(
      0,
      Number(merged.headingDividerGap) ??
        HEADING_ELEMENT_DEFAULTS.headingDividerGap
    )
  );
  const dividerOpacity = merged.headingDividerOpacity ?? 255;
  const dividerSpanPct = Math.min(
    100,
    Math.max(
      10,
      Number(merged.headingDividerSpanPercent) ??
        HEADING_ELEMENT_DEFAULTS.headingDividerSpanPercent
    )
  );
  const dividerSpanIsWide =
    dividerSpanPct >= HEADING_DIVIDER_SPAN_WIDE_THRESHOLD;

  return (
    <aside
      className={`flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden bg-white dark:bg-gray-900/80 border-r border-slate-200 dark:border-white/10`}
    >
      <div className="shrink-0 px-6 pt-5 pb-3 flex items-center justify-between bg-gray-100 dark:bg-gray-900/50">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 font-bold tracking-wide text-slate-800 dark:text-white/90">
            Heading
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
        <ul className="mt-4 pl-1 space-y-2">
          <li>
            <Box sx={{ width: "100%", px: 0.25 }}>
              <div className="mb-3">
                <MainLabel label="ข้อความ" mb={1.25} />
                <div className="flex items-center gap-2">
                  <Field
                    value={
                      typeof merged.label === "string"
                        ? merged.label
                        : HEADING_ELEMENT_DEFAULTS.label
                    }
                    handleChange={(e) => patch({ label: e.target.value })}
                    placeholder="ระบุข้อความ ....."
                    id="heading-label-input"
                    type="text"
                    className={HEADING_LABEL_FIELD_CLASS}
                  />
                  <button
                    type="button"
                    aria-label="ตัวหนา"
                    aria-pressed={Boolean(merged.headingBold)}
                    onClick={() =>
                      patch({ headingBold: !Boolean(merged.headingBold) })
                    }
                    className={`${BOLD_BTN_BASE} ${
                      merged.headingBold ? BOLD_BTN_ACTIVE : BOLD_BTN_NORMAL
                    }`}
                    style={
                      merged.headingBold ? boldBtnActiveStyle : undefined
                    }
                  >
                    <Bold className="size-4" strokeWidth={2.5} aria-hidden />
                  </button>
                </div>
              </div>
            </Box>
          </li>

          <li>
            <Box sx={{ width: "100%", px: 0.25}}>
              <MainLabel label="ขนาดตัวอักษร" value={fontSize} mb={0.25} />
              <FullWidthRangeRow
                mainLabel={null}
                min={12}
                max={72}
                step={1}
                value={fontSize}
                onChange={(v) =>
                  patch({ headingFontSize: Number(v) || 12 })
                }
                posPct={((fontSize - 12) / 60) * 100}
                trackAriaLabel="ขนาดตัวอักษร"
                accentColor={textColor}
                mt={0}
              />

              <div>
                <ButtonGroup
                  fullWidth
                  variant="outlined"
                  disableElevation
                  color="inherit"
                  aria-label="จัดตำแหน่งหัวข้อ"
                  sx={groupRootSx}
                  className="mt-2.5"
                >
                  {HEADING_ALIGN_OPTIONS.map((opt) => {
                    const selected = merged.headingAlign === opt.value;
                    const Icon = opt.Icon;
                    return (
                      <Button
                        key={opt.value}
                        color="inherit"
                        aria-label={opt.ariaLabel}
                        onClick={() => patch({ headingAlign: opt.value })}
                        sx={{
                          ...groupButtonSx(selected, textColor),
                          minWidth: 0,
                          px: 0.5,
                        }}
                      >
                        <Icon
                          className="size-[18px] shrink-0"
                          strokeWidth={3}
                          aria-hidden
                        />
                      </Button>
                    );
                  })}
                </ButtonGroup>
              </div>
            </Box>
          </li>

          <li>
            <Box sx={{ width: "100%", px: 0.25, pt: 0.75 }}>
              <MainLabel
                label="สีข้อความ"
                mb={1}
                handleSwitch={() =>
                  patch({
                    headingTextGradient: !Boolean(
                      merged.headingTextGradient
                    ),
                  })
                }
                checked={Boolean(merged.headingTextGradient)}
                textColor={textColor}
                switchLabel="สีไล่โทน"
              />
              {merged.headingTextGradient ? (
                <ButtonGroup
                  fullWidth
                  variant="outlined"
                  disableElevation
                  color="inherit"
                  aria-label="เลือกจุดไล่โทนที่แก้สี"
                  sx={{ ...groupRootSx, mb: 0 }}
                >
                  {HEADING_GRADIENT_PICK.map((opt) => {
                    const selected =
                      (opt.value === "end" &&
                        headingGradientPicker === "end") ||
                      (opt.value === "start" &&
                        headingGradientPicker !== "end");
                    return (
                      <Button
                        key={opt.value}
                        color="inherit"
                        onClick={() =>
                          setHeadingGradientPicker(
                            opt.value === "end" ? "end" : "start"
                          )
                        }
                        sx={groupButtonSx(selected, textColor)}
                      >
                        {opt.label}
                      </Button>
                    );
                  })}
                </ButtonGroup>
              ) : null}
              <div className="mt-2 w-full rounded-md bg-white px-[0px] pb-[5px] pt-[2px] dark:bg-zinc-800">
                <div className="px-[5px] pb-2">
                  <Range
                    min={0}
                    max={255}
                    value={headingOpacity}
                    step={1}
                    handleChange={(e) =>
                      patch({
                        headingColorOpacity: Number(e.target.value) || 0,
                      })
                    }
                    pos={(headingOpacity / 255) * 100}
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
                    const selected1 = chipSelected(merged.headingColor, color);
                    const selected2 =
                      merged.headingTextGradient &&
                      chipSelected(merged.headingColor2, color);
                    const selected = selected1 || selected2;
                    let margin = "";
                    if (i % 8 !== 0 && (i + 1) % 8 !== 0) {
                      margin += "mx-[65.75px] ";
                    }
                    return (
                      <div className={`${margin}`} key={i}>
                        <button
                          type="button"
                          className="flex size-[25px] items-center justify-center rounded-full border border-slate-200 dark:border-white/15"
                          style={{ backgroundColor: bgColor }}
                          onClick={() =>
                            patch({ [activeHeadingColorKey]: color })
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
              {merged.headingTextGradient ? (
                <FullWidthRangeRow
                  mainLabel="องศาไล่โทน"
                  valueForLabel={Math.round(headingGradientDeg)}
                  min={0}
                  max={360}
                  step={1}
                  value={headingGradientDeg}
                  onChange={(v) =>
                    patch({
                      headingGradientDegrees: Math.min(
                        360,
                        Math.max(0, Number(v) || 0)
                      ),
                    })
                  }
                  posPct={(headingGradientDeg / 360) * 100}
                  trackAriaLabel="องศาไล่โทน"
                  accentColor={textColor}
                  mt={1}
                  labelMb={0.35}
                  rangeWrapClassName="w-full pt-0 pb-[2px] px-[2px]"
                />
              ) : null}
            </Box>
          </li>

          <li>
            <Box sx={{ width: "100%", px: 0.25, pt: 0.75 }}>
              <MainLabel
                label="เส้นคั่น"
                mb={1.25}
                handleSwitch={() =>
                  patch({
                    headingDividerEnabled: !Boolean(
                      merged.headingDividerEnabled
                    ),
                  })
                }
                checked={Boolean(merged.headingDividerEnabled)}
                textColor={textColor}
              />
              {merged.headingDividerEnabled ? (
                <>
                  <ButtonGroup
                    fullWidth
                    variant="outlined"
                    disableElevation
                    color="inherit"
                    aria-label="ตำแหน่งเส้นคั่น"
                    sx={{ ...groupRootSx, mb: 1 }}
                  >
                    {HEADING_DIVIDER_POSITIONS.map((opt) => {
                      const selected =
                        (merged.headingDividerPosition ||
                          HEADING_ELEMENT_DEFAULTS.headingDividerPosition) ===
                        opt.value;
                      return (
                        <Button
                          key={opt.value}
                          color="inherit"
                          onClick={() =>
                            patch({ headingDividerPosition: opt.value })
                          }
                          sx={groupButtonSx(selected, textColor)}
                        >
                          {opt.label}
                        </Button>
                      );
                    })}
                  </ButtonGroup>
                  <div className="mt-0 w-full rounded-md bg-white px-[5px] pb-3 pt-2 dark:bg-zinc-800">
                    <div className="mb-4 grid w-full grid-cols-2 gap-x-3 gap-y-2 items-start">
                      <div className="min-w-0">
                        <DividerSubheading>รูปแบบเส้น</DividerSubheading>
                        <ButtonGroup
                          fullWidth
                          variant="outlined"
                          disableElevation
                          color="inherit"
                          aria-label="รูปแบบเส้นคั่น"
                          sx={{ ...groupRootSx, mb: 0, mt: 0.75}}
                        >
                          {HEADING_DIVIDER_STYLES.map((opt) => {
                            const selected =
                              (merged.headingDividerStyle ||
                                HEADING_ELEMENT_DEFAULTS.headingDividerStyle) ===
                              opt.value;
                            return (
                              <Button
                                key={opt.value}
                                color="inherit"
                                onClick={() =>
                                  patch({ headingDividerStyle: opt.value })
                                }
                                sx={{
                                  ...groupButtonSx(selected, textColor),
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
                      </div>
                      <div className="min-w-0">
                        <DividerSubheading>ความกว้าง</DividerSubheading>
                        <ButtonGroup
                          fullWidth
                          variant="outlined"
                          disableElevation
                          color="inherit"
                          aria-label="ความกว้างเส้นคั่น"
                          sx={{ ...groupRootSx, mb: 0, mt: 0.75 }}
                        >
                          <Button
                            color="inherit"
                            aria-pressed={dividerSpanIsWide}
                            onClick={() =>
                              patch({
                                headingDividerSpanPercent:
                                  HEADING_DIVIDER_SPAN_WIDE,
                              })
                            }
                            sx={groupButtonSx(dividerSpanIsWide, textColor)}
                          >
                            กว้าง
                          </Button>
                          <Button
                            color="inherit"
                            aria-pressed={!dividerSpanIsWide}
                            onClick={() =>
                              patch({
                                headingDividerSpanPercent:
                                  HEADING_DIVIDER_SPAN_NARROW,
                              })
                            }
                            sx={groupButtonSx(!dividerSpanIsWide, textColor)}
                          >
                            แคบ
                          </Button>
                        </ButtonGroup>
                      </div>
                    </div>
                    <div className="grid w-full grid-cols-2 gap-x-3 gap-y-2 items-start">
                      <FullWidthRangeRow
                        mainLabel="ความหนาเส้น"
                        valueForLabel={dividerWidth}
                        min={1}
                        max={12}
                        step={1}
                        value={dividerWidth}
                        onChange={(v) =>
                          patch({
                            headingDividerWidth: Math.min(
                              12,
                              Math.max(1, Number(v) || 1)
                            ),
                          })
                        }
                        posPct={((dividerWidth - 1) / 11) * 100}
                        trackAriaLabel="ความหนาเส้นคั่น"
                        accentColor={textColor}
                        mt={0}
                        labelMb={0.35}
                        rangeWrapClassName="w-full pt-0 pb-[2px] px-[2px]"
                      />
                      <FullWidthRangeRow
                        mainLabel="ระยะห่างจากข้อความ"
                        valueForLabel={dividerGap}
                        min={0}
                        max={32}
                        step={1}
                        value={dividerGap}
                        onChange={(v) =>
                          patch({
                            headingDividerGap: Math.min(
                              32,
                              Math.max(0, Number(v) || 0)
                            ),
                          })
                        }
                        posPct={(dividerGap / 32) * 100}
                        trackAriaLabel="ระยะห่างเส้นคั่นกับข้อความ"
                        accentColor={textColor}
                        mt={0}
                        labelMb={0.35}
                      />
                    </div>
                  </div>
                  <DividerSubheading mb={0.25}>
                    สีเส้นคั่น
                  </DividerSubheading>
                  <div className="mt-1 w-full rounded-md bg-white px-[0px] pb-[5px] pt-[2px] dark:bg-zinc-800">
                    <div className="px-[5px] pb-2">
                      <Range
                        min={0}
                        max={255}
                        value={dividerOpacity}
                        step={1}
                        handleChange={(e) =>
                          patch({
                            headingDividerOpacity:
                              Number(e.target.value) || 0,
                          })
                        }
                        pos={(dividerOpacity / 255) * 100}
                        color={textColor || "#0d9488"}
                        className={THEME_RANGE_INPUT_CLASS}
                      />
                    </div>
                    <div className="grid grid-cols-10 place-items-center gap-x-0 gap-y-[6px] px-[5px] pb-2">
                      {allColors.map((color, i) => {
                        const bgColor =
                          typeof color === "string"
                            ? color
                            : theme?.[color.type]?.[color.index];
                        if (bgColor == null) return null;
                        const selected = chipSelected(
                          merged.headingDividerColor,
                          color
                        );
                        let margin = "";
                        if (i % 8 !== 0 && (i + 1) % 8 !== 0) {
                          margin += "mx-[65.75px] ";
                        }
                        return (
                          <div className={`${margin}`} key={i}>
                            <button
                              type="button"
                              className="flex size-[25px] items-center justify-center rounded-full border border-slate-200 dark:border-white/15"
                              style={{ backgroundColor: bgColor }}
                              onClick={() =>
                                patch({ headingDividerColor: color })
                              }
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
                </>
              ) : null}
            </Box>
          </li>

          <li>
            <div className="grid w-full grid-cols-2 gap-x-3 gap-y-4 px-0.5">
              <FullWidthRangeRow
                mainLabel="ระยะห่างตัวอักษร"
                valueForLabel={letterSpacing}
                formatLabelValue={(v) => Number(v).toFixed(1)}
                min={-2}
                max={8}
                step={0.5}
                value={letterSpacing}
                onChange={(v) =>
                  patch({ headingLetterSpacing: Number(v) || 0 })
                }
                posPct={((letterSpacing + 2) / 10) * 100}
                trackAriaLabel="ระยะห่างตัวอักษร"
                accentColor={textColor}
                mt={0}
                labelMb={0.35}
              />
              <FullWidthRangeRow
                mainLabel="ระยะห่างเส้นคั่น"
                valueForLabel={lineGapFromHeading}
                min={0}
                max={32}
                step={1}
                value={lineGapFromHeading}
                onChange={(px) => {
                  const gap = Math.min(32, Math.max(0, Number(px) || 0));
                  patch({
                    headingDividerGap: gap,
                  });
                }}
                posPct={(lineGapFromHeading / 32) * 100}
                trackAriaLabel="ระยะห่างเส้นคั่น"
                accentColor={textColor}
                mt={0}
                labelMb={0.35}
              />
              <FullWidthRangeRow
                mainLabel="ระยะด้านบน"
                valueForLabel={merged.headingMarginTop ?? 0}
                min={0}
                max={80}
                step={1}
                value={merged.headingMarginTop ?? 0}
                onChange={(v) =>
                  patch({ headingMarginTop: Number(v) || 0 })
                }
                posPct={((merged.headingMarginTop ?? 0) / 80) * 100}
                trackAriaLabel="ระยะด้านบน"
                accentColor={textColor}
                mt={0}
                labelMb={0.35}
              />
              <FullWidthRangeRow
                mainLabel="ระยะด้านล่าง"
                valueForLabel={merged.headingMarginBottom ?? 0}
                min={0}
                max={80}
                step={1}
                value={merged.headingMarginBottom ?? 0}
                onChange={(v) =>
                  patch({ headingMarginBottom: Number(v) || 0 })
                }
                posPct={((merged.headingMarginBottom ?? 0) / 80) * 100}
                trackAriaLabel="ระยะด้านล่าง"
                accentColor={textColor}
                mt={0}
                labelMb={0.35}
              />
            </div>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default HeadingElementOffcanvas;
