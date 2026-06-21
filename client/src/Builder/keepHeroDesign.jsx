import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
  useLayoutEffect,
  use,
} from "react";
import ImageModal from "./imageModal";
import { swatchSelectedCheckClassName } from "./Layouts/Elements/swatchCheckClass";
import { THEME_PANEL_BASIC_COLOR_SWATCHES } from "./themePanelBasicColors";
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
  ListItemText,Modal,Backdrop,Fade
} from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import IconLucide from "../IconLucide";
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
} from "lucide-react";
import { Description } from "@headlessui/react";
import { blue } from "@mui/material/colors";
import { createPost } from "../../Functions/post";
import lodash, { fill, includes, isNull, set, transform } from "lodash";
import Icons from "./Icons";
import { getHero,updateDesign } from "../../Functions/hero";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import HeroSlider from "./heroSlider";
import { ChevronLeft, ChevronRight } from "lucide-react";


const displays = ["Desktop", "Mobile"];

const isElements = [
  { label: "หัวข้อ", field: "isTitle" },
  { label: "หัวข้อย่อย", field: "isSubTitle" },
  { label: "ข้อความ", field: "isText" },
  { label: "ปุ่ม", field: "isButton" },
  { label: "รูปภาพพิเศษ", field: "isImageTopLayer" },
];
const elements1 = [
  { label: "หัวข้อ", field: "title" },
  { label: "หัวข้อย่อย", field: "subTitle" },
  { label: "ข้อความ", field: "text" },
];
const elements2 = [
  { label: "ปุ่ม", field: "button" },
  { label: "ภาพพื้นหลัง", field: "backgroundImage" },
  { label: "ภาพพิเศษ-1", field: "imageTopLayer1" },
  { label: "ภาพพิเศษ-2", field: "imageTopLayer2" },
];

const layouts = [
  { label: "ซ้าย", value: "left" },
  { label: "กลาง", value: "center" },
  { label: "ขวา", value: "right" },
];

const dividers = ["-", "Wave1", "Tanger Wave", "Woble Wave"];

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

const COMMON_FIELD_SX = (
  borderColor = null,
  textColor = null,
  width = "100%",
  label = null,
  isSelect = false,
) => {
  const mt = label ? "7px" : "3.5px";
  return {
    width,
    "& .MuiInputLabel-root": { fontSize: 12, color: "#aaaaaa", marginTop: mt },
    "& .MuiInputLabel-root.Mui-focused, \
       & .MuiInputLabel-root.Mui-error, \
       & .MuiInputLabel-root.Mui-disabled": {
      color: "#aaaaaa",
    },
    "& .MuiFormLabel-asterisk": { color: "#aaaaaa" },

    "& .MuiOutlinedInput-input": { fontSize: 13, color: textColor || "black" },
    "& .MuiOutlinedInput-root": {
      height: 33, // <== บังคับความสูงของกล่อง
      marginTop: "9.5px",
      // ถ้าอยากให้ตัวหนังสือกลางกล่องแนวตั้งเป๊ะ ๆ
      "& .MuiSelect-select": {
        fontSize: 12,
        paddingTop: 0,
        paddingBottom: 0,
        display: "flex",
        alignItems: "center",
      },
    },

    "& .MuiInputLabel-root.MuiInputLabel-shrink": {
      transform: "translate(14px, -15px) scale(1)",
    },
    "& .MuiOutlinedInput-notchedOutline legend": {
      ...(isSelect
        ? { width: 0, padding: 0, display: "none" } // ตัด notch ทิ้ง
        : { fontSize: 12, lineHeight: "20px", padding: "0 0px" }),
    },

    "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
      borderColor: borderColor || "rgba(0,0,0,0.23)",
      borderWidth: "1px",
    },
    "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: borderColor || "rgba(0,0,0,0.23)",
      borderWidth: "1px",
    },
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: borderColor || "rgba(0,0,0,0.23)",
      borderWidth: "1px",
    },
    "& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline": {
      borderColor: borderColor || "rgba(0,0,0,0.23)",
    },
  };
};

const SX_CENTER_FIELD = {
  ...COMMON_FIELD_SX(),
  "& .MuiOutlinedInput-root": {
    height: 42.5,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },

  // 🔑 ตัดเส้นขอบด้านขวาออกทุกสถานะ
  "& .MuiOutlinedInput-notchedOutline": {
    borderLeftWidth: "0px !important",
    borderRightWidth: "0px !important",
  },

  // ถ้ามีโหมด .dark
  ".dark & .MuiOutlinedInput-notchedOutline": { borderLeftWidth: 0 },
  ".dark & .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
    borderLeftWidth: 0,
  },
  ".dark & .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
    {
      borderLeftWidth: 0,
    },
};

const SX_FIRST_FIELD = (
  label,
  borderColor,
  textColor,
  width,
  height = 42.5,
  disable=false,
  noBtn=false,
) => {
  return {
    ...COMMON_FIELD_SX(borderColor, textColor, width, label),
    "& .MuiOutlinedInput-root": {
      marginTop: label ? "4.5px" : 0,
      height: label ? 38 : height,
      borderTopRightRadius: noBtn ? 5 : 0,
      borderBottomRightRadius: noBtn ? 5 : 0,
    },

    // 🔑 ตัดเส้นขอบด้านขวาออกทุกสถานะ
    "& .MuiOutlinedInput-notchedOutline": {
      borderRightWidth: noBtn ? "1px !important" : "0px !important",
    },...(disable ? {"& .MuiOutlinedInput-input":{
      color:"#adaeaf"
    }}:{})

    // ถ้ามีโหมด .dark
  };
};

const PXInput = ({
  field,
  value,
  handleChange,
  label = null,
  display = null,
  index=-1,
  miniField = null,
  children = null,
  borderColor = null,
  textColor = null,
  width = "100%",
}) => {
  return (
    <FormControl fullWidth>
      <Box sx={{ display: "flex", width: "100%" }}>
        <TextField
          value={value ?? ""}
          onChange={(e) => handleChange(e, display,index, miniField)}
          sx={SX_FIRST_FIELD(label, borderColor, textColor, width)}
          fullWidth
          name={field}
          label={label}
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
            height: 38,
            borderLeftWidth: 0,
            borderRightWidth: children ? 0 : 1,
            backgroundColor: "#454b57",
            px: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            color: "white",
            marginTop: "4.5px",
            border: "1px solid",
            borderColor: "#5e636d",
            borderTopRightRadius: children ? 0 : 5,
            borderBottomRightRadius: children ? 0 : 5,

            ".dark &": {
              color: "gray",
              borderColor: "#494d55",
            },
          }}
        >
          PX
        </Box>
        {children}
      </Box>
    </FormControl>
  );
};

function RadioInput({ label, value }) {
  return (
    <FormControlLabel
      value={value}
      control={
        <Radio
          sx={(t) => {
            return {
              // ยังไม่ติ๊ก = สีตามโหมด
              color: "black",
              "&.Mui-checked": { color: "black" }, // ติ๊กแล้ว = สีเดียวกัน
              "&:hover": { backgroundColor: "transparent" },
              "&.Mui-checked:hover": { backgroundColor: "transparent" },
            };
          }}
        />
      }
      label={label}
      sx={{ "& .MuiFormControlLabel-label": { fontSize: 13, color: "black" } }}
    />
  );
}

function CheckInput({ label, field,index, display, heroData, setHero,miniField=null }) {


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
          if(miniField){
            hero[display][index][field][miniField] = e.target.checked;
          }else{
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

const ArrowPopperTop = ({ position }) => {
  return (
    <div className={`pointer-events-none absolute -bottom-2 ${position}`}>
      <div className="relative h-0 w-0">
        {/* ชั้นนอก: เส้นขอบ */}

        {/* ชั้นใน: พื้นหลัง (ซ้อนทับให้เห็นเป็นขอบสวย ๆ) */}
        <div
          className="
          absolute -bottom-[1px] left-1/2 -translate-x-1/2
          h-0 w-0
          border-l-[9px] border-l-transparent
          border-r-[9px] border-r-transparent
          border-t-[9px] border-t-[#454b57]
          dark:border-t-zinc-800
        "
        />
        <div
          className="
          absolute -bottom-[1px] left-1/2 -translate-x-1/2 mb-[8px]
          w-[16px] h-[2px]
          bg-[#454b57] dark:bg-zinc-800
        "
        />
      </div>
    </div>
  );
};

function Btn({
  uploadOnly = false,
  display = null,
  backgroundColor = null,
  Icon = null,
  isOnField = true,
  isFist = false,
  isUpload = false,
  noRadius = false,
  handleChange = null,
  index=-1,
  popperRef = null,
  openPopper = null,
  handleClick = null,
  iconColor = null,
  borderColor = null,
  height = 42.5,
}) {

  const click = () => {
    if (!isUpload) {
      if (openPopper) openPopper();
      else if (handleClick) handleClick();
      return;
    }
   handleChange()
    };

  return (
    <>
      <Button
        ref={(el) => {
          if (!popperRef) return;
          if (Array.isArray(popperRef)) {
            popperRef[0].current[popperRef[1]] = el;
            return;
          }
          popperRef.current = el;
        }}
        onClick={click}
        variant="contained"
        name={isUpload ? "uploadBtn" : "POPPER-BTN"}
        sx={(t) => {
          return {
            boxShadow: "none", // 1) เอาเงาออก
            px: 2.5,
            height: height,
            borderTopLeftRadius: (isOnField && !isFist) || noRadius ? 0 : 5, // ให้แนบกับ TextField
            borderBottomLeftRadius: (isOnField && !isFist) || noRadius ? 0 : 5,
            borderTopRightRadius:
              isFist || (isUpload && !uploadOnly) || noRadius ? 0 : 5,
            borderBottomRightRadius:
              isFist || (isUpload && !uploadOnly) || noRadius ? 0 : 5,
            // 2) ให้ปุ่มมี "กรอบ" แบบเดียวกับ TextField
            border: "1px solid",
            borderColor: borderColor || "#A1A1AA",
            minWidth: 52,
            borderRightWidth: isUpload && !uploadOnly ? 0 : 1,

            // (ตัวเลือก) ถ้าไม่อยากให้มีเส้นหนาตรงรอยต่อกลาง
            // ให้ตัดเส้นซ้ายของปุ่มออก จะเหลือเส้นของ TextField ฝั่งเดียวพอดี
            // borderLeftWidth: 0,

            // สีพื้นหลังของปุ่ม = สีที่เลือก
            backgroundColor: backgroundColor || "#454b58",
            "&:hover": {
              backgroundColor: backgroundColor || "#454b58",
              borderColor: borderColor || "#A1A1AA",
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
        {Icon ? (
          // กล่อง fix ขนาด + จัดกลางไอคอน
          <Box
            sx={{
              width: 20,
              height: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {typeof Icon === "string" ? (
              <IconLucide
                iconName={Icon}
                size={18}
                strokeWidth={2.2}
                className="text-white"
              />
            ) : (
              <Icon
                size={18} // บังคับขนาดไอคอนให้เท่ากัน
                strokeWidth={2.2} // ปรับความหนาเส้นให้รู้สึกเท่า ๆ กัน
                className="text-white"
                style={{
                  color: iconColor || "white",
                }}
              />
            )}
          </Box>
        ) : (
          <div className="text-white text-[12px]">UPLOAD</div>
        )}
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

function Field({
  label,
  value,
  moreData,
  display,
  field,
  setImgName=null,
  noBtn = false,
  handleChange = null,
  index=-1,
  disable = false,
  isUpload = false,
  popperRef = null,
  openPopper1 = null,
  popperRef2 = null,
  openPopper2 = null,
  backgroundColor = null,
  miniField = null,
  borderColor = null,
  textColor = null,
  width = "100%",
  height = 42.5,
}) {
  const IconBtn = moreData?.iconBtn;
  const Icon = moreData?.icon;

  const style = Icon
    ? SX_CENTER_FIELD
    : SX_FIRST_FIELD(null, borderColor, textColor, width, height,isUpload,noBtn);

  return (
    <FormControl fullWidth id="color-input">
      <Box sx={{ display: "flex", width: "100%" }}>
        {Icon && (
          <Btn
            Icon={Icon}
            isFist={true}
            popperRef={popperRef2}
            openPopper={openPopper2}
          />
        )}
        <TextField
          sx={style}
          fullWidth
          label={label}
          name={field}
          onChange={
            disable || !handleChange
              ? undefined
              : (e) => handleChange(e, display,index, miniField)
          }
          InputProps={{ readOnly: disable }}
          value={value}
          slotProps={{
            input: {
              sx: { fontSize: 15 },
              startAdornment: (
                <InputAdornment position="start"></InputAdornment>
              ),
            },
          }}
        />
        {isUpload && (
          <Btn
            display={display}
            handleChange={()=>{
              setImgName(field)
            }}
            isUpload={true}
            // fileField={field}
            uploadOnly={noBtn}
          />
        )}
        {!noBtn && (
          <Btn
            Icon={IconBtn}
            popperRef={popperRef ? popperRef : null}
            openPopper={openPopper1 ? openPopper1 : null}
            backgroundColor={backgroundColor}
            borderColor={borderColor}
            height={height}
          />
        )}
      </Box>
    </FormControl>
  );
}

const Form = ({
  colors,
  theme,
  setImgName,
  display,
  index,
  hero,
  handleChange,
  handleChangeForNumber,
  setHero,
  openDVD,
  setOpenDVD,

}) => {
  const [openColor, setOpenColor] = useState(false);
  const [openElement, setOpenElement] = useState(false);
  const [openIcon, setOpenIcon] = useState(false);

  const colorRef = useRef(null);
  const degreeRef = useRef(null);
  const colorGradientRef = useRef([null, null]);

  const openColorPopper = (n) => {
    if (openColor === n) {
      setOpenColor(false);
    } else {
      setOpenColor(n);
    }
  };

  const openElementPopper = (n) => {
    if (openElement === n) {
      setOpenElement(false);
    } else {
      setOpenElement(n);
    }
  };

  useEffect(()=>{
    if(openDVD){
      setOpenColor(false);
      setOpenElement(false);
      setOpenIcon(false);
    }

  },[openDVD])


  useEffect(()=>{
    if(openColor){
      setOpenDVD(false)
      setOpenElement(false);
      setOpenIcon(false);
    }

  },[openColor])

  useEffect(()=>{
    if((openColor || openElement || openIcon) && openDVD){
      setOpenDVD(false)
    }
 
  },[openColor, openElement, openIcon])



  const dataHero = () => {
    switch (display) {
      case "Desktop":
        return hero.desktop[index];
      case "Mobile":
        return hero.mobile[index];
      default:
        return null;
    }
  };

  const solidColor =
    typeof dataHero().backgroundColor === "string"
      ? dataHero().backgroundColor
      : theme[dataHero().backgroundColor?.type][
          dataHero().backgroundColor?.index
        ];

  const gradient = () => {
    setHero((prev) => {
      const hero = lodash.cloneDeep(prev);
      hero[display.toLowerCase()][index].isGradient = !hero[display.toLowerCase()][index].isGradient
      return hero
    });
  };

  const handleChangeColor = (color, field, indexColor = -1, miniField = null) => {
    let newColor = color;
    if (indexColor !== -1) {
      newColor = lodash.cloneDeep(dataHero()[field]);
      newColor[indexColor] = color;
    }
    const e = { target: { name: field, value: newColor } };
    handleChange(e, display.toLowerCase(),index, miniField);
    setOpenElement(field)

  };

  const handleChangeIcon = (icon, field, miniField) => {
    const e = { target: { name: field, value: icon } };
    handleChange(e, display.toLowerCase(),index, miniField);
  };

  const handleChangeOpacity = (value, field, indexOpct = -1) => {
    let newValue = value;
    if (indexOpct !== -1) {
      newValue = lodash.cloneDeep(dataHero()[field]);
      newValue[indexOpct] = value;
    }
    const e = { target: { name: field, value: newValue } };
    handleChange(e, display.toLowerCase(),index);
  };

  const handleChangeDegree = (value) => {
    const e = { target: { name: "degree", value } };
    handleChange(e, display.toLowerCase(),index);
  };



  return (
    <div>
      <MainLabel
        label="สีพื้นหลัง"
        setIsGradient={gradient}
        isGradient={dataHero().isGradient}
      />
      <div className="grid grid-cols-12 gap-4 mt-5">
        {!dataHero().isGradient && (
          <div className="col-span-3">
            <Field
            index={index}
              moreData={{ iconBtn: Palette }}
              disable={true}
              label={`Color`}
              value={solidColor}
              popperRef={colorRef}
              openPopper1={() => {
                openColorPopper(0);
                openElementPopper(false);
                setOpenIcon(false);
              }}
              backgroundColor={solidColor}
            />
            <ColorPopper
              theme={theme}
              colors={colors}
              elementColor={dataHero().backgroundColor}
              open={openColor === 0}
              popperRef={colorRef.current}
              handleChange={(color) =>
                handleChangeColor(color, "backgroundColor")
              }
              opacity={dataHero().opacity}
              handleOpct={(value) => handleChangeOpacity(value, "opacity")}
            />
          </div>
        )}
        {dataHero().isGradient && (
          <>
            {[0, 1].map((_) => {
              const gradientColor = () => {
                const color = dataHero().backgroundGradient[_];
                if (typeof color === "string") {
                  return color;
                } else {
                  return theme[color.type][color.index];
                }
              };

              return (
                <div className="col-span-3" key={_}>
                  <Field
                  index={index}
                    moreData={{ iconBtn: Palette }}
                    disable={true}
                    label={`Color-${_ + 1}`}
                    value={gradientColor()}
                    backgroundColor={gradientColor()}
                    popperRef={[colorGradientRef, _]}
                    openPopper1={() => {
                      openColorPopper(_ + 1);
                      openElementPopper(false);
                      setOpenIcon(false);
                    }}
                  />
                  <ColorPopper
                    theme={theme}
                    colors={colors}
                    elementColor={dataHero().backgroundGradient[_]}
                    open={openColor === _ + 1}
                    popperRef={colorGradientRef.current[_]}
                    handleChange={(color) =>
                      handleChangeColor(color, "backgroundGradient", _)
                    }
                    opacity={dataHero().opacityGradient[_]}
                    handleOpct={(value) =>
                      handleChangeOpacity(value, "opacityGradient", _)
                    }
                  />
                </div>
              );
            })}
          </>
        )}

        {dataHero().isGradient && (
          <div className="col-span-1">
            <Btn
              Icon={Settings}
              isOnField={false}
              display={display.toLowerCase()}
              openPopper={() => openColorPopper(3)}
              popperRef={degreeRef}
            />
            <OptionPopper
              open={openColor === 3}
              popperRef={degreeRef.current}
              width="w-[200px]"
            >
              <ArrowPopperTop position="left-[30px] mb-[1px]" />
              <Range
                value={dataHero().degree}
                min={0}
                max={360}
                step={45}
                handleChange={(value) => handleChangeDegree(value)}
              />
            </OptionPopper>
          </div>
        )}
      </div>
      <div className="mt-5" />

      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-1">
          <MainLabel label="องค์ประกอบ" />
          <div className="grid grid-cols-12 gap-[120px]">
            {isElements.map(({ label, field }) => (
              <div key={field} className="col-span-1">
                <CheckInput
                  label={label}
                  field={field}
                  display={display.toLowerCase()}
                  index={index}
                  heroData={dataHero()}
                  setHero={setHero}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-1">
          <MainLabel label={"โครงสร้าง"} />
          <RadioGroup
            row
            sx={{ gap: 7 }}
            onChange={(e) => handleChange(e, display.toLowerCase(),index)}
            name="layout"
            value={dataHero().layout}
          >
            {layouts.map(({ label, value }) => (
              <div key={value}>
                <RadioInput label={label} value={value} />
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 mt-5">
        {elements1.map(({ label, field }) => {
          const colSpan = label === "ข้อความ" ? "col-span-6" : "col-span-3";
          const ref = useRef(null);

          const textColor =
            typeof dataHero()[field].color === "string"
              ? dataHero()[field].color
              : theme[dataHero()[field].color?.type][
                  dataHero()[field].color?.index
                ];

          return (
            <div className={colSpan} key={field}>
              <Field
              index={index}
                moreData={{ iconBtn: Settings }}
                label={`${label}`}
                field={field}
                value={dataHero()[field].text}
                handleChange={handleChange}
                miniField="text"
                display={display.toLowerCase()}
                popperRef={ref}
                openPopper1={() => {
                  openElementPopper(field);
                  openColorPopper(false);
                  setOpenIcon(false);
                }}
              />
              <OptionPopper
                open={openElement === field}
                popperRef={ref.current}
                position={field === "text" ? "top-end" : "top-start"}
              >
                <ArrowPopperTop
                  position={`${
                    field === "text" ? "right-[30px] " : "left-[30px]"
                  }  mt-[5px] `}
                />

                <div className="pt-[5px] pb-[2px] px-[8px] grid grid-cols-[repeat(1,1fr)_auto] gap-2 flex items-center">
                  <PXInput
                  index={index}
                    value={dataHero()[field].size}
                    width={100}
                    borderColor="#5e636d"
                    textColor="white"
                    label="ขนาดข้อความ"
                    field={field}
                    miniField="size"
                    handleChange={handleChangeForNumber}
                    display={display.toLowerCase()}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        mt: "4.5px", // ให้เริ่มสูงเท่ากล่อง PX
                        height: 38, // สูงเท่ากล่อง PX

                        // จูนปุ่มทุกปุ่มใน Box ให้สูงเท่ากัน
                        "& .MuiButton-root": {
                          height: "100% !important", // บังคับให้เท่ากับ height ของ Box
                          boxShadow: "none",
                          borderTopLeftRadius: 0,
                          borderBottomLeftRadius: 0,
                        },

                        // ปุ่มขวาสุดให้มีมุมโค้งเหมือนเดิม
                        "& .MuiButton-root:last-of-type": {
                          borderTopRightRadius: 5,
                          borderBottomRightRadius: 5,
                        },
                      }}
                    >
                      <Btn
                        Icon={Bold}
                        noRadius={true}
                        backgroundColor={
                          dataHero()[field].bold ? "#454b57" : "#e5e5e5"
                        }
                        iconColor={dataHero()[field].bold ? "white" : "black"}
                        handleClick={() =>
                          setHero((prev) => {
                           const newHero = lodash.cloneDeep(prev)
                           newHero[display.toLowerCase()][index][field].bold = !newHero[display.toLowerCase()][index][field].bold
                           return newHero
                          })
                        }
                        borderColor="#5e636d"
                      />
                      <Btn
                        borderColor="#5e636d"
                        Icon={Palette}
                        openPopper={() =>
                          openElementPopper(field + "-TextColor")
                        }
                        backgroundColor={textColor}
                      />
                    </Box>
                  </PXInput>
                </div>
              </OptionPopper>
              <ColorPopper
                theme={theme}
                colors={colors}
                elementColor={dataHero()[field].color}
                position={field === "text" ? "top-end" : "top-start"}
                open={openElement === field + "-TextColor"}
                popperRef={ref.current}
                handleChange={(color) =>
                  handleChangeColor(color, field, "color")
                }
              />
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-12 gap-4 mt-5">
        {elements2.map(({ label, field }) => {

if(field === "imageTopLayer2" && display === "Mobile") {
  return null
}


      const pathName = (fullWidth)=>{
        return fullWidth.split("<>")[1]
      }

          const ref = useRef(null);
          const iconRef = useRef(null);
          const value = ["imageTopLayer1", "imageTopLayer2"].includes(field)
            ? pathName(dataHero()[field].image)
            : field === "backgroundImage"
            ? pathName(dataHero()[field])
            : dataHero()[field].text;
          const textColor =
            typeof dataHero().button.color === "string"
              ? dataHero().button.color
              : theme[dataHero().button.color?.type][
                  dataHero().button.color?.index
                ];
          const bgColor =
            typeof dataHero().button.backgroundColor === "string"
              ? dataHero().button.backgroundColor
              : theme[dataHero().button.backgroundColor?.type][
                  dataHero().button.backgroundColor?.index
                ];

          const img = [
            { miniField: "size", miniLabel: "ขนาด" },
            { miniField: "positionX", miniLabel: "ตำแหน่ง X" },
            { miniField: "positionY", miniLabel: "ตำแหน่ง Y" },
          ];

          

          return (
            <div className="col-span-3" key={field}>
              <Field
              setImgName={setImgName}
              index={index}
                openPopper1={() => {
                  openElementPopper(field);
                  setOpenIcon(false);
                  openColorPopper(false);
                }}
                noBtn={label === "ภาพพื้นหลัง"}
                openPopper2={() => {
                  setOpenIcon((prev) => !prev);
                  openElementPopper(false);
                  openColorPopper(false);
                }}
                popperRef={ref}
                popperRef2={iconRef}
                moreData={{
                  iconBtn: Settings,
                  icon: label === "ปุ่ม" ? dataHero().button.icon : null,
                }}
                disable={label !== "ปุ่ม"}
                isUpload={label !== "ปุ่ม"}
                label={label}
                field={field}
                value={value}
                handleChange={handleChange}
                miniField={label === "ปุ่ม" ? "text" : "image"}
                display={display.toLowerCase()}
              />

              <ColorPopper
                theme={theme}
                colors={colors}
                elementColor={dataHero().button.color}
                open={openElement === field + "-textColor" && label === "ปุ่ม"}
                popperRef={ref.current}
                handleChange={(color) =>
                  handleChangeColor(color, "button", "color")
                }
              />
              <ColorPopper
                theme={theme}
                colors={colors}
                elementColor={dataHero().button.backgroundColor}
                open={openElement === field + "-bgColor" && label === "ปุ่ม"}
                popperRef={ref.current}
                handleChange={(color) =>
                  handleChangeColor(color, "button", "backgroundColor")
                }
              />

              {label === "ปุ่ม" && (
                <OptionModal open={openElement === field} onClose={()=>setOpenElement(false)} header="แก้ไขปุ่ม" >
                   <div className="pt-[5px] pb-[2px] px-[8px] grid grid-cols-[repeat(1,1fr)_auto] gap-2 flex items-center">
                    <div className="col-span-1">
                      <PXInput
                      index={index}
                        value={dataHero().button.size}
                        width={100}
                        borderColor="#5e636d"
                        textColor="white"
                        label="ขนาดข้อความ"
                        field={field}
                        miniField="size"
                        handleChange={handleChangeForNumber}
                        display={display.toLowerCase()}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            mt: "4.5px", // ให้เริ่มสูงเท่ากล่อง PX
                            height: 38, // สูงเท่ากล่อง PX

                            // จูนปุ่มทุกปุ่มใน Box ให้สูงเท่ากัน
                            "& .MuiButton-root": {
                              height: "100% !important", // บังคับให้เท่ากับ height ของ Box
                              boxShadow: "none",
                              borderTopLeftRadius: 0,
                              borderBottomLeftRadius: 0,
                            },

                            // ปุ่มขวาสุดให้มีมุมโค้งเหมือนเดิม
                            "& .MuiButton-root:last-of-type": {
                              borderTopRightRadius: 5,
                              borderBottomRightRadius: 5,
                            },
                          }}
                        >
                          <Btn
                            Icon={Bold}
                            noRadius={true}
                            backgroundColor={
                              dataHero().button.bold ? "#454b57" : "#e5e5e5"
                            }
                            iconColor={
                              dataHero().button.bold ? "white" : "black"
                            }
                            handleClick={() =>
                              setHero((prev) => {
                                const newHero = lodash.cloneDeep(prev)
                                newHero[display.toLowerCase()][index][field].bold = !newHero[display.toLowerCase()][index][field].bold
                                return newHero
                              })
                            }
                            borderColor="#5e636d"
                          />
                          <Btn
                            borderColor="#5e636d"
                            Icon={Palette}
                            openPopper={() => {
                              openElementPopper(field + "-textColor");
                            }}
                            backgroundColor={textColor}
                          />
                        </Box>
                      </PXInput>
                    </div>
                    <div className="col-span-1 mt-[5px]">
                      <Field
                      index={index}
                        height={36}
                        width={120}
                        borderColor="#5e636d"
                        textColor="white"
                        moreData={{ iconBtn: Palette }}
                        disable={true}
                        label={`สีปุ่ม`}
                        value={bgColor}
                        openPopper1={() => {
                          openElementPopper(field + "-bgColor");
                        }}
                        backgroundColor={bgColor}
                      />
                    </div>
                  <div className="col-span-1">
                  <Field
                        index={index}
                          height={36}
                          width={180}
                          borderColor="#5e636d"
                          textColor="white"
                          label={`ลิงค์`}
                          field="button"
                          miniField="url"
                          value={dataHero().button.url || ""}
                          noBtn={true}  
                          display={display.toLowerCase()}
                          handleChange={handleChange}
                        />
                        
                  </div>
                  <div className="col-span-1">
                  <CheckInput
                         color="white"
                      label="แท็บใหม่"
                      field={"button"}
                      miniField="newTab"
                      display={display.toLowerCase()}
                      index={index}
                      heroData={dataHero()}
                      setHero={setHero}
                    />
                  </div>
                  </div>
                </OptionModal>
              )}
              {label !== "ปุ่ม" && (
                <OptionPopper
                  open={openElement === field}
                  popperRef={ref.current}
                  position={
                    field === "imageTopLayer2" ? "top-end" : "top-start"
                  }
                >
                  <ArrowPopperTop
                    position={`${
                      field === "imageTopLayer2"
                        ? "right-[30px] "
                        : "left-[30px]"
                    }  mt-[5px] `}
                  />
                  <div className="pt-[5px] pb-[2px] px-[8px] grid grid-cols-[1fr_1fr_auto] gap-2 flex items-center">
                    {img.map(({ miniField, miniLabel }) => (
                      <div className="col-span-1" key={miniField}>
                        <PXInput
                        index={index}
                          value={dataHero()[field][miniField]}
                          width={80}
                          borderColor="#5e636d"
                          textColor="white"
                          label={miniLabel}
                          field={field}
                          miniField={miniField}
                          handleChange={handleChangeForNumber}
                          display={display.toLowerCase()}
                        />
                      </div>
                    ))}
                  </div>
                </OptionPopper>
              )}
              {label === "ปุ่ม" && (
                <IconPopper
                  open={openIcon}
                  popperRef={iconRef.current}
                  icon={dataHero().button.icon}
                  handleChange={(icon) =>
                    handleChangeIcon(icon, "button", "icon")
                  }
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

function ColorPopper({
  theme,
  open,
  colors,
  popperRef,
  elementColor,
  handleChange,
  position = "top-start",
  opacity = null,
  handleOpct = null,
}) {
  const [opct, setOpct] = useState(opacity);

  useEffect(() => {
    setOpct(opacity);
  }, [opacity, open]);

  return (
    <Popper
      open={open}
      placement={position}
      anchorEl={popperRef}
      modifiers={[
        { name: "offset", options: { offset: [0, 7] } },
        { name: "flip", enabled: true },
        { name: "preventOverflow", options: { padding: 8 } },
      ]}
      disablePortal
      sx={{ zIndex: 1300 }}
    >
      <div className="w-[363px] rounded-md bg-[#454b57] POPPER px-[5px] pt-[8px] pb-[15px] mb-[5px]  flex flex-col gap-2 ">
        <ArrowPopperTop
          position={`${
            position === "top-end" ? "right-[30px]" : "left-[30px]"
          }  mb-[5px] `}
        />

        {opacity !== null && (
          <Range
            value={opct}
            min={0}
            max={255}
            step={1}
            handleChange={handleOpct}
          />
        )}

        <div className="grid grid-cols-10 place-items-center gap-[6px_0px]">
          {colors.map((color, i) => {
            const bgColor =
              typeof color === "string"
                ? color
                : theme[color.type][color.index];
            const value = color;
            let margin = "";

            if (i % 8 !== 0 && (i + 1) % 8 !== 0) {
              margin += `mx-[65.75px] `;
            }

            return (
              <div className={`col col-sapn-1 ${margin}`} key={i}>
                <button
                  className={`size-[25px] rounded-full border flex items-center justify-center`}
                  style={{ backgroundColor: bgColor }}
                  onClick={() => {
                    handleChange(value);
                  }}
                >
                  {(lodash.isEqual(elementColor, value) ||
                    elementColor === value) && (
                    <Check className={swatchSelectedCheckClassName(bgColor)} strokeWidth={4} />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </Popper>
  );
}

function IconPopper({ open, popperRef, icon, handleChange }) {
  return (
    <Popper
      open={open}
      placement="top-start"
      anchorEl={popperRef}
      modifiers={[
        { name: "offset", options: { offset: [0, 7] } },
        { name: "flip", enabled: true },
        { name: "preventOverflow", options: { padding: 8 } },
      ]}
      disablePortal
      sx={{ zIndex: 1300 }}
    >
      <ArrowPopperTop position={"left-[30px] mb-[5px]"} />
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
                    className={`size-4 text-${
                      icon === iconName ? "white" : "black"
                    }`}
                    strokeWidth={2.2}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </Popper>
  );
}

function OptionPopper({
  open,
  popperRef,
  width,
  children,
  position = "top-start",
}) {
  return (
    <Popper
      open={open}
      placement={position}
      anchorEl={popperRef}
      modifiers={[
        { name: "offset", options: { offset: [0, 7] } },
        { name: "flip", enabled: true },
        { name: "preventOverflow", options: { padding: 8 } },
      ]}
      disablePortal
      sx={{ zIndex: 1300 }}
    >
      <div
        className={`relative rounded-md dark:bg-white bg-[#454b57] px-[5px] pt-[10px] pb-[11px] mb-[5px] POPPER ${
          width || "w-auto"
        }`}
      >
        {children}
      </div>
    </Popper>
  );
}


function OptionModal({open,onClose,header,children}){
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
        backgroundColor: "white",
        borderRadius: 3,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div className="flex justify-between px-4 pt-3 pb-1">
        <div className="text-[15px] font-bold">
          <span className="text-red-600 dark:text-emerald-300">
            {header}
            </span>{" "}
        </div>
        <div>
          <a onClick={onClose} style={{ cursor: "pointer" }}>
            X
          </a>
        </div>
      </div>
      <div
        className={`border-b border-dotted border-gray-500/50 flex-1`}
      ></div>
      <div className="flex justify-center mt-4 text-[13px] ">
      {children}
      </div>

      <div className="flex justify-center my-4 pb-5">
      
      </div>
    </Box>
  </Fade>
</Modal>
)
}

const HeroDesign = ({ id, setOption, setHeroMobile, setNavOpen,mobilePage,updateHero,setUpdateHero, theme }) => {
  const design = {
    degree: 0,
    backgroundColor: "#ffffff",
    backgroundColorGradient: [
      { type: "mainColor", index: 0 },
      { type: "mainColor", index: 1 },
    ],
    opacity: 255,
    opacityGradient: [255, 255],
    isTitle: true,
    isGradient: false,
    isSubTitle: true,
    isText: true,
    isButton: true,
    isImageTopLayer: true,
    layout: "left",
    title: {
      text: "Explore The World Using Virtual Reality.",
      bold: true,
      size: 25,
      color: { type: "mainColor", index: 0 },
    },
    subTitle: {
      text: "From Ideas To Reality.",
      bold: true,
      size: 18,
      color: { type: "mainColor", index: 1 },
    },
    text: {
      text: "Duis aute Irure dolor in reprehenderit in voluptate velit esse cillum dolore fugiat nulla pariatur.",
      bold: false,
      size: 15,
      color: "#ffffff",
    },
    button: {
      text: "Discover More",
      bold: false,
      size: 15,
      color: "#ffffff",
      backgroundColor: { type: "mainColor", index: 0 },
      icon: "Bluetooth",
      url:"",
      newTab:false,
    },
    backgroundImage: "",
    imageTopLayer1: {
      image: "",
      positionX: 0,
      positionY: 0,
      size: 250,
    },
    imageTopLayer2: {
      image: "",
      positionX: 0,
      positionY: 0,
      size: 250,
    },
  };


  const [open,setOepn] = useState(false);
  const [imgName,setImgName] = useState("");



  useEffect(()=>{
    if(imgName !== ""){
      setOepn(true)
    }
  },[imgName])

  useEffect(()=>{
    if(!open){
      setImgName("")
    }
  },[open])


  const [desktopPage, setDesktopPage] = useState(0);





  const [hero, setHero] = useState({
    name: "",
    slideAmount: 1,
    desktop: Array.from({ length: 5 }, () => ({ ...design })),
    mobile: Array.from({ length: 5 }, () => ({...design,imageTopLayer1:{...design.imageTopLayer1,size:200},imageTopLayer2:{}})),
    divider: "-",
    dividerColor: "#ffffff",
    dividerPosition: 0,
    desktopHeight: 500,
    mobileHeight: 500,
  });


  useEffect(()=>{
    if(updateHero){
      setUpdateHero(false)
      const formData = new FormData();
      for(let [key,value] of Object.entries(hero)){
        if(["desktop","mobile"].includes(key)){
          formData.append(key, JSON.stringify(value))
        }else if(key === "dividerColor"){
          if(typeof value === "string"){
            formData.append(key, value)
          }else{
            formData.append(key, JSON.stringify(value))
          }

        }else if(!["updatedAt","createdAt","__v","_id"].includes(key)){
          formData.append(key, value)
        }
      }
      updateDesign(formData,id)
      .then((res)=>{console.log(res.data);})
      .catch((err)=>{console.log(err);})
      setOption("Hero")
    }
    
  },[updateHero])

  const loadHero = () => {
    getHero(id)
      .then((res) => setHero(res.data))
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    loadHero();
  }, []);

  useEffect(() => {
    setHeroMobile(hero);
  }, [hero]);

  const handleChange = (e, displayType = null,index=-1, miniField = null) => {
    const { name, value} = e.target;
    if (displayType) {
      const data = lodash.cloneDeep(hero);
      if (miniField) {
        data[displayType][index][name][miniField] = value;
      } else {
        data[displayType][index][name] = value;
      }
      console.log(data);
      setHero(prev => {
        return data
      });
    } else {
      setHero((prev) => {
        return { ...prev, [name]: value };
      });
    }
  };

  const handleChangeForNumber = (e, displayType = null,index=-1, miniField = null) => {
    const { name, value } = e.target;
    let newValue;
    if (value === "") newValue = "";
    else {
      newValue = Number(value);
      if (
        (name === "dividerPosition" ||
          ["positionX", "positionY"].includes(miniField)) &&
        value === "-"
      ) {
        newValue = value;
      }
      if (
        (isNaN(newValue) && value !== "-") ||
        (name !== "dividerPosition" &&
          !["positionX", "positionY"].includes(miniField) &&
          value.startsWith("-")) ||
        value.indexOf(".") !== -1
      )
        return;
    }

    const event = { target: { name, value: newValue } };
    handleChange(event, displayType,index, miniField);
  };

  const slides = Array.from({ length: 5 }, (_, i) => i + 1);

  const [display, setDisplay] = useState("Desktop");

  const [openDVD, setOpenDVD] = useState(false);
  const dvdRef = useRef(null);


  useEffect(()=>{
    function handleClick(e){
      const el = e.target
      const nearestPopper = el?.closest(".MuiPopper-root");
      const nearestButton = el?.closest('Button[name="POPPER-BTN"]');

      if (!nearestPopper && !nearestButton) {
        setOpenDVD(false)
      }
      
    }
    window.addEventListener("click",handleClick)
    return()=>{
      window.removeEventListener("click",handleClick)
    }
  },[openDVD])

  const openDivider = (n) => {
    if (openDVD === n) {
      setOpenDVD(false);
      return;
    }
    setOpenDVD(n);
  };


  const dvdColor =
    typeof hero.dividerColor === "string"
      ? hero.dividerColor
      : theme[hero.dividerColor?.type][hero.dividerColor?.index];

  const [allColors, setAllColors] = useState([]);
  const basicColors = THEME_PANEL_BASIC_COLOR_SWATCHES;

  useEffect(() => {
    if (allColors.length === 0 && theme) {
      setAllColors([]);
      theme?.mainColor.map((color, i) => {
        setAllColors((prev) => {
          return [...prev, { type: "mainColor", index: i }];
        });
      });
      theme?.textColor.map((color, i) => {
        setAllColors((prev) => {
          return [...prev, { type: "textColor", index: i }];
        });
      });
      theme?.otherColor.map((color, i) => {
        setAllColors((prev) => {
          return [...prev, { type: "otherColor", index: i }];
        });
      });
      basicColors.map((color) => {
        setAllColors((prev) => {
          return [...prev, color];
        });
      });
    } else return;
  }, [theme]);


  return (
    <main className="content-area flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden" area="main">

      <div className="w-full" style={{ height: hero.desktopHeight }}>
        <Swiper
          modules={[Navigation, Pagination]}
          navigation
          pagination={{ clickable: true, dynamicBullets: true }}
          loop
          className="w-full h-full mySwiper"
          style={{ overflow: "visible" }}
          onSlideChange={(swiper) => {
            setDesktopPage(swiper.realIndex);
          }}
        >
          {" "}
          {[0, 1, 2, 3, 4].map((_) => {
            if (_+1 <= hero.slideAmount) {
              return (
                <SwiperSlide>
                  {" "}
                  <HeroSlider
                    data={hero.desktop[_]}
                    divider={hero.divider}
                    theme={theme}
                    type="desktop"
                    dividerColor={hero.dividerColor}
                    dividerPosition={hero.dividerPosition}
                  />{" "}
                </SwiperSlide>
              );
            }  
            else {
              return null;
            }
          })}{" "}
        </Swiper>
      </div>
      <div className="min-h-[600px] rounded-xl border border-white/10 bg-white/5">
        <div className="container mx-auto relative z-10">
          <div className="mt-7" />
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-4">
              <MainLabel label={"จำนวนสไลด์"} />
              <RadioGroup
                row
                sx={{ gap: 4 }}
                value={hero.slideAmount}
                name="slideAmount"
                onChange={(e) => handleChangeForNumber(e)}
              >
                {slides.map((_) => (
                  <div key={_ - 1}>
                    <RadioInput label={_} value={_} />
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div className="col-span-2">
              <MainLabel label={"ความสูง Desktop"} />
              <PXInput
                value={hero.desktopHeight}
                field={"desktopHeight"}
                handleChange={handleChangeForNumber}
              />
            </div>
            <div className="col-span-2">
              <MainLabel label={"ความสูง Mobile"} />
              <PXInput
                value={hero.mobileHeight}
                field={"mobileHeight"}
                handleChange={handleChangeForNumber}
              />
            </div>
            <div className="col-span-3 ">
              <MainLabel label={"เส้นคั่น"} />
              <FormControl
                fullWidth
                variant="outlined"
                sx={{ ...COMMON_FIELD_SX(null, null, "100%", null, true) }}
              >
                <Select
                  onChange={(e) => {
                    handleChange(e);
                  }}
                  renderValue={(selected) => {
                    const isNoDivider = hero.divider === "-";
                    return isNoDivider ? (
                      <Box sx={{ color: "text.disabled" }}>ไม่มีเส้นคั่น</Box>
                    ) : (
                      <Box>{hero.divider}</Box>
                    );
                  }}
                  name="divider"
                  value={hero.divider}
                  label="เส้นคั่น"
                  MenuProps={{
                    // ย่อ padding + ฟอนต์ในเมนู
                    PaperProps: {
                      elevation: 0,
                      sx: {
                        boxShadow: "none",
                        "& .MuiList-root": { py: 0 }, // ลดช่องว่างบนลิสต์
                        "& .MuiMenuItem-root": {
                          height: 38, // ลดความสูงต่อแถว
                          py: 0.25, // บีบแนวตั้ง
                          px: 1.0, // บีบแนวนอน
                          fontSize: 13, // ย่อฟอนต์
                          gap: 0.5, // ระยะห่าง Checkbox กับข้อความ
                        },
                      },
                    },
                    MenuListProps: { dense: true }, // โหมดแน่น
                  }}
                >
                  {dividers.map((divider, i) => {
                    return (
                      <MenuItem value={divider} key={i} sx={{ fontSize: 13 }}>
                        <ListItemText
                          primary={divider === "-" ? "ไม่มีเส้นคั่น" : divider}
                        />
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </div>
            <div className="col-span-1 mt-8">
              <Btn
                Icon={Settings}
                isOnField={false}
                openPopper={() => openDivider("divider")}
                popperRef={dvdRef}
                height={38}
              />
              <OptionPopper
                open={openDVD === "divider"}
                popperRef={dvdRef.current}
                width="w-[240px]"
              >
                <ArrowPopperTop position={"right-[30px] mb-[1px]"} />
                <div className="pt-[5px] pb-[2px] px-[8px] grid grid-cols-[repeat(1,1fr)_auto] gap-2 flex items-center">
                  <div className="col-span-1">
                    <PXInput
                      value={hero.dividerPosition}
                      width={100}
                      borderColor="#5e636d"
                      textColor="white"
                      label="ตำแหน่ง"
                      field={"dividerPosition"}
                      handleChange={handleChangeForNumber}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          mt: "4.5px", // ให้เริ่มสูงเท่ากล่อง PX
                          height: 38, // สูงเท่ากล่อง PX

                          // จูนปุ่มทุกปุ่มใน Box ให้สูงเท่ากัน
                          "& .MuiButton-root": {
                            height: "100% !important", // บังคับให้เท่ากับ height ของ Box
                            boxShadow: "none",
                            borderTopLeftRadius: 0,
                            borderBottomLeftRadius: 0,
                          },

                          // ปุ่มขวาสุดให้มีมุมโค้งเหมือนเดิม
                          "& .MuiButton-root:last-of-type": {
                            borderTopRightRadius: 5,
                            borderBottomRightRadius: 5,
                          },
                        }}
                      >
                        <Btn
                          borderColor="#5e636d"
                          Icon={Palette}
                          openPopper={() => openDivider("dividerColor")}
                          backgroundColor={dvdColor}
                        />
                      </Box>
                    </PXInput>
                  </div>
                </div>
              </OptionPopper>
              <ColorPopper
                theme={theme}
                colors={allColors}
                position="top-end"
                elementColor={hero.dividerColor}
                open={openDVD === "dividerColor"}
                popperRef={dvdRef.current}
                handleChange={(color) => {
                  const e = { target: { name: "dividerColor", value: color } };
                  handleChange(e);
                  openDivider("divider")
                }}
              />
            </div>
          </div>
          <TabContext value={display}>
            <Box>
              <TabList
                onChange={(e, newValue) => {
                  setDisplay(newValue);
                  setOption(`HeroDesign-${newValue}`);
                  if (newValue === "Desktop") {
                    setNavOpen(false);
                  } else {
                    setNavOpen(true);
                  }
                }}
                TabIndicatorProps={{
                  sx: {
                    backgroundColor: "#676767", // สีเส้นใต้แท็บอันที่เลือก
                    height: 3, // ความหนาเส้น
                    borderRadius: 999, // ให้เส้นมน ๆ
                  },
                }}
              >
                {displays.map((dp) => (
                  <Tab
                    label={dp}
                    value={dp}
                    key={dp}
                    sx={{
                      backgroundColor: display === dp ? "#454b57" : "#b5b5b6",
                      color: "#454b57",
                      "&.Mui-selected": {
                        color: "white",
                      },
                    }}
                  />
                ))}
              </TabList>
            </Box>
            <div className="bg-gray-100">
              {displays.map((display) => (
                <TabPanel value={display} key={display}>
                  <Form
                  openDVD={openDVD}
                  setOpenDVD={setOpenDVD}
                  setImgName={setImgName}
                    theme={theme}
                    colors={allColors}
                    display={display}
                    hero={hero}
                    handleChange={handleChange}
                    handleChangeForNumber={handleChangeForNumber}
                    setHero={setHero}
                    index={display === "Desktop" ? desktopPage : mobilePage}
                  />
                </TabPanel>
              ))}
            </div>
          </TabContext>
          <div className="mt-7" />
        </div>
        <ImageModal setOpenModal={setOepn} openModal={open} name={imgName} handleChange={(imgPath)=>{
          handleChange({target:{name:imgName,value:imgPath}},display.toLowerCase(), display === "Desktop" ? desktopPage : mobilePage,imgName==="backgroundImage"?null:"image") 
        }}/>
      </div>
      <style>{`




      

.mySwiper .swiper-button-prev{
  margin-left:25px;
}
.mySwiper .swiper-button-next{
  margin-right:25px;
}


.mySwiper .swiper-button-next,
.mySwiper .swiper-button-prev{
  background-color: white; /* ใช้ตัวแปรที่ประกาศใน style */
  color:black;
  border-radius: 9999px;   
  width: 40px;
  height: 40px;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  stroke: currentColor;
  stroke-width: 2.5;
}

.mySwiper .swiper-pagination-bullet {
  background-color: white;
  width: 12px;
  height: 12px;
  opacity: 0.5;         /* จุดปกติจางลง */
}

.mySwiper .swiper-pagination-bullet-active {
  opacity: 1 !important; /* จุดที่เลือกชัดเต็ม */
}

.mySwiper .swiper-pagination {
  bottom: 20px !important;  /* ยิ่งเลขมาก ยิ่งห่างจากขอบล่างมาก (เลื่อนขึ้น) */
}

      `}</style>
    </main>
  );
};

export default HeroDesign;
