const express = require("express")
const {createHero,listHeros,deleteHero,editHero,getHero,updateDesign} = require("../Controllers/hero")
const multer = require("../MiddleWare/manageImg")
const fs = require("fs");
const path = require("path");

const router = express.Router()

router.post("/createHero",createHero)
router.get("/listHeros",listHeros)
router.get("/getHero/:id",getHero)
router.delete("/deleteHero",deleteHero)
router.put("/editHero/:id",editHero)
router.put("/updateDesign/:id",multer,updateDesign)
router.post("/uploadImage",multer,(req,res)=>{
    try{
        res.send(req.file)
    }catch(err){
        res.status(500).send("Server Error")
        console.log(err);
    }
})

router.get("/listImages",(req,res)=>{
    try{
        const dirPath = path.join(__dirname,"../uploads")
        console.log(dirPath);
        const images = fs.readdirSync(dirPath).map(file=>file)
        res.send(images.reverse())
    }catch(err){
        res.status(500).send("Server Error")
        console.log(err);
    }
})

router.get("/getImage/:filename", async(req,res)=>{
    try{
        const dirPath = path.join(__dirname,"../uploads")
        const filename = req.params.filename
        const filePath = path.join(dirPath,filename)
        if(!fs.existsSync(filePath)){
            return res.status(404).send("Not Found")
        }
        res.send(filePath)
    }catch(err){
        res.status(500).send("Server Error")
        console.log(err);
    }
})
router.delete("/deleteImage/:filename",async (req,res)=>{
    try{
        const dirPath = path.join(__dirname,"../uploads")
        // Decode filename in case it was URL encoded (handles special characters like <>)
        const filename = decodeURIComponent(req.params.filename)
        const filePath = path.join(dirPath,filename)
        
        console.log("Delete request - filename:", filename)
        console.log("Delete request - filePath:", filePath)
        
        // Check if file exists before trying to delete
        if(!fs.existsSync(filePath)){
            console.log("File not found:", filePath)
            return res.status(404).send(`File not found: ${filename}`)
        }
        
        await fs.promises.unlink(filePath)
        console.log("File deleted successfully:", filePath)
        res.send(`${filename} ถูกลบแล้ว`)
    }catch(err){
        console.error("Error deleting file:", err)
        res.status(500).send("Server Error: " + err.message)
    }
})


module.exports = router