import { Fragment, useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { setColor, setFont } from "../../../../function";
import {
  IMAGE_ASPECT_DEFAULT,
  IMAGE_BRIGHTNESS_DEFAULT,
  IMAGE_MARGIN_TOP_DEFAULT,
  IMAGE_MARGIN_BOTTOM_DEFAULT,
  imageBrightnessFilterStyle,
  imageCornerRadiusStyle,
} from "./imageAspectConfig";
import ImageBadge from "./ImageBadge";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

const SORTABLE_GHOST_CLASS =
  "pointer-events-none absolute -inset-x-3 inset-y-0 rounded border border-dashed border-red-400 bg-red-300/10";

const SortablePostItem = ({ id, builderMode, onClick, children }) => {
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

const PostElement = ({
  elementData,
  selected,
  animationForElement,
  builderMode,
  prioritizeImageLoad = false,
  onTabElementEdit,
  renderTabElement,
  onTabElementSelect,
  onTabElementsReorder,
  tabGhostData,
  tabSelectedElId,
  theme,
}) => {
  const [isPostImageHover, setIsPostImageHover] = useState(false);
  const isLayoutMode = builderMode === "Layout Mode";
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );
  const postElements = Array.isArray(elementData?.postElements) ? elementData.postElements : [];
  const useLayoutSelectionFrame = builderMode === "Layout Mode" && selected;
  const postLayoutMode =
    elementData?.postLayoutMode === "content_only" ? "content_only" : "image_content";
  const showImagePane = postLayoutMode !== "content_only";
  const heading = typeof elementData?.postHeading === "string" ? elementData.postHeading : "HEADING";
  const headingEnabled =
    postLayoutMode === "content_only" ? true : elementData?.postHeadingEnabled !== false;
  const headingBold = Boolean(elementData?.postHeadingBold);
  const headingDisplay = elementData?.postHeadingDisplay === "horizontal" ? "horizontal" : "vertical";
  const isHorizontalHeading = headingEnabled && headingDisplay === "horizontal";
  const headingDisabled = !headingEnabled;
  const headingFontSize = Math.max(
    12,
    Math.min(96, Number(elementData?.postHeadingFontSize) || 20)
  );
  const resolveHeadingGap = () => {
    const gap = Number(elementData?.postHeadingGap);
    if (Number.isFinite(gap)) return gap;
    const gapImage = Number(elementData?.postHeadingGapImage);
    if (Number.isFinite(gapImage)) return gapImage;
    const gapContent = Number(elementData?.postHeadingGapContent);
    if (Number.isFinite(gapContent)) return gapContent;
    return 18;
  };
  const headingGap = Math.max(
    10,
    Math.min(30, resolveHeadingGap())
  );
  const horizontalHeadingGap = Math.max(10, Math.min(30, headingGap));
  const align =
    elementData?.postAlign === "start" || elementData?.postAlign === "end"
      ? elementData.postAlign
      : "center";
  const dividerEnabled = Boolean(elementData?.postDividerEnabled);
  const dividerStyle =
    elementData?.postDividerStyle === "solid" ||
    elementData?.postDividerStyle === "dashed" ||
    elementData?.postDividerStyle === "dotted"
      ? elementData.postDividerStyle
      : "dotted";
  const dividerWidth = Math.max(1, Math.min(10, Number(elementData?.postDividerWidth) || 1));
  const dividerOpacity = Math.max(
    0,
    Math.min(255, Number(elementData?.postDividerColorOpacity) || 255)
  );
  const dividerColorToken = elementData?.postDividerColor ?? "#d8d8d8";
  const dividerColor =
    theme
      ? setColor(theme, dividerColorToken, dividerOpacity) || "#d8d8d8"
      : typeof dividerColorToken === "string"
        ? dividerColorToken
        : "#d8d8d8";
  const rawMarginTop = Number(elementData?.postMarginTop);
  const rawMarginBottom = Number(elementData?.postMarginBottom);
  const marginTop = Math.max(0, Math.min(80, Number.isFinite(rawMarginTop) ? rawMarginTop : 8));
  const marginBottom = Math.max(
    0,
    Math.min(80, Number.isFinite(rawMarginBottom) ? rawMarginBottom : 8)
  );
  const textFontFamily = setFont(theme?.text?.value);
  const headingFontFamily = setFont(theme?.textHeading?.value) || textFontFamily;
  const postImageSrc =
    typeof elementData?.src === "string" ? elementData.src.trim() : "";
  const postImageAspectRatio = elementData?.aspectRatio || IMAGE_ASPECT_DEFAULT;
  const isPreviewMode = builderMode === "Preview Mode";
  const postPreviewReservedAspectRatio =
    isPreviewMode && postImageAspectRatio === "auto" ? "16/9" : postImageAspectRatio;
  const postImageIsFixedAspect = postPreviewReservedAspectRatio !== "auto";
  const postImageCornerStyle = imageCornerRadiusStyle(
    elementData?.borderRadius,
    postPreviewReservedAspectRatio
  );
  const postImageBrightnessStyle = imageBrightnessFilterStyle(
    elementData?.brightness ?? IMAGE_BRIGHTNESS_DEFAULT
  );
  const imageMarginTopRaw = Number(elementData?.imageMarginTop);
  const imageMarginBottomRaw = Number(elementData?.imageMarginBottom);
  const imageMarginTop = Number.isFinite(imageMarginTopRaw)
    ? Math.max(0, Math.min(80, imageMarginTopRaw))
    : IMAGE_MARGIN_TOP_DEFAULT;
  const imageMarginBottom = Number.isFinite(imageMarginBottomRaw)
    ? Math.max(0, Math.min(80, imageMarginBottomRaw))
    : IMAGE_MARGIN_BOTTOM_DEFAULT;
  const postBadgeHoverEnabled = Boolean(elementData?.badge?.hover);
  const showPostImageBadge = !postBadgeHoverEnabled || isPostImageHover;
  const headingOpacity = Math.max(
    0,
    Math.min(255, Number(elementData?.postHeadingColorOpacity) || 255)
  );
  const headingColorToken = elementData?.postHeadingColor ?? { type: "mainColor", index: 0 };
  const headingTextColor =
    theme
      ? setColor(theme, headingColorToken, headingOpacity) || "#111827"
      : typeof headingColorToken === "string"
        ? headingColorToken
        : "#111827";

  const hasElements = postElements.length > 0;
  const ghost =
    tabGhostData && tabGhostData.ghostEl && tabGhostData.tabId === "post-main" ? tabGhostData : null;
  const isThisDropHovered = !!ghost;
  const sortableIds = postElements.map((el) => String(el?.id || ""));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = postElements.findIndex((e) => String(e?.id) === String(active.id));
    const to = postElements.findIndex((e) => String(e?.id) === String(over.id));
    if (from !== -1 && to !== -1) {
      onTabElementsReorder?.("post-main", from, to);
    }
  };

  const contentSurfaceClass = isThisDropHovered
    ? "border border-dashed border-blue-400 bg-blue-50 dark:border-blue-400/70 dark:bg-blue-900/10"
    : useLayoutSelectionFrame && hasElements
      ? "border-0 bg-transparent"
    : isLayoutMode
      ? "border border-dashed border-slate-300 bg-transparent dark:border-white/20"
      : hasElements
        ? "border-0 bg-transparent"
        : "border border-dashed border-slate-300 bg-slate-50 dark:border-white/20 dark:bg-white/5";

  const contentJustifyClass =
    align === "center" ? "items-center text-center" : align === "end" ? "items-end text-right" : "items-start text-left";
  const verticalHeadingAlignMode = align === "center" ? "center" : align === "end" ? "end" : "start";
  const contentOnlyVerticalHeading = !showImagePane && headingEnabled && !isHorizontalHeading;
  const gridColumnGap = headingDisabled && showImagePane ? 10 : contentOnlyVerticalHeading ? headingGap : 0;
  const verticalHeadingPadLeft = showImagePane ? headingGap : 0;
  const verticalHeadingPadRight = showImagePane ? headingGap : 0;
  const selectedEmptyContentInsetY = useLayoutSelectionFrame && !hasElements ? 10 : 0;
  const contentMarginTop =
    (isHorizontalHeading ? horizontalHeadingGap : 0) + selectedEmptyContentInsetY;
  const contentMarginBottom = selectedEmptyContentInsetY;
  const verticalHeadingMinWidth = contentOnlyVerticalHeading
    ? Math.max(18, Math.round(headingFontSize) + 6)
    : undefined;
  const dropBody = hasElements ? (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
        <div className="w-full space-y-1">
          {postElements.map((el, i) => (
            <Fragment key={String(el?.id || `post-el-${i}`)}>
              {ghost && !ghost.isLast && ghost.insertAt === i && ghost.ghostEl}
              <SortablePostItem
                id={String(el?.id || `post-el-${i}`)}
                builderMode={builderMode}
                onClick={(e) => {
                  if (builderMode !== "Layout Mode") return;
                  e.preventDefault();
                  e.stopPropagation();
                  if (e.detail === 2) {
                    onTabElementEdit?.(el, "post-main");
                    return;
                  }
                  if (tabSelectedElId === el?.id) {
                    onTabElementSelect?.(null, "post-main");
                  } else {
                    onTabElementSelect?.(el, "post-main");
                  }
                }}
              >
                <div data-tab-nested-id={String(el?.id || "")} className="py-0.5">
                  {typeof renderTabElement === "function" ? (
                    (() => {
                      const nestedRenderEl =
                        String(el?.type || "") === "text"
                          ? { ...el, __tabsNestedCompactText: true }
                          : el;
                      return renderTabElement(nestedRenderEl, i, "post-main");
                    })()
                  ) : (
                    <div className="rounded-md border border-slate-200 bg-white px-2.5 py-2 text-left text-[12px] text-slate-700 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200">
                      <span className="font-semibold">{String(el?.type || "element").toUpperCase()}</span>
                      <span className="mx-1 text-slate-400">-</span>
                      <span>{String(el?.id || "no-id")}</span>
                    </div>
                  )}
                </div>
                {builderMode === "Layout Mode" && tabSelectedElId === el?.id && (
                  <div className={SORTABLE_GHOST_CLASS} />
                )}
              </SortablePostItem>
              {ghost && ghost.isLast && i === postElements.length - 1 && ghost.ghostEl}
            </Fragment>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  ) : (
    <div className="flex h-full min-h-[44px] w-full flex-col items-center justify-center gap-1 text-center">
      {ghost ? (
        ghost.ghostEl
      ) : (
        <span className="font-sans text-[11px] text-slate-400 dark:text-slate-500">
          ลาก Element มาวางที่นี่
        </span>
      )}
    </div>
  );

  return (
    <div
      className={`w-full ${animationForElement || ""}`}
      style={{ marginTop, marginBottom, fontFamily: textFontFamily }}
    >
      <div className={useLayoutSelectionFrame ? "relative px-0 py-0" : ""}>
        <div
          className={
            useLayoutSelectionFrame
              ? "origin-center scale-[0.97] transform-gpu transition-transform duration-150"
              : ""
          }
        >
          <div
            className={`grid w-full ${
          showImagePane
            ? isHorizontalHeading || headingDisabled
              ? "grid-cols-[minmax(180px,36%)_minmax(260px,1fr)]"
              : "grid-cols-[minmax(180px,36%)_auto_minmax(260px,1fr)]"
            : headingEnabled && !isHorizontalHeading
              ? "grid-cols-[auto_minmax(260px,1fr)]"
              : "grid-cols-[minmax(260px,1fr)]"
            }`}
            style={{ columnGap: gridColumnGap }}
          >
        {showImagePane && (
          <div
            className="relative w-full overflow-hidden rounded-sm bg-gray-100"
            data-post-part="image"
            data-post-image-pane="true"
            style={{
              ...postImageCornerStyle,
              marginTop: imageMarginTop,
              marginBottom: imageMarginBottom,
              ...(postImageIsFixedAspect
                ? { aspectRatio: postPreviewReservedAspectRatio }
                : { minHeight: 220 }),
            }}
            onMouseEnter={() => setIsPostImageHover(true)}
            onMouseLeave={() => setIsPostImageHover(false)}
          >
            {postImageSrc ? (
              postImageIsFixedAspect ? (
                <img
                  src={postImageSrc}
                  alt=""
                  draggable={false}
                  loading={prioritizeImageLoad ? "eager" : "lazy"}
                  fetchPriority={prioritizeImageLoad ? "high" : undefined}
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{ ...postImageBrightnessStyle, ...postImageCornerStyle }}
                />
              ) : (
                <img
                  src={postImageSrc}
                  alt=""
                  draggable={false}
                  loading={prioritizeImageLoad ? "eager" : "lazy"}
                  fetchPriority={prioritizeImageLoad ? "high" : undefined}
                  decoding="async"
                  className="h-auto w-full"
                  style={{ ...postImageBrightnessStyle, ...postImageCornerStyle }}
                />
              )
            ) : (
              <div className="absolute inset-0 grid place-items-center">
                <ImageIcon className="h-10 w-10 text-gray-400" strokeWidth={1.5} aria-hidden />
              </div>
            )}
            {showPostImageBadge ? (
              <ImageBadge
                badge={elementData?.badge}
                aspectRatio={postPreviewReservedAspectRatio}
                imageBorderRadius={elementData?.borderRadius}
                theme={theme}
                elementType="img"
              />
            ) : null}
          </div>
        )}

        {headingEnabled && !isHorizontalHeading && (
          <div
            className="relative h-full"
            data-post-part="heading"
            style={{
              paddingLeft: verticalHeadingPadLeft,
              paddingRight: verticalHeadingPadRight,
              minWidth: verticalHeadingMinWidth,
            }}
          >
            {verticalHeadingAlignMode === "start" && (
              <div className="pointer-events-none absolute inset-0 flex h-full w-full flex-col items-center gap-2 overflow-hidden pt-1">
                <div
                  className={`px-1 ${headingBold ? "font-bold" : "font-medium"}`}
                  style={{
                    fontFamily: headingFontFamily,
                    fontSize: headingFontSize,
                    color: headingTextColor,
                    whiteSpace: "nowrap",
                    writingMode: "vertical-rl",
                    textOrientation: "mixed",
                  }}
                >
                  {heading}
                </div>
                {dividerEnabled && (
                  <span
                    className="block w-0 min-h-0 flex-1 border-l"
                    style={{
                      borderLeftStyle: dividerStyle,
                      borderLeftColor: dividerColor,
                      borderLeftWidth: dividerWidth,
                    }}
                  />
                )}
              </div>
            )}
            {verticalHeadingAlignMode === "center" && (
              <div className="pointer-events-none absolute inset-0 flex h-full w-full flex-col items-center justify-center gap-2 overflow-hidden">
                {dividerEnabled && (
                  <span
                    className="block w-0 min-h-0 flex-1 border-l"
                    style={{
                      borderLeftStyle: dividerStyle,
                      borderLeftColor: dividerColor,
                      borderLeftWidth: dividerWidth,
                    }}
                  />
                )}
                <div
                  className={`px-1 ${headingBold ? "font-bold" : "font-medium"}`}
                  style={{
                    fontFamily: headingFontFamily,
                    fontSize: headingFontSize,
                    color: headingTextColor,
                    whiteSpace: "nowrap",
                    writingMode: "vertical-rl",
                    textOrientation: "mixed",
                  }}
                >
                  {heading}
                </div>
                {dividerEnabled && (
                  <span
                    className="block w-0 min-h-0 flex-1 border-l"
                    style={{
                      borderLeftStyle: dividerStyle,
                      borderLeftColor: dividerColor,
                      borderLeftWidth: dividerWidth,
                    }}
                  />
                )}
              </div>
            )}
            {verticalHeadingAlignMode === "end" && (
              <div className="pointer-events-none absolute inset-0 flex h-full w-full flex-col items-center justify-end gap-2 overflow-hidden pb-1">
                {dividerEnabled && (
                  <span
                    className="block w-0 min-h-0 flex-1 border-l"
                    style={{
                      borderLeftStyle: dividerStyle,
                      borderLeftColor: dividerColor,
                      borderLeftWidth: dividerWidth,
                    }}
                  />
                )}
                <div
                  className={`px-1 ${headingBold ? "font-bold" : "font-medium"}`}
                  style={{
                    fontFamily: headingFontFamily,
                    fontSize: headingFontSize,
                    color: headingTextColor,
                    whiteSpace: "nowrap",
                    writingMode: "vertical-rl",
                    textOrientation: "mixed",
                  }}
                >
                  {heading}
                </div>
              </div>
            )}
          </div>
        )}

            <div className="flex h-full w-full flex-col">
          {headingEnabled && isHorizontalHeading && (
            <div className="pointer-events-none flex items-center justify-center px-2" data-post-part="heading">
              {dividerEnabled && (
                <span
                  className="h-0 min-w-8 flex-1 border-t"
                  style={{
                    borderTopStyle: dividerStyle,
                    borderTopColor: dividerColor,
                    borderTopWidth: dividerWidth,
                  }}
                />
              )}
              <span
                className={`mx-3 px-1 ${
                  headingBold ? "font-bold" : "font-medium"
                }`}
                style={{
                  fontFamily: headingFontFamily,
                  fontSize: headingFontSize,
                  color: headingTextColor,
                  whiteSpace: "nowrap",
                  writingMode: "horizontal-tb",
                  textOrientation: "mixed",
                }}
              >
                {heading}
              </span>
              {dividerEnabled && (
                <span
                  className="h-0 min-w-8 flex-1 border-t"
                  style={{
                    borderTopStyle: dividerStyle,
                    borderTopColor: dividerColor,
                    borderTopWidth: dividerWidth,
                  }}
                />
              )}
            </div>
          )}
          <div
            className={`relative flex w-full flex-1 flex-col rounded-sm ${
              useLayoutSelectionFrame ? "px-0" : "px-2"
            } py-1 ${contentSurfaceClass} ${contentJustifyClass}`}
            data-post-part="content"
            data-drop="TAB-CONTENT"
            data-tab-element-id={String(elementData?.id || "")}
            data-tab-id="post-main"
            style={{
              ...(contentMarginTop ? { marginTop: contentMarginTop } : {}),
              ...(contentMarginBottom ? { marginBottom: contentMarginBottom } : {}),
            }}
            onDragOver={(e) => e.preventDefault()}
            onDoubleClickCapture={(e) => {
              if (builderMode !== "Layout Mode") return;
              const nestedDiv = e.target?.closest?.("[data-tab-nested-id]");
              if (!nestedDiv) return;
              const nestedId = nestedDiv.dataset?.tabNestedId;
              if (!nestedId) return;
              const nestedElement = postElements.find((item) => String(item?.id) === nestedId);
              if (!nestedElement) return;
              e.preventDefault();
              e.stopPropagation();
              onTabElementEdit?.(nestedElement, "post-main");
            }}
          >
            {dropBody}
          </div>
        </div>
          </div>
        </div>
        {useLayoutSelectionFrame && (
          <>
            <div className="pointer-events-none absolute left-[-7px] right-[-7px] top-[1px] bottom-[1px] rounded-md bg-red-300/10" />
            <span className="pointer-events-none absolute left-[-4px] top-[2px] h-2.5 w-2.5 border-l-2 border-t-2 border-red-400" />
            <span className="pointer-events-none absolute right-[-6px] top-[2px] h-2.5 w-2.5 border-r-2 border-t-2 border-red-400" />
            <span className="pointer-events-none absolute bottom-[2px] left-[-4px] h-2.5 w-2.5 border-b-2 border-l-2 border-red-400" />
            <span className="pointer-events-none absolute bottom-[2px] right-[-6px] h-2.5 w-2.5 border-b-2 border-r-2 border-red-400" />
          </>
        )}
      </div>
    </div>
  );
};

export default PostElement;
