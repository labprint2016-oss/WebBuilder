import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";
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
  useLocation,
  useNavigate,
  matchPath,
  useParams,
} from "react-router-dom";
import IconAwsome from "./IconAwsome";
import ServicePage from "./ServicePage";
import ServiceSelectPage from "./ServiceSelectPage";
import { CirclePicker } from "react-color";



const Header = ({
  menuButtonRef,
  theme,
  toggleDarkMode,
  isDark,
  pageName,
  option,
  setNavOpen,
  isAddPost,
  submitPost,
  updatePost,
  textColor,
  deviceType,
  setDevice,
  builderMode,
  setBuilderMode,
  menus,
  setOpenBar,
  openBar,
  menuBarDesktop,
  menuBarMobile,
  setFont,
  submitMenuBar,
  topBarData,
  onOpenPreview = null,
  menuPresets = [],
  activeMenuPresetId = null,
  defaultMenuPresetId = null,
  onCreateMenuPreset = null,
  onSelectMenuPreset = null,
  onSetDefaultMenuPreset = null,
  onRenameMenuPreset = null,
  onDuplicateMenuPreset = null,
  onDeleteMenuPreset = null,
  onResetMenuPresets = null,
  heroPresets = [],
  activeHeroPresetId = null,
  defaultHeroPresetId = null,
  onHeroStateChange = null,
}) => {
  const hasVisibleMenuIcon = (icon) =>
    Boolean(icon?.name && icon?.type && icon.name !== "fa0");
  const normalizeTopBarIcon = (icon) =>
    icon?.name && icon.name !== "fa0" ? icon : { type: "fas", name: "faHouse" };
  const navigate = useNavigate();

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
    activeMenuColor:active_D,
    activeMenuColorOpacity:activeOpct_D,
    hoverMenuColor:hover_D,
    hoverMenuColorOpacity:hoverOpct_D,
  
    isMenuGradient:isGD_D,
    bgMenuColor:bg_D,
    bgMenuColorGradient:bgGD_D,
    bgMenuOpacity:bgo_D,
    bgMenuOpacityGradient:bgoGD_D,
    bgMenuDegree:bgd_D,
  
    display:dp_D,
    menuHeight:mh_D,
  
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
    activeSubMenuColor:s_active_D,
    activeSubMenuColorOpacity:s_activeOpct_D,
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
  } = menuBarDesktop;

  const{
    // Main
    menuFontSize:fs_M,
    menuFontWeight:fw_M,
  
    menuColor:color_M,
    menuColorOpacity:opct_M,
    activeMenuColor:active_M,
    activeMenuColorOpacity:activeOpct_M,
  
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

    bgMenuColor:bg_M,
    bgMenuOpacity:bgo_M,
  
    display:dp_M,
    barHeight:brh_M,
  
    logo:l_M,
    logoHeight:lh_M,
  
    menuHeight:mh_M,
    dividerStyle:dvs_M,
    dividerColor:dvc_M,
    dividerOpacity:dvo_M,
  
    // Sub
    subMenuFontSize:s_fs_M,
    subMenuFontWeight:s_fw_M,
  
    subMenuColorL:s_color_M,
    subMenuColorOpacity:s_opct_M,
    activeSubMenuColor:s_active_M,
    activeSubMenuColorOpacity:s_activeOpct_M,
    isFluidLayout:menuFluidMobile,
  
  
  } = menuBarMobile;

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
  }  = topBarData
  

  const opacity_2_hex = (opcy) => {
    if (Number.isNaN(opcy)) return "";
    const hex = opcy.toString(16).toUpperCase().padStart(2, 0);
    return hex;
  };

  const setColor = (
    color,
    opacity = null,
    isGradient = false,
    degree = null
  ) => {
    if (isGradient) {
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
      if (typeof color === "string") {
        return color + opacity_2_hex(opacity);
      }
      return theme[color.type][color.index] + opacity_2_hex(opacity);
    }
  };

  const devices = [
    { name: "Desktop", Icon: Monitor },
    { name: "Tablet", Icon: Tablet },
    { name: "Mobile", Icon: Smartphone },
  ];

  function ChangeBuilderModeButton() {
    const modes = [
      { label: "โหมดออกแบบ", value: "Layout Mode", id: 0 },
      { label: "โหมดแก้ไข", value: "Editor Mode", id: 1 },
    ];

    return (
      <div className="inline-flex" role="group">
        {modes.map(({ value, label, id }) => (
          <button
            key={value}
            type="button"
            className={`px-4 py-1 text-[13px] font-medium ${
              value === builderMode
                ? "text-white bg-gray-700 dark:bg-teal-300/80"
                : "text-gray-500 dark:text-white/40 bg-gray-200 dark:bg-white/20"
            } border border-0 rounded-${id === 0 ? "l" : "r"}-md `}
            onClick={() => {
              setBuilderMode(value);
            }}
           style={{
            backgroundColor:value === builderMode?textColor:isDark === "dark"?"#3d434e":"#e6e7eb"
           }}
          >
            {label}
          </button>
        ))}
      </div>
    );
  }

  const submit = {
    editPost: (e) => {
      updatePost(e);
      navigate("/posts");
    },
    AddPost: (e) => {
      submitPost(e);
      navigate("/posts");
    },
  };

  const [done,setDone] = useState(false)

  function Breadcrumbs() {
    const fields = ["Posts", "Category"];
    if (!fields.includes(option) && option !== "Builder") return;
    let textLabel;
    if (fields.includes(option) && !isAddPost) {
      const kinds = { Posts: "โพสต์", Category: "หมวดหมู่" };
      textLabel = kinds[option] + "ทั้งหมด";
    } else if (isAddPost) {
      textLabel = "โพสต์ใหม่";
    } else if (option === "Builder") {
      textLabel = "เลือกหน้า";
    }

    return (
      <div
      className={`flex min-w-0 max-w-full items-center text-[13px] ${
        option === "Builder" ? "cursor-pointer" : "cursor-default"
      }`}
      onClick={() => {
        if (option !== "Builder") return;
        setOpenSelectPageModal(true)
      }}
    >
      <span className="material-icons-outlined shrink-0 px-2 text-[24px]">
        article
      </span>
    
      <span className="truncate text-gray-700/80 dark:text-white/60">{textLabel}</span>
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
                    sx={{
                      backgroundColor: "transparent",
                      color:
                        deviceType === name
                          ? textColor
                          : isDark
                          ? "#808080"
                          : "#80808024",
                      minWidth: 5,
                      marginBottom: 20,
                    }}
                    onClick={() => {
                      setDevice(name);
                      if (["Menu", "Hero"].includes(option) && ["Tablet", "Mobile"].includes(name)) {
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
  const h = deviceType === "Desktop"?mh_D:brh_M

  const MenuBar = () => {
    const fluidLayoutValue =
      (deviceType === "Desktop"
        ? menuFluidDesktop
        : menuFluidMobile);
    const isFluidLayoutEnabled = toBoolean(fluidLayoutValue);
    const menuInnerBaseClass = isFluidLayoutEnabled
      ? "relative z-10 h-full w-full min-w-0 max-w-none"
      : "relative z-10 mx-auto h-full w-full min-w-0 max-w-[1536px]";
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


    const Logo = () => {
      if(logo){
        return (
          <div>
            <img
     src={logo}
     alt="logo"
     className="object-contain"
     style={{height:logoHeight}}
   />
          </div>
        );
      }
      return (
        <div>
          <h1 className="font-semibold text-[25px]">Logo App</h1>
        </div>
      );
    };

    const [hoverID, setHoverID] = useState(null);
    const hoverCloseTimerRef = useRef(null);

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
      }, 120);
    };

    useEffect(() => {
      return () => {
        clearHoverCloseTimer();
      };
    }, []);

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


            const isHover = hoverID === id;
            const textColor = isHover
              ? setColor(hover_D, hoverOpct_D)
              : setColor(color_D, opct_D);

            const showDivider = dv_D && i !== items.length - 1;

            return (
              <div
                key={menu.id}
                className="relative h-full flex items-stretch"
                onMouseEnter={() => {
                  clearHoverCloseTimer();
                  setHoverID(id);
                }}
                onMouseLeave={() => {
                  scheduleHoverClose();
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
                        clearHoverCloseTimer();
                        setHoverID(id);
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
    const menuStyle = {
      height: h,
      background: menuBg,
      width:w,
      border: "none",
      borderBottom: "none",
      borderBottomWidth: 0,
      borderColor: "transparent",
      boxShadow: "none",
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
          className={`relative z-[120] flex min-w-0 w-full shrink-0 items-center gap-3 overflow-visible px-3 sm:px-6 backdrop-blur`}
          style={menuStyle}
          onClick={() => open("Menu")}
        >
          <div
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
              <Logo />
            </div>

            <div className="justify-self-start h-full flex items-stretch">
              <Menus items={spiltMenu[1]} />
            </div>
          </div>
        </header>
      );
    }

    if (dp_D === "right" && deviceType === "Desktop") {
    return (
      <header
        className="relative z-[120] flex min-w-0 w-full shrink-0 items-center gap-3 overflow-visible px-3 sm:px-6 backdrop-blur"
        style={menuStyle}
        onClick={() => open("Menu")}
      >
        <div className={`${menuInnerBaseClass} flex items-center justify-between`}>
          <Logo />

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
         <Logo />

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

         <Logo />


       </div>
     </header>
     </div>
      )
    }
  };

  const TopBar = ()=>{
    if (hideTopBarEverywhere) return null;
    const isTopBarFluidLayout = toBoolean(topBarFluidLayout);
    const topBarInnerBaseClass = isTopBarFluidLayout
      ? "relative z-10 h-full w-full min-w-0 max-w-none"
      : "relative z-10 mx-auto h-full w-full min-w-0 max-w-[1536px]";

    const bg = setColor(
      isGradient?bgColorGradient:bgColor,
      isGradient?bgOpacityGradient:bgOpacity,
      isGradient,
      bgDegree
    )


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
              <div className="size-[26px] bg-white rounded-full flex items-center justify-center"     style={{
              width: borderTextSize,
              height: borderTextSize,
              background: setColor(bgColor, bgOpacity),
              borderRadius: `${radiusText}%`,
              textDecoration: "none",
            }}>
                <IconAwsome iconType={safeIcon.type} iconName={safeIcon.name} style={{color:setColor(iconColor,iconOpacity),fontSize:iconSize}}/>
              </div>
              <div className="ml-2 whitespace-nowrap" style={{color:setColor(textColor,textOpacity),fontSize:textSize}}>{text}</div>
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
      className="flex min-w-0 w-full max-w-full shrink-0 items-center gap-3 overflow-x-hidden px-3 sm:px-6   backdrop-blur dark:bg-gray-900/70 " style={{width:w,maxWidth:"100%",height:topBarHeight,background:bg}}
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
      className="flex min-w-0 w-full max-w-full shrink-0 items-center gap-3 overflow-x-hidden px-3 sm:px-6   backdrop-blur dark:bg-gray-900/70 " style={{width:w,maxWidth:"100%",height:topBarHeight,background:bg}}
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
      className="flex h-[32px] min-w-0 w-full shrink-0 items-center gap-3 overflow-x-hidden px-3 sm:px-6 backdrop-blur dark:bg-gray-900/70 " style={{height:topBarHeight,background:bg}}
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
    return (
      <button
      className="hidden sm:inline-flex p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-white/80"
      onClick={() => {
        if (
          ["Posts", "Cetegory", "Menu", "Hero"].includes(
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
  const DUPLICATE_MENU_NAME_MESSAGE = "ชื่อเมนูนี้มีอยู่แล้ว ..... กรุณาใช้ชื่ออื่น";
  const DUPLICATE_HERO_NAME_MESSAGE = "ชื่อ Hero นี้มีอยู่แล้ว ..... กรุณาใช้ชื่ออื่น";
  const DEFAULT_MENU_SET_MESSAGE = "ตั้งค่าเมนูเริ่มต้นเรียบร้อยแล้ว";
  const DEFAULT_HERO_SET_MESSAGE = "ตั้งค่า Hero เริ่มต้นเรียบร้อยแล้ว";
  const [newMenuName, setNewMenuName] = useState("");
  const [newMenuNameError, setNewMenuNameError] = useState("");
  const [newHeroName, setNewHeroName] = useState("");
  const [newHeroNameError, setNewHeroNameError] = useState("");
  const [editingMenuPresetId, setEditingMenuPresetId] = useState(null);
  const [editingMenuPresetName, setEditingMenuPresetName] = useState("");
  const [editingHeroId, setEditingHeroId] = useState(null);
  const [editingHeroName, setEditingHeroName] = useState("");
  const [menuPresetFooterMessage, setMenuPresetFooterMessage] = useState("");
  const [heroFooterMessage, setHeroFooterMessage] = useState("");
  const [menuPresetToast, setMenuPresetToast] = useState({ open: false, message: "" });
  const [pendingDeleteMenuPreset, setPendingDeleteMenuPreset] = useState(null);
  const [pendingDeleteHero, setPendingDeleteHero] = useState(null);
  const [heroItems, setHeroItems] = useState(() =>
    Array.isArray(heroPresets) && heroPresets.length > 0
      ? heroPresets
      : [{ id: "hero-preset-1", name: "Hero 1" }]
  );
  const [activeHeroId, setActiveHeroId] = useState(activeHeroPresetId);
  const [defaultHeroId, setDefaultHeroId] = useState(defaultHeroPresetId);
  const activeMenuPresetName = useMemo(() => {
    const activePreset = menuPresets.find((preset) => preset.id === activeMenuPresetId);
    return activePreset?.name
      ? `${activePreset.name} - กำลังทำงาน`
      : "เลือกเมนู";
  }, [menuPresets, activeMenuPresetId]);
  const activeHeroName = useMemo(() => {
    const activeHero = heroItems.find((hero) => hero.id === activeHeroId);
    return activeHero?.name ? `${activeHero.name} - กำลังทำงาน` : "เลือก Hero";
  }, [heroItems, activeHeroId]);
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
    if (heroItems.length === 0) {
      setActiveHeroId(null);
      setDefaultHeroId(null);
      return;
    }
    if (!activeHeroId || !heroItems.some((hero) => hero.id === activeHeroId)) {
      setActiveHeroId(heroItems[0].id);
    }
    if (!defaultHeroId || !heroItems.some((hero) => hero.id === defaultHeroId)) {
      setDefaultHeroId(heroItems[0].id);
    }
  }, [heroItems, activeHeroId, defaultHeroId]);
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
    if (typeof activeHeroPresetId === "string" && activeHeroPresetId !== activeHeroId) {
      setActiveHeroId(activeHeroPresetId);
    }
  }, [activeHeroPresetId, activeHeroId]);
  useEffect(() => {
    if (typeof defaultHeroPresetId === "string" && defaultHeroPresetId !== defaultHeroId) {
      setDefaultHeroId(defaultHeroPresetId);
    }
  }, [defaultHeroPresetId, defaultHeroId]);
  useEffect(() => {
    if (typeof onHeroStateChange !== "function") return;
    onHeroStateChange({
      heroPresets: heroItems,
      activeHeroPresetId: activeHeroId,
      defaultHeroPresetId: defaultHeroId,
    });
  }, [heroItems, activeHeroId, defaultHeroId, onHeroStateChange]);

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

  const buildHeroId = () => `hero-preset-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
  const normalizeHeroName = (value) => String(value || "").trim().toLowerCase();
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

  const handleSaveMenuBar = () => {
    if (typeof submitMenuBar === "function") {
      submitMenuBar();
      setDone(true);
    }
  };

  return (
    <>
      <header className="flex h-16 w-full min-w-0 shrink-0 items-center gap-3 overflow-hidden border-b border-slate-200 bg-white/80 px-3 backdrop-blur dark:border-white/10 dark:bg-gray-900/70 sm:px-6 " style={{color:textColor}}>
        <button
          className="sm:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-white/80"
          //   onClick={() => setMobileOpen((s) => !s)}
          aria-label="Toggle navigation"
        >
          <Menu className="h-5 w-5" />
        </button>


        {(!["Menu", "Hero"].includes(option) ||  deviceType === "Desktop") && (
          <NavBtn/>
        ) }
        {["Menu", "Hero"].includes(option) && (
          <button
            type="button"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-white bg-gray-700 dark:bg-teal-300/80 border border-0 rounded-md hover:bg-gray-700/60 dark:hover:bg-teal-200/100 hover:text-white dark:hover:text-teal-500 focus:z-10 focus:ring-0 focus:ring-blue-400 focus:outline-none"
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
        )}
        

        {option === "Builder" && <ChangeBuilderModeButton />}

        <div className="min-w-0 flex-1 overflow-hidden">
          <Breadcrumbs />
        </div>
        {[
          "AddPost",
          "editPost",
        ].includes(option) && (
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-white bg-gray-700 dark:bg-teal-300/80 border border-0 rounded-md hover:bg-gray-700/60 dark:hover:bg-teal-200/100 hover:text-white dark:hover:text-teal-500 focus:z-10 focus:ring-0 focus:ring-blue-400 focus:outline-none"
            onClick={(e) => {
              submit[option](e);
            }}
          >
            <span className="material-icons-outlined text-[18px]">public</span>{" "}
            บันทึกข้อมูล
          </button>
        )}

        {["Builder", "Menu", "Hero"].includes(option) && <DeviceSelector />}

        <div className="ml-auto shrink-0" />

        <div className="flex shrink-0 items-center gap-3">
          {option === "Builder" && (
            <>
               <button
              type="button"
              style={{backgroundColor:textColor}}
              className="flex items-center gap-2 px-4 py-1 text-[13px] font-medium text-white bg-gray-700 dark:bg-teal-300/80 border border-0 rounded-md hover:bg-gray-700/60 dark:hover:bg-teal-200/100 hover:text-white dark:hover:text-teal-500 focus:z-10 focus:ring-0 focus:ring-blue-400 focus:outline-none"
              onClick={()=>{
                setOpenPageModal(true)
              }}
            >
              <FileText size={18}/>
             สร้างหน้าใหม่
            </button>
            <button
             style={{backgroundColor:textColor}}
              type="button"
              className="flex items-center gap-2 px-4 py-1 text-[13px] font-medium text-white bg-gray-700 dark:bg-teal-300/80 border border-0 rounded-md hover:bg-gray-700/60 dark:hover:bg-teal-200/100 hover:text-white dark:hover:text-teal-500 focus:z-10 focus:ring-0 focus:ring-blue-400 focus:outline-none"
            >
              <span className="material-icons-outlined text-[18px]">
                public
              </span>{" "}
              เผยแพร่
            </button>
            <button
              style={{ backgroundColor: textColor }}
              type="button"
              className="flex items-center gap-2 px-4 py-1 text-[13px] font-medium text-white bg-gray-700 dark:bg-teal-300/80 border border-0 rounded-md hover:bg-gray-700/60 dark:hover:bg-teal-200/100 hover:text-white dark:hover:text-teal-500 focus:z-10 focus:ring-0 focus:ring-blue-400 focus:outline-none"
              onClick={() => onOpenPreview?.()}
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
                onClick={() => {
                  if (option === "Hero") {
                    setOpenCreateHeroModal(true);
                    return;
                  }
                  setOpenCreateMenuModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-white bg-gray-700 dark:bg-teal-300/80 border border-0 rounded-md hover:bg-gray-700/60 dark:hover:bg-teal-200/100 hover:text-white dark:hover:text-teal-500 focus:z-10 focus:ring-0 focus:ring-blue-400 focus:outline-none"
              >
                <Plus size={16} />
                {option === "Hero" ? "สร้าง Hero" : "สร้างเมนู"}
              </button>
              <button
                onClick={handleSaveMenuBar}
                type="button"
                className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-white bg-gray-700 dark:bg-teal-300/80 border border-0 rounded-md hover:bg-gray-700/60 dark:hover:bg-teal-200/100 hover:text-white dark:hover:text-teal-500 focus:z-10 focus:ring-0 focus:ring-blue-400 focus:outline-none"
              >
                <span className="material-icons-outlined text-[18px]">public</span>{" "}
                บันทึกข้อมูล
              </button>
            </>
          )}

          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
            aria-label="Toggle theme"
            
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
      {option === "Menu" && deviceType === "Desktop" && (
        <div className="relative z-[120]" style={{cursor:"pointer"}} id="header-bar">
          <TopBar/>
          <MenuBar />
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
                onClick={() => {
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
                  closeCreateHeroModal();
                }}
              >
                สร้าง Hero
              </button>
            </div>
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
      <ServicePage darkMode={isDark} open={openPageModal} onClose={()=>setOpenPageModal(false)} complete={()=>setDone(true)}/>
      <ServiceSelectPage darkMode={isDark} open={openSelectPageModal} onClose={()=>setOpenSelectPageModal(false)}/>
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
