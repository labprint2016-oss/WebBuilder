/** Form calculations — independent from Conditional */

export const MAX_CALCULATION_SELECTS = 3;
export const CALC_PATH_SEP = "\u0001";
export const CALC_KIND_PATH = "path";
export const CALC_KIND_FORMULA = "formula";

const FORMULA_OPS = new Set(["+", "-", "*", "/"]);
const FORMULA_PARENS = new Set(["(", ")"]);
const OP_PRECEDENCE = { "+": 1, "-": 1, "*": 2, "/": 2 };

const newCalcId = () =>
  `form-calc-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

export const fieldOptions = (field) => {
  if (!Array.isArray(field?.options)) return [];
  return field.options.map((item) => String(item ?? "").trim()).filter(Boolean);
};

export const collectFormSelectFields = (rows) => {
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
        if (field?.id && String(field?.type || "") === "frmSelect") {
          fields.push(field);
        }
      });
    }
  });
  return fields;
};

export const buildPathKey = (parts) =>
  (Array.isArray(parts) ? parts : [])
    .map((item) => String(item ?? "").trim())
    .join(CALC_PATH_SEP);

export const splitPathKey = (key) =>
  String(key || "").split(CALC_PATH_SEP).filter((part) => part !== "");

/** Cartesian product of option arrays */
export const cartesianOptions = (optionLists) => {
  const lists = (Array.isArray(optionLists) ? optionLists : [])
    .map((list) => (Array.isArray(list) ? list.filter(Boolean) : []))
    .filter((list) => list.length > 0);
  if (lists.length === 0) return [];
  return lists.reduce(
    (acc, list) => {
      const next = [];
      acc.forEach((prefix) => {
        list.forEach((item) => {
          next.push([...prefix, item]);
        });
      });
      return next;
    },
    [[]]
  );
};

export const buildAllPathKeys = (fields) => {
  const optionLists = (Array.isArray(fields) ? fields : []).map((field) =>
    fieldOptions(field)
  );
  return cartesianOptions(optionLists).map((parts) => buildPathKey(parts));
};

const sanitizeValues = (raw) => {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const next = {};
  Object.keys(raw).forEach((key) => {
    const safeKey = String(key || "");
    if (!safeKey) return;
    const n = Number(raw[key]);
    next[safeKey] = Number.isFinite(n) ? Math.max(0, n) : 0;
  });
  return next;
};

export const sanitizeFormulaTokens = (raw) => {
  if (!Array.isArray(raw)) return [];
  const next = [];
  raw.forEach((token) => {
    const type = String(token?.type || "").trim();
    if (type === "num") {
      const text = String(token?.value ?? "").trim();
      if (text === "" || !/^\d*\.?\d+$/.test(text)) return;
      const n = Number(text);
      if (!Number.isFinite(n)) return;
      next.push({ type: "num", value: String(n) });
      return;
    }
    if (type === "op") {
      const op = String(token?.value || "").trim();
      if (!FORMULA_OPS.has(op)) return;
      next.push({ type: "op", value: op });
      return;
    }
    if (type === "paren") {
      const paren = String(token?.value || "").trim();
      if (!FORMULA_PARENS.has(paren)) return;
      next.push({ type: "paren", value: paren });
      return;
    }
    if (type === "field") {
      const fieldId = String(token?.fieldId || "").trim();
      if (!fieldId) return;
      next.push({ type: "field", fieldId });
    }
  });
  return next;
};

/** Select มีกำหนดค่า และมีเลขอย่างน้อย 1 ช่อง */
export const selectHasFilledOptionValues = (field) => {
  if (!field || field.formOptionValuesEnabled !== true) return false;
  const values = Array.isArray(field.optionValues) ? field.optionValues : [];
  return values.some((item) => {
    if (item === "" || item === null || item === undefined) return false;
    return Number.isFinite(Number(item));
  });
};

/** ค่าตัวเลขของ option ที่เลือก (จาก optionValues) */
export const getSelectOptionNumericValue = (field, selectedLabel) => {
  if (!field || field.formOptionValuesEnabled !== true) return 0;
  const options = Array.isArray(field.options) ? field.options : [];
  const label = String(selectedLabel ?? "").trim();
  const index = options.findIndex(
    (item) => String(item ?? "").trim() === label
  );
  if (index < 0) return 0;
  const values = Array.isArray(field.optionValues) ? field.optionValues : [];
  const n = Number(values[index]);
  return Number.isFinite(n) ? n : 0;
};

const formulaTokenLabel = (token, fieldsById) => {
  if (!token) return "";
  if (token.type === "num") return String(token.value ?? "");
  if (token.type === "op") {
    if (token.value === "*") return "×";
    if (token.value === "/") return "÷";
    return String(token.value);
  }
  if (token.type === "paren") return String(token.value);
  if (token.type === "field") {
    const field = fieldsById?.[token.fieldId];
    const label =
      typeof field?.label === "string" && field.label.trim()
        ? field.label.trim()
        : "Select";
    return label;
  }
  return "";
};

export const formatFormulaTokens = (tokens, fieldsById = {}) =>
  sanitizeFormulaTokens(tokens)
    .map((token) => formulaTokenLabel(token, fieldsById))
    .join(" ");

/** Evaluate formula tokens → number (safe, no eval) */
export const evaluateFormulaTokens = (
  tokens,
  fieldsById = {},
  valuesByFieldId = {}
) => {
  const safeTokens = sanitizeFormulaTokens(tokens);
  if (safeTokens.length === 0) return 0;

  const output = [];
  const ops = [];

  const applyOp = () => {
    const op = ops.pop();
    const b = output.pop();
    const a = output.pop();
    if (!Number.isFinite(a) || !Number.isFinite(b) || !op) {
      output.push(0);
      return;
    }
    let result = 0;
    if (op === "+") result = a + b;
    else if (op === "-") result = a - b;
    else if (op === "*") result = a * b;
    else if (op === "/") result = b === 0 ? 0 : a / b;
    output.push(Number.isFinite(result) ? result : 0);
  };

  for (let i = 0; i < safeTokens.length; i += 1) {
    const token = safeTokens[i];
    if (token.type === "num") {
      output.push(Number(token.value));
      continue;
    }
    if (token.type === "field") {
      const field = fieldsById?.[token.fieldId];
      const selected = valuesByFieldId?.[token.fieldId];
      output.push(getSelectOptionNumericValue(field, selected));
      continue;
    }
    if (token.type === "paren" && token.value === "(") {
      ops.push("(");
      continue;
    }
    if (token.type === "paren" && token.value === ")") {
      while (ops.length > 0 && ops[ops.length - 1] !== "(") applyOp();
      if (ops[ops.length - 1] === "(") ops.pop();
      continue;
    }
    if (token.type === "op") {
      while (
        ops.length > 0 &&
        FORMULA_OPS.has(ops[ops.length - 1]) &&
        OP_PRECEDENCE[ops[ops.length - 1]] >= OP_PRECEDENCE[token.value]
      ) {
        applyOp();
      }
      ops.push(token.value);
    }
  }
  while (ops.length > 0) {
    if (ops[ops.length - 1] === "(" || ops[ops.length - 1] === ")") {
      ops.pop();
      continue;
    }
    applyOp();
  }
  const result = output.length === 1 ? output[0] : 0;
  return Number.isFinite(result) ? result : 0;
};

export const normalizeCalculation = (raw, index = 0) => {
  const kind =
    String(raw?.kind || "").trim() === CALC_KIND_FORMULA ||
    Array.isArray(raw?.tokens)
      ? CALC_KIND_FORMULA
      : CALC_KIND_PATH;

  if (kind === CALC_KIND_FORMULA) {
    const tokens = sanitizeFormulaTokens(raw?.tokens);
    const fieldIds = [];
    tokens.forEach((token) => {
      if (token?.type !== "field") return;
      const id = String(token.fieldId || "").trim();
      if (!id || fieldIds.includes(id)) return;
      fieldIds.push(id);
    });
    // legacy: เก็บ fieldId เดิมพอไม่มีใน tokens
    const legacyId = String(raw?.fieldId || raw?.fieldIds?.[0] || "").trim();
    if (legacyId && !fieldIds.includes(legacyId)) fieldIds.push(legacyId);
    const name =
      String(raw?.name || "").trim() || `สูตรคำนวณ ${index + 1}`;
    return {
      kind: CALC_KIND_FORMULA,
      id: String(raw?.id || "").trim() || newCalcId(),
      name,
      fieldId: fieldIds[0] || "",
      fieldIds,
      tokens,
      values: {},
    };
  }

  const fieldIds = [];
  (Array.isArray(raw?.fieldIds) ? raw.fieldIds : []).forEach((id) => {
    const safe = String(id || "").trim();
    if (!safe || fieldIds.includes(safe)) return;
    if (fieldIds.length < MAX_CALCULATION_SELECTS) fieldIds.push(safe);
  });
  const name =
    String(raw?.name || "").trim() || `การคำนวณ ${index + 1}`;
  return {
    kind: CALC_KIND_PATH,
    id: String(raw?.id || "").trim() || newCalcId(),
    name,
    fieldIds,
    values: sanitizeValues(raw?.values),
  };
};

export const normalizeCalculations = (raw) => {
  if (!Array.isArray(raw)) return [];
  const normalized = raw.map((item, index) => normalizeCalculation(item, index));
  // สูตรคำนวณมีได้แค่ 1 ต่อฟอร์ม
  let seenFormula = false;
  return normalized.filter((item) => {
    if (item?.kind !== CALC_KIND_FORMULA) return true;
    if (seenFormula) return false;
    seenFormula = true;
    return true;
  });
};

export const createEmptyCalculation = () => ({
  kind: CALC_KIND_PATH,
  id: newCalcId(),
  name: "",
  fieldIds: [],
  values: {},
});

/** สูตรคำนวณ — 1 สูตรต่อฟอร์ม */
export const createEmptyFormula = () => ({
  kind: CALC_KIND_FORMULA,
  id: newCalcId(),
  name: "",
  fieldId: "",
  fieldIds: [],
  tokens: [],
  values: {},
});

export const findCalculationById = (calculations, id) => {
  const safeId = String(id || "").trim();
  if (!safeId) return null;
  return (
    (Array.isArray(calculations) ? calculations : []).find(
      (item) => item?.id === safeId
    ) || null
  );
};

/** หาการคำนวณแบบ path (ไม่รวมสูตรคำนวณ) ตาม Select */
export const findCalculationByFieldId = (calculations, fieldId) => {
  const id = String(fieldId || "").trim();
  if (!id) return null;
  return (
    (Array.isArray(calculations) ? calculations : []).find((item) => {
      if (item?.kind === CALC_KIND_FORMULA) return false;
      return (Array.isArray(item?.fieldIds) ? item.fieldIds : []).some(
        (field) => String(field || "") === id
      );
    }) || null
  );
};

/** สูตรคำนวณของฟอร์ม — มีได้แค่ 1 อัน */
export const findFormFormula = (calculations) =>
  (Array.isArray(calculations) ? calculations : []).find(
    (item) => item?.kind === CALC_KIND_FORMULA
  ) || null;

/** หาสูตรคำนวณที่ผูก Select นี้ไว้ใน tokens */
export const findFormulaByFieldId = (calculations, fieldId) => {
  const id = String(fieldId || "").trim();
  if (!id) return null;
  const formula = findFormFormula(calculations);
  if (!formula) return null;
  const ids = Array.isArray(formula.fieldIds) ? formula.fieldIds : [];
  return ids.some((field) => String(field || "") === id) ? formula : null;
};

export const findCalculationByName = (calculations, name) => {
  const safeName = String(name || "").trim();
  if (!safeName) return null;
  return (
    (Array.isArray(calculations) ? calculations : []).find(
      (item) => String(item?.name || "").trim() === safeName
    ) || null
  );
};

/** Prefer id, then name */
export const resolveCalculation = (calculations, id, name) =>
  findCalculationById(calculations, id) ||
  findCalculationByName(calculations, name);

/** Lookup path value for current select selections */
export const getCalculationPathValue = (calculation, valuesByFieldId) => {
  const ids = Array.isArray(calculation?.fieldIds) ? calculation.fieldIds : [];
  if (ids.length === 0) return 0;
  const parts = [];
  for (let i = 0; i < ids.length; i += 1) {
    const value = String(valuesByFieldId?.[ids[i]] ?? "").trim();
    if (!value) return 0;
    parts.push(value);
  }
  const key = buildPathKey(parts);
  const n = Number(calculation?.values?.[key]);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
};

const fieldsByIdFromList = (allFields) => {
  const map = {};
  (Array.isArray(allFields) ? allFields : []).forEach((field) => {
    if (field?.id) map[field.id] = field;
  });
  return map;
};

/** Evaluate any calculation kind → number */
export const evaluateCalculationValue = (
  calculation,
  allFields,
  valuesByFieldId
) => {
  if (!calculation) return 0;
  if (calculation.kind === CALC_KIND_FORMULA) {
    return evaluateFormulaTokens(
      calculation.tokens,
      fieldsByIdFromList(allFields),
      valuesByFieldId
    );
  }
  return getCalculationPathValue(calculation, valuesByFieldId);
};

/** Single formula: pathValue × numValue (when Num bound) */
export const computeCalculationSum = (
  calculation,
  valuesByFieldId,
  numValue
) => {
  const pathValue = getCalculationPathValue(calculation, valuesByFieldId);
  const num = Number(numValue);
  const safeNum = Number.isFinite(num) ? num : 0;
  const result = pathValue * safeNum;
  return Number.isFinite(result) ? result : 0;
};

const fieldBindsToCalculation = (field, calc) => {
  if (!field || !calc) return false;
  if (field.calculationId && field.calculationId === calc.id) return true;
  const name = String(field.calculationName || "").trim();
  return Boolean(name && name === String(calc.name || "").trim());
};

/** Normalize Sum bindings — supports multi select + legacy single */
export const normalizeSumCalculationBindings = (field) => {
  const ids = [];
  const names = [];
  const push = (id, name) => {
    const safeId = String(id || "").trim();
    const safeName = String(name || "").trim();
    if (!safeId && !safeName) return;
    if (safeId && ids.includes(safeId)) return;
    if (!safeId && safeName && names.includes(safeName)) return;
    ids.push(safeId);
    names.push(safeName);
  };
  if (Array.isArray(field?.calculationIds)) {
    const rawNames = Array.isArray(field?.calculationNames)
      ? field.calculationNames
      : [];
    field.calculationIds.forEach((id, index) => {
      push(id, rawNames[index] || "");
    });
  }
  // legacy single
  if (ids.length === 0) {
    push(field?.calculationId, field?.calculationName);
  }
  return { calculationIds: ids, calculationNames: names };
};

/**
 * Sum รวมหลายสูตร:
 * - สูตรที่มี Num ผูกอยู่ → value × Num
 * - สูตรที่ไม่มี Num → บวก value ท้ายสุด
 */
export const computeFormSumTotal = (
  calculations,
  sumField,
  allFields,
  valuesByFieldId
) => {
  const bindings = normalizeSumCalculationBindings(sumField);
  if (bindings.calculationIds.length === 0) return null;

  const selected = [];
  bindings.calculationIds.forEach((id, index) => {
    const calc = resolveCalculation(
      calculations,
      id,
      bindings.calculationNames[index]
    );
    if (calc && !selected.some((item) => item.id === calc.id)) {
      selected.push(calc);
    }
  });
  if (selected.length === 0) return null;

  let withNumTotal = 0;
  let withoutNumTotal = 0;
  selected.forEach((calc) => {
    const pathValue = evaluateCalculationValue(
      calc,
      allFields,
      valuesByFieldId
    );
    const numField = (Array.isArray(allFields) ? allFields : []).find(
      (item) =>
        String(item?.type || "") === "frmNum" &&
        fieldBindsToCalculation(item, calc)
    );
    if (numField) {
      const num = Number(valuesByFieldId?.[numField.id]);
      const safeNum = Number.isFinite(num) ? num : 0;
      withNumTotal += pathValue * safeNum;
    } else {
      withoutNumTotal += pathValue;
    }
  });
  let result = withNumTotal + withoutNumTotal;
  if (!Number.isFinite(result)) return 0;
  // ปัดเศษ: .5 ขึ้นไป → ขึ้น, ต่ำกว่า → ลง (จำนวนเต็ม)
  if (sumField?.formSumRound === true) {
    result = Math.round(result);
  }
  return result;
};
