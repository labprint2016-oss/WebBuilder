const express = require("express")
const {createCate,listCates,deleteCate,editCate} = require("../Controllers/cate")
const multer = require("../MiddleWare/manageImg")


const router = express.Router()

router.post("/createCate",multer,createCate)
router.get("/listCates",listCates)
router.delete("/deleteCate",deleteCate)
router.put("/editCate/:id",multer,editCate)

module.exports = router