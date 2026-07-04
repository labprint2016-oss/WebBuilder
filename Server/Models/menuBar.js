const {Schema,model} = require("mongoose")

const menuBarDesktop = new Schema({

    menuFontSize:{
        type:Number,
        default:15,
    }, menuFontWeight:{
        type:Number,
        min:300,
        max:800,
        default:400,
    },menuColor:{
        type:Schema.Types.Mixed,
        default:"#000000",
    },menuColorOpacity:{
        type:Number,
        min:0,
        max:255,
        default:255,
    },activeMenuColor:{
        type:Schema.Types.Mixed,
        default:{type:"mainColor",index:0},
    },activeMenuColorOpacity:{
        type:Number,
        min:0,
        max:255,
        default:255,
    },hoverMenuColor:{
        type:Schema.Types.Mixed,
        default:{type:"mainColor",index:1},
    },hoverMenuColorOpacity:{
        type:Number,
        min:0,
        max:255,
        default:255,
    }, isMenuGradient:{
        type:Boolean,
        default:false,
    }, bgMenuColor:{
        type:Schema.Types.Mixed,
        default:"#ffffff",
    }, bgMenuColorGradient:{
        type:[Schema.Types.Mixed],
        default:Array.from({length:2},(_,i)=>({type:"mainColor",index:i})),
        set:(arr)=>{
            const src = Array.isArray(arr) ? arr : []
            return Array.from({length:2},(_,i)=>src[i]||"#ffffff")
        }
    }, bgMenuOpacity:{
        type:Number,
        min:0,
        max:255,
        default:255,
    }, bgMenuOpacityGradient:{
        type:[Number],
        default:Array.from({length:2},(_,i)=>255),
        set:(arr)=>{
            const src = Array.isArray(arr) ? arr : []
            return Array.from({length:2},(_,i)=>src[i]??255)
        }
    }, bgMenuDegree:{
        type:Number,
        min:0,
        max:360,
        default:0,
    },display:{
        type:String,
        default:"right",
    },menuHeight:{
        type:Number,
        min:50,
        max:80,
        default:65,
    },logo:{
        type:String,
        default:"",
    },logoHeight:{
        type:Number,
        min:35,
        max:60,
        default:35,
    },menuSpace:{
        type:Number,
        min:20,
        max:50,
        default:35,
    },divider:{
        type:Boolean,
        default:false
    },dividerStyle:{
        type:String,
        default:"solid"
    },dividerColor:{
        type:Schema.Types.Mixed,
        default:"#000000",
    },dividerOpacity:{
        type:Number,
        min:0,
        max:255,
        default:255,
    },dividerWeight:{
        type:Number,
        default:1,
    }, subMenuFontSize:{
        type:Number,
        default:12,
    }, subMenuFontWeight:{
        type:Number,
        min:200,
        max:600,
        default:200,
    },subMenuColor:{
        type:Schema.Types.Mixed,
        default:"#000000",
    },subMenuColorOpacity:{
        type:Number,
        min:0,
        max:255,
        default:255,
    },activeSubMenuColor:{
        type:Schema.Types.Mixed,
        default:{type:"mainColor",index:0},
    },activeSubMenuColorOpacity:{
        type:Number,
        min:0,
        max:255,
        default:255,
    },hoverSubMenuColor:{
        type:Schema.Types.Mixed,
        default:{type:"mainColor",index:1},
    },hoverSubMenuColorOpacity:{
        type:Number,
        min:0,
        max:255,
        default:255,
    }, isSubMenuGradient:{
        type:Boolean,
        default:false,
    }, bgSubMenuColor:{
        type:Schema.Types.Mixed,
        default:"#ffffff",
    }, bgSubMenuColorGradient:{
        type:[Schema.Types.Mixed],
        default:Array.from({length:2},(_,i)=>({type:"mainColor",index:i})),
        set:(arr)=>{
            const src = Array.isArray(arr) ? arr : []
            return Array.from({length:2},(_,i)=>src[i]||"#ffffff")
        }
    }, bgSubMenuOpacity:{
        type:Number,
        min:0,
        max:255,
        default:255,
    }, bgSubMenuOpacityGradient:{
        type:[Number],
        default:Array.from({length:2},(_,i)=>255),
        set:(arr)=>{
            const src = Array.isArray(arr) ? arr : []
            return Array.from({length:2},(_,i)=>src[i]??255)
        }
    }, bgSubMenuDegree:{
        type:Number,
        min:0,
        max:360,
        default:0,
    },subMenuBorderStyle:{
        type:String,
        default:"solid"
    },subMenuBorderColor:{
        type:Schema.Types.Mixed,
        default:"#d8d8d8",
    },subMenuBorderOpacity:{
        type:Number,
        min:0,
        max:255,
        default:255,
    }
    



},{_id:false})

const menuBarMobile = new Schema({
    menuFontSize:{
        type:Number,
        default:14,
    }, menuFontWeight:{
        type:Number,
        min:300,
        max:600,
        default:600,
    },menuColor:{
        type:Schema.Types.Mixed,
        default:"#000000",
    },menuColorOpacity:{
        type:Number,
        min:0,
        max:255,
        default:255,
    },activeMenuColor:{
        type:Schema.Types.Mixed,
        default:{type:"mainColor",index:0},
    },activeMenuColorOpacity:{
        type:Number,
        min:0,
        max:255,
        default:255,
    }, isMenuBarGradient:{
        type:Boolean,
        default:false,
    }, bgMenuBarColor:{
        type:Schema.Types.Mixed,
        default:"#ffffff",
    }, bgMenuBarColorGradient:{
        type:[Schema.Types.Mixed],
        default:Array.from({length:2},(_,i)=>({type:"mainColor",index:i})),
        set:(arr)=>{
            const src = Array.isArray(arr) ? arr : []
            return Array.from({length:2},(_,i)=>src[i]||"#ffffff")
        }
    }, bgMenuBarOpacity:{
        type:Number,
        min:0,
        max:255,
        default:255,
    }, bgMenuBarOpacityGradient:{
        type:[Number],
        default:Array.from({length:2},(_,i)=>255),
        set:(arr)=>{
            const src = Array.isArray(arr) ? arr : []
            return Array.from({length:2},(_,i)=>src[i]??255)
        }
    }, bgMenuBarDegree:{
        type:Number,
        min:0,
        max:360,
        default:0,
    },menuHeight:{
        type:Number,
        min:40,
        max:60,
        default:40,
    },logo:{
        type:String,
        default:"",
    },logoHeight:{
        type:Number,
        min:35,
        max:60,
        default:35,
    },dividerStyle:{
        type:String,
        default:"solid"
    },dividerColor:{
        type:Schema.Types.Mixed,
        default:"#000000",
    },dividerOpacity:{
        type:Number,
        min:0,
        max:255,
        default:255,
    }, subMenuFontSize:{
        type:Number,
        default:13,
    }, subMenuFontWeight:{
        type:Number,
        min:200,
        max:600,
        default:400,
    },subMenuColor:{
        type:Schema.Types.Mixed,
        default:"#000000",
    },subMenuColorOpacity:{
        type:Number,
        min:0,
        max:255,
        default:255,
    },activeSubMenuColor:{
        type:Schema.Types.Mixed,
        default:{type:"mainColor",index:0},
    },activeSubMenuColorOpacity:{
        type:Number,
        min:0,
        max:255,
        default:255,
    },
    display:{
        type:String,
        default:"right",
    },
    barHeight:{
        type:Number,
        min:50,
        max:80,
        default:50,
    },bgButtonColor:{
        type:Schema.Types.Mixed,
        default:"#ffffff",
    },bgButtonOpacity:{
        type:Number,
        min:0,
        max:255,
        default:255,
    },borderButtonColor:{
        type:Schema.Types.Mixed,
        default:"#000000",
    },borderButtonOpacity:{
        type:Number,
        min:0,
        max:255,
        default:255,
    },iconButtonColor:{
        type:Schema.Types.Mixed,
        default:"#000000",
    },iconButtonOpacity:{
        type:Number,
        min:0,
        max:255,
        default:255,
    },borderWidth:{
        type:Number,
        default:1,
    }, bgMenuColor:{
        type:Schema.Types.Mixed,
        default:"#ffffff",
    }, bgMenuOpacity:{
        type:Number,
        min:0,
        max:255,
        default:255,
    }
    

},{_id:false})


const navBottom = new Schema({
    icon:{
        type:Object,
        default:{name: 'fa0', type: 'fas'}
    },
    label:{
        type:String,
        default:"Home"
    },
    link:{
        type:String,
        default:"",
    }
},{_id:false})

const menuPreset = new Schema({
    id:{
        type:String,
        default:""
    },
    name:{
        type:String,
        default:"Menu 1"
    },
    items:{
        type:[Schema.Types.Mixed],
        default:[]
    },
    menuBarDesktop:{
        type:Schema.Types.Mixed,
        default:{}
    },
    menuBarMobile:{
        type:Schema.Types.Mixed,
        default:{}
    },
    menuBarMobilePhone:{
        type:Schema.Types.Mixed,
        default:null
    },
    navBottomMobile:{
        type:Schema.Types.Mixed,
        default:{}
    },
    navBottomTablet:{
        type:Schema.Types.Mixed,
        default:{}
    },
    topBar:{
        type:Schema.Types.Mixed,
        default:{}
    }
},{_id:false})

const heroPreset = new Schema({
    id:{
        type:String,
        default:""
    },
    name:{
        type:String,
        default:"Hero 1"
    }
},{_id:false})

const navBottomPrototype = (n,space)=>{
    return{
      isAbleNavBottom:true,
      navBottomDisplay:"text",
      navText:"Home",
      navIcon:{name: 'fa0', type: 'fas'},
      navBottoms:Array.from({length:n},(_,i)=>({
        icon:{name: 'fa0', type: 'fas'},label:"Home",link:""
      })),
    
      bgNav:"#000000",
      bgNavOpacity:255,
      navHeight:56,
      navSpace:space,
    
      iconSize:20,
      iconColor:"#ffffff",
      iconOpacity:255,
    
      labelSize:11,
      labelColor:"#ffffff",
      labelOpacity:255,
    
      navDivider:false,
      navDividerColor:"#ffffff",
      navDividerOpacity:178,
      navDividerStyle:"solid",
    }
  }

const defaultNavBottomMobile = () => navBottomPrototype(4, 10);
const defaultNavBottomTablet = () => navBottomPrototype(7, 12);

const navBottomBar = new Schema({
    isAbleNavBottom:{
        type:Boolean,
        default:true
    },navBottomDisplay:{
        type:String,
        default:"text",
    },navText:{
        type:String,
        default:"Home"
    },navIcon:{
        type:Object,
        default:{name: 'fa0', type: 'fas'}
    },navBottoms:{
        type:[navBottom],
        default:Array.from({length:4},(_,i)=>({}))
    },bgNav:{
        type:Schema.Types.Mixed,
        default:"#000000",
    },bgNavOpacity:{
        type:Number,
        min:0,
        max:255,
        default:255,
    },navHeight:{
        type:Number,
        min:50,
        max:80,
        default:56,
    },navSpace:{
        type:Number,
        min:0,
        max:20,
        default:10,
    },iconSize:{
        type:Number,
        default:20
    },iconOpacity:{
        type:Number,
        min:0,
        max:255,
        default:255,
    },iconColor:{
        type:Schema.Types.Mixed,
        default:"#ffffff",
    },labelSize:{
        type:Number,
        default:11
    },labelOpacity:{
        type:Number,
        min:0,
        max:255,
        default:255,
    },labelColor:{
        type:Schema.Types.Mixed,
        default:"#ffffff",
    },navDivider:{
        type:Boolean,
        default:false
    },navDividerStyle:{
        type:String,
        default:"solid"
    },navDividerColor:{
        type:Schema.Types.Mixed,
        default:"#ffffff",
    },navDividerOpacity:{
        type:Number,
        min:0,
        max:255,
        default:178,
    }

    
},{_id:false})

const iconTopBar = new Schema({
    icon:{
        type:Object,
        default: () => ({ name: "fa0", type: "fas" })
    },
    url:{
        type:String,
        default:""
    },bgColor:{
        type:Schema.Types.Mixed,
        default:"#ffffff"
    },
    bgOpacity:{
        type:Number,
        default:255,
        min:0,
        max:255,
    },iconColor:{
        type:Schema.Types.Mixed,
        default:"#000000"
    },
    iconOpacity:{
        type:Number,
        default:255,
        min:0,
        max:255,
    },iconSize:{
        type:Number,
        default:18,
        min:18,
        max:30,
    }

},{_id:false})

const textTopBar = new Schema({
    icon:{
        type:Object,
        default: () => ({ name: "fa0", type: "fas" })
    },
    bgColor:{
        type:Schema.Types.Mixed,
        default:"#ffffff"
    },
    bgOpacity:{
        type:Number,
        default:255,
        min:0,
        max:255,
    },iconColor:{
        type:Schema.Types.Mixed,
        default:"#000000"
    },
    iconOpacity:{
        type:Number,
        default:255,
        min:0,
        max:255,
    },iconSize:{
        type:Number,
        default:18,
        min:18,
        max:30,
    },textColor:{
        type:Schema.Types.Mixed,
        default:"#ffffff"
    },
    textOpacity:{
        type:Number,
        default:255,
        min:0,
        max:255,
    },textSize:{
        type:Number,
        default:11,
        min:11,
        max:20,
    },
    text:{
        type:String,
        default:"Bangkok Thailand"
    }

},{_id:false})

const topBar = new Schema({
    ableLeft:{
        type:Boolean,
        default:true,
    },
    topBarHeight:{
        type:Number,
        default:52,
        min:52,
        max:62,
    },
    isGradient:{
        type:Boolean,
        default:false,
    },
    bgColor:{
        type:Schema.Types.Mixed,
        default:"#000000"
    },
    bgOpacity:{
        type:Number,
        default:255,
        min:0,
        max:255,
    },bgColorGradient:{
        type:[Schema.Types.Mixed],
        default: () => Array.from({ length: 2 }, (_, i) => ({ type: "mainColor", index: i })),
        set:(arr)=>{
            const src = Array.isArray(arr) ? arr : []
            return Array.from({ length: 2 }, (_, i) => src[i] ?? { type: "mainColor", index: i })
        },
    },bgOpacityGradient:{
        type:[Number],
        default:Array.from({length:2},(_,i)=>255),
        set:(arr)=>{
            const src = Array.isArray(arr) ? arr : []
            return Array.from({length:2},(_,i)=>src[i]??255)
        },
    },bgDegree:{
        type:Number,
        default:0,
        min:0,
        max:360,
    },borderSize:{
        type:Number,
        default:26,
        min:26,
        max:35,
    },radius:{
        type:Number,
        default:50,
        min:0,
        max:50,
    }, ableRight:{
        type:Boolean,
        default:true,
    },radiusText:{
        type:Number,
        default:50,
        min:0,
        max:50,
    },borderTextSize:{
        type:Number,
        default:26,
        min:26,
        max:35,
    },iconGroup:{
        type:[iconTopBar],
        default: () => Array.from({ length: 3 }, () => ({}))
    },textGroup:{
        type:[textTopBar],
        default: () => Array.from({ length: 3 }, () => ({}))
    }

},{_id:false})

const menuBarSchema = new Schema({

    menuBarDesktop:{
        type:menuBarDesktop,
        default: () => ({})
    },menuBarMobile:{
        type:menuBarMobile,
        default: () => ({})
    },menuBarMobilePhone:{
        type:menuBarMobile,
        default:null
    },navBottomMobile:{
        type:navBottomBar,
        default:defaultNavBottomMobile
    },navBottomTablet:{
        type:navBottomBar,
        default:defaultNavBottomTablet
    },topBar:{
        type:topBar,
        default: () => ({})
    },menuPresets:{
        type:[menuPreset],
        default:[]
    },activeMenuPresetId:{
        type:String,
        default:"menu-preset-1"
    },defaultMenuPresetId:{
        type:String,
        default:"menu-preset-1"
    },heroPresets:{
        type:[heroPreset],
        default:[]
    },activeHeroPresetId:{
        type:String,
        default:"hero-preset-1"
    },defaultHeroPresetId:{
        type:String,
        default:"hero-preset-1"
    },heroSection:{
        type:Schema.Types.Mixed,
        default:{}
    }

},{timestamps:true})


module.exports = model("MenuBar",menuBarSchema)