import { useMemo } from "react";
import { setColor } from "../../../../function";
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
import { mergeDataSliderElement } from "./dataSliderElementConfig";
import { isButtonFullWidthEnabled } from "./buttonElementConfig";

const SortableDataSliderItem = ({
  id,
  builderMode,
  children,
  onClick,
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
          ? `translate3d(${Math.round(transform.x)}px, ${Math.round(transform.y)}px, 0)`
          : undefined,
        transition: isDragging ? undefined : transition,
        opacity: isDragging ? 0.35 : 1,
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

function resolveNavColor(theme, raw, fallback = "#e2e8f0", opacity = 255) {
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

function normalizeButtonRowAlign(v) {
  const raw = String(v || "").trim();
  if (raw === "end") return "flex-end";
  if (raw === "center") return "center";
  return "flex-start";
}

function normalizeCounterRowAlign(v) {
  const raw = String(v || "").trim();
  if (raw === "left" || raw === "start") return "flex-start";
  if (raw === "right" || raw === "end") return "flex-end";
  return "center";
}

function chunkDataSliderElementsForInlineRows(elements) {
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
}

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

const DataSlider = ({
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
  onHostDoubleClick,
  onUpdate,
  theme,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );
  const data = mergeDataSliderElement(elementData);
  const items = data.dataSliderItems || [];
  const activeId = items.some((it) => it.id === data.dataSliderActiveId)
    ? data.dataSliderActiveId
    : items[0]?.id;
  const activeIndex = Math.max(
    0,
    items.findIndex((it) => it.id === activeId)
  );
  const perViewRaw =
    device === "Mobile"
      ? data?.dataSliderPerViewMobile
      : device === "Tablet"
        ? data?.dataSliderPerViewTablet
        : data?.dataSliderPerViewDesktop;
  const perView = Math.max(
    1,
    Math.min(items.length || 1, Number(perViewRaw) || 1)
  );
  const gap = Math.max(0, Number(data?.dataSliderGap) || 0);
  const pageCount = Math.max(1, Math.ceil((items.length || 0) / Math.max(1, perView)));

  const visibleItems = useMemo(() => {
    if (!items.length) return [];
    const n = Math.min(perView, items.length);
    return Array.from({ length: n }, (_, i) => {
      const idx = (activeIndex + i) % items.length;
      return items[idx];
    });
  }, [items, perView, activeIndex]);
  const activePage = Math.min(
    pageCount - 1,
    Math.floor(activeIndex / Math.max(1, perView))
  );

  const marginTop = Math.max(
    0,
    Math.min(80, Number(data?.dataSliderMarginTop) || 8)
  );
  const marginBottom = Math.max(
    0,
    Math.min(80, Number(data?.dataSliderMarginBottom) || 8)
  );

  const navShape = data?.dataSliderNavShape === "circle" ? "circle" : "square";
  const activeDotColor = resolveNavColor(
    theme,
    data?.dataSliderNavActiveColor,
    "#0d9488",
    data?.dataSliderNavActiveColorOpacity
  );
  const inactiveDotColor = resolveNavColor(
    theme,
    data?.dataSliderNavColor,
    "#e2e8f0",
    data?.dataSliderNavColorOpacity
  );
  const imageLikeTypeSet = new Set(["img", "imgh", "imgo", "bnr", "lbx", "vid"]);
  const showAreaGuides = builderMode === "Layout Mode";

  return (
    <div
      className={`w-full ${animationForElement || ""} ${
        selected ? "relative rounded-md p-4" : ""
      }`}
      style={{ marginTop, marginBottom }}
      onMouseDownCapture={(e) => {
        if (builderMode !== "Layout Mode") return;
        if (e.detail !== 2) return;
        e.preventDefault();
        e.stopPropagation();
        onHostDoubleClick?.();
      }}
      onClickCapture={(e) => {
        if (builderMode !== "Layout Mode") return;
        if (e.detail === 2) {
          e.preventDefault();
          e.stopPropagation();
          onHostDoubleClick?.();
          return;
        }
        const isDotNav = e.target?.closest?.("[data-dts-dot-nav='true']");
        if (isDotNav) return;
        const nestedDiv = e.target?.closest?.("[data-tab-nested-id]");
        if (nestedDiv) return;
        e.stopPropagation();
        onTabElementSelect?.(null, String(activeId || ""));
      }}
      onDoubleClickCapture={(e) => {
        if (builderMode !== "Layout Mode") return;
        e.preventDefault();
        e.stopPropagation();
        onHostDoubleClick?.();
      }}
    >
      {selected && (
        <div className="pointer-events-none absolute inset-[1px] rounded-md bg-red-300/10" />
      )}
      <div className="relative">
        <div className="grid w-full" style={{ gap, gridTemplateColumns: `repeat(${Math.max(1, visibleItems.length)}, minmax(0, 1fr))` }}>
          {visibleItems.map((slide, slideIndex) => {
          const hasElements =
            Array.isArray(slide?.elements) && slide.elements.length > 0;
          const ghost =
            tabGhostData &&
            tabGhostData.ghostEl &&
            tabGhostData.tabId === String(slide?.id || "")
              ? tabGhostData
              : null;
          const isThisSlideHovered = !!ghost;
          const sortableIds = (slide?.elements || []).map((el) => String(el?.id || ""));

          const handleDragEnd = (event) => {
            const { active, over } = event;
            if (!over || active.id === over.id) return;
            const els = slide?.elements || [];
            const from = els.findIndex((e) => String(e?.id) === String(active.id));
            const to = els.findIndex((e) => String(e?.id) === String(over.id));
            if (from !== -1 && to !== -1) {
              onTabElementsReorder?.(String(slide?.id || ""), from, to);
            }
          };

          return (
            <div key={String(slide?.id || `dts-slide-${slideIndex}`)} className="min-w-0">
              <div
                className={`min-h-[72px] w-full px-3 py-2 text-[12px] transition-colors ${
                  !showAreaGuides
                    ? "border border-transparent bg-transparent"
                    : isThisSlideHovered
                    ? "border border-dashed border-blue-400 bg-blue-50 dark:border-blue-400/70 dark:bg-blue-900/10"
                    : hasElements
                      ? "border border-dashed border-slate-300 bg-transparent dark:border-white/20"
                      : "border border-dashed border-slate-300 bg-slate-50 dark:border-white/20 dark:bg-white/5"
                }`}
                data-drop="TAB-CONTENT"
                data-tab-element-id={String(elementData?.id || "")}
                data-tab-id={String(slide?.id || "")}
                onDoubleClickCapture={(e) => {
                  if (builderMode !== "Editor Mode") return;
                  const nestedDiv = e.target?.closest?.("[data-tab-nested-id]");
                  if (!nestedDiv) return;
                  const nestedId = nestedDiv.dataset?.tabNestedId;
                  if (!nestedId) return;
                  const el = (slide?.elements || []).find(
                    (entry) => String(entry?.id) === nestedId
                  );
                  if (!el) return;
                  e.preventDefault();
                  e.stopPropagation();
                  onTabElementEdit?.(el, String(slide?.id || ""));
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                {hasElements ? (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
                      <div className="space-y-0">
                        {chunkDataSliderElementsForInlineRows(slide?.elements || []).map(
                          (chunk, chunkIndex) => {
                            if (
                              chunk.kind === "btnRow" ||
                              chunk.kind === "iconRow" ||
                              chunk.kind === "counterRow"
                            ) {
                              const rowAlign =
                                chunk.kind === "counterRow"
                                  ? normalizeCounterRowAlign(
                                      chunk.items?.[0]?.counterRowAlign ??
                                        chunk.items?.[0]?.counterAlign
                                    )
                                  : normalizeButtonRowAlign(
                                      chunk.kind === "iconRow"
                                        ? chunk.items?.[0]?.iconLayoutAlign
                                        : chunk.items?.[0]?.buttonLayoutAlign
                                    );
                              const iconRowGap =
                                chunk.kind === "iconRow"
                                  ? (() => {
                                      const rawGap = Number(chunk.items?.[0]?.iconRowGap);
                                      const gap = Number.isFinite(rawGap) ? rawGap : 8;
                                      return Math.max(0, Math.min(80, gap));
                                    })()
                                  : 8;
                              const counterRowGap =
                                chunk.kind === "counterRow"
                                  ? (() => {
                                      const rawGap = Number(chunk.items?.[0]?.counterRowGap);
                                      const gap = Number.isFinite(rawGap) ? rawGap : 8;
                                      return Math.max(0, Math.min(80, gap));
                                    })()
                                  : 8;
                              const iconRowHasDivider =
                                chunk.kind === "iconRow" &&
                                chunk.items.some(
                                  (it, idx) =>
                                    idx < chunk.items.length - 1 &&
                                    it?.iconRowDividerEnabled === true
                                );
                              const counterRowHasDivider =
                                chunk.kind === "counterRow" &&
                                chunk.items.some(
                                  (it, idx) =>
                                    idx < chunk.items.length - 1 &&
                                    it?.counterRowDividerEnabled === true
                                );
                              return (
                                <div
                                  key={String(
                                    chunk.items?.[0]?.id ||
                                      `dts-btn-row-${slideIndex}-${chunkIndex}`
                                  )}
                                  className="mb-0 flex w-full flex-row flex-wrap items-center gap-y-2"
                                  style={{
                                    justifyContent: rowAlign,
                                    columnGap:
                                      chunk.kind === "iconRow"
                                        ? iconRowHasDivider
                                          ? 0
                                          : iconRowGap
                                        : chunk.kind === "counterRow"
                                          ? counterRowHasDivider
                                            ? 0
                                            : counterRowGap
                                          : 8,
                                  }}
                                >
                                  {chunk.items.map((el, localIdx) => {
                                    const i = chunk.startIndex + localIdx;
                                    const showIconDivider =
                                      chunk.kind === "iconRow" &&
                                      localIdx < chunk.items.length - 1 &&
                                      el?.iconRowDividerEnabled === true;
                                    const showCounterDivider =
                                      chunk.kind === "counterRow" &&
                                      localIdx < chunk.items.length - 1 &&
                                      el?.counterRowDividerEnabled === true;
                                    const iconDividerColor = resolveDividerColor(
                                      theme,
                                      el?.iconRowDividerColor,
                                      el?.iconRowDividerOpacity,
                                      "#334155"
                                    );
                                    const counterDividerColor = resolveDividerColor(
                                      theme,
                                      el?.counterRowDividerColor,
                                      el?.counterRowDividerOpacity,
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
                                    const counterDividerStyleRaw = String(
                                      el?.counterRowDividerStyle || "solid"
                                    )
                                      .trim()
                                      .toLowerCase();
                                    const counterDividerStyle =
                                      counterDividerStyleRaw === "dashed" ||
                                      counterDividerStyleRaw === "dotted"
                                        ? counterDividerStyleRaw
                                        : "solid";
                                    const iconDividerHeight = Math.max(
                                      20,
                                      Math.min(160, Number(el?.containerSize) || 64)
                                    );
                                    const counterDividerHeight = Math.max(
                                      20,
                                      Math.min(160, Number(el?.counterFontSize) || 42)
                                    );
                                    return (
                                      <div
                                        key={String(el?.id || `dts-el-${slideIndex}-${i}`)}
                                        className="flex items-stretch"
                                      >
                                        <div className="relative">
                                          {ghost &&
                                            !ghost.isLast &&
                                            ghost.insertAt === i &&
                                            ghost.ghostEl}
                                          {(() => {
                                          const isSelectedInLayoutMode =
                                            builderMode === "Layout Mode" &&
                                            tabSelectedElId === el?.id;
                                          const isImageLike = imageLikeTypeSet.has(
                                            String(el?.type || "")
                                          );
                                          const isDivider =
                                            String(el?.type || "") === "divider";
                                          const isIcon = String(el?.type || "") === "icon";
                                          const isCounter = String(el?.type || "") === "ctn";
                                          const widenSelectFrame = isIcon || isCounter;
                                          const keepCenterOnSelect =
                                            isSelectedInLayoutMode &&
                                            shouldKeepElementCenteredOnSelect(el);
                                          const useContentSelectionFrame =
                                            isSelectedInLayoutMode &&
                                            !isImageLike &&
                                            !isDivider;
                                          const frameAlignClass = selectionFrameAlignClass(el);
                                          return (
                                            <SortableDataSliderItem
                                              id={String(
                                                el?.id || `dts-el-${slideIndex}-${i}`
                                              )}
                                              builderMode={builderMode}
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
                                                    String(slide?.id || "")
                                                  );
                                                } else {
                                                  onTabElementSelect?.(
                                                    el,
                                                    String(slide?.id || "")
                                                  );
                                                }
                                              }}
                                            >
                                              <div
                                                data-tab-nested-id={String(el?.id || "")}
                                                className=""
                                              >
                                                {isSelectedInLayoutMode &&
                                                  isImageLike && (
                                                    <div className="pointer-events-none absolute inset-0 z-[11] rounded-md bg-red-300/80" />
                                                  )}
                                                <div className={useContentSelectionFrame ? `relative block w-fit max-w-full ${frameAlignClass}` : ""}>
                                                  <div
                                                    className={
                                                      isSelectedInLayoutMode && !isImageLike
                                                        ? isDivider
                                                          ? "w-full origin-center scale-[0.85] transform-gpu transition-transform duration-150"
                                                          : "w-fit max-w-full origin-center scale-[0.85] transform-gpu transition-transform duration-150"
                                                        : ""
                                                    }
                                                  >
                                                    {typeof renderTabElement === "function" ? (
                                                      renderTabElement(
                                                        el,
                                                        i,
                                                        String(slide?.id || "")
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
                                                          {String(el?.id || "no-id")}
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
                                              </div>
                                              {isSelectedInLayoutMode &&
                                                (isImageLike ? null : (
                                                  isDivider ? <>
                                                    <div className="pointer-events-none absolute left-[1px] right-[1px] top-[-4px] bottom-0 rounded-md bg-red-300/10" />
                                                    <span className="pointer-events-none absolute left-[2px] top-[-3px] h-2.5 w-2.5 border-l-2 border-t-2 border-red-400" />
                                                    <span className="pointer-events-none absolute right-[2px] top-[-3px] h-2.5 w-2.5 border-r-2 border-t-2 border-red-400" />
                                                    <span className="pointer-events-none absolute bottom-[1px] left-[2px] h-2.5 w-2.5 border-b-2 border-l-2 border-red-400" />
                                                    <span className="pointer-events-none absolute bottom-[1px] right-[2px] h-2.5 w-2.5 border-b-2 border-r-2 border-red-400" />
                                                  </> : null
                                                ))}
                                            </SortableDataSliderItem>
                                          );
                                        })()}
                                          {ghost &&
                                            ghost.isLast &&
                                            i === (slide?.elements || []).length - 1 &&
                                            ghost.ghostEl}
                                        </div>
                                        {(showIconDivider || showCounterDivider) && (
                                          <span
                                            className="pointer-events-none w-px"
                                            style={{
                                              marginLeft: showIconDivider
                                                ? iconRowGap / 2
                                                : counterRowGap / 2,
                                              marginRight: showIconDivider
                                                ? iconRowGap / 2
                                                : counterRowGap / 2,
                                              height: showIconDivider
                                                ? iconDividerHeight
                                                : counterDividerHeight,
                                              alignSelf: "center",
                                              backgroundColor: "transparent",
                                              borderLeftWidth: "1px",
                                              borderLeftStyle: showIconDivider
                                                ? iconDividerStyle
                                                : counterDividerStyle,
                                              borderLeftColor: showIconDivider
                                                ? iconDividerColor
                                                : counterDividerColor,
                                            }}
                                            aria-hidden="true"
                                          />
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            }

                            const el = chunk.item;
                            const i = chunk.startIndex;
                            return (
                              <div
                                key={String(el?.id || `dts-el-${slideIndex}-${i}`)}
                              >
                                {ghost && !ghost.isLast && ghost.insertAt === i && ghost.ghostEl}
                                {(() => {
                              const isSelectedInLayoutMode =
                                builderMode === "Layout Mode" && tabSelectedElId === el?.id;
                              const isImageLike = imageLikeTypeSet.has(String(el?.type || ""));
                              const isDivider = String(el?.type || "") === "divider";
                              const isIcon = String(el?.type || "") === "icon";
                              const isCounter = String(el?.type || "") === "ctn";
                              const widenSelectFrame = isIcon || isCounter;
                              const keepCenterOnSelect =
                                isSelectedInLayoutMode &&
                                shouldKeepElementCenteredOnSelect(el);
                              const useContentSelectionFrame =
                                isSelectedInLayoutMode &&
                                !isImageLike &&
                                !isDivider;
                              const frameAlignClass = selectionFrameAlignClass(el);
                              return (
                            <SortableDataSliderItem
                              id={String(el?.id || `dts-el-${slideIndex}-${i}`)}
                              builderMode={builderMode}
                              onClick={(e) => {
                                if (builderMode !== "Layout Mode") return;
                                if (e.detail === 2) {
                                  return;
                                }
                                e.preventDefault();
                                e.stopPropagation();
                                if (tabSelectedElId === el?.id) {
                                  onTabElementSelect?.(null, String(slide?.id || ""));
                                } else {
                                  onTabElementSelect?.(el, String(slide?.id || ""));
                                }
                              }}
                            >
                              <div
                                data-tab-nested-id={String(el?.id || "")}
                                className=""
                              >
                                {isSelectedInLayoutMode && isImageLike && (
                                  <div className="pointer-events-none absolute inset-0 z-[11] rounded-md bg-red-300/80" />
                                )}
                                <div className={useContentSelectionFrame ? `relative block w-fit max-w-full ${frameAlignClass}` : ""}>
                                  <div
                                    className={
                                      isSelectedInLayoutMode && !isImageLike
                                        ? (isDivider
                                            ? "w-full origin-center scale-[0.85] transform-gpu transition-transform duration-150"
                                            : "w-fit max-w-full origin-center scale-[0.85] transform-gpu transition-transform duration-150")
                                        : ""
                                    }
                                  >
                                    {typeof renderTabElement === "function" ? (
                                      renderTabElement(el, i, String(slide?.id || ""))
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
                              </div>
                              {isSelectedInLayoutMode && (
                                isImageLike ? (
                                  null
                                ) : (
                                  isDivider ? <>
                                    <div className="pointer-events-none absolute left-[1px] right-[1px] top-[-4px] bottom-0 rounded-md bg-red-300/10" />
                                    <span className="pointer-events-none absolute left-[2px] top-[-3px] h-2.5 w-2.5 border-l-2 border-t-2 border-red-400" />
                                    <span className="pointer-events-none absolute right-[2px] top-[-3px] h-2.5 w-2.5 border-r-2 border-t-2 border-red-400" />
                                    <span className="pointer-events-none absolute bottom-[1px] left-[2px] h-2.5 w-2.5 border-b-2 border-l-2 border-red-400" />
                                    <span className="pointer-events-none absolute bottom-[1px] right-[2px] h-2.5 w-2.5 border-b-2 border-r-2 border-red-400" />
                                  </> : null
                                )
                              )}
                            </SortableDataSliderItem>
                                  );
                                })()}
                                {ghost &&
                                  ghost.isLast &&
                                  i === (slide?.elements || []).length - 1 &&
                                  ghost.ghostEl}
                              </div>
                            );
                          }
                        )}
                      </div>
                    </SortableContext>
                  </DndContext>
                ) : (
                  <div className="flex min-h-[56px] w-full items-center justify-center text-center">
                    {ghost ? (
                      ghost.ghostEl
                    ) : (
                      builderMode === "Layout Mode" ? (
                        <span className="block w-full text-[11px] text-slate-400 dark:text-slate-500">
                          ลาก Element มาวางที่นี่
                        </span>
                      ) : null
                    )}
                  </div>
                )}
              </div>
            </div>
          );
          })}
        </div>
        {pageCount > 1 && (
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {Array.from({ length: pageCount }, (_, pageIndex) => {
              const active = pageIndex === activePage;
              return (
                <span
                  key={`dts-dot-${pageIndex}`}
                  data-dts-dot-nav="true"
                  role="button"
                  tabIndex={0}
                  className={
                    `${navShape === "circle" ? "h-3 w-3 rounded-full" : "h-2 w-4 rounded-sm"} cursor-pointer`
                  }
                  style={{ backgroundColor: active ? activeDotColor : inactiveDotColor }}
                  onMouseDown={(e) => {
                    if (builderMode === "Layout Mode" && e.detail === 2) return;
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    if (builderMode === "Layout Mode" && e.detail === 2) return;
                    e.preventDefault();
                    e.stopPropagation();
                    const targetIndex = Math.max(
                      0,
                      Math.min(items.length - 1, pageIndex * Math.max(1, perView))
                    );
                    const targetId = items[targetIndex]?.id;
                    if (!targetId || targetId === activeId) return;
                    onUpdate?.(mergeDataSliderElement({ ...data, dataSliderActiveId: targetId }));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      const targetIndex = Math.max(
                        0,
                        Math.min(items.length - 1, pageIndex * Math.max(1, perView))
                      );
                      const targetId = items[targetIndex]?.id;
                      if (!targetId || targetId === activeId) return;
                      onUpdate?.(
                        mergeDataSliderElement({ ...data, dataSliderActiveId: targetId })
                      );
                    }
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
      {selected && (
        <>
          <span className="pointer-events-none absolute left-[2px] top-[2px] h-2.5 w-2.5 border-l-2 border-t-2 border-red-400" />
          <span className="pointer-events-none absolute right-[2px] top-[2px] h-2.5 w-2.5 border-r-2 border-t-2 border-red-400" />
          <span className="pointer-events-none absolute bottom-[2px] left-[2px] h-2.5 w-2.5 border-b-2 border-l-2 border-red-400" />
          <span className="pointer-events-none absolute bottom-[2px] right-[2px] h-2.5 w-2.5 border-b-2 border-r-2 border-red-400" />
        </>
      )}
    </div>
  );
};

export default DataSlider;
