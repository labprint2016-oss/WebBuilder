import lodash from "lodash";

const DEFAULT_TAB_COUNT = 3;
const DEFAULT_ITEM_COUNT = 3;

function makeItem(i) {
  const n = i + 1;
  return {
    id: `cat-${n}`,
    label: `Catagory ${n}`,
    disabled: false,
    elements: [],
    catagoriesButtonFill: { type: "mainColor", index: 0 },
    catagoriesButtonFillOpacity: 255,
    catagoriesButtonBorderColor: "#ffffff",
    catagoriesButtonBorderOpacity: 255,
    catagoriesButtonTextColor: "#ffffff",
    catagoriesButtonTextOpacity: 255,
    catagoriesButtonInactiveFill: "#d8d8d8",
    catagoriesButtonInactiveFillOpacity: 255,
    catagoriesButtonInactiveBorderColor: "#ffffff",
    catagoriesButtonInactiveBorderOpacity: 255,
    catagoriesButtonInactiveTextColor: "#ffffff",
    catagoriesButtonInactiveTextOpacity: 255,
  };
}

function makeTab(i) {
  const n = i + 1;
  const items = Array.from({ length: DEFAULT_ITEM_COUNT }, (_, idx) => makeItem(idx));
  return {
    id: `ctg-tab-${n}`,
    label: `Categories ${n}`,
    itemCount: DEFAULT_ITEM_COUNT,
    activeItemId: items[0].id,
    themeActiveItemId: items[0].id,
    items,
  };
}

export const CATAGORIES_ELEMENT_DEFAULTS = {
  type: "ctg",
  id: "Ctg-",
  catagoriesTabs: Array.from({ length: DEFAULT_TAB_COUNT }, (_, i) => makeTab(i)),
  catagoriesActiveCategoryId: "ctg-tab-1",
  catagoriesItemCount: DEFAULT_ITEM_COUNT,
  catagoriesItems: Array.from({ length: DEFAULT_ITEM_COUNT }, (_, i) => makeItem(i)),
  catagoriesActiveId: "cat-1",
  catagoriesPerViewDesktop: 3,
  catagoriesPerViewTablet: 2,
  catagoriesPerViewMobile: 1,
  catagoriesGap: 8,
  catagoriesItemGap: 12,
  catagoriesButtonFill: { type: "mainColor", index: 0 },
  catagoriesButtonFillOpacity: 255,
  catagoriesButtonBorderColor: "#ffffff",
  catagoriesButtonBorderOpacity: 255,
  catagoriesButtonTextColor: "#ffffff",
  catagoriesButtonTextOpacity: 255,
  catagoriesButtonInactiveFill: "#d8d8d8",
  catagoriesButtonInactiveFillOpacity: 255,
  catagoriesButtonInactiveBorderColor: "#ffffff",
  catagoriesButtonInactiveBorderOpacity: 255,
  catagoriesButtonInactiveTextColor: "#ffffff",
  catagoriesButtonInactiveTextOpacity: 255,
  catagoriesButtonBold: true,
  catagoriesButtonBorderWidth: 0,
  catagoriesButtonRadius: 10,
  catagoriesButtonFontSize: 12,
  catagoriesButtonPaddingX: 14,
  catagoriesButtonPaddingY: 8,
  catagoriesMarginTop: 8,
  catagoriesMarginBottom: 8,
};

const clamp255 = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return 255;
  return Math.max(0, Math.min(255, Math.round(n)));
};

function normalizeItems(rawItems, fallbackCount = 6) {
  const count = Math.min(
    12,
    Math.max(1, Number(fallbackCount) || rawItems?.length || 6)
  );
  let items = Array.isArray(rawItems) ? lodash.cloneDeep(rawItems) : [];
  while (items.length < count) items.push(makeItem(items.length));
  if (items.length > count) items = items.slice(0, count);
  return {
    count,
    items: items.map((it, i) => ({
      id: String(it?.id || `cat-${i + 1}`),
      label: typeof it?.label === "string" ? it.label : `Catagory ${i + 1}`,
      disabled: Boolean(it?.disabled),
      elements: Array.isArray(it?.elements) ? it.elements : [],
      catagoriesButtonFill:
        it?.catagoriesButtonFill != null
          ? it.catagoriesButtonFill
          : { type: "mainColor", index: 0 },
      catagoriesButtonFillOpacity: clamp255(it?.catagoriesButtonFillOpacity),
      catagoriesButtonBorderColor:
        it?.catagoriesButtonBorderColor != null
          ? it.catagoriesButtonBorderColor
          : "#ffffff",
      catagoriesButtonBorderOpacity: clamp255(it?.catagoriesButtonBorderOpacity),
      catagoriesButtonTextColor:
        it?.catagoriesButtonTextColor != null
          ? it.catagoriesButtonTextColor
          : "#ffffff",
      catagoriesButtonTextOpacity: clamp255(it?.catagoriesButtonTextOpacity),
      catagoriesButtonInactiveFill:
        it?.catagoriesButtonInactiveFill != null
          ? it.catagoriesButtonInactiveFill
          : it?.catagoriesButtonFill != null
            ? it.catagoriesButtonFill
            : "#d8d8d8",
      catagoriesButtonInactiveFillOpacity: clamp255(
        it?.catagoriesButtonInactiveFillOpacity ?? it?.catagoriesButtonFillOpacity
      ),
      catagoriesButtonInactiveBorderColor:
        it?.catagoriesButtonInactiveBorderColor != null
          ? it.catagoriesButtonInactiveBorderColor
          : it?.catagoriesButtonBorderColor != null
            ? it.catagoriesButtonBorderColor
            : "#ffffff",
      catagoriesButtonInactiveBorderOpacity: clamp255(
        it?.catagoriesButtonInactiveBorderOpacity ??
          it?.catagoriesButtonBorderOpacity
      ),
      catagoriesButtonInactiveTextColor:
        it?.catagoriesButtonInactiveTextColor != null
          ? it.catagoriesButtonInactiveTextColor
          : it?.catagoriesButtonTextColor != null
            ? it.catagoriesButtonTextColor
            : "#ffffff",
      catagoriesButtonInactiveTextOpacity: clamp255(
        it?.catagoriesButtonInactiveTextOpacity ?? it?.catagoriesButtonTextOpacity
      ),
    })),
  };
}

export function mergeCatagoriesElement(raw) {
  const base = lodash.merge({}, CATAGORIES_ELEMENT_DEFAULTS, raw || {});
  const tabsRaw = Array.isArray(base.catagoriesTabs) && base.catagoriesTabs.length
    ? base.catagoriesTabs
    : null;

  const tabsPreNormalized = tabsRaw
    ? tabsRaw.map((tab, idx) => {
        const fallbackCount =
          Number(tab?.itemCount) || Number(tab?.catagoriesItemCount) || 6;
        const normalized = normalizeItems(tab?.items, fallbackCount);
        const activeItemId = normalized.items.some(
          (it) => String(it.id) === String(tab?.activeItemId)
        )
          ? String(tab.activeItemId)
          : normalized.items[0]?.id;
        return {
          id: String(tab?.id || `ctg-tab-${idx + 1}`),
          label:
            typeof tab?.label === "string" && tab.label.trim() !== ""
              ? tab.label
              : `Categories ${idx + 1}`,
          itemCount: normalized.count,
          activeItemId,
          themeActiveItemId: normalized.items.some(
            (it) => String(it.id) === String(tab?.themeActiveItemId)
          )
            ? String(tab.themeActiveItemId)
            : activeItemId,
          items: normalized.items,
        };
      })
    : [
        (() => {
          const normalized = normalizeItems(
            base.catagoriesItems,
            Number(base.catagoriesItemCount) || 6
          );
          const activeItemId = normalized.items.some(
            (it) => String(it.id) === String(base.catagoriesActiveId)
          )
            ? String(base.catagoriesActiveId)
            : normalized.items[0]?.id;
          return {
            id: "ctg-tab-1",
            label: "Categories 1",
            itemCount: normalized.count,
            activeItemId,
            themeActiveItemId: activeItemId,
            items: normalized.items,
          };
        })(),
      ];

  // Ensure item ids are unique across all categories so DnD targets
  // are unambiguous even when legacy data reused ids like "cat-1".
  const usedItemIds = new Set();
  const usedNestedElementIds = new Set();
  const tabs = tabsPreNormalized.map((tab, tabIdx) => {
    const tabId = String(tab?.id || `ctg-tab-${tabIdx + 1}`);
    const idMap = new Map();
    const items = Array.isArray(tab?.items) ? tab.items : [];
    const nextItems = items.map((item, itemIdx) => {
      const rawId = String(item?.id || "");
      let nextId = rawId;
      if (!nextId || usedItemIds.has(nextId)) {
        nextId = `${tabId}-cat-${itemIdx + 1}`;
        let salt = 1;
        while (usedItemIds.has(nextId)) {
          nextId = `${tabId}-cat-${itemIdx + 1}-${salt}`;
          salt += 1;
        }
      }
      usedItemIds.add(nextId);
      if (rawId) idMap.set(rawId, nextId);
      const nextElements = (Array.isArray(item?.elements) ? item.elements : []).map(
        (entry, elementIdx) => {
          const rawElementId = String(entry?.id || "");
          let nextElementId = rawElementId;
          if (!nextElementId || usedNestedElementIds.has(nextElementId)) {
            const elementPrefix =
              String(entry?.type || "el")
                .replace(/[^a-zA-Z0-9_-]/g, "")
                .trim() || "el";
            nextElementId = `${elementPrefix}-${tabId}-i${itemIdx + 1}-e${elementIdx + 1}`;
            let salt = 1;
            while (usedNestedElementIds.has(nextElementId)) {
              nextElementId = `${elementPrefix}-${tabId}-i${itemIdx + 1}-e${elementIdx + 1}-${salt}`;
              salt += 1;
            }
          }
          usedNestedElementIds.add(nextElementId);
          return { ...entry, id: nextElementId };
        }
      );
      return { ...item, id: nextId, elements: nextElements };
    });
    const resolveItemId = (candidate) => {
      const c = String(candidate || "");
      if (!c) return nextItems[0]?.id;
      if (nextItems.some((it) => String(it?.id) === c)) return c;
      if (idMap.has(c)) return idMap.get(c);
      return nextItems[0]?.id;
    };
    return {
      ...tab,
      items: nextItems,
      activeItemId: resolveItemId(tab?.activeItemId),
      themeActiveItemId: resolveItemId(tab?.themeActiveItemId),
    };
  });

  const activeCategoryId = tabs.some(
    (t) => String(t.id) === String(base.catagoriesActiveCategoryId)
  )
    ? String(base.catagoriesActiveCategoryId)
    : tabs[0]?.id;
  const activeTab =
    tabs.find((t) => String(t.id) === String(activeCategoryId)) || tabs[0];
  const activeItems = Array.isArray(activeTab?.items) ? activeTab.items : [];
  const activeItemId = activeItems.some(
    (it) => String(it.id) === String(activeTab?.activeItemId)
  )
    ? String(activeTab.activeItemId)
    : activeItems[0]?.id;

  return {
    ...base,
    catagoriesTabs: tabs,
    catagoriesActiveCategoryId: activeCategoryId,
    catagoriesItemCount: Math.min(
      12,
      Math.max(1, Number(activeTab?.itemCount) || activeItems.length || 1)
    ),
    catagoriesItems: activeItems,
    catagoriesActiveId: activeItemId,
    catagoriesPerViewDesktop: Math.min(
      6,
      Math.max(1, Number(base.catagoriesPerViewDesktop) || 1)
    ),
    catagoriesPerViewTablet: Math.min(
      4,
      Math.max(1, Number(base.catagoriesPerViewTablet) || 1)
    ),
    catagoriesPerViewMobile: Math.min(
      3,
      Math.max(1, Number(base.catagoriesPerViewMobile) || 1)
    ),
    catagoriesGap: Math.max(0, Number(base.catagoriesGap) || 0),
    catagoriesItemGap: Math.max(0, Number(base.catagoriesItemGap) || 12),
    catagoriesButtonFillOpacity: clamp255(base.catagoriesButtonFillOpacity),
    catagoriesButtonBorderOpacity: clamp255(base.catagoriesButtonBorderOpacity),
    catagoriesButtonTextOpacity: clamp255(base.catagoriesButtonTextOpacity),
    catagoriesButtonInactiveFillOpacity: clamp255(
      base.catagoriesButtonInactiveFillOpacity
    ),
    catagoriesButtonInactiveBorderOpacity: clamp255(
      base.catagoriesButtonInactiveBorderOpacity
    ),
    catagoriesButtonInactiveTextOpacity: clamp255(
      base.catagoriesButtonInactiveTextOpacity
    ),
    catagoriesButtonBold: base.catagoriesButtonBold !== false,
    catagoriesButtonBorderWidth: Math.max(
      0,
      Math.min(8, Number(base.catagoriesButtonBorderWidth) || 0)
    ),
    catagoriesButtonRadius: Math.max(
      0,
      Math.min(60, Number(base.catagoriesButtonRadius) || 0)
    ),
    catagoriesButtonFontSize: Math.max(
      9,
      Math.min(42, Number(base.catagoriesButtonFontSize) || 13)
    ),
    catagoriesButtonPaddingX: Math.max(
      0,
      Math.min(80, Number(base.catagoriesButtonPaddingX) || 0)
    ),
    catagoriesButtonPaddingY: Math.max(
      0,
      Math.min(40, Number(base.catagoriesButtonPaddingY) || 0)
    ),
    catagoriesMarginTop: Math.max(
      0,
      Math.min(80, Number(base.catagoriesMarginTop) || 8)
    ),
    catagoriesMarginBottom: Math.max(
      0,
      Math.min(80, Number(base.catagoriesMarginBottom) || 8)
    ),
  };
}
