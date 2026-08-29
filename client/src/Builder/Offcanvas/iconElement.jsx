import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Box, Button, ButtonGroup, Typography } from "@mui/material";
import { AlignCenter, AlignLeft, AlignRight, Check, Sparkles } from "lucide-react";
import lodash from "lodash";
import ServiceIcon from "../ServiceIcon";
import IconAwsome from "../IconAwsome";
import {
  ICON_ELEMENT_DEFAULTS,
  ICON_STANDALONE_CONTAINER_MAX,
  ICON_STANDALONE_CONTAINER_MIN,
  applyIconCanvasPreview,
  clearIconCanvasPreview,
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
import Range, { applyRangeFillPos } from "../HTML/Range";
import SelectLine from "../HTML/SelectLine";
import { panelGroupButtonSx } from "../panelControlSx";
import {
  markBuilderPanelMounted,
  usePanelSliderPreview,
} from "../panelPreviewStore";

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

function colorSwatchKey(value) {
  if (typeof value === "string") return value.toLowerCase();
  if (value && typeof value === "object") {
    return `${value.type}:${value.index}`;
  }
  return String(value ?? "");
}

const OPTION_CHIP_RADIUS = "0.375rem";

const groupButtonSx = panelGroupButtonSx;

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
    borderColor: "var(--dash-panel-btn-group-border, #e2e8f0) !important",
  },
  "& .MuiButtonGroup-grouped.MuiButton-outlined:not(:last-of-type)": {
    borderRightColor: "var(--dash-panel-btn-group-border, #e2e8f0) !important",
  },
  ".dark & .MuiButtonGroup-grouped.MuiButton-outlined": {
    borderColor: "var(--dash-panel-btn-group-border, #e2e8f0) !important",
  },
  ".dark & .MuiButtonGroup-grouped.MuiButton-outlined:not(:last-of-type)": {
    borderRightColor: "var(--dash-panel-btn-group-border, #e2e8f0) !important",
  },
};

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
  const themeRef = useRef(theme);
  themeRef.current = theme;
  const swatchRootRef = useRef(null);
  const selectedSwatchKeyRef = useRef("");

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
  const dataRef = useRef(element);

  useLayoutEffect(() => {
    if (!element?.id) return;
    markBuilderPanelMounted("Icon", element.id);
  }, [element?.id]);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const iconColorModeRef = useRef(
    element?.type === "list" && element?.listIconsElement === true
      ? "text"
      : ICON_COLOR_MODES_BASE[0].value
  );
  const colorModeLabelRef = useRef(null);
  const opacitySliderRef = useRef(null);
  const colorPickerRootRef = useRef(null);
  const colorModesRef = useRef(ICON_COLOR_MODES_BASE);
  const isListItemIcon = data?.type === "list";
  const isListIconsElement =
    isListItemIcon && data?.listIconsElement === true;
  const isTableFirstColumnIconEdit = Boolean(data?.__tableFirstColumnIconEdit);
  /** List iTems / List iCons ดับเบิลคลิกไอคอน — พื้นหลังไอคอน/ความกว้าง/ขนาด/มุมมนอยู่ที่แผง List หลัก */
  const hideListItemsSharedIconDims =
    Boolean(data?.__listItemIconEdit) || isTableFirstColumnIconEdit;
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
      if (!prev || prev.id !== element.id) {
        dataRef.current = element;
        return element;
      }
      return prev;
    });
  }, [element]);

  useEffect(() => {
    setIconPickerOpen(false);
  }, [element?.id]);

  const rememberLatest = (next) => {
    dataRef.current = next;
    return next;
  };

  const { updateSlider, commitSlider } = usePanelSliderPreview({
    type: "icon",
    targetIds: [element?.id],
    data,
    setData,
    onCommit: (latest) => {
      const id = elementRef.current?.id ?? latest?.id;
      dataRef.current = latest;
      setData(latest);
      scheduleLayoutSync(latest);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          clearIconCanvasPreview(id);
        });
      });
    },
  });

  const patch = (partial) => {
    const next = rememberLatest(
      updateSlider((prev) => ({ ...prev, ...partial }), {
        publish: false,
        trackPerf: false,
      })
    );
    scheduleLayoutSync(next);
  };

  const patchIcon = (partial) => {
    const next = rememberLatest(
      updateSlider((prev) => ({ ...prev, ...partial }), {
        setData: false,
        publish: false,
        trackPerf: false,
      })
    );
    scheduleLayoutSync(next);
    return next;
  };

  const patchStyle = (partial) => {
    const next = rememberLatest(
      updateSlider((prev) => ({ ...prev, ...partial }), {
        setData: false,
        publish: false,
        trackPerf: false,
      })
    );
    const id = elementRef.current?.id ?? data?.id;
    applyIconCanvasPreview(id, next, themeRef.current);
    scheduleLayoutSync(next);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        clearIconCanvasPreview(id);
      });
    });
    return next;
  };

  const patchSlider = (partial) => {
    const next = rememberLatest(
      updateSlider((prev) => ({ ...prev, ...partial }), {
        setData: false,
        publish: false,
      })
    );
    applyIconCanvasPreview(
      elementRef.current?.id ?? data?.id,
      next,
      themeRef.current
    );
    return next;
  };

  const handleLinkPatch = (p) => {
    const next = rememberLatest(
      updateSlider((prev) => ({ ...prev, ...p }), {
        publish: false,
        trackPerf: false,
      })
    );
    scheduleLayoutSync(next);
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
  colorModesRef.current = iconColorModesEffective;
  const iconColorModeLabel =
    iconColorModesEffective.find((o) => o.value === iconColorModeRef.current)
      ?.label ?? "";

  const resolveColorMode = (mode, d) => {
    if (mode === "text") {
      return {
        color: d?.iconColor ?? ICON_ELEMENT_DEFAULTS.iconColor,
        opacity: Number.isFinite(Number(d?.iconOpacity))
          ? Math.max(0, Math.min(255, Number(d.iconOpacity)))
          : ICON_ELEMENT_DEFAULTS.iconOpacity,
      };
    }
    if (mode === "divider") {
      return {
        color: d?.iconRowDividerColor ?? ICON_ELEMENT_DEFAULTS.iconRowDividerColor,
        opacity: Number.isFinite(Number(d?.iconRowDividerOpacity))
          ? Math.max(0, Math.min(255, Number(d.iconRowDividerOpacity)))
          : ICON_ELEMENT_DEFAULTS.iconRowDividerOpacity,
      };
    }
    if (mode === "border") {
      return {
        color: d?.borderColor ?? ICON_ELEMENT_DEFAULTS.borderColor,
        opacity: Number.isFinite(Number(d?.borderOpacity))
          ? Math.max(0, Math.min(255, Number(d.borderOpacity)))
          : ICON_ELEMENT_DEFAULTS.borderOpacity,
      };
    }
    return {
      color: d?.backgroundColor ?? ICON_ELEMENT_DEFAULTS.backgroundColor,
      opacity: Number.isFinite(Number(d?.backgroundOpacity))
        ? Math.max(0, Math.min(255, Number(d.backgroundOpacity)))
        : ICON_ELEMENT_DEFAULTS.backgroundOpacity,
    };
  };

  const applySwatchSelection = (value) => {
    const nextKey = colorSwatchKey(value);
    selectedSwatchKeyRef.current = nextKey;
    swatchRootRef.current?.querySelectorAll("[data-swatch-key]").forEach((btn) => {
      const check = btn.querySelector("[data-swatch-check]");
      if (check) check.hidden = btn.getAttribute("data-swatch-key") !== nextKey;
    });
  };

  const paintIconColorMode = (mode) => {
    iconColorModeRef.current = mode;
    const label =
      colorModesRef.current.find((o) => o.value === mode)?.label ?? "";
    if (colorModeLabelRef.current) colorModeLabelRef.current.textContent = label;
    colorPickerRootRef.current
      ?.querySelectorAll("[data-icon-border-only]")
      .forEach((node) => {
        node.hidden = mode !== "border";
      });
    const resolved = resolveColorMode(mode, dataRef.current);
    if (opacitySliderRef.current) {
      opacitySliderRef.current.value = String(resolved.opacity);
      applyRangeFillPos(opacitySliderRef.current, 0, 255);
    }
    applySwatchSelection(resolved.color);
  };

  const cycleIconColorMode = (delta) => {
    const list = colorModesRef.current;
    const idx = list.findIndex((o) => o.value === iconColorModeRef.current);
    const base = idx === -1 ? 0 : idx;
    paintIconColorMode(list[(base + delta + list.length) % list.length].value);
  };

  useLayoutEffect(() => {
    const openListIconsItemGlyph =
      element?.type === "list" && element?.listIconsElement === true;
    paintIconColorMode(
      openListIconsItemGlyph ? "text" : ICON_COLOR_MODES_BASE[0].value
    );
    // เปิดแผงใหม่เท่านั้น — อย่า paint ซ้ำทุกครั้งที่ data เปลี่ยน
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element?.id, element?.type, element?.listIconsElement]);

  useLayoutEffect(() => {
    const mode = iconColorModeRef.current;
    if (!borderEnabled && !allowFillModeWithoutBorder && mode !== "text") {
      paintIconColorMode("text");
      return;
    }
    if ((!allowBorderColorMode || isListItemIcon) && mode === "border") {
      paintIconColorMode(ICON_COLOR_MODES_BASE[0].value);
      return;
    }
    if (
      mode === "divider" &&
      !(showIconRowGapControl && data?.iconRowDividerEnabled === true)
    ) {
      paintIconColorMode(ICON_COLOR_MODES_BASE[0].value);
    }
  }, [
    allowBorderColorMode,
    allowFillModeWithoutBorder,
    borderEnabled,
    isListItemIcon,
    showIconRowGapControl,
    data?.iconRowDividerEnabled,
  ]);

  const iconThemeOpacitySliderValue = resolveColorMode(
    iconColorModeRef.current,
    data
  ).opacity;

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

  return (
    <aside
      className={`
     dash-panel flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden border-r border-slate-200 dark:border-white/10 `}
    >
      <div className="shrink-0 px-6 pt-5 pb-3 flex items-center justify-between dash-panel-header bg-gray-100 dark:bg-gray-900/50">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 font-bold tracking-wide">
            {panelTitle}
          </span>
          <button
            type="button"
            className="inline-flex shrink-0 items-center rounded-md border border-[#333333] bg-[#333333] px-1.5 py-0.5 text-[11px] font-mono font-bold leading-none text-white tabular-nums dark:border-[#333333] dark:bg-[#333333] dark:text-white"
            title={String(data?.id ?? "")}
            aria-label={`คัดลอก ID ${String(data?.id ?? "")}`}
            onClick={() => {
              const id = String(data?.id ?? "");
              if (!id || typeof navigator?.clipboard?.writeText !== "function") return;
              navigator.clipboard.writeText(id).catch(() => {});
            }}
          >
            {(() => {
              const id = String(data?.id ?? "");
              const maxChars = 15;
              return id.length > maxChars ? `${id.slice(0, maxChars)}…` : id;
            })()}
          </button>
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
              <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                ไอคอน Font Awesome
              </span>
              <div className="dash-heading-rule min-w-0 flex-1 border-b" />
            </div>
            <div className="flex dash-input h-10 w-full overflow-hidden rounded-md border border-slate-200 bg-white dark:border-white/10 dark:bg-[#27272a]">
              <button
                type="button"
                className="flex shrink-0 items-center justify-center border-r border-slate-200 bg-transparent px-3 py-2.5 text-slate-600 transition hover:opacity-80 dark:border-white/10 dark:text-slate-300"
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
                    style={{
                      fontSize: 22,
                      color: "var(--dash-panel-btn-group-inactive-text, #1e293b)",
                    }}
                  />
                ) : (
                  <span
                    className="inline-flex"
                    style={{
                      color: "var(--dash-panel-btn-group-inactive-text, #1e293b)",
                    }}
                  >
                    <Sparkles className="size-5 shrink-0" strokeWidth={2} />
                  </span>
                )}
              </button>
              <div className="flex min-w-0 flex-1 flex-col justify-center px-2.5 py-1">
                <Typography
                  variant="caption"
                  sx={{
                    color: "var(--dash-panel-btn-group-inactive-text, #64748b)",
                  }}
                >
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
                <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                  พื้นหลังไอคอน
                </span>
                <div className="dash-heading-rule min-w-0 flex-1 border-b" />
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
                    <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                      ความกว้าง
                    </span>
                    <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                    <span className="shrink-0 text-xs text-slate-500 dark:text-white/50 tabular-nums">
                      {merged.containerSize}
                    </span>
                  </div>
                  <div className="w-full dash-card rounded-md bg-white px-[0px] pb-[0px] pt-[2px] dark:bg-zinc-800">
                    <div className="px-[0px] pb-0">
                      <Range
                        min={containerPanelMin}
                        max={containerPanelMax}
                        step={1}
                        value={containerSliderValue}
                        pos={containerSliderPosPct}
                        color={textColor}
                        uncontrolled
                        handleChange={(e) =>
                          patchSlider({
                            containerSize:
                              Number(e.target.value) || containerDefault,
                          })
                        }
                        onCommit={(_, reason) => commitSlider(reason)}
                      />
                    </div>
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                      ขนาดไอคอน
                    </span>
                    <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                    <span className="shrink-0 text-xs text-slate-500 dark:text-white/50 tabular-nums">
                      {merged.iconSize}
                    </span>
                  </div>
                  <div className="w-full dash-card rounded-md bg-white px-[0px] pb-[0px] pt-[0px] dark:bg-zinc-800">
                    <div className="px-[0px] pb-0">
                      <Range
                        min={12}
                        max={96}
                        step={1}
                        value={iconSliderValue}
                        pos={iconSliderPosPct}
                        color={textColor}
                        uncontrolled
                        handleChange={(e) =>
                          patchSlider({
                            iconSize: Number(e.target.value) || 28,
                          })
                        }
                        onCommit={(_, reason) => commitSlider(reason)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-2 flex items-center gap-2">
                  <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                    ขนาดไอคอน
                  </span>
                  <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                  <span className="text-xs text-slate-500 dark:text-white/50">
                    {merged.iconSize}
                  </span>
                </div>
                <div className="w-full dash-card rounded-md bg-white px-[0px] pb-[0px] pt-[0px] dark:bg-zinc-800">
                  <div className="px-[0px] pb-0">
                    <Range
                      min={12}
                      max={96}
                      step={1}
                      value={iconSliderValue}
                      pos={iconSliderPosPct}
                      color={textColor}
                      uncontrolled
                      handleChange={(e) =>
                        patchSlider({
                          iconSize: Number(e.target.value) || 28,
                        })
                      }
                      onCommit={(_, reason) => commitSlider(reason)}
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
            !isBetweenIconEdit &&
            !isTableFirstColumnIconEdit && (
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
                uncontrolled
                handleChange={(e) =>
                  patchSlider({ iconRowGap: Number(e.target.value) || 0 })
                }
                onCommit={(_, reason) => commitSlider(reason)}
              />
            </div>
            {data?.iconRowDividerEnabled === true && (
              <div className="mt-3">
                <div className="mb-2 flex items-center gap-2">
                  <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                    รูปแบบเส้นคั่น
                  </span>
                  <div className="dash-heading-rule min-w-0 flex-1 border-b" />
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
                <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                  มุมมน
                </span>
                <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                <span className="shrink-0 text-xs text-slate-500 dark:text-white/50 tabular-nums">
                  {merged.iconCornerRadius}
                </span>
              </div>
              <Range
                min={0}
                max={48}
                step={1}
                value={cornerSliderValue}
                pos={cornerSliderPosPct}
                color={textColor}
                uncontrolled
                handleChange={(e) =>
                  patchSlider({
                    iconCornerRadius: Number(e.target.value) || 0,
                  })
                }
                onCommit={(_, reason) => commitSlider(reason)}
              />
            </li>
          )}

          {!isTableFirstColumnIconEdit && (
          <li>
            <div className="mb-2 flex items-center gap-2">
              <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
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
              <div className="dash-heading-rule min-w-0 flex-1 border-b" />
            </div>
            <div ref={colorPickerRootRef}>
            {iconColorModesEffective.length > 1 ? (
              <div className="mb-1">
                <SelectLine
                  prev={() => cycleIconColorMode(-1)}
                  next={() => cycleIconColorMode(1)}
                  value={iconColorModeLabel}
                  valueRef={colorModeLabelRef}
                />
              </div>
            ) : null}
            {borderEnabled && (
              <div
                data-icon-border-only=""
                hidden={iconColorModeRef.current !== "border"}
                className="mb-2 mt-3 space-y-2"
              >
                <div className="mb-1 flex items-center gap-2">
                  <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                    ความหนากรอบ
                  </span>
                  <div className="dash-heading-rule min-w-0 flex-1 border-b" />
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
                  <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                    รูปแบบของกรอบ
                  </span>
                  <div className="dash-heading-rule min-w-0 flex-1 border-b" />
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
                  <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                    ตำแหน่งกรอบ
                  </span>
                  <div className="dash-heading-rule min-w-0 flex-1 border-b" />
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
            <div
              className="mt-2 dash-card w-full rounded-md bg-white px-[0px] pb-[5px] pt-[2px] dark:bg-zinc-800"
            >
              <div className="px-[5px] pb-2">
                <Range
                  min={0}
                  max={255}
                  step={1}
                  value={iconThemeOpacitySliderValue}
                  pos={(iconThemeOpacitySliderValue / 255) * 100}
                  color={textColor}
                  uncontrolled
                  inputRef={opacitySliderRef}
                  handleChange={(e) => {
                    const v = Number(e.target.value);
                    const mode = iconColorModeRef.current;
                    patchSlider(
                      mode === "text"
                        ? { iconOpacity: v }
                        : mode === "divider"
                          ? { iconRowDividerOpacity: v }
                        : mode === "border"
                          ? { borderOpacity: v }
                          : { backgroundOpacity: v }
                    );
                  }}
                  onCommit={(_, reason) => commitSlider(reason)}
                />
              </div>
              <div
                ref={swatchRootRef}
                className="grid grid-cols-10 place-items-center gap-x-0 gap-y-[6px]"
              >
                {allColors.map((color, i) => {
                  const bgColor =
                    typeof color === "string"
                      ? color
                      : theme?.[color.type]?.[color.index];
                  if (bgColor == null) return null;
                  const value = color;
                  const key = colorSwatchKey(value);
                  let margin = "";
                  if (i % 8 !== 0 && (i + 1) % 8 !== 0) {
                    margin += "mx-[65.75px] ";
                  }
                  return (
                    <div className={`${margin}`} key={i}>
                      <button
                        type="button"
                        data-swatch-key={key}
                        className="flex size-[25px] items-center justify-center rounded-full border"
                        style={{ backgroundColor: bgColor }}
                        onClick={() => {
                          applySwatchSelection(value);
                          const mode = iconColorModeRef.current;
                          if (mode === "text") {
                            patchStyle({ iconColor: value });
                          } else if (mode === "divider") {
                            patchStyle({ iconRowDividerColor: value });
                          } else if (mode === "border") {
                            patchStyle({ borderColor: value });
                          } else {
                            const bgOpacityRaw = Number(
                              dataRef.current?.backgroundOpacity
                            );
                            patchStyle({
                              backgroundColor: value,
                              ...(bgOpacityRaw === 0
                                ? { backgroundOpacity: 255 }
                                : {}),
                            });
                          }
                        }}
                        aria-label={`เลือกสี ${bgColor}`}
                      >
                        <Check
                          data-swatch-check=""
                          hidden={selectedSwatchKeyRef.current !== key}
                          className={swatchSelectedCheckClassName(bgColor)}
                          strokeWidth={4}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
            </div>
          </li>
          )}

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
                    className="dash-input h-10 w-full rounded-md border border-slate-200 bg-white px-2.5 py-2 text-[13px] leading-snug text-slate-800 outline-none transition placeholder:text-slate-400 dark:border-white/10 dark:bg-[#27272a] dark:text-white/90 dark:placeholder:text-slate-500"
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
            !isBetweenIconEdit &&
            !isTableFirstColumnIconEdit && (
          <li>
            <div className="mb-3 flex items-center gap-2">
              <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                ตำแหน่งการจัดวางปุ่ม
              </span>
              <div className="dash-heading-rule min-w-0 flex-1 border-b" />
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
                    <Icon size={(void Icon, 15)} strokeWidth={3.5} />
                  </Button>
                );
              })}
            </ButtonGroup>
          </li>
          )}

          {!isCompoundListItemEdit &&
            !isImageHoverIconEdit &&
            !isBetweenIconEdit &&
            !isTableFirstColumnIconEdit && <li>
            <div className="grid w-full grid-cols-2 gap-x-3 gap-y-4 px-0.5">
              <div className="min-w-0">
                <div className="mb-2 flex items-center gap-2">
                  <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                    ระยะด้านบน
                  </span>
                  <span className="shrink-0 text-xs text-slate-500 dark:text-white/50 tabular-nums">
                    {isListItemIcon
                      ? listMarginTop
                      : merged.iconMarginTop ?? ICON_ELEMENT_DEFAULTS.iconMarginTop}
                  </span>
                  <div className="dash-heading-rule min-w-0 flex-1 border-b" />
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
                    uncontrolled
                    handleChange={(e) =>
                      patchSlider(
                        isListItemIcon
                          ? { listMarginTop: Number(e.target.value) || 0 }
                          : { iconMarginTop: Number(e.target.value) || 0 }
                      )
                    }
                    onCommit={(_, reason) => commitSlider(reason)}
                  />
                </div>
              </div>
              <div className="min-w-0">
                <div className="mb-2 flex items-center gap-2">
                  <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                    ระยะด้านล่าง
                  </span>
                  <span className="shrink-0 text-xs text-slate-500 dark:text-white/50 tabular-nums">
                    {isListItemIcon
                      ? listMarginBottom
                      : merged.iconMarginBottom ??
                        ICON_ELEMENT_DEFAULTS.iconMarginBottom}
                  </span>
                  <div className="dash-heading-rule min-w-0 flex-1 border-b" />
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
                    uncontrolled
                    handleChange={(e) =>
                      patchSlider(
                        isListItemIcon
                          ? { listMarginBottom: Number(e.target.value) || 0 }
                          : { iconMarginBottom: Number(e.target.value) || 0 }
                      )
                    }
                    onCommit={(_, reason) => commitSlider(reason)}
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
        handleChange={(ic) => patchIcon({ faIcon: ic })}
        darkColor={textColor || "#0d9488"}
        darkMode={darkMode}
      />
    </aside>
  );
};

export default IconElementOffcanvas;
