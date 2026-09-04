import { memo, startTransition, useEffect, useLayoutEffect, useMemo, useState, useRef } from "react";
import { getTheme } from "../../../Functions/theme";
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
  ButtonGroup
} from "@mui/material";
import ImageModal from "../imageModal";
import { TabContext } from "@mui/lab";
import lodash, { isNull } from "lodash";
import { Minus, Plus, Check, Palette, ImageOff, Trash2,Image, Home} from "lucide-react";
import Popper from "@mui/material/Popper";
import { styled } from "@mui/material/styles";
import Switch from "@mui/material/Switch";
import IconLucide from "../../IconLucide";
import Stack from "@mui/material/Stack";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import Service from "../Service";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ServiceIcon from "../ServiceIcon";
import IconAwsome from "../IconAwsome";
import SelectLine from "../HTML/SelectLine";
import ServiceColor from "../Services/ServiceColor";
import {
  applyMenuFluidLayoutDirectly,
  applyMenuOverlayDirectly,
} from "../menuBarChromePreview";
import { usePanelSliderPreview } from "../panelPreviewStore";
import { THEME_PANEL_BASIC_COLOR_SWATCHES } from "../themePanelBasicColors";
import {
  ensurePageCatalogLoaded,
  usePageCatalog,
} from "../store/pageDocument";


const COMMON_FIELD_SX = (hasChildren, hasBtn, darkMode, height = 35, fontSize = 12) => {
  const radiusRight = hasChildren ? 0 : 5;
  const borderRight = hasChildren ? 0 : 1;
  const radiusLeft  = hasBtn ? 0 : 5;
  const borderLeft  = hasBtn ? 0 : 1;

  const borderColor = darkMode === "dark" ? "#494d54" : "rgba(0,0,0,0.23)";
  const textColor   = darkMode === "dark" ? "#ffffff" : "#18181b";
  const bgcolor     = "var(--dash-panel-btn-group-inactive, #ffffff)";

  // ✅ อย่าใส่ height ใน notchedOutline
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

      // ✅ คุมเส้นขอบทุกสถานะในที่เดียว
      "& fieldset": outlineStyle,
      "&:hover fieldset": outlineStyle,
      "&.Mui-focused fieldset": outlineStyle,
      "&.Mui-error fieldset": outlineStyle,
    },

    "& .MuiOutlinedInput-input": {
      fontSize,
      color: textColor,
      padding: "0 12px",   // ✅ แทน marginBottom แปลก ๆ
      height: "100%",
      boxSizing: "border-box",
    },
  };
};

/** รูปแบบการแสดงผล — สไตล์เดียวกับ Section panel */
const OPTION_CHIP_RADIUS = "0.375rem";
const CHIP_BORDER = "#e2e8f0";
const CHIP_BORDER_DARK = "rgba(255, 255, 255, 0.1)";
const CHIP_BG = "#ffffff";
const CHIP_BG_HOVER = "#f8fafc";
const CHIP_BG_DARK = "rgba(30, 41, 59, 0.9)";
const CHIP_BG_DARK_HOVER = "rgba(30, 41, 59, 1)";

const layoutGroupButtonSx = panelGroupButtonSx;

const KeepMountedTab = memo(function KeepMountedTab({ value, activeValue, eager = false, children }) {
  const active = activeValue === value;
  const [mounted, setMounted] = useState(eager);
  useLayoutEffect(() => {
    if (!active || mounted) return undefined;
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setMounted(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [active, mounted]);
  if (!mounted) return null;
  return (
    <div
      hidden={!active}
      className="px-6 pb-6"
      style={{ display: active ? "block" : "none" }}
    >
      {typeof children === "function" ? children() : children}
    </div>
  );
}, (prev, next) => {
  const wasActive = prev.activeValue === prev.value;
  const isActive = next.activeValue === next.value;
  if (wasActive || isActive) return false;
  return prev.value === next.value && prev.eager === next.eager;
});

const layoutGroupRootSx = {
  width: "100%",
  boxShadow: "none",
  "& .MuiButton-root": {
    boxShadow: "none",
  },
  "& .MuiButtonGroup-grouped": {
    borderRadius: "0 !important",
  },
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

const MENU_BAR_DISPLAY_LAYOUT_OPTIONS = [
  { value: true, label: "ความกว้างเต็มจอ" },
  { value: false, label: "ความกว้างมาตรฐาน" },
];

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
        backgroundColor: "var(--dash-panel-switch-on, #333333)",
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

function CycledServiceColor({
  options,
  theme,
  rangeColor,
  darkMode,
  resolveColor,
  onColor,
  onOpacity,
  onCommit,
  renderExtra,
  controlName,
}) {
  const [index, setIndex] = useState(0);
  const valueRef = useRef(null);
  const indexRef = useRef(0);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const len = Array.isArray(options) ? options.length : 0;
  const safeIndex = len ? Math.min(index, len - 1) : 0;
  const selected = len ? options[safeIndex] : null;

  const cycle = (step) => {
    const list = optionsRef.current;
    const total = list?.length || 1;
    const next = (indexRef.current + step + total) % total;
    indexRef.current = next;
    const label = list?.[next]?.label;
    if (valueRef.current && label) valueRef.current.textContent = label;
    requestAnimationFrame(() => {
      setIndex(next);
    });
  };

  if (!selected) return null;
  const color = resolveColor
    ? resolveColor(selected)
    : selected.data ?? selected.color;
  const name = controlName || "สี";

  return (
    <>
      <SelectLine
        prev={() => cycle(-1)}
        next={() => cycle(1)}
        value={selected.label}
        valueRef={valueRef}
        prevControl={`ก่อนหน้า ${name}`}
        nextControl={`ถัดไป ${name}`}
      />
      <ServiceColor
        theme={theme}
        color={color}
        opacity={selected.opacity}
        handleColor={(value) => onColor?.(selected, value)}
        handleOpacity={(event) => onOpacity?.(selected, event)}
        onCommit={(_, reason) => onCommit?.(reason)}
        rangeColor={rangeColor}
        darkMode={darkMode}
      />
      {renderExtra?.(selected)}
    </>
  );
}

const toBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1";
  }
  return false;
};

function FluidLayoutButtons({ value, onPersist, textColor }) {
  const [fluid, setFluid] = useState(() => toBoolean(value));
  const fluidRef = useRef(toBoolean(value));
  const persistRef = useRef(onPersist);
  const skipSyncRef = useRef(false);
  persistRef.current = onPersist;

  useEffect(() => {
    if (skipSyncRef.current) {
      skipSyncRef.current = false;
      return;
    }
    const next = toBoolean(value);
    fluidRef.current = next;
    setFluid(next);
  }, [value]);

  const apply = (next) => {
    if (fluidRef.current === next) return;
    skipSyncRef.current = true;
    fluidRef.current = next;
    setFluid(next);
    applyMenuFluidLayoutDirectly(next);
    requestAnimationFrame(() => persistRef.current?.(next));
  };

  return (
    <ButtonGroup
      fullWidth
      variant="outlined"
      disableElevation
      color="inherit"
      aria-label="รูปแบบการแสดงผล"
      sx={layoutGroupRootSx}
    >
      {MENU_BAR_DISPLAY_LAYOUT_OPTIONS.map((opt) => {
        const selected = opt.value === fluid;
        return (
          <Button
            key={String(opt.value)}
            color="inherit"
            data-perf-control={opt.label}
            aria-label={opt.label}
            onClick={() => apply(opt.value)}
            sx={layoutGroupButtonSx(selected, textColor)}
          >
            {opt.label}
          </Button>
        );
      })}
    </ButtonGroup>
  );
}

function OverlaySwitch({ checked, topOffset = 0, onPersist }) {
  const [on, setOn] = useState(() => toBoolean(checked));
  const onRef = useRef(toBoolean(checked));
  const persistRef = useRef(onPersist);
  const skipCheckedSyncRef = useRef(false);
  persistRef.current = onPersist;

  useEffect(() => {
    if (skipCheckedSyncRef.current) {
      skipCheckedSyncRef.current = false;
      return;
    }
    const next = toBoolean(checked);
    onRef.current = next;
    setOn(next);
  }, [checked]);

  return (
    <span data-perf-control="Overlay">
      <AntSwitch
        inputProps={{
          "aria-label": "Overlay",
          "data-perf-control": "Overlay",
        }}
        checked={on}
        onChange={() => {
          const next = !onRef.current;
          onRef.current = next;
          skipCheckedSyncRef.current = true;
          setOn(next);
          applyMenuOverlayDirectly(next, topOffset);
          requestAnimationFrame(() => {
            persistRef.current?.(next);
          });
        }}
      />
    </span>
  );
}


const selectOptionValue = (item) =>
  item && typeof item === "object"
    ? (item.value ?? item._id ?? item.pageName ?? "")
    : item;

const safeSelectValue = (value, array = []) => {
  const optionValues = array.map(selectOptionValue);
  if (
    value !== undefined &&
    value !== null &&
    value !== "" &&
    optionValues.some((option) => String(option) === String(value))
  ) {
    return optionValues.find((option) => String(option) === String(value));
  }
  return optionValues[0] ?? "";
};

const SelectInput = ({ name, value, handChange, array,darkMode,fontSize=13 }) => {
  const textColor = darkMode === "dark"?"#ffffff":"#050505"
  const borderColor = darkMode === "dark" ? CHIP_BORDER_DARK : CHIP_BORDER
  const bgcolor = "var(--dash-panel-btn-group-inactive, #ffffff)"
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
  }
  return (
    <FormControl
      fullWidth
      sx={selectStyle}
    >
      <Select
        name={name}
        value={safeSelectValue(value, array)}
        onChange={handChange}
        input={<OutlinedInput notched={false} />} // ✅ ปิด notch ให้ขอบไม่แหว่ง
        
        MenuProps={{
          PaperProps: {
            elevation: 0,
            sx: {
              boxShadow: "none",
              borderRadius:1,
              border:1,
              borderColor:borderColor,
              "& .MuiList-root": { py: 0 ,bgcolor},
              "& .MuiMenuItem-root": {
                height: 35,
                py: 0.25,
                px: 1.0,
                fontSize,
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
        }
      }
      >
        {array.map((a,i) => {
          const itemValue = selectOptionValue(a);
          const itemLabel =
            a && typeof a === "object"
              ? (a.label ?? a.pageName ?? String(itemValue))
              : String(a);
          return (
            <MenuItem
              value={itemValue}
              key={i}
              sx={{
                "& .MuiTypography-root": { fontSize: 13, color: textColor },
                "&.Mui-selected": {
                  backgroundColor: "#374151",
                  "& .MuiTypography-root": { color: "#ffffff" },
                },
                "&.Mui-selected:hover": {
                  backgroundColor: "#374151",
                },
              }}
            >
              <ListItemText primary={itemLabel} />
            </MenuItem>
          )
        })}
      </Select>
    </FormControl>
  );
};

const Range = ({ name, value, min, max, step, handleChange, onCommit, darkTextColor,darkMode, index = null }) => {
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : min;
  const [newValue, setNewValue] = useState(safeValue);

  useEffect(() => {
    setNewValue(Number.isFinite(Number(value)) ? Number(value) : min);
  }, [min, value]);

  let pos = ((newValue - min) / (max - min)) * 100;

  return (
    <div className="pb-[2px] px-[5px]">
      <input
        type="range"
        name={name}
        aria-label={name}
        data-perf-control={name}
        min={min}
        max={max}
        value={Number.isFinite(Number(newValue)) ? newValue : min}
        step={step}
        onChange={(e) => {
          const v = Number(e.target.value);
          setNewValue(v);
          handleChange?.(name, v, index); // ✅ อัปเดตทันที
        }}
        onPointerUp={() => onCommit?.("pointerup")}
        onPointerCancel={() => onCommit?.("pointercancel")}
        onTouchEnd={() => onCommit?.("touchend")}
        onTouchCancel={() => onCommit?.("touchcancel")}
        onKeyUp={() => onCommit?.("keyboard")}
        onBlur={() => onCommit?.("blur")}
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
        style={{ ["--pos"]: `${pos}%`, ["--fill"]: darkMode?darkTextColor:`black` }}
      />
    </div>
  );
};

const NumberInput = ({ value, field, handChange, plus, minus, label = "ค่า" }) => {
  const inputRef = useRef(null);
  const skipSyncRef = useRef(false);
  const [localValue, setLocalValue] = useState(value ?? "");

  useEffect(() => {
    if (skipSyncRef.current) {
      skipSyncRef.current = false;
      return;
    }
    setLocalValue(value ?? "");
  }, [value]);

  const commitStep = (updater) => {
    const current = Number(inputRef.current?.value ?? localValue);
    const next = typeof updater === "function" ? updater(current) : updater;
    skipSyncRef.current = true;
    setLocalValue(next);
    if (inputRef.current) inputRef.current.value = String(next ?? "");
    requestAnimationFrame(() => handChange(field, next));
  };

  return (
    <div className="relative w-auto rounded-md border border-[#e2e8f0] dark:border-white/10 bg-white dark:bg-zinc-800 px-2 py-1 text-sm text-zinc-900 flex items-center justify-center w-[160px] mb-[5px] h-[35px]">
      <div className="absolute pr-2 -left-px">
        <button
          type="button"
          className="bg-transparent flex items-center justify-center rounded-md"
          aria-label={`ลด${label}`}
          data-perf-control={`ลด${label}`}
          onClick={() => commitStep(minus)}
        >
          <Minus className="size-3 m-[10px] text-dark dark:text-white" />
        </button>
      </div>
      <input
        ref={inputRef}
        className="text-dark dark:text-white bg-transparent w-full text-center text-[14px] outline-none focus:outline-none focus:ring-0 focus-visible:outline-none appearance-none"
        value={localValue ?? ""}
        onChange={(e) => handChange(field, e.target.value)}
      />
      <div className="absolute pr-2 -right-px">
        <button
          type="button"
          className=" bg-transparent flex items-center justify-center rounded-md"
          aria-label={`เพิ่ม${label}`}
          data-perf-control={`เพิ่ม${label}`}
          onClick={() => commitStep(plus)}
        >
          <Plus className="size-3 m-[10px] text-dark dark:text-white" />
        </button>
      </div>
    </div>
  );
};

function Btn({
  handleClick,
  radius="normal",
  icon=null,
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
            {icon && 
            
            <IconAwsome iconType={icon.type} iconName={icon.name} style={{color}}/>
       
        }

            
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

function FieldWithBtn({name,value,darkMode,handleChange,handleClick,icon=null,children}) {


  return (
    <FormControl fullWidth>
      <Box sx={{ display: "flex", width: "100%" , alignItems: "stretch" }}>
        <Btn radius="noR" icon={icon} bgColor={darkMode === "dark"?"#494d54":"#A1A1AA"} handleClick={handleClick}/>
        <TextField
          sx={COMMON_FIELD_SX(Boolean(children),true,darkMode)}
          fullWidth
          name={name}
          value={value}
          onChange={handleChange}
        
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

const MenuBarOffcanvas = ({
  menuBarDesktop,menuBarMobile,navBottom,
  topBar,
  updateTopBar,
  updateMenuBar: onUpdate,
  close,
  textColor,darkMode,darkTextColor,device,
  panel,
  onReady,
}) => {
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;
  useLayoutEffect(() => {
    onReadyRef.current?.();
  }, [panel]);

  const skipNextDesktopSyncRef = useRef(false);
  const skipNextMobileSyncRef = useRef(false);
  const skipNextNavSyncRef = useRef(false);

  const pageCatalog = usePageCatalog()
  const pages = useMemo(
    () => pageCatalog.map((entry) => ({ ...entry, _id: entry.id })),
    [pageCatalog]
  )

   useEffect(()=>{
    ensurePageCatalogLoaded()
   },[])

  const [dataDesktop, setDataDesktop] = useState(menuBarDesktop);
  const [dataMobile, setDataMobile] = useState(menuBarMobile);
  const [dataNavBottom, setDataNavBottom] = useState(navBottom);

  const [openColorTable1, setOpenColorTable1] = useState(false); //
  const [openColorTable2, setOpenColorTable2] = useState(false); //
  const [, setOpenColorTable3] = useState(false); //
  const [, setOpenColorTable4] = useState(false); //
  const [openColorTable5, setOpenColorTable5] = useState(false); //
  const [openColorTable6, setOpenColorTable6] = useState(false); //
  const [openColorTable7, setOpenColorTable7] = useState(false); //
  const [openColorTable8, setOpenColorTable8] = useState(false);
  const [, setOpenColorTable9] = useState(false);
  const [openColorTable10, setOpenColorTable10] = useState(false);
  const [, setOpenColorTable11] = useState(false);
  const [, setOpenColorTable12] = useState(false);
  const [, setOpenColorTable13] = useState(false);
  const [, setOpenColorTable14] = useState(false);
  const [, setOpenColorTable15] = useState(false);
  const [openImgModal, setOpenImgModal] = useState(false);
  const [openIconMoal, setOpenIconMoal] = useState(false);

  const anchorRef = useRef(null); //
  const anchorRefGradient = useRef(null); //
  const anchorRefSubGradient = useRef(null);
  const anchorRefSub = useRef(null);
  useRef(null); //
  useRef(null);
  const anchorRefColor = useRef(null); //
  const anchorRefHover = useRef(null); //
  const anchorRefActive = useRef(null); //
  useRef(null)
  useRef(null)
  useRef(null)
  useRef(null)
  useRef(null)
  useRef(null)
  useRef(null)

  const [anchorEl, setAnchorEl] = useState(null); //
  const [anchorElGradient, setAnchorElGradient] = useState(null); //
  const [anchorElSubGradient, setAnchorElSubGradient] = useState(null);
  const [anchorElSub, setAnchorElSub] = useState(null);
  useState(null);
  useState(null); //
  const [anchorElColor, setAnchorElColor] = useState(null); //
  const [anchorElHover, setAnchorElHover] = useState(null); //
  const [anchorElActive, setAnchorElActive] = useState(null); //
  useState(null)
  useState(null)
  useState(null)
  useState(null)
  useState(null)
  useState(null)
  useState(null)

  const [theme, setTheme] = useState(null);
  const [updated, setUpdated] = useState(false);
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;
  const dataDesktopRef = useRef(dataDesktop);
  dataDesktopRef.current = dataDesktop;
  const navBottomRef = useRef(navBottom);
  navBottomRef.current = navBottom;
  const menuBarMobileRef = useRef(menuBarMobile);
  menuBarMobileRef.current = menuBarMobile;
  const [menu,setMenu] = useState("Main")

  const{
    // Main
    menuFontSize:fs_D = 15,
    menuFontWeight:fw_D = 400,
  
    menuColor:color_D,
    menuColorOpacity:opct_D,
    activeMenuColor:active_D,
    activeMenuColorOpacity:activeOpct_D,
    hoverMenuColor:hover_D,
    hoverMenuColorOpacity:hoverOpct_D,
  
    bgMenuColor:bg_D,
    bgMenuOpacity:bgo_D,
    floatingMenuBgColor:floatBg_D = bg_D,
    floatingMenuBgOpacity:floatBgo_D = bgo_D,
  
    display:dp_D,
    menuHeight:mh_D,
  
    logo:l_D,
    logoHeight:lh_D,
  
    menuSpace:ms_D,
    divider:dv_D,
    dividerStyle:dvs_D,
    dividerColor:dvc_D,
    dividerOpacity:dvo_D,
    dividerWeight:dvw_D,
    isOverlay:isOverlay_D = false,
  
    // Sub
    subMenuFontSize:s_fs_D = 12,
    subMenuFontWeight:s_fw_D = 400,
  
    subMenuColor:s_color_D,
    subMenuColorOpacity:s_opct_D,
    activeSubMenuColor:s_active_D,
    activeSubMenuColorOpacity:s_activeOpct_D,
    hoverSubMenuColor:s_hover_D,
    hoverSubMenuColorOpacity:s_hoverOpct_D,
    hoverSubMenuBgColor:s_hoverBg_D = s_color_D,
    hoverSubMenuBgOpacity:s_hoverBgOpct_D = 20,
  
    isSubMenuGradient:s_isGD_D,
    bgSubMenuColor:s_bg_D,
    bgSubMenuOpacity:s_bgo_D,
  
    subMenuBorderColor:s_bc_D,
    subMenuBorderOpacity:s_bo_D,
    subMenuBorderStyle:s_bs_D,
  } = dataDesktop;

  const{
    // Main
    menuFontSize:fs_M = 14,
    menuFontWeight:fw_M = 600,
  
    menuColor:color_M,
    menuColorOpacity:opct_M,
    activeMenuColor:active_M,
    activeMenuColorOpacity:activeOpct_M,
  
    isMenuBarGradient:isbrGD_M,
    bgMenuBarColor:bgbr_M,
    bgMenuBarOpacity:bgbro_M,

    bgButtonColor:bgbtn_M,
    borderButtonColor:bbtn_M,
    iconButtonColor:icn_M,
    bgButtonOpacity:bgbtno_M,
    borderButtonOpacity:bbtno_M,
    iconButtonOpacity:icno_M,
    borderWidth:bw,

    bgMenuColor:bg_M,
    bgMenuOpacity:bgo_M,
  
    display:dp_M,
    barHeight:brh_M,
  
    logo:l_M,
    logoHeight:lh_M,
  
    menuHeight:mh_M,
    dividerStyle:dvs_M,
    dividerColor:dvc_M,
    dividerOpacity:dvo_M,
  
    // Sub
    subMenuFontSize:s_fs_M = 12,
    subMenuFontWeight:s_fw_M = 400,
  
    subMenuColor:s_color_M,
    subMenuColorOpacity:s_opct_M,
    activeSubMenuColor:s_active_M,
    activeSubMenuColorOpacity:s_activeOpct_M,



  } = dataMobile;

  const{
    // Nav

    navBottoms:nav_M,
    navText:navText_M,
    navIcon:navIcon_M,
    isAbleNavBottom:isAnav_M,
    navBottomDesign:navDesign_M = "classic",
    navBottomDisplay:navd_M = "menu",


      bgNav:bgN_M,
      bgNavOpacity:bgNo_M,
      navHeight:navh_M,
      navSpace:navs_M,

      iconSize:nicns_M,
      iconColor:nicnc_M,
      iconOpacity:nicno_M,

      labelSize:nls_M,
      labelColor:nlc_M,
      labelOpacity:nlo_M,

      navDivider:ndv_M,
      navDividerColor:ndvc_M,
      navDividerOpacity:ndvo_M,
      navDividerStyle:ndvs_M,

  
  
  } = dataNavBottom;

  const menuColors = [
    {
      label: "สีข้อความ",
      data: color_D,
      field: "menuColor",
      opacity: opct_D,
      opacityField: "menuColorOpacity",
      open: openColorTable5,
      click: () => {
        closePopper(5)
        setOpenColorTable5((v) => !v);
        setAnchorElColor(anchorRefColor.current);
      },
      anchorEl: anchorElColor,
      anchorRef: anchorRefColor,
      setAnchorEl:setAnchorElColor,
    },
    {
      label: "สีข้อความ Hover",
      data: hover_D,
      field: "hoverMenuColor",
      opacity: hoverOpct_D,
      opacityField: "hoverMenuColorOpacity",
      open: openColorTable6,
      click: () => {
        closePopper(6)
        setOpenColorTable6((v) => !v);
        setAnchorElHover(anchorRefHover.current);
      },
      anchorEl: anchorElHover,
      anchorRef: anchorRefHover,
      setAnchorEl:setAnchorElHover,
    },
    {
      label: "สีข้อความ Active",
      data: active_D,
      field: "activeMenuColor",
      opacity: activeOpct_D,
      opacityField: "activeMenuColorOpacity",
      open: openColorTable7,
      click: () => {
        closePopper(7)
        setOpenColorTable7((v) => !v);
        setAnchorElActive(anchorRefActive.current);
      },
      anchorEl: anchorElActive,
      anchorRef: anchorRefActive,
      setAnchorEl:setAnchorElActive,
    },
    {
      label: "สีพื้นหลังเมนู",
      data: bg_D,
      field: "bgMenuColor",
      opacity: bgo_D,
      opacityField: "bgMenuOpacity",
      open: openColorTable1,
      click: () => {},
      anchorEl: anchorEl,
      anchorRef: anchorRef,
      setAnchorEl,
    },
    {
      label: "สีพื้นหลังเมนูแบบลอย",
      data: floatBg_D,
      field: "floatingMenuBgColor",
      opacity: floatBgo_D,
      opacityField: "floatingMenuBgOpacity",
      open: openColorTable2,
      click: () => {},
      anchorEl: anchorElGradient,
      anchorRef: anchorRefGradient,
      setAnchorEl: setAnchorElGradient,
    },
  ];

  const menuColorsMobile = [
    {
      label: "สีข้อความ",
      data: color_M,
      field: "menuColor",
      opacity: opct_M,
      opacityField: "menuColorOpacity",
      open: openColorTable5,
      click: () => {
        closePopper(5)
        setOpenColorTable5((v) => !v);
        setAnchorElColor(anchorRefColor.current);
      },
      anchorEl: anchorElColor,
      anchorRef: anchorRefColor,
      setAnchorEl:setAnchorElColor,
    },
    {
      label: "สีข้อความ Active",
      data: active_M,
      field: "activeMenuColor",
      opacity: activeOpct_M,
      opacityField: "activeMenuColorOpacity",
      open: openColorTable6,
      click: () => {
        closePopper(6)
        setOpenColorTable6((v) => !v);
        setAnchorElActive(anchorRefActive.current);
      },
      anchorEl: anchorElActive,
      anchorRef: anchorRefActive,
      setAnchorEl:setAnchorElActive,
    },
    {
      label: "สีพื้นหลังเมนู",
      data: bg_M,
      field: "bgMenuColor",
      opacity: bgo_M,
      opacityField: "bgMenuOpacity",
      open: openColorTable7,
      click: () => {},
      anchorEl: anchorElHover,
      anchorRef: anchorRefHover,
      setAnchorEl:setAnchorElHover,
    },
    {
      label: "สีเส้นคั่น",
      data: dvc_M,
      field: "dividerColor",
      opacity: dvo_M,
      opacityField: "dividerOpacity",
      open: openColorTable7,
      click: () => {},
      anchorEl: anchorElHover,
      anchorRef: anchorRefHover,
      setAnchorEl:setAnchorElHover,
    },
  ];

  const buttonColorsMobile = [
    {
      label: "สีไอคอน",
      field: "iconButtonColor",
      data: icn_M,
      opacity: icno_M,
      opacityField: "iconButtonOpacity",
    },
    {
      label: "สีปุ่ม",
      field: "bgButtonColor",
      data: bgbtn_M,
      opacity: bgbtno_M,
      opacityField: "bgButtonOpacity",
    },
    {
      label: "สีกรอบ",
      field: "borderButtonColor",
      data: bbtn_M,
      opacity: bbtno_M,
      opacityField: "borderButtonOpacity",
    },
    {
      label: "สีพื้นหลังบาร์",
      field: "bgMenuBarColor",
      data: bgbr_M,
      opacity: bgbro_M,
      opacityField: "bgMenuBarOpacity",
    },
  ];
  const subMenuColors = [
    {
      label: "สีข้อความ",
      data: s_color_D,
      field: "subMenuColor",
      opacity: s_opct_D,
      opacityField: "subMenuColorOpacity",
      open: openColorTable5,
      click: () => {
        closePopper(5)
        setOpenColorTable5((v) => !v);
        setAnchorElColor(anchorRefColor.current);
      },
      anchorEl: anchorElColor,
      anchorRef: anchorRefColor,
      setAnchorEl:setAnchorElColor,
    },
    {
      label: "สีข้อความ Hover",
      data: s_hover_D,
      field: "hoverSubMenuColor",
      opacity: s_hoverOpct_D,
      opacityField: "hoverSubMenuColorOpacity",
      open: openColorTable6,
      click: () => {
        closePopper(6)
        setOpenColorTable6((v) => !v);
        setAnchorElHover(anchorRefHover.current);
      },
      anchorEl: anchorElHover,
      anchorRef: anchorRefHover,
      setAnchorEl:setAnchorElHover,
    },
    {
      label: "สีข้อความ Active",
      data: s_active_D,
      field: "activeSubMenuColor",
      opacity:s_activeOpct_D,
      opacityField: "activeSubMenuColorOpacity",
      open: openColorTable7,
      click: () => {
        closePopper(7)
        setOpenColorTable7((v) => !v);
        setAnchorElActive(anchorRefActive.current);
      },
      anchorEl: anchorElActive,
      anchorRef: anchorRefActive,
      setAnchorEl:setAnchorElActive,
    },
    {
      label: "สีพื้นหลังเมนู",
      data: s_bg_D,
      field: "bgSubMenuColor",
      opacity: s_bgo_D,
      opacityField: "bgSubMenuOpacity",
      open: openColorTable10,
      click: () => {},
      anchorEl: anchorElSub,
      anchorRef: anchorRefSub,
      setAnchorEl: setAnchorElSub,
    },
    {
      label: "สีพื้นหลังเมนู Hover",
      data: s_hoverBg_D,
      field: "hoverSubMenuBgColor",
      opacity: s_hoverBgOpct_D,
      opacityField: "hoverSubMenuBgOpacity",
      open: openColorTable8,
      click: () => {
        closePopper(8);
        setOpenColorTable8((v) => !v);
        setAnchorElSubGradient(anchorRefSubGradient.current);
      },
      anchorEl: anchorElSubGradient,
      anchorRef: anchorRefSubGradient,
      setAnchorEl: setAnchorElSubGradient,
    },
  ];
  const subMenuColorsMobile = [
    {
      label: "สีข้อความ",
      data: s_color_M,
      field: "subMenuColor",
      opacity: s_opct_M,
      opacityField: "subMenuColorOpacity",
      open: openColorTable5,
      click: () => {
        closePopper(5)
        setOpenColorTable5((v) => !v);
        setAnchorElColor(anchorRefColor.current);
      },
      anchorEl: anchorElColor,
      anchorRef: anchorRefColor,
      setAnchorEl:setAnchorElColor,
    },
    {
      label: "สีข้อความ Active",
      data: s_active_M,
      field: "activeSubMenuColor",
      opacity:s_activeOpct_M,
      opacityField: "activeSubMenuColorOpacity",
      open: openColorTable7,
      click: () => {
        closePopper(7)
        setOpenColorTable7((v) => !v);
        setAnchorElActive(anchorRefActive.current);
      },
      anchorEl: anchorElActive,
      anchorRef: anchorRefActive,
      setAnchorEl:setAnchorElActive,
    },
  ];
  const getThemeColorToken = (value, fallbackType = "mainColor") => {
    if (value && typeof value === "object") {
      const type = typeof value.type === "string" ? value.type : fallbackType;
      const indexRaw = Number(value.index);
      return { type, index: Number.isFinite(indexRaw) ? Math.max(0, indexRaw) : 0 };
    }
    return { type: fallbackType, index: 0 };
  };

  const menuFonts = [
    {
      label: "ขนาดเมนูหลัก",
      type: "menuFontSize",
      data: fs_D,
    },
    { label: "ความหนา", type: "menuFontWeight", data: fw_D },
  ];

  const menuFontsMobile = [
    {
      label: "ขนาดเมนูหลัก",
      type: "menuFontSize",
      data: fs_M,
    },
    { label: "ความหนา", type: "menuFontWeight", data: fw_M },
  ];

  const subMenuFonts = [
    {
      label: "ขนาดเมนูย่อย",
      type: "subMenuFontSize",
      data: s_fs_D,
    },
    {
      label: "ความหนา",
      type: "subMenuFontWeight",
      data: s_fw_D,
    },
  ];

  const subMenuFontsMobile = [
    {
      label: "ขนาดเมนูย่อย",
      type: "subMenuFontSize",
      data: s_fs_M,
    },
    {
      label: "ความหนา",
      type: "subMenuFontWeight",
      data: s_fw_M,
    },
  ];


  const displays = [
    { label: "เมนูชิดขวา", value: "right", data: dp_D },
    { label: "เมนูกึ่งกลาง", value: "center", data: dp_D },
  ];


  const navPrototype = {icon:{name: 'fa0', type: 'fas'},label:"Home",link:"Page1"}
  const navTextModeDefault = {
    icon: { name: "faCopyright", type: "fas" },
    label: "Domain.com All rights reserved.",
    link: "Page1",
  };
  const normalizeTextModeIcon = (iconValue) => {
    if (
      iconValue &&
      typeof iconValue === "object" &&
      iconValue.name &&
      iconValue.type &&
      iconValue.name !== "fa0"
    ) {
      return iconValue;
    }
    return { ...navTextModeDefault.icon };
  };



  const displaysMobile = [
    { label: "เมนูด้านขวา", value: "right", data: dp_M },
    { label: "เมนูด้านซ้าย", value: "left", data: dp_M },
   
  ];

  const navBottomDisplays = [
    {label:"เมนู",value:"menu",data:navd_M},
    {label:"ข้อความ",value:"text",data:navd_M},
  ]
  const navBottomDesigns = [
    { label: "คลาสสิค", value: "classic" },
    { label: "มาตรฐาน", value: "standard" },
    { label: "โมเดิร์น", value: "modern" },
  ];

  const rangeValue = [
    {
      label: "ความสูงเมนู",
      name: "menuHeight",
      data: mh_D,
      min: 50,
      max: 80,
      step: 1,
    },
    {
      label: "ระยะห่างเมนู",
      name: "menuSpace",
      data: ms_D,
      min: 20,
      max: 50,
      step: 1,
    },
  ];

  const rangeValueMobile = [
    {
      label: "ความสูงบาร์",
      name: "barHeight",
      data: brh_M,
      min: 50,
      max: 80,
      step: 1,
    },
    {
      label: "ระยะห่างเมนู",
      name: "menuHeight",
      data: mh_M,
      min: 40,
      max: 60,
      step: 1,
    },
  ];

  const rangeValueNavMobile = [
    {
      label: "ความสูงเมนู",
      name: "navHeight",
      data: navh_M,
      min: 50,
      max: 80,
      step: 1,
    },
    {
      label: "ระยะห่างระหว่างเมนู",
      name: "navSpace",
      data: navs_M,
      min: 1,
      max: 20,
      step: 1,
    },
  ];


  const navMenuStyleOptions = [
    {
      label: "สีพื้นหลังเมนู",
      field: "bgNav",
      color: bgN_M,
      opacity: bgNo_M,
      opacityField: "bgNavOpacity",
    },
    {
      label: "สีไอคอน",
      field: "iconColor",
      color: nicnc_M,
      opacity: nicno_M,
      opacityField: "iconOpacity",
      sizeField: "iconSize",
      sizeLabel: "ขนาดไอคอน",
      sizeValue: nicns_M,
    },
    {
      label: "สีข้อความ",
      field: "labelColor",
      color: nlc_M,
      opacity: nlo_M,
      opacityField: "labelOpacity",
      sizeField: "labelSize",
      sizeLabel: "ขนาดข้อความ",
      sizeValue: nls_M,
    },
  ];
  const dividerStyles = [
    { label: "เส้นตรง", value: "solid" },
    { label: "จุด", value: "dotted" },
    { label: "เส้นประ", value: "dashed" },
  ];

  const [allColors, setAllColors] = useState([]);
  const basicColors = THEME_PANEL_BASIC_COLOR_SWATCHES;

  const menus = [
    { value: "Main", lable: "เมนูหลัก" },
    { value: "Sub", lable: "เมนูย่อย" },
    ...(["Tablet", "Mobile"].includes(device) ? [{ value: "Top", lable: "Top Bar" }] : []),
    ...(device === "Mobile" ? [{ value: "Nav", lable: "Footer" }] : []),
  ];

  const tabletTopBarMode = topBar?.tabletTopBarMode || "social";
  const showTopBarEverywhere = topBar?.hideTopBarEverywhere !== true;
  const changeTabletTopBarMode = (mode) => {
    if (typeof updateTopBar !== "function") return;
    updateTopBar((prev) => ({ ...prev, tabletTopBarMode: mode }));
  };
  const changeHideTopBarEverywhere = () => {
    if (typeof updateTopBar !== "function") return;
    updateTopBar((prev) => ({
      ...prev,
      hideTopBarEverywhere: prev?.hideTopBarEverywhere !== true,
    }));
  };



  const closePopper = (n=0)=>{
    if(n !== 1){
      setOpenColorTable1(false)
 
    }if(n !== 2){
      setOpenColorTable2(false)
    }if(n !== 3){
      setOpenColorTable3(false)
    }if(n !== 4){
      setOpenColorTable4(false)
    
    }if(n !== 5){
      setOpenColorTable5(false)

    }if(n !== 6){
      setOpenColorTable6(false)
 
    }if(n !== 7){
      setOpenColorTable7(false)
    }if(n !== 8){
      setOpenColorTable8(false)
    }if(n !== 9){
      setOpenColorTable9(false)
    }if(n !== 10){
      setOpenColorTable10(false)
    }if(n !== 11){
      setOpenColorTable11(false)
    }if(n !== 12){
      setOpenColorTable12(false)
    }
    if(n !== 13){
      setOpenColorTable13(false)
    }
    if(n !== 14){
      setOpenColorTable14(false)
    }
    if(n !== 15){
      setOpenColorTable15(false)
    }


  }

  const toggleModal = (bool)=>{
    setOpenImgModal(bool)
  }

  const loadTheme = () => {
    getTheme("68d37327bedb0efab7dacafb")
      .then((res) => {
        setTheme(res.data);
      })
      .catch((err) => console.log(err));
  };
 

 const setData = device === "Desktop"?setDataDesktop:menu === "Nav"?setDataNavBottom:setDataMobile
 const isNavSliderPanel = device !== "Desktop" && menu === "Nav";
 const sliderPanelType = isNavSliderPanel ? "Nav" : "Menu";
 const sliderData =
   device === "Desktop"
     ? dataDesktop
     : isNavSliderPanel
       ? dataNavBottom
       : dataMobile;
 const sliderActiveRef = useRef(false);
 const { updateSlider, commitSlider } = usePanelSliderPreview({
   type: sliderPanelType,
   targetIds: `chrome:${sliderPanelType}:${device}`,
   data: sliderData,
   setData,
   onCommit: (latest) => {
     setData(latest);
     if (device === "Desktop") skipNextDesktopSyncRef.current = true;
     else if (isNavSliderPanel) skipNextNavSyncRef.current = true;
     else skipNextMobileSyncRef.current = true;
     onUpdateRef.current(latest, isNavSliderPanel);
   },
 });

  const persistDesktopOverlay = (next) => {
    skipNextDesktopSyncRef.current = true;
    onUpdateRef.current({
      ...(dataDesktopRef.current || {}),
      isOverlay: next,
    });
  };

  const persistDesktopFluidLayout = (next) => {
    skipNextDesktopSyncRef.current = true;
    onUpdateRef.current({
      ...(dataDesktopRef.current || {}),
      isFluidLayout: next,
    });
  };

  const minusFontSize = (value) => {
    return value - 1;
  };

  const plusFontSize = (value) => {
    return value + 1;
  };

  const handleFontSize = (field, valueOrUpdater) => {
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
  const handleSelect = (value, field, index = null) => {
    startTransition(() => {
      setData((prev) => {
        if (isNull(index)) return { ...prev, [field]: value };
        const nextValues = Array.isArray(prev?.[field])
          ? [...prev[field]]
          : [];
        nextValues[index] = value;
        return { ...prev, [field]: nextValues };
      });
      setUpdated(true);
    });
  };

  const handleRange = (field, value, index = null, extraPatch = null) => {
    sliderActiveRef.current = true;
    updateSlider(
      (prev) => {
        const patch =
          extraPatch && typeof extraPatch === "object" ? extraPatch : {};
        if (isNull(index)) return { ...prev, ...patch, [field]: value };
        const nextValues = Array.isArray(prev?.[field])
          ? [...prev[field]]
          : [];
        nextValues[index] = value;
        return { ...prev, ...patch, [field]: nextValues };
      },
      {
        controlField: isNull(index) ? field : `${field}[${index}]`,
        setData: false,
      }
    );
  };
  const handleRangeCommit = (reason) => {
    sliderActiveRef.current = false;
    commitSlider(reason || "range-commit");
  };

  const changeDisplay = (value,field) => {
    setData((prev) => {
      const next = { ...prev, [field]: value };
      const shouldNormalizeMobileNavMenus =
        device === "Mobile" &&
        menu === "Nav" &&
        ((field === "navBottomDisplay" && value === "menu") ||
          (field === "navBottomDesign" && value === "modern"));
      const shouldPrepareMobileTextModeDefault =
        device === "Mobile" &&
        menu === "Nav" &&
        field === "navBottomDisplay" &&
        value === "text";

      if (shouldNormalizeMobileNavMenus) {
        const normalized = Array.isArray(next.navBottoms) ? [...next.navBottoms] : [];
        while (normalized.length < 5) {
          normalized.push(lodash.cloneDeep(navPrototype));
        }
        if (normalized.length > 5) {
          normalized.length = 5;
        }
        next.navBottoms = normalized;
      }

      if (shouldPrepareMobileTextModeDefault) {
        const currentText = String(next.navText || "").trim().toLowerCase();
        const hasValidText =
          currentText.length > 0 && currentText !== "home" && currentText !== "product";
        if (!hasValidText) {
          next.navText = navTextModeDefault.label;
        }
        next.navIcon = normalizeTextModeIcon(next.navIcon);
      }

      return next;
    });
    setUpdated(true);
  };


  const handleChange = (e,index=-1,mainField=null) =>{
    const {name,value} = e.target
   setData(prev=>{
    const next = {...prev}
    if(index !== -1 && mainField){
      next[mainField][index][name] = value
    }
    return next
   })
  }
 



  useEffect(() => {
    if (!updated) return;
    if (sliderActiveRef.current) return;

    const persistNav = device !== "Desktop" && menu === "Nav";
    const source =
      device === "Desktop"
        ? dataDesktop
        : persistNav
          ? dataNavBottom
          : dataMobile;
    if (!source || typeof source !== "object") return;

    const clonedData = { ...source };
    for (const key of Object.keys(clonedData)) {
      if (clonedData[key] !== "") continue;
      if (/display|logo|color|style|font|icon|text|name|url|src|type|design/i.test(key)) {
        continue;
      }
      clonedData[key] = 0;
    }
    if (device === "Desktop") skipNextDesktopSyncRef.current = true;
    else if (persistNav) skipNextNavSyncRef.current = true;
    else skipNextMobileSyncRef.current = true;
    onUpdateRef.current(clonedData, persistNav);
  }, [dataDesktop, dataMobile, dataNavBottom, updated, device, menu]);

  useEffect(() => {
    if (dataDesktop?.isMenuGradient) {
      setDataDesktop((prev) => ({ ...prev, isMenuGradient: false }));
      setUpdated(true);
    }
  }, [dataDesktop?.isMenuGradient]);

  useEffect(() => {
    if (dataDesktop?.isSubMenuGradient) {
      setDataDesktop((prev) => ({ ...prev, isSubMenuGradient: false }));
      setUpdated(true);
    }
  }, [dataDesktop?.isSubMenuGradient]);


  useEffect(()=>{
    if(
      (device === "Desktop" && ["Nav","Top"].includes(menu)) ||
      (device === "Tablet" && menu === "Nav")
    ){
      setMenu("Main")
    }
},[device, menu])

  useEffect(() => {
    if (skipNextDesktopSyncRef.current) {
      skipNextDesktopSyncRef.current = false;
      setUpdated(false);
      return;
    }
    setDataDesktop(lodash.cloneDeep(menuBarDesktop));
    setUpdated(false);
  }, [menuBarDesktop]);

  useEffect(() => {
    if (skipNextMobileSyncRef.current) {
      skipNextMobileSyncRef.current = false;
      setUpdated(false);
      return;
    }
    setDataMobile(lodash.cloneDeep(menuBarMobile));
    setUpdated(false);
  }, [menuBarMobile]);

  useEffect(() => {
    if (skipNextNavSyncRef.current) {
      skipNextNavSyncRef.current = false;
      setUpdated(false);
      return;
    }
    setDataNavBottom(lodash.cloneDeep(navBottom));
    setUpdated(false);
  }, [navBottom]);

  useEffect(() => {
    setDataNavBottom(lodash.cloneDeep(navBottomRef.current))
  }, [device]);

  useEffect(() => {
    if (allColors.length === 0 && theme) {
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
  }, [allColors.length, basicColors, theme]);

  useEffect(() => {
    closePopper()
    setUpdated(false)
    setDataMobile(lodash.cloneDeep(menuBarMobileRef.current))
  }, [device]);

  useEffect(() => {
    loadTheme();
  }, []);

  useEffect(()=>{
    const onClick = (e)=>{
      const el = e.target
      const inBtn = el.closest("#btn-popper")
      const inPopper = el.closest("#popper-color")
      if(!inPopper && !inBtn){
        closePopper()
      }
    }
    window.addEventListener("click",onClick)
    return () =>{
      window.removeEventListener("click",onClick)
    }
  })







  return (
    <div
      className="dash-panel sm:block h-full min-h-0 w-full overflow-hidden"
    >

    <TabContext value={menu}>

    <div className="shrink-0 flex items-center justify-between border-b border-slate-200 dash-panel-header bg-gray-100 px-6 pt-3 pb-2 dark:border-white/10 dark:bg-slate-800/70">
        <div className="font-semibold tracking-wide">
          ตั้งค่า Menu Bar
        </div>
        <button
          type="button"
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-white/70"
          onClick={() => close(null)}
          aria-label="ปิดแผง"
          data-perf-control="ปิดแผง"
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
      <nav className="overflow-y-auto h-[calc(100%-64px)]" >
        
        <ul >
          <li>
            <div className="w-full mt-[12px] px-[25px]">
              <ButtonGroup
                fullWidth
                variant="outlined"
                disableElevation
                color="inherit"
                aria-label="เลือกส่วนตั้งค่าเมนู"
                sx={layoutGroupRootSx}
              >
                {menus
                  .filter(({ value }) => device === "Mobile" || value !== "Nav")
                  .map(({ lable, value }) => {
                    const selected = menu === value;
                    return (
                      <Button
                        key={value}
                        color="inherit"
                        data-perf-control={`ส่วนตั้งค่า ${lable}`}
                        onClick={() => {
                          if (selected) return;
                          const nextPanel = value === "Nav" ? "Nav" : "Menu";
                          startTransition(() => {
                            setMenu(value);
                            if (panel !== nextPanel) close(nextPanel);
                            closePopper();
                          });
                        }}
                        sx={{
                          ...layoutGroupButtonSx(selected, darkTextColor),
                          minHeight: 36,
                          fontSize: 12,
                          fontWeight: value === "Top" ? 700 : 500,
                        }}
                      >
                        {lable}
                      </Button>
                    );
                  })}
              </ButtonGroup>
            </div>
         
            {device === "Desktop" && (
              <>
                <KeepMountedTab value="Main" activeValue={menu} eager>
          {() => (<>
          <div >
      {/* Display */}
      {l_D ? (
   <div className="mt-3 cursor-pointer w-full" >
   <img
     src={l_D}
     alt="logo"
     className="h-[45px] object-contain"
     onClick={() => toggleModal(true)}
   />
        <div className="grid grid-cols-2">
        <div className="col col-span-2" >
              <MainLabel
                label="ความสูงโลโก้"
                value={lh_D}
                spacingClass="mt-5 mb-[7px]"
              />
              <Range
              darkMode={darkMode}
              darkTextColor={darkTextColor}
                name="logoHeight"
                value={lh_D}
                min={35}
                max={60}
                step={1}
                handleChange={handleRange}
                onCommit={handleRangeCommit}
              />
            </div>
        </div>
 </div>

                    
 
    ):(
      <div className="relative w-auto rounded-md  bg-gray-200 dark:bg-zinc-800 px-2 py-1 text-sm text-zinc-900 focus-within:border-zinc-500 flex items-center justify-center w-[160px] mb-[5px] mt-3 h-[45px]" onClick={()=>toggleModal(true)}>
        
        <Image className="absolute text-[12px] text-gray-400 dark:text-gray-500 "/>

      </div>
    )}
      <div className="mb-3 mt-4 flex items-center gap-2">
        <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
          Top Bar
        </span>
        <div className="dash-heading-rule min-w-0 flex-1 border-b" />
        <span data-perf-control="Top Bar">
        <AntSwitch
          inputProps={{
            "aria-label": "Top Bar",
            "data-perf-control": "Top Bar",
          }}
          checked={showTopBarEverywhere}
          onChange={changeHideTopBarEverywhere}
        />
        </span>
        <Typography sx={{ fontSize: 13, color: darkMode === "dark" ? "#94a3b8" : "#9ca3af" }}>
          เปิด
        </Typography>
      </div>
      <div className="mb-3 mt-4 flex items-center gap-2">
        <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
          รูปแบบการแสดงผล
        </span>
        <div className="dash-heading-rule min-w-0 flex-1 border-b" />
      </div>
      <FluidLayoutButtons
        value={dataDesktop?.isFluidLayout}
        onPersist={persistDesktopFluidLayout}
        textColor={textColor}
      />
      <div className="grid grid-cols-2">
        <div className="col col-span-2">
          <div className="mb-3 mt-4 flex items-center gap-2">
            <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
              การจัดวาง
            </span>
            <div className="dash-heading-rule min-w-0 flex-1 border-b" />
            <OverlaySwitch
              checked={isOverlay_D}
              topOffset={
                topBar?.hideTopBarEverywhere
                  ? 0
                  : Number.isFinite(Number(topBar?.topBarHeight))
                    ? Number(topBar.topBarHeight)
                    : 52
              }
              onPersist={persistDesktopOverlay}
            />
            <Typography sx={{ fontSize: 13, color: darkMode === "dark" ? "#94a3b8" : "#9ca3af" }}>
              Overlay
            </Typography>
          </div>
        </div>
        {displays.map((item, i) => (
          <div
            key={i}
            className="col col-span-1 text-black dark:text-white"
          >
            <FormControlLabel
              data-perf-control={item.label || "การจัดวาง"}
              control={
                <Radio
                  checked={item.value === item.data}
                  onChange={() => changeDisplay(item.value,"display")}
                  inputProps={{ "data-perf-control": item.label || "การจัดวาง" }}
                  sx={() => {
                    return {
                      // ยังไม่ติ๊ก = สีตามโหมด
                      color: textColor,
                      "&.Mui-checked": { color: textColor }, // ติ๊กแล้ว = สีเดียวกัน
                      "&:hover": { backgroundColor: "transparent" },
                      "&.Mui-checked:hover": {
                        backgroundColor: "transparent",
                      },
                      py:0,
                    };
                  }}
                />
              }
              label={item.label}
              sx={{
                "& .MuiFormControlLabel-label": {
                  fontSize: 13,
                  color: "inherit",
                },
              }}
            />
          </div>
        ))}
      </div>
      {/* FontSizes */}
      <div className="grid grid-cols-2">
        {menuFonts.map((item, i) => {
          const {label,data,type} = item
          if (
            type === "menuFontWeight"
          ) {
            const weights = Array.from(
              { length:6 },
              (_, i) => (i + 3) * 100
            );
            return (
              <div className="col col-span-1 ml-[5px] mr-[5px]" key={i}>
                <MainLabel label="ความหนา" />
                <SelectInput
                  name={type}
                  value={data}
                  handChange={(e) =>
                    handleFontSize(e.target.name, e.target.value)
                  }
                  array={weights}
                  darkMode={darkMode}
                />
              </div>
            );
          }

          return (
            <div className="col col-span-1 ml-[5px] mr-[5px]" key={i}>
              <MainLabel label={label} />

              <NumberInput
                plus={plusFontSize}
                minus={minusFontSize}
                value={data}
                field={type}
                handChange={handleFontSize}
              />
            </div>
          );
        })}
      </div>

      {menuColors.length > 0 && (
        <div className="mb-[8px]">
          <MainLabel label="สีข้อความ - สีพื้นหลัง" />
          <CycledServiceColor
            options={menuColors}
            theme={theme}
            rangeColor={textColor || "#0d9488"}
            darkMode={darkMode}
            controlName="สีเมนูหลัก"
            onCommit={handleRangeCommit}
            onColor={(option, value) => {
              if (option.field === "bgMenuColor") {
                setDataDesktop((prev) => ({
                  ...prev,
                  isMenuGradient: false,
                  bgMenuColor: value,
                }));
                setUpdated(true);
                return;
              }
              handleSelect(value, option.field);
            }}
            onOpacity={(option, e) => {
              if (option.opacityField === "bgMenuOpacity") {
                handleRange(
                  "bgMenuOpacity",
                  Number(e.target.value),
                  null,
                  { isMenuGradient: false }
                );
                return;
              }
              handleRange(option.opacityField, Number(e.target.value));
            }}
          />
        </div>
      )}

      <div className="grid grid-cols-1">
        {rangeValue.map((item, i) => {
          const { data, label, name, min, max, step } = item;
          const isInlineMenuValue =
            label === "ระยะห่างเมนู" || label === "ความสูงเมนู";
          return (
            <div className="col-span-1" key={i}>
              <MainLabel
                label={label}
                value={data}
                valueInline={isInlineMenuValue}
                valueSuffix={isInlineMenuValue ? "" : "PX"}
                valueColor={isInlineMenuValue ? "#94a3b8" : "gray"}
                spacingClass={
                  isInlineMenuValue ? "mt-5 mb-[7px]" : "mt-5 mb-3"
                }
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
              />
            </div>
          );
        })}
      </div>

      {/* BG color */}
      <MainLabel label="เส้นคั่น" spacingClass="mt-2 mb-1" />
      {dv_D && (
        <>
          <ServiceColor
            theme={theme}
            color={dvc_D}
            opacity={dvo_D}
            handleColor={(value) => handleSelect(value, "dividerColor")}
            handleOpacity={(e) =>
              handleRange("dividerOpacity", Number(e.target.value))
            }
            onCommit={(_, reason) => handleRangeCommit(reason)}
            rangeColor={textColor || "#0d9488"}
            darkMode={darkMode}
          />

          <div className="grid grid-cols-12">
            <div className="col col-span-8 ml-[5px] mr-[5px]">
              <MainLabel label="รูปแบบ" />
              <ButtonGroup
                fullWidth
                variant="outlined"
                disableElevation
                color="inherit"
                aria-label="รูปแบบเส้นคั่นเมนูหลัก"
                sx={layoutGroupRootSx}
              >
                {dividerStyles.map((opt) => {
                  const selected = dvs_D === opt.value;
                  return (
                    <Button
                      key={opt.value}
                      color="inherit"
                      data-perf-control={opt.label}
                      aria-label={opt.label}
                      onClick={() => handleSelect(opt.value, "dividerStyle")}
                      sx={layoutGroupButtonSx(selected, textColor)}
                    >
                      {opt.label}
                    </Button>
                  );
                })}
              </ButtonGroup>
            </div>
            <div className="col col-span-4 ml-[5px] mr-[5px]">
              <MainLabel label="ความหนา" />
              <NumberInput
                plus={plusFontSize}
                minus={minusFontSize}
                value={dvw_D}
                field="dividerWeight"
                handChange={handleFontSize}
              />
            </div>
          </div>
        </>
      )}
    </div>
          </>)}
          </KeepMountedTab>

          <KeepMountedTab value="Sub" activeValue={menu}>
          {() => (<>
          
      {/* FontSizes */}
      <div className="grid grid-cols-2">
        {subMenuFonts.map((item, i) => {
          const {label,data,type} = item
          if (
            type === "subMenuFontWeight"
          ) {
            const weights = Array.from(
              { length:5 },
              (_, i) => (i + 2) * 100
            );
            return (
              <div className="col col-span-1 ml-[5px] mr-[5px]" key={i}>
                <MainLabel label="ความหนา" />
                <SelectInput
                darkMode={darkMode}
                  name={type}
                  value={data}
                  handChange={(e) =>
                    handleFontSize(e.target.name, e.target.value)
                  }
                  array={weights}
                />
              </div>
            );
          }

          return (
            <div className="col col-span-1 ml-[5px] mr-[5px]" key={i}>
              <MainLabel label={label} />

              <NumberInput
                plus={plusFontSize}
                minus={minusFontSize}
                value={data}
                field={type}
                handChange={handleFontSize}
              />
            </div>
          );
        })}
      </div>

      {subMenuColors.length > 0 && (
        <div className="mb-[8px]">
          <MainLabel label="สีข้อความ - สีพื้นหลัง" />
          <CycledServiceColor
            options={subMenuColors}
            theme={theme}
            rangeColor={textColor || "#0d9488"}
            darkMode={darkMode}
            controlName="สีเมนูย่อย"
            onCommit={handleRangeCommit}
            onColor={(option, value) => {
              if (option.field === "bgSubMenuColor") {
                setDataDesktop((prev) => ({
                  ...prev,
                  isSubMenuGradient: false,
                  bgSubMenuColor: value,
                }));
                setUpdated(true);
                return;
              }
              handleSelect(value, option.field);
            }}
            onOpacity={(option, e) => {
              if (option.opacityField === "bgSubMenuOpacity") {
                handleRange(
                  "bgSubMenuOpacity",
                  Number(e.target.value),
                  null,
                  { isSubMenuGradient: false }
                );
                return;
              }
              handleRange(option.opacityField, Number(e.target.value));
            }}
          />
        </div>
      )}

      <div className="grid grid-cols-2">
             <div className="col col-span-2 ml-[5px] mr-[5px]">
                  <MainLabel label="สีเส้นคั่นเมนูย่อย" spacingClass="mt-1 mb-0"/>
                  <ServiceColor
            theme={theme}
                    color={s_bc_D}
                    opacity={s_bo_D}
                    handleColor={(value) =>
                      handleSelect(value, "subMenuBorderColor")
                    }
                    handleOpacity={(e) =>
                      handleRange("subMenuBorderOpacity", Number(e.target.value))
                    }
                    onCommit={(_, reason) => handleRangeCommit(reason)}
                    rangeColor={textColor || "#0d9488"}
                    darkMode={darkMode}
                  />
              </div>
              <div className="col col-span-2 ml-[5px] mr-[5px]">
              <MainLabel label="รูปแบบ" />
              <ButtonGroup
                fullWidth
                variant="outlined"
                disableElevation
                color="inherit"
                aria-label="รูปแบบเส้นคั่นเมนูย่อย"
                sx={layoutGroupRootSx}
              >
                {dividerStyles.map((opt) => {
                  const selected = s_bs_D === opt.value;
                  return (
                    <Button
                      key={opt.value}
                      color="inherit"
                      data-perf-control={opt.label}
                      aria-label={opt.label}
                      onClick={() => handleSelect(opt.value, "subMenuBorderStyle")}
                      sx={layoutGroupButtonSx(selected, textColor)}
                    >
                      {opt.label}
                    </Button>
                  );
                })}
              </ButtonGroup>
              </div>
             </div>
   
          </>)}
          </KeepMountedTab>
              </>
            )}

{["Mobile","Tablet"].includes(device) && (
              <>
                <KeepMountedTab value="Main" activeValue={menu} eager>
          {() => (<>
          <div >
      {/* Display */}
      {l_M ? (
   <div className="mt-3 cursor-pointer w-full" >
   <img
     src={l_M}
     alt="logo"
     className="h-[45px] object-contain"
     onClick={() => toggleModal(true)}
   />
        <div className="grid grid-cols-2">
        <div className="col col-span-2" >
              <MainLabel
                label="ความสูงโลโก้"
                value={lh_M}
                spacingClass="mt-5 mb-[7px]"
              />
              <Range
              darkMode={darkMode}
              darkTextColor={darkTextColor}
                name="logoHeight"
                value={lh_M}
                min={35}
                max={60}
                step={1}
                handleChange={handleRange}
                onCommit={handleRangeCommit}
              />
            </div>
        </div>
 </div>

                    
 
    ):(
      <div className="relative w-auto rounded-md  bg-gray-200 dark:bg-zinc-800 px-2 py-1 text-sm text-zinc-900 focus-within:border-zinc-500 flex items-center justify-center w-[160px] mb-[5px] mt-3 h-[45px]" onClick={()=>toggleModal(true)}>
        
        <Image className="absolute text-[12px] text-gray-400 dark:text-gray-500 "/>

      </div>
    )}
      <div className="grid grid-cols-2">
        <div className="col col-span-2">
          <MainLabel label="การจัดวาง" />
        </div>
        {displaysMobile.map((item, i) => (
          <div
            key={i}
            className="col col-span-1 text-black dark:text-white"
          >
            <FormControlLabel
              data-perf-control={item.label || "การจัดวาง"}
              control={
                <Radio
                  checked={item.value === item.data}
                  onChange={() => changeDisplay(item.value,"display")}
                  inputProps={{ "data-perf-control": item.label || "การจัดวาง" }}
                  sx={() => {
                    return {
                      // ยังไม่ติ๊ก = สีตามโหมด
                      color: textColor,
                      "&.Mui-checked": { color: textColor }, // ติ๊กแล้ว = สีเดียวกัน
                      "&:hover": { backgroundColor: "transparent" },
                      "&.Mui-checked:hover": {
                        backgroundColor: "transparent",
                      },
                      py:0,
                    };
                  }}
                />
              }
              label={item.label}
              sx={{
                "& .MuiFormControlLabel-label": {
                  fontSize: 13,
                  color: "inherit",
                },
              }}
            />
          </div>
        ))}
      </div>
  
      {buttonColorsMobile.length > 0 && (
        <div className="mb-[25px]">
          <MainLabel label="สีไอคอน - ปุ่ม - สีกรอบ ปุ่มเมนู" />
          <CycledServiceColor
            options={buttonColorsMobile}
            theme={theme}
            rangeColor={textColor || "#0d9488"}
            darkMode={darkMode}
            controlName="สีปุ่มเมนู"
            onCommit={handleRangeCommit}
            onColor={(option, value) => {
              if (option.field === "bgMenuBarColor") {
                setData((prev) => ({
                  ...prev,
                  isMenuBarGradient: false,
                  bgMenuBarColor: value,
                }));
                setUpdated(true);
                return;
              }
              handleSelect(value, option.field);
            }}
            onOpacity={(option, e) => {
              if (option.opacityField === "bgMenuBarOpacity") {
                handleRange(
                  "bgMenuBarOpacity",
                  Number(e.target.value),
                  null,
                  { isMenuBarGradient: false }
                );
                return;
              }
              handleRange(option.opacityField, Number(e.target.value));
            }}
            renderExtra={(option) =>
              option.field !== "bgMenuBarColor" ? (
                <div className="mt-2 ml-[5px] mr-[5px]">
                  <MainLabel label="ความหนากรอบ" spacingClass="mt-2 mb-3" />
                  <NumberInput
                    plus={plusFontSize}
                    minus={minusFontSize}
                    value={bw}
                    field="borderWidth"
                    handChange={handleFontSize}
                  />
                </div>
              ) : null
            }
          />
        </div>
      )}
      <div className="-mt-[4px] grid grid-cols-2">
        {rangeValueMobile.map((item, i) => {
          const { data, label, name, min, max, step } = item;
          const isInlineMenuValue =
            label === "ความสูงบาร์" || label === "ระยะห่างเมนู";
          const tightBottom =
            label === "ระยะห่างเมนู" || label === "ความสูงเมนู";
          return (
            <div className={`col col-span-1 ml-[5px] mr-[5px]`} key={i}>
              <MainLabel
                label={label}
                value={data}
                valueInline={isInlineMenuValue}
                valueSuffix={isInlineMenuValue ? "" : "PX"}
                valueColor={isInlineMenuValue ? "#94a3b8" : "gray"}
                spacingClass={
                  tightBottom ? "mt-5 mb-[7px]" : "mt-5 mb-3"
                }
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
              />
            </div>
          );
        })}
      </div>
      {/* FontSizes */}
      <div className="grid grid-cols-2">
        {menuFontsMobile.map((item, i) => {
          const {label,data,type} = item
          if (
            type === "menuFontWeight"
          ) {
            const weights = Array.from(
              { length:4 },
              (_, i) => (i + 3) * 100
            );
            return (
              <div className="col col-span-1 ml-[5px] mr-[5px]" key={i}>
                <MainLabel label="ความหนา" />
                <SelectInput
                  name={type}
                  value={data}
                  handChange={(e) =>
                    handleFontSize(e.target.name, e.target.value)
                  }
                  array={weights}
                  darkMode={darkMode}
                />
              </div>
            );
          }

          return (
            <div className="col col-span-1 ml-[5px] mr-[5px]" key={i}>
              <MainLabel label={label} />

              <NumberInput
                plus={plusFontSize}
                minus={minusFontSize}
                value={data}
                field={type}
                handChange={handleFontSize}
              />
            </div>
          );
        })}
      </div>

      {menuColorsMobile.length > 0 && (
        <div className="mb-[25px]">
          <MainLabel label="สีข้อความ - สีพื้นหลัง" />
          <CycledServiceColor
            options={menuColorsMobile}
            theme={theme}
            rangeColor={textColor || "#0d9488"}
            darkMode={darkMode}
            controlName="สีเมนูมือถือ"
            onCommit={handleRangeCommit}
            onColor={(option, value) => handleSelect(value, option.field)}
            onOpacity={(option, e) =>
              handleRange(option.opacityField, Number(e.target.value))
            }
            renderExtra={(option) =>
              option.field === "dividerColor" ? (
                <div className="mt-5 ml-[5px] mr-[5px]">
                  <SelectInput
                    name="dividerStyle"
                    value={dvs_M}
                    handChange={(e) =>
                      handleSelect(e.target.value, e.target.name)
                    }
                    array={dividerStyles}
                    darkMode={darkMode}
                  />
                </div>
              ) : null
            }
          />
        </div>
      )}

    </div>
          </>)}
          </KeepMountedTab>

          <KeepMountedTab value="Sub" activeValue={menu}>
          {() => (<>
          
      {/* FontSizes */}
      <div className="grid grid-cols-2">
        {subMenuFontsMobile.map((item, i) => {
          const {label,data,type} = item
          if (
            type === "subMenuFontWeight"
          ) {
            const weights = Array.from(
              { length:5 },
              (_, i) => (i + 2) * 100
            );
            return (
              <div className="col col-span-1 ml-[5px] mr-[5px]" key={i}>
                <MainLabel label="ความหนา" />
                <SelectInput
                darkMode={darkMode}
                  name={type}
                  value={data}
                  handChange={(e) =>
                    handleFontSize(e.target.name, e.target.value)
                  }
                  array={weights}
                />
              </div>
            );
          }

          return (
            <div className="col col-span-1 ml-[5px] mr-[5px]" key={i}>
              <MainLabel label={label} />

              <NumberInput
                plus={plusFontSize}
                minus={minusFontSize}
                value={data}
                field={type}
                handChange={handleFontSize}
              />
            </div>
          );
        })}
      </div>

      {subMenuColorsMobile.length > 0 && (
          <div className="mb-[8px]">
            <MainLabel label="สีข้อความ - สีข้อความ Active" />
            <CycledServiceColor
              options={subMenuColorsMobile}
              theme={theme}
              rangeColor={textColor || "#0d9488"}
              darkMode={darkMode}
              controlName="สีเมนูย่อยมือถือ"
              onCommit={handleRangeCommit}
              resolveColor={
                device === "Tablet"
                  ? undefined
                  : (option) => getThemeColorToken(option.data, "mainColor")
              }
              onColor={(option, value) => handleSelect(value, option.field)}
              onOpacity={(option, e) =>
                handleRange(option.opacityField, Number(e.target.value))
              }
            />
          </div>
      )}

     
   
          </>)}
          </KeepMountedTab>
          {["Tablet", "Mobile"].includes(device) && (
          <KeepMountedTab value="Top" activeValue={menu}>
            {() => (<>
            <div className="mt-4 ml-[5px] mr-[5px]">
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
                aria-label="โหมดการแสดงผล Top Bar"
                sx={layoutGroupRootSx}
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
                      data-perf-control={opt.label}
                      aria-label={opt.label}
                      onClick={() => changeTabletTopBarMode(opt.value)}
                      sx={layoutGroupButtonSx(selected, textColor)}
                    >
                      {opt.label}
                    </Button>
                  );
                })}
              </ButtonGroup>
            </div>
            </>)}
          </KeepMountedTab>
          )}
          {device === "Mobile" && (
          <KeepMountedTab value="Nav" activeValue={menu}>
          {() => (<>
          
          {/* FontSizes */}
    
    

          <Stack direction="row" spacng={1} sx={{ alignItems: "center",marginBottom:"15px" }} data-perf-control="เปิดใช้งานแถบนำทาง">
            <AntSwitch
              inputProps={{
                "aria-label": "เปิดใช้งานแถบนำทาง",
                "data-perf-control": "เปิดใช้งานแถบนำทาง",
              }}
              checked={isAnav_M}
              onChange={() => {
                  setUpdated(true)
                  setData(prev=>{
                    const next = {...prev}
                    next.isAbleNavBottom = !next.isAbleNavBottom
                    return next
                  })
               }}
            />
            <Typography sx={{ fontSize: 13,ml:2 }}>เปิดใช้งาน</Typography>
          </Stack>
          <MainLabel label="การจัดวาง" />
          <div className="grid grid-cols-2">
            {navBottomDisplays.map((item, i) => (
          <div
            key={i}
            className="col col-span-1 text-black dark:text-white"
          >
            <FormControlLabel
              data-perf-control={item.label || "การจัดวาง"}
              control={
                <Radio
                  checked={item.value === item.data}
                  onChange={() => changeDisplay(item.value,"navBottomDisplay")}
                  inputProps={{ "data-perf-control": item.label || "การจัดวาง" }}
                  sx={() => {
                    return {
                      // ยังไม่ติ๊ก = สีตามโหมด
                      color: textColor,
                      "&.Mui-checked": { color: textColor }, // ติ๊กแล้ว = สีเดียวกัน
                      "&:hover": { backgroundColor: "transparent" },
                      "&.Mui-checked:hover": {
                        backgroundColor: "transparent",
                      },
                      py:0,
                    };
                  }}
                />
              }
              label={item.label}
              sx={{
                "& .MuiFormControlLabel-label": {
                  fontSize: 13,
                  color: "inherit",
                },
              }}
            />
          </div>
        ))}
            </div>
        
        
            {(navd_M === "text"
              ? [
                  {
                    icon: normalizeTextModeIcon(navIcon_M),
                    label: navText_M || navTextModeDefault.label,
                    link: "Page1",
                  },
                ]
              : nav_M
            ).map((item, i) => {
              const {
               icon,label,link
              } = item;


              const bgColor = darkMode === "dark" ?"#27272E":"#ffffff"
              const borderColor = darkMode === "dark" ?"#494d54E":"#cad5e0"
              const textColor = darkMode === "dark" ?"#b3b3b3":"#333333"

              const colSpan = navd_M === "text" ? "col-span-5":"col-span-2"

              const changeIcon = (icon)=>{
                if(navd_M === "text"){
                  setData(prev => {
                    const next = lodash.cloneDeep(prev);
                    next.navIcon = icon;
                    return next;
                  });
                  setUpdated(true);
                }else{
                  handleChange({target:{name:"icon",value:icon}},i,"navBottoms")
                }
              }
    
              return (
                <div key={i} className={`grid grid-cols-5 my-[15px] gap-[10px]`}>
                  
                  <div className={`col ${colSpan}`}>
                  <FieldWithBtn
                    name="label"
                    value={label}
                    icon={icon}
                    darkMode={darkMode}
                    handleClick={() => setOpenIconMoal(i+1)}
                    handleChange={(e) => {
                      if (navd_M === "text") {
                        const { value } = e.target;
                        setData((prev) => ({ ...prev, navText: value }));
                        setUpdated(true);
                        return;
                      }
                      handleChange(e, i, "navBottoms");
                    }}
                  />
                  </div>
                  {navd_M === "menu" && (
                       <div className="col col-span-2">
                       <SelectInput fontSize={12} name="link" value={link} handChange={handleSelect} darkMode={darkMode} array={pages}/>
                       </div>
                  )}
                   {navd_M === "menu" && (
                       <div className="col col-span-1  flex gap-2">
                       <Btn handleClick={()=>{
                         const minNavMenu = navDesign_M === "modern" ? 5 : 1
                         if(nav_M.length === minNavMenu) return
                         setData(prev=>{
                            
                           const next = lodash.cloneDeep(prev)
                           next.navBottoms.splice(i,1)
                           return next
                         })
                       }} icon={{type:"fas",name:"faMinus"}} lastChild={true} borderColor={borderColor} bgColor={bgColor} color={textColor}/>
                       <Btn handleClick={()=>{
                         setData(prev=>{
                          if((device === "Mobile" && nav_M.length === 5) || (device === "Tablet" && nav_M.length === 7)) return prev
                           const next = lodash.cloneDeep(prev)
                           const newNav = lodash.cloneDeep(navPrototype)
                           next.navBottoms.splice(i+1,0,newNav)
                           return next
                         })
                       }} icon={{type:"fas",name:"faPlus"}} lastChild={true} borderColor={borderColor} bgColor={bgColor} color={textColor}/>
                       </div>
                  )}
                 
                 

  <ServiceIcon
  icon={icon}
   header="ไอคอน"
    open={openIconMoal === i+1}
    onClose={()=>setOpenIconMoal(false)}
    handleChange={(icon)=>{
      changeIcon(icon)
    }}
    darkColor={darkTextColor}
    darkMode={darkMode}
  />

                </div>
              );
            })}
      
    
      {navd_M === "menu" && (
        <>
      <div className="mb-3 mt-2 flex items-center gap-2">
        <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
          รูปแบบเมนู
        </span>
        <div className="dash-heading-rule min-w-0 flex-1 border-b" />
      </div>
      <ButtonGroup
        fullWidth
        variant="outlined"
        disableElevation
        color="inherit"
        aria-label="ดีไซน์เมนูล่าง"
        sx={layoutGroupRootSx}
      >
        {navBottomDesigns.map((opt) => {
          const selected = navDesign_M === opt.value;
          return (
            <Button
              key={opt.value}
              color="inherit"
              data-perf-control={opt.label}
              aria-label={opt.label}
              onClick={() => changeDisplay(opt.value, "navBottomDesign")}
              sx={layoutGroupButtonSx(selected, textColor)}
            >
              {opt.label}
            </Button>
          );
        })}
      </ButtonGroup>
      <div className="mb-2" />
      </>
      )}

      {navMenuStyleOptions.length > 0 && (
        <div className="mb-[18px]">
          <MainLabel label="สีพื้นหลังเมนู - สีไอคอน - สีข้อความ" />
          <CycledServiceColor
            options={navMenuStyleOptions}
            theme={theme}
            rangeColor={textColor || "#0d9488"}
            darkMode={darkMode}
            controlName="สีแถบนำทาง"
            onCommit={handleRangeCommit}
            onColor={(option, value) => handleSelect(value, option.field)}
            onOpacity={(option, e) =>
              handleRange(option.opacityField, Number(e.target.value))
            }
            renderExtra={(option) =>
              option.sizeField ? (
                <div className="mt-1 grid grid-cols-12">
                  <div className="col-span-12 ml-[5px] mr-[5px]">
                    <MainLabel label={option.sizeLabel} spacingClass="mt-2 mb-1" />
                  </div>
                  <div className="col-span-6 mt-2 ml-[5px] mr-[5px]">
                    <NumberInput
                      plus={plusFontSize}
                      minus={minusFontSize}
                      value={option.sizeValue}
                      field={option.sizeField}
                      handChange={handleFontSize}
                    />
                  </div>
                </div>
              ) : null
            }
          />
        </div>
      )}



<div className="-mt-4 grid grid-cols-2">
        {rangeValueNavMobile
          .filter((item) => (navd_M === "menu" ? true : item.name !== "navSpace"))
          .map((item, i) => {
          const { data, label, name, min, max, step } = item;
          const tightBottom =
            label === "ระยะห่างเมนู" || label === "ความสูงเมนู";
          return (
            <div className={`col col-span-1 ml-[5px] mr-[5px]`} key={i}>
              <MainLabel
                label={label}
                value={data}
                valueInline
                valueSuffix=""
                valueColor="#94a3b8"
                spacingClass={
                  tightBottom ? "mt-5 mb-[7px]" : "mt-5 mb-3"
                }
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
              />
            </div>
          );
        })}
      </div>

      

      {navDesign_M !== "modern" && navd_M === "menu" && (
        <>
      <MainLabel label="เส้นคั่น" />

      {ndv_M && (
        <>  
        <div className="grid grid-cols-2">
          <div className="col-span-2 -mt-1">
          <ServiceColor
            theme={theme}
            color={ndvc_M}
            opacity={ndvo_M}
            handleColor={(value) => handleSelect(value, "navDividerColor")}
            handleOpacity={(e) =>
              handleRange("navDividerOpacity", Number(e.target.value))
            }
            onCommit={(_, reason) => handleRangeCommit(reason)}
            rangeColor={textColor || "#0d9488"}
            darkMode={darkMode}
            compact
          />
          </div>
       

          <div className="col col-span-1 mt-5 ml-[5px] mr-[5px]">
            <SelectInput
              name="navDividerStyle"
              value={ndvs_M}
              handChange={(e) =>
                handleSelect(e.target.value, e.target.name)
              }
              array={dividerStyles}
              darkMode={darkMode}
            />
          </div>
        </div></>
      )}
      </>
      )}
        
    
      
    
        
       
          </>)}
              </KeepMountedTab>
          )}
              </>
            )}




        
               
           
          </li>
        </ul>
      </nav>
    </TabContext>
    {openImgModal && (
  <ImageModal
    setOpenModal={toggleModal}
    openModal={openImgModal}
    name="logo"
    handleChange={(imgPath) => handleSelect(imgPath, "logo")}
  />
)}

    </div>
  );

  function MainLabel({
    label,
    value = NaN,
    valueSuffix = "PX",
    valueInline = false,
    valueColor = "gray",
    spacingClass = "mt-5 mb-3",
  }) {
    const w = "flex-1";
    let colorSwitchList =  [
      "สีพื้นหลังเมนูย่อย",
      "เส้นคั่น",
      "สีพื้นหลังบาร์"
    ]

    const colorSwitch = colorSwitchList.includes(label)

    

    

        const checked = ()=>{
          if(label === "สีพื้นหลังเมนูย่อย"){
            return s_isGD_D
          }else if(label === "เส้นคั่น"){
            if(menu === "Nav"){
              return ndv_M
            }else if(menu === "Main"){
              return dv_D
            }
          }else if(label === "สีพื้นหลังบาร์"){
            return isbrGD_M
          }else{
            return "No"
          }
        }

        const typography = ()=>{
          if(label === "เส้นคั่น" || checked() === "No"){
            return ""
          }
          if(checked()){
            return "สีไล่โทน"
          }else{
            return  "สีพื้น"
          }

        }

        const onSwitch = ()=>{
          setUpdated(true)
          setData(prev=>{
            if (label === "เส้นคั่น") {
              if(menu === "Nav"){
                return { ...prev, navDivider: !prev.navDivider };
              }else if(menu === "Main"){
                return { ...prev, divider: !prev.divider };
              }
            }else if(label === "สีพื้นหลังบาร์") {
              return { ...prev, isMenuBarGradient: !prev.isMenuBarGradient };
            }
            else if(label === "สีพื้นหลังเมนูย่อย") {
              return { ...prev, isSubMenuGradient: !prev.isSubMenuGradient};
            }
            return prev;
          })
        }
  
        

    return (
      <div className={`flex items-center gap-2 ${spacingClass}`}>
        <span className="dash-panel-label text-[13px] font-bold">
          {label}
        </span>
        {valueInline && !Number.isNaN(value) && (
          <span className="text-[13px]" style={{ color: valueColor }}>
            {value}
            {valueSuffix ? ` ${valueSuffix}` : ""}
          </span>
        )}
        <div className={`dash-heading-rule border-b ${w}`}></div>
        {colorSwitch && (
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <span data-perf-control={label}>
            <AntSwitch
              inputProps={{
                "aria-label": typography() || label,
                "data-perf-control": label,
              }}
              checked={checked()}
              onChange={() => {
                onSwitch()
              }}
            />
            </span>
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
export default MenuBarOffcanvas;
