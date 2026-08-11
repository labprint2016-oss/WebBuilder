const express = require("express");
const {
  createFormResponse,
  getFormResponses,
  deleteFormResponse,
  updateFormResponse,
} = require("../Controllers/formResponses");

const router = express.Router();

router.post("/createFormResponse", createFormResponse);
router.get("/getFormResponses/:menuBarId", getFormResponses);
router.put("/updateFormResponse/:id", updateFormResponse);
router.delete("/deleteFormResponse/:id", deleteFormResponse);

module.exports = router;
