import lodash from "lodash";

export const DATA_SLIDER_ELEMENT_DEFAULTS = {
  type: "dts",
  id: "Dts-",
  dataSliderItemCount: 6,
  dataSliderItems: [
    { id: "slide-1", label: "Slide 1", disabled: false, elements: [] },
    { id: "slide-2", label: "Slide 2", disabled: false, elements: [] },
    { id: "slide-3", label: "Slide 3", disabled: false, elements: [] },
    { id: "slide-4", label: "Slide 4", disabled: false, elements: [] },
    { id: "slide-5", label: "Slide 5", disabled: false, elements: [] },
    { id: "slide-6", label: "Slide 6", disabled: false, elements: [] },
  ],
  dataSliderActiveId: "slide-1",
  dataSliderPerViewDesktop: 3,
  dataSliderPerViewTablet: 2,
  dataSliderPerViewMobile: 1,
  dataSliderGap: 12,
  dataSliderNavShape: "square",
  dataSliderNavColor: "#d8d8d8",
  dataSliderNavColorOpacity: 255,
  dataSliderNavActiveColor: { type: "mainColor", index: 0 },
  dataSliderNavActiveColorOpacity: 255,
  dataSliderAutoplay: false,
  dataSliderAutoplayDelayMs: 4500,
  dataSliderMarginTop: 8,
  dataSliderMarginBottom: 8,
};

function makeItem(i) {
  const n = i + 1;
  return {
    id: `slide-${n}`,
    label: `Slide ${n}`,
    disabled: false,
    elements: [],
  };
}

export function mergeDataSliderElement(raw) {
  const base = lodash.merge({}, DATA_SLIDER_ELEMENT_DEFAULTS, raw || {});
  const count = Math.min(
    12,
    Math.max(1, Number(base.dataSliderItemCount) || base.dataSliderItems?.length || 6)
  );
  let items = Array.isArray(base.dataSliderItems)
    ? lodash.cloneDeep(base.dataSliderItems)
    : [];
  while (items.length < count) items.push(makeItem(items.length));
  if (items.length > count) items = items.slice(0, count);
  items = items.map((it, i) => ({
    id: String(it?.id || `slide-${i + 1}`),
    label: typeof it?.label === "string" ? it.label : `Slide ${i + 1}`,
    disabled: Boolean(it?.disabled),
    elements: Array.isArray(it?.elements) ? it.elements : [],
  }));
  const activeRaw = base.dataSliderActiveId;
  const activeId = items.some((it) => it.id === activeRaw)
    ? activeRaw
    : items[0]?.id;
  const op255 = (v) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return 255;
    return Math.max(0, Math.min(255, Math.round(n)));
  };
  return {
    ...base,
    dataSliderItemCount: count,
    dataSliderItems: items,
    dataSliderActiveId: activeId,
    dataSliderPerViewDesktop: Math.min(
      4,
      Math.max(1, Number(base.dataSliderPerViewDesktop) || 1)
    ),
    dataSliderPerViewTablet: Math.min(
      3,
      Math.max(1, Number(base.dataSliderPerViewTablet) || 1)
    ),
    dataSliderPerViewMobile: Math.min(
      2,
      Math.max(1, Number(base.dataSliderPerViewMobile) || 1)
    ),
    dataSliderGap: Math.max(0, Number(base.dataSliderGap) || 0),
    dataSliderAutoplayDelayMs: Math.max(
      2000,
      Number(base.dataSliderAutoplayDelayMs) || 4500
    ),
    dataSliderNavColorOpacity: op255(base.dataSliderNavColorOpacity),
    dataSliderNavActiveColorOpacity: op255(base.dataSliderNavActiveColorOpacity),
  };
}
