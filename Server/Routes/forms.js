const express = require("express");
const { getForms, updateForms } = require("../Controllers/forms");

const router = express.Router();

router.get("/getForms/:menuBarId", getForms);
router.put("/updateForms/:menuBarId", updateForms);

module.exports = router;
