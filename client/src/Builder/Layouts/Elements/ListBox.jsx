import lodash from "lodash";
import { CircleFadingPlus, Image as ImageIcon, Play } from "lucide-react";
import { setColor } from "../../../../function";
import IconAwsome from "../../IconAwsome";
import {
  isValidFaIconRef,
  mergeIconElement,
  resolveIconBackgroundCss,
  resolveIconGlyphColor,
  resolveIconBorderCss,
  normalizeIconBorderStyle,
  normalizeIconBorderPosition,
} from "./iconElementConfig";
import {
  imageCornerRadiusStyle,
  resolveImageLinkAttrs,
} from "./imageAspectConfig";
import SegmentedRichText from "../../richText/SegmentedRichText";
import {
  LIST_BOX_DEFAULT_TITLES,
  LIST_BOX_ELEMENT_DEFAULTS,
  LIST_BOX_ITEM_ICON_KEYS,
  listBoxItemIconElWithFramelessGlyphDefault,
  mergeListBoxElement,
} from "./listBoxElementConfig";
import { usePanelPreview } from "../../panelPreviewStore";

function perViewForDevice(device, s) {
  if (device === "Mobile") return s.listBoxPerViewMobile;
  if (device === "Tablet") return s.listBoxPerViewTablet;
  return s.listBoxPerViewDesktop;
}

/** โมเดลไอคอนต่อช่อง — ค่าเริ่มต้น mainColor / ไอคอนขาว เมื่อยังไม่มี override ใน item */
function listBoxItemIconElementForRender(
  it,
  iconFontPx,
  iconBgW,
  iconFrameOn,
  iconShapeRounded,
  iconCornerPx
) {
  const fromItem = lodash.omit(
    lodash.pick(it || {}, LIST_BOX_ITEM_ICON_KEYS),
    "iconSize"
  );
  return {
    backgroundColor: { type: "mainColor", index: 0 },
    backgroundOpacity: 255,
    iconColor: "#ffffff",
    iconOpacity: 255,
    ...fromItem,
    iconSize: iconFontPx,
    containerSize: iconBgW,
    borderEnabled: iconFrameOn,
    iconShape: iconShapeRounded ? "rounded" : "circle",
    iconCornerRadius: iconCornerPx,
  };
}

/** ระยะว่างระหว่างพื้นหลังไอคอนกับเส้นกรอบ (px) — ให้ตรงกับ Icon.jsx */
const LIST_BOX_ICON_BORDER_GAP_PX = 5;

/** ไอคอนในกรอบ List Box — รองรับตำแหน่งกรอบ outside / inside / center เหมือนองค์ประกอบ Icon */
function renderListBoxFramedIcon({
  it,
  iconFontPx,
  iconBgW,
  iconShapeRounded,
  iconCornerPx,
  fa,
  theme,
}) {
  const iconEl = listBoxItemIconElementForRender(
    it,
    iconFontPx,
    iconBgW,
    true,
    iconShapeRounded,
    iconCornerPx
  );
  const m = mergeIconElement(iconEl);
  const bgCss = resolveIconBackgroundCss(iconEl, theme);
  const fgCss = resolveIconGlyphColor(iconEl, theme);
  const shape = iconShapeRounded ? "rounded" : "circle";
  const containerPx = iconBgW;
  const radiusPx = Math.max(0, Math.min(80, iconCornerPx));
  const borderRadius =
    shape === "circle" ? "50%" : `${Math.min(radiusPx, containerPx / 2)}px`;

  const bw = Number(m.borderWidth);
  const borderWidthPx = Number.isFinite(bw) ? Math.max(0, Math.min(6, bw)) : 0;
  const hasBorder = borderWidthPx > 0;
  const borderCol = hasBorder ? resolveIconBorderCss(iconEl, theme) : "transparent";
  const borderStyleCss = normalizeIconBorderStyle(m.borderStyle);
  const borderPos = normalizeIconBorderPosition(m.borderPosition);
  const gap = LIST_BOX_ICON_BORDER_GAP_PX;
  const borderCss = `${borderWidthPx}px ${borderStyleCss} ${borderCol}`;

  const iconSizePx = Number.isFinite(Number(m.iconSize))
    ? Math.max(12, Math.min(96, Number(m.iconSize)))
    : iconFontPx;

  const glyph = (
    <IconAwsome
      iconName={fa.name}
      iconType={fa.type}
      style={{ fontSize: iconSizePx, color: fgCss }}
    />
  );

  const innerBoxStyle = {
    width: containerPx,
    height: containerPx,
    minWidth: containerPx,
    minHeight: containerPx,
    borderRadius,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: bgCss,
    boxSizing: "border-box",
  };

  const insetRingBorderRadius =
    shape === "circle"
      ? "50%"
      : `${Math.max(
          0,
          Math.min(radiusPx - gap, (containerPx - 2 * gap) / 2)
        )}px`;

  const centerWrapSize = containerPx + borderWidthPx;
  const centerOuterRingBorderRadius =
    shape === "circle"
      ? "50%"
      : `${Math.min(
          radiusPx + borderWidthPx / 2,
          centerWrapSize / 2
        )}px`;
  const centerFillInset = borderWidthPx / 2;

  const wrapClass = "flex shrink-0 items-center justify-center";

  if (!hasBorder) {
    return (
      <div className={wrapClass} style={innerBoxStyle} aria-hidden>
        {glyph}
      </div>
    );
  }

  if (borderPos === "outside") {
    const outerSize = containerPx + 2 * gap + 2 * borderWidthPx;
    const outerBorderRadius =
      shape === "circle"
        ? "50%"
        : `${Math.min(radiusPx + gap + borderWidthPx, outerSize / 2)}px`;
    return (
      <div
        className={wrapClass}
        style={{
          width: outerSize,
          height: outerSize,
          minWidth: outerSize,
          minHeight: outerSize,
          boxSizing: "border-box",
          border: borderCss,
          borderRadius: outerBorderRadius,
          padding: `${gap}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        aria-hidden
      >
        <div style={innerBoxStyle}>{glyph}</div>
      </div>
    );
  }

  if (borderPos === "inside") {
    return (
      <div
        className={wrapClass}
        style={{ ...innerBoxStyle, position: "relative" }}
        aria-hidden
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: `${gap}px`,
            boxSizing: "border-box",
            border: borderCss,
            borderRadius: insetRingBorderRadius,
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>{glyph}</div>
      </div>
    );
  }

  if (borderPos === "center") {
    return (
      <div
        className={wrapClass}
        style={{
          width: centerWrapSize,
          height: centerWrapSize,
          minWidth: centerWrapSize,
          minHeight: centerWrapSize,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        aria-hidden
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: `${centerFillInset}px`,
            borderRadius,
            backgroundColor: bgCss,
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            boxSizing: "border-box",
            border: borderCss,
            borderRadius: centerOuterRingBorderRadius,
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>{glyph}</div>
      </div>
    );
  }

  return (
    <div className={wrapClass} style={innerBoxStyle} aria-hidden>
      {glyph}
    </div>
  );
}

/**
 * List Box — กริดรายการ (เส้นแบ่งแบบประ)
 * รูปแบบ: listBoxVariant (icon_text | image_text | image | text)
 */
const ListBox = ({
  elementData,
  selected,
  hover,
  builderMode,
  device = "Desktop",
  theme,
  onListBoxEditText,
  onListBoxEditIcon,
  onListBoxEditImage,
  animationForElement = "transition-all duration-200 ease-in-out will-change-transform",
}) => {
  const panelPreview = usePanelPreview("lstb", elementData?.id);
  const liveElementData = panelPreview
    ? { ...elementData, ...panelPreview }
    : elementData;
  const s = mergeListBoxElement(liveElementData);
  const items = s.listBoxItems || [];
  const pv = Math.max(1, perViewForDevice(device, s));
  const variant = s.listBoxVariant || "icon_text";
  const iconBgW = Math.max(20, Math.min(160, Number(s.listBoxIconBgWidth) || 56));
  const iconFontPx = Math.max(12, Math.min(96, Number(s.listBoxIconSize) || 26));
  const iconFrameOn = s.listBoxIconFrameEnabled !== false;
  const iconShapeRounded = (s.listBoxIconShape || "circle") === "rounded";
  const iconCornerPx = Math.max(
    0,
    Math.min(80, Math.round(Number(s.listBoxIconCornerRadius) || 12))
  );
  const fullFrame = s.listBoxGridFullFrameEnabled === true;
  const divStyleRaw = s.listBoxGridDividerStyle;
  const divStyle =
    divStyleRaw === "solid" ||
    divStyleRaw === "dashed" ||
    divStyleRaw === "dotted" ||
    divStyleRaw === "none"
      ? divStyleRaw
      : "dashed";
  const customLines = fullFrame && divStyle !== "none";
  const gridDividerOpacity = Number.isFinite(Number(s.listBoxGridDividerOpacity))
    ? Math.max(0, Math.min(255, Math.round(Number(s.listBoxGridDividerOpacity))))
    : 255;
  /** สีเส้นแบ่งช่อง — ใช้ทั้งตอนปิด/เปิดกรอบเต็ม (ยกเว้นโหมดไม่มี) */
  const dividerLineColor =
    divStyle === "none"
      ? ""
      : theme
        ? setColor(
            theme,
            s.listBoxGridDividerColor ??
            LIST_BOX_ELEMENT_DEFAULTS.listBoxGridDividerColor,
            gridDividerOpacity
          )
        : LIST_BOX_ELEMENT_DEFAULTS.listBoxGridDividerColor;
  const isLayoutMode = builderMode === "Layout Mode";
  const isEditorMode = builderMode === "Editor Mode";
  const useLayoutSelectionFrame = isLayoutMode && selected;
  const selectedCanvasClass = !useLayoutSelectionFrame && selected
    ? "rounded-md border border-red-400 bg-red-300/10 p-2 border-dashed"
    : "";

  const gridTemplateStyle = {
    gridTemplateColumns: `repeat(${pv}, minmax(0, 1fr))`,
  };

  const renderListCell = (it, i) => {
    const row = Math.floor(i / pv);
    const hasRightNeighbor =
      i + 1 < items.length && Math.floor((i + 1) / pv) === row;
    const hasBottomNeighbor = i + pv < items.length;
    const fa = isValidFaIconRef(it?.faIcon)
      ? it.faIcon
      : { name: "faStar", type: "fas" };
    const label =
      typeof it?.title === "string" && it.title.trim()
        ? it.title.trim()
        : LIST_BOX_DEFAULT_TITLES[0];
    const hasTitleRich =
      it?.titleParagraph &&
      typeof it.titleParagraph === "object" &&
      Array.isArray(it.titleParagraph.segments) &&
      it.titleParagraph.segments.length > 0;
    const titleDefaultColor = theme
      ? setColor(theme, theme?.textColor?.[0], 255)
      : "#171717";
    const sub =
      typeof it?.body === "string" && it.body.trim() ? it.body.trim() : "";
    const src = typeof it?.src === "string" ? it.src.trim() : "";
    const ar =
      variant === "image_text" || variant === "image"
        ? "3 / 2"
        : typeof it?.aspectRatio === "string" && it.aspectRatio.trim()
          ? it.aspectRatio.trim()
          : "1 / 1";
    const br = Number(it?.borderRadius);
    const borderRadiusPx = Number.isFinite(br)
      ? Math.max(0, Math.min(32, Math.round(br)))
      : 8;

    const showIcon = variant === "icon_text";
    const showImage = variant === "image" || variant === "image_text";
    const showTextBlock = variant !== "image";
    const showSub =
      (variant === "icon_text" || variant === "image_text" || variant === "text") && sub;

    const cellMin =
      variant === "image" || variant === "image_text" || variant === "text"
        ? "min-h-0"
        : "min-h-[132px]";
    const cellLayoutClass =
      variant === "text"
        ? "self-start justify-start px-4 py-3"
        : "justify-center";

    const paddingStyle = variant === "text" ? {} : { padding: "12px" };
    const cellSegmentStyle = {};
    if (divStyle !== "none") {
      if (hasRightNeighbor) {
        cellSegmentStyle.borderRightWidth = 1;
        cellSegmentStyle.borderRightStyle = divStyle;
        cellSegmentStyle.borderRightColor = dividerLineColor;
      }
      if (hasBottomNeighbor) {
        cellSegmentStyle.borderBottomWidth = 1;
        cellSegmentStyle.borderBottomStyle = divStyle;
        cellSegmentStyle.borderBottomColor = dividerLineColor;
      }
    }
    const mergedCellStyle = { ...paddingStyle, ...cellSegmentStyle };
    const cellStyle =
      Object.keys(mergedCellStyle).length > 0 ? mergedCellStyle : undefined;

    return (
      <div
        key={i}
        className={`flex ${cellMin} w-full min-w-0 flex-col items-center ${cellLayoutClass} ${
          isLayoutMode ? "pointer-events-none select-none" : ""
        }`.trim()}
        style={cellStyle}
        data-listbox-item-index={i}
      >
        {showIcon ? (() => {
          const listBoxIconLinkAttrs =
            !isLayoutMode ? resolveImageLinkAttrs(it) : null;
          const iconBody = iconFrameOn ? (
            renderListBoxFramedIcon({
              it,
              iconFontPx,
              iconBgW,
              iconShapeRounded,
              iconCornerPx,
              fa,
              theme,
            })
          ) : (
            (() => {
              const iconElRaw = listBoxItemIconElementForRender(
                it,
                iconFontPx,
                iconBgW,
                false,
                iconShapeRounded,
                iconCornerPx
              );
              const iconEl = listBoxItemIconElWithFramelessGlyphDefault(
                iconElRaw,
                s.listBoxIconFrameEnabled
              );
              const m = mergeIconElement(iconEl);
              const fgCss = resolveIconGlyphColor(iconEl, theme);
              const iconSizePx = Number.isFinite(Number(m.iconSize))
                ? Math.max(12, Math.min(96, Number(m.iconSize)))
                : iconFontPx;
              return (
                <div
                  className="flex shrink-0 items-center justify-center"
                  aria-hidden
                >
                  <IconAwsome
                    iconName={fa.name}
                    iconType={fa.type}
                    style={{ fontSize: iconSizePx, color: fgCss }}
                  />
                </div>
              );
            })()
          );
          return (
            <div
              className="flex shrink-0 flex-col items-center"
              data-listbox-part="icon"
              data-listbox-item-index={i}
              style={
                isEditorMode && onListBoxEditIcon ? { cursor: "pointer" } : undefined
              }
              onDoubleClick={
                isEditorMode && onListBoxEditIcon
                  ? (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onListBoxEditIcon(i);
                    }
                  : undefined
              }
            >
              {listBoxIconLinkAttrs ? (
                <a
                  {...listBoxIconLinkAttrs}
                  data-listbox-part="icon"
                  data-listbox-item-index={i}
                  className="flex shrink-0 flex-col items-center no-underline text-inherit outline-none"
                  onDoubleClick={
                    isEditorMode && onListBoxEditIcon
                      ? (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onListBoxEditIcon(i);
                        }
                      : undefined
                  }
                >
                  {iconBody}
                </a>
              ) : (
                iconBody
              )}
            </div>
          );
        })() : null}

        {showImage ? (() => {
          const slideLinkMode =
            it?.slideLinkMode === "lightbox" || it?.slideLinkMode === "video"
              ? it.slideLinkMode
              : "url";
          const imgLinkAttrs =
            !isLayoutMode &&
            it?.linkEnabled &&
            slideLinkMode === "url"
              ? resolveImageLinkAttrs(it)
              : null;
          const layoutPointerBlock = isLayoutMode ? "pointer-events-none" : "";
          const imageInner = src ? (
            <img
              src={src}
              alt=""
              className={`h-full w-full object-cover ${layoutPointerBlock}`}
              draggable={false}
            />
          ) : (
            <div className="flex h-full min-h-[80px] w-full items-center justify-center">
              <ImageIcon
                className="h-9 w-9 text-slate-400 dark:text-white/35"
                strokeWidth={1.5}
                aria-hidden
              />
            </div>
          );
          const imageBody = imgLinkAttrs ? (
            <a
              {...imgLinkAttrs}
              className={`block h-full w-full text-inherit no-underline outline-none ${layoutPointerBlock}`}
            >
              {imageInner}
            </a>
          ) : (
            imageInner
          );
          return (
            <div
              className={`relative w-full max-w-full shrink-0 overflow-hidden ${
                isLayoutMode || isEditorMode
                  ? "bg-slate-100 dark:bg-slate-800"
                  : "bg-transparent"
              }`}
              data-listbox-part="image"
              data-listbox-item-index={i}
              style={{
                aspectRatio: ar,
                ...imageCornerRadiusStyle(borderRadiusPx, ar),
                ...(isEditorMode && onListBoxEditImage ? { cursor: "pointer" } : {}),
              }}
              onDoubleClick={
                isEditorMode && onListBoxEditImage
                  ? (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onListBoxEditImage(i);
                    }
                  : undefined
              }
              aria-hidden={!!src}
            >
              {imageBody}
              {it?.linkEnabled && slideLinkMode === "lightbox" && (
                <div className="pointer-events-none absolute inset-0 z-[5] grid place-items-center">
                  <div
                    className="grid place-items-center rounded-full"
                    style={{
                      width: "clamp(34px, 14%, 50px)",
                      aspectRatio: "1",
                      backgroundColor: setColor(
                        theme,
                        theme?.mainColor?.[1],
                        200
                      ),
                    }}
                  >
                    <CircleFadingPlus
                      className="h-[60%] w-[60%] text-white"
                      strokeWidth={2}
                      aria-hidden
                    />
                  </div>
                </div>
              )}
              {it?.linkEnabled && slideLinkMode === "video" && (
                <div className="pointer-events-none absolute inset-0 z-[5] grid place-items-center">
                  <div
                    className="grid place-items-center rounded-full"
                    style={{
                      width: "clamp(34px, 14%, 50px)",
                      aspectRatio: "1",
                      backgroundColor: setColor(
                        theme,
                        theme?.mainColor?.[1],
                        200
                      ),
                    }}
                  >
                    <Play
                      className="h-[55%] w-[55%] text-white"
                      strokeWidth={2.2}
                      aria-hidden
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })() : null}

        {showTextBlock ? (
          <>
            <div
              className={`w-full max-w-full text-center uppercase text-black dark:text-white ${
                hasTitleRich ? "text-[14px] leading-[21px]" : "text-[13px] font-semibold tracking-[0.2em]"
              } ${showIcon || showImage ? "mt-4" : ""}`}
              style={
                isEditorMode && onListBoxEditText ? { cursor: "pointer" } : undefined
              }
              data-listbox-part="title"
              data-listbox-item-index={i}
              onDoubleClick={
                isEditorMode && onListBoxEditText
                  ? (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onListBoxEditText(i, "title");
                    }
                  : undefined
              }
            >
              {hasTitleRich ? (
                <SegmentedRichText
                  renderSignature={`lb-title|${elementData?.id ?? ""}|${i}|${JSON.stringify(
                    it.titleParagraph
                  )}`}
                  elementData={{ label: "", textParagraph: it.titleParagraph }}
                  themeTextClass={theme?.text?.value}
                  animationClass=""
                  selected={false}
                  defaultColor={titleDefaultColor}
                  defaultFontSizePx={14}
                  verticalMarginPx={0}
                />
              ) : (
                label
              )}
            </div>
            {showSub ? (
              <div
                className="mt-1 max-w-full truncate px-1 text-center text-[11px] text-slate-500 dark:text-white/55"
                style={
                  isEditorMode && onListBoxEditText ? { cursor: "pointer" } : undefined
                }
                data-listbox-part="body"
                data-listbox-item-index={i}
                onDoubleClick={
                  isEditorMode && onListBoxEditText
                    ? (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onListBoxEditText(i, "body");
                      }
                    : undefined
                }
              >
                {sub}
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    );
  };

  return (
    <div
      className={`w-full ${animationForElement} ${selectedCanvasClass}`.trim()}
      style={{
        marginTop: s.listBoxMarginTop,
        marginBottom: s.listBoxMarginBottom,
      }}
      onMouseEnter={() => hover?.({ id: elementData.id })}
      onMouseLeave={() => hover?.(false)}
    >
      <div className={useLayoutSelectionFrame ? "relative p-2" : ""}>
        <div
          className={
            useLayoutSelectionFrame
              ? "origin-center scale-[0.85] transform-gpu transition-transform duration-150"
              : ""
          }
        >
          {customLines ? (
            <div
              className="box-border overflow-hidden rounded-md"
              style={{
                borderWidth: 1,
                borderStyle: divStyle,
                borderColor: dividerLineColor,
              }}
            >
              <div className="grid w-full" style={gridTemplateStyle}>
                {items.map((it, i) => renderListCell(it, i))}
              </div>
            </div>
          ) : (
            <div className="grid w-full" style={gridTemplateStyle}>
              {items.map((it, i) => renderListCell(it, i))}
            </div>
          )}
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

export default ListBox;
