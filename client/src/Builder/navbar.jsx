import React, { useCallback, useEffect, useMemo, useState, useRef, use } from "react";
import {
  Home,
  SwatchBook,
  FileText,
  Bell,
  Settings,
  Gift,
  Layers,
  ChevronRight,
  Menu,
  LogOut,
  Copy,
  CircleX,
  ChevronDown,
  Plus,
  Download,
  SlidersHorizontal,
  SendHorizontal,
  PencilRuler,
  AppWindowMac,
  RefreshCw,
  Sun,
  Moon,
  Container,
  Bluetooth,
  LayoutGrid,
  Mail,
} from "lucide-react";
import IconLucide from "../IconLucide";
import { getFormResponses } from "../../Functions/forms";
import TextField from "@mui/material/TextField";
import { styled } from "@mui/material/styles";
import {
  Switch,
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
import lodash, { isNull, set, update } from "lodash";
import { getTheme, updateTheme } from "../../Functions/theme";
import { BrowserRouter, Route, Routes, Navigate, useLocation, useNavigate, matchPath, useParams } from "react-router-dom"

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

/** ไอคอนใน tile ลาก element ของ Builder — Material Symbols หรือ Lucide (`lucideIcon` = ชื่อ export เช่น AppWindowMac) */
function BuilderPaletteElementIcon({ item }) {
  const builderPanelIconColor = "var(--dash-nav-panel-icon, #333333)";
  if (item?.lucideIcon) {
    const iconSize = Number(item?.lucideSize);
    const strokeWidth = Number(item?.lucideStrokeWidth);
    return (
      <span className="inline-flex h-[30px] w-full items-center justify-center px-2 [&>svg]:shrink-0">
        <IconLucide
          iconName={item.lucideIcon}
          color={builderPanelIconColor}
          size={Number.isFinite(iconSize) ? iconSize : 30}
          strokeWidth={Number.isFinite(strokeWidth) ? strokeWidth : 1.75}
        />
      </span>
    );
  }
  return (
    <span
      className="material-symbols-outlined text-[30px] px-2"
      style={{ color: builderPanelIconColor }}
    >
      {item.icon}
    </span>
  );
}

const COMMON_FIELD_SX =  (hasChildren,hasBtn,height=40,fontSize=13)=>{

  const radiusRight = hasChildren ? 0 : 5;
  const broderRight = hasChildren ? 0 : 1;
  const radiusLeft = hasBtn ? 0 : 5;
  const broderLeft = hasBtn ? 0 : 1;



  const mb = 0.5*height/40


  const inputStyle =  {
    borderColor: "rgba(0,0,0,0.23)",height, borderWidth: "1px", borderTopRightRadius: radiusRight, borderBottomRightRadius: radiusRight,borderRightWidth: broderRight, borderTopLeftRadius: radiusLeft, borderBottomLeftRadius: radiusLeft,borderLeftWidth: broderLeft
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


function RadioInput({ label,name, value,datas,handleChange, color = "black" ,gap=7,labelMr=1.1}) {
  return (
    <Box sx={{display:"flex"}}>
      <Typography sx={{fontSize:12,marginTop:1.5,marginRight:labelMr}}>{label}</Typography>
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
      sx={{ "& .MuiFormControlLabel-label": { fontSize: 12, color: color } }}
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


  return (
    <>
      <Button
      onClick={handleClick}
        variant="contained"
        sx={{
          boxShadow: "none", // 1) เอาเงาออก
          outline: "none", // เอา outline/focus ring ออก
          boxSizing: "border-box", // ให้ background อยู่ภายใน border
          overflow: "hidden", // ป้องกัน background เลยออกจาก border
          px: 2.5,
          height,
          minHeight:height,
          width:height,
          borderTopLeftRadius: radiusLArr[radius], 
          borderBottomLeftRadius:radiusLArr[radius],
          borderTopRightRadius:
          radiusRArr[radius],
          borderBottomRightRadius:
          radiusRArr[radius],
          // 2) ให้ปุ่มมี "กรอบ" แบบเดียวกับ TextField
          border: "1px solid",
          borderColor:"#A1A1AA",
          minWidth: 52,
          borderRightWidth:  borderRight,
          borderLeftWidth:1,

          // (ตัวเลือก) ถ้าไม่อยากให้มีเส้นหนาตรงรอยต่อกลาง
          // ให้ตัดเส้นซ้ายของปุ่มออก จะเหลือเส้นของ TextField ฝั่งเดียวพอดี
          // borderLeftWidth: 0,

          // สีพื้นหลังของปุ่ม = สีที่เลือก
          bgcolor:  "#454b58",
          "&:hover": {
            bgcolor: "#454b58",
            borderColor:  "#A1A1AA",
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
            borderColor: "var(--dash-panel-input-border, #e2e8f0)", // สีกรอบใน dark (เทาเข้มที่คุณใช้กับ TextField)
            "&:hover": { borderColor: "var(--dash-panel-input-border, #e2e8f0)" },
            borderTopRightRadius: 5,
            borderBottomRightRadius: 5,
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
            {Icon &&   <Icon
                size={15} // บังคับขนาดไอคอนให้เท่ากัน
                strokeWidth={2.2} // ปรับความหนาเส้นให้รู้สึกเท่า ๆ กัน
                className="text-white"
                style={{
                  color: "white",
                }}
              />}

            
          </Box>
          <Box
            sx={{
              width: 20,
              height: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
          {text}

            
          </Box>
       
        
      </Button>

    </>
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
        style={{ ["--pos"]: `${(newValue / max) * 100}%`, ["--fill"]: `black` }}
      />
    </div>
  );
};

function Field({label,name,value,handleChange,children}) {



  return (
    <FormControl fullWidth>
      <Box sx={{ display: "flex", width: "100%" }}>
        <TextField
          sx={COMMON_FIELD_SX(Boolean(children),false)}
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

function FieldWithBtn({label,name,value,handleChange,Icon=null,children}) {


  return (
    <FormControl fullWidth>
      <Box sx={{ display: "flex", width: "100%" , alignItems: "stretch" }}>
        <Btn radius="noR" Icon={Icon}/>
        <TextField
          sx={COMMON_FIELD_SX(Boolean(children),true)}
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

function SelectInput({ label, name, value, datas, handleChange }) {
  return (
    <FormControl fullWidth variant="outlined" sx={COMMON_FIELD_SX(false, false)}>
      <Select
        name={name}
        value={value ?? ""}
        onChange={handleChange}
        displayEmpty
        renderValue={(selected) => {
          if (selected === "" || selected == null) {
            return <Box sx={{ color: "text.disabled" }}>{label}</Box>;
          }
          return selected;
        }}
        MenuProps={{
          PaperProps: {
            elevation: 0,
            sx: {
              boxShadow: "none",
              "& .MuiList-root": { py: 0 },
              "& .MuiMenuItem-root": {
                height: 38,
                py: 0.25,
                px: 1.0,
                fontSize: 13,
                gap: 0.5,
              },
            },
          },
          MenuListProps: { dense: true },
        }}
      >
        {datas.map((data, i) => (
          <MenuItem value={data} key={i}>
            <ListItemText primary={data} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}




function Navbar({ handleDragElement,prepareDragElement,isDark,updateNewTheme,navOpen,setNavOpen,selectedMenuId,setSelectedMenuId, railExpanded = false }) {
 const FORMS_MENU_BAR_ID = "69db17211be82fe7637ea096";
 const countUnreadMessages = (rows) =>
   (Array.isArray(rows) ? rows : []).filter(
     (row) => !(row?.read === true || row?.meta?.read === true)
   ).length;


 const navigate = useNavigate()
 const location = useLocation()
 const [unreadMessageCount, setUnreadMessageCount] = useState(0);

 const refreshUnreadMessageCount = useCallback(async () => {
   try {
     const res = await getFormResponses(FORMS_MENU_BAR_ID);
     const rows = Array.isArray(res?.data) ? res.data : [];
     setUnreadMessageCount(countUnreadMessages(rows));
   } catch {
     // keep previous count when fetch fails
   }
 }, []);

 useEffect(() => {
   refreshUnreadMessageCount();
   const intervalId = window.setInterval(refreshUnreadMessageCount, 30000);
   const onFocus = () => refreshUnreadMessageCount();
   const onMessagesChanged = () => refreshUnreadMessageCount();
   window.addEventListener("focus", onFocus);
   window.addEventListener("wb:messages-changed", onMessagesChanged);
   return () => {
     window.clearInterval(intervalId);
     window.removeEventListener("focus", onFocus);
     window.removeEventListener("wb:messages-changed", onMessagesChanged);
   };
 }, [refreshUnreadMessageCount]);

  const bgMenu = "#efefef"
  const bgMenuOption = "#f8f8f8"

  const defaultPost = {
    title: { text: "", size: 15, bold: false, padding: 8 },
    category: "-",
    image: null,
    height: 200,
    width: 400,
    borderRadius: 0,
    imageType: "รูปภาพ",
    link: { url: "", target: "_self" },
    description: { text: "", size: 13, padding: 0 },
    isColumn: false,
    columnAmount: 2,
    columns: [
      { icon: "Bluetooth", text: "", color: "#374151", opacity: 255 },
      { icon: "Bluetooth", text: "", color: "#374151", opacity: 255 },
      { icon: "Bluetooth", text: "", color: "#374151", opacity: 255 },
      { icon: "Bluetooth", text: "", color: "#374151", opacity: 255 },
    ],
    isButton: false,
    buttonAmount: 1,
    buttons: [
      { icon: "Bluetooth", text: "ปุ่มกด", textColor: "#FFFFFF", buttonColor: "#374151", link: { url: "", target: "_self" }, textSize: 13, opacity: 255, bold: false },
      { icon: "Bluetooth", text: "ปุ่มกด", textColor: "#FFFFFF", buttonColor: "#374151", link: { url: "", target: "_self" }, textSize: 13, opacity: 255, bold: false },
    ],
    imageDecoration: false,
    decorationType: "แถบ",
    color: "#374151",
    text: "เพิ่มข้อความที่นี่",
    size: 13,
    position: "center",
    textColor: "#FFFFFF",
    opacity: 255,
    bold: false,
  };


  const [currentPost,setCurrentPost] = useState(defaultPost)

  useEffect(()=>{
    setCurrentPost(defaultPost);
  },[])


  const getImg = (path)=>{
    if(typeof path === "string"){
      return `http://localhost:5000/${path}`
    }else if(typeof path !== "string"){
      return URL.createObjectURL(path)
    }
  }




  const [theme, setTheme] = useState({
    _id: null,
    textHeading: "",
    text: "",
    mainColor: [],
    textColor: [],
    otherColor: [],
  });

  const [updated, setUpdated] = useState(0);

  const loadTheme = () => {
    getTheme("68d37327bedb0efab7dacafb")
      .then((res) => {
        setTheme(res.data);
        setData({
          ...data,
          Theme: {
            ...data.Theme,
            mainColor: res.data.mainColor,
            textColor: res.data.textColor,
            otherColor: res.data.otherColor,
          },
        });
        setHeading(res.data.textHeading);
        setText(res.data.text);
      })
      .catch((err) => console.log(err));
  };

  const pickerStyles = {
    default: {
      cursor: "pointer",
      picker: {
        background: isDark === "dark" ? "white" : "#101827",
        borderRadius: "10px",
        boxShadow: "none",
        padding: "12px",
        width: "180px",
        height: "200px",
      },
      saturation: {
        borderRadius: "12px",
        overflow: "hidden",
      },
      controls: {
        marginTop: "12px",
        color: "#e5e5e5",
      },
      sliders: {
        padding: "0",
      },
      hue: {
        height: "12px",
        borderRadius: "999px",
      },
      alpha: {
        height: "12px",
        borderRadius: "999px",
      },
      color: {
        borderRadius: "8px",
        overflow: "hidden",
        display: "none",
      },

      activeColor: {
        borderRadius: "8px",
        overflow: "hidden",
        display: "none",
      },
      control: {
        marginBottom: "6px",
      },
      /* ช่อง input ของ react-color */
      input: {
        background: "#111111",
        borderColor: "#333333",
        boxShadow: "inset 0 0 0 1px #333333",
        color: "#e5e5e5",
        display: "none",
      },
      /* กล่อง swatches (ถ้ามีใช้) */
      swatches: {
        background: "#0b0b0b",
        borderTop: "1px solid #222222",
        display: "none",
      },
    },
  };

  const [data, setData] = useState({
    Navbar:[
      {  label: "Builder",path:"/builder", icon: Layers },
      {  label: "Theme",   icon: SwatchBook },
      {  label: "Pages" ,  icon: FileText },
      {  label: "Hero",path:"/builder/heros", icon: PencilRuler },
      {  label: "Menu",path:"/builder/menus", icon: AppWindowMac },
      {  label: "Forms",path:"/builder/forms", icon: SendHorizontal },
      {  label: "Message", path: "/builder/messages", icon: Mail },
      {  label: "Settings", path: "/builder/settings", icon: SlidersHorizontal },
    ],
    Elements: [
      {
        label: "Column",
        icon: "layout-grid",
        lucideIcon: "LayoutGrid",
        lucideSize: 28,
        lucideStrokeWidth: 2.2,
      },
      { label: "Split", icon: "view_column_2" },
      { label: "Text", icon: "format_size" },
      { label: "Heading", icon: "auto_awesome" },
      {
        label: "Button",
        icon: "hand",
        lucideIcon: "Hand",
        lucideSize: 26,
        lucideStrokeWidth: 2.2,
      },
      { label: "Button Dual", icon: "smart_button" },
      { label: "Icons", icon: "token", dragLabel: "iCons" },
      {
        label: "Image",
        icon: "image",
        lucideIcon: "Image",
        lucideSize: 28,
        lucideStrokeWidth: 2.2,
      },
      {
        label: "Banner",
        icon: "paint-roller",
        lucideIcon: "PaintRoller",
        lucideSize: 28,
        lucideStrokeWidth: 2.2,
      },
      {
        label: "Lightbox",
        icon: "circle-fading-plus",
        lucideIcon: "CircleFadingPlus",
        lucideSize: 28,
        lucideStrokeWidth: 2.2,
      },
      { label: "Video", icon: "slow_motion_video" },
      { label: "Counter", icon: "timer" },
      { label: "Divider", icon: "insert_page_break" },
      { label: "Form", icon: "send", dragLabel: "Form" },
      {
        label: "List Items",
        icon: "layout-list",
        lucideIcon: "LayoutList",
        dragLabel: "List Item",
      },
      { label: "List Icons", icon: "modeling", dragLabel: "List iCons" },
      {
        label: "Button Group",
        icon: "smart_button",
        dragLabel: "Button Group",
      },
      {
        label: "List Images",
        icon: "image-plus",
        lucideIcon: "ImagePlus",
        lucideSize: 26,
        lucideStrokeWidth: 2.2,
        dragLabel: "List iMage",
      },
      {
        label: "List Box",
        icon: "grid-2x2",
        lucideIcon: "Grid2x2",
        lucideSize: 27,
        lucideStrokeWidth: 2.2,
      },
      { label: "Carousel", icon: "switch_access_2" },
      {
        label: "Data Slider",
        icon: "gallery-thumbnails",
        lucideIcon: "GalleryThumbnails",
        lucideSize: 27,
        lucideStrokeWidth: 2.2,
      },
      {
        label: "Catagories",
        icon: "tags",
        lucideIcon: "Tags",
        lucideSize: 27,
        lucideStrokeWidth: 2.2,
      },
      {
        label: "Data Table",
        icon: "table",
        lucideIcon: "TableProperties",
        lucideSize: 28,
        lucideStrokeWidth: 2.2,
      },
      {
        label: "Between",
        icon: "square-split-horizontal",
        lucideIcon: "SquareSplitHorizontal",
        lucideSize: 30,
        lucideStrokeWidth: 2.2,
      },
      {
        label: "Tabs",
        icon: "table_rows_narrow",
        lucideIcon: "AppWindowMac",
        lucideStrokeWidth: 2.2,
      },
      {
        label: "Accordion",
        icon: "square-chevron-down",
        lucideIcon: "SquareChevronDown",
        lucideSize: 28,
        lucideStrokeWidth: 2.2,
      },
      {
        label: "Post",
        icon: "layers-2",
        lucideIcon: "Layers2",
        lucideSize: 28,
        lucideStrokeWidth: 2.2,
      },
      {
        label: "Image Hover",
        icon: "image-up",
        lucideIcon: "ImageUp",
        lucideSize: 28,
        lucideStrokeWidth: 2.2,
      },
      {
        label: "Overlay",
        icon: "brush",
        lucideIcon: "Brush",
        lucideSize: 28,
        lucideStrokeWidth: 2.2,
      },
    ],
    Theme: {
      headingOptions: [
        { value: "font-kanit", label: "Kanit", id: "0" },
        { value: "font-bai-jamjuree", label: "Jamjuree", id: "1" },
        { value: "font-merriweather", label: "Merriweather", id: "2" },
        {
          value: "font-monsieur-la-doulaise",
          label: "Monsieur La Doulaise",
          id: "3",
        },
        { value: "font-montserrat", label: "Montserrat", id: "4" },
        { value: "font-oswald", label: "Oswald", id: "5" },
        { value: "font-raleway", label: "Raleway", id: "6" },
      ],
      textOptions: [
        { value: "font-kanit", label: "Kanit", id: "0" },
        { value: "font-bai-jamjuree", label: "Jamjuree", id: "1" },
        { value: "font-merriweather", label: "Merriweather", id: "2" },
        {
          value: "font-monsieur-la-doulaise",
          label: "Monsieur La Doulaise",
          id: "3",
        },
        { value: "font-montserrat", label: "Montserrat", id: "4" },
        { value: "font-oswald", label: "Oswald", id: "5" },
        { value: "font-raleway", label: "Raleway", id: "6" },
      ],
      mainColor: ["#881337", "#be123c", "#f43f5e"],
      textColor: ["#365314", "#4d7c0f", "#84cc16"],
      otherColor: [
        "#ffe4e6",
        "#fecdd3",
        "#fb7185",
        "#e11d48",
        "#9f1239",
        "#ecfccb",
        "#d9f99d",
        "#a3e635",
        "#65a30d",
        "#3f6212",
      ],
    },
  });

  const [heading, setHeading] = useState(data.Theme.headingOptions[0]);
  const [text, setText] = useState(data.Theme.textOptions[0]);
  const [colorPicker, setColorPicker] = useState(null);
  const colorPickerRef = useRef(null);


  const setLinkTarget = ()=>{
    if(currentPost.imageType === "วิดีโอ"){
      return "_self"
    }else{
      return currentPost.link.target
    }

  }

  const handleColorPicker = (pickerName) => {
    if (colorPicker === pickerName) {
      setColorPicker(null);
    } else {
      setColorPicker(pickerName);
    }
  };

  const RGBA_2_HEX = (rgba) => {
    let { r, g, b, a } = rgba;
    r = Math.round(Math.min(Math.max(0, r), 255));
    g = Math.round(Math.min(Math.max(0, g), 255));
    b = Math.round(Math.min(Math.max(0, b), 255));
    a = Math.round(Math.min(Math.max(0, a), 1) * 255);
    function toHex(n) {
      const code = n.toString(16).padStart(2, "0");
      return code;
    }

    if (a === 255) {
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    } else {
      return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(a)}`;
    }
  };

  const opacity_2_hex = (opcy) => {
    const hex = opcy.toString(16).toUpperCase().padStart(2, 0);
    return hex;
  };


  const noneValue = ["",0]

  function HEX_2_RGBA(hex) {
    let r = 0,
      g = 0,
      b = 0;

    // กรณี #RGB
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    }
    // กรณี #RRGGBB
    else if (hex.length === 7) {
      r = parseInt(hex.slice(1, 3), 16);
      g = parseInt(hex.slice(3, 5), 16);
      b = parseInt(hex.slice(5, 7), 16);
    }

    return { r, g, b, a: 1 };
  }

  const renderRGBA = (rgba) => {
    let { r, g, b, a } = rgba;
    return `rgba(${r},${g},${b},${a})`;
  };

  const setColor = (e, typeColor, i) => {
    if (e.source === "rgb") return;
    const newColor = [...data.Theme[typeColor]];
    newColor[i] = e.hex;
    setData({ ...data, Theme: { ...data.Theme, [typeColor]: newColor } });
    changeTheme(typeColor, newColor);
  };

  const setFont = (typeFont, newFont) => {
    if (typeFont === "textHeading") {
      setHeading(newFont);
    } else if (typeFont === "text") {
      setText(newFont);
    }
    changeTheme(typeFont, newFont);
  };

  const changeTheme = (type, newThemeData) => {
    setTheme({ ...theme, [type]: newThemeData });
    setUpdated((prev) => prev + 1);
  };

  useEffect(() => {
    loadTheme();
  }, []);

  useEffect(() => {
    if (updated !== 0) {
      console.log(theme);
      updateNewTheme(theme)
    }
  }, [updated]);


  const isChromeOnlyPage = ["Hero", "Menu", "Forms", "Message", "Settings"].includes(selectedMenuId);
  const navWidth = () => {
    if (navOpen && !isChromeOnlyPage) {
      return "w-60";
    }
    return "w-0";
  };

  const gridCols = ()=>{
    const {columnAmount} = currentPost
    if(columnAmount === 2){
      return "2"
    }else if(columnAmount === 3){
      return "3"
    }else{
      return "4"
    }
  }

  const setFont_2_CSS = (font) => {
    let isFirst = false;
    const cutFont_ = font?.replace("font-", "");
    let newFont = "";
    for (let i = 0; i < cutFont_?.length; i++) {
      if (cutFont_[i] === "-" && !isFirst) {
        newFont += " ";
        isFirst = true;
      } else if (cutFont_[i] === "-" && isFirst) {
        newFont += "";
      } else if ((cutFont_[i] !== "-" && isFirst) || i === 0) {
        newFont += cutFont_[i].toUpperCase();
        isFirst = false;
      } else {
        newFont += cutFont_[i];
      }
    }
    return newFont;
  };

  const setTextPosition = ()=>{
    const CORNER = ["ริบบิ้น","วงกลม"]
    if(CORNER.includes(currentPost.decorationType) && currentPost.position === "center"){
      return "end"
  }else{
    return currentPost.position
  }
}

const setElementColor = (color) => {
  if(typeof color === "string"){
    return color
  }else{
    return theme[color.type][color.index]
  }
}


const types = [
  {label:"หน้า",value:"page"},
  {label:"URL",value:"URL"},
]

const targets = [
  {label:"หน้าเดิม",value:"_self"},
  {label:"หน้าใหม่",value:"_blank"},
]

const pages = ["Page1","Page2","Page3"]


 const demo = {
    id:Math.round(Math.random()*1E9),
    name:"",
    type:"page",
    page:"",
    url:"",
    target:"_self",
 }


 const [demos, setDemos] = useState(
  Array.from({ length: 3 }, (_, i) => ({ ...demo, id: Math.round(Math.random() * 1e9) }))
);

 const handleChange = (e,id)=>{

  const index = demos.findIndex(d=>d.id === id)
  const {name,value} = e.target
  setDemos(prev=>{
    const clonePrev = lodash.cloneDeep(prev)
    clonePrev[index][name] = value
    return clonePrev
  })
 }


 const cloneMenu = (id)=>{
  const index = demos.findIndex(d=>d.id === id)
  const cloneMenus = lodash.cloneDeep(demos)
  const newMenu = lodash.cloneDeep(demos[index])
  newMenu.id = Math.round(Math.random()*1E9)
  cloneMenus.splice(index,0,newMenu)
  setDemos(prev=>{
    return cloneMenus
  })
 }

 const deleteMenu = (id)=>{
  if(demos.length === 1) return
  const index = demos.findIndex(d=>d.id === id)
  const cloneMenus = lodash.cloneDeep(demos)
  cloneMenus.splice(index,1)
  setDemos(prev=>{
    return cloneMenus
  })
 }

  const builderElementsPanels = useMemo(() => {
    const els = data.Elements;
    const basicStartIdx = els.findIndex((item) => item.label === "Text");
    const sectionSpecialLabelSet = new Set(["Data Slider", "Catagories", "Tabs", "Accordion", "Post"]);
    if (basicStartIdx <= 0) {
      return { structure: els, basic: [], sectionSpecial: [], special: [] };
    }
    const structure = els.slice(0, basicStartIdx);
    const basicAll = els.slice(basicStartIdx);
    /** พื้นฐาน: Text … Form — พิเศษ: ตั้งแต่ List Items เป็นต้นไป */
    let specialStartRel = basicAll.findIndex((item) => item.label === "List Items");
    if (specialStartRel < 0) {
      return { structure, basic: basicAll, sectionSpecial: [], special: [] };
    }
    const specialAll = basicAll.slice(specialStartRel);
    const sectionSpecial = specialAll.filter((item) =>
      sectionSpecialLabelSet.has(item.label)
    );
    return {
      structure,
      basic: basicAll.slice(0, specialStartRel),
      sectionSpecial,
      special: specialAll.filter((item) => !sectionSpecialLabelSet.has(item.label)),
    };
  }, [data.Elements]);
  const formBuilderPreviewElements = useMemo(
    () => [
      { label: "Input", icon: "text_fields", dragLabel: "Form Input" },
      { label: "Text", icon: "format_size", dragLabel: "Form Text" },
      { label: "Textarea", icon: "subject", dragLabel: "Form Textarea" },
      { label: "Select", icon: "arrow_drop_down_circle", dragLabel: "Form Select" },
      { label: "Radio", icon: "radio_button_checked", dragLabel: "Form Radio" },
      { label: "Checkbox", icon: "check_box", dragLabel: "Form Checkbox" },
      { label: "Submit", icon: "send", dragLabel: "Form Submit" },
    ],
    []
  );

  return (
    <>
      <aside
        className={`dash-nav-rail sm:flex flex-col items-center border-r transition-[width] duration-300 ease-in-out ${
          railExpanded
            ? "w-[104px] gap-2.5 px-2 py-3"
            : "w-12 gap-4 px-0 py-4"
        }`}
      >
        <div
          className={`grid place-items-center shrink-0 ${
            railExpanded ? "h-11 w-11" : "h-10 w-10"
          }`}
        >
          <Layers
            className={railExpanded ? "h-6 w-6" : "h-5 w-5"}
            style={{ color: "var(--dash-icon)" }}
          />
        </div>
        <div
          className={`flex w-full min-h-0 flex-1 flex-col items-center overflow-y-auto overflow-x-hidden ${
            railExpanded ? "gap-3" : "gap-4"
          }`}
        >
          {data.Navbar.map((item, i) => (
            <IconButton
              key={i}
              icon={item.icon}
              label={item.label}
              expanded={railExpanded}
              active={selectedMenuId === item.label}
              badge={item.label === "Message" ? unreadMessageCount : 0}
              onClick={() => {
                setSelectedMenuId(item.label);
                setNavOpen(true);
                if (!item.path) return;
                navigate({
                  pathname: item.path,
                  search:
                    item.path === "/builder" ? location.search : undefined,
                });
              }}
            />
          ))}
        </div>

        <div
          className="flex shrink-0 items-center justify-center py-3"
          aria-label="Web Builder"
        >
          <span
            className={`select-none font-bold uppercase tracking-[0.16em] leading-none ${
              railExpanded ? "text-[14px]" : "text-[12px]"
            }`}
            style={{
              color: "var(--dash-nav-active, #334155)",
              writingMode: "vertical-rl",
            }}
          >
            WEB BUILDER
          </span>
        </div>

        <div className={`mt-auto flex w-full flex-col items-center ${railExpanded ? "gap-1.5" : "gap-2"}`}>
          <IconButton
            icon={LogOut}
            label="Logout"
            expanded={railExpanded}
            onClick={() => {}}
          />
        </div>
      </aside>

      <aside
        className={`dash-nav-panel ${
          navWidth()
        } sm:block ${isChromeOnlyPage ? "" : "transition-[width] duration-300"} overflow-hidden border-r`}
      >
        <div className="px-6 py-[14px] flex items-center justify-between">
          <div className="dash-heading font-semibold tracking-wide">{selectedMenuId}</div>
          <button
            onClick={() => setNavOpen((s) => !s)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
            style={{ color: "var(--dash-nav-panel-heading, #0f172a)" }}
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
        <nav
          className={`dash-nav-panel-scroll ${
            selectedMenuId == "Menu" ? "px-2" : "px-4"
          } pb-6 overflow-y-auto h-[calc(100%-64px)]`}
        >
          <ul className="mt-1 pl-1">
            <li>
              {selectedMenuId === "Builder" && (
                <>
                  <MainLabel label="โครงสร้าง - เลย์เอ้าท์" />
                  <div className="grid grid-cols-2 gap-3 mx-0">
                    {builderElementsPanels.structure.map((items, index) => (
                      <div
                        className="dash-nav-item rounded-md border px-3 py-2 text-center cursor-grab active:cursor-grabbing"
                        style={{ background: "var(--dash-nav-panel-item-bg)", borderColor: "var(--dash-nav-panel-item-border)" }}
                        draggable
                        key={`builder-struct-${items.label}-${index}`}
                        onPointerEnter={() => prepareDragElement?.(items.dragLabel ?? items.label)}
                        onPointerDown={() => prepareDragElement?.(items.dragLabel ?? items.label)}
                        onDragStart={() => {
                          handleDragElement(items.dragLabel ?? items.label);
                        }}
                        onDragEnd={() => {
                          handleDragElement(null);
                        }}
                      >
                        {" "}
                        <BuilderPaletteElementIcon item={items} />
                        <p className="dash-muted text-[12px] antialiased whitespace-nowrap">
                          {items.label}
                        </p>
                      </div>
                    ))}
                  </div>
                  {builderElementsPanels.basic.length > 0 && (
                    <>
                      <MainLabel label="Elements พื้นฐาน" />
                      <div className="grid grid-cols-2 gap-3 mx-0">
                        {builderElementsPanels.basic.map((items, index) => (
                          <div
                            className="dash-nav-item rounded-md border px-3 py-2 text-center cursor-grab active:cursor-grabbing"
                            style={{ background: "var(--dash-nav-panel-item-bg)", borderColor: "var(--dash-nav-panel-item-border)" }}
                            draggable
                            key={`builder-basic-${items.label}-${index}`}
                            onPointerEnter={() => prepareDragElement?.(items.dragLabel ?? items.label)}
                            onPointerDown={() => prepareDragElement?.(items.dragLabel ?? items.label)}
                            onDragStart={() => {
                              handleDragElement(items.dragLabel ?? items.label);
                            }}
                            onDragEnd={() => {
                              handleDragElement(null);
                            }}
                          >
                            {" "}
                            <BuilderPaletteElementIcon item={items} />
                            <p className="dash-muted text-[12px] antialiased whitespace-nowrap">
                              {items.label}
                            </p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  {(builderElementsPanels.sectionSpecial.length > 0 ||
                    builderElementsPanels.special.length > 0) && (
                    <>
                      {builderElementsPanels.sectionSpecial.length > 0 && (
                        <>
                          <MainLabel label="Section พิเศษ" />
                          <div className="grid grid-cols-2 gap-3 mx-0">
                            {builderElementsPanels.sectionSpecial.map((items, index) => (
                              <div
                                className="dash-nav-item rounded-md border px-3 py-2 text-center cursor-grab active:cursor-grabbing"
                                style={{ background: "var(--dash-nav-panel-item-bg)", borderColor: "var(--dash-nav-panel-item-border)" }}
                                draggable
                                key={`builder-section-special-${items.label}-${index}`}
                                onPointerEnter={() => prepareDragElement?.(items.dragLabel ?? items.label)}
                                onPointerDown={() => prepareDragElement?.(items.dragLabel ?? items.label)}
                                onDragStart={() => {
                                  handleDragElement(items.dragLabel ?? items.label);
                                }}
                                onDragEnd={() => {
                                  handleDragElement(null);
                                }}
                              >
                                {" "}
                                <BuilderPaletteElementIcon item={items} />
                                <p className="dash-muted text-[12px] antialiased whitespace-nowrap">
                                  {items.label}
                                </p>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                      {builderElementsPanels.special.length > 0 && (
                        <>
                          <MainLabel label="Elements พิเศษ" />
                          <div className="grid grid-cols-2 gap-3 mx-0">
                            {builderElementsPanels.special.map((items, index) => (
                              <div
                                className="dash-nav-item rounded-md border px-3 py-2 text-center cursor-grab active:cursor-grabbing"
                                style={{ background: "var(--dash-nav-panel-item-bg)", borderColor: "var(--dash-nav-panel-item-border)" }}
                                draggable
                                key={`builder-special-${items.label}-${index}`}
                                onPointerEnter={() => prepareDragElement?.(items.dragLabel ?? items.label)}
                                onPointerDown={() => prepareDragElement?.(items.dragLabel ?? items.label)}
                                onDragStart={() => {
                                  handleDragElement(items.dragLabel ?? items.label);
                                }}
                                onDragEnd={() => {
                                  handleDragElement(null);
                                }}
                              >
                                {" "}
                                <BuilderPaletteElementIcon item={items} />
                                <p className="dash-muted text-[12px] antialiased whitespace-nowrap">
                                  {items.label}
                                </p>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  )}
                  {formBuilderPreviewElements.length > 0 && (
                    <>
                      <MainLabel label="Form" />
                      <div className="grid grid-cols-2 gap-3 mx-0">
                        {formBuilderPreviewElements.map((items, index) => (
                          <div
                            className="dash-nav-item rounded-md border px-3 py-2 text-center cursor-grab active:cursor-grabbing"
                            style={{ background: "var(--dash-nav-panel-item-bg)", borderColor: "var(--dash-nav-panel-item-border)" }}
                            key={`builder-form-preview-${items.label}-${index}`}
                            title="ลากวางลงคอลัมน์"
                            draggable
                            onPointerEnter={() => prepareDragElement?.(items.dragLabel ?? items.label)}
                            onPointerDown={() => prepareDragElement?.(items.dragLabel ?? items.label)}
                            onDragStart={() => {
                              handleDragElement(items.dragLabel ?? items.label);
                            }}
                            onDragEnd={() => {
                              handleDragElement(null);
                            }}
                          >
                            <BuilderPaletteElementIcon item={items} />
                            <p className="dash-muted text-[12px] antialiased whitespace-nowrap">
                              {items.label}
                            </p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
              {selectedMenuId === "Theme" && (
                <>
                  <ListOption
                    font={heading}
                    onChange={setFont}
                    options={data.Theme.headingOptions}
                    label="ตัวอักษร - หัวข้อ"
                    type="textHeading"
                  />
                  <ListOption
                    font={text}
                    onChange={setFont}
                    options={data.Theme.textOptions}
                    label="ตัวอักษร - ข้อความ"
                    type="text"
                  />
                  <ColorGroup
                    colorPicker={colorPicker}
                    colorPickerRef={colorPickerRef}
                    handleColorPicker={handleColorPicker}
                    label="ตั้งค่าสีหลัก"
                    name="Main"
                    colors={data.Theme.mainColor}
                    setColor={setColor}
                    type="mainColor"
                    style={pickerStyles}
                  />
                  <ColorGroup
                    colorPicker={colorPicker}
                    colorPickerRef={colorPickerRef}
                    handleColorPicker={handleColorPicker}
                    label="ตั้งค่าสีข้อความ"
                    name="Text"
                    colors={data.Theme.textColor}
                    setColor={setColor}
                    type="textColor"
                    style={pickerStyles}
                  />
                  <ColorGroup
                    colorPicker={colorPicker}
                    colorPickerRef={colorPickerRef}
                    handleColorPicker={handleColorPicker}
                    label="ตั้งค่าสีเพิ่มเติม"
                    name="Other"
                    colors={data.Theme.otherColor}
                    setColor={setColor}
                    type="otherColor"
                    hex_2_rgba={HEX_2_RGBA}
                    style={pickerStyles}
                  />
                </>
              )}
              {(selectedMenuId === "AddPost" || selectedMenuId === "editPost") && (
                <div>

                  <div className="flex justify-center ">
                    {currentPost.image && ( <ImageList cols={1}>
                      <ImageListItem
  sx={{
    position: "relative",
    overflow: "hidden",
    borderRadius: currentPost.borderRadius || 0,
    "& img": { display: "block", width: "100%" },
  }}
>
  {(currentPost.link.url && currentPost.imageType !== "แกเลอรี่") ? (
    <a href={currentPost.link.url} target={setLinkTarget()}>
      <Box sx={{ position: "relative" }}>
        {/* รูปภาพ */}
        <img
          src={currentPost.image}
          style={{
            height: noneValue.includes(currentPost.height) ? "100%" : currentPost.height,
            width: noneValue.includes(currentPost.width) ? "100%" : currentPost.width,
            borderRadius: currentPost.borderRadius || 0,
          }}
        />
        {/* วงกลมติดมุม */}
        {currentPost.imageDecoration && currentPost.decorationType === "วงกลม" && (
          <Box
          className={`${currentPost.bold?"font-bold":""}`}
            sx={{
              position: "absolute",
              top: 20,                 // ← ปรับระยะจากมุมได้
              ...(setTextPosition() === "end" ? {right:20} : {left:20}),
              zIndex: 1,
              pointerEvents: "none",  // ให้คลิกทะลุไปที่ลิงก์รูป
              display: "inline-grid",
              placeItems: "center",
              bgcolor: setElementColor(currentPost.color)+opacity_2_hex(currentPost.opacity),
              color: setElementColor(currentPost.textColor),
              fontSize: currentPost.size,
              fontFamily: setFont_2_CSS(theme?.text.value),
              lineHeight: 1,
              whiteSpace: "nowrap",
              px: 1,                  // padding
              aspectRatio: "1 / 1",
              borderRadius: "9999px",
              minWidth: currentPost.size * 2, // กันวงกลมเล็กเกิน (ปรับ/เอาออกได้)
            }}
            
          >
            {currentPost.text}
          </Box>
        )}
         {currentPost.imageDecoration && currentPost.decorationType === "ริบบิ้น" && (
          <Box
          className={`${currentPost.bold?"font-bold":""}`}
            sx={{
              position: "absolute",
              top: 20,                 // ← ปรับระยะจากมุมได้
              ...(setTextPosition() === "end" ? {right:0, borderTopLeftRadius:6,borderBottomLeftRadius:6,} : {left:0,borderTopRightRadius:6,borderBottomRightRadius:6,}),
              zIndex: 1,
              pointerEvents: "none",  // ให้คลิกทะลุไปที่ลิงก์รูป
              display: "inline-grid",
              placeItems: "center",
              bgcolor: setElementColor(currentPost.color)+opacity_2_hex(currentPost.opacity),
              color: setElementColor(currentPost.textColor),
              fontSize: currentPost.size,
              fontFamily: setFont_2_CSS(theme?.text.value),
              lineHeight: 1,
              whiteSpace: "nowrap",
              px: 2,                  // padding
              py:1,
              minWidth: currentPost.size * 2, // กันวงกลมเล็กเกิน (ปรับ/เอาออกได้)
            }}
          >
            {currentPost.text}
          </Box>
        )}
      </Box>
    </a>
  ) : (
    <div>
      <img
        src={currentPost.image}
        style={{
          height: noneValue.includes(currentPost.height) ? "100%" : currentPost.height,
          width: noneValue.includes(currentPost.width) ? "100%" : currentPost.width,
          borderRadius: currentPost.borderRadius || 0,
        }}
      />
      {currentPost.imageDecoration && currentPost.decorationType === "วงกลม" && (
        <Box
          sx={{
            position: "absolute",
            top: 20,
            ...(setTextPosition() === "end" ? {right:20} : {left:20}),
            zIndex: 1,
            pointerEvents: "none",
            display: "inline-grid",
            placeItems: "center",
            bgcolor: setElementColor(currentPost.color)+opacity_2_hex(currentPost.opacity),
            color: setElementColor(currentPost.textColor),
            fontSize: currentPost.size,
            fontFamily: setFont_2_CSS(theme?.text.value),
            lineHeight: 1,
            whiteSpace: "nowrap",
            px: 1,
            aspectRatio: "1 / 1",
            borderRadius: "9999px",
            minWidth: currentPost.size * 2,
          }}
          className={`${currentPost.bold?"font-bold":""}`}
        >
          {currentPost.text}
        </Box>
      )}
          {currentPost.imageDecoration && currentPost.decorationType === "ริบบิ้น" && (
          <Box
            sx={{
              position: "absolute",
              top: 20,                 // ← ปรับระยะจากมุมได้
              ...(setTextPosition() === "end" ? {right:0, borderTopLeftRadius:6,borderBottomLeftRadius:6,} : {left:0,borderTopRightRadius:6,borderBottomRightRadius:6,}),
              zIndex: 1,
              pointerEvents: "none",  // ให้คลิกทะลุไปที่ลิงก์รูป
              display: "inline-grid",
              placeItems: "center",
              bgcolor: setElementColor(currentPost.color)+opacity_2_hex(currentPost.opacity),
              color: setElementColor(currentPost.textColor),
              fontSize: currentPost.size,
              fontFamily: setFont_2_CSS(theme?.text.value),
              lineHeight: 1,
              whiteSpace: "nowrap",
              px: 2,                  // padding
              py:1,
              minWidth: currentPost.size * 2, // กันวงกลมเล็กเกิน (ปรับ/เอาออกได้)
            }}
            className={`${currentPost.bold?"font-bold":""}`}
          >
            {currentPost.text}
          </Box>
        )}
    </div>
  )}

  {currentPost.imageDecoration && currentPost.decorationType === "แถบ" && (
    <ImageListItemBar
      title={currentPost.text}
      className={`${currentPost.bold?"font-bold":""}`}
      sx={{
        backgroundColor: setElementColor(currentPost.color)+opacity_2_hex(currentPost.opacity),
        borderBottomLeftRadius: currentPost.borderRadius || 0,
        borderBottomRightRadius: currentPost.borderRadius || 0,
        "& .MuiImageListItemBar-title": {
          fontSize: currentPost.size,
          color: setElementColor(currentPost.textColor),
          fontFamily: setFont_2_CSS(theme?.text.value),
          ...(setTextPosition() === "start"? { textAlign: "left" }:setTextPosition() === "center"? { textAlign: "center" }:{textAlign: "end"}),
        },
      }}
    />
  )}
</ImageListItem>
                    </ImageList>)}
                   
                       
                  </div>
                  <div className={`text-center ${theme.textHeading.value} ${currentPost.title.bold ? "font-bold":""}`} style={{color:theme.mainColor[0],fontSize:currentPost.title.size === ""?0:currentPost.title.size,paddingTop:`${currentPost.title.padding === ""?0:currentPost.title.padding}px`,paddingBottom:`${currentPost.title.padding === ""?0:currentPost.title.padding}px`}}> 
                    {currentPost.title.text}
                  </div>
                  <div className={`text-center ${theme.text.value}`} style={{fontSize:currentPost.description.size === ""?0:currentPost.description.size,paddingBottom:`${currentPost.description.padding === ""?0:currentPost.description.padding}px`}}>
                    {currentPost.description.text}
                  </div>
                  {currentPost.isColumn && (
                    <div className={`grid grid-cols-${gridCols()} my-2`}>
                          {currentPost.columns.map((col,i)=>{
                            const {icon,text,color,opacity} = col
                            if(i+1 > currentPost.columnAmount) {
                              return (<div className="col-span-1" key={i}></div>)
                            }
                            return(<div className="col-span-1 " key={i}>
                              <div className={`  ${i !== currentPost.columnAmount-1?"border-r-indigo-300 border-r  border-dashed":""} h-[35px] relative pl-8`}>
                                <IconLucide className="absolute left-2 top-1/2 -translate-y-1/2" color={setElementColor(color)+opacity_2_hex(opacity)} iconName={icon}/>
                                <div className={`h-full flex items-center text-sm ml-1 ${theme.text.value}`} style={{fontSize:currentPost.description.size === ""?0:currentPost.description.size}}>
              {text}
            </div>
                              </div>
                            </div>)
                      
                          })}
                    </div>
                  )}
                  {currentPost.isButton && (
                    <div className="flex justify-center my-2" >
                      {currentPost.buttons.map((btn,i)=>{
                        const {text,buttonColor,textColor,textSize,icon,opacity,bold} = btn
                        if(i+1 > currentPost.buttonAmount){
                          return (<div key={i}></div>)
                        }
                        return(
                        <Box
                        key={i}
                          sx={{
                            display: "inline-block",
                            p: 0.5,
                            lineHeight: 0,
                            borderRadius: 2,
                            
                          }}
                        >
                          <Button
                          href={btn.link.url || null}
                          target={btn.link.target}
                            className={``}
                            variant="contained"
                            disableElevation
                            sx={{
                              marginTop: 1,
                              marginBottom: 1,
                              textTransform: "none", 
                              fontWeight:100,
                              boxShadow: "none",
                              backgroundColor: setElementColor(buttonColor)+opacity_2_hex(opacity),
                              color:setElementColor(textColor),
                              border: 0,
                              m: 0,
                              borderRadius: 2,
                              fontSize: textSize,
                              fontFamily: setFont_2_CSS(theme?.text.value),
                              py: "7px",
                            }}
                           
                          >
                              <IconLucide className={`mr-2`}  color={setElementColor(textColor)} iconName={icon} size={textSize} strokeWidth={bold?3:2}/>
                            <div className={`${bold?"font-bold":""}`}>{text}</div>
                          </Button>
                        </Box>)
                      })}
                    </div>
                  )}
                </div>
              )}
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
}

function IconButton({ icon: Icon, label, onClick, active = false, expanded = false, badge = 0 }) {
  const badgeCount = Math.max(0, Number(badge) || 0);
  const showBadge = badgeCount > 0;
  const badgeLabel = badgeCount > 99 ? "99+" : String(badgeCount);
  const ariaLabel =
    label === "Message" && showBadge
      ? `${label}, ${badgeCount} ข้อความที่ยังไม่ได้อ่าน`
      : label;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative rounded-lg transition-colors ${
        expanded
          ? "flex w-full flex-col items-center gap-1 px-1.5 py-2"
          : "p-2"
      }`}
      style={{
        color: active ? "var(--dash-nav-active)" : "var(--dash-icon)",
        background: active
          ? "color-mix(in srgb, var(--dash-nav-active) 14%, transparent)"
          : "transparent",
      }}
      aria-label={ariaLabel}
      aria-current={active ? "page" : undefined}
      title={expanded ? undefined : ariaLabel}
    >
      <span className="relative inline-flex shrink-0">
        <Icon className={`shrink-0 ${expanded ? "h-6 w-6" : "h-5 w-5"}`} />
        {showBadge ? (
          <span
            className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-0.5 text-[9px] font-bold leading-none text-white"
            style={{ background: "var(--dash-nav-active, #ef4444)" }}
          >
            {badgeLabel}
          </span>
        ) : null}
      </span>
      {expanded ? (
        <span className="max-w-full truncate text-center text-[12px] font-medium leading-tight tracking-tight opacity-40">
          {label}
        </span>
      ) : (
        <span className="pointer-events-none absolute left-11 top-1/2 z-[999999] -translate-y-1/2 whitespace-nowrap rounded-md border border-slate-700/40 bg-slate-800 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 dark:border-white/10 dark:bg-gray-800">
          {label}
          {showBadge ? ` (${badgeLabel})` : ""}
        </span>
      )}
    </button>
  );
}

function MainLabel({ label }) {
  return (
    <div className="mt-5 mb-2 flex items-center gap-2">
      <span className="dash-heading shrink-0 text-[13px] font-semibold">
        {label}
      </span>
      <div className="dash-nav-heading-rule min-w-0 flex-1 border-b" />
    </div>
  );
}

function ListOption({ font, onChange, options, label, type }) {
  return (
    <>
      <MainLabel label={label} />

      <Listbox value={font} onChange={(e) => onChange(type, e)}>
        <div className="relative mt-2">
          <ListboxButton className="grid w-full cursor-default grid-cols-1 rounded-md bg-gray-100 dark:bg-gray-200 text-gray-900 dark:text-gray-900 py-1.5 pr-2 pl-3 text-left outline-1 -outline-offset-1 outline-gray-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 text-[12px] hover:cursor-pointer">
            <span className={`col-start-1 row-start-1 flex items-center gap-3 pr-6 ${font.value}`}>
              <span className={`block truncate `}></span>
              {font.label}
            </span>
            <ChevronUpDownIcon
              aria-hidden="true"
              className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4"
            />
          </ListboxButton>

          <ListboxOptions
            transition
            className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-gray-100 dark:bg-gray-200 text-teal-500 dark:text-teal-500 py-1 shadow-none outline-1 outline-black/5 data-leave:transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0 text-[12px]"
          >
            {options.map((option, i) => (
              <ListboxOption
                value={option}
                key={i}
                id={option.id}
                className={`group relative cursor-default py-2 pr-9 pl-3 text-gray-800 dark:text-gray-900 select-none 
                  data-focus:bg-indigo-600 data-focus:text-white data-focus:outline-hidden hover:cursor-pointer
                  ${
                    i !== 0
                      ? "border-dotted border-t border-gray-300 dark:border-gray-400"
                      : ""
                  }
                `}
              >
                <div className="flex items-center">
                  <span
                    className={`ml-3 block truncate font-normal group-data-selected:font-semibold ${option.value}`}
                  >
                    {option.label}
                  </span>
                </div>

                {font?.id === option.id && (
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

function ColorGroup({
  colorPicker,
  colorPickerRef,
  handleColorPicker,
  label,
  name,
  colors,
  setColor,
  type,
  style,
}) {
  return (
    <>
      <MainLabel label={label} />
      <div
        className={`grid grid-cols-${
          colors.length < 5 ? colors.length : 5
        } gap-[5px_0px] mb-5 w-full relative inline-block`}
        role="group"
      >
        {colors.map((color, i) => (
          <div key={i}>
            <button
              type="button"
              style={{ backgroundColor: color }}
              className={`h-7  border border-gray-300 dark:border-white/20 ${
                i === 0 || i % 5 === 0 ? "rounded-l-md" : ""
              } ${
                i === colors.length - 1 || (i + 1) % 5 === 0
                  ? "rounded-r-md"
                  : ""
              } focus:z-10 focus:ring-0 focus:outline-none w-full`}
              onClick={() => {
                handleColorPicker(`${name}${i + 1}`);
              }}
            ></button>
            {colorPicker === `${name}${i + 1}` && (
              <div
                ref={colorPickerRef}
                className="absolute inline-block top-full right-0 z-10  mt-[3px]"
              >
                <SketchPicker
                  color={color}
                  onChange={(e) => {
                    setColor(e, type, i);
                  }}
                  disableAlpha
                  presetColors={[]}
                  styles={style}
                />
                <div
                  className="absolute inset-x-0 bottom-0 rounded-b-[10px] bg-[#101827] dark:bg-white mt-3 flex items-center gap-2 flex items-center justify-center "
                  style={{
                    height: 50, // ปรับตามที่พอดีกับเครื่องคุณ (60–72px มักจะพอดี)
                    zIndex: 10, // ให้อยู่เหนือ input ของ react-color
                    pointerEvents: "auto", // กันคลิกไปโดน input ใต้กล่อง
                  }}
                >
                  <div className="relative w-auto rounded-xl border border-zinc-700 bg-zinc-200 dark:bg-zinc-800 px-2 py-1 text-sm text-zinc-100 focus-within:border-zinc-500 flex items-center justify-center w-[180px] mb-[5px]">
                    {/* ไอคอน # */}
                    <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                      <span className="text-zinc-600 dark:text-zinc-400">#</span>
                    </div>

                    {/* ช่องกรอก HEX */}
                    <input
                      type="text"
                      value={color.replace("#", "").toUpperCase()}
                      onChange={(e) => {
                        let v = e.target.value.trim();
                        if (!v.startsWith("#")) v = "#" + v;
                        if (/^#([0-9A-Fa-f]{3}){1,2}$/.test(v))
                          setColor({ hex: v }, type, i);
                        else setColor({ hex: v }, type, i); // อนุญาตให้พิมพ์ค้างไว้ได้ แล้วค่อย valid ทีหลัง
                      }}
                      className="w-full pl-6  bg-transparent outline-none text-zinc-800 dark:text-zinc-200 text-[12px]"
                      spellCheck={false}
                    />

                    {/* swatch สี */}
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                      <div
                        className="h-5 w-5 rounded-full border border-zinc-200 "
                        style={{ backgroundColor: color }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export default Navbar;


{/*  */}
