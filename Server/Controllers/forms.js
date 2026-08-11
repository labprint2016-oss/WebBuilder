const Forms = require("../Models/forms");

const DEFAULT_PRESET = {
  id: "form-preset-1",
  name: "Form 1",
  gridRows: [],
  selectedRowId: null,
  gridPreset: 1,
  conditionalChains: [],
  calculations: [],
};

const sanitizePreset = (preset, index) => {
  const safeId = String(preset?.id || `form-preset-${index + 1}`);
  const safeName = String(preset?.name || `Form ${index + 1}`);
  const safeGridRows = Array.isArray(preset?.gridRows) ? preset.gridRows : [];
  const safeSelectedRowId =
    typeof preset?.selectedRowId === "string" && preset.selectedRowId.trim()
      ? preset.selectedRowId
      : null;
  const safeGridPreset = Number.isFinite(Number(preset?.gridPreset))
    ? Math.max(1, Math.round(Number(preset.gridPreset)))
    : 1;
  const safeConditionalChains = Array.isArray(preset?.conditionalChains)
    ? preset.conditionalChains
    : [];
  const safeCalculations = Array.isArray(preset?.calculations)
    ? preset.calculations
    : [];

  return {
    id: safeId,
    name: safeName,
    gridRows: safeGridRows,
    selectedRowId: safeSelectedRowId,
    gridPreset: safeGridPreset,
    conditionalChains: safeConditionalChains,
    calculations: safeCalculations,
  };
};

const normalizeFormsPayload = (payload = {}) => {
  const incomingPresets = Array.isArray(payload.formPresets) ? payload.formPresets : [];
  const formPresets =
    incomingPresets.length > 0
      ? incomingPresets.map((preset, index) => sanitizePreset(preset, index))
      : [{ ...DEFAULT_PRESET }];

  const hasActive = formPresets.some((preset) => preset.id === payload.activeFormPresetId);
  const activeFormPresetId = hasActive ? payload.activeFormPresetId : formPresets[0].id;

  const hasDefault = formPresets.some((preset) => preset.id === payload.defaultFormPresetId);
  const defaultFormPresetId = hasDefault ? payload.defaultFormPresetId : activeFormPresetId;

  return {
    formPresets,
    activeFormPresetId,
    defaultFormPresetId,
  };
};

exports.getForms = async (req, res) => {
  try {
    const menuBarId = String(req.params.menuBarId || "").trim();
    if (!menuBarId) return res.status(400).send("menuBarId is required");

    let forms = await Forms.findOne({ menuBarId }).exec();
    if (!forms) {
      forms = await Forms.create({
        menuBarId,
        formPresets: [{ ...DEFAULT_PRESET }],
        activeFormPresetId: DEFAULT_PRESET.id,
        defaultFormPresetId: DEFAULT_PRESET.id,
      });
    }

    res.send(forms);
  } catch (error) {
    res.status(500).send("Server Error");
    console.log(error);
  }
};

exports.updateForms = async (req, res) => {
  try {
    const menuBarId = String(req.params.menuBarId || "").trim();
    if (!menuBarId) return res.status(400).send("menuBarId is required");

    const normalized = normalizeFormsPayload(req.body || {});
    const forms = await Forms.findOneAndUpdate(
      { menuBarId },
      {
        menuBarId,
        ...normalized,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).exec();

    res.send(forms);
  } catch (error) {
    res.status(500).send("Server Error");
    console.log(error);
  }
};
