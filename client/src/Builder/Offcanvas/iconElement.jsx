import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Button, ButtonGroup, Typography } from "@mui/material";
import { AlignCenter, AlignLeft, AlignRight, Check, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import lodash from "lodash";
import ServiceIcon from "../ServiceIcon";
import IconAwsome from "../IconAwsome";
import {
  ICON_ELEMENT_DEFAULTS,
  ICON_STANDALONE_CONTAINER_MAX,
  ICON_STANDALONE_CONTAINER_MIN,
  mergeIconElement,
  normalizeIconBorderStyle,
  normalizeIconBorderPosition,
} from "../Layouts/Elements/iconElementConfig";
import { listItemGlyphColorAfterFrameToggle } from "../Layouts/Elements/listElementConfig";
import {
  BUTTON_LAYOUT_ALIGN_OPTIONS,
  normalizeButtonLayoutAlign,
} from "../Layouts/Elements/buttonElementConfig";
import { swatchSelectedCheckClassName } from "../Layouts/Elements/swatchCheckClass";
import { THEME_PANEL_BASIC_COLOR_SWATCHES } from "../themePanelBasicColors";
import MainLabel from "../HTML/MainLabel";
import Range from "../HTML/Range";

const LINK_TARGET_OPTIONS = [
  { value: "_self", label: "ลิงค์หน้าเดิม" },
  { value: "_blank", label: "เปิดหน้าใหม่" },
];

const ICON_SHAPE_OPTIONS = [
  { value: "circle", label: "วงกลม" },
  { value: "rounded", label: "มุมมน" },
];

/** รูปแบบเส้นกรอบ (CSS border-style) */
const ICON_BORDER_LINE_STYLE_OPTIONS = [
  { value: "solid", label: "ธรรมดา" },
  { value: "dotted", label: "เส้นจุด" },
  { value: "dashed", label: "เส้นประ" },
];

/** ความหนากรอบ — preset เป็น borderWidth (px) */
const ICON_BORDER_WIDTH_PRESETS = [
  { value: 0, label: "ไม่มี" },
  { value: 1, label: "บาง" },
  { value: 2, label: "เบา" },
  { value: 3, label: "กลาง" },
  { value: 6, label: "หนา" },
];

const ICON_BORDER_POSITION_OPTIONS = [
  { value: "outside", label: "ด้านนอก" },
  { value: "center", label: "ตรงกลาง" },
  { value: "inside", label: "ด้านใน" },
];

const ICON_ROW_DIVIDER_STYLE_OPTIONS = [
  { value: "solid", label: "ตรง" },
  { value: "dashed", label: "ประ" },
  { value: "dotted", label: "จุด" },
];

/** ความกว้างกรอบใน Panel — รายการ List (icon ใน list) */
const ICON_LIST_CONTAINER_PANEL_MIN = 32;
const ICON_LIST_CONTAINER_PANEL_MAX = 160;

/** โหมดแก้สีธีม — เหมือนปุ่ม: พื้นหลัง / ไอคอน / กรอบ */
const ICON_COLOR_MODES_BASE = [
  { value: "fill", label: "สีพื้นหลัง" },
  { value: "text", label: "สีไอคอน" },
];
const ICON_COLOR_MODE_BORDER = { value: "border", label: "สีกรอบ" };
const ICON_COLOR_MODE_DIVIDER = { value: "divider", label: "สีเส้นคั่น" };
const ICON_COLOR_MODES_ALL = [
  ...ICON_COLOR_MODES_BASE,
  ICON_COLOR_MODE_BORDER,
  ICON_COLOR_MODE_DIVIDER,
];

const OPTION_CHIP_RADIUS = "0.375rem";
const CHIP_BORDER = "#e2e8f0";
const CHIP_BORDER_DARK = "rgba(255, 255, 255, 0.1)";
const CHIP_BG = "#ffffff";
const CHIP_BG_HOVER = "#f8fafc";
const CHIP_BG_DARK = "rgba(30, 41, 59, 0.9)";
const CHIP_BG_DARK_HOVER = "rgba(30, 41, 59, 1)";

const groupButtonSx = (selected, accent) => {
  const a = accent || "#0d9488";
  return {
    flex: 1,
    fontSize: 11,
    minHeight: 34,
    py: 0.75,
    px: 0.5,
    textTransform: "none",
    lineHeight: 1.25,
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

const groupRootSx = {
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

const THEME_RANGE_INPUT_CLASS = `
                    w-full cursor-pointer appearance-none h-2 rounded-full
                    bg-zinc-200
                    dark:bg-zinc-700

                    theme-range-fill-track

                    [&::-webkit-slider-runnable-track]:border-0
                    [&::-moz-range-track]:border-0

                    [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-emerald-300
                    dark:[&::-webkit-slider-thumb]:bg-emerald-300
                    [&::-webkit-slider-thumb]:bg-slate-900
                    [&::-webkit-slider-thumb]:border-0

                    [&::-moz-range-thumb]:cursor-pointer
                    [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4
                    [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:bg-emerald-300
                    [&::-moz-range-thumb]:border-0
                  `;

/** สีเทาอ่อนในแถบพื้นฐานของแผง iCons (ลำดับ: #000 → #6a6a6a → นี้ → #fff) */
const ICON_PANEL_BASIC_LIGHT_GRAY_HEX = "#d8d8d8";

const IconElementOffcanvas = ({
  element,
  onUpdate,
  close,
  textColor,
  theme,
  panelTitle = "Icons",
  darkMode = "light",
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
        type: next?.type ?? base?.type ?? "icon",
        id: next?.id != null ? next.id : base?.id,
      };
      pendingLayoutRef.current = lodash.cloneDeep(merged);
      if (layoutSyncRafRef.current) {
        cancelAnimationFrame(layoutSyncRafRef.current);
      }
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
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [iconColorMode, setIconColorMode] = useState(
    ICON_COLOR_MODES_BASE[0].value
  );
  const isListItemIcon = data?.type === "list";
  const isListIconsElement =
    isListItemIcon && data?.listIconsElement === true;
  /** List iTems / List iCons ดับเบิลคลิกไอคอน — พื้นหลังไอคอน/ความกว้าง/ขนาด/มุมมนอยู่ที่แผง List หลัก */
  const hideListItemsSharedIconDims = Boolean(data?.__listItemIconEdit);
  /** compound List Item/iCons — ซ่อนเส้นคั่น/ชุดสีเพราะจัดการผ่าน List offcanvas แทน */
  const isListBoxItemIconEdit = Boolean(data?.__listBoxItemIconEdit);
  const isImageHoverIconEdit = Boolean(data?.__imageHoverIconEdit);
  const isBetweenIconEdit = Boolean(data?.__betweenIconEdit);
  const isCompoundListItemEdit =
    Boolean(data?.__listItemIconEdit) || Boolean(data?.__listBoxItemIconEdit);
  /** listMargin เมื่อไม่มีค่าใน element: List Item บน 0 ล่าง 5 — List iCons บน/ล่าง 0 */
  const listMarginTopPanelDefault = isListItemIcon ? 0 : 5;
  const listMarginBottomPanelDefault = isListIconsElement ? 0 : 5;
  const listMarginTopRaw = Number(data?.listMarginTop);
  const listMarginTop = Number.isFinite(listMarginTopRaw)
    ? Math.max(0, Math.min(80, listMarginTopRaw))
    : listMarginTopPanelDefault;
  const listMarginBottomRaw = Number(data?.listMarginBottom);
  const listMarginBottom = Number.isFinite(listMarginBottomRaw)
    ? Math.max(0, Math.min(80, listMarginBottomRaw))
    : listMarginBottomPanelDefault;

  useEffect(() => {
    if (!element?.id) return;
    setData((prev) => {
      if (!prev || prev.id !== element.id) return element;
      return prev;
    });
  }, [element]);

  useEffect(() => {
    setIconPickerOpen(false);
    /* List iCons ดับเบิลคลิกไอคอน — เริ่มที่โหมดสีไอคอน (ไม่ใช่พื้นหลัง) เพื่อให้สวอตช์แก้ iconColor */
    const openListIconsItemGlyph =
      element?.type === "list" && element?.listIconsElement === true;
    setIconColorMode(
      openListIconsItemGlyph ? "text" : ICON_COLOR_MODES_BASE[0].value
    );
  }, [element?.id, element?.type, element?.listIconsElement]);

  const patch = (partial) => {
    setData((prev) => {
      const next = { ...prev, ...partial };
      scheduleLayoutSync(next);
      return next;
    });
  };

  const handleLinkPatch = (p) => {
    setData((prev) => {
      const next = { ...prev, ...p };
      scheduleLayoutSync(next);
      return next;
    });
  };

  const merged = useMemo(() => mergeIconElement(data), [data]);

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

  const bgOpacityRaw = Number(data?.backgroundOpacity);
  const bgOpacity = Number.isFinite(bgOpacityRaw)
    ? Math.max(0, Math.min(255, bgOpacityRaw))
    : ICON_ELEMENT_DEFAULTS.backgroundOpacity;

  const iconOpacityRaw = Number(data?.iconOpacity);
  const iconOpacity = Number.isFinite(iconOpacityRaw)
    ? Math.max(0, Math.min(255, iconOpacityRaw))
    : ICON_ELEMENT_DEFAULTS.iconOpacity;

  const chipSelected = (active, chip) => {
    if (typeof active === "string" && typeof chip === "string") {
      return active.toLowerCase() === chip.toLowerCase();
    }
    if (
      active &&
      typeof active === "object" &&
      chip &&
      typeof chip === "object"
    ) {
      return lodash.isEqual(active, chip);
    }
    return false;
  };
  const borderEnabled = isListIconsElement
    ? data?.borderEnabled === true
    : data?.borderEnabled !== false;
  const allowBorderColorMode = borderEnabled && !isListItemIcon && !isImageHoverIconEdit;
  const allowFillModeWithoutBorder = isBetweenIconEdit;
  const inIconRowGroup =
    typeof data?.iconRowGroupId === "string" &&
    data.iconRowGroupId.trim() !== "";
  const iconRowMemberCountRaw = Number(data?.__iconRowGroupCount);
  const iconRowMemberCount = Number.isFinite(iconRowMemberCountRaw)
    ? iconRowMemberCountRaw
    : 0;
  const showIconRowGapControl =
    inIconRowGroup && (iconRowMemberCount <= 0 || iconRowMemberCount > 1);

  const iconColorModesEffective = !borderEnabled && !allowFillModeWithoutBorder
    ? [{ value: "text", label: "สีไอคอน" }]
    : isListItemIcon
      ? ICON_COLOR_MODES_BASE
      : allowBorderColorMode
      ? (
        showIconRowGapControl && data?.iconRowDividerEnabled === true
          ? ICON_COLOR_MODES_ALL
          : ICON_COLOR_MODES_BASE.concat([ICON_COLOR_MODE_BORDER])
      )
      : (
        showIconRowGapControl && data?.iconRowDividerEnabled === true
          ? ICON_COLOR_MODES_BASE.concat([ICON_COLOR_MODE_DIVIDER])
          : ICON_COLOR_MODES_BASE
      );
  const iconColorModeLabel =
    iconColorModesEffective.find((o) => o.value === iconColorMode)?.label ?? "";

  const cycleIconColorMode = (delta) => {
    const list = iconColorModesEffective;
    const idx = list.findIndex((o) => o.value === iconColorMode);
    const base = idx === -1 ? 0 : idx;
    const next = (base + delta + list.length) % list.length;
    setIconColorMode(list[next].value);
  };

  useEffect(() => {
    if (!borderEnabled && !allowFillModeWithoutBorder && iconColorMode !== "text") {
      setIconColorMode("text");
      return;
    }
    if ((!allowBorderColorMode || isListItemIcon) && iconColorMode === "border") {
      setIconColorMode(ICON_COLOR_MODES_BASE[0].value);
    }
    if (
      iconColorMode === "divider" &&
      !(showIconRowGapControl && data?.iconRowDividerEnabled === true)
    ) {
      setIconColorMode(ICON_COLOR_MODES_BASE[0].value);
    }
  }, [
    allowBorderColorMode,
    allowFillModeWithoutBorder,
    borderEnabled,
    isListItemIcon,
    iconColorMode,
    showIconRowGapControl,
    data?.iconRowDividerEnabled,
  ]);

  const activeIconColorSwatch =
    iconColorMode === "text"
      ? data?.iconColor ?? ICON_ELEMENT_DEFAULTS.iconColor
      : iconColorMode === "divider"
        ? data?.iconRowDividerColor ?? ICON_ELEMENT_DEFAULTS.iconRowDividerColor
      : iconColorMode === "border"
        ? data?.borderColor ?? ICON_ELEMENT_DEFAULTS.borderColor
        : data?.backgroundColor ?? ICON_ELEMENT_DEFAULTS.backgroundColor;

  const borderOpacityRaw = Number(data?.borderOpacity);
  const borderOpacity = Number.isFinite(borderOpacityRaw)
    ? Math.max(0, Math.min(255, borderOpacityRaw))
    : ICON_ELEMENT_DEFAULTS.borderOpacity;

  const iconThemeOpacitySliderValue =
    iconColorMode === "text"
      ? iconOpacity
      : iconColorMode === "divider"
        ? Math.max(
            0,
            Math.min(
              255,
              Number(data?.iconRowDividerOpacity) ||
                ICON_ELEMENT_DEFAULTS.iconRowDividerOpacity
            )
          )
      : iconColorMode === "border"
        ? borderOpacity
        : bgOpacity;

  const borderWRaw = Number(data?.borderWidth);
  const borderWVal = Number.isFinite(borderWRaw)
    ? Math.max(0, Math.min(6, borderWRaw))
    : ICON_ELEMENT_DEFAULTS.borderWidth;

  const linkEnabled = Boolean(data?.linkEnabled);
  const linkUrl = typeof data?.linkUrl === "string" ? data.linkUrl : "";
  const linkTarget = data?.linkTarget === "_blank" ? "_blank" : "_self";

  const iconLayoutAlign = normalizeButtonLayoutAlign(
    data?.iconLayoutAlign ?? ICON_ELEMENT_DEFAULTS.iconLayoutAlign
  );
  const iconRowGapRaw = Number(data?.iconRowGap);
  const iconRowGap = Number.isFinite(iconRowGapRaw)
    ? Math.max(0, Math.min(80, iconRowGapRaw))
    : ICON_ELEMENT_DEFAULTS.iconRowGap;
  const iconRowDividerStyleRaw = String(data?.iconRowDividerStyle || "solid")
    .trim()
    .toLowerCase();
  const iconRowDividerStyle =
    iconRowDividerStyleRaw === "dashed" || iconRowDividerStyleRaw === "dotted"
      ? iconRowDividerStyleRaw
      : "solid";
  const iconLayoutAlignLabel =
    BUTTON_LAYOUT_ALIGN_OPTIONS.find((o) => o.value === iconLayoutAlign)
      ?.label ?? "ตรงกลาง";

  const cycleIconLayoutAlign = (delta) => {
    const list = BUTTON_LAYOUT_ALIGN_OPTIONS;
    const idx = list.findIndex((o) => o.value === iconLayoutAlign);
    const base = idx === -1 ? 0 : idx;
    const next = (base + delta + list.length) % list.length;
    patch({ iconLayoutAlign: list[next].value });
  };

  const fa = merged.faIcon;
  const shape = merged.iconShape === "rounded" ? "rounded" : "circle";

  const containerPanelMin = isListItemIcon
    ? ICON_LIST_CONTAINER_PANEL_MIN
    : ICON_STANDALONE_CONTAINER_MIN;
  const containerPanelMax = isListItemIcon
    ? ICON_LIST_CONTAINER_PANEL_MAX
    : ICON_STANDALONE_CONTAINER_MAX;
  const containerDefault = isListItemIcon
    ? 64
    : ICON_ELEMENT_DEFAULTS.containerSize;
  const containerSliderValue = Math.min(
    containerPanelMax,
    Math.max(
      containerPanelMin,
      Number(merged.containerSize) || containerDefault
    )
  );
  const containerSliderPosPct =
    containerPanelMax === containerPanelMin
      ? 0
      : ((containerSliderValue - containerPanelMin) /
          (containerPanelMax - containerPanelMin)) *
        100;

  const iconSliderValue = Math.min(
    96,
    Math.max(12, Number(merged.iconSize) || 28)
  );
  const iconSliderPosPct = ((iconSliderValue - 12) / (96 - 12)) * 100;

  const cornerSliderValue = Math.min(
    48,
    Math.max(0, Number(merged.iconCornerRadius) || 12)
  );
  const cornerSliderPosPct = (cornerSliderValue / 48) * 100;

  const themeRangeFillStyle = {
    ["--fill"]: textColor || "#0d9488",
  };

  return (
    <aside
      className={`
     flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden bg-white dark:bg-gray-900/80 border-r border-slate-200 dark:border-white/10 `}
    >
      <div className="shrink-0 px-6 pt-5 pb-3 flex items-center justify-between bg-gray-100 dark:bg-gray-900/50">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 font-bold tracking-wide text-slate-800 dark:text-white/90">
            {panelTitle}
          </span>
          <span
            className="inline-flex min-w-0 max-w-full items-center rounded-md border border-[#333333] bg-[#333333] px-2 py-0.5 text-[11px] font-mono font-bold leading-none text-white tabular-nums dark:border-[#333333] dark:bg-[#333333] dark:text-white"
            title={String(data?.id ?? "")}
          >
            <span className="truncate">{data?.id}</span>
          </span>
        </div>
        <button
          type="button"
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-white/70"
          onClick={() => close(null, null, null)}
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
      <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain px-4 pb-6 w-full">
        <ul className="mt-4 pl-1 space-y-5">
          <li>
            <div className="mb-3 flex items-center gap-2">
              <span className="shrink-0 text-[13px] font-semibold text-slate-700 dark:text-white/80">
                ไอคอน Font Awesome
              </span>
              <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
            </div>
            <div className="flex w-full overflow-hidden rounded-md border border-slate-200 bg-white transition focus-within:border-slate-300 focus-within:ring-2 focus-within:ring-slate-200 dark:border-white/10 dark:bg-slate-900/80 dark:focus-within:border-white/20 dark:focus-within:ring-white/10">
              <button
                type="button"
                className="flex shrink-0 items-center justify-center border-r border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-600 transition hover:bg-slate-100 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-800/95"
                aria-label="เลือกไอคอน"
                onClick={() => {
                  const ae = document.activeElement;
                  if (ae instanceof HTMLElement) ae.blur();
                  setIconPickerOpen(true);
                }}
              >
                {fa?.name && fa?.type ? (
                  <IconAwsome
                    iconName={fa.name}
                    iconType={fa.type}
                    style={{ fontSize: 22, color: "#333333" }}
                  />
                ) : (
                  <span className="inline-flex text-[#333333]">
                    <Sparkles className="size-5 shrink-0" strokeWidth={2} />
                  </span>
                )}
              </button>
              <div className="flex min-w-0 flex-1 flex-col justify-center px-2.5 py-1">
                <Typography variant="caption" color="text.secondary">
                  {fa?.name && fa?.type
                    ? `${fa.type} · ${fa.name}`
                    : "ยังไม่ได้เลือก — แตะซ้ายเพื่อเลือก"}
                </Typography>
              </div>
            </div>
          </li>

          {!isListBoxItemIconEdit && !hideListItemsSharedIconDims && (
          <li>
            {isBetweenIconEdit ? (
              <div className="mb-3 flex items-center gap-2">
                <span className="shrink-0 text-[13px] font-semibold text-slate-700 dark:text-white/80">
                  พื้นหลังไอคอน
                </span>
                <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
              </div>
            ) : (
              <MainLabel
                label="พื้นหลังไอคอน"
                mb={1.5}
                checked={borderEnabled}
                handleSwitch={(e) => {
                  const on = e.target.checked;
                  const iconFrameSnapshot =
                    data?.iconFrameSnapshot && typeof data.iconFrameSnapshot === "object"
                      ? data.iconFrameSnapshot
                      : null;
                  const nextGlyph =
                    isListItemIcon && !isListIconsElement
                      ? listItemGlyphColorAfterFrameToggle(on, data?.iconColor)
                      : undefined;
                  patch(
                    on
                      ? {
                          borderEnabled: true,
                          ...(data?.type === "icon"
                            ? {
                                iconColor:
                                  iconFrameSnapshot?.iconColor ??
                                  ICON_ELEMENT_DEFAULTS.iconColor,
                                ...(iconFrameSnapshot?.backgroundColor !== undefined
                                  ? {
                                      backgroundColor: iconFrameSnapshot.backgroundColor,
                                    }
                                  : {}),
                              }
                            : {}),
                          ...(nextGlyph !== undefined ? { iconColor: nextGlyph } : {}),
                          /* List Item จากดับเบิลคลิก หรือ Element iCons (type icon): คืนความทึบเท่านั้น — เก็บสีพื้นหลังเดิม */
                          ...(isCompoundListItemEdit || data?.type === "icon"
                            ? {
                                backgroundOpacity: Number.isFinite(
                                  Number(iconFrameSnapshot?.backgroundOpacity)
                                )
                                  ? Number(iconFrameSnapshot.backgroundOpacity)
                                  : 255,
                              }
                            : {
                                backgroundOpacity: 255,
                                backgroundColor: ICON_PANEL_BASIC_LIGHT_GRAY_HEX,
                              }),
                        }
                      : {
                          borderEnabled: false,
                          backgroundOpacity: 0,
                          ...(data?.type === "icon"
                            ? {
                                // ปิดกรอบ: ถ้าผู้ใช้ตั้งสี glyph เอง ให้คงสีนั้นไว้
                                // (ไม่บังคับกลับ MainColor)
                                ...(() => {
                                  const hasCustomGlyphColor =
                                    data?.iconColor !== undefined &&
                                    data?.iconColor !== null &&
                                    !chipSelected(
                                      data.iconColor,
                                      ICON_ELEMENT_DEFAULTS.iconColor
                                    );
                                  return {
                                    iconColor: hasCustomGlyphColor
                                      ? data.iconColor
                                      : { type: "mainColor", index: 0 },
                                  };
                                })(),
                                iconFrameSnapshot: {
                                  iconColor:
                                    data?.iconColor ?? ICON_ELEMENT_DEFAULTS.iconColor,
                                  backgroundColor:
                                    data?.backgroundColor ??
                                    ICON_ELEMENT_DEFAULTS.backgroundColor,
                                  backgroundOpacity: Number.isFinite(
                                    Number(data?.backgroundOpacity)
                                  )
                                    ? Number(data.backgroundOpacity)
                                    : 255,
                                },
                              }
                            : {}),
                          ...(nextGlyph !== undefined ? { iconColor: nextGlyph } : {}),
                        }
                  );
                }}
                color={textColor}
              />
            )}
            {(borderEnabled || isBetweenIconEdit) && (
              <ButtonGroup
                fullWidth
                variant="outlined"
                disableElevation
                color="inherit"
                aria-label="รูปทรง"
                sx={groupRootSx}
              >
                {ICON_SHAPE_OPTIONS.map((opt) => {
                  const selected = shape === opt.value;
                  return (
                    <Button
                      key={opt.value}
                      color="inherit"
                      onClick={() => patch({ iconShape: opt.value })}
                      sx={groupButtonSx(selected, textColor)}
                    >
                      <Box
                        component="span"
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "5px",
                        }}
                      >
                        {opt.label}
                      </Box>
                    </Button>
                  );
                })}
              </ButtonGroup>
            )}
          </li>
          )}

          {!isListBoxItemIconEdit && !hideListItemsSharedIconDims && (
          <li>
            {(borderEnabled || isBetweenIconEdit) ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="min-w-0">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="shrink-0 text-[13px] font-semibold text-slate-700 dark:text-white/80">
                      ความกว้าง
                    </span>
                    <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
                    <span className="shrink-0 text-xs text-slate-500 dark:text-white/50 tabular-nums">
                      {merged.containerSize}
                    </span>
                  </div>
                  <div className="w-full rounded-md bg-white px-[0px] pb-[0px] pt-[2px] dark:bg-zinc-800">
                    <div className="px-[0px] pb-0">
                      <input
                        type="range"
                        min={containerPanelMin}
                        max={containerPanelMax}
                        step={1}
                        value={containerSliderValue}
                        onChange={(e) =>
                          patch({
                            containerSize:
                              Number(e.target.value) || containerDefault,
                          })
                        }
                        className={THEME_RANGE_INPUT_CLASS}
                        style={{
                          ...themeRangeFillStyle,
                          ["--pos"]: `${containerSliderPosPct}%`,
                        }}
                        aria-label="ความกว้างกรอบไอคอน"
                      />
                    </div>
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="shrink-0 text-[13px] font-semibold text-slate-700 dark:text-white/80">
                      ขนาดไอคอน
                    </span>
                    <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
                    <span className="shrink-0 text-xs text-slate-500 dark:text-white/50 tabular-nums">
                      {merged.iconSize}
                    </span>
                  </div>
                  <div className="w-full rounded-md bg-white px-[0px] pb-[0px] pt-[0px] dark:bg-zinc-800">
                    <div className="px-[0px] pb-0">
                      <input
                        type="range"
                        min={12}
                        max={96}
                        step={1}
                        value={iconSliderValue}
                        onChange={(e) =>
                          patch({ iconSize: Number(e.target.value) || 28 })
                        }
                        className={THEME_RANGE_INPUT_CLASS}
                        style={{
                          ...themeRangeFillStyle,
                          ["--pos"]: `${iconSliderPosPct}%`,
                        }}
                        aria-label="ขนาดไอคอน"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-2 flex items-center gap-2">
                  <span className="shrink-0 text-[13px] font-semibold text-slate-700 dark:text-white/80">
                    ขนาดไอคอน
                  </span>
                  <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
                  <span className="text-xs text-slate-500 dark:text-white/50">
                    {merged.iconSize}
                  </span>
                </div>
                <div className="w-full rounded-md bg-white px-[0px] pb-[0px] pt-[0px] dark:bg-zinc-800">
                  <div className="px-[0px] pb-0">
                    <input
                      type="range"
                      min={12}
                      max={96}
                      step={1}
                      value={iconSliderValue}
                      onChange={(e) =>
                        patch({ iconSize: Number(e.target.value) || 28 })
                      }
                      className={THEME_RANGE_INPUT_CLASS}
                      style={{
                        ...themeRangeFillStyle,
                        ["--pos"]: `${iconSliderPosPct}%`,
                      }}
                      aria-label="ขนาดไอคอน"
                    />
                  </div>
                </div>
              </>
            )}
          </li>
          )}

          {showIconRowGapControl &&
            !isCompoundListItemEdit &&
            !isImageHoverIconEdit &&
            !isBetweenIconEdit && (
          <li>
            <MainLabel
              label="ระยะห่างไอคอน"
              value={iconRowGap}
              mb={0.35}
              checked={data?.iconRowDividerEnabled === true}
              handleSwitch={(e) =>
                patch({ iconRowDividerEnabled: e.target.checked })
              }
              color={textColor}
              typography="เส้นคั่น"
            />
            <div className="px-[2px] pb-[2px] pt-[2px]">
              <Range
                min={0}
                max={80}
                step={1}
                value={iconRowGap}
                pos={(iconRowGap / 80) * 100}
                color={textColor}
                handleChange={(e) =>
                  patch({ iconRowGap: Number(e.target.value) || 0 })
                }
                className={THEME_RANGE_INPUT_CLASS}
              />
            </div>
            {data?.iconRowDividerEnabled === true && (
              <div className="mt-3">
                <div className="mb-2 flex items-center gap-2">
                  <span className="shrink-0 text-[13px] font-semibold text-slate-700 dark:text-white/80">
                    รูปแบบเส้นคั่น
                  </span>
                  <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
                </div>
                <ButtonGroup
                  fullWidth
                  variant="outlined"
                  disableElevation
                  color="inherit"
                  aria-label="เลือกรูปแบบเส้นคั่น"
                  sx={groupRootSx}
                >
                  {ICON_ROW_DIVIDER_STYLE_OPTIONS.map((opt) => {
                    const selected = iconRowDividerStyle === opt.value;
                    return (
                      <Button
                        key={opt.value}
                        color="inherit"
                        onClick={() => patch({ iconRowDividerStyle: opt.value })}
                        sx={groupButtonSx(selected, textColor)}
                      >
                        {opt.label}
                      </Button>
                    );
                  })}
                </ButtonGroup>
              </div>
            )}
          </li>
          )}

          {!isListBoxItemIconEdit &&
            !hideListItemsSharedIconDims &&
            (borderEnabled || isBetweenIconEdit) &&
            shape === "rounded" && (
            <li className="mt-2">
              <div className="mb-2 flex items-center gap-2">
                <span className="shrink-0 text-[13px] font-semibold text-slate-700 dark:text-white/80">
                  มุมมน
                </span>
                <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
                <span className="shrink-0 text-xs text-slate-500 dark:text-white/50 tabular-nums">
                  {merged.iconCornerRadius}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={48}
                step={1}
                value={cornerSliderValue}
                onChange={(e) =>
                  patch({ iconCornerRadius: Number(e.target.value) || 0 })
                }
                className={THEME_RANGE_INPUT_CLASS}
                style={{
                  ...themeRangeFillStyle,
                  ["--pos"]: `${cornerSliderPosPct}%`,
                }}
                aria-label="มุมมนกรอบไอคอน"
              />
            </li>
          )}

          <li>
            <div className="mb-2 flex items-center gap-2">
              <span className="shrink-0 text-[13px] font-semibold text-slate-700 dark:text-white/80">
                {!borderEnabled && !allowFillModeWithoutBorder
                  ? "สีไอคอน"
                  : isListItemIcon
                  ? "สีพื้นหลัง - สีไอคอน"
                  : allowFillModeWithoutBorder
                  ? "สีพื้นหลัง - สีไอคอน"
                  : isImageHoverIconEdit
                  ? "สีพื้นหลัง - สีไอคอน"
                  : showIconRowGapControl && data?.iconRowDividerEnabled === true
                    ? "สีพื้นหลัง - สีไอคอน - สีกรอบ - สีเส้นคั่น"
                    : "สีพื้นหลัง - สีไอคอน - สีกรอบ"}
              </span>
              <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
            </div>
            {iconColorModesEffective.length > 1 ? (
              <div
                className="mb-1 flex items-center justify-between gap-0.5 rounded-lg border border-slate-200 bg-white px-0.5 py-0.5 dark:border-white/10 dark:bg-slate-800/90"
                role="group"
                aria-label={
                  isListItemIcon
                    ? "สลับแก้สีพื้นหลังหรือสีไอคอน"
                    : allowFillModeWithoutBorder
                    ? "สลับแก้สีพื้นหลังหรือสีไอคอน"
                    : isImageHoverIconEdit
                    ? "สลับแก้สีพื้นหลังหรือสีไอคอน"
                    : "สลับแก้สีพื้นหลัง สีไอคอน หรือสีกรอบ"
                }
              >
                <button
                  type="button"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
                  onClick={() => cycleIconColorMode(-1)}
                  aria-label="โหมดสีก่อนหน้า"
                >
                  <ChevronLeft
                    className="size-4"
                    strokeWidth={2}
                    aria-hidden
                  />
                </button>
                <span className="min-w-0 flex-1 truncate text-center text-[11px] font-normal text-slate-800 dark:text-white/90">
                  {iconColorModeLabel}
                </span>
                <button
                  type="button"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
                  onClick={() => cycleIconColorMode(1)}
                  aria-label="โหมดสีถัดไป"
                >
                  <ChevronRight
                    className="size-4"
                    strokeWidth={2}
                    aria-hidden
                  />
                </button>
              </div>
            ) : null}
            {borderEnabled && iconColorMode === "border" && (
              <div className="mb-2 mt-3 space-y-2">
                <div className="mb-1 flex items-center gap-2">
                  <span className="shrink-0 text-[13px] font-semibold text-slate-700 dark:text-white/80">
                    ความหนากรอบ
                  </span>
                  <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
                </div>
                <ButtonGroup
                  fullWidth
                  variant="outlined"
                  disableElevation
                  color="inherit"
                  aria-label="ความหนากรอบ"
                  sx={groupRootSx}
                >
                  {ICON_BORDER_WIDTH_PRESETS.map((opt) => {
                    const selected = borderWVal === opt.value;
                    return (
                      <Button
                        key={opt.value}
                        color="inherit"
                        onClick={() => patch({ borderWidth: opt.value })}
                        sx={{
                          ...groupButtonSx(selected, textColor),
                          fontSize: 11,
                          minHeight: 34,
                          px: 0.25,
                        }}
                      >
                        <Box
                          component="span"
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "4px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {selected ? (
                            <Check
                              className="size-3 shrink-0"
                              strokeWidth={3}
                              aria-hidden
                            />
                          ) : null}
                          {opt.label}
                        </Box>
                      </Button>
                    );
                  })}
                </ButtonGroup>
                <div className="mb-1 flex items-center gap-2 pt-2 pb-2">
                  <span className="shrink-0 text-[13px] font-semibold text-slate-700 dark:text-white/80">
                    รูปแบบของกรอบ
                  </span>
                  <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
                </div>
                <ButtonGroup
                  fullWidth
                  variant="outlined"
                  disableElevation
                  color="inherit"
                  aria-label="รูปแบบเส้นกรอบ เช่น ธรรมดา เส้นจุด เส้นประ"
                  sx={groupRootSx}
                >
                  {ICON_BORDER_LINE_STYLE_OPTIONS.map((opt) => {
                    const selected =
                      normalizeIconBorderStyle(merged.borderStyle) ===
                      opt.value;
                    return (
                      <Button
                        key={opt.value}
                        color="inherit"
                        onClick={() => patch({ borderStyle: opt.value })}
                        sx={{
                          ...groupButtonSx(selected, textColor),
                          fontSize: 11,
                          minHeight: 34,
                          px: 0.25,
                        }}
                      >
                        <Box
                          component="span"
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "4px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {selected ? (
                            <Check
                              className="size-3 shrink-0"
                              strokeWidth={3}
                              aria-hidden
                            />
                          ) : null}
                          {opt.label}
                        </Box>
                      </Button>
                    );
                  })}
                </ButtonGroup>
                <div className="mb-1 flex items-center gap-2 py-2">
                  <span className="shrink-0 text-[13px] font-semibold text-slate-700 dark:text-white/80">
                    ตำแหน่งกรอบ
                  </span>
                  <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
                </div>
                <ButtonGroup
                  fullWidth
                  variant="outlined"
                  disableElevation
                  color="inherit"
                  aria-label="ตำแหน่งเส้นกรอบ ด้านนอก ตรงกลาง หรือด้านใน"
                  sx={groupRootSx}
                >
                  {ICON_BORDER_POSITION_OPTIONS.map((opt) => {
                    const selected =
                      normalizeIconBorderPosition(merged.borderPosition) ===
                      opt.value;
                    return (
                      <Button
                        key={opt.value}
                        color="inherit"
                        onClick={() => patch({ borderPosition: opt.value })}
                        sx={{
                          ...groupButtonSx(selected, textColor),
                          fontSize: 11,
                          minHeight: 34,
                          px: 0.25,
                        }}
                      >
                        <Box
                          component="span"
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "4px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {selected ? (
                            <Check
                              className="size-3 shrink-0"
                              strokeWidth={3}
                              aria-hidden
                            />
                          ) : null}
                          {opt.label}
                        </Box>
                      </Button>
                    );
                  })}
                </ButtonGroup>
              </div>
            )}
            <div className="mt-2 w-full rounded-md bg-white px-[0px] pb-[5px] pt-[2px] dark:bg-zinc-800">
              <div className="px-[5px] pb-2">
                <input
                  type="range"
                  min={0}
                  max={255}
                  step={1}
                  value={iconThemeOpacitySliderValue}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    patch(
                      iconColorMode === "text"
                        ? { iconOpacity: v }
                        : iconColorMode === "divider"
                          ? { iconRowDividerOpacity: v }
                        : iconColorMode === "border"
                          ? { borderOpacity: v }
                          : { backgroundOpacity: v }
                    );
                  }}
                  className={THEME_RANGE_INPUT_CLASS}
                  style={{
                    ...themeRangeFillStyle,
                    ["--pos"]: `${(iconThemeOpacitySliderValue / 255) * 100}%`,
                  }}
                  aria-label="ความโปร่งแสงสี"
                />
              </div>
              <div className="grid grid-cols-10 place-items-center gap-x-0 gap-y-[6px]">
                {allColors.map((color, i) => {
                  const bgColor =
                    typeof color === "string"
                      ? color
                      : theme?.[color.type]?.[color.index];
                  if (bgColor == null) return null;
                  const value = color;
                  const selected =
                    chipSelected(activeIconColorSwatch, value) ||
                    activeIconColorSwatch === value;
                  let margin = "";
                  if (i % 8 !== 0 && (i + 1) % 8 !== 0) {
                    margin += "mx-[65.75px] ";
                  }
                  return (
                    <div className={`${margin}`} key={i}>
                      <button
                        type="button"
                        className="flex size-[25px] items-center justify-center rounded-full border"
                        style={{ backgroundColor: bgColor }}
                        onClick={() => {
                          if (iconColorMode === "text") {
                            patch({ iconColor: value });
                          } else if (iconColorMode === "divider") {
                            patch({ iconRowDividerColor: value });
                          } else if (iconColorMode === "border") {
                            patch({ borderColor: value });
                          } else {
                            /* fill mode: auto-set opacity ถ้ายังเป็น 0 (transparent) */
                            patch({
                              backgroundColor: value,
                              ...(merged.backgroundOpacity === 0
                                ? { backgroundOpacity: 255 }
                                : {}),
                            });
                          }
                        }}
                        aria-label={`เลือกสี ${bgColor}`}
                      >
                        {selected && (
                          <Check
                            className={swatchSelectedCheckClassName(bgColor)}
                            strokeWidth={4}
                          />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </li>

          {(!isListItemIcon ||
            (isCompoundListItemEdit && !isListIconsElement)) &&
            !isBetweenIconEdit && (
          <li>
            <Box sx={{ width: "100%", px: 0.25, mt: 0 }}>
              <div className="mb-3">
                <MainLabel
                  label="ลิงก์ URL"
                  mb={0}
                  checked={linkEnabled}
                  handleSwitch={(e) =>
                    handleLinkPatch({ linkEnabled: e.target.checked })
                  }
                  color={textColor}
                />
              </div>
              {linkEnabled && (
                <div className="space-y-1">
                  <input
                    type="text"
                    inputMode="url"
                    className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-2 text-[13px] leading-snug text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-200 focus:outline-none focus:ring-0 dark:border-white/10 dark:bg-slate-900/80 dark:text-white/90 dark:placeholder:text-slate-500 dark:focus:border-white/10 dark:focus:ring-0"
                    placeholder="https://example.com"
                    value={linkUrl}
                    onChange={(e) =>
                      handleLinkPatch({ linkUrl: e.target.value })
                    }
                    autoComplete="off"
                  />
                  <ButtonGroup
                    fullWidth
                    variant="outlined"
                    disableElevation
                    color="inherit"
                    aria-label="รูปแบบลิงค์"
                    sx={groupRootSx}
                  >
                    {LINK_TARGET_OPTIONS.map((opt) => {
                      const selected = linkTarget === opt.value;
                      return (
                        <Button
                          key={opt.value}
                          color="inherit"
                          onClick={() =>
                            handleLinkPatch({
                              linkTarget:
                                opt.value === "_blank" ? "_blank" : "_self",
                            })
                          }
                          sx={groupButtonSx(selected, textColor)}
                        >
                          <Box
                            component="span"
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "5px",
                            }}
                          >
                            {selected ? (
                              <Check
                                className="size-3.5 shrink-0"
                                strokeWidth={3}
                                aria-hidden
                              />
                            ) : null}
                            {opt.label}
                          </Box>
                        </Button>
                      );
                    })}
                  </ButtonGroup>
                </div>
              )}
            </Box>
          </li>
          )}

          {!isListIconsElement &&
            (!isListItemIcon || !isCompoundListItemEdit) &&
            !isListBoxItemIconEdit &&
            !isImageHoverIconEdit &&
            !isBetweenIconEdit && (
          <li>
            <div className="mb-3 flex items-center gap-2">
              <span className="shrink-0 text-[13px] font-semibold text-slate-700 dark:text-white/80">
                ตำแหน่งการจัดวางปุ่ม
              </span>
              <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
            </div>
            <ButtonGroup
              variant="outlined"
              fullWidth
              disableElevation
              aria-label="สลับจัดวางไอคอนชิดซ้าย ตรงกลาง หรือชิดขวา"
              sx={groupRootSx}
            >
              {[
                { value: "start",  Icon: AlignLeft,   label: "ชิดซ้าย" },
                { value: "center", Icon: AlignCenter,  label: "ตรงกลาง" },
                { value: "end",    Icon: AlignRight,   label: "ชิดขวา" },
              ].map(({ value, Icon, label }) => {
                const sel = iconLayoutAlign === value;
                return (
                  <Button
                    key={value}
                    color="inherit"
                    title={label}
                    onClick={() => patch({ iconLayoutAlign: value })}
                    sx={{ ...groupButtonSx(sel, textColor), minHeight: 36 }}
                  >
                    <Icon size={15} strokeWidth={3.5} />
                  </Button>
                );
              })}
            </ButtonGroup>
          </li>
          )}

          {!isCompoundListItemEdit &&
            !isImageHoverIconEdit &&
            !isBetweenIconEdit && <li>
            <div className="grid w-full grid-cols-2 gap-x-3 gap-y-4 px-0.5">
              <div className="min-w-0">
                <div className="mb-2 flex items-center gap-2">
                  <span className="shrink-0 text-[13px] font-semibold text-slate-700 dark:text-white/80">
                    ระยะด้านบน
                  </span>
                  <span className="shrink-0 text-xs text-slate-500 dark:text-white/50 tabular-nums">
                    {isListItemIcon
                      ? listMarginTop
                      : merged.iconMarginTop ?? ICON_ELEMENT_DEFAULTS.iconMarginTop}
                  </span>
                  <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
                </div>
                <div className="px-[2px] pb-[2px] pt-[2px]">
                  <Range
                    min={0}
                    max={80}
                    step={1}
                    value={
                      isListItemIcon
                        ? listMarginTop
                        : merged.iconMarginTop ?? ICON_ELEMENT_DEFAULTS.iconMarginTop
                    }
                    pos={
                      ((isListItemIcon
                        ? listMarginTop
                        : merged.iconMarginTop ?? ICON_ELEMENT_DEFAULTS.iconMarginTop) /
                        80) *
                      100
                    }
                    color={textColor}
                    handleChange={(e) =>
                      patch(
                        isListItemIcon
                          ? { listMarginTop: Number(e.target.value) || 0 }
                          : { iconMarginTop: Number(e.target.value) || 0 }
                      )
                    }
                    className={THEME_RANGE_INPUT_CLASS}
                  />
                </div>
              </div>
              <div className="min-w-0">
                <div className="mb-2 flex items-center gap-2">
                  <span className="shrink-0 text-[13px] font-semibold text-slate-700 dark:text-white/80">
                    ระยะด้านล่าง
                  </span>
                  <span className="shrink-0 text-xs text-slate-500 dark:text-white/50 tabular-nums">
                    {isListItemIcon
                      ? listMarginBottom
                      : merged.iconMarginBottom ??
                        ICON_ELEMENT_DEFAULTS.iconMarginBottom}
                  </span>
                  <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
                </div>
                <div className="px-[2px] pb-[2px] pt-[2px]">
                  <Range
                    min={0}
                    max={80}
                    step={1}
                    value={
                      isListItemIcon
                        ? listMarginBottom
                        : merged.iconMarginBottom ??
                          ICON_ELEMENT_DEFAULTS.iconMarginBottom
                    }
                    pos={
                      ((isListItemIcon
                        ? listMarginBottom
                        : merged.iconMarginBottom ??
                          ICON_ELEMENT_DEFAULTS.iconMarginBottom) /
                        80) *
                      100
                    }
                    color={textColor}
                    handleChange={(e) =>
                      patch(
                        isListItemIcon
                          ? { listMarginBottom: Number(e.target.value) || 0 }
                          : { iconMarginBottom: Number(e.target.value) || 0 }
                      )
                    }
                    className={THEME_RANGE_INPUT_CLASS}
                  />
                </div>
              </div>
            </div>
          </li>}

        </ul>
      </nav>

      <ServiceIcon
        header="เลือกไอคอน"
        icon={data?.faIcon}
        open={iconPickerOpen}
        onClose={() => setIconPickerOpen(false)}
        handleChange={(ic) => patch({ faIcon: ic })}
        darkColor={textColor || "#0d9488"}
        darkMode={darkMode}
      />
    </aside>
  );
};

export default IconElementOffcanvas;
