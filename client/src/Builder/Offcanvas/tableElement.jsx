import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Switch } from "@mui/material";
import { AlignCenter, AlignLeft, AlignRight, ArrowDown, ArrowUp, Check, Minus, Plus, Trash2 } from "lucide-react";
import lodash from "lodash";
import Range from "../HTML/Range";
import MainLabel from "../HTML/MainLabel";
import SelectLine from "../HTML/SelectLine";
import { mergeTableElement } from "../Layouts/Elements/tableElementConfig";
import { swatchSelectedCheckClassName } from "../Layouts/Elements/swatchCheckClass";
import { THEME_PANEL_BASIC_COLOR_SWATCHES } from "../themePanelBasicColors";

/* ─── Color modes ─── */
const TABLE_COLOR_MODES = [
  { value: "headerBg",   label: "สีพื้นหลังหัวตาราง", field: "tableHeaderBg",   opacityField: "tableHeaderBgOpacity"   },
  { value: "rowBg",      label: "สีพื้นหลังแถว",      field: "tableRowBg",      opacityField: "tableRowBgOpacity"      },
  { value: "zebraBg",    label: "สีสลับสีแถว",         field: "tableZebraBg",    opacityField: "tableZebraBgOpacity"   },
  { value: "border",     label: "สีกรอบตาราง",         field: "tableBorderColor",opacityField: "tableBorderColorOpacity"},
  { value: "headerText", label: "สีข้อความหัวตาราง",  field: "tableHeaderText", opacityField: "tableHeaderTextOpacity" },
  { value: "bodyText",   label: "สีข้อความในตาราง",   field: "tableBodyText",   opacityField: "tableBodyTextOpacity"   },
];
const STEPPER_BTN = "inline-flex h-[34px] w-9 shrink-0 items-center justify-center border-0 bg-white text-slate-700 transition hover:bg-slate-50 dark:bg-slate-900/80 dark:text-white/90 dark:hover:bg-white/10";
const STEPPER_MID = "flex h-[34px] min-w-0 flex-1 items-center justify-center border-x border-slate-200 bg-white px-2 text-center text-[13px] tabular-nums text-slate-800 dark:border-white/10 dark:bg-slate-900/80 dark:text-white/90";

/* ─── Ant Switch ─── */
const TblPanelSwitch = styled(Switch, {
  shouldForwardProp: (p) => p !== "accentColor",
})(({ theme, accentColor = "#0d9488" }) => ({
  width: 28, height: 16, padding: 0, display: "flex",
  "&:active": {
    "& .MuiSwitch-thumb": { width: 15 },
    "& .MuiSwitch-switchBase.Mui-checked": { transform: "translateX(9px)" },
  },
  "& .MuiSwitch-switchBase": {
    padding: 2,
    "&.Mui-checked": {
      transform: "translateX(12px)",
      color: "#fff",
      "& + .MuiSwitch-track": { opacity: 1, backgroundColor: accentColor },
    },
  },
  "& .MuiSwitch-thumb": {
    boxShadow: "0 2px 4px 0 rgb(0 35 11 / 20%)",
    width: 12, height: 12, borderRadius: 6,
    transition: theme.transitions.create(["width"], { duration: 200 }),
  },
  "& .MuiSwitch-track": {
    borderRadius: 8, opacity: 1,
    backgroundColor: "rgba(0,0,0,.25)",
    boxSizing: "border-box",
    ".dark &": { backgroundColor: "rgba(255,255,255,.25)" },
  },
}));

/* ─── Range row ─── */
const RangeRow = ({ label, value, min, max, step = 1, onChange, accentColor, mt = 2 }) => (
  <Box sx={{ width: "100%", px: 0.25, mt }} aria-label={label}>
    {label != null && (
      <div className="mb-1">
        <Typography component="div" sx={{
          display: "flex", alignItems: "center", gap: 1, flex: 1,
          fontSize: 13, fontWeight: 600, color: "var(--dash-panel-heading, #0f172a)", mb: 0.35,
          fontVariantNumeric: "tabular-nums",
          ".dark &": { color: "var(--dash-panel-heading, #f8fafc)" },
        }}>
          {label}{" "}
          <span className="text-slate-400 dark:text-slate-400">{Math.round(value)}</span>
          <div className="dash-heading-rule min-w-0 flex-1 border-b" />
        </Typography>
      </div>
    )}
    <div className="w-full px-[2px] pt-[2px] pb-[2px]">
      <Range
        min={min} max={max} step={step} value={value}
        handleChange={(e) => onChange(Number(e.target.value))}
        pos={((value - min) / (max - min)) * 100}
        color={accentColor || "#0d9488"}
      />
    </div>
  </Box>
);

/* ─── Color row ─── */
const ColorRow = ({ label, value, onChange }) => (
  <label className="flex items-center gap-2.5 cursor-pointer">
    <span
      className="h-[26px] w-[26px] shrink-0 rounded-md border border-slate-200 dark:border-white/15 overflow-hidden cursor-pointer"
      style={{ backgroundColor: value }}
    >
      <input
        type="color"
        value={value || "#ffffff"}
        onChange={(e) => onChange(e.target.value)}
        className="opacity-0 w-full h-full cursor-pointer"
      />
    </span>
    <span className="min-w-0 flex-1 text-[12px] text-slate-700 dark:text-slate-300">{label}</span>
    <input
      type="text"
      value={value || ""}
      onChange={(e) => {
        const v = e.target.value;
        if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v);
      }}
      className="w-[72px] dash-card shrink-0 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-mono text-slate-700 outline-none dark:border-white/10 dark:bg-slate-900/50 dark:text-white/80"
      maxLength={7}
      placeholder="#ffffff"
    />
  </label>
);

/* ─── Align buttons (compact, ใช้ใน column row) ─── */
const ALIGN_OPTS = [
  { value: "left",   Icon: AlignLeft,   label: "ซ้าย" },
  { value: "center", Icon: AlignCenter, label: "กลาง" },
  { value: "right",  Icon: AlignRight,  label: "ขวา" },
];

const AlignGroup = ({ value, onChange, accent }) => (
  <div
    className="flex h-[28px] overflow-hidden rounded border"
    style={{ borderColor: "var(--dash-panel-btn-group-border, #e2e8f0)" }}
  >
    {ALIGN_OPTS.map(({ value: v, Icon, label }, idx) => {
      const active = value === v;
      return (
        <button
          key={v}
          type="button"
          aria-label={label}
          onClick={() => onChange(v)}
          className="flex w-[32px] shrink-0 items-center justify-center transition"
          style={{
            ...(active
              ? {
                  backgroundColor: "var(--dash-panel-btn-group-active, #333333)",
                  color: "var(--dash-panel-btn-group-active-text, #ffffff)",
                }
              : {
                  backgroundColor: "var(--dash-panel-btn-group-inactive, #ffffff)",
                  color: "var(--dash-panel-btn-group-inactive-text, #1e293b)",
                }),
            ...(idx < ALIGN_OPTS.length - 1
              ? { borderRight: "1px solid var(--dash-panel-btn-group-border, #e2e8f0)" }
              : null),
          }}
        >
          <Icon size={11} strokeWidth={3.5} />
        </button>
      );
    })}
  </div>
);

/* ─── Column row reorder/delete action buttons (like listElement) ─── */
const COL_ACTION_BTN = "rounded p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-30 dark:hover:bg-white/10 dark:hover:text-white/80";

/* ─── Width input with local draft state (commit on blur/Enter) ─── */
function WidthInput({ value, onChange }) {
  const [draft, setDraft] = useState(String(value ?? 180));
  useEffect(() => { setDraft(String(value ?? 180)); }, [value]);

  const commit = (raw) => {
    const n = parseInt(raw, 10);
    const clamped = Number.isFinite(n) ? Math.max(1, n) : (value ?? 180);
    onChange(clamped);
    setDraft(String(clamped));
  };

  return (
    <div className="flex h-[28px] w-[56px] shrink-0 items-center overflow-hidden rounded border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900/60">
      <input
        type="text"
        inputMode="numeric"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => commit(draft)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commit(draft); e.currentTarget.blur(); } }}
        className="min-w-0 flex-1 border-0 bg-transparent py-0 pl-2 pr-0.5 text-[12px] tabular-nums text-slate-700 outline-none dark:text-white/85"
      />
      <span className="shrink-0 pr-1.5 text-[10px] text-slate-400 dark:text-slate-500">px</span>
    </div>
  );
}

/* ─── Main component ─── */
const TableElementOffcanvas = ({ element, onUpdate, close, textColor, theme }) => {
  const accent = textColor || "#0d9488";
  const [data, setData] = useState(() => mergeTableElement(element));
  const [colorModeIdx, setColorModeIdx] = useState(0);
  // Keeps a growing cache of row data so that decreasing then increasing the
  // row-count slider restores previously-entered rows instead of blanks.
  // Shape: { id: string|null, rows: string[][] }
  // - When a different element is selected (id changes) → reset rows.
  // - When the same element is updated externally (inline cell edit, etc.)
  //   → merge its current rows into the buffer so the buffer only grows.
  const rowsBufferRef = useRef({ id: null, rows: [] });

  useEffect(() => {
    const next = mergeTableElement(element);
    setData(next);
    const newId = element?.id ?? null;
    if (rowsBufferRef.current.id !== newId) {
      rowsBufferRef.current = { id: newId, rows: [] };
    } else {
      const cur = next.tableRows ?? [];
      const prev = rowsBufferRef.current.rows;
      rowsBufferRef.current = {
        id: newId,
        rows: Array.from(
          { length: Math.max(prev.length, cur.length) },
          (_, i) => cur[i] ?? prev[i]
        ),
      };
    }
  }, [element]);

  const merged = useMemo(() => mergeTableElement(data), [data]);

  const allColors = useMemo(() => {
    if (!theme?.mainColor?.length) return [];
    const mc = theme.mainColor.map((_, i) => ({ type: "mainColor", index: i }));
    const tc = (theme.textColor || []).map((_, i) => ({ type: "textColor", index: i }));
    const oc = (theme.otherColor || []).map((_, i) => ({ type: "otherColor", index: i }));
    return [...mc, ...tc, ...oc, ...THEME_PANEL_BASIC_COLOR_SWATCHES];
  }, [theme]);

  const patch = useCallback((partial) => {
    const next = mergeTableElement({ ...data, ...partial });
    setData(next);
    onUpdate?.(lodash.cloneDeep(next));
  }, [data, onUpdate]);

  const patchColumn = (index, partial) => {
    const cols = merged.tableColumns.map((c, i) => i === index ? { ...c, ...partial } : c);
    patch({ tableColumns: cols });
  };

  const addColumn = () => {
    rowsBufferRef.current = { id: rowsBufferRef.current.id, rows: [] };
    const n = merged.tableColumns.length + 1;
    const cols = [...merged.tableColumns, { id: `col-${Date.now()}`, label: `Column - ${n}`, align: "left", width: 180 }];
    const rows = merged.tableRows.map((r) => [...r, `Data - ${n}`]);
    patch({ tableColumns: cols, tableRows: rows });
  };

  const removeColumn = (index) => {
    if (merged.tableColumns.length <= 1) return;
    rowsBufferRef.current = { id: rowsBufferRef.current.id, rows: [] };
    const cols = merged.tableColumns.filter((_, i) => i !== index);
    const rows = merged.tableRows.map((r) => r.filter((_, i) => i !== index));
    patch({ tableColumns: cols, tableRows: rows });
  };

  const moveColumn = (from, to) => {
    rowsBufferRef.current = { id: rowsBufferRef.current.id, rows: [] };
    const cols = [...merged.tableColumns];
    const [item] = cols.splice(from, 1);
    cols.splice(to, 0, item);
    const rows = merged.tableRows.map((r) => {
      const nr = [...r];
      const [cell] = nr.splice(from, 1);
      nr.splice(to, 0, cell);
      return nr;
    });
    patch({ tableColumns: cols, tableRows: rows });
  };

  const makeDefaultRow = (colLen, rowIndex) =>
    Array.from({ length: colLen }, (_, ci) => `Data - ${rowIndex * colLen + ci + 1}`);

  const addRow = () => {
    const next = [...merged.tableRows, makeDefaultRow(merged.tableColumns.length, merged.tableRows.length)];
    patch({ tableRows: next });
  };

  const removeRow = () => {
    if (merged.tableRows.length <= 1) return;
    patch({ tableRows: merged.tableRows.slice(0, -1) });
  };

  return (
    <aside className="dash-panel flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden border-r border-slate-200 dark:border-white/10">

      {/* Header */}
      <div className="shrink-0 px-6 pt-5 pb-3 flex items-center justify-between dash-panel-header bg-gray-100 dark:bg-slate-800/60">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 font-bold tracking-wide">Data Table</span>
          <span
            className="inline-flex min-w-0 max-w-full items-center rounded-md border border-[#333333] bg-[#333333] px-2 py-0.5 text-[11px] font-mono font-bold leading-none text-white tabular-nums"
            title={String(merged?.id ?? "")}
          >
            <span className="truncate">{merged?.id ?? "-"}</span>
          </span>
        </div>
        <button
          type="button"
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-white/70"
          onClick={() => close?.(null, null, null)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain px-4 pb-14 w-full">
        <ul className="mt-4 pl-1 space-y-5">

          {/* ── คอลัมน์ ── */}
          <li>
            <Box sx={{ width: "100%", px: 0.25, pt: 0.5 }}>
              <div className="mb-2 flex items-center gap-2">
                <span className="dash-panel-label shrink-0 text-[13px] font-semibold">คอลัมน์</span>
                <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                <button
                  type="button"
                  onClick={addColumn}
                  className="inline-flex min-h-[22px] shrink-0 items-center justify-center rounded px-1.5 py-0.5 text-[11px] font-medium leading-snug text-white transition hover:opacity-90 disabled:pointer-events-none disabled:opacity-35"
                  style={{ backgroundColor: "#333333" }}
                >
                  เพิ่มคอลัมน์
                </button>
              </div>

              {/* Table-style column configurator */}
              <div className="overflow-hidden rounded-lg">

                {/* Column rows */}
                {merged.tableColumns.map((col, idx) => (
                  <div
                    key={col.id || `col-${idx}`}
                    className="flex items-center gap-2 border-b border-slate-100 px-0 py-2 last:border-b-0 dark:border-white/[0.06] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Label input */}
                    <input
                      type="text"
                      value={col.label}
                      onChange={(e) => patchColumn(idx, { label: e.target.value })}
                      placeholder={`Column - ${idx + 1}`}
                      maxLength={80}
                      className="min-w-0 w-[130px] rounded-md border border-transparent bg-transparent px-1.5 py-1 text-[13px] text-slate-800 outline-none transition hover:border-slate-200 focus:border-slate-300 focus:bg-white dark:text-white/90 dark:hover:border-white/10 dark:focus:border-white/20 dark:focus:bg-white/[0.04] placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />

                    {/* Width input */}
                    <WidthInput
                      value={col.width}
                      onChange={(v) => patchColumn(idx, { width: v })}
                    />

                    {/* Align */}
                    <AlignGroup value={col.align} onChange={(v) => patchColumn(idx, { align: v })} accent={accent} />

                    {/* Actions: ↑ ↓ 🗑 */}
                    <div className="flex shrink-0 items-center gap-0.5">
                      <button
                        type="button"
                        aria-label="เลื่อนซ้าย"
                        disabled={idx === 0}
                        className={COL_ACTION_BTN}
                        onClick={() => moveColumn(idx, idx - 1)}
                      >
                        <ArrowUp className="h-3 w-3" strokeWidth={2.25} />
                      </button>
                      <button
                        type="button"
                        aria-label="เลื่อนขวา"
                        disabled={idx >= merged.tableColumns.length - 1}
                        className={COL_ACTION_BTN}
                        onClick={() => moveColumn(idx, idx + 1)}
                      >
                        <ArrowDown className="h-3 w-3" strokeWidth={2.25} />
                      </button>
                      <button
                        type="button"
                        aria-label="ลบคอลัมน์"
                        disabled={merged.tableColumns.length <= 1}
                        className="rounded p-0.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:pointer-events-none disabled:opacity-30 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                        onClick={() => removeColumn(idx)}
                      >
                        <Trash2 className="h-3 w-3" strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                ))}

              </div>
            </Box>
          </li>

          {/* ── แถวข้อมูล ── */}
          <li>
            <Box sx={{ width: "100%", px: 0.25, pt: 0.5 }}>
              <div className="grid grid-cols-2 gap-x-3">
                <RangeRow
                  label="จำนวนแถว"
                  value={merged.tableRows.length}
                  min={1}
                  max={50}
                  step={1}
                  onChange={(v) => {
                    const colLen = merged.tableColumns.length;
                    const current = merged.tableRows;
                    // Merge current rows into the buffer so we never lose data
                    // that was entered before the slider was decreased.
                    const prevRows = rowsBufferRef.current.rows;
                    const bufferedRows = Array.from(
                      { length: Math.max(prevRows.length, current.length) },
                      (_, i) => current[i] ?? prevRows[i]
                    );
                    rowsBufferRef.current = { ...rowsBufferRef.current, rows: bufferedRows };
                    const nextRows = Array.from({ length: v }, (_, i) =>
                      bufferedRows[i] ?? makeDefaultRow(colLen, i)
                    );
                    patch({ tableRows: nextRows });
                  }}
                  accentColor={accent}
                  mt={0}
                />
                <RangeRow
                  label="ความสูงแถว"
                  value={merged.tableCellPaddingY}
                  min={4}
                  max={24}
                  step={1}
                  onChange={(v) => patch({ tableCellPaddingY: v })}
                  accentColor={accent}
                  mt={0}
                />
              </div>
            </Box>
          </li>

          {/* ── สีตาราง ── */}
          <li style={{ marginTop: "10px" }}>
            <Box sx={{ width: "100%", px: 0.25, pt: 0.5 }}>
              <MainLabel
                label="สีตาราง"
                color={accent}
                mb={1}
                checked={Boolean(merged.tableOuterBorder)}
                handleSwitch={(e) => patch({ tableOuterBorder: e.target.checked })}
                typography="กรอบนอก"
              />
              {(() => {
                const mode = TABLE_COLOR_MODES[colorModeIdx];
                const activeColor = merged[mode.field];
                const opacityVal = merged[mode.opacityField] ?? 255;
                const normalizedActiveColor =
                  typeof activeColor === "string" ? activeColor.toLowerCase() : "";
                const selectedSwatchIndex = allColors.findIndex((color) => {
                  const bgColor =
                    typeof color === "string" ? color : theme?.[color.type]?.[color.index];
                  return (
                    typeof bgColor === "string" &&
                    bgColor.toLowerCase() === normalizedActiveColor
                  );
                });
                return (
                  <>
                    <div className="pt-2">
                      <SelectLine
                        prev={() => setColorModeIdx((i) => (i - 1 + TABLE_COLOR_MODES.length) % TABLE_COLOR_MODES.length)}
                        next={() => setColorModeIdx((i) => (i + 1) % TABLE_COLOR_MODES.length)}
                        value={mode.label}
                      />
                    </div>
                    <RangeRow
                      value={opacityVal}
                      min={0}
                      max={255}
                      step={1}
                      onChange={(v) => patch({ [mode.opacityField]: v })}
                      accentColor={accent}
                      mt={1}
                    />
                    <div className="mt-2 dash-card w-full rounded-md bg-white px-0 pb-[5px] pt-[2px] dark:bg-zinc-800">
                      <div className="grid grid-cols-10 place-items-center gap-x-0 gap-y-[6px]">
                        {allColors.map((color, i) => {
                          const bgColor = typeof color === "string" ? color : theme?.[color.type]?.[color.index];
                          if (bgColor == null) return null;
                          const selected = i === selectedSwatchIndex;
                          const margin = (i % 8 !== 0 && (i + 1) % 8 !== 0) ? "mx-[65.75px]" : "";
                          return (
                            <div className={margin} key={i}>
                              <button
                                type="button"
                                className="flex size-[25px] items-center justify-center rounded-full border"
                                style={{ backgroundColor: bgColor }}
                                onClick={() => patch({ [mode.field]: bgColor })}
                                aria-label={`เลือกสี ${bgColor}`}
                              >
                                {selected && (
                                  <Check className={swatchSelectedCheckClassName(bgColor)} strokeWidth={4} />
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                );
              })()}

            </Box>
          </li>


          {/* ── ขนาดและระยะห่าง ── */}
          <li>
            <Box sx={{ width: "100%", px: 0.25, pt: 0.5 }}>
              <MainLabel
                label="ขนาดอักษร"
                value={merged.tableFontSize}
                color={accent}
                mb={0.35}
                checked={Boolean(merged.tableHeaderBold)}
                handleSwitch={(e) => patch({ tableHeaderBold: e.target.checked })}
                typography="หัวตารางตัวหนา"
              />
              <RangeRow
                value={merged.tableFontSize}
                min={11} max={26} step={1}
                onChange={(v) => patch({ tableFontSize: v })}
                accentColor={accent}
                mt={0}
              />

              {/* รูปแบบกรอบ */}
              <Box sx={{ width: "100%", px: 0.25, mt: 2 }}>
                <MainLabel label="รูปแบบกรอบ" color={accent} mb={1.25} />
                <div
                  className="flex w-full overflow-hidden rounded-lg border"
                  style={{ borderColor: "var(--dash-panel-btn-group-border, #e2e8f0)" }}
                >
                  {[
                    { value: "none",   label: "ไม่มี" },
                    { value: "solid",  label: "ตรง"   },
                    { value: "dashed", label: "ประ"   },
                    { value: "dotted", label: "จุด"   },
                  ].map(({ value, label }, idx, arr) => {
                    const active = (merged.tableBorderStyle ?? "solid") === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => patch({ tableBorderStyle: value })}
                        className="flex flex-1 items-center justify-center py-1.5 text-[12px] font-medium transition"
                        style={{
                          ...(active
                            ? {
                                backgroundColor: "var(--dash-panel-btn-group-active, #333333)",
                                color: "var(--dash-panel-btn-group-active-text, #ffffff)",
                              }
                            : {
                                backgroundColor: "var(--dash-panel-btn-group-inactive, #ffffff)",
                                color: "var(--dash-panel-btn-group-inactive-text, #1e293b)",
                              }),
                          ...(idx !== arr.length - 1
                            ? { borderRight: "1px solid var(--dash-panel-btn-group-border, #e2e8f0)" }
                            : null),
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </Box>

            </Box>
          </li>

          {/* ── ระยะห่าง ── */}
          <li style={{ marginTop: "5px" }}>
            <div className="grid w-full grid-cols-2 gap-x-3 px-0.5">
              <RangeRow
                label="ระยะบน"
                value={merged.tableMarginTop}
                min={0} max={80} step={1}
                onChange={(v) => patch({ tableMarginTop: v })}
                accentColor={accent}
                mt={1}
              />
              <RangeRow
                label="ระยะล่าง"
                value={merged.tableMarginBottom}
                min={0} max={80} step={1}
                onChange={(v) => patch({ tableMarginBottom: v })}
                accentColor={accent}
                mt={1}
              />
            </div>
          </li>

        </ul>
      </nav>
    </aside>
  );
};

export default TableElementOffcanvas;
