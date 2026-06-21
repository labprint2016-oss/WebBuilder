import React, {
  Suspense,
  lazy,
  useEffect,
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
  Snackbar
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
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {createElement} from "../../Functions/pages";
import {
  mergeCarouselElement,
  mergeSlideIconFromPanel,
  mergeSlideImageFromPanel,
} from "./Layouts/Elements/carouselElementConfig";
import { mergeDataSliderElement } from "./Layouts/Elements/dataSliderElementConfig";
import { mergeCatagoriesElement } from "./Layouts/Elements/catagoriesElementConfig";
import {
  mergeListBoxElement,
  migrateListBoxItemsGlyphMainColor0ToWhiteWhenFramingOn,
  pickListBoxOffcanvasSync,
  splitListBoxItemIconPayload,
} from "./Layouts/Elements/listBoxElementConfig";
import {
  mergeListElement,
  splitListItemIconPayload,
  pickListOffcanvasSync,
  mergeListItemImageFromPanel,
} from "./Layouts/Elements/listElementConfig";
import { mergeTableElement } from "./Layouts/Elements/tableElementConfig";
import { mergeBetweenElement } from "./Layouts/Elements/betweenElementConfig";
import { mergeDividerElement } from "./Layouts/Elements/dividerElementConfig";
import {
  Bluetooth,
  Palette,
  TextAlignStart,
  TextAlignEnd
} from "lucide-react";
import { getPage, } from "../../Functions/pages";
import { getTheme, updateTheme } from "../../Functions/theme";
import { getMenuBar,updateMenuBar } from "../../Functions/menuBar";
import { createPost,clonePost,editPost } from "../../Functions/post";
import _ from 'lodash';        // เปลี่ยนชื่อให้ชัด
import { Route, Routes, useLocation } from "react-router-dom"

const Post = lazy(() => import("./post"));
const PostData = lazy(() => import("./postData"));
const HeroData = lazy(() => import("./heroData"));
const UpdatePost = lazy(() => import("./updatePost"));
const HeroDesign = lazy(() => import("./heroDesign"));
const MenuPage = lazy(() => import("./menu"));
const Navbar = lazy(() => import("./navbar"));
const Header = lazy(() => import("./header"));
const Category = lazy(() => import("./category"));
const Content = lazy(() => import("./content"));

const ContainerOffcanvas = lazy(() => import("./Offcanvas/container"));
const HeaderOffcanvas = lazy(() => import("./Offcanvas/header"));
const ColumnOffcanvas = lazy(() => import("./Offcanvas/column"));
const ImageElementOffcanvas = lazy(() => import("./Offcanvas/imageElement"));
const ButtonElementOffcanvas = lazy(() => import("./Offcanvas/buttonElement"));
const IconElementOffcanvas = lazy(() => import("./Offcanvas/iconElement"));
const HeadingElementOffcanvas = lazy(() => import("./Offcanvas/headingElement"));
const CarouselElementOffcanvas = lazy(() => import("./Offcanvas/carouselElement"));
const DataSliderElementOffcanvas = lazy(() => import("./Offcanvas/dataSliderElement"));
const CatagoriesElementOffcanvas = lazy(() => import("./Offcanvas/catagoriesElement"));
const ListBoxElementOffcanvas = lazy(() => import("./Offcanvas/listBoxElement"));
const CounterElementOffcanvas = lazy(() => import("./Offcanvas/counterElement"));
const PostElementOffcanvas = lazy(() => import("./Offcanvas/postElement"));
const TableElementOffcanvas = lazy(() => import("./Offcanvas/tableElement"));
const BetweenElementOffcanvas = lazy(() => import("./Offcanvas/betweenElement"));
const DividerElementOffcanvas = lazy(() => import("./Offcanvas/dividerElement"));
const ButtonGroupElementOffcanvas = lazy(
  () => import("./Offcanvas/buttonGroupElement")
);
const ListElementOffcanvas = lazy(() => import("./Offcanvas/listElement"));
const TabsElementOffcanvas = lazy(() => import("./Offcanvas/tabsElement"));
const AccordionElementOffcanvas = lazy(() => import("./Offcanvas/accordionElement"));
const TopBarOffcanvas = lazy(() => import("./Offcanvas/topBar"));
const MenuBarOffcanvas = lazy(() => import("./Offcanvas/menuBar"));

/** หา element ใน layouts ตาม id (คอลัมน์ / span / miniSpan) */
function findLayoutElementById(layouts, eleId) {
  if (!eleId) return null;
  if (!Array.isArray(layouts) || layouts.length === 0) return null;
  const findInTabs = (elements) => {
    if (!Array.isArray(elements)) return null;
    for (const host of elements) {
      if (host?.type === "post" && Array.isArray(host?.postElements)) {
        const postHit = host.postElements.find((e) => e.id === eleId);
        if (postHit) return postHit;
      }
      if (host?.type === "tabs" && Array.isArray(host?.tabsItems)) {
        for (const tab of host.tabsItems) {
          const nested = Array.isArray(tab?.elements) ? tab.elements : [];
          const hit = nested.find((e) => e.id === eleId);
          if (hit) return hit;
        }
      }
      if (host?.type === "acc" && Array.isArray(host?.accordionItems)) {
        for (const tab of host.accordionItems) {
          const nested = Array.isArray(tab?.elements) ? tab.elements : [];
          const hit = nested.find((e) => e.id === eleId);
          if (hit) return hit;
        }
      }
      if (host?.type === "ctg") {
        const mergedCat = mergeCatagoriesElement(host);
        for (const tab of mergedCat.catagoriesItems || []) {
          const nested = Array.isArray(tab?.elements) ? tab.elements : [];
          const hit = nested.find((e) => e.id === eleId);
          if (hit) return hit;
        }
      }
    }
    return null;
  };
  for (const layout of layouts) {
    const cols = layout?.columns;
    if (!cols?.length) continue;
    for (const col of cols) {
      if (col.elements?.length) {
        const hit = col.elements.find((e) => e.id === eleId);
        if (hit) return hit;
        const tabHit = findInTabs(col.elements);
        if (tabHit) return tabHit;
      }
      if (!col.spans?.length) continue;
      for (const sp of col.spans) {
        if (sp.elements?.length) {
          const hit = sp.elements.find((e) => e.id === eleId);
          if (hit) return hit;
          const tabHit = findInTabs(sp.elements);
          if (tabHit) return tabHit;
        }
      }
    }
  }
  return null;
}

const Builder = ()=>{
  const location = useLocation();
  const isPreviewRoute = location.pathname === "/preview";



 


  const [updateHero,setUpdateHero] = useState(false)
  const [mobilePage,setMobilePage] = useState(0);
  const [navOpen, setNavOpen] = useState(false);
  const [heroID,setHeroID] = useState("")




  const getMode = ()=>{
    let mode
    let color
    if(typeof window === "undefined"){
      mode = "light"
      color = "#374151"
      
    }
    const savedMode = localStorage.getItem("darkMode")
    const savedColor = localStorage.getItem("darkTextColor")
    if(savedMode === "dark"|| savedMode === "light" || savedColor === "#29b7a5" || savedColor === "#374151"){
      mode = savedMode
      color = savedColor 
      
    }else{
      const osMode = window.matchMedia("(prefers-color-scheme: dark)").matches
    if(osMode){
      mode = "dark"
      color = "#29b7a5"
    }else{
      mode = "light"
      color = "#374151"
    }
    }
    return {mode,color}

  }

  const getLatestPage = ()=>{
    let page
    if(typeof window === "undefined"){
      page = ""
    }
    const savedPage = localStorage.getItem("page")
    if(savedPage){
      page = savedPage
      
    }else{
      page = ""
 
    }
    return page

  }


  const design = {
    degree:0,
    backgroundColor:"#ffffff",
    backgroundColorGradient:[{type:"mainColor",index:0},{type:"mainColor",index:1}],
    opacity:255,
    opacityGradient:[255,255],
    isTitle:true,
    isGradient:false,
    isSubTitle:true,
    isText:true,
    isButton:true,
    isImageTopLayer:true,
    layout:"left",
    title:{
      text:"Explore The World Using Virtual Reality.",
      bold:true,
      size:25,
      color:{type:"mainColor",index:0}
    },
    subTitle:{
      text:"From Ideas To Reality.",
      bold:true,
      size:18,
      color:{type:"mainColor",index:1}
    },
    text:{
      text:"Duis aute Irure dolor in reprehenderit in voluptate velit esse cillum dolore fugiat nulla pariatur.",
      bold:false,
      size:15,
      color:"#ffffff"
    }, button:{
      text:"Discover More",
      bold:false,
      size:15,
      color:"#ffffff",
      backgroundColor:{type:"mainColor",index:0},
      icon:"Bluetooth"
    },
    backgroundImage:"",
    imageTopLayer1:{
      image:"",
      positionX:0,
      positionY:0,
    },
    imageTopLayer2:{
      image:"",
      positionX:0,
      positionY:0,
    },
  }


  const [heroMobile,setHeroMobile] = useState({
    name:"",
    slideAmount:1,
    desktop:design,
    mobile:design,
    divider:"-",
    dividerColor:"#ffffff",
    dividerPosition:0,
    desktopHeight:500,
    mobileHeight:500,
  });


  
  








    const [selectedMenuId,setSelectedMenuId] = useState(getLatestPage())
    const [builderMode, setBuilderMode] = useState("Layout Mode");
    const [element,setElement] = useState(null);
    const [isEditPost,setIsEditPost] = useState(false);
    const [isAddPost,setIsAddPost] = useState(false);
    const [darkMode,setDarkMode] = useState(getMode().mode);
    const [device,setDevice] = useState("Desktop")
    const [offcanvas,setOffcanvas] = useState(null);
    const [elementData,setElementData] = useState(null)
    const [darkTextColor,setDarkTextColor] = useState(getMode().color)
    const elementFunction = useRef(null)
    /** ชี้ไปที่ patchLayoutElement ล่าสุดจาก Content (แผงรูป / ปุ่ม — อัปเดต element ใน layout) */
    const patchElementRef = useRef(null)
    /** Content กำหนดฟังก์ชันเปิด Modal แก้ข้อความรายการ List Box — แผง List Box ใน aside เรียกผ่าน ref */
    const openListBoxTextEditRef = useRef(null)
    const [,setOption] = useState(null)
    const [layouts,setLayout] = useState([])
    
    const [post,setPost] = useState({
      title:{text:"",size:18,bold:true,padding:8},
      category:["-"],
      image:null,
      height:200,
      width:400,
      borderRadius:0,
      imageType:"รูปภาพ",
      link:{url:"",target:"_self"},
      description:{text:"",size:13,padding:0},
      isColumn:false,
      columnAmount:2,
      columns:[
        {icon:"Bluetooth",text:"",color:"#374151",opacity:255},
        {icon:"Bluetooth",text:"",color:"#374151",opacity:255},
        {icon:"Bluetooth",text:"",color:"#374151",opacity:255},
        {icon:"Bluetooth",text:"",color:"#374151",opacity:255},
      ],
      isButton:false,
      buttonAmount:1,
      buttons:[
        {icon:"Bluetooth",text:"ปุ่มกด",textColor:"#FFFFFF",buttonColor:"#374151",link:{url:"",target:"_self"},textSize:13,opacity:255,bold:false},
        {icon:"Bluetooth",text:"ปุ่มกด",textColor:"#FFFFFF",buttonColor:"#374151",link:{url:"",target:"_self"},textSize:13,opacity:255,bold:false},
      ],
      imageDecoration:false,
      decorationType:"แถบ",
      color:"#374151",
      text:"เพิ่มข้อความที่นี่",
      size:13,
      position:"center",
      textColor:"#FFFFFF",
      opacity:255,
      bold:false,
    })
    const [editPostData,setEditPostData] = useState({
      title:{text:"",size:15,bold:false,padding:8},
      category:"-",
      image:null,
      height:200,
      width:400,
      borderRadius:0,
      imageType:"รูปภาพ",
      link:{url:"",target:"_self"},
      description:{text:"",size:13,padding:0},
      isColumn:false,
      columnAmount:2,
      columns:[
        {icon:"Bluetooth",text:"",color:"#374151",opacity:255},
        {icon:"Bluetooth",text:"",color:"#374151",opacity:255},
        {icon:"Bluetooth",text:"",color:"#374151",opacity:255},
        {icon:"Bluetooth",text:"",color:"#374151",opacity:255},
      ],
      isButton:false,
      buttonAmount:1,
      buttons:[
        {icon:"Bluetooth",text:"ปุ่มกด",textColor:"#FFFFFF",buttonColor:"#374151",link:{url:"",target:"_self"},textSize:13,opacity:255,bold:false},
        {icon:"Bluetooth",text:"ปุ่มกด",textColor:"#FFFFFF",buttonColor:"#374151",link:{url:"",target:"_self"},textSize:13,opacity:255,bold:false},
      ],
      imageDecoration:false,
      decorationType:"แถบ",
      color:"#374151",
      text:"เพิ่มข้อความที่นี่",
      size:13,
      position:"center",
      textColor:"#FFFFFF",
      opacity:255,
      bold:false,
    });


    useEffect(()=>{
      localStorage.setItem("page",selectedMenuId)
    },[selectedMenuId])
    
    const [page,setPage] = useState({});
    const [theme, setTheme] = useState({
      _id: null,
      textHeading: "",
      text: "",
      mainColor: [],
      textColor: [],
      otherColor: [],
    });
    const [postID,setPostID] = useState(null);

    const sendPost = ()=>{
      if(selectedMenuId === "AddPost"){
        return post
      }else if(selectedMenuId === "editPost"){
        return editPostData
      }else{
        return post
      }
    }





  


    const handleSubmit = (e,clonePostData=null)=>{
      e.preventDefault()
     
      const formData = new FormData()
      const JSON_FIELDs = ['title', 'link', 'columns', 'buttons',"description","category"];
      const JSON_COLOR_FIELDs = ['textColor', 'color'];
      const JSON_NOT_USE_FIELDs = ['_id', '__v',"createdAt","updatedAt"];
      if(clonePostData){  
        JSON_NOT_USE_FIELDs.forEach(field=>{
          delete clonePostData[field]
        })
        return clonePost(clonePostData)
        .then(res=>{
          setOption("Posts")
          setNavOpen(false)
           return res.data;
        }).catch(err=>console.log(err))
      
      }else{
        const submitPost = _.cloneDeep(post);
        for(let field in submitPost){
          let data
    
          if(JSON_FIELDs.includes(field) || (JSON_COLOR_FIELDs.includes(field) && typeof submitPost[field] === 'object')){
                data = JSON.stringify(submitPost[field])
          }else if(JSON_NOT_USE_FIELDs.includes(field)){
            data = null
          }
            else{
            data = submitPost[field]
          }
          if(data !== null){
            formData.append(field,data)
          }
          
        }
        return createPost(formData)
        .then(res=>{
           console.log(res.data);
           setOption("Posts")
           setNavOpen(false)
           setIsAddPost(false)
           return res.data
        }).catch(err=>console.log(err))
      }
   

    
  }


  const handleUpdate = (e)=>{
    e.preventDefault()
    const formData = new FormData()
    const JSON_FIELDs = ['title', 'link', 'columns', 'buttons',"description","category"];
    const JSON_COLOR_FIELDs = ['textColor', 'color'];

    if(typeof editPostData.image !== "string"){
       const submitPost = _.cloneDeep(editPostData);
       for(let field in submitPost){
         let data
  
         if(JSON_FIELDs.includes(field) || (JSON_COLOR_FIELDs.includes(field) && typeof submitPost[field] === 'object')){
               data = JSON.stringify(submitPost[field])
         }
           else{
           data = submitPost[field]
         }
         if(data !== null){
           formData.append(field,data)
         }
        
       }
       editPost(editPostData._id,formData)
       .then(res=>{console.log(res.data);
        setOption("Posts")
      setNavOpen(false)
      
      })

     
     }
     else{
      editPost(editPostData._id,editPostData)
      .then(res=>{console.log(res.data);
        setOption("Posts")
        setNavOpen(false)
      })
     }

  
}


    const loadPage = () => {
      getPage("68d2af32dd121faca15fdb57").then((res) => {
        setPage(res.data);
      });
    }; // โหลดข้อมูลหน้า

    const loadTheme = () => {
      getTheme("68d37327bedb0efab7dacafb")
        .then((res) => {
          setTheme(res.data);
        })
        .catch((err) => console.log(err));
    }; // โหลดข้อมูลธีม
    const updateNewTheme = (newTheme)=>{
      updateTheme("68d37327bedb0efab7dacafb", newTheme)
        .then(() => {
          loadTheme();
        })
        .catch((err) => console.log(err));
    }

    useEffect(() => {
      loadPage();
    }, []); // ดึงข้อมูลหน้า
    useEffect(() => {
      loadTheme();
    }, []); // ดึงข้อมูลธีม
  


    /** ส่งต่อให้ setLayout ของ React — รองรับทั้งค่า array และ updater function (อย่าห่อด้วย prev=>newLayout เดิม จะทำให้ layouts กลายเป็น function แล้ว canvas หาย) */
    const updateLayout = setLayout;



    const openOffcavanas = (type,data,funct)=>{
      setOffcanvas(type)
      setElementData(data)
      elementFunction.current = funct;
    }

    useEffect(() => {
      if (builderMode !== "Editor Mode") return;
      if (offcanvas !== "Image Hover" && offcanvas !== "Overlay") return;
      setOffcanvas(null);
      setElementData(null);
      elementFunction.current = null;
    }, [builderMode, offcanvas]);

    /** แผง Section ไม่ sync จาก layouts อัตโนมัติ — หลังโคลนคอลัมน์ latestColID ใน layout เดินไปข้างหน้า ต้องดึงมาไม่งั้นบันทึก Section จะเขียนทับด้วยค่าเก่าและ id คอลัมน์ซ้ำ */
    useEffect(() => {
      if (offcanvas !== "Container" || !elementData?.id) return;
      const row = layouts.find((l) => l.container.id === elementData.id);
      if (!row) return;
      const lc = row.container.latestColID;
      setElementData((prev) => {
        if (!prev || prev.id !== row.container.id) return prev;
        if (prev.latestColID === lc) return prev;
        return { ...prev, latestColID: lc };
      });
    }, [layouts, offcanvas, elementData?.id]);

    const pickImageMediaOffcanvasSync = (e) => ({
      id: e.id,
      type: e.type,
      src: e.src,
      aspectRatio: e.aspectRatio ?? "auto",
      imageMarginTop: e.imageMarginTop,
      imageMarginBottom: e.imageMarginBottom,
      bannerCaptionFontSize: e.bannerCaptionFontSize,
      bannerCaptionLetterSpacing: e.bannerCaptionLetterSpacing,
      bannerCaptionSlideVertical: e.bannerCaptionSlideVertical,
      bannerCaptionSlideHorizontal: e.bannerCaptionSlideHorizontal,
      bannerCaptionEdgePosition: e.bannerCaptionEdgePosition,
      bannerCaptionTextColor: e.bannerCaptionTextColor,
      bannerCaptionTextOpacity: e.bannerCaptionTextOpacity,
      imageHoverBackgroundEnabled: e.imageHoverBackgroundEnabled,
      imageHoverBackgroundColor: e.imageHoverBackgroundColor,
      imageHoverBackgroundOpacity: e.imageHoverBackgroundOpacity,
      imageHoverText: e.imageHoverText,
      imageHoverTextParagraph: e.imageHoverTextParagraph,
      imageHoverExtras: e.imageHoverExtras,
      imageHoverIconElement: e.imageHoverIconElement,
      imageHoverButtonElement: e.imageHoverButtonElement,
      linkEnabled: e.linkEnabled,
      linkUrl: e.linkUrl,
      linkTarget: e.linkTarget,
      slideLinkMode: e.slideLinkMode,
      slideVideoEmbed: e.slideVideoEmbed,
    });

    useEffect(() => {
      if (
        (offcanvas !== "Image" &&
          offcanvas !== "Image Hover" &&
          offcanvas !== "Image Overlay" &&
          offcanvas !== "Lightbox" &&
          offcanvas !== "Video" &&
          offcanvas !== "Banner") ||
        !elementData?.id ||
        elementData?.__carouselSlideEdit ||
        elementData?.__listItemImageEdit ||
        elementData?.__listBoxItemImageEdit
      )
        return;
      const found = findLayoutElementById(layouts, elementData.id);
      if (!found) return;
      setElementData((prev) => {
        if (!prev || prev.id !== found.id) return prev;
        if (
          _.isEqual(
            pickImageMediaOffcanvasSync(prev),
            pickImageMediaOffcanvasSync(found)
          )
        ) {
          return prev;
        }
        return { ...found };
      });
    }, [layouts, offcanvas, elementData?.id]);

    const pickCarouselOffcanvasSync = (e) => ({
      id: e.id,
      type: e.type,
      carouselVariant: e.carouselVariant,
      carouselSlides: e.carouselSlides,
      carouselItemCount: e.carouselItemCount,
      carouselPerViewDesktop: e.carouselPerViewDesktop,
      carouselPerViewTablet: e.carouselPerViewTablet,
      carouselPerViewMobile: e.carouselPerViewMobile,
      carouselGap: e.carouselGap,
      carouselNavShape: e.carouselNavShape,
      carouselNavColor: e.carouselNavColor,
      carouselNavColorOpacity: e.carouselNavColorOpacity,
      carouselNavActiveColor: e.carouselNavActiveColor,
      carouselNavActiveColorOpacity: e.carouselNavActiveColorOpacity,
      carouselAutoplay: e.carouselAutoplay,
      carouselAutoplayDelayMs: e.carouselAutoplayDelayMs,
      carouselMarginTop: e.carouselMarginTop,
      carouselMarginBottom: e.carouselMarginBottom,
    });

    const pickDataSliderOffcanvasSync = (e) => ({
      id: e.id,
      type: e.type,
      dataSliderItemCount: e.dataSliderItemCount,
      dataSliderItems: e.dataSliderItems,
      dataSliderActiveId: e.dataSliderActiveId,
      dataSliderPerViewDesktop: e.dataSliderPerViewDesktop,
      dataSliderPerViewTablet: e.dataSliderPerViewTablet,
      dataSliderPerViewMobile: e.dataSliderPerViewMobile,
      dataSliderGap: e.dataSliderGap,
      dataSliderNavShape: e.dataSliderNavShape,
      dataSliderNavColor: e.dataSliderNavColor,
      dataSliderNavColorOpacity: e.dataSliderNavColorOpacity,
      dataSliderNavActiveColor: e.dataSliderNavActiveColor,
      dataSliderNavActiveColorOpacity: e.dataSliderNavActiveColorOpacity,
      dataSliderAutoplay: e.dataSliderAutoplay,
      dataSliderAutoplayDelayMs: e.dataSliderAutoplayDelayMs,
      dataSliderMarginTop: e.dataSliderMarginTop,
      dataSliderMarginBottom: e.dataSliderMarginBottom,
    });

    const pickCatagoriesOffcanvasSync = (e) => ({
      id: e.id,
      type: e.type,
      catagoriesTabs: e.catagoriesTabs,
      catagoriesActiveCategoryId: e.catagoriesActiveCategoryId,
      catagoriesItemCount: e.catagoriesItemCount,
      catagoriesItems: e.catagoriesItems,
      catagoriesActiveId: e.catagoriesActiveId,
      catagoriesPerViewDesktop: e.catagoriesPerViewDesktop,
      catagoriesPerViewTablet: e.catagoriesPerViewTablet,
      catagoriesPerViewMobile: e.catagoriesPerViewMobile,
      catagoriesGap: e.catagoriesGap,
      catagoriesItemGap: e.catagoriesItemGap,
      catagoriesButtonFill: e.catagoriesButtonFill,
      catagoriesButtonFillOpacity: e.catagoriesButtonFillOpacity,
      catagoriesButtonBorderColor: e.catagoriesButtonBorderColor,
      catagoriesButtonBorderOpacity: e.catagoriesButtonBorderOpacity,
      catagoriesButtonTextColor: e.catagoriesButtonTextColor,
      catagoriesButtonTextOpacity: e.catagoriesButtonTextOpacity,
      catagoriesButtonInactiveFill: e.catagoriesButtonInactiveFill,
      catagoriesButtonInactiveFillOpacity: e.catagoriesButtonInactiveFillOpacity,
      catagoriesButtonInactiveBorderColor: e.catagoriesButtonInactiveBorderColor,
      catagoriesButtonInactiveBorderOpacity: e.catagoriesButtonInactiveBorderOpacity,
      catagoriesButtonInactiveTextColor: e.catagoriesButtonInactiveTextColor,
      catagoriesButtonInactiveTextOpacity: e.catagoriesButtonInactiveTextOpacity,
      catagoriesButtonBold: e.catagoriesButtonBold,
      catagoriesButtonBorderWidth: e.catagoriesButtonBorderWidth,
      catagoriesButtonRadius: e.catagoriesButtonRadius,
      catagoriesButtonFontSize: e.catagoriesButtonFontSize,
      catagoriesButtonPaddingX: e.catagoriesButtonPaddingX,
      catagoriesButtonPaddingY: e.catagoriesButtonPaddingY,
      catagoriesMarginTop: e.catagoriesMarginTop,
      catagoriesMarginBottom: e.catagoriesMarginBottom,
    });

    useEffect(() => {
      if (offcanvas !== "Carousel" || !elementData?.id) return;
      const found = findLayoutElementById(layouts, elementData.id);
      if (!found || found.type !== "crl") return;
      setElementData((prev) => {
        if (!prev || prev.id !== found.id) return prev;
        if (
          _.isEqual(
            pickCarouselOffcanvasSync(prev),
            pickCarouselOffcanvasSync(found)
          )
        ) {
          return prev;
        }
        return { ...found };
      });
    }, [layouts, offcanvas, elementData?.id]);

    useEffect(() => {
      if (offcanvas !== "Data Slider" || !elementData?.id) return;
      const found = findLayoutElementById(layouts, elementData.id);
      if (!found || found.type !== "dts") return;
      const merged = mergeDataSliderElement(found);
      setElementData((prev) => {
        if (!prev || prev.id !== merged.id) return prev;
        if (
          _.isEqual(
            pickDataSliderOffcanvasSync(prev),
            pickDataSliderOffcanvasSync(merged)
          )
        ) {
          return prev;
        }
        return { ...merged };
      });
    }, [layouts, offcanvas, elementData?.id]);

    useEffect(() => {
      if (offcanvas !== "Catagories" || !elementData?.id) return;
      const found = findLayoutElementById(layouts, elementData.id);
      if (!found || found.type !== "ctg") return;
      const merged = mergeCatagoriesElement(found);
      setElementData((prev) => {
        if (!prev || prev.id !== merged.id) return prev;
        if (
          _.isEqual(
            pickCatagoriesOffcanvasSync(prev),
            pickCatagoriesOffcanvasSync(merged)
          )
        ) {
          return prev;
        }
        return { ...merged };
      });
    }, [layouts, offcanvas, elementData?.id]);

    useEffect(() => {
      if (offcanvas !== "List Box" || !elementData?.id) return;
      const found = findLayoutElementById(layouts, elementData.id);
      if (!found || found.type !== "lstb") return;
      setElementData((prev) => {
        if (!prev || prev.id !== found.id) return prev;
        if (
          _.isEqual(
            pickListBoxOffcanvasSync(prev),
            pickListBoxOffcanvasSync(found)
          )
        ) {
          return prev;
        }
        return { ...found };
      });
    }, [layouts, offcanvas, elementData?.id]);

    useEffect(() => {
      if (offcanvas !== "List" || !elementData?.id) return;
      const found = findLayoutElementById(layouts, elementData.id);
      if (!found || found.type !== "list") return;
      setElementData((prev) => {
        if (!prev || prev.id !== found.id) return prev;
        if (_.isEqual(pickListOffcanvasSync(prev), pickListOffcanvasSync(found))) {
          return prev;
        }
        return { ...found };
      });
    }, [layouts, offcanvas, elementData?.id]);

    const pickButtonOffcanvasSync = (e) => ({
      id: e.id,
      type: e.type,
      label: e.label,
      label2: e.label2,
      buttonVariant: e.buttonVariant,
      buttonLayoutAlign: e.buttonLayoutAlign,
      buttonFontSize: e.buttonFontSize,
      buttonRadius: e.buttonRadius,
      buttonPaddingX: e.buttonPaddingX,
      buttonPaddingY: e.buttonPaddingY,
      buttonFullWidth: e.buttonFullWidth,
      buttonBold: e.buttonBold,
      buttonBorderWidth: e.buttonBorderWidth,
      buttonFill: e.buttonFill,
      buttonLabelColor: e.buttonLabelColor,
      button2Fill: e.button2Fill,
      button2LabelColor: e.button2LabelColor,
      button2FillOpacity: e.button2FillOpacity,
      button2LabelOpacity: e.button2LabelOpacity,
      buttonBorderColor: e.buttonBorderColor,
      buttonFillOpacity: e.buttonFillOpacity,
      buttonLabelOpacity: e.buttonLabelOpacity,
      buttonBorderOpacity: e.buttonBorderOpacity,
      linkEnabled: e.linkEnabled,
      linkUrl: e.linkUrl,
      linkTarget: e.linkTarget,
      linkIcon: e.linkIcon,
      buttonMarginTop: e.buttonMarginTop,
      buttonMarginBottom: e.buttonMarginBottom,
      buttonSpecialTextEnabled: e.buttonSpecialTextEnabled,
      buttonSpecialText: e.buttonSpecialText,
      buttonSpecialTextParagraph: e.buttonSpecialTextParagraph,
    });

    useEffect(() => {
      if (offcanvas !== "Button" || !elementData?.id) return;
      const found = findLayoutElementById(layouts, elementData.id);
      if (!found) return;
      setElementData((prev) => {
        if (!prev || prev.id !== found.id) return prev;
        if (_.isEqual(pickButtonOffcanvasSync(prev), pickButtonOffcanvasSync(found))) {
          return prev;
        }
        return { ...found };
      });
    }, [layouts, offcanvas, elementData?.id]);

    const pickIconOffcanvasSync = (e) => ({
      id: e.id,
      type: e.type,
      faIcon: e.faIcon,
      backgroundColor: e.backgroundColor,
      backgroundOpacity: e.backgroundOpacity,
      iconColor: e.iconColor,
      iconOpacity: e.iconOpacity,
      iconSize: e.iconSize,
      containerSize: e.containerSize,
      iconShape: e.iconShape,
      iconCornerRadius: e.iconCornerRadius,
      borderColor: e.borderColor,
      borderOpacity: e.borderOpacity,
      borderWidth: e.borderWidth,
      borderStyle: e.borderStyle,
      borderPosition: e.borderPosition,
      iconLayoutAlign: e.iconLayoutAlign,
      iconMarginTop: e.iconMarginTop,
      iconMarginBottom: e.iconMarginBottom,
      linkEnabled: e.linkEnabled,
      linkUrl: e.linkUrl,
      linkTarget: e.linkTarget,
    });

    useEffect(() => {
      if (offcanvas !== "Icon" || !elementData?.id) return;
      const found = findLayoutElementById(layouts, elementData.id);
      if (!found) return;
      setElementData((prev) => {
        if (!prev || prev.id !== found.id) return prev;
        if (_.isEqual(pickIconOffcanvasSync(prev), pickIconOffcanvasSync(found))) {
          return prev;
        }
        return { ...found };
      });
    }, [layouts, offcanvas, elementData?.id]);

    const pickHeadingOffcanvasSync = (e) => ({
      id: e.id,
      type: e.type,
      label: e.label,
      headingFontSize: e.headingFontSize,
      headingBold: e.headingBold,
      headingAlign: e.headingAlign,
      headingColor: e.headingColor,
      headingColorOpacity: e.headingColorOpacity,
      headingTextGradient: e.headingTextGradient,
      headingColor2: e.headingColor2,
      headingColor2Opacity: e.headingColor2Opacity,
      headingGradientDegrees: e.headingGradientDegrees,
      headingMarginTop: e.headingMarginTop,
      headingMarginBottom: e.headingMarginBottom,
      headingLetterSpacing: e.headingLetterSpacing,
      headingLineHeight: e.headingLineHeight,
      headingDividerEnabled: e.headingDividerEnabled,
      headingDividerPosition: e.headingDividerPosition,
      headingDividerStyle: e.headingDividerStyle,
      headingDividerWidth: e.headingDividerWidth,
      headingDividerColor: e.headingDividerColor,
      headingDividerOpacity: e.headingDividerOpacity,
      headingDividerGap: e.headingDividerGap,
      headingDividerSpanPercent: e.headingDividerSpanPercent,
    });

    useEffect(() => {
      if (offcanvas !== "Heading" || !elementData?.id) return;
      const found = findLayoutElementById(layouts, elementData.id);
      if (!found) return;
      setElementData((prev) => {
        if (!prev || prev.id !== found.id) return prev;
        if (
          _.isEqual(pickHeadingOffcanvasSync(prev), pickHeadingOffcanvasSync(found))
        ) {
          return prev;
        }
        return { ...found };
      });
    }, [layouts, offcanvas, elementData?.id]);

    const pickCounterOffcanvasSync = (e) => ({
      id: e.id,
      type: e.type,
      counterStartValue: e.counterStartValue,
      counterTargetValue: e.counterTargetValue,
      counterDurationMs: e.counterDurationMs,
      counterTrigger: e.counterTrigger,
      counterDirection: e.counterDirection,
      counterFontSize: e.counterFontSize,
      counterBold: e.counterBold,
      counterAlign: e.counterAlign,
      counterColor: e.counterColor,
      counterColorOpacity: e.counterColorOpacity,
      counterMarginTop: e.counterMarginTop,
      counterMarginBottom: e.counterMarginBottom,
      counterCompositionEnabled: e.counterCompositionEnabled,
      counterCompositionLeft: e.counterCompositionLeft,
      counterCompositionRight: e.counterCompositionRight,
      counterCompositionFontSize: e.counterCompositionFontSize,
      counterCompositionColor: e.counterCompositionColor,
      counterCompositionColorOpacity: e.counterCompositionColorOpacity,
      counterCompositionGapPx: e.counterCompositionGapPx,
    });

    useEffect(() => {
      if (offcanvas !== "Counter" || !elementData?.id) return;
      const found = findLayoutElementById(layouts, elementData.id);
      if (!found || found.type !== "ctn") return;
      setElementData((prev) => {
        if (!prev || prev.id !== found.id) return prev;
        if (
          _.isEqual(pickCounterOffcanvasSync(prev), pickCounterOffcanvasSync(found))
        ) {
          return prev;
        }
        return { ...found };
      });
    }, [layouts, offcanvas, elementData?.id]);

    const pickTabsOffcanvasSync = (e) => ({
      id: e.id,
      type: e.type,
      tabsAlign: e.tabsAlign,
      tabsLayoutAxis: e.tabsLayoutAxis,
      tabsStyle: e.tabsStyle,
      tabsGap: e.tabsGap,
      tabsMarginTop: e.tabsMarginTop,
      tabsMarginBottom: e.tabsMarginBottom,
      tabsItemPaddingX: e.tabsItemPaddingX,
      tabsItemPaddingY: e.tabsItemPaddingY,
      tabsItemRadius: e.tabsItemRadius,
      tabsLabelFontSize: e.tabsLabelFontSize,
      tabsLabelColor: e.tabsLabelColor,
      tabsLabelColorOpacity: e.tabsLabelColorOpacity,
      tabsActiveColorMode: e.tabsActiveColorMode,
      tabsActiveIconColor: e.tabsActiveIconColor,
      tabsActiveIconColorOpacity: e.tabsActiveIconColorOpacity,
      tabsActiveTabColor: e.tabsActiveTabColor,
      tabsActiveTabColorOpacity: e.tabsActiveTabColorOpacity,
      tabsInactiveColorMode: e.tabsInactiveColorMode,
      tabsInactiveLabelColor: e.tabsInactiveLabelColor,
      tabsInactiveLabelColorOpacity: e.tabsInactiveLabelColorOpacity,
      tabsInactiveIconColor: e.tabsInactiveIconColor,
      tabsInactiveIconColorOpacity: e.tabsInactiveIconColorOpacity,
      tabsInactiveTabColor: e.tabsInactiveTabColor,
      tabsInactiveTabColorOpacity: e.tabsInactiveTabColorOpacity,
      tabsActiveId: e.tabsActiveId,
      tabsItems: e.tabsItems,
    });

    useEffect(() => {
      if (offcanvas !== "Tabs" || !elementData?.id) return;
      const found = findLayoutElementById(layouts, elementData.id);
      if (!found || found.type !== "tabs") return;
      setElementData((prev) => {
        if (!prev || prev.id !== found.id) return prev;
        if (_.isEqual(pickTabsOffcanvasSync(prev), pickTabsOffcanvasSync(found))) {
          return prev;
        }
        return { ...found };
      });
    }, [layouts, offcanvas, elementData?.id]);

    const pickAccordionOffcanvasSync = (e) => ({
      id: e.id,
      type: e.type,
      accordionAlign: e.accordionAlign,
      accordionTabLabelStyle: e.accordionTabLabelStyle,
      accordionLabelFontSize: e.accordionLabelFontSize,
      accordionGap: e.accordionGap,
      accordionTabHeight: e.accordionTabHeight,
      accordionBorderWidth: e.accordionBorderWidth,
      accordionItemRadius: e.accordionItemRadius,
      accordionMarginTop: e.accordionMarginTop,
      accordionMarginBottom: e.accordionMarginBottom,
      accordionActiveColorMode: e.accordionActiveColorMode,
      accordionInactiveColorMode: e.accordionInactiveColorMode,
      accordionActiveId: e.accordionActiveId,
      accordionItems: e.accordionItems,
      accordionActiveTabColor: e.accordionActiveTabColor,
      accordionActiveTabColorOpacity: e.accordionActiveTabColorOpacity,
      accordionActiveLabelColor: e.accordionActiveLabelColor,
      accordionActiveLabelColorOpacity: e.accordionActiveLabelColorOpacity,
      accordionActiveBorderColor: e.accordionActiveBorderColor,
      accordionActiveBorderColorOpacity: e.accordionActiveBorderColorOpacity,
      accordionActiveToggleColor: e.accordionActiveToggleColor,
      accordionActiveToggleColorOpacity: e.accordionActiveToggleColorOpacity,
      accordionInactiveTabColor: e.accordionInactiveTabColor,
      accordionInactiveTabColorOpacity: e.accordionInactiveTabColorOpacity,
      accordionInactiveLabelColor: e.accordionInactiveLabelColor,
      accordionInactiveLabelColorOpacity: e.accordionInactiveLabelColorOpacity,
      accordionInactiveBorderColor: e.accordionInactiveBorderColor,
      accordionInactiveBorderColorOpacity: e.accordionInactiveBorderColorOpacity,
      accordionInactiveToggleColor: e.accordionInactiveToggleColor,
      accordionInactiveToggleColorOpacity: e.accordionInactiveToggleColorOpacity,
    });

    const pickPostOffcanvasSync = (e) => ({
      id: e.id,
      type: e.type,
      postLayoutMode: e.postLayoutMode,
      postHeadingEnabled: e.postHeadingEnabled,
      postHeading: e.postHeading,
      postHeadingColor: e.postHeadingColor,
      postHeadingColorOpacity: e.postHeadingColorOpacity,
      postHeadingBold: e.postHeadingBold,
      postHeadingFontSize: e.postHeadingFontSize,
      postHeadingGap: e.postHeadingGap,
      postHeadingGapImage: e.postHeadingGapImage,
      postHeadingGapContent: e.postHeadingGapContent,
      postHeadingDisplay: e.postHeadingDisplay,
      postDividerEnabled: e.postDividerEnabled,
      postDividerStyle: e.postDividerStyle,
      postDividerWidth: e.postDividerWidth,
      postDividerColor: e.postDividerColor,
      postDividerColorOpacity: e.postDividerColorOpacity,
      postAlign: e.postAlign,
      postMarginTop: e.postMarginTop,
      postMarginBottom: e.postMarginBottom,
      postElements: e.postElements,
    });

    const pickTableOffcanvasSync = (e) => ({
      id: e.id,
      type: e.type,
      tableColumns: e.tableColumns,
      tableRows: e.tableRows,
      tableHeaderBg: e.tableHeaderBg,
      tableHeaderText: e.tableHeaderText,
      tableBodyText: e.tableBodyText,
      tableBorderColor: e.tableBorderColor,
      tableZebra: e.tableZebra,
      tableZebraBg: e.tableZebraBg,
      tableHeaderBold: e.tableHeaderBold,
      tableFontSize: e.tableFontSize,
      tableCellPaddingX: e.tableCellPaddingX,
      tableCellPaddingY: e.tableCellPaddingY,
      tableMinWidth: e.tableMinWidth,
      tableMarginTop: e.tableMarginTop,
      tableMarginBottom: e.tableMarginBottom,
      tableHeaderBgOpacity: e.tableHeaderBgOpacity,
      tableHeaderTextOpacity: e.tableHeaderTextOpacity,
      tableBodyTextOpacity: e.tableBodyTextOpacity,
      tableBorderColorOpacity: e.tableBorderColorOpacity,
    });

    const pickBetweenOffcanvasSync = (e) => ({
      id: e.id,
      type: e.type,
      betweenLeftText: e.betweenLeftText,
      betweenRightText: e.betweenRightText,
      betweenFrameEnabled: e.betweenFrameEnabled,
      betweenFrameColor: e.betweenFrameColor,
      betweenFrameColorOpacity: e.betweenFrameColorOpacity,
      betweenGlass: e.betweenGlass,
      betweenInsetX: e.betweenInsetX,
      betweenInsetY: e.betweenInsetY,
      betweenFontSize: e.betweenFontSize,
      betweenBold: e.betweenBold,
      betweenLineStyle: e.betweenLineStyle,
      betweenLineColor: e.betweenLineColor,
      betweenLineOpacity: e.betweenLineOpacity,
      betweenLineWidth: e.betweenLineWidth,
      betweenLineGap: e.betweenLineGap,
      betweenRadius: e.betweenRadius,
      betweenIcon: e.betweenIcon,
      betweenIconSize: e.betweenIconSize,
      betweenIconColor: e.betweenIconColor,
      betweenIconColorOpacity: e.betweenIconColorOpacity,
      betweenIconBgColor: e.betweenIconBgColor,
      betweenIconBgOpacity: e.betweenIconBgOpacity,
      betweenIconCircleSize: e.betweenIconCircleSize,
      betweenIconShape: e.betweenIconShape,
      betweenIconCornerRadius: e.betweenIconCornerRadius,
      betweenMarginTop: e.betweenMarginTop,
      betweenMarginBottom: e.betweenMarginBottom,
    });

    const pickDividerOffcanvasSync = (e) => ({
      id: e.id,
      type: e.type,
      dividerStyle: e.dividerStyle,
      dividerColor: e.dividerColor,
      dividerOpacity: e.dividerOpacity,
      dividerWeight: e.dividerWeight,
      dividerMarginTop: e.dividerMarginTop,
      dividerMarginBottom: e.dividerMarginBottom,
    });

    useEffect(() => {
      if (offcanvas !== "Accordion" || !elementData?.id) return;
      const found = findLayoutElementById(layouts, elementData.id);
      if (!found || found.type !== "acc") return;
      setElementData((prev) => {
        if (!prev || prev.id !== found.id) return prev;
        if (
          _.isEqual(
            pickAccordionOffcanvasSync(prev),
            pickAccordionOffcanvasSync(found)
          )
        ) {
          return prev;
        }
        return { ...found };
      });
    }, [layouts, offcanvas, elementData?.id]);

    useEffect(() => {
      if (offcanvas !== "Post" || !elementData?.id) return;
      const found = findLayoutElementById(layouts, elementData.id);
      if (!found || found.type !== "post") return;
      setElementData((prev) => {
        if (!prev || prev.id !== found.id) return prev;
        if (_.isEqual(pickPostOffcanvasSync(prev), pickPostOffcanvasSync(found))) {
          return prev;
        }
        return { ...found };
      });
    }, [layouts, offcanvas, elementData?.id]);

    useEffect(() => {
      if (offcanvas !== "Table" || !elementData?.id) return;
      const found = findLayoutElementById(layouts, elementData.id);
      if (!found || found.type !== "tbl") return;
      const merged = mergeTableElement(found);
      setElementData((prev) => {
        if (!prev || prev.id !== merged.id) return prev;
        if (_.isEqual(pickTableOffcanvasSync(prev), pickTableOffcanvasSync(merged))) {
          return prev;
        }
        return { ...merged };
      });
    }, [layouts, offcanvas, elementData?.id]);

    useEffect(() => {
      if (offcanvas !== "Between" || !elementData?.id) return;
      const found = findLayoutElementById(layouts, elementData.id);
      if (!found || found.type !== "btw") return;
      const merged = mergeBetweenElement(found);
      setElementData((prev) => {
        if (!prev || prev.id !== merged.id) return prev;
        if (_.isEqual(pickBetweenOffcanvasSync(prev), pickBetweenOffcanvasSync(merged))) {
          return prev;
        }
        return { ...merged };
      });
    }, [layouts, offcanvas, elementData?.id]);

    useEffect(() => {
      if (offcanvas !== "Divider" || !elementData?.id) return;
      const found = findLayoutElementById(layouts, elementData.id);
      if (!found || found.type !== "divider") return;
      const merged = mergeDividerElement(found);
      setElementData((prev) => {
        if (!prev || prev.id !== merged.id) return prev;
        if (_.isEqual(pickDividerOffcanvasSync(prev), pickDividerOffcanvasSync(merged))) {
          return prev;
        }
        return { ...merged };
      });
    }, [layouts, offcanvas, elementData?.id]);








    const buildDefaultTableRows = (colLen = 3, rowLen = 3) =>
      Array.from({ length: rowLen }, (_, ri) =>
        Array.from(
          { length: colLen },
          (_, ci) => `Data - ${ri * colLen + ci + 1}`
        )
      );

    const normalizeDroppedTableElement = (raw) => {
      const merged = mergeTableElement(raw);
      const colLen = Math.max(1, merged.tableColumns?.length || 3);
      const rowLen = Math.max(1, merged.tableRows?.length || 3);
      const tableColumns = Array.from({ length: colLen }, (_, idx) => {
        const baseCol = merged.tableColumns?.[idx] || {};
        return {
          ...baseCol,
          label: `Column - ${idx + 1}`,
          align: "left",
        };
      });
      return {
        ...merged,
        tableColumns,
        tableRows: buildDefaultTableRows(colLen, rowLen),
      };
    };

    const normalizeDroppedBetweenElement = (raw) => mergeBetweenElement(raw);

    const stripInlineRowGroupIdsForNewElement = (raw) => {
      if (!raw || typeof raw !== "object") return raw;
      const next = _.cloneDeep(raw);
      delete next.buttonRowGroupId;
      delete next.iconRowGroupId;
      delete next.listRowGroupId;
      delete next.counterRowGroupId;
      return next;
    };

    const handleDragElement = (newElement)=>{
    if (newElement === "Span") {
      setElement(null);
      return;
    }
      createElement(newElement)
      .then(res=>{
        const dropped = stripInlineRowGroupIdsForNewElement(res?.data);
        if (dropped?.type === "tbl") {
          setElement(normalizeDroppedTableElement(dropped));
          return;
        }
        if (dropped?.type === "btw") {
          setElement(normalizeDroppedBetweenElement(dropped));
          return;
        }
        setElement(dropped);
      })
      .catch(err=>{
        console.log(err);
      })
    }

    
   const handleDropElement = ()=>{
     return element;
   }

   const toggleDarkMode = ()=>{
    let mode
    let color 
    if(darkMode === "dark"){
      mode = "light"
      color = "#374151"
    }else{
      mode = "dark"
      color = "#29b7a5"
      
      
    }

    localStorage.setItem("darkMode",mode);
    localStorage.setItem("darkTextColor",color)
    setDarkMode(mode)
    setDarkTextColor(color)
    
   }


   const menu = {
    id:Math.round(Math.random()*1E9),
    name:"",
    type:"page",
    page:"",
    url:"",
    target:"_self",
    icon:{name:"fa0",type:"fas"},
    children:[]
 }

const [menus, setMenus] = useState(
Array.from({ length: 3 }, (_, i) => ({ ...menu, id: Math.round(Math.random() * 1e9),name:"Home - "+i }))
);





const [menuBarDesktop,setMenuBarDesktop] = useState({
  // Main
  menuFontSize:15,
  menuFontWeight:400,

  menuColor:"#000000",
  menuColorOpacity:255,
  activeMenuColor:{type:"mainColor",index:0},
  activeMenuColorOpacity:255,
  hoverMenuColor:{type:"mainColor",index:1},
  hoverMenuColorOpacity:255,

  isMenuGradient:false,
  bgMenuColor:"#ffffff",
  bgMenuColorGradient:[{type:"mainColor",index:0},{type:"mainColor",index:1}],

  bgMenuOpacity:255,
  bgMenuOpacityGradient:[255,255],
  bgMenuDegree:0,

  display:"right",
  menuHeight:65,

  logo:"",
  logoHeight:35,

  menuSpace:35,
  divider:false,
  dividerStyle:"solid",
  dividerColor:"#000000",
  dividerOpacity:255,
  dividerWeight:1,


  //Sub
  subMenuFontSize:12,
  subMenuFontWeight:200,

  subMenuColor:"#000000",
  subMenuColorOpacity:255,
  activeSubMenuColor:{type:"mainColor",index:0},
  activeSubMenuColorOpacity:255,
  hoverSubMenuColor:{type:"mainColor",index:1},
  hoverSubMenuColorOpacity:255,

  isSubMenuGradient:false,
  bgSubMenuColor:"#ffffff",
  bgSubMenuColorGradient:[{type:"mainColor",index:0},{type:"mainColor",index:1}],
  bgSubMenuOpacity:255,
  bgSubMenuOpacityGradient:[255,255],
  bgSubMenuDegree:0,

  subMenuBorderColor:"#d8d8d8",
  subMenuBorderOpacity:255,
  subMenuBorderStyle:"solid",



})

const [menuBarMobile,setMenuBarMobile] = useState({
  // Main
  menuFontSize:14,
  menuFontWeight:600,

  menuColor:"#000000",
  menuColorOpacity:255,
  activeMenuColor:{type:"mainColor",index:0},
  activeMenuColorOpacity:255,

  isMenuBarGradient:false,
  bgMenuBarColor:"#ffffff",
  bgMenuBarColorGradient:[{type:"mainColor",index:0},{type:"mainColor",index:1}],
  bgMenuBarOpacity:255,
  bgMenuBarOpacityGradient:[255,255],
  bgMenuBarDegree:0,

  bgButtonColor:"#ffffff",
  borderButtonColor:"#000000",
  iconButtonColor:"#000000",
  bgButtonOpacity:255,
  borderButtonOpacity:255,
  iconButtonOpacity:255,
  borderWidth:1,

  bgMenuColor:"#ffffff",
  bgMenuOpacity:255,

  display:"right",
  barHeight:50,

  logo:"",
  logoHeight:35,

  menuHeight:40,
  dividerStyle:"solid",
  dividerColor:"#000000",
  dividerOpacity:255,


  //Sub
  subMenuFontSize:13,
  subMenuFontWeight:400,

  subMenuColor:"#000000",
  subMenuColorOpacity:255,
  activeSubMenuColor:{type:"mainColor",index:0},
  activeSubMenuColorOpacity:255,


})

const navBottomPrototype = (n,space)=>{
  return{
    isAbleNavBottom:true,
    navBottomDisplay:"text",
    navText:"Home",
    navIcon:"Home",
    navBottoms:Array.from({length:n},()=>({
      icon:{name: 'fa0', type: 'fas'},label:"Home",link:"Page1"
    })),
  
    bgNav:"#000000",
    bgNavOpacity:255,
    navHeight:56,
    navSpace:space,
  
    iconSize:20,
    iconColor:"#ffffff",
    iconOpacity:255,
  
    labelSize:11,
    labelColor:"#ffffff",
    labelOpacity:255,
  
    navDivider:false,
    navDividerColor:"#ffffff",
    navDividerOpacity:178,
    navDividerStyle:"solid",
  }
}


const [navBottomMobile,setNavBottomMobile] = useState(navBottomPrototype(4,10))

const [navBottomTablet,setNavBottomTablet] = useState(navBottomPrototype(7,12))

const iconTopBar = {
  icon:{name: 'fa0', type: 'fas'},
  url:"",
  bgColor:"#ffffff",
  bgOpacity:255,
  iconColor:"#000000",
  iconOpacity:255,
  iconSize:18,
}

const textTopBar = {
  icon:{name: 'fa0', type: 'fas'},
  text:"Bangkok Thailand",
  textSize:11,
  textColor:"#ffffff",
  textOpacity:255,
  bgColor:"#ffffff",
  bgOpacity:255,
  iconColor:"#000000",
  iconOpacity:255,
  iconSize:18,

}


const [topBar,setTopBar] = useState({
  ableLeft:true,
  topBarHeight:52,
  isGradient:false,
  bgColor:"#000000",
  bgOpacity:255,
  bgColorGradient:[{type:"mainColor",index:0},{type:"mainColor",index:1}],
  bgOpacityGradient:[255,255],
  bgDegree:0,
  borderSize:26,
  radius:50,
  iconGroup:Array.from({length:3},()=>iconTopBar),

  ableRight:true,
  radiusText:50,
  borderTextSize:26,
  textGroup:Array.from({length:3},()=>textTopBar),
})


const menuButtonRef = useRef(null);



const loadMenuBar = () => {
  getMenuBar("69db17211be82fe7637ea096").then((res) => {
    const {menuBarDesktop:md,menuBarMobile:mm,navBottomMobile:nm,navBottomTablet:nt,topBar:tb} = res.data
    setMenuBarDesktop(md)
    setMenuBarMobile(mm)
    setNavBottomMobile(nm)
    setNavBottomTablet(nt)
    setTopBar(tb)
  });
}; // โหลดข้อมูลหน้า

useEffect(() => {
  loadMenuBar();
}, []); // ดึง

useEffect(()=>{
  console.log(navBottomTablet);
},[navBottomTablet])






const navBottom = device === "Mobile" ? navBottomMobile:navBottomTablet




const editMenuBar = (data,isNav)=>{
  if(["Mobile","Tablet"].includes(device)){
    if(isNav){
      if(device === "Mobile"){
        setNavBottomMobile(data)
      }else{
        setNavBottomTablet(data)
      }
    }else{
      setMenuBarMobile(data)
    }
   
  }else{
    setMenuBarDesktop(data)
  }
}

const setFont = (font) => {
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
}

useEffect(()=>{
  setOffcanvas(null)
},[selectedMenuId])



const submitMenuBar = ()=>{
  const menuBarData = {
    menuBarDesktop,
    menuBarMobile,
    navBottomMobile,
    navBottomTablet,
    topBar,
  }
  updateMenuBar(menuBarData ,"69db17211be82fe7637ea096")
  .then(()=>{
    loadMenuBar()
  }).catch(() => {})
}

const openPreviewPage = useCallback(() => {
  try {
    const snapshot = {
      version: 1,
      createdAt: Date.now(),
      layouts: _.cloneDeep(layouts),
      page: _.cloneDeep(page),
      theme: _.cloneDeep(theme),
      device,
    };
    localStorage.setItem("wb:preview:snapshot:v1", JSON.stringify(snapshot));
  } catch {
    // Ignore preview snapshot persistence errors.
  }
  if (typeof window !== "undefined") {
    window.open("/preview", "_blank", "noopener,noreferrer");
  }
}, [layouts, page, theme, device]);


const [offcanvasWdith,setOffcanvasWdith] = useState(400)
useEffect(()=>{
  if(offcanvas === "Nav"){
    setOffcanvasWdith(500)
  }else{
    setOffcanvasWdith(400)
  }
},[offcanvas])



  

    return(
        <div className={`${darkMode === "dark" ?"dark":""} h-screen w-full overflow-x-hidden`}>
         

        
             <div className="flex h-full min-h-0 min-w-0 w-full overflow-x-hidden bg-slate-50 dark:bg-gray-950   " style={{color:darkTextColor}}>


                {!isPreviewRoute && (
                  <Suspense fallback={null}>
                    <Navbar handleDragElement={handleDragElement} isDark={darkMode} selectedMenuId={selectedMenuId} setSelectedMenuId={setSelectedMenuId}  post={sendPost()} updateNewTheme={updateNewTheme} isEditPost={isEditPost} setMobilePage={setMobilePage}  mobilePage={mobilePage}  navOpen={navOpen} setNavOpen={setNavOpen} hero={heroMobile}/>
                  </Suspense>
                )}

             <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                {!isPreviewRoute && (
                  <Suspense fallback={null}>
                    <Header menuButtonRef={menuButtonRef} submitMenuBar={submitMenuBar} topBarData={topBar} menuBarDesktop={menuBarDesktop} menuBarMobile={menuBarMobile} theme={theme} setFont={setFont} toggleDarkMode={toggleDarkMode} setOpenBar={setOffcanvas} openBar={offcanvas} isDark={darkMode} menus={menus} setBuilderMode={setBuilderMode} builderMode={builderMode} deviceType={device} setDevice={setDevice} pageName={page.pageName} textColor={darkTextColor} option={selectedMenuId} setNavOpen={setNavOpen} isAddPost={isAddPost} submitPost={handleSubmit} updatePost={handleUpdate} setUpdateHero={setUpdateHero} onOpenPreview={openPreviewPage}/>
                  </Suspense>
                )}

                <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden">
                  <Suspense fallback={<div className="h-full min-h-0 flex-1 bg-transparent" />}>
                    <Routes>
                    <Route path="posts" element={<PostData copy={handleSubmit} setIsEditPost={setIsEditPost} setPostID={setPostID} setOption={setSelectedMenuId} setIsAddPost={setIsAddPost} setNavOpen={setNavOpen}/>}/>
                     <Route path="editPost/:id" element={<UpdatePost setPostOnPreview={setEditPostData} setIsEditPost={setIsEditPost} post={editPostData} setPost={setEditPostData} postID={postID} handleUpdate={handleUpdate} mainTheme={theme}/>}/>
      
                    <Route path="newPost" element={<Post post={post} setPost={setPost} mainTheme={theme} setIsEditPost={setIsEditPost} setIsAddPost={setIsAddPost}/>}/>

                    <Route path="categories" element={<Category copy={handleSubmit} setIsEditPost={setIsEditPost} setPostID={setPostID}/>}/>
                    <Route path="heros" element={<HeroData copy={handleSubmit} setIsEditPost={setIsEditPost} setPostID={setPostID} setOption={setSelectedMenuId} setHeroID={setHeroID}/>}/>
                    <Route path="menus" element={<MenuPage menuButtonRef={menuButtonRef} menus={menus} setMenus={setMenus} navBottom={navBottom} navOpen={navOpen} setNavOpen={setNavOpen} device={device} menuBar={menuBarMobile} theme={theme} setFont={setFont} darkMode={darkMode} darkTextColor={darkTextColor}/> } />
                    <Route path="editHero/:id" element={<HeroDesign id={heroID} theme={theme} setOption={setSelectedMenuId} setHeroMobile={setHeroMobile} setNavOpen={setNavOpen} mobilePage={mobilePage} updateHero={updateHero} setUpdateHero={setUpdateHero}/>}/>


        
                    <Route path="builder" element={<Content  builderMode={builderMode} handleDropElement={handleDropElement} device={device} openOffcavanas={openOffcavanas} offcanvasID={elementData?.id} layouts={layouts} setLayout={updateLayout} theme={theme} setPage={setPage} page={page} patchElementRef={patchElementRef} openListBoxTextEditRef={openListBoxTextEditRef}/>}/>
                    <Route path="/" element={<></>}/>

                    </Routes>
                  </Suspense>
                </div>
               
             </div>
             {!isPreviewRoute && (
             <aside
  className="
    flex flex-col min-h-0 h-full max-h-full overflow-hidden
    bg-white dark:bg-gray-900/80
    border-r border-slate-200 dark:border-white/10
    transition-[width,transform,opacity] duration-300 ease-in-out
  "
  style={{
    width: offcanvas ? offcanvasWdith : 0,
    transform: "translateX(0)",
    pointerEvents: offcanvas ? "auto" : "none",
    flexShrink: 0,
  }}
>
<Suspense fallback={<div className="h-full min-h-0 flex-1 bg-transparent" />}>
{offcanvas === "Container" && (
              <ContainerOffcanvas element={elementData} updateContainer={elementFunction.current} close={openOffcavanas} textColor={darkTextColor}/>
             )}
              {offcanvas === "Header" && (
              <HeaderOffcanvas elements={elementData} updateContainer={elementFunction.current} close={openOffcavanas} textColor={darkTextColor}/>
             )}
              {offcanvas === "Column" && (
              <ColumnOffcanvas element={elementData} updateColumn={elementFunction.current} close={openOffcavanas} textColor={darkTextColor}/>
             )}
             {offcanvas === "Image" && (
              <ImageElementOffcanvas
                element={elementData}
                onUpdate={(payload) => {
                  const exLiImg = elementData?.__listItemImageEdit;
                  if (exLiImg?.listElementId != null) {
                    const base = findLayoutElementById(
                      layouts,
                      String(exLiImg.listElementId)
                    );
                    if (!base || base.type !== "list") return;
                    const merged = mergeListElement(base);
                    const items = _.cloneDeep(merged.listItems || []);
                    const idx = Number(exLiImg.itemIndex);
                    if (!Number.isFinite(idx) || idx < 0 || idx >= items.length)
                      return;
                    items[idx] = mergeListItemImageFromPanel(items[idx], payload);
                    const nextList = mergeListElement({
                      ...merged,
                      listItems: items,
                    });
                    patchElementRef.current?.(nextList, {
                      eleID: String(exLiImg.listElementId),
                    });
                    return;
                  }
                  const exLbImg = elementData?.__listBoxItemImageEdit;
                  if (exLbImg?.listBoxElementId != null) {
                    const base = findLayoutElementById(
                      layouts,
                      String(exLbImg.listBoxElementId)
                    );
                    if (!base || base.type !== "lstb") return;
                    const merged = mergeListBoxElement(base);
                    const items = _.cloneDeep(merged.listBoxItems || []);
                    const idx = Number(exLbImg.itemIndex);
                    if (!Number.isFinite(idx) || idx < 0 || idx >= items.length)
                      return;
                    items[idx] = mergeListItemImageFromPanel(items[idx], payload);
                    const nextLb = mergeListBoxElement({
                      ...merged,
                      listBoxItems: items,
                    });
                    patchElementRef.current?.(nextLb, {
                      eleID: String(exLbImg.listBoxElementId),
                    });
                    return;
                  }
                  const ex = elementData?.__carouselSlideEdit;
                  if (ex?.carouselElementId != null) {
                    const base = findLayoutElementById(
                      layouts,
                      ex.carouselElementId
                    );
                    if (!base || base.type !== "crl") return;
                    const slides = Array.isArray(base.carouselSlides)
                      ? _.cloneDeep(base.carouselSlides)
                      : [];
                    const idx = Number(ex.slideIndex);
                    if (!Number.isFinite(idx) || idx < 0 || idx >= slides.length)
                      return;
                    slides[idx] = mergeSlideImageFromPanel(slides[idx], payload);
                    const nextCarousel = mergeCarouselElement({
                      ...base,
                      carouselSlides: slides,
                    });
                    patchElementRef.current?.(nextCarousel, {
                      eleID: ex.carouselElementId,
                    });
                    return;
                  }
                  patchElementRef.current?.(payload, {
                    eleID: payload?.id ?? elementData?.id,
                  });
                }}
                close={openOffcavanas}
                textColor={darkTextColor}
                theme={theme}
              />
             )}

             {offcanvas === "Image Hover" && (
              <ImageElementOffcanvas
                element={elementData}
                layoutElementType="imgh"
                panelTitle="Image Hover"
                onUpdate={(payload) => {
                  patchElementRef.current?.(payload, {
                    eleID: payload?.id ?? elementData?.id,
                  });
                }}
                close={openOffcavanas}
                textColor={darkTextColor}
                theme={theme}
              />
             )}
             {offcanvas === "Overlay" && (
              <ImageElementOffcanvas
                element={elementData}
                layoutElementType="imgo"
                panelTitle="Overlay"
                onUpdate={(payload) => {
                  patchElementRef.current?.(payload, {
                    eleID: payload?.id ?? elementData?.id,
                  });
                }}
                close={openOffcavanas}
                textColor={darkTextColor}
                theme={theme}
              />
             )}

             {offcanvas === "Lightbox" && (
              <ImageElementOffcanvas
                element={elementData}
                layoutElementType="lbx"
                panelTitle="Lightbox"
                showImageLink={false}
                onUpdate={(payload) => {
                  patchElementRef.current?.(payload, {
                    eleID: payload?.id ?? elementData?.id,
                  });
                }}
                close={openOffcavanas}
                textColor={darkTextColor}
                theme={theme}
              />
             )}

             {offcanvas === "Video" && (
              <ImageElementOffcanvas
                element={elementData}
                layoutElementType="vid"
                panelTitle="Video"
                showImageLink={false}
                onUpdate={(payload) => {
                  patchElementRef.current?.(payload, {
                    eleID: payload?.id ?? elementData?.id,
                  });
                }}
                close={openOffcavanas}
                textColor={darkTextColor}
                theme={theme}
              />
             )}

             {offcanvas === "Banner" && (
              <ImageElementOffcanvas
                element={elementData}
                layoutElementType="bnr"
                panelTitle="Banner"
                onUpdate={(payload) => {
                  const exLiImg = elementData?.__listItemImageEdit;
                  if (exLiImg?.listElementId != null) {
                    const base = findLayoutElementById(
                      layouts,
                      String(exLiImg.listElementId)
                    );
                    if (!base || base.type !== "list") return;
                    const merged = mergeListElement(base);
                    const items = _.cloneDeep(merged.listItems || []);
                    const idx = Number(exLiImg.itemIndex);
                    if (!Number.isFinite(idx) || idx < 0 || idx >= items.length)
                      return;
                    items[idx] = mergeListItemImageFromPanel(items[idx], payload);
                    const nextList = mergeListElement({
                      ...merged,
                      listItems: items,
                    });
                    patchElementRef.current?.(nextList, {
                      eleID: String(exLiImg.listElementId),
                    });
                    return;
                  }
                  const exLbImg = elementData?.__listBoxItemImageEdit;
                  if (exLbImg?.listBoxElementId != null) {
                    const base = findLayoutElementById(
                      layouts,
                      String(exLbImg.listBoxElementId)
                    );
                    if (!base || base.type !== "lstb") return;
                    const merged = mergeListBoxElement(base);
                    const items = _.cloneDeep(merged.listBoxItems || []);
                    const idx = Number(exLbImg.itemIndex);
                    if (!Number.isFinite(idx) || idx < 0 || idx >= items.length)
                      return;
                    items[idx] = mergeListItemImageFromPanel(items[idx], payload);
                    const nextLb = mergeListBoxElement({
                      ...merged,
                      listBoxItems: items,
                    });
                    patchElementRef.current?.(nextLb, {
                      eleID: String(exLbImg.listBoxElementId),
                    });
                    return;
                  }
                  const ex = elementData?.__carouselSlideEdit;
                  if (ex?.carouselElementId != null) {
                    const base = findLayoutElementById(
                      layouts,
                      ex.carouselElementId
                    );
                    if (!base || base.type !== "crl") return;
                    const slides = Array.isArray(base.carouselSlides)
                      ? _.cloneDeep(base.carouselSlides)
                      : [];
                    const idx = Number(ex.slideIndex);
                    if (!Number.isFinite(idx) || idx < 0 || idx >= slides.length)
                      return;
                    slides[idx] = mergeSlideImageFromPanel(slides[idx], payload);
                    const nextCarousel = mergeCarouselElement({
                      ...base,
                      carouselSlides: slides,
                    });
                    patchElementRef.current?.(nextCarousel, {
                      eleID: ex.carouselElementId,
                    });
                    return;
                  }
                  patchElementRef.current?.(payload, {
                    eleID: payload?.id ?? elementData?.id,
                  });
                }}
                close={openOffcavanas}
                textColor={darkTextColor}
                theme={theme}
              />
             )}

             {offcanvas === "Button" && (
              <ButtonElementOffcanvas
                element={elementData}
                onUpdate={(payload) => {
                  const exImghBtn = elementData?.__imageHoverButtonEdit;
                  if (exImghBtn?.imageHoverElementId != null) {
                    const clean = _.cloneDeep(payload || {});
                    delete clean.id;
                    delete clean.type;
                    delete clean.preview;
                    delete clean.__imageHoverButtonEdit;
                    patchElementRef.current?.(
                      { imageHoverButtonElement: clean },
                      { eleID: String(exImghBtn.imageHoverElementId) }
                    );
                    return;
                  }
                  const exBtnMulti = elementData?.__buttonMultiButtonEdit;
                  if (exBtnMulti?.listElementId != null) {
                    const base = findLayoutElementById(
                      layouts,
                      String(exBtnMulti.listElementId)
                    );
                    if (!base || base.type !== "list") return;
                    const merged = mergeListElement(base);
                    const items = _.cloneDeep(merged.listItems || []);
                    const itemId =
                      typeof exBtnMulti.itemId === "string" &&
                      exBtnMulti.itemId.trim() !== ""
                        ? exBtnMulti.itemId.trim()
                        : null;
                    let idx =
                      itemId == null
                        ? -1
                        : items.findIndex(
                            (it) => String(it?.id || "") === itemId
                          );
                    if (idx < 0) idx = Number(exBtnMulti.itemIndex);
                    if (!Number.isFinite(idx) || idx < 0 || idx >= items.length) return;
                    const nextFill = payload?.buttonFill ?? merged?.buttonFill;
                    const nextLabelColor =
                      payload?.buttonLabelColor ?? merged?.buttonLabelColor;
                    const nextFillOpacity =
                      payload?.buttonFillOpacity ?? merged?.buttonFillOpacity;
                    const nextLabelOpacity =
                      payload?.buttonLabelOpacity ?? merged?.buttonLabelOpacity;
                    const nextIcon = payload?.linkIcon;
                    items[idx] = {
                      ...items[idx],
                      buttonFill: nextFill,
                      buttonLabelColor: nextLabelColor,
                      buttonFillOpacity: nextFillOpacity,
                      buttonLabelOpacity: nextLabelOpacity,
                      buttonVariant:
                        payload?.buttonVariant ?? merged?.buttonVariant,
                      buttonRadius: payload?.buttonRadius ?? merged?.buttonRadius,
                      buttonFontSize:
                        payload?.buttonFontSize ?? merged?.buttonFontSize,
                      buttonPaddingX:
                        payload?.buttonPaddingX ?? merged?.buttonPaddingX,
                      buttonPaddingY:
                        payload?.buttonPaddingY ?? merged?.buttonPaddingY,
                      buttonBorderWidth:
                        payload?.buttonBorderWidth ?? merged?.buttonBorderWidth,
                      buttonBorderColor:
                        payload?.buttonBorderColor ?? merged?.buttonBorderColor,
                      buttonBorderOpacity:
                        payload?.buttonBorderOpacity ?? merged?.buttonBorderOpacity,
                      buttonBold:
                        payload?.buttonBold ?? merged?.buttonBold ?? true,
                      buttonLayoutAlign:
                        payload?.buttonLayoutAlign ?? merged?.buttonLayoutAlign,
                      buttonFullWidth:
                        payload?.buttonFullWidth ?? merged?.buttonFullWidth,
                      ...(nextIcon ? { faIcon: _.cloneDeep(nextIcon) } : {}),
                    };
                    const nextList = mergeListElement({
                      ...merged,
                      listItems: items,
                    });
                    patchElementRef.current?.(nextList, {
                      eleID: String(exBtnMulti.listElementId),
                    });
                    return;
                  }
                  patchElementRef.current?.(payload, {
                    eleID: payload?.id ?? elementData?.id,
                  });
                }}
                close={openOffcavanas}
                textColor={darkTextColor}
                theme={theme}
                darkMode={darkMode}
              />
             )}

             {offcanvas === "Icon" && (
              <IconElementOffcanvas
                element={elementData}
                onUpdate={(payload) => {
                  const exImghIcon = elementData?.__imageHoverIconEdit;
                  if (exImghIcon?.imageHoverElementId != null) {
                    const clean = _.cloneDeep(payload || {});
                    delete clean.id;
                    delete clean.type;
                    delete clean.preview;
                    delete clean.__imageHoverIconEdit;
                    patchElementRef.current?.(
                      { imageHoverIconElement: clean },
                      { eleID: String(exImghIcon.imageHoverElementId) }
                    );
                    return;
                  }
                  /* Compound List Item — แก้ไขไอคอนต่อ item */
                  const exLi = elementData?.__listItemIconEdit;
                  if (exLi?.listElementId != null) {
                    const base = findLayoutElementById(
                      layouts,
                      String(exLi.listElementId)
                    );
                    if (!base || base.type !== "list") return;
                    const merged = mergeListElement(base);
                    const items = _.cloneDeep(merged.listItems || []);
                    const idx = Number(exLi.itemIndex);
                    if (!Number.isFinite(idx) || idx < 0 || idx >= items.length)
                      return;
                    const { itemUpdate, sharedUpdate } = splitListItemIconPayload(payload);
                    const isListIconsElement = merged.listIconsElement === true;
                    const glyphColorFromPanel =
                      itemUpdate.iconColor !== undefined ||
                      itemUpdate.iconOpacity !== undefined;
                    const bgColorFromPanel =
                      itemUpdate.backgroundColor !== undefined ||
                      itemUpdate.backgroundOpacity !== undefined;
                    items[idx] = {
                      ...items[idx],
                      ...itemUpdate,
                      ...(isListIconsElement && glyphColorFromPanel
                        ? { listIconsGlyphPanelTouched: true }
                        : {}),
                      ...(isListIconsElement && bgColorFromPanel
                        ? { listIconsBgPanelTouched: true }
                        : {}),
                    };
                    const nextList = mergeListElement({
                      ...merged,
                      ...sharedUpdate,
                      listItems: items,
                    });
                    patchElementRef.current?.(nextList, {
                      eleID: String(exLi.listElementId),
                    });
                    return;
                  }
                  const exLb = elementData?.__listBoxItemIconEdit;
                  if (exLb?.listBoxElementId != null) {
                    const base = findLayoutElementById(
                      layouts,
                      String(exLb.listBoxElementId)
                    );
                    if (!base || base.type !== "lstb") return;
                    const merged = mergeListBoxElement(base);
                    const items = _.cloneDeep(merged.listBoxItems || []);
                    const idx = Number(exLb.itemIndex);
                    if (!Number.isFinite(idx) || idx < 0 || idx >= items.length)
                      return;
                    const { itemUpdate, sharedUpdate } =
                      splitListBoxItemIconPayload(payload);
                    items[idx] = { ...items[idx], ...itemUpdate };
                    const frameTurningOn =
                      merged.listBoxIconFrameEnabled === false &&
                      sharedUpdate.listBoxIconFrameEnabled === true;
                    const itemsForMerge = frameTurningOn
                      ? migrateListBoxItemsGlyphMainColor0ToWhiteWhenFramingOn(items)
                      : items;
                    const nextLb = mergeListBoxElement({
                      ...merged,
                      ...sharedUpdate,
                      listBoxItems: itemsForMerge,
                    });
                    patchElementRef.current?.(nextLb, {
                      eleID: String(exLb.listBoxElementId),
                    });
                    return;
                  }
                  const exIc = elementData?.__carouselSlideIconEdit;
                  if (exIc?.carouselElementId != null) {
                    const base = findLayoutElementById(
                      layouts,
                      exIc.carouselElementId
                    );
                    if (!base || base.type !== "crl") return;
                    const slides = Array.isArray(base.carouselSlides)
                      ? _.cloneDeep(base.carouselSlides)
                      : [];
                    const idx = Number(exIc.slideIndex);
                    if (
                      !Number.isFinite(idx) ||
                      idx < 0 ||
                      idx >= slides.length
                    )
                      return;
                    slides[idx] = mergeSlideIconFromPanel(
                      slides[idx],
                      payload
                    );
                    const nextCarousel = mergeCarouselElement({
                      ...base,
                      carouselSlides: slides,
                    });
                    patchElementRef.current?.(nextCarousel, {
                      eleID: exIc.carouselElementId,
                    });
                    return;
                  }
                  const exBetweenIcon = elementData?.__betweenIconEdit;
                  if (exBetweenIcon?.betweenElementId != null) {
                    const betweenId = String(exBetweenIcon.betweenElementId);
                    const base = findLayoutElementById(layouts, betweenId);
                    if (!base || base.type !== "btw") return;
                    const mergedBetween = mergeBetweenElement(base);
                    const nextBetween = mergeBetweenElement({
                      ...mergedBetween,
                      ...(payload?.faIcon !== undefined ? { betweenIcon: payload.faIcon } : {}),
                      ...(payload?.iconSize !== undefined
                        ? { betweenIconSize: payload.iconSize }
                        : {}),
                      ...(payload?.containerSize !== undefined
                        ? { betweenIconCircleSize: payload.containerSize }
                        : {}),
                      ...(payload?.iconShape !== undefined
                        ? { betweenIconShape: payload.iconShape }
                        : {}),
                      ...(payload?.iconCornerRadius !== undefined
                        ? { betweenIconCornerRadius: payload.iconCornerRadius }
                        : {}),
                      ...(payload?.iconColor !== undefined
                        ? { betweenIconColor: payload.iconColor }
                        : {}),
                      ...(payload?.iconOpacity !== undefined
                        ? { betweenIconColorOpacity: payload.iconOpacity }
                        : {}),
                      ...(payload?.backgroundColor !== undefined
                        ? { betweenIconBgColor: payload.backgroundColor }
                        : {}),
                      ...(payload?.backgroundOpacity !== undefined
                        ? { betweenIconBgOpacity: payload.backgroundOpacity }
                        : {}),
                    });
                    patchElementRef.current?.(nextBetween, { eleID: betweenId });
                    return;
                  }
                  patchElementRef.current?.(payload, {
                    eleID: payload?.id ?? elementData?.id,
                  });
                }}
                close={openOffcavanas}
                textColor={darkTextColor}
                theme={theme}
                darkMode={darkMode}
              />
             )}

             {offcanvas === "Heading" && (
              <HeadingElementOffcanvas
                element={elementData}
                onUpdate={(payload) => {
                  patchElementRef.current?.(payload, {
                    eleID: payload?.id ?? elementData?.id,
                  });
                }}
                close={openOffcavanas}
                textColor={darkTextColor}
                theme={theme}
              />
             )}

             {offcanvas === "Counter" && (
              <CounterElementOffcanvas
                element={elementData}
                onUpdate={(payload) => {
                  patchElementRef.current?.(payload, {
                    eleID: payload?.id ?? elementData?.id,
                  });
                }}
                close={openOffcavanas}
                textColor={darkTextColor}
                theme={theme}
              />
             )}

             {offcanvas === "Carousel" && (
              <CarouselElementOffcanvas
                element={elementData}
                onUpdate={(payload) => {
                  patchElementRef.current?.(payload, {
                    eleID: payload?.id ?? elementData?.id,
                  });
                }}
                close={openOffcavanas}
                textColor={darkTextColor}
                theme={theme}
              />
             )}
             {offcanvas === "Data Slider" && (
              <DataSliderElementOffcanvas
                element={elementData}
                onUpdate={(payload) => {
                  patchElementRef.current?.(payload, {
                    eleID: payload?.id ?? elementData?.id,
                  });
                }}
                close={openOffcavanas}
                textColor={darkTextColor}
                theme={theme}
              />
             )}
             {offcanvas === "Catagories" && (
              <CatagoriesElementOffcanvas
                element={elementData}
                onUpdate={(payload) => {
                  patchElementRef.current?.(payload, {
                    eleID: payload?.id ?? elementData?.id,
                  });
                }}
                close={openOffcavanas}
                textColor={darkTextColor}
                theme={theme}
              />
             )}

             {offcanvas === "List Box" && (
              <ListBoxElementOffcanvas
                element={elementData}
                onUpdate={(payload) => {
                  patchElementRef.current?.(payload, {
                    eleID: payload?.id ?? elementData?.id,
                  });
                }}
                close={openOffcavanas}
                textColor={darkTextColor}
                theme={theme}
              />
             )}

             {offcanvas === "List" && (
              <ListElementOffcanvas
                element={elementData}
                onUpdate={(payload) => {
                  patchElementRef.current?.(payload, {
                    eleID: payload?.id ?? elementData?.id,
                  });
                }}
                close={openOffcavanas}
                textColor={darkTextColor}
                theme={theme}
              />
             )}
             {offcanvas === "Button Group" && (
              <ButtonGroupElementOffcanvas
                element={elementData}
                onUpdate={(payload) => {
                  patchElementRef.current?.(payload, {
                    eleID: payload?.id ?? elementData?.id,
                  });
                }}
                close={openOffcavanas}
                textColor={darkTextColor}
                theme={theme}
              />
             )}

             {offcanvas === "Tabs" && (
              <TabsElementOffcanvas
                element={elementData}
                onUpdate={(payload) => {
                  patchElementRef.current?.(payload, {
                    eleID: payload?.id ?? elementData?.id,
                  });
                }}
                close={openOffcavanas}
                textColor={darkTextColor}
                darkMode={darkMode}
                theme={theme}
              />
             )}

             {offcanvas === "Accordion" && (
              <AccordionElementOffcanvas
                element={elementData}
                onUpdate={(payload) => {
                  patchElementRef.current?.(payload, {
                    eleID: payload?.id ?? elementData?.id,
                  });
                }}
                close={openOffcavanas}
                textColor={darkTextColor}
                darkMode={darkMode}
                theme={theme}
              />
             )}

             {offcanvas === "Post" && (
              <PostElementOffcanvas
                element={elementData}
                onUpdate={(payload) => {
                  patchElementRef.current?.(payload, {
                    eleID: payload?.id ?? elementData?.id,
                  });
                }}
                close={openOffcavanas}
                textColor={darkTextColor}
                theme={theme}
              />
             )}
             {offcanvas === "Table" && (
              <TableElementOffcanvas
                element={elementData}
                onUpdate={(payload) => {
                  patchElementRef.current?.(payload, {
                    eleID: payload?.id ?? elementData?.id,
                  });
                }}
                close={openOffcavanas}
                textColor={darkTextColor}
                theme={theme}
              />
             )}
             {offcanvas === "Between" && (
              <BetweenElementOffcanvas
                element={elementData}
                onUpdate={(payload) => {
                  patchElementRef.current?.(payload, {
                    eleID: payload?.id ?? elementData?.id,
                  });
                }}
                close={openOffcavanas}
                textColor={darkTextColor}
                theme={theme}
              />
             )}
             {offcanvas === "Divider" && (
              <DividerElementOffcanvas
                element={elementData}
                onUpdate={(payload) => {
                  patchElementRef.current?.(payload, {
                    eleID: payload?.id ?? elementData?.id,
                  });
                }}
                close={openOffcavanas}
                textColor={darkTextColor}
                theme={theme}
              />
             )}
             
             {offcanvas === "Top" && (
              <TopBarOffcanvas open={offcanvas === "Top"} close={setOffcanvas} topBar={topBar} darkMode={darkMode} darkTextColor={darkTextColor} updateTopBar={setTopBar}/>
             )}

{["Menu","Nav"].includes(offcanvas) && (
              <MenuBarOffcanvas  open={["Menu","Nav"].includes(offcanvas)} device={device} close={setOffcanvas} navBottom={navBottom} textColor={darkTextColor} menuBarDesktop={menuBarDesktop} menuBarMobile={menuBarMobile} updateMenuBar={(data,isNav=false)=>editMenuBar(data,isNav)} darkMode={darkMode} darkTextColor={darkTextColor}/>
)}
</Suspense>
</aside>
)}
  
    
       
           
             


             </div>
        </div>
    )
}


export default Builder;