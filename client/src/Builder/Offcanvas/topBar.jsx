import { useEffect, useState, useRef, useCallback,memo } from "react";
import { getTheme } from "../../../Functions/theme";
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
  Select,
  MenuItem,
  ListItemText,
  OutlinedInput,
  Grow,
  Slide,
  ButtonGroup,
  Tab,
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary
} from "@mui/material";

import { TabContext, TabList, TabPanel } from "@mui/lab";
import lodash, { isNull, set } from "lodash";
import {
  Minus,
  Plus,
  ChevronDown,
  Check,
  Palette,
  ImageOff,
  Trash2,
  Image,
  Home,
} from "lucide-react";
import { use } from "react";
import Popper from "@mui/material/Popper";
import { styled } from "@mui/material/styles";
import Switch from "@mui/material/Switch";
import IconLucide from "../../IconLucide";
import Stack from "@mui/material/Stack";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import ServiceColor from "../Services/ServiceColor";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faHouse, faGear } from "@fortawesome/free-solid-svg-icons";
import {
  faFacebook,
  faGithub,
  faLine,
  faGoogle,
  faApple,
} from "@fortawesome/free-brands-svg-icons";
import ServiceIcon from "../ServiceIcon";
import IconAwsome from "../IconAwsome";
import { THEME_PANEL_BASIC_COLOR_SWATCHES } from "../themePanelBasicColors";
const TOPBAR_GRADIENT_STOPS = [
  { value: "start", label: "จุดเริ่ม" },
  { value: "end", label: "จุดสิ้น" },
];
const TOPBAR_DISPLAY_LAYOUT_OPTIONS = [
  { value: true, label: "ความกว้างเต็มจอ" },
  { value: false, label: "ความกว้างมาตรฐาน" },
];
const TOPBAR_FALLBACK_ICON = { type: "fas", name: "faHouse" };
const normalizeTopBarIcon = (icon) =>
  icon?.name && icon.name !== "fa0" ? icon : TOPBAR_FALLBACK_ICON;
const CHIP_BORDER = "#e2e8f0";
const CHIP_BORDER_DARK = "rgba(255, 255, 255, 0.1)";
const CHIP_BG = "#ffffff";
const CHIP_BG_HOVER = "#f8fafc";
const CHIP_BG_DARK = "rgba(30, 41, 59, 0.9)";
const CHIP_BG_DARK_HOVER = "rgba(30, 41, 59, 1)";
const OPTION_CHIP_RADIUS = "0.375rem";

const topBarGroupButtonSx = (selected, accent) => {
  const a = accent || "#0d9488";
  return {
    flex: 1,
    fontSize: 11,
    minHeight: 34,
    py: 0.75,
    px: 0.5,
    textTransform: "none",
    lineHeight: 1.25,
    boxShadow: "none",
    ...(selected
      ? {
          backgroundColor: a,
          color: "#fff",
          borderColor: "transparent",
          "&:hover": { backgroundColor: a, borderColor: "transparent" },
        }
      : {
          color: "#1e293b",
          borderColor: `${CHIP_BORDER} !important`,
          backgroundColor: CHIP_BG,
          "&:hover": {
            borderColor: `${CHIP_BORDER} !important`,
            backgroundColor: CHIP_BG_HOVER,
          },
          ".dark &": {
            color: "#f1f5f9",
            borderColor: `${CHIP_BORDER_DARK} !important`,
            backgroundColor: CHIP_BG_DARK,
            "&:hover": {
              borderColor: `${CHIP_BORDER_DARK} !important`,
              backgroundColor: CHIP_BG_DARK_HOVER,
            },
          },
        }),
  };
};

const topBarGroupRootSx = {
  width: "100%",
  boxShadow: "none",
  "& .MuiButton-root": { boxShadow: "none" },
  "& .MuiButtonGroup-grouped": { borderRadius: "0 !important" },
  "& .MuiButtonGroup-grouped:first-of-type": {
    borderTopLeftRadius: `${OPTION_CHIP_RADIUS} !important`,
    borderBottomLeftRadius: `${OPTION_CHIP_RADIUS} !important`,
  },
  "& .MuiButtonGroup-grouped:last-of-type": {
    borderTopRightRadius: `${OPTION_CHIP_RADIUS} !important`,
    borderBottomRightRadius: `${OPTION_CHIP_RADIUS} !important`,
  },
  "& .MuiButtonGroup-grouped.MuiButton-outlined": {
    borderColor: `${CHIP_BORDER} !important`,
  },
  "& .MuiButtonGroup-grouped.MuiButton-outlined:not(:last-of-type)": {
    borderRightColor: `${CHIP_BORDER} !important`,
  },
  ".dark & .MuiButtonGroup-grouped.MuiButton-outlined": {
    borderColor: `${CHIP_BORDER_DARK} !important`,
  },
  ".dark & .MuiButtonGroup-grouped.MuiButton-outlined:not(:last-of-type)": {
    borderRightColor: `${CHIP_BORDER_DARK} !important`,
  },
};

const COMMON_FIELD_SX = (
  hasChildren,
  hasBtn,
  darkMode,
  height = 35,
  fontSize = 12,
  borderColorOverride = null
) => {
  const isDark = darkMode === "dark";

  const radiusRight = hasChildren ? 0 : 5;
  const borderRight = hasChildren ? 0 : 1;
  const radiusLeft = hasBtn ? 0 : 5;
  const borderLeft = hasBtn ? 0 : 1;

  const borderColor =
    borderColorOverride || (isDark ? "#494d54" : "rgba(0,0,0,0.23)");
  const textColor = isDark ? "#ffffff" : "#18181b";
  const bgcolor = "none" // เหมือน SocialList

  const outlineStyle = {
    borderColor,
    borderWidth: 1,
    borderTopRightRadius: radiusRight,
    borderBottomRightRadius: radiusRight,
    borderRightWidth: borderRight,
    borderTopLeftRadius: radiusLeft,
    borderBottomLeftRadius: radiusLeft,
    borderLeftWidth: borderLeft,
  };

  return {
    "& .MuiOutlinedInput-root": {
      height,
      backgroundColor: bgcolor,
      alignItems: "center",
      padding: 0,
      borderTopRightRadius: radiusRight,
      borderBottomRightRadius: radiusRight,
      borderTopLeftRadius: radiusLeft,
      borderBottomLeftRadius: radiusLeft,
      overflow: "hidden",

      "& fieldset": outlineStyle,
      "&:hover fieldset": outlineStyle,
      "&.Mui-focused fieldset": outlineStyle,
      "&.Mui-error fieldset": outlineStyle,
    },

    "& .MuiOutlinedInput-input": {
      fontSize,
      color: textColor,
      padding: "0 12px",
      height: "100%",
      boxSizing: "border-box",
      backgroundColor: bgcolor,
      WebkitTextFillColor: textColor,

      "&:-webkit-autofill": {
        WebkitBoxShadow: `0 0 0 1000px ${bgcolor} inset`,
        WebkitTextFillColor: textColor,
        caretColor: textColor,
        borderRadius: 0,
        transition: "background-color 9999s ease-out 0s",
      },
      "&:-webkit-autofill:hover": {
        WebkitBoxShadow: `0 0 0 1000px ${bgcolor} inset`,
        WebkitTextFillColor: textColor,
      },
      "&:-webkit-autofill:focus": {
        WebkitBoxShadow: `0 0 0 1000px ${bgcolor} inset`,
        WebkitTextFillColor: textColor,
      },
    },
  };
};

const SelectInput = ({
  name,
  value,
  handChange,
  array,
  darkMode,
  fontSize = 13,
}) => {
  const textColor = darkMode === "dark" ? "#ffffff" : "#050505";
  const borderColor = darkMode === "dark" ? "#494d55" : "#cbd5e1";
  const bgcolor = darkMode === "dark" ? "#27272a" : "#ffffff";
  const selectStyle = {
    "& .MuiTypography-root": { fontSize, color: textColor },
    "& .MuiSvgIcon-root": { color: textColor },

    "& .MuiSelect-select": {
      height: 35,
      display: "flex",
      alignItems: "center",
      py: 0,
      bgcolor,
    },

    // ✅ รวมทุกสถานะของ notchedOutline ให้เหมือนกัน
    "& .MuiOutlinedInput-notchedOutline, \
     & .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline, \
     & .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline, \
     & .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline": {
      borderWidth: 1,
      borderColor,
    },
  };
  return (
    <FormControl fullWidth sx={selectStyle}>
      <Select
        name={name}
        value={value}
        onChange={handChange}
        input={<OutlinedInput notched={false} />} // ✅ ปิด notch ให้ขอบไม่แหว่ง
        MenuProps={{
          PaperProps: {
            elevation: 0,
            sx: {
              boxShadow: "none",
              borderRadius: 1,
              border: 1,
              borderColor: borderColor,
              "& .MuiList-root": { py: 0, bgcolor },
              "& .MuiMenuItem-root": {
                height: 35,
                py: 0.25,
                px: 1.0,
                fontSize,
                gap: 0.5,
                borderBottom: 1,
                borderBottomColor: borderColor,
                ":last-child": {
                  borderBottom: 0,
                },
              },
            },
          },
          MenuListProps: { dense: true },
        }}
      >
        {array.map((a, i) => {
          const label = a?.label || a;
          const value = a?.value || a;
          return (
            <MenuItem
              value={value}
              key={i}
              sx={{
                "& .MuiTypography-root": { fontSize: 13, color: textColor },
              }}
            >
              <ListItemText primary={label} />
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
};

const Range = ({
  name,
  value,
  min,
  max,
  step,
  handleChange,
  darkTextColor,
  darkMode,
  index = -1,
  mainField = null,
}) => {
  const [newValue, setNewValue] = useState(value);

  useEffect(() => {
    setNewValue(value);
  }, [value]);

  let pos = ((newValue - min) / (max - min)) * 100;

  return (
    <div className="pb-[2px] px-[5px]">
      <input
        type="range"
        min={min}
        max={max}
        value={newValue}
        step={step}
        onChange={(e) => {
          const v = Number(e.target.value);
          setNewValue(v);
          handleChange?.(name, v, index, mainField);
        }}
        className={`
          w-full cursor-pointer appearance-none h-2 rounded-full
          bg-zinc-200
          dark:bg-zinc-700

          theme-range-fill-track

          [&::-webkit-slider-runnable-track]:border-0
          [&::-moz-range-track]:border-0

          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-slate-900
          dark:[&::-webkit-slider-thumb]:bg-emerald-300
          [&::-webkit-slider-thumb]:border-0
          [&::-webkit-slider-thumb]:cursor-pointer

          [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4
          [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-emerald-300
          [&::-moz-range-thumb]:border-0
          [&::-moz-range-thumb]:cursor-pointer
        `}
        style={{
          ["--pos"]: `${pos}%`,
          ["--fill"]: darkMode ? darkTextColor : "black",
        }}
      />
    </div>
  );
};

const NumberInput = ({ value, field, handChange, plus, minus }) => {
  return (
    <div className="relative w-auto rounded-md border border-zinc-400 dark:border-gray-500/50 bg-white dark:bg-zinc-800 px-2 py-1 text-sm text-zinc-900 focus-within:border-zinc-500 flex items-center justify-center w-[160px] mb-[5px] h-[35px]">
      <div className="absolute pr-2 -left-px">
        <button
          className="bg-transparent flex items-center justify-center rounded-md"
          onClick={(e) => handChange(field, minus)}
        >
          <Minus className="size-3 m-[10px] text-dark dark:text-white" />
        </button>
      </div>
      <input
        className="text-dark dark:text-white bg-transparent w-full text-center text-[14px] outline-none focus:outline-none focus:ring-0 focus-visible:outline-none appearance-none"
        value={value ?? ""}
        onChange={(e) => handChange(field, e.target.value)}
      />
      <div className="absolute pr-2 -right-px">
        <button
          className=" bg-transparent flex items-center justify-center rounded-md"
          onClick={(e) => handChange(field, plus)}
        >
          <Plus className="size-3 m-[10px] text-dark dark:text-white" />
        </button>
      </div>
    </div>
  );
};


const FieldLabel = ({label,color})=>{
  return(
<Typography sx={{fontSize:12,marginTop:1.5,marginRight:0,color}}>{label}</Typography>   
  )
}

function Btn({
  handleClick,
  radius = "normal",
  icon = null,
  text = "",
  lastChild = false,
  height = 35,
  bgColor = "#454b58",
  borderColor = "#A1A1AA",
  color = "white",
  iconSize=16,
  hideBorder = false,
}) {
  const radiusRArr = {
    normal: 5,
    noL: 5,
    noR: 0,
    noAll: 0,
  };
  const radiusLArr = {
    normal: 5,
    noR: 5,
    noL: 0,
    noAll: 0,
  };

  const borderRight = lastChild ? 1 : 0;

  const size = (15 * height) / 35;

  return (
    <Button
      onClick={handleClick}
      variant="contained"
      sx={{
        boxShadow: "none", // 1) เอาเงาออก
        outline: "none", // เอา outline/focus ring ออก
        boxSizing: "border-box", // ให้ background อยู่ภายใน border
        overflow: "hidden", // ป้องกัน background เลยออกจาก border
        aspectRatio: "1 / 1",
        height,
        minHeight: height,
        width: height,
        minWidth: height,
        borderTopLeftRadius: radiusLArr[radius],
        borderBottomLeftRadius: radiusLArr[radius],
        borderTopRightRadius: radiusRArr[radius],
        borderBottomRightRadius: radiusRArr[radius],
        // 2) ให้ปุ่มมี "กรอบ" แบบเดียวกับ TextField
        border: "1px solid",
        borderColor: hideBorder ? "transparent" : borderColor,
        borderRightWidth: hideBorder ? 0 : borderRight,
        borderLeftWidth: hideBorder ? 0 : 1,

        // (ตัวเลือก) ถ้าไม่อยากให้มีเส้นหนาตรงรอยต่อกลาง
        // ให้ตัดเส้นซ้ายของปุ่มออก จะเหลือเส้นของ TextField ฝั่งเดียวพอดี
        // borderLeftWidth: 0,

        // สีพื้นหลังของปุ่ม = สีที่เลือก
        bgcolor: bgColor,
        "&:hover": {
          bgcolor: bgColor,
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

{icon &&   <IconAwsome
                style={{color,fontSize:size}}
                iconType={icon.type}
                iconName={icon.name}
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
          ></Box>
     
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

function FieldWithBtn({
  name,
  value,
  darkMode,
  handleChange,
  handleClick,
  icon = null,
  children,
}) {
  return (
    <FormControl fullWidth>
      <Box sx={{ display: "flex", width: "100%", alignItems: "stretch" }}>
        <Btn
          radius="noR"
          icon={icon}
          bgColor={darkMode === "dark" ? "#494d54" : "#A1A1AA"}
          handleClick={handleClick}
        />
        <TextField
          sx={COMMON_FIELD_SX(Boolean(children), true, darkMode)}
          fullWidth
          name={name}
          value={value}
          onChange={handleChange}
        />
        {children && (
          <Box sx={{ display: "flex", alignItems: "stretch" }}>{children}</Box>
        )}
      </Box>
    </FormControl>
  );
}

function Field({
  name,
  value,
  handleChange,
  darkMode,
  children,
  placeholder = "",
  borderColor = null,
}) {
  return (
    <FormControl fullWidth>
      <Box sx={{ display: "flex", width: "100%" }}>
        <TextField
          sx={COMMON_FIELD_SX(Boolean(children), false, darkMode, 35, 12, borderColor)}
          fullWidth
          name={name}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          type={name === "url" ? "url" : "text"}
        />
        {children && (
          <Box sx={{ display: "flex", alignItems: "center" }}>{children}</Box>
        )}
      </Box>
    </FormControl>
  );
}

  function SocialList({
    item,
    index,
    isOpen,
    darkMode,
    darkTextColor,
    onToggle,
    onFieldChange,
    onRangeChange,
    onSelectChange,
    onCopy,
    onRemove,
    colors,
  }) {
    const { icon, url, iconSize } = item;
    const safeIcon = normalizeTopBarIcon(icon);
    const [socialColorMode, setSocialColorMode] = useState("bg");

    const [openIconModal,setOpenIconMoal] = useState(false)






    const bgMenu = darkMode === "dark" ? "#27272a" : "#fafafa";
    const bgMenuOption = darkMode === "dark" ? "#27272a" : "#ffffff";
    const borderColor = darkMode === "dark" ? "#494d54" : "#e5e5e5";
    const textColor = darkMode === "dark" ? "#ffffff" : "#202020";

    const menuButtons = [
      { Icon: { type: "far", name: "faCopy" }, funct: onCopy },
      { Icon: { type: "far", name: "faCircleXmark" }, funct: onRemove },
    ];

    const MenuButton = ({ Icon, funct }) => (
      <Btn
        handleClick={() => funct(index,"iconGroup")}
        icon={Icon}
        lastChild={true}
        height={28}
        bgColor={darkMode === "dark" ? "#494D54" : "#ececec"}
        borderColor={darkMode === "dark" ? "#494D54" : "#e5e5e5"}
        color={darkMode === "dark" ? "#ffffff" : "#505050"}
      />
    );

    return (
      <Box sx={{ my: 1, cursor: "pointer" }}>
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
            expandIcon={null}
            component="div"
            sx={{
              cursor: "pointer !important",
              height: 45,
              minHeight: 35,
              backgroundColor: bgMenu,
              border: 0,
              borderRadius: 1,
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
            <span style={{ display: "inline-flex" }}></span>
            <Btn handleClick={()=>{
              setOpenIconMoal(true)
            }} icon={safeIcon} hideBorder bgColor={darkMode === "dark" ? "#494d54" : "#333333"} height={30}/>
            
            <Typography
              noWrap
              sx={{
                ml: 2,
                fontSize: 12,
                flex: 1,
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                color: textColor,
              }}
            >
              {url || "Link URL"}
            </Typography>

            <Box
              sx={{
                ml: 2,
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
              onClick={(e) => {
                e.preventDefault();
                onToggle(index);
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
                "&:hover": {
                  backgroundColor: "transparent",
                },
              }}
            >
              <ChevronDown
                size={16}
                style={{
                  color: darkMode === "dark" ? "#ffffff" : "#202020",
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 150ms ease",
                }}
              />
            </Box>
          </AccordionSummary>

          <AccordionDetails
            sx={{
              backgroundColor: bgMenuOption,
              borderRadius: 1,
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
            }}
          >
            <div className="grid grid-cols-12 items-center">
              <div className="col-span-12">
                <Field
                  name="url"
                  value={url}
                  handleChange={(e) => onFieldChange(e, index, "iconGroup")}
                  darkMode={darkMode}
                  placeholder="Link URL"
                  borderColor={darkMode === "dark" ? "#494D54" : "#e5e5e5"}
                />
              </div>
            </div>

            <div className="grid grid-cols-2">
              <div className="col col-span-2 ml-[5px] mr-[5px]">
                <div className="flex items-center gap-2 mt-5 mb-1">
                  <span className="text-dark dark:text-white/80 text-[13px] font-bold">
                    ขนาดไอคอน
                  </span>
                  <span className="text-[13px] text-slate-400">
                    {iconSize}
                  </span>
                  <div className="border-b border-slate-200 dark:border-white/15 flex-1"></div>
                </div>

                <Range
                  darkMode={darkMode}
                  darkTextColor={darkTextColor}
                  name="iconSize"
                  value={iconSize}
                  min={14}
                  max={30}
                  step={1}
                  handleChange={onRangeChange}
                  index={index}
                  mainField="iconGroup"
                />
              </div>
            </div>

            <>
              <div className="grid grid-cols-12 mt-3">
                <div className="col-span-12">
                  <ButtonGroup
                    fullWidth
                    variant="outlined"
                    disableElevation
                    color="inherit"
                    aria-label="เลือกสีโซเชียล"
                    sx={{ ...topBarGroupRootSx, mb: 0.5 }}
                  >
                    {[
                      { value: "bg", label: "สีพื้นหลัง", field: "bgColor" },
                      { value: "icon", label: "สีไอคอน", field: "iconColor" },
                    ].map((opt) => {
                      const selected = socialColorMode === opt.value;
                      return (
                        <Button
                          key={opt.value}
                          color="inherit"
                          onClick={() => setSocialColorMode(opt.value)}
                          sx={topBarGroupButtonSx(
                            selected,
                            darkMode === "dark" ? darkTextColor : "#000000"
                          )}
                        >
                          {opt.label}
                        </Button>
                      );
                    })}
                  </ButtonGroup>
                </div>
                <div className="col-span-12">
                  <div className="-mt-1">
                  {(() => {
                    const selectedField =
                      socialColorMode === "icon" ? "iconColor" : "bgColor";
                    const selectedItem =
                      colors.find((item) => item.field === selectedField) ?? colors[0];
                    if (!selectedItem) return null;
                    return (
                      <ServiceColor
                        color={selectedItem.data}
                        opacity={selectedItem.opacity}
                        handleColor={(value) =>
                          onSelectChange(value, selectedItem.field, index, "iconGroup")
                        }
                        handleOpacity={(e) =>
                          onRangeChange(
                            selectedItem.opacityField,
                            Number(e.target.value),
                            index,
                            "iconGroup"
                          )
                        }
                        rangeColor={darkMode === "dark" ? darkTextColor : "#000000"}
                        darkMode={darkMode}
                      />
                    );
                  })()}
                  </div>
                </div>
              </div>
            </>
          </AccordionDetails>
        </Accordion>
        <ServiceIcon header="ไอคอน" icon={safeIcon} open={openIconModal} onClose={()=>setOpenIconMoal(false)} darkMode={darkMode} darkColor={darkTextColor} handleChange={(icon)=>{
          onFieldChange({target:{name:"icon",value:icon}},index,"iconGroup")
        }}/>
      </Box>
    );

  }

  function TextList({
    item,
    index,
    isOpen,
    darkMode,
    darkTextColor,
    onToggle,
    onFieldChange,
    onRangeChange,
    onSelectChange,
    onCopy,
    onRemove,
    colors,
  }) {
    const { text, textSize, icon, iconSize } = item;
    const safeIcon = normalizeTopBarIcon(icon);
    const [textIconColorMode, setTextIconColorMode] = useState("bg");


    const [openIconModal,setOpenIconMoal] = useState(false)






    const bgMenu = darkMode === "dark" ? "#27272a" : "#fafafa";
    const bgMenuOption = darkMode === "dark" ? "#27272a" : "#ffffff";
    const borderColor = darkMode === "dark" ? "#494d54" : "#e5e5e5";
    const textColor = darkMode === "dark" ? "#ffffff" : "#202020";

    const menuButtons = [
      { Icon: { type: "far", name: "faCopy" }, funct: onCopy },
      { Icon: { type: "far", name: "faCircleXmark" }, funct: onRemove },
    ];

    const MenuButton = ({ Icon, funct }) => (
      <Btn
        handleClick={() => funct(index,"textGroup")}
        icon={Icon}
        lastChild={true}
        height={28}
        bgColor={darkMode === "dark" ? "#494D54" : "#ececec"}
        borderColor={darkMode === "dark" ? "#494D54" : "#e5e5e5"}
        color={darkMode === "dark" ? "#ffffff" : "#505050"}
      />
    );

    return (
      <Box sx={{ my: 1, cursor: "pointer" }}>
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
            expandIcon={null}
            component="div"
            sx={{
              cursor: "pointer !important",
              height: 45,
              minHeight: 35,
              backgroundColor: bgMenu,
              border: 0,
              borderRadius: 1,
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
            <span style={{ display: "inline-flex" }}></span>

            <Btn handleClick={()=>{
              setOpenIconMoal(true)
            }} icon={safeIcon} hideBorder bgColor={darkMode === "dark" ? "#494d54" : "#333333"} height={30}/>

          
            
            <Typography
              noWrap
              sx={{
                ml: 2,
                fontSize: 12,
                flex: 1,
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                color: textColor,
              }}
            >
              {text || "Bangkok Thailand"}
            </Typography>

            <Box
              sx={{
                ml: 2,
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
              onClick={(e) => {
                e.preventDefault();
                onToggle(index);
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
                "&:hover": {
                  backgroundColor: "transparent",
                },
              }}
            >
              <ChevronDown
                size={16}
                style={{
                  color: darkMode === "dark" ? "#ffffff" : "#202020",
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 150ms ease",
                }}
              />
            </Box>
          </AccordionSummary>

          <AccordionDetails
            sx={{
              backgroundColor: bgMenuOption,
              borderRadius: 1,
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
            }}
          >
            <div className="grid grid-cols-12">
              <div className="col-span-12">
                <Field
                  name="text"
                  value={text}
                  handleChange={(e) => onFieldChange(e, index, "textGroup")}
                  darkMode={darkMode}
                  borderColor={darkMode === "dark" ? CHIP_BORDER_DARK : CHIP_BORDER}
                />
              </div>
            </div>

          <div className="grid grid-cols-2">
              <div className="col col-span-2 ml-[5px] mr-[5px]">
                <div className="flex items-center gap-2 mt-5 mb-3">
                  <span className="text-dark dark:text-white/80 text-[13px] font-bold">
                    ขนาดข้อความ
                  </span>
                  <span className="text-[13px]" style={{ color: "#94a3b8" }}>
                    {textSize}
                  </span>
                  <div className="border-b border-slate-200 dark:border-white/15 flex-1"></div>
                </div>

                <Range
                  darkMode={darkMode}
                  darkTextColor={darkTextColor}
                  name="textSize"
                  value={textSize}
                  min={11}
                  max={20}
                  step={1}
                  handleChange={onRangeChange}
                  index={index}
                  mainField="textGroup"
                />
              </div>
            </div>

            <>
              <div className="grid grid-cols-12 mt-3">
                <div className="col-span-12">
                  <ButtonGroup
                    fullWidth
                    variant="outlined"
                    disableElevation
                    color="inherit"
                    aria-label="เลือกสีข้อความและไอคอน"
                    sx={{ ...topBarGroupRootSx, mb: 0.5 }}
                  >
                    {[
                      { value: "bg", label: "สีพื้นหลัง", field: "bgColor" },
                      { value: "icon", label: "สีไอคอน", field: "iconColor" },
                      { value: "text", label: "สีข้อความ", field: "textColor" },
                    ].map((opt) => {
                      const selected = textIconColorMode === opt.value;
                      return (
                        <Button
                          key={opt.value}
                          color="inherit"
                          onClick={() => setTextIconColorMode(opt.value)}
                          sx={topBarGroupButtonSx(
                            selected,
                            darkMode === "dark" ? darkTextColor : "#000000"
                          )}
                        >
                          {opt.label}
                        </Button>
                      );
                    })}
                  </ButtonGroup>
                  <div className="-mt-1">
                    {(() => {
                      const selectedField =
                        textIconColorMode === "icon"
                          ? "iconColor"
                          : textIconColorMode === "text"
                            ? "textColor"
                            : "bgColor";
                      const selectedItem =
                        colors.find((item) => item.field === selectedField) ?? colors[0];
                      if (!selectedItem) return null;
                      return (
                        <ServiceColor
                          color={selectedItem.data}
                          opacity={selectedItem.opacity}
                          handleColor={(value) =>
                            onSelectChange(value, selectedItem.field, index, "textGroup")
                          }
                          handleOpacity={(e) =>
                            onRangeChange(
                              selectedItem.opacityField,
                              Number(e.target.value),
                              index,
                              "textGroup"
                            )
                          }
                          rangeColor={darkMode === "dark" ? darkTextColor : "#000000"}
                          darkMode={darkMode}
                        />
                      );
                    })()}
                  </div>
                </div>
              </div>
            </>

            <div className="grid grid-cols-2">
              <div className="col col-span-2 ml-[5px] mr-[5px]">
                <div className="flex items-center gap-2 mt-5 mb-3">
                  <span className="text-dark dark:text-white/80 text-[13px] font-bold">
                    ขนาดไอคอน
                  </span>
                  <span className="text-[13px]" style={{ color: "#94a3b8" }}>
                    {iconSize}
                  </span>
                  <div className="border-b border-slate-200 dark:border-white/15 flex-1"></div>
                </div>

                <Range
                  darkMode={darkMode}
                  darkTextColor={darkTextColor}
                  name="iconSize"
                  value={iconSize}
                  min={14}
                  max={30}
                  step={1}
                  handleChange={onRangeChange}
                  index={index}
                  mainField="textGroup"
                />
              </div>
            </div>

          </AccordionDetails>
        </Accordion>
        <ServiceIcon header="ไอคอน" icon={safeIcon} open={openIconModal} onClose={()=>setOpenIconMoal(false)} darkMode={darkMode} darkColor={darkTextColor} handleChange={(icon)=>{
          onFieldChange({target:{name:"icon",value:icon}},index,"textGroup")
        }}/>
      </Box>
    );

  }


const TopBarOffcanvas = ({
  topBar,
  updateTopBar: onUpdate,
  close,
  darkMode,
  darkTextColor,
  device,
}) => {
  const AntSwitch = styled(Switch)(({ theme }) => ({
    width: 28,
    height: 16,
    padding: 0,
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
          backgroundColor: darkMode === "dark" ? darkTextColor : "#000000",
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

  const VisuallyHiddenInput = styled("input")({
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1,
  });

  const [data, setData] = useState(topBar);
  const [menu, setMenu] = useState("Social");
  const isTablet = device === "Tablet";
  const tabletTopBarMode = data?.tabletTopBarMode || "social";

  const [openColorTable, setOpenColorTable] = useState(-1);
  const [updated, setUpdated] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorElGradient, setAnchorElGradient] = useState(null);
  const anchorRef = useRef(null);
  const anchorRefGradient = useRef(null);

  useEffect(() => {
    setData(lodash.cloneDeep(topBar));
    setUpdated(false);
  }, [topBar]);


  const menus = [
    { value: "Social", lable: "โซเชียล" },
    { value: "Text", lable: "ข้อความ" },
  ];

  const changeTabletTopBarMode = (mode) => {
    setData((prev) => ({ ...prev, tabletTopBarMode: mode }));
    setUpdated(true);
  };

  useEffect(() => {
    if (!isTablet) return;
    const nextMenu =
      tabletTopBarMode === "social"
        ? "Social"
        : tabletTopBarMode === "text"
          ? "Text"
          : "__OFF__";
    if (menu !== nextMenu) setMenu(nextMenu);
  }, [isTablet, tabletTopBarMode, menu]);


  const {
    ableLeft,
    topBarHeight,
    isFluidLayout = false,
    isGradient,
    bgColor,
    bgOpacity,
    bgColorGradient,
    bgOpacityGradient,
    bgDegree,
    borderSize,
    radius,
    iconGroup,

    ableRight,
    radiusText,
    borderTextSize,
    textGroup,
  } = data;

  const rangeValue = [
    {
      label: "ขนาดกรอบ",
      name: "borderSize",
      data: borderSize,
      min: 26,
      max: 35,
      step: 1,
    },
    {
      label: "ความโค้งมน",
      name: "radius",
      data: radius,
      min: 0,
      max: 50,
      step: 1,
    },
  ];

  const rangeValue2 = [
    {
      label: "ขนาดกรอบ",
      name: "borderTextSize",
      data: borderTextSize,
      min: 26,
      max: 35,
      step: 1,
    },
    {
      label: "ความโค้งมน",
      name: "radiusText",
      data: radiusText,
      min: 0,
      max: 50,
      step: 1,
    },
  ];



  const toggleColorTable = (n) => {
    setOpenColorTable(n === openColorTable?-1:n)
  };

  const handleChange = useCallback((e, index = -1, mainField = null) => {
    const { name, value } = e.target;
  
    setData((prev) => {
      if (index !== -1 && mainField) {
        const nextGroup = [...prev[mainField]];
        nextGroup[index] = {
          ...nextGroup[index],
          [name]: value,
        };
        return { ...prev, [mainField]: nextGroup };
      }
      if (index !== -1 && !mainField) {
        const nextGroup = [...prev[name]];
        nextGroup[index] = value
        return { ...prev, [name]: nextGroup };
      }
  
      return { ...prev, [name]: value };
    });
  
    setUpdated(true);
  }, []);


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

  const changeTopBarDisplayLayout = (value) => {
    setData((prev) => ({ ...prev, isFluidLayout: value === true }));
    setUpdated(true);
  };


  const handleRange = useCallback((field, value, index = -1, mainField = null) => {
    setData((prev) => {
      if (index !== -1 && mainField) {
        const nextGroup = [...prev[mainField]];
        nextGroup[index] = {
          ...nextGroup[index],
          [field]: value,
        };
        return { ...prev, [mainField]: nextGroup };
      }
  
      else if (index !== -1) {
        const nextArr = [...prev[field]];
        nextArr[index] = value;
        return { ...prev, [field]: nextArr };
      }
  
      return { ...prev, [field]: value };
    });
  
    setUpdated(true);
  }, []);
  
  useEffect(() => {
    if (updated) {
      const clonedData = { ...data };
      for (const key in clonedData) {
        if (clonedData[key] === "") {
          clonedData[key] = 0;
        }
      }
      onUpdate(clonedData);
    }
  }, [data]);

  const handleSelect = useCallback((value, field, index = -1,mainField=null) => {


    
    if (index !== -1 && mainField) {
      setData((prev) => {
        const bgc = prev[mainField];
        
        bgc[index] = {
          ...bgc[index],
          [field]:value
        }
        return { ...prev, [mainField]: bgc };
      });
    } else if (index !== -1 && !mainField) {
      
      setData((prev) => {
        const bgc = prev[field];
        bgc[index] = value;
        return { ...prev, [field]: bgc };
      });
    }else {
   
      setData((prev) => {
        return { ...prev, [field]: value };
      });
    }
    setUpdated(true);
  },[]);

  //   useEffect(() => {
  //     setData(element);
  //     setUpdated(false)
  //   }, [element.id]);



  const [allColors, setAllColors] = useState([]);
  const basicColors = THEME_PANEL_BASIC_COLOR_SWATCHES;


  const [openIcon,setOpenIcon] = useState(-1)
  const [barGradientPicker, setBarGradientPicker] = useState("start");


  const colorlabels = ["สีพื้นหลังแบบสีพื้น", "สีพื้นหลังแบบไล่โทน"];

  useEffect(() => {
    if (!isGradient) {
      setBarGradientPicker("start");
    }
  }, [isGradient]);

  useEffect(() => {
    const onClick = (e) => {
      const el = e.target;
      const inBtn = el.closest("#btn-popper");
      const inPopper = el.closest("#popper-color");
      if (!inPopper && !inBtn) {
        toggleColorTable(-1)
      }
    };
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("click", onClick);
    };
  });

  const copy = useCallback((index,field) => {
    setData((prev) => {
      const next = { ...prev };
      const nextGroup = [...prev[field]];
      const clone = {
        ...nextGroup[index],
      };
      nextGroup.splice(index + 1, 0, clone);
      next[field] = nextGroup;
      return next;
    });
    setUpdated(true);
  }, []);
  
  const remove = useCallback((index,field) => {
    setData((prev) => {
      if (prev[field].length === 1) return prev;
      if(openIcon === index) {
        setOpenIcon(-1)
      }
      const nextGroup = prev[field].filter((_, i) => i !== index);
      return { ...prev, [field]: nextGroup };
    });
    setUpdated(true);
  }, []);

  const toggleOpenIcon = useCallback((index) => {
    setOpenIcon((prev) => (prev === index ? -1 : index));
  }, []);


  const [openText,setOpenText] = useState(-1)

  const toggleOpenText = useCallback((index) => {
    setOpenText((prev) => (prev === index ? -1 : index));
  }, []);







  return (
    <div
      className="sm:block h-full min-h-0 w-full overflow-hidden bg-white dark:bg-gray-900/80"
    >
      <TabContext value={menu}>
        <div className="px-6 mt-5 flex items-center justify-between">
          <div className="font-semibold tracking-wide">
            ตั้งค่า <span className="text-gray-400">Top Bar</span>
          </div>
          <button
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-white/70"
            onClick={() => close(null)}
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
        <nav className="overflow-y-auto h-[calc(100%-64px)]">
          <ul>
            <li>
              {!isTablet && (
              <div className="w-full mt-[12px]">
                <TabList
                  variant="fullWidth"
                  onChange={(e, newValue) => {
                    setMenu(newValue);
                    toggleColorTable(-1)
                  }}
                  sx={{
                    px: "25px",
                    "& .MuiTabs-flexContainer": {
                      width: "100%",
                    },
                  }}
                  TabIndicatorProps={{
                    sx: {
                      backgroundColor: "#676767", // สีเส้นใต้แท็บอันที่เลือก
                      height: 3, // ความหนาเส้น
                      borderRadius: 999, // ให้เส้นมน ๆ
                      width: "full",
                    },
                  }}
                >
                  {menus.map(({ lable, value }) => {
                    return (
                      <Tab
                        label={lable}
                        value={value}
                        key={value}
                        sx={{
                          flex: 1, // ✅ กินพื้นที่เท่ากัน
                          minWidth: 0, // ✅ กัน Tab ดันเกิน
                          maxWidth: "none", // ✅ ไม่ให้โดนจำกัด maxWidth
                          height: 52,
                          backgroundColor:
                            menu === value ? "#454b57" : "#b5b5b6",

                          borderRightWidth: 1,
                          borderRightStyle: "solid",
                          borderRightColor: "rgba(0,0,0,0.15)",
                          "&:last-of-type": { borderRightWidth: 0 },

                          color: "#454b57",
                          "&.Mui-selected": { color: "white" },
                        }}
                      />
                    );
                  })}
                </TabList>
              </div>
              )}
              {isTablet && (
                <div className="mt-4 px-5">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="shrink-0 text-[13px] font-semibold text-slate-700 dark:text-white/80">
                      โหมดการแสดงผล
                    </span>
                    <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
                  </div>
                  <ButtonGroup
                    fullWidth
                    variant="outlined"
                    disableElevation
                    color="inherit"
                    aria-label="โหมดการแสดงผล Top Bar Tablet"
                    sx={topBarGroupRootSx}
                  >
                    {[
                      { value: "off", label: "ปิดทั้งหมด" },
                      { value: "social", label: "เปิดโซเชียล" },
                      { value: "text", label: "เปิดข้อความ" },
                    ].map((opt) => {
                      const selected = tabletTopBarMode === opt.value;
                      return (
                        <Button
                          key={opt.value}
                          color="inherit"
                          onClick={() => changeTabletTopBarMode(opt.value)}
                          sx={topBarGroupButtonSx(
                            selected,
                            darkMode === "dark" ? darkTextColor : "#000000"
                          )}
                        >
                          {opt.label}
                        </Button>
                      );
                    })}
                  </ButtonGroup>
                </div>
              )}

              <TabPanel value="Social" sx={{ marginTop: -3 }}>
                <div>
                  {!isTablet && (
                    <Stack
                      direction="row"
                      spacng={1}
                      sx={{ alignItems: "center", marginTop: "20px" }}
                    >
                      <AntSwitch
                        inputProps={{ "aria-label": "ant design" }}
                        checked={ableLeft}
                        onChange={() => {
                          setUpdated(true)
                          setData((prev) => {
                            
                            return { ...prev, ableLeft: !prev.ableLeft };
                          });
                        }}
                      />
                      <Typography sx={{ fontSize: 13, ml: 2 }}>เปิด</Typography>
                    </Stack>
                  )}

                  <div className="grid grid-cols-2">
                    {device !== "Tablet" && (
                      <div className={`col col-span-2 ml-[5px] mr-[5px]`}>
                        <div className="mb-3 mt-4 flex items-center gap-2">
                          <span className="shrink-0 text-[13px] font-semibold text-slate-700 dark:text-white/80">
                            รูปแบบการแสดงผล
                          </span>
                          <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
                        </div>
                        <ButtonGroup
                          fullWidth
                          variant="outlined"
                          disableElevation
                          color="inherit"
                          aria-label="รูปแบบการแสดงผล Top Bar"
                          sx={topBarGroupRootSx}
                        >
                          {TOPBAR_DISPLAY_LAYOUT_OPTIONS.map((opt) => {
                            const selected = opt.value === (isFluidLayout === true);
                            return (
                              <Button
                                key={String(opt.value)}
                                color="inherit"
                                onClick={() => changeTopBarDisplayLayout(opt.value)}
                                sx={topBarGroupButtonSx(selected, darkMode === "dark" ? darkTextColor : "#000000")}
                              >
                                {opt.label}
                              </Button>
                            );
                          })}
                        </ButtonGroup>
                      </div>
                    )}
                    <div className={`col col-span-2 ml-[5px] mr-[5px]`}>
                      <MainLabel
                        label="ความสูง"
                        value={topBarHeight}
                        valueInline
                        valueSuffix=""
                        valueColor="#94a3b8"
                      />
                      <Range
                        darkMode={darkMode}
                        darkTextColor={darkTextColor}
                        name="topBarHeight"
                        value={topBarHeight}
                        min={52}
                        max={62}
                        step={1}
                        handleChange={handleRange}
                      />
                    </div>
                  </div>

                  {/* BG color */}
                  <MainLabel label={isGradient ? colorlabels[1] : colorlabels[0]} />

                  {!isGradient ? (
                    <ServiceColor
                      color={bgColor}
                      opacity={bgOpacity}
                      handleColor={(value) => handleSelect(value, "bgColor")}
                      handleOpacity={(e) =>
                        handleRange("bgOpacity", Number(e.target.value))
                      }
                      rangeColor={darkMode === "dark" ? darkTextColor : "#000000"}
                      darkMode={darkMode}
                    />
                  ) : (
                    // Gradient
                    <>
                      <ButtonGroup
                        fullWidth
                        variant="outlined"
                        disableElevation
                        color="inherit"
                        aria-label="เลือกจุดไล่โทนพื้นหลังบาร์"
                        sx={{ ...topBarGroupRootSx, mb: 0, mt: 0.5 }}
                      >
                        {TOPBAR_GRADIENT_STOPS.map((opt) => {
                          const selected =
                            (opt.value === "end" && barGradientPicker === "end") ||
                            (opt.value === "start" && barGradientPicker !== "end");
                          return (
                            <Button
                              key={opt.value}
                              color="inherit"
                              onClick={() =>
                                setBarGradientPicker(
                                  opt.value === "end" ? "end" : "start"
                                )
                              }
                              sx={topBarGroupButtonSx(selected, darkMode === "dark" ? darkTextColor : "#000000")}
                            >
                              {opt.label}
                            </Button>
                          );
                        })}
                      </ButtonGroup>
                      <ServiceColor
                        color={bgColorGradient[barGradientPicker === "end" ? 1 : 0]}
                        opacity={bgOpacityGradient[barGradientPicker === "end" ? 1 : 0]}
                        handleColor={(value) =>
                          handleSelect(
                            value,
                            "bgColorGradient",
                            barGradientPicker === "end" ? 1 : 0
                          )
                        }
                        handleOpacity={(e) =>
                          handleRange(
                            "bgOpacityGradient",
                            Number(e.target.value),
                            barGradientPicker === "end" ? 1 : 0
                          )
                        }
                        rangeColor={darkMode === "dark" ? darkTextColor : "#000000"}
                        darkMode={darkMode}
                      />

                      <MainLabel label={`${bgDegree} องศา`} />

                      <Range
                        darkMode={darkMode}
                        darkTextColor={darkTextColor}
                        name="bgDegree"
                        value={bgDegree}
                        min={0}
                        max={360}
                        step={45}
                        handleChange={handleRange}
                      />
                    </>
                  )}

                  {!isTablet && (
                  <div className="grid grid-cols-2">
                    {rangeValue.map((item, i) => {
                      const { data, label, name, min, max, step } = item;
                      const isInlineMetric =
                        label === "ขนาดกรอบ" || label === "ความโค้งมน";
                      return (
                        <div
                          className={`col col-span-1 ml-[5px] mr-[5px]`}
                          key={i}
                        >
                          <MainLabel
                            label={label}
                            value={data}
                            valueInline={isInlineMetric}
                            valueSuffix={isInlineMetric ? "" : "PX"}
                            valueColor={isInlineMetric ? "#94a3b8" : "gray"}
                          />
                          <Range
                            darkMode={darkMode}
                            darkTextColor={darkTextColor}
                            name={name}
                            value={data}
                            min={min}
                            max={max}
                            step={step}
                            handleChange={handleRange}
                          />
                        </div>
                      );
                    })}
                  </div>
                  )}
                  {!isTablet && <MainLabel label="โซเชียล" />}
                  {!isTablet && iconGroup.map((item, i) => {

                    const {iconColor,iconOpacity,bgColor,bgOpacity} = item
                  const colors = [
                    {label:"สีพื้นหลัง",field:"bgColor",data:bgColor,opacity:bgOpacity,opacityField:"bgOpacity",open:openColorTable === 3,click:()=>{

                      toggleColorTable(3)
                    }},
                    {label:"สีไอคอน",field:"iconColor",data:iconColor,opacity:iconOpacity,opacityField:"iconOpacity",open:openColorTable === 4,click:()=>{

                      toggleColorTable(4)
                    }}
                  ]
  return (
    <SocialList
    colors={colors}
      key={i}
      index={i}
      item={item}
      isOpen={openIcon === i}
      darkMode={darkMode}
      darkTextColor={darkTextColor}
      onToggle={toggleOpenIcon}
      onFieldChange={handleChange}
      onRangeChange={handleRange}
      onCopy={copy}
      onRemove={remove}
      onSelectChange={handleSelect}

    />
  );
})}
                </div>
              </TabPanel>

              <TabPanel value="Text" sx={{ marginTop: -3 }}>
                <div>
                  {!isTablet && (
                    <Stack
                      direction="row"
                      spacng={1}
                      sx={{ alignItems: "center", marginTop: "20px" }}
                    >
                      <AntSwitch
                        inputProps={{ "aria-label": "ant design" }}
                        checked={ableRight}
                        onChange={() => {
                          setUpdated(true)
                          setData((prev) => {
                            return { ...prev, ableRight: !prev.ableRight };
                          });
                        }}
                      />
                      <Typography sx={{ fontSize: 13, ml: 2 }}>เปิด</Typography>
                    </Stack>
                  )}


                  {!isTablet && (
                  <div className="grid grid-cols-2">
                    {rangeValue2.map((item, i) => {
                      const { data, label, name, min, max, step } = item;
                      const isInlineMetric =
                        label === "ขนาดกรอบ" || label === "ความโค้งมน";
                      return (
                        <div
                          className={`col col-span-1 ml-[5px] mr-[5px]`}
                          key={i}
                        >
                          <MainLabel
                            label={label}
                            value={data}
                            valueInline={isInlineMetric}
                            valueSuffix={isInlineMetric ? "" : "PX"}
                            valueColor={isInlineMetric ? "#94a3b8" : "gray"}
                          />
                          <Range
                            darkMode={darkMode}
                            darkTextColor={darkTextColor}
                            name={name}
                            value={data}
                            min={min}
                            max={max}
                            step={step}
                            handleChange={handleRange}
                          />
                        </div>
                      );
                    })}
                  </div>
                  )}
                  <MainLabel label="ข้อความ" />
                  {textGroup.map((item, i) => {

                    const { iconColor, iconOpacity, bgColor, bgOpacity, textColor, textOpacity } = item
                  const colors = [
                    { label: "สีพื้นหลัง", field: "bgColor", data: bgColor, opacity: bgOpacity, opacityField: "bgOpacity" },
                    { label: "สีไอคอน", field: "iconColor", data: iconColor, opacity: iconOpacity, opacityField: "iconOpacity" },
                    { label: "สีข้อความ", field: "textColor", data: textColor, opacity: textOpacity, opacityField: "textOpacity" },
                  ]
  return (
    <TextList
      colors={colors}
      key={i}
      index={i}
      item={item}
      isOpen={openText === i}
      darkMode={darkMode}
      darkTextColor={darkTextColor}
      onToggle={toggleOpenText}
      onFieldChange={handleChange}
      onRangeChange={handleRange}
      onCopy={copy}
      onRemove={remove}
      onSelectChange={handleSelect}

    />
  );
})}
                </div>
              </TabPanel>
            </li>
          </ul>
        </nav>
      </TabContext>
    </div>
  );

  function MainLabel({
    label,
    value = NaN,
    valueSuffix = "PX",
    valueInline = false,
    valueColor = "gray",
  }) {
    const w = "flex-1";
    let colorSwitchList = [
      "สีพื้นหลังบาร์",
      "สีพื้นหลังแบบสีพื้น",
      "สีพื้นหลังแบบไล่โทน",
    ];

    const colorSwitch = colorSwitchList.includes(label);

    const checked = () => {
      if (colorSwitchList.includes(label)) {
        return isGradient;
      }
    };

    const typography = () => {
      return "สีไล่โทน";
    };

    let mb = "mb-3";

    const onSwitch = () => {
      setUpdated(true);
      setData((prev) => {
        toggleColorTable(-1);
        if (colorSwitchList.includes(label)) {
          return { ...prev, isGradient: !prev.isGradient };
        }
      });
    };

    return (
      <div className={`flex items-center gap-2 mt-5 ${mb}`}>
        <span className="text-dark dark:text-white/80 text-[13px] font-bold">
          {label}
        </span>
        {valueInline && !Number.isNaN(value) && (
          <span className="text-[13px]" style={{ color: valueColor }}>
            {value}
            {valueSuffix ? ` ${valueSuffix}` : ""}
          </span>
        )}
        <div className={`border-b border-slate-200 dark:border-white/15 ${w}`}></div>
        {colorSwitch && (
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <AntSwitch
              inputProps={{ "aria-label": "ant design" }}
              checked={checked()}
              onChange={() => {
                onSwitch();
              }}
            />
            <Typography sx={{ fontSize: 13 }}>{typography()}</Typography>
          </Stack>
        )}
        {!valueInline && !Number.isNaN(value) && (
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Typography sx={{ fontSize: 13, color: valueColor }}>
              {value}
              {valueSuffix ? ` ${valueSuffix}` : ""}
            </Typography>
          </Stack>
        )}
      </div>
    );
  }
};
export default TopBarOffcanvas;
