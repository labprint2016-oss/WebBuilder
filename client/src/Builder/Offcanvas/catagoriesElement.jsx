import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Stack } from "@mui/material";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Copy,
  Monitor,
  Minus,
  Plus,
  Smartphone,
  Tablet,
  Trash2,
} from "lucide-react";
import lodash from "lodash";
import Range from "../HTML/Range";
import MainLabel from "../HTML/MainLabel";
import { swatchSelectedCheckClassName } from "../Layouts/Elements/swatchCheckClass";
import { THEME_PANEL_BASIC_COLOR_SWATCHES } from "../themePanelBasicColors";
import { mergeCatagoriesElement } from "../Layouts/Elements/catagoriesElementConfig";

const ITEM_LIST_MAX = 12;
const ITEM_LIST_MIN = 1;
const stepperBtnClass =
  "flex h-[34px] w-9 shrink-0 items-center justify-center border-0 bg-white text-[12px] font-normal text-slate-700 transition hover:bg-slate-50 dark:bg-slate-900/80 dark:text-white/90 dark:hover:bg-white/10";
const stepperMidNumericClass =
  "flex h-[34px] min-w-[2.25rem] flex-1 items-stretch justify-center border-x border-slate-200 bg-white px-0.5 dark:border-white/10 dark:bg-slate-900/80";
const perViewIconAddonClass =
  "flex h-[34px] w-9 shrink-0 items-center justify-center border-r border-slate-200 bg-slate-50 text-slate-600 dark:border-white/10 dark:bg-slate-800/70 dark:text-white/75";
const perViewTextInputClass =
  "h-[34px] min-w-0 w-0 flex-1 border-0 bg-white px-2 pr-1 text-[12px] font-normal tabular-nums text-slate-800 outline-none ring-0 placeholder:text-slate-400 focus:outline-none dark:bg-slate-900/80 dark:text-white/90 dark:placeholder:text-white/40";
const perViewSpinnerBtnClass =
  "flex flex-1 min-h-0 w-full items-center justify-center border-0 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 disabled:pointer-events-none disabled:opacity-35 dark:bg-slate-900/80 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white/90";

const CAT_PERVIEW_INPUTS = [
  { id: "cat-pv-d", field: "catagoriesPerViewDesktop", min: 1, max: 6, Icon: Monitor, deviceLabel: "เดสก์ท็อป" },
  { id: "cat-pv-t", field: "catagoriesPerViewTablet", min: 1, max: 4, Icon: Tablet, deviceLabel: "แท็บเล็ต" },
  { id: "cat-pv-m", field: "catagoriesPerViewMobile", min: 1, max: 3, Icon: Smartphone, deviceLabel: "มือถือ" },
];

const CAT_TAB_MAX = 12;
const CAT_TAB_MIN = 1;
const CAT_COLOR_EDIT_MODES = [
  { id: "fill", label: "สีพื้นหลังปุ่ม" },
  { id: "border", label: "สีขอบ" },
  { id: "text", label: "สีข้อความ" },
];

const ActiveItemSelectLine = ({
  prev,
  next,
  value,
  prevAria,
  nextAria,
  groupAria,
}) => (
  <div
    className="flex items-center justify-between gap-0.5 rounded-lg border border-slate-200 bg-white px-0.5 py-0.5 dark:border-white/10 dark:bg-slate-800/90"
    role="group"
    aria-label={groupAria}
  >
    <button
      type="button"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
      onClick={prev}
      aria-label={prevAria}
    >
      <ChevronLeft className="size-4" strokeWidth={2} aria-hidden />
    </button>
    <span className="min-w-0 flex-1 truncate text-center text-[11px] font-normal text-slate-800 dark:text-white/90">
      {value}
    </span>
    <button
      type="button"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
      onClick={next}
      aria-label={nextAria}
    >
      <ChevronRight className="size-4" strokeWidth={2} aria-hidden />
    </button>
  </div>
);

function parseDigits(raw, min, max) {
  const digits = String(raw).replace(/[^\d]/g, "");
  if (digits === "") return null;
  const n = parseInt(digits, 10);
  if (!Number.isFinite(n)) return null;
  return Math.min(max, Math.max(min, n));
}

function NumericStepper({ value, min, max, onChange, decLabel, incLabel }) {
  const [text, setText] = useState(String(value));
  useEffect(() => {
    setText(String(value));
  }, [value]);
  const commitText = useCallback(
    (raw) => {
      const n = parseDigits(raw, min, max);
      if (n === null) {
        setText(String(value));
        return;
      }
      onChange(n);
      setText(String(n));
    },
    [min, max, onChange, value]
  );
  return (
    <div className="flex w-full overflow-hidden rounded-md border border-slate-200 dark:border-white/10">
      <button type="button" className={stepperBtnClass} aria-label={decLabel} onClick={() => onChange(Math.max(min, value - 1))}>
        <Minus className="h-3.5 w-3.5 shrink-0" strokeWidth={2.2} />
      </button>
      <div className={stepperMidNumericClass}>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          className="box-border h-full min-h-0 w-full min-w-0 border-0 bg-transparent px-0.5 py-0 text-center text-[12px] font-normal tabular-nums leading-none text-slate-800 outline-none ring-0 dark:text-white/90"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => commitText(text)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commitText(text);
              e.currentTarget.blur();
            }
          }}
        />
      </div>
      <button type="button" className={stepperBtnClass} aria-label={incLabel} onClick={() => onChange(Math.min(max, value + 1))}>
        <Plus className="h-3.5 w-3.5 shrink-0" strokeWidth={2.2} />
      </button>
    </div>
  );
}

const chipSelected = (active, chip) => {
  if (active && typeof active === "object" && chip && typeof chip === "object") {
    return lodash.isEqual(active, chip);
  }
  if (typeof active === "string" && typeof chip === "string") {
    return active.toLowerCase() === chip.toLowerCase();
  }
  return false;
};

const CatagoriesElementOffcanvas = ({
  element,
  onUpdate,
  close,
  textColor = "#0d9488",
  theme,
}) => {
  const layoutSyncRafRef = useRef(0);
  const pendingRef = useRef(null);
  const elementRef = useRef(element);
  elementRef.current = element;
  const scheduleLayoutSync = useCallback(
    (next) => {
      const base = elementRef.current || {};
      const merged = {
        ...base,
        ...next,
        type: next?.type ?? base?.type ?? "ctg",
        id: next?.id != null ? next.id : base?.id,
      };
      pendingRef.current = lodash.cloneDeep(merged);
      if (layoutSyncRafRef.current) cancelAnimationFrame(layoutSyncRafRef.current);
      layoutSyncRafRef.current = requestAnimationFrame(() => {
        layoutSyncRafRef.current = 0;
        const snapshot = pendingRef.current;
        pendingRef.current = null;
        if (snapshot) onUpdate?.(snapshot);
      });
    },
    [onUpdate]
  );
  const [data, setData] = useState(() => mergeCatagoriesElement(element));
  const [activeColorEditModeIndex, setActiveColorEditModeIndex] = useState(0);
  const [inactiveColorEditModeIndex, setInactiveColorEditModeIndex] = useState(0);
  useEffect(() => {
    setData(mergeCatagoriesElement(element));
  }, [element]);
  useEffect(
    () => () => {
      if (layoutSyncRafRef.current) cancelAnimationFrame(layoutSyncRafRef.current);
    },
    []
  );
  const patch = (partial) => {
    setData((prev) => {
      const merged = mergeCatagoriesElement({ ...prev, ...partial });
      scheduleLayoutSync(merged);
      return merged;
    });
  };
  const patchItems = (updater) => {
    setData((prev) => {
      const mergedPrev = mergeCatagoriesElement(prev);
      const tabs = Array.isArray(mergedPrev.catagoriesTabs) ? mergedPrev.catagoriesTabs : [];
      const activeCategoryId = tabs.some(
        (tab) => String(tab?.id) === String(mergedPrev?.catagoriesActiveCategoryId)
      )
        ? mergedPrev?.catagoriesActiveCategoryId
        : tabs[0]?.id;
      const activeTabIndex = tabs.findIndex(
        (tab) => String(tab?.id) === String(activeCategoryId)
      );
      if (activeTabIndex < 0) return mergedPrev;
      const current = Array.isArray(tabs[activeTabIndex]?.items)
        ? tabs[activeTabIndex].items
        : [];
      const nextItems = updater(current);
      const nextActiveId = nextItems.some(
        (it) => String(it?.id) === String(tabs[activeTabIndex]?.activeItemId)
      )
        ? tabs[activeTabIndex]?.activeItemId
        : nextItems[0]?.id;
      const nextTabs = [...tabs];
      nextTabs[activeTabIndex] = {
        ...nextTabs[activeTabIndex],
        itemCount: nextItems.length,
        items: nextItems,
        activeItemId: nextActiveId,
      };
      const merged = mergeCatagoriesElement({
        ...mergedPrev,
        catagoriesTabs: nextTabs,
        catagoriesActiveCategoryId: activeCategoryId,
      });
      scheduleLayoutSync(merged);
      return merged;
    });
  };

  const patchTabs = (updater) => {
    setData((prev) => {
      const mergedPrev = mergeCatagoriesElement(prev);
      const currentTabs = Array.isArray(mergedPrev.catagoriesTabs)
        ? mergedPrev.catagoriesTabs
        : [];
      const nextTabs = updater(currentTabs);
      const merged = mergeCatagoriesElement({
        ...mergedPrev,
        catagoriesTabs: nextTabs,
        catagoriesActiveCategoryId:
          nextTabs.some(
            (tab) => String(tab?.id) === String(mergedPrev?.catagoriesActiveCategoryId)
          )
            ? mergedPrev?.catagoriesActiveCategoryId
            : nextTabs[0]?.id,
      });
      scheduleLayoutSync(merged);
      return merged;
    });
  };
  const patchThemeForAllItems = (updater) => {
    patchTabs((currentTabs) =>
      currentTabs.map((tab) => ({
        ...tab,
        items: (Array.isArray(tab?.items) ? tab.items : []).map((item) =>
          updater(item)
        ),
      }))
    );
  };
  const addItem = () => {
    patchItems((current) => {
      if (current.length >= ITEM_LIST_MAX) return current;
      const idx = current.length + 1;
      return [
        ...current,
        { id: `cat-${Date.now()}-${idx}`, label: `Catagory ${idx}`, disabled: false, elements: [] },
      ];
    });
  };
  const removeItem = (itemId) => {
    patchItems((current) => {
      if (current.length <= ITEM_LIST_MIN) return current;
      return current.filter((it) => it.id !== itemId);
    });
  };
  const duplicateItem = (itemId) => {
    patchItems((current) => {
      if (current.length >= ITEM_LIST_MAX) return current;
      const idx = current.findIndex((it) => it.id === itemId);
      if (idx === -1) return current;
      const src = lodash.cloneDeep(current[idx]);
      const next = [...current];
      next.splice(idx + 1, 0, {
        ...src,
        id: `cat-${Date.now()}-${idx + 1}`,
        label:
          typeof src?.label === "string" && src.label.trim() !== ""
            ? `${src.label} (copy)`
            : `Catagory ${idx + 2}`,
      });
      return next;
    });
  };

  const tabs = Array.isArray(data.catagoriesTabs) ? data.catagoriesTabs : [];
  const activeCategoryId = tabs.some(
    (tab) => String(tab?.id) === String(data?.catagoriesActiveCategoryId)
  )
    ? data?.catagoriesActiveCategoryId
    : tabs[0]?.id;
  const activeTabIndex = tabs.findIndex(
    (tab) => String(tab?.id) === String(activeCategoryId)
  );
  const activeTab = activeTabIndex >= 0 ? tabs[activeTabIndex] : tabs[0];
  const activeCategoryNumber = activeTabIndex >= 0 ? activeTabIndex + 1 : 1;
  const items = Array.isArray(activeTab?.items) ? activeTab.items : [];
  const themeActiveItem = items[0] || null;
  const marginTop = Math.max(0, Math.min(80, Number(data?.catagoriesMarginTop) || 8));
  const marginBottom = Math.max(0, Math.min(80, Number(data?.catagoriesMarginBottom) || 8));
  const allColors = useMemo(() => {
    if (!theme?.mainColor?.length) return [];
    const mc = theme.mainColor.map((_, i) => ({ type: "mainColor", index: i }));
    const tc = (theme.textColor || []).map((_, i) => ({ type: "textColor", index: i }));
    const oc = (theme.otherColor || []).map((_, i) => ({ type: "otherColor", index: i }));
    return [...mc, ...tc, ...oc, ...THEME_PANEL_BASIC_COLOR_SWATCHES];
  }, [theme]);
  const activeColorEditMode =
    CAT_COLOR_EDIT_MODES[activeColorEditModeIndex] || CAT_COLOR_EDIT_MODES[0];
  const inactiveColorEditMode =
    CAT_COLOR_EDIT_MODES[inactiveColorEditModeIndex] || CAT_COLOR_EDIT_MODES[0];
  const currentActiveColorValue =
    activeColorEditMode.id === "fill"
      ? themeActiveItem?.catagoriesButtonFill
      : activeColorEditMode.id === "border"
        ? themeActiveItem?.catagoriesButtonBorderColor
        : themeActiveItem?.catagoriesButtonTextColor;
  const currentActiveOpacityValue = Math.max(
    0,
    Math.min(
      255,
      Number(
        activeColorEditMode.id === "fill"
          ? themeActiveItem?.catagoriesButtonFillOpacity
          : activeColorEditMode.id === "border"
            ? themeActiveItem?.catagoriesButtonBorderOpacity
            : themeActiveItem?.catagoriesButtonTextOpacity
      ) || 255
    )
  );
  const currentInactiveColorValue =
    inactiveColorEditMode.id === "fill"
      ? themeActiveItem?.catagoriesButtonInactiveFill
      : inactiveColorEditMode.id === "border"
        ? themeActiveItem?.catagoriesButtonInactiveBorderColor
        : themeActiveItem?.catagoriesButtonInactiveTextColor;
  const currentInactiveOpacityValue = Math.max(
    0,
    Math.min(
      255,
      Number(
        inactiveColorEditMode.id === "fill"
          ? themeActiveItem?.catagoriesButtonInactiveFillOpacity
          : inactiveColorEditMode.id === "border"
            ? themeActiveItem?.catagoriesButtonInactiveBorderOpacity
            : themeActiveItem?.catagoriesButtonInactiveTextOpacity
      ) || 255
    )
  );
  const radiusMin = 0;
  const radiusMax = 60;
  const radiusValue = Math.max(
    radiusMin,
    Math.min(radiusMax, Number(data.catagoriesButtonRadius) || 0)
  );
  const radiusPos = ((radiusValue - radiusMin) / (radiusMax - radiusMin)) * 100;
  const fontMin = 9;
  const fontMax = 42;
  const fontValue = Math.max(
    fontMin,
    Math.min(fontMax, Number(data.catagoriesButtonFontSize) || 13)
  );
  const fontPos = ((fontValue - fontMin) / (fontMax - fontMin)) * 100;
  const borderWidthMin = 0;
  const borderWidthMax = 8;
  const borderWidthValue = Math.max(
    borderWidthMin,
    Math.min(borderWidthMax, Number(data?.catagoriesButtonBorderWidth) || 0)
  );
  const borderWidthPos =
    ((borderWidthValue - borderWidthMin) / (borderWidthMax - borderWidthMin || 1)) *
    100;

  return (
    <aside className="flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden bg-white dark:bg-gray-900/80 border-r border-slate-200 dark:border-white/10">
      <div className="shrink-0 px-6 pt-5 pb-3 flex items-center justify-between bg-gray-100 dark:bg-gray-900/50">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 font-bold tracking-wide text-slate-800 dark:text-white/90">Catagories</span>
          <span className="inline-flex min-w-0 max-w-full items-center rounded-md border border-[#333333] bg-[#333333] px-2 py-0.5 text-[11px] font-mono font-bold leading-none text-white tabular-nums">
            <span className="truncate">{data?.id}</span>
          </span>
        </div>
        <button
          type="button"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-white/70"
          onClick={() => close(null, null, null)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <path fillRule="evenodd" d="M15.78 4.22a.75.75 0 010 1.06L10.06 11l5.72 5.72a.75.75 0 11-1.06 1.06l-6.25-6.25a.75.75 0 010-1.06l6.25-6.25a.75.75 0 011.06 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain px-4 pb-8 w-full">
        <ul className="mt-4 pl-1 space-y-5">
          <li>
            <div className="mb-3 mt-1 flex items-center gap-2">
              <span className="shrink-0 text-[13px] font-semibold text-slate-700 dark:text-white/80">จำนวนไอเทมที่แสดง</span>
              <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
            </div>
            <Stack direction="row" spacing={1} className="w-full">
              {CAT_PERVIEW_INPUTS.map(({ id, field, min, max, Icon, deviceLabel }) => (
                <div key={id} className="flex min-w-0 flex-1 overflow-hidden rounded-md border border-slate-200 dark:border-white/10">
                  <span className={perViewIconAddonClass} title={deviceLabel} aria-hidden>
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  <input
                    id={id}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="off"
                    aria-label={`จำนวนไอเทมที่แสดง — ${deviceLabel}`}
                    className={perViewTextInputClass}
                    value={String(data[field])}
                    onChange={(e) => {
                      const nextVal = parseDigits(e.target.value, min, max);
                      if (nextVal === null) return;
                      patch({ [field]: nextVal });
                    }}
                  />
                  <div className="flex h-[34px] w-8 shrink-0 flex-col divide-y divide-slate-200 overflow-hidden border-l border-slate-200 dark:divide-white/10 dark:border-white/10" role="group">
                    <button
                      type="button"
                      className={perViewSpinnerBtnClass}
                      disabled={data[field] >= max}
                      onClick={() => patch({ [field]: Math.min(max, (Number(data[field]) || min) + 1) })}
                    >
                      <ChevronUp className="h-3.5 w-3.5" strokeWidth={2.25} />
                    </button>
                    <button
                      type="button"
                      className={perViewSpinnerBtnClass}
                      disabled={data[field] <= min}
                      onClick={() => patch({ [field]: Math.max(min, (Number(data[field]) || min) - 1) })}
                    >
                      <ChevronDown className="h-3.5 w-3.5" strokeWidth={2.25} />
                    </button>
                  </div>
                </div>
              ))}
            </Stack>
          </li>

          <li className="!mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="min-w-0">
                <MainLabel
                  label="ความโค้งมน"
                  value={radiusValue}
                  mb={0.5}
                />
                <Range
                  min={radiusMin}
                  max={radiusMax}
                  step={1}
                  value={radiusValue}
                  pos={radiusPos}
                  color={textColor}
                  handleChange={(e) =>
                    patch({
                      catagoriesButtonRadius: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="min-w-0">
                <MainLabel
                  label="ขนาดตัวอักษร"
                  value={fontValue}
                  mb={0.5}
                />
                <Range
                  min={fontMin}
                  max={fontMax}
                  step={1}
                  value={fontValue}
                  pos={fontPos}
                  color={textColor}
                  handleChange={(e) =>
                    patch({
                      catagoriesButtonFontSize: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          </li>

          <li className="!mt-4">
            <div className="min-w-0">
              <MainLabel
                label="ความหนาขอบ"
                value={borderWidthValue}
                mb={0.5}
              />
              <Range
                min={borderWidthMin}
                max={borderWidthMax}
                step={1}
                value={borderWidthValue}
                pos={borderWidthPos}
                color={textColor}
                handleChange={(e) =>
                  patch({
                    catagoriesButtonBorderWidth: Number(e.target.value),
                  })
                }
              />
            </div>
          </li>

          <li>
            <div className="grid grid-cols-2 gap-3">
              <div>
                {(() => {
                  const min = 8;
                  const max = 48;
                  const value = Math.max(
                    min,
                    Math.min(max, Number(data.catagoriesButtonPaddingX) || 14)
                  );
                  const pos = ((value - min) / (max - min)) * 100;
                  return (
                    <>
                      <MainLabel
                        label="ระยะซ้าย-ขวา"
                        value={value}
                        mb={0.5}
                      />
                      <Range
                        min={min}
                        max={max}
                        step={1}
                        value={value}
                        pos={pos}
                        color={textColor}
                        handleChange={(e) =>
                          patch({
                            catagoriesButtonPaddingX: Number(e.target.value),
                          })
                        }
                      />
                    </>
                  );
                })()}
              </div>
              <div className="min-w-0">
                {(() => {
                  const min = 4;
                  const max = 24;
                  const value = Math.max(
                    min,
                    Math.min(max, Number(data.catagoriesButtonPaddingY) || 8)
                  );
                  const pos = ((value - min) / (max - min)) * 100;
                  return (
                    <>
                      <MainLabel
                        label="ระยะบน-ล่าง"
                        value={value}
                        mb={0.5}
                      />
                      <Range
                        min={min}
                        max={max}
                        step={1}
                        value={value}
                        pos={pos}
                        color={textColor}
                        handleChange={(e) =>
                          patch({
                            catagoriesButtonPaddingY: Number(e.target.value),
                          })
                        }
                      />
                    </>
                  );
                })()}
              </div>
            </div>
          </li>

          <li>
            <div className="grid grid-cols-2 gap-3">
              <div className="min-w-0">
                {(() => {
                  const min = 0;
                  const max = 48;
                  const value = Math.max(
                    min,
                    Math.min(max, Number(data.catagoriesGap) || 0)
                  );
                  const pos = ((value - min) / (max - min || 1)) * 100;
                  return (
                    <>
                      <MainLabel
                        label="ระยะห่างปุ่ม"
                        value={value}
                        mb={0.5}
                      />
                      <Range
                        min={min}
                        max={max}
                        step={1}
                        value={value}
                        pos={pos}
                        color={textColor}
                        handleChange={(e) =>
                          patch({
                            catagoriesGap: Number(e.target.value),
                          })
                        }
                      />
                    </>
                  );
                })()}
              </div>
              <div className="min-w-0">
                {(() => {
                  const min = 0;
                  const max = 48;
                  const value = Math.max(
                    min,
                    Math.min(max, Number(data.catagoriesItemGap) || 12)
                  );
                  const pos = ((value - min) / (max - min || 1)) * 100;
                  return (
                    <>
                      <MainLabel
                        label="ระยะห่างรายการ"
                        value={value}
                        mb={0.5}
                      />
                      <Range
                        min={min}
                        max={max}
                        step={1}
                        value={value}
                        pos={pos}
                        color={textColor}
                        handleChange={(e) =>
                          patch({
                            catagoriesItemGap: Number(e.target.value),
                          })
                        }
                      />
                    </>
                  );
                })()}
              </div>
            </div>
          </li>

          <li className="w-full !mt-4">
            <div className="mb-2 mt-1 flex w-full items-center gap-2">
              <MainLabel
                label="สีปุ่มหมวดหมู่ - ทำงาน"
                mb={0.5}
                checked={data?.catagoriesButtonBold !== false}
                handleSwitch={(e) =>
                  patch({ catagoriesButtonBold: e.target.checked })
                }
                typography="ตัวหนา"
                color={textColor}
              />
            </div>
            <ActiveItemSelectLine
              prev={() => {
                setActiveColorEditModeIndex((prev) =>
                  (prev - 1 + CAT_COLOR_EDIT_MODES.length) %
                  CAT_COLOR_EDIT_MODES.length
                );
              }}
              next={() => {
                setActiveColorEditModeIndex((prev) =>
                  (prev + 1) % CAT_COLOR_EDIT_MODES.length
                );
              }}
              prevAria="เลือกหัวข้อสีก่อนหน้า"
              nextAria="เลือกหัวข้อสีถัดไป"
              groupAria="เลือกหัวข้อสีที่ต้องการปรับ"
              value={activeColorEditMode.label}
            />
            <div className="mt-2">
              <Range
                min={0}
                max={255}
                step={1}
                value={currentActiveOpacityValue}
                handleChange={(e) =>
                  patchThemeForAllItems((item) => ({
                    ...item,
                    ...(activeColorEditMode.id === "fill"
                      ? {
                          catagoriesButtonFillOpacity:
                            Number(e.target.value) || 255,
                        }
                      : activeColorEditMode.id === "border"
                        ? {
                            catagoriesButtonBorderOpacity:
                              Number(e.target.value) || 255,
                          }
                        : {
                            catagoriesButtonTextOpacity:
                              Number(e.target.value) || 255,
                          }),
                  }))
                }
                pos={(currentActiveOpacityValue / 255) * 100}
                color={textColor}
              />
            </div>
            <div className="mt-2 grid grid-cols-10 place-items-center gap-x-0 gap-y-[6px]">
              {allColors.map((color, i) => {
                const bgColor = typeof color === "string" ? color : theme?.[color.type]?.[color.index];
                if (bgColor == null) return null;
                const selected = chipSelected(currentActiveColorValue, color);
                return (
                  <button
                    key={`fill-${i}`}
                    type="button"
                    className="flex size-[25px] items-center justify-center rounded-full border border-slate-200 dark:border-white/15"
                    style={{ backgroundColor: bgColor }}
                    onClick={() =>
                      patchThemeForAllItems((item) => ({
                        ...item,
                        ...(activeColorEditMode.id === "fill"
                          ? { catagoriesButtonFill: color }
                          : activeColorEditMode.id === "border"
                            ? {
                                catagoriesButtonBorderColor: color,
                              }
                            : {
                                catagoriesButtonTextColor: color,
                              }),
                      }))
                    }
                  >
                    {selected ? <Check className={swatchSelectedCheckClassName(bgColor)} strokeWidth={4} aria-hidden /> : null}
                  </button>
                );
              })}
            </div>
          </li>

          <li className="w-full !mt-4">
            <div className="mb-2 mt-1 flex w-full items-center gap-2">
              <MainLabel label="สีปุ่มหมวดหมู่" mb={0.5} />
            </div>
            <ActiveItemSelectLine
              prev={() => {
                setInactiveColorEditModeIndex((prev) =>
                  (prev - 1 + CAT_COLOR_EDIT_MODES.length) %
                  CAT_COLOR_EDIT_MODES.length
                );
              }}
              next={() => {
                setInactiveColorEditModeIndex((prev) =>
                  (prev + 1) % CAT_COLOR_EDIT_MODES.length
                );
              }}
              prevAria="เลือกหัวข้อสีก่อนหน้า"
              nextAria="เลือกหัวข้อสีถัดไป"
              groupAria="เลือกหัวข้อสีที่ต้องการปรับ"
              value={inactiveColorEditMode.label}
            />
            <div className="mt-2">
              <Range
                min={0}
                max={255}
                step={1}
                value={currentInactiveOpacityValue}
                handleChange={(e) =>
                  patchThemeForAllItems((item) => ({
                    ...item,
                    ...(inactiveColorEditMode.id === "fill"
                      ? {
                          catagoriesButtonInactiveFillOpacity:
                            Number(e.target.value) || 255,
                        }
                      : inactiveColorEditMode.id === "border"
                        ? {
                            catagoriesButtonInactiveBorderOpacity:
                              Number(e.target.value) || 255,
                          }
                        : {
                            catagoriesButtonInactiveTextOpacity:
                              Number(e.target.value) || 255,
                          }),
                  }))
                }
                pos={(currentInactiveOpacityValue / 255) * 100}
                color={textColor}
              />
            </div>
            <div className="mt-2 grid grid-cols-10 place-items-center gap-x-0 gap-y-[6px]">
              {allColors.map((color, i) => {
                const bgColor = typeof color === "string" ? color : theme?.[color.type]?.[color.index];
                if (bgColor == null) return null;
                const selected = chipSelected(currentInactiveColorValue, color);
                return (
                  <button
                    key={`inactive-fill-${i}`}
                    type="button"
                    className="flex size-[25px] items-center justify-center rounded-full border border-slate-200 dark:border-white/15"
                    style={{ backgroundColor: bgColor }}
                    onClick={() =>
                      patchThemeForAllItems((item) => ({
                        ...item,
                        ...(inactiveColorEditMode.id === "fill"
                          ? { catagoriesButtonInactiveFill: color }
                          : inactiveColorEditMode.id === "border"
                            ? {
                                catagoriesButtonInactiveBorderColor: color,
                              }
                            : {
                                catagoriesButtonInactiveTextColor: color,
                              }),
                      }))
                    }
                  >
                    {selected ? <Check className={swatchSelectedCheckClassName(bgColor)} strokeWidth={4} aria-hidden /> : null}
                  </button>
                );
              })}
            </div>
          </li>

          <li>
            <div className="grid w-full grid-cols-2 gap-x-3 gap-y-4 px-0.5">
              <div className="min-w-0">
                <MainLabel label={`ระยะด้านบน ${marginTop}`} mb={0.4} />
                <Range min={0} max={80} step={1} value={marginTop} handleChange={(e) => patch({ catagoriesMarginTop: Number(e.target.value) || 0 })} pos={(marginTop / 80) * 100} color={textColor} />
              </div>
              <div className="min-w-0">
                <MainLabel label={`ระยะด้านล่าง ${marginBottom}`} mb={0.4} />
                <Range min={0} max={80} step={1} value={marginBottom} handleChange={(e) => patch({ catagoriesMarginBottom: Number(e.target.value) || 0 })} pos={(marginBottom / 80) * 100} color={textColor} />
              </div>
            </div>
          </li>

          <li>
            <div className="mb-3 mt-1 flex items-center gap-2">
              <span className="shrink-0 text-[13px] font-semibold text-slate-700 dark:text-white/80">หมวดหมู่ทั้งหมด</span>
              <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
              <button
                type="button"
                disabled={tabs.length >= CAT_TAB_MAX}
                title={tabs.length >= CAT_TAB_MAX ? "ถึงจำนวนสูงสุดแล้ว (12)" : "เพิ่มหมวด"}
                className="inline-flex min-h-[26px] shrink-0 items-center justify-center rounded-md px-2 py-1 text-[12px] font-medium leading-snug text-white transition hover:opacity-90 disabled:pointer-events-none disabled:opacity-35"
                style={{ backgroundColor: "#333333" }}
                onClick={() =>
                  patchTabs((currentTabs) => {
                    if (currentTabs.length >= CAT_TAB_MAX) return currentTabs;
                    const idx = currentTabs.length + 1;
                    return [
                      ...currentTabs,
                      {
                        id: `ctg-tab-${Date.now()}-${idx}`,
                        label: `Categories ${idx}`,
                        itemCount: 6,
                        activeItemId: "cat-1",
                        themeActiveItemId: "cat-1",
                        items: Array.from({ length: 6 }, (_, i) => ({
                          id: `cat-${i + 1}`,
                          label: `Catagory ${i + 1}`,
                          disabled: false,
                          elements: [],
                        })),
                      },
                    ];
                  })
                }
              >
                เพิ่มหมวด
              </button>
            </div>
            <Stack spacing={1}>
              {tabs.map((tab, idx) => {
                const isTabActive = String(tab?.id) === String(activeCategoryId);
                const itemCount = Math.max(1, Number(tab?.itemCount) || tab?.items?.length || 1);
                return (
                  <div key={String(tab?.id || `ctg-tab-${idx + 1}`)} className="rounded-md border border-slate-200 dark:border-white/10 px-2 py-1.5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-semibold text-white"
                        style={{ backgroundColor: "#333333" }}
                        onClick={() => patch({ catagoriesActiveCategoryId: tab.id })}
                      >
                        {isTabActive ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : idx + 1}
                      </button>
                      <span className="min-w-0 flex-1 truncate px-1 text-[12px] text-slate-700 dark:text-white/85">
                        {String(tab?.label || `Categories ${idx + 1}`)}
                      </span>
                      <span className="shrink-0 text-[11px] text-slate-400">{itemCount}</span>
                      <button
                        type="button"
                        disabled={idx === 0}
                        className="rounded p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-35 dark:hover:bg-white/10 dark:hover:text-white/80"
                        onClick={() =>
                          patchTabs((currentTabs) => {
                            if (idx === 0) return currentTabs;
                            const next = [...currentTabs];
                            [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                            return next;
                          })
                        }
                      >
                        <ArrowUp className="h-3 w-3" strokeWidth={2.25} />
                      </button>
                      <button
                        type="button"
                        disabled={idx >= tabs.length - 1}
                        className="rounded p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-35 dark:hover:bg-white/10 dark:hover:text-white/80"
                        onClick={() =>
                          patchTabs((currentTabs) => {
                            if (idx >= currentTabs.length - 1) return currentTabs;
                            const next = [...currentTabs];
                            [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
                            return next;
                          })
                        }
                      >
                        <ArrowDown className="h-3 w-3" strokeWidth={2.25} />
                      </button>
                      <button
                        type="button"
                        disabled={tabs.length <= CAT_TAB_MIN}
                        className="rounded p-0.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:pointer-events-none disabled:opacity-35 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                        onClick={() =>
                          patchTabs((currentTabs) => {
                            if (currentTabs.length <= CAT_TAB_MIN) return currentTabs;
                            return currentTabs.filter(
                              (it) => String(it?.id) !== String(tab?.id)
                            );
                          })
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </Stack>
          </li>

          <li>
            <div className="mb-3 mt-1 flex items-center gap-2">
              <span className="shrink-0 text-[13px] font-semibold text-slate-700 dark:text-white/80">
                รายการในหมวดที่เลือก
              </span>
              <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
              <button
                type="button"
                disabled={items.length >= ITEM_LIST_MAX}
                title={items.length >= ITEM_LIST_MAX ? "ถึงจำนวนสูงสุดแล้ว (12)" : "เพิ่มรายการ"}
                className="inline-flex min-h-[26px] shrink-0 items-center justify-center rounded-md px-2 py-1 text-[12px] font-medium leading-snug text-white transition hover:opacity-90 disabled:pointer-events-none disabled:opacity-35"
                style={{ backgroundColor: "#333333" }}
                onClick={addItem}
              >
                เพิ่มรายการ
              </button>
            </div>
            <Stack spacing={1}>
              {items.map((item, idx) => {
                return (
                  <div key={item.id} className="min-w-0 rounded-md border border-slate-200 dark:border-white/10">
                    <div className="flex min-h-[36px] min-w-0 items-center gap-2 px-2 py-1">
                      <div
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-semibold text-white"
                        style={{ backgroundColor: "#333333" }}
                        title={`หมวดที่ ${activeCategoryNumber}`}
                      >
                        {activeCategoryNumber}
                      </div>
                      <span className="min-w-0 flex-1 truncate text-[12px] text-slate-700 dark:text-white/80">
                        รายการที่ {idx + 1}
                      </span>
                      <div className="ml-auto flex shrink-0 items-center gap-0.5">
                        <button
                          type="button"
                          disabled={idx === 0}
                          className="rounded p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-35 dark:hover:bg-white/10 dark:hover:text-white/80"
                          onClick={() => {
                            if (idx === 0) return;
                            patchItems((current) => {
                              const next = [...current];
                              [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                              return next;
                            });
                          }}
                        >
                          <ArrowUp className="h-3 w-3" strokeWidth={2.25} />
                        </button>
                        <button
                          type="button"
                          disabled={idx >= items.length - 1}
                          className="rounded p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-35 dark:hover:bg-white/10 dark:hover:text-white/80"
                          onClick={() => {
                            if (idx >= items.length - 1) return;
                            patchItems((current) => {
                              const next = [...current];
                              [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
                              return next;
                            });
                          }}
                        >
                          <ArrowDown className="h-3 w-3" strokeWidth={2.25} />
                        </button>
                        <button
                          type="button"
                          disabled={items.length >= ITEM_LIST_MAX}
                          className="rounded p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-35 dark:hover:bg-white/10 dark:hover:text-white/80"
                          onClick={() => duplicateItem(item.id)}
                        >
                          <Copy className="h-3.5 w-3.5" strokeWidth={2} />
                        </button>
                        <button
                          type="button"
                          disabled={items.length <= ITEM_LIST_MIN}
                          className="rounded p-0.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:pointer-events-none disabled:opacity-35 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </Stack>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default CatagoriesElementOffcanvas;
