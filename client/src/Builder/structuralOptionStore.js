const EMPTY_TARGET = Object.freeze({
  id: "",
  kind: "",
  columnId: "",
  sectionId: "",
  splitRowId: "",
});

const EMPTY_SNAPSHOT = Object.freeze({
  hovered: false,
  descendantHovered: false,
  pinned: false,
  hoverId: "",
  publishedAt: 0,
});

const keyFor = (kind, id) =>
  kind && id != null && String(id) !== "" ? `${kind}:${String(id)}` : "";

const targetKeys = (target) => {
  if (!target?.id) return [];
  const keys = new Set();
  const ownKey = keyFor(target.kind, target.id);
  if (ownKey) keys.add(ownKey);
  if (target.kind === "span") {
    const columnKey = keyFor("column", target.columnId);
    if (columnKey) keys.add(columnKey);
  }
  if (target.kind === "section") {
    const splitRowKey = keyFor("splitRow", target.splitRowId);
    if (splitRowKey) keys.add(splitRowKey);
  }
  return [...keys];
};

export const structuralOptionKey = keyFor;

export function createStructuralOptionStore() {
  let hoverTarget = EMPTY_TARGET;
  let pinnedSpanId = "";
  let pinnedColumnId = "";
  let suppressed = false;
  let publishedAt = 0;
  let onPublish = null;
  const listeners = new Map();
  const snapshots = new Map();

  const getSnapshot = (key) => {
    if (!key) return EMPTY_SNAPSHOT;
    const cached = snapshots.get(key);
    if (cached) return cached;
    const separator = key.indexOf(":");
    const kind = separator === -1 ? "" : key.slice(0, separator);
    const id = separator === -1 ? "" : key.slice(separator + 1);
    const hovered =
      !suppressed &&
      hoverTarget.kind === kind && String(hoverTarget.id) === String(id);
    const descendantHovered =
      !suppressed &&
      kind === "column" &&
      Boolean(hoverTarget.columnId) &&
      String(hoverTarget.columnId) === String(id) &&
      !(hoverTarget.kind === "column" && hovered);
    const pinned =
      !suppressed &&
      ((kind === "span" && String(pinnedSpanId) === String(id)) ||
        (kind === "column" && String(pinnedColumnId) === String(id)));
    const snapshot = Object.freeze({
      hovered,
      descendantHovered,
      pinned,
      hoverId:
        hovered || descendantHovered || (!suppressed && kind === "splitRow")
          ? String(hoverTarget.id || "")
          : "",
      publishedAt,
    });
    snapshots.set(key, snapshot);
    return snapshot;
  };

  const notifyKeys = (keys, publishStartedAt, reason) => {
    const uniqueKeys = [...new Set(keys.filter(Boolean))];
    uniqueKeys.forEach((key) => snapshots.delete(key));
    let notifiedKeyCount = 0;
    uniqueKeys.forEach((key) => {
      const keyListeners = listeners.get(key);
      if (!keyListeners?.size) return;
      notifiedKeyCount += 1;
      [...keyListeners].forEach((listener) => listener());
    });
    if (onPublish) {
      onPublish({
        reason,
        notifiedKeyCount,
        changedKeyCount: uniqueKeys.length,
        durationMs: performance.now() - publishStartedAt,
        publishedAt,
      });
    }
  };

  return {
    subscribe(key, listener) {
      if (!key) return () => {};
      let keyListeners = listeners.get(key);
      if (!keyListeners) {
        keyListeners = new Set();
        listeners.set(key, keyListeners);
      }
      keyListeners.add(listener);
      return () => {
        keyListeners.delete(listener);
        if (keyListeners.size === 0) listeners.delete(key);
      };
    },
    getSnapshot,
    getState() {
      return {
        hoverTarget,
        pinnedSpanId: pinnedSpanId || null,
        pinnedColumnId: pinnedColumnId || null,
        suppressed,
      };
    },
    publishHover(nextTarget, inputAt = 0) {
      const normalized = nextTarget?.id
        ? {
            id: String(nextTarget.id),
            kind: String(nextTarget.kind || ""),
            columnId: String(nextTarget.columnId || ""),
            sectionId: String(nextTarget.sectionId || ""),
            splitRowId: String(nextTarget.splitRowId || ""),
          }
        : EMPTY_TARGET;
      if (
        hoverTarget.id === normalized.id &&
        hoverTarget.kind === normalized.kind &&
        hoverTarget.columnId === normalized.columnId &&
        hoverTarget.sectionId === normalized.sectionId &&
        hoverTarget.splitRowId === normalized.splitRowId
      ) {
        return false;
      }
      const startedAt = onPublish ? performance.now() : 0;
      const changedKeys = [...targetKeys(hoverTarget), ...targetKeys(normalized)];
      hoverTarget = normalized;
      publishedAt = inputAt || startedAt;
      notifyKeys(changedKeys, startedAt, "hover");
      return true;
    },
    setPinned(kind, id) {
      const normalizedId = id == null ? "" : String(id);
      const startedAt = onPublish ? performance.now() : 0;
      const changedKeys = [];
      if (kind === "span") {
        if (pinnedSpanId === normalizedId) return false;
        changedKeys.push(keyFor("span", pinnedSpanId), keyFor("span", normalizedId));
        pinnedSpanId = normalizedId;
      } else if (kind === "column") {
        if (pinnedColumnId === normalizedId) return false;
        changedKeys.push(
          keyFor("column", pinnedColumnId),
          keyFor("column", normalizedId)
        );
        pinnedColumnId = normalizedId;
      } else {
        return false;
      }
      publishedAt = startedAt;
      notifyKeys(changedKeys, startedAt, "pin");
      return true;
    },
    clearForDrag() {
      if (
        !hoverTarget.id &&
        !pinnedSpanId &&
        !pinnedColumnId
      ) {
        return false;
      }
      const startedAt = onPublish ? performance.now() : 0;
      const changedKeys = [
        ...targetKeys(hoverTarget),
        keyFor("span", pinnedSpanId),
        keyFor("column", pinnedColumnId),
      ];
      hoverTarget = EMPTY_TARGET;
      pinnedSpanId = "";
      pinnedColumnId = "";
      publishedAt = 0;
      notifyKeys(changedKeys, startedAt, "drag-start");
      return true;
    },
    setSuppressed(nextSuppressed) {
      const next = Boolean(nextSuppressed);
      if (suppressed === next) return false;
      const startedAt = onPublish ? performance.now() : 0;
      const changedKeys = [
        ...targetKeys(hoverTarget),
        keyFor("span", pinnedSpanId),
        keyFor("column", pinnedColumnId),
      ];
      suppressed = next;
      publishedAt = 0;
      notifyKeys(
        changedKeys,
        startedAt,
        next ? "drag-suppress" : "drag-restore"
      );
      return true;
    },
    setOnPublish(callback) {
      onPublish = typeof callback === "function" ? callback : null;
    },
    clear() {
      hoverTarget = EMPTY_TARGET;
      pinnedSpanId = "";
      pinnedColumnId = "";
      suppressed = false;
      publishedAt = 0;
      snapshots.clear();
      listeners.clear();
      onPublish = null;
    },
  };
}
