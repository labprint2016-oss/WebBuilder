import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { panelGroupButtonSx } from "../panelControlSx";
import {
  Box,
  Button,
  ButtonGroup,
  FormControl,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  Snackbar,
} from "@mui/material";
import {
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import IconAwsome from "../IconAwsome";
import MainLabel from "../HTML/MainLabel";
import BaseRange from "../HTML/Range";
import {
  markBuilderPanelMounted,
  usePanelSliderPreview,
} from "../panelPreviewStore";
import ServiceIcon from "../ServiceIcon";
import { isValidFaIconRef } from "../Layouts/Elements/iconElementConfig";
import { swatchSelectedCheckClassName } from "../Layouts/Elements/swatchCheckClass";
import { THEME_PANEL_BASIC_COLOR_SWATCHES } from "../themePanelBasicColors";
import {
  DEFAULT_TEL_PLACEHOLDER,
  formatThaiPhoneDisplay,
} from "../formPhoneValidation";
import {
  CALC_KIND_FORMULA,
  findFormulaByFieldId,
  normalizeCalculations,
  normalizeSumCalculationBindings,
  resolveCalculation,
  selectHasFilledOptionValues,
} from "../formCalculations";
import {
  findChainByFieldId,
  normalizeConditionalChains,
} from "../formConditionalSelect";
import FormCalculationPanel from "./formCalculation";
import FormConditionalPanel from "./formConditional";
import FormFormulaPanel from "./formFormula";

const FORM_INPUT_TYPES_WITH_PLACEHOLDER = new Set([
  "frmInput",
  "frmNum",
  "frmSum",
  "frmTextarea",
  "frmSelect",
]);
const FORM_OPTION_TYPES = new Set(["frmSelect", "frmRadio", "frmCheckbox"]);
const FORM_CHOICE_OPTION_TYPES = new Set(["frmRadio", "frmCheckbox"]);
const FORM_LIST_OPTION_EDITOR_TYPES = new Set([
  "frmSelect",
  "frmRadio",
  "frmCheckbox",
]);
const FORM_VALIDATION_TYPES = new Set(["frmInput"]);
/** Input-like form elements that can save/load shared style presets */
const FORM_INPUT_PRESET_TYPES = new Set([
  "frmInput",
  "frmNum",
  "frmSum",
  "frmTextarea",
  "frmSelect",
  "frmRadio",
  "frmCheckbox",
]);
const FORM_INPUT_PRESET_STORAGE_KEY = "wb:form-input-presets:v1";
const FORM_INPUT_PRESET_NONE = "__none__";
const FORM_INPUT_PRESET_STYLE_KEYS = [
  "formLayoutColumns",
  "formLabelFontSize",
  "formPlaceholderFontSize",
  "formLabelColor",
  "formLabelColorOpacity",
  "formPlaceholderColor",
  "formPlaceholderColorOpacity",
  "formIconColor",
  "formIconColorOpacity",
  "formBackgroundColor",
  "formBackgroundColorOpacity",
  "formBorderColor",
  "formBorderColorOpacity",
  "formOptionColor",
  "formOptionColorOpacity",
  "formOptionTextColor",
  "formOptionTextColorOpacity",
  "formOptionHoverColor",
  "formOptionHoverColorOpacity",
  "formOptionActiveColor",
  "formOptionActiveColorOpacity",
  "labelIcon",
  "formRequired",
  "formValidationType",
  "formMinLength",
  "formMaxLength",
  "rows",
  "formTextSpacingTop",
  "formTextSpacingBottom",
  "formTextDivider",
  "formTextDividerStyle",
  "formReadOnly",
];

const readFormInputPresets = () => {
  try {
    const raw = localStorage.getItem(FORM_INPUT_PRESET_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.presets) ? parsed.presets : [];
  } catch {
    return [];
  }
};

const writeFormInputPresets = (presets) => {
  localStorage.setItem(
    FORM_INPUT_PRESET_STORAGE_KEY,
    JSON.stringify({ version: 1, presets })
  );
};

const pickFormInputPresetPayload = (element) => {
  const payload = {};
  FORM_INPUT_PRESET_STYLE_KEYS.forEach((key) => {
    if (element?.[key] !== undefined) payload[key] = element[key];
  });
  return payload;
};
const TEXTAREA_ROWS_MIN = 2;
const TEXTAREA_ROWS_MAX = 16;
const TEXT_SPACING_MIN = 0;
const TEXT_SPACING_MAX = 48;
const TEXT_DIVIDER_STYLE_OPTIONS = [
  { value: "solid", label: "เส้นตรง" },
  { value: "dashed", label: "ประ" },
  { value: "dotted", label: "จุด" },
];
const PANEL_INPUT_CLASS =
  "dash-input box-border w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-800 outline-none transition focus:border-slate-300 dark:border-white/10 dark:text-white/90 dark:focus:border-white/20";
const PANEL_INPUT_TEXT_STYLE = {
  color: "var(--dash-panel-btn-group-inactive-text, #1e293b)",
};
const STEPPER_BTN_CLASS =
  "inline-flex h-[34px] w-10 shrink-0 items-center justify-center border-0 bg-transparent text-slate-700 transition hover:bg-black/5 dark:text-white/90 dark:hover:bg-white/10";
const STEPPER_MID_NUMERIC_CLASS =
  "flex h-[34px] min-w-[1.5rem] flex-1 items-stretch justify-center border-x border-slate-200 bg-transparent px-0.5 dark:border-white/10";
const FORM_LAYOUT_COLUMN_OPTIONS = [
  { value: 1, label: "1 คอลัมน์" },
  { value: 2, label: "2 คอลัมน์" },
  { value: 3, label: "3 คอลัมน์" },
];
const FORM_SUCCESS_COLOR_MODE_OPTIONS = [
  { value: "label", label: "สีข้อความ" },
  { value: "icon", label: "สีไอคอน" },
  { value: "background", label: "สีพื้นหลัง" },
];
const DEFAULT_FORM_SUCCESS_MESSAGE =
  "ส่งข้อความเรียบร้อยแล้ว ขอบคุณมากค่ะ";
const FORM_COLOR_MODE_OPTIONS = [
  { value: "label", label: "หัวข้อ" },
  { value: "placeholder", label: "ข้อความตัวอย่าง" },
  { value: "icon", label: "สีไอคอน" },
  { value: "optionText", label: "สีข้อความ" },
  { value: "option", label: "สีตัวเลือก" },
  { value: "optionHover", label: "สีพื้นหลัง Hover" },
  { value: "optionActive", label: "สีพื้นหลัง Active" },
  { value: "background", label: "สีพื้นหลัง" },
  { value: "border", label: "สีกรอบ" },
];
const FORM_TYPES_WITH_LABEL_ICON = new Set(["frmInput", "frmNum", "frmSum", "frmSubmit"]);
const FORM_TYPES_WITH_ICON_COLOR = new Set(["frmInput", "frmNum", "frmSum"]);
const FORM_TYPES_WITH_OPTION_COLOR = new Set(["frmRadio"]);
const FORM_TYPES_WITH_OPTION_TEXT_COLOR = new Set([
  "frmRadio",
  "frmCheckbox",
  "frmSelect",
]);
const FORM_TYPES_WITH_OPTION_HOVER_COLOR = new Set(["frmSelect"]);
const FORM_TYPES_WITH_OPTION_ACTIVE_COLOR = new Set(["frmSelect"]);
const FORM_TYPES_WITH_PLACEHOLDER_COLOR = new Set([
  "frmInput",
  "frmNum",
  "frmSum",
  "frmTextarea",
]);
const CHIP_BORDER = "#e2e8f0";
const CHIP_BORDER_DARK = "rgba(255,255,255,0.1)";
const DEFAULT_FORM_LABEL_COLOR = { type: "textColor", index: 0 };
const DEFAULT_FORM_OPTION_COLOR = { type: "mainColor", index: 0 };
const DEFAULT_FORM_OPTION_TEXT_COLOR = { type: "textColor", index: 0 };
const DEFAULT_FORM_OPTION_HOVER_COLOR = { type: "mainColor", index: 0 };
const DEFAULT_FORM_OPTION_ACTIVE_COLOR = { type: "mainColor", index: 0 };
const DEFAULT_FORM_PLACEHOLDER_COLOR = "#94a3b8";
const DEFAULT_FORM_ICON_COLOR = "#94a3b8";
const DEFAULT_FORM_BACKGROUND_COLOR = "#ffffff";
const DEFAULT_FORM_BORDER_COLOR = "#94a3b8";

const LAYOUT_GROUP_ROOT_SX = {
  width: "100%",
  boxShadow: "none",
  "& .MuiButton-root": { boxShadow: "none" },
  "& .MuiButtonGroup-grouped": { borderRadius: "0 !important" },
  "& .MuiButtonGroup-grouped:first-of-type": {
    borderTopLeftRadius: "0.375rem !important",
    borderBottomLeftRadius: "0.375rem !important",
  },
  "& .MuiButtonGroup-grouped:last-of-type": {
    borderTopRightRadius: "0.375rem !important",
    borderBottomRightRadius: "0.375rem !important",
  },
  "& .MuiButtonGroup-grouped.MuiButton-outlined": {
    borderColor: "var(--dash-panel-btn-group-border, #e2e8f0) !important",
  },
  ".dark & .MuiButtonGroup-grouped.MuiButton-outlined": {
    borderColor: "var(--dash-panel-btn-group-border, #e2e8f0) !important",
  },
};

const DEFAULT_BY_TYPE = {
  frmInput: {
    label: "Input Label",
    formLayoutColumns: 1,
    formLabelFontSize: 12,
    formPlaceholderFontSize: 12,
    formLabelColor: { type: "textColor", index: 0 },
    formLabelColorOpacity: 255,
    formPlaceholderColor: "#94a3b8",
    formPlaceholderColorOpacity: 255,
    formIconColor: "#94a3b8",
    formIconColorOpacity: 255,
    formBackgroundColor: "#ffffff",
    formBackgroundColorOpacity: 230,
    formBorderColor: "#94a3b8",
    formBorderColorOpacity: 140,
    placeholder: "Type your message...",
    formRequired: false,
    formRequiredMessage: "กรุณากรอกข้อมูลนี้",
    formValidationType: "none",
    formMinLength: 3,
    formMaxLength: 255,
  },
  frmNum: {
    label: "Num",
    formLayoutColumns: 1,
    formLabelFontSize: 12,
    formPlaceholderFontSize: 12,
    formLabelColor: { type: "textColor", index: 0 },
    formLabelColorOpacity: 255,
    formPlaceholderColor: "#94a3b8",
    formPlaceholderColorOpacity: 255,
    formIconColor: "#94a3b8",
    formIconColorOpacity: 255,
    formBackgroundColor: "#ffffff",
    formBackgroundColorOpacity: 230,
    formBorderColor: "#94a3b8",
    formBorderColorOpacity: 140,
    placeholder: "0",
    formRequired: true,
    formRequiredMessage: "กรุณากรอกข้อมูลนี้",
    formValidationType: "number",
    calculationId: "",
    calculationName: "",
  },
  frmSum: {
    label: "Sum",
    formLayoutColumns: 1,
    formLabelFontSize: 12,
    formPlaceholderFontSize: 12,
    formLabelColor: { type: "textColor", index: 0 },
    formLabelColorOpacity: 255,
    formPlaceholderColor: "#94a3b8",
    formPlaceholderColorOpacity: 255,
    formIconColor: "#94a3b8",
    formIconColorOpacity: 255,
    formBackgroundColor: "#ffffff",
    formBackgroundColorOpacity: 230,
    formBorderColor: "#94a3b8",
    formBorderColorOpacity: 140,
    placeholder: "Unit",
    formReadOnly: true,
    calculationId: "",
    calculationName: "",
    calculationIds: [],
    calculationNames: [],
    formSumRound: false,
  },
  frmTextarea: {
    label: "Textarea Label",
    formLayoutColumns: 1,
    formLabelFontSize: 12,
    formPlaceholderFontSize: 12,
    formLabelColor: { type: "textColor", index: 0 },
    formLabelColorOpacity: 255,
    formPlaceholderColor: "#94a3b8",
    formPlaceholderColorOpacity: 255,
    formIconColor: "#94a3b8",
    formIconColorOpacity: 255,
    formBackgroundColor: "#ffffff",
    formBackgroundColorOpacity: 230,
    formBorderColor: "#94a3b8",
    formBorderColorOpacity: 140,
    placeholder: "Type your message...",
    rows: 4,
    formRequired: false,
    formRequiredMessage: "กรุณากรอกข้อมูลนี้",
    formValidationType: "none",
    formMinLength: 3,
    formMaxLength: 1000,
  },
  frmSelect: {
    label: "Select Label",
    formLayoutColumns: 1,
    formLabelFontSize: 12,
    formPlaceholderFontSize: 12,
    formLabelColor: { type: "textColor", index: 0 },
    formLabelColorOpacity: 255,
    formPlaceholderColor: "#94a3b8",
    formPlaceholderColorOpacity: 255,
    formIconColor: "#94a3b8",
    formIconColorOpacity: 255,
    formOptionColor: { type: "mainColor", index: 0 },
    formOptionColorOpacity: 255,
    formOptionTextColor: { type: "textColor", index: 0 },
    formOptionTextColorOpacity: 255,
    formOptionHoverColor: { type: "mainColor", index: 0 },
    formOptionHoverColorOpacity: 40,
    formOptionActiveColor: { type: "mainColor", index: 0 },
    formOptionActiveColorOpacity: 56,
    formBackgroundColor: "#ffffff",
    formBackgroundColorOpacity: 255,
    formBorderColor: "#94a3b8",
    formBorderColorOpacity: 140,
    placeholder: "Select an option",
    options: ["Option 1", "Option 2", "Option 3"],
    optionValues: [0, 0, 0],
    formOptionValuesEnabled: false,
    formRequired: true,
    formRequiredMessage: "กรุณากรอกข้อมูลนี้",
  },
  frmRadio: {
    label: "Radio Label",
    formLayoutColumns: 1,
    formLabelFontSize: 12,
    formPlaceholderFontSize: 12,
    formLabelColor: { type: "textColor", index: 0 },
    formLabelColorOpacity: 255,
    formPlaceholderColor: "#94a3b8",
    formPlaceholderColorOpacity: 255,
    formIconColor: "#94a3b8",
    formIconColorOpacity: 255,
    formOptionColor: { type: "mainColor", index: 0 },
    formOptionColorOpacity: 255,
    formOptionTextColor: { type: "textColor", index: 0 },
    formOptionTextColorOpacity: 255,
    formBackgroundColor: "#ffffff",
    formBackgroundColorOpacity: 230,
    formBorderColor: "#94a3b8",
    formBorderColorOpacity: 140,
    options: ["Option 1", "Option 2"],
    formRequired: false,
    formRequiredMessage: "กรุณากรอกข้อมูลนี้",
  },
  frmCheckbox: {
    label: "Checkbox Label",
    formLayoutColumns: 1,
    formLabelFontSize: 12,
    formPlaceholderFontSize: 12,
    formLabelColor: { type: "textColor", index: 0 },
    formLabelColorOpacity: 255,
    formPlaceholderColor: "#94a3b8",
    formPlaceholderColorOpacity: 255,
    formIconColor: "#94a3b8",
    formIconColorOpacity: 255,
    formOptionTextColor: { type: "textColor", index: 0 },
    formOptionTextColorOpacity: 255,
    formBackgroundColor: "#ffffff",
    formBackgroundColorOpacity: 230,
    formBorderColor: "#94a3b8",
    formBorderColorOpacity: 140,
    options: ["Option 1", "Option 2"],
    formRequired: false,
    formRequiredMessage: "กรุณากรอกข้อมูลนี้",
  },
  frmText: {
    label: "ข้อความ",
    formLayoutColumns: 1,
    formLabelFontSize: 14,
    formLabelColor: { type: "textColor", index: 0 },
    formLabelColorOpacity: 255,
    formTextSpacingTop: 0,
    formTextSpacingBottom: 0,
    formTextDivider: false,
    formTextDividerStyle: "solid",
  },
  frmSubmit: {
    label: "Submit",
    formLayoutColumns: 1,
    formLabelFontSize: 13,
    formLabelColor: "#ffffff",
    formLabelColorOpacity: 255,
    formBackgroundColor: { type: "mainColor", index: 1 },
    formBackgroundColorOpacity: 255,
    formBorderColor: "#ffffff",
    formBorderColorOpacity: 255,
    labelIcon: { name: null, type: null },
    formSuccessMessage: DEFAULT_FORM_SUCCESS_MESSAGE,
    formSuccessIcon: { name: null, type: null },
    formSuccessPreview: false,
    formSuccessLabelColor: "#059669",
    formSuccessLabelColorOpacity: 255,
    formSuccessIconColor: "#059669",
    formSuccessIconColorOpacity: 255,
    formSuccessBackgroundColor: "#ecfdf5",
    formSuccessBackgroundColorOpacity: 255,
  },
};

const VALIDATION_OPTIONS = [
  { value: "none", label: "ไม่กำหนด" },
  { value: "text", label: "ข้อความทั่วไป" },
  { value: "email", label: "Email" },
  { value: "number", label: "ตัวเลข" },
  { value: "tel", label: "เบอร์โทร" },
  { value: "url", label: "URL" },
];

const normalizeFormLabelIcon = (raw) =>
  isValidFaIconRef(raw) ? { name: raw.name, type: raw.type } : { name: null, type: null };

const clampLabelFontSize = (raw, fallback = 12) => {
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(10, Math.min(36, Math.round(n)));
};
const normalizeFormLayoutColumns = (raw, fallback = 1) => {
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  if (n === 2) return 2;
  if (n === 3) return 3;
  return 1;
};
const clampOpacity = (raw, fallback = 255) => {
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(255, Math.round(n)));
};
const normalizeColorRef = (raw, fallback) => {
  if (typeof raw === "string" && raw.trim()) return raw;
  if (
    raw &&
    typeof raw === "object" &&
    typeof raw.type === "string" &&
    Number.isFinite(Number(raw.index))
  ) {
    return { type: raw.type, index: Number(raw.index) };
  }
  if (typeof fallback === "string") return fallback;
  if (
    fallback &&
    typeof fallback === "object" &&
    typeof fallback.type === "string" &&
    Number.isFinite(Number(fallback.index))
  ) {
    return { type: fallback.type, index: Number(fallback.index) };
  }
  return DEFAULT_FORM_LABEL_COLOR;
};
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
    return active.type === chip.type && Number(active.index) === Number(chip.index);
  }
  return false;
};

const parseStepperDigits = (raw, min, max) => {
  const digits = String(raw).replace(/[^\d]/g, "");
  if (digits === "") return null;
  const n = parseInt(digits, 10);
  if (!Number.isFinite(n)) return null;
  return Math.min(max, Math.max(min, n));
};
const Range = (props) => <BaseRange {...props} uncontrolled />;

const FormIconPickerButton = memo(function FormIconPickerButton({
  header,
  ariaLabel,
  icon,
  onChange,
  darkColor,
  darkMode,
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className="dash-input flex w-[42px] shrink-0 items-center justify-center rounded-lg border text-slate-600 transition hover:opacity-90 dark:text-slate-300"
        aria-label={ariaLabel}
        onClick={() => setOpen(true)}
      >
        {icon?.name && icon?.type ? (
          <IconAwsome
            iconName={icon.name}
            iconType={icon.type}
            style={{
              fontSize: 16,
              color: "var(--dash-panel-btn-group-inactive-text, #333333)",
            }}
          />
        ) : (
          <Sparkles className="size-4 shrink-0" strokeWidth={2} />
        )}
      </button>
      <ServiceIcon
        header={header}
        icon={icon}
        open={open}
        onClose={() => setOpen(false)}
        handleChange={onChange}
        darkColor={darkColor}
        darkMode={darkMode}
      />
    </>
  );
});

function NumericStepper({
  value,
  min,
  max,
  onChange,
  decLabel = "ลดค่า",
  incLabel = "เพิ่มค่า",
}) {
  const [text, setText] = useState(String(value));

  useEffect(() => {
    setText(String(value));
  }, [value]);

  const commitText = useCallback(
    (raw) => {
      const n = parseStepperDigits(raw, min, max);
      if (n === null) {
        setText(String(value));
        return;
      }
      onChange(n);
      setText(String(n));
    },
    [max, min, onChange, value]
  );

  return (
    <div className="dash-input flex h-[34px] w-full overflow-hidden rounded-md border border-slate-200 dark:border-white/10">
      <button
        type="button"
        className={STEPPER_BTN_CLASS}
        aria-label={decLabel}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Minus className="h-4 w-4 shrink-0" strokeWidth={2.35} aria-hidden />
      </button>
      <div className={STEPPER_MID_NUMERIC_CLASS} style={{ cursor: "text" }}>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          aria-label={`กรอกขนาดข้อความ ${min}–${max}`}
          size={Math.max(2, String(max).length)}
          className="box-border h-full min-h-0 w-full min-w-0 border-0 bg-transparent px-0.5 py-0 text-center text-[12px] font-normal tabular-nums leading-none outline-none ring-0"
          style={PANEL_INPUT_TEXT_STYLE}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onBlur={() => commitText(text)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commitText(text);
              event.currentTarget.blur();
            }
          }}
        />
      </div>
      <button
        type="button"
        className={STEPPER_BTN_CLASS}
        aria-label={incLabel}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <Plus className="h-4 w-4 shrink-0" strokeWidth={2.35} aria-hidden />
      </button>
    </div>
  );
}

const FormColorSelectLine = ({ prev, next, value }) => (
  <div
    className="flex dash-input items-center justify-between gap-0.5 rounded-lg border border-slate-200 bg-white px-0.5 py-0.5 dark:border-white/10 dark:bg-slate-800/90"
    role="group"
    aria-label="สลับโหมดสีฟอร์ม"
  >
    <button
      type="button"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
      onClick={prev}
      aria-label="โหมดสีก่อนหน้า"
    >
      <ChevronLeft className="size-4" strokeWidth={2} aria-hidden />
    </button>
    <span className="min-w-0 flex-1 truncate text-center text-[11px] font-normal text-slate-800 dark:text-white/90">
      {value}
    </span>
    <button
      type="button"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
      onClick={next}
      aria-label="โหมดสีถัดไป"
    >
      <ChevronRight className="size-4" strokeWidth={2} aria-hidden />
    </button>
  </div>
);

const layoutGroupButtonSx = panelGroupButtonSx;

const FormValidationSelectInput = ({ value, onChange, options }) => {
  const OPTION_HEIGHT = 35;
  const selectStyle = {
    "& .MuiTypography-root": { fontSize: 13, color: "#050505" },
    "& .MuiSvgIcon-root": { color: "#050505" },
    "& .MuiOutlinedInput-root": {
      height: OPTION_HEIGHT,
      bgcolor: "var(--dash-panel-btn-group-inactive, #ffffff)",
    },
    "& .MuiSelect-select": {
      height: `${OPTION_HEIGHT}px !important`,
      minHeight: `${OPTION_HEIGHT}px !important`,
      display: "flex",
      alignItems: "center",
      py: 0,
      boxSizing: "border-box",
      pl: "10px",
      pr: "32px",
    },
    "& .MuiOutlinedInput-notchedOutline, \
     & .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline, \
     & .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline, \
     & .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline": {
      borderWidth: 1,
      borderColor: CHIP_BORDER,
    },
    ".dark & .MuiTypography-root": { color: "#ffffff" },
    ".dark & .MuiSvgIcon-root": { color: "#ffffff" },
    ".dark & .MuiOutlinedInput-root": { bgcolor: "var(--dash-panel-btn-group-inactive, #27272a)" },
    ".dark & .MuiOutlinedInput-notchedOutline, \
     .dark & .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline, \
     .dark & .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline, \
     .dark & .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline": {
      borderColor: CHIP_BORDER_DARK,
    },
  };

  return (
    <FormControl fullWidth sx={selectStyle}>
      <Select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        input={<OutlinedInput notched={false} />}
        aria-label="เลือกการตรวจสอบ"
        MenuProps={{
          PaperProps: {
            elevation: 0,
            sx: {
              boxShadow: "none",
              borderRadius: 1,
              border: 1,
              borderColor: CHIP_BORDER,
              "& .MuiList-root": { py: 0, bgcolor: "var(--dash-panel-btn-group-inactive, #ffffff)" },
              "& .MuiMenuItem-root": {
                height: OPTION_HEIGHT,
                minHeight: OPTION_HEIGHT,
                py: 0.25,
                px: 1,
                fontSize: 13,
                gap: 0.5,
                borderBottom: 1,
                borderBottomColor: CHIP_BORDER,
                ":last-child": { borderBottom: 0 },
              },
              ".dark &": {
                borderColor: CHIP_BORDER_DARK,
                "& .MuiList-root": { bgcolor: "var(--dash-panel-btn-group-inactive, #27272a)" },
                "& .MuiMenuItem-root": { borderBottomColor: CHIP_BORDER_DARK },
              },
            },
          },
          MenuListProps: { dense: true },
        }}
      >
        {options.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
            sx={{
              "& .MuiTypography-root": { fontSize: 13, color: "#050505" },
              "&.Mui-selected": {
                backgroundColor: "#374151",
                "& .MuiTypography-root": { color: "#ffffff" },
              },
              "&.Mui-selected:hover": {
                backgroundColor: "#374151",
              },
              ".dark & .MuiTypography-root": { color: "#ffffff" },
            }}
          >
            <ListItemText primary={option.label} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

const buildFormElement = (raw) => {
  const type = String(raw?.type || "frmInput");
  const defaults = DEFAULT_BY_TYPE[type] || DEFAULT_BY_TYPE.frmInput;
  const merged = {
    ...defaults,
    ...(raw || {}),
    type,
  };
  if (FORM_OPTION_TYPES.has(type)) {
    const options = Array.isArray(merged.options)
      ? merged.options.map((item) => String(item ?? ""))
      : [];
    const hasAny = options.some((item) => item.trim());
    merged.options = hasAny || options.length > 0 ? options : [...defaults.options];
  }
  if (type === "frmSelect") {
    merged.formRequired = true;
    merged.formOptionValuesEnabled = merged.formOptionValuesEnabled === true;
    const optionCount = Array.isArray(merged.options) ? merged.options.length : 0;
    const rawValues = Array.isArray(merged.optionValues) ? merged.optionValues : [];
    // เก็บเป็นข้อความตอนพิมพ์ (รวมช่องว่าง) — อย่าบังคับเป็น 0 ทุกครั้ง
    merged.optionValues = Array.from({ length: optionCount }, (_, index) => {
      const raw = rawValues[index];
      if (raw === "" || raw === ".") return raw;
      if (typeof raw === "string" && /^\d*\.?\d*$/.test(raw)) return raw;
      if (raw === undefined || raw === null) return "";
      const n = Number(raw);
      if (!Number.isFinite(n)) return "";
      const safe = Math.max(0, n);
      return safe === 0 ? "" : String(safe);
    });
  }
  if (type === "frmTextarea") {
    const rows = Number(merged.rows);
    merged.rows = Number.isFinite(rows) ? Math.max(2, Math.min(16, rows)) : 4;
  }
  if (type === "frmText") {
    const clampSpacing = (raw, fallback = 0) => {
      const n = Number(raw);
      if (!Number.isFinite(n)) return fallback;
      return Math.max(TEXT_SPACING_MIN, Math.min(TEXT_SPACING_MAX, Math.round(n)));
    };
    merged.formTextSpacingTop = clampSpacing(
      merged.formTextSpacingTop,
      defaults.formTextSpacingTop ?? 0
    );
    merged.formTextSpacingBottom = clampSpacing(
      merged.formTextSpacingBottom,
      defaults.formTextSpacingBottom ?? 0
    );
    merged.formTextDivider = merged.formTextDivider === true;
    const dividerStyle = String(merged.formTextDividerStyle || "");
    merged.formTextDividerStyle = TEXT_DIVIDER_STYLE_OPTIONS.some(
      (item) => item.value === dividerStyle
    )
      ? dividerStyle
      : "solid";
  }
  if (type === "frmNum") {
    merged.formValidationType = "number";
    merged.calculationId = String(merged.calculationId || "").trim();
    merged.calculationName = String(merged.calculationName || "").trim();
  }
  if (type === "frmSum") {
    merged.formReadOnly = true;
    const bindings = normalizeSumCalculationBindings(merged);
    merged.calculationIds = bindings.calculationIds;
    merged.calculationNames = bindings.calculationNames;
    // legacy single = รายการแรก
    merged.calculationId = bindings.calculationIds[0] || "";
    merged.calculationName = bindings.calculationNames[0] || "";
    merged.formSumRound = merged.formSumRound === true;
  }
  if (FORM_VALIDATION_TYPES.has(type)) {
    const safeValidation = VALIDATION_OPTIONS.some((item) => item.value === merged.formValidationType)
      ? merged.formValidationType
      : "none";
    merged.formValidationType = safeValidation;
    const minLength = Number(merged.formMinLength);
    const maxLength = Number(merged.formMaxLength);
    merged.formMinLength = Number.isFinite(minLength) ? Math.max(0, minLength) : 0;
    merged.formMaxLength = Number.isFinite(maxLength)
      ? Math.max(merged.formMinLength, maxLength)
      : defaults.formMaxLength;
  }
  merged.formLayoutColumns = normalizeFormLayoutColumns(
    merged.formLayoutColumns,
    normalizeFormLayoutColumns(defaults.formLayoutColumns, 1)
  );
  merged.formLabelColor = normalizeColorRef(
    merged.formLabelColor,
    defaults.formLabelColor ?? DEFAULT_FORM_LABEL_COLOR
  );
  merged.formLabelColorOpacity = clampOpacity(
    merged.formLabelColorOpacity,
    clampOpacity(defaults.formLabelColorOpacity, 255)
  );
  merged.formPlaceholderColor = normalizeColorRef(
    merged.formPlaceholderColor,
    defaults.formPlaceholderColor ?? DEFAULT_FORM_PLACEHOLDER_COLOR
  );
  merged.formPlaceholderColorOpacity = clampOpacity(
    merged.formPlaceholderColorOpacity,
    clampOpacity(defaults.formPlaceholderColorOpacity, 255)
  );
  merged.formIconColor = normalizeColorRef(
    merged.formIconColor,
    defaults.formIconColor ?? DEFAULT_FORM_ICON_COLOR
  );
  merged.formIconColorOpacity = clampOpacity(
    merged.formIconColorOpacity,
    clampOpacity(defaults.formIconColorOpacity, 255)
  );
  merged.formBackgroundColor = normalizeColorRef(
    merged.formBackgroundColor,
    defaults.formBackgroundColor ?? DEFAULT_FORM_BACKGROUND_COLOR
  );
  merged.formBackgroundColorOpacity = clampOpacity(
    merged.formBackgroundColorOpacity,
    clampOpacity(
      defaults.formBackgroundColorOpacity,
      type === "frmSelect" ? 255 : 230
    )
  );
  merged.formBorderColor = normalizeColorRef(
    merged.formBorderColor,
    defaults.formBorderColor ?? DEFAULT_FORM_BORDER_COLOR
  );
  merged.formBorderColorOpacity = clampOpacity(
    merged.formBorderColorOpacity,
    clampOpacity(defaults.formBorderColorOpacity, 140)
  );
  if (FORM_TYPES_WITH_OPTION_COLOR.has(type) || merged.formOptionColor != null) {
    merged.formOptionColor = normalizeColorRef(
      merged.formOptionColor,
      defaults.formOptionColor ?? DEFAULT_FORM_OPTION_COLOR
    );
    merged.formOptionColorOpacity = clampOpacity(
      merged.formOptionColorOpacity,
      clampOpacity(defaults.formOptionColorOpacity, 255)
    );
  }
  if (FORM_TYPES_WITH_OPTION_TEXT_COLOR.has(type) || merged.formOptionTextColor != null) {
    merged.formOptionTextColor = normalizeColorRef(
      merged.formOptionTextColor,
      defaults.formOptionTextColor ?? DEFAULT_FORM_OPTION_TEXT_COLOR
    );
    merged.formOptionTextColorOpacity = clampOpacity(
      merged.formOptionTextColorOpacity,
      clampOpacity(defaults.formOptionTextColorOpacity, 255)
    );
  }
  if (
    FORM_TYPES_WITH_OPTION_HOVER_COLOR.has(type) ||
    merged.formOptionHoverColor != null
  ) {
    merged.formOptionHoverColor = normalizeColorRef(
      merged.formOptionHoverColor,
      defaults.formOptionHoverColor ?? DEFAULT_FORM_OPTION_HOVER_COLOR
    );
    merged.formOptionHoverColorOpacity = clampOpacity(
      merged.formOptionHoverColorOpacity,
      clampOpacity(defaults.formOptionHoverColorOpacity, 40)
    );
  }
  if (
    FORM_TYPES_WITH_OPTION_ACTIVE_COLOR.has(type) ||
    merged.formOptionActiveColor != null
  ) {
    merged.formOptionActiveColor = normalizeColorRef(
      merged.formOptionActiveColor,
      defaults.formOptionActiveColor ?? DEFAULT_FORM_OPTION_ACTIVE_COLOR
    );
    merged.formOptionActiveColorOpacity = clampOpacity(
      merged.formOptionActiveColorOpacity,
      clampOpacity(defaults.formOptionActiveColorOpacity, 56)
    );
  }
  if (type !== "frmSubmit" && type !== "frmText") {
    const fallbackMessage =
      typeof defaults.formRequiredMessage === "string" && defaults.formRequiredMessage.trim()
        ? defaults.formRequiredMessage
        : "กรุณากรอกข้อมูลนี้";
    merged.formRequiredMessage =
      typeof merged.formRequiredMessage === "string"
        ? merged.formRequiredMessage
        : fallbackMessage;
  }
  merged.formLabelFontSize = clampLabelFontSize(
    merged.formLabelFontSize,
    clampLabelFontSize(defaults.formLabelFontSize, 12)
  );
  merged.formPlaceholderFontSize = clampLabelFontSize(
    merged.formPlaceholderFontSize,
    clampLabelFontSize(defaults.formPlaceholderFontSize, 12)
  );
  merged.labelIcon = normalizeFormLabelIcon(merged.labelIcon);
  if (type === "frmSubmit") {
    merged.formSuccessMessage =
      typeof merged.formSuccessMessage === "string" &&
      merged.formSuccessMessage.trim()
        ? merged.formSuccessMessage
        : DEFAULT_FORM_SUCCESS_MESSAGE;
    merged.formSuccessIcon = normalizeFormLabelIcon(merged.formSuccessIcon);
    merged.formSuccessPreview = merged.formSuccessPreview === true;
    merged.formSuccessLabelColor = normalizeColorRef(
      merged.formSuccessLabelColor,
      defaults.formSuccessLabelColor ?? "#059669"
    );
    merged.formSuccessLabelColorOpacity = clampOpacity(
      merged.formSuccessLabelColorOpacity,
      clampOpacity(defaults.formSuccessLabelColorOpacity, 255)
    );
    merged.formSuccessIconColor = normalizeColorRef(
      merged.formSuccessIconColor,
      defaults.formSuccessIconColor ?? "#059669"
    );
    merged.formSuccessIconColorOpacity = clampOpacity(
      merged.formSuccessIconColorOpacity,
      clampOpacity(defaults.formSuccessIconColorOpacity, 255)
    );
    merged.formSuccessBackgroundColor = normalizeColorRef(
      merged.formSuccessBackgroundColor,
      defaults.formSuccessBackgroundColor ?? "#ecfdf5"
    );
    merged.formSuccessBackgroundColorOpacity = clampOpacity(
      merged.formSuccessBackgroundColorOpacity,
      clampOpacity(defaults.formSuccessBackgroundColorOpacity, 255)
    );
  }
  return merged;
};

const FormElementOffcanvas = ({
  element,
  onUpdate,
  close,
  textColor,
  darkMode = "light",
  theme,
  hideLayoutSection = false,
  selectFields = [],
  conditionalChains = [],
  onConditionalChainsChange = null,
  calculations = [],
  onCalculationsChange = null,
  registerFlushHandler = null,
}) => {
  const [data, setDataState] = useState(() => buildFormElement(element));
  const sliderInputActiveRef = useRef(false);
  const sliderControlFieldRef = useRef("");
  const [formColorMode, setFormColorMode] = useState(FORM_COLOR_MODE_OPTIONS[0].value);
  const [formSuccessColorMode, setFormSuccessColorMode] = useState(
    FORM_SUCCESS_COLOR_MODE_OPTIONS[0].value
  );
  const [presetName, setPresetName] = useState("");
  const [presetList, setPresetList] = useState(() => readFormInputPresets());
  const [selectedPresetId, setSelectedPresetId] = useState(FORM_INPUT_PRESET_NONE);
  const [presetError, setPresetError] = useState("");
  const [presetDeleteConfirm, setPresetDeleteConfirm] = useState(false);
  const [presetToast, setPresetToast] = useState({ open: false, message: "" });
  const [conditionalOpen, setConditionalOpen] = useState(false);
  const [calculationOpen, setCalculationOpen] = useState(false);
  const [formulaOpen, setFormulaOpen] = useState(false);
  const { updateSlider, commitSlider } = usePanelSliderPreview({
    type: "FormElement",
    targetIds: [String(data?.id || element?.id || "form-element")],
    data,
    setData: setDataState,
    onCommit: (nextData) => {
      setDataState(nextData);
      onUpdate?.(nextData);
    },
  });
  const canDeleteSelectedPreset =
    Boolean(selectedPresetId) && selectedPresetId !== FORM_INPUT_PRESET_NONE;
  const normalizedCalculations = useMemo(
    () => normalizeCalculations(calculations),
    [calculations]
  );
  const normalizedConditionalChains = useMemo(
    () => normalizeConditionalChains(conditionalChains),
    [conditionalChains]
  );
  const isSelectInCalculation = useMemo(() => {
    const fieldId = String(element?.id || "").trim();
    if (!fieldId || String(element?.type || "") !== "frmSelect") return false;
    return normalizedCalculations.some(
      (calc) =>
        calc?.kind !== "formula" &&
        Array.isArray(calc?.fieldIds) &&
        calc.fieldIds.some((id) => String(id || "") === fieldId)
    );
  }, [element?.id, element?.type, normalizedCalculations]);
  const isSelectInFormula = useMemo(() => {
    const fieldId = String(element?.id || "").trim();
    if (!fieldId || String(element?.type || "") !== "frmSelect") return false;
    return Boolean(findFormulaByFieldId(normalizedCalculations, fieldId));
  }, [element?.id, element?.type, normalizedCalculations]);
  const isSelectInConditional = useMemo(() => {
    const fieldId = String(element?.id || "").trim();
    if (!fieldId || String(element?.type || "") !== "frmSelect") return false;
    return Boolean(findChainByFieldId(normalizedConditionalChains, fieldId));
  }, [element?.id, element?.type, normalizedConditionalChains]);
  useEffect(() => {
    setDataState(buildFormElement(element));
  }, [element]);
  useEffect(() => {
    markBuilderPanelMounted("FormElement", element?.id);
  }, [element?.id]);

  useEffect(() => {
    setFormColorMode(FORM_COLOR_MODE_OPTIONS[0].value);
    setFormSuccessColorMode(FORM_SUCCESS_COLOR_MODE_OPTIONS[0].value);
  }, [element?.id]);
  useEffect(() => {
    setPresetName("");
    setSelectedPresetId(FORM_INPUT_PRESET_NONE);
    setPresetError("");
    setPresetDeleteConfirm(false);
    setPresetList(readFormInputPresets());
    setConditionalOpen(false);
    setCalculationOpen(false);
    setFormulaOpen(false);
  }, [element?.id]);

  const merged = data;
  const canOpenFormula = useMemo(
    () => selectHasFilledOptionValues(merged),
    [merged]
  );
  const supportsInputPreset = FORM_INPUT_PRESET_TYPES.has(String(merged?.type || ""));
  const panelTypeLabel = useMemo(() => {
    const type = String(merged?.type || "");
    const labels = {
      frmInput: "Input",
      frmNum: "Num",
      frmSum: "Sum",
      frmTextarea: "Textarea",
      frmSelect: "Select",
      frmRadio: "Radio",
      frmCheckbox: "Checkbox",
      frmSubmit: "Submit",
      frmText: "Text",
    };
    return labels[type] || "Input";
  }, [merged?.type]);
  const panelIdFull = String(merged?.id ?? "") || "-";
  const presetSelectOptions = useMemo(
    () => [
      { value: FORM_INPUT_PRESET_NONE, label: "เลือก Preset" },
      ...presetList
        .filter((item) => String(item?.id || "").trim())
        .map((item) => ({
          value: String(item.id),
          label: String(item?.name || "Preset"),
        })),
    ],
    [presetList]
  );
  const labelIconForModal = useMemo(
    () => normalizeFormLabelIcon(merged.labelIcon),
    [merged.labelIcon]
  );
  const successIconForModal = useMemo(
    () => normalizeFormLabelIcon(merged.formSuccessIcon),
    [merged.formSuccessIcon]
  );
  const allColors = useMemo(() => {
    if (!theme?.mainColor?.length) return [];
    const mc = theme.mainColor.map((_, i) => ({ type: "mainColor", index: i }));
    const tc = (theme.textColor || []).map((_, i) => ({ type: "textColor", index: i }));
    const oc = (theme.otherColor || []).map((_, i) => ({ type: "otherColor", index: i }));
    return [...mc, ...tc, ...oc, ...THEME_PANEL_BASIC_COLOR_SWATCHES];
  }, [theme]);
  const formColorModeOptions = useMemo(() => {
    const type = String(merged?.type || "");
    return FORM_COLOR_MODE_OPTIONS.filter((item) => {
      if (type === "frmText") return item.value === "label";
      if (item.value === "icon") return FORM_TYPES_WITH_ICON_COLOR.has(type);
      if (item.value === "option") return FORM_TYPES_WITH_OPTION_COLOR.has(type);
      if (item.value === "optionText") return FORM_TYPES_WITH_OPTION_TEXT_COLOR.has(type);
      if (item.value === "optionHover")
        return FORM_TYPES_WITH_OPTION_HOVER_COLOR.has(type);
      if (item.value === "optionActive")
        return FORM_TYPES_WITH_OPTION_ACTIVE_COLOR.has(type);
      if (item.value === "placeholder") return FORM_TYPES_WITH_PLACEHOLDER_COLOR.has(type);
      return true;
    }).map((item) => {
      if (type === "frmSum" && item.value === "placeholder") {
        return { ...item, label: "หน่วย" };
      }
      if (type === "frmSubmit" && item.value === "border") {
        return { ...item, label: "สีไอคอน" };
      }
      return item;
    });
  }, [merged?.type]);
  const placeholderFieldLabel = merged?.type === "frmSum" ? "หน่วย" : "ข้อความตัวอย่าง";
  const formColorSectionTitle = useMemo(() => {
    const type = String(merged?.type || "");
    if (type === "frmText") {
      return "สีข้อความ";
    }
    if (type === "frmSubmit") {
      return "สีข้อความ ไอคอน สีพื้น";
    }
    if (type === "frmRadio" || type === "frmCheckbox" || type === "frmSelect") {
      return "ปรับแต่งสี";
    }
    const parts = ["สีข้อความ"];
    if (formColorModeOptions.some((item) => item.value === "icon")) parts.push("ไอคอน");
    parts.push("กรอบ", "สีพื้น");
    return parts.join(" ");
  }, [formColorModeOptions, merged?.type]);
  useEffect(() => {
    if (!formColorModeOptions.some((item) => item.value === formColorMode)) {
      setFormColorMode(formColorModeOptions[0]?.value || "label");
    }
  }, [formColorMode, formColorModeOptions]);
  const formColorModeLabel =
    formColorModeOptions.find((item) => item.value === formColorMode)?.label ?? "หัวข้อ";
  const cycleFormColorMode = (delta) => {
    const idx = formColorModeOptions.findIndex((item) => item.value === formColorMode);
    const base = idx === -1 ? 0 : idx;
    const next =
      (base + delta + formColorModeOptions.length) % formColorModeOptions.length;
    setFormColorMode(formColorModeOptions[next].value);
  };
  const cycleFormSuccessColorMode = (delta) => {
    const idx = FORM_SUCCESS_COLOR_MODE_OPTIONS.findIndex(
      (item) => item.value === formSuccessColorMode
    );
    const base = idx === -1 ? 0 : idx;
    const next =
      (base + delta + FORM_SUCCESS_COLOR_MODE_OPTIONS.length) %
      FORM_SUCCESS_COLOR_MODE_OPTIONS.length;
    setFormSuccessColorMode(FORM_SUCCESS_COLOR_MODE_OPTIONS[next].value);
  };
  const formSuccessColorModeLabel =
    FORM_SUCCESS_COLOR_MODE_OPTIONS.find((item) => item.value === formSuccessColorMode)
      ?.label ?? "สีข้อความ";
  const currentFormSuccessColorValue =
    formSuccessColorMode === "icon"
      ? merged.formSuccessIconColor
      : formSuccessColorMode === "background"
        ? merged.formSuccessBackgroundColor
        : merged.formSuccessLabelColor;
  const currentFormSuccessColorOpacity =
    formSuccessColorMode === "icon"
      ? merged.formSuccessIconColorOpacity
      : formSuccessColorMode === "background"
        ? merged.formSuccessBackgroundColorOpacity
        : merged.formSuccessLabelColorOpacity;
  const currentFormColorValue =
    formColorMode === "placeholder"
      ? merged.formPlaceholderColor
      : formColorMode === "icon"
        ? merged.formIconColor
        : formColorMode === "option"
          ? merged.formOptionColor
          : formColorMode === "optionText"
            ? merged.formOptionTextColor
            : formColorMode === "optionHover"
              ? merged.formOptionHoverColor
              : formColorMode === "optionActive"
                ? merged.formOptionActiveColor
                : formColorMode === "background"
                  ? merged.formBackgroundColor
                  : formColorMode === "border"
                    ? merged.formBorderColor
                    : merged.formLabelColor;
  const currentFormColorOpacity =
    formColorMode === "placeholder"
      ? merged.formPlaceholderColorOpacity
      : formColorMode === "icon"
        ? merged.formIconColorOpacity
        : formColorMode === "option"
          ? merged.formOptionColorOpacity
          : formColorMode === "optionText"
            ? merged.formOptionTextColorOpacity
            : formColorMode === "optionHover"
              ? merged.formOptionHoverColorOpacity
              : formColorMode === "optionActive"
                ? merged.formOptionActiveColorOpacity
                : formColorMode === "background"
                  ? merged.formBackgroundColorOpacity
                  : formColorMode === "border"
                    ? merged.formBorderColorOpacity
                    : merged.formLabelColorOpacity;

  const patch = useCallback(
    (partial) => {
      if (sliderInputActiveRef.current) {
        updateSlider(
          (previous) => buildFormElement({ ...previous, ...partial }),
          {
            controlField: sliderControlFieldRef.current || "slider",
            setData: false,
          }
        );
        return;
      }
      const next = buildFormElement({ ...data, ...partial });
      setDataState(next);
      onUpdate?.(next);
    },
    [data, onUpdate, updateSlider]
  );

  const saveFormInputPreset = () => {
    const trimmedName = String(presetName || "").trim();
    if (!trimmedName) {
      setPresetError("กรุณากรอกชื่อ Preset");
      return;
    }
    const now = Date.now();
    const nextPreset = {
      id: `form-preset-${now}-${Math.round(Math.random() * 1e6)}`,
      name: trimmedName,
      createdAt: now,
      updatedAt: now,
      sourceType: String(merged?.type || ""),
      payload: pickFormInputPresetPayload(merged),
    };
    try {
      const presets = [nextPreset, ...readFormInputPresets()];
      writeFormInputPresets(presets);
      setPresetList(presets);
      setPresetName("");
      setSelectedPresetId(FORM_INPUT_PRESET_NONE);
      setPresetDeleteConfirm(false);
      setPresetError("");
      setPresetToast({
        open: true,
        message: "สำเร็จ ..... บันทึก PRESET เรียบร้อยแล้ว",
      });
    } catch {
      setPresetError("บันทึกไม่สำเร็จ");
    }
  };

  const loadFormInputPreset = (presetId) => {
    const nextId = String(presetId || FORM_INPUT_PRESET_NONE);
    setSelectedPresetId(nextId);
    setPresetDeleteConfirm(false);
    setPresetError("");
    if (!nextId || nextId === FORM_INPUT_PRESET_NONE) return;
    const preset = presetList.find((item) => String(item?.id || "") === nextId);
    const payload = preset?.payload;
    if (!payload || typeof payload !== "object") {
      setPresetError("Preset ไม่ถูกต้อง");
      return;
    }
    patch(pickFormInputPresetPayload(payload));
  };

  const deleteSelectedFormInputPreset = () => {
    if (!canDeleteSelectedPreset) return;
    if (!presetDeleteConfirm) {
      setPresetDeleteConfirm(true);
      return;
    }
    try {
      const presets = readFormInputPresets().filter(
        (item) => String(item?.id || "") !== String(selectedPresetId)
      );
      writeFormInputPresets(presets);
      setPresetList(presets);
      setSelectedPresetId(FORM_INPUT_PRESET_NONE);
      setPresetDeleteConfirm(false);
      setPresetError("");
      setPresetToast({
        open: true,
        message: "สำเร็จ ..... ลบ PRESET เรียบร้อยแล้ว",
      });
    } catch {
      setPresetError("ลบไม่สำเร็จ");
      setPresetDeleteConfirm(false);
    }
  };

  return (
    <aside
      className="dash-panel relative flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden border-r border-slate-200 dark:border-white/10"
      onInputCapture={(event) => {
        if (event.target?.type !== "range") return;
        sliderInputActiveRef.current = true;
        sliderControlFieldRef.current =
          event.target.dataset?.perfControl || event.target.name || "slider";
      }}
      onPointerUpCapture={() => {
        if (!sliderInputActiveRef.current) return;
        commitSlider("pointerup");
        sliderInputActiveRef.current = false;
      }}
      onPointerCancelCapture={() => {
        if (!sliderInputActiveRef.current) return;
        commitSlider("pointercancel");
        sliderInputActiveRef.current = false;
      }}
      onKeyUpCapture={(event) => {
        if (event.target?.type !== "range" || !sliderInputActiveRef.current) return;
        commitSlider("keyboard");
        sliderInputActiveRef.current = false;
      }}
      onBlurCapture={(event) => {
        if (event.target?.type !== "range" || !sliderInputActiveRef.current) return;
        commitSlider("blur");
        sliderInputActiveRef.current = false;
      }}
    >
      <div className="shrink-0 px-6 pt-5 pb-3 flex items-center justify-between dash-panel-header bg-gray-100 dark:bg-slate-800/60">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 font-bold tracking-wide">
            {`ตั้งค่า ${panelTypeLabel}`}
          </span>
          <span
            className="inline-flex max-w-[15ch] shrink-0 items-center overflow-hidden rounded-md border border-[#333333] bg-[#333333] px-2 py-0.5 text-[11px] font-mono font-bold leading-none text-white tabular-nums"
            title={panelIdFull}
          >
            <span className="block overflow-hidden text-ellipsis whitespace-nowrap">
              {panelIdFull}
            </span>
          </span>
        </div>
        <button
          type="button"
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-white/70"
          onClick={() => close?.(null, null, null)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain px-4 pb-14 w-full">
        <ul className="mt-4 pl-1 space-y-5">
          {merged.type === "frmSelect" ? (
            <li>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  title={
                    isSelectInFormula
                      ? "ใช้อยู่ในสูตรคำนวณ — ลบออกจากสูตรก่อน"
                      : isSelectInCalculation
                        ? "ใช้อยู่ในการคำนวณ — ล้างค่าการคำนวณก่อน"
                        : "ตั้งค่าความสัมพันธ์"
                  }
                  disabled={isSelectInCalculation || isSelectInFormula}
                  onClick={() => {
                    if (isSelectInCalculation || isSelectInFormula) return;
                    setConditionalOpen(true);
                  }}
                  className="inline-flex h-[34px] w-full items-center justify-center rounded-md px-1.5 text-[11px] font-semibold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                  style={{
                    background: "var(--dash-panel-btn-group-active, #333333)",
                    color: "var(--dash-panel-btn-group-active-text, #ffffff)",
                  }}
                >
                  ความสัมพันธ์
                </button>
                <button
                  type="button"
                  title={
                    isSelectInFormula
                      ? "ใช้อยู่ในสูตรคำนวณ — ลบออกจากสูตรก่อน"
                      : isSelectInConditional
                        ? "ใช้อยู่ใน Conditional — ล้างค่า Conditional ก่อน"
                        : "ตั้งค่าการคำนวณ"
                  }
                  disabled={isSelectInConditional || isSelectInFormula}
                  onClick={() => {
                    if (isSelectInConditional || isSelectInFormula) return;
                    setCalculationOpen(true);
                  }}
                  className="inline-flex h-[34px] w-full items-center justify-center rounded-md px-1.5 text-[11px] font-semibold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                  style={{
                    background: "var(--dash-panel-btn-group-active, #333333)",
                    color: "var(--dash-panel-btn-group-active-text, #ffffff)",
                  }}
                >
                  การคำนวณ
                </button>
                <button
                  type="button"
                  title={
                    canOpenFormula
                      ? "ตั้งค่าสูตรคำนวณ"
                      : "เปิดกำหนดค่าและกรอกค่าตัวเลือกก่อน"
                  }
                  disabled={!canOpenFormula}
                  onClick={() => {
                    if (!canOpenFormula) return;
                    setFormulaOpen(true);
                  }}
                  className="inline-flex h-[34px] w-full items-center justify-center rounded-md px-1.5 text-[11px] font-semibold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                  style={{
                    background: "var(--dash-panel-btn-group-active, #333333)",
                    color: "var(--dash-panel-btn-group-active-text, #ffffff)",
                  }}
                >
                  สร้างสูตรคำนวณ
                </button>
              </div>
            </li>
          ) : null}
          {(merged.type === "frmNum" || merged.type === "frmSum") && (
            <li>
              <div className="mb-2 flex items-center gap-2">
                <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                  เลือกชื่อ
                </span>
                <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                {merged.type === "frmSum" ? (
                  <div className="shrink-0 [&_.MuiTypography-root]:mb-0 [&_.MuiTypography-root]:flex-none">
                    <MainLabel
                      label="ปัดเศษ"
                      noLine
                      mb={0}
                      color="#333333"
                      checked={merged.formSumRound === true}
                      handleSwitch={(event) =>
                        patch({ formSumRound: event.target.checked })
                      }
                    />
                  </div>
                ) : null}
              </div>
              {normalizedCalculations.length === 0 ? (
                <div className="rounded-md border border-dashed px-3 py-4 text-center text-[12px] text-slate-500 dark:border-white/10 dark:text-white/50">
                  ยังไม่มีสูตร — เปิดปุ่มการคำนวณหรือสูตรคำนวณจาก Select เพื่อสร้างก่อน
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {(() => {
                    const sumBindings =
                      merged.type === "frmSum"
                        ? normalizeSumCalculationBindings(merged)
                        : null;
                    const sumSelectedFormula =
                      merged.type === "frmSum" && sumBindings
                        ? sumBindings.calculationIds
                            .map((id, i) =>
                              resolveCalculation(
                                normalizedCalculations,
                                id,
                                sumBindings.calculationNames[i]
                              )
                            )
                            .find((item) => item?.kind === CALC_KIND_FORMULA) ||
                          null
                        : null;
                    return normalizedCalculations.map((calcItem) => {
                    const checked =
                      merged.type === "frmSum"
                        ? sumBindings.calculationIds.includes(calcItem.id) ||
                          sumBindings.calculationNames.includes(calcItem.name)
                        : merged.calculationId === calcItem.id ||
                          (!merged.calculationId &&
                            String(merged.calculationName || "").trim() ===
                              calcItem.name);
                    // เลือกสูตรคำนวณแล้ว — ชื่ออื่นกดไม่ได้ (ยกเลิกสูตรก่อน)
                    const lockedByFormula =
                      merged.type === "frmSum" &&
                      Boolean(sumSelectedFormula) &&
                      sumSelectedFormula.id !== calcItem.id;
                    return (
                      <button
                        key={calcItem.id}
                        type="button"
                        disabled={lockedByFormula}
                        title={
                          lockedByFormula
                            ? "เลือกสูตรคำนวณแล้ว — ยกเลิกสูตรก่อนเพื่อเลือกชื่ออื่น"
                            : undefined
                        }
                        onClick={() => {
                          if (lockedByFormula) return;
                          if (merged.type === "frmSum") {
                            const current =
                              normalizeSumCalculationBindings(merged);
                            let ids = [...current.calculationIds];
                            let names = [...current.calculationNames];
                            const index = ids.findIndex(
                              (id, i) =>
                                id === calcItem.id ||
                                (!id && names[i] === calcItem.name)
                            );
                            const isFormula =
                              calcItem.kind === CALC_KIND_FORMULA;
                            if (index >= 0) {
                              ids.splice(index, 1);
                              names.splice(index, 1);
                            } else if (isFormula) {
                              // สูตรคำนวณ — เลือกได้แค่ 1 และไม่รวมชื่ออื่น
                              ids = [calcItem.id];
                              names = [calcItem.name];
                            } else {
                              ids.push(calcItem.id);
                              names.push(calcItem.name);
                            }
                            patch({
                              calculationIds: ids,
                              calculationNames: names,
                              calculationId: ids[0] || "",
                              calculationName: names[0] || "",
                            });
                            return;
                          }
                          if (checked) {
                            patch({ calculationId: "", calculationName: "" });
                            return;
                          }
                          patch({
                            calculationId: calcItem.id,
                            calculationName: calcItem.name,
                          });
                        }}
                        className="relative flex h-[36px] items-center gap-2 rounded-md border px-2.5 text-left transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                        style={{
                          background: checked
                            ? "color-mix(in srgb, var(--dash-panel-btn-group-active, #333333) 12%, transparent)"
                            : "var(--dash-panel-btn-group-inactive, #ffffff)",
                          borderColor: checked
                            ? "color-mix(in srgb, var(--dash-panel-btn-group-active, #333333) 50%, transparent)"
                            : "var(--dash-panel-btn-group-border, #e2e8f0)",
                          color: "var(--dash-panel-heading, #0f172a)",
                        }}
                      >
                        <span
                          className="inline-flex size-[18px] shrink-0 items-center justify-center rounded-[4px] border-[1.5px]"
                          style={{
                            borderColor: checked
                              ? "var(--dash-panel-btn-group-active, #333333)"
                              : "var(--dash-panel-btn-group-border, #e2e8f0)",
                            background: checked
                              ? "var(--dash-panel-btn-group-active, #333333)"
                              : "transparent",
                          }}
                          aria-hidden
                        >
                          {checked ? (
                            <Check
                              size={12}
                              strokeWidth={3}
                              style={{
                                color:
                                  "var(--dash-panel-btn-group-active-text, #ffffff)",
                              }}
                            />
                          ) : null}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-[12px] font-semibold">
                          {calcItem.name}
                        </span>
                      </button>
                    );
                    });
                  })()}
                </div>
              )}
            </li>
          )}
          {!hideLayoutSection && (
            <li>
              <div className="mb-2 flex items-center gap-2">
                <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                  รูปแบบการจัดวาง
                </span>
                <div className="dash-heading-rule min-w-0 flex-1 border-b" />
              </div>
              <ButtonGroup variant="outlined" fullWidth sx={LAYOUT_GROUP_ROOT_SX}>
                {FORM_LAYOUT_COLUMN_OPTIONS.map(({ value, label }) => {
                  const selected = normalizeFormLayoutColumns(merged.formLayoutColumns, 1) === value;
                  return (
                    <Button
                      key={value}
                      color="inherit"
                      sx={layoutGroupButtonSx(selected, textColor)}
                      onClick={() => patch({ formLayoutColumns: value })}
                    >
                      <span className="text-[11px] leading-tight">{label}</span>
                    </Button>
                  );
                })}
              </ButtonGroup>
            </li>
          )}
          <li>
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-8">
                <MainLabel label="หัวข้อ" />
                {FORM_TYPES_WITH_LABEL_ICON.has(merged.type) ? (
                  <div className="mt-1 flex items-stretch gap-2">
                    <FormIconPickerButton
                      header="ไอคอนหน้าหัวข้อ"
                      ariaLabel="เลือกไอคอนหน้าหัวข้อ"
                      icon={labelIconForModal}
                      onChange={(ic) => patch({ labelIcon: ic })}
                      darkColor={textColor || "#0d9488"}
                      darkMode={darkMode}
                    />
                    <div className="relative min-w-0 flex-1">
                      <input
                        type="text"
                        className={`${PANEL_INPUT_CLASS} text-[12px]`}
                        style={PANEL_INPUT_TEXT_STYLE}
                        value={merged.label || ""}
                        onChange={(event) => patch({ label: event.target.value })}
                        placeholder="หัวข้อ"
                      />
                    </div>
                  </div>
                ) : (
                  <input
                    type="text"
                    className={`${PANEL_INPUT_CLASS} text-[12px]`}
                    style={PANEL_INPUT_TEXT_STYLE}
                    value={merged.label || ""}
                    onChange={(event) => patch({ label: event.target.value })}
                    placeholder="หัวข้อ"
                  />
                )}
              </div>
              <div className="col-span-4 min-w-0">
                <div className="mb-2 flex items-center gap-1">
                  <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                    ขนาดข้อความ
                  </span>
                  <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                </div>
                <NumericStepper
                  value={clampLabelFontSize(merged.formLabelFontSize, 12)}
                  min={10}
                  max={36}
                  decLabel="ลดขนาดข้อความ"
                  incLabel="เพิ่มขนาดข้อความ"
                  onChange={(nextSize) => patch({ formLabelFontSize: nextSize })}
                />
              </div>

              {FORM_INPUT_TYPES_WITH_PLACEHOLDER.has(merged.type) && (
                <div className="col-span-8 mt-2">
                  <MainLabel label={placeholderFieldLabel} />
                  <input
                    type="text"
                    inputMode={
                      merged.type === "frmInput" && merged.formValidationType === "tel"
                        ? "numeric"
                        : undefined
                    }
                    className={`${PANEL_INPUT_CLASS} text-[12px]`}
                    style={PANEL_INPUT_TEXT_STYLE}
                    value={merged.placeholder || ""}
                    onChange={(event) => {
                      const nextValue =
                        merged.type === "frmInput" && merged.formValidationType === "tel"
                          ? formatThaiPhoneDisplay(event.target.value)
                          : event.target.value;
                      patch({ placeholder: nextValue });
                    }}
                    placeholder={
                      merged.type === "frmInput" && merged.formValidationType === "tel"
                        ? DEFAULT_TEL_PLACEHOLDER
                        : placeholderFieldLabel
                    }
                  />
                </div>
              )}
              {FORM_INPUT_TYPES_WITH_PLACEHOLDER.has(merged.type) && (
                <div className="col-span-4 min-w-0 mt-2">
                  <div className="mb-2 flex items-center gap-1">
                    <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                      ขนาดข้อความ
                    </span>
                    <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                  </div>
                  <NumericStepper
                    value={clampLabelFontSize(merged.formPlaceholderFontSize, 12)}
                    min={10}
                    max={36}
                    decLabel={`ลดขนาด${placeholderFieldLabel}`}
                    incLabel={`เพิ่มขนาด${placeholderFieldLabel}`}
                    onChange={(nextSize) => patch({ formPlaceholderFontSize: nextSize })}
                  />
                </div>
              )}
            </div>
          </li>

          {merged.type === "frmTextarea" && (
            <li>
              <div className="mb-2 flex items-center gap-2">
                <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                  ความสูง
                </span>
                <span className="shrink-0 text-[12px] font-medium tabular-nums text-slate-500 dark:text-slate-400">
                  {merged.rows}
                </span>
                <div className="dash-heading-rule min-w-0 flex-1 border-b" />
              </div>
              <div className="px-0.5">
                <Range
                  controlLabel="Textarea rows"
                  min={TEXTAREA_ROWS_MIN}
                  max={TEXTAREA_ROWS_MAX}
                  step={1}
                  value={merged.rows}
                  handleChange={(event) => {
                    const nextRows = Number(event.target.value);
                    patch({
                      rows: Number.isFinite(nextRows)
                        ? Math.max(
                            TEXTAREA_ROWS_MIN,
                            Math.min(TEXTAREA_ROWS_MAX, Math.round(nextRows))
                          )
                        : 4,
                    });
                  }}
                  pos={
                    ((Number(merged.rows) - TEXTAREA_ROWS_MIN) /
                      (TEXTAREA_ROWS_MAX - TEXTAREA_ROWS_MIN)) *
                    100
                  }
                  color={textColor || "#333333"}
                />
              </div>
            </li>
          )}

          {merged.type === "frmText" && (
            <>
              <li>
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-6 min-w-0">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                        ระยะห่างบน
                      </span>
                      <span className="shrink-0 text-[12px] font-medium tabular-nums text-slate-500 dark:text-slate-400">
                        {merged.formTextSpacingTop}
                      </span>
                      <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                    </div>
                    <div className="px-0.5">
                      <Range
                        controlLabel="Text spacing top"
                        min={TEXT_SPACING_MIN}
                        max={TEXT_SPACING_MAX}
                        step={1}
                        value={merged.formTextSpacingTop}
                        handleChange={(event) => {
                          const next = Number(event.target.value);
                          patch({
                            formTextSpacingTop: Number.isFinite(next)
                              ? Math.max(
                                  TEXT_SPACING_MIN,
                                  Math.min(TEXT_SPACING_MAX, Math.round(next))
                                )
                              : 0,
                          });
                        }}
                        pos={
                          ((Number(merged.formTextSpacingTop) - TEXT_SPACING_MIN) /
                            (TEXT_SPACING_MAX - TEXT_SPACING_MIN)) *
                          100
                        }
                        color={textColor || "#333333"}
                      />
                    </div>
                  </div>
                  <div className="col-span-6 min-w-0">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                        ระยะห่างล่าง
                      </span>
                      <span className="shrink-0 text-[12px] font-medium tabular-nums text-slate-500 dark:text-slate-400">
                        {merged.formTextSpacingBottom}
                      </span>
                      <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                    </div>
                    <div className="px-0.5">
                      <Range
                        controlLabel="Text spacing bottom"
                        min={TEXT_SPACING_MIN}
                        max={TEXT_SPACING_MAX}
                        step={1}
                        value={merged.formTextSpacingBottom}
                        handleChange={(event) => {
                          const next = Number(event.target.value);
                          patch({
                            formTextSpacingBottom: Number.isFinite(next)
                              ? Math.max(
                                  TEXT_SPACING_MIN,
                                  Math.min(TEXT_SPACING_MAX, Math.round(next))
                                )
                              : 0,
                          });
                        }}
                        pos={
                          ((Number(merged.formTextSpacingBottom) - TEXT_SPACING_MIN) /
                            (TEXT_SPACING_MAX - TEXT_SPACING_MIN)) *
                          100
                        }
                        color={textColor || "#333333"}
                      />
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <MainLabel
                  label="เส้นคั่น"
                  color="#333333"
                  checked={merged.formTextDivider === true}
                  handleSwitch={(event) =>
                    patch({ formTextDivider: event.target.checked })
                  }
                />
                {merged.formTextDivider === true && (
                  <div className="mt-2">
                    <ButtonGroup variant="outlined" fullWidth sx={LAYOUT_GROUP_ROOT_SX}>
                      {TEXT_DIVIDER_STYLE_OPTIONS.map(({ value, label }) => {
                        const selected = merged.formTextDividerStyle === value;
                        return (
                          <Button
                            key={value}
                            color="inherit"
                            sx={layoutGroupButtonSx(selected, textColor)}
                            onClick={() => patch({ formTextDividerStyle: value })}
                          >
                            <span className="text-[11px] leading-tight">{label}</span>
                          </Button>
                        );
                      })}
                    </ButtonGroup>
                  </div>
                )}
              </li>
            </>
          )}

          {merged.type !== "frmSubmit" &&
            merged.type !== "frmText" &&
            merged.type !== "frmSum" &&
            merged.type !== "frmSelect" &&
            !FORM_CHOICE_OPTION_TYPES.has(merged.type) && (
            <li>
              <MainLabel
                label="บังคับกรอก"
                color="#333333"
                checked={merged.formRequired === true}
                handleSwitch={(event) => patch({ formRequired: event.target.checked })}
              />
            </li>
          )}

          {FORM_VALIDATION_TYPES.has(merged.type) && (
            <>
              <li>
                <div className="mb-2 flex items-center gap-2">
                  <span className="shrink-0 dash-panel-label text-[13px] font-bold">
                    การตรวจสอบ
                  </span>
                  <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                </div>
                <div className="mt-2">
                  <FormValidationSelectInput
                    value={merged.formValidationType || "none"}
                    onChange={(nextValue) => {
                      const updates = { formValidationType: nextValue };
                      if (nextValue === "tel") {
                        updates.placeholder = DEFAULT_TEL_PLACEHOLDER;
                        updates.formMinLength = 9;
                        updates.formMaxLength = 10;
                      }
                      patch(updates);
                    }}
                    options={VALIDATION_OPTIONS}
                  />
                </div>
              </li>
              <li>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <MainLabel label="ค่าน้อยสุด" mb={0.5} />
                    <input
                      type="number"
                      min={0}
                      className={`${PANEL_INPUT_CLASS} mt-1`}
                      value={merged.formMinLength ?? 0}
                      onChange={(event) => {
                        const nextMin = Math.max(0, Number(event.target.value) || 0);
                        patch({
                          formMinLength: nextMin,
                          formMaxLength: Math.max(nextMin, Number(merged.formMaxLength) || nextMin),
                        });
                      }}
                    />
                  </div>
                  <div>
                    <MainLabel label="ค่ามากสุด" mb={0.5} />
                    <input
                      type="number"
                      min={merged.formMinLength ?? 0}
                      className={`${PANEL_INPUT_CLASS} mt-1`}
                      value={merged.formMaxLength ?? 0}
                      onChange={(event) =>
                        patch({
                          formMaxLength: Math.max(
                            Number(merged.formMinLength) || 0,
                            Number(event.target.value) || 0
                          ),
                        })
                      }
                    />
                  </div>
                </div>
              </li>
            </>
          )}

          {FORM_LIST_OPTION_EDITOR_TYPES.has(merged.type) && (
            <li>
              <div className="mb-2 flex items-center gap-2">
                <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                  ตัวเลือก
                </span>
                <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                {merged.type === "frmSelect" && (
                  <div className="shrink-0 [&_.MuiTypography-root]:mb-0 [&_.MuiTypography-root]:flex-none">
                    <MainLabel
                      label="กำหนดค่า"
                      noLine
                      mb={0}
                      color="#333333"
                      checked={merged.formOptionValuesEnabled === true}
                      handleSwitch={(event) => {
                        const enabled = event.target.checked;
                        const opts = Array.isArray(merged.options) ? merged.options : [];
                        const prev = Array.isArray(merged.optionValues)
                          ? merged.optionValues
                          : [];
                        patch({
                          formOptionValuesEnabled: enabled,
                          optionValues: opts.map((_, index) => {
                            const raw = prev[index];
                            if (raw === "" || raw === ".") return raw ?? "";
                            if (typeof raw === "string" && /^\d*\.?\d*$/.test(raw)) {
                              return raw;
                            }
                            const n = Number(raw);
                            if (!Number.isFinite(n) || n === 0) return "";
                            return String(Math.max(0, n));
                          }),
                        });
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="space-y-1">
                {(Array.isArray(merged.options) ? merged.options : ["Option 1"]).map(
                  (option, optionIndex, list) => {
                    const optionValueRaw = Array.isArray(merged.optionValues)
                      ? merged.optionValues[optionIndex]
                      : "";
                    const optionValueDisplay =
                      optionValueRaw === undefined ||
                      optionValueRaw === null ||
                      optionValueRaw === 0
                        ? ""
                        : String(optionValueRaw);
                    // เอา w-full ออก — ไม่งั้นช่อง value จะดึงกว้างเต็มแถวแล้วบีบช่อง option
                    const optionInputClass = `${PANEL_INPUT_CLASS.replace(
                      "text-[13px]",
                      "text-[12px]"
                    ).replace(/\bw-full\b/, "w-auto")} min-w-0 flex-1`;
                    const valueInputClass = `${PANEL_INPUT_CLASS.replace(
                      "text-[13px]",
                      "text-[12px]"
                    ).replace(/\bw-full\b/, "")} w-[88px] shrink-0`;
                    return (
                      <div
                        key={`frm-choice-option-${merged.type}-${optionIndex}`}
                        className="flex min-w-0 items-stretch gap-2"
                      >
                        <input
                          type="text"
                          className={optionInputClass}
                          style={PANEL_INPUT_TEXT_STYLE}
                          value={option}
                          placeholder={`Option ${optionIndex + 1}`}
                          onChange={(event) => {
                            const nextOptions = [...list];
                            nextOptions[optionIndex] = event.target.value;
                            patch({ options: nextOptions });
                          }}
                        />
                        {merged.type === "frmSelect" &&
                          merged.formOptionValuesEnabled === true && (
                            <input
                              type="text"
                              inputMode="decimal"
                              className={valueInputClass}
                              style={PANEL_INPUT_TEXT_STYLE}
                              value={optionValueDisplay}
                              placeholder="0"
                              aria-label={`ค่า value ตัวเลือก ${optionIndex + 1}`}
                              onChange={(event) => {
                                const raw = String(event.target.value ?? "");
                                if (raw !== "" && !/^\d*\.?\d*$/.test(raw)) return;
                                const opts = Array.isArray(merged.options)
                                  ? merged.options
                                  : list;
                                const prev = Array.isArray(merged.optionValues)
                                  ? [...merged.optionValues]
                                  : [];
                                while (prev.length < opts.length) prev.push("");
                                prev[optionIndex] = raw;
                                patch({
                                  optionValues: prev.slice(0, opts.length),
                                });
                              }}
                            />
                          )}
                        <button
                          type="button"
                          title="ลบตัวเลือก"
                          aria-label={`ลบตัวเลือก ${optionIndex + 1}`}
                          disabled={list.length <= 1}
                          className="inline-flex dash-input w-10 shrink-0 items-center justify-center self-stretch rounded-lg border text-slate-500 shadow-sm transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-red-500/40 disabled:pointer-events-none disabled:opacity-35 dark:text-slate-400 dark:hover:border-red-500/40 dark:hover:bg-red-950/45 dark:hover:text-red-400"
                          onClick={() => {
                            if (list.length <= 1) return;
                            const nextOptions = list.filter(
                              (_, index) => index !== optionIndex
                            );
                            const nextValues = Array.isArray(merged.optionValues)
                              ? merged.optionValues.filter(
                                  (_, index) => index !== optionIndex
                                )
                              : [];
                            patch(
                              merged.type === "frmSelect"
                                ? {
                                    options: nextOptions,
                                    optionValues: nextValues,
                                  }
                                : { options: nextOptions }
                            );
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                        </button>
                      </div>
                    );
                  }
                )}
              </div>
              <div className="mt-3 grid grid-cols-12 items-end gap-2">
                <div className="col-span-8">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                      จำนวนตัวเลือก
                    </span>
                    <span className="shrink-0 text-[12px] font-medium tabular-nums text-slate-500 dark:text-slate-400">
                      {Array.isArray(merged.options) ? merged.options.length : 1}
                    </span>
                    <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                  </div>
                  <button
                    type="button"
                    className="inline-flex h-[34px] w-full items-center justify-center gap-1.5 rounded-md px-3 text-[12px] font-medium transition hover:opacity-90"
                    style={{
                      background: "var(--dash-panel-btn-group-active, #333333)",
                      color: "var(--dash-panel-btn-group-active-text, #ffffff)",
                    }}
                    onClick={() => {
                      const current = Array.isArray(merged.options) ? merged.options : [];
                      const nextOptions = [...current, `Option ${current.length + 1}`];
                      if (merged.type === "frmSelect") {
                        const prev = Array.isArray(merged.optionValues)
                          ? [...merged.optionValues]
                          : [];
                        while (prev.length < current.length) prev.push("");
                        patch({
                          options: nextOptions,
                          optionValues: [...prev.slice(0, current.length), ""],
                        });
                        return;
                      }
                      patch({ options: nextOptions });
                    }}
                  >
                    <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                    เพิ่มตัวเลือก
                  </button>
                </div>
                <div className="col-span-4 min-w-0">
                  <div className="mb-2 flex items-center gap-1">
                    <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                      ขนาดข้อความ
                    </span>
                    <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                  </div>
                  <NumericStepper
                    value={clampLabelFontSize(merged.formPlaceholderFontSize, 12)}
                    min={10}
                    max={36}
                    decLabel="ลดขนาดข้อความตัวเลือก"
                    incLabel="เพิ่มขนาดข้อความตัวเลือก"
                    onChange={(nextSize) =>
                      patch({ formPlaceholderFontSize: nextSize })
                    }
                  />
                </div>
              </div>
            </li>
          )}
          <li>
            <div
              className={`${
                formColorModeOptions.length > 1 ? "mb-2" : "mb-0.5"
              } flex items-center gap-2`}
            >
              <span className="shrink-0 dash-panel-label text-[13px] font-bold">
                {formColorSectionTitle}
              </span>
              <div className="dash-heading-rule min-w-0 flex-1 border-b" />
            </div>
            {formColorModeOptions.length > 1 && (
              <FormColorSelectLine
                prev={() => cycleFormColorMode(-1)}
                next={() => cycleFormColorMode(1)}
                value={formColorModeLabel}
              />
            )}
            <div
              className={`${
                formColorModeOptions.length > 1 ? "mt-2" : ""
              } dash-card w-full rounded-md bg-white px-[0px] pb-[5px] pt-[2px] dark:bg-zinc-800`}
            >
              <div className="px-[5px] pb-2">
                <Range
                  controlLabel={`Form ${formColorMode} opacity`}
                  min={0}
                  max={255}
                  step={1}
                  value={currentFormColorOpacity}
                  handleChange={(event) => {
                    const v = clampOpacity(event.target.value, 255);
                    if (formColorMode === "placeholder") {
                      patch({ formPlaceholderColorOpacity: v });
                    } else if (formColorMode === "icon") {
                      patch({ formIconColorOpacity: v });
                    } else if (formColorMode === "option") {
                      patch({ formOptionColorOpacity: v });
                    } else if (formColorMode === "optionText") {
                      patch({ formOptionTextColorOpacity: v });
                    } else if (formColorMode === "optionHover") {
                      patch({ formOptionHoverColorOpacity: v });
                    } else if (formColorMode === "optionActive") {
                      patch({ formOptionActiveColorOpacity: v });
                    } else if (formColorMode === "background") {
                      patch({ formBackgroundColorOpacity: v });
                    } else if (formColorMode === "border") {
                      patch({ formBorderColorOpacity: v });
                    } else {
                      patch({ formLabelColorOpacity: v });
                    }
                  }}
                  pos={(currentFormColorOpacity / 255) * 100}
                  color={textColor || "#333333"}
                />
              </div>
              <div className="grid grid-cols-10 place-items-center gap-x-0 gap-y-[6px] px-[5px] pb-0">
                {allColors.map((color, i) => {
                  const bgColor =
                    typeof color === "string" ? color : theme?.[color.type]?.[color.index];
                  if (bgColor == null) return null;
                  const selected = chipSelected(currentFormColorValue, color);
                  return (
                    <div key={`form-color-${String(bgColor)}-${i}`}>
                      <button
                        type="button"
                        className="flex size-[25px] items-center justify-center rounded-full border border-slate-200 dark:border-white/15"
                        style={{ backgroundColor: bgColor }}
                        onClick={() => {
                          if (formColorMode === "placeholder") {
                            patch({ formPlaceholderColor: color });
                          } else if (formColorMode === "icon") {
                            patch({ formIconColor: color });
                          } else if (formColorMode === "option") {
                            patch({ formOptionColor: color });
                          } else if (formColorMode === "optionText") {
                            patch({ formOptionTextColor: color });
                          } else if (formColorMode === "optionHover") {
                            patch({ formOptionHoverColor: color });
                          } else if (formColorMode === "optionActive") {
                            patch({ formOptionActiveColor: color });
                          } else if (formColorMode === "background") {
                            patch({ formBackgroundColor: color });
                          } else if (formColorMode === "border") {
                            patch({ formBorderColor: color });
                          } else {
                            patch({ formLabelColor: color });
                          }
                        }}
                        aria-label={`เลือกสี ${bgColor}`}
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
          </li>

          {merged.type === "frmSubmit" && (
            <>
              <li>
                <MainLabel
                  label="ส่งข้อความสำเร็จ"
                  color="#333333"
                  mb="10px"
                  checked={merged.formSuccessPreview === true}
                  typography="ตัวอย่าง"
                  handleSwitch={(event) =>
                    patch({ formSuccessPreview: event.target.checked })
                  }
                />
                <div className="flex items-stretch gap-2">
                  <FormIconPickerButton
                    header="ไอคอนข้อความสำเร็จ"
                    ariaLabel="เลือกไอคอนข้อความสำเร็จ"
                    icon={successIconForModal}
                    onChange={(ic) => patch({ formSuccessIcon: ic })}
                    darkColor={textColor || "#0d9488"}
                    darkMode={darkMode}
                  />
                  <input
                    type="text"
                    className={`${PANEL_INPUT_CLASS} min-w-0 flex-1 text-[12px]`}
                    style={PANEL_INPUT_TEXT_STYLE}
                    value={merged.formSuccessMessage || ""}
                    onChange={(event) =>
                      patch({ formSuccessMessage: event.target.value })
                    }
                    placeholder={DEFAULT_FORM_SUCCESS_MESSAGE}
                  />
                </div>
              </li>
              <li>
                <div className="mb-2 flex items-center gap-2">
                  <span className="shrink-0 dash-panel-label text-[13px] font-bold">
                    สีข้อความ ไอคอน สีพื้นหลัง
                  </span>
                  <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                </div>
                <FormColorSelectLine
                  prev={() => cycleFormSuccessColorMode(-1)}
                  next={() => cycleFormSuccessColorMode(1)}
                  value={formSuccessColorModeLabel}
                />
                <div className="mt-2 dash-card w-full rounded-md bg-white px-[0px] pb-[5px] pt-[2px] dark:bg-zinc-800">
                  <div className="px-[5px] pb-2">
                    <Range
                      controlLabel={`Success ${formSuccessColorMode} opacity`}
                      min={0}
                      max={255}
                      step={1}
                      value={currentFormSuccessColorOpacity}
                      handleChange={(event) => {
                        const v = clampOpacity(event.target.value, 255);
                        if (formSuccessColorMode === "icon") {
                          patch({ formSuccessIconColorOpacity: v });
                        } else if (formSuccessColorMode === "background") {
                          patch({ formSuccessBackgroundColorOpacity: v });
                        } else {
                          patch({ formSuccessLabelColorOpacity: v });
                        }
                      }}
                      pos={(currentFormSuccessColorOpacity / 255) * 100}
                      color={textColor || "#333333"}
                    />
                  </div>
                  <div className="grid grid-cols-10 place-items-center gap-x-0 gap-y-[6px] px-[5px] pb-0">
                    {allColors.map((color, i) => {
                      const bgColor =
                        typeof color === "string"
                          ? color
                          : theme?.[color.type]?.[color.index];
                      if (bgColor == null) return null;
                      const selected = chipSelected(currentFormSuccessColorValue, color);
                      return (
                        <div key={`form-success-color-${String(bgColor)}-${i}`}>
                          <button
                            type="button"
                            className="flex size-[25px] items-center justify-center rounded-full border border-slate-200 dark:border-white/15"
                            style={{ backgroundColor: bgColor }}
                            onClick={() => {
                              if (formSuccessColorMode === "icon") {
                                patch({ formSuccessIconColor: color });
                              } else if (formSuccessColorMode === "background") {
                                patch({ formSuccessBackgroundColor: color });
                              } else {
                                patch({ formSuccessLabelColor: color });
                              }
                            }}
                            aria-label={`เลือกสี ${bgColor}`}
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
              </li>
            </>
          )}

          {supportsInputPreset && (
            <li>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 min-w-0">
                  <MainLabel label="บันทึก Preset" mb="10px" />
                  <div className="flex items-stretch gap-1.5">
                    <input
                      type="text"
                      className={`${PANEL_INPUT_CLASS} min-w-0 flex-1 text-[12px]`}
                      style={PANEL_INPUT_TEXT_STYLE}
                      value={presetName}
                      onChange={(event) => {
                        setPresetName(event.target.value);
                        if (presetError) setPresetError("");
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          saveFormInputPreset();
                        }
                      }}
                      placeholder="ชื่อ Preset"
                    />
                    <button
                      type="button"
                      className="dash-button inline-flex shrink-0 items-center justify-center rounded-lg px-3 text-[12px] font-semibold transition hover:opacity-90"
                      onClick={saveFormInputPreset}
                    >
                      บันทึก
                    </button>
                  </div>
                </div>
                <div className="col-span-12 min-w-0">
                  <MainLabel label="โหลด Preset" mb="10px" />
                  <div className="flex items-stretch gap-1.5">
                    <div className="min-w-0 flex-1">
                      <FormValidationSelectInput
                        value={selectedPresetId}
                        onChange={loadFormInputPreset}
                        options={presetSelectOptions}
                      />
                    </div>
                    {presetDeleteConfirm && canDeleteSelectedPreset ? (
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          className="inline-flex h-[35px] items-center justify-center rounded-lg border border-slate-200 bg-white px-2 text-[11px] text-slate-500 transition hover:bg-slate-50 dark:border-white/10 dark:bg-zinc-800 dark:text-white/70 dark:hover:bg-white/10"
                          onClick={() => setPresetDeleteConfirm(false)}
                        >
                          ยกเลิก
                        </button>
                        <button
                          type="button"
                          aria-label="ยืนยันลบ Preset"
                          title="ยืนยันลบ Preset"
                          className="inline-flex h-[35px] w-[35px] items-center justify-center rounded-lg border border-[#b81c1c] bg-[#b81c1c] text-white transition hover:bg-[#a61919]"
                          onClick={deleteSelectedFormInputPreset}
                        >
                          <Trash2 className="size-3.5" strokeWidth={2} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        aria-label="ลบ Preset"
                        title={
                          canDeleteSelectedPreset
                            ? "ลบ Preset ที่เลือก"
                            : "เลือก Preset ก่อนลบ"
                        }
                        disabled={!canDeleteSelectedPreset}
                        className="inline-flex h-[35px] w-[35px] shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:pointer-events-none disabled:opacity-35 dark:border-white/10 dark:bg-zinc-800 dark:text-white/50 dark:hover:border-red-500/40 dark:hover:bg-red-950/45 dark:hover:text-red-400"
                        onClick={deleteSelectedFormInputPreset}
                      >
                        <Trash2 className="size-3.5" strokeWidth={2} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              {presetError ? (
                <div className="mt-1.5 text-[12px] text-red-600">{presetError}</div>
              ) : null}
            </li>
          )}
        </ul>
      </nav>
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        open={Boolean(presetToast.open)}
        autoHideDuration={2400}
        onClose={() => setPresetToast({ open: false, message: "" })}
        ContentProps={{ elevation: 0 }}
        message={
          <Box
            component="span"
            sx={{
              display: "flex",
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              py: 0.75,
            }}
          >
            <AlertCircle className="shrink-0" size={20} strokeWidth={2.25} aria-hidden />
            <span>{presetToast.message}</span>
          </Box>
        }
        sx={{
          "& .MuiSnackbarContent-root": {
            backgroundColor: "#05966B",
            color: "#fff",
            fontSize: 13,
            justifyContent: "center",
            alignItems: "center",
            py: 0.75,
            boxShadow: "none",
          },
          "& .MuiSnackbarContent-message": {
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            py: 0.25,
          },
        }}
      />
      {merged.type === "frmSelect" ? (
        <>
          <FormConditionalPanel
            open={conditionalOpen}
            onClose={() => setConditionalOpen(false)}
            currentFieldId={merged.id}
            selectFields={selectFields}
            conditionalChains={conditionalChains}
            onSaveChains={onConditionalChainsChange}
            blockedFieldIds={normalizedCalculations
              .filter((calc) => calc?.kind !== "formula")
              .flatMap((calc) =>
                Array.isArray(calc?.fieldIds) ? calc.fieldIds : []
              )}
            registerFlushHandler={registerFlushHandler}
          />
          <FormCalculationPanel
            open={calculationOpen}
            onClose={() => setCalculationOpen(false)}
            currentFieldId={merged.id}
            selectFields={selectFields}
            calculations={normalizedCalculations}
            onSaveCalculations={onCalculationsChange}
            blockedFieldIds={normalizedConditionalChains.flatMap((chain) =>
              Array.isArray(chain?.fieldIds) ? chain.fieldIds : []
            )}
            registerFlushHandler={registerFlushHandler}
          />
          <FormFormulaPanel
            open={formulaOpen}
            onClose={() => setFormulaOpen(false)}
            currentFieldId={merged.id}
            selectFields={selectFields}
            calculations={normalizedCalculations}
            onSaveCalculations={onCalculationsChange}
            registerFlushHandler={registerFlushHandler}
          />
        </>
      ) : null}
    </aside>
  );
};

export default FormElementOffcanvas;
