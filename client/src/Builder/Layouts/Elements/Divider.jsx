import { setColor } from "../../../../function";
import {
  DIVIDER_ELEMENT_DEFAULTS,
  mergeDividerElement,
} from "./dividerElementConfig";

const DividerElement = ({
  elementData,
  selected,
  hover,
  animationForElement,
  theme,
  builderMode,
}) => {
  const data = mergeDividerElement(elementData);
  const isLayoutMode = builderMode === "Layout Mode";
  const useLayoutSelectionFrame = isLayoutMode && selected;
  const borderColor = setColor(theme, data.dividerColor, data.dividerOpacity);
  const marginTopRaw = Number(data.dividerMarginTop);
  const marginBottomRaw = Number(data.dividerMarginBottom);
  const weightRaw = Number(data.dividerWeight);
  const marginTopPx = Number.isFinite(marginTopRaw)
    ? marginTopRaw
    : DIVIDER_ELEMENT_DEFAULTS.dividerMarginTop;
  const marginBottomPx = Number.isFinite(marginBottomRaw)
    ? marginBottomRaw
    : DIVIDER_ELEMENT_DEFAULTS.dividerMarginBottom;
  const borderWidth = Number.isFinite(weightRaw)
    ? Math.max(0.1, weightRaw)
    : DIVIDER_ELEMENT_DEFAULTS.dividerWeight;

  return (
    <div
      onMouseEnter={() => hover?.({ id: data.id })}
      onMouseLeave={() => hover?.(false)}
      className={`w-full ${animationForElement || ""} ${
        !useLayoutSelectionFrame && selected
          ? "rounded-md border border-dashed border-red-400 bg-red-300/10 p-2"
          : ""
      }`}
      style={{ marginTop: marginTopPx, marginBottom: marginBottomPx }}
    >
      <div className={useLayoutSelectionFrame ? "relative block w-full" : ""}>
        <div
          style={
            useLayoutSelectionFrame
              ? {
                  transform: "scale(0.94)",
                  transformOrigin: "center",
                  transition: "transform 150ms",
                }
              : undefined
          }
        >
          <div
            className="w-full"
            style={{
              borderTopStyle: data.dividerStyle,
              borderTopWidth: borderWidth,
              borderTopColor: borderColor,
            }}
          />
        </div>
        {useLayoutSelectionFrame && (
          <>
            <div className="pointer-events-none absolute left-[-7px] right-[-7px] top-[-12px] bottom-[-12px] rounded-md bg-red-300/10" />
            <span className="pointer-events-none absolute left-[-4px] top-[-11px] h-2.5 w-2.5 border-l-2 border-t-2 border-red-400" />
            <span className="pointer-events-none absolute right-[-6px] top-[-11px] h-2.5 w-2.5 border-r-2 border-t-2 border-red-400" />
            <span className="pointer-events-none absolute bottom-[-11px] left-[-4px] h-2.5 w-2.5 border-b-2 border-l-2 border-red-400" />
            <span className="pointer-events-none absolute bottom-[-11px] right-[-6px] h-2.5 w-2.5 border-b-2 border-r-2 border-red-400" />
          </>
        )}
      </div>
    </div>
  );
};

export default DividerElement;
