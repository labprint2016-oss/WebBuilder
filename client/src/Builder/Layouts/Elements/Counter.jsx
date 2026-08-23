import { useEffect, useMemo, useRef, useState } from "react";
import { setColor } from "../../../../function";
import { usePanelPreview } from "../../panelPreviewStore";
import {
  COUNTER_ELEMENT_DEFAULTS,
  mergeCounterElement,
} from "./counterElementConfig";

const finiteNumberOr = (value, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const clampNumber = (value, fallback) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const Counter = ({
  elementData,
  selected,
  hover,
  theme,
  animationForElement,
  builderMode,
}) => {
  const { id } = elementData;
  const previewData = usePanelPreview("ctn", id);
  const liveElementData = previewData || elementData;
  const merged = useMemo(
    () => mergeCounterElement(liveElementData),
    [liveElementData]
  );
  const committed = useMemo(
    () => mergeCounterElement(elementData),
    [elementData]
  );
  const hostRef = useRef(null);
  const frameRef = useRef(0);
  const hasCompletedRef = useRef(false);
  const [isInViewport, setIsInViewport] = useState(false);
  const [displayValue, setDisplayValue] = useState(
    clampNumber(committed.counterStartValue, COUNTER_ELEMENT_DEFAULTS.counterStartValue)
  );

  const startValue = clampNumber(
    committed.counterStartValue,
    COUNTER_ELEMENT_DEFAULTS.counterStartValue
  );
  const targetValue = clampNumber(
    committed.counterTargetValue,
    COUNTER_ELEMENT_DEFAULTS.counterTargetValue
  );
  const durationMs = Math.max(
    200,
    clampNumber(committed.counterDurationMs, COUNTER_ELEMENT_DEFAULTS.counterDurationMs)
  );
  const counterTrigger = committed.counterTrigger;
  const isBuilderCanvas =
    builderMode === "Layout Mode" || builderMode === "Editor Mode";
  const isLayoutMode = builderMode === "Layout Mode";
  // Builder (Layout/Editor) should stay static; play only on real webpage.
  const shouldPreviewAnimate = !isBuilderCanvas;

  useEffect(() => {
    hasCompletedRef.current = false;
    setIsInViewport(false);
    setDisplayValue(startValue);
  }, [id, startValue, targetValue, durationMs, counterTrigger, shouldPreviewAnimate]);

  useEffect(() => {
    if (isBuilderCanvas) {
      setIsInViewport(Boolean(shouldPreviewAnimate));
      return;
    }
    if (!shouldPreviewAnimate) {
      setIsInViewport(false);
      return;
    }
    if (counterTrigger !== "viewport") {
      setIsInViewport(true);
      return;
    }
    const node = hostRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setIsInViewport(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setIsInViewport(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [counterTrigger, id, shouldPreviewAnimate, isBuilderCanvas]);

  useEffect(() => {
    cancelAnimationFrame(frameRef.current);
    if (!isInViewport) {
      if (shouldPreviewAnimate) {
        setDisplayValue(startValue);
      }
      return;
    }
    if (hasCompletedRef.current) return;
    const delta = targetValue - startValue;
    if (delta === 0) {
      setDisplayValue(targetValue);
      hasCompletedRef.current = true;
      return;
    }
    const startedAt = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - startedAt) / durationMs);
      const eased = 1 - (1 - progress) * (1 - progress);
      const value = startValue + delta * eased;
      setDisplayValue(progress >= 1 ? targetValue : value);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        hasCompletedRef.current = true;
      }
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [
    durationMs,
    id,
    isInViewport,
    shouldPreviewAnimate,
    startValue,
    targetValue,
  ]);

  const color = setColor(theme, merged.counterColor, merged.counterColorOpacity ?? 255);
  const compositionColor = setColor(
    theme,
    merged.counterCompositionColor,
    merged.counterCompositionColorOpacity ?? 255
  );
  const compositionFontSize = Math.min(
    120,
    Math.max(10, Number(merged.counterCompositionFontSize) || 18)
  );
  const alignClass =
    merged.counterAlign === "left"
      ? "text-left"
      : merged.counterAlign === "right"
      ? "text-right"
      : "text-center";
  const inCounterRowGroup =
    typeof elementData?.counterRowGroupId === "string" &&
    elementData.counterRowGroupId.trim() !== "";
  const alignClassForInlineRow = inCounterRowGroup ? "text-center" : alignClass;
  const fontSize = Math.min(120, Math.max(12, Number(merged.counterFontSize) || 42));
  const compositionOn = Boolean(merged.counterCompositionEnabled);
  const compositionLeft =
    compositionOn && typeof merged.counterCompositionLeft === "string"
      ? merged.counterCompositionLeft
      : "";
  const compositionRight =
    compositionOn && typeof merged.counterCompositionRight === "string"
      ? merged.counterCompositionRight
      : "";
  /** 0–64 → translateY (ค่า - 32) px เลื่อนข้อความประกอบขึ้น–ลง */
  const compositionGapSlider = Math.min(
    64,
    Math.max(0, finiteNumberOr(merged.counterCompositionGapPx, 32))
  );
  const compositionTranslateYpx = compositionGapSlider - 32;
  /** ระยะแนวนอนระหว่างข้อความประกอบกับตัวเลข (คงที่) */
  const COMPOSITION_NUMBER_COLUMN_GAP_PX = 12;
  const compositionJustify =
    merged.counterAlign === "left"
      ? "justify-start"
      : merged.counterAlign === "right"
      ? "justify-end"
      : "justify-center";
  const numberFontWeight = merged.counterBold ? 700 : 500;
  const numberWidthCh = (() => {
    const asText = (n) => {
      const rounded = Math.round(Number(n) || 0);
      const absLen = String(Math.abs(rounded)).length;
      return rounded < 0 ? absLen + 1 : absLen;
    };
    return Math.max(1, asText(startValue), asText(targetValue));
  })();

  const marginTopRaw = Number(merged.counterMarginTop);
  const marginBottomRaw = Number(merged.counterMarginBottom);
  const marginTopPx = Number.isFinite(marginTopRaw)
    ? marginTopRaw
    : COUNTER_ELEMENT_DEFAULTS.counterMarginTop;
  const marginBottomPx = Number.isFinite(marginBottomRaw)
    ? marginBottomRaw
    : COUNTER_ELEMENT_DEFAULTS.counterMarginBottom;
  const useSelectionFrame = isLayoutMode && Boolean(selected);

  return (
    <div
      ref={hostRef}
      onMouseDownCapture={(e) => {
        if (!isLayoutMode) return;
        if (e.button !== 0) return;
        // In inline row groups, preventDefault can suppress click selection
        // on sortable wrappers after copy/paste.
        if (!inCounterRowGroup) {
          e.preventDefault();
        }
        const selection =
          typeof window !== "undefined" &&
          typeof window.getSelection === "function"
            ? window.getSelection()
            : null;
        if (selection && selection.rangeCount > 0) selection.removeAllRanges();
      }}
      onMouseEnter={() => hover({ id })}
      onMouseLeave={() => hover(false)}
      className={`block ${
        inCounterRowGroup ? "w-fit max-w-full shrink-0" : "w-full"
      } ${animationForElement} ${alignClassForInlineRow}`}
      style={{
        marginTop: marginTopPx,
        marginBottom: marginBottomPx,
        ...(previewData ? { transition: "none" } : null),
      }}
    >
      <div
        data-counter-hover-target="true"
        className="relative inline-block w-fit max-w-full"
      >
        <div
          className={
            useSelectionFrame
              ? "w-fit max-w-full origin-center scale-[0.94] transform-gpu transition-transform duration-150"
              : ""
          }
        >
          <div
            className={`flex w-auto max-w-full flex-wrap items-baseline ${compositionJustify} leading-none`}
            style={{
              lineHeight: 1,
              columnGap: compositionOn ? COMPOSITION_NUMBER_COLUMN_GAP_PX : 0,
            }}
          >
            {compositionLeft ? (
              <span
                data-counter-composition-id={id}
                className="break-words leading-none [font-variant-numeric:normal]"
                style={{
                  color: compositionColor,
                  fontSize: compositionFontSize,
                  fontWeight: numberFontWeight,
                  lineHeight: 1,
                  transform:
                    compositionTranslateYpx !== 0
                      ? `translateY(${compositionTranslateYpx}px)`
                      : undefined,
                }}
              >
                {compositionLeft}
              </span>
            ) : null}
            <span
              data-counter-number-id={id}
              className="leading-none"
              style={{
                color,
                fontSize,
                fontWeight: numberFontWeight,
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
                display: "inline-block",
                minWidth: `${numberWidthCh}ch`,
              }}
            >
              {Math.round(shouldPreviewAnimate ? displayValue : targetValue)}
            </span>
            {compositionRight ? (
              <span
                data-counter-composition-id={id}
                className="break-words leading-none [font-variant-numeric:normal]"
                style={{
                  color: compositionColor,
                  fontSize: compositionFontSize,
                  fontWeight: numberFontWeight,
                  lineHeight: 1,
                  transform:
                    compositionTranslateYpx !== 0
                      ? `translateY(${compositionTranslateYpx}px)`
                      : undefined,
                }}
              >
                {compositionRight}
              </span>
            ) : null}
          </div>
        </div>
        {useSelectionFrame && (
          <>
            <div className="pointer-events-none absolute inset-[-8px] rounded-md bg-red-300/10" />
            <span className="pointer-events-none absolute left-[-7px] top-[-7px] h-2.5 w-2.5 border-l-2 border-t-2 border-red-400" />
            <span className="pointer-events-none absolute right-[-7px] top-[-7px] h-2.5 w-2.5 border-r-2 border-t-2 border-red-400" />
            <span className="pointer-events-none absolute bottom-[-7px] left-[-7px] h-2.5 w-2.5 border-b-2 border-l-2 border-red-400" />
            <span className="pointer-events-none absolute bottom-[-7px] right-[-7px] h-2.5 w-2.5 border-b-2 border-r-2 border-red-400" />
          </>
        )}
      </div>
    </div>
  );
};

export default Counter;
