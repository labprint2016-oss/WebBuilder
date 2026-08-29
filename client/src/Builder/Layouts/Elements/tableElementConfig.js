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
  /** ตรึงคอลัมน์แรก — เลื่อนตารางแล้วคอลัมน์แรกอยู่กับที่ */
  tableStickyFirstColumn: false,
  /** คอลัมน์แรก: none | icon | image — แสดงหน้าข้อความ */
  tableFirstColumnLead: "none",
  tableFirstColumnLeads: [],
  tableFirstColumnIconColor: "#111827",
  tableFirstColumnIconColorOpacity: 255,
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
const FIRST_COLUMN_LEADS = new Set(["none", "icon", "image"]);
const DEFAULT_FIRST_COLUMN_ICONS = [
  { name: "faStar", type: "fas" },
  { name: "faCheckCircle", type: "fas" },
  { name: "faShieldHalved", type: "fas" },
];

function clampLeadBrightness(value) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(-100, Math.min(100, Math.round(n))) : 0;
}

function sanitizeFirstColumnLead(item, index) {
  const idx = Number.isFinite(Number(index)) ? Number(index) : 0;
  const fallback = DEFAULT_FIRST_COLUMN_ICONS[idx % DEFAULT_FIRST_COLUMN_ICONS.length];
  const rawIcon = item?.faIcon;
  const name =
    typeof rawIcon?.name === "string" && rawIcon.name.trim()
      ? rawIcon.name.trim()
      : fallback.name;
  const type = rawIcon?.type === "fab" || rawIcon?.type === "far" ? rawIcon.type : "fas";
  const src = typeof item?.src === "string" ? item.src : "";
  return {
    faIcon: { name, type },
    src,
    brightness: clampLeadBrightness(item?.brightness),
    linkEnabled: item?.linkEnabled === true,
    linkUrl: typeof item?.linkUrl === "string" ? item.linkUrl : "",
    linkTarget: item?.linkTarget === "_blank" ? "_blank" : "_self",
  };
}

function normalizeFirstColumnLeads(raw, rowCount) {
  const count = Math.max(1, Number(rowCount) || 1);
  const source = Array.isArray(raw) ? raw : [];
  if (source.length === count) {
    let unchanged = true;
    for (let i = 0; i < count; i += 1) {
      const item = source[i];
      if (!item || typeof item !== "object") {
        unchanged = false;
        break;
      }
      const name = item?.faIcon?.name;
      const type = item?.faIcon?.type;
      if (typeof name !== "string" || !name.trim()) {
        unchanged = false;
        break;
      }
      if (type !== "fas" && type !== "fab" && type !== "far") {
        unchanged = false;
        break;
      }
      if (typeof item.src !== "string") {
        unchanged = false;
        break;
      }
      if (
        typeof item.brightness !== "number" ||
        item.brightness !== clampLeadBrightness(item.brightness)
      ) {
        unchanged = false;
        break;
      }
      if (item.linkEnabled !== true && item.linkEnabled !== false) {
        unchanged = false;
        break;
      }
      if (typeof item.linkUrl !== "string") {
        unchanged = false;
        break;
      }
      if (item.linkTarget !== "_self" && item.linkTarget !== "_blank") {
        unchanged = false;
        break;
      }
    }
    if (unchanged) return source;
  }
  return Array.from({ length: count }, (_, i) => sanitizeFirstColumnLead(source[i], i));
}

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

export function sliceTableFirstColumnIconForPanel(lead, tableElement, rowIndex) {
  const idx = Number.isFinite(Number(rowIndex)) ? Number(rowIndex) : 0;
  const fallback = DEFAULT_FIRST_COLUMN_ICONS[idx % DEFAULT_FIRST_COLUMN_ICONS.length];
  const raw = lead?.faIcon;
  const name =
    typeof raw?.name === "string" && raw.name.trim() ? raw.name.trim() : fallback.name;
  const type = raw?.type === "fab" || raw?.type === "far" ? raw.type : "fas";
  return {
    type: "icon",
    id: `${tableElement?.id || "tbl"}__tblLead${idx}`,
    faIcon: { name, type },
    borderEnabled: false,
    iconMarginTop: 0,
    iconMarginBottom: 0,
    linkEnabled: lead?.linkEnabled === true,
    linkUrl: typeof lead?.linkUrl === "string" ? lead.linkUrl : "",
    linkTarget: lead?.linkTarget === "_blank" ? "_blank" : "_self",
    __tableFirstColumnIconEdit: {
      tableElementId: tableElement?.id,
      rowIndex: idx,
    },
  };
}

export function sliceTableFirstColumnImageForPanel(lead, tableElement, rowIndex) {
  const idx = Number.isFinite(Number(rowIndex)) ? Number(rowIndex) : 0;
  return {
    type: "img",
    id: `${tableElement?.id || "tbl"}__tblLead${idx}`,
    src: typeof lead?.src === "string" ? lead.src : "",
    aspectRatio: "auto",
    brightness: clampLeadBrightness(lead?.brightness),
    __tableFirstColumnImageEdit: {
      tableElementId: tableElement?.id,
      rowIndex: idx,
    },
  };
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
    tableStickyFirstColumn: merged.tableStickyFirstColumn === true,
    tableFirstColumnLead: FIRST_COLUMN_LEADS.has(merged.tableFirstColumnLead)
      ? merged.tableFirstColumnLead
      : "none",
    tableFirstColumnLeads: normalizeFirstColumnLeads(
      base.tableFirstColumnLeads,
      tableRows.length
    ),
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
    tableFirstColumnIconColor:
      typeof merged.tableFirstColumnIconColor === "string" &&
      merged.tableFirstColumnIconColor.trim()
        ? merged.tableFirstColumnIconColor
        : "#111827",
    tableFirstColumnIconColorOpacity: clampOp(merged.tableFirstColumnIconColorOpacity),
  };
}
