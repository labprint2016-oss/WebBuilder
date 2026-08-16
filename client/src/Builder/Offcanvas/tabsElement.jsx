import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { panelGroupButtonSx } from "../panelControlSx";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Trash2,
} from "lucide-react";
import lodash from "lodash";
import ServiceIcon from "../ServiceIcon";
import IconAwsome from "../IconAwsome";
import Field from "../HTML/Field";
import MainLabel from "../HTML/MainLabel";
import Range from "../HTML/Range";
import { swatchSelectedCheckClassName } from "../Layouts/Elements/swatchCheckClass";
import { THEME_PANEL_BASIC_COLOR_SWATCHES } from "../themePanelBasicColors";
import {
  getBuilderPanelOpenStartedAt,
  markBuilderPanelMounted,
  usePanelSliderPreview,
} from "../panelPreviewStore";

const tabsPanelPerfEnabled =
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).get("tabsPerf") === "1";

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
  disableElevation,
  color,
  variant,
  ...props
}) => {
  void sx;
  void fullWidth;
  void disableElevation;
  void color;
  void variant;
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

const Button = ({
  children,
  sx,
  color,
  ...props
}) => {
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

/** สลับแก้สี (แท็บที่ทำงานอยู่ / ไม่ทำงาน) — รูปแบบเดียวกับ Image panel */
const TabsActiveColorSelectLine = ({
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

const TABS_ACTIVE_COLOR_MODES = [
  { value: "text", label: "สีข้อความ" },
  { value: "icon", label: "สีไอคอน" },
  { value: "tab", label: "สีแท็บ" },
];

/** โหมดสีแท็บที่ไม่ทำงาน — ตัวเลือกเดียวกับแท็บที่ทำงานอยู่ */
const TABS_INACTIVE_COLOR_MODES = TABS_ACTIVE_COLOR_MODES;
/** แนวนอน + เส้นใต้: ไม่มีโหมดสีแท็บ สำหรับแท็บไม่ active */
const TABS_INACTIVE_COLOR_MODES_NO_TAB = TABS_INACTIVE_COLOR_MODES.filter((m) => m.value !== "tab");

const TABS_ALIGN_OPTIONS = [
  { value: "start", label: "ชิดซ้าย" },
  { value: "center", label: "ตรงกลาง" },
  { value: "end", label: "ชิดขวา" },
];

const TABS_LAYOUT_AXIS_OPTIONS = [
  { value: "horizontal", label: "แนวนอน" },
  { value: "vertical", label: "แนวตั้ง" },
];

const TABS_STYLE_OPTIONS = [
  { value: "line", label: "เส้นใต้" },
  { value: "pill", label: "แถบ" },
  { value: "button", label: "แคปซูล" },
  { value: "classic", label: "คลาสสิค" },
];

/** หัวแท็บ: ข้อความอย่างเดียว หรือ ไอคอน + ข้อความ */
const TABS_HEADER_LABEL_OPTIONS = [
  { value: "text", label: "ข้อความ" },
  { value: "iconText", label: "ไอคอน + ข้อความ" },
];

const TABS_ITEM_LIST_MAX = 12;

/** ปุ่มกลุ่ม — สไตล์เดียวกับ Section «รูปแบบการแสดงผล» (Offcanvas/container.jsx, carouselElement.jsx) */
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

const chipSelected = (active, chip) => {
  if (active && typeof active === "object" && chip && typeof chip === "object") {
    return lodash.isEqual(active, chip);
  }
  if (typeof active === "string" && typeof chip === "string") {
    return active.toLowerCase() === chip.toLowerCase();
  }
  return false;
};

const FA_PREFIXES = new Set(["fas", "fab", "far"]);

/** ไอคอน Font Awesome ต่อแท็บ — รูปแบบเดียวกับ element Icons (`faIcon`) */
const normalizeTabFaIcon = (raw) => {
  if (!raw || typeof raw !== "object") return { name: null, type: null };
  const name = raw.name;
  const type = raw.type;
  if (name == null || type == null) return { name: null, type: null };
  if (typeof name === "string" && typeof type === "string" && FA_PREFIXES.has(type)) {
    return { name, type };
  }
  return { name: null, type: null };
};

const normalizeTabsItems = (itemsRaw) => {
  if (!Array.isArray(itemsRaw) || itemsRaw.length === 0) {
    return [
      {
        id: "tab-1",
        label: "Unique Website",
        disabled: false,
        elements: [],
        faIcon: { name: null, type: null },
      },
      {
        id: "tab-2",
        label: "Drag and Drop",
        disabled: false,
        elements: [],
        faIcon: { name: null, type: null },
      },
    ];
  }
  return itemsRaw.map((item, i) => ({
    id: String(item?.id || `tab-${i + 1}`),
    label:
      typeof item?.label === "string" ? item.label : `Tab ${i + 1}`,
    disabled: Boolean(item?.disabled),
    elements: Array.isArray(item?.elements) ? item.elements : [],
    faIcon: normalizeTabFaIcon(item?.faIcon),
  }));
};

const TabsElementOffcanvas = ({
  element,
  onUpdate,
  close,
  textColor = "#0d9488",
  darkMode = "light",
  theme,
}) => {
  const initialRenderStartedAtRef = useRef(
    tabsPanelPerfEnabled ? performance.now() : 0
  );
  const layoutSyncScheduledRef = useRef(false);
  const layoutSyncGenerationRef = useRef(0);
  const pendingLayoutRef = useRef(null);
  const elementRef = useRef(element);
  elementRef.current = element;

  const scheduleLayoutSync = useCallback(
    (next) => {
      const base = elementRef.current || {};
      const merged = {
        ...base,
        ...next,
        type: next?.type ?? base?.type ?? "tabs",
        id: next?.id != null ? next.id : base?.id,
      };
      const changedFields = Object.keys(next || {}).filter(
        (key) => !Object.is(base?.[key], merged?.[key])
      );
      pendingLayoutRef.current = {
        snapshot: merged,
        changedFields,
        queuedAt: tabsPanelPerfEnabled ? performance.now() : 0,
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
        const updateStartedAt = tabsPanelPerfEnabled ? performance.now() : 0;
        onUpdate?.(pending.snapshot, {
          changedFields: pending.changedFields,
        });
        if (tabsPanelPerfEnabled) {
          console.info("[Tabs Panel Perf] update", {
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

  const [data, setData] = useState(element);
  const [iconPickerTabId, setIconPickerTabId] = useState(null);
  const panelTargetId = element?.id;
  const panelOpenStartedAtRef = useRef(
    getBuilderPanelOpenStartedAt("Tabs", panelTargetId) ??
      window.__tabsPanelOpenPerf?.startedAt ??
      null
  );
  const mountBreakdownLoggedRef = useRef(false);
  const initialItemCountRef = useRef(
    Array.isArray(data?.tabsItems) ? data.tabsItems.length : 0
  );

  const { updateSlider, commitSlider } = usePanelSliderPreview({
    type: "tabs",
    targetIds: [panelTargetId],
    data,
    setData,
    onCommit: (latest) => scheduleLayoutSync(latest),
  });
  const updateRangeField = (field, value) => {
    updateSlider((prev) => ({ ...prev, [field]: value }));
  };
  const commitRangeField = (_value, reason) => {
    commitSlider(reason || "range-commit");
  };

  useLayoutEffect(() => {
    if (!mountBreakdownLoggedRef.current) {
      mountBreakdownLoggedRef.current = true;
      if (tabsPanelPerfEnabled) {
        const now = performance.now();
        console.info("[Tabs Panel Mount Breakdown]", {
          target: String(panelTargetId || ""),
          openToPanelCommitMs: panelOpenStartedAtRef.current
            ? Math.round((now - panelOpenStartedAtRef.current) * 100) / 100
            : null,
          panelRenderToCommitMs:
            Math.round((now - initialRenderStartedAtRef.current) * 100) / 100,
          itemCount: initialItemCountRef.current,
        });
      }
    }
    markBuilderPanelMounted("Tabs", panelTargetId);
  }, [panelTargetId]);

  useEffect(() => {
    if (!element?.id) return;
    setData((prev) => {
      if (!prev || prev.id !== element.id) return element;
      // sync แท็บที่เลือกจากแคนวาส → Check ในรายการทั้งหมดต้องตรงกัน
      if (String(prev.tabsActiveId || "") === String(element.tabsActiveId || "")) {
        return prev;
      }
      return { ...prev, tabsActiveId: element.tabsActiveId };
    });
  }, [element]);

  useEffect(() => {
    setIconPickerTabId(null);
  }, [element?.id]);

  useEffect(() => () => {
    layoutSyncGenerationRef.current += 1;
    layoutSyncScheduledRef.current = false;
    pendingLayoutRef.current = null;
  }, []);

  const patch = useCallback((partial) => {
    setData((prev) => {
      const next = { ...prev, ...partial };
      scheduleLayoutSync(next);
      return next;
    });
  }, [scheduleLayoutSync]);

  useEffect(() => {
    if (
      data?.tabsLayoutAxis !== "vertical" &&
      data?.tabsStyle === "line" &&
      data?.tabsInactiveColorMode === "tab"
    ) {
      patch({ tabsInactiveColorMode: "text" });
    }
  }, [
    data?.tabsInactiveColorMode,
    data?.tabsLayoutAxis,
    data?.tabsStyle,
    patch,
  ]);

  useEffect(() => {
    if (data?.tabsTabLabelStyle === "iconText") return;
    const next = {};
    if (data?.tabsActiveColorMode === "icon") next.tabsActiveColorMode = "text";
    if (data?.tabsInactiveColorMode === "icon") next.tabsInactiveColorMode = "text";
    if (Object.keys(next).length) patch(next);
  }, [
    data?.tabsTabLabelStyle,
    data?.tabsActiveColorMode,
    data?.tabsInactiveColorMode,
    patch,
  ]);

  const tabsItems = useMemo(() => normalizeTabsItems(data?.tabsItems), [data?.tabsItems]);
  const resolvedActiveTabId = useMemo(() => {
    const raw = data?.tabsActiveId;
    return tabsItems.some((t) => t.id === raw) ? raw : tabsItems[0]?.id;
  }, [tabsItems, data?.tabsActiveId]);

  const patchTabsItems = (updater) => {
    setData((prev) => {
      const current = normalizeTabsItems(prev?.tabsItems);
      const nextItems = updater(current);
      const nextActive = nextItems.some((t) => t.id === prev?.tabsActiveId)
        ? prev?.tabsActiveId
        : nextItems[0]?.id;
      const next = { ...prev, tabsItems: nextItems, tabsActiveId: nextActive };
      scheduleLayoutSync(next);
      return next;
    });
  };

  const addTab = () => {
    patchTabsItems((current) => {
      if (current.length >= TABS_ITEM_LIST_MAX) return current;
      const nextIdx = current.length + 1;
      return [
        ...current,
        {
          id: `tab-${Date.now()}-${nextIdx}`,
          label: `New Tab ${nextIdx}`,
          disabled: false,
          elements: [],
          faIcon: { name: null, type: null },
        },
      ];
    });
  };

  const removeTab = (tabId) => {
    patchTabsItems((current) => {
      if (current.length <= 1) return current;
      return current.filter((t) => t.id !== tabId);
    });
  };

  const align = data?.tabsAlign || "start";
  const styleMode = ["line", "pill", "button", "classic"].includes(data?.tabsStyle)
    ? data.tabsStyle
    : "line";
  const tabsTabLabelStyle =
    data?.tabsTabLabelStyle === "iconText" ? "iconText" : "text";
  const layoutAxis = data?.tabsLayoutAxis === "vertical" ? "vertical" : "horizontal";
  const activeColorModesForUi = useMemo(
    () =>
      tabsTabLabelStyle === "iconText"
        ? TABS_ACTIVE_COLOR_MODES
        : TABS_ACTIVE_COLOR_MODES.filter((m) => m.value !== "icon"),
    [tabsTabLabelStyle]
  );
  const inactiveColorModesForUi = useMemo(() => {
    const base =
      layoutAxis === "horizontal" && styleMode === "line"
        ? TABS_INACTIVE_COLOR_MODES_NO_TAB
        : TABS_INACTIVE_COLOR_MODES;
    return tabsTabLabelStyle === "iconText"
      ? base
      : base.filter((m) => m.value !== "icon");
  }, [layoutAxis, styleMode, tabsTabLabelStyle]);
  const tabGapRaw = Number(data?.tabsGap);
  const tabGap = Math.max(
    0,
    Math.min(24, Number.isFinite(tabGapRaw) ? tabGapRaw : 8)
  );
  const marginTop = Math.max(0, Math.min(80, Number(data?.tabsMarginTop) || 8));
  const marginBottom = Math.max(0, Math.min(80, Number(data?.tabsMarginBottom) || 8));
  const labelFontSize = Math.max(
    10,
    Math.min(22, Number(data?.tabsLabelFontSize) || 13)
  );
  const rawTabsLabelOp = Number(data?.tabsLabelColorOpacity);
  const tabsLabelColorOpacity = Number.isFinite(rawTabsLabelOp)
    ? Math.min(255, Math.max(0, rawTabsLabelOp))
    : 255;
  const rawIconOp = Number(data?.tabsActiveIconColorOpacity);
  const tabsActiveIconColorOpacityValue = Number.isFinite(rawIconOp)
    ? Math.min(255, Math.max(0, rawIconOp))
    : 255;
  const rawTabBgOp = Number(data?.tabsActiveTabColorOpacity);
  const tabsActiveTabColorOpacityValue = Number.isFinite(rawTabBgOp)
    ? Math.min(255, Math.max(0, rawTabBgOp))
    : 255;

  const rawInactiveLabelOp = Number(data?.tabsInactiveLabelColorOpacity);
  const tabsInactiveLabelOpacityValue = Number.isFinite(rawInactiveLabelOp)
    ? Math.min(255, Math.max(0, rawInactiveLabelOp))
    : 255;
  const rawInactiveIconOp = Number(data?.tabsInactiveIconColorOpacity);
  const tabsInactiveIconColorOpacityValue = Number.isFinite(rawInactiveIconOp)
    ? Math.min(255, Math.max(0, rawInactiveIconOp))
    : 255;
  const rawInactiveTabOp = Number(data?.tabsInactiveTabColorOpacity);
  const tabsInactiveTabColorOpacityValue = Number.isFinite(rawInactiveTabOp)
    ? Math.min(255, Math.max(0, rawInactiveTabOp))
    : 255;

  const activeColorMode = activeColorModesForUi.some((m) => m.value === data?.tabsActiveColorMode)
    ? data.tabsActiveColorMode
    : "text";
  const activeColorModeLabel =
    activeColorModesForUi.find((m) => m.value === activeColorMode)?.label ?? "สีข้อความ";
  const modeOpacity =
    activeColorMode === "text"
      ? tabsLabelColorOpacity
      : activeColorMode === "icon"
        ? tabsActiveIconColorOpacityValue
        : tabsActiveTabColorOpacityValue;
  const currentActiveColorValue =
    activeColorMode === "text"
      ? data?.tabsLabelColor
      : activeColorMode === "icon"
        ? data?.tabsActiveIconColor
        : data?.tabsActiveTabColor;

  const cycleActiveColorMode = (dir) => {
    const modes = activeColorModesForUi.map((m) => m.value);
    if (!modes.length) return;
    const cur = modes.includes(data?.tabsActiveColorMode) ? data.tabsActiveColorMode : "text";
    const i = Math.max(0, modes.indexOf(cur));
    patch({ tabsActiveColorMode: modes[(i + dir + modes.length) % modes.length] });
  };

  const inactiveColorModeRaw = data?.tabsInactiveColorMode;
  const inactiveColorMode =
    layoutAxis === "horizontal" && styleMode === "line" && inactiveColorModeRaw === "tab"
      ? "text"
      : inactiveColorModesForUi.some((m) => m.value === inactiveColorModeRaw)
        ? inactiveColorModeRaw
        : "text";
  const inactiveColorModeLabel =
    inactiveColorModesForUi.find((m) => m.value === inactiveColorMode)?.label ?? "สีข้อความ";
  const inactiveModeOpacity =
    inactiveColorMode === "text"
      ? tabsInactiveLabelOpacityValue
      : inactiveColorMode === "icon"
        ? tabsInactiveIconColorOpacityValue
        : tabsInactiveTabColorOpacityValue;
  const currentInactiveColorValue =
    inactiveColorMode === "text"
      ? data?.tabsInactiveLabelColor
      : inactiveColorMode === "icon"
        ? data?.tabsInactiveIconColor
        : data?.tabsInactiveTabColor;

  const cycleInactiveColorMode = (dir) => {
    const modes = inactiveColorModesForUi.map((m) => m.value);
    if (!modes.length) return;
    const raw = data?.tabsInactiveColorMode;
    const cur =
      layoutAxis === "horizontal" && styleMode === "line" && raw === "tab"
        ? "text"
        : modes.includes(raw)
          ? raw
          : "text";
    const i = Math.max(0, modes.indexOf(cur));
    patch({ tabsInactiveColorMode: modes[(i + dir + modes.length) % modes.length] });
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

  return (
    <aside className="dash-panel flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden border-r border-slate-200 dark:border-white/10">
      <div className="shrink-0 px-6 pt-5 pb-3 flex items-center justify-between dash-panel-header bg-gray-100 dark:bg-gray-900/50">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 font-bold tracking-wide">
            Tabs
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
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-white/70"
          onClick={() => close(null, null, null)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <path fillRule="evenodd" d="M15.78 4.22a.75.75 0 010 1.06L10.06 11l5.72 5.72a.75.75 0 11-1.06 1.06l-6.25-6.25a.75.75 0 010-1.06l6.25-6.25a.75.75 0 011.06 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain px-4 pb-14 scroll-pb-10 w-full">
        <ul className="mt-4 pl-1 space-y-5">
          <li>
            <div className="mb-[13px] mt-1 flex items-center gap-2">
              <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                ตำแหน่งการจัดวาง
              </span>
              <div className="dash-heading-rule min-w-0 flex-1 border-b" />
            </div>
            <ButtonGroup
              fullWidth
              variant="outlined"
              disableElevation
              color="inherit"
              aria-label="ตำแหน่งการจัดวาง"
              sx={sectionLayoutGroupRootSx}
            >
              {TABS_LAYOUT_AXIS_OPTIONS.map((opt) => {
                const selected = layoutAxis === opt.value;
                return (
                  <Button
                    key={opt.value}
                    color="inherit"
                    onClick={() => patch({ tabsLayoutAxis: opt.value })}
                    sx={{
                      ...sectionLayoutGroupButtonSx(selected, textColor),
                      fontWeight: 400,
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "5px",
                        fontWeight: 400,
                      }}
                    >
                      {opt.label}
                    </Box>
                  </Button>
                );
              })}
            </ButtonGroup>
          </li>

          <li>
            <div className="mb-[13px] mt-1 flex items-center gap-2">
              <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                ประเภท
              </span>
              <div className="dash-heading-rule min-w-0 flex-1 border-b" />
            </div>
            <ButtonGroup
              fullWidth
              variant="outlined"
              disableElevation
              color="inherit"
              aria-label="ประเภทหัวแท็บ"
              sx={sectionLayoutGroupRootSx}
            >
              {TABS_HEADER_LABEL_OPTIONS.map((opt) => {
                const selected = tabsTabLabelStyle === opt.value;
                return (
                  <Button
                    key={opt.value}
                    color="inherit"
                    onClick={() => patch({ tabsTabLabelStyle: opt.value })}
                    sx={{
                      ...sectionLayoutGroupButtonSx(selected, textColor),
                      fontWeight: 400,
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "5px",
                        fontWeight: 400,
                      }}
                    >
                      {opt.label}
                    </Box>
                  </Button>
                );
              })}
            </ButtonGroup>
          </li>

          <li>
            <div className="grid grid-cols-2 gap-x-3">
              <div className="min-w-0">
                <div className="mb-2 mt-1 flex items-center gap-1.5">
                  <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                    ขนาดตัวอักษร
                  </span>
                  <span className="shrink-0 text-[12px] font-medium tabular-nums text-slate-500 dark:text-slate-400">
                    {labelFontSize}
                  </span>
                  <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                </div>
                <div className="px-0.5">
                  <Range
                    min={10}
                    max={22}
                    step={1}
                    value={labelFontSize}
                    handleChange={(e) =>
                      updateRangeField(
                        "tabsLabelFontSize",
                        Number(e.target.value) || 13
                      )
                    }
                    onCommit={commitRangeField}
                    pos={((labelFontSize - 10) / 12) * 100}
                    color={textColor}
                  />
                </div>
              </div>
              <div className="min-w-0">
                <div className="mb-2 mt-1 flex items-center gap-1.5">
                  <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                    ช่องระหว่างแท็บ
                  </span>
                  <span className="shrink-0 text-[12px] font-medium tabular-nums text-slate-500 dark:text-slate-400">
                    {tabGap}
                  </span>
                  <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                </div>
                <div className="px-0.5">
                  <Range
                    min={0}
                    max={24}
                    step={1}
                    value={tabGap}
                    handleChange={(e) => {
                      const n = Number(e.target.value);
                      updateRangeField(
                        "tabsGap",
                        Number.isFinite(n) ? n : 0
                      );
                    }}
                    onCommit={commitRangeField}
                    pos={(tabGap / 24) * 100}
                    color={textColor}
                  />
                </div>
              </div>
            </div>
          </li>

          <li>
            <div className="mb-2 mt-1 flex items-center gap-2">
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
              aria-label="รูปแบบ"
              sx={sectionLayoutGroupRootSx}
            >
              {TABS_STYLE_OPTIONS.map((opt) => {
                const selected = styleMode === opt.value;
                return (
                  <Button
                    key={opt.value}
                    color="inherit"
                    onClick={() => {
                      if (opt.value === "pill") {
                        patch({
                          tabsStyle: "pill",
                          tabsLabelColor: "#ffffff",
                          tabsLabelColorOpacity: 255,
                          tabsInactiveLabelColor: "#ffffff",
                          tabsInactiveLabelColorOpacity: 255,
                          tabsActiveIconColor: "#ffffff",
                          tabsActiveIconColorOpacity: 255,
                          tabsInactiveIconColor: "#ffffff",
                          tabsInactiveIconColorOpacity: 255,
                        });
                      } else if (opt.value === "classic") {
                        patch({
                          tabsStyle: "classic",
                          tabsLabelColor: { type: "mainColor", index: 0 },
                          tabsLabelColorOpacity: 255,
                          tabsActiveIconColor: { type: "mainColor", index: 0 },
                          tabsActiveIconColorOpacity: 255,
                          tabsInactiveLabelColor: "#d8d8d8",
                          tabsInactiveLabelColorOpacity: 255,
                          tabsInactiveIconColor: "#d8d8d8",
                          tabsInactiveIconColorOpacity: 255,
                        });
                      } else if (opt.value === "line") {
                        patch({
                          tabsStyle: "line",
                          tabsActiveColorMode: "tab",
                          tabsInactiveColorMode:
                            layoutAxis !== "vertical" ? "text" : "tab",
                          tabsActiveTabColor: { type: "mainColor", index: 0 },
                          tabsActiveTabColorOpacity: 255,
                          tabsInactiveTabColor: "#d8d8d8",
                          tabsInactiveTabColorOpacity: 255,
                          tabsLabelColor: { type: "mainColor", index: 0 },
                          tabsLabelColorOpacity: 255,
                          tabsInactiveLabelColor: "#d8d8d8",
                          tabsInactiveLabelColorOpacity: 255,
                          tabsActiveIconColor: { type: "mainColor", index: 0 },
                          tabsActiveIconColorOpacity: 255,
                          tabsInactiveIconColor: "#d8d8d8",
                          tabsInactiveIconColorOpacity: 255,
                        });
                      } else if (opt.value === "button") {
                        patch({
                          tabsStyle: "button",
                          tabsActiveColorMode: "tab",
                          tabsInactiveColorMode: "tab",
                          tabsActiveTabColor: { type: "mainColor", index: 0 },
                          tabsActiveTabColorOpacity: 255,
                          tabsInactiveTabColor: "#d8d8d8",
                          tabsInactiveTabColorOpacity: 255,
                          tabsLabelColor: "#ffffff",
                          tabsLabelColorOpacity: 255,
                          tabsInactiveLabelColor: "#ffffff",
                          tabsInactiveLabelColorOpacity: 255,
                          tabsActiveIconColor: "#ffffff",
                          tabsActiveIconColorOpacity: 255,
                          tabsInactiveIconColor: "#ffffff",
                          tabsInactiveIconColorOpacity: 255,
                        });
                      } else {
                        const next = { tabsStyle: opt.value };
                        if (tabsTabLabelStyle !== "iconText") {
                          if (data?.tabsActiveColorMode === "icon") {
                            next.tabsActiveColorMode = "text";
                          }
                          if (data?.tabsInactiveColorMode === "icon") {
                            next.tabsInactiveColorMode = "text";
                          }
                        }
                        /* เส้นใต้ / แคปซูล: โฟกัสสีแท็บ (เส้น/พื้น) ไม่ให้ค้างโหมดสีข้อความหลังคลาสสิค */
                        if (opt.value === "line") {
                          next.tabsActiveColorMode = "tab";
                          next.tabsInactiveColorMode =
                            layoutAxis !== "vertical" ? "text" : "tab";
                        }
                        patch(next);
                      }
                    }}
                    sx={{
                      ...sectionLayoutGroupButtonSx(selected, textColor),
                      fontWeight: 400,
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "5px",
                        fontWeight: 400,
                      }}
                    >
                      {opt.label}
                    </Box>
                  </Button>
                );
              })}
            </ButtonGroup>
          </li>

          <li>
            <Box sx={{ width: "100%", px: 0.25 }}>
              <div className="mb-[13px] flex items-center gap-2">
                <MainLabel label="แท็บที่ทำงานอยู่" mb={0} />
              </div>
              <TabsActiveColorSelectLine
                prev={() => cycleActiveColorMode(-1)}
                next={() => cycleActiveColorMode(1)}
                prevAria="โหมดสีก่อนหน้า"
                nextAria="โหมดสีถัดไป"
                groupAria={
                  tabsTabLabelStyle === "iconText"
                    ? "สลับแก้สีข้อความ สีไอคอน หรือสีแท็บของแท็บที่ทำงานอยู่"
                    : "สลับแก้สีข้อความหรือสีแท็บของแท็บที่ทำงานอยู่"
                }
                value={activeColorModeLabel}
              />
              <div className="mt-2 dash-card w-full rounded-md bg-white px-[0px] pb-[5px] pt-[2px] dark:bg-zinc-800">
                <div className="px-[5px] pb-2">
                  <Range
                    min={0}
                    max={255}
                    step={1}
                    value={modeOpacity}
                    handleChange={(e) => {
                      const n = Number(e.target.value);
                      const v = Number.isFinite(n) ? Math.min(255, Math.max(0, n)) : 255;
                      if (activeColorMode === "text") {
                        updateRangeField("tabsLabelColorOpacity", v);
                      } else if (activeColorMode === "icon") {
                        updateRangeField("tabsActiveIconColorOpacity", v);
                      } else {
                        updateRangeField("tabsActiveTabColorOpacity", v);
                      }
                    }}
                    onCommit={commitRangeField}
                    pos={(modeOpacity / 255) * 100}
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
                    const selected = chipSelected(currentActiveColorValue, color);
                    return (
                      <div key={i} className="">
                        <button
                          type="button"
                          className="flex size-[25px] items-center justify-center rounded-full border border-slate-200 dark:border-white/15"
                          style={{ backgroundColor: bgColor }}
                          onClick={() => {
                            if (activeColorMode === "text") {
                              patch({ tabsLabelColor: color });
                            } else if (activeColorMode === "icon") {
                              patch({ tabsActiveIconColor: color });
                            } else {
                              patch({ tabsActiveTabColor: color });
                            }
                          }}
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
            <Box sx={{ width: "100%", px: 0.25 }}>
              <div className="mb-[13px] flex items-center gap-2">
                <MainLabel label="แท็บที่ไม่ทำงาน" mb={0} />
              </div>
              <TabsActiveColorSelectLine
                prev={() => cycleInactiveColorMode(-1)}
                next={() => cycleInactiveColorMode(1)}
                prevAria="โหมดสีก่อนหน้า (แท็บที่ไม่ทำงาน)"
                nextAria="โหมดสีถัดไป (แท็บที่ไม่ทำงาน)"
                groupAria={
                  tabsTabLabelStyle === "iconText"
                    ? "สลับแก้สีข้อความ สีไอคอน หรือสีแท็บของแท็บที่ไม่ทำงาน"
                    : "สลับแก้สีข้อความหรือสีแท็บของแท็บที่ไม่ทำงาน"
                }
                value={inactiveColorModeLabel}
              />
              <div className="mt-2 dash-card w-full rounded-md bg-white px-[0px] pb-[5px] pt-[2px] dark:bg-zinc-800">
                <div className="px-[5px] pb-2">
                  <Range
                    min={0}
                    max={255}
                    step={1}
                    value={inactiveModeOpacity}
                    handleChange={(e) => {
                      const n = Number(e.target.value);
                      const v = Number.isFinite(n) ? Math.min(255, Math.max(0, n)) : 255;
                      if (inactiveColorMode === "text") {
                        updateRangeField("tabsInactiveLabelColorOpacity", v);
                      } else if (inactiveColorMode === "icon") {
                        updateRangeField("tabsInactiveIconColorOpacity", v);
                      } else {
                        updateRangeField("tabsInactiveTabColorOpacity", v);
                      }
                    }}
                    onCommit={commitRangeField}
                    pos={(inactiveModeOpacity / 255) * 100}
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
                    const selected = chipSelected(currentInactiveColorValue, color);
                    return (
                      <div key={`in-${i}`} className="">
                        <button
                          type="button"
                          className="flex size-[25px] items-center justify-center rounded-full border border-slate-200 dark:border-white/15"
                          style={{ backgroundColor: bgColor }}
                          onClick={() => {
                            if (inactiveColorMode === "text") {
                              patch({ tabsInactiveLabelColor: color });
                            } else if (inactiveColorMode === "icon") {
                              patch({ tabsInactiveIconColor: color });
                            } else {
                              patch({ tabsInactiveTabColor: color });
                            }
                          }}
                          aria-label={`เลือกสีแท็บที่ไม่ทำงาน ${bgColor}`}
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
            <div className="mb-[13px] mt-1 flex items-center gap-2">
              <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                จัดแนวแท็บ
              </span>
              <div className="dash-heading-rule min-w-0 flex-1 border-b" />
            </div>
            <ButtonGroup
              fullWidth
              variant="outlined"
              disableElevation
              color="inherit"
              aria-label="จัดแนวแท็บ"
              sx={sectionLayoutGroupRootSx}
            >
              {TABS_ALIGN_OPTIONS.map((opt) => {
                const selected = align === opt.value;
                return (
                  <Button
                    key={opt.value}
                    color="inherit"
                    onClick={() => patch({ tabsAlign: opt.value })}
                    sx={{
                      ...sectionLayoutGroupButtonSx(selected, textColor),
                      fontWeight: 400,
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "5px",
                        fontWeight: 400,
                      }}
                    >
                      {opt.label}
                    </Box>
                  </Button>
                );
              })}
            </ButtonGroup>
          </li>

          <li>
            <div className="grid w-full grid-cols-2 gap-x-3 gap-y-4 px-0.5">
              <div className="min-w-0">
                <div className="mb-2 mt-1 flex items-center gap-1.5">
                  <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                    ระยะด้านบน
                  </span>
                  <span className="shrink-0 text-[12px] font-medium tabular-nums text-slate-500 dark:text-slate-400">
                    {marginTop}
                  </span>
                  <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                </div>
                <div className="px-0.5">
                  <Range
                    min={0}
                    max={80}
                    step={1}
                    value={marginTop}
                    handleChange={(e) =>
                      updateRangeField(
                        "tabsMarginTop",
                        Number(e.target.value) || 0
                      )
                    }
                    onCommit={commitRangeField}
                    pos={(marginTop / 80) * 100}
                    color={textColor}
                  />
                </div>
              </div>
              <div className="min-w-0">
                <div className="mb-2 mt-1 flex items-center gap-1.5">
                  <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                    ระยะด้านล่าง
                  </span>
                  <span className="shrink-0 text-[12px] font-medium tabular-nums text-slate-500 dark:text-slate-400">
                    {marginBottom}
                  </span>
                  <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                </div>
                <div className="px-0.5">
                  <Range
                    min={0}
                    max={80}
                    step={1}
                    value={marginBottom}
                    handleChange={(e) =>
                      updateRangeField(
                        "tabsMarginBottom",
                        Number(e.target.value) || 0
                      )
                    }
                    onCommit={commitRangeField}
                    pos={(marginBottom / 80) * 100}
                    color={textColor}
                  />
                </div>
              </div>
            </div>

            <Box sx={{ pb: 4 }}>
              <div className="mb-3 mt-4 flex items-center gap-2">
                <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                  รายการทั้งหมด
                </span>
                <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                <button
                  type="button"
                  disabled={tabsItems.length >= TABS_ITEM_LIST_MAX}
                  title={
                    tabsItems.length >= TABS_ITEM_LIST_MAX
                      ? "ถึงจำนวนสูงสุดแล้ว (12)"
                      : "เพิ่มแท็บ"
                  }
                  className="inline-flex min-h-[26px] shrink-0 items-center justify-center rounded-md px-2 py-1 text-[12px] font-medium leading-snug text-white transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#333333] disabled:pointer-events-none disabled:opacity-35"
                  style={{ backgroundColor: "#333333" }}
                  onClick={addTab}
                >
                  เพิ่มแท็บ
                </button>
              </div>
              <Stack spacing={1}>
                {tabsItems.map((tab, idx) => {
                  const isCanvasActiveTab = tab.id === resolvedActiveTabId;
                  return (
                    <Box
                      key={tab.id}
                      className="flex w-full min-w-0 items-center gap-2"
                    >
                      <button
                        type="button"
                        className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md border border-slate-200 bg-[#333333] text-[10px] font-semibold text-white shadow-sm transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#333333]/40 dark:border-white/15"
                        title={
                          isCanvasActiveTab
                            ? "แท็บนี้กำลังแสดงผลบนแคนวาส"
                            : "เลือกแท็บนี้เป็นแท็บแสดงผลบนแคนวาส"
                        }
                        aria-label={
                          isCanvasActiveTab
                            ? "แท็บที่เลือกแสดงผลอยู่"
                            : "เลือกแท็บนี้เป็นแท็บแสดงผล"
                        }
                        aria-pressed={isCanvasActiveTab}
                        onClick={() => patch({ tabsActiveId: tab.id })}
                      >
                        {isCanvasActiveTab ? (
                          <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                        ) : (
                          idx + 1
                        )}
                      </button>
                      <Box
                        className={`dash-input flex min-w-0 flex-1 items-center gap-2 rounded-md border border-slate-200 bg-white py-0 dark:border-white/10 dark:bg-slate-800/90 ${
                          tabsTabLabelStyle === "iconText" ? "pl-0 pr-2.5" : "px-2.5"
                        }`}
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          {tabsTabLabelStyle === "iconText" ? (
                            <button
                              type="button"
                              className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-l-md rounded-r-none border-r border-slate-200 bg-transparent text-slate-600 transition hover:opacity-80 dark:border-white/10 dark:text-slate-300"
                              aria-label="เลือกไอคอนแท็บ"
                              onClick={() => {
                                const ae = document.activeElement;
                                if (ae instanceof HTMLElement) ae.blur();
                                setIconPickerTabId(tab.id);
                              }}
                            >
                              {(() => {
                                const fa = normalizeTabFaIcon(tab.faIcon);
                                return fa.name && fa.type ? (
                                  <IconAwsome
                                    iconName={fa.name}
                                    iconType={fa.type}
                                    style={{ fontSize: 14 }}
                                  />
                                ) : (
                                  <Sparkles className="size-3.5 shrink-0" strokeWidth={2} />
                                );
                              })()}
                            </button>
                          ) : null}
                          <Field
                            value={typeof tab?.label === "string" ? tab.label : ""}
                            handleChange={(e) => {
                              const nextLabel = e.target.value;
                              patchTabsItems((current) =>
                                current.map((t) =>
                                  t.id === tab.id ? { ...t, label: nextLabel } : t
                                )
                              );
                            }}
                            placeholder={`รายการ ${idx + 1}`}
                            id={`tab-label-${tab.id}`}
                            type="text"
                            className="min-w-0 h-8 max-h-8 w-full flex-1 border-0 bg-transparent px-1.5 py-0 text-[12px] leading-tight text-slate-800 shadow-none outline-none ring-0 placeholder:text-slate-400 focus:border-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 dark:text-white/90 dark:placeholder:text-white/35"
                          />
                        </div>
                      </Box>
                      <button
                        type="button"
                        disabled={tabsItems.length <= 1}
                        title={
                          tabsItems.length <= 1
                            ? "ต้องมีอย่างน้อย 1 แท็บ"
                            : "ลบแท็บนี้"
                        }
                        aria-label="ลบแท็บ"
                        className="inline-flex dash-input h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-red-500/40 disabled:pointer-events-none disabled:opacity-35 dark:border-white/10 dark:bg-slate-900/90 dark:text-slate-400 dark:hover:border-red-500/40 dark:hover:bg-red-950/45 dark:hover:text-red-400"
                        onClick={() => removeTab(tab.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                      </button>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          </li>
        </ul>
      </nav>

      <ServiceIcon
        header="เลือกไอคอน"
        icon={normalizeTabFaIcon(tabsItems.find((t) => t.id === iconPickerTabId)?.faIcon)}
        open={Boolean(iconPickerTabId)}
        onClose={() => setIconPickerTabId(null)}
        handleChange={(ic) => {
          if (!iconPickerTabId) return;
          patchTabsItems((current) =>
            current.map((t) =>
              t.id === iconPickerTabId ? { ...t, faIcon: ic } : t
            )
          );
        }}
        darkColor={textColor || "#0d9488"}
        darkMode={darkMode}
      />
    </aside>
  );
};

export default TabsElementOffcanvas;
