import { useMemo, useCallback, Fragment, memo } from "react";
import { Sparkles } from "lucide-react";
import { setColor, setFont } from "../../../../function";
import IconAwsome from "../../IconAwsome";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { usePanelPreview } from "../../panelPreviewStore";

const TABS_DEFAULTS = {
  tabsAlign: "start",
  tabsLayoutAxis: "horizontal",
  tabsStyle: "line",
  tabsGap: 8,
  tabsMarginTop: 8,
  tabsMarginBottom: 8,
  tabsItemPaddingX: 14,
  tabsItemPaddingY: 10,
  tabsItemRadius: 8,
  tabsLabelFontSize: 13,
};

const FA_PREFIXES = new Set(["fas", "fab", "far"]);

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

const TabsNestedElementList = memo(function TabsNestedElementList({
  elements,
  activeId,
  builderMode,
  tabSelectedElId,
  ghost,
  sensors,
  onDragEnd,
  renderTabElement,
  onTabElementEdit,
  onTabElementSelect,
}) {
  const hasElements = Array.isArray(elements) && elements.length > 0;
  const sortableIds = useMemo(
    () => (elements || []).map((el) => String(el?.id || "")),
    [elements]
  );

  if (!hasElements) {
    return (
      <div className="flex h-full min-h-[44px] flex-col items-center justify-center gap-1 text-center">
        {ghost ? (
          ghost.ghostEl
        ) : (
          <span className="font-sans text-[11px] text-slate-400 dark:text-slate-500">
            ลาก Element มาวางที่นี่
          </span>
        )}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-0">
          {elements.map((el, i) => (
            <Fragment key={String(el?.id || `tab-el-${i}`)}>
              {ghost && !ghost.isLast && ghost.insertAt === i && ghost.ghostEl}
              <SortableTabItem
                id={String(el?.id || `tab-el-${i}`)}
                builderMode={builderMode}
                onClick={(e) => {
                  if (builderMode !== "Layout Mode") return;
                  e.preventDefault();
                  e.stopPropagation();
                  if (e.detail === 2) {
                    onTabElementEdit?.(el, String(activeId || ""));
                    return;
                  }
                  if (tabSelectedElId === el?.id) {
                    onTabElementSelect?.(null, String(activeId || ""));
                  } else {
                    onTabElementSelect?.(el, String(activeId || ""));
                  }
                }}
              >
                <div
                  data-tabs-nested-edit-id={String(el?.id || "")}
                  data-tab-nested-id={String(el?.id || "")}
                  className=""
                >
                  {(() => {
                    const nestedRenderEl =
                      el?.type === "txt"
                        ? { ...el, __tabsNestedCompactText: true }
                        : el;
                    return typeof renderTabElement === "function" ? (
                      renderTabElement(nestedRenderEl, i, String(activeId || ""))
                    ) : (
                      <div className="rounded-md border border-slate-200 bg-white px-2.5 py-2 text-left text-[12px] text-slate-700 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200">
                        <span className="font-semibold">
                          {String(el?.type || "element").toUpperCase()}
                        </span>
                        <span className="mx-1 text-slate-400">-</span>
                        <span>{String(el?.id || "no-id")}</span>
                      </div>
                    );
                  })()}
                </div>
                {builderMode === "Layout Mode" && tabSelectedElId === el?.id && (
                  <div className="pointer-events-none absolute -inset-x-3 inset-y-0 rounded border border-dashed border-red-400 bg-red-300/10" />
                )}
              </SortableTabItem>
              {ghost &&
                ghost.isLast &&
                i === elements.length - 1 &&
                ghost.ghostEl}
            </Fragment>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
});

/** Sortable wrapper for a single element inside a tab */
const SortableTabItem = ({ id, builderMode, children, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled: builderMode !== "Layout Mode",
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform
          ? `translate3d(${Math.round(transform.x)}px, ${Math.round(transform.y)}px, 0)`
          : undefined,
        transition: isDragging ? undefined : transition,
        opacity: 1,
        zIndex: isDragging ? 10 : undefined,
      }}
      className={`relative w-full ${
        builderMode === "Layout Mode" ? (isDragging ? "cursor-grabbing" : "cursor-grab") : ""
      }`}
      {...(builderMode === "Layout Mode" ? { ...attributes, ...listeners } : {})}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

const Tabs = ({
  elementData: rawElementData,
  selected,
  animationForElement,
  builderMode,
  onTabElementEdit,
  renderTabElement,
  onTabElementSelect,
  onTabElementsReorder,
  tabGhostData,
  tabSelectedElId,
  onUpdate,
  theme,
}) => {
  const panelPreview = usePanelPreview("tabs", rawElementData?.id);
  const elementData = panelPreview
    ? {
        ...rawElementData,
        ...panelPreview,
        tabsItems: rawElementData?.tabsItems ?? panelPreview.tabsItems,
      }
    : rawElementData;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const items = normalizeTabsItems(elementData?.tabsItems);
  const activeIdRaw = elementData?.tabsActiveId;
  const activeId =
    items.some((t) => t.id === activeIdRaw) ? activeIdRaw : items[0]?.id;
  const committedItems = useMemo(
    () => normalizeTabsItems(rawElementData?.tabsItems),
    [rawElementData?.tabsItems]
  );
  const committedActiveId = committedItems.some((t) => t.id === activeId)
    ? activeId
    : committedItems[0]?.id;
  const committedElements = useMemo(() => {
    const tab =
      committedItems.find((t) => t.id === committedActiveId) || committedItems[0];
    return Array.isArray(tab?.elements) ? tab.elements : [];
  }, [committedActiveId, committedItems]);

  const align =
    elementData?.tabsAlign === "center"
      ? "justify-center"
      : elementData?.tabsAlign === "end"
        ? "justify-end"
        : "justify-start";
  const isVertical = elementData?.tabsLayoutAxis === "vertical";
  const tabBarEdgeInset =
    elementData?.tabsAlign === "center"
      ? ""
      : isVertical
        ? elementData?.tabsAlign === "end"
          ? "pb-3 sm:pb-4"
          : "pt-3 sm:pt-4"
        : elementData?.tabsAlign === "end"
          ? "pr-3 sm:pr-4"
          : "pl-3 sm:pl-4";
  const rawTabsStyle = elementData?.tabsStyle;
  const styleMode =
    rawTabsStyle === "pill"
      ? "pill"
      : rawTabsStyle === "button"
        ? "button"
        : rawTabsStyle === "classic"
          ? "classic"
          : "line";
  const tabsTabLabelStyle =
    elementData?.tabsTabLabelStyle === "iconText" ? "iconText" : "text";
  const gapRaw = Number(elementData?.tabsGap);
  const gap = Math.max(
    0,
    Math.min(
      24,
      Number.isFinite(gapRaw) ? gapRaw : TABS_DEFAULTS.tabsGap
    )
  );
  const padX = Math.max(
    6,
    Math.min(28, Number(elementData?.tabsItemPaddingX) || TABS_DEFAULTS.tabsItemPaddingX)
  );
  const padY = Math.max(
    6,
    Math.min(18, Number(elementData?.tabsItemPaddingY) || TABS_DEFAULTS.tabsItemPaddingY)
  );
  const radius = Math.max(
    0,
    Math.min(20, Number(elementData?.tabsItemRadius) || TABS_DEFAULTS.tabsItemRadius)
  );
  const marginTop = Math.max(
    0,
    Math.min(80, Number(elementData?.tabsMarginTop) || TABS_DEFAULTS.tabsMarginTop)
  );
  const marginBottom = Math.max(
    0,
    Math.min(80, Number(elementData?.tabsMarginBottom) || TABS_DEFAULTS.tabsMarginBottom)
  );
  const textFontFamily = setFont(theme?.text?.value);
  const labelFontSize = Math.max(
    10,
    Math.min(
      22,
      Number(elementData?.tabsLabelFontSize) || TABS_DEFAULTS.tabsLabelFontSize
    )
  );
  const tabHeaderIconPx = Math.round((labelFontSize * 14) / 13);

  const tabsLabelColorResolved = useMemo(() => {
    const c = elementData?.tabsLabelColor;
    if (c == null || !theme) return null;
    if (typeof c === "object" && c.type != null) {
      const row = theme[c.type];
      if (!Array.isArray(row) || row[c.index] == null) return null;
    }
    const opRaw = Number(elementData?.tabsLabelColorOpacity);
    const op = Number.isFinite(opRaw) ? Math.min(255, Math.max(0, opRaw)) : 255;
    try {
      return setColor(theme, c, op);
    } catch {
      return null;
    }
  }, [theme, elementData?.tabsLabelColor, elementData?.tabsLabelColorOpacity]);

  const tabsActiveIconColorResolved = useMemo(() => {
    if (!theme) return null;
    const opRaw = Number(elementData?.tabsActiveIconColorOpacity);
    const op = Number.isFinite(opRaw) ? Math.min(255, Math.max(0, opRaw)) : 255;
    const c = elementData?.tabsActiveIconColor;
    if (c != null) {
      if (typeof c === "object" && c.type != null) {
        const row = theme[c.type];
        if (Array.isArray(row) && row[c.index] != null) {
          try {
            return setColor(theme, c, op);
          } catch {
            /* fall through */
          }
        }
      } else if (typeof c === "string") {
        try {
          return setColor(theme, c, op);
        } catch {
          /* fall through */
        }
      }
    }
    if (
      tabsTabLabelStyle === "iconText" &&
      Array.isArray(theme.mainColor) &&
      theme.mainColor[0] != null
    ) {
      try {
        return setColor(theme, { type: "mainColor", index: 0 }, op);
      } catch {
        return null;
      }
    }
    return null;
  }, [
    theme,
    elementData?.tabsActiveIconColor,
    elementData?.tabsActiveIconColorOpacity,
    tabsTabLabelStyle,
  ]);

  const tabsActiveTabColorResolved = useMemo(() => {
    const c = elementData?.tabsActiveTabColor;
    if (c == null || !theme) return null;
    if (typeof c === "object" && c.type != null) {
      const row = theme[c.type];
      if (!Array.isArray(row) || row[c.index] == null) return null;
    }
    const opRaw = Number(elementData?.tabsActiveTabColorOpacity);
    const op = Number.isFinite(opRaw) ? Math.min(255, Math.max(0, opRaw)) : 255;
    try {
      return setColor(theme, c, op);
    } catch {
      return null;
    }
  }, [theme, elementData?.tabsActiveTabColor, elementData?.tabsActiveTabColorOpacity]);

  const tabsInactiveLabelColorResolved = useMemo(() => {
    const c = elementData?.tabsInactiveLabelColor;
    if (c == null || !theme) return null;
    if (typeof c === "object" && c.type != null) {
      const row = theme[c.type];
      if (!Array.isArray(row) || row[c.index] == null) return null;
    }
    const opRaw = Number(elementData?.tabsInactiveLabelColorOpacity);
    const op = Number.isFinite(opRaw) ? Math.min(255, Math.max(0, opRaw)) : 255;
    try {
      return setColor(theme, c, op);
    } catch {
      return null;
    }
  }, [theme, elementData?.tabsInactiveLabelColor, elementData?.tabsInactiveLabelColorOpacity]);

  const tabsInactiveIconColorResolved = useMemo(() => {
    if (!theme) return null;
    const opRaw = Number(elementData?.tabsInactiveIconColorOpacity);
    const op = Number.isFinite(opRaw) ? Math.min(255, Math.max(0, opRaw)) : 255;
    const c = elementData?.tabsInactiveIconColor;
    if (c != null) {
      if (typeof c === "object" && c.type != null) {
        const row = theme[c.type];
        if (Array.isArray(row) && row[c.index] != null) {
          try {
            return setColor(theme, c, op);
          } catch {
            /* fall through */
          }
        }
      } else if (typeof c === "string") {
        try {
          return setColor(theme, c, op);
        } catch {
          /* fall through */
        }
      }
    }
    if (tabsTabLabelStyle === "iconText" && tabsInactiveLabelColorResolved) {
      return tabsInactiveLabelColorResolved;
    }
    return null;
  }, [
    theme,
    elementData?.tabsInactiveIconColor,
    elementData?.tabsInactiveIconColorOpacity,
    tabsTabLabelStyle,
    tabsInactiveLabelColorResolved,
  ]);

  const tabsInactiveTabColorResolved = useMemo(() => {
    const c = elementData?.tabsInactiveTabColor;
    if (c == null || !theme) return null;
    if (typeof c === "object" && c.type != null) {
      const row = theme[c.type];
      if (!Array.isArray(row) || row[c.index] == null) return null;
    }
    const opRaw = Number(elementData?.tabsInactiveTabColorOpacity);
    const op = Number.isFinite(opRaw) ? Math.min(255, Math.max(0, opRaw)) : 255;
    try {
      return setColor(theme, c, op);
    } catch {
      return null;
    }
  }, [theme, elementData?.tabsInactiveTabColor, elementData?.tabsInactiveTabColorOpacity]);

  /** เส้นแถบรอง: สี Tab active ผสมโปร่ง 20% — ใช้กับเส้นใต้/แถบ (pill); คลาสสิกใช้สี Tab เต็มที่ขอบล่างแถบใน style แยก */
  const tabsLineSubtleBorderColor = useMemo(() => {
    if (!tabsActiveTabColorResolved) return null;
    return `color-mix(in srgb, ${tabsActiveTabColorResolved} 20%, transparent)`;
  }, [tabsActiveTabColorResolved]);

  /** แนวตั้ง + เส้นใต้: ใช้ tabsGap เพิ่ม padding ภายในแท็บ แทนระยะระหว่างกล่องปุ่ม */
  const isVerticalLine = isVertical && styleMode === "line";
  const stripGap = isVerticalLine ? 0 : gap;
  const effPadY = isVerticalLine ? Math.min(28, padY + gap) : padY;
  const effPadX = padX;

  const hasElements =
    Array.isArray(committedElements) && committedElements.length > 0;

  const ghost =
    tabGhostData && tabGhostData.ghostEl && tabGhostData.tabId === activeId
      ? tabGhostData
      : null;
  /* true เมื่อ cursor อยู่เหนือ Tab นี้โดยเฉพาะ (ไม่กระพริบ) */
  const isThisTabHovered = !!ghost;

  const handleDragEnd = useCallback(
    (event) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const from = committedElements.findIndex(
        (e) => String(e?.id) === String(active.id)
      );
      const to = committedElements.findIndex(
        (e) => String(e?.id) === String(over.id)
      );
      if (from !== -1 && to !== -1) {
        onTabElementsReorder?.(String(committedActiveId || ""), from, to);
      }
    },
    [committedElements, committedActiveId, onTabElementsReorder]
  );

  const isClassic = styleMode === "classic";
  const showAreaGuides = builderMode === "Layout Mode";
  let tabContentSurfaceClass = "";
  if (!showAreaGuides) {
    tabContentSurfaceClass = "border border-transparent bg-transparent";
  } else if (isThisTabHovered) {
    tabContentSurfaceClass =
      "border border-dashed border-slate-300/40 bg-slate-50/40 dark:border-slate-400/40 dark:bg-white/5";
  } else if (hasElements) {
    tabContentSurfaceClass =
      "border border-dashed border-slate-300/40 bg-transparent dark:border-slate-400/40";
  } else {
    tabContentSurfaceClass =
      "border border-dashed border-slate-300/40 bg-slate-50/30 dark:border-slate-400/40 dark:bg-white/5";
  }

  const tabContentLayoutClass = (() => {
    const contentPadYClass = hasElements ? "py-0" : "py-3";
    const contentGapTopClass = hasElements ? "mt-0" : "mt-3";
    const contentMinHeightClass = hasElements ? "min-h-0" : "min-h-[60px]";
    if (isVertical) {
      if (isClassic && hasElements) {
        return `${contentGapTopClass} flex ${contentMinHeightClass} min-w-0 flex-1 flex-col px-3 ${contentPadYClass} text-[12px] transition-colors`;
      }
      return `${contentGapTopClass} flex ${contentMinHeightClass} min-w-0 flex-1 flex-col rounded-md px-3 ${contentPadYClass} text-[12px] transition-colors`;
    }
    if (isClassic && hasElements) {
      return `${contentGapTopClass} ${contentMinHeightClass} px-3 ${contentPadYClass} text-[12px] transition-colors`;
    }
    return `${contentGapTopClass} ${contentMinHeightClass} rounded-md px-3 ${contentPadYClass} text-[12px] transition-colors`;
  })();

  const tabContentClassName = `${tabContentLayoutClass} ${tabContentSurfaceClass} text-slate-500 dark:text-slate-300`;

  /** คลาสสิกแนวนอน: เส้นล่างเป็นเลเยอร์ z-[1] ทับแท็บไม่ active; แท็บ active z-[2] */
  const isClassicHorizontal = !isVertical && styleMode === "classic";

  const tabStripSubtleFromTabColor =
    (styleMode === "line" || styleMode === "pill" || styleMode === "classic") &&
    tabsLineSubtleBorderColor != null;

  const tabStripClassName = isVertical
    ? `flex min-w-[10.5rem] max-w-[14rem] shrink-0 flex-col items-stretch ${
        styleMode === "line"
          ? tabStripSubtleFromTabColor
            ? "divide-y divide-solid [&>button+button]:border-t-[color:var(--tabs-line-subtle-border)] "
            : "divide-y divide-slate-200 dark:divide-slate-600 "
          : ""
      }${tabBarEdgeInset} ${
        styleMode === "classic"
          ? "border-r border-slate-200 dark:border-slate-600"
          : styleMode === "button"
            ? ""
            : "border-r border-slate-200 dark:border-white/15"
      } ${align}`
    : `flex flex-wrap ${tabBarEdgeInset} ${
        styleMode === "classic"
          ? "items-end relative overflow-hidden border-b-0 "
          : styleMode === "button"
            ? "items-center border-b-0 "
            : `border-b ${
                tabStripSubtleFromTabColor
                  ? "border-solid "
                  : "border-slate-200 dark:border-white/15 "
              }${
                styleMode === "pill" || styleMode === "line" ? "items-end" : "items-center"
              }`
      } ${align}`;
  const useLayoutSelectionFrame = builderMode === "Layout Mode" && selected;

  return (
    <div
      className={`w-full ${animationForElement || ""} ${
        selected && !useLayoutSelectionFrame
          ? "rounded-md border border-dashed border-red-400 bg-red-300/10 p-2"
          : useLayoutSelectionFrame
            ? "relative rounded-md px-4 py-6"
            : ""
      }`}
      style={{ marginTop, marginBottom, fontFamily: textFontFamily }}
    >
      <div
        className={
          isVertical
            ? "flex w-full flex-row items-stretch gap-3"
            : "flex flex-col"
        }
      >
      {/* Tab headers */}
      <div
        className={tabStripClassName}
        style={{
          gap: stripGap,
          ...(tabStripSubtleFromTabColor
            ? {
                ...(isVertical
                  ? {
                      borderRightColor: tabsLineSubtleBorderColor,
                    }
                  : isClassicHorizontal
                    ? {}
                    : {
                        borderBottomColor: tabsLineSubtleBorderColor,
                      }),
                ...(isVertical && styleMode === "line"
                  ? { "--tabs-line-subtle-border": tabsLineSubtleBorderColor }
                  : {}),
              }
            : {}),
        }}
      >
        {items.map((tab) => {
          const active = tab.id === activeId;
          const baseClass = "inline-flex relative items-center transition-colors";
          const lineClass = isVertical
            ? active
              ? "border-r-[6px] border-r-[#333333] text-[#333333] dark:border-r-[#333333] dark:text-[#333333]"
              : "border-r-0 text-slate-500 dark:text-slate-300"
            : active
              ? "border-b-[4px] border-b-[#333333] text-[#333333] dark:border-b-[#333333] dark:text-[#333333]"
              : "border-b-[4px] border-b-transparent text-slate-500 dark:text-slate-300";
          const pillClass = active
            ? "bg-slate-800 text-white dark:bg-white dark:text-slate-900"
            : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-200";
          const buttonClass = active
            ? "border-0 rounded-full bg-slate-800 font-semibold text-white shadow-sm dark:bg-white dark:text-slate-900"
            : "border-0 rounded-full bg-slate-100 font-normal text-slate-600 shadow-none dark:bg-white/10 dark:text-slate-200";
          const classicClass = isVertical
            ? active
              ? "z-[2] border border-[#333333] bg-white font-semibold text-[#333333] dark:border-[#333333] dark:bg-slate-900 dark:text-white"
              : "z-0 border border-r-0 border-slate-200 bg-white font-normal text-slate-500 dark:border-slate-600 dark:border-r-0 dark:bg-slate-900 dark:text-slate-400"
            : active
              ? "z-[2] -mb-px overflow-hidden border border-[#333333] border-b-0 bg-white font-semibold text-[#333333] dark:border-[#333333] dark:border-b-0 dark:bg-slate-900 dark:text-white"
              : "z-0 -mb-px overflow-hidden border border-slate-200 border-b-0 bg-white font-normal text-slate-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-400";
          const tabLookClass =
            styleMode === "pill"
              ? pillClass
              : styleMode === "button"
                ? buttonClass
                : styleMode === "classic"
                  ? classicClass
                  : lineClass;
          return (
            <div
              key={tab.id}
              data-tabs-part="tab-header"
              data-tabs-tab-id={tab.id}
            >
            <button
              type="button"
              className={`${baseClass} ${tabLookClass} ${
                tabsTabLabelStyle === "iconText" ? "gap-1.5" : ""
              } ${isVertical ? "w-full justify-start" : ""}`}
              onMouseDown={(e) => {
                // กันการลาก/เลือก element host ตอนคลิกสลับแท็บ
                if (builderMode === "Layout Mode" || builderMode === "Editor Mode") {
                  e.stopPropagation();
                }
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (tab.disabled) return;
                if (String(tab.id) === String(activeId)) return;
                onUpdate?.({
                  ...elementData,
                  tabsActiveId: tab.id,
                });
              }}
              style={{
                fontSize: labelFontSize,
                paddingLeft: effPadX,
                paddingRight: effPadX,
                paddingTop: effPadY,
                paddingBottom: effPadY,
                ...(styleMode === "pill"
                  ? isVertical
                    ? {
                        borderRadius: 0,
                        borderTopLeftRadius: radius,
                        borderBottomLeftRadius: radius,
                      }
                    : {
                        borderRadius: 0,
                        borderTopLeftRadius: radius,
                        borderTopRightRadius: radius,
                      }
                  : styleMode === "button"
                    ? {
                        /* แคปซูล: ปลายมนเต็ม (ไม่ผูกกับ tabsItemRadius) */
                        borderRadius: "9999px",
                        border: "none",
                        borderWidth: 0,
                      }
                    : styleMode === "classic"
                      ? isVertical
                        ? {
                            borderRadius: 0,
                            borderTopLeftRadius: radius,
                            borderBottomLeftRadius: radius,
                          }
                        : {
                            borderRadius: 0,
                            borderTopLeftRadius: radius,
                            borderTopRightRadius: radius,
                          }
                      : { borderRadius: 0 }),
                ...(styleMode === "classic" && isVertical && active && !tabsActiveTabColorResolved
                  ? {
                      borderRightWidth: 6,
                      borderRightStyle: "solid",
                      borderRightColor: "#333333",
                    }
                  : {}),
                ...(active && tabsActiveTabColorResolved
                  ? styleMode === "line"
                    ? isVertical
                      ? { borderRightColor: tabsActiveTabColorResolved }
                      : { borderBottomColor: tabsActiveTabColorResolved }
                    : styleMode === "classic"
                      ? isVertical
                        ? {
                            borderColor: tabsActiveTabColorResolved,
                            borderRightWidth: 6,
                            borderRightStyle: "solid",
                            borderRightColor: tabsActiveTabColorResolved,
                          }
                        : { borderColor: tabsActiveTabColorResolved }
                      : styleMode === "button"
                        ? { backgroundColor: tabsActiveTabColorResolved }
                        : { backgroundColor: tabsActiveTabColorResolved }
                  : {}),
                ...(styleMode === "classic" && !active && !isVertical && tabsInactiveTabColorResolved
                  ? {
                      borderColor: tabsInactiveTabColorResolved,
                      borderBottomWidth: 0,
                      borderBottomStyle: "none",
                    }
                  : {}),
                ...(styleMode === "classic" && !active && isVertical && tabsInactiveTabColorResolved
                  ? { borderColor: tabsInactiveTabColorResolved }
                  : {}),
                ...(!active &&
                (styleMode === "pill" || styleMode === "button") &&
                tabsInactiveTabColorResolved
                  ? { backgroundColor: tabsInactiveTabColorResolved }
                  : {}),
                opacity: tab.disabled ? 0.45 : 1,
              }}
            >
              {tabsTabLabelStyle === "iconText" && (() => {
                const fa = normalizeTabFaIcon(tab.faIcon);
                const iconColorStyle =
                  active && tabsActiveIconColorResolved
                    ? { color: tabsActiveIconColorResolved }
                    : !active && tabsInactiveIconColorResolved
                      ? { color: tabsInactiveIconColorResolved }
                      : undefined;
                return fa.name && fa.type ? (
                  <IconAwsome
                    iconName={fa.name}
                    iconType={fa.type}
                    style={{
                      fontSize: tabHeaderIconPx,
                      opacity: 0.85,
                      ...iconColorStyle,
                    }}
                  />
                ) : (
                  <Sparkles
                    className="shrink-0 opacity-85"
                    size={tabHeaderIconPx}
                    strokeWidth={2}
                    aria-hidden
                    style={iconColorStyle}
                  />
                );
              })()}
              <span
                data-tabs-tab-name-trigger="true"
                className="min-w-0 cursor-pointer truncate"
                style={
                  active && tabsLabelColorResolved
                    ? { color: tabsLabelColorResolved }
                    : !active && tabsInactiveLabelColorResolved
                      ? { color: tabsInactiveLabelColorResolved }
                      : undefined
                }
              >
                {tab.label}
              </span>
            </button>
            </div>
          );
        })}
        {isClassicHorizontal ? (
          <div
            aria-hidden
            className={`pointer-events-none absolute bottom-0 left-0 right-0 z-[1] w-full border-b border-solid shadow-[0_1px_0_0_rgb(255_255_255)] dark:shadow-[0_1px_0_0_rgb(15_23_42)] ${
              tabStripSubtleFromTabColor ? "" : "border-[#333333] dark:border-[#333333]"
            }`}
            style={
              tabStripSubtleFromTabColor && tabsActiveTabColorResolved
                ? { borderBottomColor: tabsActiveTabColorResolved }
                : undefined
            }
          />
        ) : null}
      </div>

      {/* Tab content drop zone */}
      <div className={tabContentClassName}
        data-drop="TAB-CONTENT"
        data-tab-element-id={String(elementData?.id || "")}
        data-tab-id={String(activeId || "")}
        onDoubleClickCapture={(e) => {
          if (builderMode !== "Layout Mode") return;
          const nestedDiv = e.target?.closest?.("[data-tab-nested-id]");
          if (!nestedDiv) return;
          const nestedId = nestedDiv.dataset?.tabNestedId;
          if (!nestedId) return;
          const el = committedElements.find(
            (item) => String(item?.id) === nestedId
          );
          if (!el) return;
          e.preventDefault();
          e.stopPropagation();
          onTabElementEdit?.(el, String(activeId || ""));
        }}
        onDragOver={(e) => e.preventDefault()}
      >
        <TabsNestedElementList
          elements={committedElements}
          activeId={committedActiveId}
          builderMode={builderMode}
          tabSelectedElId={tabSelectedElId}
          ghost={ghost}
          sensors={sensors}
          onDragEnd={handleDragEnd}
          renderTabElement={renderTabElement}
          onTabElementEdit={onTabElementEdit}
          onTabElementSelect={onTabElementSelect}
        />
      </div>
      </div>
      {useLayoutSelectionFrame && (
        <>
          <div className="pointer-events-none absolute left-[1px] right-[1px] top-[10px] bottom-[10px] rounded-md bg-red-300/10" />
          <span className="pointer-events-none absolute left-[1px] top-[10px] h-2.5 w-2.5 border-l-2 border-t-2 border-red-400" />
          <span className="pointer-events-none absolute right-[1px] top-[10px] h-2.5 w-2.5 border-r-2 border-t-2 border-red-400" />
          <span className="pointer-events-none absolute bottom-[10px] left-[1px] h-2.5 w-2.5 border-b-2 border-l-2 border-red-400" />
          <span className="pointer-events-none absolute bottom-[10px] right-[1px] h-2.5 w-2.5 border-b-2 border-r-2 border-red-400" />
        </>
      )}
    </div>
  );
};

export default Tabs;
