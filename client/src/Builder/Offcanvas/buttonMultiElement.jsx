import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Box, Button, ButtonGroup, Stack, Switch, Typography } from "@mui/material";
import { ArrowDown, ArrowUp, Check, Copy, Minus, Plus, Trash2 } from "lucide-react";
import lodash from "lodash";
import Range from "../HTML/Range";
import MainLabel from "../HTML/MainLabel";
import { swatchSelectedCheckClassName } from "../Layouts/Elements/swatchCheckClass";
import { THEME_PANEL_BASIC_COLOR_SWATCHES } from "../themePanelBasicColors";
import { mergeListElement } from "../Layouts/Elements/listElementConfig";
import { BUTTON_STYLE_DEFAULTS } from "../Layouts/Elements/buttonElementConfig";
import { panelGroupButtonSx } from "../panelControlSx";

const THEME_RANGE_INPUT_CLASS = `
  w-full cursor-pointer appearance-none h-2 rounded-full
  bg-zinc-200 dark:bg-zinc-700
  theme-range-fill-track
  [&::-webkit-slider-runnable-track]:border-0
  [&::-moz-range-track]:border-0
  [&::-webkit-slider-thumb]:cursor-pointer
  [&::-webkit-slider-thumb]:appearance-none
  [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
  [&::-webkit-slider-thumb]:rounded-full
  [&::-webkit-slider-thumb]:bg-slate-900
  [&::-webkit-slider-thumb]:border-0
  [&::-moz-range-thumb]:cursor-pointer
  [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4
  [&::-moz-range-thumb]:rounded-full
  [&::-moz-range-thumb]:bg-slate-900
  [&::-moz-range-thumb]:border-0
`;

const groupRootSx = {
  width: "100%",
  boxShadow: "none",
  "& .MuiButton-root": { boxShadow: "none" },
  "& .MuiButtonGroup-grouped": { borderRadius: "0 !important" },
  "& .MuiButtonGroup-grouped:first-of-type": {
    borderTopLeftRadius: "0.375rem !important",
    borderBottomLeftRadius: "0.375rem !important",
  },
  "& .MuiButtonGroup-grouped:last-of-type": {
    borderTopRightRadius: "0.375rem !important",
    borderBottomRightRadius: "0.375rem !important",
  },
  "& .MuiButtonGroup-grouped.MuiButton-outlined": {
    borderColor: "var(--dash-panel-btn-group-border, #e2e8f0) !important",
  },
  ".dark & .MuiButtonGroup-grouped.MuiButton-outlined": {
    borderColor: "var(--dash-panel-btn-group-border, #e2e8f0) !important",
  },
};

const buttonSx = panelGroupButtonSx;

const itemRowReorderBtnClass =
  "rounded p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-35 dark:hover:bg-white/10 dark:hover:text-slate-200";

const ALIGN_OPTIONS = [
  { value: "start", label: "ชิดซ้าย" },
  { value: "center", label: "ตรงกลาง" },
  { value: "end", label: "ชิดขวา" },
];

const DIVIDER_STYLE_OPTIONS = [
  { value: "solid", label: "ตรง" },
  { value: "dashed", label: "ประ" },
  { value: "dotted", label: "จุด" },
];

function ensureButtonMultiItemIds(items, elementId) {
  const list = Array.isArray(items) ? items : [];
  const prefix = String(elementId || "list");
  const used = new Set();
  let seed = 1;
  return list.map((item) => {
    const next = item && typeof item === "object" ? { ...item } : {};
    let id =
      typeof next.id === "string" && next.id.trim() !== ""
        ? next.id.trim()
        : "";
    if (!id || used.has(id)) {
      while (used.has(`${prefix}__bm_${seed}`)) seed += 1;
      id = `${prefix}__bm_${seed}`;
      seed += 1;
    }
    next.id = id;
    used.add(id);
    return next;
  });
}

function normalizeButtonMultiLabels(items) {
  const list = Array.isArray(items) ? items : [];
  return list.map((item, idx) => ({
    ...(item && typeof item === "object" ? item : {}),
    listText: `Button ${idx + 1}`,
  }));
}

/** ค่าเริ่มต้นระยะห่างไอเทมของ Button Group */
const BUTTON_GROUP_DEFAULT_ITEM_GAP = 16;

function mergeButtonGroupElement(raw) {
  const mergedList = mergeListElement(raw || {});
  const base = {
    ...BUTTON_STYLE_DEFAULTS,
    ...mergedList,
  };
  const items = Array.isArray(base.listItems) ? [...base.listItems] : [];
  const desiredCountRaw = Number(base.listItemCount);
  const desiredCount = Number.isFinite(desiredCountRaw)
    ? Math.max(1, Math.min(12, Math.round(desiredCountRaw)))
    : Math.max(1, Math.min(12, items.length || 2));
  while (items.length < desiredCount) {
    const idx = items.length + 1;
    items.push({
      id: `${String(base?.id || "list")}__bm_new_${idx}`,
      listText: `Button ${idx}`,
      faIcon: { name: "faShieldHalved", type: "fas" },
    });
  }
  const itemsWithId = ensureButtonMultiItemIds(
    normalizeButtonMultiLabels(items.slice(0, desiredCount)),
    base?.id
  );
  const hasExplicitGap =
    raw != null &&
    Object.prototype.hasOwnProperty.call(raw, "listItemRowGap") &&
    Number.isFinite(Number(raw.listItemRowGap));
  const listItemRowGap = hasExplicitGap
    ? Math.max(0, Math.min(40, Math.round(Number(raw.listItemRowGap))))
    : BUTTON_GROUP_DEFAULT_ITEM_GAP;
  return {
    ...base,
    type: "list",
    listIconsElement: true,
    buttonMultiElement: true,
    listItemCount: desiredCount,
    listItems: itemsWithId,
    listItemRowGap,
  };
}

/** stepper — พื้นหลัง/กรอบตาม Dashboard (dash-input) */
const stepperBtnClass =
  "flex h-[34px] w-9 shrink-0 items-center justify-center border-0 bg-transparent text-[12px] font-normal text-slate-700 transition hover:bg-black/5 dark:text-white/90 dark:hover:bg-white/10";
const stepperMidClass =
  "flex h-[34px] min-w-[2.25rem] flex-1 items-center justify-center border-x border-slate-200 bg-transparent px-0.5 text-[12px] font-normal tabular-nums text-slate-800 dark:border-white/10 dark:text-white/90";

function clamp(v, min, max, fallback) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

const ButtonGroupElementOffcanvas = ({
  element,
  onUpdate,
  close,
  textColor,
  theme,
  darkMode = "light",
}) => {
  const accent = textColor || "#0d9488";
  const [draft, setDraft] = useState(() => mergeButtonGroupElement(element));
  const itemNodeRefs = useRef(new Map());
  const flipRectsRef = useRef(null);
  const moveLockRef = useRef(false);
  const [movingItemId, setMovingItemId] = useState(null);

  useEffect(() => {
    setDraft(mergeButtonGroupElement(element));
  }, [element]);

  useEffect(() => {
    itemNodeRefs.current = new Map();
    flipRectsRef.current = null;
    moveLockRef.current = false;
    setMovingItemId(null);
  }, [element?.id]);

  const patch = useCallback(
    (partial) => {
      const next = mergeButtonGroupElement({ ...draft, ...partial });
      setDraft(next);
      onUpdate?.(next);
    },
    [draft, onUpdate]
  );

  const captureItemRects = useCallback(() => {
    const rects = new Map();
    itemNodeRefs.current.forEach((el, id) => {
      if (el) rects.set(id, el.getBoundingClientRect());
    });
    flipRectsRef.current = rects;
  }, []);

  const setItemNodeRef = useCallback((id, el) => {
    if (el) itemNodeRefs.current.set(id, el);
    else itemNodeRefs.current.delete(id);
  }, []);

  const allColors = useMemo(() => {
    if (!theme?.mainColor?.length) return [];
    const mc = theme.mainColor.map((_, i) => ({ type: "mainColor", index: i }));
    const tc = (theme.textColor || []).map((_, i) => ({ type: "textColor", index: i }));
    const oc = (theme.otherColor || []).map((_, i) => ({ type: "otherColor", index: i }));
    return [...mc, ...tc, ...oc, ...THEME_PANEL_BASIC_COLOR_SWATCHES];
  }, [theme]);

  const items = draft.listItems || [];
  const itemOrderKey = items.map((it, i) => String(it?.id || `bm-${i}`)).join("|");

  useLayoutEffect(() => {
    const prevRects = flipRectsRef.current;
    if (!prevRects) return;
    flipRectsRef.current = null;

    const animations = [];
    itemNodeRefs.current.forEach((el, id) => {
      const first = prevRects.get(id);
      if (!el || !first) return;
      const last = el.getBoundingClientRect();
      const dy = first.top - last.top;
      if (Math.abs(dy) < 0.5) return;
      el.style.transition = "none";
      el.style.transform = `translateY(${dy}px)`;
      animations.push(el);
    });

    if (!animations.length) {
      moveLockRef.current = false;
      setMovingItemId(null);
      return;
    }

    requestAnimationFrame(() => {
      animations.forEach((el) => {
        el.style.transition = "transform 240ms cubic-bezier(0.22, 1, 0.36, 1)";
        el.style.transform = "";
      });
    });

    const unlockTimer = window.setTimeout(() => {
      animations.forEach((el) => {
        el.style.transition = "";
        el.style.transform = "";
      });
      moveLockRef.current = false;
      setMovingItemId(null);
    }, 260);

    return () => {
      window.clearTimeout(unlockTimer);
    };
  }, [itemOrderKey]);

  const handleCountChange = (newCount) => {
    const clamped = Math.min(12, Math.max(1, Number(newCount) || 1));
    const current = Array.isArray(draft.listItems) ? [...draft.listItems] : [];
    while (current.length < clamped) {
      const idx = current.length + 1;
      current.push({
        id: `${String(draft?.id || "list")}__bm_new_${idx}`,
        listText: `Button ${idx}`,
        faIcon: { name: "faShieldHalved", type: "fas" },
      });
    }
    patch({
      listItemCount: clamped,
      listItems: normalizeButtonMultiLabels(current.slice(0, clamped)),
    });
  };

  const moveItem = (fromIdx, toIdx) => {
    if (moveLockRef.current) return;
    if (
      fromIdx < 0 ||
      toIdx < 0 ||
      fromIdx >= items.length ||
      toIdx >= items.length ||
      fromIdx === toIdx
    ) {
      return;
    }
    captureItemRects();
    moveLockRef.current = true;
    const next = [...items];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    setMovingItemId(String(moved?.id || `bm-${toIdx}`));
    patch({
      listItems: normalizeButtonMultiLabels(next),
      listItemCount: next.length,
    });
  };

  const cloneItem = (idx) => {
    if (items.length >= 12 || Boolean(movingItemId)) return;
    const next = [...items];
    const cloned = lodash.cloneDeep(items[idx] || {});
    delete cloned.id;
    next.splice(idx + 1, 0, cloned);
    patch({
      listItems: normalizeButtonMultiLabels(next),
      listItemCount: next.length,
    });
  };

  const deleteItem = (idx) => {
    if (items.length <= 1 || Boolean(movingItemId)) return;
    const next = items.filter((_, i) => i !== idx);
    patch({
      listItems: normalizeButtonMultiLabels(next),
      listItemCount: next.length,
    });
  };

  const chipSelected = (active, chip) => {
    if (typeof active === "string" && typeof chip === "string") {
      return active.toLowerCase() === chip.toLowerCase();
    }
    if (
      active &&
      typeof active === "object" &&
      chip &&
      typeof chip === "object"
    ) {
      return active.type === chip.type && active.index === chip.index;
    }
    return false;
  };

  return (
    <aside className="dash-panel flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden border-r border-slate-200 dark:border-white/10">
      <div className="shrink-0 px-6 pt-5 pb-3 flex items-center justify-between dash-panel-header bg-gray-100 dark:bg-slate-800/60">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 font-bold tracking-wide">
            Button Group
          </span>
          <button
            type="button"
            className="inline-flex shrink-0 items-center rounded-md border border-[#333333] bg-[#333333] px-1.5 py-0.5 text-[11px] font-mono font-bold leading-none text-white tabular-nums dark:border-[#333333] dark:bg-[#333333] dark:text-white"
            title={String(draft?.id ?? "")}
            aria-label={`คัดลอก ID ${String(draft?.id ?? "")}`}
            onClick={() => {
              const id = String(draft?.id ?? "");
              if (!id || typeof navigator?.clipboard?.writeText !== "function") return;
              navigator.clipboard.writeText(id).catch(() => {});
            }}
          >
            {(() => {
              const id = String(draft?.id ?? "");
              const maxChars = 15;
              return id.length > maxChars ? `${id.slice(0, maxChars)}…` : id;
            })()}
          </button>
        </div>
        <button
          type="button"
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-white/70"
          onClick={() => close?.(null, null, null)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain px-4 pb-14 w-full">
        <ul className="mt-4 pl-1 space-y-5">
          <li>
            <div className="grid w-full grid-cols-2 gap-x-3 gap-y-4">
              <div className="min-w-0">
                <div className="mb-[9px] flex items-center gap-2">
                  <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                    จำนวนรายการ
                  </span>
                  <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                </div>
                <div className="dash-input mt-1 flex h-[34px] w-full overflow-hidden rounded-md border border-slate-200 dark:border-white/10">
                  <button
                    type="button"
                    className={stepperBtnClass}
                    onClick={() => handleCountChange(items.length - 1)}
                    aria-label="ลดจำนวนรายการ"
                  >
                    <Minus className="h-3.5 w-3.5 shrink-0" strokeWidth={2.2} />
                  </button>
                  <div className={stepperMidClass}>{items.length}</div>
                  <button
                    type="button"
                    className={stepperBtnClass}
                    onClick={() => handleCountChange(items.length + 1)}
                    aria-label="เพิ่มจำนวนรายการ"
                  >
                    <Plus className="h-3.5 w-3.5 shrink-0" strokeWidth={2.2} />
                  </button>
                </div>
              </div>
              <div className="min-w-0">
                <div className="mb-[9px] flex items-center gap-2">
                  <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                    ระยะห่างไอเทม
                  </span>
                  <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                </div>
                <div className="dash-input mt-1 flex h-[34px] w-full overflow-hidden rounded-md border border-slate-200 dark:border-white/10">
                  <button
                    type="button"
                    className={stepperBtnClass}
                    onClick={() =>
                      patch({
                        listItemRowGap: Math.max(
                          0,
                          Math.round(
                            clamp(
                              draft.listItemRowGap,
                              0,
                              40,
                              BUTTON_GROUP_DEFAULT_ITEM_GAP
                            )
                          ) - 1
                        ),
                      })
                    }
                    aria-label="ลดระยะห่างไอเทม"
                  >
                    <Minus className="h-3.5 w-3.5 shrink-0" strokeWidth={2.2} />
                  </button>
                  <div className={stepperMidClass}>
                    {Math.round(
                      clamp(
                        draft.listItemRowGap,
                        0,
                        40,
                        BUTTON_GROUP_DEFAULT_ITEM_GAP
                      )
                    )}
                  </div>
                  <button
                    type="button"
                    className={stepperBtnClass}
                    onClick={() =>
                      patch({
                        listItemRowGap: Math.min(
                          40,
                          Math.round(
                            clamp(
                              draft.listItemRowGap,
                              0,
                              40,
                              BUTTON_GROUP_DEFAULT_ITEM_GAP
                            )
                          ) + 1
                        ),
                      })
                    }
                    aria-label="เพิ่มระยะห่างไอเทม"
                  >
                    <Plus className="h-3.5 w-3.5 shrink-0" strokeWidth={2.2} />
                  </button>
                </div>
              </div>
            </div>
          </li>

          <li>
            <MainLabel label="ตำแหน่ง" mb="11px" />
            <ButtonGroup fullWidth variant="outlined" disableElevation color="inherit" sx={groupRootSx}>
              {ALIGN_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  color="inherit"
                  sx={buttonSx((draft.buttonLayoutAlign || "start") === opt.value, accent)}
                  onClick={() => patch({ buttonLayoutAlign: opt.value })}
                >
                  {opt.label}
                </Button>
              ))}
            </ButtonGroup>
          </li>

          <li>
            <MainLabel label="เส้นคั่นระหว่างปุ่ม" checked={Boolean(draft.listDividerEnabled)} handleSwitch={(e) => patch({ listDividerEnabled: e.target.checked })} color={textColor} mb={0} />
            {Boolean(draft.listDividerEnabled) ? (
              <Stack spacing={1.5} sx={{ mt: "10px" }}>
                <ButtonGroup fullWidth variant="outlined" disableElevation color="inherit" sx={groupRootSx}>
                  {DIVIDER_STYLE_OPTIONS.map((opt) => (
                    <Button
                      key={opt.value}
                      color="inherit"
                      sx={buttonSx((draft.listDividerStyle || "solid") === opt.value, accent)}
                      onClick={() => patch({ listDividerStyle: opt.value })}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </ButtonGroup>

                <Box>
                  <Typography
                    component="div"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--dash-panel-heading, #0f172a)",
                      mb: 0,
                      ".dark &": { color: "var(--dash-panel-heading, #f8fafc)" },
                    }}
                  >
                    สีเส้นคั่น
                    <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                  </Typography>
                  <div className="px-[2px] pb-[2px] pt-[5px]">
                    <Range
                      min={0}
                      max={255}
                      step={1}
                      value={clamp(draft.listDividerOpacity, 0, 255, 255)}
                      pos={(clamp(draft.listDividerOpacity, 0, 255, 255) / 255) * 100}
                      color={accent}
                      handleChange={(e) => patch({ listDividerOpacity: Number(e.target.value) || 0 })}
                      className={THEME_RANGE_INPUT_CLASS}
                    />
                  </div>
                  <div className="mt-[5px] dash-card rounded-md bg-white px-1 pb-1.5 pt-0 dark:bg-zinc-800">
                    <div className="grid grid-cols-10 place-items-center gap-x-0 gap-y-[6px] px-[5px] pb-0 pt-2">
                      {allColors.map((color, i) => {
                        const bgColor =
                          typeof color === "string"
                            ? color
                            : theme?.[color.type]?.[color.index];
                        if (bgColor == null) return null;
                        const selected =
                          chipSelected(draft.listDividerColor, color) || draft.listDividerColor === color;
                        let margin = "";
                        if (i % 8 !== 0 && (i + 1) % 8 !== 0) margin += "mx-[65.75px] ";
                        return (
                          <div className={margin} key={`divider-${i}`}>
                            <button
                              type="button"
                              className="flex size-[25px] items-center justify-center rounded-full border border-slate-200 dark:border-white/15"
                              style={{ backgroundColor: bgColor }}
                              onClick={() => patch({ listDividerColor: color })}
                              aria-label={`เลือกสี ${bgColor}`}
                            >
                              {selected ? (
                                <Check className={swatchSelectedCheckClassName(bgColor)} strokeWidth={4} />
                              ) : null}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Box>
              </Stack>
            ) : null}
          </li>

          <li>
            <div className="grid grid-cols-2 gap-x-3 gap-y-4">
              <div className="min-w-0">
                <MainLabel label="ระยะบน" value={Math.round(clamp(draft.listMarginTop, 0, 80, 8))} noLine mb={0.35} />
                <div className="px-[2px] pb-[2px] pt-[2px]">
                  <Range
                    min={0}
                    max={80}
                    step={1}
                    value={clamp(draft.listMarginTop, 0, 80, 8)}
                    pos={(clamp(draft.listMarginTop, 0, 80, 8) / 80) * 100}
                    color={accent}
                    handleChange={(e) => patch({ listMarginTop: Number(e.target.value) || 0 })}
                    className={THEME_RANGE_INPUT_CLASS}
                  />
                </div>
              </div>
              <div className="min-w-0">
                <MainLabel label="ระยะล่าง" value={Math.round(clamp(draft.listMarginBottom, 0, 80, 8))} noLine mb={0.35} />
                <div className="px-[2px] pb-[2px] pt-[2px]">
                  <Range
                    min={0}
                    max={80}
                    step={1}
                    value={clamp(draft.listMarginBottom, 0, 80, 8)}
                    pos={(clamp(draft.listMarginBottom, 0, 80, 8) / 80) * 100}
                    color={accent}
                    handleChange={(e) => patch({ listMarginBottom: Number(e.target.value) || 0 })}
                    className={THEME_RANGE_INPUT_CLASS}
                  />
                </div>
              </div>
            </div>
          </li>

          <li>
            <Typography
              component="div"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                fontSize: 13,
                fontWeight: 700,
                color: "var(--dash-panel-heading, #0f172a)",
                mb: "13px",
                ".dark &": { color: "var(--dash-panel-heading, #f8fafc)" },
              }}
            >
              รายการทั้งหมด
              <div className="dash-heading-rule min-w-0 flex-1 border-b" />
            </Typography>
            <div className="flex flex-col gap-2">
              {items.map((item, idx) => {
                const itemId = String(item?.id || `bm-${idx}`);
                const isMoving = movingItemId === itemId;
                return (
                  <Box
                    key={itemId}
                    ref={(el) => setItemNodeRef(itemId, el)}
                    className={`flex w-full min-w-0 items-center gap-2 rounded-md border px-2.5 py-1.5 will-change-transform ${
                      isMoving
                        ? "border-slate-300 bg-slate-50 shadow-sm dark:border-white/25 dark:bg-white/5"
                        : "border-slate-200 dark:border-white/10"
                    }`}
                  >
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#333333] text-[10px] font-semibold text-white"
                    >
                      {idx + 1}
                    </span>
                    <Typography
                      sx={{
                        fontSize: 12,
                        lineHeight: 1.4,
                        opacity: 0.8,
                        minWidth: 0,
                        flex: "1 1 auto",
                      }}
                      className="truncate"
                      component="span"
                    >
                      {typeof item?.listText === "string" && item.listText.trim()
                        ? item.listText
                        : `Button ${idx + 1}`}
                    </Typography>
                    <div className="flex shrink-0 items-center gap-0.5">
                      <button
                        type="button"
                        disabled={idx === 0 || Boolean(movingItemId)}
                        title="เลื่อนขึ้น"
                        aria-label="เลื่อนขึ้น"
                        className={itemRowReorderBtnClass}
                        onClick={() => moveItem(idx, idx - 1)}
                      >
                        <ArrowUp className="h-3 w-3" strokeWidth={2.25} />
                      </button>
                      <button
                        type="button"
                        disabled={idx >= items.length - 1 || Boolean(movingItemId)}
                        title="เลื่อนลง"
                        aria-label="เลื่อนลง"
                        className={itemRowReorderBtnClass}
                        onClick={() => moveItem(idx, idx + 1)}
                      >
                        <ArrowDown className="h-3 w-3" strokeWidth={2.25} />
                      </button>
                      <button
                        type="button"
                        disabled={items.length >= 12 || Boolean(movingItemId)}
                        title={items.length >= 12 ? "ถึงจำนวนสูงสุดแล้ว (12)" : "คัดลอกรายการนี้"}
                        aria-label="คัดลอกรายการ"
                        className="rounded p-0.5 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600 disabled:pointer-events-none disabled:opacity-35 dark:hover:bg-blue-950/40 dark:hover:text-blue-400"
                        onClick={() => cloneItem(idx)}
                      >
                        <Copy className="h-3 w-3" strokeWidth={2} />
                      </button>
                      <button
                        type="button"
                        disabled={items.length <= 1 || Boolean(movingItemId)}
                        title={items.length <= 1 ? "ต้องมีอย่างน้อย 1 รายการ" : "ลบรายการนี้"}
                        aria-label="ลบรายการ"
                        className="rounded p-0.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:pointer-events-none disabled:opacity-35 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                        onClick={() => deleteItem(idx)}
                      >
                        <Trash2 className="h-3 w-3" strokeWidth={2} />
                      </button>
                    </div>
                  </Box>
                );
              })}
            </div>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default ButtonGroupElementOffcanvas;
