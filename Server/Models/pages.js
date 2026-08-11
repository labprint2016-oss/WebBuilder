const mongoose = require('mongoose');



const pageSchema = mongoose.Schema({
    pageName:{
        type:String,
        required: true,
        unique:true,
        trim: true,
        minlength:3
    },
    layouts:{
        type:Object,
        default:[null]
    },
    latestID:{
        type:Number,
        default:0
    },
    isDefault:{
        type:Boolean,
        default:false
    },
    menuPresetId:{
        type:String,
        default:""
    },
    heroPresetId:{
        type:String,
        default:""
    },
    /** PopUp ของหน้า — ตั้งค่าจาก panel ตั้งค่าหน้า */
    pagePopup:{
        type:mongoose.Schema.Types.Mixed,
        default:() => ({
            enabled:false,
            src:"",
            brightness:0,
            borderRadius:12,
            animationType:"fade-in",
            linkUrl:"",
            linkTarget:"_self",
        })
    }
},{timestamps:true})


module.exports = mongoose.model("Pages",pageSchema)