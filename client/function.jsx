export const clampOpacityByte = (opcy, fallback = 255) => {
    const n = Number(opcy);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(0, Math.min(255, Math.round(n)));
  };

export const opacity_2_hex = (opcy) => {
    return clampOpacityByte(opcy).toString(16).toUpperCase().padStart(2, "0");
  }; // แปลงค่า Opacity ให้เป็น Hex


export const setFont = (font) => {
    let isFirst = false;
    const cutFont_ = font?.replace("font-", "");
    let newFont = "";
    for (let i = 0; i < cutFont_?.length; i++) {
      if (cutFont_[i] === "-" && !isFirst) {
        newFont += " ";
        isFirst = true;
      } else if (cutFont_[i] === "-" && isFirst) {
        newFont += "";
      } else if ((cutFont_[i] !== "-" && isFirst) || i === 0) {
        newFont += cutFont_[i].toUpperCase();
        isFirst = false;
      } else {
        newFont += cutFont_[i];
      }
    }
    return newFont;
  }; // แปลง Font Tailwind ให้เป็น Font CSS

export const setColor = (
    theme,
    color,
    opacity = null,
    degree = null
  ) => {
    if(!theme) return "#ffffff"
    const resolveStop = (stop, stopOpacity) => {
      const hex = opacity_2_hex(stopOpacity);
      if (typeof stop === "string") return stop + hex;
      const palette = theme?.[stop?.type];
      const swatch = Array.isArray(palette) ? palette[stop?.index] : null;
      return (swatch || "#ffffff") + hex;
    };
    if (Array.isArray(color) && color.length >= 2) {
      const stops = Array.isArray(opacity) ? opacity : [];
      const angle = Number(degree);
      const deg = Number.isFinite(angle) ? angle : 90;
      const color1 = resolveStop(color[0], stops[0]);
      const color2 = resolveStop(color[1], stops[1]);
      return `linear-gradient(${deg}deg, ${color1} 0%, ${color2} 100%)`;
    }
    if (color == null) return "#ffffff" + opacity_2_hex(opacity);
    if (typeof color === "string") {
      return color + opacity_2_hex(opacity);
    }
    return resolveStop(color, opacity);
  };


