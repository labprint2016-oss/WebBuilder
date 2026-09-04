import { FOOTER_BAR_NODE_SELECTOR } from "./panelPreviewStore";
import { broadcastPreviewLive } from "./previewLiveChannel";
import { getCachedPanelTheme } from "./Services/ServiceColor";

const opacityToHex = (opacity) => {
  const safe = Number.isFinite(Number(opacity)) ? Number(opacity) : 255;
  return Math.max(0, Math.min(255, safe)).toString(16).toUpperCase().padStart(2, "0");
};

export const normalizeFooterDegree = (value) => {
  const next = Number(value);
  if (!Number.isFinite(next)) return 0;
  return Math.max(0, Math.min(360, next));
};

let sliderLiveFooterBar = null;
export const getSliderLiveFooterBar = () => sliderLiveFooterBar;
export const setSliderLiveFooterBar = (latest) => {
  sliderLiveFooterBar = latest || null;
};
export const clearSliderLiveFooterBar = () => {
  sliderLiveFooterBar = null;
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

export const buildFooterBackgroundStyle = (isGradient, background) =>
  isGradient
    ? { backgroundImage: background, backgroundColor: "transparent" }
    : { backgroundImage: "none", backgroundColor: background };

const readNodeGradient = (node) =>
  String(node?.style?.backgroundImage || node?.style?.background || "");

const replaceGradientDegree = (background, degree) => {
  const nextDegree = normalizeFooterDegree(degree);
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

const applyBackgroundToNode = (node, latest, background) => {
  if (!node) return;
  const degree = normalizeFooterDegree(latest.bgDegree);
  node.style.setProperty("--wb-footer-deg", `${degree}deg`);
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
  }
};

export const applyFooterChromeToDocument = (latest, rootDocument = document) => {
  if (!latest || typeof rootDocument === "undefined") return;
  const nodes = rootDocument.querySelectorAll(FOOTER_BAR_NODE_SELECTOR);
  if (!nodes.length) return;

  const height = Number(latest.footerHeight);
  const heightPx = Number.isFinite(height) ? `${height}px` : null;
  const logoHeight = Number(latest.logoHeight);
  const footerLimit = Number(latest.footerHeight);
  const paintedLogoHeight =
    Number.isFinite(logoHeight) && Number.isFinite(footerLimit)
      ? Math.min(logoHeight, footerLimit)
      : logoHeight;
  const logoHeightPx = Number.isFinite(paintedLogoHeight)
    ? `${paintedLogoHeight}px`
    : null;
  const textSize = Number(latest.textSize);
  const textSizePx = Number.isFinite(textSize) ? `${textSize}px` : null;
  const textHex = resolveThemeHex(latest.textColor);
  const textColorValue = textHex
    ? `${textHex}${opacityToHex(latest.textOpacity)}`
    : null;
  let background = null;
  if (latest.isGradient && Array.isArray(latest.bgColorGradient)) {
    const start = resolveThemeHex(latest.bgColorGradient[0]);
    const end = resolveThemeHex(latest.bgColorGradient[1]);
    if (start && end) {
      const degree = normalizeFooterDegree(latest.bgDegree);
      background = `linear-gradient(${degree}deg, ${start}${opacityToHex(latest.bgOpacityGradient?.[0])} 0%, ${end}${opacityToHex(latest.bgOpacityGradient?.[1])} 100%)`;
    }
  } else {
    const solid = resolveThemeHex(latest.bgColor);
    if (solid) background = `${solid}${opacityToHex(latest.bgOpacity)}`;
  }

  nodes.forEach((node) => {
    if (heightPx) {
      node.style.height = heightPx;
      node.style.minHeight = heightPx;
    }
    applyBackgroundToNode(node, latest, background);
    const inner = node.querySelector("[data-builder-footer-inner]");
    if (inner) {
      if (heightPx) {
        inner.style.height = heightPx;
        inner.style.minHeight = heightPx;
      }
      if (textColorValue) inner.style.color = textColorValue;
    }
    node.querySelectorAll("[data-builder-footer-text]").forEach((el) => {
      if (textColorValue) el.style.color = textColorValue;
      if (textSizePx) el.style.fontSize = textSizePx;
    });
    if (logoHeightPx) {
      node.querySelectorAll("[data-builder-footer-logo]").forEach((img) => {
        img.style.height = logoHeightPx;
      });
    }
  });
};

let broadcastFrame = null;
let pendingBroadcast = null;

const schedulePreviewLiveBroadcast = (latest) => {
  pendingBroadcast = latest;
  if (typeof requestAnimationFrame !== "function") {
    broadcastPreviewLive("footerBar", latest);
    return;
  }
  if (broadcastFrame != null) return;
  broadcastFrame = requestAnimationFrame(() => {
    broadcastFrame = null;
    const payload = pendingBroadcast;
    pendingBroadcast = null;
    if (payload) broadcastPreviewLive("footerBar", payload);
  });
};

export const previewFooterChromeDirectly = (latest) => {
  if (!latest) return;
  setSliderLiveFooterBar(latest);
  if (typeof document !== "undefined") {
    applyFooterChromeToDocument(latest, document);
  }
  schedulePreviewLiveBroadcast(latest);
};
