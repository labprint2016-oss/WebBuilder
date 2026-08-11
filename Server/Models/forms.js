const { Schema, model } = require("mongoose");

const formPresetSchema = new Schema(
  {
    id: {
      type: String,
      default: "form-preset-1",
    },
    name: {
      type: String,
      default: "Form 1",
    },
    gridRows: {
      type: [Schema.Types.Mixed],
      default: [],
    },
    selectedRowId: {
      type: String,
      default: null,
    },
    gridPreset: {
      type: Number,
      default: 1,
    },
    conditionalChains: {
      type: [Schema.Types.Mixed],
      default: [],
    },
    calculations: {
      type: [Schema.Types.Mixed],
      default: [],
    },
  },
  { _id: false }
);

const formsSchema = new Schema(
  {
    menuBarId: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    formPresets: {
      type: [formPresetSchema],
      default: [
        {
          id: "form-preset-1",
          name: "Form 1",
          gridRows: [],
          selectedRowId: null,
          gridPreset: 1,
          conditionalChains: [],
          calculations: [],
        },
      ],
    },
    activeFormPresetId: {
      type: String,
      default: "form-preset-1",
    },
    defaultFormPresetId: {
      type: String,
      default: "form-preset-1",
    },
  },
  { timestamps: true, collection: "forms" }
);

module.exports = model("Forms", formsSchema);
