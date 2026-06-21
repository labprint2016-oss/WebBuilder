const mongoose = require("mongoose")






const titleSchema = new mongoose.Schema({
    text:{
        type:String,
        default:"Explore The World Using Virtual Reality.",
    },
    bold:{
        type:Boolean,
        default:true,
    },
    color:{
        type:mongoose.Schema.Types.Mixed,
        default:{type:"mainColor",index:0}
    },
    size:{
        type:Number,
        default:25,
    }

},{_id:false})

const imgTopLayerDesktop = new mongoose.Schema({
    image:{
        type:String,
        default:""
    },
    positionX:{
        type:Number,
        default:0
    },positionY:{
        type:Number,
        default:0
    },
    size:{
        type:Number,
        default:250
    }
},{_id:false})

const imgTopLayerMobile = new mongoose.Schema({
    image:{
        type:String,
        default:""
    },
    positionX:{
        type:Number,
        default:0
    },positionY:{
        type:Number,
        default:0
    },
    size:{
        type:Number,
        default:200
    }
},{_id:false})


const subTitleSchema = new mongoose.Schema({
    text:{
        type:String,
        default:"From Ideas To Reality.",
    },
    bold:{
        type:Boolean,
        default:true,
    },
    color:{
        type:mongoose.Schema.Types.Mixed,
        default:{type:"mainColor",index:1}
    },
    size:{
        type:Number,
        default:18,
    }

},{_id:false})

const textSchema = new mongoose.Schema({
    text:{
        type:String,
        default:"Duis aute Irure dolor in reprehenderit in voluptate velit esse cillum dolore fugiat nulla pariatur.",
    },
    bold:{
        type:Boolean,
        default:false,
    },
    color:{
        type:mongoose.Schema.Types.Mixed,
        default:"#ffffff"
    },
    size:{
        type:Number,
        default:15,
    }

},{_id:false})

const btnSchema = new mongoose.Schema({
    text:{
        type:String,
        default:"Discover More",
    },
    bold:{
        type:Boolean,
        default:false,
    },
    color:{
        type:mongoose.Schema.Types.Mixed,
        default:"#ffffff"
    },
    size:{
        type:Number,
        default:15,
    },
    backgroundColor:{
        type:mongoose.Schema.Types.Mixed,
        default:{type:"mainColor",index:0}
    },icon:{
        type:String,
        default:"Bluetooth"
    },
    url:{
        type:String,
        default:""
    },
    target:{
        type:String,
        default:"_self"
    }

},{_id:false})

const designDesktopSchema = new mongoose.Schema({
    degree:{
        type:Number,
        default:0,
    },
    backgroundColor:{
        type:mongoose.Schema.Types.Mixed,
        default:"#000000"
    },
    backgroundGradient:{
        type:[mongoose.Schema.Types.Mixed],
        default:[{type:"mainColor",index:0},{type:"mainColor",index:1}],
        set:(arr)=>{
            const src = Array.isArray(arr)?arr:[]
            return Array.from({length:2},(_,i)=>src[i])
        },
        validate:{
            validator:(arr)=> Array.isArray(arr) && arr.length === 2,
            message:"You must have 2 colors only in backgound color gradient!!!"
        }
    },
    opacity:{type:Number,default:255},
    opacityGradient:{type:Array,default:[255,255]},
    isTitle:{
        type:Boolean,
        default:true,
    },isGradient:{
        type:Boolean,
        default:false,
    },
    isSubTitle:{
        type:Boolean,
        default:true,
    },
    isText:{
        type:Boolean,
        default:true,
    },
    isButton:{
        type:Boolean,
        default:true,
    },
    isImageTopLayer:{
        type:Boolean,
        default:true,
    },
    layout:{
        type:String,
        default:"left",
    },
    title:{
        type:titleSchema,
        default:() => ({})
    },
    subTitle:{
        type:subTitleSchema,
        default:() => ({})
    },
    text:{
        type:textSchema,
        default:() => ({})
    },
    button:{
        type:btnSchema,
        default:()=>({})
    },
    backgroundImage:{
        type:String,
        default:""
    },
    imageTopLayer1:{
        type:imgTopLayerDesktop,
        default:()=>({})
    },
    imageTopLayer2:{
        type:imgTopLayerDesktop,
        default:()=>({})
    }


},{_id:false})

const designMobileSchema = new mongoose.Schema({
    degree:{
        type:Number,
        default:0,
    },
    backgroundColor:{
        type:mongoose.Schema.Types.Mixed,
        default:"#000000"
    },
    backgroundGradient:{
        type:[mongoose.Schema.Types.Mixed],
        default:[{type:"mainColor",index:0},{type:"mainColor",index:1}],
        set:(arr)=>{
            const src = Array.isArray(arr)?arr:[]
            return Array.from({length:2},(_,i)=>src[i])
        },
        validate:{
            validator:(arr)=> Array.isArray(arr) && arr.length === 2,
            message:"You must have 2 colors only in backgound color gradient!!!"
        }
    },
    opacity:{type:Number,default:255},
    opacityGradient:{type:Array,default:[255,255]},
    isTitle:{
        type:Boolean,
        default:true,
    },isGradient:{
        type:Boolean,
        default:false,
    },
    isSubTitle:{
        type:Boolean,
        default:true,
    },
    isText:{
        type:Boolean,
        default:true,
    },
    isButton:{
        type:Boolean,
        default:true,
    },
    isImageTopLayer:{
        type:Boolean,
        default:true,
    },
    layout:{
        type:String,
        default:"left",
    },
    title:{
        type:titleSchema,
        default:() => ({})
    },
    subTitle:{
        type:subTitleSchema,
        default:() => ({})
    },
    text:{
        type:textSchema,
        default:() => ({})
    },
    button:{
        type:btnSchema,
        default:()=>({})
    },
    backgroundImage:{
        type:String,
        default:""
    },
    imageTopLayer1:{
        type:imgTopLayerMobile,
        default:()=>({})
    },


},{_id:false})

const heroSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true
    },
    slideAmount:{
        type:Number,
        default:1
    },
    desktop:{
        type:[designDesktopSchema],
        default: Array.from({length:5},()=>({})),
        set:(arr)=>{
            const src = Array.isArray(arr)?arr:[]
            return Array.from({length:5},(_,i)=>src[i]||{})
        },
        validate:{
            validator:(arr)=>Array.isArray(arr) && arr.length === 5,
            message:"You must have 5 desktop designs only!!!"
        }
    },
    mobile:{
        type:[designMobileSchema],
        default: Array.from({length:5},()=>({})),
        set:(arr)=>{
            const src = Array.isArray(arr)?arr:[]
            return Array.from({length:5},(_,i)=>src[i]||{})
        },
        validate:{
            validator:(arr)=>Array.isArray(arr) && arr.length === 5,
            message:"You must have 5 mobile designs only!!!"
        }

    },
    divider:{
        type:String,
        default:"-"
    },dividerColor:{
        type:mongoose.Schema.Types.Mixed,
        default:"#FFFFFF"
    },dividerPosition:{
        type:Number,
        default:0
    },
    desktopHeight:{
        type:Number,
        default:500
    },mobileHeight:{
        type:Number,
        default:500
    },
},{timestamps:true})



module.exports = mongoose.model("heros",heroSchema)