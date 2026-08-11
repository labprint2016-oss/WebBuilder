const Forms = require("../Models/forms");

const ANSWER_FIELD_TYPES = new Set([
  "frmInput",
  "frmNum",
  "frmTextarea",
  "frmSelect",
  "frmRadio",
  "frmCheckbox",
]);

const MAX_FIELD_LENGTH = {
  frmInput: 500,
  frmTextarea: 5000,
  frmNum: 32,
  frmSelect: 500,
  frmRadio: 500,
};

const MAX_CHECKBOX_SELECTIONS = 50;
const MAX_SUBMIT_AGE_MS = 24 * 60 * 60 * 1000;

const DEFAULT_MIN_SUBMIT_MS = 3000;

const getMinSubmitMs = () => {
  const parsed = Number(process.env.FORM_MIN_SUBMIT_MS);
  return Number.isFinite(parsed) && parsed >= 0
    ? parsed
    : DEFAULT_MIN_SUBMIT_MS;
};

const getAllowedOrigins = () => {
  const raw = String(process.env.FORM_ALLOWED_ORIGINS || "").trim();
  if (raw) {
    return raw
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5000",
    "http://127.0.0.1:5000",
  ];
};

const collectFields = (rows) => {
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

const fieldOptions = (field) => {
  if (!Array.isArray(field?.options)) return [];
  return field.options.map((item) => String(item ?? "").trim()).filter(Boolean);
};

const findChainByFieldId = (chains, fieldId) => {
  const id = String(fieldId || "").trim();
  if (!id) return null;
  return (
    (Array.isArray(chains) ? chains : []).find((chain) =>
      (Array.isArray(chain?.fieldIds) ? chain.fieldIds : []).includes(id)
    ) || null
  );
};

const isCascadedFieldUnlocked = (chain, valuesByFieldId, fieldId) => {
  const ids = Array.isArray(chain?.fieldIds) ? chain.fieldIds : [];
  const index = ids.indexOf(String(fieldId || ""));
  if (index <= 0) return true;
  for (let i = 0; i < index; i += 1) {
    if (!String(valuesByFieldId?.[ids[i]] ?? "").trim()) return false;
  }
  return true;
};

const getCascadedOptions = (chain, fieldsById, valuesByFieldId, fieldId) => {
  const ids = Array.isArray(chain?.fieldIds) ? chain.fieldIds : [];
  const index = ids.indexOf(String(fieldId || ""));
  if (index < 0) return fieldOptions(fieldsById?.[fieldId]);
  const field = fieldsById?.[fieldId];
  const base = fieldOptions(field);
  if (index === 0) return base;

  const parentPath = [];
  for (let i = 0; i < index; i += 1) {
    const parentId = ids[i];
    const value = String(valuesByFieldId?.[parentId] ?? "").trim();
    if (!value) return [];
    parentPath.push(value);
  }

  let node = chain?.rules;
  for (const key of parentPath) {
    if (!node || typeof node !== "object" || Array.isArray(node)) return [];
    node = node[key];
  }

  let allowed = [];
  if (Array.isArray(node)) {
    allowed = node.map((item) => String(item ?? "").trim()).filter(Boolean);
  } else if (node && typeof node === "object") {
    allowed = Object.keys(node);
  }

  const allowedSet = new Set(allowed);
  return base.filter((item) => allowedSet.has(item));
};

const stripControlChars = (text) =>
  String(text ?? "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");

const sanitizeText = (value, maxLen = 5000) => {
  const cleaned = stripControlChars(value)
    .replace(/<[^>]*>/g, "")
    .trim();
  return cleaned.slice(0, maxLen);
};

const sanitizeCheckboxValues = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => sanitizeText(item, 500))
    .filter(Boolean)
    .slice(0, MAX_CHECKBOX_SELECTIONS);
};

const normalizeAnswerValue = (field, rawValue) => {
  const type = String(field?.type || "");
  if (type === "frmCheckbox") {
    return sanitizeCheckboxValues(rawValue);
  }
  if (type === "frmNum") {
    const text = sanitizeText(rawValue, MAX_FIELD_LENGTH.frmNum);
    if (!text) return "";
    const num = Number(text);
    if (!Number.isFinite(num)) return "";
    return String(num);
  }
  const maxLen = MAX_FIELD_LENGTH[type] || 500;
  return sanitizeText(rawValue, maxLen);
};

const isEmptyValue = (field, value) => {
  const type = String(field?.type || "");
  if (type === "frmCheckbox") {
    return !Array.isArray(value) || value.length === 0;
  }
  return String(value ?? "").trim() === "";
};

const isValidEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());

const isValidTel = (value) => {
  const digits = String(value || "").replace(/\D/g, "");
  return digits.length >= 9 && digits.length <= 10;
};

const isValidNumberField = (value) => {
  if (String(value ?? "").trim() === "") return true;
  return Number.isFinite(Number(value));
};

const getAllowedOptions = (field, conditionalChains, fieldsById, valuesByFieldId) => {
  const type = String(field?.type || "");
  if (!["frmSelect", "frmRadio", "frmCheckbox"].includes(type)) return null;
  const chain = findChainByFieldId(conditionalChains, field.id);
  if (chain && type === "frmSelect") {
    return getCascadedOptions(chain, fieldsById, valuesByFieldId, field.id);
  }
  return fieldOptions(field);
};

const validateFieldValue = (
  field,
  value,
  conditionalChains,
  fieldsById,
  valuesByFieldId
) => {
  const type = String(field?.type || "");
  if (isEmptyValue(field, value)) return null;

  if (type === "frmInput") {
    const validationType = String(field?.formValidationType || "none");
    if (validationType === "email" && !isValidEmail(value)) {
      return "invalid email";
    }
    if (validationType === "tel" && !isValidTel(value)) {
      return "invalid tel";
    }
  }

  if (type === "frmNum" && !isValidNumberField(value)) {
    return "invalid number";
  }

  const allowed = getAllowedOptions(
    field,
    conditionalChains,
    fieldsById,
    valuesByFieldId
  );
  if (allowed != null) {
    if (type === "frmCheckbox") {
      const invalid = (Array.isArray(value) ? value : []).some(
        (item) => !allowed.includes(String(item))
      );
      if (invalid) return "invalid checkbox option";
    } else if (!allowed.includes(String(value))) {
      return "invalid option";
    }
  }

  return null;
};

const buildValuesByFieldId = (answersById) => {
  const map = {};
  Object.entries(answersById || {}).forEach(([fieldId, entry]) => {
    const type = String(entry?.type || "");
    if (type === "frmCheckbox") {
      map[fieldId] = Array.isArray(entry?.value)
        ? entry.value.join(", ")
        : "";
    } else {
      map[fieldId] = String(entry?.value ?? "");
    }
  });
  return map;
};

const parseOriginHost = (raw) => {
  try {
    if (!raw) return "";
    return new URL(raw).origin;
  } catch {
    return "";
  }
};

exports.validateOrigin = (req) => {
  const allowed = getAllowedOrigins();
  if (allowed.length === 0) return true;

  const origin = parseOriginHost(req.get("origin"));
  const referer = parseOriginHost(req.get("referer"));
  const candidate = origin || referer;
  if (!candidate) return process.env.NODE_ENV !== "production";

  return allowed.some((item) => {
    const normalized = parseOriginHost(item) || String(item).trim();
    return normalized === candidate;
  });
};

exports.validateHoneypot = (body) => {
  const hp = body?._hp;
  if (hp == null || hp === "") return true;
  return String(hp).trim() === "";
};

exports.validateTiming = (meta) => {
  const minMs = getMinSubmitMs();
  if (minMs <= 0) return true;

  const loadedAt = Number(meta?._formLoadedAt);
  if (!Number.isFinite(loadedAt) || loadedAt <= 0) return false;

  const elapsed = Date.now() - loadedAt;
  if (elapsed < minMs) return false;
  if (elapsed > MAX_SUBMIT_AGE_MS) return false;
  return true;
};

exports.loadFormPreset = async (menuBarId, formPresetId) => {
  const forms = await Forms.findOne({ menuBarId: String(menuBarId || "").trim() }).exec();
  if (!forms) return null;
  const preset = (Array.isArray(forms.formPresets) ? forms.formPresets : []).find(
    (item) => String(item?.id || "") === String(formPresetId || "")
  );
  return preset || null;
};

exports.validateAndSanitizeSubmission = async ({
  menuBarId,
  formPresetId,
  formName,
  answers,
  meta,
}) => {
  const preset = await exports.loadFormPreset(menuBarId, formPresetId);
  if (!preset) {
    return { ok: false, status: 400, message: "Invalid submission" };
  }

  const expectedName = String(preset.name || "").trim() || "Form";
  const safeFormName = sanitizeText(formName, 120) || expectedName;
  if (safeFormName !== expectedName) {
    return { ok: false, status: 400, message: "Invalid submission" };
  }

  if (!Array.isArray(answers)) {
    return { ok: false, status: 400, message: "Invalid submission" };
  }

  const rows = Array.isArray(preset.gridRows) ? preset.gridRows : [];
  const conditionalChains = Array.isArray(preset.conditionalChains)
    ? preset.conditionalChains
    : [];
  const fields = collectFields(rows).filter((field) =>
    ANSWER_FIELD_TYPES.has(String(field?.type || ""))
  );
  const fieldsById = {};
  fields.forEach((field) => {
    if (field?.id) fieldsById[field.id] = field;
  });

  const answersById = {};
  for (const item of answers) {
    const fieldId = String(item?.fieldId || "").trim();
    if (!fieldId || !fieldsById[fieldId]) {
      return { ok: false, status: 400, message: "Invalid submission" };
    }
    if (answersById[fieldId]) {
      return { ok: false, status: 400, message: "Invalid submission" };
    }
    answersById[fieldId] = {
      fieldId,
      type: String(item?.type || fieldsById[fieldId]?.type || ""),
      label: item?.label,
      value: normalizeAnswerValue(fieldsById[fieldId], item?.value),
    };
  }

  const valuesByFieldId = buildValuesByFieldId(answersById);

  for (const field of fields) {
    const fieldId = field.id;
    const entry = answersById[fieldId];
    const chain = findChainByFieldId(conditionalChains, fieldId);
    const unlocked =
      !chain || isCascadedFieldUnlocked(chain, valuesByFieldId, fieldId);
    const value = entry
      ? entry.value
      : field.type === "frmCheckbox"
        ? []
        : "";

    if (field.formRequired === true && unlocked && isEmptyValue(field, value)) {
      return { ok: false, status: 400, message: "Invalid submission" };
    }

    if (!isEmptyValue(field, value)) {
      const fieldError = validateFieldValue(
        field,
        value,
        conditionalChains,
        fieldsById,
        valuesByFieldId
      );
      if (fieldError) {
        return { ok: false, status: 400, message: "Invalid submission" };
      }
    }
  }

  const sanitizedAnswers = fields.map((field) => {
    const entry = answersById[field.id];
    const label =
      typeof field?.label === "string" && field.label.trim()
        ? sanitizeText(field.label, 200)
        : "Field";
    const value = entry
      ? entry.value
      : field.type === "frmCheckbox"
        ? []
        : "";
    return {
      fieldId: field.id,
      type: field.type,
      label,
      value,
    };
  });

  const safeMeta =
    meta && typeof meta === "object" && !Array.isArray(meta)
      ? {
          href: sanitizeText(meta.href, 2000),
          submittedAt: sanitizeText(meta.submittedAt, 64),
        }
      : {};

  return {
    ok: true,
    data: {
      formName: expectedName,
      answers: sanitizedAnswers,
      meta: safeMeta,
    },
  };
};
