import { useEffect, useState,useRef } from "react";
import { getTheme } from "../../../Functions/theme";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import TextField from "@mui/material/TextField";
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




} from "@mui/material";
import {
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/16/solid";
import lodash, { isNull } from "lodash";
import { Minus, Plus,Check,Palette,ImageOff,Trash2} from "lucide-react";
import Popper from "@mui/material/Popper";
import { styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import Stack from '@mui/material/Stack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import IconAwsome from "../IconAwsome";
import { swatchSelectedCheckClassName } from "../Layouts/Elements/swatchCheckClass";
import { THEME_PANEL_BASIC_COLOR_SWATCHES } from "../themePanelBasicColors";


const HeaderOffcanvas = ({ elements, updateContainer: onUpdate, close,textColor }) => {


    const [page,setPage] = useState(1)

    const [element,heros] = elements






  const AntSwitch = styled(Switch)(({ theme }) => ({
    width: 28,
    height: 16,
    padding: 0,
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
          backgroundColor: textColor,

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

  const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
  });


  const [data, setData] = useState(element);
  const elementRef = useRef(element);
  elementRef.current = element;
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;
  const [theme, setTheme] = useState(null);
  const [, setOpenColorTable1] = useState(false);
  const [, setOpenColorTable2] = useState(false);
  const [, setOpenColorTable3] = useState(false);
  const [openColorTable4, setOpenColorTable4] = useState(false);
  const [openColorTable5, setOpenColorTable5] = useState(false);
  const [openColorTable6, setOpenColorTable6] = useState(false);
  const [updated, setUpdated] = useState(false);
  useState(null);
  const [anchorArrowEl, setAnchorArrowEl] = useState(null);
  const [anchorBGArrowEl, setAnchorBGArrowEl] = useState(null);
  const [anchorPointEl, setAnchorPointEl] = useState(null);
  useState(null);
  useRef(null);
  const anchorArrowRef = useRef(null);
  const anchorBGArrowRef = useRef(null);
  const anchorPointRef = useRef(null);
  useRef(null);


  const loadTheme = () => {
    getTheme("68d37327bedb0efab7dacafb")
      .then((res) => {
        setTheme(res.data);

      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    loadTheme();
  },[]);

  const minusPadding = (value) => {
    return value - 1;
  };

  const plusPadding = (value) => {
    return value + 1;
  };

  const handlePadding = (field, valueOrUpdater) => {
    setData((prev) => {
      const current = prev[field];
      let next =
        typeof valueOrUpdater === "function"
          ? valueOrUpdater(current)
          : valueOrUpdater;

      if (next === "") {
        // อนุญาตค่าว่างระหว่างพิมพ์ (เก็บเฉพาะ local)
        return { ...prev, [field]: "" };
      }
      next = Number(next);
      if (Number.isNaN(next) || next < 0) return prev;

      return { ...prev, [field]: next };
    });
    setUpdated(true);
  };

 

  useEffect(() => {
    if (!updated) return;
    const clonedData = lodash.cloneDeep(data);
    for (const key in clonedData) {
      if (clonedData[key] === "") {
        clonedData[key] = 0;
      }
    }
    onUpdateRef.current(clonedData, data.id);
    setUpdated(false);
  }, [data, updated]);

  const handleColor = (value,type="backgroundColor",index=null) => {
    if(!isNull(index)){

      setData((prev)=>{
        
        const bgc = prev.backgroundColorGradient
        bgc[index] = value
        return{...prev,backgroundColorGradient:bgc}
        
      })

    }else{
      setData((prev) => {
      
          return{...prev,[type]:value}
     
        
      });
    }
    setUpdated(true);
  };


  const handleOpacity = (field,value,index=null) => {
    if(!isNull(index)){
      setData((prev)=>{
        const opct = prev[field]
        opct[index] = value
        return{...prev,[field]:opct}
      })
    }else{
      setData((prev)=>{return{...prev,[field]:value}})
    }
    
    setUpdated(true)
  }

  useEffect(() => {
    setData(elementRef.current);
    setUpdated(false)
  }, [element.id]);

  const heights = [
    { label: "ความสูง-Desktop", type: "desktopHeight", data: data.desktopHeight },
    {
      label: "ความสูง-Mobile",
      type: "mobileHeight",
      data: data.mobileHeight,
    },
  ];

  const size = [
    { label: "ขนาดลูกศร", type: "arrowSize", data: data.arrowSize },
    { label: "ขนาด Bullet", type: "pointSize", data: data.pointSize },
  ];
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
       
    
  },[allColors.length, basicColors, theme])


  return (
    <aside
      className={`
     
     dash-panel sm:block 0 overflow-hidden border-r border-slate-200 dark:border-white/10`}
    >
      <div className="dash-panel-header shrink-0 flex items-center justify-between border-b border-slate-200 bg-gray-100 px-6 pt-3 pb-2 dark:border-white/10 dark:bg-slate-800/70">
        <div className="font-semibold tracking-wide">Header {data.id}</div>
        <button
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-white/70"
          onClick={() => close(null, null, null)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path
              fillRule="evenodd"
              d="M15.78 4.22a.75.75 0 010 1.06L10.06 11l5.72 5.72a.75.75 0 11-1.06 1.06l-6.25-6.25a.75.75 0 010-1.06l6.25-6.25a.75.75 0 011.06 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
      <nav className="px-4 pb-6  overflow-y-auto h-[calc(100%-64px)] w-[400px]">
        <ul className="mt-1 pl-1">
          <li>
            {/* Padding */}
            {/* <div className="grid grid-cols-2">
              {paddings.map((item, i) => (
                <div className="col col-span-1 ml-[5px] mr-[5px]" key={i}>
                  <MainLabel label={item.label} />
                  <div className="relative dash-card w-auto rounded-md border border-zinc-400 dark:border-gray-500/50 bg-white dark:bg-zinc-800 px-2 py-1 text-sm text-zinc-900 focus-within:border-zinc-500 flex items-center justify-center w-[160px] mb-[5px] h-[35px]">
                    <div className="absolute pr-2 -left-px">
                      <button
                        className="bg-transparent flex items-center justify-center rounded-md"
                        onClick={() => handlePadding(item.type, minusPadding)}
                      >
                        <Minus className="size-3 m-[10px] text-dark dark:text-white" />
                      </button>
                    </div>
                    <input
                      value={item.data ?? ""}
                      onChange={(e) => handlePadding(item.type, e.target.value)}
                      className="text-dark dark:text-white bg-transparent w-full text-center outline-none focus:outline-none focus:ring-0 focus-visible:outline-none appearance-none"
                    />
                    <div className="absolute pr-2 -right-px">
                      <button
                        className=" bg-transparent flex items-center justify-center rounded-md"
                        onClick={() => handlePadding(item.type, plusPadding)}
                      >
                        <Plus className="size-3 m-[10px] text-dark dark:text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div> */}

             {/* Height */}
             <div className="grid grid-cols-2">
              {heights.map((item, i) => (
                <div className="col col-span-1 ml-[5px] mr-[5px]" key={i}>
                  <MainLabel label={item.label} />
                  <div className="relative dash-card w-auto rounded-md border border-zinc-400 dark:border-gray-500/50 bg-white dark:bg-zinc-800 px-2 py-1 text-sm text-zinc-900 focus-within:border-zinc-500 flex items-center justify-center w-[160px] mb-[5px] h-[35px]">
                    <div className="absolute pr-2 -left-px">
                      <button
                        className="bg-transparent flex items-center justify-center rounded-md"
                        onClick={() => handlePadding(item.type, minusPadding)}
                      >
                        <Minus className="size-3 m-[10px] text-dark dark:text-white" />
                      </button>
                    </div>
                    <input
                      value={item.data ?? ""}
                      onChange={(e) => handlePadding(item.type, e.target.value)}
                      className="text-dark dark:text-white bg-transparent w-full text-center outline-none focus:outline-none focus:ring-0 focus-visible:outline-none appearance-none"
                    />
                    <div className="absolute pr-2 -right-px">
                      <button
                        className=" bg-transparent flex items-center justify-center rounded-md"
                        onClick={() => handlePadding(item.type, plusPadding)}
                      >
                        <Plus className="size-3 m-[10px] text-dark dark:text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Point & Arrow */}
            <div className="grid grid-cols-2">
              {size.map((item, i) => (
                <div className="col col-span-1 ml-[5px] mr-[5px]" key={i}>
                  <MainLabel label={item.label} />
                  <div className="relative dash-card w-auto rounded-md border border-zinc-400 dark:border-gray-500/50 bg-white dark:bg-zinc-800 px-2 py-1 text-sm text-zinc-900 focus-within:border-zinc-500 flex items-center justify-center w-[160px] mb-[5px] h-[35px]">
                    <div className="absolute pr-2 -left-px">
                      <button
                        className="bg-transparent flex items-center justify-center rounded-md"
                        onClick={() => handlePadding(item.type, minusPadding)}
                      >
                        <Minus className="size-3 m-[10px] text-dark dark:text-white" />
                      </button>
                    </div>
                    <input
                      value={item.data ?? ""}
                      onChange={(e) => handlePadding(item.type, e.target.value)}
                      className="text-dark dark:text-white bg-transparent w-full text-center outline-none focus:outline-none focus:ring-0 focus-visible:outline-none appearance-none"
                    />
                    <div className="absolute pr-2 -right-px">
                      <button
                        className=" bg-transparent flex items-center justify-center rounded-md"
                        onClick={() => handlePadding(item.type, plusPadding)}
                      >
                        <Plus className="size-3 m-[10px] text-dark dark:text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>


            <div className="grid grid-cols-2">
                <div className="col col-span-1 ml-[5px] mr-[5px]">
                   {/* Arrow Color */}
            <MainLabel label="สีลูกศร" />
            <FormControl fullWidth id="color-input">
        {/* กล่อง input + ปุ่ม ต่อกันแนบสนิท */}
        <Box sx={{ display: "flex", width: "100%" }} className="mt-3">
          <TextField
            value={typeof data.arrowColor !== "string" && allColors.length > 2 ? theme[data.arrowColor.type][data.arrowColor.index] : data.arrowColor}
            className="bg-white dark:bg-zinc-800 rounded-l-[5px] "
            ref={anchorArrowRef}
            InputProps={{ readOnly: true }}
            sx={() => {

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
                  borderColor: "var(--dash-panel-input-border, #e2e8f0)",
                  borderTopLeftRadius: 5,
                  borderBottomLeftRadius: 5,
                  borderRightWidth: 0
                },
                "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--dash-panel-input-border, #e2e8f0)",
                },
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--dash-panel-input-border, #e2e8f0)",
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
                  borderColor: "var(--dash-panel-input-border, #e2e8f0)",
                  borderTopLeftRadius: 5,
                  borderBottomLeftRadius: 5,
                  borderRightWidth: 0
                },
                ".dark & .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--dash-panel-input-border, #e2e8f0)",
                  borderRightWidth: 0
                },
                ".dark & .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--dash-panel-input-border, #e2e8f0)",
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
            sx={() => {
              const bg =
                typeof data.arrowColor === "object"
                  ? theme?.[data.arrowColor.type]?.[data.arrowColor.index]
                  : data.arrowColor
      
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
                borderColor: "var(--dash-panel-input-border, #e2e8f0)",
      
                // (ตัวเลือก) ถ้าไม่อยากให้มีเส้นหนาตรงรอยต่อกลาง
                // ให้ตัดเส้นซ้ายของปุ่มออก จะเหลือเส้นของ TextField ฝั่งเดียวพอดี
                // borderLeftWidth: 0,
      
                // สีพื้นหลังของปุ่ม = สีที่เลือก
                backgroundColor: bg || "transparent",
                "&:hover": {
                  backgroundColor: bg || "transparent",
                  borderColor: "var(--dash-panel-input-border, #e2e8f0)",
                  boxShadow: "none", // กันธีมเพิ่มเงาตอนโฮเวอร์
                },
      
                // สีตัวอักษร - ให้สืบทอดจาก parent; คุณจะเปลี่ยนเป็นขาว/ดำเองก็ได้
                color: "inherit",

                ".dark &": {
                  borderColor: "var(--dash-panel-input-border, #e2e8f0)", // สีกรอบใน dark (เทาเข้มที่คุณใช้กับ TextField)
                  "&:hover": { borderColor: "var(--dash-panel-input-border, #e2e8f0)" },
                  borderTopRightRadius: 5,
                  borderBottomRightRadius: 5,
                },
              };
            }}
            onClick={() => {
              setOpenColorTable4(!openColorTable4)
              setAnchorArrowEl(anchorArrowRef.current);
            }}
      
          >
            <Palette className="size-5 text-white" strokeWidth={2}/>
            
          </Button>
        </Box>
      </FormControl>
            <Popper
              open={openColorTable4}
              placement="bottom-start"
              anchorEl={anchorArrowEl}
              modifiers={[
                { name: "offset", options: { offset: [0,7] } },
                { name: "flip", enabled: true },
                { name: "preventOverflow", options: { padding:8 } },
              ]}
              disablePortal
              sx={{ zIndex: 1300 }}
            >
        
              
               <div className="w-[363px] dash-card rounded-md bg-white dark:bg-zinc-800 border border-zinc-400/35 dark:border-gray-500/50 px-[5px] pt-[8px] pb-[15px]  flex flex-col gap-2 ">
                  
               <div className="pt-[2px] pb-[2px] px-[8px]">
                    {/* <input type="range" className="w-full accent-slate-900 dark:accent-emerald-300 border border-0"/> */}
                    <input
                    type="range"
                    min={0}
                    max={255}
                    value={data.opacityArrow}
                    step={1}
                    onChange={(e)=>handleOpacity("opacityArrow",Number(e.target.value))}
                    className="
                    w-full cursor-pointer appearance-none h-2 rounded-full
                    bg-zinc-200
                    dark:bg-zinc-700
  
            
                    theme-range-fill-track
            
                    [&::-webkit-slider-runnable-track]:border-0
                    [&::-moz-range-track]:border-0
            
                    [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-emerald-300
                    dark:[&::-webkit-slider-thumb]:bg-emerald-300
                    [&::-webkit-slider-thumb]:bg-slate-900
                    [&::-webkit-slider-thumb]:border-0
            
                    [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4
                    [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:bg-emerald-300
                    [&::-moz-range-thumb]:border-0
                  "
                  style={{ ['--pos']: `${(data.opacityArrow/255)*100}%`,['--fill']:textColor }}
                    />
                </div>
                      
                    <div className="grid grid-cols-10 place-items-center gap-[6px_0px]">
                        {allColors.map((color,i)=>
                        {
                          
                          const bgColor = typeof color === "string" ? color : theme[color.type][color.index]
                         const value = color
                         let margin = ""
                         if(i % 8 !== 0 && (i+1) % 8 !== 0){
                          margin += `mx-[65.75px] `
                         }


                         
  
  
  
                          return (
                            <div className={`col col-sapn-1 ${margin}`} key={i}>
                              <button  className={`size-[25px] rounded-full border flex items-center justify-center`} style={{backgroundColor:bgColor}} onClick={()=>handleColor(value,"arrowColor")}>
                                {(lodash.isEqual(data.arrowColor,value) || data.arrowColor === value) && (
                                  <Check className={swatchSelectedCheckClassName(bgColor)} strokeWidth={4}/>
                                )}
                              </button>
                            </div>
                            
                          )
                        }
                       )}
                    </div>
                  
                  


               </div>
            </Popper>
                </div>
                <div className="col col-span-1 ml-[5px] mr-[5px]">
                        {/* Backgorund Arrow Color */}
             <MainLabel label="สีพื้นหลัง" />
            <FormControl fullWidth id="color-input">
        {/* กล่อง input + ปุ่ม ต่อกันแนบสนิท */}
        <Box sx={{ display: "flex", width: "100%" }} className="mt-3">
          <TextField
            value={typeof data.backgroundArrowColor !== "string" && allColors.length > 2 ? theme[data.backgroundArrowColor.type][data.backgroundArrowColor.index] : data.backgroundArrowColor}
            className="bg-white dark:bg-zinc-800 rounded-l-[5px] "
            ref={anchorBGArrowRef}
            InputProps={{ readOnly: true }}
            sx={() => {

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
                  borderColor: "var(--dash-panel-input-border, #e2e8f0)",
                  borderTopLeftRadius: 5,
                  borderBottomLeftRadius: 5,
                  borderRightWidth: 0
                },
                "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--dash-panel-input-border, #e2e8f0)",
                },
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--dash-panel-input-border, #e2e8f0)",
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
                  borderColor: "var(--dash-panel-input-border, #e2e8f0)",
                  borderTopLeftRadius: 5,
                  borderBottomLeftRadius: 5,
                  borderRightWidth: 0
                },
                ".dark & .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--dash-panel-input-border, #e2e8f0)",
                  borderRightWidth: 0
                },
                ".dark & .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--dash-panel-input-border, #e2e8f0)",
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
            sx={() => {
              const bg =
                typeof data.backgroundArrowColor === "object"
                  ? theme?.[data.backgroundArrowColor.type]?.[data.backgroundArrowColor.index]
                  : data.backgroundArrowColor
      
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
                borderColor: "var(--dash-panel-input-border, #e2e8f0)",
      
                // (ตัวเลือก) ถ้าไม่อยากให้มีเส้นหนาตรงรอยต่อกลาง
                // ให้ตัดเส้นซ้ายของปุ่มออก จะเหลือเส้นของ TextField ฝั่งเดียวพอดี
                // borderLeftWidth: 0,
      
                // สีพื้นหลังของปุ่ม = สีที่เลือก
                backgroundColor: bg || "transparent",
                "&:hover": {
                  backgroundColor: bg || "transparent",
                  borderColor: "var(--dash-panel-input-border, #e2e8f0)",
                  boxShadow: "none", // กันธีมเพิ่มเงาตอนโฮเวอร์
                },
      
                // สีตัวอักษร - ให้สืบทอดจาก parent; คุณจะเปลี่ยนเป็นขาว/ดำเองก็ได้
                color: "inherit",

                ".dark &": {
                  borderColor: "var(--dash-panel-input-border, #e2e8f0)", // สีกรอบใน dark (เทาเข้มที่คุณใช้กับ TextField)
                  "&:hover": { borderColor: "var(--dash-panel-input-border, #e2e8f0)" },
                  borderTopRightRadius: 5,
                  borderBottomRightRadius: 5,
                },
              };
            }}
            onClick={() => {
              setOpenColorTable5(!openColorTable5)
              setAnchorBGArrowEl(anchorBGArrowRef.current);
            }}
      
          >
            <Palette className="size-5 text-white" strokeWidth={2}/>
            
          </Button>
        </Box>
      </FormControl>
            <Popper
              open={openColorTable5}
              placement="bottom-start"
              anchorEl={anchorBGArrowEl}
              modifiers={[
                { name: "offset", options: { offset: [0,7] } },
                { name: "flip", enabled: true },
                { name: "preventOverflow", options: { padding:8 } },
              ]}
              disablePortal
              sx={{ zIndex: 1300 }}
            >
        
              
               <div className="w-[363px] dash-card rounded-md bg-white dark:bg-zinc-800 border border-zinc-400/35 dark:border-gray-500/50 px-[5px] pt-[8px] pb-[15px]  flex flex-col gap-2 ">
                  
               <div className="pt-[2px] pb-[2px] px-[8px]">
                    {/* <input type="range" className="w-full accent-slate-900 dark:accent-emerald-300 border border-0"/> */}
                    <input
                    type="range"
                    min={0}
                    max={255}
                    value={data.opacityBackgroundArrow}
                    step={1}
                    onChange={(e)=>handleOpacity("opacityBackgroundArrow",Number(e.target.value))}
                    className="
                    w-full cursor-pointer appearance-none h-2 rounded-full
                    bg-zinc-200
                    dark:bg-zinc-700
  
            
                    theme-range-fill-track
            
                    [&::-webkit-slider-runnable-track]:border-0
                    [&::-moz-range-track]:border-0
            
                    [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-emerald-300
                    dark:[&::-webkit-slider-thumb]:bg-emerald-300
                    [&::-webkit-slider-thumb]:bg-slate-900
                    [&::-webkit-slider-thumb]:border-0
            
                    [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4
                    [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:bg-emerald-300
                    [&::-moz-range-thumb]:border-0
                  "
                  style={{ ['--pos']: `${(data.opacityArrow/255)*100}%`,['--fill']:textColor }}
                    />
                </div>
                      
                    <div className="grid grid-cols-10 place-items-center gap-[6px_0px]">
                        {allColors.map((color,i)=>
                        {
                          
                          const bgColor = typeof color === "string" ? color : theme[color.type][color.index]
                         const value = color
                         let margin = ""
                         if(i % 8 !== 0 && (i+1) % 8 !== 0){
                          margin += `mx-[65.75px] `
                         }


                         
  
  
  
                          return (
                            <div className={`col col-sapn-1 ${margin}`} key={i}>
                              <button  className={`size-[25px] rounded-full border flex items-center justify-center`} style={{backgroundColor:bgColor}} onClick={()=>handleColor(value,"backgroundArrowColor")}>
                                {(lodash.isEqual(data.backgroundArrowColor,value) || data.backgroundArrowColorr === value) && (
                                  <Check className={swatchSelectedCheckClassName(bgColor)} strokeWidth={4}/>
                                )}
                              </button>
                            </div>
                            
                          )
                        }
                       )}
                    </div>
                  
                  


               </div>
            </Popper>
                </div>
            </div>
            

           

             

            {/* Point Color */}
            <MainLabel label="สี Bullet" />
            <FormControl fullWidth id="color-input">
        {/* กล่อง input + ปุ่ม ต่อกันแนบสนิท */}
        <Box sx={{ display: "flex", width: "100%" }} className="mt-3">
          <TextField
            value={typeof data.pointColor !== "string" && allColors.length > 2 ? theme[data.pointColor.type][data.pointColor.index] : data.pointColor}
            className="bg-white dark:bg-zinc-800 rounded-l-[5px] "
            ref={anchorPointRef}
            InputProps={{ readOnly: true }}
            sx={() => {

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
                  borderColor: "var(--dash-panel-input-border, #e2e8f0)",
                  borderTopLeftRadius: 5,
                  borderBottomLeftRadius: 5,
                  borderRightWidth: 0
                },
                "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--dash-panel-input-border, #e2e8f0)",
                },
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--dash-panel-input-border, #e2e8f0)",
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
                  borderColor: "var(--dash-panel-input-border, #e2e8f0)",
                  borderTopLeftRadius: 5,
                  borderBottomLeftRadius: 5,
                  borderRightWidth: 0
                },
                ".dark & .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--dash-panel-input-border, #e2e8f0)",
                  borderRightWidth: 0
                },
                ".dark & .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--dash-panel-input-border, #e2e8f0)",
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
            sx={() => {
              const bg =
                typeof data.pointColor === "object"
                  ? theme?.[data.pointColor.type]?.[data.pointColor.index]
                  : data.pointColor
      
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
                borderColor: "var(--dash-panel-input-border, #e2e8f0)",
      
                // (ตัวเลือก) ถ้าไม่อยากให้มีเส้นหนาตรงรอยต่อกลาง
                // ให้ตัดเส้นซ้ายของปุ่มออก จะเหลือเส้นของ TextField ฝั่งเดียวพอดี
                // borderLeftWidth: 0,
      
                // สีพื้นหลังของปุ่ม = สีที่เลือก
                backgroundColor: bg || "transparent",
                "&:hover": {
                  backgroundColor: bg || "transparent",
                  borderColor: "var(--dash-panel-input-border, #e2e8f0)",
                  boxShadow: "none", // กันธีมเพิ่มเงาตอนโฮเวอร์
                },
      
                // สีตัวอักษร - ให้สืบทอดจาก parent; คุณจะเปลี่ยนเป็นขาว/ดำเองก็ได้
                color: "inherit",

                ".dark &": {
                  borderColor: "var(--dash-panel-input-border, #e2e8f0)", // สีกรอบใน dark (เทาเข้มที่คุณใช้กับ TextField)
                  "&:hover": { borderColor: "var(--dash-panel-input-border, #e2e8f0)" },
                  borderTopRightRadius: 5,
                  borderBottomRightRadius: 5,
                },
              };
            }}
            onClick={() => {
              setOpenColorTable6(!openColorTable6)
              setAnchorPointEl(anchorPointRef.current);
            }}
      
          >
            <Palette className="size-5 text-white" strokeWidth={2}/>
            
          </Button>
        </Box>
      </FormControl>
            <Popper
              open={openColorTable6}
              placement="bottom-start"
              anchorEl={anchorPointEl}
              modifiers={[
                { name: "offset", options: { offset: [0,7] } },
                { name: "flip", enabled: true },
                { name: "preventOverflow", options: { padding:8 } },
              ]}
              disablePortal
              sx={{ zIndex: 1300 }}
            >
        
              
               <div className="w-[363px] dash-card rounded-md bg-white dark:bg-zinc-800 border border-zinc-400/35 dark:border-gray-500/50 px-[5px] pt-[8px] pb-[15px]  flex flex-col gap-2 ">

                      
                    <div className="grid grid-cols-10 place-items-center gap-[6px_0px]">
                        {allColors.map((color,i)=>
                        {
                          
                          const bgColor = typeof color === "string" ? color : theme[color.type][color.index]
                         const value = color
                         let margin = ""
                         if(i % 8 !== 0 && (i+1) % 8 !== 0){
                          margin += `mx-[65.75px] `
                         }


                         
  
  
  
                          return (
                            <div className={`col col-sapn-1 ${margin}`} key={i}>
                              <button  className={`size-[25px] rounded-full border flex items-center justify-center`} style={{backgroundColor:bgColor}} onClick={()=>handleColor(value,"pointColor")}>
                                {(lodash.isEqual(data.pointColor,value) || data.pointColor === value) && (
                                  <Check className={swatchSelectedCheckClassName(bgColor)} strokeWidth={4}/>
                                )}
                              </button>
                            </div>
                            
                          )
                        }
                       )}
                    </div>
                  
                  


               </div>
            </Popper>
                  
            {/* <ListOption
                    options={headingOptions}
                    label="ตัวอักษร - หัวข้อ"
                    type="textHeading"
                  /> */}

<ListOption         
                    page={page}
                    options={heros}
                    label="หน้าสไลด์"
                    type="textHeading"
                    onChange={setPage}
                  />

                  <div className="mb-3"/>


<Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>

<Button component="label"
      role={undefined}
      variant="contained"
      tabIndex={-1}
      startIcon={<ImageOutlinedIcon />} sx={{
        '& .MuiButton-startIcon > *:nth-of-type(1)': {
          fontSize: 18,  // ปรับขนาดไอคอนที่เป็นลูกคนแรก
        },
        boxShadow: 'none',
        '&:hover': { boxShadow: 'none' },
        backgroundColor: textColor,
        fontSize:12,
        height:28
      }}>
      อัปโหลด


      {/* <VisuallyHiddenInput
    type="file" 
    onChange={(e)=>{
      console.log(e.target.files[0])
      setData((prev=>{
        setUpdated(true)
        return {...prev,backgroundImage:URL.createObjectURL(e.target.files[0])}
      }))
    }}
    multiple
  /> */}
    </Button>


    <Button variant="contained" sx={{
      ml: 'auto',
        boxShadow: 'none',
        '&:hover': { boxShadow: 'none' },
        backgroundColor: textColor,
        ".dark &":{
          backgroundColor: textColor,

        },
        fontSize:12,
        height:28,

      }} onClick={()=>{
        // setData((prev=>{
        //   setUpdated(true)
        //   return {...prev,backgroundImage:"",opacityImage:1}
        // }))
      }} 
      // disabled={!data.backgroundImage}>ลบ   
      disabled>ลบ  
    </Button>
</Box>




<div className="relative w-auto rounded-md  bg-gray-200 dark:bg-zinc-800 px-2 py-1 text-sm text-zinc-900 focus-within:border-zinc-500 flex items-center justify-center w-[160px] mb-[5px] mt-3 h-[150px]">
    
    <p className="absolute text-md text-gray-400 dark:text-gray-500 ">ไม่มีรูปภาพ {page}</p>
  </div>


          </li>
        </ul>
      </nav>
    </aside>
  );

  function MainLabel({ label }) {
    const w =
      label === "Padding Top"
        ? "w-[85px]"
        : label === "Padding Bottom"
        ? "w-[64px]"
        : "flex-1";
    const colorSwitch = ["สีพื้นหลังแบบสีพื้น","สีพื้นหลังแบบไล่โทน"].includes(label)
    const typography = label === "สีพื้นหลังแบบสีพื้น" ? "สีไล่โทน" : "สีพื้น"
    return (
      <div className="flex items-center gap-2 mt-5 mb-2">
        <span className="dash-panel-label text-[13px] font-bold">
          {label}
        </span>
        <div className={`dash-heading-rule border-b ${w}`}></div>
        {colorSwitch && (
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
             <AntSwitch  inputProps={{ 'aria-label': 'ant design' }} checked={data.isGradient} onChange={()=>{
              setData(prev=>{return {...prev,isGradient:!prev.isGradient}})
                setOpenColorTable1(false)
                setOpenColorTable2(false)
                setOpenColorTable3(false)
                setUpdated(true)
             }}/>
             <Typography sx={{ fontSize: 13 }}>{typography}</Typography>
          </Stack>
         
        )}
      </div>
    );
  }
  function ListOption({ page, options, label, onChange}) {
    return (
      <>
        <MainLabel label={label} />
  
        <Listbox value={page} onChange={(e) => onChange(e)}>
          <div className="relative mt-2">
            <ListboxButton className="grid w-full cursor-default grid-cols-1 rounded-md bg-gray-900 dark:bg-white text-gray-300 dark:text-gray-900 py-1.5 pr-2 pl-3 text-left outline-1 -outline-offset-1 outline-gray-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 text-[12px] hover:cursor-pointer">
              <span className={`col-start-1 row-start-1 flex items-center gap-3 pr-6`}>
                <span className={`block truncate `}></span>
                {page}
              </span>
              <ChevronUpDownIcon
                aria-hidden="true"
                className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4"
              />
            </ListboxButton>
  
            <ListboxOptions
              transition
              className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-gray-900 dark:bg-white text-teal-500 dark:text-teal-500 py-1 shadow-none outline-1 outline-black/5 data-leave:transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0 text-[12px]"
            >
              {options.map(option=> (
                <ListboxOption
                  value={option}
                  key={option}
                  id={"ID-"+option}
                  className={`group relative cursor-default py-2 pr-9 pl-3 text-gray-200 dark:text-gray-900 select-none 
                    data-focus:bg-indigo-600 data-focus:text-white data-focus:outline-hidden hover:cursor-pointer
                    ${
                      option !== 0
                        ? "border-dotted border-t border-gray-600 dark:border-gray-200"
                        : ""
                    }
                  `}
                >
                  <div className="flex items-center">
                    <span
                      className={`ml-3 block truncate font-normal group-data-selected:font-semibold`}
                    >
                      {option}
                    </span>
                  </div>
  
                  {page === option && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                      <CheckCircleIcon
                        aria-hidden="true"
                        className="size-5 !text-gray-400 dark:!text-gray-800"
                      />
                    </span>
                  )}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </div>
        </Listbox>
      </>
    );
  }
};


export default HeaderOffcanvas;
