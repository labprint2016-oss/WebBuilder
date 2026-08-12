const EMPTY_KEY = "";

const normalizePart = (value) =>
  value == null ? "" : String(value);

export const elementSelectionKey = (rawIds) => {
  const ids = rawIds || {};
  const elementId = normalizePart(ids.eleID);
  if (!elementId) return EMPTY_KEY;
  return JSON.stringify([
    normalizePart(ids.conID),
    normalizePart(ids.colID),
    normalizePart(ids.spnID),
    normalizePart(ids.nestID),
    normalizePart(ids.tabsHostId),
    normalizePart(ids.tabId),
    elementId,
  ]);
};

const selectedKeyFromSelection = (selection) =>
  selection?.status === "Delete"
    ? elementSelectionKey(selection.ids)
    : EMPTY_KEY;

export function createElementSelectionStore() {
  let selectedKey = EMPTY_KEY;
  const listeners = new Map();

  const notify = (key) => {
    if (!key) return;
    const keyListeners = listeners.get(key);
    if (!keyListeners?.size) return;
    [...keyListeners].forEach((listener) => listener());
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
    getSnapshot(key) {
      return Boolean(key) && key === selectedKey;
    },
    getSelectedKey() {
      return selectedKey;
    },
    publish(previousSelection, nextSelection) {
      const previousKey = selectedKeyFromSelection(previousSelection);
      const nextKey = selectedKeyFromSelection(nextSelection);
      if (previousKey === nextKey && selectedKey === nextKey) return false;

      selectedKey = nextKey;
      notify(previousKey);
      if (nextKey !== previousKey) notify(nextKey);
      return true;
    },
    clear() {
      const previousKey = selectedKey;
      selectedKey = EMPTY_KEY;
      notify(previousKey);
    },
  };
}
