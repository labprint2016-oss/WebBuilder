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
  UserStar,
  Trash2,
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

const hasVisibleIcon = (icon) =>
  Boolean(icon?.name && icon?.type && icon.name !== "fa0");


const COMMON_FIELD_SX = (
  hasChildren,
  hasBtn,
  darkMode,
  height = 40,
  fontSize = 13,
  useInputBottomOffset = true
) => {

  const radiusRight = hasChildren ? 0 : 5;
  const broderRight = hasChildren ? 0 : 1;
  const radiusLeft = hasBtn ? 0 : 5;
  const broderLeft = hasBtn ? 0 : 1;



  const mb = 0.5*height/40

  const borderColor = darkMode === "dark" ? "#494d54" : "#e2e8f0"
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
      overflow: "hidden",
      boxShadow: "none",
      "&.Mui-focused": {
        boxShadow: "none",
      },
    },
    "& .MuiOutlinedInput-input": {
      fontSize,
      color:textColor,
      height: "100%",
      boxSizing: "border-box",
      marginBottom: useInputBottomOffset ? mb : 0,
      WebkitTextFillColor: textColor,
      caretColor: textColor,
      "&:-webkit-autofill": {
        WebkitBoxShadow: "0 0 0 1000px transparent inset !important",
        boxShadow: "0 0 0 1000px transparent inset !important",
        backgroundColor: "transparent !important",
        WebkitTextFillColor: `${textColor} !important`,
        caretColor: textColor,
        transition: "background-color 9999s ease-out 0s",
      },
      "&:-webkit-autofill:hover": {
        WebkitBoxShadow: "0 0 0 1000px transparent inset !important",
        boxShadow: "0 0 0 1000px transparent inset !important",
        backgroundColor: "transparent !important",
        WebkitTextFillColor: `${textColor} !important`,
      },
      "&:-webkit-autofill:focus": {
        WebkitBoxShadow: "0 0 0 1000px transparent inset !important",
        boxShadow: "0 0 0 1000px transparent inset !important",
        backgroundColor: "transparent !important",
        WebkitTextFillColor: `${textColor} !important`,
      },
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
  hideBorder = false,


  
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
          borderColor: hideBorder ? "transparent" : borderColor,
          borderRightWidth: hideBorder ? 0 : borderRight,
          borderLeftWidth: hideBorder ? 0 : 1,

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

          ".dark &": hideBorder ? {} : {
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

{hasVisibleIcon(Icon) &&   <IconAwsome
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

function Field({label,name,value,handleChange,darkMode,children,fieldHeight=40}) {



  return (
    <FormControl fullWidth>
      <Box sx={{ display: "flex", width: "100%" }}>
        <TextField
          sx={COMMON_FIELD_SX(Boolean(children),false,darkMode,fieldHeight)}
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

function FieldWithBtn({
  label,
  name,
  value,
  handleChange,
  handleClick,
  darkMode,
  Icon = null,
  children,
  fieldHeight = 40,
}) {
  const iconBoxHeight = Math.max(35, fieldHeight - 4);
  const baseFieldSx = COMMON_FIELD_SX(Boolean(children), true, darkMode, fieldHeight, 13, false);


  return (
    <FormControl fullWidth>
      <Box sx={{ display: "flex", width: "100%" , alignItems: "stretch", minHeight: fieldHeight, gap: 0 }}>
        <Box sx={{ position: "relative", zIndex: 2 }}>
          <Btn
            radius="noR"
            lastChild={true}
            height={iconBoxHeight}
            Icon={Icon}
            bgColor={darkMode === "dark" ? "#494d54" : "#333333"}
            borderColor={darkMode === "dark" ? "#494d54" : "#e2e8f0"}
            handleClick={handleClick}
          />
        </Box>
        <TextField
          sx={{
            ...baseFieldSx,
            ml: "-2px",
            position: "relative",
            zIndex: 1,
            "& .MuiOutlinedInput-input": {
              ...(baseFieldSx["& .MuiOutlinedInput-input"] || {}),
              lineHeight: `${fieldHeight}px`,
              paddingTop: 0,
              paddingBottom: "2px",
              marginBottom: 0,
            },
          }}
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

function SelectInput({
  label,
  name,
  value,
  datas,
  handleChange,
  darkMode,
  selectHeight = 35,
  optionHeight = 35,
}) {
  const textColor = darkMode === "dark"?"#ffffff":"#050505"
  const borderColor = darkMode === "dark" ? "#494d54" : "#e2e8f0"
  const bgcolor = darkMode === "dark" ? "#27272a" : "#ffffff"

  const selectStyle = {
    "& .MuiSvgIcon-root": { color: textColor },
  
    "& .MuiSelect-select": {
      height: selectHeight,
    minHeight: selectHeight,
      display: "flex",
      alignItems: "center",
      lineHeight: `${selectHeight}px`,   
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
              height: optionHeight,
              minHeight: optionHeight,
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
      {datas.map((data,i) => {
        const isSelected = data === value;
        const isBeforeSelected = datas[i + 1] === value;
        return (
          <MenuItem
            value={data}
            key={i}
            sx={{
              minHeight: optionHeight,
              borderBottomWidth: isSelected || isBeforeSelected ? 0 : 1,
              borderBottomStyle: "solid",
              borderBottomColor: borderColor,
              "& .MuiListItemText-primary": { fontSize: 12 },
              "&.Mui-selected": {
                backgroundColor: "#333333",
                border: "none",
                outline: "none",
                boxShadow: "none",
                marginTop: "-1px",
                position: "relative",
                zIndex: 1,
                "& .MuiListItemText-primary": { color: "#ffffff" },
              },
              "&.Mui-selected:hover": {
                backgroundColor: "#333333",
                border: "none",
                outline: "none",
                boxShadow: "none",
              },
              "&:last-child": {
                borderBottomWidth: 0,
              },
            }}
          >
            <ListItemText primary={data} />
          </MenuItem>
        );
      })}
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
  darkTextColor,setOpenIconModal,openIconModal,
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
      hideBorder
      color={darkMode === "dark" ? "#a1a1aa" : "#9ca3af"}
     
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
          {hasVisibleIcon(icon) && (
            <IconAwsome iconType={icon.type} iconName={icon.name} style={{
              fontSize:15,
              marginLeft:12,
              color:textColor
            }}/>
          )}

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
            mr: 0,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            flexShrink: 0,
            transform: "translateX(8px)",
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

            "&:hover": { backgroundColor: "transparent" },
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
          fieldHeight={48}
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
            selectHeight={44}
            optionHeight={44}
            datas={pageNames}
            name="page"
            handleChange={(e) => handleChange(e, id)}
            label="เลือกหน้าที่ต้องการ"
            value={page}
          />
        )}
        {type === "URL" && (
          <Field label="#" name="url" value={url} handleChange={(e) => handleChange(e, id)}  darkMode={darkMode} fieldHeight={44}/>
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

      <ServiceIcon darkColor={darkTextColor} header="ไอคอน" icon={icon} open={openIconModal === id} onClose={()=>setOpenIconModal(false)} handleChange={(icon)=>handleChange({target:{name:"icon",value:icon}},id)} darkMode={darkMode}/>

    
    </Box>
  
  );
});



function MenuPage({menus, setMenus,navOpen,device,menuBar,theme,setNavOpen,navBottom,setFont,darkMode,darkTextColor,menuButtonRef,topBar,setOpenBar}){




const [previewNavOpen, setPreviewNavOpen] = useState(navOpen);

useEffect(() => {
  setPreviewNavOpen(navOpen);
}, [navOpen]);

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

const getTotalScrollFromElement = useCallback((element) => {
  let top = window.scrollY || window.pageYOffset || 0;
  let left = window.scrollX || window.pageXOffset || 0;
  let current = element?.parentElement ?? null;

  while (current) {
    top += current.scrollTop || 0;
    left += current.scrollLeft || 0;
    current = current.parentElement;
  }

  return { top, left };
}, []);

const applyDragScrollCompensation = useCallback(({ dragItem }) => {
  const root = document.documentElement;
  const dragEl = document.querySelector(`.menuTree .nestable-item-${dragItem?.id}`);

  if (!(dragEl instanceof HTMLElement)) {
    root.style.setProperty("--menu-drag-compensate-x", "0px");
    root.style.setProperty("--menu-drag-compensate-y", "0px");
    return;
  }

  const { top, left } = getTotalScrollFromElement(dragEl);
  root.style.setProperty("--menu-drag-compensate-x", `${left}px`);
  root.style.setProperty("--menu-drag-compensate-y", `${top}px`);
}, [getTotalScrollFromElement]);

const clearDragScrollCompensation = useCallback(() => {
  const root = document.documentElement;
  root.style.setProperty("--menu-drag-compensate-x", "0px");
  root.style.setProperty("--menu-drag-compensate-y", "0px");
}, []);


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
  borderWidth = 1,

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
  navText,
  navIcon,
  isAbleNavBottom,
  navBottomDesign = "classic",
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

const {
  hideTopBarEverywhere = false,
  tabletTopBarMode = "social",
  ableLeft = true,
  ableRight = true,
  topBarHeight = 52,
  isGradient: topBarIsGradient = false,
  bgColor: topBarBgColor = "#000000",
  bgOpacity: topBarBgOpacity = 255,
  bgColorGradient: topBarBgColorGradient = ["#000000", "#000000"],
  bgOpacityGradient: topBarBgOpacityGradient = [255, 255],
  bgDegree: topBarBgDegree = 0,
  borderSize = 26,
  radius = 50,
  iconGroup = [],
  radiusText = 50,
  borderTextSize = 26,
  textGroup = [],
} = topBar || {};



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
  if(!previewNavOpen){
    closeSubTree(menus)
  }
},[previewNavOpen])


const mainBG = setColor(
  bgMenuColor,
  bgMenuOpacity)
const navBottomBg = setColor(bgNav, bgNavOpacity)


const paddingDivider = (10*navHeight)/56
const isModernNavBottom = navBottomDesign === "modern";
const modernCenterIndex = Math.floor((navBottoms?.length || 1) / 2);
const modernActiveIndex = Math.min(1, Math.max((navBottoms?.length || 1) - 1, 0));
const isTextNavBottomDisplay = navBottomDisplay === "text";
const textModeIcon =
  navIcon &&
  typeof navIcon === "object" &&
  navIcon.name &&
  navIcon.type &&
  navIcon.name !== "fa0"
    ? navIcon
    : { type: "fas", name: "faCopyright" };
const textModeLabel = navText || "Domain.com All rights reserved.";
const navBottomItemsForDisplay = isTextNavBottomDisplay
  ? [{ icon: textModeIcon, label: textModeLabel, link: "Page1" }]
  : navBottoms;
const modernCenterIndexForDisplay = Math.floor((navBottomItemsForDisplay?.length || 1) / 2);
const modernActiveIndexForDisplay = Math.min(
  1,
  Math.max((navBottomItemsForDisplay?.length || 1) - 1, 0)
);
const allowModernCenterBubble = isModernNavBottom && !isTextNavBottomDisplay;
const showModernNotch = isModernNavBottom && !isTextNavBottomDisplay;
const navIconSelectedColor = setColor(iconColor, iconOpacity);
const modernBaseNavHeight = 56;
const modernExtraVerticalSpace = Math.max(navHeight - modernBaseNavHeight, 0) / 2;
const navItemWidthTighten = Math.max(0, 6 - Math.max(navSpace, 1));
const modernCenterSize = 56;
const modernNotchRadius = Math.floor(modernCenterSize / 2) + 5;
const modernNotchCenterY = 0;
const modernCenterTop =
  modernNotchCenterY - modernCenterSize / 2 - 8 - modernExtraVerticalSpace;
const navBottomDesignConfig =
  isModernNavBottom
    ? {
        actionMinWidth: 64,
        actionMaxWidth: 64,
        actionRadius: 18,
        actionMarginY: 8,
        actionBg: "transparent",
        showDivider: false,
      }
    : navBottomDesign === "standard"
      ? {
          actionMinWidth: 74,
          actionMaxWidth: 74,
          actionRadius: 8,
          actionMarginY: 3,
          actionBg: "transparent",
          showDivider: navDivider,
        }
      : {
          actionMinWidth: 70,
          actionMaxWidth: 70,
          actionRadius: 0,
          actionMarginY: 0,
          actionBg: "transparent",
          showDivider: navDivider,
        };
const navItemWidth = Math.max(navBottomDesignConfig.actionMinWidth - navItemWidthTighten, 52);
const navGap = Math.max(navSpace - 1, 0);




const displayHeight = device === "Mobile" ? 700 : 800
const displayWidth = device === "Mobile" ? 375 : 768
const drawerWidth = 250;
const isMobilePreview = device === "Mobile";
const isTabletPreview = device === "Tablet";
const mobileFrameBg = darkMode === "dark" ? "#3b4250" : "#000000";
const mobileNotchBg = darkMode === "dark" ? "#474f5f" : "#000000";
const mobileEarpieceBg = darkMode === "dark" ? "#8b94a5" : "#2f2f2f";
const tabletFrameBg = darkMode === "dark" ? mobileFrameBg : "#111111";
const mobileSkeletonSvg = `
<svg xmlns='http://www.w3.org/2000/svg' width='375' height='1320' viewBox='0 0 375 1320'>
  <rect width='375' height='1320' fill='#f5f5f6'/>

  <rect x='16' y='16' width='170' height='30' rx='15' fill='#d6d6d9'/>
  <rect x='196' y='16' width='80' height='30' rx='15' fill='#d8d8db'/>
  <rect x='286' y='16' width='73' height='30' rx='15' fill='#d6d6d9'/>

  <rect x='16' y='62' width='343' height='210' rx='5' fill='#d2d2d6'/>
  <rect x='16' y='288' width='220' height='16' rx='5' fill='#d5d5d8'/>
  <rect x='16' y='316' width='120' height='16' rx='5' fill='#d7d7da'/>
  <rect x='16' y='352' width='250' height='16' rx='5' fill='#d4d4d8'/>
  <rect x='274' y='352' width='85' height='16' rx='5' fill='#d6d6d9'/>
  <rect x='0' y='400' width='375' height='2' fill='#c9c9cd'/>

  <rect x='16' y='430' width='160' height='16' rx='5' fill='#d5d5d8'/>
  <rect x='186' y='430' width='90' height='16' rx='5' fill='#d7d7da'/>
  <rect x='286' y='430' width='73' height='16' rx='5' fill='#d5d5d8'/>
  <rect x='16' y='460' width='343' height='170' rx='5' fill='#d3d3d7'/>
  <rect x='16' y='646' width='120' height='16' rx='5' fill='#d5d5d8'/>
  <rect x='16' y='674' width='200' height='16' rx='5' fill='#d7d7da'/>
  <rect x='224' y='674' width='135' height='16' rx='5' fill='#d6d6d9'/>
  <rect x='0' y='714' width='375' height='2' fill='#c9c9cd'/>

  <rect x='16' y='744' width='343' height='120' rx='5' fill='#d2d2d6'/>
  <rect x='16' y='880' width='180' height='14' rx='5' fill='#d6d6d9'/>
  <rect x='16' y='906' width='95' height='14' rx='5' fill='#d8d8db'/>
  <rect x='16' y='932' width='250' height='14' rx='5' fill='#d6d6d9'/>
  <rect x='16' y='958' width='145' height='14' rx='5' fill='#d8d8db'/>
  <rect x='0' y='988' width='375' height='2' fill='#c9c9cd'/>

  <rect x='16' y='1020' width='105' height='16' rx='5' fill='#d5d5d8'/>
  <rect x='131' y='1020' width='120' height='16' rx='5' fill='#d7d7da'/>
  <rect x='261' y='1020' width='98' height='16' rx='5' fill='#d5d5d8'/>
  <rect x='16' y='1052' width='343' height='220' rx='5' fill='#d2d2d6'/>
</svg>
`.trim();
const tabletSkeletonSvg = `
<svg xmlns='http://www.w3.org/2000/svg' width='768' height='1320' viewBox='0 0 768 1320'>
  <rect width='768' height='1320' fill='#f5f5f6'/>

  <rect x='24' y='20' width='220' height='30' rx='15' fill='#d6d6d9'/>
  <rect x='254' y='20' width='120' height='30' rx='15' fill='#d8d8db'/>
  <rect x='384' y='20' width='120' height='30' rx='15' fill='#d6d6d9'/>

  <rect x='24' y='70' width='720' height='250' rx='5' fill='#d2d2d6'/>
  <rect x='24' y='338' width='420' height='16' rx='5' fill='#d5d5d8'/>
  <rect x='24' y='366' width='240' height='16' rx='5' fill='#d7d7da'/>
  <rect x='24' y='402' width='520' height='16' rx='5' fill='#d4d4d8'/>
  <rect x='560' y='392' width='184' height='36' rx='5' fill='#d6d6d9'/>
  <rect x='0' y='452' width='768' height='2' fill='#c9c9cd'/>

  <rect x='24' y='484' width='220' height='16' rx='5' fill='#d5d5d8'/>
  <rect x='254' y='484' width='140' height='16' rx='5' fill='#d7d7da'/>
  <rect x='404' y='484' width='140' height='16' rx='5' fill='#d5d5d8'/>
  <rect x='24' y='516' width='720' height='190' rx='5' fill='#d3d3d7'/>
  <rect x='24' y='724' width='200' height='16' rx='5' fill='#d5d5d8'/>
  <rect x='24' y='752' width='340' height='16' rx='5' fill='#d7d7da'/>
  <rect x='570' y='724' width='174' height='44' rx='5' fill='#d6d6d9'/>
  <rect x='0' y='792' width='768' height='2' fill='#c9c9cd'/>

  <rect x='24' y='824' width='720' height='150' rx='5' fill='#d2d2d6'/>
  <rect x='24' y='990' width='320' height='14' rx='5' fill='#d6d6d9'/>
  <rect x='24' y='1016' width='180' height='14' rx='5' fill='#d8d8db'/>
  <rect x='24' y='1042' width='430' height='14' rx='5' fill='#d6d6d9'/>
  <rect x='24' y='1068' width='240' height='14' rx='5' fill='#d8d8db'/>
  <rect x='0' y='1098' width='768' height='2' fill='#c9c9cd'/>

  <rect x='24' y='1130' width='160' height='16' rx='5' fill='#d5d5d8'/>
  <rect x='194' y='1130' width='190' height='16' rx='5' fill='#d7d7da'/>
  <rect x='394' y='1130' width='170' height='16' rx='5' fill='#d5d5d8'/>
  <rect x='24' y='1162' width='720' height='130' rx='5' fill='#d2d2d6'/>
</svg>
`.trim();
const previewScreenSkeletonStyle = isMobilePreview
  ? {
      backgroundColor: "#f5f5f6",
      backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(mobileSkeletonSvg)}")`,
      backgroundSize: "375px 1320px",
      backgroundPosition: "center top",
      backgroundRepeat: "repeat-y",
      borderRadius: 30,
    }
  : isTabletPreview
    ? {
        backgroundColor: "#f5f5f6",
        backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(tabletSkeletonSvg)}")`,
        backgroundSize: "768px 1320px",
        backgroundPosition: "center top",
        backgroundRepeat: "repeat-y",
        borderRadius: 24,
      }
  : {};
const showTopBarPreview =
  !hideTopBarEverywhere && (tabletTopBarMode || "social") !== "off";
const isTextTopBarPreviewMode = (tabletTopBarMode || "social") === "text";
const previewTopOffset = (showTopBarPreview ? topBarHeight : 0) + barHeight;
const previewBottomOffset =
  device === "Mobile" && isAbleNavBottom === true ? navHeight : 0;
const menuBarBg = setColor(
  isMenuBarGradient ? bgMenuBarColorGradient : bgMenuBarColor,
  isMenuBarGradient ? bgMenuBarOpacityGradient : bgMenuBarOpacity,
  isMenuBarGradient,
  isMenuBarGradient ? bgMenuBarDegree : null
);
const topBarBg = setColor(
  topBarIsGradient ? topBarBgColorGradient : topBarBgColor,
  topBarIsGradient ? topBarBgOpacityGradient : topBarBgOpacity,
  topBarIsGradient,
  topBarIsGradient ? topBarBgDegree : null
);

const SubMenu = ({menus})=>{

  return (
    <List
      sx={{ background: mainBG, p: 0, cursor: "pointer" }}
      onClickCapture={() => setOpenBar?.("Menu")}
    >
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
{hasVisibleIcon(icon) && (
  <IconAwsome iconName={icon.name} iconType={icon.type} style={{marginRight:5}}/>
)}
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
  setPreviewNavOpen(false);
  setNavOpen(false);
};

useEffect(() => {
  if (!previewNavOpen) {
    requestAnimationFrame(() => {
      menuButtonRef.current?.focus?.();
    });
  }
}, [previewNavOpen]);




    return( <main className="content-area flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden" area="main">

<div
  className="min-h-[600px] rounded-xl border border-white/10 bg-white/5"
  style={["Mobile", "Tablet"].includes(device) ? { borderTopWidth: 0 } : undefined}
>
<div className={`${["Mobile", "Tablet"].includes(device) ? "relative z-10 w-full" : "container mx-auto relative z-10"}`}>
{device === "Desktop" && (



<div className="menuTree">
<Nestable
            items={menus}
            renderItem={renderMenu}
            onChange={({ items: newItems }) => setMenus(newItems)}
            onDragStart={applyDragScrollCompensation}
            onDragEnd={clearDragScrollCompensation}
            maxDepth={4}
            threshold={30}
            disableDrag={disableDrag}
          />
</div>




)}
{['Mobile',"Tablet"].includes(device) && (

<div
  className="grid w-full place-items-center"
  style={{
    height: "calc(100vh - 220px)",
    minHeight: "calc(100vh - 220px)",
    paddingInline: isTabletPreview ? 16 : 0,
  }}
>
  <div
    className={
      isMobilePreview
        ? "relative flex-none rounded-[42px] p-[12px] shadow-[0_6px_14px_rgba(0,0,0,0.22)]"
        : isTabletPreview
          ? "relative mx-auto flex-none rounded-[32px] p-[10px] shadow-[0_8px_18px_rgba(0,0,0,0.2)]"
          : ""
    }
    style={
      isMobilePreview
        ? {
            width: displayWidth + 24,
            height: displayHeight + 24,
            backgroundColor: mobileFrameBg,
          }
        : isTabletPreview
          ? {
              width: displayWidth + 20,
              height: displayHeight + 20,
              backgroundColor: tabletFrameBg,
            }
          : undefined
    }
  >
  {isMobilePreview && (
    <>
      <div
        className="absolute left-1/2 -translate-x-1/2 rounded-b-[18px] z-[20]"
        style={{ top: 2, width: 156, height: 14, backgroundColor: mobileNotchBg }}
      />
      <div
        className="absolute left-1/2 -translate-x-1/2 rounded-full z-[21]"
        style={{ top: 6, width: 58, height: 4, backgroundColor: mobileEarpieceBg }}
      />
    </>
  )}
  <div
    ref={phoneRef}
    className={`relative overflow-hidden ${(isMobilePreview || isTabletPreview) ? "bg-white" : "bg-gray-500/10"} ${isMobilePreview ? "rounded-[30px]" : ""} ${isTabletPreview ? "rounded-[22px]" : ""}`}
    style={{
      height:displayHeight,
      width:displayWidth,
      ...previewScreenSkeletonStyle,
    }}
  >
    
  {showTopBarPreview && (
    <div
      className={`flex items-center px-3 ${
        device === "Mobile" && isTextTopBarPreviewMode
          ? "justify-start overflow-hidden"
          : "justify-center"
      }`}
      style={
        device === "Mobile" && isTextTopBarPreviewMode
          ? { height: topBarHeight, background: topBarBg, scrollbarWidth: "none", msOverflowStyle: "none" }
          : { height: topBarHeight, background: topBarBg }
      }
    >
      {isTextTopBarPreviewMode ? (
        <div
          className={`${device === "Mobile" ? "w-full overflow-x-auto [&::-webkit-scrollbar]:hidden" : ""}`}
          style={device === "Mobile" ? { scrollbarWidth: "none", msOverflowStyle: "none" } : undefined}
        >
        <div className={`flex items-center gap-3 ${device === "Mobile" ? "min-w-max" : ""}`}>
          {ableRight &&
            textGroup.map((item, i) => {
              const safeIcon =
                item?.icon?.name && item?.icon?.name !== "fa0"
                  ? item.icon
                  : { type: "fas", name: "faHouse" };
              return (
                <div key={i} className="flex shrink-0 items-center text-[10px]">
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: borderTextSize,
                      height: borderTextSize,
                      background: setColor(item.bgColor, item.bgOpacity),
                      borderRadius: `${radiusText}%`,
                    }}
                  >
                    <IconAwsome
                      iconType={safeIcon.type}
                      iconName={safeIcon.name}
                      style={{
                        color: setColor(item.iconColor, item.iconOpacity),
                        fontSize: item.iconSize,
                      }}
                    />
                  </div>
                  <span
                    className="ml-2 whitespace-nowrap"
                    style={{
                      color: setColor(item.textColor, item.textOpacity),
                      fontSize: item.textSize,
                    }}
                  >
                    {item.text}
                  </span>
                </div>
              );
            })}
        </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {ableLeft &&
            iconGroup.map((item, i) => {
              const safeIcon =
                item?.icon?.name && item?.icon?.name !== "fa0"
                  ? item.icon
                  : { type: "fas", name: "faHouse" };
              return (
                <div
                  key={i}
                  className="flex items-center justify-center"
                  style={{
                    width: borderSize,
                    height: borderSize,
                    background: setColor(item.bgColor, item.bgOpacity),
                    borderRadius: `${radius}%`,
                  }}
                >
                  <IconAwsome
                    iconType={safeIcon.type}
                    iconName={safeIcon.name}
                    style={{
                      color: setColor(item.iconColor, item.iconOpacity),
                      fontSize: item.iconSize,
                    }}
                  />
                </div>
              );
            })}
        </div>
      )}
    </div>
  )}

  <div
    style={{
      height: barHeight,
      background: menuBarBg,
    }}
    className="flex items-center justify-between px-4 cursor-pointer"
    onClick={() => setOpenBar?.("Menu")}
  >
    {display === "left" && (
      <button
        type="button"
        className="inline-flex p-[5px] rounded-lg border items-center justify-center"
        style={{
          backgroundColor: setColor(bgButtonColor, bgButtonOpacity),
          borderColor: setColor(borderButtonColor, borderButtonOpacity),
          color: setColor(iconButtonColor, iconButtonOpacity),
          borderWidth,
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setPreviewNavOpen((prev) => {
            const next = !prev;
            setNavOpen(next);
            return next;
          });
        }}
      >
        <Menu className="h-5 w-5" />
      </button>
    )}

    <div
      className={`flex-1 min-w-0 px-2 ${
        display === "left" ? "flex justify-end text-right" : ""
      }`}
    >
      {logo ? (
        <img
          src={logo}
          alt="logo"
          style={{ height: logoHeight }}
          className={`object-contain ${display === "left" ? "ml-auto" : ""}`}
        />
      ) : (
        <div className="font-bold text-[18px] text-[#374151] truncate">Logo App</div>
      )}
    </div>

    {display === "right" && (
      <button
        type="button"
        className="inline-flex p-[5px] rounded-lg border items-center justify-center"
        style={{
          backgroundColor: setColor(bgButtonColor, bgButtonOpacity),
          borderColor: setColor(borderButtonColor, borderButtonOpacity),
          color: setColor(iconButtonColor, iconButtonOpacity),
          borderWidth,
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setPreviewNavOpen((prev) => {
            const next = !prev;
            setNavOpen(next);
            return next;
          });
        }}
      >
        <Menu className="h-5 w-5" />
      </button>
    )}
  </div>

  <Drawer
  open={previewNavOpen}
  variant="persistent"
  sx={{
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    "& .MuiDrawer-paper": {
      position: "absolute",
      top: previewTopOffset,
      bottom: previewBottomOffset,
      left: 0,
      height: `calc(100% - ${previewTopOffset + previewBottomOffset}px)`,
      maxHeight: `calc(100% - ${previewTopOffset + previewBottomOffset}px)`,
      overflowY: "auto",
      overscrollBehavior: "contain",
      WebkitOverflowScrolling: "touch",
      background: mainBG,
      width: drawerWidth,
      paddingBottom: 0,
      boxSizing: "border-box",
      pointerEvents: "auto",
    },
  }}
  PaperProps={{
    ref: drawerPaperRef,
    onClickCapture: () => setOpenBar?.("Menu"),
    sx: {
      background: mainBG,
      boxShadow: "none",
      border: "none",
      cursor: "pointer",
    },
  }}
>

  <Box
    sx={{ width: drawerWidth, minHeight: "100%", cursor: "pointer", background: mainBG }}
    role="presentation"
    onClick={() => setOpenBar?.("Menu")}
  >
    <List onClickCapture={() => setOpenBar?.("Menu")}>
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
  {hasVisibleIcon(icon) && (
    <IconAwsome iconName={icon.name} iconType={icon.type} style={{marginRight:5}}/>
  )}
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
{device === "Mobile" && isAbleNavBottom === true && (
<BottomNavigation
  value={isModernNavBottom ? modernActiveIndexForDisplay : 0}
  onChange={() => {}}
  showLabels
  sx={{
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: navHeight,
    zIndex: 9999999999,
    bgcolor: showModernNotch ? "transparent" : navBottomBg,
    justifyContent: "center",
    borderRadius:
      navBottomDesign === "modern"
        ? "24px"
        : navBottomDesign === "standard"
          ? "24px"
          : 0,
    px: isModernNavBottom ? 1.2 : 0,
    gap: `${navGap}px`,
    overflow: "visible",
    "&::before": {
      content: showModernNotch ? '""' : "none",
      position: "absolute",
      inset: 0,
      borderRadius: "24px",
      background: navBottomBg,
      WebkitMaskImage: showModernNotch
        ? `radial-gradient(circle ${modernNotchRadius}px at 50% ${modernNotchCenterY}px, transparent ${modernNotchRadius - 1}px, #000 ${modernNotchRadius}px)`
        : "none",
      maskImage: showModernNotch
        ? `radial-gradient(circle ${modernNotchRadius}px at 50% ${modernNotchCenterY}px, transparent ${modernNotchRadius - 1}px, #000 ${modernNotchRadius}px)`
        : "none",
      WebkitMaskRepeat: "no-repeat",
      maskRepeat: "no-repeat",
      WebkitMaskSize: "100% 100%",
      maskSize: "100% 100%",
      boxShadow: showModernNotch ? "0 8px 22px rgba(15, 23, 42, 0.09)" : "none",
      zIndex: 0,
      pointerEvents: "none",
    },
    "& .MuiBottomNavigationAction-root": {
      flex: "0 0 auto",
      minWidth: navItemWidth,
      maxWidth: Math.max(navBottomDesignConfig.actionMaxWidth - navItemWidthTighten, 52),
      px: 0,
      position: "relative",
      zIndex: 1,
      borderRadius: navBottomDesignConfig.actionRadius,
      ...(isTextNavBottomDisplay
        ? {
            minWidth: "100%",
            maxWidth: "100%",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 1,
          }
        : {}),
      marginTop: `${navBottomDesignConfig.actionMarginY + modernExtraVerticalSpace}px`,
      marginBottom: `${navBottomDesignConfig.actionMarginY + modernExtraVerticalSpace}px`,
      backgroundColor: navBottomDesignConfig.actionBg,
      color: navIconSelectedColor,
      transition: "all 220ms ease",
      transform: !isModernNavBottom ? "translateY(2px)" : "none",
    },
    "& .MuiBottomNavigationAction-label": {
      fontSize: `${labelSize}px !important`,
      lineHeight: "1.1 !important",
      transform: showModernNotch ? "translateX(-50%) !important" : "none !important",
      opacity: "1 !important",
      marginTop: isTextNavBottomDisplay
        ? "0 !important"
        : isModernNavBottom
          ? "0 !important"
          : "6px !important",
      marginLeft: isTextNavBottomDisplay ? "0 !important" : undefined,
      ...(showModernNotch
        ? {
            position: "absolute",
            left: "50%",
            bottom: -4,
            width: "100%",
            textAlign: "center",
            pointerEvents: "none",
          }
        : {}),
    },
    "& .MuiBottomNavigationAction-root:not(:last-of-type)::after": {
      content: '""',
      position: "absolute",
      right: 0,
      top: paddingDivider,
      bottom: paddingDivider,
      borderRightWidth: navBottomDesignConfig.showDivider ? 1 : 0,
      borderRightStyle: navDividerStyle,
      borderRightColor: setColor(navDividerColor, navDividerOpacity),
      pointerEvents: "none",
    },
  }}
>
{navBottomItemsForDisplay.map((nav, i) => {
  const { icon, label, link } = nav;
  const isTextModeItem = isTextNavBottomDisplay;

  return (
    <BottomNavigationAction
      label={isTextModeItem ? "" : label}
      key={i}
      disableRipple
      disableTouchRipple
      sx={{
        pointerEvents: "none",
        ...(allowModernCenterBubble && i === modernCenterIndexForDisplay
          ? {
              overflow: "visible",
              "& .MuiSvgIcon-root, & i": { color: `${navIconSelectedColor} !important` },
            }
          : {}),
        ...(allowModernCenterBubble && i !== modernCenterIndexForDisplay
          ? {
              "&.Mui-selected": {
                color: navIconSelectedColor,
              },
              "&.Mui-selected::after": {
                content: '""',
                position: "absolute",
                bottom: 6,
                left: "50%",
                width: 12,
                height: 12,
                borderRadius: "9999px",
                transform: "translateX(-50%)",
                backgroundColor: i === 1 ? "transparent" : "#2f9666",
              },
            }
          : {}),
        "& .MuiBottomNavigationAction-label": {
          color: setColor(labelColor, labelOpacity),
          marginTop: isModernNavBottom ? 0 : 0.5,
          fontSize: `${labelSize}px`,
          lineHeight: 1.1,
          transform: isModernNavBottom ? "translateX(-50%)" : "none",
          opacity: 1,
          display: isTextModeItem ? "none" : undefined,
        },
      }}
      icon={
        isTextModeItem ? (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              width: "100%",
              color: setColor(labelColor, labelOpacity),
              fontSize: `${labelSize}px`,
              lineHeight: 1.1,
            }}
          >
            {hasVisibleIcon(icon) && (
              <IconAwsome
                iconType={icon.type}
                iconName={icon.name}
                style={{
                  color: navIconSelectedColor,
                  fontSize: iconSize,
                  flexShrink: 0,
                }}
              />
            )}
            <span>{label}</span>
          </div>
        ) :
        allowModernCenterBubble && i === modernCenterIndexForDisplay ? (
          <div
            style={{
              width: modernCenterSize,
              height: modernCenterSize,
              minWidth: modernCenterSize,
              minHeight: modernCenterSize,
              position: "absolute",
              top: modernCenterTop,
              left: "50%",
              borderRadius: "50%",
              backgroundColor: navBottomBg,
              display: "flex",
              flexShrink: 0,
              alignItems: "center",
              justifyContent: "center",
              aspectRatio: "1 / 1",
              transform: "translateX(-50%)",
              boxShadow: "none",
              zIndex: 2,
            }}
          >
            {hasVisibleIcon(icon) && (
              <IconAwsome
                iconType={icon.type}
                iconName={icon.name}
                style={{
                  color: navIconSelectedColor,
                  fontSize: iconSize * 1.5,
                }}
              />
            )}
          </div>
        ) : (
          hasVisibleIcon(icon) ? (
            <IconAwsome
              iconType={icon.type}
              iconName={icon.name}
              style={{
                color: navIconSelectedColor,
                fontSize: iconSize,
                transform:
                  isModernNavBottom && i !== modernCenterIndexForDisplay
                    ? "translateY(-9px)"
                    : !isModernNavBottom
                      ? "translateY(-2px)"
                      : "none",
              }}
            />
          ) : null
        )
      }
    />
  );
})}


</BottomNavigation>
)}
  </div>

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

/* สีพื้นหลังตอน Drag/Drop */
.menuTree .nestable-item-copy,
.menuTree .nestable-item-copy .nestable-item-name,
.menuTree .nestable-item-copy .dd-item > div {
  background: rgba(255, 255, 255, 0) !important;
  border-radius: 3px !important;
}

.menuTree .nestable-item-copy > * {
  border-radius: 3px !important;
}

.menuTree .nestable-item.is-dragging,
.menuTree .dd-item.is-dragging {
  background: #e3e3e3 !important;
  border: none !important;
  border-radius: 3px !important;
  box-shadow: none !important;
  outline: none !important;
  overflow: hidden !important;
}


.menuTree .nestable-item.is-dragging:before,
.menuTree .dd-item.is-dragging:before {
  content: none !important;
}

/* Global fallback: drag layer อาจอยู่นอก .menuTree */
.nestable-item.is-dragging,
.dd-item.is-dragging {
  background: #e3e3e3 !important;
  border: none !important;
  border-radius: 3px !important;
  box-shadow: none !important;
  outline: none !important;
  overflow: hidden !important;
}

/* กรอบแดงเฉพาะไอเทมที่ติดเม้าส์ (drag copy) */
.nestable-drag-layer .nestable-item-copy .MuiAccordion-root {
  border: 1px solid #e5e5e5 !important;
  border-width: 1px !important;
}

.nestable-drag-layer .nestable-item-copy .MuiAccordionSummary-root,
.nestable-drag-layer .nestable-item-copy .MuiAccordionDetails-root {
  border: none !important;
}

.nestable-item.is-dragging:before,
.dd-item.is-dragging:before {
  content: none !important;
  display: none !important;
}

.nestable-drag-layer,
.nestable-drag-layer .nestable-list {
  background: transparent !important;
}

.nestable-drag-layer {
  transform: translate3d(
    var(--menu-drag-compensate-x, 0px),
    var(--menu-drag-compensate-y, 0px),
    0
  ) !important;
}

.nestable-drag-layer .nestable-item-copy,
.nestable-drag-layer .nestable-item-copy > * {
  border-radius: 3px !important;
  background: rgba(255, 255, 255, 0) !important;
  box-shadow: none !important;
  outline: none !important;
  overflow: hidden !important;
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
