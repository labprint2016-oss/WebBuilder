const express = require("express");
const {
  getDashbordSetting,
  updateDashbordSetting,
} = require("../Controllers/dashbordSetting");

const router = express.Router();

router.get("/getDashbordSetting", getDashbordSetting);
router.get("/getDashbordSetting/:key", getDashbordSetting);
router.put("/updateDashbordSetting", (req, res) => {
  req.params.key = "default";
  return updateDashbordSetting(req, res);
});
router.put("/updateDashbordSetting/:key", updateDashbordSetting);

module.exports = router;
