import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Button, ButtonGroup, Stack, Switch, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import Range from "../HTML/Range";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowUp,
  Check,
  Copy,
  Minus,
  Plus,
  Trash2,
} from "lucide-react";
import lodash from "lodash";
import {
  mergeListElement,
  LIST_ELEMENT_DEFAULTS,
  LIST_ICONS_DEFAULT_ICON_SIZE_ROW,
  LIST_ICONS_DEFAULT_ICON_SIZE_COLUMN,
  LIST_IMAGE_ASIDE_DEFAULT_TEXT,
  LIST_IMAGE_DEFAULT_CONTAINER_SIZE,
  LIST_IMAGE_DEFAULT_LIST_MARGIN,
  LIST_IMAGE_DEFAULT_CAPTION_FONT_SIZE,
  listItemGlyphColorAfterFrameToggle,
  listIconsIconBgIsDefaultPaletteGray,
  buildListIconsFramedAppearanceSnapshot,
} from "../Layouts/Elements/listElementConfig";
import { LIST_BOX_ICON_SHAPE_OPTIONS } from "../Layouts/Elements/listBoxElementConfig";
import MainLabel from "../HTML/MainLabel";
import { swatchSelectedCheckClassName } from "../Layouts/Elements/swatchCheckClass";
import { THEME_PANEL_BASIC_COLOR_SWATCHES } from "../themePanelBasicColors";

const THEME_RANGE_INPUT_CLASS = `
  w-full cursor-pointer appearance-none h-2 rounded-full
  bg-zinc-200 dark:bg-zinc-700
  theme-range-fill-track
  [&::-webkit-slider-runnable-track]:border-0
  [&::-moz-range-track]:border-0
  [&::-webkit-slider-thumb]:cursor-pointer
  [&::-webkit-slider-thumb]:appearance-none
  [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
  [&::-webkit-slider-thumb]:rounded-full
  [&::-webkit-slider-thumb]:bg-slate-900
  [&::-webkit-slider-thumb]:border-0
  [&::-moz-range-thumb]:cursor-pointer
  [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4
  [&::-moz-range-thumb]:rounded-full
  [&::-moz-range-thumb]:bg-slate-900
  [&::-moz-range-thumb]:border-0
`;

const ALIGN_OPTIONS = [
  { value: "flex-start", label: "ชิดซ้าย",  Icon: AlignLeft },
  { value: "center",    label: "ตรงกลาง", Icon: AlignCenter },
  { value: "flex-end",  label: "ชิดขวา",  Icon: AlignRight },
];

const LAYOUT_OPTIONS = [
  { value: "row",    label: "ไอคอนซ้าย + ข้อความขวา" },
  { value: "column", label: "ไอคอนบน + ข้อความล่าง" },
];

/** List iCons — การแสดงผล (บนสุดในแผง) */
const LIST_ICONS_DISPLAY_MODE_OPTIONS = [
  { value: "iconText", label: "ไอคอน + ข้อความ" },
  { value: "icon", label: "ไอคอน" },
  { value: "text", label: "ข้อความ" },
];

const DIVIDER_OPTIONS = [
  { value: "none",   label: "ไม่มี" },
  { value: "solid",  label: "ตรง" },
  { value: "dashed", label: "ประ" },
  { value: "dotted", label: "จุด" },
];

/** ตำแหน่งแถวไอคอน+ข้อความ — List iTems เท่านั้น (split = placeholder ยังไม่แยก layout) */
const LIST_ITEMS_ICON_ALIGN_OPTIONS = [
  { value: "start", label: "ชิดซ้าย" },
  { value: "end", label: "ชิดขวา" },
  { value: "split", label: "แยกส่วนประกอบ" },
];

/** List iMage + แยกส่วนประกอบ — สลับด้านข้อความ / รูป */
const LIST_IMAGE_SPLIT_ARRANGEMENT_OPTIONS = [
  { value: "textLeft", label: "ข้อความซ้าย + รูปภาพขวา" },
  { value: "imageLeft", label: "รูปภาพซ้าย + ข้อความขวา" },
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
    lineHeight: 1.2,
    boxShadow: "none",
    ...(selected
      ? {
          backgroundColor: a,
          color: "#fff",
          borderColor: "transparent",
          "&:hover": { backgroundColor: a, borderColor: "transparent" },
        }
      : {
          color: "#1e293b",
          borderColor: "#e2e8f0 !important",
          backgroundColor: "#ffffff",
          "&:hover": { backgroundColor: "#f8fafc", borderColor: "#e2e8f0 !important" },
          ".dark &": {
            color: "#f1f5f9",
            borderColor: "rgba(255,255,255,0.1) !important",
            backgroundColor: "rgba(30,41,59,0.9)",
            "&:hover": { backgroundColor: "rgba(30,41,59,1)", borderColor: "rgba(255,255,255,0.1) !important" },
          },
        }),
    "&.Mui-focusVisible": { outline: `2px solid ${a}`, outlineOffset: 1, boxShadow: "none" },
    "& .MuiTouchRipple-child": { backgroundColor: a },
  };
};

const stepperBtnClass =
  "inline-flex h-[34px] w-10 shrink-0 items-center justify-center border-0 bg-white text-slate-700 transition hover:bg-slate-50 dark:bg-slate-900/80 dark:text-white/90 dark:hover:bg-white/10";
const stepperMidClass =
  "flex h-[34px] min-w-0 flex-1 items-center justify-center border-x border-slate-200 bg-white px-2 text-left text-[12px] font-normal tabular-nums text-slate-800 dark:border-white/10 dark:bg-slate-900/80 dark:text-white/90";

/** ช่องกลางแบบพิมพ์ได้ — min แคบลงให้ปุ่ม ± กว้างขึ้น; ยังพอเลข 2 หลัก */
const stepperMidNumericClass =
  "flex h-[34px] min-w-[1.5rem] flex-1 items-stretch justify-center border-x border-slate-200 bg-white px-0.5 dark:border-white/10 dark:bg-slate-900/80";

const itemRowReorderBtnClass =
  "rounded p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-35 dark:hover:bg-white/10 dark:hover:text-white/80";

/** Switch แบบ Counter panel */
const ListImagePanelSwitch = styled(Switch, {
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

const LIST_IMAGE_PANEL_INPUT_CLASS =
  "box-border w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-800 outline-none transition focus:border-slate-300 dark:border-white/10 dark:bg-slate-900/40 dark:text-white/90 dark:focus:border-white/20";

function ListImagePanelRangeRow({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  onCommit,
  textColor,
  formatLabelValue,
  /** ใช้ในกริดแผง List — ไม่เว้น margin บน, ขนาดหัวข้อเท่าฟิลด์อื่นในแถว */
  compact = false,
}) {
  const posPct = ((value - min) / (max - min)) * 100;
  return (
    <Box
      sx={{ width: "100%", px: 0.25, mt: compact ? 0 : 2 }}
      aria-label={label}
    >
      <div className="mb-1">
        <Typography
          component="div"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flex: 1,
            fontSize: compact ? 12 : 13,
            fontWeight: 600,
            color: "rgb(51 65 85)",
            mb: 0.35,
            fontVariantNumeric: "tabular-nums",
            ".dark &": { color: "rgba(255,255,255,0.78)" },
          }}
        >
          {label}{" "}
          <span className="text-slate-400 dark:text-slate-400">
            {formatLabelValue ? formatLabelValue(value) : Math.round(value)}
          </span>
          <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
        </Typography>
      </div>
      <div className="w-full px-[2px] pb-[2px] pt-[2px]">
        <Range
          min={min}
          max={max}
          step={step}
          value={value}
          handleChange={(e) => {
            const n = Number(e.target.value);
            const v = Number.isFinite(n)
              ? Math.max(min, Math.min(max, n))
              : value;
            onChange(v);
          }}
          onCommit={onCommit ? (v) => onCommit(v) : undefined}
          pos={posPct}
          color={textColor || "#0d9488"}
        />
      </div>
    </Box>
  );
}

/** กรอกตัวเลขในช่อง stepper — clamp ตอน blur / Enter */
function parseStepperDigits(raw, min, max) {
  const digits = String(raw).replace(/[^\d]/g, "");
  if (digits === "") return null;
  const n = parseInt(digits, 10);
  if (!Number.isFinite(n)) return null;
  return Math.min(max, Math.max(min, n));
}

function NumericStepper({
  value,
  min,
  max,
  onChange,
  decLabel = "ลดจำนวน",
  incLabel = "เพิ่มจำนวน",
}) {
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

  return (
    <div className="flex w-full overflow-hidden rounded-md border border-slate-200 dark:border-white/10">
      <button
        type="button"
        className={stepperBtnClass}
        aria-label={decLabel}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Minus className="h-4 w-4 shrink-0" strokeWidth={2.35} aria-hidden />
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
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <Plus className="h-4 w-4 shrink-0" strokeWidth={2.35} aria-hidden />
      </button>
    </div>
  );
}

const LIST_ITEMS_ICON_BG_SLIDER_MIN = 28;
const LIST_ITEMS_ICON_BG_SLIDER_MAX = 160;
const LIST_ITEMS_ICON_SIZE_SLIDER_MIN = 12;
const LIST_ITEMS_ICON_SIZE_SLIDER_MAX = 96;
const LIST_ITEMS_ICON_CORNER_SLIDER_MIN = 0;
const LIST_ITEMS_ICON_CORNER_SLIDER_MAX = 80;

const ListElementOffcanvas = ({ element, onUpdate, close, textColor, theme }) => {
  const [draft, setDraft] = useState(() => mergeListElement(element));

  useEffect(() => {
    setDraft(mergeListElement(element));
  }, [element]);

  const commit = useCallback(
    (next) => {
      const cleaned = mergeListElement(next);
      onUpdate?.(cleaned);
    },
    [onUpdate]
  );

  const allColors = useMemo(() => {
    if (!theme?.mainColor?.length) return [];
    const mc = theme.mainColor.map((_, i) => ({ type: "mainColor", index: i }));
    const tc = (theme.textColor || []).map((_, i) => ({ type: "textColor", index: i }));
    const oc = (theme.otherColor || []).map((_, i) => ({ type: "otherColor", index: i }));
    return [...mc, ...tc, ...oc, ...THEME_PANEL_BASIC_COLOR_SWATCHES];
  }, [theme]);

  const chipSelected = (active, chip) => {
    if (typeof active === "string" && typeof chip === "string")
      return active.toLowerCase() === chip.toLowerCase();
    if (active && typeof active === "object" && chip && typeof chip === "object")
      return active.type === chip.type && active.index === chip.index;
    return false;
  };

  const items = draft.listItems || [];

  const handleCountChange = (newCount) => {
    const clamped = Math.min(12, Math.max(1, newCount));
    const m = mergeListElement({ ...draft, listItemCount: clamped });
    setDraft(m);
    commit(m);
  };

  const moveItem = (fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= items.length) return;
    const next = [...items];
    [next[fromIdx], next[toIdx]] = [next[toIdx], next[fromIdx]];
    const m = mergeListElement({ ...draft, listItems: next, listItemCount: next.length });
    setDraft(m);
    commit(m);
  };

  const deleteItem = (idx) => {
    if (items.length <= 1) return;
    const next = items.filter((_, j) => j !== idx);
    const m = mergeListElement({ ...draft, listItems: next, listItemCount: next.length });
    setDraft(m);
    commit(m);
  };

  const cloneItem = (idx) => {
    if (items.length >= 12) return;
    const next = [...items];
    next.splice(idx + 1, 0, lodash.cloneDeep(items[idx]));
    const m = mergeListElement({ ...draft, listItems: next, listItemCount: next.length });
    setDraft(m);
    commit(m);
  };

  return (
    <aside
      className="flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden bg-white dark:bg-gray-900/80 border-r border-slate-200 dark:border-white/10"
      style={{ color: textColor || undefined }}
    >
      {/* Header */}
      <div className="shrink-0 px-6 pt-5 pb-3 flex items-center justify-between bg-gray-100 dark:bg-slate-800/60">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 font-bold tracking-wide text-slate-800 dark:text-white/90">
            {element?.listIconsElement
              ? "List iCons"
              : element?.listImageElement
                ? "List Images"
                : "List Items"}
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

      {/* Body */}
      <nav className="flex-1 min-h-0 overflow-y-auto">
        <ul className="list-none m-0 p-0">
          <li className="px-5 py-4">
            <Stack spacing={3}>
              {/* การแสดงผล — เฉพาะ List iCons (บนสุด) */}
              {draft.listIconsElement === true && (
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="shrink-0 text-[12px] font-semibold text-slate-700 dark:text-white/80">
                      การแสดงผล
                    </span>
                    <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
                  </div>
                  <ButtonGroup variant="outlined" fullWidth sx={dividerGroupRootSx}>
                    {LIST_ICONS_DISPLAY_MODE_OPTIONS.map(({ value, label }) => {
                      const sel = (draft.listIconsDisplayMode ?? "iconText") === value;
                      return (
                        <Button
                          key={value}
                          sx={dividerBtnSx(sel, textColor)}
                          onClick={() => {
                            const m = mergeListElement({
                              ...draft,
                              listIconsDisplayMode: value,
                            });
                            setDraft(m);
                            commit(m);
                          }}
                        >
                          <span className="text-[11px] leading-tight">{label}</span>
                        </Button>
                      );
                    })}
                  </ButtonGroup>
                </div>
              )}

              {/* รูปแบบ — เฉพาะ List iCons + การแสดงผลแบบไอคอน+ข้อความ (แนวซ้ายขวา/บนล่างไม่ใช้เมื่อเหลืออย่างใดอย่างหนึ่ง) */}
              {draft.listIconsElement === true &&
                (draft.listIconsDisplayMode ?? "iconText") === "iconText" && (
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="shrink-0 text-[12px] font-semibold text-slate-700 dark:text-white/80">
                      รูปแบบ
                    </span>
                    <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
                  </div>
                  <ButtonGroup variant="outlined" fullWidth sx={dividerGroupRootSx}>
                    {LAYOUT_OPTIONS.map(({ value, label }) => {
                      const sel = (draft.listIconsLayout ?? "row") === value;
                      return (
                        <Button
                          key={value}
                          sx={dividerBtnSx(sel, textColor)}
                          onClick={() => {
                            const prevLayout = draft.listIconsLayout ?? "row";
                            if (value === prevLayout) return;
                            const newDefaultSize =
                              value === "column"
                                ? LIST_ICONS_DEFAULT_ICON_SIZE_COLUMN
                                : LIST_ICONS_DEFAULT_ICON_SIZE_ROW;
                            const oldDefaultSize =
                              prevLayout === "column"
                                ? LIST_ICONS_DEFAULT_ICON_SIZE_COLUMN
                                : LIST_ICONS_DEFAULT_ICON_SIZE_ROW;
                            const updatedItems = (draft.listItems || []).map((item) => {
                              const curSize = Number(item?.iconSize);
                              const isAtOldDefault =
                                !Number.isFinite(curSize) || curSize === oldDefaultSize;
                              return isAtOldDefault
                                ? { ...item, iconSize: newDefaultSize }
                                : item;
                            });
                            const m = mergeListElement({
                              ...draft,
                              listIconsLayout: value,
                              listItems: updatedItems,
                            });
                            setDraft(m);
                            commit(m);
                          }}
                        >
                          <span className="text-[11px]">{label}</span>
                        </Button>
                      );
                    })}
                  </ButtonGroup>
                </div>
              )}

              {/* พื้นหลังไอคอน — เฉพาะ List iCons */}
              {draft.listIconsElement === true && (() => {
                const d = mergeListElement(draft);
                const frameOn = d.listIconsFrameEnabled === true;
                const listIconsIconBgWidth = Math.max(
                  LIST_ITEMS_ICON_BG_SLIDER_MIN,
                  Math.min(
                    LIST_ITEMS_ICON_BG_SLIDER_MAX,
                    Math.round(
                      Number(d.listIconsIconBgWidth) ||
                        LIST_ELEMENT_DEFAULTS.listIconsIconBgWidth
                    )
                  )
                );
                const listIconsIconSize = Math.max(
                  LIST_ITEMS_ICON_SIZE_SLIDER_MIN,
                  Math.min(
                    LIST_ITEMS_ICON_SIZE_SLIDER_MAX,
                    Math.round(
                      Number(d.listIconsIconSize) ||
                        LIST_ELEMENT_DEFAULTS.listIconsIconSize
                    )
                  )
                );
                const listIconsIconCornerRadius = Math.max(
                  LIST_ITEMS_ICON_CORNER_SLIDER_MIN,
                  Math.min(
                    LIST_ITEMS_ICON_CORNER_SLIDER_MAX,
                    Math.round(
                      Number(d.listIconsIconCornerRadius) ||
                        LIST_ELEMENT_DEFAULTS.listIconsIconCornerRadius
                    )
                  )
                );
                return (
                  <Box>
                    <Stack spacing={1.5}>
                      <MainLabel
                        label="พื้นหลังไอคอน"
                        mb={0}
                        checked={frameOn}
                        handleSwitch={(e) => {
                          const on = e.target.checked;
                          const rows = draft.listItems || [];
                          const nextItems = on
                            ? rows.map((it) => {
                                const glyphTouched = Boolean(it.listIconsGlyphPanelTouched);
                                const bgTouched = Boolean(it.listIconsBgPanelTouched);
                                return {
                                  ...it,
                                  borderEnabled: true,
                                  backgroundOpacity: 255,
                                  iconColor: glyphTouched
                                    ? it?.iconColor ?? LIST_ELEMENT_DEFAULTS.iconColor
                                    : LIST_ELEMENT_DEFAULTS.iconColor,
                                  ...(bgTouched
                                    ? {}
                                    : listIconsIconBgIsDefaultPaletteGray(it?.backgroundColor)
                                      ? {
                                          backgroundColor: { type: "mainColor", index: 0 },
                                        }
                                      : {}),
                                };
                              })
                            : rows.map((it) => {
                                const glyphTouched = Boolean(it.listIconsGlyphPanelTouched);
                                const bgTouched = Boolean(it.listIconsBgPanelTouched);
                                return {
                                  ...it,
                                  borderEnabled: false,
                                  backgroundOpacity: 0,
                                  ...(bgTouched ? { backgroundColor: it?.backgroundColor } : {}),
                                  iconColor:
                                    glyphTouched
                                      ? it?.iconColor ?? LIST_ELEMENT_DEFAULTS.iconColor
                                      : { type: "mainColor", index: 0 },
                                };
                              });
                          let m = mergeListElement({
                            ...lodash.omit(draft, ["listIconsFramedAppearanceSnapshot"]),
                            listIconsFrameEnabled: on,
                            listItems: nextItems,
                            ...(!on ? { listIconsFramedAppearanceSnapshot: null } : {}),
                          });
                          if (on) {
                            m = mergeListElement({
                              ...m,
                              listIconsFramedAppearanceSnapshot:
                                buildListIconsFramedAppearanceSnapshot(m.listItems),
                            });
                          }
                          setDraft(m);
                          commit(m);
                        }}
                        color={textColor}
                      />
                      {frameOn && (
                        <>
                          <ButtonGroup variant="outlined" fullWidth sx={dividerGroupRootSx}>
                            {LIST_BOX_ICON_SHAPE_OPTIONS.map(({ value: shapeVal, label: shapeLabel }) => {
                              const selected =
                                (d.listIconsIconShape === "rounded" ? "rounded" : "circle") ===
                                shapeVal;
                              return (
                                <Button
                                  key={shapeVal}
                                  color="inherit"
                                  sx={dividerBtnSx(selected, textColor)}
                                  onClick={() => {
                                    const rows = draft.listItems || [];
                                    const nextItems = rows.map((it) => ({
                                      ...it,
                                      iconShape: shapeVal,
                                    }));
                                    const m = mergeListElement({
                                      ...draft,
                                      listIconsIconShape: shapeVal,
                                      listItems: nextItems,
                                    });
                                    setDraft(m);
                                    commit(m);
                                  }}
                                >
                                  <span className="text-[11px] leading-tight">{shapeLabel}</span>
                                </Button>
                              );
                            })}
                          </ButtonGroup>
                          {(d.listIconsIconShape || "circle") === "rounded" && (
                            <ListImagePanelRangeRow
                              compact
                              label="มุมมน"
                              value={listIconsIconCornerRadius}
                              min={LIST_ITEMS_ICON_CORNER_SLIDER_MIN}
                              max={LIST_ITEMS_ICON_CORNER_SLIDER_MAX}
                              step={1}
                              textColor={textColor}
                              onChange={(v) => {
                                const rows = draft.listItems || [];
                                const nextItems = rows.map((it) => ({
                                  ...it,
                                  iconCornerRadius: v,
                                }));
                                const m = mergeListElement({
                                  ...draft,
                                  listIconsIconCornerRadius: v,
                                  listItems: nextItems,
                                });
                                setDraft(m);
                                commit(m);
                              }}
                            />
                          )}
                        </>
                      )}
                    </Stack>
                    {frameOn && (
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <ListImagePanelRangeRow
                          compact
                          label="ความกว้าง"
                          value={listIconsIconBgWidth}
                          min={LIST_ITEMS_ICON_BG_SLIDER_MIN}
                          max={LIST_ITEMS_ICON_BG_SLIDER_MAX}
                          step={1}
                          textColor={textColor}
                          onChange={(v) => {
                            const rows = draft.listItems || [];
                            const nextItems = rows.map((it) => ({
                              ...it,
                              containerSize: v,
                            }));
                            const m = mergeListElement({
                              ...draft,
                              listIconsIconBgWidth: v,
                              listItems: nextItems,
                            });
                            setDraft(m);
                            commit(m);
                          }}
                        />
                        <ListImagePanelRangeRow
                          compact
                          label="ขนาดไอคอน"
                          value={listIconsIconSize}
                          min={LIST_ITEMS_ICON_SIZE_SLIDER_MIN}
                          max={LIST_ITEMS_ICON_SIZE_SLIDER_MAX}
                          step={1}
                          textColor={textColor}
                          onChange={(v) => {
                            const rows = draft.listItems || [];
                            const nextItems = rows.map((it) => ({
                              ...it,
                              iconSize: v,
                            }));
                            const m = mergeListElement({
                              ...draft,
                              listIconsIconSize: v,
                              listItems: nextItems,
                            });
                            setDraft(m);
                            commit(m);
                          }}
                        />
                      </div>
                    )}
                  </Box>
                );
              })()}

              {/* ตำแหน่ง — เฉพาะ List iCons */}
              {draft.listIconsElement === true && (
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="shrink-0 text-[12px] font-semibold text-slate-700 dark:text-white/80">
                      ตำแหน่ง
                    </span>
                    <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
                  </div>
                  <ButtonGroup variant="outlined" fullWidth sx={dividerGroupRootSx}>
                    {ALIGN_OPTIONS.map(({ value, label, Icon }) => {
                      const sel = (draft.listIconsAlign ?? "flex-start") === value;
                      return (
                        <Button
                          key={value}
                          title={label}
                          sx={dividerBtnSx(sel, textColor)}
                          onClick={() => {
                            const m = { ...draft, listIconsAlign: value };
                            setDraft(m);
                            commit(m);
                          }}
                        >
                          <Icon size={15} strokeWidth={3.5} />
                        </Button>
                      );
                    })}
                  </ButtonGroup>
                </div>
              )}

              {/* ขนาดรูปภาพ — เฉพาะ List iMage */}
              {draft.listImageElement === true && (
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="shrink-0 text-[12px] font-semibold text-slate-700 dark:text-white/80">
                      ขนาดรูปภาพ
                    </span>
                    <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
                  </div>
                  {(() => {
                    const LIST_IMAGE_SIZE_MIN = 28;
                    const LIST_IMAGE_SIZE_MAX = 120;
                    const raw =
                      Number.isFinite(Number(draft.containerSize))
                        ? Number(draft.containerSize)
                        : Number.isFinite(Number(items[0]?.containerSize))
                          ? Number(items[0].containerSize)
                          : LIST_IMAGE_DEFAULT_CONTAINER_SIZE;
                    const imageSizeVal = Math.max(
                      LIST_IMAGE_SIZE_MIN,
                      Math.min(LIST_IMAGE_SIZE_MAX, raw)
                    );
                    const fillPct =
                      ((imageSizeVal - LIST_IMAGE_SIZE_MIN) /
                        (LIST_IMAGE_SIZE_MAX - LIST_IMAGE_SIZE_MIN)) *
                      100;
                    return (
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min={LIST_IMAGE_SIZE_MIN}
                          max={LIST_IMAGE_SIZE_MAX}
                          step={2}
                          value={imageSizeVal}
                          className={THEME_RANGE_INPUT_CLASS}
                          style={{
                            "--fill": textColor || "#0d9488",
                            "--pos": `${fillPct}%`,
                          }}
                          aria-label="ขนาดรูปภาพ"
                          onChange={(e) => {
                            const nextSize = Math.max(
                              LIST_IMAGE_SIZE_MIN,
                              Math.min(LIST_IMAGE_SIZE_MAX, Number(e.target.value))
                            );
                            const nextItems = items.map((it) => ({
                              ...it,
                              containerSize: nextSize,
                            }));
                            const m = mergeListElement({
                              ...draft,
                              containerSize: nextSize,
                              listItems: nextItems,
                            });
                            setDraft(m);
                            commit(m);
                          }}
                        />
                        <span className="w-11 shrink-0 text-right text-[11px] tabular-nums text-slate-600 dark:text-white/70">
                          {imageSizeVal}px
                        </span>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* จำนวนรายการ | ระยะห่างนอกไอเทม (per-item vertical gap) | ระยะห่างในไอเทม */}
              <div className="grid grid-cols-3 gap-x-2 gap-y-3">
                <div className="min-w-0">
                  <div className="mb-2 flex items-center gap-1">
                    <span className="shrink-0 text-[11px] font-semibold text-slate-700 dark:text-white/80">
                      จำนวนรายการ
                    </span>
                    <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
                  </div>
                  <NumericStepper
                    value={items.length}
                    min={1}
                    max={12}
                    decLabel="ลดจำนวนรายการ"
                    incLabel="เพิ่มจำนวนรายการ"
                    onChange={handleCountChange}
                  />
                </div>
                <div className="min-w-0">
                  <div className="mb-2 flex items-center gap-1">
                    <span className="shrink-0 text-[11px] font-semibold text-slate-700 dark:text-white/80">
                      ระยะห่างนอกไอเทม
                    </span>
                    <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
                  </div>
                  <NumericStepper
                    value={(() => {
                      const raw = Number(draft.listItemRowGap);
                      return Number.isFinite(raw)
                        ? Math.max(0, Math.min(48, raw))
                        : LIST_ELEMENT_DEFAULTS.listItemRowGap;
                    })()}
                    min={0}
                    max={48}
                    decLabel="ลดระยะห่างนอกไอเทม"
                    incLabel="เพิ่มระยะห่างนอกไอเทม"
                    onChange={(v) => {
                      const m = mergeListElement({ ...draft, listItemRowGap: v });
                      setDraft(m);
                      commit(m);
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <div className="mb-2 flex items-center gap-1">
                    <span className="shrink-0 text-[11px] font-semibold text-slate-700 dark:text-white/80">
                      ระยะห่างในไอเทม
                    </span>
                    <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
                  </div>
                  <NumericStepper
                    value={
                      draft.listIconTextGapPx ??
                      LIST_ELEMENT_DEFAULTS.listIconTextGapPx
                    }
                    min={0}
                    max={48}
                    decLabel="ลดระยะห่างในไอเทม"
                    incLabel="เพิ่มระยะห่างในไอเทม"
                    onChange={(v) => {
                      const m = mergeListElement({ ...draft, listIconTextGapPx: v });
                      setDraft(m);
                      commit(m);
                    }}
                  />
                </div>
              </div>

              <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-2">
                <div className="min-w-0">
                  {(() => {
                    const raw = Number(draft.listMarginTop);
                    const listMarginTopVal = Number.isFinite(raw)
                      ? Math.max(0, Math.min(80, raw))
                      : draft.listImageElement === true
                        ? LIST_IMAGE_DEFAULT_LIST_MARGIN
                        : LIST_ELEMENT_DEFAULTS.listMarginTop;
                    return (
                      <ListImagePanelRangeRow
                        compact
                        label="ระยะด้านบน"
                        value={listMarginTopVal}
                        min={0}
                        max={80}
                        step={1}
                        textColor={textColor}
                        onChange={(v) => {
                          const m = mergeListElement({ ...draft, listMarginTop: v });
                          setDraft(m);
                          commit(m);
                        }}
                      />
                    );
                  })()}
                </div>
                <div className="min-w-0">
                  {(() => {
                    const raw = Number(draft.listMarginBottom);
                    const listMarginBottomVal = Number.isFinite(raw)
                      ? Math.max(0, Math.min(80, raw))
                      : draft.listImageElement === true
                        ? LIST_IMAGE_DEFAULT_LIST_MARGIN
                        : LIST_ELEMENT_DEFAULTS.listMarginBottom;
                    return (
                      <ListImagePanelRangeRow
                        compact
                        label="ระยะด้านล่าง"
                        value={listMarginBottomVal}
                        min={0}
                        max={80}
                        step={1}
                        textColor={textColor}
                        onChange={(v) => {
                          const m = mergeListElement({ ...draft, listMarginBottom: v });
                          setDraft(m);
                          commit(m);
                        }}
                      />
                    );
                  })()}
                </div>
              </div>

              {/* สีกรอบ — List Image */}
              {(() => {
                const d = mergeListElement(draft);
                if (!d.listImageElement) return null;
                const listImgFrameEnabled = d.listItemRowFrameEnabled === true;
                const listImgFrameOpacity = Number.isFinite(Number(d.listItemRowFrameOpacity))
                  ? Math.max(0, Math.min(255, Number(d.listItemRowFrameOpacity)))
                  : LIST_ELEMENT_DEFAULTS.listItemRowFrameOpacity;
                const listImgFrameRadius = Number.isFinite(Number(d.listItemRowFrameRadius))
                  ? Math.max(0, Math.min(64, Number(d.listItemRowFrameRadius)))
                  : LIST_ELEMENT_DEFAULTS.listItemRowFrameRadius;
                const listImgFrameColor =
                  d.listItemRowFrameColor ?? LIST_ELEMENT_DEFAULTS.listItemRowFrameColor;
                const listImgFrameGlass = Math.max(
                  0,
                  Math.min(
                    100,
                    Math.round(
                      Number.isFinite(Number(d.listItemRowFrameGlass))
                        ? Number(d.listItemRowFrameGlass)
                        : LIST_ELEMENT_DEFAULTS.listItemRowFrameGlass
                    )
                  )
                );
                return (
                  <Stack spacing={1.5} sx={{ mt: "14px !important" }}>
                    <Box sx={{ width: "100%" }}>
                      <div className="mb-2 flex w-full items-center gap-2 pr-0.5">
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
                        <ListImagePanelSwitch
                          className="shrink-0"
                          accentColor={textColor || "#0d9488"}
                          checked={listImgFrameEnabled}
                          onChange={(e) => {
                            const m = mergeListElement({
                              ...draft,
                              listItemRowFrameEnabled: e.target.checked,
                            });
                            setDraft(m);
                            commit(m);
                          }}
                          inputProps={{ "aria-label": "เปิดสีกรอบรายการ" }}
                        />
                      </div>
                      {listImgFrameEnabled ? (
                        <>
                          <div className="w-full px-[2px] pt-[2px] pb-[2px]">
                            <input
                              type="range"
                              min={0}
                              max={255}
                              step={1}
                              value={listImgFrameOpacity}
                              className={THEME_RANGE_INPUT_CLASS}
                              style={{
                                "--fill": textColor || "#0d9488",
                                "--pos": `${(listImgFrameOpacity / 255) * 100}%`,
                              }}
                              aria-label="ความโปร่งแสงสีกรอบ"
                              onChange={(e) => {
                                const v = Number(e.target.value) || 0;
                                const m = mergeListElement({
                                  ...draft,
                                  listItemRowFrameOpacity: v,
                                });
                                setDraft(m);
                                commit(m);
                              }}
                            />
                          </div>
                          <div className="mt-2 grid grid-cols-10 place-items-center gap-y-[6px]">
                            {allColors.map((color, i) => {
                              const bgColor =
                                typeof color === "string"
                                  ? color
                                  : theme?.[color.type]?.[color.index];
                              if (!bgColor) return null;
                              const selected =
                                chipSelected(listImgFrameColor, color) ||
                                listImgFrameColor === color;
                              return (
                                <button
                                  key={`list-img-frame-${i}`}
                                  type="button"
                                  className="flex size-[25px] items-center justify-center rounded-full border border-slate-200 dark:border-white/10"
                                  style={{ backgroundColor: bgColor }}
                                  aria-label={`สีกรอบ ${bgColor}`}
                                  onClick={() => {
                                    const m = mergeListElement({
                                      ...draft,
                                      listItemRowFrameColor: color,
                                    });
                                    setDraft(m);
                                    commit(m);
                                  }}
                                >
                                  {selected && (
                                    <Check
                                      className={swatchSelectedCheckClassName(bgColor)}
                                      strokeWidth={4}
                                      size={11}
                                    />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </>
                      ) : null}
                    </Box>
                    {listImgFrameEnabled ? (
                      <div className="grid grid-cols-2 gap-x-3">
                        <Box sx={{ width: "100%", mt: 1 }}>
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
                              ความโค้งมน
                            </Typography>
                            <span className="text-[12px] text-slate-400 dark:text-slate-400 tabular-nums">
                              {listImgFrameRadius}
                            </span>
                            <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
                          </div>
                          <div className="w-full px-[2px] pt-[2px] pb-[2px]">
                            <input
                              type="range"
                              min={0}
                              max={64}
                              step={1}
                              value={listImgFrameRadius}
                              className={THEME_RANGE_INPUT_CLASS}
                              style={{
                                "--fill": textColor || "#0d9488",
                                "--pos": `${(listImgFrameRadius / 64) * 100}%`,
                              }}
                              aria-label="ระดับความโค้งมนกรอบ"
                              onChange={(e) => {
                                const v = Number(e.target.value) || 0;
                                const m = mergeListElement({
                                  ...draft,
                                  listItemRowFrameRadius: v,
                                });
                                setDraft(m);
                                commit(m);
                              }}
                            />
                          </div>
                        </Box>
                        <Box sx={{ width: "100%", mt: 1 }}>
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
                              กรอบเบลอ
                            </Typography>
                            <span className="text-[12px] text-slate-400 dark:text-slate-400 tabular-nums">
                              {listImgFrameGlass}
                            </span>
                            <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
                          </div>
                          <div className="w-full px-[2px] pt-[2px] pb-[2px]">
                            <input
                              type="range"
                              min={0}
                              max={100}
                              step={1}
                              value={listImgFrameGlass}
                              className={THEME_RANGE_INPUT_CLASS}
                              style={{
                                "--fill": textColor || "#0d9488",
                                "--pos": `${listImgFrameGlass}%`,
                              }}
                              aria-label="ระดับกรอบเบลอ"
                              onChange={(e) => {
                                const v = Number(e.target.value) || 0;
                                const m = mergeListElement({
                                  ...draft,
                                  listItemRowFrameGlass: v,
                                });
                                setDraft(m);
                                commit(m);
                              }}
                            />
                          </div>
                        </Box>
                      </div>
                    ) : null}
                  </Stack>
                );
              })()}

              {/* รูปทรงกรอบ + มุมมน + ความกว้าง + ขนาดไอคอน — List iTems เท่านั้น */}
              {(() => {
                const d = mergeListElement(draft);
                if (d.listIconsElement || d.listImageElement) return null;
                const frameOn = d.listItemIconFrameEnabled !== false;
                const listItemIconBgWidth = Math.max(
                  LIST_ITEMS_ICON_BG_SLIDER_MIN,
                  Math.min(
                    LIST_ITEMS_ICON_BG_SLIDER_MAX,
                    Math.round(
                      Number(d.listItemIconBgWidth) ||
                        LIST_ELEMENT_DEFAULTS.listItemIconBgWidth
                    )
                  )
                );
                const listItemIconSize = Math.max(
                  LIST_ITEMS_ICON_SIZE_SLIDER_MIN,
                  Math.min(
                    LIST_ITEMS_ICON_SIZE_SLIDER_MAX,
                    Math.round(
                      Number(d.listItemIconSize) ||
                        LIST_ELEMENT_DEFAULTS.listItemIconSize
                    )
                  )
                );
                const listItemIconCornerRadius = Math.max(
                  LIST_ITEMS_ICON_CORNER_SLIDER_MIN,
                  Math.min(
                    LIST_ITEMS_ICON_CORNER_SLIDER_MAX,
                    Math.round(
                      Number(d.listItemIconCornerRadius) ||
                        LIST_ELEMENT_DEFAULTS.listItemIconCornerRadius
                    )
                  )
                );
                const listItemIconGlass = Math.max(
                  0,
                  Math.min(
                    100,
                    Math.round(
                      Number.isFinite(Number(d.listItemRowFrameGlass))
                        ? Number(d.listItemRowFrameGlass)
                        : LIST_ELEMENT_DEFAULTS.listItemRowFrameGlass
                    )
                  )
                );
                const listItemFrameEnabled = d.listItemRowFrameEnabled === true;
                const listItemFrameOpacity = Number.isFinite(Number(d.listItemRowFrameOpacity))
                  ? Math.max(0, Math.min(255, Number(d.listItemRowFrameOpacity)))
                  : LIST_ELEMENT_DEFAULTS.listItemRowFrameOpacity;
                const listItemFrameRadius = Number.isFinite(Number(d.listItemRowFrameRadius))
                  ? Math.max(0, Math.min(64, Number(d.listItemRowFrameRadius)))
                  : LIST_ELEMENT_DEFAULTS.listItemRowFrameRadius;
                const listItemFrameColor =
                  d.listItemRowFrameColor ?? LIST_ELEMENT_DEFAULTS.listItemRowFrameColor;
                return (
                  <Box sx={{ mt: "14px !important" }}>
                    <Stack spacing={1.5}>
                      <MainLabel
                        label="พื้นหลังไอคอน"
                        mb={0}
                        checked={frameOn}
                        handleSwitch={(e) => {
                          const on = e.target.checked;
                          const rows = draft.listItems || [];
                          /* เหมือนแผง Icons โหมดแก้ไข: ปิดกรอบ = พื้นหลังโปร่ง, เปิด = คืนความทึบ (เก็บสีพื้นหลังเดิมต่อแถว) */
                          const nextItems = rows.map((it) => {
                            const nextIcon = listItemGlyphColorAfterFrameToggle(on, it?.iconColor);
                            return {
                              ...it,
                              ...(on
                                ? { borderEnabled: true, backgroundOpacity: 255 }
                                : { borderEnabled: false, backgroundOpacity: 0 }),
                              ...(nextIcon !== undefined ? { iconColor: nextIcon } : {}),
                            };
                          });
                          const m = mergeListElement({
                            ...draft,
                            listItemIconFrameEnabled: on,
                            listItems: nextItems,
                          });
                          setDraft(m);
                          commit(m);
                        }}
                        color={textColor}
                      />
                      {frameOn && (
                        <>
                          <ButtonGroup variant="outlined" fullWidth sx={dividerGroupRootSx}>
                            {LIST_BOX_ICON_SHAPE_OPTIONS.map(({ value: shapeVal, label: shapeLabel }) => {
                              const selected =
                                (d.listItemIconShape === "rounded" ? "rounded" : "circle") ===
                                shapeVal;
                              return (
                                <Button
                                  key={shapeVal}
                                  color="inherit"
                                  sx={dividerBtnSx(selected, textColor)}
                                  onClick={() => {
                                    const rows = draft.listItems || [];
                                    const nextItems = rows.map((it) => ({
                                      ...it,
                                      iconShape: shapeVal,
                                    }));
                                    const m = mergeListElement({
                                      ...draft,
                                      listItemIconShape: shapeVal,
                                      listItems: nextItems,
                                    });
                                    setDraft(m);
                                    commit(m);
                                  }}
                                >
                                  <span className="text-[11px] leading-tight">{shapeLabel}</span>
                                </Button>
                              );
                            })}
                          </ButtonGroup>
                          {(d.listItemIconShape || "circle") === "rounded" && (
                            <ListImagePanelRangeRow
                              compact
                              label="มุมมน"
                              value={listItemIconCornerRadius}
                              min={LIST_ITEMS_ICON_CORNER_SLIDER_MIN}
                              max={LIST_ITEMS_ICON_CORNER_SLIDER_MAX}
                              step={1}
                              textColor={textColor}
                              onChange={(v) => {
                                const rows = draft.listItems || [];
                                const nextItems = rows.map((it) => ({
                                  ...it,
                                  iconCornerRadius: v,
                                }));
                                const m = mergeListElement({
                                  ...draft,
                                  listItemIconCornerRadius: v,
                                  listItems: nextItems,
                                });
                                setDraft(m);
                                commit(m);
                              }}
                            />
                          )}
                        </>
                      )}
                      <Box sx={{ width: "100%" }}>
                            <div className="mb-2 flex w-full items-center gap-2 pr-0.5">
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
                              <ListImagePanelSwitch
                                className="shrink-0"
                                accentColor={textColor || "#0d9488"}
                                checked={listItemFrameEnabled}
                                onChange={(e) => {
                                  const m = mergeListElement({
                                    ...draft,
                                    listItemRowFrameEnabled: e.target.checked,
                                  });
                                  setDraft(m);
                                  commit(m);
                                }}
                                inputProps={{ "aria-label": "เปิดสีกรอบรายการ" }}
                              />
                            </div>
                            {listItemFrameEnabled ? (
                              <>
                            <div className="w-full px-[2px] pt-[2px] pb-[2px]">
                              <input
                                type="range"
                                min={0}
                                max={255}
                                step={1}
                                value={listItemFrameOpacity}
                                className={THEME_RANGE_INPUT_CLASS}
                                style={{
                                  "--fill": textColor || "#0d9488",
                                  "--pos": `${(listItemFrameOpacity / 255) * 100}%`,
                                }}
                                aria-label="ความโปร่งแสงสีกรอบ"
                                onChange={(e) => {
                                  const v = Number(e.target.value) || 0;
                                  const m = mergeListElement({
                                    ...draft,
                                    listItemRowFrameOpacity: v,
                                  });
                                  setDraft(m);
                                  commit(m);
                                }}
                              />
                            </div>
                            <div className="mt-2 grid grid-cols-10 place-items-center gap-y-[6px]">
                              {allColors.map((color, i) => {
                                const bgColor =
                                  typeof color === "string"
                                    ? color
                                    : theme?.[color.type]?.[color.index];
                                if (!bgColor) return null;
                                const selected =
                                  chipSelected(listItemFrameColor, color) ||
                                  listItemFrameColor === color;
                                return (
                                  <button
                                    key={`list-item-frame-${i}`}
                                    type="button"
                                    className="flex size-[25px] items-center justify-center rounded-full border border-slate-200 dark:border-white/10"
                                    style={{ backgroundColor: bgColor }}
                                    aria-label={`สีกรอบ ${bgColor}`}
                                    onClick={() => {
                                      const m = mergeListElement({
                                        ...draft,
                                        listItemRowFrameColor: color,
                                      });
                                      setDraft(m);
                                      commit(m);
                                    }}
                                  >
                                    {selected && (
                                      <Check
                                        className={swatchSelectedCheckClassName(bgColor)}
                                        strokeWidth={4}
                                        size={11}
                                      />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                              </>
                            ) : null}
                          </Box>
                          {listItemFrameEnabled ? (
                            <div className="grid grid-cols-2 gap-x-3">
                              <Box sx={{ width: "100%", mt: 1 }}>
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
                                    ความโค้งมน
                                  </Typography>
                                  <span className="text-[12px] text-slate-400 dark:text-slate-400 tabular-nums">
                                    {listItemFrameRadius}
                                  </span>
                                  <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
                                </div>
                                <div className="w-full px-[2px] pt-[2px] pb-[2px]">
                                  <input
                                    type="range"
                                    min={0}
                                    max={64}
                                    step={1}
                                    value={listItemFrameRadius}
                                    className={THEME_RANGE_INPUT_CLASS}
                                    style={{
                                      "--fill": textColor || "#0d9488",
                                      "--pos": `${(listItemFrameRadius / 64) * 100}%`,
                                    }}
                                    aria-label="ระดับความโค้งมนกรอบ"
                                    onChange={(e) => {
                                      const v = Number(e.target.value) || 0;
                                      const m = mergeListElement({
                                        ...draft,
                                        listItemRowFrameRadius: v,
                                      });
                                      setDraft(m);
                                      commit(m);
                                    }}
                                  />
                                </div>
                              </Box>
                              <Box sx={{ width: "100%", mt: 1 }}>
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
                                    กรอบเบลอ
                                  </Typography>
                                  <span className="text-[12px] text-slate-400 dark:text-slate-400 tabular-nums">
                                    {listItemIconGlass}
                                  </span>
                                  <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
                                </div>
                                <div className="w-full px-[2px] pt-[2px] pb-[2px]">
                                  <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    step={1}
                                    value={listItemIconGlass}
                                    className={THEME_RANGE_INPUT_CLASS}
                                    style={{
                                      "--fill": textColor || "#0d9488",
                                      "--pos": `${listItemIconGlass}%`,
                                    }}
                                    aria-label="ระดับกรอบเบลอ"
                                    onChange={(e) => {
                                      const v = Number(e.target.value) || 0;
                                      const m = mergeListElement({
                                        ...draft,
                                        listItemRowFrameGlass: v,
                                      });
                                      setDraft(m);
                                      commit(m);
                                    }}
                                  />
                                </div>
                              </Box>
                            </div>
                          ) : null}
                    </Stack>
                    <div
                      className={`mt-3 grid gap-3 ${
                        frameOn ? "grid-cols-2" : "grid-cols-1"
                      }`}
                    >
                      {frameOn && (
                        <ListImagePanelRangeRow
                          compact
                          label="ความกว้าง"
                          value={listItemIconBgWidth}
                          min={LIST_ITEMS_ICON_BG_SLIDER_MIN}
                          max={LIST_ITEMS_ICON_BG_SLIDER_MAX}
                          step={1}
                          textColor={textColor}
                          onChange={(v) => {
                            const rows = draft.listItems || [];
                            const nextItems = rows.map((it) => ({
                              ...it,
                              containerSize: v,
                            }));
                            const m = mergeListElement({
                              ...draft,
                              listItemIconBgWidth: v,
                              listItems: nextItems,
                            });
                            setDraft(m);
                            commit(m);
                          }}
                        />
                      )}
                      <ListImagePanelRangeRow
                        compact
                        label="ขนาดไอคอน"
                        value={listItemIconSize}
                        min={LIST_ITEMS_ICON_SIZE_SLIDER_MIN}
                        max={LIST_ITEMS_ICON_SIZE_SLIDER_MAX}
                        step={1}
                        textColor={textColor}
                        onChange={(v) => {
                          const rows = draft.listItems || [];
                          const nextItems = rows.map((it) => ({
                            ...it,
                            iconSize: v,
                          }));
                          const m = mergeListElement({
                            ...draft,
                            listItemIconSize: v,
                            listItems: nextItems,
                          });
                          setDraft(m);
                          commit(m);
                        }}
                      />
                    </div>
                  </Box>
                );
              })()}

              {/* ตำแหน่งการจัดวาง — List iTems + List iMage (ไม่ใช่ iCons) */}
              {draft.listIconsElement !== true && (
                <Box sx={{ mt: "14px !important" }}>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="shrink-0 text-[13px] font-semibold text-slate-700 dark:text-white/80">
                      ตำแหน่งการจัดวาง
                    </span>
                    <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
                  </div>
                  <ButtonGroup variant="outlined" fullWidth sx={dividerGroupRootSx}>
                    {LIST_ITEMS_ICON_ALIGN_OPTIONS.map(({ value, label }) => {
                      const raw = draft.listItemsIconAlign;
                      const current =
                        raw === "start" || raw === "end" || raw === "split"
                          ? raw
                          : LIST_ELEMENT_DEFAULTS.listItemsIconAlign;
                      const sel = current === value;
                      return (
                        <Button
                          key={value}
                          color="inherit"
                          sx={dividerBtnSx(sel, textColor)}
                          onClick={() => {
                            const m = mergeListElement({
                              ...draft,
                              listItemsIconAlign: value,
                            });
                            setDraft(m);
                            commit(m);
                          }}
                        >
                          <span className="text-[11px] leading-tight">{label}</span>
                        </Button>
                      );
                    })}
                  </ButtonGroup>
                  {draft.listImageElement === true &&
                    (() => {
                      const rawA = draft.listItemsIconAlign;
                      const curA =
                        rawA === "start" || rawA === "end" || rawA === "split"
                          ? rawA
                          : LIST_ELEMENT_DEFAULTS.listItemsIconAlign;
                      return curA === "split";
                    })() && (
                    <Box sx={{ mt: 2 }}>
                      <div className="mb-2 flex items-center gap-2">
                        <span className="shrink-0 text-[12px] font-semibold text-slate-700 dark:text-white/80">
                          สลับด้าน
                        </span>
                        <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
                      </div>
                      <ButtonGroup variant="outlined" fullWidth sx={dividerGroupRootSx}>
                        {LIST_IMAGE_SPLIT_ARRANGEMENT_OPTIONS.map(({ value, label }) => {
                          const cur =
                            draft.listImageSplitArrangement === "imageLeft"
                              ? "imageLeft"
                              : "textLeft";
                          const sel = cur === value;
                          return (
                            <Button
                              key={value}
                              color="inherit"
                              sx={dividerBtnSx(sel, textColor)}
                              onClick={() => {
                                const m = mergeListElement({
                                  ...draft,
                                  listImageSplitArrangement: value,
                                });
                                setDraft(m);
                                commit(m);
                              }}
                            >
                              <span className="text-[11px] leading-tight">{label}</span>
                            </Button>
                          );
                        })}
                      </ButtonGroup>
                    </Box>
                  )}
                </Box>
              )}

              {/* Divider style */}
              <Box>
                <div className="mb-3 flex items-center gap-2">
                  <span className="shrink-0 text-[13px] font-semibold text-slate-700 dark:text-white/80">
                    เส้นคั่น
                  </span>
                  <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
                  {/* Switch แนวนอน ↔ แนวตั้ง — List iTems และ List iMage */}
                  {draft.listIconsElement !== true && (
                    <div className="flex shrink-0 items-center gap-1.5">
                      <span className={`text-[11px] font-medium tabular-nums transition-colors ${Boolean(draft.listVerticalTimelineDivider) ? "text-slate-400 dark:text-white/30" : "text-slate-600 dark:text-white/70"}`}>
                        แนวนอน
                      </span>
                      <ListImagePanelSwitch
                        accentColor={textColor || "#0d9488"}
                        checked={Boolean(draft.listVerticalTimelineDivider)}
                        onChange={(e) => {
                          const m = mergeListElement({ ...draft, listVerticalTimelineDivider: e.target.checked });
                          setDraft(m);
                          commit(m);
                        }}
                        inputProps={{ "aria-label": "สลับเส้นคั่นแนวตั้ง" }}
                      />
                      <span className={`text-[11px] font-medium tabular-nums transition-colors ${Boolean(draft.listVerticalTimelineDivider) ? "text-slate-600 dark:text-white/70" : "text-slate-400 dark:text-white/30"}`}>
                        แนวตั้ง
                      </span>
                    </div>
                  )}
                </div>
                <ButtonGroup
                  fullWidth
                  variant="outlined"
                  disableElevation
                  color="inherit"
                  sx={dividerGroupRootSx}
                >
                  {DIVIDER_OPTIONS.map((opt) => {
                    const isSelected =
                      opt.value === "none"
                        ? !draft.listDividerEnabled
                        : Boolean(draft.listDividerEnabled) &&
                          (draft.listDividerStyle || "dotted") === opt.value;
                    return (
                      <Button
                        key={opt.value}
                        color="inherit"
                        sx={dividerBtnSx(isSelected, textColor)}
                        onClick={() => {
                          const m = mergeListElement({
                            ...draft,
                            listDividerEnabled: opt.value !== "none",
                            ...(opt.value !== "none" ? { listDividerStyle: opt.value } : {}),
                          });
                          setDraft(m);
                          commit(m);
                        }}
                      >
                        {opt.label}
                      </Button>
                    );
                  })}
                </ButtonGroup>

                {/* Color + opacity — แสดงเมื่อเส้นคั่นเปิดอยู่ */}
                {Boolean(draft.listDividerEnabled) && allColors.length > 0 && (
                  <div className="mt-2.5 rounded-md bg-white px-1 pb-1.5 pt-1 dark:bg-zinc-800">
                    <div className="px-1 pb-2 pt-1">
                      <input
                        type="range"
                        min={0}
                        max={255}
                        step={1}
                        value={Number.isFinite(Number(draft.listDividerOpacity)) ? Number(draft.listDividerOpacity) : 255}
                        className={THEME_RANGE_INPUT_CLASS}
                        style={{ "--fill": textColor || "#0d9488", "--pos": `${((Number.isFinite(Number(draft.listDividerOpacity)) ? Number(draft.listDividerOpacity) : 255) / 255) * 100}%` }}
                        aria-label="ความโปร่งแสงสีเส้นคั่น"
                        onChange={(e) => {
                          const m = mergeListElement({ ...draft, listDividerOpacity: Number(e.target.value) });
                          setDraft(m);
                          commit(m);
                        }}
                      />
                    </div>
                    <div className="grid grid-cols-10 place-items-center gap-y-[6px]">
                      {allColors.map((color, i) => {
                        const bgColor =
                          typeof color === "string"
                            ? color
                            : theme?.[color.type]?.[color.index];
                        if (!bgColor) return null;
                        const activeSwatch =
                          draft.listDividerColor ?? LIST_ELEMENT_DEFAULTS.listDividerColor;
                        const selected =
                          chipSelected(activeSwatch, color) || activeSwatch === color;
                        return (
                          <button
                            key={i}
                            type="button"
                            className="flex size-[25px] items-center justify-center rounded-full border border-slate-200 dark:border-white/10"
                            style={{ backgroundColor: bgColor }}
                            aria-label={`สีเส้นคั่น ${bgColor}`}
                            onClick={() => {
                              const m = mergeListElement({ ...draft, listDividerColor: color });
                              setDraft(m);
                              commit(m);
                            }}
                          >
                            {selected && (
                              <Check
                                className={swatchSelectedCheckClassName(bgColor)}
                                strokeWidth={4}
                                size={11}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Box>

              {/* ข้อความประกอบ — เฉพาะ List iMage (เหนือรายการทั้งหมด) */}
              {draft.listImageElement === true && (
                <Box sx={{ width: "100%" }}>
                  <div className="mb-2 flex w-full items-center gap-2 pr-0.5">
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
                      ข้อความประกอบ
                    </Typography>
                    <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
                    <ListImagePanelSwitch
                      className="shrink-0"
                      accentColor={textColor || "#0d9488"}
                      checked={Boolean(draft.listImageCaptionEnabled)}
                      onChange={(e) => {
                        const enabled = e.target.checked;
                        let patch = { ...draft, listImageCaptionEnabled: enabled };
                        if (enabled && draft.listImageElement) {
                          patch = {
                            ...patch,
                            listItems: (draft.listItems || []).map((it) => {
                              const cur =
                                typeof it?.listAsideText === "string"
                                  ? it.listAsideText.trim()
                                  : "";
                              return {
                                ...it,
                                listAsideText: cur
                                  ? it.listAsideText
                                  : LIST_IMAGE_ASIDE_DEFAULT_TEXT,
                              };
                            }),
                          };
                        }
                        const m = mergeListElement(patch);
                        setDraft(m);
                        commit(m);
                      }}
                      inputProps={{ "aria-label": "เปิดข้อความประกอบ" }}
                    />
                  </div>
                  {draft.listImageCaptionEnabled ? (
                    <>
                      {(() => {
                        const fs = Math.min(
                          28,
                          Math.max(
                            10,
                            Number.isFinite(Number(draft.listImageCaptionFontSize))
                              ? Number(draft.listImageCaptionFontSize)
                              : LIST_IMAGE_DEFAULT_CAPTION_FONT_SIZE
                          )
                        );
                        return (
                          <ListImagePanelRangeRow
                            label="ขนาดข้อความ"
                            value={fs}
                            min={10}
                            max={28}
                            step={1}
                            textColor={textColor}
                            onChange={(v) => {
                              const m = mergeListElement({
                                ...draft,
                                listImageCaptionFontSize: v,
                              });
                              setDraft(m);
                              commit(m);
                            }}
                          />
                        );
                      })()}
                      {(() => {
                        const oy = Math.min(
                          32,
                          Math.max(
                            -32,
                            Number.isFinite(Number(draft.listImageCaptionOffsetY))
                              ? Number(draft.listImageCaptionOffsetY)
                              : 0
                          )
                        );
                        return (
                          <ListImagePanelRangeRow
                            label="ขยับบน - ล่าง"
                            value={oy}
                            min={-32}
                            max={32}
                            step={1}
                            textColor={textColor}
                            formatLabelValue={(v) => {
                              const n = Math.round(v);
                              if (n === 0) return "0";
                              return `${n > 0 ? "+" : ""}${n}`;
                            }}
                            onChange={(v) => {
                              const m = mergeListElement({
                                ...draft,
                                listImageCaptionOffsetY: v,
                              });
                              setDraft(m);
                              commit(m);
                            }}
                          />
                        );
                      })()}
                      {allColors.length > 0 ? (
                        <Box sx={{ width: "100%" }}>
                          <div className="mt-2 flex w-full items-center gap-2 pr-0.5">
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
                              สีข้อความ
                            </Typography>
                            <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
                          </div>
                          <div className="rounded-md bg-white px-1 pb-1.5 pt-1 dark:bg-zinc-800">
                          <div className="px-1 pb-2 pt-1">
                            <input
                              type="range"
                              min={0}
                              max={255}
                              step={1}
                              value={
                                Number.isFinite(Number(draft.listImageCaptionColorOpacity))
                                  ? Number(draft.listImageCaptionColorOpacity)
                                  : 255
                              }
                              className={THEME_RANGE_INPUT_CLASS}
                              style={{
                                "--fill": textColor || "#0d9488",
                                "--pos": `${
                                  ((Number.isFinite(Number(draft.listImageCaptionColorOpacity))
                                    ? Number(draft.listImageCaptionColorOpacity)
                                    : 255) /
                                    255) *
                                  100
                                }%`,
                              }}
                              aria-label="ความโปร่งแสงสีข้อความ"
                              onChange={(e) => {
                                const m = mergeListElement({
                                  ...draft,
                                  listImageCaptionColorOpacity: Number(e.target.value),
                                });
                                setDraft(m);
                                commit(m);
                              }}
                            />
                          </div>
                          <div className="grid grid-cols-10 place-items-center gap-y-[6px] px-1 pb-1">
                            {allColors.map((color, i) => {
                              const bgColor =
                                typeof color === "string"
                                  ? color
                                  : theme?.[color.type]?.[color.index];
                              if (!bgColor) return null;
                              const activeCap =
                                draft.listImageCaptionColor ??
                                draft.listTextColor ??
                                "#000000";
                              const selected =
                                chipSelected(activeCap, color) || activeCap === color;
                              return (
                                <button
                                  key={i}
                                  type="button"
                                  className="flex size-[25px] items-center justify-center rounded-full border border-slate-200 dark:border-white/10"
                                  style={{ backgroundColor: bgColor }}
                                  aria-label={`สีข้อความ ${bgColor}`}
                                  onClick={() => {
                                    const m = mergeListElement({
                                      ...draft,
                                      listImageCaptionColor: color,
                                    });
                                    setDraft(m);
                                    commit(m);
                                  }}
                                >
                                  {selected && (
                                    <Check
                                      className={swatchSelectedCheckClassName(bgColor)}
                                      strokeWidth={4}
                                      size={11}
                                    />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                          </div>
                        </Box>
                      ) : null}
                    </>
                  ) : null}
                </Box>
              )}

              {/* สีกรอบ — List iCons (เหมือน Element Between) */}
              {(() => {
                const d = mergeListElement(draft);
                if (d.listIconsElement !== true) return null;
                const listIconsFrameEnabled = d.listItemRowFrameEnabled === true;
                const listIconsFrameOpacity = Number.isFinite(Number(d.listItemRowFrameOpacity))
                  ? Math.max(0, Math.min(255, Number(d.listItemRowFrameOpacity)))
                  : LIST_ELEMENT_DEFAULTS.listItemRowFrameOpacity;
                const listIconsFrameRadius = Number.isFinite(Number(d.listItemRowFrameRadius))
                  ? Math.max(0, Math.min(64, Number(d.listItemRowFrameRadius)))
                  : LIST_ELEMENT_DEFAULTS.listItemRowFrameRadius;
                const listIconsFrameColor =
                  d.listItemRowFrameColor ?? LIST_ELEMENT_DEFAULTS.listItemRowFrameColor;
                const listIconsFrameGlass = Math.max(
                  0,
                  Math.min(
                    100,
                    Math.round(
                      Number.isFinite(Number(d.listItemRowFrameGlass))
                        ? Number(d.listItemRowFrameGlass)
                        : LIST_ELEMENT_DEFAULTS.listItemRowFrameGlass
                    )
                  )
                );
                return (
                  <Stack spacing={1.5} sx={{ mt: "14px !important" }}>
                    <Box sx={{ width: "100%" }}>
                      <div className="mb-2 flex w-full items-center gap-2 pr-0.5">
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
                        <ListImagePanelSwitch
                          className="shrink-0"
                          accentColor={textColor || "#0d9488"}
                          checked={listIconsFrameEnabled}
                          onChange={(e) => {
                            const m = mergeListElement({
                              ...draft,
                              listItemRowFrameEnabled: e.target.checked,
                            });
                            setDraft(m);
                            commit(m);
                          }}
                          inputProps={{ "aria-label": "เปิดสีกรอบรายการ" }}
                        />
                      </div>
                      {listIconsFrameEnabled ? (
                        <>
                          <div className="w-full px-[2px] pt-[2px] pb-[2px]">
                            <input
                              type="range"
                              min={0}
                              max={255}
                              step={1}
                              value={listIconsFrameOpacity}
                              className={THEME_RANGE_INPUT_CLASS}
                              style={{
                                "--fill": textColor || "#0d9488",
                                "--pos": `${(listIconsFrameOpacity / 255) * 100}%`,
                              }}
                              aria-label="ความโปร่งแสงสีกรอบ"
                              onChange={(e) => {
                                const v = Number(e.target.value) || 0;
                                const m = mergeListElement({
                                  ...draft,
                                  listItemRowFrameOpacity: v,
                                });
                                setDraft(m);
                                commit(m);
                              }}
                            />
                          </div>
                          <div className="mt-2 grid grid-cols-10 place-items-center gap-y-[6px]">
                            {allColors.map((color, i) => {
                              const bgColor =
                                typeof color === "string"
                                  ? color
                                  : theme?.[color.type]?.[color.index];
                              if (!bgColor) return null;
                              const selected =
                                chipSelected(listIconsFrameColor, color) ||
                                listIconsFrameColor === color;
                              return (
                                <button
                                  key={`list-icons-frame-${i}`}
                                  type="button"
                                  className="flex size-[25px] items-center justify-center rounded-full border border-slate-200 dark:border-white/10"
                                  style={{ backgroundColor: bgColor }}
                                  aria-label={`สีกรอบ ${bgColor}`}
                                  onClick={() => {
                                    const m = mergeListElement({
                                      ...draft,
                                      listItemRowFrameColor: color,
                                    });
                                    setDraft(m);
                                    commit(m);
                                  }}
                                >
                                  {selected && (
                                    <Check
                                      className={swatchSelectedCheckClassName(bgColor)}
                                      strokeWidth={4}
                                      size={11}
                                    />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </>
                      ) : null}
                    </Box>
                    {listIconsFrameEnabled ? (
                      <div className="grid grid-cols-2 gap-x-3">
                        <Box sx={{ width: "100%", mt: 1 }}>
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
                              ความโค้งมน
                            </Typography>
                            <span className="text-[12px] text-slate-400 dark:text-slate-400 tabular-nums">
                              {listIconsFrameRadius}
                            </span>
                            <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
                          </div>
                          <div className="w-full px-[2px] pt-[2px] pb-[2px]">
                            <input
                              type="range"
                              min={0}
                              max={64}
                              step={1}
                              value={listIconsFrameRadius}
                              className={THEME_RANGE_INPUT_CLASS}
                              style={{
                                "--fill": textColor || "#0d9488",
                                "--pos": `${(listIconsFrameRadius / 64) * 100}%`,
                              }}
                              aria-label="ระดับความโค้งมนกรอบ"
                              onChange={(e) => {
                                const v = Number(e.target.value) || 0;
                                const m = mergeListElement({
                                  ...draft,
                                  listItemRowFrameRadius: v,
                                });
                                setDraft(m);
                                commit(m);
                              }}
                            />
                          </div>
                        </Box>
                        <Box sx={{ width: "100%", mt: 1 }}>
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
                              กรอบเบลอ
                            </Typography>
                            <span className="text-[12px] text-slate-400 dark:text-slate-400 tabular-nums">
                              {listIconsFrameGlass}
                            </span>
                            <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
                          </div>
                          <div className="w-full px-[2px] pt-[2px] pb-[2px]">
                            <input
                              type="range"
                              min={0}
                              max={100}
                              step={1}
                              value={listIconsFrameGlass}
                              className={THEME_RANGE_INPUT_CLASS}
                              style={{
                                "--fill": textColor || "#0d9488",
                                "--pos": `${listIconsFrameGlass}%`,
                              }}
                              aria-label="ระดับกรอบเบลอ"
                              onChange={(e) => {
                                const v = Number(e.target.value) || 0;
                                const m = mergeListElement({
                                  ...draft,
                                  listItemRowFrameGlass: v,
                                });
                                setDraft(m);
                                commit(m);
                              }}
                            />
                          </div>
                        </Box>
                      </div>
                    ) : null}
                  </Stack>
                );
              })()}

              {/* Item list */}
              <Box sx={{ pb: 4 }}>
                <div className="mb-3 flex items-center gap-2">
                  <span className="shrink-0 text-[13px] font-semibold text-slate-700 dark:text-white/80">
                    รายการทั้งหมด
                  </span>
                  <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
                </div>
                <Stack spacing={1}>
                  {items.map((item, idx) => {
                    const text = typeof item?.listText === "string" && item.listText.trim()
                      ? item.listText
                      : `รายการ ${idx + 1}`;
                    return (
                      <Box
                        key={idx}
                        className="flex w-full min-w-0 items-center gap-2 rounded-md border border-slate-200 px-2.5 py-1.5 dark:border-white/10"
                      >
                        {/* Index badge */}
                        <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded text-[10px] font-semibold text-white" style={{ backgroundColor: "#333333" }}>
                          {idx + 1}
                        </span>

                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          {/* Text preview */}
                          <Typography
                            sx={{
                              fontSize: 12,
                              lineHeight: 1.4,
                              opacity: 0.8,
                              minWidth: 0,
                              flex: "1 1 auto",
                            }}
                            className="truncate"
                            component="span"
                          >
                            {text}
                          </Typography>

                          {draft.listImageElement === true &&
                          Boolean(draft.listImageCaptionEnabled) ? (
                            <input
                              type="text"
                              className="h-6 w-[4.25rem] shrink-0 rounded-md border border-white/15 bg-[#333333] px-1.5 text-[11px] leading-tight text-white caret-white outline-none placeholder:text-white/45 focus:border-white/35 focus:ring-1 focus:ring-white/20"
                              placeholder="ข้อความขวา"
                              value={
                                typeof item?.listAsideText === "string"
                                  ? item.listAsideText
                                  : ""
                              }
                              onChange={(e) => {
                                const next = [...items];
                                next[idx] = {
                                  ...next[idx],
                                  listAsideText: String(e.target.value ?? "").slice(0, 64),
                                };
                                const m = mergeListElement({ ...draft, listItems: next });
                                setDraft(m);
                                commit(m);
                              }}
                              maxLength={64}
                              autoComplete="off"
                            />
                          ) : null}
                        </div>

                        {/* Reorder + clone + delete */}
                        <div className="flex shrink-0 items-center gap-0.5">
                          <button
                            type="button"
                            disabled={idx === 0}
                            title="เลื่อนขึ้น"
                            aria-label="เลื่อนขึ้น"
                            className={itemRowReorderBtnClass}
                            onClick={() => moveItem(idx, idx - 1)}
                          >
                            <ArrowUp className="h-3 w-3" strokeWidth={2.25} />
                          </button>
                          <button
                            type="button"
                            disabled={idx >= items.length - 1}
                            title="เลื่อนลง"
                            aria-label="เลื่อนลง"
                            className={itemRowReorderBtnClass}
                            onClick={() => moveItem(idx, idx + 1)}
                          >
                            <ArrowDown className="h-3 w-3" strokeWidth={2.25} />
                          </button>
                          <button
                            type="button"
                            disabled={items.length >= 12}
                            title={items.length >= 12 ? "ถึงจำนวนสูงสุดแล้ว (12)" : "คัดลอกรายการนี้"}
                            aria-label="คัดลอกรายการ"
                            className="rounded p-0.5 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600 disabled:pointer-events-none disabled:opacity-35 dark:hover:bg-blue-950/40 dark:hover:text-blue-400"
                            onClick={() => cloneItem(idx)}
                          >
                            <Copy className="h-3 w-3" strokeWidth={2} />
                          </button>
                          <button
                            type="button"
                            disabled={items.length <= 1}
                            title={items.length <= 1 ? "ต้องมีอย่างน้อย 1 รายการ" : "ลบรายการนี้"}
                            aria-label="ลบรายการ"
                            className="rounded p-0.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:pointer-events-none disabled:opacity-35 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                            onClick={() => deleteItem(idx)}
                          >
                            <Trash2 className="h-3 w-3" strokeWidth={2} />
                          </button>
                        </div>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>

            </Stack>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default ListElementOffcanvas;
