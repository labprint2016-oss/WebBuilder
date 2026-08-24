import { useSyncExternalStore } from "react";

const MAX_TRANSACTIONS = 160;
const MAX_ELEMENTS = 300;
const UI_EMIT_INTERVAL_MS = 250;
const CONTROL_IDLE_MS = 350;

const enabledFromUrl =
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).get("builderPerf") === "1";
let enabled = enabledFromUrl;
let paused = false;
let measurementTarget = { elementType: "", elementId: "" };
let nextTransactionId = 1;
let snapshotVersion = 0;
let emitTimer = null;
let frameRequestId = null;
let lastFrameAt = 0;
let longTaskObserver = null;

const transactions = [];
const activeTransactions = new Map();
const elementStats = new Map();
const controlSessions = new Map();
const listeners = new Set();
const enabledListeners = new Set();
const targetListeners = new Map();

const latestActiveTransaction = (predicate = () => true) =>
  [...activeTransactions.values()]
    .filter(predicate)
    .sort((a, b) => b.startedAt - a.startedAt)[0] || null;

let snapshot = {
  version: 0,
  enabled: enabledFromUrl,
  paused: false,
  activeCount: 0,
  target: measurementTarget,
  transactions: [],
  elements: [],
  summary: {
    totalTransactions: 0,
    redTransactions: 0,
    maxInteractionMs: 0,
    maxCommitMs: 0,
    maxFrameGapMs: 0,
    maxTargetRenderCount: 0,
    longTaskCount: 0,
  },
};

const roundMs = (value) =>
  Number.isFinite(Number(value))
    ? Math.round(Number(value) * 100) / 100
    : 0;

const normalizeId = (value) => String(value ?? "").slice(0, 120);

const collectIdsFromElements = (elements, into) => {
  if (!Array.isArray(elements)) return;
  for (const item of elements) {
    const id = normalizeId(item?.id);
    if (id) into.add(id);
  }
};

export const collectNestedCanvasElementIds = (data) => {
  const ids = new Set();
  if (Array.isArray(data?.accordionItems)) {
    for (const item of data.accordionItems) {
      collectIdsFromElements(item?.elements, ids);
    }
  }
  if (Array.isArray(data?.tabsItems)) {
    for (const item of data.tabsItems) {
      collectIdsFromElements(item?.elements, ids);
    }
  }
  if (Array.isArray(data?.dataSliderItems)) {
    for (const item of data.dataSliderItems) {
      collectIdsFromElements(item?.elements, ids);
    }
  }
  if (Array.isArray(data?.catagoriesItems)) {
    for (const item of data.catagoriesItems) {
      collectIdsFromElements(item?.elements, ids);
    }
  }
  collectIdsFromElements(data?.postElements, ids);
  return [...ids];
};

const STRUCTURAL_UNRELATED_IGNORE_KINDS = new Set([
  "dnd-sidebar",
  "dnd",
  "canvas-clone",
  "canvas-delete",
  "canvas-reorder",
  "canvas-column-split",
  "canvas-resize",
]);

const shouldScoreUnrelatedRatio = (transaction) => {
  const kind = transaction?.kind;
  if (STRUCTURAL_UNRELATED_IGNORE_KINDS.has(kind)) return false;
  const unrelated = Number(transaction?.metrics?.unrelatedRenderCount) || 0;
  const target = Number(transaction?.metrics?.targetRenderCount) || 0;
  return unrelated >= 3 && unrelated + target >= 6;
};

export const getUnrelatedMetricStatus = (transaction) => {
  if (!shouldScoreUnrelatedRatio(transaction)) return "neutral";
  const ratio = Number(transaction?.metrics?.unrelatedRenderRatio);
  if (!Number.isFinite(ratio) || ratio <= 0) return "neutral";
  if (ratio > 0.25) return "red";
  if (ratio > 0.1) return "yellow";
  return "green";
};

const LIFECYCLE_TRANSACTION_KINDS = new Set([
  "page-load",
  "page-switch",
  "page-save",
  "resource-load",
  "resource-save",
]);
const ONE_SHOT_DURATION_KINDS = new Set([
  "panel-open",
  "panel-control",
  "builder-control",
  "header-control",
  "navigation-control",
  "text-editor-open",
  "text-editor-save",
  "canvas-selection",
]);

export const usesInteractionDuration = (kind) =>
  !ONE_SHOT_DURATION_KINDS.has(kind) &&
  !LIFECYCLE_TRANSACTION_KINDS.has(kind);

export const getDisplayedFrameGapMs = (transaction) => {
  if (transaction?.kind === "panel-open") return null;
  const metrics = transaction?.metrics || {};
  const frameMs = Number(metrics.frameGapP95Ms || metrics.frameGapMaxMs) || 0;
  if (frameMs <= 0) return null;
  if (transaction?.kind === "panel-slider") {
    const isolatedDoubleVsync =
      (Number(metrics.severeFrameCount) || 0) === 0 &&
      (Number(metrics.droppedFrameCount) || 0) <= 1 &&
      frameMs > 24 &&
      frameMs <= 34.5;
    if (isolatedDoubleVsync) return null;
  }
  return frameMs;
};

export const getDisplayedDurationMs = (transaction) => {
  const metrics = transaction?.metrics || {};
  const kind = transaction?.kind;
  if (LIFECYCLE_TRANSACTION_KINDS.has(kind)) {
    return Number(metrics.lifecycleTotalMs) || 0;
  }
  const values = usesInteractionDuration(kind)
    ? [
        metrics.interactionToPaintMs,
        metrics.openToPaintMs,
        metrics.canvasMaxMs,
        metrics.panelMaxMs,
        metrics.renderMaxMs,
        metrics.dropCommitMs,
      ]
    : [
        metrics.canvasMaxMs,
        metrics.panelMaxMs,
        metrics.renderMaxMs,
        metrics.dropCommitMs,
      ];
  return values.find((value) => Number(value) > 0) || 0;
};

const getMetricStatus = (transaction) => {
  const metrics = transaction?.metrics || {};
  if (metrics.failed) return "red";
  const isLifecycle = LIFECYCLE_TRANSACTION_KINDS.has(transaction?.kind);
  const renderMs = metrics.renderMaxMs || metrics.panelMaxMs;
  const frameMs = getDisplayedFrameGapMs(transaction);
  const values = (
    isLifecycle
      ? [
          ["api", metrics.apiLatencyMs, 800, 2000],
          ["lifecycle", metrics.lifecycleTotalMs, 1000, 2500],
          ["commit", metrics.canvasMaxMs, 8, 16.7],
          ...(frameMs == null ? [] : [["frame", frameMs, 20, 33]]),
        ]
      : [
          ["commit", metrics.canvasMaxMs, 8, 16.7],
          ["render", renderMs, 8, 16.7],
          ...(frameMs == null ? [] : [["frame", frameMs, 20, 33]]),
          ["rerenders", metrics.targetRenderCount, 2, 5],
          ...(shouldScoreUnrelatedRatio(transaction)
            ? [["unrelated", metrics.unrelatedRenderRatio, 0.1, 0.25]]
            : []),
        ]
  ).filter(([, value]) => Number.isFinite(value) && value > 0);

  if (values.some(([, value, , red]) => value > red)) return "red";
  if (values.some(([, value, yellow]) => value > yellow)) return "yellow";
  return "green";
};

const createSnapshot = () => {
  const visibleTransactions = transactions.map((transaction) => ({
    ...transaction,
    status: getMetricStatus(transaction),
  }));
  const visibleElements = [...elementStats.values()]
    .sort((a, b) => b.maxActualMs - a.maxActualMs || b.renderCount - a.renderCount)
    .slice(0, MAX_ELEMENTS)
    .map((item) => ({
      ...item,
      averageActualMs:
        item.renderCount > 0 ? roundMs(item.totalActualMs / item.renderCount) : 0,
      status:
        item.maxActualMs > 8
          ? "red"
          : item.maxActualMs > 4
            ? "yellow"
            : "green",
    }));

  const redTransactions = visibleTransactions.filter(
    (transaction) => transaction.status === "red"
  ).length;
  snapshotVersion += 1;
  snapshot = {
    version: snapshotVersion,
    enabled,
    paused,
    activeCount: activeTransactions.size,
    target: { ...measurementTarget },
    transactions: visibleTransactions,
    elements: visibleElements,
    summary: {
      totalTransactions: visibleTransactions.length,
      redTransactions,
      maxInteractionMs: roundMs(
        Math.max(
          0,
          ...visibleTransactions
            .filter(
              (transaction) =>
                !LIFECYCLE_TRANSACTION_KINDS.has(transaction.kind)
            )
            .map((transaction) => getDisplayedDurationMs(transaction))
        )
      ),
      maxCommitMs: roundMs(
        Math.max(
          0,
          ...visibleTransactions.map(
            (transaction) => Number(transaction.metrics?.canvasMaxMs) || 0
          )
        )
      ),
      maxFrameGapMs: roundMs(
        Math.max(
          0,
          ...visibleTransactions.map(
            (transaction) => getDisplayedFrameGapMs(transaction) || 0
          )
        )
      ),
      maxTargetRenderCount: Math.max(
        0,
        ...visibleTransactions.map(
          (transaction) => transaction.metrics?.targetRenderCount || 0
        )
      ),
      longTaskCount: visibleTransactions.reduce(
        (total, transaction) =>
          total + (transaction.metrics?.longTaskCount || 0),
        0
      ),
    },
  };
};

const emitNow = () => {
  emitTimer = null;
  createSnapshot();
  listeners.forEach((listener) => listener());
};

const scheduleEmit = (immediate = false) => {
  if (immediate) {
    if (emitTimer != null) clearTimeout(emitTimer);
    emitNow();
    return;
  }
  if (emitTimer != null) return;
  emitTimer = setTimeout(emitNow, UI_EMIT_INTERVAL_MS);
};

const stopFrameMonitorIfIdle = () => {
  const hasTrackedTransaction = [...activeTransactions.values()].some(
    (transaction) => transaction.trackFrames
  );
  if (hasTrackedTransaction || frameRequestId == null) return;
  cancelAnimationFrame(frameRequestId);
  frameRequestId = null;
  lastFrameAt = 0;
};

const ensureFrameMonitor = () => {
  if (frameRequestId != null || typeof requestAnimationFrame !== "function") return;
  lastFrameAt = performance.now();
  const onFrame = (timestamp) => {
    const gap = timestamp - lastFrameAt;
    lastFrameAt = timestamp;
    const transaction = latestActiveTransaction(
      (candidate) => candidate.trackFrames
    );
    const hasTrackedTransaction = Boolean(transaction);
    if (transaction) {
      const skipCount = transaction.skipInitialFrameGap
        ? transaction.skipInitialFrameGapCount || 1
        : 0;
      const shouldRecordGap = transaction.skippedFrameGaps >= skipCount;
      transaction.skippedFrameGaps += 1;
      transaction.frameBaselineReady = true;
      if (shouldRecordGap) {
        transaction.frameGaps.push(gap);
        if (transaction.frameGaps.length > 600) transaction.frameGaps.shift();
        transaction.metrics.frameGapMaxMs = Math.max(
          transaction.metrics.frameGapMaxMs || 0,
          gap
        );
        if (gap > 24) transaction.metrics.droppedFrameCount += 1;
        if (gap > 50) transaction.metrics.severeFrameCount += 1;
        transaction.metrics.frameCount += 1;
      }
    }
    if (!hasTrackedTransaction) {
      frameRequestId = null;
      lastFrameAt = 0;
      return;
    }
    frameRequestId = requestAnimationFrame(onFrame);
  };
  frameRequestId = requestAnimationFrame(onFrame);
};

const stopObservers = () => {
  if (longTaskObserver) {
    longTaskObserver.disconnect();
    longTaskObserver = null;
  }
  if (frameRequestId != null) {
    cancelAnimationFrame(frameRequestId);
    frameRequestId = null;
  }
  lastFrameAt = 0;
};

const ensureLongTaskObserver = () => {
  if (
    longTaskObserver ||
    typeof PerformanceObserver !== "function" ||
    !PerformanceObserver.supportedEntryTypes?.includes("longtask")
  ) {
    return;
  }
  try {
    longTaskObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        const transaction = [...activeTransactions.values()]
          .filter((candidate) => entry.startTime >= candidate.startedAt)
          .sort((a, b) => b.startedAt - a.startedAt)[0];
        if (!transaction) return;
        transaction.metrics.longTaskCount += 1;
        transaction.metrics.longTaskTotalMs += entry.duration;
        transaction.metrics.longTaskMaxMs = Math.max(
          transaction.metrics.longTaskMaxMs,
          entry.duration
        );
      });
    });
    longTaskObserver.observe({ type: "longtask", buffered: false });
  } catch {
    longTaskObserver = null;
  }
};

export function isBuilderPerformanceEnabled() {
  return enabled && !paused;
}

export function shouldRecordBuilderElementOccurrences() {
  if (!isBuilderPerformanceEnabled() || activeTransactions.size === 0) {
    return false;
  }
  return [...activeTransactions.values()].some(
    (transaction) => Boolean(transaction.elementId)
  );
}

export function setBuilderPerformanceTarget(elementType, elementId) {
  const previousTargetId = measurementTarget.elementId;
  const nextTarget = {
    elementType: normalizeId(elementType),
    elementId: normalizeId(elementId),
  };
  if (
    measurementTarget.elementType === nextTarget.elementType &&
    measurementTarget.elementId === nextTarget.elementId
  ) {
    return;
  }
  measurementTarget = nextTarget;
  [previousTargetId, nextTarget.elementId].forEach((targetId) => {
    targetListeners.get(targetId)?.forEach((listener) => listener());
  });
  scheduleEmit(true);
}

export function setBuilderPerformanceEnabled(nextEnabled) {
  const normalized = Boolean(nextEnabled);
  if (enabled === normalized) return;
  enabled = normalized;
  paused = false;
  if (enabled) {
    ensureLongTaskObserver();
  } else {
    activeTransactions.forEach((transaction) =>
      clearTimeout(transaction.safetyTimerId)
    );
    activeTransactions.clear();
    controlSessions.forEach((session) => clearTimeout(session.timerId));
    controlSessions.clear();
    stopObservers();
  }
  enabledListeners.forEach((listener) => listener());
  scheduleEmit(true);
}

export function setBuilderPerformancePaused(nextPaused) {
  paused = Boolean(nextPaused);
  if (paused) {
    activeTransactions.forEach((transaction) =>
      clearTimeout(transaction.safetyTimerId)
    );
    activeTransactions.clear();
    controlSessions.forEach((session) => clearTimeout(session.timerId));
    controlSessions.clear();
    stopFrameMonitorIfIdle();
  }
  enabledListeners.forEach((listener) => listener());
  scheduleEmit(true);
}

export function resetBuilderPerformanceSession() {
  transactions.length = 0;
  activeTransactions.forEach((transaction) =>
    clearTimeout(transaction.safetyTimerId)
  );
  activeTransactions.clear();
  elementStats.clear();
  controlSessions.forEach((session) => clearTimeout(session.timerId));
  controlSessions.clear();
  stopFrameMonitorIfIdle();
  scheduleEmit(true);
}

export function beginBuilderPerformanceTransaction(kind, meta = {}, options = {}) {
  if (!isBuilderPerformanceEnabled()) return null;
  ensureLongTaskObserver();
  const normalizedKind = String(kind || "interaction");
  if (normalizedKind === "panel-slider") {
    const elementId = normalizeId(meta.elementId);
    const isSectionContainerSlider =
      normalizeId(meta.elementType) === "section";
    controlSessions.forEach((session, sessionKey) => {
      const isMatchingSectionContainerControl =
        isSectionContainerSlider &&
        session.panelType === "Container";
      if (
        session.elementId !== elementId ||
        (session.controlKind !== "slider" &&
          session.controlKind !== "color" &&
          !isMatchingSectionContainerControl)
      ) {
        return;
      }
      if (session.timerId != null) clearTimeout(session.timerId);
      cancelBuilderPerformanceTransaction(session.transactionId);
      controlSessions.delete(sessionKey);
    });
  }
  const collectorStartedAt = performance.now();
  const transaction = {
    id: nextTransactionId++,
    kind: normalizedKind,
    label: String(meta.label || kind || "interaction"),
    elementType: normalizeId(meta.elementType),
    elementId: normalizeId(meta.elementId),
    panelType: normalizeId(meta.panelType),
    controlKind: normalizeId(meta.controlKind),
    controlField: normalizeId(meta.controlField),
    scope: normalizeId(meta.scope),
    startedAt: collectorStartedAt,
    trackFrames: options.trackFrames === true,
    skipInitialFrameGap: options.skipInitialFrameGap === true,
    skipInitialFrameGapCount:
      Number(options.skipInitialFrameGapCount) > 0
        ? Number(options.skipInitialFrameGapCount)
        : 1,
    skippedFrameGaps: 0,
    frameBaselineReady: false,
    renderedElementKeys: new Set(),
    relatedElementIds: new Set(
      (Array.isArray(meta.relatedElementIds) ? meta.relatedElementIds : []).map(
        normalizeId
      )
    ),
    targetRenderCount: 0,
    unrelatedRenderCount: 0,
    frameGaps: [],
    metrics: {
      inputCount: 0,
      canvasCommits: 0,
      canvasActualMs: 0,
      canvasMaxMs: 0,
      renderCount: 0,
      renderTotalMs: 0,
      renderMaxMs: 0,
      frameCount: 0,
      frameGapMaxMs: 0,
      droppedFrameCount: 0,
      severeFrameCount: 0,
      longTaskCount: 0,
      longTaskTotalMs: 0,
      longTaskMaxMs: 0,
      collectorOverheadMs: 0,
    },
  };
  transaction.safetyTimerId = setTimeout(() => {
    finishBuilderPerformanceTransaction(
      transaction.id,
      { failed: 1 },
      { reason: "timeout" }
    );
  }, 15000);
  transaction.metrics.collectorOverheadMs = roundMs(
    performance.now() - collectorStartedAt
  );
  activeTransactions.set(transaction.id, transaction);
  if (transaction.trackFrames) ensureFrameMonitor();
  scheduleEmit();
  return transaction.id;
}

export function updateBuilderPerformanceTransaction(transactionId, metrics = {}) {
  const transaction = activeTransactions.get(transactionId);
  if (!transaction) return;
  Object.entries(metrics).forEach(([key, value]) => {
    if (Number.isFinite(Number(value))) {
      transaction.metrics[key] = Number(value);
    }
  });
}

export function setBuilderPerformanceTransactionTarget(
  transactionId,
  elementType,
  elementId
) {
  const transaction = activeTransactions.get(transactionId);
  if (!transaction) return;
  transaction.elementType = normalizeId(elementType);
  transaction.elementId = normalizeId(elementId);
}

export function cancelBuilderPerformanceTransaction(transactionId) {
  const transaction = activeTransactions.get(transactionId);
  if (!transaction) return;
  clearTimeout(transaction.safetyTimerId);
  activeTransactions.delete(transactionId);
  stopFrameMonitorIfIdle();
  scheduleEmit();
}

export function finishBuilderPerformanceTransaction(
  transactionId,
  metrics = {},
  details = {}
) {
  const transaction = activeTransactions.get(transactionId);
  if (!transaction) return;
  clearTimeout(transaction.safetyTimerId);
  activeTransactions.delete(transactionId);

  Object.entries(metrics).forEach(([key, value]) => {
    if (Number.isFinite(Number(value))) {
      transaction.metrics[key] = roundMs(Number(value));
    }
  });

  if (Array.isArray(details.frameGaps) && details.frameGaps.length) {
    transaction.frameGaps = details.frameGaps
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value) && value > 0);
  }
  if (transaction.frameGaps.length > 0) {
    const sortedFrameGaps = [...transaction.frameGaps].sort((a, b) => a - b);
    const p95Index = Math.max(0, Math.ceil(sortedFrameGaps.length * 0.95) - 1);
    transaction.metrics.frameGapP95Ms = roundMs(sortedFrameGaps[p95Index] || 0);
  } else if (!Number.isFinite(Number(transaction.metrics.frameGapP95Ms))) {
    transaction.metrics.frameGapP95Ms = roundMs(
      transaction.metrics.frameGapMaxMs || 0
    );
  } else {
    transaction.metrics.frameGapP95Ms = roundMs(
      transaction.metrics.frameGapP95Ms
    );
  }
  transaction.metrics.droppedFrameRatio =
    transaction.metrics.frameCount > 0
      ? roundMs(
          transaction.metrics.droppedFrameCount /
            transaction.metrics.frameCount
        )
      : 0;
  const renderedCount = transaction.renderedElementKeys.size;
  transaction.metrics.renderedElementCount = renderedCount;
  transaction.metrics.targetRenderCount = transaction.targetRenderCount;
  transaction.metrics.unrelatedRenderCount = transaction.unrelatedRenderCount;
  const totalRenderOccurrences =
    transaction.targetRenderCount + transaction.unrelatedRenderCount;
  transaction.metrics.unrelatedRenderRatio =
    transaction.targetRenderCount > 0 && totalRenderOccurrences > 0
      ? roundMs(transaction.unrelatedRenderCount / totalRenderOccurrences)
      : 0;

  const endedAt = performance.now();
  transactions.unshift({
    id: transaction.id,
    kind: transaction.kind,
    label: transaction.label,
    elementType: transaction.elementType,
    elementId: transaction.elementId,
    panelType: transaction.panelType,
    controlKind: transaction.controlKind,
    controlField: transaction.controlField,
    scope: transaction.scope,
    startedAt: transaction.startedAt,
    endedAt,
    durationMs: roundMs(endedAt - transaction.startedAt),
    metrics: { ...transaction.metrics },
    details: {
      reason: normalizeId(details.reason),
      changedFields: Array.isArray(details.changedFields)
        ? details.changedFields.map(normalizeId).slice(0, 20)
        : [],
      sections: Number(details.sections) || 0,
      elements: Number(details.elements) || 0,
    },
  });
  if (transactions.length > MAX_TRANSACTIONS) {
    transactions.length = MAX_TRANSACTIONS;
  }
  stopFrameMonitorIfIdle();
  scheduleEmit();
}

export function finishBuilderPerformanceTransactionAfterPaint(
  transactionId,
  metrics = {},
  details = {}
) {
  if (transactionId == null || typeof requestAnimationFrame !== "function") {
    finishBuilderPerformanceTransaction(transactionId, metrics, details);
    return;
  }
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const transaction = activeTransactions.get(transactionId);
      if (!transaction) return;
      const interactionToPaintMs =
        metrics.interactionToPaintMs ??
        performance.now() -
          (Number(details.interactionStartedAt) || transaction.startedAt);
      finishBuilderPerformanceTransaction(
        transactionId,
        {
          ...metrics,
          interactionToPaintMs,
          ...(transaction.kind === "panel-open"
            ? { openToPaintMs: interactionToPaintMs }
            : {}),
        },
        details
      );
    });
  });
}

export function finishBuilderLifecycleTransactionAfterPaint(
  transactionId,
  metrics = {},
  details = {}
) {
  if (transactionId == null || typeof requestAnimationFrame !== "function") {
    finishBuilderPerformanceTransaction(transactionId, metrics, details);
    return;
  }
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const transaction = activeTransactions.get(transactionId);
      if (!transaction) return;
      finishBuilderPerformanceTransaction(
        transactionId,
        {
          ...metrics,
          lifecycleTotalMs: roundMs(
            performance.now() - transaction.startedAt
          ),
        },
        details
      );
    });
  });
}

export function recordBuilderCanvasCommit(
  actualDuration,
  baseDuration,
  phase = "",
  details = null
) {
  if (!isBuilderPerformanceEnabled()) return;
  const actual = Number(actualDuration) || 0;
  const transaction = latestActiveTransaction();
  if (transaction) {
    transaction.metrics.canvasCommits += 1;
    transaction.metrics.canvasActualMs += actual;
    if (actual >= transaction.metrics.canvasMaxMs) {
      transaction.metrics.canvasMaxMs = actual;
      transaction.metrics.canvasMaxPhase = normalizeId(phase);
      transaction.metrics.canvasMaxDetails = details;
    }
    transaction.metrics.canvasBaseMaxMs = Math.max(
      transaction.metrics.canvasBaseMaxMs || 0,
      Number(baseDuration) || 0
    );
  }
}

export function recordBuilderPanelCommit(
  panelType,
  actualDuration,
  baseDuration
) {
  if (!isBuilderPerformanceEnabled()) return;
  const panel = normalizeId(panelType);
  const actual = Number(actualDuration) || 0;
  const base = Number(baseDuration) || 0;
  const transaction = latestActiveTransaction(
    (candidate) =>
      (candidate.kind.startsWith("panel") ||
        candidate.kind.endsWith("-control")) &&
      Boolean(candidate.panelType) &&
      (candidate.kind === "panel-slider" || candidate.panelType === panel)
  );
  if (transaction) {
    transaction.metrics.panelCommits =
      (transaction.metrics.panelCommits || 0) + 1;
    transaction.metrics.panelActualMs =
      (transaction.metrics.panelActualMs || 0) + actual;
    transaction.metrics.panelMaxMs = Math.max(
      transaction.metrics.panelMaxMs || 0,
      actual
    );
    transaction.metrics.panelBaseMaxMs = Math.max(
      transaction.metrics.panelBaseMaxMs || 0,
      base
    );
  }
}

export function recordBuilderElementRender({
  elementType,
  elementId,
  phase,
  actualDuration,
  baseDuration,
}) {
  if (!isBuilderPerformanceEnabled()) return;
  const type = normalizeId(elementType || "unknown");
  const id = normalizeId(elementId || "unknown");
  const key = `${type}:${id}`;
  const actual = Number(actualDuration) || 0;
  const base = Number(baseDuration) || 0;
  const current = elementStats.get(key) || {
    key,
    elementType: type,
    elementId: id,
    renderCount: 0,
    mountCount: 0,
    updateCount: 0,
    totalActualMs: 0,
    maxActualMs: 0,
    maxBaseMs: 0,
    lastActualMs: 0,
  };
  current.renderCount += 1;
  current.mountCount += phase === "mount" ? 1 : 0;
  current.updateCount += phase === "update" ? 1 : 0;
  current.totalActualMs += actual;
  current.maxActualMs = Math.max(current.maxActualMs, actual);
  current.maxBaseMs = Math.max(current.maxBaseMs, base);
  current.lastActualMs = actual;
  elementStats.set(key, current);

  const transaction = latestActiveTransaction(
    (candidate) =>
      Boolean(candidate.elementId) &&
      normalizeId(candidate.elementId) === id
  );
  if (transaction) {
    transaction.metrics.renderCount += 1;
    transaction.metrics.renderTotalMs += actual;
    transaction.metrics.renderMaxMs = Math.max(
      transaction.metrics.renderMaxMs,
      actual
    );
  }
}

export function recordBuilderElementRenderOccurrence({
  elementType,
  elementId,
}) {
  if (!isBuilderPerformanceEnabled() || activeTransactions.size === 0) return;
  const type = normalizeId(elementType || "unknown");
  const id = normalizeId(elementId || "unknown");
  const key = `${type}:${id}`;
  const transaction = latestActiveTransaction(
    (candidate) => Boolean(candidate.elementId)
  );
  if (transaction) {
    transaction.renderedElementKeys.add(key);
    const isTarget = normalizeId(transaction.elementId) === id;
    if (isTarget) transaction.targetRenderCount += 1;
    else if (transaction.relatedElementIds?.has(id)) {
      // Nested content of the target (Accordion/Tabs/etc). Expected, not off-target.
    } else transaction.unrelatedRenderCount += 1;
  }
}

const getControlKind = (target) => {
  const tag = String(target?.tagName || "").toLowerCase();
  const type = String(target?.type || "").toLowerCase();
  if (type === "range") return "slider";
  if (
    type === "checkbox" ||
    type === "radio" ||
    target?.getAttribute?.("role") === "switch"
  ) {
    return "toggle";
  }
  if (type === "color") return "color";
  if (tag === "select" || target?.getAttribute?.("role") === "combobox") {
    return "select";
  }
  if (tag === "textarea" || type === "text" || type === "number") return "text";
  if (tag === "button" || target?.getAttribute?.("role") === "button") {
    return "button";
  }
  return tag || "control";
};

const getControlField = (target, controlKind) =>
  normalizeId(
    target?.dataset?.perfControl ||
      target?.name ||
      target?.id ||
      target?.getAttribute?.("aria-label") ||
      controlKind
  );

export function recordBuilderPanelControlEvent(event, context = {}) {
  if (!isBuilderPerformanceEnabled()) return;
  if (
    context.transactionKind === "builder-control" &&
    [...activeTransactions.values()].some(
      (transaction) =>
        transaction.kind === "panel-slider" &&
        transaction.elementType === "section"
    )
  ) {
    return;
  }
  const eventTarget = event?.target;
  if (
    !eventTarget ||
    eventTarget.closest?.(
      "[data-performance-monitor='true'], [data-builder-performance-owned]"
    )
  ) {
    return;
  }
  const target = eventTarget.closest?.(
    "input, textarea, select, button, [role='button'], [role='switch'], [role='slider'], [role='combobox']"
  );
  if (!target) return;
  const controlKind = getControlKind(target);
  // Range / native color belong to panel-slider (starts on first onChange).
  // Recording them here on pointerdown creates a panel-control row whose first
  // frame gap is the grab hitch, not commit work.
  if (controlKind === "slider" || controlKind === "color") {
    return;
  }
  const controlField = getControlField(target, controlKind);
  if (context.skipWhenRecentActive === true && controlKind !== "text") {
    const recentTransaction = latestActiveTransaction(
      (transaction) =>
        performance.now() - transaction.startedAt < 100 &&
        transaction.controlKind !== "text"
    );
    if (recentTransaction) return;
  }
  if (
    context.transactionKind === "builder-control" &&
    controlKind === "button" &&
    (controlField === "ลบ" || controlField === "ใช่ ฉันต้องการลบ")
  ) {
    return;
  }
  const panelType = normalizeId(context.panelType);
  const elementId = normalizeId(context.elementId);
  const eventType = String(event.type || "");
  if (
    (controlKind === "toggle" || controlKind === "button") &&
    eventType === "pointerdown"
  ) {
    return;
  }
  const hasMatchingSectionContainerSlider =
    panelType === "Container" &&
    [...activeTransactions.values()].some(
      (transaction) =>
        transaction.kind === "panel-slider" &&
        transaction.elementType === "section" &&
        transaction.elementId === elementId
    );
  if (hasMatchingSectionContainerSlider) {
    return;
  }
  const sessionKey = [
    panelType,
    elementId,
    controlKind,
    controlField,
  ].join(":");
  let session = controlSessions.get(sessionKey);
  if (!session) {
    const transactionId = beginBuilderPerformanceTransaction(
      context.transactionKind || "panel-control",
      {
        label: `${context.labelPrefix || context.panelType || "Panel"} / ${controlField}`,
        panelType: context.panelType,
        elementType: context.elementType,
        elementId: context.elementId,
        controlKind,
        controlField,
      },
      {
        trackFrames:
          context.trackFrames === true ||
          controlKind === "slider" ||
          controlKind === "color",
        skipInitialFrameGap:
          (context.transactionKind === "navigation-control" &&
            controlKind === "button" &&
            controlField === "Builder") ||
          (context.transactionKind === "builder-control" &&
            controlKind === "button" &&
            (controlField === "ลบ" ||
              controlField === "โหลด PRESET" ||
              controlField === "บันทึกลงหน้า")),
      }
    );
    if (transactionId == null) return;
    session = {
      transactionId,
      timerId: null,
      inputCount: 0,
      startedAt: performance.now(),
      lastEventAt: performance.now(),
      finishImmediately: false,
      panelType,
      elementId,
      controlKind,
    };
    controlSessions.set(sessionKey, session);
  }
  session.inputCount += 1;
  session.lastEventAt = performance.now();
  updateBuilderPerformanceTransaction(session.transactionId, {
    inputCount: session.inputCount,
  });
  if (session.timerId != null) clearTimeout(session.timerId);

  const shouldFinishImmediately =
    eventType === "blur" ||
    eventType === "pointerup" ||
    eventType === "input" ||
    (eventType === "click" &&
      (controlKind === "button" || controlKind === "toggle")) ||
    (eventType === "change" &&
      (controlKind === "toggle" ||
        controlKind === "select" ||
        controlKind === "button"));
  session.finishImmediately =
    session.finishImmediately || shouldFinishImmediately;
  const delay = session.finishImmediately ? 0 : CONTROL_IDLE_MS;
  session.timerId = setTimeout(() => {
    controlSessions.delete(sessionKey);
    const interactionStartedAt =
      controlKind === "toggle" || controlKind === "button"
        ? session.lastEventAt
        : session.startedAt;
    if (controlKind === "toggle" || controlKind === "button") {
      finishBuilderPerformanceTransaction(
        session.transactionId,
        {},
        {
          reason: eventType || "idle",
          interactionStartedAt,
        }
      );
      return;
    }
    finishBuilderPerformanceTransactionAfterPaint(
      session.transactionId,
      {},
      {
        reason: eventType || "idle",
        interactionStartedAt,
      }
    );
  }, delay);
}

export function subscribeBuilderPerformance(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getBuilderPerformanceSnapshot() {
  return snapshot;
}

export function useBuilderPerformanceSnapshot() {
  return useSyncExternalStore(
    subscribeBuilderPerformance,
    getBuilderPerformanceSnapshot,
    getBuilderPerformanceSnapshot
  );
}

export function useBuilderPerformanceEnabled() {
  return useSyncExternalStore(
    (listener) => {
      enabledListeners.add(listener);
      return () => enabledListeners.delete(listener);
    },
    () => enabled && !paused,
    () => false
  );
}

export function useBuilderElementMeasurementEnabled(elementId) {
  const id = normalizeId(elementId);
  return useSyncExternalStore(
    (listener) => {
      let bucket = targetListeners.get(id);
      if (!bucket) {
        bucket = new Set();
        targetListeners.set(id, bucket);
      }
      bucket.add(listener);
      enabledListeners.add(listener);
      return () => {
        bucket.delete(listener);
        if (bucket.size === 0) targetListeners.delete(id);
        enabledListeners.delete(listener);
      };
    },
    () =>
      enabled &&
      !paused &&
      Boolean(measurementTarget.elementId) &&
      measurementTarget.elementId === id,
    () => false
  );
}
