import { useEffect, useLayoutEffect, useMemo, useState,useRef } from "react";
import { getTheme } from "../../../Functions/theme";
import TextField from "@mui/material/TextField";
import {

  Button,
  ButtonGroup,

  FormControl,

  Box,

  Typography,





} from "@mui/material";
import lodash, { isNull } from "lodash";
import { Minus, Plus,Check,Palette,ImageOff,Trash2} from "lucide-react";
import Popper from "@mui/material/Popper";
import { styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import Stack from '@mui/material/Stack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { swatchSelectedCheckClassName } from "../Layouts/Elements/swatchCheckClass";
import { THEME_PANEL_BASIC_COLOR_SWATCHES } from "../themePanelBasicColors";
import { panelGroupButtonSx } from "../panelControlSx";
import {
  getBuilderPanelOpenStartedAt,
  markBuilderPanelMounted,
  usePanelSliderPreview,
} from "../panelPreviewStore";

const columnPanelPerfEnabled =
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).get("structurePerf") === "1";

const COLUMN_PADDING_MAX = 200;
const COLUMN_PADDING_X_MIN = 8;
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
const stepperBtnClass =
  "flex h-[34px] min-w-[2rem] shrink-0 items-center justify-center border-0 bg-white text-[12px] font-normal text-slate-700 transition hover:bg-slate-50 dark:bg-slate-900/80 dark:text-white/90 dark:hover:bg-white/10";
const stepperMidClass =
  "flex h-[34px] min-w-0 flex-1 items-center justify-center border-x border-slate-200 bg-white px-2 text-left text-[12px] font-normal tabular-nums text-slate-800 dark:border-white/10 dark:bg-slate-900/80 dark:text-white/90";

const AntSwitch = styled(Switch)(({ theme }) => ({
  width: 28,
  height: 16,
  padding: 0,
  display: "flex",
  "&:active": {
    "& .MuiSwitch-thumb": { width: 15 },
    "& .MuiSwitch-switchBase.Mui-checked": { transform: "translateX(9px)" },
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
    transition: theme.transitions.create(["width"], { duration: 200 }),
  },
  "& .MuiSwitch-track": {
    borderRadius: 8,
    opacity: 1,
    backgroundColor: "rgba(0,0,0,.25)",
    boxSizing: "border-box",
    ".dark &": { backgroundColor: "rgba(255,255,255,.25)" },
  },
}));

function NumericStepper({ value, min = 0, max = 200, onChange }) {
  const current = Number(value) || 0;
  return (
    <div className="flex w-full overflow-hidden rounded-md border border-slate-200 dark:border-white/10">
      <button
        type="button"
        className={stepperBtnClass}
        onClick={() => onChange(Math.max(min, current - 1))}
        aria-label="ลดค่า"
      >
        <Minus className="h-3.5 w-3.5" strokeWidth={2.2} />
      </button>
      <div className={stepperMidClass}>{current}</div>
      <button
        type="button"
        className={stepperBtnClass}
        onClick={() => onChange(Math.min(max, current + 1))}
        aria-label="เพิ่มค่า"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2.2} />
      </button>
    </div>
  );
}

const ColumnOffcanvas = ({
  element,
  updateColumn: onUpdate,
  close,
  textColor,
  theme: themeProp,
  panelLabel = "Column",
  elementDataKey = "colData",
  onUpdateWithData = null,
}) => {
    const initialRenderStartedAtRef = useRef(
      columnPanelPerfEnabled ? performance.now() : 0
    );
    const panelTargetId = element?.[elementDataKey]?.id;
    const panelOpenStartedAtRef = useRef(
      getBuilderPanelOpenStartedAt("Column", panelTargetId) ??
        window.__columnPanelOpenPerf?.startedAt ??
        null
    );
    const mountBreakdownLoggedRef = useRef(false);
    const [data,setData] = useState(element?.[elementDataKey] || {})
    const elementRef = useRef(element);
    elementRef.current = element;
    const lastCommittedDataRef = useRef(element?.[elementDataKey] || {});
    const [loadedTheme, setLoadedTheme] = useState(null);
    const theme = themeProp || loadedTheme;
    useState(false);
    const [, setOpenColorTable] = useState(false);
    const [, setOpenColorTable1] = useState(false);
    const [, setOpenColorTable2] = useState(false);
    useState(null);
    useState(null);
    useState(null);
    const [columnGradientPicker, setColumnGradientPicker] = useState("start");
    useRef(null);
    useRef(null);
    useRef(null);
    useLayoutEffect(() => {
      if (!mountBreakdownLoggedRef.current) {
        mountBreakdownLoggedRef.current = true;
        if (columnPanelPerfEnabled) {
          const now = performance.now();
          console.info("[Column Panel Mount Breakdown]", {
            target: String(panelTargetId || ""),
            openToPanelCommitMs: panelOpenStartedAtRef.current
              ? Math.round((now - panelOpenStartedAtRef.current) * 100) / 100
              : null,
            panelRenderToCommitMs:
              Math.round((now - initialRenderStartedAtRef.current) * 100) / 100,
          });
        }
      }
      markBuilderPanelMounted("Column", panelTargetId);
    }, [panelTargetId]);
    const normalizeForCommit = (value) => {
      const normalized = { ...value };
      for (const key in normalized) {
        if (normalized[key] === "") normalized[key] = 0;
      }
      return normalized;
    };
    const commitData = (latest) => {
      const normalized = normalizeForCommit(latest);
      const previous = lastCommittedDataRef.current || {};
      const changedFields = Object.keys(normalized).filter(
        (key) => !Object.is(previous?.[key], normalized?.[key])
      );
      lastCommittedDataRef.current = normalized;
      if (typeof onUpdateWithData === "function") {
        onUpdateWithData(normalized, element, onUpdate);
      } else {
        onUpdate(normalized, normalized.id, element?.conID, {
          panelChangedFields: changedFields,
        });
      }
    };
    const {
      updateSlider,
      commitSlider,
      sliderCommitProps,
    } = usePanelSliderPreview({
      type: "column",
      targetIds: [data?.id],
      data,
      setData,
      onCommit: commitData,
    });


      useEffect(() => {
        if (themeProp) return;
        getTheme("68d37327bedb0efab7dacafb")
          .then((res) => {
            setLoadedTheme(res.data);
    
          })
          .catch((err) => console.log(err));
      },[themeProp]);

      const handlePadding = (field, valueOrUpdater) => {
        const current = data[field];
        let next =
          typeof valueOrUpdater === "function"
            ? valueOrUpdater(current)
            : valueOrUpdater;
        if (next === "") return;
        next = Number(next);
        if (Number.isNaN(next) || next < 0) return;
        if (field === "paddingX") next = Math.max(COLUMN_PADDING_X_MIN, next);
        const nextData = { ...data, [field]: next };
        setData(nextData);
        commitData(nextData);
      };
      const handleSliderPadding = (field, value) => {
        const next =
          field === "paddingX"
            ? Math.max(COLUMN_PADDING_X_MIN, Number(value) || 0)
            : value;
        updateSlider((prev) => ({ ...prev, [field]: next }));
      };
      const handleColor = (field,value,index=null) => {
        const nextData = { ...data };
        if(!isNull(index)){
          const bgc = [...(data[field] || [])];
          bgc[index] = value;
          nextData[field] = bgc;
        }else{
          nextData[field] = value;
        }
        setData(nextData);
        commitData(nextData);
      };

      const handleOpacity = (field,value,index=null) => {
        if(!isNull(index)){
          updateSlider((prev)=>{
            const current = Array.isArray(prev[field]) ? prev[field] : [];
            const opct = [
              Number.isFinite(Number(current[0])) ? Number(current[0]) : 255,
              Number.isFinite(Number(current[1])) ? Number(current[1]) : 255,
            ];
            opct[index] = Number.isFinite(Number(value)) ? Number(value) : 0;
            return{...prev,[field]:opct}
          })
        }else{
          updateSlider((prev)=>{return{...prev,[field]:value}})
        }
      }
      const columnPaddingSliderMax = (v) =>
        Math.max(COLUMN_PADDING_MAX, Number(v) || 0);

      
      useEffect(() => {
        const nextData = elementRef.current?.[elementDataKey] || {};
        setData(nextData);
        lastCommittedDataRef.current = nextData;
      }, [elementDataKey, panelTargetId]);

    const paddings = [
        { label: "ระยะห่างแนวนอน", type: "paddingX", data: data.paddingX },
        {
          label: "ระยะห่างแนวตั้ง",
          type: "paddingY",
          data: data.paddingY,
        },
      ];


      const borders = [
        {
            label: "ความหนากรอบ",
            type: "borderWidth",
            data: data.borderWidth,
          },
        { label: "ความโค้งมน", type: "borderRadius", data: data.borderRadius },
      
      ];

  const allColors = useMemo(() => {
    if (!theme) return THEME_PANEL_BASIC_COLOR_SWATCHES;
    return [
      ...(theme.mainColor || []).map((_, index) => ({
        type: "mainColor",
        index,
      })),
      ...(theme.textColor || []).map((_, index) => ({
        type: "textColor",
        index,
      })),
      ...(theme.otherColor || []).map((_, index) => ({
        type: "otherColor",
        index,
      })),
      ...THEME_PANEL_BASIC_COLOR_SWATCHES,
    ];
  }, [theme]);
  const colorlabels = ["สีพื้นหลังแบบสีพื้น","สีพื้นหลังแบบไล่โทน"]
  const columnGradientGi = columnGradientPicker === "end" ? 1 : 0;
  const columnGradientDeg = Number(data.degrees);
    

    return (
      
        <aside
        className={`
       
       dash-panel flex h-full min-h-0 w-full flex-col overflow-hidden border-r border-slate-200 dark:border-white/10`}
      >
        <div className="shrink-0 flex items-center justify-between border-b border-slate-200 dash-panel-header bg-gray-100 px-6 pt-5 pb-3 dark:border-white/10 dark:bg-slate-800/70">
          <div className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 font-bold tracking-wide">
              {panelLabel}
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
            onClick={() => {
              commitSlider("close");
              close(null, null, null);
            }}
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
        <nav className="dash-panel flex-1 min-h-0 px-4 pb-6 overflow-y-auto w-full bg-slate-50 dark:bg-slate-900/40">
          <ul className="mt-1 pl-1">
            <li>
     
                  

              
             {/* Padding */}
             <div className="grid grid-cols-2 gap-x-3">
              {paddings.map((item, i) => {
                const min = item.type === "paddingX" ? COLUMN_PADDING_X_MIN : 0;
                const raw = Number(item.data);
                const value = Number.isFinite(raw)
                  ? Math.max(min, raw)
                  : min;
                const max = columnPaddingSliderMax(value);
                const pos =
                  max > min ? ((value - min) / (max - min)) * 100 : 0;
                return (
                <div className="col col-span-1 ml-[5px] mr-[5px]" key={i}>
                  <MainLabel label={item.label} value={value} />
                  <div className="min-w-0 px-[2px] pb-[2px] pt-[2px]">
                    <input
                      type="range"
                      min={min}
                      max={max}
                      step={1}
                      value={value}
                      onChange={(e) => handleSliderPadding(item.type, Number(e.target.value) || min)}
                      {...sliderCommitProps}
                      className={THEME_RANGE_SLIDER_CLASS}
                      style={{
                        ["--pos"]: `${pos}%`,
                        ["--fill"]: textColor,
                      }}
                    />
                  </div>
                </div>
                );
              })}
            </div>
              <div className="flex flex-col">
              {/* Border Color */}
              {Number(data.borderWidth) > 0 && (
              <div className="order-2">
                <MainLabel label="สีกรอบ" />
                <Box sx={{ width: "100%", px: 0.25, pt: 0 }}>
                  <div className="mt-2 dash-card w-full rounded-md bg-white px-[0px] pb-[5px] dark:bg-zinc-800">
                    <div className="px-[5px] pb-2">
                      <input
                        type="range"
                        min={0}
                        max={255}
                        value={Number(data.borderOpacity) || 0}
                        step={1}
                        onChange={(e) => handleOpacity("borderOpacity", Number(e.target.value))}
                        {...sliderCommitProps}
                        className={THEME_RANGE_SLIDER_CLASS}
                        style={{
                          ["--pos"]: `${((Number(data.borderOpacity) || 0) / 255) * 100}%`,
                          ["--fill"]: textColor,
                        }}
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
                        if (i % 8 !== 0 && (i + 1) % 8 !== 0) margin += "mx-[65.75px] ";
                        const selected =
                          lodash.isEqual(data.borderColor, value) ||
                          data.borderColor === value;
                        return (
                          <div className={margin} key={i}>
                            <button
                              type="button"
                              className="flex size-[25px] items-center justify-center rounded-full border border-slate-200 dark:border-white/15"
                              style={{ backgroundColor: bgColor }}
                              onClick={() => handleColor("borderColor", value)}
                              aria-label={`เลือกสีกรอบ ${bgColor}`}
                            >
                              {selected ? (
                                <Check
                                  className={swatchSelectedCheckClassName(bgColor)}
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
              </div>
              )}

            {/* Border*/}
            <div className="order-1">
            <div className="grid grid-cols-2">
              {borders.map((item, i) => (
                <div className="col col-span-1 ml-[5px] mr-[5px]" key={i}>
                  <MainLabel label={item.label} />
                  <NumericStepper
                    value={item.data}
                    min={0}
                    max={200}
                    onChange={(v) => handlePadding(item.type, v)}
                  />
                </div>
              ))}
            </div>
            </div>
            </div>


            {/* BG color */}
            <MainLabel label={data.isGradient ? colorlabels[1] : colorlabels[0]} />

            {!data.isGradient ? (
              <Box sx={{ width: "100%", px: 0.25, pt: 0 }}>
                <div className="mt-2 dash-card w-full rounded-md bg-white px-[0px] pb-[5px] pt-[2px] dark:bg-zinc-800">
                  <div className="px-[5px] pb-2">
                    <input
                      type="range"
                      min={0}
                      max={255}
                      value={Number(data.opacityColor) || 0}
                      step={1}
                      onChange={(e) => handleOpacity("opacityColor", Number(e.target.value))}
                      {...sliderCommitProps}
                      className={THEME_RANGE_SLIDER_CLASS}
                      style={{
                        ["--pos"]: `${((Number(data.opacityColor) || 0) / 255) * 100}%`,
                        ["--fill"]: textColor,
                      }}
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
                      if (i % 8 !== 0 && (i + 1) % 8 !== 0) margin += "mx-[65.75px] ";
                      const selected =
                        lodash.isEqual(data.backgroundColor, value) ||
                        data.backgroundColor === value;
                      return (
                        <div className={margin} key={i}>
                          <button
                            type="button"
                            className="flex size-[25px] items-center justify-center rounded-full border border-slate-200 dark:border-white/15"
                            style={{ backgroundColor: bgColor }}
                            onClick={() => handleColor("backgroundColor", value)}
                            aria-label={`เลือกสีพื้นหลัง ${bgColor}`}
                          >
                            {selected ? (
                              <Check className={swatchSelectedCheckClassName(bgColor)} strokeWidth={4} aria-hidden />
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
                  sx={{ mb: 0, mt: 0.5 }}
                >
                  {[
                    { value: "start", label: "จุดเริ่ม" },
                    { value: "end", label: "จุดสิ้น" },
                  ].map((opt) => {
                    const selected = opt.value === columnGradientPicker;
                    return (
                      <Button
                        key={opt.value}
                        color="inherit"
                        onClick={() => setColumnGradientPicker(opt.value)}
                        sx={panelGroupButtonSx(selected)}
                      >
                        {opt.label}
                      </Button>
                    );
                  })}
                </ButtonGroup>

                <Box sx={{ width: "100%", px: 0.25, pt: 0.75 }}>
                  <div className="mt-2 dash-card w-full rounded-md bg-white px-[0px] pb-[5px] pt-[2px] dark:bg-zinc-800">
                    <div className="px-[5px] pb-2">
                      <input
                        type="range"
                        min={0}
                        max={255}
                        value={Number(data.opacityColorGradient?.[columnGradientGi]) || 0}
                        step={1}
                        onChange={(e) =>
                          handleOpacity("opacityColorGradient", Number(e.target.value), columnGradientGi)
                        }
                        {...sliderCommitProps}
                        className={THEME_RANGE_SLIDER_CLASS}
                        style={{
                          ["--pos"]: `${((Number(data.opacityColorGradient?.[columnGradientGi]) || 0) / 255) * 100}%`,
                          ["--fill"]: textColor,
                        }}
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
                        if (i % 8 !== 0 && (i + 1) % 8 !== 0) margin += "mx-[65.75px] ";
                        const activeStop =
                          data.backgroundColorGradient?.[columnGradientGi];
                        const selected =
                          lodash.isEqual(activeStop, value) ||
                          activeStop === value;
                        return (
                          <div className={margin} key={i}>
                            <button
                              type="button"
                              className="flex size-[25px] items-center justify-center rounded-full border border-slate-200 dark:border-white/15"
                              style={{ backgroundColor: bgColor }}
                              onClick={() => handleColor("backgroundColorGradient", value, columnGradientGi)}
                              aria-label={`เลือกสีไล่โทน ${bgColor}`}
                            >
                              {selected ? (
                                <Check className={swatchSelectedCheckClassName(bgColor)} strokeWidth={4} aria-hidden />
                              ) : null}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Box>

                <MainLabel label="องศาไล่โทน" value={Math.round(Number.isFinite(columnGradientDeg) ? columnGradientDeg : 0)} />
                <input
                  type="range"
                  min={0}
                  max={360}
                  value={Number.isFinite(columnGradientDeg) ? columnGradientDeg : 0}
                  step={1}
                  onChange={(e) => {
                    updateSlider((prev) => ({ ...prev, degrees: Number(e.target.value) || 0 }));
                  }}
                  {...sliderCommitProps}
                  className={THEME_RANGE_SLIDER_CLASS}
                  style={{
                    ["--pos"]: `${((Number.isFinite(columnGradientDeg) ? columnGradientDeg : 0) / 360) * 100}%`,
                    ["--fill"]: textColor,
                  }}
                />
              </>
            )}
  


            {/* กรอบเบลอ */}
            <div className="flex items-center gap-2 mt-5 mb-[3px]">
              <span className="dash-panel-label text-[13px] font-bold">กรอบเบลอ</span>
              {data.colGlassEnabled === true && (
                <span className="text-[13px] tabular-nums text-slate-400">
                  {Math.round(Number.isFinite(Number(data.colGlassLevel)) ? Number(data.colGlassLevel) : 50)}
                </span>
              )}
              <div className="flex-1 dash-heading-rule border-b" />
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <AntSwitch
                  checked={data.colGlassEnabled === true}
                  onChange={() => {
                    const nextData = {
                      ...data,
                      colGlassEnabled: !data.colGlassEnabled,
                    };
                    setData(nextData);
                    commitData(nextData);
                  }}
                  inputProps={{ "aria-label": "เปิดกรอบเบลอ" }}
                />
              </Stack>
            </div>
            {data.colGlassEnabled === true && (
              <Box sx={{ width: "100%", px: 0.25, pt: 0 }}>
                <div className="mt-0 dash-card w-full rounded-md bg-white px-[5px] pb-[8px] pt-[4px] dark:bg-zinc-800">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={Math.round(Number.isFinite(Number(data.colGlassLevel)) ? Number(data.colGlassLevel) : 50)}
                    className={THEME_RANGE_SLIDER_CLASS}
                    style={{
                      ["--pos"]: `${Math.round(Number.isFinite(Number(data.colGlassLevel)) ? Number(data.colGlassLevel) : 50)}%`,
                      ["--fill"]: textColor,
                    }}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      updateSlider((prev) => ({ ...prev, colGlassLevel: v }));
                    }}
                    {...sliderCommitProps}
                  />
                </div>
              </Box>
            )}

            </li>
          </ul>
        </nav>
      </aside>
    )

    function MainLabel({ label, value }) {
        const w =
          label === "Padding Top"
            ? "w-[85px]"
            : label === "Padding Bottom"
            ? "w-[64px]"
            : "flex-1";
        const isBgColorLabel = ["สีพื้นหลังแบบสีพื้น","สีพื้นหลังแบบไล่โทน"].includes(label)
        const colorSwitch = isBgColorLabel
        // หัวข้อสีพื้นหลัง: แสดง "สีพื้นหลัง" / "สีไล่โทน" คงที่ — ไม่ดึงชื่อหรือค่าสีตามโหมด
        const displayLabel = isBgColorLabel ? "สีพื้นหลัง" : label
        const typography = isBgColorLabel ? "สีไล่โทน" : ""
        const checked = data.isGradient
        return (
          <div className={`flex items-center gap-2 mt-5 ${label === "องศาไล่โทน" ? "mb-[3px]" : "mb-2"}`}>
            <span className="dash-panel-label text-[13px] font-bold">
              {displayLabel}
            </span>
            {value !== undefined && (
              <span className="text-[13px] tabular-nums text-slate-400">{value}</span>
            )}
            <div className={`dash-heading-rule border-b ${w}`}></div>
            {colorSwitch && (
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                 <AntSwitch  inputProps={{ 'aria-label': 'ant design' }} checked={checked} onChange={()=>{
                    const nextData = { ...data, isGradient: !data.isGradient };
                    setData(nextData);
                    setOpenColorTable(false)
                    setOpenColorTable1(false)
                    setOpenColorTable2(false)
                    commitData(nextData);
                 }}   />
                 {typography ? (
                   <Typography
                     className="text-slate-400 dark:text-slate-400"
                     sx={{ fontSize: 13 }}
                   >
                     {typography}
                   </Typography>
                 ) : null}
              </Stack>
             
            )}
          </div>
        );
      }



}


export default ColumnOffcanvas
