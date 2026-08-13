import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
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
import {
  markBuilderPanelMounted,
  usePanelSliderPreview,
} from "../panelPreviewStore";

const dataSliderPanelPerfEnabled =
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).get("dataSliderPerf") === "1";

const DataSliderPanelSwitch = ({
  checked,
  onChange,
  accentColor = "#0d9488",
  inputProps,
}) => (
  <label className="relative inline-flex h-4 w-7 shrink-0 cursor-pointer items-center">
    <input
      type="checkbox"
      className="peer sr-only"
      checked={checked}
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

const ITEM_LIST_MAX = 12;
const ITEM_LIST_MIN = 1;

/** สลับชุดสีปุ่มนำทาง — หน้าแสดงผล / หน้าอื่นๆ */
const DataSliderNavColorSelectLine = ({
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

const DATA_SLIDER_NAV_COLOR_MODES = [
  { id: "active", label: "สีปุ่มหน้าแสดงผล" },
  { id: "inactive", label: "สีปุ่มหน้าอื่นๆ" },
];

/** stepper / per-view — พื้นหลัง/กรอบตาม Dashboard (dash-input) */
const stepperBtnClass =
  "flex h-[34px] w-9 shrink-0 items-center justify-center border-0 bg-transparent text-[12px] font-normal text-slate-700 transition hover:bg-black/5 dark:text-white/90 dark:hover:bg-white/10";
const stepperMidNumericClass =
  "flex h-[34px] min-w-[2.25rem] flex-1 items-stretch justify-center border-x border-slate-200 bg-transparent px-0.5 dark:border-white/10";
const perViewIconAddonClass =
  "flex h-[34px] w-9 shrink-0 items-center justify-center border-r border-slate-200 bg-transparent text-slate-600 dark:border-white/10 dark:text-white/75";
const perViewTextInputClass =
  "h-[34px] min-w-0 w-0 flex-1 border-0 bg-transparent px-2 pr-1 text-[12px] font-normal tabular-nums text-slate-800 outline-none ring-0 placeholder:text-slate-400 focus:outline-none dark:text-white/90 dark:placeholder:text-white/40";
const perViewSpinnerBtnClass =
  "flex flex-1 min-h-0 w-full items-center justify-center border-0 bg-transparent text-slate-500 transition hover:bg-black/5 hover:text-slate-800 disabled:pointer-events-none disabled:opacity-35 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white/90";
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
    <div className="dash-input flex h-[34px] w-full overflow-hidden rounded-md border border-slate-200 dark:border-white/10">
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
  const initialRenderStartedAtRef = useRef(
    dataSliderPanelPerfEnabled ? performance.now() : 0
  );
  const layoutSyncScheduledRef = useRef(false);
  const layoutSyncGenerationRef = useRef(0);
  const pendingRef = useRef(null);
  const elementRef = useRef(element);
  elementRef.current = element;
  const itemNodeRefs = useRef(new Map());
  const flipRectsRef = useRef(null);
  const [movingItemId, setMovingItemId] = useState(null);
  const moveLockRef = useRef(false);

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

  const scheduleLayoutSync = useCallback(
    (next) => {
      const base = elementRef.current || {};
      const merged = {
        ...base,
        ...next,
        type: next?.type ?? base?.type ?? "dts",
        id: next?.id != null ? next.id : base?.id,
      };
      const changedFields = Object.keys(next || {}).filter(
        (key) => !Object.is(base?.[key], merged?.[key])
      );
      pendingRef.current = {
        snapshot: merged,
        changedFields,
        queuedAt: dataSliderPanelPerfEnabled ? performance.now() : 0,
      };
      if (layoutSyncScheduledRef.current) return;
      layoutSyncScheduledRef.current = true;
      const generation = layoutSyncGenerationRef.current;
      queueMicrotask(() => {
        if (generation !== layoutSyncGenerationRef.current) return;
        layoutSyncScheduledRef.current = false;
        const pending = pendingRef.current;
        pendingRef.current = null;
        if (!pending?.snapshot) return;
        const updateStartedAt = dataSliderPanelPerfEnabled
          ? performance.now()
          : 0;
        onUpdate?.(pending.snapshot, {
          changedFields: pending.changedFields,
        });
        if (dataSliderPanelPerfEnabled) {
          console.info("[Data Slider Panel Perf] update", {
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

  const [data, setData] = useState(() => mergeDataSliderElement(element));
  const [navColorEditMode, setNavColorEditMode] = useState("active");
  const panelTargetId = element?.id;

  useEffect(() => {
    markBuilderPanelMounted("Data Slider", panelTargetId);
  }, [panelTargetId]);

  useLayoutEffect(() => {
    if (!dataSliderPanelPerfEnabled) return;
    const opened = window.__dataSliderPanelOpenPerf;
    const now = performance.now();
    console.info("[Data Slider Panel Mount Breakdown]", {
      target: String(panelTargetId || ""),
      openToPanelCommitMs: opened?.startedAt
        ? Math.round((now - opened.startedAt) * 100) / 100
        : null,
      panelRenderToCommitMs:
        Math.round(
          (now - initialRenderStartedAtRef.current) * 100
        ) / 100,
    });
  }, [panelTargetId]);

  const { updateSlider, commitSlider } = usePanelSliderPreview({
    type: "dts",
    targetIds: [panelTargetId],
    data,
    setData,
    onCommit: (latest) => scheduleLayoutSync(latest),
  });

  const updateRangeField = (field, value) => {
    updateSlider((prev) =>
      mergeDataSliderElement({
        ...prev,
        [field]: value,
      })
    );
  };

  const commitRangeField = (_value, reason) => {
    commitSlider(reason || "range-commit");
  };

  useEffect(() => {
    setData(mergeDataSliderElement(element));
  }, [element]);

  useEffect(() => {
    setNavColorEditMode("active");
  }, [element?.id]);

  useEffect(
    () => () => {
      layoutSyncGenerationRef.current += 1;
      layoutSyncScheduledRef.current = false;
      pendingRef.current = null;
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
    setData((prev) => {
      const mergedPrev = mergeDataSliderElement(prev);
      const current = Array.isArray(mergedPrev.dataSliderItems)
        ? mergedPrev.dataSliderItems
        : [];
      if (current.length <= ITEM_LIST_MIN) return mergedPrev;
      const nextItems = current.filter((it) => it.id !== itemId);
      const nextActiveId = nextItems.some((it) => it.id === mergedPrev.dataSliderActiveId)
        ? mergedPrev.dataSliderActiveId
        : nextItems[Math.min(
            Math.max(
              0,
              current.findIndex((it) => it.id === itemId)
            ),
            nextItems.length - 1
          )]?.id;
      const merged = mergeDataSliderElement({
        ...mergedPrev,
        dataSliderItems: nextItems,
        dataSliderItemCount: nextItems.length,
        dataSliderActiveId: nextActiveId,
      });
      scheduleLayoutSync(merged);
      return merged;
    });
  };

  const moveItem = (fromIdx, toIdx) => {
    if (moveLockRef.current) return;
    const mergedPrev = mergeDataSliderElement(data);
    const current = Array.isArray(mergedPrev.dataSliderItems)
      ? [...mergedPrev.dataSliderItems]
      : [];
    if (
      fromIdx < 0 ||
      toIdx < 0 ||
      fromIdx >= current.length ||
      toIdx >= current.length ||
      fromIdx === toIdx
    ) {
      return;
    }
    captureItemRects();
    moveLockRef.current = true;
    const prevActiveId = mergedPrev.dataSliderActiveId;
    const [moved] = current.splice(fromIdx, 1);
    current.splice(toIdx, 0, moved);
    setMovingItemId(moved?.id || null);
    const merged = mergeDataSliderElement({
      ...mergedPrev,
      dataSliderItems: current,
      dataSliderItemCount: current.length,
      // คงรายการที่เลือก — หน้าบนแคนวาสจัดตามหน้าของรายการนั้น (ไม่ wrap แปลกๆ)
      dataSliderActiveId: current.some((it) => it.id === prevActiveId)
        ? prevActiveId
        : current[0]?.id,
    });
    setData(merged);
    scheduleLayoutSync(merged);
  };

  const items = data.dataSliderItems || [];
  const itemOrderKey = items.map((it) => it.id).join("|");

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
      setMovingItemId(null);
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
      setMovingItemId(null);
    }, 260);

    return () => {
      window.clearTimeout(unlockTimer);
    };
  }, [itemOrderKey]);

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
    <aside className="dash-panel flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden border-r border-slate-200 dark:border-white/10">
      <div className="shrink-0 px-6 pt-5 pb-3 flex items-center justify-between dash-panel-header bg-gray-100 dark:bg-slate-800/60">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 font-bold tracking-wide">
            Data Slider
          </span>
          <button
            type="button"
            className="inline-flex shrink-0 items-center rounded-md border border-[#333333] bg-[#333333] px-1.5 py-0.5 text-[11px] font-mono font-bold leading-none text-white tabular-nums dark:border-[#333333] dark:bg-[#333333] dark:text-white"
            title={String(data?.id ?? "")}
            aria-label={`คัดลอก ID ${String(data?.id ?? "")}`}
            onClick={() => {
              const id = String(data?.id ?? "");
              if (!id || typeof navigator?.clipboard?.writeText !== "function") return;
              navigator.clipboard.writeText(id).catch(() => {});
            }}
          >
            {(() => {
              const id = String(data?.id ?? "");
              const maxChars = 15;
              return id.length > maxChars ? `${id.slice(0, maxChars)}…` : id;
            })()}
          </button>
        </div>
        <button
          type="button"
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-white/70"
          onClick={() => close(null, null, null)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain px-4 pb-8 w-full">
        <ul className="mt-4 pl-1 space-y-5">
          <li>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="mb-3 mt-1 flex items-center gap-2">
                  <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                    จำนวนรายการ
                  </span>
                  <div className="dash-heading-rule min-w-0 flex-1 border-b" />
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
                  <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                    ระยะห่าง
                  </span>
                  <div className="dash-heading-rule min-w-0 flex-1 border-b" />
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
              <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                จำนวนไอเทมที่แสดง
              </span>
              <div className="dash-heading-rule min-w-0 flex-1 border-b" />
            </div>
            <div className="flex w-full gap-2">
              {CAROUSEL_PERVIEW_INPUTS.map(
                ({ id, field, min, max, Icon, deviceLabel }) => (
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
            </div>
          </li>

          <li>
            <div className="mb-[13px] mt-1 flex items-center gap-2">
              <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                ปุ่มเลื่อน
              </span>
              <div className="dash-heading-rule min-w-0 flex-1 border-b" />
              <span className="dash-panel-label shrink-0 text-[11px] font-medium text-slate-500 dark:text-white/55">
                แสดงหน้าเวบ
              </span>
              <DataSliderPanelSwitch
                checked={data?.dataSliderNavShowOnWebsite !== false}
                onChange={(e) =>
                  patch({ dataSliderNavShowOnWebsite: Boolean(e.target.checked) })
                }
                accentColor={textColor || "#0d9488"}
                inputProps={{ "aria-label": "แสดงปุ่มเลื่อนบนหน้าเวบ" }}
              />
            </div>
            <div className="dash-input flex h-9 w-full overflow-hidden rounded-md border border-slate-200 dark:border-white/10">
              <button
                type="button"
                className={`flex-1 text-[12px] font-medium transition ${
                  navShape === "square"
                    ? "text-white"
                    : "bg-white text-slate-700 hover:bg-slate-50 dark:bg-slate-800/90 dark:text-white/80 dark:hover:bg-slate-800"
                }`}
                style={
                  navShape === "square"
                    ? { backgroundColor: textColor || "#0d9488" }
                    : undefined
                }
                onClick={() => patch({ dataSliderNavShape: "square" })}
              >
                เหลี่ยม
              </button>
              <button
                type="button"
                className={`flex-1 border-l border-slate-200 text-[12px] font-medium transition dark:border-white/10 ${
                  navShape === "circle"
                    ? "text-white"
                    : "bg-white text-slate-700 hover:bg-slate-50 dark:bg-slate-800/90 dark:text-white/80 dark:hover:bg-slate-800"
                }`}
                style={
                  navShape === "circle"
                    ? { backgroundColor: textColor || "#0d9488" }
                    : undefined
                }
                onClick={() => patch({ dataSliderNavShape: "circle" })}
              >
                วงกลม
              </button>
            </div>
          </li>

          <li>
            <div className="w-full px-0.5">
              {(() => {
                const modes = DATA_SLIDER_NAV_COLOR_MODES;
                const modeIds = modes.map((m) => m.id);
                const activeMode = modeIds.includes(navColorEditMode)
                  ? navColorEditMode
                  : "active";
                const activeModeLabel =
                  modes.find((m) => m.id === activeMode)?.label || modes[0].label;
                const cycleMode = (dir) => {
                  const i = Math.max(0, modeIds.indexOf(activeMode));
                  setNavColorEditMode(
                    modeIds[(i + dir + modeIds.length) % modeIds.length]
                  );
                };
                const isActiveMode = activeMode === "active";
                const opacityVal = isActiveMode
                  ? navActiveColorOpacity
                  : navColorOpacity;
                const activeSwatch = isActiveMode
                  ? data?.dataSliderNavActiveColor
                  : data?.dataSliderNavColor;
                return (
                  <>
                    <DataSliderNavColorSelectLine
                      prev={() => cycleMode(-1)}
                      next={() => cycleMode(1)}
                      value={activeModeLabel}
                      prevAria="โหมดสีก่อนหน้า"
                      nextAria="โหมดสีถัดไป"
                      groupAria="สลับแก้สีปุ่มหน้าแสดงผลหรือสีปุ่มหน้าอื่นๆ"
                    />
                    <div className="mt-2 dash-card w-full rounded-md bg-white px-[0px] pb-[5px] pt-[2px] dark:bg-zinc-800">
                      <div className="px-[5px] pb-2">
                        <Range
                          min={0}
                          max={255}
                          step={1}
                          value={opacityVal}
                          handleChange={(e) => {
                            const raw = Number(e.target.value);
                            const v = Number.isFinite(raw) ? raw : 255;
                            if (isActiveMode) {
                              updateRangeField(
                                "dataSliderNavActiveColorOpacity",
                                v
                              );
                            } else {
                              updateRangeField("dataSliderNavColorOpacity", v);
                            }
                          }}
                          onCommit={commitRangeField}
                          pos={(opacityVal / 255) * 100}
                          color={textColor}
                        />
                      </div>
                      <div className="grid grid-cols-10 place-items-center gap-x-0 gap-y-[6px] px-[5px] pb-0">
                        {allColors.map((color, i) => {
                          const bgColor =
                            typeof color === "string"
                              ? color
                              : theme?.[color.type]?.[color.index];
                          if (bgColor == null) return null;
                          const selected = chipSelected(activeSwatch, color);
                          return (
                            <button
                              key={`nav-color-${activeMode}-${i}`}
                              type="button"
                              className="flex size-[25px] items-center justify-center rounded-full border border-slate-200 dark:border-white/15"
                              style={{ backgroundColor: bgColor }}
                              onClick={() => {
                                if (isActiveMode) {
                                  patch({ dataSliderNavActiveColor: color });
                                } else {
                                  patch({ dataSliderNavColor: color });
                                }
                              }}
                              aria-label={`${activeModeLabel} ${bgColor}`}
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
                    </div>
                  </>
                );
              })()}
            </div>
          </li>

          <li>
            <div className="grid w-full grid-cols-2 gap-x-3 gap-y-4 px-0.5">
              <div className="min-w-0">
                <MainLabel label={`ระยะด้านบน ${marginTop}`} mb="9px" />
                <Range
                  min={0}
                  max={80}
                  step={1}
                  value={marginTop}
                  handleChange={(e) =>
                    updateRangeField(
                      "dataSliderMarginTop",
                      Number(e.target.value) || 0
                    )
                  }
                  onCommit={commitRangeField}
                  pos={(marginTop / 80) * 100}
                  color={textColor}
                />
              </div>
              <div className="min-w-0">
                <MainLabel label={`ระยะด้านล่าง ${marginBottom}`} mb="9px" />
                <Range
                  min={0}
                  max={80}
                  step={1}
                  value={marginBottom}
                  handleChange={(e) =>
                    updateRangeField(
                      "dataSliderMarginBottom",
                      Number(e.target.value) || 0
                    )
                  }
                  onCommit={commitRangeField}
                  pos={(marginBottom / 80) * 100}
                  color={textColor}
                />
              </div>
            </div>
          </li>

          <li>
            <div className="mb-3 mt-1 flex items-center gap-2">
              <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                รายการทั้งหมด
              </span>
              <div className="dash-heading-rule min-w-0 flex-1 border-b" />
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
            <div className="flex flex-col gap-2">
              {items.map((item, idx) => {
                const isActive = item.id === activeId;
                const isMoving = movingItemId === item.id;
                return (
                  <div
                    key={item.id}
                    ref={(el) => setItemNodeRef(item.id, el)}
                    className={`min-w-0 rounded-md border will-change-transform ${
                      isMoving
                        ? "border-slate-300 bg-slate-50 shadow-sm dark:border-white/25 dark:bg-white/5"
                        : "border-slate-200 dark:border-white/10"
                    }`}
                  >
                    <div className="flex min-h-[36px] min-w-0 items-center gap-2 px-2 py-1">
                      <button
                        type="button"
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-semibold text-white"
                        style={{ backgroundColor: "#333333" }}
                        title={
                          isActive
                            ? "กำลังแสดงหน้ารายการนี้บนแคนวาส"
                            : "แสดงหน้ารายการนี้บนแคนวาส"
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
                          disabled={idx === 0 || Boolean(movingItemId)}
                          title="เลื่อนลำดับขึ้น"
                          aria-label="เลื่อนลำดับขึ้น"
                          className="rounded p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-35 dark:hover:bg-white/10 dark:hover:text-white/80"
                          onClick={() => {
                            if (idx === 0) return;
                            moveItem(idx, idx - 1);
                          }}
                        >
                          <ArrowUp className="h-3 w-3" strokeWidth={2.25} />
                        </button>
                        <button
                          type="button"
                          disabled={idx >= items.length - 1 || Boolean(movingItemId)}
                          title="เลื่อนลำดับลง"
                          aria-label="เลื่อนลำดับลง"
                          className="rounded p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-35 dark:hover:bg-white/10 dark:hover:text-white/80"
                          onClick={() => {
                            if (idx >= items.length - 1) return;
                            moveItem(idx, idx + 1);
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
                          className="mx-1.5 rounded p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-35 dark:hover:bg-white/10 dark:hover:text-white/80"
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
            </div>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default DataSliderElementOffcanvas;
