import React, { useEffect, useMemo, useState, useRef, use } from "react";
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
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { SketchPicker } from "react-color";
import lodash, { isNull, set, update } from "lodash";
import { getTheme, updateTheme } from "../../Functions/theme";


function Navbar({ handleDragElement,isDark }) {
  const [selectedMenuId, setSelectedMenuId] = useState("home");
  const [navOpen, setNavOpen] = useState(false);
  const [theme, setTheme] = useState({
    _id: null,
    textHeading: "",
    text: "",
    mainColor: [],
    textColor: [],
    otherColor: [],
  });
  const [updated, setUpdated] = useState(0);

  const loadTheme = () => {
    getTheme("68d37327bedb0efab7dacafb")
      .then((res) => {
        setTheme(res.data);
        setData({
          ...data,
          Theme: {
            ...data.Theme,
            mainColor: res.data.mainColor,
            textColor: res.data.textColor,
            otherColor: res.data.otherColor,
          },
        });
        setHeading(res.data.textHeading);
        setText(res.data.text);
      })
      .catch((err) => console.log(err));
  };

  const pickerStyles = {
    default: {
      cursor: "pointer",
      picker: {
        background: isDark === "dark" ? "white" : "#101827",
        borderRadius: "10px",
        boxShadow: "none",
        padding: "12px",
        width: "180px",
        height: "200px",
      },
      saturation: {
        borderRadius: "12px",
        overflow: "hidden",
      },
      controls: {
        marginTop: "12px",
        color: "#e5e5e5",
      },
      sliders: {
        padding: "0",
      },
      hue: {
        height: "12px",
        borderRadius: "999px",
      },
      alpha: {
        height: "12px",
        borderRadius: "999px",
      },
      color: {
        borderRadius: "8px",
        overflow: "hidden",
        display: "none",
      },

      activeColor: {
        borderRadius: "8px",
        overflow: "hidden",
        display: "none",
      },
      control: {
        marginBottom: "6px",
      },
      /* ช่อง input ของ react-color */
      input: {
        background: "#111111",
        borderColor: "#333333",
        boxShadow: "inset 0 0 0 1px #333333",
        color: "#e5e5e5",
        display: "none",
      },
      /* กล่อง swatches (ถ้ามีใช้) */
      swatches: {
        background: "#0b0b0b",
        borderTop: "1px solid #222222",
        display: "none",
      },
    },
  };

  const [data, setData] = useState({
    Elements: [
      { label: "Column", icon: "dashboard_customize" },
      { label: "Menu", icon: "reset_tv" },
      { label: "Header", icon: "center_focus_weak" },
      { label: "Image", icon: "photo_size_select_actual" },
      { label: "Heading", icon: "auto_awesome" },
      { label: "Text", icon: "format_size" },
      { label: "Button", icon: "link" },
      { label: "Button Dual", icon: "smart_button" },
      { label: "iCons", icon: "sentiment_very_satisfied" },
      { label: "Carousel", icon: "more_horiz" },
      { label: "Gallery", icon: "add_photo_alternate" },
      { label: "Youtube", icon: "slow_motion_video" },
      { label: "List iTem", icon: "storage" },
      { label: "Table", icon: "table_chart" },
      { label: "Form", icon: "forward_to_inbox" },
      { label: "Card", icon: "confirmation_number" },
      { label: "Divider", icon: "insert_page_break" },
      { label: "Footer", icon: "power_input" }
      
    ],
    Theme: {
      headingOptions: [
        { value: "font-kanit", label: "Kanit", id: "0" },
        { value: "font-bai-jamjuree", label: "Jamjuree", id: "1" },
        { value: "font-merriweather", label: "Merriweather", id: "2" },
        {
          value: "font-monsieur-la-doulaise",
          label: "Monsieur La Doulaise",
          id: "3",
        },
        { value: "font-montserrat", label: "Montserrat", id: "4" },
        { value: "font-oswald", label: "Oswald", id: "5" },
        { value: "font-raleway", label: "Raleway", id: "6" },
      ],
      textOptions: [
        { value: "font-kanit", label: "Kanit", id: "0" },
        { value: "font-bai-jamjuree", label: "Jamjuree", id: "1" },
        { value: "font-merriweather", label: "Merriweather", id: "2" },
        {
          value: "font-monsieur-la-doulaise",
          label: "Monsieur La Doulaise",
          id: "3",
        },
        { value: "font-montserrat", label: "Montserrat", id: "4" },
        { value: "font-oswald", label: "Oswald", id: "5" },
        { value: "font-raleway", label: "Raleway", id: "6" },
      ],
      mainColor: ["#881337", "#be123c", "#f43f5e"],
      textColor: ["#365314", "#4d7c0f", "#84cc16"],
      otherColor: [
        "#ffe4e6",
        "#fecdd3",
        "#fb7185",
        "#e11d48",
        "#9f1239",
        "#ecfccb",
        "#d9f99d",
        "#a3e635",
        "#65a30d",
        "#3f6212",
      ],
    },
  });

  const [heading, setHeading] = useState(data.Theme.headingOptions[0]);
  const [text, setText] = useState(data.Theme.textOptions[0]);
  const [colorPicker, setColorPicker] = useState(null);
  const colorPickerRef = useRef(null);

  const handleColorPicker = (pickerName) => {
    if (colorPicker === pickerName) {
      setColorPicker(null);
    } else {
      setColorPicker(pickerName);
    }
  };

  const RGBA_2_HEX = (rgba) => {
    let { r, g, b, a } = rgba;
    r = Math.round(Math.min(Math.max(0, r), 255));
    g = Math.round(Math.min(Math.max(0, g), 255));
    b = Math.round(Math.min(Math.max(0, b), 255));
    a = Math.round(Math.min(Math.max(0, a), 1) * 255);
    function toHex(n) {
      const code = n.toString(16).padStart(2, "0");
      return code;
    }

    if (a === 255) {
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    } else {
      return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(a)}`;
    }
  };

  function HEX_2_RGBA(hex) {
    let r = 0,
      g = 0,
      b = 0;

    // กรณี #RGB
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    }
    // กรณี #RRGGBB
    else if (hex.length === 7) {
      r = parseInt(hex.slice(1, 3), 16);
      g = parseInt(hex.slice(3, 5), 16);
      b = parseInt(hex.slice(5, 7), 16);
    }

    return { r, g, b, a: 1 };
  }

  const renderRGBA = (rgba) => {
    let { r, g, b, a } = rgba;
    return `rgba(${r},${g},${b},${a})`;
  };

  const setColor = (e, typeColor, i) => {
    if (e.source === "rgb") return;
    const newColor = [...data.Theme[typeColor]];
    newColor[i] = e.hex;
    setData({ ...data, Theme: { ...data.Theme, [typeColor]: newColor } });
    changeTheme(typeColor, newColor);
  };

  const setFont = (typeFont, newFont) => {
    if (typeFont === "textHeading") {
      setHeading(newFont);
    } else if (typeFont === "text") {
      setText(newFont);
    }
    changeTheme(typeFont, newFont);
  };

  const changeTheme = (type, newThemeData) => {
    setTheme({ ...theme, [type]: newThemeData });
    setUpdated((prev) => prev + 1);
  };

  useEffect(() => {
    loadTheme();
  }, []);

  useEffect(() => {
    if (updated !== 0) {
      updateTheme(theme._id, theme)
        .then((res) => {
          loadTheme();
        })
        .catch((err) => console.log(err));
    }
  }, [updated]);

  return (
    <>
      <aside className="sm:flex flex-col items-center gap-4 py-4 w-12 border-r border-slate-200 dark:border-white/10 bg-white/90 dark:bg-gray-950/70">
        <div className="h-10 w-10 grid place-items-center rounded-lg bg-slate-100 dark:bg-white/5">
          <Layers className="h-5 w-5 text-slate-700 dark:text-white/90" />
        </div>
        <IconButton
          icon={Layers}
          label="Elements"
          onClick={() => {
            setSelectedMenuId("Elements");
            setNavOpen(true);
          }}
        />
        <IconButton
          icon={SwatchBook}
          label="Theme"
          onClick={() => {
            setSelectedMenuId("Theme");
            setNavOpen(true);
          }}
        />
        <IconButton
          icon={FileText}
          label="Pages"
          onClick={() => {
            setSelectedMenuId("Pages");
            setNavOpen(true);
          }}
        />
        <IconButton
          icon={Users}
          label="Team"
          onClick={() => {
            setSelectedMenuId("Team");
            setNavOpen(true);
          }}
        />
        <IconButton
          icon={Settings}
          label="Settings"
          onClick={() => {
            setSelectedMenuId("Settings");
            setNavOpen(true);
          }}
        />
        <IconButton
          icon={Gift}
          label="Gifts"
          onClick={() => {
            setSelectedMenuId("Gifts");
            setNavOpen(true);
          }}
        />
        <IconButton
          icon={BarChart3}
          label="Reports"
          onClick={() => {
            setSelectedMenuId("Reports");
            setNavOpen(true);
          }}
        />
        <IconButton
          icon={Grid3X3}
          label="Apps"
          onClick={() => {
            setSelectedMenuId("Apps");
            setNavOpen(true);
          }}
        />
        <IconButton
          icon={Database}
          label="Data"
          onClick={() => {
            setSelectedMenuId("Data");
            setNavOpen(true);
          }}
        />
        <IconButton
          icon={MapPin}
          label="Map"
          onClick={() => {
            setSelectedMenuId("Map");
            setNavOpen(true);
          }}
        />
        <div className="mt-auto">
          <IconButton icon={LogOut} label="Logout" onClick={() => {}} />
        </div>
      </aside>

      <aside
        className={`${
          navOpen ? "w-60" : "w-0"
        } sm:block transition-all duration-300 overflow-hidden bg-white dark:bg-gray-900/80 border-r border-slate-200 dark:border-white/10`}
      >
        <div className="px-6 py-5 flex items-center justify-between">
          <div className="font-semibold tracking-wide">{selectedMenuId}</div>
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
            <li>
              {selectedMenuId === "Elements" && (
                <div className="grid grid-cols-2 gap-3 mx-0">
                  {data.Elements.map((items, index) => (
                    <div
                      className="bg-gray-50 dark:bg-white/5 rounded-md text-center px-3 py-2 cursor-grab active:cursor-grabbing"
                      draggable
                      key={index}
                      onDragStart={(e) => {
                
                        handleDragElement(items.label)
                      
                      }}
                    >
                      {" "}
                      <span className="material-icons-outlined text-[30px] px-2 dark:text-white/50">
                        {items.icon}
                      </span>
                      <p className="text-[12px] dark:text-white/40 antialiased">
                        {items.label}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {selectedMenuId === "Theme" && (
                <>
                  <ListOption
                    font={heading}
                    onChange={setFont}
                    options={data.Theme.headingOptions}
                    label="ตัวอักษร - หัวข้อ"
                    type="textHeading"
                  />
                  <ListOption
                    font={text}
                    onChange={setFont}
                    options={data.Theme.textOptions}
                    label="ตัวอักษร - ข้อความ"
                    type="text"
                  />
                  <ColorGroup
                    colorPicker={colorPicker}
                    colorPickerRef={colorPickerRef}
                    handleColorPicker={handleColorPicker}
                    label="ตั้งค่าสีหลัก"
                    name="Main"
                    colors={data.Theme.mainColor}
                    setColor={setColor}
                    type="mainColor"
                    style={pickerStyles}
                  />
                  <ColorGroup
                    colorPicker={colorPicker}
                    colorPickerRef={colorPickerRef}
                    handleColorPicker={handleColorPicker}
                    label="ตั้งค่าสีข้อความ"
                    name="Text"
                    colors={data.Theme.textColor}
                    setColor={setColor}
                    type="textColor"
                    style={pickerStyles}
                  />
                  <ColorGroup
                    colorPicker={colorPicker}
                    colorPickerRef={colorPickerRef}
                    handleColorPicker={handleColorPicker}
                    label="ตั้งค่าสีเพิ่มเติม"
                    name="Other"
                    colors={data.Theme.otherColor}
                    setColor={setColor}
                    type="otherColor"
                    hex_2_rgba={HEX_2_RGBA}
                    style={pickerStyles}
                  />
                </>
              )}
            </li>
          </ul>
        </nav>
      </aside>
    </>
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

function MainLabel({ label }) {
  return (
    <div className="flex items-center gap-2 mt-5 mb-2">
      <span className="ttext-dark dark:text-white/80 text-[13px]">{label}</span>
      <div className="flex-1 border-b border-gray-500/50"></div>
    </div>
  );
}

function ListOption({ font, onChange, options, label, type }) {
  return (
    <>
      <MainLabel label={label} />

      <Listbox value={font} onChange={(e) => onChange(type, e)}>
        <div className="relative mt-2">
          <ListboxButton className="grid w-full cursor-default grid-cols-1 rounded-md bg-gray-900 dark:bg-white text-gray-300 dark:text-gray-900 py-1.5 pr-2 pl-3 text-left outline-1 -outline-offset-1 outline-gray-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 text-[12px] hover:cursor-pointer">
            <span className={`col-start-1 row-start-1 flex items-center gap-3 pr-6 ${font.value}`}>
              <span className={`block truncate `}></span>
              {font.label}
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
            {options.map((option, i) => (
              <ListboxOption
                value={option}
                key={i}
                id={option.id}
                className={`group relative cursor-default py-2 pr-9 pl-3 text-gray-200 dark:text-gray-900 select-none 
                  data-focus:bg-indigo-600 data-focus:text-white data-focus:outline-hidden hover:cursor-pointer
                  ${
                    i !== 0
                      ? "border-dotted border-t border-gray-600 dark:border-gray-200"
                      : ""
                  }
                `}
              >
                <div className="flex items-center">
                  <span
                    className={`ml-3 block truncate font-normal group-data-selected:font-semibold ${option.value}`}
                  >
                    {option.label}
                  </span>
                </div>

                {font.id === option.id && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <CheckCircleIcon
                      aria-hidden="true"
                      className="size-5 !text-gray-400 dark:!text-gray-800"
                    />
                  </span>
                )}
              </ListboxOption>
            ))}
          </ListboxOptions>
        </div>
      </Listbox>
    </>
  );
}

function ColorGroup({
  colorPicker,
  colorPickerRef,
  handleColorPicker,
  label,
  name,
  colors,
  setColor,
  type,
  style,
}) {
  return (
    <>
      <MainLabel label={label} />
      <div
        className={`grid grid-cols-${
          colors.length < 5 ? colors.length : 5
        } gap-[5px_0px] mb-5 w-full relative inline-block`}
        role="group"
      >
        {colors.map((color, i) => (
          <div key={i}>
            <button
              type="button"
              style={{ backgroundColor: color }}
              className={`h-7  border border-gray-300 dark:border-white/20 ${
                i === 0 || i % 5 === 0 ? "rounded-l-md" : ""
              } ${
                i === colors.length - 1 || (i + 1) % 5 === 0
                  ? "rounded-r-md"
                  : ""
              } focus:z-10 focus:ring-0 focus:outline-none w-full`}
              onClick={() => {
                handleColorPicker(`${name}${i + 1}`);
              }}
            ></button>
            {colorPicker === `${name}${i + 1}` && (
              <div
                ref={colorPickerRef}
                className="absolute inline-block top-full right-0 z-10  mt-[3px]"
              >
                <SketchPicker
                  color={color}
                  onChange={(e) => {
                    setColor(e, type, i);
                  }}
                  disableAlpha
                  presetColors={[]}
                  styles={style}
                />
                <div
                  className="absolute inset-x-0 bottom-0 rounded-b-[10px] bg-[#101827] dark:bg-white mt-3 flex items-center gap-2 flex items-center justify-center "
                  style={{
                    height: 50, // ปรับตามที่พอดีกับเครื่องคุณ (60–72px มักจะพอดี)
                    zIndex: 10, // ให้อยู่เหนือ input ของ react-color
                    pointerEvents: "auto", // กันคลิกไปโดน input ใต้กล่อง
                  }}
                >
                  <div className="relative w-auto rounded-xl border border-zinc-700 bg-zinc-200 dark:bg-zinc-800 px-2 py-1 text-sm text-zinc-100 focus-within:border-zinc-500 flex items-center justify-center w-[180px] mb-[5px]">
                    {/* ไอคอน # */}
                    <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                      <span className="text-zinc-600 dark:text-zinc-400">#</span>
                    </div>

                    {/* ช่องกรอก HEX */}
                    <input
                      type="text"
                      value={color.replace("#", "").toUpperCase()}
                      onChange={(e) => {
                        let v = e.target.value.trim();
                        if (!v.startsWith("#")) v = "#" + v;
                        if (/^#([0-9A-Fa-f]{3}){1,2}$/.test(v))
                          setColor({ hex: v }, type, i);
                        else setColor({ hex: v }, type, i); // อนุญาตให้พิมพ์ค้างไว้ได้ แล้วค่อย valid ทีหลัง
                      }}
                      className="w-full pl-6  bg-transparent outline-none text-zinc-800 dark:text-zinc-200 text-[12px]"
                      spellCheck={false}
                    />

                    {/* swatch สี */}
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                      <div
                        className="h-5 w-5 rounded-full border border-zinc-200 "
                        style={{ backgroundColor: color }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export default Navbar;
