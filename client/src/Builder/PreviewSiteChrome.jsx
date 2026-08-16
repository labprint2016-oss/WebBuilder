import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import IconAwsome from "./IconAwsome";

const HeroPage = lazy(() => import("./hero"));

const opacity_2_hex = (opcy) => {
  const safe = Number.isFinite(Number(opcy)) ? Number(opcy) : 255;
  return safe.toString(16).toUpperCase().padStart(2, "0");
};

const createThemeSetColor = (theme) => {
  return (color, opacity = null, isGradient = false, degree = null) => {
    if (isGradient && Array.isArray(color) && Array.isArray(opacity)) {
      const resolveGradientStop = (stopColor, stopOpacity) => {
        if (typeof stopColor === "string") {
          return stopColor + opacity_2_hex(stopOpacity ?? 255);
        }
        const palette = theme?.[stopColor?.type];
        if (!Array.isArray(palette) || palette[stopColor?.index] == null) {
          return "#ffffff" + opacity_2_hex(stopOpacity ?? 255);
        }
        return palette[stopColor.index] + opacity_2_hex(stopOpacity ?? 255);
      };
      const color1 = resolveGradientStop(color[0], opacity[0]);
      const color2 = resolveGradientStop(color[1], opacity[1]);
      return `linear-gradient(${degree ?? 0}deg, ${color1} 0%, ${color2} 100%)`;
    }

    if (color == null) return "#ffffff" + opacity_2_hex(opacity ?? 255);
    if (typeof color === "string") {
      return color + opacity_2_hex(opacity ?? 255);
    }
    const palette = theme?.[color?.type];
    if (!Array.isArray(palette) || palette[color?.index] == null) {
      return "#ffffff" + opacity_2_hex(opacity ?? 255);
    }
    return palette[color.index] + opacity_2_hex(opacity ?? 255);
  };
};

const toBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1";
  }
  return false;
};

const getTopBarVisibleHeight = (topBar = {}, device = "Desktop") => {
  if (topBar?.hideTopBarEverywhere) return 0;
  const topBarHeight = Number(topBar?.topBarHeight);
  const safeHeight = Number.isFinite(topBarHeight) ? topBarHeight : 52;
  if (device === "Tablet" || device === "Mobile") {
    const mode = topBar?.tabletTopBarMode || "social";
    return mode === "off" ? 0 : safeHeight;
  }
  return safeHeight;
};

const hasVisibleMenuIcon = (icon) =>
  Boolean(icon?.name && icon?.type && icon.name !== "fa0");

const normalizeTopBarIcon = (icon) =>
  icon?.name && icon.name !== "fa0" ? icon : { type: "fas", name: "faHouse" };

const normalizeUrlForNavigation = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (
    raw.startsWith("/") ||
    raw.startsWith("#") ||
    raw.startsWith("?") ||
    /^(https?:\/\/)/i.test(raw)
  ) {
    return raw;
  }
  return `https://${raw}`;
};

const fallbackResolveMenuLink = (menuItem) => {
  const type = String(menuItem?.type || "").toLowerCase();
  const target = menuItem?.target === "_blank" ? "_blank" : "_self";
  const urlValue = normalizeUrlForNavigation(menuItem?.url);
  if (type === "url" || (!type && urlValue)) {
    if (!urlValue) return { href: "#", target, disabled: true };
    return { href: urlValue, target, disabled: false };
  }

  const legacyPageRef = String(menuItem?.page || menuItem?.link || "").trim();
  if (!legacyPageRef) return { href: "#", target: "_self", disabled: true };

  // Fallback mode (without website page map): keep page label in query for compatibility.
  return {
    href: `/?page=${encodeURIComponent(legacyPageRef)}`,
    target,
    disabled: false,
  };
};

const resolveMenuLinkMeta = (menuItem, resolveMenuLink, menuLinksEnabled) => {
  if (!menuLinksEnabled) {
    return { href: "#", target: "_self", disabled: true };
  }
  const custom = typeof resolveMenuLink === "function" ? resolveMenuLink(menuItem) : null;
  if (custom && typeof custom === "object") {
    const href = String(custom.href || "").trim() || "#";
    const target = custom.target === "_blank" ? "_blank" : "_self";
    const disabled = custom.disabled === true || href === "#";
    return { href, target, disabled };
  }
  return fallbackResolveMenuLink(menuItem);
};

function PreviewTopBar({ topBar = {}, theme, device = "Desktop" }) {
  const setColor = useMemo(() => createThemeSetColor(theme), [theme]);
  const {
    ableLeft = true,
    ableRight = true,
    topBarHeight = 52,
    isGradient = false,
    bgColor = "#333333",
    bgOpacity = 255,
    bgColorGradient = [],
    bgOpacityGradient = [255, 255],
    bgDegree = 0,
    borderSize = 26,
    radius = 50,
    radiusText = 50,
    borderTextSize = 26,
    iconGroup = [],
    textGroup = [],
    hideTopBarEverywhere = false,
    tabletTopBarMode = "social",
    isFluidLayout = false,
  } = topBar;

  if (hideTopBarEverywhere) return null;

  const background = setColor(
    isGradient ? bgColorGradient : bgColor,
    isGradient ? bgOpacityGradient : bgOpacity,
    isGradient,
    bgDegree
  );

  const topBarInnerBaseClass = toBoolean(isFluidLayout)
    ? "relative z-10 h-full w-full min-w-0 max-w-none"
    : "relative z-10 mx-auto h-full w-full min-w-0 max-w-[1280px]";

  const width = device === "Desktop" ? "100%" : device === "Mobile" ? 375 : 768;

  const IconGroup = () => {
    if (!ableLeft) return <div />;
    return (
      <div className="flex gap-[10px]">
        {iconGroup.map((item, index) => {
          const safeIcon = normalizeTopBarIcon(item?.icon);
          const href =
            item?.url && /^(https?:\/\/)/i.test(item.url)
              ? item.url
              : item?.url
                ? `https://${item.url}`
                : "#";
          return (
            <a
              key={`top-icon-${index}`}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => {
                if (!item?.url) event.preventDefault();
              }}
              className="flex items-center justify-center"
              style={{
                width: borderSize,
                height: borderSize,
                background: setColor(item?.bgColor, item?.bgOpacity),
                borderRadius: `${radius}%`,
                textDecoration: "none",
              }}
            >
              <IconAwsome
                iconType={safeIcon.type}
                iconName={safeIcon.name}
                style={{
                  color: setColor(item?.iconColor, item?.iconOpacity),
                  fontSize: item?.iconSize,
                }}
              />
            </a>
          );
        })}
      </div>
    );
  };

  const TextGroup = () => {
    if (!ableRight) return <div />;
    return (
      <div className="flex gap-[12px]">
        {textGroup.map((item, index) => {
          const safeIcon = normalizeTopBarIcon(item?.icon);
          return (
            <div
              key={`top-text-${index}`}
              className="h-full shrink-0 flex items-center text-[10px]"
            >
              <div
                className="flex items-center justify-center"
                style={{
                  width: borderTextSize,
                  height: borderTextSize,
                  background: setColor(item?.bgColor, item?.bgOpacity),
                  borderRadius: `${radiusText}%`,
                }}
              >
                <IconAwsome
                  iconType={safeIcon.type}
                  iconName={safeIcon.name}
                  style={{
                    color: setColor(item?.iconColor, item?.iconOpacity),
                    fontSize: item?.iconSize,
                  }}
                />
              </div>
              <div
                className="ml-2 whitespace-nowrap"
                style={{
                  color: setColor(item?.textColor, item?.textOpacity),
                  fontSize: item?.textSize,
                }}
              >
                {item?.text}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (device === "Tablet") {
    if (tabletTopBarMode === "off") return null;
    return (
      <header
        className="relative z-[140] flex min-w-0 w-full max-w-full shrink-0 items-center justify-center overflow-visible px-3 sm:px-6 backdrop-blur"
        style={{ width, maxWidth: "100%", height: topBarHeight, background }}
      >
        <div className={`${topBarInnerBaseClass} flex items-center justify-center`}>
          {tabletTopBarMode === "text" ? <TextGroup /> : <IconGroup />}
        </div>
      </header>
    );
  }

  if (device === "Mobile") {
    if (tabletTopBarMode === "off") return null;
    return (
      <header
        className="relative z-[140] flex min-w-0 w-full max-w-full shrink-0 items-center justify-center overflow-visible px-3 sm:px-6 backdrop-blur"
        style={{ width, maxWidth: "100%", height: topBarHeight, background }}
      >
        <div className={`${topBarInnerBaseClass} flex items-center justify-center`}>
          <IconGroup />
        </div>
      </header>
    );
  }

  return (
    <header
      className="relative z-[140] flex min-w-0 w-full max-w-full shrink-0 items-center overflow-visible px-3 sm:px-6 backdrop-blur"
      style={{ width, height: topBarHeight, background }}
    >
      <div className={`${topBarInnerBaseClass} flex items-center justify-between`}>
        <IconGroup />
        <TextGroup />
      </div>
    </header>
  );
}

export function PreviewFooterBar({ footerBar = {}, theme, device = "Desktop" }) {
  const setColor = useMemo(() => createThemeSetColor(theme), [theme]);
  const {
    footerHeight = 46,
    isGradient = false,
    bgColor = "#111827",
    bgOpacity = 255,
    bgColorGradient = [],
    bgOpacityGradient = [255, 255],
    bgDegree = 0,
    logo = "",
    logoHeight = 35,
    logoPosition: logoPositionRaw = "center",
    textColor = "#ffffff",
    textOpacity = 255,
    textSize = 13,
    leftText = "© 2026 Domain.com",
    leftIcon = { name: null, type: null },
    rightText = "All rights reserved.",
    rightIcon = { name: null, type: null },
    isFluidLayout = false,
  } = footerBar || {};

  const width = device === "Desktop" ? "100%" : device === "Mobile" ? 375 : 768;
  const background = setColor(
    isGradient ? bgColorGradient : bgColor,
    isGradient ? bgOpacityGradient : bgOpacity,
    isGradient,
    isGradient ? bgDegree : null
  );
  const textColorValue = setColor(textColor, textOpacity);
  const hasFooterLogo = String(logo || "").trim() !== "";
  const logoPosition = ["hidden", "left", "center", "right"].includes(
    String(logoPositionRaw || "").toLowerCase()
  )
    ? String(logoPositionRaw || "").toLowerCase()
    : "center";
  const showFooterLogoLeft = hasFooterLogo && logoPosition === "left";
  const showFooterLogoCenter = hasFooterLogo && logoPosition === "center";
  const showFooterLogoRight = hasFooterLogo && logoPosition === "right";
  const footerInnerBaseClass = toBoolean(isFluidLayout)
    ? "relative z-10 h-full w-full min-w-0 max-w-none"
    : "relative z-10 mx-auto h-full w-full min-w-0 max-w-[1280px]";

  return (
    <footer
      className="relative z-[120] flex min-w-0 w-full max-w-full shrink-0 items-center px-3 sm:px-6"
      style={{ width, height: footerHeight, background }}
    >
      <div className={`${footerInnerBaseClass} flex items-center justify-between gap-4`}>
        <div
          className="min-w-0 flex flex-1 items-center gap-2"
          style={{ color: textColorValue, fontSize: `${textSize}px` }}
        >
          {showFooterLogoLeft ? (
            <img
              src={logo}
              alt="footer-logo"
              className="object-contain"
              style={{ height: logoHeight, maxWidth: 220 }}
            />
          ) : null}
          {hasVisibleMenuIcon(leftIcon) ? (
            <IconAwsome
              iconName={leftIcon.name}
              iconType={leftIcon.type}
              style={{ marginRight: 2 }}
            />
          ) : null}
          <span className="truncate">{leftText}</span>
        </div>
        {showFooterLogoCenter ? (
          <div className="shrink-0 px-2">
            <img
              src={logo}
              alt="footer-logo"
              className="object-contain"
              style={{ height: logoHeight, maxWidth: 220 }}
            />
          </div>
        ) : null}
        <div
          className="min-w-0 flex flex-1 items-center justify-end gap-2 text-right"
          style={{ color: textColorValue, fontSize: `${textSize}px` }}
        >
          {showFooterLogoRight ? (
            <img
              src={logo}
              alt="footer-logo"
              className="object-contain"
              style={{ height: logoHeight, maxWidth: 220 }}
            />
          ) : null}
          {hasVisibleMenuIcon(rightIcon) ? (
            <IconAwsome
              iconName={rightIcon.name}
              iconType={rightIcon.type}
              style={{ marginRight: 2 }}
            />
          ) : null}
          <span className="truncate">{rightText}</span>
        </div>
      </div>
    </footer>
  );
}

function PreviewMenuBar({
  menus = [],
  menuBarDesktop = {},
  theme,
  device = "Desktop",
  isOverlay = false,
  overlayTop = 0,
  menuLinksEnabled = false,
  resolveMenuLink = null,
}) {
  const setColor = useMemo(() => createThemeSetColor(theme), [theme]);
  const {
    menuFontSize: fs_D = 15,
    menuFontWeight: fw_D = 400,
    menuColor: color_D = "#333333",
    menuColorOpacity: opct_D = 255,
    hoverMenuColor: hover_D = { type: "mainColor", index: 1 },
    hoverMenuColorOpacity: hoverOpct_D = 255,
    isMenuGradient: isGD_D = false,
    bgMenuColor: bg_D = "#ffffff",
    bgMenuColorGradient: bgGD_D = [],
    bgMenuOpacity: bgo_D = 255,
    bgMenuOpacityGradient: bgoGD_D = [255, 255],
    bgMenuDegree: bgd_D = 0,
    floatingMenuBgColor: floatBg_D = bg_D,
    floatingMenuBgOpacity: floatBgo_D = bgo_D,
    display: dp_D = "right",
    menuHeight: mh_D = 65,
    logo: l_D = "",
    logoHeight: lh_D = 35,
    menuSpace: ms_D = 35,
    divider: dv_D = false,
    dividerStyle: dvs_D = "solid",
    dividerColor: dvc_D = "#333333",
    dividerOpacity: dvo_D = 255,
    dividerWeight: dvw_D = 1,
    subMenuFontSize: s_fs_D = 12,
    subMenuFontWeight: s_fw_D = 200,
    subMenuColor: s_color_D = "#000000",
    subMenuColorOpacity: s_opct_D = 255,
    hoverSubMenuColor: s_hover_D = { type: "mainColor", index: 1 },
    hoverSubMenuColorOpacity: s_hoverOpct_D = 255,
    hoverSubMenuBgColor: s_hoverBg_D = s_color_D,
    hoverSubMenuBgOpacity: s_hoverBgOpct_D = 20,
    isSubMenuGradient: s_isGD_D = false,
    bgSubMenuColor: s_bg_D = "#ffffff",
    bgSubMenuColorGradient: s_bgGD_D = [],
    bgSubMenuOpacity: s_bgo_D = 255,
    bgSubMenuOpacityGradient: s_bgoGD_D = [255, 255],
    bgSubMenuDegree: s_bgd_D = 0,
    subMenuBorderColor: s_bc_D = "#d8d8d8",
    subMenuBorderOpacity: s_bo_D = 255,
    subMenuBorderStyle: s_bs_D = "solid",
    isFluidLayout = false,
    isOverlay: menuOverlayEnabled = false,
  } = menuBarDesktop;

  const menuInnerBaseClass = toBoolean(isFluidLayout)
    ? "relative z-10 h-full w-full min-w-0 max-w-none"
    : "relative z-10 mx-auto h-full w-full min-w-0 max-w-[1280px]";

  const width = device === "Desktop" ? "100%" : device === "Mobile" ? 375 : 768;
  const height = mh_D;
  const shouldOverlay = device === "Desktop" && toBoolean(isOverlay || menuOverlayEnabled);
  const enableScrollFloatingMenu = device === "Desktop" && menuLinksEnabled;

  const menuBg = setColor(
    isGD_D ? bgGD_D : bg_D,
    isGD_D ? bgoGD_D : bgo_D,
    isGD_D,
    isGD_D ? bgd_D : null
  );
  const floatingMenuBg = setColor(floatBg_D, floatBgo_D);
  const [isMenuFloating, setIsMenuFloating] = useState(false);
  const menuBarRef = useRef(null);
  const menuTopSentinelRef = useRef(null);
  const isMenuPinned = enableScrollFloatingMenu && isMenuFloating;
  const showPinnedSpacer = isMenuPinned && !shouldOverlay;
  const menuOuterClassName = `${
    isMenuPinned
      ? "fixed left-0 right-0 top-0"
      : shouldOverlay
        ? "absolute left-0 right-0"
        : "relative"
  } z-[140] flex min-w-0 w-full shrink-0 items-center gap-3 overflow-visible px-3 sm:px-6 transition-[background-color,box-shadow] duration-300`;
  const menuOuterStyle = {
    height,
    width,
    background: isMenuFloating ? floatingMenuBg : menuBg,
    boxShadow: isMenuFloating ? "0 14px 28px rgba(15, 23, 42, 0.16)" : "none",
    ...(shouldOverlay && !isMenuPinned ? { top: overlayTop } : {}),
  };
  const [hoverID, setHoverID] = useState(null);
  const hoverCloseTimerRef = useRef(null);

  useEffect(() => {
    if (!enableScrollFloatingMenu) {
      setIsMenuFloating(false);
      return undefined;
    }

    const sentinel = menuTopSentinelRef.current;
    if (!sentinel) {
      setIsMenuFloating(false);
      return undefined;
    }

    if (typeof window !== "undefined" && "IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries?.[0];
          const nextIsFloating = !(entry?.isIntersecting && entry.intersectionRatio > 0);
          setIsMenuFloating((prev) => (prev === nextIsFloating ? prev : nextIsFloating));
        },
        { root: null, threshold: [0, 1], rootMargin: "-1px 0px 0px 0px" }
      );
      observer.observe(sentinel);
      return () => {
        observer.disconnect();
      };
    }

    const handleScrollState = () => {
      const doc = document?.documentElement;
      const body = document?.body;
      const scrollTop = Number(
        window.scrollY ??
          window.pageYOffset ??
          doc?.scrollTop ??
          body?.scrollTop ??
          0
      );
      const nextIsFloating = scrollTop > 2;
      setIsMenuFloating((prev) => (prev === nextIsFloating ? prev : nextIsFloating));
    };
    handleScrollState();
    window.addEventListener("scroll", handleScrollState, { passive: true, capture: true });
    window.addEventListener("resize", handleScrollState);
    return () => {
      window.removeEventListener("scroll", handleScrollState, { capture: true });
      window.removeEventListener("resize", handleScrollState);
    };
  }, [enableScrollFloatingMenu]);

  const clearHoverCloseTimer = () => {
    if (hoverCloseTimerRef.current) {
      clearTimeout(hoverCloseTimerRef.current);
      hoverCloseTimerRef.current = null;
    }
  };

  const scheduleHoverClose = () => {
    clearHoverCloseTimer();
    hoverCloseTimerRef.current = setTimeout(() => {
      setHoverID(null);
      hoverCloseTimerRef.current = null;
    }, 180);
  };

  useEffect(() => {
    return () => {
      clearHoverCloseTimer();
    };
  }, []);

  const Logo = () => {
    if (l_D) {
      return (
        <img src={l_D} alt="logo" className="object-contain" style={{ height: lh_D }} />
      );
    }
    return <h1 className="font-semibold text-[25px]">Logo App</h1>;
  };

  const length = menus.length;
  let splitMenu;
  if (dp_D === "center") {
    const splitIndex = Math.floor(length / 2);
    splitMenu = [menus.slice(0, splitIndex), menus.slice(splitIndex)];
  }

  const SubMenus = ({
    items,
    setMainHoverID,
    level = 0,
    posClass = "absolute left-1/2 top-full -translate-x-1/2",
    posStyle = {},
  }) => {
    const [subHoverID, setSubHoverID] = useState(null);
    const [childItems, setChildItems] = useState(null);
    const [childTop, setChildTop] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
      const rafId = window.requestAnimationFrame(() => {
        setIsVisible(true);
      });
      return () => window.cancelAnimationFrame(rafId);
    }, []);

    const onEnter = () => {
      setMainHoverID?.(1);
    };

    const onLeave = () => {
      setSubHoverID(null);
      setChildItems(null);
      if (level === 0) {
        setMainHoverID?.(0);
      } else {
        setChildTop(0);
      }
    };

    const noTL = 12;
    const noTR = 12;
    const noBR =
      subHoverID === items[items.length - 1]?.id &&
      Array.isArray(items[items.length - 1]?.children) &&
      items[items.length - 1].children.length > 0
        ? 0
        : 12;
    const noBL = items.length === 1 && level > 0 ? 0 : 12;

    const subMenuStyle = {
      background: setColor(
        s_isGD_D ? s_bgGD_D : s_bg_D,
        s_isGD_D ? s_bgoGD_D : s_bgo_D,
        s_isGD_D,
        s_isGD_D ? s_bgd_D : null
      ),
      borderRadius: 5,
      borderTopLeftRadius: noTL,
      borderTopRightRadius: noTR,
      borderBottomRightRadius: noBR,
      borderBottomLeftRadius: noBL,
    };

    return (
      <div
        className={`${posClass} z-[9999] transform-gpu transition-[opacity,transform] duration-300 ease-out ${
          isVisible ? "translate-y-0 opacity-100" : "-translate-y-1.5 opacity-0"
        }`}
        style={{ ...posStyle, willChange: "transform, opacity" }}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        <div className="relative w-[220px]">
          <div className="rounded-md overflow-hidden" style={subMenuStyle}>
            {items.map((menu) => {
              const { id, name, icon } = menu;
              const hasChildren = Array.isArray(menu.children) && menu.children.length > 0;
              const linkMeta = resolveMenuLinkMeta(
                menu,
                resolveMenuLink,
                menuLinksEnabled
              );

              const textColor = () => {
                if (id === subHoverID) {
                  return setColor(s_hover_D, s_hoverOpct_D);
                }
                return setColor(s_color_D, s_opct_D);
              };

              const bgColor = () => {
                if (id === subHoverID) {
                  return setColor(s_hoverBg_D, s_hoverBgOpct_D);
                }
                return "";
              };

              return (
                <a
                  key={id}
                  href={linkMeta.href}
                  target={linkMeta.target}
                  rel={linkMeta.target === "_blank" ? "noopener noreferrer" : undefined}
                  style={{
                    fontSize: s_fs_D,
                    fontWeight: s_fw_D,
                    color: textColor(),
                    background: bgColor(),
                    borderBottomColor: setColor(s_bc_D, s_bo_D),
                    borderBottomStyle: s_bs_D,
                  }}
                  className={`block cursor-pointer px-4 py-3 border-b last:border-b-0 flex items-center justify-between transition-colors duration-150 ${theme?.textHeading?.value || ""}`}
                  onMouseEnter={(event) => {
                    setSubHoverID(id);
                    if (hasChildren) {
                      setChildItems(menu.children);
                      setChildTop(event.currentTarget.offsetTop);
                    } else if (level === 0) {
                      setChildItems(null);
                      setChildTop(0);
                    }
                  }}
                  onClick={(event) => {
                    if (linkMeta.disabled) {
                      event.preventDefault();
                    }
                  }}
                >
                  <div>
                    {hasVisibleMenuIcon(icon) && (
                      <IconAwsome iconName={icon.name} iconType={icon.type} style={{ marginRight: 3 }} />
                    )}
                    {name}
                  </div>

                  {hasChildren && (
                    <ChevronDown
                      className="ml-2"
                      size={s_fs_D}
                      color={textColor()}
                      style={{
                        transform: "rotate(-90deg)",
                        transition: "transform 150ms ease",
                      }}
                    />
                  )}
                </a>
              );
            })}
          </div>

          {childItems?.length > 0 && (
            <SubMenus
              items={childItems}
              level={level + 1}
              setMainHoverID={setMainHoverID}
              posClass="absolute top-0"
              posStyle={{
                left: "calc(100% + 8px)",
                transform: `translateY(${childTop}px)`,
              }}
            />
          )}
        </div>
      </div>
    );
  };

  const renderMenuItems = (items) => (
    <div className="flex h-full items-stretch" style={{ gap: ms_D }}>
      {items.map((menu, index) => {
        const isHover = hoverID === menu.id;
        const linkMeta = resolveMenuLinkMeta(
          menu,
          resolveMenuLink,
          menuLinksEnabled
        );
        const textColor = isHover
          ? setColor(hover_D, hoverOpct_D)
          : setColor(color_D, opct_D);
        const showDivider = dv_D && index !== items.length - 1;
        return (
          <div
            key={menu.id}
            className="relative h-full flex items-stretch"
            onMouseEnter={() => {
              clearHoverCloseTimer();
              setHoverID(menu.id);
            }}
            onMouseLeave={() => {
              scheduleHoverClose();
            }}
          >
            <a
              href={linkMeta.href}
              target={linkMeta.target}
              rel={linkMeta.target === "_blank" ? "noopener noreferrer" : undefined}
              className="h-full flex items-center px-3 transition-colors duration-150"
              style={{
                fontSize: fs_D,
                fontWeight: fw_D,
                color: textColor,
                textDecoration: "none",
              }}
              onClick={(event) => {
                if (linkMeta.disabled) {
                  event.preventDefault();
                }
              }}
            >
              {hasVisibleMenuIcon(menu.icon) && (
                <IconAwsome
                  iconName={menu.icon.name}
                  iconType={menu.icon.type}
                  style={{ marginRight: 5 }}
                />
              )}
              <span className={`whitespace-nowrap ${theme?.textHeading?.value || ""}`}>
                {menu.name}
              </span>
              {menu.children?.length > 0 && (
                <ChevronDown className="ml-2" size={fs_D} color={textColor} />
              )}
            </a>
            {showDivider && (
              <span
                aria-hidden
                className="absolute top-1/2 -translate-y-1/2 h-4"
                style={{
                  right: -(ms_D / 2) - (Number(dvw_D) || 0) / 2,
                  borderRightWidth: dvw_D,
                  borderRightColor: setColor(dvc_D, dvo_D),
                  borderRightStyle: dvs_D,
                }}
              />
            )}

            {Array.isArray(menu.children) && menu.children.length > 0 && isHover && (
              <SubMenus
                items={menu.children}
                setMainHoverID={(status) => {
                  if (status === 1) {
                    clearHoverCloseTimer();
                    setHoverID(menu.id);
                  } else {
                    scheduleHoverClose();
                  }
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );

  if (dp_D === "center") {
    return (
      <>
        {enableScrollFloatingMenu ? (
          <div
            ref={menuTopSentinelRef}
            aria-hidden
            className="w-full pointer-events-none"
            style={{ height: 1, marginTop: -1 }}
          />
        ) : null}
        {showPinnedSpacer ? <div aria-hidden style={{ height }} /> : null}
        <header
          ref={menuBarRef}
          className={menuOuterClassName}
          style={menuOuterStyle}
        >
          <div
            className={`${menuInnerBaseClass} grid items-stretch`}
            style={{
              gridTemplateColumns: "1fr auto 1fr",
              columnGap: 55,
            }}
          >
            <div className="justify-self-end h-full flex items-stretch">
              {renderMenuItems(splitMenu?.[0] || [])}
            </div>

            <div className="justify-self-center h-full flex items-center">
              <Logo />
            </div>

            <div className="justify-self-start h-full flex items-stretch">
              {renderMenuItems(splitMenu?.[1] || [])}
            </div>
          </div>
        </header>
      </>
    );
  }

  if (dp_D === "left") {
    return (
      <>
        {enableScrollFloatingMenu ? (
          <div
            ref={menuTopSentinelRef}
            aria-hidden
            className="w-full pointer-events-none"
            style={{ height: 1, marginTop: -1 }}
          />
        ) : null}
        {showPinnedSpacer ? <div aria-hidden style={{ height }} /> : null}
        <header
          ref={menuBarRef}
          className={menuOuterClassName}
          style={menuOuterStyle}
        >
          <div className={`${menuInnerBaseClass} flex items-center justify-between`}>
            {renderMenuItems(menus)}
            <Logo />
          </div>
        </header>
      </>
    );
  }

  return (
    <>
      {enableScrollFloatingMenu ? (
        <div
          ref={menuTopSentinelRef}
          aria-hidden
          className="w-full pointer-events-none"
          style={{ height: 1, marginTop: -1 }}
        />
      ) : null}
      {showPinnedSpacer ? <div aria-hidden style={{ height }} /> : null}
      <header
        ref={menuBarRef}
        className={menuOuterClassName}
        style={menuOuterStyle}
      >
        <div className={`${menuInnerBaseClass} flex items-center justify-between`}>
          <Logo />
          {renderMenuItems(menus)}
        </div>
      </header>
    </>
  );
}

function PreviewSiteChrome({
  siteChrome,
  theme,
  device = "Desktop",
  menuLinksEnabled = false,
  resolveMenuLink = null,
}) {
  const resolvedChrome = useMemo(() => siteChrome || {}, [siteChrome]);
  const menus = Array.isArray(resolvedChrome.menus) ? resolvedChrome.menus : [];
  const menuBarDesktop = resolvedChrome.menuBarDesktop || {};
  const topBar = resolvedChrome.topBar || {};
  const footerBar = resolvedChrome.footerBar || {};
  const heroSection = resolvedChrome.heroSection || null;
  const menuOverlayEnabled = device === "Desktop" && toBoolean(menuBarDesktop?.isOverlay);
  const topBarVisibleHeight = getTopBarVisibleHeight(topBar, device);
  const hasFooterContent =
    footerBar && typeof footerBar === "object" && Object.keys(footerBar).length > 0;

  if (!menus.length && !heroSection && !hasFooterContent) return null;

  return (
    <div className="relative w-full shrink-0">
      <PreviewTopBar topBar={topBar} theme={theme} device={device} />
      {device === "Desktop" && menus.length > 0 ? (
        <PreviewMenuBar
          menus={menus}
          menuBarDesktop={menuBarDesktop}
          theme={theme}
          device={device}
          isOverlay={menuOverlayEnabled}
          overlayTop={topBarVisibleHeight}
          menuLinksEnabled={menuLinksEnabled}
          resolveMenuLink={resolveMenuLink}
        />
      ) : null}
      {heroSection ? (
        <Suspense fallback={<div className="relative z-[1] h-[400px] w-full bg-slate-100" />}>
          <HeroPage
            heroSection={heroSection}
            theme={theme}
            device={device}
            readOnly
          />
        </Suspense>
      ) : null}
      {hasFooterContent ? (
        <PreviewFooterBar footerBar={footerBar} theme={theme} device={device} />
      ) : null}
    </div>
  );
}

export default PreviewSiteChrome;
