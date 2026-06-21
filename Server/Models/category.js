const mongoose = require("mongoose")


const cateSchema = new mongoose.Schema({

    image:{
        type:String,
        require:true
    },
    title:{
        type:String,
        require:true,
        minLength:[3,"Title must have at least 3 chsracters."]
    },

},{timestamps:true})

module.exports = mongoose.model("Categories",cateSchema)