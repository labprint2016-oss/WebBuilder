export const TABLE_ELEMENT_DEFAULTS = {
  type: "tbl",
  id: "Tbl-",
  tableColumns: [
    { id: "col-1", label: "Column - 1", align: "left", width: 220 },
    { id: "col-2", label: "Column - 2", align: "left", width: 180 },
    { id: "col-3", label: "Column - 3", align: "left", width: 140 },
  ],
  tableRows: [
    ["Data - 1", "Data - 2", "Data - 3"],
    ["Data - 4", "Data - 5", "Data - 6"],
    ["Data - 7", "Data - 8", "Data - 9"],
  ],
  tableHeaderBg: "#f8fafc",
  tableHeaderText: "#0f172a",
  tableBodyText: "#111827",
  tableRowBg: "#ffffff",
  tableBorderColor: "#d8d8d8",
  tableHeaderBgOpacity: 255,
  tableHeaderTextOpacity: 255,
  tableBodyTextOpacity: 255,
  tableRowBgOpacity: 255,
  tableBorderColorOpacity: 255,
  tableBorderStyle: "solid",
  tableOuterBorder: false,
  tableZebra: true,
  tableZebraBg: "#f8fafc",
  tableZebraBgOpacity: 255,
  tableHeaderBold: true,
  tableFontSize: 14,
  tableCellPaddingX: 24,
  tableCellPaddingY: 10,
  tableMinWidth: 640,
  tableMarginTop: 8,
  tableMarginBottom: 8,
  preview: {
    label: "Data Table",
    icon: "table",
    lucideIcon: "TableProperties",
    lucideSize: 28,
    lucideStrokeWidth: 2.2,
  },
};

const ALIGNS = new Set(["left", "center", "right"]);

function sanitizeColumn(col, index) {
  const idx = Number.isFinite(Number(index)) ? Number(index) : 0;
  const idRaw = typeof col?.id === "string" && col.id.trim() ? col.id.trim() : `col-${idx + 1}`;
  const labelRaw =
    typeof col?.label === "string" && col.label.trim()
      ? col.label.trim()
      : `Column - ${idx + 1}`;
  const alignRaw = typeof col?.align === "string" ? col.align.trim().toLowerCase() : "left";
  const widthRaw = Number(col?.width);
  return {
    id: idRaw,
    label: labelRaw,
    align: ALIGNS.has(alignRaw) ? alignRaw : "left",
    width: Number.isFinite(widthRaw) ? Math.max(1, Math.round(widthRaw)) : 180,
  };
}

function normalizeRows(rows, colCount) {
  const safeColCount = Math.max(1, Number(colCount) || 1);
  const source = Array.isArray(rows) ? rows : TABLE_ELEMENT_DEFAULTS.tableRows;
  if (!source.length) {
    return [Array.from({ length: safeColCount }, () => "")];
  }
  return source.map((row) => {
    const arr = Array.isArray(row) ? row : [];
    const normalized = Array.from({ length: safeColCount }, (_, i) => {
      const cell = arr[i];
      return cell == null ? "" : String(cell);
    });
    return normalized;
  });
}

export function mergeTableElement(element) {
  const base = element && typeof element === "object" ? element : {};
  const merged = { ...TABLE_ELEMENT_DEFAULTS, ...base, type: "tbl" };
  const rawColumns = Array.isArray(base.tableColumns) ? base.tableColumns : TABLE_ELEMENT_DEFAULTS.tableColumns;
  const tableColumns = rawColumns.length
    ? rawColumns.map((col, i) => sanitizeColumn(col, i))
    : TABLE_ELEMENT_DEFAULTS.tableColumns.map((col, i) => sanitizeColumn(col, i));
  const tableRows = normalizeRows(base.tableRows, tableColumns.length);
  const tableFontSize = Number(merged.tableFontSize);
  const tableCellPaddingX = Number(merged.tableCellPaddingX);
  const tableCellPaddingY = Number(merged.tableCellPaddingY);
  const tableMinWidth = Number(merged.tableMinWidth);
  const tableMarginTop = Number(merged.tableMarginTop);
  const tableMarginBottom = Number(merged.tableMarginBottom);
  const clampOp = (v) => (Number.isFinite(Number(v)) ? Math.max(0, Math.min(255, Math.round(Number(v)))) : 255);
  return {
    ...merged,
    tableColumns,
    tableRows,
    tableBorderStyle: ["solid", "dashed", "dotted", "none"].includes(merged.tableBorderStyle)
      ? merged.tableBorderStyle
      : "solid",
    tableOuterBorder: merged.tableOuterBorder === true,
    tableZebra: merged.tableZebra !== false,
    tableHeaderBold: merged.tableHeaderBold !== false,
    tableFontSize: Number.isFinite(tableFontSize) ? Math.max(11, Math.min(26, tableFontSize)) : 14,
    tableCellPaddingX: 24,
    tableCellPaddingY: Number.isFinite(tableCellPaddingY)
      ? Math.max(4, Math.min(24, tableCellPaddingY))
      : 10,
    tableMinWidth: Number.isFinite(tableMinWidth) ? Math.max(280, Math.min(2400, tableMinWidth)) : 640,
    tableMarginTop: Number.isFinite(tableMarginTop) ? Math.max(0, Math.min(80, tableMarginTop)) : 8,
    tableMarginBottom: Number.isFinite(tableMarginBottom)
      ? Math.max(0, Math.min(80, tableMarginBottom))
      : 8,
    tableHeaderBgOpacity: clampOp(merged.tableHeaderBgOpacity),
    tableHeaderTextOpacity: clampOp(merged.tableHeaderTextOpacity),
    tableBodyTextOpacity: clampOp(merged.tableBodyTextOpacity),
    tableRowBgOpacity: clampOp(merged.tableRowBgOpacity),
    tableBorderColorOpacity: clampOp(merged.tableBorderColorOpacity),
    tableZebraBgOpacity: clampOp(merged.tableZebraBgOpacity),
  };
}
