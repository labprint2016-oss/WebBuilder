import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, ButtonGroup } from "@mui/material";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  Copy,
  Settings,
  Trash2,
} from "lucide-react";
import FormElementPreview from "./Layouts/Elements/FormElement";
import FormElementOffcanvas from "./Offcanvas/formElement";
import {
  collectFormSelectFields,
  fieldOptions,
  findChainByFieldId,
  getCascadedOptions,
  getDescendantFieldIds,
  isCascadedFieldUnlocked,
  normalizeConditionalChains,
  toggleRuleOption,
} from "./formConditionalSelect";
import {
  computeFormSumTotal,
  normalizeCalculations,
} from "./formCalculations";
import {
  panelGroupButtonSx,
  panelGroupRootBorderSx,
} from "./panelControlSx";

const collectAllFormFields = (rows) => {
  const fields = [];
  (Array.isArray(rows) ? rows : []).forEach((row) => {
    const rowGrid = Number.isFinite(Number(row?.grid))
      ? Math.max(1, Math.round(Number(row.grid)))
      : 1;
    for (let columnIndex = 0; columnIndex < rowGrid; columnIndex += 1) {
      const column = Array.isArray(row?.columns?.[columnIndex])
        ? row.columns[columnIndex]
        : [];
      column.forEach((field) => {
        if (field?.id) fields.push(field);
      });
    }
  });
  return fields;
};

const FORM_ELEMENT_SETTINGS_TYPES = new Set([
  "frmInput",
  "frmNum",
  "frmSum",
  "frmTextarea",
  "frmSelect",
  "frmRadio",
  "frmCheckbox",
  "frmSubmit",
  "frmText",
]);

const GRID_OPTIONS = [1, 2, 3, 4];
const GRID_BTN_GROUP_ROOT_SX = {
  width: "100%",
  boxShadow: "none",
  "& .MuiButton-root": { boxShadow: "none" },
  "& .MuiButtonGroup-grouped": { borderRadius: "0 !important" },
  "& .MuiButtonGroup-grouped:first-of-type": {
    borderTopLeftRadius: "6px !important",
    borderBottomLeftRadius: "6px !important",
  },
  "& .MuiButtonGroup-grouped:last-of-type": {
    borderTopRightRadius: "6px !important",
    borderBottomRightRadius: "6px !important",
  },
  ...panelGroupRootBorderSx,
};
const DESIGN_COLUMN_TARGET_PX = 300;
const DESIGN_COLUMN_GAP_PX = 8;
const DESIGN_AREA_WIDTH_PX = DESIGN_COLUMN_TARGET_PX * 2 + DESIGN_COLUMN_GAP_PX;
const DESIGN_AREA_WIDTH_FOR_THREE_COLUMNS_PX = 640;
const DESIGN_AREA_WIDTH_FOR_FOUR_COLUMNS_PX = 840;
const FORM_BUILDER_PREVIEW_ELEMENTS = [
  { label: "Input", icon: "text_fields", formType: "input" },
  { label: "Radio", icon: "radio_button_checked", formType: "radio" },
  { label: "Checkbox", icon: "check_box", formType: "checkbox" },
  { label: "Textarea", icon: "subject", formType: "textarea" },
  { label: "Select", icon: "arrow_drop_down_circle", formType: "select" },
  { label: "Num", icon: "pin", formType: "num" },
  { label: "Sum", icon: "functions", formType: "sum" },
  { label: "Submit", icon: "send", formType: "submit" },
  { label: "Text", icon: "format_size", formType: "text" },
];
const FORM_DRAG_TYPE = "application/x-form-builder-element";
const FORM_PREVIEW_THEME = {
  textColor: ["#334155"],
  mainColor: ["#0f172a", "#334155"],
  text: { value: "Prompt" },
};

const createRowDraft = (index = 0) => ({
  id: `row-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
  label: `แถว ${index + 1}`,
  grid: 1,
  columns: [[]],
});

const createDefaultFormRows = () => [createRowDraft(0)];

const FORM_TYPE_LABELS = {
  frmInput: "Input",
  frmText: "Text",
  frmNum: "Num",
  frmSum: "Sum",
  frmTextarea: "Textarea",
  frmSelect: "Select",
  frmRadio: "Radio",
  frmCheckbox: "Checkbox",
  frmSubmit: "Submit",
};

const relabelRows = (list) =>
  list.map((row, index) => ({
    ...row,
    label: `แถว ${index + 1}`,
  }));

const listRowElements = (row) => {
  const out = [];
  const columns = Array.isArray(row?.columns) ? row.columns : [];
  columns.forEach((col, columnIndex) => {
    if (!Array.isArray(col)) return;
    col.forEach((element, elementIndex) => {
      if (!element?.id) return;
      out.push({
        id: element.id,
        columnIndex,
        elementIndex,
        type: String(element.type || ""),
        label:
          typeof element.label === "string" && element.label.trim()
            ? element.label.trim()
            : FORM_TYPE_LABELS[element.type] || "Element",
        typeLabel: FORM_TYPE_LABELS[element.type] || "Element",
      });
    });
  });
  return out;
};

const buildFormDraftElement = (formType) => {
  if (!formType) return null;
  const base = {
    formRequired: false,
    formRequiredMessage: "กรุณากรอกข้อมูลนี้",
    formLabelColor: { type: "textColor", index: 0 },
    formLabelColorOpacity: 255,
    formPlaceholderColor: "#94a3b8",
    formPlaceholderColorOpacity: 255,
    formIconColor: "#94a3b8",
    formIconColorOpacity: 255,
    formBackgroundColor: "#ffffff",
    formBackgroundColorOpacity: 230,
    formBorderColor: "#94a3b8",
    formBorderColorOpacity: 140,
  };
  const uniq = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
  if (formType === "input") {
    return {
      ...base,
      id: `FrmInput-${uniq}`,
      type: "frmInput",
      label: "Input Label",
      labelIcon: { name: null, type: null },
      formLayoutColumns: 1,
      formLabelFontSize: 12,
      formPlaceholderFontSize: 12,
      placeholder: "Type your message...",
      formValidationType: "none",
      formMinLength: 3,
      formMaxLength: 255,
    };
  }
  if (formType === "text") {
    return {
      ...base,
      id: `FrmText-${uniq}`,
      type: "frmText",
      label: "ข้อความ",
      formLayoutColumns: 1,
      formLabelFontSize: 14,
      formTextSpacingTop: 0,
      formTextSpacingBottom: 0,
      formTextDivider: false,
      formTextDividerStyle: "solid",
    };
  }
  if (formType === "num") {
    return {
      ...base,
      id: `FrmNum-${uniq}`,
      type: "frmNum",
      label: "Num",
      labelIcon: { name: null, type: null },
      formLayoutColumns: 1,
      formLabelFontSize: 12,
      formPlaceholderFontSize: 12,
      placeholder: "0",
      formRequired: true,
      formValidationType: "number",
      calculationId: "",
      calculationName: "",
    };
  }
  if (formType === "sum") {
    return {
      ...base,
      id: `FrmSum-${uniq}`,
      type: "frmSum",
      label: "Sum",
      labelIcon: { name: null, type: null },
      formLayoutColumns: 1,
      formLabelFontSize: 12,
      formPlaceholderFontSize: 12,
      placeholder: "Unit",
      formReadOnly: true,
      calculationId: "",
      calculationName: "",
      calculationIds: [],
      calculationNames: [],
    };
  }
  if (formType === "textarea") {
    return {
      ...base,
      id: `FrmTextarea-${uniq}`,
      type: "frmTextarea",
      label: "Textarea Label",
      formLayoutColumns: 1,
      formLabelFontSize: 12,
      formPlaceholderFontSize: 12,
      placeholder: "Type your message...",
      rows: 4,
      formValidationType: "none",
      formMinLength: 3,
      formMaxLength: 1000,
    };
  }
  if (formType === "select") {
    return {
      ...base,
      id: `FrmSelect-${uniq}`,
      type: "frmSelect",
      label: "Select Label",
      formLayoutColumns: 1,
      formLabelFontSize: 12,
      formPlaceholderFontSize: 12,
      formBackgroundColorOpacity: 255,
      formOptionColor: { type: "mainColor", index: 0 },
      formOptionColorOpacity: 255,
      formOptionTextColor: { type: "textColor", index: 0 },
      formOptionTextColorOpacity: 255,
      formOptionHoverColor: { type: "mainColor", index: 0 },
      formOptionHoverColorOpacity: 40,
      formOptionActiveColor: { type: "mainColor", index: 0 },
      formOptionActiveColorOpacity: 56,
      placeholder: "Select an option",
      options: ["Option 1", "Option 2", "Option 3"],
      optionValues: [0, 0, 0],
      formOptionValuesEnabled: false,
      formRequired: true,
    };
  }
  if (formType === "radio") {
    return {
      ...base,
      id: `FrmRadio-${uniq}`,
      type: "frmRadio",
      label: "Radio Label",
      formLayoutColumns: 1,
      formLabelFontSize: 12,
      formPlaceholderFontSize: 12,
      formOptionColor: { type: "mainColor", index: 0 },
      formOptionColorOpacity: 255,
      formOptionTextColor: { type: "textColor", index: 0 },
      formOptionTextColorOpacity: 255,
      options: ["Option 1", "Option 2"],
    };
  }
  if (formType === "checkbox") {
    return {
      ...base,
      id: `FrmCheckbox-${uniq}`,
      type: "frmCheckbox",
      label: "Checkbox Label",
      formLayoutColumns: 1,
      formLabelFontSize: 12,
      formPlaceholderFontSize: 12,
      formOptionTextColor: { type: "textColor", index: 0 },
      formOptionTextColorOpacity: 255,
      options: ["Option 1", "Option 2"],
    };
  }
  if (formType === "submit") {
    return {
      ...base,
      id: `FrmSubmit-${uniq}`,
      type: "frmSubmit",
      label: "Submit",
      labelIcon: { name: null, type: null },
      formLayoutColumns: 1,
      formLabelFontSize: 13,
      formLabelColor: "#ffffff",
      formLabelColorOpacity: 255,
      formBackgroundColor: { type: "mainColor", index: 1 },
      formBackgroundColorOpacity: 255,
      formBorderColor: "#ffffff",
      formBorderColorOpacity: 255,
      formSuccessMessage: "ส่งข้อความเรียบร้อยแล้ว ขอบคุณมากค่ะ",
      formSuccessIcon: { name: null, type: null },
      formSuccessPreview: false,
      formSuccessLabelColor: "#059669",
      formSuccessLabelColorOpacity: 255,
      formSuccessIconColor: "#059669",
      formSuccessIconColorOpacity: 255,
      formSuccessBackgroundColor: "#ecfdf5",
      formSuccessBackgroundColorOpacity: 255,
    };
  }
  return null;
};

export default function FormsPage({
  theme,
  darkMode = "light",
  textColor,
  formName = "",
  activeFormPresetId = "",
  rows: rowsProp,
  currentRowId: currentRowIdProp = null,
  onRowsChange = null,
  onCurrentRowIdChange = null,
  conditionalChains: conditionalChainsProp = [],
  onConditionalChainsChange = null,
  calculations: calculationsProp = [],
  onCalculationsChange = null,
  onRegisterFormsDraftFlush = null,
  onFormsPanelDraftDirtyChange = null,
}) {
  const isRowsControlled = typeof onRowsChange === "function";
  const flushHandlersRef = useRef({});
  const notifyPanelDraftDirty = useCallback(() => {
    if (typeof onFormsPanelDraftDirtyChange !== "function") return;
    const dirty = Object.values(flushHandlersRef.current).some(
      (item) => typeof item?.isDirty === "function" && item.isDirty()
    );
    onFormsPanelDraftDirtyChange(dirty);
  }, [onFormsPanelDraftDirtyChange]);
  const registerFlushHandler = useCallback(
    (key, handlers) => {
      if (handlers && typeof handlers.flush === "function") {
        flushHandlersRef.current[key] = handlers;
      } else {
        delete flushHandlersRef.current[key];
      }
      notifyPanelDraftDirty();
    },
    [notifyPanelDraftDirty]
  );
  useEffect(() => {
    if (typeof onRegisterFormsDraftFlush !== "function") return undefined;
    const flushAll = () => {
      const handlers = Object.values(flushHandlersRef.current);
      for (let i = 0; i < handlers.length; i += 1) {
        try {
          const result = handlers[i]?.flush?.();
          if (result?.block) {
            notifyPanelDraftDirty();
            return result;
          }
        } catch (error) {
          console.error("Flush form panel draft failed:", error);
          return {
            ok: false,
            block: true,
            message: "ไม่สำเร็จ.....กรุณาตรวจสอบอีกครั้ง",
          };
        }
      }
      notifyPanelDraftDirty();
      return { ok: true };
    };
    onRegisterFormsDraftFlush(flushAll);
    return () => {
      onRegisterFormsDraftFlush(null);
      onFormsPanelDraftDirtyChange?.(false);
    };
  }, [
    onRegisterFormsDraftFlush,
    onFormsPanelDraftDirtyChange,
    notifyPanelDraftDirty,
  ]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [rowsLocal, setRowsLocal] = useState(() => createDefaultFormRows());
  const [currentRowIdLocal, setCurrentRowIdLocal] = useState(() => null);
  const [expandedRowIds, setExpandedRowIds] = useState(() => new Set());
  const [editingElementRef, setEditingElementRef] = useState(null);
  const [fieldValues, setFieldValues] = useState({});
  const [selectResetKeys, setSelectResetKeys] = useState({});

  const rows = isRowsControlled
    ? Array.isArray(rowsProp)
      ? rowsProp
      : []
    : rowsLocal;
  const setRows = (updater) => {
    if (isRowsControlled) {
      const next = typeof updater === "function" ? updater(rows) : updater;
      onRowsChange(next);
      return;
    }
    setRowsLocal(updater);
  };
  const currentRowId = isRowsControlled ? currentRowIdProp : currentRowIdLocal;
  const setCurrentRowId = (nextId) => {
    if (isRowsControlled) {
      onCurrentRowIdChange?.(nextId);
      return;
    }
    setCurrentRowIdLocal(nextId);
  };

  useEffect(() => {
    setIsPanelOpen(false);
    setEditingElementRef(null);
    setExpandedRowIds(new Set());
    setFieldValues({});
    setSelectResetKeys({});
  }, [activeFormPresetId]);

  const conditionalChains = useMemo(
    () => normalizeConditionalChains(conditionalChainsProp),
    [conditionalChainsProp]
  );
  const calculations = useMemo(
    () => normalizeCalculations(calculationsProp),
    [calculationsProp]
  );

  const selectFields = useMemo(() => collectFormSelectFields(rows), [rows]);
  const allFields = useMemo(() => collectAllFormFields(rows), [rows]);

  const fieldsById = useMemo(() => {
    const map = {};
    selectFields.forEach((field) => {
      if (field?.id) map[field.id] = field;
    });
    return map;
  }, [selectFields]);

  const sumDisplayByFieldId = useMemo(() => {
    const map = {};
    allFields.forEach((field) => {
      if (String(field?.type || "") !== "frmSum") return;
      const sum = computeFormSumTotal(
        calculations,
        field,
        allFields,
        fieldValues
      );
      map[field.id] =
        sum == null || !Number.isFinite(sum) ? "" : String(sum);
    });
    return map;
  }, [allFields, calculations, fieldValues]);

  const handleDesignFieldChange = (entry) => {
    if (!entry?.fieldId) return;
    const nextValue = String(entry?.value ?? "");
    setFieldValues((prev) => {
      const next = { ...prev, [entry.fieldId]: nextValue };
      const chain = findChainByFieldId(conditionalChains, entry.fieldId);
      if (chain) {
        getDescendantFieldIds(chain, entry.fieldId).forEach((childId) => {
          next[childId] = "";
        });
      }
      return next;
    });
    const chain = findChainByFieldId(conditionalChains, entry.fieldId);
    if (chain) {
      const descendants = getDescendantFieldIds(chain, entry.fieldId);
      if (descendants.length > 0) {
        setSelectResetKeys((prev) => {
          const next = { ...prev };
          descendants.forEach((childId) => {
            next[childId] = (next[childId] || 0) + 1;
          });
          return next;
        });
      }
    }
  };

  const handleToggleLinkedOption = (fieldId, option, enabled) => {
    const chain = findChainByFieldId(conditionalChains, fieldId);
    if (!chain || typeof onConditionalChainsChange !== "function") return;
    const ids = Array.isArray(chain.fieldIds) ? chain.fieldIds : [];
    const index = ids.indexOf(String(fieldId || ""));
    if (index <= 0) return;
    const parentPath = [];
    for (let i = 0; i < index; i += 1) {
      const value = String(fieldValues?.[ids[i]] ?? "").trim();
      if (!value) return;
      parentPath.push(value);
    }
    const remainingDepth = ids.length - parentPath.length;
    const nextRules = toggleRuleOption(
      chain.rules,
      parentPath,
      option,
      enabled,
      remainingDepth
    );
    onConditionalChainsChange(
      conditionalChains.map((item) =>
        item.id === chain.id ? { ...item, rules: nextRules } : item
      )
    );
  };

  const previewTheme = useMemo(() => {
    const hasTextColor =
      Array.isArray(theme?.textColor) && theme.textColor.length > 0;
    const hasMainColor =
      Array.isArray(theme?.mainColor) && theme.mainColor.length > 0;
    const textValue =
      typeof theme?.text?.value === "string" && theme.text.value.trim()
        ? theme.text
        : typeof theme?.text === "string" && theme.text.trim()
          ? { value: theme.text }
          : FORM_PREVIEW_THEME.text;
    return {
      ...FORM_PREVIEW_THEME,
      ...(theme && typeof theme === "object" ? theme : {}),
      text: textValue,
      textColor: hasTextColor ? theme.textColor : FORM_PREVIEW_THEME.textColor,
      mainColor: hasMainColor ? theme.mainColor : FORM_PREVIEW_THEME.mainColor,
    };
  }, [theme]);

  const editingElementData = useMemo(() => {
    if (!editingElementRef) return null;
    const row = rows.find((item) => item.id === editingElementRef.rowId);
    const column = row?.columns?.[editingElementRef.columnIndex];
    if (!Array.isArray(column)) return null;
    return column.find((el) => el?.id === editingElementRef.elementId) || null;
  }, [editingElementRef, rows]);

  const openElementSettings = (rowId, columnIndex, elementItem) => {
    if (!elementItem?.id) return;
    if (!FORM_ELEMENT_SETTINGS_TYPES.has(String(elementItem.type || ""))) return;
    setCurrentRowId(rowId);
    setEditingElementRef({
      rowId,
      columnIndex,
      elementId: elementItem.id,
    });
    setIsPanelOpen(false);
  };

  const closeElementSettings = () => {
    setEditingElementRef(null);
  };

  const updateEditingElement = (payload) => {
    if (!editingElementRef || !payload || typeof payload !== "object") return;
    const { rowId, columnIndex, elementId } = editingElementRef;
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId || !Array.isArray(row.columns)) return row;
        return {
          ...row,
          columns: row.columns.map((col, colIndex) => {
            if (colIndex !== columnIndex || !Array.isArray(col)) return col;
            return col.map((el) => {
              if (el?.id !== elementId) return el;
              return {
                ...el,
                ...payload,
                id: el.id,
                type: el.type,
              };
            });
          }),
        };
      })
    );
  };

  const addRowItem = () => {
    const nextDraft = createRowDraft(rows.length);
    const nextId = nextDraft.id;
    setRows((prev) =>
      relabelRows([
        ...prev,
        { ...nextDraft, label: `แถว ${prev.length + 1}` },
      ])
    );
    setCurrentRowId(nextId);
  };

  useEffect(() => {
    if (rows.length === 0) {
      const fallbackRow = createRowDraft(0);
      setRows([fallbackRow]);
      setCurrentRowId(fallbackRow.id);
      return;
    }
    if (!rows.some((row) => row.id === currentRowId)) {
      setCurrentRowId(rows[0].id);
    }
  }, [rows, currentRowId]);

  useEffect(() => {
    setExpandedRowIds((prev) => {
      const valid = new Set(rows.map((row) => row.id));
      let changed = false;
      const next = new Set();
      prev.forEach((id) => {
        if (valid.has(id)) next.add(id);
        else changed = true;
      });
      return changed ? next : prev;
    });
  }, [rows]);

  const currentRow = rows.find((row) => row.id === currentRowId) || rows[0] || null;
  const hasFourColumnRow = rows.some((row) => Number(row?.grid) === 4);
  const hasThreeColumnRow = rows.some((row) => Number(row?.grid) === 3);
  const designAreaWidthPx = hasFourColumnRow
    ? DESIGN_AREA_WIDTH_FOR_FOUR_COLUMNS_PX
    : hasThreeColumnRow
      ? DESIGN_AREA_WIDTH_FOR_THREE_COLUMNS_PX
      : DESIGN_AREA_WIDTH_PX;

  const rowElementsById = useMemo(() => {
    const map = new Map();
    rows.forEach((row) => {
      map.set(row.id, listRowElements(row));
    });
    return map;
  }, [rows]);

  const selectRow = (rowId) => {
    setCurrentRowId(rowId);
  };

  const toggleRowExpand = (rowId) => {
    setExpandedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) next.delete(rowId);
      else next.add(rowId);
      return next;
    });
  };

  const moveRow = (fromIndex, toIndex) => {
    setRows((prev) => {
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= prev.length ||
        toIndex >= prev.length
      ) {
        return prev;
      }
      const next = [...prev];
      const [item] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, item);
      return relabelRows(next);
    });
  };

  const duplicateRow = (rowId) => {
    setRows((prev) => {
      const index = prev.findIndex((row) => row.id === rowId);
      if (index < 0) return prev;
      const source = prev[index];
      const cloned =
        typeof structuredClone === "function"
          ? structuredClone(source)
          : JSON.parse(JSON.stringify(source));
      const copy = {
        ...cloned,
        id: `row-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
      };
      if (Array.isArray(copy.columns)) {
        copy.columns = copy.columns.map((col) =>
          Array.isArray(col)
            ? col.map((el, elIndex) => ({
                ...el,
                id: `${el?.type || "Frm"}-${Date.now()}-${elIndex}-${Math.round(
                  Math.random() * 1e6
                )}`,
              }))
            : []
        );
      }
      const next = [...prev];
      next.splice(index + 1, 0, copy);
      return relabelRows(next);
    });
  };

  const removeRow = (rowId) => {
    setRows((prev) => {
      if (prev.length <= 1) return prev;
      return relabelRows(prev.filter((row) => row.id !== rowId));
    });
    setExpandedRowIds((prev) => {
      if (!prev.has(rowId)) return prev;
      const next = new Set(prev);
      next.delete(rowId);
      return next;
    });
  };

  const removeElementFromRow = (rowId, elementId) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId || !Array.isArray(row.columns)) return row;
        return {
          ...row,
          columns: row.columns.map((col) =>
            Array.isArray(col) ? col.filter((el) => el?.id !== elementId) : []
          ),
        };
      })
    );
  };

  const updateCurrentRowGrid = (gridValue) => {
    if (!currentRow) return;
    setRows((prev) =>
      prev.map((row) =>
        row.id === currentRow.id
          ? {
              ...row,
              grid: gridValue,
              columns: Array.from({ length: gridValue }, (_, index) =>
                Array.isArray(row.columns?.[index]) ? row.columns[index] : []
              ),
            }
          : row
      )
    );
  };

  const onDragStartElement = (event, formType) => {
    if (!formType) return;
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData(FORM_DRAG_TYPE, formType);
    event.dataTransfer.setData("text/plain", formType);
  };

  const onDropElementInColumn = (event, rowId, columnIndex) => {
    event.preventDefault();
    const formType =
      event.dataTransfer.getData(FORM_DRAG_TYPE) || event.dataTransfer.getData("text/plain");
    const draft = buildFormDraftElement(formType);
    if (!draft) return;
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        const nextColumns = Array.from({ length: Number(row.grid) || 1 }, (_, index) =>
          Array.isArray(row.columns?.[index]) ? [...row.columns[index]] : []
        );
        if (!Array.isArray(nextColumns[columnIndex])) nextColumns[columnIndex] = [];
        nextColumns[columnIndex].push(draft);
        return { ...row, columns: nextColumns };
      })
    );
    setCurrentRowId(rowId);
  };

  return (
    <div
      className="relative h-full min-h-0 w-full overflow-hidden"
      style={{ background: "var(--dash-bg, #f8fafc)" }}
    >
      <div className="flex h-full min-h-0 w-full flex-col items-center overflow-y-auto px-4 py-4">
        {rows.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <button
              type="button"
              title="ตั้งค่าฟอร์ม"
              aria-label="ตั้งค่าฟอร์ม"
              className="dash-button inline-flex h-8 w-8 items-center justify-center rounded-md transition hover:opacity-90"
              onClick={() => {
                setEditingElementRef(null);
                setIsPanelOpen(true);
              }}
            >
              <Settings size={15} />
            </button>
          </div>
        ) : (
          <div className="mt-0 flex min-h-0 w-max max-w-full flex-1 flex-col items-start gap-0 pb-4">
            {String(formName || "").trim() ? (
              <h2
                className="mb-3 truncate text-[15px] font-semibold tracking-wide"
                style={{
                  color: "var(--dash-panel-heading, #0f172a)",
                  width: `${designAreaWidthPx}px`,
                  minWidth: `${designAreaWidthPx}px`,
                  maxWidth: `${designAreaWidthPx}px`,
                }}
                title={String(formName).trim()}
              >
                {String(formName).trim()}
              </h2>
            ) : null}
            <div className="flex min-h-0 w-full items-start gap-0">
            <div
              className="min-h-0 flex-1"
              style={{
                width: `${designAreaWidthPx}px`,
                minWidth: `${designAreaWidthPx}px`,
                maxWidth: `${designAreaWidthPx}px`,
              }}
            >
              <div
                className="rounded-xl border p-4"
                style={{
                  background: "#ffffff",
                  borderColor: "var(--dash-border, #e2e8f0)",
                }}
              >
            <div className="flex flex-col gap-3">
              {rows.map((row) => {
                const isCurrent = currentRow?.id === row.id;
                const rowGrid = Number.isFinite(Number(row.grid)) ? Number(row.grid) : 1;
                return (
                  <div
                    key={row.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => selectRow(row.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        selectRow(row.id);
                      }
                    }}
                    className="w-full cursor-pointer rounded-sm"
                    style={{
                      borderLeft: isCurrent
                        ? "6px solid var(--dash-panel-btn-group-active, #333333)"
                        : "6px solid transparent",
                      paddingLeft: "8px",
                    }}
                  >
                    <div
                      className="grid items-start gap-2"
                      style={{ gridTemplateColumns: `repeat(${rowGrid}, minmax(0, 1fr))` }}
                    >
                      {Array.from({ length: rowGrid }, (_, index) => {
                        const hasElements =
                          Array.isArray(row.columns?.[index]) && row.columns[index].length > 0;
                        return (
                          <div
                            key={`${row.id}-col-${index}`}
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={(event) => onDropElementInColumn(event, row.id, index)}
                            className={`flex flex-col items-stretch rounded-md px-1 py-0 ${
                              hasElements
                                ? "min-h-0"
                                : "min-h-12 border border-dashed"
                            }`}
                            style={
                              hasElements
                                ? undefined
                                : {
                                    // การ์ดพื้นขาวเสมอ — อย่าใช้ token dark mode
                                    borderColor: "#e2e8f0",
                                  }
                            }
                          >
                            {hasElements ? (
                              <div className="flex w-full min-h-0 flex-col items-stretch gap-3">
                                {row.columns[index].map((elementItem) => {
                                  const canOpenSettings =
                                    FORM_ELEMENT_SETTINGS_TYPES.has(
                                      String(elementItem?.type || "")
                                    );
                                  const isSubmit =
                                    String(elementItem?.type || "") === "frmSubmit";
                                  return (
                                    <div
                                      key={elementItem.id}
                                      className={[
                                        canOpenSettings ? "cursor-pointer" : "",
                                        isSubmit ? "flex w-full justify-start" : "w-full",
                                      ]
                                        .filter(Boolean)
                                        .join(" ") || undefined}
                                      title={
                                        canOpenSettings
                                          ? "ดับเบิลคลิกเพื่อตั้งค่า"
                                          : undefined
                                      }
                                      onClick={(event) => event.stopPropagation()}
                                      onDoubleClick={(event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        openElementSettings(
                                          row.id,
                                          index,
                                          elementItem
                                        );
                                      }}
                                    >
                                      <FormElementPreview
                                        elementData={elementItem}
                                        selected={false}
                                        hover={() => {}}
                                        theme={previewTheme}
                                        builderMode="Layout Mode"
                                        outerSpacing={false}
                                        interactive
                                        onFieldChange={handleDesignFieldChange}
                                        controlledValue={
                                          String(elementItem?.type || "") ===
                                          "frmSum"
                                            ? sumDisplayByFieldId[
                                                elementItem.id
                                              ] ?? ""
                                            : undefined
                                        }
                                        {...(() => {
                                          if (
                                            String(elementItem?.type || "") !==
                                            "frmSelect"
                                          ) {
                                            return {};
                                          }
                                          const chain = findChainByFieldId(
                                            conditionalChains,
                                            elementItem.id
                                          );
                                          if (!chain) return {};
                                          const unlocked = isCascadedFieldUnlocked(
                                            chain,
                                            fieldValues,
                                            elementItem.id
                                          );
                                          const chainIndex = (
                                            chain.fieldIds || []
                                          ).indexOf(elementItem.id);
                                          const relationEdit =
                                            unlocked && chainIndex > 0;
                                          if (!unlocked) {
                                            return {
                                              selectDisabled: true,
                                              selectOptions: [],
                                              selectResetKey:
                                                selectResetKeys[elementItem.id] ||
                                                0,
                                            };
                                          }
                                          if (relationEdit) {
                                            return {
                                              selectRelationEdit: true,
                                              selectOptions: fieldOptions(
                                                elementItem
                                              ),
                                              linkedSelectOptions:
                                                getCascadedOptions(
                                                  chain,
                                                  fieldsById,
                                                  fieldValues,
                                                  elementItem.id
                                                ),
                                              onToggleLinkedOption: (
                                                option,
                                                enabled
                                              ) =>
                                                handleToggleLinkedOption(
                                                  elementItem.id,
                                                  option,
                                                  enabled
                                                ),
                                              selectResetKey:
                                                selectResetKeys[elementItem.id] ||
                                                0,
                                            };
                                          }
                                          return {
                                            selectOptions: fieldOptions(
                                              elementItem
                                            ),
                                            selectResetKey:
                                              selectResetKeys[elementItem.id] ||
                                              0,
                                          };
                                        })()}
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div
                                className="flex h-12 items-center justify-center text-[11px]"
                                style={{ color: "#64748b" }}
                              >
                                คอลัมน์ {index + 1}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
              </div>
            </div>
            <button
              type="button"
              title="ตั้งค่าฟอร์ม"
              aria-label="ตั้งค่าฟอร์ม"
              className="dash-button mt-6 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-none rounded-r-md transition hover:opacity-90"
              onClick={() => {
                setEditingElementRef(null);
                setIsPanelOpen(true);
              }}
            >
              <Settings size={15} />
            </button>
            </div>
          </div>
        )}
      </div>

      {editingElementData && (
        <div className="absolute right-0 top-0 z-[80] h-full w-[400px] overflow-hidden">
          <FormElementOffcanvas
            element={editingElementData}
            onUpdate={updateEditingElement}
            close={closeElementSettings}
            theme={previewTheme}
            darkMode={darkMode}
            textColor={textColor}
            hideLayoutSection
            selectFields={selectFields}
            conditionalChains={conditionalChains}
            onConditionalChainsChange={onConditionalChainsChange}
            calculations={calculations}
            onCalculationsChange={onCalculationsChange}
            registerFlushHandler={registerFlushHandler}
          />
        </div>
      )}

      {isPanelOpen && !editingElementData && (
        <>
          <aside className="dash-panel absolute right-0 top-0 z-[70] flex h-full w-[400px] flex-col overflow-hidden">
            <div className="dash-panel-header shrink-0 flex items-center justify-between border-b px-6 pt-5 pb-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className="shrink-0 font-bold tracking-wide">
                  ตั้งค่าฟอร์ม
                </span>
              </div>
              <button
                type="button"
                className="rounded-lg p-2 transition hover:opacity-70"
                onClick={() => setIsPanelOpen(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M15.78 4.22a.75.75 0 010 1.06L10.06 11l5.72 5.72a.75.75 0 11-1.06 1.06l-6.25-6.25a.75.75 0 010-1.06l6.25-6.25a.75.75 0 011.06 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            <nav className="px-4 pb-6 overflow-y-auto h-[calc(100%-64px)] w-[400px]">
              <ul className="mt-1 pl-1">
                <li>
                  <div className="mt-4 mb-2 flex items-center gap-2">
                    <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                      จำนวนแถว
                    </span>
                    <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                    <button
                      type="button"
                      onClick={addRowItem}
                      className="rounded-md px-2 py-1 text-[11px] font-medium transition hover:opacity-90"
                      style={{
                        background:
                          "var(--dash-panel-btn-group-active, #333333)",
                        color:
                          "var(--dash-panel-btn-group-active-text, #ffffff)",
                      }}
                    >
                      เพิ่มแถว
                    </button>
                  </div>

                  <div className="space-y-2">
                    {rows.length === 0 ? (
                      <div
                        className="dash-input rounded-md border border-dashed px-3 py-2 text-[12px]"
                        style={{
                          color:
                            "var(--dash-panel-btn-group-inactive-text, #1e293b)",
                          opacity: 0.55,
                        }}
                      >
                        ยังไม่มีรายการแถว
                      </div>
                    ) : (
                      rows.map((row, rowIndex) => {
                        const isCurrent = currentRow?.id === row.id;
                        const isExpanded = expandedRowIds.has(row.id);
                        const rowElements = rowElementsById.get(row.id) || [];
                        return (
                          <div
                            key={row.id}
                            className="min-w-0 overflow-hidden rounded-md border"
                            style={{
                              background:
                                "var(--dash-panel-btn-group-inactive, #ffffff)",
                              borderColor: isCurrent
                                ? "color-mix(in srgb, var(--dash-panel-btn-group-active, #333333) 50%, transparent)"
                                : "var(--dash-panel-btn-group-border, #e2e8f0)",
                              color:
                                "var(--dash-panel-heading, var(--dash-panel-btn-group-inactive-text, #0f172a))",
                            }}
                          >
                            <div className="flex h-9 min-w-0 items-center gap-2 px-2.5">
                              <button
                                type="button"
                                onClick={() => selectRow(row.id)}
                                className={`min-w-0 flex-1 truncate text-left text-[12px] font-semibold`}
                                style={{
                                  color:
                                    "var(--dash-panel-heading, var(--dash-panel-btn-group-inactive-text, #0f172a))",
                                }}
                              >
                                {row.label}
                              </button>
                              <div className="ml-auto flex shrink-0 items-center gap-0.5">
                                <button
                                  type="button"
                                  disabled={rowIndex === 0}
                                  title="เลื่อนขึ้น"
                                  aria-label="เลื่อนแถวขึ้น"
                                  className="rounded p-0.5 transition hover:opacity-100 disabled:pointer-events-none disabled:opacity-35"
                                  style={{
                                    color:
                                      "var(--dash-panel-btn-group-inactive-text, #1e293b)",
                                    opacity: 0.55,
                                  }}
                                  onClick={() => moveRow(rowIndex, rowIndex - 1)}
                                >
                                  <ArrowUp className="h-3 w-3" strokeWidth={2.25} />
                                </button>
                                <button
                                  type="button"
                                  disabled={rowIndex >= rows.length - 1}
                                  title="เลื่อนลง"
                                  aria-label="เลื่อนแถวลง"
                                  className="rounded p-0.5 transition hover:opacity-100 disabled:pointer-events-none disabled:opacity-35"
                                  style={{
                                    color:
                                      "var(--dash-panel-btn-group-inactive-text, #1e293b)",
                                    opacity: 0.55,
                                  }}
                                  onClick={() => moveRow(rowIndex, rowIndex + 1)}
                                >
                                  <ArrowDown className="h-3 w-3" strokeWidth={2.25} />
                                </button>
                                <button
                                  type="button"
                                  title="คัดลอกแถว"
                                  aria-label="คัดลอกแถว"
                                  className="mx-1.5 rounded p-0.5 transition hover:opacity-100"
                                  style={{
                                    color:
                                      "var(--dash-panel-btn-group-inactive-text, #1e293b)",
                                    opacity: 0.55,
                                  }}
                                  onClick={() => duplicateRow(row.id)}
                                >
                                  <Copy className="h-3.5 w-3.5" strokeWidth={2} />
                                </button>
                                <button
                                  type="button"
                                  disabled={rows.length <= 1}
                                  title={
                                    rows.length <= 1
                                      ? "ต้องมีอย่างน้อย 1 แถว"
                                      : "ลบแถว"
                                  }
                                  aria-label="ลบแถว"
                                  className="rounded p-0.5 transition hover:text-red-600 disabled:pointer-events-none disabled:opacity-35 dark:hover:text-red-400"
                                  style={{
                                    color:
                                      "var(--dash-panel-btn-group-inactive-text, #1e293b)",
                                    opacity: 0.55,
                                  }}
                                  onClick={() => removeRow(row.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                                </button>
                                <button
                                  type="button"
                                  title={
                                    isExpanded
                                      ? "ปิดรายการ Element ในแถว"
                                      : "ดู Element ในแถว"
                                  }
                                  aria-label={
                                    isExpanded
                                      ? "ปิดรายการ Element ในแถว"
                                      : "เปิดดู Element ในแถว"
                                  }
                                  aria-expanded={isExpanded}
                                  className="rounded p-0.5 transition hover:opacity-100"
                                  style={{
                                    color:
                                      "var(--dash-panel-btn-group-inactive-text, #1e293b)",
                                    opacity: 0.55,
                                  }}
                                  onClick={() => toggleRowExpand(row.id)}
                                >
                                  {isExpanded ? (
                                    <ChevronUp className="h-3.5 w-3.5" strokeWidth={2.25} />
                                  ) : (
                                    <ChevronDown className="h-3.5 w-3.5" strokeWidth={2.25} />
                                  )}
                                </button>
                              </div>
                            </div>
                            {isExpanded ? (
                              <div
                                className="border-t px-2 py-2"
                                style={{
                                  borderColor:
                                    "var(--dash-panel-btn-group-border, #e2e8f0)",
                                }}
                              >
                                {rowElements.length === 0 ? (
                                  <p
                                    className="px-1 py-1 text-[11px]"
                                    style={{
                                      color:
                                        "var(--dash-panel-btn-group-inactive-text, #1e293b)",
                                      opacity: 0.5,
                                    }}
                                  >
                                    ยังไม่มี Element ในแถวนี้
                                  </p>
                                ) : (
                                  <ul className="flex flex-wrap gap-1.5">
                                    {rowElements.map((el) => (
                                      <li key={el.id}>
                                        <span
                                          className="inline-flex max-w-full items-center gap-1 rounded-full border py-0.5 pl-2.5 pr-1 text-[11px] font-medium leading-none"
                                          style={{
                                            borderColor:
                                              "var(--dash-panel-btn-group-border, #e2e8f0)",
                                            background:
                                              "var(--dash-panel-btn-group-inactive, #ffffff)",
                                            color:
                                              "var(--dash-panel-btn-group-inactive-text, #1e293b)",
                                          }}
                                          title={
                                            el.label && el.label !== el.typeLabel
                                              ? `${el.typeLabel} · ${el.label}`
                                              : el.typeLabel
                                          }
                                        >
                                          <span className="min-w-0 truncate">
                                            {el.typeLabel}
                                          </span>
                                          <button
                                            type="button"
                                            title="ลบ Element"
                                            aria-label={`ลบ ${el.typeLabel}`}
                                            className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition hover:text-red-600 dark:hover:text-red-400"
                                            style={{
                                              color:
                                                "var(--dash-panel-btn-group-inactive-text, #1e293b)",
                                              opacity: 0.55,
                                            }}
                                            onClick={() =>
                                              removeElementFromRow(row.id, el.id)
                                            }
                                          >
                                            <Trash2
                                              className="h-2.5 w-2.5"
                                              strokeWidth={2.25}
                                            />
                                          </button>
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ) : null}
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="mt-5">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                        เลือก Grid
                      </span>
                      <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                    </div>
                    <ButtonGroup
                      fullWidth
                      variant="outlined"
                      disableElevation
                      color="inherit"
                      disabled={!currentRow}
                      sx={GRID_BTN_GROUP_ROOT_SX}
                    >
                      {GRID_OPTIONS.map((grid) => {
                        const selected = (currentRow?.grid || 1) === grid;
                        return (
                          <Button
                            key={grid}
                            color="inherit"
                            sx={panelGroupButtonSx(selected)}
                            onClick={() => updateCurrentRowGrid(grid)}
                          >
                            Grid {grid}
                          </Button>
                        );
                      })}
                    </ButtonGroup>
                  </div>

                  <div className="mt-5 mb-2 flex items-center gap-2">
                    <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                      Element
                    </span>
                    <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                  </div>
                  <div className="grid grid-cols-4 gap-3 mx-0">
                    {FORM_BUILDER_PREVIEW_ELEMENTS.map((item) => (
                      <div
                        key={item.label}
                        className="rounded-md border px-3 py-2 text-center cursor-grab active:cursor-grabbing"
                        style={{
                          background:
                            "var(--dash-panel-btn-group-inactive, #ffffff)",
                          borderColor:
                            "var(--dash-panel-btn-group-border, #e2e8f0)",
                        }}
                        title="ลากวางลงคอลัมน์"
                        draggable
                        onDragStart={(event) => onDragStartElement(event, item.formType)}
                      >
                        <span
                          className="material-symbols-outlined text-[30px] px-2"
                          style={{
                            color: "var(--dash-panel-heading, #0f172a)",
                          }}
                        >
                          {item.icon}
                        </span>
                        <p
                          className="text-[12px] antialiased whitespace-nowrap"
                          style={{
                            color:
                              "var(--dash-panel-btn-group-inactive-text, #1e293b)",
                          }}
                        >
                          {item.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </li>
              </ul>
            </nav>
          </aside>
        </>
      )}
    </div>
  );
}
