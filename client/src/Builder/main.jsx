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
const UpdatePost = lazy(() => import("./updatePost"));
const HeroPage = lazy(() => import("./hero"));
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
const HeroOffcanvas = lazy(() => import("./Offcanvas/hero"));

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



 


  const [mobilePage,setMobilePage] = useState(0);
  const [navOpen, setNavOpen] = useState(false);




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

    useEffect(() => {
      const path = location.pathname || "";
      if (path === "/menus" && selectedMenuId !== "Menu") {
        setSelectedMenuId("Menu");
        return;
      }
      if (path === "/heros" && selectedMenuId !== "Hero") {
        setSelectedMenuId("Hero");
        return;
      }
      if (path === "/builder" && selectedMenuId !== "Builder") {
        setSelectedMenuId("Builder");
        return;
      }
      if (path === "/categories" && selectedMenuId !== "Category") {
        setSelectedMenuId("Category");
        return;
      }
      if (path === "/posts" && selectedMenuId !== "Posts") {
        setSelectedMenuId("Posts");
      }
    }, [location.pathname, selectedMenuId]);
    
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

const createDefaultMenuItems = () =>
  Array.from({ length: 6 }, (_, i) => ({
    ...menu,
    id: Math.round(Math.random() * 1e9),
    name: "Home - " + i,
  }));
const menuPresetVisualConfigRef = useRef({
  menuBarDesktop: null,
  menuBarMobile: null,
  menuBarMobilePhone: null,
  navBottomMobile: null,
  navBottomTablet: null,
  topBar: null,
});
const clonePresetVisualConfig = (source = {}) => ({
  menuBarDesktop: _.cloneDeep(source?.menuBarDesktop),
  menuBarMobile: _.cloneDeep(source?.menuBarMobile),
  menuBarMobilePhone: _.cloneDeep(source?.menuBarMobilePhone ?? null),
  navBottomMobile: _.cloneDeep(source?.navBottomMobile),
  navBottomTablet: _.cloneDeep(source?.navBottomTablet),
  topBar: _.cloneDeep(source?.topBar),
});
const withPresetVisualConfig = (preset, fallback = menuPresetVisualConfigRef.current) => ({
  ...preset,
  menuBarDesktop: _.cloneDeep(preset?.menuBarDesktop ?? fallback?.menuBarDesktop),
  menuBarMobile: _.cloneDeep(preset?.menuBarMobile ?? fallback?.menuBarMobile),
  menuBarMobilePhone: _.cloneDeep(
    Object.prototype.hasOwnProperty.call(preset || {}, "menuBarMobilePhone")
      ? preset?.menuBarMobilePhone ?? null
      : fallback?.menuBarMobilePhone ?? null
  ),
  navBottomMobile: _.cloneDeep(preset?.navBottomMobile ?? fallback?.navBottomMobile),
  navBottomTablet: _.cloneDeep(preset?.navBottomTablet ?? fallback?.navBottomTablet),
  topBar: _.cloneDeep(preset?.topBar ?? fallback?.topBar),
});
const buildMenuPreset = (preset, visualSource = menuPresetVisualConfigRef.current) => ({
  ...preset,
  ...clonePresetVisualConfig(visualSource),
});
const getDefaultMenuPresetState = () => {
  const defaultItems = createDefaultMenuItems();
  return {
    menuPresets: [buildMenuPreset({ id: "menu-preset-1", name: "Menu 1", items: defaultItems })],
    activeMenuPresetId: "menu-preset-1",
    defaultMenuPresetId: "menu-preset-1",
    menus: _.cloneDeep(defaultItems),
    nextCounter: 2,
  };
};

const initialMenuPresetStateRef = useRef(null);
if (initialMenuPresetStateRef.current == null) {
  initialMenuPresetStateRef.current = getDefaultMenuPresetState();
}
const initialMenuPresetState = initialMenuPresetStateRef.current;
const [menus, setMenus] = useState(initialMenuPresetState.menus);
const [menuPresets, setMenuPresets] = useState(initialMenuPresetState.menuPresets);
const [activeMenuPresetId, setActiveMenuPresetId] = useState(initialMenuPresetState.activeMenuPresetId);
const [defaultMenuPresetId, setDefaultMenuPresetId] = useState(initialMenuPresetState.defaultMenuPresetId);
const menuPresetCounterRef = useRef(initialMenuPresetState.nextCounter);
const getDefaultHeroPresetState = () => ({
  heroPresets: [{ id: "hero-preset-1", name: "Hero 1" }],
  activeHeroPresetId: "hero-preset-1",
  defaultHeroPresetId: "hero-preset-1",
  nextCounter: 2,
});
const initialHeroPresetStateRef = useRef(null);
if (initialHeroPresetStateRef.current == null) {
  initialHeroPresetStateRef.current = getDefaultHeroPresetState();
}
const initialHeroPresetState = initialHeroPresetStateRef.current;
const [heroPresets, setHeroPresets] = useState(initialHeroPresetState.heroPresets);
const [activeHeroPresetId, setActiveHeroPresetId] = useState(initialHeroPresetState.activeHeroPresetId);
const [defaultHeroPresetId, setDefaultHeroPresetId] = useState(initialHeroPresetState.defaultHeroPresetId);
const heroPresetCounterRef = useRef(initialHeroPresetState.nextCounter);
const handleHeroStateChange = useCallback(
  ({
    heroPresets: nextHeroPresets,
    activeHeroPresetId: nextActiveHeroPresetId,
    defaultHeroPresetId: nextDefaultHeroPresetId,
  }) => {
    if (Array.isArray(nextHeroPresets)) {
      setHeroPresets((prev) =>
        _.isEqual(prev, nextHeroPresets) ? prev : _.cloneDeep(nextHeroPresets)
      );
    }
    if (typeof nextActiveHeroPresetId === "string") {
      setActiveHeroPresetId((prev) =>
        prev === nextActiveHeroPresetId ? prev : nextActiveHeroPresetId
      );
    }
    if (typeof nextDefaultHeroPresetId === "string") {
      setDefaultHeroPresetId((prev) =>
        prev === nextDefaultHeroPresetId ? prev : nextDefaultHeroPresetId
      );
    }
  },
  []
);
const normalizePresetName = (name) => String(name || "").trim().toLowerCase();
const createDefaultHeroSection = () => ({
  id: "HeroSec-1",
  heroHeight: 400,
  slides: [{ id: "hero-slide-1", name: "Slide 1", displayMode: "fade", durationSec: 5, layerItems: [] }],
  activeSlideId: "hero-slide-1",
  activeLayerItemId: null,
  isAutoPlay: false,
  slideDisplayMode: "fade",
  slideDurationSec: 5,
  bulletShape: "circle",
  bulletSize: 10,
  bulletColor: "#454b57",
  bulletBottomOffset: 12,
  latestColID: 3,
  isFluid: false,
  isGradient: false,
  paddingTop: 30,
  paddingBottom: 30,
  sectionOverlapTop: 0,
  sectionOverlapTopDesktop: 0,
  sectionOverlapTopTablet: 0,
  sectionOverlapTopMobile: 0,
  opacityImage: 1,
  opacityColor: 255,
  opacityColorGradient: [255, 255],
  backgroundImage: "",
  backgroundColor: "#ffffff",
  backgroundColorGradient: [
    { type: "mainColor", index: 0 },
    { type: "mainColor", index: 1 },
  ],
  degrees: 90,
  blur: 0,
  gridBorder: false,
  noColumnGap: false,
  parallaxEnabled: false,
  columnDividerStyle: "dashed",
  columnDividerColor: "#d8d8d8",
  columnDividerOpacity: 255,
  columnDividerVerticalLengthPercent: 95,
  _sectionIndex: 0,
  _isSplitSection: false,
});
const [heroSection, setHeroSection] = useState(createDefaultHeroSection);
useEffect(() => {
  if (offcanvas !== "Hero") return;
  setElementData((prev) => {
    if (!prev) return _.cloneDeep(heroSection);
    const nextHero = _.cloneDeep(heroSection);
    if (_.isEqual(prev, nextHero)) return prev;
    return nextHero;
  });
}, [offcanvas, heroSection]);
const isMenuPresetNameTaken = (name, excludeId = null) => {
  const normalized = normalizePresetName(name);
  if (!normalized) return false;
  return menuPresets.some(
    (preset) =>
      preset.id !== excludeId && normalizePresetName(preset.name) === normalized
  );
};
const buildUniqueMenuPresetName = (baseName, excludeId = null) => {
  const base = String(baseName || "").trim();
  if (!isMenuPresetNameTaken(base, excludeId)) return base;
  let index = 2;
  let candidate = `${base} ${index}`;
  while (isMenuPresetNameTaken(candidate, excludeId)) {
    index += 1;
    candidate = `${base} ${index}`;
  }
  return candidate;
};

const createMenuPreset = useCallback(
  (name) => {
    const trimmedName = String(name || "").trim();
    if (trimmedName.length < 3) return { ok: false, reason: "too_short" };
    if (isMenuPresetNameTaken(trimmedName)) {
      return { ok: false, reason: "duplicate_name" };
    }
    const nextId = `menu-preset-${menuPresetCounterRef.current++}`;
    const nextItems =
      Array.isArray(menus) && menus.length > 0
        ? _.cloneDeep(menus)
        : createDefaultMenuItems();
    const preset = buildMenuPreset({ id: nextId, name: trimmedName, items: nextItems });
    const nextPresets = [...menuPresets, preset];
    setMenuPresets(nextPresets);
    setActiveMenuPresetId(nextId);
    setMenus(_.cloneDeep(nextItems));
    return { ok: true, id: nextId, name: trimmedName };
  },
  [menus, menuPresets]
);

const selectMenuPreset = useCallback(
  (presetId) => {
    const selected = menuPresets.find((item) => item.id === presetId);
    if (!selected) return;
    const hydratedPreset = withPresetVisualConfig(selected);
    setMenuPresets((prev) =>
      prev.map((item) => (item.id === presetId ? hydratedPreset : item))
    );
    setActiveMenuPresetId(presetId);
    setMenus(_.cloneDeep(hydratedPreset.items || createDefaultMenuItems()));
    if (hydratedPreset?.menuBarDesktop) setMenuBarDesktop(_.cloneDeep(hydratedPreset.menuBarDesktop));
    if (hydratedPreset?.menuBarMobile) setMenuBarMobile(_.cloneDeep(hydratedPreset.menuBarMobile));
    if (Object.prototype.hasOwnProperty.call(hydratedPreset || {}, "menuBarMobilePhone")) {
      setMenuBarMobilePhone(_.cloneDeep(hydratedPreset.menuBarMobilePhone ?? null));
    }
    if (hydratedPreset?.navBottomMobile) setNavBottomMobile(_.cloneDeep(hydratedPreset.navBottomMobile));
    if (hydratedPreset?.navBottomTablet) setNavBottomTablet(_.cloneDeep(hydratedPreset.navBottomTablet));
    if (hydratedPreset?.topBar) setTopBar(_.cloneDeep(hydratedPreset.topBar));
  },
  [menuPresets]
);

const renameMenuPreset = useCallback((presetId, name) => {
  const trimmedName = String(name || "").trim();
  if (trimmedName.length < 3) return { ok: false, reason: "too_short" };
  if (isMenuPresetNameTaken(trimmedName, presetId)) {
    return { ok: false, reason: "duplicate_name" };
  }
  let updated = false;
  const nextPresets = menuPresets.map((preset) => {
    if (preset.id !== presetId) return preset;
    updated = true;
    return { ...preset, name: trimmedName };
  });
  if (updated) {
    setMenuPresets(nextPresets);
  }
  return updated
    ? { ok: true, name: trimmedName }
    : { ok: false, reason: "not_found" };
}, [menuPresets]);

const duplicateMenuPreset = useCallback(
  (presetId) => {
    const sourcePresetRaw = menuPresets.find((item) => item.id === presetId);
    if (!sourcePresetRaw) return { ok: false, reason: "not_found" };
    const sourcePreset = withPresetVisualConfig(sourcePresetRaw);
    const nextId = `menu-preset-${menuPresetCounterRef.current++}`;
    const duplicatedItems = _.cloneDeep(sourcePreset.items);
    const duplicatedName = buildUniqueMenuPresetName(`${sourcePreset.name} Copy`);
    const duplicatedPreset = buildMenuPreset(
      { id: nextId, name: duplicatedName, items: duplicatedItems },
      sourcePreset
    );
    const nextPresets = [...menuPresets, duplicatedPreset];
    setMenuPresets(nextPresets);
    setActiveMenuPresetId(nextId);
    setMenus(_.cloneDeep(duplicatedItems));
    if (duplicatedPreset?.menuBarDesktop) setMenuBarDesktop(_.cloneDeep(duplicatedPreset.menuBarDesktop));
    if (duplicatedPreset?.menuBarMobile) setMenuBarMobile(_.cloneDeep(duplicatedPreset.menuBarMobile));
    if (Object.prototype.hasOwnProperty.call(duplicatedPreset || {}, "menuBarMobilePhone")) {
      setMenuBarMobilePhone(_.cloneDeep(duplicatedPreset.menuBarMobilePhone ?? null));
    }
    if (duplicatedPreset?.navBottomMobile) setNavBottomMobile(_.cloneDeep(duplicatedPreset.navBottomMobile));
    if (duplicatedPreset?.navBottomTablet) setNavBottomTablet(_.cloneDeep(duplicatedPreset.navBottomTablet));
    if (duplicatedPreset?.topBar) setTopBar(_.cloneDeep(duplicatedPreset.topBar));
    return { ok: true, id: nextId, name: duplicatedName };
  },
  [menuPresets]
);

const deleteMenuPreset = useCallback(
  (presetId) => {
    if (menuPresets.length <= 1) return { ok: false, reason: "last_item" };
    const targetId = String(presetId);
    const removeIndex = menuPresets.findIndex((item) => String(item?.id) === targetId);
    if (removeIndex === -1) return { ok: false, reason: "not_found" };
    const removedPreset = menuPresets[removeIndex];
    const nextPresets = menuPresets.filter((item) => String(item?.id) !== targetId);
    setMenuPresets(nextPresets);
    if (String(defaultMenuPresetId) === targetId) {
      const fallbackDefault = nextPresets[Math.max(removeIndex - 1, 0)] || nextPresets[0];
      if (fallbackDefault) {
        setDefaultMenuPresetId(fallbackDefault.id);
      }
    }
    if (String(activeMenuPresetId) === targetId) {
      const fallbackPreset = nextPresets[Math.max(removeIndex - 1, 0)] || nextPresets[0];
      if (!fallbackPreset) return;
      setActiveMenuPresetId(fallbackPreset.id);
      setMenus(_.cloneDeep(fallbackPreset.items || createDefaultMenuItems()));
      if (fallbackPreset?.menuBarDesktop) setMenuBarDesktop(_.cloneDeep(fallbackPreset.menuBarDesktop));
      if (fallbackPreset?.menuBarMobile) setMenuBarMobile(_.cloneDeep(fallbackPreset.menuBarMobile));
      if (Object.prototype.hasOwnProperty.call(fallbackPreset || {}, "menuBarMobilePhone")) {
        setMenuBarMobilePhone(_.cloneDeep(fallbackPreset.menuBarMobilePhone ?? null));
      }
      if (fallbackPreset?.navBottomMobile) setNavBottomMobile(_.cloneDeep(fallbackPreset.navBottomMobile));
      if (fallbackPreset?.navBottomTablet) setNavBottomTablet(_.cloneDeep(fallbackPreset.navBottomTablet));
      if (fallbackPreset?.topBar) setTopBar(_.cloneDeep(fallbackPreset.topBar));
    }
    return { ok: true, name: removedPreset?.name || "" };
  },
  [menuPresets, activeMenuPresetId, defaultMenuPresetId]
);

const setDefaultMenuPreset = useCallback(
  (presetId) => {
    const found = menuPresets.find((item) => item.id === presetId);
    if (!found) return { ok: false, reason: "not_found" };
    if (defaultMenuPresetId === presetId) return { ok: true, name: found.name, unchanged: true };
    setDefaultMenuPresetId(presetId);
    return { ok: true, name: found.name };
  },
  [menuPresets, defaultMenuPresetId]
);

const resetMenuPresets = useCallback(() => {
  const defaultItems = createDefaultMenuItems();
  const defaultPresets = [buildMenuPreset({ id: "menu-preset-1", name: "Menu 1", items: defaultItems })];
  setMenuPresets(defaultPresets);
  setActiveMenuPresetId("menu-preset-1");
  setDefaultMenuPresetId("menu-preset-1");
  setMenus(_.cloneDeep(defaultItems));
  menuPresetCounterRef.current = 2;
}, []);

useEffect(() => {
  setMenuPresets((prev) =>
    prev.map((preset) => withPresetVisualConfig(preset))
  );
}, []);

const toBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1";
  }
  return false;
};





const [menuBarDesktop,setMenuBarDesktop] = useState({
  // Main
  menuFontSize:15,
  menuFontWeight:400,

  menuColor:"#333333",
  menuColorOpacity:255,
  activeMenuColor:{type:"mainColor",index:0},
  activeMenuColorOpacity:255,
  hoverMenuColor:{type:"mainColor",index:1},
  hoverMenuColorOpacity:255,

  isMenuGradient:false,
  bgMenuColor:"#ffffff",
  bgMenuColorGradient:[{type:"mainColor",index:0},{type:"mainColor",index:1}],

  bgMenuOpacity:95,
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
  isFluidLayout:false,


  //Sub
  subMenuFontSize:12,
  subMenuFontWeight:200,

  subMenuColor:"#000000",
  subMenuColorOpacity:255,
  activeSubMenuColor:{type:"mainColor",index:0},
  activeSubMenuColorOpacity:255,
  hoverSubMenuColor:{type:"mainColor",index:1},
  hoverSubMenuColorOpacity:255,
  hoverSubMenuBgColor:"#000000",
  hoverSubMenuBgOpacity:20,

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
  borderButtonColor:"#333333",
  iconButtonColor:"#333333",
  bgButtonOpacity:255,
  borderButtonOpacity:255,
  iconButtonOpacity:255,
  borderWidth:2,

  bgMenuColor:"#ffffff",
  bgMenuOpacity:178,

  display:"right",
  barHeight:55,

  logo:"",
  logoHeight:35,

  menuHeight:44,
  dividerStyle:"solid",
  dividerColor:"#333333",
  dividerOpacity:20,
  isFluidLayout:false,


  //Sub
  subMenuFontSize:13,
  subMenuFontWeight:400,

  subMenuColor:"#000000",
  subMenuColorOpacity:255,
  activeSubMenuColor:{type:"mainColor",index:0},
  activeSubMenuColorOpacity:255,


})
const [menuBarMobilePhone, setMenuBarMobilePhone] = useState(null);

const navBottomPrototype = (n,space)=>{
  return{
    isAbleNavBottom:true,
    navBottomDesign:"classic",
    navBottomDisplay:"menu",
    navText:"Domain.com All rights reserved.",
    navIcon:{ name: "faCopyright", type: "fas" },
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

const defaultMobileNavBottomItems = [
  { icon: { name: "faBasketShopping", type: "fas" }, label: "Product", link: "Page1" },
  { icon: { name: "faGear", type: "fas" }, label: "Service", link: "Page1" },
  { icon: { name: "faHouse", type: "fas" }, label: "Home", link: "Page1" },
  { icon: { name: "faBuilding", type: "fas" }, label: "Company", link: "Page1" },
  { icon: { name: "faHeadphones", type: "fas" }, label: "Contact", link: "Page1" },
];

const cloneDefaultMobileNavBottomItems = () =>
  defaultMobileNavBottomItems.map((item) => ({
    ...item,
    icon: { ...(item.icon || {}) },
  }));

const hasVisibleMobileNavIcon = (item) =>
  Boolean(item?.icon?.name && item.icon.name !== "fa0" && item?.icon?.type);

const normalizeMobileNavBottomItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return cloneDefaultMobileNavBottomItems();
  }

  const isLegacyDefaultItems = items.every(
    (item) =>
      (item?.label === "Home" || !item?.label) &&
      (!hasVisibleMobileNavIcon(item))
  );

  if (isLegacyDefaultItems) {
    return cloneDefaultMobileNavBottomItems();
  }

  return items.slice(0, 5).map((item, index) => ({
    ...defaultMobileNavBottomItems[index % defaultMobileNavBottomItems.length],
    ...(item || {}),
    icon: item?.icon || defaultMobileNavBottomItems[index % defaultMobileNavBottomItems.length].icon,
  }));
};

const normalizeMobileNavBottomDefaults = (navBottomData) => {
  if (!navBottomData) return navBottomData;
  const next = { ...navBottomData };
  const isDefaultMobilePreset =
    next.navBottomDesign === "modern" &&
    Number(next.navHeight) === 60 &&
    Number(next.navSpace) === 5 &&
    Array.isArray(next.navBottoms) &&
    next.navBottoms.length === 5 &&
    next.navBottoms.every(
      (item, idx) =>
        String(item?.label || "").trim().toLowerCase() ===
        String(defaultMobileNavBottomItems[idx]?.label || "").trim().toLowerCase()
    );

  const isLegacyDesignDefault =
    next.navBottomDesign == null || next.navBottomDesign === "classic";
  if (isLegacyDesignDefault) {
    next.navBottomDesign = "modern";
  }

  const isLegacyBgDefault =
    (next.bgNav == null || next.bgNav === "#000000") &&
    (next.bgNavOpacity == null || next.bgNavOpacity === 255);
  if (isLegacyBgDefault) {
    next.bgNav = "#333333";
    next.bgNavOpacity = 255;
  }

  const isLegacyNavHeightDefault = next.navHeight == null || next.navHeight === 56;
  if (isLegacyNavHeightDefault) {
    next.navHeight = 60;
  }

  const isLegacyNavSpaceDefault = next.navSpace == null || next.navSpace === 10;
  if (isLegacyNavSpaceDefault) {
    next.navSpace = 5;
  }

  const isLegacyIconSizeDefault = next.iconSize == null || next.iconSize === 20;
  if (isLegacyIconSizeDefault) {
    next.iconSize = 19;
  }

  const isLegacyIconColorDefault =
    next.iconColor == null ||
    next.iconColor === "#ffffff" ||
    next.iconColor === "white" ||
    next.iconColor === "#000000" ||
    next.iconColor === "black" ||
    (typeof next.iconColor === "object" &&
      next.iconColor?.type === "textColor" &&
      Number(next.iconColor?.index) === 0) ||
    (isDefaultMobilePreset && typeof next.iconColor === "object");
  if (isLegacyIconColorDefault) {
    next.iconColor = "#ffffff";
    next.iconOpacity = 255;
  }

  const isLegacyLabelColorDefault =
    next.labelColor == null ||
    next.labelColor === "#ffffff" ||
    next.labelColor === "white" ||
    next.labelColor === "#000000" ||
    next.labelColor === "black" ||
    (typeof next.labelColor === "object" &&
      next.labelColor?.type === "textColor" &&
      Number(next.labelColor?.index) === 0) ||
    (isDefaultMobilePreset && typeof next.labelColor === "object");
  if (isLegacyLabelColorDefault) {
    next.labelColor = "#ffffff";
    next.labelOpacity = 255;
  }

  if (!next.navText || String(next.navText).trim().toLowerCase() === "home") {
    next.navText = "Domain.com All rights reserved.";
  }
  if (
    !next.navIcon ||
    typeof next.navIcon !== "object" ||
    !next.navIcon.name ||
    !next.navIcon.type ||
    next.navIcon.name === "fa0"
  ) {
    next.navIcon = { name: "faCopyright", type: "fas" };
  }

  return next;
};

const createDefaultMobileNavBottom = () => ({
  ...navBottomPrototype(5,5),
  navBottomDesign: "modern",
  bgNav: "#333333",
  iconSize: 19,
  iconColor: "#ffffff",
  labelColor: "#ffffff",
  navHeight: 60,
  navSpace: 5,
  navBottoms: cloneDefaultMobileNavBottomItems(),
});


const [navBottomMobile,setNavBottomMobile] = useState(createDefaultMobileNavBottom())

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

const defaultTopBarSocialIcons = [
  {
    ...iconTopBar,
    icon: { name: "faTiktok", type: "fab" },
    iconSize: 16,
  },
  {
    ...iconTopBar,
    icon: { name: "faFacebookF", type: "fab" },
    iconSize: 16,
  },
  {
    ...iconTopBar,
    icon: { name: "faXTwitter", type: "fab" },
    iconSize: 16,
  },
];

const cloneDefaultTopBarSocialIcons = () =>
  defaultTopBarSocialIcons.map((item) => ({
    ...item,
    icon: { ...(item.icon || {}) },
  }));

const hasVisibleTopBarIcon = (item) =>
  Boolean(item?.icon?.name && item.icon.name !== "fa0" && item?.icon?.type);

const normalizeTopBarIconGroup = (iconGroup) => {
  if (!Array.isArray(iconGroup) || iconGroup.length === 0) {
    return cloneDefaultTopBarSocialIcons();
  }

  if (!iconGroup.some(hasVisibleTopBarIcon)) {
    return cloneDefaultTopBarSocialIcons();
  }

  return iconGroup.map((item) => ({
    ...iconTopBar,
    ...(item || {}),
    icon: item?.icon || iconTopBar.icon,
  }));
};

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

const defaultTopBarTextItems = [
  {
    ...textTopBar,
    icon: { name: "faPhone", type: "fas" },
    iconSize: 16,
    text: "089-012-34567",
  },
  {
    ...textTopBar,
    icon: { name: "faLocationDot", type: "fas" },
    iconSize: 16,
    text: "Bangkok Thailand",
  },
  {
    ...textTopBar,
    icon: { name: "faClock", type: "fas" },
    iconSize: 16,
    text: "09 : 00 AM - 05 : 00 PM",
  },
];

const cloneDefaultTopBarTextItems = () =>
  defaultTopBarTextItems.map((item) => ({
    ...item,
    icon: { ...(item.icon || {}) },
  }));

const normalizeTopBarTextGroup = (textGroup) => {
  if (!Array.isArray(textGroup) || textGroup.length === 0) {
    return cloneDefaultTopBarTextItems();
  }

  const isLegacyDefaultGroup = textGroup.every(
    (item) =>
      (!item?.icon?.name || item.icon.name === "fa0") &&
      (!item?.text || item.text === "Bangkok Thailand")
  );

  if (isLegacyDefaultGroup) {
    return cloneDefaultTopBarTextItems();
  }

  return textGroup.map((item) => ({
    ...textTopBar,
    ...(item || {}),
    icon: item?.icon || textTopBar.icon,
  }));
};


const [topBar,setTopBar] = useState({
  ableLeft:true,
  hideTopBarEverywhere:false,
  tabletTopBarMode:"social",
  topBarHeight:52,
  isFluidLayout:false,
  isGradient:false,
  bgColor:"#333333",
  bgOpacity:255,
  bgColorGradient:[{type:"mainColor",index:0},{type:"mainColor",index:1}],
  bgOpacityGradient:[255,255],
  bgDegree:0,
  borderSize:26,
  radius:50,
  iconGroup: defaultTopBarSocialIcons,

  ableRight:true,
  radiusText:50,
  borderTextSize:26,
  textGroup: cloneDefaultTopBarTextItems(),
})

useEffect(() => {
  menuPresetVisualConfigRef.current = {
    menuBarDesktop: _.cloneDeep(menuBarDesktop),
    menuBarMobile: _.cloneDeep(menuBarMobile),
    menuBarMobilePhone: _.cloneDeep(menuBarMobilePhone ?? null),
    navBottomMobile: _.cloneDeep(navBottomMobile),
    navBottomTablet: _.cloneDeep(navBottomTablet),
    topBar: _.cloneDeep(topBar),
  };
}, [menuBarDesktop, menuBarMobile, menuBarMobilePhone, navBottomMobile, navBottomTablet, topBar]);

useEffect(() => {
  setMenuPresets((prev) =>
    prev.map((preset) =>
      preset.id === activeMenuPresetId
        ? { ...preset, items: _.cloneDeep(menus) }
        : preset
    )
  );
}, [activeMenuPresetId, menus]);


const menuButtonRef = useRef(null);
const isHydratingMenuBarRef = useRef(false);
const isFirstMenuPresetPersistRef = useRef(true);



const loadMenuBar = () => {
  isHydratingMenuBarRef.current = true;
  getMenuBar("69db17211be82fe7637ea096").then((res) => {
    const {
      menuBarDesktop: md,
      menuBarMobile: mm,
      menuBarMobilePhone: mmp,
      navBottomMobile: nm,
      navBottomTablet: nt,
      topBar: tb,
      menuPresets: serverMenuPresets,
      activeMenuPresetId: serverActiveMenuPresetId,
      defaultMenuPresetId: serverDefaultMenuPresetId,
      heroPresets: serverHeroPresets,
      activeHeroPresetId: serverActiveHeroPresetId,
      defaultHeroPresetId: serverDefaultHeroPresetId,
      heroSection: serverHeroSection,
    } = res.data
    const normalizeMenuBarMobileDefaults = (menuBarMobileData) => {
      if (!menuBarMobileData) return menuBarMobileData;
      const next = { ...menuBarMobileData };
      const isLegacyDividerDefault =
        (next.dividerColor === "#000000" || !next.dividerColor) &&
        (next.dividerOpacity === 255 || next.dividerOpacity == null);

      if (isLegacyDividerDefault) {
        next.dividerColor = "#333333";
        next.dividerOpacity = 20;
      }

      const isLegacyMenuTextDefault =
        (next.menuColor === "#000000" || !next.menuColor) &&
        (next.menuColorOpacity === 255 || next.menuColorOpacity == null);
      if (isLegacyMenuTextDefault) {
        next.menuColor = "#333333";
      }

      const isLegacyMenuBgDefault =
        (next.bgMenuColor === "#ffffff" || !next.bgMenuColor) &&
        (next.bgMenuOpacity === 255 || next.bgMenuOpacity == null);
      if (isLegacyMenuBgDefault) {
        next.bgMenuColor = "#ffffff";
        next.bgMenuOpacity = 178;
      }

      const isLegacyButtonBorderColorDefault =
        !next.borderButtonColor || next.borderButtonColor === "#000000";
      if (isLegacyButtonBorderColorDefault) {
        next.borderButtonColor = "#333333";
      }

      const isLegacyButtonIconColorDefault =
        !next.iconButtonColor || next.iconButtonColor === "#000000";
      if (isLegacyButtonIconColorDefault) {
        next.iconButtonColor = "#333333";
      }

      const isLegacySizingDefault =
        (next.borderWidth === 1 || next.borderWidth == null) &&
        (next.barHeight === 50 || next.barHeight == null) &&
        (next.menuHeight === 40 || next.menuHeight == null);
      if (isLegacySizingDefault) {
        next.borderWidth = 2;
        next.barHeight = 55;
        next.menuHeight = 44;
      }

      return next;
    };

    const normalizedMenuBarDesktop = {
      ...menuBarDesktop,
      ...(md || {}),
      isFluidLayout: toBoolean(md?.isFluidLayout),
    };
    const normalizedMenuBarMobile = {
      ...menuBarMobile,
      ...normalizeMenuBarMobileDefaults(mm),
      isFluidLayout: toBoolean(mm?.isFluidLayout),
    };
    const normalizedMenuBarMobilePhone = mmp
      ? {
          ...normalizedMenuBarMobile,
          ...normalizeMenuBarMobileDefaults(mmp),
          isFluidLayout: toBoolean(mmp?.isFluidLayout),
        }
      : null;
    const normalizedMobileNavBottom = {
      ...createDefaultMobileNavBottom(),
      ...normalizeMobileNavBottomDefaults({
        ...(nm || {}),
        navBottoms: normalizeMobileNavBottomItems(nm?.navBottoms),
      }),
      navBottomDisplay: "menu",
    };
    const normalizedTabletNavBottom = {
      ...navBottomPrototype(7,12),
      ...(nt || {}),
      navBottomDisplay: "menu",
    };
    const normalizedTopBar = {
      ...topBar,
      ...(tb || {}),
      iconGroup: normalizeTopBarIconGroup(tb?.iconGroup),
      textGroup: normalizeTopBarTextGroup(tb?.textGroup),
      bgColor:
        !tb?.bgColor || tb.bgColor === "#000000"
          ? "#333333"
          : tb.bgColor,
      isFluidLayout: tb?.isFluidLayout === true,
    };
    setMenuBarDesktop(normalizedMenuBarDesktop);
    setMenuBarMobile(normalizedMenuBarMobile);
    setMenuBarMobilePhone(normalizedMenuBarMobilePhone);
    setNavBottomMobile(normalizedMobileNavBottom);
    setNavBottomTablet(normalizedTabletNavBottom);
    setTopBar(normalizedTopBar);

    const fallbackVisualConfig = {
      menuBarDesktop: normalizedMenuBarDesktop,
      menuBarMobile: normalizedMenuBarMobile,
      menuBarMobilePhone: normalizedMenuBarMobilePhone,
      navBottomMobile: normalizedMobileNavBottom,
      navBottomTablet: normalizedTabletNavBottom,
      topBar: normalizedTopBar,
    };
    const normalizedPresets = (Array.isArray(serverMenuPresets) ? serverMenuPresets : [])
      .map((preset, index) => {
        const mergedMenuBarDesktop = _.merge(
          _.cloneDeep(fallbackVisualConfig.menuBarDesktop),
          _.cloneDeep(preset?.menuBarDesktop || {})
        );
        mergedMenuBarDesktop.isFluidLayout = toBoolean(
          preset?.menuBarDesktop?.isFluidLayout ??
            fallbackVisualConfig.menuBarDesktop?.isFluidLayout
        );
        const mergedMenuBarMobile = _.merge(
          _.cloneDeep(fallbackVisualConfig.menuBarMobile),
          _.cloneDeep(normalizeMenuBarMobileDefaults(preset?.menuBarMobile) || {})
        );
        mergedMenuBarMobile.isFluidLayout = toBoolean(
          preset?.menuBarMobile?.isFluidLayout ??
            fallbackVisualConfig.menuBarMobile?.isFluidLayout
        );
        const mergedMenuBarMobilePhone =
          preset?.menuBarMobilePhone == null
            ? _.cloneDeep(fallbackVisualConfig.menuBarMobilePhone)
            : _.merge(
                _.cloneDeep(fallbackVisualConfig.menuBarMobilePhone || fallbackVisualConfig.menuBarMobile),
                _.cloneDeep(normalizeMenuBarMobileDefaults(preset?.menuBarMobilePhone) || {})
              );
        if (mergedMenuBarMobilePhone) {
          mergedMenuBarMobilePhone.isFluidLayout = toBoolean(
            preset?.menuBarMobilePhone?.isFluidLayout ??
              fallbackVisualConfig.menuBarMobilePhone?.isFluidLayout
          );
        }
        const mergedNavBottomMobile = _.merge(
          _.cloneDeep(fallbackVisualConfig.navBottomMobile),
          _.cloneDeep(normalizeMobileNavBottomDefaults(preset?.navBottomMobile) || {})
        );
        mergedNavBottomMobile.navBottoms = normalizeMobileNavBottomItems(
          preset?.navBottomMobile?.navBottoms ??
            fallbackVisualConfig.navBottomMobile?.navBottoms
        );
        const mergedNavBottomTablet = _.merge(
          _.cloneDeep(fallbackVisualConfig.navBottomTablet),
          _.cloneDeep(preset?.navBottomTablet || {})
        );
        mergedNavBottomTablet.navBottomDisplay = "menu";
        const mergedTopBar = _.merge(
          _.cloneDeep(fallbackVisualConfig.topBar),
          _.cloneDeep(preset?.topBar || {})
        );
        mergedTopBar.iconGroup = normalizeTopBarIconGroup(
          preset?.topBar?.iconGroup ?? fallbackVisualConfig.topBar?.iconGroup
        );
        mergedTopBar.textGroup = normalizeTopBarTextGroup(
          preset?.topBar?.textGroup ?? fallbackVisualConfig.topBar?.textGroup
        );
        mergedTopBar.bgColor =
          !preset?.topBar?.bgColor || preset.topBar.bgColor === "#000000"
            ? fallbackVisualConfig.topBar?.bgColor || "#333333"
            : preset.topBar.bgColor;
        mergedTopBar.isFluidLayout =
          preset?.topBar?.isFluidLayout === true ||
          fallbackVisualConfig.topBar?.isFluidLayout === true;
        const nextPreset = {
          id: String(preset?.id || `menu-preset-${index + 1}`),
          name: String(preset?.name || `Menu ${index + 1}`),
          items:
            Array.isArray(preset?.items) && preset.items.length > 0
              ? _.cloneDeep(preset.items)
              : createDefaultMenuItems(),
          menuBarDesktop: mergedMenuBarDesktop,
          menuBarMobile: mergedMenuBarMobile,
          menuBarMobilePhone: mergedMenuBarMobilePhone,
          navBottomMobile: mergedNavBottomMobile,
          navBottomTablet: mergedNavBottomTablet,
          topBar: mergedTopBar,
        };
        return nextPreset;
      })
      .filter((preset) => Array.isArray(preset.items));

    const presetsToUse =
      normalizedPresets.length > 0
        ? normalizedPresets
        : [
            buildMenuPreset(
              {
                id: "menu-preset-1",
                name: "Menu 1",
                items: createDefaultMenuItems(),
              },
              fallbackVisualConfig
            ),
          ];
    const restoredActiveId = presetsToUse.some(
      (preset) => preset.id === serverActiveMenuPresetId
    )
      ? serverActiveMenuPresetId
      : presetsToUse[0].id;
    const restoredDefaultId = presetsToUse.some(
      (preset) => preset.id === serverDefaultMenuPresetId
    )
      ? serverDefaultMenuPresetId
      : restoredActiveId;
    const restoredActivePreset =
      presetsToUse.find((preset) => preset.id === restoredActiveId) ||
      presetsToUse[0];
    setMenuPresets(presetsToUse);
    setActiveMenuPresetId(restoredActiveId);
    setDefaultMenuPresetId(restoredDefaultId);
    setMenus(_.cloneDeep(restoredActivePreset?.items || createDefaultMenuItems()));
    if (restoredActivePreset?.menuBarDesktop) {
      setMenuBarDesktop(_.cloneDeep(restoredActivePreset.menuBarDesktop));
    }
    if (restoredActivePreset?.menuBarMobile) {
      setMenuBarMobile(_.cloneDeep(restoredActivePreset.menuBarMobile));
    }
    if (Object.prototype.hasOwnProperty.call(restoredActivePreset || {}, "menuBarMobilePhone")) {
      setMenuBarMobilePhone(_.cloneDeep(restoredActivePreset.menuBarMobilePhone ?? null));
    }
    if (restoredActivePreset?.navBottomMobile) {
      setNavBottomMobile(_.cloneDeep(restoredActivePreset.navBottomMobile));
    }
    if (restoredActivePreset?.navBottomTablet) {
      setNavBottomTablet(_.cloneDeep(restoredActivePreset.navBottomTablet));
    }
    if (restoredActivePreset?.topBar) {
      setTopBar(_.cloneDeep(restoredActivePreset.topBar));
    }
    const maxCounter = presetsToUse.reduce((acc, preset) => {
      const match = String(preset.id || "").match(/menu-preset-(\d+)/);
      if (!match) return acc;
      const num = Number(match[1]);
      if (Number.isNaN(num)) return acc;
      return Math.max(acc, num);
    }, 1);
    menuPresetCounterRef.current = maxCounter + 1;
    const normalizedHeroPresets = (Array.isArray(serverHeroPresets) ? serverHeroPresets : [])
      .map((preset, index) => ({
        id: String(preset?.id || `hero-preset-${index + 1}`),
        name: String(preset?.name || `Hero ${index + 1}`),
      }))
      .filter((preset) => preset.id && preset.name);
    const heroPresetsToUse =
      normalizedHeroPresets.length > 0
        ? normalizedHeroPresets
        : getDefaultHeroPresetState().heroPresets;
    const restoredActiveHeroId = heroPresetsToUse.some(
      (preset) => preset.id === serverActiveHeroPresetId
    )
      ? serverActiveHeroPresetId
      : heroPresetsToUse[0].id;
    const restoredDefaultHeroId = heroPresetsToUse.some(
      (preset) => preset.id === serverDefaultHeroPresetId
    )
      ? serverDefaultHeroPresetId
      : restoredActiveHeroId;
    setHeroPresets(heroPresetsToUse);
    setActiveHeroPresetId(restoredActiveHeroId);
    setDefaultHeroPresetId(restoredDefaultHeroId);
    const maxHeroCounter = heroPresetsToUse.reduce((acc, preset) => {
      const match = String(preset.id || "").match(/hero-preset-(\d+)/);
      if (!match) return acc;
      const num = Number(match[1]);
      if (Number.isNaN(num)) return acc;
      return Math.max(acc, num);
    }, 1);
    heroPresetCounterRef.current = maxHeroCounter + 1;
    const normalizedHeroSection = {
      ...createDefaultHeroSection(),
      ...(serverHeroSection || {}),
      id: String(serverHeroSection?.id || "HeroSec-1"),
      _sectionIndex: 0,
      _isSplitSection: false,
    };
    setHeroSection(normalizedHeroSection);
    isHydratingMenuBarRef.current = false;
  }).catch(() => {
    isHydratingMenuBarRef.current = false;
  });
}; // โหลดข้อมูลหน้า

useEffect(() => {
  if (isHydratingMenuBarRef.current) return;
  if (isFirstMenuPresetPersistRef.current) {
    isFirstMenuPresetPersistRef.current = false;
    return;
  }
  const timer = setTimeout(() => {
    const menuBarData = {
      menuBarDesktop,
      menuBarMobile,
      menuBarMobilePhone,
      navBottomMobile,
      navBottomTablet,
      topBar,
      menuPresets,
      activeMenuPresetId,
      defaultMenuPresetId,
      heroPresets,
      activeHeroPresetId,
      defaultHeroPresetId,
      heroSection,
    };
    updateMenuBar(menuBarData ,"69db17211be82fe7637ea096").catch(() => {});
  }, 120);
  return () => clearTimeout(timer);
}, [
  menuPresets,
  activeMenuPresetId,
  defaultMenuPresetId,
  menuBarDesktop,
  menuBarMobile,
  menuBarMobilePhone,
  navBottomMobile,
  navBottomTablet,
  topBar,
  heroPresets,
  activeHeroPresetId,
  defaultHeroPresetId,
  heroSection,
]);

useEffect(() => {
  loadMenuBar();
}, []); // ดึง

useEffect(()=>{
  console.log(navBottomTablet);
},[navBottomTablet])






const navBottom = device === "Mobile" ? navBottomMobile:navBottomTablet
const menuBarForCurrentDevice =
  device === "Mobile" ? (menuBarMobilePhone || menuBarMobile) : menuBarMobile;

const syncActivePresetVisualField = useCallback((field, value) => {
  if (!activeMenuPresetId) return;
  setMenuPresets((prev) =>
    prev.map((preset) =>
      preset.id === activeMenuPresetId
        ? { ...preset, [field]: _.cloneDeep(value) }
        : preset
    )
  );
}, [activeMenuPresetId]);

const updateTopBarForPreset = useCallback((valueOrUpdater) => {
  setTopBar((prev) => {
    const next =
      typeof valueOrUpdater === "function" ? valueOrUpdater(prev) : valueOrUpdater;
    syncActivePresetVisualField("topBar", next);
    return next;
  });
}, [syncActivePresetVisualField]);




const editMenuBar = (data,isNav)=>{
  if(["Mobile","Tablet"].includes(device)){
    if(isNav){
      if(device === "Mobile"){
        setNavBottomMobile(data)
        syncActivePresetVisualField("navBottomMobile", data);
      }else{
        setNavBottomTablet(data)
        syncActivePresetVisualField("navBottomTablet", data);
      }
    }else{
      if (device === "Mobile") {
        setMenuBarMobilePhone(data);
        syncActivePresetVisualField("menuBarMobilePhone", data);
      } else {
        setMenuBarMobile(data)
        syncActivePresetVisualField("menuBarMobile", data);
      }
    }
   
  }else{
    setMenuBarDesktop(data)
    syncActivePresetVisualField("menuBarDesktop", data);
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

const previousSelectedMenuRef = useRef(selectedMenuId);
useEffect(() => {
  const previous = previousSelectedMenuRef.current;
  if (selectedMenuId === "Menu" && previous !== "Menu") {
    const defaultPreset =
      menuPresets.find((preset) => preset.id === defaultMenuPresetId) || menuPresets[0];
    if (defaultPreset) {
      setActiveMenuPresetId(defaultPreset.id);
      setMenus(_.cloneDeep(defaultPreset.items || createDefaultMenuItems()));
      if (defaultPreset?.menuBarDesktop) setMenuBarDesktop(_.cloneDeep(defaultPreset.menuBarDesktop));
      if (defaultPreset?.menuBarMobile) setMenuBarMobile(_.cloneDeep(defaultPreset.menuBarMobile));
      if (Object.prototype.hasOwnProperty.call(defaultPreset || {}, "menuBarMobilePhone")) {
        setMenuBarMobilePhone(_.cloneDeep(defaultPreset.menuBarMobilePhone ?? null));
      }
      if (defaultPreset?.navBottomMobile) setNavBottomMobile(_.cloneDeep(defaultPreset.navBottomMobile));
      if (defaultPreset?.navBottomTablet) setNavBottomTablet(_.cloneDeep(defaultPreset.navBottomTablet));
      if (defaultPreset?.topBar) setTopBar(_.cloneDeep(defaultPreset.topBar));
    }
  }
  previousSelectedMenuRef.current = selectedMenuId;
}, [selectedMenuId, defaultMenuPresetId, menuPresets]);



const submitMenuBar = ()=>{
  const menuBarData = {
    menuBarDesktop,
    menuBarMobile,
    menuBarMobilePhone,
    navBottomMobile,
    navBottomTablet,
    topBar,
    menuPresets,
    activeMenuPresetId,
    defaultMenuPresetId,
    heroPresets,
    activeHeroPresetId,
    defaultHeroPresetId,
    heroSection,
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


const offcanvasWidth =
  offcanvas === "Nav"
    ? 500
    : offcanvas === "Hero"
      ? 400
      : 400;



  

    return(
        <div className={`${darkMode === "dark" ?"dark":""} h-screen w-full overflow-x-hidden`}>
         

        
             <div className="flex h-full min-h-0 min-w-0 w-full overflow-x-hidden bg-slate-50 dark:bg-gray-950   " style={{color:darkTextColor}}>


                {!isPreviewRoute && (
                  <Suspense fallback={null}>
                    <Navbar handleDragElement={handleDragElement} isDark={darkMode} selectedMenuId={selectedMenuId} setSelectedMenuId={setSelectedMenuId}  post={sendPost()} updateNewTheme={updateNewTheme} isEditPost={isEditPost} setMobilePage={setMobilePage}  mobilePage={mobilePage}  navOpen={navOpen} setNavOpen={setNavOpen}/>
                  </Suspense>
                )}

             <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                {!isPreviewRoute && (
                  <Suspense fallback={null}>
                    <Header menuButtonRef={menuButtonRef} submitMenuBar={submitMenuBar} topBarData={topBar} menuBarDesktop={menuBarDesktop} menuBarMobile={menuBarForCurrentDevice} theme={theme} setFont={setFont} toggleDarkMode={toggleDarkMode} setOpenBar={setOffcanvas} openBar={offcanvas} isDark={darkMode} menus={menus} setBuilderMode={setBuilderMode} builderMode={builderMode} deviceType={device} setDevice={setDevice} pageName={page.pageName} textColor={darkTextColor} option={selectedMenuId} setNavOpen={setNavOpen} isAddPost={isAddPost} submitPost={handleSubmit} updatePost={handleUpdate} onOpenPreview={openPreviewPage} menuPresets={menuPresets} activeMenuPresetId={activeMenuPresetId} defaultMenuPresetId={defaultMenuPresetId} onCreateMenuPreset={createMenuPreset} onSelectMenuPreset={selectMenuPreset} onSetDefaultMenuPreset={setDefaultMenuPreset} onRenameMenuPreset={renameMenuPreset} onDuplicateMenuPreset={duplicateMenuPreset} onDeleteMenuPreset={deleteMenuPreset} onResetMenuPresets={resetMenuPresets} heroPresets={heroPresets} activeHeroPresetId={activeHeroPresetId} defaultHeroPresetId={defaultHeroPresetId} onHeroStateChange={handleHeroStateChange}/>
                  </Suspense>
                )}

                <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden">
                  <Suspense fallback={<div className="h-full min-h-0 flex-1 bg-transparent" />}>
                    <Routes>
                    <Route path="posts" element={<PostData copy={handleSubmit} setIsEditPost={setIsEditPost} setPostID={setPostID} setOption={setSelectedMenuId} setIsAddPost={setIsAddPost} setNavOpen={setNavOpen}/>}/>
                     <Route path="editPost/:id" element={<UpdatePost setPostOnPreview={setEditPostData} setIsEditPost={setIsEditPost} post={editPostData} setPost={setEditPostData} postID={postID} handleUpdate={handleUpdate} mainTheme={theme}/>}/>
      
                    <Route path="newPost" element={<Post post={post} setPost={setPost} mainTheme={theme} setIsEditPost={setIsEditPost} setIsAddPost={setIsAddPost}/>}/>

                    <Route path="categories" element={<Category copy={handleSubmit} setIsEditPost={setIsEditPost} setPostID={setPostID}/>}/>
                    <Route path="heros" element={<HeroPage heroSection={heroSection} theme={theme} openOffcavanas={openOffcavanas} updateHeroSection={(nextSection) => setHeroSection(_.cloneDeep(nextSection))} />} />
                    <Route path="menus" element={<MenuPage menuButtonRef={menuButtonRef} menus={menus} setMenus={setMenus} navBottom={navBottom} navOpen={navOpen} setNavOpen={setNavOpen} setOpenBar={setOffcanvas} device={device} menuBar={menuBarForCurrentDevice} topBar={topBar} theme={theme} setFont={setFont} darkMode={darkMode} darkTextColor={darkTextColor}/> } />


        
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
    width: offcanvas ? offcanvasWidth : 0,
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
             {offcanvas === "Hero" && (
              <HeroOffcanvas element={elementData} updateHero={elementFunction.current} close={openOffcavanas} textColor={darkTextColor}/>
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
              <TopBarOffcanvas open={offcanvas === "Top"} close={setOffcanvas} topBar={topBar} darkMode={darkMode} darkTextColor={darkTextColor} updateTopBar={updateTopBarForPreset} device={device}/>
             )}

{["Menu","Nav"].includes(offcanvas) && (
              <MenuBarOffcanvas  open={["Menu","Nav"].includes(offcanvas)} device={device} close={setOffcanvas} navBottom={navBottom} topBar={topBar} updateTopBar={updateTopBarForPreset} textColor={darkTextColor} menuBarDesktop={menuBarDesktop} menuBarMobile={menuBarForCurrentDevice} updateMenuBar={(data,isNav=false)=>editMenuBar(data,isNav)} darkMode={darkMode} darkTextColor={darkTextColor}/>
)}
</Suspense>
</aside>
)}
  
    
       
           
             


             </div>
        </div>
    )
}


export default Builder;