const express = require('express');
const {createTheme,getTheme,updateTheme} = require("../Controllers/theme")


const router = express.Router();


router.post("/createTheme",createTheme)
router.get("/getTheme/:id",getTheme)
router.put("/updateTheme/:id",updateTheme)


module.exports = router;