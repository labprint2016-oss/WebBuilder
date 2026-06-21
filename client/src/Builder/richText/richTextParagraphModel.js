/**
 * Structured rich paragraph (no raw HTML in persisted data).
 * @typedef {{
 *   text: string,
 *   classes: string[],
 *   style: { color?: string, fontSize?: string, lineHeight?: string, letterSpacing?: string }
 * }} RichTextSegment
 * @typedef {{ type: 'paragraph', alignClass: string, segments: RichTextSegment[] }} RichTextParagraph
 */

/** legacy segments อาจมี line-height แบบตัวคูณ */
const LINE_HEIGHT_UNITLESS = /^(\d+(\.\d+)?)$/;
const LINE_HEIGHT_PX = /^(\d+(\.\d+)?)px$/i;
/** รองรับ px (หลัก) และ em (ข้อมูลเก่า) */
const LETTER_SPACING_EM = /^-?\d+(\.\d+)?em$/i;
const LETTER_SPACING_PX = /^-?\d+(\.\d+)?px$/i;

export const SEGMENT_CLASS = {
  bold: "font-bold",
  italic: "italic",
  underline: "underline",
};

export const ALIGN_CLASS = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

const ALIGN_VALUES = new Set(Object.values(ALIGN_CLASS));

/** Classes allowed on segments (layout alignment lives on paragraph.alignClass). */
export const ALLOWED_SEGMENT_CLASSES = new Set([
  SEGMENT_CLASS.bold,
  SEGMENT_CLASS.italic,
  SEGMENT_CLASS.underline,
]);

export function createDefaultParagraph() {
  return {
    type: "paragraph",
    alignClass: ALIGN_CLASS.left,
    segments: [{ text: "พิมพ์ข้อความที่นี่", classes: [], style: {} }],
  };
}

function cloneSegment(seg) {
  return {
    text: typeof seg.text === "string" ? seg.text : "",
    classes: Array.isArray(seg.classes)
      ? [...seg.classes].filter((c) => ALLOWED_SEGMENT_CLASSES.has(c))
      : [],
    style: normalizeStyle(seg.style),
  };
}

export function normalizeStyle(style) {
  if (!style || typeof style !== "object") return {};
  const out = {};
  if (typeof style.color === "string" && style.color.trim())
    out.color = style.color.trim();
  if (typeof style.fontSize === "string" && style.fontSize.trim())
    out.fontSize = style.fontSize.trim();
  if (typeof style.lineHeight === "string" && style.lineHeight.trim()) {
    const t = style.lineHeight.trim();
    const n = parseFloat(t);
    if (LINE_HEIGHT_PX.test(t) && Number.isFinite(n) && n >= 8 && n <= 120) {
      const px = Math.round(n);
      out.lineHeight = `${px}px`;
    } else if (
      LINE_HEIGHT_UNITLESS.test(t) &&
      Number.isFinite(n) &&
      n >= 0.5 &&
      n <= 5
    ) {
      out.lineHeight = t;
    }
  }
  if (typeof style.letterSpacing === "string" && style.letterSpacing.trim()) {
    const t = style.letterSpacing.trim().replace(/\s/g, "");
    if (LETTER_SPACING_PX.test(t)) {
      const n = parseFloat(t);
      if (Number.isFinite(n) && n >= 0 && n <= 20) {
        const px = Math.round(n * 100) / 100;
        out.letterSpacing = `${px}px`;
      }
    } else if (LETTER_SPACING_EM.test(t)) {
      const n = parseFloat(t);
      if (Number.isFinite(n) && n >= -0.5 && n <= 0.5) out.letterSpacing = t;
    }
  }
  return out;
}

export function normalizeParagraph(input) {
  const base = createDefaultParagraph();
  if (!input || typeof input !== "object") return base;
  const alignClass = ALIGN_VALUES.has(input.alignClass)
    ? input.alignClass
    : ALIGN_CLASS.left;
  const raw = Array.isArray(input.segments) ? input.segments : [];
  const segments = raw.map(cloneSegment).filter((s) => s.text.length > 0);
  const merged = mergeAdjacentSameStyle(segments.length ? segments : base.segments);
  return { type: "paragraph", alignClass, segments: merged };
}

export function migrateLabelToParagraph(element) {
  const tp = element?.textParagraph;
  if (tp && Array.isArray(tp.segments) && tp.segments.length > 0) {
    return normalizeParagraph(tp);
  }
  const label = typeof element?.label === "string" ? element.label : "";
  if (!label.trim()) return createDefaultParagraph();
  return normalizeParagraph({
    type: "paragraph",
    alignClass: ALIGN_CLASS.left,
    segments: [{ text: label, classes: [], style: {} }],
  });
}

function sameStyleKey(a, b) {
  return (
    JSON.stringify(a.classes) === JSON.stringify(b.classes) &&
    JSON.stringify(normalizeStyle(a.style)) === JSON.stringify(normalizeStyle(b.style))
  );
}

export function mergeAdjacentSameStyle(segments) {
  const out = [];
  for (const seg of segments) {
    if (!seg.text) continue;
    if (out.length && sameStyleKey(out[out.length - 1], seg)) {
      out[out.length - 1] = {
        ...out[out.length - 1],
        text: out[out.length - 1].text + seg.text,
      };
    } else {
      out.push({ ...seg, classes: [...seg.classes], style: normalizeStyle(seg.style) });
    }
  }
  return out.length ? out : [{ text: "", classes: [], style: {} }];
}

function paragraphFullLen(segments) {
  return segments.reduce((n, s) => n + s.text.length, 0);
}

/**
 * Expand paragraph to one entry per character (for range formatting).
 */
export function expandCharRuns(segments) {
  const runs = [];
  for (const seg of segments) {
    const classes = [...seg.classes];
    const style = normalizeStyle(seg.style);
    for (let i = 0; i < seg.text.length; i++) {
      runs.push({
        ch: seg.text[i],
        classes: [...classes],
        style: { ...style },
      });
    }
  }
  return runs;
}

export function collapseCharRuns(runs) {
  if (!runs.length) return [{ text: "", classes: [], style: {} }];
  const segments = [];
  let cur = {
    text: runs[0].ch,
    classes: [...runs[0].classes],
    style: normalizeStyle(runs[0].style),
  };
  for (let i = 1; i < runs.length; i++) {
    const r = runs[i];
    const seg = { text: r.ch, classes: [...r.classes], style: normalizeStyle(r.style) };
    if (sameStyleKey(cur, seg)) {
      cur = { ...cur, text: cur.text + seg.text };
    } else {
      segments.push(cur);
      cur = seg;
    }
  }
  segments.push(cur);
  return mergeAdjacentSameStyle(segments);
}

/**
 * @param {RichTextParagraph} paragraph
 * @param {number} start inclusive
 * @param {number} end exclusive
 */
export function toggleClassOnRange(paragraph, start, end, className) {
  if (!ALLOWED_SEGMENT_CLASSES.has(className)) return paragraph;
  const len = paragraphFullLen(paragraph.segments);
  if (start >= end || start >= len || end <= 0) return normalizeParagraph(paragraph);
  const s = Math.max(0, start);
  const e = Math.min(len, end);
  const runs = expandCharRuns(paragraph.segments);
  const allOn = runs.slice(s, e).every((r) => r.classes.includes(className));
  for (let i = s; i < e; i++) {
    const set = new Set(runs[i].classes);
    if (allOn) set.delete(className);
    else set.add(className);
    runs[i].classes = [...set].filter((c) => ALLOWED_SEGMENT_CLASSES.has(c));
  }
  return normalizeParagraph({
    ...paragraph,
    segments: collapseCharRuns(runs),
  });
}

/**
 * Remove given segment classes from every character in [start, end).
 * @param {string[]} classNames — e.g. [SEGMENT_CLASS.bold, SEGMENT_CLASS.italic]
 */
export function stripClassesOnRange(paragraph, start, end, classNames) {
  const len = paragraphFullLen(paragraph.segments);
  if (start >= end || start >= len || end <= 0) return normalizeParagraph(paragraph);
  const remove = new Set(
    (Array.isArray(classNames) ? classNames : []).filter((c) =>
      ALLOWED_SEGMENT_CLASSES.has(c)
    )
  );
  if (!remove.size) return normalizeParagraph(paragraph);
  const s = Math.max(0, start);
  const e = Math.min(len, end);
  const runs = expandCharRuns(paragraph.segments);
  for (let i = s; i < e; i++) {
    runs[i].classes = runs[i].classes.filter((c) => !remove.has(c));
  }
  return normalizeParagraph({
    ...paragraph,
    segments: collapseCharRuns(runs),
  });
}

/** Merges only keys present in `stylePatch` onto each character in the range; other style keys stay. */
export function setStyleOnRange(paragraph, start, end, stylePatch) {
  const len = paragraphFullLen(paragraph.segments);
  if (start >= end || start >= len || end <= 0) return normalizeParagraph(paragraph);
  const s = Math.max(0, start);
  const e = Math.min(len, end);
  const runs = expandCharRuns(paragraph.segments);
  const patch = normalizeStyle(stylePatch);
  if (Object.keys(patch).length === 0) return normalizeParagraph(paragraph);
  for (let i = s; i < e; i++) {
    runs[i].style = normalizeStyle({
      ...normalizeStyle(runs[i].style),
      ...patch,
    });
  }
  return normalizeParagraph({
    ...paragraph,
    segments: collapseCharRuns(runs),
  });
}

/**
 * ให้ทุก segment ที่ยังไม่มี fontSize ชัดเจน ได้รับ fontSize = `${defaultPx}px`
 * ใช้ก่อน setStyleOnRange เพื่อกัน segment อื่นรับค่า CSS inherit จาก container
 */
export function materializeFontSizes(paragraph, defaultPx) {
  const px = Number(defaultPx);
  if (!Number.isFinite(px) || px <= 0) return normalizeParagraph(paragraph);
  const segments = normalizeParagraph(paragraph).segments.map((seg) =>
    seg.style?.fontSize
      ? seg
      : { ...seg, style: normalizeStyle({ ...seg.style, fontSize: `${px}px` }) }
  );
  return normalizeParagraph({ ...paragraph, segments });
}

export function setParagraphAlign(paragraph, alignClass) {
  const a = ALIGN_VALUES.has(alignClass) ? alignClass : ALIGN_CLASS.left;
  return { ...normalizeParagraph(paragraph), alignClass: a };
}

export function paragraphToPlainText(paragraph) {
  return paragraph.segments.map((s) => s.text).join("");
}

/**
 * Serialize for future API / DB persistence (plain JSON, no HTML).
 */
export function serializeParagraphForSave(paragraph) {
  const p = normalizeParagraph(paragraph);
  return {
    type: p.type,
    alignClass: p.alignClass,
    segments: p.segments.map((s) => ({
      text: s.text,
      classes: [...s.classes],
      style: normalizeStyle(s.style),
    })),
  };
}
