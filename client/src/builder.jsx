import React, { useEffect, useMemo, useState, useRef } from "react";
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
import {test} from "./Builder/functions"
import Navbar from "./Builder/navbar"


export default function DashboardApp() {
  const [layouts, setLayout] = useState([]);
  const [navOpen, setNavOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("CRM");
  const [selectedMenuId, setSelectedMenuId] = useState("home");
  const [expanded,setExpanded] = useState(false)
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved =
        typeof window !== "undefined"
          ? localStorage.getItem("dash-theme")
          : null;
      if (saved) return saved === "dark";
      if (typeof window !== "undefined" && window.matchMedia) {
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
      }
    } catch (_) {}
    return true;
  });

  const handleChangeExpand = (panel) => (e,isExpanded)=>{
    console.log(isExpanded);
    setExpanded(isExpanded?panel:false)
  }


  const _ = ()=>{
    test()
    .then(res=>console.log(res.data))
    .catch(err=>console.log(err))
  }


  useEffect(()=>{
    _()
  },[])

  const headingOptions = [
    { value: "font-merriweather", label: "Merriweather", id: "1" },
    {
      value: "font-monsieur-la-doulaise",
      label: "Monsieur La Doulaise",
      id: "2",
    },
    { value: "font-montserrat", label: "Montserrat", id: "3" },
    { value: "font-oswald", label: "Oswald", id: "4" },
    { value: "font-raleway", label: "Raleway", id: "5" },
  ];



  const textOptions = [
    { value: "font-merriweather", label: "Merriweather", id: "1" },
    {
      value: "font-monsieur-la-doulaise",
      label: "Monsieur La Doulaise",
      id: "2",
    },
    { value: "font-montserrat", label: "Montserrat", id: "3" },
    { value: "font-oswald", label: "Oswald", id: "4" },
    { value: "font-raleway", label: "Raleway", id: "5" },
  ];


  const rounded1 = "rounded-l-md"
  const rounded2 = "rounded-r-md"


  const accordionOptions = [
    {label:"หน้าหลัก",id:"0",color:{ true: "bg-red-500 text-white hover:bg-red-600 "+rounded1, false: "bg-zinc-200 hover:bg-zinc-300 "+rounded1 }},
    {label:"แก้ไข",id:"1",color:"bg-yellow-500 text-white hover:bg-yellow-600"},
    {label:"ลบหน้า",id:"2",color:"bg-green-500 text-white hover:bg-green-600"},
    {label:"คัดลอก",id:"3",color:"bg-blue-500 text-white hover:bg-blue-600 "+rounded2},
  ]

  const pageNames = [
    {name:"page1",id:"0",main:true,},
    {name:"page2",id:"1",main:false},
    {name:"page3",id:"2",main:false},
    {name:"page4",id:"3",main:false},
  ]


  const [fontLabel, setFontLabel] = useState();

  useEffect(() => {
    const mode = isDark ? "dark" : "light";
    localStorage.setItem("dash-theme", mode);
    const root = document.documentElement;
    if (isDark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [isDark]);

  const menus = useMemo(
    () => ({
      theme: {
        title: "Theme",
        items: [
          "CRM",
          "Ecommerce",
          "Crypto",
          "Jobs",
          "NFT",
          "Sales",
          "Analytics",
          "Projects",
          "HRM",
          "Stocks",
          "Courses",
          "Personal",
        ],
      },
      elements: {
        title: "All Elements",
        items: ["Requirements", "Specs", "Contracts", "Invoices"],
      },
      pages: {
        title: "All Pages",
        items: ["All Alerts", "Errors", "Warnings", "Mentions"],
      },
      team: {
        title: "Team",
        items: ["Members", "Roles", "Permissions", "Invites"],
      },
      settings: {
        title: "Settings",
        items: ["General", "Billing", "Security", "Integrations"],
      },
      gifts: {
        title: "Campaigns",
        items: ["Coupons", "Promos", "Loyalty", "Gifts"],
      },
      reports: {
        title: "Reports",
        items: ["Sales", "Traffic", "Cohorts", "Funnel"],
      },
      apps: {
        title: "Apps",
        items: ["Calendar", "Inbox", "Contacts", "Files"],
      },
      data: {
        title: "Data",
        items: ["Tables", "ETL Jobs", "Backups", "Schemas"],
      },
      map: {
        title: "Locations",
        items: ["Stores", "Regions", "Routing", "Heatmap"],
      },
    }),
    []
  );

  const [heading, setHeading] = useState(headingOptions[0]);
  const [text, setText] = useState(textOptions[0]);

  const currentMenu = menus[selectedMenuId];

  useEffect(() => {
    console.log(selectedMenuId);
  }, [selectedMenuId]);

  // --- Drag & Drop canvas state ---
  const canvasRef = useRef(null);
  const [nodes, setNodes] = useState([]); // {id, type, x, y}

  const handleDragStart = (e, type) => {
    e.dataTransfer.setData("text/element", type);
    // hint สำหรับ iOS/Firefox
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // ต้องมีเพื่ออนุญาต drop
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("text/element");
    setLayout([...layouts, [type, type, type]]);
  };

  const [checkNavbar, setNavbar] = useState(
    selectedMenuId !== "elements" && selectedMenuId !== "theme" && selectedMenuId !== "pages"
  );
  useEffect(() => {
    setNavbar(selectedMenuId !== "elements" && selectedMenuId !== "theme" && selectedMenuId !== "pages");
  }, [selectedMenuId]);

  const renderNode = (n) => {
    const base =
      "absolute px-3 py-2 rounded-md shadow-sm border border-white/10";
    switch (n.type) {
      case "column":
        return (
          <div
            className={`${base} bg-emerald-500/15 text-emerald-200`}
            style={{ left: n.x, top: n.y }}
          >
            Column
          </div>
        );
      default:
        return (
          <div
            className={`${base} bg-white/10 text-white`}
            style={{ left: n.x, top: n.y }}
          >
            {n.type}
          </div>
        );
    }
  };

  return (
    <div className={`${isDark ? "dark " : ""} h-screen w-full`}>
      <div className="flex h-full w-full bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-emerald-300">
        {/* Icon rail */}
        {/* <aside className="sm:flex flex-col items-center gap-4 py-4 w-12 border-r border-slate-200 dark:border-white/10 bg-white/90 dark:bg-gray-950/70">
          <div className="h-10 w-10 grid place-items-center rounded-lg bg-slate-100 dark:bg-white/5">
            <Layers className="h-5 w-5 text-slate-700 dark:text-white/90" />
          </div>
          <IconButton
            icon={Layers}
            label="Elements"
            onClick={() => {
              setSelectedMenuId("elements");
              setNavOpen(true);
            }}
          />
          <IconButton
            icon={SwatchBook}
            label="Theme"
            onClick={() => {
              setSelectedMenuId("theme");
              setNavOpen(true);
            }}
          />
          <IconButton
            icon={FileText}
            label="Pages"
            onClick={() => {
              setSelectedMenuId("pages");
              setNavOpen(true);
            }}
          />
          <IconButton
            icon={Users}
            label="Team"
            onClick={() => {
              setSelectedMenuId("team");
              setNavOpen(true);
            }}
          />
          <IconButton
            icon={Settings}
            label="Settings"
            onClick={() => {
              setSelectedMenuId("settings");
              setNavOpen(true);
            }}
          />
          <IconButton
            icon={Gift}
            label="Gifts"
            onClick={() => {
              setSelectedMenuId("gifts");
              setNavOpen(true);
            }}
          />
          <IconButton
            icon={BarChart3}
            label="Reports"
            onClick={() => {
              setSelectedMenuId("reports");
              setNavOpen(true);
            }}
          />
          <IconButton
            icon={Grid3X3}
            label="Apps"
            onClick={() => {
              setSelectedMenuId("apps");
              setNavOpen(true);
            }}
          />
          <IconButton
            icon={Database}
            label="Data"
            onClick={() => {
              setSelectedMenuId("data");
              setNavOpen(true);
            }}
          />
          <IconButton
            icon={MapPin}
            label="Map"
            onClick={() => {
              setSelectedMenuId("map");
              setNavOpen(true);
            }}
          />
          <div className="mt-auto">
            <IconButton icon={LogOut} label="Logout" onClick={() => {}} />
          </div>
        </aside> */}

        <Navbar/>

        {/* Wide nav panel (collapsible) */}
        <aside
          className={`${
            navOpen ? "w-60" : "w-0"
          } sm:block transition-all duration-300 overflow-hidden bg-white dark:bg-gray-900/80 border-r border-slate-200 dark:border-white/10`}
        >
          <div className="px-6 py-5 flex items-center justify-between">
            <div className="font-semibold tracking-wide">
              {currentMenu?.title || "Navigation"}
            </div>
            <button
              onClick={() => setNavOpen((s) => !s)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-white/70"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path
                  fillRule="evenodd"
                  d="M15.78 4.22a.75.75 0 010 1.06L10.06 11l5.72 5.72a.75.75 0 11-1.06 1.06l-6.25-6.25a.75.75 0 010-1.06l6.25-6.25a.75.75 0 011.06 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
          <nav className="px-4 pb-6 overflow-y-auto h-[calc(100%-64px)]">
            <ul className="mt-1 pl-1">
              {checkNavbar &&
                currentMenu?.items.map((item) => (
                  <li key={item}>
                    <button
                      onClick={() => setActiveItem(item)}
                      className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 ${
                        activeItem === item
                          ? "text-slate-900 dark:text-white"
                          : "text-slate-600 dark:text-white/70"
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-white/40" />
                      <span>{item}</span>
                    </button>
                  </li>
                ))}
              {selectedMenuId === "elements" && (
                <li>
                  <div className="grid grid-cols-2 gap-3 mx-0">
                    <div
                      className="bg-gray-50 dark:bg-white/5 rounded-md text-center px-3 py-2 cursor-grab active:cursor-grabbing"
                      draggable
                      onDragStart={(e) => handleDragStart(e, "column")}
                    >
                      {" "}
                      <span className="material-icons-outlined text-[30px] px-2 dark:text-white/50">
                        dashboard_customize
                      </span>
                      <p className="text-[12px] dark:text-white/40 antialiased">
                        Column
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-white/5 rounded-md text-center px-3 py-2">
                      <span className="material-icons-outlined text-[30px] px-2 dark:text-white/50">
                        reset_tv
                      </span>
                      <p className="text-[12px] dark:text-white/40 antialiased">
                        Menu
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-white/5 rounded-md text-center px-3 py-2">
                      <span className="material-icons-outlined text-[30px] px-2 dark:text-white/50">
                        center_focus_weak
                      </span>
                      <p className="text-[12px] dark:text-white/40 antialiased">
                        Header
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-white/5 rounded-md text-center px-3 py-2">
                      <span className="material-icons-outlined text-[30px] px-2 dark:text-white/50">
                        photo_size_select_actual
                      </span>
                      <p className="text-[12px] dark:text-white/40 antialiased">
                        Image
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-white/5 rounded-md text-center px-3 py-2">
                      <span className="material-icons-outlined text-[30px] px-2 dark:text-white/50">
                        sentiment_very_satisfied
                      </span>
                      <p className="text-[12px] dark:text-white/40 antialiased">
                        iCons
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-white/5 rounded-md text-center px-3 py-2">
                      <span className="material-icons-outlined text-[30px] px-2 dark:text-white/50">
                        auto_awesome
                      </span>
                      <p className="text-[12px] dark:text-white/40 antialiased">
                        Heading
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-white/5 rounded-md text-center px-3 py-2">
                      <span className="material-icons-outlined text-[30px] px-2 dark:text-white/50">
                        format_size
                      </span>
                      <p className="text-[12px] dark:text-white/40 antialiased">
                        Text
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-white/5 rounded-md text-center px-3 py-2">
                      <span className="material-icons-outlined text-[30px] px-2 dark:text-white/50">
                        smart_button
                      </span>
                      <p className="text-[12px] dark:text-white/40 antialiased">
                        Button
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-white/5 rounded-md text-center px-3 py-2">
                      <span className="material-icons-outlined text-[30px] px-2 dark:text-white/50">
                        more_horiz
                      </span>
                      <p className="text-[12px] dark:text-white/40 antialiased pt-2 leading-[0.1]">
                        Carousel
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-white/5 rounded-md text-center px-3 py-2">
                      <span className="material-icons-outlined text-[30px] px-2 dark:text-white/50">
                        insert_page_break
                      </span>
                      <p className="text-[12px] dark:text-white/40 antialiased">
                        Divider
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-white/5 rounded-md text-center px-3 py-2">
                      <span className="material-icons-outlined text-[30px] px-2 dark:text-white/50">
                        slow_motion_video
                      </span>
                      <p className="text-[12px] dark:text-white/40 antialiased">
                        Youtube
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-white/5 rounded-md text-center px-3 py-2">
                      <span className="material-icons-outlined text-[30px] px-2 dark:text-white/50">
                        storage
                      </span>
                      <p className="text-[12px] dark:text-white/40 antialiased">
                        List Item{" "}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-white/5 rounded-md text-center px-3 py-2">
                      <span className="material-icons-outlined text-[30px] px-2 dark:text-white/50">
                        timer
                      </span>
                      <p className="text-[12px] dark:text-white/40 antialiased">
                        Counter
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-white/5 rounded-md text-center px-3 py-2">
                      <span className="material-icons-outlined text-[30px] px-2 dark:text-white/50">
                        interests
                      </span>
                      <p className="text-[12px] dark:text-white/40 antialiased">
                        List iCons
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-white/5 rounded-md text-center px-3 py-2">
                      <span className="material-icons-outlined text-[40px] px-2 dark:text-white/50">
                        power_input
                      </span>
                      <p className="text-[12px] dark:text-white/40 antialiased leading-[0.1]">
                        Footer
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-white/5 rounded-md text-center px-3 py-2">
                      <span className="material-icons-outlined text-[30px] px-2 dark:text-white/50">
                        forward_to_inbox
                      </span>
                      <p className="text-[12px] dark:text-white/40 antialiased">
                        Form
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-white/5 rounded-md text-center px-3 py-2">
                      <span className="material-icons-outlined text-[30px] px-2 dark:text-white/50">
                        confirmation_number
                      </span>
                      <p className="text-[12px] dark:text-white/40 antialiased">
                        Card
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-white/5 rounded-md text-center px-3 py-2">
                      <span className="material-icons-outlined text-[30px] px-2 dark:text-white/50">
                        add_photo_alternate
                      </span>
                      <p className="text-[12px] dark:text-white/40 antialiased">
                        Gallery
                      </p>
                    </div>
                  </div>
                </li>
              )}
              {selectedMenuId === "theme" && (
                <li>
                  <div className="flex items-center gap-2 mt-5 mb-2">
                    <span className="text-dark dark:text-white/80 text-[13px]">
                      ตัวอักษร - หัวข้อ 111
                    </span>
                    <div className="flex-1 border-b border-gray-500/50"></div>
                  </div>
                  <Listbox value={heading} onChange={setHeading}>
                    <div className="relative mt-2">
                      <ListboxButton className="grid w-full cursor-default grid-cols-1 rounded-md bg-gray-900 dark:bg-white text-gray-300 dark:text-gray-900 py-1.5 pr-2 pl-3 text-left outline-1 -outline-offset-1 outline-gray-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 text-[12px] hover:cursor-pointer">
                        <span className="col-start-1 row-start-1 flex items-center gap-3 pr-6">
                          <span className={`block truncate ${heading.value}`}>
                            {heading.label}
                          </span>
                        </span>
                        <ChevronUpDownIcon
                          aria-hidden="true"
                          className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                        />
                      </ListboxButton>

                      <ListboxOptions
                        transition
                        className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-gray-900 dark:bg-white text-teal-500 dark:text-teal-500 py-1 shadow-none outline-1 outline-black/5 data-leave:transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0 text-[12px]"
                      >
                        {headingOptions.map((h, i) => (
                          <ListboxOption
                            value={h}
                            key={i}
                            id={h.id}
                            className={`group relative cursor-default py-2 pr-9 pl-3 text-gray-200 dark:text-gray-900  select-none data-focus:bg-indigo-600 data-focus:text-white data-focus:outline-hidden hover:cursor-pointer ${
                              i !== 0 ? "border-dotted border-t border-gray-600 dark:border-gray-200" : ""
                            } `}
                          >
                            <div className="flex items-center">
                              <span
                                className={`ml-3 block truncate font-normal group-data-selected:font-semibold ${h.value}`}
                              >
                                {h.label}
                              </span>
                            </div>

                            <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600 group-not-data-selected:hidden group-data-focus:text-white">
                              {heading.id === h.id && (
                                <CheckCircleIcon
                                  aria-hidden="true"
                                  className="size-5 !text-gray-400 dark:!text-gray-800"
                                />
                                
                              )}
                            </span>
                          </ListboxOption>
                        ))}
                      </ListboxOptions>
                    </div>
                  </Listbox>

                  <div className="flex items-center gap-2 mt-5 mb-2">
                    <span className="ttext-dark dark:text-white/80 text-[13px]">
                      ตัวอักษร - ข้อความ
                    </span>
                    <div className="flex-1 border-b border-gray-500/50"></div>
                  </div>
                  <Listbox value={text} onChange={setText}>
                    <div className="relative mt-2">
                      <ListboxButton className="grid w-full cursor-default grid-cols-1 rounded-md bg-gray-900 dark:bg-white text-gray-300 dark:text-gray-900 py-1.5 pr-2 pl-3 text-left outline-1 -outline-offset-1 outline-gray-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 text-[12px] hover:cursor-pointer">
                        <span className="col-start-1 row-start-1 flex items-center gap-3 pr-6 ">
                          <span className={`block truncate ${text.value}`}>
                            {text.label}
                          </span>
                        </span>
                        <ChevronUpDownIcon
                          aria-hidden="true"
                          className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                        />
                      </ListboxButton>

                      <ListboxOptions
                        transition
                        className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-gray-900 dark:bg-white text-teal-500 dark:text-teal-500 py-1 shadow-none outline-1 outline-black/5 data-leave:transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0 text-[12px]"
                      >
                        {textOptions.map((t, i) => (
                          <ListboxOption
                            value={t}
                            key={i}
                            id={t.id}
                            className={`group relative cursor-default py-2 pr-9 pl-3 text-gray-200 dark:text-gray-900 select-none data-focus:bg-indigo-600 data-focus:text-white data-focus:outline-hidden hover:cursor-pointer ${
                              i !== 0 ? "border-dotted border-t border-gray-600 dark:border-gray-200" : ""
                            } `}
                          >
                            <div className="flex items-center">
                              <span
                                className={`ml-3 block truncate font-normal group-data-selected:font-semibold ${t.value}`}
                              >
                                {t.label}
                              </span>
                            </div>

                            <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600 group-not-data-selected:hidden group-data-focus:text-white">
                              {text.id === t.id && (
                                <CheckCircleIcon
                                aria-hidden="true"
                                className="size-5 !text-gray-400 dark:!text-gray-800"
                              />
                              )}
                            </span>
                          </ListboxOption>
                        ))}
                      </ListboxOptions>
                    </div>
                  </Listbox>

                  <div className="flex items-center gap-2 mt-5 mb-2">
                    <span className="ttext-dark dark:text-white/80 text-[13px]">
                      ตั้งค่าสีหลัก
                    </span>
                    <div className="flex-1 border-b border-gray-500/50"></div>
                  </div>
                  <div
                    className="grid grid-cols-3 gap-0 mb-5 w-full"
                    role="group"
                  >
                    <button
                      type="button"
                      className="h-7 bg-rose-900 border border-gray-300 dark:border-white/20 rounded-l-md focus:z-10 focus:ring-0 focus:outline-none"
                    ></button>
                    <button
                      type="button"
                      className="h-7 bg-rose-700 border border-gray-300 dark:border-white/20 focus:z-10 focus:ring-0 focus:outline-none"
                    ></button>
                    <button
                      type="button"
                      className="h-7 bg-rose-500 border border-gray-300 dark:border-white/20 rounded-r-md focus:z-10 focus:ring-0 focus:outline-none"
                    ></button>
                  </div>
                  {/* <div className="grid grid-cols-3 gap-1 divide-x divide-gray-500/25">
                    <div className="flex flex-col items-center">
                    <button className="bg-teal-500 outline outline-offset-2 outline-[1.5px] border-white w-7 h-7 rounded-full flex items-center justify-center text-white/50 font-bold">
                      P
                      </button>
                    </div>
                    <div className="flex flex-col items-center">
                      <button className="bg-cyan-500 outline outline-offset-2 outline-[1.5px] border-white w-7 h-7 rounded-full flex items-center justify-center text-white/50 font-bold">
                      S
                      </button>
                    </div>
                    <div className="flex flex-col items-center">
                      <button className="bg-yellow-500 outline outline-offset-2 outline-[1.5px] border-white w-7 h-7 rounded-full flex items-center justify-center text-white/50 font-bold">
                      O
                      </button>
                    </div>
                  </div> */}

                  <div className="flex items-center gap-2 mt-5 mb-2">
                    <span className="text-dark dark:text-white/80 text-[13px]">
                      ตั้งค่าสีข้อความ
                    </span>
                    <div className="flex-1 border-b border-gray-500/50"></div>
                  </div>
                  <div
                    className="grid grid-cols-3 gap-0 mb-5 w-full"
                    role="group"
                  >
                    <button
                      type="button"
                      className="h-7 bg-lime-900 border border-gray-300 dark:border-white/20 rounded-l-md focus:z-10 focus:ring-0 focus:outline-none"
                    ></button>
                    <button
                      type="button"
                      className="h-7 bg-lime-700 border border-gray-300 dark:border-white/20 focus:z-10 focus:ring-0 focus:outline-none"
                    ></button>
                    <button
                      type="button"
                      className="h-7 bg-lime-500 border border-gray-300 dark:border-white/20 rounded-r-md focus:z-10 focus:ring-0 focus:outline-none"
                    ></button>
                  </div>

                  <div className="flex items-center gap-2 mt-5 mb-2">
                    <span className="text-dark dark:text-white/80 text-[13px]">
                      ตั้งค่าสีเพิ่มเติม
                    </span>
                    <div className="flex-1 border-b border-gray-500/50"></div>
                  </div>
                  <div
                    className="grid grid-cols-5 gap-0 mb-3 w-full"
                    role="group"
                  >
                    <button
                      type="button"
                      className="h-7 bg-rose-100 border border-gray-300 dark:border-white/20 rounded-l-md focus:z-10 focus:ring-0 focus:outline-none"
                    ></button>
                    <button
                      type="button"
                      className="h-7 bg-rose-200 border border-gray-300 dark:border-white/20 focus:z-10focus:ring-0 focus:outline-none"
                    ></button>
                    <button
                      type="button"
                      className="h-7 bg-rose-400 border border-gray-300 dark:border-white/20 focus:z-10focus:ring-0 focus:outline-none"
                    ></button>
                    <button
                      type="button"
                      className="h-7 bg-rose-600 border border-gray-300 dark:border-white/20 focus:z-10focus:ring-0 focus:outline-none"
                    ></button>
                    <button
                      type="button"
                      className="h-7 bg-rose-800 border border-gray-300 dark:border-white/20 rounded-r-md focus:z-10 focus:ring-0 focus:outline-none"
                    ></button>
                  </div>

                  <div
                    className="grid grid-cols-5 gap-0 mb-5 w-full"
                    role="group"
                  >
                    <button
                      type="button"
                      className="h-7 bg-lime-100 border border-gray-300 dark:border-white/20 rounded-l-md focus:z-10 focus:ring-0 focus:outline-none"
                    ></button>
                    <button
                      type="button"
                      className="h-7 bg-lime-200 border border-gray-300 dark:border-white/20 focus:z-10focus:ring-0 focus:outline-none"
                    ></button>
                    <button
                      type="button"
                      className="h-7 bg-lime-400 border border-gray-300 dark:border-white/20 focus:z-10focus:ring-0 focus:outline-none"
                    ></button>
                    <button
                      type="button"
                      className="h-7 bg-lime-600 border border-gray-300 dark:border-white/20 focus:z-10focus:ring-0 focus:outline-none"
                    ></button>
                    <button
                      type="button"
                      className="h-7 bg-lime-800 border border-gray-300 dark:border-white/20 rounded-r-md focus:z-10 focus:ring-0 focus:outline-none"
                    ></button>
                  </div>
                </li>
              )}
              {selectedMenuId === "pages" && (
                <li>
                  <div className="flex items-center gap-2 mt-5 mb-2">
                    <span className="text-dark dark:text-white/80 text-[13px]">
                      ชื่อหน้า
                    </span>
                    <div className="flex-1 border-b border-gray-500/50"></div>
                  </div>
                  <div className="flex items-center justify-center">
                  <input
                      id="pagename"
                      type="text"
                      placeholder="Page Name"
                      className="w-full rounded-md bg-gray-100 dark:bg-gray-50 px-2 py-2 text-[12px] text-gray-900 focus:ring-0 focus:outline-none"
                    />
                    <button
                      type="button"
                      className="rounded-md ml-1 px-2 py-2 text-[12px] font-medium text-white bg-gray-700 dark:bg-teal-300/80 border border-0 rounded-md hover:bg-gray-700/60 dark:hover:bg-teal-200/100 hover:text-white dark:hover:text-teal-500 focus:z-10 focus:ring-0 focus:ring-blue-400 focus:outline-none"
                    >
                      <span className="flex items-center justify-center material-icons-outlined text-[18px]">
                      save
                    </span>{" "}
                    </button>
                  </div>
                  
                  {/* <div className="flex items-center gap-2 mt-5 mb-2">
                    <span className="ttext-dark dark:text-white/80 text-[13px]">
                      หน้าทั้งหมด
                    </span>
                    <div className="flex-1 border-b border-gray-500/50"></div>
                  </div> */}
                  <div className="mt-2">
                  {pageNames.map((p,I)=>(
                      <Accordion expanded={expanded === `panel${I}`} key={I} id={p.id}  onChange={handleChangeExpand(`panel${I}`)} 
                      square
                      sx={(theme) => ({
                        boxShadow: 'none',
                        border: `1px solid ${theme.palette.divider}`, // กรอบรอบด้าน
                        borderRadius: 2,
                        padding:0,
                        '&::before': { display: 'none' },             // ตัดเส้นแบ่งของ MUI
                      })}>
                      <AccordionSummary
                          aria-controls={`panel${I}-content`}
                          id={`panel${I}-header`}
                          expandIcon={<ExpandMoreIcon />}
                          sx={{
                            minHeight: 28,
                            py: 0,
                            '&.Mui-expanded': { minHeight: 40 },
                            '& .MuiAccordionSummary-content': { my: 2.5 },                // ตัด margin บน-ล่าง
                            '& .MuiAccordionSummary-content.Mui-expanded': { mt: 1.5 },
                          }}
                        >
                          <Typography
                            component="span"
                            sx={{ fontSize: 12, lineHeight: 0, m: 0, pt: 0 }}            // ลด line-height และตัด margin/padding
                            className="text-gray-800 !m-0 !p-0 leading-none"
                          >
                            {p.name}
                          </Typography>
                        </AccordionSummary>
                      <AccordionDetails>
                        <Typography>
                          {accordionOptions.map((a,i)=>(
                            <button key={i} id={a.id} className={`${a.label === "หน้าหลัก" ? a.color[p.main]:a.color} py-2 px-2  text-[8px]`}>{a.label}</button>
                          ))}
                         
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  ))}
        

    

                  </div>

                  <div
                    className="grid grid-cols-3 gap-0 mb-5 w-full"
                    role="group"
                  >
                  </div>
                  {/* <div className="grid grid-cols-3 gap-1 divide-x divide-gray-500/25">
                    <div className="flex flex-col items-center">
                    <button className="bg-teal-500 outline outline-offset-2 outline-[1.5px] border-white w-7 h-7 rounded-full flex items-center justify-center text-white/50 font-bold">
                      P
                      </button>
                    </div>
                    <div className="flex flex-col items-center">
                      <button className="bg-cyan-500 outline outline-offset-2 outline-[1.5px] border-white w-7 h-7 rounded-full flex items-center justify-center text-white/50 font-bold">
                      S
                      </button>
                    </div>
                    <div className="flex flex-col items-center">
                      <button className="bg-yellow-500 outline outline-offset-2 outline-[1.5px] border-white w-7 h-7 rounded-full flex items-center justify-center text-white/50 font-bold">
                      O
                      </button>
                    </div>
                  </div> */}
                </li>
              )}



            </ul>
          </nav>
        </aside>

        {/* Main column */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Topbar */}
          <header className="h-16 shrink-0 flex items-center gap-3 px-3 sm:px-6 border-b border-slate-200 dark:border-white/10 bg-white/80 backdrop-blur dark:bg-gray-900/70">
            <button
              className="sm:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-white/80"
              onClick={() => setMobileOpen((s) => !s)}
              aria-label="Toggle navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <button
              className="hidden sm:inline-flex p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-white/80"
              onClick={() => setNavOpen((s) => !s)}
              aria-label="Collapse navigation"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="inline-flex" role="group">
              <button
                type="button"
                className="px-4 py-1 text-[13px] font-medium text-white bg-gray-700 dark:bg-teal-300/80 border border-0 rounded-l-md hover:bg-gray-700/60 dark:hover:bg-teal-200/100 hover:text-white dark:hover:text-teal-500 focus:z-10 focus:ring-0 focus:outline-none"
              >
                โหมดออกแบบ
              </button>
              <button
                type="button"
                className="px-4 py-1 text-[13px] font-medium text-gray-500 dark:text-white/40 bg-gray-200 dark:bg-white/20 border border-0 rounded-r-md hover:bg-gray-400/80 dark:hover:bg-white/80 hover:text-neutral-500 focus:z-10 focus:ring-0 focus:outline-none"
              >
                โหมดแก้ไข
              </button>
            </div>

            <div className="className flex text-[13px] flex items-center">
              <span className="material-icons-outlined text-[24px] px-2 text-gray-700 dark:text-teal-300/80">
                article
              </span>
              <span className="text-gray-700/80 dark:text-white/60">
                หน้าหลัก
              </span>
            </div>

            <div className="absolute left-1/2 -translate-x-1/2 flex items-center divide-x divide-gray-700 divide-solid">
              <div className="material-icons-outlined text-[24px] px-3 text-gray-700 dark:text-teal-300/80 cursor-pointer">
                computer
              </div>
              <div className="material-icons-outlined text-[20px] px-2 text-gray-700/20 dark:text-white/30 cursor-pointer">
                smartphone
              </div>
            </div>

            <div className="ml-auto" />

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-1 text-[13px] font-medium text-white bg-gray-700 dark:bg-teal-300/80 border border-0 rounded-md hover:bg-gray-700/60 dark:hover:bg-teal-200/100 hover:text-white dark:hover:text-teal-500 focus:z-10 focus:ring-0 focus:ring-blue-400 focus:outline-none"
              >
                <span className="material-icons-outlined text-[18px]">
                  public
                </span>{" "}
                เผยแพร่
              </button>
              <button
                onClick={() => setIsDark((s) => !s)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
                aria-label="Toggle theme"
              >
                {isDark ? (
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

          {/* Content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            <h1 className="text-xl sm:text-2xl font-semibold mb-3">
              {activeItem} Dashboard
            </h1>
            {/* Canvas สำหรับวาง element */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="relative min-h-[600px] rounded-xl border border-white/10 bg-white/5"
            >
              {/* วาง nodes แบบ absolute ตามตำแหน่ง drop */}

              {layouts.length > 0 &&
                layouts.map((l, I) => (
                  <div
                    className="border-[1px] border-dashed border-gray-600"
                    key={I}
                  >
                    <div className="container mx-auto">
                      <div className="grid grid-cols-3 py-5  gap-4 justify-center">
                        {l.map((_, i) => (
                          <div
                            key={i}
                            className="col col-span-1 border-[1px] border-dashed border-gray-600 flex h-[200px] justify-center items-center text-center"
                          >
                            Grid{I}-Col{i}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </main>

          {/* Footer */}
          <footer className="h-12 shrink-0 border-t border-slate-200 dark:border-white/10 bg-white/80 backdrop-blur dark:bg-gray-900/70 px-4 sm:px-6 flex items-center justify-between text-xs text-slate-600 dark:text-white/60">
            <span>
              © {new Date().getFullYear()} WebBuilder. All rights reserved.
            </span>
            <div className="flex items-center gap-3">
              <a
                className="hover:text-slate-900 dark:hover:text-white"
                href="#"
              >
                Privacy
              </a>
              <span className="opacity-40">•</span>
              <a
                className="hover:text-slate-900 dark:hover:text-white"
                href="#"
              >
                Terms
              </a>
              <span className="opacity-40">•</span>
              <a
                className="hover:text-slate-900 dark:hover:text-white"
                href="#"
              >
                Document
              </a>
            </div>
          </footer>
        </div>
      </div>

      {/* Mobile sheet nav */}
      {mobileOpen && (
        <div
          className="sm:hidden fixed inset-0 z-50 bg-black/60"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-gray-900 text-slate-900 dark:text-white border-r border-slate-200 dark:border-white/10 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">Navigation</span>
              <button
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
                onClick={() => setMobileOpen(false)}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-white/40 px-2 mt-2 mb-1">
              {currentMenu?.title || "Dashboards"}
            </div>
            <ul>
              {currentMenu?.items.map((item) => (
                <li key={item}>
                  <button
                    onClick={() => {
                      setActiveItem(item);
                      setMobileOpen(false);
                    }}
                    className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 ${
                      activeItem === item
                        ? "text-slate-900 dark:text-white"
                        : "text-slate-600 dark:text-white/70"
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-white/40" />
                    <span>{item}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function IconButton({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group relative p-2 rounded-lg hover:bg-slate-100 text-slate-700 dark:text-white/70 dark:hover:bg-white/5"
      aria-label={label}
    >
      <Icon className="h-5 w-5 group-hover:text-slate-900 dark:group-hover:text-white" />
      <span className="pointer-events-none absolute left-11 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-800 text-white dark:bg-gray-800 px-2 py-1 text-xs opacity-0 group-hover:opacity-100 border border-slate-700/40 dark:border-white/10">
        {label}
      </span>
    </button>
  );
}

function getMenuIcon(key) {
  const icons = {
    home: Home,
    elements: FileText,
    team: Users,
    settings: Settings,
    gifts: Gift,
    reports: BarChart3,
    apps: Grid3X3,
    data: Database,
    map: MapPin,
    swatch: SwatchBook,
  };
  return icons[key] || Home;
}
