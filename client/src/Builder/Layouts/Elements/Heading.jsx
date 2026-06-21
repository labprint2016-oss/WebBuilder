import { setColor } from "../../../../function";
import {
  HEADING_ELEMENT_DEFAULTS,
  mergeHeadingElement,
} from "./headingElementConfig";
import HeadingDividerTextBlock from "./HeadingDividerTextBlock";

const Heading = ({
  elementData,
  selected,
  hover,
  theme,
  animationForElement,
  builderMode,
}) => {
  const { id } = elementData;
  const h = mergeHeadingElement(elementData);
  const label =
    typeof h.label === "string" ? h.label : HEADING_ELEMENT_DEFAULTS.label;

  const op1 = h.headingColorOpacity ?? 255;
  const c1 = setColor(theme, h.headingColor, op1);
  const gradientOn = Boolean(h.headingTextGradient) && h.headingColor2;
  const c2 = gradientOn
    ? setColor(
        theme,
        h.headingColor2,
        h.headingColor2Opacity ?? h.headingColorOpacity ?? 255
      )
    : null;
  const deg = Number(h.headingGradientDegrees);
  const gradientDeg = Number.isFinite(deg) ? deg : 90;

  const colorStyle = gradientOn
    ? {
        backgroundImage: `linear-gradient(${gradientDeg}deg, ${c1}, ${c2})`,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
      }
    : { color: c1 };

  const alignClass =
    h.headingAlign === "center"
      ? "text-center"
      : h.headingAlign === "right"
        ? "text-right"
        : "text-left";

  const fontSize = Math.min(
    72,
    Math.max(12, Number(h.headingFontSize) || 28)
  );
  const lineHeight = Math.min(
    2,
    Math.max(1, Number(h.headingLineHeight) || 1.35)
  );
  const letterSpacing = Math.min(
    8,
    Math.max(-2, Number(h.headingLetterSpacing) || 0)
  );
  const useLayoutSelectionFrame =
    builderMode === "Layout Mode" && selected;

  return (
    <div
      style={{
        marginTop: h.headingMarginTop ?? 0,
        marginBottom: h.headingMarginBottom ?? 0,
      }}
      className={`${theme?.textHeading?.value ?? ""} ${animationForElement} ${alignClass}`}
      onMouseDownCapture={(e) => {
        if (builderMode !== "Layout Mode") return;
        e.preventDefault();
      }}
      onMouseEnter={() => {
        hover({ id });
      }}
      onMouseLeave={() => hover(false)}
    >
      <div className={useLayoutSelectionFrame ? "relative block w-fit max-w-full" : ""}>
        <div
          className={
            useLayoutSelectionFrame
              ? "w-fit max-w-full origin-center scale-[0.94] transform-gpu transition-transform duration-150"
              : ""
          }
        >
          <HeadingDividerTextBlock
            theme={theme}
            elementData={elementData}
            colorStyle={colorStyle}
            fontSize={fontSize}
            fontWeight={h.headingBold ? 700 : 500}
            lineHeight={lineHeight}
            letterSpacing={letterSpacing}
            label={label}
          />
        </div>
        {useLayoutSelectionFrame && (
          <>
            <div className="pointer-events-none absolute left-[-7px] right-[-7px] top-[-4px] bottom-[-4px] rounded-md bg-red-300/10" />
            <span className="pointer-events-none absolute left-[-4px] top-[-3px] h-2.5 w-2.5 border-l-2 border-t-2 border-red-400" />
            <span className="pointer-events-none absolute right-[-6px] top-[-3px] h-2.5 w-2.5 border-r-2 border-t-2 border-red-400" />
            <span className="pointer-events-none absolute bottom-[-3px] left-[-4px] h-2.5 w-2.5 border-b-2 border-l-2 border-red-400" />
            <span className="pointer-events-none absolute bottom-[-3px] right-[-6px] h-2.5 w-2.5 border-b-2 border-r-2 border-red-400" />
          </>
        )}
      </div>
    </div>
  );
};

export default Heading;
