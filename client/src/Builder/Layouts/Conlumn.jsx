import { setColor } from "../../../function";
import ServiceLayout from "../Services/ServiceLayout"

function Column({
  elementData,
  ids,
  device,
  builderMode,
  setRef,
  height,
  theme,
  handleDuring,
  showOption,
  layouts,
  funct,
  scheduleDND,
  openOffcavanas,
  onUpdate,
  modal,
  changeSize,
  changePosition,
  dndHandle,
  onDragAble,
  onDragDisable,
  isColumnPresetModalPinned = false,
  onColumnPresetModalToggle = null,
  onOpenPresetModal = null,
  onOpenPresetLoadModal = null,
  noColumnGap = false,
  hideIdBadge = false,
  removeLeftBorder = false,
  removeRightBorder = false,
  removeTopBorder = false,
  children,
}) {
  const {
    paddingX,
    paddingY,
    backgroundColor,
    backgroundColorGradient,
    borderColor,
    borderOpacity,
    borderRadius,
    borderWidth,
    degrees,
    isGradient,
    opacityColor,
    opacityColorGradient,
    isSpan,
    id,
    backgroundImage,
    opacityImage,
    blur: colBgBlur,
    colGlassEnabled,
    colGlassLevel,
    elements = [],
  } = elementData;

  const glassLevelNum = Number.isFinite(Number(colGlassLevel)) ? Number(colGlassLevel) : 50;
  const glassRatio = colGlassEnabled === true
    ? Math.max(0, Math.min(100, glassLevelNum)) / 100
    : 0;
  const glassBlurPx = Math.round(glassRatio * 24);
  const glassSaturatePct = Math.round(100 + glassRatio * 80);
  const glassStyle = colGlassEnabled === true
    ? {
        backdropFilter: `blur(${glassBlurPx}px) saturate(${glassSaturatePct}%)`,
        WebkitBackdropFilter: `blur(${glassBlurPx}px) saturate(${glassSaturatePct}%)`,
      }
    : {};

  const hasLayoutElements =
    Array.isArray(elements) && elements.length > 0;

  const hasColBgImage = !isSpan && typeof backgroundImage === "string" && backgroundImage.trim() !== "";

  const {
    clone,
    remove,
  }=funct

  const { conID } = ids;

  const element = {colData:elementData,conID}

  let color;

  if (isGradient) {
    color = setColor(
      theme,
      backgroundColorGradient,
      opacityColorGradient,
      degrees
    );
  } else {
    color = setColor(theme, backgroundColor, opacityColor);
  }

  // When glass enabled: cap opacity so backdropFilter is always visible
  if (colGlassEnabled === true && glassRatio > 0) {
    const maxOpacity = Math.round(255 - glassRatio * 160);
    if (isGradient && Array.isArray(backgroundColorGradient) && Array.isArray(opacityColorGradient)) {
      const effectiveOpacity = opacityColorGradient.map((op) =>
        Math.min(Number(op) || 255, maxOpacity)
      );
      color = setColor(theme, backgroundColorGradient, effectiveOpacity, degrees);
    } else if (!isGradient && backgroundColor != null) {
      const effectiveOpacity = Math.min(Number(opacityColor) || 255, maxOpacity);
      color = setColor(theme, backgroundColor, effectiveOpacity);
    }
  }

  const brColor = setColor(theme, borderColor, borderOpacity);

  // When border + gradient share one box, semi-transparent border blends with the
  // underlying gradient and looks uneven. Use an outer "ring" (padding) in border
  // color and an inner fill for background — same idea as a real stacked border.
  const bw = Number(borderWidth) || 0;
  const r = Number(borderRadius) || 0;
  const innerRadius = Math.max(0, r - bw);
  const useBorderRing = bw > 0;

  const IDS = {colID:id,conID}

  if (isSpan) {
    return (
      <div
        className={`w-full min-w-0 grid grid-cols-12 grid-flow-row-dense auto-rows-[minmax(0,auto)] items-start ${noColumnGap ? "gap-0" : "gap-[22px]"}`}
        ref={(el) => setRef(el)}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={`column-area ${
        device === "Desktop" && builderMode === "Layout Mode"
          ? `border-[1px] border-dashed border-gray-600${removeTopBorder ? " border-t-0" : ""}${removeLeftBorder ? " border-l-0" : ""}${removeRightBorder ? " border-r-0" : ""}`
          : ""
      } flex ${height} justify-center items-center text-center relative `}
      ref={(el) => setRef(el, 1)}
      data-drop="COLUMN"
      id={id}
      onDragOver={handleDuring}
      onMouseLeave={(e) => {
        const next = e.relatedTarget;
        const nextNode =
          next &&
          typeof next === "object" &&
          "nodeType" in next
            ? next
            : null;
        const stillInsideThisColumn =
          Boolean(nextNode) &&
          e.currentTarget.contains(nextNode);
        if (stillInsideThisColumn) return;
        onColumnPresetModalToggle?.(false);
      }}
    >
      <div
        className={`absolute top-0 left-0 z-[1000] transition-opacity ${
          showOption || isColumnPresetModalPinned
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <ServiceLayout layouts={layouts} element={element} clone={clone} remove={remove} scheduleDND={scheduleDND} openOffcavanas={openOffcavanas} ids={IDS} onUpdate={onUpdate} modal={modal} offcavanas="Column" changeSize={changeSize} changePosition={changePosition} dndHandle={dndHandle} onDragAble={onDragAble} onDragDisable={onDragDisable} isColumnPresetModalPinned={isColumnPresetModalPinned} onColumnPresetModalToggle={onColumnPresetModalToggle} onOpenPresetModal={onOpenPresetModal} onOpenPresetLoadModal={onOpenPresetLoadModal}/>
      </div>
      {hasColBgImage && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${backgroundImage})`,
              opacity: typeof opacityImage === "number" ? opacityImage : 1,
              filter: typeof colBgBlur === "number" && colBgBlur > 0 ? `blur(${colBgBlur}px)` : undefined,
            }}
          />
        </div>
      )}
      {useBorderRing ? (
        <div
          className="disable-container-area box-border w-full h-full min-h-0 min-w-0 flex flex-col"
          style={{
            borderRadius: r,
            padding: bw,
            background: brColor,
          }}
          onDragOver={handleDuring}
        >
          <div
            className="box-border flex min-h-0 w-full min-w-0 flex-1 flex-col"
            style={{
              borderRadius: innerRadius,
              padding: `${paddingY}px ${paddingX}px`,
              background: color,
              ...glassStyle,
            }}
            onDragOver={handleDuring}
          >
            {children}
          </div>
        </div>
      ) : (
        <div
          className="disable-container-area w-full h-full flex flex-col"
          style={{
            borderRadius: borderRadius,
            borderWidth: borderWidth,
            padding: `${paddingY}px ${paddingX}px`,
            borderColor: brColor,
            background: color,
            ...glassStyle,
          }}
          onDragOver={handleDuring}
        >
          {children}
        </div>
      )}
      {device === "Desktop" &&
      builderMode === "Layout Mode" &&
      !hideIdBadge &&
      !hasLayoutElements ? (
        <div
          className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center"
          aria-hidden
        >
          <span
            className="inline-flex min-w-0 max-w-[min(calc(100%-1.5rem),14rem)] items-center rounded-md border-0 bg-slate-200 px-2 py-0.5 text-[11px] font-mono font-bold leading-none text-slate-400 tabular-nums dark:bg-slate-500 dark:text-slate-100"
            title={String(id ?? "")}
          >
            <span className="truncate">{id}</span>
          </span>
        </div>
      ) : null}
    </div>
  );
}

export default Column;
