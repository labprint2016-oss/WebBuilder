import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useLayoutEffect,
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
} from "@mui/material";
import { styled } from '@mui/material/styles';
import {
  Bluetooth,
  Palette,
  TextAlignStart,
  TextAlignEnd,
  Settings,
} from "lucide-react";
import { Description } from "@headlessui/react";


const Post = ({post,setPost}) => {




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

  const COMMON_POPPER_FIELD_SX = {
  
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
  const imageSettingPopperRef = useRef(null);
  const [openImagePopper,setOpenImagePopper] = useState(false)
  const linkTargetPopperRef = useRef(null);
  const [openLinkTargetPopper,setOpenLinkTargetPopper] = useState(false)

  const types = ["แนวตั้ง","แนวนอน","จตุรัส"]
  const imgTypes = ["รูปภาพ","แกเลอรี่","วิดีโอ"]
  const decorationTypes = ["แถบ","ริบบิ้น","วงกลม"]
  const columnAmount = [2,3,4]
  const buttonAmount = [1,2]
  const textAlign = [{key:"start",Icon:TextAlignStart},{key:"end",Icon:TextAlignEnd}]


  
  const items = [1,2,3]
  const items2 = [1,2]







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
      if(index >= 0){
        const field = prev[mainField]
        field[index][name] = value
        return {...prev,[mainField]:field}
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
            ref={titleSettingPopperRef}
            onClick={()=>{setOpenTitlePopper(!openTitlePopper)}}
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

              <div className="relative rounded-md bg-white dark:bg-zinc-800 border border-zinc-400/35 dark:border-gray-500/50 px-[5px] pt-[8px] pb-[15px]">
              <div className="pointer-events-none absolute -top-2 left-6 h-4 w-4">
  {/* ขอบลูกศร = diamond ชั้นนอก */}
  <div className="absolute inset-0 rotate-45
                  bg-zinc-400/35 dark:bg-gray-500/50 " />
  {/* ตัวลูกศร = diamond ชั้นใน (เล็กลง 1px รอบด้าน) */}
  <div className="absolute inset-[1px] rotate-45
                  bg-white dark:bg-zinc-800 rounded-[1px]" />
  {/* ปิดฐานให้เนียน: ทับเส้นขอบด้านล่างของ diamond */}
  <div className="absolute -bottom-[1px] left-[-8px] right-[-8px] h-2
                  bg-white dark:bg-zinc-800" />
</div>
                <div className="pt-[5px] pb-[2px] px-[8px] grid grid-cols-5 gap-2 flex items-center">
                    <div className="col-span-3"><TextField sx={{...COMMON_FIELD_SX ,"& .MuiOutlinedInput-root": { height: 35 }}}  variant="outlined" label="ขนาด" value={post.title.size} name="size" onChange={(e)=>handleChangeForNumber(e,2,{mainField:"title",index:-1})} slotProps={{
            input: {
              sx: { fontSize: 15 },
              startAdornment: (
                <InputAdornment position="start"></InputAdornment>
              ),
            },
          }}/></div>
                    <div className="col-span-1"><Button sx={{fontWeight:800,backgroundColor:post.title.bold?"#374151":"#e5e5e5",color:post.title.bold?"white":"black"}} onClick={()=>setPost(prev=>{
                      return {...prev,title:{...prev.title,bold:!prev.title.bold}}
                    })}>B</Button></div>
                    <div className="col-span-1"><Button sx={{fontStyle:"italic",backgroundColor:post.title.italic?"#374151":"#e5e5e5",color:post.title.italic?"white":"black"}}  onClick={()=>setPost(prev=>{
                      return {...prev,title:{...prev.title,italic:!prev.title.italic}}
                    })}>I</Button></div>
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
            ref={imageSettingPopperRef}
            onClick={()=>{setOpenImagePopper(!openImagePopper)}}
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

              <div className="relative rounded-md bg-white dark:bg-zinc-800 border border-zinc-400/35 dark:border-gray-500/50 px-[5px] pt-[8px] pb-[15px]">
                
              <div className="pointer-events-none absolute -bottom-2 left-6 h-4 w-4">
  {/* ขอบลูกศร = diamond ชั้นนอก */}
  <div className="absolute inset-0 rotate-45
                  bg-zinc-400/35 dark:bg-gray-500/50 " />
  {/* ตัวลูกศร = diamond ชั้นใน (เล็กลง 1px รอบด้าน) */}
  <div className="absolute inset-[1px] rotate-45
                  bg-white dark:bg-zinc-800 rounded-[1px]" />
  {/* ปิดฐานให้เนียน: ทับเส้นขอบด้านล่างของ diamond */}
  <div className="absolute -bottom-[1px] left-[-8px] right-[-8px] h-2
                  bg-white dark:bg-zinc-800" />
</div>
                <div className="pt-[5px] pb-[2px] px-[8px] grid grid-cols-2 gap-2 flex items-center">
                    <div className="col-span-1">
                      <Box sx={{ display: "flex", width: "100%" }}>
                      <TextField sx={{...COMMON_FIELD_SX ,"& .MuiOutlinedInput-root": { height: 35,borderTopRightRadius:0,borderBottomRightRadius:0 }}}  variant="outlined" label="ความสูง" value={post.height} name="height" onChange={handleChangeForNumber} slotProps={{
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
            backgroundColor:"#374151",         
            px: 2,                
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            color: "white",

            border: "1px solid",
            borderColor: "rgba(0,0,0,0.23)",
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
                      <TextField sx={{...COMMON_FIELD_SX ,"& .MuiOutlinedInput-root": { height: 35,borderTopRightRadius:0,borderBottomRightRadius:0 }}}  variant="outlined" label="ความโค้งมน" value={post.borderRadius} name="borderRadius" onChange={handleChangeForNumber} slotProps={{
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
            backgroundColor:"#374151",         
            px: 2,                
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            color: "white",

            border: "1px solid",
            borderColor: "rgba(0,0,0,0.23)",
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
              </div>
              
      </Popper>
      </div>
       {/* ความสูง-โค้งมน */}
      <div className="col-span-6 mt-3">
            {/* <div className="grid grid-cols-6 gap-4">
              <div className="col-span-3"> <Box sx={{ display: "flex", width: "100%" }}>
              <TextField
          fullWidth
          variant="outlined"
          label="ความสูง"
          name={"height"}
          value={post.height}
          onChange={handleChangeForNumber}
          sx={{...COMMON_FIELD_SX,"& .MuiOutlinedInput-root": {
            height: 47,
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
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
          ".dark & .MuiOutlinedInput-notchedOutline": { borderRightWidth: 0 },
          ".dark & .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
            borderRightWidth: 0,
          },
          ".dark & .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderRightWidth: 0,
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
            height: 47,
            borderLeftWidth:0,   
            backgroundColor:"#374151",         
            px: 2,                
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            color: "white",

            border: "1px solid",
            borderColor: "rgba(0,0,0,0.23)",
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
              </Box></div>
              <div className="col-span-3">
              <Box sx={{ display: "flex", width: "100%" }}>
              <TextField
          fullWidth
          name="borderRadius"
          value={post.borderRadius}
          onChange={handleChangeForNumber}
          variant="outlined"
          label="ความโค้งมน"
          sx={{...COMMON_FIELD_SX,"& .MuiOutlinedInput-root": {
            height: 47,
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
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
          ".dark & .MuiOutlinedInput-notchedOutline": { borderRightWidth: 0 },
          ".dark & .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
            borderRightWidth: 0,
          },
          ".dark & .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderRightWidth: 0,
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
            height: 47,
            borderLeftWidth:0,   
            backgroundColor:"#374151",         
            px: 2,                
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            color: "white",

            border: "1px solid",
            borderColor: "rgba(0,0,0,0.23)",
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
            </div> */}
      </div>
       {/* รูปแบบ */}
      <div className={`col-span-4 mt-3`}>
          <MainLabel label={"รูปแบบ"}/>
          <div className="grid grid-cols-12 flex items-center justify-center">
          {types.map((type,i)=>(
            <div key={i} className="col-span-3 text-black dark:text-white ">
            <FormControlLabel
              
              control={
                <Radio
                name="type"
                value={type}
                onChange={handleChange}
                checked={post.type === type}
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
     {post.imageType === "รูปภาพ" && ( <Button
            variant="contained"
            ref={linkTargetPopperRef}
            onClick={()=>{setOpenLinkTargetPopper(!openLinkTargetPopper)}}
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

              <div className="relative rounded-md bg-white dark:bg-zinc-800 border border-zinc-400/35 dark:border-gray-500/50 px-[5px] pt-[8px] pb-[15px]">
                
              <div className="pointer-events-none absolute -bottom-2 left-6 h-4 w-4">
  {/* ขอบลูกศร = diamond ชั้นนอก */}
  <div className="absolute inset-0 rotate-45
                  bg-zinc-400/35 dark:bg-gray-500/50 " />
  {/* ตัวลูกศร = diamond ชั้นใน (เล็กลง 1px รอบด้าน) */}
  <div className="absolute inset-[1px] rotate-45
                  bg-white dark:bg-zinc-800 rounded-[1px]" />
  {/* ปิดฐานให้เนียน: ทับเส้นขอบด้านล่างของ diamond */}
  <div className="absolute -bottom-[1px] left-[-8px] right-[-8px] h-2
                  bg-white dark:bg-zinc-800" />
</div>
                <div className="pt-[5px] pb-[2px] px-[8px] grid grid-cols-2 gap-2 flex items-center">
                    <div className="col-span-1">
                      <Box sx={{ display: "flex", width: "100%" }}>

                      <FormControlLabel label="หน้าเก่า" control={ <Radio
                  name="columnAmount"
                    sx={(t) => {
                
              
                      return {           // ยังไม่ติ๊ก = สีตามโหมด
                        color: "black",
                        "&.Mui-checked": { color: "black" }, // ติ๊กแล้ว = สีเดียวกัน
                        "&:hover": { backgroundColor: "transparent" },
                        "&.Mui-checked:hover": { backgroundColor: "transparent" },
                      };
                    }}
                  />}/>
                    </Box>
                 </div>
                 <div className="col-span-1">
                      <Box sx={{ display: "flex", width: "100%" }}>

                      <FormControlLabel label="หน้าใหม่" control={ <Radio
                  name="columnAmount"
                    sx={(t) => {
                
              
                      return {           // ยังไม่ติ๊ก = สีตามโหมด
                        color: "black",
                        "&.Mui-checked": { color: "black" }, // ติ๊กแล้ว = สีเดียวกัน
                        "&:hover": { backgroundColor: "transparent" },
                        "&.Mui-checked:hover": { backgroundColor: "transparent" },
                      };
                    }}
                  />}/>
                    </Box>
                 </div>
                    
                </div>
              </div>
              
      </Popper>
            
          
       
   </div>)}
       {/* คำบรรยาย */}
       <div className="col-span-12">
        <TextField
          fullWidth
          variant="outlined"
          name="description"
          value={post.description}
          onChange={handleChange}
          label="คำบรรยาย"
          sx={COMMON_FIELD_SX}
          slotProps={{
            input: {
              sx: { fontSize: 15 },
              startAdornment: (
                <InputAdornment position="start"></InputAdornment>
              ),
            },
          }}
        />
      </div>
      {post.isColumn && (<>
      
      </>)}
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

             const {Icon,text,color} = col
             if(i+1 > post.columnAmount){
               return (<div key={i}></div>)
             }


             return (
               <div key={i} className="col-span-1">
                     <FormControl fullWidth id="color-input">
             {/* กล่อง input + ปุ่ม ต่อกันแนบสนิท */}
             <Box sx={{ display: "flex", width: "100%" }}>
             <Button
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
             <Icon className="size-5 text-white" strokeWidth={2}/>
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
                 backgroundColor:color,
                 "&:hover": {
                   backgroundColor: color,
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

        const {Icon,text,textColor,buttonColor,link} = btn

        if(i+1 > post.buttonAmount){
          return (<div key={i}></div>)
        }

        return (
          <div className="col-span-12 mt-3" key={i}>
              <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-1">
                  <Box sx={{ display: "flex", width: "100%" }}>
                  <Button
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
             <Icon className="size-5 text-white" strokeWidth={2}/>
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
          
                </Box>
                  </div>
                  <div className="col-span-1">
                  <Box sx={{ display: "flex", width: "100%" }}>
              
                <TextField
            fullWidth
            variant="outlined"
            label="สีข้อความ"
            InputProps={{ readOnly: true }}
            value={textColor}
            sx={{...COMMON_FIELD_SX,"& .MuiOutlinedInput-root": {
              height: 47,
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
              color:"rgba(0,0,0,0.23)",
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
            sx={{
              height: 47,
              minWidth: 52,                // ปรับได้ตามข้อความ
              px: 1.5,                     // ระยะซ้ายขวาในกล่อง
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              color: "#A1A1AA",
              backgroundColor:textColor,
              border: "1px solid",
              borderColor: "#A1A1AA",
              borderRightWidth: 0,         // ไม่ให้มีเส้นซ้อนกับ TextField
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
                  </div>
                  <div className="col-span-1">
                  <Box sx={{ display: "flex", width: "100%" }}>
              
                <TextField
            fullWidth
            InputProps={{ readOnly: true }}
            value={buttonColor}
            variant="outlined"
            label="สีปุ่ม"
            sx={{...COMMON_FIELD_SX,"& .MuiOutlinedInput-root": {
              height: 47,
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
              color:"rgba(0,0,0,0.23)",
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
            sx={{
              height: 47,
              minWidth: 52,                // ปรับได้ตามข้อความ
              px: 1.5,                     // ระยะซ้ายขวาในกล่อง
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              color: "#A1A1AA",
              backgroundColor:buttonColor,
              border: "1px solid",
              borderColor: "#A1A1AA",
              borderRightWidth: 0,         // ไม่ให้มีเส้นซ้อนกับ TextField
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
            name="link"
            value={link}
            type="url"
            onChange={(e)=>{
              handleChange2("buttons",i,e)
            }}
            sx={{...COMMON_FIELD_SX,"& .MuiOutlinedInput-root": {
              height: 47,
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
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
          
                </Box>
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
        value={post.color}
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
        sx={{
          height: 47,
          minWidth: 52,                // ปรับได้ตามข้อความ
          px: 1.5,                     // ระยะซ้ายขวาในกล่อง
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          color: "#A1A1AA",
          backgroundColor:post.color,
          border: "1px solid",
          borderColor: "#A1A1AA",
          borderRightWidth: 0,         // ไม่ให้มีเส้นซ้อนกับ TextField
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
      </div>
      {/* ข้อความ */}
      <div className="col-span-4 mt-3">
        <TextField
          fullWidth
          name="text"
          onChange={handleChange}
          value={post.text}
          variant="outlined"
          label="ข้อความ"
          sx={COMMON_FIELD_SX}
          slotProps={{
            input: {
              sx: { fontSize: 15 },
              startAdornment: (
                <InputAdornment position="start"></InputAdornment>
              ),
            },
          }}
        />
      </div>
      {/* ขนาด */}
      <div className="col-span-4 mt-3">
      <div className="col-span-3"> <Box sx={{ display: "flex", width: "100%" }}>
              <TextField
          fullWidth
          name="size"
          onChange={handleChangeForNumber}
          value={post.size}
          variant="outlined"
          label="ขนาด"
          sx={{...COMMON_FIELD_SX,"& .MuiOutlinedInput-root": {
            height: 47,
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
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
          ".dark & .MuiOutlinedInput-notchedOutline": { borderRightWidth: 0 },
          ".dark & .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
            borderRightWidth: 0,
          },
          ".dark & .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderRightWidth: 0,
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
            height: 47,
            borderLeftWidth:0,   
            backgroundColor:"#374151",         
            px: 2,                
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            color: "white",

            border: "1px solid",
            borderColor: "rgba(0,0,0,0.23)",
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
              </Box></div>
      </div>
       {/* การจัดวาง */}
      <div className="col-span-4 mt-3">
            <MainLabel label={"การจัดวาง"}/> 
            <div className="grid grid-cols-6">
              {textAlign.map(({key,Icon})=>(
                <div key={key} className="ml-3">
                     <FormControlLabel  control={<Button sx={{backgroundColor:post.position === key?"#374151":"#e5e5e5"}} value={key} name="position" onClick={handleChange}> <Icon className={`size-5 text-${post.position === key?"white":"black"}`} strokeWidth={2}/></Button>}/>
                </div>
               
              ))}
            </div>
      </div>
      {/* สีข้อความ */}
      <div className="col-span-4 mt-3">
      <Box sx={{ display: "flex", width: "100%" }}>
            
            <TextField
        fullWidth
        variant="outlined"
        label="สีข้อความ"
        value={post.textColor}
        InputProps={{readOnly:true}}
        sx={{...COMMON_FIELD_SX,"& .MuiOutlinedInput-root": {
          height: 47,
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
          color:"rgba(0,0,0,0.23)",
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
        sx={{
          height: 47,
          minWidth: 52,                // ปรับได้ตามข้อความ
          px: 1.5,                     // ระยะซ้ายขวาในกล่อง
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          color: "#A1A1AA",
          backgroundColor:post.textColor,
          border: "1px solid",
          borderColor: "#A1A1AA",
          borderRightWidth: 0,         // ไม่ให้มีเส้นซ้อนกับ TextField
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
      </div>
        
        </>)}


      
    </div>
        </div>
      </div>
    </main>
  );
};



export default Post;
