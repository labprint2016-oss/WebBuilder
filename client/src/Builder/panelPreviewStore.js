import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import {
  beginBuilderPerformanceTransaction,
  cancelBuilderPerformanceTransaction,
  collectNestedCanvasElementIds,
  finishBuilderPerformanceTransaction,
  finishBuilderPerformanceTransactionAfterPaint,
  isBuilderPerformanceEnabled,
  setBuilderPerformanceTarget,
} from "./performance/builderPerformanceStore";

const snapshots = new Map();
const listeners = new Map();
const scopedLayoutSnapshots = new WeakSet();
const EMPTY_SNAPSHOT = null;
export const TOP_BAR_PREVIEW_TYPE = "Top";
export const TOP_BAR_PREVIEW_ID = "top-bar";
export const TOP_BAR_NODE_SELECTOR = "[data-builder-topbar='true']";
export const FOOTER_BAR_NODE_SELECTOR = "[data-builder-footer='true']";

const legacyPerfEnabled =
  typeof window !== "undefined" &&
  (new URLSearchParams(window.location.search).get("builderSectionPerf") === "1" ||
    new URLSearchParams(window.location.search).get("structurePerf") === "1" ||
    new URLSearchParams(window.location.search).get("dataSliderPerf") === "1" ||
    new URLSearchParams(window.location.search).get("categoriesPerf") === "1" ||
    new URLSearchParams(window.location.search).get("tabsPerf") === "1" ||
    new URLSearchParams(window.location.search).get("accordionPerf") === "1" ||
    new URLSearchParams(window.location.search).get("postPerf") === "1" ||
    new URLSearchParams(window.location.search).get("listItemsPerf") === "1" ||
    new URLSearchParams(window.location.search).get("listIconsPerf") === "1" ||
    new URLSearchParams(window.location.search).get("listImagesPerf") === "1" ||
    new URLSearchParams(window.location.search).get("listBoxPerf") === "1" ||
    new URLSearchParams(window.location.search).get("carouselPerf") === "1" ||
    new URLSearchParams(window.location.search).get("dataTablePerf") === "1" ||
    new URLSearchParams(window.location.search).get("betweenPerf") === "1" ||
    new URLSearchParams(window.location.search).get("imageHoverPerf") === "1" ||
    new URLSearchParams(window.location.search).get("overlayPerf") === "1" ||
    new URLSearchParams(window.location.search).get("textPerf") === "1" ||
    new URLSearchParams(window.location.search).get("headingPerf") === "1" ||
    new URLSearchParams(window.location.search).get("buttonGroupPerf") === "1");

const isPerfEnabled = () =>
  legacyPerfEnabled || isBuilderPerformanceEnabled();

let activeSliderPerf = null;
let activePanelOpenPerf = null;
let nextSliderGestureId = 1;
let nextPanelLayoutCommitToken = 1;
const pendingPanelLayoutCommits = new Map();

const keyFor = (type, id) => `${type}:${String(id ?? "")}`;
const shallowEqual = (a, b) => {
  if (Object.is(a, b)) return true;
  if (!a || !b || typeof a !== "object" || typeof b !== "object") return false;
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((key) => Object.is(a[key], b[key]));
};
const roundMs = (value) => Math.round(value * 100) / 100;

function addTopDuration(target, item, durationKey) {
  target.push(item);
  target.sort((a, b) => b[durationKey] - a[durationKey]);
  if (target.length > 5) target.length = 5;
}

function recordLongTaskEntries(perf, entries, stoppedAt = Infinity) {
  entries.forEach((entry) => {
    if (
      entry.startTime < perf.startedAt ||
      entry.startTime >= stoppedAt
    ) {
      return;
    }
    perf.longTaskCount += 1;
    perf.longTaskTotalMs += entry.duration;
    perf.longTaskMaxMs = Math.max(perf.longTaskMaxMs, entry.duration);
    addTopDuration(
      perf.topLongTasks,
      {
        atMs: roundMs(entry.startTime - perf.startedAt),
        duration: roundMs(entry.duration),
        name: entry.name || "self",
      },
      "duration"
    );
  });
}

function startSliderGestureDiagnostics(perf) {
  perf.frameMonitorActive = true;
  perf.frameRequestId = null;
  perf.lastFrameAt = perf.startedAt;
  let skippedInitialFrames = 0;
  const onFrame = (timestamp) => {
    if (
      !perf.frameMonitorActive ||
      activeSliderPerf?.gestureId !== perf.gestureId
    ) {
      return;
    }
    // Grab hitch + first preview publish are not in-gesture smoothness.
    if (skippedInitialFrames < 2) {
      skippedInitialFrames += 1;
      perf.lastFrameAt = timestamp;
      perf.frameRequestId = requestAnimationFrame(onFrame);
      return;
    }
    const gap = timestamp - perf.lastFrameAt;
    perf.frameCount += 1;
    perf.frameGaps.push(gap);
    perf.frameGapTotalMs += gap;
    perf.frameGapMaxMs = Math.max(perf.frameGapMaxMs, gap);
    if (gap > 24) perf.droppedFrameCount += 1;
    if (gap > 50) perf.severeFrameCount += 1;
    addTopDuration(
      perf.topFrameGaps,
      {
        atMs: roundMs(timestamp - perf.startedAt),
        gapMs: roundMs(gap),
      },
      "gapMs"
    );
    perf.lastFrameAt = timestamp;
    perf.frameRequestId = requestAnimationFrame(onFrame);
  };
  perf.frameRequestId = requestAnimationFrame(onFrame);

  const PerformanceObserverCtor = window.PerformanceObserver;
  if (typeof PerformanceObserverCtor !== "function") return;
  if (
    Array.isArray(PerformanceObserverCtor.supportedEntryTypes) &&
    !PerformanceObserverCtor.supportedEntryTypes.includes("longtask")
  ) {
    return;
  }
  try {
    perf.longTaskObserver = new PerformanceObserverCtor((list) => {
      recordLongTaskEntries(perf, list.getEntries(), perf.diagnosticsStoppedAt);
    });
    perf.longTaskObserver.observe({ type: "longtask", buffered: false });
    perf.longTaskSupported = true;
  } catch {
    perf.longTaskObserver?.disconnect();
    perf.longTaskObserver = null;
  }
}

function stopSliderGestureDiagnostics(perf) {
  if (!perf || perf.diagnosticsStoppedAt !== Infinity) return;
  const stoppedAt = performance.now();
  perf.diagnosticsStoppedAt = stoppedAt;
  perf.frameMonitorActive = false;
  if (perf.frameRequestId != null) {
    cancelAnimationFrame(perf.frameRequestId);
    perf.frameRequestId = null;
  }
  if (perf.longTaskObserver) {
    recordLongTaskEntries(
      perf,
      perf.longTaskObserver.takeRecords(),
      stoppedAt
    );
    perf.longTaskObserver.disconnect();
    perf.longTaskObserver = null;
  }
}

function emit(key) {
  listeners.get(key)?.forEach((listener) => listener());
}

export function publishPanelPreview(type, targetIds, data) {
  const ids = Array.isArray(targetIds) ? targetIds : [targetIds];
  ids.filter(Boolean).forEach((id) => {
    const key = keyFor(type, id);
    snapshots.set(key, data);
    emit(key);
  });
}

export function clearPanelPreview(type, targetIds) {
  const ids = Array.isArray(targetIds) ? targetIds : [targetIds];
  ids.filter(Boolean).forEach((id) => {
    const key = keyFor(type, id);
    if (!snapshots.has(key)) return;
    snapshots.delete(key);
    emit(key);
  });
}

export function clearAllPanelPreviews() {
  [...snapshots.keys()].forEach((key) => {
    snapshots.delete(key);
    emit(key);
  });
}

export function hasActivePanelPreviews() {
  return snapshots.size > 0;
}

export function markScopedLayoutSnapshot(layouts) {
  if (layouts && typeof layouts === "object") {
    scopedLayoutSnapshots.add(layouts);
  }
  return layouts;
}

export function isScopedLayoutSnapshot(layouts) {
  return Boolean(
    layouts &&
      typeof layouts === "object" &&
      scopedLayoutSnapshots.has(layouts)
  );
}

export function completeScopedLayoutSnapshot(layouts) {
  if (layouts && typeof layouts === "object") {
    scopedLayoutSnapshots.delete(layouts);
  }
}

function deletePendingPanelLayoutCommit(token) {
  const pending = pendingPanelLayoutCommits.get(token);
  if (!pending) return;
  if (pending.fallbackTimer != null) clearTimeout(pending.fallbackTimer);
  if (pending.paintFallbackTimer != null) {
    clearTimeout(pending.paintFallbackTimer);
  }
  pendingPanelLayoutCommits.delete(token);
}

export function beginPanelLayoutCommit() {
  const token = nextPanelLayoutCommitToken++;
  const fallbackTimer = setTimeout(
    () => deletePendingPanelLayoutCommit(token),
    5000
  );
  pendingPanelLayoutCommits.set(token, {
    token,
    observed: false,
    cleanupScheduled: false,
    fallbackTimer,
    paintFallbackTimer: null,
  });
  return token;
}

export function hasPendingPanelLayoutCommit() {
  return pendingPanelLayoutCommits.size > 0;
}

export function observePendingPanelLayoutCommits() {
  let observedCount = 0;
  pendingPanelLayoutCommits.forEach((pending) => {
    pending.observed = true;
    observedCount += 1;
  });
  return observedCount;
}

export function completeObservedPanelLayoutCommitsAfterPaint() {
  pendingPanelLayoutCommits.forEach((pending, token) => {
    if (!pending.observed || pending.cleanupScheduled) return;
    pending.cleanupScheduled = true;
    const finish = () => deletePendingPanelLayoutCommit(token);
    pending.paintFallbackTimer = setTimeout(finish, 1000);
    if (typeof requestAnimationFrame !== "function") return;
    requestAnimationFrame(() => {
      requestAnimationFrame(finish);
    });
  });
}

export function usePanelPreview(type, id) {
  const key = keyFor(type, id);
  return useSyncExternalStore(
    (listener) => {
      let bucket = listeners.get(key);
      if (!bucket) {
        bucket = new Set();
        listeners.set(key, bucket);
      }
      bucket.add(listener);
      return () => {
        bucket.delete(listener);
        if (bucket.size === 0) listeners.delete(key);
      };
    },
    () => snapshots.get(key) ?? EMPTY_SNAPSHOT,
    () => EMPTY_SNAPSHOT
  );
}

export function startPanelSliderPerf(
  type,
  targetId,
  relatedElementIds = [],
  meta = {}
) {
  if (!isPerfEnabled()) return null;
  if (activeSliderPerf) {
    finishPanelSliderPerf(
      activeSliderPerf.commitReason || "superseded",
      activeSliderPerf.gestureId
    );
  }
  const now = performance.now();
  const gestureId = nextSliderGestureId++;
  activeSliderPerf = {
    gestureId,
    type,
    targetId: String(targetId ?? ""),
    startedAt: now,
    lastPreviewAt: now,
    previewCount: 0,
    previewIntervalTotal: 0,
    previewIntervalMax: 0,
    inputUpdateCount: 0,
    lastInputUpdateAt: null,
    lastMeasuredInputAt: null,
    interactionLatencyMaxMs: 0,
    inputUpdateIntervalTotal: 0,
    inputUpdateIntervalCount: 0,
    inputUpdateIntervalMax: 0,
    panelPreviewPublishBatchCount: 0,
    panelPreviewPublishBatchTotalMs: 0,
    panelPreviewPublishBatchMaxMs: 0,
    frameCount: 0,
    frameGaps: [],
    frameGapTotalMs: 0,
    frameGapMaxMs: 0,
    droppedFrameCount: 0,
    severeFrameCount: 0,
    topFrameGaps: [],
    longTaskSupported: false,
    longTaskCount: 0,
    longTaskTotalMs: 0,
    longTaskMaxMs: 0,
    topLongTasks: [],
    longTaskObserver: null,
    diagnosticsStoppedAt: Infinity,
    globalCommitCount: 0,
    globalCommitMs: 0,
    canvasCommits: 0,
    canvasActualMs: 0,
    canvasActualMaxMs: 0,
    previewCanvasCommits: 0,
    previewCanvasActualMs: 0,
    previewCanvasMaxMs: 0,
    finalCanvasCommits: 0,
    finalCanvasActualMs: 0,
    finalCanvasMaxMs: 0,
    phase: "preview",
    commitReason: null,
    sectionCacheHits: 0,
    sectionCacheMisses: 0,
    sectionCacheMissReasons: {},
    pendingFinalCommitObserved: false,
    scopedLayoutCacheActive: false,
    scopedLayoutSnapshotMatched: false,
    performanceTransactionId: beginBuilderPerformanceTransaction(
      "panel-slider",
      {
        label: meta.controlField
          ? `${String(type || "Panel")} / ${meta.controlField}`
          : `${String(type || "Panel")} / slider`,
        panelType: type,
        elementType: type,
        elementId: targetId,
        controlKind: "slider",
        controlField: meta.controlField || "slider",
        relatedElementIds,
      },
      { trackFrames: false }
    ),
  };
  startSliderGestureDiagnostics(activeSliderPerf);
  return gestureId;
}

export function markBuilderPanelOpen(type, targetId) {
  if (!isPerfEnabled()) return;
  setBuilderPerformanceTarget(type, targetId);
  if (activePanelOpenPerf?.performanceTransactionId != null) {
    finishBuilderPerformanceTransaction(
      activePanelOpenPerf.performanceTransactionId,
      {},
      { reason: "superseded" }
    );
  }
  activePanelOpenPerf = {
    type: String(type || ""),
    targetId: String(targetId ?? ""),
    startedAt: performance.now(),
    canvasCommits: 0,
    canvasActualMs: 0,
    performanceTransactionId: beginBuilderPerformanceTransaction(
      "panel-open",
      {
        label: `เปิด Panel / ${String(type || "Unknown")}`,
        panelType: type,
        elementType: type,
        elementId: targetId,
      },
      {
        trackFrames: false,
      }
    ),
  };
}

export function markBuilderPanelClosed() {
  if (!activePanelOpenPerf) return;
  cancelBuilderPerformanceTransaction(
    activePanelOpenPerf.performanceTransactionId
  );
  activePanelOpenPerf = null;
}

export function recordBuilderPanelOpenCanvasCommit(actualDuration) {
  if (!activePanelOpenPerf) return;
  activePanelOpenPerf.canvasCommits += 1;
  activePanelOpenPerf.canvasActualMs += actualDuration;
}

export function getBuilderPanelOpenStartedAt(type, targetId) {
  if (
    !activePanelOpenPerf ||
    activePanelOpenPerf.type !== String(type || "") ||
    activePanelOpenPerf.targetId !== String(targetId ?? "")
  ) {
    return null;
  }
  return activePanelOpenPerf.startedAt;
}

export function markBuilderPanelMounted(type, targetId) {
  if (
    !activePanelOpenPerf ||
    activePanelOpenPerf.type !== String(type || "") ||
    activePanelOpenPerf.targetId !== String(targetId ?? "")
  ) {
    return;
  }
  const perf = activePanelOpenPerf;
  activePanelOpenPerf = null;
  const finish = () => {
    const openToPaintMs =
      Math.round((performance.now() - perf.startedAt) * 100) / 100;
    finishBuilderPerformanceTransaction(
      perf.performanceTransactionId,
      {
        openToMountedMs: openToPaintMs,
        openToPaintMs,
        interactionToPaintMs: openToPaintMs,
        canvasCommits: perf.canvasCommits,
        canvasActualMs: perf.canvasActualMs,
      },
      { reason: "mounted" }
    );
  };
  finish();
}

export function recordPanelSliderPreviewUpdate(gestureId) {
  if (!activeSliderPerf || activeSliderPerf.gestureId !== gestureId) return;
  const now = performance.now();
  if (
    activeSliderPerf.lastInputUpdateAt != null &&
    activeSliderPerf.lastMeasuredInputAt !== activeSliderPerf.lastInputUpdateAt
  ) {
    activeSliderPerf.interactionLatencyMaxMs = Math.max(
      activeSliderPerf.interactionLatencyMaxMs,
      now - activeSliderPerf.lastInputUpdateAt
    );
    activeSliderPerf.lastMeasuredInputAt = activeSliderPerf.lastInputUpdateAt;
  }
  // Kept for compatibility: this is spacing between rAF-batched publishes,
  // not spacing between input events and not the synchronous publish work.
  const elapsed = now - activeSliderPerf.lastPreviewAt;
  activeSliderPerf.previewCount += 1;
  activeSliderPerf.previewIntervalTotal += elapsed;
  activeSliderPerf.previewIntervalMax = Math.max(
    activeSliderPerf.previewIntervalMax,
    elapsed
  );
  activeSliderPerf.lastPreviewAt = now;
}

export function recordPanelSliderInputUpdate(gestureId) {
  if (!activeSliderPerf || activeSliderPerf.gestureId !== gestureId) return;
  const now = performance.now();
  if (activeSliderPerf.lastInputUpdateAt != null) {
    const elapsed = now - activeSliderPerf.lastInputUpdateAt;
    activeSliderPerf.inputUpdateIntervalTotal += elapsed;
    activeSliderPerf.inputUpdateIntervalCount += 1;
    activeSliderPerf.inputUpdateIntervalMax = Math.max(
      activeSliderPerf.inputUpdateIntervalMax,
      elapsed
    );
  }
  activeSliderPerf.inputUpdateCount += 1;
  activeSliderPerf.lastInputUpdateAt = now;
}

export function recordPanelPreviewPublishBatch(durationMs, gestureId) {
  if (!activeSliderPerf || activeSliderPerf.gestureId !== gestureId) return;
  activeSliderPerf.panelPreviewPublishBatchCount += 1;
  activeSliderPerf.panelPreviewPublishBatchTotalMs += durationMs;
  activeSliderPerf.panelPreviewPublishBatchMaxMs = Math.max(
    activeSliderPerf.panelPreviewPublishBatchMaxMs,
    durationMs
  );
}

export function stopPanelSliderGestureDiagnostics(gestureId) {
  if (!activeSliderPerf || activeSliderPerf.gestureId !== gestureId) return;
  stopSliderGestureDiagnostics(activeSliderPerf);
}

export function beginPanelSliderFinalCommit(gestureId, reason) {
  if (!activeSliderPerf || activeSliderPerf.gestureId !== gestureId) return;
  activeSliderPerf.phase = "final";
  activeSliderPerf.commitReason = String(reason || "commit");
}

export function recordPanelSliderGlobalCommit(durationMs, gestureId) {
  if (!activeSliderPerf || activeSliderPerf.gestureId !== gestureId) return;
  activeSliderPerf.globalCommitCount += 1;
  activeSliderPerf.globalCommitMs += durationMs;
}

export function recordPanelSliderCanvasCommit(actualDuration) {
  if (!activeSliderPerf) return;
  activeSliderPerf.canvasCommits += 1;
  activeSliderPerf.canvasActualMs += actualDuration;
  activeSliderPerf.canvasActualMaxMs = Math.max(
    activeSliderPerf.canvasActualMaxMs,
    actualDuration
  );
  if (activeSliderPerf.phase === "final") {
    activeSliderPerf.finalCanvasCommits += 1;
    activeSliderPerf.finalCanvasActualMs += actualDuration;
    activeSliderPerf.finalCanvasMaxMs = Math.max(
      activeSliderPerf.finalCanvasMaxMs,
      actualDuration
    );
  } else {
    activeSliderPerf.previewCanvasCommits += 1;
    activeSliderPerf.previewCanvasActualMs += actualDuration;
    activeSliderPerf.previewCanvasMaxMs = Math.max(
      activeSliderPerf.previewCanvasMaxMs,
      actualDuration
    );
  }
}

export function recordPanelSliderSectionCacheStats(stats) {
  if (!activeSliderPerf || activeSliderPerf.phase !== "final" || !stats) return;
  activeSliderPerf.sectionCacheHits = stats.cacheHits || 0;
  activeSliderPerf.sectionCacheMisses = stats.cacheMisses || 0;
  activeSliderPerf.sectionCacheMissReasons = { ...(stats.missReasons || {}) };
  activeSliderPerf.pendingFinalCommitObserved = Boolean(
    stats.pendingFinalCommitObserved
  );
  activeSliderPerf.scopedLayoutCacheActive = Boolean(
    stats.scopedLayoutCacheActive
  );
  activeSliderPerf.scopedLayoutSnapshotMatched = Boolean(
    stats.scopedLayoutSnapshotMatched
  );
}

export function finishPanelSliderPerf(
  reason = "commit",
  gestureId = activeSliderPerf?.gestureId
) {
  if (!activeSliderPerf || activeSliderPerf.gestureId !== gestureId) return;
  const perf = activeSliderPerf;
  stopSliderGestureDiagnostics(perf);
  activeSliderPerf = null;
  const averageInterval =
    perf.previewCount > 0
      ? perf.previewIntervalTotal / perf.previewCount
      : 0;
  const averageInputInterval =
    perf.inputUpdateIntervalCount > 0
      ? perf.inputUpdateIntervalTotal / perf.inputUpdateIntervalCount
      : 0;
  const averagePublishDuration =
    perf.panelPreviewPublishBatchCount > 0
      ? perf.panelPreviewPublishBatchTotalMs /
        perf.panelPreviewPublishBatchCount
      : 0;
  finishBuilderPerformanceTransactionAfterPaint(
    perf.performanceTransactionId,
    {
      interactionToPaintMs: roundMs(
        Math.max(
          perf.interactionLatencyMaxMs,
          perf.canvasActualMaxMs,
          perf.globalCommitMs
        )
      ),
      gestureActiveDurationMs: roundMs(
        perf.diagnosticsStoppedAt - perf.startedAt
      ),
      previewUpdateCount: perf.previewCount,
      previewIntervalAvgMs: roundMs(averageInterval),
      previewIntervalMaxMs: roundMs(perf.previewIntervalMax),
      inputUpdateCount: perf.inputUpdateCount,
      inputUpdateIntervalAvgMs: roundMs(averageInputInterval),
      inputUpdateIntervalMaxMs: roundMs(perf.inputUpdateIntervalMax),
      panelPreviewPublishBatchAvgMs: roundMs(averagePublishDuration),
      panelPreviewPublishBatchMaxMs: roundMs(
        perf.panelPreviewPublishBatchMaxMs
      ),
      frameCount: perf.frameCount,
      frameGapMaxMs: roundMs(perf.frameGapMaxMs),
      frameGapP95Ms: roundMs(
        (() => {
          const sorted = [...(perf.frameGaps || [])].sort((a, b) => a - b);
          if (!sorted.length) return 0;
          return sorted[Math.max(0, Math.ceil(sorted.length * 0.95) - 1)];
        })()
      ),
      droppedFrameCount: perf.droppedFrameCount,
      severeFrameCount: perf.severeFrameCount,
      longTaskCount: perf.longTaskCount,
      longTaskTotalMs: roundMs(perf.longTaskTotalMs),
      longTaskMaxMs: roundMs(perf.longTaskMaxMs),
      globalCommitMs: roundMs(perf.globalCommitMs),
      canvasCommits: perf.canvasCommits,
      canvasActualMs: roundMs(perf.canvasActualMs),
      canvasMaxMs: roundMs(perf.canvasActualMaxMs),
      finalCanvasActualMs: roundMs(perf.finalCanvasActualMs),
      finalCanvasMaxMs: roundMs(perf.finalCanvasMaxMs),
    },
    {
      reason,
      interactionStartedAt: performance.now(),
      frameGaps: perf.frameGaps,
    }
  );
}

export function usePanelSliderPreview({
  type,
  targetIds,
  mirroredTargetIds = [],
  selectMirroredData = null,
  data,
  setData,
  onCommit,
  disabled = false,
  minPreviewIntervalMs = 0,
}) {
  const rawIds = (Array.isArray(targetIds) ? targetIds : [targetIds])
    .filter(Boolean)
    .map(String);
  const targetKey = JSON.stringify(rawIds);
  const normalizedIds = useMemo(() => JSON.parse(targetKey), [targetKey]);
  const rawMirroredIds = (
    Array.isArray(mirroredTargetIds) ? mirroredTargetIds : [mirroredTargetIds]
  )
    .filter(Boolean)
    .map(String);
  const mirroredTargetKey = JSON.stringify(rawMirroredIds);
  const normalizedMirroredIds = useMemo(
    () => JSON.parse(mirroredTargetKey),
    [mirroredTargetKey]
  );
  const latestRef = useRef(data);
  const commitRef = useRef(onCommit);
  const activeRef = useRef(false);
  const frameRef = useRef(null);
  const clearFrameRef = useRef(null);
  const publishPreviewRef = useRef(true);
  const lastPreviewPublishedAtRef = useRef(0);
  const generationRef = useRef(0);
  const gestureIdRef = useRef(null);
  const controlFieldRef = useRef("");

  if (
    !activeRef.current ||
    latestRef.current == null ||
    String(latestRef.current.id ?? "") !== String(data?.id ?? "")
  ) {
    latestRef.current = data;
  }
  commitRef.current = onCommit;
  const publishLatest = useCallback((gestureId) => {
    const shouldPublishMirrored =
      normalizedMirroredIds.length > 0 &&
      typeof selectMirroredData === "function";
    const mirroredData = shouldPublishMirrored
      ? selectMirroredData(latestRef.current)
      : null;
    const startedAt = gestureId == null ? null : performance.now();
    publishPanelPreview(type, normalizedIds, latestRef.current);
    if (shouldPublishMirrored) {
      publishPanelPreview(
        type,
        normalizedMirroredIds,
        mirroredData
      );
    }
    if (startedAt != null) {
      recordPanelPreviewPublishBatch(performance.now() - startedAt, gestureId);
    }
  }, [
    normalizedIds,
    normalizedMirroredIds,
    selectMirroredData,
    type,
  ]);
  const clearLatest = useCallback(() => {
    clearPanelPreview(type, normalizedIds);
    clearPanelPreview(type, normalizedMirroredIds);
  }, [normalizedIds, normalizedMirroredIds, type]);

  const cancelScheduledClear = useCallback(() => {
    if (clearFrameRef.current != null) {
      cancelAnimationFrame(clearFrameRef.current);
      clearFrameRef.current = null;
    }
  }, []);

  const updateSlider = useCallback(
    (updater, options = undefined) => {
      if (disabled) return latestRef.current;
      const previous = latestRef.current;
      const next =
        typeof updater === "function" ? updater(previous) : updater;
      if (shallowEqual(next, previous)) return previous;
      cancelScheduledClear();
      generationRef.current += 1;
      if (options?.trackPerf !== false) {
        const controlField = String(options.controlField || "");
        if (!activeRef.current || controlField !== controlFieldRef.current) {
          activeRef.current = true;
          controlFieldRef.current = controlField;
          gestureIdRef.current = startPanelSliderPerf(
            type,
            normalizedIds[0],
            collectNestedCanvasElementIds(next),
            { controlField }
          );
        } else {
          recordPanelSliderInputUpdate(gestureIdRef.current);
        }
      }
      latestRef.current = next;
      publishPreviewRef.current = options?.publish !== false;
      if (options?.setData !== false) {
        setData(next);
      }
      if (options?.publish === false) {
        recordPanelSliderPreviewUpdate(gestureIdRef.current);
        return next;
      }
      if (frameRef.current == null) {
        const gestureId = gestureIdRef.current;
        const publishOnFrame = (now) => {
          const elapsed = now - lastPreviewPublishedAtRef.current;
          if (
            minPreviewIntervalMs > 0 &&
            lastPreviewPublishedAtRef.current > 0 &&
            elapsed < minPreviewIntervalMs
          ) {
            frameRef.current = requestAnimationFrame(publishOnFrame);
            return;
          }
          frameRef.current = null;
          lastPreviewPublishedAtRef.current = now;
          publishLatest(gestureId);
          recordPanelSliderPreviewUpdate(gestureId);
        };
        frameRef.current = requestAnimationFrame(publishOnFrame);
      }
      return next;
    },
    [
      cancelScheduledClear,
      disabled,
      minPreviewIntervalMs,
      normalizedIds,
      publishLatest,
      setData,
      type,
    ]
  );

  const commitSlider = useCallback(
    (reason = "commit") => {
      if (disabled) return false;
      if (!activeRef.current) return false;
      activeRef.current = false;
      controlFieldRef.current = "";
      const generation = ++generationRef.current;
      const gestureId = gestureIdRef.current;
      stopPanelSliderGestureDiagnostics(gestureId);
      if (frameRef.current != null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      if (publishPreviewRef.current) {
        publishLatest(gestureId);
        recordPanelSliderPreviewUpdate(gestureId);
      }
      beginPanelSliderFinalCommit(gestureId, reason);
      beginPanelLayoutCommit();
      const startedAt = performance.now();
      commitRef.current?.(latestRef.current);
      recordPanelSliderGlobalCommit(performance.now() - startedAt, gestureId);
      cancelScheduledClear();
      clearFrameRef.current = requestAnimationFrame(() => {
        clearFrameRef.current = requestAnimationFrame(() => {
          clearFrameRef.current = null;
          if (generationRef.current !== generation || activeRef.current) return;
          clearLatest();
          finishPanelSliderPerf(reason, gestureId);
          if (gestureIdRef.current === gestureId) gestureIdRef.current = null;
        });
      });
      publishPreviewRef.current = true;
      lastPreviewPublishedAtRef.current = 0;
      return true;
    },
    [cancelScheduledClear, clearLatest, disabled, publishLatest]
  );

  const sliderCommitProps = {
    onPointerUp: () => commitSlider("pointerup"),
    onPointerCancel: () => commitSlider("pointercancel"),
    onMouseUp: () => commitSlider("mouseup"),
    onTouchEnd: () => commitSlider("touchend"),
    onTouchCancel: () => commitSlider("touchcancel"),
    onKeyUp: () => commitSlider("keyboard"),
    onBlur: () => commitSlider("blur"),
  };

  useEffect(() => {
    if (
      disabled ||
      String(type || "") !== "section" ||
      typeof window === "undefined"
    ) {
      return undefined;
    }
    const finishPointerGesture = (event) => {
      commitSlider(event.type);
    };
    window.addEventListener("pointerup", finishPointerGesture);
    window.addEventListener("pointercancel", finishPointerGesture);
    return () => {
      window.removeEventListener("pointerup", finishPointerGesture);
      window.removeEventListener("pointercancel", finishPointerGesture);
    };
  }, [commitSlider, disabled, type]);

  useEffect(() => {
    if (disabled) return undefined;
    return () => {
      if (activeRef.current) {
        activeRef.current = false;
        if (frameRef.current != null) cancelAnimationFrame(frameRef.current);
        const gestureId = gestureIdRef.current;
        stopPanelSliderGestureDiagnostics(gestureId);
        publishLatest(gestureId);
        beginPanelSliderFinalCommit(gestureId, "unmount");
        beginPanelLayoutCommit();
        const startedAt = performance.now();
        commitRef.current?.(latestRef.current);
        recordPanelSliderGlobalCommit(
          performance.now() - startedAt,
          gestureId
        );
        finishPanelSliderPerf("unmount", gestureId);
        gestureIdRef.current = null;
        controlFieldRef.current = "";
      }
      cancelScheduledClear();
      clearLatest();
    };
  }, [cancelScheduledClear, clearLatest, disabled, publishLatest]);

  return {
    updateSlider,
    commitSlider,
    sliderCommitProps,
    hasActiveSlider: () => activeRef.current,
  };
}
