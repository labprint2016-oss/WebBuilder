import { TOP_BAR_NODE_SELECTOR } from "./panelPreviewStore";
import { broadcastPreviewLive } from "./previewLiveChannel";
import { getCachedPanelTheme } from "./Services/ServiceColor";

const opacityToHex = (opacity) => {
  const safe = Number.isFinite(Number(opacity)) ? Number(opacity) : 255;
  return Math.max(0, Math.min(255, safe)).toString(16).toUpperCase().padStart(2, "0");
};

export const normalizeTopBarDegree = (value) => {
  const next = Number(value);
  if (!Number.isFinite(next)) return 0;
  return Math.max(0, Math.min(360, next));
};

let sliderLiveTopBar = null;
export const getSliderLiveTopBar = () => sliderLiveTopBar;
export const setSliderLiveTopBar = (latest) => {
  sliderLiveTopBar = latest || null;
};
export const clearSliderLiveTopBar = () => {
  sliderLiveTopBar = null;
};

const resolveThemeHex = (color, theme = getCachedPanelTheme()) => {
  if (typeof color === "string") {
    const match = color.trim().match(/^#([0-9a-f]{6})/i);
    return match ? `#${match[1]}` : null;
  }
  const hex = theme?.[color?.type]?.[color?.index];
  const match = String(hex || "").trim().match(/^#([0-9a-f]{6})/i);
  return match ? `#${match[1]}` : null;
};

const applyHexOrRgbaOpacity = (node, opacity, preferredHex = null) => {
  if (!node) return;
  const hex = preferredHex || (() => {
    const inline = String(node.style.backgroundColor || node.style.background || "").trim();
    const inlineMatch = inline.match(/#([0-9a-f]{6})/i);
    if (inlineMatch) return `#${inlineMatch[1]}`;
    const computed = window.getComputedStyle(node).backgroundColor;
    const rgb = computed.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/);
    if (!rgb) return null;
    const toHex = (n) =>
      Math.max(0, Math.min(255, Math.round(Number(n))))
        .toString(16)
        .toUpperCase()
        .padStart(2, "0");
    return `#${toHex(rgb[1])}${toHex(rgb[2])}${toHex(rgb[3])}`;
  })();
  if (!hex) return;
  node.style.backgroundImage = "none";
  node.style.backgroundColor = `${hex}${opacityToHex(opacity)}`;
};

const applyIconFontSize = (chip, size) => {
  if (!chip || !Number.isFinite(Number(size))) return;
  const icon = chip.querySelector("[data-builder-topbar-icon], svg, i");
  if (icon) icon.style.fontSize = `${Number(size)}px`;
};

const applyLabelFontSize = (label, size) => {
  if (!label || !Number.isFinite(Number(size))) return;
  label.style.fontSize = `${Number(size)}px`;
};

const applyIconColorOpacity = (chip, opacity) => {
  if (!chip || !Number.isFinite(Number(opacity))) return;
  const icon = chip.querySelector("[data-builder-topbar-icon], svg, i");
  if (!icon) return;
  const inline = String(icon.style.color || "").trim();
  const hexMatch = inline.match(/#([0-9a-f]{6})/i);
  if (hexMatch) {
    icon.style.color = `#${hexMatch[1]}${opacityToHex(opacity)}`;
    return;
  }
  const computed = window.getComputedStyle(icon).color;
  const rgb = computed.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/);
  if (!rgb) return;
  icon.style.color = `rgba(${rgb[1]}, ${rgb[2]}, ${rgb[3]}, ${Number(opacity) / 255})`;
};

const readNodeGradient = (node) =>
  String(node?.style?.backgroundImage || node?.style?.background || "");

const replaceGradientDegree = (background, degree) => {
  const nextDegree = normalizeTopBarDegree(degree);
  if (!/linear-gradient\(/i.test(background)) return null;
  if (/linear-gradient\(\s*-?[\d.]+deg/i.test(background)) {
    return background.replace(
      /linear-gradient\(\s*-?[\d.]+deg/i,
      `linear-gradient(${nextDegree}deg`
    );
  }
  if (/linear-gradient\(\s*to\s+[a-z\s]+,/i.test(background)) {
    return background.replace(
      /linear-gradient\(\s*to\s+[a-z\s]+,/i,
      `linear-gradient(${nextDegree}deg,`
    );
  }
  return background.replace(
    /linear-gradient\(\s*/i,
    `linear-gradient(${nextDegree}deg, `
  );
};

export const buildTopBarBackgroundStyle = (isGradient, background) =>
  isGradient
    ? { backgroundImage: background, backgroundColor: "transparent" }
    : { backgroundImage: "none", backgroundColor: background };

const applyBackgroundToNode = (node, latest, background) => {
  if (!node) return;
  const degree = normalizeTopBarDegree(latest.bgDegree);
  node.style.setProperty("--wb-topbar-deg", `${degree}deg`);
  if (background) {
    if (latest.isGradient) {
      node.style.backgroundImage = background;
      node.style.backgroundColor = "transparent";
    } else {
      node.style.backgroundImage = "none";
      node.style.backgroundColor = background;
    }
    return;
  }
  if (latest.isGradient) {
    const current = readNodeGradient(node);
    const nextBackground = replaceGradientDegree(current, degree);
    if (nextBackground) node.style.backgroundImage = nextBackground;
    return;
  }
  applyHexOrRgbaOpacity(node, latest.bgOpacity);
};

export const applyTopBarChromeToDocument = (latest, rootDocument = document) => {
  if (!latest || typeof rootDocument === "undefined") return;
  const nodes = rootDocument.querySelectorAll(TOP_BAR_NODE_SELECTOR);
  if (!nodes.length) return;

  const height = Number(latest.topBarHeight);
  const heightPx = Number.isFinite(height) ? `${height}px` : null;
  const socialSize = Number(latest.borderSize);
  const socialRadius = Number(latest.radius);
  const textSize = Number(latest.borderTextSize);
  const textRadius = Number(latest.radiusText);
  let background = null;
  if (latest.isGradient && Array.isArray(latest.bgColorGradient)) {
    const start = resolveThemeHex(latest.bgColorGradient[0]);
    const end = resolveThemeHex(latest.bgColorGradient[1]);
    if (start && end) {
      const degree = normalizeTopBarDegree(latest.bgDegree);
      background = `linear-gradient(${degree}deg, ${start}${opacityToHex(latest.bgOpacityGradient?.[0])} 0%, ${end}${opacityToHex(latest.bgOpacityGradient?.[1])} 100%)`;
    }
  } else {
    const solid = resolveThemeHex(latest.bgColor);
    if (solid) background = `${solid}${opacityToHex(latest.bgOpacity)}`;
  }

  nodes.forEach((node) => {
    if (heightPx) node.style.height = heightPx;
    applyBackgroundToNode(node, latest, background);
    node.querySelectorAll("[data-builder-topbar-chip='social']").forEach((chip) => {
      if (Number.isFinite(socialSize)) {
        chip.style.width = `${socialSize}px`;
        chip.style.height = `${socialSize}px`;
      }
      if (Number.isFinite(socialRadius)) {
        chip.style.borderRadius = `${socialRadius}%`;
      }
      const index = Number(chip.getAttribute("data-builder-topbar-index"));
      const item = Number.isFinite(index) ? latest.iconGroup?.[index] : null;
      if (!item) return;
      applyIconFontSize(chip, item.iconSize);
      applyHexOrRgbaOpacity(chip, item.bgOpacity, resolveThemeHex(item.bgColor));
      applyIconColorOpacity(chip, item.iconOpacity);
    });
    node.querySelectorAll("[data-builder-topbar-chip='text']").forEach((chip) => {
      if (Number.isFinite(textSize)) {
        chip.style.width = `${textSize}px`;
        chip.style.height = `${textSize}px`;
      }
      if (Number.isFinite(textRadius)) {
        chip.style.borderRadius = `${textRadius}%`;
      }
      const index = Number(chip.getAttribute("data-builder-topbar-index"));
      const item = Number.isFinite(index) ? latest.textGroup?.[index] : null;
      if (!item) return;
      applyIconFontSize(chip, item.iconSize);
      applyHexOrRgbaOpacity(chip, item.bgOpacity, resolveThemeHex(item.bgColor));
      applyIconColorOpacity(chip, item.iconOpacity);
    });
    node.querySelectorAll("[data-builder-topbar-text]").forEach((label) => {
      const index = Number(label.getAttribute("data-builder-topbar-index"));
      const item = Number.isFinite(index) ? latest.textGroup?.[index] : null;
      if (!item) return;
      applyLabelFontSize(label, item.textSize);
    });
  });
};

let broadcastFrame = null;
let pendingBroadcast = null;

const schedulePreviewLiveBroadcast = (latest) => {
  pendingBroadcast = latest;
  if (typeof requestAnimationFrame !== "function") {
    broadcastPreviewLive("topBar", latest);
    return;
  }
  if (broadcastFrame != null) return;
  broadcastFrame = requestAnimationFrame(() => {
    broadcastFrame = null;
    const payload = pendingBroadcast;
    pendingBroadcast = null;
    if (payload) broadcastPreviewLive("topBar", payload);
  });
};

export const previewTopBarChromeDirectly = (latest) => {
  if (!latest) return;
  setSliderLiveTopBar(latest);
  if (typeof document !== "undefined") {
    applyTopBarChromeToDocument(latest, document);
  }
  schedulePreviewLiveBroadcast(latest);
};
