const multer = require("multer")


const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,"./uploads/")
    },filename:function(req,file,cb){
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random()*1E9)
        cb(null,uniqueSuffix + "<>" + file.originalname)
    }
})


const fileFilter = (req,file,cb)=>{
    if(["image/jpeg","image/png","image/webp","image/jpg","image/gif"].includes(file.mimetype)){
        cb(null,true)
    }else{
        cb(new Error("Only image files are allowed! (.jpeg, .jpg, png, .webp, .gif)"),false)
    }
}

const upload = multer({storage:storage,fileFilter:fileFilter}).single("image")

module.exports = upload