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

formResponseSchema.index({ menuBarId: 1, createdAt: -1 });
formResponseSchema.index({ menuBarId: 1, formPresetId: 1, createdAt: -1 });
formResponseSchema.index({ menuBarId: 1, read: 1, createdAt: -1 });
formResponseSchema.index({ menuBarId: 1, starred: 1, createdAt: -1 });

module.exports = model("FormResponse", formResponseSchema);
