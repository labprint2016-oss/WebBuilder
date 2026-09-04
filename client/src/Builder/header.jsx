import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { useBuilderContextStore } from "./store/builderContextStore";
import {
  Home,
  SwatchBook,
  
  FileText,
  FilePenLine,
  Copy,
  Trash2,
  Bell,
  Users,
  Settings,
  Gift,
  BarChart3,
  Layers,
  Database,
  Grid3X3,
  MapPin,
  ChevronRight,
  Menu,
  LogOut,
  PanelLeftOpen,
  PanelLeftClose,
  Plus,
  Download,
  SlidersHorizontal,
  RefreshCw,
  Sun,
  Moon,
  Container,
  Monitor,
  Tablet,
  Smartphone,
  Bluetooth,
  Icon,
  ChevronDown,
  Check,
  AlertCircle

} from "lucide-react";
import TextField from "@mui/material/TextField";
import {
  Card,
  CardContent,
  Typography,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  ButtonGroup,
  Snackbar,
} from "@mui/material";
import {
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/16/solid";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
  useNavigate,
} from "react-router-dom";
import IconAwsome from "./IconAwsome";
import ServicePage from "./ServicePage";
import ServiceSelectPage from "./ServiceSelectPage";
import { CirclePicker } from "react-color";
import {
  TOP_BAR_PREVIEW_ID,
  TOP_BAR_PREVIEW_TYPE,
  usePanelPreview,
} from "./panelPreviewStore";
import {
  buildTopBarBackgroundStyle,
  getSliderLiveTopBar,
  normalizeTopBarDegree,
} from "./topBarChromePreview";
import MenuBarLogo from "./MenuBarLogo";



const Header = ({
  menuButtonRef,
  theme,
  toggleDarkMode,
  isDark,
  pageName,
  hasSelectedBuilderPage = false,
  activePageId = "",
  defaultPageId = "",
  option,
  setNavOpen,
  railExpanded = false,
  toggleRailExpanded = null,
  deviceType,
  setDevice,
  builderMode: builderModeProp,
  setBuilderMode,
  menus,
  setOpenBar,
  openBar,
  menuBarDesktop,
  menuBarMobile,
  submitMenuBar,
  topBarData,
  onOpenPreview = null,
  onOpenPageSettings = null,
  onPublishBuilder = null,
  onSelectPage = null,
  onPageCreated = null,
  onBeforePagesChange = null,
  onPagesChanged = null,
  menuPresets = [],
  activeMenuPresetId = null,
  defaultMenuPresetId = null,
  isMenuPresetHydrated = true,
  onCreateMenuPreset = null,
  onSelectMenuPreset = null,
  onSetDefaultMenuPreset = null,
  onRenameMenuPreset = null,
  onDuplicateMenuPreset = null,
  onDeleteMenuPreset = null,
  heroPresets = [],
  activeHeroPresetId = null,
  defaultHeroPresetId = null,
  onHeroStateChange = null,
  formPresets = [],
  activeFormPresetId = null,
  defaultFormPresetId = null,
  isFormsHydrated = true,
  isFormsDirty = false,
  isHeroDirty = false,
  isMenuDirty = false,
  onFormStateChange = null,
  submitForms = null,
}) => {
  const hasVisibleMenuIcon = (icon) =>
    Boolean(icon?.name && icon?.type && icon.name !== "fa0");
  const normalizeTopBarIcon = (icon) =>
    icon?.name && icon.name !== "fa0" ? icon : { type: "fas", name: "faHouse" };
  useNavigate();
  const topBarLive = topBarData;
  const menuBarPreview = usePanelPreview(
    "Menu",
    `chrome:Menu:${deviceType}`
  );
  const menuBarDesktopLive =
    deviceType === "Desktop" && menuBarPreview
      ? menuBarPreview
      : menuBarDesktop;
  const menuBarMobileLive =
    deviceType !== "Desktop" && menuBarPreview
      ? menuBarPreview
      : menuBarMobile;
  const [siteMenuHoverID, setSiteMenuHoverID] = useState(null);
  const siteMenuHoverCloseTimerRef = useRef(null);
  const clearSiteMenuHoverCloseTimer = () => {
    if (siteMenuHoverCloseTimerRef.current) {
      clearTimeout(siteMenuHoverCloseTimerRef.current);
      siteMenuHoverCloseTimerRef.current = null;
    }
  };
  const scheduleSiteMenuHoverClose = () => {
    clearSiteMenuHoverCloseTimer();
    siteMenuHoverCloseTimerRef.current = setTimeout(() => {
      setSiteMenuHoverID(null);
      siteMenuHoverCloseTimerRef.current = null;
    }, 120);
  };
  useEffect(() => {
    return () => {
      clearSiteMenuHoverCloseTimer();
    };
  }, []);
  const storeBuilderMode = useBuilderContextStore((state) => state.builderMode);
  const builderMode = storeBuilderMode || builderModeProp;
  const [optimisticBuilderMode, setOptimisticBuilderMode] =
    useState(builderMode);
  useEffect(() => {
    setOptimisticBuilderMode(builderMode);
  }, [builderMode]);
  useLayoutEffect(() => {
    const perf = window.__builderModePerf;
    if (!perf || perf.to !== optimisticBuilderMode) return;
    perf.headerCommitMs = performance.now() - perf.startedAt;
  }, [optimisticBuilderMode]);

  const toBoolean = (value) => {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value === 1;
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      return normalized === "true" || normalized === "1";
    }
    return false;
  };

  const{
    // Main
    menuFontSize:fs_D,
    menuFontWeight:fw_D,
  
    menuColor:color_D,
    menuColorOpacity:opct_D,
    hoverMenuColor:hover_D,
    hoverMenuColorOpacity:hoverOpct_D,
  
    isMenuGradient:isGD_D,
    bgMenuColor:bg_D,
    bgMenuColorGradient:bgGD_D,
    bgMenuOpacity:bgo_D,
    bgMenuOpacityGradient:bgoGD_D,
    bgMenuDegree:bgd_D,
  
    display:dp_D = "right",
    menuHeight:mh_D = 60,
    isOverlay:isOverlay_D = false,
  
    logo:l_D,
    logoHeight:lh_D,
  
    menuSpace:ms_D,
    divider:dv_D,
    dividerStyle:dvs_D,
    dividerColor:dvc_D,
    dividerOpacity:dvo_D,
    dividerWeight:dvw_D,
    isFluidLayout:menuFluidDesktop,
  
    // Sub
    subMenuFontSize:s_fs_D,
    subMenuFontWeight:s_fw_D,
  
    subMenuColor:s_color_D,
    subMenuColorOpacity:s_opct_D,
    hoverSubMenuColor:s_hover_D,
    hoverSubMenuColorOpacity:s_hoverOpct_D,
    hoverSubMenuBgColor:s_hoverBg_D = s_color_D,
    hoverSubMenuBgOpacity:s_hoverBgOpct_D = 20,
  
    isSubMenuGradient:s_isGD_D,
    bgSubMenuColor:s_bg_D,
    bgSubMenuColorGradient:s_bgGD_D,
    bgSubMenuOpacity:s_bgo_D,
    bgSubMenuOpacityGradient:s_bgoGD_D,
    bgSubMenuDegree:s_bgd_D,
  
    subMenuBorderColor:s_bc_D,
    subMenuBorderOpacity:s_bo_D,
    subMenuBorderStyle:s_bs_D,
  } = menuBarDesktopLive || {};

  const{
    // Main
    isMenuBarGradient:isbrGD_M,
    bgMenuBarColor:bgbr_M,
    bgMenuBarColorGradient:bgbrGD_M,
    bgMenuBarOpacity:bgbro_M,
    bgMenuBarOpacityGradient:bgbroGD_M,
    bgMenuBarDegree:bgbrd_M,

    

    bgButtonColor:bgbtn_M,
    borderButtonColor:bbtn_M,
    iconButtonColor:icn_M,
    bgButtonOpacity:bgbtno_M,
    borderButtonOpacity:bbtno_M,
    iconButtonOpacity:icno_M,
    borderWidth:bw,

    display:dp_M = "right",
    barHeight:brh_M = 56,
  
    logo:l_M,
    logoHeight:lh_M,
  
    isFluidLayout:menuFluidMobile,
  
  
  } = menuBarMobileLive || {};

  const {
    ableLeft,
    hideTopBarEverywhere = false,
    tabletTopBarMode = "social",
    topBarHeight,
    isFluidLayout:topBarFluidLayout,
    isGradient,
    bgColor,
    bgOpacity,
    bgColorGradient,
    bgOpacityGradient,
    bgDegree,
    borderSize,
    radius,
    iconGroup,
  
    ableRight,
    radiusText,
    borderTextSize,
    textGroup,
  }  = topBarLive
  

  const opacity_2_hex = (opcy) => {
    const n = Number(opcy);
    if (!Number.isFinite(n)) return "";
    return Math.max(0, Math.min(255, n))
      .toString(16)
      .toUpperCase()
      .padStart(2, "0");
  };

  const resolveColorHex = (color, fallback = "#ffffff") => {
    if (typeof color === "string" && color.trim()) return color;
    if (color && typeof color === "object") {
      const hex = theme?.[color.type]?.[color.index];
      if (typeof hex === "string" && hex.trim()) return hex;
    }
    return fallback;
  };

  const setColor = (
    color,
    opacity = null,
    isGradient = false,
    degree = null
  ) => {
    if (isGradient) {
      const stops = Array.isArray(color) ? color : [];
      const ops = Array.isArray(opacity) ? opacity : [];
      const color1 = resolveColorHex(stops[0]) + opacity_2_hex(ops[0]);
      const color2 = resolveColorHex(stops[1]) + opacity_2_hex(ops[1]);
      const safeDegree = Number.isFinite(Number(degree)) ? Number(degree) : 0;
      return `linear-gradient(${safeDegree}deg, ${color1} 0%, ${color2} 100%)`;
    }
    return resolveColorHex(color) + opacity_2_hex(opacity);
  };

  const devices = [
    { name: "Desktop", Icon: Monitor },
    { name: "Tablet", Icon: Tablet },
    { name: "Mobile", Icon: Smartphone },
  ];

  function ChangeBuilderModeButton() {
    const disableModeToggle = !hasSelectedBuilderPage;
    const modes = [
      { label: "โหมดออกแบบ", value: "Layout Mode", id: 0 },
      { label: "โหมดแก้ไข", value: "Editor Mode", id: 1 },
    ];

    return (
      <div className="dash-header-btn-group" role="group">
        {modes.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            disabled={disableModeToggle}
            className={`dash-header-btn-group-btn ${
              value === optimisticBuilderMode ? "is-active" : ""
            }`}
            onClick={() => {
              if (disableModeToggle) return;
              setOptimisticBuilderMode(value);
              setBuilderMode(value);
            }}
          >
            {label}
          </button>
        ))}
      </div>
    );
  }

  const [done,setDone] = useState(false)
  const [saveFailed, setSaveFailed] = useState({ open: false, message: "" });
  const [isSavingMenuBar, setIsSavingMenuBar] = useState(false);
  const [isPublishingBuilder, setIsPublishingBuilder] = useState(false);
  const MIN_SAVE_FEEDBACK_MS = 700;

  function Breadcrumbs() {
    if (option !== "Builder") return;
    const textLabel = pageName ? pageName : "เลือกหน้า";

    return (
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          className="dash-header-select inline-flex min-w-0 max-w-full items-center gap-2 rounded-md border px-3 py-1.5 text-[12px] font-medium transition-opacity hover:opacity-90"
          onClick={() => {
            if (option !== "Builder") return;
            setOpenSelectPageModal(true);
          }}
        >
          <span className="material-icons-outlined shrink-0 text-[18px]">article</span>
          <span className="truncate">{textLabel}</span>
        </button>
        <button
          type="button"
          className="dash-button inline-flex items-center gap-2 rounded-md border border-0 px-3 py-1.5 text-[12px] font-medium focus:z-10 focus:ring-0 focus:ring-blue-400 focus:outline-none hover:opacity-90"
          onClick={() => {
            setOpenPageModal(true);
          }}
        >
          <FileText size={16} />
          สร้างหน้าใหม่
        </button>
      </div>
    );
  }

  function DeviceSelector() {
    return (
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center divide-x divide-gray-700 divide-solid">
        <div className={`grid grid-cols-3`}>
          {devices.map((device, i) => {
            const { Icon, name } = device;
            return (
              <div
                key={name}
                className={`col-span-1 h-6 flex items-center justify-center ${
                  i !== devices.length - 1
                    ? "border-r-gray-400 border-r border-dashed"
                    : ""
                } `}
              >
                <div className={`h-[35px]`}>
                  <Button
                    className={
                      deviceType === name
                        ? "dash-header-device-active"
                        : "dash-header-device-idle"
                    }
                    sx={{
                      backgroundColor: "transparent",
                      minWidth: 5,
                      marginBottom: 20,
                      color: "inherit",
                    }}
                    onClick={() => {
                      setDevice(name);
                      if (
                        option === "Menu" &&
                        activeMenuPresetId &&
                        ["Tablet", "Mobile"].includes(name)
                      ) {
                        setNavOpen(true);
                      }
                    }}
                  >
                    <Icon
                      className={`${
                        i === 0 ? "mr-1" : i === 2 ? "ml-1" : "mx-1"
                      }`}
                    />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const open = (type) => {
    if (type === openBar) {
      setOpenBar(false);
    } else {
      setOpenBar(type);
    }
  };

  const w = deviceType === "Desktop" ? "100%" : deviceType === "Mobile" ? 375 : 768
  const desktopMenuHeight = Number(mh_D);
  const mobileBarHeight = Number(brh_M);
  const h =
    deviceType === "Desktop"
      ? Number.isFinite(desktopMenuHeight) && desktopMenuHeight > 0
        ? desktopMenuHeight
        : 60
      : Number.isFinite(mobileBarHeight) && mobileBarHeight > 0
        ? mobileBarHeight
        : 56;

  const MenuBar = () => {
    const fluidLayoutValue =
      (deviceType === "Desktop"
        ? menuFluidDesktop
        : menuFluidMobile);
    const isFluidLayoutEnabled = toBoolean(fluidLayoutValue);
    const menuInnerBaseClass = isFluidLayoutEnabled
      ? "relative z-10 h-full w-full min-w-0 max-w-none"
      : "relative z-10 mx-auto h-full w-full min-w-0 max-w-[1280px]";
    const length = menus.length;
    let spiltMenu;
    if (dp_D === "center") {
      const splitIndex = Math.floor(length / 2);
      const left = menus.slice(0, splitIndex);
      const right = menus.slice(splitIndex);
      spiltMenu = [left, right];
    }


    const logo = deviceType === "Desktop" ? l_D:l_M
    const logoHeight = deviceType === "Desktop" ? lh_D:lh_M


    const logoNode = (
      <div style={{ transform: "translateZ(0)" }}>
        <MenuBarLogo src={logo} height={logoHeight} />
      </div>
    );

    const SubMenus = ({
      items,
      setMainHoverID,
      level = 0,
      posClass = "absolute left-1/2 top-full -translate-x-1/2",
      posStyle = {},
    }) => {



     
    
      const [subHoverID, setSubHoverID] = useState(null);


    
      // ✅ สำหรับเมนูชั้นถัดไป
      const [childItems, setChildItems] = useState(null);
      const [childTop, setChildTop] = useState(0);
    
      // ให้ main menu ไม่ดับตอนอยู่ใน submenu
      const onEnter = () => {
        // ให้ main menu ยังถือว่า hover อยู่
        setMainHoverID?.(1);
      };

      const onLeave = () => {
        setSubHoverID(null);
        setChildItems(null);
        // ✅ ปิดทั้งหมดเฉพาะ root เท่านั้น
        if (level === 0) {
          setMainHoverID?.(0);
        } else {
          // ✅ ถ้า item ไม่มี children: ปิด submenu ชั้นถัดไปทันที
          setChildItems(null);
          setChildTop(0);
          
        }
        // ❌ level > 0 ไม่ต้องทำอะไร (กันยุติ hover ตอนกลับไปชั้นก่อนหน้า)
      };


      const noTL = level > 0?0:5
      const noTR = subHoverID === items[0].id && items[0].children.length > 0?0:5
      const noBR = subHoverID === items[items.length-1].id && items[items.length-1].children.length  > 0?0:5
      const noBL = items.length === 1 && level > 0?0:5



      const subMenuStyle = {
        background: setColor(
          s_isGD_D ? s_bgGD_D : s_bg_D,
          s_isGD_D ? s_bgoGD_D : s_bgo_D,
          s_isGD_D,
          s_isGD_D ? s_bgd_D : null
        ),borderRadius:5,borderTopLeftRadius:noTL,borderTopRightRadius:noTR,borderBottomRightRadius:noBR,borderBottomLeftRadius:noBL

      };
    
      return (
        <div
          className={`${posClass} z-[9999]`}
          style={posStyle}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
        >
          {/* ✅ ทำให้ตัวกล่องเป็น relative เพื่อวาง submenu ซ้อนแบบ absolute ได้ */}
          <div className="relative w-[220px]">
            {/* ✅ กล่องรายการ (ยัง overflow-hidden ได้ เพราะ submenu ชั้นถัดไปจะ render เป็น sibling ไม่ถูก clip) */}
            <div
              className={`rounded-md bg-white/95 overflow-hidden`}
              style={subMenuStyle}
            >
              {items.map((menu) => {
                const { id,name,icon } = menu;
                const hasChildren = menu.children?.length > 0;
    
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
                    style={{
                      fontSize: s_fs_D,
                      fontWeight: s_fw_D, // ✅ ชื่อให้ตรงกับ state ของคุณ
                      color: textColor(),
                      background: bgColor(),
                      borderBottomColor: setColor(
                        s_bc_D,
                        s_bo_D
                      ),
                      borderBottomStyle: s_bs_D,
                    }}
                    className={`block px-4 py-3 border-b last:border-b-0 flex items-center justify-between ${theme?.textHeading.value}`}
                    onMouseEnter={(e) => {
                      setSubHoverID(id);
                      if (hasChildren) {
                        setChildItems(menu.children);
                        setChildTop(e.currentTarget.offsetTop);
                      } else {
                        // ✅ ปิดเฉพาะตอนอยู่ level0
                        if (level === 0) {
                          setChildItems(null);
                          setChildTop(0);
                        }
                      }
                    }}
                  >
                    <div>
                      {hasVisibleMenuIcon(icon) && (
                        <IconAwsome iconName={icon.name} iconType={icon.type} style={{marginRight:3}}/>
                      )}
                      {name}
                    </div>
                  
                    {hasChildren && (
                      <ChevronDown
                        className="ml-2"
                        size={s_fs_D}
                        color={textColor()}
                        style={{
                          transform: "rotate(-90deg)", // ให้ชี้ไปทางขวา (optional)
                          transition: "transform 150ms ease",
                        }}
                      />
                    )}
                  </a>
                );
              })}
            </div>
    
            {/* ✅ submenu ชั้นถัดไป: วางต่อจาก item ที่ hover อยู่ */}
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

    const Menus = ({ items }) => {
      

      return (
        <div className="flex h-full items-stretch cursor-pointer" style={{ gap: ms_D }}>
          {items.map((menu, i) => {
            const { id,name,icon } = menu;


            const isHover = siteMenuHoverID === id;
            const textColor = isHover
              ? setColor(hover_D, hoverOpct_D)
              : setColor(color_D, opct_D);

            const showDivider = dv_D && i !== items.length - 1;

            return (
              <div
                key={menu.id}
                className="relative h-full flex items-stretch"
                onMouseEnter={() => {
                  clearSiteMenuHoverCloseTimer();
                  setSiteMenuHoverID(id);
                }}
                onMouseLeave={() => {
                  scheduleSiteMenuHoverClose();
                }}
              >
                {/* ✅ Hitbox ที่ใหญ่จริง */}
                <button
                  type="button"
                  className="h-full flex items-center px-3"
                  style={{
                    fontSize: fs_D,
                    fontWeight: fw_D,
                    color: textColor,
                    cursor:"pointer",
                  }}
                >
                  {hasVisibleMenuIcon(icon) && (
                    <IconAwsome iconName={icon.name} iconType={icon.type} style={{marginRight:5}}/>
                  )}
                  <span className={`whitespace-nowrap ${theme?.textHeading.value}`}>{name}</span>
                  {menu.children?.length > 0 && (
                    <ChevronDown
                      className="ml-2"
                      style={{
                        fontWeight: fw_D,
                      }}
                      size={fs_D}
                      color={textColor}
                    />
                  )}
                </button>

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

                {menu.children?.length > 0 && isHover && (
                  <SubMenus
                    items={menu.children}
                    setMainHoverID={(n) => {
                      if (n === 1) {
                        clearSiteMenuHoverCloseTimer();
                        setSiteMenuHoverID(id);
                      } else {
                        scheduleSiteMenuHoverClose();
                      }
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      );
    };
    

    
    const bg = ()=>{
      if(deviceType === "Desktop"){
        return setColor(
          isGD_D ? bgGD_D : bg_D,
          isGD_D ? bgoGD_D : bgo_D,
          isGD_D,
          isGD_D ? bgd_D : null)
      }
      return setColor(
        isbrGD_M ? bgbrGD_M : bgbr_M,
        isbrGD_M ? bgbroGD_M : bgbro_M,
        isbrGD_M,
        isbrGD_M? bgbrd_M : null)
    }
        

    const menuBg = bg();
    const overlayOn =
      deviceType === "Desktop" && toBoolean(isOverlay_D);
    const overlayTop = hideTopBarEverywhere
      ? 0
      : Number.isFinite(Number(topBarHeight))
        ? Number(topBarHeight)
        : 52;
    const menuPositionClass = overlayOn
      ? "absolute left-0 right-0 z-[140]"
      : "relative z-[120]";
    const menuStyle = {
      height: h,
      background: menuBg,
      width:w,
      border: "none",
      borderBottom: "none",
      borderBottomWidth: 0,
      borderColor: "transparent",
      boxShadow: "none",
      ...(overlayOn ? { top: overlayTop } : {}),
    };


    const MenuButton = ()=>{
      const menuButtonClassName = [
        "p-[5px] rounded-lg text-slate-700 dark:text-white/80 border flex items-center justify-center",
        ["Mobile", "Tablet"].includes(deviceType) ? "inline-flex" : "hidden sm:inline-flex",
      ].join(" ");
      return (
        <button
        className={menuButtonClassName} ref={menuButtonRef}
        style={{
          backgroundColor:setColor(bgbtn_M,bgbtno_M),
          borderColor:setColor(bbtn_M,bbtno_M),
          color:setColor(icn_M,icno_M),
          borderWidth:bw,
        }}
        onClick={(e) => {
          e.stopPropagation()
          setNavOpen((s) => !s);
        }}
        aria-label="Collapse navigation"
      >
        <Menu className="h-5 w-5" />
      </button>
      )
    }


   

    if (dp_D === "center" && deviceType === "Desktop") {
      return (
        <header
          data-builder-menu-bar=""
          className={`${menuPositionClass} flex min-w-0 w-full shrink-0 items-center gap-3 overflow-visible px-3 sm:px-6 backdrop-blur`}
          style={menuStyle}
          onClick={() => open("Menu")}
        >
          <div
            data-builder-menu-inner=""
            className={`${menuInnerBaseClass} grid items-stretch`}
            style={{
              gridTemplateColumns: "1fr auto 1fr",
              columnGap: 55,
            }}
          >
            <div className="justify-self-end h-full flex items-stretch">
              <Menus items={spiltMenu[0]} />
            </div>

            <div className="justify-self-center h-full flex items-center">
              {logoNode}
            </div>

            <div className="justify-self-start h-full flex items-stretch">
              <Menus items={spiltMenu[1]} />
            </div>
          </div>
        </header>
      );
    }

    if (deviceType === "Desktop") {
    return (
      <header
        data-builder-menu-bar=""
        className={`${menuPositionClass} flex min-w-0 w-full shrink-0 items-center gap-3 overflow-visible px-3 sm:px-6 backdrop-blur`}
        style={menuStyle}
        onClick={() => open("Menu")}
      >
        <div data-builder-menu-inner="" className={`${menuInnerBaseClass} flex items-center justify-between`}>
          {logoNode}

          <Menus items={menus} />
        </div>
      </header>
    );}


    if(dp_M === "right" && ["Mobile","Tablet"].includes(deviceType)){
      return(
        <div className="flex w-full min-w-0 justify-center overflow-x-hidden">
        <header
       className="relative z-[120] flex min-w-0 w-full max-w-full shrink-0 items-center gap-3 overflow-visible px-3 sm:px-6 backdrop-blur"
       style={menuStyle}
       onClick={() => open("Menu")}
     >
       <div className={`${menuInnerBaseClass} flex items-center justify-between`}>
         {logoNode}

        <MenuButton/>
       </div>
     </header>
     </div>
      )
    }

    if(dp_M === "left" && ["Mobile","Tablet"].includes(deviceType)){
      return(
        <div className="flex w-full min-w-0 justify-center overflow-x-hidden">
        <header
       className="relative z-[120] flex min-w-0 w-full max-w-full shrink-0 items-center gap-3 overflow-visible px-3 sm:px-6 backdrop-blur"
       style={menuStyle}
       onClick={() => open("Menu")}
     >
       <div className={`${menuInnerBaseClass} flex items-center justify-between`}>

       <MenuButton/>

         {logoNode}


       </div>
     </header>
     </div>
      )
    }
  };

  const TopBar = ()=>{
    const topBarPreview = usePanelPreview(
      TOP_BAR_PREVIEW_TYPE,
      TOP_BAR_PREVIEW_ID
    );
    const liveTopBar = topBarPreview || getSliderLiveTopBar() || topBarLive;
    const {
      ableLeft,
      hideTopBarEverywhere = false,
      tabletTopBarMode = "social",
      topBarHeight,
      isFluidLayout: topBarFluidLayout,
      isGradient,
      bgColor,
      bgOpacity,
      bgColorGradient,
      bgOpacityGradient,
      bgDegree: bgDegreeRaw,
      borderSize,
      radius,
      iconGroup,
      ableRight,
      radiusText,
      borderTextSize,
      textGroup,
    } = liveTopBar;
    const bgDegree = normalizeTopBarDegree(bgDegreeRaw);
    if (hideTopBarEverywhere) return null;
    const isTopBarFluidLayout = toBoolean(topBarFluidLayout);
    const topBarInnerBaseClass = isTopBarFluidLayout
      ? "relative z-10 h-full w-full min-w-0 max-w-none"
      : "relative z-10 mx-auto h-full w-full min-w-0 max-w-[1280px]";

    const bg = setColor(
      isGradient?bgColorGradient:bgColor,
      isGradient?bgOpacityGradient:bgOpacity,
      isGradient,
      bgDegree
    )
    const topBarBgStyle = buildTopBarBackgroundStyle(isGradient, bg);


    const IconGroup = ()=>{

      if(!ableLeft) return <div></div>

      return(
        <div className="flex gap-[10px]">
        {iconGroup.map(
          (_, i) => {
            const {icon,iconSize,iconColor,iconOpacity,bgColor,bgOpacity,url} = _
            const safeIcon = normalizeTopBarIcon(icon);
            const href =
            url && /^(https?:\/\/)/i.test(url) ? url : url ? `https://${url}` : "#";
            return(
              <a
            key={i}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              if (!url) e.preventDefault();
            }}
            data-builder-topbar-chip="social"
            data-builder-topbar-index={i}
            className="flex items-center justify-center"
            style={{
              width: borderSize,
              height: borderSize,
              background: setColor(bgColor, bgOpacity),
              borderRadius: `${radius}%`,
              textDecoration: "none",
              cursor: url ? "pointer" : "default",
            }}
          >
                <IconAwsome iconType={safeIcon.type} iconName={safeIcon.name} style={{color:setColor(iconColor,iconOpacity),fontSize:iconSize}}/>

              </a>
            )
          }
        )}
      </div>
      )
    }


    const TextGroup = ({ scrollable = false } = {})=>{
      if(!ableRight) return <div></div>
      return(<div
        className={`flex gap-[12px] ${scrollable ? "min-w-max" : ""}`}
        style={scrollable ? { scrollbarWidth: "none", msOverflowStyle: "none" } : undefined}
      >
      {textGroup.map(
        (_, i) => {
          const {text,textSize,textColor,textOpacity,icon,iconSize,iconColor,iconOpacity,bgColor,bgOpacity} = _
          const safeIcon = normalizeTopBarIcon(icon);
          return(
            <div
              className="h-full shrink-0 flex items-center text-[10px]"
              key={i}
            >
              <div
              data-builder-topbar-chip="text"
              data-builder-topbar-index={i}
              className="size-[26px] bg-white rounded-full flex items-center justify-center"
              style={{
              width: borderTextSize,
              height: borderTextSize,
              background: setColor(bgColor, bgOpacity),
              borderRadius: `${radiusText}%`,
              textDecoration: "none",
            }}>
                <IconAwsome iconType={safeIcon.type} iconName={safeIcon.name} style={{color:setColor(iconColor,iconOpacity),fontSize:iconSize}}/>
              </div>
              <div
                data-builder-topbar-text="true"
                data-builder-topbar-index={i}
                className="ml-2 whitespace-nowrap"
                style={{color:setColor(textColor,textOpacity),fontSize:textSize}}
              >{text}</div>
            </div>
          )
        }
      )}
    </div>)
    }

    const mode = tabletTopBarMode || "social";

    if(deviceType === "Tablet"){
      if (mode === "off") return null;
      return(
        <div className="flex w-full min-w-0 justify-center overflow-x-hidden">
           <header
      data-builder-topbar="true"
      className="flex min-w-0 w-full max-w-full shrink-0 items-center gap-3 overflow-x-hidden px-3 sm:px-6   backdrop-blur " style={{width:w,maxWidth:"100%",height:topBarHeight,...topBarBgStyle}}
    >
      <div className={`${topBarInnerBaseClass} flex items-center justify-center`}>
      {mode === "text" ? <TextGroup/> : <IconGroup/>}
      </div>
    </header>
        </div>
      )
    }

    if(deviceType === "Mobile"){
      if (mode === "off") return null;
      return(
        <div className="flex w-full min-w-0 justify-center overflow-x-hidden">
           <header
      data-builder-topbar="true"
      className="flex min-w-0 w-full max-w-full shrink-0 items-center gap-3 overflow-x-hidden px-3 sm:px-6   backdrop-blur " style={{width:w,maxWidth:"100%",height:topBarHeight,...topBarBgStyle}}
      onClick={() => open("Top")}
    >
      <div className={`${topBarInnerBaseClass} flex items-center ${mode === "text" ? "justify-start overflow-hidden" : "justify-center"}`}>
      {mode === "text" ? (
        <div className="w-full overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          <TextGroup scrollable/>
        </div>
      ) : (
        <IconGroup/>
      )}
      </div>
    </header>
        </div>
      )
    }
    return(
      <header
      data-builder-topbar="true"
      className="flex h-[32px] min-w-0 w-full shrink-0 items-center gap-3 overflow-x-hidden px-3 sm:px-6 backdrop-blur " style={{height:topBarHeight,...topBarBgStyle}}
      onClick={() => open("Top")}
    >
      <div className={`${topBarInnerBaseClass} flex items-center justify-between`}>
      <IconGroup/>
        <TextGroup/>
      </div>
    </header>
    )
  }


  const NavBtn = ()=>{
    if (option === "Message") return null;
    return (
      <button
      className="hidden sm:inline-flex p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-white/80"
      onClick={() => {
        if (
          ["Cetegory", "Menu", "Hero", "Forms"].includes(
            option
          )
        )
          return;
        setNavOpen((s) => !s);
      }}
      aria-label="Collapse navigation"
    >
      <Menu className="h-5 w-5" />
    </button>
    )
  }


  const [openPageModal,setOpenPageModal] = useState(false)
  const [openSelectPageModal,setOpenSelectPageModal] = useState(false)
  const [openCreateMenuModal, setOpenCreateMenuModal] = useState(false);
  const [openSelectMenuModal, setOpenSelectMenuModal] = useState(false);
  const [openCreateHeroModal, setOpenCreateHeroModal] = useState(false);
  const [openSelectHeroModal, setOpenSelectHeroModal] = useState(false);
  const [openCreateFormModal, setOpenCreateFormModal] = useState(false);
  const [openSelectFormModal, setOpenSelectFormModal] = useState(false);
  const DUPLICATE_MENU_NAME_MESSAGE = "ชื่อเมนูนี้มีอยู่แล้ว ..... กรุณาใช้ชื่ออื่น";
  const DUPLICATE_HERO_NAME_MESSAGE = "ชื่อ Hero นี้มีอยู่แล้ว ..... กรุณาใช้ชื่ออื่น";
  const DUPLICATE_FORM_NAME_MESSAGE = "ชื่อฟอร์มนี้มีอยู่แล้ว ..... กรุณาใช้ชื่ออื่น";
  const DEFAULT_MENU_SET_MESSAGE = "ตั้งค่าเมนูเริ่มต้นเรียบร้อยแล้ว";
  const DEFAULT_HERO_SET_MESSAGE = "ตั้งค่า Hero เริ่มต้นเรียบร้อยแล้ว";
  const DEFAULT_FORM_SET_MESSAGE = "ตั้งค่าฟอร์มเริ่มต้นเรียบร้อยแล้ว";
  const [newMenuName, setNewMenuName] = useState("");
  const [newMenuNameError, setNewMenuNameError] = useState("");
  const [newHeroName, setNewHeroName] = useState("");
  const [newHeroNameError, setNewHeroNameError] = useState("");
  const [newFormName, setNewFormName] = useState("");
  const [newFormNameError, setNewFormNameError] = useState("");
  const [editingMenuPresetId, setEditingMenuPresetId] = useState(null);
  const [editingMenuPresetName, setEditingMenuPresetName] = useState("");
  const [editingHeroId, setEditingHeroId] = useState(null);
  const [editingHeroName, setEditingHeroName] = useState("");
  const [editingFormId, setEditingFormId] = useState(null);
  const [editingFormName, setEditingFormName] = useState("");
  const [menuPresetFooterMessage, setMenuPresetFooterMessage] = useState("");
  const [heroFooterMessage, setHeroFooterMessage] = useState("");
  const [formFooterMessage, setFormFooterMessage] = useState("");
  const [menuPresetToast, setMenuPresetToast] = useState({ open: false, message: "" });
  const [pendingDeleteMenuPreset, setPendingDeleteMenuPreset] = useState(null);
  const [pendingDeleteHero, setPendingDeleteHero] = useState(null);
  const [pendingDeleteForm, setPendingDeleteForm] = useState(null);
  const [heroCreateResetToken, setHeroCreateResetToken] = useState(0);
  const [heroMutationEvent, setHeroMutationEvent] = useState(null);
  const [formMutationEvent, setFormMutationEvent] = useState(null);
  const [isSavingForms, setIsSavingForms] = useState(false);
  const [heroItems, setHeroItems] = useState(() =>
    Array.isArray(heroPresets) && heroPresets.length > 0
      ? heroPresets
      : [{ id: "hero-preset-1", name: "Hero 1" }]
  );
  const [formItems, setFormItems] = useState(() =>
    Array.isArray(formPresets) && formPresets.length > 0
      ? formPresets.map((item) => ({ id: item.id, name: item.name }))
      : [{ id: "form-preset-1", name: "Form 1" }]
  );
  const [activeHeroId, setActiveHeroId] = useState(null);
  const [defaultHeroId, setDefaultHeroId] = useState(defaultHeroPresetId);
  const [activeFormId, setActiveFormId] = useState(null);
  const [defaultFormId, setDefaultFormId] = useState(defaultFormPresetId);
  const syncedActiveHeroPresetIdRef = useRef(activeHeroPresetId);
  const syncedDefaultHeroPresetIdRef = useRef(defaultHeroPresetId);
  const syncedActiveFormPresetIdRef = useRef(activeFormPresetId);
  const syncedDefaultFormPresetIdRef = useRef(defaultFormPresetId);
  const activeMenuPresetName = useMemo(() => {
    if (!isMenuPresetHydrated) return "กำลังโหลดเมนู...";
    if (!activeMenuPresetId) return "เลือกเมนู";
    const activePreset = menuPresets.find((preset) => preset.id === activeMenuPresetId);
    return activePreset?.name
      ? `${activePreset.name} - กำลังทำงาน`
      : "เลือกเมนู";
  }, [menuPresets, activeMenuPresetId, isMenuPresetHydrated]);
  const activeHeroName = useMemo(() => {
    if (!isMenuPresetHydrated) return "กำลังโหลด Hero...";
    if (!activeHeroId) return "เลือก Hero";
    const activeHero = heroItems.find((hero) => hero.id === activeHeroId);
    return activeHero?.name ? `${activeHero.name} - กำลังทำงาน` : "เลือก Hero";
  }, [heroItems, activeHeroId, isMenuPresetHydrated]);
  const activeFormName = useMemo(() => {
    if (!isFormsHydrated) return "กำลังโหลดฟอร์ม...";
    if (!activeFormId) return "เลือกฟอร์ม";
    const activeForm = formItems.find((form) => form.id === activeFormId);
    return activeForm?.name ? `${activeForm.name} - กำลังทำงาน` : "เลือกฟอร์ม";
  }, [formItems, activeFormId, isFormsHydrated]);
  const isDuplicateFormMessage = formFooterMessage === DUPLICATE_FORM_NAME_MESSAGE;
  const isDefaultFormSuccessMessage = formFooterMessage === DEFAULT_FORM_SET_MESSAGE;
  const showMenuPresetToast = (message) => {
    setMenuPresetToast({ open: true, message });
  };
  const isDuplicateMenuPresetMessage =
    menuPresetFooterMessage === DUPLICATE_MENU_NAME_MESSAGE;
  const isDefaultMenuPresetSuccessMessage =
    menuPresetFooterMessage === DEFAULT_MENU_SET_MESSAGE;
  const isDuplicateHeroMessage = heroFooterMessage === DUPLICATE_HERO_NAME_MESSAGE;
  const isDefaultHeroSuccessMessage = heroFooterMessage === DEFAULT_HERO_SET_MESSAGE;
  useEffect(() => {
    if (!isDuplicateMenuPresetMessage && !isDefaultMenuPresetSuccessMessage) return;
    const timer = setTimeout(() => {
      setMenuPresetFooterMessage("");
    }, 3000);
    return () => clearTimeout(timer);
  }, [isDuplicateMenuPresetMessage, isDefaultMenuPresetSuccessMessage]);
  useEffect(() => {
    if (!isDefaultHeroSuccessMessage) return;
    const timer = setTimeout(() => {
      setHeroFooterMessage("");
    }, 3000);
    return () => clearTimeout(timer);
  }, [isDefaultHeroSuccessMessage]);
  useEffect(() => {
    if (!isDefaultFormSuccessMessage) return;
    const timer = setTimeout(() => {
      setFormFooterMessage("");
    }, 3000);
    return () => clearTimeout(timer);
  }, [isDefaultFormSuccessMessage]);

  useEffect(() => {
    if (heroItems.length === 0) {
      setActiveHeroId((prev) => (prev == null ? prev : null));
      setDefaultHeroId((prev) => (prev == null ? prev : null));
      return;
    }
    const firstHeroId = heroItems[0].id;
    setActiveHeroId((prev) =>
      prev && heroItems.some((hero) => hero.id === prev) ? prev : null
    );
    setDefaultHeroId((prev) =>
      prev && heroItems.some((hero) => hero.id === prev) ? prev : firstHeroId
    );
  }, [heroItems]);
  useEffect(() => {
    if (formItems.length === 0) {
      setActiveFormId((prev) => (prev == null ? prev : null));
      setDefaultFormId((prev) => (prev == null ? prev : null));
      return;
    }
    setActiveFormId((prev) =>
      prev && formItems.some((form) => form.id === prev) ? prev : null
    );
    setDefaultFormId((prev) =>
      prev && formItems.some((form) => form.id === prev) ? prev : null
    );
  }, [formItems]);
  useEffect(() => {
    if (!Array.isArray(heroPresets) || heroPresets.length === 0) return;
    setHeroItems((prev) => {
      if (
        prev.length === heroPresets.length &&
        prev.every(
          (item, idx) =>
            item?.id === heroPresets[idx]?.id && item?.name === heroPresets[idx]?.name
        )
      ) {
        return prev;
      }
      return heroPresets;
    });
  }, [heroPresets]);
  useEffect(() => {
    if (!Array.isArray(formPresets) || formPresets.length === 0) return;
    const nextItems = formPresets.map((item) => ({ id: item.id, name: item.name }));
    setFormItems((prev) => {
      if (
        prev.length === nextItems.length &&
        prev.every(
          (item, idx) =>
            item?.id === nextItems[idx]?.id && item?.name === nextItems[idx]?.name
        )
      ) {
        return prev;
      }
      return nextItems;
    });
  }, [formPresets]);
  useEffect(() => {
    if (syncedActiveHeroPresetIdRef.current === activeHeroPresetId) return;
    syncedActiveHeroPresetIdRef.current = activeHeroPresetId;
    if (activeHeroPresetId == null || activeHeroPresetId === "") {
      setActiveHeroId((prev) => (prev == null ? prev : null));
      return;
    }
    const canUseActiveHeroPresetId =
      typeof activeHeroPresetId === "string" &&
      heroItems.some((hero) => hero.id === activeHeroPresetId);
    if (!canUseActiveHeroPresetId) return;
    setActiveHeroId((prev) => (prev === activeHeroPresetId ? prev : activeHeroPresetId));
  }, [activeHeroPresetId, heroItems]);
  useEffect(() => {
    if (syncedDefaultHeroPresetIdRef.current === defaultHeroPresetId) return;
    syncedDefaultHeroPresetIdRef.current = defaultHeroPresetId;
    const canUseDefaultHeroPresetId =
      typeof defaultHeroPresetId === "string" &&
      heroItems.some((hero) => hero.id === defaultHeroPresetId);
    if (!canUseDefaultHeroPresetId) return;
    setDefaultHeroId((prev) => (prev === defaultHeroPresetId ? prev : defaultHeroPresetId));
  }, [defaultHeroPresetId, heroItems]);
  useEffect(() => {
    if (syncedActiveFormPresetIdRef.current === activeFormPresetId) return;
    syncedActiveFormPresetIdRef.current = activeFormPresetId;
    if (activeFormPresetId == null || activeFormPresetId === "") {
      setActiveFormId((prev) => (prev == null ? prev : null));
      return;
    }
    const canUseActiveFormPresetId =
      typeof activeFormPresetId === "string" &&
      formItems.some((form) => form.id === activeFormPresetId);
    if (!canUseActiveFormPresetId) return;
    setActiveFormId((prev) => (prev === activeFormPresetId ? prev : activeFormPresetId));
  }, [activeFormPresetId, formItems]);
  useEffect(() => {
    if (syncedDefaultFormPresetIdRef.current === defaultFormPresetId) return;
    syncedDefaultFormPresetIdRef.current = defaultFormPresetId;
    const canUseDefaultFormPresetId =
      typeof defaultFormPresetId === "string" &&
      formItems.some((form) => form.id === defaultFormPresetId);
    if (!canUseDefaultFormPresetId) return;
    setDefaultFormId((prev) => (prev === defaultFormPresetId ? prev : defaultFormPresetId));
  }, [defaultFormPresetId, formItems]);
  useEffect(() => {
    if (typeof onHeroStateChange !== "function") return;
    onHeroStateChange({
      heroPresets: heroItems,
      activeHeroPresetId: activeHeroId,
      defaultHeroPresetId: defaultHeroId,
      resetHeroSectionToken: heroCreateResetToken,
      heroMutationEvent,
    });
  }, [heroItems, activeHeroId, defaultHeroId, heroCreateResetToken, heroMutationEvent, onHeroStateChange]);
  useEffect(() => {
    if (typeof onFormStateChange !== "function") return;
    onFormStateChange({
      formPresets: formItems,
      activeFormPresetId: activeFormId ?? null,
      defaultFormPresetId: defaultFormId,
      formMutationEvent,
    });
  }, [formItems, activeFormId, defaultFormId, formMutationEvent, onFormStateChange]);

  const closeCreateMenuModal = () => {
    setOpenCreateMenuModal(false);
    setNewMenuName("");
    setNewMenuNameError("");
  };
  const closeCreateHeroModal = () => {
    setOpenCreateHeroModal(false);
    setNewHeroName("");
    setNewHeroNameError("");
  };
  const closeCreateFormModal = () => {
    setOpenCreateFormModal(false);
    setNewFormName("");
    setNewFormNameError("");
  };

  const closeSelectMenuModal = () => {
    setOpenSelectMenuModal(false);
    setEditingMenuPresetId(null);
    setEditingMenuPresetName("");
    setMenuPresetFooterMessage("");
    setPendingDeleteMenuPreset(null);
  };
  const closeSelectHeroModal = () => {
    setOpenSelectHeroModal(false);
    setEditingHeroId(null);
    setEditingHeroName("");
    setPendingDeleteHero(null);
    setHeroFooterMessage("");
  };
  const closeSelectFormModal = () => {
    setOpenSelectFormModal(false);
    setEditingFormId(null);
    setEditingFormName("");
    setPendingDeleteForm(null);
    setFormFooterMessage("");
  };

  const buildHeroId = () => `hero-preset-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
  const buildFormId = () => `form-preset-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
  const normalizeHeroName = (value) => String(value || "").trim().toLowerCase();
  const normalizeFormName = (value) => String(value || "").trim().toLowerCase();
  const createUniqueHeroName = (baseName) => {
    const cleanBase = String(baseName || "").trim() || "Hero";
    let candidate = `${cleanBase} คัดลอก`;
    let counter = 2;
    const existing = new Set(heroItems.map((hero) => normalizeHeroName(hero.name)));
    while (existing.has(normalizeHeroName(candidate))) {
      candidate = `${cleanBase} คัดลอก ${counter}`;
      counter += 1;
    }
    return candidate;
  };
  const createUniqueFormName = (baseName) => {
    const cleanBase = String(baseName || "").trim() || "Form";
    let candidate = `${cleanBase} คัดลอก`;
    let counter = 2;
    const existing = new Set(formItems.map((form) => normalizeFormName(form.name)));
    while (existing.has(normalizeFormName(candidate))) {
      candidate = `${cleanBase} คัดลอก ${counter}`;
      counter += 1;
    }
    return candidate;
  };
  const commitRenameHero = (heroId, nextName) => {
    const trimmed = String(nextName || "").trim();
    if (trimmed.length < 3) {
      setHeroFooterMessage("ชื่อ Hero ต้องอย่างน้อย 3 ตัวอักษร");
      return { ok: false, reason: "too_short" };
    }
    const duplicate = heroItems.some(
      (hero) => hero.id !== heroId && normalizeHeroName(hero.name) === normalizeHeroName(trimmed)
    );
    if (duplicate) {
      setHeroFooterMessage(DUPLICATE_HERO_NAME_MESSAGE);
      return { ok: false, reason: "duplicate_name" };
    }
    setHeroItems((prev) =>
      prev.map((hero) => (hero.id === heroId ? { ...hero, name: trimmed } : hero))
    );
    setHeroFooterMessage("");
    return { ok: true };
  };
  const commitRenameForm = async (formId, nextName) => {
    const trimmed = String(nextName || "").trim();
    if (trimmed.length < 3) {
      setFormFooterMessage("ชื่อฟอร์มต้องอย่างน้อย 3 ตัวอักษร");
      return { ok: false, reason: "too_short" };
    }
    const duplicate = formItems.some(
      (form) => form.id !== formId && normalizeFormName(form.name) === normalizeFormName(trimmed)
    );
    if (duplicate) {
      setFormFooterMessage(DUPLICATE_FORM_NAME_MESSAGE);
      return { ok: false, reason: "duplicate_name" };
    }
    setFormItems((prev) =>
      prev.map((form) => (form.id === formId ? { ...form, name: trimmed } : form))
    );
    setFormFooterMessage("");
    await handleSaveForms({
      renameFormPreset: { id: formId, name: trimmed },
    });
    return { ok: true };
  };

  const commitRenameMenuPreset = (presetId, name) => {
    if (typeof onRenameMenuPreset !== "function") return { ok: false, reason: "unavailable" };
    const result = onRenameMenuPreset(presetId, name);
    if (!result?.ok) {
      if (result?.reason === "duplicate_name") {
        setMenuPresetFooterMessage(DUPLICATE_MENU_NAME_MESSAGE);
      } else if (result?.reason === "too_short") {
        showMenuPresetToast("ชื่อเมนูต้องอย่างน้อย 3 ตัวอักษร");
      } else {
        showMenuPresetToast("แก้ไขชื่อเมนูไม่สำเร็จ");
      }
      return result;
    }
    setMenuPresetFooterMessage("");
    return result;
  };

  const handleSaveForms = async (saveOptions = {}) => {
    if (isSavingForms) return;
    if (typeof submitForms !== "function") return;
    // บังคับบันทึกได้เมื่อมี overrides (สร้าง/คัดลอก/ลบ/ตั้งชื่อ) แม้ยังไม่ dirty
    const forceSave =
      saveOptions &&
      typeof saveOptions === "object" &&
      Object.keys(saveOptions).length > 0;
    if (!forceSave && !isFormsDirty) return;
    setIsSavingForms(true);
    const saveStartedAt = Date.now();
    const ensureMinimumSavingIndicator = async () => {
      const elapsedMs = Date.now() - saveStartedAt;
      const remainingMs = MIN_SAVE_FEEDBACK_MS - elapsedMs;
      if (remainingMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingMs));
      }
    };
    try {
      const result = await submitForms(saveOptions);
      await ensureMinimumSavingIndicator();
      if (result?.ok) {
        setSaveFailed({ open: false, message: "" });
        setDone(true);
        return;
      }
      if (result?.details != null) {
        console.error("Save forms failed:", result.details);
      }
      setSaveFailed({
        open: true,
        message:
          typeof result?.message === "string" && result.message.trim()
            ? result.message
            : "ไม่สำเร็จ.....กรุณาตรวจสอบอีกครั้ง",
      });
    } catch (error) {
      await ensureMinimumSavingIndicator();
      console.error("Save forms failed:", error);
      setSaveFailed({
        open: true,
        message:
          typeof error?.message === "string" && error.message.trim()
            ? error.message.trim()
            : "ไม่สำเร็จ.....กรุณาตรวจสอบอีกครั้ง",
      });
    } finally {
      setIsSavingForms(false);
    }
  };

  const handleSaveMenuBar = async (saveOptions = {}) => {
    if (isSavingMenuBar) return;
    if (option === "Menu" && (!activeMenuPresetId || !isMenuPresetHydrated || !isMenuDirty)) {
      return;
    }
    if (option === "Hero" && (!activeHeroPresetId || !isMenuPresetHydrated || !isHeroDirty)) {
      return;
    }
    if (typeof submitMenuBar !== "function") return;
    setIsSavingMenuBar(true);
    const saveStartedAt = Date.now();
    const ensureMinimumSavingIndicator = async () => {
      const elapsedMs = Date.now() - saveStartedAt;
      const remainingMs = MIN_SAVE_FEEDBACK_MS - elapsedMs;
      if (remainingMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingMs));
      }
    };
    try {
      const result = await submitMenuBar(saveOptions);
      await ensureMinimumSavingIndicator();
      if (result?.ok) {
        setSaveFailed({ open: false, message: "" });
        setDone(true);
        return;
      }
      if (result?.details != null) {
        console.error("Save menu bar failed:", result.details);
      }
      setSaveFailed({
        open: true,
        message:
          typeof result?.message === "string" && result.message.trim()
            ? result.message
            : "ไม่สำเร็จ.....กรุณาตรวจสอบอีกครั้ง",
      });
    } catch (error) {
      await ensureMinimumSavingIndicator();
      console.error("Save menu bar failed:", error);
      setSaveFailed({
        open: true,
        message:
          typeof error?.message === "string" && error.message.trim()
            ? error.message
            : "ไม่สำเร็จ.....กรุณาตรวจสอบอีกครั้ง",
      });
    } finally {
      setIsSavingMenuBar(false);
    }
  };

  const handlePublishBuilder = async () => {
    if (isPublishingBuilder) return;
    if (typeof onPublishBuilder !== "function") return;

    setIsPublishingBuilder(true);
    const saveStartedAt = Date.now();
    const ensureMinimumSavingIndicator = async () => {
      const elapsedMs = Date.now() - saveStartedAt;
      const remainingMs = MIN_SAVE_FEEDBACK_MS - elapsedMs;
      if (remainingMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingMs));
      }
    };

    try {
      const result = await onPublishBuilder();
      await ensureMinimumSavingIndicator();
      if (result?.ok) {
        setSaveFailed({ open: false, message: "" });
        setDone(true);
        return;
      }
      setSaveFailed({
        open: true,
        message:
          typeof result?.message === "string" && result.message.trim()
            ? result.message.trim()
            : "ไม่สำเร็จ.....กรุณาตรวจสอบอีกครั้ง",
      });
    } catch (error) {
      await ensureMinimumSavingIndicator();
      setSaveFailed({
        open: true,
        message:
          typeof error?.message === "string" && error.message.trim()
            ? error.message.trim()
            : "ไม่สำเร็จ.....กรุณาตรวจสอบอีกครั้ง",
      });
    } finally {
      setIsPublishingBuilder(false);
    }
  };

  return (
    <>
      <header className="dash-header flex h-16 w-full min-w-0 shrink-0 items-center gap-3 overflow-hidden border-b px-3 backdrop-blur sm:px-6 ">
        <button
          className="sm:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-white/80"
          //   onClick={() => setMobileOpen((s) => !s)}
          aria-label="Toggle navigation"
        >
          <Menu className="h-5 w-5" />
        </button>


        <div className="flex shrink-0 items-center gap-2">
          <div className="flex shrink-0 items-center gap-0">
            <button
              type="button"
              className="inline-flex shrink-0 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-white/80"
              onClick={() => toggleRailExpanded?.()}
              aria-label={railExpanded ? "ย่อเมนูซ้าย" : "ขยายเมนูซ้าย"}
              title={railExpanded ? "ย่อ" : "ขยาย"}
            >
              {railExpanded ? (
                <PanelLeftClose className="h-5 w-5" />
              ) : (
                <PanelLeftOpen className="h-5 w-5" />
              )}
            </button>
            {(!["Menu", "Hero"].includes(option) || deviceType === "Desktop") && (
              <NavBtn />
            )}
          </div>
          {option === "Message" && (
            <span className="dash-heading text-[14px] font-bold tracking-[0.2em]">
              MESSAGES
            </span>
          )}
          {["Menu", "Hero"].includes(option) && (
            <>
              <button
                type="button"
                className="dash-header-select hidden sm:inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-[12px] font-medium hover:opacity-90 focus:z-10 focus:ring-0 focus:outline-none"
                onClick={() => {
                  if (option === "Hero") {
                    setOpenSelectHeroModal(true);
                    return;
                  }
                  setOpenSelectMenuModal(true);
                }}
              >
                {option === "Hero" ? activeHeroName : activeMenuPresetName}
              </button>
              {option === "Menu" && (
                <button
                  type="button"
                  onClick={() => setOpenCreateMenuModal(true)}
                  className="dash-button hidden sm:inline-flex items-center gap-2 rounded-md border border-0 px-3 py-1.5 text-[12px] font-medium hover:opacity-90 focus:z-10 focus:ring-0 focus:outline-none"
                >
                  <Plus size={16} />
                  สร้างเมนู
                </button>
              )}
              {option === "Hero" && (
                <button
                  type="button"
                  onClick={() => setOpenCreateHeroModal(true)}
                  className="dash-button hidden sm:inline-flex items-center gap-2 rounded-md border border-0 px-3 py-1.5 text-[12px] font-medium hover:opacity-90 focus:z-10 focus:ring-0 focus:outline-none"
                >
                  <Plus size={16} />
                  สร้าง Hero
                </button>
              )}
            </>
          )}
          {option === "Forms" && (
            <>
              <button
                type="button"
                className="dash-header-select hidden sm:inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-[12px] font-medium hover:opacity-90 focus:z-10 focus:ring-0 focus:outline-none"
                onClick={() => setOpenSelectFormModal(true)}
              >
                {activeFormName}
              </button>
              <button
                type="button"
                onClick={() => setOpenCreateFormModal(true)}
                className="dash-button hidden sm:inline-flex items-center gap-2 rounded-md border border-0 px-3 py-1.5 text-[12px] font-medium hover:opacity-90 focus:z-10 focus:ring-0 focus:outline-none"
              >
                <Plus size={16} />
                สร้างฟอร์ม
              </button>
            </>
          )}
          {option === "Builder" && <ChangeBuilderModeButton />}
        </div>

        <div className="min-w-0 flex-1 overflow-hidden">
          <Breadcrumbs />
        </div>
        {["Builder", "Menu", "Hero"].includes(option) && <DeviceSelector />}

        <div className="ml-auto shrink-0" />

        <div className="flex min-w-[220px] shrink-0 items-center justify-end gap-3">
          {option === "Builder" && (
            <>
            <button
              type="button"
              disabled={!hasSelectedBuilderPage}
              className={`dash-button flex items-center gap-2 px-4 py-1.5 text-[12px] font-medium border border-0 rounded-md focus:z-10 focus:ring-0 focus:ring-blue-400 focus:outline-none ${
                hasSelectedBuilderPage ? "hover:opacity-90" : "cursor-not-allowed opacity-55"
              }`}
              onClick={() => {
                if (!hasSelectedBuilderPage) return;
                onOpenPageSettings?.();
              }}
            >
              <Settings size={16} />
              ตั้งค่า
            </button>
            <button
              type="button"
              disabled={!hasSelectedBuilderPage || isPublishingBuilder}
              onClick={handlePublishBuilder}
              className={`dash-button flex items-center gap-2 px-4 py-1.5 text-[12px] font-medium border border-0 rounded-md focus:z-10 focus:ring-0 focus:ring-blue-400 focus:outline-none ${
                !hasSelectedBuilderPage || isPublishingBuilder
                  ? "cursor-not-allowed opacity-55"
                  : "hover:opacity-90"
              }`}
            >
              <span className="material-icons-outlined text-[18px]">
                public
              </span>{" "}
              {isPublishingBuilder ? "กำลังบันทึก..." : "เผยแพร่"}
            </button>
            <button
              type="button"
              disabled={!hasSelectedBuilderPage}
              className={`dash-button flex items-center gap-2 px-4 py-1.5 text-[12px] font-medium border border-0 rounded-md focus:z-10 focus:ring-0 focus:ring-blue-400 focus:outline-none ${
                hasSelectedBuilderPage ? "hover:opacity-90" : "cursor-not-allowed opacity-55"
              }`}
              onClick={() => {
                if (!hasSelectedBuilderPage) return;
                onOpenPreview?.();
              }}
            >
              <span className="material-icons-outlined text-[18px]">
                visibility
              </span>{" "}
              ตัวอย่าง
            </button>
            </>
         
          )}
          

          {["Menu", "Hero"].includes(option) && (
            <>
              <button
                type="button"
                disabled={
                  isSavingMenuBar ||
                  (option === "Menu" &&
                    (!activeMenuPresetId || !isMenuPresetHydrated || !isMenuDirty)) ||
                  (option === "Hero" &&
                    (!activeHeroPresetId || !isMenuPresetHydrated || !isHeroDirty))
                }
                title={
                  option === "Menu"
                    ? !isMenuPresetHydrated
                      ? "กำลังโหลดเมนู..."
                      : !activeMenuPresetId
                        ? "กรุณาเลือกเมนู"
                        : !isMenuDirty
                          ? "ไม่มีการเปลี่ยนแปลง"
                          : "บันทึกข้อมูล"
                    : option === "Hero"
                      ? !isMenuPresetHydrated
                        ? "กำลังโหลด Hero..."
                        : !activeHeroPresetId
                          ? "กรุณาเลือก Hero"
                          : !isHeroDirty
                            ? "ไม่มีการเปลี่ยนแปลง"
                            : "บันทึกข้อมูล"
                      : "บันทึกข้อมูล"
                }
                onClick={() => handleSaveMenuBar({ reloadAfterSave: false })}
                className={`dash-button flex items-center gap-2 px-3 py-1.5 text-[12px] font-medium border border-0 rounded-md focus:z-10 focus:ring-0 focus:ring-blue-400 focus:outline-none ${
                  isSavingMenuBar ||
                  (option === "Menu" &&
                    (!activeMenuPresetId || !isMenuPresetHydrated || !isMenuDirty)) ||
                  (option === "Hero" &&
                    (!activeHeroPresetId || !isMenuPresetHydrated || !isHeroDirty))
                    ? "cursor-not-allowed opacity-65"
                    : "hover:opacity-90"
                }`}
              >
                <span className="material-icons-outlined text-[18px]">public</span>{" "}
                {isSavingMenuBar ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
              </button>
            </>
          )}

          {option === "Forms" && (
            <button
              type="button"
              onClick={handleSaveForms}
              disabled={isSavingForms || !isFormsHydrated || !isFormsDirty}
              title={
                !isFormsHydrated
                  ? "กำลังโหลดฟอร์ม..."
                  : !isFormsDirty
                    ? "ไม่มีการเปลี่ยนแปลง"
                    : "บันทึกข้อมูล"
              }
              className={`dash-button flex items-center gap-2 px-3 py-1.5 text-[12px] font-medium border border-0 rounded-md focus:z-10 focus:ring-0 focus:ring-blue-400 focus:outline-none ${
                isSavingForms || !isFormsHydrated || !isFormsDirty
                  ? "cursor-not-allowed opacity-65"
                  : "hover:opacity-90"
              }`}
            >
              <span className="material-icons-outlined text-[18px]">public</span>{" "}
              {isSavingForms ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
            </button>
          )}

          <button
            onClick={toggleDarkMode}
            className="rounded-lg p-2 hover:opacity-80"
            aria-label="Toggle theme"
            style={{ color: "var(--dash-header-button, #374151)" }}
          >
            {isDark === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
          <img
            src="https://i.pravatar.cc/40"
            alt="User Avatar"
            className="w-8 h-8 rounded-full"
          />
        </div>
      </header>
      {option === "Menu" && deviceType === "Desktop" && activeMenuPresetId && (
        <div className="relative z-[120]" style={{cursor:"pointer"}} id="header-bar">
          <TopBar/>
          {MenuBar()}
        </div>
      )}
      {openCreateMenuModal && (
        <div
          className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/35 px-4"
          onClick={closeCreateMenuModal}
        >
          <div
            className="w-full max-w-[550px] rounded-[12px] bg-white dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-white/10">
              <span className="text-[15px] font-semibold text-slate-700 dark:text-white/90">สร้างเมนูใหม่</span>
              <button
                type="button"
                className="text-[13px] text-slate-500 hover:text-slate-700 dark:text-white/60 dark:hover:text-white/90"
                onClick={closeCreateMenuModal}
              >
                ปิด
              </button>
            </div>
            <div className="px-4 py-4">
              <div className="mb-2 text-[12px] text-slate-500 dark:text-white/60">ชื่อเมนู</div>
              <input
                value={newMenuName}
                onChange={(e) => {
                  setNewMenuName(e.target.value);
                  if (newMenuNameError) setNewMenuNameError("");
                }}
                placeholder="เช่น เมนูหลัก"
                className="h-[38px] w-full rounded-md border border-slate-200 bg-white px-3 text-[13px] text-slate-800 outline-none focus:border-slate-400 dark:border-white/10 dark:bg-zinc-800 dark:text-white/90"
              />
              {newMenuNameError && (
                <div className="mt-2 text-[12px] text-red-500">{newMenuNameError}</div>
              )}
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-200 px-4 py-3 dark:border-white/10">
              <button
                type="button"
                className="rounded-md border border-slate-200 px-3 py-1 text-[13px] text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-white/80 dark:hover:bg-zinc-800"
                onClick={closeCreateMenuModal}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                className="rounded-md bg-[#454b57] px-3 py-1 text-[13px] text-white hover:bg-[#3b414b]"
                onClick={async () => {
                  if (typeof onCreateMenuPreset !== "function") return;
                  const result = onCreateMenuPreset(newMenuName);
                  if (!result?.ok) {
                    if (result?.reason === "duplicate_name") {
                      setNewMenuNameError("ชื่อเมนูนี้มีอยู่แล้ว");
                    } else {
                      setNewMenuNameError("กรุณาตั้งชื่อเมนูอย่างน้อย 3 ตัวอักษร");
                    }
                    return;
                  }
                  showMenuPresetToast(`สร้างเมนู ${result.name} แล้ว`);
                  closeCreateMenuModal();
                  // Wait for preset state to commit before persisting to backend.
                  await new Promise((resolve) => requestAnimationFrame(() => resolve()));
                  await new Promise((resolve) => requestAnimationFrame(() => resolve()));
                  await handleSaveMenuBar({ reloadAfterSave: false });
                }}
              >
                สร้างเมนู
              </button>
            </div>
          </div>
        </div>
      )}
      {openCreateHeroModal && (
        <div
          className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/35 px-4"
          onClick={closeCreateHeroModal}
        >
          <div
            className="w-full max-w-[550px] rounded-[12px] bg-white dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-white/10">
              <span className="text-[15px] font-semibold text-slate-700 dark:text-white/90">สร้าง Hero ใหม่</span>
              <button
                type="button"
                className="text-[13px] text-slate-500 hover:text-slate-700 dark:text-white/60 dark:hover:text-white/90"
                onClick={closeCreateHeroModal}
              >
                ปิด
              </button>
            </div>
            <div className="px-4 py-4">
              <div className="mb-2 text-[12px] text-slate-500 dark:text-white/60">ชื่อ Hero</div>
              <input
                value={newHeroName}
                onChange={(e) => {
                  setNewHeroName(e.target.value);
                  if (newHeroNameError) setNewHeroNameError("");
                }}
                placeholder="เช่น Hero 2"
                className="h-[38px] w-full rounded-md border border-slate-200 bg-white px-3 text-[13px] text-slate-800 outline-none focus:border-slate-400 dark:border-white/10 dark:bg-zinc-800 dark:text-white/90"
              />
              {newHeroNameError && (
                <div className="mt-2 text-[12px] text-red-500">{newHeroNameError}</div>
              )}
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-200 px-4 py-3 dark:border-white/10">
              <button
                type="button"
                className="rounded-md border border-slate-200 px-3 py-1 text-[13px] text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-white/80 dark:hover:bg-zinc-800"
                onClick={closeCreateHeroModal}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                className="rounded-md bg-[#454b57] px-3 py-1 text-[13px] text-white hover:bg-[#3b414b]"
                onClick={() => {
                  const trimmedName = String(newHeroName || "").trim();
                  if (trimmedName.length < 3) {
                    setNewHeroNameError("กรุณาตั้งชื่อ Hero อย่างน้อย 3 ตัวอักษร");
                    return;
                  }
                  const isDuplicate = heroItems.some(
                    (hero) => normalizeHeroName(hero.name) === normalizeHeroName(trimmedName)
                  );
                  if (isDuplicate) {
                    setNewHeroNameError("ชื่อ Hero นี้มีอยู่แล้ว");
                    return;
                  }
                  const newHero = {
                    id: buildHeroId(),
                    name: trimmedName,
                  };
                  setHeroItems((prev) => [...prev, newHero]);
                  setActiveHeroId(newHero.id);
                  setHeroCreateResetToken((prev) => prev + 1);
                  setHeroMutationEvent({
                    id: Date.now() + Math.random(),
                    type: "create",
                    newHeroId: newHero.id,
                  });
                  closeCreateHeroModal();
                }}
              >
                สร้าง Hero
              </button>
            </div>
          </div>
        </div>
      )}
      {openCreateFormModal && (
        <div
          className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/35 px-4"
          onClick={closeCreateFormModal}
        >
          <div
            className="w-full max-w-[550px] rounded-[12px] bg-white dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-white/10">
              <span className="text-[15px] font-semibold text-slate-700 dark:text-white/90">
                สร้างฟอร์มใหม่
              </span>
              <button
                type="button"
                className="text-[13px] text-slate-500 hover:text-slate-700 dark:text-white/60 dark:hover:text-white/90"
                onClick={closeCreateFormModal}
              >
                ปิด
              </button>
            </div>
            <div className="px-4 py-4">
              <div className="mb-2 text-[12px] text-slate-500 dark:text-white/60">ชื่อฟอร์ม</div>
              <input
                value={newFormName}
                onChange={(e) => {
                  setNewFormName(e.target.value);
                  if (newFormNameError) setNewFormNameError("");
                }}
                placeholder="เช่น Form 2"
                className="h-[38px] w-full rounded-md border border-slate-200 bg-white px-3 text-[13px] text-slate-800 outline-none focus:border-slate-400 dark:border-white/10 dark:bg-zinc-800 dark:text-white/90"
              />
              {newFormNameError && (
                <div className="mt-2 text-[12px] text-red-500">{newFormNameError}</div>
              )}
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-200 px-4 py-3 dark:border-white/10">
              <button
                type="button"
                className="rounded-md border border-slate-200 px-3 py-1 text-[13px] text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-white/80 dark:hover:bg-zinc-800"
                onClick={closeCreateFormModal}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                className="rounded-md bg-[#454b57] px-3 py-1 text-[13px] text-white hover:bg-[#3b414b]"
                onClick={() => {
                  const trimmedName = String(newFormName || "").trim();
                  if (trimmedName.length < 3) {
                    setNewFormNameError("กรุณาตั้งชื่อฟอร์มอย่างน้อย 3 ตัวอักษร");
                    return;
                  }
                  const isDuplicate = formItems.some(
                    (form) => normalizeFormName(form.name) === normalizeFormName(trimmedName)
                  );
                  if (isDuplicate) {
                    setNewFormNameError("ชื่อฟอร์มนี้มีอยู่แล้ว");
                    return;
                  }
                  const newForm = {
                    id: buildFormId(),
                    name: trimmedName,
                  };
                  setFormItems((prev) => [...prev, newForm]);
                  setActiveFormId(newForm.id);
                  setFormMutationEvent({
                    id: Date.now() + Math.random(),
                    type: "create",
                    newFormId: newForm.id,
                  });
                  closeCreateFormModal();
                }}
              >
                สร้างฟอร์ม
              </button>
            </div>
          </div>
        </div>
      )}
      {openSelectFormModal && (
        <div
          className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/35 px-4"
          onClick={closeSelectFormModal}
        >
          <div
            className="w-full max-w-[550px] rounded-[12px] bg-white dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <div className="flex items-center gap-[20px]">
                <span className="text-[15px] font-extrabold" style={{ color: "#333333" }}>
                  เลือกฟอร์ม
                </span>
                {isDuplicateFormMessage && (
                  <span className="text-left text-[13px]" style={{ color: "#b91c1b" }}>
                    {formFooterMessage}
                  </span>
                )}
                {isDefaultFormSuccessMessage && (
                  <span className="text-left text-[13px]" style={{ color: "#6b7280" }}>
                    {formFooterMessage}
                  </span>
                )}
              </div>
              <button
                type="button"
                className="text-[13px]"
                style={{ color: isDark === "dark" ? "#ffffff" : "#202020" }}
                onClick={closeSelectFormModal}
              >
                X
              </button>
            </div>
            <div className="mt-1 border-b-[5px] border-solid border-[#e5e7eb]" />
            <div className="max-h-[360px] overflow-y-auto px-3 py-3">
              {formItems.length === 0 ? (
                <div className="rounded-md bg-[#f7f8fa] px-3 py-2 text-[13px] text-slate-500 dark:bg-zinc-800 dark:text-white/60">
                  ยังไม่มีรายการฟอร์ม
                </div>
              ) : (
                <div className="w-full rounded-md px-[10px] pt-[4px] pb-[4px]">
                  {formItems.map((form) => {
                    const selected = form.id === activeFormId;
                    const isDefaultForm = form.id === defaultFormId;
                    const isEditingForm = editingFormId === form.id;
                    const isPendingDeleteForm = pendingDeleteForm?.id === form.id;
                    return (
                      <div
                        key={form.id}
                        className={`border-b last:border-0 flex justify-between py-2 ${
                          isDark === "dark" ? "border-b-[#a9a8a81c]" : "border-b-slate-200"
                        }`}
                        style={{ color: isDark === "dark" ? "#ffffff" : "#202020" }}
                      >
                        <div
                          className={`flex min-w-0 items-center gap-[10px] text-left ${
                            isEditingForm ? "cursor-default" : "cursor-pointer"
                          }`}
                          onClick={() => {
                            if (isPendingDeleteForm) return;
                            if (isEditingForm) return;
                            setActiveFormId(form.id);
                            closeSelectFormModal();
                          }}
                        >
                          <Menu size={14} strokeWidth={2.5} style={{ opacity: 0.45, color: "#9ca3af", flexShrink: 0 }} />
                          {isEditingForm ? (
                            <div className="flex items-center gap-2">
                              <input
                                value={editingFormName}
                                onChange={(e) => {
                                  setEditingFormName(e.target.value);
                                  if (formFooterMessage) setFormFooterMessage("");
                                }}
                                className="h-[30px] min-w-[180px] rounded-md border border-[#e7e7e7] bg-transparent px-2 text-[13.5px] outline-none dark:border-[#494d54]"
                                autoFocus
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                                onKeyDown={async (e) => {
                                  if (e.key === "Enter") {
                                    const result = await commitRenameForm(
                                      form.id,
                                      editingFormName
                                    );
                                    if (result.ok) {
                                      setEditingFormId(null);
                                      setEditingFormName("");
                                    }
                                  }
                                  if (e.key === "Escape") {
                                    setEditingFormId(null);
                                    setEditingFormName("");
                                  }
                                }}
                              />
                              <button
                                type="button"
                                className="h-[30px] rounded-md bg-[#333333] px-3 text-[12px] text-white"
                                onClick={async (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  const result = await commitRenameForm(
                                    form.id,
                                    editingFormName
                                  );
                                  if (result.ok) {
                                    setEditingFormId(null);
                                    setEditingFormName("");
                                  }
                                }}
                              >
                                บันทึก
                              </button>
                            </div>
                          ) : (
                            <span className={`truncate text-[13.5px] ${selected ? "font-semibold" : ""}`}>
                              {form.name}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className={`flex items-center justify-center pr-2 border-r last:border-0 cursor-pointer ${
                              isDark === "dark" ? "border-r-[#a9a8a852]" : "border-r-slate-200"
                            }`}
                            onClick={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (pendingDeleteForm) return;
                              setDefaultFormId(form.id);
                              setFormFooterMessage(DEFAULT_FORM_SET_MESSAGE);
                              await handleSaveForms({
                                defaultFormPresetId: form.id,
                              });
                            }}
                          >
                            <span
                              className="mx-2 inline-flex h-4 w-4 items-center justify-center rounded-full"
                              style={{
                                backgroundColor: "#333333",
                                opacity: isDefaultForm ? 1 : 0.35,
                                flexShrink: 0,
                              }}
                            >
                              <Check size={10} strokeWidth={3} color="#ffffff" />
                            </span>
                          </button>
                          <button
                            type="button"
                            className={`flex items-center justify-center pr-2 border-r last:border-0 cursor-pointer ${
                              isDark === "dark" ? "border-r-[#a9a8a852]" : "border-r-slate-200"
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (pendingDeleteForm) return;
                              setEditingFormId(form.id);
                              setEditingFormName(form.name);
                              setFormFooterMessage("");
                              setPendingDeleteForm(null);
                            }}
                          >
                            <FilePenLine size={14} style={{ opacity: 0.6 }} className="mx-2" />
                          </button>
                          <button
                            type="button"
                            className={`flex items-center justify-center pr-2 border-r last:border-0 cursor-pointer ${
                              isDark === "dark" ? "border-r-[#a9a8a852]" : "border-r-slate-200"
                            }`}
                            onClick={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (pendingDeleteForm) return;
                              const duplicateName = createUniqueFormName(form.name);
                              const duplicatedForm = { id: buildFormId(), name: duplicateName };
                              setFormItems((prev) => {
                                const idx = prev.findIndex((item) => item.id === form.id);
                                if (idx < 0) return [...prev, duplicatedForm];
                                const next = [...prev];
                                next.splice(idx + 1, 0, duplicatedForm);
                                return next;
                              });
                              setFormMutationEvent({
                                id: Date.now() + Math.random(),
                                type: "duplicate",
                                sourceFormId: form.id,
                                newFormId: duplicatedForm.id,
                              });
                              await handleSaveForms({
                                duplicateFormPreset: {
                                  sourceFormId: form.id,
                                  newFormId: duplicatedForm.id,
                                  name: duplicateName,
                                },
                              });
                            }}
                          >
                            <Copy size={14} style={{ opacity: 0.6 }} className="mx-2" />
                          </button>
                          <button
                            type="button"
                            className={`flex items-center justify-center pr-2 border-r last:border-0 ${
                              formItems.length <= 1 ? "cursor-not-allowed opacity-40" : "cursor-pointer"
                            } ${isDark === "dark" ? "border-r-[#a9a8a852]" : "border-r-slate-200"}`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (pendingDeleteForm) return;
                              if (formItems.length <= 1) return;
                              setFormFooterMessage("");
                              setPendingDeleteForm(form);
                            }}
                          >
                            <Trash2 size={14} style={{ opacity: 0.6 }} className="mx-2" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {pendingDeleteForm && (
              <div className="flex min-h-[56px] items-center justify-between gap-2 border-t border-[#e5e7eb] px-4 py-4 dark:border-white/10">
                <div
                  className="ml-[5px] text-left text-[13px] font-normal"
                  style={{ color: "#333333" }}
                >
                  คุณต้องการลบ{" "}
                  <span style={{ color: "#B91C1C", fontWeight: "normal" }}>
                    {pendingDeleteForm.name}
                  </span>{" "}
                  ใช่หรือไม่ ?
                </div>
                <div className="ml-auto mr-[5px] flex items-center gap-2">
                  <Button
                    sx={{
                      backgroundColor: "#B91C1C",
                      color: "white",
                      fontSize: 12,
                      fontWeight: "normal",
                      height: 28,
                      minWidth: "auto",
                      padding: "10px 10px",
                    }}
                    onClick={async () => {
                      const deletingFormId = pendingDeleteForm.id;
                      const remaining = formItems.filter(
                        (form) => form.id !== deletingFormId
                      );
                      const fallbackId = remaining[0]?.id || null;
                      setFormItems(remaining);
                      if (activeFormId === deletingFormId) {
                        setActiveFormId(fallbackId);
                      }
                      if (defaultFormId === deletingFormId) {
                        setDefaultFormId(fallbackId);
                      }
                      setFormFooterMessage("");
                      setPendingDeleteForm(null);
                      await handleSaveForms({
                        deleteFormPresetId: deletingFormId,
                        activeFormPresetId:
                          activeFormId === deletingFormId
                            ? fallbackId
                            : activeFormId,
                        defaultFormPresetId:
                          defaultFormId === deletingFormId
                            ? fallbackId
                            : defaultFormId,
                      });
                    }}
                  >
                    ใช่...ฉันต้องการลบ
                  </Button>
                  <Button
                    sx={{
                      backgroundColor: "#333",
                      color: "white",
                      fontSize: 12,
                      fontWeight: "normal",
                      height: 28,
                      minWidth: "auto",
                      padding: "10px 10px",
                    }}
                    onClick={() => setPendingDeleteForm(null)}
                  >
                    ยกเลิก
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {openSelectHeroModal && (
        <div
          className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/35 px-4"
          onClick={closeSelectHeroModal}
        >
          <div
            className="w-full max-w-[550px] rounded-[12px] bg-white dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <div className="flex items-center gap-[20px]">
                <span className="text-[15px] font-extrabold" style={{ color: "#333333" }}>
                  เลือก Hero
                </span>
                {isDuplicateHeroMessage && (
                  <span className="text-left text-[13px]" style={{ color: "#b91c1b" }}>
                    {heroFooterMessage}
                  </span>
                )}
                {isDefaultHeroSuccessMessage && (
                  <span className="text-left text-[13px]" style={{ color: "#6b7280" }}>
                    {heroFooterMessage}
                  </span>
                )}
              </div>
              <button
                type="button"
                className="text-[13px]"
                style={{ color: isDark === "dark" ? "#ffffff" : "#202020" }}
                onClick={closeSelectHeroModal}
              >
                X
              </button>
            </div>
            <div className="mt-1 border-b-[5px] border-solid border-[#e5e7eb]" />
            <div className="max-h-[360px] overflow-y-auto px-3 py-3">
              {heroItems.length === 0 ? (
                <div className="rounded-md bg-[#f7f8fa] px-3 py-2 text-[13px] text-slate-500 dark:bg-zinc-800 dark:text-white/60">
                  ยังไม่มีรายการ Hero
                </div>
              ) : (
                <div className="w-full rounded-md px-[10px] pt-[4px] pb-[4px]">
                  {heroItems.map((hero) => {
                    const selected = hero.id === activeHeroId;
                    const isDefaultHero = hero.id === defaultHeroId;
                    const isEditingHero = editingHeroId === hero.id;
                    const isPendingDeleteHero = pendingDeleteHero?.id === hero.id;
                    return (
                      <div
                        key={hero.id}
                        className={`border-b last:border-0 flex justify-between py-2 ${
                          isDark === "dark" ? "border-b-[#a9a8a81c]" : "border-b-slate-200"
                        }`}
                        style={{ color: isDark === "dark" ? "#ffffff" : "#202020" }}
                      >
                        <div
                          className={`flex min-w-0 items-center gap-[10px] text-left ${
                            isEditingHero ? "cursor-default" : "cursor-pointer"
                          }`}
                          onClick={() => {
                            if (isPendingDeleteHero) return;
                            if (isEditingHero) return;
                            setActiveHeroId(hero.id);
                            closeSelectHeroModal();
                          }}
                        >
                          <Menu size={14} strokeWidth={2.5} style={{ opacity: 0.45, color: "#9ca3af", flexShrink: 0 }} />
                          {isEditingHero ? (
                            <div className="flex items-center gap-2">
                              <input
                                value={editingHeroName}
                                onChange={(e) => {
                                  setEditingHeroName(e.target.value);
                                  if (heroFooterMessage) {
                                    setHeroFooterMessage("");
                                  }
                                }}
                                className="h-[30px] min-w-[180px] rounded-md border border-[#e7e7e7] bg-transparent px-2 text-[13.5px] outline-none dark:border-[#494d54]"
                                autoFocus
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    const result = commitRenameHero(hero.id, editingHeroName);
                                    if (result.ok) {
                                      setEditingHeroId(null);
                                      setEditingHeroName("");
                                    }
                                  }
                                  if (e.key === "Escape") {
                                    setEditingHeroId(null);
                                    setEditingHeroName("");
                                  }
                                }}
                              />
                              <button
                                type="button"
                                className="h-[30px] rounded-md bg-[#333333] px-3 text-[12px] text-white"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  const result = commitRenameHero(hero.id, editingHeroName);
                                  if (result.ok) {
                                    setEditingHeroId(null);
                                    setEditingHeroName("");
                                  }
                                }}
                              >
                                บันทึก
                              </button>
                            </div>
                          ) : (
                            <span className={`truncate text-[13.5px] ${selected ? "font-semibold" : ""}`}>
                              {hero.name}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className={`flex items-center justify-center pr-2 border-r last:border-0 cursor-pointer ${
                              isDark === "dark" ? "border-r-[#a9a8a852]" : "border-r-slate-200"
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (pendingDeleteHero) return;
                              setDefaultHeroId(hero.id);
                              setHeroFooterMessage(DEFAULT_HERO_SET_MESSAGE);
                            }}
                          >
                            <span
                              className="mx-2 inline-flex h-4 w-4 items-center justify-center rounded-full"
                              style={{
                                backgroundColor: "#333333",
                                opacity: isDefaultHero ? 1 : 0.35,
                                flexShrink: 0,
                              }}
                            >
                              <Check size={10} strokeWidth={3} color="#ffffff" />
                            </span>
                          </button>
                          <button
                            type="button"
                            className={`flex items-center justify-center pr-2 border-r last:border-0 cursor-pointer ${
                              isDark === "dark" ? "border-r-[#a9a8a852]" : "border-r-slate-200"
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (pendingDeleteHero) return;
                              setEditingHeroId(hero.id);
                              setEditingHeroName(hero.name);
                              setHeroFooterMessage("");
                              setPendingDeleteHero(null);
                            }}
                          >
                            <FilePenLine size={14} style={{ opacity: 0.6 }} className="mx-2" />
                          </button>
                          <button
                            type="button"
                            className={`flex items-center justify-center pr-2 border-r last:border-0 cursor-pointer ${
                              isDark === "dark" ? "border-r-[#a9a8a852]" : "border-r-slate-200"
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (pendingDeleteHero) return;
                              const duplicateName = createUniqueHeroName(hero.name);
                              const duplicatedHero = { id: buildHeroId(), name: duplicateName };
                              setHeroItems((prev) => {
                                const idx = prev.findIndex((item) => item.id === hero.id);
                                if (idx < 0) return [...prev, duplicatedHero];
                                const next = [...prev];
                                next.splice(idx + 1, 0, duplicatedHero);
                                return next;
                              });
                              setHeroMutationEvent({
                                id: Date.now() + Math.random(),
                                type: "duplicate",
                                sourceHeroId: hero.id,
                                newHeroId: duplicatedHero.id,
                              });
                            }}
                          >
                            <Copy size={14} style={{ opacity: 0.6 }} className="mx-2" />
                          </button>
                          <button
                            type="button"
                            className={`flex items-center justify-center pr-2 border-r last:border-0 ${
                              heroItems.length <= 1 ? "cursor-not-allowed opacity-40" : "cursor-pointer"
                            } ${isDark === "dark" ? "border-r-[#a9a8a852]" : "border-r-slate-200"}`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (pendingDeleteHero) return;
                              if (heroItems.length <= 1) return;
                              setHeroFooterMessage("");
                              setPendingDeleteHero(hero);
                            }}
                          >
                            <Trash2 size={14} style={{ opacity: 0.6 }} className="mx-2" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {pendingDeleteHero && (
              <div className="flex min-h-[56px] items-center justify-between gap-2 border-t border-[#e5e7eb] px-4 py-4 dark:border-white/10">
                <div
                  className="ml-[5px] text-left text-[13px] font-normal"
                  style={{ color: "#333333" }}
                >
                  คุณต้องการลบ{" "}
                  <span style={{ color: "#B91C1C", fontWeight: "normal" }}>
                    {pendingDeleteHero.name}
                  </span>{" "}
                  ใช่หรือไม่ ?
                </div>
                <div className="ml-auto mr-[5px] flex items-center gap-2">
                  <Button
                    sx={{
                      backgroundColor: "#B91C1C",
                      color: "white",
                      fontSize: 12,
                      fontWeight: "normal",
                      height: 28,
                      minWidth: "auto",
                      padding: "10px 10px",
                    }}
                    onClick={() => {
                      const deletingHeroId = pendingDeleteHero.id;
                      setHeroItems((prev) => prev.filter((hero) => hero.id !== deletingHeroId));
                      if (activeHeroId === deletingHeroId) {
                        setActiveHeroId(null);
                      }
                      if (defaultHeroId === deletingHeroId) {
                        setDefaultHeroId(null);
                      }
                      setHeroFooterMessage("");
                      setPendingDeleteHero(null);
                    }}
                  >
                    ใช่...ฉันต้องการลบ
                  </Button>
                  <Button
                    sx={{
                      backgroundColor: "#333",
                      color: "white",
                      fontSize: 12,
                      fontWeight: "normal",
                      height: 28,
                      minWidth: "auto",
                      padding: "10px 10px",
                    }}
                    onClick={() => setPendingDeleteHero(null)}
                  >
                    ยกเลิก
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {openSelectMenuModal && (
        <div
          className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/35 px-4"
          onClick={closeSelectMenuModal}
        >
          <div
            className="w-full max-w-[550px] rounded-[12px] bg-white dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <div className="flex items-center gap-[20px]">
                <span className="text-[15px] font-extrabold" style={{ color: "#333333" }}>
                  เลือกเมนู
                </span>
                {isDuplicateMenuPresetMessage && (
                  <span className="text-left text-[13px]" style={{ color: "#b91c1b" }}>
                    {menuPresetFooterMessage}
                  </span>
                )}
                {isDefaultMenuPresetSuccessMessage && (
                  <span className="text-left text-[13px]" style={{ color: "#6b7280" }}>
                    {menuPresetFooterMessage}
                  </span>
                )}
              </div>
              <button
                type="button"
                className="text-[13px]"
                style={{ color: isDark === "dark" ? "#ffffff" : "#202020" }}
                onClick={closeSelectMenuModal}
              >
                X
              </button>
            </div>
            <div className="mt-1 border-b-[5px] border-solid border-[#e5e7eb]" />
            <div className="max-h-[360px] overflow-y-auto px-3 py-3">
              {menuPresets.length === 0 ? (
                <div className="rounded-md bg-[#f7f8fa] px-3 py-2 text-[13px] text-slate-500 dark:bg-zinc-800 dark:text-white/60">
                  ยังไม่มีรายการเมนู
                </div>
              ) : (
                <div className="w-full rounded-md px-[10px] pt-[4px] pb-[4px]">
                  {menuPresets.map((preset) => {
                    const selected = preset.id === activeMenuPresetId;
                    const isDefaultPreset = preset.id === defaultMenuPresetId;
                    const isEditing = editingMenuPresetId === preset.id;
                    return (
                      <div
                        key={preset.id}
                        className={`border-b last:border-0 flex justify-between py-2 ${
                          isDark === "dark" ? "border-b-[#a9a8a81c]" : "border-b-slate-200"
                        }`}
                        style={{ color: isDark === "dark" ? "#ffffff" : "#202020" }}
                      >
                        <div
                          className={`flex min-w-0 items-center gap-[10px] text-left ${
                            isEditing ? "cursor-default" : "cursor-pointer"
                          }`}
                          onClick={() => {
                            if (pendingDeleteMenuPreset) return;
                            if (isEditing) return;
                            if (typeof onSelectMenuPreset === "function") {
                              onSelectMenuPreset(preset.id);
                            }
                            closeSelectMenuModal();
                          }}
                        >
                          <Menu size={14} strokeWidth={2.5} style={{ opacity: 0.45, color: "#9ca3af", flexShrink: 0 }} />
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                value={editingMenuPresetName}
                                onChange={(e) => {
                                  setEditingMenuPresetName(e.target.value);
                                  if (menuPresetFooterMessage) {
                                    setMenuPresetFooterMessage("");
                                  }
                                }}
                                className="h-[30px] min-w-[180px] rounded-md border border-[#e7e7e7] bg-transparent px-2 text-[13.5px] outline-none dark:border-[#494d54]"
                                autoFocus
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    const result = commitRenameMenuPreset(
                                      preset.id,
                                      editingMenuPresetName
                                    );
                                    if (result?.ok) {
                                      setEditingMenuPresetId(null);
                                      setEditingMenuPresetName("");
                                    }
                                  }
                                  if (e.key === "Escape") {
                                    setEditingMenuPresetId(null);
                                    setEditingMenuPresetName("");
                                  }
                                }}
                              />
                              <button
                                type="button"
                                className="h-[30px] rounded-md bg-[#333333] px-3 text-[12px] text-white"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  const result = commitRenameMenuPreset(
                                    preset.id,
                                    editingMenuPresetName
                                  );
                                  if (result?.ok) {
                                    setEditingMenuPresetId(null);
                                    setEditingMenuPresetName("");
                                  }
                                }}
                              >
                                บันทึก
                              </button>
                            </div>
                          ) : (
                            <span
                              className={`truncate text-[13.5px] ${
                                selected ? "font-semibold" : ""
                              }`}
                            >
                              {preset.name}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className={`flex items-center justify-center pr-2 border-r last:border-0 cursor-pointer ${
                              isDark === "dark" ? "border-r-[#a9a8a852]" : "border-r-slate-200"
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (pendingDeleteMenuPreset) return;
                              if (typeof onSetDefaultMenuPreset === "function") {
                                const result = onSetDefaultMenuPreset(preset.id);
                                if (result?.ok && !result?.unchanged) {
                                  setMenuPresetFooterMessage(DEFAULT_MENU_SET_MESSAGE);
                                }
                              }
                            }}
                            title="ตั้งเป็นเมนูเริ่มต้น"
                          >
                            <span
                              className="mx-2 inline-flex h-4 w-4 items-center justify-center rounded-full"
                              style={{
                                backgroundColor: "#333333",
                                opacity: isDefaultPreset ? 1 : 0.35,
                                flexShrink: 0,
                              }}
                            >
                              <Check size={10} strokeWidth={3} color="#ffffff" />
                            </span>
                          </button>
                          <button
                            type="button"
                            className={`flex items-center justify-center pr-2 border-r last:border-0 cursor-pointer ${
                              isDark === "dark" ? "border-r-[#a9a8a852]" : "border-r-slate-200"
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (pendingDeleteMenuPreset) return;
                              setMenuPresetFooterMessage("");
                              setEditingMenuPresetId(preset.id);
                              setEditingMenuPresetName(preset.name || "");
                            }}
                          >
                            <FilePenLine size={14} style={{ opacity: 0.6 }} className="mx-2" />
                          </button>
                          <button
                            type="button"
                            className={`flex items-center justify-center pr-2 border-r last:border-0 cursor-pointer ${
                              isDark === "dark" ? "border-r-[#a9a8a852]" : "border-r-slate-200"
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (pendingDeleteMenuPreset) return;
                              if (typeof onDuplicateMenuPreset === "function") {
                                onDuplicateMenuPreset(preset.id);
                              }
                            }}
                          >
                            <Copy size={14} style={{ opacity: 0.6 }} className="mx-2" />
                          </button>
                          <button
                            type="button"
                            className={`flex items-center justify-center pr-2 border-r last:border-0 ${
                              menuPresets.length <= 1 ? "cursor-not-allowed opacity-40" : "cursor-pointer"
                            } ${isDark === "dark" ? "border-r-[#a9a8a852]" : "border-r-slate-200"}`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (pendingDeleteMenuPreset) return;
                              if (menuPresets.length <= 1) return;
                              setPendingDeleteMenuPreset({
                                id: preset.id,
                                name: preset.name || "",
                              });
                            }}
                          >
                            <Trash2 size={14} style={{ opacity: 0.6 }} className="mx-2" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {pendingDeleteMenuPreset && (
              <div className="flex min-h-[56px] items-center justify-between gap-2 border-t border-[#e5e7eb] px-4 py-4 dark:border-white/10">
                <div
                  className="ml-[5px] text-left text-[13px] font-normal"
                  style={{ color: "#333333" }}
                >
                  คุณต้องการลบเมนู{" "}
                  <span style={{ color: "#B91C1C", fontWeight: "normal" }}>
                    {pendingDeleteMenuPreset.name}
                  </span>{" "}
                  ใช่หรือไม่ ?
                </div>
                <div className="ml-auto mr-[5px] flex items-center gap-2">
                <Button
                  sx={{
                    backgroundColor: "#B91C1C",
                    color: "white",
                    fontSize: 12,
                    fontWeight: "normal",
                    height: 28,
                    minWidth: "auto",
                    padding: "10px 10px",
                  }}
                  onClick={() => {
                    if (typeof onDeleteMenuPreset === "function") {
                      const result = onDeleteMenuPreset(pendingDeleteMenuPreset.id);
                      if (result?.ok) {
                        setPendingDeleteMenuPreset(null);
                      }
                      return;
                    }
                    setPendingDeleteMenuPreset(null);
                  }}
                >
                  ใช่...ฉันต้องการลบ
                </Button>
                <Button
                  sx={{
                    backgroundColor: "#333",
                    color: "white",
                    fontSize: 12,
                    fontWeight: "normal",
                    height: 28,
                    minWidth: "auto",
                    padding: "10px 10px",
                  }}
                  onClick={() => setPendingDeleteMenuPreset(null)}
                >
                  ยกเลิก
                </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <ServicePage
        darkMode={isDark}
        open={openPageModal}
        onClose={() => setOpenPageModal(false)}
        complete={() => setDone(true)}
        onCreated={(createdPage) => {
          onPageCreated?.(createdPage);
        }}
      />
      <ServiceSelectPage
        darkMode={isDark}
        open={openSelectPageModal}
        onClose={() => setOpenSelectPageModal(false)}
        activePageId={activePageId}
        defaultPageId={defaultPageId}
        onSelectPage={onSelectPage}
        onBeforePagesChange={onBeforePagesChange}
        onPagesChanged={onPagesChanged}
      />
<Snackbar
  anchorOrigin={{ vertical:"bottom", horizontal:"right" }}
  open={done}
  onClose={()=>setDone(false)}
  ContentProps={{ elevation: 0 }}
  message={
    <div
      style={{
        display: "flex",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingTop: 6,
        paddingBottom: 6,
      }}
    >
      <AlertCircle size={20} strokeWidth={2.25} aria-hidden />
      <span>สำเร็จ.....บันทึกข้อมูลเรียบร้อยแล้ว</span>
    </div>
  
  }
  key={0}
  autoHideDuration={2400}
  sx={{
    "& .MuiSnackbarContent-root": {
      backgroundColor: "#05966B",
      color: "#fff",
      fontSize: 13,
      justifyContent: "center",
      alignItems: "center",
      py: 0.75,
      boxShadow: "none",
    },
    "& .MuiSnackbarContent-message": {
      display: "flex",
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 0,
      py: 0.25,
    },
  }}
/>
<Snackbar
  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
  open={saveFailed.open}
  onClose={() => setSaveFailed((prev) => ({ ...prev, open: false }))}
  ContentProps={{ elevation: 0 }}
  message={
    <div
      style={{
        display: "flex",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingTop: 6,
        paddingBottom: 6,
      }}
    >
      <AlertCircle size={20} strokeWidth={2.25} aria-hidden />
      <span>{saveFailed.message || "ไม่สำเร็จ.....กรุณาตรวจสอบอีกครั้ง"}</span>
    </div>
  }
  key={2}
  autoHideDuration={2400}
  sx={{
    "& .MuiSnackbarContent-root": {
      backgroundColor: "#B91C1C",
      color: "#fff",
      fontSize: 13,
      justifyContent: "center",
      alignItems: "center",
      py: 0.75,
      boxShadow: "none",
    },
    "& .MuiSnackbarContent-message": {
      display: "flex",
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 0,
      py: 0.25,
    },
  }}
/>
<Snackbar
  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
  open={menuPresetToast.open}
  onClose={() => setMenuPresetToast((prev) => ({ ...prev, open: false }))}
  ContentProps={{ elevation: 0 }}
  message={
    <div
      style={{
        display: "flex",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingTop: 6,
        paddingBottom: 6,
      }}
    >
      <AlertCircle size={20} strokeWidth={2.25} aria-hidden />
      <span>{menuPresetToast.message}</span>
    </div>
  }
  key={1}
  autoHideDuration={2400}
  sx={{
    "& .MuiSnackbarContent-root": {
      backgroundColor: "#05966B",
      color: "#fff",
      fontSize: 13,
      justifyContent: "center",
      alignItems: "center",
      py: 0.75,
      boxShadow: "none",
    },
    "& .MuiSnackbarContent-message": {
      display: "flex",
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 0,
      py: 0.25,
    },
  }}
/>
    </>
  );
};

export default Header;
