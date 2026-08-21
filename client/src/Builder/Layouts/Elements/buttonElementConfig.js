import { alpha } from "@mui/material/styles";
import {
  resolveThemeOrHexColor,
  applyOpacityToCssColor,
} from "./imageAspectConfig";

export const BUTTON_VARIANT_OPTIONS = [
  { value: "contained", label: "ทึบ" },
  { value: "outlined", label: "ขอบ" },
  { value: "text", label: "ลอย" },
];

/** จัดปุ่มในแนวนอนของคอลัมน์ */
export const BUTTON_LAYOUT_ALIGN_OPTIONS = [
  { value: "start", label: "ชิดซ้าย" },
  { value: "center", label: "ตรงกลาง" },
  { value: "end", label: "ชิดขวา" },
];

/** ไอคอนข้างข้อความบนปุ่ม (linkIcon / linkIcon2) — แสดงได้โดยไม่ต้องเปิดลิงก์ URL */
export function isButtonLinkIconDefined(lic) {
  return (
    lic &&
    typeof lic.name === "string" &&
    lic.name.trim() !== "" &&
    lic.type
  );
}

export const BUTTON_STYLE_DEFAULTS = {
  buttonFill: { type: "mainColor", index: 1 },
  buttonLabelColor: "#ffffff",
  /** ปุ่มคู่ (btnG) — สีพื้น/ข้อความปุ่มที่ 2 (กรอบใช้ buttonBorder* ร่วมกับปุ่มที่ 1) */
  button2Fill: { type: "mainColor", index: 0 },
  button2LabelColor: "#ffffff",
  button2FillOpacity: 255,
  button2LabelOpacity: 255,
  buttonFontSize: 14,
  buttonRadius: 8,
  buttonPaddingX: 20,
  buttonPaddingY: 12,
  buttonVariant: "contained",
  buttonLayoutAlign: "start",
  buttonFullWidth: false,
  buttonBold: true,
  buttonBorderWidth: 2,
  buttonBorderColor: { type: "mainColor", index: 1 },
  buttonFillOpacity: 255,
  buttonLabelOpacity: 255,
  buttonBorderOpacity: 255,
  /** ระยะบน/ล่าง (px) รอบบล็อกปุ่ม — เหมือน heading */
  buttonMarginTop: 8,
  buttonMarginBottom: 8,
  /** ข้อความพิเศษซ้าย — ปุ่มชิดขวา */
  buttonSpecialTextEnabled: false,
  buttonSpecialText: "Drag & Drop to Design",
  buttonSpecialTextParagraph: null,
};

/** ข้อความเริ่มต้นเมื่อเปิด «ข้อความพิเศษ» */
export const BUTTON_SPECIAL_TEXT_LABEL = "Drag & Drop to Design";

export function isButtonSpecialTextEnabled(elementData) {
  return mergeButtonStyle(elementData).buttonSpecialTextEnabled === true;
}

export function resolveButtonSpecialTextLabel(elementData) {
  const s = mergeButtonStyle(elementData);
  const raw = s.buttonSpecialText;
  if (typeof raw === "string" && raw.trim() !== "") return raw;
  return BUTTON_SPECIAL_TEXT_LABEL;
}

export function resolveButtonSpecialTextParagraph(elementData) {
  return mergeButtonStyle(elementData).buttonSpecialTextParagraph ?? null;
}

function numOr(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function mergeButtonStyle(elementData) {
  return {
    ...BUTTON_STYLE_DEFAULTS,
    ...(elementData && typeof elementData === "object"
      ? Object.fromEntries(
          Object.entries(elementData).filter(([, v]) => v !== undefined)
        )
      : {}),
  };
}

/** กว้างเต็มคอลัมน์ — อ่านค่าเดียวกับ getButtonMuiSx / แผงปุ่ม */
export function isButtonFullWidthEnabled(elementData) {
  return Boolean(mergeButtonStyle(elementData).buttonFullWidth);
}

/**
 * สีพื้น/ข้อความ/ขอบสำหรับปุ่ม — รองรับธีม { type, index } หรือ hex
 * @param {1|2} [slot=1] — ปุ่มที่ 2 ใช้ button2Fill / button2LabelColor / ความทึบชุดที่ 2; สีกรอบใช้ร่วมกันทุก slot
 */
export function resolveButtonColors(elementData, theme, slot = 1) {
  const s = mergeButtonStyle(elementData);
  const use2 = slot === 2;
  const fillRaw = resolveThemeOrHexColor(
    use2 ? s.button2Fill : s.buttonFill,
    theme
  );
  const labelRaw = resolveThemeOrHexColor(
    use2 ? s.button2LabelColor : s.buttonLabelColor,
    theme
  );
  const borderRaw = resolveThemeOrHexColor(s.buttonBorderColor, theme);
  const fillOp = Number(use2 ? s.button2FillOpacity : s.buttonFillOpacity);
  const fillOpacity255 = Number.isFinite(fillOp)
    ? Math.max(0, Math.min(255, fillOp))
    : 255;
  const labelOp = Number(use2 ? s.button2LabelOpacity : s.buttonLabelOpacity);
  const labelOpacity255 = Number.isFinite(labelOp)
    ? Math.max(0, Math.min(255, labelOp))
    : 255;
  const fill =
    fillRaw != null
      ? applyOpacityToCssColor(fillRaw, fillOpacity255)
      : theme?.mainColor?.[1] ?? "#374151";
  const label =
    labelRaw != null
      ? applyOpacityToCssColor(labelRaw, labelOpacity255)
      : "#ffffff";
  const borderOp = Number(s.buttonBorderOpacity);
  const borderOpacity255 = Number.isFinite(borderOp)
    ? Math.max(0, Math.min(255, borderOp))
    : 255;
  const border =
    borderRaw != null
      ? applyOpacityToCssColor(borderRaw, borderOpacity255)
      : fill;
  return { fill, label, border };
}

/**
 * sx สำหรับ MUI Button บนแคนวาส / พรีวิว
 * @param {string} variant — contained | outlined | text
 */
export function getButtonMuiSx(elementData, theme, variant, slot = 1) {
  const s = mergeButtonStyle(elementData);
  const v = variant || s.buttonVariant || "contained";
  const { fill, label, border } = resolveButtonColors(
    elementData,
    theme,
    slot
  );
  const radius = numOr(s.buttonRadius, BUTTON_STYLE_DEFAULTS.buttonRadius);
  const px = numOr(s.buttonPaddingX, BUTTON_STYLE_DEFAULTS.buttonPaddingX);
  const py = numOr(s.buttonPaddingY, BUTTON_STYLE_DEFAULTS.buttonPaddingY);
  const fs = numOr(s.buttonFontSize, BUTTON_STYLE_DEFAULTS.buttonFontSize);
  const bw = numOr(s.buttonBorderWidth, BUTTON_STYLE_DEFAULTS.buttonBorderWidth);
  const fw = s.buttonBold ? 600 : 500;
  const isDual = elementData?.type === "btnG";
  const isDualOutlined = isDual && v === "outlined";

  const base = {
    marginTop: 0,
    marginBottom: 0,
    boxShadow: "none",
    borderRadius: isDual ? 0 : `${radius}px`,
    fontSize: fs,
    fontWeight: fw,
    py: 0,
    px: `${px}px`,
    minHeight: py * 2 + fs,
    lineHeight: 1.25,
    textTransform: "none",
    width: s.buttonFullWidth ? "100%" : "auto",
    minWidth: s.buttonFullWidth ? "auto" : undefined,
    "&:hover": { boxShadow: "none" },
  };

  if (v === "outlined") {
    return {
      ...base,
      /* กรอบอยู่ที่ ButtonGroup — ตัดมุมปุ่ม; ระยะบน/ล่างมาจาก getButtonOuterContainerSx */
      ...(isDualOutlined ? { borderRadius: 0 } : {}),
      /* ใช้สีพื้นจากแผง (fill + ความทึบ) — ไม่ล็อกเป็นโปร่งใสเพื่อให้ปรับสีพื้นหลังได้ */
      backgroundColor: fill,
      color: label,
      ...(isDualOutlined
        ? {
            border: "none",
            /* ทับ MuiButtonGroup outlined ที่ตั้ง borderRightColor: transparent + สำรอง cascade */
            ...(slot === 1
              ? { borderRight: `${bw}px solid ${border} !important` }
              : {}),
          }
        : {
            borderWidth: bw,
            borderStyle: "solid",
            borderColor: border,
          }),
      "&:hover": {
        ...base["&:hover"],
        backgroundColor: fill,
        filter: "brightness(1.06)",
        ...(isDualOutlined
          ? slot === 1
            ? { borderRight: `${bw}px solid ${border} !important` }
            : {}
          : { borderColor: border }),
      },
    };
  }

  if (v === "text") {
    return {
      ...base,
      backgroundColor: "transparent",
      color: label,
      border: "none",
      "&:hover": {
        ...base["&:hover"],
        backgroundColor: alpha(fill, 0.1),
      },
    };
  }

  return {
    ...base,
    backgroundColor: fill,
    color: label,
    border: "none",
    "&:hover": {
      ...base["&:hover"],
      backgroundColor: fill,
      filter: "brightness(1.06)",
    },
  };
}

export function getButtonMuiVariant(elementData) {
  const s = mergeButtonStyle(elementData);
  const v = s.buttonVariant;
  if (v === "outlined" || v === "text") return v;
  return "contained";
}

export function normalizeButtonLayoutAlign(v) {
  if (v === "start" || v === "center" || v === "end") return v;
  return "start";
}

/** กล่องครอบปุ่มบนแคนวาส — กว้างเต็มคอลัมน์แล้วจัดปุ่มซ้าย/กลาง/ขวา */
export function getButtonOuterContainerSx(elementData) {
  const s = mergeButtonStyle(elementData);
  const mt = numOr(s.buttonMarginTop, BUTTON_STYLE_DEFAULTS.buttonMarginTop);
  const mb = numOr(
    s.buttonMarginBottom,
    BUTTON_STYLE_DEFAULTS.buttonMarginBottom
  );
  if (s.buttonSpecialTextEnabled === true) {
    return {
      width: "100%",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "nowrap",
      columnGap: "12px",
      marginTop: `${mt}px`,
      marginBottom: `${mb}px`,
    };
  }
  const a = normalizeButtonLayoutAlign(s.buttonLayoutAlign);
  const jc =
    a === "start" ? "flex-start" : a === "end" ? "flex-end" : "center";
  return {
    width: "100%",
    display: "flex",
    justifyContent: jc,
    alignItems: "center",
    flexWrap: "nowrap",
    marginTop: `${mt}px`,
    marginBottom: `${mb}px`,
  };
}

/**
 * กรอบนอกรวมสำหรับปุ่มคู่ (btnG) — มุมโค้งอยู่ที่ขอบนอกทั้งกลุ่ม
 * ปุ่มด้านในเป็นเหลี่ยม; แบบขอบมีเส้น buttonBorderWidth รอบนอก (ไม่ซ้ำที่รอยต่อ)
 */
export function getButtonGroupOutlinedFrameSx(elementData, theme) {
  if (elementData?.type !== "btnG") return null;
  const v = getButtonMuiVariant(elementData);
  const s = mergeButtonStyle(elementData);
  const { border } = resolveButtonColors(elementData, theme, 1);
  const radius = numOr(s.buttonRadius, BUTTON_STYLE_DEFAULTS.buttonRadius);
  const bw = numOr(s.buttonBorderWidth, BUTTON_STYLE_DEFAULTS.buttonBorderWidth);
  const isOutlined = v === "outlined";
  return {
    boxSizing: "border-box",
    ...(isOutlined
      ? { border: `${bw}px solid ${border}` }
      : { border: "none" }),
    borderRadius: `${radius}px`,
    overflow: "hidden",
    boxShadow: "none",
    /* ยกเลิก margin ทับซ้อนของ MuiButtonGroup ที่ใช้กับ outlined */
    "& .MuiButtonGroup-grouped": {
      marginLeft: "0 !important",
      borderRadius: "0 !important",
    },
    /*
     * MUI outlined + horizontal: ปุ่มแรกได้ borderRightColor: transparent
     * ต้องทับให้เห็นเส้นแบ่งกลาง (ความหนาเท่า buttonBorderWidth)
     */
    ...(isOutlined
      ? {
          "& .MuiButtonGroup-firstButton": {
            borderRight: `${bw}px solid ${border} !important`,
          },
          "& .MuiButtonGroup-firstButton:hover": {
            borderRight: `${bw}px solid ${border} !important`,
          },
        }
      : {}),
  };
}

function escapeAttrSelector(id) {
  const raw = String(id ?? "");
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(raw);
  }
  return raw.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function queryButtonPreviewNodes(elementId, attr) {
  const id = String(elementId ?? "");
  if (!id) return [];
  return Array.from(
    document.querySelectorAll(`[${attr}="${escapeAttrSelector(id)}"]`)
  );
}

const BUTTON_PREVIEW_BUTTON_PROPS = [
  "font-size",
  "padding-left",
  "padding-right",
  "padding-top",
  "padding-bottom",
  "min-height",
  "border-radius",
  "font-weight",
  "background-color",
  "color",
  "border",
  "border-width",
  "border-style",
  "border-color",
  "border-right",
];

/** Live-drag preview on canvas DOM — avoids React/MUI re-render every tick. */
export function applyButtonCanvasPreview(elementId, nextData, theme) {
  const id = String(elementId ?? "");
  if (!id || typeof document === "undefined") return;
  const s = mergeButtonStyle(nextData);
  const variant = getButtonMuiVariant(nextData);
  const fs = numOr(s.buttonFontSize, BUTTON_STYLE_DEFAULTS.buttonFontSize);
  const py = numOr(s.buttonPaddingY, BUTTON_STYLE_DEFAULTS.buttonPaddingY);
  const px = numOr(s.buttonPaddingX, BUTTON_STYLE_DEFAULTS.buttonPaddingX);
  const radius = numOr(s.buttonRadius, BUTTON_STYLE_DEFAULTS.buttonRadius);
  const bw = numOr(s.buttonBorderWidth, BUTTON_STYLE_DEFAULTS.buttonBorderWidth);
  const mt = numOr(s.buttonMarginTop, BUTTON_STYLE_DEFAULTS.buttonMarginTop);
  const mb = numOr(
    s.buttonMarginBottom,
    BUTTON_STYLE_DEFAULTS.buttonMarginBottom
  );
  const isDual = nextData?.type === "btnG";
  const isDualOutlined = isDual && variant === "outlined";

  const align = normalizeButtonLayoutAlign(s.buttonLayoutAlign);
  const justifyContent =
    s.buttonSpecialTextEnabled === true
      ? "space-between"
      : align === "start"
        ? "flex-start"
        : align === "end"
          ? "flex-end"
          : "center";

  queryButtonPreviewNodes(id, "data-button-wrap-id").forEach((wrap) => {
    wrap.style.marginTop = `${mt}px`;
    wrap.style.marginBottom = `${mb}px`;
    wrap.style.justifyContent = justifyContent;
  });

  queryButtonPreviewNodes(id, "data-button-canvas-id").forEach((btn) => {
    const slot = Number(btn.getAttribute("data-button-slot") || 1) === 2 ? 2 : 1;
    const { fill, label, border } = resolveButtonColors(nextData, theme, slot);
    btn.style.fontSize = `${fs}px`;
    btn.style.paddingLeft = `${px}px`;
    btn.style.paddingRight = `${px}px`;
    btn.style.paddingTop = "0px";
    btn.style.paddingBottom = "0px";
    btn.style.minHeight = `${py * 2 + fs}px`;
    btn.style.fontWeight = s.buttonBold ? "600" : "500";
    if (isDual) {
      btn.style.borderRadius = "0px";
    } else {
      btn.style.borderRadius = `${radius}px`;
    }
    if (variant === "text") {
      btn.style.backgroundColor = "transparent";
      btn.style.color = label;
      btn.style.border = "none";
    } else {
      btn.style.backgroundColor = fill;
      btn.style.color = label;
      if (variant === "outlined" && !isDualOutlined) {
        btn.style.borderWidth = `${bw}px`;
        btn.style.borderStyle = "solid";
        btn.style.borderColor = border;
      }
      if (isDualOutlined && slot === 1) {
        btn.style.borderRight = `${bw}px solid ${border}`;
      }
    }
  });

  queryButtonPreviewNodes(id, "data-button-group-id").forEach((group) => {
    if (isDual) {
      group.style.borderRadius = `${radius}px`;
      group.style.overflow = "hidden";
      if (isDualOutlined) {
        const { border } = resolveButtonColors(nextData, theme, 1);
        group.style.border = `${bw}px solid ${border}`;
      } else {
        group.style.removeProperty("border");
      }
    } else {
      group.style.removeProperty("border");
      group.style.removeProperty("border-radius");
      group.style.removeProperty("overflow");
    }
  });

  queryButtonPreviewNodes(id, "data-button-special-text-id").forEach((node) => {
    node.style.fontSize = `${fs}px`;
    node.querySelectorAll("*").forEach((child) => {
      child.style.fontSize = `${fs}px`;
    });
  });
}

export function clearButtonCanvasPreview(elementId) {
  const id = String(elementId ?? "");
  if (!id || typeof document === "undefined") return;
  queryButtonPreviewNodes(id, "data-button-wrap-id").forEach((wrap) => {
    wrap.style.removeProperty("margin-top");
    wrap.style.removeProperty("margin-bottom");
    wrap.style.removeProperty("justify-content");
  });
  queryButtonPreviewNodes(id, "data-button-canvas-id").forEach((btn) => {
    BUTTON_PREVIEW_BUTTON_PROPS.forEach((prop) =>
      btn.style.removeProperty(prop)
    );
  });
  queryButtonPreviewNodes(id, "data-button-group-id").forEach((group) => {
    group.style.removeProperty("border");
    group.style.removeProperty("border-radius");
    group.style.removeProperty("overflow");
  });
  queryButtonPreviewNodes(id, "data-button-special-text-id").forEach((node) => {
    node.style.removeProperty("font-size");
    node.querySelectorAll("*").forEach((child) => {
      child.style.removeProperty("font-size");
    });
  });
}
