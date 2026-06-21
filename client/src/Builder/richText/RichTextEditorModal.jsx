import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  getDomSelectionRange,
  parseEditorDomToSegments,
  renderSegmentsIntoEditor,
  setDomSelectionRange,
} from "./richTextDomEditor";
import {
  ALIGN_CLASS,
  expandCharRuns,
  materializeFontSizes,
  migrateLabelToParagraph,
  normalizeParagraph,
  SEGMENT_CLASS,
  setParagraphAlign,
  setStyleOnRange,
  stripClassesOnRange,
  toggleClassOnRange,
} from "./richTextParagraphModel";
import { swatchSelectedCheckClassName } from "../Layouts/Elements/swatchCheckClass";
import { THEME_PANEL_BASIC_COLOR_SWATCHES } from "../themePanelBasicColors";
import { setFont } from "../../../function";

/** ล้างเฉพาะ class เน้นข้อความ (ไม่แตะสี / ขนาด / ระยะบรรทัด / ระยะตัวอักษร) */
const EMPHASIS_SEGMENT_CLASSES = [
  SEGMENT_CLASS.bold,
  SEGMENT_CLASS.italic,
  SEGMENT_CLASS.underline,
];

/** สีตอน hover ในโมดัลแก้ไขข้อความ */
const MODAL_HOVER = "#333333";

function isHexColorString(s) {
  return typeof s === "string" && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(s.trim());
}

function normalizeHexForCompare(h) {
  if (typeof h !== "string") return "";
  let t = h.trim();
  if (!t.startsWith("#")) t = `#${t}`;
  if (!isHexColorString(t)) return t.toLowerCase();
  let s = t.slice(1);
  if (s.length === 3) s = s.split("").map((c) => c + c).join("");
  return `#${s.toLowerCase()}`;
}

/**
 * ช่องสีเดียวกับ Element icon (สีพื้นหลัง / ข้อความ / กรอบ + สีพื้นฐาน 4 สี)
 * @returns {(string | { type: string, index: number })[]}
 */
function buildIconStyleColorSlots(theme) {
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
  return [...mc, ...tc, ...oc, ...THEME_PANEL_BASIC_COLOR_SWATCHES];
}

function resolveThemeSwatchBg(theme, slot) {
  const raw =
    typeof slot === "string"
      ? slot
      : theme?.[slot.type]?.[slot.index];
  if (typeof raw !== "string" || !isHexColorString(raw.trim())) return null;
  return normalizeHexForCompare(raw.trim());
}

/** ระยะซ้าย–ขวาเดียวกับคอลัมน์ช่องแก้ไข (กล่อง `px: 2` ด้านล่าง) */
const MODAL_CONTENT_HORIZONTAL_PADDING = 2;

/** หัวโมดัล: แถบจัดรูปแบบ + สีธีม (พื้นเทาเดิม ไม่มีกรอบ) */
const modalHeaderToolbarSx = {
  flexShrink: 0,
  display: "flex",
  flexDirection: "column",
  gap: 1,
  alignItems: "stretch",
  pt: 2.5,
  pb: 1.5,
  px: MODAL_CONTENT_HORIZONTAL_PADDING,
  bgcolor: "rgba(248, 250, 252, 0.95)",
  ".dark &": {
    bgcolor: "rgba(24, 24, 27, 0.75)",
  },
};

const toolbarIconProps = { size: 14, strokeWidth: 2, absoluteStrokeWidth: true };

/** ตัวอักษร T / I / U บนปุ่ม — ตั้งตรง ไม่เอียง ไม่มีเส้นใต้ (กันสไตล์ global ที่ไปกระทบปุ่ม) */
const toolbarLetterIconSx = {
  fontSize: 15,
  fontWeight: 700,
  lineHeight: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "inherit",
  fontFamily:
    'system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  fontStyle: "normal !important",
  fontSynthesis: "none",
  textDecoration: "none !important",
  textDecorationLine: "none !important",
  WebkitTextDecoration: "none !important",
};

const toolbarBtnSx = {
  minWidth: 28,
  minHeight: 28,
  px: 0.35,
  py: 0.35,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 10,
  fontWeight: 500,
  fontStyle: "normal",
  textDecoration: "none",
  textTransform: "none",
  borderRadius: "6px",
  boxShadow: "none !important",
  border: `1px solid rgba(148, 163, 184, 0.45)`,
  color: "#334155",
  bgcolor: "rgba(255, 255, 255, 0.98)",
  "&:hover": {
    boxShadow: "none !important",
    borderColor: MODAL_HOVER,
    bgcolor: "rgba(51, 51, 51, 0.06)",
    color: MODAL_HOVER,
  },
  ".dark &": {
    borderColor: "rgba(255, 255, 255, 0.12)",
    color: "#cbd5e1",
    bgcolor: "rgba(39, 39, 42, 0.95)",
  },
  ".dark &:hover": {
    borderColor: MODAL_HOVER,
    bgcolor: "rgba(250, 250, 250, 0.12)",
    color: MODAL_HOVER,
  },
  '&[aria-pressed="true"]': {
    borderColor: MODAL_HOVER,
    bgcolor: "rgba(51, 51, 51, 0.08)",
    color: MODAL_HOVER,
  },
  '.dark &[aria-pressed="true"]': {
    borderColor: MODAL_HOVER,
    bgcolor: "rgba(250, 250, 250, 0.14)",
    color: MODAL_HOVER,
  },
};

const saveButtonSx = {
  textTransform: "none",
  fontWeight: 600,
  fontSize: 12,
  borderRadius: "8px",
  px: 1.5,
  py: 0.4,
  minHeight: 28,
  boxShadow: "none",
  bgcolor: "#374151",
  color: "#ffffff",
  "&:hover": {
    bgcolor: "#374151",
    color: "#ffffff",
    boxShadow: "none",
    filter: "none",
  },
  "&:active": {
    bgcolor: "#374151",
    color: "#ffffff",
    boxShadow: "none",
  },
};

/** ตัวเลือกขนาดตัวอักษร (px) */
const FONT_SIZE_MIN = 11;
const FONT_SIZE_MAX = 40;
const FONT_SIZE_LIST = Array.from(
  { length: FONT_SIZE_MAX - FONT_SIZE_MIN + 1 },
  (_, i) => FONT_SIZE_MIN + i
);

/** line-height เป็นพิกเซล เก็บใน JSON เป็น string เช่น "24px" */
const LINE_HEIGHT_PX_MIN = 14;
const LINE_HEIGHT_PX_MAX = 72;
const LINE_HEIGHT_PX_LIST = Array.from(
  { length: (LINE_HEIGHT_PX_MAX - LINE_HEIGHT_PX_MIN) / 2 + 1 },
  (_, i) => LINE_HEIGHT_PX_MIN + i * 2
);

/** letter-spacing เป็นพิกเซล 0–20 เท่านั้น เก็บใน JSON เป็น string เช่น "2px" */
const LETTER_SPACING_PX_MIN = 0;
const LETTER_SPACING_PX_MAX = 20;
const LETTER_SPACING_PX_LIST = Array.from(
  { length: LETTER_SPACING_PX_MAX - LETTER_SPACING_PX_MIN + 1 },
  (_, i) => LETTER_SPACING_PX_MIN + i
);

const TOOLTIP_FONT_SIZE = "ขนาด";
const TOOLTIP_LINE_HEIGHT = "ระยะห่างบรรทัด";
const TOOLTIP_LETTER_SPACING = "ระยะห่างตัวอักษร";

const tooltipInModalSlotProps = {
  popper: { disablePortal: true },
};

function nearestFontSizePx(px) {
  const n = Number(px);
  if (!Number.isFinite(n)) return 16;
  return FONT_SIZE_LIST.reduce((best, v) =>
    Math.abs(v - n) < Math.abs(best - n) ? v : best
  );
}

function getInitialFontSizePxFromSource(sourceElement) {
  const direct = Number(sourceElement?.listTextSize);
  if (Number.isFinite(direct)) return nearestFontSizePx(direct);
  const p = sourceElement?.textParagraph;
  if (p && Array.isArray(p.segments)) {
    const seg = p.segments.find(
      (s) =>
        s &&
        typeof s === "object" &&
        s.style &&
        typeof s.style.fontSize === "string"
    );
    if (seg?.style?.fontSize) {
      const px = Number(String(seg.style.fontSize).replace("px", "").trim());
      if (Number.isFinite(px)) return nearestFontSizePx(px);
    }
  }
  return nearestFontSizePx(16);
}

function nearestLineHeightPx(px) {
  const x = Number(px);
  if (!Number.isFinite(x)) return 24;
  return LINE_HEIGHT_PX_LIST.reduce((best, v) =>
    Math.abs(v - x) < Math.abs(best - x) ? v : best
  );
}

function nearestLetterSpacingPx(px) {
  const x = Number(px);
  if (!Number.isFinite(x)) return 0;
  return LETTER_SPACING_PX_LIST.reduce((best, v) =>
    Math.abs(v - x) < Math.abs(best - x) ? v : best
  );
}

function parsePxNumber(value) {
  if (typeof value !== "string") return null;
  const t = value.trim().toLowerCase();
  if (!t.endsWith("px")) return null;
  const n = Number(t.slice(0, -2));
  return Number.isFinite(n) ? n : null;
}

function parseLineHeightPx(value, fontSizePx, fallbackPx) {
  const px = parsePxNumber(value);
  if (px != null) return nearestLineHeightPx(px);
  if (typeof value === "string") {
    const n = Number(value.trim());
    if (Number.isFinite(n) && n > 0) {
      return nearestLineHeightPx(n * fontSizePx);
    }
  }
  return nearestLineHeightPx(fallbackPx);
}

function parseLetterSpacingPx(value, fontSizePx, fallbackPx) {
  const px = parsePxNumber(value);
  if (px != null) return nearestLetterSpacingPx(px);
  if (typeof value === "string") {
    const t = value.trim().toLowerCase().replace(/\s/g, "");
    if (t.endsWith("em")) {
      const n = Number(t.slice(0, -2));
      if (Number.isFinite(n)) {
        return nearestLetterSpacingPx(n * fontSizePx);
      }
    }
  }
  return nearestLetterSpacingPx(fallbackPx);
}

function getToolbarStateFromRange(paragraph, range, fallback) {
  const runs = expandCharRuns(normalizeParagraph(paragraph).segments);
  if (!runs.length) return fallback;
  const maxIndex = runs.length - 1;
  const pickIndex = Math.max(
    0,
    Math.min(
      maxIndex,
      range.start === range.end
        ? Math.max(0, range.start - 1)
        : range.start
    )
  );
  const run = runs[pickIndex];
  const classes = Array.isArray(run.classes) ? run.classes : [];
  const style = run.style && typeof run.style === "object" ? run.style : {};
  const fontSizePx = nearestFontSizePx(
    parsePxNumber(style.fontSize) ?? fallback.fontSizePx
  );
  const lineHeightPx = parseLineHeightPx(
    style.lineHeight,
    fontSizePx,
    fallback.lineHeightPx
  );
  const letterSpacingPx = parseLetterSpacingPx(
    style.letterSpacing,
    fontSizePx,
    fallback.letterSpacingPx
  );
  const color = typeof style.color === "string" && style.color.trim()
    ? style.color.trim()
    : fallback.color;
  return {
    fontSizePx,
    lineHeightPx,
    letterSpacingPx,
    color,
    bold: classes.includes(SEGMENT_CLASS.bold),
    italic: classes.includes(SEGMENT_CLASS.italic),
    underline: classes.includes(SEGMENT_CLASS.underline),
  };
}


/**
 * Reusable rich paragraph editor (no third-party rich-text library).
 * Persists structured JSON only — DOM is rebuilt from segments after toolbar actions.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {object} [props.sourceElement] — layout element `{ id, type, label?, textParagraph? }`
 * @param {string} [props.snapshotKey] — stable key (e.g. JSON of id + textParagraph) to reload when opening another block
 * @param {(next: import('./richTextParagraphModel').RichTextParagraph) => void} props.onSave
 * @param {{
 *   mainColor?: string[],
 *   textColor?: string[],
 *   otherColor?: string[],
 *   text?: { value?: string },
 * }} [props.theme] — สีธีม + คลาสฟอนต์ข้อความ (`text.value`) สำหรับช่องแก้ไขและคำแนะนำด้านล่างเท่านั้น
 */
export default function RichTextEditorModal({
  open,
  onClose,
  sourceElement,
  snapshotKey,
  onSave,
  theme = null,
}) {
  const editorRef = useRef(null);
  const sourceRef = useRef(sourceElement);
  sourceRef.current = sourceElement;
  const initialDoc = migrateLabelToParagraph(sourceElement || {});
  const docRef = useRef(normalizeParagraph(initialDoc));
  const [doc, setDoc] = useState(() => normalizeParagraph(initialDoc));
  const [domEpoch, setDomEpoch] = useState(0);
  const [color, setColor] = useState("#111827");
  const [fontSizePx, setFontSizePx] = useState(16);
  const fontSizePxRef = useRef(16);
  const [lineHeightPx, setLineHeightPx] = useState(24);
  const lineHeightPxRef = useRef(24);
  const [letterSpacingPx, setLetterSpacingPx] = useState(0);
  const letterSpacingPxRef = useRef(0);
  const [boldActive, setBoldActive] = useState(false);
  const [italicActive, setItalicActive] = useState(false);
  const [underlineActive, setUnderlineActive] = useState(false);
  const [editorBaseFontSizePx, setEditorBaseFontSizePx] = useState(16);
  const editorBaseFontSizePxRef = useRef(16);
  const lastRangeRef = useRef(null);
  const debounceRef = useRef(null);

  fontSizePxRef.current = fontSizePx;
  lineHeightPxRef.current = lineHeightPx;
  letterSpacingPxRef.current = letterSpacingPx;
  editorBaseFontSizePxRef.current = editorBaseFontSizePx;

  docRef.current = doc;

  const themeColorSlots = useMemo(() => buildIconStyleColorSlots(theme), [theme]);

  const editorThemeTextClass = theme?.text?.value ?? "";
  const editorThemeFontFamily = useMemo(
    () => setFont(theme?.text?.value) || undefined,
    [theme]
  );

  useEffect(() => {
    if (!open) return;
    const el = sourceRef.current;
    if (!el) return;
    const initialFontSizePx = getInitialFontSizePxFromSource(el);
    const nextDoc = normalizeParagraph(migrateLabelToParagraph(el));
    const initialToolbarState = getToolbarStateFromRange(
      nextDoc,
      { start: 0, end: 0 },
      {
        fontSizePx: initialFontSizePx,
        lineHeightPx: 24,
        letterSpacingPx: 0,
        color: "#111827",
      }
    );
    setDoc(nextDoc);
    setDomEpoch((e) => e + 1);
    setColor(initialToolbarState.color);
    setFontSizePx(initialToolbarState.fontSizePx);
    setLineHeightPx(initialToolbarState.lineHeightPx);
    setLetterSpacingPx(initialToolbarState.letterSpacingPx);
    setBoldActive(initialToolbarState.bold);
    setItalicActive(initialToolbarState.italic);
    setUnderlineActive(initialToolbarState.underline);
    setEditorBaseFontSizePx(initialFontSizePx);
  }, [open, snapshotKey]);

  const mergeDomToParagraph = useCallback(() => {
    const root = editorRef.current;
    if (!root) return normalizeParagraph(docRef.current);
    return normalizeParagraph({
      ...docRef.current,
      segments: parseEditorDomToSegments(root),
    });
  }, []);

  const paintEditor = useCallback(() => {
    const root = editorRef.current;
    if (!root) return;
    renderSegmentsIntoEditor(root, docRef.current.segments);
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    paintEditor();
    const r = lastRangeRef.current;
    if (r && editorRef.current) {
      setDomSelectionRange(editorRef.current, r.start, r.end);
    }
  }, [open, domEpoch, paintEditor]);

  const rememberSelection = () => {
    const root = editorRef.current;
    if (!root) return;
    const r = getDomSelectionRange(root);
    if (r) lastRangeRef.current = r;
  };

  const applyDomAndSelection = (nextDoc, range) => {
    lastRangeRef.current = range;
    setDoc(normalizeParagraph(nextDoc));
    setDomEpoch((e) => e + 1);
  };

  const withSyncedDoc = (fn) => {
    const root = editorRef.current;
    if (!root) return;
    rememberSelection();
    const synced = mergeDomToParagraph();
    const range = getDomSelectionRange(root);
    if (!range || range.start === range.end) return;
    const next = fn(synced, range);
    if (next) applyDomAndSelection(next, range);
  };

  const syncToolbarWithSelection = useCallback(() => {
    const root = editorRef.current;
    if (!root) return;
    const synced = mergeDomToParagraph();
    const range = getDomSelectionRange(root) ?? lastRangeRef.current;
    if (!range) return;
    const next = getToolbarStateFromRange(synced, range, {
      fontSizePx: editorBaseFontSizePxRef.current,
      lineHeightPx: lineHeightPxRef.current,
      letterSpacingPx: letterSpacingPxRef.current,
      color,
    });
    setFontSizePx(next.fontSizePx);
    setLineHeightPx(next.lineHeightPx);
    setLetterSpacingPx(next.letterSpacingPx);
    setColor(next.color);
    setBoldActive(next.bold);
    setItalicActive(next.italic);
    setUnderlineActive(next.underline);
  }, [mergeDomToParagraph, color]);

  const handleSelectionChange = useCallback(() => {
    rememberSelection();
    syncToolbarWithSelection();
  }, [syncToolbarWithSelection]);

  const handlePlainText = () =>
    withSyncedDoc((d, r) =>
      stripClassesOnRange(d, r.start, r.end, EMPHASIS_SEGMENT_CLASSES)
    );

  const handleBold = () =>
    withSyncedDoc((d, r) => toggleClassOnRange(d, r.start, r.end, SEGMENT_CLASS.bold));

  const handleItalic = () =>
    withSyncedDoc((d, r) => toggleClassOnRange(d, r.start, r.end, SEGMENT_CLASS.italic));

  const handleUnderline = () =>
    withSyncedDoc((d, r) =>
      toggleClassOnRange(d, r.start, r.end, SEGMENT_CLASS.underline)
    );

  const handleThemeSwatch = useCallback(
    (hex) => {
      setColor(hex);
      const root = editorRef.current;
      if (!root) return;
      rememberSelection();
      const synced = mergeDomToParagraph();
      const range = getDomSelectionRange(root);
      if (!range || range.start === range.end) return;
      const next = setStyleOnRange(synced, range.start, range.end, { color: hex });
      applyDomAndSelection(next, range);
    },
    [mergeDomToParagraph]
  );

  const applyFontSizeToSelection = useCallback((px, prevPx) => {
    const root = editorRef.current;
    if (!root) return;
    rememberSelection();
    const synced = mergeDomToParagraph();
    // fallback ไปหา selection ที่บันทึกไว้ล่าสุด เผื่อ focus หลุดตอนคลิกปุ่ม
    const range = getDomSelectionRange(root) ?? lastRangeRef.current;
    if (!range || range.start === range.end) return;
    // freeze: ให้ทุก segment ที่ยังไม่มี explicit fontSize ได้รับ defaultPx
    // เพื่อกัน container CSS font-size เปลี่ยนแล้ว inherit ไปทั้งหมด
    const defaultPx = prevPx ?? fontSizePxRef.current;
    const frozen = materializeFontSizes(synced, defaultPx);
    const next = setStyleOnRange(frozen, range.start, range.end, {
      fontSize: `${px}px`,
    });
    applyDomAndSelection(next, range);
  }, [mergeDomToParagraph]);

  const cycleFontSize = useCallback(
    (delta) => {
      const prev = fontSizePxRef.current;
      const cur = FONT_SIZE_LIST.includes(prev) ? prev : nearestFontSizePx(prev);
      const i = FONT_SIZE_LIST.indexOf(cur);
      const nextPx =
        FONT_SIZE_LIST[(i + delta + FONT_SIZE_LIST.length) % FONT_SIZE_LIST.length];
      setFontSizePx(nextPx);
      // ส่ง prev เพื่อใช้ freeze segment ที่ไม่มี explicit fontSize ก่อน container เปลี่ยน
      applyFontSizeToSelection(nextPx, cur);
    },
    [applyFontSizeToSelection]
  );

  const applyLineHeightToSelection = useCallback(
    (px) => {
      const root = editorRef.current;
      if (!root) return;
      rememberSelection();
      const synced = mergeDomToParagraph();
      const range = getDomSelectionRange(root);
      if (!range || range.start === range.end) return;
      const next = setStyleOnRange(synced, range.start, range.end, {
        lineHeight: `${nearestLineHeightPx(px)}px`,
      });
      applyDomAndSelection(next, range);
    },
    [mergeDomToParagraph]
  );

  const cycleLineHeight = useCallback(
    (delta) => {
      const prev = lineHeightPxRef.current;
      const cur = nearestLineHeightPx(prev);
      const i = LINE_HEIGHT_PX_LIST.indexOf(cur);
      const nextPx =
        LINE_HEIGHT_PX_LIST[
          (i + delta + LINE_HEIGHT_PX_LIST.length) % LINE_HEIGHT_PX_LIST.length
        ];
      setLineHeightPx(nextPx);
      applyLineHeightToSelection(nextPx);
    },
    [applyLineHeightToSelection]
  );

  const applyLetterSpacingToSelection = useCallback(
    (px) => {
      const root = editorRef.current;
      if (!root) return;
      rememberSelection();
      const synced = mergeDomToParagraph();
      const range = getDomSelectionRange(root);
      if (!range || range.start === range.end) return;
      const next = setStyleOnRange(synced, range.start, range.end, {
        letterSpacing: `${nearestLetterSpacingPx(px)}px`,
      });
      applyDomAndSelection(next, range);
    },
    [mergeDomToParagraph]
  );

  const cycleLetterSpacing = useCallback(
    (delta) => {
      const prev = letterSpacingPxRef.current;
      const cur = nearestLetterSpacingPx(prev);
      const i = LETTER_SPACING_PX_LIST.indexOf(cur);
      const nextPx =
        LETTER_SPACING_PX_LIST[
          (i + delta + LETTER_SPACING_PX_LIST.length) % LETTER_SPACING_PX_LIST.length
        ];
      setLetterSpacingPx(nextPx);
      applyLetterSpacingToSelection(nextPx);
    },
    [applyLetterSpacingToSelection]
  );

  const handleAlign = (alignClass) => {
    const root = editorRef.current;
    if (!root) return;
    rememberSelection();
    const synced = mergeDomToParagraph();
    const range = getDomSelectionRange(root);
    const next = setParagraphAlign(synced, alignClass);
    applyDomAndSelection(next, range);
  };

  const handleEditorInput = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      const merged = mergeDomToParagraph();
      setDoc(merged);
    }, 200);
  };

  const handleSave = () => {
    const merged = mergeDomToParagraph();
    onSave(merged);
    onClose();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const t = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, t);
  };

  const handleEditorKeyDown = (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    // รองรับ Enter ได้ทุกตำแหน่ง: กลางคำ/ท้ายคำ/มี selection
    range.deleteContents();
    const newlineNode = document.createTextNode("\n");
    range.insertNode(newlineNode);
    range.setStartAfter(newlineNode);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    // Refresh sentinel BR เพื่อให้ cursor แสดงบนบรรทัดใหม่ทันที
    const root = editorRef.current;
    if (root) {
      const old = root.querySelector("br[data-eol]");
      if (old) old.remove();
      if ((root.textContent ?? "").endsWith("\n")) {
        const br = document.createElement("br");
        br.dataset.eol = "1";
        root.appendChild(br);
      }
    }
    rememberSelection();
    handleEditorInput();
  };

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    []
  );

  useEffect(() => {
    if (!open) return;
    syncToolbarWithSelection();
  }, [open, domEpoch, syncToolbarWithSelection]);

  return (
    <Modal open={open} onClose={onClose} aria-label="แก้ไขข้อความ">
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "94vw", sm: 640 },
          minHeight: 300,
          maxHeight: 450,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 0,
          outline: "none",
        }}
      >
        <Box sx={modalHeaderToolbarSx}>
          <Box
            sx={{
              display: "flex",
              width: "100%",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 0.75,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 0.75,
                flexShrink: 0,
              }}
            >
            <Button
              sx={toolbarBtnSx}
              variant="outlined"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handlePlainText}
              aria-label="ตัวอักษรธรรมดา"
              title="ตัวอักษรธรรมดา — เอาตัวหนา ตัวเอียง และขีดเส้นใต้ออก (สีและขนาดยังอยู่)"
            >
              <Typography component="span" sx={toolbarLetterIconSx}>
                T
              </Typography>
            </Button>
            <Button
              sx={toolbarBtnSx}
              variant="outlined"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleBold}
              aria-pressed={boldActive}
              aria-label="ตัวหนา"
              title="ตัวหนา"
            >
              <Bold {...toolbarIconProps} />
            </Button>
            <Button
              sx={toolbarBtnSx}
              variant="outlined"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleItalic}
              aria-pressed={italicActive}
              aria-label="ตัวเอียง"
              title="ตัวเอียง"
            >
              <Typography component="span" sx={toolbarLetterIconSx}>
                I
              </Typography>
            </Button>
            <Button
              sx={toolbarBtnSx}
              variant="outlined"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleUnderline}
              aria-pressed={underlineActive}
              aria-label="ขีดเส้นใต้"
              title="ขีดเส้นใต้"
            >
              <Typography component="span" sx={toolbarLetterIconSx}>
                U
              </Typography>
            </Button>
            <Button
              sx={toolbarBtnSx}
              variant="outlined"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleAlign(ALIGN_CLASS.left)}
              aria-label="จัดชิดซ้าย"
              title="จัดชิดซ้าย"
              aria-pressed={doc.alignClass === ALIGN_CLASS.left}
            >
              <AlignLeft {...toolbarIconProps} />
            </Button>
            <Button
              sx={toolbarBtnSx}
              variant="outlined"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleAlign(ALIGN_CLASS.center)}
              aria-label="จัดกึ่งกลาง"
              title="จัดกึ่งกลาง"
              aria-pressed={doc.alignClass === ALIGN_CLASS.center}
            >
              <AlignCenter {...toolbarIconProps} />
            </Button>
            <Button
              sx={toolbarBtnSx}
              variant="outlined"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleAlign(ALIGN_CLASS.right)}
              aria-label="จัดชิดขวา"
              title="จัดชิดขวา"
              aria-pressed={doc.alignClass === ALIGN_CLASS.right}
            >
              <AlignRight {...toolbarIconProps} />
            </Button>
            </Box>
            <Box
              sx={{
                display: "flex",
                flex: 1,
                minWidth: 0,
                alignItems: "center",
                gap: 1,
              }}
            >
            <Tooltip
              title={TOOLTIP_FONT_SIZE}
              arrow
              placement="top"
              slotProps={tooltipInModalSlotProps}
            >
              <Box
                component="span"
                sx={{
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <div
                  className="flex h-7 min-h-[28px] w-full min-w-0 items-center justify-between gap-0 rounded-[6px] border border-slate-200 bg-white px-[2px] py-0 dark:border-white/10 dark:bg-slate-800/90"
                  role="group"
                  aria-label={`ขนาด ${FONT_SIZE_MIN} ถึง ${FONT_SIZE_MAX} พิกเซล`}
                >
                  <button
                    type="button"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-slate-600 hover:text-[#333333] dark:text-slate-300 dark:hover:text-[#333333]"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => cycleFontSize(-1)}
                    aria-label="ขนาดเล็กลง"
                  >
                    <ChevronLeft className="size-3" strokeWidth={2} aria-hidden />
                  </button>
                  <span className="min-w-[40px] flex-1 select-none text-center text-[10px] font-medium tabular-nums leading-tight text-slate-800 dark:text-white/90">
                    {fontSizePx}px
                  </span>
                  <button
                    type="button"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-slate-600 hover:text-[#333333] dark:text-slate-300 dark:hover:text-[#333333]"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => cycleFontSize(1)}
                    aria-label="ขนาดใหญ่ขึ้น"
                  >
                    <ChevronRight className="size-3" strokeWidth={2} aria-hidden />
                  </button>
                </div>
              </Box>
            </Tooltip>
            <Tooltip
              title={TOOLTIP_LINE_HEIGHT}
              arrow
              placement="top"
              slotProps={tooltipInModalSlotProps}
            >
              <Box
                component="span"
                sx={{
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <div
                  className="flex h-7 min-h-[28px] w-full min-w-0 items-center justify-between gap-0 rounded-[6px] border border-slate-200 bg-white px-[2px] py-0 dark:border-white/10 dark:bg-slate-800/90"
                  role="group"
                  aria-label={`ระยะห่างบรรทัด ${LINE_HEIGHT_PX_MIN} ถึง ${LINE_HEIGHT_PX_MAX} พิกเซล`}
                >
                  <button
                    type="button"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-slate-600 hover:text-[#333333] dark:text-slate-300 dark:hover:text-[#333333]"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => cycleLineHeight(-1)}
                    aria-label="ลดระยะห่างบรรทัด"
                  >
                    <ChevronLeft className="size-3" strokeWidth={2} aria-hidden />
                  </button>
                  <span className="min-w-[40px] flex-1 select-none text-center text-[10px] font-medium tabular-nums leading-tight text-slate-800 dark:text-white/90">
                    {lineHeightPx}px
                  </span>
                  <button
                    type="button"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-slate-600 hover:text-[#333333] dark:text-slate-300 dark:hover:text-[#333333]"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => cycleLineHeight(1)}
                    aria-label="เพิ่มระยะห่างบรรทัด"
                  >
                    <ChevronRight className="size-3" strokeWidth={2} aria-hidden />
                  </button>
                </div>
              </Box>
            </Tooltip>
            <Tooltip
              title={TOOLTIP_LETTER_SPACING}
              arrow
              placement="top"
              slotProps={tooltipInModalSlotProps}
            >
              <Box
                component="span"
                sx={{
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <div
                  className="flex h-7 min-h-[28px] w-full min-w-0 items-center justify-between gap-0 rounded-[6px] border border-slate-200 bg-white px-[2px] py-0 dark:border-white/10 dark:bg-slate-800/90"
                  role="group"
                  aria-label={`ระยะห่างตัวอักษร ${LETTER_SPACING_PX_MIN} ถึง ${LETTER_SPACING_PX_MAX} พิกเซล`}
                >
                  <button
                    type="button"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-slate-600 hover:text-[#333333] dark:text-slate-300 dark:hover:text-[#333333]"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => cycleLetterSpacing(-1)}
                    aria-label="ลดระยะห่างตัวอักษร"
                  >
                    <ChevronLeft className="size-3" strokeWidth={2} aria-hidden />
                  </button>
                  <span className="min-w-[40px] flex-1 select-none text-center text-[10px] font-medium tabular-nums leading-tight text-slate-800 dark:text-white/90">
                    {letterSpacingPx}px
                  </span>
                  <button
                    type="button"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-slate-600 hover:text-[#333333] dark:text-slate-300 dark:hover:text-[#333333]"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => cycleLetterSpacing(1)}
                    aria-label="เพิ่มระยะห่างตัวอักษร"
                  >
                    <ChevronRight className="size-3" strokeWidth={2} aria-hidden />
                  </button>
                </div>
              </Box>
            </Tooltip>
            </Box>
          </Box>
          <Box sx={{ width: "100%" }} role="group" aria-label="สีจากธีม (พื้นหลัง ข้อความ กรอบ)">
            {themeColorSlots.length === 0 ? (
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", fontSize: 10, py: 0.5 }}
              >
                ไม่มีสีธีมในโหลดหน้านี้
              </Typography>
            ) : (
              <div className="mt-1 w-full px-0 pb-1 pt-0.5">
                <div className="flex w-full flex-nowrap items-center justify-stretch gap-0.5">
                  {themeColorSlots.map((slot, i) => {
                    const bgColor = resolveThemeSwatchBg(theme, slot);
                    if (bgColor == null) return null;
                    const selected =
                      normalizeHexForCompare(color) === normalizeHexForCompare(bgColor);
                    return (
                      <div
                        key={i}
                        className="flex min-w-0 flex-1 basis-0 items-center justify-center"
                      >
                        <button
                          type="button"
                          className="flex aspect-square w-full max-w-[26px] shrink-0 items-center justify-center rounded-full border"
                          style={{ backgroundColor: bgColor }}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleThemeSwatch(bgColor)}
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
            )}
          </Box>
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            px: MODAL_CONTENT_HORIZONTAL_PADDING,
            pt: 0,
            pb: 1,
          }}
        >
          <Box
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleEditorInput}
            onMouseUp={handleSelectionChange}
            onKeyUp={handleSelectionChange}
            onKeyDown={handleEditorKeyDown}
            onPaste={handlePaste}
            className={[
              doc.alignClass,
              editorThemeTextClass,
              "outline-none min-h-[120px] p-2 rounded",
            ]
              .filter(Boolean)
              .join(" ")}
            sx={{
              mb: 1,
              fontSize: `${editorBaseFontSizePx}px`,
              fontFamily: editorThemeFontFamily ?? "inherit",
              lineHeight: 1.5,
              whiteSpace: "pre-wrap",
              /* กัน browser-created elements (<a>, <b>, <div> ฯลฯ) เปลี่ยนสีหรือ style */
              "& a, & a:any-link, & a:hover, & a:visited, & a:active": {
                color: "inherit !important",
                textDecoration: "none !important",
              },
              "& b, & strong": { fontWeight: "inherit" },
              "& i, & em": { fontStyle: "inherit" },
            }}
          />
        </Box>

        <Box
          sx={(theme) => ({
            flexShrink: 0,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 0.75,
            px: MODAL_CONTENT_HORIZONTAL_PADDING,
            paddingTop: `calc(${theme.spacing(0.75)} + 5px)`,
            pb: 1.25,
            borderTop: "1px solid rgba(148, 163, 184, 0.45)",
            ".dark &": {
              borderTopColor: "rgba(255, 255, 255, 0.12)",
            },
          })}
        >
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              ...toolbarBtnSx,
              minWidth: 64,
              minHeight: 28,
              fontSize: 12,
              py: 0.4,
              borderColor: "rgba(148, 163, 184, 0.45)",
            }}
          >
            ยกเลิก
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disableElevation
            sx={saveButtonSx}
          >
            บันทึกลงหน้า (พรีวิว)
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
