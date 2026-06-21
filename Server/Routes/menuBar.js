const express = require("express")
const {createMenuBar,getMenuBar,updateMenuBar} = require("../Controllers/menuBar")

const router = express.Router()

router.post("/createMenuBar",createMenuBar)
router.get("/getMenuBar/:id",getMenuBar)
router.put("/updateMenuBar/:id",updateMenuBar)


module.exports = router