import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Button, ButtonGroup, Stack } from "@mui/material";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Trash2,
} from "lucide-react";
import lodash from "lodash";
import ServiceIcon from "../ServiceIcon";
import IconAwsome from "../IconAwsome";
import Field from "../HTML/Field";
import MainLabel from "../HTML/MainLabel";
import Range from "../HTML/Range";
import { swatchSelectedCheckClassName } from "../Layouts/Elements/swatchCheckClass";
import { THEME_PANEL_BASIC_COLOR_SWATCHES } from "../themePanelBasicColors";

const AccordionActiveColorSelectLine = ({
  prev,
  next,
  value,
  prevAria,
  nextAria,
  groupAria,
}) => (
  <div
    className="flex items-center justify-between gap-0.5 rounded-lg border border-slate-200 bg-white px-0.5 py-0.5 dark:border-white/10 dark:bg-slate-800/90"
    role="group"
    aria-label={groupAria}
  >
    <button
      type="button"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
      onClick={prev}
      aria-label={prevAria}
    >
      <ChevronLeft className="size-4" strokeWidth={2} aria-hidden />
    </button>
    <span className="min-w-0 flex-1 truncate text-center text-[11px] font-normal text-slate-800 dark:text-white/90">
      {value}
    </span>
    <button
      type="button"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
      onClick={next}
      aria-label={nextAria}
    >
      <ChevronRight className="size-4" strokeWidth={2} aria-hidden />
    </button>
  </div>
);

const ACCORDION_ACTIVE_COLOR_MODES = [
  { value: "tab", label: "สีแท็บ" },
  { value: "text", label: "สีข้อความ" },
  { value: "border", label: "สีกรอบ" },
  { value: "toggle", label: "สีปุ่มเปิด - ปิด" },
];
const ACCORDION_INACTIVE_COLOR_MODES = ACCORDION_ACTIVE_COLOR_MODES;

const ACCORDION_HEADER_LABEL_OPTIONS = [
  { value: "text", label: "ข้อความ" },
  { value: "iconText", label: "ไอคอน + ข้อความ" },
];

const ACCORDION_ITEM_LIST_MAX = 12;
const ACCORDION_RADIUS_MAX = 40;

const OPTION_CHIP_RADIUS = "0.375rem";
const CHIP_BORDER = "#e2e8f0";
const CHIP_BORDER_DARK = "rgba(255, 255, 255, 0.1)";
const CHIP_BG = "#ffffff";
const CHIP_BG_HOVER = "#f8fafc";
const CHIP_BG_DARK = "rgba(30, 41, 59, 0.9)";
const CHIP_BG_DARK_HOVER = "rgba(30, 41, 59, 1)";

const sectionLayoutGroupButtonSx = (selected, accent) => {
  const a = accent || "#0d9488";
  return {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    minHeight: 32,
    py: 0,
    px: 0.5,
    textTransform: "none",
    lineHeight: 1.2,
    boxShadow: "none",
    ...(selected
      ? {
          backgroundColor: a,
          color: "#fff",
          borderColor: "transparent",
          "&:hover": {
            backgroundColor: a,
            borderColor: "transparent",
          },
        }
      : {
          color: "#1e293b",
          borderColor: `${CHIP_BORDER} !important`,
          backgroundColor: CHIP_BG,
          "&:hover": {
            borderColor: `${CHIP_BORDER} !important`,
            backgroundColor: CHIP_BG_HOVER,
          },
          ".dark &": {
            color: "#f1f5f9",
            borderColor: `${CHIP_BORDER_DARK} !important`,
            backgroundColor: CHIP_BG_DARK,
            "&:hover": {
              borderColor: `${CHIP_BORDER_DARK} !important`,
              backgroundColor: CHIP_BG_DARK_HOVER,
            },
          },
        }),
    "&.Mui-focusVisible": {
      outline: `2px solid ${a}`,
      outlineOffset: 1,
      boxShadow: "none",
    },
    "& .MuiTouchRipple-child": {
      backgroundColor: a,
    },
  };
};

const sectionLayoutGroupRootSx = {
  width: "100%",
  boxShadow: "none",
  "& .MuiButton-root": {
    boxShadow: "none",
  },
  "& .MuiButtonGroup-grouped": {
    borderRadius: "0 !important",
  },
  "& .MuiButtonGroup-grouped:first-of-type": {
    borderTopLeftRadius: `${OPTION_CHIP_RADIUS} !important`,
    borderBottomLeftRadius: `${OPTION_CHIP_RADIUS} !important`,
  },
  "& .MuiButtonGroup-grouped:last-of-type": {
    borderTopRightRadius: `${OPTION_CHIP_RADIUS} !important`,
    borderBottomRightRadius: `${OPTION_CHIP_RADIUS} !important`,
  },
  "& .MuiButtonGroup-grouped.MuiButton-outlined": {
    borderColor: `${CHIP_BORDER} !important`,
  },
  "& .MuiButtonGroup-grouped.MuiButton-outlined:not(:last-of-type)": {
    borderRightColor: `${CHIP_BORDER} !important`,
  },
  ".dark & .MuiButtonGroup-grouped.MuiButton-outlined": {
    borderColor: `${CHIP_BORDER_DARK} !important`,
  },
  ".dark & .MuiButtonGroup-grouped.MuiButton-outlined:not(:last-of-type)": {
    borderRightColor: `${CHIP_BORDER_DARK} !important`,
  },
};

const FA_PREFIXES = new Set(["fas", "fab", "far"]);

const normalizeAccordionFaIcon = (raw) => {
  if (!raw || typeof raw !== "object") return { name: null, type: null };
  const name = raw.name;
  const type = raw.type;
  if (name == null || type == null) return { name: null, type: null };
  if (typeof name === "string" && typeof type === "string" && FA_PREFIXES.has(type)) {
    return { name, type };
  }
  return { name: null, type: null };
};

const normalizeAccordionItems = (itemsRaw) => {
  if (!Array.isArray(itemsRaw) || itemsRaw.length === 0) {
    return [
      {
        id: "acc-1",
        label: "Section 1",
        content: "Content for section 1 goes here.",
        disabled: false,
        elements: [],
        faIcon: { name: null, type: null },
      },
      {
        id: "acc-2",
        label: "Section 2",
        content: "Content for section 2 goes here.",
        disabled: false,
        elements: [],
        faIcon: { name: null, type: null },
      },
      {
        id: "acc-3",
        label: "Section 3",
        content: "Content for section 3 goes here.",
        disabled: false,
        elements: [],
        faIcon: { name: null, type: null },
      },
    ];
  }
  return itemsRaw.map((item, i) => ({
    ...(item && typeof item === "object" ? item : {}),
    id: String(item?.id || `acc-${i + 1}`),
    label:
      typeof item?.label === "string" ? item.label : `Section ${i + 1}`,
    content:
      typeof item?.content === "string"
        ? item.content
        : `Content for section ${i + 1} goes here.`,
    disabled: Boolean(item?.disabled),
    elements: Array.isArray(item?.elements) ? item.elements : [],
    faIcon: normalizeAccordionFaIcon(item?.faIcon),
  }));
};

const chipSelected = (active, chip) => {
  if (active && typeof active === "object" && chip && typeof chip === "object") {
    return lodash.isEqual(active, chip);
  }
  if (typeof active === "string" && typeof chip === "string") {
    return active.toLowerCase() === chip.toLowerCase();
  }
  return false;
};

const AccordionElementOffcanvas = ({
  element,
  onUpdate,
  close,
  textColor = "#0d9488",
  darkMode = "light",
  theme,
}) => {
  const layoutSyncRafRef = useRef(0);
  const pendingLayoutRef = useRef(null);
  const elementRef = useRef(element);
  elementRef.current = element;

  const scheduleLayoutSync = useCallback(
    (next) => {
      const base = elementRef.current || {};
      const merged = {
        ...base,
        ...next,
        type: next?.type ?? base?.type ?? "acc",
        id: next?.id != null ? next.id : base?.id,
      };
      pendingLayoutRef.current = lodash.cloneDeep(merged);
      if (layoutSyncRafRef.current) cancelAnimationFrame(layoutSyncRafRef.current);
      layoutSyncRafRef.current = requestAnimationFrame(() => {
        layoutSyncRafRef.current = 0;
        const snapshot = pendingLayoutRef.current;
        pendingLayoutRef.current = null;
        if (snapshot) onUpdate?.(snapshot);
      });
    },
    [onUpdate]
  );

  const [data, setData] = useState(element);
  const [iconPickerItemId, setIconPickerItemId] = useState(null);

  useEffect(() => {
    if (!element?.id) return;
    setData((prev) => {
      if (!prev || prev.id !== element.id) return element;
      return prev;
    });
  }, [element]);

  useEffect(() => {
    setIconPickerItemId(null);
  }, [element?.id]);

  useEffect(
    () => () => {
      if (layoutSyncRafRef.current) cancelAnimationFrame(layoutSyncRafRef.current);
    },
    []
  );

  const patch = (partial) => {
    setData((prev) => {
      const next = { ...prev, ...partial };
      scheduleLayoutSync(next);
      return next;
    });
  };

  const accordionItems = useMemo(
    () => normalizeAccordionItems(data?.accordionItems),
    [data?.accordionItems]
  );
  const resolvedActiveId = useMemo(() => {
    const raw = data?.accordionActiveId;
    return accordionItems.some((t) => t.id === raw) ? raw : accordionItems[0]?.id;
  }, [accordionItems, data?.accordionActiveId]);

  const patchAccordionItems = (updater) => {
    setData((prev) => {
      const current = normalizeAccordionItems(prev?.accordionItems);
      const latestFromLayout = normalizeAccordionItems(elementRef.current?.accordionItems);
      const latestById = new Map(
        latestFromLayout.map((it) => [String(it?.id || ""), it])
      );
      const nextItems = updater(current).map((item) => {
        const latest = latestById.get(String(item?.id || ""));
        return {
          ...(latest && typeof latest === "object" ? latest : {}),
          ...(item && typeof item === "object" ? item : {}),
          elements: Array.isArray(latest?.elements)
            ? latest.elements
            : Array.isArray(item?.elements)
              ? item.elements
              : [],
        };
      });
      const nextActive = nextItems.some((t) => t.id === prev?.accordionActiveId)
        ? prev?.accordionActiveId
        : nextItems[0]?.id;
      const next = {
        ...prev,
        accordionItems: nextItems,
        accordionActiveId: nextActive,
      };
      scheduleLayoutSync(next);
      return next;
    });
  };

  const addItem = () => {
    patchAccordionItems((current) => {
      if (current.length >= ACCORDION_ITEM_LIST_MAX) return current;
      const nextIdx = current.length + 1;
      return [
        ...current,
        {
          id: `acc-${Date.now()}-${nextIdx}`,
          label: `Section ${nextIdx}`,
          content: `Content for section ${nextIdx} goes here.`,
          disabled: false,
          elements: [],
          faIcon: { name: null, type: null },
        },
      ];
    });
  };

  const removeItem = (itemId) => {
    patchAccordionItems((current) => {
      if (current.length <= 1) return current;
      return current.filter((it) => it.id !== itemId);
    });
  };

  const headerStyle =
    data?.accordionTabLabelStyle === "iconText" ? "iconText" : "text";

  const labelFontSize = Math.max(
    10,
    Math.min(22, Number(data?.accordionLabelFontSize) || 13)
  );
  const tabHeight = Math.max(32, Math.min(96, Number(data?.accordionTabHeight) || 48));
  const borderWidthRaw = Number(data?.accordionBorderWidth);
  const borderWidth = Math.max(
    0,
    Math.min(8, Number.isFinite(borderWidthRaw) ? borderWidthRaw : 1)
  );
  const radiusRaw = Number(data?.accordionItemRadius);
  const radius = Math.max(
    0,
    Math.min(
      ACCORDION_RADIUS_MAX,
      Number.isFinite(radiusRaw) ? radiusRaw : 8
    )
  );
  const marginTop = Math.max(0, Math.min(80, Number(data?.accordionMarginTop) || 8));
  const marginBottom = Math.max(0, Math.min(80, Number(data?.accordionMarginBottom) || 8));

  const allColors = useMemo(() => {
    if (!theme?.mainColor?.length) return [];
    const mc = theme.mainColor.map((_, i) => ({ type: "mainColor", index: i }));
    const tc = (theme.textColor || []).map((_, i) => ({
      type: "textColor",
      index: i,
    }));
    const oc = (theme.otherColor || []).map((_, i) => ({
      type: "otherColor",
      index: i,
    }));
    const basic = THEME_PANEL_BASIC_COLOR_SWATCHES;
    return [...mc, ...tc, ...oc, ...basic];
  }, [theme]);

  const activeColorMode = ACCORDION_ACTIVE_COLOR_MODES.some(
    (m) => m.value === data?.accordionActiveColorMode
  )
    ? data?.accordionActiveColorMode
    : "tab";
  const activeColorModeLabel =
    ACCORDION_ACTIVE_COLOR_MODES.find((m) => m.value === activeColorMode)?.label ??
    "สีแท็บ";
  const activeModeOpacity =
    activeColorMode === "tab"
      ? Number(data?.accordionActiveTabColorOpacity) || 255
      : activeColorMode === "text"
        ? Number(data?.accordionActiveLabelColorOpacity) || 255
        : activeColorMode === "border"
          ? Number(data?.accordionActiveBorderColorOpacity) || 255
          : Number(data?.accordionActiveToggleColorOpacity) || 255;
  const currentActiveColorValue =
    activeColorMode === "tab"
      ? data?.accordionActiveTabColor
      : activeColorMode === "text"
        ? data?.accordionActiveLabelColor
        : activeColorMode === "border"
          ? data?.accordionActiveBorderColor
          : data?.accordionActiveToggleColor;

  const cycleActiveColorMode = (dir) => {
    const modes = ACCORDION_ACTIVE_COLOR_MODES.map((m) => m.value);
    const cur = modes.includes(data?.accordionActiveColorMode)
      ? data.accordionActiveColorMode
      : "tab";
    const i = Math.max(0, modes.indexOf(cur));
    patch({ accordionActiveColorMode: modes[(i + dir + modes.length) % modes.length] });
  };

  const inactiveColorMode = ACCORDION_INACTIVE_COLOR_MODES.some(
    (m) => m.value === data?.accordionInactiveColorMode
  )
    ? data?.accordionInactiveColorMode
    : "tab";
  const inactiveColorModeLabel =
    ACCORDION_INACTIVE_COLOR_MODES.find((m) => m.value === inactiveColorMode)?.label ??
    "สีแท็บ";
  const inactiveModeOpacity =
    inactiveColorMode === "tab"
      ? Number(data?.accordionInactiveTabColorOpacity) || 255
      : inactiveColorMode === "text"
        ? Number(data?.accordionInactiveLabelColorOpacity) || 255
        : inactiveColorMode === "border"
          ? Number(data?.accordionInactiveBorderColorOpacity) || 255
          : Number(data?.accordionInactiveToggleColorOpacity) || 255;
  const currentInactiveColorValue =
    inactiveColorMode === "tab"
      ? data?.accordionInactiveTabColor
      : inactiveColorMode === "text"
        ? data?.accordionInactiveLabelColor
        : inactiveColorMode === "border"
          ? data?.accordionInactiveBorderColor
          : data?.accordionInactiveToggleColor;

  const cycleInactiveColorMode = (dir) => {
    const modes = ACCORDION_INACTIVE_COLOR_MODES.map((m) => m.value);
    const cur = modes.includes(data?.accordionInactiveColorMode)
      ? data.accordionInactiveColorMode
      : "tab";
    const i = Math.max(0, modes.indexOf(cur));
    patch({ accordionInactiveColorMode: modes[(i + dir + modes.length) % modes.length] });
  };

  return (
    <aside className="flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden bg-white dark:bg-gray-900/80 border-r border-slate-200 dark:border-white/10">
      <div className="shrink-0 px-6 pt-5 pb-3 flex items-center justify-between bg-gray-100 dark:bg-gray-900/50">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 font-bold tracking-wide text-slate-800 dark:text-white/90">
            Accordion
          </span>
          <span className="inline-flex min-w-0 max-w-full items-center rounded-md border border-[#333333] bg-[#333333] px-2 py-0.5 text-[11px] font-mono font-bold leading-none text-white tabular-nums">
            <span className="truncate">{data?.id}</span>
          </span>
        </div>
        <button
          type="button"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-white/70"
          onClick={() => close(null, null, null)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <path fillRule="evenodd" d="M15.78 4.22a.75.75 0 010 1.06L10.06 11l5.72 5.72a.75.75 0 11-1.06 1.06l-6.25-6.25a.75.75 0 010-1.06l6.25-6.25a.75.75 0 011.06 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain px-4 pb-14 scroll-pb-10 w-full">
        <ul className="mt-4 pl-1 space-y-5">
          <li>
            <div className="mb-2 mt-1 flex items-center gap-2">
              <span className="shrink-0 text-[13px] font-semibold text-slate-700 dark:text-white/80">
                ประเภท
              </span>
              <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
            </div>
            <ButtonGroup
              fullWidth
              variant="outlined"
              disableElevation
              color="inherit"
              aria-label="ประเภทหัว Accordion"
              sx={sectionLayoutGroupRootSx}
            >
              {ACCORDION_HEADER_LABEL_OPTIONS.map((opt) => {
                const selected = headerStyle === opt.value;
                return (
                  <Button
                    key={opt.value}
                    color="inherit"
                    onClick={() => patch({ accordionTabLabelStyle: opt.value })}
                    sx={{
                      ...sectionLayoutGroupButtonSx(selected, textColor),
                      fontWeight: 400,
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "5px",
                        fontWeight: 400,
                      }}
                    >
                      {opt.label}
                    </Box>
                  </Button>
                );
              })}
            </ButtonGroup>
          </li>

          <li>
            <div className="grid grid-cols-2 gap-x-3 gap-y-4">
              <div className="min-w-0">
                <MainLabel label="ขนาดตัวอักษร" value={labelFontSize} mb={0} />
                <div className="px-0.5">
                  <Range
                    min={10}
                    max={22}
                    step={1}
                    value={labelFontSize}
                    handleChange={(e) =>
                      patch({ accordionLabelFontSize: Number(e.target.value) || 13 })
                    }
                    pos={((labelFontSize - 10) / 12) * 100}
                    color={textColor}
                  />
                </div>
              </div>
              <div className="min-w-0">
                <MainLabel label="ความสูงแท็บ" value={tabHeight} mb={0} />
                <div className="px-0.5">
                  <Range
                    min={32}
                    max={96}
                    step={1}
                    value={tabHeight}
                    handleChange={(e) =>
                      patch({ accordionTabHeight: Number(e.target.value) || 48 })
                    }
                    pos={((tabHeight - 32) / (96 - 32)) * 100}
                    color={textColor}
                  />
                </div>
              </div>
              <div className="min-w-0">
                <MainLabel label="ความหนากรอบ" value={borderWidth} mb={0} />
                <div className="px-0.5">
                  <Range
                    min={0}
                    max={8}
                    step={1}
                    value={borderWidth}
                    handleChange={(e) =>
                      patch({ accordionBorderWidth: Number(e.target.value) || 0 })
                    }
                    pos={(borderWidth / 8) * 100}
                    color={textColor}
                  />
                </div>
              </div>
              <div className="min-w-0">
                <MainLabel label="ความโค้งมน" value={radius} mb={0} />
                <div className="px-0.5">
                  <Range
                    min={0}
                    max={ACCORDION_RADIUS_MAX}
                    step={1}
                    value={radius}
                    handleChange={(e) => {
                      const next = Number(e.target.value);
                      patch({
                        accordionItemRadius: Number.isFinite(next) ? next : 0,
                      });
                    }}
                    pos={(radius / ACCORDION_RADIUS_MAX) * 100}
                    color={textColor}
                  />
                </div>
              </div>
            </div>
          </li>

          <li>
            <Box sx={{ width: "100%", px: 0.25 }}>
              <div className="mb-2 flex items-center gap-2">
                <MainLabel label="แท็บที่ทำงานอยู่" mb={0} />
              </div>
              <AccordionActiveColorSelectLine
                prev={() => cycleActiveColorMode(-1)}
                next={() => cycleActiveColorMode(1)}
                prevAria="โหมดสีก่อนหน้า"
                nextAria="โหมดสีถัดไป"
                groupAria="สลับแก้สีแท็บที่ทำงานอยู่"
                value={activeColorModeLabel}
              />
              <div className="mt-2 w-full rounded-md bg-white px-[0px] pb-[5px] pt-[2px] dark:bg-zinc-800">
                <div className="px-[5px] pb-2">
                  <Range
                    min={0}
                    max={255}
                    step={1}
                    value={Math.min(255, Math.max(0, activeModeOpacity))}
                    handleChange={(e) => {
                      const v = Number(e.target.value);
                      const safe = Number.isFinite(v) ? Math.min(255, Math.max(0, v)) : 255;
                      if (activeColorMode === "tab") {
                        patch({ accordionActiveTabColorOpacity: safe });
                      } else if (activeColorMode === "text") {
                        patch({ accordionActiveLabelColorOpacity: safe });
                      } else if (activeColorMode === "border") {
                        patch({ accordionActiveBorderColorOpacity: safe });
                      } else {
                        patch({ accordionActiveToggleColorOpacity: safe });
                      }
                    }}
                    pos={(Math.min(255, Math.max(0, activeModeOpacity)) / 255) * 100}
                    color={textColor}
                  />
                </div>
                <div className="grid grid-cols-10 place-items-center gap-x-0 gap-y-[6px] px-[5px] pb-0">
                  {allColors.map((color, i) => {
                    const bgColor =
                      typeof color === "string"
                        ? color
                        : theme?.[color.type]?.[color.index];
                    if (bgColor == null) return null;
                    const selected = chipSelected(currentActiveColorValue, color);
                    return (
                      <div key={i}>
                        <button
                          type="button"
                          className="flex size-[25px] items-center justify-center rounded-full border border-slate-200 dark:border-white/15"
                          style={{ backgroundColor: bgColor }}
                          onClick={() => {
                            if (activeColorMode === "tab") {
                              patch({ accordionActiveTabColor: color });
                            } else if (activeColorMode === "text") {
                              patch({ accordionActiveLabelColor: color });
                            } else if (activeColorMode === "border") {
                              patch({ accordionActiveBorderColor: color });
                            } else {
                              patch({ accordionActiveToggleColor: color });
                            }
                          }}
                          aria-label={`เลือกสี ${bgColor}`}
                        >
                          {selected ? (
                            <Check
                              className={swatchSelectedCheckClassName(bgColor)}
                              strokeWidth={4}
                              aria-hidden
                            />
                          ) : null}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Box>
          </li>

          <li>
            <Box sx={{ width: "100%", px: 0.25 }}>
              <div className="mb-2 flex items-center gap-2">
                <MainLabel label="แท็บที่ไม่ทำงาน" mb={0} />
              </div>
              <AccordionActiveColorSelectLine
                prev={() => cycleInactiveColorMode(-1)}
                next={() => cycleInactiveColorMode(1)}
                prevAria="โหมดสีก่อนหน้า (แท็บที่ไม่ทำงาน)"
                nextAria="โหมดสีถัดไป (แท็บที่ไม่ทำงาน)"
                groupAria="สลับแก้สีแท็บที่ไม่ทำงาน"
                value={inactiveColorModeLabel}
              />
              <div className="mt-2 w-full rounded-md bg-white px-[0px] pb-[5px] pt-[2px] dark:bg-zinc-800">
                <div className="px-[5px] pb-2">
                  <Range
                    min={0}
                    max={255}
                    step={1}
                    value={Math.min(255, Math.max(0, inactiveModeOpacity))}
                    handleChange={(e) => {
                      const v = Number(e.target.value);
                      const safe = Number.isFinite(v) ? Math.min(255, Math.max(0, v)) : 255;
                      if (inactiveColorMode === "tab") {
                        patch({ accordionInactiveTabColorOpacity: safe });
                      } else if (inactiveColorMode === "text") {
                        patch({ accordionInactiveLabelColorOpacity: safe });
                      } else if (inactiveColorMode === "border") {
                        patch({ accordionInactiveBorderColorOpacity: safe });
                      } else {
                        patch({ accordionInactiveToggleColorOpacity: safe });
                      }
                    }}
                    pos={(Math.min(255, Math.max(0, inactiveModeOpacity)) / 255) * 100}
                    color={textColor}
                  />
                </div>
                <div className="grid grid-cols-10 place-items-center gap-x-0 gap-y-[6px] px-[5px] pb-0">
                  {allColors.map((color, i) => {
                    const bgColor =
                      typeof color === "string"
                        ? color
                        : theme?.[color.type]?.[color.index];
                    if (bgColor == null) return null;
                    const selected = chipSelected(currentInactiveColorValue, color);
                    return (
                      <div key={`inactive-${i}`}>
                        <button
                          type="button"
                          className="flex size-[25px] items-center justify-center rounded-full border border-slate-200 dark:border-white/15"
                          style={{ backgroundColor: bgColor }}
                          onClick={() => {
                            if (inactiveColorMode === "tab") {
                              patch({ accordionInactiveTabColor: color });
                            } else if (inactiveColorMode === "text") {
                              patch({ accordionInactiveLabelColor: color });
                            } else if (inactiveColorMode === "border") {
                              patch({ accordionInactiveBorderColor: color });
                            } else {
                              patch({ accordionInactiveToggleColor: color });
                            }
                          }}
                          aria-label={`เลือกสีแท็บที่ไม่ทำงาน ${bgColor}`}
                        >
                          {selected ? (
                            <Check
                              className={swatchSelectedCheckClassName(bgColor)}
                              strokeWidth={4}
                              aria-hidden
                            />
                          ) : null}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Box>
          </li>

          <li>
            <div className="grid w-full grid-cols-2 gap-x-3 gap-y-4 px-0.5">
              <div className="min-w-0">
                <MainLabel label="ระยะด้านบน" metricValue={marginTop} compact />
                <div className="px-0.5">
                  <Range
                    min={0}
                    max={80}
                    step={1}
                    value={marginTop}
                    handleChange={(e) =>
                      patch({ accordionMarginTop: Number(e.target.value) || 0 })
                    }
                    pos={(marginTop / 80) * 100}
                    color={textColor}
                  />
                </div>
              </div>
              <div className="min-w-0">
                <MainLabel label="ระยะด้านล่าง" metricValue={marginBottom} compact />
                <div className="px-0.5">
                  <Range
                    min={0}
                    max={80}
                    step={1}
                    value={marginBottom}
                    handleChange={(e) =>
                      patch({ accordionMarginBottom: Number(e.target.value) || 0 })
                    }
                    pos={(marginBottom / 80) * 100}
                    color={textColor}
                  />
                </div>
              </div>
            </div>

            <Box sx={{ pb: 4 }}>
              <div className="mb-3 mt-4 flex items-center gap-2">
                <span className="shrink-0 text-[13px] font-semibold text-slate-700 dark:text-white/80">
                  รายการทั้งหมด
                </span>
                <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
                <button
                  type="button"
                  disabled={accordionItems.length >= ACCORDION_ITEM_LIST_MAX}
                  title={
                    accordionItems.length >= ACCORDION_ITEM_LIST_MAX
                      ? "ถึงจำนวนสูงสุดแล้ว (12)"
                      : "เพิ่มแท็บ"
                  }
                  className="inline-flex min-h-[26px] shrink-0 items-center justify-center rounded-md px-2 py-1 text-[12px] font-medium leading-snug text-white transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#333333] disabled:pointer-events-none disabled:opacity-35"
                  style={{ backgroundColor: "#333333" }}
                  onClick={addItem}
                >
                  เพิ่มแท็บ
                </button>
              </div>
              <Stack spacing={0.75}>
                {accordionItems.map((item, idx) => {
                  const isCanvasActive = item.id === resolvedActiveId;
                  return (
                    <Box key={item.id} className="flex w-full min-w-0 flex-col gap-2">
                      <div className="flex w-full items-center gap-2">
                        <button
                          type="button"
                          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md border border-slate-200 bg-[#333333] text-[10px] font-semibold text-white shadow-none transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#333333]/40 dark:border-white/15"
                          title={
                            isCanvasActive
                              ? "รายการนี้กำลังแสดงผลบนแคนวาส"
                              : "เลือกรายการนี้เป็นรายการแสดงผลบนแคนวาส"
                          }
                          aria-label={
                            isCanvasActive
                              ? "รายการที่เลือกแสดงผลอยู่"
                              : "เลือกรายการนี้เป็นรายการแสดงผล"
                          }
                          aria-pressed={isCanvasActive}
                          onClick={() => patch({ accordionActiveId: item.id })}
                        >
                          {isCanvasActive ? (
                            <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                          ) : (
                            idx + 1
                          )}
                        </button>
                        <Box
                          className={`flex min-w-0 flex-1 items-center gap-2 rounded-md border border-slate-200 py-0 dark:border-white/10 ${
                            headerStyle === "iconText" ? "pl-0 pr-2.5" : "px-2.5"
                          }`}
                        >
                          <div className="flex min-w-0 flex-1 items-center gap-2">
                            {headerStyle === "iconText" ? (
                              <button
                                type="button"
                                className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-l-md rounded-r-none bg-slate-100 text-[#333333] transition hover:bg-slate-200 dark:bg-slate-700/80 dark:text-[#333333] dark:hover:bg-slate-700"
                                aria-label="เลือกไอคอนรายการ"
                                onClick={() => {
                                  const ae = document.activeElement;
                                  if (ae instanceof HTMLElement) ae.blur();
                                  setIconPickerItemId(item.id);
                                }}
                              >
                                {(() => {
                                  const fa = normalizeAccordionFaIcon(item.faIcon);
                                  return fa.name && fa.type ? (
                                    <IconAwsome
                                      iconName={fa.name}
                                      iconType={fa.type}
                                      style={{ fontSize: 14, color: "#333333" }}
                                    />
                                  ) : (
                                    <span className="inline-flex" style={{ color: "#333333" }}>
                                      <Sparkles className="size-3.5 shrink-0" strokeWidth={2} />
                                    </span>
                                  );
                                })()}
                              </button>
                            ) : null}
                            <Field
                              value={typeof item?.label === "string" ? item.label : ""}
                              handleChange={(e) => {
                                const nextLabel = e.target.value;
                                patchAccordionItems((current) =>
                                  current.map((it) =>
                                    it.id === item.id ? { ...it, label: nextLabel } : it
                                  )
                                );
                              }}
                              placeholder={`รายการ ${idx + 1}`}
                              id={`accordion-label-${item.id}`}
                              type="text"
                              className="min-w-0 h-8 max-h-8 w-full flex-1 border-0 bg-transparent px-1.5 py-0 text-[12px] leading-tight text-slate-800 shadow-none outline-none ring-0 placeholder:text-slate-400 focus:border-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 dark:text-white/90 dark:placeholder:text-white/35"
                            />
                          </div>
                        </Box>
                        <button
                          type="button"
                          disabled={accordionItems.length <= 1}
                          title={
                            accordionItems.length <= 1
                              ? "ต้องมีอย่างน้อย 1 รายการ"
                              : "ลบรายการนี้"
                          }
                          aria-label="ลบรายการ"
                          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 shadow-none transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-red-500/40 disabled:pointer-events-none disabled:opacity-35 dark:border-white/10 dark:bg-slate-900/90 dark:text-slate-400 dark:hover:border-red-500/40 dark:hover:bg-red-950/45 dark:hover:text-red-400"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                        </button>
                      </div>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          </li>
        </ul>
      </nav>

      <ServiceIcon
        header="เลือกไอคอน"
        icon={normalizeAccordionFaIcon(
          accordionItems.find((it) => it.id === iconPickerItemId)?.faIcon
        )}
        open={Boolean(iconPickerItemId)}
        onClose={() => setIconPickerItemId(null)}
        handleChange={(ic) => {
          if (!iconPickerItemId) return;
          patchAccordionItems((current) =>
            current.map((it) =>
              it.id === iconPickerItemId ? { ...it, faIcon: ic } : it
            )
          );
        }}
        darkColor={textColor || "#0d9488"}
        darkMode={darkMode}
      />
    </aside>
  );
};

export default AccordionElementOffcanvas;
