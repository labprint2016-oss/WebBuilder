import { Profiler, useCallback, useEffect, useLayoutEffect } from "react";
import {
  recordBuilderElementRender,
  recordBuilderElementRenderOccurrence,
  setBuilderPerformanceTarget,
  shouldRecordBuilderElementOccurrences,
  useBuilderElementMeasurementEnabled,
  useBuilderPerformanceEnabled,
} from "./builderPerformanceStore";

const ElementPerformanceBoundary = ({
  elementType,
  elementId,
  selected,
  children,
}) => {
  const auditEnabled = useBuilderPerformanceEnabled();
  const measurementEnabled = useBuilderElementMeasurementEnabled(elementId);
  useLayoutEffect(() => {
    if (!auditEnabled || !shouldRecordBuilderElementOccurrences()) return;
    recordBuilderElementRenderOccurrence({ elementType, elementId });
  });
  useEffect(() => {
    if (!auditEnabled || !selected || !elementId) return;
    setBuilderPerformanceTarget(elementType, elementId);
  }, [auditEnabled, elementId, elementType, selected]);
  const handleRender = useCallback(
    (_profilerId, phase, actualDuration, baseDuration) => {
      recordBuilderElementRender({
        elementType,
        elementId,
        phase,
        actualDuration,
        baseDuration,
      });
    },
    [elementId, elementType]
  );

  if (!measurementEnabled) return children;

  return (
    <Profiler
      id={`BuilderElement:${String(elementType || "unknown")}:${String(
        elementId || "unknown"
      )}`}
      onRender={handleRender}
    >
      {children}
    </Profiler>
  );
};

export default ElementPerformanceBoundary;
