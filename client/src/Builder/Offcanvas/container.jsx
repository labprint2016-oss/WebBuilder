import { useEffect, useState } from "react";
import { getTheme } from "../../../Functions/theme";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  ButtonGroup,
  Input,
  InputAdornment,
  Box,
  Slider,
  Typography,




} from "@mui/material";
import lodash, { isNull } from "lodash";
import { Check, Monitor, Smartphone, Tablet } from "lucide-react";
import { styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import Stack from '@mui/material/Stack';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import { swatchSelectedCheckClassName } from "../Layouts/Elements/swatchCheckClass";
import { THEME_PANEL_BASIC_COLOR_SWATCHES } from "../themePanelBasicColors";
import {
  normalizeContainerOverlapFields,
  overlapFieldKeyForTab,
  overlapSliderResolvedValue,
} from "../Layouts/sectionOverlapDevice";
import Range from "../HTML/Range";
import ImageModal from "../imageModal";

/** ระยะห่าง Section ด้านบน/ล่าง: อย่างน้อย 0–200; ถ้าข้อมูลเดิมเกิน 200 จะขยาย max ของ slider ให้ลากลงมาได้ */
const SECTION_VERTICAL_PADDING_MAX = 200;

/** ชุดคลาส range เดียวกับ degrees / panel รูปภาพ */
const THEME_RANGE_SLIDER_CLASS = `
                    w-full cursor-pointer appearance-none h-2 rounded-full
                    bg-zinc-200
                    dark:bg-zinc-700
                    theme-range-fill-track
                    [&::-webkit-slider-runnable-track]:border-0
                    [&::-moz-range-track]:border-0
                    [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-emerald-300
                    dark:[&::-webkit-slider-thumb]:bg-emerald-300
                    [&::-webkit-slider-thumb]:bg-slate-900
                    [&::-webkit-slider-thumb]:border-0
                    [&::-moz-range-thumb]:cursor-pointer
                    [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4
                    [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:bg-emerald-300
                    [&::-moz-range-thumb]:border-0
                  `;

/** ปุ่มเลือกรูปแบบการแสดงผล — สไตล์เดียวกับ panel ไอคอน «รูปทรงกรอบ» */
const OPTION_CHIP_RADIUS = "0.375rem";
const CHIP_BORDER = "#e2e8f0";
const CHIP_BORDER_DARK = "rgba(255, 255, 255, 0.1)";
const CHIP_BG = "#ffffff";
const CHIP_BG_HOVER = "#f8fafc";
const CHIP_BG_DARK = "rgba(30, 41, 59, 0.9)";
const CHIP_BG_DARK_HOVER = "rgba(30, 41, 59, 1)";

const sectionLayoutGroupButtonSx = (selected, accent) => {
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
          "&:hover": {
            backgroundColor: a,
            borderColor: "transparent",
          },
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
    "&.Mui-focusVisible": {
      outline: `2px solid ${a}`,
      outlineOffset: 1,
      boxShadow: "none",
    },
    "& .MuiTouchRipple-child": {
      backgroundColor: a,
    },
  };
};

const sectionLayoutGroupRootSx = {
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

const SECTION_DISPLAY_LAYOUT_OPTIONS = [
  { value: true, label: "ความกว้างเต็มจอ" },
  { value: false, label: "ความกว้างมาตรฐาน" },
];

/** จุดไล่โทน — รูปแบบเดียวกับ panel Heading (สีข้อความ) */
const SECTION_GRADIENT_STOPS = [
  { value: "start", label: "จุดเริ่ม" },
  { value: "end", label: "จุดสิ้น" },
];

/** รูปแบบเส้นคั่นคอลัมน์ — เหมือน Heading (เส้นคั่น) */
const COLUMN_DIVIDER_STYLES = [
  { value: "solid", label: "ตรง" },
  { value: "dashed", label: "ประ" },
  { value: "dotted", label: "จุด" },
];

const OVERLAP_DEVICE_TABS = [
  { id: "desktop", ariaLabel: "คอมพิวเตอร์", Icon: Monitor },
  { id: "tablet", ariaLabel: "แท็บเล็ต", Icon: Tablet },
  { id: "mobile", ariaLabel: "มือถือ", Icon: Smartphone },
];

const ContainerOffcanvas = ({ element, updateContainer: onUpdate, close,textColor }) => {


  const [darkTextColor,setDarkTextColor] = useState(localStorage.getItem("darkTextColor"))



  const AntSwitch = styled(Switch)(({ theme }) => ({
    width: 28,
    height: 16,
    padding: 0,
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
          backgroundColor: textColor,

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

  const [data, setData] = useState(() =>
    normalizeContainerOverlapFields(element ?? {})
  );
  const [theme, setTheme] = useState(null);
  const [updated, setUpdated] = useState(false);
  const isFirstSection = (element?._sectionIndex ?? 0) === 0;
  const isSplitSection = Boolean(element?._isSplitSection);
  const [sectionGradientPicker, setSectionGradientPicker] = useState("start");
  const [backgroundPickerOpen, setBackgroundPickerOpen] = useState(false);
  const [overlapDeviceTab, setOverlapDeviceTab] = useState("desktop");


  const loadTheme = () => {
    getTheme("68d37327bedb0efab7dacafb")
      .then((res) => {
        setTheme(res.data);

      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    loadTheme();
  },[]);

  const sectionPaddingSliderMax = (v) =>
    Math.max(SECTION_VERTICAL_PADDING_MAX, Number(v) || 0);

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
      const cap = Math.max(
        SECTION_VERTICAL_PADDING_MAX,
        Number(prev[field]) || 0
      );
      next = Math.min(cap, next);

      return { ...prev, [field]: next };
    });
    setUpdated(true);
  };

  const changeFluid = (value) => {
    setData((prev) => {
      return { ...prev, isFluid: value };
    });
    setUpdated(true);
  };

  useEffect(() => {
    if (!updated) return;
    const clonedData = lodash.cloneDeep(data);
    for (const key in clonedData) {
      if (clonedData[key] === "") {
        clonedData[key] = 0;
      }
    }
    onUpdate(clonedData, data.id);
    /* สำคัญ: ถ้าไม่รีเซ็ต หลังแก้ Section ครั้งหนึ่ง updated จะค้าง true — พอ sync latestColID จาก canvas จะ setData แล้ว effect นี้ยิง onUpdate อีกครั้งด้วย layouts เก่าใน closure ของ parent → ทับคอลัมน์ที่เพิ่งโคลน */
    setUpdated(false);
  }, [data]);

  

  const handleColor = (value,index=null) => {
    if(!isNull(index)){

      setData((prev)=>{
        const bgc = prev.backgroundColorGradient
        bgc[index] = value
        return{...prev,backgroundColorGradient:bgc}
      })
    }else{
      setData((prev) => {return{...prev,backgroundColor:value}});
    }
    setUpdated(true);
  };


  const handleOpacity = (field,value,index=null) => {
    if(!isNull(index)){
      setData((prev)=>{
        const opct = prev[field]
        opct[index] = value
        return{...prev,[field]:opct}
      })
    }else{
      setData((prev)=>{return{...prev,[field]:value}})
    }
    
    setUpdated(true)
  }

  useEffect(() => {
    setData(normalizeContainerOverlapFields(element ?? {}));
    setUpdated(false);
    setSectionGradientPicker("start");
    setOverlapDeviceTab("desktop");
  }, [element.id]);

  const overlapSliderValue = overlapSliderResolvedValue(
    data,
    overlapDeviceTab
  );
  const setOverlapForTab = (tab, v) => {
    const key = overlapFieldKeyForTab(tab);
    setData((prev) => {
      const next = { ...prev, [key]: v };
      if (tab === "desktop") {
        next.sectionOverlapTop = v;
      }
      return next;
    });
    setUpdated(true);
  };

  /** หลังโคลนคอลัมน์บน canvas ค่า latestColID จาก parent อัปเดต — ผสมเข้า draft โดยไม่รีเซ็ตฟิลด์อื่น */
  useEffect(() => {
    if (!element?.id) return;
    const lc = element.latestColID;
    if (lc == null) return;
    setData((prev) => {
      if (!prev || prev.id !== element.id) return prev;
      if (prev.latestColID === lc) return prev;
      return { ...prev, latestColID: lc };
    });
  }, [element?.id, element?.latestColID]);

  const [allColors,setAllColors] = useState([])
  const basicColors = THEME_PANEL_BASIC_COLOR_SWATCHES;
  /** สีเส้นคั่นเริ่มต้น = basicColors[2] เทาอ่อน (รายการก่อนสีขาว) — ตรงช่องที่ติ๊กในแผง */
  const defaultColumnDividerSwatchColor = basicColors[2];

  useEffect(()=>{
      if(allColors.length === 0 && theme){
        theme?.mainColor.map((color,i)=>{
          setAllColors(prev=>{
            return [...prev,{type:"mainColor",index:i}]
          })
        })
        theme?.textColor.map((color,i)=>{
          setAllColors(prev=>{
            return [...prev,{type:"textColor",index:i}]
          })
        })
        theme?.otherColor.map((color,i)=>{
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
       
    
  },[theme])


  const colorlabels = ["สีพื้นหลังแบบสีพื้น","สีพื้นหลังแบบไล่โทน"];

  const sectionGradientGi = sectionGradientPicker === "end" ? 1 : 0;
  const sectionGradientDegRaw = Number(data.degrees);
  const sectionGradientDeg = Number.isFinite(sectionGradientDegRaw)
    ? Math.min(360, Math.max(0, sectionGradientDegRaw))
    : 0;

  const columnDividerStyle = data.columnDividerStyle || "dashed";
  const columnDividerOpacity = data.columnDividerOpacity ?? 255;
  const columnDividerColorVal = (() => {
    const fallback = defaultColumnDividerSwatchColor;
    let c = data.columnDividerColor ?? fallback;
    if (
      c &&
      typeof c === "object" &&
      c.type &&
      Array.isArray(theme?.[c.type]) &&
      theme[c.type].length > 0 &&
      typeof c.index === "number"
    ) {
      const max = theme[c.type].length - 1;
      if (c.index > max) c = { ...c, index: max };
    }
    return c;
  })();
  const rawColumnDividerVertLen = Number(
    data.columnDividerVerticalLengthPercent
  );
  const columnDividerVerticalLengthPct = Math.min(
    100,
    Math.max(
      10,
      Number.isFinite(rawColumnDividerVertLen)
        ? rawColumnDividerVertLen
        : 95
    )
  );

  const chipSelected = (active, chip) => {
    if (
      active &&
      typeof active === "object" &&
      chip &&
      typeof chip === "object"
    ) {
      return lodash.isEqual(active, chip);
    }
    if (typeof active === "string" && typeof chip === "string") {
      return active.toLowerCase() === chip.toLowerCase();
    }
    return false;
  };




  return (
    <aside
      className={`
     
     sm:block 0 overflow-hidden bg-white dark:bg-gray-900/80 border-r border-slate-200 dark:border-white/10`}
    >
      <div className="shrink-0 flex items-center justify-between border-b border-slate-200 bg-gray-100 px-6 pt-5 pb-3 dark:border-white/10 dark:bg-slate-800/70">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 font-bold tracking-wide text-slate-800 dark:text-white/90">
            Section
          </span>
          <span
            className="inline-flex min-w-0 max-w-full items-center rounded-md border border-[#333333] bg-[#333333] px-2 py-0.5 text-[11px] font-mono font-bold leading-none text-white tabular-nums dark:border-[#333333] dark:bg-[#333333] dark:text-white"
            title={String(data.id ?? "")}
          >
            <span className="truncate">{data.id}</span>
          </span>
        </div>
        <button
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-white/70"
          onClick={() => close(null, null, null)}
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
      <nav className="px-4 pb-6  overflow-y-auto h-[calc(100%-64px)] w-[400px]">
        <ul className="mt-1 pl-1">
          <li>
            {/* ระยะบน / ล่าง — Slider แบบเดียวกับ panel รูปภาพ */}
            <Box sx={{ width: "100%", px: 0.25, mt: 3 }}>
              <div className="grid w-full grid-cols-2 gap-x-3 gap-y-3">
                <Box sx={{ minWidth: 0 }}>
                  <MainLabel
                    label="ระยะห่างด้านบน"
                    metricValue={Number(data.paddingTop) || 0}
                    compact
                  />
                  <div className="min-w-0 px-[2px] pb-[2px] pt-[2px]">
                    <input
                      type="range"
                      min={0}
                      max={sectionPaddingSliderMax(data.paddingTop)}
                      step={1}
                      value={Number(data.paddingTop) || 0}
                      onChange={(e) =>
                        handlePadding(
                          "paddingTop",
                          Number(e.target.value) || 0
                        )
                      }
                      className={THEME_RANGE_SLIDER_CLASS}
                      style={{
                        ["--pos"]: `${
                          ((Number(data.paddingTop) || 0) /
                            sectionPaddingSliderMax(data.paddingTop)) *
                          100
                        }%`,
                        ["--fill"]: textColor,
                      }}
                    />
                  </div>
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <MainLabel
                    label="ระยะห่างด้านล่าง"
                    metricValue={Number(data.paddingBottom) || 0}
                    compact
                  />
                  <div className="min-w-0 px-[2px] pb-[2px] pt-[2px]">
                    <input
                      type="range"
                      min={0}
                      max={sectionPaddingSliderMax(data.paddingBottom)}
                      step={1}
                      value={Number(data.paddingBottom) || 0}
                      onChange={(e) =>
                        handlePadding(
                          "paddingBottom",
                          Number(e.target.value) || 0
                        )
                      }
                      className={THEME_RANGE_SLIDER_CLASS}
                      style={{
                        ["--pos"]: `${
                          ((Number(data.paddingBottom) || 0) /
                            sectionPaddingSliderMax(
                              data.paddingBottom
                            )) *
                          100
                        }%`,
                        ["--fill"]: textColor,
                      }}
                    />
                  </div>
                </Box>
              </div>
            </Box>

            {/* ซ้อนทับ Section บน — ซ่อนสำหรับ Section แรกและ Split section */}
            {!isFirstSection && !isSplitSection && <Box sx={{ width: "100%", px: 0.25, mt: 3 }}>
              <MainLabel
                label="ซ้อนทับ Section บน"
                metricValue={overlapSliderValue}
                compact
              />
              <div className="mt-2">
                <ButtonGroup
                  fullWidth
                  variant="outlined"
                  disableElevation
                  color="inherit"
                  aria-label="เลือกอุปกรณ์สำหรับระยะซ้อนทับ"
                  sx={sectionLayoutGroupRootSx}
                >
                  {OVERLAP_DEVICE_TABS.map((tab) => {
                    const selected = overlapDeviceTab === tab.id;
                    const Icon = tab.Icon;
                    return (
                      <Button
                        key={tab.id}
                        color="inherit"
                        aria-label={tab.ariaLabel}
                        aria-pressed={selected}
                        onClick={() => setOverlapDeviceTab(tab.id)}
                        sx={{
                          ...sectionLayoutGroupButtonSx(selected, textColor),
                          minWidth: 0,
                          px: 0.5,
                        }}
                      >
                        <Icon
                          className="size-[18px] shrink-0"
                          strokeWidth={2.5}
                          aria-hidden
                        />
                      </Button>
                    );
                  })}
                </ButtonGroup>
              </div>
              <div className="min-w-0 px-[2px] pb-[2px] pt-[10px]">
                <input
                  type="range"
                  min={0}
                  max={300}
                  step={1}
                  value={overlapSliderValue}
                  onChange={(e) => {
                    const v = Number(e.target.value) || 0;
                    setOverlapForTab(overlapDeviceTab, v);
                  }}
                  className={THEME_RANGE_SLIDER_CLASS}
                  style={{
                    ["--pos"]: `${(overlapSliderValue / 300) * 100}%`,
                    ["--fill"]: textColor,
                  }}
                />
              </div>
              {overlapSliderValue > 0 && (
                <p className="mt-1 text-[11px] leading-snug text-slate-400 dark:text-white/35">
                  เพิ่ม ระยะห่างด้านล่าง ของ Section บน เพื่อเผื่อพื้นที่ (ปรับต่ออุปกรณ์ที่เลือก)
                </p>
              )}
            </Box>}

            {/* รูปแบบการแสดงผล — ปุ่มกลุ่มแบบ panel ไอคอน «รูปทรงกรอบ» */}
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
              aria-label="รูปแบบการแสดงผล"
              sx={sectionLayoutGroupRootSx}
            >
              {SECTION_DISPLAY_LAYOUT_OPTIONS.map((opt) => {
                const isFluidLayout = data.isFluid === true;
                const selected = opt.value === isFluidLayout;
                return (
                  <Button
                    key={String(opt.value)}
                    color="inherit"
                    onClick={() => changeFluid(opt.value)}
                    sx={sectionLayoutGroupButtonSx(selected, textColor)}
                  >
                    <Box
                      component="span"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "5px",
                      }}
                    >
                      {opt.label}
                    </Box>
                  </Button>
                );
              })}
            </ButtonGroup>


              {/* BG color */}
            <MainLabel label={data.isGradient?colorlabels[1]:colorlabels[0]} />

            {!data.isGradient ? (
              // Solid — รูปแบบเดียวกับ panel Heading (สีข้อความ): กล่องขาว + สไลด์ความทึบ + ตารางสี
              <Box sx={{ width: "100%", px: 0.25, pt: 0 }}>
                <div className="mt-2 w-full rounded-md bg-white px-[0px] pb-[5px] pt-[2px] dark:bg-zinc-800">
                  <div className="px-[5px] pb-2">
                    <Range
                      min={0}
                      max={255}
                      value={Number(data.opacityColor) || 0}
                      step={1}
                      handleChange={(e) =>
                        handleOpacity(
                          "opacityColor",
                          Number(e.target.value)
                        )
                      }
                      pos={((Number(data.opacityColor) || 0) / 255) * 100}
                      color={textColor || "#0d9488"}
                    />
                  </div>
                  <div className="grid grid-cols-10 place-items-center gap-x-0 gap-y-[6px] px-[5px] pb-0">
                    {allColors.map((color, i) => {
                      const bgColor =
                        typeof color === "string"
                          ? color
                          : theme?.[color.type]?.[color.index];
                      if (bgColor == null) return null;
                      const value = color;
                      let margin = "";
                      if (i % 8 !== 0 && (i + 1) % 8 !== 0) {
                        margin += "mx-[65.75px] ";
                      }
                      const selected =
                        lodash.isEqual(data.backgroundColor, value) ||
                        data.backgroundColor === value;
                      return (
                        <div className={margin} key={i}>
                          <button
                            type="button"
                            className="flex size-[25px] items-center justify-center rounded-full border border-slate-200 dark:border-white/15"
                            style={{ backgroundColor: bgColor }}
                            onClick={() => handleColor(value)}
                            aria-label={`เลือกสี ${bgColor}`}
                          >
                            {selected ? (
                              <Check
                                className={swatchSelectedCheckClassName(
                                  bgColor
                                )}
                                strokeWidth={4}
                                aria-hidden
                              />
                            ) : null}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Box>
            ) : (
              <>
                <ButtonGroup
                  fullWidth
                  variant="outlined"
                  disableElevation
                  color="inherit"
                  aria-label="เลือกจุดไล่โทนที่แก้สี"
                  sx={{ ...sectionLayoutGroupRootSx, mb: 0, mt: 0.5 }}
                >
                  {SECTION_GRADIENT_STOPS.map((opt) => {
                    const selected =
                      (opt.value === "end" &&
                        sectionGradientPicker === "end") ||
                      (opt.value === "start" &&
                        sectionGradientPicker !== "end");
                    return (
                      <Button
                        key={opt.value}
                        color="inherit"
                        onClick={() =>
                          setSectionGradientPicker(
                            opt.value === "end" ? "end" : "start"
                          )
                        }
                        sx={sectionLayoutGroupButtonSx(selected, textColor)}
                      >
                        {opt.label}
                      </Button>
                    );
                  })}
                </ButtonGroup>
                {/* ไล่โทน — รูปแบบเดียวกับ panel Heading (สีข้อความ): กล่องขาว + สไลด์ความทึบ + ตารางสี */}
                <Box sx={{ width: "100%", px: 0.25, pt: 0.75 }}>
                  <div className="mt-2 w-full rounded-md bg-white px-[0px] pb-[5px] pt-[2px] dark:bg-zinc-800">
                    <div className="px-[5px] pb-2">
                      <Range
                        min={0}
                        max={255}
                        value={
                          Number(
                            data.opacityColorGradient?.[sectionGradientGi]
                          ) || 0
                        }
                        step={1}
                        handleChange={(e) =>
                          handleOpacity(
                            "opacityColorGradient",
                            Number(e.target.value),
                            sectionGradientGi
                          )
                        }
                        pos={
                          ((Number(
                            data.opacityColorGradient?.[sectionGradientGi]
                          ) || 0) /
                            255) *
                          100
                        }
                        color={textColor || "#0d9488"}
                      />
                    </div>
                    <div className="grid grid-cols-10 place-items-center gap-x-0 gap-y-[6px] px-[5px] pb-0">
                      {allColors.map((color, i) => {
                        const bgColor =
                          typeof color === "string"
                            ? color
                            : theme?.[color.type]?.[color.index];
                        if (bgColor == null) return null;
                        const value = color;
                        let margin = "";
                        if (i % 8 !== 0 && (i + 1) % 8 !== 0) {
                          margin += "mx-[65.75px] ";
                        }
                        const g0 = data.backgroundColorGradient?.[0];
                        const g1 = data.backgroundColorGradient?.[1];
                        const selected0 =
                          lodash.isEqual(g0, value) || g0 === value;
                        const selected1 =
                          lodash.isEqual(g1, value) || g1 === value;
                        const selected = selected0 || selected1;
                        return (
                          <div className={margin} key={i}>
                            <button
                              type="button"
                              className="flex size-[25px] items-center justify-center rounded-full border border-slate-200 dark:border-white/15"
                              style={{ backgroundColor: bgColor }}
                              onClick={() =>
                                handleColor(value, sectionGradientGi)
                              }
                              aria-label={`เลือกสี ${bgColor}`}
                            >
                              {selected ? (
                                <Check
                                  className={swatchSelectedCheckClassName(
                                    bgColor
                                  )}
                                  strokeWidth={4}
                                  aria-hidden
                                />
                              ) : null}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Box>

                <Box
                  sx={{ width: "100%", px: 0.25, mt: 1 }}
                  aria-label="องศาไล่โทน"
                >
                  <Typography
                    component="div"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      flex: 1,
                      fontSize: 13,
                      fontWeight: 600,
                      color: "rgb(51 65 85)",
                      mb: 0.35,
                      fontVariantNumeric: "tabular-nums",
                      ".dark &": { color: "rgba(255,255,255,0.78)" },
                    }}
                  >
                    องศาไล่โทน{" "}
                    <span className="text-slate-400 dark:text-slate-400">
                      {Math.round(sectionGradientDeg)}
                    </span>
                    <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
                  </Typography>
                  <div className="w-full pt-0 pb-[2px] px-[2px]">
                    <Range
                      min={0}
                      max={360}
                      step={1}
                      value={sectionGradientDeg}
                      handleChange={(e) => {
                        const v = Number(e.target.value);
                        setUpdated(true);
                        setData((prev) => ({
                          ...prev,
                          degrees: Math.min(
                            360,
                            Math.max(0, Number.isFinite(v) ? v : 0)
                          ),
                        }));
                      }}
                      pos={(sectionGradientDeg / 360) * 100}
                      color={textColor || "#0d9488"}
                    />
                  </div>
                </Box>
              </>
            )}

<MainLabel label="ภาพพื้นหลัง" />



<Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>

    <Button
      type="button"
      variant="contained"
      startIcon={<ImageOutlinedIcon />}
      onClick={(e) => {
        e.currentTarget.blur();
        requestAnimationFrame(() => setBackgroundPickerOpen(true));
      }}
      sx={{
        "& .MuiButton-startIcon > *:nth-of-type(1)": {
          fontSize: 18,
        },
        boxShadow: "none",
        "&:hover": { boxShadow: "none" },
        backgroundColor: textColor,
        fontSize: 12,
        height: 28,
      }}
    >
      คลังรูปภาพ
    </Button>


    <Button
      variant="contained"
      sx={{
        ml: "auto",
        minWidth: 48,
        px: 1.75,
        py: 0.25,
        boxShadow: "none",
        "&:hover": { boxShadow: "none" },
        backgroundColor: textColor,
        ".dark &": { backgroundColor: textColor },
        fontSize: 12,
        height: 28,
        lineHeight: 1.2,
      }}
      onClick={() => {
        setData((prev=>{
          setUpdated(true)
          return {...prev,backgroundImage:"",opacityImage:1}
        }))
      }}
      disabled={!data.backgroundImage}
    >
      ลบ
    </Button>
</Box>


   

    







    {data.backgroundImage ? (
      <div className="mt-3 w-full">
          <img src={data.backgroundImage} className="rounded-md" style={{opacity:data.opacityImage}}/>


          <div className="mt-4 flex items-center gap-3">
  <span className="w-13 shrink-0 tracking-[0.4px] text-sm text-zinc-900 dark:text-white/80">
    โปร่งแสง
  </span>
 <input
    type="range"
    min={0}
    max={1}
    step={0.01}
    value={data.opacityImage}
    onChange={(e) => handleOpacity("opacityImage", Number(e.target.value))}
    className={`
    w-full cursor-pointer appearance-none h-2 rounded-full
    bg-zinc-200
    dark:bg-zinc-700


    theme-range-fill-track

    [&::-webkit-slider-runnable-track]:border-0
    [&::-moz-range-track]:border-0

    [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none
    [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
    [&::-webkit-slider-thumb]:rounded-full
    [&::-webkit-slider-thumb]:bg-emerald-300
    dark:[&::-webkit-slider-thumb]:bg-emerald-300
    [&::-webkit-slider-thumb]:bg-slate-900
    [&::-webkit-slider-thumb]:border-0

    [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4
    [&::-moz-range-thumb]:rounded-full
    [&::-moz-range-thumb]:bg-emerald-300
    [&::-moz-range-thumb]:border-0
  `}
  style={{ ['--pos']: `${data.opacityImage * 100}%` ,['--fill']:textColor,}}
  /><span className="w-8 shrink-0 text-right text-xs tabular-nums text-zinc-600 dark:text-zinc-400 flex items-center">
  {Math.round(data.opacityImage * 100)}%
</span></div>

<div className="mt-4 flex items-center gap-3">
  <span className="w-13 shrink-0 text-sm text-zinc-900 dark:text-white/80 text-[12px]">
    เบลอภาพ
  </span>
 <input
    type="range"
    min={0}
    max={100}
    step={1}
    value={data.blur}
    onChange={(e) => handleOpacity("blur", Number(e.target.value))}
    className={`
    w-full cursor-pointer appearance-none h-2 rounded-full
    bg-zinc-200
    dark:bg-zinc-700


    theme-range-fill-track

    [&::-webkit-slider-runnable-track]:border-0
    [&::-moz-range-track]:border-0

    [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none
    [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
    [&::-webkit-slider-thumb]:rounded-full
    [&::-webkit-slider-thumb]:bg-emerald-300
    dark:[&::-webkit-slider-thumb]:bg-emerald-300
    [&::-webkit-slider-thumb]:bg-slate-900
    [&::-webkit-slider-thumb]:border-0

    [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4
    [&::-moz-range-thumb]:rounded-full
    [&::-moz-range-thumb]:bg-emerald-300
    [&::-moz-range-thumb]:border-0
  `}
  style={{ ['--pos']: `${data.blur}%` ,['--fill']:textColor,}}
  /><span className="w-8 shrink-0 text-right text-xs tabular-nums text-zinc-600 dark:text-zinc-400 flex items-center">
  {data.blur}%
</span></div>
 
</div>

                    
 
    ):(
      <button
        type="button"
        className="mb-[5px] mt-3 flex min-h-[150px] w-full min-w-0 cursor-pointer items-center justify-center rounded-md border-0 bg-gray-200 px-3 py-6 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 dark:bg-zinc-800 dark:focus-visible:outline-white/30"
        onClick={() => setBackgroundPickerOpen(true)}
      >
        <span className="text-[13px] font-medium text-gray-500 dark:text-gray-400">
          ไม่มีรูปภาพ
        </span>
      </button>
    )}

            {/* เพิ่มมิติพื้นหลัง — อยู่เหนือเส้นคั่นคอลัมน์ */}
            <MainLabel label="เพิ่มมิติพื้นหลัง" />

            {/* ไม่มีช่องว่างระหว่างคอลัมน์ */}
            <MainLabel label="ไม่มีช่องว่างระหว่างคอลัมน์" />

            {/* เส้นคั่นคอลัมน์ */}
            {!Boolean(data.noColumnGap) && <MainLabel label="เส้นคั่นคอลัมน์" />}

            {data.gridBorder && !Boolean(data.noColumnGap) ? (
              <Box sx={{ width: "100%", px: 0.25, pt: 0.75 }}>
                <Typography
                  component="div"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    minWidth: 0,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "rgb(51 65 85)",
                    mb: 0.75,
                    ".dark &": { color: "rgba(255,255,255,0.78)" },
                  }}
                >
                  <span className="shrink-0">รูปแบบเส้น</span>
                  <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
                </Typography>
                <ButtonGroup
                  fullWidth
                  variant="outlined"
                  disableElevation
                  color="inherit"
                  aria-label="รูปแบบเส้นคั่นคอลัมน์"
                  sx={{ ...sectionLayoutGroupRootSx, mb: 0 }}
                >
                  {COLUMN_DIVIDER_STYLES.map((opt) => {
                    const selected = columnDividerStyle === opt.value;
                    return (
                      <Button
                        key={opt.value}
                        color="inherit"
                        onClick={() => {
                          setUpdated(true);
                          setData((prev) => ({
                            ...prev,
                            columnDividerStyle: opt.value,
                          }));
                        }}
                        sx={{
                          ...sectionLayoutGroupButtonSx(selected, textColor),
                          minWidth: 0,
                          px: 0.35,
                          fontSize: 10,
                        }}
                      >
                        {opt.label}
                      </Button>
                    );
                  })}
                </ButtonGroup>
                <Box sx={{ width: "100%", mt: 1.5 }}>
                  <Typography
                    component="div"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      minWidth: 0,
                      fontSize: 13,
                      fontWeight: 600,
                      color: "rgb(51 65 85)",
                      mb: 0.35,
                      ".dark &": { color: "rgba(255,255,255,0.78)" },
                    }}
                  >
                    <span className="shrink-0">ความยาวเส้นคั่น (ตั้ง-นอน)</span>
                    <span className="text-slate-400 dark:text-slate-400 tabular-nums">
                      {Math.round(columnDividerVerticalLengthPct)}%
                    </span>
                    <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
                  </Typography>
                  <div className="w-full px-[2px] pb-[2px] pt-[2px]">
                    <Range
                      min={10}
                      max={100}
                      step={1}
                      value={columnDividerVerticalLengthPct}
                      handleChange={(e) => {
                        const v = Number(e.target.value);
                        setUpdated(true);
                        setData((prev) => ({
                          ...prev,
                          columnDividerVerticalLengthPercent: Math.min(
                            100,
                            Math.max(10, Number.isFinite(v) ? v : 100)
                          ),
                        }));
                      }}
                      pos={
                        ((columnDividerVerticalLengthPct - 10) / (100 - 10)) *
                        100
                      }
                      color={textColor || "#0d9488"}
                    />
                  </div>
                </Box>
                <Typography
                  component="div"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    minWidth: 0,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "rgb(51 65 85)",
                    mt: 1.5,
                    mb: 0.25,
                    ".dark &": { color: "rgba(255,255,255,0.78)" },
                  }}
                >
                  <span className="shrink-0">สีเส้นคั่น</span>
                  <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
                </Typography>
                <div className="mt-1 w-full rounded-md bg-white px-[0px] pb-[5px] pt-[2px] dark:bg-zinc-800">
                  <div className="px-[5px] pb-2">
                    <Range
                      min={0}
                      max={255}
                      value={Number(columnDividerOpacity) || 0}
                      step={1}
                      handleChange={(e) =>
                        handleOpacity(
                          "columnDividerOpacity",
                          Number(e.target.value)
                        )
                      }
                      pos={
                        ((Number(columnDividerOpacity) || 0) / 255) * 100
                      }
                      color={textColor || "#0d9488"}
                    />
                  </div>
                  <div className="grid grid-cols-10 place-items-center gap-x-0 gap-y-[6px] px-[5px] pb-0">
                    {allColors.map((color, i) => {
                      const bgColor =
                        typeof color === "string"
                          ? color
                          : theme?.[color.type]?.[color.index];
                      if (bgColor == null) return null;
                      const selected = chipSelected(
                        columnDividerColorVal,
                        color
                      );
                      let margin = "";
                      if (i % 8 !== 0 && (i + 1) % 8 !== 0) {
                        margin += "mx-[65.75px] ";
                      }
                      return (
                        <div className={margin} key={i}>
                          <button
                            type="button"
                            className="flex size-[25px] items-center justify-center rounded-full border border-slate-200 dark:border-white/15"
                            style={{ backgroundColor: bgColor }}
                            onClick={() => {
                              setUpdated(true);
                              setData((prev) => ({
                                ...prev,
                                columnDividerColor: color,
                              }));
                            }}
                            aria-label={`สีเส้นคั่น ${bgColor}`}
                          >
                            {selected ? (
                              <Check
                                className={swatchSelectedCheckClassName(
                                  bgColor
                                )}
                                strokeWidth={4}
                                aria-hidden
                              />
                            ) : null}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Box>
            ) : null}

          </li>
        </ul>
      </nav>
      <ImageModal
        openModal={backgroundPickerOpen}
        setOpenModal={setBackgroundPickerOpen}
        handleChange={(url) => {
          setUpdated(true);
          setData((prev) => ({ ...prev, backgroundImage: url }));
        }}
      />
    </aside>
  );


  function MainLabel({ label, metricValue, compact }) {
    const w =
      label === "Padding Top"
        ? "w-[85px]"
        : label === "Padding Bottom"
        ? "w-[64px]"
        : "flex-1";
    const colorSwitch = [
      "สีพื้นหลังแบบสีพื้น",
      "สีพื้นหลังแบบไล่โทน",
      "เส้นคั่นคอลัมน์",
      "ไม่มีช่องว่างระหว่างคอลัมน์",
      "เพิ่มมิติพื้นหลัง",
    ].includes(label);
    const typography = label === "สีพื้นหลังแบบสีพื้น" ? "สีไล่โทน" : label === "สีพื้นหลังแบบไล่โทน" ? "สีพื้น":""
    const showMetric =
      metricValue !== undefined &&
      metricValue !== null &&
      Number.isFinite(Number(metricValue));
    return (
      <div
        className={
          compact
            ? "mb-1 mt-0 flex items-center gap-2"
            : "mt-5 mb-2 flex items-center gap-2"
        }
      >
        <span className="text-dark dark:text-white/80 text-[13px] font-bold">
          {label}
        </span>
        {showMetric && (
          <span className="text-[13px] font-semibold tabular-nums text-slate-400 dark:text-slate-400">
            {Math.round(Number(metricValue))}
          </span>
        )}
        <div
          className={`border-b border-slate-200 dark:border-white/15 ${w}`}
        />
        {colorSwitch && (
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <AntSwitch  inputProps={{ 'aria-label': 'ant design' }} checked={label === "เส้นคั่นคอลัมน์" ? (Boolean(data.noColumnGap) ? false : data.gridBorder) : label === "ไม่มีช่องว่างระหว่างคอลัมน์" ? Boolean(data.noColumnGap) : label === "เพิ่มมิติพื้นหลัง" ? Boolean(data.parallaxEnabled) : data.isGradient} onChange={()=>{
              setData(prev=>{
                setUpdated(true)
                if(label === "เส้นคั่นคอลัมน์"){
                  if (Boolean(prev.noColumnGap)) return prev;
                  return {...prev,gridBorder:!prev.gridBorder}
                }else if(label === "ไม่มีช่องว่างระหว่างคอลัมน์"){
                  const nextNoGap = !Boolean(prev.noColumnGap);
                  return {...prev,noColumnGap:nextNoGap,gridBorder:nextNoGap ? false : prev.gridBorder}
                }else if(label === "เพิ่มมิติพื้นหลัง"){
                  return {...prev,parallaxEnabled:!Boolean(prev.parallaxEnabled)}
                }else{
                  return {...prev,isGradient:!prev.isGradient}
                }
              })
                
                
             }}/>
             <Typography sx={{ fontSize: 13 }}>{typography}</Typography>
          </Stack>
         
        )}
      </div>
    );
  }
};
export default ContainerOffcanvas;
