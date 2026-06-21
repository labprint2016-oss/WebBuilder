const mongoose = require('mongoose');



const themeSchema = new mongoose.Schema({

   textHeading:{
    type:Object,
    default: { value: "font-merriweather", label: "Merriweather", id: "1" }
   },
   text:{
    type:Object,
    default: { value: "font-merriweather", label: "Merriweather", id: "1" }
   },
   mainColor:{
    type:Array,
    default:["#881337","#be123c","#f43f5e"]
   },
   textColor:{
    type:Array,
    default:["#365314","#4d7c0f","#84cc16"]
   },
   otherColor:{
    type:Array,
    default:["#ffe4e6","#fecdd3","#fb7185","#e11d48","#9f1239","#ecfccb","#d9f99d","#a3e635","#65a30d","#3f6212"]
   }
        
    
})


module.exports = mongoose.model("Theme",themeSchema)


 