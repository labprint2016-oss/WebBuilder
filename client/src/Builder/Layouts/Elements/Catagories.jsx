import { useEffect, useRef } from "react";
import { setColor, setFont } from "../../../../function";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  MeasuringStrategy,
  pointerWithin,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { mergeCatagoriesElement } from "./catagoriesElementConfig";
import { usePanelPreview } from "../../panelPreviewStore";

const catagoriesButtonStripScrollMemory = new Map();

const SortableCatagoriesItem = ({
  id,
  builderMode,
  children,
  onClick,
  inlineRow = false,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id,
      disabled: builderMode !== "Layout Mode",
    });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
            : undefined,
        transition: isDragging ? undefined : transition,
        opacity: isDragging ? 0.35 : 1,
        zIndex: isDragging ? 50 : 1,
        position: "relative",
      }}
      className={`relative ${inlineRow ? "w-fit max-w-full" : "w-full"} ${
        builderMode === "Layout Mode" ? (isDragging ? "cursor-grabbing" : "cursor-grab") : ""
      } flow-root`}
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

const chunkCatagoriesElementsForInlineRows = (elements) => {
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
      if (gid) {
        let j = i + 1;
        while (j < elements.length) {
          const n = elements[j];
          const nt = String(n?.type || "");
          if (nt !== "btn" && nt !== "btnG") break;
          if (String(n?.buttonRowGroupId || "").trim() !== gid) break;
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
          if (nt !== "icon") break;
          if (String(n?.iconRowGroupId || "").trim() !== gid) break;
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
          if (nt !== "ctn") break;
          if (String(n?.counterRowGroupId || "").trim() !== gid) break;
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

const normalizeInlineGroupInsertAtForPreview = (elements, insertAt) => {
  if (!Array.isArray(elements)) return insertAt;
  const safe = Number.isInteger(insertAt)
    ? Math.max(0, Math.min(elements.length, insertAt))
    : 0;
  if (safe <= 0 || safe >= elements.length) return safe;
  const chunks = chunkCatagoriesElementsForInlineRows(elements);
  for (const chunk of chunks) {
    if (chunk.kind !== "btnRow" && chunk.kind !== "iconRow" && chunk.kind !== "counterRow") {
      continue;
    }
    const rowStart = chunk.startIndex;
    const rowEnd = rowStart + (chunk.items?.length || 0) - 1;
    if (safe > rowStart && safe <= rowEnd) {
      return rowEnd + 1;
    }
  }
  return safe;
};

function resolveColor(theme, raw, fallback = "#e2e8f0", opacity = 255) {
  const op = Number.isFinite(Number(opacity))
    ? Math.max(0, Math.min(255, Math.round(Number(opacity))))
    : 255;
  const src = raw == null || raw === "" ? fallback : raw;
  if (typeof src === "string") {
    return `${src}${op.toString(16).toUpperCase().padStart(2, "0")}`;
  }
  if (
    typeof src === "object" &&
    src.type &&
    theme?.[src.type] &&
    theme[src.type][src.index] != null
  ) {
    return setColor(theme, src, op);
  }
  return fallback;
}

function resolveDividerColor(theme, raw, opacity = 255, fallback = "#334155") {
  const op = Number.isFinite(Number(opacity))
    ? Math.max(0, Math.min(255, Math.round(Number(opacity))))
    : 255;
  const src = raw == null || raw === "" ? fallback : raw;
  if (typeof src === "string") {
    const hex = op.toString(16).toUpperCase().padStart(2, "0");
    return `${src}${hex}`;
  }
  if (
    typeof src === "object" &&
    src.type &&
    theme?.[src.type] &&
    theme[src.type][src.index] != null
  ) {
    return setColor(theme, src, op);
  }
  return fallback;
}

const Catagories = ({
  elementData,
  selected,
  animationForElement,
  builderMode,
  device = "Desktop",
  onTabElementEdit,
  renderTabElement,
  onTabElementSelect,
  onTabElementsReorder,
  tabGhostData,
  tabSelectedElId,
  onUpdate,
  theme,
}) => {
  const panelPreview = usePanelPreview("ctg", elementData?.id);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );
  const collisionDetection = (args) => {
    const activeId = String(args?.active?.id || "");
    const pointerCollisions = pointerWithin(args).filter(
      (col) => String(col?.id || "") !== activeId
    );
    if (pointerCollisions && pointerCollisions.length > 0) {
      return pointerCollisions;
    }
    return closestCenter(args).filter(
      (col) => String(col?.id || "") !== activeId
    );
  };
  const useLayoutSelectionFrame = builderMode === "Layout Mode" && selected;
  const data = mergeCatagoriesElement(
    panelPreview ? { ...elementData, ...panelPreview } : elementData
  );
  const tabs = Array.isArray(data.catagoriesTabs) ? data.catagoriesTabs : [];
  const activeCategoryId = tabs.some(
    (tab) => String(tab?.id) === String(data?.catagoriesActiveCategoryId)
  )
    ? data?.catagoriesActiveCategoryId
    : tabs[0]?.id;
  const activeTab = tabs.find((tab) => String(tab?.id) === String(activeCategoryId)) || tabs[0];
  const items = Array.isArray(activeTab?.items) ? activeTab.items : [];
  const perViewRaw =
    device === "Mobile"
      ? data?.catagoriesPerViewMobile
      : device === "Tablet"
        ? data?.catagoriesPerViewTablet
        : data?.catagoriesPerViewDesktop;
  const perView = Math.max(1, Number(perViewRaw) || 1);
  const gap = Math.max(0, Number(data?.catagoriesGap) || 0);
  const itemGridGap = Math.max(0, Number(data?.catagoriesItemGap) || 12);
  const marginTop = Math.max(0, Math.min(80, Number(data?.catagoriesMarginTop) || 8));
  const marginBottom = Math.max(
    0,
    Math.min(80, Number(data?.catagoriesMarginBottom) || 8)
  );
  const textFontFamily = setFont(theme?.text?.value);

  const defaultFillColor = resolveColor(
    theme,
    data?.catagoriesButtonFill,
    "#0d9488",
    data?.catagoriesButtonFillOpacity
  );
  const defaultBorderColor = resolveColor(
    theme,
    data?.catagoriesButtonBorderColor,
    "#d8d8d8",
    data?.catagoriesButtonBorderOpacity
  );
  const defaultTextColor = resolveColor(
    theme,
    data?.catagoriesButtonTextColor,
    "#ffffff",
    data?.catagoriesButtonTextOpacity
  );
  const btnRadius = Math.max(0, Number(data?.catagoriesButtonRadius) || 0);
  const btnFontSize = Math.max(9, Number(data?.catagoriesButtonFontSize) || 13);
  const btnFontWeight = data?.catagoriesButtonBold === false ? 400 : 700;
  const btnBorderWidth = Math.max(
    0,
    Math.min(8, Number(data?.catagoriesButtonBorderWidth) || 0)
  );
  const btnPadX = Math.max(0, Number(data?.catagoriesButtonPaddingX) || 0);
  const btnPadY = Math.max(0, Number(data?.catagoriesButtonPaddingY) || 0);
  const buttonStripRef = useRef(null);
  const scrollMemoryKey = `${String(data?.id || elementData?.id || "ctg")}::${String(
    activeCategoryId || ""
  )}`;

  useEffect(() => {
    const node = buttonStripRef.current;
    if (!node) return;
    const saved = catagoriesButtonStripScrollMemory.get(scrollMemoryKey);
    if (Number.isFinite(saved)) {
      node.scrollLeft = saved;
    }
  }, [scrollMemoryKey, items.length]);

  useEffect(() => {
    const node = buttonStripRef.current;
    return () => {
      if (!node) return;
      catagoriesButtonStripScrollMemory.set(scrollMemoryKey, node.scrollLeft);
    };
  }, [scrollMemoryKey]);

  return (
    <div
      className={`w-full ${animationForElement || ""} ${
        selected && !useLayoutSelectionFrame
          ? "rounded-md border border-dashed border-red-400 bg-red-300/10 p-2"
          : useLayoutSelectionFrame
            ? "relative rounded-md p-4"
          : ""
      }`}
      style={{ marginTop, marginBottom }}
    >
      <div className={useLayoutSelectionFrame ? "relative" : ""}>
        <div
          className={
            useLayoutSelectionFrame
              ? "transition-transform duration-150"
              : ""
          }
        >
          <div
            ref={buttonStripRef}
            className="w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            onScroll={(e) => {
              catagoriesButtonStripScrollMemory.set(
                scrollMemoryKey,
                e.currentTarget.scrollLeft
              );
            }}
          >
            <div className="flex w-max min-w-full items-center" style={{ gap }}>
              {tabs.map((catTab, tabIndex) => {
                const isActive = String(catTab?.id) === String(activeCategoryId);
                const sourceItem = items[tabIndex];
                const fillColor = resolveColor(
                  theme,
                  isActive
                    ? sourceItem?.catagoriesButtonFill ?? data?.catagoriesButtonFill
                    : sourceItem?.catagoriesButtonInactiveFill ??
                        data?.catagoriesButtonInactiveFill ??
                        sourceItem?.catagoriesButtonFill ??
                        data?.catagoriesButtonFill,
                  defaultFillColor,
                  isActive
                    ? sourceItem?.catagoriesButtonFillOpacity ??
                        data?.catagoriesButtonFillOpacity
                    : sourceItem?.catagoriesButtonInactiveFillOpacity ??
                        data?.catagoriesButtonInactiveFillOpacity ??
                        sourceItem?.catagoriesButtonFillOpacity ??
                        data?.catagoriesButtonFillOpacity
                );
                const borderColor = resolveColor(
                  theme,
                  isActive
                    ? sourceItem?.catagoriesButtonBorderColor ??
                        data?.catagoriesButtonBorderColor
                    : sourceItem?.catagoriesButtonInactiveBorderColor ??
                        data?.catagoriesButtonInactiveBorderColor ??
                        sourceItem?.catagoriesButtonBorderColor ??
                        data?.catagoriesButtonBorderColor,
                  defaultBorderColor,
                  isActive
                    ? sourceItem?.catagoriesButtonBorderOpacity ??
                        data?.catagoriesButtonBorderOpacity
                    : sourceItem?.catagoriesButtonInactiveBorderOpacity ??
                        data?.catagoriesButtonInactiveBorderOpacity ??
                        sourceItem?.catagoriesButtonBorderOpacity ??
                        data?.catagoriesButtonBorderOpacity
                );
                const textColor = resolveColor(
                  theme,
                  isActive
                    ? sourceItem?.catagoriesButtonTextColor ??
                        data?.catagoriesButtonTextColor
                    : sourceItem?.catagoriesButtonInactiveTextColor ??
                        data?.catagoriesButtonInactiveTextColor ??
                        sourceItem?.catagoriesButtonTextColor ??
                        data?.catagoriesButtonTextColor,
                  defaultTextColor,
                  isActive
                    ? sourceItem?.catagoriesButtonTextOpacity ??
                        data?.catagoriesButtonTextOpacity
                    : sourceItem?.catagoriesButtonInactiveTextOpacity ??
                        data?.catagoriesButtonInactiveTextOpacity ??
                        sourceItem?.catagoriesButtonTextOpacity ??
                        data?.catagoriesButtonTextOpacity
                );
                return (
                  <button
                    key={String(catTab?.id || `ctg-tab-btn-${tabIndex}`)}
                    type="button"
                    className="inline-flex w-auto shrink-0 items-center justify-center text-center transition-opacity hover:opacity-90"
                    style={{
                      backgroundColor: fillColor,
                      border: `${btnBorderWidth}px solid ${borderColor}`,
                      color: textColor,
                      fontFamily: textFontFamily,
                      borderRadius: `${btnRadius}px`,
                      fontSize: `${btnFontSize}px`,
                      fontWeight: btnFontWeight,
                      padding: `${btnPadY}px ${btnPadX}px`,
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (String(catTab?.id) === String(activeCategoryId)) return;
                      onUpdate?.(
                        mergeCatagoriesElement({
                          ...data,
                          catagoriesActiveCategoryId: String(catTab?.id || ""),
                        })
                      );
                    }}
                  >
                    {catTab?.label || `Categories ${tabIndex + 1}`}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-3">
            <div
              className="grid w-full"
              style={{ gap: itemGridGap, gridTemplateColumns: `repeat(${Math.max(1, perView)}, minmax(0, 1fr))` }}
            >
              {items.map((item, idx) => {
              const hasElements = Array.isArray(item?.elements) && item.elements.length > 0;
              const rawGhost =
                tabGhostData && tabGhostData.ghostEl && tabGhostData.tabId === String(item?.id || "")
                  ? tabGhostData
                  : null;
              const itemElements = item?.elements || [];
              const ghostInsertAt = rawGhost
                ? normalizeInlineGroupInsertAtForPreview(itemElements, rawGhost.insertAt)
                : 0;
              const ghost = rawGhost
                ? {
                    ...rawGhost,
                    insertAt: ghostInsertAt,
                    isLast: ghostInsertAt >= itemElements.length,
                  }
                : null;
              const itemChunks = chunkCatagoriesElementsForInlineRows(itemElements);
              const chunkSortableItems = itemChunks.map((chunk) => {
                if (chunk.kind === "single") {
                  return {
                    id: `${String(chunk.item?.id || "no-id")}::single::${chunk.startIndex}`,
                    startIndex: chunk.startIndex,
                  };
                }
                return {
                  id: `${String(chunk.items?.[0]?.id || "no-id")}::${chunk.kind}::${chunk.startIndex}`,
                  startIndex: chunk.startIndex,
                };
              });
              const sortableIds = chunkSortableItems.map((entry) => entry.id);

              const handleDragEnd = (event) => {
                const { active, over } = event;
                if (!over || active.id === over.id) return;
                const from = chunkSortableItems.find(
                  (entry) => entry.id === String(active.id || "")
                )?.startIndex;
                const to = chunkSortableItems.find(
                  (entry) => entry.id === String(over.id || "")
                )?.startIndex;
                if (from === -1 || to === -1) return;
                if (!Number.isInteger(from) || !Number.isInteger(to)) return;
                if (from !== to) {
                  onTabElementsReorder?.(String(item?.id || ""), from, to);
                }
              };
              const handleDragStart = (event) => {
                void event;
              };
              const handleDragCancel = () => {
                // no-op: keep handler for parity
              };

                return (
                  <div key={String(item?.id || `ctg-${idx}`)} className="min-w-0">
                  {(() => {
                    const showAreaFrame = builderMode === "Layout Mode";
                    const areaClass = ghost
                      ? "border border-dashed border-slate-300/40 bg-slate-50/40 dark:border-slate-400/40 dark:bg-white/5"
                      : hasElements
                        ? "border border-dashed border-slate-300/40 bg-transparent dark:border-slate-400/40"
                        : "border border-dashed border-slate-300/40 bg-slate-50/30 dark:border-slate-400/40 dark:bg-white/5";
                    const editorClass = "border border-transparent bg-transparent";
                      return (
                    <div
                      className={`relative min-h-[72px] w-full px-3 py-2 text-[12px] transition-colors ${
                        showAreaFrame ? areaClass : editorClass
                      }`}
                      data-drop="TAB-CONTENT"
                      data-tab-element-id={String(elementData?.id || "")}
                      data-tab-id={String(item?.id || "")}
                      onDoubleClickCapture={(e) => {
                        if (
                          builderMode !== "Layout Mode" &&
                          builderMode !== "Editor Mode"
                        )
                          return;
                        const nestedDiv = e.target?.closest?.("[data-tab-nested-id]");
                        if (!nestedDiv) return;
                        const nestedId = nestedDiv.dataset?.tabNestedId;
                        if (!nestedId) return;
                        const el = (item?.elements || []).find(
                          (entry) => String(entry?.id) === nestedId
                        );
                        if (!el) return;
                        e.preventDefault();
                        e.stopPropagation();
                        onTabElementEdit?.(el, String(item?.id || ""));
                      }}
                      onDragOver={(e) => e.preventDefault()}
                    >
                      {hasElements ? (
                        <DndContext
                          sensors={sensors}
                          collisionDetection={collisionDetection}
                          measuring={{
                            droppable: { strategy: MeasuringStrategy.Always },
                          }}
                          onDragStart={handleDragStart}
                          onDragEnd={handleDragEnd}
                          onDragCancel={handleDragCancel}
                        >
                          <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
                            <div className="space-y-0">
                              {chunkCatagoriesElementsForInlineRows(item?.elements || []).map(
                                (chunk) => {
                                  if (chunk.kind === "btnRow") {
                                    const rowAlign = normalizeButtonRowAlign(
                                      chunk.items?.[0]?.buttonLayoutAlign
                                    );
                                    const rowSortableId = `${String(chunk.items?.[0]?.id || "no-id")}::btnRow::${chunk.startIndex}`;
                                    const rowStart = chunk.startIndex;
                                    const rowEndExclusive = rowStart + (chunk.items?.length || 0);
                                    return (
                                      <SortableCatagoriesItem
                                        key={rowSortableId}
                                        id={rowSortableId}
                                        builderMode={builderMode}
                                      >
                                      <div
                                        className="flow-root"
                                        data-tab-inline-row-start={String(rowStart)}
                                        data-tab-inline-row-end={String(Math.max(rowStart, rowEndExclusive - 1))}
                                      >
                                      {ghost &&
                                        !ghost.isLast &&
                                        ghost.insertAt === rowStart &&
                                        ghost.ghostEl}
                                      <div
                                        className="mb-0 flex w-full flex-row flex-nowrap items-center gap-2"
                                        style={{ justifyContent: rowAlign }}
                                      >
                                        {chunk.items.map((el, localIdx) => {
                                          const i = chunk.startIndex + localIdx;
                                          const elId = String(el?.id || `ctg-el-${idx}-${i}`);
                                          return (
                                            <div key={elId}>
                                              <div className="relative w-fit max-w-full flow-root">
                                                <div
                                                  className="relative w-fit max-w-full"
                                                  onClick={(e) => {
                                                    if (
                                                      e.detail === 2 &&
                                                      (builderMode === "Layout Mode" ||
                                                        builderMode === "Editor Mode")
                                                    ) {
                                                      e.preventDefault();
                                                      e.stopPropagation();
                                                      onTabElementEdit?.(
                                                        el,
                                                        String(item?.id || "")
                                                      );
                                                      return;
                                                    }
                                                    if (builderMode !== "Layout Mode")
                                                      return;
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    if (tabSelectedElId === el?.id) {
                                                      onTabElementSelect?.(
                                                        null,
                                                        String(item?.id || "")
                                                      );
                                                    } else {
                                                      onTabElementSelect?.(
                                                        el,
                                                        String(item?.id || "")
                                                      );
                                                    }
                                                  }}
                                                >
                                                  <div
                                                    data-tab-nested-id={String(el?.id || "")}
                                                    className={`transition-transform duration-200 ${
                                                      builderMode === "Editor Mode"
                                                        ? "transform-gpu hover:scale-[1.02]"
                                                        : ""
                                                    }`}
                                                  >
                                                    {(() => {
                                                      const isSelectedTextInLayoutMode =
                                                        builderMode ===
                                                          "Layout Mode" &&
                                                        tabSelectedElId === el?.id &&
                                                        ["text", "txt"].includes(
                                                          String(el?.type || "")
                                                        );
                                                      const isSelectedButtonInLayoutMode =
                                                        builderMode ===
                                                          "Layout Mode" &&
                                                        tabSelectedElId === el?.id &&
                                                        ["btn", "btnG"].includes(
                                                          String(el?.type || "")
                                                        );
                                                      const isSelectedIconInLayoutMode =
                                                        builderMode ===
                                                          "Layout Mode" &&
                                                        tabSelectedElId === el?.id &&
                                                        String(el?.type || "") === "icon";
                                                      const isSelectedCounterInLayoutMode =
                                                        builderMode ===
                                                          "Layout Mode" &&
                                                        tabSelectedElId === el?.id &&
                                                        String(el?.type || "") === "ctn";
                                                      const isSelectedHeadingInLayoutMode =
                                                        builderMode ===
                                                          "Layout Mode" &&
                                                        tabSelectedElId === el?.id &&
                                                        String(el?.type || "") === "heading";
                                                      const isSelectedDividerInLayoutMode =
                                                        builderMode ===
                                                          "Layout Mode" &&
                                                        tabSelectedElId === el?.id &&
                                                        String(el?.type || "") === "divider";
                                                      const useInnerSelectionFrame =
                                                        isSelectedTextInLayoutMode ||
                                                        isSelectedButtonInLayoutMode ||
                                                        isSelectedIconInLayoutMode ||
                                                        isSelectedCounterInLayoutMode ||
                                                        isSelectedHeadingInLayoutMode ||
                                                        isSelectedDividerInLayoutMode;
                                                      const frameAlignClass =
                                                        selectionFrameAlignClass(el);
                                                      const isDivider = String(el?.type || "") === "divider";
                                                      return (
                                                        <div
                                                          className={
                                                            useInnerSelectionFrame
                                                              ? isDivider
                                                                ? "relative block w-full max-w-full"
                                                                : `relative block w-fit max-w-full ${frameAlignClass}`
                                                              : ""
                                                          }
                                                        >
                                                          <div
                                                            className={
                                                              useInnerSelectionFrame
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
                                                                String(item?.id || "")
                                                              )
                                                            ) : (
                                                              <div className="rounded-md border border-slate-200 bg-white px-2.5 py-2 text-left text-[12px] text-slate-700 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200">
                                                                <span className="font-semibold">
                                                                  {String(
                                                                    el?.type ||
                                                                      "element"
                                                                  ).toUpperCase()}
                                                                </span>
                                                                <span className="mx-1 text-slate-400">
                                                                  -
                                                                </span>
                                                                <span>
                                                                  {String(
                                                                    el?.id ||
                                                                      "no-id"
                                                                  )}
                                                                </span>
                                                              </div>
                                                            )}
                                                          </div>
                                                          {useInnerSelectionFrame && (
                                                            <>
                                                              <div className="pointer-events-none absolute left-[-4px] right-[-4px] top-[1px] bottom-[1px] rounded-md bg-red-300/10" />
                                                              <span className="pointer-events-none absolute left-[-2px] top-[2px] h-2.5 w-2.5 border-l-2 border-t-2 border-red-400" />
                                                              <span className="pointer-events-none absolute right-[-2px] top-[2px] h-2.5 w-2.5 border-r-2 border-t-2 border-red-400" />
                                                              <span className="pointer-events-none absolute bottom-[2px] left-[-2px] h-2.5 w-2.5 border-b-2 border-l-2 border-red-400" />
                                                              <span className="pointer-events-none absolute bottom-[2px] right-[-2px] h-2.5 w-2.5 border-b-2 border-r-2 border-red-400" />
                                                            </>
                                                          )}
                                                        </div>
                                                      );
                                                    })()}
                                                  </div>
                                                  {builderMode === "Layout Mode" &&
                                                    tabSelectedElId === el?.id &&
                                                    !["text", "txt", "btn", "btnG", "icon", "ctn", "heading", "divider"].includes(
                                                      String(el?.type || "")
                                                    ) && (
                                                      <div className="pointer-events-none absolute -inset-x-3 inset-y-0 rounded border border-dashed border-red-400 bg-red-300/10" />
                                                    )}
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                      {ghost &&
                                        ghost.isLast &&
                                        rowEndExclusive ===
                                          (item?.elements || []).length &&
                                        ghost.ghostEl}
                                      </div>
                                      </SortableCatagoriesItem>
                                    );
                                  }
                                  if (chunk.kind === "iconRow") {
                                    const rowAlign = normalizeIconRowAlign(
                                      chunk.items?.[0]?.iconLayoutAlign
                                    );
                                    const iconRowGap = (() => {
                                      const rawGap = Number(chunk.items?.[0]?.iconRowGap);
                                      const gap = Number.isFinite(rawGap) ? rawGap : 8;
                                      return Math.max(0, Math.min(80, gap));
                                    })();
                                    const iconRowHasDivider = chunk.items.some(
                                      (it, idx) =>
                                        idx < chunk.items.length - 1 &&
                                        it?.iconRowDividerEnabled === true
                                    );
                                    const iconRowSortableId = `${String(chunk.items?.[0]?.id || "no-id")}::iconRow::${chunk.startIndex}`;
                                    const rowStart = chunk.startIndex;
                                    const rowEndExclusive = rowStart + (chunk.items?.length || 0);
                                    return (
                                      <SortableCatagoriesItem
                                        key={iconRowSortableId}
                                        id={iconRowSortableId}
                                        builderMode={builderMode}
                                      >
                                      <div
                                        className="flow-root"
                                        data-tab-inline-row-start={String(rowStart)}
                                        data-tab-inline-row-end={String(Math.max(rowStart, rowEndExclusive - 1))}
                                      >
                                      {ghost &&
                                        !ghost.isLast &&
                                        ghost.insertAt === rowStart &&
                                        ghost.ghostEl}
                                      <div
                                        className="mb-0 flex w-full flex-row flex-nowrap items-center"
                                        style={{
                                          justifyContent: rowAlign,
                                          columnGap: iconRowHasDivider
                                            ? 0
                                            : iconRowGap,
                                        }}
                                      >
                                        {chunk.items.map((el, localIdx) => {
                                          const i = chunk.startIndex + localIdx;
                                          const showIconDivider =
                                            localIdx < chunk.items.length - 1 &&
                                            el?.iconRowDividerEnabled === true;
                                          const iconDividerColor = resolveDividerColor(
                                            theme,
                                            el?.iconRowDividerColor,
                                            el?.iconRowDividerOpacity,
                                            "#334155"
                                          );
                                          const iconDividerStyleRaw = String(
                                            el?.iconRowDividerStyle || "solid"
                                          )
                                            .trim()
                                            .toLowerCase();
                                          const iconDividerStyle =
                                            iconDividerStyleRaw === "dashed" ||
                                            iconDividerStyleRaw === "dotted"
                                              ? iconDividerStyleRaw
                                              : "solid";
                                          const iconDividerHeight = Math.max(
                                            20,
                                            Math.min(160, Number(el?.containerSize) || 64)
                                          );
                                          return (
                                            <div
                                              key={`${String(el?.id || `ctg-el-${idx}-${i}`)}::${i}`}
                                              className="flex items-stretch"
                                            >
                                              <div className="relative flow-root">
                                                <div
                                                  className="relative w-fit max-w-full"
                                                  onClick={(e) => {
                                                    if (
                                                      e.detail === 2 &&
                                                      (builderMode === "Layout Mode" ||
                                                        builderMode === "Editor Mode")
                                                    ) {
                                                      e.preventDefault();
                                                      e.stopPropagation();
                                                      onTabElementEdit?.(
                                                        el,
                                                        String(item?.id || "")
                                                      );
                                                      return;
                                                    }
                                                    if (builderMode !== "Layout Mode")
                                                      return;
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    if (tabSelectedElId === el?.id) {
                                                      onTabElementSelect?.(
                                                        null,
                                                        String(item?.id || "")
                                                      );
                                                    } else {
                                                      onTabElementSelect?.(
                                                        el,
                                                        String(item?.id || "")
                                                      );
                                                    }
                                                  }}
                                                >
                                                  <div
                                                    data-tab-nested-id={String(el?.id || "")}
                                                    className={`transition-transform duration-200 ${
                                                      builderMode === "Editor Mode"
                                                        ? "transform-gpu hover:scale-[1.02]"
                                                        : ""
                                                    }`}
                                                  >
                                                    {(() => {
                                                      const isSelectedTextInLayoutMode =
                                                        builderMode ===
                                                          "Layout Mode" &&
                                                        tabSelectedElId === el?.id &&
                                                        ["text", "txt"].includes(
                                                          String(el?.type || "")
                                                        );
                                                      const isSelectedButtonInLayoutMode =
                                                        builderMode ===
                                                          "Layout Mode" &&
                                                        tabSelectedElId === el?.id &&
                                                        ["btn", "btnG"].includes(
                                                          String(el?.type || "")
                                                        );
                                                      const isSelectedIconInLayoutMode =
                                                        builderMode ===
                                                          "Layout Mode" &&
                                                        tabSelectedElId === el?.id &&
                                                        String(el?.type || "") === "icon";
                                                      const isSelectedCounterInLayoutMode =
                                                        builderMode ===
                                                          "Layout Mode" &&
                                                        tabSelectedElId === el?.id &&
                                                        String(el?.type || "") === "ctn";
                                                      const isSelectedHeadingInLayoutMode =
                                                        builderMode ===
                                                          "Layout Mode" &&
                                                        tabSelectedElId === el?.id &&
                                                        String(el?.type || "") === "heading";
                                                      const isSelectedDividerInLayoutMode =
                                                        builderMode ===
                                                          "Layout Mode" &&
                                                        tabSelectedElId === el?.id &&
                                                        String(el?.type || "") === "divider";
                                                    const isSelectedImageLikeInLayoutMode =
                                                      builderMode ===
                                                        "Layout Mode" &&
                                                      tabSelectedElId === el?.id &&
                                                      ["img", "imgh", "imgo", "bnr", "lbx", "vid"].includes(
                                                        String(el?.type || "")
                                                      );
                                                      const useInnerSelectionFrame =
                                                        isSelectedTextInLayoutMode ||
                                                        isSelectedButtonInLayoutMode ||
                                                        isSelectedIconInLayoutMode ||
                                                        isSelectedCounterInLayoutMode ||
                                                        isSelectedHeadingInLayoutMode ||
                                                        isSelectedDividerInLayoutMode;
                                                      const frameAlignClass =
                                                        selectionFrameAlignClass(el);
                                                      const preserveAlignWhenSingleUnselected =
                                                        ["btn", "btnG", "icon"].includes(
                                                          String(el?.type || "")
                                                        );
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
                                                      const selectionWrapperClass =
                                                        isSelectedImageLikeInLayoutMode
                                                          ? "relative block w-full max-w-full"
                                                          : useInnerSelectionFrame
                                                            ? `relative block w-fit max-w-full ${frameAlignClass}`
                                                            : preserveAlignWhenSingleUnselected
                                                              ? `block w-fit max-w-full ${frameAlignClass}`
                                                            : "";
                                                      return (
                                                        <div
                                                          className={selectionWrapperClass}
                                                        >
                                                          {isSelectedImageLikeInLayoutMode && (
                                                            <div
                                                              className="pointer-events-none absolute inset-0 z-[11] bg-red-500/45"
                                                              style={
                                                                imageBorderRadiusStyle
                                                              }
                                                            />
                                                          )}
                                                          <div
                                                            className={
                                                              useInnerSelectionFrame
                                                                ? "w-fit max-w-full origin-center scale-[0.85] transform-gpu transition-transform duration-150"
                                                                : ""
                                                            }
                                                          >
                                                            {typeof renderTabElement ===
                                                            "function" ? (
                                                              renderTabElement(
                                                              isSelectedImageLikeInLayoutMode
                                                                ? {
                                                                    ...el,
                                                                    __dtsSuppressImageSelectedOverlay: true,
                                                                    __selectedOverlayClass:
                                                                      "bg-transparent",
                                                                  }
                                                                : el,
                                                                i,
                                                                String(item?.id || "")
                                                              )
                                                            ) : (
                                                              <div className="rounded-md border border-slate-200 bg-white px-2.5 py-2 text-left text-[12px] text-slate-700 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200">
                                                                <span className="font-semibold">
                                                                  {String(
                                                                    el?.type ||
                                                                      "element"
                                                                  ).toUpperCase()}
                                                                </span>
                                                                <span className="mx-1 text-slate-400">
                                                                  -
                                                                </span>
                                                                <span>
                                                                  {String(
                                                                    el?.id ||
                                                                      "no-id"
                                                                  )}
                                                                </span>
                                                              </div>
                                                            )}
                                                          </div>
                                                          {useInnerSelectionFrame && (
                                                            <>
                                                              <div className="pointer-events-none absolute inset-[1px] rounded-md bg-red-300/10" />
                                                              <span className="pointer-events-none absolute left-[2px] top-[2px] h-2.5 w-2.5 border-l-2 border-t-2 border-red-400" />
                                                              <span className="pointer-events-none absolute right-[2px] top-[2px] h-2.5 w-2.5 border-r-2 border-t-2 border-red-400" />
                                                              <span className="pointer-events-none absolute bottom-[2px] left-[2px] h-2.5 w-2.5 border-b-2 border-l-2 border-red-400" />
                                                              <span className="pointer-events-none absolute bottom-[2px] right-[2px] h-2.5 w-2.5 border-b-2 border-r-2 border-red-400" />
                                                            </>
                                                          )}
                                                        </div>
                                                      );
                                                    })()}
                                                  </div>
                                                  {builderMode === "Layout Mode" &&
                                                    tabSelectedElId === el?.id &&
                                                  ![
                                                    "text",
                                                    "txt",
                                                    "btn",
                                                    "btnG",
                                                    "icon",
                                                    "ctn",
                                                    "img",
                                                    "imgh",
                                                    "imgo",
                                                    "bnr",
                                                    "lbx",
                                                    "vid",
                                                  ].includes(
                                                      String(el?.type || "")
                                                    ) && (
                                                      <div className="pointer-events-none absolute -inset-x-3 inset-y-0 rounded border border-dashed border-red-400 bg-red-300/10" />
                                                    )}
                                                </div>
                                              </div>
                                              {showIconDivider && (
                                                <div
                                                  className="pointer-events-none flex items-center"
                                                  style={{
                                                    marginLeft: iconRowGap / 2,
                                                    marginRight: iconRowGap / 2,
                                                  }}
                                                >
                                                  <span
                                                    className="block"
                                                    style={{
                                                      height: iconDividerHeight,
                                                      borderLeftWidth: 1,
                                                      borderLeftStyle: iconDividerStyle,
                                                      borderLeftColor: iconDividerColor,
                                                    }}
                                                  />
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                      {ghost &&
                                        ghost.isLast &&
                                        rowEndExclusive ===
                                          (item?.elements || []).length &&
                                        ghost.ghostEl}
                                      </div>
                                      </SortableCatagoriesItem>
                                    );
                                  }
                                  if (chunk.kind === "counterRow") {
                                    const rowAlign = normalizeCounterRowAlign(
                                      chunk.items?.[0]?.counterRowAlign ??
                                        chunk.items?.[0]?.counterAlign
                                    );
                                    const counterRowGap = (() => {
                                      const rawGap = Number(
                                        chunk.items?.[0]?.counterRowGap
                                      );
                                      const gap = Number.isFinite(rawGap)
                                        ? rawGap
                                        : 8;
                                      return Math.max(0, Math.min(80, gap));
                                    })();
                                    const counterRowHasDivider = chunk.items.some(
                                      (it, idx) =>
                                        idx < chunk.items.length - 1 &&
                                        it?.counterRowDividerEnabled === true
                                    );
                                    const counterRowSortableId = `${String(chunk.items?.[0]?.id || "no-id")}::counterRow::${chunk.startIndex}`;
                                    const rowStart = chunk.startIndex;
                                    const rowEndExclusive = rowStart + (chunk.items?.length || 0);
                                    return (
                                      <SortableCatagoriesItem
                                        key={counterRowSortableId}
                                        id={counterRowSortableId}
                                        builderMode={builderMode}
                                      >
                                      <div
                                        className="flow-root"
                                        data-tab-inline-row-start={String(rowStart)}
                                        data-tab-inline-row-end={String(Math.max(rowStart, rowEndExclusive - 1))}
                                      >
                                      {ghost &&
                                        !ghost.isLast &&
                                        ghost.insertAt === rowStart &&
                                        ghost.ghostEl}
                                      <div
                                        className="mb-0 flex w-full flex-row flex-nowrap items-center"
                                        style={{
                                          justifyContent: rowAlign,
                                          columnGap: counterRowHasDivider
                                            ? 0
                                            : counterRowGap,
                                        }}
                                      >
                                        {chunk.items.map((el, localIdx) => {
                                          const i = chunk.startIndex + localIdx;
                                          const showCounterDivider =
                                            localIdx < chunk.items.length - 1 &&
                                            el?.counterRowDividerEnabled === true;
                                          const counterDividerColor =
                                            resolveDividerColor(
                                              theme,
                                              el?.counterRowDividerColor,
                                              el?.counterRowDividerOpacity,
                                              "#334155"
                                            );
                                          const counterDividerStyleRaw =
                                            String(
                                              el?.counterRowDividerStyle ||
                                                "solid"
                                            )
                                              .trim()
                                              .toLowerCase();
                                          const counterDividerStyle =
                                            counterDividerStyleRaw === "dashed" ||
                                            counterDividerStyleRaw === "dotted"
                                              ? counterDividerStyleRaw
                                              : "solid";
                                          const counterDividerHeight = Math.max(
                                            20,
                                            Math.min(
                                              160,
                                              Number(el?.counterFontSize) || 42
                                            )
                                          );
                                          return (
                                            <div
                                              key={`${String(el?.id || `ctg-el-${idx}-${i}`)}::${i}`}
                                              className="flex items-stretch"
                                            >
                                              <div className="relative w-fit max-w-full flow-root">
                                                <div
                                                  className="relative w-fit max-w-full"
                                                  onClick={(e) => {
                                                    if (
                                                      e.detail === 2 &&
                                                      (builderMode === "Layout Mode" ||
                                                        builderMode === "Editor Mode")
                                                    ) {
                                                      e.preventDefault();
                                                      e.stopPropagation();
                                                      onTabElementEdit?.(
                                                        el,
                                                        String(item?.id || "")
                                                      );
                                                      return;
                                                    }
                                                    if (builderMode !== "Layout Mode")
                                                      return;
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    if (tabSelectedElId === el?.id) {
                                                      onTabElementSelect?.(
                                                        null,
                                                        String(item?.id || "")
                                                      );
                                                    } else {
                                                      onTabElementSelect?.(
                                                        el,
                                                        String(item?.id || "")
                                                      );
                                                    }
                                                  }}
                                                >
                                                  <div
                                                    data-tab-nested-id={String(el?.id || "")}
                                                    className={`transition-transform duration-200 ${
                                                      builderMode === "Editor Mode"
                                                        ? "transform-gpu hover:scale-[1.02]"
                                                        : ""
                                                    }`}
                                                  >
                                                    {(() => {
                                                      const isSelectedTextInLayoutMode =
                                                        builderMode ===
                                                          "Layout Mode" &&
                                                        tabSelectedElId === el?.id &&
                                                        ["text", "txt"].includes(
                                                          String(el?.type || "")
                                                        );
                                                      const isSelectedButtonInLayoutMode =
                                                        builderMode ===
                                                          "Layout Mode" &&
                                                        tabSelectedElId === el?.id &&
                                                        ["btn", "btnG"].includes(
                                                          String(el?.type || "")
                                                        );
                                                      const isSelectedIconInLayoutMode =
                                                        builderMode ===
                                                          "Layout Mode" &&
                                                        tabSelectedElId === el?.id &&
                                                        String(el?.type || "") === "icon";
                                                      const isSelectedCounterInLayoutMode =
                                                        builderMode ===
                                                          "Layout Mode" &&
                                                        tabSelectedElId === el?.id &&
                                                        String(el?.type || "") === "ctn";
                                                      const isSelectedHeadingInLayoutMode =
                                                        builderMode ===
                                                          "Layout Mode" &&
                                                        tabSelectedElId === el?.id &&
                                                        String(el?.type || "") === "heading";
                                                      const isSelectedDividerInLayoutMode =
                                                        builderMode ===
                                                          "Layout Mode" &&
                                                        tabSelectedElId === el?.id &&
                                                        String(el?.type || "") === "divider";
                                                      const isSelectedImageLikeInLayoutMode =
                                                        builderMode ===
                                                          "Layout Mode" &&
                                                        tabSelectedElId === el?.id &&
                                                        ["img", "imgh", "imgo", "bnr", "lbx", "vid"].includes(
                                                          String(el?.type || "")
                                                        );
                                                      const useInnerSelectionFrame =
                                                        isSelectedTextInLayoutMode ||
                                                        isSelectedButtonInLayoutMode ||
                                                        isSelectedIconInLayoutMode ||
                                                        isSelectedCounterInLayoutMode ||
                                                        isSelectedHeadingInLayoutMode ||
                                                        isSelectedDividerInLayoutMode;
                                                      const isDivider =
                                                        String(el?.type || "") ===
                                                        "divider";
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
                                                      const selectionWrapperClass =
                                                        isSelectedImageLikeInLayoutMode
                                                          ? "relative block w-full max-w-full"
                                                          : useInnerSelectionFrame
                                                            ? isDivider
                                                              ? "relative block w-full max-w-full"
                                                              : `relative block w-fit max-w-full ${selectionFrameAlignClass(
                                                                  el
                                                                )}`
                                                            : "";
                                                      return (
                                                        <div
                                                          className={selectionWrapperClass}
                                                        >
                                                          {isSelectedImageLikeInLayoutMode && (
                                                            <div
                                                              className="pointer-events-none absolute inset-0 z-[11] bg-red-500/45"
                                                              style={
                                                                imageBorderRadiusStyle
                                                              }
                                                            />
                                                          )}
                                                          <div
                                                            className={
                                                              useInnerSelectionFrame
                                                              ? isDivider
                                                                ? "w-full origin-center scale-[0.85] transform-gpu transition-transform duration-150 pt-[16px]"
                                                                : "w-fit max-w-full origin-center scale-[0.85] transform-gpu transition-transform duration-150"
                                                                : ""
                                                            }
                                                          >
                                                            {typeof renderTabElement ===
                                                            "function" ? (
                                                              renderTabElement(
                                                                isSelectedImageLikeInLayoutMode
                                                                  ? {
                                                                      ...el,
                                                                      __dtsSuppressImageSelectedOverlay: true,
                                                                      __selectedOverlayClass:
                                                                        "bg-transparent",
                                                                    }
                                                                  : el,
                                                                i,
                                                                String(item?.id || "")
                                                              )
                                                            ) : (
                                                              <div className="rounded-md border border-slate-200 bg-white px-2.5 py-2 text-left text-[12px] text-slate-700 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200">
                                                                <span className="font-semibold">
                                                                  {String(
                                                                    el?.type ||
                                                                      "element"
                                                                  ).toUpperCase()}
                                                                </span>
                                                                <span className="mx-1 text-slate-400">
                                                                  -
                                                                </span>
                                                                <span>
                                                                  {String(
                                                                    el?.id ||
                                                                      "no-id"
                                                                  )}
                                                                </span>
                                                              </div>
                                                            )}
                                                          </div>
                                                          {useInnerSelectionFrame && (
                                                            <>
                                                              <div className="pointer-events-none absolute inset-[1px] rounded-md bg-red-300/10" />
                                                              <span className="pointer-events-none absolute left-[2px] top-[2px] h-2.5 w-2.5 border-l-2 border-t-2 border-red-400" />
                                                              <span className="pointer-events-none absolute right-[2px] top-[2px] h-2.5 w-2.5 border-r-2 border-t-2 border-red-400" />
                                                              <span className="pointer-events-none absolute bottom-[2px] left-[2px] h-2.5 w-2.5 border-b-2 border-l-2 border-red-400" />
                                                              <span className="pointer-events-none absolute bottom-[2px] right-[2px] h-2.5 w-2.5 border-b-2 border-r-2 border-red-400" />
                                                            </>
                                                          )}
                                                        </div>
                                                      );
                                                    })()}
                                                  </div>
                                                  {builderMode === "Layout Mode" &&
                                                    tabSelectedElId === el?.id &&
                                                    ![
                                                      "text",
                                                      "txt",
                                                      "btn",
                                                      "btnG",
                                                      "icon",
                                                      "ctn",
                                                    "heading",
                                                    "divider",
                                                      "img",
                                                      "imgh",
                                                      "imgo",
                                                      "bnr",
                                                      "lbx",
                                                      "vid",
                                                    ].includes(String(el?.type || "")) && (
                                                      <div className="pointer-events-none absolute -inset-x-3 inset-y-0 rounded border border-dashed border-red-400 bg-red-300/10" />
                                                    )}
                                                </div>
                                              </div>
                                              {showCounterDivider && (
                                                <div
                                                  className="pointer-events-none flex items-center"
                                                  style={{
                                                    marginLeft: counterRowGap / 2,
                                                    marginRight: counterRowGap / 2,
                                                  }}
                                                >
                                                  <span
                                                    className="block"
                                                    style={{
                                                      height: counterDividerHeight,
                                                      borderLeftWidth: 1,
                                                      borderLeftStyle:
                                                        counterDividerStyle,
                                                      borderLeftColor:
                                                        counterDividerColor,
                                                    }}
                                                  />
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                      {ghost &&
                                        ghost.isLast &&
                                        rowEndExclusive ===
                                          (item?.elements || []).length &&
                                        ghost.ghostEl}
                                      </div>
                                      </SortableCatagoriesItem>
                                    );
                                  }

                                  const el = chunk.item;
                                  const i = chunk.startIndex;
                                  return (
                                <div key={`${String(el?.id || `ctg-el-${idx}-${i}`)}::${i}`} className="flow-root">
                                  {ghost && !ghost.isLast && ghost.insertAt === i && ghost.ghostEl}
                                  <SortableCatagoriesItem
                                    id={`${String(el?.id || `ctg-el-${idx}-${i}`)}::single::${i}`}
                                    builderMode={builderMode}
                                    onClick={(e) => {
                                      if (
                                        e.detail === 2 &&
                                        (builderMode === "Layout Mode" ||
                                          builderMode === "Editor Mode")
                                      ) {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onTabElementEdit?.(el, String(item?.id || ""));
                                        return;
                                      }
                                      if (builderMode !== "Layout Mode") return;
                                      e.preventDefault();
                                      e.stopPropagation();
                                      if (tabSelectedElId === el?.id) {
                                        onTabElementSelect?.(null, String(item?.id || ""));
                                      } else {
                                        onTabElementSelect?.(el, String(item?.id || ""));
                                      }
                                    }}
                                  >
                                    <div
                                      data-tab-nested-id={String(el?.id || "")}
                                      className={`transition-transform duration-200 ${
                                        builderMode === "Editor Mode"
                                          ? "transform-gpu hover:scale-[1.02]"
                                          : ""
                                      }`}
                                    >
                                      {(() => {
                                        const isSelectedTextInLayoutMode =
                                          builderMode === "Layout Mode" &&
                                          tabSelectedElId === el?.id &&
                                          ["text", "txt"].includes(String(el?.type || ""));
                                        const isSelectedButtonInLayoutMode =
                                          builderMode === "Layout Mode" &&
                                          tabSelectedElId === el?.id &&
                                          ["btn", "btnG"].includes(String(el?.type || ""));
                                        const isSelectedIconInLayoutMode =
                                          builderMode === "Layout Mode" &&
                                          tabSelectedElId === el?.id &&
                                          String(el?.type || "") === "icon";
                                        const isSelectedCounterInLayoutMode =
                                          builderMode === "Layout Mode" &&
                                          tabSelectedElId === el?.id &&
                                          String(el?.type || "") === "ctn";
                                        const isSelectedHeadingInLayoutMode =
                                          builderMode === "Layout Mode" &&
                                          tabSelectedElId === el?.id &&
                                          String(el?.type || "") === "heading";
                                        const isSelectedDividerInLayoutMode =
                                          builderMode === "Layout Mode" &&
                                          tabSelectedElId === el?.id &&
                                          String(el?.type || "") === "divider";
                                        const isSelectedImageLikeInLayoutMode =
                                          builderMode === "Layout Mode" &&
                                          tabSelectedElId === el?.id &&
                                          ["img", "imgh", "imgo", "bnr", "lbx", "vid"].includes(
                                            String(el?.type || "")
                                          );
                                        const useInnerSelectionFrame =
                                          isSelectedTextInLayoutMode ||
                                          isSelectedButtonInLayoutMode ||
                                          isSelectedIconInLayoutMode ||
                                          isSelectedCounterInLayoutMode ||
                                          isSelectedHeadingInLayoutMode ||
                                          isSelectedDividerInLayoutMode;
                                        const frameAlignClass =
                                          selectionFrameAlignClass(el);
                                        const preserveAlignWhenSingleUnselected =
                                          ["btn", "btnG", "icon"].includes(
                                            String(el?.type || "")
                                          );
                                        const isDivider = String(el?.type || "") === "divider";
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
                                        const selectionWrapperClass =
                                          isSelectedImageLikeInLayoutMode
                                            ? "relative block w-full max-w-full"
                                            : useInnerSelectionFrame
                                              ? isDivider
                                                ? "relative block w-full max-w-full"
                                                : `relative block w-fit max-w-full ${frameAlignClass}`
                                              : preserveAlignWhenSingleUnselected
                                                ? `block w-fit max-w-full ${frameAlignClass}`
                                              : "";
                                        return (
                                          <div
                                            className={selectionWrapperClass}
                                          >
                                            {isSelectedImageLikeInLayoutMode && (
                                              <div
                                                className="pointer-events-none absolute inset-0 z-[11] bg-red-500/45"
                                                style={imageBorderRadiusStyle}
                                              />
                                            )}
                                            <div
                                              className={
                                                useInnerSelectionFrame
                                                  ? isDivider
                                                    ? "w-full origin-center scale-[0.85] transform-gpu transition-transform duration-150 pt-[16px]"
                                                    : "w-fit max-w-full origin-center scale-[0.85] transform-gpu transition-transform duration-150"
                                                  : ""
                                              }
                                            >
                                              {typeof renderTabElement === "function" ? (
                                                renderTabElement(
                                                  isSelectedImageLikeInLayoutMode
                                                    ? {
                                                        ...el,
                                                        __dtsSuppressImageSelectedOverlay: true,
                                                        __selectedOverlayClass:
                                                          "bg-transparent",
                                                      }
                                                    : el,
                                                  i,
                                                  String(item?.id || "")
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
                                            {useInnerSelectionFrame && (
                                              <>
                                                <div className="pointer-events-none absolute left-[-4px] right-[-4px] top-[1px] bottom-[1px] rounded-md bg-red-300/10" />
                                                <span className="pointer-events-none absolute left-[-2px] top-[2px] h-2.5 w-2.5 border-l-2 border-t-2 border-red-400" />
                                                <span className="pointer-events-none absolute right-[-2px] top-[2px] h-2.5 w-2.5 border-r-2 border-t-2 border-red-400" />
                                                <span className="pointer-events-none absolute bottom-[2px] left-[-2px] h-2.5 w-2.5 border-b-2 border-l-2 border-red-400" />
                                                <span className="pointer-events-none absolute bottom-[2px] right-[-2px] h-2.5 w-2.5 border-b-2 border-r-2 border-red-400" />
                                              </>
                                            )}
                                          </div>
                                        );
                                      })()}
                                    </div>
                                    {builderMode === "Layout Mode" &&
                                      tabSelectedElId === el?.id &&
                                      ![
                                        "text",
                                        "txt",
                                        "btn",
                                        "btnG",
                                        "icon",
                                        "ctn",
                                        "heading",
                                        "divider",
                                        "img",
                                        "imgh",
                                        "imgo",
                                        "bnr",
                                        "lbx",
                                        "vid",
                                      ].includes(String(el?.type || "")) && (
                                      <div className="pointer-events-none absolute -inset-x-3 inset-y-0 rounded border border-dashed border-red-400 bg-red-300/10" />
                                    )}
                                  </SortableCatagoriesItem>
                                  {ghost &&
                                    ghost.isLast &&
                                    i === (item?.elements || []).length - 1 &&
                                    ghost.ghostEl}
                                </div>
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
                            <span className={`text-[11px] text-slate-400 dark:text-slate-500 ${
                              builderMode !== "Layout Mode" ? "hidden" : ""
                            }`}>
                              ลาก Element มาวางที่นี่
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                      );
                    })()}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {useLayoutSelectionFrame && (
          <>
            <div className="pointer-events-none absolute left-[-15px] right-[-15px] top-[-15px] bottom-[-15px] rounded-md bg-red-300/10" />
            <span className="pointer-events-none absolute left-[-15px] top-[-15px] h-2.5 w-2.5 border-l-2 border-t-2 border-red-400" />
            <span className="pointer-events-none absolute right-[-15px] top-[-15px] h-2.5 w-2.5 border-r-2 border-t-2 border-red-400" />
            <span className="pointer-events-none absolute bottom-[-15px] left-[-15px] h-2.5 w-2.5 border-b-2 border-l-2 border-red-400" />
            <span className="pointer-events-none absolute bottom-[-15px] right-[-15px] h-2.5 w-2.5 border-b-2 border-r-2 border-red-400" />
          </>
        )}
      </div>
    </div>
  );
};

export default Catagories;
