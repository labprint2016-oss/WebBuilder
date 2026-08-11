const mongoose = require("mongoose");
const DashbordSetting = require("../Models/dashbordSetting");

const DEFAULT_KEY = "default";

const resolveSettingPayload = (body) => {
  if (body?.setting && typeof body.setting === "object") return body.setting;
  // รองรับชื่อฟิลด์เก่าช่วง migrate
  if (body?.chrome && typeof body.chrome === "object") return body.chrome;
  return null;
};

exports.getDashbordSetting = async (req, res) => {
  try {
    const key = String(req.params.key || DEFAULT_KEY).trim() || DEFAULT_KEY;
    let doc = await DashbordSetting.findOne({ key }).exec();

    if (!doc) {
      // migrate จาก collection เก่า DashboardChrome (ถ้ามี)
      let legacyChrome = null;
      try {
        const legacy = await mongoose.connection.db
          .collection("dashboardchromes")
          .findOne({ key });
        if (legacy?.chrome && typeof legacy.chrome === "object") {
          legacyChrome = legacy.chrome;
        }
      } catch (_) {
        /* ignore */
      }

      doc = await DashbordSetting.create({
        key,
        setting: legacyChrome || {},
      });
    }

    res.send(doc);
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
};

exports.updateDashbordSetting = async (req, res) => {
  try {
    const key = String(req.params.key || DEFAULT_KEY).trim() || DEFAULT_KEY;
    const setting = resolveSettingPayload(req.body || {});
    if (!setting) {
      return res.status(400).send("setting JSON required");
    }
    const doc = await DashbordSetting.findOneAndUpdate(
      { key },
      { setting },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).exec();
    res.send(doc);
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
};
