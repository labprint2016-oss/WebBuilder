import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
  useLayoutEffect,
  use,
} from "react";
// import ImageModal from "./imageModal";
import {
  TextField,
  Box,
  Button,
  InputAdornment,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Tab,
  FormControlLabel,
  Radio,
  Switch,
  Stack,
  Popper,
  RadioGroup,
  Typography,
  Checkbox,
  ListItemText,
} from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import IconLucide from "./IconLucide";
import { styled } from "@mui/material/styles";
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
  HardDrive,
  FileSymlink
} from "lucide-react";
import { Description } from "@headlessui/react";
import { blue } from "@mui/material/colors";
import { createPost } from "../Functions/post";
import lodash, { fill, includes, isNull, set, transform } from "lodash";
import Icons from "./Builder/Icons";
import { getHero,updateDesign } from "../Functions/hero";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import HeroSlider from "./Builder/heroSlider";
import { ChevronLeft, ChevronRight } from "lucide-react";



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

function MainLabel({ label, isGradient = null, setIsGradient = null }) {
  const labelSwitch = ["สีพื้นหลัง"];
  const w = () => {
    switch (label) {
      case "สีพื้นหลัง":
        return "w-[560px]";
      case "โครงสร้าง":
        return "w-[740px]";
      default:
        return "flex-1";
    }
  };

  return (
    <div className="flex items-center gap-2  mb-2">
      <span className="text-dark dark:text-white/80 text-[13px] font-bold">
        {label}
      </span>
      <div className={`border-b border-gray-500/50 ${w()}`}></div>
      {labelSwitch.includes(label) && (
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <AntSwitch
            inputProps={{ "aria-label": "ant design" }}
            onChange={() => setIsGradient()}
            checked={isGradient}
          />
          <Typography sx={{ fontSize: 13 }}>
            {!isGradient ? "สีไล่โทน" : "สีพื้น"}
          </Typography>
        </Stack>
      )}
    </div>
  );
}

const COMMON_FIELD_SX =  (hasChildren)=>{

  const radiusRight = hasChildren ? 0 : 5;
  const broderRight = hasChildren ? 0 : 1;

  return{
  
    "& .MuiInputLabel-root": { fontSize: 14, color:"#aaaaaa" },
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
      borderColor: "rgba(0,0,0,0.23)", borderWidth: "1px", borderTopRightRadius: radiusRight, borderBottomRightRadius: radiusRight,borderRightWidth: broderRight
    },
    "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(0,0,0,0.23)", borderWidth: "1px", borderTopRightRadius: radiusRight, borderBottomRightRadius: radiusRight,borderRightWidth: broderRight
    },
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(0,0,0,0.23)", borderWidth: "1px", borderTopRightRadius: radiusRight, borderBottomRightRadius: radiusRight,borderRightWidth: broderRight
    },
    "& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(0,0,0,0.23)", borderWidth: "1px", borderTopRightRadius: radiusRight, borderBottomRightRadius: radiusRight,borderRightWidth: broderRight
    },
  };
}


function RadioInput({ label, value, color = "black" }) {
  return (
    <FormControlLabel
      value={value}
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
      label={label}
      sx={{ "& .MuiFormControlLabel-label": { fontSize: 13, color: color } }}
    />
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
          height: 45,
          width: "auto",
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
            borderColor: "#494d55", // สีกรอบใน dark (เทาเข้มที่คุณใช้กับ TextField)
            "&:hover": { borderColor: "#494d55" },
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
                size={18} // บังคับขนาดไอคอนให้เท่ากัน
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

function Field({label,name,value,handleChange,children}) {




  return (
    <FormControl fullWidth>
      <Box sx={{ display: "flex", width: "100%" }}>
        <TextField
          sx={COMMON_FIELD_SX(Boolean(children))}
          fullWidth
          label={label}
          name={name}
          value={value}
          onChange={handleChange}
          slotProps={{
            input: {
              sx: { fontSize: 15 },
              startAdornment: (
                <InputAdornment position="start"></InputAdornment>
              ),
            },
          }}
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


function Test({}){


  const [value,setValue] = useState("");

  const handleChange = (e)=>{
    setValue(e.target.value);
  }

  return (
    <div>
      <div className="mt-[500px] w-[500px] ml-[100px]">
        <Field label="Test" name="value" value={value} handleChange={handleChange}>
          <Btn radius="noAll" text="jj" Icon={Bluetooth} handleClick={()=>console.log(111)}/>
          <Btn radius="noL" text="jj" Icon={Bluetooth} lastChild={true} handleClick={()=>console.log(222)}/>
        </Field>
      </div>
     
    </div>
  )
}

export default Test;