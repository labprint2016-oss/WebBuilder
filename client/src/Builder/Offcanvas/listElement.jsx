import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Range from "../HTML/Range";
import { panelGroupButtonSx } from "../panelControlSx";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowUp,
  Check,
  ChevronLeft,
  ChevronRight,
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
import { swatchSelectedCheckClassName } from "../Layouts/Elements/swatchCheckClass";
import { THEME_PANEL_BASIC_COLOR_SWATCHES } from "../themePanelBasicColors";
import {
  getBuilderPanelOpenStartedAt,
  markBuilderPanelMounted,
  usePanelSliderPreview,
} from "../panelPreviewStore";

const listItemsPanelPerfEnabled =
  typeof window !== "undefined" &&
  (new URLSearchParams(window.location.search).get("listItemsPerf") === "1" ||
    new URLSearchParams(window.location.search).get("listIconsPerf") === "1" ||
    new URLSearchParams(window.location.search).get("listImagesPerf") === "1");

const getListPanelPerfName = (data) =>
  data?.listImageElement ? "List Images" : "List Items";

const Box = ({ component: Component = "div", sx, ...props }) => {
  const Element = Component;
  void sx;
  return <Element {...props} />;
};

const Stack = ({ direction = "column", spacing = 0, sx: _sx, ...props }) => (
  <div
    {...props}
    style={{
      display: "flex",
      flexDirection: direction === "row" ? "row" : "column",
      gap: `${Number(spacing) * 8}px`,
      alignItems: _sx?.alignItems,
      ...props.style,
    }}
  />
);

const ButtonGroup = ({
  children,
  sx,
  fullWidth,
  variant,
  color,
  disableElevation,
  ...props
}) => {
  void sx;
  void fullWidth;
  void variant;
  void color;
  void disableElevation;
  return (
    <div
      {...props}
      className={`flex h-[34px] w-full overflow-hidden rounded-md ${props.className || ""}`}
      style={{
        border: "1px solid var(--dash-panel-btn-group-border, #e2e8f0)",
        ...props.style,
      }}
    >
      {children}
    </div>
  );
};

const Button = ({ children, sx, color, ...props }) => {
  void color;
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex h-[34px] min-w-0 flex-1 items-center justify-center border-0 border-r px-1 text-[11px] font-normal leading-tight last:border-r-0 hover:opacity-90 ${
        props.className || ""
      }`}
      style={{
        backgroundColor: sx?.backgroundColor,
        color: sx?.color,
        borderColor: "var(--dash-panel-btn-group-border, #e2e8f0)",
        ...props.style,
      }}
    >
      {children}
    </button>
  );
};

const Typography = ({
  component: Component = "div",
  sx,
  children,
  ...props
}) => {
  const Element = Component;
  return (
    <Element
      {...props}
      style={{
        display: sx?.display,
        alignItems: sx?.alignItems,
        gap: typeof sx?.gap === "number" ? `${sx.gap * 8}px` : sx?.gap,
        flex: sx?.flex,
        fontSize: sx?.fontSize,
        fontWeight: sx?.fontWeight,
        color: sx?.color,
        marginBottom:
          typeof sx?.mb === "number" ? `${sx.mb * 8}px` : sx?.mb,
        ...props.style,
      }}
    >
      {children}
    </Element>
  );
};

const Switch = ({
  checked,
  onChange,
  accentColor = "#0d9488",
  inputProps,
}) => (
  <label className="relative inline-flex h-4 w-7 shrink-0 cursor-pointer items-center">
    <input
      type="checkbox"
      className="peer sr-only"
      checked={Boolean(checked)}
      onChange={onChange}
      {...inputProps}
    />
    <span
      className="absolute inset-0 rounded-full bg-black/25 transition-colors dark:bg-white/25"
      style={checked ? { backgroundColor: accentColor } : undefined}
    />
    <span
      className={`relative ml-0.5 size-3 rounded-full bg-white shadow-sm transition-transform ${
        checked ? "translate-x-3" : "translate-x-0"
      }`}
    />
  </label>
);

const MainLabel = ({
  label,
  value = NaN,
  mb = 0.75,
  checked = "-",
  handleSwitch,
  color,
  typography,
}) => (
  <div
    className="flex flex-1 items-center gap-2 text-[13px] font-semibold tabular-nums text-[var(--dash-panel-heading,#0f172a)] dark:text-[var(--dash-panel-heading,#f8fafc)]"
    style={{ marginBottom: typeof mb === "string" ? mb : `${Number(mb) * 8}px` }}
  >
    <span className="shrink-0">{label}</span>
    {!Number.isNaN(Number(value)) ? (
      <span className="shrink-0 text-[12px] font-medium text-slate-400">
        {Math.round(Number(value))}
      </span>
    ) : null}
    <div className="dash-heading-rule min-w-0 flex-1 border-b" />
    {checked !== "-" ? (
      <span className="flex shrink-0 items-center gap-2">
        <Switch
          checked={checked}
          onChange={handleSwitch}
          accentColor={color}
          inputProps={{ "aria-label": typography || label }}
        />
        {typography ? <span className="text-[12px]">{typography}</span> : null}
      </span>
    ) : null}
  </div>
);

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
    borderColor: "var(--dash-panel-btn-group-border, #e2e8f0) !important",
  },
  ".dark & .MuiButtonGroup-grouped.MuiButton-outlined": {
    borderColor: "var(--dash-panel-btn-group-border, #e2e8f0) !important",
  },
};

const dividerBtnSx = panelGroupButtonSx;

/** สลับชุดสี เส้นคั่น / สีกรอบ — List iCons */
const ListIconsColorSelectLine = ({
  prev,
  next,
  value,
  prevAria,
  nextAria,
  groupAria,
}) => (
  <div
    className="flex dash-input items-center justify-between gap-0.5 rounded-lg border border-slate-200 bg-white px-0.5 py-0.5 dark:border-white/10 dark:bg-slate-800/90"
    role="group"
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
  </div>
);

const LIST_ICONS_COLOR_EDIT_MODES = [
  { id: "divider", label: "สีเส้นคั่น" },
  { id: "frame", label: "สีกรอบ" },
];

/** stepper — พื้นหลัง/กรอบตาม Dashboard (dash-input) */
const stepperBtnClass =
  "flex h-[34px] w-9 shrink-0 items-center justify-center border-0 bg-transparent text-[12px] font-normal text-slate-700 transition hover:bg-black/5 dark:text-white/90 dark:hover:bg-white/10";
/** ช่องกลางแบบพิมพ์ได้ — min แคบลงให้ปุ่ม ± กว้างขึ้น; ยังพอเลข 2 หลัก */
const stepperMidNumericClass =
  "flex h-[34px] min-w-[1.5rem] flex-1 items-stretch justify-center border-x border-slate-200 bg-transparent px-0.5 dark:border-white/10";

const itemRowReorderBtnClass =
  "rounded p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-35 dark:hover:bg-white/10 dark:hover:text-white/80";

/** Switch แบบ Counter panel */
const ListImagePanelSwitch = Switch;

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
            color: "var(--dash-panel-heading, #0f172a)",
            mb: 0.35,
            fontVariantNumeric: "tabular-nums",
            ".dark &": { color: "var(--dash-panel-heading, #f8fafc)" },
          }}
        >
          {label}{" "}
          <span className="text-slate-400 dark:text-slate-400">
            {formatLabelValue ? formatLabelValue(value) : Math.round(value)}
          </span>
          <div className="dash-heading-rule min-w-0 flex-1 border-b" />
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
    <div className="dash-input flex h-[34px] w-full overflow-hidden rounded-md border border-slate-200 dark:border-white/10">
      <button
        type="button"
        className={stepperBtnClass}
        aria-label={decLabel}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Minus className="h-3.5 w-3.5 shrink-0" strokeWidth={2.2} aria-hidden />
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
        <Plus className="h-3.5 w-3.5 shrink-0" strokeWidth={2.2} aria-hidden />
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
  const initialRenderStartedAtRef = useRef(
    listItemsPanelPerfEnabled ? performance.now() : 0
  );
  const layoutSyncScheduledRef = useRef(false);
  const layoutSyncGenerationRef = useRef(0);
  const pendingLayoutRef = useRef(null);
  const elementRef = useRef(element);
  elementRef.current = element;
  const rangeGestureActiveRef = useRef(false);
  const listImageSizeValueRef = useRef(null);
  const listImageSizeInputRef = useRef(null);
  const [draft, setDraft] = useState(() => mergeListElement(element));
  const itemNodeRefs = useRef(new Map());
  const itemStableKeysRef = useRef([]);
  const flipRectsRef = useRef(null);
  const moveLockRef = useRef(false);
  const [movingItemKey, setMovingItemKey] = useState(null);
  /** List iCons — โหมดชุดสีรวม เส้นคั่น / สีกรอบ */
  const [listIconsColorEditMode, setListIconsColorEditMode] = useState("divider");

  useEffect(() => {
    setDraft(mergeListElement(element));
  }, [element]);

  useEffect(() => {
    setListIconsColorEditMode("divider");
  }, [element?.id]);

  useEffect(() => {
    itemStableKeysRef.current = [];
    itemNodeRefs.current = new Map();
    flipRectsRef.current = null;
    moveLockRef.current = false;
    setMovingItemKey(null);
  }, [element?.id]);

  const scheduleLayoutSync = useCallback(
    (next) => {
      const base = elementRef.current || {};
      const merged = {
        ...base,
        ...next,
        type: next?.type ?? base?.type ?? "list",
        id: next?.id != null ? next.id : base?.id,
      };
      const changedFields = Object.keys(next || {}).filter(
        (key) => !Object.is(base?.[key], merged?.[key])
      );
      pendingLayoutRef.current = {
        snapshot: merged,
        changedFields,
        queuedAt: listItemsPanelPerfEnabled ? performance.now() : 0,
      };
      if (layoutSyncScheduledRef.current) return;
      layoutSyncScheduledRef.current = true;
      const generation = layoutSyncGenerationRef.current;
      queueMicrotask(() => {
        if (generation !== layoutSyncGenerationRef.current) return;
        layoutSyncScheduledRef.current = false;
        const pending = pendingLayoutRef.current;
        pendingLayoutRef.current = null;
        if (!pending?.snapshot) return;
        const updateStartedAt = listItemsPanelPerfEnabled
          ? performance.now()
          : 0;
        onUpdate?.(pending.snapshot, {
          changedFields: pending.changedFields,
        });
        if (listItemsPanelPerfEnabled) {
          console.info(`[${getListPanelPerfName(pending.snapshot)} Panel Perf] update`, {
            target: pending.snapshot?.id,
            listVariant: pending.snapshot?.buttonMultiElement
              ? "buttonMulti"
              : pending.snapshot?.listImageElement
                ? "image"
                : pending.snapshot?.listIconsElement
                  ? "icons"
                  : "items",
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

  const panelTargetId = element?.id;
  const panelOpenStartedAtRef = useRef(
    getBuilderPanelOpenStartedAt("List", panelTargetId) ??
      window.__listItemsPanelOpenPerf?.startedAt ??
      null
  );
  const mountBreakdownLoggedRef = useRef(false);
  const initialMountMetricsRef = useRef({
    panelName: getListPanelPerfName(draft),
    listVariant: draft?.buttonMultiElement
      ? "buttonMulti"
      : draft?.listImageElement
        ? "image"
        : draft?.listIconsElement
          ? "icons"
          : "items",
    itemCount: Array.isArray(draft?.listItems) ? draft.listItems.length : 0,
  });
  const { updateSlider, commitSlider } = usePanelSliderPreview({
    type: "list",
    targetIds: [panelTargetId],
    data: draft,
    setData: setDraft,
    onCommit: (latest) => {
      if (latest?.listImageSizePreviewActive === true) {
        const nextSize = Number(latest.containerSize);
        const finalized = mergeListElement({
          ...latest,
          listImageSizePreviewActive: undefined,
          listItems: Array.isArray(latest.listItems)
            ? latest.listItems.map((item) => ({
                ...item,
                containerSize: nextSize,
              }))
            : latest.listItems,
        });
        delete finalized.listImageSizePreviewActive;
        setDraft(finalized);
        scheduleLayoutSync(finalized);
        return;
      }
      scheduleLayoutSync(latest);
    },
  });

  const commit = useCallback(
    (next) => {
      const cleaned = mergeListElement(next);
      if (rangeGestureActiveRef.current) {
        updateSlider(() => cleaned);
        return;
      }
      scheduleLayoutSync(cleaned);
    },
    [scheduleLayoutSync, updateSlider]
  );

  useLayoutEffect(() => {
    if (!mountBreakdownLoggedRef.current) {
      mountBreakdownLoggedRef.current = true;
      if (listItemsPanelPerfEnabled) {
        const now = performance.now();
        console.info(`[${initialMountMetricsRef.current.panelName} Panel Mount Breakdown]`, {
          target: String(panelTargetId || ""),
          listVariant: initialMountMetricsRef.current.listVariant,
          openToPanelCommitMs: panelOpenStartedAtRef.current
            ? Math.round((now - panelOpenStartedAtRef.current) * 100) / 100
            : null,
          panelRenderToCommitMs:
            Math.round((now - initialRenderStartedAtRef.current) * 100) / 100,
          itemCount: initialMountMetricsRef.current.itemCount,
        });
      }
    }
    markBuilderPanelMounted("List", panelTargetId);
  }, [panelTargetId]);

  useEffect(
    () => () => {
      layoutSyncGenerationRef.current += 1;
      layoutSyncScheduledRef.current = false;
      pendingLayoutRef.current = null;
    },
    []
  );

  const ensureStableKeys = useCallback((count) => {
    const keys = itemStableKeysRef.current;
    while (keys.length < count) {
      keys.push(`li-k-${Date.now()}-${keys.length}-${Math.random().toString(36).slice(2, 7)}`);
    }
    if (keys.length > count) keys.length = count;
    return keys;
  }, []);

  const captureItemRects = useCallback(() => {
    const rects = new Map();
    itemNodeRefs.current.forEach((el, id) => {
      if (el) rects.set(id, el.getBoundingClientRect());
    });
    flipRectsRef.current = rects;
  }, []);

  const setItemNodeRef = useCallback((id, el) => {
    if (el) itemNodeRefs.current.set(id, el);
    else itemNodeRefs.current.delete(id);
  }, []);

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
  ensureStableKeys(items.length);
  const itemOrderKey = itemStableKeysRef.current.slice(0, items.length).join("|");

  useLayoutEffect(() => {
    const prevRects = flipRectsRef.current;
    if (!prevRects) return;
    flipRectsRef.current = null;

    const animations = [];
    itemNodeRefs.current.forEach((el, id) => {
      const first = prevRects.get(id);
      if (!el || !first) return;
      const last = el.getBoundingClientRect();
      const dy = first.top - last.top;
      if (Math.abs(dy) < 0.5) return;
      el.style.transition = "none";
      el.style.transform = `translateY(${dy}px)`;
      animations.push(el);
    });

    if (!animations.length) {
      moveLockRef.current = false;
      setMovingItemKey(null);
      return;
    }

    requestAnimationFrame(() => {
      animations.forEach((el) => {
        el.style.transition = "transform 240ms cubic-bezier(0.22, 1, 0.36, 1)";
        el.style.transform = "";
      });
    });

    const unlockTimer = window.setTimeout(() => {
      animations.forEach((el) => {
        el.style.transition = "";
        el.style.transform = "";
      });
      moveLockRef.current = false;
      setMovingItemKey(null);
    }, 260);

    return () => {
      window.clearTimeout(unlockTimer);
    };
  }, [itemOrderKey]);

  const handleCountChange = (newCount) => {
    const clamped = Math.min(12, Math.max(1, newCount));
    const m = mergeListElement({ ...draft, listItemCount: clamped });
    ensureStableKeys(m.listItems?.length || clamped);
    setDraft(m);
    commit(m);
  };

  const moveItem = (fromIdx, toIdx) => {
    if (moveLockRef.current) return;
    if (
      fromIdx < 0 ||
      toIdx < 0 ||
      fromIdx >= items.length ||
      toIdx >= items.length ||
      fromIdx === toIdx
    ) {
      return;
    }
    const keys = ensureStableKeys(items.length);
    captureItemRects();
    moveLockRef.current = true;
    const next = [...items];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    const [movedKey] = keys.splice(fromIdx, 1);
    keys.splice(toIdx, 0, movedKey);
    itemStableKeysRef.current = keys;
    setMovingItemKey(movedKey || null);
    const m = mergeListElement({ ...draft, listItems: next, listItemCount: next.length });
    setDraft(m);
    commit(m);
  };

  const deleteItem = (idx) => {
    if (items.length <= 1) return;
    const keys = ensureStableKeys(items.length);
    keys.splice(idx, 1);
    itemStableKeysRef.current = keys;
    const next = items.filter((_, j) => j !== idx);
    const m = mergeListElement({ ...draft, listItems: next, listItemCount: next.length });
    setDraft(m);
    commit(m);
  };

  const cloneItem = (idx) => {
    if (items.length >= 12) return;
    const keys = ensureStableKeys(items.length);
    const next = [...items];
    next.splice(idx + 1, 0, lodash.cloneDeep(items[idx]));
    keys.splice(
      idx + 1,
      0,
      `li-k-${Date.now()}-${keys.length}-${Math.random().toString(36).slice(2, 7)}`
    );
    itemStableKeysRef.current = keys;
    const m = mergeListElement({ ...draft, listItems: next, listItemCount: next.length });
    setDraft(m);
    commit(m);
  };

  return (
    <aside
      className="dash-panel flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden border-r border-slate-200 dark:border-white/10"
      style={{ color: textColor || undefined }}
      onPointerDownCapture={(event) => {
        if (event.target instanceof HTMLInputElement && event.target.type === "range") {
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
      {/* Header */}
      <div className="shrink-0 px-6 pt-5 pb-3 flex items-center justify-between dash-panel-header bg-gray-100 dark:bg-slate-800/60">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 font-bold tracking-wide">
            {element?.listIconsElement
              ? "List iCons"
              : element?.listImageElement
                ? "List Images"
                : "List Items"}
          </span>
          <button
            type="button"
            className="inline-flex shrink-0 items-center rounded-md border border-[#333333] bg-[#333333] px-1.5 py-0.5 text-[11px] font-mono font-bold leading-none text-white tabular-nums dark:border-[#333333] dark:bg-[#333333] dark:text-white"
            title={String(element?.id ?? "")}
            aria-label={`คัดลอก ID ${String(element?.id ?? "")}`}
            onClick={() => {
              const id = String(element?.id ?? "");
              if (!id || typeof navigator?.clipboard?.writeText !== "function") return;
              navigator.clipboard.writeText(id).catch(() => {});
            }}
          >
            {(() => {
              const id = String(element?.id ?? "");
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

      {/* Body */}
      <nav className="flex-1 min-h-0 overflow-y-auto">
        <ul className="list-none m-0 p-0">
          <li className="px-5 py-4">
            <Stack spacing={3}>
              {/* การแสดงผล — เฉพาะ List iCons (บนสุด) */}
              {draft.listIconsElement === true && (
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="dash-panel-label shrink-0 text-[12px] font-semibold">
                      การแสดงผล
                    </span>
                    <div className="dash-heading-rule min-w-0 flex-1 border-b" />
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
                    <span className="dash-panel-label shrink-0 text-[12px] font-semibold">
                      รูปแบบ
                    </span>
                    <div className="dash-heading-rule min-w-0 flex-1 border-b" />
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
                    <span className="dash-panel-label shrink-0 text-[12px] font-semibold">
                      ตำแหน่ง
                    </span>
                    <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                  </div>
                  <ButtonGroup variant="outlined" fullWidth sx={dividerGroupRootSx}>
                    {ALIGN_OPTIONS.map(({ value, label, Icon }) => {
                      void Icon;
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
              {draft.listImageElement === true &&
                (() => {
                  const LIST_IMAGE_SIZE_MIN = 28;
                  const LIST_IMAGE_SIZE_MAX = 120;
                  const raw = Number.isFinite(Number(draft.containerSize))
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
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <span className="dash-panel-label shrink-0 text-[12px] font-semibold tabular-nums">
                          ขนาดรูปภาพ{" "}
                          <span className="text-slate-400 dark:text-slate-400">
                            <span ref={listImageSizeValueRef}>
                              {Math.round(imageSizeVal)}
                            </span>
                          </span>
                        </span>
                        <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                      </div>
                      <input
                        ref={listImageSizeInputRef}
                        type="range"
                        min={LIST_IMAGE_SIZE_MIN}
                        max={LIST_IMAGE_SIZE_MAX}
                        step={2}
                        defaultValue={imageSizeVal}
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
                          const isPreviewGesture =
                            rangeGestureActiveRef.current;
                          if (isPreviewGesture) {
                            e.currentTarget.style.setProperty(
                              "--pos",
                              `${((nextSize - LIST_IMAGE_SIZE_MIN) /
                                (LIST_IMAGE_SIZE_MAX -
                                  LIST_IMAGE_SIZE_MIN)) *
                                100}%`
                            );
                            if (listImageSizeValueRef.current) {
                              listImageSizeValueRef.current.textContent =
                                String(Math.round(nextSize));
                            }
                            const previewDraft = {
                              ...draft,
                              containerSize: nextSize,
                              listImageSizePreviewActive: true,
                            };
                            updateSlider(() => previewDraft, {
                              setData: false,
                            });
                            return;
                          }
                          const m = mergeListElement({
                            ...draft,
                            containerSize: nextSize,
                            listImageSizePreviewActive: undefined,
                            listItems: items.map((it) => ({
                              ...it,
                              containerSize: nextSize,
                            })),
                          });
                          delete m.listImageSizePreviewActive;
                          setDraft(m);
                          commit(m);
                        }}
                      />
                    </div>
                  );
                })()}

              {/* จำนวนรายการ | ระยะห่างนอกไอเทม (per-item vertical gap) | ระยะห่างในไอเทม */}
              <div className="grid grid-cols-3 gap-x-2 gap-y-3">
                <div className="min-w-0">
                  <div className="mb-[13px] flex items-center gap-1">
                    <span className="dash-panel-label shrink-0 text-[11px] font-semibold">
                      จำนวนรายการ
                    </span>
                    <div className="dash-heading-rule min-w-0 flex-1 border-b" />
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
                  <div className="mb-[13px] flex items-center gap-1">
                    <span className="dash-panel-label shrink-0 text-[11px] font-semibold">
                      ระยะห่างนอกไอเทม
                    </span>
                    <div className="dash-heading-rule min-w-0 flex-1 border-b" />
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
                  <div className="mb-[13px] flex items-center gap-1">
                    <span className="dash-panel-label shrink-0 text-[11px] font-semibold">
                      ระยะห่างในไอเทม
                    </span>
                    <div className="dash-heading-rule min-w-0 flex-1 border-b" />
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
                            color: "var(--dash-panel-heading, #0f172a)",
                            ".dark &": { color: "var(--dash-panel-heading, #f8fafc)" },
                          }}
                        >
                          สีกรอบ
                        </Typography>
                        <div className="dash-heading-rule min-w-0 flex-1 border-b" />
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
                                color: "var(--dash-panel-heading, #0f172a)",
                                ".dark &": { color: "var(--dash-panel-heading, #f8fafc)" },
                              }}
                            >
                              ความโค้งมน
                            </Typography>
                            <span className="text-[12px] text-slate-400 dark:text-slate-400 tabular-nums">
                              {listImgFrameRadius}
                            </span>
                            <div className="dash-heading-rule min-w-0 flex-1 border-b" />
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
                                color: "var(--dash-panel-heading, #0f172a)",
                                ".dark &": { color: "var(--dash-panel-heading, #f8fafc)" },
                              }}
                            >
                              กรอบเบลอ
                            </Typography>
                            <span className="text-[12px] text-slate-400 dark:text-slate-400 tabular-nums">
                              {listImgFrameGlass}
                            </span>
                            <div className="dash-heading-rule min-w-0 flex-1 border-b" />
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
                                  color: "var(--dash-panel-heading, #0f172a)",
                                  ".dark &": { color: "var(--dash-panel-heading, #f8fafc)" },
                                }}
                              >
                                สีกรอบ
                              </Typography>
                              <div className="dash-heading-rule min-w-0 flex-1 border-b" />
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
                                      color: "var(--dash-panel-heading, #0f172a)",
                                      ".dark &": { color: "var(--dash-panel-heading, #f8fafc)" },
                                    }}
                                  >
                                    ความโค้งมน
                                  </Typography>
                                  <span className="text-[12px] text-slate-400 dark:text-slate-400 tabular-nums">
                                    {listItemFrameRadius}
                                  </span>
                                  <div className="dash-heading-rule min-w-0 flex-1 border-b" />
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
                                      color: "var(--dash-panel-heading, #0f172a)",
                                      ".dark &": { color: "var(--dash-panel-heading, #f8fafc)" },
                                    }}
                                  >
                                    กรอบเบลอ
                                  </Typography>
                                  <span className="text-[12px] text-slate-400 dark:text-slate-400 tabular-nums">
                                    {listItemIconGlass}
                                  </span>
                                  <div className="dash-heading-rule min-w-0 flex-1 border-b" />
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
                  <div className="mb-[13px] flex items-center gap-2">
                    <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                      ตำแหน่งการจัดวาง
                    </span>
                    <div className="dash-heading-rule min-w-0 flex-1 border-b" />
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
                        <span className="dash-panel-label shrink-0 text-[12px] font-semibold">
                          สลับด้าน
                        </span>
                        <div className="dash-heading-rule min-w-0 flex-1 border-b" />
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
                  <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                    เส้นคั่น
                  </span>
                  <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                  {/* List iCons — Switch สีกรอบ (ปิดเป็นค่าเริ่มต้น) */}
                  {draft.listIconsElement === true && (
                    <div className="flex shrink-0 items-center gap-1.5">
                      <span className="text-[11px] font-medium text-slate-600 dark:text-white/70">
                        สีกรอบ
                      </span>
                      <ListImagePanelSwitch
                        accentColor={textColor || "#0d9488"}
                        checked={draft.listItemRowFrameEnabled === true}
                        onChange={(e) => {
                          const on = e.target.checked;
                          const m = mergeListElement({
                            ...draft,
                            listItemRowFrameEnabled: on,
                          });
                          setDraft(m);
                          commit(m);
                          if (on) setListIconsColorEditMode("frame");
                          else if (m.listDividerEnabled) {
                            setListIconsColorEditMode("divider");
                          }
                        }}
                        inputProps={{ "aria-label": "เปิดสีกรอบรายการ" }}
                      />
                    </div>
                  )}
                  {/* Switch แนวนอน ↔ แนวตั้ง — List iTems และ List iMage */}
                  {draft.listIconsElement !== true && (
                    <div className="flex shrink-0 items-center gap-1.5">
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
                      <span className={`text-[11px] font-medium tabular-nums transition-colors ${draft.listVerticalTimelineDivider ? "text-slate-600 dark:text-white/70" : "text-slate-400 dark:text-white/30"}`}>
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
                          const enabled = opt.value !== "none";
                          const m = mergeListElement({
                            ...draft,
                            listDividerEnabled: enabled,
                            ...(enabled ? { listDividerStyle: opt.value } : {}),
                          });
                          setDraft(m);
                          commit(m);
                          if (draft.listIconsElement === true) {
                            if (enabled) setListIconsColorEditMode("divider");
                            else if (m.listItemRowFrameEnabled === true) {
                              setListIconsColorEditMode("frame");
                            }
                          }
                        }}
                      >
                        {opt.label}
                      </Button>
                    );
                  })}
                </ButtonGroup>

                {/* List iCons — รวมชุดสี เส้นคั่น + สีกรอบ ด้วยปุ่มเลื่อนซ้ายขวา */}
                {draft.listIconsElement === true &&
                  (() => {
                    const dividerOn = Boolean(draft.listDividerEnabled);
                    const frameOn = draft.listItemRowFrameEnabled === true;
                    const modes = LIST_ICONS_COLOR_EDIT_MODES.filter((m) =>
                      m.id === "divider" ? dividerOn : frameOn
                    );
                    if (!modes.length || allColors.length === 0) return null;
                    const modeIds = modes.map((m) => m.id);
                    const activeMode = modeIds.includes(listIconsColorEditMode)
                      ? listIconsColorEditMode
                      : modeIds[0];
                    const activeModeLabel =
                      modes.find((m) => m.id === activeMode)?.label || modes[0].label;
                    const cycleMode = (dir) => {
                      const i = Math.max(0, modeIds.indexOf(activeMode));
                      const next =
                        modeIds[(i + dir + modeIds.length) % modeIds.length];
                      setListIconsColorEditMode(next);
                    };
                    const isFrameMode = activeMode === "frame";
                    const opacityVal = isFrameMode
                      ? Number.isFinite(Number(draft.listItemRowFrameOpacity))
                        ? Math.max(0, Math.min(255, Number(draft.listItemRowFrameOpacity)))
                        : LIST_ELEMENT_DEFAULTS.listItemRowFrameOpacity
                      : Number.isFinite(Number(draft.listDividerOpacity))
                        ? Math.max(0, Math.min(255, Number(draft.listDividerOpacity)))
                        : LIST_ELEMENT_DEFAULTS.listDividerOpacity;
                    const activeSwatch = isFrameMode
                      ? draft.listItemRowFrameColor ??
                        LIST_ELEMENT_DEFAULTS.listItemRowFrameColor
                      : draft.listDividerColor ?? LIST_ELEMENT_DEFAULTS.listDividerColor;
                    return (
                      <div className="mt-2.5 space-y-2">
                        <ListIconsColorSelectLine
                          prev={() => cycleMode(-1)}
                          next={() => cycleMode(1)}
                          value={activeModeLabel}
                          prevAria="โหมดสีก่อนหน้า"
                          nextAria="โหมดสีถัดไป"
                          groupAria="สลับแก้สีเส้นคั่นหรือสีกรอบ"
                        />
                        <div className="dash-card rounded-md bg-white px-1 pb-1.5 pt-1 dark:bg-zinc-800">
                          <div className="px-1 pb-2 pt-1">
                            <input
                              type="range"
                              min={0}
                              max={255}
                              step={1}
                              value={opacityVal}
                              className={THEME_RANGE_INPUT_CLASS}
                              style={{
                                "--fill": textColor || "#0d9488",
                                "--pos": `${(opacityVal / 255) * 100}%`,
                              }}
                              aria-label={
                                isFrameMode
                                  ? "ความโปร่งแสงสีกรอบ"
                                  : "ความโปร่งแสงสีเส้นคั่น"
                              }
                              onChange={(e) => {
                                const v = Number(e.target.value) || 0;
                                const m = mergeListElement(
                                  isFrameMode
                                    ? { ...draft, listItemRowFrameOpacity: v }
                                    : { ...draft, listDividerOpacity: v }
                                );
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
                              const selected =
                                chipSelected(activeSwatch, color) ||
                                activeSwatch === color;
                              return (
                                <button
                                  key={`list-icons-color-${activeMode}-${i}`}
                                  type="button"
                                  className="flex size-[25px] items-center justify-center rounded-full border border-slate-200 dark:border-white/10"
                                  style={{ backgroundColor: bgColor }}
                                  aria-label={`${activeModeLabel} ${bgColor}`}
                                  onClick={() => {
                                    const m = mergeListElement(
                                      isFrameMode
                                        ? { ...draft, listItemRowFrameColor: color }
                                        : { ...draft, listDividerColor: color }
                                    );
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
                      </div>
                    );
                  })()}

                {/* Color + opacity — List iTems / List iMage เมื่อเส้นคั่นเปิดอยู่ */}
                {draft.listIconsElement !== true &&
                  Boolean(draft.listDividerEnabled) &&
                  allColors.length > 0 && (
                  <div className="mt-2.5 dash-card rounded-md bg-white px-1 pb-1.5 pt-1 dark:bg-zinc-800">
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
                  <div className="mb-[13px] flex w-full items-center gap-2 pr-0.5">
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
                      <div className="mt-2 grid grid-cols-2 gap-x-3">
                        <div className="min-w-0">
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
                                compact
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
                        </div>
                        <div className="min-w-0">
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
                                compact
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
                        </div>
                      </div>
                      {allColors.length > 0 ? (
                        <Box sx={{ width: "100%" }}>
                          <div className="mt-2 flex w-full items-center gap-2 pr-0.5">
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
                              สีข้อความ
                            </Typography>
                            <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                          </div>
                          <div className="rounded-md dash-card bg-white px-1 pb-1.5 pt-1 dark:bg-zinc-800">
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

              {/* ความโค้งมน / กรอบเบลอ — List iCons เมื่อเปิดสีกรอบ */}
              {(() => {
                const d = mergeListElement(draft);
                if (d.listIconsElement !== true) return null;
                const listIconsFrameEnabled = d.listItemRowFrameEnabled === true;
                if (!listIconsFrameEnabled) return null;
                const listIconsFrameRadius = Number.isFinite(Number(d.listItemRowFrameRadius))
                  ? Math.max(0, Math.min(64, Number(d.listItemRowFrameRadius)))
                  : LIST_ELEMENT_DEFAULTS.listItemRowFrameRadius;
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
                                color: "var(--dash-panel-heading, #0f172a)",
                                ".dark &": { color: "var(--dash-panel-heading, #f8fafc)" },
                              }}
                            >
                              ความโค้งมน
                            </Typography>
                            <span className="text-[12px] text-slate-400 dark:text-slate-400 tabular-nums">
                              {listIconsFrameRadius}
                            </span>
                            <div className="dash-heading-rule min-w-0 flex-1 border-b" />
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
                                color: "var(--dash-panel-heading, #0f172a)",
                                ".dark &": { color: "var(--dash-panel-heading, #f8fafc)" },
                              }}
                            >
                              กรอบเบลอ
                            </Typography>
                            <span className="text-[12px] text-slate-400 dark:text-slate-400 tabular-nums">
                              {listIconsFrameGlass}
                            </span>
                            <div className="dash-heading-rule min-w-0 flex-1 border-b" />
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

              {/* Item list — List Images: Stack spacing={3} (24px) ลดเหลือ 6px */}
              <Box
                sx={{
                  pb: 4,
                  ...(draft.listImageElement === true
                    ? { mt: "6px !important" }
                    : null),
                }}
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                    รายการทั้งหมด
                  </span>
                  <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                </div>
                <div className="flex flex-col gap-2">
                  {items.map((item, idx) => {
                    const itemKey =
                      itemStableKeysRef.current[idx] || `li-fallback-${idx}`;
                    const isMoving = movingItemKey === itemKey;
                    const text = typeof item?.listText === "string" && item.listText.trim()
                      ? item.listText
                      : `รายการ ${idx + 1}`;
                    return (
                      <Box
                        key={itemKey}
                        ref={(el) => setItemNodeRef(itemKey, el)}
                        className={`dash-input flex w-full min-w-0 items-center gap-2 rounded-md border bg-white px-2.5 py-1.5 will-change-transform dark:bg-slate-800/90 ${
                          isMoving
                            ? "border-slate-300 shadow-sm dark:border-white/25"
                            : "border-slate-200 dark:border-white/10"
                        }`}
                      >
                        {/* Index badge — พื้นหลัง/ข้อความตามปุ่ม Active */}
                        <span
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#333333] text-[10px] font-semibold"
                          style={{
                            color: "var(--dash-panel-btn-group-active-text, #ffffff)",
                          }}
                        >
                          {idx + 1}
                        </span>

                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          {/* Text preview — สีข้อความตาม ตั้งค่าสี Dashboard (Btn Group) */}
                          <Typography
                            sx={{
                              fontSize: 12,
                              lineHeight: 1.4,
                              minWidth: 0,
                              flex: "1 1 auto",
                              color:
                                "var(--dash-panel-btn-group-inactive-text, #1e293b)",
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
                              className="dash-input h-6 w-[4.25rem] shrink-0 rounded-md border border-slate-200 bg-white px-1.5 text-[11px] leading-tight text-slate-800 outline-none placeholder:text-slate-400 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-white/90 dark:placeholder:text-white/40"
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
                            disabled={idx === 0 || Boolean(movingItemKey)}
                            title="เลื่อนขึ้น"
                            aria-label="เลื่อนขึ้น"
                            className={itemRowReorderBtnClass}
                            onClick={() => moveItem(idx, idx - 1)}
                          >
                            <ArrowUp className="h-3 w-3" strokeWidth={2.25} />
                          </button>
                          <button
                            type="button"
                            disabled={idx >= items.length - 1 || Boolean(movingItemKey)}
                            title="เลื่อนลง"
                            aria-label="เลื่อนลง"
                            className={itemRowReorderBtnClass}
                            onClick={() => moveItem(idx, idx + 1)}
                          >
                            <ArrowDown className="h-3 w-3" strokeWidth={2.25} />
                          </button>
                          <button
                            type="button"
                            disabled={items.length >= 12 || Boolean(movingItemKey)}
                            title={items.length >= 12 ? "ถึงจำนวนสูงสุดแล้ว (12)" : "คัดลอกรายการนี้"}
                            aria-label="คัดลอกรายการ"
                            className="rounded p-0.5 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600 disabled:pointer-events-none disabled:opacity-35 dark:hover:bg-blue-950/40 dark:hover:text-blue-400"
                            onClick={() => cloneItem(idx)}
                          >
                            <Copy className="h-3 w-3" strokeWidth={2} />
                          </button>
                          <button
                            type="button"
                            disabled={items.length <= 1 || Boolean(movingItemKey)}
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
                </div>
              </Box>

            </Stack>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default ListElementOffcanvas;
