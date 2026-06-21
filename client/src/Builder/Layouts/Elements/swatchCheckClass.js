const CHECK_ON_LIGHT = "size-4 text-[#333333]";

/** พื้นสีถาด 4 สีท้าย — ขาวกับเทาอ่อน (#d8d8d8) check สีขาวมองยาก ใช้ #333 แทน */
function isLightFixedSwatchHex6(h) {
  return h === "ffffff" || h === "d8d8d8";
}

/**
 * className สำหรับไอคอน Check บนวงสีถาด — พื้นขาว / เทาอ่อนสุดท้ายของชุดคงที่ ใช้สีเข้มเพื่อมองเห็น
 */
export function swatchSelectedCheckClassName(bgCssColor) {
  if (bgCssColor == null || bgCssColor === "") return "size-4 text-white";
  const raw = String(bgCssColor).trim().replace(/\s/g, "");
  const hexMatch = raw.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hexMatch) {
    let h = hexMatch[1].toLowerCase();
    if (h.length === 3) {
      h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    }
    if (isLightFixedSwatchHex6(h)) return CHECK_ON_LIGHT;
    return "size-4 text-white";
  }
  const rgb = raw.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgb) {
    const r = Number(rgb[1]);
    const g = Number(rgb[2]);
    const b = Number(rgb[3]);
    if (r === 255 && g === 255 && b === 255) return CHECK_ON_LIGHT;
    if (r === 216 && g === 216 && b === 216) return CHECK_ON_LIGHT;
  }
  return "size-4 text-white";
}
