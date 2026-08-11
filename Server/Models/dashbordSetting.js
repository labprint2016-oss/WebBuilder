const { Schema, model } = require("mongoose");

/** สี Dashboard — เก็บทั้งชุดเป็น JSON (preset + custom) */
const dashbordSettingSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "default",
      index: true,
    },
    /** { preset: "default"|"custom", custom: { light, dark } } */
    setting: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = model("DashbordSetting", dashbordSettingSchema);
