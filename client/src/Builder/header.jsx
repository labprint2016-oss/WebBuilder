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
  CircleCheckBig

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
  setUpdateHero,
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
}) => {
  const navigate = useNavigate();

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
  
    // Sub
    subMenuFontSize:s_fs_D,
    subMenuFontWeight:s_fw_D,
  
    subMenuColor:s_color_D,
    subMenuColorOpacity:s_opct_D,
    activeSubMenuColor:s_active_D,
    activeSubMenuColorOpacity:s_activeOpct_D,
    hoverSubMenuColor:s_hover_D,
    hoverSubMenuColorOpacity:s_hoverOpct_D,
  
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
  
  
  } = menuBarMobile;

  const {
    ableLeft,
    topBarHeight,
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
    "HeroDesign-Desktop": (e) => {
      setUpdateHero(true);
      navigate("/heros");
    },
    "HeroDesign-Mobile": (e) => {
      setUpdateHero(true);
      navigate("/heros");
    },
  };

  const [done,setDone] = useState(false)

  function Breadcrumbs() {
    const fields = ["Posts", "Category", "Hero"];
    if (!fields.includes(option) && option !== "Builder") return;
    let textLabel;
    if (fields.includes(option) && !isAddPost) {
      const kinds = { Posts: "โพสต์", Category: "หมวดหมู่", Hero: "สไลด์โชว์" };
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

  const w = deviceType === "Desktop"?"full":deviceType === "Mobile"?375:768
  const h = deviceType === "Desktop"?mh_D:brh_M

  const MenuBar = () => {
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

    const SubMenus = ({
      items,
      setMainHoverID,
      level = 0,
      posClass = "absolute top-[60px] left-[115px] -translate-x-1/2",
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
              className={`rounded-md bg-white/95 border overflow-hidden`}
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
                    return setColor(s_color_D, 20);
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
                      <IconAwsome iconName={icon.name} iconType={icon.type} style={{marginRight:3}}/> 
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
                posClass="absolute left-full top-[-1px]"
                posStyle={{ transform: `translateY(${childTop}px)` }}
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
              <div key={menu.id} className="relative h-full flex items-stretch">
                {/* ✅ Hitbox ที่ใหญ่จริง */}
                <button
                  type="button"
                  className="h-full flex items-center px-3"
                  onMouseEnter={() => setHoverID(id)}
                  onMouseLeave={() => setHoverID(null)}
                  style={{
                    fontSize: fs_D,
                    fontWeight: fw_D,
                    color: textColor,
                    cursor:"pointer",
                  }}
                >
                  <IconAwsome iconName={icon.name} iconType={icon.type} style={{marginRight:5}}/>
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
                    setMainHoverID={(n) => setHoverID(n === 1 ? id : null)}
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
        

    const menuStyle = {
      height: h,
      background: bg(),
      width:w
    };


    const MenuButton = ()=>{
      return (
        <button
        className="hidden sm:inline-flex p-[5px] rounded-lg text-slate-700 dark:text-white/80 border flex items-center justify-center" ref={menuButtonRef}
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
          className={`flex min-w-0 w-full shrink-0 items-center gap-3 overflow-x-hidden px-3 sm:px-6  border-slate-200 backdrop-blur dark:bg-gray-900/70 `}
          style={menuStyle}
          onClick={() => open("Menu")}
        >
          <div
            className={`container mx-auto relative z-10 h-full min-w-0 max-w-full grid items-stretch`}
            style={{ gridTemplateColumns: "1fr auto 1fr", columnGap: 55 }}
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
        className="flex min-w-0 w-full shrink-0 items-center gap-3 overflow-x-hidden px-3 sm:px-6  border-slate-200 backdrop-blur dark:bg-gray-900/70 "
        style={menuStyle}
        onClick={() => open("Menu")}
      >
        <div className="container relative z-10 mx-auto h-full min-w-0 max-w-full flex items-center justify-between">
          <Logo />

          <Menus items={menus} />
        </div>
      </header>
    );}


    if(dp_M === "right" && ["Mobile","Tablet"].includes(deviceType)){
      return(
        <div className="flex w-full min-w-0 justify-center overflow-x-hidden">
        <header
       className="flex min-w-0 w-full max-w-full shrink-0 items-center gap-3 overflow-x-hidden px-3 sm:px-6 border-slate-200 backdrop-blur dark:bg-gray-900/70 "
       style={menuStyle}
       onClick={() => open("Menu")}
     >
       <div className="container relative z-10 mx-auto h-full min-w-0 max-w-full flex items-center justify-between">
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
       className="flex min-w-0 w-full max-w-full shrink-0 items-center gap-3 overflow-x-hidden px-3 sm:px-6 border-slate-200 backdrop-blur dark:bg-gray-900/70 "
       style={menuStyle}
       onClick={() => open("Menu")}
     >
       <div className="container relative z-10 mx-auto h-full min-w-0 max-w-full flex items-center justify-between">

       <MenuButton/>

         <Logo />


       </div>
     </header>
     </div>
      )
    }
  };

  const TopBar = ()=>{

    const bg = setColor(
      isGradient?bgColorGradient:bgColor,
      isGradient?bgOpacityGradient:bgOpacity,
      isGradient,
      bgDegree
    )


    const IconGroup = ()=>{

      if(!ableLeft) return <div></div>

      return(
        <div className="flex gap-[8px]">
        {iconGroup.map(
          (_, i) => {
            const {icon,iconSize,iconColor,iconOpacity,bgColor,bgOpacity,url} = _
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
                <IconAwsome iconType={icon.type} iconName={icon.name} style={{color:setColor(iconColor,iconOpacity),fontSize:iconSize}}/>

              </a>
            )
          }
        )}
      </div>
      )
    }


    const TextGroup = ()=>{
      if(!ableRight) return <div></div>
      return(<div className="flex gap-[12px]">
      {textGroup.map(
        (_, i) => {
          const {text,textSize,textColor,textOpacity,icon,iconSize,iconColor,iconOpacity,bgColor,bgOpacity} = _
          return(
            <div
              className="h-full flex items-center text-[10px]"
              key={i}
            >
              <div className="size-[26px] bg-white rounded-full flex items-center justify-center"     style={{
              width: borderTextSize,
              height: borderTextSize,
              background: setColor(bgColor, bgOpacity),
              borderRadius: `${radiusText}%`,
              textDecoration: "none",
            }}>
                <IconAwsome iconType={icon.type} iconName={icon.name} style={{color:setColor(iconColor,iconOpacity),fontSize:iconSize}}/>
              </div>
              <div className="ml-2" style={{color:setColor(textColor,textOpacity),fontSize:textSize}}>{text}</div>
            </div>
          )
        }
      )}
    </div>)
    }

    if(deviceType === "Mobile" || deviceType === "Tablet"){
      return(
        <div className="flex w-full min-w-0 justify-center overflow-x-hidden">
           <header
      className="flex min-w-0 w-full max-w-full shrink-0 items-center gap-3 overflow-x-hidden px-3 sm:px-6   backdrop-blur dark:bg-gray-900/70 " style={{width:w,maxWidth:"100%",height:topBarHeight,background:bg}}
      onClick={() => open("Top")}
    >
      <div className="container relative z-10 mx-auto h-full min-w-0 max-w-full flex items-center justify-center">
      <IconGroup/>
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
      <div className="container relative z-10 mx-auto h-full min-w-0 max-w-full flex items-center justify-between">
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
          ["Posts", "Cetegory", "Hero", "HeroDesign-Desktop","Menu"].includes(
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


        {(option !== "Menu" ||  deviceType === "Desktop") && (
          <NavBtn/>
        ) }
        

        {option === "Builder" && <ChangeBuilderModeButton />}

        <div className="min-w-0 flex-1 overflow-hidden">
          <Breadcrumbs />
        </div>
        {[
          "AddPost",
          "editPost",
          "HeroDesign-Desktop",
          "HeroDesign-Mobile",
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

        {["Builder", "Menu"].includes(option) && <DeviceSelector />}

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
          

          {option === "Menu" && (
               <button
               onClick={submitMenuBar}
               type="button"
               className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-white bg-gray-700 dark:bg-teal-300/80 border border-0 rounded-md hover:bg-gray-700/60 dark:hover:bg-teal-200/100 hover:text-white dark:hover:text-teal-500 focus:z-10 focus:ring-0 focus:ring-blue-400 focus:outline-none"
             >
                 <span className="material-icons-outlined text-[18px]">public</span>{" "}
               บันทึกข้อมูล
             </button>
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
      {option === "Menu" && (
        <div className="z-[99]" style={{cursor:"pointer"}} id="header-bar">
          <TopBar/>
          <MenuBar />
        </div>
      )}
      <ServicePage darkMode={isDark} open={openPageModal} onClose={()=>setOpenPageModal(false)} complete={()=>setDone(true)}/>
      <ServiceSelectPage darkMode={isDark} open={openSelectPageModal} onClose={()=>setOpenSelectPageModal(false)}/>
<Snackbar
  anchorOrigin={{ vertical:"bottom", horizontal:"right" }}
  open={done}
  onClose={()=>setDone(false)}
  message={
    <div className="flex gap-2">
    <CircleCheckBig strokeWidth={3}/>
    <Typography sx={{fontSize:14,mt:0.5}}>
    ระบบบันทึกข้อมูลเรียบร้อยแล้ว
    </Typography>
    </div>
  
  }
  key={0}
  autoHideDuration={1000}
  sx={{
    "& .MuiSnackbarContent-root": {
      backgroundColor: "#29b7a4", // สีพื้นหลัง
      color: "#fff",              // สีข้อความ
      boxShadow:"none",
      width:250,
      minWidth:250
    },
  }}
/>
    </>
  );
};

export default Header;
