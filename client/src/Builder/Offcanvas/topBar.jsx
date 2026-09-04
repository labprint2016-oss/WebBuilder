import { memo, useEffect, useLayoutEffect, useState, useRef, useCallback } from "react";
import {
  TOP_BAR_PREVIEW_ID,
  TOP_BAR_PREVIEW_TYPE,
  usePanelSliderPreview,
} from "../panelPreviewStore";
import {
  clearSliderLiveTopBar,
  previewTopBarChromeDirectly,
} from "../topBarChromePreview";
import TextField from "@mui/material/TextField";
import { panelGroupButtonSx } from "../panelControlSx";
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
} from "@mui/material";
import lodash from "lodash";
import {
  Minus,
  Plus,
  ChevronDown,
  Check,
  Palette,
  ImageOff,
  Trash2,
  Copy,
  Image,
  Home,
} from "lucide-react";
import Popper from "@mui/material/Popper";
import { styled } from "@mui/material/styles";
import Switch from "@mui/material/Switch";
import IconLucide from "../../IconLucide";
import Stack from "@mui/material/Stack";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import ServiceColor from "../Services/ServiceColor";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ServiceIcon from "../ServiceIcon";
import IconAwsome from "../IconAwsome";
const TOPBAR_GRADIENT_STOPS = [
  { value: "start", label: "จุดเริ่ม" },
  { value: "end", label: "จุดสิ้น" },
];
const TOPBAR_DISPLAY_LAYOUT_OPTIONS = [
  { value: true, label: "ความกว้างเต็มจอ" },
  { value: false, label: "ความกว้างมาตรฐาน" },
];
const TOPBAR_FALLBACK_ICON = { type: "fas", name: "faHouse" };
const TOPBAR_SLIDER_LABELS = {
  topBarHeight: "ความสูง",
  bgOpacity: "ความโปร่งใส",
  bgDegree: "องศาไล่โทน",
  iconSize: "ขนาดไอคอน",
  iconOpacity: "ความโปร่งใส",
  textSize: "ขนาดข้อความ",
  borderSize: "ขนาดกรอบ",
  radius: "ความโค้งมน",
  borderTextSize: "ขนาดกรอบ",
  radiusText: "ความโค้งมน",
};
const normalizeTopBarIcon = (icon) =>
  icon?.name && icon.name !== "fa0" ? icon : TOPBAR_FALLBACK_ICON;
const CHIP_BORDER = "#e2e8f0";
const CHIP_BORDER_DARK = "rgba(255, 255, 255, 0.1)";
const CHIP_BG = "#ffffff";
const CHIP_BG_HOVER = "#f8fafc";
const CHIP_BG_DARK = "rgba(30, 41, 59, 0.9)";
const CHIP_BG_DARK_HOVER = "rgba(30, 41, 59, 1)";
const OPTION_CHIP_RADIUS = "0.375rem";
const TOPBAR_GROUP_ACTIVE_COLOR = "var(--dash-panel-accent, #333333)";

const topBarGroupButtonSx = panelGroupButtonSx;

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
        backgroundColor: TOPBAR_GROUP_ACTIVE_COLOR,
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
    borderColor: "var(--dash-panel-btn-group-border, #e2e8f0) !important",
  },
  "& .MuiButtonGroup-grouped.MuiButton-outlined:not(:last-of-type)": {
    borderRightColor: "var(--dash-panel-btn-group-border, #e2e8f0) !important",
  },
  ".dark & .MuiButtonGroup-grouped.MuiButton-outlined": {
    borderColor: "var(--dash-panel-btn-group-border, #e2e8f0) !important",
  },
  ".dark & .MuiButtonGroup-grouped.MuiButton-outlined:not(:last-of-type)": {
    borderRightColor: "var(--dash-panel-btn-group-border, #e2e8f0) !important",
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
  const bgcolor = "var(--dash-panel-btn-group-inactive, #ffffff)";
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
  onCommit,
  darkTextColor,
  darkMode,
  index = -1,
  mainField = null,
  controlLabel,
}) => {
  const [newValue, setNewValue] = useState(value);
  const draggingRef = useRef(false);

  useEffect(() => {
    if (draggingRef.current) return;
    setNewValue(value);
  }, [value]);

  let pos = ((newValue - min) / (max - min)) * 100;
  const commit = (e, reason) => {
    draggingRef.current = false;
    if (!onCommit) return;
    const n = Number(e.currentTarget.value);
    onCommit(
      Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : value,
      reason
    );
  };

  return (
    <div className="pb-[2px] px-[5px]">
      <input
        type="range"
        name={name}
        data-perf-control={controlLabel || name}
        min={min}
        max={max}
        value={newValue}
        step={step}
        onPointerDown={() => {
          draggingRef.current = true;
        }}
        onChange={(e) => {
          draggingRef.current = true;
          const v = Number(e.target.value);
          setNewValue(v);
          handleChange?.(name, v, index, mainField, controlLabel);
        }}
        onPointerUp={onCommit ? (e) => commit(e, "pointerup") : undefined}
        onPointerCancel={
          onCommit ? (e) => commit(e, "pointercancel") : undefined
        }
        onMouseUp={onCommit ? (e) => commit(e, "mouseup") : undefined}
        onTouchEnd={onCommit ? (e) => commit(e, "touchend") : undefined}
        onTouchCancel={onCommit ? (e) => commit(e, "touchcancel") : undefined}
        onKeyUp={onCommit ? (e) => commit(e, "keyboard") : undefined}
        onBlur={onCommit ? (e) => commit(e, "blur") : undefined}
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
    <div className="relative dash-card w-auto rounded-md border border-zinc-400 dark:border-gray-500/50 bg-white dark:bg-zinc-800 px-2 py-1 text-sm text-zinc-900 focus-within:border-zinc-500 flex items-center justify-center w-[160px] mb-[5px] h-[35px]">
      <div className="absolute pr-2 -left-px">
        <button
          className="bg-transparent flex items-center justify-center rounded-md"
          onClick={() => handChange(field, minus)}
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
          onClick={() => handChange(field, plus)}
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
  hideBorder = false,
  softBg = false,
  className = "",
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
      className={className}
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

        // สีพื้นหลังของปุ่ม = สีที่เลือก (softBg = ทึบตามค่า alpha ใน bgColor)
        bgcolor: bgColor,
        opacity: 1,
        ...(softBg
          ? {
              backgroundColor: `${bgColor} !important`,
              background: `${bgColor} !important`,
              "&:hover": {
                backgroundColor: `${bgColor} !important`,
                background: `${bgColor} !important`,
                borderColor,
                boxShadow: "none",
                outline: "none",
              },
            }
          : {
              "&:hover": {
                bgcolor: bgColor,
                borderColor,
                boxShadow: "none", // กันธีมเพิ่มเงาตอนโฮเวอร์
                outline: "none",
              },
            }),
        "&:focus": {
          outline: "none",
        },
        "&:focus-visible": {
          outline: "none",
        },

        // สีตัวอักษร - ให้สืบทอดจาก parent; คุณจะเปลี่ยนเป็นขาว/ดำเองก็ได้
        color: "inherit",

        ".dark &": hideBorder ? {} : {
          borderColor: "var(--dash-panel-input-border, #e2e8f0)", // สีกรอบใน dark (เทาเข้มที่คุณใช้กับ TextField)
          "&:hover": { borderColor: "var(--dash-panel-input-border, #e2e8f0)" },
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

const ITEM_CARD_ANIMATION_MS = 220;

function TopBarItemCard({
  isOpen,
  borderColor,
  bgMenu,
  bgMenuOption,
  summary,
  children,
}) {
  const [bodyMounted, setBodyMounted] = useState(false);

  useEffect(() => {
    if (!isOpen || bodyMounted) return undefined;
    const frame = window.requestAnimationFrame(() => {
      setBodyMounted(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [isOpen, bodyMounted]);

  return (
    <div
      style={{
        marginTop: 4,
        marginBottom: 4,
        cursor: "pointer",
        borderWidth: 1,
        borderStyle: "solid",
        borderColor,
        borderRadius: 4,
        backgroundColor: bgMenu,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: 45,
          minHeight: 35,
          display: "flex",
          alignItems: "center",
          width: "100%",
          gap: 8,
          paddingLeft: 8,
          paddingRight: 8,
          backgroundColor: bgMenu,
        }}
      >
        {summary}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateRows: isOpen && bodyMounted ? "1fr" : "0fr",
          transition: `grid-template-rows ${ITEM_CARD_ANIMATION_MS}ms ease`,
        }}
      >
        <div style={{ overflow: "hidden", minHeight: 0 }}>
          {bodyMounted ? (
            <div
              style={{
                backgroundColor: bgMenuOption,
                padding: "8px 16px 16px",
              }}
            >
              {children}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

const toSafeOpacity = (value) =>
  Number.isFinite(Number(value)) ? Number(value) : 255;

function TopBarItemMenuButton({
  Icon,
  label,
  darkMode,
  onClick,
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      data-perf-control={label}
      onClick={onClick}
      className="dash-panel-soft-btn inline-flex h-7 w-7 shrink-0 items-center justify-center rounded border"
      style={{
        backgroundColor:
          darkMode === "dark"
            ? "rgba(73, 77, 84, 0.4)"
            : "rgba(236, 236, 236, 0.4)",
        borderColor: darkMode === "dark" ? "#494D54" : "#e5e5e5",
        color: darkMode === "dark" ? "#ffffff" : "#505050",
      }}
    >
      <Icon
        className="h-3 w-3"
        strokeWidth={2}
        style={{ color: darkMode === "dark" ? "#ffffff" : "#505050" }}
      />
    </button>
  );
}

const TOPBAR_TEXT_FIELDS = new Set(["url", "text"]);

function Field({
  name,
  value,
  handleChange,
  onBlur,
  darkMode,
  children,
  placeholder = "",
  borderColor = null,
  uncontrolled = false,
}) {
  return (
    <FormControl fullWidth>
      <Box sx={{ display: "flex", width: "100%" }}>
        <TextField
          sx={COMMON_FIELD_SX(Boolean(children), false, darkMode, 35, 12, borderColor)}
          fullWidth
          name={name}
          {...(uncontrolled ? { defaultValue: value ?? "" } : { value })}
          onChange={handleChange}
          onBlur={onBlur}
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

const SocialList = memo(function SocialList({
    item,
    index,
    isOpen,
    darkMode,
    darkTextColor,
    onToggle,
    onFieldChange,
    onFieldBlur,
    onRangeChange,
    onRangeCommit,
    onMetricLabelRef,
    onSelectChange,
    onCopy,
    onRemove,
  }) {
    const { iconColor, iconOpacity, bgColor, bgOpacity } = item;
    const colors = [
      {
        label: "สีพื้นหลัง",
        field: "bgColor",
        data: bgColor,
        opacity: toSafeOpacity(bgOpacity),
        opacityField: "bgOpacity",
      },
      {
        label: "สีไอคอน",
        field: "iconColor",
        data: iconColor,
        opacity: toSafeOpacity(iconOpacity),
        opacityField: "iconOpacity",
      },
    ];
    const { icon, url, iconSize } = item;
    const safeIcon = normalizeTopBarIcon(icon);
    const [socialColorMode, setSocialColorMode] = useState("bg");

    const [openIconModal,setOpenIconMoal] = useState(false)






    const bgMenu = "var(--dash-panel-btn-group-inactive, #ffffff)";
    const bgMenuOption = "var(--dash-panel-btn-group-inactive, #ffffff)";
    const borderColor = darkMode === "dark" ? "#494d54" : "#e5e5e5";
    const textColor = darkMode === "dark" ? "#ffffff" : "#202020";

    return (
      <>
      <TopBarItemCard
        isOpen={isOpen}
        borderColor={borderColor}
        bgMenu={bgMenu}
        bgMenuOption={bgMenuOption}
        summary={
          <>
            <span style={{ display: "inline-flex" }}></span>
            <button
              type="button"
              onClick={() => setOpenIconMoal(true)}
              className="inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded border-0"
              style={{
                backgroundColor: darkMode === "dark" ? "#494d54" : "#333333",
              }}
            >
              <IconAwsome
                style={{ color: "white", fontSize: 13 }}
                iconType={safeIcon.type}
                iconName={safeIcon.name}
              />
            </button>
            
            <span
              ref={onMetricLabelRef?.(`iconGroup:${index}:url`)}
              style={{
                marginLeft: 16,
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
            </span>

            <div
              style={{
                marginLeft: 16,
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexShrink: 0,
                transform: "translateX(8px)",
              }}
            >
              <TopBarItemMenuButton
                Icon={Copy}
                label="คัดลอก"
                darkMode={darkMode}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onCopy(index, "iconGroup");
                }}
              />
              <TopBarItemMenuButton
                Icon={Trash2}
                label="ลบ"
                darkMode={darkMode}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRemove(index, "iconGroup");
                }}
              />
            </div>

            <button
              type="button"
              data-perf-control={isOpen ? "ปิดรายการโซเชียล" : "เปิดรายการโซเชียล"}
              aria-label={isOpen ? "ปิดรายการโซเชียล" : "เปิดรายการโซเชียล"}
              aria-expanded={isOpen}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggle(index);
              }}
              style={{
                width: 34,
                height: 34,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 4,
                cursor: "pointer",
                flexShrink: 0,
                border: "none",
                background: "transparent",
                padding: 0,
              }}
            >
              <ChevronDown
                size={16}
                style={{
                  color: darkMode === "dark" ? "#ffffff" : "#202020",
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 220ms ease",
                }}
              />
            </button>
          </>
        }
      >
            <div className="grid grid-cols-12 items-center">
              <div className="col-span-12">
                <Field
                  name="url"
                  value={url}
                  uncontrolled
                  handleChange={(e) => onFieldChange(e, index, "iconGroup")}
                  onBlur={onFieldBlur}
                  darkMode={darkMode}
                  placeholder="Link URL"
                  borderColor={darkMode === "dark" ? "#494D54" : "#e5e5e5"}
                />
              </div>
            </div>

            <div className="grid grid-cols-2">
              <div className="col col-span-2 ml-[5px] mr-[5px]">
                <div className="flex items-center gap-2 mt-5 mb-1">
                  <span className="dash-panel-label text-[13px] font-bold">
                    ขนาดไอคอน
                  </span>
                  <span
                    ref={onMetricLabelRef?.(`iconGroup:${index}:iconSize`)}
                    className="text-[13px] text-slate-400"
                  >
                    {iconSize}
                  </span>
                  <div className="dash-heading-rule border-b flex-1"></div>
                </div>

                <div className="pb-[5px]">
                  <Range
                    darkMode={darkMode}
                    darkTextColor={darkTextColor}
                    name="iconSize"
                    value={iconSize}
                    min={12}
                    max={30}
                    step={1}
                    handleChange={onRangeChange}
                    onCommit={onRangeCommit}
                    index={index}
                    mainField="iconGroup"
                    controlLabel="ขนาดไอคอน"
                  />
                </div>
              </div>
            </div>

            <>
              <div className="grid grid-cols-12 mt-[7px]">
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
                  <div>
                  {(() => {
                    const selectedField =
                      socialColorMode === "icon" ? "iconColor" : "bgColor";
                    const selectedItem =
                      colors.find((item) => item.field === selectedField) ?? colors[0];
                    if (!selectedItem) return null;
                    const opacityField =
                      selectedItem.opacityField ||
                      (socialColorMode === "icon" ? "iconOpacity" : "bgOpacity");
                    const opacityValue = Number.isFinite(Number(selectedItem.opacity))
                      ? Number(selectedItem.opacity)
                      : 255;
                    return (
                      <>
                        <div className="pt-[5px]">
                          <Range
                            darkMode={darkMode}
                            darkTextColor={darkTextColor}
                            name={opacityField}
                            value={opacityValue}
                            min={0}
                            max={255}
                            step={1}
                            handleChange={onRangeChange}
                            onCommit={onRangeCommit}
                            index={index}
                            mainField="iconGroup"
                            controlLabel="ความโปร่งใส"
                          />
                        </div>
                        <ServiceColor
                          hideOpacity
                          compact
                          color={selectedItem.data}
                          opacity={opacityValue}
                          handleColor={(value) =>
                            onSelectChange(value, selectedItem.field, index, "iconGroup")
                          }
                          rangeColor={darkMode === "dark" ? darkTextColor : "#000000"}
                          darkMode={darkMode}
                        />
                      </>
                    );
                  })()}
                  </div>
                </div>
              </div>
            </>
      </TopBarItemCard>
      {openIconModal ? (
        <ServiceIcon header="ไอคอน" icon={safeIcon} open={openIconModal} onClose={()=>setOpenIconMoal(false)} darkMode={darkMode} darkColor={darkTextColor} handleChange={(icon)=>{
          onFieldChange({target:{name:"icon",value:icon}},index,"iconGroup")
        }}/>
      ) : null}
      </>
    );

});

const TextList = memo(function TextList({
    item,
    index,
    isOpen,
    darkMode,
    darkTextColor,
    onToggle,
    onFieldChange,
    onFieldBlur,
    onRangeChange,
    onRangeCommit,
    onMetricLabelRef,
    onSelectChange,
    onCopy,
    onRemove,
  }) {
    const { text, textSize, icon, iconSize, iconColor, iconOpacity, bgColor, bgOpacity, textColor: itemTextColor, textOpacity } = item;
    const colors = [
      { label: "สีพื้นหลัง", field: "bgColor", data: bgColor, opacity: toSafeOpacity(bgOpacity), opacityField: "bgOpacity" },
      { label: "สีไอคอน", field: "iconColor", data: iconColor, opacity: toSafeOpacity(iconOpacity), opacityField: "iconOpacity" },
      { label: "สีข้อความ", field: "textColor", data: itemTextColor, opacity: toSafeOpacity(textOpacity), opacityField: "textOpacity" },
    ];
    const safeIcon = normalizeTopBarIcon(icon);
    const [textIconColorMode, setTextIconColorMode] = useState("bg");


    const [openIconModal,setOpenIconMoal] = useState(false)






    const bgMenu = "var(--dash-panel-btn-group-inactive, #ffffff)";
    const bgMenuOption = "var(--dash-panel-btn-group-inactive, #ffffff)";
    const borderColor = darkMode === "dark" ? "#494d54" : "#e5e5e5";
    const textColor = darkMode === "dark" ? "#ffffff" : "#202020";

    return (
      <>
      <TopBarItemCard
        isOpen={isOpen}
        borderColor={borderColor}
        bgMenu={bgMenu}
        bgMenuOption={bgMenuOption}
        summary={
          <>
            <span style={{ display: "inline-flex" }}></span>

            <button
              type="button"
              onClick={() => setOpenIconMoal(true)}
              className="inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded border-0"
              style={{
                backgroundColor: darkMode === "dark" ? "#494d54" : "#333333",
              }}
            >
              <IconAwsome
                style={{ color: "white", fontSize: 13 }}
                iconType={safeIcon.type}
                iconName={safeIcon.name}
              />
            </button>

            <span
              ref={onMetricLabelRef?.(`textGroup:${index}:text`)}
              style={{
                marginLeft: 16,
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
            </span>

            <div
              style={{
                marginLeft: 16,
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexShrink: 0,
                transform: "translateX(8px)",
              }}
            >
              <TopBarItemMenuButton
                Icon={Copy}
                label="คัดลอก"
                darkMode={darkMode}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onCopy(index, "textGroup");
                }}
              />
              <TopBarItemMenuButton
                Icon={Trash2}
                label="ลบ"
                darkMode={darkMode}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRemove(index, "textGroup");
                }}
              />
            </div>

            <button
              type="button"
              data-perf-control={isOpen ? "ปิดรายการข้อความ" : "เปิดรายการข้อความ"}
              aria-label={isOpen ? "ปิดรายการข้อความ" : "เปิดรายการข้อความ"}
              aria-expanded={isOpen}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggle(index);
              }}
              style={{
                width: 34,
                height: 34,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 4,
                cursor: "pointer",
                flexShrink: 0,
                border: "none",
                background: "transparent",
                padding: 0,
              }}
            >
              <ChevronDown
                size={16}
                style={{
                  color: darkMode === "dark" ? "#ffffff" : "#202020",
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 220ms ease",
                }}
              />
            </button>
          </>
        }
      >
            <div className="grid grid-cols-12">
              <div className="col-span-12">
                <Field
                  name="text"
                  value={text}
                  uncontrolled
                  handleChange={(e) => onFieldChange(e, index, "textGroup")}
                  onBlur={onFieldBlur}
                  darkMode={darkMode}
                  borderColor={darkMode === "dark" ? CHIP_BORDER_DARK : CHIP_BORDER}
                />
              </div>
            </div>

          <div className="grid grid-cols-2">
              <div className="col col-span-2 ml-[5px] mr-[5px]">
                <div className="flex items-center gap-2 mt-5 mb-[7px]">
                  <span className="dash-panel-label text-[13px] font-bold">
                    ขนาดข้อความ
                  </span>
                  <span
                    ref={onMetricLabelRef?.(`textGroup:${index}:textSize`)}
                    className="text-[13px]"
                    style={{ color: "#94a3b8" }}
                  >
                    {textSize}
                  </span>
                  <div className="dash-heading-rule border-b flex-1"></div>
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
                  onCommit={onRangeCommit}
                  index={index}
                  mainField="textGroup"
                  controlLabel="ขนาดข้อความ"
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
                  <div>
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
                      const opacityField =
                        selectedItem.opacityField ||
                        (textIconColorMode === "icon"
                          ? "iconOpacity"
                          : textIconColorMode === "text"
                            ? "textOpacity"
                            : "bgOpacity");
                      const opacityValue = Number.isFinite(Number(selectedItem.opacity))
                        ? Number(selectedItem.opacity)
                        : 255;
                      return (
                        <>
                          <div className="pt-[5px]">
                            <Range
                              darkMode={darkMode}
                              darkTextColor={darkTextColor}
                              name={opacityField}
                              value={opacityValue}
                              min={0}
                              max={255}
                              step={1}
                              handleChange={onRangeChange}
                              onCommit={onRangeCommit}
                              index={index}
                              mainField="textGroup"
                              controlLabel="ความโปร่งใส"
                            />
                          </div>
                          <ServiceColor
                            hideOpacity
                            compact
                            color={selectedItem.data}
                            opacity={opacityValue}
                            handleColor={(value) =>
                              onSelectChange(value, selectedItem.field, index, "textGroup")
                            }
                            rangeColor={darkMode === "dark" ? darkTextColor : "#000000"}
                            darkMode={darkMode}
                          />
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </>

            <div className="grid grid-cols-2">
              <div className="col col-span-2 ml-[5px] mr-[5px]">
                <div className="flex items-center gap-2 mt-5 mb-1">
                  <span className="dash-panel-label text-[13px] font-bold">
                    ขนาดไอคอน
                  </span>
                  <span
                    ref={onMetricLabelRef?.(`textGroup:${index}:iconSize`)}
                    className="text-[13px]"
                    style={{ color: "#94a3b8" }}
                  >
                    {iconSize}
                  </span>
                  <div className="dash-heading-rule border-b flex-1"></div>
                </div>

                <div className="pb-[5px]">
                  <Range
                    darkMode={darkMode}
                    darkTextColor={darkTextColor}
                    name="iconSize"
                    value={iconSize}
                    min={12}
                    max={30}
                    step={1}
                    handleChange={onRangeChange}
                    onCommit={onRangeCommit}
                    index={index}
                    mainField="textGroup"
                    controlLabel="ขนาดไอคอน"
                  />
                </div>
              </div>
            </div>

      </TopBarItemCard>
      {openIconModal ? (
        <ServiceIcon header="ไอคอน" icon={safeIcon} open={openIconModal} onClose={()=>setOpenIconMoal(false)} darkMode={darkMode} darkColor={darkTextColor} handleChange={(icon)=>{
          onFieldChange({target:{name:"icon",value:icon}},index,"textGroup")
        }}/>
      ) : null}
      </>
    );

});

const SocialItemList = memo(function SocialItemList({
  items,
  darkMode,
  darkTextColor,
  onFieldChange,
  onFieldBlur,
  onRangeChange,
  onRangeCommit,
  onMetricLabelRef,
  onSelectChange,
  onCopy,
  onRemove,
}) {
  const [openIndex, setOpenIndex] = useState(-1);
  const onToggle = useCallback((index) => {
    setOpenIndex((prev) => (prev === index ? -1 : index));
  }, []);
  const handleRemove = useCallback(
    (index, field) => {
      setOpenIndex((prev) =>
        prev === index ? -1 : prev > index ? prev - 1 : prev
      );
      onRemove(index, field);
    },
    [onRemove]
  );
  return items.map((item, i) => (
    <SocialList
      key={i}
      index={i}
      item={item}
      isOpen={openIndex === i}
      darkMode={darkMode}
      darkTextColor={darkTextColor}
      onToggle={onToggle}
      onFieldChange={onFieldChange}
      onFieldBlur={onFieldBlur}
      onRangeChange={onRangeChange}
      onRangeCommit={onRangeCommit}
      onMetricLabelRef={onMetricLabelRef}
      onCopy={onCopy}
      onRemove={handleRemove}
      onSelectChange={onSelectChange}
    />
  ));
});

const TextItemList = memo(function TextItemList({
  items,
  darkMode,
  darkTextColor,
  onFieldChange,
  onFieldBlur,
  onRangeChange,
  onRangeCommit,
  onMetricLabelRef,
  onSelectChange,
  onCopy,
  onRemove,
}) {
  const [openIndex, setOpenIndex] = useState(-1);
  const onToggle = useCallback((index) => {
    setOpenIndex((prev) => (prev === index ? -1 : index));
  }, []);
  const handleRemove = useCallback(
    (index, field) => {
      setOpenIndex((prev) =>
        prev === index ? -1 : prev > index ? prev - 1 : prev
      );
      onRemove(index, field);
    },
    [onRemove]
  );
  return items.map((item, i) => (
    <TextList
      key={i}
      index={i}
      item={item}
      isOpen={openIndex === i}
      darkMode={darkMode}
      darkTextColor={darkTextColor}
      onToggle={onToggle}
      onFieldChange={onFieldChange}
      onFieldBlur={onFieldBlur}
      onRangeChange={onRangeChange}
      onRangeCommit={onRangeCommit}
      onMetricLabelRef={onMetricLabelRef}
      onCopy={onCopy}
      onRemove={handleRemove}
      onSelectChange={onSelectChange}
    />
  ));
});


const TopBarOffcanvas = ({
  topBar,
  updateTopBar: onUpdate,
  close,
  darkMode,
  darkTextColor,
  device,
  onReady,
}) => {
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;
  useLayoutEffect(() => {
    onReadyRef.current?.();
  }, []);
  const [data, setData] = useState(() => lodash.cloneDeep(topBar));
  const [menu, setMenu] = useState("Social");
  const isTablet = device === "Tablet";
  const tabletTopBarMode = data?.tabletTopBarMode || "social";

  const [openColorTable, setOpenColorTable] = useState(-1);
  const [updated, setUpdated] = useState(false);
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;
  const syncedTopBarRef = useRef(topBar);
  const hasActiveSliderRef = useRef(() => false);
  const topBarHeightLabelRef = useRef(null);
  const metricLabelRefs = useRef({});
  const setMetricLabelRef = useCallback((name) => (node) => {
    if (name === "topBarHeight") topBarHeightLabelRef.current = node;
    if (node) metricLabelRefs.current[name] = node;
    else delete metricLabelRefs.current[name];
  }, []);
  const draftTopBarRef = useRef(data);
  const persistTimerRef = useRef(null);

  useEffect(() => {
    if (hasActiveSliderRef.current()) return;
    if (persistTimerRef.current != null) return;
    if (syncedTopBarRef.current === topBar) return;
    syncedTopBarRef.current = topBar;
    draftTopBarRef.current = topBar;
    setData(topBar);
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

  const applyFieldToDraft = useCallback((name, value, index = -1, mainField = null) => {
    const prev = draftTopBarRef.current || {};
    let next = prev;
    if (index !== -1 && mainField) {
      const nextGroup = [...(prev[mainField] || [])];
      nextGroup[index] = {
        ...nextGroup[index],
        [name]: value,
      };
      next = { ...prev, [mainField]: nextGroup };
    } else if (index !== -1 && !mainField) {
      const nextGroup = [...(prev[name] || [])];
      nextGroup[index] = value;
      next = { ...prev, [name]: nextGroup };
    } else {
      next = { ...prev, [name]: value };
    }
    draftTopBarRef.current = next;
    return next;
  }, []);

  const handleChange = useCallback((e, index = -1, mainField = null) => {
    const { name, value } = e.target;
    const next = applyFieldToDraft(name, value, index, mainField);
    if (TOPBAR_TEXT_FIELDS.has(name)) {
      const labelNode = metricLabelRefs.current[`${mainField}:${index}:${name}`];
      if (labelNode) {
        labelNode.textContent =
          value || (name === "url" ? "Link URL" : "Bangkok Thailand");
      }
      return;
    }
    setData(() => next);
    setUpdated(true);
  }, [applyFieldToDraft]);


  const changeTopBarDisplayLayout = (value) => {
    setData((prev) => ({ ...prev, isFluidLayout: value === true }));
    setUpdated(true);
  };

  const persistTopBar = useCallback((latest) => {
    if (!latest) return;
    draftTopBarRef.current = latest;
    syncedTopBarRef.current = latest;
    onUpdateRef.current(latest);
  }, []);

  const queueTopBarPersist = useCallback(
    (latest) => {
      draftTopBarRef.current = latest;
      if (persistTimerRef.current != null) {
        window.clearTimeout(persistTimerRef.current);
      }
      persistTimerRef.current = window.setTimeout(() => {
        persistTimerRef.current = null;
        persistTopBar(latest);
      }, 80);
    },
    [persistTopBar]
  );

  const handleFieldBlur = useCallback(() => {
    queueTopBarPersist(draftTopBarRef.current);
  }, [queueTopBarPersist]);

  useEffect(() => {
    return () => {
      if (persistTimerRef.current != null) {
        window.clearTimeout(persistTimerRef.current);
      }
    };
  }, []);

  const { updateSlider, commitSlider, hasActiveSlider } = usePanelSliderPreview({
    type: TOP_BAR_PREVIEW_TYPE,
    targetIds: [TOP_BAR_PREVIEW_ID],
    data,
    setData,
    onCommit: (latest) => {
      persistTopBar(latest);
    },
  });
  hasActiveSliderRef.current = hasActiveSlider;

  const handleRange = useCallback((field, value, index = -1, mainField = null, controlLabel = "") => {
    const nextValue = Number(value);
    const applyValue = (prev) => {
      if (index !== -1 && mainField) {
        const group = Array.isArray(prev[mainField]) ? prev[mainField] : [];
        const nextGroup = group.map((item, i) =>
          i === index
            ? {
                ...item,
                [field]: Number.isFinite(nextValue) ? nextValue : item?.[field],
              }
            : item
        );
        return { ...prev, [mainField]: nextGroup };
      }

      if (index !== -1) {
        const arr = Array.isArray(prev[field]) ? prev[field] : [];
        const nextArr = [...arr];
        nextArr[index] = Number.isFinite(nextValue) ? nextValue : nextArr[index];
        return { ...prev, [field]: nextArr };
      }

      return {
        ...prev,
        [field]: Number.isFinite(nextValue) ? nextValue : prev[field],
      };
    };

    const next = updateSlider(applyValue, {
      setData: false,
      publish: false,
      controlField: controlLabel || TOPBAR_SLIDER_LABELS[field] || field,
    });
    draftTopBarRef.current = next;
    previewTopBarChromeDirectly(next);
    if (Number.isFinite(nextValue)) {
      const itemKey =
        index !== -1 ? `${mainField || ""}:${index}:${field}` : field;
      const labelNode =
        metricLabelRefs.current[itemKey] ||
        metricLabelRefs.current[field] ||
        (field === "topBarHeight" ? topBarHeightLabelRef.current : null);
      if (labelNode) labelNode.textContent = String(nextValue);
    }
  }, [updateSlider]);

  const handleRangeCommit = useCallback(
    (_value, reason) => {
      const latest = draftTopBarRef.current;
      const committed = commitSlider(reason || "range-commit");
      if (committed && latest) {
        setData(latest);
        setUpdated(false);
        window.requestAnimationFrame(() => {
          clearSliderLiveTopBar();
        });
      }
    },
    [commitSlider]
  );

  useEffect(() => {
    if (!updated) return;
    if (hasActiveSliderRef.current()) return;
    persistTopBar(data);
  }, [data, updated, persistTopBar]);

  const handleSelect = useCallback((value, field, index = -1, mainField = null) => {
    const prev = draftTopBarRef.current || {};
    let next = prev;
    if (index !== -1 && mainField) {
      const group = Array.isArray(prev[mainField]) ? prev[mainField] : [];
      next = {
        ...prev,
        [mainField]: group.map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        ),
      };
    } else if (index !== -1 && !mainField) {
      const arr = Array.isArray(prev[field]) ? [...prev[field]] : [];
      arr[index] = value;
      next = { ...prev, [field]: arr };
    } else {
      next = { ...prev, [field]: value };
    }
    draftTopBarRef.current = next;
    previewTopBarChromeDirectly(next);
    queueTopBarPersist(next);
  }, [queueTopBarPersist]);

  //   useEffect(() => {
  //     setData(element);
  //     setUpdated(false)
  //   }, [element.id]);



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
        setOpenColorTable(-1);
      }
    };
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("click", onClick);
    };
  }, []);

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
      const nextGroup = prev[field].filter((_, i) => i !== index);
      return { ...prev, [field]: nextGroup };
    });
    setUpdated(true);
  }, []);







  return (
    <div
      className="dash-panel sm:block h-full min-h-0 w-full overflow-hidden"
    >
        <div className="shrink-0 flex items-center justify-between border-b border-slate-200 dash-panel-header bg-gray-100 px-6 pt-3 pb-2 dark:border-white/10 dark:bg-slate-800/70">
          <div className="font-semibold tracking-wide">
            ตั้งค่า Top Bar
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
                <div className="w-full mt-[12px] px-[25px]">
                  <ButtonGroup
                    fullWidth
                    variant="outlined"
                    disableElevation
                    color="inherit"
                    aria-label="โหมดโซเชียลหรือข้อความ"
                    sx={topBarGroupRootSx}
                  >
                    {menus.map(({ lable, value }) => {
                      const selected = menu === value;
                      return (
                        <Button
                          key={value}
                          color="inherit"
                          onClick={() => {
                            setMenu(value);
                            toggleColorTable(-1);
                          }}
                          sx={topBarGroupButtonSx(
                            selected,
                            darkMode === "dark" ? darkTextColor : "#000000"
                          )}
                        >
                          {lable}
                        </Button>
                      );
                    })}
                  </ButtonGroup>
                </div>
              )}
              {isTablet && (
                <div className="mt-4 px-5">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                      โหมดการแสดงผล
                    </span>
                    <div className="dash-heading-rule min-w-0 flex-1 border-b" />
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

              {menu === "Social" && (
                <div className="px-6">
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
                      <Typography
                        className="text-slate-700 dark:text-white/80"
                        sx={{ fontSize: 13, ml: 2 }}
                      >
                        เปิดใช้งาน Top Bar
                      </Typography>
                    </Stack>
                  )}

                  <div className="grid grid-cols-2">
                    {device !== "Tablet" && (
                      <div className={`col col-span-2 ml-[5px] mr-[5px]`}>
                        <div className="mb-3 mt-4 flex items-center gap-2">
                          <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                            รูปแบบการแสดงผล
                          </span>
                          <div className="dash-heading-rule min-w-0 flex-1 border-b" />
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
                        valueRef={setMetricLabelRef("topBarHeight")}
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
                        onCommit={handleRangeCommit}
                        controlLabel="ความสูง"
                      />
                    </div>
                  </div>

                  {/* BG color */}
                  <MainLabel
                    label={isGradient ? colorlabels[1] : colorlabels[0]}
                    value={isGradient ? NaN : bgOpacity}
                    valueInline={!isGradient}
                    valueSuffix=""
                    valueColor="#94a3b8"
                    valueRef={setMetricLabelRef("bgOpacity")}
                  />

                  {!isGradient ? (
                    <ServiceColor
                      color={bgColor}
                      opacity={bgOpacity}
                      handleColor={(value) => handleSelect(value, "bgColor")}
                      handleOpacity={(e) =>
                        handleRange("bgOpacity", Number(e.target.value))
                      }
                      onCommit={handleRangeCommit}
                      rangeColor={darkTextColor || "#000000"}
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
                        onCommit={handleRangeCommit}
                        rangeColor={darkMode === "dark" ? darkTextColor : "#000000"}
                        darkMode={darkMode}
                      />

                      <MainLabel
                        label="องศา"
                        value={bgDegree}
                        valueInline
                        valueSuffix=""
                        valueColor="#94a3b8"
                        valueRef={setMetricLabelRef("bgDegree")}
                      />

                      <Range
                        darkMode={darkMode}
                        darkTextColor={darkTextColor}
                        name="bgDegree"
                        value={bgDegree}
                        min={0}
                        max={360}
                        step={1}
                        handleChange={handleRange}
                        onCommit={handleRangeCommit}
                        controlLabel="องศาไล่โทน"
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
                            valueRef={setMetricLabelRef(name)}
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
                            onCommit={handleRangeCommit}
                            controlLabel={label}
                          />
                        </div>
                      );
                    })}
                  </div>
                  )}
                  {!isTablet && <MainLabel label="โซเชียล" />}
                  {!isTablet && (
                    <SocialItemList
                      items={iconGroup}
                      darkMode={darkMode}
                      darkTextColor={darkTextColor}
                      onFieldChange={handleChange}
                      onFieldBlur={handleFieldBlur}
                      onRangeChange={handleRange}
                      onRangeCommit={handleRangeCommit}
                      onMetricLabelRef={setMetricLabelRef}
                      onCopy={copy}
                      onRemove={remove}
                      onSelectChange={handleSelect}
                    />
                  )}
                </div>
              )}

              {menu === "Text" && (
                <div className="px-6">
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
                      <Typography
                        className="text-slate-700 dark:text-white/80"
                        sx={{ fontSize: 13, ml: 2 }}
                      >
                        เปิดใช้งาน Top Bar
                      </Typography>
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
                            valueRef={setMetricLabelRef(name)}
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
                            onCommit={handleRangeCommit}
                            controlLabel={label}
                          />
                        </div>
                      );
                    })}
                  </div>
                  )}
                  <MainLabel label="ข้อความ" />
                  <TextItemList
                    items={textGroup}
                    darkMode={darkMode}
                    darkTextColor={darkTextColor}
                    onFieldChange={handleChange}
                    onFieldBlur={handleFieldBlur}
                    onRangeChange={handleRange}
                    onRangeCommit={handleRangeCommit}
                    onMetricLabelRef={setMetricLabelRef}
                    onCopy={copy}
                    onRemove={remove}
                    onSelectChange={handleSelect}
                  />
                </div>
              )}
            </li>
          </ul>
        </nav>
    </div>
  );

  function MainLabel({
    label,
    value = NaN,
    valueSuffix = "PX",
    valueInline = false,
    valueColor = "gray",
    valueRef = null,
  }) {
    const w = "flex-1";
    let colorSwitchList = [
      "สีพื้นหลังบาร์",
      "สีพื้นหลังแบบสีพื้น",
      "สีพื้นหลังแบบไล่โทน",
    ];

    const colorSwitch = colorSwitchList.includes(label);
    // หัวข้อสีพื้นหลัง: แสดง "สีพื้นหลัง" / "สีไล่โทน" คงที่ — สีข้อความสวิตช์เท่า value หลังหัวข้อ
    const isBgColorLabel = [
      "สีพื้นหลังแบบสีพื้น",
      "สีพื้นหลังแบบไล่โทน",
    ].includes(label);
    const displayLabel = isBgColorLabel ? "สีพื้นหลัง" : label;

    const checked = () => {
      if (colorSwitchList.includes(label)) {
        return isGradient;
      }
    };

    const mb =
      label === "ขนาดกรอบ" ||
      label === "ความโค้งมน" ||
      label === "ความสูง" ||
      label === "องศา"
        ? "mb-[7px]"
        : "mb-3";

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
        <span className="dash-panel-label text-[13px] font-bold">
          {displayLabel}
        </span>
        {valueInline && !Number.isNaN(value) && (
          <span
            ref={valueRef}
            className="text-[13px]"
            style={{ color: valueColor }}
          >
            {value}
            {valueSuffix ? ` ${valueSuffix}` : ""}
          </span>
        )}
        <div className={`dash-heading-rule border-b ${w}`}></div>
        {colorSwitch && (
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <AntSwitch
              inputProps={{ "aria-label": "ant design" }}
              checked={checked()}
              onChange={() => {
                onSwitch();
              }}
            />
            <Typography
              className="text-slate-400 dark:text-slate-400"
              sx={{ fontSize: 13 }}
            >
              สีไล่โทน
            </Typography>
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
