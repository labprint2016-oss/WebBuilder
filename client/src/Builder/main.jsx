import React, {
  Suspense,
  lazy,
  useEffect,
  useLayoutEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
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
import { getPage, editPage, listPages, createPage } from "../../Functions/pages";
import { getTheme, updateTheme } from "../../Functions/theme";
import { getMenuBar,updateMenuBar } from "../../Functions/menuBar";
import { getForms, updateForms } from "../../Functions/forms";
import {
  getDashbordSetting,
  updateDashbordSetting,
} from "../../Functions/dashbordSetting";
import _ from 'lodash';        // เปลี่ยนชื่อให้ชัด
import { Navigate, Route, Routes, useLocation } from "react-router-dom"

import HeroPage from "./hero";
import MenuPage from "./menu";
import FormsPage from "./forms";
import MessagesPage from "./messages";
import { invalidateFormsCache } from "./Layouts/Elements/FormBlock";
import SettingsPage from "./settings";
import Navbar from "./navbar";
import Header from "./header";
import {
  DASHBOARD_CHROME_PRESET,
  DEFAULT_DASHBOARD_CHROME,
  dashboardChromeToCssVars,
  getChromeAccent,
  loadDashboardChromeState,
  normalizeDashboardChrome,
  normalizeDashboardChromeState,
  resolveDashboardChrome,
  saveDashboardChromeState,
} from "./dashboardChrome";
const Content = lazy(() => import("./content"));
const PageSettingsPanel = lazy(() => import("./pageSettingsPanel"));

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
const FormBlockOffcanvas = lazy(() => import("./Offcanvas/formBlock"));
const ButtonGroupElementOffcanvas = lazy(
  () => import("./Offcanvas/buttonGroupElement")
);
const ListElementOffcanvas = lazy(() => import("./Offcanvas/listElement"));
const TabsElementOffcanvas = lazy(() => import("./Offcanvas/tabsElement"));
const AccordionElementOffcanvas = lazy(() => import("./Offcanvas/accordionElement"));
const FormElementOffcanvas = lazy(() => import("./Offcanvas/formElement"));
const TopBarOffcanvas = lazy(() => import("./Offcanvas/topBar"));
const FooterBarOffcanvas = lazy(() => import("./Offcanvas/footerBar"));
const MenuBarOffcanvas = lazy(() => import("./Offcanvas/menuBar"));
const HeroOffcanvas = lazy(() => import("./Offcanvas/hero"));
const FORM_ELEMENT_TYPE_SET = new Set([
  "frmInput",
  "frmText",
  "frmNum",
  "frmSum",
  "frmTextarea",
  "frmSelect",
  "frmRadio",
  "frmCheckbox",
  "frmSubmit",
]);
const PREVIEW_SNAPSHOT_KEY = "wb:preview:snapshot:v1";
const BUILDER_ACTIVE_PAGE_STORAGE_KEY = "wb:builder:active-page-id";

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
  const [railExpanded, setRailExpanded] = useState(() => {
    try {
      return localStorage.getItem("dash-nav-rail-expanded") === "1";
    } catch {
      return false;
    }
  });
  const toggleRailExpanded = useCallback(() => {
    setRailExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("dash-nav-rail-expanded", next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);




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

  const getLatestBuilderPageId = () => {
    if (typeof window === "undefined") return "";
    const savedPageId = localStorage.getItem(BUILDER_ACTIVE_PAGE_STORAGE_KEY);
    return savedPageId ? String(savedPageId) : "";
  };


    const [selectedMenuId,setSelectedMenuId] = useState(getLatestPage())
    const [builderMode, setBuilderMode] = useState("Layout Mode");
    const [element,setElement] = useState(null);
    const [darkMode,setDarkMode] = useState(getMode().mode);
    const [device,setDevice] = useState("Desktop")
    const [offcanvas, setOffcanvasState] = useState(null);
    const offcanvasAsideRef = useRef(null);
    const offcanvasRef = useRef(null);
    const offcanvasWriteGenRef = useRef(0);
    /** setOffcanvas ทุกครั้งนับ generation — ใช้กัน outside-click ปิดทับตอนเปิด panel อื่น */
    const setOffcanvas = useCallback((next) => {
      offcanvasWriteGenRef.current += 1;
      setOffcanvasState((prev) => {
        const value = typeof next === "function" ? next(prev) : next;
        offcanvasRef.current = value;
        return value;
      });
    }, []);
    const [isPageSettingsPanelOpen, setIsPageSettingsPanelOpen] = useState(false);
    const [elementData,setElementData] = useState(null)
    const [dashboardChromeState, setDashboardChromeState] = useState(() =>
      loadDashboardChromeState()
    );
    const [savedDashboardChromeState, setSavedDashboardChromeState] = useState(() =>
      loadDashboardChromeState()
    );
    const [isSavingDashboardChrome, setIsSavingDashboardChrome] = useState(false);
    const dashboardChrome = resolveDashboardChrome(dashboardChromeState);
    const isDashboardChromeDirty = !_.isEqual(
      normalizeDashboardChromeState(dashboardChromeState),
      normalizeDashboardChromeState(savedDashboardChromeState)
    );
    const [darkTextColor,setDarkTextColor] = useState(() => {
      const mode = getMode().mode;
      const state = loadDashboardChromeState();
      return getChromeAccent(state, mode) || getMode().color;
    })
    const darkModeRef = useRef(darkMode);
    darkModeRef.current = darkMode;
    const elementFunction = useRef(null)
    /** ชี้ไปที่ patchLayoutElement ล่าสุดจาก Content (แผงรูป / ปุ่ม — อัปเดต element ใน layout) */
    const patchElementRef = useRef(null)
    /** Content กำหนดฟังก์ชันเปิด Modal แก้ข้อความรายการ List Box — แผง List Box ใน aside เรียกผ่าน ref */
    const openListBoxTextEditRef = useRef(null)
    const [layouts,setLayout] = useState([])


    useEffect(()=>{
      localStorage.setItem("page",selectedMenuId)
    },[selectedMenuId])

    useEffect(() => {
      const path = location.pathname || "";
      // ซิงก์จาก URL → selectedMenuId เฉพาะตอน path เปลี่ยน
      // อย่าผูก selectedMenuId ใน deps — จะทับเมนูที่ไม่มี path เช่น Theme / Pages
      if (path === "/builder/menus") {
        setSelectedMenuId("Menu");
        return;
      }
      if (path === "/builder/heros") {
        setSelectedMenuId("Hero");
        return;
      }
      if (path === "/builder/forms") {
        setSelectedMenuId("Forms");
        return;
      }
      if (path === "/builder/messages") {
        setSelectedMenuId("Message");
        return;
      }
      if (path === "/builder/settings") {
        setSelectedMenuId("Settings");
        return;
      }
      if (path === "/builder" || path === "/builder/") {
        setSelectedMenuId((prev) =>
          ["Theme", "Pages", "Team", "Reports", "Apps", "Data", "Map"].includes(prev)
            ? prev
            : "Builder"
        );
        return;
      }
      if (["/builder/posts", "/builder/newPost", "/builder/editPost"].some((legacyPath) => path.startsWith(legacyPath))) {
        setSelectedMenuId("Builder");
      }
    }, [location.pathname]);
    
    const [page,setPage] = useState({});
    const [activeBuilderPageId, setActiveBuilderPageId] = useState("");
    const [defaultBuilderPageId, setDefaultBuilderPageId] = useState("");
    const activeBuilderPageIdRef = useRef(activeBuilderPageId);
    const pageDraftRef = useRef({ page: {}, layouts: [] });
    const [theme, setTheme] = useState({
      _id: null,
      textHeading: "",
      text: "",
      mainColor: [],
      textColor: [],
      otherColor: [],
    });
    const normalizePageLayouts = useCallback((rawLayouts) => {
      if (!Array.isArray(rawLayouts)) return [];
      return rawLayouts.filter((layout) => layout && typeof layout === "object");
    }, []);

    const applyBuilderPage = useCallback(
      (nextPage, defaultIdFromList = "") => {
        const normalizedPage =
          nextPage && typeof nextPage === "object" ? nextPage : {};
        const nextPageId = String(normalizedPage?._id || "");
        const normalizedLayouts = normalizePageLayouts(
          _.cloneDeep(normalizedPage?.layouts)
        );

        setPage(normalizedPage);
        setLayout(normalizedLayouts);
        setActiveBuilderPageId(nextPageId);
        activeBuilderPageIdRef.current = nextPageId;
        setDefaultBuilderPageId(
          String(
            defaultIdFromList ||
              (normalizedPage?.isDefault === true ? nextPageId : "")
          )
        );

        if (typeof window !== "undefined") {
          if (nextPageId) {
            localStorage.setItem(BUILDER_ACTIVE_PAGE_STORAGE_KEY, nextPageId);
          } else {
            localStorage.removeItem(BUILDER_ACTIVE_PAGE_STORAGE_KEY);
          }
        }
      },
      [normalizePageLayouts]
    );

    const loadBuilderPages = useCallback(
      async (options = {}) => {
        const preferredPageId = String(options?.preferredPageId || "");
        const preserveCurrentSelection = options?.preserveCurrentSelection !== false;
        const autoSelectPage = options?.autoSelectPage !== false;
        try {
          const pagesResponse = await listPages();
          let pagesList = Array.isArray(pagesResponse?.data)
            ? pagesResponse.data
            : [];

          if (pagesList.length === 0) {
            const bootstrapPageResponse = await createPage({ pageName: "Page 1" });
            if (bootstrapPageResponse?.data) {
              pagesList = [bootstrapPageResponse.data];
            }
          }

          if (pagesList.length === 0) {
            applyBuilderPage({}, "");
            return;
          }

          const defaultPage =
            pagesList.find((item) => item?.isDefault === true) || pagesList[0];
          const defaultPageId = String(defaultPage?._id || "");
          if (!autoSelectPage && !preferredPageId) {
            applyBuilderPage({}, defaultPageId);
            return;
          }
          const savedPageId = getLatestBuilderPageId();
          const currentActivePageId = preserveCurrentSelection
            ? String(activeBuilderPageIdRef.current || "")
            : "";

          const candidateIds = [
            preferredPageId,
            currentActivePageId,
            savedPageId,
            defaultPageId,
            String(pagesList[0]?._id || ""),
          ].filter(Boolean);

          const targetPageId =
            candidateIds.find((id) =>
              pagesList.some((pageItem) => String(pageItem?._id || "") === id)
            ) || String(pagesList[0]?._id || "");

          if (!targetPageId) {
            applyBuilderPage({}, defaultPageId);
            return;
          }

          const pageResponse = await getPage(targetPageId);
          applyBuilderPage(pageResponse?.data || {}, defaultPageId);
        } catch (err) {
          console.log(err);
        }
      },
      [applyBuilderPage]
    );

    const persistActiveBuilderPage = useCallback(async () => {
      const currentPage = pageDraftRef.current.page;
      if (!currentPage?._id) {
        return { ok: false, message: "ไม่พบหน้าที่กำลังแก้ไข" };
      }
      const payload = {
        pageName: currentPage?.pageName || "",
        layouts: _.cloneDeep(pageDraftRef.current.layouts || []),
        latestID:
          typeof currentPage?.latestID === "number" ? currentPage.latestID : 0,
        menuPresetId: currentPage?.menuPresetId || "",
        heroPresetId: currentPage?.heroPresetId || "",
        pagePopup: _.cloneDeep(
          currentPage?.pagePopup && typeof currentPage.pagePopup === "object"
            ? currentPage.pagePopup
            : {
                enabled: false,
                src: "",
                brightness: 0,
                borderRadius: 12,
                animationType: "fade-in",
                linkUrl: "",
                linkTarget: "_self",
              }
        ),
      };
      try {
        const response = await editPage(payload, currentPage._id);
        const updatedPage =
          response?.data && typeof response.data === "object"
            ? response.data
            : null;
        if (updatedPage) {
          setPage((prev) => ({ ...prev, ...updatedPage }));
        }
        return { ok: true, page: updatedPage || currentPage };
      } catch (err) {
        console.log(err);
        const responseMessage = err?.response?.data;
        const normalizedMessage =
          typeof responseMessage === "string" && responseMessage.trim()
            ? responseMessage.trim()
            : typeof err?.message === "string" && err.message.trim()
              ? err.message.trim()
              : "ไม่สำเร็จ.....กรุณาตรวจสอบอีกครั้ง";
        return { ok: false, message: normalizedMessage };
      }
    }, []);

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
      loadBuilderPages({
        autoSelectPage: false,
        preserveCurrentSelection: false,
      });
    }, [loadBuilderPages]); // ดึงข้อมูลหน้า
    useEffect(() => {
      loadTheme();
    }, []); // ดึงข้อมูลธีม

    useEffect(() => {
      activeBuilderPageIdRef.current = activeBuilderPageId;
    }, [activeBuilderPageId]);

    useEffect(() => {
      pageDraftRef.current = { page, layouts };
    }, [page, layouts]);

    const handleSelectBuilderPage = useCallback(
      async (nextPageId) => {
        const normalizedNextPageId = String(nextPageId || "");
        if (!normalizedNextPageId) return;
        if (normalizedNextPageId === activeBuilderPageIdRef.current) return;
        await persistActiveBuilderPage();
        await loadBuilderPages({
          preferredPageId: normalizedNextPageId,
          preserveCurrentSelection: false,
        });
      },
      [persistActiveBuilderPage, loadBuilderPages]
    );

    const handleBuilderPageCreated = useCallback(
      async (createdPage) => {
        const createdPageId = String(createdPage?._id || "");
        await persistActiveBuilderPage();
        await loadBuilderPages({
          preferredPageId: createdPageId,
          preserveCurrentSelection: false,
        });
      },
      [loadBuilderPages, persistActiveBuilderPage]
    );

    const handleBuilderPagesChanged = useCallback(
      async ({ preferredPageId } = {}) => {
        await persistActiveBuilderPage();
        await loadBuilderPages({
          preferredPageId: String(preferredPageId || ""),
          preserveCurrentSelection: true,
        });
      },
      [loadBuilderPages, persistActiveBuilderPage]
    );

    const handlePublishBuilder = useCallback(async () => {
      const result = await persistActiveBuilderPage();
      if (!result?.ok) return result;
      return { ok: true };
    }, [persistActiveBuilderPage]);
  


    /** ส่งต่อให้ setLayout ของ React — รองรับทั้งค่า array และ updater function (อย่าห่อด้วย prev=>newLayout เดิม จะทำให้ layouts กลายเป็น function แล้ว canvas หาย) */
    const updateLayout = setLayout;



    const openOffcavanas = (type,data,funct)=>{
      if (type) {
        setIsPageSettingsPanelOpen(false);
      }
      setOffcanvas(type)
      setElementData(data)
      elementFunction.current = funct;
    }
    const openPageSettingsPanel = useCallback(() => {
      if (!page?._id) return;
      setOffcanvas(null);
      setElementData(null);
      elementFunction.current = null;
      setIsPageSettingsPanelOpen(true);
    }, [page?._id]);

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
    const pickFormOffcanvasSync = (e) => ({
      id: e.id,
      type: e.type,
      label: e.label,
      labelIcon: e.labelIcon,
      formLayoutColumns: e.formLayoutColumns,
      formLabelFontSize: e.formLabelFontSize,
      formPlaceholderFontSize: e.formPlaceholderFontSize,
      formLabelColor: e.formLabelColor,
      formLabelColorOpacity: e.formLabelColorOpacity,
      formPlaceholderColor: e.formPlaceholderColor,
      formPlaceholderColorOpacity: e.formPlaceholderColorOpacity,
      formIconColor: e.formIconColor,
      formIconColorOpacity: e.formIconColorOpacity,
      formBackgroundColor: e.formBackgroundColor,
      formBackgroundColorOpacity: e.formBackgroundColorOpacity,
      formBorderColor: e.formBorderColor,
      formBorderColorOpacity: e.formBorderColorOpacity,
      formOptionColor: e.formOptionColor,
      formOptionColorOpacity: e.formOptionColorOpacity,
      formOptionTextColor: e.formOptionTextColor,
      formOptionTextColorOpacity: e.formOptionTextColorOpacity,
      formOptionValuesEnabled: e.formOptionValuesEnabled,
      optionValues: e.optionValues,
      calculationId: e.calculationId,
      calculationName: e.calculationName,
      calculationIds: e.calculationIds,
      calculationNames: e.calculationNames,
      placeholder: e.placeholder,
      formRequired: e.formRequired,
      formRequiredMessage: e.formRequiredMessage,
      formValidationType: e.formValidationType,
      formMinLength: e.formMinLength,
      formMaxLength: e.formMaxLength,
      formTextSpacingTop: e.formTextSpacingTop,
      formTextSpacingBottom: e.formTextSpacingBottom,
      formTextDivider: e.formTextDivider,
      formTextDividerStyle: e.formTextDividerStyle,
      formReadOnly: e.formReadOnly,
      rows: e.rows,
      options: e.options,
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
      if (offcanvas !== "Form" || !elementData?.id) return;
      const found = findLayoutElementById(layouts, elementData.id);
      if (!found || !FORM_ELEMENT_TYPE_SET.has(String(found.type || ""))) return;
      setElementData((prev) => {
        if (!prev || prev.id !== found.id) return prev;
        if (_.isEqual(pickFormOffcanvasSync(prev), pickFormOffcanvasSync(found))) {
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

    const pickFormBlockOffcanvasSync = (e) => ({
      id: e.id,
      type: e.type,
      formPresetId: e.formPresetId,
      formMarginX: e.formMarginX,
      formMarginY: e.formMarginY,
      formMarginTop: e.formMarginTop,
      formMarginBottom: e.formMarginBottom,
    });

    useEffect(() => {
      if (offcanvas !== "FormBlock" || !elementData?.id) return;
      const found = findLayoutElementById(layouts, elementData.id);
      if (!found || found.type !== "form") return;
      setElementData((prev) => {
        if (!prev || prev.id !== found.id) return prev;
        if (
          _.isEqual(
            pickFormBlockOffcanvasSync(prev),
            pickFormBlockOffcanvasSync(found)
          )
        ) {
          return prev;
        }
        return { ...found };
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
    const FORM_DRAG_ITEM_TO_TYPE = {
      "Form Input": "input",
      Input: "input",
      // อย่า map "Text" — จะทับ Element Text พื้นฐาน; ใช้เฉพาะ Form Text
      "Form Text": "text",
      Num: "num",
      Sum: "sum",
      "Form Textarea": "textarea",
      Textarea: "textarea",
      "Form Select": "select",
      Select: "select",
      "Form Radio": "radio",
      Radio: "radio",
      "Form Checkbox": "checkbox",
      Checkbox: "checkbox",
      "Form Submit": "submit",
      Submit: "submit",
    };
    const buildFormDraftElement = (formType) => {
      if (!formType) return null;
      const base = {
        formRequired: false,
        formRequiredMessage: "กรุณากรอกข้อมูลนี้",
        formLabelColor: { type: "textColor", index: 0 },
        formLabelColorOpacity: 255,
        formPlaceholderColor: "#94a3b8",
        formPlaceholderColorOpacity: 255,
        formIconColor: "#94a3b8",
        formIconColorOpacity: 255,
        formBackgroundColor: "#ffffff",
        formBackgroundColorOpacity: 230,
        formBorderColor: "#94a3b8",
        formBorderColorOpacity: 140,
      };
      if (formType === "input") {
        return {
          ...base,
          id: "FrmInput-",
          type: "frmInput",
          label: "Input Label",
          labelIcon: { name: null, type: null },
          formLayoutColumns: 1,
          formLabelFontSize: 12,
          formPlaceholderFontSize: 12,
          placeholder: "Type your message...",
          formValidationType: "none",
          formMinLength: 3,
          formMaxLength: 255,
          preview: { label: "Input", icon: "text_fields" },
        };
      }
      if (formType === "text") {
        return {
          ...base,
          id: "FrmText-",
          type: "frmText",
          label: "ข้อความ",
          formLayoutColumns: 1,
          formLabelFontSize: 14,
          formTextSpacingTop: 0,
          formTextSpacingBottom: 0,
          formTextDivider: false,
          formTextDividerStyle: "solid",
          preview: { label: "Text", icon: "format_size" },
        };
      }
      if (formType === "num") {
        return {
          ...base,
          id: "FrmNum-",
          type: "frmNum",
          label: "Num",
          labelIcon: { name: null, type: null },
          formLayoutColumns: 1,
          formLabelFontSize: 12,
          formPlaceholderFontSize: 12,
          placeholder: "0",
          formRequired: true,
          formValidationType: "number",
          calculationId: "",
          calculationName: "",
          preview: { label: "Num", icon: "pin" },
        };
      }
      if (formType === "sum") {
        return {
          ...base,
          id: "FrmSum-",
          type: "frmSum",
          label: "Sum",
          labelIcon: { name: null, type: null },
          formLayoutColumns: 1,
          formLabelFontSize: 12,
          formPlaceholderFontSize: 12,
          placeholder: "Unit",
          formReadOnly: true,
          calculationId: "",
          calculationName: "",
          calculationIds: [],
          calculationNames: [],
          preview: { label: "Sum", icon: "functions" },
        };
      }
      if (formType === "textarea") {
        return {
          ...base,
          id: "FrmTextarea-",
          type: "frmTextarea",
          label: "Textarea Label",
          formLayoutColumns: 1,
          formLabelFontSize: 12,
          formPlaceholderFontSize: 12,
          placeholder: "Type your message...",
          rows: 4,
          formValidationType: "none",
          formMinLength: 3,
          formMaxLength: 1000,
          preview: { label: "Textarea", icon: "subject" },
        };
      }
      if (formType === "select") {
        return {
          ...base,
          id: "FrmSelect-",
          type: "frmSelect",
          label: "Select Label",
          formLayoutColumns: 1,
          formLabelFontSize: 12,
          formPlaceholderFontSize: 12,
          formBackgroundColorOpacity: 255,
          formOptionColor: { type: "mainColor", index: 0 },
          formOptionColorOpacity: 255,
          formOptionTextColor: { type: "textColor", index: 0 },
          formOptionTextColorOpacity: 255,
          formOptionHoverColor: { type: "mainColor", index: 0 },
          formOptionHoverColorOpacity: 40,
          formOptionActiveColor: { type: "mainColor", index: 0 },
          formOptionActiveColorOpacity: 56,
          placeholder: "Select an option",
          options: ["Option 1", "Option 2", "Option 3"],
          optionValues: [0, 0, 0],
          formOptionValuesEnabled: false,
          formRequired: true,
          preview: { label: "Select", icon: "arrow_drop_down_circle" },
        };
      }
      if (formType === "radio") {
        return {
          ...base,
          id: "FrmRadio-",
          type: "frmRadio",
          label: "Radio Label",
          formLayoutColumns: 1,
          formLabelFontSize: 12,
          formOptionColor: { type: "mainColor", index: 0 },
          formOptionColorOpacity: 255,
          formOptionTextColor: { type: "textColor", index: 0 },
          formOptionTextColorOpacity: 255,
          options: ["Option 1", "Option 2"],
          preview: { label: "Radio", icon: "radio_button_checked" },
        };
      }
      if (formType === "checkbox") {
        return {
          ...base,
          id: "FrmCheckbox-",
          type: "frmCheckbox",
          label: "Checkbox Label",
          formLayoutColumns: 1,
          formLabelFontSize: 12,
          formOptionTextColor: { type: "textColor", index: 0 },
          formOptionTextColorOpacity: 255,
          options: ["Option 1", "Option 2"],
          preview: { label: "Checkbox", icon: "check_box" },
        };
      }
      if (formType === "submit") {
        return {
          ...base,
          id: "FrmSubmit-",
          type: "frmSubmit",
          label: "Submit",
          labelIcon: { name: null, type: null },
          formLayoutColumns: 1,
          formLabelFontSize: 13,
          formLabelColor: "#ffffff",
          formLabelColorOpacity: 255,
          formBackgroundColor: { type: "mainColor", index: 1 },
          formBackgroundColorOpacity: 255,
          formBorderColor: "#ffffff",
          formBorderColorOpacity: 255,
          preview: { label: "Submit", icon: "send" },
        };
      }
      return null;
    };

    const handleDragElement = (newElement)=>{
    if (!newElement || typeof newElement !== "string") {
      setElement(null);
      return;
    }
    const localFormType = FORM_DRAG_ITEM_TO_TYPE[newElement];
    if (localFormType) {
      setElement(buildFormDraftElement(localFormType));
      return;
    }
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
    const mode = darkMode === "dark" ? "light" : "dark";
    const color = getChromeAccent(dashboardChrome, mode);

    localStorage.setItem("darkMode",mode);
    localStorage.setItem("darkTextColor",color)
    setDarkMode(mode)
    setDarkTextColor(color)
    
   }

   // แก้สี = พรีวิวทันที — ยังไม่ยิง API จนกว่าจะกดบันทึก
   const applyDashboardChromeState = (nextState) => {
     const normalized = normalizeDashboardChromeState(nextState);
     setDashboardChromeState(normalized);
     const accent = getChromeAccent(normalized, darkMode);
     setDarkTextColor(accent);
     localStorage.setItem("darkTextColor", accent);
   };

   const handleSaveDashboardChrome = async () => {
     const normalized = normalizeDashboardChromeState(dashboardChromeState);
     setIsSavingDashboardChrome(true);
     try {
       await updateDashbordSetting(normalized);
       saveDashboardChromeState(normalized);
       setSavedDashboardChromeState(normalized);
       return true;
     } catch (err) {
       console.log("updateDashbordSetting failed", err);
       return false;
     } finally {
       setIsSavingDashboardChrome(false);
     }
   };

   // โหลดสี Dashboard จาก collection DashbordSetting
   useEffect(() => {
     let cancelled = false;
     (async () => {
       try {
         const res = await getDashbordSetting();
         if (cancelled) return;
         const remote = res?.data?.setting;
         const hasRemote =
           remote &&
           typeof remote === "object" &&
           (remote.preset != null ||
             remote.custom != null ||
             remote.default != null ||
             remote.light != null ||
             remote.dark != null);
         const normalized = hasRemote
           ? normalizeDashboardChromeState(remote)
           : loadDashboardChromeState();
         setDashboardChromeState(normalized);
         setSavedDashboardChromeState(normalized);
         saveDashboardChromeState(normalized);
         const accent = getChromeAccent(normalized, darkModeRef.current);
         setDarkTextColor(accent);
         localStorage.setItem("darkTextColor", accent);
       } catch (err) {
         console.log("getDashbordSetting failed", err);
       }
     })();
     return () => {
       cancelled = true;
     };
   }, []);

   const handleChangeDashboardChrome = (nextActiveChrome) => {
     const normalized = normalizeDashboardChromeState(dashboardChromeState);
     const nextPalette = normalizeDashboardChrome(nextActiveChrome);
     // แก้ชุดของ preset ที่เลือกอยู่ — ไม่บังคับสลับไป Custom
     if (normalized.preset === DASHBOARD_CHROME_PRESET.CUSTOM) {
       applyDashboardChromeState({
         ...normalized,
         custom: nextPalette,
       });
       return;
     }
     applyDashboardChromeState({
       ...normalized,
       default: nextPalette,
     });
   };

   const handleChangeDashboardChromePreset = (preset) => {
     applyDashboardChromeState({
       ...dashboardChromeState,
       preset:
         preset === DASHBOARD_CHROME_PRESET.CUSTOM
           ? DASHBOARD_CHROME_PRESET.CUSTOM
           : DASHBOARD_CHROME_PRESET.DEFAULT,
     });
   };

   const handleResetDashboardChrome = (mode) => {
     const targetMode = mode === "dark" ? "dark" : "light";
     const normalized = normalizeDashboardChromeState(dashboardChromeState);
     const factoryMode = { ...DEFAULT_DASHBOARD_CHROME[targetMode] };
     if (normalized.preset === DASHBOARD_CHROME_PRESET.CUSTOM) {
       applyDashboardChromeState({
         ...normalized,
         custom: {
           ...normalizeDashboardChrome(normalized.custom),
           [targetMode]: factoryMode,
         },
       });
       return;
     }
     applyDashboardChromeState({
       ...normalized,
       default: {
         ...normalizeDashboardChrome(normalized.default),
         [targetMode]: factoryMode,
       },
     });
   };

   const dashboardChromeCssVars = dashboardChromeToCssVars(
     dashboardChrome[darkMode === "dark" ? "dark" : "light"]
   );


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
  footerBar: null,
});
const clonePresetVisualConfig = (source = {}) => ({
  menuBarDesktop: _.cloneDeep(source?.menuBarDesktop),
  menuBarMobile: _.cloneDeep(source?.menuBarMobile),
  menuBarMobilePhone: _.cloneDeep(source?.menuBarMobilePhone ?? null),
  navBottomMobile: _.cloneDeep(source?.navBottomMobile),
  navBottomTablet: _.cloneDeep(source?.navBottomTablet),
  topBar: _.cloneDeep(source?.topBar),
  footerBar: _.cloneDeep(source?.footerBar),
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
  footerBar: _.cloneDeep(preset?.footerBar ?? fallback?.footerBar),
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
const [isMenuPresetHydrated, setIsMenuPresetHydrated] = useState(false);
const didInitMenuBarLoadRef = useRef(false);
const latestMenuBarStateRef = useRef(null);
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
const [heroResetTokenFromHeader, setHeroResetTokenFromHeader] = useState(0);
const [heroMutationEventFromHeader, setHeroMutationEventFromHeader] = useState(null);
const processedHeroMutationEventIdRef = useRef(null);
const previousHeroPresetIdForSectionSyncRef = useRef(null);

const FORMS_MENU_BAR_ID = "69db17211be82fe7637ea096";
const createDefaultFormRows = () => [
  {
    id: `row-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
    label: "แถว 1",
    grid: 1,
    columns: [[]],
  },
];
const getDefaultFormPresetState = () => {
  const defaultRows = createDefaultFormRows();
  return {
    formPresets: [
      {
        id: "form-preset-1",
        name: "Form 1",
        gridRows: defaultRows,
        selectedRowId: defaultRows[0]?.id ?? null,
        gridPreset: 1,
        conditionalChains: [],
        calculations: [],
      },
    ],
    activeFormPresetId: "form-preset-1",
    defaultFormPresetId: "form-preset-1",
  };
};
const initialFormPresetStateRef = useRef(null);
if (initialFormPresetStateRef.current == null) {
  initialFormPresetStateRef.current = getDefaultFormPresetState();
}
const initialFormPresetState = initialFormPresetStateRef.current;
const [formPresets, setFormPresets] = useState(initialFormPresetState.formPresets);
const [activeFormPresetId, setActiveFormPresetId] = useState(
  initialFormPresetState.activeFormPresetId
);
const [defaultFormPresetId, setDefaultFormPresetId] = useState(
  initialFormPresetState.defaultFormPresetId
);
const [isFormsHydrated, setIsFormsHydrated] = useState(false);
const [formsBaseline, setFormsBaseline] = useState(null);
const [formsPanelDraftDirty, setFormsPanelDraftDirty] = useState(false);
const formPresetsRef = useRef(formPresets);
const activeFormPresetIdRef = useRef(activeFormPresetId);
const formsDraftFlushRef = useRef(null);
useEffect(() => {
  formPresetsRef.current = formPresets;
}, [formPresets]);
useEffect(() => {
  activeFormPresetIdRef.current = activeFormPresetId;
}, [activeFormPresetId]);
const captureFormsBaseline = useCallback((presets, activeId, defaultId) => {
  setFormsBaseline({
    formPresets: _.cloneDeep(Array.isArray(presets) ? presets : []),
    activeFormPresetId: activeId ?? null,
    defaultFormPresetId: defaultId ?? null,
  });
  setFormsPanelDraftDirty(false);
}, []);
const isFormsStateDirty = useMemo(() => {
  if (!isFormsHydrated || !formsBaseline) return false;
  return !_.isEqual(
    {
      formPresets,
      activeFormPresetId,
      defaultFormPresetId,
    },
    formsBaseline
  );
}, [
  isFormsHydrated,
  formsBaseline,
  formPresets,
  activeFormPresetId,
  defaultFormPresetId,
]);
const isFormsDirty = isFormsStateDirty || formsPanelDraftDirty;
const processedFormMutationEventIdRef = useRef(null);
const [formMutationEventFromHeader, setFormMutationEventFromHeader] = useState(null);

const normalizeFormPreset = (preset, index = 0) => {
  const safeId = String(preset?.id || `form-preset-${index + 1}`);
  const safeName = String(preset?.name || `Form ${index + 1}`).trim() || `Form ${index + 1}`;
  const safeGridRows = Array.isArray(preset?.gridRows) ? _.cloneDeep(preset.gridRows) : [];
  const safeSelectedRowId =
    typeof preset?.selectedRowId === "string" && preset.selectedRowId.trim()
      ? preset.selectedRowId
      : safeGridRows[0]?.id ?? null;
  const safeGridPreset = Number.isFinite(Number(preset?.gridPreset))
    ? Math.max(1, Math.round(Number(preset.gridPreset)))
    : 1;
  const safeConditionalChains = Array.isArray(preset?.conditionalChains)
    ? _.cloneDeep(preset.conditionalChains)
    : [];
  const safeCalculations = Array.isArray(preset?.calculations)
    ? _.cloneDeep(preset.calculations)
    : [];
  return {
    id: safeId,
    name: safeName,
    gridRows: safeGridRows,
    selectedRowId: safeSelectedRowId,
    gridPreset: safeGridPreset,
    conditionalChains: safeConditionalChains,
    calculations: safeCalculations,
  };
};

const handleFormStateChange = useCallback(
  ({
    formPresets: nextFormPresets,
    activeFormPresetId: nextActiveFormPresetId,
    defaultFormPresetId: nextDefaultFormPresetId,
    formMutationEvent,
  }) => {
    if (Array.isArray(nextFormPresets)) {
      setFormPresets((prev) => {
        const prevMap = Object.fromEntries(
          (Array.isArray(prev) ? prev : []).map((item) => [item.id, item])
        );
        const merged = nextFormPresets.map((item, index) => {
          const prevItem = prevMap[item?.id];
          return normalizeFormPreset(
            {
              id: item?.id,
              name: item?.name,
              gridRows: prevItem?.gridRows,
              selectedRowId: prevItem?.selectedRowId,
              gridPreset: prevItem?.gridPreset,
              conditionalChains: prevItem?.conditionalChains,
              calculations: prevItem?.calculations,
            },
            index
          );
        });
        return _.isEqual(prev, merged) ? prev : merged;
      });
    }
    if (typeof nextActiveFormPresetId === "string") {
      setActiveFormPresetId((prev) =>
        prev === nextActiveFormPresetId ? prev : nextActiveFormPresetId
      );
    }
    if (typeof nextDefaultFormPresetId === "string") {
      setDefaultFormPresetId((prev) =>
        prev === nextDefaultFormPresetId ? prev : nextDefaultFormPresetId
      );
    }
    if (
      formMutationEvent &&
      typeof formMutationEvent === "object" &&
      typeof formMutationEvent.id === "number" &&
      Number.isFinite(formMutationEvent.id)
    ) {
      setFormMutationEventFromHeader((prev) =>
        prev?.id === formMutationEvent.id ? prev : formMutationEvent
      );
    }
  },
  []
);

useEffect(() => {
  if (!formMutationEventFromHeader || typeof formMutationEventFromHeader !== "object") {
    return;
  }
  if (
    processedFormMutationEventIdRef.current != null &&
    processedFormMutationEventIdRef.current === formMutationEventFromHeader.id
  ) {
    return;
  }
  processedFormMutationEventIdRef.current = formMutationEventFromHeader.id;
  const type = String(formMutationEventFromHeader.type || "");
  const newFormId = String(formMutationEventFromHeader.newFormId || "");
  const sourceFormId = String(formMutationEventFromHeader.sourceFormId || "");
  if (!type || !newFormId) return;

  setFormPresets((prev) => {
    const list = Array.isArray(prev) ? prev : [];
    if (type === "create") {
      return list.map((preset) => {
        if (preset.id !== newFormId) return preset;
        if (Array.isArray(preset.gridRows) && preset.gridRows.length > 0) return preset;
        const rows = createDefaultFormRows();
        return {
          ...preset,
          gridRows: rows,
          selectedRowId: rows[0]?.id ?? null,
        };
      });
    }
    if (type === "duplicate") {
      const source =
        list.find((preset) => preset.id === sourceFormId) ||
        list.find((preset) => preset.id === activeFormPresetId);
      const clonedRows = Array.isArray(source?.gridRows)
        ? _.cloneDeep(source.gridRows)
        : createDefaultFormRows();
      return list.map((preset) => {
        if (preset.id !== newFormId) return preset;
        return {
          ...preset,
          gridRows: clonedRows,
          selectedRowId: clonedRows[0]?.id ?? null,
          gridPreset: source?.gridPreset ?? 1,
          conditionalChains: Array.isArray(source?.conditionalChains)
            ? _.cloneDeep(source.conditionalChains)
            : [],
          calculations: Array.isArray(source?.calculations)
            ? _.cloneDeep(source.calculations)
            : [],
        };
      });
    }
    return list;
  });
}, [formMutationEventFromHeader, activeFormPresetId]);

const activeFormPreset = useMemo(
  () =>
    formPresets.find((preset) => preset.id === activeFormPresetId) ||
    formPresets[0] ||
    null,
  [formPresets, activeFormPresetId]
);

const handleActiveFormRowsChange = useCallback(
  (nextRows) => {
    const safeRows = Array.isArray(nextRows) ? nextRows : [];
    setFormPresets((prev) =>
      prev.map((preset) => {
        if (preset.id !== activeFormPresetId) return preset;
        const nextSelected =
          typeof preset.selectedRowId === "string" &&
          safeRows.some((row) => row?.id === preset.selectedRowId)
            ? preset.selectedRowId
            : safeRows[0]?.id ?? null;
        return {
          ...preset,
          gridRows: safeRows,
          selectedRowId: nextSelected,
        };
      })
    );
  },
  [activeFormPresetId]
);

const handleActiveFormSelectedRowChange = useCallback(
  (nextRowId) => {
    setFormPresets((prev) =>
      prev.map((preset) =>
        preset.id === activeFormPresetId
          ? { ...preset, selectedRowId: nextRowId ?? null }
          : preset
      )
    );
  },
  [activeFormPresetId]
);

const handleActiveFormConditionalChainsChange = useCallback(
  (nextChains) => {
    const safeChains = Array.isArray(nextChains) ? nextChains : [];
    const activeId = activeFormPresetIdRef.current;
    setFormPresets((prev) => {
      const next = prev.map((preset) =>
        preset.id === activeId
          ? { ...preset, conditionalChains: safeChains }
          : preset
      );
      formPresetsRef.current = next;
      return next;
    });
  },
  []
);

const handleActiveFormCalculationsChange = useCallback(
  (nextCalculations) => {
    const safeCalculations = Array.isArray(nextCalculations)
      ? nextCalculations
      : [];
    const activeId = activeFormPresetIdRef.current;
    setFormPresets((prev) => {
      const next = prev.map((preset) =>
        preset.id === activeId
          ? { ...preset, calculations: safeCalculations }
          : preset
      );
      formPresetsRef.current = next;
      return next;
    });
  },
  []
);

const loadForms = useCallback(() => {
  setIsFormsHydrated(false);
  return getForms(FORMS_MENU_BAR_ID)
    .then((res) => {
      const data = res?.data || {};
      const serverPresets = Array.isArray(data.formPresets) ? data.formPresets : [];
      const normalized =
        serverPresets.length > 0
          ? serverPresets.map((preset, index) => normalizeFormPreset(preset, index))
          : getDefaultFormPresetState().formPresets;
      const nextActive = normalized.some((preset) => preset.id === data.activeFormPresetId)
        ? data.activeFormPresetId
        : normalized[0].id;
      const nextDefault = normalized.some((preset) => preset.id === data.defaultFormPresetId)
        ? data.defaultFormPresetId
        : nextActive;
      setFormPresets(normalized);
      setActiveFormPresetId(nextActive);
      setDefaultFormPresetId(nextDefault);
      formPresetsRef.current = normalized;
      activeFormPresetIdRef.current = nextActive;
      captureFormsBaseline(normalized, nextActive, nextDefault);
      setIsFormsHydrated(true);
      return { ok: true };
    })
    .catch((error) => {
      console.error("Load forms failed:", error);
      const fallback = getDefaultFormPresetState();
      setFormPresets(fallback.formPresets);
      setActiveFormPresetId(fallback.activeFormPresetId);
      setDefaultFormPresetId(fallback.defaultFormPresetId);
      formPresetsRef.current = fallback.formPresets;
      activeFormPresetIdRef.current = fallback.activeFormPresetId;
      captureFormsBaseline(
        fallback.formPresets,
        fallback.activeFormPresetId,
        fallback.defaultFormPresetId
      );
      setIsFormsHydrated(true);
      return { ok: false };
    });
}, [captureFormsBaseline]);

const submitForms = useCallback(
  (overrides = {}) => {
    // ดึง draft จาก panel Conditional / การคำนวณ ที่ยังไม่กดบันทึกใน panel
    try {
      const flushResult = formsDraftFlushRef.current?.();
      if (flushResult?.block) {
        return {
          ok: false,
          message:
            typeof flushResult.message === "string" && flushResult.message.trim()
              ? flushResult.message.trim()
              : "กรุณาตั้งชื่อการคำนวณ",
        };
      }
    } catch (error) {
      console.error("Flush form panel drafts failed:", error);
    }
    let workingPresets = Array.isArray(formPresetsRef.current)
      ? [...formPresetsRef.current]
      : [];
    let nextActiveFormPresetId =
      typeof overrides.activeFormPresetId === "string" && overrides.activeFormPresetId.trim()
        ? overrides.activeFormPresetId
        : activeFormPresetIdRef.current;
    let nextDefaultFormPresetId =
      typeof overrides.defaultFormPresetId === "string" && overrides.defaultFormPresetId.trim()
        ? overrides.defaultFormPresetId
        : defaultFormPresetId;

    const renameId =
      typeof overrides.renameFormPreset?.id === "string"
        ? overrides.renameFormPreset.id
        : "";
    const renameName =
      typeof overrides.renameFormPreset?.name === "string"
        ? overrides.renameFormPreset.name.trim()
        : "";
    if (renameId && renameName) {
      workingPresets = workingPresets.map((preset) =>
        preset.id === renameId ? { ...preset, name: renameName } : preset
      );
    }

    const duplicate = overrides.duplicateFormPreset;
    if (
      duplicate &&
      typeof duplicate === "object" &&
      typeof duplicate.sourceFormId === "string" &&
      typeof duplicate.newFormId === "string" &&
      typeof duplicate.name === "string" &&
      !workingPresets.some((preset) => preset.id === duplicate.newFormId)
    ) {
      const sourceIdx = workingPresets.findIndex(
        (preset) => preset.id === duplicate.sourceFormId
      );
      const source =
        (sourceIdx >= 0 ? workingPresets[sourceIdx] : null) ||
        workingPresets.find((preset) => preset.id === activeFormPresetId) ||
        workingPresets[0] ||
        null;
      const clonedRows = Array.isArray(source?.gridRows)
        ? _.cloneDeep(source.gridRows)
        : createDefaultFormRows();
      const duplicatedPreset = normalizeFormPreset(
        {
          id: duplicate.newFormId,
          name: String(duplicate.name).trim() || "Form",
          gridRows: clonedRows,
          selectedRowId: clonedRows[0]?.id ?? null,
          gridPreset: source?.gridPreset ?? 1,
          conditionalChains: Array.isArray(source?.conditionalChains)
            ? _.cloneDeep(source.conditionalChains)
            : [],
          calculations: Array.isArray(source?.calculations)
            ? _.cloneDeep(source.calculations)
            : [],
        },
        Math.max(0, sourceIdx) + 1
      );
      if (sourceIdx >= 0) {
        workingPresets.splice(sourceIdx + 1, 0, duplicatedPreset);
      } else {
        workingPresets.push(duplicatedPreset);
      }
    }

    const deleteFormPresetId =
      typeof overrides.deleteFormPresetId === "string"
        ? overrides.deleteFormPresetId.trim()
        : "";
    if (deleteFormPresetId) {
      workingPresets = workingPresets.filter(
        (preset) => preset.id !== deleteFormPresetId
      );
      if (workingPresets.length === 0) {
        workingPresets = getDefaultFormPresetState().formPresets;
      }
      if (!workingPresets.some((preset) => preset.id === nextActiveFormPresetId)) {
        nextActiveFormPresetId = workingPresets[0].id;
      }
      if (!workingPresets.some((preset) => preset.id === nextDefaultFormPresetId)) {
        nextDefaultFormPresetId = workingPresets[0].id;
      }
    }

    const nextFormPresets = workingPresets.map((preset, index) =>
      normalizeFormPreset(preset, index)
    );
    setFormPresets(nextFormPresets);
    setActiveFormPresetId(nextActiveFormPresetId);
    setDefaultFormPresetId(nextDefaultFormPresetId);

    const payload = {
      formPresets: nextFormPresets,
      activeFormPresetId: nextActiveFormPresetId,
      defaultFormPresetId: nextDefaultFormPresetId,
    };
    return updateForms(FORMS_MENU_BAR_ID, payload)
      .then(() => {
        invalidateFormsCache();
        formPresetsRef.current = nextFormPresets;
        activeFormPresetIdRef.current = nextActiveFormPresetId;
        captureFormsBaseline(
          nextFormPresets,
          nextActiveFormPresetId,
          nextDefaultFormPresetId
        );
        return { ok: true };
      })
      .catch((error) => {
        const responseData = error?.response?.data;
        const message =
          typeof responseData === "string" && responseData.trim()
            ? responseData.trim()
            : typeof responseData?.message === "string" && responseData.message.trim()
              ? responseData.message.trim()
              : "ไม่สำเร็จ.....กรุณาตรวจสอบอีกครั้ง";
        return {
          ok: false,
          message,
          details: responseData ?? error?.message ?? null,
        };
      });
  },
  [defaultFormPresetId, captureFormsBaseline]
);

useEffect(() => {
  loadForms();
}, [loadForms]);
const handleHeroStateChange = useCallback(
  ({
    heroPresets: nextHeroPresets,
    activeHeroPresetId: nextActiveHeroPresetId,
    defaultHeroPresetId: nextDefaultHeroPresetId,
    resetHeroSectionToken,
    heroMutationEvent,
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
    if (
      typeof resetHeroSectionToken === "number" &&
      Number.isFinite(resetHeroSectionToken)
    ) {
      setHeroResetTokenFromHeader((prev) =>
        prev === resetHeroSectionToken ? prev : resetHeroSectionToken
      );
    }
    if (
      heroMutationEvent &&
      typeof heroMutationEvent === "object" &&
      typeof heroMutationEvent.id === "number" &&
      Number.isFinite(heroMutationEvent.id)
    ) {
      setHeroMutationEventFromHeader((prev) =>
        prev?.id === heroMutationEvent.id ? prev : heroMutationEvent
      );
    }
  },
  []
);
const normalizePresetName = (name) => String(name || "").trim().toLowerCase();
const HERO_RESPONSIVE_DEVICE_SET = new Set(["Tablet", "Mobile"]);
const stripHeroDeviceSections = (section) => {
  if (!section || typeof section !== "object") return {};
  const nextSection = { ...section };
  delete nextSection.deviceSections;
  return nextSection;
};
const resolveHeroSectionByDevice = (section, device) => {
  const baseSection = stripHeroDeviceSections(section);
  if (!HERO_RESPONSIVE_DEVICE_SET.has(device)) return baseSection;
  const overrideRaw = section?.deviceSections?.[device];
  if (!overrideRaw || typeof overrideRaw !== "object") return baseSection;
  return {
    ...baseSection,
    ...stripHeroDeviceSections(overrideRaw),
  };
};
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
  imageBrightness: 100,
  opacityColor: 255,
  opacityColorGradient: [255, 255],
  backgroundImage: "",
  backgroundVideo: "",
  backgroundPositionX: 50,
  backgroundPositionY: 50,
  backgroundZoom: 100,
  backgroundFrameOnly: false,
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
  svgDividerEnabled: false,
  svgDividerType: "wave",
  svgDividerHeight: 64,
  svgDividerDensity: 1,
  svgDividerSize: 1,
  svgDividerColor: "#ffffff",
  columnDividerStyle: "dashed",
  columnDividerColor: "#d8d8d8",
  columnDividerOpacity: 255,
  columnDividerVerticalLengthPercent: 95,
  deviceSections: {
    Tablet: null,
    Mobile: null,
  },
  _sectionIndex: 0,
  _isSplitSection: false,
});
const normalizeHeroSection = (section) => ({
  ...createDefaultHeroSection(),
  ...(section || {}),
  id: String(section?.id || "HeroSec-1"),
  _sectionIndex: 0,
  _isSplitSection: false,
});
const applyHeroSectionUpdateByDevice = (previousSection, nextSection, targetDevice) => {
  const sanitizedNextSection = stripHeroDeviceSections(nextSection);
  const previousDeviceSections =
    previousSection?.deviceSections && typeof previousSection.deviceSections === "object"
      ? { ...previousSection.deviceSections }
      : {};
  if (!HERO_RESPONSIVE_DEVICE_SET.has(targetDevice)) {
    return {
      ...sanitizedNextSection,
      ...(Object.keys(previousDeviceSections).length > 0
        ? { deviceSections: previousDeviceSections }
        : {}),
    };
  }
  const rootSection = stripHeroDeviceSections(previousSection);
  return {
    ...rootSection,
    deviceSections: {
      ...previousDeviceSections,
      [targetDevice]: sanitizedNextSection,
    },
  };
};
const [heroSection, setHeroSection] = useState(createDefaultHeroSection);
const [heroSectionsByPreset, setHeroSectionsByPreset] = useState({});
useEffect(() => {
  if (!heroResetTokenFromHeader) return;
  setHeroSection(normalizeHeroSection(createDefaultHeroSection()));
}, [heroResetTokenFromHeader]);
useEffect(() => {
  if (!activeHeroPresetId) return;
  const hasActiveSection =
    heroSectionsByPreset &&
    typeof heroSectionsByPreset === "object" &&
    heroSectionsByPreset[activeHeroPresetId];
  if (hasActiveSection) return;
  setHeroSectionsByPreset((prev) => {
    const prevMap = prev && typeof prev === "object" ? prev : {};
    if (prevMap[activeHeroPresetId]) return prevMap;
    return {
      ...prevMap,
      [activeHeroPresetId]: normalizeHeroSection(heroSection || createDefaultHeroSection()),
    };
  });
}, [activeHeroPresetId, heroSectionsByPreset, heroSection]);
useEffect(() => {
  if (!heroMutationEventFromHeader || typeof heroMutationEventFromHeader !== "object") return;
  if (
    processedHeroMutationEventIdRef.current != null &&
    processedHeroMutationEventIdRef.current === heroMutationEventFromHeader.id
  ) {
    return;
  }
  processedHeroMutationEventIdRef.current = heroMutationEventFromHeader.id;
  const type = String(heroMutationEventFromHeader.type || "");
  const newHeroId = String(heroMutationEventFromHeader.newHeroId || "");
  const sourceHeroId = String(heroMutationEventFromHeader.sourceHeroId || "");
  if (!type || !newHeroId) return;
  setHeroSectionsByPreset((prev) => {
    const prevMap = prev && typeof prev === "object" ? prev : {};
    const nextMap = { ...prevMap };
    if (type === "duplicate") {
      const sourceSection =
        prevMap[sourceHeroId] ||
        (sourceHeroId === activeHeroPresetId ? heroSection : null) ||
        createDefaultHeroSection();
      nextMap[newHeroId] = normalizeHeroSection(_.cloneDeep(sourceSection));
      return nextMap;
    }
    if (type === "create") {
      nextMap[newHeroId] = normalizeHeroSection(createDefaultHeroSection());
      return nextMap;
    }
    return prevMap;
  });
}, [heroMutationEventFromHeader, activeHeroPresetId, heroSection]);
useEffect(() => {
  if (!activeHeroPresetId) return;
  if (previousHeroPresetIdForSectionSyncRef.current === activeHeroPresetId) return;
  previousHeroPresetIdForSectionSyncRef.current = activeHeroPresetId;
  const nextSection = heroSectionsByPreset?.[activeHeroPresetId];
  if (!nextSection) return;
  setHeroSection((prev) =>
    _.isEqual(prev, nextSection) ? prev : _.cloneDeep(nextSection)
  );
}, [activeHeroPresetId, heroSectionsByPreset]);
useEffect(() => {
  if (!activeHeroPresetId) return;
  setHeroSectionsByPreset((prev) => {
    const prevMap = prev && typeof prev === "object" ? prev : {};
    const prevSection = prevMap[activeHeroPresetId];
    if (prevSection && _.isEqual(prevSection, heroSection)) return prevMap;
    return {
      ...prevMap,
      [activeHeroPresetId]: _.cloneDeep(heroSection),
    };
  });
}, [activeHeroPresetId, heroSection]);
const updateHeroSectionFromPanel = useCallback(
  (nextSection) => {
    setHeroSection((prevSection) =>
      applyHeroSectionUpdateByDevice(prevSection, _.cloneDeep(nextSection), device)
    );
  },
  [device]
);
useEffect(() => {
  if (offcanvas !== "Hero") return;
  setElementData((prev) => {
    const nextHero = _.cloneDeep(resolveHeroSectionByDevice(heroSection, device));
    if (!prev) return nextHero;
    if (_.isEqual(prev, nextHero)) return prev;
    return nextHero;
  });
}, [device, offcanvas, heroSection]);
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
    // Start new preset with a fresh menu list to avoid showing old menu items.
    const nextItems = createDefaultMenuItems();
    const preset = buildMenuPreset({ id: nextId, name: trimmedName, items: nextItems });
    const nextPresets = [...menuPresets, preset];
    latestMenuBarStateRef.current = {
      ...(latestMenuBarStateRef.current || {}),
      menuPresets: _.cloneDeep(nextPresets),
      activeMenuPresetId: nextId,
      defaultMenuPresetId,
      menus: _.cloneDeep(nextItems),
    };
    setMenuPresets(nextPresets);
    setActiveMenuPresetId(nextId);
    setMenus(_.cloneDeep(nextItems));
    return { ok: true, id: nextId, name: trimmedName };
  },
  [menuPresets, defaultMenuPresetId]
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
    if (hydratedPreset?.footerBar) setFooterBar(_.cloneDeep(hydratedPreset.footerBar));
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
    if (duplicatedPreset?.footerBar) setFooterBar(_.cloneDeep(duplicatedPreset.footerBar));
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
      if (fallbackPreset?.footerBar) setFooterBar(_.cloneDeep(fallbackPreset.footerBar));
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
  floatingMenuBgColor:"#ffffff",
  floatingMenuBgOpacity:95,

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
  isOverlay:false,


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
  iconSize:12,
}

const defaultTopBarSocialIcons = [
  {
    ...iconTopBar,
    icon: { name: "faTiktok", type: "fab" },
    iconSize: 12,
  },
  {
    ...iconTopBar,
    icon: { name: "faFacebookF", type: "fab" },
    iconSize: 12,
  },
  {
    ...iconTopBar,
    icon: { name: "faXTwitter", type: "fab" },
    iconSize: 12,
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
  iconSize:12,

}

const defaultTopBarTextItems = [
  {
    ...textTopBar,
    icon: { name: "faPhone", type: "fas" },
    iconSize: 12,
    text: "089-012-34567",
  },
  {
    ...textTopBar,
    icon: { name: "faLocationDot", type: "fas" },
    iconSize: 12,
    text: "Bangkok Thailand",
  },
  {
    ...textTopBar,
    icon: { name: "faClock", type: "fas" },
    iconSize: 12,
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

const createDefaultFooterBar = () => ({
  footerHeight: 46,
  isFluidLayout: false,
  isGradient: false,
  bgColor: "#111827",
  bgOpacity: 255,
  bgColorGradient: [{ type: "mainColor", index: 0 }, { type: "mainColor", index: 1 }],
  bgOpacityGradient: [255, 255],
  bgDegree: 0,
  logo: "",
  logoHeight: 35,
  logoPosition: "center",
  textColor: "#ffffff",
  textOpacity: 255,
  textSize: 13,
  leftText: "© 2026 Domain.com",
  rightText: "All rights reserved.",
  leftIcon: { name: null, type: null },
  rightIcon: { name: null, type: null },
});


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
const [footerBar, setFooterBar] = useState(createDefaultFooterBar())

useEffect(() => {
  menuPresetVisualConfigRef.current = {
    menuBarDesktop: _.cloneDeep(menuBarDesktop),
    menuBarMobile: _.cloneDeep(menuBarMobile),
    menuBarMobilePhone: _.cloneDeep(menuBarMobilePhone ?? null),
    navBottomMobile: _.cloneDeep(navBottomMobile),
    navBottomTablet: _.cloneDeep(navBottomTablet),
    topBar: _.cloneDeep(topBar),
    footerBar: _.cloneDeep(footerBar),
  };
}, [menuBarDesktop, menuBarMobile, menuBarMobilePhone, navBottomMobile, navBottomTablet, topBar, footerBar]);

useEffect(() => {
  setMenuPresets((prev) => {
    let changed = false;
    const next = prev.map((preset) => {
      if (preset.id !== activeMenuPresetId) return preset;
      if (_.isEqual(preset.items, menus)) return preset;
      changed = true;
      return { ...preset, items: _.cloneDeep(menus) };
    });
    return changed ? next : prev;
  });
}, [activeMenuPresetId, menus]);


const menuButtonRef = useRef(null);



const loadMenuBar = () => {
  setIsMenuPresetHydrated(false);
  getMenuBar("69db17211be82fe7637ea096").then((res) => {
    const {
      menuBarDesktop: md,
      menuBarMobile: mm,
      menuBarMobilePhone: mmp,
      navBottomMobile: nm,
      navBottomTablet: nt,
      topBar: tb,
      footerBar: fb,
      menuPresets: serverMenuPresets,
      activeMenuPresetId: serverActiveMenuPresetId,
      defaultMenuPresetId: serverDefaultMenuPresetId,
      heroPresets: serverHeroPresets,
      activeHeroPresetId: serverActiveHeroPresetId,
      defaultHeroPresetId: serverDefaultHeroPresetId,
      heroSection: serverHeroSection,
      heroSections: serverHeroSections,
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
    const normalizeDesktopFloatingMenuDefaults = (menuBarDesktopData) => {
      if (!menuBarDesktopData) return menuBarDesktopData;
      const next = { ...menuBarDesktopData };
      if (next.floatingMenuBgColor == null) {
        next.floatingMenuBgColor = next.bgMenuColor ?? "#ffffff";
      }
      if (
        next.floatingMenuBgOpacity == null ||
        Number.isNaN(Number(next.floatingMenuBgOpacity))
      ) {
        const fallbackOpacity = Number(next.bgMenuOpacity);
        next.floatingMenuBgOpacity = Number.isFinite(fallbackOpacity)
          ? fallbackOpacity
          : 255;
      }
      return next;
    };
    const normalizeFooterBarDefaults = (footerBarData) => {
      const base = createDefaultFooterBar();
      const source = footerBarData && typeof footerBarData === "object" ? footerBarData : {};
      const normalizeFooterIcon = (icon) => {
        if (!icon || typeof icon !== "object") return { name: null, type: null };
        return {
          name: icon?.name ?? null,
          type: icon?.type ?? null,
        };
      };
      const normalizeFooterLogoPosition = (value) => {
        const raw = String(value || "").trim().toLowerCase();
        if (["hidden", "left", "center", "right"].includes(raw)) return raw;
        return base.logoPosition;
      };
      const next = {
        ...base,
        ...source,
      };
      next.isGradient = toBoolean(source?.isGradient ?? base.isGradient);
      next.isFluidLayout = toBoolean(source?.isFluidLayout ?? base.isFluidLayout);
      next.bgColorGradient = Array.isArray(source?.bgColorGradient)
        ? source.bgColorGradient.slice(0, 2)
        : base.bgColorGradient;
      if (next.bgColorGradient.length < 2) {
        next.bgColorGradient = [
          next.bgColorGradient[0] ?? base.bgColorGradient[0],
          next.bgColorGradient[1] ?? base.bgColorGradient[1],
        ];
      }
      next.bgOpacityGradient = Array.isArray(source?.bgOpacityGradient)
        ? source.bgOpacityGradient.slice(0, 2)
        : base.bgOpacityGradient;
      if (next.bgOpacityGradient.length < 2) {
        next.bgOpacityGradient = [
          next.bgOpacityGradient[0] ?? base.bgOpacityGradient[0],
          next.bgOpacityGradient[1] ?? base.bgOpacityGradient[1],
        ];
      }
      const numericFooterHeight = Number(next.footerHeight);
      next.footerHeight = Number.isFinite(numericFooterHeight)
        ? Math.max(36, Math.min(120, numericFooterHeight))
        : base.footerHeight;
      const numericBgDegree = Number(next.bgDegree);
      next.bgDegree = Number.isFinite(numericBgDegree)
        ? Math.max(0, Math.min(360, numericBgDegree))
        : base.bgDegree;
      const numericLogoHeight = Number(next.logoHeight);
      next.logoHeight = Number.isFinite(numericLogoHeight)
        ? Math.max(10, Math.min(120, numericLogoHeight))
        : base.logoHeight;
      next.logoHeight = Math.min(next.logoHeight, next.footerHeight);
      next.logoPosition = normalizeFooterLogoPosition(
        source?.logoPosition ?? base.logoPosition
      );
      const normalizeOpacity = (value, fallback) => {
        const numeric = Number(value);
        if (!Number.isFinite(numeric)) return fallback;
        return Math.max(0, Math.min(255, numeric));
      };
      next.bgOpacity = normalizeOpacity(next.bgOpacity, base.bgOpacity);
      next.textOpacity = normalizeOpacity(next.textOpacity, base.textOpacity);
      const numericTextSize = Number(next.textSize);
      next.textSize = Number.isFinite(numericTextSize)
        ? Math.max(10, Math.min(40, numericTextSize))
        : base.textSize;
      next.bgOpacityGradient = next.bgOpacityGradient.map((value, index) =>
        normalizeOpacity(value, base.bgOpacityGradient[index] ?? 255)
      );
      next.logo = String(next.logo ?? base.logo);
      next.leftText = String(next.leftText ?? base.leftText);
      next.rightText = String(next.rightText ?? base.rightText);
      next.leftIcon = normalizeFooterIcon(source?.leftIcon ?? base.leftIcon);
      next.rightIcon = normalizeFooterIcon(source?.rightIcon ?? base.rightIcon);
      return next;
    };

    const normalizedMenuBarDesktop = normalizeDesktopFloatingMenuDefaults({
      ...menuBarDesktop,
      ...(md || {}),
      isFluidLayout: toBoolean(md?.isFluidLayout),
      isOverlay: toBoolean(md?.isOverlay),
    });
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
    const normalizedFooterBar = normalizeFooterBarDefaults(fb);
    const fallbackVisualConfig = {
      menuBarDesktop: normalizedMenuBarDesktop,
      menuBarMobile: normalizedMenuBarMobile,
      menuBarMobilePhone: normalizedMenuBarMobilePhone,
      navBottomMobile: normalizedMobileNavBottom,
      navBottomTablet: normalizedTabletNavBottom,
      topBar: normalizedTopBar,
      footerBar: normalizedFooterBar,
    };
    const normalizedPresets = (Array.isArray(serverMenuPresets) ? serverMenuPresets : [])
      .map((preset, index) => {
        const mergedMenuBarDesktop = normalizeDesktopFloatingMenuDefaults(
          _.merge(
          _.cloneDeep(fallbackVisualConfig.menuBarDesktop),
          _.cloneDeep(preset?.menuBarDesktop || {})
          )
        );
        mergedMenuBarDesktop.isFluidLayout = toBoolean(
          preset?.menuBarDesktop?.isFluidLayout ??
            fallbackVisualConfig.menuBarDesktop?.isFluidLayout
        );
        mergedMenuBarDesktop.isOverlay = toBoolean(
          preset?.menuBarDesktop?.isOverlay ??
            fallbackVisualConfig.menuBarDesktop?.isOverlay
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
        const mergedFooterBar = normalizeFooterBarDefaults(
          _.merge(
            _.cloneDeep(fallbackVisualConfig.footerBar),
            _.cloneDeep(preset?.footerBar || {})
          )
        );
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
          footerBar: mergedFooterBar,
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
    if (restoredActivePreset?.footerBar) {
      setFooterBar(_.cloneDeep(restoredActivePreset.footerBar));
    } else {
      setFooterBar(_.cloneDeep(normalizedFooterBar));
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
    const serverHeroSectionsMap =
      serverHeroSections && typeof serverHeroSections === "object"
        ? serverHeroSections
        : {};
    const normalizedHeroSections = {};
    heroPresetsToUse.forEach((preset) => {
      const presetId = String(preset?.id || "");
      if (!presetId) return;
      const rawSection =
        serverHeroSectionsMap[presetId] ??
        serverHeroSection;
      normalizedHeroSections[presetId] = normalizeHeroSection(
        rawSection || createDefaultHeroSection()
      );
    });
    setHeroSectionsByPreset(normalizedHeroSections);
    setHeroSection(
      _.cloneDeep(
        normalizedHeroSections[restoredActiveHeroId] ||
          normalizeHeroSection(serverHeroSection || createDefaultHeroSection())
      )
    );
    setIsMenuPresetHydrated(true);
  }).catch(() => {
    setIsMenuPresetHydrated(true);
  });
}; // โหลดข้อมูลหน้า

useEffect(() => {
  if (didInitMenuBarLoadRef.current) return;
  didInitMenuBarLoadRef.current = true;
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

const updateFooterBarForPreset = useCallback((valueOrUpdater) => {
  setFooterBar((prev) => {
    const next =
      typeof valueOrUpdater === "function" ? valueOrUpdater(prev) : valueOrUpdater;
    syncActivePresetVisualField("footerBar", next);
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

useLayoutEffect(() => {
  latestMenuBarStateRef.current = {
    menuBarDesktop,
    menuBarMobile,
    menuBarMobilePhone,
    navBottomMobile,
    navBottomTablet,
    topBar,
    footerBar,
    menuPresets,
    activeMenuPresetId,
    defaultMenuPresetId,
    heroPresets,
    activeHeroPresetId,
    defaultHeroPresetId,
    heroSection,
    heroSections: heroSectionsByPreset,
    menus,
  };
}, [
  menuBarDesktop,
  menuBarMobile,
  menuBarMobilePhone,
  navBottomMobile,
  navBottomTablet,
  topBar,
  footerBar,
  menuPresets,
  activeMenuPresetId,
  defaultMenuPresetId,
  heroPresets,
  activeHeroPresetId,
  defaultHeroPresetId,
  heroSection,
  heroSectionsByPreset,
  menus,
]);



const submitMenuBar = (options = {})=>{
  const shouldReloadAfterSave = options?.reloadAfterSave === true;
  const latest = latestMenuBarStateRef.current || {};
  const menuBarData = {
    menuBarDesktop: latest.menuBarDesktop ?? menuBarDesktop,
    menuBarMobile: latest.menuBarMobile ?? menuBarMobile,
    menuBarMobilePhone: latest.menuBarMobilePhone ?? menuBarMobilePhone,
    navBottomMobile: latest.navBottomMobile ?? navBottomMobile,
    navBottomTablet: latest.navBottomTablet ?? navBottomTablet,
    topBar: latest.topBar ?? topBar,
    footerBar: latest.footerBar ?? footerBar,
    menuPresets: latest.menuPresets ?? menuPresets,
    activeMenuPresetId: latest.activeMenuPresetId ?? activeMenuPresetId,
    defaultMenuPresetId: latest.defaultMenuPresetId ?? defaultMenuPresetId,
    heroPresets: latest.heroPresets ?? heroPresets,
    activeHeroPresetId: latest.activeHeroPresetId ?? activeHeroPresetId,
    defaultHeroPresetId: latest.defaultHeroPresetId ?? defaultHeroPresetId,
    heroSection: latest.heroSection ?? heroSection,
    heroSections: latest.heroSections ?? heroSectionsByPreset,
  }
  const getBackendErrorMessage = (error) => {
    const responseData = error?.response?.data;
    if (typeof responseData === "string" && responseData.trim()) {
      return responseData.trim();
    }
    if (responseData && typeof responseData === "object") {
      if (typeof responseData.message === "string" && responseData.message.trim()) {
        return responseData.message.trim();
      }
      if (typeof responseData.error === "string" && responseData.error.trim()) {
        return responseData.error.trim();
      }
      if (Array.isArray(responseData.errors) && responseData.errors.length > 0) {
        const firstError = responseData.errors.find(
          (item) => typeof item === "string" && item.trim()
        );
        if (firstError) return firstError.trim();
      }
    }
    return "ไม่สำเร็จ.....กรุณาตรวจสอบอีกครั้ง";
  };
  return updateMenuBar(menuBarData ,"69db17211be82fe7637ea096")
  .then(()=>{
    if (shouldReloadAfterSave) {
      loadMenuBar();
    }
    return { ok: true }
  }).catch((error) => ({
    ok: false,
    message: getBackendErrorMessage(error),
    status: error?.response?.status ?? null,
    details: error?.response?.data ?? error?.message ?? null,
  }))
}

const resolveHeroSectionForPreview = useCallback(
  (presetId) => {
    const targetPresetId = String(presetId || "");
    const sectionFromPreset = heroSectionsByPreset?.[targetPresetId];
    if (sectionFromPreset && typeof sectionFromPreset === "object") {
      return _.cloneDeep(sectionFromPreset);
    }
    if (targetPresetId && targetPresetId === activeHeroPresetId) {
      return _.cloneDeep(heroSection);
    }
    return _.cloneDeep(normalizeHeroSection(createDefaultHeroSection()));
  },
  [heroSectionsByPreset, activeHeroPresetId, heroSection]
);

const openPreviewPage = useCallback(() => {
  try {
    const resolvedMenuPresetId =
      page?.menuPresetId || defaultMenuPresetId || activeMenuPresetId;
    const resolvedHeroPresetId =
      page?.heroPresetId || defaultHeroPresetId || activeHeroPresetId;
    const selectedMenuPreset =
      menuPresets.find((preset) => preset.id === resolvedMenuPresetId) ||
      menuPresets.find((preset) => preset.id === defaultMenuPresetId) ||
      menuPresets[0] ||
      null;

    const snapshot = {
      version: 1,
      createdAt: Date.now(),
      layouts: _.cloneDeep(layouts),
      page: _.cloneDeep(page),
      theme: _.cloneDeep(theme),
      device,
      pageSettings: {
        menuPresetId: resolvedMenuPresetId,
        heroPresetId: resolvedHeroPresetId,
      },
      siteChrome: {
        menus: _.cloneDeep(selectedMenuPreset?.items || menus),
        menuBarDesktop: _.cloneDeep(selectedMenuPreset?.menuBarDesktop || menuBarDesktop),
        menuBarMobile: _.cloneDeep(selectedMenuPreset?.menuBarMobile || menuBarMobile),
        menuBarMobilePhone: _.cloneDeep(
          selectedMenuPreset?.menuBarMobilePhone || menuBarMobilePhone
        ),
        topBar: _.cloneDeep(selectedMenuPreset?.topBar || topBar),
        footerBar: _.cloneDeep(selectedMenuPreset?.footerBar || footerBar),
        heroSection: resolveHeroSectionForPreview(resolvedHeroPresetId),
        heroPresetId: resolvedHeroPresetId,
      },
    };
    localStorage.setItem(PREVIEW_SNAPSHOT_KEY, JSON.stringify(snapshot));
  } catch {
    // Ignore preview snapshot persistence errors.
  }
  if (typeof window !== "undefined") {
    window.open("/preview", "_blank", "noopener,noreferrer");
  }
}, [
  layouts,
  page,
  theme,
  device,
  menuPresets,
  defaultMenuPresetId,
  activeMenuPresetId,
  defaultHeroPresetId,
  activeHeroPresetId,
  menus,
  menuBarDesktop,
  menuBarMobile,
  menuBarMobilePhone,
  topBar,
  footerBar,
  heroSection,
  resolveHeroSectionForPreview,
]);

useEffect(() => {
  if (typeof window === "undefined") return undefined;
  const hasPreviewSnapshot = Boolean(localStorage.getItem(PREVIEW_SNAPSHOT_KEY));
  if (!hasPreviewSnapshot) return undefined;

  const rafId = window.requestAnimationFrame(() => {
    try {
      const raw = localStorage.getItem(PREVIEW_SNAPSHOT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return;
      const resolvedMenuPresetId =
        page?.menuPresetId || defaultMenuPresetId || activeMenuPresetId;
      const resolvedHeroPresetId =
        page?.heroPresetId || defaultHeroPresetId || activeHeroPresetId;
      const selectedMenuPreset =
        menuPresets.find((preset) => preset.id === resolvedMenuPresetId) ||
        menuPresets.find((preset) => preset.id === defaultMenuPresetId) ||
        menuPresets[0] ||
        null;
      const nextSnapshot = {
        ...parsed,
        createdAt: Date.now(),
        pageSettings: {
          ...(parsed.pageSettings || {}),
          menuPresetId: resolvedMenuPresetId,
          heroPresetId: resolvedHeroPresetId,
        },
        siteChrome: {
          ...(parsed.siteChrome || {}),
          menus: _.cloneDeep(selectedMenuPreset?.items || menus),
          menuBarDesktop: _.cloneDeep(
            selectedMenuPreset?.menuBarDesktop || menuBarDesktop
          ),
          menuBarMobile: _.cloneDeep(
            selectedMenuPreset?.menuBarMobile || menuBarMobile
          ),
          menuBarMobilePhone: _.cloneDeep(
            selectedMenuPreset?.menuBarMobilePhone || menuBarMobilePhone
          ),
          topBar: _.cloneDeep(selectedMenuPreset?.topBar || topBar),
          footerBar: _.cloneDeep(selectedMenuPreset?.footerBar || footerBar),
          heroSection: resolveHeroSectionForPreview(resolvedHeroPresetId),
          heroPresetId: resolvedHeroPresetId,
        },
      };
      localStorage.setItem(PREVIEW_SNAPSHOT_KEY, JSON.stringify(nextSnapshot));
    } catch {
      // Ignore preview live sync errors.
    }
  });

  return () => window.cancelAnimationFrame(rafId);
}, [
  page,
  defaultMenuPresetId,
  activeMenuPresetId,
  defaultHeroPresetId,
  activeHeroPresetId,
  menuPresets,
  menus,
  menuBarDesktop,
  menuBarMobile,
  menuBarMobilePhone,
  topBar,
  footerBar,
  heroSection,
  resolveHeroSectionForPreview,
]);

const updatePageSettings = useCallback((patch) => {
  setPage((prev) => {
    if (!prev) return prev;
    const next = { ...prev, ...patch };
    pageDraftRef.current = {
      ...pageDraftRef.current,
      page: next,
    };
    return next;
  });
  const pageId = String(pageDraftRef.current?.page?._id || page?._id || "");
  if (!pageId) return Promise.resolve({ ok: false });
  return editPage(patch, pageId)
    .then((response) => {
      const updated =
        response?.data && typeof response.data === "object"
          ? response.data
          : null;
      if (updated) {
        setPage((prev) => {
          const next = { ...prev, ...updated };
          pageDraftRef.current = {
            ...pageDraftRef.current,
            page: next,
          };
          return next;
        });
      }
      return { ok: true, page: updated };
    })
    .catch((err) => {
      console.log(err);
      return { ok: false, error: err };
    });
}, [page?._id]);

const handleSelectPageMenuPreset = useCallback(
  (presetId) => {
    updatePageSettings({ menuPresetId: presetId });
  },
  [updatePageSettings]
);

const handleSelectPageHeroPreset = useCallback(
  (presetId) => {
    updatePageSettings({ heroPresetId: presetId });
  },
  [updatePageSettings]
);

const pagePopupSaveTimerRef = useRef(null);
const handleUpdatePagePopup = useCallback(
  (nextPopup) => {
    const normalized =
      nextPopup && typeof nextPopup === "object"
        ? nextPopup
        : {
            enabled: false,
            src: "",
            brightness: 0,
            borderRadius: 12,
            animationType: "fade-in",
            linkUrl: "",
            linkTarget: "_self",
          };
    /* อัปเดต state ทันที — debounce บันทึก DB กันสไลเดอร์ยิงถี่ */
    setPage((prev) => {
      if (!prev) return prev;
      const next = { ...prev, pagePopup: normalized };
      pageDraftRef.current = {
        ...pageDraftRef.current,
        page: next,
      };
      return next;
    });
    if (pagePopupSaveTimerRef.current) {
      clearTimeout(pagePopupSaveTimerRef.current);
    }
    pagePopupSaveTimerRef.current = setTimeout(() => {
      pagePopupSaveTimerRef.current = null;
      const pageId = String(
        pageDraftRef.current?.page?._id || page?._id || ""
      );
      if (!pageId) return;
      editPage({ pagePopup: normalized }, pageId)
        .then((response) => {
          const updated =
            response?.data && typeof response.data === "object"
              ? response.data
              : null;
          if (!updated?.pagePopup) return;
          setPage((prev) => {
            const next = {
              ...prev,
              pagePopup: updated.pagePopup,
            };
            pageDraftRef.current = {
              ...pageDraftRef.current,
              page: next,
            };
            return next;
          });
        })
        .catch((err) => console.log(err));
    }, 280);
  },
  [page?._id]
);

const pageMenuPresetId =
  page?.menuPresetId || defaultMenuPresetId || activeMenuPresetId || "";
const pageHeroPresetId =
  page?.heroPresetId || defaultHeroPresetId || activeHeroPresetId || "";
const hasSelectedBuilderPage = Boolean(page?._id);
const BUILDER_HEADER_HEIGHT = 64;


const offcanvasWidth =
  offcanvas === "Nav"
    ? 500
    : offcanvas === "Hero"
      ? 400
      : 400;
const shouldOffsetMenuChromeOffcanvas = !isPreviewRoute;
const shouldShowOffcanvasOverlay = false;
const shouldCloseOffcanvasOnOutsideClick =
  ["Container", "Column", "Hero", "Top", "Footer", "Menu", "Nav"].includes(
    offcanvas
  ) && !isPreviewRoute;
const isAbsoluteOffcanvas = shouldOffsetMenuChromeOffcanvas;
const offcanvasZIndex = shouldOffsetMenuChromeOffcanvas ? 220 : undefined;
const effectiveOffcanvasWidth = offcanvas ? offcanvasWidth : 0;

useEffect(() => {
  if (!shouldCloseOffcanvasOnOutsideClick) return;
  let pointerDownOutside = false;
  let writeGenAtPointerDown = 0;
  const isOutsidePanelTarget = (target) => {
    const panelNode = offcanvasAsideRef.current;
    if (!panelNode || !(target instanceof Node)) return false;
    if (panelNode.contains(target)) return false;
    if (
      typeof target?.closest === "function" &&
      target.closest(".MuiModal-root, .MuiPopover-root, .MuiPopper-root")
    ) {
      return false;
    }
    return true;
  };
  const onPointerDown = (event) => {
    if (!isOutsidePanelTarget(event?.target)) {
      pointerDownOutside = false;
      return;
    }
    pointerDownOutside = true;
    writeGenAtPointerDown = offcanvasWriteGenRef.current;
  };
  // ใช้ click แบบ bubble — หลัง handler ของปุ่ม/ลิงก์เปิด panel อื่นแล้ว
  const onClickOutside = (event) => {
    if (!pointerDownOutside) return;
    pointerDownOutside = false;
    if (!isOutsidePanelTarget(event?.target)) return;
    // ถ้ามี setOffcanvas ระหว่าง pointerdown→click (เปิด panel ใหม่) ไม่ปิดทับ
    if (offcanvasWriteGenRef.current !== writeGenAtPointerDown) return;
    if (offcanvasRef.current == null) return;
    setOffcanvas(null);
  };
  window.addEventListener("pointerdown", onPointerDown, true);
  window.addEventListener("click", onClickOutside, false);
  return () => {
    window.removeEventListener("pointerdown", onPointerDown, true);
    window.removeEventListener("click", onClickOutside, false);
  };
}, [shouldCloseOffcanvasOnOutsideClick, setOffcanvas]);



  

    return(
        <div
          className={`${darkMode === "dark" ?"dark":""} dashboard-chrome h-screen w-full overflow-x-hidden`}
          style={dashboardChromeCssVars}
        >
         

        
             <div
               className="relative flex h-full min-h-0 min-w-0 w-full overflow-x-hidden"
             >


                {!isPreviewRoute && (
                  <Navbar handleDragElement={handleDragElement} isDark={darkMode} selectedMenuId={selectedMenuId} setSelectedMenuId={setSelectedMenuId} updateNewTheme={updateNewTheme} setMobilePage={setMobilePage}  mobilePage={mobilePage}  navOpen={navOpen} setNavOpen={setNavOpen} railExpanded={railExpanded}/>
                )}

                <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                {!isPreviewRoute && (
                    <Header
                      menuButtonRef={menuButtonRef}
                      submitMenuBar={submitMenuBar}
                      topBarData={topBar}
                      menuBarDesktop={menuBarDesktop}
                      menuBarMobile={menuBarForCurrentDevice}
                      theme={theme}
                      setFont={setFont}
                      toggleDarkMode={toggleDarkMode}
                      setOpenBar={setOffcanvas}
                      openBar={offcanvas}
                      isDark={darkMode}
                      menus={menus}
                      setBuilderMode={setBuilderMode}
                      builderMode={builderMode}
                      deviceType={device}
                      setDevice={setDevice}
                      pageName={page.pageName}
                      hasSelectedBuilderPage={hasSelectedBuilderPage}
                      activePageId={activeBuilderPageId}
                      defaultPageId={defaultBuilderPageId}
                      onSelectPage={handleSelectBuilderPage}
                      onPageCreated={handleBuilderPageCreated}
                      onPagesChanged={handleBuilderPagesChanged}
                      textColor={darkTextColor}
                      option={selectedMenuId}
                      setNavOpen={setNavOpen}
                      railExpanded={railExpanded}
                      toggleRailExpanded={toggleRailExpanded}
                      onOpenPreview={openPreviewPage}
                      onOpenPageSettings={openPageSettingsPanel}
                      onPublishBuilder={handlePublishBuilder}
                      menuPresets={menuPresets}
                      activeMenuPresetId={activeMenuPresetId}
                      defaultMenuPresetId={defaultMenuPresetId}
                      isMenuPresetHydrated={isMenuPresetHydrated}
                      onCreateMenuPreset={createMenuPreset}
                      onSelectMenuPreset={selectMenuPreset}
                      onSetDefaultMenuPreset={setDefaultMenuPreset}
                      onRenameMenuPreset={renameMenuPreset}
                      onDuplicateMenuPreset={duplicateMenuPreset}
                      onDeleteMenuPreset={deleteMenuPreset}
                      onResetMenuPresets={resetMenuPresets}
                      heroPresets={heroPresets}
                      activeHeroPresetId={activeHeroPresetId}
                      defaultHeroPresetId={defaultHeroPresetId}
                      onHeroStateChange={handleHeroStateChange}
                      formPresets={formPresets}
                      activeFormPresetId={activeFormPresetId}
                      defaultFormPresetId={defaultFormPresetId}
                      isFormsHydrated={isFormsHydrated}
                      isFormsDirty={isFormsDirty}
                      onFormStateChange={handleFormStateChange}
                      submitForms={submitForms}
                    />
                )}

                <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden">
                  <Suspense fallback={<div className="h-full min-h-0 flex-1 bg-transparent" />}>
                    <Routes>
                    <Route path="heros" element={<HeroPage key={`hero-${device}`} heroSection={heroSection} theme={theme} openOffcavanas={openOffcavanas} updateHeroSection={updateHeroSectionFromPanel} device={device} />} />
                    <Route path="menus" element={isMenuPresetHydrated ? <MenuPage menuButtonRef={menuButtonRef} menus={menus} setMenus={setMenus} navBottom={navBottom} navOpen={navOpen} setNavOpen={setNavOpen} setOpenBar={setOffcanvas} device={device} menuBar={menuBarForCurrentDevice} topBar={topBar} footerBar={footerBar} theme={theme} setFont={setFont} darkMode={darkMode} darkTextColor={darkTextColor}/> : <div className="h-full w-full bg-transparent" />} />
                    <Route
                      path="forms"
                      element={
                        isFormsHydrated ? (
                          <FormsPage
                            theme={theme}
                            darkMode={darkMode}
                            textColor={darkTextColor}
                            activeFormPresetId={activeFormPresetId}
                            rows={activeFormPreset?.gridRows || []}
                            currentRowId={activeFormPreset?.selectedRowId ?? null}
                            onRowsChange={handleActiveFormRowsChange}
                            onCurrentRowIdChange={handleActiveFormSelectedRowChange}
                            conditionalChains={
                              activeFormPreset?.conditionalChains || []
                            }
                            onConditionalChainsChange={
                              handleActiveFormConditionalChainsChange
                            }
                            calculations={
                              activeFormPreset?.calculations || []
                            }
                            onCalculationsChange={
                              handleActiveFormCalculationsChange
                            }
                            onRegisterFormsDraftFlush={(flushFn) => {
                              formsDraftFlushRef.current =
                                typeof flushFn === "function" ? flushFn : null;
                            }}
                            onFormsPanelDraftDirtyChange={setFormsPanelDraftDirty}
                          />
                        ) : (
                          <div className="h-full w-full bg-transparent" />
                        )
                      }
                    />
                    <Route
                      path="messages"
                      element={<MessagesPage />}
                    />
                    <Route
                      path="settings"
                      element={
                        <SettingsPage
                          darkMode={darkMode}
                          chromeState={dashboardChromeState}
                          isDirty={isDashboardChromeDirty}
                          isSaving={isSavingDashboardChrome}
                          onChangeDashboardChrome={handleChangeDashboardChrome}
                          onChangeDashboardChromePreset={handleChangeDashboardChromePreset}
                          onResetDashboardChrome={handleResetDashboardChrome}
                          onSaveDashboardChrome={handleSaveDashboardChrome}
                        />
                      }
                    />
                    <Route
                      index
                      element={
                        hasSelectedBuilderPage ? (
                          <Content
                            builderMode={builderMode}
                            handleDropElement={handleDropElement}
                            device={device}
                            openOffcavanas={openOffcavanas}
                            offcanvasID={elementData?.id}
                            layouts={layouts}
                            setLayout={updateLayout}
                            theme={theme}
                            setPage={setPage}
                            page={page}
                            patchElementRef={patchElementRef}
                            openListBoxTextEditRef={openListBoxTextEditRef}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center px-6">
                            <div className="rounded-lg border border-dashed border-slate-300 bg-white px-5 py-4 text-center text-[13px] text-slate-500 dark:border-white/20 dark:bg-slate-900/40 dark:text-white/55">
                              กรุณาเลือกหน้าก่อนเริ่มออกแบบ
                            </div>
                          </div>
                        )
                      }
                    />
                    <Route path="*" element={<Navigate to="/builder" replace />} />
                    </Routes>
                  </Suspense>
                  {selectedMenuId === "Builder" && hasSelectedBuilderPage && (
                    <Suspense fallback={null}>
                      <PageSettingsPanel
                        isOpen={isPageSettingsPanelOpen}
                        onClose={() => setIsPageSettingsPanelOpen(false)}
                        pageOid={String(page?._id || "")}
                        menuPresets={menuPresets}
                        heroPresets={heroPresets}
                        pageMenuPresetId={pageMenuPresetId}
                        pageHeroPresetId={pageHeroPresetId}
                        onSelectMenuPreset={handleSelectPageMenuPreset}
                        onSelectHeroPreset={handleSelectPageHeroPreset}
                        isMenuPresetHydrated={isMenuPresetHydrated}
                        pagePopup={page?.pagePopup}
                        onUpdatePagePopup={handleUpdatePagePopup}
                        textColor={darkTextColor}
                      />
                    </Suspense>
                  )}
                  {shouldShowOffcanvasOverlay && (
                    <button
                      type="button"
                      aria-label="ปิด panel ตั้งค่า"
                      className="absolute inset-0 z-[210] cursor-default bg-transparent"
                      onClick={() => setOffcanvas(null)}
                    />
                  )}
                </div>
               
             </div>
             {!isPreviewRoute && (
             <aside
  ref={offcanvasAsideRef}
  className="
    dash-panel flex flex-col min-h-0 h-full max-h-full overflow-hidden
    border-r
    transition-[width,transform,opacity] duration-300 ease-in-out
  "
  style={{
    ...dashboardChromeCssVars,
    position: isAbsoluteOffcanvas ? "absolute" : "relative",
    top: shouldOffsetMenuChromeOffcanvas ? BUILDER_HEADER_HEIGHT : undefined,
    right: isAbsoluteOffcanvas ? 0 : undefined,
    bottom: isAbsoluteOffcanvas ? 0 : undefined,
    zIndex: offcanvasZIndex,
    width: isAbsoluteOffcanvas
      ? effectiveOffcanvasWidth
      : offcanvas
        ? offcanvasWidth
        : 0,
    transform: isAbsoluteOffcanvas ? "translateX(0)" : "translateX(0)",
    pointerEvents: offcanvas ? "auto" : "none",
    height: shouldOffsetMenuChromeOffcanvas
      ? `calc(100% - ${BUILDER_HEADER_HEIGHT}px)`
      : undefined,
    flexShrink: 0,
    background: "var(--dash-panel)",
    ["--fill"]: "var(--dash-panel-accent)",
    ["--track"]: "var(--dash-panel-slider-track)",
    ["--thumb"]: "var(--dash-panel-slider-thumb)",
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
              <HeroOffcanvas
                element={elementData}
                updateHero={updateHeroSectionFromPanel}
                close={openOffcavanas}
                textColor={darkTextColor}
                device={device}
              />
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
             {offcanvas === "Form" && (
              <FormElementOffcanvas
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
             {offcanvas === "FormBlock" && (
              <FormBlockOffcanvas
                element={elementData}
                onUpdate={(payload) => {
                  setElementData(payload);
                  patchElementRef.current?.(payload, {
                    eleID: payload?.id ?? elementData?.id,
                  });
                }}
                close={openOffcavanas}
                darkMode={darkMode}
                textColor={darkTextColor}
              />
             )}
             
             {offcanvas === "Top" && (
              <TopBarOffcanvas open={offcanvas === "Top"} close={setOffcanvas} topBar={topBar} darkMode={darkMode} darkTextColor={darkTextColor} updateTopBar={updateTopBarForPreset} device={device}/>
             )}
             {offcanvas === "Footer" && (
              <FooterBarOffcanvas
                open={offcanvas === "Footer"}
                close={setOffcanvas}
                footerBar={footerBar}
                darkMode={darkMode}
                darkTextColor={darkTextColor}
                updateFooterBar={updateFooterBarForPreset}
              />
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