import React, { memo, useMemo } from "react";
import { migrateLabelToParagraph, normalizeParagraph } from "./richTextParagraphModel";
import { segmentInlineStyle } from "./segmentInlineStyle";

/**
 * Clean DOM: one span per segment; className for Tailwind utilities;
 * inline style for dynamic color, fontSize, lineHeight, letterSpacing.
 */
function SegmentedRichTextInner({
  paragraph,
  baseClassName = "",
  baseStyle,
  "aria-label": ariaLabel,
}) {
  const doc = useMemo(
    () => normalizeParagraph(paragraph),
    [paragraph]
  );

  const { alignClass, segments } = doc;

  return (
    <div
      className={["block w-full break-words", alignClass, baseClassName]
        .filter(Boolean)
        .join(" ")}
      style={{ whiteSpace: "pre-wrap", overflowWrap: "break-word", ...baseStyle }}
      aria-label={ariaLabel}
    >
      {segments.map((seg, i) => {
        const cls = [...new Set(seg.classes || [])].join(" ").trim();
        const inline = segmentInlineStyle(seg.style);
        return (
          <span key={i} className={cls || undefined} style={inline}>
            {seg.text}
          </span>
        );
      })}
    </div>
  );
}

/**
 * Canvas element: memoized so parent re-renders (e.g. drag state) do not re-render text subtree.
 */
const SegmentedRichText = memo(
  function SegmentedRichText({
    renderSignature,
    elementData,
    themeTextClass,
    animationClass,
    selected,
    defaultColor,
    defaultFontSizePx = 14,
    /** ใช้ 0 เมื่อ parent จัด padding เอง (เช่น caption การ์ดสไลด์) */
    verticalMarginPx = 5,
  }) {
    const paragraph = useMemo(
      () => {
        void renderSignature;
        return migrateLabelToParagraph(elementData);
      },
      [renderSignature, elementData]
    );

    const baseStyle = useMemo(
      () => ({
        color: defaultColor,
        fontSize: defaultFontSizePx,
        marginTop: verticalMarginPx,
        marginBottom: verticalMarginPx,
      }),
      [defaultColor, defaultFontSizePx, verticalMarginPx]
    );

    const baseClassName = [
      themeTextClass,
      animationClass,
      selected ? "rounded-md border border-red-400 bg-red-300/10 p-2 border-dashed" : "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <SegmentedRichTextInner
        paragraph={paragraph}
        baseClassName={baseClassName}
        baseStyle={baseStyle}
      />
    );
  },
  (prev, next) =>
    prev.renderSignature === next.renderSignature &&
    prev.themeTextClass === next.themeTextClass &&
    prev.animationClass === next.animationClass &&
    prev.selected === next.selected &&
    prev.defaultColor === next.defaultColor &&
    prev.defaultFontSizePx === next.defaultFontSizePx &&
    prev.verticalMarginPx === next.verticalMarginPx
);

export default SegmentedRichText;
export { SegmentedRichTextInner };
