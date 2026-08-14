import { memo } from "react";
import { setColor, setFont } from "../../../../function";
import IconAwsome from "../../IconAwsome";
import { mergeBetweenElement } from "./betweenElementConfig";
import { SegmentedRichTextInner } from "../../richText/SegmentedRichText";
import { normalizeParagraph } from "../../richText/richTextParagraphModel";
import { usePanelPreview } from "../../panelPreviewStore";

const BetweenTextBlock = ({
  side,
  text,
  textParagraph,
  textColor,
  textFontFamily,
  fontSize,
  fontWeight,
  alignClass,
  style,
}) => {
  const hasRichParagraph =
    textParagraph &&
    Array.isArray(textParagraph.segments) &&
    textParagraph.segments.length > 0;
  const paragraph = hasRichParagraph
    ? normalizeParagraph(textParagraph)
    : normalizeParagraph({
          type: "paragraph",
          alignClass,
          segments: [{ text: String(text ?? ""), classes: [], style: {} }],
        });
  return (
    <div
      data-between-text-side={side}
      data-between-part={`text-${side}`}
      className="min-w-0"
      style={{ ...style, maxWidth: "100%" }}
    >
      <SegmentedRichTextInner
        paragraph={paragraph}
        baseStyle={{
          color: textColor,
          fontSize: `${fontSize}px`,
          fontFamily: textFontFamily,
          /* Rich text uses segment classes (font-bold) as source of truth for emphasis. */
          fontWeight: hasRichParagraph ? 400 : fontWeight >= 700 ? 700 : 400,
          lineHeight: 1.1,
          margin: 0,
        }}
      />
    </div>
  );
};

const BetweenElement = ({
  elementData,
  selected,
  hover,
  animationForElement,
  theme,
  builderMode,
}) => {
  const previewData = usePanelPreview("btw", elementData?.id);
  const data = mergeBetweenElement(previewData || elementData);
  const useLayoutSelectionFrame = builderMode === "Layout Mode" && selected;
  const showLeftText = data.betweenTextMode === "left" || data.betweenTextMode === "both";
  const showRightText = data.betweenTextMode === "right" || data.betweenTextMode === "both";
  const isLeftOnly = data.betweenTextMode === "left";
  const isRightOnly = data.betweenTextMode === "right";
  const isBoth = data.betweenTextMode === "both";
  const showLeftLine = data.betweenTextMode !== "right";
  const showRightLine = data.betweenTextMode !== "left";

  const frameOpacityRaw = Number(data.betweenFrameColorOpacity);
  const frameOpacity = Number.isFinite(frameOpacityRaw)
    ? Math.max(0, Math.min(255, frameOpacityRaw))
    : 255;
  const glassLevelRaw = Number(data.betweenGlass);
  const glassLevel = Number.isFinite(glassLevelRaw)
    ? Math.max(0, Math.min(100, glassLevelRaw))
    : 55;
  const glassRatio = glassLevel / 100;
  const glassFillOpacity = Math.round(
    Math.max(10, Math.min(170, frameOpacity * (0.16 + glassRatio * 0.48)))
  );
  const glassBlurPx = Math.max(0, Math.min(22, glassRatio * 22));
  const glassSaturatePct = Math.round(100 + glassRatio * 70);
  const frameGlassStyle = data.betweenFrameEnabled
    ? {
        backgroundColor: setColor(theme, data.betweenFrameColor, glassFillOpacity),
        backdropFilter: `blur(${glassBlurPx}px) saturate(${glassSaturatePct}%)`,
        WebkitBackdropFilter: `blur(${glassBlurPx}px) saturate(${glassSaturatePct}%)`,
      }
    : {
        backgroundColor: "transparent",
      };
  const textColor = "#111827";
  const iconColor = setColor(theme, data.betweenIconColor, data.betweenIconColorOpacity ?? 255);
  const iconBgColor = setColor(theme, data.betweenIconBgColor, data.betweenIconBgOpacity ?? 255);
  const iconShape = data.betweenIconShape === "rounded" ? "rounded" : "circle";
  const iconCornerRaw = Number(data.betweenIconCornerRadius);
  const iconCornerRadius = Number.isFinite(iconCornerRaw) ? iconCornerRaw : 12;
  const iconBorderRadius =
    iconShape === "circle"
      ? "50%"
      : `${Math.min(iconCornerRadius, Number(data.betweenIconCircleSize) / 2 || 0)}px`;
  const lineColor = setColor(theme, data.betweenLineColor, data.betweenLineOpacity ?? 255);
  const textFontFamily = setFont(theme?.text?.value) || undefined;
  const insetX = Math.max(0, Number(data.betweenInsetX) || 0);
  const insetY = Math.max(0, Number(data.betweenInsetY) || 0);
  const innerPadX = data.betweenFrameEnabled ? Math.max(2, 32 - insetX) : 0;
  const innerPadY = data.betweenFrameEnabled ? Math.max(2, 20 - insetY) : 0;

  return (
    <div
      className={`w-full ${animationForElement || ""} ${
        !useLayoutSelectionFrame && selected
          ? "rounded-md border border-dashed border-red-400 bg-red-300/10 p-2"
          : ""
      }`}
      style={{ marginTop: data.betweenMarginTop, marginBottom: data.betweenMarginBottom }}
      onMouseEnter={() => hover?.({ id: data.id })}
      onMouseLeave={() => hover?.(false)}
    >
      <div className={useLayoutSelectionFrame ? "relative px-0 py-2" : ""}>
        <div
          className={
            useLayoutSelectionFrame
              ? "origin-center scale-[0.96] transform-gpu transition-transform duration-150"
              : ""
          }
        >
      {isBoth ? (
        <div
          className="grid w-full items-center rounded-[18px]"
          style={{
            gridTemplateColumns: "minmax(0,1fr) auto minmax(0,1fr)",
            columnGap: `${data.betweenLineGap}px`,
            ...frameGlassStyle,
            borderRadius: `${data.betweenRadius}px`,
            paddingLeft: `${innerPadX}px`,
            paddingRight: `${innerPadX}px`,
            paddingTop: `${innerPadY}px`,
            paddingBottom: `${innerPadY}px`,
          }}
        >
          <div className="flex min-w-0 items-center">
            <BetweenTextBlock
              side="left"
              text={data.betweenLeftText}
              textParagraph={data.betweenLeftTextParagraph}
              textColor={textColor}
              textFontFamily={textFontFamily}
              fontSize={data.betweenFontSize}
              fontWeight={data.betweenBold ? 700 : 500}
              alignClass="text-left"
              style={{ flex: "0 1 auto", minWidth: 0 }}
            />
            <div className="ml-2 h-0 min-w-0 flex-1 border-b" style={{
              borderBottomStyle: data.betweenLineStyle,
              borderBottomWidth: `${data.betweenLineWidth}px`,
              borderBottomColor: lineColor,
            }} />
          </div>

          <div
            className="inline-flex shrink-0 items-center justify-center"
            data-between-icon-trigger="true"
            data-between-part="icon"
            style={{
              width: `${data.betweenIconCircleSize}px`,
              height: `${data.betweenIconCircleSize}px`,
              backgroundColor: iconBgColor,
              borderRadius: iconBorderRadius,
            }}
          >
            <IconAwsome
              iconName={data.betweenIcon?.name}
              iconType={data.betweenIcon?.type}
              style={{ color: iconColor, fontSize: `${data.betweenIconSize}px` }}
            />
          </div>

          <div className="flex min-w-0 items-center">
            <div className="mr-2 h-0 min-w-0 flex-1 border-b" style={{
              borderBottomStyle: data.betweenLineStyle,
              borderBottomWidth: `${data.betweenLineWidth}px`,
              borderBottomColor: lineColor,
            }} />
            <BetweenTextBlock
              side="right"
              text={data.betweenRightText}
              textParagraph={data.betweenRightTextParagraph}
              textColor={textColor}
              textFontFamily={textFontFamily}
              fontSize={data.betweenFontSize}
              fontWeight={data.betweenBold ? 700 : 500}
              alignClass="text-right"
              style={{ flex: "0 1 auto", minWidth: 0 }}
            />
          </div>
        </div>
      ) : (
      <div
        className="flex w-full items-center rounded-[18px]"
        style={{
          columnGap: `${data.betweenLineGap}px`,
          ...frameGlassStyle,
          borderRadius: `${data.betweenRadius}px`,
          paddingLeft: `${innerPadX}px`,
          paddingRight: `${innerPadX}px`,
          paddingTop: `${innerPadY}px`,
          paddingBottom: `${innerPadY}px`,
        }}
      >
        {showLeftText ? (
          <BetweenTextBlock
            side="left"
            text={data.betweenLeftText}
            textParagraph={data.betweenLeftTextParagraph}
            textColor={textColor}
            textFontFamily={textFontFamily}
            fontSize={data.betweenFontSize}
            fontWeight={data.betweenBold ? 700 : 500}
            alignClass="text-left"
            style={{ flex: "0 0 auto" }}
          />
        ) : null}

        {showLeftLine ? (
          <div className="flex min-w-0 flex-1 items-center">
            <div
              className="h-0 min-w-0 flex-1"
              style={{
                borderBottomStyle: data.betweenLineStyle,
                borderBottomWidth: `${data.betweenLineWidth}px`,
                borderBottomColor: lineColor,
              }}
            />
          </div>
        ) : null}

        <div
          className={`inline-flex shrink-0 items-center justify-center ${isLeftOnly ? "ml-auto" : ""}`}
          data-between-icon-trigger="true"
          data-between-part="icon"
          style={{
            width: `${data.betweenIconCircleSize}px`,
            height: `${data.betweenIconCircleSize}px`,
            backgroundColor: iconBgColor,
            borderRadius: iconBorderRadius,
          }}
        >
          <IconAwsome
            iconName={data.betweenIcon?.name}
            iconType={data.betweenIcon?.type}
            style={{ color: iconColor, fontSize: `${data.betweenIconSize}px` }}
          />
        </div>

        {showRightLine ? (
          <div className="flex min-w-0 flex-1 items-center">
            <div
              className="h-0 min-w-0 flex-1"
              style={{
                borderBottomStyle: data.betweenLineStyle,
                borderBottomWidth: `${data.betweenLineWidth}px`,
                borderBottomColor: lineColor,
              }}
            />
          </div>
        ) : null}

        {showRightText ? (
          <BetweenTextBlock
            side="right"
            text={data.betweenRightText}
            textParagraph={data.betweenRightTextParagraph}
            textColor={textColor}
            textFontFamily={textFontFamily}
            fontSize={data.betweenFontSize}
            fontWeight={data.betweenBold ? 700 : 500}
            alignClass="text-right"
            style={{ flex: "0 0 auto" }}
          />
        ) : null}
      </div>
      )}
        </div>
        {useLayoutSelectionFrame && (
          <>
            <div className="pointer-events-none absolute left-[-2px] right-[-2px] top-[1px] bottom-[1px] rounded-md bg-red-300/10" />
            <span className="pointer-events-none absolute left-[-1px] top-[2px] h-2.5 w-2.5 border-l-2 border-t-2 border-red-400" />
            <span className="pointer-events-none absolute right-[-1px] top-[2px] h-2.5 w-2.5 border-r-2 border-t-2 border-red-400" />
            <span className="pointer-events-none absolute bottom-[2px] left-[-1px] h-2.5 w-2.5 border-b-2 border-l-2 border-red-400" />
            <span className="pointer-events-none absolute bottom-[2px] right-[-1px] h-2.5 w-2.5 border-b-2 border-r-2 border-red-400" />
          </>
        )}
      </div>
    </div>
  );
};

export default memo(BetweenElement);
