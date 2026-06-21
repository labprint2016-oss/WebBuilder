export const opacity_2_hex = (opcy) => {
    const hex = opcy.toString(16).toUpperCase().padStart(2, 0);
    return hex;
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
    if (Array.isArray(color) && Array.isArray(opacity) && !isNaN(degree)) {
      let gradientColor;
      let color1;
      let color2;
      if (typeof color[0] === "string") {
        color1 = color[0]+ opacity_2_hex(opacity[0])
        
      } else {
        color1 =
          theme[color[0].type][color[0].index] + opacity_2_hex(opacity[0]);
      }
  
      if (typeof color[1] === "string") {
        color2 = color[1]+ opacity_2_hex(opacity[1])
      } else {
        color2 =
          theme[color[1].type][color[1].index] + opacity_2_hex(opacity[1]);
      }
  
      gradientColor = `linear-gradient(${degree}deg, ${color1} 0%, ${color2} 100%)`;
  
      return gradientColor;
    } else {
      if (color == null) return "#ffffff" + opacity_2_hex(opacity ?? 255);
      if (typeof color === "string") {
        return color + opacity_2_hex(opacity);
      }
      return theme[color.type][color.index] + opacity_2_hex(opacity);
    }
  };


