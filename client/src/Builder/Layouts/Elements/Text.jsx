import React, { memo } from "react";
import { setColor } from "../../../../function";
import SegmentedRichText from "../../richText/SegmentedRichText";

const Text = memo(function Text({
  elementData,
  selected,
  hover,
  isHover,
  theme,
  animationForElement,
  renderSignature,
  /** Layout Mode: กันเลือกข้อความ + ให้คลิกผ่านไปเลือก element / คีย์ลัด */
  builderMode,
}) {
  const { id } = elementData;

  const opctText = isHover ? 100 : 255;

  const defaultColor = setColor(theme, theme?.textColor[0], opctText);

  const isLayoutMode = builderMode === "Layout Mode";
  const layoutCanvasBlock =
    isLayoutMode ? "pointer-events-none select-none" : "";
  const useLayoutSelectionFrame = isLayoutMode && selected;
  const verticalMarginPx = elementData?.__tabsNestedCompactText ? 0 : 5;

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => {
        hover({ id });
      }}
      onMouseLeave={() => hover(false)}
      onMouseDownCapture={(e) => {
        if (!isLayoutMode) return;
        e.preventDefault();
      }}
    >
      <div className={layoutCanvasBlock || undefined}>
        <div className={useLayoutSelectionFrame ? "relative block w-full max-w-full" : ""}>
          <div
            className={
              useLayoutSelectionFrame
                ? "w-full max-w-full origin-center scale-[0.94] transform-gpu transition-transform duration-150"
                : ""
            }
          >
            <SegmentedRichText
              renderSignature={renderSignature}
              elementData={elementData}
              themeTextClass={theme?.text?.value}
              animationClass={animationForElement}
              selected={!useLayoutSelectionFrame && selected}
              defaultColor={defaultColor}
              defaultFontSizePx={14}
              verticalMarginPx={verticalMarginPx}
            />
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
    </div>
  );
},
(prev, next) =>
  prev.renderSignature === next.renderSignature &&
  prev.selected === next.selected &&
  prev.isHover === next.isHover &&
  prev.animationForElement === next.animationForElement &&
  prev.theme?.text?.value === next.theme?.text?.value &&
  prev.theme?.textColor?.[0] === next.theme?.textColor?.[0] &&
  prev.builderMode === next.builderMode);

export default Text;
