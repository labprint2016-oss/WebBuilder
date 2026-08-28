import {
  startTransition,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Copy,
  Monitor,
  Minus,
  Plus,
  Smartphone,
  Tablet,
  Trash2,
} from "lucide-react";
import lodash from "lodash";
import Field from "../HTML/Field";
import Range from "../HTML/Range";
import { swatchSelectedCheckClassName } from "../Layouts/Elements/swatchCheckClass";
import { THEME_PANEL_BASIC_COLOR_SWATCHES } from "../themePanelBasicColors";
import { mergeCatagoriesElement } from "../Layouts/Elements/catagoriesElementConfig";
import {
  getBuilderPanelOpenStartedAt,
  markBuilderPanelMounted,
  usePanelSliderPreview,
} from "../panelPreviewStore";

const categoriesPanelPerfEnabled =
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).get("categoriesPerf") === "1";

const ITEM_LIST_MAX = 12;
const ITEM_LIST_MIN = 1;
const stepperBtnClass =
  "flex h-[34px] w-9 shrink-0 items-center justify-center border-0 bg-white text-[12px] font-normal text-slate-700 transition hover:bg-slate-50 dark:bg-slate-900/80 dark:text-white/90 dark:hover:bg-white/10";
const stepperMidNumericClass =
  "flex h-[34px] min-w-[2.25rem] flex-1 items-stretch justify-center border-x border-slate-200 bg-white px-0.5 dark:border-white/10 dark:bg-slate-900/80";
/** per-view — พื้นหลัง/กรอบตาม Dashboard (dash-input) */
const perViewIconAddonClass =
  "flex h-[34px] w-9 shrink-0 items-center justify-center border-r border-slate-200 bg-transparent text-slate-600 dark:border-white/10 dark:text-white/75";
const perViewTextInputClass =
  "h-[34px] min-w-0 w-0 flex-1 border-0 bg-transparent px-2 pr-1 text-[12px] font-normal tabular-nums text-slate-800 outline-none ring-0 placeholder:text-slate-400 focus:outline-none dark:text-white/90 dark:placeholder:text-white/40";
const perViewSpinnerBtnClass =
  "flex flex-1 min-h-0 w-full items-center justify-center border-0 bg-transparent text-slate-500 transition hover:bg-black/5 hover:text-slate-800 disabled:pointer-events-none disabled:opacity-35 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white/90";

const CAT_PERVIEW_INPUTS = [
  { id: "cat-pv-d", field: "catagoriesPerViewDesktop", min: 1, max: 6, Icon: Monitor, deviceLabel: "เดสก์ท็อป" },
  { id: "cat-pv-t", field: "catagoriesPerViewTablet", min: 1, max: 4, Icon: Tablet, deviceLabel: "แท็บเล็ต" },
  { id: "cat-pv-m", field: "catagoriesPerViewMobile", min: 1, max: 3, Icon: Smartphone, deviceLabel: "มือถือ" },
];

const CAT_TAB_MAX = 12;
const CAT_TAB_MIN = 1;
const CAT_COLOR_EDIT_MODES = [
  { id: "fill", label: "สีพื้นหลังปุ่ม" },
  { id: "border", label: "สีขอบ" },
  { id: "text", label: "สีข้อความ" },
];

const MainLabel = ({
  label,
  value = NaN,
  mb = 0.75,
  handleSwitch = null,
  checked = "-",
  color = null,
  typography = null,
  noLine = false,
  fontWeight = 600,
}) => (
  <div
    className="flex flex-1 items-center gap-2 text-[13px] tabular-nums text-[var(--dash-panel-heading,#0f172a)] dark:text-[var(--dash-panel-heading,#f8fafc)]"
    style={{
      marginBottom: `${Number(mb) * 8}px`,
      fontWeight,
    }}
  >
    <span className="shrink-0">{label}</span>
    {!Number.isNaN(Number(value)) ? (
      <span className="shrink-0 text-slate-400">
        {Math.round(Number(value))}
      </span>
    ) : null}
    {!noLine ? <div className="dash-heading-rule min-w-0 flex-1 border-b" /> : null}
    {checked !== "-" ? (
      <span className="flex shrink-0 items-center gap-2">
        <label className="relative inline-flex h-4 w-7 cursor-pointer items-center">
          <input
            type="checkbox"
            className="peer sr-only"
            checked={Boolean(checked)}
            onChange={handleSwitch}
            aria-label={typography || label}
          />
          <span
            className="absolute inset-0 rounded-full bg-black/25 transition-colors dark:bg-white/25"
            style={checked ? { backgroundColor: color || "#0d9488" } : undefined}
          />
          <span
            className={`relative ml-0.5 size-3 rounded-full bg-white shadow-sm transition-transform ${
              checked ? "translate-x-3" : "translate-x-0"
            }`}
          />
        </label>
        {typography ? <span className="text-[12px]">{typography}</span> : null}
      </span>
    ) : null}
  </div>
);

const ActiveItemSelectLine = ({
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

function parseDigits(raw, min, max) {
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
      const n = parseDigits(raw, min, max);
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
      <button type="button" className={stepperBtnClass} aria-label={decLabel} onClick={() => onChange(Math.max(min, value - 1))}>
        <Minus className="h-3.5 w-3.5 shrink-0" strokeWidth={2.2} />
      </button>
      <div className={stepperMidNumericClass}>
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
      <button type="button" className={stepperBtnClass} aria-label={incLabel} onClick={() => onChange(Math.min(max, value + 1))}>
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

const CatagoriesElementOffcanvas = ({
  element,
  onUpdate,
  close,
  textColor = "#0d9488",
  theme,
}) => {
  const currentRenderStartedAt = categoriesPanelPerfEnabled
    ? performance.now()
    : 0;
  const initialRenderStartedAtRef = useRef(
    categoriesPanelPerfEnabled ? performance.now() : 0
  );
  const layoutSyncScheduledRef = useRef(false);
  const layoutSyncGenerationRef = useRef(0);
  const pendingRef = useRef(null);
  const initialMergeMsRef = useRef(0);
  const synchronousRenderMsRef = useRef(0);
  const elementRef = useRef(element);
  elementRef.current = element;
  const tabNodeRefs = useRef(new Map());
  const itemNodeRefs = useRef(new Map());
  const flipRectsRef = useRef(null);
  const moveLockRef = useRef(false);
  const [movingTabId, setMovingTabId] = useState(null);
  const [movingItemId, setMovingItemId] = useState(null);

  const setTabNodeRef = useCallback((id, el) => {
    if (el) tabNodeRefs.current.set(id, el);
    else tabNodeRefs.current.delete(id);
  }, []);

  const setItemNodeRef = useCallback((id, el) => {
    if (el) itemNodeRefs.current.set(id, el);
    else itemNodeRefs.current.delete(id);
  }, []);

  const captureRects = useCallback((scope) => {
    const nodes = scope === "tabs" ? tabNodeRefs.current : itemNodeRefs.current;
    const rects = new Map();
    nodes.forEach((el, id) => {
      if (el) rects.set(id, el.getBoundingClientRect());
    });
    flipRectsRef.current = { scope, rects };
  }, []);

  const runFlipAnimation = useCallback((scope, orderKey) => {
    void orderKey;
    const payload = flipRectsRef.current;
    if (!payload || payload.scope !== scope) return;
    flipRectsRef.current = null;
    const nodes = scope === "tabs" ? tabNodeRefs.current : itemNodeRefs.current;
    const animations = [];
    nodes.forEach((el, id) => {
      const first = payload.rects.get(id);
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
      if (scope === "tabs") setMovingTabId(null);
      else setMovingItemId(null);
      return () => {};
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
      if (scope === "tabs") setMovingTabId(null);
      else setMovingItemId(null);
    }, 260);
    return () => window.clearTimeout(unlockTimer);
  }, []);

  const scheduleLayoutSync = useCallback(
    (next) => {
      const base = elementRef.current || {};
      const merged = {
        ...base,
        ...next,
        type: next?.type ?? base?.type ?? "ctg",
        id: next?.id != null ? next.id : base?.id,
      };
      const changedFields = Object.keys(next || {}).filter(
        (key) => !Object.is(base?.[key], merged?.[key])
      );
      pendingRef.current = {
        snapshot: merged,
        changedFields,
        queuedAt: categoriesPanelPerfEnabled ? performance.now() : 0,
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
        const updateStartedAt = categoriesPanelPerfEnabled
          ? performance.now()
          : 0;
        onUpdate?.(pending.snapshot, {
          changedFields: pending.changedFields,
        });
        if (categoriesPanelPerfEnabled) {
          console.info("[Categories Panel Perf] update", {
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
  const [data, setData] = useState(() => {
    const startedAt = categoriesPanelPerfEnabled ? performance.now() : 0;
    const merged = mergeCatagoriesElement(element);
    if (categoriesPanelPerfEnabled) {
      initialMergeMsRef.current = performance.now() - startedAt;
    }
    return merged;
  });
  const [activeColorEditModeIndex, setActiveColorEditModeIndex] = useState(0);
  const [inactiveColorEditModeIndex, setInactiveColorEditModeIndex] = useState(0);
  const [deferredControlStage, setDeferredControlStage] = useState(-1);
  const panelTargetId = element?.id;
  const panelOpenStartedAtRef = useRef(
    getBuilderPanelOpenStartedAt("Catagories", panelTargetId) ??
      window.__categoriesPanelOpenPerf?.startedAt ??
      null
  );
  const mountBreakdownLoggedRef = useRef(false);
  const initialDataRef = useRef(data);
  const initialColorCountRef = useRef(
    (theme?.mainColor?.length || 0) +
      (theme?.textColor?.length || 0) +
      (theme?.otherColor?.length || 0) +
      THEME_PANEL_BASIC_COLOR_SWATCHES.length
  );
  const { updateSlider, commitSlider } = usePanelSliderPreview({
    type: "ctg",
    targetIds: [panelTargetId],
    data,
    setData,
    onCommit: (latest) => scheduleLayoutSync(latest),
  });
  const updateRangeField = (field, value) => {
    updateSlider((prev) =>
      mergeCatagoriesElement({
        ...prev,
        [field]: value,
      })
    );
  };
  const updateThemeRange = (updater) => {
    updateSlider((prev) => {
      const mergedPrev = mergeCatagoriesElement(prev);
      return mergeCatagoriesElement({
        ...mergedPrev,
        catagoriesTabs: mergedPrev.catagoriesTabs.map((tab) => ({
          ...tab,
          items: (Array.isArray(tab?.items) ? tab.items : []).map(updater),
        })),
      });
    });
  };
  const commitRangeField = (_value, reason) => {
    commitSlider(reason || "range-commit");
  };
  useLayoutEffect(() => {
    if (!mountBreakdownLoggedRef.current) {
      mountBreakdownLoggedRef.current = true;
      if (categoriesPanelPerfEnabled) {
        const now = performance.now();
        const initialData = initialDataRef.current;
        const tabs = Array.isArray(initialData?.catagoriesTabs)
          ? initialData.catagoriesTabs
          : [];
        const itemCount = tabs.reduce(
          (sum, tab) => sum + (Array.isArray(tab?.items) ? tab.items.length : 0),
          0
        );
        const nestedElementCount = tabs.reduce(
          (sum, tab) =>
            sum +
            (Array.isArray(tab?.items) ? tab.items : []).reduce(
              (itemSum, item) =>
                itemSum +
                (Array.isArray(item?.elements) ? item.elements.length : 0),
              0
            ),
          0
        );
        const breakdown = {
          target: String(panelTargetId || ""),
          openToPanelCommitMs: panelOpenStartedAtRef.current
            ? Math.round((now - panelOpenStartedAtRef.current) * 100) / 100
            : null,
          panelRenderToCommitMs:
            Math.round((now - initialRenderStartedAtRef.current) * 100) / 100,
          initialMergeMs:
            Math.round(initialMergeMsRef.current * 100) / 100,
          synchronousRenderMs:
            Math.round(synchronousRenderMsRef.current * 100) / 100,
          tabCount: tabs.length,
          itemCount,
          activeItemCount: Array.isArray(
            tabs.find(
              (tab) =>
                String(tab?.id) ===
                String(initialData?.catagoriesActiveCategoryId)
            )?.items
          )
            ? tabs.find(
                (tab) =>
                  String(tab?.id) ===
                  String(initialData?.catagoriesActiveCategoryId)
              ).items.length
            : 0,
          nestedElementCount,
          colorSwatchCount: initialColorCountRef.current,
        };
        queueMicrotask(() => {
          console.info("[Categories Panel Mount Breakdown]", {
            ...breakdown,
            profilerPhase:
              window.__categoriesPanelProfilerPerf?.phase ?? null,
            profilerActualMs:
              window.__categoriesPanelProfilerPerf?.actualDuration ?? null,
            profilerBaseMs:
              window.__categoriesPanelProfilerPerf?.baseDuration ?? null,
          });
        });
      }
    }
    markBuilderPanelMounted("Catagories", panelTargetId);
  }, [panelTargetId]);
  useEffect(() => {
    setData(mergeCatagoriesElement(element));
  }, [element]);
  useEffect(() => {
    let cancelled = false;
    let firstFrame = 0;
    let firstTask = 0;
    let secondTask = 0;
    const scheduleIdle = (callback, timeout) => {
      if (typeof window.requestIdleCallback === "function") {
        return window.requestIdleCallback(callback, { timeout });
      }
      return window.setTimeout(callback, 50);
    };
    const cancelIdle = (task) => {
      if (!task) return;
      if (typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(task);
      } else {
        window.clearTimeout(task);
      }
    };
    firstFrame = window.requestAnimationFrame(() => {
      if (cancelled) return;
      startTransition(() => setDeferredControlStage(0));
      firstTask = scheduleIdle(() => {
        if (cancelled) return;
        startTransition(() => setDeferredControlStage(1));
        secondTask = scheduleIdle(() => {
          if (cancelled) return;
          startTransition(() => setDeferredControlStage(2));
        }, 700);
      }, 350);
    });
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(firstFrame);
      cancelIdle(firstTask);
      cancelIdle(secondTask);
    };
  }, [panelTargetId]);
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
      const merged = mergeCatagoriesElement({ ...prev, ...partial });
      scheduleLayoutSync(merged);
      return merged;
    });
  };
  const patchItems = (updater) => {
    setData((prev) => {
      const mergedPrev = mergeCatagoriesElement(prev);
      const tabs = Array.isArray(mergedPrev.catagoriesTabs) ? mergedPrev.catagoriesTabs : [];
      const activeCategoryId = tabs.some(
        (tab) => String(tab?.id) === String(mergedPrev?.catagoriesActiveCategoryId)
      )
        ? mergedPrev?.catagoriesActiveCategoryId
        : tabs[0]?.id;
      const activeTabIndex = tabs.findIndex(
        (tab) => String(tab?.id) === String(activeCategoryId)
      );
      if (activeTabIndex < 0) return mergedPrev;
      const current = Array.isArray(tabs[activeTabIndex]?.items)
        ? tabs[activeTabIndex].items
        : [];
      const nextItems = updater(current);
      const nextActiveId = nextItems.some(
        (it) => String(it?.id) === String(tabs[activeTabIndex]?.activeItemId)
      )
        ? tabs[activeTabIndex]?.activeItemId
        : nextItems[0]?.id;
      const nextTabs = [...tabs];
      nextTabs[activeTabIndex] = {
        ...nextTabs[activeTabIndex],
        itemCount: nextItems.length,
        items: nextItems,
        activeItemId: nextActiveId,
      };
      const merged = mergeCatagoriesElement({
        ...mergedPrev,
        catagoriesTabs: nextTabs,
        catagoriesActiveCategoryId: activeCategoryId,
      });
      scheduleLayoutSync(merged);
      return merged;
    });
  };

  const patchTabs = (updater) => {
    setData((prev) => {
      const mergedPrev = mergeCatagoriesElement(prev);
      const currentTabs = Array.isArray(mergedPrev.catagoriesTabs)
        ? mergedPrev.catagoriesTabs
        : [];
      const nextTabs = updater(currentTabs);
      const merged = mergeCatagoriesElement({
        ...mergedPrev,
        catagoriesTabs: nextTabs,
        catagoriesActiveCategoryId:
          nextTabs.some(
            (tab) => String(tab?.id) === String(mergedPrev?.catagoriesActiveCategoryId)
          )
            ? mergedPrev?.catagoriesActiveCategoryId
            : nextTabs[0]?.id,
      });
      scheduleLayoutSync(merged);
      return merged;
    });
  };
  const patchThemeForAllItems = (updater) => {
    patchTabs((currentTabs) =>
      currentTabs.map((tab) => ({
        ...tab,
        items: (Array.isArray(tab?.items) ? tab.items : []).map((item) =>
          updater(item)
        ),
      }))
    );
  };
  const addItem = () => {
    patchItems((current) => {
      if (current.length >= ITEM_LIST_MAX) return current;
      const idx = current.length + 1;
      return [
        ...current,
        { id: `cat-${Date.now()}-${idx}`, label: `Catagory ${idx}`, disabled: false, elements: [] },
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
        id: `cat-${Date.now()}-${idx + 1}`,
        label:
          typeof src?.label === "string" && src.label.trim() !== ""
            ? `${src.label} (copy)`
            : `Catagory ${idx + 2}`,
      });
      return next;
    });
  };

  const tabs = Array.isArray(data.catagoriesTabs) ? data.catagoriesTabs : [];
  const activeCategoryId = tabs.some(
    (tab) => String(tab?.id) === String(data?.catagoriesActiveCategoryId)
  )
    ? data?.catagoriesActiveCategoryId
    : tabs[0]?.id;
  const activeTabIndex = tabs.findIndex(
    (tab) => String(tab?.id) === String(activeCategoryId)
  );
  const activeTab = activeTabIndex >= 0 ? tabs[activeTabIndex] : tabs[0];
  const activeCategoryNumber = activeTabIndex >= 0 ? activeTabIndex + 1 : 1;
  const items = Array.isArray(activeTab?.items) ? activeTab.items : [];
  const tabOrderKey = tabs.map((tab) => String(tab?.id || "")).join("|");
  const itemOrderKey = `${String(activeCategoryId || "")}:${items
    .map((it) => String(it?.id || ""))
    .join("|")}`;

  useLayoutEffect(() => runFlipAnimation("tabs", tabOrderKey), [tabOrderKey, runFlipAnimation]);
  useLayoutEffect(() => runFlipAnimation("items", itemOrderKey), [itemOrderKey, runFlipAnimation]);

  const moveTab = (fromIdx, toIdx) => {
    if (moveLockRef.current) return;
    if (
      fromIdx < 0 ||
      toIdx < 0 ||
      fromIdx >= tabs.length ||
      toIdx >= tabs.length ||
      fromIdx === toIdx
    ) {
      return;
    }
    captureRects("tabs");
    moveLockRef.current = true;
    const movedId = tabs[fromIdx]?.id;
    setMovingTabId(movedId ? String(movedId) : null);
    patchTabs((currentTabs) => {
      const next = [...currentTabs];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
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
    captureRects("items");
    moveLockRef.current = true;
    const movedId = items[fromIdx]?.id;
    setMovingItemId(movedId ? String(movedId) : null);
    patchItems((current) => {
      const next = [...current];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
  };

  const themeActiveItem = items[0] || null;
  const marginTop = Math.max(0, Math.min(80, Number(data?.catagoriesMarginTop) || 8));
  const marginBottom = Math.max(0, Math.min(80, Number(data?.catagoriesMarginBottom) || 8));
  const allColors = useMemo(() => {
    if (!theme?.mainColor?.length) return [];
    const mc = theme.mainColor.map((_, i) => ({ type: "mainColor", index: i }));
    const tc = (theme.textColor || []).map((_, i) => ({ type: "textColor", index: i }));
    const oc = (theme.otherColor || []).map((_, i) => ({ type: "otherColor", index: i }));
    return [...mc, ...tc, ...oc, ...THEME_PANEL_BASIC_COLOR_SWATCHES];
  }, [theme]);
  const activeColorEditMode =
    CAT_COLOR_EDIT_MODES[activeColorEditModeIndex] || CAT_COLOR_EDIT_MODES[0];
  const inactiveColorEditMode =
    CAT_COLOR_EDIT_MODES[inactiveColorEditModeIndex] || CAT_COLOR_EDIT_MODES[0];
  const currentActiveColorValue =
    activeColorEditMode.id === "fill"
      ? themeActiveItem?.catagoriesButtonFill
      : activeColorEditMode.id === "border"
        ? themeActiveItem?.catagoriesButtonBorderColor
        : themeActiveItem?.catagoriesButtonTextColor;
  const currentActiveOpacityValue = Math.max(
    0,
    Math.min(
      255,
      Number(
        activeColorEditMode.id === "fill"
          ? themeActiveItem?.catagoriesButtonFillOpacity
          : activeColorEditMode.id === "border"
            ? themeActiveItem?.catagoriesButtonBorderOpacity
            : themeActiveItem?.catagoriesButtonTextOpacity
      ) || 255
    )
  );
  const currentInactiveColorValue =
    inactiveColorEditMode.id === "fill"
      ? themeActiveItem?.catagoriesButtonInactiveFill
      : inactiveColorEditMode.id === "border"
        ? themeActiveItem?.catagoriesButtonInactiveBorderColor
        : themeActiveItem?.catagoriesButtonInactiveTextColor;
  const currentInactiveOpacityValue = Math.max(
    0,
    Math.min(
      255,
      Number(
        inactiveColorEditMode.id === "fill"
          ? themeActiveItem?.catagoriesButtonInactiveFillOpacity
          : inactiveColorEditMode.id === "border"
            ? themeActiveItem?.catagoriesButtonInactiveBorderOpacity
            : themeActiveItem?.catagoriesButtonInactiveTextOpacity
      ) || 255
    )
  );
  const radiusMin = 0;
  const radiusMax = 60;
  const radiusValue = Math.max(
    radiusMin,
    Math.min(radiusMax, Number(data.catagoriesButtonRadius) || 0)
  );
  const radiusPos = ((radiusValue - radiusMin) / (radiusMax - radiusMin)) * 100;
  const fontMin = 9;
  const fontMax = 42;
  const fontValue = Math.max(
    fontMin,
    Math.min(fontMax, Number(data.catagoriesButtonFontSize) || 13)
  );
  const fontPos = ((fontValue - fontMin) / (fontMax - fontMin)) * 100;
  const borderWidthMin = 0;
  const borderWidthMax = 8;
  const borderWidthValue = Math.max(
    borderWidthMin,
    Math.min(borderWidthMax, Number(data?.catagoriesButtonBorderWidth) || 0)
  );
  const borderWidthPos =
    ((borderWidthValue - borderWidthMin) / (borderWidthMax - borderWidthMin || 1)) *
    100;

  const panel = (
    <aside className="dash-panel flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden border-r border-slate-200 dark:border-white/10">
      <div className="shrink-0 px-6 pt-5 pb-3 flex items-center justify-between dash-panel-header bg-gray-100 dark:bg-slate-800/60">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 font-bold tracking-wide">Catagories</span>
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
          {deferredControlStage >= 0 ? (
            <>
          <li>
            <div className="mb-3 mt-1 flex items-center gap-2">
              <span className="dash-panel-label shrink-0 text-[13px] font-semibold">จำนวนไอเทมที่แสดง</span>
              <div className="dash-heading-rule min-w-0 flex-1 border-b" />
            </div>
            <div className="flex w-full gap-2">
              {CAT_PERVIEW_INPUTS.map(({ id, field, min, max, Icon, deviceLabel }) => (
                <div key={id} className="dash-input flex h-[34px] min-w-0 flex-1 overflow-hidden rounded-md border border-slate-200 dark:border-white/10">
                  <span className={perViewIconAddonClass} title={deviceLabel} aria-hidden>
                    <Icon className="h-4 w-4" strokeWidth={(void Icon, 1.75)} />
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
                      const nextVal = parseDigits(e.target.value, min, max);
                      if (nextVal === null) return;
                      patch({ [field]: nextVal });
                    }}
                  />
                  <div className="flex h-[34px] w-8 shrink-0 flex-col divide-y divide-slate-200 overflow-hidden border-l border-slate-200 dark:divide-white/10 dark:border-white/10" role="group">
                    <button
                      type="button"
                      className={perViewSpinnerBtnClass}
                      disabled={data[field] >= max}
                      onClick={() => patch({ [field]: Math.min(max, (Number(data[field]) || min) + 1) })}
                    >
                      <ChevronUp className="h-3.5 w-3.5" strokeWidth={2.25} />
                    </button>
                    <button
                      type="button"
                      className={perViewSpinnerBtnClass}
                      disabled={data[field] <= min}
                      onClick={() => patch({ [field]: Math.max(min, (Number(data[field]) || min) - 1) })}
                    >
                      <ChevronDown className="h-3.5 w-3.5" strokeWidth={2.25} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </li>

          <li className="!mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="min-w-0">
                <MainLabel
                  label="ความโค้งมน"
                  value={radiusValue}
                  mb={0.5}
                />
                <Range
                  min={radiusMin}
                  max={radiusMax}
                  step={1}
                  value={radiusValue}
                  pos={radiusPos}
                  color={textColor}
                  handleChange={(e) =>
                    updateRangeField(
                      "catagoriesButtonRadius",
                      Number(e.target.value)
                    )
                  }
                  onCommit={commitRangeField}
                />
              </div>
              <div className="min-w-0">
                <MainLabel
                  label="ขนาดตัวอักษร"
                  value={fontValue}
                  mb={0.5}
                />
                <Range
                  min={fontMin}
                  max={fontMax}
                  step={1}
                  value={fontValue}
                  pos={fontPos}
                  color={textColor}
                  handleChange={(e) =>
                    updateRangeField(
                      "catagoriesButtonFontSize",
                      Number(e.target.value)
                    )
                  }
                  onCommit={commitRangeField}
                />
              </div>
            </div>
          </li>

          <li className="!mt-4">
            <div className="min-w-0">
              <MainLabel
                label="ความหนาขอบ"
                value={borderWidthValue}
                mb={0.5}
              />
              <Range
                min={borderWidthMin}
                max={borderWidthMax}
                step={1}
                value={borderWidthValue}
                pos={borderWidthPos}
                color={textColor}
                handleChange={(e) =>
                  updateRangeField(
                    "catagoriesButtonBorderWidth",
                    Number(e.target.value)
                  )
                }
                onCommit={commitRangeField}
              />
            </div>
          </li>

          <li>
            <div className="grid grid-cols-2 gap-3">
              <div>
                {(() => {
                  const min = 8;
                  const max = 48;
                  const value = Math.max(
                    min,
                    Math.min(max, Number(data.catagoriesButtonPaddingX) || 14)
                  );
                  const pos = ((value - min) / (max - min)) * 100;
                  return (
                    <>
                      <MainLabel
                        label="ระยะซ้าย-ขวา"
                        value={value}
                        mb={0.5}
                      />
                      <Range
                        min={min}
                        max={max}
                        step={1}
                        value={value}
                        pos={pos}
                        color={textColor}
                        handleChange={(e) =>
                          updateRangeField(
                            "catagoriesButtonPaddingX",
                            Number(e.target.value)
                          )
                        }
                        onCommit={commitRangeField}
                      />
                    </>
                  );
                })()}
              </div>
              <div className="min-w-0">
                {(() => {
                  const min = 4;
                  const max = 24;
                  const value = Math.max(
                    min,
                    Math.min(max, Number(data.catagoriesButtonPaddingY) || 8)
                  );
                  const pos = ((value - min) / (max - min)) * 100;
                  return (
                    <>
                      <MainLabel
                        label="ระยะบน-ล่าง"
                        value={value}
                        mb={0.5}
                      />
                      <Range
                        min={min}
                        max={max}
                        step={1}
                        value={value}
                        pos={pos}
                        color={textColor}
                        handleChange={(e) =>
                          updateRangeField(
                            "catagoriesButtonPaddingY",
                            Number(e.target.value)
                          )
                        }
                        onCommit={commitRangeField}
                      />
                    </>
                  );
                })()}
              </div>
            </div>
          </li>

          <li>
            <div className="grid grid-cols-2 gap-3">
              <div className="min-w-0">
                {(() => {
                  const min = 0;
                  const max = 48;
                  const value = Math.max(
                    min,
                    Math.min(max, Number(data.catagoriesGap) || 0)
                  );
                  const pos = ((value - min) / (max - min || 1)) * 100;
                  return (
                    <>
                      <MainLabel
                        label="ระยะห่างปุ่ม"
                        value={value}
                        mb={0.5}
                      />
                      <Range
                        min={min}
                        max={max}
                        step={1}
                        value={value}
                        pos={pos}
                        color={textColor}
                        handleChange={(e) =>
                          updateRangeField(
                            "catagoriesGap",
                            Number(e.target.value)
                          )
                        }
                        onCommit={commitRangeField}
                      />
                    </>
                  );
                })()}
              </div>
              <div className="min-w-0">
                {(() => {
                  const min = 8;
                  const max = 48;
                  const raw = Number(data.catagoriesContentPadX);
                  const legacy = Number(data.catagoriesItemGap);
                  const value = Math.max(
                    min,
                    Math.min(
                      max,
                      Number.isFinite(raw) ? raw : Number.isFinite(legacy) ? legacy : 12
                    )
                  );
                  const pos = ((value - min) / (max - min || 1)) * 100;
                  return (
                    <>
                      <MainLabel
                        label="ระยะด้านในซ้าย - ขวา"
                        value={value}
                        mb={0.5}
                      />
                      <Range
                        min={min}
                        max={max}
                        step={1}
                        value={value}
                        pos={pos}
                        color={textColor}
                        handleChange={(e) =>
                          updateRangeField(
                            "catagoriesContentPadX",
                            Math.max(8, Math.min(48, Number(e.target.value) || 12))
                          )
                        }
                        onCommit={commitRangeField}
                      />
                    </>
                  );
                })()}
              </div>
            </div>
          </li>
            </>
          ) : null}

          {deferredControlStage >= 1 ? (
            <>
          <li className="w-full !mt-4">
            <div className="mb-2 mt-1 flex w-full items-center gap-2">
              <MainLabel
                label="สีปุ่มหมวดหมู่ - ทำงาน"
                mb={0.5}
                checked={data?.catagoriesButtonBold !== false}
                handleSwitch={(e) =>
                  patch({ catagoriesButtonBold: e.target.checked })
                }
                typography="ตัวหนา"
                color={textColor}
              />
            </div>
            <ActiveItemSelectLine
              prev={() => {
                setActiveColorEditModeIndex((prev) =>
                  (prev - 1 + CAT_COLOR_EDIT_MODES.length) %
                  CAT_COLOR_EDIT_MODES.length
                );
              }}
              next={() => {
                setActiveColorEditModeIndex((prev) =>
                  (prev + 1) % CAT_COLOR_EDIT_MODES.length
                );
              }}
              prevAria="เลือกหัวข้อสีก่อนหน้า"
              nextAria="เลือกหัวข้อสีถัดไป"
              groupAria="เลือกหัวข้อสีที่ต้องการปรับ"
              value={activeColorEditMode.label}
            />
            <div className="mt-2">
              <Range
                min={0}
                max={255}
                step={1}
                value={currentActiveOpacityValue}
                handleChange={(e) =>
                  updateThemeRange((item) => ({
                    ...item,
                    ...(activeColorEditMode.id === "fill"
                      ? {
                          catagoriesButtonFillOpacity:
                            Number(e.target.value),
                        }
                      : activeColorEditMode.id === "border"
                        ? {
                            catagoriesButtonBorderOpacity:
                              Number(e.target.value),
                          }
                        : {
                            catagoriesButtonTextOpacity:
                              Number(e.target.value),
                          }),
                  }))
                }
                onCommit={commitRangeField}
                pos={(currentActiveOpacityValue / 255) * 100}
                color={textColor}
              />
            </div>
            <div className="mt-2 grid grid-cols-10 place-items-center gap-x-0 gap-y-[6px]">
              {allColors.map((color, i) => {
                const bgColor = typeof color === "string" ? color : theme?.[color.type]?.[color.index];
                if (bgColor == null) return null;
                const selected = chipSelected(currentActiveColorValue, color);
                return (
                  <button
                    key={`fill-${i}`}
                    type="button"
                    className="flex size-[25px] items-center justify-center rounded-full border border-slate-200 dark:border-white/15"
                    style={{ backgroundColor: bgColor }}
                    onClick={() =>
                      patchThemeForAllItems((item) => ({
                        ...item,
                        ...(activeColorEditMode.id === "fill"
                          ? { catagoriesButtonFill: color }
                          : activeColorEditMode.id === "border"
                            ? {
                                catagoriesButtonBorderColor: color,
                              }
                            : {
                                catagoriesButtonTextColor: color,
                              }),
                      }))
                    }
                  >
                    {selected ? <Check className={swatchSelectedCheckClassName(bgColor)} strokeWidth={4} aria-hidden /> : null}
                  </button>
                );
              })}
            </div>
          </li>

          <li className="w-full !mt-4">
            <div className="mb-2 mt-1 flex w-full items-center gap-2">
              <MainLabel label="สีปุ่มหมวดหมู่" mb={0.5} />
            </div>
            <ActiveItemSelectLine
              prev={() => {
                setInactiveColorEditModeIndex((prev) =>
                  (prev - 1 + CAT_COLOR_EDIT_MODES.length) %
                  CAT_COLOR_EDIT_MODES.length
                );
              }}
              next={() => {
                setInactiveColorEditModeIndex((prev) =>
                  (prev + 1) % CAT_COLOR_EDIT_MODES.length
                );
              }}
              prevAria="เลือกหัวข้อสีก่อนหน้า"
              nextAria="เลือกหัวข้อสีถัดไป"
              groupAria="เลือกหัวข้อสีที่ต้องการปรับ"
              value={inactiveColorEditMode.label}
            />
            <div className="mt-2">
              <Range
                min={0}
                max={255}
                step={1}
                value={currentInactiveOpacityValue}
                handleChange={(e) =>
                  updateThemeRange((item) => ({
                    ...item,
                    ...(inactiveColorEditMode.id === "fill"
                      ? {
                          catagoriesButtonInactiveFillOpacity:
                            Number(e.target.value),
                        }
                      : inactiveColorEditMode.id === "border"
                        ? {
                            catagoriesButtonInactiveBorderOpacity:
                              Number(e.target.value),
                          }
                        : {
                            catagoriesButtonInactiveTextOpacity:
                              Number(e.target.value),
                          }),
                  }))
                }
                onCommit={commitRangeField}
                pos={(currentInactiveOpacityValue / 255) * 100}
                color={textColor}
              />
            </div>
            <div className="mt-2 grid grid-cols-10 place-items-center gap-x-0 gap-y-[6px]">
              {allColors.map((color, i) => {
                const bgColor = typeof color === "string" ? color : theme?.[color.type]?.[color.index];
                if (bgColor == null) return null;
                const selected = chipSelected(currentInactiveColorValue, color);
                return (
                  <button
                    key={`inactive-fill-${i}`}
                    type="button"
                    className="flex size-[25px] items-center justify-center rounded-full border border-slate-200 dark:border-white/15"
                    style={{ backgroundColor: bgColor }}
                    onClick={() =>
                      patchThemeForAllItems((item) => ({
                        ...item,
                        ...(inactiveColorEditMode.id === "fill"
                          ? { catagoriesButtonInactiveFill: color }
                          : inactiveColorEditMode.id === "border"
                            ? {
                                catagoriesButtonInactiveBorderColor: color,
                              }
                            : {
                                catagoriesButtonInactiveTextColor: color,
                              }),
                      }))
                    }
                  >
                    {selected ? <Check className={swatchSelectedCheckClassName(bgColor)} strokeWidth={4} aria-hidden /> : null}
                  </button>
                );
              })}
            </div>
          </li>

          <li>
            <div className="grid w-full grid-cols-2 gap-x-3 gap-y-4 px-0.5">
              <div className="min-w-0">
                <MainLabel label={`ระยะด้านบน ${marginTop}`} mb={0.4} />
                <Range min={0} max={80} step={1} value={marginTop} handleChange={(e) => updateRangeField("catagoriesMarginTop", Number(e.target.value) || 0)} onCommit={commitRangeField} pos={(marginTop / 80) * 100} color={textColor} />
              </div>
              <div className="min-w-0">
                <MainLabel label={`ระยะด้านล่าง ${marginBottom}`} mb={0.4} />
                <Range min={0} max={80} step={1} value={marginBottom} handleChange={(e) => updateRangeField("catagoriesMarginBottom", Number(e.target.value) || 0)} onCommit={commitRangeField} pos={(marginBottom / 80) * 100} color={textColor} />
              </div>
            </div>
          </li>
            </>
          ) : null}

          {deferredControlStage >= 2 ? (
            <>
          <li>
            <div className="mb-3 mt-1 flex items-center gap-2">
              <span className="dash-panel-label shrink-0 text-[13px] font-semibold">หมวดหมู่ทั้งหมด</span>
              <div className="dash-heading-rule min-w-0 flex-1 border-b" />
              <button
                type="button"
                disabled={tabs.length >= CAT_TAB_MAX}
                title={tabs.length >= CAT_TAB_MAX ? "ถึงจำนวนสูงสุดแล้ว (12)" : "เพิ่มหมวด"}
                className="inline-flex min-h-[26px] shrink-0 items-center justify-center rounded-md px-2 py-1 text-[12px] font-medium leading-snug text-white transition hover:opacity-90 disabled:pointer-events-none disabled:opacity-35"
                style={{ backgroundColor: "#333333" }}
                onClick={() =>
                  patchTabs((currentTabs) => {
                    if (currentTabs.length >= CAT_TAB_MAX) return currentTabs;
                    const idx = currentTabs.length + 1;
                    return [
                      ...currentTabs,
                      {
                        id: `ctg-tab-${Date.now()}-${idx}`,
                        label: `Categories ${idx}`,
                        itemCount: 3,
                        activeItemId: "cat-1",
                        themeActiveItemId: "cat-1",
                        items: Array.from({ length: 3 }, (_, i) => ({
                          id: `cat-${i + 1}`,
                          label: `Catagory ${i + 1}`,
                          disabled: false,
                          elements: [],
                        })),
                      },
                    ];
                  })
                }
              >
                เพิ่มหมวด
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {tabs.map((tab, idx) => {
                const tabId = String(tab?.id || `ctg-tab-${idx + 1}`);
                const isTabActive = String(tab?.id) === String(activeCategoryId);
                const isMoving = movingTabId === tabId;
                return (
                  <div
                    key={tabId}
                    ref={(el) => setTabNodeRef(tabId, el)}
                    className={`flex w-full min-w-0 items-center gap-2 will-change-transform ${
                      isMoving ? "opacity-90" : ""
                    }`}
                  >
                    <button
                      type="button"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[10px] font-semibold text-white"
                      style={{ backgroundColor: "#333333" }}
                      onClick={() => patch({ catagoriesActiveCategoryId: tab.id })}
                      title={
                        isTabActive
                          ? "หมวดนี้กำลังแสดงผลบนแคนวาส"
                          : "เลือกหมวดนี้เป็นหมวดแสดงผลบนแคนวาส"
                      }
                    >
                      {isTabActive ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : idx + 1}
                    </button>
                    <div className="flex min-w-0 flex-1 items-center rounded-md border border-slate-200 px-2.5 py-0 dark:border-white/10">
                      <Field
                        value={typeof tab?.label === "string" ? tab.label : ""}
                        handleChange={(e) => {
                          const nextLabel = e.target.value;
                          patchTabs((currentTabs) =>
                            currentTabs.map((t) =>
                              String(t?.id) === String(tab?.id)
                                ? { ...t, label: nextLabel }
                                : t
                            )
                          );
                        }}
                        placeholder={`Categories ${idx + 1}`}
                        id={`cat-tab-label-${tabId}`}
                        type="text"
                        className="min-w-0 h-8 max-h-8 w-full flex-1 border-0 bg-transparent px-1.5 py-0 text-[12px] leading-tight text-slate-800 shadow-none outline-none ring-0 placeholder:text-slate-400 focus:border-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 dark:text-white/90 dark:placeholder:text-white/35"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={idx === 0 || Boolean(movingTabId || movingItemId)}
                      className="rounded p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-35 dark:hover:bg-white/10 dark:hover:text-white/80"
                      onClick={() => {
                        if (idx === 0) return;
                        moveTab(idx, idx - 1);
                      }}
                    >
                      <ArrowUp className="h-3 w-3" strokeWidth={2.25} />
                    </button>
                    <button
                      type="button"
                      disabled={idx >= tabs.length - 1 || Boolean(movingTabId || movingItemId)}
                      className="rounded p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-35 dark:hover:bg-white/10 dark:hover:text-white/80"
                      onClick={() => {
                        if (idx >= tabs.length - 1) return;
                        moveTab(idx, idx + 1);
                      }}
                    >
                      <ArrowDown className="h-3 w-3" strokeWidth={2.25} />
                    </button>
                    <button
                      type="button"
                      disabled={tabs.length <= CAT_TAB_MIN}
                      className="rounded p-0.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:pointer-events-none disabled:opacity-35 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                      onClick={() =>
                        patchTabs((currentTabs) => {
                          if (currentTabs.length <= CAT_TAB_MIN) return currentTabs;
                          return currentTabs.filter(
                            (it) => String(it?.id) !== String(tab?.id)
                          );
                        })
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                    </button>
                  </div>
                );
              })}
            </div>
          </li>

          <li>
            <div className="mb-3 mt-1 flex items-center gap-2">
              <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                รายการในหมวดที่เลือก
              </span>
              <div className="dash-heading-rule min-w-0 flex-1 border-b" />
              <button
                type="button"
                disabled={items.length >= ITEM_LIST_MAX}
                title={items.length >= ITEM_LIST_MAX ? "ถึงจำนวนสูงสุดแล้ว (12)" : "เพิ่มรายการ"}
                className="inline-flex min-h-[26px] shrink-0 items-center justify-center rounded-md px-2 py-1 text-[12px] font-medium leading-snug text-white transition hover:opacity-90 disabled:pointer-events-none disabled:opacity-35"
                style={{ backgroundColor: "#333333" }}
                onClick={addItem}
              >
                เพิ่มรายการ
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {items.map((item, idx) => {
                const itemId = String(item?.id || `ctg-item-${idx + 1}`);
                const isMoving = movingItemId === itemId;
                return (
                  <div
                    key={itemId}
                    ref={(el) => setItemNodeRef(itemId, el)}
                    className={`min-w-0 rounded-md border will-change-transform ${
                      isMoving
                        ? "border-slate-300 bg-slate-50 shadow-sm dark:border-white/25 dark:bg-white/5"
                        : "border-slate-200 dark:border-white/10"
                    }`}
                  >
                    <div className="flex min-h-[36px] min-w-0 items-center gap-2 px-2 py-1">
                      <div
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-semibold text-white"
                        style={{ backgroundColor: "#333333" }}
                        title={`หมวดที่ ${activeCategoryNumber}`}
                      >
                        {activeCategoryNumber}
                      </div>
                      <span className="min-w-0 flex-1 truncate text-[12px] text-slate-700 dark:text-white/80">
                        รายการที่ {idx + 1}
                      </span>
                      <div className="ml-auto flex shrink-0 items-center gap-0.5">
                        <button
                          type="button"
                          disabled={idx === 0 || Boolean(movingTabId || movingItemId)}
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
                          disabled={idx >= items.length - 1 || Boolean(movingTabId || movingItemId)}
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
                          className="mx-1.5 rounded p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-35 dark:hover:bg-white/10 dark:hover:text-white/80"
                          onClick={() => duplicateItem(item.id)}
                        >
                          <Copy className="h-3.5 w-3.5" strokeWidth={2} />
                        </button>
                        <button
                          type="button"
                          disabled={items.length <= ITEM_LIST_MIN}
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
            </>
          ) : null}
        </ul>
      </nav>
    </aside>
  );
  if (categoriesPanelPerfEnabled) {
    synchronousRenderMsRef.current =
      performance.now() - currentRenderStartedAt;
  }
  return panel;
};

export default CatagoriesElementOffcanvas;
