/** Conditional Select — max 4 fields per chain, multiple chains per form preset */

export const MAX_CONDITIONAL_SELECTS = 4;

const newChainId = () =>
  `cond-chain-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

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

export const fieldOptions = (field) => {
  if (!Array.isArray(field?.options)) return [];
  return field.options.map((item) => String(item ?? "").trim()).filter(Boolean);
};

const sanitizeLeafArray = (node) => {
  if (!Array.isArray(node)) return [];
  return node.map((item) => String(item ?? "").trim()).filter(Boolean);
};

/** depthLeft = fieldIds.length - 1 (object layers before leaf arrays) */
const sanitizeRulesNode = (node, depthLeft) => {
  if (depthLeft <= 0) return sanitizeLeafArray(node);
  if (!node || typeof node !== "object" || Array.isArray(node)) return {};
  const next = {};
  Object.keys(node).forEach((key) => {
    const safeKey = String(key ?? "").trim();
    if (!safeKey) return;
    if (depthLeft === 1) {
      next[safeKey] = sanitizeLeafArray(node[key]);
      return;
    }
    next[safeKey] = sanitizeRulesNode(node[key], depthLeft - 1);
  });
  return next;
};

export const normalizeConditionalChain = (raw, index = 0) => {
  const fieldIds = (Array.isArray(raw?.fieldIds) ? raw.fieldIds : [])
    .map((id) => String(id || "").trim())
    .filter(Boolean)
    .slice(0, MAX_CONDITIONAL_SELECTS);
  const unique = [];
  fieldIds.forEach((id) => {
    if (!unique.includes(id)) unique.push(id);
  });
  const depth = Math.max(0, unique.length - 1);
  return {
    id: String(raw?.id || `cond-chain-${index + 1}`).trim() || newChainId(),
    fieldIds: unique,
    rules: depth > 0 ? sanitizeRulesNode(raw?.rules, depth) : {},
  };
};

export const normalizeConditionalChains = (raw) => {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item, index) => normalizeConditionalChain(item, index))
    .filter((chain) => chain.fieldIds.length >= 2);
};

export const createEmptyConditionalChain = (seedFieldId = "") => {
  const seed = String(seedFieldId || "").trim();
  return {
    id: newChainId(),
    fieldIds: seed ? [seed] : [],
    rules: {},
  };
};

export const findChainByFieldId = (chains, fieldId) => {
  const id = String(fieldId || "").trim();
  if (!id) return null;
  return (
    (Array.isArray(chains) ? chains : []).find((chain) =>
      (Array.isArray(chain?.fieldIds) ? chain.fieldIds : []).includes(id)
    ) || null
  );
};

export const fieldIdsUsedByOtherChains = (chains, exceptChainId = "") => {
  const used = new Set();
  (Array.isArray(chains) ? chains : []).forEach((chain) => {
    if (exceptChainId && chain?.id === exceptChainId) return;
    (Array.isArray(chain?.fieldIds) ? chain.fieldIds : []).forEach((id) => {
      if (id) used.add(String(id));
    });
  });
  return used;
};

/** Options available for field at chain index, given parent selections */
export const getCascadedOptions = (chain, fieldsById, valuesByFieldId, fieldId) => {
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

  const baseSet = new Set(base);
  return allowed.filter((item) => baseSet.has(item));
};

/** Unlocked when all parents in the chain have a selected value */
export const isCascadedFieldUnlocked = (chain, valuesByFieldId, fieldId) => {
  const ids = Array.isArray(chain?.fieldIds) ? chain.fieldIds : [];
  const index = ids.indexOf(String(fieldId || ""));
  if (index <= 0) return true;
  for (let i = 0; i < index; i += 1) {
    if (!String(valuesByFieldId?.[ids[i]] ?? "").trim()) return false;
  }
  return true;
};

export const getDescendantFieldIds = (chain, fieldId) => {
  const ids = Array.isArray(chain?.fieldIds) ? chain.fieldIds : [];
  const index = ids.indexOf(String(fieldId || ""));
  if (index < 0) return [];
  return ids.slice(index + 1);
};

/** Toggle a value in nested rules at parentPath → next option */
export const toggleRuleOption = (
  rules,
  parentPath,
  optionValue,
  enabled,
  remainingDepth
) => {
  const path = Array.isArray(parentPath) ? parentPath : [];
  const option = String(optionValue ?? "").trim();
  if (!option || remainingDepth < 1) {
    return rules && typeof rules === "object" ? rules : {};
  }

  // remainingDepth is relative to the destination node (not decremented while walking)
  const cloneLevel = (node, pathIndex) => {
    if (pathIndex < path.length) {
      const key = path[pathIndex];
      const current =
        node && typeof node === "object" && !Array.isArray(node) ? { ...node } : {};
      current[key] = cloneLevel(current[key], pathIndex + 1);
      return current;
    }

    if (remainingDepth === 1) {
      const list = Array.isArray(node)
        ? node.map((item) => String(item ?? "").trim()).filter(Boolean)
        : [];
      const set = new Set(list);
      if (enabled) set.add(option);
      else set.delete(option);
      return Array.from(set);
    }

    const current =
      node && typeof node === "object" && !Array.isArray(node) ? { ...node } : {};
    if (enabled) {
      if (current[option] == null) {
        current[option] = remainingDepth === 2 ? [] : {};
      }
    } else {
      delete current[option];
    }
    return current;
  };

  return cloneLevel(rules, 0);
};

export const isRuleOptionEnabled = (rules, parentPath, optionValue, remainingDepth) => {
  const path = Array.isArray(parentPath) ? parentPath : [];
  const option = String(optionValue ?? "").trim();
  if (!option) return false;
  let node = rules;
  for (const key of path) {
    if (!node || typeof node !== "object" || Array.isArray(node)) return false;
    node = node[key];
  }
  if (remainingDepth === 1) {
    if (!Array.isArray(node)) return false;
    return node.map(String).includes(option);
  }
  if (!node || typeof node !== "object" || Array.isArray(node)) return false;
  return Object.prototype.hasOwnProperty.call(node, option);
};
