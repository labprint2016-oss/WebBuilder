import { memo } from "react";

export const hasMenuBarLogoSrc = (src) =>
  typeof src === "string" && src.trim() !== "";

function MenuBarLogo({
  src,
  height,
  className = "object-contain",
  textClassName = "font-semibold text-[25px] leading-none",
  alt = "logo",
}) {
  const logoSrc = hasMenuBarLogoSrc(src) ? src.trim() : "";
  const logoHeight = Number.isFinite(Number(height)) ? Number(height) : 35;

  if (!logoSrc) {
    return (
      <h1
        className={textClassName}
        style={{
          margin: 0,
          minHeight: logoHeight,
          display: "flex",
          alignItems: "center",
          transform: "translateZ(0)",
        }}
      >
        LOGOAPP
      </h1>
    );
  }

  return (
    <img
      src={logoSrc}
      alt={alt}
      className={className}
      style={{ height: logoHeight, transform: "translateZ(0)" }}
      draggable={false}
    />
  );
}

export default memo(MenuBarLogo);
