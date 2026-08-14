import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Box, Button, ButtonGroup, Stack, Switch, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { panelGroupButtonSx } from "../panelControlSx";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Monitor,
  Smartphone,
  Tablet,
  Trash2,
} from "lucide-react";
import lodash from "lodash";
import MainLabel from "../HTML/MainLabel";
import { swatchSelectedCheckClassName } from "../Layouts/Elements/swatchCheckClass";
import { THEME_PANEL_BASIC_COLOR_SWATCHES } from "../themePanelBasicColors";
import {
  LIST_BOX_ELEMENT_DEFAULTS,
  LIST_BOX_GRID_DIVIDER_OPTIONS,
  LIST_BOX_ICON_SHAPE_OPTIONS,
  LIST_BOX_VARIANT_OPTIONS,
  mergeListBoxElement,
  migrateListBoxItemsGlyphMainColor0ToWhiteWhenFramingOn,
} from "../Layouts/Elements/listBoxElementConfig";
import {
  getBuilderPanelOpenStartedAt,
  markBuilderPanelMounted,
  usePanelSliderPreview,
} from "../panelPreviewStore";

const listBoxPanelPerfEnabled =
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).get("listBoxPerf") === "1";

/** สัดส่วนความกว้างปุ่มรูปแบบ — ให้ข้อความไทยอยู่บรรทัดเดียวในแผง (~400px) */
const LIST_BOX_VARIANT_BUTTON_FLEX = {
  icon_text: "1.85 1 0%",
  image_text: "1.45 1 0%",
  image: "0.92 1 0%",
  text: "1.1 1 0%",
};

const LISTBOX_PERVIEW_INPUTS = [
  {
    id: "lb-pv-d",
    field: "listBoxPerViewDesktop",
    min: 1,
    max: 4,
    Icon: Monitor,
    deviceLabel: "เดสก์ท็อป",
  },
  {
    id: "lb-pv-t",
    field: "listBoxPerViewTablet",
    min: 1,
    max: 3,
    Icon: Tablet,
    deviceLabel: "แท็บเล็ต",
  },
  {
    id: "lb-pv-m",
    field: "listBoxPerViewMobile",
    min: 1,
    max: 2,
    Icon: Smartphone,
    deviceLabel: "มือถือ",
  },
];

/** per-view — พื้นหลัง/กรอบตาม Dashboard (dash-input) */
const perViewIconAddonClass =
  "flex h-[34px] w-9 shrink-0 items-center justify-center border-r border-slate-200 bg-transparent text-slate-600 dark:border-white/10 dark:text-white/75";

const perViewTextInputClass =
  "h-[34px] min-w-0 w-0 flex-1 border-0 bg-transparent px-2 pr-1 text-[12px] font-normal tabular-nums text-slate-800 outline-none ring-0 placeholder:text-slate-400 focus:outline-none dark:text-white/90 dark:placeholder:text-white/40";

const perViewSpinnerBtnClass =
  "flex flex-1 min-h-0 w-full items-center justify-center border-0 bg-transparent text-slate-500 transition hover:bg-black/5 hover:text-slate-800 disabled:pointer-events-none disabled:opacity-35 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white/90";

const itemRowReorderBtnClass =
  "rounded p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-35 dark:hover:bg-white/10 dark:hover:text-white/80";

/** Switch แผงเส้นคั่นกริด — เหมือน List iCons */
const ListBoxPanelDividerSwitch = styled(Switch, {
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

const lbDividerGroupRootSx = {
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

const lbDividerBtnSx = panelGroupButtonSx;

/** สไตล์ปุ่มกลุ่ม — เหมือน Carousel / container panel */
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

function parsePerViewDigits(raw, min, max) {
  const digits = raw.replace(/[^\d]/g, "");
  if (digits === "") return null;
  const n = parseInt(digits, 10);
  if (!Number.isFinite(n)) return null;
  return Math.min(max, Math.max(min, n));
}

const LISTBOX_MARGIN_SLIDER_MAX = 80;

const LISTBOX_ICON_BG_SLIDER_MIN = 20;
const LISTBOX_ICON_BG_SLIDER_MAX = 160;
const LISTBOX_ICON_SIZE_SLIDER_MIN = 12;
const LISTBOX_ICON_SIZE_SLIDER_MAX = 96;

const LISTBOX_ICON_CORNER_SLIDER_MIN = 0;
const LISTBOX_ICON_CORNER_SLIDER_MAX = 80;

const MarginLabel = ({ label, value, mb = 0.35 }) => (
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
    <span className="text-slate-400 dark:text-slate-400">{Math.round(value)}</span>
    <div className="dash-heading-rule min-w-0 flex-1 border-b" />
  </Typography>
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

const ListBoxElementOffcanvas = ({ element, onUpdate, close, textColor, theme }) => {
  const initialRenderStartedAtRef = useRef(
    listBoxPanelPerfEnabled ? performance.now() : 0
  );
  const rangeGestureActiveRef = useRef(false);
  const draftRef = useRef(null);
  const panelDraftFrameRef = useRef(null);
  const pendingPanelDraftRef = useRef(null);
  const [draft, setDraftState] = useState(() => mergeListBoxElement(element));
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
  const panelTargetId = element?.id;
  const panelOpenStartedAtRef = useRef(
    getBuilderPanelOpenStartedAt("List Box", panelTargetId) ??
      window.__listBoxPanelOpenPerf?.startedAt ??
      null
  );
  const mountBreakdownLoggedRef = useRef(false);

  useLayoutEffect(() => {
    if (!mountBreakdownLoggedRef.current) {
      mountBreakdownLoggedRef.current = true;
      if (listBoxPanelPerfEnabled) {
        const now = performance.now();
        console.info("[List Box Panel Mount Breakdown]", {
          target: String(panelTargetId || ""),
          openToPanelCommitMs: panelOpenStartedAtRef.current
            ? Math.round((now - panelOpenStartedAtRef.current) * 100) / 100
            : null,
          panelRenderToCommitMs:
            Math.round((now - initialRenderStartedAtRef.current) * 100) / 100,
          itemCount: Array.isArray(draft?.listBoxItems)
            ? draft.listBoxItems.length
            : 0,
          variant: draft?.listBoxVariant,
        });
      }
    }
    markBuilderPanelMounted("List Box", panelTargetId);
  }, [panelTargetId]);

  useEffect(() => {
    const merged = mergeListBoxElement(element);
    setDraft((prev) => (lodash.isEqual(prev, merged) ? prev : merged));
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
        queuedAt: listBoxPanelPerfEnabled ? performance.now() : 0,
      };
      if (layoutSyncScheduledRef.current) return;
      layoutSyncScheduledRef.current = true;
      queueMicrotask(() => {
        layoutSyncScheduledRef.current = false;
        const pending = pendingLayoutRef.current;
        pendingLayoutRef.current = null;
        if (!pending?.snapshot) return;
        const updateStartedAt = listBoxPanelPerfEnabled
          ? performance.now()
          : 0;
        onUpdate?.(pending.snapshot, {
          changedFields: pending.changedFields,
        });
        if (listBoxPanelPerfEnabled) {
          console.info("[List Box Panel Perf] update", {
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
    type: "lstb",
    targetIds: [panelTargetId],
    data: draft,
    setData: setDraft,
    onCommit: (latest) => {
      setDraft(latest);
      scheduleLayoutSync(latest);
    },
  });

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

  const commit = useCallback(
    (next) => {
      const cleaned = mergeListBoxElement(next);
      if (rangeGestureActiveRef.current) {
        updateSlider(() => cleaned);
        return;
      }
      scheduleLayoutSync(cleaned);
    },
    [scheduleLayoutSync, updateSlider]
  );

  const items = draft.listBoxItems || [];

  const moveItem = useCallback(
    (fromIdx, toIdx) => {
      if (toIdx < 0 || toIdx >= items.length) return;
      const next = [...items];
      [next[fromIdx], next[toIdx]] = [next[toIdx], next[fromIdx]];
      const m = mergeListBoxElement({ ...draft, listBoxItems: next });
      setDraft(m);
      commit(m);
    },
    [items, draft, commit]
  );

  const deleteItem = useCallback(
    (idx) => {
      if (items.length <= 1) return;
      const next = items.filter((_, j) => j !== idx);
      const m = mergeListBoxElement({
        ...draft,
        listBoxItems: next,
        listBoxItemCount: next.length,
      });
      setDraft(m);
      commit(m);
    },
    [items, draft, commit]
  );

  const cloneItem = useCallback(
    (idx) => {
      if (items.length >= 12) return;
      const next = [...items];
      next.splice(idx + 1, 0, lodash.cloneDeep(items[idx]));
      const m = mergeListBoxElement({
        ...draft,
        listBoxItems: next,
        listBoxItemCount: next.length,
      });
      setDraft(m);
      commit(m);
    },
    [items, draft, commit]
  );

  const addItem = useCallback(() => {
    if (items.length >= 12) return;
    const nextCount = items.length + 1;
    const m = mergeListBoxElement({
      ...draft,
      listBoxItemCount: nextCount,
      listBoxItems: items,
    });
    setDraft(m);
    commit(m);
  }, [items, draft, commit]);

  const marginTopDefault = LIST_BOX_ELEMENT_DEFAULTS.listBoxMarginTop;
  const marginBottomDefault = LIST_BOX_ELEMENT_DEFAULTS.listBoxMarginBottom;
  const listBoxMarginTop = Number.isFinite(Number(draft.listBoxMarginTop))
    ? Math.max(0, Math.min(LISTBOX_MARGIN_SLIDER_MAX, Number(draft.listBoxMarginTop)))
    : marginTopDefault;
  const listBoxMarginBottom = Number.isFinite(Number(draft.listBoxMarginBottom))
    ? Math.max(0, Math.min(LISTBOX_MARGIN_SLIDER_MAX, Number(draft.listBoxMarginBottom)))
    : marginBottomDefault;

  const iconBgDefault = LIST_BOX_ELEMENT_DEFAULTS.listBoxIconBgWidth;
  const iconSzDefault = LIST_BOX_ELEMENT_DEFAULTS.listBoxIconSize;
  const listBoxIconBgWidth = Number.isFinite(Number(draft.listBoxIconBgWidth))
    ? Math.max(
        LISTBOX_ICON_BG_SLIDER_MIN,
        Math.min(LISTBOX_ICON_BG_SLIDER_MAX, Math.round(Number(draft.listBoxIconBgWidth)))
      )
    : iconBgDefault;
  const listBoxIconSize = Number.isFinite(Number(draft.listBoxIconSize))
    ? Math.max(
        LISTBOX_ICON_SIZE_SLIDER_MIN,
        Math.min(LISTBOX_ICON_SIZE_SLIDER_MAX, Math.round(Number(draft.listBoxIconSize)))
      )
    : iconSzDefault;

  const iconCornerDefault = LIST_BOX_ELEMENT_DEFAULTS.listBoxIconCornerRadius;
  const listBoxIconCornerRadius = Number.isFinite(Number(draft.listBoxIconCornerRadius))
    ? Math.max(
        LISTBOX_ICON_CORNER_SLIDER_MIN,
        Math.min(LISTBOX_ICON_CORNER_SLIDER_MAX, Math.round(Number(draft.listBoxIconCornerRadius)))
      )
    : iconCornerDefault;

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
      <div className="flex shrink-0 items-center justify-between dash-panel-header bg-gray-100 px-6 pb-3 pt-5 dark:bg-slate-800/60">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 font-bold tracking-wide">
            List Box
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
          className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 dark:text-white/70 dark:hover:bg-white/5"
          onClick={() => close?.(null, null, null)}
          aria-label="ปิดแผง"
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

      <nav className="min-h-0 flex-1 w-full overflow-x-hidden overflow-y-auto overscroll-y-contain px-4 pb-6">
        <ul className="mt-4 list-none space-y-5 pl-1">
          <li>
            <Stack spacing={2}>
              <Box>
                <div className="mb-3 mt-1 flex items-center gap-2">
                  <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                    จำนวนไอเทมที่แสดง
                  </span>
                  <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                </div>
                <Stack direction="row" spacing={1} className="w-full">
                  {LISTBOX_PERVIEW_INPUTS.map(({ id, field, min, max, Icon, deviceLabel }) => (
                    <div
                      key={id}
                      className="dash-input flex h-[34px] min-w-0 flex-1 overflow-hidden rounded-md border border-slate-200 dark:border-white/10"
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
                          const nextVal = parsePerViewDigits(e.target.value, min, max);
                          if (nextVal === null) return;
                          const m = mergeListBoxElement({
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
                          aria-label={`เพิ่ม (${deviceLabel})`}
                          onClick={() => {
                            const cur = Number(draft[field]);
                            const v = Number.isFinite(cur) ? cur : min;
                            if (v >= max) return;
                            const m = mergeListBoxElement({
                              ...draft,
                              [field]: v + 1,
                            });
                            setDraft(m);
                            commit(m);
                          }}
                        >
                          <ChevronUp className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
                        </button>
                        <button
                          type="button"
                          className={perViewSpinnerBtnClass}
                          disabled={draft[field] <= min}
                          aria-label={`ลด (${deviceLabel})`}
                          onClick={() => {
                            const cur = Number(draft[field]);
                            const v = Number.isFinite(cur) ? cur : min;
                            if (v <= min) return;
                            const m = mergeListBoxElement({
                              ...draft,
                              [field]: v - 1,
                            });
                            setDraft(m);
                            commit(m);
                          }}
                        >
                          <ChevronDown className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
                        </button>
                      </div>
                    </div>
                  ))}
                </Stack>
              </Box>

              <Box>
                <div className="grid grid-cols-2 gap-3">
                  <Box sx={{ minWidth: 0 }}>
                    <MarginLabel label="ระยะด้านบน" value={listBoxMarginTop} mb={0.35} />
                    <div className="min-w-0 px-[2px] pb-[2px] pt-[2px]">
                      <input
                        type="range"
                        min={0}
                        max={LISTBOX_MARGIN_SLIDER_MAX}
                        step={1}
                        defaultValue={listBoxMarginTop}
                        onChange={(e) => {
                          const n = Number(e.target.value);
                          const v = Number.isFinite(n)
                            ? Math.max(0, Math.min(LISTBOX_MARGIN_SLIDER_MAX, n))
                            : marginTopDefault;
                          const m = mergeListBoxElement({
                            ...draft,
                            listBoxMarginTop: v,
                          });
                          setDraft(m);
                          commit(m);
                        }}
                        className={THEME_RANGE_INPUT_CLASS}
                        style={{
                          ["--pos"]: `${(listBoxMarginTop / LISTBOX_MARGIN_SLIDER_MAX) * 100}%`,
                          ["--fill"]: textColor || "#0d9488",
                        }}
                      />
                    </div>
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <MarginLabel label="ระยะด้านล่าง" value={listBoxMarginBottom} mb={0.35} />
                    <div className="min-w-0 px-[2px] pb-[2px] pt-[2px]">
                      <input
                        type="range"
                        min={0}
                        max={LISTBOX_MARGIN_SLIDER_MAX}
                        step={1}
                        defaultValue={listBoxMarginBottom}
                        onChange={(e) => {
                          const n = Number(e.target.value);
                          const v = Number.isFinite(n)
                            ? Math.max(0, Math.min(LISTBOX_MARGIN_SLIDER_MAX, n))
                            : marginBottomDefault;
                          const m = mergeListBoxElement({
                            ...draft,
                            listBoxMarginBottom: v,
                          });
                          setDraft(m);
                          commit(m);
                        }}
                        className={THEME_RANGE_INPUT_CLASS}
                        style={{
                          ["--pos"]: `${(listBoxMarginBottom / LISTBOX_MARGIN_SLIDER_MAX) * 100}%`,
                          ["--fill"]: textColor || "#0d9488",
                        }}
                      />
                    </div>
                  </Box>
                </div>
              </Box>

              <Box>
                <div className="mb-3 mt-1 flex items-center gap-2">
                  <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                    รูปแบบ
                  </span>
                  <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                </div>
                <ButtonGroup
                  fullWidth
                  variant="outlined"
                  disableElevation
                  color="inherit"
                  aria-label="รูปแบบการแสดงผล List Box"
                  sx={{
                    ...sectionLayoutGroupRootSx,
                    maxWidth: "100%",
                    overflowX: "auto",
                  }}
                >
                  {LIST_BOX_VARIANT_OPTIONS.map(({ value, label }) => {
                    const selected = draft.listBoxVariant === value;
                    return (
                      <Button
                        key={value}
                        color="inherit"
                        sx={{
                          ...sectionLayoutGroupButtonSx(selected, textColor),
                          flex: LIST_BOX_VARIANT_BUTTON_FLEX[value] || "1 1 0%",
                          fontWeight: 400,
                          fontSize: 11,
                          whiteSpace: "nowrap",
                          lineHeight: 1.2,
                          minHeight: 36,
                          py: 0.5,
                          px:
                            value === "icon_text" || value === "image_text"
                              ? 0.15
                              : 0.35,
                        }}
                        onClick={() => {
                          const m = mergeListBoxElement({ ...draft, listBoxVariant: value });
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
                            gap:
                              value === "icon_text" || value === "image_text"
                                ? 0
                                : "2px",
                            fontWeight: 400,
                            textAlign: "center",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {label}
                        </Box>
                      </Button>
                    );
                  })}
                </ButtonGroup>
              </Box>

              <Box
                sx={{ display: draft.listBoxVariant === "icon_text" ? "block" : "none" }}
                aria-hidden={draft.listBoxVariant !== "icon_text"}
              >
                <Stack spacing={1.5}>
                  <MainLabel
                    label="พื้นหลังไอคอน"
                    mb={0}
                    checked={draft.listBoxIconFrameEnabled !== false}
                    handleSwitch={(e) => {
                      const nextFrameOn = e.target.checked;
                      const currentItems = draft.listBoxItems || [];
                      let nextItems = currentItems;
                      if (nextFrameOn) {
                        nextItems = migrateListBoxItemsGlyphMainColor0ToWhiteWhenFramingOn(
                          currentItems
                        );
                      }
                      const m = mergeListBoxElement({
                        ...draft,
                        listBoxIconFrameEnabled: nextFrameOn,
                        listBoxItems: nextItems,
                      });
                      setDraft(m);
                      commit(m);
                    }}
                    color={textColor}
                  />
                  {draft.listBoxIconFrameEnabled !== false && (
                    <>
                      <ButtonGroup
                        fullWidth
                        variant="outlined"
                        disableElevation
                        color="inherit"
                        aria-label="รูปทรงพื้นหลังไอคอน"
                        sx={sectionLayoutGroupRootSx}
                      >
                        {LIST_BOX_ICON_SHAPE_OPTIONS.map(({ value: shapeVal, label: shapeLabel }) => {
                          const selected =
                            (draft.listBoxIconShape === "rounded" ? "rounded" : "circle") ===
                            shapeVal;
                          return (
                            <Button
                              key={shapeVal}
                              color="inherit"
                              sx={{
                                ...sectionLayoutGroupButtonSx(selected, textColor),
                                fontWeight: 400,
                                fontSize: 11,
                                whiteSpace: "nowrap",
                                minHeight: 34,
                                py: 0.5,
                              }}
                              onClick={() => {
                                const m = mergeListBoxElement({
                                  ...draft,
                                  listBoxIconShape: shapeVal,
                                });
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
                                  fontWeight: 400,
                                }}
                              >
                                {shapeLabel}
                              </Box>
                            </Button>
                          );
                        })}
                      </ButtonGroup>
                      {(draft.listBoxIconShape || "circle") === "rounded" && (
                        <Box sx={{ minWidth: 0 }}>
                          <MarginLabel label="มุมมน" value={listBoxIconCornerRadius} mb={0.35} />
                          <div className="min-w-0 px-[2px] pb-[2px] pt-[2px]">
                            <input
                              type="range"
                              min={LISTBOX_ICON_CORNER_SLIDER_MIN}
                              max={LISTBOX_ICON_CORNER_SLIDER_MAX}
                              step={1}
                              defaultValue={listBoxIconCornerRadius}
                              onChange={(e) => {
                                const n = Number(e.target.value);
                                const v = Number.isFinite(n)
                                  ? Math.max(
                                      LISTBOX_ICON_CORNER_SLIDER_MIN,
                                      Math.min(LISTBOX_ICON_CORNER_SLIDER_MAX, Math.round(n))
                                    )
                                  : iconCornerDefault;
                                const m = mergeListBoxElement({
                                  ...draft,
                                  listBoxIconCornerRadius: v,
                                });
                                setDraft(m);
                                commit(m);
                              }}
                              className={THEME_RANGE_INPUT_CLASS}
                              style={{
                                ["--pos"]: `${
                                  ((listBoxIconCornerRadius - LISTBOX_ICON_CORNER_SLIDER_MIN) /
                                    (LISTBOX_ICON_CORNER_SLIDER_MAX -
                                      LISTBOX_ICON_CORNER_SLIDER_MIN)) *
                                  100
                                }%`,
                                ["--fill"]: textColor || "#0d9488",
                              }}
                              aria-valuemin={LISTBOX_ICON_CORNER_SLIDER_MIN}
                              aria-valuemax={LISTBOX_ICON_CORNER_SLIDER_MAX}
                              aria-valuenow={listBoxIconCornerRadius}
                              aria-label="ความโค้งมุมพื้นหลังไอคอน"
                            />
                          </div>
                        </Box>
                      )}
                    </>
                  )}
                </Stack>
              </Box>

              <Box
                sx={{ display: draft.listBoxVariant === "icon_text" ? "block" : "none" }}
                aria-hidden={draft.listBoxVariant !== "icon_text"}
              >
                <div
                  className={`grid gap-3 ${
                    draft.listBoxIconFrameEnabled !== false ? "grid-cols-2" : "grid-cols-1"
                  }`}
                >
                  {draft.listBoxIconFrameEnabled !== false && (
                    <Box sx={{ minWidth: 0 }}>
                      <MarginLabel label="ความกว้าง" value={listBoxIconBgWidth} mb={0.35} />
                      <div className="min-w-0 px-[2px] pb-[2px] pt-[2px]">
                        <input
                          type="range"
                          min={LISTBOX_ICON_BG_SLIDER_MIN}
                          max={LISTBOX_ICON_BG_SLIDER_MAX}
                          step={1}
                          defaultValue={listBoxIconBgWidth}
                          onChange={(e) => {
                            const n = Number(e.target.value);
                            const v = Number.isFinite(n)
                              ? Math.max(
                                  LISTBOX_ICON_BG_SLIDER_MIN,
                                  Math.min(LISTBOX_ICON_BG_SLIDER_MAX, Math.round(n))
                                )
                              : iconBgDefault;
                            const m = mergeListBoxElement({
                              ...draft,
                              listBoxIconBgWidth: v,
                            });
                            setDraft(m);
                            commit(m);
                          }}
                          className={THEME_RANGE_INPUT_CLASS}
                          style={{
                            ["--pos"]: `${
                              ((listBoxIconBgWidth - LISTBOX_ICON_BG_SLIDER_MIN) /
                                (LISTBOX_ICON_BG_SLIDER_MAX - LISTBOX_ICON_BG_SLIDER_MIN)) *
                              100
                            }%`,
                            ["--fill"]: textColor || "#0d9488",
                          }}
                          aria-valuemin={LISTBOX_ICON_BG_SLIDER_MIN}
                          aria-valuemax={LISTBOX_ICON_BG_SLIDER_MAX}
                          aria-valuenow={listBoxIconBgWidth}
                          aria-label="ความกว้างพื้นหลังไอคอน"
                        />
                      </div>
                    </Box>
                  )}
                  <Box sx={{ minWidth: 0, width: "100%" }}>
                    <MarginLabel label="ขนาดไอคอน" value={listBoxIconSize} mb={0.35} />
                    <div className="min-w-0 px-[2px] pb-[2px] pt-[2px]">
                      <input
                        type="range"
                        min={LISTBOX_ICON_SIZE_SLIDER_MIN}
                        max={LISTBOX_ICON_SIZE_SLIDER_MAX}
                        step={1}
                        defaultValue={listBoxIconSize}
                        onChange={(e) => {
                          const n = Number(e.target.value);
                          const v = Number.isFinite(n)
                            ? Math.max(
                                LISTBOX_ICON_SIZE_SLIDER_MIN,
                                Math.min(LISTBOX_ICON_SIZE_SLIDER_MAX, Math.round(n))
                              )
                            : iconSzDefault;
                          const m = mergeListBoxElement({
                            ...draft,
                            listBoxIconSize: v,
                          });
                          setDraft(m);
                          commit(m);
                        }}
                        className={THEME_RANGE_INPUT_CLASS}
                        style={{
                          ["--pos"]: `${
                            ((listBoxIconSize - LISTBOX_ICON_SIZE_SLIDER_MIN) /
                              (LISTBOX_ICON_SIZE_SLIDER_MAX - LISTBOX_ICON_SIZE_SLIDER_MIN)) *
                            100
                          }%`,
                          ["--fill"]: textColor || "#0d9488",
                        }}
                        aria-valuemin={LISTBOX_ICON_SIZE_SLIDER_MIN}
                        aria-valuemax={LISTBOX_ICON_SIZE_SLIDER_MAX}
                        aria-valuenow={listBoxIconSize}
                        aria-label="ขนาดไอคอน"
                      />
                    </div>
                  </Box>
                </div>
              </Box>

              <Box>
                <div className="mb-3 flex items-center gap-2">
                  <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                    เส้นคั่น
                  </span>
                  <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                  <div className="flex shrink-0 items-center gap-1.5">
                    <ListBoxPanelDividerSwitch
                      className="shrink-0"
                      accentColor={textColor || "#0d9488"}
                      checked={draft.listBoxGridFullFrameEnabled === true}
                      onChange={(e) => {
                        const m = mergeListBoxElement({
                          ...draft,
                          listBoxGridFullFrameEnabled: e.target.checked,
                        });
                        setDraft(m);
                        commit(m);
                      }}
                      inputProps={{ "aria-label": "กรอบเต็ม" }}
                    />
                    <span className="text-[11px] font-medium tabular-nums text-slate-600 dark:text-white/70">
                      กรอบเต็ม
                    </span>
                  </div>
                </div>
                <ButtonGroup
                  fullWidth
                  variant="outlined"
                  disableElevation
                  color="inherit"
                  aria-label="รูปแบบเส้นคั่นกริด"
                  sx={lbDividerGroupRootSx}
                >
                  {LIST_BOX_GRID_DIVIDER_OPTIONS.map((opt) => {
                    const raw = draft.listBoxGridDividerStyle;
                    const styleNorm =
                      raw === "solid" || raw === "dashed" || raw === "dotted" || raw === "none"
                        ? raw
                        : "dashed";
                    const isSelected =
                      opt.value === "none"
                        ? styleNorm === "none"
                        : styleNorm === opt.value;
                    return (
                      <Button
                        key={opt.value}
                        color="inherit"
                        sx={lbDividerBtnSx(isSelected, textColor)}
                        onClick={() => {
                          if (opt.value === "none") {
                            const m = mergeListBoxElement({
                              ...draft,
                              listBoxGridDividerStyle: "none",
                            });
                            setDraft(m);
                            commit(m);
                            return;
                          }
                          const m = mergeListBoxElement({
                            ...draft,
                            listBoxGridDividerStyle: opt.value,
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
                {draft.listBoxGridDividerStyle !== "none" && allColors.length > 0 && (
                  <div className="mt-1 dash-card rounded-md bg-white px-1 pb-1.5 pt-0.5 dark:bg-zinc-800">
                    <div className="px-1 pb-1.5 pt-0.5">
                      <input
                        type="range"
                        min={0}
                        max={255}
                        step={1}
                        defaultValue={
                          Number.isFinite(Number(draft.listBoxGridDividerOpacity))
                            ? Number(draft.listBoxGridDividerOpacity)
                            : 255
                        }
                        className={THEME_RANGE_INPUT_CLASS}
                        style={{
                          "--fill": textColor || "#0d9488",
                          "--pos": `${
                            ((Number.isFinite(Number(draft.listBoxGridDividerOpacity))
                              ? Number(draft.listBoxGridDividerOpacity)
                              : 255) /
                              255) *
                            100
                          }%`,
                        }}
                        aria-label="ความโปร่งแสงสีเส้นคั่น"
                        onChange={(e) => {
                          const m = mergeListBoxElement({
                            ...draft,
                            listBoxGridDividerOpacity: Number(e.target.value),
                          });
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
                          draft.listBoxGridDividerColor ??
                          LIST_BOX_ELEMENT_DEFAULTS.listBoxGridDividerColor;
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
                              const m = mergeListBoxElement({
                                ...draft,
                                listBoxGridDividerColor: color,
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
                )}
              </Box>

              <Box sx={{ pb: 4 }}>
                <div className="mb-[13px] mt-1 flex items-center gap-2">
                  <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                    รายการทั้งหมด
                  </span>
                  <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                  <button
                    type="button"
                    disabled={items.length >= 12}
                    title={items.length >= 12 ? "ถึงจำนวนสูงสุดแล้ว (12)" : "เพิ่มรายการใหม่"}
                    className="inline-flex min-h-[26px] shrink-0 items-center justify-center rounded-md px-2 py-1 text-[12px] font-medium leading-snug text-white transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#333333] disabled:pointer-events-none disabled:opacity-35"
                    style={{ backgroundColor: "#333333" }}
                    onClick={addItem}
                  >
                    เพิ่มรายการ
                  </button>
                </div>
                <Stack spacing={1}>
                  {items.map((it, idx) => {
                    const titleTrim =
                      typeof it?.title === "string" && it.title.trim() ? it.title.trim() : "";
                    const bodyTrim =
                      typeof it?.body === "string" && it.body.trim() ? it.body.trim() : "";
                    const srcTrim =
                      typeof it?.src === "string" && it.src.trim() ? it.src.trim() : "";
                    const preview =
                      titleTrim ||
                      bodyTrim ||
                      srcTrim ||
                      `รายการ ${idx + 1}`;
                    const itemRowToolbar = (
                      <>
                        <span
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-semibold text-white"
                          style={{ backgroundColor: "#333333" }}
                        >
                          {idx + 1}
                        </span>
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          <Typography
                            sx={{
                              fontSize: 12,
                              lineHeight: 1.4,
                              minWidth: 0,
                              flex: "1 1 auto",
                              color:
                                "var(--dash-panel-btn-group-active-text, #ffffff)",
                            }}
                            className="truncate"
                            component="span"
                          >
                            {preview}
                          </Typography>
                        </div>
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
                            title={
                              items.length >= 12
                                ? "ถึงจำนวนสูงสุดแล้ว (12)"
                                : "คัดลอกรายการนี้"
                            }
                            aria-label="คัดลอกรายการ"
                            className="rounded p-0.5 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600 disabled:pointer-events-none disabled:opacity-35 dark:hover:bg-blue-950/40 dark:hover:text-blue-400"
                            onClick={() => cloneItem(idx)}
                          >
                            <Copy className="h-3 w-3" strokeWidth={2} />
                          </button>
                          <button
                            type="button"
                            disabled={items.length <= 1}
                            title={
                              items.length <= 1
                                ? "ต้องมีอย่างน้อย 1 รายการ"
                                : "ลบรายการนี้"
                            }
                            aria-label="ลบรายการ"
                            className="rounded p-0.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:pointer-events-none disabled:opacity-35 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                            onClick={() => deleteItem(idx)}
                          >
                            <Trash2 className="h-3 w-3" strokeWidth={2} />
                          </button>
                        </div>
                      </>
                    );
                    return (
                      <Box
                        key={idx}
                        className="flex w-full min-w-0 items-center gap-2 rounded-md border border-slate-200 px-2.5 py-1.5 dark:border-white/10"
                      >
                        {itemRowToolbar}
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

export default ListBoxElementOffcanvas;
