const FormResponse = require("../Models/formResponses");
const {
  validateAndSanitizeSubmission,
  validateHoneypot,
  validateOrigin,
  validateTiming,
} = require("../Utils/formSubmissionSecurity");

exports.createFormResponse = async (req, res) => {
  try {
    const menuBarId = String(req.body?.menuBarId || "").trim();
    const formPresetId = String(req.body?.formPresetId || "").trim();
    if (!menuBarId) return res.status(400).send("menuBarId is required");
    if (!formPresetId) return res.status(400).send("formPresetId is required");

    if (!validateOrigin(req)) {
      return res.status(403).send("Invalid submission");
    }
    if (!validateHoneypot(req.body)) {
      return res.status(400).send("Invalid submission");
    }
    const meta =
      req.body?.meta && typeof req.body.meta === "object" ? req.body.meta : {};
    if (!validateTiming(meta)) {
      return res.status(400).send("Invalid submission");
    }

    const validated = await validateAndSanitizeSubmission({
      menuBarId,
      formPresetId,
      formName: req.body?.formName,
      answers: req.body?.answers,
      meta,
    });
    if (!validated.ok) {
      return res.status(validated.status || 400).send(validated.message);
    }

    const doc = await FormResponse.create({
      menuBarId,
      formPresetId,
      formName: validated.data.formName,
      answers: validated.data.answers,
      meta: validated.data.meta,
      read: false,
      starred: false,
    });

    res.status(201).send(doc);
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
};

exports.getFormResponses = async (req, res) => {
  try {
    const menuBarId = String(req.params.menuBarId || "").trim();
    if (!menuBarId) return res.status(400).send("menuBarId is required");

    const formPresetId = String(req.query.formPresetId || "").trim();
    const filter = { menuBarId };
    if (formPresetId) filter.formPresetId = formPresetId;

    const rows = await FormResponse.find(filter).sort({ createdAt: -1 }).exec();
    res.send(rows);
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
};

exports.deleteFormResponse = async (req, res) => {
  try {
    const id = String(req.params.id || "").trim();
    if (!id) return res.status(400).send("id is required");

    const deleted = await FormResponse.findByIdAndDelete(id).exec();
    if (!deleted) return res.status(404).send("Not found");
    res.send(deleted);
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
};

exports.updateFormResponse = async (req, res) => {
  try {
    const id = String(req.params.id || "").trim();
    if (!id) return res.status(400).send("id is required");

    const updates = {};
    if (typeof req.body?.read === "boolean") {
      updates.read = req.body.read;
    }
    if (typeof req.body?.starred === "boolean") {
      updates.starred = req.body.starred;
    }
    if (req.body?.meta && typeof req.body.meta === "object") {
      updates.meta = req.body.meta;
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).send("No valid fields to update");
    }

    const doc = await FormResponse.findByIdAndUpdate(id, updates, {
      new: true,
    }).exec();
    if (!doc) return res.status(404).send("Not found");
    res.send(doc);
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
};
