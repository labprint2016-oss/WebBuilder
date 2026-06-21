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
    RadioGroup,
    Checkbox,
    ListItemText,Modal,Fade,Backdrop
  } from "@mui/material";
  import ImageModal from "./imageModal";
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
    HardDrive,Type
  } from "lucide-react";
  import { swatchSelectedCheckClassName } from "./Layouts/Elements/swatchCheckClass";
  import { THEME_PANEL_BASIC_COLOR_SWATCHES } from "./themePanelBasicColors";
  import { Description } from "@headlessui/react";
  import { blue } from "@mui/material/colors";
  import { createPost } from "../../Functions/post";
  import lodash, { isNull, set, transform } from "lodash";
  import Icons  from "./Icons";
  import { getPost } from "../../Functions/post";
  import { BrowserRouter, Route, Routes, Navigate, useLocation, useNavigate, matchPath, useParams } from "react-router-dom"

  function ColorInput({ theme, colors, handleChange, elementColor,width="100%" }) {


  
  


    return (<div
      className={`grid grid-cols-10 gap-[5px_0px] my-1  w-full relative inline-block`}
      role="group"
    >
  
  
      {colors.map((color, i) => {
  
        const bgColor =
          typeof color === "string"
            ? color
            : theme[color.type][color.index];
        const value = color;
  
        const borderWidth = i === 0 || i % 10 === 0 ? "" : "border-l-0";
  
        if(lodash.isEqual(elementColor, value) || elementColor === value){
          console.log(value);
          
        }
  
  
  
        return (
          <div key={i}>
            <button
              value={value}
              type="button"
              style={{ backgroundColor: bgColor,width:width }}
              onClick={() => {
                handleChange(value);
              }}
              className={`h-7  border ${borderWidth}  border-gray-300 dark:border-white/20 flex justify-center items-center ${i === 0 || i % 10 === 0 ? "rounded-l-md" : ""
                } ${i === colors.length - 1 || (i + 1) % 10 === 0
                  ? "rounded-r-md"
                  : ""
                } focus:z-10 focus:ring-0 focus:outline-none w-full`}
  
            >{(lodash.isEqual(elementColor, value) || elementColor === value) && (
              <Check className={swatchSelectedCheckClassName(bgColor)} strokeWidth={4} />
            )}</button>
          </div>
        )
      }
      )}
    </div>)
  
  
  }
  
  
  function IconInput({icon,handleChange}) {
  
    return (
  
  
        <div className="w-[363px] rounded-md bg-[#454b57] POPPER px-[5px] pt-[8px] pb-[10px] mb-[5px] flex flex-col gap-2 ">
          <div className="grid grid-cols-10 place-items-center gap-[6px_0px]">
            {Icons.map((Icon, i) => {
              const iconName = Icon.displayName;
              let margin = "";
  
              if (i % 8 !== 0 && (i + 1) % 8 !== 0) {
                margin += `mx-[65.75px] `;
              }
  
              return (
                <div className={`col col-sapn-1 ${margin}`} key={i}>
                  <button
                    className={`size-[25px] rounded-full border flex items-center justify-center`}
                    style={{
                      backgroundColor: `${icon === iconName ? "black" : "white"}`,
                    }}
                    onClick={() => {
                      handleChange(iconName);
                    }}
                  >
                    <Icon
                      className={`size-4 text-${icon === iconName ? "white" : "black"
                        }`}
                      strokeWidth={2.2}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      
    );
    
  }
  
  
  
  
  function OptionModal({ open, onClose, header, children }) {
    return (
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="basic-modal-title"
        aria-describedby="basic-modal-desc"
        slotProps={{ backdrop: { timeout: 200 } }}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
      >
        <Fade in={open} timeout={200} onExited={onClose}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "fit-content",
              maxWidth: "90vw",
              height: "auto",
              backgroundColor: "#454b58",
              borderRadius: 3,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div className="flex justify-between px-4 pt-3 pb-1">
              <div className="text-[15px] font-bold">
                <span className="text-white dark:text-emerald-300">
                  {header}
                </span>{" "}
              </div>
              <div>
                <a onClick={onClose} style={{ cursor: "pointer", color: "white" }}>
                  X
                </a>
              </div>
            </div>
            <div
              className={`border-b border-dotted border-gray-500/50 flex-1`}
            ></div>
            <div className="flex justify-center mt-4 text-[13px] px-2">
              {children}
            </div>
  
            <div className="flex justify-center my-[-4px] pb-5">
  
            </div>
          </Box>
        </Fade>
      </Modal>
    )
  }
  
  
  const UpdatePost = ({setIsEditPost,setPostOnPreview,post,setPost,handleUpdate,mainTheme,postID}) => {



    const {id} = useParams()
    console.log(id);
  
  
  
    const [newPost,setNewPost] = useState({})
  
  
    useEffect(()=>{
      setPost(newPost)
    },[newPost])



    useEffect(()=>{
      getPost(id)
      .then((res)=>{
       const newData = lodash.cloneDeep(res.data)
       delete newData.createdAt
       delete newData.updatedAt
       delete newData.__v
       setNewPost(newData)
       setPostOnPreview(newData)
      })
      .catch((err)=>{
        console.log(err);
      })
    },[id])
  
  
    
    const [allColors,setAllColors] = useState([])
    const basicColors = THEME_PANEL_BASIC_COLOR_SWATCHES
  
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
  
    const SX_CENTER_FIELD = {...COMMON_FIELD_SX,"& .MuiOutlinedInput-root": {
      height: 47,
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
    },
  
    // 🔑 ตัดเส้นขอบด้านขวาออกทุกสถานะ
    "& .MuiOutlinedInput-notchedOutline": { borderLeftWidth: "0px !important",borderRightWidth:"0px !important" },
  
  
    // ถ้ามีโหมด .dark
    ".dark & .MuiOutlinedInput-notchedOutline": { borderLeftWidth: 0 },
    ".dark & .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
      borderLeftWidth: 0,
    },
    ".dark & .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderLeftWidth: 0,
    },}
  
    const SX_FIRST_FIELD = {...COMMON_FIELD_SX,"& .MuiOutlinedInput-root": {
      height: 47,
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
    },
  
    // 🔑 ตัดเส้นขอบด้านขวาออกทุกสถานะ
    "& .MuiOutlinedInput-notchedOutline": {borderRightWidth:"0px !important" },
  
  
    // ถ้ามีโหมด .dark
  }
  
  

  

  
    const imgTypes = ["รูปภาพ","แกเลอรี่","วิดีโอ"]
    const decorationTypes = ["แถบ","ริบบิ้น","วงกลม"]
    const columnAmount = [2,3,4]
    const buttonAmount = [1,2]
    const textAlign = [{key:"start",Icon:TextAlignStart},{key:"center",Icon:TextAlignCenter},{key:"end",Icon:TextAlignEnd}]
  
  
  

  
  const setBgColor = (color)=>{
    if(typeof color === "string"){
      return color
    }else{
      return mainTheme[color.type][color.index]
    }
  }
  
  

  

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
      const {name,value} = e.target
      setNewPost(prev=>{
        return {...prev,[name]:value}
      })
      setPostOnPreview(prev=>{
        return {...prev,[name]:value}
      })
    }
  
    const handleChange2 =  (mainField,index,e)=>{
      const {name,value} = e.target
      setNewPost(prev=>{
        if(index >= 0 && typeof mainField === "string"){
          const field = prev[mainField]
          field[index][name] = value
          setPostOnPreview(prev=>{
            return {...prev,[mainField]:field}
          })
          return {...prev,[mainField]:field}
        }else if(Array.isArray(mainField)){
          const [first,second] = mainField
          const field = prev[first]
          field[index][second][name] = value
          setPostOnPreview(prev=>{
            return {...prev,[first]:field}
          })
          return {...prev,[first]:field}
        }
       else{
        setPostOnPreview(prev=>{
          return {...prev,[mainField]:{...prev[mainField],[name]:value}}
        })
        return {...prev,[mainField]:{...prev[mainField],[name]:value}}
       }
      })
    }

    const cates = ["-","ยุโรป","ญี่ปุ่น","อเมริกา"]
  
  
  
  
  
    const isImageOrVideo = ()=>{
      const bool =  ["รูปภาพ","วิดีโอ"].includes(newPost?.imageType)
      if(bool){
        return true
      }else{
        return false
      }
    }
  
  
    useEffect(()=>{
      console.log(newPost);
    },[newPost])
  
  
    function MainLabel({ label }) {
  
      const labelSwitch = ["ปุ่มกด","ตกแต่งรูปภาพ","เพิ่มเติม"]
      const check = label === "ปุ่มกด"?newPost?.isButton:label === "ตกแต่งรูปภาพ"?newPost?.imageDecoration:newPost?.isColumn
    
      return (
        <div className="flex items-center gap-2  mb-2">
           {labelSwitch.includes(label)  && (
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                 <AntSwitch  inputProps={{ 'aria-label': 'ant design' }} checked={check} onChange={()=>{
                  if(label === "ปุ่มกด"){
                    setNewPost(prev=>{return {...prev,isButton:!prev.isButton}})
                  }else if(label === "ตกแต่งรูปภาพ"){
                    setNewPost(prev=>{return {...prev,imageDecoration:!prev.imageDecoration}})
                  }else{
                    setNewPost(prev=>{return {...prev,isColumn:!prev.isColumn}})
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


  useEffect(()=>{
    const event = {target:{name:"category",value:["-"],files:null}}
    if(newPost?.category?.length === 0){
      handleChange(event)
    }else if(newPost?.category?.length > 1 && newPost?.category.includes("-")){
      let cates = lodash.cloneDeep(newPost?.category)
      cates = cates.filter(cate => cate !== "-")
      event.target.value = cates
      handleChange(event)
    }
    
  },[newPost?.category])
  


  const [openModal,setOpenModal] = useState("null-0")
  const [colorType,setColorType] = useState(false)
const openColor = (n)=>{
  if(colorType === n){
    setColorType(false)
  }else{
    setColorType(n)
  }
}


useEffect(()=>{
  setColorType(false)
},[openModal])





const Range = ({ value, handleChange, min, max, step }) => {
  const [newValue, setNewValue] = useState(value);

  useEffect(() => {
    setNewValue(value);
  }, [value]);

  return (
    <div className="pt-[2px] pb-[2px] px-[5px]">
      <input
        type="range"
        min={min}
        max={max}
        value={newValue}
        step={step}
        onChange={(e) => {
          setNewValue(Number(e.target.value));
        }}
        onMouseUp={() => {
          handleChange(newValue);
        }}
        className="
    w-full appearance-none h-2 rounded-full
    bg-zinc-200
    dark:bg-zinc-700


    theme-range-fill-track

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
        style={{ ["--pos"]: `${(newValue / max) * 100}%`, ["--fill"]: `black` }}
      />
    </div>
  );
};
  
    
return (
  <main
    className="content-area flex min-h-0 flex-1 flex-col overflow-y-auto p-4 sm:p-6 "
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
        value={newPost?.title?.text}
        variant="outlined"
        label="ชื่อหัวข้อ"
        name="text"
        onChange={(e)=>{
          handleChange2("title",-1,e)
        }}
        sx={SX_FIRST_FIELD}
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
          onClick={()=>{
           setOpenModal("title")
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
           <Box
      sx={{
        width: 20,
        height: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    ><Settings className="size-5 text-white" strokeWidth={2}/></Box>
          
        </Button>
      </Box>
    </FormControl>


    <OptionModal open={openModal === "title"} onClose={() => setOpenModal("null-0")} header="ตั้งค่าหัวข้อ">

    <div className="pt-[5px] mb-[2px] pb-[2px] px-[8px] grid grid-cols-[repeat(4,1fr)_auto] gap-2 items-center">
                  <div className="col-span-2">
                  <Box sx={{ display: "flex", width: "100%" }} >
                  <TextField sx={{...SX_FIRST_FIELD ,"& .MuiOutlinedInput-root": { height: 35,color:"whitesmoke" ,borderTopRightRadius:0,borderBottomRightRadius:0,width:100},"& .MuiInputLabel-root": { fontSize: 12.5,color:"#aaaaaa"},
        "& .MuiInputLabel-root.Mui-focused": { fontSize: 12.5,color:"whitesmoke"},
        "& .MuiInputLabel-root.Mui-error": { color: "whitesmoke !important" },
"& .MuiInputLabel-root.Mui-disabled": { color: "whitesmoke !important" },
        // 🔑 ตัดเส้นขอบด้านขวาออกทุกสถานะ
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "#5e636d !important",
        },
     
        }}  variant="outlined" label="ขนาด" value={newPost?.title?.size} name="size" onChange={(e)=>handleChangeForNumber(e,2,{mainField:"title",index:-1})} slotProps={{
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
            <TextField sx={{...SX_FIRST_FIELD ,"& .MuiOutlinedInput-root": { height: 35,color:"whitesmoke" ,borderTopRightRadius:0,borderBottomRightRadius:0,width:100},"& .MuiInputLabel-root": { fontSize: 12.5,color:"#aaaaaa"},
        "& .MuiInputLabel-root.Mui-focused": { fontSize: 12.5,color:"whitesmoke"},
        "& .MuiInputLabel-root.Mui-error": { color: "whitesmoke !important" },
"& .MuiInputLabel-root.Mui-disabled": { color: "whitesmoke !important" },
        // 🔑 ตัดเส้นขอบด้านขวาออกทุกสถานะ
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "#5e636d !important",
        },
     
        }}  variant="outlined" label="ระยะห่าง" value={newPost?.title?.padding} name="padding" onChange={(e)=>handleChangeForNumber(e,2,{mainField:"title",index:-1})} slotProps={{
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
                  <Button sx={{backgroundColor:"#454b57",color:"white",minWidth:38,height:35,borderColor:"#5e636d",borderWidth:"1px",borderStyle:"solid"}} onClick={()=>setNewPost(prev=>{
                    return {...prev,title:{...prev.title,bold:!prev.title?.bold}}
                  })}>{newPost?.title?.bold ? <Bold strokeWidth={3} size={18} /> : <Type strokeWidth={3} size={18} />}</Button>
                  </Box>
                  </div>
                 
              </div>
    </OptionModal>


      
    </div>
    {/* หมวดหมู่ */}
    <div className="col-span-6 mt-3">
      <FormControl fullWidth variant="outlined" sx={COMMON_FIELD_SX}>
        <InputLabel id="cat-label">หมวดหมู่</InputLabel>
        <Select
          labelId="cat-label"
          id="category"
          name="category"
          multiple
          value={newPost?.category || []}
          onChange={handleChange}
          renderValue={(selected) => {
            if (!selected || !Array.isArray(selected) || selected.length === 0) {
              return <Box sx={{ color: 'text.disabled' }}>ไม่มีหมวดหมู่</Box>;
            }
            const isNoCate = selected.includes("-");
            return isNoCate
            ? <Box sx={{ color: 'text.disabled' }}>ไม่มีหมวดหมู่</Box>
            : selected.join(', ');
          }}
          label="หมวดหมู่"
          MenuProps={{
            // ย่อ padding + ฟอนต์ในเมนู
            PaperProps: {
              elevation: 0,
              sx: {
                boxShadow: 'none',
                '& .MuiList-root': { py: 0.25 }, // ลดช่องว่างบนลิสต์
                '& .MuiMenuItem-root': {
                 height: 28,        // ลดความสูงต่อแถว
                  py: 0.25,             // บีบแนวตั้ง
                  px: 1.0,              // บีบแนวนอน
                  fontSize: 13,         // ย่อฟอนต์
                  gap: 0.5,             // ระยะห่าง Checkbox กับข้อความ
                },
              },
            },
            MenuListProps: { dense: true }, // โหมดแน่น
          }}
        >
          {cates.map((cate,i)=>{
            if(cate === "-"){
              return null
            }
            return( <MenuItem value={cate} key={i} sx={{ fontSize: 15 }} hidden={newPost?.category?.length === 1 && newPost?.category?.[0] === "-"}>
            <Checkbox checked={newPost?.category?.includes(cate)}/>
             <ListItemText primary={cate} />
          </MenuItem>)
          }
           
          )}
        
        </Select>
      </FormControl>
    </div>
    {/* รูปภาพ */}
    <div className="col-span-6 mt-3">
    <FormControl fullWidth id="color-input" sx={{height:47}}>
      {/* กล่อง input + ปุ่ม ต่อกันแนบสนิท */}
      <Box sx={{ display: "flex", width: "100%" }} >
        <TextField
        value={newPost?.image?.replace("/uploads/","")}
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
          sx={{...SX_FIRST_FIELD,flex:1}}
          size="small"
          variant="outlined"
        />

        <Button
          variant="contained"
          onClick={() =>setOpenModal("image-upload")
          }
          sx={(t) => {


            return {
              boxShadow: "none",      // 1) เอาเงาออก
              px: 2.5,
              borderTopLeftRadius: 0, // ให้แนบกับ TextField
              borderBottomLeftRadius: 0,
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
             
              // 2) ให้ปุ่มมี "กรอบ" แบบเดียวกับ TextField
              border: "1px solid",
              borderColor: "#A1A1AA",
              minWidth: 52, 

              // (ตัวเลือก) ถ้าไม่อยากให้มีเส้นหนาตรงรอยต่อกลาง
              // ให้ตัดเส้นซ้ายของปุ่มออก จะเหลือเส้นของ TextField ฝั่งเดียวพอดี
              // borderLeftWidth: 0,

              // สีพื้นหลังของปุ่ม = สีที่เลือก
              backgroundColor:"#374151",
              "&:hover": {
                backgroundColor: "#374151",
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
          <div className="text-white">อัปโหลด</div>
          
        </Button>
        <Button
          variant="contained"
          name="BTN_POPPER"
          onClick={()=>{
            setOpenModal("image-setting")
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
              backgroundColor:"#374151",
              "&:hover": {
                backgroundColor: "#374151",
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
          
          <Box
      sx={{
        width: 20,
        height: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    ><Settings className="size-5 text-white" strokeWidth={2}/></Box>
        </Button>
      </Box>
    </FormControl>
    <OptionModal open={openModal === "image-setting"} onClose={() => setOpenModal("null-0")} header="ตั้งค่ารูปภาพ">
    <div className="pt-[5px] mb-[2px] pb-[2px] px-[8px] grid grid-cols-3 gap-2 flex items-center">
                  <div className="col-span-1">
                    <Box sx={{ display: "flex", width: "100%" }}>
                    <TextField sx={{...SX_FIRST_FIELD ,"& .MuiOutlinedInput-root": { height: 35,borderTopRightRadius:0,borderBottomRightRadius:0,width:100,color:"whitesmoke" },"& .MuiInputLabel-root": { fontSize: 12.5,color:"#aaaaaa"},
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

        // focus
      }}  variant="outlined" label="ความสูง" value={newPost?.height} name="height" onChange={handleChangeForNumber} slotProps={{
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
                    <TextField 
                    sx={{...SX_FIRST_FIELD ,"& .MuiOutlinedInput-root": { height: 35,borderTopRightRadius:0,borderBottomRightRadius:0,width:100,color:"whitesmoke" },"& .MuiInputLabel-root": { fontSize: 12.5,color:"#aaaaaa"},
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
          
                    // focus
                  }}  variant="outlined" label="ความกว้าง" value={newPost?.width} name="width" onChange={handleChangeForNumber} slotProps={{
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
                    <TextField sx={{...SX_FIRST_FIELD ,"& .MuiOutlinedInput-root": { height: 35,borderTopRightRadius:0,borderBottomRightRadius:0,width:100,color:"whitesmoke" },"& .MuiInputLabel-root": { fontSize: 12.5,color:"#aaaaaa"},
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

        // focus
      }}  variant="outlined" label="ความโค้งมน" value={newPost?.borderRadius} name="borderRadius" onChange={handleChangeForNumber} slotProps={{
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
    </OptionModal>
 
    </div>
    <div className="col-span-6 mt-3"/> 
     {/* ประเภทรูปภาพ */}
    <div className={`col-span-4 mt-3`}>
        <MainLabel label={"ประเภทรูปภาพ"}/>
        <div className="grid grid-cols-12 flex items-center justify-center">
        {imgTypes.map((type,i)=>(
          <div key={i} className="col-span-4 text-black dark:text-white ">
          <FormControlLabel
            
            control={
              <Radio
              name="imageType"
              value={type}
              onChange={handleChange}
              checked={newPost?.imageType === type}
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
     value={newPost?.link.url}
     type="url"
     onChange={(e)=>{
      handleChange2("link",-1,e)
     }}
     label="ลิงค์"
     sx={{...COMMON_FIELD_SX,"& .MuiOutlinedInput-root": {
      height: 47,
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
      borderTopRightRadius: 5,
      borderBottomRightRadius: 5,
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

   
         </Box>
    </FormControl>
          
        
     
 </div>)}
 { /* target */}
    {newPost?.imageType === "รูปภาพ" && ( 
        <div className={`col-span-4 mt-6`}>
           <Box sx={{ display: "flex", alignItems: "center" }}>
      <RadioGroup
  row
  name="target"
  value={newPost?.link.target}                            // คุมด้วย state
  onChange={(e) => handleChange2("link", -1, e)}      // อัปเดตครั้งเดียว
>
  <FormControlLabel
    value="_self"
    control={<Radio sx={{ color: "black", "&.Mui-checked": { color: "black" } }} />}
    label="หน้าเดิม"    // _self = เปิดหน้าเดิม
    sx={{"& .MuiFormControlLabel-label": { fontSize: 13,color:"black" } }}
  />
  <FormControlLabel
    value="_blank"
    control={<Radio sx={{ color: "black", "&.Mui-checked": { color: "black" } }} />}
    label="แท็บใหม่"    // _blank = เปิดแท็บใหม่
    sx={{"& .MuiFormControlLabel-label": { fontSize: 13,color:"black" } }}
  />
</RadioGroup>
  </Box>
        </div>

      )}
     {/* คำบรรยาย */}
     <div className="col-span-12">
      <Box sx={{width:"100%",display:"flex"}}>
      <TextField
        fullWidth
        variant="outlined"
        name="text"
        value={newPost?.description?.text}
        onChange={(e)=>{
          handleChange2("description",-1,e)
        }}
        label="คำบรรยาย"
        sx={SX_FIRST_FIELD}
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
          onClick={()=>{
            setOpenModal("description")
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
          
          <Box
      sx={{
        width: 20,
        height: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    ><Settings className="size-5 text-white" strokeWidth={2}/></Box>
        </Button>
      </Box>
     <OptionModal open={openModal === "description"} onClose={() => setOpenModal("null-0")} header="ตั้งค่าคำบรรยาย">
     <div className="pt-[5px] mb-[2px] pb-[2px] px-[8px] grid grid-cols-[repeat(4,1fr)_auto] gap-2 items-center">
                  <div className="col-span-2">
                  <Box sx={{ display: "flex", width: "100%" }} >
                  <TextField sx={{...COMMON_FIELD_SX ,"& .MuiOutlinedInput-root": { height: 35,color:"whitesmoke" ,borderTopRightRadius:0,borderBottomRightRadius:0,width:100},"& .MuiInputLabel-root": { fontSize: 12.5,color:"#aaaaaa"},
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
        },}}  variant="outlined" label="ขนาด" value={newPost?.description?.size} name="size" onChange={(e)=>handleChangeForNumber(e,2,{mainField:"description",index:-1})} slotProps={{
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
            <TextField sx={{...COMMON_FIELD_SX ,"& .MuiOutlinedInput-root": { height: 35,color:"whitesmoke" ,borderTopRightRadius:0,borderBottomRightRadius:0,width:100},"& .MuiInputLabel-root": { fontSize: 12.5,color:"#aaaaaa"},
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
        },}}  variant="outlined" label="ระยะห่าง" value={newPost?.description?.padding} name="padding" onChange={(e)=>handleChangeForNumber(e,2,{mainField:"description",index:-1})} slotProps={{
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
     </OptionModal>
     
    </div>
    {/* เพิ่มเติม */}
    <div className="col-span-12 mt-3">
        <MainLabel label={"เพิ่มเติม"}/>
        {newPost?.isColumn && (
          <div className="grid grid-cols-12 flex items-center justify-center">
          {columnAmount.map((amount,i)=>(
            <div key={i} className="col-span-2 text-black dark:text-white ">
            <FormControlLabel
              
              control={
                <Radio
                name="columnAmount"
                value={amount}
                onChange={handleChangeForNumber}
                checked={newPost?.columnAmount == amount}
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
    {newPost?.isColumn && (
       <div className="col-span-12 ">
       <div className="grid grid-cols-4 gap-4">
         {newPost?.columns.map((col,i)=>{

           const {icon,text,color,opacity} = col
           if(i+1 > newPost?.columnAmount){
             return (<div key={i}></div>)
           }

           return (
             <div key={i} className="col-span-1">
                   <FormControl fullWidth id="color-input">
           {/* กล่อง input + ปุ่ม ต่อกันแนบสนิท */}
           <Box sx={{ display: "flex", width: "100%" }}>
           <Button
            
             onClick={()=>{
              setOpenModal(`iconColumn-${i}`)
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
           sx={{...SX_CENTER_FIELD ,"& .MuiOutlinedInput-notchedOutline legend": {},}}
           size="small"
           variant="outlined"
           />

           <Button
           variant="contained"
           name="BTN_POPPER"
         
           onClick={()=>{
            setOpenModal(`colorColumn-${i}`)
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
           <Box
      sx={{
        width: 20,
        height: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    ><Palette className="size-5 text-white" strokeWidth={2}/></Box>
           </Button>
           </Box>
           </FormControl>
           <OptionModal open={openModal?.split("-")[0] === "colorColumn" && openModal?.split("-")[1] === i.toString()} onClose={() => setOpenModal("null-0")} header="ตั้งค่าสีคอมลัม">
           <div className="pt-[5px] mb-[5px] pb-[2px] px-[8px] grid grid-cols-[repeat(1,1fr)_auto] gap-2 flex items-center">
            <div className="col-span-2">
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-white whitespace-nowrap flex-shrink-0">ความโปร่งใส</span>
              <div className="w-full">
              <Range value={opacity} handleChange={(opacity) =>{
              const event = {target:{name:"opacity",value:opacity}}
              handleChange2("columns",Number.parseInt(openModal?.split("-")[1]),event)
            }} min={0} max={255} step={1}/>
              </div>
              </div>
             
            </div>
            <div className="col-span-2">  <ColorInput width="33px" theme={mainTheme} colors={allColors} elementColor={color} handleChange={(color) =>{
                 const event = {target:{name:"color",value:color}}
                 handleChange2("columns",Number.parseInt(openModal?.split("-")[1]),event)
              }}/></div>
           </div>
            
            
            </OptionModal>
           <OptionModal open={openModal?.split("-")[0] === "iconColumn"  && openModal?.split("-")[1] === i.toString()} onClose={() => setOpenModal("null-0")} header="ตั้งค่าไอคอนคอมลัม">
           <div className="mt-[-10px] mb-[-5px]">
           <IconInput icon={icon} handleChange={(icon) =>{
                 const event = {target:{name:"icon",value:icon}}
                 handleChange2("columns",Number.parseInt(openModal?.split("-")[1]),event)
              }}/>
           </div>
          
            </OptionModal>
             </div>
           )
         }
         
         
        )}
        
       </div>
   </div>
    )}
    {!newPost?.isColumn && (<div className="col-span-12 "><MainLabel label={""}/></div>)}
    {/* ปุ่มกด */}
    <div className="col-span-12 ">
        <MainLabel label={"ปุ่มกด"}/>
        {newPost?.isButton && (
           <div className="grid grid-cols-12 flex items-center justify-center">
           {buttonAmount.map((amount,i)=>(
             <div key={i} className="col-span-1 text-black dark:text-white ">
             <FormControlLabel
               
               control={
                 <Radio
                 name="buttonAmount"
                 value={amount}
                 onChange={handleChangeForNumber}
                 checked={newPost?.buttonAmount == amount}
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
    {!newPost?.isButton && (<div className="col-span-12 "><MainLabel label={""}/></div>)}
    {/* แก้ไขปุ่ม */}
    {newPost?.isButton && newPost?.buttons.map((btn,i)=>{

      const {icon,text,textColor,buttonColor,link,textSize,opacity,bold} = btn
      

      if(i+1 > newPost?.buttonAmount){
        return (<div key={i}></div>)
      }

      return (
        <div className="col-span-12 mt-3" key={i}>
            <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1">
                <Box sx={{ display: "flex", width: "100%" }}>
                <Button
                name="BTN_POPPER"
                
                 onClick={()=>{
                  setOpenModal(`iconButton-${i}`)
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
          sx={SX_CENTER_FIELD}
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
        
          onClick={()=>{
            setOpenModal(`buttonSetting-${i}`)
           
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
          
          <Box
      sx={{
        width: 20,
        height: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    ><Settings className="size-5 text-white" strokeWidth={2}/></Box>
        </Button>

              </Box>
              <OptionModal open={openModal.split("-")[0] === "buttonSetting" && openModal.split("-")[1] === i.toString()} onClose={() => setOpenModal("null-0")} header="ตั้งค่าปุ่ม" >
              <div className="pt-[5px] pb-[2px] mb-[2px] px-[8px] grid grid-cols-[repeat(1,1fr)_auto] gap-2 flex items-center">
                  <div className="col-span-1">
                    <Box sx={{ display: "flex", width: "100%" }}>
                    <TextField 
                    sx={{...COMMON_FIELD_SX ,"& .MuiOutlinedInput-root": { height: 35,borderTopRightRadius:0,borderBottomRightRadius:0,width:100,color:"whitesmoke" },"& .MuiInputLabel-root": { fontSize: 12.5,color:"#aaaaaa"},
        "& .MuiInputLabel-root.Mui-focused": { fontSize: 12.5,color:"whitesmoke"},
        "& .MuiInputLabel-root.Mui-error": { color: "whitesmoke !important" },
"& .MuiInputLabel-root.Mui-disabled": { color: "whitesmoke !important" },
        // 🔑 ตัดเส้นขอบด้านขวาออกทุกสถานะ
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "#5e636d !important",
          borderRightWidth: 0,
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
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
      
      onClick={()=>{
        const newBold = !bold
        const buttons = lodash.cloneDeep(newPost?.buttons)
        buttons[i].bold = newBold
        setNewPost({...newPost,buttons})
      }}
      sx={{
        backgroundColor:"#454b58",color:"white",
        height: 35,
        minWidth: 40,                // ปรับได้ตามข้อความ
        px: 1.5,                     // ระยะซ้ายขวาในกล่อง
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,

        
        border: "1px solid",  
        borderColor: "#5e636d",     
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
       {bold ? <Bold strokeWidth={3} size={18} /> : <Type strokeWidth={3} size={18} />}
    </Button>
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

          onClick={()=>{
            openColor("textColor")
          }}
        >
           <Box
      sx={{
        width: 20,
        height: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    ><Palette className="size-5 text-white" strokeWidth={2}/></Box>
        </Button>
                  </Box>
                 
                  
                  
               </div>
            
               <div className="col-span-1">
               <Box sx={{ display: "flex", width: "100%" }}> 
            <TextField
        InputProps={{ readOnly: true }}
        value={setBgColor(buttonColor)}
        variant="outlined"
        label="สีปุ่ม"
        sx={{...COMMON_FIELD_SX ,"& .MuiOutlinedInput-root": { height: 35,borderTopRightRadius:0,borderBottomRightRadius:0,color:"#5e636d" ,width:120},"& .MuiInputLabel-root": { fontSize: 12.5,color:"#aaaaaa"},
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
          onClick={()=>{
            openColor("buttonColor")
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
         <Box
      sx={{
        width: 20,
        height: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    ><Palette className="size-5 text-white" strokeWidth={2}/></Box>
      </Button>
      
            </Box>
            
               </div>

               {colorType  && (
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] text-white whitespace-nowrap flex-shrink-0">ความโปร่งใส</span>
                    <div className="w-full">
                    <Range value={opacity} handleChange={(opacity) =>{
                  const event = {target:{name:"opacity",value:opacity}}
                  handleChange2("buttons",Number.parseInt(openModal?.split("-")[1]),event)
                }} min={0} max={255} step={1}/>
                    </div>
                  </div>
                 
                </div>
                
               )}

               {colorType && (
                <div className="col-span-2">
                  <ColorInput theme={mainTheme} colors={allColors} elementColor={colorType === "textColor"?textColor:buttonColor} handleChange={(color) =>{
                      const event = {target:{name:colorType,value:color}}
                      handleChange2("buttons",Number.parseInt(openModal?.split("-")[1]),event)
                   }}/>
                </div>
                     
               )}

              </div>
              </OptionModal>
              <OptionModal open={openModal.split("-")[0] === "iconButton" && openModal.split("-")[1] === i.toString()} onClose={() => setOpenModal("null-0")} header="ตั้งค่าไอคอนปุ่ม" >
              <div className="mt-[-10px] mb-[-5px]">
              <IconInput icon={icon} handleChange={(icon) =>{
                 const event = {target:{name:"icon",value:icon}}
                 handleChange2("buttons",Number.parseInt(openModal?.split("-")[1]),event)
              }}/>
              </div>
              
              </OptionModal> 
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
            borderTopRightRadius: 5,
            borderBottomRightRadius: 5,
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

              </Box>


     
                </div>
                <div className="col-span-1">
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
      control={<Radio sx={{ color: "black", "&.Mui-checked": { color: "black" } }} />}
      label="หน้าเดิม"    // _self = เปิดหน้าเดิม
      sx={{"& .MuiFormControlLabel-label": { fontSize: 13,color:"black" } }}
    />
    <FormControlLabel
      value="_blank"
      control={<Radio sx={{ color: "black", "&.Mui-checked": { color: "black" } }} />}
      label="แท็บใหม่"    // _blank = เปิดแท็บใหม่
      sx={{"& .MuiFormControlLabel-label": { fontSize: 13,color:"black" } }}
    />
  </RadioGroup>
</Box>
</FormControl>
               </div>
            
                  
              </div>
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

      {newPost?.imageDecoration && (<>
      
        
    {/* ประเภท */}
    <div className="col-span-12 mt-3">
      <MainLabel label={"ประเภท"}/>
      <div className="grid grid-cols-12">
    {decorationTypes.map((type,i)=>(
      <FormControlLabel key={i} control={<Radio 

        name="decorationType"
        value={type}
        onChange={handleChange}
        checked={newPost?.decorationType === type}
        
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
      value={setBgColor(newPost?.color)}
      variant="outlined"
      label="สีแถบ"
      sx={{...SX_FIRST_FIELD,"& .MuiOutlinedInput-root": {
        height: 47,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
        color:"rgba(0,0,0,0.23)"
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
        name="BTN_POPPER"

        onClick={(e)=>{
          setOpenModal("colorDecoration")
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
        backgroundColor:setBgColor(newPost?.color),
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
      <Box
      sx={{
        width: 20,
        height: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    ><Palette className="size-5 text-white" strokeWidth={2}/></Box>
       
    </Button>
    
          </Box>
          <OptionModal open={openModal === "colorDecoration" } onClose={() => setOpenModal("null-0")} header="ตั้งค่าสีแถบ" >
              <div className="pt-[5px] mb-[5px] pb-[2px] px-[8px] grid grid-cols-[repeat(1,1fr)_auto] gap-2 flex items-center">
        

          
                <div className="col-span-2">
                <div className="flex items-center gap-2">
                    <span className="text-[12px] text-white whitespace-nowrap flex-shrink-0">ความโปร่งใส</span>
                    <div className="w-full">
                    <Range value={newPost?.opacity} handleChange={(opacity) =>{
                  const event = {target:{name:"opacity",value:opacity}}
                  handleChangeForNumber(event)
                }} min={0} max={255} step={1}/>
                    </div>
                  </div>
                  
                </div>
                
              

         
                <div className="col-span-2">
                  <ColorInput width="33px" theme={mainTheme} colors={allColors} elementColor={newPost?.color} handleChange={(color) =>{
                      const event = {target:{name:"color",value:color}}
                      handleChange(event)
                   }}/>
                </div>
                     
      

              </div>
              </OptionModal>

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
        value={newPost?.text}
        variant="outlined"
        label="ข้อความ"
        sx={SX_FIRST_FIELD}
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
   
          onClick={()=>{
           setOpenModal("text")
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
          
          <Box
      sx={{
        width: 20,
        height: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    ><Settings className="size-5 text-white" strokeWidth={2}/></Box>
        </Button>
      </Box>
      </FormControl>
  
    <OptionModal open={openModal === "text"} onClose={() => setOpenModal("null-0")} header="ตั้งค่าข้อความ" >
    <div className="pt-[5px] mb-[2px] pb-[2px] px-[8px] grid grid-cols-1 gap-2 flex items-center">
                  <div className="col-span-1">


                    <Box sx={{ display: "flex", width: "100%" }} >
            <TextField
        fullWidth
        name="size"
        onChange={handleChangeForNumber}
        value={newPost?.size}
        variant="outlined"
        label="ขนาดตัวอักษร"
        sx={{...SX_FIRST_FIELD,"& .MuiOutlinedInput-root": {
          height: 35, borderTopRightRadius: 0,      // ← ตัดโค้งที่ตัว root
          borderBottomRightRadius: 0,color:"whitesmoke",width:100,
          overflow:"hidden"
        },
        "& .MuiOutlinedInput-input": { fontSize: 13},
        "& .MuiInputLabel-root": { fontSize: 12.5,color:"#aaaaaa"},
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
      
      onClick={()=>setNewPost(prev=>{
        return {...prev,bold:!prev.bold}
      })}
      sx={{
        backgroundColor:"#454b58",color:"white",
        height: 35,
        minWidth: 40,                // ปรับได้ตามข้อความ
        px: 1.5,                     // ระยะซ้ายขวาในกล่อง
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,

        
        border: "1px solid",
        // borderColor: "rgba(0,0,0,0.23) !important",     
        borderColor: "#5e636d",     
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
      {newPost?.bold ? <Bold strokeWidth={3} size={18} /> : <Type strokeWidth={3} size={18} />}
    </Button>
      <Button
      name="BTN_POPPER"

      onClick={(e)=>{
        //Yayaya

        openColor("textColor")
      }}
      sx={{
        backgroundColor:setBgColor(newPost?.textColor),
        height: 35,
        minWidth: 40,                // ปรับได้ตามข้อความ
        px: 1.5,                     // ระยะซ้ายขวาในกล่อง
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,

        
        border: "1px solid",
        // borderColor: "rgba(0,0,0,0.23) !important",     
        borderColor: "#5e636d",     
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
       <Box
      sx={{
        width: 20,
        height: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    ><Palette className="size-5 text-white" strokeWidth={2}/></Box>
    </Button>
    {textAlign.map(({key,Icon})=>{

      if((newPost?.decorationType === "ริบบิ้น" || newPost?.decorationType === "วงกลม") && key === "center"){

        return
      }


      let check
      if((newPost?.decorationType === "ริบบิ้น" || newPost?.decorationType === "วงกลม") && key === "end" && newPost?.position === "center"){
        check = (newPost?.decorationType === "ริบบิ้น" || newPost?.decorationType === "วงกลม") && key === "end" && newPost?.position === "center"
      }else{
        check = newPost?.position === key
      }


return (

<Button key={key} sx={{backgroundColor:check?"#454b58":"white", height: 35,
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
}} value={key} name="position" onClick={handleChange}><Icon className={`size-5 text-${check?"white":"black"} pointer-events-none`} strokeWidth={2}/></Button>


)
    })}
            </Box>
            
            
            
            </div>
            {colorType && (
              <div className="col-span-1">
                <ColorInput theme={mainTheme} colors={allColors} elementColor={newPost?.textColor} handleChange={(color) =>{
                  const event = {target:{name:"textColor",value:color}}
                  handleChange(event)
                }}/>
              </div>
            )}

           
                 
              </div>
    </OptionModal>
    </div>

      
      </>)}


    
  </div>
      </div>
    </div>
    <ImageModal openModal={openModal === "image-upload"} setOpenModal={setOpenModal} handleChange={(image)=>{
      const event = {target:{name:"image",value:image}}
      handleChange(event)
    }} isPost={true}/>
  </main>
);
 

};
  
  
  
  export default UpdatePost;
  