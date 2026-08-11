const { Schema, model } = require("mongoose");

const formResponseSchema = new Schema(
  {
    menuBarId: {
      type: String,
      required: true,
      index: true,
    },
    formPresetId: {
      type: String,
      required: true,
      index: true,
    },
    formName: {
      type: String,
      default: "",
    },
    answers: {
      type: [Schema.Types.Mixed],
      default: [],
    },
    meta: {
      type: Schema.Types.Mixed,
      default: {},
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    starred: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "formResponses",
  }
);

module.exports = model("FormResponse", formResponseSchema);
