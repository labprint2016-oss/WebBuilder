const span = {id:"Span-",latestEleID:0,elements:[],size:6,paddingX:18,paddingY:18,backgroundColor:"#ffffff",backgroundColorGradient:[{type:"mainColor",index:0},{type:"mainColor",index:1}],degrees:90,isGradient:false,borderRadius:0,borderWidth:0,borderColor:"#000000",borderOpacity:255,opacityColor:255,opacityColorGradient:[255,255]}
const spans = [span,{...span}]

const LIST_IMAGE_DEFAULT_TEXT = "CLOUD Server - WEB Builder\nBuild website for Quickly and Easily"
const LIST_IMAGE_ASIDE_DEFAULT_TEXT = "99$"

const LIST_BOX_DEFAULT_TITLES = ["DESIGNER", "DRAG & DROP", "CUSTOMIZE", "OWN UNIQUE"]
const LIST_BOX_DEFAULT_ICONS = [
    { name: "faBrush", type: "fas" },
    { name: "faUpDownLeftRight", type: "fas" },
    { name: "faStar", type: "fas" },
    { name: "faChessKnight", type: "fas" },
]
function listBoxTitleParagraph(titleText) {
    const text = String(titleText || "").trim() || LIST_BOX_DEFAULT_TITLES[0]
    return {
        type: "paragraph",
        alignClass: "text-center",
        segments: [
            {
                text,
                classes: ["font-bold"],
                style: { fontSize: "14px", lineHeight: "21px", letterSpacing: "0.2em" },
            },
        ],
    }
}
function listBoxDefaultItem(title, index) {
    const i = Number.isFinite(Number(index)) ? Math.max(0, Math.floor(Number(index))) : 0
    const icon = LIST_BOX_DEFAULT_ICONS[i % LIST_BOX_DEFAULT_ICONS.length]
    return {
        title,
        titleParagraph: listBoxTitleParagraph(title),
        body: "",
        faIcon: { ...icon },
        src: "",
        aspectRatio: "1 / 1",
        borderRadius: 8,
        backgroundColor: { type: "mainColor", index: 0 },
        backgroundOpacity: 255,
        iconColor: "#ffffff",
        iconOpacity: 255,
        linkEnabled: false,
        linkUrl: "",
        linkTarget: "_self",
        slideLinkMode: "url",
        slideVideoEmbed: "",
    }
}

const elements = {
    Column:{
        container:{id:"Sec-",latestColID:3,isFluid:false,isGradient:false,paddingTop:30,paddingBottom:30,sectionOverlapTop:0,sectionOverlapTopDesktop:0,sectionOverlapTopTablet:0,sectionOverlapTopMobile:0,opacityImage:1,opacityColor:255,opacityColorGradient:[255,255],backgroundImage:"",backgroundColor:"#ffffff",backgroundColorGradient:[{type:"mainColor",index:0},{type:"mainColor",index:1}],degrees:90,blur:0,gridBorder:false,noColumnGap:false,parallaxEnabled:false,columnDividerStyle:"dashed",columnDividerColor:"#d8d8d8",columnDividerOpacity:255,columnDividerVerticalLengthPercent:95},
        columns:[
            {id:"Col-",paddingX:12,paddingY:12,backgroundColor:"#ffffff",backgroundColorGradient:[{type:"mainColor",index:0},{type:"mainColor",index:1}],degrees:90,isGradient:false,borderRadius:0,borderWidth:0,borderColor:"#000000",borderOpacity:255,opacityColor:255,opacityColorGradient:[255,255],size:4,latestEleID:0,elements:[],isSpan:false,backgroundImage:"",opacityImage:1,blur:0},
            {id:"Col-",paddingX:12,paddingY:12,backgroundColor:"#ffffff",backgroundColorGradient:[{type:"mainColor",index:0},{type:"mainColor",index:1}],degrees:90,isGradient:false,borderRadius:0,borderWidth:0,borderColor:"#000000",borderOpacity:255,opacityColor:255,opacityColorGradient:[255,255],size:4,latestEleID:0,elements:[],isSpan:false,backgroundImage:"",opacityImage:1,blur:0},
            {id:"Col-",paddingX:12,paddingY:12,backgroundColor:"#ffffff",backgroundColorGradient:[{type:"mainColor",index:0},{type:"mainColor",index:1}],degrees:90,isGradient:false,borderRadius:0,borderWidth:0,borderColor:"#000000",borderOpacity:255,opacityColor:255,opacityColorGradient:[255,255],size:4,latestEleID:0,elements:[],isSpan:false,backgroundImage:"",opacityImage:1,blur:0},
            
        ]
    },
    Split:{
        isSplitLayout: true,
        sections:[
            {
                container:{id:"Sec-",latestColID:1,isFluid:false,isGradient:false,paddingTop:30,paddingBottom:30,sectionOverlapTop:0,sectionOverlapTopDesktop:0,sectionOverlapTopTablet:0,sectionOverlapTopMobile:0,opacityImage:1,opacityColor:255,opacityColorGradient:[255,255],backgroundImage:"",backgroundColor:"#ffffff",backgroundColorGradient:[{type:"mainColor",index:0},{type:"mainColor",index:1}],degrees:90,blur:0,gridBorder:false,noColumnGap:false,parallaxEnabled:false,columnDividerStyle:"dashed",columnDividerColor:"#d8d8d8",columnDividerOpacity:255,columnDividerVerticalLengthPercent:95},
                columns:[{id:"Col-",paddingX:12,paddingY:12,backgroundColor:"#ffffff",backgroundColorGradient:[{type:"mainColor",index:0},{type:"mainColor",index:1}],degrees:90,isGradient:false,borderRadius:0,borderWidth:0,borderColor:"#000000",borderOpacity:255,opacityColor:255,opacityColorGradient:[255,255],size:12,latestEleID:0,elements:[],isSpan:false,backgroundImage:"",opacityImage:1,blur:0}]
            },
            {
                container:{id:"Sec-",latestColID:1,isFluid:false,isGradient:false,paddingTop:30,paddingBottom:30,sectionOverlapTop:0,sectionOverlapTopDesktop:0,sectionOverlapTopTablet:0,sectionOverlapTopMobile:0,opacityImage:1,opacityColor:255,opacityColorGradient:[255,255],backgroundImage:"",backgroundColor:"#f8fafc",backgroundColorGradient:[{type:"mainColor",index:0},{type:"mainColor",index:1}],degrees:90,blur:0,gridBorder:false,noColumnGap:false,parallaxEnabled:false,columnDividerStyle:"dashed",columnDividerColor:"#d8d8d8",columnDividerOpacity:255,columnDividerVerticalLengthPercent:95},
                columns:[{id:"Col-",paddingX:12,paddingY:12,backgroundColor:"#f8fafc",backgroundColorGradient:[{type:"mainColor",index:0},{type:"mainColor",index:1}],degrees:90,isGradient:false,borderRadius:0,borderWidth:0,borderColor:"#000000",borderOpacity:255,opacityColor:255,opacityColorGradient:[255,255],size:12,latestEleID:0,elements:[],isSpan:false,backgroundImage:"",opacityImage:1,blur:0}]
            },
        ]
    },
    Header:{
        container:{id:"Sec-",isGradient:false,paddingTop:30,paddingBottom:30,desktopHeight:500,mobileHeight:400,opacityImage:1,opacityColor:255,opacityArrow:255,opacityBackgroundArrow:255,opacityColorGradient:[255,255],backgroundImage:"",backgroundColor:"#ffffff",backgroundArrowColor:{type:"mainColor",index:0},backgroundColorGradient:[{type:"mainColor",index:0},{type:"mainColor",index:1}],degrees:90,arrowColor:"#ffffff",arrowSize:30,pointSize:10,pointColor:{type:"mainColor",index:0}},
        heros:[1,2,3]
    },
    
    Span:{
        container:{id:"Sec-",latestColID:3,isFluid:false,isGradient:false,paddingTop:30,paddingBottom:30,sectionOverlapTop:0,sectionOverlapTopDesktop:0,sectionOverlapTopTablet:0,sectionOverlapTopMobile:0,opacityImage:1,opacityColor:255,opacityColorGradient:[255,255],backgroundImage:"",backgroundColor:"#ffffff",backgroundColorGradient:[{type:"mainColor",index:0},{type:"mainColor",index:1}],degrees:90,blur:0,gridBorder:false,noColumnGap:false,parallaxEnabled:false,columnDividerStyle:"dashed",columnDividerColor:"#d8d8d8",columnDividerOpacity:255,columnDividerVerticalLengthPercent:95},
        columns:[
            {id:"Col-",paddingX:12,paddingY:12,backgroundColor:"#ffffff",backgroundColorGradient:[{type:"mainColor",index:0},{type:"mainColor",index:1}],degrees:90,isGradient:false,borderRadius:0,borderWidth:0,borderColor:"#000000",borderOpacity:255,opacityColor:255,opacityColorGradient:[255,255],size:3,latestEleID:0,elements:[],isSpan:false},
            {id:"Col-",latestSpanID:2,paddingX:12,paddingY:12,backgroundColor:"#ffffff",backgroundColorGradient:[{type:"mainColor",index:0},{type:"mainColor",index:1}],degrees:90,isGradient:false,borderRadius:0,borderWidth:0,borderColor:"#000000",borderOpacity:255,opacityColor:255,opacityColorGradient:[255,255],latestEleID:0,size:6,elements:[],isSpan:true,spans},
            {id:"Col-",paddingX:12,paddingY:12,backgroundColor:"#ffffff",backgroundColorGradient:[{type:"mainColor",index:0},{type:"mainColor",index:1}],degrees:90,isGradient:false,borderRadius:0,borderWidth:0,borderColor:"#000000",borderOpacity:255,opacityColor:255,opacityColorGradient:[255,255],size:3,latestEleID:0,elements:[],isSpan:false},
            
        ]
    },
    Image:{type:"img",id:"Img-",src:"",aspectRatio:"auto",brightness:0,borderRadius:12,imageMarginTop:8,imageMarginBottom:8,badge:{ show:false, label:"", bold:false, position:"tl", size:"13", variant:"pill", textAlign:"center",hover:false },preview:{ label: "Image", icon: "image", lucideIcon:"Image", lucideSize:28, lucideStrokeWidth:2.2 }},
    "Image Hover":{type:"imgh",id:"ImgH-",src:"",aspectRatio:"auto",brightness:0,borderRadius:12,imageMarginTop:8,imageMarginBottom:8,imageHoverBackgroundEnabled:true,imageHoverBackgroundColor:{type:"mainColor",index:0},imageHoverBackgroundOpacity:255,imageHoverContentOffsetY:62,imageHoverText:"Design your own unique website without writing code, and bring your ideas to life with beauty, simplicity, and creativity",imageHoverTextParagraph:{type:"paragraph",alignClass:"text-center",segments:[{text:"Design your own unique website without writing code, and bring your ideas to life with beauty, simplicity, and creativity",classes:[],style:{}}]},imageHoverExtras:["none"],imageHoverIconElement:{type:"icon",faIcon:{ name:"faStar", type:"fas" },backgroundColor:{ type:"mainColor", index:0 },backgroundOpacity:255,iconColor:"#ffffff",iconOpacity:255,iconSize:28,containerSize:64,iconShape:"circle",iconCornerRadius:12,borderColor:{ type:"textColor", index:0 },borderOpacity:255,borderWidth:0,borderStyle:"solid",borderPosition:"outside",iconLayoutAlign:"center",iconMarginTop:8,iconMarginBottom:8,linkEnabled:false,linkUrl:"",linkTarget:"_self"},imageHoverButtonElement:{type:"btn",label:"Button Click",buttonVariant:"contained",buttonLayoutAlign:"start",buttonFill:{type:"mainColor",index:1},buttonLabelColor:"#ffffff",buttonFontSize:14,buttonRadius:8,buttonPaddingX:20,buttonPaddingY:12,buttonFullWidth:false,buttonBold:true,buttonBorderWidth:2,buttonBorderColor:{type:"mainColor",index:1},buttonFillOpacity:255,buttonLabelOpacity:255,buttonBorderOpacity:255,buttonMarginTop:8,buttonMarginBottom:8,linkEnabled:false,linkUrl:"",linkTarget:"_self",linkIcon:{name:"faShieldHalved",type:"fas"}},badge:{ show:false, label:"", bold:false, position:"tl", size:"13", variant:"pill", textAlign:"center",hover:false },preview:{ label: "Image Hover", icon: "image-up", lucideIcon:"ImageUp", lucideSize:28, lucideStrokeWidth:2.2 }},
    "Overlay":{type:"imgo",id:"ImgO-",src:"",aspectRatio:"auto",brightness:0,borderRadius:12,imageMarginTop:8,imageMarginBottom:8,imageHoverBackgroundEnabled:true,imageHoverBackgroundColor:{type:"mainColor",index:0},imageHoverBackgroundOpacity:255,imageHoverContentOffsetY:62,__overlayPanelInitialized:false,imageHoverText:"Design your own unique website without writing code, and bring your ideas to life with beauty, simplicity, and creativity",imageHoverTextParagraph:{type:"paragraph",alignClass:"text-center",segments:[{text:"Design your own unique website without writing code, and bring your ideas to life with beauty, simplicity, and creativity",classes:[],style:{}}]},imageHoverExtras:["none"],imageHoverIconElement:{type:"icon",faIcon:{ name:"faStar", type:"fas" },backgroundColor:{ type:"mainColor", index:0 },backgroundOpacity:255,iconColor:"#ffffff",iconOpacity:255,iconSize:28,containerSize:64,iconShape:"circle",iconCornerRadius:12,borderColor:{ type:"textColor", index:0 },borderOpacity:255,borderWidth:0,borderStyle:"solid",borderPosition:"outside",iconLayoutAlign:"center",iconMarginTop:8,iconMarginBottom:8,linkEnabled:false,linkUrl:"",linkTarget:"_self"},imageHoverButtonElement:{type:"btn",label:"Button Click",buttonVariant:"contained",buttonLayoutAlign:"start",buttonFill:{type:"mainColor",index:1},buttonLabelColor:"#ffffff",buttonFontSize:14,buttonRadius:8,buttonPaddingX:20,buttonPaddingY:12,buttonFullWidth:false,buttonBold:true,buttonBorderWidth:2,buttonBorderColor:{type:"mainColor",index:1},buttonFillOpacity:255,buttonLabelOpacity:255,buttonBorderOpacity:255,buttonMarginTop:8,buttonMarginBottom:8,linkEnabled:false,linkUrl:"",linkTarget:"_self",linkIcon:{name:"faShieldHalved",type:"fas"}},badge:{ show:false, label:"", bold:false, position:"tl", size:"13", variant:"pill", textAlign:"center",hover:false },preview:{ label: "Overlay", icon: "brush", lucideIcon:"Brush", lucideSize:28, lucideStrokeWidth:2.2 }},
    Banner:{type:"bnr",id:"Bnr-",src:"",aspectRatio:"auto",brightness:0,borderRadius:12,imageMarginTop:8,imageMarginBottom:8,bannerCaptionFontSize:40,bannerCaptionLetterSpacing:6,bannerCaptionSlideVertical:-75,bannerCaptionSlideHorizontal:0,bannerCaptionEdgePosition:"bottom",bannerCaptionTextColor:"#FFFFFF",bannerCaptionTextOpacity:255,linkEnabled:false,linkUrl:"",linkTarget:"_self",slideLinkMode:"url",slideVideoEmbed:"",badge:{ show:false, label:"BANNER", bold:true, position:"tl", size:"13", variant:"pill", textAlign:"center",hover:false },preview:{ label: "Banner", icon: "paint-roller", lucideIcon:"PaintRoller", lucideSize:28, lucideStrokeWidth:2.2 }},
    Video:{type:"vid",id:"VID-",src:"",aspectRatio:"auto",brightness:0,borderRadius:12,imageMarginTop:8,imageMarginBottom:8,badge:{ show:false, label:"", bold:false, position:"tl", size:"13", variant:"pill", textAlign:"center",hover:false },preview:{ label: "Video", icon: "slow_motion_video" }},
    Lightbox:{type:"lbx",id:"LBX-",src:"",aspectRatio:"auto",brightness:0,borderRadius:12,imageMarginTop:8,imageMarginBottom:8,badge:{ show:false, label:"", bold:false, position:"tl", size:"13", variant:"pill", textAlign:"center",hover:false },preview:{ label: "Lightbox", icon: "circle-fading-plus", lucideIcon:"CircleFadingPlus", lucideSize:28, lucideStrokeWidth:2.2 }},
    Text:{
        type:"text",
        id:"Text-",
        label:"Design your own unique website without writing code, and bring your ideas to life with beauty, simplicity, and creativity",
        textParagraph:{
            type:"paragraph",
            alignClass:"text-left",
            segments:[
                {
                    text:"Design your own unique website without writing code, and bring your ideas to life with beauty, simplicity, and creativity",
                    classes:[],
                    style:{
                        color:"#000000",
                        fontSize:"14px",
                        lineHeight:"24px",
                        letterSpacing:"0px"
                    }
                }
            ]
        },
        preview:{ label: "Text", icon: "format_size" }
    },
    Heading:{type:"heading",id:"Heading-",label:"Design your own unique",headingFontSize:28,headingBold:true,headingAlign:"left",headingColor:{type:"mainColor",index:0},headingColorOpacity:255,headingTextGradient:false,headingColor2:{type:"mainColor",index:1},headingColor2Opacity:255,headingGradientDegrees:90,headingMarginTop:8,headingMarginBottom:8,headingLetterSpacing:0,headingLineHeight:1.35,headingDividerEnabled:false,headingDividerPosition:"bottom",headingDividerStyle:"solid",headingDividerWidth:2,headingDividerColor:{type:"mainColor",index:0},headingDividerOpacity:255,headingDividerGap:8,headingDividerSpanPercent:100,preview:{ label: "Heading", icon: "auto_awesome" }},
    Button:{
        type:"btn",
        id:"Btn-",
        label:"Button Click",
        buttonVariant:"contained",
        buttonLayoutAlign:"start",
        buttonFill:{type:"mainColor",index:1},
        buttonLabelColor:"#ffffff",
        buttonFontSize:14,
        buttonRadius:8,
        buttonPaddingX:20,
        buttonPaddingY:12,
        buttonFullWidth:false,
        buttonBold:true,
        buttonBorderWidth:2,
        buttonBorderColor:{type:"mainColor",index:1},
        buttonFillOpacity:255,
        buttonLabelOpacity:255,
        buttonBorderOpacity:255,
        buttonMarginTop:8,
        buttonMarginBottom:8,
        buttonSpecialTextEnabled:false,
        buttonSpecialText:"Drag & Drop to Design",
        buttonSpecialTextParagraph:null,
        linkEnabled:false,
        linkUrl:"",
        linkTarget:"_self",
        linkIcon:{name:"faShieldHalved",type:"fas"},
        preview:{ label: "Button", icon: "hub" }
    },
    Divider:{
        type:"divider",
        id:"divi-",
        dividerStyle:"dashed",
        dividerColor:"#d8d8d8",
        dividerOpacity:255,
        dividerWeight:1,
        dividerMarginTop:8,
        dividerMarginBottom:8,
        preview:{ label: "Divider", icon: "insert_page_break" }
    },
    Form:{
        type:"form",
        id:"Form-",
        formPresetId:"",
        formMarginX:0,
        formMarginY:8,
        formMarginTop:8,
        formMarginBottom:8,
        preview:{ label: "Form", icon: "send" }
    },
    "Button Dual":{
        type:"btnG",
        id:"btnG-",
        label:"Button Click",
        label2:"Button Click",
        buttonVariant:"contained",
        buttonLayoutAlign:"start",
        buttonFill:{type:"mainColor",index:1},
        buttonLabelColor:"#ffffff",
        button2Fill:{type:"mainColor",index:0},
        button2LabelColor:"#ffffff",
        button2FillOpacity:255,
        button2LabelOpacity:255,
        buttonFontSize:14,
        buttonRadius:8,
        buttonPaddingX:20,
        buttonPaddingY:12,
        buttonFullWidth:false,
        buttonBold:true,
        buttonBorderWidth:2,
        buttonBorderColor:{type:"mainColor",index:1},
        buttonFillOpacity:255,
        buttonLabelOpacity:255,
        buttonBorderOpacity:255,
        buttonMarginTop:8,
        buttonMarginBottom:8,
        buttonSpecialTextEnabled:false,
        buttonSpecialText:"Drag & Drop to Design",
        buttonSpecialTextParagraph:null,
        linkEnabled:false,
        linkUrl:"",
        linkTarget:"_self",
        linkIcon:{name:"faShieldHalved",type:"fas"},
        linkIcon2:{name:"faShieldHalved",type:"fas"},
        preview:{ label: "Button Dual", icon: "smart_button" }
    },
    "List Item":{
        type:"list",
        id:"List-",
        /* shared icon styling — สอดคล้องช่องสีพื้นฐาน #333333 / #ffffff / เส้นคั่น #d8d8d8 */
        backgroundColor:"#333333",
        backgroundOpacity:255,
        iconColor:"#ffffff",
        iconOpacity:255,
        iconSize:19,
        containerSize:36,
        iconShape:"circle",
        iconCornerRadius:12,
        borderColor:{ type:"textColor", index:0 },
        borderOpacity:255,
        borderWidth:0,
        borderStyle:"solid",
        borderPosition:"outside",
        iconLayoutAlign:"center",
        iconMarginTop:0,
        iconMarginBottom:0,

        /* shared text styling */
        listTextColor:"#000000",
        listTextOpacity:255,
        listTextSize:14,

        /* shared divider / spacing */
        listDividerEnabled:true,
        listDividerStyle:"dotted",
        listDividerColor:"#d8d8d8",
        listDividerOpacity:255,
        listVerticalTimelineDivider:false,
        listItemsIconAlign:"start",
        listMarginTop:8,
        listMarginBottom:8,
        listItemRowGap:8,
        listIconTextGapPx:12,
        listItemRowFrameEnabled:false,
        listItemRowFrameColor:"#d4d4d8",
        listItemRowFrameOpacity:255,
        listItemRowFrameRadius:18,
        listItemRowFrameGlass:55,

        /* compound items */
        listItemCount:3,
        listItems:[
            { faIcon:{ name:"faShieldHalved", type:"fas" }, listText:"Design your own unique website", listTextParagraph:null, backgroundColor:"#333333", backgroundOpacity:255, iconColor:"#ffffff", iconOpacity:255, iconSize:19, containerSize:36, iconShape:"circle", iconCornerRadius:12, borderColor:{ type:"textColor", index:0 }, borderOpacity:255, borderWidth:0, borderStyle:"solid", borderPosition:"outside", iconLayoutAlign:"center" },
            { faIcon:{ name:"faCircleCheck", type:"fas" }, listText:"Build pages quickly and easily", listTextParagraph:null, backgroundColor:"#333333", backgroundOpacity:255, iconColor:"#ffffff", iconOpacity:255, iconSize:19, containerSize:36, iconShape:"circle", iconCornerRadius:12, borderColor:{ type:"textColor", index:0 }, borderOpacity:255, borderWidth:0, borderStyle:"solid", borderPosition:"outside", iconLayoutAlign:"center" },
            { faIcon:{ name:"faStar", type:"fas" }, listText:"Customize to match your brand", listTextParagraph:null, backgroundColor:"#333333", backgroundOpacity:255, iconColor:"#ffffff", iconOpacity:255, iconSize:19, containerSize:36, iconShape:"circle", iconCornerRadius:12, borderColor:{ type:"textColor", index:0 }, borderOpacity:255, borderWidth:0, borderStyle:"solid", borderPosition:"outside", iconLayoutAlign:"center" }
        ],
        preview:{
            label: "List Item",
            icon: "layout-list",
            lucideIcon: "LayoutList"
        }
    },
    "List iCons":{
        type:"list",
        id:"List-",
        listIconsElement:true,
        /* shared icon styling */
        backgroundColor:"#ffffff",
        backgroundOpacity:0,
        iconColor:{ type:"mainColor", index:0 },
        iconOpacity:255,
        iconSize:18,
        containerSize:32,
        iconShape:"circle",
        iconCornerRadius:12,
        borderColor:{ type:"textColor", index:0 },
        borderOpacity:255,
        borderWidth:0,
        borderStyle:"solid",
        borderPosition:"outside",
        iconLayoutAlign:"start",
        iconMarginTop:0,
        iconMarginBottom:0,
        /* shared text styling */
        listTextColor:"#000000",
        listTextOpacity:255,
        listTextSize:14,
        /* shared spacing / divider */
        listDividerEnabled:true,
        listDividerStyle:"dotted",
        listDividerColor:"#bcbcbc",
        listDividerOpacity:255,
        listMarginTop:8,
        listMarginBottom:8,
        listItemRowGap:8,
        listIconTextGapPx:12,
        /* alignment / layout */
        listIconsAlign:"flex-start",
        listIconsLayout:"row",
        listIconsDisplayMode:"iconText",
        /* compound items */
        listItemCount:3,
        listItems:[
            { faIcon:{ name:"faLayerGroup", type:"fas" }, listText:"No Code", listTextParagraph:null, backgroundColor:"#ffffff", backgroundOpacity:0, iconColor:{ type:"mainColor", index:0 }, iconOpacity:255, iconSize:18, containerSize:32, iconShape:"circle", iconCornerRadius:12, borderColor:{ type:"textColor", index:0 }, borderOpacity:255, borderWidth:0, borderStyle:"solid", borderPosition:"outside", iconLayoutAlign:"start" },
            { faIcon:{ name:"faHeart", type:"fas" }, listText:"Elements", listTextParagraph:null, backgroundColor:"#ffffff", backgroundOpacity:0, iconColor:{ type:"mainColor", index:0 }, iconOpacity:255, iconSize:18, containerSize:32, iconShape:"circle", iconCornerRadius:12, borderColor:{ type:"textColor", index:0 }, borderOpacity:255, borderWidth:0, borderStyle:"solid", borderPosition:"outside", iconLayoutAlign:"start" },
            { faIcon:{ name:"faWandMagicSparkles", type:"fas" }, listText:"Modern", listTextParagraph:null, backgroundColor:"#ffffff", backgroundOpacity:0, iconColor:{ type:"mainColor", index:0 }, iconOpacity:255, iconSize:18, containerSize:32, iconShape:"circle", iconCornerRadius:12, borderColor:{ type:"textColor", index:0 }, borderOpacity:255, borderWidth:0, borderStyle:"solid", borderPosition:"outside", iconLayoutAlign:"start" }
        ],
        preview:{ label: "List iCons", icon: "modeling" }
    },
    "Button Group":{
        type:"list",
        id:"List-",
        listIconsElement:true,
        buttonMultiElement:true,
        /* shared icon styling */
        backgroundColor:"#ffffff",
        backgroundOpacity:0,
        iconColor:{ type:"mainColor", index:0 },
        iconOpacity:255,
        iconSize:18,
        containerSize:32,
        iconShape:"circle",
        iconCornerRadius:12,
        borderColor:{ type:"textColor", index:0 },
        borderOpacity:255,
        borderWidth:0,
        borderStyle:"solid",
        borderPosition:"outside",
        iconLayoutAlign:"start",
        iconMarginTop:0,
        iconMarginBottom:0,
        /* shared text styling */
        listTextColor:"#000000",
        listTextOpacity:255,
        listTextSize:14,
        /* shared spacing / divider */
        listDividerEnabled:true,
        listDividerStyle:"dotted",
        listDividerColor:"#bcbcbc",
        listDividerOpacity:255,
        listMarginTop:8,
        listMarginBottom:8,
        listItemRowGap:16,
        listIconTextGapPx:12,
        /* alignment / layout */
        listIconsAlign:"flex-start",
        listIconsLayout:"row",
        listIconsDisplayMode:"iconText",
        buttonFill:"#333333",
        buttonLabelColor:"#ffffff",
        buttonFillOpacity:255,
        buttonLabelOpacity:255,
        button2Fill:"#333333",
        button2LabelColor:"#ffffff",
        button2FillOpacity:255,
        button2LabelOpacity:255,
        /* compound items */
        listItemCount:2,
        listItems:[
            { faIcon:{ name:"faLayerGroup", type:"fas" }, listText:"Button 1", listTextParagraph:null, backgroundColor:"#ffffff", backgroundOpacity:0, iconColor:{ type:"mainColor", index:0 }, iconOpacity:255, iconSize:18, containerSize:32, iconShape:"circle", iconCornerRadius:12, borderColor:{ type:"textColor", index:0 }, borderOpacity:255, borderWidth:0, borderStyle:"solid", borderPosition:"outside", iconLayoutAlign:"start" },
            { faIcon:{ name:"faHeart", type:"fas" }, listText:"Button 2", listTextParagraph:null, backgroundColor:"#ffffff", backgroundOpacity:0, iconColor:{ type:"mainColor", index:0 }, iconOpacity:255, iconSize:18, containerSize:32, iconShape:"circle", iconCornerRadius:12, borderColor:{ type:"textColor", index:0 }, borderOpacity:255, borderWidth:0, borderStyle:"solid", borderPosition:"outside", iconLayoutAlign:"start" }
        ],
        preview:{ label: "Button Group", icon: "smart_button" }
    },
    "List iMage":{
        type:"list",
        id:"List-",
        listImageElement:true,
        containerSize:60,
        iconShape:"circle",
        iconCornerRadius:12,
        iconMarginTop:0,
        iconMarginBottom:0,
        listTextColor:"#000000",
        listTextOpacity:255,
        listTextSize:14,
        listDividerEnabled:true,
        listDividerStyle:"dotted",
        listDividerColor:"#bcbcbc",
        listDividerOpacity:255,
        listVerticalTimelineDivider:false,
        listItemsIconAlign:"start",
        listImageSplitArrangement:"textLeft",
        listMarginTop:8,
        listMarginBottom:8,
        listItemRowGap:8,
        listIconTextGapPx:12,
        listItemRowFrameEnabled:false,
        listItemRowFrameColor:{ type:"textColor", index:0 },
        listItemRowFrameOpacity:40,
        listItemRowFrameRadius:18,
        listItemRowFrameGlass:55,
        listImageCaptionEnabled:false,
        listImageCaptionFontSize:18,
        listImageCaptionOffsetY:0,
        listImageCaptionColor:{ type:"textColor", index:0 },
        listImageCaptionColorOpacity:255,
        listItemCount:3,
        listItems:[
            { listText:LIST_IMAGE_DEFAULT_TEXT, listAsideText:LIST_IMAGE_ASIDE_DEFAULT_TEXT, listTextParagraph:null, src:"", aspectRatio:"auto", brightness:0, borderRadius:12, imageMarginTop:8, imageMarginBottom:8, containerSize:60, iconShape:"circle", iconCornerRadius:12, badge:{ show:false, label:"", bold:false, position:"tl", size:"13", variant:"pill", textAlign:"center", hover:false }, linkEnabled:false, linkUrl:"", linkTarget:"_self" },
            { listText:LIST_IMAGE_DEFAULT_TEXT, listAsideText:LIST_IMAGE_ASIDE_DEFAULT_TEXT, listTextParagraph:null, src:"", aspectRatio:"auto", brightness:0, borderRadius:12, imageMarginTop:8, imageMarginBottom:8, containerSize:60, iconShape:"circle", iconCornerRadius:12, badge:{ show:false, label:"", bold:false, position:"tl", size:"13", variant:"pill", textAlign:"center", hover:false }, linkEnabled:false, linkUrl:"", linkTarget:"_self" },
            { listText:LIST_IMAGE_DEFAULT_TEXT, listAsideText:LIST_IMAGE_ASIDE_DEFAULT_TEXT, listTextParagraph:null, src:"", aspectRatio:"auto", brightness:0, borderRadius:12, imageMarginTop:8, imageMarginBottom:8, containerSize:60, iconShape:"circle", iconCornerRadius:12, badge:{ show:false, label:"", bold:false, position:"tl", size:"13", variant:"pill", textAlign:"center", hover:false }, linkEnabled:false, linkUrl:"", linkTarget:"_self" }
        ],
        preview:{
            label: "List iMage",
            icon: "image-plus",
            lucideIcon: "ImagePlus",
            lucideSize:28,
            lucideStrokeWidth:2.2
        }
    },
    "List Box":{
        type:"lstb",
        id:"Lstb-",
        preview:{
            label: "List Box",
            icon: "grid-2x2",
            lucideIcon: "Grid2x2",
            lucideSize:27,
            lucideStrokeWidth:2.2
        },
        listBoxVariant:"icon_text",
        listBoxItems: LIST_BOX_DEFAULT_TITLES.map((t, i) => listBoxDefaultItem(t, i)),
        listBoxItemCount:4,
        listBoxPerViewDesktop:2,
        listBoxPerViewTablet:2,
        listBoxPerViewMobile:1,
        listBoxIconBgWidth:56,
        listBoxIconSize:26,
        listBoxIconFrameEnabled:true,
        listBoxIconShape:"circle",
        listBoxIconCornerRadius:12,
        listBoxMarginTop:8,
        listBoxMarginBottom:8,
        listBoxGridFullFrameEnabled:false,
        listBoxGridDividerStyle:"dashed",
        listBoxGridDividerColor:"#d8d8d8",
        listBoxGridDividerOpacity:255
    },
    Carousel:{
        type:"crl",
        id:"Crl-",
        preview:{ label: "Carousel", icon: "switch_access_2" },
        /* ค่าเริ่มต้นให้ตรงกับ client carouselElementConfig — รูปภาพ+ข้อความบนแคนวาส */
        carouselVariant:"image_text",
        carouselSlides:[
            { src:"", aspectRatio:"16 / 9", borderRadius:8, title:"", subtitle:"Design your own unique website", faIcon:{ name:"faStar", type:"fas" } },
            { src:"", aspectRatio:"16 / 9", borderRadius:8, title:"", subtitle:"Design your own unique website", faIcon:{ name:"faHeart", type:"fas" } },
            { src:"", aspectRatio:"16 / 9", borderRadius:8, title:"", subtitle:"Design your own unique website", faIcon:{ name:"faLightbulb", type:"fas" } },
            { src:"", aspectRatio:"16 / 9", borderRadius:8, title:"", subtitle:"Design your own unique website", faIcon:{ name:"faStar", type:"fas" } },
            { src:"", aspectRatio:"16 / 9", borderRadius:8, title:"", subtitle:"Design your own unique website", faIcon:{ name:"faHeart", type:"fas" } },
            { src:"", aspectRatio:"16 / 9", borderRadius:8, title:"", subtitle:"Design your own unique website", faIcon:{ name:"faLightbulb", type:"fas" } }
        ],
        carouselItemCount:6,
        carouselPerViewDesktop:3,
        carouselPerViewTablet:2,
        carouselPerViewMobile:1,
        carouselGap:12,
        carouselNavShape:"square",
        carouselNavColor:"#e2e8f0",
        carouselNavColorOpacity:255,
        carouselNavActiveColor:{ type:"mainColor", index:0 },
        carouselNavActiveColorOpacity:255,
        carouselAutoplay:false,
        carouselAutoplayDelayMs:4500,
        carouselMarginTop:8,
        carouselMarginBottom:8
    },
    "Data Slider":{
        type:"dts",
        id:"Dts-",
        preview:{
            label:"Data Slider",
            icon:"gallery-thumbnails",
            lucideIcon:"GalleryThumbnails",
            lucideSize:27,
            lucideStrokeWidth:2.2
        },
        dataSliderItemCount:6,
        dataSliderItems:[
            { id:"slide-1", label:"Slide 1", disabled:false, elements:[] },
            { id:"slide-2", label:"Slide 2", disabled:false, elements:[] },
            { id:"slide-3", label:"Slide 3", disabled:false, elements:[] },
            { id:"slide-4", label:"Slide 4", disabled:false, elements:[] },
            { id:"slide-5", label:"Slide 5", disabled:false, elements:[] },
            { id:"slide-6", label:"Slide 6", disabled:false, elements:[] }
        ],
        dataSliderActiveId:"slide-1",
        dataSliderPerViewDesktop:3,
        dataSliderPerViewTablet:2,
        dataSliderPerViewMobile:1,
        dataSliderGap:12,
        dataSliderNavShape:"square",
        dataSliderNavShowOnWebsite:true,
        dataSliderNavColor:"#d8d8d8",
        dataSliderNavColorOpacity:255,
        dataSliderNavActiveColor:{ type:"mainColor", index:0 },
        dataSliderNavActiveColorOpacity:255,
        dataSliderAutoplay:false,
        dataSliderAutoplayDelayMs:4500,
        dataSliderMarginTop:8,
        dataSliderMarginBottom:8
    },
    Catagories:{
        type:"ctg",
        id:"Ctg-",
        preview:{
            label:"Catagories",
            icon:"tags",
            lucideIcon:"Tags",
            lucideSize:27,
            lucideStrokeWidth:2.2
        },
        catagoriesTabs:[
            {
                id:"ctg-tab-1",
                label:"Categories 1",
                itemCount:3,
                activeItemId:"cat-1",
                items:[
                    { id:"cat-1", label:"Catagory 1", disabled:false, elements:[] },
                    { id:"cat-2", label:"Catagory 2", disabled:false, elements:[] },
                    { id:"cat-3", label:"Catagory 3", disabled:false, elements:[] }
                ]
            },
            {
                id:"ctg-tab-2",
                label:"Categories 2",
                itemCount:3,
                activeItemId:"cat-1",
                items:[
                    { id:"cat-1", label:"Catagory 1", disabled:false, elements:[] },
                    { id:"cat-2", label:"Catagory 2", disabled:false, elements:[] },
                    { id:"cat-3", label:"Catagory 3", disabled:false, elements:[] }
                ]
            },
            {
                id:"ctg-tab-3",
                label:"Categories 3",
                itemCount:3,
                activeItemId:"cat-1",
                items:[
                    { id:"cat-1", label:"Catagory 1", disabled:false, elements:[] },
                    { id:"cat-2", label:"Catagory 2", disabled:false, elements:[] },
                    { id:"cat-3", label:"Catagory 3", disabled:false, elements:[] }
                ]
            }
        ],
        catagoriesActiveCategoryId:"ctg-tab-1",
        catagoriesItemCount:3,
        catagoriesItems:[
            { id:"cat-1", label:"Catagory 1", disabled:false, elements:[] },
            { id:"cat-2", label:"Catagory 2", disabled:false, elements:[] },
            { id:"cat-3", label:"Catagory 3", disabled:false, elements:[] }
        ],
        catagoriesActiveId:"cat-1",
        catagoriesPerViewDesktop:3,
        catagoriesPerViewTablet:2,
        catagoriesPerViewMobile:1,
        catagoriesGap:8,
        catagoriesItemGap:12,
        catagoriesButtonFill:{ type:"mainColor", index:0 },
        catagoriesButtonFillOpacity:255,
        catagoriesButtonBorderColor:"#ffffff",
        catagoriesButtonBorderOpacity:255,
        catagoriesButtonTextColor:"#ffffff",
        catagoriesButtonTextOpacity:255,
        catagoriesButtonInactiveFill:"#d8d8d8",
        catagoriesButtonInactiveFillOpacity:255,
        catagoriesButtonInactiveBorderColor:"#ffffff",
        catagoriesButtonInactiveBorderOpacity:255,
        catagoriesButtonInactiveTextColor:"#ffffff",
        catagoriesButtonInactiveTextOpacity:255,
        catagoriesButtonBold:true,
        catagoriesButtonBorderWidth:0,
        catagoriesButtonRadius:10,
        catagoriesButtonFontSize:12,
        catagoriesButtonPaddingX:14,
        catagoriesButtonPaddingY:8,
        catagoriesMarginTop:8,
        catagoriesMarginBottom:8
    },
    Tabs:{
        type:"tabs",
        id:"Tabs-",
        tabsAlign:"start",
        tabsStyle:"line",
        tabsGap:8,
        tabsMarginTop:8,
        tabsMarginBottom:8,
        tabsItemPaddingX:14,
        tabsItemPaddingY:10,
        tabsItemRadius:8,
        tabsActiveId:"tab-1",
        tabsItems:[
            { id:"tab-1", label:"Unique Website", disabled:false, elements:[] },
            { id:"tab-2", label:"Drag and Drop", disabled:false, elements:[] }
        ],
        tabsLabelColor:{ type:"mainColor", index:0 },
        tabsLabelColorOpacity:255,
        tabsActiveColorMode:"tab",
        tabsActiveTabColor:{ type:"mainColor", index:0 },
        tabsActiveTabColorOpacity:255,
        tabsInactiveColorMode:"text",
        tabsInactiveLabelColor:"#d8d8d8",
        tabsInactiveLabelColorOpacity:255,
        tabsInactiveTabColor:"#d8d8d8",
        tabsInactiveTabColorOpacity:255,
        tabsActiveIconColor:{ type:"mainColor", index:0 },
        tabsActiveIconColorOpacity:255,
        tabsInactiveIconColor:"#d8d8d8",
        tabsInactiveIconColorOpacity:255,
        preview:{
            label: "Tabs",
            icon: "table_rows_narrow",
            lucideIcon: "AppWindowMac",
            lucideStrokeWidth: 2.2
        }
    },
    Accordion:{
        type:"acc",
        id:"Acc-",
        accordionAlign:"start",
        accordionTabLabelStyle:"text",
        accordionLabelFontSize:13,
        accordionGap:8,
        accordionTabHeight:48,
        accordionBorderWidth:1,
        accordionItemRadius:8,
        accordionMarginTop:8,
        accordionMarginBottom:8,
        accordionActiveColorMode:"tab",
        accordionInactiveColorMode:"tab",
        accordionActiveId:"acc-1",
        accordionItems:[
            { id:"acc-1", label:"Section 1", content:"Content for section 1 goes here.", disabled:false, elements:[], faIcon:{ name:null, type:null } },
            { id:"acc-2", label:"Section 2", content:"Content for section 2 goes here.", disabled:false, elements:[], faIcon:{ name:null, type:null } },
            { id:"acc-3", label:"Section 3", content:"Content for section 3 goes here.", disabled:false, elements:[], faIcon:{ name:null, type:null } }
        ],
        accordionActiveTabColor:{ type:"mainColor", index:0 },
        accordionActiveTabColorOpacity:255,
        accordionActiveLabelColor:"#ffffff",
        accordionActiveLabelColorOpacity:255,
        accordionActiveBorderColor:{ type:"mainColor", index:0 },
        accordionActiveBorderColorOpacity:255,
        accordionActiveToggleColor:"#ffffff",
        accordionActiveToggleColorOpacity:255,
        accordionInactiveTabColor:"#ffffff",
        accordionInactiveTabColorOpacity:255,
        accordionInactiveLabelColor:"#111827",
        accordionInactiveLabelColorOpacity:255,
        accordionInactiveBorderColor:"#d8d8d8",
        accordionInactiveBorderColorOpacity:255,
        accordionInactiveToggleColor:"#6b7280",
        accordionInactiveToggleColorOpacity:255,
        preview:{
            label: "Accordion",
            icon: "square-chevron-down",
            lucideIcon: "SquareChevronDown",
            lucideSize:28,
            lucideStrokeWidth:2.2
        }
    },
    "Data Table":{
        type:"tbl",
        id:"Tbl-",
        tableColumns:[
            { id:"col-1", label:"Name", align:"left", width:220 },
            { id:"col-2", label:"Role", align:"left", width:180 },
            { id:"col-3", label:"Status", align:"center", width:140 }
        ],
        tableRows:[
            ["Alice Johnson","Admin","Active"],
            ["Bob Smith","Editor","Pending"],
            ["Charlie Davis","Author","Inactive"]
        ],
        tableHeaderBg:"#f8fafc",
        tableHeaderText:"#0f172a",
        tableBodyText:"#111827",
        tableBorderColor:"#d8d8d8",
        tableZebra:true,
        tableZebraBg:"#f8fafc",
        tableHeaderBold:true,
        tableFontSize:14,
        tableCellPaddingX:12,
        tableCellPaddingY:10,
        tableMinWidth:640,
        tableMarginTop:8,
        tableMarginBottom:8,
        preview:{
            label:"Data Table",
            icon:"table",
            lucideIcon:"TableProperties",
            lucideSize:28,
            lucideStrokeWidth:2.2
        }
    },
    "Between":{
        type:"btw",
        id:"Btw-",
        betweenTextMode:"both",
        betweenLeftText:"Bangkok",
        betweenRightText:"Japan",
        betweenFrameEnabled:false,
        betweenFrameColor:"#d4d4d8",
        betweenFrameColorOpacity:255,
        betweenGlass:55,
        betweenInsetX:10,
        betweenInsetY:8,
        betweenFontSize:15,
        betweenBold:false,
        betweenLineStyle:"dashed",
        betweenLineColor:{ type:"textColor", index:0 },
        betweenLineOpacity:255,
        betweenLineWidth:1,
        betweenLineGap:8,
        betweenRadius:18,
        betweenIcon:{ name:"faStar", type:"fas" },
        betweenIconSize:18,
        betweenIconColor:"#ffffff",
        betweenIconColorOpacity:255,
        betweenIconBgColor:"#000000",
        betweenIconBgOpacity:255,
        betweenIconCircleSize:36,
        betweenMarginTop:8,
        betweenMarginBottom:8,
        preview:{ label:"Between", icon:"horizontal_rule" }
    },
    Post:{
        type:"post",
        id:"Post-",
        postLayoutMode:"image_content",
        postHeadingEnabled:true,
        postHeading:"HEADING",
        postHeadingColor:{ type:"mainColor", index:0 },
        postHeadingColorOpacity:255,
        postHeadingBold:true,
        postHeadingFontSize:20,
        postHeadingGap:18,
        postHeadingDisplay:"vertical",
        postDividerEnabled:true,
        postDividerStyle:"dotted",
        postDividerWidth:1,
        postDividerColor:"#d8d8d8",
        postDividerColorOpacity:255,
        postAlign:"center",
        postMarginTop:8,
        postMarginBottom:8,
        postElements:[],
        preview:{
            label: "Post",
            icon: "layers-2",
            lucideIcon: "Layers2",
            lucideSize:28,
            lucideStrokeWidth: 2.2
        }
    },
    Counter:{
        type:"ctn",
        id:"Ctn-",
        counterStartValue:0,
        counterTargetValue:500,
        counterDurationMs:800,
        counterTrigger:"viewport",
        counterDirection:"up",
        counterFontSize:42,
        counterBold:true,
        counterAlign:"left",
        counterColor:"#333333",
        counterColorOpacity:255,
        counterMarginTop:8,
        counterMarginBottom:8,
        counterCompositionEnabled:false,
        counterCompositionLeft:"",
        counterCompositionRight:"",
        counterCompositionFontSize:18,
        counterCompositionColor:{ type:"textColor", index:0 },
        counterCompositionColorOpacity:255,
        counterCompositionGapPx:32,
        preview:{ label: "Counter", icon: "timer" }
    },
    iCons:{
        type:"icon",
        id:"icon-",
        faIcon:{ name:"faStar", type:"fas" },
        backgroundColor:"#333333",
        backgroundOpacity:255,
        iconColor:"#ffffff",
        iconOpacity:255,
        iconSize:28,
        containerSize:64,
        iconShape:"circle",
        iconCornerRadius:12,
        borderColor:{ type:"textColor", index:0 },
        borderOpacity:255,
        borderWidth:0,
        borderStyle:"solid",
        borderPosition:"outside",
        iconLayoutAlign:"start",
        iconMarginTop:8,
        iconMarginBottom:8,
        linkEnabled:false,
        linkUrl:"",
        linkTarget:"_self",
        preview:{ label: "iCons", icon: "token" }
    },
}



module.exports = elements