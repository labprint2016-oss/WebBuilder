import React from "react";
import { Image as ImagePlaceholderIcon, ScanEye } from "lucide-react";
import {
  Typography,
  Button,
  Modal,
  Box,
  Fade,
  Backdrop,
  Divider,
  ListItem,
  List,
  ListItemText,
  ListItemAvatar,
  GlobalStyles
} from "@mui/material";
import IconAwsome from "../../IconAwsome";
import { setColor, setFont } from "../../../../function";
import SegmentedRichText from "../../richText/SegmentedRichText";
import {
  migrateLabelToParagraph,
  normalizeParagraph,
} from "../../richText/richTextParagraphModel";
import {
  isValidFaIconRef,
  resolveIconBackgroundCss,
  resolveIconGlyphColor,
} from "./iconElementConfig";
import {
  IMAGE_BRIGHTNESS_DEFAULT,
  imageBrightnessFilterStyle,
  imageCornerRadiusStyle,
  resolveImageLinkAttrs,
} from "./imageAspectConfig";
import {
  mergeListElement,
  LIST_ELEMENT_DEFAULTS,
  LIST_IMAGE_DEFAULT_TEXT,
  LIST_IMAGE_DEFAULT_CONTAINER_SIZE,
  LIST_IMAGE_DEFAULT_LIST_MARGIN,
  LIST_IMAGE_DEFAULT_CAPTION_FONT_SIZE,
  listIconsFallbackIconSize,
} from "./listElementConfig";
import { BUTTON_STYLE_DEFAULTS } from "./buttonElementConfig";




const LIST_DIVIDER_GAP_PX = 0;
/** โหมดออกแบบ: ลด mt/mb ของ List เทียบกับค่า Panel ต่อด้าน (px) */
const LIST_LAYOUT_MARGIN_TRIM_PX = 2;
const LIST_MIN_TEXT_LINES = 2;
const LIST_TEXT_LINE_HEIGHT_RATIO = 1.5;
const LIST_DIVIDER_Y_OFFSET_PX = 1;
/** Legacy List iCons (listItems ไม่ compound): ระยะซ้าย/ขวาของเส้นคั่นแนวตั้งในแถว listRow */
const LIST_ICONS_INLINE_DIVIDER_GAP_LEFT_PX = 12;
const LIST_ICONS_INLINE_DIVIDER_GAP_RIGHT_PX = 2;
/** ลดความสูงเส้นคั่นแนวตั้ง List iCons (รวม inset บน+ล่าง px) — ค่าน้อย = เส้นสูงขึ้น */
const LIST_ICONS_INLINE_DIVIDER_VERTICAL_TRIM_PX = 21;
const LIST_TEXT_GAP_BASE_PX = 14;

/** List iTems — ความกว้างกล่องไอคอน (รวม listItemIconBgWidth) */
function resolveListItemsRowIconContainer(item, sharedData) {
  if (sharedData?.listImageElement) {
    return Number.isFinite(Number(item?.containerSize))
      ? Math.max(28, Number(item.containerSize))
      : LIST_IMAGE_DEFAULT_CONTAINER_SIZE;
  }
  if (sharedData?.listIconsElement === true) {
    return Number.isFinite(Number(item?.containerSize))
      ? Math.max(28, Number(item.containerSize))
      : LIST_ELEMENT_DEFAULTS.containerSize;
  }
  if (Number.isFinite(Number(item?.containerSize))) {
    return Math.max(28, Number(item.containerSize));
  }
  const w = Number(sharedData?.listItemIconBgWidth);
  const def = LIST_ELEMENT_DEFAULTS.listItemIconBgWidth;
  return Math.max(28, Math.min(160, Number.isFinite(w) ? w : def));
}

/** List iTems — ขนาดไอคอน (รวม listItemIconSize) */
function resolveListItemsRowIconSize(item, sharedData) {
  if (sharedData?.listIconsElement === true) {
    return Number.isFinite(Number(item?.iconSize))
      ? Math.max(12, Number(item.iconSize))
      : listIconsFallbackIconSize(sharedData);
  }
  if (Number.isFinite(Number(item?.iconSize))) {
    return Math.max(12, Number(item.iconSize));
  }
  const s = Number(sharedData?.listItemIconSize);
  const def = LIST_ELEMENT_DEFAULTS.listItemIconSize;
  return Math.max(12, Math.min(96, Number.isFinite(s) ? s : def));
}

function resolveListItemsRowBorderEnabled(item, sharedData) {
  if (sharedData?.listIconsElement === true) {
    return item?.borderEnabled === true;
  }
  if (sharedData?.listImageElement) {
    return item?.borderEnabled !== false;
  }
  return (
    sharedData?.listItemIconFrameEnabled !== false && item?.borderEnabled !== false
  );
}

function resolveListItemsRowIconShape(item, sharedData) {
  if (sharedData?.listIconsElement === true || sharedData?.listImageElement) {
    return item?.iconShape;
  }
  const v = item?.iconShape ?? sharedData?.listItemIconShape;
  return v === "rounded" ? "rounded" : "circle";
}

function resolveListItemsRowIconCorner(item, sharedData, iconContainerPx) {
  if (sharedData?.listImageElement) {
    return Number.isFinite(Number(item?.iconCornerRadius))
      ? Number(item.iconCornerRadius)
      : LIST_ELEMENT_DEFAULTS.iconCornerRadius;
  }
  if (sharedData?.listIconsElement === true) {
    return Number.isFinite(Number(item?.iconCornerRadius))
      ? Number(item.iconCornerRadius)
      : LIST_ELEMENT_DEFAULTS.iconCornerRadius;
  }
  const fromItem = Number(item?.iconCornerRadius);
  const fromRoot = Number(sharedData?.listItemIconCornerRadius);
  const raw = Number.isFinite(fromItem)
    ? fromItem
    : Number.isFinite(fromRoot)
      ? fromRoot
      : LIST_ELEMENT_DEFAULTS.iconCornerRadius;
  return Math.max(0, Math.min(80, Math.round(raw)));
}

/** มุมมนรูป List iMage — ใช้ borderRadius จากแผง Image; ไม่มีค่าใช้ iconShape เดิม */
function getListImageThumbCornerStyle(item, iconContainerPx) {
  if (item?.borderRadius !== undefined && item?.borderRadius !== null) {
    return imageCornerRadiusStyle(item.borderRadius, "1 / 1");
  }
  if (item?.iconShape === "rounded") {
    const px = Math.max(
      0,
      Math.min(
        Number(item?.iconCornerRadius) || LIST_ELEMENT_DEFAULTS.iconCornerRadius,
        iconContainerPx / 2
      )
    );
    return { borderRadius: `${px}px` };
  }
  return { borderRadius: "50%" };
}

/** ขนาดคอลัมน์ไอคอน + ความสูงแกนแถว — ใช้คำนวณการจัดวางแถว */
function computeListItemRowIconMetrics(item, sharedData) {
  const isListImage = sharedData?.listImageElement === true;
  const listTextSize = Number.isFinite(Number(sharedData?.listTextSize))
    ? Number(sharedData.listTextSize)
    : LIST_ELEMENT_DEFAULTS.listTextSize;
  const iconContainer = resolveListItemsRowIconContainer(item, sharedData);
  const iconSize = resolveListItemsRowIconSize(item, sharedData);
  const borderEnabled = resolveListItemsRowBorderEnabled(item, sharedData);
  const iconRenderBoxSize =
    !isListImage && !borderEnabled ? iconSize : iconContainer;
  const minTextBlockHeight =
    listTextSize * LIST_TEXT_LINE_HEIGHT_RATIO * LIST_MIN_TEXT_LINES;
  const rowCoreHeight = Math.max(iconRenderBoxSize, minTextBlockHeight);
  return { iconRenderBoxSize, rowCoreHeight };
}

/** Render item เดี่ยว (icon + text row) */
function ListItemRow({
  item,
  itemIndex,
  isLast,
  sharedData,
  theme,
  onEditIcon,
  onEditText,
  isLayoutMode,
  showInlineDividerAfter,
}) {
  const isListImage = sharedData?.listImageElement === true;
  const listTextColor = setColor(
    theme,
    sharedData?.listTextColor ?? LIST_ELEMENT_DEFAULTS.listTextColor,
    Number.isFinite(Number(sharedData?.listTextOpacity))
      ? Number(sharedData.listTextOpacity)
      : LIST_ELEMENT_DEFAULTS.listTextOpacity
  );
  const listTextSize = Number.isFinite(Number(sharedData?.listTextSize))
    ? Number(sharedData.listTextSize)
    : LIST_ELEMENT_DEFAULTS.listTextSize;

  const iconContainer = resolveListItemsRowIconContainer(item, sharedData);

  const listTextGapAdjust = Number.isFinite(Number(sharedData?.listTextGapAdjust))
    ? Number(sharedData.listTextGapAdjust)
    : 0;
  const listIconTextGapPxRaw = sharedData?.listIconTextGapPx;
  const textColumnGap = Number.isFinite(Number(listIconTextGapPxRaw))
    ? Math.max(0, Math.min(64, Number(listIconTextGapPxRaw)))
    : Math.max(0, LIST_ELEMENT_DEFAULTS.listIconTextGapPx + listTextGapAdjust);
  const iconBoxPad =
    Number.isFinite(Number(listIconTextGapPxRaw)) &&
    Number(listIconTextGapPxRaw) <= 8
      ? 0
      : 2;

  const iconSize = resolveListItemsRowIconSize(item, sharedData);
  const borderEnabled = resolveListItemsRowBorderEnabled(item, sharedData);
  const iconRenderBoxSize =
    !isListImage && !borderEnabled ? iconSize : iconContainer;
  const minTextBlockHeight =
    listTextSize * LIST_TEXT_LINE_HEIGHT_RATIO * LIST_MIN_TEXT_LINES;
  const rowCoreHeight = Math.max(iconRenderBoxSize, minTextBlockHeight);

  /* merge defaults เพื่อ resolveIconBackgroundCss */
  const iconDataForResolve = { ...LIST_ELEMENT_DEFAULTS, ...item };
  const iconBg = resolveIconBackgroundCss(iconDataForResolve, theme);
  const iconFg = resolveIconGlyphColor(iconDataForResolve, theme);
  const fa = item?.faIcon ?? { name: "faShieldHalved", type: "fas" };
  const showFa = isValidFaIconRef(fa);
  const listImageSrc =
    typeof item?.src === "string" && item.src.trim() !== "" ? item.src.trim() : "";
  const listImageBrightness = Number.isFinite(Number(item?.brightness))
    ? Number(item.brightness)
    : IMAGE_BRIGHTNESS_DEFAULT;
  const listImageBrightnessStyle = imageBrightnessFilterStyle(listImageBrightness);
  const listImageCornerStyle = isListImage
    ? getListImageThumbCornerStyle(item, iconContainer)
    : {};

  const listText =
    typeof item?.listText === "string" && item.listText.trim()
      ? item.listText
      : isListImage
        ? LIST_IMAGE_DEFAULT_TEXT
        : LIST_ELEMENT_DEFAULTS.listItems?.[0]?.listText ?? "รายการ";

  const listTextParagraph = item?.listTextParagraph
    ? normalizeParagraph(item.listTextParagraph)
    : migrateLabelToParagraph({ label: listText });

  const dividerEnabled =
    sharedData?.listDividerEnabled !== undefined
      ? Boolean(sharedData.listDividerEnabled)
      : LIST_ELEMENT_DEFAULTS.listDividerEnabled;
  const dividerStyle =
    typeof sharedData?.listDividerStyle === "string" && sharedData.listDividerStyle.trim()
      ? sharedData.listDividerStyle
      : LIST_ELEMENT_DEFAULTS.listDividerStyle;
  const dividerColor = setColor(
    theme,
    sharedData?.listDividerColor ?? LIST_ELEMENT_DEFAULTS.listDividerColor,
    Number.isFinite(Number(sharedData?.listDividerOpacity))
      ? Number(sharedData.listDividerOpacity)
      : LIST_ELEMENT_DEFAULTS.listDividerOpacity
  );

  /** List iTems + List iMage — ซ่อนเส้นคั่นแนวนอนเมื่อใช้เส้นแนวตั้ง (และเส้นคั่นหลักยังเปิด) */
  const verticalTimelineDivider =
    sharedData?.listVerticalTimelineDivider === true &&
    !sharedData?.listIconsElement &&
    dividerEnabled;

  const listItemsIconAlignRaw =
    sharedData?.listIconsElement !== true ? sharedData?.listItemsIconAlign : undefined;
  const listItemsIconAlign =
    listItemsIconAlignRaw === "start" ||
    listItemsIconAlignRaw === "end" ||
    listItemsIconAlignRaw === "split"
      ? listItemsIconAlignRaw
      : LIST_ELEMENT_DEFAULTS.listItemsIconAlign;
  /** List iMage + split + รูปซ้าย: ไม่ reverse แถวหลัก — สลับด้านกับโหมดข้อความซ้าย+รูปขวา */
  const listImageSplitImageLeft =
    isListImage &&
    listItemsIconAlign === "split" &&
    sharedData?.listImageSplitArrangement === "imageLeft";

  const showListImageAside =
    isListImage && Boolean(sharedData?.listImageCaptionEnabled);

  /** รูปซ้าย + split + มี aside: กลับแถวข้อความ+คำบรรยายให้ aside อยู่ชิดช่องว่าง (สะท้อนโหมดรูปขวา) */
  const listImageSplitMirrorTextAsideRow =
    listImageSplitImageLeft && showListImageAside;

  /** List iMage + ชิดขวา + มี aside: ข้อความประกอบซ้ายสุด ข้อความหลักขวาในแถว */
  const listImageEndAsideRowReverse =
    isListImage && listItemsIconAlign === "end" && showListImageAside;

  /** กลับลำดับ DOM ข้อความ/ประกอบ — aside อยู่ฝั่ง main-start ของแถวย่อย */
  const listImageInnerAsideReverseRow =
    listImageSplitMirrorTextAsideRow || listImageEndAsideRowReverse;

  /** ชิดขวา + แยกส่วนประกอบ: ใช้ row-reverse เพื่อให้ Avatar (ไอคอน/รูป) อยู่ขวา visual (List iMage split ค่าเริ่มต้น = ข้อความซ้าย+รูปขวา) */
  const listItemRowReverse =
    sharedData?.listIconsElement !== true &&
    (listItemsIconAlign === "end" ||
      (listItemsIconAlign === "split" && !listImageSplitImageLeft));
  /** แยกส่วนประกอบ: ไอคอนขวาสุด ข้อความซ้ายสุด ใช้ space-between */
  const listItemSplitMode =
    sharedData?.listIconsElement !== true && listItemsIconAlign === "split";
  /** List iMage + split + รูปซ้าย: ข้อความชิดขวาสุดแถว (คู่กับรูปซ้ายสุด) */
  const listImageSplitTextFarRight =
    listImageSplitImageLeft && listItemSplitMode;
  /** ข้อความชิดขวา — โหมด end หรือ List iMage split รูปซ้าย */
  const listItemRichBlockRight =
    sharedData?.listIconsElement !== true &&
    (listItemsIconAlign === "end" || listImageSplitTextFarRight);

  const showListIconsVerticalDivider =
    Boolean(showInlineDividerAfter) &&
    sharedData?.listIconsElement === true &&
    dividerEnabled;

  const itemRowGapRaw = Number(sharedData?.listItemRowGap);
  const itemRowGap = Number.isFinite(itemRowGapRaw)
    ? Math.max(0, Math.min(48, itemRowGapRaw))
    : LIST_ELEMENT_DEFAULTS.listItemRowGap;
  const rowFrameEnabled = sharedData?.listItemRowFrameEnabled === true;
  const rowFrameOpacityRaw = Number(sharedData?.listItemRowFrameOpacity);
  const rowFrameOpacity = Number.isFinite(rowFrameOpacityRaw)
    ? Math.max(0, Math.min(255, rowFrameOpacityRaw))
    : LIST_ELEMENT_DEFAULTS.listItemRowFrameOpacity;
  const rowFrameRadiusRaw = Number(sharedData?.listItemRowFrameRadius);
  const rowFrameRadius = Number.isFinite(rowFrameRadiusRaw)
    ? Math.max(0, Math.min(64, rowFrameRadiusRaw))
    : LIST_ELEMENT_DEFAULTS.listItemRowFrameRadius;
  const rowFrameGlassLevelRaw = Number(sharedData?.listItemRowFrameGlass);
  const rowFrameGlassLevel = Number.isFinite(rowFrameGlassLevelRaw)
    ? Math.max(0, Math.min(100, rowFrameGlassLevelRaw))
    : LIST_ELEMENT_DEFAULTS.listItemRowFrameGlass;
  const rowFrameGlassRatio = rowFrameGlassLevel / 100;
  const rowFrameFillOpacity = Math.round(
    Math.max(10, Math.min(170, rowFrameOpacity * (0.16 + rowFrameGlassRatio * 0.48)))
  );
  const rowFrameBlurPx = Math.max(0, Math.min(22, rowFrameGlassRatio * 22));
  const rowFrameSaturatePct = Math.round(100 + rowFrameGlassRatio * 70);
  const rowFrameBgColor = rowFrameEnabled
    ? setColor(
        theme,
        sharedData?.listItemRowFrameColor ?? LIST_ELEMENT_DEFAULTS.listItemRowFrameColor,
        rowFrameFillOpacity
      )
    : "transparent";
  const rowFrameStyle = rowFrameEnabled
    ? {
        borderRadius: `${rowFrameRadius}px`,
        backgroundColor: rowFrameBgColor,
      }
    : null;
  const rowFrameInlineStyle = rowFrameEnabled
    ? {
        backdropFilter: `blur(${rowFrameBlurPx}px) saturate(${rowFrameSaturatePct}%)`,
        WebkitBackdropFilter: `blur(${rowFrameBlurPx}px) saturate(${rowFrameSaturatePct}%)`,
      }
    : undefined;
  const rowFramePadX = rowFrameEnabled ? 12 : 0;
  const timelineGapInsetPx = isListImage ? 3 : borderEnabled ? 0 : 5;
  const timelineSegmentLeft =
    listItemsIconAlign === "end" || listItemsIconAlign === "split"
      ? `calc(100% - ${rowFramePadX + iconRenderBoxSize / 2}px)`
      : `${rowFramePadX + iconRenderBoxSize / 2}px`;

  /** ลิงก์ไอคอน — List iTems เท่านั้น (ไม่ใช่ List iCons / iMage) */
  const listItemFaIconLinkAttrs =
    !isListImage &&
    sharedData?.listIconsElement !== true &&
    !isLayoutMode
      ? resolveImageLinkAttrs(item)
      : null;

  const listAsideText =
    typeof item?.listAsideText === "string" ? item.listAsideText : "";
  const asideFontSize = Math.min(
    28,
    Math.max(
      10,
      Number(sharedData?.listImageCaptionFontSize) || LIST_IMAGE_DEFAULT_CAPTION_FONT_SIZE
    )
  );
  const asideOffsetY = Math.min(
    32,
    Math.max(
      -32,
      Number.isFinite(Number(sharedData?.listImageCaptionOffsetY))
        ? Number(sharedData.listImageCaptionOffsetY)
        : 0
    )
  );
  const asideCaptionColor = showListImageAside
    ? setColor(
        theme,
        sharedData?.listImageCaptionColor ??
          sharedData?.listTextColor ??
          LIST_ELEMENT_DEFAULTS.listTextColor,
        Number.isFinite(Number(sharedData?.listImageCaptionColorOpacity))
          ? Number(sharedData.listImageCaptionColorOpacity)
          : Number.isFinite(Number(sharedData?.listTextOpacity))
            ? Number(sharedData.listTextOpacity)
            : LIST_ELEMENT_DEFAULTS.listTextOpacity
      )
    : listTextColor;

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
          width: "100%",
          mt: `${itemRowGap}px`,
          mb: `${itemRowGap}px`,
          px: rowFrameEnabled ? "12px" : 0,
          py: rowFrameEnabled ? "8px" : 0,
          ...(verticalTimelineDivider ? { position: "relative", zIndex: 1 } : {}),
          ...(showListIconsVerticalDivider
            ? {
                columnGap: `${LIST_ICONS_INLINE_DIVIDER_GAP_LEFT_PX}px`,
                pr: `${LIST_ICONS_INLINE_DIVIDER_GAP_RIGHT_PX}px`,
              }
            : {}),
          ...(rowFrameStyle || {}),
        }}
        style={rowFrameInlineStyle}
      >
        <Box sx={{ flex: "1 1 auto", minWidth: 0 }}>
          <List
            dense
            sx={{
              width: "100%",
              py: 0,
              mt: 0,
              mb: 0,
            }}
          >
            <ListItem
              disablePadding
              sx={{
                display: "flex",
                flexDirection: listItemRowReverse ? "row-reverse" : "row",
                justifyContent: listItemSplitMode ? "space-between" : undefined,
                alignItems: "center",
                columnGap: listItemSplitMode ? 0 : `${textColumnGap}px`,
                py: `${LIST_DIVIDER_GAP_PX}px`,
                minHeight: `${rowCoreHeight + LIST_DIVIDER_GAP_PX * 2}px`,
              }}
            >
              <ListItemAvatar
                sx={{
                  minWidth: `${iconRenderBoxSize}px`,
                  width: `${iconRenderBoxSize}px`,
                  m: 0,
                  p: 0,
                }}
              >
                {isListImage ? (
                  <div
                    data-list-part="image"
                    data-list-item-index={itemIndex}
                    className="flex items-center justify-center overflow-hidden"
                    style={{
                      /* ไม่ใช้ iconBoxPad — ระยะห่างในไอเทมควบคุมแค่ columnGap กับข้อความ ไม่หดขนาดรูป */
                      padding: 0,
                      width: iconContainer,
                      height: iconContainer,
                      minWidth: iconContainer,
                      minHeight: iconContainer,
                      ...listImageCornerStyle,
                      backgroundColor: listImageSrc ? "transparent" : "#e5e7eb",
                      cursor: isLayoutMode ? "default" : "pointer",
                    }}
                    onDoubleClick={
                      isLayoutMode
                        ? undefined
                        : (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onEditIcon?.(itemIndex);
                          }
                    }
                  >
                    {listImageSrc ? (
                      <img
                        draggable={false}
                        alt=""
                        src={listImageSrc}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                          ...listImageBrightnessStyle,
                          ...listImageCornerStyle,
                        }}
                      />
                    ) : (
                      <ImagePlaceholderIcon
                        className="text-gray-400"
                        strokeWidth={1.5}
                        size={Math.min(20, Math.max(14, iconContainer - 14))}
                        aria-hidden
                      />
                    )}
                  </div>
                ) : (
                  (() => {
                    const effIconShape = resolveListItemsRowIconShape(item, sharedData);
                    const effIconCorner = resolveListItemsRowIconCorner(
                      item,
                      sharedData,
                      iconContainer
                    );
                    const faIconBoxStyle = {
                      padding: !borderEnabled ? "0px" : `${iconBoxPad}px`,
                      width: iconRenderBoxSize,
                      height: iconRenderBoxSize,
                      minWidth: iconRenderBoxSize,
                      minHeight: iconRenderBoxSize,
                      borderRadius: !borderEnabled
                        ? 0
                        : effIconShape === "rounded"
                          ? `${Math.max(
                              0,
                              Math.min(effIconCorner, iconContainer / 2)
                            )}px`
                          : "50%",
                      backgroundColor: !borderEnabled ? "transparent" : iconBg,
                      cursor: isLayoutMode ? "default" : "pointer",
                    };
                    const faIconDblClick =
                      isLayoutMode
                        ? undefined
                        : (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onEditIcon?.(itemIndex);
                          };
                    const faGlyph = showFa ? (
                      <IconAwsome
                        iconName={fa.name}
                        iconType={fa.type}
                        style={{ fontSize: iconSize, color: iconFg }}
                      />
                    ) : (
                      <ScanEye size={iconSize} style={{ color: iconFg }} />
                    );
                    if (listItemFaIconLinkAttrs) {
                      return (
                        <a
                          {...listItemFaIconLinkAttrs}
                          data-list-part="icon"
                          data-list-item-index={itemIndex}
                          className="flex items-center justify-center"
                          style={{
                            ...faIconBoxStyle,
                            textDecoration: "none",
                            color: "inherit",
                            boxSizing: "border-box",
                          }}
                          onDoubleClick={faIconDblClick}
                        >
                          {faGlyph}
                        </a>
                      );
                    }
                    return (
                      <div
                        data-list-part="icon"
                        data-list-item-index={itemIndex}
                        className="flex items-center justify-center"
                        style={faIconBoxStyle}
                        onDoubleClick={faIconDblClick}
                      >
                        {faGlyph}
                      </div>
                    );
                  })()
                )}
              </ListItemAvatar>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: listImageInnerAsideReverseRow ? "row-reverse" : "row",
                  /* split รูปซ้าย: กลุ่มชิดขวา | List iMage ชิดขวา+ประกอบ: ประกอบซ้ายสุด ข้อความขวาสุด */
                  justifyContent:
                    listImageSplitTextFarRight && listImageSplitMirrorTextAsideRow
                      ? "flex-start"
                      : listImageSplitTextFarRight
                        ? "flex-end"
                        : listImageEndAsideRowReverse
                          ? "space-between"
                          : undefined,
                  alignItems: "center",
                  flex: "1 1 auto",
                  minWidth: 0,
                  maxWidth: listItemSplitMode
                    ? `calc(100% - ${iconRenderBoxSize}px - ${textColumnGap}px)`
                    : undefined,
                  columnGap: showListImageAside ? 1 : 0,
                }}
              >
                <ListItemText
                  sx={{
                    cursor: isLayoutMode ? "default" : "pointer",
                    m: 0,
                    pl: 0,
                    flex: showListImageAside ? "1 1 0%" : "1 1 auto",
                    minWidth: 0,
                    textAlign: listItemRichBlockRight ? "right" : "left",
                    "& .MuiListItemText-primary": {
                      margin: 0,
                      ...(listItemRichBlockRight
                        ? { width: "100%", textAlign: "right" }
                        : {}),
                    },
                  }}
                  onDoubleClick={
                    isLayoutMode
                      ? undefined
                      : (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onEditText?.(itemIndex);
                        }
                  }
                  disableTypography
                  primary={
                    <Box
                      component="div"
                      data-list-part="text"
                      data-list-item-index={itemIndex}
                      onDoubleClick={
                        isLayoutMode
                          ? undefined
                          : (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              onEditText?.(itemIndex);
                            }
                      }
                      sx={
                        listItemRichBlockRight
                          ? {
                              width: "100%",
                              minWidth: 0,
                              "& > div": { textAlign: "right !important" },
                            }
                          : { width: "100%", minWidth: 0 }
                      }
                    >
                      <SegmentedRichText
                        elementData={{
                          textParagraph: listTextParagraph,
                          label: listText,
                        }}
                        renderSignature={`${JSON.stringify(listTextParagraph)}|${listText}`}
                        themeTextClass={theme?.text?.value}
                        animationClass=""
                        selected={false}
                        defaultColor={listTextColor}
                        defaultFontSizePx={listTextSize}
                      />
                    </Box>
                  }
                />
                {/* aside caption — split รูปขวา: ชิดช่องว่างขวา | split รูปซ้าย / ชิดขวา: ประกอบชิดซ้าย */}
                {showListImageAside ? (
                  <Typography
                    component="div"
                    className={theme?.textHeading?.value ?? ""}
                    data-list-part="aside"
                    data-list-item-index={itemIndex}
                    sx={{
                      flexShrink: 0,
                      maxWidth: "42%",
                      alignSelf: "center",
                      fontFamily: setFont(theme?.textHeading?.value),
                      fontWeight: 700,
                      fontSize: `${asideFontSize}px`,
                      lineHeight: 1.25,
                      color: asideCaptionColor,
                      textAlign: listImageInnerAsideReverseRow ? "left" : "right",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      transform: `translateY(${asideOffsetY}px)`,
                    }}
                  >
                    {listAsideText.trim() ? listAsideText.trim() : "\u00a0"}
                  </Typography>
                ) : null}
              </Box>
            </ListItem>
          </List>
        </Box>
        {showListIconsVerticalDivider && (
          <Box
            sx={{
              flex: "0 0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              alignSelf: "stretch",
              minWidth: 0,
            }}
          >
            <Divider
              orientation="vertical"
              sx={{
                height: `max(20px, calc(100% - ${LIST_ICONS_INLINE_DIVIDER_VERTICAL_TRIM_PX}px))`,
                maxHeight: `${rowCoreHeight + LIST_DIVIDER_GAP_PX * 2}px`,
                alignSelf: "center",
                borderStyle: dividerStyle,
                borderColor: dividerColor,
              }}
            />
          </Box>
        )}
        {verticalTimelineDivider && !isLast ? (
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              left: timelineSegmentLeft,
              ...(rowFrameEnabled
                ? { top: "100%", height: `${itemRowGap * 2}px` }
                : {
                    top: `calc(50% + ${iconRenderBoxSize / 2 + timelineGapInsetPx}px)`,
                    bottom: `-${itemRowGap}px`,
                  }),
              width: 0,
              borderLeftWidth: 1,
              borderLeftStyle: dividerStyle,
              borderLeftColor: dividerColor,
              transform: "translateX(-0.5px)",
              pointerEvents: "none",
              zIndex: 2,
            }}
          />
        ) : null}
        {verticalTimelineDivider && !rowFrameEnabled && itemIndex > 0 ? (
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              left: timelineSegmentLeft,
              top: `-${itemRowGap}px`,
              bottom: `calc(50% + ${iconRenderBoxSize / 2 + timelineGapInsetPx}px)`,
              width: 0,
              borderLeftWidth: 1,
              borderLeftStyle: dividerStyle,
              borderLeftColor: dividerColor,
              transform: "translateX(-0.5px)",
              pointerEvents: "none",
              zIndex: 2,
            }}
          />
        ) : null}
      </Box>

      {dividerEnabled && !isLast && !verticalTimelineDivider && (
        <Divider
          sx={{
            borderStyle: dividerStyle,
            borderColor: dividerColor,
            transform: `translateY(${LIST_DIVIDER_Y_OFFSET_PX}px)`,
          }}
        />
      )}
    </>
  );
}

const ListElement = ({
  elementData,
  selected,
  hover,
  isLastList,
  /** แถว list แนวนอน (listRow): แสดงเส้นคั่นแนวตั้งท้ายเซลล์นี้คั่นกับชุดถัดไป */
  listInlineDividerAfter = false,
  theme,
  onEditIcon,
  onEditText,
  /** Layout Mode: ให้คลิก/คีย์ลัดคัดลอก–วางเหมือน Text (กันโฟกัส rich text) */
  builderMode,
})=>{

  const { id } = elementData;
  const isLayoutMode = builderMode === "Layout Mode";
  const useLayoutSelectionFrame = isLayoutMode && selected;
  const selectedBoxSx = !useLayoutSelectionFrame && selected
    ? {
        borderStyle: "dashed",
        borderWidth: 1,
        borderColor: "#f87171",
        backgroundColor: "#fca5a51a",
      }
    : {};

  /* ------- Legacy path: element เก่าที่ไม่มี listItems ------- */
  const isLegacyOrIcons = !Array.isArray(elementData?.listItems);
  const isCompoundIcons =
    !isLegacyOrIcons && elementData?.listIconsElement === true;

  /* shared display values (ใช้ทั้ง legacy และ compound) */
  const legacyListMarginDefault =
    elementData?.listImageElement === true
      ? LIST_IMAGE_DEFAULT_LIST_MARGIN
      : LIST_ELEMENT_DEFAULTS.listMarginTop;
  const listMarginTop = Number.isFinite(Number(elementData?.listMarginTop))
    ? Math.max(0, Math.min(80, Number(elementData.listMarginTop)))
    : legacyListMarginDefault;
  const listMarginBottom = Number.isFinite(Number(elementData?.listMarginBottom))
    ? Math.max(0, Math.min(80, Number(elementData.listMarginBottom)))
    : legacyListMarginDefault;
  const gapTop = isLayoutMode
    ? Math.max(0, listMarginTop - LIST_LAYOUT_MARGIN_TRIM_PX)
    : listMarginTop;
  const gapBottom = isLayoutMode
    ? Math.max(0, listMarginBottom - LIST_LAYOUT_MARGIN_TRIM_PX)
    : listMarginBottom;

  const layoutCanvasBlock =
    isLayoutMode ? "pointer-events-none select-none" : "";

  const isButtonMulti = elementData?.buttonMultiElement === true;
  if (isButtonMulti) {
    const merged = mergeListElement(elementData);
    const items = Array.isArray(merged?.listItems) ? merged.listItems : [];
    const buttonItems = items.length > 0 ? items : [
      { listText: "Button 1", faIcon: { name: "faShieldHalved", type: "fas" } },
      { listText: "Button 2", faIcon: { name: "faHeart", type: "fas" } },
    ];

    const vRaw = String(
      merged?.buttonVariant ?? BUTTON_STYLE_DEFAULTS.buttonVariant
    ).toLowerCase();
    const variant =
      vRaw === "outlined" || vRaw === "text" ? vRaw : "contained";
    const radius = Number.isFinite(Number(merged?.buttonRadius))
      ? Math.max(0, Math.min(100, Number(merged.buttonRadius)))
      : BUTTON_STYLE_DEFAULTS.buttonRadius;
    const fontSize = Number.isFinite(Number(merged?.buttonFontSize))
      ? Math.max(8, Math.min(72, Number(merged.buttonFontSize)))
      : BUTTON_STYLE_DEFAULTS.buttonFontSize;
    const paddingX = Number.isFinite(Number(merged?.buttonPaddingX))
      ? Math.max(0, Math.min(120, Number(merged.buttonPaddingX)))
      : BUTTON_STYLE_DEFAULTS.buttonPaddingX;
    const paddingY = Number.isFinite(Number(merged?.buttonPaddingY))
      ? Math.max(0, Math.min(80, Number(merged.buttonPaddingY)))
      : BUTTON_STYLE_DEFAULTS.buttonPaddingY;
    const borderWidth = Number.isFinite(Number(merged?.buttonBorderWidth))
      ? Math.max(0, Math.min(12, Number(merged.buttonBorderWidth)))
      : BUTTON_STYLE_DEFAULTS.buttonBorderWidth;
    const fontWeight =
      merged?.buttonBold === false
        ? 500
        : merged?.buttonBold === true
          ? 600
          : BUTTON_STYLE_DEFAULTS.buttonBold === false
            ? 500
            : 600;
    const buttonAlign =
      merged?.buttonLayoutAlign === "center" || merged?.buttonLayoutAlign === "end"
        ? merged.buttonLayoutAlign
        : "start";
    const justifyContent =
      buttonAlign === "center"
        ? "center"
        : buttonAlign === "end"
          ? "flex-end"
          : "flex-start";

    const dividerEnabled =
      merged?.listDividerEnabled !== undefined
        ? Boolean(merged.listDividerEnabled)
        : true;
    const dividerStyle =
      typeof merged?.listDividerStyle === "string" && merged.listDividerStyle.trim()
        ? merged.listDividerStyle
        : "solid";
    const dividerColor = setColor(
      theme,
      merged?.listDividerColor ?? "#d8d8d8",
      Number.isFinite(Number(merged?.listDividerOpacity))
        ? Number(merged.listDividerOpacity)
        : 255
    );
    const interItemGapPx = Math.max(
      0,
      Math.min(32, Number(merged?.listItemRowGap) || 0)
    );

    const mkButtonSx = (
      fill,
      label,
      border,
      {
        variant: localVariant = variant,
        radius: localRadius = radius,
        fontSize: localFontSize = fontSize,
        paddingX: localPaddingX = paddingX,
        paddingY: localPaddingY = paddingY,
        borderWidth: localBorderWidth = borderWidth,
        fontWeight: localFontWeight = fontWeight,
      } = {}
    ) => ({
      textTransform: "none",
      borderRadius: `${localRadius}px`,
      fontSize: `${localFontSize}px`,
      fontWeight: localFontWeight,
      px: `${localPaddingX}px`,
      py: 0,
      minHeight: localPaddingY * 2 + localFontSize,
      lineHeight: 1.25,
      fontFamily: setFont(theme?.text?.value),
      ...(localVariant === "contained"
        ? { backgroundColor: fill, color: label, borderColor: fill }
        : localVariant === "outlined"
          ? {
              color: label,
              borderColor: border,
              borderWidth: `${localBorderWidth}px`,
              borderStyle: "solid",
              backgroundColor: fill,
            }
          : { color: label, backgroundColor: "transparent", borderColor: "transparent" }),
      "&:hover": {
        ...(localVariant === "contained"
          ? { backgroundColor: fill }
          : localVariant === "outlined"
            ? {
                borderColor: border,
                borderWidth: `${localBorderWidth}px`,
                borderStyle: "solid",
                backgroundColor: fill,
              }
            : { backgroundColor: "transparent" }),
      },
    });
    const hasAnyIcon = buttonItems.some((it) => isValidFaIconRef(it?.faIcon));
    const iconSlotWidth = hasAnyIcon ? "1.15em" : "0px";
    const maxTextLen = buttonItems.reduce((max, it, idx) => {
      const txt =
        typeof it?.listText === "string" && it.listText.trim()
          ? it.listText.trim()
          : `Button ${idx + 1}`;
      const withIcon = isValidFaIconRef(it?.faIcon) ? 2 : 0;
      return Math.max(max, txt.length + withIcon);
    }, 6);
    const equalButtonWidthCh = maxTextLen + 3;

    return (
      <Box
        sx={{
          width: "100%",
          mx: 0,
          my: 0,
          boxSizing: "border-box",
          mt: `${gapTop}px`,
          mb: `${gapBottom}px`,
          px: 0,
          py: 0,
          ...selectedBoxSx,
          borderRadius: 2,
        }}
        onMouseEnter={() => hover({ id })}
        onMouseLeave={() => hover(false)}
      >
        <div className={layoutCanvasBlock || undefined}>
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent,
            }}
          >
            <Box className="relative block w-fit max-w-full">
              <Box
                data-list-part="button"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  px: 0,
                  ...(useLayoutSelectionFrame
                    ? {
                        transform: "scale(0.94)",
                        transformOrigin: "center",
                        transition: "transform 150ms",
                      }
                    : {}),
                  rowGap: `${Math.max(
                    0,
                    Math.min(32, Number(merged?.listItemRowGap) || 0)
                  )}px`,
                  columnGap: dividerEnabled ? 0 : `${interItemGapPx}px`,
                  overflow: "hidden",
                  maxWidth: "100%",
                }}
              >
                {buttonItems.map((item, idx) => {
              const label =
                typeof item?.listText === "string" && item.listText.trim()
                  ? item.listText.trim()
                  : `Button ${idx + 1}`;
              const itemId =
                typeof item?.id === "string" && item.id.trim()
                  ? item.id.trim()
                  : "";
              const icon = item?.faIcon;
              const showIcon = isValidFaIconRef(icon);
              const isSlotTwo = idx % 2 === 1;
              const fill = setColor(
                theme,
                item?.buttonFill ??
                  (isSlotTwo
                    ? merged?.button2Fill ??
                      merged?.buttonFill ??
                      BUTTON_STYLE_DEFAULTS.button2Fill
                    : merged?.buttonFill ?? BUTTON_STYLE_DEFAULTS.buttonFill),
                Number.isFinite(Number(item?.buttonFillOpacity))
                  ? Number(item.buttonFillOpacity)
                  : isSlotTwo
                    ? Number.isFinite(Number(merged?.button2FillOpacity))
                      ? Number(merged.button2FillOpacity)
                      : Number.isFinite(Number(merged?.buttonFillOpacity))
                        ? Number(merged.buttonFillOpacity)
                        : BUTTON_STYLE_DEFAULTS.buttonFillOpacity
                    : Number.isFinite(Number(merged?.buttonFillOpacity))
                      ? Number(merged.buttonFillOpacity)
                      : BUTTON_STYLE_DEFAULTS.buttonFillOpacity
              );
              const labelColor = setColor(
                theme,
                item?.buttonLabelColor ??
                  (isSlotTwo
                    ? merged?.button2LabelColor ??
                      merged?.buttonLabelColor ??
                      BUTTON_STYLE_DEFAULTS.button2LabelColor
                    : merged?.buttonLabelColor ??
                      BUTTON_STYLE_DEFAULTS.buttonLabelColor),
                Number.isFinite(Number(item?.buttonLabelOpacity))
                  ? Number(item.buttonLabelOpacity)
                  : isSlotTwo
                    ? Number.isFinite(Number(merged?.button2LabelOpacity))
                      ? Number(merged.button2LabelOpacity)
                      : Number.isFinite(Number(merged?.buttonLabelOpacity))
                        ? Number(merged.buttonLabelOpacity)
                        : BUTTON_STYLE_DEFAULTS.buttonLabelOpacity
                    : Number.isFinite(Number(merged?.buttonLabelOpacity))
                      ? Number(merged.buttonLabelOpacity)
                      : BUTTON_STYLE_DEFAULTS.buttonLabelOpacity
              );
              const borderColor = setColor(
                theme,
                item?.buttonBorderColor ??
                  merged?.buttonBorderColor ??
                  BUTTON_STYLE_DEFAULTS.buttonBorderColor,
                Number.isFinite(Number(item?.buttonBorderOpacity))
                  ? Number(item.buttonBorderOpacity)
                  : Number.isFinite(Number(merged?.buttonBorderOpacity))
                    ? Number(merged.buttonBorderOpacity)
                    : BUTTON_STYLE_DEFAULTS.buttonBorderOpacity
              );
              const itemVariantRaw = String(
                item?.buttonVariant ?? merged?.buttonVariant ?? "contained"
              ).toLowerCase();
              const itemVariant =
                itemVariantRaw === "outlined" || itemVariantRaw === "text"
                  ? itemVariantRaw
                  : "contained";
              const itemRadius = Number.isFinite(Number(item?.buttonRadius))
                ? Math.max(0, Math.min(100, Number(item.buttonRadius)))
                : radius;
              const itemFontSize = Number.isFinite(Number(item?.buttonFontSize))
                ? Math.max(8, Math.min(72, Number(item.buttonFontSize)))
                : fontSize;
              const itemPaddingX = Number.isFinite(Number(item?.buttonPaddingX))
                ? Math.max(0, Math.min(120, Number(item.buttonPaddingX)))
                : paddingX;
              const itemPaddingY = Number.isFinite(Number(item?.buttonPaddingY))
                ? Math.max(0, Math.min(80, Number(item.buttonPaddingY)))
                : paddingY;
              const itemBorderWidth = Number.isFinite(Number(item?.buttonBorderWidth))
                ? Math.max(0, Math.min(12, Number(item.buttonBorderWidth)))
                : borderWidth;
              const itemFullWidth =
                item?.buttonFullWidth === true
                  ? true
                  : item?.buttonFullWidth === false
                    ? false
                    : merged?.buttonFullWidth === true;
              const itemFontWeight = item?.buttonBold === false ? 500 : item?.buttonBold === true ? 600 : fontWeight;
                  return (
                    <React.Fragment key={`btn-multi-${idx}`}>
                      <Button
                        variant={itemVariant}
                        data-button-multi-index={idx}
                        data-button-multi-item-id={itemId}
                        sx={{
                          ...mkButtonSx(fill, labelColor, borderColor, {
                            variant: itemVariant,
                            radius: itemRadius,
                            fontSize: itemFontSize,
                            paddingX: itemPaddingX,
                            paddingY: itemPaddingY,
                            borderWidth: itemBorderWidth,
                            fontWeight: itemFontWeight,
                          }),
                          width:
                            itemFullWidth
                              ? "100%"
                              : "auto",
                          minWidth:
                            itemFullWidth
                              ? undefined
                              : `${equalButtonWidthCh}ch`,
                          boxShadow: "none",
                          flexShrink: 0,
                        }}
                      >
                        <Box
                          component="span"
                          sx={{
                            width: "100%",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <Box
                            component="span"
                            sx={{
                              width: iconSlotWidth,
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              mr: 0.75,
                              lineHeight: 0,
                              flexShrink: 0,
                            }}
                          >
                            {showIcon ? (
                              <IconAwsome
                                iconName={icon.name}
                                iconType={icon.type}
                                style={{ fontSize: "1.05em" }}
                              />
                            ) : null}
                          </Box>
                          <Box
                            component="span"
                            sx={{ textAlign: "center", whiteSpace: "nowrap" }}
                          >
                            {label}
                          </Box>
                        </Box>
                      </Button>
                      {dividerEnabled && idx < buttonItems.length - 1 ? (
                        <Box
                          sx={{
                            width: "1px",
                            mx: `${interItemGapPx / 2}px`,
                            alignSelf: "stretch",
                            minHeight: "100%",
                            backgroundColor: "transparent",
                            borderLeftWidth: "1px",
                            borderLeftStyle: dividerStyle,
                            borderLeftColor: dividerColor,
                          }}
                        />
                      ) : null}
                    </React.Fragment>
                  );
                })}
              </Box>
              {useLayoutSelectionFrame && (
                <>
                  <div className="pointer-events-none absolute left-[-6px] right-[-6px] top-[-10px] bottom-[-10px] rounded-md bg-red-300/10" />
                  <span className="pointer-events-none absolute left-[-5px] top-[-9px] h-2.5 w-2.5 border-l-2 border-t-2 border-red-400" />
                  <span className="pointer-events-none absolute right-[-5px] top-[-9px] h-2.5 w-2.5 border-r-2 border-t-2 border-red-400" />
                  <span className="pointer-events-none absolute bottom-[-9px] left-[-5px] h-2.5 w-2.5 border-b-2 border-l-2 border-red-400" />
                  <span className="pointer-events-none absolute bottom-[-9px] right-[-5px] h-2.5 w-2.5 border-b-2 border-r-2 border-red-400" />
                </>
              )}
            </Box>
          </Box>
        </div>
      </Box>
    );
  }

  /* ---- Legacy / List iCons path (ยังทำงานเหมือนเดิมทุกประการ) ---- */
  if (isLegacyOrIcons) {
    const legacyTitle =
      typeof elementData?.listTitle === "string" ? elementData.listTitle : "";
    const legacyDescription =
      typeof elementData?.listDescription === "string"
        ? elementData.listDescription
        : "";
    const listText =
      typeof elementData?.listText === "string" && elementData.listText.trim()
        ? elementData.listText
        : legacyDescription
          ? `${legacyTitle}\n${legacyDescription}`
          : legacyTitle || "รายการ";
    const listTextColor = setColor(
      theme,
      elementData?.listTextColor ??
        elementData?.listDescriptionColor ??
        elementData?.listTitleColor ??
        LIST_ELEMENT_DEFAULTS.listTextColor,
      Number.isFinite(Number(elementData?.listTextOpacity))
        ? Number(elementData?.listTextOpacity)
        : Number.isFinite(Number(elementData?.listDescriptionOpacity))
          ? Number(elementData?.listDescriptionOpacity)
          : Number.isFinite(Number(elementData?.listTitleOpacity))
            ? Number(elementData?.listTitleOpacity)
            : LIST_ELEMENT_DEFAULTS.listTextOpacity
    );
    const listTextSize = Number.isFinite(Number(elementData?.listTextSize))
      ? Number(elementData.listTextSize)
      : Number.isFinite(Number(elementData?.listTitleSize))
        ? Number(elementData.listTitleSize)
        : Number.isFinite(Number(elementData?.listDescriptionSize))
          ? Number(elementData.listDescriptionSize)
          : LIST_ELEMENT_DEFAULTS.listTextSize;
    const iconContainer = Number.isFinite(Number(elementData?.containerSize))
      ? Math.max(28, Number(elementData.containerSize))
      : elementData?.listImageElement === true
        ? LIST_IMAGE_DEFAULT_CONTAINER_SIZE
        : LIST_ELEMENT_DEFAULTS.containerSize;
    const minTextBlockHeight =
      listTextSize * LIST_TEXT_LINE_HEIGHT_RATIO * LIST_MIN_TEXT_LINES;
    const listTextGapAdjust = Number.isFinite(Number(elementData?.listTextGapAdjust))
      ? Number(elementData.listTextGapAdjust)
      : 0;
    const listIconTextGapPxRaw = elementData?.listIconTextGapPx;
    const textColumnGap = Number.isFinite(Number(listIconTextGapPxRaw))
      ? Math.max(0, Math.min(64, Number(listIconTextGapPxRaw)))
      : Math.max(0, LIST_ELEMENT_DEFAULTS.listIconTextGapPx + listTextGapAdjust);
    const iconBoxPad =
      Number.isFinite(Number(listIconTextGapPxRaw)) &&
      Number(listIconTextGapPxRaw) <= 8
        ? 0
        : 2;
    const iconSize = Number.isFinite(Number(elementData?.iconSize))
      ? Math.max(12, Number(elementData.iconSize))
      : elementData?.listIconsElement === true
        ? listIconsFallbackIconSize(elementData)
        : LIST_ELEMENT_DEFAULTS.iconSize;
    const borderEnabled =
      elementData?.listIconsElement === true
        ? elementData?.borderEnabled === true
        : elementData?.borderEnabled !== false;
    const iconRenderBoxSize = borderEnabled ? iconContainer : iconSize;
    const rowCoreHeight = Math.max(iconRenderBoxSize, minTextBlockHeight);
    const iconBg = resolveIconBackgroundCss(
      { ...LIST_ELEMENT_DEFAULTS, ...elementData },
      theme
    );
    const iconFg = resolveIconGlyphColor(
      { ...LIST_ELEMENT_DEFAULTS, ...elementData },
      theme
    );
    const fa = elementData?.faIcon ?? { name: "faShieldHalved", type: "fas" };
    const showFa = isValidFaIconRef(fa);
    const listTextParagraph = elementData?.listTextParagraph
      ? normalizeParagraph(elementData.listTextParagraph)
      : migrateLabelToParagraph({ label: listText });

    const dividerEnabled =
      elementData?.listDividerEnabled !== undefined
        ? Boolean(elementData.listDividerEnabled)
        : LIST_ELEMENT_DEFAULTS.listDividerEnabled;
    const dividerStyle =
      typeof elementData?.listDividerStyle === "string" &&
      elementData.listDividerStyle.trim()
        ? elementData.listDividerStyle
        : LIST_ELEMENT_DEFAULTS.listDividerStyle;
    const dividerColor = setColor(
      theme,
      elementData?.listDividerColor ?? LIST_ELEMENT_DEFAULTS.listDividerColor,
      Number.isFinite(Number(elementData?.listDividerOpacity))
        ? Number(elementData.listDividerOpacity)
        : LIST_ELEMENT_DEFAULTS.listDividerOpacity
    );
    const showListIconsVerticalDivider =
      Boolean(listInlineDividerAfter) &&
      elementData?.listIconsElement === true &&
      dividerEnabled;

    const legacyListItemsIconAlignRaw =
      elementData?.listIconsElement !== true ? elementData?.listItemsIconAlign : undefined;
    const legacyListItemsIconAlign =
      legacyListItemsIconAlignRaw === "start" ||
      legacyListItemsIconAlignRaw === "end" ||
      legacyListItemsIconAlignRaw === "split"
        ? legacyListItemsIconAlignRaw
        : LIST_ELEMENT_DEFAULTS.listItemsIconAlign;
    const legacyListItemRowReverse =
      elementData?.listIconsElement !== true &&
      (legacyListItemsIconAlign === "end" || legacyListItemsIconAlign === "split");
    const legacyListItemSplitMode =
      elementData?.listIconsElement !== true && legacyListItemsIconAlign === "split";
    const legacyListItemRichBlockRight =
      elementData?.listIconsElement !== true && legacyListItemsIconAlign === "end";

    return (
      <Box
        sx={{
          width: "100%",
          mx: 0,
          my: 0,
          boxSizing: "border-box",
          mt: `${gapTop}px`,
          mb: `${gapBottom}px`,
          ...(isLayoutMode && selected
            ? { px: "5px", py: 0 }
            : { px: 0, py: 0 }),
          ...selectedBoxSx,
          borderRadius: 2,
        }}
        onMouseEnter={() => hover({ id })}
        onMouseLeave={() => hover(false)}
      >
        <div className={layoutCanvasBlock || undefined}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "stretch",
              width: "100%",
              ...(showListIconsVerticalDivider
                ? {
                    columnGap: `${LIST_ICONS_INLINE_DIVIDER_GAP_LEFT_PX}px`,
                    pr: `${LIST_ICONS_INLINE_DIVIDER_GAP_RIGHT_PX}px`,
                  }
                : {}),
            }}
          >
            <Box sx={{ flex: "1 1 auto", minWidth: 0 }}>
              <List
                dense
                sx={{
                  width: "100%",
                  py: 0,
                  mt: 0,
                  mb: 0,
                }}
              >
                <ListItem
                  disablePadding
                  sx={{
                    display: "flex",
                    flexDirection: legacyListItemRowReverse ? "row-reverse" : "row",
                    justifyContent: legacyListItemSplitMode ? "space-between" : undefined,
                    alignItems: "center",
                    columnGap: legacyListItemSplitMode ? 0 : `${textColumnGap}px`,
                    py: `${LIST_DIVIDER_GAP_PX}px`,
                    minHeight: `${rowCoreHeight + LIST_DIVIDER_GAP_PX * 2}px`,
                  }}
                >
                  <ListItemAvatar
                    sx={{
                      minWidth: `${iconRenderBoxSize}px`,
                      width: `${iconRenderBoxSize}px`,
                      m: 0,
                      p: 0,
                    }}
                  >
                    <div
                      data-list-part="icon"
                      className="flex items-center justify-center"
                      style={{
                        padding: borderEnabled ? `${iconBoxPad}px` : "0px",
                        width: iconRenderBoxSize,
                        height: iconRenderBoxSize,
                        minWidth: iconRenderBoxSize,
                        minHeight: iconRenderBoxSize,
                        borderRadius:
                          !borderEnabled
                            ? 0
                            : elementData?.iconShape === "rounded"
                            ? `${Math.max(
                                0,
                                Math.min(
                                  Number(elementData?.iconCornerRadius) || LIST_ELEMENT_DEFAULTS.iconCornerRadius,
                                  iconContainer / 2
                                )
                              )}px`
                            : "50%",
                        backgroundColor: borderEnabled ? iconBg : "transparent",
                        cursor: "pointer",
                      }}
                      onDoubleClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onEditIcon?.(0);
                      }}
                    >
                      {showFa ? (
                        <IconAwsome
                          iconName={fa.name}
                          iconType={fa.type}
                          style={{ fontSize: iconSize, color: iconFg }}
                        />
                      ) : (
                        <ScanEye size={iconSize} style={{ color: iconFg }} />
                      )}
                    </div>
                  </ListItemAvatar>
                  <Box
                    sx={{
                      flex: "1 1 auto",
                      minWidth: 0,
                      maxWidth: legacyListItemSplitMode
                        ? `calc(100% - ${iconRenderBoxSize}px - ${textColumnGap}px)`
                        : undefined,
                    }}
                  >
                    <ListItemText
                      sx={{
                        cursor: "pointer",
                        m: 0,
                        pl: 0,
                        flex: "1 1 auto",
                        minWidth: 0,
                        textAlign: legacyListItemRichBlockRight ? "right" : "left",
                        "& .MuiListItemText-primary": {
                          margin: 0,
                          ...(legacyListItemRichBlockRight
                            ? { width: "100%", textAlign: "right" }
                            : {}),
                        },
                      }}
                      onDoubleClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onEditText?.(0);
                      }}
                      disableTypography
                      primary={
                        <Box
                          component="div"
                          data-list-part="text"
                          onDoubleClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onEditText?.(0);
                          }}
                        sx={
                          legacyListItemRichBlockRight
                            ? {
                                width: "100%",
                                minWidth: 0,
                                "& > div": { textAlign: "right !important" },
                              }
                            : { width: "100%", minWidth: 0 }
                        }
                      >
                        <SegmentedRichText
                          elementData={{
                            textParagraph: listTextParagraph,
                            label: listText,
                          }}
                          renderSignature={`${JSON.stringify(listTextParagraph)}|${listText}`}
                          themeTextClass={theme?.text?.value}
                          animationClass=""
                          selected={false}
                          defaultColor={listTextColor}
                          defaultFontSizePx={listTextSize}
                        />
                      </Box>
                    }
                    />
                  </Box>
                </ListItem>
              </List>
            </Box>
            {showListIconsVerticalDivider && (
              <Box
                sx={{
                  flex: "0 0 auto",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  alignSelf: "stretch",
                  mt: 0,
                  mb: 0,
                  minWidth: 0,
                }}
              >
                <Divider
                  orientation="vertical"
                  sx={{
                    height: `max(20px, calc(100% - ${LIST_ICONS_INLINE_DIVIDER_VERTICAL_TRIM_PX}px))`,
                    maxHeight: `${rowCoreHeight + LIST_DIVIDER_GAP_PX * 2}px`,
                    alignSelf: "center",
                    borderStyle: dividerStyle,
                    borderColor: dividerColor,
                  }}
                />
              </Box>
            )}
          </Box>

          {dividerEnabled && !isLastList && (
            <Divider
              sx={{
                borderStyle: dividerStyle,
                borderColor: dividerColor,
                transform: `translateY(${LIST_DIVIDER_Y_OFFSET_PX}px)`,
              }}
            />
          )}
        </div>
        {useLayoutSelectionFrame && (
          <>
            <div className="pointer-events-none absolute left-[-7px] right-[-7px] top-[1px] bottom-[1px] rounded-md bg-red-300/10" />
            <span className="pointer-events-none absolute left-[-4px] top-[2px] h-2.5 w-2.5 border-l-2 border-t-2 border-red-400" />
            <span className="pointer-events-none absolute right-[-6px] top-[2px] h-2.5 w-2.5 border-r-2 border-t-2 border-red-400" />
            <span className="pointer-events-none absolute bottom-[2px] left-[-4px] h-2.5 w-2.5 border-b-2 border-l-2 border-red-400" />
            <span className="pointer-events-none absolute bottom-[2px] right-[-6px] h-2.5 w-2.5 border-b-2 border-r-2 border-red-400" />
          </>
        )}
      </Box>
    );
  }

  /* ---- Compound path (shared merge) ---- */
  const merged = mergeListElement(elementData);
  const items = merged.listItems || [];

  /** margin รอบกลุ่ม List ทั้งก้อน (ราก element) — ไม่ใช่ระยะต่อแถว */
  const listBlockMarginDefault =
    merged.listImageElement === true
      ? LIST_IMAGE_DEFAULT_LIST_MARGIN
      : LIST_ELEMENT_DEFAULTS.listMarginTop;
  const compoundListMarginTop = Number.isFinite(Number(merged.listMarginTop))
    ? Math.max(0, Math.min(80, Number(merged.listMarginTop)))
    : listBlockMarginDefault;
  const compoundListMarginBottom = Number.isFinite(Number(merged.listMarginBottom))
    ? Math.max(0, Math.min(80, Number(merged.listMarginBottom)))
    : listBlockMarginDefault;
  const compoundListGapTop = isLayoutMode
    ? Math.max(0, compoundListMarginTop - LIST_LAYOUT_MARGIN_TRIM_PX)
    : compoundListMarginTop;
  const compoundListGapBottom = isLayoutMode
    ? Math.max(0, compoundListMarginBottom - LIST_LAYOUT_MARGIN_TRIM_PX)
    : compoundListMarginBottom;

  const wrapperBoxSx = {
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    mx: 0,
    my: 0,
    boxSizing: "border-box",
    ...(isLayoutMode && selected
      ? { px: "5px", py: 0 }
      : { px: 0, py: 0 }),
    ...selectedBoxSx,
    borderRadius: 2,
  };

  /* ---- Compound List iCons — horizontal row ---- */
  if (isCompoundIcons) {
    const listTextColor = setColor(
      theme,
      merged?.listTextColor ?? LIST_ELEMENT_DEFAULTS.listTextColor,
      Number.isFinite(Number(merged?.listTextOpacity))
        ? Number(merged.listTextOpacity)
        : LIST_ELEMENT_DEFAULTS.listTextOpacity
    );
    const listTextSize = Number.isFinite(Number(merged?.listTextSize))
      ? Number(merged.listTextSize)
      : LIST_ELEMENT_DEFAULTS.listTextSize;
    const iconTextGapPxRaw = merged?.listIconTextGapPx;
    const textColumnGap = Number.isFinite(Number(iconTextGapPxRaw))
      ? Math.max(0, Math.min(64, Number(iconTextGapPxRaw)))
      : Math.max(0, LIST_TEXT_GAP_BASE_PX);
    const dividerEnabled =
      merged?.listDividerEnabled !== undefined
        ? Boolean(merged.listDividerEnabled)
        : LIST_ELEMENT_DEFAULTS.listDividerEnabled;
    const dividerStyle =
      typeof merged?.listDividerStyle === "string" && merged.listDividerStyle.trim()
        ? merged.listDividerStyle
        : LIST_ELEMENT_DEFAULTS.listDividerStyle;
    const dividerColor = setColor(
      theme,
      merged?.listDividerColor ?? LIST_ELEMENT_DEFAULTS.listDividerColor,
      Number.isFinite(Number(merged?.listDividerOpacity))
        ? Number(merged.listDividerOpacity)
        : LIST_ELEMENT_DEFAULTS.listDividerOpacity
    );
    /* ระยะห่างนอกไอเทม (per-cell spacing) — ควบคุม py ต่อเซลล์, rowGap, และระยะเส้นคั่น */
    const iconsItemRowGapRaw = Number(merged?.listItemRowGap);
    const iconsItemRowGap = Number.isFinite(iconsItemRowGapRaw)
      ? Math.max(0, Math.min(48, iconsItemRowGapRaw))
      : LIST_ELEMENT_DEFAULTS.listItemRowGap;
    /* min 4px เพื่อให้เส้นคั่นแนวตั้งระหว่างเซลล์ยังปรากฏ */
    const listIconsDividerOuterGapPx = Math.max(4, iconsItemRowGap);

    /* สีกรอบรวมทั้งแถว — เหมือนภาพตัวอย่าง */
    const iconsRowFrameEnabled = merged?.listItemRowFrameEnabled === true;
    const iconsRowFrameOpacityRaw = Number(merged?.listItemRowFrameOpacity);
    const iconsRowFrameOpacity = Number.isFinite(iconsRowFrameOpacityRaw)
      ? Math.max(0, Math.min(255, iconsRowFrameOpacityRaw))
      : LIST_ELEMENT_DEFAULTS.listItemRowFrameOpacity;
    const iconsRowFrameRadiusRaw = Number(merged?.listItemRowFrameRadius);
    const iconsRowFrameRadius = Number.isFinite(iconsRowFrameRadiusRaw)
      ? Math.max(0, Math.min(64, iconsRowFrameRadiusRaw))
      : LIST_ELEMENT_DEFAULTS.listItemRowFrameRadius;
    const iconsRowFrameGlassLevelRaw = Number(merged?.listItemRowFrameGlass);
    const iconsRowFrameGlassLevel = Number.isFinite(iconsRowFrameGlassLevelRaw)
      ? Math.max(0, Math.min(100, iconsRowFrameGlassLevelRaw))
      : LIST_ELEMENT_DEFAULTS.listItemRowFrameGlass;
    const iconsRowFrameGlassRatio = iconsRowFrameGlassLevel / 100;
    const iconsRowFrameFillOpacity = Math.round(
      Math.max(10, Math.min(170, iconsRowFrameOpacity * (0.16 + iconsRowFrameGlassRatio * 0.48)))
    );
    const iconsRowFrameBlurPx = Math.max(0, Math.min(22, iconsRowFrameGlassRatio * 22));
    const iconsRowFrameSaturatePct = Math.round(100 + iconsRowFrameGlassRatio * 70);
    const iconsRowFrameBgColor = iconsRowFrameEnabled
      ? setColor(
          theme,
          merged?.listItemRowFrameColor ?? LIST_ELEMENT_DEFAULTS.listItemRowFrameColor,
          iconsRowFrameFillOpacity
        )
      : "transparent";
    const iconsRowFrameSx = iconsRowFrameEnabled
      ? {
          borderRadius: `${iconsRowFrameRadius}px`,
          backgroundColor: iconsRowFrameBgColor,
          px: "14px",
          py: "10px",
        }
      : null;
    const iconsRowFrameInlineStyle = iconsRowFrameEnabled
      ? {
          backdropFilter: `blur(${iconsRowFrameBlurPx}px) saturate(${iconsRowFrameSaturatePct}%)`,
          WebkitBackdropFilter: `blur(${iconsRowFrameBlurPx}px) saturate(${iconsRowFrameSaturatePct}%)`,
        }
      : undefined;

    return (
      <Box
        sx={{
          ...wrapperBoxSx,
          mt: `${compoundListGapTop}px`,
          mb: `${compoundListGapBottom}px`,
        }}
        onMouseEnter={() => hover({ id })}
        onMouseLeave={() => hover(false)}
      >
        <div
          className={layoutCanvasBlock || undefined}
          style={{ minWidth: 0, maxWidth: "100%" }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              alignItems: "center",
              /* overflow: hidden ทำให้ divider ของเซลล์สุดท้ายในแถว (ที่ขยายถึงขอบ) ถูก clip อัตโนมัติ */
              overflow: "hidden",
              columnGap: `${listIconsDividerOuterGapPx * 2}px`,
              rowGap: "8px",
              justifyContent:
                merged?.listIconsAlign === "center" ? "center"
                : merged?.listIconsAlign === "flex-end" ? "flex-end"
                : "flex-start",
              width: "100%",
              maxWidth: "100%",
              minWidth: 0,
              ...(iconsRowFrameSx || {}),
            }}
            style={iconsRowFrameInlineStyle}
          >
            {items.map((item, i) => {
              const iconDataForResolve = { ...LIST_ELEMENT_DEFAULTS, ...item };
              const iconBg = resolveIconBackgroundCss(iconDataForResolve, theme);
              const iconFg = resolveIconGlyphColor(iconDataForResolve, theme);
              const fa = item?.faIcon ?? { name: "faShieldHalved", type: "fas" };
              const showFaIcon = isValidFaIconRef(fa);
              const iconContainer = resolveListItemsRowIconContainer(item, merged);
              const iconSize = resolveListItemsRowIconSize(item, merged);
              const borderEnabled = resolveListItemsRowBorderEnabled(item, merged);
              const iconRenderBoxSize = borderEnabled ? iconContainer : iconSize;
              const iconBoxPad =
                Number.isFinite(Number(iconTextGapPxRaw)) &&
                Number(iconTextGapPxRaw) <= 8 ? 0 : 2;

              const listText =
                typeof item?.listText === "string" && item.listText.trim()
                  ? item.listText
                  : "";
              const listTextParagraph = item?.listTextParagraph
                ? normalizeParagraph(item.listTextParagraph)
                : listText
                  ? migrateLabelToParagraph({ label: listText })
                  : null;

              const isColLayout = merged?.listIconsLayout === "column";
              const iconsDisplayMode =
                merged?.listIconsDisplayMode === "icon"
                  ? "icon"
                  : merged?.listIconsDisplayMode === "text"
                    ? "text"
                    : "iconText";
              const showListIconsIcon = iconsDisplayMode !== "text";
              const showListIconsText = iconsDisplayMode !== "icon";
              const showInlineEndRule =
                dividerEnabled && i < items.length - 1;

              return (
                <React.Fragment key={i}>
                  {/* Cell — natural width; divider absolute อยู่กึ่งกลาง column-gap ระหว่างเซลล์ */}
                  <Box
                    sx={{
                      position: "relative",
                      flex: "0 0 auto",
                      boxSizing: "border-box",
                      display: "flex",
                      flexDirection: isColLayout ? "column" : "row",
                      alignItems: "center",
                      ...(isColLayout
                        ? {
                            rowGap: `${textColumnGap}px`,
                            py: borderEnabled ? "6px" : "0px",
                            px: borderEnabled ? "6px" : "0px",
                          }
                        : {
                            columnGap: `${textColumnGap}px`,
                            py: borderEnabled ? "6px" : "0px",
                            px: borderEnabled ? "4px" : "0px",
                          }),
                    }}
                  >
                    {/* Icon */}
                    {showListIconsIcon ? (
                    <div
                      data-list-part="icon"
                      data-list-item-index={i}
                      className="flex shrink-0 items-center justify-center"
                      style={{
                        padding: borderEnabled ? `${iconBoxPad}px` : "0px",
                        width: iconRenderBoxSize,
                        height: iconRenderBoxSize,
                        minWidth: iconRenderBoxSize,
                        minHeight: iconRenderBoxSize,
                        borderRadius:
                          !borderEnabled
                            ? 0
                            : resolveListItemsRowIconShape(item, merged) === "rounded"
                            ? `${Math.max(
                                0,
                                Math.min(
                                  resolveListItemsRowIconCorner(
                                    item,
                                    merged,
                                    iconContainer
                                  ),
                                  iconContainer / 2
                                )
                              )}px`
                            : "50%",
                        backgroundColor: borderEnabled ? iconBg : "transparent",
                        cursor: isLayoutMode ? "default" : "pointer",
                      }}
                      onDoubleClick={
                        isLayoutMode
                          ? undefined
                          : (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              onEditIcon?.(i);
                            }
                      }
                    >
                      {showFaIcon ? (
                        <IconAwsome
                          iconName={fa.name}
                          iconType={fa.type}
                          style={{ fontSize: iconSize, color: iconFg }}
                        />
                      ) : (
                        <ScanEye size={iconSize} style={{ color: iconFg }} />
                      )}
                    </div>
                    ) : null}
                    {/* Text */}
                    {showListIconsText && listTextParagraph && (
                      <div
                        data-list-part="text"
                        data-list-item-index={i}
                        style={{
                          minWidth: 0,
                          flex: "1 1 auto",
                          maxWidth: "100%",
                          overflowWrap: "anywhere",
                          wordBreak: "break-word",
                          cursor: isLayoutMode ? "default" : "pointer",
                        }}
                        onDoubleClick={
                          isLayoutMode
                            ? undefined
                            : (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onEditText?.(i);
                              }
                        }
                      >
                        <SegmentedRichText
                          elementData={{ textParagraph: listTextParagraph, label: listText }}
                          renderSignature={`${JSON.stringify(listTextParagraph)}|${listText}`}
                          themeTextClass={theme?.text?.value}
                          animationClass=""
                          selected={false}
                          defaultColor={listTextColor}
                          defaultFontSizePx={listTextSize}
                        />
                      </div>
                    )}
                    {/* Divider — absolute ภายในเซลล์: ไม่อยู่ใน flex flow จึง wrap ถูกต้อง
                        right: -dividerHalfGap วางเส้นไว้กึ่งกลาง column-gap (= halfGap*2) ระหว่างเซลล์
                        เซลล์สุดท้ายในแต่ละแถวขยายถึงขอบ container → เส้นอยู่นอก container → overflow:hidden clip */}
                    {showInlineEndRule && (
                      <div
                        aria-hidden
                        style={{
                          position: "absolute",
                          right: `-${listIconsDividerOuterGapPx}px`,
                          top: isColLayout ? "10%" : "22%",
                          bottom: isColLayout ? "10%" : "22%",
                          width: 0,
                          borderRight: `1px ${dividerStyle} ${dividerColor}`,
                        }}
                      />
                    )}
                  </Box>
                </React.Fragment>
              );
            })}
          </Box>
        </div>
        {useLayoutSelectionFrame && (
          <>
            <div className="pointer-events-none absolute left-[-7px] right-[-7px] top-[1px] bottom-[1px] rounded-md bg-red-300/10" />
            <span className="pointer-events-none absolute left-[-4px] top-[2px] h-2.5 w-2.5 border-l-2 border-t-2 border-red-400" />
            <span className="pointer-events-none absolute right-[-6px] top-[2px] h-2.5 w-2.5 border-r-2 border-t-2 border-red-400" />
            <span className="pointer-events-none absolute bottom-[2px] left-[-4px] h-2.5 w-2.5 border-b-2 border-l-2 border-red-400" />
            <span className="pointer-events-none absolute bottom-[2px] right-[-6px] h-2.5 w-2.5 border-b-2 border-r-2 border-red-400" />
          </>
        )}
      </Box>
    );
  }

  /* ---- Compound List Item — vertical stack ---- */
  const showVerticalTimeline =
    merged?.listVerticalTimelineDivider === true &&
    !merged?.listIconsElement &&
    (merged?.listDividerEnabled !== undefined
      ? Boolean(merged.listDividerEnabled)
      : LIST_ELEMENT_DEFAULTS.listDividerEnabled);

  const timelineDividerStyle =
    typeof merged?.listDividerStyle === "string" && merged.listDividerStyle.trim()
      ? merged.listDividerStyle
      : LIST_ELEMENT_DEFAULTS.listDividerStyle;
  const timelineDividerColor = setColor(
    theme,
    merged?.listDividerColor ?? LIST_ELEMENT_DEFAULTS.listDividerColor,
    Number.isFinite(Number(merged?.listDividerOpacity))
      ? Number(merged.listDividerOpacity)
      : LIST_ELEMENT_DEFAULTS.listDividerOpacity
  );

  return (
    <Box
      sx={{
        ...wrapperBoxSx,
        mt: `${compoundListGapTop}px`,
        mb: `${compoundListGapBottom}px`,
      }}
      onMouseEnter={() => hover({ id })}
      onMouseLeave={() => hover(false)}
    >
      <div
        className={layoutCanvasBlock || undefined}
        style={{ position: "relative", minWidth: 0 }}
      >
        {/* display:flex ป้องกัน margin collapse ระหว่างแถว — สำคัญมากสำหรับสูตร timeline */}
        <List
          dense
          sx={{
            width: "100%",
            py: 0,
            mt: 0,
            mb: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {items.map((item, i) => (
            <ListItemRow
              key={i}
              item={item}
              itemIndex={i}
              isLast={i === items.length - 1}
              sharedData={merged}
              theme={theme}
              onEditIcon={onEditIcon}
              onEditText={onEditText}
              isLayoutMode={isLayoutMode}
              showInlineDividerAfter={i === items.length - 1 && listInlineDividerAfter}
            />
          ))}
        </List>
      </div>
      {useLayoutSelectionFrame && (
        <>
          <div className="pointer-events-none absolute left-[-7px] right-[-7px] top-[1px] bottom-[1px] rounded-md bg-red-300/10" />
          <span className="pointer-events-none absolute left-[-4px] top-[2px] h-2.5 w-2.5 border-l-2 border-t-2 border-red-400" />
          <span className="pointer-events-none absolute right-[-6px] top-[2px] h-2.5 w-2.5 border-r-2 border-t-2 border-red-400" />
          <span className="pointer-events-none absolute bottom-[2px] left-[-4px] h-2.5 w-2.5 border-b-2 border-l-2 border-red-400" />
          <span className="pointer-events-none absolute bottom-[2px] right-[-6px] h-2.5 w-2.5 border-b-2 border-r-2 border-red-400" />
        </>
      )}
    </Box>
  );

}

export default ListElement
