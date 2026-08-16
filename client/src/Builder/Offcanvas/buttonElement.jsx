import { PANEL_BTN_GROUP, panelGroupButtonSx } from "../panelControlSx";
import {
  useCallback,
  useEffect,
  Fragment,
  useMemo,
  useRef,
  useState,
} from "react";
import { Box, Button, ButtonGroup, Typography } from "@mui/material";
import Switch from "@mui/material/Switch";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Link2,
} from "lucide-react";
import lodash from "lodash";
import ServiceIcon from "../ServiceIcon";
import IconAwsome from "../IconAwsome";
import {
  BUTTON_STYLE_DEFAULTS,
  BUTTON_VARIANT_OPTIONS,
  getButtonMuiVariant,
  normalizeButtonLayoutAlign,
} from "../Layouts/Elements/buttonElementConfig";
import { swatchSelectedCheckClassName } from "../Layouts/Elements/swatchCheckClass";
import { THEME_PANEL_BASIC_COLOR_SWATCHES } from "../themePanelBasicColors";
import  NormalBtn from "../HTML/NormalBtn"
import  MainLabel from "../HTML/MainLabel"
import  Range from "../HTML/Range"
import  SelectLine from "../HTML/SelectLine"
import  MuiBtn from "../HTML/MuiBtn"
import  Field from "../HTML/Field"
import  ServiceColor from "../Services/ServiceColor"

/** โหมดแก้สีปุ่ม — เลื่อนซ้าย/ขวาเหมือน badge รูปภาพ (โหมด border เติมเมื่อรูปแบบ = ขอบ) */
const BUTTON_COLOR_MODES_BASE = [
  { value: "fill", label: "สีพื้นหลัง" },
  { value: "text", label: "สีข้อความ" },
];
const BUTTON_COLOR_MODE_BORDER = { value: "border", label: "ขอบ" };

const LINK_TARGET_OPTIONS = [
  { value: "_self", label: "ลิงค์หน้าเดิม" },
  { value: "_blank", label: "เปิดหน้าใหม่" },
];

/** เท่ากับ Tailwind rounded-md บนปุ่ม «รูปแบบปุ่ม» */
const OPTION_CHIP_RADIUS = "0.375rem";

/** ปุ่มเลือกรูปแบบปุ่ม — สีตาม Dashboard Panel Btn Group */
const optionChipClass =
  "inline-flex min-h-[32px] w-full items-center justify-center rounded-md border px-1 py-1 text-[11px] font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/60 dark:focus-visible:ring-white/30";

const optionChipStyle = (selected) =>
  selected
    ? {
        backgroundColor: PANEL_BTN_GROUP.active,
        color: PANEL_BTN_GROUP.activeText,
        borderColor: PANEL_BTN_GROUP.border,
        boxShadow: "0 1px 2px rgb(0 0 0 / 0.12)",
      }
    : {
        backgroundColor: PANEL_BTN_GROUP.inactive,
        color: PANEL_BTN_GROUP.inactiveText,
        borderColor: PANEL_BTN_GROUP.border,
      };

/** สไตล์ปุ่มใน ButtonGroup — กรอบเหมือนรูปแบบปุ่ม; ตอนเลือกยังใช้สี accent */
const groupButtonSx = panelGroupButtonSx;

/** กรอบรวม ButtonGroup — เส้นขอบเดียวกับรูปแบบปุ่ม (ไม่ใช้ primary น้ำเงิน); มุมโค้งเท่า rounded-md ของรูปแบบปุ่ม */
const groupRootSx = {
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

const THEME_RANGE_INPUT_CLASS = `
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


                  const BtnForm = ({
                    title,
                    iconAriaLabel,
                    linkGroupAriaLabel,
                    colorGroupAriaLabel,
                    opacityAriaLabel,
                  
                    labelValue,
                    labelField,
                  
                    linkEnabled,
                    linkEnabledField,
                  
                    linkUrl,
                    linkUrlField,
                  
                    linkTarget,
                    linkTargetField,
                  
                    linkIconForModal,
                    iconSlot,
                    setLinkIconModalSlot,
                  
                    patch,
                    textColor,
                  
                    buttonColorMode,
                    buttonColorModeLabel,
                    cycleColorMode,
                  
                    opacitySliderValue,
                    opacityFieldText,
                    opacityFieldFill,
                  
                    activeButtonColor,
                    fillColorField,
                    textColorField,
                    /** เมื่อรูปแบบปุ่ม = ขอบ — โหมดสีกรอบ */
                    opacityFieldBorder,
                    borderColorField,
                  
                    allColors,
                    chipSelected,
                    groupRootSx,
                    groupButtonSx,
                    theme,
                    rangeClass,
                    linkTargetOptions,
                    swatchSelectedCheckClassName,
                  }) => {
                    return (
                      <li>
                        <div className="mb-3 flex items-center gap-2">
                        <MainLabel label={title} mb={0} color={textColor}/>
                        </div>
                  
                        <div className="flex dash-input h-10 w-full overflow-hidden rounded-md border border-slate-200 bg-white dark:border-white/10 dark:bg-[#27272a]">
                          <button
                            type="button"
                            className="flex shrink-0 items-center justify-center border-r border-slate-200 bg-transparent px-2.5 py-2 text-slate-600 transition hover:opacity-80 dark:border-white/10 dark:text-slate-300"
                            aria-label={iconAriaLabel}
                            onClick={() => setLinkIconModalSlot(iconSlot)}
                          >
                            {linkIconForModal?.name && linkIconForModal?.type ? (
                              <IconAwsome
                                iconName={linkIconForModal.name}
                                iconType={linkIconForModal.type}
                                style={{ fontSize: 16 }}
                              />
                            ) : (
                              <Link2 className="size-4 shrink-0" strokeWidth={2} />
                            )}
                          </button>
                  
                          <input
                            type="text"
                            className="min-w-0 flex-1 border-0 bg-transparent px-2.5 py-2 text-[13px] leading-snug text-slate-800 outline-none ring-0 placeholder:text-slate-400 focus:ring-0 dark:text-white/90 dark:placeholder:text-slate-500"
                            placeholder="เช่น สมัครเลย, ดูเพิ่มเติม"
                            value={labelValue}
                            onChange={(e) => patch({ [labelField]: e.target.value })}
                            autoComplete="off"
                          />
                        </div>
                  
                        <Box sx={{ width: "100%", px: 0.25, mt: 2 }}>
                          <div className="mb-2 flex items-center gap-2">
                            <MainLabel label="ลิงค์ URL" mb={0} checked={linkEnabled} handleSwitch={(e) => patch({ [linkEnabledField]: e.target.checked })} color={textColor}/>
                          
                          </div>
                  
                          {linkEnabled && (
                            <div className="space-y-1">
                              <Field handleChange={(e) => patch({ [linkUrlField]: e.target.value })} value={linkUrl} type="url" placeholder="h t t p s : / / w w w . l i n k . c o m" className="dash-input h-10 w-full rounded-md border border-slate-200 bg-white px-2.5 py-2 text-[13px] leading-snug text-slate-800 outline-none transition placeholder:text-slate-400 dark:border-white/10 dark:bg-[#27272a] dark:text-white/90 dark:placeholder:text-slate-500" />
                              <ButtonGroup
                                fullWidth
                                variant="outlined"
                                disableElevation
                                color="inherit"
                                aria-label={linkGroupAriaLabel}
                                sx={groupRootSx}
                              >
                                 { linkTargetOptions.map(item=>{
                const {value,label} = item
                const checked = linkTarget === value
                const sx =groupButtonSx(checked, textColor)
                const handleClick = () =>
                patch({
                  [linkTargetField]:
                    value === "_blank" ? "_blank" : "_self",
                })

                return(
                  <MuiBtn label={label} icon={checked?{
                    Icon:Check,
                    className:"size-3.5 shrink-0",
                    strokeWidth:3
                  }:null} sx={sx} handleClick={handleClick}/>
                )
              })}
                             
                              </ButtonGroup>
                            </div>
                          )}
                        </Box>
                  
                        <div className="mt-5">
                          <div className="mb-3 flex items-center gap-2">
                          <MainLabel label={colorGroupAriaLabel} mb={0} color={textColor}/>
                          </div>
                          <SelectLine prev={() => cycleColorMode(-1)} next={() => cycleColorMode(1)} value={buttonColorModeLabel}/>
                       
                  
                          <div className="mt-2 dash-card w-full rounded-md bg-white px-[0px] pb-[5px] pt-[2px] dark:bg-zinc-800">
                            <div className="px-[5px] pb-2">
                              <input
                                type="range"
                                min={0}
                                max={255}
                                step={1}
                                value={opacitySliderValue}
                                onChange={(e) => {
                                  const v = Number(e.target.value);
                                  patch(
                                    buttonColorMode === "text"
                                      ? { [opacityFieldText]: v }
                                      : buttonColorMode === "border" &&
                                          opacityFieldBorder
                                        ? { [opacityFieldBorder]: v }
                                        : { [opacityFieldFill]: v }
                                  );
                                }}
                                className={rangeClass}
                                style={{
                                  ["--pos"]: `${(opacitySliderValue / 255) * 100}%`,
                                  ["--fill"]: textColor || "#0d9488",
                                }}
                                aria-label={opacityAriaLabel}
                              />
                            </div>
                  
                            <div className="grid grid-cols-10 place-items-center gap-x-0 gap-y-[6px]">
                              {allColors.map((color, i) => {
                                const bgColor =
                                  typeof color === "string"
                                    ? color
                                    : theme?.[color.type]?.[color.index];
                  
                                if (bgColor == null) return null;
                  
                                const value = color;
                                const selected =
                                  chipSelected(activeButtonColor, value) ||
                                  activeButtonColor === value;
                  
                                let margin = "";
                                if (i % 8 !== 0 && (i + 1) % 8 !== 0) {
                                  margin += "mx-[65.75px] ";
                                }
                  
                                return (
                                  <div className={margin} key={`${iconSlot}-${i}`}>
                                    <button
                                      type="button"
                                      className="flex size-[25px] items-center justify-center rounded-full border"
                                      style={{ backgroundColor: bgColor }}
                                      onClick={() =>
                                        patch(
                                          buttonColorMode === "text"
                                            ? { [textColorField]: value }
                                            : buttonColorMode === "border" &&
                                                borderColorField
                                              ? { [borderColorField]: value }
                                              : { [fillColorField]: value }
                                        )
                                      }
                                      aria-label={`เลือกสี ${bgColor}`}
                                    >
                                      {selected && (
                                        <Check
                                          className={swatchSelectedCheckClassName(bgColor)}
                                          strokeWidth={4}
                                        />
                                      )}
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  };

const ButtonElementOffcanvas = ({
  element,
  onUpdate,
  close,
  textColor,
  theme,
  darkMode = "light",
}) => {
  const layoutSyncRafRef = useRef(0);
  const pendingLayoutRef = useRef(null);
  const elementRef = useRef(element);
  elementRef.current = element;

  const scheduleLayoutSync = useCallback(
    (next) => {
      const base = elementRef.current || {};
      const merged = {
        ...base,
        ...next,
        type: next?.type ?? base?.type ?? "btn",
        id: next?.id != null ? next.id : base?.id,
      };
      pendingLayoutRef.current = lodash.cloneDeep(merged);
      if (layoutSyncRafRef.current) {
        cancelAnimationFrame(layoutSyncRafRef.current);
      }
      layoutSyncRafRef.current = requestAnimationFrame(() => {
        layoutSyncRafRef.current = 0;
        const snapshot = pendingLayoutRef.current;
        pendingLayoutRef.current = null;
        if (snapshot) onUpdate?.(snapshot);
      });
    },
    [onUpdate]
  );

  const [data, setData] = useState(element);
  /** null | 1 | 2 — ปุ่มเดี่ยวใช้ช่อง 1 เท่านั้น */
  const [linkIconModalSlot, setLinkIconModalSlot] = useState(null);
  const [buttonColorMode, setButtonColorMode] = useState(
    BUTTON_COLOR_MODES_BASE[0].value
  );
  const [buttonColorMode1, setButtonColorMode1] = useState(
    BUTTON_COLOR_MODES_BASE[0].value
  );
  const [buttonColorMode2, setButtonColorMode2] = useState(
    BUTTON_COLOR_MODES_BASE[0].value
  );

  useEffect(() => {
    if (!element?.id) return;
    setData((prev) => {
      if (!prev || prev.id !== element.id) return element;
      return prev;
    });
  }, [element]);

  useEffect(() => {
    setButtonColorMode(BUTTON_COLOR_MODES_BASE[0].value);
    setButtonColorMode1(BUTTON_COLOR_MODES_BASE[0].value);
    setButtonColorMode2(BUTTON_COLOR_MODES_BASE[0].value);
    setLinkIconModalSlot(null);
  }, [element?.id]);

  const patch = (partial) => {
    setData((prev) => {
      const next = { ...prev, ...partial };
      scheduleLayoutSync(next);
      return next;
    });
  };

  const allColors = useMemo(() => {
    if (!theme?.mainColor?.length) return [];
    const mc = theme.mainColor.map((_, i) => ({ type: "mainColor", index: i }));
    const tc = (theme.textColor || []).map((_, i) => ({
      type: "textColor",
      index: i,
    }));
    const oc = (theme.otherColor || []).map((_, i) => ({
      type: "otherColor",
      index: i,
    }));
    const basic = THEME_PANEL_BASIC_COLOR_SWATCHES;
    return [...mc, ...tc, ...oc, ...basic];
  }, [theme]);

  const isDual = data?.type === "btnG";
  const isImageHoverButtonEdit = Boolean(element?.__imageHoverButtonEdit);
  const isButtonMultiButtonEdit = Boolean(element?.__buttonMultiButtonEdit);

  const linkEnabled = Boolean(data?.linkEnabled);
  const linkUrl = typeof data?.linkUrl === "string" ? data.linkUrl : "";
  const linkTarget = data?.linkTarget === "_blank" ? "_blank" : "_self";

  const linkEnabled2 = Boolean(data?.linkEnabled2);
  const linkUrl2 = typeof data?.linkUrl2 === "string" ? data.linkUrl2 : "";
  const linkTarget2 = data?.linkTarget2 === "_blank" ? "_blank" : "_self";

  const linkIconForModal = useMemo(() => {
    const raw = data?.linkIcon;
    if (!raw || typeof raw !== "object") return { name: null, type: null };
    const n = raw.name;
    const t = raw.type;
    if (n == null || t == null || n === "" || t === "")
      return { name: null, type: null };
    return { name: n, type: t };
  }, [data?.linkIcon]);

  const linkIconForModal2 = useMemo(() => {
    const raw = data?.linkIcon2;
    if (!raw || typeof raw !== "object") return { name: null, type: null };
    const n = raw.name;
    const t = raw.type;
    if (n == null || t == null || n === "" || t === "")
      return { name: null, type: null };
    return { name: n, type: t };
  }, [data?.linkIcon2]);

  const muiVariant = getButtonMuiVariant(data);

  const buttonLayoutAlign = normalizeButtonLayoutAlign(
    data?.buttonLayoutAlign ?? BUTTON_STYLE_DEFAULTS.buttonLayoutAlign
  );

  const buttonColorModesEffective = useMemo(() => {
    if (muiVariant === "outlined") {
      return [...BUTTON_COLOR_MODES_BASE, BUTTON_COLOR_MODE_BORDER];
    }
    return BUTTON_COLOR_MODES_BASE;
  }, [muiVariant]);

  useEffect(() => {
    if (muiVariant !== "outlined" && buttonColorMode === "border") {
      setButtonColorMode(BUTTON_COLOR_MODES_BASE[0].value);
    }
  }, [muiVariant, buttonColorMode]);

  const fontSize = Number(data?.buttonFontSize);
  const fontSizeVal = Number.isFinite(fontSize)
    ? fontSize
    : BUTTON_STYLE_DEFAULTS.buttonFontSize;
  const radius = Number(data?.buttonRadius);
  const radiusVal = Number.isFinite(radius)
    ? radius
    : BUTTON_STYLE_DEFAULTS.buttonRadius;
  const padX = Number(data?.buttonPaddingX);
  const padXVal = Number.isFinite(padX)
    ? padX
    : BUTTON_STYLE_DEFAULTS.buttonPaddingX;
  const padY = Number(data?.buttonPaddingY);
  const padYVal = Number.isFinite(padY)
    ? padY
    : BUTTON_STYLE_DEFAULTS.buttonPaddingY;
  const marginTopRaw = Number(data?.buttonMarginTop);
  const buttonMarginTop = Number.isFinite(marginTopRaw)
    ? Math.max(0, Math.min(80, marginTopRaw))
    : BUTTON_STYLE_DEFAULTS.buttonMarginTop;
  const marginBottomRaw = Number(data?.buttonMarginBottom);
  const buttonMarginBottom = Number.isFinite(marginBottomRaw)
    ? Math.max(0, Math.min(80, marginBottomRaw))
    : BUTTON_STYLE_DEFAULTS.buttonMarginBottom;

  const borderW = Number(data?.buttonBorderWidth);
  const borderWVal = Number.isFinite(borderW)
    ? borderW
    : BUTTON_STYLE_DEFAULTS.buttonBorderWidth;
  const fillOp = Number(data?.buttonFillOpacity);
  const fillOpVal = Number.isFinite(fillOp)
    ? Math.max(0, Math.min(255, fillOp))
    : BUTTON_STYLE_DEFAULTS.buttonFillOpacity;
  const labelOp = Number(data?.buttonLabelOpacity);
  const labelOpVal = Number.isFinite(labelOp)
    ? Math.max(0, Math.min(255, labelOp))
    : BUTTON_STYLE_DEFAULTS.buttonLabelOpacity;
  const borderOp = Number(data?.buttonBorderOpacity);
  const borderOpVal = Number.isFinite(borderOp)
    ? Math.max(0, Math.min(255, borderOp))
    : BUTTON_STYLE_DEFAULTS.buttonBorderOpacity;
  const fill2Op = Number(data?.button2FillOpacity);
  const fill2OpVal = Number.isFinite(fill2Op)
    ? Math.max(0, Math.min(255, fill2Op))
    : BUTTON_STYLE_DEFAULTS.button2FillOpacity;
  const label2Op = Number(data?.button2LabelOpacity);
  const label2OpVal = Number.isFinite(label2Op)
    ? Math.max(0, Math.min(255, label2Op))
    : BUTTON_STYLE_DEFAULTS.button2LabelOpacity;

  const buttonColorModeLabel =
    buttonColorModesEffective.find((o) => o.value === buttonColorMode)?.label ??
    "";

  const cycleButtonColorMode = (delta) => {
    const list = buttonColorModesEffective;
    const idx = list.findIndex((o) => o.value === buttonColorMode);
    const base = idx === -1 ? 0 : idx;
    const next = (base + delta + list.length) % list.length;
    setButtonColorMode(list[next].value);
  };

  const activeButtonColor =
    buttonColorMode === "text"
      ? data?.buttonLabelColor ?? BUTTON_STYLE_DEFAULTS.buttonLabelColor
      : buttonColorMode === "border"
        ? data?.buttonBorderColor ?? BUTTON_STYLE_DEFAULTS.buttonBorderColor
        : data?.buttonFill ?? BUTTON_STYLE_DEFAULTS.buttonFill;

  const opacitySliderValue =
    buttonColorMode === "text"
      ? labelOpVal
      : buttonColorMode === "border"
        ? borderOpVal
        : fillOpVal;

  const dualModesList = BUTTON_COLOR_MODES_BASE;
  const buttonColorModeLabel1 =
    dualModesList.find((o) => o.value === buttonColorMode1)?.label ?? "";
  const buttonColorModeLabel2 =
    dualModesList.find((o) => o.value === buttonColorMode2)?.label ?? "";

  const cycleDualColorMode = (slot, delta) => {
    const list = dualModesList;
    const cur = slot === 1 ? buttonColorMode1 : buttonColorMode2;
    const setFn = slot === 1 ? setButtonColorMode1 : setButtonColorMode2;
    const idx = list.findIndex((o) => o.value === cur);
    const base = idx === -1 ? 0 : idx;
    const next = (base + delta + list.length) % list.length;
    setFn(list[next].value);
  };

  const activeButtonColor1 =
    buttonColorMode1 === "text"
      ? data?.buttonLabelColor ?? BUTTON_STYLE_DEFAULTS.buttonLabelColor
      : data?.buttonFill ?? BUTTON_STYLE_DEFAULTS.buttonFill;
  const activeButtonColor2 =
    buttonColorMode2 === "text"
      ? data?.button2LabelColor ?? BUTTON_STYLE_DEFAULTS.button2LabelColor
      : data?.button2Fill ?? BUTTON_STYLE_DEFAULTS.button2Fill;
  const activeBorderColorSwatch =
    data?.buttonBorderColor ?? BUTTON_STYLE_DEFAULTS.buttonBorderColor;

  const opacitySliderDual1 =
    buttonColorMode1 === "text" ? labelOpVal : fillOpVal;
  const opacitySliderDual2 =
    buttonColorMode2 === "text" ? label2OpVal : fill2OpVal;

  const chipSelected = (active, chip) => {
    if (typeof active === "string" && typeof chip === "string") {
      return active.toLowerCase() === chip.toLowerCase();
    }
    if (
      active &&
      typeof active === "object" &&
      chip &&
      typeof chip === "object"
    ) {
      return lodash.isEqual(active, chip);
    }
    return false;
  };


  const btnSizeDatas = [
    {
      label: "ขนาดตัวอักษร",
      value: fontSizeVal,
      min: 11,
      max: 22,
      field: "buttonFontSize",
    },
    {
      label: "มุมโค้ง",
      value: radiusVal,
      min: 0,
      max: 40,
      field: "buttonRadius",
    },
    {
      label: "ระยะซ้าย-ขวา",
      value: padXVal,
      min: 8,
      max: 48,
      field: "buttonPaddingX",
    },
    {
      label: "ระยะบน-ล่าง",
      value: padYVal,
      min: 4,
      max: 24,
      field: "buttonPaddingY",
    },
  ];


  const btnShapeDatas = [
    { field: "buttonBold", label: "ตัวหนา" },
    { field: "buttonFullWidth", label: "กว้างเต็มคอลัมน์" },
  ];

  const dualBtnForms = [
    {
      title: "ปุ่มที่ 1 - ซ้าย",
      iconAriaLabel: "เลือกไอคอนปุ่มที่ 1",
      linkGroupAriaLabel: "เปิดหรือปิดลิงก์ URL ปุ่มที่ 1",
      colorGroupAriaLabel: "สีปุ่มที่ 1 - พื้นหลัง - ข้อความ",
      opacityAriaLabel: "ความโปร่งแสงสีปุ่มที่ 1",
      labelValue: data?.label ?? "",
      labelField: "label",
      linkEnabled,
      linkEnabledField: "linkEnabled",
      linkUrl,
      linkUrlField: "linkUrl",
      linkTarget,
      linkTargetField: "linkTarget",
      linkIconForModal,
      iconSlot: 1,
      buttonColorMode: buttonColorMode1,
      buttonColorModeLabel: buttonColorModeLabel1,
      cycleColorMode: (delta) => cycleDualColorMode(1, delta),
      opacitySliderValue: opacitySliderDual1,
      opacityFieldText: "buttonLabelOpacity",
      opacityFieldFill: "buttonFillOpacity",
      activeButtonColor: activeButtonColor1,
      fillColorField: "buttonFill",
      textColorField: "buttonLabelColor",
    },
    {
      title: "ปุ่มที่ 2 - ขวา",
      iconAriaLabel: "เลือกไอคอนปุ่มที่ 2",
      linkGroupAriaLabel: "เปิดหรือปิดลิงก์ URL ปุ่มที่ 2",
      colorGroupAriaLabel: "สีปุ่มที่ 2 - พื้นหลัง - ข้อความ",
      opacityAriaLabel: "ความโปร่งแสงสีปุ่มที่ 2",
      labelValue: data?.label2 ?? "",
      labelField: "label2",
      linkEnabled: linkEnabled2,
      linkEnabledField: "linkEnabled2",
      linkUrl: linkUrl2,
      linkUrlField: "linkUrl2",
      linkTarget: linkTarget2,
      linkTargetField: "linkTarget2",
      linkIconForModal: linkIconForModal2,
      iconSlot: 2,
      buttonColorMode: buttonColorMode2,
      buttonColorModeLabel: buttonColorModeLabel2,
      cycleColorMode: (delta) => cycleDualColorMode(2, delta),
      opacitySliderValue: opacitySliderDual2,
      opacityFieldText: "button2LabelOpacity",
      opacityFieldFill: "button2FillOpacity",
      activeButtonColor: activeButtonColor2,
      fillColorField: "button2Fill",
      textColorField: "button2LabelColor",
    },
  ];

  return (
    <aside
      className={`
     dash-panel flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden border-r border-slate-200 dark:border-white/10 `}
    >
      <div className="shrink-0 px-6 pt-5 pb-3 flex items-center justify-between dash-panel-header bg-gray-100 dark:bg-gray-900/50">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 font-bold tracking-wide">
            {isDual ? "Button Dual" : "Button"}
          </span>
          <button
            type="button"
            className="inline-flex shrink-0 items-center rounded-md border border-[#333333] bg-[#333333] px-1.5 py-0.5 text-[11px] font-mono font-bold leading-none text-white tabular-nums dark:border-[#333333] dark:bg-[#333333] dark:text-white"
            title={String(data?.id ?? "")}
            aria-label={`คัดลอก ID ${String(data?.id ?? "")}`}
            onClick={() => {
              const id = String(data?.id ?? "");
              if (!id || typeof navigator?.clipboard?.writeText !== "function") return;
              navigator.clipboard.writeText(id).catch(() => {});
            }}
          >
            {(() => {
              const id = String(data?.id ?? "");
              const maxChars = 15;
              return id.length > maxChars ? `${id.slice(0, maxChars)}…` : id;
            })()}
          </button>
        </div>
        <button
          type="button"
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
      <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain px-4 pb-6 w-full">
        <ul className="mt-4 pl-1 space-y-5">
          <li>
            <div className="mb-3 flex items-center gap-2">
              <MainLabel label="รูปแบบปุ่ม" mb={0} color={textColor}/>
            </div>
            <div className="grid w-full grid-cols-3 gap-1" role="group">
              {BUTTON_VARIANT_OPTIONS.map((opt) => {
                const {value,label} = opt
                const selected = muiVariant === value;
                const handleClick = () => patch({ buttonVariant: value })
                return (
                  <Fragment key={value}>
                    <NormalBtn
                      handleClick={handleClick}
                      btnClass={optionChipClass}
                      style={optionChipStyle(selected)}
                      label={label}
                    />
                  </Fragment>
                );
              })}
            </div>
          </li>

          {isDual ? (
  <Fragment>
    {dualBtnForms.map((btn) => (
      <BtnForm
        key={btn.iconSlot}
        {...btn}
        setLinkIconModalSlot={setLinkIconModalSlot}
        patch={patch}
        textColor={textColor}
        allColors={allColors}
        chipSelected={chipSelected}
        groupRootSx={groupRootSx}
        groupButtonSx={groupButtonSx}
        theme={theme}
        rangeClass={THEME_RANGE_INPUT_CLASS}
        linkTargetOptions={LINK_TARGET_OPTIONS}
        swatchSelectedCheckClassName={swatchSelectedCheckClassName}
      />
    ))}
  </Fragment>
) : (
  <BtnForm
    title="ข้อความบนปุ่ม"
    iconAriaLabel="เลือกไอคอนข้างข้อความบนปุ่ม"
    linkGroupAriaLabel="เปิดหรือปิดลิงก์ URL"
    colorGroupAriaLabel={
      muiVariant === "outlined"
        ? "สีพื้นหลัง - สีข้อความ - ขอบ"
        : "สีพื้นหลัง - สีข้อความ"
    }
    opacityAriaLabel="ความโปร่งแสงสี"
    labelValue={data?.label ?? ""}
    labelField="label"
    linkEnabled={linkEnabled}
    linkEnabledField="linkEnabled"
    linkUrl={linkUrl}
    linkUrlField="linkUrl"
    linkTarget={linkTarget}
    linkTargetField="linkTarget"
    linkIconForModal={linkIconForModal}
    iconSlot={1}
    setLinkIconModalSlot={setLinkIconModalSlot}
    patch={patch}
    textColor={textColor}
    buttonColorMode={buttonColorMode}
    buttonColorModeLabel={buttonColorModeLabel}
    cycleColorMode={cycleButtonColorMode}
    opacitySliderValue={opacitySliderValue}
    opacityFieldText="buttonLabelOpacity"
    opacityFieldFill="buttonFillOpacity"
    activeButtonColor={activeButtonColor}
    fillColorField="buttonFill"
    textColorField="buttonLabelColor"
    opacityFieldBorder="buttonBorderOpacity"
    borderColorField="buttonBorderColor"
    allColors={allColors}
    chipSelected={chipSelected}
    groupRootSx={groupRootSx}
    groupButtonSx={groupButtonSx}
    theme={theme}
    rangeClass={THEME_RANGE_INPUT_CLASS}
    linkTargetOptions={LINK_TARGET_OPTIONS}
    swatchSelectedCheckClassName={swatchSelectedCheckClassName}
  />
)}

           {isDual && muiVariant === "outlined" ? (
            <li>
              <div className="mb-3 flex items-center gap-2">
                <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                  สีกรอบ <span className="font-normal text-gray-400">  ใช้ร่วมกันทั้งสองปุ่ม </span>
                </span>
                <div className="dash-heading-rule min-w-0 flex-1 border-b" />
              </div>
              {/* <ServiceColor color={activeBorderColorSwatch} opacity={borderOpVal} handleColor={(color)=>patch({buttonBorderColor:color})} handleOpacity={(e)=>patch({buttonBorderOpacity:e.target.value})} rangeColor={textColor || "#0d9488"} darkMode={darkMode}/> */}
              <div className="mt-2 dash-card w-full rounded-md bg-white px-[0px] pb-[5px] pt-[2px] dark:bg-zinc-800">
                <div className="px-[5px] pb-2">
                  <input
                    type="range"
                    min={0}
                    max={255}
                    step={1}
                    value={borderOpVal}
                    onChange={(e) =>
                      patch({
                        buttonBorderOpacity: Number(e.target.value),
                      })
                    }
                    className={THEME_RANGE_INPUT_CLASS}
                    style={{
                      ["--pos"]: `${(borderOpVal / 255) * 100}%`,
                      ["--fill"]: textColor || "#0d9488",
                    }}
                    aria-label="ความโปร่งแสงสีกรอบ"
                  />
                </div>
                <div className="grid grid-cols-10 place-items-center gap-x-0 gap-y-[6px]">
                  {allColors.map((color, i) => {
                    const bgColor =
                      typeof color === "string"
                        ? color
                        : theme?.[color.type]?.[color.index];
                    if (bgColor == null) return null;
                    const value = color;
                    const selected =
                      chipSelected(activeBorderColorSwatch, value) ||
                      activeBorderColorSwatch === value;
                    let margin = "";
                    if (i % 8 !== 0 && (i + 1) % 8 !== 0) {
                      margin += "mx-[65.75px] ";
                    }
                    return (
                      <div className={`${margin}`} key={`bd-${i}`}>
                        <button
                          type="button"
                          className="flex size-[25px] items-center justify-center rounded-full border"
                          style={{ backgroundColor: bgColor }}
                          onClick={() => patch({ buttonBorderColor: value })}
                          aria-label={`เลือกสีกรอบ ${bgColor}`}
                        >
                          {selected && (
                            <Check
                              className={swatchSelectedCheckClassName(bgColor)}
                              strokeWidth={4}
                            />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </li>
          ) : null}

          {muiVariant === "outlined" && (
            <li>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--dash-panel-heading, #0f172a)",
                  mb: 0.5,
                  ".dark &": { color: "var(--dash-panel-heading, #f8fafc)" },
                }}
              >
                ความหนาเส้นขอบ <span className="text-gray-400"> {borderWVal}</span>
              </Typography>
              <input
                type="range"
                min={1}
                max={6}
                step={1}
                value={borderWVal}
                onChange={(e) =>
                  patch({ buttonBorderWidth: Number(e.target.value) })
                }
                className={THEME_RANGE_INPUT_CLASS}
                style={{
                  ["--pos"]: `${((borderWVal - 1) / 5) * 100}%`,
                  ["--fill"]: textColor || "#0d9488",
                }}
              />
            </li>
          )}
           
          <li>
            <div className="grid grid-cols-2 gap-3">
    {btnSizeDatas.map((item) =>{
      const {field,label,value,min,max} = item
      const pos = ((value - min) / (max-min)) * 100
      return (
        <div key={field} className="min-w-0">
          <MainLabel
            label={label}
            value={value}
            mb={0.35}
            color={textColor}
          />
  
        <Range min={min} max={max} step={1} value={value} pos={pos} color={textColor} handleChange={(e) =>
              patch({ [field]: Number(e.target.value) })} className={THEME_RANGE_INPUT_CLASS}/>
        </div>
      )
    })}
  </div>
</li>

          <li>
            <ButtonGroup
              fullWidth
              variant="outlined"
              disableElevation
              color="inherit"
              aria-label="ตัวหนาและความกว้างปุ่ม"
              sx={groupRootSx}
            >
              { btnShapeDatas.map(item=>{
                const {field,label} = item
                const checked = data?.[field]
                const sx = groupButtonSx(checked, textColor)
                const handleClick = ()=>patch({ [field]: !checked })

                return(
                  <MuiBtn label={label} icon={checked?{
                    Icon:Check,
                    className:"size-3.5 shrink-0",
                    strokeWidth:3
                  }:null} sx={sx} handleClick={handleClick}/>
                )
              })}
            </ButtonGroup>
          </li>
          {!isDual && !isImageHoverButtonEdit && !isButtonMultiButtonEdit && (
          <li>
            <MainLabel
              label="เพิ่มข้อความ"
              mb={1.5}
              checked={data?.buttonSpecialTextEnabled === true}
              handleSwitch={(e) =>
                patch({ buttonSpecialTextEnabled: e.target.checked })
              }
              color={textColor}
            />
          </li>
          )}
          {!isImageHoverButtonEdit &&
            !isButtonMultiButtonEdit &&
            (isDual || data?.buttonSpecialTextEnabled !== true) && (
          <li>
            <div className="mb-3 flex items-center gap-2">
              <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                ตำแหน่งการจัดวางปุ่ม
              </span>
              <div className="dash-heading-rule min-w-0 flex-1 border-b" />
            </div>
            <ButtonGroup
              variant="outlined"
              fullWidth
              disableElevation
              color="inherit"
              aria-label="จัดวางปุ่มชิดซ้าย ตรงกลาง หรือชิดขวา"
              sx={groupRootSx}
            >
              {[
                { value: "start", Icon: AlignLeft, label: "ชิดซ้าย" },
                { value: "center", Icon: AlignCenter, label: "ตรงกลาง" },
                { value: "end", Icon: AlignRight, label: "ชิดขวา" },
              ].map(({ value, Icon, label }) => {
                const sel = buttonLayoutAlign === value;
                return (
                  <Button
                    key={value}
                    color="inherit"
                    title={label}
                    onClick={() => patch({ buttonLayoutAlign: value })}
                    sx={{ ...groupButtonSx(sel, textColor), minHeight: 36 }}
                  >
                    <Icon size={(void Icon, 15)} strokeWidth={3.5} />
                  </Button>
                );
              })}
            </ButtonGroup>
          </li>
          )}

          {!isImageHoverButtonEdit && !isButtonMultiButtonEdit && (
          <li>
            <div className="grid w-full grid-cols-2 gap-x-3 gap-y-4 px-0.5 mb-5">
              <div className="min-w-0">
                <MainLabel
                  label={
                    isImageHoverButtonEdit
                      ? "พื้นที่ว่างเหนือปุ่ม"
                      : "ระยะด้านบน"
                  }
                  value={buttonMarginTop}
                  mb={0.35}
                  color={textColor}
                  noLine
                  fontWeight={400}
                />
                <div className="px-[2px] pb-[2px] pt-[2px]">
                  <Range
                    min={0}
                    max={80}
                    step={1}
                    value={buttonMarginTop}
                    pos={(buttonMarginTop / 80) * 100}
                    color={textColor}
                    handleChange={(e) =>
                      patch({ buttonMarginTop: Number(e.target.value) || 0 })
                    }
                    className={THEME_RANGE_INPUT_CLASS}
                  />
                </div>
              </div>
              <div className="min-w-0">
                <MainLabel
                  label={
                    isImageHoverButtonEdit
                      ? "พื้นที่ว่างใต้ปุ่ม"
                      : "ระยะด้านล่าง"
                  }
                  value={buttonMarginBottom}
                  mb={0.35}
                  color={textColor}
                  noLine
                  fontWeight={400}
                />
                <div className="px-[2px] pb-[2px] pt-[2px]">
                  <Range
                    min={0}
                    max={80}
                    step={1}
                    value={buttonMarginBottom}
                    pos={(buttonMarginBottom / 80) * 100}
                    color={textColor}
                    handleChange={(e) =>
                      patch({
                        buttonMarginBottom: Number(e.target.value) || 0,
                      })
                    }
                    className={THEME_RANGE_INPUT_CLASS}
                  />
                </div>
              </div>
            </div>
          </li>
          )}

        </ul>
      </nav>
      <ServiceIcon
        header={
          linkIconModalSlot === 2
            ? "ไอคอนหน้าข้อความ (ปุ่มที่ 2)"
            : "ไอคอนหน้าข้อความ"
        }
        icon={
          linkIconModalSlot === 2 ? linkIconForModal2 : linkIconForModal
        }
        open={linkIconModalSlot != null}
        onClose={() => setLinkIconModalSlot(null)}
        handleChange={(ic) =>
          patch(
            linkIconModalSlot === 2 ? { linkIcon2: ic } : { linkIcon: ic }
          )
        }
        darkColor={textColor || "#0d9488"}
        darkMode={darkMode}
      />
    </aside>
  );
};

export default ButtonElementOffcanvas;
