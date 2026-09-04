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

    const wantsPagination =
      req.query.page != null ||
      req.query.limit != null ||
      req.query.folder != null ||
      req.query.search != null;
    if (!wantsPagination) {
      const rows = await FormResponse.find(filter)
        .sort({ createdAt: -1 })
        .lean()
        .exec();
      return res.send(rows);
    }

    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(10, Number.parseInt(req.query.limit, 10) || 50)
    );
    const folder = String(req.query.folder || "all").trim();
    const listFilter = {};
    if (folder === "unread") listFilter.read = false;
    if (folder === "read") listFilter.read = true;
    if (folder === "starred") listFilter.starred = true;

    const search = String(req.query.search || "").trim().slice(0, 100);
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const pattern = new RegExp(escaped, "i");
      listFilter.$or = [
        { formName: pattern },
        { "answers.label": pattern },
        { "answers.value": pattern },
      ];
    }

    const countBase = { menuBarId };
    if (formPresetId) countBase.formPresetId = formPresetId;
    const listMatch =
      Object.keys(listFilter).length > 0 ? [{ $match: listFilter }] : [];
    const [result] = await FormResponse.aggregate([
      { $match: countBase },
      {
        $facet: {
          items: [
            ...listMatch,
            { $sort: { createdAt: -1, _id: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit },
          ],
          total: [...listMatch, { $count: "value" }],
          all: [{ $count: "value" }],
          unread: [{ $match: { read: false } }, { $count: "value" }],
          read: [{ $match: { read: true } }, { $count: "value" }],
          starred: [{ $match: { starred: true } }, { $count: "value" }],
        },
      },
    ]).exec();
    const rows = Array.isArray(result?.items) ? result.items : [];
    const total = Number(result?.total?.[0]?.value || 0);
    const all = Number(result?.all?.[0]?.value || 0);
    const unread = Number(result?.unread?.[0]?.value || 0);
    const read = Number(result?.read?.[0]?.value || 0);
    const starred = Number(result?.starred?.[0]?.value || 0);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    return res.send({
      items: rows,
      pagination: {
        page: Math.min(page, totalPages),
        limit,
        total,
        totalPages,
      },
      counts: { all, unread, read, starred },
    });
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

exports.deleteFormResponses = async (req, res) => {
  try {
    const ids = Array.isArray(req.body?.ids)
      ? [...new Set(req.body.ids.map(String).filter(Boolean))].slice(0, 100)
      : [];
    if (ids.length === 0) return res.status(400).send("ids are required");
    const result = await FormResponse.deleteMany({ _id: { $in: ids } }).exec();
    res.send({ deletedCount: result.deletedCount || 0 });
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
