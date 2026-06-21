import {
  ALLOWED_SEGMENT_CLASSES,
  mergeAdjacentSameStyle,
  normalizeStyle,
} from "./richTextParagraphModel";

export function renderSegmentsIntoEditor(root, segments) {
  while (root.firstChild) root.removeChild(root.firstChild);
  let lastText = "";
  for (let i = 0; i < segments.length; i++) {
    const s = segments[i];
    const span = document.createElement("span");
    for (const c of s.classes || []) {
      if (ALLOWED_SEGMENT_CLASSES.has(c)) span.classList.add(c);
    }
    const st = normalizeStyle(s.style);
    if (st.color) span.style.color = st.color;
    if (st.fontSize) span.style.fontSize = st.fontSize;
    if (st.lineHeight) span.style.lineHeight = st.lineHeight;
    if (st.letterSpacing) span.style.letterSpacing = st.letterSpacing;
    const text = s.text ?? "";
    span.appendChild(document.createTextNode(text));
    root.appendChild(span);
    if (text.length > 0) lastText = text;
  }
  /* Sentinel BR: contenteditable ไม่แสดง cursor บนบรรทัดใหม่
     ถ้า \n อยู่ท้ายสุดโดยไม่มีอะไรตามหลัง */
  if (lastText.endsWith("\n")) {
    const br = document.createElement("br");
    br.dataset.eol = "1";
    root.appendChild(br);
  }
}

export function parseEditorDomToSegments(root) {
  const segments = [];
  for (const node of root.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      const t = node.textContent ?? "";
      if (t) segments.push({ text: t, classes: [], style: {} });
      continue;
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = /** @type {HTMLElement} */ (node);
      if (el.tagName === "BR") {
        if (el.dataset?.eol === "1") continue; // sentinel เท่านั้น ไม่นับเป็น \n
        segments.push({ text: "\n", classes: [], style: {} });
        continue;
      }
      if (el.tagName === "SPAN") {
        const classes = [...el.classList].filter((c) =>
          ALLOWED_SEGMENT_CLASSES.has(c)
        );
        const style = {};
        if (el.style.color) style.color = el.style.color;
        if (el.style.fontSize) style.fontSize = el.style.fontSize;
        if (el.style.lineHeight) style.lineHeight = el.style.lineHeight;
        if (el.style.letterSpacing) style.letterSpacing = el.style.letterSpacing;
        segments.push({
          text: el.textContent ?? "",
          classes,
          style: normalizeStyle(style),
        });
        continue;
      }
      const t = el.textContent ?? "";
      if (t) segments.push({ text: t, classes: [], style: {} });
    }
  }
  return mergeAdjacentSameStyle(segments);
}

export function getFlatOffsetsForNode(root, node, offset) {
  let flat = 0;
  if (!node) return 0;

  const walk = (n) => {
    if (n === node) {
      if (n.nodeType === Node.TEXT_NODE) flat += offset;
      return true;
    }
    if (n.nodeType === Node.TEXT_NODE) {
      flat += n.textContent?.length ?? 0;
      return false;
    }
    if (n.nodeType === Node.ELEMENT_NODE) {
      const el = /** @type {HTMLElement} */ (n);
      if (el === root) {
        for (const c of el.childNodes) {
          if (walk(c)) return true;
        }
        return false;
      }
      for (const c of el.childNodes) {
        if (walk(c)) return true;
      }
      if (node === el && offset === 0) return true;
    }
    return false;
  };

  walk(root);
  return flat;
}

/** Global character offsets for current selection inside `root` (contenteditable). */
export function getDomSelectionRange(root) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  if (!root.contains(sel.anchorNode) || !root.contains(sel.focusNode)) {
    return null;
  }
  const a = getFlatOffsetsForNode(root, sel.anchorNode, sel.anchorOffset);
  const f = getFlatOffsetsForNode(root, sel.focusNode, sel.focusOffset);
  return { start: Math.min(a, f), end: Math.max(a, f) };
}

export function setDomSelectionRange(root, start, end) {
  const sel = window.getSelection();
  if (!sel) return;

  const findPos = (target) => {
    let seen = 0;
    const walk = (n) => {
      if (n.nodeType === Node.TEXT_NODE) {
        const len = n.textContent?.length ?? 0;
        if (seen + len >= target) {
          return { node: n, offset: Math.max(0, target - seen) };
        }
        seen += len;
        return null;
      }
      if (n.nodeType === Node.ELEMENT_NODE) {
        for (const c of n.childNodes) {
          const r = walk(c);
          if (r) return r;
        }
      }
      return null;
    };
    return walk(root);
  };

  const ra = findPos(start);
  const rb = findPos(end);
  if (!ra || !rb) return;
  const range = document.createRange();
  range.setStart(ra.node, ra.offset);
  range.setEnd(rb.node, rb.offset);
  sel.removeAllRanges();
  sel.addRange(range);
}
