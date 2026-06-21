import React, { useEffect, memo, useState, useRef,useCallback } from "react";
import {
  Home,
  SwatchBook,
  FileText,
  Bell,
  Users,
  Settings,
  Gift,
  BarChart3,
  Layers,
  Database,
  Grid3X3,
  MapPin,
  ChevronRight,
  Menu,
  LogOut,
  Copy,
  CircleX,
  ChevronDown,
  Plus,
  Download,
  SlidersHorizontal,
  RefreshCw,
  Sun,
  Moon,
  Container,
  Bluetooth,
  LayoutGrid,
  UserStar
} from "lucide-react";
import Nestable from "react-nestable";
import "react-nestable/dist/styles/index.css";
import IconLucide from "../IconLucide";
import TextField from "@mui/material/TextField";
import { styled } from "@mui/material/styles";
import {
  Switch,
  OutlinedInput,
  Checkbox,
  InputAdornment,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  ImageList,
  ImageListItemBar,
  ImageListItem,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  ButtonGroup,
  Badge,
  Stack,
  Icon,
  Accordion,
  AccordionActions,
  AccordionSummary,
  AccordionDetails,
  RadioGroup,
  FormControlLabel,
  Radio,
  ListItemText,
  ListItemButton,
  ListItem,
  ListItemIcon,
  Divider,
  Drawer,
  Collapse,
  List,
  BottomNavigation,
  BottomNavigationAction,
} from "@mui/material";
import {
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/16/solid";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import { SketchPicker } from "react-color";
import lodash, { head, isNull, set, update } from "lodash";
import { getTheme, updateTheme } from "../../Functions/theme";
import HeroSlider from "./heroSlider";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import IconAwsome from "./IconAwsome";
import ServiceIcon from "./ServiceIcon";
import { listPages } from "../../Functions/pages";









const AntSwitch = styled(Switch)(({ theme }) => ({
  width: 28,
  height: 16,
  padding: 0,
  marginRight: 10,
  display: "flex",
  "&:active": {
    "& .MuiSwitch-thumb": {
      width: 15,
    },
    "& .MuiSwitch-switchBase.Mui-checked": {
      transform: "translateX(9px)",
    },
  },
  "& .MuiSwitch-switchBase": {
    padding: 2,
    "&.Mui-checked": {
      transform: "translateX(12px)",

      color: "#fff",
      "& + .MuiSwitch-track": {
        opacity: 1,
        backgroundColor: "black",
      },
    },
  },
  "& .MuiSwitch-thumb": {
    boxShadow: "0 2px 4px 0 rgb(0 35 11 / 20%)",
    width: 12,
    height: 12,
    borderRadius: 6,
    transition: theme.transitions.create(["width"], {
      duration: 200,
    }),
  },
  "& .MuiSwitch-track": {
    borderRadius: 16 / 2,
    opacity: 1,
    backgroundColor: "rgba(0,0,0,.25)",
    boxSizing: "border-box",
    ".dark &": { backgroundColor: "rgba(255,255,255,.25)" },
  },
}));


const COMMON_FIELD_SX =  (hasChildren,hasBtn,darkMode,height=40,fontSize=13)=>{

  const radiusRight = hasChildren ? 0 : 5;
  const broderRight = hasChildren ? 0 : 1;
  const radiusLeft = hasBtn ? 0 : 5;
  const broderLeft = hasBtn ? 0 : 1;



  const mb = 0.5*height/40

  const borderColor = darkMode === "dark"?"#494d54":"rgba(0,0,0,0.23)"
  const textColor = darkMode === "dark"?"#ffffff":"#18181b"
  


  const inputStyle =  {
    borderColor,height,color:textColor, borderWidth: "1px", borderTopRightRadius: radiusRight, borderBottomRightRadius: radiusRight,borderRightWidth: broderRight, borderTopLeftRadius: radiusLeft, borderBottomLeftRadius: radiusLeft,borderLeftWidth: broderLeft
  }


  return{
  
    "& .MuiInputLabel-root": { fontSize: 14, color:"#aaaaaa"},
    "& .MuiInputLabel-root.Mui-focused, \
       & .MuiInputLabel-root.Mui-error, \
       & .MuiInputLabel-root.Mui-disabled": {
      color: "#aaaaaa",
    },
    "& .MuiFormLabel-asterisk": { color: "#aaaaaa" },
    "& .MuiOutlinedInput-root": {
      height,
      boxSizing: "border-box",
      padding: 0,
      alignItems: "center",
    },
    "& .MuiOutlinedInput-input": {
      fontSize,
      color:textColor,
      height: "100%",
      boxSizing: "border-box",
      marginBottom: mb,
    },
    "& .MuiSelect-select": { fontSize: 12,mb:2.5,pl:2,},
  
    "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline, \
    & .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline, \
    & .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline, \
    & .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline":inputStyle,
   
 
 
  };
}






function RadioInput({ label,name, value,datas,handleChange, color,textColor,gap=7,labelMr=1.1}) {
  return (
    <Box sx={{display:"flex"}}>
      <Typography sx={{fontSize:12,marginTop:1.5,marginRight:labelMr,color:textColor}}>{label}</Typography>
       <RadioGroup
    row
    sx={{ gap }}
    name={name}
    value={value}
    onChange={handleChange}
  >
      {datas.map(({ label:l, value:v }) => (
              <div key={v}>

<FormControlLabel
      value={v}
      control={
        <Radio
          sx={(t) => {
            return {
              // ยังไม่ติ๊ก = สีตามโหมด
              color: color,
              "&.Mui-checked": { color: color }, // ติ๊กแล้ว = สีเดียวกัน
              "&:hover": { backgroundColor: "transparent" },
              "&.Mui-checked:hover": { backgroundColor: "transparent" },
            };
          }}
        />
      }
      label={l}
      sx={{ "& .MuiFormControlLabel-label": { fontSize: 12, color: textColor } }}
    />
              </div>
            ))}
  </RadioGroup>
    </Box>
   
   
  );
}

function CheckInput({ label, field, index, display, heroData, setHero, miniField = null }) {


  const checked = miniField ? heroData[field][miniField] : heroData[field];


  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={checked}
          sx={{
            "&.Mui-checked": {
              color: "black", // สีตอน 'ถูกติ๊ก'
            },
          }}
        />
      }
      label={label}
      onChange={(e) => {
        setHero((prev) => {
          const hero = lodash.cloneDeep(prev);
          if (miniField) {
            hero[display][index][field][miniField] = e.target.checked;
          } else {
            hero[display][index][field] = e.target.checked;
          }

          return hero;
        });
      }}
      sx={{
        "& .MuiFormControlLabel-label": {
          fontSize: 13, // ปรับฟอนต์ของตัวหนังสือ
          whiteSpace: "nowrap",
        },
      }}
    />
  );
}


function Btn({
  handleClick,
  radius="normal",
  Icon=null,
  text="",
  lastChild=false,
  height=35,
  bgColor="#454b58",
  borderColor="#A1A1AA",
  color="white",


  
}) {

  const radiusRArr = {
    normal:5,
    noL:5,
    noR:0,
    noAll:0,
  }
  const radiusLArr = {
    normal:5,
    noR:5,
    noL:0,
    noAll:0,
  }


  const borderRight = lastChild ? 1 : 0;

  const size = 15*height/35



  return (

      <Button
      onClick={()=>{
        handleClick()
      }}
        variant="contained"
        sx={{
          boxShadow: "none", // 1) เอาเงาออก
          outline: "none", // เอา outline/focus ring ออก
          boxSizing: "border-box", // ให้ background อยู่ภายใน border
          overflow: "hidden", // ป้องกัน background เลยออกจาก border
          aspectRatio: "1 / 1",
          height,
          minHeight:height,
          width:height,
          minWidth:height,
          borderTopLeftRadius: radiusLArr[radius], 
          borderBottomLeftRadius:radiusLArr[radius],
          borderTopRightRadius:
          radiusRArr[radius],
          borderBottomRightRadius:
          radiusRArr[radius],
          // 2) ให้ปุ่มมี "กรอบ" แบบเดียวกับ TextField
          border: "1px solid",
          borderColor,
          borderRightWidth:  borderRight,
          borderLeftWidth:1,

          // (ตัวเลือก) ถ้าไม่อยากให้มีเส้นหนาตรงรอยต่อกลาง
          // ให้ตัดเส้นซ้ายของปุ่มออก จะเหลือเส้นของ TextField ฝั่งเดียวพอดี
          // borderLeftWidth: 0,

          // สีพื้นหลังของปุ่ม = สีที่เลือก
          bgcolor:bgColor,
          "&:hover": {
            bgcolor:bgColor,
            borderColor,
            boxShadow: "none", // กันธีมเพิ่มเงาตอนโฮเวอร์
            outline: "none",
          },
          "&:focus": {
            outline: "none",
          },
          "&:focus-visible": {
            outline: "none",
          },

          // สีตัวอักษร - ให้สืบทอดจาก parent; คุณจะเปลี่ยนเป็นขาว/ดำเองก็ได้
          color: "inherit",

          ".dark &": {
            borderColor: "#494d55", // สีกรอบใน dark (เทาเข้มที่คุณใช้กับ TextField)
            "&:hover": { borderColor: "#494d55" },
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

          >

{Icon &&   <IconAwsome
                style={{color,fontSize:size}}
                iconType={Icon.type}
                iconName={Icon.name}
              />}

            
          </Box>
          <Box
            sx={{
              width: 20,
              height: 20,
              color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
          {text}

            
          </Box>
       
        
      </Button>

   
  );
}

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

function Field({label,name,value,handleChange,darkMode,children}) {



  return (
    <FormControl fullWidth>
      <Box sx={{ display: "flex", width: "100%" }}>
        <TextField
          sx={COMMON_FIELD_SX(Boolean(children),false,darkMode)}
          fullWidth
          placeholder={label}
          name={name}
          value={value}
          onChange={handleChange}
          type={name === "URL"?"url":"text"}
        />
        {children && (
          <Box sx={{display: "flex", alignItems: "center" }}>
            {children}
          </Box>
        )}
      </Box>
    </FormControl>
  );
}

function FieldWithBtn({label,name,value,handleChange,handleClick,darkMode,Icon=null,children}) {


  return (
    <FormControl fullWidth>
      <Box sx={{ display: "flex", width: "100%" , alignItems: "stretch" }}>
        <Btn radius="noR" Icon={Icon} bgColor={darkMode === "dark"?"#494d54":"#A1A1AA"} handleClick={handleClick}/>
        <TextField
          sx={COMMON_FIELD_SX(Boolean(children),true,darkMode)}
          onChange={handleChange}
          fullWidth
          placeholder={label}
          name={name}
          value={value}
        
        />
        {children && (
            <Box sx={{ display: "flex", alignItems: "stretch" }}>
            {children}
          </Box>
        )}
      </Box>
    </FormControl>
  );
}

function SelectInput({ label, name, value, datas, handleChange ,darkMode}) {
  const textColor = darkMode === "dark"?"#ffffff":"#050505"
  const borderColor = darkMode === "dark"?"#494d55":"#cbd5e1"
  const bgcolor = darkMode === "dark" ? "#27272a" : "#ffffff"

  const selectStyle = {
    "& .MuiSvgIcon-root": { color: textColor },
  
    "& .MuiSelect-select": {
      height: 35,
    minHeight: 35,
      display: "flex",
      alignItems: "center",
      lineHeight: "35px",   
      py: 0,
      bgcolor,fontSize: 12,color:textColor
    },
  
    // ✅ รวมทุกสถานะของ notchedOutline ให้เหมือนกัน
    "& .MuiOutlinedInput-notchedOutline, \
     & .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline, \
     & .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline, \
     & .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline": {
      borderWidth: 1,
      borderColor,
    },
  }

  return (
    <FormControl
    fullWidth
    sx={selectStyle}
  >
    <Select
      name={name}
      value={value}
      displayEmpty
      onChange={handleChange}
      input={<OutlinedInput notched={false} />} // ✅ ปิด notch ให้ขอบไม่แหว่ง
      renderValue={(selected) => {
        if (selected === '' || selected == null) {
        return <Box sx={{ color: darkMode === "dark"?"#9e9e9e":"#9e9e9e" }}>{label}</Box>;
        }
        return selected;
      }}
      MenuProps={{
        PaperProps: {
          elevation: 0,
          sx: {
            boxShadow: "none",
            borderRadius:1,
            border:1,
            color:textColor,
            borderColor,
            "& .MuiList-root": { py: 0 ,bgcolor},
            "& .MuiMenuItem-root": {
              height: darkMode === "dark"?35:35,
              py: 0.25,
              px: 1.0,
              fontSize: 13,
              gap: 0.5,
              borderBottom:1,
              borderBottomColor:borderColor,
              ":last-child":{
                borderBottom:0,
              }
            },
          },
        },
        MenuListProps: { dense: true },
      }}
    >
      {datas.map((data,i) => (
        <MenuItem value={data} key={i} sx={{"& .MuiListItemText-primary": { fontSize: 12 }, }}>
          <ListItemText primary={data} />
        </MenuItem>
      ))}
    </Select>
  </FormControl>
  );
}

const types = [ {label:"หน้า",value:"page"}, {label:"URL",value:"URL"}, ]
const targets = [ {label:"หน้าเดิม",value:"_self"}, {label:"หน้าใหม่",value:"_blank"}, ]


const MenuList = memo(function MenuList({
  pages,
  item,
  remove,
  copy,
  handleChange,
  isOpen,
  toggleOpen,
  collapseIcon,
  isDraggable,
  darkMode,
  darkTextColor,setOpenIconModal,openIconModal
}) {
  const { id,icon, name, type, page,menuDisplay, url, target } = item;



  const [pageNames,setPageNames] = useState([])

  useEffect(()=>{
    const pageNameList = []
    pages.map(({pageName})=>{
      pageNameList.push(pageName)
    })
    setPageNames(pageNameList)
  },[pages])


  console.log(pageNames);





  const bgMenu = darkMode === "dark"?"#27272a":"#fafafa"
  const bgMenuOption = darkMode === "dark"?"#27272a":"#f8f8f8"
  const borderColor = darkMode === "dark"?"#494d54":"#e5e5e5"
  const textColor = darkMode === "dark"?"#ffffff":"#202020"

  const menuButtons = [
    { Icon: {type:"far",name:"faCopy"}, funct: copy },
    { Icon: {type:"far",name:"faCircleXmark"}, funct: remove },
  ];

  const MenuButton = ({ Icon, funct }) => (
    <Btn
      handleClick={() => {
        funct(id);
      }}
      Icon={Icon}
      lastChild={true}
      height={28}
      bgColor={darkMode === "dark"?"#494D54":"#ececec"}
      borderColor={darkMode === "dark"?"#494D54":"#e5e5e5"}
      color={darkMode === "dark"?"#ffffff":"#505050"}
     
    />
  );

  return (
    <Box sx={{ my: 1, cursor: isDraggable ? "pointer" : "grab" }}>
          <Accordion
      expanded={isOpen}
      onChange={() => {}}
      sx={{
        boxShadow: "none",
        m: 0,
        borderWidth: 1,
        borderColor,
        borderRadius: 1,
        backgroundColor: bgMenu,
        "&:not(.Mui-expanded):before": { display: "none" },
      }}
    >
      <AccordionSummary
        expandIcon={null}   // ✅ ปิด expandIcon ของ MUI ไปเลย
        component="div"  
        sx={{
          cursor: (isDraggable ? "grab" : "pointer") + " !important",
          height: 45,
          minHeight: 35,
          backgroundColor: bgMenu,
          border: 0,
          borderRadius:1,
          px: 1,
          "&.Mui-expanded": { minHeight: 45 },
          "& .MuiAccordionSummary-content": {
            m: 0,
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            width: "100%",
            gap: 1,
          },
          "& .MuiAccordionSummary-content.Mui-expanded": { m: 0 },
        }}
      >
          <span style={{ display: "inline-flex" }}>{collapseIcon}</span>
          <IconAwsome iconType={icon.type} iconName={icon.name} style={{
            fontSize:15,
            marginLeft:12,
            color:textColor
          }}/>

        <Typography
          noWrap
          sx={{
            ml: 2,
            fontSize: 14,
            flex: 1,
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            color:textColor,
            
          }}
        >
          {name || "Home"}
        </Typography>

        {/* ✅ ปุ่มลูกศร (กดตรงนี้เท่านั้นถึง toggle) */}
        

        {/* ✅ ปุ่ม copy/delete (ไม่เกี่ยวกับ toggle) */}
        <Box
          sx={{
            ml: 1,
            mr: 1.5,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            flexShrink: 0,
          }}
        >
          {menuButtons.map((b, i) => (
            <MenuButton key={i} Icon={b.Icon} funct={b.funct} />
          ))}
        </Box>
        <Box
          onMouseDown={(e) => e.stopPropagation()} // กัน drag เริ่มจากปุ่มนี้
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleOpen(id);
          }}
          sx={{
            width: 34,
            height: 34,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 1,
            cursor: "pointer",
            flexShrink: 0,

            "&:hover": { backgroundColor: darkMode === "dark"?"#494D54":"#efefef" },
          }}
        >
          <ChevronDown
            size={16}
            style={{
              color: darkMode === "dark"?"#ffffff":"#202020",
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 150ms ease",
            }}
          />
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ backgroundColor: bgMenuOption,borderRadius:1,borderTopLeftRadius:0,borderTopRightRadius:0 }}>
      <FieldWithBtn
          label="Home"
          Icon={icon}
          name="name"
          value={name}
          handleChange={(e) => handleChange(e, id)}
          darkMode={darkMode}
          handleClick={()=>setOpenIconModal(id)}
        />
        
        <RadioInput
        color={darkMode === "dark"?darkTextColor:"black"}
        textColor={darkMode === "dark"?"white":"black"}
          label="ประเภท"
          value={type}
          name="type"
          datas={types}
          handleChange={(e) => handleChange(e, id)}
        />
        {type === "page" && (
          <SelectInput
          darkMode={darkMode}
            datas={pageNames}
            name="page"
            handleChange={(e) => handleChange(e, id)}
            label="เลือกหน้าที่ต้องการ"
            value={page}
          />
        )}
        {type === "URL" && (
          <Field label="#" name="url" value={url} handleChange={(e) => handleChange(e, id)}  darkMode={darkMode}/>
        )}
        <RadioInput
        color={darkMode === "dark"?darkTextColor:"black"}
          label="รูปแบบ"
          textColor={darkMode === "dark"?"white":"black"}
          value={target}
          name="target"
          datas={targets}
          gap={4.5}
          labelMr={1.4}
          handleChange={(e) => handleChange(e, id)}
        />
      </AccordionDetails>
    </Accordion>

      <ServiceIcon darkColor={darkTextColor} header="ตั้งค่าไอคอน" icon={icon} open={openIconModal === id} onClose={()=>setOpenIconModal(false)} handleChange={(icon)=>handleChange({target:{name:"icon",value:icon}},id)} darkMode={darkMode}/>

    
    </Box>
  
  );
});



function MenuPage({menus, setMenus,navOpen,device,menuBar,theme,setNavOpen,navBottom,setFont,darkMode,darkTextColor,menuButtonRef}){




const handleChange = useCallback((e, id) => {
  const { name, value } = e.target;
  setMenus((prev) => {
    const idx = prev.findIndex((d) => d.id === id);
    const next = lodash.cloneDeep(prev);
    if (idx === -1) {
      const findMenu = (children)=>{
        children.map(c=>{
          const isTrue = c.id === id
          if(isTrue){
            c[name] = value
          }else{
            if(c.children.length > 0 ) findMenu(c.children)
          }
        })
      }
      findMenu(next)
    }else{
      next[idx][name] = value;
    }
    return next;
  });
}, []);




const cloneMenu = useCallback((id) => {

  setMenus((prev) => {
    let next = lodash.cloneDeep(prev);
    const clone = (menu,i)=>{
      let newMenu = lodash.cloneDeep(menu[i]);
      newMenu.id = Math.round(Math.random() * 1e9);
      if(newMenu.children.length > 0){
        setNewID(newMenu.children)
      }
      menu.splice(i+1, 0, newMenu);
    }
    const findMenu = (children)=>{
      children.map((c,i)=>{
        const isTrue = c.id === id
        if(isTrue){
          clone(children,i)
        }else{
          if(c.children.length > 0 ) findMenu(c.children)
        }
         
       })
     }
     const setNewID = (children)=>{
      children.map(c=>{
         c.id = Math.round(Math.random() * 1e9);
         if(c.children.length > 0 ) setNewID(c.children)
       })
     }
    const idx = prev.findIndex((d) => d.id === id);
    if (idx === -1) {
      findMenu(next)
    }else{
      clone(next,idx)
      
    }
    return next;
 
  });
}, []);

const deleteMenu = useCallback((id) => {
  setMenus((prev) => {
    const next = lodash.cloneDeep(prev);
    const findMenu = (children)=>{
      children.map((c,i)=>{
        const isTrue = c.id === id
        if(isTrue){
          children.splice(i,1)
        }else{
          if(c.children.length > 0 ) findMenu(c.children)
        }
         
       })
     }
    const idx = prev.findIndex((d) => d.id === id);
    if (idx === -1){
      findMenu(next)
    }else{
      if (prev.length === 1) return prev;
      next.splice(idx, 1);
      
    }
    return next;
    
  });
}, []);


const [openMenu,setOpenMenu] = useState({})
const [openIconModal,setOpenIconModal] = useState(null)


const closeAll = (id=null)=>{
  setOpenMenu(prev=>{
    const next = {...prev}
    for(let nid in next){
      if(nid != id){
        next[nid] = false
      }
    }
    return next
  })
}


const toggleOpen = useCallback((id) => {
  closeAll(id)
  setOpenMenu((prev) => ({ ...prev, [id]: !prev[id] }));
}, []);


const [pages,setPages] = useState([])


   const loadPages = ()=>{
    listPages()
    .then(res=>{setPages(res.data)})
    .catch(err => console.log(err))
   }

   useEffect(()=>{
    loadPages()
   },[])


const renderMenu = useCallback(
  (args) => (
    <MenuList
      {...args}
      pages={pages}
      isOpen={!!openMenu[args.item.id]}
      toggleOpen={toggleOpen}
      remove={deleteMenu}
      copy={cloneMenu}
      handleChange={handleChange}
      isDraggable={args.isDraggable}
      darkMode={darkMode}
      darkTextColor={darkTextColor}
      setOpenIconModal={setOpenIconModal}
      openIconModal={openIconModal}
    />
  ),
  [openMenu, toggleOpen, deleteMenu, cloneMenu, handleChange,darkMode,openIconModal,pages]
);

const disableDrag = useCallback(
  ({ item }) => !openMenu[item.id],
  [openMenu]
);


const{
  // Main
  menuFontSize,
  menuFontWeight,

  menuColor,
  menuColorOpacity,
  activeMenuColor,
  activeMenuColorOpacity,

  isMenuBarGradient,
  bgMenuBarColor,
  bgMenuBarColorGradient,
  bgMenuBarOpacity,
  bgMenuBarOpacityGradient,
  bgMenuBarDegree,

  bgButtonColor,
  borderButtonColor,
  iconButtonColor,
  bgButtonOpacity,
  borderButtonOpacity,
  iconButtonOpacity,

  bgMenuColor,
  bgMenuOpacity,

  display,
  barHeight,

  logo,
  logoHeight,

  menuHeight,
  dividerStyle,
  dividerColor,
  dividerOpacity,

  // Sub
  subMenuFontSize,
  subMenuFontWeight,

  subMenuColor,
  subMenuColorOpacity,
  activeSubMenuColor,
  activeSubMenuColorOpacity,

} = menuBar;


const {  
  navBottoms,
  isAbleNavBottom,
  navBottomDisplay,


  bgNav,
  bgNavOpacity,
  navHeight,
  navSpace,

  iconSize,
  iconColor,
  iconOpacity,

  labelSize,
  labelColor,
  labelOpacity,

  navDivider,
  navDividerColor,
  navDividerOpacity,
  navDividerStyle,} = navBottom



const opacity_2_hex = (opcy) => {
  if (Number.isNaN(opcy)) return "";
  const hex = opcy.toString(16).toUpperCase().padStart(2, 0);
  return hex;
};

const setColor = (
  color,
  opacity = null,
  isGradient = false,
  degree = null
) => {
  if (isGradient) {
    let gradientColor;
    let color1;
    let color2;
    if (typeof color[0] === "string") {
      color1 = color[0]+ opacity_2_hex(opacity[0])
      
    } else {
      color1 =
        theme[color[0].type][color[0].index] + opacity_2_hex(opacity[0]);
    }

    if (typeof color[1] === "string") {
      color2 = color[1]+ opacity_2_hex(opacity[1])
    } else {
      color2 =
        theme[color[1].type][color[1].index] + opacity_2_hex(opacity[1]);
    }

    gradientColor = `linear-gradient(${degree}deg, ${color1} 0%, ${color2} 100%)`;

    return gradientColor;
  } else {
    if (typeof color === "string") {
      return color + opacity_2_hex(opacity);
    }
    return theme[color.type][color.index] + opacity_2_hex(opacity);
  }
};


const [opening,setOpeing] = useState({})

const setDefault = (items=menus)=>{

  items.map(m=>{
    const {id,children} = m
      setOpeing({...opening,[id]:false})
      if(children.length){
        setDefault(children)
      }
    
  })
}


useEffect(()=>{

  setDefault()

},[])




const collectDescendantIds = (items, acc = []) => {
  for (const m of items) {
    acc.push(m.id);
    if (m.children?.length) collectDescendantIds(m.children, acc);
  }
  return acc;
};



const closeSubTree = (menus) => {
  const ids = collectDescendantIds(menus);
  setOpeing((prev) => {
    const next = { ...prev };
    for (const id of ids) next[id] = false;
    return next;
  });
};



useEffect(()=>{
  if(!navOpen){
    closeSubTree(menus)
  }
},[navOpen])


const mainBG = setColor(
  bgMenuColor,
  bgMenuOpacity)


const paddingDivider = (10*navHeight)/56




const displayHeight = device === "Mobile" ? 600 : 800
const displayWidth = device === "Mobile" ? 375 : 768

const SubMenu = ({menus})=>{

  return (
    <List sx={{background:mainBG,p:0}}>
            {menus.map((m,i)=>{
            const {name,id,icon,children} = m


            const hasChildren = children.length > 0
              const isOpen = opening[id]

            const borderB = {
              borderBottomStyle:dividerStyle,
              borderBottomColor:setColor(dividerColor,dividerOpacity),
              borderBottomWidth:1
            }

            const menuStyle = {
                
              fontWeight:subMenuFontWeight,
              fontSize:subMenuFontSize,
              color:setColor(subMenuColor,subMenuColorOpacity)

            }


            return(<React.Fragment key={id}>
                   <ListItem disablePadding sx={{justifyContent:"space-between",height:menuHeight,...borderB}}>
              <ListItemButton sx={{ justifyContent: "space-between",height:menuHeight }}  onClick={()=>{
                  if(children.length === 0) return
                  if (opening[id]) {
                    closeSubTree(children); 
                  }
                  setOpeing(prev => ({ ...prev, [id]: !prev[id] }));
                }} >
              <ListItemText
disableTypography
primary={
<span
style={menuStyle}
className="pl-[10px]"
>
<IconAwsome iconName={icon.name} iconType={icon.type} style={{marginRight:5}}/>
{name}
</span>
}
/>
{hasChildren&& (
  <ChevronDown
  className="ml-20"
  style={{
    fontWeight:subMenuFontWeight,

      transform: "rotate(0deg)", // ให้ชี้ไปทางขวา (optional)
      transition: "transform 150ms ease",

  }}
  size={subMenuFontSize}
/>
)}

               </ListItemButton>
        </ListItem>
        {hasChildren && (
              <Collapse in={isOpen} timeout="auto" unmountOnExit>
                <SubMenu menus={children}/>
              </Collapse>
            )}
            </React.Fragment>
         
            )
          })}
    </List>

  )
}




const phoneRef = useRef(null);
const drawerPaperRef = useRef(null);

const closeDrawer = () => {
  const active = document.activeElement;

  // blur เฉพาะกรณี focus อยู่ใน Drawer จริง ๆ
  if (
    active instanceof HTMLElement &&
    drawerPaperRef.current?.contains(active)
  ) {
    active.blur();
  }

  // ย้าย focus กลับไปที่ปุ่มเปิดก่อน/พร้อมปิด
  menuButtonRef.current?.focus?.();
  setNavOpen(false);
};

useEffect(() => {
  if (!navOpen) {
    requestAnimationFrame(() => {
      menuButtonRef.current?.focus?.();
    });
  }
}, [navOpen]);




    return( <main className="content-area flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden" area="main">

<div className="min-h-[600px] rounded-xl border border-white/10 bg-white/5">
<div className="container mx-auto relative z-10">
{device === "Desktop" && (



<div className="menuTree">
<Nestable
            items={menus}
            renderItem={renderMenu}
            onChange={({ items: newItems }) => setMenus(newItems)}
            maxDepth={4}
            threshold={30}
            disableDrag={disableDrag}
          />
</div>




)}
{['Mobile',"Tablet"].includes(device) && (

<div className="w-full flex justify-center">
  <div ref={phoneRef} className="bg-gray-500/10 relative overflow-hidden" style={{height:displayHeight,width:displayWidth}}>
    
  <Drawer
  open={navOpen}
  onClose={closeDrawer}
  variant="temporary"
  sx={{
    position: "absolute",
    inset: 0,
    "& .MuiDrawer-paper": {
      position: "absolute",
      top: 0,
      left: 0,
      height: "100%",
      maxHeight: "100%",
      overflowY: "auto",
      background: mainBG,
      width: 250,
      paddingBottom: "56px",
      boxSizing: "border-box",
    },
  }}
  PaperProps={{
    ref: drawerPaperRef,
    sx: {
      background: mainBG,
      boxShadow: "none",
      border: "none",
    },
  }}
  ModalProps={{
    container: () => phoneRef.current,
    disablePortal:true,
    keepMounted: true,
    onTransitionExited: () => {
      menuButtonRef.current?.focus?.();
    },
    BackdropProps: {
      sx: {
        position: "absolute",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.35)",
      },
    },
  }}
>

  <Box sx={{ width: 250}} role="presentation">
    <List>
    {menus.map((m,i)=>{
          const {name,icon,id,children} = m


          const hasChildren = children.length > 0
          const isOpen = opening[id]

          const borderB = {
            borderBottomStyle:dividerStyle,
            borderBottomColor:setColor(dividerColor,dividerOpacity),
            borderBottomWidth:(i+1 === menus.length && !opening[id])?0:1
          }

          const menuStyle = {
            
            fontWeight:menuFontWeight,
            fontSize:menuFontSize,
            color:setColor(menuColor,menuColorOpacity)

          }
          
          return(
            <React.Fragment key={id}>
               <ListItem disablePadding sx={{justifyContent:"space-between",height:menuHeight,...borderB}}>
                <ListItemButton sx={{ justifyContent: "space-between",height:menuHeight }}  onClick={()=>{
                 if(children.length === 0) return
                 if (opening[id]) {
                   closeSubTree(children); 
                 }
                 setOpeing(prev => ({ ...prev, [id]: !prev[id] }));
               }} >
                <ListItemText
disableTypography
primary={
<span
  style={menuStyle}
>
  <IconAwsome iconName={icon.name} iconType={icon.type} style={{marginRight:5}}/>
  {name}
</span>
}
/>
{hasChildren && (
<ChevronDown
className="ml-20"
style={{
fontWeight:menuFontWeight,

  transform: "rotate(0deg)", // ให้ชี้ไปทางขวา (optional)
  transition: "transform 150ms ease",

}}
size={menuFontSize}
/>
)}

                 </ListItemButton>
          </ListItem>

    {hasChildren && (
      <Collapse in={isOpen} timeout="auto" unmountOnExit>
        {/* ✅ ต่อท้ายด้านล่างของเมนูที่คลิก */}
        <SubMenu menus={children}/>
      </Collapse>
    )}
            </React.Fragment>
           
          )
        })}
    </List>
  
</Box>
</Drawer>
<BottomNavigation

  showLabels
  sx={{
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: navHeight,
    zIndex: 9999999999,
    bgcolor: setColor(bgNav, bgNavOpacity),

    "& .MuiBottomNavigationAction-root": {
      flex: "0 0 auto",
      minWidth: 70,
      maxWidth: 70,
      px: navSpace / 2,
      position: "relative", // ✅ ต้องมีเพื่อให้ ::after อ้างอิงได้
    },

    // ✅ เส้นคั่นแบบสั้นลง (ปรับ top/bottom ได้)
    "& .MuiBottomNavigationAction-root:not(:last-of-type)::after": {
      content: '""',
      position: "absolute",
      right: 0,
      top: paddingDivider,      // 👈 ระยะห่างจากด้านบน
      bottom: paddingDivider,   // 👈 ระยะห่างจากด้านล่าง
      borderRightWidth: navDivider ? 1 : 0,
      borderRightStyle: navDividerStyle,
      borderRightColor: setColor(navDividerColor, navDividerOpacity),
      pointerEvents: "none",
    },
  }}
>
{navBottoms.map((nav, i) => {
  const { icon, label, link } = nav;

  return (
    <BottomNavigationAction
      label={label}
      key={i}
      sx={{
        "& .MuiBottomNavigationAction-label": {
          color: setColor(labelColor, labelOpacity),
          marginTop: 0.5,
          fontSize: labelSize,
        },
      }}
      icon={
        <IconAwsome
          iconType={icon.type}
          iconName={icon.name}
          style={{
            color: setColor(iconColor, iconOpacity),
            fontSize:iconSize
          }}
        />
      }
    />
  );
})}


</BottomNavigation>
  </div>

</div>
 


)}

</div>

{/* {(navOpen && ['Mobile',"Tablet"].includes(device)) && (
      <aside
      className={`

     sm:block 0 overflow-hidden  border-r border-slate-200 dark:border-white/10 w-[300px]`} style={{background:setColor(isMenuGradient?bgMenuColorGradient:bgMenuColor,isMenuGradient?bgMenuOpacityGradient:bgMenuOpacity,isMenuGradient,bgMenuDegree)}}
    >
      <nav className=" pb-6  overflow-y-auto h-[calc(100%-64px)] w-[300px]">
        <ul>
         <li>
            {menus.map((m,i)=>{
              const {name,id,children} = m


              const b = ()=>{
                if(i+1 === menus.length ) return "border-0"
                return "border-b"
              }
              
              return(
                <div key={id}className={`${b()}`} style={{borderBottomStyle:dividerStyle,borderBottomColor:setColor(dividerColor,dividerOpacity)}}>
                  <div onClick={()=>{
                    if(children.length === 0) return
                    if (opening[id]) {
                      closeSubTree(children); // ปิดลูกหลานทั้งหมด
                    }
                    setOpeing(prev => ({ ...prev, [id]: !prev[id] }));
                  }} className={`flex items-center justify-between `} style={{borderBottomStyle:dividerStyle,borderBottomColor:setColor(dividerColor,dividerOpacity),color:setColor(menuColor,menuColorOpacity),fontSize:menuFontSize,fontWeight:menuFontWeight,height:menuSpace}}>
                  <span className="ml-5">{name}</span>
                    {children.length > 0 && (
                        <ChevronDown
                        className="mr-5"
                        style={{
                          fontWeight:menuFontWeight,
                        
                            transform: "rotate(0deg)", // ให้ชี้ไปทางขวา (optional)
                            transition: "transform 150ms ease",
                       
                        }}
                        size={menuFontSize}
                      />
                    )}
                      
                 
                </div>
                {(children.length > 0 && opening[id]) && (
                        <SubMenu menus={children}/>
                    )}
                </div>
             
              )
            })}
         </li>
        </ul>
      </nav>
    </aside>
)} */}



</div>
<style>{`

/* รองรับได้ทั้ง 2 pattern ของ class (บางเวอร์ชันใช้ nestable-* บางเวอร์ชันใช้ dd-*) */
.menuTree .nestable-list,
.menuTree .dd-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

/* ===== เส้นแนวตั้งของ nested level ===== */
.menuTree .nestable-list .nestable-list,
.menuTree .dd-list .dd-list {
  position: relative;

  /* ระยะย่อหน้า (ปรับได้ตามชอบ) */
  margin-left: -5px;
  padding-left: 30px;
}

/* เส้นแนวตั้ง */
.menuTree .nestable-list .nestable-list::before,
.menuTree .dd-list .dd-list::before {
  content: "";
  position: absolute;

  /* ตำแหน่งเส้นใน gutter (ปรับให้ตรงกับ UI ได้) */
  left: 6px;
  top: 0;
  bottom: 0;

  width: 2px;
  background: #e5e5e5;
  border-radius: 1px;
}
.menuTree .dd-handle,
.menuTree .nestable-item-name,
.menuTree .nestable-item-handler {
  cursor: inherit !important;
}

/* (ถ้าอยากให้เส้นจางลงใน dark mode ก็เพิ่มได้)
.dark .menuTree .nestable-list .nestable-list::before,
.dark .menuTree .dd-list .dd-list::before {
  background: rgba(255,255,255,0.18);
}
*/
 `}</style>
 

    </main>
    
    
    )
}

export default MenuPage
