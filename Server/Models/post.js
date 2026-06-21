const {Schema,model} = require('mongoose');

const titleSchema = new Schema({

    text:{
        type:String,
        required:[true,"Please provide title text"],
        minLength:[3,"Title text must have at least 3 character"],
    },size:{
        type:Number,
        default:18,
    },bold:{
        type:Boolean,
        default:true
    },padding:{
        type:Number,
        default:8,
    },
},{_id:false})

const descriptionSchema = new Schema({

    text:{
        type:String,
        required:[true,"Please provide title text"],
        minLength:[5,"Text must have at least 5 character"],
    },size:{
        type:Number,
        default:13,
    },padding:{
        type:Number,
        default:0,
    },
},{_id:false})

const linkSchema = new Schema({

    url:{
        type:String,
        default:""
    },
    target:{
        type:String,
        default:"_self"
    }

},{_id:false})

const columnSchema = new Schema({

   icon:{
        type:String,
        default:"Bluetooth"
   },
   text:{
    type:String,
    default:""
   },
   color:{default:"#ffffff",type:Schema.Types.Mixed},
   opacity:{type:Number,default:255},

},{_id:false})

const buttonSchema = new Schema({

    icon:{
         type:String,
         default:"Bluetooth"
    },
    text:{
     type:String,
     default:"ปุ่มกด"
    },
    textColor:{default:"#ffffff",type:Schema.Types.Mixed},
    buttonColor:{default:"#ffffff",type:Schema.Types.Mixed},
    link:{
        type:linkSchema,
        default:{url:"",target:"_self"}
    }
    ,textSize:{
        type:Number,
        default:13
    },opacity:{type:Number,default:255},
    bold:{
        type:Boolean,
        default:false
    }
 
 },{_id:false})


const defaultArray = (lenght)=>{
    return Array.from({length:lenght},()=>({}))
}



const postSchema = new Schema({

    title:{
        type:titleSchema,
        required:[true,"Please provide title data"]
    },
    category:{
        type:[String],
        validate:{
            validator:(arr) => arr.length > 0 && Array.isArray(arr),
            message:"Categories must be an array of exactly 1 items"
        }
    },
    image:{
        type:String,
    },
    height:{
        type:Number,
        default:200,
        min:0,
    },width:{
        type:Number,
        default:400,
        min:0,
    },borderRadius:{
        type:Number,
        default:0,
        min:0,
    },
    imageType:{
        type:String,
        default:"รูปภาพ"
    },
    link:{
        type:linkSchema,
        required:[true,"Please provide link data"]
    },
    isColumn:{
        type:Boolean,
        default:false
    },
    columnAmount:{
        type:Number,
        default:2,
        min:2,
        max:4
    },
    columns:{
        type:[columnSchema],
        default:() => defaultArray(4),
        set: (arr)=>{
            const src = Array.isArray(arr) ? arr : []
            return Array.from({length:4},(_,i)=>src[i] || {})
        },
        validate:{
            validator:(arr) => Array.isArray(arr) && arr.length ===4,
            message:"Columns must be an array of exactly 4 items"
        }
    }
    ,description:{
        type:descriptionSchema,
        required:[true,"Please provide description"],
    },
    isButton:{
        type:Boolean,
        default:false
    },
    buttonAmount:{
        type:Number,
        default:1,
        min:1,
        max:2
    },
    buttons:{
        type:[buttonSchema],
        default:() => defaultArray(2),
        set:(arr)=>{
            const src = Array.isArray(arr) ? arr:[]
            return Array.from({length:2},(_,i)=>src[i]||{})
        },
        validate:{
            validator:(arr) => Array.isArray(arr) && arr.length === 2,
            message:"Buttons must be an array of exactly 2 items"
        }
    },
    imageDecoration:{
        type:Boolean,
        default:false
    },decorationType:{
        type:String,
        default:"แถบ"
    },
    color:{
        type:Schema.Types.Mixed,
        default:"#ffffff"
    },text:{
        type:String,
        default:"เพิ่มข้อความที่นี่"
    },size:{    
        type:Number,
        default:13
    },position:{
        type:String,
        default:"center"
    },
    textColor:{
        type:Schema.Types.Mixed,
        default:"#ffffff"
    },opacity:{type:Number,default:255},
    bold:{
        type:Boolean,
        default:false
    },
    


},{ timestamps: true });



module.exports = model("Post", postSchema);