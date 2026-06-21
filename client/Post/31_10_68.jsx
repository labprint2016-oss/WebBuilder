import React, {
    useEffect,
    useMemo,
    useState,
    useRef,
    useLayoutEffect,
    use,
  } from "react";
  import {
    TextField,
    Box,
    Button,
    InputAdornment,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    FormControlLabel,
    Radio,
    Switch,
    Stack,
    Popper,
    RadioGroup
  } from "@mui/material";
  import IconLucide from "../IconLucide";
  import { styled } from '@mui/material/styles';
  import {
    Bluetooth,
    Palette,
    TextAlignStart,
    TextAlignCenter,
    TextAlignEnd,
    Settings,
    Bold,
    Check,
    BadgeJapaneseYenIcon,
    CirclePower,
    Github,
    Wifi,
    SunMoon,
    Telescope,
    Projector,
    HardDrive
  } from "lucide-react";
  import { Description } from "@headlessui/react";
  import { blue } from "@mui/material/colors";
  import { createPost } from "../../Functions/post";
  import lodash, { isNull, set, transform } from "lodash";
  import Icons  from "./Icons";
  
  
  const Post = ({post,setPost,handleSubmit,mainTheme}) => {
  
  
  
    const [newPost,setNewPost] = useState(post)
  
  
    
    const [allColors,setAllColors] = useState([])
    const basicColors = ["#000000","#6a6a6a","#d8d8d8","#FFFFFF"]
  
    useEffect(()=>{
        if(allColors.length === 0 && mainTheme){
          setAllColors([])
          mainTheme?.mainColor.map((color,i)=>{
            setAllColors(prev=>{
              return [...prev,{type:"mainColor",index:i}]
            })
          })
          mainTheme?.textColor.map((color,i)=>{
            setAllColors(prev=>{
              return [...prev,{type:"textColor",index:i}]
            })
          })
          mainTheme?.otherColor.map((color,i)=>{
            setAllColors(prev=>{
              return [...prev,{type:"otherColor",index:i}]
            })
          })
          basicColors.map((color)=>{
            setAllColors(prev=>{
              return [...prev,color]
            })
          })
  
  
        }else return
         
      
    },[mainTheme])
  
  
  
  
  
  
    const AntSwitch = styled(Switch)(({ theme }) => ({
      width: 28,
      height: 16,
      padding: 0,
      marginRight:10,
      display: 'flex',
      '&:active': {
        '& .MuiSwitch-thumb': {
          width: 15,
          
        },
        '& .MuiSwitch-switchBase.Mui-checked': {
          transform: 'translateX(9px)',
          
        },
      },
      '& .MuiSwitch-switchBase': {
        padding: 2,
        '&.Mui-checked': {
          transform: 'translateX(12px)',
          
          color: '#fff',
          '& + .MuiSwitch-track': {
            opacity: 1,
  
          },
        },
      },
      '& .MuiSwitch-thumb': {
        boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
        width: 12,
        height: 12,
        borderRadius: 6,
        transition: theme.transitions.create(['width'], {
          duration: 200,
        }),
        
      },
      '& .MuiSwitch-track': {
        borderRadius: 16 / 2,
        opacity: 1,
        backgroundColor: 'rgba(0,0,0,.25)',
        boxSizing: 'border-box',
        ".dark &":{backgroundColor: 'rgba(255,255,255,.25)'},
        
      },
    }));
  
    const COMMON_FIELD_SX = {
    
      "& .MuiInputLabel-root": { fontSize: 14, color: "#aaaaaa" },
      "& .MuiInputLabel-root.Mui-focused, \
         & .MuiInputLabel-root.Mui-error, \
         & .MuiInputLabel-root.Mui-disabled": {
        color: "#aaaaaa",
      },
      "& .MuiFormLabel-asterisk": { color: "#aaaaaa" },
    
      "& .MuiOutlinedInput-input": { fontSize: 15,height:14},
      "& .MuiSelect-select": { fontSize: 15,padding:1.5 ,pt:1.8,pl:3},
    
      "& .MuiInputLabel-root.MuiInputLabel-shrink": {
        transform: "translate(14px, -12px) scale(1)",
      },
      "& .MuiOutlinedInput-notchedOutline legend": {
        fontSize: 15, lineHeight: "20px", padding: "0 0px",
      },
    
      "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(0,0,0,0.23)", borderWidth: "1px",
      },
      "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(0,0,0,0.23)", borderWidth: "1px",
      },
      "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(0,0,0,0.23)", borderWidth: "1px",
      },
      "& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(0,0,0,0.23)",
      },
    };
  
  
    const fileRef = useRef(null);
    const titleSettingPopperRef = useRef(null);
    const [openTitlePopper,setOpenTitlePopper] = useState(false)
    const desSettingPopperRef = useRef(null);
    const [openDesPopper,setOpenDesPopper] = useState(false)
    const imageSettingPopperRef = useRef(null);
    const [openImagePopper,setOpenImagePopper] = useState(false)
    const linkTargetPopperRef = useRef(null);
    const [openLinkTargetPopper,setOpenLinkTargetPopper] = useState(false)
    const textSettingPopperRef = useRef(null);
    const [openTextSettingPopper,setOpentextSettingPopper] = useState(false)
    const linkButtonTargetPopperRef1 = useRef(null);
    const [openLinkButtonTargetPopper1,setOpenLinkButtonTargetPopper1] = useState(false)
    const linkButtonTargetPopperRef2 = useRef(null);
    const [openLinkButtonTargetPopper2,setOpenLinkButtonTargetPopper2] = useState(false)
    const buttonSettingPopperRef1 = useRef(null);
    const [openButtonPopper1,setOpenButtonPopper1] = useState(false)
    const buttonSettingPopperRef2 = useRef(null);
    const [openButtonPopper2,setOpenButtonPopper2] = useState(false)
  
  
    const colColorRef = useRef([]);
    const [openColColor,setOpenColColor] = useState(-1)
    const btnColorRef = useRef([]);
    const [openBtnColor,setOpenBtnColor] = useState(-1)
    const btnTextColorRef = useRef([]);
    const [openBtnTextColor,setOpenBtnTextColor] = useState(-1)
    const decorationColorRef = useRef(null);
    const [openDecorationColor,setOpenDecorationColor] = useState(false)
    const textColorRef = useRef(null);
    const [openTextColor,setOpenTextColor] = useState(false)
  
    const iconColRef = useRef([]);
    const [openIconCol,setOpenIconCol] = useState(-1)
    const iconBtnRef = useRef([]);
    const [openIconBtn,setOpenIconBtn] = useState(-1)
  
    const imgTypes = ["รูปภาพ","แกเลอรี่","วิดีโอ"]
    const decorationTypes = ["แถบ","ริบบิ้น","วงกลม"]
    const columnAmount = [2,3,4]
    const buttonAmount = [1,2]
    const textAlign = [{key:"start",Icon:TextAlignStart},{key:"center",Icon:TextAlignCenter},{key:"end",Icon:TextAlignEnd}]
  
  
  
    const openPopper=(type="")=>{
      setOpenColColor(-1)
      setOpenBtnColor(-1)
      setOpenBtnTextColor(-1)
      setOpenDecorationColor(false) 
      setOpenTextColor(false)
      setOpenIconCol(-1)
      setOpenIconBtn(-1)
  
  
  
      if(type==="title"){
        setOpenTitlePopper(true)
    }else{
      setOpenTitlePopper(false)
    }
  
    if(type==="des"){
      setOpenDesPopper(true)
  }else{
    setOpenDesPopper(false)
  }
  
    if(type==="image"){
      setOpenImagePopper(true)
  }else{
    setOpenImagePopper(false)
  }
  
  if(type==="link"){
    setOpenLinkTargetPopper(true)
  }else{
    setOpenLinkTargetPopper(false)
  }
  
  if(type==="linkBTN-1"){
    setOpenLinkButtonTargetPopper1(true)
  }else{
    setOpenLinkButtonTargetPopper1(false)
  }
  
  if(type==="linkBTN-2"){
    setOpenLinkButtonTargetPopper2(true)
  }else{
    setOpenLinkButtonTargetPopper2(false)
  }
  
  if(type==="btn-1"){
    setOpenButtonPopper1(true)
  }else{
    setOpenButtonPopper1(false)
  }
  
  if(type==="btn-2"){
    setOpenButtonPopper2(true)
  }else{
    setOpenButtonPopper2(false)
  }
  
  if(type==="text"){
    setOpentextSettingPopper(true)
  }else{
    setOpentextSettingPopper(false)
  }
  
  }
  
  const setBgColor = (color)=>{
    if(typeof color === "string"){
      return color
    }else{
      return mainTheme[color.type][color.index]
    }
  }
  
  
  const closeColorPopper = ()=>{
    setOpenColColor(-1)
    setOpenBtnColor(-1)
    setOpenBtnTextColor(-1)
    setOpenDecorationColor(false)
    setOpenTextColor(false)
    setOpenIconCol(-1)
    setOpenIconBtn(-1)
  }
  
  
  
  
  
  
  
  
  useEffect(()=>{
    const handleClick = (e)=>{
      const {clientX:x,clientY:y} = e
      const el = document.elementFromPoint(x,y)
      const nearestPopper = el?.closest('.MuiPopper-root')
      const nearestButton = el?.closest('button[name="BTN_POPPER"]')
      if(!nearestPopper && !nearestButton){
        openPopper()
      }
    }
    window.addEventListener("click",handleClick)
    return ()=>{
      window.removeEventListener("click",handleClick)
    }
  },[openImagePopper,openTitlePopper,openLinkTargetPopper,openTextSettingPopper,openDesPopper,openLinkButtonTargetPopper1,openLinkButtonTargetPopper2,openButtonPopper1,openButtonPopper2])
  
  
  
  
  
  
  
    const handleChangeForNumber = (e,change=1,data=null)=>{
     const {name,value} = e.target
  
      const onChange = (e)=>{
        if(change === 2){
          const {mainField,index} = data
          handleChange2(mainField,index,e)
         }else{
          handleChange(e)
         }
      }
  
     let event = {target:{name,value,files:null}}
     if(value === ""){
      onChange(event)
      return
     }
     const number = Number(value)
     if(isNaN(number))return
     event = {...event,target:{...event.target,value:number}}
     onChange(event)
    
     
    }
  
    const handleChange = (e)=>{
      const {name,value,files} = e.target
      setPost(prev=>{
        return {...prev,[name]:name === "image" ? files[0]:value}
      })
    }
  
    const handleChange2 =  (mainField,index,e)=>{
      const {name,value} = e.target
      setPost(prev=>{
        if(index >= 0 && typeof mainField === "string"){
          const field = prev[mainField]
          field[index][name] = value
          return {...prev,[mainField]:field}
        }else if(Array.isArray(mainField)){
          const [first,second] = mainField
          const field = prev[first]
          field[index][second][name] = value
          return {...prev,[first]:field}
        }
       else{
        return {...prev,[mainField]:{...prev[mainField],[name]:value}}
       }
      })
    }
  
  
  
  
  
    const isImageOrVideo = ()=>{
      const bool =  ["รูปภาพ","วิดีโอ"].includes(post.imageType)
      if(bool){
        return true
      }else{
        return false
      }
    }
  
  
    useEffect(()=>{
      console.log(post);
    },[post])
  
  
    function MainLabel({ label }) {
  
      const labelSwitch = ["ปุ่มกด","ตกแต่งรูปภาพ","เพิ่มเติม"]
      const check = label === "ปุ่มกด"?post.isButton:label === "ตกแต่งรูปภาพ"?post.imageDecoration:post.isColumn
    
      return (
        <div className="flex items-center gap-2  mb-2">
           {labelSwitch.includes(label)  && (
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                 <AntSwitch  inputProps={{ 'aria-label': 'ant design' }} checked={check} onChange={()=>{
                  if(label === "ปุ่มกด"){
                    setPost(prev=>{return {...prev,isButton:!prev.isButton}})
                  }else if(label === "ตกแต่งรูปภาพ"){
                    setPost(prev=>{return {...prev,imageDecoration:!prev.imageDecoration}})
                  }else{
                    setPost(prev=>{return {...prev,isColumn:!prev.isColumn}})
                  }
                  
                 }}/>
              </Stack>
             
            )}
          <span className="text-dark dark:text-white/80 text-[13px] font-bold">
            {label}
          </span>
          {!labelSwitch.includes(label) && (<div className={`border-b border-gray-500/50 flex-1`}></div>)}
          
         
        </div>
      );
    }
  
  
    function ColorPopper({open,popperRef,elementColor,field,isChange2=1,mainField="",index=-1,opacity=null}) {
  
  
  
  
        return (   <Popper
          open={open}
          placement="bottom-start"
          anchorEl={popperRef}
          modifiers={[
            { name: "offset", options: { offset: [0,7] } },
            { name: "flip", enabled: true },
            { name: "preventOverflow", options: { padding:8 } },
          ]}
          disablePortal
          sx={{ zIndex: 1300 }}
        >
           <div className="w-[363px] rounded-md bg-[#374151] px-[5px] pt-[8px] pb-[15px]  flex flex-col gap-2 " >
  
  
          {opacity !== null && (
              <div className="pt-[2px] pb-[2px] px-[8px]">
              <input
              type="range"
              name="opacity"
              min={0}
              max={255}
              value={opacity}
              step={1}
              onChange={(e)=>{
                handleChangeForNumber(e,isChange2,{mainField,index})
              }}
              className="
              w-full appearance-none h-2 rounded-full
              bg-zinc-200
              dark:bg-zinc-700
        
      
              [background-image:linear-gradient(to_right,var(--fill),var(--fill))]
              [background-repeat:no-repeat]
              [background-size:var(--pos,0%)_100%]
      
              [&::-webkit-slider-runnable-track]:border-0
              [&::-moz-range-track]:border-0
      
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-emerald-300
              dark:[&::-webkit-slider-thumb]:bg-emerald-300
              [&::-webkit-slider-thumb]:bg-slate-900
              [&::-webkit-slider-thumb]:border-0
      
              [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-emerald-300
              [&::-moz-range-thumb]:border-0
            "
            style={{ ['--pos']: `${(opacity/255)*100}%`,['--fill']: `black` }}
              />
          </div>
          )}
         
              
                  
                <div className="grid grid-cols-10 place-items-center gap-[6px_0px]">
                    {allColors.map((color,i)=>
                    {
                      
                      const bgColor = typeof color === "string" ? color : mainTheme[color.type][color.index]
                     const value = color
                     let margin = ""      
  
                     if(i % 8 !== 0 && (i+1) % 8 !== 0){
                      margin += `mx-[65.75px] `
                     }
  
                      return (
                        <div className={`col col-sapn-1 ${margin}`} key={i}>
                          <button className={`size-[25px] rounded-full border flex items-center justify-center`} style={{backgroundColor:bgColor}} onClick={()=>{
                            const event = {target:{name:field,value:value}}
                            console.log(event);
                            if(isChange2 === 2){
                              handleChange2(mainField,index,event)
                            }else{
                              handleChange(event)
                            }
  
  
                          }}
                          >
                            {(lodash.isEqual(elementColor,value) || elementColor === value) && (
                              <Check className="size-4 text-white" strokeWidth={4}/>
                            )}
                          </button>
                        </div>
                        
                      )
                    }
                   )}
                </div>
              
              
  
  
           </div>
        </Popper>)
    }
  
    function IconPopper({open,popperRef,icon,field,mainField,index}) {
      return (   <Popper
        open={open}
        placement="bottom-start"
        anchorEl={popperRef}
        modifiers={[
          { name: "offset", options: { offset: [0,7] } },
          { name: "flip", enabled: true },
          { name: "preventOverflow", options: { padding:8 } },
        ]}
        disablePortal
        sx={{ zIndex: 1300 }}
      >
         <div className="w-[363px] rounded-md bg-[#374151] px-[5px] pt-[8px] pb-[15px]  flex flex-col gap-2 ">
            
                
              <div className="grid grid-cols-10 place-items-center gap-[6px_0px]">
                  {Icons.map((Icon,i)=>
                  {
  
                    
                    const iconName = Icon.displayName
                   let margin = ""      
  
                   if(i % 8 !== 0 && (i+1) % 8 !== 0){
                    margin += `mx-[65.75px] `
                   }
  
                    return (
                      <div className={`col col-sapn-1 ${margin}`} key={i}>
                        <button className={`size-[25px] rounded-full border flex items-center justify-center`} style={{backgroundColor:`${icon === iconName?"black":"white"}`}} onClick={()=>{
                            const event = {target:{name:field,value:iconName}}
                              handleChange2(mainField,index,event)
                      
  
                          }}>
                            <Icon className={`size-4 text-${icon === iconName?"white":"black"}`} strokeWidth={2.2}/>
                       
                        </button>
                      </div>
                      
                    )
                  }
                 )}
              </div>
            
            
  
  
         </div>
      </Popper>)
  }
  
  
  
  
    
    return (
      <main
        className="content-area flex-1 overflow-y-auto p-4 sm:p-6 "
        area="main"
      >
       
        {" "}
        <div className="min-h-[600px] rounded-xl border border-white/10 bg-white/5">
          <div className="container mx-auto relative z-10">
          <div className="grid grid-cols-12 gap-4">
        {/* หัวข้อ */}
        <div className="col-span-6 mt-3">
        <FormControl fullWidth id="color-input" sx={{height:47}}>
          {/* กล่อง input + ปุ่ม ต่อกันแนบสนิท */}
          <Box sx={{ display: "flex", width: "100%" }} >
          <TextField
            fullWidth
            value={post.title.text}
            variant="outlined"
            label="ชื่อหัวข้อ"
            name="text"
            onChange={(e)=>{
              handleChange2("title",-1,e)
            }}
            sx={{...COMMON_FIELD_SX,"& .MuiOutlinedInput-root": {
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
            }}}
            slotProps={{
              input: {
                sx: { fontSize: 15 },
                startAdornment: (
                  <InputAdornment position="start"></InputAdornment>
                ),
              },
            }}
          />
           <Button
              variant="contained"
              name="BTN_POPPER"
              ref={titleSettingPopperRef}
              onClick={()=>{
                if(openTitlePopper){
                  setOpenTitlePopper(false)
                  return
                }
                openPopper("title")
              }}
              sx={(t) => {
             
        
                return {
                  boxShadow: "none",      // 1) เอาเงาออก
                  height: 47,
                  minWidth: 35,
                  px: 2.5,
                  borderTopLeftRadius: 0, // ให้แนบกับ TextField
                  borderBottomLeftRadius: 0,
                  borderTopRightRadius: 5,
                  borderBottomRightRadius: 5,
                  // 2) ให้ปุ่มมี "กรอบ" แบบเดียวกับ TextField
                  border: "1px solid",
                  borderColor: "#A1A1AA",
        
                  // (ตัวเลือก) ถ้าไม่อยากให้มีเส้นหนาตรงรอยต่อกลาง
                  // ให้ตัดเส้นซ้ายของปุ่มออก จะเหลือเส้นของ TextField ฝั่งเดียวพอดี
                  // borderLeftWidth: 0,
        
                  // สีพื้นหลังของปุ่ม = สีที่เลือก
                  backgroundColor: "#374151",
                  "&:hover": {
                    backgroundColor:"#374151" || "transparent",
                    borderColor: "#A1A1AA",
                    boxShadow: "none", // กันธีมเพิ่มเงาตอนโฮเวอร์
                  },
        
                  // สีตัวอักษร - ให้สืบทอดจาก parent; คุณจะเปลี่ยนเป็นขาว/ดำเองก็ได้
                  color: "inherit",
  
                  ".dark &": {
                    borderColor: "#494d55", // สีกรอบใน dark (เทาเข้มที่คุณใช้กับ TextField)
                    "&:hover": { borderColor: "#494d55" },
                    borderTopRightRadius: 5,
                    borderBottomRightRadius: 5,
                  },
                };
              }}
        
            >
              
              <Settings className="size-5 text-white" strokeWidth={2}/>
            </Button>
          </Box>
        </FormControl>
        <Popper open={openTitlePopper} anchorEl={titleSettingPopperRef.current} placement="top-start" modifiers={[
                  { name: "offset", options: { offset: [0,14] } },
                  { name: "flip", enabled: true },
                  { name: "preventOverflow", options: { padding:8 } },
                ]}  disablePortal
                sx={{ zIndex: 1300 }}>
  
                <div className="relative rounded-md bg-[#374151]  px-[5px] pt-[14px] pb-[11px]">
                <div className="pointer-events-none absolute -top-2 left-6">
    <div className="relative h-0 w-0">
     
      <div
        className="
          absolute -top-[1px] left-1/2 -translate-x-1/2
          h-0 w-0
          border-l-[9px] border-l-transparent
          border-r-[9px] border-r-transparent
          border-b-[9px] border-b-[#374151]
          dark:border-b-zinc-800
        "
      />
      {/* แถบปิดฐาน: กลบเส้นตรงฐานสามเหลี่ยม */}
     
    </div>
  </div>
                  <div className="pt-[5px] pb-[2px] px-[8px] grid grid-cols-[repeat(4,1fr)_auto] gap-2 items-center">
                      <div className="col-span-2">
                      <Box sx={{ display: "flex", width: "100%" }} >
                      <TextField sx={{...COMMON_FIELD_SX ,"& .MuiOutlinedInput-root": { height: 35,color:"whitesmoke" ,borderTopRightRadius:0,borderBottomRightRadius:0,width:100},"& .MuiInputLabel-root": { fontSize: 12.5,color:"whitesmoke"},
            "& .MuiInputLabel-root.Mui-focused": { fontSize: 12.5,color:"whitesmoke"},
            "& .MuiInputLabel-root.Mui-error": { color: "whitesmoke !important" },
    "& .MuiInputLabel-root.Mui-disabled": { color: "whitesmoke !important" },
            // 🔑 ตัดเส้นขอบด้านขวาออกทุกสถานะ
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#5e636d !important",
              
            },
            "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#5e636d",
            },
            // focus
            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#5e636d",
            },
            "& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline": {
            },}}  variant="outlined" label="ขนาด" value={post.title.size} name="size" onChange={(e)=>handleChangeForNumber(e,2,{mainField:"title",index:-1})} slotProps={{
              input: {
                sx: { fontSize: 15 },
                startAdornment: (
                  <InputAdornment position="start"></InputAdornment>
                ),
              },
            }}/>
                    <Box
            sx={{
              height: 35,
              borderLeftWidth:0,   
              backgroundColor:"#454b57",         
              px: 2,                
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              color: "white",
  
              border: "1px solid",
              borderColor: "#5e636d",
              borderTopLeftRadius: 0,
              borderBottomLefttRadius: 0,
              borderTopRightRadius: 5,
              borderBottomRightRadius: 5,
  
              ".dark &": {
                color: "gray",
                borderColor: "#494d55",
              },
            }}
          >
            PX
          </Box>
                      </Box>
                   </div>
                <div className="col-span-2">
                <Box sx={{ display: "flex", width: "100%" }} >
                <TextField sx={{...COMMON_FIELD_SX ,"& .MuiOutlinedInput-root": { height: 35,color:"whitesmoke" ,borderTopRightRadius:0,borderBottomRightRadius:0,width:100},"& .MuiInputLabel-root": { fontSize: 12.5,color:"whitesmoke"},
            "& .MuiInputLabel-root.Mui-focused": { fontSize: 12.5,color:"whitesmoke"},
            "& .MuiInputLabel-root.Mui-error": { color: "whitesmoke !important" },
    "& .MuiInputLabel-root.Mui-disabled": { color: "whitesmoke !important" },
            // 🔑 ตัดเส้นขอบด้านขวาออกทุกสถานะ
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#5e636d !important",
              
            },
            "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#5e636d",
            },
            // focus
            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#5e636d",
            },
            "& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline": {
            },}}  variant="outlined" label="ระยะห่าง" value={post.title.padding} name="padding" onChange={(e)=>handleChangeForNumber(e,2,{mainField:"title",index:-1})} slotProps={{
              input: {
                sx: { fontSize: 15 },
                startAdornment: (
                  <InputAdornment position="start"></InputAdornment>
                ),
              },
            }}/>
                         <Box
            sx={{
              height: 35,
              borderLeftWidth:0,   
              backgroundColor:"#454b57",         
              px: 2,                
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              color: "white",
  
              border: "1px solid",
              borderColor: "#5e636d",
              borderTopLeftRadius: 0,
              borderBottomLefttRadius: 0,
              borderTopRightRadius: 5,
              borderBottomRightRadius: 5,
  
              ".dark &": {
                color: "gray",
                borderColor: "#494d55",
              },
            }}
          >
            PX
          </Box>
                </Box>
             </div>
                      <div className="col-span-1">
                      <Box  sx={{ display: "inline-flex", width: "max-content", justifySelf: "start" }}>
                      <Button sx={{backgroundColor:post.title.bold?"#454b57":"#e5e5e5",color:post.title.bold?"white":"black",minWidth:38,height:35,}} onClick={()=>setPost(prev=>{
                        return {...prev,title:{...prev.title,bold:!prev.title.bold}}
                      })}><Bold strokeWidth={3} size={18} /></Button>
                      </Box>
                      </div>
                     
                  </div>
                </div>
                
        </Popper>
          
        </div>
        {/* หมวดหมู่ */}
        <div className="col-span-6 mt-3">
          <FormControl fullWidth variant="outlined" sx={COMMON_FIELD_SX}>
            <InputLabel id="cat-label">หมวดหมู่</InputLabel>
            <Select
              labelId="cat-label"
              id="category"
              name="category"
              value={post.category}
              onChange={handleChange}
              label="หมวดหมู่"
              MenuProps={{
                PaperProps: {
                  elevation: 0,
                  sx: {
                    boxShadow: 'none',                         // ตัดเงา
                  },
                },
              }}
            >
              <MenuItem value={"-"} sx={{ fontSize: 15 }}>ไม่มีหมวดหมู่</MenuItem>
              <MenuItem value={"ยุโรป"} sx={{ fontSize: 15 }}>ยุโรป</MenuItem>
              <MenuItem value={"ญี่ปุ่น"} sx={{ fontSize: 15 }}>ญี่ปุ่น</MenuItem>
              <MenuItem value={"อเมริกา"} sx={{ fontSize: 15 }}>อเมริกา</MenuItem>
            </Select>
          </FormControl>
        </div>
        {/* รูปภาพ */}
        <div className="col-span-6 mt-3">
        <FormControl fullWidth id="color-input" sx={{height:47}}>
          {/* กล่อง input + ปุ่ม ต่อกันแนบสนิท */}
          <Box sx={{ display: "flex", width: "100%" }} >
            <TextField
            value={post.image?.name ?? ""}
            label="รูปภาพ"
              className="rounded-l-[5px] "
              InputProps={{ readOnly: true }}
              slotProps={{
                input: {
                  sx: { fontSize: 15 },
                  startAdornment: (
                    <InputAdornment position="start"></InputAdornment>
                  ),
                },
              }}
              sx={(t) => {
  
                return {
                  ...COMMON_FIELD_SX,
                  flex: 1,
                  
                  "& .MuiOutlinedInput-root": {
                    height: 47,
                    borderTopRightRadius: 0,
                    backgroundColor: "transparent",
                    borderBottomRightRadius: 0,
                    color:"rgba(0,0,0,0.23)",
                    
                  },
                  "& .MuiOutlinedInput-input": {
                    letterSpacing: "0.4px",   // เว้นระยะตัวอักษรเล็กน้อย (ปรับได้ 0.2–0.6px)
                    fontSize:14,
          
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(0,0,0,0.23)",
                    borderRightWidth: 0
                  },
                  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(0,0,0,0.23)",
                    borderRightWidth: 0
                  },
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(0,0,0,0.23)",
                    borderWidth: 1,
                    borderRightWidth: 0
                  },
  
                  ".dark & .MuiOutlinedInput-root": {
                    height: 47,
                    backgroundColor: "transparent",
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                    borderRightWidth: 0,
                  
                    color:"white"
                  },
  
                  ".dark & .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#494d55",
                    borderTopLeftRadius: 5,
                    borderBottomLeftRadius: 5,
                    borderRightWidth: 0
                  },
                  ".dark & .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#494d55",
                    borderRightWidth: 0
                  },
                  ".dark & .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#494d55",
                    borderWidth: 1,
                    borderRightWidth: 0
                  },
                }
              }}
              size="small"
              variant="outlined"
            />
  
            <Button
              variant="contained"
              onClick={() => fileRef.current?.click()}
              sx={(t) => {
             
        
                return {
                  boxShadow: "none",      // 1) เอาเงาออก
                  minWidth: 35,
                  px: 2.5,
                  borderTopLeftRadius: 0, // ให้แนบกับ TextField
                  borderBottomLeftRadius: 0,
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
        
                  // 2) ให้ปุ่มมี "กรอบ" แบบเดียวกับ TextField
                  border: "1px solid",
                  borderColor: "#A1A1AA",
        
                  // (ตัวเลือก) ถ้าไม่อยากให้มีเส้นหนาตรงรอยต่อกลาง
                  // ให้ตัดเส้นซ้ายของปุ่มออก จะเหลือเส้นของ TextField ฝั่งเดียวพอดี
                  // borderLeftWidth: 0,
        
                  // สีพื้นหลังของปุ่ม = สีที่เลือก
                  backgroundColor: "#374151",
                  "&:hover": {
                    backgroundColor:"#374151" || "transparent",
                    borderColor: "#A1A1AA",
                    boxShadow: "none", // กันธีมเพิ่มเงาตอนโฮเวอร์
                  },
        
                  // สีตัวอักษร - ให้สืบทอดจาก parent; คุณจะเปลี่ยนเป็นขาว/ดำเองก็ได้
                  color: "inherit",
  
                  ".dark &": {
                    borderColor: "#494d55", // สีกรอบใน dark (เทาเข้มที่คุณใช้กับ TextField)
                    "&:hover": { borderColor: "#494d55" },
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                  },
                };
              }}
        
            >
              <div className="text-white">อัปโหลด</div>
              <input ref={fileRef} type="file" name="image" hidden onChange={handleChange}/>
              
            </Button>
            <Button
              variant="contained"
              name="BTN_POPPER"
              ref={imageSettingPopperRef}
              onClick={()=>{
                if(openImagePopper){
                  setOpenImagePopper(false)
                  return
                }
                openPopper("image")
              }}
              sx={(t) => {
             
        
                return {
                  boxShadow: "none",      // 1) เอาเงาออก
                  height: 47,
                  minWidth: 35,
                  px: 2.5,
                  borderTopLeftRadius: 0, // ให้แนบกับ TextField
                  borderBottomLeftRadius: 0,
                  borderTopRightRadius: 5,
                  borderBottomRightRadius: 5,
        
                  // 2) ให้ปุ่มมี "กรอบ" แบบเดียวกับ TextField
                  border: "1px solid",
                  borderColor: "#A1A1AA",
        
                  // (ตัวเลือก) ถ้าไม่อยากให้มีเส้นหนาตรงรอยต่อกลาง
                  // ให้ตัดเส้นซ้ายของปุ่มออก จะเหลือเส้นของ TextField ฝั่งเดียวพอดี
                  // borderLeftWidth: 0,
        
                  // สีพื้นหลังของปุ่ม = สีที่เลือก
                  backgroundColor: "#374151",
                  "&:hover": {
                    backgroundColor:"#374151" || "transparent",
                    borderColor: "#A1A1AA",
                    boxShadow: "none", // กันธีมเพิ่มเงาตอนโฮเวอร์
                  },
        
                  // สีตัวอักษร - ให้สืบทอดจาก parent; คุณจะเปลี่ยนเป็นขาว/ดำเองก็ได้
                  color: "inherit",
  
                  ".dark &": {
                    borderColor: "#494d55", // สีกรอบใน dark (เทาเข้มที่คุณใช้กับ TextField)
                    "&:hover": { borderColor: "#494d55" },
                    borderTopRightRadius: 5,
                    borderBottomRightRadius: 5,
                  },
                };
              }}
        
            >
              
              <Settings className="size-5 text-white" strokeWidth={2}/>
            </Button>
          </Box>
        </FormControl>
        <Popper open={openImagePopper} anchorEl={imageSettingPopperRef.current} placement="top-start" modifiers={[
                  { name: "offset", options: { offset: [0,14] } },
                  { name: "flip", enabled: true },
                  { name: "preventOverflow", options: { padding:8 } },
                ]}  disablePortal
                sx={{ zIndex: 1300 }}>
  
                <div className="relative rounded-md bg-[#374151] px-[5px] pt-[14px] pb-[11px]">
                  
                  <div className="pt-[5px] pb-[2px] px-[8px] grid grid-cols-3 gap-2 flex items-center">
                      <div className="col-span-1">
                        <Box sx={{ display: "flex", width: "100%" }}>
                        <TextField sx={{...COMMON_FIELD_SX ,"& .MuiOutlinedInput-root": { height: 35,borderTopRightRadius:0,borderBottomRightRadius:0,width:100,color:"whitesmoke" },"& .MuiInputLabel-root": { fontSize: 12.5,color:"whitesmoke"},
            "& .MuiInputLabel-root.Mui-focused": { fontSize: 12.5,color:"whitesmoke"},
            "& .MuiInputLabel-root.Mui-error": { color: "whitesmoke !important" },
    "& .MuiInputLabel-root.Mui-disabled": { color: "whitesmoke !important" },
            // 🔑 ตัดเส้นขอบด้านขวาออกทุกสถานะ
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#5e636d !important",
              borderRightWidth: 0,
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
              // กันรอยเส้นฝั่งขวา
              borderRightStyle: "none",
            },
            "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#5e636d",
              borderRightWidth: 0,
            },
            // focus
            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#5e636d",
              borderRightWidth: 0,
            },
            "& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline": {
              borderRightWidth: 0,
            },}}  variant="outlined" label="ความสูง" value={post.height} name="height" onChange={handleChangeForNumber} slotProps={{
              input: {
                sx: { fontSize: 15 },
                startAdornment: (
                  <InputAdornment position="start"></InputAdornment>
                ),
              },
            }}/>
               <Box
            sx={{
              height: 35,
              borderLeftWidth:0,   
              backgroundColor:"#454b57",         
              px: 2,                
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              color: "white",
  
              border: "1px solid",
              borderColor: "#5e636d",
              borderTopRightRadius: 5,
              borderBottomRightRadius: 5,
  
              ".dark &": {
                color: "gray",
                borderColor: "#494d55",
              },
            }}
          >
            PX
          </Box>
                      </Box>
                   </div>
                   <div className="col-span-1">
                        <Box sx={{ display: "flex", width: "100%" }}>
                        <TextField sx={{...COMMON_FIELD_SX ,"& .MuiOutlinedInput-root": { height: 35,borderTopRightRadius:0,borderBottomRightRadius:0,width:100,color:"whitesmoke" },"& .MuiInputLabel-root": { fontSize: 12.5,color:"whitesmoke"},
            "& .MuiInputLabel-root.Mui-focused": { fontSize: 12.5,color:"whitesmoke"},
            "& .MuiInputLabel-root.Mui-error": { color: "whitesmoke !important" },
    "& .MuiInputLabel-root.Mui-disabled": { color: "whitesmoke !important" },
            // 🔑 ตัดเส้นขอบด้านขวาออกทุกสถานะ
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#5e636d !important",
              borderRightWidth: 0,
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
              // กันรอยเส้นฝั่งขวา
              borderRightStyle: "none",
            },
            "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#5e636d",
              borderRightWidth: 0,
            },
            // focus
            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#5e636d",
              borderRightWidth: 0,
            },
            "& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline": {
              borderRightWidth: 0,
            },}}  variant="outlined" label="ความกว้าง" value={post.width} name="width" onChange={handleChangeForNumber} slotProps={{
              input: {
                sx: { fontSize: 15 },
                startAdornment: (
                  <InputAdornment position="start"></InputAdornment>
                ),
              },
            }}/>
               <Box
            sx={{
              height: 35,
              borderLeftWidth:0,   
              backgroundColor:"#454b57",         
              px: 2,                
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              color: "white",
  
              border: "1px solid",
              borderColor: "#5e636d",
              borderTopRightRadius: 5,
              borderBottomRightRadius: 5,
  
              ".dark &": {
                color: "gray",
                borderColor: "#494d55",
              },
            }}
          >
            PX
          </Box>
                      </Box>
                   </div>
                   <div className="col-span-1">
                        <Box sx={{ display: "flex", width: "100%" }}>
                        <TextField sx={{...COMMON_FIELD_SX ,"& .MuiOutlinedInput-root": { height: 35,borderTopRightRadius:0,borderBottomRightRadius:0,width:100,color:"whitesmoke" },"& .MuiInputLabel-root": { fontSize: 12.5,color:"whitesmoke"},
            "& .MuiInputLabel-root.Mui-focused": { fontSize: 12.5,color:"whitesmoke"},
            "& .MuiInputLabel-root.Mui-error": { color: "whitesmoke !important" },
    "& .MuiInputLabel-root.Mui-disabled": { color: "whitesmoke !important" },
            // 🔑 ตัดเส้นขอบด้านขวาออกทุกสถานะ
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#5e636d !important",
              borderRightWidth: 0,
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
              // กันรอยเส้นฝั่งขวา
              borderRightStyle: "none",
            },
            "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#5e636d",
              borderRightWidth: 0,
            },
            // focus
            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#5e636d",
              borderRightWidth: 0,
            },
            "& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline": {
              borderRightWidth: 0,
            },}}  variant="outlined" label="ความโค้งมน" value={post.borderRadius} name="borderRadius" onChange={handleChangeForNumber} slotProps={{
              input: {
                sx: { fontSize: 15 },
                startAdornment: (
                  <InputAdornment position="start"></InputAdornment>
                ),
              },
            }}/>
               <Box
            sx={{
              height: 35,
              borderLeftWidth:0,   
              backgroundColor:"#454b57",         
              px: 2,                
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              color: "white",
  
              border: "1px solid",
              borderColor: "#5e636d",
              borderTopRightRadius: 5,
              borderBottomRightRadius: 5,
  
              ".dark &": {
                color: "gray",
                borderColor: "#494d55",
              },
            }}
          >
            PX
          </Box>
                      </Box>
                   </div>
                      
                  </div>
                  <div className="pointer-events-none absolute -bottom-2 left-6">
    
    <div className="relative h-0 w-0">
      
      {/* ชั้นนอก: เส้นขอบ */}
     
      {/* ชั้นใน: พื้นหลัง (ซ้อนทับให้เห็นเป็นขอบสวย ๆ) */}
      <div
        className="
          absolute -bottom-[1px] left-1/2 -translate-x-1/2
          h-0 w-0
          border-l-[9px] border-l-transparent
          border-r-[9px] border-r-transparent
          border-t-[9px] border-t-[#374151]
          dark:border-t-zinc-800
        "
      />
      <div
        className="
          absolute -bottom-[1px] left-1/2 -translate-x-1/2 mb-[8px]
          w-[16px] h-[2px]
          bg-[#374151] dark:bg-zinc-800
        "
      />
  
    </div>
  </div>
                </div>
                
        </Popper>
        </div>
        <div className="col-span-6 mt-3"/> 
         {/* ประเภทรูปภาพ */}
        <div className={`col-span-4 mt-3`}>
            <MainLabel label={"ประเภทรูปภาพ"}/>
            <div className="grid grid-cols-12 flex items-center justify-center">
            {imgTypes.map((type,i)=>(
              <div key={i} className="col-span-3 text-black dark:text-white ">
              <FormControlLabel
                
                control={
                  <Radio
                  name="imageType"
                  value={type}
                  onChange={handleChange}
                  checked={post.imageType === type}
                    sx={(t) => {
                
              
                      return {           // ยังไม่ติ๊ก = สีตามโหมด
                        color: "black",
                        "&.Mui-checked": { color: "black" }, // ติ๊กแล้ว = สีเดียวกัน
                        "&:hover": { backgroundColor: "transparent" },
                        "&.Mui-checked:hover": { backgroundColor: "transparent" },
                      };
                    }}
                  />
                }
                label={type}
                sx={{ "& .MuiFormControlLabel-label": { fontSize: 15, color: "inherit" } }}
              />
            </div>
            ))}
            </div>
        </div>
        {/* ลิงค์ */}
        {isImageOrVideo() && (<div className="col-span-4 mt-3 flex items-center">
        <FormControl fullWidth id="color-input" sx={{height:47}}>
        <Box sx={{ display: "flex", width: "100%" }}>
              <Box
         sx={{
           height: 47,
           borderRightWidth:0,   
           backgroundColor:"#374151",         
           px: 2,                
           display: "flex",
           alignItems: "center",
           justifyContent: "center",
           fontSize: 12,
           color: "white",
  
           border: "1px solid",
           borderColor: "#A1A1AA",
           borderTopLeftRadius: 5,
           borderBottomLeftRadius: 5,
  
           ".dark &": {
             color: "gray",
             borderColor: "#494d55",
           },
         }}
       >
         URL
       </Box>
             <TextField
         fullWidth
         variant="outlined"
         name="url"
         value={post.link.url}
         type="url"
         onChange={(e)=>{
          handleChange2("link",-1,e)
         }}
         label="ลิงค์"
         sx={{...COMMON_FIELD_SX,"& .MuiOutlinedInput-root": {
           height: 47,
           borderTopLeftRadius: 0,
           borderBottomLeftRadius: 0,
           borderTopRightRadius: post.imageType === "รูปภาพ"?0:5,
           borderBottomRightRadius: post.imageType === "รูปภาพ"?0:5,
         },
     
         // 🔑 ตัดเส้นขอบด้านขวาออกทุกสถานะ
         "& .MuiOutlinedInput-notchedOutline": { borderLeftWidth: 0},
         "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
           borderLeftWidth: 0,
           
         },
         "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
           borderLeftWidth: 0,
         },
         "& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline": {
           borderLeftWidth: 0,
         },
     
         // ถ้ามีโหมด .dark
         ".dark & .MuiOutlinedInput-notchedOutline": { borderLeftWidth: 0 },
         ".dark & .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
           borderLeftWidth: 0,
         },
         ".dark & .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
           borderLeftWidth: 0,
         },}}
         slotProps={{
           input: {
             sx: { fontSize: 15 },
             startAdornment: (
               <InputAdornment position="start"></InputAdornment>
             ),
           },
         }}
       />
       {post.imageType === "รูปภาพ" && ( 
       <Button
              variant="contained"
              name="BTN_POPPER"
              ref={linkTargetPopperRef}
              onClick={()=>{
                if(openLinkTargetPopper){
                  setOpenLinkTargetPopper(false)
                  return
                }
                openPopper("link")
              }}
              sx={(t) => {
             
        
                return {
                  boxShadow: "none",      // 1) เอาเงาออก
                  height: 47,
                  minWidth: 35,
                  px: 2.5,
                  borderTopLeftRadius: 0, // ให้แนบกับ TextField
                  borderBottomLeftRadius: 0,
                  borderTopRightRadius: 5,
                  borderBottomRightRadius: 5,
        
                  // 2) ให้ปุ่มมี "กรอบ" แบบเดียวกับ TextField
                  border: "1px solid",
                  borderColor: "#A1A1AA",
        
                  // (ตัวเลือก) ถ้าไม่อยากให้มีเส้นหนาตรงรอยต่อกลาง
                  // ให้ตัดเส้นซ้ายของปุ่มออก จะเหลือเส้นของ TextField ฝั่งเดียวพอดี
                  // borderLeftWidth: 0,
        
                  // สีพื้นหลังของปุ่ม = สีที่เลือก
                  backgroundColor: "#374151",
                  "&:hover": {
                    backgroundColor:"#374151" || "transparent",
                    borderColor: "#A1A1AA",
                    boxShadow: "none", // กันธีมเพิ่มเงาตอนโฮเวอร์
                  },
        
                  // สีตัวอักษร - ให้สืบทอดจาก parent; คุณจะเปลี่ยนเป็นขาว/ดำเองก็ได้
                  color: "inherit",
  
                  ".dark &": {
                    borderColor: "#494d55", // สีกรอบใน dark (เทาเข้มที่คุณใช้กับ TextField)
                    "&:hover": { borderColor: "#494d55" },
                    borderTopRightRadius: 5,
                    borderBottomRightRadius: 5,
                  },
                };
              }}
        
            >
              
              <Settings className="size-5 text-white" strokeWidth={2}/>
            </Button>)}
       
             </Box>
        </FormControl>
        <Popper open={openLinkTargetPopper} anchorEl={linkTargetPopperRef.current} placement="top-start" modifiers={[
                  { name: "offset", options: { offset: [0,14] } },
                  { name: "flip", enabled: true },
                  { name: "preventOverflow", options: { padding:8 } },
                ]}  disablePortal
                sx={{ zIndex: 1300 }}>
  
                <div className="relative rounded-md dark:bg-white bg-[#374151] px-[5px] ">
                  
          
                  <div className=" px-[8px] grid grid-cols-2 gap-2 flex items-center">
                      <div className="col-span-2">
                      <FormControl component="fieldset" fullWidth>
    <Box sx={{ display: "flex", width: "100%" }}>
      <RadioGroup
        row
        name="target"
        value={post.link.target}                            // คุมด้วย state
        onChange={(e) => handleChange2("link", -1, e)}      // อัปเดตครั้งเดียว
      >
        <FormControlLabel
          value="_self"
          control={<Radio sx={{ color: "whitesmoke", "&.Mui-checked": { color: "whitesmoke" } }} />}
          label="หน้าเดิม"    // _self = เปิดหน้าเดิม
          sx={{"& .MuiFormControlLabel-label": { fontSize: 13,color:"whitesmoke" } }}
        />
        <FormControlLabel
          value="_blank"
          control={<Radio sx={{ color: "whitesmoke", "&.Mui-checked": { color: "whitesmoke" } }} />}
          label="แท็บใหม่"    // _blank = เปิดแท็บใหม่
          sx={{"& .MuiFormControlLabel-label": { fontSize: 13,color:"whitesmoke" } }}
        />
      </RadioGroup>
    </Box>
  </FormControl>
                   </div>
                
                      
                  </div>
                  <div className="pointer-events-none absolute -bottom-2 left-6">
    
    <div className="relative h-0 w-0">
      
      {/* ชั้นนอก: เส้นขอบ */}
     
      {/* ชั้นใน: พื้นหลัง (ซ้อนทับให้เห็นเป็นขอบสวย ๆ) */}
      <div
        className="
          absolute -bottom-[1px] left-1/2 -translate-x-1/2
          h-0 w-0
          border-l-[9px] border-l-transparent
          border-r-[9px] border-r-transparent
          border-t-[9px] border-t-[#374151]
          dark:border-t-zinc-800
        "
      />
      <div
        className="
          absolute -bottom-[1px] left-1/2 -translate-x-1/2 mb-[8px]
          w-[16px] h-[2px]
          bg-[#374151] dark:bg-zinc-800
        "
      />
  
    </div>
  </div>
                </div>
                
        </Popper>
              
            
         
     </div>)}
         {/* คำบรรยาย */}
         <div className="col-span-12">
          <Box sx={{width:"100%",display:"flex"}}>
          <TextField
            fullWidth
            variant="outlined"
            name="text"
            value={post.description.text}
            onChange={(e)=>{
              handleChange2("description",-1,e)
            }}
            label="คำบรรยาย"
            sx={{...COMMON_FIELD_SX,"& .MuiOutlinedInput-root": {borderTopRightRadius:0,borderBottomRightRadius:0}}}
            slotProps={{
              input: {
                sx: { fontSize: 15 },
                startAdornment: (
                  <InputAdornment position="start"></InputAdornment>
                ),
              },
            }}
          />
          <Button
              variant="contained"
              name="BTN_POPPER"
              ref={desSettingPopperRef}
              onClick={()=>{
                if(openDesPopper){
                  setOpenDesPopper(false)
                  return
                }
                openPopper("des")
              }}
              sx={(t) => {
             
        
                return {
                  boxShadow: "none",      // 1) เอาเงาออก
                  height: 47,
                  minWidth: 35,
                  px: 2.5,
                  borderTopLeftRadius: 0, // ให้แนบกับ TextField
                  borderBottomLeftRadius: 0,
                  borderTopRightRadius: 5,
                  borderBottomRightRadius: 5,
        
                  // 2) ให้ปุ่มมี "กรอบ" แบบเดียวกับ TextField
                  border: "1px solid",
                  borderColor: "#A1A1AA",
        
                  // (ตัวเลือก) ถ้าไม่อยากให้มีเส้นหนาตรงรอยต่อกลาง
                  // ให้ตัดเส้นซ้ายของปุ่มออก จะเหลือเส้นของ TextField ฝั่งเดียวพอดี
                  // borderLeftWidth: 0,
        
                  // สีพื้นหลังของปุ่ม = สีที่เลือก
                  backgroundColor: "#374151",
                  "&:hover": {
                    backgroundColor:"#374151" || "transparent",
                    borderColor: "#A1A1AA",
                    boxShadow: "none", // กันธีมเพิ่มเงาตอนโฮเวอร์
                  },
        
                  // สีตัวอักษร - ให้สืบทอดจาก parent; คุณจะเปลี่ยนเป็นขาว/ดำเองก็ได้
                  color: "inherit",
  
                  ".dark &": {
                    borderColor: "#494d55", // สีกรอบใน dark (เทาเข้มที่คุณใช้กับ TextField)
                    "&:hover": { borderColor: "#494d55" },
                    borderTopRightRadius: 5,
                    borderBottomRightRadius: 5,
                  },
                };
              }}
        
            >
              
              <Settings className="size-5 text-white" strokeWidth={2}/>
            </Button>
          </Box>
          <Popper open={openDesPopper} anchorEl={desSettingPopperRef.current} placement="top-start" modifiers={[
                  { name: "offset", options: { offset: [0,14] } },
                  { name: "flip", enabled: true },
                  { name: "preventOverflow", options: { padding:8 } },
                ]}  disablePortal
                sx={{ zIndex: 1300 }}>
  
                <div className="relative rounded-md bg-[#374151]  px-[5px] pt-[14px] pb-[11px]">
       
                  <div className="pt-[5px] pb-[2px] px-[8px] grid grid-cols-[repeat(4,1fr)_auto] gap-2 items-center">
                      <div className="col-span-2">
                      <Box sx={{ display: "flex", width: "100%" }} >
                      <TextField sx={{...COMMON_FIELD_SX ,"& .MuiOutlinedInput-root": { height: 35,color:"whitesmoke" ,borderTopRightRadius:0,borderBottomRightRadius:0,width:100},"& .MuiInputLabel-root": { fontSize: 12.5,color:"whitesmoke"},
            "& .MuiInputLabel-root.Mui-focused": { fontSize: 12.5,color:"whitesmoke"},
            "& .MuiInputLabel-root.Mui-error": { color: "whitesmoke !important" },
    "& .MuiInputLabel-root.Mui-disabled": { color: "whitesmoke !important" },
            // 🔑 ตัดเส้นขอบด้านขวาออกทุกสถานะ
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#5e636d !important",
              
            },
            "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#5e636d",
            },
            // focus
            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#5e636d",
            },
            "& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline": {
            },}}  variant="outlined" label="ขนาด" value={post.description.size} name="size" onChange={(e)=>handleChangeForNumber(e,2,{mainField:"description",index:-1})} slotProps={{
              input: {
                sx: { fontSize: 15 },
                startAdornment: (
                  <InputAdornment position="start"></InputAdornment>
                ),
              },
            }}/>
                    <Box
            sx={{
              height: 35,
              borderLeftWidth:0,   
              backgroundColor:"#454b57",         
              px: 2,                
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              color: "white",
  
              border: "1px solid",
              borderColor: "#5e636d",
              borderTopLeftRadius: 0,
              borderBottomLefttRadius: 0,
              borderTopRightRadius: 5,
              borderBottomRightRadius: 5,
  
              ".dark &": {
                color: "gray",
                borderColor: "#494d55",
              },
            }}
          >
            PX
          </Box>
                      </Box>
                   </div>
                <div className="col-span-2">
                <Box sx={{ display: "flex", width: "100%" }} >
                <TextField sx={{...COMMON_FIELD_SX ,"& .MuiOutlinedInput-root": { height: 35,color:"whitesmoke" ,borderTopRightRadius:0,borderBottomRightRadius:0,width:100},"& .MuiInputLabel-root": { fontSize: 12.5,color:"whitesmoke"},
            "& .MuiInputLabel-root.Mui-focused": { fontSize: 12.5,color:"whitesmoke"},
            "& .MuiInputLabel-root.Mui-error": { color: "whitesmoke !important" },
    "& .MuiInputLabel-root.Mui-disabled": { color: "whitesmoke !important" },
            // 🔑 ตัดเส้นขอบด้านขวาออกทุกสถานะ
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#5e636d !important",
              
            },
            "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#5e636d",
            },
            // focus
            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#5e636d",
            },
            "& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline": {
            },}}  variant="outlined" label="ระยะห่าง" value={post.description.padding} name="padding" onChange={(e)=>handleChangeForNumber(e,2,{mainField:"description",index:-1})} slotProps={{
              input: {
                sx: { fontSize: 15 },
                startAdornment: (
                  <InputAdornment position="start"></InputAdornment>
                ),
              },
            }}/>
                         <Box
            sx={{
              height: 35,
              borderLeftWidth:0,   
              backgroundColor:"#454b57",         
              px: 2,                
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              color: "white",
  
              border: "1px solid",
              borderColor: "#5e636d",
              borderTopLeftRadius: 0,
              borderBottomLefttRadius: 0,
              borderTopRightRadius: 5,
              borderBottomRightRadius: 5,
  
              ".dark &": {
                color: "gray",
                borderColor: "#494d55",
              },
            }}
          >
            PX
          </Box>
                </Box>
             </div>
                  
                     
                  </div>
                  <div className="pointer-events-none absolute -bottom-2 right-6">
    
    <div className="relative h-0 w-0">
      
      {/* ชั้นนอก: เส้นขอบ */}
     
      {/* ชั้นใน: พื้นหลัง (ซ้อนทับให้เห็นเป็นขอบสวย ๆ) */}
      <div
        className="
          absolute -bottom-[1px] left-1/2 -translate-x-1/2
          h-0 w-0
          border-l-[9px] border-l-transparent
          border-r-[9px] border-r-transparent
          border-t-[9px] border-t-[#374151]
          dark:border-t-zinc-800
        "
      />
      <div
        className="
          absolute -bottom-[1px] left-1/2 -translate-x-1/2 mb-[8px]
          w-[16px] h-[2px]
          bg-[#374151] dark:bg-zinc-800
        "
      />
  
    </div>
  </div>
                </div>
                
        </Popper>
         
        </div>
        {/* เพิ่มเติม */}
        <div className="col-span-12 mt-3">
            <MainLabel label={"เพิ่มเติม"}/>
            {post.isColumn && (
              <div className="grid grid-cols-12 flex items-center justify-center">
              {columnAmount.map((amount,i)=>(
                <div key={i} className="col-span-1 text-black dark:text-white ">
                <FormControlLabel
                  
                  control={
                    <Radio
                    name="columnAmount"
                    value={amount}
                    onChange={handleChangeForNumber}
                    checked={post.columnAmount == amount}
                      sx={(t) => {
                  
                
                        return {           // ยังไม่ติ๊ก = สีตามโหมด
                          color: "black",
                          "&.Mui-checked": { color: "black" }, // ติ๊กแล้ว = สีเดียวกัน
                          "&:hover": { backgroundColor: "transparent" },
                          "&.Mui-checked:hover": { backgroundColor: "transparent" },
                        };
                      }}
                    />
                  }
                  label={`${amount} คอมลัม`}
                  sx={{ "& .MuiFormControlLabel-label": { fontSize: 15, color: "inherit" } }}
                />
              </div>
              ))}
              </div>
            )}
            
        </div>
        {/* คอมลัม */}
        {post.isColumn && (
           <div className="col-span-12 ">
           <div className="grid grid-cols-4 gap-4">
             {post.columns.map((col,i)=>{
  
               const {icon,text,color,opacity} = col
               if(i+1 > post.columnAmount){
                 return (<div key={i}></div>)
               }
  
               return (
                 <div key={i} className="col-span-1">
                       <FormControl fullWidth id="color-input">
               {/* กล่อง input + ปุ่ม ต่อกันแนบสนิท */}
               <Box sx={{ display: "flex", width: "100%" }}>
               <Button
                 ref={(el)=>{
                  iconColRef.current[i] = el
                 }}
                 onClick={()=>{
                  if(openIconCol === i){
                    setOpenIconCol(-1)
                    return
                  }
                  openPopper()
                  setOpenIconCol(i)
                 }}
                 name="BTN_POPPER"
               sx={{
               height: 47,
               minWidth: 52,                // ปรับได้ตามข้อความ
               px: 1.5,                     // ระยะซ้ายขวาในกล่อง
               display: "flex",
               alignItems: "center",
               justifyContent: "center",
               fontSize: 12,
               color: "#A1A1AA",
               backgroundColor:"#374151",
               border: "1px solid",
               borderColor: "#A1A1AA",
               borderRightWidth: 0,         // ไม่ให้มีเส้นซ้อนกับ TextField
               borderTopLeftRadius: 5,
               borderBottomLeftRadius: 5,
               borderTopRightRadius:0,
               borderBottomRightRadius:0,
               ".dark &": {
                 color: "gray",
                 borderColor: "#494d55",
               },
               }}
               >
                <IconLucide className="size-5 " color="#FFFFFF" iconName={icon} />
               </Button>
               <TextField
               name="text"
               value={text}
               onChange={(e)=>{
                 handleChange2("columns",i,e)
               }}
               sx={(t) => {
  
                 return {
                   flex: 1,
                   "& .MuiOutlinedInput-root": {
                     height: 47,
                     borderRadius:0,
  
                   },
                   "& .MuiOutlinedInput-input": {
                     letterSpacing: "0.4px",   // เว้นระยะตัวอักษรเล็กน้อย (ปรับได้ 0.2–0.6px)
                     fontSize:13,
                   },
                   "& .MuiOutlinedInput-notchedOutline": {
                     borderColor: "rgba(0,0,0,0.23)",
                     borderRadius: 0,
                     borderRightWidth: 0
                   },
                   "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                     borderColor: "rgba(0,0,0,0.23)",
                   },
                   "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                     borderColor: "rgba(0,0,0,0.23)",
                     borderWidth: 1,
                     borderRadius: 0,
                     borderRightWidth: 0
                   },
  
                   ".dark & .MuiOutlinedInput-root": {
                     height: 35,
                     borderRadius: 0,
                     color:"white",
                     borderRightWidth: 0
                   },
  
                   ".dark & .MuiOutlinedInput-notchedOutline": {
                     borderColor: "#494d55",
                     borderRadius: 0,
                     borderRightWidth: 0
                   },
                   ".dark & .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                     borderColor: "#494d55",
                     borderRadius: 0,
                     borderRightWidth: 0
                   },
                   ".dark & .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                     borderColor: "#494d55",
                     borderWidth: 1,
                     borderRadius: 0,
                     borderRightWidth: 0
                   },
                 }
               }}
               size="small"
               variant="outlined"
               />
  
               <Button
               variant="contained"
               name="BTN_POPPER"
               ref={(el)=>{
                colColorRef.current[i] = el
               }}
               onClick={()=>{
                if(openColColor === i){
                  setOpenColColor(-1)
                  return
                }
                openPopper()
                setOpenColColor(i)
               }}
               sx={(t) => {
  
  
                 return {
                   boxShadow: "none",      // 1) เอาเงาออก
                   px: 2.5,
                   borderTopLeftRadius: 0, // ให้แนบกับ TextField
                   borderBottomLeftRadius: 0,
                   borderTopRightRadius: 5,
                   borderBottomRightRadius: 5,
                  
                   // 2) ให้ปุ่มมี "กรอบ" แบบเดียวกับ TextField
                   border: "1px solid",
                   borderColor: "#A1A1AA",
                   minWidth: 52, 
  
                   // (ตัวเลือก) ถ้าไม่อยากให้มีเส้นหนาตรงรอยต่อกลาง
                   // ให้ตัดเส้นซ้ายของปุ่มออก จะเหลือเส้นของ TextField ฝั่งเดียวพอดี
                   // borderLeftWidth: 0,
  
                   // สีพื้นหลังของปุ่ม = สีที่เลือก
                   backgroundColor:setBgColor(color),
                   "&:hover": {
                     backgroundColor: setBgColor(color),
                     borderColor: "#A1A1AA",
                     boxShadow: "none", // กันธีมเพิ่มเงาตอนโฮเวอร์
                   },
  
                   // สีตัวอักษร - ให้สืบทอดจาก parent; คุณจะเปลี่ยนเป็นขาว/ดำเองก็ได้
                   color: "inherit",
  
                   ".dark &": {
                     borderColor: "#494d55", // สีกรอบใน dark (เทาเข้มที่คุณใช้กับ TextField)
                     "&:hover": { borderColor: "#494d55" },
                     borderTopRightRadius: 5,
                     borderBottomRightRadius: 5,
                   },
                 };
               }}
  
               >
               <Palette className="size-5 text-white" strokeWidth={2}/>
               </Button>
               </Box>
               </FormControl>
               <ColorPopper open={openColColor === i} popperRef={colColorRef.current[i]} elementColor={color} field="color" isChange2={2} mainField="columns" index={i} opacity={opacity}/>
               <IconPopper open={openIconCol === i} popperRef={iconColRef.current[i]} icon={icon} field="icon"  mainField="columns" index={i}/>
                 </div>
               )
             }
             
             
            )}
            
           </div>
       </div>
        )}
        {!post.isColumn && (<div className="col-span-12 "><MainLabel label={""}/></div>)}
        {/* ปุ่มกด */}
        <div className="col-span-12 ">
            <MainLabel label={"ปุ่มกด"}/>
            {post.isButton && (
               <div className="grid grid-cols-12 flex items-center justify-center">
               {buttonAmount.map((amount,i)=>(
                 <div key={i} className="col-span-1 text-black dark:text-white ">
                 <FormControlLabel
                   
                   control={
                     <Radio
                     name="buttonAmount"
                     value={amount}
                     onChange={handleChangeForNumber}
                     checked={post.buttonAmount == amount}
                       sx={(t) => {
                   
                 
                         return {           // ยังไม่ติ๊ก = สีตามโหมด
                           color: "black",
                           "&.Mui-checked": { color: "black" }, // ติ๊กแล้ว = สีเดียวกัน
                           "&:hover": { backgroundColor: "transparent" },
                           "&.Mui-checked:hover": { backgroundColor: "transparent" },
                         };
                       }}
                     />
                   }
                   label={`${amount ? `${amount} ปุ่ม`:"ไม่มี"}`}
                   sx={{ "& .MuiFormControlLabel-label": { fontSize: 15, color: "inherit" } }}
                 />
               </div>
               ))}
               </div>
            )}
           
        </div>
        {!post.isButton && (<div className="col-span-12 "><MainLabel label={""}/></div>)}
        {/* แก้ไขปุ่ม */}
        {post.isButton && post.buttons.map((btn,i)=>{
  
          const {icon,text,textColor,buttonColor,link,textSize,opacity} = btn
  
          if(i+1 > post.buttonAmount){
            return (<div key={i}></div>)
          }
  
          return (
            <div className="col-span-12 mt-3" key={i}>
                <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-1">
                    <Box sx={{ display: "flex", width: "100%" }}>
                    <Button
                    name="BTN_POPPER"
                     ref={(el)=>{
                      iconBtnRef.current[i] = el
                     }}
                     onClick={()=>{
                      if(openIconBtn === i){
                        setOpenIconBtn(-1)
                        return
                      }
                      openPopper()
                      setOpenIconBtn(i)
                     }}
              sx={{
                height: 47,
                minWidth: 52,                // ปรับได้ตามข้อความ
                px: 1.5,                     // ระยะซ้ายขวาในกล่อง
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                color: "#A1A1AA",
                backgroundColor:"#374151",
                border: "1px solid",
                borderColor: "#A1A1AA",
                borderRightWidth: 0,         // ไม่ให้มีเส้นซ้อนกับ TextField
                borderTopLeftRadius: 5,
                borderBottomLeftRadius: 5,
                borderTopRightRadius:0,
                borderBottomRightRadius:0,
                ".dark &": {
                  color: "gray",
                  borderColor: "#494d55",
                },
              }}
            >
              <IconLucide className="size-5 " color="#FFFFFF" iconName={icon} />
              
            </Button>
                  <TextField
              fullWidth
              variant="outlined"
              label="ข้อความ"
              name="text"
              value={text}
              onChange={(e)=>{
                handleChange2("buttons",i,e)
              }}
              sx={{...COMMON_FIELD_SX,"& .MuiOutlinedInput-root": {
                height: 47,
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                borderTopRightRadius:0,
                borderBottomRightRadius:0,
              },
          
              // 🔑 ตัดเส้นขอบด้านขวาออกทุกสถานะ
              "& .MuiOutlinedInput-notchedOutline": { borderLeftWidth: 0 },
              "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                borderLeftWidth: 0,
              },
              "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderLeftWidth: 0,
              },
              "& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline": {
                borderLeftWidth: 0,
              },
          
              // ถ้ามีโหมด .dark
              ".dark & .MuiOutlinedInput-notchedOutline": { borderLeftWidth: 0 },
              ".dark & .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                borderLeftWidth: 0,
              },
              ".dark & .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderLeftWidth: 0,
              },}}
              slotProps={{
                input: {
                  sx: { fontSize: 15 },
                  startAdornment: (
                    <InputAdornment position="start"></InputAdornment>
                  ),
                },
              }}
            />
            <Button
              variant="contained"
              name="BTN_POPPER"
              ref={(el)=>{
                if(i === 0){
                  buttonSettingPopperRef1.current = el
                }else{
                  buttonSettingPopperRef2.current = el
                }
              }}
              onClick={()=>{
                if(i === 0){
                  if(openButtonPopper1){
                    setOpenButtonPopper1(false)
                    return
                  }
                  setOpenButtonPopper2(false)
                  openPopper("btn-1")
                }
                else{
                  if(openButtonPopper2){
                    setOpenButtonPopper2(false)
                    return
                  }
                  setOpenButtonPopper1(false)
                  openPopper("btn-2")
                }
               
              }}
              sx={(t) => {
             
        
                return {
                  boxShadow: "none",      // 1) เอาเงาออก
                  height: 47,
                  minWidth: 35,
                  px: 2.5,
                  borderTopLeftRadius: 0, // ให้แนบกับ TextField
                  borderBottomLeftRadius: 0,
                  borderTopRightRadius: 5,
                  borderBottomRightRadius: 5,
        
                  // 2) ให้ปุ่มมี "กรอบ" แบบเดียวกับ TextField
                  border: "1px solid",
                  borderColor: "#A1A1AA",
        
                  // (ตัวเลือก) ถ้าไม่อยากให้มีเส้นหนาตรงรอยต่อกลาง
                  // ให้ตัดเส้นซ้ายของปุ่มออก จะเหลือเส้นของ TextField ฝั่งเดียวพอดี
                  // borderLeftWidth: 0,
        
                  // สีพื้นหลังของปุ่ม = สีที่เลือก
                  backgroundColor: "#374151",
                  "&:hover": {
                    backgroundColor:"#374151" || "transparent",
                    borderColor: "#A1A1AA",
                    boxShadow: "none", // กันธีมเพิ่มเงาตอนโฮเวอร์
                  },
        
                  // สีตัวอักษร - ให้สืบทอดจาก parent; คุณจะเปลี่ยนเป็นขาว/ดำเองก็ได้
                  color: "inherit",
  
                  ".dark &": {
                    borderColor: "#494d55", // สีกรอบใน dark (เทาเข้มที่คุณใช้กับ TextField)
                    "&:hover": { borderColor: "#494d55" },
                    borderTopRightRadius: 5,
                    borderBottomRightRadius: 5,
                  },
                };
              }}
        
            >
              
              <Settings className="size-5 text-white" strokeWidth={2}/>
            </Button>
  
                  </Box>
                  <Popper open={i === 0 ?openButtonPopper1:openButtonPopper2} anchorEl={i === 0 ?buttonSettingPopperRef1.current:buttonSettingPopperRef2.current} placement="top-start" modifiers={[
                  { name: "offset", options: { offset: [0,14] } },
                  { name: "flip", enabled: true },
                  { name: "preventOverflow", options: { padding:8 } },
                ]}  disablePortal
                sx={{ zIndex: 1300 }}>
  
                <div className="relative rounded-md dark:bg-white bg-[#374151] px-[5px] pt-[14px] pb-[11px] ">
                  
          
                <div className="pt-[5px] pb-[2px] px-[8px] grid grid-cols-[repeat(1,1fr)_auto] gap-2 flex items-center">
                      <div className="col-span-1">
                        <Box sx={{ display: "flex", width: "100%" }}>
                        <TextField sx={{...COMMON_FIELD_SX ,"& .MuiOutlinedInput-root": { height: 35,borderTopRightRadius:0,borderBottomRightRadius:0,width:100,color:"whitesmoke" },"& .MuiInputLabel-root": { fontSize: 12.5,color:"whitesmoke"},
            "& .MuiInputLabel-root.Mui-focused": { fontSize: 12.5,color:"whitesmoke"},
            "& .MuiInputLabel-root.Mui-error": { color: "whitesmoke !important" },
    "& .MuiInputLabel-root.Mui-disabled": { color: "whitesmoke !important" },
            // 🔑 ตัดเส้นขอบด้านขวาออกทุกสถานะ
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#5e636d !important",
              borderRightWidth: 0,
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
              // กันรอยเส้นฝั่งขวา
              borderRightStyle: "none",
            },
            "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#5e636d",
              borderRightWidth: 0,
            },
            // focus
            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#5e636d",
              borderRightWidth: 0,
            },
            "& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline": {
              borderRightWidth: 0,
            },}}  variant="outlined" label="ขนาดข้อความ" value={textSize} name="textSize" onChange={(e)=>{
              handleChangeForNumber(e,2,{mainField:"buttons",index:i})
            }} slotProps={{
              input: {
                sx: { fontSize: 15 },
                startAdornment: (
                  <InputAdornment position="start"></InputAdornment>
                ),
              },
            }}/>
               <Box
            sx={{
              height: 35,
              borderLeftWidth:0,   
              backgroundColor:"#454b57",         
              px: 2,                
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              color: "white",
  
              border: "1px solid",
              borderColor: "#5e636d",
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
  
              ".dark &": {
                color: "gray",
                borderColor: "#494d55",
              },
            }}
          >
            PX
          </Box>
          <Button
          name="BTN_POPPER"
              sx={{
                height: 35,
                minWidth: 40,                // ปรับได้ตามข้อความ
                px: 1.5,                     // ระยะซ้ายขวาในกล่อง
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                color: "#A1A1AA",
                backgroundColor:setBgColor(textColor),
                border: "1px solid",
                borderColor: "#5e636d",
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                borderTopRightRadius:5,
                borderBottomRightRadius:5,
                ".dark &": {
                  color: "gray",
                  borderColor: "#494d55",
                },
              }}
              ref={(el)=>{
                btnTextColorRef.current[i] = el
              }}
              onClick={()=>{
                if(openBtnTextColor === i){
                  setOpenBtnTextColor(-1)
                  return
                }
                closeColorPopper()
                setOpenBtnTextColor(i)
              }}
            >
               <Palette className="size-5 text-white" strokeWidth={2}/>
            </Button>
                      </Box>
                     
                      <ColorPopper open={openBtnTextColor === i} popperRef={btnTextColorRef.current[i]} elementColor={textColor} field="textColor" isChange2={2} mainField="buttons" index={i}/>
                      
                   </div>
                
                   <div className="col-span-1">
                   <Box sx={{ display: "flex", width: "100%" }}> 
                <TextField
            InputProps={{ readOnly: true }}
            value={setBgColor(buttonColor)}
            variant="outlined"
            label="สีปุ่ม"
            sx={{...COMMON_FIELD_SX ,"& .MuiOutlinedInput-root": { height: 35,borderTopRightRadius:0,borderBottomRightRadius:0,color:"#5e636d" ,width:120},"& .MuiInputLabel-root": { fontSize: 12.5,color:"whitesmoke"},
            "& .MuiInputLabel-root.Mui-focused": { fontSize: 12.5,color:"whitesmoke"},
            "& .MuiInputLabel-root.Mui-error": { color: "whitesmoke !important" },
    "& .MuiInputLabel-root.Mui-disabled": { color: "whitesmoke !important" },
            // 🔑 ตัดเส้นขอบด้านขวาออกทุกสถานะ
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#5e636d !important",
              borderRightWidth: 0,
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
              // กันรอยเส้นฝั่งขวา
              borderRightStyle: "none",
            },
            "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#5e636d",
              borderRightWidth: 0,
            },
            // focus
            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#5e636d",
              borderRightWidth: 0,
            },
            "& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline": {
              borderRightWidth: 0,
            },}}   onChange={(e)=>{
              handleChangeForNumber(e,2,{mainField:"buttons",index:i})
            }}
            slotProps={{
              input: {
                sx: { fontSize: 15 },
                startAdornment: (
                  <InputAdornment position="start"></InputAdornment>
                ),
              },
            }}
          />
              <Button
              name="BTN_POPPER"
              ref={(el)=>{
                btnColorRef.current[i] = el
              }}
              onClick={()=>{
                if(openBtnColor === i){
                  setOpenBtnColor(-1)
                  return
                }
                closeColorPopper()
                setOpenBtnColor(i)
              }}
            sx={{
              height: 35,
              minWidth: 40,                // ปรับได้ตามข้อความ
              px: 1.5,                     // ระยะซ้ายขวาในกล่อง
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              color: "#A1A1AA",
              backgroundColor:setBgColor(buttonColor),
              border: "1px solid",
              borderColor: "#5e636d",
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
              borderTopRightRadius:5,
              borderBottomRightRadius:5,
              ".dark &": {
                color: "gray",
                borderColor: "#494d55",
              },
            }}
          >
             <Palette className="size-5 text-white" strokeWidth={2}/>
          </Button>
          
                </Box>
                <ColorPopper open={openBtnColor === i} popperRef={btnColorRef.current[i]} elementColor={buttonColor} field="buttonColor" isChange2={2} mainField="buttons" index={i} opacity={opacity}/>
                   </div>
  
                  </div>
                  <div className="pointer-events-none absolute -bottom-2 left-6">
    
    <div className="relative h-0 w-0">
      
      {/* ชั้นนอก: เส้นขอบ */}
     
      {/* ชั้นใน: พื้นหลัง (ซ้อนทับให้เห็นเป็นขอบสวย ๆ) */}
      <div
        className="
          absolute -bottom-[1px] left-1/2 -translate-x-1/2
          h-0 w-0
          border-l-[9px] border-l-transparent
          border-r-[9px] border-r-transparent
          border-t-[9px] border-t-[#374151]
          dark:border-t-zinc-800
        "
      />
      <div
        className="
          absolute -bottom-[1px] left-1/2 -translate-x-1/2 mb-[8px]
          w-[16px] h-[2px]
          bg-[#374151] dark:bg-zinc-800
        "
      />
  
    </div>
  </div>
                </div>
                
        </Popper>
        <IconPopper open={openIconBtn === i} popperRef={iconBtnRef.current[i]} icon={icon} field="icon"  mainField="buttons" index={i}/>
                    </div>
                   
                    <div className="col-span-1">
                    <Box sx={{ display: "flex", width: "100%" }}>
                   <Box
              sx={{
                height: 47,
                borderRightWidth:0,   
                backgroundColor:"#374151",         
                px: 2,                
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                color: "white",
    
                border: "1px solid",
                borderColor: "rgba(0,0,0,0.23)",
                borderTopLeftRadius: 5,
                borderBottomLeftRadius: 5,
    
                ".dark &": {
                  color: "gray",
                  borderColor: "#494d55",
                },
              }}
            >
              URL
            </Box>
                  <TextField
              fullWidth
              variant="outlined"
              label="ลิงค์"
              name="url"
              value={link.url}
              type="url"
              onChange={(e)=>{
                handleChange2(['buttons',"link"],i,e)
              }}
              sx={{...COMMON_FIELD_SX,"& .MuiOutlinedInput-root": {
                height: 47,
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
              },
          
              // 🔑 ตัดเส้นขอบด้านขวาออกทุกสถานะ
              "& .MuiOutlinedInput-notchedOutline": { borderLeftWidth: 0 },
              "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                borderLeftWidth: 0,
              },
              "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderLeftWidth: 0,
              },
              "& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline": {
                borderLeftWidth: 0,
              },
          
              // ถ้ามีโหมด .dark
              ".dark & .MuiOutlinedInput-notchedOutline": { borderLeftWidth: 0 },
              ".dark & .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                borderLeftWidth: 0,
              },
              ".dark & .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderLeftWidth: 0,
              },}}
              slotProps={{
                input: {
                  sx: { fontSize: 15 },
                  startAdornment: (
                    <InputAdornment position="start"></InputAdornment>
                  ),
                },
              }}
            />
            <Button
              variant="contained"
              name="BTN_POPPER"
              ref={(el)=>{
                if(i === 0){
                  linkButtonTargetPopperRef1.current = el
                }else{
                  linkButtonTargetPopperRef2.current = el
                }
              }}
              onClick={()=>{
                if(i === 0){
                  if(openLinkButtonTargetPopper1){
                    setOpenLinkButtonTargetPopper1(false)
                    return
                  }
                  setOpenLinkButtonTargetPopper2(false)
                  openPopper("linkBTN-1")
                }
                else{
                  if(openLinkButtonTargetPopper2){
                    setOpenLinkButtonTargetPopper2(false)
                    return
                  }
                  setOpenLinkButtonTargetPopper1(false)
                  openPopper("linkBTN-2")
                }
               
              }}
              sx={(t) => {
             
        
                return {
                  boxShadow: "none",      // 1) เอาเงาออก
                  height: 47,
                  minWidth: 35,
                  px: 2.5,
                  borderTopLeftRadius: 0, // ให้แนบกับ TextField
                  borderBottomLeftRadius: 0,
                  borderTopRightRadius: 5,
                  borderBottomRightRadius: 5,
        
                  // 2) ให้ปุ่มมี "กรอบ" แบบเดียวกับ TextField
                  border: "1px solid",
                  borderColor: "#A1A1AA",
        
                  // (ตัวเลือก) ถ้าไม่อยากให้มีเส้นหนาตรงรอยต่อกลาง
                  // ให้ตัดเส้นซ้ายของปุ่มออก จะเหลือเส้นของ TextField ฝั่งเดียวพอดี
                  // borderLeftWidth: 0,
        
                  // สีพื้นหลังของปุ่ม = สีที่เลือก
                  backgroundColor: "#374151",
                  "&:hover": {
                    backgroundColor:"#374151" || "transparent",
                    borderColor: "#A1A1AA",
                    boxShadow: "none", // กันธีมเพิ่มเงาตอนโฮเวอร์
                  },
        
                  // สีตัวอักษร - ให้สืบทอดจาก parent; คุณจะเปลี่ยนเป็นขาว/ดำเองก็ได้
                  color: "inherit",
  
                  ".dark &": {
                    borderColor: "#494d55", // สีกรอบใน dark (เทาเข้มที่คุณใช้กับ TextField)
                    "&:hover": { borderColor: "#494d55" },
                    borderTopRightRadius: 5,
                    borderBottomRightRadius: 5,
                  },
                };
              }}
        
            >
              
              <Settings className="size-5 text-white" strokeWidth={2}/>
            </Button>
            
                  </Box>
                  <Popper open={i === 0 ?openLinkButtonTargetPopper1:openLinkButtonTargetPopper2} anchorEl={i === 0 ?linkButtonTargetPopperRef1.current:linkButtonTargetPopperRef2.current} placement="top-start" modifiers={[
                  { name: "offset", options: { offset: [0,14] } },
                  { name: "flip", enabled: true },
                  { name: "preventOverflow", options: { padding:8 } },
                ]}  disablePortal
                sx={{ zIndex: 1300 }}>
  
                <div className="relative rounded-md dark:bg-white bg-[#374151] px-[5px] ">
                  
          
                  <div className=" px-[8px] grid grid-cols-2 gap-2 flex items-center">
                      <div className="col-span-2">
                      <FormControl component="fieldset" fullWidth>
    <Box sx={{ display: "flex", width: "100%" }}>
      <RadioGroup
        row
        name="target"
        value={link.target}                            // คุมด้วย state
        onChange={(e) => handleChange2(["buttons","link"], i, e)}      // อัปเดตครั้งเดียว
      >
        <FormControlLabel
          value="_self"
          control={<Radio sx={{ color: "whitesmoke", "&.Mui-checked": { color: "whitesmoke" } }} />}
          label="หน้าเดิม"    // _self = เปิดหน้าเดิม
          sx={{"& .MuiFormControlLabel-label": { fontSize: 13,color:"whitesmoke" } }}
        />
        <FormControlLabel
          value="_blank"
          control={<Radio sx={{ color: "whitesmoke", "&.Mui-checked": { color: "whitesmoke" } }} />}
          label="แท็บใหม่"    // _blank = เปิดแท็บใหม่
          sx={{"& .MuiFormControlLabel-label": { fontSize: 13,color:"whitesmoke" } }}
        />
      </RadioGroup>
    </Box>
  </FormControl>
                   </div>
                
                      
                  </div>
                  <div className="pointer-events-none absolute -bottom-2 left-6">
    
    <div className="relative h-0 w-0">
      
      {/* ชั้นนอก: เส้นขอบ */}
     
      {/* ชั้นใน: พื้นหลัง (ซ้อนทับให้เห็นเป็นขอบสวย ๆ) */}
      <div
        className="
          absolute -bottom-[1px] left-1/2 -translate-x-1/2
          h-0 w-0
          border-l-[9px] border-l-transparent
          border-r-[9px] border-r-transparent
          border-t-[9px] border-t-[#374151]
          dark:border-t-zinc-800
        "
      />
      <div
        className="
          absolute -bottom-[1px] left-1/2 -translate-x-1/2 mb-[8px]
          w-[16px] h-[2px]
          bg-[#374151] dark:bg-zinc-800
        "
      />
  
    </div>
  </div>
                </div>
                
        </Popper>
                    </div>
                </div>
            </div>
          )
        }
        
        )}
         {/* ตกแต่ง */}
        <div className="col-span-12 ">
          <MainLabel label={"ตกแต่งรูปภาพ"}/>
        </div>
  
          {post.imageDecoration && (<>
          
            
        {/* ประเภท */}
        <div className="col-span-12 mt-3">
          <MainLabel label={"ประเภท"}/>
          <div className="grid grid-cols-12">
        {decorationTypes.map((type,i)=>(
          <FormControlLabel key={i} control={<Radio 
  
            name="decorationType"
            value={type}
            onChange={handleChange}
            checked={post.decorationType === type}
            
            sx={(t) => {
                
              
            return {           // ยังไม่ติ๊ก = สีตามโหมด
              color: "black",
              "&.Mui-checked": { color: "black" }, // ติ๊กแล้ว = สีเดียวกัน
              "&:hover": { backgroundColor: "transparent" },
              "&.Mui-checked:hover": { backgroundColor: "transparent" },
            };
          }}/>} label={type}  sx={{ "& .MuiFormControlLabel-label": { fontSize: 15, color: "inherit" } }}/>
        ))}
          </div>
        </div>
        {/* สีแถบ */}
        <div className="col-span-4 mt-3">
        <Box sx={{ display: "flex", width: "100%" }}>
              
              <TextField
          fullWidth
          InputProps={{readOnly:true}}
          value={setBgColor(post.color)}
          variant="outlined"
          label="สีแถบ"
          sx={{...COMMON_FIELD_SX,"& .MuiOutlinedInput-root": {
            height: 47,
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            color:"rgba(0,0,0,0.23)"
          },
      
          // 🔑 ตัดเส้นขอบด้านขวาออกทุกสถานะ
          "& .MuiOutlinedInput-notchedOutline": { borderRightWidth: 0 },
          "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
            borderRightWidth: 0,
          },
          "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderRightWidth: 0,
          },
          "& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline": {
            borderRightWidth: 0,
          },
      
          // ถ้ามีโหมด .dark
          ".dark & .MuiOutlinedInput-notchedOutline": { borderLeftWidth: 0 },
          ".dark & .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
            borderLeftWidth: 0,
          },
          ".dark & .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderLeftWidth: 0,
          },}}
          slotProps={{
            input: {
              sx: { fontSize: 15 },
              startAdornment: (
                <InputAdornment position="start"></InputAdornment>
              ),
            },
          }}
        />
            <Button
            name="BTN_POPPER"
            ref={decorationColorRef}
            onClick={(e)=>{
              if(openDecorationColor){
                setOpenDecorationColor(false)
                return
              }
              openPopper()
              setOpenDecorationColor(true)
            }}
          sx={{
            height: 47,
            minWidth: 52,                // ปรับได้ตามข้อความ
            px: 1.5,                     // ระยะซ้ายขวาในกล่อง
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            color: "#A1A1AA",
            backgroundColor:setBgColor(post.color),
            border: "1px solid",
            borderColor: "#A1A1AA",
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            borderTopRightRadius:5,
            borderBottomRightRadius:5,
            ".dark &": {
              color: "gray",
              borderColor: "#494d55",
            },
          }}
        >
           <Palette className="size-5 text-white" strokeWidth={2}/>
        </Button>
        
              </Box>
              <ColorPopper open={openDecorationColor} popperRef={decorationColorRef.current} elementColor={post.color} field="color" opacity={post.opacity}/>
        </div>
        {/* ข้อความ */}
        <div className="col-span-4 mt-3">
        <FormControl fullWidth id="color-input" sx={{height:47}}>
          {/* กล่อง input + ปุ่ม ต่อกันแนบสนิท */}
          <Box sx={{ display: "flex", width: "100%" }} >
          <TextField
            fullWidth
            name="text"
            onChange={handleChange}
            value={post.text}
            variant="outlined"
            label="ข้อความ"
            sx={{...COMMON_FIELD_SX,
              "& .MuiOutlinedInput-root": {
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
            }}}
            slotProps={{
              input: {
                sx: { fontSize: 15 },
                startAdornment: (
                  <InputAdornment position="start"></InputAdornment>
                ),
              },
            }}
          />
          <Button
              variant="contained"
              name="BTN_POPPER"
              ref={textSettingPopperRef}
              onClick={()=>{
                if(openTextSettingPopper){
                 openPopper()
                  return
                }
                openPopper("text")
              }}
              sx={(t) => {
             
        
                return {
                  boxShadow: "none",      // 1) เอาเงาออก
                  height: 47,
                  minWidth: 35,
                  px: 2.5,
                  borderTopLeftRadius: 0, // ให้แนบกับ TextField
                  borderBottomLeftRadius: 0,
                  borderTopRightRadius: 5,
                  borderBottomRightRadius: 5,
        
                  // 2) ให้ปุ่มมี "กรอบ" แบบเดียวกับ TextField
                  border: "1px solid",
                  borderColor: "#A1A1AA",
        
                  // (ตัวเลือก) ถ้าไม่อยากให้มีเส้นหนาตรงรอยต่อกลาง
                  // ให้ตัดเส้นซ้ายของปุ่มออก จะเหลือเส้นของ TextField ฝั่งเดียวพอดี
                  // borderLeftWidth: 0,
        
                  // สีพื้นหลังของปุ่ม = สีที่เลือก
                  backgroundColor: "#374151",
                  "&:hover": {
                    backgroundColor:"#374151" || "transparent",
                    borderColor: "#A1A1AA",
                    boxShadow: "none", // กันธีมเพิ่มเงาตอนโฮเวอร์
                  },
        
                  // สีตัวอักษร - ให้สืบทอดจาก parent; คุณจะเปลี่ยนเป็นขาว/ดำเองก็ได้
                  color: "inherit",
  
                  ".dark &": {
                    borderColor: "#494d55", // สีกรอบใน dark (เทาเข้มที่คุณใช้กับ TextField)
                    "&:hover": { borderColor: "#494d55" },
                    borderTopRightRadius: 5,
                    borderBottomRightRadius: 5,
                  },
                };
              }}
        
            >
              
              <Settings className="size-5 text-white" strokeWidth={2}/>
            </Button>
          </Box>
          </FormControl>
          <Popper open={openTextSettingPopper} anchorEl={textSettingPopperRef.current} placement="top-start" modifiers={[
                  { name: "offset", options: { offset: [0,14] } },
                  { name: "flip", enabled: true },
                  { name: "preventOverflow", options: { padding:8 } },
                ]}  disablePortal
                sx={{ zIndex: 1300 }}>
  
                <div className="relative rounded-md bg-[#374151]  px-[5px] pt-[14px] pb-[11px]">
       
                  <div className="pt-[5px] pb-[2px] px-[8px] grid grid-cols-1 gap-2 flex items-center">
                      <div className="col-span-1">
                        <Box sx={{ display: "flex", width: "100%" }} >
                <TextField
            fullWidth
            name="size"
            onChange={handleChangeForNumber}
            value={post.size}
            variant="outlined"
            label="ขนาดตัวอักษร"
            sx={{...COMMON_FIELD_SX,"& .MuiOutlinedInput-root": {
              height: 35, borderTopRightRadius: 0,      // ← ตัดโค้งที่ตัว root
              borderBottomRightRadius: 0,color:"whitesmoke",width:100,
              overflow:"hidden"
            },
            "& .MuiOutlinedInput-input": { fontSize: 13},
            "& .MuiInputLabel-root": { fontSize: 12.5,color:"whitesmoke"},
            "& .MuiInputLabel-root.Mui-focused": { fontSize: 12.5,color:"whitesmoke"},
            "& .MuiInputLabel-root.Mui-error": { color: "whitesmoke !important" },
    "& .MuiInputLabel-root.Mui-disabled": { color: "whitesmoke !important" },
            // 🔑 ตัดเส้นขอบด้านขวาออกทุกสถานะ
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#5e636d !important",
              borderRightWidth: 0,
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
              // กันรอยเส้นฝั่งขวา
              borderRightStyle: "none",
            },
            "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#5e636d",
              borderRightWidth: 0,
            },
            // focus
            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#5e636d",
              borderRightWidth: 0,
            },
            "& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline": {
              borderRightWidth: 0,
            },
        
            // ถ้ามีโหมด .dark
            ".dark & .MuiOutlinedInput-notchedOutline": { borderRightWidth: 0 },
            ".dark & .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
              borderRightWidth: 0,
            },
            ".dark & .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderRightWidth: 0,
            },"& .MuiOutlinedInput-notchedOutline legend": {
              fontSize: 12.5, lineHeight: "20px", padding: "0 0px"
            },}}
            slotProps={{
              input: {
                sx: { fontSize: 15 },
                startAdornment: (
                  <InputAdornment position="start"></InputAdornment>
                ),
              },
            }}
          />
           <Box
            sx={{
              height: 35,
               
              backgroundColor:"#454b57",         
              px: 2,                
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              color: "white",
              border: "1px solid",
              borderColor: "#5e636d",
              ml:-1,
              ".dark &": {
                color: "gray",
                borderColor: "#494d55",
              },
            }}
          >
            PX
          </Box>
          <Button
          name="BTN_POPPER"
          ref={textColorRef}
          onClick={(e)=>{
            if(openTextColor){
              setOpenTextColor(false)
              return
            }
            closeColorPopper()
            setOpenTextColor(true)
          }}
          sx={{
            backgroundColor:setBgColor(post.textColor),
            height: 35,
            minWidth: 40,                // ปรับได้ตามข้อความ
            px: 1.5,                     // ระยะซ้ายขวาในกล่อง
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            color: "#A1A1AA",
            border: "1px solid",
            borderColor: "#5e636d",      // ไม่ให้มีเส้นซ้อนกับ TextField
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            borderTopRightRadius:0,
            borderBottomRightRadius:0,
            borderRightWidth: 0,
            ".dark &": {
              color: "gray",
              borderColor: "#494d55",
            },
          }}
        >
           <Palette className="size-5 text-white" strokeWidth={2}/>
        </Button>
        {textAlign.map(({key,Icon})=>{
  
          if((post.decorationType === "ริบบิ้น" || post.decorationType === "วงกลม") && key === "center"){
  
            return
          }
  
  
          let check
          if((post.decorationType === "ริบบิ้น" || post.decorationType === "วงกลม") && key === "start" && post.position === "center"){
            check = (post.decorationType === "ริบบิ้น" || post.decorationType === "วงกลม") && key === "start" && post.position === "center"
          }else{
            check = post.position === key
          }
  
  
  return (
  
    <Button key={key} sx={{backgroundColor:check?"#374151":"white", height: 35,
  minWidth: 40,                // ปรับได้ตามข้อความ
  px: 1,                     // ระยะซ้ายขวาในกล่อง
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 12,
  color: "#A1A1AA",
  borderLeftWidth:0,
  border: "1px solid",
  borderColor: "#5e636d",      // ไม่ให้มีเส้นซ้อนกับ TextField
  borderTopLeftRadius: 0,
  borderBottomLeftRadius: 0,
  borderTopRightRadius:key === "end"?5:0,
  borderBottomRightRadius:key === "end"?5:0,
  borderRightWidth: key === "start"?0:1,
  ".dark &": {
  color: "gray",
  borderColor: "#494d55",
  },}} value={key} name="position" onClick={handleChange}> <Icon className={`size-5 text-${check?"white":"black"}`} strokeWidth={2}/></Button>
  
  
  )
        })}
                </Box>
                
                <ColorPopper open={openTextColor} popperRef={textColorRef.current} elementColor={post.textColor} field="textColor"/>
                
                </div>
                     
                  </div>
                  {/* ▼ ลูกศรสามเหลี่ยมชี้ลง */}
                  <div className="pointer-events-none absolute -bottom-2 left-6">
    
    <div className="relative h-0 w-0">
      
      {/* ชั้นนอก: เส้นขอบ */}
     
      {/* ชั้นใน: พื้นหลัง (ซ้อนทับให้เห็นเป็นขอบสวย ๆ) */}
      <div
        className="
          absolute -bottom-[1px] left-1/2 -translate-x-1/2
          h-0 w-0
          border-l-[9px] border-l-transparent
          border-r-[9px] border-r-transparent
          border-t-[9px] border-t-[#374151]
          dark:border-t-zinc-800
        "
      />
      <div
        className="
          absolute -bottom-[1px] left-1/2 -translate-x-1/2 mb-[8px]
          w-[16px] h-[2px]
          bg-[#374151] dark:bg-zinc-800
        "
      />
  
    </div>
  </div>
  
                </div>
                
        </Popper>
        </div>
  
          
          </>)}
  
  
        
      </div>
      <Button onClick={handleSubmit}>Submit</Button>
          </div>
        </div>
      </main>
    );
  };
  
  
  
  export default Post;
  