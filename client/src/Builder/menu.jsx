import React, {
  Profiler,
  startTransition,
  useEffect,
  memo,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";
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
  Ban,
  ChevronDown,
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
import IconAwsome from "./IconAwsome";
import ServiceIcon from "./ServiceIcon";
import { panelGroupButtonSx, panelGroupRootBorderSx } from "./panelControlSx";
import {
  ensurePageCatalogLoaded,
  usePageCatalog,
} from "./store/pageDocument";
import { BuilderPerformanceTrigger } from "./performance/BuilderPerformanceMonitor";
import ElementPerformanceBoundary from "./performance/ElementPerformanceBoundary";
import {
  beginBuilderPerformanceTransaction,
  finishBuilderPerformanceTransactionAfterPaint,
  recordBuilderCanvasCommit,
  recordBuilderPanelControlEvent,
} from "./performance/builderPerformanceStore";
import {
  TOP_BAR_PREVIEW_ID,
  TOP_BAR_PREVIEW_TYPE,
  usePanelPreview,
} from "./panelPreviewStore";
import {
  buildFooterBackgroundStyle,
  getSliderLiveFooterBar,
  normalizeFooterDegree,
} from "./footerBarChromePreview";
import {
  buildTopBarBackgroundStyle,
  getSliderLiveTopBar,
  normalizeTopBarDegree,
} from "./topBarChromePreview";
import MenuBarLogo from "./MenuBarLogo";









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

  const borderColor = "var(--dash-panel-input-border, #e2e8f0)"
  const textColor = darkMode === "dark"?"#ffffff":"#18181b"
  const bgcolor = "var(--dash-panel-btn-group-inactive, #ffffff)"

  const inputStyle =  {
    borderColor,
    color:textColor,
    borderWidth: "1px",
    borderTopRightRadius: radiusRight,
    borderBottomRightRadius: radiusRight,
    borderRightWidth: broderRight,
    borderTopLeftRadius: radiusLeft,
    borderBottomLeftRadius: radiusLeft,
    borderLeftWidth: broderLeft,
    ...(useInputBottomOffset ? { height } : { top: 0, bottom: 0, height: "100%" }),
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
      minHeight: height,
      maxHeight: height,
      boxSizing: "border-box",
      padding: 0,
      alignItems: "center",
      overflow: "hidden",
      boxShadow: "none",
      backgroundColor: bgcolor,
      "&.Mui-focused": {
        boxShadow: "none",
      },
    },
    "& .MuiInputBase-root": {
      height,
      minHeight: height,
      maxHeight: height,
      boxSizing: "border-box",
    },
    "& .MuiOutlinedInput-input": {
      fontSize,
      color:textColor,
      height,
      minHeight: height,
      maxHeight: height,
      paddingTop: 0,
      paddingBottom: 0,
      paddingLeft: "12px",
      paddingRight: "12px",
      lineHeight: `${height}px`,
      boxSizing: "border-box",
      margin: 0,
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






function UrlRowInput({ name, value, onChange, darkMode, placeholder = "#", inputType = "url" }) {
  const textColor = darkMode === "dark" ? "#ffffff" : "#18181b";
  const borderColor = "var(--dash-panel-input-border, #e2e8f0)";
  const bgcolor = "var(--dash-panel-btn-group-inactive, #ffffff)";
  return (
    <input
      type={inputType}
      name={name}
      value={value || ""}
      placeholder={placeholder}
      onChange={onChange}
      className="w-full min-w-0 outline-none"
      style={{
        height: MENU_TARGET_ROW_HEIGHT,
        minHeight: MENU_TARGET_ROW_HEIGHT,
        maxHeight: MENU_TARGET_ROW_HEIGHT,
        boxSizing: "border-box",
        margin: 0,
        border: `1px solid ${borderColor}`,
        borderRadius: 5,
        backgroundColor: bgcolor,
        color: textColor,
        fontSize: 13,
        lineHeight: `${MENU_TARGET_ROW_HEIGHT - 2}px`,
        padding: "0 12px",
      }}
    />
  );
}

function OptionButtonGroup({
  label,
  name,
  value,
  datas,
  handleChange,
  height = MENU_TARGET_ROW_HEIGHT,
}) {
  return (
    <Box sx={{ display: "flex", alignItems: "stretch", minWidth: 0, height }}>
      <ButtonGroup
        variant="outlined"
        disableElevation
        color="inherit"
        aria-label={label || "ตัวเลือก"}
        sx={{
          ...panelGroupRootBorderSx,
          flexShrink: 0,
          height,
          boxShadow: "none",
          "& .MuiButton-root": {
            boxShadow: "none",
            boxSizing: "border-box",
          },
        }}
      >
        {datas.map(({ label: optionLabel, value: optionValue }) => {
          const selected = value === optionValue;
          return (
            <Button
              key={optionValue}
              size="small"
              color="inherit"
              onClick={() =>
                handleChange({ target: { name, value: optionValue } })
              }
              sx={{
                ...panelGroupButtonSx(selected),
                height,
                minHeight: height,
                maxHeight: height,
                minWidth: 92,
                fontSize: 13,
                fontWeight: 400,
                px: 2,
                py: 0,
                lineHeight: 1,
                flex: "0 0 auto",
              }}
            >
              {optionLabel}
            </Button>
          );
        })}
      </ButtonGroup>
    </Box>
  );
}

function RadioInput({ label,name, value,datas,handleChange, color,textColor,gap=7,labelMr=1.1}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        minWidth: 0,
        py: "3px",
        my: "5px",
      }}
    >
      <Typography
        sx={{
          fontSize: 13,
          mr: labelMr,
          color: textColor,
          lineHeight: 1,
          flexShrink: 0,
        }}
      >
        {label}
      </Typography>
       <RadioGroup
    row
    sx={{
      gap,
      flex: 1,
      minWidth: 0,
      flexWrap: "wrap",
      alignItems: "center",
    }}
    name={name}
    value={value}
    onChange={handleChange}
  >
      {datas.map(({ label:l, value:v }) => (
              <FormControlLabel
      key={v}
      value={v}
      control={
        <Radio
          sx={() => {
            return {
              color: color,
              padding: "5px",
              "&.Mui-checked": { color: color },
              "&:hover": { backgroundColor: "transparent" },
              "&.Mui-checked:hover": { backgroundColor: "transparent" },
            };
          }}
        />
      }
      label={l}
      sx={{
        mr: 0,
        ml: 0,
        "& .MuiFormControlLabel-label": {
          fontSize: 13,
          color: textColor,
          whiteSpace: "nowrap",
        },
      }}
    />
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

  const size = 13 * height / 35



  return (

      <Button
      onClick={()=>{
        handleClick()
      }}
        variant={hideBorder ? "text" : "contained"}
        disableRipple={hideBorder}
        sx={{
          boxShadow: "none",
          outline: "none",
          boxSizing: "border-box",
          overflow: "hidden",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          lineHeight: 0,
          aspectRatio: "1 / 1",
          height,
          minHeight: height,
          width: height,
          minWidth: height,
          padding: 0,
          borderTopLeftRadius: radiusLArr[radius], 
          borderBottomLeftRadius:radiusLArr[radius],
          borderTopRightRadius:
          radiusRArr[radius],
          borderBottomRightRadius:
          radiusRArr[radius],
          border: "1px solid",
          borderColor: hideBorder ? "transparent" : borderColor,
          borderRightWidth: hideBorder ? 0 : borderRight,
          borderLeftWidth: hideBorder ? 0 : 1,
          bgcolor: bgColor,
          backgroundColor: bgColor,
          "&:hover": {
            bgcolor: bgColor,
            backgroundColor: bgColor,
            borderColor: hideBorder ? "transparent" : borderColor,
            boxShadow: "none",
            outline: "none",
          },
          "&:focus": {
            outline: "none",
            borderColor: hideBorder ? "transparent" : borderColor,
          },
          "&:focus-visible": {
            outline: "none",
            borderColor: hideBorder ? "transparent" : borderColor,
          },
          color: "inherit",
          ".dark &": hideBorder
            ? {
                borderColor: "transparent",
                backgroundColor: "transparent",
                "&:hover": {
                  borderColor: "transparent",
                  backgroundColor: "transparent",
                  boxShadow: "none",
                },
                "&:focus": { borderColor: "transparent" },
              }
            : {
                borderColor: "var(--dash-panel-input-border, #e2e8f0)",
                "&:hover": {
                  borderColor: "var(--dash-panel-input-border, #e2e8f0)",
                },
              },
        }}
      >

          <Box
            sx={{
              width: size,
              height: size,
              display: "grid",
              placeItems: "center",
              lineHeight: 0,
            }}
          >
            {hasVisibleIcon(Icon) ? (
              <IconAwsome
                style={{
                  color,
                  fontSize: size,
                  width: size,
                  height: size,
                  lineHeight: 1,
                  display: "block",
                }}
                iconType={Icon.type}
                iconName={Icon.name}
              />
            ) : (
              <Ban
                size={size}
                strokeWidth={2}
                style={{ color, opacity: 0.55 }}
                aria-label="ไม่มีไอคอน"
              />
            )}
          </Box>
          {text ? (
            <Box
              sx={{
                color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                lineHeight: 1,
              }}
            >
              {text}
            </Box>
          ) : null}
       
        
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

function Field({label,name,value,handleChange,darkMode,children,fieldHeight=40, useInputBottomOffset = true}) {



  return (
    <FormControl fullWidth sx={{ height: fieldHeight }}>
      <Box sx={{ display: "flex", width: "100%", height: fieldHeight, alignItems: "stretch" }}>
        <TextField
          hiddenLabel
          sx={{
            ...COMMON_FIELD_SX(Boolean(children),false,darkMode,fieldHeight, 13, useInputBottomOffset),
            height: fieldHeight,
            minHeight: fieldHeight,
            maxHeight: fieldHeight,
            margin: 0,
          }}
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
  fieldHeight = MENU_TARGET_ROW_HEIGHT,
}) {
  return (
    <FormControl fullWidth>
      <Box
        sx={{
          display: "flex",
          width: "100%",
          alignItems: "center",
          height: fieldHeight,
          minHeight: fieldHeight,
          gap: 1.5,
        }}
      >
        <Box sx={{ flexShrink: 0, height: fieldHeight }}>
          <Btn
            radius="normal"
            lastChild={true}
            height={fieldHeight}
            Icon={Icon}
            bgColor={darkMode === "dark" ? "#494d54" : "#333333"}
            borderColor="var(--dash-panel-input-border, #e2e8f0)"
            handleClick={handleClick}
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0, height: fieldHeight }}>
          <UrlRowInput
            name={name}
            value={value}
            placeholder={label}
            inputType="text"
            darkMode={darkMode}
            onChange={handleChange}
          />
        </Box>
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
  const borderColor = "var(--dash-panel-input-border, #e2e8f0)"
  const bgcolor = "var(--dash-panel-btn-group-inactive, #ffffff)"
  const safeOptions = Array.isArray(datas) ? datas : [];
  const normalizeOptionValue = (input) =>
    String(input ?? "")
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase();
  const matchedValue = safeOptions.find(
    (option) => normalizeOptionValue(option) === normalizeOptionValue(value)
  );
  const safeValue = matchedValue ?? "";

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
      value={safeValue}
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
      {safeOptions.map((data,i) => {
        const isSelected = data === safeValue;
        const isBeforeSelected = safeOptions[i + 1] === safeValue;
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

const MENU_TARGET_ROW_HEIGHT = 44;

const types = [
  { label: "หน้า", value: "page" },
  { label: "URL", value: "URL" },
  { label: "Landing Page", value: "landing" },
]
const targets = [ {label:"หน้าเดิม",value:"_self"}, {label:"หน้าใหม่",value:"_blank"}, ]


const MenuList = memo(function MenuList({
  pageNames,
  item,
  remove,
  copy,
  handleChange,
  isOpen,
  toggleOpen,
  collapseIcon,
  isDraggable,
  darkMode,
  darkTextColor,setOpenIconModal,iconModalOpen,
}) {
  const { id,icon, name, type, page, url, target } = item;


  /* พื้นหลัง/กรอบเท่า input ธีม (Settings → สีกรอบ) */
  const bgMenu = "var(--dash-panel-btn-group-inactive, #ffffff)"
  const bgMenuOption = "var(--dash-panel-btn-group-inactive, #ffffff)"
  const borderColor = "var(--dash-panel-input-border, #e2e8f0)"
  const textColor = darkMode === "dark"?"#ffffff":"#202020"

  const menuButtons = [
    { Icon: Copy, funct: copy, label: "คัดลอก" },
    { Icon: CircleX, funct: remove, label: "ลบ" },
  ];

  const menuActionIconColor = darkMode === "dark" ? "#a1a1aa" : "#9ca3af";
  const handleMenuItemPerformanceEvent = (event) => {
    if (event?.type === "pointerdown") return;
    if (
      event?.target?.closest?.(
        ".menu-item-action-btn, .menu-tree-collapse-hit, .menu-item-toggle-btn"
      )
    ) {
      return;
    }
    recordBuilderPanelControlEvent(event, {
      panelType: "Menu Item",
      elementType: "menu-item",
      elementId: String(id || ""),
      labelPrefix: "รายการเมนู",
      trackFrames: true,
    });
  };
  const MenuButton = ({ Icon, funct, label }) => (
    <button
      type="button"
      data-perf-control={label}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        funct(id);
      }}
      className="menu-item-action-btn inline-flex h-7 w-7 shrink-0 items-center justify-center border-0 bg-transparent p-0 shadow-none outline-none ring-0 hover:bg-transparent hover:opacity-80 focus:outline-none focus:ring-0"
      style={{ border: "none", boxShadow: "none", background: "transparent" }}
      aria-label={label || "menu-item-action"}
    >
      {Icon ? (
        <Icon
          size={16}
          strokeWidth={2}
          style={{ color: menuActionIconColor }}
          aria-hidden
        />
      ) : null}
    </button>
  );

  const [showDetails, setShowDetails] = useState(isOpen);
  const [animateOpen, setAnimateOpen] = useState(false);
  useEffect(() => {
    if (isOpen) {
      setShowDetails(true);
      return undefined;
    }
    setAnimateOpen(false);
    const closeTimer = window.setTimeout(() => setShowDetails(false), 300);
    return () => window.clearTimeout(closeTimer);
  }, [isOpen]);
  useEffect(() => {
    if (!showDetails || !isOpen) return undefined;
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setAnimateOpen(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [showDetails, isOpen]);

  const summaryRow = (
    <>
          {collapseIcon ? (
            React.isValidElement(collapseIcon)
              ? React.cloneElement(collapseIcon, {
                  className: "menu-tree-collapse-hit",
                  onClick: (event) => {
                    event?.stopPropagation?.();
                    const collapsed = Boolean(
                      event?.currentTarget?.closest?.(
                        ".nestable-item--children-collapsed"
                      )
                    );
                    measureMenuItemAction(
                      collapsed ? "canvas-expand" : "canvas-collapse",
                      collapsed ? "เปิดเมนูย่อย" : "ยุบเมนูย่อย",
                      id
                    );
                    collapseIcon.props?.onClick?.(event);
                  },
                  children: (
                    <span className="menu-tree-collapse-icon" aria-hidden>
                      <span className="menu-tree-collapse-minus">−</span>
                      <span className="menu-tree-collapse-plus">+</span>
                    </span>
                  ),
                })
              : collapseIcon
          ) : null}
          {hasVisibleIcon(icon) && (
            <IconAwsome iconType={icon.type} iconName={icon.name} style={{
              fontSize:15,
              marginLeft:12,
              color:textColor
            }}/>
          )}

        <span
          style={{
            marginLeft: 16,
            fontSize: 14,
            flex: 1,
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            color: textColor,
            fontWeight: isOpen ? 700 : 400,
          }}
        >
          {name || "Home"}
        </span>

        <div
          style={{
            marginLeft: 8,
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexShrink: 0,
          }}
        >
          {menuButtons.map((b, i) => (
            <MenuButton key={i} Icon={b.Icon} funct={b.funct} label={b.label} />
          ))}
        </div>
        <div
          className="menu-item-toggle-btn"
          data-perf-control={isOpen ? "ปิดรายการเมนู" : "เปิดรายการเมนู"}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            measureMenuItemAction(
              "canvas-toggle",
              isOpen ? "ปิดรายการเมนู" : "เปิดรายการเมนู",
              id
            );
            toggleOpen(id);
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
          }}
        >
          <ChevronDown
            size={16}
            style={{
              color: darkMode === "dark"?"#ffffff":"#202020",
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 280ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />
        </div>
    </>
  );

  if (!showDetails) {
    return (
        <div
          className="menu-item-theme-card"
          style={{
            marginTop: 8,
            marginBottom: 8,
            cursor: isDraggable ? "grab" : "pointer",
            height: 42,
            minHeight: 42,
            display: "flex",
            alignItems: "center",
            width: "100%",
            gap: 8,
            paddingLeft: 8,
            paddingRight: 8,
            border: `1px solid ${borderColor}`,
            borderRadius: 5,
            overflow: "visible",
            backgroundColor: bgMenu,
          }}
          onClickCapture={handleMenuItemPerformanceEvent}
        >
          {summaryRow}
        </div>
    );
  }

  return (
    <ElementPerformanceBoundary
      elementType="menu-item"
      elementId={String(id || "")}
      selected={isOpen}
    >
    <Box
      sx={{ my: 1, cursor: isDraggable ? "grab" : "pointer" }}
      onClickCapture={handleMenuItemPerformanceEvent}
      onChangeCapture={handleMenuItemPerformanceEvent}
      onInputCapture={handleMenuItemPerformanceEvent}
    >
          <Accordion
      expanded={animateOpen}
      onChange={() => {}}
      slotProps={{
        transition: {
          timeout: 280,
          unmountOnExit: true,
          easing: {
            enter: "cubic-bezier(0.22, 1, 0.36, 1)",
            exit: "cubic-bezier(0.4, 0, 0.2, 1)",
          },
        },
      }}
      sx={{
        boxShadow: "none",
        m: 0,
        border: `1px solid ${borderColor}`,
        borderRadius: "5px",
        overflow: "visible",
        backgroundColor: `${bgMenu} !important`,
        backgroundImage: "none !important",
        "&:before": { display: "none" },
        "&:not(.Mui-expanded):before": { display: "none" },
        "&.MuiPaper-root": {
          backgroundColor: `${bgMenu} !important`,
          backgroundImage: "none !important",
        },
        "&.Mui-expanded": {
          backgroundColor: `${bgMenu} !important`,
          backgroundImage: "none !important",
        },
        "& .MuiCollapse-root": {
          backgroundColor: bgMenuOption,
        },
      }}
      className="menu-item-theme-card"
    >
      <AccordionSummary
        expandIcon={null}   // ✅ ปิด expandIcon ของ MUI ไปเลย
        component="div"  
        sx={{
          cursor: (isDraggable ? "grab" : "pointer") + " !important",
          height: 42,
          minHeight: 42,
          backgroundColor: `${bgMenu} !important`,
          backgroundImage: "none !important",
          border: 0,
          borderRadius: "5px",
          px: 1,
          overflow: "visible",
          "&.Mui-expanded": {
            minHeight: 42,
            borderRadius: "5px 5px 0 0",
            backgroundColor: `${bgMenu} !important`,
            backgroundImage: "none !important",
          },
          "& .MuiAccordionSummary-content": {
            m: 0,
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            width: "100%",
            gap: 1,
            overflow: "visible",
          },
          "& .MuiAccordionSummary-content.Mui-expanded": { m: 0 },
        }}
      >
        {summaryRow}
      </AccordionSummary>

      <AccordionDetails
        sx={{
          backgroundColor: `${bgMenuOption} !important`,
          backgroundImage: "none !important",
          borderRadius: 1,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
        }}
      >
      <FieldWithBtn
          label="Home"
          Icon={icon}
          fieldHeight={MENU_TARGET_ROW_HEIGHT}
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
          gap={2}
          handleChange={(e) => handleChange(e, id)}
        />
        {type === "page" && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              minWidth: 0,
              gap: 1.5,
              mt: 0.5,
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
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
            </Box>
            <Box sx={{ flexShrink: 0 }}>
              <OptionButtonGroup
                label="รูปแบบ"
                value={target}
                name="target"
                datas={targets}
                height={44}
                handleChange={(e) => handleChange(e, id)}
              />
            </Box>
          </Box>
        )}
        {type === "URL" && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              minWidth: 0,
              height: MENU_TARGET_ROW_HEIGHT,
              gap: 1.5,
              mt: 0.5,
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0, height: MENU_TARGET_ROW_HEIGHT }}>
              <UrlRowInput
                name="url"
                value={url}
                placeholder="#"
                darkMode={darkMode}
                onChange={(e) => handleChange(e, id)}
              />
            </Box>
            <Box sx={{ flexShrink: 0, height: MENU_TARGET_ROW_HEIGHT }}>
              <OptionButtonGroup
                label="รูปแบบ"
                value={target}
                name="target"
                datas={targets}
                handleChange={(e) => handleChange(e, id)}
              />
            </Box>
          </Box>
        )}
        {type === "landing" && (
          <Box sx={{ width: "100%", minWidth: 0, height: MENU_TARGET_ROW_HEIGHT, mt: 0.5 }}>
            <UrlRowInput
              name="url"
              value={url}
              placeholder="วาง Section ID ที่คัดลอก"
              inputType="text"
              darkMode={darkMode}
              onChange={(e) => handleChange(e, id)}
            />
          </Box>
        )}
      </AccordionDetails>
    </Accordion>

      <ServiceIcon darkColor={darkTextColor} header="ไอคอน" icon={icon} open={iconModalOpen} onClose={()=>setOpenIconModal(false)} handleChange={(icon)=>handleChange({target:{name:"icon",value:icon}},id)} darkMode={darkMode}/>

    
    </Box>
    </ElementPerformanceBoundary>
  
  );
}, areMenuListPropsEqual);

function getMenuChildren(item) {
  return Array.isArray(item?.children) ? item.children : [];
}

function cloneMenuItemWithNewIds(item) {
  return {
    ...item,
    id: Math.round(Math.random() * 1e9),
    children: getMenuChildren(item).map(cloneMenuItemWithNewIds),
  };
}

function insertClonedMenuItem(items, id) {
  if (!Array.isArray(items) || items.length === 0) return items;
  const idx = items.findIndex((item) => item.id === id);
  if (idx !== -1) {
    const next = items.slice();
    next.splice(idx + 1, 0, cloneMenuItemWithNewIds(items[idx]));
    return next;
  }
  let changed = false;
  const next = items.map((item) => {
    const children = getMenuChildren(item);
    if (children.length === 0) return item;
    const nextChildren = insertClonedMenuItem(children, id);
    if (nextChildren === children) return item;
    changed = true;
    return { ...item, children: nextChildren };
  });
  return changed ? next : items;
}

function removeMenuItemById(items, id, isRoot = true) {
  if (!Array.isArray(items) || items.length === 0) return items;
  const idx = items.findIndex((item) => item.id === id);
  if (idx !== -1) {
    if (isRoot && items.length === 1) return items;
    return items.filter((_, index) => index !== idx);
  }
  let changed = false;
  const next = items.map((item) => {
    const children = getMenuChildren(item);
    if (children.length === 0) return item;
    const nextChildren = removeMenuItemById(children, id, false);
    if (nextChildren === children) return item;
    changed = true;
    return { ...item, children: nextChildren };
  });
  return changed ? next : items;
}

function updateMenuItemField(items, id, name, value) {
  if (!Array.isArray(items) || items.length === 0) return items;
  const idx = items.findIndex((item) => item.id === id);
  if (idx !== -1) {
    const current = items[idx];
    if (current[name] === value) return items;
    const next = items.slice();
    next[idx] = { ...current, [name]: value };
    return next;
  }
  let changed = false;
  const next = items.map((item) => {
    const children = getMenuChildren(item);
    if (children.length === 0) return item;
    const nextChildren = updateMenuItemField(children, id, name, value);
    if (nextChildren === children) return item;
    changed = true;
    return { ...item, children: nextChildren };
  });
  return changed ? next : items;
}

function measureMenuItemAction(kind, label, id) {
  const transactionId = beginBuilderPerformanceTransaction(
    kind,
    {
      label,
      elementType: "menu-item",
      elementId: String(id || ""),
      panelType: "Menu",
      scope: "menu",
    },
    { trackFrames: true }
  );
  finishBuilderPerformanceTransactionAfterPaint(
    transactionId,
    {},
    { reason: kind }
  );
}

function areMenuListPropsEqual(prev, next) {
  return (
    prev.isOpen === next.isOpen &&
    prev.isDraggable === next.isDraggable &&
    prev.pageNames === next.pageNames &&
    prev.darkMode === next.darkMode &&
    prev.darkTextColor === next.darkTextColor &&
    prev.iconModalOpen === next.iconModalOpen &&
    prev.item?.id === next.item?.id &&
    prev.item?.name === next.item?.name &&
    prev.item?.type === next.item?.type &&
    prev.item?.page === next.item?.page &&
    prev.item?.url === next.item?.url &&
    prev.item?.target === next.item?.target &&
    prev.item?.icon === next.item?.icon &&
    getMenuChildren(prev.item).length === getMenuChildren(next.item).length
  );
}



const PARENT_MENUS_FLUSH_MS = 64;

const MenuDesignTree = memo(function MenuDesignTree({
  menus,
  setMenus,
  pageNames,
  darkMode,
  darkTextColor,
}) {
  const [items, setItems] = useState(menus);
  const itemsRef = useRef(menus);
  const flushTimerRef = useRef(null);
  itemsRef.current = items;

  const flushParentMenus = useCallback(() => {
    if (flushTimerRef.current != null) {
      window.clearTimeout(flushTimerRef.current);
      flushTimerRef.current = null;
    }
    const next = itemsRef.current;
    startTransition(() => {
      setMenus(next);
    });
  }, [setMenus]);

  const scheduleParentFlush = useCallback(() => {
    if (flushTimerRef.current != null) window.clearTimeout(flushTimerRef.current);
    flushTimerRef.current = window.setTimeout(() => {
      flushTimerRef.current = null;
      flushParentMenus();
    }, PARENT_MENUS_FLUSH_MS);
  }, [flushParentMenus]);

  useEffect(() => {
    if (flushTimerRef.current != null) return;
    if (menus === itemsRef.current) return;
    setItems(menus);
    itemsRef.current = menus;
  }, [menus]);

  useEffect(
    () => () => {
      if (flushTimerRef.current != null) {
        window.clearTimeout(flushTimerRef.current);
        flushTimerRef.current = null;
        setMenus(itemsRef.current);
      }
    },
    [setMenus]
  );

  const updateItems = useCallback(
    (updater) => {
      setItems((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        itemsRef.current = next;
        return next;
      });
      scheduleParentFlush();
    },
    [scheduleParentFlush]
  );

  const handleChange = useCallback(
    (e, id) => {
      const { name, value } = e.target;
      updateItems((prev) => updateMenuItemField(prev, id, name, value));
    },
    [updateItems]
  );

  const cloneMenu = useCallback((id) => {
    measureMenuItemAction("canvas-clone", "คัดลอกรายการเมนู", id);
    updateItems((prev) => insertClonedMenuItem(prev, id));
  }, [updateItems]);

  const deleteMenu = useCallback((id) => {
    measureMenuItemAction("canvas-delete", "ลบรายการเมนู", id);
    updateItems((prev) => removeMenuItemById(prev, id));
  }, [updateItems]);

  const [openMenu, setOpenMenu] = useState({});
  const [openIconModal, setOpenIconModal] = useState(null);

  const toggleOpen = useCallback((id) => {
    setOpenMenu((prev) => {
      const next = {};
      for (const nid in prev) {
        if (nid != id) next[nid] = false;
      }
      next[id] = !prev[id];
      return next;
    });
  }, []);

  const menuListBindingsRef = useRef({
    pageNames,
    openMenu,
    toggleOpen,
    deleteMenu,
    cloneMenu,
    handleChange,
    darkMode,
    darkTextColor,
    setOpenIconModal,
    openIconModal,
  });
  menuListBindingsRef.current = {
    pageNames,
    openMenu,
    toggleOpen,
    deleteMenu,
    cloneMenu,
    handleChange,
    darkMode,
    darkTextColor,
    setOpenIconModal,
    openIconModal,
  };

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

  const renderMenu = useCallback((args) => {
    const bindings = menuListBindingsRef.current;
    return (
      <MenuList
        {...args}
        pageNames={bindings.pageNames}
        isOpen={!!bindings.openMenu[args.item.id]}
        toggleOpen={bindings.toggleOpen}
        remove={bindings.deleteMenu}
        copy={bindings.cloneMenu}
        handleChange={bindings.handleChange}
        isDraggable={args.isDraggable}
        darkMode={bindings.darkMode}
        darkTextColor={bindings.darkTextColor}
        setOpenIconModal={bindings.setOpenIconModal}
        iconModalOpen={bindings.openIconModal === args.item.id}
      />
    );
  }, []);

  const disableDrag = useCallback(
    ({ item }) => !menuListBindingsRef.current.openMenu[item.id],
    []
  );

  const handleMenuDragStart = useCallback(
    (payload) => {
      setOpenMenu({});
      applyDragScrollCompensation(payload);
    },
    [applyDragScrollCompensation]
  );

  const handleMenuReorder = useCallback(
    ({ items: newItems }) => {
      const transactionId = beginBuilderPerformanceTransaction(
        "canvas-reorder",
        {
          label: "จัดเรียงรายการเมนู",
          elementType: "menu-item",
          elementId: "menu-tree",
          panelType: "Menu",
          scope: "menu",
        },
        { trackFrames: true }
      );
      updateItems(newItems);
      finishBuilderPerformanceTransactionAfterPaint(
        transactionId,
        {},
        { reason: "menu-reorder" }
      );
    },
    [updateItems]
  );

  return (
    <div className="menuTree">
      <Nestable
        items={items}
        renderItem={renderMenu}
        onChange={handleMenuReorder}
        onDragStart={handleMenuDragStart}
        onDragEnd={clearDragScrollCompensation}
        maxDepth={4}
        threshold={30}
        disableDrag={disableDrag}
      />
    </div>
  );
});

function LiveMenuTopBarPreview({ topBar, device, setColor }) {
  const topBarPreview = usePanelPreview(
    TOP_BAR_PREVIEW_TYPE,
    TOP_BAR_PREVIEW_ID
  );
  const liveTopBar = topBarPreview || getSliderLiveTopBar() || topBar || {};
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
    bgDegree: topBarBgDegreeRaw = 0,
    borderSize = 26,
    radius = 50,
    iconGroup = [],
    radiusText = 50,
    borderTextSize = 26,
    textGroup = [],
  } = liveTopBar;
  const showTopBarPreview =
    !hideTopBarEverywhere && (tabletTopBarMode || "social") !== "off";
  const isTextTopBarPreviewMode = (tabletTopBarMode || "social") === "text";
  if (!showTopBarPreview) return null;
  const topBarBgDegree = normalizeTopBarDegree(topBarBgDegreeRaw);
  const topBarBg = setColor(
    topBarIsGradient ? topBarBgColorGradient : topBarBgColor,
    topBarIsGradient ? topBarBgOpacityGradient : topBarBgOpacity,
    topBarIsGradient,
    topBarIsGradient ? topBarBgDegree : null
  );
  const topBarBgStyle = buildTopBarBackgroundStyle(topBarIsGradient, topBarBg);
  return (
    <div
      data-builder-topbar="true"
      className={`flex items-center px-3 ${
        device === "Mobile" && isTextTopBarPreviewMode
          ? "justify-start overflow-hidden"
          : "justify-center"
      }`}
      style={
        device === "Mobile" && isTextTopBarPreviewMode
          ? { height: topBarHeight, ...topBarBgStyle, scrollbarWidth: "none", msOverflowStyle: "none" }
          : { height: topBarHeight, ...topBarBgStyle }
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
                    data-builder-topbar-chip="text"
                    data-builder-topbar-index={i}
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
                    data-builder-topbar-text="true"
                    data-builder-topbar-index={i}
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
                  data-builder-topbar-chip="social"
                  data-builder-topbar-index={i}
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
  );
}

function MenuPage({menus, setMenus,navOpen,device,menuBar,theme,setNavOpen,navBottom,darkMode,darkTextColor,menuButtonRef,topBar,footerBar,setOpenBar}){




const [previewNavOpen, setPreviewNavOpen] = useState(navOpen);

useEffect(() => {
  setPreviewNavOpen(navOpen);
}, [navOpen]);

const pages = usePageCatalog()
const pageNames = useMemo(
  () => (Array.isArray(pages) ? pages.map((page) => page?.pageName) : []),
  [pages]
);
const menuBarPreview = usePanelPreview(
  "Menu",
  device === "Desktop" ? "" : `chrome:Menu:${device}`
);
const navBottomPreview = usePanelPreview(
  "Nav",
  `chrome:Nav:${device}`
);
const liveMenuBar =
  device === "Desktop" ? menuBar : (menuBarPreview || menuBar);
const liveNavBottom = navBottomPreview || navBottom;

   useEffect(()=>{
    ensurePageCatalogLoaded()
   },[])


const{
  // Main
  menuFontSize,
  menuFontWeight,

  menuColor,
  menuColorOpacity,

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

} = liveMenuBar;


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
    navDividerStyle,} = liveNavBottom

const {
  hideTopBarEverywhere = false,
  tabletTopBarMode = "social",
  topBarHeight = 52,
} = topBar || {};
const liveFooterBar = getSliderLiveFooterBar() || footerBar || {};
const {
  footerHeight = 46,
  isGradient: footerIsGradient = false,
  bgColor: footerBgColor = "#111827",
  bgOpacity: footerBgOpacity = 255,
  bgColorGradient: footerBgColorGradient = ["#111827", "#0f172a"],
  bgOpacityGradient: footerBgOpacityGradient = [255, 255],
  bgDegree: footerBgDegreeRaw = 0,
  logo: footerLogo = "",
  logoHeight: footerLogoHeight = 35,
  logoPosition: footerLogoPositionRaw = "center",
  textColor: footerTextColor = "#ffffff",
  textOpacity: footerTextOpacity = 255,
  textSize: footerTextSize = 13,
  leftText: footerLeftText = "© 2026 Domain.com",
  leftIcon: footerLeftIcon = { name: null, type: null },
  rightText: footerRightText = "All rights reserved.",
  rightIcon: footerRightIcon = { name: null, type: null },
  isFluidLayout: footerIsFluidLayout = false,
} = liveFooterBar;
const footerBgDegree = normalizeFooterDegree(footerBgDegreeRaw);



const opacity_2_hex = (opcy) => {
  if (opcy == null) return "";
  const numeric = Number(opcy);
  if (!Number.isFinite(numeric)) return "";
  return Math.max(0, Math.min(255, Math.round(numeric)))
    .toString(16)
    .toUpperCase()
    .padStart(2, "0");
};

const resolveColorHex = (value, fallback = "#000000") => {
  if (typeof value === "string" && value.trim()) return value;
  if (value && typeof value === "object") {
    const themedColor = theme?.[value.type]?.[value.index];
    if (typeof themedColor === "string" && themedColor.trim()) {
      return themedColor;
    }
  }
  return fallback;
};

const setColor = (
  color,
  opacity = null,
  isGradient = false,
  degree = null
) => {
  if (isGradient) {
    const colors = Array.isArray(color) ? color : [];
    const opacities = Array.isArray(opacity) ? opacity : [];
    const color1 =
      resolveColorHex(colors[0]) + opacity_2_hex(opacities[0]);
    const color2 =
      resolveColorHex(colors[1]) + opacity_2_hex(opacities[1]);
    const safeDegree = Number.isFinite(Number(degree)) ? Number(degree) : 0;
    return `linear-gradient(${safeDegree}deg, ${color1} 0%, ${color2} 100%)`;
  }
  return resolveColorHex(color) + opacity_2_hex(opacity);
};


const [opening,setOpeing] = useState({})

const buildClosedOpeningMap = useCallback((items = [], acc = {}) => {
  for (const m of items) {
    if (!m?.id) continue;
    acc[m.id] = false;
    if (Array.isArray(m.children) && m.children.length) {
      buildClosedOpeningMap(m.children, acc);
    }
  }
  return acc;
}, []);

useEffect(() => {
  setOpeing(buildClosedOpeningMap(menus));
  // ตั้งค่าเริ่มต้นครั้งเดียวตอน mount เท่านั้น — กันกระพริบจาก setState ซ้ำ
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);




const collectDescendantIds = useCallback((items, acc = []) => {
  for (const m of items) {
    acc.push(m.id);
    if (m.children?.length) collectDescendantIds(m.children, acc);
  }
  return acc;
}, []);



const closeSubTree = useCallback((menus) => {
  const ids = collectDescendantIds(menus);
  setOpeing((prev) => {
    const next = { ...prev };
    for (const id of ids) next[id] = false;
    return next;
  });
}, [collectDescendantIds]);



useEffect(() => {
  if (!previewNavOpen) {
    closeSubTree(menus);
  }
  // ปิดเฉพาะตอนพับพรีวิว — อย่าตาม menus ทุกครั้ง เพราะคัดลอก/ลบจะ setState ซ้ำโดยไม่จำเป็น
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [previewNavOpen]);


const mainBG = setColor(
  bgMenuColor,
  bgMenuOpacity)
const navBottomBg = setColor(bgNav, bgNavOpacity)


const paddingDivider = (10*navHeight)/56
const isModernNavBottom = navBottomDesign === "modern";
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
const previewScreenSkeletonStyle = useMemo(
  () =>
    isMobilePreview
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
        : {},
  [isMobilePreview, isTabletPreview, mobileSkeletonSvg, tabletSkeletonSvg]
);
const showTopBarPreview =
  !hideTopBarEverywhere && (tabletTopBarMode || "social") !== "off";
const previewTopOffset = (showTopBarPreview ? topBarHeight : 0) + barHeight;
const previewBottomOffset =
  device === "Mobile" && isAbleNavBottom === true ? navHeight : 0;
const menuBarBg = setColor(
  isMenuBarGradient ? bgMenuBarColorGradient : bgMenuBarColor,
  isMenuBarGradient ? bgMenuBarOpacityGradient : bgMenuBarOpacity,
  isMenuBarGradient,
  isMenuBarGradient ? bgMenuBarDegree : null
);
const footerBg = setColor(
  footerIsGradient ? footerBgColorGradient : footerBgColor,
  footerIsGradient ? footerBgOpacityGradient : footerBgOpacity,
  footerIsGradient,
  footerIsGradient ? footerBgDegree : null
);
const footerBgStyle = buildFooterBackgroundStyle(footerIsGradient, footerBg);
const footerTextColorValue = setColor(footerTextColor, footerTextOpacity);
const hasFooterLogo = String(footerLogo || "").trim() !== "";
const footerLogoPosition = ["hidden", "left", "center", "right"].includes(
  String(footerLogoPositionRaw || "").toLowerCase()
)
  ? String(footerLogoPositionRaw || "").toLowerCase()
  : "center";
const showFooterLogoLeft = hasFooterLogo && footerLogoPosition === "left";
const showFooterLogoCenter = hasFooterLogo && footerLogoPosition === "center";
const showFooterLogoRight = hasFooterLogo && footerLogoPosition === "right";

const SubMenu = ({menus})=>{

  return (
    <List
      sx={{ background: mainBG, p: 0, cursor: "pointer" }}
      onClickCapture={() => setOpenBar?.("Menu")}
    >
            {menus.map((m)=>{
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

useEffect(() => {
  if (!previewNavOpen) {
    requestAnimationFrame(() => {
      menuButtonRef.current?.focus?.();
    });
  }
}, [menuButtonRef, previewNavOpen]);




    const handleMenuCanvasRender = useCallback(
      (_id, phase, actualDuration, baseDuration) => {
        recordBuilderCanvasCommit(actualDuration, baseDuration, phase);
      },
      []
    );

    return( <main className="content-area flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden" area="main">

<Profiler id="MenuCanvas" onRender={handleMenuCanvasRender}>
<div className="min-h-[600px]">
<div className={`${["Mobile", "Tablet"].includes(device) ? "relative z-10 w-full" : "relative z-10 mx-auto w-full max-w-[880px] px-4 pt-6"}`}>
{device === "Desktop" && (
  <>
<MenuDesignTree
            menus={menus}
            setMenus={setMenus}
            pageNames={pageNames}
            darkMode={darkMode}
            darkTextColor={darkTextColor}
          />
<div
  data-builder-footer="true"
  className="mt-3 cursor-pointer overflow-hidden rounded-lg"
  style={footerBgStyle}
  onClick={() => setOpenBar?.("Footer")}
>
  <div
    data-builder-footer-inner="true"
    className={`flex items-center justify-between gap-4 px-4 ${footerIsFluidLayout ? "w-full" : "mx-auto w-full max-w-[1280px]"}`}
    style={{ height: footerHeight, minHeight: footerHeight, color: footerTextColorValue }}
  >
    <span
      data-builder-footer-text="true"
      className="min-w-0 flex flex-1 items-center gap-2"
      style={{ fontSize: `${footerTextSize}px` }}
    >
      {showFooterLogoLeft ? (
        <img
          data-builder-footer-logo="true"
          src={footerLogo}
          alt="footer-logo"
          className="object-contain"
          style={{ height: footerLogoHeight, maxWidth: 220 }}
        />
      ) : null}
      {hasVisibleIcon(footerLeftIcon) && (
        <IconAwsome
          iconName={footerLeftIcon.name}
          iconType={footerLeftIcon.type}
          style={{ marginRight: 2 }}
        />
      )}
      <span className="truncate">{footerLeftText}</span>
    </span>
    {showFooterLogoCenter ? (
      <div className="shrink-0 px-2">
        <img
          data-builder-footer-logo="true"
          src={footerLogo}
          alt="footer-logo"
          className="object-contain"
          style={{ height: footerLogoHeight, maxWidth: 220 }}
        />
      </div>
    ) : null}
    <span
      data-builder-footer-text="true"
      className="min-w-0 flex flex-1 items-center justify-end gap-2 text-right"
      style={{ fontSize: `${footerTextSize}px` }}
    >
      {showFooterLogoRight ? (
        <img
          data-builder-footer-logo="true"
          src={footerLogo}
          alt="footer-logo"
          className="object-contain"
          style={{ height: footerLogoHeight, maxWidth: 220 }}
        />
      ) : null}
      {hasVisibleIcon(footerRightIcon) && (
        <IconAwsome
          iconName={footerRightIcon.name}
          iconType={footerRightIcon.type}
          style={{ marginRight: 2 }}
        />
      )}
      <span className="truncate">{footerRightText}</span>
    </span>
  </div>
</div>
  </>
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
    
  <LiveMenuTopBarPreview topBar={topBar} device={device} setColor={setColor} />

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
      <MenuBarLogo
        src={logo}
        height={logoHeight}
        className={`object-contain ${display === "left" ? "ml-auto" : ""}`}
        textClassName="font-bold text-[18px] text-[#374151] truncate"
      />
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
  const { icon, label } = nav;
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

.menuTree .menu-tree-collapse-hit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  cursor: pointer;
  user-select: none;
}

.menuTree .menu-tree-collapse-icon {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  font-size: 18px;
  font-weight: 600;
  line-height: 1;
  color: #9ca3af;
}

.menuTree .menu-tree-collapse-minus,
.menuTree .menu-tree-collapse-plus {
  display: none;
  width: 16px;
  text-align: center;
}

.menuTree .nestable-item--children-open .menu-tree-collapse-minus,
.menuTree .nestable-item--children-collapsed .menu-tree-collapse-plus {
  display: inline-block;
}

.menuTree .nestable-icon,
.menuTree .nestable-icon:before {
  display: none !important;
  content: none !important;
  background-image: none !important;
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

/* การ์ดชื่อเมนู — พื้นหลัง/กรอบเท่า input ธีม (Btn Group + สีกรอบ) */
.menuTree .menu-item-theme-card.MuiAccordion-root,
.menuTree .menu-item-theme-card.MuiPaper-root {
  border: 1px solid var(--dash-panel-btn-group-border, var(--dash-panel-input-border, #e2e8f0)) !important;
  border-radius: 5px !important;
  background-color: var(--dash-panel-btn-group-inactive, #ffffff) !important;
  background-image: none !important;
  box-shadow: none !important;
}
.menuTree .menu-item-theme-card .MuiAccordionSummary-root,
.menuTree .menu-item-theme-card .MuiAccordionDetails-root,
.menuTree .menu-item-theme-card .MuiCollapse-root {
  background-color: var(--dash-panel-btn-group-inactive, #ffffff) !important;
  background-image: none !important;
  box-shadow: none !important;
}
.dark .menuTree .menu-item-theme-card.MuiAccordion-root,
.dark .menuTree .menu-item-theme-card.MuiPaper-root {
  border: 1px solid var(--dash-panel-btn-group-border, var(--dash-panel-input-border, rgba(255, 255, 255, 0.1))) !important;
  background-color: var(--dash-panel-btn-group-inactive, rgba(30, 41, 59, 0.9)) !important;
}
.dark .menuTree .menu-item-theme-card .MuiAccordionSummary-root,
.dark .menuTree .menu-item-theme-card .MuiAccordionDetails-root,
.dark .menuTree .menu-item-theme-card .MuiCollapse-root {
  background-color: var(--dash-panel-btn-group-inactive, rgba(30, 41, 59, 0.9)) !important;
  background-image: none !important;
  box-shadow: none !important;
}
/* ปุ่มคัดลอก/ลบ — ไม่มีกรอบ/พื้นหลังตอน hover */
.menuTree .menu-item-action-btn,
.menuTree .menu-item-action-btn:hover,
.menuTree .menu-item-action-btn:focus,
.menuTree .menu-item-action-btn:active {
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  background: transparent !important;
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

/* กรอบไอเทมตอนลาก — เท่า input ธีม (Btn Group + สีกรอบ) */
.nestable-drag-layer .nestable-item-copy .MuiAccordion-root {
  border: 1px solid var(--dash-panel-btn-group-border, var(--dash-panel-input-border, #e2e8f0)) !important;
  background-color: var(--dash-panel-btn-group-inactive, #ffffff) !important;
  background-image: none !important;
}
.dark .nestable-drag-layer .nestable-item-copy .MuiAccordion-root {
  border: 1px solid var(--dash-panel-btn-group-border, var(--dash-panel-input-border, rgba(255, 255, 255, 0.1))) !important;
  background-color: var(--dash-panel-btn-group-inactive, rgba(30, 41, 59, 0.9)) !important;
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
    </Profiler>
    <footer className="sticky bottom-0 z-20 mt-auto flex shrink-0 items-center justify-between gap-3 border-t border-slate-200 bg-[var(--dash-bg,#f8fafc)] px-4 py-2 dark:border-white/10">
      <BuilderPerformanceTrigger />
      <span className="shrink-0 text-[12px] text-slate-500">
        Copyright © {new Date().getFullYear()} Web Builder. All rights reserved.
      </span>
    </footer>

    </main>
    
    
    )
}

export default memo(MenuPage);
