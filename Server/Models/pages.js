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
    }
},{timestamps:true})


module.exports = mongoose.model("Pages",pageSchema)