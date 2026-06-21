import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Button, ButtonGroup, Stack, Switch, Typography } from "@mui/material";
import { ArrowDown, ArrowUp, Check, Copy, Minus, Plus, Trash2 } from "lucide-react";
import lodash from "lodash";
import Range from "../HTML/Range";
import MainLabel from "../HTML/MainLabel";
import { swatchSelectedCheckClassName } from "../Layouts/Elements/swatchCheckClass";
import { THEME_PANEL_BASIC_COLOR_SWATCHES } from "../themePanelBasicColors";
import { mergeListElement } from "../Layouts/Elements/listElementConfig";
import { BUTTON_STYLE_DEFAULTS } from "../Layouts/Elements/buttonElementConfig";

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
    borderColor: "#e2e8f0 !important",
  },
  ".dark & .MuiButtonGroup-grouped.MuiButton-outlined": {
    borderColor: "rgba(255,255,255,0.1) !important",
  },
};

const buttonSx = (selected, accent) => {
  const a = accent || "#0d9488";
  return {
    flex: 1,
    fontSize: 11,
    minHeight: 34,
    py: 0,
    px: 0.5,
    textTransform: "none",
    lineHeight: 1.15,
    whiteSpace: "nowrap",
    overflow: "hidden",
    color: selected ? "#ffffff" : "#334155",
    borderColor: selected ? `${a} !important` : undefined,
    backgroundColor: selected ? a : "#ffffff",
    "&:hover": {
      backgroundColor: selected ? a : "#f8fafc",
      borderColor: selected ? `${a} !important` : undefined,
    },
    ".dark &": {
      color: selected ? "#ffffff" : "rgba(255,255,255,0.88)",
      backgroundColor: selected ? a : "rgba(15,23,42,0.6)",
      "&:hover": {
        backgroundColor: selected ? a : "rgba(255,255,255,0.08)",
      },
    },
  };
};

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
  return {
    ...base,
    type: "list",
    listIconsElement: true,
    buttonMultiElement: true,
    listItemCount: desiredCount,
    listItems: itemsWithId,
  };
}

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

  useEffect(() => {
    setDraft(mergeButtonGroupElement(element));
  }, [element]);

  const patch = useCallback(
    (partial) => {
      const next = mergeButtonGroupElement({ ...draft, ...partial });
      setDraft(next);
      onUpdate?.(next);
    },
    [draft, onUpdate]
  );

  const allColors = useMemo(() => {
    if (!theme?.mainColor?.length) return [];
    const mc = theme.mainColor.map((_, i) => ({ type: "mainColor", index: i }));
    const tc = (theme.textColor || []).map((_, i) => ({ type: "textColor", index: i }));
    const oc = (theme.otherColor || []).map((_, i) => ({ type: "otherColor", index: i }));
    return [...mc, ...tc, ...oc, ...THEME_PANEL_BASIC_COLOR_SWATCHES];
  }, [theme]);

  const items = draft.listItems || [];

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
    if (toIdx < 0 || toIdx >= items.length) return;
    const next = [...items];
    [next[fromIdx], next[toIdx]] = [next[toIdx], next[fromIdx]];
    patch({
      listItems: normalizeButtonMultiLabels(next),
      listItemCount: next.length,
    });
  };

  const cloneItem = (idx) => {
    if (items.length >= 12) return;
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
    if (items.length <= 1) return;
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
    <aside className="flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden bg-white dark:bg-gray-900/80 border-r border-slate-200 dark:border-white/10">
      <div className="shrink-0 px-6 pt-5 pb-3 flex items-center justify-between bg-gray-100 dark:bg-slate-800/60">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 font-bold tracking-wide text-slate-800 dark:text-white/90">
            Button Group
          </span>
          <span
            className="inline-flex min-w-0 max-w-full items-center rounded-md border border-[#333333] bg-[#333333] px-2 py-0.5 text-[11px] font-mono font-bold leading-none text-white tabular-nums"
            title={String(draft?.id ?? "")}
          >
            <span className="truncate">{draft?.id ?? "-"}</span>
          </span>
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
                <div className="mb-1 flex items-center gap-2">
                  <span className="shrink-0 text-[13px] font-semibold text-slate-700 dark:text-white/80">
                    จำนวนรายการ
                  </span>
                  <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
                </div>
                <div className="mt-1 inline-flex w-full overflow-hidden rounded-md border border-slate-200 dark:border-white/15">
                  <button
                    type="button"
                    className="grid h-9 w-10 place-items-center bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800/70 dark:text-white/80 dark:hover:bg-slate-700/70"
                    onClick={() => handleCountChange(items.length - 1)}
                    aria-label="ลดจำนวนรายการ"
                  >
                    <Minus className="h-3 w-3" strokeWidth={2.5} />
                  </button>
                  <div className="grid h-9 min-w-[40px] flex-1 place-items-center border-x border-slate-200 bg-white px-2 text-[12px] font-semibold tabular-nums text-slate-800 dark:border-white/15 dark:bg-slate-900/50 dark:text-white/85">
                    {items.length}
                  </div>
                  <button
                    type="button"
                    className="grid h-9 w-10 place-items-center bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800/70 dark:text-white/80 dark:hover:bg-slate-700/70"
                    onClick={() => handleCountChange(items.length + 1)}
                    aria-label="เพิ่มจำนวนรายการ"
                  >
                    <Plus className="h-3 w-3" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-2">
                  <span className="shrink-0 text-[13px] font-semibold text-slate-700 dark:text-white/80">
                    ระยะห่างไอเทม
                  </span>
                  <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
                </div>
                <div className="mt-1 inline-flex w-full overflow-hidden rounded-md border border-slate-200 dark:border-white/15">
                  <button
                    type="button"
                    className="grid h-9 w-10 place-items-center bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800/70 dark:text-white/80 dark:hover:bg-slate-700/70"
                    onClick={() =>
                      patch({
                        listItemRowGap: Math.max(
                          0,
                          Math.round(clamp(draft.listItemRowGap, 0, 40, 8)) - 1
                        ),
                      })
                    }
                    aria-label="ลดระยะห่างไอเทม"
                  >
                    <Minus className="h-3 w-3" strokeWidth={2.5} />
                  </button>
                  <div className="grid h-9 min-w-[40px] flex-1 place-items-center border-x border-slate-200 bg-white px-2 text-[12px] font-semibold tabular-nums text-slate-800 dark:border-white/15 dark:bg-slate-900/50 dark:text-white/85">
                    {Math.round(clamp(draft.listItemRowGap, 0, 40, 8))}
                  </div>
                  <button
                    type="button"
                    className="grid h-9 w-10 place-items-center bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800/70 dark:text-white/80 dark:hover:bg-slate-700/70"
                    onClick={() =>
                      patch({
                        listItemRowGap: Math.min(
                          40,
                          Math.round(clamp(draft.listItemRowGap, 0, 40, 8)) + 1
                        ),
                      })
                    }
                    aria-label="เพิ่มระยะห่างไอเทม"
                  >
                    <Plus className="h-3 w-3" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>
          </li>

          <li>
            <MainLabel label="ตำแหน่ง" />
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
                      color: "rgb(51 65 85)",
                      mb: 0,
                      ".dark &": { color: "rgba(255,255,255,0.82)" },
                    }}
                  >
                    สีเส้นคั่น
                    <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
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
                  <div className="mt-[5px] rounded-md bg-white px-1 pb-1.5 pt-0 dark:bg-zinc-800">
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
                color: "rgb(51 65 85)",
                mb: 1,
                ".dark &": { color: "rgba(255,255,255,0.82)" },
              }}
            >
              รายการทั้งหมด
              <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
            </Typography>
            <Stack spacing={1}>
              {items.map((item, idx) => (
                <Box
                  key={`${idx}-${item?.listText ?? ""}`}
                  className="flex w-full min-w-0 items-center gap-2 rounded-md border border-slate-200 px-2.5 py-1.5 dark:border-white/10"
                >
                  <span
                    className="shrink-0 flex h-5 w-5 items-center justify-center rounded text-[10px] font-semibold text-white"
                    style={{ backgroundColor: "#333333" }}
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
                      disabled={idx === 0}
                      title="เลื่อนขึ้น"
                      aria-label="เลื่อนขึ้น"
                      className={itemRowReorderBtnClass}
                      onClick={() => moveItem(idx, idx - 1)}
                    >
                      <ArrowUp className="h-3 w-3" strokeWidth={2.25} />
                    </button>
                    <button
                      type="button"
                      disabled={idx >= items.length - 1}
                      title="เลื่อนลง"
                      aria-label="เลื่อนลง"
                      className={itemRowReorderBtnClass}
                      onClick={() => moveItem(idx, idx + 1)}
                    >
                      <ArrowDown className="h-3 w-3" strokeWidth={2.25} />
                    </button>
                    <button
                      type="button"
                      disabled={items.length >= 12}
                      title={items.length >= 12 ? "ถึงจำนวนสูงสุดแล้ว (12)" : "คัดลอกรายการนี้"}
                      aria-label="คัดลอกรายการ"
                      className="rounded p-0.5 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600 disabled:pointer-events-none disabled:opacity-35 dark:hover:bg-blue-950/40 dark:hover:text-blue-400"
                      onClick={() => cloneItem(idx)}
                    >
                      <Copy className="h-3 w-3" strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      disabled={items.length <= 1}
                      title={items.length <= 1 ? "ต้องมีอย่างน้อย 1 รายการ" : "ลบรายการนี้"}
                      aria-label="ลบรายการ"
                      className="rounded p-0.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:pointer-events-none disabled:opacity-35 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                      onClick={() => deleteItem(idx)}
                    >
                      <Trash2 className="h-3 w-3" strokeWidth={2} />
                    </button>
                  </div>
                </Box>
              ))}
            </Stack>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default ButtonGroupElementOffcanvas;
