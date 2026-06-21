import { Fragment, useMemo } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { setColor, setFont } from "../../../../function";
import IconAwsome from "../../IconAwsome";
import { isButtonFullWidthEnabled } from "./buttonElementConfig";
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

const ACCORDION_DEFAULTS = {
  accordionAlign: "start",
  accordionTabLabelStyle: "text",
  accordionLabelFontSize: 13,
  accordionGap: 8,
  accordionTabHeight: 48,
  accordionBorderWidth: 1,
  accordionItemRadius: 8,
  accordionMarginTop: 8,
  accordionMarginBottom: 8,
};

const FA_PREFIXES = new Set(["fas", "fab", "far"]);

const normalizeAccordionFaIcon = (raw) => {
  if (!raw || typeof raw !== "object") return { name: null, type: null };
  const name = raw.name;
  const type = raw.type;
  if (name == null || type == null) return { name: null, type: null };
  if (typeof name === "string" && typeof type === "string" && FA_PREFIXES.has(type)) {
    return { name, type };
  }
  return { name: null, type: null };
};

const normalizeAccordionItems = (itemsRaw) => {
  if (!Array.isArray(itemsRaw) || itemsRaw.length === 0) {
    return [
      {
        id: "acc-1",
        label: "Section 1",
        content: "Content for section 1 goes here.",
        disabled: false,
        elements: [],
        faIcon: { name: null, type: null },
      },
      {
        id: "acc-2",
        label: "Section 2",
        content: "Content for section 2 goes here.",
        disabled: false,
        elements: [],
        faIcon: { name: null, type: null },
      },
      {
        id: "acc-3",
        label: "Section 3",
        content: "Content for section 3 goes here.",
        disabled: false,
        elements: [],
        faIcon: { name: null, type: null },
      },
    ];
  }
  return itemsRaw.map((item, i) => ({
    ...(item && typeof item === "object" ? item : {}),
    id: String(item?.id || `acc-${i + 1}`),
    label:
      typeof item?.label === "string" ? item.label : `Section ${i + 1}`,
    content:
      typeof item?.content === "string"
        ? item.content
        : `Content for section ${i + 1} goes here.`,
    disabled: Boolean(item?.disabled),
    elements: Array.isArray(item?.elements) ? item.elements : [],
    faIcon: normalizeAccordionFaIcon(item?.faIcon),
  }));
};

const SortableAccordionItem = ({
  id,
  builderMode,
  children,
  onClick,
  inlineRow = false,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
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
        opacity: isDragging ? 0.35 : 1,
        zIndex: isDragging ? 10 : undefined,
      }}
      className={`relative ${inlineRow ? "w-fit max-w-full" : "w-full"} ${
        builderMode === "Layout Mode" ? (isDragging ? "cursor-grabbing" : "cursor-grab") : ""
      }`}
      {...(builderMode === "Layout Mode" ? { ...attributes, ...listeners } : {})}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

const normalizeButtonRowAlign = (v) => {
  const raw = String(v || "").trim();
  if (raw === "end") return "flex-end";
  if (raw === "center") return "center";
  return "flex-start";
};

const normalizeIconRowAlign = (v) => {
  const raw = String(v || "").trim();
  if (raw === "end") return "flex-end";
  if (raw === "center") return "center";
  return "flex-start";
};

const normalizeCounterRowAlign = (v) => {
  const raw = String(v || "").trim();
  if (raw === "left" || raw === "start") return "flex-start";
  if (raw === "right" || raw === "end") return "flex-end";
  return "center";
};

const chunkAccordionElementsForInlineRows = (elements) => {
  if (!Array.isArray(elements) || elements.length === 0) return [];
  const chunks = [];
  let i = 0;
  while (i < elements.length) {
    const e = elements[i];
    const t = String(e?.type || "");
    if (t === "btn" || t === "btnG") {
      const gid =
        typeof e?.buttonRowGroupId === "string" && e.buttonRowGroupId.trim()
          ? e.buttonRowGroupId.trim()
          : "";
      const canInline = !isButtonFullWidthEnabled(e);
      if (gid && canInline) {
        let j = i + 1;
        while (j < elements.length) {
          const n = elements[j];
          const nt = String(n?.type || "");
          if (
            (nt !== "btn" && nt !== "btnG") ||
            String(n?.buttonRowGroupId || "") !== gid ||
            isButtonFullWidthEnabled(n)
          ) {
            break;
          }
          j += 1;
        }
        const row = elements.slice(i, j);
        if (row.length >= 2) {
          chunks.push({ kind: "btnRow", startIndex: i, items: row });
          i = j;
          continue;
        }
      }
    }
    if (t === "icon") {
      const gid =
        typeof e?.iconRowGroupId === "string" && e.iconRowGroupId.trim()
          ? e.iconRowGroupId.trim()
          : "";
      if (gid) {
        let j = i + 1;
        while (j < elements.length) {
          const n = elements[j];
          const nt = String(n?.type || "");
          if (nt !== "icon" || String(n?.iconRowGroupId || "") !== gid) {
            break;
          }
          j += 1;
        }
        const row = elements.slice(i, j);
        if (row.length >= 2) {
          chunks.push({ kind: "iconRow", startIndex: i, items: row });
          i = j;
          continue;
        }
      }
    }
    if (t === "ctn") {
      const gid =
        typeof e?.counterRowGroupId === "string" && e.counterRowGroupId.trim()
          ? e.counterRowGroupId.trim()
          : "";
      if (gid) {
        let j = i + 1;
        while (j < elements.length) {
          const n = elements[j];
          const nt = String(n?.type || "");
          if (nt !== "ctn" || String(n?.counterRowGroupId || "") !== gid) {
            break;
          }
          j += 1;
        }
        const row = elements.slice(i, j);
        if (row.length >= 2) {
          chunks.push({ kind: "counterRow", startIndex: i, items: row });
          i = j;
          continue;
        }
      }
    }
    chunks.push({ kind: "single", startIndex: i, item: e });
    i += 1;
  }
  return chunks;
};

const resolveThemeColor = (theme, color, opacityRaw, fallback = null) => {
  if (!theme || color == null) return fallback;
  if (typeof color === "object" && color.type != null) {
    const row = theme[color.type];
    if (!Array.isArray(row) || row[color.index] == null) return fallback;
  }
  const opacityNum = Number(opacityRaw);
  const opacity = Number.isFinite(opacityNum)
    ? Math.min(255, Math.max(0, opacityNum))
    : 255;
  try {
    return setColor(theme, color, opacity);
  } catch {
    return fallback;
  }
};

const accordionImageLikeTypeSet = new Set(["img", "imgh", "imgo", "bnr", "lbx", "vid"]);
const ACCORDION_DATASLIDER_SELECTION_TYPES = new Set([
  "text",
  "txt",
  "heading",
  "btn",
  "btnG",
  "icon",
  "ctn",
  "divider",
  "img",
  "imgh",
  "imgo",
  "bnr",
  "lbx",
  "vid",
]);

function shouldKeepElementCenteredOnSelect(el) {
  const t = String(el?.type || "");
  if (t === "btn" || t === "btnG") {
    return String(el?.buttonLayoutAlign || "").trim() === "center";
  }
  if (t === "icon") {
    return String(el?.iconLayoutAlign || "").trim() === "center";
  }
  if (t === "ctn") {
    const raw = String(el?.counterAlign || el?.counterRowAlign || "").trim();
    return raw === "center";
  }
  return false;
}

function selectionFrameAlignClass(el) {
  const t = String(el?.type || "");
  const mapToClass = (raw) => {
    const v = String(raw || "").trim();
    if (v === "center") return "mx-auto";
    if (v === "end" || v === "right") return "ml-auto";
    return "";
  };
  if (t === "btn" || t === "btnG") return mapToClass(el?.buttonLayoutAlign);
  if (t === "icon") return mapToClass(el?.iconLayoutAlign);
  if (t === "ctn") return mapToClass(el?.counterAlign || el?.counterRowAlign);
  if (t === "heading") return mapToClass(el?.headingAlign);
  return "";
}

const AccordionElement = ({
  elementData,
  selected,
  animationForElement,
  builderMode,
  onTabElementEdit,
  renderTabElement,
  onTabElementSelect,
  onTabElementsReorder,
  tabGhostData,
  tabSelectedElId,
  theme,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );
  const items = normalizeAccordionItems(elementData?.accordionItems);
  const activeIdRaw = elementData?.accordionActiveId;
  const activeId =
    items.some((t) => t.id === activeIdRaw) ? activeIdRaw : items[0]?.id;

  const justifyContent = "flex-start";
  const textAlign = "left";

  const tabStyle = elementData?.accordionTabLabelStyle === "iconText" ? "iconText" : "text";
  const gap = 8;
  const tabHeight = Math.max(
    32,
    Math.min(
      96,
      Number.isFinite(Number(elementData?.accordionTabHeight))
        ? Number(elementData?.accordionTabHeight)
        : ACCORDION_DEFAULTS.accordionTabHeight
    )
  );
  const labelFontSize = Math.max(
    10,
    Math.min(
      22,
      Number(elementData?.accordionLabelFontSize) ||
        ACCORDION_DEFAULTS.accordionLabelFontSize
    )
  );
  const borderWidth = Math.max(
    0,
    Math.min(
      8,
      Number.isFinite(Number(elementData?.accordionBorderWidth))
        ? Number(elementData?.accordionBorderWidth)
        : ACCORDION_DEFAULTS.accordionBorderWidth
    )
  );
  const radius = Math.max(
    0,
    Math.min(
      40,
      Number.isFinite(Number(elementData?.accordionItemRadius))
        ? Number(elementData?.accordionItemRadius)
        : ACCORDION_DEFAULTS.accordionItemRadius
    )
  );
  const marginTop = Math.max(
    0,
    Math.min(
      80,
      Number(elementData?.accordionMarginTop) ||
        ACCORDION_DEFAULTS.accordionMarginTop
    )
  );
  const marginBottom = Math.max(
    0,
    Math.min(
      80,
      Number(elementData?.accordionMarginBottom) ||
        ACCORDION_DEFAULTS.accordionMarginBottom
    )
  );
  const textFontFamily = setFont(theme?.text?.value);

  const activeTabBg = useMemo(
    () =>
      resolveThemeColor(
        theme,
        elementData?.accordionActiveTabColor,
        elementData?.accordionActiveTabColorOpacity,
        "#333333"
      ),
    [
      theme,
      elementData?.accordionActiveTabColor,
      elementData?.accordionActiveTabColorOpacity,
    ]
  );
  const activeTextColor = useMemo(
    () =>
      resolveThemeColor(
        theme,
        elementData?.accordionActiveLabelColor,
        elementData?.accordionActiveLabelColorOpacity,
        "#ffffff"
      ),
    [
      theme,
      elementData?.accordionActiveLabelColor,
      elementData?.accordionActiveLabelColorOpacity,
    ]
  );
  const activeBorderColor = useMemo(
    () =>
      resolveThemeColor(
        theme,
        elementData?.accordionActiveBorderColor,
        elementData?.accordionActiveBorderColorOpacity,
        "#333333"
      ),
    [
      theme,
      elementData?.accordionActiveBorderColor,
      elementData?.accordionActiveBorderColorOpacity,
    ]
  );
  const activeToggleColor = useMemo(
    () =>
      resolveThemeColor(
        theme,
        elementData?.accordionActiveToggleColor,
        elementData?.accordionActiveToggleColorOpacity,
        "#ffffff"
      ),
    [
      theme,
      elementData?.accordionActiveToggleColor,
      elementData?.accordionActiveToggleColorOpacity,
    ]
  );
  const inactiveTabBg = useMemo(
    () =>
      resolveThemeColor(
        theme,
        elementData?.accordionInactiveTabColor,
        elementData?.accordionInactiveTabColorOpacity,
        "#ffffff"
      ),
    [
      theme,
      elementData?.accordionInactiveTabColor,
      elementData?.accordionInactiveTabColorOpacity,
    ]
  );
  const inactiveTextColor = useMemo(
    () =>
      resolveThemeColor(
        theme,
        elementData?.accordionInactiveLabelColor,
        elementData?.accordionInactiveLabelColorOpacity,
        "#111827"
      ),
    [
      theme,
      elementData?.accordionInactiveLabelColor,
      elementData?.accordionInactiveLabelColorOpacity,
    ]
  );
  const inactiveBorderColor = useMemo(
    () =>
      resolveThemeColor(
        theme,
        elementData?.accordionInactiveBorderColor,
        elementData?.accordionInactiveBorderColorOpacity,
        "#d8d8d8"
      ),
    [
      theme,
      elementData?.accordionInactiveBorderColor,
      elementData?.accordionInactiveBorderColorOpacity,
    ]
  );
  const inactiveToggleColor = useMemo(
    () =>
      resolveThemeColor(
        theme,
        elementData?.accordionInactiveToggleColor,
        elementData?.accordionInactiveToggleColorOpacity,
        "#6b7280"
      ),
    [
      theme,
      elementData?.accordionInactiveToggleColor,
      elementData?.accordionInactiveToggleColorOpacity,
    ]
  );
  const activeItem = items.find((t) => t.id === activeId) || items[0];
  const hasElements =
    Array.isArray(activeItem?.elements) && activeItem.elements.length > 0;
  const ghost =
    tabGhostData && tabGhostData.ghostEl && tabGhostData.tabId === activeId
      ? tabGhostData
      : null;
  const isThisItemHovered = !!ghost;
  const sortableIds = useMemo(
    () => (activeItem?.elements || []).map((el) => String(el?.id || "")),
    [activeItem?.elements]
  );
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const els = activeItem?.elements || [];
    const from = els.findIndex((e) => String(e?.id) === String(active.id));
    const to = els.findIndex((e) => String(e?.id) === String(over.id));
    if (from !== -1 && to !== -1) {
      onTabElementsReorder?.(String(activeId || ""), from, to);
    }
  };
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
      <div className="flex w-full flex-col" style={{ gap }}>
        {items.map((item) => {
          const isActive = item.id === activeId;
          const titleColor = isActive ? activeTextColor : inactiveTextColor;
          const rowBg = isActive ? activeTabBg : inactiveTabBg;
          const rowBorder = isActive ? activeBorderColor : inactiveBorderColor;
          const toggleColor = isActive ? activeToggleColor : inactiveToggleColor;
          const fa = normalizeAccordionFaIcon(item?.faIcon);
          return (
            <div
              key={item.id}
              className="w-full"
              style={{ boxShadow: "none" }}
            >
              <div data-accordion-tab-trigger="true">
                <button
                  type="button"
                  aria-disabled="true"
                  data-accordion-tab-trigger="true"
                  className="flex w-full cursor-pointer items-center gap-2 px-4"
                  style={{
                    backgroundColor: rowBg || "#ffffff",
                    color: titleColor || "#111827",
                    justifyContent,
                    textAlign,
                    minHeight: tabHeight,
                    borderWidth,
                    borderStyle: "solid",
                    borderColor: rowBorder || "#d8d8d8",
                    borderRadius: radius,
                    boxShadow: "none",
                    opacity: item.disabled ? 0.45 : 1,
                  }}
                >
                  {tabStyle === "iconText" && (
                    <span className="inline-flex shrink-0 items-center justify-center">
                      {fa.name && fa.type ? (
                        <IconAwsome
                          iconName={fa.name}
                          iconType={fa.type}
                          style={{
                            fontSize: Math.round((labelFontSize * 14) / 13),
                            color: titleColor || "#111827",
                          }}
                        />
                      ) : (
                        <Sparkles
                          className="shrink-0"
                          size={Math.round((labelFontSize * 14) / 13)}
                          strokeWidth={2}
                          aria-hidden
                        />
                      )}
                    </span>
                  )}
                  <span
                    className="min-w-0 flex-1 truncate"
                    style={{ fontSize: labelFontSize, textAlign }}
                  >
                    {item.label}
                  </span>
                  <ChevronDown
                    className={`shrink-0 transition-transform ${isActive ? "rotate-180" : ""}`}
                    size={Math.round((labelFontSize * 14) / 13)}
                    style={{ color: toggleColor || "#6b7280" }}
                    strokeWidth={2.25}
                    aria-hidden
                  />
                </button>
              </div>
              {isActive ? (
                <div
                  className={`${hasElements ? "mt-0" : "mt-3"} px-4 ${hasElements ? "py-0" : "py-3"} text-[13px] text-slate-500 transition-colors dark:text-slate-300 ${
                    isThisItemHovered
                      ? "border border-dashed border-blue-400 bg-blue-50 dark:border-blue-400/70 dark:bg-blue-900/10"
                      : hasElements
                        ? "border-0 bg-transparent"
                        : "rounded-md border border-dashed border-slate-300 bg-slate-50 dark:border-white/20 dark:bg-white/5"
                  }`}
                  data-drop="TAB-CONTENT"
                  data-tab-element-id={String(elementData?.id || "")}
                  data-tab-id={String(activeId || "")}
                  onDoubleClickCapture={(e) => {
                    if (builderMode !== "Editor Mode") return;
                    const nestedDiv = e.target?.closest?.("[data-tab-nested-id]");
                    if (!nestedDiv) return;
                    const nestedId = nestedDiv.dataset?.tabNestedId;
                    if (!nestedId) return;
                    const el = (activeItem?.elements || []).find(
                      (entry) => String(entry?.id) === nestedId
                    );
                    if (!el) return;
                    e.preventDefault();
                    e.stopPropagation();
                    onTabElementEdit?.(el, String(activeId || ""));
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  style={{
                    color: "#111827",
                    textAlign,
                    boxShadow: "none",
                  }}
                >
                  {hasElements ? (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
                        <div className="space-y-0">
                          {chunkAccordionElementsForInlineRows(activeItem.elements).map(
                            (chunk, chunkIndex) => {
                              if (
                                chunk.kind === "btnRow" ||
                                chunk.kind === "iconRow" ||
                                chunk.kind === "counterRow"
                              ) {
                                const rowAlign =
                                  chunk.kind === "iconRow"
                                    ? normalizeIconRowAlign(
                                        chunk.items?.[0]?.iconLayoutAlign
                                      )
                                    : chunk.kind === "counterRow"
                                      ? normalizeCounterRowAlign(
                                          chunk.items?.[0]?.counterRowAlign ??
                                            chunk.items?.[0]?.counterAlign
                                        )
                                    : normalizeButtonRowAlign(
                                        chunk.items?.[0]?.buttonLayoutAlign
                                      );
                                const counterRowGap =
                                  chunk.kind === "counterRow"
                                    ? (() => {
                                        const rawGap = Number(
                                          chunk.items?.[0]?.counterRowGap
                                        );
                                        const gap = Number.isFinite(rawGap)
                                          ? rawGap
                                          : 8;
                                        return Math.max(0, Math.min(80, gap));
                                      })()
                                    : 8;
                                return (
                                  <div
                                    key={String(
                                      chunk.items?.[0]?.id ||
                                        (chunk.kind === "iconRow"
                                          ? `acc-icon-row-${chunkIndex}`
                                          : chunk.kind === "counterRow"
                                            ? `acc-counter-row-${chunkIndex}`
                                          : `acc-btn-row-${chunkIndex}`)
                                    )}
                                    className="mb-0 flex w-full flex-row flex-wrap items-center"
                                    style={{
                                      justifyContent: rowAlign,
                                      columnGap:
                                        chunk.kind === "counterRow"
                                          ? counterRowGap
                                          : 8,
                                    }}
                                  >
                                    {chunk.items.map((el, localIdx) => {
                                      const i = chunk.startIndex + localIdx;
                                      return (
                                        <div
                                          key={String(el?.id || `acc-el-${i}`)}
                                          className="relative"
                                        >
                                          {ghost &&
                                            !ghost.isLast &&
                                            ghost.insertAt === i &&
                                            ghost.ghostEl}
                                          <SortableAccordionItem
                                            id={String(el?.id || `acc-el-${i}`)}
                                            builderMode={builderMode}
                                            inlineRow
                                            onClick={(e) => {
                                              if (builderMode !== "Layout Mode") return;
                                              if (e.detail === 2) {
                                                return;
                                              }
                                              e.preventDefault();
                                              e.stopPropagation();
                                              if (tabSelectedElId === el?.id) {
                                                onTabElementSelect?.(
                                                  null,
                                                  String(activeId || "")
                                                );
                                              } else {
                                                onTabElementSelect?.(
                                                  el,
                                                  String(activeId || "")
                                                );
                                              }
                                            }}
                                          >
                                            <div
                                              data-tab-nested-id={String(el?.id || "")}
                                              className=""
                                            >
                                              {(() => {
                                                const elementType = String(el?.type || "");
                                                const isSelectedInLayoutMode =
                                                  builderMode === "Layout Mode" &&
                                                  tabSelectedElId === el?.id;
                                                const isImageLike =
                                                  accordionImageLikeTypeSet.has(elementType);
                                                const isDivider = elementType === "divider";
                                                const isIcon = elementType === "icon";
                                                const isCounter = elementType === "ctn";
                                                const useDataSliderSelection =
                                                  isSelectedInLayoutMode &&
                                                  ACCORDION_DATASLIDER_SELECTION_TYPES.has(
                                                    elementType
                                                  );
                                                const widenSelectFrame =
                                                  isIcon || isCounter;
                                                const keepCenterOnSelect =
                                                  useDataSliderSelection &&
                                                  shouldKeepElementCenteredOnSelect(el);
                                                const useContentSelectionFrame =
                                                  useDataSliderSelection &&
                                                  !isDivider &&
                                                  !isImageLike;
                                                const frameAlignClass =
                                                  selectionFrameAlignClass(el);
                                                const selectedOuterSpacingStyle =
                                                  useDataSliderSelection &&
                                                  (isDivider || isIcon)
                                                    ? {
                                                        marginTop: 8,
                                                        marginBottom: 6,
                                                      }
                                                    : undefined;
                                                const imageBorderRadiusRaw = Number(
                                                  el?.borderRadius
                                                );
                                                const imageBorderRadiusStyle =
                                                  Number.isFinite(
                                                    imageBorderRadiusRaw
                                                  )
                                                    ? {
                                                        borderRadius: `${Math.max(
                                                          0,
                                                          imageBorderRadiusRaw
                                                        )}px`,
                                                      }
                                                    : undefined;
                                                return (
                                                  <div
                                                    style={
                                                      keepCenterOnSelect
                                                        ? {
                                                            marginLeft: "auto",
                                                            marginRight: "auto",
                                                            ...(selectedOuterSpacingStyle ||
                                                              {}),
                                                          }
                                                        : selectedOuterSpacingStyle
                                                    }
                                                  >
                                                    {useDataSliderSelection &&
                                                      isImageLike && (
                                                        <div
                                                          className="pointer-events-none absolute inset-0 z-[11] bg-red-500/45"
                                                          style={
                                                            imageBorderRadiusStyle
                                                          }
                                                        />
                                                      )}
                                                    <div
                                                      className={
                                                        useContentSelectionFrame
                                                          ? `relative block w-fit max-w-full ${frameAlignClass}`
                                                          : ""
                                                      }
                                                    >
                                                      <div
                                                        className={
                                                          useDataSliderSelection &&
                                                          !isImageLike
                                                            ? isDivider
                                                              ? "w-full origin-center scale-[0.85] transform-gpu transition-transform duration-150"
                                                              : "w-fit max-w-full origin-center scale-[0.85] transform-gpu transition-transform duration-150"
                                                            : ""
                                                        }
                                                      >
                                                        {typeof renderTabElement ===
                                                        "function" ? (
                                                          renderTabElement(
                                                            el,
                                                            i,
                                                            String(activeId || "")
                                                          )
                                                        ) : (
                                                          <div className="rounded-md border border-slate-200 bg-white px-2.5 py-2 text-left text-[12px] text-slate-700 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200">
                                                            <span className="font-semibold">
                                                              {String(
                                                                el?.type || "element"
                                                              ).toUpperCase()}
                                                            </span>
                                                            <span className="mx-1 text-slate-400">
                                                              -
                                                            </span>
                                                            <span>
                                                              {String(
                                                                el?.id || "no-id"
                                                              )}
                                                            </span>
                                                          </div>
                                                        )}
                                                      </div>
                                                      {useContentSelectionFrame && (
                                                        <>
                                                          <div
                                                            className={`pointer-events-none absolute ${
                                                              widenSelectFrame
                                                                ? isIcon
                                                                  ? "left-[-8px] right-[-8px] top-[-4px] bottom-[-4px]"
                                                                  : "inset-[-8px]"
                                                                : "inset-[1px]"
                                                            } rounded-md bg-red-300/10`}
                                                          />
                                                          <span
                                                            className={`pointer-events-none absolute ${
                                                              widenSelectFrame
                                                                ? "left-[-7px]"
                                                                : "left-[2px]"
                                                            } ${
                                                              widenSelectFrame
                                                                ? isIcon
                                                                  ? "top-[-3px]"
                                                                  : "top-[-7px]"
                                                                : "top-[2px]"
                                                            } h-2.5 w-2.5 border-l-2 border-t-2 border-red-400`}
                                                          />
                                                          <span
                                                            className={`pointer-events-none absolute ${
                                                              widenSelectFrame
                                                                ? "right-[-7px]"
                                                                : "right-[2px]"
                                                            } ${
                                                              widenSelectFrame
                                                                ? isIcon
                                                                  ? "top-[-3px]"
                                                                  : "top-[-7px]"
                                                                : "top-[2px]"
                                                            } h-2.5 w-2.5 border-r-2 border-t-2 border-red-400`}
                                                          />
                                                          <span
                                                            className={`pointer-events-none absolute ${
                                                              widenSelectFrame
                                                                ? "left-[-7px]"
                                                                : "left-[2px]"
                                                            } ${
                                                              widenSelectFrame
                                                                ? isIcon
                                                                  ? "bottom-[-3px]"
                                                                  : "bottom-[-7px]"
                                                                : "bottom-[2px]"
                                                            } h-2.5 w-2.5 border-b-2 border-l-2 border-red-400`}
                                                          />
                                                          <span
                                                            className={`pointer-events-none absolute ${
                                                              widenSelectFrame
                                                                ? "right-[-7px]"
                                                                : "right-[2px]"
                                                            } ${
                                                              widenSelectFrame
                                                                ? isIcon
                                                                  ? "bottom-[-3px]"
                                                                  : "bottom-[-7px]"
                                                                : "bottom-[2px]"
                                                            } h-2.5 w-2.5 border-b-2 border-r-2 border-red-400`}
                                                          />
                                                        </>
                                                      )}
                                                    </div>
                                                    {useDataSliderSelection &&
                                                      (isImageLike ? null : isDivider ? (
                                                        <>
                                                          <div className="pointer-events-none absolute left-[1px] right-[1px] top-[-4px] bottom-0 rounded-md bg-red-300/10" />
                                                          <span className="pointer-events-none absolute left-[2px] top-[-3px] h-2.5 w-2.5 border-l-2 border-t-2 border-red-400" />
                                                          <span className="pointer-events-none absolute right-[2px] top-[-3px] h-2.5 w-2.5 border-r-2 border-t-2 border-red-400" />
                                                          <span className="pointer-events-none absolute bottom-[1px] left-[2px] h-2.5 w-2.5 border-b-2 border-l-2 border-red-400" />
                                                          <span className="pointer-events-none absolute bottom-[1px] right-[2px] h-2.5 w-2.5 border-b-2 border-r-2 border-red-400" />
                                                        </>
                                                      ) : null)}
                                                  </div>
                                                );
                                              })()}
                                            </div>
                                            {builderMode === "Layout Mode" &&
                                              tabSelectedElId === el?.id &&
                                              !ACCORDION_DATASLIDER_SELECTION_TYPES.has(
                                                String(el?.type || "")
                                              ) && (
                                                <div className="pointer-events-none absolute -inset-x-3 inset-y-0 rounded border border-dashed border-red-400 bg-red-300/10" />
                                              )}
                                          </SortableAccordionItem>
                                          {ghost &&
                                            ghost.isLast &&
                                            i === activeItem.elements.length - 1 &&
                                            ghost.ghostEl}
                                        </div>
                                      );
                                    })}
                                  </div>
                                );
                              }

                              const el = chunk.item;
                              const i = chunk.startIndex;
                              return (
                            <Fragment key={String(el?.id || `acc-el-${i}`)}>
                              {ghost && !ghost.isLast && ghost.insertAt === i && ghost.ghostEl}
                              <SortableAccordionItem
                                id={String(el?.id || `acc-el-${i}`)}
                                builderMode={builderMode}
                                onClick={(e) => {
                                  if (builderMode !== "Layout Mode") return;
                                  if (e.detail === 2) {
                                    return;
                                  }
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (tabSelectedElId === el?.id) {
                                    onTabElementSelect?.(null, String(activeId || ""));
                                  } else {
                                    onTabElementSelect?.(el, String(activeId || ""));
                                  }
                                }}
                              >
                                <div
                                  data-tab-nested-id={String(el?.id || "")}
                                  className=""
                                >
                                  {(() => {
                                    const elementType = String(el?.type || "");
                                    const isSelectedInLayoutMode =
                                      builderMode === "Layout Mode" &&
                                      tabSelectedElId === el?.id;
                                    const isImageLike =
                                      accordionImageLikeTypeSet.has(elementType);
                                    const isDivider = elementType === "divider";
                                    const isIcon = elementType === "icon";
                                    const isCounter = elementType === "ctn";
                                    const useDataSliderSelection =
                                      isSelectedInLayoutMode &&
                                      ACCORDION_DATASLIDER_SELECTION_TYPES.has(elementType);
                                    const widenSelectFrame = isIcon || isCounter;
                                    const keepCenterOnSelect =
                                      useDataSliderSelection &&
                                      shouldKeepElementCenteredOnSelect(el);
                                    const useContentSelectionFrame =
                                      useDataSliderSelection &&
                                      !isDivider &&
                                      !isImageLike;
                                    const frameAlignClass = selectionFrameAlignClass(el);
                                    const selectedOuterSpacingStyle =
                                      useDataSliderSelection &&
                                      (isDivider || isIcon)
                                        ? {
                                            marginTop: 8,
                                            marginBottom: 6,
                                          }
                                        : undefined;
                                    const imageBorderRadiusRaw = Number(
                                      el?.borderRadius
                                    );
                                    const imageBorderRadiusStyle =
                                      Number.isFinite(imageBorderRadiusRaw)
                                        ? {
                                            borderRadius: `${Math.max(
                                              0,
                                              imageBorderRadiusRaw
                                            )}px`,
                                          }
                                        : undefined;
                                    return (
                                      <div
                                        style={
                                          keepCenterOnSelect
                                            ? {
                                                marginLeft: "auto",
                                                marginRight: "auto",
                                                ...(selectedOuterSpacingStyle || {}),
                                              }
                                            : selectedOuterSpacingStyle
                                        }
                                      >
                                        {useDataSliderSelection && isImageLike && (
                                          <div
                                            className="pointer-events-none absolute inset-0 z-[11] bg-red-500/45"
                                            style={imageBorderRadiusStyle}
                                          />
                                        )}
                                        <div
                                          className={
                                            useContentSelectionFrame
                                              ? `relative block w-fit max-w-full ${frameAlignClass}`
                                              : ""
                                          }
                                        >
                                          <div
                                            className={
                                              useDataSliderSelection && !isImageLike
                                                ? isDivider
                                                  ? "w-full origin-center scale-[0.85] transform-gpu transition-transform duration-150"
                                                  : "w-fit max-w-full origin-center scale-[0.85] transform-gpu transition-transform duration-150"
                                                : ""
                                            }
                                          >
                                            {typeof renderTabElement === "function" ? (
                                              renderTabElement(
                                                useDataSliderSelection && isImageLike
                                                  ? {
                                                      ...el,
                                                      __dtsSuppressImageSelectedOverlay: true,
                                                      __selectedOverlayClass:
                                                        "bg-transparent",
                                                    }
                                                  : el,
                                                i,
                                                String(activeId || "")
                                              )
                                            ) : (
                                              <div className="rounded-md border border-slate-200 bg-white px-2.5 py-2 text-left text-[12px] text-slate-700 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200">
                                                <span className="font-semibold">
                                                  {String(el?.type || "element").toUpperCase()}
                                                </span>
                                                <span className="mx-1 text-slate-400">-</span>
                                                <span>{String(el?.id || "no-id")}</span>
                                              </div>
                                            )}
                                          </div>
                                          {useContentSelectionFrame && (
                                            <>
                                              <div
                                                className={`pointer-events-none absolute ${
                                                  widenSelectFrame
                                                    ? isIcon
                                                      ? "left-[-8px] right-[-8px] top-[-4px] bottom-[-4px]"
                                                      : "inset-[-8px]"
                                                    : "inset-[1px]"
                                                } rounded-md bg-red-300/10`}
                                              />
                                              <span
                                                className={`pointer-events-none absolute ${
                                                  widenSelectFrame ? "left-[-7px]" : "left-[2px]"
                                                } ${
                                                  widenSelectFrame
                                                    ? isIcon
                                                      ? "top-[-3px]"
                                                      : "top-[-7px]"
                                                    : "top-[2px]"
                                                } h-2.5 w-2.5 border-l-2 border-t-2 border-red-400`}
                                              />
                                              <span
                                                className={`pointer-events-none absolute ${
                                                  widenSelectFrame ? "right-[-7px]" : "right-[2px]"
                                                } ${
                                                  widenSelectFrame
                                                    ? isIcon
                                                      ? "top-[-3px]"
                                                      : "top-[-7px]"
                                                    : "top-[2px]"
                                                } h-2.5 w-2.5 border-r-2 border-t-2 border-red-400`}
                                              />
                                              <span
                                                className={`pointer-events-none absolute ${
                                                  widenSelectFrame ? "left-[-7px]" : "left-[2px]"
                                                } ${
                                                  widenSelectFrame
                                                    ? isIcon
                                                      ? "bottom-[-3px]"
                                                      : "bottom-[-7px]"
                                                    : "bottom-[2px]"
                                                } h-2.5 w-2.5 border-b-2 border-l-2 border-red-400`}
                                              />
                                              <span
                                                className={`pointer-events-none absolute ${
                                                  widenSelectFrame ? "right-[-7px]" : "right-[2px]"
                                                } ${
                                                  widenSelectFrame
                                                    ? isIcon
                                                      ? "bottom-[-3px]"
                                                      : "bottom-[-7px]"
                                                    : "bottom-[2px]"
                                                } h-2.5 w-2.5 border-b-2 border-r-2 border-red-400`}
                                              />
                                            </>
                                          )}
                                        </div>
                                        {useDataSliderSelection &&
                                          (isImageLike ? null : isDivider ? (
                                            <>
                                              <div className="pointer-events-none absolute left-[1px] right-[1px] top-[-4px] bottom-0 rounded-md bg-red-300/10" />
                                              <span className="pointer-events-none absolute left-[2px] top-[-3px] h-2.5 w-2.5 border-l-2 border-t-2 border-red-400" />
                                              <span className="pointer-events-none absolute right-[2px] top-[-3px] h-2.5 w-2.5 border-r-2 border-t-2 border-red-400" />
                                              <span className="pointer-events-none absolute bottom-[1px] left-[2px] h-2.5 w-2.5 border-b-2 border-l-2 border-red-400" />
                                              <span className="pointer-events-none absolute bottom-[1px] right-[2px] h-2.5 w-2.5 border-b-2 border-r-2 border-red-400" />
                                            </>
                                          ) : null)}
                                      </div>
                                    );
                                  })()}
                                </div>
                                {builderMode === "Layout Mode" &&
                                  tabSelectedElId === el?.id &&
                                  !ACCORDION_DATASLIDER_SELECTION_TYPES.has(
                                    String(el?.type || "")
                                  ) && (
                                  <div className="pointer-events-none absolute -inset-x-3 inset-y-0 rounded border border-dashed border-red-400 bg-red-300/10" />
                                )}
                              </SortableAccordionItem>
                              {ghost &&
                                ghost.isLast &&
                                i === activeItem.elements.length - 1 &&
                                ghost.ghostEl}
                            </Fragment>
                              );
                            }
                          )}
                        </div>
                      </SortableContext>
                    </DndContext>
                  ) : (
                    <div className="flex h-full min-h-[44px] flex-col items-center justify-center gap-1 text-center">
                      {ghost ? (
                        ghost.ghostEl
                      ) : (
                        <span className="font-sans text-[11px] text-slate-400 dark:text-slate-500">
                          ลาก Element มาวางที่นี่
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
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

export default AccordionElement;
