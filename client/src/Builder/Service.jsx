import { useEffect, useState,useRef } from "react";
import { getTheme } from "../../Functions/theme";

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    Input,
    InputAdornment,
    Box,
    Slider,
    Typography,
    Select,
    MenuItem,
    ListItemText,
    OutlinedInput,
    Grow,
    Slide,
    Popper,
    TextField
  
  
  
  } from "@mui/material";
  import lodash, { isNull, set } from "lodash";

  import { Minus, Plus,Check,Palette,ImageOff,Trash2} from "lucide-react";
  import { swatchSelectedCheckClassName } from "./Layouts/Elements/swatchCheckClass";
  import { THEME_PANEL_BASIC_COLOR_SWATCHES } from "./themePanelBasicColors";

  const Range = ({name,value,min,max,step,handleChange,darkMode,darkTextColor,index=-1,mainField=null}) => {
    const [newValue, setNewValue] = useState(value);
  
    useEffect(() => {
      setNewValue(value);
    }, [value]);



    // useEffect(() => {
    //   if(handleChange && name && value && newValue){
    //     handleChange(name,newValue,index);
    //   }
    // }, [newValue]);
  
  
    let pos = ((newValue-min) / (max-min)) * 100
  
    return (
      <div className="pt-[2px] pb-[2px] px-[5px]">
        <input
          type="range"
          min={min}
          max={max}
          value={newValue}
          step={step}
          onChange={(e) => {
            const v = Number(e.target.value);
            setNewValue(v);
            handleChange?.(name, v, index,mainField); // ✅ อัปเดตทันที
          }}
          className={`
          w-full appearance-none h-2 rounded-full
          
          ${darkMode === "dark"?"bg-zinc-700":"bg-zinc-200"}
      
      
          theme-range-fill-track
      
          [&::-webkit-slider-runnable-track]:border-0
          [&::-moz-range-track]:border-0
      
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-dark
          [&::-webkit-slider-thumb]:${darkMode === "dark"?"bg-emerald-300":"bg-slate-900"}
          [&::-webkit-slider-thumb]:border-0
      
          [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4
          [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-emerald-300
          [&::-moz-range-thumb]:border-0
            `}
              style={{ ["--pos"]: `${pos}%`, ["--fill"]: darkMode?darkTextColor:`black` }}
        />
      </div>
    );
  };

  const PopperColor = ({darkMode,darkTextColor,field,open,anchorEl,opacityField,opacity,color,handleColor,handleOpcy,allColors,hex,setAnchorEl,index=-1,mainField=null})=>{
    return (
      <Popper
       disablePortal={false}
       open={open && !!anchorEl}
  placement="bottom-start"
  anchorEl={anchorEl}
  transition
  modifiers={[
    { name: "offset", options: { offset: [0,8] } },
    { name: "flip", enabled: true },
    { name: "preventOverflow", options: { padding:8 } },
  ]}
  sx={{ zIndex: 2000 }}
>

{({ TransitionProps, placement }) => (
  <Grow
  {...TransitionProps}
  timeout={{ enter: 300, exit: 0 }}
  direction={placement?.startsWith("bottom") ? "down" : "up"}  // ✅ สลับตรงนี้
  onExited={(node) => {
    TransitionProps.onExited?.(node);
    setAnchorEl(null);
  }}

>
    <div className="w-[363px] rounded-md border  px-[5px] pt-[8px] pb-[15px]  flex flex-col gap-2" id="popper-color" style={{backgroundColor:darkMode==="dark"?"#27272a":"white",borderColor:darkMode==="dark"?"#5e5e5e":"#dedee0"}}>
      
      <div className="pt-[2px] pb-[2px] px-[8px]">
           {/* <input type="range" className="w-full accent-slate-900 dark:accent-emerald-300 border border-0"/> */}
           <Range name={opacityField} value={opacity} darkMode={darkMode} darkTextColor={darkTextColor} min={0} max={255} step={1} handleChange={handleOpcy} index={index} mainField={mainField}/>
       </div>
             
           <div className="grid grid-cols-10 place-items-center gap-[6px_0px]">
               {allColors.map((c,i)=>
               {
                 
                 const bgColor = hex(c)
                const value = c
                let margin = ""
   
                
   
                if(i % 8 !== 0 && (i+1) % 8 !== 0){
                 margin += `mx-[65.75px] `

                }


                
   
   
                
   
   
   
                 return (
                   <div className={`col col-sapn-1 ${margin}`} key={i}>
                     <button  className={`size-[25px] rounded-full border flex items-center justify-center`} style={{backgroundColor:bgColor}} onClick={(e)=>{
                      console.log("Service =>",value,field,index,mainField);
                      handleColor(value,field,index,mainField)
                      }}>
                       {(color === value || lodash.isEqual(color,value)) && (
                         <Check className={swatchSelectedCheckClassName(bgColor)} strokeWidth={4}/>
                       )}
                     </button>
                   </div>
                   
                 )
               }
              )}
           </div>
         
         
   
   
      </div>
 </Grow>
)}
   
</Popper>
    )
  }


const Service = ({color,field,opacity,opacityField,open,anchorRef,anchorEl,click,handleColor,handleOpcy,darkMode,darkTextColor,setAnchorEl,index=-1,mainField=null})=>{


    
    const [theme, setTheme] = useState(null);





  const hexColor = (c)=>{
    return typeof c !== "string" && allColors.length > 2 ? theme[c?.type][c?.index] : c
  }




  




    const loadTheme = () => {
        getTheme("696119dea3c9d9703d3c1422")
          .then((res) => {

            setTheme(res.data);
    
          })
          .catch((err) => console.log(err));
      };
    
      useEffect(() => {
        loadTheme();
      },[]);

      const [allColors,setAllColors] = useState([])
    const basicColors = THEME_PANEL_BASIC_COLOR_SWATCHES

    useEffect(()=>{
        if(allColors.length === 0 && theme){
          theme?.mainColor.map((color,i)=>{
            setAllColors(prev=>{
              return [...prev,{type:"mainColor",index:i}]
            })
          })
          theme?.textColor.map((color,i)=>{
            setAllColors(prev=>{
              return [...prev,{type:"textColor",index:i}]
            })
          })
          theme?.otherColor.map((color,i)=>{
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
         
      
    },[theme])









    return(  <>
        <FormControl fullWidth id="color-input" sx={{marginTop:-1.5}}>
     {/* กล่อง input + ปุ่ม ต่อกันแนบสนิท */}
     <Box sx={{ display: "flex", width: "100%" }} className="mt-3 color-anchor" ref={anchorRef}>
     <TextField
     value={hexColor(color)}
     className="bg-none  rounded-l-[5px] "
     InputProps={{ readOnly: true }}
     sx={(t) => {
     
       return {
         flex: 1,
         "& .MuiOutlinedInput-root": {
           height: 35,
           borderTopRightRadius: 0,
           borderBottomRightRadius: 0,
           color:"#A1A1AA"
         },
         "& .MuiOutlinedInput-input": {
           letterSpacing: "0.4px",   // เว้นระยะตัวอักษรเล็กน้อย (ปรับได้ 0.2–0.6px)
           fontSize:13,
         },
         "& .MuiOutlinedInput-notchedOutline": {
           borderColor: "#A1A1AA",
           borderTopLeftRadius: 5,
           borderBottomLeftRadius: 5,
           borderRightWidth: 0
         },
         "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
           borderColor: "#A1A1AA",
         },
         "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
           borderColor: "#A1A1AA",
           borderWidth: 1,
           borderRightWidth: 0
         },
     
         ".dark & .MuiOutlinedInput-root": {
           height: 35,
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
     id="btn-popper"
     variant="contained"
     sx={(t) => {
     
       return {
         boxShadow: "none",      // 1) เอาเงาออก
         height: 35,
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
         backgroundColor: hexColor(color)|| "transparent",
         "&:hover": {
           backgroundColor: hexColor(color) || "transparent",
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
     onClick={(e) => {
      click()
     }}
     
     >
     <Palette className="size-5 text-white" strokeWidth={2}/>
     
     </Button>
     </Box>
     </FormControl>
    <PopperColor mainField={mainField} darkMode={darkMode} darkTextColor={darkTextColor} field={field} color={color} open={open} anchorEl={anchorEl} opacity={opacity} opacityField={opacityField} setAnchorEl={setAnchorEl} index={index} handleColor={handleColor} handleOpcy={handleOpcy} allColors={allColors} hex={hexColor}/>
    </>)


}


export default Service