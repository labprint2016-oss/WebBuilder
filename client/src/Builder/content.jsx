import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { createPortal } from "react-dom";
import {
  Settings,
  Copy,
  Trash2,
  Minus,
  Move,
  MoveUp,
  MoveDown,
  MoveLeft,
  MoveRight,
  ScanEye,
  Play,
  Gem,
  CircleFadingPlus,
  EllipsisVertical,
  Maximize2,
  Minimize2,
  Grid2X2X,
  Grid2X2Plus,
  Image as ImagePlaceholderIcon,
  AlertCircle,
  Info,
  Sparkles,
} from "lucide-react";
import {
  Typography,
  Button,
  ButtonGroup,
  Modal,
  Box,
  Fade,
  Backdrop,
  Divider,
  ListItem,
  List,
  ListItemText,
  ListItemAvatar,
  GlobalStyles,
  Snackbar,
} from "@mui/material";
import lodash, { isNull, transform } from "lodash";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  pointerWithin,
  DragOverlay,
  MeasuringStrategy,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  verticalListSortingStrategy,
  defaultAnimateLayoutChanges,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getPage } from "../../Functions/pages";
import { getTheme } from "../../Functions/theme";
import IconLucide from "../IconLucide";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Container from "./Layouts/Container"
import Column from "./Layouts/Conlumn";
import Element from "./Layouts/Element";
import ServiceLayout from "./Services/ServiceLayout";
import RichTextEditorModal from "./richText/RichTextEditorModal";
import {
  serializeParagraphForSave,
} from "./richText/richTextParagraphModel";
import SegmentedRichText from "./richText/SegmentedRichText";
import {
  IMAGE_ASPECT_DEFAULT,
  IMAGE_BRIGHTNESS_DEFAULT,
  imageBrightnessFilterStyle,
  imageCornerRadiusStyle,
  mergeImageBadge,
  resolveImageLinkAttrs,
  resolveButtonDualSlotLinkAttrs,
} from "./Layouts/Elements/imageAspectConfig";
import ImageBadge from "./Layouts/Elements/ImageBadge";
import {
  BANNER_CAPTION_SLIDE_MAX,
  BANNER_CAPTION_SLIDE_MIN,
  bannerCaptionHorizontalBleedsOutsideFrame,
  defaultBannerCaptionSlideVertical,
  getBannerCaptionLayout,
} from "./Layouts/Elements/bannerCaptionLayout";
import {
  mergeCarouselElement,
  sliceSlideIconForPanel,
  sliceSlideImageForPanel,
} from "./Layouts/Elements/carouselElementConfig";
import { mergeDataSliderElement } from "./Layouts/Elements/dataSliderElementConfig";
import { mergeCatagoriesElement } from "./Layouts/Elements/catagoriesElementConfig";
import {
  mergeListBoxElement,
  pickListBoxOffcanvasSync,
  sliceListBoxItemIconForPanel,
  sliceListBoxItemImageForPanel,
} from "./Layouts/Elements/listBoxElementConfig";
import {
  mergeListElement,
  sliceListItemIconForPanel,
  sliceListItemImageForPanel,
} from "./Layouts/Elements/listElementConfig";
import {
  BUTTON_STYLE_DEFAULTS,
  getButtonMuiSx,
  getButtonMuiVariant,
  getButtonOuterContainerSx,
  getButtonGroupOutlinedFrameSx,
  normalizeButtonLayoutAlign,
  isButtonFullWidthEnabled,
  isButtonLinkIconDefined,
  isButtonSpecialTextEnabled,
  resolveButtonSpecialTextLabel,
} from "./Layouts/Elements/buttonElementConfig";
import IconAwsome from "./IconAwsome";
import {
  mergeIconElement,
  isValidFaIconRef,
  resolveIconBackgroundCss,
  resolveIconGlyphColor,
  resolveIconBorderCss,
  normalizeIconBorderStyle,
  getIconOuterContainerSx,
} from "./Layouts/Elements/iconElementConfig";
import {
  HEADING_ELEMENT_DEFAULTS,
  mergeHeadingElement,
} from "./Layouts/Elements/headingElementConfig";
import { mergeCounterElement } from "./Layouts/Elements/counterElementConfig";
import { mergeTableElement } from "./Layouts/Elements/tableElementConfig";
import { mergeBetweenElement } from "./Layouts/Elements/betweenElementConfig";
import { mergeDividerElement } from "./Layouts/Elements/dividerElementConfig";
import HeadingDividerTextBlock from "./Layouts/Elements/HeadingDividerTextBlock";
import { setColor, setFont } from "../../function";

const CarouselElementPreview = React.lazy(
  () => import("./Layouts/Elements/Carousel")
);
const DataSliderElementPreview = React.lazy(
  () => import("./Layouts/Elements/DataSlider")
);
const CatagoriesElementPreview = React.lazy(
  () => import("./Layouts/Elements/Catagories")
);
const ListBoxElementPreview = React.lazy(
  () => import("./Layouts/Elements/ListBox")
);
const TabsElementPreview = React.lazy(() => import("./Layouts/Elements/Tabs"));
const AccordionElementPreview = React.lazy(
  () => import("./Layouts/Elements/Accordion")
);
const PostElementPreview = React.lazy(() => import("./Layouts/Elements/Post"));
const IconCanvasPreview = React.lazy(() => import("./Layouts/Elements/Icon"));
const ListElementPreview = React.lazy(() => import("./Layouts/Elements/List"));
const TableElementPreview = React.lazy(() => import("./Layouts/Elements/Table"));
const BetweenElementPreview = React.lazy(
  () => import("./Layouts/Elements/Between")
);

/** prefix id ตอนวาง element ใหม่ — สอดคล้องกับ Server/element.js + dropNewElement */
const LAYOUT_ELEMENT_ID_PREFIX = {
  heading: "Heading-",
  text: "Text-",
  img: "Img-",
  imgh: "ImgH-",
  imgo: "ImgO-",
  bnr: "Bnr-",
  vid: "VID-",
  lbx: "LBX-",
  btn: "Btn-",
  btnG: "btnG-",
  divider: "divi-",
  list: "List-",
  icon: "icon-",
  ctn: "Ctn-",
  tbl: "Tbl-",
  btw: "Btw-",
  lstb: "Lstb-",
  acc: "Acc-",
  post: "Post-",
  dts: "Dts-",
  ctg: "Ctg-",
};

/** ความกว้างขั้นต่ำ (หน่วยแถว 12 คอลัมน์) — Carousel / List Box / List (iTems, iCons, iMage) ต้อง ≥ เทียบเท่า Col-3 */
const CAROUSEL_MIN_COL_UNITS = 3;
/** ความกว้างขั้นต่ำของ Between (หน่วยแถว 12 คอลัมน์) — ต้อง ≥ Col-3 */
const BETWEEN_MIN_COL_UNITS = 3;
/** ความกว้างขั้นต่ำของ Tabs (หน่วยแถว 12 คอลัมน์) — ต้อง ≥ Col-5 */
const TABS_MIN_COL_UNITS = 5;
/** ความกว้างขั้นต่ำของ Accordion (หน่วยแถว 12 คอลัมน์) — ต้อง ≥ Col-4 */
const ACCORDION_MIN_COL_UNITS = 4;
/** ความกว้างขั้นต่ำของ Image Hover (หน่วยแถว 12 คอลัมน์) — ต้อง ≥ Col-3 */
const IMAGE_HOVER_MIN_COL_UNITS = 3;
/** ความกว้างขั้นต่ำของ Carousel (หน่วยแถว 12 คอลัมน์) — ต้อง ≥ Col-4 */
const CAROUSEL_STRICT_MIN_COL_UNITS = 4;
/** ความกว้างขั้นต่ำของ List Images (หน่วยแถว 12 คอลัมน์) — ต้อง ≥ Col-3 */
const LIST_IMAGE_MIN_COL_UNITS = 3;
/** ความกว้างขั้นต่ำของ Data Table (หน่วยแถว 12 คอลัมน์) — ต้อง ≥ Col-4 */
const TABLE_MIN_COL_UNITS = 4;
/** ความกว้างขั้นต่ำของ Post (หน่วยแถว 12 คอลัมน์) — ต้อง ≥ Col-5 */
const POST_MIN_COL_UNITS = 6;
const TOAST_VOICE_MESSAGES = {
  carousel: "ไม่สำเร็จ กรุณาเพิ่มความกว้างของคอลัมน์",
  listImage: "ไม่สำเร็จ กรุณาเพิ่มความกว้างของคอลัมน์",
  post: "ไม่สำเร็จ กรุณาเพิ่มความกว้างของคอลัมน์",
  tabsInTab: "ไม่สามารถใช้งานอีเลเมนต์นี้ได้",
  postInPost: "ไม่สำเร็จ ไม่สามารถลากวางได้",
  dataSliderType: "เซคชั่นนี้ใช้ได้เฉพาะอิลิเม้นพื้นฐานเท่านั้น",
};
const TOAST_VOICE_AUDIO_SRC = "/sounds/toast/toast-voice-th-female.mp3";
const TOAST_VOICE_AUDIO_BY_KEY = {
  tabsInTab: "/sounds/toast/toast-tabs-in-tab.mp3",
  dataSliderType: "/sounds/toast/toast-tabs-in-tab.mp3",
};
/** Layout Mode: elements พื้นฐานใช้คลิกเดียวเท่านั้น (ไม่ทำงานตอน double-click) */
const LAYOUT_MODE_SINGLE_CLICK_ONLY_TYPES = new Set([
  "text",
  "heading",
  "img",
  "bnr",
  "lbx",
  "vid",
  "btn",
  "btnG",
  "icon",
  "ctn",
  "divider",
]);
const IMAGE_HOVER_ICON_PANEL_DEFAULT = mergeIconElement({ type: "icon" });
const IMAGE_HOVER_BUTTON_PANEL_DEFAULT = {
  type: "btn",
  ...BUTTON_STYLE_DEFAULTS,
  label: "Button Click",
  linkIcon: { name: "faShieldHalved", type: "fas" },
};

function isListElementMinColConstrained(el) {
  return (
    el?.type === "list" &&
    (el?.listImageElement === true || el?.listIconsElement === true)
  );
}

/** ความกว้างเป้าหมาย (หน่วย 12 คอลัมน์) จาก indices — spnI/nestI เป็น undefined = คอลัมน์ตรงๆ */
function getLayoutBucketWidthUnits(layouts, conI, colI, spnI, nestI) {
  const col = layouts[conI]?.columns?.[colI];
  if (!col) return 0;
  const colSize = Number(col.size);
  if (!Number.isFinite(colSize) || colSize <= 0) return 0;
  if (!Number.isInteger(spnI) || spnI < 0) return colSize;
  const span = col.spans?.[spnI];
  if (!span) return colSize;
  const spanSize = Number(span.size);
  const s = Number.isFinite(spanSize) && spanSize > 0 ? spanSize : 12;
  let units = (colSize * s) / 12;
  if (
    Number.isInteger(nestI) &&
    nestI >= 0 &&
    Array.isArray(span.nestedSpans) &&
    span.nestedSpans[nestI]
  ) {
    const msSize = Number(span.nestedSpans[nestI].size);
    if (Number.isFinite(msSize) && msSize > 0) {
      units = (colSize * s * msSize) / 144;
    }
  }
  return units;
}

function resolveLayoutElementByDragData(layouts, active) {
  const dc = active?.data?.current;
  if (!dc) return null;
  const eleId = active.id;
  const conI = layouts.findIndex((l) => l.container.id === dc.conID);
  if (conI === -1) return null;
  const colI = layouts[conI].columns.findIndex((c) => c.id === dc.colID);
  if (colI === -1) return null;
  const column = layouts[conI].columns[colI];
  const { spnID, nestID } = dc;
  if (spnID) {
    const spIx = column.spans?.findIndex((s) => s.id === spnID) ?? -1;
    if (spIx === -1) return null;
    const span = column.spans[spIx];
    if (nestID != null) {
      const msIx =
        span.nestedSpans?.findIndex(
          (m) => String(m?.id ?? "") === String(nestID)
        ) ?? -1;
      if (msIx === -1) return null;
      return span.nestedSpans[msIx].elements?.find((e) => e.id === eleId) ?? null;
    }
    return span.elements?.find((e) => e.id === eleId) ?? null;
  }
  return column.elements?.find((e) => e.id === eleId) ?? null;
}

function shouldBlockListImageDrop(layouts, active, destConI, destColI, destSpnI, destMspnI) {
  const el = resolveLayoutElementByDragData(layouts, active);
  if (!isListElementMinColConstrained(el)) return false;
  const w = getLayoutBucketWidthUnits(layouts, destConI, destColI, destSpnI, destMspnI);
  return !Number.isFinite(w) || w < LIST_IMAGE_MIN_COL_UNITS;
}

function shouldBlockCarouselDrop(layouts, active, destConI, destColI, destSpnI, destMspnI) {
  const el = resolveLayoutElementByDragData(layouts, active);
  if (el?.type !== "crl") return false;
  const w = getLayoutBucketWidthUnits(layouts, destConI, destColI, destSpnI, destMspnI);
  return !Number.isFinite(w) || w < CAROUSEL_STRICT_MIN_COL_UNITS;
}

function shouldBlockPostDrop(layouts, active, destConI, destColI, destSpnI, destMspnI) {
  const el = resolveLayoutElementByDragData(layouts, active);
  if (el?.type !== "post" && el?.type !== "dts" && el?.type !== "ctg") return false;
  const w = getLayoutBucketWidthUnits(layouts, destConI, destColI, destSpnI, destMspnI);
  return !Number.isFinite(w) || w < POST_MIN_COL_UNITS;
}

function shouldBlockTableDrop(layouts, active, destConI, destColI, destSpnI, destMspnI) {
  const el = resolveLayoutElementByDragData(layouts, active);
  if (el?.type !== "tbl") return false;
  const w = getLayoutBucketWidthUnits(layouts, destConI, destColI, destSpnI, destMspnI);
  return !Number.isFinite(w) || w < TABLE_MIN_COL_UNITS;
}

function shouldBlockBetweenDrop(layouts, active, destConI, destColI, destSpnI, destMspnI) {
  const el = resolveLayoutElementByDragData(layouts, active);
  if (el?.type !== "btw") return false;
  const w = getLayoutBucketWidthUnits(layouts, destConI, destColI, destSpnI, destMspnI);
  return !Number.isFinite(w) || w < BETWEEN_MIN_COL_UNITS;
}

function shouldBlockTabsDrop(layouts, active, destConI, destColI, destSpnI, destMspnI) {
  const el = resolveLayoutElementByDragData(layouts, active);
  if (el?.type !== "tabs") return false;
  const w = getLayoutBucketWidthUnits(layouts, destConI, destColI, destSpnI, destMspnI);
  return !Number.isFinite(w) || w < TABS_MIN_COL_UNITS;
}

function shouldBlockAccordionDrop(layouts, active, destConI, destColI, destSpnI, destMspnI) {
  const el = resolveLayoutElementByDragData(layouts, active);
  if (el?.type !== "acc") return false;
  const w = getLayoutBucketWidthUnits(layouts, destConI, destColI, destSpnI, destMspnI);
  return !Number.isFinite(w) || w < ACCORDION_MIN_COL_UNITS;
}

function shouldBlockImageHoverDrop(layouts, active, destConI, destColI, destSpnI, destMspnI) {
  const el = resolveLayoutElementByDragData(layouts, active);
  if (el?.type !== "imgh" && el?.type !== "imgo") return false;
  const w = getLayoutBucketWidthUnits(layouts, destConI, destColI, destSpnI, destMspnI);
  return !Number.isFinite(w) || w < IMAGE_HOVER_MIN_COL_UNITS;
}

const DATA_SLIDER_ALLOWED_ELEMENT_TYPES = new Set([
  "text",
  "heading",
  "btn",
  "btnG",
  "icon",
  "img",
  "bnr",
  "lbx",
  "vid",
  "ctn",
  "divider",
]);

function isAllowedInDataSliderArea(el) {
  const t = String(el?.type || "");
  return DATA_SLIDER_ALLOWED_ELEMENT_TYPES.has(t);
}

function hasPostMinWidthElementDeep(el) {
  if (!el || typeof el !== "object") return false;
  if (el.type === "post" || el.type === "dts" || el.type === "ctg") return true;
  const nestedBuckets = [];
  if (Array.isArray(el.tabsItems)) {
    for (const item of el.tabsItems) nestedBuckets.push(item?.elements);
  }
  if (Array.isArray(el.accordionItems)) {
    for (const item of el.accordionItems) nestedBuckets.push(item?.elements);
  }
  if (Array.isArray(el.dataSliderItems)) {
    for (const item of el.dataSliderItems) nestedBuckets.push(item?.elements);
  }
  if (Array.isArray(el.catagoriesItems)) {
    for (const item of el.catagoriesItems) nestedBuckets.push(item?.elements);
  }
  if (Array.isArray(el.postElements)) nestedBuckets.push(el.postElements);
  for (const bucket of nestedBuckets) {
    if (!Array.isArray(bucket)) continue;
    for (const child of bucket) {
      if (hasPostMinWidthElementDeep(child)) return true;
    }
  }
  return false;
}

function bucketHasPostMinWidthElement(elements) {
  if (!Array.isArray(elements)) return false;
  for (const el of elements) {
    if (hasPostMinWidthElementDeep(el)) return true;
  }
  return false;
}

function hasListImageMinWidthElementDeep(el) {
  if (!el || typeof el !== "object") return false;
  if (
    el.type === "list" &&
    (el.listImageElement === true || el.listIconsElement === true)
  ) {
    return true;
  }
  const nestedBuckets = [];
  if (Array.isArray(el.tabsItems)) {
    for (const item of el.tabsItems) nestedBuckets.push(item?.elements);
  }
  if (Array.isArray(el.accordionItems)) {
    for (const item of el.accordionItems) nestedBuckets.push(item?.elements);
  }
  if (Array.isArray(el.dataSliderItems)) {
    for (const item of el.dataSliderItems) nestedBuckets.push(item?.elements);
  }
  if (Array.isArray(el.catagoriesItems)) {
    for (const item of el.catagoriesItems) nestedBuckets.push(item?.elements);
  }
  if (Array.isArray(el.postElements)) nestedBuckets.push(el.postElements);
  for (const bucket of nestedBuckets) {
    if (!Array.isArray(bucket)) continue;
    for (const child of bucket) {
      if (hasListImageMinWidthElementDeep(child)) return true;
    }
  }
  return false;
}

function bucketHasListImageMinWidthElement(elements) {
  if (!Array.isArray(elements)) return false;
  for (const el of elements) {
    if (hasListImageMinWidthElementDeep(el)) return true;
  }
  return false;
}

function hasCarouselMinWidthElementDeep(el) {
  if (!el || typeof el !== "object") return false;
  if (el.type === "crl") return true;
  const nestedBuckets = [];
  if (Array.isArray(el.tabsItems)) {
    for (const item of el.tabsItems) nestedBuckets.push(item?.elements);
  }
  if (Array.isArray(el.accordionItems)) {
    for (const item of el.accordionItems) nestedBuckets.push(item?.elements);
  }
  if (Array.isArray(el.dataSliderItems)) {
    for (const item of el.dataSliderItems) nestedBuckets.push(item?.elements);
  }
  if (Array.isArray(el.catagoriesItems)) {
    for (const item of el.catagoriesItems) nestedBuckets.push(item?.elements);
  }
  if (Array.isArray(el.postElements)) nestedBuckets.push(el.postElements);
  for (const bucket of nestedBuckets) {
    if (!Array.isArray(bucket)) continue;
    for (const child of bucket) {
      if (hasCarouselMinWidthElementDeep(child)) return true;
    }
  }
  return false;
}

function bucketHasCarouselMinWidthElement(elements) {
  if (!Array.isArray(elements)) return false;
  for (const el of elements) {
    if (hasCarouselMinWidthElementDeep(el)) return true;
  }
  return false;
}

function canColumnSizeContainCarouselMinWidthElements(column, targetColSize) {
  const colSize = Number(targetColSize);
  if (!Number.isFinite(colSize) || colSize <= 0) return true;
  if (
    bucketHasCarouselMinWidthElement(column?.elements) &&
    colSize < CAROUSEL_STRICT_MIN_COL_UNITS
  ) {
    return false;
  }
  const spans = Array.isArray(column?.spans) ? column.spans : [];
  for (const span of spans) {
    const rawSpanSize = Number(span?.size);
    const spanSize = Number.isFinite(rawSpanSize) && rawSpanSize > 0 ? rawSpanSize : 12;
    const spanUnits = (colSize * spanSize) / 12;
    if (
      bucketHasCarouselMinWidthElement(span?.elements) &&
      (!Number.isFinite(spanUnits) || spanUnits < CAROUSEL_STRICT_MIN_COL_UNITS)
    ) {
      return false;
    }
    const nestedSpans = Array.isArray(span?.nestedSpans) ? span.nestedSpans : [];
    for (const mini of nestedSpans) {
      const rawMiniSize = Number(mini?.size);
      const miniSize = Number.isFinite(rawMiniSize) && rawMiniSize > 0 ? rawMiniSize : 12;
      const miniUnits = (colSize * spanSize * miniSize) / 144;
      if (
        bucketHasCarouselMinWidthElement(mini?.elements) &&
        (!Number.isFinite(miniUnits) || miniUnits < CAROUSEL_STRICT_MIN_COL_UNITS)
      ) {
        return false;
      }
    }
  }
  return true;
}

function hasTableMinWidthElementDeep(el) {
  if (!el || typeof el !== "object") return false;
  if (el.type === "tbl") return true;
  const nestedBuckets = [];
  if (Array.isArray(el.tabsItems)) {
    for (const item of el.tabsItems) nestedBuckets.push(item?.elements);
  }
  if (Array.isArray(el.accordionItems)) {
    for (const item of el.accordionItems) nestedBuckets.push(item?.elements);
  }
  if (Array.isArray(el.dataSliderItems)) {
    for (const item of el.dataSliderItems) nestedBuckets.push(item?.elements);
  }
  if (Array.isArray(el.catagoriesItems)) {
    for (const item of el.catagoriesItems) nestedBuckets.push(item?.elements);
  }
  if (Array.isArray(el.postElements)) nestedBuckets.push(el.postElements);
  for (const bucket of nestedBuckets) {
    if (!Array.isArray(bucket)) continue;
    for (const child of bucket) {
      if (hasTableMinWidthElementDeep(child)) return true;
    }
  }
  return false;
}

function bucketHasTableMinWidthElement(elements) {
  if (!Array.isArray(elements)) return false;
  for (const el of elements) {
    if (hasTableMinWidthElementDeep(el)) return true;
  }
  return false;
}

function canColumnSizeContainTableMinWidthElements(column, targetColSize) {
  const colSize = Number(targetColSize);
  if (!Number.isFinite(colSize) || colSize <= 0) return true;
  if (
    bucketHasTableMinWidthElement(column?.elements) &&
    colSize < TABLE_MIN_COL_UNITS
  ) {
    return false;
  }
  const spans = Array.isArray(column?.spans) ? column.spans : [];
  for (const span of spans) {
    const rawSpanSize = Number(span?.size);
    const spanSize = Number.isFinite(rawSpanSize) && rawSpanSize > 0 ? rawSpanSize : 12;
    const spanUnits = (colSize * spanSize) / 12;
    if (
      bucketHasTableMinWidthElement(span?.elements) &&
      (!Number.isFinite(spanUnits) || spanUnits < TABLE_MIN_COL_UNITS)
    ) {
      return false;
    }
    const nestedSpans = Array.isArray(span?.nestedSpans) ? span.nestedSpans : [];
    for (const mini of nestedSpans) {
      const rawMiniSize = Number(mini?.size);
      const miniSize = Number.isFinite(rawMiniSize) && rawMiniSize > 0 ? rawMiniSize : 12;
      const miniUnits = (colSize * spanSize * miniSize) / 144;
      if (
        bucketHasTableMinWidthElement(mini?.elements) &&
        (!Number.isFinite(miniUnits) || miniUnits < TABLE_MIN_COL_UNITS)
      ) {
        return false;
      }
    }
  }
  return true;
}

function hasBetweenMinWidthElementDeep(el) {
  if (!el || typeof el !== "object") return false;
  if (el.type === "btw") return true;
  const nestedBuckets = [];
  if (Array.isArray(el.tabsItems)) {
    for (const item of el.tabsItems) nestedBuckets.push(item?.elements);
  }
  if (Array.isArray(el.accordionItems)) {
    for (const item of el.accordionItems) nestedBuckets.push(item?.elements);
  }
  if (Array.isArray(el.dataSliderItems)) {
    for (const item of el.dataSliderItems) nestedBuckets.push(item?.elements);
  }
  if (Array.isArray(el.catagoriesItems)) {
    for (const item of el.catagoriesItems) nestedBuckets.push(item?.elements);
  }
  if (Array.isArray(el.postElements)) nestedBuckets.push(el.postElements);
  for (const bucket of nestedBuckets) {
    if (!Array.isArray(bucket)) continue;
    for (const child of bucket) {
      if (hasBetweenMinWidthElementDeep(child)) return true;
    }
  }
  return false;
}

function bucketHasBetweenMinWidthElement(elements) {
  if (!Array.isArray(elements)) return false;
  for (const el of elements) {
    if (hasBetweenMinWidthElementDeep(el)) return true;
  }
  return false;
}

function canColumnSizeContainBetweenMinWidthElements(column, targetColSize) {
  const colSize = Number(targetColSize);
  if (!Number.isFinite(colSize) || colSize <= 0) return true;
  if (
    bucketHasBetweenMinWidthElement(column?.elements) &&
    colSize < BETWEEN_MIN_COL_UNITS
  ) {
    return false;
  }
  const spans = Array.isArray(column?.spans) ? column.spans : [];
  for (const span of spans) {
    const rawSpanSize = Number(span?.size);
    const spanSize = Number.isFinite(rawSpanSize) && rawSpanSize > 0 ? rawSpanSize : 12;
    const spanUnits = (colSize * spanSize) / 12;
    if (
      bucketHasBetweenMinWidthElement(span?.elements) &&
      (!Number.isFinite(spanUnits) || spanUnits < BETWEEN_MIN_COL_UNITS)
    ) {
      return false;
    }
    const nestedSpans = Array.isArray(span?.nestedSpans) ? span.nestedSpans : [];
    for (const mini of nestedSpans) {
      const rawMiniSize = Number(mini?.size);
      const miniSize = Number.isFinite(rawMiniSize) && rawMiniSize > 0 ? rawMiniSize : 12;
      const miniUnits = (colSize * spanSize * miniSize) / 144;
      if (
        bucketHasBetweenMinWidthElement(mini?.elements) &&
        (!Number.isFinite(miniUnits) || miniUnits < BETWEEN_MIN_COL_UNITS)
      ) {
        return false;
      }
    }
  }
  return true;
}

function hasTabsMinWidthElementDeep(el) {
  if (!el || typeof el !== "object") return false;
  if (el.type === "tabs") return true;
  const nestedBuckets = [];
  if (Array.isArray(el.tabsItems)) {
    for (const item of el.tabsItems) nestedBuckets.push(item?.elements);
  }
  if (Array.isArray(el.accordionItems)) {
    for (const item of el.accordionItems) nestedBuckets.push(item?.elements);
  }
  if (Array.isArray(el.dataSliderItems)) {
    for (const item of el.dataSliderItems) nestedBuckets.push(item?.elements);
  }
  if (Array.isArray(el.catagoriesItems)) {
    for (const item of el.catagoriesItems) nestedBuckets.push(item?.elements);
  }
  if (Array.isArray(el.postElements)) nestedBuckets.push(el.postElements);
  for (const bucket of nestedBuckets) {
    if (!Array.isArray(bucket)) continue;
    for (const child of bucket) {
      if (hasTabsMinWidthElementDeep(child)) return true;
    }
  }
  return false;
}

function bucketHasTabsMinWidthElement(elements) {
  if (!Array.isArray(elements)) return false;
  for (const el of elements) {
    if (hasTabsMinWidthElementDeep(el)) return true;
  }
  return false;
}

function canColumnSizeContainTabsMinWidthElements(column, targetColSize) {
  const colSize = Number(targetColSize);
  if (!Number.isFinite(colSize) || colSize <= 0) return true;
  if (
    bucketHasTabsMinWidthElement(column?.elements) &&
    colSize < TABS_MIN_COL_UNITS
  ) {
    return false;
  }
  const spans = Array.isArray(column?.spans) ? column.spans : [];
  for (const span of spans) {
    const rawSpanSize = Number(span?.size);
    const spanSize = Number.isFinite(rawSpanSize) && rawSpanSize > 0 ? rawSpanSize : 12;
    const spanUnits = (colSize * spanSize) / 12;
    if (
      bucketHasTabsMinWidthElement(span?.elements) &&
      (!Number.isFinite(spanUnits) || spanUnits < TABS_MIN_COL_UNITS)
    ) {
      return false;
    }
    const nestedSpans = Array.isArray(span?.nestedSpans) ? span.nestedSpans : [];
    for (const mini of nestedSpans) {
      const rawMiniSize = Number(mini?.size);
      const miniSize = Number.isFinite(rawMiniSize) && rawMiniSize > 0 ? rawMiniSize : 12;
      const miniUnits = (colSize * spanSize * miniSize) / 144;
      if (
        bucketHasTabsMinWidthElement(mini?.elements) &&
        (!Number.isFinite(miniUnits) || miniUnits < TABS_MIN_COL_UNITS)
      ) {
        return false;
      }
    }
  }
  return true;
}

function hasAccordionMinWidthElementDeep(el) {
  if (!el || typeof el !== "object") return false;
  if (el.type === "acc") return true;
  const nestedBuckets = [];
  if (Array.isArray(el.tabsItems)) {
    for (const item of el.tabsItems) nestedBuckets.push(item?.elements);
  }
  if (Array.isArray(el.accordionItems)) {
    for (const item of el.accordionItems) nestedBuckets.push(item?.elements);
  }
  if (Array.isArray(el.dataSliderItems)) {
    for (const item of el.dataSliderItems) nestedBuckets.push(item?.elements);
  }
  if (Array.isArray(el.catagoriesItems)) {
    for (const item of el.catagoriesItems) nestedBuckets.push(item?.elements);
  }
  if (Array.isArray(el.postElements)) nestedBuckets.push(el.postElements);
  for (const bucket of nestedBuckets) {
    if (!Array.isArray(bucket)) continue;
    for (const child of bucket) {
      if (hasAccordionMinWidthElementDeep(child)) return true;
    }
  }
  return false;
}

function bucketHasAccordionMinWidthElement(elements) {
  if (!Array.isArray(elements)) return false;
  for (const el of elements) {
    if (hasAccordionMinWidthElementDeep(el)) return true;
  }
  return false;
}

function canColumnSizeContainAccordionMinWidthElements(column, targetColSize) {
  const colSize = Number(targetColSize);
  if (!Number.isFinite(colSize) || colSize <= 0) return true;
  if (
    bucketHasAccordionMinWidthElement(column?.elements) &&
    colSize < ACCORDION_MIN_COL_UNITS
  ) {
    return false;
  }
  const spans = Array.isArray(column?.spans) ? column.spans : [];
  for (const span of spans) {
    const rawSpanSize = Number(span?.size);
    const spanSize = Number.isFinite(rawSpanSize) && rawSpanSize > 0 ? rawSpanSize : 12;
    const spanUnits = (colSize * spanSize) / 12;
    if (
      bucketHasAccordionMinWidthElement(span?.elements) &&
      (!Number.isFinite(spanUnits) || spanUnits < ACCORDION_MIN_COL_UNITS)
    ) {
      return false;
    }
    const nestedSpans = Array.isArray(span?.nestedSpans) ? span.nestedSpans : [];
    for (const mini of nestedSpans) {
      const rawMiniSize = Number(mini?.size);
      const miniSize = Number.isFinite(rawMiniSize) && rawMiniSize > 0 ? rawMiniSize : 12;
      const miniUnits = (colSize * spanSize * miniSize) / 144;
      if (
        bucketHasAccordionMinWidthElement(mini?.elements) &&
        (!Number.isFinite(miniUnits) || miniUnits < ACCORDION_MIN_COL_UNITS)
      ) {
        return false;
      }
    }
  }
  return true;
}

function hasImageHoverMinWidthElementDeep(el) {
  if (!el || typeof el !== "object") return false;
  if (el.type === "imgh" || el.type === "imgo") return true;
  const nestedBuckets = [];
  if (Array.isArray(el.tabsItems)) {
    for (const item of el.tabsItems) nestedBuckets.push(item?.elements);
  }
  if (Array.isArray(el.accordionItems)) {
    for (const item of el.accordionItems) nestedBuckets.push(item?.elements);
  }
  if (Array.isArray(el.dataSliderItems)) {
    for (const item of el.dataSliderItems) nestedBuckets.push(item?.elements);
  }
  if (Array.isArray(el.catagoriesItems)) {
    for (const item of el.catagoriesItems) nestedBuckets.push(item?.elements);
  }
  if (Array.isArray(el.postElements)) nestedBuckets.push(el.postElements);
  for (const bucket of nestedBuckets) {
    if (!Array.isArray(bucket)) continue;
    for (const child of bucket) {
      if (hasImageHoverMinWidthElementDeep(child)) return true;
    }
  }
  return false;
}

function bucketHasImageHoverMinWidthElement(elements) {
  if (!Array.isArray(elements)) return false;
  for (const el of elements) {
    if (hasImageHoverMinWidthElementDeep(el)) return true;
  }
  return false;
}

function canColumnSizeContainImageHoverMinWidthElements(column, targetColSize) {
  const colSize = Number(targetColSize);
  if (!Number.isFinite(colSize) || colSize <= 0) return true;
  if (
    bucketHasImageHoverMinWidthElement(column?.elements) &&
    colSize < IMAGE_HOVER_MIN_COL_UNITS
  ) {
    return false;
  }
  const spans = Array.isArray(column?.spans) ? column.spans : [];
  for (const span of spans) {
    const rawSpanSize = Number(span?.size);
    const spanSize = Number.isFinite(rawSpanSize) && rawSpanSize > 0 ? rawSpanSize : 12;
    const spanUnits = (colSize * spanSize) / 12;
    if (
      bucketHasImageHoverMinWidthElement(span?.elements) &&
      (!Number.isFinite(spanUnits) || spanUnits < IMAGE_HOVER_MIN_COL_UNITS)
    ) {
      return false;
    }
    const nestedSpans = Array.isArray(span?.nestedSpans) ? span.nestedSpans : [];
    for (const mini of nestedSpans) {
      const rawMiniSize = Number(mini?.size);
      const miniSize = Number.isFinite(rawMiniSize) && rawMiniSize > 0 ? rawMiniSize : 12;
      const miniUnits = (colSize * spanSize * miniSize) / 144;
      if (
        bucketHasImageHoverMinWidthElement(mini?.elements) &&
        (!Number.isFinite(miniUnits) || miniUnits < IMAGE_HOVER_MIN_COL_UNITS)
      ) {
        return false;
      }
    }
  }
  return true;
}

function canColumnSizeContainListImageMinWidthElements(column, targetColSize) {
  const colSize = Number(targetColSize);
  if (!Number.isFinite(colSize) || colSize <= 0) return true;
  if (
    bucketHasListImageMinWidthElement(column?.elements) &&
    colSize < LIST_IMAGE_MIN_COL_UNITS
  ) {
    return false;
  }
  const spans = Array.isArray(column?.spans) ? column.spans : [];
  for (const span of spans) {
    const rawSpanSize = Number(span?.size);
    const spanSize = Number.isFinite(rawSpanSize) && rawSpanSize > 0 ? rawSpanSize : 12;
    const spanUnits = (colSize * spanSize) / 12;
    if (
      bucketHasListImageMinWidthElement(span?.elements) &&
      (!Number.isFinite(spanUnits) || spanUnits < LIST_IMAGE_MIN_COL_UNITS)
    ) {
      return false;
    }
    const nestedSpans = Array.isArray(span?.nestedSpans) ? span.nestedSpans : [];
    for (const mini of nestedSpans) {
      const rawMiniSize = Number(mini?.size);
      const miniSize = Number.isFinite(rawMiniSize) && rawMiniSize > 0 ? rawMiniSize : 12;
      const miniUnits = (colSize * spanSize * miniSize) / 144;
      if (
        bucketHasListImageMinWidthElement(mini?.elements) &&
        (!Number.isFinite(miniUnits) || miniUnits < LIST_IMAGE_MIN_COL_UNITS)
      ) {
        return false;
      }
    }
  }
  return true;
}

function canColumnSizeContainPostMinWidthElements(column, targetColSize) {
  const colSize = Number(targetColSize);
  if (!Number.isFinite(colSize) || colSize <= 0) return true;
  if (bucketHasPostMinWidthElement(column?.elements) && colSize < POST_MIN_COL_UNITS) {
    return false;
  }
  const spans = Array.isArray(column?.spans) ? column.spans : [];
  for (const span of spans) {
    const rawSpanSize = Number(span?.size);
    const spanSize = Number.isFinite(rawSpanSize) && rawSpanSize > 0 ? rawSpanSize : 12;
    const spanUnits = (colSize * spanSize) / 12;
    if (
      bucketHasPostMinWidthElement(span?.elements) &&
      (!Number.isFinite(spanUnits) || spanUnits < POST_MIN_COL_UNITS)
    ) {
      return false;
    }
    const nestedSpans = Array.isArray(span?.nestedSpans) ? span.nestedSpans : [];
    for (const mini of nestedSpans) {
      const rawMiniSize = Number(mini?.size);
      const miniSize = Number.isFinite(rawMiniSize) && rawMiniSize > 0 ? rawMiniSize : 12;
      const miniUnits = (colSize * spanSize * miniSize) / 144;
      if (
        bucketHasPostMinWidthElement(mini?.elements) &&
        (!Number.isFinite(miniUnits) || miniUnits < POST_MIN_COL_UNITS)
      ) {
        return false;
      }
    }
  }
  return true;
}
const INLINE_LIST_DEFAULT_ALIGN = "start";

function layoutParentPathId(parent) {
  const pid = parent?.id;
  if (typeof pid !== "string") return "";
  if (pid.startsWith("Span-")) return pid.replace("Span-", "");
  if (pid.startsWith("Span-")) return pid.replace("Span-", "");
  if (pid.startsWith("Col-")) return pid.replace("Col-", "");
  return pid;
}

/** คืน { elements, parent } ที่ parent มี latestEleID (column | span | nestedSpan) */
/** จัดกลุ่มปุ่ม (buttonRowGroupId) / ไอคอน (iconRowGroupId) / รายการ List (listRowGroupId) ติดกัน — render แถวเดียวกัน */
function chunkColumnElementsForInlineRows(elements, flattenInlineRows = false) {
  if (!Array.isArray(elements) || elements.length === 0) return [];
  const chunks = [];
  let i = 0;
  while (i < elements.length) {
    const e = elements[i];
    if (flattenInlineRows) {
      chunks.push({ kind: "single", startIndex: i, item: e });
      i += 1;
      continue;
    }
    if (e?.type === "btn" || e?.type === "btnG") {
      const gid =
        typeof e?.buttonRowGroupId === "string" && e.buttonRowGroupId.trim()
          ? e.buttonRowGroupId.trim()
          : "";
      if (gid) {
        let j = i + 1;
        while (
          j < elements.length &&
          (elements[j]?.type === "btn" || elements[j]?.type === "btnG") &&
          String(elements[j]?.buttonRowGroupId || "").trim() === gid
        ) {
          j += 1;
        }
        const row = elements.slice(i, j);
        if (row.length >= 2) {
          chunks.push({ kind: "btnRow", startIndex: i, items: row });
          i = j;
          continue;
        }
      }
    }
    if (e?.type === "icon") {
      const gid =
        typeof e?.iconRowGroupId === "string" && e.iconRowGroupId.trim()
          ? e.iconRowGroupId.trim()
          : "";
      if (gid) {
        let j = i + 1;
        while (
          j < elements.length &&
          elements[j]?.type === "icon" &&
          String(elements[j]?.iconRowGroupId || "").trim() === gid
        ) {
          j += 1;
        }
        const row = elements.slice(i, j);
        if (row.length >= 2) {
          chunks.push({ kind: "iconRow", startIndex: i, items: row });
          i = j;
          continue;
        }
      }
    }
    if (e?.type === "ctn") {
      const gid =
        typeof e?.counterRowGroupId === "string" && e.counterRowGroupId.trim()
          ? e.counterRowGroupId.trim()
          : "";
      if (gid) {
        let j = i + 1;
        while (
          j < elements.length &&
          elements[j]?.type === "ctn" &&
          String(elements[j]?.counterRowGroupId || "").trim() === gid
        ) {
          j += 1;
        }
        const row = elements.slice(i, j);
        if (row.length >= 2) {
          chunks.push({ kind: "counterRow", startIndex: i, items: row });
          i = j;
          continue;
        }
      }
    }
    if (e?.type === "list") {
      const gid =
        typeof e?.listRowGroupId === "string" && e.listRowGroupId.trim()
          ? e.listRowGroupId.trim()
          : "";
      if (gid) {
        let j = i + 1;
        while (
          j < elements.length &&
          elements[j]?.type === "list" &&
          String(elements[j]?.listRowGroupId || "").trim() === gid
        ) {
          j += 1;
        }
        const row = elements.slice(i, j);
        if (row.length >= 2) {
          chunks.push({ kind: "listRow", startIndex: i, items: row });
          i = j;
          continue;
        }
      }
    }
    chunks.push({ kind: "single", startIndex: i, item: e });
    i += 1;
  }
  return chunks;
}

function buttonRowJustifyCss(align) {
  const raw = String(align || "").trim();
  if (raw === "end") return "flex-end";
  if (raw === "center") return "center";
  return "flex-start";
}

function inlineRowJustifyFromChunk(chunk) {
  if (chunk.kind === "iconRow" || chunk.kind === "listRow") {
    return buttonRowJustifyCss(chunk.items[0]?.iconLayoutAlign);
  }
  if (chunk.kind === "counterRow") {
    const raw = String(
      chunk.items[0]?.counterRowAlign ?? chunk.items[0]?.counterAlign ?? ""
    ).trim();
    if (raw === "left") return "flex-start";
    if (raw === "right") return "flex-end";
    if (raw === "start" || raw === "center" || raw === "end") {
      return buttonRowJustifyCss(raw);
    }
    return "center";
  }
  return buttonRowJustifyCss(chunk.items[0]?.buttonLayoutAlign);
}

/**
 * แถว listRow: ระยะแนวนอนคุมด้วย mr ต่อคู่ (ไม่ใช้ gap-x เดียวทั้งแถว)
 * — 24px เมื่อคู่ (ซ้าย, ขวา) เป็น List iCons และชุดซ้ายเลือกเส้นคั่น "ไม่มี" (รวมช่องก่อนชุดสุดท้าย แม้ชุดขวาจะมีเส้นคั่น)
 */
function inlineChunkRowFlexGapClass(chunk) {
  if (chunk.kind === "listRow") return "gap-x-0 gap-y-2";
  if (chunk.kind === "iconRow") return "gap-x-0 gap-y-2";
  if (chunk.kind === "counterRow") return "gap-x-0 gap-y-2";
  return "gap-2";
}

function inlineListRowItemTrailingClassName(chunk, localIdx) {
  if (chunk.kind !== "listRow") return "";
  const items = chunk.items || [];
  if (localIdx < 0 || localIdx >= items.length - 1) return "";
  const left = items[localIdx];
  const right = items[localIdx + 1];
  if (left?.listIconsElement !== true || right?.listIconsElement !== true) {
    return "mr-2";
  }
  if (left?.listDividerEnabled === false) {
    return "mr-[24px]";
  }
  return "mr-2";
}

function inlineIconRowGapPx(item) {
  const raw = Number(item?.iconRowGap);
  if (!Number.isFinite(raw)) return 8;
  return Math.max(0, Math.min(80, raw));
}

function inlineIconRowDividerStyle(item, theme) {
  const opacityToHex = (value) => {
    const n = Number(value);
    const v = Number.isFinite(n) ? Math.max(0, Math.min(255, n)) : 255;
    return v.toString(16).toUpperCase().padStart(2, "0");
  };
  const appendOpacityToHexColor = (color, opacity) => {
    if (typeof color !== "string") return color;
    const raw = color.trim();
    const shortHex = /^#([0-9a-fA-F]{3})$/;
    const fullHex = /^#([0-9a-fA-F]{6})$/;
    if (shortHex.test(raw)) {
      const r = raw[1];
      const g = raw[2];
      const b = raw[3];
      return `#${r}${r}${g}${g}${b}${b}${opacityToHex(opacity)}`;
    }
    if (fullHex.test(raw)) return `${raw}${opacityToHex(opacity)}`;
    return raw;
  };
  const enabled = item?.iconRowDividerEnabled === true;
  const styleRaw = String(item?.iconRowDividerStyle || "solid")
    .trim()
    .toLowerCase();
  const borderLeftStyle =
    styleRaw === "dashed" || styleRaw === "dotted" ? styleRaw : "solid";
  const color = (() => {
    const src = item?.iconRowDividerColor ?? { type: "textColor", index: 0 };
    const opacityRaw = Number(item?.iconRowDividerOpacity);
    const opacity = Number.isFinite(opacityRaw)
      ? Math.max(0, Math.min(255, opacityRaw))
      : 255;
    if (typeof src === "string") return appendOpacityToHexColor(src, opacity);
    return setColor(theme, src, opacity);
  })();
  const height = Math.max(20, Math.min(160, Number(item?.containerSize) || 64));
  return { enabled, borderLeftStyle, color, height };
}

function inlineCounterRowGapPx(item) {
  const raw = Number(item?.counterRowGap);
  if (!Number.isFinite(raw)) return 8;
  return Math.max(0, Math.min(80, raw));
}

function inlineCounterRowDividerStyle(item, theme) {
  const opacityToHex = (value) => {
    const n = Number(value);
    const v = Number.isFinite(n) ? Math.max(0, Math.min(255, n)) : 255;
    return v.toString(16).toUpperCase().padStart(2, "0");
  };
  const appendOpacityToHexColor = (color, opacity) => {
    if (typeof color !== "string") return color;
    const raw = color.trim();
    const shortHex = /^#([0-9a-fA-F]{3})$/;
    const fullHex = /^#([0-9a-fA-F]{6})$/;
    if (shortHex.test(raw)) {
      const r = raw[1];
      const g = raw[2];
      const b = raw[3];
      return `#${r}${r}${g}${g}${b}${b}${opacityToHex(opacity)}`;
    }
    if (fullHex.test(raw)) return `${raw}${opacityToHex(opacity)}`;
    return raw;
  };
  const enabled = item?.counterRowDividerEnabled === true;
  const styleRaw = String(item?.counterRowDividerStyle || "solid")
    .trim()
    .toLowerCase();
  const borderLeftStyle =
    styleRaw === "dashed" || styleRaw === "dotted" ? styleRaw : "solid";
  const color = (() => {
    const src = item?.counterRowDividerColor ?? { type: "textColor", index: 0 };
    const opacityRaw = Number(item?.counterRowDividerOpacity);
    const opacity = Number.isFinite(opacityRaw)
      ? Math.max(0, Math.min(255, opacityRaw))
      : 255;
    if (typeof src === "string") return appendOpacityToHexColor(src, opacity);
    return setColor(theme, src, opacity);
  })();
  const height = Math.max(
    20,
    Math.min(
      160,
      Number(item?.counterFontSize) ||
        Number(item?.counterCompositionFontSize) ||
        42
    )
  );
  return { enabled, borderLeftStyle, color, height };
}

function findDropElementNodeByEleId(eleId) {
  if (eleId == null) return null;
  const want = String(eleId);
  const all = document.querySelectorAll('[data-drop="ELEMENT"]');
  for (let i = 0; i < all.length; i++) {
    const n = all[i];
    const raw = n.getAttribute("id");
    if (!raw) continue;
    const last = raw.includes("/") ? raw.split("/").pop() : raw;
    if (last === want) return n;
  }
  return null;
}

/** กึ่งกลางแนวตั้งของก้อน list ต่อเนื่องทั้งก้อน (บนแถวแรก → ล่างแถวสุดท้าย) */
function listRunBlockMidY(eleBucket, runStart, runEndEx) {
  const first = eleBucket[runStart];
  const last = eleBucket[runEndEx - 1];
  if (!first || !last || first.type !== "list" || last.type !== "list") {
    return null;
  }
  const nA = findDropElementNodeByEleId(first.id);
  const nB = findDropElementNodeByEleId(last.id);
  if (!nA || !nB) return null;
  const ra = nA.getBoundingClientRect();
  const rb = nB.getBoundingClientRect();
  return (ra.top + rb.bottom) / 2;
}

/** คงฝั่ง snap ในแถบกลางระหว่างหัว/ท้ายก้อน list — ลดกระพริบเมื่อ mouseY อยู่ใกล้ mid */
let listRunSnapState = { runKey: null, side: null };

function resetListRunSnapState() {
  listRunSnapState = { runKey: null, side: null };
}

let tabInlineRowSnapState = { key: null, side: null };

function resetTabInlineRowSnapState() {
  tabInlineRowSnapState = { key: null, side: null };
}

/** กัน index สลับไปมาเมื่อ pointer อยู่กึ่งกลางระหว่างสอง element */
let eleInsertSnapState = {
  bucketKey: null,
  hitId: null,
  side: null,
  index: null,
};

function resetEleInsertSnapState() {
  eleInsertSnapState = {
    bucketKey: null,
    hitId: null,
    side: null,
    index: null,
  };
}

function readInsertBoundaryY(eleBucket, insertI) {
  if (!Array.isArray(eleBucket) || eleBucket.length === 0) return null;
  if (insertI <= 0) {
    const firstNode = findDropElementNodeByEleId(eleBucket[0]?.id);
    if (!firstNode) return null;
    const r = firstNode.getBoundingClientRect();
    return r.top;
  }
  if (insertI >= eleBucket.length) {
    const lastNode = findDropElementNodeByEleId(eleBucket[eleBucket.length - 1]?.id);
    if (!lastNode) return null;
    const r = lastNode.getBoundingClientRect();
    return r.bottom;
  }
  const upNode = findDropElementNodeByEleId(eleBucket[insertI - 1]?.id);
  const dnNode = findDropElementNodeByEleId(eleBucket[insertI]?.id);
  if (!upNode || !dnNode) return null;
  const up = upNode.getBoundingClientRect();
  const dn = dnNode.getBoundingClientRect();
  return (up.bottom + dn.top) / 2;
}

function computeStableElementInsertIndex({
  eleBucket,
  bucketKey,
  hitI,
  eleID,
  mouseY,
  midY,
}) {
  const MID_HY = 22;
  const BOUNDARY_HY = 28;
  const EDGE_LOCK_HY = 40;
  const sameBucket = eleInsertSnapState.bucketKey === bucketKey;
  const prevIndex = sameBucket && Number.isInteger(eleInsertSnapState.index)
    ? Math.max(0, Math.min(eleBucket.length, eleInsertSnapState.index))
    : null;

  if (prevIndex != null) {
    const prevBoundaryY = readInsertBoundaryY(eleBucket, prevIndex);
    if (prevBoundaryY != null && Math.abs(mouseY - prevBoundaryY) <= EDGE_LOCK_HY) {
      eleInsertSnapState = {
        bucketKey,
        hitId: eleID,
        side: prevIndex > hitI ? 1 : 0,
        index: prevIndex,
      };
      return prevIndex;
    }
    if (prevIndex === 0) {
      const firstNode = findDropElementNodeByEleId(eleBucket[0]?.id);
      if (firstNode) {
        const r = firstNode.getBoundingClientRect();
        if (mouseY <= r.top + EDGE_LOCK_HY) {
          eleInsertSnapState = {
            bucketKey,
            hitId: eleID,
            side: 0,
            index: 0,
          };
          return 0;
        }
      }
    } else if (prevIndex === eleBucket.length) {
      const lastNode = findDropElementNodeByEleId(eleBucket[eleBucket.length - 1]?.id);
      if (lastNode) {
        const r = lastNode.getBoundingClientRect();
        if (mouseY >= r.bottom - EDGE_LOCK_HY) {
          eleInsertSnapState = {
            bucketKey,
            hitId: eleID,
            side: 1,
            index: eleBucket.length,
          };
          return eleBucket.length;
        }
      }
    }
  }

  let side;
  if (mouseY < midY - MID_HY) {
    side = 0;
  } else if (mouseY > midY + MID_HY) {
    side = 1;
  } else if (
    eleInsertSnapState.bucketKey === bucketKey &&
    Number.isInteger(eleInsertSnapState.index)
  ) {
    const sticky = Math.max(0, Math.min(eleBucket.length, eleInsertSnapState.index));
    eleInsertSnapState = {
      bucketKey,
      hitId: eleID,
      side: sticky > hitI ? 1 : 0,
      index: sticky,
    };
    return sticky;
  } else {
    side = mouseY > midY ? 1 : 0;
  }

  let candidate = hitI + side;
  if (
    eleInsertSnapState.bucketKey === bucketKey &&
    Number.isInteger(eleInsertSnapState.index) &&
    eleInsertSnapState.index !== candidate
  ) {
    const boundaryY = readInsertBoundaryY(
      eleBucket,
      Math.max(candidate, eleInsertSnapState.index)
    );
    if (boundaryY != null && Math.abs(mouseY - boundaryY) <= BOUNDARY_HY) {
      candidate = eleInsertSnapState.index;
      side = candidate > hitI ? 1 : 0;
    }
  }

  eleInsertSnapState = {
    bucketKey,
    hitId: eleID,
    side,
    index: candidate,
  };
  return candidate;
}

/**
 * ลาก element ใหม่ลงคอลัมน์: ถ้าตำแหน่งแทรกอยู่ระหว่าง list ที่ติดกัน ≥2 ตัว
 * ไม่ให้แยกกลางรัน — ชิดก่อนรายการ list แรกของก้อน หรือหลังรายการ list สุดท้าย
 * ใช้กึ่งกลางทั้งก้อน + hysteresis + state ในแถบกลาง (ไม่ผูก hitIndex / คู่ list)
 */
function snapInsertOutsideConsecutiveLists(
  eleBucket,
  candidateEleI,
  hitIndex,
  mouseY
) {
  const clearSnap = () => {
    resetListRunSnapState();
  };
  if (!Array.isArray(eleBucket) || candidateEleI <= 0) {
    clearSnap();
    return candidateEleI;
  }
  if (candidateEleI >= eleBucket.length) {
    clearSnap();
    return candidateEleI;
  }
  if (
    eleBucket[candidateEleI - 1]?.type !== "list" ||
    eleBucket[candidateEleI]?.type !== "list"
  ) {
    clearSnap();
    return candidateEleI;
  }
  let runStart = candidateEleI - 1;
  while (runStart > 0 && eleBucket[runStart - 1]?.type === "list") {
    runStart -= 1;
  }
  let runEndEx = candidateEleI;
  while (runEndEx < eleBucket.length && eleBucket[runEndEx]?.type === "list") {
    runEndEx += 1;
  }
  if (runEndEx - runStart < 2) {
    clearSnap();
    return candidateEleI;
  }
  const midRun = listRunBlockMidY(eleBucket, runStart, runEndEx);
  if (midRun != null && Number.isFinite(mouseY)) {
    const runKey = `${runStart}-${runEndEx}`;
    const HY = 14;
    let side;
    if (mouseY < midRun - HY) {
      side = "start";
    } else if (mouseY > midRun + HY) {
      side = "end";
    } else if (listRunSnapState.runKey === runKey && listRunSnapState.side) {
      side = listRunSnapState.side;
    } else {
      side = mouseY < midRun ? "start" : "end";
    }
    listRunSnapState = { runKey, side };
    return side === "start" ? runStart : runEndEx;
  }
  clearSnap();
  return candidateEleI === hitIndex ? runStart : runEndEx;
}

/** ลบ buttonRowGroupId / iconRowGroupId / listRowGroupId / counterRowGroupId เมื่อเหลือสมาชิกในกลุ่มน้อยกว่า 2 — กัน gid ค้างทำให้โหมดแก้ไขปรับจัดซ้าย/กลาง/ขวาไม่เห็นผล */
function stripOrphanInlineRowGroupIds(elements) {
  if (!Array.isArray(elements) || elements.length === 0) return;
  const btnGidCounts = new Map();
  const iconRowGidCounts = new Map();
  const listGidCounts = new Map();
  const counterGidCounts = new Map();
  for (const el of elements) {
    const t = el?.type;
    if (t === "btn" || t === "btnG") {
      const g = el?.buttonRowGroupId;
      if (typeof g === "string" && g.trim() !== "") {
        btnGidCounts.set(g, (btnGidCounts.get(g) || 0) + 1);
      }
    } else if (t === "icon") {
      const g = el?.iconRowGroupId;
      if (typeof g === "string" && g.trim() !== "") {
        iconRowGidCounts.set(g, (iconRowGidCounts.get(g) || 0) + 1);
      }
    } else if (t === "list") {
      const g = el?.listRowGroupId;
      if (typeof g === "string" && g.trim() !== "") {
        listGidCounts.set(g, (listGidCounts.get(g) || 0) + 1);
      }
    } else if (t === "ctn") {
      const g = el?.counterRowGroupId;
      if (typeof g === "string" && g.trim() !== "") {
        counterGidCounts.set(g, (counterGidCounts.get(g) || 0) + 1);
      }
    }
  }
  for (const el of elements) {
    const t = el?.type;
    if ((t === "btn" || t === "btnG") && el?.buttonRowGroupId != null) {
      const g = el.buttonRowGroupId;
      if (
        typeof g !== "string" ||
        g.trim() === "" ||
        (btnGidCounts.get(g) || 0) < 2
      ) {
        delete el.buttonRowGroupId;
      }
    }
    if (t === "icon" && el?.iconRowGroupId != null) {
      const g = el.iconRowGroupId;
      if (
        typeof g !== "string" ||
        g.trim() === "" ||
        (iconRowGidCounts.get(g) || 0) < 2
      ) {
        delete el.iconRowGroupId;
      }
    }
    if (t === "list" && el?.listRowGroupId != null) {
      const g = el.listRowGroupId;
      if (
        typeof g !== "string" ||
        g.trim() === "" ||
        (listGidCounts.get(g) || 0) < 2
      ) {
        delete el.listRowGroupId;
      }
    }
    if (t === "ctn" && el?.counterRowGroupId != null) {
      const g = el.counterRowGroupId;
      if (
        typeof g !== "string" ||
        g.trim() === "" ||
        (counterGidCounts.get(g) || 0) < 2
      ) {
        delete el.counterRowGroupId;
      }
    }
  }
}

function stripOrphanInlineRowGroupIdsInLists(...lists) {
  const seen = new Set();
  for (const arr of lists) {
    if (!Array.isArray(arr) || seen.has(arr)) continue;
    seen.add(arr);
    stripOrphanInlineRowGroupIds(arr);
  }
}

function stripOrphanInlineRowGroupsEverywhere(layouts) {
  if (!Array.isArray(layouts)) return;
  for (const layout of layouts) {
    const cols = layout?.columns;
    if (!Array.isArray(cols)) continue;
    for (const col of cols) {
      stripOrphanInlineRowGroupIds(col.elements);
      if (!col.spans?.length) continue;
      for (const sp of col.spans) {
        stripOrphanInlineRowGroupIds(sp.elements);
        if (!sp.nestedSpans?.length) continue;
        for (const ms of sp.nestedSpans) {
          stripOrphanInlineRowGroupIds(ms.elements);
        }
      }
    }
  }
}

function getInlineRowGroupBounds(elements, index) {
  if (!Array.isArray(elements) || index < 0 || index >= elements.length) return null;
  const el = elements[index];
  const type = String(el?.type || "").trim();
  // Accept both "btn" and "btnG" as the same inline-row type.
  const normalizedType = type === "btnG" ? "btn" : type;
  const readGid = () => {
    if (normalizedType === "btn") return String(el?.buttonRowGroupId || "").trim();
    if (normalizedType === "icon") return String(el?.iconRowGroupId || "").trim();
    if (normalizedType === "ctn") return String(el?.counterRowGroupId || "").trim();
    if (normalizedType === "list") return String(el?.listRowGroupId || "").trim();
    return "";
  };
  const gid = readGid();
  const sameGroup = (entry) => {
    const t = String(entry?.type || "").trim();
    if (normalizedType === "btn") {
      if (t !== "btn" && t !== "btnG") return false;
      const entryGid = String(entry?.buttonRowGroupId || "").trim();
      if (!gid) return false;
      return entryGid === gid;
    }
    if (normalizedType === "icon") {
      if (t !== "icon") return false;
      const entryGid = String(entry?.iconRowGroupId || "").trim();
      if (!gid) return false;
      return entryGid === gid;
    }
    if (normalizedType === "ctn") {
      if (t !== "ctn") return false;
      const entryGid = String(entry?.counterRowGroupId || "").trim();
      if (!gid) return false;
      return entryGid === gid;
    }
    if (normalizedType === "list") {
      if (t !== "list") return false;
      const entryGid = String(entry?.listRowGroupId || "").trim();
      if (!gid) return false;
      return entryGid === gid;
    }
    return false;
  };
  let start = index;
  while (start > 0 && sameGroup(elements[start - 1])) start -= 1;
  let end = index;
  while (end + 1 < elements.length && sameGroup(elements[end + 1])) end += 1;
  if (end - start + 1 < 2) return null;
  return { start, end, gid, type: normalizedType };
}

function snapInsertOutsideInlineGroup(elements, insertAt) {
  if (!Array.isArray(elements) || elements.length < 2) return insertAt;
  const safeInsertAt = Math.max(0, Math.min(elements.length, insertAt));
  if (safeInsertAt <= 0 || safeInsertAt >= elements.length) return safeInsertAt;

  // Strict boundary: if candidate falls inside any inline group, force it outside group.
  for (let i = 0; i < elements.length; i += 1) {
    const group = getInlineRowGroupBounds(elements, i);
    if (!group) continue;
    if (safeInsertAt > group.start && safeInsertAt <= group.end) {
      return group.end + 1;
    }
    i = group.end;
  }

  const groupBefore = getInlineRowGroupBounds(elements, safeInsertAt - 1);
  const groupAfter = getInlineRowGroupBounds(elements, safeInsertAt);
  if (
    groupBefore &&
    groupAfter &&
    groupBefore.type === groupAfter.type &&
    groupBefore.gid === groupAfter.gid &&
    groupBefore.start === groupAfter.start &&
    groupBefore.end === groupAfter.end
  ) {
    return groupBefore.end + 1;
  }
  if (groupBefore && safeInsertAt <= groupBefore.end) {
    return groupBefore.end + 1;
  }
  return safeInsertAt;
}

function computeInsertAtByOrderedElementMidY(elements, midById, mouseY) {
  if (!Array.isArray(elements)) return null;
  if (!(midById instanceof Map) || midById.size === 0) return null;
  let insertAt = elements.length;
  let hasAnyMid = false;
  for (let i = 0; i < elements.length; i += 1) {
    const id = String(elements[i]?.id || "");
    const midY = Number(midById.get(id));
    if (!Number.isFinite(midY)) continue;
    hasAnyMid = true;
    if (mouseY <= midY) {
      insertAt = i;
      break;
    }
  }
  return hasAnyMid ? insertAt : null;
}

function collectElementMidById(elements) {
  const midById = new Map();
  if (!Array.isArray(elements) || !elements.length) return midById;
  for (const el of elements) {
    const id = String(el?.id || "");
    if (!id || midById.has(id)) continue;
    const node = findDropElementNodeByEleId(id);
    if (!node) continue;
    const rect = node.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    if (!Number.isFinite(midY)) continue;
    midById.set(id, midY);
  }
  return midById;
}

function snapInsertOutsideInlineGroupByPointer(elements, insertAt, mouseY, midById) {
  if (!Array.isArray(elements) || elements.length < 2) return insertAt;
  const safe = Number.isInteger(insertAt)
    ? Math.max(0, Math.min(elements.length, insertAt))
    : 0;

  const getGroupMidY = (group) => {
    if (!group || !(midById instanceof Map)) return null;
    let firstMid = null;
    let lastMid = null;
    for (let i = group.start; i <= group.end; i += 1) {
      const id = String(elements[i]?.id || "");
      const mid = Number(midById.get(id));
      if (!Number.isFinite(mid)) continue;
      if (firstMid == null) firstMid = mid;
      lastMid = mid;
    }
    if (!Number.isFinite(firstMid) || !Number.isFinite(lastMid)) return null;
    return (firstMid + lastMid) / 2;
  };
  const pickSide = (group) => {
    const groupMidY = getGroupMidY(group);
    if (Number.isFinite(groupMidY)) {
      return mouseY <= groupMidY ? group.start : group.end + 1;
    }
    return group.end + 1;
  };

  if (safe > 0 && safe < elements.length) {
    for (let i = 0; i < elements.length; i += 1) {
      const group = getInlineRowGroupBounds(elements, i);
      if (!group) continue;
      if (safe > group.start && safe <= group.end) {
        return pickSide(group);
      }
      i = group.end;
    }
  }

  const groupBefore = getInlineRowGroupBounds(elements, safe - 1);
  if (
    groupBefore &&
    safe > groupBefore.start &&
    safe <= groupBefore.end + 1
  ) {
    return pickSide(groupBefore);
  }
  return safe;
}

function reorderElementsWithInlineGroups(elements, fromIndex, toIndex) {
  if (!Array.isArray(elements)) return false;
  const len = elements.length;
  if (len < 2) return false;
  if (fromIndex < 0 || fromIndex >= len) return false;
  const safeTo = Math.max(0, Math.min(len, Number(toIndex)));
  if (!Number.isInteger(safeTo)) return false;
  if (fromIndex === safeTo) return false;
  const sourceGroup = getInlineRowGroupBounds(elements, fromIndex);
  const sourceStart = sourceGroup ? sourceGroup.start : fromIndex;
  const sourceEnd = sourceGroup ? sourceGroup.end : fromIndex;
  const blockLen = sourceEnd - sourceStart + 1;
  const targetGroup = safeTo < len ? getInlineRowGroupBounds(elements, safeTo) : null;
  const movingDown = fromIndex < safeTo;
  if (
    sourceGroup &&
    targetGroup &&
    sourceGroup.type === targetGroup.type &&
    sourceGroup.gid === targetGroup.gid
  ) {
    return false;
  }
  const block = elements.splice(sourceStart, blockLen);
  let snappedTo = safeTo;
  if (safeTo < len) {
    if (targetGroup) {
      snappedTo = movingDown ? targetGroup.end + 1 : targetGroup.start;
    } else if (movingDown) {
      snappedTo = safeTo + 1;
    }
  } else {
    snappedTo = len;
  }
  let insertAt = snappedTo;
  if (sourceStart < insertAt) insertAt -= blockLen;
  insertAt = Math.max(0, Math.min(elements.length, insertAt));
  if (insertAt === sourceStart) {
    elements.splice(sourceStart, 0, ...block);
    return false;
  }
  elements.splice(insertAt, 0, ...block);
  return true;
}

function getInlineGroupElementEffectiveRect(el) {
  if (typeof document === "undefined" || !el) return null;
  const idStr = String(el?.id || "").trim();
  if (!idStr) return null;
  const safeId = idStr.replace(/"/g, '\\"');
  const node = document.querySelector(`[data-drop="ELEMENT"][id$="/${safeId}"]`);
  const outerRect = node?.getBoundingClientRect?.();
  if (!outerRect) return null;

  const t = String(el?.type || "");
  if (t === "btn" || t === "btnG") {
    const btnNode =
      node?.querySelector?.(".MuiButton-root") ||
      node?.querySelector?.("button") ||
      node?.querySelector?.("a");
    const btnRect = btnNode?.getBoundingClientRect?.();
    if (btnRect && Number.isFinite(btnRect.width) && btnRect.width > 0) {
      return btnRect;
    }
  }
  return outerRect;
}

function moveInlineGroupBlockBetweenLists(oldElements, newElements, oldIndex, newIndex) {
  if (!Array.isArray(oldElements) || !Array.isArray(newElements)) return false;
  if (!Number.isInteger(oldIndex) || oldIndex < 0 || oldIndex >= oldElements.length) {
    return false;
  }
  const sameList = oldElements === newElements;
  if (sameList) {
    if (!Number.isInteger(newIndex)) return false;
    return reorderElementsWithInlineGroups(oldElements, oldIndex, newIndex);
  }
  const group = getInlineRowGroupBounds(oldElements, oldIndex);
  const start = group ? group.start : oldIndex;
  const end = group ? group.end : oldIndex;
  const blockLen = end - start + 1;
  if (blockLen <= 0) return false;
  const block = oldElements.splice(start, blockLen);
  let insertAt = Number.isInteger(newIndex) ? newIndex : newElements.length;
  insertAt = Math.max(0, Math.min(newElements.length, insertAt));
  insertAt = snapInsertOutsideInlineGroup(newElements, insertAt);
  newElements.splice(insertAt, 0, ...block);
  stripOrphanInlineRowGroupIdsInLists(oldElements, newElements);
  return true;
}


/** หา list + index ของ element ตาม id ใน layouts (clone หรือ state) */
function findLayoutElementListIndex(layouts, eleIdStr) {
  const idStr = String(eleIdStr);
  for (let conI = 0; conI < layouts.length; conI++) {
    const lay = layouts[conI];
    const cols = lay?.columns;
    if (!Array.isArray(cols)) continue;
    for (let colI = 0; colI < cols.length; colI++) {
      const col = cols[colI];
      const tryList = (list, spnI, nestI) => {
        if (!Array.isArray(list)) return null;
        const ix = list.findIndex(
          (el) => String(el.id) === idStr || String(el._id ?? "") === idStr
        );
        if (ix === -1) return null;
        return {
          conI,
          colI,
          spnI,
          nestI,
          list,
          ix,
          conID: lay.container.id,
          colID: col.id,
          spnID:
            spnI != null && col.spans?.[spnI]?.id != null
              ? col.spans[spnI].id
              : undefined,
          nestID:
            nestI != null &&
            col.spans?.[spnI]?.nestedSpans?.[nestI]?.id != null
              ? col.spans[spnI].nestedSpans[nestI].id
              : undefined,
        };
      };
      const tryTabsNested = (list, spnI, nestI) => {
        if (!Array.isArray(list)) return null;
        for (const host of list) {
          const hostItems =
            host?.type === "tabs"
              ? host?.tabsItems
              : host?.type === "acc"
                ? host?.accordionItems
                : host?.type === "post"
                  ? [{ id: "post-main", elements: host?.postElements }]
                  : host?.type === "dts"
                    ? host?.dataSliderItems
                    : host?.type === "ctg"
                      ? mergeCatagoriesElement(host)?.catagoriesItems
                : null;
          if (!Array.isArray(hostItems)) continue;
          for (const tab of hostItems) {
            const nested = Array.isArray(tab?.elements) ? tab.elements : [];
            if (!Array.isArray(nested)) continue;
            const ix = nested.findIndex(
              (el) => String(el?.id) === idStr || String(el?._id ?? "") === idStr
            );
            if (ix === -1) continue;
            return {
              conI,
              colI,
              spnI,
              nestI,
              list: nested,
              ix,
              conID: lay.container.id,
              colID: col.id,
              spnID:
                spnI != null && col.spans?.[spnI]?.id != null
                  ? col.spans[spnI].id
                  : undefined,
              nestID:
                nestI != null &&
                col.spans?.[spnI]?.nestedSpans?.[nestI]?.id != null
                  ? col.spans[spnI].nestedSpans[nestI].id
                  : undefined,
              tabHostID: host.id,
              tabID: tab.id,
            };
          }
        }
        return null;
      };
      let r = tryList(col.elements, null, null);
      if (r) return r;
      r = tryTabsNested(col.elements, null, null);
      if (r) return r;
      for (let spnI = 0; spnI < (col.spans || []).length; spnI++) {
        const sp = col.spans[spnI];
        r = tryList(sp.elements, spnI, null);
        if (r) return r;
        r = tryTabsNested(sp.elements, spnI, null);
        if (r) return r;
        for (let nestI = 0; nestI < (sp.nestedSpans || []).length; nestI++) {
          const ms = sp.nestedSpans[nestI];
          r = tryList(ms.elements, spnI, nestI);
          if (r) return r;
          r = tryTabsNested(ms.elements, spnI, nestI);
          if (r) return r;
        }
      }
    }
  }
  return null;
}

/** หา element object ตาม id (ใช้ร่วมกับ patch / โมดัลแก้ข้อความ carousel) */
function findLayoutElementById(layouts, eleId) {
  const loc = findLayoutElementListIndex(layouts, eleId);
  if (!loc) return null;
  return loc.list[loc.ix] ?? null;
}

function buildSelectionIdsForElement(layouts, eleId) {
  const loc = findLayoutElementListIndex(layouts, eleId);
  if (!loc) return null;
  const base = {
    conID: loc.conID,
    colID: loc.colID,
    spnID: loc.spnID,
    nestID: loc.nestID,
    eleID: String(eleId),
  };
  if (loc.tabHostID != null) {
    base.tabsHostId = loc.tabHostID;
    base.tabId = loc.tabID;
  }
  return base;
}

/** น้ำหนักนับรวมสำหรับ footer — Carousel/Data Slider/List Box (crl/dts/lstb)=10, text/heading=1, อื่น=2 */
function canvasLayoutElementWeight(el) {
  const t = el?.type;
  if (t === "crl" || t === "lstb" || t === "dts") return 10;
  if (t === "ctg") return 10;
  if (t === "text" || t === "heading") return 1;
  return 2;
}

function addCanvasElementWeights(list, physicalRef, weightedRef) {
  if (!Array.isArray(list)) return;
  for (const el of list) {
    physicalRef[0] += 1;
    weightedRef[0] += canvasLayoutElementWeight(el);
  }
}

/**
 * นับโครงสร้าง + องค์ประกอบบนแคนวาส
 * — Section = 1 ต่อ layout, คอลัมน์ / Span / Mini span = โครงสร้าง
 * — องค์ประกอบ: จำนวนชิ้นจริง (elements) + น้ำหนักรวม (elementsWeighted: crl/dts/lstb=10, text/heading=1, อื่น=2) ใช้กับยอดรวมและสีปุ่ม
 */
function countCanvasLayoutStructureAndElements(layouts) {
  const empty = {
    sections: 0,
    columns: 0,
    spans: 0,
    nestedSpans: 0,
    elements: 0,
    elementsWeighted: 0,
    structureTotal: 0,
    total: 0,
  };
  if (!Array.isArray(layouts)) return empty;

  let sections = 0;
  let columns = 0;
  let spans = 0;
  let nestedSpans = 0;
  const physical = [0];
  const weighted = [0];

  for (const lay of layouts) {
    sections += 1;
    const cols = lay?.columns;
    if (!Array.isArray(cols)) continue;
    columns += cols.length;
    for (const col of cols) {
      addCanvasElementWeights(col.elements, physical, weighted);
      if (!Array.isArray(col.spans)) continue;
      spans += col.spans.length;
      for (const sp of col.spans) {
        addCanvasElementWeights(sp.elements, physical, weighted);
        if (!Array.isArray(sp.nestedSpans)) continue;
        nestedSpans += sp.nestedSpans.length;
        for (const ms of sp.nestedSpans) {
          addCanvasElementWeights(ms.elements, physical, weighted);
        }
      }
    }
  }

  const elements = physical[0];
  const elementsWeighted = weighted[0];
  const structureTotal = sections + columns + spans + nestedSpans;
  const total = structureTotal + elementsWeighted;
  return {
    sections,
    columns,
    spans,
    nestedSpans,
    elements,
    elementsWeighted,
    structureTotal,
    total,
  };
}

/** เกณฑ์สีปุ่ม “แคนวาส รวม” — เขียว: รวม ≤200, เหลือง: 201–400, แดง: ≥401 */
function canvasTotalLoadTone(total) {
  if (total <= 200) return "green";
  if (total <= 400) return "yellow";
  return "red";
}

function canvasTotalToneBracketLabel(tone) {
  if (tone === "green") return "(ปกติ)";
  if (tone === "yellow") return "(ข้อมูลเยอะ)";
  return "(อันตราย)";
}

/**
 * พรีวิวสีปุ่ม footer (dev): ตั้งเป็น 'yellow' | 'red' | 'green' เพื่อดู design — ใช้งานปกติเป็น null
 */
const PREVIEW_CANVAS_FOOTER_BUTTON_TONE = null;

/** ใช้ indices จาก findLayoutElementListIndex — ตรงกับ list เสมอ (แก้กรณี spn/mspn id หายหรือเป็น "" ทำให้ resolve ด้วย id ชี้คอลัมน์ผิด) */
function getElementsBucketByLayoutIndices(layouts, { conI, colI, spnI, nestI }) {
  if (!Array.isArray(layouts) || conI == null || colI == null) return null;
  const col = layouts[conI]?.columns?.[colI];
  if (!col) return null;
  if (spnI == null) {
    return { elements: col.elements, parent: col };
  }
  const sp = col.spans?.[spnI];
  if (!sp) return null;
  if (nestI == null) {
    return { elements: sp.elements, parent: sp };
  }
  const ms = sp.nestedSpans?.[nestI];
  if (!ms) return null;
  return { elements: ms.elements, parent: ms };
}

function isLayoutKeyboardEditableTarget(target) {
  if (!target || target === document.body) return false;
  const el = target.nodeType === 1 ? target : target.parentElement;
  if (!el) return false;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (el.isContentEditable) return true;
  if (el.closest?.("[contenteditable='true']")) return true;
  if (el.closest?.("input, textarea, select")) return true;
  if (el.closest?.('[role="textbox"]')) return true;
  if (el.closest?.('[role="dialog"]')) return true;
  return false;
}

/** ตำแหน่งแทรกแบบ physical row (0..layouts.length) — ตรงกับ updateHoverFromPoint สำหรับ SECTION */
function computeSectionPhysicalInsertIndex(
  layouts,
  sectionDomId,
  overRect,
  pointerY
) {
  if (!Array.isArray(layouts) || layouts.length === 0) return 0;
  const mid = overRect.top + overRect.height / 2;
  const y = pointerY;
  const id = sectionDomId;
  let index = layouts.findIndex(
    (l) => l.container?.id === id || l.splitRowId === id
  );
  if (index === -1) return layouts.length;
  const hitLayout = layouts[index];
  if (hitLayout?.splitRowId) {
    const splitRowId = hitLayout.splitRowId;
    const idMatchesSplitGroup =
      id === splitRowId ||
      layouts.some(
        (l) => l.splitRowId === splitRowId && l.container?.id === id
      );
    if (idMatchesSplitGroup) {
      let firstI = index;
      while (firstI > 0 && layouts[firstI - 1]?.splitRowId === splitRowId) {
        firstI--;
      }
      let lastI = index;
      while (
        lastI < layouts.length - 1 &&
        layouts[lastI + 1]?.splitRowId === splitRowId
      ) {
        lastI++;
      }
      index = y > mid ? lastI + 1 : firstI;
    } else {
      index += y > mid ? 1 : 0;
    }
  } else {
    index += y > mid ? 1 : 0;
  }
  return Math.max(0, Math.min(index, layouts.length));
}

function normalizeSpanStructure(rawLayouts) {
  if (!Array.isArray(rawLayouts) || rawLayouts.length === 0) return rawLayouts;
  let changed = false;
  const nextLayouts = lodash.cloneDeep(rawLayouts);
  const sanitizeElements = (list) =>
    Array.isArray(list)
      ? list.filter(
          (item) =>
            item &&
            typeof item === "object" &&
            typeof item.id === "string" &&
            typeof item.type === "string" &&
            item.type !== "null"
        )
      : [];
  for (const layout of nextLayouts) {
    const cols = Array.isArray(layout?.columns) ? layout.columns : [];
    for (const col of cols) {
      if (Array.isArray(col?.elements)) {
        const cleanedColElements = sanitizeElements(col.elements);
        if (cleanedColElements.length !== col.elements.length) {
          changed = true;
          col.elements = cleanedColElements;
          col.latestEleID = cleanedColElements.length;
        }
      }
      if (!col?.isSpan || !Array.isArray(col?.spans)) continue;
      for (const sp of col.spans) {
        if (Array.isArray(sp?.elements)) {
          const cleanedSpanElements = sanitizeElements(sp.elements);
          if (cleanedSpanElements.length !== sp.elements.length) {
            changed = true;
            sp.elements = cleanedSpanElements;
            sp.latestEleID = cleanedSpanElements.length;
          }
        }
        if (!sp?.hasNestedSpan || !Array.isArray(sp?.nestedSpans) || sp.nestedSpans.length === 0) continue;
        changed = true;
        const miniElements = sp.nestedSpans.flatMap((ms) =>
          sanitizeElements(ms?.elements)
        );
        if (!Array.isArray(sp.elements)) sp.elements = [];
        if (miniElements.length > 0) {
          sp.elements.push(...miniElements);
          sp.latestEleID = sp.elements.length;
        }
        sp.hasNestedSpan = false;
        sp.nestedSpans = [];
        sp.latestNestedSpanID = 0;
      }
    }
  }
  return changed ? nextLayouts : rawLayouts;
}

const Content = ({
  handleDropElement,
  openOffcavanas,
  offcanvasID,
  layouts: layoutsProp,
  setLayout,
  theme,
  page,
  setPage,
  device,
  builderMode,
  patchElementRef,
  openListBoxTextEditRef,
  isPreview = false,
}) => {
  const layouts = useMemo(
    () => normalizeSpanStructure(Array.isArray(layoutsProp) ? layoutsProp : []),
    [layoutsProp]
  );
  const isLayoutMode = builderMode === "Layout Mode";
  const previewAuditMode =
    isPreview &&
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("audit") === "1";

  // useState

  // การแสดงHTML
  const [hover, setHover] = useState(null); //เก็บค่าidของ con/col เพื่อแสดง Option Button Group ของ con/col
  const [activeID, setActiveID] = useState(null); // เก็บค่าid ของ layout ที่กำลัง Drag&Drop
  const [activeItem, setActiveItem] = useState(null); // เก็บ JSON HTML ของ layout ที่กำลัง Drag&Drop
  const [modal, setModal] = useState(null); // ตัวแปรควบคุมการเปิดปิดของ Confirm Modal
  const [alert, setAlert] = useState(false); // ตัวแปรควบคุมการเปิดปิดของ Confirm Modal
  const [preview, setPreview] = useState(null); // เก็บ JSON HTML ของ layout ใหม่ที่กำลังนำมาวาง
  const [pinnedSpanOptionId, setPinnedSpanOptionId] = useState(null);
  const [pinnedColumnOptionId, setPinnedColumnOptionId] = useState(null);
  const [columnPresetModal, setColumnPresetModal] = useState({
    open: false,
    name: "",
    error: "",
    payload: null,
  });
  const [columnPresetLoadModal, setColumnPresetLoadModal] = useState({
    open: false,
    source: null,
    presets: [],
    error: "",
  });
  const [presetDeleteConfirmId, setPresetDeleteConfirmId] = useState(null);
  /** เป้าหมายวาง ELEMENT จาก sidebar — ใช้ซ่อน badge Col/Span/Mini ตอนลากเข้าช่อง */
  const [elementDropHighlight, setElementDropHighlight] = useState(null);
  // Drag&Drop
  const [isDraggingLayout, setIsDraggingLayout] = useState(false); // เก็บค่าสถานะการ Drag&Drop (true = กำลังทำ / false = w,jwfhme)
  // Disable Drag&Drop
  const [disableConDrag, setDisableConDrag] = useState(true); // ตัวแปรควบคุมการ disable Drag&Drop ของ con
  const [disableColDrag, setDisableColDrag] = useState(true); // ตัวแปรควบคุมการ disable Drag&Drop ของ col
  const [disableEleDrag, setDisableEleDrag] = useState(true); // ตัวแปรควบคุมการ disable Drag&Drop ของ ele
  const [disableSpnDrag, setDisableSpnDrag] = useState(true); // ตัวแปรควบคุมการ disable Drag&Drop ของ spn
  // ฟังก์ชันเกี่ยวกับ Layout
  const [selectID, setSelectID] = useState({
    ids:{},
    status:""
  }); // เก็บค่าid ของ ele ที่กำลังจะแก้ไข
  const [positionElementSetting,setPositionElementSetting] = useState({x:null,y:null})
  const [textEditModal, setTextEditModal] = useState(null);
  const [carouselColToastOpen, setCarouselColToastOpen] = useState(false);
  const [listImageColToastOpen, setListImageColToastOpen] = useState(false);
  const [postColToastOpen, setPostColToastOpen] = useState(false);
  const [tabsInTabToastOpen, setTabsInTabToastOpen] = useState(false);
  const [postInPostToastOpen, setPostInPostToastOpen] = useState(false);
  const [dataSliderTypeToastOpen, setDataSliderTypeToastOpen] = useState(false);
  const [presetSavedToastOpen, setPresetSavedToastOpen] = useState(false);
  const [presetLoadedToastOpen, setPresetLoadedToastOpen] = useState(false);
  const tabsInTabWarnedRef = useRef(false);
  const postInPostWarnedRef = useRef(false);
  const dataSliderTypeWarnedRef = useRef(false);
  /** กัน ping-pong ใน during(): เก็บ key ของ pair สุดท้ายที่ apply ไปแล้ว */
  const lastEleMoveKeyRef = useRef(null);
  const stripIncomingInlineRowGroupIds = useCallback((rawElement) => {
    if (!rawElement || typeof rawElement !== "object") return rawElement;
    const next = lodash.cloneDeep(rawElement);
    delete next.buttonRowGroupId;
    delete next.iconRowGroupId;
    delete next.listRowGroupId;
    delete next.counterRowGroupId;
    return next;
  }, []);

  const textEditSnapshotKey = useMemo(() => {
    if (!textEditModal?.elementData) return "";
    const e = textEditModal.elementData;
    return JSON.stringify({
      id: e.id,
      tp: e.textParagraph,
      lb: e.label,
      md: textEditModal?.mode ?? "",
    });
  }, [textEditModal]);

  const canvasLayoutCounts = useMemo(
    () => countCanvasLayoutStructureAndElements(layouts),
    [layouts]
  );

  const canvasTotalTone = useMemo(() => {
    if (
      PREVIEW_CANVAS_FOOTER_BUTTON_TONE === "green" ||
      PREVIEW_CANVAS_FOOTER_BUTTON_TONE === "yellow" ||
      PREVIEW_CANVAS_FOOTER_BUTTON_TONE === "red"
    ) {
      return PREVIEW_CANVAS_FOOTER_BUTTON_TONE;
    }
    return canvasTotalLoadTone(canvasLayoutCounts.total);
  }, [canvasLayoutCounts.total]);

  const canvasTotalBracketText = useMemo(
    () => canvasTotalToneBracketLabel(canvasTotalTone),
    [canvasTotalTone]
  );

  const canvasTotalButtonClass = useMemo(() => {
    const base =
      "inline-flex shrink-0 items-center gap-1.5 rounded-md border px-3 py-1.5 text-left text-[12px] font-medium shadow-sm transition focus:outline-none focus-visible:ring-2 ";
    if (canvasTotalTone === "green") {
      return `${base}text-white border-emerald-700/90 bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-400/80 dark:border-emerald-500/80 dark:bg-emerald-700 dark:hover:bg-emerald-600`;
    }
    if (canvasTotalTone === "yellow") {
      return `${base}border-yellow-600/90 bg-yellow-400 text-yellow-950 hover:bg-yellow-500 focus-visible:ring-yellow-300/90 dark:border-yellow-500/80 dark:bg-yellow-500 dark:text-yellow-950 dark:hover:bg-yellow-400`;
    }
    return `${base}text-white border-red-700/90 bg-red-600 hover:bg-red-700 focus-visible:ring-red-400/80 dark:border-red-500/80 dark:bg-red-700 dark:hover:bg-red-600`;
  }, [canvasTotalTone]);

 

  // useRef

  // การแสดงHTML
  const ghostRef = useRef(null); // เก็บ Ref ของ Ghost ที่จำลองตำแหน่งการวาง Layout ใหม่
  const dragRef = useRef(null); // เก็บ Ref ของ Preview ของ element ที่กำลัง Drag&Drop
  const activeDragRef = useRef(null);
  const dropTargetRef = useRef({ index: null, type: null, isLast: false }); // เก็บค่า index ประเภท และใช่ตำแหน่งสุดใหม่ไหม ของ Ghost เพื่อใช้เป็นindexสำหรับการวาง Layout ใหม่
  /**
   * กันอาการ preview สลับเร็วตอนลากผ่านหลายคอลัมน์:
   * ใช้ intent แบบเบาๆ (จำ target ล่าสุด + เวลาเริ่ม hover)
   */
  const elementHoverIntentRef = useRef({
    key: "",
    startedAt: 0,
  });
  const sidebarPreviewIntentRef = useRef({
    key: "",
    startedAt: 0,
    x: 0,
    y: 0,
  });
  const canvasScrollRef = useRef(null);
  // การควบคุม Hover เพื่อใช้งานฟังก์ชัน
  const hoverRef = useRef(null); // สำหรับควบคุมฟังก์ชัน updateHoverFromPoint(การวาง Layout ใหม่)
  const dndRef = useRef(null); // สำหรับควบคุมฟังก์ชัน updateDND(การ disable Drag&Drop)
  const dropHoldUntilRef = useRef(0); // กันหลุด drop target ทันทีเมื่อเมาส์เฉี่ยวขอบ
  const btnGroupRef = useRef(null); // สำหรับควบคุมฟังก์ชัน updateHoverPosition(การแสดง Option Button Group)
  // การเก็บค่า
  const positionRef = useRef(null); // เก็บตำแหน่งเดิมของ container เมื่อ Drag&Drop ele
  const dragToken = useRef(0); // เก็บtoken เพื่อสั่งหยุด hoverRef
  const activeInlineDragGroupRef = useRef(null);
  const carouselColWarnedRef = useRef(false);
  const listImageColWarnedRef = useRef(false);
  const postColWarnedRef = useRef(false);
  const blockedDropToastRef = useRef(null);
  const toastSpeechVoicesRef = useRef([]);
  const toastSpeechLastRef = useRef({ key: "", at: 0 });
  const toastAudioRef = useRef(null);
  const toastAudioByKeyRef = useRef({});
  /** ใช้ใน during() คำนวณแทรก Section/Split ให้ตรงกับ ghost (y กึ่งกลาง Section) */
  const sectionReorderPointerRef = useRef({ x: 0, y: 0 });
  // การเก็บ Ref ของ Layout
  const contained = useRef([]); // Ref ของ container
  const columned = useRef([]); // Ref ของ column
  const spaned = useRef([]); // Ref ของ span
  const nestedSpaned = useRef([]); // Ref ของ nestedSpan
  const layoutsRef = useRef(layouts);
  layoutsRef.current = layouts;
  const textEditModalRef = useRef(textEditModal);
  textEditModalRef.current = textEditModal;
  /** กัน auto-select ทันทีหลัง drop ปุ่มใน Tab/DataSlider area */
  const suppressNextTabButtonSelectRef = useRef({
    until: 0,
    hostId: "",
    tabId: "",
    elementId: "",
  });

  const openListBoxItemTextEdit = useCallback((listBoxEl, itemIndex, field) => {
    if (builderMode !== "Editor Mode") return;
    if (!listBoxEl || listBoxEl.type !== "lstb") return;
    const merged = mergeListBoxElement(listBoxEl);
    const idx = Number(itemIndex);
    const len = merged.listBoxItems?.length ?? 0;
    const safeIdx = Number.isFinite(idx) && idx >= 0 && idx < len ? idx : 0;
    const it = merged.listBoxItems?.[safeIdx] || {};
    const f = field === "body" ? "body" : "title";
    const labelStr =
      f === "title"
        ? typeof it.title === "string"
          ? it.title
          : ""
        : typeof it.body === "string"
          ? it.body
          : "";
    const textParagraph = f === "title" ? it.titleParagraph : it.bodyParagraph;
    setSelectID({ ids: {}, status: "" });
    setPositionElementSetting({ x: null, y: null });
    setTextEditModal({
      mode: "list-box-item-text",
      elementData: {
        id: `${listBoxEl.id}__lb${safeIdx}__${f}`,
        label: labelStr,
        textParagraph,
        __listBoxItemTextEdit: {
          listBoxElementId: listBoxEl.id,
          itemIndex: safeIdx,
          field: f,
        },
      },
    });
  }, [builderMode]);

  useEffect(() => {
    if (!openListBoxTextEditRef) return;
    openListBoxTextEditRef.current = openListBoxItemTextEdit;
    return () => {
      openListBoxTextEditRef.current = null;
    };
  }, [openListBoxTextEditRef, openListBoxItemTextEdit]);

  const openListBoxItemIconEdit = useCallback(
    (listBoxEl, itemIndex) => {
      if (builderMode !== "Editor Mode") return;
      if (!listBoxEl || listBoxEl.type !== "lstb") return;
      const merged = mergeListBoxElement(listBoxEl);
      if ((merged.listBoxVariant || "icon_text") !== "icon_text") return;
      const idx = Number(itemIndex);
      const len = merged.listBoxItems?.length ?? 0;
      const safeIdx = Number.isFinite(idx) && idx >= 0 && idx < len ? idx : 0;
      const item = merged.listBoxItems?.[safeIdx] || {};
      setSelectID({ ids: {}, status: "" });
      setPositionElementSetting({ x: null, y: null });
      openOffcavanas(
        "Icon",
        sliceListBoxItemIconForPanel(item, merged, safeIdx),
        null
      );
    },
    [builderMode, openOffcavanas]
  );

  const openListBoxItemImageEdit = useCallback(
    (listBoxEl, itemIndex) => {
      if (builderMode !== "Editor Mode") return;
      if (!listBoxEl || listBoxEl.type !== "lstb") return;
      const merged = mergeListBoxElement(listBoxEl);
      const v = merged.listBoxVariant || "icon_text";
      if (v !== "image" && v !== "image_text") return;
      const idx = Number(itemIndex);
      const len = merged.listBoxItems?.length ?? 0;
      const safeIdx = Number.isFinite(idx) && idx >= 0 && idx < len ? idx : 0;
      const item = merged.listBoxItems?.[safeIdx] || {};
      setSelectID({ ids: {}, status: "" });
      setPositionElementSetting({ x: null, y: null });
      openOffcavanas(
        "Image",
        sliceListBoxItemImageForPanel(item, merged, safeIdx),
        null
      );
    },
    [builderMode, openOffcavanas]
  );

  const patchLayoutElement = useCallback(
    (data, ids) => {
      const eleID = ids?.eleID ?? ids?.id;
      if (eleID == null || eleID === "") return;

      const patchList = (list) => {
        if (!Array.isArray(list)) return false;
        const idStr = String(eleID);
        const i = list.findIndex(
          (e) => String(e.id) === idStr || String(e._id ?? "") === idStr
        );
        if (i === -1) return false;
        /* ไม่ให้คีย์ undefined ทับ + deep merge กับ element เดิม กันข้อมูล canvas หาย */
        const cleaned = lodash.pickBy(data, (v) => v !== undefined);
        if (cleaned.badge && typeof cleaned.badge === "object") {
          cleaned.badge = lodash.pickBy(cleaned.badge, (v) => v !== undefined);
        }
        const prevBtnAlign = list[i]?.buttonLayoutAlign;
        const prevIconAlign = list[i]?.iconLayoutAlign;
        const prevCounterAlign = list[i]?.counterAlign;
        list[i] = lodash.merge({}, list[i], cleaned);
        /* merge ทำกับ array แบบ index — paragraph.segments ต้องแทนที่ทั้งก้อน */
        if (cleaned.textParagraph && typeof cleaned.textParagraph === "object") {
          list[i].textParagraph = lodash.cloneDeep(cleaned.textParagraph);
        }
        if (cleaned.betweenLeftTextParagraph && typeof cleaned.betweenLeftTextParagraph === "object") {
          list[i].betweenLeftTextParagraph = lodash.cloneDeep(cleaned.betweenLeftTextParagraph);
        }
        if (cleaned.betweenRightTextParagraph && typeof cleaned.betweenRightTextParagraph === "object") {
          list[i].betweenRightTextParagraph = lodash.cloneDeep(cleaned.betweenRightTextParagraph);
        }
        if (cleaned.carouselSlides && Array.isArray(cleaned.carouselSlides)) {
          list[i].carouselSlides = lodash.cloneDeep(cleaned.carouselSlides);
        }
        if (cleaned.listItems && Array.isArray(cleaned.listItems)) {
          list[i].listItems = lodash.cloneDeep(cleaned.listItems);
        }
        if (cleaned.tabsItems && Array.isArray(cleaned.tabsItems)) {
          list[i].tabsItems = lodash.cloneDeep(cleaned.tabsItems);
        }
        if (cleaned.dataSliderItems && Array.isArray(cleaned.dataSliderItems)) {
          list[i].dataSliderItems = lodash.cloneDeep(cleaned.dataSliderItems);
        }
        if (cleaned.catagoriesItems && Array.isArray(cleaned.catagoriesItems)) {
          list[i].catagoriesItems = lodash.cloneDeep(cleaned.catagoriesItems);
          if (Array.isArray(list[i]?.catagoriesTabs)) {
            const mergedHost = mergeCatagoriesElement({
              ...list[i],
              catagoriesItems: cleaned.catagoriesItems,
            });
            list[i].catagoriesTabs = lodash.cloneDeep(mergedHost.catagoriesTabs);
            list[i].catagoriesActiveCategoryId = mergedHost.catagoriesActiveCategoryId;
          }
        }
        if (cleaned.accordionItems && Array.isArray(cleaned.accordionItems)) {
          list[i].accordionItems = lodash.cloneDeep(cleaned.accordionItems);
        }
        // Hard replace this array; merge-by-index keeps stale checkbox values.
        if (Array.isArray(cleaned.imageHoverExtras)) {
          list[i].imageHoverExtras = lodash.cloneDeep(cleaned.imageHoverExtras);
        }
        if (cleaned.tableRows && Array.isArray(cleaned.tableRows)) {
          list[i].tableRows = lodash.cloneDeep(cleaned.tableRows);
        }
        if (cleaned.tableColumns && Array.isArray(cleaned.tableColumns)) {
          list[i].tableColumns = lodash.cloneDeep(cleaned.tableColumns);
        }
        if (
          list[i].type === "img" ||
          list[i].type === "imgh" ||
          list[i].type === "imgo" ||
          list[i].type === "bnr" ||
          list[i].type === "lbx" ||
          list[i].type === "vid"
        ) {
          list[i].badge = mergeImageBadge(list[i].badge || {}, {
            elementType:
              list[i].type === "lbx"
                ? "lbx"
                : list[i].type === "vid"
                ? "vid"
                : "img",
          });
        }
        /* แถวปุ่ม/ไอคอน: จัดซ้าย–กลาง–ขวาใช้ค่าเดียวกันทั้งแถว + โหมดออกแบบอ่านจาก items[0] */
        if (
          cleaned.buttonLayoutAlign !== undefined &&
          cleaned.buttonLayoutAlign !== prevBtnAlign &&
          (list[i].type === "btn" || list[i].type === "btnG")
        ) {
          const g = String(list[i].buttonRowGroupId || "").trim();
          if (g) {
            const v = cleaned.buttonLayoutAlign;
            for (let k = 0; k < list.length; k++) {
              const o = list[k];
              if (
                !o ||
                (o.type !== "btn" && o.type !== "btnG") ||
                String(o.buttonRowGroupId || "").trim() !== g
              ) {
                continue;
              }
              list[k] = lodash.merge({}, o, { buttonLayoutAlign: v });
            }
          }
        }
        if (
          cleaned.iconLayoutAlign !== undefined &&
          cleaned.iconLayoutAlign !== prevIconAlign &&
          list[i].type === "icon"
        ) {
          const g = String(list[i].iconRowGroupId || "").trim();
          if (g) {
            const v = cleaned.iconLayoutAlign;
            for (let k = 0; k < list.length; k++) {
              const o = list[k];
              if (
                !o ||
                o.type !== "icon" ||
                String(o.iconRowGroupId || "").trim() !== g
              ) {
                continue;
              }
              list[k] = lodash.merge({}, o, { iconLayoutAlign: v });
            }
          }
        }
        if (
          cleaned.iconRowGap !== undefined &&
          list[i].type === "icon"
        ) {
          const g = String(list[i].iconRowGroupId || "").trim();
          if (g) {
            const vRaw = Number(cleaned.iconRowGap);
            const v = Number.isFinite(vRaw) ? Math.max(0, Math.min(80, vRaw)) : 8;
            for (let k = 0; k < list.length; k++) {
              const o = list[k];
              if (
                !o ||
                o.type !== "icon" ||
                String(o.iconRowGroupId || "").trim() !== g
              ) {
                continue;
              }
              list[k] = lodash.merge({}, o, { iconRowGap: v });
            }
          }
        }
        if (
          cleaned.iconRowDividerEnabled !== undefined &&
          list[i].type === "icon"
        ) {
          const g = String(list[i].iconRowGroupId || "").trim();
          if (g) {
            const v = cleaned.iconRowDividerEnabled === true;
            for (let k = 0; k < list.length; k++) {
              const o = list[k];
              if (
                !o ||
                o.type !== "icon" ||
                String(o.iconRowGroupId || "").trim() !== g
              ) {
                continue;
              }
              list[k] = lodash.merge({}, o, { iconRowDividerEnabled: v });
            }
          }
        }
        if (
          cleaned.iconRowDividerStyle !== undefined &&
          list[i].type === "icon"
        ) {
          const g = String(list[i].iconRowGroupId || "").trim();
          if (g) {
            const raw = String(cleaned.iconRowDividerStyle || "").trim().toLowerCase();
            const v =
              raw === "dashed" || raw === "dotted"
                ? raw
                : "solid";
            for (let k = 0; k < list.length; k++) {
              const o = list[k];
              if (
                !o ||
                o.type !== "icon" ||
                String(o.iconRowGroupId || "").trim() !== g
              ) {
                continue;
              }
              list[k] = lodash.merge({}, o, { iconRowDividerStyle: v });
            }
          }
        }
        if (
          (cleaned.iconRowDividerColor !== undefined ||
            cleaned.iconRowDividerOpacity !== undefined) &&
          list[i].type === "icon"
        ) {
          const g = String(list[i].iconRowGroupId || "").trim();
          if (g) {
            const patchData = {};
            if (cleaned.iconRowDividerColor !== undefined) {
              patchData.iconRowDividerColor = cleaned.iconRowDividerColor;
            }
            if (cleaned.iconRowDividerOpacity !== undefined) {
              const raw = Number(cleaned.iconRowDividerOpacity);
              patchData.iconRowDividerOpacity = Number.isFinite(raw)
                ? Math.max(0, Math.min(255, raw))
                : 255;
            }
            for (let k = 0; k < list.length; k++) {
              const o = list[k];
              if (
                !o ||
                o.type !== "icon" ||
                String(o.iconRowGroupId || "").trim() !== g
              ) {
                continue;
              }
              list[k] = lodash.merge({}, o, patchData);
            }
          }
        }
        if (
          cleaned.iconLayoutAlign !== undefined &&
          cleaned.iconLayoutAlign !== prevIconAlign &&
          list[i].type === "list"
        ) {
          const g = String(list[i].listRowGroupId || "").trim();
          if (g) {
            const v = cleaned.iconLayoutAlign;
            for (let k = 0; k < list.length; k++) {
              const o = list[k];
              if (
                !o ||
                o.type !== "list" ||
                String(o.listRowGroupId || "").trim() !== g
              ) {
                continue;
              }
              list[k] = lodash.merge({}, o, { iconLayoutAlign: v });
            }
          }
        }
        if (
          cleaned.counterAlign !== undefined &&
          cleaned.counterAlign !== prevCounterAlign &&
          list[i].type === "ctn"
        ) {
          const g = String(list[i].counterRowGroupId || "").trim();
          if (g) {
            const v = cleaned.counterAlign;
            for (let k = 0; k < list.length; k++) {
              const o = list[k];
              if (
                !o ||
                o.type !== "ctn" ||
                String(o.counterRowGroupId || "").trim() !== g
              ) {
                continue;
              }
              list[k] = lodash.merge({}, o, {
                counterAlign: v,
                counterRowAlign: v,
              });
            }
          }
        }
        if (
          cleaned.counterRowGap !== undefined &&
          list[i].type === "ctn"
        ) {
          const g = String(list[i].counterRowGroupId || "").trim();
          if (g) {
            const vRaw = Number(cleaned.counterRowGap);
            const v = Number.isFinite(vRaw) ? Math.max(0, Math.min(80, vRaw)) : 8;
            for (let k = 0; k < list.length; k++) {
              const o = list[k];
              if (
                !o ||
                o.type !== "ctn" ||
                String(o.counterRowGroupId || "").trim() !== g
              ) {
                continue;
              }
              list[k] = lodash.merge({}, o, { counterRowGap: v });
            }
          }
        }
        if (
          cleaned.counterRowDividerEnabled !== undefined &&
          list[i].type === "ctn"
        ) {
          const g = String(list[i].counterRowGroupId || "").trim();
          if (g) {
            const v = cleaned.counterRowDividerEnabled === true;
            for (let k = 0; k < list.length; k++) {
              const o = list[k];
              if (
                !o ||
                o.type !== "ctn" ||
                String(o.counterRowGroupId || "").trim() !== g
              ) {
                continue;
              }
              list[k] = lodash.merge({}, o, { counterRowDividerEnabled: v });
            }
          }
        }
        if (
          cleaned.counterRowDividerStyle !== undefined &&
          list[i].type === "ctn"
        ) {
          const g = String(list[i].counterRowGroupId || "").trim();
          if (g) {
            const raw = String(cleaned.counterRowDividerStyle || "").trim().toLowerCase();
            const v = raw === "dashed" || raw === "dotted" ? raw : "solid";
            for (let k = 0; k < list.length; k++) {
              const o = list[k];
              if (
                !o ||
                o.type !== "ctn" ||
                String(o.counterRowGroupId || "").trim() !== g
              ) {
                continue;
              }
              list[k] = lodash.merge({}, o, { counterRowDividerStyle: v });
            }
          }
        }
        if (
          (cleaned.counterRowDividerColor !== undefined ||
            cleaned.counterRowDividerOpacity !== undefined) &&
          list[i].type === "ctn"
        ) {
          const g = String(list[i].counterRowGroupId || "").trim();
          if (g) {
            const patchData = {};
            if (cleaned.counterRowDividerColor !== undefined) {
              patchData.counterRowDividerColor = cleaned.counterRowDividerColor;
            }
            if (cleaned.counterRowDividerOpacity !== undefined) {
              const raw = Number(cleaned.counterRowDividerOpacity);
              patchData.counterRowDividerOpacity = Number.isFinite(raw)
                ? Math.max(0, Math.min(255, raw))
                : 255;
            }
            for (let k = 0; k < list.length; k++) {
              const o = list[k];
              if (
                !o ||
                o.type !== "ctn" ||
                String(o.counterRowGroupId || "").trim() !== g
              ) {
                continue;
              }
              list[k] = lodash.merge({}, o, patchData);
            }
          }
        }
        return true;
      };
      const patchTabsNestedList = (list) => {
        if (!Array.isArray(list)) return false;
        for (const host of list) {
          if (host?.type === "ctg") {
            const mergedHost = mergeCatagoriesElement(host);
            const tabs = Array.isArray(mergedHost?.catagoriesTabs)
              ? mergedHost.catagoriesTabs
              : [];
            let didPatch = false;
            const nextTabs = tabs.map((tab) => {
              const nextTab = { ...tab };
              const nextElements = Array.isArray(nextTab?.items)
                ? nextTab.items.map((item) => ({ ...item }))
                : [];
              for (const item of nextElements) {
                if (patchList(item?.elements)) {
                  didPatch = true;
                  break;
                }
              }
              nextTab.items = nextElements;
              nextTab.itemCount = nextElements.length;
              return nextTab;
            });
            if (didPatch) {
              const nextMerged = mergeCatagoriesElement({
                ...mergedHost,
                catagoriesTabs: nextTabs,
              });
              host.catagoriesTabs = lodash.cloneDeep(nextMerged.catagoriesTabs);
              host.catagoriesActiveCategoryId = nextMerged.catagoriesActiveCategoryId;
              host.catagoriesItems = lodash.cloneDeep(nextMerged.catagoriesItems);
              host.catagoriesItemCount = nextMerged.catagoriesItemCount;
              host.catagoriesActiveId = nextMerged.catagoriesActiveId;
              return true;
            }
            continue;
          }
          const hostItems =
            host?.type === "tabs"
              ? host?.tabsItems
              : host?.type === "acc"
                ? host?.accordionItems
                : host?.type === "post"
                  ? [{ id: "post-main", elements: host?.postElements }]
                  : host?.type === "dts"
                    ? host?.dataSliderItems
                    : host?.type === "ctg"
                      ? mergeCatagoriesElement(host)?.catagoriesItems
                : null;
          if (!Array.isArray(hostItems)) continue;
          for (const tab of hostItems) {
            if (patchList(tab?.elements)) return true;
          }
        }
        return false;
      };

      setLayout((prev) => {
        if (!Array.isArray(prev)) return prev;
        const newLayouts = lodash.cloneDeep(prev);
        for (const layout of newLayouts) {
          const cols = layout?.columns;
          if (!cols?.length) continue;
          for (const col of cols) {
            if (patchList(col.elements)) return newLayouts;
            if (patchTabsNestedList(col.elements)) return newLayouts;
            if (!col.spans?.length) continue;
            for (const sp of col.spans) {
              if (patchList(sp.elements)) return newLayouts;
              if (patchTabsNestedList(sp.elements)) return newLayouts;
              if (!sp.nestedSpans?.length) continue;
              for (const ms of sp.nestedSpans) {
                if (patchList(ms.elements)) return newLayouts;
                if (patchTabsNestedList(ms.elements)) return newLayouts;
              }
            }
          }
        }
        return prev;
      });
    },
    [setLayout]
  );

  useLayoutEffect(() => {
    if (!patchElementRef) return;
    patchElementRef.current = patchLayoutElement;
    return () => {
      patchElementRef.current = null;
    };
  }, [patchElementRef, patchLayoutElement]);

  const patchTabsNestedElementById = useCallback(
    (tabsHostId, tabId, payload) => {
      if (!tabsHostId || !tabId || !payload?.id) return;
      const targetId = String(payload.id);
      const hostId = String(tabsHostId);
      const tabKey = String(tabId);
      setLayout((prev) => {
        if (!Array.isArray(prev)) return prev;
        const nextLayouts = lodash.cloneDeep(prev);
        let updated = false;
        const patchBucket = (bucket) => {
          if (!bucket || !Array.isArray(bucket.elements)) return;
          const host = bucket.elements.find((e) => String(e?.id || "") === hostId);
          const hostItems =
            host?.type === "tabs"
              ? host?.tabsItems
              : host?.type === "acc"
                ? host?.accordionItems
                : host?.type === "post"
                  ? [{ id: "post-main", elements: host?.postElements }]
                  : host?.type === "dts"
                    ? host?.dataSliderItems
                    : host?.type === "ctg"
                      ? mergeCatagoriesElement(host)?.catagoriesItems
                : null;
          if (host?.type === "ctg") {
            const mergedHost = mergeCatagoriesElement(host);
            const activeCategoryId = mergedHost.catagoriesTabs?.some(
              (tab) =>
                String(tab?.id || "") ===
                String(mergedHost?.catagoriesActiveCategoryId || "")
            )
              ? String(mergedHost?.catagoriesActiveCategoryId || "")
              : String(mergedHost?.catagoriesTabs?.[0]?.id || "");
            const catTabIdx = (mergedHost?.catagoriesTabs || []).findIndex(
              (tab) => String(tab?.id || "") === activeCategoryId
            );
            if (catTabIdx === -1) return;
            const catItems = Array.isArray(mergedHost?.catagoriesTabs?.[catTabIdx]?.items)
              ? mergedHost.catagoriesTabs[catTabIdx].items
              : [];
            const itemIdx = catItems.findIndex(
              (item) => String(item?.id || "") === tabKey
            );
            if (itemIdx === -1) return;
            const list = Array.isArray(catItems[itemIdx]?.elements)
              ? catItems[itemIdx].elements
              : [];
            const i = list.findIndex((el) => String(el?.id || "") === targetId);
            if (i === -1) return;
            const cleaned = lodash.pickBy(payload, (v) => v !== undefined);
            const prevBtnAlign = list[i]?.buttonLayoutAlign;
            const prevIconAlign = list[i]?.iconLayoutAlign;
            const prevCounterAlign = list[i]?.counterAlign;
            list[i] = lodash.merge({}, list[i], cleaned);
            if (cleaned.textParagraph && typeof cleaned.textParagraph === "object") {
              list[i].textParagraph = lodash.cloneDeep(cleaned.textParagraph);
            }
            if (cleaned.carouselSlides && Array.isArray(cleaned.carouselSlides)) {
              list[i].carouselSlides = lodash.cloneDeep(cleaned.carouselSlides);
            }
            if (cleaned.listItems && Array.isArray(cleaned.listItems)) {
              list[i].listItems = lodash.cloneDeep(cleaned.listItems);
            }
            if (cleaned.tabsItems && Array.isArray(cleaned.tabsItems)) {
              list[i].tabsItems = lodash.cloneDeep(cleaned.tabsItems);
            }
            if (cleaned.dataSliderItems && Array.isArray(cleaned.dataSliderItems)) {
              list[i].dataSliderItems = lodash.cloneDeep(cleaned.dataSliderItems);
            }
            if (cleaned.catagoriesItems && Array.isArray(cleaned.catagoriesItems)) {
              list[i].catagoriesItems = lodash.cloneDeep(cleaned.catagoriesItems);
              if (Array.isArray(list[i]?.catagoriesTabs)) {
                const mergedChild = mergeCatagoriesElement({
                  ...list[i],
                  catagoriesItems: cleaned.catagoriesItems,
                });
                list[i].catagoriesTabs = lodash.cloneDeep(mergedChild.catagoriesTabs);
                list[i].catagoriesActiveCategoryId = mergedChild.catagoriesActiveCategoryId;
              }
            }
            if (cleaned.accordionItems && Array.isArray(cleaned.accordionItems)) {
              list[i].accordionItems = lodash.cloneDeep(cleaned.accordionItems);
            }
            if (Array.isArray(cleaned.imageHoverExtras)) {
              list[i].imageHoverExtras = lodash.cloneDeep(cleaned.imageHoverExtras);
            }
            if (cleaned.postElements && Array.isArray(cleaned.postElements)) {
              list[i].postElements = lodash.cloneDeep(cleaned.postElements);
            }
            if (
              cleaned.buttonLayoutAlign !== undefined &&
              cleaned.buttonLayoutAlign !== prevBtnAlign &&
              (list[i].type === "btn" || list[i].type === "btnG")
            ) {
              const g = String(list[i].buttonRowGroupId || "").trim();
              if (g) {
                const v = cleaned.buttonLayoutAlign;
                for (let k = 0; k < list.length; k++) {
                  const o = list[k];
                  if (
                    !o ||
                    (o.type !== "btn" && o.type !== "btnG") ||
                    String(o.buttonRowGroupId || "").trim() !== g
                  ) {
                    continue;
                  }
                  list[k] = lodash.merge({}, o, { buttonLayoutAlign: v });
                }
              }
            }
            if (
              cleaned.iconLayoutAlign !== undefined &&
              cleaned.iconLayoutAlign !== prevIconAlign &&
              list[i].type === "icon"
            ) {
              const g = String(list[i].iconRowGroupId || "").trim();
              if (g) {
                const v = cleaned.iconLayoutAlign;
                for (let k = 0; k < list.length; k++) {
                  const o = list[k];
                  if (
                    !o ||
                    o.type !== "icon" ||
                    String(o.iconRowGroupId || "").trim() !== g
                  ) {
                    continue;
                  }
                  list[k] = lodash.merge({}, o, { iconLayoutAlign: v });
                }
              }
            }
            if (
              cleaned.iconRowGap !== undefined &&
              list[i].type === "icon"
            ) {
              const g = String(list[i].iconRowGroupId || "").trim();
              if (g) {
                const vRaw = Number(cleaned.iconRowGap);
                const v = Number.isFinite(vRaw) ? Math.max(0, Math.min(80, vRaw)) : 8;
                for (let k = 0; k < list.length; k++) {
                  const o = list[k];
                  if (
                    !o ||
                    o.type !== "icon" ||
                    String(o.iconRowGroupId || "").trim() !== g
                  ) {
                    continue;
                  }
                  list[k] = lodash.merge({}, o, { iconRowGap: v });
                }
              }
            }
            if (
              cleaned.iconRowDividerEnabled !== undefined &&
              list[i].type === "icon"
            ) {
              const g = String(list[i].iconRowGroupId || "").trim();
              if (g) {
                const v = cleaned.iconRowDividerEnabled === true;
                for (let k = 0; k < list.length; k++) {
                  const o = list[k];
                  if (
                    !o ||
                    o.type !== "icon" ||
                    String(o.iconRowGroupId || "").trim() !== g
                  ) {
                    continue;
                  }
                  list[k] = lodash.merge({}, o, { iconRowDividerEnabled: v });
                }
              }
            }
            if (
              cleaned.iconRowDividerStyle !== undefined &&
              list[i].type === "icon"
            ) {
              const g = String(list[i].iconRowGroupId || "").trim();
              if (g) {
                const raw = String(cleaned.iconRowDividerStyle || "").trim().toLowerCase();
                const v =
                  raw === "dashed" || raw === "dotted"
                    ? raw
                    : "solid";
                for (let k = 0; k < list.length; k++) {
                  const o = list[k];
                  if (
                    !o ||
                    o.type !== "icon" ||
                    String(o.iconRowGroupId || "").trim() !== g
                  ) {
                    continue;
                  }
                  list[k] = lodash.merge({}, o, { iconRowDividerStyle: v });
                }
              }
            }
            if (
              (cleaned.iconRowDividerColor !== undefined ||
                cleaned.iconRowDividerOpacity !== undefined) &&
              list[i].type === "icon"
            ) {
              const g = String(list[i].iconRowGroupId || "").trim();
              if (g) {
                const patchData = {};
                if (cleaned.iconRowDividerColor !== undefined) {
                  patchData.iconRowDividerColor = cleaned.iconRowDividerColor;
                }
                if (cleaned.iconRowDividerOpacity !== undefined) {
                  const raw = Number(cleaned.iconRowDividerOpacity);
                  patchData.iconRowDividerOpacity = Number.isFinite(raw)
                    ? Math.max(0, Math.min(255, raw))
                    : 255;
                }
                for (let k = 0; k < list.length; k++) {
                  const o = list[k];
                  if (
                    !o ||
                    o.type !== "icon" ||
                    String(o.iconRowGroupId || "").trim() !== g
                  ) {
                    continue;
                  }
                  list[k] = lodash.merge({}, o, patchData);
                }
              }
            }
            if (
              cleaned.counterAlign !== undefined &&
              cleaned.counterAlign !== prevCounterAlign &&
              list[i].type === "ctn"
            ) {
              const g = String(list[i].counterRowGroupId || "").trim();
              if (g) {
                const v = cleaned.counterAlign;
                for (let k = 0; k < list.length; k++) {
                  const o = list[k];
                  if (
                    !o ||
                    o.type !== "ctn" ||
                    String(o.counterRowGroupId || "").trim() !== g
                  ) {
                    continue;
                  }
                  list[k] = lodash.merge({}, o, {
                    counterAlign: v,
                    counterRowAlign: v,
                  });
                }
              }
            }
            if (
              cleaned.counterRowGap !== undefined &&
              list[i].type === "ctn"
            ) {
              const g = String(list[i].counterRowGroupId || "").trim();
              if (g) {
                const vRaw = Number(cleaned.counterRowGap);
                const v = Number.isFinite(vRaw) ? Math.max(0, Math.min(80, vRaw)) : 8;
                for (let k = 0; k < list.length; k++) {
                  const o = list[k];
                  if (
                    !o ||
                    o.type !== "ctn" ||
                    String(o.counterRowGroupId || "").trim() !== g
                  ) {
                    continue;
                  }
                  list[k] = lodash.merge({}, o, { counterRowGap: v });
                }
              }
            }
            if (
              cleaned.counterRowDividerEnabled !== undefined &&
              list[i].type === "ctn"
            ) {
              const g = String(list[i].counterRowGroupId || "").trim();
              if (g) {
                const v = cleaned.counterRowDividerEnabled === true;
                for (let k = 0; k < list.length; k++) {
                  const o = list[k];
                  if (
                    !o ||
                    o.type !== "ctn" ||
                    String(o.counterRowGroupId || "").trim() !== g
                  ) {
                    continue;
                  }
                  list[k] = lodash.merge({}, o, { counterRowDividerEnabled: v });
                }
              }
            }
            if (
              cleaned.counterRowDividerStyle !== undefined &&
              list[i].type === "ctn"
            ) {
              const g = String(list[i].counterRowGroupId || "").trim();
              if (g) {
                const raw = String(cleaned.counterRowDividerStyle || "").trim().toLowerCase();
                const v = raw === "dashed" || raw === "dotted" ? raw : "solid";
                for (let k = 0; k < list.length; k++) {
                  const o = list[k];
                  if (
                    !o ||
                    o.type !== "ctn" ||
                    String(o.counterRowGroupId || "").trim() !== g
                  ) {
                    continue;
                  }
                  list[k] = lodash.merge({}, o, { counterRowDividerStyle: v });
                }
              }
            }
            if (
              (cleaned.counterRowDividerColor !== undefined ||
                cleaned.counterRowDividerOpacity !== undefined) &&
              list[i].type === "ctn"
            ) {
              const g = String(list[i].counterRowGroupId || "").trim();
              if (g) {
                const patchData = {};
                if (cleaned.counterRowDividerColor !== undefined) {
                  patchData.counterRowDividerColor = cleaned.counterRowDividerColor;
                }
                if (cleaned.counterRowDividerOpacity !== undefined) {
                  const raw = Number(cleaned.counterRowDividerOpacity);
                  patchData.counterRowDividerOpacity = Number.isFinite(raw)
                    ? Math.max(0, Math.min(255, raw))
                    : 255;
                }
                for (let k = 0; k < list.length; k++) {
                  const o = list[k];
                  if (
                    !o ||
                    o.type !== "ctn" ||
                    String(o.counterRowGroupId || "").trim() !== g
                  ) {
                    continue;
                  }
                  list[k] = lodash.merge({}, o, patchData);
                }
              }
            }
            catItems[itemIdx].elements = list;
            mergedHost.catagoriesTabs[catTabIdx].items = catItems;
            mergedHost.catagoriesTabs[catTabIdx].itemCount = catItems.length;
            mergedHost.catagoriesItems = catItems;
            mergedHost.catagoriesItemCount = catItems.length;
            mergedHost.catagoriesActiveId = catItems.some(
              (item) =>
                String(item?.id || "") ===
                String(mergedHost?.catagoriesActiveId || "")
            )
              ? mergedHost.catagoriesActiveId
              : catItems[0]?.id;
            host.catagoriesTabs = lodash.cloneDeep(mergedHost.catagoriesTabs);
            host.catagoriesActiveCategoryId = mergedHost.catagoriesActiveCategoryId;
            host.catagoriesItems = lodash.cloneDeep(mergedHost.catagoriesItems);
            host.catagoriesItemCount = mergedHost.catagoriesItemCount;
            host.catagoriesActiveId = mergedHost.catagoriesActiveId;
            updated = true;
            return;
          }
          if (!Array.isArray(hostItems)) return;
          const tabIdx = hostItems.findIndex((t) => String(t?.id || "") === tabKey);
          if (tabIdx === -1) return;
          const list = hostItems[tabIdx].elements;
          if (!Array.isArray(list)) return;
          const i = list.findIndex((el) => String(el?.id || "") === targetId);
          if (i === -1) return;
          const cleaned = lodash.pickBy(payload, (v) => v !== undefined);
          const prevBtnAlign = list[i]?.buttonLayoutAlign;
          const prevIconAlign = list[i]?.iconLayoutAlign;
          const prevCounterAlign = list[i]?.counterAlign;
          list[i] = lodash.merge({}, list[i], cleaned);
          if (cleaned.textParagraph && typeof cleaned.textParagraph === "object") {
            list[i].textParagraph = lodash.cloneDeep(cleaned.textParagraph);
          }
          if (cleaned.carouselSlides && Array.isArray(cleaned.carouselSlides)) {
            list[i].carouselSlides = lodash.cloneDeep(cleaned.carouselSlides);
          }
          if (cleaned.listItems && Array.isArray(cleaned.listItems)) {
            list[i].listItems = lodash.cloneDeep(cleaned.listItems);
          }
          if (cleaned.tabsItems && Array.isArray(cleaned.tabsItems)) {
            list[i].tabsItems = lodash.cloneDeep(cleaned.tabsItems);
          }
          if (cleaned.dataSliderItems && Array.isArray(cleaned.dataSliderItems)) {
            list[i].dataSliderItems = lodash.cloneDeep(cleaned.dataSliderItems);
          }
          if (cleaned.catagoriesItems && Array.isArray(cleaned.catagoriesItems)) {
            list[i].catagoriesItems = lodash.cloneDeep(cleaned.catagoriesItems);
            if (Array.isArray(list[i]?.catagoriesTabs)) {
              const mergedHost = mergeCatagoriesElement({
                ...list[i],
                catagoriesItems: cleaned.catagoriesItems,
              });
              list[i].catagoriesTabs = lodash.cloneDeep(mergedHost.catagoriesTabs);
              list[i].catagoriesActiveCategoryId = mergedHost.catagoriesActiveCategoryId;
            }
          }
          if (cleaned.accordionItems && Array.isArray(cleaned.accordionItems)) {
            list[i].accordionItems = lodash.cloneDeep(cleaned.accordionItems);
          }
          if (Array.isArray(cleaned.imageHoverExtras)) {
            list[i].imageHoverExtras = lodash.cloneDeep(cleaned.imageHoverExtras);
          }
          if (cleaned.postElements && Array.isArray(cleaned.postElements)) {
            list[i].postElements = lodash.cloneDeep(cleaned.postElements);
          }
          if (
            cleaned.buttonLayoutAlign !== undefined &&
            cleaned.buttonLayoutAlign !== prevBtnAlign &&
            (list[i].type === "btn" || list[i].type === "btnG")
          ) {
            const g = String(list[i].buttonRowGroupId || "").trim();
            if (g) {
              const v = cleaned.buttonLayoutAlign;
              for (let k = 0; k < list.length; k++) {
                const o = list[k];
                if (
                  !o ||
                  (o.type !== "btn" && o.type !== "btnG") ||
                  String(o.buttonRowGroupId || "").trim() !== g
                ) {
                  continue;
                }
                list[k] = lodash.merge({}, o, { buttonLayoutAlign: v });
              }
            }
          }
          if (
            cleaned.iconLayoutAlign !== undefined &&
            cleaned.iconLayoutAlign !== prevIconAlign &&
            list[i].type === "icon"
          ) {
            const g = String(list[i].iconRowGroupId || "").trim();
            if (g) {
              const v = cleaned.iconLayoutAlign;
              for (let k = 0; k < list.length; k++) {
                const o = list[k];
                if (
                  !o ||
                  o.type !== "icon" ||
                  String(o.iconRowGroupId || "").trim() !== g
                ) {
                  continue;
                }
                list[k] = lodash.merge({}, o, { iconLayoutAlign: v });
              }
            }
          }
          if (
            cleaned.iconRowGap !== undefined &&
            list[i].type === "icon"
          ) {
            const g = String(list[i].iconRowGroupId || "").trim();
            if (g) {
              const vRaw = Number(cleaned.iconRowGap);
              const v = Number.isFinite(vRaw) ? Math.max(0, Math.min(80, vRaw)) : 8;
              for (let k = 0; k < list.length; k++) {
                const o = list[k];
                if (
                  !o ||
                  o.type !== "icon" ||
                  String(o.iconRowGroupId || "").trim() !== g
                ) {
                  continue;
                }
                list[k] = lodash.merge({}, o, { iconRowGap: v });
              }
            }
          }
          if (
            cleaned.iconRowDividerEnabled !== undefined &&
            list[i].type === "icon"
          ) {
            const g = String(list[i].iconRowGroupId || "").trim();
            if (g) {
              const v = cleaned.iconRowDividerEnabled === true;
              for (let k = 0; k < list.length; k++) {
                const o = list[k];
                if (
                  !o ||
                  o.type !== "icon" ||
                  String(o.iconRowGroupId || "").trim() !== g
                ) {
                  continue;
                }
                list[k] = lodash.merge({}, o, { iconRowDividerEnabled: v });
              }
            }
          }
          if (
            cleaned.iconRowDividerStyle !== undefined &&
            list[i].type === "icon"
          ) {
            const g = String(list[i].iconRowGroupId || "").trim();
            if (g) {
              const raw = String(cleaned.iconRowDividerStyle || "").trim().toLowerCase();
              const v =
                raw === "dashed" || raw === "dotted"
                  ? raw
                  : "solid";
              for (let k = 0; k < list.length; k++) {
                const o = list[k];
                if (
                  !o ||
                  o.type !== "icon" ||
                  String(o.iconRowGroupId || "").trim() !== g
                ) {
                  continue;
                }
                list[k] = lodash.merge({}, o, { iconRowDividerStyle: v });
              }
            }
          }
          if (
            (cleaned.iconRowDividerColor !== undefined ||
              cleaned.iconRowDividerOpacity !== undefined) &&
            list[i].type === "icon"
          ) {
            const g = String(list[i].iconRowGroupId || "").trim();
            if (g) {
              const patchData = {};
              if (cleaned.iconRowDividerColor !== undefined) {
                patchData.iconRowDividerColor = cleaned.iconRowDividerColor;
              }
              if (cleaned.iconRowDividerOpacity !== undefined) {
                const raw = Number(cleaned.iconRowDividerOpacity);
                patchData.iconRowDividerOpacity = Number.isFinite(raw)
                  ? Math.max(0, Math.min(255, raw))
                  : 255;
              }
              for (let k = 0; k < list.length; k++) {
                const o = list[k];
                if (
                  !o ||
                  o.type !== "icon" ||
                  String(o.iconRowGroupId || "").trim() !== g
                ) {
                  continue;
                }
                list[k] = lodash.merge({}, o, patchData);
              }
            }
          }
          if (
            cleaned.counterAlign !== undefined &&
            cleaned.counterAlign !== prevCounterAlign &&
            list[i].type === "ctn"
          ) {
            const g = String(list[i].counterRowGroupId || "").trim();
            if (g) {
              const v = cleaned.counterAlign;
              for (let k = 0; k < list.length; k++) {
                const o = list[k];
                if (
                  !o ||
                  o.type !== "ctn" ||
                  String(o.counterRowGroupId || "").trim() !== g
                ) {
                  continue;
                }
                list[k] = lodash.merge({}, o, {
                  counterAlign: v,
                  counterRowAlign: v,
                });
              }
            }
          }
          if (
            cleaned.counterRowGap !== undefined &&
            list[i].type === "ctn"
          ) {
            const g = String(list[i].counterRowGroupId || "").trim();
            if (g) {
              const vRaw = Number(cleaned.counterRowGap);
              const v = Number.isFinite(vRaw) ? Math.max(0, Math.min(80, vRaw)) : 8;
              for (let k = 0; k < list.length; k++) {
                const o = list[k];
                if (
                  !o ||
                  o.type !== "ctn" ||
                  String(o.counterRowGroupId || "").trim() !== g
                ) {
                  continue;
                }
                list[k] = lodash.merge({}, o, { counterRowGap: v });
              }
            }
          }
          if (
            cleaned.counterRowDividerEnabled !== undefined &&
            list[i].type === "ctn"
          ) {
            const g = String(list[i].counterRowGroupId || "").trim();
            if (g) {
              const v = cleaned.counterRowDividerEnabled === true;
              for (let k = 0; k < list.length; k++) {
                const o = list[k];
                if (
                  !o ||
                  o.type !== "ctn" ||
                  String(o.counterRowGroupId || "").trim() !== g
                ) {
                  continue;
                }
                list[k] = lodash.merge({}, o, { counterRowDividerEnabled: v });
              }
            }
          }
          if (
            cleaned.counterRowDividerStyle !== undefined &&
            list[i].type === "ctn"
          ) {
            const g = String(list[i].counterRowGroupId || "").trim();
            if (g) {
              const raw = String(cleaned.counterRowDividerStyle || "").trim().toLowerCase();
              const v = raw === "dashed" || raw === "dotted" ? raw : "solid";
              for (let k = 0; k < list.length; k++) {
                const o = list[k];
                if (
                  !o ||
                  o.type !== "ctn" ||
                  String(o.counterRowGroupId || "").trim() !== g
                ) {
                  continue;
                }
                list[k] = lodash.merge({}, o, { counterRowDividerStyle: v });
              }
            }
          }
          if (
            (cleaned.counterRowDividerColor !== undefined ||
              cleaned.counterRowDividerOpacity !== undefined) &&
            list[i].type === "ctn"
          ) {
            const g = String(list[i].counterRowGroupId || "").trim();
            if (g) {
              const patchData = {};
              if (cleaned.counterRowDividerColor !== undefined) {
                patchData.counterRowDividerColor = cleaned.counterRowDividerColor;
              }
              if (cleaned.counterRowDividerOpacity !== undefined) {
                const raw = Number(cleaned.counterRowDividerOpacity);
                patchData.counterRowDividerOpacity = Number.isFinite(raw)
                  ? Math.max(0, Math.min(255, raw))
                  : 255;
              }
              for (let k = 0; k < list.length; k++) {
                const o = list[k];
                if (
                  !o ||
                  o.type !== "ctn" ||
                  String(o.counterRowGroupId || "").trim() !== g
                ) {
                  continue;
                }
                list[k] = lodash.merge({}, o, patchData);
              }
            }
          }
          updated = true;
        };
        for (const lay of nextLayouts) {
          for (const col of lay?.columns || []) {
            patchBucket(col);
            for (const sp of col?.spans || []) {
              patchBucket(sp);
              for (const ms of sp?.nestedSpans || []) patchBucket(ms);
            }
          }
        }
        return updated ? nextLayouts : prev;
      });
    },
    [setLayout]
  );

  const openTabsNestedElementEditor = useCallback(
    (tabsHostId, tabId, tabElement) => {
      if (!tabElement?.id) return;
      const rowGroupCount = (() => {
        const rawLayouts = layoutsRef.current;
        const hostLoc = findLayoutElementListIndex(rawLayouts || [], tabsHostId);
        const hostEl = hostLoc?.list?.[hostLoc?.ix];
        if (!hostEl) return 0;
        const hostItems =
          hostEl?.type === "tabs"
            ? hostEl?.tabsItems
            : hostEl?.type === "acc"
              ? hostEl?.accordionItems
              : hostEl?.type === "post"
                ? [{ id: "post-main", elements: hostEl?.postElements }]
                : hostEl?.type === "dts"
                  ? hostEl?.dataSliderItems
                  : hostEl?.type === "ctg"
                    ? mergeCatagoriesElement(hostEl)?.catagoriesItems
                    : null;
        if (!Array.isArray(hostItems)) return 0;
        const tabObj = hostItems.find((it) => String(it?.id || "") === String(tabId || ""));
        const list = Array.isArray(tabObj?.elements) ? tabObj.elements : [];
        const groupId = String(tabElement?.iconRowGroupId || "").trim();
        if (!groupId) return 0;
        let count = 0;
        for (const entry of list) {
          if (
            entry?.type === "icon" &&
            String(entry?.iconRowGroupId || "").trim() === groupId
          ) {
            count += 1;
          }
        }
        return count;
      })();
      const counterRowGroupCount = (() => {
        const rawLayouts = layoutsRef.current;
        const hostLoc = findLayoutElementListIndex(rawLayouts || [], tabsHostId);
        const hostEl = hostLoc?.list?.[hostLoc?.ix];
        if (!hostEl) return 0;
        const hostItems =
          hostEl?.type === "tabs"
            ? hostEl?.tabsItems
            : hostEl?.type === "acc"
              ? hostEl?.accordionItems
              : hostEl?.type === "post"
                ? [{ id: "post-main", elements: hostEl?.postElements }]
                : hostEl?.type === "dts"
                  ? hostEl?.dataSliderItems
                  : hostEl?.type === "ctg"
                    ? mergeCatagoriesElement(hostEl)?.catagoriesItems
                    : null;
        if (!Array.isArray(hostItems)) return 0;
        const tabObj = hostItems.find((it) => String(it?.id || "") === String(tabId || ""));
        const list = Array.isArray(tabObj?.elements) ? tabObj.elements : [];
        const groupId = String(tabElement?.counterRowGroupId || "").trim();
        if (!groupId) return 0;
        let count = 0;
        for (const entry of list) {
          if (
            entry?.type === "ctn" &&
            String(entry?.counterRowGroupId || "").trim() === groupId
          ) {
            count += 1;
          }
        }
        return count;
      })();
      const onUpdateNested = (next) =>
        patchTabsNestedElementById(tabsHostId, tabId, {
          ...next,
          id: next?.id ?? tabElement?.id,
        });
      const type = tabElement.type;
      const tabElementForPanel = {
        ...tabElement,
        __tabsHostType: (() => {
          const hostLoc = findLayoutElementListIndex(layoutsRef.current || [], tabsHostId);
          const hostEl = hostLoc?.list?.[hostLoc?.ix];
          return String(hostEl?.type || "");
        })(),
        __iconRowGroupCount: rowGroupCount,
        __counterRowGroupCount: counterRowGroupCount,
      };

      /* Layout Mode: เฉพาะ types ที่มี panel ใน Layout Mode เท่านั้น
         (Counter เปิด panel ได้เฉพาะ Editor Mode — เหมือน text/heading/img ฯลฯ) */
      if (builderMode === "Layout Mode") {
        if (type === "imgh") return openOffcavanas("Image Hover", tabElementForPanel, onUpdateNested);
        if (type === "imgo") return openOffcavanas("Overlay", tabElementForPanel, onUpdateNested);
        if (type === "list") return openOffcavanas("List", tabElementForPanel, onUpdateNested);
        if (type === "crl") return openOffcavanas("Carousel", tabElementForPanel, onUpdateNested);
        if (type === "dts") return openOffcavanas("Data Slider", tabElementForPanel, onUpdateNested);
        if (type === "ctg") return openOffcavanas("Catagories", tabElementForPanel, onUpdateNested);
        if (type === "tbl") return openOffcavanas("Table", tabElementForPanel, onUpdateNested);
        if (type === "btw") return openOffcavanas("Between", tabElementForPanel, onUpdateNested);
        if (type === "divider") return openOffcavanas("Divider", tabElementForPanel, onUpdateNested);
        if (type === "lstb") return openOffcavanas("List Box", tabElementForPanel, onUpdateNested);
        if (type === "tabs") return openOffcavanas("Tabs", tabElementForPanel, onUpdateNested);
        if (type === "acc") return openOffcavanas("Accordion", tabElementForPanel, onUpdateNested);
        if (type === "post") return openOffcavanas("Post", tabElementForPanel, onUpdateNested);
        return; // text, heading, img, bnr, ctn ฯลฯ — ไม่เปิดใน Layout Mode
      }

      /* Editor Mode */
      if (type === "text") {
        setTextEditModal({ elementData: tabElement });
        return;
      }
      if (type === "img") return openOffcavanas("Image", tabElementForPanel, onUpdateNested);
      if (type === "imgh") return openOffcavanas("Image", tabElementForPanel, onUpdateNested);
      if (type === "imgo") return openOffcavanas("Overlay", tabElementForPanel, onUpdateNested);
      if (type === "bnr") return openOffcavanas("Banner", tabElementForPanel, onUpdateNested);
      if (type === "lbx") return openOffcavanas("Lightbox", tabElementForPanel, onUpdateNested);
      if (type === "vid") return openOffcavanas("Video", tabElementForPanel, onUpdateNested);
      if (type === "btn" || type === "btnG")
        return openOffcavanas("Button", tabElementForPanel, onUpdateNested);
      if (type === "icon")
        return openOffcavanas("Icon", tabElementForPanel, onUpdateNested);
      if (type === "heading") return openOffcavanas("Heading", tabElementForPanel, onUpdateNested);
      if (type === "list") return openOffcavanas("List", tabElementForPanel, onUpdateNested);
      if (type === "crl") return openOffcavanas("Carousel", tabElementForPanel, onUpdateNested);
      if (type === "dts") return openOffcavanas("Data Slider", tabElementForPanel, onUpdateNested);
      if (type === "ctg") return openOffcavanas("Catagories", tabElementForPanel, onUpdateNested);
      if (type === "tbl") return openOffcavanas("Table", tabElementForPanel, onUpdateNested);
      if (type === "btw") return openOffcavanas("Between", tabElementForPanel, onUpdateNested);
      if (type === "lstb") return openOffcavanas("List Box", tabElementForPanel, onUpdateNested);
      if (type === "ctn") return openOffcavanas("Counter", tabElementForPanel, onUpdateNested);
      if (type === "divider") return openOffcavanas("Divider", tabElementForPanel, onUpdateNested);
      if (type === "tabs") return openOffcavanas("Tabs", tabElementForPanel, onUpdateNested);
      if (type === "acc") return openOffcavanas("Accordion", tabElementForPanel, onUpdateNested);
      if (type === "post") return openOffcavanas("Post", tabElementForPanel, onUpdateNested);
    },
    [builderMode, openOffcavanas, patchTabsNestedElementById]
  );

  const deleteTabNestedElement = useCallback(
    (tabsHostId, tabId, elementId) => {
      setLayout((prev) => {
        const next = lodash.cloneDeep(prev);
        let changed = false;
        const removeFromBucket = (elements) => {
          if (!Array.isArray(elements)) return;
          for (const el of elements) {
            const hostItems =
              el?.type === "tabs"
                ? el?.tabsItems
                : el?.type === "acc"
                  ? el?.accordionItems
                  : el?.type === "post"
                    ? [{ id: "post-main", elements: el?.postElements }]
                    : el?.type === "dts"
                      ? el?.dataSliderItems
                      : el?.type === "ctg"
                        ? mergeCatagoriesElement(el)?.catagoriesItems
                  : null;
            if (el?.id === tabsHostId && el?.type === "ctg") {
              const mergedHost = mergeCatagoriesElement(el);
              const activeCategoryId = mergedHost.catagoriesTabs?.some(
                (tab) =>
                  String(tab?.id || "") ===
                  String(mergedHost?.catagoriesActiveCategoryId || "")
              )
                ? String(mergedHost?.catagoriesActiveCategoryId || "")
                : String(mergedHost?.catagoriesTabs?.[0]?.id || "");
              const catTabIdx = (mergedHost?.catagoriesTabs || []).findIndex(
                (tab) => String(tab?.id || "") === activeCategoryId
              );
              if (catTabIdx === -1) continue;
              const catItems = Array.isArray(
                mergedHost?.catagoriesTabs?.[catTabIdx]?.items
              )
                ? mergedHost.catagoriesTabs[catTabIdx].items
                : [];
              const itemIdx = catItems.findIndex(
                (item) => String(item?.id || "") === String(tabId)
              );
              if (itemIdx === -1) continue;
              const list = Array.isArray(catItems[itemIdx]?.elements)
                ? catItems[itemIdx].elements
                : [];
              const before = list.length;
              const nextEls = list.filter((entry) => entry?.id !== elementId);
              stripOrphanInlineRowGroupIds(nextEls);
              catItems[itemIdx].elements = nextEls;
              if (nextEls.length !== before) {
                mergedHost.catagoriesTabs[catTabIdx].items = catItems;
                mergedHost.catagoriesTabs[catTabIdx].itemCount = catItems.length;
                mergedHost.catagoriesItems = catItems;
                mergedHost.catagoriesItemCount = catItems.length;
                mergedHost.catagoriesActiveId = catItems.some(
                  (item) =>
                    String(item?.id || "") ===
                    String(mergedHost?.catagoriesActiveId || "")
                )
                  ? mergedHost.catagoriesActiveId
                  : catItems[0]?.id;
                el.catagoriesTabs = lodash.cloneDeep(mergedHost.catagoriesTabs);
                el.catagoriesActiveCategoryId = mergedHost.catagoriesActiveCategoryId;
                el.catagoriesItems = lodash.cloneDeep(mergedHost.catagoriesItems);
                el.catagoriesItemCount = mergedHost.catagoriesItemCount;
                el.catagoriesActiveId = mergedHost.catagoriesActiveId;
                changed = true;
              }
              continue;
            }
            if (el?.id === tabsHostId && Array.isArray(hostItems)) {
              const tabItem = hostItems.find((t) => String(t?.id) === String(tabId));
              if (tabItem && Array.isArray(tabItem.elements)) {
                const before = tabItem.elements.length;
                if (el?.type === "post") {
                  const nextEls = tabItem.elements.filter((e) => e.id !== elementId);
                  stripOrphanInlineRowGroupIds(nextEls);
                  el.postElements = nextEls;
                  if (nextEls.length !== before) changed = true;
                } else if (
                  el?.type === "dts" ||
                  el?.type === "ctg" ||
                  el?.type === "acc" ||
                  el?.type === "tabs"
                ) {
                  const nextEls = tabItem.elements.filter((e) => e.id !== elementId);
                  stripOrphanInlineRowGroupIds(nextEls);
                  tabItem.elements = nextEls;
                  if (nextEls.length !== before) changed = true;
                } else {
                  tabItem.elements = tabItem.elements.filter((e) => e.id !== elementId);
                  if (tabItem.elements.length !== before) changed = true;
                }
              }
            }
          }
        };
        for (const container of next) {
          for (const col of container.columns) {
            removeFromBucket(col.elements);
            for (const span of col.spans || []) {
              removeFromBucket(span.elements);
              for (const mini of span.nestedSpans || []) {
                removeFromBucket(mini.elements);
              }
            }
          }
        }
        return changed ? next : prev;
      });
      const deletedId = String(elementId || "");
      if (!deletedId) return;
      setSelectID((prevSel) => {
        if (String(prevSel?.ids?.eleID || "") !== deletedId) return prevSel;
        return { ids: {}, status: "" };
      });
      if (String(offcanvasID || "") === deletedId) {
        openOffcavanas(null, null, null);
      }
    },
    [setLayout, setSelectID, offcanvasID, openOffcavanas]
  );

  const reorderTabNestedElements = useCallback(
    (tabsHostId, tabId, fromIndex, toIndex) => {
      if (fromIndex === toIndex) return;
      setLayout((prev) => {
        const next = lodash.cloneDeep(prev);
        let changed = false;
        const reorderInBucket = (elements) => {
          if (!Array.isArray(elements)) return;
          for (const el of elements) {
            if (el?.id === tabsHostId && el?.type === "ctg") {
              const mergedHost = mergeCatagoriesElement(el);
              const activeCategoryId = mergedHost.catagoriesTabs?.some(
                (tab) =>
                  String(tab?.id || "") ===
                  String(mergedHost?.catagoriesActiveCategoryId || "")
              )
                ? String(mergedHost?.catagoriesActiveCategoryId || "")
                : String(mergedHost?.catagoriesTabs?.[0]?.id || "");
              const catTabIdx = (mergedHost?.catagoriesTabs || []).findIndex(
                (tab) => String(tab?.id || "") === activeCategoryId
              );
              if (catTabIdx === -1) continue;
              const catItems = Array.isArray(
                mergedHost?.catagoriesTabs?.[catTabIdx]?.items
              )
                ? mergedHost.catagoriesTabs[catTabIdx].items
                : [];
              const itemIdx = catItems.findIndex(
                (item) => String(item?.id || "") === String(tabId)
              );
              if (itemIdx === -1) continue;
              const list = catItems[itemIdx]?.elements;
              if (!Array.isArray(list)) continue;
              const moved = reorderElementsWithInlineGroups(list, fromIndex, toIndex);
              if (!moved) continue;
              catItems[itemIdx].elements = list;
              mergedHost.catagoriesTabs[catTabIdx].items = catItems;
              mergedHost.catagoriesTabs[catTabIdx].itemCount = catItems.length;
              mergedHost.catagoriesItems = catItems;
              mergedHost.catagoriesItemCount = catItems.length;
              mergedHost.catagoriesActiveId = catItems.some(
                (item) =>
                  String(item?.id || "") ===
                  String(mergedHost?.catagoriesActiveId || "")
              )
                ? mergedHost.catagoriesActiveId
                : catItems[0]?.id;
              el.catagoriesTabs = lodash.cloneDeep(mergedHost.catagoriesTabs);
              el.catagoriesActiveCategoryId = mergedHost.catagoriesActiveCategoryId;
              el.catagoriesItems = lodash.cloneDeep(mergedHost.catagoriesItems);
              el.catagoriesItemCount = mergedHost.catagoriesItemCount;
              el.catagoriesActiveId = mergedHost.catagoriesActiveId;
              changed = true;
              continue;
            }
            const hostItems =
              el?.type === "tabs"
                ? el?.tabsItems
                : el?.type === "acc"
                  ? el?.accordionItems
                  : el?.type === "post"
                    ? [{ id: "post-main", elements: el?.postElements }]
                    : el?.type === "dts"
                      ? el?.dataSliderItems
                      : el?.type === "ctg"
                        ? mergeCatagoriesElement(el)?.catagoriesItems
                  : null;
            if (el?.id === tabsHostId && Array.isArray(hostItems)) {
              const tabItem = hostItems.find((t) => String(t?.id) === String(tabId));
              if (tabItem && Array.isArray(tabItem.elements)) {
                const items = tabItem.elements;
                const moved = reorderElementsWithInlineGroups(items, fromIndex, toIndex);
                if (moved) changed = true;
              }
            }
          }
        };
        for (const container of next) {
          for (const col of container.columns) {
            reorderInBucket(col.elements);
            for (const span of col.spans || []) {
              reorderInBucket(span.elements);
              for (const mini of span.nestedSpans || []) {
                reorderInBucket(mini.elements);
              }
            }
          }
        }
        return changed ? next : prev;
      });
    },
    [setLayout]
  );

  const renderTabsNestedElement = useCallback(
    (tabsHostId, tabElement, tabElementIndex, tabId) => {
      if (!tabElement) return null;
      const getFresh = () =>
        findLayoutElementById(layouts, String(tabElement.id)) ?? tabElement;
      return (
        <div
          key={String(tabElement.id || `tab-nested-${tabElementIndex}`)}
          data-tabs-nested-edit-id={String(tabElement.id || "")}
          data-tab-nested-id={String(tabElement.id || "")}
          className="w-full"
          onDoubleClickCapture={(e) => {
            /* Layout Mode: intercept & open element's config panel */
            if (builderMode !== "Layout Mode") return;
            e.preventDefault();
            e.stopPropagation();
            openTabsNestedElementEditor(tabsHostId, tabId, tabElement);
          }}
        >
          <Element
            element={tabElement}
            openOffcavanas={openOffcavanas}
            onUpdate={(data) => patchTabsNestedElementById(tabsHostId, tabId, data)}
            onDelete={() =>
              deleteTabNestedElement(
                tabsHostId,
                tabId,
                String(tabElement?.id || "")
              )
            }
            layouts={layouts}
            device={device}
            theme={theme}
            builderMode={builderMode}
            modal={null}
            dragRef={dragRef}
            ids={{}}
            hover={() => {}}
            richTextEditModal={setTextEditModal}
            isInDnD={isDraggingLayout}
            onListEditIcon={(itemIndex) => {
              if (builderMode !== "Editor Mode") return;
              const current = getFresh();
              if (Array.isArray(current?.listItems)) {
                const merged = mergeListElement(current);
                const idx = Number(itemIndex);
                const safeIdx =
                  Number.isFinite(idx) && idx >= 0 && idx < merged.listItems.length
                    ? idx
                    : 0;
                const item = merged.listItems[safeIdx] || {};
                if (merged.listImageElement === true) {
                  openOffcavanas(
                    "Image",
                    sliceListItemImageForPanel(item, merged, safeIdx),
                    null
                  );
                  return;
                }
                openOffcavanas(
                  "Icon",
                  {
                    ...sliceListItemIconForPanel(item, merged),
                    id: `${current.id}__li${safeIdx}`,
                    __listItemIconEdit: {
                      listElementId: current.id,
                      itemIndex: safeIdx,
                    },
                  },
                  null
                );
                return;
              }
              openOffcavanas(
                "Icon",
                getFresh(),
                (next) =>
                patchTabsNestedElementById(tabsHostId, tabId, next)
              );
            }}
            onListEditText={(itemIndex) => {
              if (builderMode !== "Editor Mode") return;
              const current = getFresh();
              if (Array.isArray(current?.listItems)) {
                const merged = mergeListElement(current);
                const idx = Number(itemIndex);
                const safeIdx =
                  Number.isFinite(idx) && idx >= 0 && idx < merged.listItems.length
                    ? idx
                    : 0;
                const item = merged.listItems[safeIdx] || {};
                const listText =
                  typeof item.listText === "string" ? item.listText : "";
                setTextEditModal({
                  mode: "list-item-text",
                  elementData: {
                    id: `${current.id}__li${safeIdx}`,
                    label: listText,
                    textParagraph: item.listTextParagraph,
                    listTextSize: current?.listTextSize,
                    __listItemTextEdit: {
                      listElementId: current.id,
                      itemIndex: safeIdx,
                    },
                  },
                });
                return;
              }
              /* Legacy list */
              const legacyTitle =
                typeof current?.listTitle === "string" ? current.listTitle : "";
              const legacyDescription =
                typeof current?.listDescription === "string"
                  ? current.listDescription
                  : "";
              const combinedLabel =
                typeof current?.listText === "string" && current.listText.trim()
                  ? current.listText
                  : legacyDescription
                  ? `${legacyTitle}\n${legacyDescription}`
                  : legacyTitle;
              setTextEditModal({
                elementData: {
                  id: current.id,
                  label: combinedLabel,
                  textParagraph: current?.textParagraph,
                },
              });
            }}
            onListBoxEditText={(itemIndex, field) =>
              openListBoxItemTextEdit(getFresh(), itemIndex, field)
            }
            onListBoxEditIcon={(itemIndex) =>
              openListBoxItemIconEdit(getFresh(), itemIndex)
            }
            onListBoxEditImage={(itemIndex) =>
              openListBoxItemImageEdit(getFresh(), itemIndex)
            }
          />
        </div>
      );
    },
    [
      builderMode,
      device,
      dragRef,
      isDraggingLayout,
      layouts,
      mergeListElement,
      openListBoxItemIconEdit,
      openListBoxItemImageEdit,
      openListBoxItemTextEdit,
      openOffcavanas,
      openTabsNestedElementEditor,
      patchTabsNestedElementById,
      setTextEditModal,
      sliceListItemIconForPanel,
      sliceListItemImageForPanel,
      theme,
    ]
  );

  // useEffect

  useEffect(() => {
   if(builderMode !== "Layout Mode"){
    setSelectID({status:"",ids:{}});
    setPositionElementSetting({ x: null, y: null });
    // copy/paste element disabled
   }
  }, [builderMode]); // ควบคุมการลบ ele
  useEffect(() => {
    if (builderMode !== "Editor Mode") return;
    setLayout((prev) => {
      if (!Array.isArray(prev)) return prev;
      const next = lodash.cloneDeep(prev);
      stripOrphanInlineRowGroupsEverywhere(next);
      if (lodash.isEqual(prev, next)) return prev;
      return next;
    });
  }, [builderMode, setLayout]);
  useEffect(() => {
    if(builderMode !== "Layout Mode"){
      setDisableConDrag(true);
      setDisableEleDrag(true);
      setDisableColDrag(true);
      setDisableSpnDrag(true);
      setIsDraggingLayout(false);
      setActiveID(null);
      setActiveItem(null);
      clearGhost();
    }
   }, [builderMode]); // ควบคุมการลบ ele
  useEffect(() => {
    if (!preview) return;
    const cancle = () => {
      setTimeout(() => clearGhost(), 0);
    };

    window.addEventListener("dragend", cancle, false);

    return () => {
      window.removeEventListener("dragend", cancle, false);
    };
  }, [preview]); // ยกเลิก Ghost จำลองตำแหน่ง layout ใหม่เมื่อไม่มีการวางเกิดขึ้น

  useEffect(() => {
    if (!preview || !handleDropElement()) return;
    const onDragEnd = (e) => {
      handleDrop(e);
    };
    window.addEventListener("dragend", onDragEnd, { capture: true });
    window.addEventListener("drop", onDragEnd, { capture: true });
    return () => {
      window.removeEventListener("dragend", onDragEnd, { capture: true });
      window.removeEventListener("drop", onDragEnd, { capture: true });
    };
  }, [layouts, preview,handleDropElement()]);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return undefined;
    const synth = window.speechSynthesis;
    const loadVoices = () => {
      toastSpeechVoicesRef.current = synth.getVoices() || [];
    };
    loadVoices();
    synth.onvoiceschanged = loadVoices;
    return () => {
      if (synth.onvoiceschanged === loadVoices) synth.onvoiceschanged = null;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const audio = new Audio(TOAST_VOICE_AUDIO_SRC);
    audio.preload = "auto";
    toastAudioRef.current = audio;
    const audioByKey = {};
    Object.entries(TOAST_VOICE_AUDIO_BY_KEY).forEach(([key, src]) => {
      const item = new Audio(src);
      item.preload = "auto";
      audioByKey[key] = item;
    });
    toastAudioByKeyRef.current = audioByKey;
    return () => {
      if (toastAudioRef.current) {
        toastAudioRef.current.pause();
        toastAudioRef.current = null;
      }
      Object.values(toastAudioByKeyRef.current || {}).forEach((item) => {
        try {
          item.pause();
        } catch (_) {
          /* no-op */
        }
      });
      toastAudioByKeyRef.current = {};
    };
  }, []);

  useEffect(() => {
    if (!carouselColToastOpen) return;
    speakToast(TOAST_VOICE_MESSAGES.carousel, "carousel");
  }, [carouselColToastOpen]);

  useEffect(() => {
    if (!listImageColToastOpen) return;
    speakToast(TOAST_VOICE_MESSAGES.listImage, "listImage");
  }, [listImageColToastOpen]);

  useEffect(() => {
    if (!postColToastOpen) return;
    speakToast(TOAST_VOICE_MESSAGES.post, "post");
  }, [postColToastOpen]);

  useEffect(() => {
    if (!tabsInTabToastOpen) return;
    speakToast(TOAST_VOICE_MESSAGES.tabsInTab, "tabsInTab");
  }, [tabsInTabToastOpen]);

  useEffect(() => {
    if (!postInPostToastOpen) return;
    speakToast(TOAST_VOICE_MESSAGES.postInPost, "postInPost");
  }, [postInPostToastOpen]);

  useEffect(() => {
    if (!dataSliderTypeToastOpen) return;
    speakToast(TOAST_VOICE_MESSAGES.dataSliderType, "dataSliderType");
  }, [dataSliderTypeToastOpen]);

  // Function JSX

  // การโหลดข้อมูล

  // การเพิ่ม Layout ใหม่

  // ควบคุม Ref สำหรับควบคุมฟังก์ชัน

  // ควบคุม Container

  // Container HTML

  // ควบคุม Column

  // Column HTML

  // ควบคุม Element

  // Element HTML

  // การใช้งานข้อมูลในบางกรณี
  const opacity_2_hex = (opcy) => {
    const hex = opcy.toString(16).toUpperCase().padStart(2, 0);
    return hex;
  }; // แปลงค่า Opacity ให้เป็น Hex

  /** สไตล์เส้นคั่นคอลัมน์ของ Section — ใช้กับคอลัมน์หลัก (+ อ่าน noColumnGap แบบ strict สำหรับ Span/Mini) */
  const getSectionColumnDividerVisual = (layouts, IDX, theme) => {
    const sectionCont = layouts[IDX]?.container;
    /* Boolean("false") === true — อ่านค่า toggle จาก API/JSON ให้ตรง */
    const strictLayoutBool = (v) =>
      v === true || v === 1 || v === "true" || v === "1";
    const noColumnGap = strictLayoutBool(sectionCont?.noColumnGap);
    const rawGridBorder = strictLayoutBool(sectionCont?.gridBorder);
    const gridBorder = rawGridBorder && !noColumnGap;
    const columnDividerStyle = sectionCont?.columnDividerStyle || "dashed";
    const columnDividerOpacity = sectionCont?.columnDividerOpacity ?? 255;
    const columnDividerColor = (() => {
      const fallback = "#d8d8d8";
      let c = sectionCont?.columnDividerColor ?? fallback;
      if (
        c &&
        typeof c === "object" &&
        c.type &&
        Array.isArray(theme?.[c.type]) &&
        theme[c.type].length > 0 &&
        typeof c.index === "number"
      ) {
        const max = theme[c.type].length - 1;
        if (c.index > max) c = { ...c, index: max };
      }
      return c;
    })();
    const columnDividerBorderStyleClass =
      columnDividerStyle === "dashed"
        ? "border-dashed"
        : columnDividerStyle === "dotted"
          ? "border-dotted"
          : "border-solid";
    const columnDividerColorStyle =
      gridBorder && theme
        ? {
            borderColor: setColor(
              theme,
              columnDividerColor,
              columnDividerOpacity
            ),
          }
        : {};
    const rawVertLen = Number(sectionCont?.columnDividerVerticalLengthPercent);
    const columnDividerVerticalLengthPct = Math.min(
      100,
      Math.max(10, Number.isFinite(rawVertLen) ? rawVertLen : 95)
    );
    const verticalDividerColor =
      gridBorder && theme
        ? setColor(theme, columnDividerColor, columnDividerOpacity)
        : (typeof columnDividerColor === "string"
            ? columnDividerColor
            : "#d8d8d8") + opacity_2_hex(columnDividerOpacity ?? 255);
    const verticalDividerBorderStyle =
      columnDividerStyle === "dashed"
        ? "dashed"
        : columnDividerStyle === "dotted"
          ? "dotted"
          : "solid";
    return {
      gridBorder,
      rawGridBorder,
      noColumnGap,
      columnDividerBorderStyleClass,
      columnDividerColorStyle,
      verticalDividerColor,
      verticalDividerBorderStyle,
      columnDividerVerticalLengthPct,
    };
  };

  /**
   * คลาสเส้นตารางเดียวกับ SortableColumnItem.border() — ลำดับตามลำดับช่องในแถว 12
   * (ใช้กับคอลัมน์หลัก)
   */
  const computeGridBorderStringsFromSizes = (sizes) => {
    const gridBorders = [];
    if (!Array.isArray(sizes) || sizes.length === 0) return gridBorders;
    const totalCol = (columns) => {
      if (!columns) return 0;
      let cols = 0;
      for (const c of columns) cols += c;
      return cols;
    };
    const rows = [];
    let row = [];
    let rowLength = 0;
    const n = sizes.length;
    sizes.forEach((colSize, i) => {
      const cloneRow = lodash.cloneDeep(row);
      rowLength += colSize;
      if (i === n - 1) {
        if (rowLength > 12) {
          rows.push(row);
          rows.push([colSize]);
        } else {
          row.push(colSize);
          rows.push(row);
        }
      } else if (rowLength < 12) {
        row.push(colSize);
      } else if (rowLength === 12) {
        cloneRow.push(colSize);
        rows.push(cloneRow);
        row.splice(0, row.length);
        rowLength = 0;
      } else if (rowLength > 12) {
        rows.push(cloneRow);
        row.splice(0, row.length, colSize);
        rowLength = colSize;
      }
    });
    const nextRows = lodash.cloneDeep(rows);
    nextRows.splice(0, 1);
    rows.forEach((r, I) => {
      let currentRowSize = 0;
      r.forEach((cellSize, i) => {
        currentRowSize += cellSize;
        const nextRowSize = totalCol(nextRows[I]) || 0;
        const decide = I === rows.length - 1 ? true : currentRowSize > nextRowSize;
        const noBorderBottom = decide ? "border-b-0" : "";
        if (i === r.length - 1 && I === rows.length - 1) {
          gridBorders.push(`border-0`);
        } else if (i === r.length - 1 && I !== rows.length - 1) {
          gridBorders.push(
            `border border-t-0 border-l-0 border-r-0 ${noBorderBottom}`
          );
        } else {
          gridBorders.push(`border border-t-0 border-l-0 ${noBorderBottom}`);
        }
      });
    });
    return gridBorders;
  };

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
  }; // แปลง Font Tailwind ให้เป็น Font CSS

  const updateHoverPosition = (x, y) => {
    const el = document.elementFromPoint(x, y);
    const control = el?.closest(`[data-drop="BTN"],[data-drop="COLUMN-BTN"]`);
    const column = el?.closest(`[data-drop="COLUMN"]`);
    const section = el?.closest(`[data-drop="SECTION"]`);
    const span = el?.closest(`[data-drop="SPAN"]`);
    // MiniSpan ถูกถอดออกแล้ว: กันการจับ SPAN ซ้ำจน logic เข้า nested ผิด
    const nestedSpan = null;
    const element = el?.closest(`[data-drop="ELEMENT"]`);

    if (control) {
      const spanOwner = control.closest(`[data-drop="SPAN"]`);
      if (spanOwner) {
        setHover(spanOwner.getAttribute("id"));
        return "spn-btn";
      }
      const columnOwner = control.closest(`[data-drop="COLUMN"]`);
      if (columnOwner) {
        const colKey = layoutColumnKeyFromDomColumnId(columnOwner.getAttribute("id"));
        if (colKey) {
          setHover(colKey);
          return "col-btn";
        }
      }
    }

    if (!section && !column && !element) {
      setHover(null);
      return;
    }

    if (nestedSpan) {
      let msid = nestedSpan.getAttribute("id");
      setHover(msid);
      return "mspn";
    }

    if (span && column) {
      // ให้ More Option ของคอลัมน์ที่กดค้างอยู่ต่อได้ ถ้ายังอยู่ในคอลัมน์เดิม
      // และเคลียร์เฉพาะกรณี pointer ไปอยู่ span ของคอลัมน์อื่น
      const columnDomId = column.getAttribute("id");
      const spanOwnerColKey = layoutColumnKeyFromDomColumnId(columnDomId);
      if (
        pinnedColumnOptionId &&
        spanOwnerColKey &&
        pinnedColumnOptionId !== spanOwnerColKey
      ) {
        setPinnedColumnOptionId(null);
      }
      let sid = span.getAttribute("id");
      setHover(sid);
      return "spn";
    } else if (section && column) {
      const columnDomId = column.getAttribute("id");
      const colKey = layoutColumnKeyFromDomColumnId(columnDomId);
      if (colKey) {
        setHover(colKey);
        return "col";
      }
      const secId = section.getAttribute("id");
      setHover(secId);
      return "sec";
    } else if (section && !column && !element) {
      const id = section.getAttribute("id");
      // For split row wrappers, find the specific half the cursor is over
      const splitHalf = el?.closest("[data-split-secid]");
      setHover(splitHalf ? splitHalf.getAttribute("data-split-secid") : id);
      return "sec";
    }
  };

  const setDragRef = (el) => {
    if (preview) return;
    dragRef.current = el || null;
  };

  /** id บน DOM ของคอลัมน์มักเป็น `conId/colId` — แปลงเป็น colId ใน layouts */
  const layoutColumnKeyFromDomColumnId = (columnDomId) => {
    if (!columnDomId || typeof columnDomId !== "string") return columnDomId;
    const parts = columnDomId.split("/");
    return parts.length > 1 ? parts[parts.length - 1] : columnDomId;
  };

  const resolveLayoutColumnPathFromDom = (columnNode) => {
    const rawId = columnNode?.getAttribute?.("id");
    if (!rawId || typeof rawId !== "string") return null;

    const pathParts = rawId.split("/");
    if (pathParts.length >= 2) {
      const conID = pathParts[0];
      const colID = pathParts[pathParts.length - 1];
      const valid = layouts.some(
        (l) => l?.container?.id === conID && l?.columns?.some((c) => c?.id === colID)
      );
      if (valid) return { conID, colID };
    }

    const colID = layoutColumnKeyFromDomColumnId(rawId);
    if (!colID) return null;

    const sectionNode = columnNode?.closest?.('[data-drop="SECTION"]');
    const sectionId = sectionNode?.getAttribute?.("id");

    let conI = layouts.findIndex(
      (l) => l?.container?.id === sectionId && l?.columns?.some((c) => c?.id === colID)
    );
    if (conI === -1 && sectionId) {
      conI = layouts.findIndex(
        (l) => l?.splitRowId === sectionId && l?.columns?.some((c) => c?.id === colID)
      );
    }
    if (conI === -1) {
      conI = layouts.findIndex((l) => l?.columns?.some((c) => c?.id === colID));
    }
    if (conI === -1) return null;

    return { conID: layouts[conI].container.id, colID };
  };

  const updateDND = (x, y) => {
    const el = document.elementFromPoint(x, y);
    const section = el?.closest(`[data-drop="SECTION"]`);
    const column = el?.closest(`[data-drop="COLUMN"]`);
    const element = el?.closest(`[data-drop="ELEMENT"]`);
    const span = el?.closest(`[data-drop="SPAN"]`);
    const nestedSpan = el?.closest(`[data-drop="SPAN"]`);

    if (!section) {
      setDisableConDrag(true);
      setDisableEleDrag(true);
      return;
    }

    if (section && !column && !element) {
      setDisableConDrag(false);
      setDisableEleDrag(true);
    } else if (section && column && !element && !span) {
      const conID = section.id;
      if (isNull(conID)) return;
      const colID = column.id;
      if (isNull(colID)) return;
      let conI = layouts.findIndex((l) => l.container.id === conID);
      if (conI === -1) {
        // split section: section.id is the splitRowId → resolve via column
        const bareColID = colID.includes("/") ? colID.split("/")[1] : colID;
        conI = layouts.findIndex((l) => l.columns?.some((c) => c.id === bareColID));
      }
      if (conI === -1) return;
      const colKey = layoutColumnKeyFromDomColumnId(colID);
      const colI = layouts[conI].columns.findIndex((c) => c.id === colKey);
      if (colI === -1) return;
      const isHasElements = layouts[conI].columns[colI].elements.length > 0;
      if (!isHasElements) {
        setDisableConDrag(false);
        setDisableEleDrag(true);
      } else if (isHasElements) {
        setDisableConDrag(true);
        setDisableEleDrag(true);
      }
    } else if (section && column && !element && span) {
      /* ช่องว่าง/กริด Span ไม่มี ELEMENT — ให้ลาก Section/Split ผ่านได้ (ไม่ให้สาขาข้างบนค้าง) */
      setDisableConDrag(false);
      setDisableEleDrag(true);
    } else if (section && column && element) {
      const conID = section.id;
      if (isNull(conID)) return;
      const colID = column.id;
      if (isNull(colID)) return;
      let conI = layouts.findIndex((l) => l.container.id === conID);
      if (conI === -1) {
        // split section: section.id is the splitRowId → resolve via column
        const bareColID = colID.includes("/") ? colID.split("/")[1] : colID;
        conI = layouts.findIndex((l) => l.columns?.some((c) => c.id === bareColID));
      }
      if (conI === -1) return;
      let colI;
      let isHasElements;
      if (span) {
        const colIDPath = layoutColumnKeyFromDomColumnId(colID);
        colI = layouts[conI].columns.findIndex((c) => c.id === colIDPath);
        if (colI === -1) return;
        const spnID = spanDomIdToSpanKey(span.id) ?? span.id;
        if (nestedSpan) {
          const [_sec, _col, spnIDPath] = spnID.split("/");
          const spnI = layouts[conI].columns[colI].spans.findIndex(
            (s) => s.id === spnIDPath
          );
          if (spnI === -1) return;
          const nestID = nestedSpan.id;
          const nestI = layouts[conI].columns[colI].spans[
            spnI
          ].nestedSpans.findIndex((ms) => ms.id === nestID);
          if (nestI === -1) return;
          isHasElements =
            layouts[conI].columns[colI].spans[spnI].nestedSpans[nestI].elements
              .length > 0;
        } else {
          const spnI = layouts[conI].columns[colI].spans.findIndex(
            (s) => s.id === spnID
          );
          if (spnI === -1) return;
          isHasElements =
            layouts[conI].columns[colI].spans[spnI].elements.length > 0;
        }
      } else {
        const colKey = layoutColumnKeyFromDomColumnId(colID);
        colI = layouts[conI].columns.findIndex((c) => c.id === colKey);
        if (colI === -1) return;
        isHasElements = layouts[conI].columns[colI].elements.length > 0;
      }
      if (!isHasElements) {
        setDisableConDrag(false);
        setDisableEleDrag(true);
      } else if (isHasElements) {
        setDisableConDrag(true);
        setDisableEleDrag(false);
      }
    } else if (
      (section && column && element && span) ||
      (section && column && element && span && nestedSpan)
    ) {
      setDisableConDrag(false);
      setDisableEleDrag(true);
    }
  };

  const scheduleDND = (e) => {
    if (!isLayoutMode) return;
    if (isDraggingLayout) {
      setDisableConDrag(false);
      setDisableEleDrag(false);
      setDisableSpnDrag(false);
      return;
    }
    const { clientX, clientY } = e;
    if (dndRef.current) return;
    dndRef.current = requestAnimationFrame(() => {
      dndRef.current = null;
      updateDND(clientX, clientY);
    });
  };

  const scheduleBTNUpdate = (e) => {
    if (!isLayoutMode) return;
    const { clientX, clientY } = e;
    if (btnGroupRef.current) return;
    btnGroupRef.current = requestAnimationFrame(() => {
      btnGroupRef.current = null;
      return updateHoverPosition(clientX, clientY);
    });
  };


  const getBucketByDropIndex = (newLayouts, conI, colI, spnI = null, nestI = null) => {
    if (spnI !== null) {
      if (nestI !== null) {
        return newLayouts[conI]?.columns?.[colI]?.spans?.[spnI]?.nestedSpans?.[nestI] || null;
      }
      return newLayouts[conI]?.columns?.[colI]?.spans?.[spnI] || null;
    }
    return newLayouts[conI]?.columns?.[colI] || null;
  };

  const insertRowsIntoDropTarget = ({
    newLayouts,
    conI,
    colI,
    spnI = null,
    nestI = null,
    eleI,
    rows,
    dropType = "ELEMENT",
    tabEleID = null,
    tabId = null,
    tabEleI = 0,
  }) => {
    const bucket = getBucketByDropIndex(newLayouts, conI, colI, spnI, nestI);
    if (!bucket || !Array.isArray(rows) || rows.length === 0) return false;
    if (!Array.isArray(bucket.elements)) return false;

    if (dropType === "TAB-ELEMENT") {
      const tabsHost =
        bucket.elements.find((e) => e?.id === tabEleID) ||
        bucket.elements[eleI];
      if (tabsHost?.type === "ctg") {
        const mergedHost = mergeCatagoriesElement(tabsHost);
        const activeCategoryId = mergedHost.catagoriesTabs?.some(
          (tab) =>
            String(tab?.id || "") ===
            String(mergedHost?.catagoriesActiveCategoryId || "")
        )
          ? String(mergedHost?.catagoriesActiveCategoryId || "")
          : String(mergedHost?.catagoriesTabs?.[0]?.id || "");
        const catTabIdx = (mergedHost?.catagoriesTabs || []).findIndex(
          (tab) => String(tab?.id || "") === activeCategoryId
        );
        if (catTabIdx === -1) return false;
        const catItems = Array.isArray(mergedHost?.catagoriesTabs?.[catTabIdx]?.items)
          ? mergedHost.catagoriesTabs[catTabIdx].items
          : [];
        const itemIdx = catItems.findIndex(
          (item) => String(item?.id || "") === String(tabId)
        );
        if (itemIdx === -1) return false;
        if (!Array.isArray(catItems[itemIdx]?.elements)) {
          catItems[itemIdx].elements = [];
        }
        const insertAtRaw = Math.max(
          0,
          Math.min(
            Number.isInteger(tabEleI) ? tabEleI : catItems[itemIdx].elements.length,
            catItems[itemIdx].elements.length
          )
        );
        const insertAt = snapInsertOutsideInlineGroup(catItems[itemIdx].elements, insertAtRaw);
        catItems[itemIdx].elements.splice(insertAt, 0, ...rows);
        mergedHost.catagoriesTabs[catTabIdx].items = catItems;
        mergedHost.catagoriesTabs[catTabIdx].itemCount = catItems.length;
        mergedHost.catagoriesItems = catItems;
        mergedHost.catagoriesItemCount = catItems.length;
        mergedHost.catagoriesActiveId = catItems.some(
          (item) => String(item?.id || "") === String(mergedHost?.catagoriesActiveId || "")
        )
          ? mergedHost.catagoriesActiveId
          : catItems[0]?.id;
        tabsHost.catagoriesTabs = lodash.cloneDeep(mergedHost.catagoriesTabs);
        tabsHost.catagoriesActiveCategoryId = mergedHost.catagoriesActiveCategoryId;
        tabsHost.catagoriesItems = lodash.cloneDeep(mergedHost.catagoriesItems);
        tabsHost.catagoriesItemCount = mergedHost.catagoriesItemCount;
        tabsHost.catagoriesActiveId = mergedHost.catagoriesActiveId;
        bucket.latestEleID = (Number(bucket.latestEleID) || 0) + rows.length;
        return true;
      }
      const hostItems =
        tabsHost?.type === "tabs"
          ? tabsHost?.tabsItems
          : tabsHost?.type === "acc"
            ? tabsHost?.accordionItems
            : tabsHost?.type === "post"
              ? [{ id: "post-main", elements: tabsHost?.postElements }]
              : tabsHost?.type === "dts"
                ? tabsHost?.dataSliderItems
                : tabsHost?.type === "ctg"
                  ? mergeCatagoriesElement(tabsHost)?.catagoriesItems
            : null;
      if (!tabsHost || !Array.isArray(hostItems)) {
        return false;
      }
      const tabIdx = hostItems.findIndex((t) => String(t?.id) === String(tabId));
      if (tabIdx === -1) return false;
      if (!Array.isArray(hostItems[tabIdx].elements)) {
        if (tabsHost?.type === "post") {
          tabsHost.postElements = [];
          hostItems[tabIdx].elements = tabsHost.postElements;
        } else {
          hostItems[tabIdx].elements = [];
        }
      }
      const insertAtRaw = Math.max(
        0,
        Math.min(
          Number.isInteger(tabEleI) ? tabEleI : hostItems[tabIdx].elements.length,
          hostItems[tabIdx].elements.length
        )
      );
      const insertAt = snapInsertOutsideInlineGroup(hostItems[tabIdx].elements, insertAtRaw);
      hostItems[tabIdx].elements.splice(insertAt, 0, ...rows);
    } else {
      bucket.elements.splice(eleI, 0, ...rows);
    }
    bucket.latestEleID = (Number(bucket.latestEleID) || 0) + rows.length;
    return true;
  };

  const dropNewElement = () => {
    const dropType = dropTargetRef.current?.type;
    const isDropElementLike = dropType === "ELEMENT" || dropType === "TAB-ELEMENT";
    if (
      !Number.isInteger(dropTargetRef.current?.index?.conI) ||
      !Number.isInteger(dropTargetRef.current?.index?.colI) ||
      !Number.isInteger(dropTargetRef.current?.index?.eleI) ||
      typeof dropTargetRef.current.index !== "object" ||
      !isDropElementLike
    ) {
      clearGhost();
      return;
    }
    let spnI = null,
      nestI = null;
    const { conI, colI, eleI } = dropTargetRef.current.index;
    spnI = dropTargetRef.current.index?.spnI ?? null;
    nestI = dropTargetRef.current.index?.nestI ?? null;
    const tabEleID = dropTargetRef.current.index?.tabEleID ?? null;
    const tabId = dropTargetRef.current.index?.tabId ?? null;
    const tabEleI = dropTargetRef.current.index?.tabEleI ?? 0;
    const rawElement = handleDropElement();
    const isCanvasElementMove =
      activeDragRef.current?.data?.current?.type === "ELEMENT";
    const element = isCanvasElementMove
      ? rawElement
      : stripIncomingInlineRowGroupIds(rawElement);
    if (element.container || isNull(conI) || isNull(colI) || isNull(eleI)) {
      clearGhost();
      return;
    }
    if (element?.type === "post" || element?.type === "dts" || element?.type === "ctg") {
      const w = getLayoutBucketWidthUnits(layouts, conI, colI, spnI, nestI);
      if (!Number.isFinite(w) || w < POST_MIN_COL_UNITS) {
        if (!postColWarnedRef.current) {
          postColWarnedRef.current = true;
          setPostColToastOpen(true);
        }
        clearGhost();
        return;
      }
      setPostColToastOpen(false);
      postColWarnedRef.current = false;
    }
    if (!element.id) return;
    let id,latestEleID,data
    const getID = ()=>{
      const clone = lodash.cloneDeep(layouts)
      if(spnI !== null){
        if(nestI !== null){
          
          data = clone[conI].columns[colI].spans[spnI].nestedSpans[nestI]
          console.log(data);
          id = data.id.replace("Span-","")
          console.log(id);
        }else{
          data = clone[conI].columns[colI].spans[spnI]
          
          id = data.id.replace("Span-","")
          
        }
      }else{
        data = clone[conI].columns[colI]
        id = data.id.replace("Col-","")
      }
      latestEleID = data.latestEleID
      console.log(latestEleID);
    }
    getID();

    const bundle = element?.listIconsBundleDefaults;
    if (
      element.type === "list" &&
      Array.isArray(bundle) &&
      bundle.length > 1 &&
      !Array.isArray(element?.listItems)
    ) {
      const newLayouts = lodash.cloneDeep(layouts);
      const lid0 = latestEleID;
      const gid = `lr-${Math.ceil(Math.random() * 1e9).toString(36)}`;
      const base = lodash.omit(element, [
        "listIconsBundleDefaults",
        "faIcon",
        "listText",
        "listTitle",
        "listDescription",
        "listTextParagraph",
      ]);
      const align =
        element.iconLayoutAlign != null
          ? element.iconLayoutAlign
          : INLINE_LIST_DEFAULT_ALIGN;
      const rows = bundle.map((row, i) => ({
        ...lodash.cloneDeep(base),
        type: "list",
        faIcon: row.faIcon,
        listText: row.listText,
        listTitle: "",
        listDescription: "",
        listRowGroupId: gid,
        iconLayoutAlign: align,
        listIconTextGapPx: element.listIconTextGapPx,
        id: `List-${id}-${lid0 + i}`,
      }));

      const ok = insertRowsIntoDropTarget({
        newLayouts,
        conI,
        colI,
        spnI,
        nestI,
        eleI,
        rows,
        dropType,
        tabEleID,
        tabId,
        tabEleI,
      });
      if (!ok) {
        clearGhost();
        return;
      }
      clearGhost();
      setLayout(newLayouts);
      return;
    }

    element.id += `${id}-${latestEleID}`;
    console.log(element);
    console.log(element.id);
    const newLayouts = lodash.cloneDeep(layouts);
    const ok = insertRowsIntoDropTarget({
      newLayouts,
      conI,
      colI,
      spnI,
      nestI,
      eleI,
      rows: [element],
      dropType,
      tabEleID,
      tabId,
      tabEleI,
    });
    if (!ok) {
      clearGhost();
      return;
    }
    if (
      (element?.type === "btn" || element?.type === "btnG") &&
      tabEleID &&
      tabId
    ) {
      suppressNextTabButtonSelectRef.current = {
        until: Date.now() + 300,
        hostId: String(tabEleID),
        tabId: String(tabId),
        elementId: String(element.id || ""),
      };
    }
    clearGhost();
    setLayout(newLayouts);
  };

  const dropNewSection = () => {
    const layout = handleDropElement();

    if (layout.isSplitLayout) {
      if (
        dropTargetRef.current?.type !== "SECTION" ||
        typeof dropTargetRef.current.index !== "number" ||
        dropTargetRef.current.index === -1
      ) {
        clearGhost();
        return;
      }
      const splitRowId = `SplitRow-${page.latestID}`;
      const sectionsToInsert = layout.sections.map((sec, si) => {
        const newSec = lodash.cloneDeep(sec);
        const suffix = si === 0 ? "L" : "R";
        newSec.container.id += `${page.latestID}${suffix}`;
        for (let ci = 0; ci < newSec.columns.length; ci++) {
          newSec.columns[ci].id += `${page.latestID}${suffix}-${ci}`;
        }
        newSec.splitRowId = splitRowId;
        newSec.splitSide = si === 0 ? "left" : "right";
        return newSec;
      });
      setPage((prev) => ({ ...prev, latestID: prev.latestID + 1 }));
      const newLayouts = lodash.cloneDeep(layouts);
      newLayouts.splice(dropTargetRef.current.index, 0, ...sectionsToInsert);
      clearGhost();
      setLayout(newLayouts);
      return;
    }

    if (layout.container) {
      if (
        dropTargetRef.current?.type !== "SECTION" ||
        typeof dropTargetRef.current.index !== "number" ||
        dropTargetRef.current.index === -1
      ) {
        clearGhost();
        return;
      }
      layout.container.id += page.latestID;
      if(layout.columns){
        for (let i = 0; i < layout.columns.length; i++) {
          layout.columns[i].id += `${page.latestID}-${i}`;
          const newID = layout.columns[i].id.replace("Col-", "");
          if (layout.columns[i].isSpan) {
            layout.columns[i].spans.map((s, o) => {
              s.id += `${newID}-${o}`;
              s.hasNestedSpan = false;
              s.nestedSpans = [];
              s.latestNestedSpanID = 0;
            });
          }
        }
      }
      
      setPage((prev) => {
        return { ...prev, latestID: prev.latestID + 1 };
      });
      const newLayouts = lodash.cloneDeep(layouts);
      newLayouts.splice(dropTargetRef.current.index, 0, layout);
      clearGhost();
      setLayout(newLayouts);
    } else {
      clearGhost();
      return;
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const rawDroppingElem = handleDropElement();
    const isCanvasElementMove =
      activeDragRef.current?.data?.current?.type === "ELEMENT";
    const droppingElem = isCanvasElementMove
      ? rawDroppingElem
      : stripIncomingInlineRowGroupIds(rawDroppingElem);
    if (!droppingElem) {
      clearGhost();
      return;
    }
    const tabContent = findTabContent(e.clientX, e.clientY);
    const tabNested = findTabNestedItem(e.clientX, e.clientY);
    const hostIdRaw =
      tabContent?.getAttribute?.("data-tab-element-id") ||
      tabNested?.closest?.("[data-tab-element-id]")?.getAttribute?.("data-tab-element-id") ||
      "";
    const tabHost = hostIdRaw ? findLayoutElementById(layouts, String(hostIdRaw)) : null;
    const incomingType = String(droppingElem?.type || "");

    /* แจ้งเตือนเฉพาะตอน drop จริงเท่านั้น (ไม่ใช่แค่ลากผ่าน) */
    if (
      (incomingType === "tabs" || incomingType === "dts" || incomingType === "ctg") &&
      (tabContent || tabNested)
    ) {
      clearGhost();
      if (tabHost?.type === "dts" || tabHost?.type === "ctg") {
        requestAnimationFrame(() => setDataSliderTypeToastOpen(true));
      } else {
        requestAnimationFrame(() => setTabsInTabToastOpen(true));
      }
      return;
    }

    if (incomingType === "acc" && (tabContent || tabNested) && tabHost?.type === "tabs") {
      clearGhost();
      requestAnimationFrame(() => setTabsInTabToastOpen(true));
      return;
    }

    if (incomingType === "post" && (tabContent || tabNested) && tabHost?.type === "post") {
      clearGhost();
      requestAnimationFrame(() => setPostInPostToastOpen(true));
      return;
    }

    if (tabHost?.type === "dts" || tabHost?.type === "ctg") {
      const blockedSpecialSet = new Set(["tabs", "acc", "post", "dts", "ctg"]);
      const sourceElement =
        activeDragRef.current?.data?.current?.type === "ELEMENT"
          ? resolveLayoutElementByDragData(layouts, activeDragRef.current)
          : null;
      const elementToCheck = sourceElement || droppingElem;
      if (blockedSpecialSet.has(incomingType) || !isAllowedInDataSliderArea(elementToCheck)) {
        clearGhost();
        requestAnimationFrame(() => setDataSliderTypeToastOpen(true));
        return;
      }
    }

    if (!dropTargetRef.current?.type) {
      const elem = lodash.cloneDeep(droppingElem);
      const type = elem?.container ? "SECTION" : "ELEMENT";
      updateHoverFromPoint(e.clientX, e.clientY, type, elem);
    }

    if (!dropTargetRef.current?.type && blockedDropToastRef.current) {
      const reason = blockedDropToastRef.current;
      clearGhost();
      requestAnimationFrame(() => {
        if (reason === "listImage") setListImageColToastOpen(true);
        else if (reason === "post") setPostColToastOpen(true);
        else if (reason === "dataSliderType") setDataSliderTypeToastOpen(true);
        else if (reason === "tabsInTab") setTabsInTabToastOpen(true);
        else if (reason === "postInPost") setPostInPostToastOpen(true);
        else setCarouselColToastOpen(true);
      });
      return;
    }

    if (hoverRef.current) {
      cancelAnimationFrame(hoverRef.current);
      hoverRef.current = null;
    }

    if (dropTargetRef.current.type === "SECTION") dropNewSection();
    else dropNewElement();
  };

  const handleDuring = (e) => {
    if (!isLayoutMode) return;
    e.preventDefault();
    autoScrollCanvasForPointer(e.clientY);
    const rawElement = lodash.cloneDeep(handleDropElement());
    const isCanvasElementMove =
      activeDragRef.current?.data?.current?.type === "ELEMENT";
    const element = isCanvasElementMove
      ? rawElement
      : stripIncomingInlineRowGroupIds(rawElement);
    if (!element) {
      clearGhost();
      return;
    }
    if (element.isSplitLayout) {
      const ghostSec = {
        _isSplitGhost: true,
        container: { id: `SplitGhost-${page.latestID}` },
        sections: element.sections.map((sec, si) => {
          const g = lodash.cloneDeep(sec);
          const suffix = si === 0 ? "L" : "R";
          g.container.id += `${page.latestID}ghost${suffix}`;
          g.columns.forEach((col, ci) => { col.id += `${page.latestID}ghost${suffix}-${ci}`; });
          return g;
        }),
      };
      scheduleHoverUpdate(e, "SECTION", ghostSec);
      return;
    }
    if (element.container) {
      element.container.id += page.latestID;
      if(element.columns){
        for (let i = 0; i < element.columns.length; i++) {
          element.columns[i].id += `${page.latestID}-${i}`;
          if (element.columns[i].isSpan) {
            element.columns[i].spans.map((s, o) => {
              s.id += `${page.latestID}-${i}-${o}`;
              s.hasNestedSpan = false;
              s.nestedSpans = [];
              s.latestNestedSpanID = 0;
            });
          }
        }
      }
     
      scheduleHoverUpdate(e, "SECTION", element);

      return;
    }
    scheduleHoverUpdate(e, "ELEMENT", element);
  };

  const sanitizeElementDropIndex = (indexObj) => {
    if (!indexObj || typeof indexObj !== "object") return indexObj;
    if (!Number.isInteger(indexObj?.eleI)) return indexObj;
    // TAB-ELEMENT uses eleI as host index; do not rewrite here.
    if (Number.isInteger(indexObj?.tabEleI)) return indexObj;
    if (!Number.isInteger(indexObj?.conI) || !Number.isInteger(indexObj?.colI)) {
      return indexObj;
    }
    const section = layouts[indexObj.conI];
    if (!section?.columns?.[indexObj.colI]) return indexObj;
    let bucket = section.columns[indexObj.colI].elements;
    if (Number.isInteger(indexObj?.spnI)) {
      const span = section.columns[indexObj.colI].spans?.[indexObj.spnI];
      if (!span) return indexObj;
      bucket = Number.isInteger(indexObj?.nestI)
        ? span.nestedSpans?.[indexObj.nestI]?.elements
        : span.elements;
    }
    if (!Array.isArray(bucket)) return indexObj;
    const snapped = snapInsertOutsideInlineGroup(bucket, indexObj.eleI);
    return snapped === indexObj.eleI
      ? indexObj
      : { ...indexObj, eleI: snapped };
  };

  const setDrop = (i, t, b = false) => {
    const safeIndex =
      t === "ELEMENT" && i && typeof i === "object"
        ? sanitizeElementDropIndex(i)
        : i;
    dropTargetRef.current = { index: safeIndex, type: t, isLast: b };
    if (t === "ELEMENT" && i && typeof i === "object") {
      setElementDropHighlight({
        conI: safeIndex.conI,
        colI: safeIndex.colI,
        spnI: safeIndex.spnI ?? null,
        nestI: safeIndex.nestI ?? null,
      });
    } else {
      setElementDropHighlight(null);
    }
    if (t === "ELEMENT") {
      dropHoldUntilRef.current = Date.now() + 180;
    }
    if (t !== "ELEMENT") {
      resetEleInsertSnapState();
      resetTabInlineRowSnapState();
    }
  };

  const autoScrollCanvasForPointer = (clientY) => {
    const scroller = canvasScrollRef.current;
    if (!scroller || !Number.isFinite(clientY)) return;
    const rect = scroller.getBoundingClientRect();
    if (!rect) return;
    if (clientY < rect.top || clientY > rect.bottom) return;

    const EDGE_ZONE_PX = 100;
    const MAX_STEP_PX = 32;
    let delta = 0;
    if (clientY <= rect.top + EDGE_ZONE_PX) {
      const ratio = Math.min(
        1,
        Math.max(0, (rect.top + EDGE_ZONE_PX - clientY) / EDGE_ZONE_PX)
      );
      delta = -Math.ceil(MAX_STEP_PX * ratio);
    } else if (clientY >= rect.bottom - EDGE_ZONE_PX) {
      const ratio = Math.min(
        1,
        Math.max(0, (clientY - (rect.bottom - EDGE_ZONE_PX)) / EDGE_ZONE_PX)
      );
      delta = Math.ceil(MAX_STEP_PX * ratio);
    }
    if (delta !== 0) scroller.scrollTop += delta;
  };

  const shouldCommitElementDropTarget = (candidate, x, y) => {
    if (!candidate || typeof candidate !== "object") return true;
    const key = `${candidate.conI}:${candidate.colI}:${candidate.spnI ?? "-"}:${candidate.nestI ?? "-"}`;
    const now = Date.now();
    const isCanvasElementMove =
      activeDragRef.current?.data?.current?.type === "ELEMENT";
    if (!isCanvasElementMove) return true;

    // ไม่หน่วงถ้ายังอยู่ bucket เดิม
    const current = dropTargetRef.current?.index;
    if (
      dropTargetRef.current?.type === "ELEMENT" &&
      current &&
      current.conI === candidate.conI &&
      current.colI === candidate.colI &&
      (current.spnI ?? null) === (candidate.spnI ?? null) &&
      (current.nestI ?? null) === (candidate.nestI ?? null)
    ) {
      elementHoverIntentRef.current = { key, startedAt: now };
      return true;
    }

    // NOTE: UX tuned constants (ล็อกค่าไว้กัน behavior เปลี่ยน)
    const ELEMENT_MOVE_EDGE_DEAD_ZONE_PX = 14;
    const ELEMENT_MOVE_HOVER_INTENT_MS = 120;
    // dead-zone ขอบคอลัมน์: ผ่านขอบเร็วๆ ยังไม่เปลี่ยน target
    const colEl = findColumn(x, y);
    if (colEl) {
      const r = colEl.getBoundingClientRect();
      if (
        x <= r.left + ELEMENT_MOVE_EDGE_DEAD_ZONE_PX ||
        x >= r.right - ELEMENT_MOVE_EDGE_DEAD_ZONE_PX
      ) {
        return false;
      }
    }

    const prev = elementHoverIntentRef.current;
    if (prev.key !== key) {
      elementHoverIntentRef.current = { key, startedAt: now };
      return false;
    }
    return now - prev.startedAt >= ELEMENT_MOVE_HOVER_INTENT_MS;
  };

  const shouldShowSidebarPreview = (candidate, x, y) => {
    if (!candidate || typeof candidate !== "object") return false;
    const key = `${candidate.conI}:${candidate.colI}:${candidate.spnI ?? "-"}:${candidate.nestI ?? "-"}`;
    const now = Date.now();
    const prev = sidebarPreviewIntentRef.current;
    if (prev.key !== key) {
      sidebarPreviewIntentRef.current = { key, startedAt: now, x, y };
      return false;
    }
    // NOTE: UX tuned constants (ล็อกค่าไว้กัน behavior เปลี่ยน)
    const SIDEBAR_PREVIEW_STILLNESS_PX = 8;
    const SIDEBAR_PREVIEW_DWELL_MS = 90;
    const dx = Math.abs((Number(prev.x) || 0) - x);
    const dy = Math.abs((Number(prev.y) || 0) - y);
    const movedPx = Math.max(dx, dy);
    // ยังเคลื่อนอยู่ (ลากผ่าน): รีสตาร์ทตัวจับเวลา ไม่โชว์ preview
    if (movedPx > SIDEBAR_PREVIEW_STILLNESS_PX) {
      sidebarPreviewIntentRef.current = { key, startedAt: now, x, y };
      return false;
    }
    sidebarPreviewIntentRef.current = { key, startedAt: prev.startedAt, x, y };
    // หยุดนิ่งสั้น ๆ แล้วค่อยโชว์ preview
    return now - (Number(prev.startedAt) || now) >= SIDEBAR_PREVIEW_DWELL_MS;
  };


  const checkGhostPosition = (x, y, r) => {
    const GHOST_GRACE_PX = 22;
    const isNum = (n) => {
      return typeof n === "number" && !Number.isNaN(n);
    };
    return (
      r &&
      isNum(x) &&
      x >= r.left - GHOST_GRACE_PX &&
      x <= r.right + GHOST_GRACE_PX &&
      isNum(y) &&
      y >= r.top - GHOST_GRACE_PX &&
      y <= r.bottom + GHOST_GRACE_PX
    );
  };

  const clearGhost = () => {
    if (hoverRef.current) {
      cancelAnimationFrame(hoverRef.current);
      hoverRef.current = null;
    }

    dragToken.current += 1;

    setPreview(null);
    setDrop(null, null);
    carouselColWarnedRef.current = false;
    setCarouselColToastOpen(false);
    listImageColWarnedRef.current = false;
    setListImageColToastOpen(false);
    postColWarnedRef.current = false;
    setPostColToastOpen(false);
    dataSliderTypeWarnedRef.current = false;
    setDataSliderTypeToastOpen(false);
    activeDragRef.current = null;
    tabsInTabWarnedRef.current = false;
    setTabsInTabToastOpen(false);
    postInPostWarnedRef.current = false;
    setPostInPostToastOpen(false);
    blockedDropToastRef.current = null;
    resetListRunSnapState();
    resetEleInsertSnapState();
    resetTabInlineRowSnapState();
    elementHoverIntentRef.current = { key: "", startedAt: 0 };
    sidebarPreviewIntentRef.current = { key: "", startedAt: 0, x: 0, y: 0 };
  };

  const findColumn = (x, y) => {
    const el = document.elementFromPoint(x, y);
    const nearestNode = el?.closest("[data-drop='COLUMN']");
    if (!nearestNode) return;
    const node = nearestNode?.closest("[data-drop='COLUMN'][id*='/']");
    return node ?? nearestNode;
  };

  const findColumnFromStack = (x, y) => {
    const stack = document.elementsFromPoint(x, y) || [];
    let fallback = null;
    for (const node of stack) {
      if (!node || node.nodeType !== 1) continue;
      const hit = node.matches('[data-drop="COLUMN"]')
        ? node
        : node.closest('[data-drop="COLUMN"]');
      if (!hit) continue;
      if (!fallback) fallback = hit;
      const withScopedId = hit.closest('[data-drop="COLUMN"][id*="/"]');
      if (withScopedId) return withScopedId;
    }
    return fallback;
  };

  const findSpan = (x, y) => {
    const el = document.elementFromPoint(x, y);
    const node = el?.closest('[data-drop="SPAN"]');
    return node ?? null;
  };

  const findMiniSpan = (x, y) => {
    const el = document.elementFromPoint(x, y);
    const node = el?.closest('[data-drop="SPAN"]');
    return node ?? null;
  };

  const findElement = (x, y) => {
    const stack = document.elementsFromPoint(x, y) || [];
    const previewId = String(preview?.id || "");
    for (const node of stack) {
      if (!node || node.nodeType !== 1) continue;
      const hit = node.matches?.("[data-drop='ELEMENT']")
        ? node
        : node.closest?.("[data-drop='ELEMENT']");
      if (!hit) continue;
      // Ignore active ghost preview so insert-index does not get derived from ghost itself.
      if (ghostRef.current && ghostRef.current.contains(hit)) continue;
      if (hit.classList?.contains("preview")) continue;
      if (previewId && String(hit.getAttribute?.("id") || "") === previewId) continue;
      const scoped = hit.closest?.("[data-drop='ELEMENT'][id*='/']");
      return scoped ?? hit;
    }
    return null;
  };

  const findTabContent = (x, y) => {
    const stack = document.elementsFromPoint(x, y) || [];
    for (const node of stack) {
      if (!node || node.nodeType !== 1) continue;
      const hit = node.matches?.('[data-drop="TAB-CONTENT"]')
        ? node
        : node.closest?.('[data-drop="TAB-CONTENT"]');
      if (!hit) continue;
      if (ghostRef.current && ghostRef.current.contains(hit)) continue;
      return hit;
    }
    return null;
  };

  const findTabNestedItem = (x, y) => {
    const stack = document.elementsFromPoint(x, y) || [];
    let fallbackNested = null;
    for (const node of stack) {
      if (!node || node.nodeType !== 1) continue;
      const inlineRow = node.matches?.("[data-tab-inline-row-start]")
        ? node
        : node.closest?.("[data-tab-inline-row-start]");
      if (inlineRow) {
        if (ghostRef.current && ghostRef.current.contains(inlineRow)) continue;
        return inlineRow;
      }
      const hit = node.matches?.("[data-tab-nested-id]")
        ? node
        : node.closest?.("[data-tab-nested-id]");
      if (!hit) continue;
      if (ghostRef.current && ghostRef.current.contains(hit)) continue;
      fallbackNested = hit;
    }
    return fallbackNested;
  };

  /** แปลง id บน DOM ของ SPAN → id ของ span ใน layout (รองรับทั้ง con/col/Span-x และ Span-x) */
  const spanDomIdToSpanKey = (sid) => {
    if (!sid || typeof sid !== "string") return null;
    const parts = sid.split("/");
    if (parts.length >= 3) return parts[2];
    return sid;
  };

  /** แปลง id บน DOM ของ SPAN → id ของ nestedSpan ใน layout */
  const nestedSpanDomIdToKey = (raw) => {
    if (!raw || typeof raw !== "string") return null;
    return raw.includes("/") ? raw.split("/").pop() : raw;
  };

  /** ความกว้างเทียบหน่วยแถว 12 คอลัมน์ — รวม span / nestedSpan (ลากวาง Carousel ต้อง ≥ CAROUSEL_MIN_COL_UNITS) */
  const readCarouselTargetWidthUnits = (
    conI,
    colI,
    overSpan,
    overMiniSpan
  ) => {
    const col = layouts[conI]?.columns?.[colI];
    if (!col) return 0;
    const colSize = Number(col.size);
    if (!Number.isFinite(colSize) || colSize <= 0) return 0;
    if (!overSpan) return colSize;

    const sid = overSpan.getAttribute("id");
    const spnKey = spanDomIdToSpanKey(sid);
    if (!spnKey || !Array.isArray(col.spans)) return colSize;
    const span = col.spans.find((s) => s && s.id === spnKey);
    if (!span) return colSize;
    const spanSize = Number(span.size);
    const s = Number.isFinite(spanSize) && spanSize > 0 ? spanSize : 12;
    let units = (colSize * s) / 12;

    if (
      overMiniSpan &&
      Array.isArray(span.nestedSpans) &&
      span.nestedSpans.length > 0
    ) {
      const rawMs = overMiniSpan.getAttribute("id");
      const msKey = nestedSpanDomIdToKey(rawMs);
      if (msKey) {
        const ms = span.nestedSpans.find((m) => m && m.id === msKey);
        if (ms) {
          const msSize = Number(ms.size);
          if (Number.isFinite(msSize) && msSize > 0) {
            units = (colSize * s * msSize) / 144;
          }
        }
      }
    }
    return units;
  };

  const setColRef = (IDX, idx, el) => {
    if (isNull(IDX) || isNull(idx)) return;
    if (!columned.current[IDX]) columned.current[IDX] = [];
    columned.current[IDX][idx] = el || null;
  };
  const setSpnRef = (IDX, idx,sidx, el) => {
    if (isNull(IDX) || isNull(idx)) return;
    if (!spaned.current[IDX]) spaned.current[IDX] = [];
    if(isNull(sidx)){
      spaned.current[IDX][idx] = null
      setMspnRef(IDX,idx,null,null,null)
      return
    }
    if (!spaned.current[IDX][idx]) spaned.current[IDX][idx] = [];
    spaned.current[IDX][idx][sidx] = el || null;
  };

  const setMspnRef = (IDX, idx,sidx,msidx, el) => {
    if (isNull(IDX) || isNull(idx)) return;
    if (!nestedSpaned.current[IDX]) nestedSpaned.current[IDX] = [];
    if(isNull(sidx)){
      nestedSpaned.current[IDX][idx] = null
      return
    }
    if (!nestedSpaned.current[IDX][idx]) nestedSpaned.current[IDX][idx]= [];
    if(isNull(msidx)){
      nestedSpaned.current[IDX][idx][sidx] = null
      return
    }
    if (!nestedSpaned.current[IDX][idx][sidx]) nestedSpaned.current[IDX][idx][sidx] = [];
    nestedSpaned.current[IDX][idx][sidx][msidx] = el || null;
  };

  
  const setDropForElement = (
    conID,
    colID,
    overCol,
    overSpan,
    overMiniSpan,
    overEl,
    overTabContent,
    overTabNestedItem,
    mouseX,
    mouseY,
    element
  ) => {
    const blockedTabDropTarget = { blocked: true };
    blockedDropToastRef.current = null;
    const isCanvasElementMove =
      activeDragRef.current?.data?.current?.type === "ELEMENT";
    const conI = layouts.findIndex((l) => l.container.id === conID);
    if (conI === -1) return null;
    const colI = layouts[conI].columns.findIndex((c) => c.id === colID);
    if (colI === -1) return null;

    if (element?.type === "crl") {
      const w = readCarouselTargetWidthUnits(
        conI,
        colI,
        overSpan,
        overMiniSpan
      );
      if (!Number.isFinite(w) || w < CAROUSEL_STRICT_MIN_COL_UNITS) {
        blockedDropToastRef.current = "carousel";
        return null;
      }
    }

    if (element?.type === "tbl") {
      const w = readCarouselTargetWidthUnits(
        conI,
        colI,
        overSpan,
        overMiniSpan
      );
      if (!Number.isFinite(w) || w < TABLE_MIN_COL_UNITS) {
        blockedDropToastRef.current = "carousel";
        return null;
      }
    }

    if (element?.type === "btw") {
      const w = readCarouselTargetWidthUnits(
        conI,
        colI,
        overSpan,
        overMiniSpan
      );
      if (!Number.isFinite(w) || w < BETWEEN_MIN_COL_UNITS) {
        blockedDropToastRef.current = "carousel";
        return null;
      }
    }

    if (element?.type === "tabs") {
      const w = readCarouselTargetWidthUnits(
        conI,
        colI,
        overSpan,
        overMiniSpan
      );
      if (!Number.isFinite(w) || w < TABS_MIN_COL_UNITS) {
        blockedDropToastRef.current = "post";
        return null;
      }
    }

    if (element?.type === "acc") {
      const w = readCarouselTargetWidthUnits(
        conI,
        colI,
        overSpan,
        overMiniSpan
      );
      if (!Number.isFinite(w) || w < ACCORDION_MIN_COL_UNITS) {
        blockedDropToastRef.current = "carousel";
        return null;
      }
    }

    if (element?.type === "imgh" || element?.type === "imgo") {
      const w = readCarouselTargetWidthUnits(
        conI,
        colI,
        overSpan,
        overMiniSpan
      );
      if (!Number.isFinite(w) || w < IMAGE_HOVER_MIN_COL_UNITS) {
        blockedDropToastRef.current = "carousel";
        return null;
      }
    }

    if (element?.type === "post" || element?.type === "dts" || element?.type === "ctg") {
      const w = readCarouselTargetWidthUnits(
        conI,
        colI,
        overSpan,
        overMiniSpan
      );
      if (!Number.isFinite(w) || w < POST_MIN_COL_UNITS) {
        blockedDropToastRef.current = "post";
        return null;
      }
    }

    if (
      element?.type === "list" &&
      (element?.listImageElement === true || element?.listIconsElement === true)
    ) {
      const w = readCarouselTargetWidthUnits(
        conI,
        colI,
        overSpan,
        overMiniSpan
      );
      if (!Number.isFinite(w) || w < LIST_IMAGE_MIN_COL_UNITS) {
        blockedDropToastRef.current = "listImage";
        return null;
      }
    }

    const elements = layouts[conI].columns[colI].elements;
    const pickStableInsertIndex = (bucketLen, matchesBucket) => {
      const cur = dropTargetRef.current;
      if (!cur || cur.type !== "ELEMENT" || !cur.index) return null;
      if (!matchesBucket(cur.index)) return null;
      const prevI = cur.index.eleI;
      if (!Number.isInteger(prevI)) return null;
      if (prevI < 0 || prevI > bucketLen) return null;
      return prevI;
    };
    const buildTabDropTarget = (bucketElements, extraIndex = {}) => {
      if (!Array.isArray(bucketElements)) return null;
      let hostEleID = "";
      let tabId = "";
      if (overTabContent) {
        hostEleID = String(overTabContent.getAttribute("data-tab-element-id") || "");
        tabId = String(overTabContent.getAttribute("data-tab-id") || "");
      } else if (overEl) {
        const overElIdRaw = overEl.getAttribute("id") || "";
        const overEleID = String(overElIdRaw).split("/")[2] || "";
        const overHost = bucketElements.find((e) => e?.id === overEleID);
        if (
          overHost?.type === "tabs" ||
          overHost?.type === "acc" ||
          overHost?.type === "post" ||
          overHost?.type === "dts" ||
          overHost?.type === "ctg"
        ) {
          hostEleID = overEleID;
          const overItems = Array.isArray(overHost?.tabsItems)
            ? overHost.tabsItems
            : Array.isArray(overHost?.accordionItems)
              ? overHost.accordionItems
              : overHost?.type === "post"
                ? [{ id: "post-main", elements: overHost?.postElements }]
                : overHost?.type === "dts"
                  ? overHost?.dataSliderItems
                  : overHost?.type === "ctg"
                    ? mergeCatagoriesElement(overHost)?.catagoriesItems
                : [];
          const overActiveId = overHost?.type === "tabs"
            ? overHost?.tabsActiveId
            : overHost?.type === "acc"
              ? overHost?.accordionActiveId
              : overHost?.type === "dts"
                ? overHost?.dataSliderActiveId
                : overHost?.type === "ctg"
                  ? mergeCatagoriesElement(overHost)?.catagoriesActiveId
              : "post-main";
          const fallbackActiveId = overItems.some((t) => String(t?.id) === String(overActiveId))
            ? String(overActiveId)
            : String(overItems[0]?.id || "");
          tabId = fallbackActiveId;
        }
      }
      if (!hostEleID || !tabId) return null;
      const tabHostI = bucketElements.findIndex((e) => e?.id === hostEleID);
      if (tabHostI === -1) return null;
      const tabHost = bucketElements[tabHostI];
      const tabItems = tabHost?.type === "tabs"
        ? (Array.isArray(tabHost?.tabsItems) ? tabHost.tabsItems : [])
        : tabHost?.type === "acc"
          ? (Array.isArray(tabHost?.accordionItems) ? tabHost.accordionItems : [])
          : tabHost?.type === "post"
            ? [{ id: "post-main", elements: Array.isArray(tabHost?.postElements) ? tabHost.postElements : [] }]
            : tabHost?.type === "dts"
              ? (Array.isArray(tabHost?.dataSliderItems) ? tabHost.dataSliderItems : [])
              : tabHost?.type === "ctg"
                ? mergeCatagoriesElement(tabHost).catagoriesItems
          : [];
      if (!tabItems.length) return null;
      const tabObj = tabItems.find((t) => String(t?.id) === tabId);
      if (!tabObj || !Array.isArray(tabObj?.elements)) return null;
      const dropTargetType = element?.type;
      if (tabHost?.type === "tabs" && dropTargetType === "acc") {
        blockedDropToastRef.current = "tabsInTab";
        return blockedTabDropTarget;
      }
      if (tabHost?.type === "dts" || tabHost?.type === "ctg") {
        const incomingType = String(dropTargetType || "");
        if (
          incomingType === "tabs" ||
          incomingType === "acc" ||
          incomingType === "post" ||
          incomingType === "dts" ||
          incomingType === "ctg"
        ) {
          blockedDropToastRef.current = "dataSliderType";
          return blockedTabDropTarget;
        }
        const sourceElement =
          activeDragRef.current?.data?.current?.type === "ELEMENT"
            ? resolveLayoutElementByDragData(layouts, activeDragRef.current)
            : null;
        const elementToCheck = sourceElement || element;
        if (!isAllowedInDataSliderArea(elementToCheck)) {
          blockedDropToastRef.current = "dataSliderType";
          return blockedTabDropTarget;
        }
      }
      const getTabMidById = () => {
        const nestedNodes = Array.from(
          overTabContent?.querySelectorAll?.("[data-tab-nested-id]") || []
        );
        const midById = new Map();
        for (const node of nestedNodes) {
          const nestedId = String(node?.getAttribute?.("data-tab-nested-id") || "");
          if (!nestedId) continue;
          const nr = node.getBoundingClientRect();
          const nodeMidY = nr.top + nr.height / 2;
          if (!Number.isFinite(nodeMidY)) continue;
          if (!midById.has(nestedId)) midById.set(nestedId, nodeMidY);
        }
        return midById;
      };
      const midById = getTabMidById();
      const tabInsertByMid = computeInsertAtByOrderedElementMidY(
        tabObj.elements,
        midById,
        mouseY
      );
      let insertAt = tabObj.elements.length;
      if (!overTabNestedItem && overTabContent) {
        const rr = overTabContent.getBoundingClientRect();
        const edgeAssistPx = Math.min(52, Math.max(24, rr.height * 0.18));
        if (mouseY <= rr.top + edgeAssistPx) {
          insertAt = 0;
        } else if (mouseY >= rr.bottom - edgeAssistPx) {
          insertAt = tabObj.elements.length;
        } else {
          const cur = dropTargetRef.current;
          if (
            cur?.type === "TAB-ELEMENT" &&
            cur?.index?.tabEleID === hostEleID &&
            cur?.index?.tabId === tabId &&
            Number.isInteger(cur?.index?.tabEleI)
          ) {
            insertAt = Math.max(
              0,
              Math.min(tabObj.elements.length, cur.index.tabEleI)
            );
          } else if (String(dropTargetType || "") === "divider") {
            const byY = tabInsertByMid;
            if (Number.isInteger(byY)) insertAt = byY;
          }
        }
      }
      if (overTabNestedItem) {
        if (String(dropTargetType || "") === "divider") {
          const byY = tabInsertByMid;
          if (Number.isInteger(byY)) {
            insertAt = byY;
            insertAt = snapInsertOutsideInlineGroupByPointer(
              tabObj.elements,
              insertAt,
              mouseY,
              midById
            );
            setPreview(element);
            return {
              index: {
                conI,
                colI,
                ...extraIndex,
                eleI: tabHostI,
                tabEleID: hostEleID,
                tabId,
                tabEleI: insertAt,
              },
              type: "TAB-ELEMENT",
              isLast: insertAt >= tabObj.elements.length,
            };
          }
        }
        const inlineRowStartRaw = overTabNestedItem.getAttribute?.("data-tab-inline-row-start");
        const inlineRowEndRaw = overTabNestedItem.getAttribute?.("data-tab-inline-row-end");
        const inlineRowStart = Number(inlineRowStartRaw);
        const inlineRowEnd = Number(inlineRowEndRaw);
        if (
          Number.isInteger(inlineRowStart) &&
          Number.isInteger(inlineRowEnd) &&
          inlineRowStart >= 0 &&
          inlineRowEnd >= inlineRowStart
        ) {
          tabInlineRowSnapState = {
            key: `${hostEleID}:${tabId}:${inlineRowStart}:${inlineRowEnd}`,
            side: "end",
          };
          // Keep "no insert inside group", but allow before/after based on pointer.
          const rowRect = overTabNestedItem.getBoundingClientRect();
          const rowMidY = rowRect.top + rowRect.height / 2;
          insertAt = mouseY <= rowMidY ? inlineRowStart : inlineRowEnd + 1;
          insertAt = snapInsertOutsideInlineGroupByPointer(
            tabObj.elements,
            insertAt,
            mouseY,
            midById
          );
        } else {
        const nestedId = String(
          overTabNestedItem.getAttribute("data-tab-nested-id") || ""
        );
        const nestedI = tabObj.elements.findIndex(
          (el) => String(el?.id || "") === nestedId
        );
        if (nestedI >= 0) {
          const inlineGroup = getInlineRowGroupBounds(tabObj.elements, nestedI);
          if (inlineGroup) {
            // Keep "no insert inside group", but allow before/after the group.
            const rr = overTabNestedItem.getBoundingClientRect();
            const nestedMidY = rr.top + rr.height / 2;
            insertAt =
              mouseY <= nestedMidY ? inlineGroup.start : inlineGroup.end + 1;
          } else {
            const rr = overTabNestedItem.getBoundingClientRect();
            const nestedMidY = rr.top + rr.height / 2;
            insertAt = nestedI + (mouseY > nestedMidY ? 1 : 0);
          }
          insertAt = snapInsertOutsideInlineGroupByPointer(
            tabObj.elements,
            insertAt,
            mouseY,
            midById
          );
        }
        }
      } else {
        resetTabInlineRowSnapState();
      }
      if (
        !overTabNestedItem &&
        overTabContent &&
        Number.isInteger(tabInsertByMid) &&
        String(dropTargetType || "") !== "divider"
      ) {
        insertAt = tabInsertByMid;
      }
      insertAt = snapInsertOutsideInlineGroupByPointer(
        tabObj.elements,
        insertAt,
        mouseY,
        midById
      );
      setPreview(element);
      return {
        index: {
          conI,
          colI,
          ...extraIndex,
          eleI: tabHostI,
          tabEleID: hostEleID,
          tabId,
          tabEleI: insertAt,
        },
        type: "TAB-ELEMENT",
        isLast: insertAt >= tabObj.elements.length,
      };
    };

    const [_, id] = overCol.getAttribute("id").split("/");
    if (overSpan) {
      const sid = overSpan.getAttribute("id");
      const spnKey = spanDomIdToSpanKey(sid);
      let spnI = layouts[conI].columns[colI].spans.findIndex(
        (s) => s.id === spnKey
      );
      if (spnI === -1) return;
      const msKey = overMiniSpan
        ? nestedSpanDomIdToKey(overMiniSpan.getAttribute("id"))
        : null;
      const nestI = msKey
        ? layouts[conI].columns[colI].spans[spnI].nestedSpans.findIndex(
            (ms) => ms.id === msKey
          )
        : -1;
      if (Number.isInteger(nestI) && nestI >= 0) {
        const miniNode = overMiniSpan;
        const eleMspn =
          layouts[conI].columns[colI].spans[spnI]?.nestedSpans[nestI]?.elements;
        if (!eleMspn) return;
        const tabDropTarget = buildTabDropTarget(eleMspn, { spnI, nestI });
        if (tabDropTarget?.blocked) return null;
        if (tabDropTarget) return tabDropTarget;
        const rectMspn =
          miniNode && typeof miniNode.getBoundingClientRect === "function"
            ? miniNode.getBoundingClientRect()
            : overMiniSpan?.getBoundingClientRect?.();
        if (!rectMspn) return;
        if (mouseY < rectMspn.top || mouseY > rectMspn.bottom) return;
        setPreview(element);
        if (!eleMspn.length) {
          return {
            index: { conI, colI, spnI, nestI, eleI: 0 },
            type: "ELEMENT",
            isLast: false,
          };
        }
        /* ช่วยให้ "วางบนสุด" ง่ายขึ้นเฉพาะตอนลาก element ใหม่จาก sidebar */
        if (!isCanvasElementMove) {
          const miniTopInsertAssistPx = Math.min(
            56,
            Math.max(28, rectMspn.height * 0.22)
          );
          if (mouseY <= rectMspn.top + miniTopInsertAssistPx) {
            return {
              index: { conI, colI, spnI, nestI, eleI: 0 },
              type: "ELEMENT",
              isLast: false,
            };
          }
        }
        if (!overEl) {
          const stableI = pickStableInsertIndex(
            eleMspn.length,
            (idxObj) =>
              idxObj.conI === conI &&
              idxObj.colI === colI &&
              idxObj.spnI === spnI &&
              idxObj.nestI === nestI
          );
          if (stableI != null) {
            return {
              index: { conI, colI, spnI, nestI, eleI: stableI },
              type: "ELEMENT",
              isLast: stableI === eleMspn.length,
            };
          }
          const firstNode = findDropElementNodeByEleId(eleMspn[0]?.id);
          if (firstNode) {
            const firstRect = firstNode.getBoundingClientRect();
            if (mouseY <= firstRect.top + firstRect.height / 2) {
              return { index: { conI, colI, spnI, nestI, eleI: 0 }, type: "ELEMENT", isLast: false };
            }
          }
          return { index: { conI, colI, spnI, nestI, eleI: eleMspn.length }, type: "ELEMENT", isLast: true };
        }
        const rectEl = overEl.getBoundingClientRect();
        const mid = rectEl.top + rectEl.height / 2;
        const eleID = String(overEl.getAttribute("id") || "")
          .split("/")
          .pop();
        const hitI = eleMspn.findIndex((e) => e.id === eleID);
        if (hitI === -1) {
          return {
            index: { conI, colI, spnI, nestI, eleI: eleMspn.length },
            type: "ELEMENT",
            isLast: true,
          };
        }
        let eleI = computeStableElementInsertIndex({
          eleBucket: eleMspn,
          bucketKey: `${conI}:${colI}:${spnI}:${nestI}`,
          hitI,
          eleID,
          mouseY,
          midY: mid,
        });
        eleI = snapInsertOutsideConsecutiveLists(eleMspn, eleI, hitI, mouseY);
        eleI = snapInsertOutsideInlineGroupByPointer(
          eleMspn,
          eleI,
          mouseY,
          collectElementMidById(eleMspn)
        );
        return {
          index: { conI, colI, spnI, nestI, eleI },
          type: "ELEMENT",
          isLast: eleI === eleMspn.length,
        };
      } else {
        const eleSpn = layouts[conI].columns[colI].spans[spnI]?.elements;
        if (!eleSpn) return;
        const tabDropTarget = buildTabDropTarget(eleSpn, { spnI });
        if (tabDropTarget?.blocked) return null;
        if (tabDropTarget) return tabDropTarget;
        const rectSpn = overSpan.getBoundingClientRect();
        if (mouseY < rectSpn.top || mouseY > rectSpn.bottom) return;
        setPreview(element);

        if (!eleSpn.length) {
          return {
            index: { conI, colI, spnI, eleI: 0 },
            type: "ELEMENT",
            isLast: false,
          };
        }
        /* ช่วยให้ "วางบนสุด" ง่ายขึ้นเฉพาะตอนลาก element ใหม่จาก sidebar */
        if (!isCanvasElementMove) {
          const spanTopInsertAssistPx = Math.min(
            56,
            Math.max(28, rectSpn.height * 0.22)
          );
          if (mouseY <= rectSpn.top + spanTopInsertAssistPx) {
            return {
              index: { conI, colI, spnI, eleI: 0 },
              type: "ELEMENT",
              isLast: false,
            };
          }
        }

        if (!overEl) {
          const stableI = pickStableInsertIndex(
            eleSpn.length,
            (idxObj) =>
              idxObj.conI === conI &&
              idxObj.colI === colI &&
              idxObj.spnI === spnI &&
              idxObj.nestI == null
          );
          if (stableI != null) {
            return {
              index: { conI, colI, spnI, eleI: stableI },
              type: "ELEMENT",
              isLast: stableI === eleSpn.length,
            };
          }
          const firstNode = findDropElementNodeByEleId(eleSpn[0]?.id);
          if (firstNode) {
            const firstRect = firstNode.getBoundingClientRect();
            if (mouseY <= firstRect.top + firstRect.height / 2) {
              return { index: { conI, colI, spnI, eleI: 0 }, type: "ELEMENT", isLast: false };
            }
          }
          return { index: { conI, colI, spnI, eleI: eleSpn.length }, type: "ELEMENT", isLast: true };
        }

        const rectEl = overEl.getBoundingClientRect();
        const mid = rectEl.top + rectEl.height / 2;
        const eleID = String(overEl.getAttribute("id") || "")
          .split("/")
          .pop();
        const hitI = eleSpn.findIndex((e) => e.id === eleID);
        if (hitI === -1) {
          return {
            index: { conI, colI, spnI, eleI: eleSpn.length },
            type: "ELEMENT",
            isLast: true,
          };
        }
        let eleI = computeStableElementInsertIndex({
          eleBucket: eleSpn,
          bucketKey: `${conI}:${colI}:${spnI}`,
          hitI,
          eleID,
          mouseY,
          midY: mid,
        });
        eleI = snapInsertOutsideConsecutiveLists(eleSpn, eleI, hitI, mouseY);
        eleI = snapInsertOutsideInlineGroupByPointer(
          eleSpn,
          eleI,
          mouseY,
          collectElementMidById(eleSpn)
        );
        return {
          index: { conI, colI, spnI, eleI },
          type: "ELEMENT",
          isLast: eleI === eleSpn.length,
        };
      }
    } else {
      // ใน normal section: Column.jsx render inner div ด้วย id="colId" (ไม่มี container prefix)
      // ใน split section: ไม่มี Column.jsx wrapper → fallback ใช้ overCol (SortableColumnItem) แทน
      const column = document.querySelector(`[data-drop="COLUMN"][id="${id}"]`) ?? overCol;
      if (!column) return;
      const rectCol = column.getBoundingClientRect();
      const outerCol = overCol.getBoundingClientRect();
      if (mouseY < outerCol.top || mouseY > outerCol.bottom) return;
      const { top, bottom } = rectCol;
      if (mouseY < top || mouseY > bottom) return;

      const tabDropTarget = buildTabDropTarget(elements);
      if (tabDropTarget?.blocked) return null;
      if (tabDropTarget) return tabDropTarget;
      setPreview(element);

      if (!elements.length) {
        return {
          index: { conI, colI, eleI: 0 },
          type: "ELEMENT",
          isLast: false,
        };
      }

      if (!overEl) {
        const stableI = pickStableInsertIndex(
          elements.length,
          (idxObj) =>
            idxObj.conI === conI &&
            idxObj.colI === colI &&
            idxObj.spnI == null &&
            idxObj.nestI == null
        );
        if (stableI != null) {
          return {
            index: { conI, colI, eleI: stableI },
            type: "ELEMENT",
            isLast: stableI === elements.length,
          };
        }
        const firstNode = findDropElementNodeByEleId(elements[0]?.id);
        if (firstNode) {
          const firstRect = firstNode.getBoundingClientRect();
          if (mouseY <= firstRect.top + firstRect.height / 2) {
            return { index: { conI, colI, eleI: 0 }, type: "ELEMENT", isLast: false };
          }
        }
        return { index: { conI, colI, eleI: elements.length }, type: "ELEMENT", isLast: true };
      }

      const rectEl = overEl.getBoundingClientRect();
      const mid = rectEl.top + rectEl.height / 2;
      const eleID = String(overEl.getAttribute("id") || "")
        .split("/")
        .pop();
      const hitI = elements.findIndex((e) => e.id === eleID);
      if (hitI === -1) {
        return {
          index: { conI, colI, eleI: elements.length },
          type: "ELEMENT",
          isLast: true,
        };
      }
      let eleI = computeStableElementInsertIndex({
        eleBucket: elements,
        bucketKey: `${conI}:${colI}`,
        hitI,
        eleID,
        mouseY,
        midY: mid,
      });
      eleI = snapInsertOutsideConsecutiveLists(elements, eleI, hitI, mouseY);
      eleI = snapInsertOutsideInlineGroupByPointer(
        elements,
        eleI,
        mouseY,
        collectElementMidById(elements)
      );
      return {
        index: { conI, colI, eleI },
        type: "ELEMENT",
        isLast: eleI === elements.length,
      };
    }
  };

  const updateHoverFromPoint = (x, y, type, element) => {
    const set_2_null = () => {
      if (type === "ELEMENT" && Date.now() < dropHoldUntilRef.current) return;
      setPreview(null);
      setDrop(null, null);
    };

    /* ระหว่างลากผ่าน: แค่ block เป้าหมาย ไม่แจ้ง toast */
    if (type === "ELEMENT" && (element?.type === "tabs" || element?.type === "dts" || element?.type === "ctg")) {
      const tabContent = findTabContent(x, y);
      const tabNested = findTabNestedItem(x, y);
      if (tabContent || tabNested) {
        const hostIdRaw =
          tabContent?.getAttribute?.("data-tab-element-id") ||
          tabNested?.closest?.("[data-tab-element-id]")?.getAttribute?.("data-tab-element-id") ||
          "";
        const hostEl = hostIdRaw
          ? findLayoutElementById(layouts, String(hostIdRaw))
          : null;
        blockedDropToastRef.current =
          hostEl?.type === "dts" || hostEl?.type === "ctg"
            ? "dataSliderType"
            : "tabsInTab";
        set_2_null();
        return;
      }
    }

    if (type === "ELEMENT" && element?.type === "post") {
      const tabContent = findTabContent(x, y);
      const tabNested = findTabNestedItem(x, y);
      const hostIdRaw =
        tabContent?.getAttribute?.("data-tab-element-id") ||
        tabNested?.closest?.("[data-tab-element-id]")?.getAttribute?.("data-tab-element-id") ||
        "";
      const hostEl = hostIdRaw
        ? findLayoutElementById(layouts, String(hostIdRaw))
        : null;
      if ((tabContent || tabNested) && hostEl?.type === "post") {
        blockedDropToastRef.current = "postInPost";
        set_2_null();
        return;
      }
    }

    if (ghostRef.current) {
      const r = ghostRef.current.getBoundingClientRect();
      const stillOnGhost = checkGhostPosition(x, y, r);
      const hasDropTarget =
        dropTargetRef.current &&
        dropTargetRef.current.type &&
        (dropTargetRef.current.type === "SECTION"
          ? typeof dropTargetRef.current.index === "number"
          : dropTargetRef.current.type === "TAB-ELEMENT"
            ? dropTargetRef.current.index &&
              Number.isInteger(dropTargetRef.current.index.conI) &&
              Number.isInteger(dropTargetRef.current.index.colI) &&
              Number.isInteger(dropTargetRef.current.index.eleI) &&
              Number.isInteger(dropTargetRef.current.index.tabEleI) &&
              typeof dropTargetRef.current.index.tabEleID === "string" &&
              typeof dropTargetRef.current.index.tabId === "string"
          : dropTargetRef.current.index &&
            Number.isInteger(dropTargetRef.current.index.conI) &&
            (Number.isInteger(dropTargetRef.current.index.colI) ||
              Array.isArray(dropTargetRef.current.index.colI)) &&
            Number.isInteger(dropTargetRef.current.index.eleI));
      /** ลากจาก sidebar (ELEMENT) หรือ SECTION: ถ้ายังอยู่บน Ghost อย่าคำนวณซ้ำ — กัน elementFromPoint ไปโดน element ใต้ Ghost ทำให้สลับ index กระพริบ */
      if (stillOnGhost && hasDropTarget) {
        return;
      }
    }

    if (type === "SECTION") {
      setPreview(element);
      if (!layouts.length) {
        setDrop(0, "SECTION", null);
        return;
      }

      // Ignore SECTION ghosts (.preview) — otherwise id is preview.container.id, findIndex
      // misses layouts and drop jumps wrong (e.g. beside Split when dragging new Span).
      const stack = document.elementsFromPoint(x, y) || [];
      let section = null;
      for (const node of stack) {
        // nodeType 1 = ELEMENT_NODE — อย่าใช้ instanceof Element เพราะชื่อ Element ถูก import จาก ./Layouts/Element
        if (!node || node.nodeType !== 1) continue;
        const hit = node.matches('[data-drop="SECTION"]')
          ? node
          : node.closest('[data-drop="SECTION"]');
        if (hit && !hit.classList.contains("preview")) {
          section = hit;
          break;
        }
      }
      if (!section) {
        setDrop(layouts.length, "SECTION", true);
        return;
      }

      const conR = section.getBoundingClientRect();
      const id = section?.getAttribute("id");
      const index = computeSectionPhysicalInsertIndex(layouts, id, conR, y);
      setDrop(index, "SECTION", index === layouts.length);
    } else if (type === "ELEMENT") {
      const column =
        findColumn(x, y) ||
        (element?.type === "list" && element?.listIconsElement === true
          ? findColumnFromStack(x, y)
          : null);
      if (!column) {
        const keepListIconsDrop =
          element?.type === "list" &&
          element?.listIconsElement === true &&
          dropTargetRef.current?.type === "ELEMENT" &&
          dropTargetRef.current?.index &&
          Number.isInteger(dropTargetRef.current.index.conI) &&
          Number.isInteger(dropTargetRef.current.index.eleI);
        if (keepListIconsDrop) return;
        set_2_null();
        return;
      }
      const idFormCol = column?.getAttribute("id");
      if (!idFormCol) {
        const keepListIconsDrop =
          element?.type === "list" &&
          element?.listIconsElement === true &&
          dropTargetRef.current?.type === "ELEMENT" &&
          dropTargetRef.current?.index &&
          Number.isInteger(dropTargetRef.current.index.conI) &&
          Number.isInteger(dropTargetRef.current.index.eleI);
        if (keepListIconsDrop) return;
        set_2_null();
        return;
      }
      const resolvedColPath = resolveLayoutColumnPathFromDom(column);
      if (!resolvedColPath?.conID || !resolvedColPath?.colID) {
        set_2_null();
        return;
      }
      const { conID, colID } = resolvedColPath;
      const EL = findElement(x, y);
      const tabContent = findTabContent(x, y);
      const tabNestedItem = findTabNestedItem(x, y);
      const span = findSpan(x, y);
      const nestedSpan = findMiniSpan(x, y);
      const dropElement = setDropForElement(
        conID,
        colID,
        column,
        span,
        nestedSpan,
        EL,
        tabContent,
        tabNestedItem,
        x,
        y,
        element
      );
      if (dropElement) blockedDropToastRef.current = null;
      if (!dropElement) {
        set_2_null();
        return;
      }
      const isSidebarElementDrag =
        activeDragRef.current?.data?.current?.type !== "ELEMENT";
      if (isSidebarElementDrag) {
        if (
          dropElement?.type === "ELEMENT" ||
          dropElement?.type === "TAB-ELEMENT"
        ) {
          const canShowSidebarPreview = shouldShowSidebarPreview(
            dropElement.index,
            x,
            y
          );
          if (!canShowSidebarPreview) {
            setPreview(null);
            setDrop(null, null);
            // Sidebar pass-through phase: do not keep/commit any drop target,
            // otherwise mini span can expand while no preview is shown.
            return;
          }
        } else {
          setPreview(null);
        }
      }
      if (
        dropElement?.type === "ELEMENT" &&
        !shouldCommitElementDropTarget(dropElement.index, x, y)
      ) {
        if (isSidebarElementDrag) {
          setDrop(null, null);
        }
        return;
      }
      setDrop({ ...dropElement?.index }, dropElement.type, dropElement.isLast);
    }
  };

  const scheduleHoverUpdate = (e, type, element) => {
    const { clientX, clientY } = e;
    const token = dragToken.current;
    if (hoverRef.current) cancelAnimationFrame(hoverRef.current);
    hoverRef.current = requestAnimationFrame(() => {
      hoverRef.current = null;
      if (token !== dragToken.current) return;
      autoScrollCanvasForPointer(clientY);
      updateHoverFromPoint(clientX, clientY, type, element);
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }) // กันคลิกพลาด
  );

  const containerIds = useMemo(() => {
    const ids = [];
    const seenSplitRows = new Set();
    for (const l of layouts) {
      if (l.splitRowId) {
        if (!seenSplitRows.has(l.splitRowId)) {
          seenSplitRows.add(l.splitRowId);
          ids.push(l.splitRowId);
        }
      } else {
        ids.push(String(l.container.id));
      }
    }
    return ids;
  }, [layouts]);

  const measuring = {
    droppable: {
      strategy: MeasuringStrategy.Always, // ช่วยให้คำนวณตำแหน่งสด ใหม่ ลื่นขึ้น
    },
  };

  const openModal = (data = null) => {
    if (data) {
      const { id, funct } = data;
      setModal({ id, funct });
    } else {
      setModal(null);
    }
  };

  const PRESET_STORAGE_KEY = "wb:col-presets:v1";

  const openColumnPresetModal = (payload) => {
    setColumnPresetModal({
      open: true,
      name: String(payload?.defaultName || "PRESET Column"),
      error: "",
      payload: payload || null,
    });
  };

  const closeColumnPresetModal = () => {
    setColumnPresetModal((prev) => ({
      ...prev,
      open: false,
      error: "",
      payload: null,
    }));
    setPinnedColumnOptionId(null);
  };

  const saveColumnPresetToLocalStorage = () => {
    const modalPayload = columnPresetModal?.payload;
    const currentColumn = modalPayload?.column;
    if (!currentColumn || typeof currentColumn !== "object") {
      setColumnPresetModal((prev) => ({ ...prev, error: "ไม่พบข้อมูลคอลัมน์" }));
      return;
    }
    const trimmedName = String(columnPresetModal?.name || "").trim();
    if (!trimmedName) {
      setColumnPresetModal((prev) => ({ ...prev, error: "กรุณาตั้งชื่อ PRESET" }));
      return;
    }
    const now = Date.now();
    const presetRecord = {
      id: `preset-${Math.random().toString(36).slice(2, 10)}-${now.toString(36)}`,
      name: trimmedName,
      createdAt: now,
      updatedAt: now,
      source: {
        ...(modalPayload?.source || {}),
      },
      payload: {
        column: JSON.parse(JSON.stringify(currentColumn)),
      },
    };
    try {
      const raw = localStorage.getItem(PRESET_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      const next = {
        version: 1,
        presets: Array.isArray(parsed?.presets)
          ? [...parsed.presets, presetRecord]
          : [presetRecord],
      };
      localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(next));
      closeColumnPresetModal();
      setPresetSavedToastOpen(true);
    } catch (_) {
      setColumnPresetModal((prev) => ({ ...prev, error: "บันทึกไม่สำเร็จ กรุณาลองใหม่" }));
    }
  };

  const readColumnPresetsFromStorage = () => {
    try {
      const raw = localStorage.getItem(PRESET_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      const list = Array.isArray(parsed?.presets) ? parsed.presets : [];
      return list;
    } catch (_) {
      return [];
    }
  };
  const formatPresetUpdatedAt = (value) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${dd}-${mm}-${yyyy} ${hh}:${min}`;
  };
  const formatPresetDisplayName = (value) => {
    const raw = String(value || "PRESET");
    const chars = Array.from(raw);
    if (chars.length <= 28) return raw;
    return `${chars.slice(0, 28).join("")} .....`;
  };

  const openColumnPresetLoadModal = (payload) => {
    const presets = readColumnPresetsFromStorage();
    setPresetDeleteConfirmId(null);
    setColumnPresetLoadModal({
      open: true,
      source: payload?.source || null,
      presets,
      error: "",
    });
  };
  const deleteColumnPresetFromLocalStorage = (presetId) => {
    const targetId = String(presetId || "").trim();
    if (!targetId) return;
    try {
      const raw = localStorage.getItem(PRESET_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      const current = Array.isArray(parsed?.presets) ? parsed.presets : [];
      const nextPresets = current.filter(
        (preset) => String(preset?.id || "") !== targetId
      );
      localStorage.setItem(
        PRESET_STORAGE_KEY,
        JSON.stringify({
          version: 1,
          presets: nextPresets,
        })
      );
      setColumnPresetLoadModal((prev) => ({
        ...prev,
        presets: nextPresets,
        error: "",
      }));
      setPresetDeleteConfirmId(null);
    } catch (_) {
      setColumnPresetLoadModal((prev) => ({
        ...prev,
        error: "ลบ PRESET ไม่สำเร็จ กรุณาลองใหม่",
      }));
    }
  };

  const closeColumnPresetLoadModal = () => {
    setPresetDeleteConfirmId(null);
    setColumnPresetLoadModal({
      open: false,
      source: null,
      presets: [],
      error: "",
    });
    setPinnedColumnOptionId(null);
  };

  const preparePresetColumnForTarget = (rawPresetColumn, targetColId) => {
    const presetColumn = lodash.cloneDeep(rawPresetColumn || {});
    const makeElementId = (originalId) => {
      const prefix = String(originalId || "Ele").split("-")[0] || "Ele";
      return `${prefix}-${Math.ceil(Math.random() * 1e9).toString(36)}`;
    };
    const rewriteElementList = (list) =>
      (Array.isArray(list) ? list : []).map((item) => ({
        ...lodash.cloneDeep(item),
        id: makeElementId(item?.id),
      }));

    presetColumn.id = targetColId;
    if (presetColumn.isSpan && Array.isArray(presetColumn.spans)) {
      const colKey = String(targetColId || "").replace("Col-", "");
      presetColumn.spans = presetColumn.spans.map((sp, sidx) => {
        const elements = rewriteElementList(sp?.elements);
        return {
          ...sp,
          id: `Span-${colKey}-${sidx}`,
          elements,
          latestEleID: elements.length,
          hasNestedSpan: false,
          nestedSpans: [],
          latestNestedSpanID: 0,
        };
      });
      presetColumn.latestSpanID = presetColumn.spans.length;
      presetColumn.elements = [];
      presetColumn.latestEleID = 0;
    } else {
      const elements = rewriteElementList(presetColumn.elements);
      presetColumn.elements = elements;
      presetColumn.latestEleID = elements.length;
      delete presetColumn.spans;
      presetColumn.latestSpanID = 0;
    }
    return presetColumn;
  };

  const extractPresetElementsForSpanTarget = (presetRecord) => {
    const presetColumn = presetRecord?.payload?.column;
    if (!presetColumn || typeof presetColumn !== "object") return [];
    const makeElementId = (originalId) => {
      const prefix = String(originalId || "Ele").split("-")[0] || "Ele";
      return `${prefix}-${Math.ceil(Math.random() * 1e9).toString(36)}`;
    };
    const rewriteElementList = (list) =>
      (Array.isArray(list) ? list : [])
        .filter((item) => item && typeof item === "object" && typeof item.type === "string")
        .map((item) => ({
          ...lodash.cloneDeep(item),
          id: makeElementId(item?.id),
        }));

    if (Array.isArray(presetColumn.elements) && presetColumn.elements.length > 0) {
      return rewriteElementList(presetColumn.elements);
    }
    if (presetColumn.isSpan && Array.isArray(presetColumn.spans)) {
      const merged = [];
      presetColumn.spans.forEach((sp) => {
        if (Array.isArray(sp?.elements) && sp.elements.length > 0) {
          merged.push(...sp.elements);
        }
      });
      return rewriteElementList(merged);
    }
    return [];
  };

  const applyColumnPresetToTarget = (presetRecord) => {
    const src = columnPresetLoadModal?.source;
    if (!src?.conID || !src?.colID) {
      setColumnPresetLoadModal((prev) => ({ ...prev, error: "ไม่พบคอลัมน์เป้าหมาย" }));
      return;
    }
    const secI = layouts.findIndex((l) => l.container?.id === src.conID);
    if (secI === -1) {
      setColumnPresetLoadModal((prev) => ({ ...prev, error: "ไม่พบ Section เป้าหมาย" }));
      return;
    }
    const colI = layouts[secI]?.columns?.findIndex((c) => c.id === src.colID);
    if (!Number.isInteger(colI) || colI < 0) {
      setColumnPresetLoadModal((prev) => ({ ...prev, error: "ไม่พบ Column เป้าหมาย" }));
      return;
    }
    if (src?.spnID) {
      const spnI = layouts[secI]?.columns?.[colI]?.spans?.findIndex(
        (s) => String(s?.id || "") === String(src.spnID)
      );
      if (!Number.isInteger(spnI) || spnI < 0) {
        setColumnPresetLoadModal((prev) => ({ ...prev, error: "ไม่พบ Span เป้าหมาย" }));
        return;
      }
      const elements = extractPresetElementsForSpanTarget(presetRecord);
      const nextLayouts = lodash.cloneDeep(layouts);
      nextLayouts[secI].columns[colI].spans[spnI].elements = elements;
      nextLayouts[secI].columns[colI].spans[spnI].latestEleID = elements.length;
      setLayout(nextLayouts);
      closeColumnPresetLoadModal();
      setPresetLoadedToastOpen(true);
      return;
    }
    const presetColumn = presetRecord?.payload?.column;
    if (!presetColumn || typeof presetColumn !== "object") {
      setColumnPresetLoadModal((prev) => ({ ...prev, error: "Preset ไม่ถูกต้อง" }));
      return;
    }
    const makeElementId = (originalId) => {
      const prefix = String(originalId || "Ele").split("-")[0] || "Ele";
      return `${prefix}-${Math.ceil(Math.random() * 1e9).toString(36)}`;
    };
    const rewriteElementList = (list) =>
      (Array.isArray(list) ? list : [])
        .filter((item) => item && typeof item === "object" && typeof item.type === "string")
        .map((item) => ({
          ...lodash.cloneDeep(item),
          id: makeElementId(item?.id),
        }));

    const nextLayouts = lodash.cloneDeep(layouts);
    const targetColumn = nextLayouts?.[secI]?.columns?.[colI];
    if (!targetColumn || typeof targetColumn !== "object") {
      setColumnPresetLoadModal((prev) => ({ ...prev, error: "ไม่พบ Column เป้าหมาย" }));
      return;
    }

    // โหลดเฉพาะ element ของ preset และคงค่า size/โครงสร้างของคอลัมน์เป้าหมายเดิม
    if (targetColumn.isSpan && Array.isArray(targetColumn.spans)) {
      const presetSpans = Array.isArray(presetColumn?.spans) ? presetColumn.spans : [];
      const fallbackElements = rewriteElementList(presetColumn?.elements);
      targetColumn.spans = targetColumn.spans.map((sp, idx) => {
        const byIndexElements = rewriteElementList(presetSpans?.[idx]?.elements);
        const nextElements = byIndexElements.length
          ? byIndexElements
          : idx === 0
            ? fallbackElements
            : [];
        return {
          ...sp,
          elements: nextElements,
          latestEleID: nextElements.length,
        };
      });
      targetColumn.latestEleID = 0;
      targetColumn.elements = [];
    } else {
      const mergedElements = rewriteElementList(
        Array.isArray(presetColumn?.elements) && presetColumn.elements.length
          ? presetColumn.elements
          : Array.isArray(presetColumn?.spans)
            ? presetColumn.spans.flatMap((sp) =>
                Array.isArray(sp?.elements) ? sp.elements : []
              )
            : []
      );
      targetColumn.elements = mergedElements;
      targetColumn.latestEleID = mergedElements.length;
      delete targetColumn.spans;
      targetColumn.latestSpanID = 0;
    }

    setLayout(nextLayouts);
    closeColumnPresetLoadModal();
    setPresetLoadedToastOpen(true);
  };

  const noLayoutAnimWhileSorting = (args) => {
    if (args.isSorting || args.wasDragging) return false;
    return defaultAnimateLayoutChanges(args);
  };

  /** ให้ latestColID ไม่ต่ำกว่า (max suffix ของ Col-{section}-{n} + 1) — กัน id ซ้ำเมื่อ offcanvas ส่งค่าเก่า */
  const syncContainerLatestColId = (container, columns) => {
    const idParts = String(container?.id ?? "").split("-");
    const sectionKey = idParts.length >= 2 ? idParts[1] : "";
    let maxN = -1;
    for (const col of columns || []) {
      const p = String(col?.id ?? "").split("-");
      if (p[0] === "Col" && p[1] == sectionKey && p.length >= 3) {
        const n = parseInt(p[2], 10);
        if (Number.isFinite(n)) maxN = Math.max(maxN, n);
      }
    }
    const fromCols = maxN + 1;
    const cur = Number(container?.latestColID);
    return {
      ...container,
      latestColID: Math.max(
        fromCols,
        Number.isFinite(cur) ? cur : 0
      ),
    };
  };

  const updateContainer = (data, id) => {

    console.log(id,data);
    /* ต้องใช้ updater — ถ้าใช้ layouts จาก closure จะทับ layout ล่าสุด (เช่น หลังโคลนคอลัมน์) เมื่อแผง Section ยิง onUpdate จาก setData sync */
    setLayout((prev) => {
      const newLayouts = lodash.cloneDeep(prev);
      const idx = newLayouts.findIndex((l) => l.container.id === id);
      if (idx === -1) return prev;
      const merged = { ...newLayouts[idx].container, ...data };
      newLayouts[idx].container = syncContainerLatestColId(merged, newLayouts[idx].columns);

      // sync paddingTop/paddingBottom/overlap ไปยัง paired split section
      const splitRowId = newLayouts[idx].splitRowId;
      if (splitRowId) {
        const syncKeys = [
          "paddingTop", "paddingBottom","isFluid",
          "sectionOverlapTop", "sectionOverlapTopDesktop",
          "sectionOverlapTopTablet", "sectionOverlapTopMobile",
        ];
        const syncFields = {};
        syncKeys.forEach((k) => { if (k in data) syncFields[k] = data[k]; });
        if (Object.keys(syncFields).length > 0) {
          newLayouts.forEach((l, i) => {
            if (i !== idx && l.splitRowId === splitRowId) {
              l.container = { ...l.container, ...syncFields };
            }
          });
        }
      }

      return newLayouts;
    });
  };

  const cloneContainer = (id) => {
    const targetLayout = layouts.find((l) => l.container?.id === id);
    if (targetLayout?.splitRowId) {
      // Clone all sections of the split row as a group
      const splitRowId = targetLayout.splitRowId;
      const splitSections = layouts.filter((l) => l.splitRowId === splitRowId);
      const lastIdx = layouts.findLastIndex((l) => l.splitRowId === splitRowId);
      if (lastIdx === -1) return;
      const newLayouts = lodash.cloneDeep(layouts);
      const newSplitRowId = `SplitRow-${page.latestID}`;
      const clonedSections = splitSections.map((sec, si) => {
        const newSec = lodash.cloneDeep(sec);
        const suffix = si === 0 ? "L" : "R";
        newSec.container.id = `Sec-${page.latestID}${suffix}`;
        newSec.splitRowId = newSplitRowId;
        let latestColID = 0;
        newSec.columns?.forEach((col) => {
          col.id = `Col-${page.latestID}${suffix}-${latestColID++}`;
          col.elements?.forEach((e) => {
            e.id = e.id.split("-")[0] + "-" + Math.ceil(Math.random() * 1e9).toString(36);
          });
        });
        newSec.container.latestColID = latestColID;
        return newSec;
      });
      newLayouts.splice(lastIdx + 1, 0, ...clonedSections);
      setLayout(newLayouts);
      setPage((prev) => ({ ...prev, latestID: prev.latestID + 1 }));
      return;
    }
    const idx = layouts.findIndex((l) => l.container.id === id);
    const newLayouts = lodash.cloneDeep(layouts);
    const newLayout = lodash.cloneDeep(newLayouts[idx]);
    newLayout.container.id = `Sec-${page.latestID}`;
    if(newLayout?.columns){
      let latestColID = 0;
      newLayout.columns.map((col) => {
        col.id = `Col-${page.latestID}-${latestColID++}`;
        let latestSpanID = 0;
        if (col.isSpan) {
          col.spans.map((s, i) => {
            const newID = col.id.replace("Col-", "");
            s.id = `Span-${newID}-${latestSpanID}`;
            s.hasNestedSpan = false;
            s.nestedSpans = [];
            s.latestNestedSpanID = 0;
            s.elements.map((e) => {
              e.id =
                e.id.split("-")[0] +
                "-" +
                Math.ceil(Math.random() * 1e9).toString(36);
            });
            latestSpanID += 1;
          });
          col.latestSpanID = latestSpanID;
        }
        col.elements.map((e) => {
          e.id =
            e.id.split("-")[0] +
            "-" +
            Math.ceil(Math.random() * 1e9).toString(36);
        });
      });
      newLayout.container.latestColID = latestColID;
    }
    
   
    newLayouts.splice(idx + 1, 0, newLayout);
    setLayout(newLayouts);

    setPage((prev) => {
      return { ...prev, latestID: prev.latestID + 1 };
    });
  };

  const deleteContainer = (id) => {
    const targetLayout = layouts.find((l) => l.container?.id === id);
    if (!targetLayout) return;
    let newLayouts;
    if (targetLayout.splitRowId) {
      // Remove all sections belonging to the same split row
      newLayouts = lodash.cloneDeep(layouts).filter((l) => l.splitRowId !== targetLayout.splitRowId);
    } else {
      const idx = layouts.findIndex((l) => l.container.id === id);
      if (idx === -1) return;
      newLayouts = lodash.cloneDeep(layouts);
      newLayouts.splice(idx, 1);
    }
    setLayout(newLayouts);
    if (id === offcanvasID) {
      openOffcavanas(null, null, null);
    }
  };

  const updateColumn = (data, id, conID) => {
    const newLayouts = [...layouts];
    const IDX = newLayouts.findIndex((l) => l.container.id === conID);
    if (IDX === -1) return;
    const newLayout = { ...newLayouts[IDX] };
    const newColumns = [...newLayout.columns];
    const idx = newColumns.findIndex((c) => c.id === id);
    if (idx === -1) return;
    const prevColumn = newColumns[idx];
    const newColumn = { ...data };
    const colKey = String(id || "").replace("Col-", "");
    const sanitizeElementsForLayout = (list) =>
      Array.isArray(list)
        ? list.filter(
            (item) =>
              item &&
              typeof item === "object" &&
              typeof item.id === "string" &&
              typeof item.type === "string" &&
              item.type !== "null"
          )
        : [];

    const makeSpanShell = (spanId, elements = []) => ({
      id: spanId,
      latestEleID: elements.length,
      elements,
      size: 6,
      paddingX: Number(prevColumn?.paddingX ?? newColumn?.paddingX ?? 12),
      paddingY: Number(prevColumn?.paddingY ?? newColumn?.paddingY ?? 12),
      backgroundColor: lodash.cloneDeep(
        prevColumn?.backgroundColor ?? newColumn?.backgroundColor ?? "#ffffff"
      ),
      backgroundColorGradient: lodash.cloneDeep(
        prevColumn?.backgroundColorGradient ??
          newColumn?.backgroundColorGradient ??
          [{ type: "mainColor", index: 0 }, { type: "mainColor", index: 1 }]
      ),
      degrees: Number(prevColumn?.degrees ?? newColumn?.degrees ?? 90),
      isGradient: Boolean(prevColumn?.isGradient ?? newColumn?.isGradient ?? false),
      borderRadius: Number(prevColumn?.borderRadius ?? newColumn?.borderRadius ?? 0),
      borderWidth: Number(prevColumn?.borderWidth ?? newColumn?.borderWidth ?? 0),
      borderColor: lodash.cloneDeep(
        prevColumn?.borderColor ?? newColumn?.borderColor ?? "#000000"
      ),
      borderOpacity: Number(prevColumn?.borderOpacity ?? newColumn?.borderOpacity ?? 255),
      opacityColor: Number(prevColumn?.opacityColor ?? newColumn?.opacityColor ?? 255),
      opacityColorGradient: lodash.cloneDeep(
        prevColumn?.opacityColorGradient ?? newColumn?.opacityColorGradient ?? [255, 255]
      ),
      hasNestedSpan: false,
      nestedSpans: [],
      latestNestedSpanID: 0,
    });

    if (newColumn?.isSpan === true) {
      if (!Array.isArray(newColumn.spans) || newColumn.spans.length === 0) {
        const seeded = sanitizeElementsForLayout(
          lodash.cloneDeep(prevColumn?.elements)
        );
        newColumn.spans = [
          makeSpanShell(`Span-${colKey}-0`, seeded),
          makeSpanShell(`Span-${colKey}-1`, []),
          makeSpanShell(`Span-${colKey}-2`, []),
          makeSpanShell(`Span-${colKey}-3`, []),
        ];
        newColumn.latestSpanID = 4;
      } else {
        newColumn.spans = newColumn.spans.map((sp, sidx) => {
          const spanElements = sanitizeElementsForLayout(
            lodash.cloneDeep(sp?.elements)
          );
          return {
            ...makeSpanShell(
              sp?.id || `Span-${colKey}-${sidx}`,
              spanElements
            ),
            ...sp,
            id: sp?.id || `Span-${colKey}-${sidx}`,
            latestEleID: spanElements.length,
            elements: spanElements,
            hasNestedSpan: false,
            nestedSpans: [],
            latestNestedSpanID: 0,
          };
        });
        newColumn.latestSpanID = newColumn.spans.length;
      }
      newColumn.elements = [];
      newColumn.latestEleID = 0;
    } else if (prevColumn?.isSpan && Array.isArray(newColumn?.spans)) {
      const mergedElements = [];
      for (const sp of newColumn.spans) {
        if (Array.isArray(sp?.elements) && sp.elements.length > 0) {
          mergedElements.push(...sanitizeElementsForLayout(sp.elements));
        }
      }
      newColumn.elements = mergedElements;
      newColumn.latestEleID = mergedElements.length;
      delete newColumn.spans;
      newColumn.latestSpanID = 0;
    }
    if (newColumn?.isSpan === true && Array.isArray(newColumn?.spans)) {
      newColumn.spans = newColumn.spans.map((sp) => ({
        ...sp,
        hasNestedSpan: false,
        nestedSpans: [],
        latestNestedSpanID: 0,
      }));
    }
    const nextSize = Number(newColumn?.size);
    const prevSize = Number(prevColumn?.size);
    const isNarrowing =
      Number.isFinite(nextSize) &&
      Number.isFinite(prevSize) &&
      nextSize < prevSize;
    if (
      isNarrowing &&
      !canColumnSizeContainImageHoverMinWidthElements(prevColumn, nextSize)
    ) {
      carouselColWarnedRef.current = false;
      setCarouselColToastOpen(false);
      requestAnimationFrame(() => setCarouselColToastOpen(true));
      return;
    }
    if (
      isNarrowing &&
      !canColumnSizeContainAccordionMinWidthElements(prevColumn, nextSize)
    ) {
      carouselColWarnedRef.current = false;
      setCarouselColToastOpen(false);
      requestAnimationFrame(() => setCarouselColToastOpen(true));
      return;
    }
    if (
      isNarrowing &&
      !canColumnSizeContainTabsMinWidthElements(prevColumn, nextSize)
    ) {
      postColWarnedRef.current = false;
      setPostColToastOpen(false);
      requestAnimationFrame(() => setPostColToastOpen(true));
      return;
    }
    if (
      isNarrowing &&
      !canColumnSizeContainBetweenMinWidthElements(prevColumn, nextSize)
    ) {
      carouselColWarnedRef.current = false;
      setCarouselColToastOpen(false);
      requestAnimationFrame(() => setCarouselColToastOpen(true));
      return;
    }
    if (
      isNarrowing &&
      !canColumnSizeContainTableMinWidthElements(prevColumn, nextSize)
    ) {
      carouselColWarnedRef.current = false;
      setCarouselColToastOpen(false);
      requestAnimationFrame(() => setCarouselColToastOpen(true));
      return;
    }
    if (
      isNarrowing &&
      !canColumnSizeContainCarouselMinWidthElements(prevColumn, nextSize)
    ) {
      carouselColWarnedRef.current = false;
      setCarouselColToastOpen(false);
      requestAnimationFrame(() => setCarouselColToastOpen(true));
      return;
    }
    if (
      isNarrowing &&
      !canColumnSizeContainListImageMinWidthElements(prevColumn, nextSize)
    ) {
      listImageColWarnedRef.current = false;
      setListImageColToastOpen(false);
      requestAnimationFrame(() => setListImageColToastOpen(true));
      return;
    }
    if (
      isNarrowing &&
      !canColumnSizeContainPostMinWidthElements(prevColumn, nextSize)
    ) {
      postColWarnedRef.current = false;
      setPostColToastOpen(false);
      requestAnimationFrame(() => setPostColToastOpen(true));
      return;
    }
    postColWarnedRef.current = false;
    setPostColToastOpen(false);
    newColumns[idx] = newColumn;
    newLayout.columns = newColumns;
    newLayouts[IDX] = newLayout;
    setLayout(newLayouts);
  };

  const cloneColumn = (id) => {
    const { conID, colID } = id;
    let IDX;
    const newLayouts = lodash.cloneDeep(layouts);
    IDX = newLayouts.findIndex((l) => l.container.id === conID);
    if (IDX === -1) return;
    const newLayout = lodash.cloneDeep(newLayouts[IDX]);
    const newColumns = lodash.cloneDeep(newLayout.columns);
    const idx = newColumns.findIndex((c) => c.id == colID);
    if (idx === -1) return;
    const newColumn = lodash.cloneDeep(newColumns[idx]);
    const idPaths = newLayout.container.id.split("-");
    const sectionKey = idPaths[1];
    let maxColSuffix = -1;
    for (const col of newColumns) {
      const p = String(col.id).split("-");
      if (p[0] === "Col" && p[1] == sectionKey && p.length >= 3) {
        const n = parseInt(p[2], 10);
        if (Number.isFinite(n)) maxColSuffix = Math.max(maxColSuffix, n);
      }
    }
    const newColNum = maxColSuffix + 1;
    newColumn.id = `Col-${sectionKey}-${newColNum}`;
    if (newColumn.isSpan) {
      newColumn.spans.map((s, i) => {
        s.id = `Span-${sectionKey}-${newColNum}-${i}`;
        s.hasNestedSpan = false;
        s.nestedSpans = [];
        s.latestNestedSpanID = 0;

        s.latestEleID = s.elements.length
        s.elements.map((e,o) => {
          e.id =
            e.id.split("-")[0] +
            "-" +
            s.id.replace("Span-","")+"-"+o
        });
      });
    } else {
      newColumn.latestEleID = newColumn.elements.length
      newColumn.elements.map((e,i) => {
        e.id =
          e.id.split("-")[0] +
          "-" +
          newColumn.id.replace("Col-","")+"-"+i
      });
    }

    newColumns.splice(idx + 1, 0, newColumn);
    newLayout.columns = newColumns;
    newLayout.container = syncContainerLatestColId(
      newLayout.container,
      newLayout.columns
    );
    newLayouts.splice(IDX, 1, newLayout);

    /* ให้ ref grid ตรงกับคอลัมน์หลังแทรก — ไม่งั้น index เยื้อง (deleteColumn มี splice แต่ clone ไม่มี คอลัมน์ใหม่จะหาย/ทับ ref) */
    if (!columned.current[IDX]) columned.current[IDX] = [];
    columned.current[IDX].splice(idx + 1, 0, null);
    if (!spaned.current[IDX]) spaned.current[IDX] = [];
    spaned.current[IDX].splice(idx + 1, 0, []);
    if (!nestedSpaned.current[IDX]) nestedSpaned.current[IDX] = [];
    nestedSpaned.current[IDX].splice(idx + 1, 0, []);

    setLayout(newLayouts);
  };

  const deleteColumn = (id) => {
    const { conID, colID } = id;
    const newLayouts = [...layouts];
    const IDX = newLayouts.findIndex((l) => l.container.id === conID);
    const newLayout = { ...newLayouts[IDX] };
    const newColumns = [...newLayout.columns];
    const idx = newColumns.findIndex((c) => c.id === colID);
    newColumns.splice(idx, 1);
    columned.current[IDX].splice(idx, 1);
    if (newColumns.length === 0) {
      newLayouts.splice(IDX, 1);
    } else {
      newLayout.columns = newColumns;
      newLayouts.splice(IDX, 1, newLayout);
    }

    setLayout(newLayouts);
  };

  const updateSpan = (data, id, conID, colID) => {
    const newLayouts = lodash.cloneDeep(layouts);
      const IDX = newLayouts.findIndex((l) => l.container.id === conID);
      const idx = newLayouts[IDX].columns.findIndex((c) => c.id === colID);
      const sidx = newLayouts[IDX].columns[idx].spans.findIndex(
        (s) => s.id === id
      );
      const newSpans = newLayouts[IDX].columns[idx].spans;
      newSpans[sidx] = data;
    setLayout(newLayouts);
  };

  const cloneSpan = (id) => {
    const { conID, colID, spnID } = id;
    const newLayouts = lodash.cloneDeep(layouts);
    const IDX = newLayouts.findIndex((l) => l.container.id === conID);
    const newLayout = newLayouts[IDX];
    const idx = newLayout.columns.findIndex((c) => c.id === colID);
    const newColumn = newLayout.columns[idx];
    const newSpans = newColumn.spans;
    const sidx = newColumn.spans.findIndex((s) => s.id === spnID);
    const newSpan = lodash.cloneDeep(newColumn.spans[sidx]);
    const idPaths = newSpan.id.split("-");
    newSpan.id = `Span-${idPaths[1]}-${idPaths[2]}-${newColumn.latestSpanID}`;
    newSpan.hasNestedSpan = false;
    newSpan.nestedSpans = [];
    newSpan.latestNestedSpanID = 0;
    newColumn.latestSpanID += 1;
    newSpan.latestEleID = newSpan.elements.length
    newSpan.elements.map((e,i) => {
      const type = e.id.split("-")[0];
      e.id = `${type}-${newSpan.id.replace("Span-","")}-${i}`;
    });
    newSpans.splice(sidx + 1, 0, newSpan);
    setLayout(newLayouts);
  };

  const deleteSpan = (id) => {
    const { conID, colID, spnID } = id;
    const newLayouts = lodash.cloneDeep(layouts);
    const IDX = newLayouts.findIndex((l) => l.container.id === conID);
    const newLayout = newLayouts[IDX];
    const idx = newLayout.columns.findIndex((c) => c.id === colID);
    const newColumn = newLayout.columns[idx];
    const newSpans = newColumn.spans;
    const sidx = newColumn.spans.findIndex((s) => s.id === spnID);
    newSpans.splice(sidx, 1);
    if (newSpans.length === 1) {
      const lastSpan = newSpans[0];
      const {
        backgroundColor,
        backgroundColorGradient,
        borderColor,
        borderOpacity,
        borderRadius,
        borderWidth,
        degrees,
        elements,
        isGradient,
        opacityColor,
        opacityColorGradient,
        paddingX,
        paddingY,
      } = lastSpan;
      const fields = {
        backgroundColor,
        backgroundColorGradient,
        borderColor,
        borderOpacity,
        borderRadius,
        borderWidth,
        degrees,
        elements,
        isGradient,
        opacityColor,
        opacityColorGradient,
        paddingX,
        paddingY,
      };
      for (let field in fields) {
        newColumn[field] = fields[field];
      }
      delete newColumn.spans;
      delete newColumn.latestSpanID;
      newColumn.isSpan = false;
    }
    setLayout(newLayouts);
  };


  const deleteElement = useCallback(
    (id) => {
      const layoutSnap = layoutsRef.current;
      if (!id || !Array.isArray(layoutSnap) || layoutSnap.length === 0) return;
      const { conID, colID, spnID, nestID, eleID } = id;
      if (conID == null || colID == null || eleID == null) return;

      const newLayouts = lodash.cloneDeep(layoutSnap);
      const IDX = newLayouts.findIndex((l) => l?.container?.id === conID);
      if (IDX === -1) return;
      const layout = newLayouts[IDX];
      const cols = layout?.columns;
      if (!Array.isArray(cols) || cols.length === 0) return;
      const idx = cols.findIndex((c) => c.id === colID);
      if (idx === -1) return;

      let newElements;
      if (spnID) {
        const spans = cols[idx].spans;
        if (!Array.isArray(spans)) return;
        const sidx = spans.findIndex((s) => s.id === spnID);
        if (sidx === -1) return;
        if (nestID != null) {
          const nestedSpans = spans[sidx].nestedSpans;
          if (!Array.isArray(nestedSpans)) return;
          const msidx = nestedSpans.findIndex(
            (ms) => String(ms?.id ?? "") === String(nestID)
          );
          if (msidx === -1) return;
          newElements = nestedSpans[msidx].elements;
          if (!Array.isArray(newElements)) return;
        } else {
          newElements = spans[sidx].elements;
          if (!Array.isArray(newElements)) return;
        }
      } else {
        newElements = cols[idx].elements;
        if (!Array.isArray(newElements)) return;
      }

      const i = newElements.findIndex(
        (e) =>
          String(e.id) === String(eleID) || String(e._id ?? "") === String(eleID)
      );
      if (i === -1) return;

      newElements.splice(i, 1);
      stripOrphanInlineRowGroupIds(newElements);

      setLayout(newLayouts);

      setSelectID({ status: "", ids: {} });
      if (eleID === offcanvasID) {
        openOffcavanas(null, null, null);
      }
    },
    [setLayout, offcanvasID, openOffcavanas]
  );


  useEffect(() => {
    const handleLayoutElementKeys = (e) => {
      if (!isLayoutMode) return;
      if (textEditModalRef.current) return;

      const metaOrCtrl = e.metaKey || e.ctrlKey;
      const key = e.key;

      if (metaOrCtrl && (key === "c" || key === "C" || key === "v" || key === "V")) {
        return;
      }

      if (key === "Delete" || key === "Backspace") {
        if (isLayoutKeyboardEditableTarget(e.target)) return;
        if (selectID.status !== "Delete" || !selectID.ids?.eleID) return;
        e.preventDefault();
        if (selectID.ids?.tabsHostId) {
          deleteTabNestedElement(
            selectID.ids.tabsHostId,
            selectID.ids.tabId,
            selectID.ids.eleID
          );
          setSelectID({ ids: {}, status: "" });
        } else {
          deleteElement(selectID.ids);
        }
      }
    };
    window.addEventListener("keydown", handleLayoutElementKeys, true);
    return () => {
      window.removeEventListener("keydown", handleLayoutElementKeys, true);
    };
  }, [
    isLayoutMode,
    selectID,
    deleteElement,
    deleteTabNestedElement,
  ]);

  const changeSizeColumn = (id, symbol) => {
    const { conID, colID } = id;
    const newLayouts = [...layouts];
    const IDX = newLayouts.findIndex((l) => l.container.id === conID);
    const newColumns = newLayouts[IDX].columns;
    const idx = newColumns.findIndex((c) => c.id === colID);
    const currentSize = newColumns[idx].size;
    if (symbol === "+" && currentSize < 12) {
      newColumns[idx].size = currentSize + 1;
      postColWarnedRef.current = false;
      setPostColToastOpen(false);
    } else if (symbol === "-") {
      let nextSize = currentSize;
      if (newColumns[idx].isSpan) {
        if (currentSize - 1 < 3) {
          setAlert(true);
        }
        nextSize = Math.max(currentSize - 1, 3);
      } else {
        nextSize = Math.max(currentSize - 1, 1);
      }
      if (!canColumnSizeContainListImageMinWidthElements(newColumns[idx], nextSize)) {
        listImageColWarnedRef.current = false;
        setListImageColToastOpen(false);
        requestAnimationFrame(() => setListImageColToastOpen(true));
        return;
      }
      if (!canColumnSizeContainImageHoverMinWidthElements(newColumns[idx], nextSize)) {
        carouselColWarnedRef.current = false;
        setCarouselColToastOpen(false);
        requestAnimationFrame(() => setCarouselColToastOpen(true));
        return;
      }
      if (!canColumnSizeContainAccordionMinWidthElements(newColumns[idx], nextSize)) {
        carouselColWarnedRef.current = false;
        setCarouselColToastOpen(false);
        requestAnimationFrame(() => setCarouselColToastOpen(true));
        return;
      }
      if (!canColumnSizeContainTabsMinWidthElements(newColumns[idx], nextSize)) {
        postColWarnedRef.current = false;
        setPostColToastOpen(false);
        requestAnimationFrame(() => setPostColToastOpen(true));
        return;
      }
      if (!canColumnSizeContainBetweenMinWidthElements(newColumns[idx], nextSize)) {
        carouselColWarnedRef.current = false;
        setCarouselColToastOpen(false);
        requestAnimationFrame(() => setCarouselColToastOpen(true));
        return;
      }
      if (!canColumnSizeContainTableMinWidthElements(newColumns[idx], nextSize)) {
        carouselColWarnedRef.current = false;
        setCarouselColToastOpen(false);
        requestAnimationFrame(() => setCarouselColToastOpen(true));
        return;
      }
      if (!canColumnSizeContainCarouselMinWidthElements(newColumns[idx], nextSize)) {
        carouselColWarnedRef.current = false;
        setCarouselColToastOpen(false);
        requestAnimationFrame(() => setCarouselColToastOpen(true));
        return;
      }
      if (!canColumnSizeContainPostMinWidthElements(newColumns[idx], nextSize)) {
        postColWarnedRef.current = false;
        setPostColToastOpen(false);
        requestAnimationFrame(() => setPostColToastOpen(true));
        return;
      }
      newColumns[idx].size = nextSize;
      postColWarnedRef.current = false;
      setPostColToastOpen(false);
    }
    setLayout(newLayouts);
  };

  const changeSizeSpan = (id, symbol) => {
    const { conID, colID, spnID } = id || {};
    if (!conID || !colID || !spnID) return;
    if (symbol !== "+" && symbol !== "-") return;
    const newLayouts = lodash.cloneDeep(layouts);
    const containerIndex = newLayouts.findIndex((l) => l.container.id === conID);
    if (containerIndex < 0) return;
    const columnIndex = newLayouts[containerIndex].columns.findIndex((c) => c.id === colID);
    if (columnIndex < 0) return;
    const spans = newLayouts[containerIndex].columns[columnIndex].spans;
    if (!Array.isArray(spans) || spans.length === 0) return;
    const spanIndex = spans.findIndex((s) => s.id === spnID);
    if (spanIndex < 0) return;
    const currentSize = Number(spans[spanIndex]?.size) || 6;
    if (symbol === "+") {
      spans[spanIndex].size = Math.min(currentSize + 1, 12);
    } else {
      spans[spanIndex].size = Math.max(currentSize - 1, 1);
    }
    setLayout(newLayouts);
  };


  const ElementSetting = ({x,y,id})=>{


    if(x === null || y === null) return

    const {   conID,
      colID,
      spnID,
      nestID,
      eleID,} = id

      
    return (
      <div style={{position: "fixed",left: x,top: y,width:200,height:200,backgroundColor:"white"}} onContextMenu={(e)=>{
        e.preventDefault()
      }}>
          รรรร
      </div>
    )
  }

  const changeSpanPosition = (index, ids, symbol) => {
    const { conID, colID } = ids;
    const newLayouts = lodash.cloneDeep(layouts);
    const containerIndex = newLayouts.findIndex(
      (l) => l.container.id === conID
    );
    const columnIndex = newLayouts[containerIndex].columns.findIndex(
      (c) => c.id === colID
    );
    const newSpans = newLayouts[containerIndex].columns[columnIndex].spans;
    if (
      (symbol === "-" && index === 0) ||
      (symbol === "+" && index === newSpans.length - 1)
    )
      return;
    const [span] = newSpans.splice(index, 1);
    if (symbol === "-") {
      newSpans.splice(index - 1, 0, span);
    } else if (symbol === "+") {
      newSpans.splice(index + 1, 0, span);
    }
    setLayout(newLayouts);
  };


  const changeColumnPositionByArrow = (ids, symbol) => {
    const { conID, colID } = ids || {};
    if (!conID || !colID) return;
    const currentLayouts = layoutsRef.current;
    const containerIndex = currentLayouts.findIndex((l) => l.container.id === conID);
    if (containerIndex === -1) return;
    const cols = currentLayouts[containerIndex]?.columns;
    if (!Array.isArray(cols) || cols.length <= 1) return;
    const index = cols.findIndex((c) => c.id === colID);
    if (index === -1) return;
    if ((symbol === "-" && index === 0) || (symbol === "+" && index === cols.length - 1)) return;
    const newLayouts = lodash.cloneDeep(currentLayouts);
    const newCols = newLayouts[containerIndex].columns;
    const [column] = newCols.splice(index, 1);
    newCols.splice(symbol === "-" ? index - 1 : index + 1, 0, column);
    setLayout(newLayouts);
  };

  const changeContainerPositionByArrow = (id, symbol) => {
    if (!id || (symbol !== "-" && symbol !== "+")) return;
    const currentLayouts = layoutsRef.current;
    if (!Array.isArray(currentLayouts) || currentLayouts.length <= 1) return;

    const rows = [];
    for (let i = 0; i < currentLayouts.length; i++) {
      const cur = currentLayouts[i];
      if (cur?.splitRowId) {
        const sid = cur.splitRowId;
        const items = [cur];
        while (i + 1 < currentLayouts.length && currentLayouts[i + 1]?.splitRowId === sid) {
          i += 1;
          items.push(currentLayouts[i]);
        }
        rows.push({ kind: "split", sid, items });
      } else {
        rows.push({ kind: "single", sid: null, items: [cur] });
      }
    }

    const rowIndex = rows.findIndex((row) => {
      if (row.kind === "split") {
        return row.sid === id || row.items.some((it) => it?.container?.id === id);
      }
      return row.items[0]?.container?.id === id;
    });
    if (rowIndex === -1) return;

    const targetIndex = symbol === "-" ? rowIndex - 1 : rowIndex + 1;
    if (targetIndex < 0 || targetIndex >= rows.length) return;

    const reorderedRows = [...rows];
    const [moved] = reorderedRows.splice(rowIndex, 1);
    reorderedRows.splice(targetIndex, 0, moved);

    const nextLayouts = reorderedRows.flatMap((row) => row.items);
    setLayout(nextLayouts);
  };

  const changeSize = {
    changeSizeColumn,
    changeSizeSpan,
  }

  const changePosition = {
    changeContainerPosition: changeContainerPositionByArrow,
    changeSpanPosition,
    changeColumnPosition: changeColumnPositionByArrow,
  }

  const onDragDisable = {
    onDragDisableCol:()=>setDisableColDrag(true),onDragDisableSpn:()=>setDisableSpnDrag(true)
  }

  const clone ={
    cloneCon:cloneContainer,
    cloneCol:cloneColumn,
    cloneSpn:cloneSpan,
  }

  const remove ={
    removeCon:deleteContainer,
    removeCol:deleteColumn,
    removeSpn:deleteSpan,
  }

  const SortableSplitRowItem = ({ id, renderChildren }) => {
    const {
      setNodeRef,
      attributes,
      listeners,
      setActivatorNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id,
      data: { type: "SECTION" },
      animateLayoutChanges: noLayoutAnimWhileSorting,
      disabled: !isLayoutMode || disableConDrag,
    });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition: isDragging ? undefined : transition,
      opacity: isDragging ? 0.7 : 1,
      willChange: "transform",
      touchAction: "none",
    };
    return (
      <div
        ref={setNodeRef}
        {...attributes}
        style={style}
        data-drop="SECTION"
        id={id}
        className="container-area relative flex w-full"
      >
        {renderChildren({ listeners, setActivatorNodeRef })}
      </div>
    );
  };

  const SortableContainerItem = ({ id, elementData,heros, children}) => {
    const index = layouts.findIndex((l) => l.container?.id == id);

    const {
      setNodeRef,
      attributes,
      listeners,
      setActivatorNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id,
      data: { type: "SECTION" },
      animateLayoutChanges: noLayoutAnimWhileSorting,
      disabled: !isLayoutMode || disableConDrag,
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition: isDragging ? undefined : transition,
      opacity: isDragging ? 0.7 : 1,
      willChange: "transform",
      touchAction: "none",
      cursor: "grab",
    };

    


    if(heros){
      const {
        paddingTop,
        paddingBottom,
        isGradient,
        opacityImage,
        opacityColor,
        opacityArrow,
        opacityColorGradient,
        backgroundColor,
        backgroundColorGradient,
        backgroundImage,
        degrees,
        arrowColor,
        pointColor,
        backgroundArrowColor,
        opacityBackgroundArrow,
        arrowSize,
        pointSize,
        desktopHeight
      } = elementData;
  
  
      let color;
  
      if (isGradient) {
        const color1 =
          typeof backgroundColorGradient[0] === "string"
            ? backgroundColorGradient[0] + opacity_2_hex(opacityColorGradient[0])
            : theme?.[backgroundColorGradient?.[0]?.type]?.[
                backgroundColorGradient?.[0]?.index
              ] + opacity_2_hex(opacityColorGradient[0]);
        const color2 =
          typeof backgroundColorGradient[1] === "string"
            ? backgroundColorGradient[1] + opacity_2_hex(opacityColorGradient[1])
            : theme[backgroundColorGradient[1].type][
                backgroundColorGradient[1].index
              ] + opacity_2_hex(opacityColorGradient[1]);
        color = `linear-gradient(${degrees}deg, ${color1} 0%, ${color2} 100%)`;
      } else if (!isGradient) {
        color =
          typeof backgroundColor === "string"
            ? backgroundColor + opacity_2_hex(opacityColor)
            : theme[backgroundColor.type][backgroundColor.index] +
              opacity_2_hex(opacityColor);
      }


      let arc = arrowColor
      if(typeof arrowColor === "object"){
        arc = theme[arrowColor.type][arrowColor.index]
      }
      arc += opacity_2_hex(opacityArrow)

      let barc = backgroundArrowColor
      if(typeof backgroundArrowColor === "object"){
        barc = theme[backgroundArrowColor.type][backgroundArrowColor.index]
      }
      barc += opacity_2_hex(opacityBackgroundArrow)

      let ptc = pointColor
      if(typeof pointColor === "object"){
        ptc = theme[pointColor.type][pointColor.index]
      }
  
      const BgImage = () => {
        if (backgroundImage) {
          return (
            <div
              className=" absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-0"
              style={{
                backgroundImage: `url(${backgroundImage})`,
                opacity: opacityImage,
              }}
            />
          );
        } else {
          return <></>;
        }
      };
      return (
        <div
        ref={setNodeRef}
        {...attributes}
        style={style}
        data-drop="SECTION"
        id={id}
        className="container-area relative"
      >
        <div
          className={`${"border-[1px]"}  border-dashed border-gray-600 relative`}
          style={{ background: color }}
          ref={(el) => {
            contained.current[index] = el || null;
            setColRef(index, 0, null);
            setSpnRef(index, 0, null, null);
            setMspnRef(index, 0, null, null, null);
          }}
        >
          <div
            className={`w-full mx-auto relative z-10`}
            style={{
              height:desktopHeight
            }}
          >
            
             {hover === id && !activeID && (
              <div className="relative z-20" onMouseEnter={() => setHover(id)}>
                <OptionButtonGroup
                  element={[elementData,heros]}
                  clone={cloneContainer}
                  id={id}
                  remove={deleteContainer}
                  offcavanas="Header"
                  onUpdate={updateContainer}
                  modal={openModal}
                />
              </div>
            )}

                  <Swiper modules={[Navigation,Pagination]} navigation pagination={{ clickable: true, dynamicBullets: true }} loop className="w-full h-full mySwiper" style={{
                    "--swiper-navigation-color": arc,
                    "--swiper-pagination-color": ptc,
                    "--swiper-nav-bg":barc,
                    "--swiper-nav-size":`${arrowSize}px`,
                    "--swiper-nav-padding":`${8*arrowSize/30}px`,
                    "--swiper-pag-size":`${pointSize}px`,

    
                    
                  }}>
                    {children}
                {/* <SwiperSlide style={{
                  paddingTop: paddingTop,
                  paddingBottom: paddingBottom,
                }}>
                  1
                </SwiperSlide>
                <SwiperSlide>
                  2
                </SwiperSlide> */}
              </Swiper>

            
          </div>
       </div>
       </div>
      )
    }

    else{

  


      const showOption =
        (hover === id || pinnedColumnOptionId === id) &&
        !activeID &&
        device === "Desktop" &&
        builderMode === "Layout Mode";





      return (
        <div
          ref={setNodeRef}
          {...attributes}
          style={style}
          data-drop="SECTION"
          id={id}
          className={`container-area ${
            isPreview && !previewAuditMode && index > 0 ? "preview-feed-in" : ""
          }`}
        >
          <Container elementData={elementData} device={device} builderMode={builderMode} setRef={(el) => {
              contained.current[index] = el || null;
            }} borderT={layouts.length > 1 && index !== 0 && !(preview && dropTargetRef.current?.type === "SECTION" && dropTargetRef.current?.index === index) ?"border-t-[0px]" :""} theme={theme}  handleDuring={(e)=>{
              handleDuring(e)
            }} showOption={showOption} funct={{clone,remove}} layouts={layouts} onUpdate={updateContainer} modal={openModal} scheduleDND={(e)=>{
              scheduleDND(e)
            }} openOffcavanas={openOffcavanas} changePosition={changePosition}
            sectionDndHandle={null}
            onSectionDragEnable={undefined}
            onSectionDragDisable={undefined}
            >
              {children}
            </Container> 
        </div>
      );
    }

    
  };

  const SortableColumnItem = ({ id, containerId, elementData, children }) => {
    const hugeElementType = [
      "img",
      "bnr",
      "lbx",
      "vid",
      "yt",
      "gly",
      "crl",
      "lstb",
      "list",
    ];

    const IDX = layouts.findIndex((l) => l.container.id === containerId);
    const idx = layouts[IDX].columns.findIndex((c) => c.id == id);
    const sectionCont = layouts[IDX].container;
    const {
      gridBorder,
      noColumnGap,
      columnDividerBorderStyleClass,
      columnDividerColorStyle,
      verticalDividerColor,
      verticalDividerBorderStyle,
      columnDividerVerticalLengthPct,
    } = getSectionColumnDividerVisual(layouts, IDX, theme);
    const {
      attributes,
      listeners,
      setActivatorNodeRef,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id,
      data: { type: "COLUMN", conID: containerId },
      animateLayoutChanges: noLayoutAnimWhileSorting,
      disabled: true,
    });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition: isDragging ? undefined : transition,
      opacity: isDragging ? 0.7 : 1,
      willChange: "transform",
      touchAction: "none",
      cursor: "default",
    };

    const {
      size,
      isSpan,
    } = elementData;



    const responsive = (size)=>{
      if(device === "Desktop"){
        return size
      }
      else if(device === "Tablet"){
        if(size >= 5){
          return 12
        }else if(size >= 3){
          return 6
        }else if(size === 2){
          return 4
        }else{
          return 3
        }
      }
      else if(device === "Mobile"){
        if(size >= 3){
          return 12
        }else if(size === 2){
          return 6
        }else{
          return 4
        }
      }
    }


    const cols = layouts[IDX].columns;
    // Precompute the grid row index for every column — handles overflow wrapping correctly
    const colRows = (() => {
      const rows = [];
      let used = 0;
      let row = 0;
      for (const col of cols) {
        const sz = responsive(col.size);
        if (used > 0 && used + sz > 12) { row++; used = sz; }
        else { used += sz; }
        rows.push(row);
        if (used >= 12) { row++; used = 0; }
      }
      return rows;
    })();
    const colRowIndex = colRows[idx] ?? 0;
    // First col in its row (isColumnRowStart) — used to decide removeLeftBorder
    const isColumnRowStart = idx === 0 || colRows[idx] > colRows[idx - 1];
    // Right neighbor is in the same row AND is a Span → cut right border
    const rightNeighborIsSpan = (() => {
      if (!noColumnGap) return false;
      if (idx + 1 >= cols.length) return false;
      return colRows[idx + 1] === colRows[idx] && Boolean(cols[idx + 1]?.isSpan);
    })();

    const colSizes = cols.map((col) => responsive(col.size));
    let gridBorders = computeGridBorderStringsFromSizes(colSizes);

    const columnCount = layouts[IDX]?.columns?.length ?? 0;
    while (gridBorders.length < columnCount) {
      gridBorders.push("border-0");
    }
    const gbEntryRaw =
      idx >= 0 && idx < gridBorders.length ? gridBorders[idx] : "border-0";
    const gbStr =
      typeof gbEntryRaw === "string" && gbEntryRaw.trim() !== ""
        ? gbEntryRaw
        : "border-0";
    const hasRightEdge =
      gridBorder &&
      gbStr &&
      String(gbStr).trim() !== "border-0" &&
      !String(gbStr).includes("border-r-0");
    const hasBottomEdge =
      gridBorder &&
      gbStr &&
      String(gbStr).trim() !== "border-0" &&
      !String(gbStr).includes("border-b-0");
    const useCustomEdgeLines = gridBorder && (hasRightEdge || hasBottomEdge);
    const colDividerTopInsetPx = colRowIndex > 0 ? 12 : 0; // match inner p-3 top gap
    const colDividerBottomInsetPx = hasBottomEdge ? 12 : 0; // match inner p-3 bottom gap

    const setRef = (el,n=0)=>{
      setColRef(IDX, idx, el);
      if(n === 1){
        // Clear child refs for this column as a whole (avoid wiping only index 0).
        setSpnRef(IDX, idx, null, null);
        setMspnRef(IDX, idx, null, null, null);
      }
    }


    const ghostDropIndex =
      preview &&
      dropTargetRef.current?.type === "ELEMENT" &&
      dropTargetRef.current?.index
        ? dropTargetRef.current.index
        : null;
    const droppingIntoThisColumn =
      (
        elementDropHighlight?.conI === IDX &&
        elementDropHighlight?.colI === idx
      ) ||
      (
        ghostDropIndex?.conI === IDX &&
        ghostDropIndex?.colI === idx
      );
    const height = elementData.elements.length > 0
      ? "min-h-[40px]"
      : "h-full min-h-[200px]"


      const ids = {conID:containerId, colID: id}


      const hoverColumnKey = (() => {
        const raw = String(hover || "");
        if (!raw) return "";
        return raw.includes("/") ? raw.split("/").pop() : raw;
      })();
      const hoverInsideThisColumn = (() => {
        if (!hover || !elementData?.isSpan || !Array.isArray(elementData?.spans)) return false;
        const spKey = spanDomIdToSpanKey(hover) ?? hover;
        const msKey = nestedSpanDomIdToKey(hover);
        return elementData.spans.some((sp) => {
          if (sp?.id === hover || sp?.id === spKey) return true;
          return (
            Array.isArray(sp?.nestedSpans) &&
            sp.nestedSpans.some((ms) => ms?.id === hover || ms?.id === msKey)
          );
        });
      })();
      const isPinnedThisColumn = pinnedColumnOptionId === id;
      const showOption =
        (hover === id ||
          hover === `${containerId}/${id}` ||
          hoverColumnKey === id ||
          isPinnedThisColumn) &&
        (!hoverInsideThisColumn || isPinnedThisColumn) &&
        !activeID &&
        device === "Desktop" &&
        builderMode === "Layout Mode";
      const elevateColumnLayer = showOption || hoverInsideThisColumn;

    const cellShellClass = (() => {
      let c = `column-area min-w-0 col-span-${responsive(size)}`;
      if (gridBorder) {
        c += ` border ${columnDividerBorderStyleClass} ${gbStr}`;
        if (hasRightEdge) c += " border-r-0";
        if (hasBottomEdge) c += " border-b-0";
        if (useCustomEdgeLines) {
          /* ให้สูงเท่าแถว grid — ไม่งั้น div ห่อ Column ไม่มีความสูง h-full ใน Column จะยุบเป็นถึงแค่กลางคอลัมน์ */
          c += " relative isolate flex h-full min-h-0 flex-col";
        } else c += noColumnGap ? " p-0" : " p-3";
      } else {
        c += noColumnGap ? " p-0" : " p-3";
      }
      return c;
    })();

    return (
      <div
        ref={setNodeRef}
        {...attributes}
        {...(isSpan ? listeners : {})}
        style={{
          ...style,
          ...columnDividerColorStyle,
          ...(elevateColumnLayer ? { zIndex: 200 } : {}),
        }}
        className={cellShellClass}
        id={`${containerId}/${id}`}
        data-drop="COLUMN"
        onMouseMove={(e) => {
          scheduleBTNUpdate(e);
        }}
      >
        {useCustomEdgeLines ? (
          <>
            {hasRightEdge ? (
              <span
                aria-hidden
                className="pointer-events-none absolute right-0 z-[1] box-border flex items-center justify-end"
                style={{
                  top: colDividerTopInsetPx,
                  bottom: colDividerBottomInsetPx,
                  width: 0,
                }}
              >
                <span
                  style={{
                    height: `${columnDividerVerticalLengthPct}%`,
                    width: 0,
                    borderRightWidth: 1,
                    borderRightStyle: verticalDividerBorderStyle,
                    borderRightColor: verticalDividerColor,
                    boxSizing: "border-box",
                  }}
                />
              </span>
            ) : null}
            {hasBottomEdge ? (
              <span
                aria-hidden
                className="pointer-events-none absolute bottom-0 left-0 right-0 z-[1] flex justify-center"
                style={{ height: 0 }}
              >
                <span
                  style={{
                    width: `${columnDividerVerticalLengthPct}%`,
                    height: 0,
                    borderBottomWidth: 1,
                    borderBottomStyle: verticalDividerBorderStyle,
                    borderBottomColor: verticalDividerColor,
                    boxSizing: "border-box",
                  }}
                />
              </span>
            ) : null}
            <div
              className={`relative z-[2] flex h-full min-h-0 w-full min-w-0 flex-1 flex-col ${noColumnGap ? "p-0" : "p-3"}`}
            >
              <Column
                elementData={elementData}
                device={device}
                builderMode={builderMode}
                setRef={setRef}
                height={height}
                theme={theme}
                ids={ids}
                handleDuring={(e) => {
                  handleDuring(e);
                }}
                showOption={showOption}
                funct={{ clone, remove }}
                layouts={layouts}
                onUpdate={updateColumn}
                modal={openModal}
                scheduleDND={(e) => {
                  scheduleDND(e);
                }}
                openOffcavanas={openOffcavanas}
                changeSize={changeSize}
                changePosition={changePosition}
                dndHandle={{ listeners, setActivatorNodeRef }}
                onDragAble={() => setDisableColDrag(false)}
                onDragDisable={onDragDisable}
                isColumnPresetModalPinned={pinnedColumnOptionId === id}
                onColumnPresetModalToggle={(isOpen) => {
                  setPinnedColumnOptionId((prev) => {
                    if (isOpen) return id;
                    return prev === id ? null : prev;
                  });
                }}
                onOpenPresetModal={openColumnPresetModal}
                onOpenPresetLoadModal={openColumnPresetLoadModal}
                noColumnGap={noColumnGap}
                hideIdBadge={droppingIntoThisColumn}
                removeTopBorder={noColumnGap && colRowIndex > 0}
                removeLeftBorder={noColumnGap && !isColumnRowStart}
                removeRightBorder={noColumnGap && rightNeighborIsSpan}
              >
                {children}
              </Column>
            </div>
          </>
        ) : (
          <Column
            elementData={elementData}
            device={device}
            builderMode={builderMode}
            setRef={setRef}
            height={height}
            theme={theme}
            ids={ids}
            handleDuring={(e) => {
              handleDuring(e);
            }}
            showOption={showOption}
            funct={{ clone, remove }}
            layouts={layouts}
            onUpdate={updateColumn}
            modal={openModal}
            scheduleDND={(e) => {
              scheduleDND(e);
            }}
            openOffcavanas={openOffcavanas}
            changeSize={changeSize}
            changePosition={changePosition}
            dndHandle={{ listeners, setActivatorNodeRef }}
            onDragAble={() => setDisableColDrag(false)}
            onDragDisable={onDragDisable}
            isColumnPresetModalPinned={pinnedColumnOptionId === id}
            onColumnPresetModalToggle={(isOpen) => {
              setPinnedColumnOptionId((prev) => {
                if (isOpen) return id;
                return prev === id ? null : prev;
              });
            }}
            onOpenPresetModal={openColumnPresetModal}
            onOpenPresetLoadModal={openColumnPresetLoadModal}
            noColumnGap={noColumnGap}
            hideIdBadge={droppingIntoThisColumn}
            removeTopBorder={noColumnGap && colRowIndex > 0}
            removeLeftBorder={noColumnGap && !isColumnRowStart}
            removeRightBorder={noColumnGap && rightNeighborIsSpan}
          >
            {children}
          </Column>
        )}
      </div>
    );
  };

  const SortableSpanItem = ({
    id,
    containerId,
    columnId,
    elementData,
    children,
  }) => {
    const hugeElementType = [
      "img",
      "bnr",
      "lbx",
      "vid",
      "yt",
      "gly",
      "crl",
      "lstb",
      "list",
    ];

    const IDX = layouts.findIndex((l) => l.container.id === containerId);
    const idx = layouts[IDX].columns.findIndex((c) => c.id === columnId);
    const sidx = layouts[IDX].columns[idx].spans.findIndex((s) => s.id === id);
    const sectionDividerMeta = getSectionColumnDividerVisual(
      layouts,
      IDX,
      theme
    );
    const { noColumnGap, gridBorder } = sectionDividerMeta;
    // Span: cut top border if not first span in parent col (stacked spans)
    const removeSpanTopBorder = noColumnGap && sidx > 0;
    const responsiveSpanSize = (sizeValue) => {
      const size = Number(sizeValue) || 6;
      if (device === "Desktop") return Math.max(1, Math.min(12, size));
      if (device === "Tablet") {
        if (size >= 5) return 12;
        if (size >= 3) return 6;
        if (size === 2) return 4;
        return 3;
      }
      if (device === "Mobile") {
        if (size >= 3) return 12;
        if (size === 2) return 6;
        return 4;
      }
      return Math.max(1, Math.min(12, size));
    };
    const spanSizeClass = `col-span-${responsiveSpanSize(elementData?.size)}`;

    const {
      attributes,
      listeners,
      setNodeRef,
      setActivatorNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id,
      data: {
        type: "SPAN",
        conID: containerId,
        colID: columnId,
      },
      disabled: !isLayoutMode || disableSpnDrag,
      animateLayoutChanges: noLayoutAnimWhileSorting,
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition: isDragging ? undefined : transition,
      opacity: isDragging ? 0.7 : 1,
      willChange: "transform",
      touchAction: "none",
      cursor: "default",
    };

    const eleLength =
      sidx > -1 ? layouts[IDX].columns[idx].spans[sidx].elements.length : 0;
    const {
      paddingX = 18,
      paddingY = 18,
      backgroundColor = "#ffffff",
      backgroundColorGradient = [{ type: "mainColor", index: 0 }, { type: "mainColor", index: 1 }],
      borderColor = "#000000",
      borderOpacity = 255,
      borderRadius = 0,
      borderWidth = 0,
      degrees = 90,
      isGradient = false,
      opacityColor = 255,
      opacityColorGradient = [255, 255],
      colGlassEnabled = false,
      colGlassLevel = 50,
    } = elementData || {};

    const setHeight = () => {
      if (
        eleLength > 0 ||
        (dropTargetRef.current.index?.colI === idx &&
          dropTargetRef.current.index?.spnI === sidx &&
          dropTargetRef.current.index?.conI === IDX &&
          hugeElementType.includes(preview?.type))
      ) {
        return "min-h-[40px]";
      } else {
        return "h-[100px]";
      }
    };
    const glassLevelNum = Number.isFinite(Number(colGlassLevel)) ? Number(colGlassLevel) : 50;
    const glassRatio = colGlassEnabled === true
      ? Math.max(0, Math.min(100, glassLevelNum)) / 100
      : 0;
    const glassBlurPx = Math.round(glassRatio * 24);
    const glassSaturatePct = Math.round(100 + glassRatio * 80);
    const spanGlassStyle = colGlassEnabled === true
      ? {
          backdropFilter: `blur(${glassBlurPx}px) saturate(${glassSaturatePct}%)`,
          WebkitBackdropFilter: `blur(${glassBlurPx}px) saturate(${glassSaturatePct}%)`,
        }
      : {};
    let spanFill = isGradient
      ? setColor(theme, backgroundColorGradient, opacityColorGradient, degrees)
      : setColor(theme, backgroundColor, opacityColor);
    if (colGlassEnabled === true && glassRatio > 0) {
      const maxOpacity = Math.round(255 - glassRatio * 160);
      if (isGradient && Array.isArray(backgroundColorGradient) && Array.isArray(opacityColorGradient)) {
        const effectiveOpacity = opacityColorGradient.map((op) =>
          Math.min(Number(op) || 255, maxOpacity)
        );
        spanFill = setColor(theme, backgroundColorGradient, effectiveOpacity, degrees);
      } else if (!isGradient && backgroundColor != null) {
        const effectiveOpacity = Math.min(Number(opacityColor) || 255, maxOpacity);
        spanFill = setColor(theme, backgroundColor, effectiveOpacity);
      }
    }
    const spanBorderColor = setColor(theme, borderColor, borderOpacity);



          const setRef = (el,n=0)=>{
            setSpnRef(IDX,idx,sidx,el)
            if(n === 1){
              // Clear mini-span refs only under current span.
              setMspnRef(IDX, idx, sidx, null, null);
            }
          }

          const ids = {
            conID:containerId,
            colID:columnId,
            spnID: id,
          }

          const spanHoverKey = spanDomIdToSpanKey(hover) ?? hover;
          const showOption =
            (hover === id || spanHoverKey === id || pinnedSpanOptionId === id) &&
            !activeID &&
            device === "Desktop" &&
            builderMode === "Layout Mode";
          const ghostDropIndex =
            preview &&
            dropTargetRef.current?.type === "ELEMENT" &&
            dropTargetRef.current?.index
              ? dropTargetRef.current.index
              : null;
          const droppingIntoThisSpan =
            (
              elementDropHighlight?.conI === IDX &&
              elementDropHighlight?.colI === idx &&
              elementDropHighlight?.spnI === sidx
            ) ||
            (
              ghostDropIndex?.conI === IDX &&
              ghostDropIndex?.colI === idx &&
              ghostDropIndex?.spnI === sidx
            );
          const showSpanIdBadge =
            device === "Desktop" &&
            builderMode === "Layout Mode" &&
            eleLength === 0 &&
            !droppingIntoThisSpan;

    return (
      <div
        ref={setNodeRef}
        style={{ ...style, ...(showOption ? { zIndex: 100 } : {}) }}
        className={`w-full min-w-0 ${spanSizeClass}`}
        id={`${containerId}/${columnId}/${id}`}
        data-drop="SPAN"
        onMouseMove={(e) => {
          if (isPreview) return;
          scheduleBTNUpdate(e);
          scheduleDND(e);
        }}
        onMouseLeave={(e) => {
          const next = e.relatedTarget;
          const stillInsideThisSpan =
            Boolean(next) &&
            typeof next === "object" &&
            e.currentTarget.contains(next);
          if (stillInsideThisSpan) return;
          if (hover === id) setHover(null);
          if (pinnedSpanOptionId === id) setPinnedSpanOptionId(null);
        }}
      >
        <div
          className={`relative w-full min-w-0 ${setHeight()} ${device === "Desktop" && builderMode === "Layout Mode" ? `border-[1px] border-dashed border-gray-600${removeSpanTopBorder ? " border-t-0" : ""}` : ""}`}
          ref={(el) => setRef(el, 1)}
          onDragOver={(e) => {
            handleDuring(e);
          }}
        >
          {showOption && (
            <div className="absolute top-0 left-0 z-[1000] pointer-events-none">
              <div className="pointer-events-auto">
                <ServiceLayout
                  layouts={layouts}
                  element={{ spanData: elementData, conID: containerId, colID: columnId }}
                  clone={clone}
                  remove={remove}
                  scheduleDND={(e) => {
                    scheduleDND(e);
                  }}
                  openOffcavanas={openOffcavanas}
                  ids={ids}
                  onUpdate={updateSpan}
                  modal={openModal}
                  offcavanas="Span"
                  changeSize={changeSize}
                  changePosition={changePosition}
                  dndHandle={{ listeners, setActivatorNodeRef }}
                  onDragAble={() => setDisableSpnDrag(false)}
                  onDragDisable={onDragDisable}
                  isSpanMorePinned={pinnedSpanOptionId === id}
                  onOpenPresetLoadModal={openColumnPresetLoadModal}
                  onSpanMoreToggle={(isOpen) => {
                    setPinnedSpanOptionId((prev) => {
                      if (isOpen) return id;
                      return prev === id ? null : prev;
                    });
                  }}
                />
              </div>
            </div>
          )}
          {showSpanIdBadge ? (
            <div
              className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center"
              aria-hidden
            >
              <span
                className="inline-flex min-w-0 max-w-[min(calc(100%-1.5rem),14rem)] items-center rounded-md border-0 bg-slate-200 px-2 py-0.5 text-[11px] font-mono font-bold leading-none text-slate-400 tabular-nums dark:bg-slate-500 dark:text-slate-100"
                title={String(id ?? "")}
              >
                <span className="truncate">{id}</span>
              </span>
            </div>
          ) : null}
          <div
            className="flex h-full w-full min-w-0 flex-col"
            style={{
              borderRadius,
              borderWidth,
              padding: `${paddingY}px ${paddingX}px`,
              borderColor: spanBorderColor,
              background: spanFill,
              ...spanGlassStyle,
            }}
          >
            {children}
          </div>
        </div>
      </div>
    );
  };


  const SortableElementItem = ({
    id,
    containerId,
    columnId,
    elementData,
    children,
    spanId = null,
    nestedSpanId = null,
    /** list ในแถว listRow: แสดงเส้นคั่นแนวตั้งหลังรายการนี้ (ยกเว้นตัวสุดท้ายในแถว) */
    listInlineDividerAfter = false,
    /** listRow: mr หลังชุดนี้คู่กับชุดถัดไป (gap-x ใช้ 0 แล้วคุมด้วยคลาสนี้) */
    listInlineRowTrailingClassName = "",
  }) => {
    const splitTransition =
      layouts.find((l) => l?.container?.id === containerId)?.splitRowId
        ? { duration: 200, easing: "ease" }
        : undefined;
    const splitTransitionCss = splitTransition
      ? `transform ${splitTransition.duration}ms ${splitTransition.easing}`
      : undefined;
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id,
      data: {
        type: "ELEMENT",
        conID: containerId,
        colID: columnId,
        spnID: spanId,
        nestID: nestedSpanId,
      },
      animateLayoutChanges: noLayoutAnimWhileSorting,
      // Keep element DnD always active in Layout Mode.
      // Hover-based disableEleDrag can become stale in span buckets and block drag start.
      disabled: !isLayoutMode,
      transition: splitTransition,
    });
    const { type } = elementData;
    const btnFullCol =
      (type === "btn" || type === "btnG") &&
      isButtonFullWidthEnabled(elementData);
    const inButtonRowGroup =
      (type === "btn" || type === "btnG") &&
      typeof elementData?.buttonRowGroupId === "string" &&
      elementData.buttonRowGroupId.trim() !== "";
    const inIconRowGroup =
      type === "icon" &&
      typeof elementData?.iconRowGroupId === "string" &&
      elementData.iconRowGroupId.trim() !== "";
    const inCounterRowGroup =
      type === "ctn" &&
      typeof elementData?.counterRowGroupId === "string" &&
      elementData.counterRowGroupId.trim() !== "";
    const [hoverElement, setHoverElement] = useState(false);

    const IDX = layouts.findIndex((l) => l.container.id === containerId);
    const idx = layouts[IDX].columns.findIndex((c) => c.id === columnId);
    let sidx,msidx
    if(spanId){
      sidx = layouts[IDX].columns[idx].spans.findIndex((s) => s.id === spanId);
    }if(nestedSpanId){
      msidx = layouts[IDX].columns[idx].spans[sidx].nestedSpans.findIndex((ms) => ms.id === nestedSpanId);
    }
    const isElement = layouts[IDX].columns[idx].elements.length > 1;

    const eleBucket = nestedSpanId
      ? layouts[IDX].columns[idx].spans[sidx].nestedSpans[msidx].elements
      : spanId
        ? layouts[IDX].columns[idx].spans[sidx].elements
        : layouts[IDX].columns[idx].elements;
    const curIx = eleBucket.findIndex((e) => e.id === id);
    const nextEl = curIx >= 0 ? eleBucket[curIx + 1] : undefined;

    const inListRowGroup =
      type === "list" &&
      typeof elementData?.listRowGroupId === "string" &&
      elementData.listRowGroupId.trim() !== "";
    const nextInSameListRow =
      nextEl?.type === "list" &&
      typeof nextEl?.listRowGroupId === "string" &&
      typeof elementData?.listRowGroupId === "string" &&
      String(nextEl.listRowGroupId).trim() !== "" &&
      String(elementData.listRowGroupId).trim() !== "" &&
      String(nextEl.listRowGroupId).trim() ===
        String(elementData.listRowGroupId).trim();
    /** List iCons ในแถวเดียวกัน: ไม่ใช้เส้นคั่นแนวนอนระหว่างช่อง (ใช้เส้นแนวตั้งแทน) — List Item ยังมีเส้นด้านล่างเหมือนเดิม */
    const suppressHorizontalBetweenSameListRow =
      Boolean(nextInSameListRow) &&
      elementData?.listIconsElement === true &&
      nextEl?.listIconsElement === true;
    const isLastList =
      nextEl?.type !== "list" ||
      Boolean(suppressHorizontalBetweenSameListRow);

    /** กว้าง auto เฉพาะในแถว — ตัวเดี่ยวให้เต็มความกว้างเพื่อจัดซ้าย/กลาง/ขวาเหมือนโหมดแก้ไข */
    const tightSortableWidth =
      ((type === "btn" || type === "btnG") &&
        !btnFullCol &&
        inButtonRowGroup) ||
      (type === "icon" && inIconRowGroup) ||
      (type === "ctn" && inCounterRowGroup) ||
      (type === "list" && inListRowGroup);
    const dragDropIndex = dropTargetRef.current?.index;
    const isElementDropPreview =
      Boolean(activeID?.eleID) &&
      isDraggingLayout &&
      preview &&
      dropTargetRef.current?.type === "ELEMENT" &&
      dragDropIndex &&
      Number.isInteger(dragDropIndex?.conI) &&
      Number.isInteger(dragDropIndex?.colI) &&
      Number.isInteger(dragDropIndex?.eleI);
    const samePreviewBucket =
      isElementDropPreview &&
      dragDropIndex.conI === IDX &&
      dragDropIndex.colI === idx &&
      (dragDropIndex?.spnI ?? null) === (spanId ? sidx : null) &&
      (dragDropIndex?.nestI ?? null) === (nestedSpanId ? msidx : null);
    const previewInsertAtRaw = Number.isInteger(dragDropIndex?.eleI)
      ? dragDropIndex.eleI
      : null;
    const previewInsertAt = Number.isInteger(previewInsertAtRaw)
      ? snapInsertOutsideInlineGroup(eleBucket, previewInsertAtRaw)
      : null;
    const inlineGroupBounds =
      Number.isInteger(curIx) && curIx >= 0
        ? getInlineRowGroupBounds(eleBucket, curIx)
        : null;
    const isInlineGroupLead =
      inlineGroupBounds && Number.isInteger(curIx)
        ? curIx === inlineGroupBounds.start
        : false;
    const previewShiftDown =
      samePreviewBucket &&
      !isDragging &&
      Number.isInteger(curIx) &&
      !dropTargetRef.current?.isLast &&
      Number.isInteger(previewInsertAt) &&
      !inlineGroupBounds &&
      curIx >= previewInsertAt;
    const previewShiftPx = previewShiftDown ? 56 : 0;
    const activeInlineDragGroup = activeInlineDragGroupRef.current;
    const isInlineGroupDrag = false;
    const suppressSortableTransform =
      Boolean(activeID?.eleID) &&
      isDraggingLayout &&
      Boolean(preview) &&
      !isInlineGroupDrag;
    // Keep the dragging element's layout slot visible (Data Slider-like behavior)
    // so users can see insertion space while reordering in column areas.
    const hideSourceWhileDragging =
      builderMode === "Layout Mode" &&
      isDraggingLayout &&
      isDragging &&
      Boolean(activeID?.eleID);
    const isInlineGroupedDragMember = false;
    const collapseDraggingSlot =
      hideSourceWhileDragging && samePreviewBucket;
    const baseTransform =
      !suppressSortableTransform && transform
        ? CSS.Transform.toString(transform)
        : undefined;
    const previewOffsetY = !collapseDraggingSlot && previewShiftPx > 0 ? previewShiftPx : 0;
    const splitPreviewTransform = suppressSortableTransform
      ? `translate3d(0, ${previewOffsetY}px, 0)`
      : undefined;
    const composedTransform = baseTransform ?? splitPreviewTransform;
    const splitPreviewTransition =
      !isDragging && suppressSortableTransform
        ? "transform 200ms ease, opacity 200ms ease"
        : undefined;
    const sortableTransition = isDragging
      ? undefined
      : splitPreviewTransition ?? splitTransitionCss ?? transition;
    const style = {
      transform: composedTransform,
      transition: sortableTransition,
      opacity: isInlineGroupedDragMember || hideSourceWhileDragging ? 0 : 1,
      visibility:
        isInlineGroupedDragMember || hideSourceWhileDragging
          ? "hidden"
          : "visible",
      willChange: "transform",
      touchAction: "none",
      cursor: isDragging ? "grabbing" : "grab",
      position: "relative",
      ...(builderMode === "Layout Mode" && isDraggingLayout && curIx >= 0
        ? { zIndex: curIx + 1 }
        : {}),
      ...(isDragging ? { zIndex: 1200 } : {}),
      width: tightSortableWidth ? "auto" : "100%",
      ...(tightSortableWidth
        ? { maxWidth: "100%", flexShrink: 0 }
        : {}),
      ...(collapseDraggingSlot
        ? {
            height: 0,
            minHeight: 0,
            margin: 0,
            padding: 0,
            border: 0,
            overflow: "hidden",
            pointerEvents: "none",
            ...(tightSortableWidth
              ? {
                  width: 0,
                  minWidth: 0,
                  maxWidth: 0,
                  flexBasis: 0,
                }
              : {}),
          }
        : {}),
    };
    const sortableBindings = isLayoutMode ? { ...attributes, ...listeners } : {};




  useEffect(() => {
      if(isDragging && selectID.status && selectID.ids?.eleID){
        setSelectID({ids:{},status:""});
      }
    }, [isDragging]);

    if (type === "null") {
      return (
        <Box
          ref={setNodeRef}
          {...sortableBindings}
          style={style}
          id={`${containerId}/${columnId}${spanId?`/${spanId}${nestedSpanId?`/${nestedSpanId}`:""}`:""}`}
          data-drop="ELEMENT"
          className="column-area"
          onMouseMove={(e) => {
            scheduleBTNUpdate(e);
          }}
          onDragOver={(e) => {
            handleDuring(e);
          }}
        >
          {children}
        </Box>
      );
    }


      const ids = {conID:containerId,colID:columnId,spnID:spanId,nestID:nestedSpanId}

      const selected = selectID.ids?.eleID === id && selectID.status === "Delete"
      const isEditorHoverOnThis =
        builderMode === "Editor Mode" && hoverElement?.id === id;
      const partHoverOnlyType =
        type === "list" || type === "imgh" || type === "imgo" || type === "post" || type === "lstb" || type === "crl" || type === "dts" || type === "ctg" || type === "tabs" || type === "acc" || type === "btw";
      const isEditorHoverTarget =
        isEditorHoverOnThis &&
        !hoverElement?.partType &&
        !partHoverOnlyType &&
        !selected;
      const isEditorPartHover =
        isEditorHoverOnThis &&
        Boolean(hoverElement?.partType) &&
        !selected;

      const resolveHoverMeta = (rawTarget) => {
        const targetEl =
          rawTarget && typeof rawTarget === "object"
            ? rawTarget.nodeType === 1
              ? rawTarget
              : rawTarget.nodeType === 3
                ? rawTarget.parentElement
                : null
            : null;
        if (!targetEl) return { id };
        const listPartEl = targetEl.closest?.("[data-list-part]");
        if (listPartEl) {
          const partName = listPartEl.getAttribute("data-list-part") || "text";
          const itemIndex = listPartEl.getAttribute("data-list-item-index");
          return {
            id,
            partType: "list",
            partName,
            itemIndex: itemIndex != null ? String(itemIndex) : null,
          };
        }
        const imageHoverPartEl = targetEl.closest?.("[data-image-hover-part]");
        if (imageHoverPartEl) {
          const partName =
            imageHoverPartEl.getAttribute("data-image-hover-part") || "text";
          return {
            id,
            partType: "imageHover",
            partName,
            itemIndex: null,
          };
        }
        const listBoxPartEl = targetEl.closest?.("[data-listbox-part]");
        if (listBoxPartEl) {
          const partName =
            listBoxPartEl.getAttribute("data-listbox-part") || "title";
          const itemIndex = listBoxPartEl.getAttribute("data-listbox-item-index");
          return {
            id,
            partType: "listBox",
            partName,
            itemIndex: itemIndex != null ? String(itemIndex) : null,
          };
        }
        const carouselPartEl = targetEl.closest?.("[data-carousel-part]");
        if (carouselPartEl) {
          const partName =
            carouselPartEl.getAttribute("data-carousel-part") || "caption";
          const itemIndex = targetEl
            .closest?.("[data-carousel-slide-index]")
            ?.getAttribute?.("data-carousel-slide-index");
          return {
            id,
            partType: "carousel",
            partName,
            itemIndex: itemIndex != null ? String(itemIndex) : null,
          };
        }
        if (type === "tabs") {
          const tabsHeaderEl = targetEl.closest?.("[data-tabs-part='tab-header']");
          if (tabsHeaderEl) {
            const tabId = tabsHeaderEl.getAttribute("data-tabs-tab-id");
            return {
              id,
              partType: "tabs",
              partName: "tab-header",
              itemIndex: tabId != null ? String(tabId) : null,
            };
          }
          const tabNestedEl = targetEl.closest?.("[data-tab-nested-id]");
          if (tabNestedEl) {
            const nestedId = tabNestedEl.getAttribute("data-tab-nested-id");
            return {
              id,
              partType: "tabsNested",
              partName: String(nestedId),
              itemIndex: null,
            };
          }
          return { id };
        }
        if (type === "acc") {
          const accNestedEl = targetEl.closest?.("[data-tab-nested-id]");
          if (accNestedEl) {
            const nestedId = accNestedEl.getAttribute("data-tab-nested-id");
            return {
              id,
              partType: "accNested",
              partName: String(nestedId),
              itemIndex: null,
            };
          }
          return { id };
        }
        if (type === "btw") {
          const betweenPartEl = targetEl.closest?.("[data-between-part]");
          if (betweenPartEl) {
            const partName = betweenPartEl.getAttribute("data-between-part");
            return {
              id,
              partType: "between",
              partName: String(partName),
              itemIndex: null,
            };
          }
          return { id };
        }
        const postPartEl = targetEl.closest?.("[data-post-part]");
        if (type === "post") {
          const postNestedEl = targetEl.closest?.("[data-tab-nested-id]");
          const nestedId = postNestedEl?.getAttribute?.("data-tab-nested-id");
          if (nestedId) {
            return {
              id,
              partType: "postNested",
              partName: String(nestedId),
              itemIndex: null,
            };
          }
        }
        if (postPartEl) {
          const partName = postPartEl.getAttribute("data-post-part") || "content";
          return {
            id,
            partType: "post",
            partName,
            itemIndex: null,
          };
        }
        return { id };
      };

      


      let ID = `${containerId}/${columnId}/`
      const HTML_ID = ()=>{
       
        if(spanId){
          ID += `${spanId}/`
        }if(nestedSpanId){
          ID += `${nestedSpanId}/`
        }

        ID += id
      }

      HTML_ID()


      const click=(e,status)=>{
        if(builderMode !== "Editor Mode"){
          e.preventDefault();
        }else{
          return;
        }
        if (selectID.ids?.eleID === id && selectID.status === status) {
          setSelectID({ids:{},status:""});
          if(status === "Edit"){
            setPositionElementSetting({x:null,y:null})
          }
          return;
        }
        setSelectID({
          ids:{...ids,eleID:id},
          status
        });
        if(status === "Edit"){
          setPositionElementSetting({x:e.clientX,y:e.clientY})
        }
        
      }


    return (
      <Box
        ref={setNodeRef}
        {...sortableBindings}
        style={style}
        id={ID}
        data-drop="ELEMENT"
        onMouseMove={(e) => {
          if (builderMode === "Layout Mode") {
            // Ensure element dragging is immediately enabled while hovering an element.
            setDisableConDrag(true);
            setDisableEleDrag(false);
            scheduleDND(e);
          }
          scheduleBTNUpdate(e);
          const nextMeta = resolveHoverMeta(e.target);
          setHoverElement((prev) =>
            prev?.id === nextMeta.id &&
            prev?.partType === nextMeta.partType &&
            prev?.partName === nextMeta.partName &&
            prev?.itemIndex === nextMeta.itemIndex
              ? prev
              : nextMeta
          );
        }}
        onDragOver={(e) => {
          handleDuring(e);
        }}
        onMouseDownCapture={(e) => {
          if (builderMode !== "Editor Mode") return;
          if (e.detail < 2) return;
          if (type === "text") return;
          const rawTarget = e.target;
          const targetEl =
            rawTarget && typeof rawTarget === "object"
              ? rawTarget.nodeType === 1
                ? rawTarget
                : rawTarget.nodeType === 3
                  ? rawTarget.parentElement
                  : null
              : null;
          const isNativeEditableTarget = Boolean(
            targetEl?.closest?.("input, textarea, [contenteditable='true']")
          );
          if (isNativeEditableTarget) return;
          /* กัน selection ที่ลากไปโดนข้อความ element อื่นในคอลัมน์เดียวกัน */
          e.preventDefault();
          const selection =
            typeof window !== "undefined" &&
            typeof window.getSelection === "function"
              ? window.getSelection()
              : null;
          if (selection && selection.rangeCount > 0) {
            selection.removeAllRanges();
          }
        }}
        onClick={(e) => {
          if (builderMode === "Editor Mode" && (type === "tbl" || type === "btw")) return;
          if (
            (type === "img" ||
              type === "imgh" ||
              type === "imgo" ||
              type === "bnr" ||
              type === "lbx" ||
              type === "vid" ||
              type === "btn" ||
              type === "btnG" ||
              type === "icon" ||
              type === "text" ||
              type === "heading" ||
              type === "list" ||
              type === "crl" ||
              type === "dts" ||
              type === "ctg" ||
              type === "tbl" ||
              type === "btw" ||
              type === "lstb" ||
              type === "ctn" ||
              type === "tabs" ||
              type === "acc" ||
              type === "post") &&
            e.detail === 2
          )
            return;
          click(e, "Delete");
        }}
        onDoubleClickCapture={(e) => {
          if (
            builderMode === "Layout Mode" &&
            LAYOUT_MODE_SINGLE_CLICK_ONLY_TYPES.has(type)
          ) {
            // โหมดออกแบบของ element พื้นฐาน: ไม่ให้ double-click ทำงาน
            e.preventDefault();
            e.stopPropagation();
            // เคลียร์กรอบแดงจากคลิกแรกของ double-click
            setSelectID({ ids: {}, status: "" });
            setPositionElementSetting({ x: null, y: null });
            return;
          }
          const rawTarget = e.target;
          const targetEl =
            rawTarget && typeof rawTarget === "object"
              ? rawTarget.nodeType === 1
                ? rawTarget
                : rawTarget.nodeType === 3
                  ? rawTarget.parentElement
                  : null
              : null;
          const isNativeEditableTarget = Boolean(
            targetEl?.closest?.("input, textarea, [contenteditable='true']")
          );
          if (builderMode === "Editor Mode" && !isNativeEditableTarget) {
            /* กัน browser selection (ลากคลุมข้อความ/รูป) ตอนดับเบิลคลิกเปิดแผง */
            e.preventDefault();
            const selection =
              typeof window !== "undefined" &&
              typeof window.getSelection === "function"
                ? window.getSelection()
                : null;
            if (selection && selection.rangeCount > 0) {
              selection.removeAllRanges();
            }
          }
          /* Tabs/Accordion/Post/Data Slider/Catagories: ตรวจสอบว่า double-click อยู่บน nested element หรือเปล่า */
          if (type === "tabs" || type === "acc" || type === "post" || type === "dts" || type === "ctg") {
            const path =
              typeof e?.nativeEvent?.composedPath === "function"
                ? e.nativeEvent.composedPath()
                : [];
            const findInPath = (selector) => {
              const fromTarget = targetEl?.closest?.(selector);
              if (fromTarget) return fromTarget;
              for (const node of path) {
                if (
                  node &&
                  typeof node === "object" &&
                  node.nodeType === 1 &&
                  typeof node.matches === "function" &&
                  node.matches(selector)
                ) {
                  return node;
                }
              }
              return null;
            };
            const nestedDiv = findInPath("[data-tab-nested-id]");
            const isTabsTabTrigger = !!findInPath("[data-tabs-tab-name-trigger='true']");
            const isDataSliderTabTrigger = !!findInPath("[data-data-slider-tab-name-trigger='true']");
            const isAccordionTabTrigger = !!findInPath("[data-accordion-tab-trigger='true']");
            const isPostImagePane = !!findInPath("[data-post-image-pane='true']");
            const getNestedEl = () => {
              if (!nestedDiv) return null;
              const nestedId = nestedDiv.dataset?.tabNestedId;
              if (!nestedId) return null;
              const tabIdNode = findInPath("[data-tab-id]");
              const tabId =
                tabIdNode?.dataset?.tabId ||
                (type === "post"
                  ? "post-main"
                  : type === "dts"
                    ? mergeDataSliderElement(elementData).dataSliderActiveId
                  : type === "ctg"
                    ? mergeCatagoriesElement(elementData).catagoriesActiveId
                    : undefined);
              let nestedEl = findLayoutElementById(layouts, nestedId);
              if (!nestedEl && type === "post" && Array.isArray(elementData?.postElements)) {
                nestedEl = elementData.postElements.find(
                  (item) => String(item?.id) === String(nestedId)
                );
              }
              if (
                !nestedEl &&
                (type === "dts" || type === "ctg") &&
                Array.isArray(
                  type === "dts"
                    ? mergeDataSliderElement(elementData)?.dataSliderItems
                    : mergeCatagoriesElement(elementData)?.catagoriesItems
                )
              ) {
                const slideId = String(tabIdNode?.dataset?.tabId || "");
                const listHost =
                  type === "dts"
                    ? mergeDataSliderElement(elementData).dataSliderItems
                    : mergeCatagoriesElement(elementData).catagoriesItems;
                const slide = listHost.find(
                  (it) => String(it?.id) === slideId
                );
                const nestedList = Array.isArray(slide?.elements) ? slide.elements : [];
                nestedEl = nestedList.find(
                  (item) => String(item?.id) === String(nestedId)
                );
              }
              return {
                el: nestedEl,
                tabId,
              };
            };

            if (builderMode === "Layout Mode") {
              const found = getNestedEl();
              if (found?.el && type !== "dts") {
                e.preventDefault();
                e.stopPropagation();
                setSelectID({ ids: {}, status: "" });
                setPositionElementSetting({ x: null, y: null });
                openTabsNestedElementEditor(elementData.id, found.tabId, found.el);
                return;
              }
              if (type === "acc" && !isAccordionTabTrigger) {
                return;
              }
              if (type === "post" && nestedDiv) {
                return;
              }
              /* ไม่ได้คลิกบน nested element → เปิด Tabs panel */
              e.preventDefault();
              e.stopPropagation();
              setSelectID({ ids: {}, status: "" });
              setPositionElementSetting({ x: null, y: null });
              openOffcavanas(
                type === "tabs"
                  ? "Tabs"
                  : type === "acc"
                    ? "Accordion"
                    : type === "dts"
                      ? "Data Slider"
                      : type === "ctg"
                        ? "Catagories"
                      : "Post",
                elementData,
                (next) =>
                patchLayoutElement(next, { eleID: elementData.id })
              );
              return;
            }

            /* Editor Mode: จัดการเฉพาะ types ที่ไม่มี internal double-click handler */
            if (builderMode === "Editor Mode") {
              const found = getNestedEl();
              if (found?.el) {
                const nt = found.el.type;
                const needsOuterHandler =
                  nt === "text" || nt === "heading" || nt === "img" || nt === "bnr" ||
                  nt === "lbx" || nt === "vid" || nt === "btn" || nt === "btnG" || nt === "icon" || nt === "acc" || nt === "post" || nt === "imgh" || nt === "imgo" || nt === "tbl" || nt === "btw" || nt === "divider" ||
                  nt === "ctn" || nt === "list" || nt === "crl" || nt === "lstb";
                if (needsOuterHandler) {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectID({ ids: {}, status: "" });
                  setPositionElementSetting({ x: null, y: null });
                  openTabsNestedElementEditor(elementData.id, found.tabId, found.el);
                  return;
                }
              }
              if (type === "tabs" && isTabsTabTrigger) {
                e.preventDefault();
                e.stopPropagation();
                setSelectID({ ids: {}, status: "" });
                setPositionElementSetting({ x: null, y: null });
                openOffcavanas("Tabs", elementData, (next) =>
                  patchLayoutElement(next, { eleID: elementData.id })
                );
                return;
              }
              if (type === "dts" && isDataSliderTabTrigger) {
                e.preventDefault();
                e.stopPropagation();
                setSelectID({ ids: {}, status: "" });
                setPositionElementSetting({ x: null, y: null });
                openOffcavanas("Data Slider", elementData, (next) =>
                  patchLayoutElement(next, { eleID: elementData.id })
                );
                return;
              }
              if (type === "ctg" && isDataSliderTabTrigger) {
                e.preventDefault();
                e.stopPropagation();
                setSelectID({ ids: {}, status: "" });
                setPositionElementSetting({ x: null, y: null });
                openOffcavanas("Catagories", elementData, (next) =>
                  patchLayoutElement(next, { eleID: elementData.id })
                );
                return;
              }
              if (type === "acc" && isAccordionTabTrigger) {
                e.preventDefault();
                e.stopPropagation();
                setSelectID({ ids: {}, status: "" });
                setPositionElementSetting({ x: null, y: null });
                openOffcavanas("Accordion", elementData, (next) =>
                  patchLayoutElement(next, { eleID: elementData.id })
                );
                return;
              }
              if (type === "post" && isPostImagePane) {
                e.preventDefault();
                e.stopPropagation();
                setSelectID({ ids: {}, status: "" });
                setPositionElementSetting({ x: null, y: null });
                openOffcavanas("Image", elementData, (next) =>
                  patchLayoutElement(next, { eleID: elementData.id })
                );
                return;
              }
              if (type === "post") {
                e.preventDefault();
                e.stopPropagation();
                setSelectID({ ids: {}, status: "" });
                setPositionElementSetting({ x: null, y: null });
                openOffcavanas("Post", elementData, (next) =>
                  patchLayoutElement(next, { eleID: elementData.id })
                );
                return;
              }
              // Editor Mode (Data Slider): do not open host panel on empty-area double click.
              if (type === "ctg") {
                e.preventDefault();
                e.stopPropagation();
                setSelectID({ ids: {}, status: "" });
                setPositionElementSetting({ x: null, y: null });
                openOffcavanas("Catagories", elementData, (next) =>
                  patchLayoutElement(next, { eleID: elementData.id })
                );
                return;
              }
            }
            return;
          }
          /* Design Mode: List Item / List iCons / Button Group → เปิดจัดการ items */
          if (builderMode === "Layout Mode" && type === "list") {
            e.preventDefault();
            e.stopPropagation();
            setSelectID({ ids: {}, status: "" });
            setPositionElementSetting({ x: null, y: null });
            openOffcavanas(
              elementData?.buttonMultiElement === true
                ? "Button Group"
                : "List",
              elementData,
              (next) =>
              patchLayoutElement(next, { eleID: elementData.id })
            );
            return;
          }
          /* Design Mode: Carousel → เปิด Carousel panel */
          if (builderMode === "Layout Mode" && type === "crl") {
            e.preventDefault();
            e.stopPropagation();
            setSelectID({ ids: {}, status: "" });
            setPositionElementSetting({ x: null, y: null });
            openOffcavanas("Carousel", elementData, (next) =>
              patchLayoutElement(next, { eleID: elementData.id })
            );
            return;
          }
          if (builderMode === "Layout Mode" && type === "dts") {
            e.preventDefault();
            e.stopPropagation();
            setSelectID({ ids: {}, status: "" });
            setPositionElementSetting({ x: null, y: null });
            openOffcavanas("Data Slider", elementData, (next) =>
              patchLayoutElement(next, { eleID: elementData.id })
            );
            return;
          }
          if (builderMode === "Layout Mode" && type === "ctg") {
            e.preventDefault();
            e.stopPropagation();
            setSelectID({ ids: {}, status: "" });
            setPositionElementSetting({ x: null, y: null });
            openOffcavanas("Catagories", elementData, (next) =>
              patchLayoutElement(next, { eleID: elementData.id })
            );
            return;
          }
          if (builderMode === "Layout Mode" && type === "lstb") {
            e.preventDefault();
            e.stopPropagation();
            setSelectID({ ids: {}, status: "" });
            setPositionElementSetting({ x: null, y: null });
            openOffcavanas("List Box", elementData, (next) =>
              patchLayoutElement(next, { eleID: elementData.id })
            );
            return;
          }
          if (builderMode === "Layout Mode" && type === "tbl") {
            e.preventDefault();
            e.stopPropagation();
            setSelectID({ ids: {}, status: "" });
            setPositionElementSetting({ x: null, y: null });
            openOffcavanas("Table", elementData, (next) =>
              patchLayoutElement(next, { eleID: elementData.id })
            );
            return;
          }
          if (builderMode === "Layout Mode" && type === "btw") {
            e.preventDefault();
            e.stopPropagation();
            setSelectID({ ids: {}, status: "" });
            setPositionElementSetting({ x: null, y: null });
            openOffcavanas("Between", elementData, (next) =>
              patchLayoutElement(next, { eleID: elementData.id })
            );
            return;
          }
          if (builderMode === "Layout Mode" && type === "acc") {
            e.preventDefault();
            e.stopPropagation();
            setSelectID({ ids: {}, status: "" });
            setPositionElementSetting({ x: null, y: null });
            openOffcavanas("Accordion", elementData, (next) =>
              patchLayoutElement(next, { eleID: elementData.id })
            );
            return;
          }
          if (builderMode === "Layout Mode" && type === "post") {
            e.preventDefault();
            e.stopPropagation();
            setSelectID({ ids: {}, status: "" });
            setPositionElementSetting({ x: null, y: null });
            openOffcavanas("Post", elementData, (next) =>
              patchLayoutElement(next, { eleID: elementData.id })
            );
            return;
          }
          if (builderMode === "Layout Mode" && type === "imgh") {
            e.preventDefault();
            e.stopPropagation();
            setSelectID({ ids: {}, status: "" });
            setPositionElementSetting({ x: null, y: null });
            openOffcavanas("Image Hover", elementData, (next) =>
              patchLayoutElement(next, { eleID: elementData.id })
            );
            return;
          }
          if (builderMode === "Layout Mode" && type === "imgo") {
            e.preventDefault();
            e.stopPropagation();
            setSelectID({ ids: {}, status: "" });
            setPositionElementSetting({ x: null, y: null });
            const currentOffset = Number(elementData?.imageHoverContentOffsetY);
            const overlayInitFlag = elementData?.__overlayPanelInitialized;
            const isPendingOverlayInit =
              overlayInitFlag === false ||
              (overlayInitFlag == null &&
                (!Number.isFinite(currentOffset) || currentOffset === 62));
            const panelElementData = isPendingOverlayInit
              ? {
                  ...elementData,
                  // ใช้ค่า default ตอนเปิด panel เท่านั้น
                  // จะถูกบันทึกจริงก็ต่อเมื่อมีการแก้ไขแล้ว onUpdate ถูกเรียก
                  __overlayPanelInitialized: true,
                  imageHoverBackgroundEnabled: true,
                  imageHoverContentOffsetY: 90,
                }
              : elementData;
            openOffcavanas("Overlay", panelElementData, (next) =>
              patchLayoutElement(
                {
                  ...next,
                  __overlayPanelInitialized: true,
                },
                { eleID: elementData.id }
              )
            );
            return;
          }
          if (builderMode === "Layout Mode" && type === "divider") {
            e.preventDefault();
            e.stopPropagation();
            setSelectID({ ids: {}, status: "" });
            setPositionElementSetting({ x: null, y: null });
            openOffcavanas("Divider", elementData, (next) =>
              patchLayoutElement(next, { eleID: elementData.id })
            );
            return;
          }
          if (builderMode !== "Editor Mode") return;
          if (type === "img") {
            e.preventDefault();
            e.stopPropagation();
            setSelectID({ ids: {}, status: "" });
            setPositionElementSetting({ x: null, y: null });
            openOffcavanas("Image", elementData, (next) =>
              patchLayoutElement(next, { eleID: elementData.id })
            );
            return;
          }
          if (type === "imgh") {
            e.preventDefault();
            e.stopPropagation();
            setSelectID({ ids: {}, status: "" });
            setPositionElementSetting({ x: null, y: null });
            const rawTarget = e.target;
            const targetEl =
              rawTarget && typeof rawTarget === "object"
                ? rawTarget.nodeType === 1
                  ? rawTarget
                  : rawTarget.nodeType === 3
                  ? rawTarget.parentElement
                  : null
                : null;
            const partEl = targetEl?.closest?.("[data-image-hover-part]");
            const part = partEl?.dataset?.imageHoverPart;
            if (part === "text") {
              setTextEditModal({
                mode: "image-hover-text",
                elementData: {
                  id: elementData.id,
                  label:
                    typeof elementData?.imageHoverText === "string"
                      ? elementData.imageHoverText
                      : "",
                  textParagraph: elementData?.imageHoverTextParagraph,
                },
              });
              return;
            }
            if (part === "icon") {
              const iconPanelData = mergeIconElement({
                ...IMAGE_HOVER_ICON_PANEL_DEFAULT,
                ...(elementData?.imageHoverIconElement || {}),
                id: `${elementData.id}__imgh-icon`,
                type: "icon",
                __imageHoverIconEdit: {
                  imageHoverElementId: elementData.id,
                },
              });
              openOffcavanas("Icon", iconPanelData, null);
              return;
            }
            if (part === "button") {
              const buttonPanelData = {
                ...IMAGE_HOVER_BUTTON_PANEL_DEFAULT,
                ...(elementData?.imageHoverButtonElement || {}),
                id: `${elementData.id}__imgh-btn`,
                type: "btn",
                __imageHoverButtonEdit: {
                  imageHoverElementId: elementData.id,
                },
              };
              openOffcavanas("Button", buttonPanelData, null);
              return;
            }
            // Editor Mode: double-click on empty Image Hover area does nothing.
            return;
          }
          if (type === "imgo") {
            e.preventDefault();
            e.stopPropagation();
            setSelectID({ ids: {}, status: "" });
            setPositionElementSetting({ x: null, y: null });
            const rawTarget = e.target;
            const targetEl =
              rawTarget && typeof rawTarget === "object"
                ? rawTarget.nodeType === 1
                  ? rawTarget
                  : rawTarget.nodeType === 3
                  ? rawTarget.parentElement
                  : null
                : null;
            const partEl = targetEl?.closest?.("[data-image-hover-part]");
            const part = partEl?.dataset?.imageHoverPart;
            if (part === "text") {
              setTextEditModal({
                mode: "image-hover-text",
                elementData: {
                  id: elementData.id,
                  label:
                    typeof elementData?.imageHoverText === "string"
                      ? elementData.imageHoverText
                      : "",
                  textParagraph: elementData?.imageHoverTextParagraph,
                },
              });
              return;
            }
            if (part === "icon") {
              const iconPanelData = mergeIconElement({
                ...IMAGE_HOVER_ICON_PANEL_DEFAULT,
                ...(elementData?.imageHoverIconElement || {}),
                id: `${elementData.id}__imgh-icon`,
                type: "icon",
                __imageHoverIconEdit: {
                  imageHoverElementId: elementData.id,
                },
              });
              openOffcavanas("Icon", iconPanelData, null);
              return;
            }
            if (part === "button") {
              const buttonPanelData = {
                ...IMAGE_HOVER_BUTTON_PANEL_DEFAULT,
                ...(elementData?.imageHoverButtonElement || {}),
                id: `${elementData.id}__imgh-btn`,
                type: "btn",
                __imageHoverButtonEdit: {
                  imageHoverElementId: elementData.id,
                },
              };
              openOffcavanas("Button", buttonPanelData, null);
              return;
            }
            return;
          }
          if (type === "bnr") {
            e.preventDefault();
            e.stopPropagation();
            setSelectID({ ids: {}, status: "" });
            setPositionElementSetting({ x: null, y: null });
            openOffcavanas("Banner", elementData, (next) =>
              patchLayoutElement(next, { eleID: elementData.id })
            );
            return;
          }
          if (type === "lbx") {
            e.preventDefault();
            e.stopPropagation();
            setSelectID({ ids: {}, status: "" });
            setPositionElementSetting({ x: null, y: null });
            openOffcavanas("Lightbox", elementData, (next) =>
              patchLayoutElement(next, { eleID: elementData.id })
            );
            return;
          }
          if (type === "vid") {
            e.preventDefault();
            e.stopPropagation();
            setSelectID({ ids: {}, status: "" });
            setPositionElementSetting({ x: null, y: null });
            openOffcavanas("Video", elementData, (next) =>
              patchLayoutElement(next, { eleID: elementData.id })
            );
            return;
          }
          if (type === "btn" || type === "btnG") {
            e.preventDefault();
            e.stopPropagation();
            setSelectID({ ids: {}, status: "" });
            setPositionElementSetting({ x: null, y: null });
            const rawTarget = e.target;
            const targetEl =
              rawTarget && typeof rawTarget === "object"
                ? rawTarget.nodeType === 1
                  ? rawTarget
                  : rawTarget.nodeType === 3
                    ? rawTarget.parentElement
                    : null
                : null;
            const specialTextEl = targetEl?.closest?.("[data-button-special-text]");
            if (specialTextEl && isButtonSpecialTextEnabled(elementData)) {
              setTextEditModal({
                mode: "button-special-text",
                elementData: {
                  id: elementData.id,
                  label: resolveButtonSpecialTextLabel(elementData),
                  textParagraph: elementData?.buttonSpecialTextParagraph,
                },
              });
              return;
            }
            openOffcavanas("Button", elementData, (next) =>
              patchLayoutElement(next, { eleID: elementData.id })
            );
            return;
          }
          if (type === "list" && elementData?.buttonMultiElement === true) {
            e.preventDefault();
            e.stopPropagation();
            setSelectID({ ids: {}, status: "" });
            setPositionElementSetting({ x: null, y: null });
            const rawTarget = e.target;
            const targetEl =
              rawTarget && typeof rawTarget === "object"
                ? rawTarget.nodeType === 1
                  ? rawTarget
                  : rawTarget.nodeType === 3
                    ? rawTarget.parentElement
                    : null
                : null;
            const partBtn = targetEl?.closest?.("[data-button-multi-index]");
            const indexRaw = partBtn?.getAttribute?.("data-button-multi-index");
            const itemIdRaw = partBtn?.getAttribute?.("data-button-multi-item-id");
            const itemIndexNum = Number(indexRaw);
            const mergedList = mergeListElement(elementData);
            const items = Array.isArray(mergedList?.listItems) ? mergedList.listItems : [];
            const itemId =
              typeof itemIdRaw === "string" && itemIdRaw.trim() ? itemIdRaw.trim() : null;
            const idIndex =
              itemId == null
                ? -1
                : items.findIndex((it) => String(it?.id || "") === itemId);
            const safeIdx =
              idIndex >= 0
                ? idIndex
                :
              Number.isFinite(itemIndexNum) &&
              itemIndexNum >= 0 &&
              itemIndexNum < items.length
                ? itemIndexNum
                : 0;
            const item = items[safeIdx] || {};
            const useSlot2 = safeIdx % 2 === 1;
            const fillRef =
              item?.buttonFill ??
              (useSlot2
                ? mergedList?.button2Fill ?? mergedList?.buttonFill
                : mergedList?.buttonFill);
            const labelColorRef =
              item?.buttonLabelColor ??
              (useSlot2
                ? mergedList?.button2LabelColor ?? mergedList?.buttonLabelColor
                : mergedList?.buttonLabelColor);
            const fillOpacityRef =
              item?.buttonFillOpacity ??
              (useSlot2
                ? mergedList?.button2FillOpacity ?? mergedList?.buttonFillOpacity
                : mergedList?.buttonFillOpacity);
            const labelOpacityRef =
              item?.buttonLabelOpacity ??
              (useSlot2
                ? mergedList?.button2LabelOpacity ?? mergedList?.buttonLabelOpacity
                : mergedList?.buttonLabelOpacity);
            const panelData = {
              ...IMAGE_HOVER_BUTTON_PANEL_DEFAULT,
              buttonFill: fillRef,
              buttonLabelColor: labelColorRef,
              buttonFillOpacity: fillOpacityRef,
              buttonLabelOpacity: labelOpacityRef,
              buttonVariant: item?.buttonVariant ?? mergedList?.buttonVariant,
              buttonRadius: item?.buttonRadius ?? mergedList?.buttonRadius,
              buttonFontSize: item?.buttonFontSize ?? mergedList?.buttonFontSize,
              buttonPaddingX: item?.buttonPaddingX ?? mergedList?.buttonPaddingX,
              buttonPaddingY: item?.buttonPaddingY ?? mergedList?.buttonPaddingY,
              buttonBorderWidth:
                item?.buttonBorderWidth ?? mergedList?.buttonBorderWidth,
              buttonBorderColor:
                item?.buttonBorderColor ?? mergedList?.buttonBorderColor,
              buttonBorderOpacity:
                item?.buttonBorderOpacity ?? mergedList?.buttonBorderOpacity,
              buttonBold:
                item?.buttonBold ??
                mergedList?.buttonBold ??
                IMAGE_HOVER_BUTTON_PANEL_DEFAULT.buttonBold,
              buttonLayoutAlign:
                item?.buttonLayoutAlign ?? mergedList?.buttonLayoutAlign,
              buttonFullWidth:
                item?.buttonFullWidth ?? mergedList?.buttonFullWidth,
              linkIcon: item?.faIcon ?? { name: "faShieldHalved", type: "fas" },
              id: `${elementData.id}__bm_btn_${safeIdx}`,
              type: "btn",
              __buttonMultiButtonEdit: {
                listElementId: elementData.id,
                itemIndex: safeIdx,
                itemId,
              },
            };
            openOffcavanas("Button", panelData, null);
            return;
          }
          if (type === "icon") {
            e.preventDefault();
            e.stopPropagation();
            setSelectID({ ids: {}, status: "" });
            setPositionElementSetting({ x: null, y: null });
            openOffcavanas("Icon", elementData, (next) =>
              patchLayoutElement(next, { eleID: elementData.id })
            );
            return;
          }
          if (type === "text") {
            e.preventDefault();
            e.stopPropagation();
            setSelectID({ ids: {}, status: "" });
            setPositionElementSetting({ x: null, y: null });
            setTextEditModal({ elementData });
            return;
          }
          if (type === "heading") {
            e.preventDefault();
            e.stopPropagation();
            setSelectID({ ids: {}, status: "" });
            setPositionElementSetting({ x: null, y: null });
            openOffcavanas("Heading", elementData, (next) =>
              patchLayoutElement(next, { eleID: elementData.id })
            );
            return;
          }
          if (type === "divider") {
            e.preventDefault();
            e.stopPropagation();
            setSelectID({ ids: {}, status: "" });
            setPositionElementSetting({ x: null, y: null });
            openOffcavanas("Divider", elementData, (next) =>
              patchLayoutElement(next, { eleID: elementData.id })
            );
            return;
          }
          if (type === "ctn") {
            e.preventDefault();
            e.stopPropagation();
            setSelectID({ ids: {}, status: "" });
            setPositionElementSetting({ x: null, y: null });
            openOffcavanas("Counter", elementData, (next) =>
              patchLayoutElement(next, { eleID: elementData.id })
            );
            return;
          }
          if (type === "ctg") {
            e.preventDefault();
            e.stopPropagation();
            setSelectID({ ids: {}, status: "" });
            setPositionElementSetting({ x: null, y: null });
            openOffcavanas("Catagories", elementData, (next) =>
              patchLayoutElement(next, { eleID: elementData.id })
            );
            return;
          }
          if (type === "tbl") {
            const tblTarget = e.target?.closest?.("td");
            if (tblTarget) return;
            e.preventDefault();
            e.stopPropagation();
            setSelectID({ ids: {}, status: "" });
            setPositionElementSetting({ x: null, y: null });
            openOffcavanas("Table", elementData, (next) =>
              patchLayoutElement(next, { eleID: elementData.id })
            );
            return;
          }
          if (type === "btw") {
            e.preventDefault();
            e.stopPropagation();
            setSelectID({ ids: {}, status: "" });
            setPositionElementSetting({ x: null, y: null });
            if (builderMode === "Editor Mode") {
              const sideRaw = e.target?.closest?.("[data-between-text-side]")?.dataset?.betweenTextSide;
              const merged = mergeBetweenElement(elementData);
              const side = sideRaw === "right" ? "right" : sideRaw === "left" ? "left" : null;
              if (side) {
                const isVisible =
                  side === "left"
                    ? merged.betweenTextMode === "left" || merged.betweenTextMode === "both"
                    : merged.betweenTextMode === "right" || merged.betweenTextMode === "both";
                if (isVisible) {
                  const label =
                    side === "left"
                      ? String(merged.betweenLeftText ?? "")
                      : String(merged.betweenRightText ?? "");
                  const textParagraph =
                    side === "left"
                      ? merged.betweenLeftTextParagraph
                      : merged.betweenRightTextParagraph;
                  setTextEditModal({
                    mode: "between-text",
                    elementData: {
                      id: `${elementData.id}__btw_text_${side}`,
                      label,
                      textParagraph,
                      __betweenTextEdit: {
                        betweenElementId: elementData.id,
                        side,
                      },
                    },
                  });
                  return;
                }
              }
              const isIconTrigger = Boolean(
                e.target?.closest?.("[data-between-icon-trigger='true']")
              );
              if (isIconTrigger) {
                openOffcavanas(
                  "Icon",
                  {
                    id: `${elementData.id}__btwicon`,
                    type: "icon",
                    faIcon: merged.betweenIcon,
                    iconSize: merged.betweenIconSize,
                    containerSize: merged.betweenIconCircleSize,
                    iconShape: merged.betweenIconShape,
                    iconCornerRadius: merged.betweenIconCornerRadius,
                    iconColor: merged.betweenIconColor,
                    iconOpacity: merged.betweenIconColorOpacity,
                    backgroundColor: merged.betweenIconBgColor,
                    backgroundOpacity: merged.betweenIconBgOpacity,
                    borderEnabled: false,
                    __betweenIconEdit: {
                      betweenElementId: elementData.id,
                    },
                  },
                  null
                );
                return;
              }
            }
            openOffcavanas("Between", elementData, (next) =>
              patchLayoutElement(next, { eleID: elementData.id })
            );
            return;
          }
          if (type === "acc") {
            e.preventDefault();
            e.stopPropagation();
            setSelectID({ ids: {}, status: "" });
            setPositionElementSetting({ x: null, y: null });
            openOffcavanas("Accordion", elementData, (next) =>
              patchLayoutElement(next, { eleID: elementData.id })
            );
            return;
          }
          if (type === "post") {
            e.preventDefault();
            e.stopPropagation();
            setSelectID({ ids: {}, status: "" });
            setPositionElementSetting({ x: null, y: null });
            openOffcavanas("Post", elementData, (next) =>
              patchLayoutElement(next, { eleID: elementData.id })
            );
            return;
          }
          if (type === "dts") {
            e.preventDefault();
            e.stopPropagation();
            setSelectID({ ids: {}, status: "" });
            setPositionElementSetting({ x: null, y: null });
            openOffcavanas("Data Slider", elementData, (next) =>
              patchLayoutElement(next, { eleID: elementData.id })
            );
            return;
          }
          if (type === "ctg") {
            e.preventDefault();
            e.stopPropagation();
            setSelectID({ ids: {}, status: "" });
            setPositionElementSetting({ x: null, y: null });
            openOffcavanas("Catagories", elementData, (next) =>
              patchLayoutElement(next, { eleID: elementData.id })
            );
            return;
          }
          if (type === "crl") {
            e.preventDefault();
            e.stopPropagation();
            setSelectID({ ids: {}, status: "" });
            setPositionElementSetting({ x: null, y: null });
            const merged = mergeCarouselElement(elementData);
            const variant = merged.carouselVariant || "image";
            const cap = e.target.closest?.("[data-carousel-slide-caption]");
            if (
              (variant === "image_text" || variant === "icon_text") &&
              cap
            ) {
              const host =
                cap.closest?.("[data-carousel-slide-index]") ||
                e.target.closest?.("[data-carousel-slide-index]");
              const idxRaw = host?.getAttribute("data-carousel-slide-index");
              const idx = Number(idxRaw);
              if (Number.isFinite(idx) && idx >= 0) {
                const slide = merged.carouselSlides[idx] || {};
                const tp = slide.captionParagraph;
                const plain = (tp?.segments || [])
                  .map((s) => s.text || "")
                  .join("");
                setTextEditModal({
                  mode: "carousel-slide-caption",
                  elementData: {
                    id: `${elementData.id}__cscap__${idx}`,
                    label: plain,
                    textParagraph: tp,
                    __carouselCaptionEdit: {
                      carouselElementId: elementData.id,
                      slideIndex: idx,
                    },
                  },
                });
              }
              return;
            }
            const slideIc = e.target.closest?.("[data-carousel-slide-icon]");
            if (variant === "icon_text" && slideIc) {
              const idxRaw =
                slideIc.getAttribute?.("data-carousel-slide-index");
              const idx = Number(idxRaw);
              if (Number.isFinite(idx) && idx >= 0) {
                const slide = merged.carouselSlides[idx] || {};
                openOffcavanas(
                  "Icon",
                  {
                    type: "icon",
                    id: `${elementData.id}__csico__${idx}`,
                    __carouselSlideIconEdit: {
                      carouselElementId: elementData.id,
                      slideIndex: idx,
                    },
                    ...sliceSlideIconForPanel(slide),
                  },
                  null
                );
              }
              return;
            }
            const slideImg = e.target.closest?.("[data-carousel-slide-image]");
            const slideHost =
              e.target.closest?.("[data-carousel-slide-index]");
            const idxRaw =
              slideImg?.getAttribute("data-carousel-slide-index") ??
              slideHost?.getAttribute("data-carousel-slide-index");
            if (
              idxRaw != null &&
              (variant === "image" || variant === "image_text")
            ) {
              const idx = Number(idxRaw);
              const slide = merged.carouselSlides[idx] || {};
              const _crlLoc = findLayoutElementListIndex(layoutsRef.current, elementData.id);
              const _colSize = _crlLoc
                ? Number(layoutsRef.current[_crlLoc.conI]?.columns?.[_crlLoc.colI]?.size) || 12
                : 12;
              openOffcavanas(
                "Image",
                {
                  type: "img",
                  id: `${elementData.id}__cs__${idx}`,
                  __carouselSlideEdit: {
                    carouselElementId: elementData.id,
                    slideIndex: idx,
                    perViewDesktop: merged.carouselPerViewDesktop ?? 1,
                    colSize: _colSize,
                  },
                  ...sliceSlideImageForPanel(slide),
                },
                null
              );
              return;
            }
            /* Editor Mode fallback: ไม่ double-click บน slide content → ไม่ทำอะไร */
            return;
          }
        }}
        onMouseEnter={(e) => {
          setHoverElement(resolveHoverMeta(e.target));
        }}
        onMouseLeave={() => {
          setHoverElement((prev) => (prev?.id === id ? false : prev));
        }}
        className={listInlineRowTrailingClassName || undefined}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          justifyContent: "flex-start",
          position: "relative",
          borderRadius: "8px",
          transition:
            "box-shadow .22s ease, background-color .22s ease, outline-color .22s ease, transform .28s cubic-bezier(0.22, 1, 0.36, 1), opacity .28s cubic-bezier(0.22, 1, 0.36, 1)",
          willChange: "transform, opacity",
          ...(isEditorHoverTarget && type !== "icon" && type !== "ctn"
            ? {
                transform:
                  type === "divider"
                      ? "scale(1.025)"
                      : "scale(1.025)",
                opacity: 0.97,
                transformOrigin: "center",
              }
            : {}),
          ...(isEditorHoverTarget && type === "icon"
            ? {
                "& [data-icon-hover-target='true']": {
                  transform: "scale(1.025)",
                  opacity: 0.97,
                  transformOrigin: "center",
                  transition:
                    "transform .28s cubic-bezier(0.22, 1, 0.36, 1), opacity .28s cubic-bezier(0.22, 1, 0.36, 1)",
                },
              }
            : {}),
          ...(isEditorHoverTarget && type === "ctn"
            ? {
                "& [data-counter-hover-target='true']": {
                  transform: "scale(1.025)",
                  opacity: 0.97,
                  transformOrigin: "center",
                  transition:
                    "transform .28s cubic-bezier(0.22, 1, 0.36, 1), opacity .28s cubic-bezier(0.22, 1, 0.36, 1)",
                },
              }
            : {}),
          ...(isEditorPartHover &&
          hoverElement?.partType === "list" &&
          hoverElement?.partName
            ? {
                [`& [data-list-part="${hoverElement.partName}"]${
                  hoverElement?.itemIndex != null
                    ? `[data-list-item-index="${hoverElement.itemIndex}"]`
                    : ""
                }`]: {
                  transform:
                    hoverElement?.partName === "button"
                      ? "scale(1.025)"
                      : elementData?.listIconsElement === true &&
                        (hoverElement?.partName === "icon" || hoverElement?.partName === "text")
                        ? "scale(1.11)"
                      : elementData?.listImageElement === true &&
                        hoverElement?.partName === "image"
                        ? "scale(1.11)"
                      : hoverElement?.partName === "icon"
                        ? "scale(1.09)"
                        : "scale(1.025)",
                  opacity: 0.97,
                  transformOrigin: "center",
                  transition:
                    "transform .28s cubic-bezier(0.22, 1, 0.36, 1), opacity .28s cubic-bezier(0.22, 1, 0.36, 1)",
                },
              }
            : {}),
          ...(isEditorPartHover &&
          hoverElement?.partType === "imageHover" &&
          hoverElement?.partName
            ? {
                [`& [data-image-hover-part="${hoverElement.partName}"]`]: {
                  transform:
                    hoverElement.partName === "text"
                      ? "scale(1.025)"
                      : hoverElement.partName === "icon"
                        ? "scale(1.09)"
                        : "scale(1.025)",
                  opacity: 0.97,
                  transformOrigin: "center",
                  transition:
                    "transform .28s cubic-bezier(0.22, 1, 0.36, 1), opacity .28s cubic-bezier(0.22, 1, 0.36, 1)",
                },
              }
            : {}),
          ...(isEditorPartHover &&
          hoverElement?.partType === "post" &&
          hoverElement?.partName
            ? {
                [`& [data-post-part="${hoverElement.partName}"]`]: {
                  transform: "scale(1.025)",
                  opacity: 0.97,
                  transformOrigin: "center",
                  transition:
                    "transform .28s cubic-bezier(0.22, 1, 0.36, 1), opacity .28s cubic-bezier(0.22, 1, 0.36, 1)",
                },
              }
            : {}),
          ...(isEditorPartHover &&
          hoverElement?.partType === "postNested" &&
          hoverElement?.partName
            ? {
                [`& [data-tab-nested-id="${hoverElement.partName}"]`]: {
                  transform: "scale(1.025)",
                  opacity: 0.97,
                  transformOrigin: "center",
                  transition:
                    "transform .28s cubic-bezier(0.22, 1, 0.36, 1), opacity .28s cubic-bezier(0.22, 1, 0.36, 1)",
                },
              }
            : {}),
          ...(isEditorPartHover &&
          hoverElement?.partType === "listBox" &&
          hoverElement?.partName
            ? {
                [`& [data-listbox-part="${hoverElement.partName}"]${
                  hoverElement?.itemIndex != null
                    ? `[data-listbox-item-index="${hoverElement.itemIndex}"]`
                    : ""
                }`]: {
                  transform:
                    hoverElement?.partName === "icon" ||
                    hoverElement?.partName === "image"
                      ? "scale(1.11)"
                      : "scale(1.08)",
                  opacity: 0.97,
                  transformOrigin: "center",
                  transition:
                    "transform .28s cubic-bezier(0.22, 1, 0.36, 1), opacity .28s cubic-bezier(0.22, 1, 0.36, 1)",
                },
              }
            : {}),
          ...(isEditorPartHover &&
          hoverElement?.partType === "between" &&
          hoverElement?.partName
            ? {
                [`& [data-between-part="${hoverElement.partName}"]`]: {
                  transform:
                    hoverElement.partName === "icon" ? "scale(1.11)" : "scale(1.13)",
                  opacity: 0.97,
                  transformOrigin: "center",
                  transition:
                    "transform .28s cubic-bezier(0.22, 1, 0.36, 1), opacity .28s cubic-bezier(0.22, 1, 0.36, 1)",
                },
              }
            : {}),
          ...(isEditorPartHover &&
          (hoverElement?.partType === "tabsNested" || hoverElement?.partType === "accNested") &&
          hoverElement?.partName
            ? {
                [`& [data-tab-nested-id="${hoverElement.partName}"]`]: {
                  transform: "scale(1.025)",
                  opacity: 0.97,
                  transformOrigin: "center",
                  transition:
                    "transform .28s cubic-bezier(0.22, 1, 0.36, 1), opacity .28s cubic-bezier(0.22, 1, 0.36, 1)",
                },
              }
            : {}),
          ...(isEditorPartHover &&
          hoverElement?.partType === "carousel" &&
          hoverElement?.partName &&
          hoverElement?.partName !== "image"
            ? {
                [`& [data-carousel-part="${hoverElement.partName}"]${
                  hoverElement?.itemIndex != null
                    ? `[data-carousel-slide-index="${hoverElement.itemIndex}"]`
                    : ""
                }`]: {
                  transform:
                    hoverElement?.partName === "icon"
                      ? "scale(1.11)"
                      : "scale(1.08)",
                  opacity: 0.97,
                  transformOrigin: "center",
                  transition:
                    "transform .28s cubic-bezier(0.22, 1, 0.36, 1), opacity .28s cubic-bezier(0.22, 1, 0.36, 1)",
                },
              }
            : {}),
        }}
        
      >
        <Element
        builderMode={builderMode}
          device={device}
          isLastList={isLastList}
          listInlineDividerAfter={listInlineDividerAfter}
          theme={theme}
          ids={ids}
          elementData={elementData}
          selected={selected}
          isHover={
            hoverElement.id === id ||
            (inCounterRowGroup &&
              hoverElement?.id &&
              (() => {
                const hovered = findLayoutElementById(layouts, hoverElement.id);
                return (
                  hovered?.type === "ctn" &&
                  String(hovered?.counterRowGroupId || "").trim() !== "" &&
                  String(hovered?.counterRowGroupId || "").trim() ===
                    String(elementData?.counterRowGroupId || "").trim()
                );
              })())
          }
          isPanelOpen={String(offcanvasID || "") === String(id || "")}
          isHoverLocked={
            (type === "imgh" || type === "imgo") &&
            String(offcanvasID || "").startsWith(`${String(id || "")}__imgh-`)
          }
          editorHoverMeta={builderMode === "Editor Mode" ? hoverElement : null}
          hover={setHoverElement}
          onListEditIcon={(itemIndex) => {
            if (builderMode !== "Editor Mode") return;
            setSelectID({ ids: {}, status: "" });
            setPositionElementSetting({ x: null, y: null });
            /* Compound element (List Item หรือ List iCons) — แก้ไขไอคอนต่อ item */
            if (Array.isArray(elementData?.listItems)) {
              const merged = mergeListElement(elementData);
              const idx = Number(itemIndex);
              const safeIdx = Number.isFinite(idx) && idx >= 0 && idx < merged.listItems.length ? idx : 0;
              const item = merged.listItems[safeIdx] || {};
              if (merged.listImageElement === true) {
                openOffcavanas(
                  "Image",
                  sliceListItemImageForPanel(item, merged, safeIdx),
                  null
                );
                return;
              }
              openOffcavanas(
                "Icon",
                {
                  ...sliceListItemIconForPanel(item, merged),
                  id: `${elementData.id}__li${safeIdx}`,
                  __listItemIconEdit: {
                    listElementId: elementData.id,
                    itemIndex: safeIdx,
                  },
                },
                null
              );
              return;
            }
            /* Legacy / List iCons — เหมือนเดิม */
            openOffcavanas("Icon", elementData, (next) =>
              patchLayoutElement(next, { eleID: elementData.id })
            );
          }}
          onListEditText={(itemIndex) => {
            if (builderMode !== "Editor Mode") return;
            setSelectID({ ids: {}, status: "" });
            setPositionElementSetting({ x: null, y: null });
            /* Compound element (List Item หรือ List iCons) — แก้ไขข้อความต่อ item */
            if (Array.isArray(elementData?.listItems)) {
              const merged = mergeListElement(elementData);
              const idx = Number(itemIndex);
              const safeIdx = Number.isFinite(idx) && idx >= 0 && idx < merged.listItems.length ? idx : 0;
              const item = merged.listItems[safeIdx] || {};
              const listText = typeof item.listText === "string" ? item.listText : "";
              setTextEditModal({
                mode: "list-item-text",
                elementData: {
                  id: `${elementData.id}__li${safeIdx}`,
                  label: listText,
                  textParagraph: item.listTextParagraph,
                  listTextSize: elementData?.listTextSize,
                  __listItemTextEdit: {
                    listElementId: elementData.id,
                    itemIndex: safeIdx,
                  },
                },
              });
              return;
            }
            /* Legacy / List iCons — เหมือนเดิม */
            const legacyTitle =
              typeof elementData?.listTitle === "string"
                ? elementData.listTitle
                : "";
            const legacyDescription =
              typeof elementData?.listDescription === "string"
                ? elementData.listDescription
                : "";
            const combinedLabel =
              typeof elementData?.listText === "string" &&
              elementData.listText.trim()
                ? elementData.listText
                : legacyDescription
                  ? `${legacyTitle}\n${legacyDescription}`
                  : legacyTitle;
            setTextEditModal({
              mode: "list-text",
              elementData: {
                id: elementData.id,
                label: combinedLabel,
                textParagraph: elementData?.listTextParagraph,
                listTextSize: elementData?.listTextSize,
              },
            });
          }}
          onListBoxEditText={(itemIndex, field) =>
            openListBoxItemTextEdit(elementData, itemIndex, field)
          }
          onListBoxEditIcon={(itemIndex) =>
            openListBoxItemIconEdit(elementData, itemIndex)
          }
          onListBoxEditImage={(itemIndex) =>
            openListBoxItemImageEdit(elementData, itemIndex)
          }
          onTabElementEdit={(tabEl, tabId) =>
            openTabsNestedElementEditor(elementData.id, tabId, tabEl)
          }
          renderTabElement={(tabElement, tabElementIndex, tabId) =>
            renderTabsNestedElement(elementData.id, tabElement, tabElementIndex, tabId)
          }
          onTabElementSelect={(tabEl, tabId) => {
            if (!tabEl) {
              if (
                selectID.ids?.tabsHostId === elementData.id &&
                selectID.status === "Delete"
              ) {
                setSelectID({ ids: {}, status: "" });
              } else if (
                selectID.ids?.eleID === elementData.id &&
                selectID.status === "Delete"
              ) {
                setSelectID({ ids: {}, status: "" });
              } else {
                setSelectID({ ids: { ...ids, eleID: elementData.id }, status: "Delete" });
              }
            } else {
              const suppress = suppressNextTabButtonSelectRef.current;
              const now = Date.now();
              const isButtonType =
                tabEl?.type === "btn" || tabEl?.type === "btnG";
              const isImmediatePostDropSelection =
                isButtonType &&
                now <= Number(suppress?.until || 0) &&
                String(suppress?.hostId || "") === String(elementData.id || "") &&
                String(suppress?.tabId || "") === String(tabId || "") &&
                String(suppress?.elementId || "") === String(tabEl?.id || "");
              if (isImmediatePostDropSelection) {
                suppressNextTabButtonSelectRef.current = {
                  until: 0,
                  hostId: "",
                  tabId: "",
                  elementId: "",
                };
                return;
              }
              setSelectID({
                ids: { eleID: tabEl.id, tabsHostId: elementData.id, tabId },
                status: "Delete",
              });
            }
          }}
          tabSelectedElId={
            selectID.ids?.tabsHostId === elementData.id && selectID.status === "Delete"
              ? selectID.ids.eleID
              : null
          }
          onTabElementsReorder={(tabId, fromI, toI) =>
            reorderTabNestedElements(elementData.id, tabId, fromI, toI)
          }
          tabGhostData={
            elementData.type === "tabs" || elementData.type === "acc" || elementData.type === "post" || elementData.type === "dts" || elementData.type === "ctg"
              ? getTabGhostData(elementData)
              : null
          }
          onUpdate={(next) =>
            patchLayoutElement(next, { eleID: elementData.id })
          }
        />
{/* 
        {type === "divider" && (
          <div
            className={`${isElement ? "w-full" : "w-[100px]"} h-[0.5px] my-1`}
            style={{ backgroundColor: "#6a6a6a" }}
            onMouseEnter={() => setHoverElement({ id: id })}
            onMouseLeave={() => setHoverElement(false)}
          />
        )} */}
      </Box>
    );
  };

  const change_column_position = (oldIndex, newIndex, containerIndex) => {
    const newLayouts = layouts.map((l) => ({ ...l, columns: [...l.columns] }));
      const newColumns = newLayouts[containerIndex].columns;
      const [column] = newColumns.splice(oldIndex, 1);
      newColumns.splice(newIndex, 0, column);
    setLayout(newLayouts);
  };

  /** สลับลำดับ Span ใน Element Split (คอลัมน์ isSpan) — รองรับลากสลับเหมือนคอลัมน์ */
  const change_span_order = (oldIndex, newIndex, containerIndex, columnIndex) => {
    if (oldIndex === newIndex) return;
    const newLayouts = lodash.cloneDeep(layouts);
    const spans = newLayouts[containerIndex]?.columns?.[columnIndex]?.spans;
    if (!spans?.length) return;
    if (
      oldIndex < 0 ||
      newIndex < 0 ||
      oldIndex >= spans.length ||
      newIndex >= spans.length
    )
      return;
    const [sp] = spans.splice(oldIndex, 1);
    spans.splice(newIndex, 0, sp);
    setLayout(newLayouts);
  };


  const change_container_position = (oldIndex, newIndex) => {
    const newLayouts = lodash.cloneDeep(layouts);
    const layout = newLayouts[oldIndex];
    if (layout?.splitRowId) {
      const splitRowId = layout.splitRowId;
      const oldFirst = newLayouts.findIndex((l) => l.splitRowId === splitRowId);
      if (oldFirst === -1) return;
      let oldLast = oldFirst;
      while (
        oldLast < newLayouts.length - 1 &&
        newLayouts[oldLast + 1]?.splitRowId === splitRowId
      ) {
        oldLast++;
      }
      const splitItems = newLayouts.filter((l) => l.splitRowId === splitRowId);
      const insertPhysicalIndex = Math.max(
        0,
        Math.min(newIndex, newLayouts.length)
      );
      let insertAt = 0;
      for (let i = 0; i < insertPhysicalIndex; i++) {
        if (i < oldFirst || i > oldLast) insertAt++;
      }
      if (insertAt === oldFirst) return;
      const sans = newLayouts.filter((l) => l.splitRowId !== splitRowId);
      sans.splice(insertAt, 0, ...splitItems);
      setLayout(sans);
    } else {
      const [moved] = newLayouts.splice(oldIndex, 1);
      let insertAt = newIndex;
      if (newIndex > oldIndex) {
        // After removing at oldIndex, the element originally at newIndex
        // is now at (newIndex - 1). If that element is part of a split row,
        // inserting at newIndex would split it — skip to AFTER the last half.
        const targetAfterRemoval = newLayouts[newIndex - 1];
        if (targetAfterRemoval?.splitRowId) {
          const splitId = targetAfterRemoval.splitRowId;
          let lastHalf = newIndex - 1;
          while (
            lastHalf + 1 < newLayouts.length &&
            newLayouts[lastHalf + 1].splitRowId === splitId
          ) {
            lastHalf++;
          }
          insertAt = lastHalf + 1;
        }
      }
      newLayouts.splice(insertAt, 0, moved);
      setLayout(newLayouts);
    }
  };

  const change_element_position = (
    oldIndex,
    newIndex,
    containerIndex,
    columnIndex,
    oldSpanIndex = null,
    newSpanIndex = null,
    oldMiniSpanIndex = null,
    newMiniSpanIndex = null
  ) => {
    const newLayouts = [...layouts];
    let newElements;
    if (Number.isInteger(oldSpanIndex) && Number.isInteger(newSpanIndex)) {
      let oldElements, newElements;
      if (Number.isInteger(oldMiniSpanIndex)) {
        oldElements =
          newLayouts[containerIndex].columns[columnIndex].spans[oldSpanIndex]
            .nestedSpans[oldMiniSpanIndex].elements;
      } else {
        oldElements =
          newLayouts[containerIndex].columns[columnIndex].spans[oldSpanIndex]
            .elements;
      }

      if (Number.isInteger(newMiniSpanIndex)) {
        newElements =
          newLayouts[containerIndex].columns[columnIndex].spans[newSpanIndex]
            .nestedSpans[newMiniSpanIndex].elements;
      } else {
        newElements =
          newLayouts[containerIndex].columns[columnIndex].spans[newSpanIndex]
            .elements;
      }

      if (
        !Array.isArray(oldElements) ||
        !Array.isArray(newElements) ||
        !Number.isInteger(oldIndex) ||
        oldIndex < 0 ||
        oldIndex >= oldElements.length
      ) {
        return;
      }
      const [movedElement] = oldElements.splice(oldIndex, 1);
      if (!movedElement) return;
      const insertAt = Math.max(0, Math.min(newElements.length, Number(newIndex)));
      newElements.splice(insertAt, 0, movedElement);
    } else {
      newElements = newLayouts[containerIndex].columns[columnIndex].elements;
      if (
        !Array.isArray(newElements) ||
        !Number.isInteger(oldIndex) ||
        oldIndex < 0 ||
        oldIndex >= newElements.length
      ) {
        return;
      }
      const [movedElement] = newElements.splice(oldIndex, 1);
      if (!movedElement) return;
      const insertAt = Math.max(0, Math.min(newElements.length, Number(newIndex)));
      newElements.splice(insertAt, 0, movedElement);
    }

    setLayout(newLayouts);
  };

  const change_element_position_new_column = (
    oldIndex,
    newIndex,
    containerIndex,
    oldColumnIndex,
    newColumnIndex,
    oldSpanIndex = null,
    newSpanIndex = null,
    oldMiniSpanIndex = null,
    newMiniSpanIndex = null
  ) => {
    const newLayouts = [...layouts];
    let oldElements, newElements;
    if (Number.isInteger(oldSpanIndex)) {
      if (Number.isInteger(oldMiniSpanIndex)) {
        oldElements =
          newLayouts[containerIndex].columns[oldColumnIndex].spans[oldSpanIndex]
            .nestedSpans[oldMiniSpanIndex].elements;
      } else {
        oldElements =
          newLayouts[containerIndex].columns[oldColumnIndex].spans[oldSpanIndex]
            .elements;
      }
    } else {
      oldElements =
        newLayouts[containerIndex]?.columns[oldColumnIndex].elements;
    }

    if (Number.isInteger(newSpanIndex)) {
      if (Number.isInteger(newMiniSpanIndex)) {
        newElements =
          newLayouts[containerIndex].columns[newColumnIndex].spans[newSpanIndex]
            .nestedSpans[newMiniSpanIndex].elements;
      } else {
        newElements =
          newLayouts[containerIndex].columns[newColumnIndex].spans[newSpanIndex]
            .elements;
      }
    } else {
      newElements = newLayouts[containerIndex].columns[newColumnIndex].elements;
    }

    if (!oldElements || !newElements) return;
    if (
      !Array.isArray(oldElements) ||
      !Array.isArray(newElements) ||
      !Number.isInteger(oldIndex) ||
      oldIndex < 0 ||
      oldIndex >= oldElements.length
    ) {
      return;
    }
    const [movedElement] = oldElements.splice(oldIndex, 1);
    if (!movedElement) return;
    const insertAt = Math.max(0, Math.min(newElements.length, Number(newIndex)));
    newElements.splice(insertAt, 0, movedElement);

    setLayout(newLayouts);
  };

  const change_element_position_new_container = (
    oldIndex,
    newIndex,
    oldContainerIndex,
    newContainerIndex,
    oldColumnIndex,
    newColumnIndex,
    oldSpanIndex = null,
    newSpanIndex = null,
    oldMiniSpanIndex = null,
    newMiniSpanIndex = null
  ) => {
    const newLayouts = [...layouts];
    let oldElements, newElements;

    if (Number.isInteger(oldSpanIndex)) {
      if (Number.isInteger(oldMiniSpanIndex)) {
        oldElements =
          newLayouts[oldContainerIndex].columns[oldColumnIndex].spans[
            oldSpanIndex
          ].nestedSpans[oldMiniSpanIndex].elements;
      } else {
        oldElements =
          newLayouts[oldContainerIndex].columns[oldColumnIndex].spans[
            oldSpanIndex
          ].elements;
      }
    } else {
      oldElements =
        newLayouts[oldContainerIndex].columns[oldColumnIndex].elements;
    }

    if (Number.isInteger(newSpanIndex)) {
      if (Number.isInteger(newMiniSpanIndex)) {
        newElements =
          newLayouts[newContainerIndex].columns[newColumnIndex].spans[
            newSpanIndex
          ].nestedSpans[newMiniSpanIndex].elements;
      } else {
        newElements =
          newLayouts[newContainerIndex].columns[newColumnIndex].spans[
            newSpanIndex
          ].elements;
      }
    } else {
      newElements =
        newLayouts[newContainerIndex].columns[newColumnIndex].elements;
    }

    if (
      !Array.isArray(oldElements) ||
      !Array.isArray(newElements) ||
      !Number.isInteger(oldIndex) ||
      oldIndex < 0 ||
      oldIndex >= oldElements.length
    ) {
      return;
    }
    const [movedElement] = oldElements.splice(oldIndex, 1);
    if (!movedElement) return;
    const insertAt = Math.max(0, Math.min(newElements.length, Number(newIndex)));
    newElements.splice(insertAt, 0, movedElement);

    setLayout(newLayouts);
  };

  /** Col / Col Span / Span / Mini Span — Ghost preview badge (พื้น–ตัวอักษรเดียวกับ Canvas Col ID) */
  const ghostLayoutIdBadgeClass =
    "inline-flex min-w-0 max-w-[min(calc(100%-1.5rem),14rem)] items-center rounded-md border-0 bg-slate-200 px-2 py-0.5 text-[11px] font-mono font-bold leading-none text-slate-400 tabular-nums dark:bg-slate-500 dark:text-slate-100";
  const hideGhostColumnIdBadgeForElementHover = Boolean(elementDropHighlight);

  const ColumnPreview = ({
    element,
    id,
    children,
    noColumnGap = false,
    /** Split layout ghost: ไม่แสดงคำว่า ghost ใน Badge Col ID */
    hideGhostInColBadge = false,
  }) => {
    const { colID } = id;
    const colBadgeLabel =
      hideGhostInColBadge && typeof colID === "string"
        ? colID.replace(/ghost/gi, "")
        : colID;

    const {
      paddingX,
      paddingY,
      backgroundColor,
      backgroundColorGradient,
      borderColor,
      borderOpacity,
      borderRadius,
      borderWidth,
      degrees,
      isGradient,
      opacityColor,
      opacityColorGradient,
      size,
      elements,
      isSpan,
    } = element;

    let color;

    if (isGradient) {
      const color1 =
        typeof backgroundColorGradient[0] === "string"
          ? backgroundColorGradient[0] + opacity_2_hex(opacityColorGradient[0])
          : theme[backgroundColorGradient[0].type][
              backgroundColorGradient[0].index
            ] + opacity_2_hex(opacityColorGradient[0]);
      const color2 =
        typeof backgroundColorGradient[1] === "string"
          ? backgroundColorGradient[1] + opacity_2_hex(opacityColorGradient[1])
          : theme[backgroundColorGradient[1].type][
              backgroundColorGradient[1].index
            ] + opacity_2_hex(opacityColorGradient[1]);
      color = `linear-gradient(${degrees}deg, ${color1} 0%, ${color2} 100%)`;
    } else if (!isGradient) {
      color =
        typeof backgroundColor === "string"
          ? backgroundColor + opacity_2_hex(opacityColor)
          : theme[backgroundColor.type][backgroundColor.index] +
            opacity_2_hex(opacityColor);
    }

    const brColor =
      typeof borderColor === "string"
        ? borderColor + opacity_2_hex(borderOpacity)
        : theme[borderColor.type][borderColor.index] +
          opacity_2_hex(borderOpacity);

    const bw = Number(borderWidth) || 0;
    const r = Number(borderRadius) || 0;
    const innerRadius = Math.max(0, r - bw);
    const useBorderRing = bw > 0;

    const hasLayoutElements =
      Array.isArray(elements) && elements.length > 0;
    const showColIdBadge =
      !hideGhostColumnIdBadgeForElementHover && !isSpan && !hasLayoutElements;
    /** คอลัมน์ Span: แสดง Col ID ใน Ghost แค่ตอนไม่มีโครง Span/Mini ข้างใน — กัน Badge ซ้อนกลางระหว่าง Col กับ Span/Mini */
    const showColSpanGhostColIdBadge =
      !hideGhostColumnIdBadgeForElementHover &&
      isSpan &&
      React.Children.count(children ?? null) === 0;

    return (
      <div className={`col-span-${size}`}>
        {isSpan ? (
          <div
            className={`relative isolate grid grid-flow-row-dense auto-rows-[minmax(40px,auto)] min-h-[40px] ${noColumnGap ? "gap-0" : "gap-[22px]"}`}
          >
            {children}
            {showColSpanGhostColIdBadge ? (
              <div
                className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center"
                aria-hidden
              >
                <span
                  className={ghostLayoutIdBadgeClass}
                  title={String(colBadgeLabel ?? "")}
                >
                  <span className="truncate">{colBadgeLabel}</span>
                </span>
              </div>
            ) : null}
          </div>
        ) : (
          <div
            className={` border-[1px]  border-dashed border-gray-600 flex ${
              !hasLayoutElements ? "h-[200px]" : "h-auto"
            } relative p-0`}
            onDragOver={(e) => {
              handleDuring(e);
            }}
          >
            {useBorderRing ? (
              <div
                className="box-border flex h-full w-full min-h-0 min-w-0 flex-col"
                style={{
                  borderRadius: r,
                  padding: bw,
                  background: brColor,
                }}
              >
                <div
                  className="box-border flex h-full w-full min-h-0 min-w-0 flex-col"
                  style={{
                    borderRadius: innerRadius,
                    padding: `${paddingY}px ${paddingX}px`,
                    background: color,
                  }}
                >
                  {children}
                </div>
              </div>
            ) : (
              <div
                className="w-full h-full flex flex-col"
                style={{
                  borderRadius: borderRadius,
                  borderWidth: borderWidth,
                  padding: `${paddingY}px ${paddingX}px`,
                  borderColor: brColor,
                  background: color,
                }}
              >
                {children}
              </div>
            )}
            {showColIdBadge ? (
              <div
                className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center"
                aria-hidden
              >
                <span
                  className={ghostLayoutIdBadgeClass}
                  title={String(colBadgeLabel ?? "")}
                >
                  <span className="truncate">{colBadgeLabel}</span>
                </span>
              </div>
            ) : null}
          </div>
        )}
      </div>
    );
  };

  const SpanPreview = ({ elementData, children, noColumnGap = false }) => {
    const {
      paddingX,
      paddingY,
      backgroundColor,
      backgroundColorGradient,
      borderColor,
      borderOpacity,
      borderRadius,
      borderWidth,
      degrees,
      isGradient,
      opacityColor,
      opacityColorGradient,
      elements = [],
      id: spanPreviewId,
    } = elementData;

    const hasSpanLayoutElements =
      Array.isArray(elements) && elements.length > 0;
    const showSpanIdBadge =
      !hideGhostColumnIdBadgeForElementHover &&
      !hasSpanLayoutElements;

    const color = isGradient
      ? setColor(theme, backgroundColorGradient, opacityColorGradient, degrees)
      : setColor(theme, backgroundColor, opacityColor);

    const brColor = setColor(theme, borderColor, borderOpacity);

    return (
      <div className="grid grid-cols-12" data-drop="SPAN">
        <div
          className={`border-[1px] ${
            hasSpanLayoutElements ? "min-h-[40px]" : "h-[100px]"
          } border-dashed border-gray-600 flex-1 justify-center items-center text-center relative col-span-12`}
          data-drop="SPAN"
        >
          <div
            className="w-full h-full flex flex-col"
            style={{
              borderRadius,
              borderWidth,
              padding: `${paddingY}px ${paddingX}px`,
              borderColor: brColor,
              background: color,
            }}
          >
            {children}
          </div>
          {showSpanIdBadge ? (
            <div
              className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center"
              aria-hidden
            >
              <span
                className={ghostLayoutIdBadgeClass}
                title={String(spanPreviewId ?? "")}
              >
                <span className="truncate">{spanPreviewId}</span>
              </span>
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  const ContainerPreview = ({ element, id, children, innerStyle }) => {
    const { container } = element;
    const {
      isFluid,
      paddingTop,
      paddingBottom,
      isGradient,
      opacityImage,
      opacityColor,
      opacityColorGradient,
      backgroundColor,
      backgroundColorGradient,
      backgroundImage,
      degrees,
    } = container;

    const fluid = innerStyle ? "" : (isFluid ? "w-full" : "container");

    let color;

    if (isGradient) {
      const color1 =
        typeof backgroundColorGradient[0] === "string"
          ? backgroundColorGradient[0] + opacity_2_hex(opacityColorGradient[0])
          : theme[backgroundColorGradient[0].type][
              backgroundColorGradient[0].index
            ] + opacity_2_hex(opacityColorGradient[0]);
      const color2 =
        typeof backgroundColorGradient[1] === "string"
          ? backgroundColorGradient[1] + opacity_2_hex(opacityColorGradient[1])
          : theme[backgroundColorGradient[1].type][
              backgroundColorGradient[1].index
            ] + opacity_2_hex(opacityColorGradient[1]);
      color = `linear-gradient(${degrees}deg, ${color1} 0%, ${color2} 100%)`;
    } else {
      color =
        typeof backgroundColor === "string"
          ? backgroundColor + opacity_2_hex(opacityColor)
          : theme[backgroundColor?.type][backgroundColor?.index] +
            opacity_2_hex(opacityColor);
    }

    const BgImage = () => {
      if (backgroundImage) {
        return (
          <div
            className=" absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-0"
            style={{
              backgroundImage: `url(${backgroundImage})`,
              opacity: opacityImage,
            }}
          />
        );
      } else {
        return <></>;
      }
    };

    return (
      <div
        className="preview pointer-events-none border-dashed border-gray-600 relative"
        aria-hidden
        style={{ background: color }}
        onDragOver={(e) => {
          handleDuring(e);
        }}
      >
        <BgImage />
        <div
          className={`${fluid} mx-auto relative z-10`}
          onMouseEnter={() => setHover(id)}
          onMouseLeave={() => setHover(null)}
          style={{
            paddingTop: paddingTop,
            paddingBottom: paddingBottom,
            ...(innerStyle || {}),
          }}
        >
          <div
            className={`grid grid-cols-12 py-5 ${preview?.container?.noColumnGap ? "gap-0" : "gap-[22px]"}`}
            onMouseEnter={() => setHover(id)}
            onMouseLeave={() => setHover(null)}
          >
            {children}
          </div>
        </div>
      </div>
    );
  };

  const ElementPreview = ({ element }) => {
    const layoutPreviewPe = isLayoutMode ? " pointer-events-none" : "";
    const isSidebarElementDrag =
      activeDragRef.current?.data?.current?.type !== "ELEMENT";
    const isElementGhostPlaceholder =
      Boolean(activeID?.eleID) &&
      preview &&
      element &&
      String(preview?.id || "") !== "" &&
      String(element?.id || "") === String(preview?.id || "");

    if (isElementGhostPlaceholder) {
      return (
        <Box
          sx={{
            width: "100%",
            minHeight: 44,
            border: "1px dashed rgba(100,116,139,0.65)",
            borderRadius: "8px",
            backgroundColor: "rgba(148,163,184,0.08)",
          }}
        />
      );
    }

    const imagePreviewLike =
      element.type === "img" ||
      element.type === "imgh" ||
      element.type === "imgo" ||
      element.type === "bnr" ||
      element.type === "lbx" ||
      element.type === "vid";
    const imagePreviewLink =
      imagePreviewLike &&
      element.type !== "lbx" &&
      element.type !== "vid"
        ? resolveImageLinkAttrs(element)
        : null;
    const showMediaPlaceholder =
      imagePreviewLike &&
      (!element.src || String(element.src).trim() === "");

    const imagePreviewInner = imagePreviewLike ? (
      showMediaPlaceholder ? (
        (element.aspectRatio || IMAGE_ASPECT_DEFAULT) ===
        IMAGE_ASPECT_DEFAULT ? (
          element.type === "img" || element.type === "imgh" || element.type === "imgo" || element.type === "bnr" ? (
            <div
              className="flex min-h-[260px] w-full items-center justify-center bg-gray-100"
              style={imageCornerRadiusStyle(
                element.borderRadius,
                element.aspectRatio || IMAGE_ASPECT_DEFAULT
              )}
            >
              <ImagePlaceholderIcon
                className="h-10 w-10 text-gray-400"
                strokeWidth={1.5}
                aria-hidden
              />
            </div>
          ) : (
            <div
              className="relative min-h-[260px] w-full bg-gray-100"
              style={imageCornerRadiusStyle(
                element.borderRadius,
                element.aspectRatio || IMAGE_ASPECT_DEFAULT
              )}
            >
              <ImagePlaceholderIcon
                className="pointer-events-none absolute right-[15px] top-[15px] h-8 w-8 text-gray-400"
                strokeWidth={1.5}
                aria-hidden
              />
            </div>
          )
        ) : element.type === "img" || element.type === "imgh" || element.type === "imgo" || element.type === "bnr" ? (
          <div
            className="relative flex w-full items-center justify-center overflow-hidden bg-gray-100"
            style={{
              aspectRatio: element.aspectRatio,
              ...imageCornerRadiusStyle(
                element.borderRadius,
                element.aspectRatio || IMAGE_ASPECT_DEFAULT
              ),
            }}
          >
            <ImagePlaceholderIcon
              className="h-10 w-10 text-gray-400"
              strokeWidth={1.5}
              aria-hidden
            />
          </div>
        ) : (
          <div
            className="relative w-full overflow-hidden bg-gray-100"
            style={{
              aspectRatio: element.aspectRatio,
              ...imageCornerRadiusStyle(
                element.borderRadius,
                element.aspectRatio || IMAGE_ASPECT_DEFAULT
              ),
            }}
          >
            <ImagePlaceholderIcon
              className="pointer-events-none absolute right-[15px] top-[15px] h-8 w-8 text-gray-400"
              strokeWidth={1.5}
              aria-hidden
            />
          </div>
        )
      ) : (element.aspectRatio || IMAGE_ASPECT_DEFAULT) ===
        IMAGE_ASPECT_DEFAULT ? (
        <img
          src={element.src}
          alt=""
          className={`h-auto w-full${layoutPreviewPe}`}
          style={{
            ...imageBrightnessFilterStyle(
              element.brightness ?? IMAGE_BRIGHTNESS_DEFAULT
            ),
            ...imageCornerRadiusStyle(
              element.borderRadius,
              element.aspectRatio || IMAGE_ASPECT_DEFAULT
            ),
          }}
        />
      ) : (
        <div
          className="relative w-full overflow-hidden"
          style={{
            aspectRatio: element.aspectRatio,
            ...imageCornerRadiusStyle(
              element.borderRadius,
              element.aspectRatio || IMAGE_ASPECT_DEFAULT
            ),
          }}
        >
          <img
            src={element.src}
            alt=""
            className={`absolute inset-0 h-full w-full object-cover${layoutPreviewPe}`}
            style={{
              ...imageBrightnessFilterStyle(
                element.brightness ?? IMAGE_BRIGHTNESS_DEFAULT
              ),
              ...imageCornerRadiusStyle(
                element.borderRadius,
                element.aspectRatio || IMAGE_ASPECT_DEFAULT
              ),
            }}
          />
        </div>
      )
    ) : null;

    return (
      <Box
        style={{ width: "100%", textAlign: "center" }}
        onDragOver={(e) => {
          handleDuring(e);
        }}
      >
        {imagePreviewLike && (
          <div
            className={`relative inline-block w-full ${
              element.type === "bnr" &&
              bannerCaptionHorizontalBleedsOutsideFrame(
                element?.bannerCaptionEdgePosition,
                element?.bannerCaptionSlideVertical,
                element?.bannerCaptionSlideHorizontal
              )
                ? "overflow-visible"
                : "overflow-hidden"
            }`}
            style={imageCornerRadiusStyle(
              element.borderRadius,
              element.aspectRatio || IMAGE_ASPECT_DEFAULT
            )}
          >
            {imagePreviewLink ? (
              <a
                {...imagePreviewLink}
                className={`block w-full text-inherit no-underline${layoutPreviewPe}`}
              >
                {imagePreviewInner}
              </a>
            ) : (
              imagePreviewInner
            )}
            {element.type === "lbx" && (
              <div className="pointer-events-none absolute inset-0 z-[5] grid place-items-center">
                <div
                  className="grid h-[50px] w-[50px] place-items-center rounded-full"
                  style={{
                    backgroundColor: setColor(
                      theme,
                      theme?.mainColor?.[1],
                      200
                    ),
                  }}
                >
                  <CircleFadingPlus
                    className="h-8 w-8 text-white"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </div>
              </div>
            )}
            {element.type === "vid" && (
              <div className="pointer-events-none absolute inset-0 z-[5] grid place-items-center">
                <div
                  className="grid h-[50px] w-[50px] place-items-center rounded-full"
                  style={{
                    backgroundColor: setColor(
                      theme,
                      theme?.mainColor?.[1],
                      200
                    ),
                  }}
                >
                  <Play
                    className="h-7 w-7 text-white"
                    strokeWidth={2.2}
                    aria-hidden="true"
                  />
                </div>
              </div>
            )}
            {element.type === "bnr" ? (() => {
              const cap = String(element?.badge?.label ?? "").trim();
              if (!cap) return null;
              const fsRaw = Number(element?.bannerCaptionFontSize);
              const fsPx = Number.isFinite(fsRaw)
                ? Math.min(56, Math.max(12, fsRaw))
                : 48;
              const lsRaw = Number(element?.bannerCaptionLetterSpacing);
              const lsPx = Number.isFinite(lsRaw)
                ? Math.min(15, Math.max(0, lsRaw))
                : 6;
              const slideRaw = Number(element?.bannerCaptionSlideVertical);
              const slidePx = Number.isFinite(slideRaw)
                ? Math.min(
                    BANNER_CAPTION_SLIDE_MAX,
                    Math.max(BANNER_CAPTION_SLIDE_MIN, slideRaw)
                  )
                : defaultBannerCaptionSlideVertical();
              const slideHRaw = Number(element?.bannerCaptionSlideHorizontal);
              const slideHPx = Number.isFinite(slideHRaw)
                ? Math.min(
                    BANNER_CAPTION_SLIDE_MAX,
                    Math.max(BANNER_CAPTION_SLIDE_MIN, slideHRaw)
                  )
                : 0;
              const capLayout = getBannerCaptionLayout(
                element?.bannerCaptionEdgePosition,
                slidePx,
                slideHPx
              );
              const capColor =
                setColor(theme, element?.bannerCaptionTextColor, element?.bannerCaptionTextOpacity ?? 255) || "#ffffff";
              return (
                <div className={capLayout.motionFrameClass}>
                  <div
                    className={capLayout.midRowClass}
                    style={capLayout.midRowStyle}
                  >
                    <div
                      aria-hidden
                      className="min-h-0 min-w-0 shrink-0"
                      style={capLayout.spacerLeftStyle}
                    />
                    <div
                      className={`${capLayout.stripClass} ${
                        theme?.textHeading?.value ?? ""
                      } ${element?.badge?.bold ? "font-bold" : "font-medium"}`}
                      style={capLayout.stripStyle}
                    >
                      <div className={capLayout.innerClass}>
                        <span
                          className={capLayout.captionSpanClass}
                          style={{
                            fontFamily:
                              setFont(theme?.textHeading?.value) || undefined,
                            fontSize: `${fsPx}px`,
                            letterSpacing: `${lsPx}px`,
                            color: capColor,
                            ...capLayout.captionSpanStyle,
                          }}
                        >
                          {cap}
                        </span>
                      </div>
                    </div>
                    <div
                      aria-hidden
                      className="min-h-0 min-w-0 shrink-0"
                      style={capLayout.spacerRightStyle}
                    />
                  </div>
                </div>
              );
            })() : (
              <ImageBadge
                badge={element.badge}
                aspectRatio={
                  element.aspectRatio || IMAGE_ASPECT_DEFAULT
                }
                imageBorderRadius={element.borderRadius}
                theme={theme}
                elementType={
                  element.type === "lbx"
                    ? "lbx"
                    : element.type === "vid"
                    ? "vid"
                    : "img"
                }
              />
            )}
          </div>
        )}
        {element.type === "text" && (
          <div
            className={
              isLayoutMode ? "pointer-events-none select-none" : undefined
            }
          >
            <SegmentedRichText
              renderSignature={`${JSON.stringify(element?.textParagraph ?? null)}|${
                element?.label ?? ""
              }`}
              elementData={element}
              themeTextClass={theme?.text?.value}
              animationClass=""
              selected={false}
              defaultColor={theme?.textColor?.[0]}
              defaultFontSizePx={14}
            />
          </div>
        )}
        {element.type === "heading" && (() => {
          const he = mergeHeadingElement(element);
          const op1 = he.headingColorOpacity ?? 255;
          const c1 = setColor(theme, he.headingColor, op1);
          const gradientPreview =
            Boolean(he.headingTextGradient) && he.headingColor2;
          const c2 = gradientPreview
            ? setColor(
                theme,
                he.headingColor2,
                he.headingColor2Opacity ?? op1
              )
            : null;
          const gdRaw = Number(he.headingGradientDegrees);
          const gd = Number.isFinite(gdRaw) ? gdRaw : 90;
          const previewTextStyle = gradientPreview
            ? {
                backgroundImage: `linear-gradient(${gd}deg, ${c1}, ${c2})`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }
            : { color: c1 };
          const alignClass =
            he.headingAlign === "center"
              ? "text-center"
              : he.headingAlign === "right"
                ? "text-right"
                : "text-left";
          const fs = Math.min(
            72,
            Math.max(12, Number(he.headingFontSize) || 28)
          );
          const lh = Math.min(
            2,
            Math.max(1, Number(he.headingLineHeight) || 1.35)
          );
          const ls = Math.min(
            8,
            Math.max(-2, Number(he.headingLetterSpacing) || 0)
          );
          return (
            <div
              style={{
                marginTop: he.headingMarginTop ?? 0,
                marginBottom: he.headingMarginBottom ?? 0,
              }}
              className={`${theme?.textHeading?.value ?? ""} ${alignClass}`}
            >
              <HeadingDividerTextBlock
                theme={theme}
                elementData={element}
                colorStyle={previewTextStyle}
                fontSize={fs}
                fontWeight={he.headingBold ? 700 : 500}
                lineHeight={lh}
                letterSpacing={ls}
                label={
                  typeof he.label === "string"
                    ? he.label
                    : HEADING_ELEMENT_DEFAULTS.label
                }
              />
            </div>
          );
        })()}
        {element.type === "btn" && (() => {
          const bv = getButtonMuiVariant(element);
          const bsx = getButtonMuiSx(element, theme, bv);
          const btnLink = resolveImageLinkAttrs(element);
          const lic = element?.linkIcon;
          const showLinkFaIcon = isButtonLinkIconDefined(lic);
          return (
            <Box
              sx={getButtonOuterContainerSx(element)}
              className={
                isLayoutMode ? "pointer-events-none select-none" : undefined
              }
            >
              <Button
                component={btnLink ? "a" : "button"}
                href={btnLink?.href}
                target={btnLink?.target}
                rel={btnLink?.rel}
                variant={bv}
                disableElevation
                sx={{
                  ...bsx,
                  fontFamily: setFont(theme?.text.value),
                  ...(isLayoutMode
                    ? { pointerEvents: "none", userSelect: "none" }
                    : {}),
                }}
              >
                {showLinkFaIcon ? (
                  <Box
                    component="span"
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      verticalAlign: "middle",
                      mr: 0.75,
                      lineHeight: 0,
                    }}
                  >
                    <IconAwsome
                      iconName={lic.name}
                      iconType={lic.type}
                      style={{ fontSize: "1.05em" }}
                    />
                  </Box>
                ) : null}
                {typeof element.label === "string"
                  ? element.label
                  : "Button Click"}
              </Button>
            </Box>
          );
        })()}
        {element.type === "divider" && (() => {
          const d = mergeDividerElement(element);
          const marginTopRaw = Number(d.dividerMarginTop);
          const marginBottomRaw = Number(d.dividerMarginBottom);
          const weightRaw = Number(d.dividerWeight);
          const marginTopPx = Number.isFinite(marginTopRaw) ? marginTopRaw : 8;
          const marginBottomPx = Number.isFinite(marginBottomRaw) ? marginBottomRaw : 8;
          const borderWidth = Number.isFinite(weightRaw)
            ? Math.max(0.1, weightRaw)
            : 1;
          const borderColor = setColor(theme, d.dividerColor, d.dividerOpacity ?? 255);
          return (
            <div style={{ width: "100%", marginTop: marginTopPx, marginBottom: marginBottomPx }}>
              <div
                className="w-full"
                style={{
                  borderTopStyle: d.dividerStyle,
                  borderTopWidth: borderWidth,
                  borderTopColor: borderColor,
                }}
              />
            </div>
          );
        })()}
        {element.type === "btnG" && (() => {
          const bv = getButtonMuiVariant(element);
          const bsx1 = getButtonMuiSx(element, theme, bv, 1);
          const bsx2 = getButtonMuiSx(element, theme, bv, 2);
          const full = isButtonFullWidthEnabled(element);
          const b1 = resolveButtonDualSlotLinkAttrs(element, 1);
          const b2 = resolveButtonDualSlotLinkAttrs(element, 2);
          const lic1 = element?.linkIcon;
          const lic2 = element?.linkIcon2;
          const show1 = isButtonLinkIconDefined(lic1);
          const show2 = isButtonLinkIconDefined(lic2);
          const l1 =
            typeof element.label === "string"
              ? element.label
              : "Button Click";
          const l2 =
            typeof element.label2 === "string"
              ? element.label2
              : "Button Click";
          const childSx1 = {
            ...bsx1,
            fontFamily: setFont(theme?.text.value),
            ...(full ? { flex: 1, minWidth: 0 } : {}),
          };
          const childSx2 = {
            ...bsx2,
            fontFamily: setFont(theme?.text.value),
            ...(full ? { flex: 1, minWidth: 0 } : {}),
          };
          return (
            <Box sx={getButtonOuterContainerSx(element)}>
              <ButtonGroup
                aria-label="ปุ่มคู่"
                disableElevation
                sx={{
                  width: full ? "100%" : "auto",
                  boxShadow: "none",
                  "& .MuiButton-root": { boxShadow: "none" },
                  ...getButtonGroupOutlinedFrameSx(element, theme),
                }}
              >
                <Button
                  component={b1 ? "a" : "button"}
                  href={b1?.href}
                  target={b1?.target}
                  rel={b1?.rel}
                  variant={bv}
                  disableElevation
                  sx={childSx1}
                >
                  {show1 ? (
                    <Box
                      component="span"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        verticalAlign: "middle",
                        mr: 0.75,
                        lineHeight: 0,
                      }}
                    >
                      <IconAwsome
                        iconName={lic1.name}
                        iconType={lic1.type}
                        style={{ fontSize: "1.05em" }}
                      />
                    </Box>
                  ) : null}
                  {l1}
                </Button>
                <Button
                  component={b2 ? "a" : "button"}
                  href={b2?.href}
                  target={b2?.target}
                  rel={b2?.rel}
                  variant={bv}
                  disableElevation
                  sx={childSx2}
                >
                  {show2 ? (
                    <Box
                      component="span"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        verticalAlign: "middle",
                        mr: 0.75,
                        lineHeight: 0,
                      }}
                    >
                      <IconAwsome
                        iconName={lic2.name}
                        iconType={lic2.type}
                        style={{ fontSize: "1.05em" }}
                      />
                    </Box>
                  ) : null}
                  {l2}
                </Button>
              </ButtonGroup>
            </Box>
          );
        })()}
        <React.Suspense fallback={null}>
        {element.type === "icon" && (
          <div className="w-full flex items-center justify-center py-1">
            <IconCanvasPreview
              elementData={mergeIconElement({
                ...element,
                id: element.id || "icon-preview",
              })}
              selected={false}
              hover={() => {}}
              theme={theme}
            />
          </div>
        )}
        {element.type === "list" && (
          <ListElementPreview
            builderMode={builderMode}
            elementData={(() => {
              const b = element?.listIconsBundleDefaults;
              if (Array.isArray(b) && b[0]) {
                return lodash.omit(
                  { ...element, ...b[0] },
                  ["listIconsBundleDefaults"]
                );
              }
              return element;
            })()}
            selected={false}
            hover={() => {}}
            isLastList
            theme={theme}
            onEditIcon={() => {}}
            onEditText={() => {}}
          />
        )}
        {element.type === "crl" && (
          <div className="pointer-events-none w-full min-w-0">
            <CarouselElementPreview
              elementData={element}
              selected={false}
              hover={() => {}}
              builderMode={builderMode}
              device={device}
              allowAutoplay={false}
              theme={theme}
              animationForElement="transition-all duration-200 ease-in-out will-change-transform"
            />
          </div>
        )}
        {element.type === "dts" && (
          <div className="pointer-events-none w-full min-w-0">
            <DataSliderElementPreview
              elementData={mergeDataSliderElement(element)}
              selected={false}
              animationForElement=""
              builderMode={builderMode}
              device={device}
              renderTabElement={(tabElement, tabElementIndex, tabId) =>
                renderTabsNestedElement(
                  element.id,
                  tabElement,
                  tabElementIndex,
                  tabId
                )
              }
              theme={theme}
            />
          </div>
        )}
        {element.type === "ctg" && (
          <CatagoriesElementPreview
            elementData={mergeCatagoriesElement(element)}
            selected={false}
            animationForElement=""
            builderMode="Editor Mode"
            theme={theme}
            device={device}
          />
        )}
        {element.type === "lstb" && (
          <div className="pointer-events-none w-full min-w-0">
            <ListBoxElementPreview
              elementData={mergeListBoxElement(element)}
              selected={false}
              hover={() => {}}
              builderMode={builderMode}
              device={device}
              theme={theme}
              animationForElement="transition-all duration-200 ease-in-out will-change-transform"
            />
          </div>
        )}
        {element.type === "ctn" && (() => {
          const ce = mergeCounterElement(element);
          const color = setColor(theme, ce.counterColor, ce.counterColorOpacity ?? 255);
          const fontSize = Math.min(
            120,
            Math.max(12, Number(ce.counterFontSize) || 42)
          );
          const counterPreviewJustify =
            ce.counterAlign === "left"
              ? "justify-start"
              : ce.counterAlign === "right"
                ? "justify-end"
                : "justify-center";
          return (
            <div
              className={`flex w-full items-center ${counterPreviewJustify}`}
              style={{
                marginTop: ce.counterMarginTop,
                marginBottom: ce.counterMarginBottom,
              }}
            >
              <span
                className="leading-none"
                style={{
                  color,
                  fontSize,
                  fontWeight: ce.counterBold ? 700 : 500,
                  lineHeight: 1,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {Math.round(Number(ce.counterTargetValue) || 0)}
              </span>
            </div>
          );
        })()}
        {element.type === "tbl" && (
          <TableElementPreview
            elementData={mergeTableElement(element)}
            selected={false}
            hover={() => {}}
            animationForElement=""
            theme={theme}
          />
        )}
        {element.type === "btw" && (
          <BetweenElementPreview
            elementData={mergeBetweenElement(element)}
            selected={false}
            hover={() => {}}
            animationForElement=""
            theme={theme}
          />
        )}
        {element.type === "tabs" && (
          <TabsElementPreview
            elementData={element}
            selected={false}
            animationForElement=""
            builderMode="Editor Mode"
            theme={theme}
          />
        )}
        {element.type === "acc" && (
          <AccordionElementPreview
            elementData={element}
            selected={false}
            animationForElement=""
            theme={theme}
          />
        )}
        {element.type === "post" && (
          <PostElementPreview
            elementData={element}
            selected={false}
            animationForElement=""
            builderMode="Editor Mode"
            theme={theme}
          />
        )}
        </React.Suspense>
      </Box>
    );
  };

  const ElementPreviewForDrag_Drop = ({ element }) => {
    const { icon, label, lucideIcon, lucideStrokeWidth, lucideSize } = element?.preview || {};
    const previewIconSize = Number(lucideSize);
    const previewStrokeWidth = Number(lucideStrokeWidth);
    return (
        <div
          className="bg-gray-50 dark:bg-black/50 w-[95.5px] h-[70px] rounded-md text-center px-3 py-2"
          ref={(el) => setDragRef(el)}
        >
          {lucideIcon ? (
            <span className="inline-flex h-[30px] w-full items-center justify-center px-2 text-slate-600 dark:text-white/50 [&>svg]:shrink-0">
              <IconLucide
                iconName={lucideIcon}
                size={Number.isFinite(previewIconSize) ? previewIconSize : 30}
                strokeWidth={Number.isFinite(previewStrokeWidth) ? previewStrokeWidth : 1.75}
              />
            </span>
          ) : (
            <span className="material-symbols-outlined text-[30px] px-2 dark:text-white/50">
              {icon}
            </span>
          )}
          <p className="text-[12px] dark:text-white/40 antialiased">{label}</p>
        </div>
    );
  };

  const ghostInsertAnimClass = "";

  const getTabGhostData = (ele) => {
    if (!ele || (ele.type !== "tabs" && ele.type !== "acc" && ele.type !== "post" && ele.type !== "dts" && ele.type !== "ctg") || !preview) return null;
    const isCanvasElementMove =
      Boolean(activeID?.eleID) ||
      activeDragRef.current?.data?.current?.type === "ELEMENT";
    const dragRect =
      activeDragRef.current?.rect?.current?.translated ||
      activeDragRef.current?.rect?.current?.initial ||
      activeDragRef.current?.rect?.current;
    const sourceNode = (() => {
      const activeEleId = String(activeID?.eleID || activeDragRef.current?.id || "");
      if (!activeEleId) return null;
      return document.querySelector(`[data-drop="ELEMENT"][id$="/${activeEleId}"]`);
    })();
    const sourceRect = sourceNode?.getBoundingClientRect?.();
    const sourceStyles = sourceNode ? window.getComputedStyle(sourceNode) : null;
    const sourceOuterHeight = sourceRect
      ? sourceRect.height +
        (Number.parseFloat(sourceStyles?.marginTop || "0") || 0) +
        (Number.parseFloat(sourceStyles?.marginBottom || "0") || 0)
      : null;
    const ghostSpacerHeight = Number.isFinite(Number(dragRect?.height))
      ? Math.max(44, Math.round(Number(dragRect?.height)))
      : Number.isFinite(Number(sourceOuterHeight))
        ? Math.max(44, Math.round(Number(sourceOuterHeight)))
        : 56;

    const isTargetingThisTab =
      dropTargetRef.current?.type === "TAB-ELEMENT" &&
      dropTargetRef.current?.index?.tabEleID === ele.id;

    if (!isTargetingThisTab) {
      return {
        isDragging: true,
        ghostEl: null,
        tabId:
          ele.type === "dts"
            ? String(mergeDataSliderElement(ele).dataSliderActiveId || "")
            : ele.type === "ctg"
              ? String(mergeCatagoriesElement(ele).catagoriesActiveId || "")
              : null,
        insertAt: 0,
        isLast: false,
      };
    }

    const idx = dropTargetRef.current.index;
    return {
      isDragging: true,
      tabId:
        String(
          idx.tabId ||
            (ele.type === "dts"
              ? mergeDataSliderElement(ele).dataSliderActiveId || ""
              : ele.type === "ctg"
                ? mergeCatagoriesElement(ele).catagoriesActiveId || ""
                : "")
        ),
      insertAt: typeof idx.tabEleI === "number" ? idx.tabEleI : 0,
      isLast: Boolean(dropTargetRef.current.isLast),
      ghostEl: (
        <div
          ref={ghostRef}
          className={`w-full ${isCanvasElementMove ? "mb-0 opacity-100" : "mb-2 opacity-70"} ${ghostInsertAnimClass}`}
          id={String(preview.id || "")}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {isCanvasElementMove ? (
            <div
              className="w-full rounded-sm border border-dashed border-blue-400/70 bg-blue-400/8 px-1 dark:border-blue-300/70 dark:bg-blue-300/10"
              style={{ minHeight: ghostSpacerHeight, height: ghostSpacerHeight }}
            >
              <div className="flex h-full w-full items-center gap-1.5">
                <div className="h-[3px] w-[3px] shrink-0 rounded-full bg-blue-500/75 dark:bg-blue-300/75" />
                <div className="h-[1px] flex-1 rounded-full bg-blue-500/75 dark:bg-blue-300/75" />
              </div>
            </div>
          ) : (
            <ElementPreview element={preview} />
          )}
        </div>
      ),
    };
  };

  const findElementIndexForDND = (
    conI,
    colI,
    conID,
    colID,
    eleID,
    active,
    spnI = null,
    nestI = null
  ) => {
    let index;
    const getBucketElements = () => {
      if (Number.isInteger(spnI)) {
        if (Number.isInteger(nestI)) {
          return layouts?.[conI]?.columns?.[colI]?.spans?.[spnI]?.nestedSpans?.[nestI]?.elements;
        }
        return layouts?.[conI]?.columns?.[colI]?.spans?.[spnI]?.elements;
      }
      return layouts?.[conI]?.columns?.[colI]?.elements;
    };
    const snapIndexOutsideInlineGroup = (rawIndex) => {
      const bucket = getBucketElements();
      if (!Array.isArray(bucket) || !Number.isInteger(rawIndex)) return rawIndex;
      return snapInsertOutsideInlineGroup(bucket, rawIndex);
    };

    if (Number.isInteger(spnI)) {
      if (Number.isInteger(nestI)) {
        index = layouts[conI].columns[colI].spans[spnI].nestedSpans[
          nestI
        ].elements.findIndex((e) => e.id === eleID);
      } else {
        index = layouts[conI].columns[colI].spans[spnI].elements.findIndex(
          (e) => e.id === eleID
        );
      }
    } else {
      index = layouts[conI].columns[colI].elements.findIndex(
        (e) => e.id === eleID
      );
    }

    /** id บน DOM ต้องตรง SortableElementItem (มี Span/MiniSpan คั่นเมื่ออยู่ใน span) */
    let domElementId = `${conID}/${colID}/`;
    if (Number.isInteger(spnI) && spnI >= 0) {
      const sp = layouts[conI]?.columns?.[colI]?.spans?.[spnI];
      if (sp?.id) {
        domElementId += `${sp.id}/`;
        if (Number.isInteger(nestI) && nestI >= 0 && sp.nestedSpans?.[nestI]?.id) {
          domElementId += `${sp.nestedSpans[nestI].id}/`;
        }
      }
    }
    domElementId += eleID;

    const elementNode = document.querySelector(
      `[data-drop="ELEMENT"][id="${domElementId}"]`
    );

    const translated = active?.rect?.current?.translated;
    if (!elementNode || !translated) {
      return snapIndexOutsideInlineGroup(index);
    }

    const r = elementNode.getBoundingClientRect();

    const { top, height } = r;

    const mid = top + height / 2;
    const pointerY = Number(sectionReorderPointerRef.current?.y);
    const translatedMidY =
      Number(translated.top) + Number(translated.height) / 2;
    const compareY = Number.isFinite(pointerY) ? pointerY : translatedMidY;
    let checkCenter = compareY > mid ? 1 : 0;

    return snapIndexOutsideInlineGroup(index + checkCenter);
  };

  const dragMetaRef = useRef({
    startX: 0,
    startY: 0,
    dx: null,
    dy: null,
  });

  const getEventCoordinates = (event) => {
    if (!event) return { x: 0, y: 0 };
    const e = event.nativeEvent || event;
    if (e.touches && e.touches.length > 0) {
    
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    if (e.changedTouches && e.changedTouches.length > 0) {
      
      return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  };

  const snapCenterToCursor = ({ activeNodeRect, transform }) => {
    const meta = dragMetaRef.current;
  
    // ถ้ายังไม่พร้อม (rect ยังไม่มี) ก็ยังไม่ปรับ
    if (!activeNodeRect || !activeID?.eleID) return transform;
  
    // ✅ คำนวณครั้งเดียว แล้วล็อกไว้ (กันกระโดดตอน reorder)
    if (meta.dx == null || meta.dy == null) {
     
      meta.dx = meta.startX - activeNodeRect.left - 45; // ใช้สูตรเดิมของคุณ
      meta.dy = meta.startY - activeNodeRect.top - 40;
    }
  
    return {
      ...transform,
      x: transform.x + meta.dx,
      y: transform.y + meta.dy,
    };
  };

  const inlineGroupOverlayToRowOrigin = ({ transform }) => transform;

  const drag = ({ active,activatorEvent }) => {
    if(builderMode !== "Layout Mode") return;
    const draggingExisting = active?.data?.current?.type === "ELEMENT";
    if (!draggingExisting) {
      setPreview(null);
      sidebarPreviewIntentRef.current = { key: "", startedAt: 0, x: 0, y: 0 };
    }
    activeDragRef.current = active;
    dragMetaRef.current.dx = null;
    dragMetaRef.current.dy = null;
    lastEleMoveKeyRef.current = null;
    const { id, data } = active;
    const { current } = data;
    let section;
    let column;
    let element;
    let span;
    let nestedSpan;

    if (id.startsWith("Sec-")) {
      activeInlineDragGroupRef.current = null;
      section = layouts.find((l) => l.container.id === id);
      setActiveItem(section);
      setActiveID(id);
    } else if (id.startsWith("Col-")) {
      activeInlineDragGroupRef.current = null;
      section = layouts.find((l) => l.container.id === current.conID);
      if (!section?.columns) return;
      column = section.columns.find((c) => c.id === id);
      setActiveItem(column);
      setActiveID({ conID: current.conID, colID: id });
    } else if (current?.type === "SECTION") {
      activeInlineDragGroupRef.current = null;
      const splitLayouts = layouts.filter((l) => l.splitRowId === id);
      if (splitLayouts.length > 0) {
        setActiveItem({ _isSplitGhost: true, splitLayouts });
      } else {
        const layoutRow = layouts.find((l) => l.container?.id === id);
        if (!layoutRow) return;
        setActiveItem(layoutRow);
      }
      setActiveID(id);
      positionRef.current = layouts.findIndex(
        (l) => l.container?.id === id || l.splitRowId === id
      );
    } else if (current?.type === "SPAN") {
      activeInlineDragGroupRef.current = null;
      section = layouts.find((l) => l.container.id === current.conID);
      if (!section) return;
      positionRef.current = layouts.findIndex(
        (l) => l.container.id === current.conID
      );
      column = section.columns.find((c) => c.id === current.colID);
      const spanObj = column?.spans?.find((s) => s.id === id);
      setActiveItem(spanObj ?? null);
      setActiveID({
        conID: current.conID,
        colID: current.colID,
        spnID: id,
      });
    }
    else {
      section = layouts.find((l) => l.container.id === current.conID);
      if (!section?.columns) return;
      const si = layouts.findIndex((l) => l.container.id === current.conID);
      column = section.columns.find((c) => c.id === current.colID);
      let sourceElements = null;
      positionRef.current = si;
      if (column.isSpan) {
        span = column.spans.find((s) => s.id === current.spnID);
        if (span.hasNestedSpan) {
          nestedSpan = span.nestedSpans.find((ms) => ms.id === current.nestID);
          sourceElements = nestedSpan?.elements;
          element = sourceElements?.find(
            (e) => String(e?.id || "") === String(id)
          );
        } else {
          sourceElements = span?.elements;
          element = sourceElements?.find(
            (e) => String(e?.id || "") === String(id)
          );
        }
      } else {
        sourceElements = column?.elements;
        element = sourceElements?.find(
          (e) => String(e?.id || "") === String(id)
        );
      }
      activeInlineDragGroupRef.current = null;
      setActiveItem(element);
      setActiveID({
        conID: current.conID,
        colID: current.colID,
        eleID: id,
        spnID: current.spnID ? current.spnID : null,
      });
      const { x, y } = getEventCoordinates(activatorEvent);
      
      dragMetaRef.current.startX = x;
      dragMetaRef.current.startY = y;
 
    }
  };

  const warnListImageColumnConstraint = () => {
    blockedDropToastRef.current = "listImage";
  };

  const warnCarouselColumnConstraint = () => {
    blockedDropToastRef.current = "carousel";
  };

  const warnPostColumnConstraint = () => {
    blockedDropToastRef.current = "post";
  };

  function pickThaiFemaleVoice() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
    const synth = window.speechSynthesis;
    const voices = toastSpeechVoicesRef.current.length
      ? toastSpeechVoicesRef.current
      : synth.getVoices();
    if (!Array.isArray(voices) || voices.length === 0) return null;
    const thaiVoices = voices.filter((v) => /th/i.test(v?.lang || ""));
    if (!thaiVoices.length) return voices[0] || null;
    const femaleHint = /(female|woman|zira|kanya|suda|fah)/i;
    return thaiVoices.find((v) => femaleHint.test(v?.name || "")) || thaiVoices[0];
  }

  function speakToast(message, dedupeKey) {
    if (!message || typeof window === "undefined") return;
    const now = Date.now();
    if (
      toastSpeechLastRef.current.key === dedupeKey &&
      now - toastSpeechLastRef.current.at < 1200
    ) {
      return;
    }
    toastSpeechLastRef.current = { key: dedupeKey, at: now };
    const audio = toastAudioByKeyRef.current?.[dedupeKey] || toastAudioRef.current;
    if (audio) {
      try {
        audio.currentTime = 0;
        const playPromise = audio.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => {
            /* fallback ไป speech ด้านล่าง */
          });
        }
        return;
      } catch (_) {
        /* fallback ไป speech ด้านล่าง */
      }
    }
    if (!("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    const utter = new SpeechSynthesisUtterance(message);
    const voice = pickThaiFemaleVoice();
    utter.lang = voice?.lang || "th-TH";
    utter.voice = voice || null;
    utter.rate = 1;
    utter.pitch = 1.08;
    utter.volume = 1;
    synth.cancel();
    synth.speak(utter);
  }

  const during = ({ active, over }) => {
    if(builderMode !== "Layout Mode") return;
    if (!over || !active) return;
    if (!active || !active.data?.current) return;
    if (active.id === over.id) return;

    /* กัน ping-pong: ถ้า pair นี้เพิ่งถูก apply ไปแล้ว ให้ skip */
    const eleMoveKey = `${String(active.id)}→${String(over.id)}`;
    const isEleMove =
      over.data.current.type === "ELEMENT" &&
      active.data.current.type === "ELEMENT";
    if (isEleMove) {
      if (lastEleMoveKeyRef.current === eleMoveKey) return;
      /* over.id เปลี่ยนไปหา element อื่น → reset เพื่อให้ move กลับได้ */
      const lastOver = lastEleMoveKeyRef.current?.split("→")[1];
      if (lastOver && lastOver !== String(over.id)) {
        lastEleMoveKeyRef.current = null;
      }
    }
    setIsDraggingLayout(true);

    if (
      over.data.current.type === "SPAN" &&
      active.data.current.type === "SPAN"
    ) {
      const oldCon = active.data.current.conID;
      const oldCol = active.data.current.colID;
      if (
        oldCon !== over.data.current.conID ||
        oldCol !== over.data.current.colID
      )
        return;
      const IDX = layouts.findIndex((l) => l.container.id === oldCon);
      if (IDX === -1) return;
      const colIdx = layouts[IDX].columns.findIndex((c) => c.id === oldCol);
      if (colIdx === -1) return;
      const spans = layouts[IDX].columns[colIdx].spans;
      const oldIndex = spans.findIndex((s) => s.id === active.id);
      const newIndex = spans.findIndex((s) => s.id === over.id);
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;
      change_span_order(oldIndex, newIndex, IDX, colIdx);
      return;
    }

    if (
      over.data.current.type === "SECTION" &&
      active.data.current.type === "SECTION"
    ) {
      const oldIndex = layouts.findIndex(
        (l) => l.container?.id === active.id || l.splitRowId === active.id
      );
      if (oldIndex === -1) return;
      const hit = layouts[oldIndex];
      const activeIsSplit = Boolean(hit?.splitRowId && hit.splitRowId === active.id);
      let newIndex = layouts.findIndex(
        (l) => l.container?.id === over.id || l.splitRowId === over.id
      );
      if (newIndex === -1) return;
      if (activeIsSplit) {
        const ptr = sectionReorderPointerRef.current;
        const py = Number.isFinite(ptr?.y)
          ? ptr.y
          : over.rect.top + over.rect.height / 2;
        newIndex = computeSectionPhysicalInsertIndex(
          layouts,
          String(over.id),
          over.rect,
          py
        );
      }
      if (oldIndex === newIndex && !activeIsSplit) return;
      if (activeIsSplit) {
        const sid = hit.splitRowId;
        let firstI = oldIndex;
        while (firstI > 0 && layouts[firstI - 1]?.splitRowId === sid) {
          firstI--;
        }
        let lastI = oldIndex;
        while (
          lastI < layouts.length - 1 &&
          layouts[lastI + 1]?.splitRowId === sid
        ) {
          lastI++;
        }
        let insertAtSans = 0;
        for (let i = 0; i < newIndex; i++) {
          if (i < firstI || i > lastI) insertAtSans++;
        }
        if (insertAtSans === firstI) return;
      }
      change_container_position(oldIndex, newIndex);
      return;
    }

    const types = ["COLUMN", "ELEMENT"];
    if (
      !types.includes(over.data.current.type) ||
      !types.includes(active.data.current.type)
    )
      return;

    const oldContainerID = active.data.current.conID;
    const newContainerID = over.data.current.conID;


    if (
      over.data.current.type === "ELEMENT" &&
      active.data.current.type === "ELEMENT" 
    ) {

      
      const blockListImageIfNarrow = (destConI, destColI, destSpnI, destMspnI) => {
        if (
          !shouldBlockListImageDrop(
            layouts,
            active,
            destConI,
            destColI,
            destSpnI,
            destMspnI
          )
        )
          return false;
        warnListImageColumnConstraint();
        return true;
      };

      const blockCarouselIfNarrow = (destConI, destColI, destSpnI, destMspnI) => {
        if (
          !shouldBlockCarouselDrop(
            layouts,
            active,
            destConI,
            destColI,
            destSpnI,
            destMspnI
          )
        )
          return false;
        warnCarouselColumnConstraint();
        return true;
      };

      const blockTableIfNarrow = (destConI, destColI, destSpnI, destMspnI) => {
        if (
          !shouldBlockTableDrop(
            layouts,
            active,
            destConI,
            destColI,
            destSpnI,
            destMspnI
          )
        )
          return false;
        warnCarouselColumnConstraint();
        return true;
      };

      const blockBetweenIfNarrow = (destConI, destColI, destSpnI, destMspnI) => {
        if (
          !shouldBlockBetweenDrop(
            layouts,
            active,
            destConI,
            destColI,
            destSpnI,
            destMspnI
          )
        )
          return false;
        warnCarouselColumnConstraint();
        return true;
      };

      const blockTabsIfNarrow = (destConI, destColI, destSpnI, destMspnI) => {
        if (
          !shouldBlockTabsDrop(
            layouts,
            active,
            destConI,
            destColI,
            destSpnI,
            destMspnI
          )
        )
          return false;
        warnPostColumnConstraint();
        return true;
      };

      const blockAccordionIfNarrow = (destConI, destColI, destSpnI, destMspnI) => {
        if (
          !shouldBlockAccordionDrop(
            layouts,
            active,
            destConI,
            destColI,
            destSpnI,
            destMspnI
          )
        )
          return false;
        warnCarouselColumnConstraint();
        return true;
      };

      const blockImageHoverIfNarrow = (destConI, destColI, destSpnI, destMspnI) => {
        if (
          !shouldBlockImageHoverDrop(
            layouts,
            active,
            destConI,
            destColI,
            destSpnI,
            destMspnI
          )
        )
          return false;
        warnCarouselColumnConstraint();
        return true;
      };

      const blockMinColIfNarrow = (destConI, destColI, destSpnI, destMspnI) =>
        blockListImageIfNarrow(destConI, destColI, destSpnI, destMspnI) ||
        blockImageHoverIfNarrow(destConI, destColI, destSpnI, destMspnI) ||
        blockAccordionIfNarrow(destConI, destColI, destSpnI, destMspnI) ||
        blockTabsIfNarrow(destConI, destColI, destSpnI, destMspnI) ||
        blockBetweenIfNarrow(destConI, destColI, destSpnI, destMspnI) ||
        blockTableIfNarrow(destConI, destColI, destSpnI, destMspnI) ||
        blockCarouselIfNarrow(destConI, destColI, destSpnI, destMspnI) ||
        (() => {
          if (
            !shouldBlockPostDrop(
              layouts,
              active,
              destConI,
              destColI,
              destSpnI,
              destMspnI
            )
          )
            return false;
          warnPostColumnConstraint();
          return true;
        })();

      const oldColumnID = active.data.current.colID;
      const newColumnID = over.data.current.colID;
      const R = contained.current[positionRef.current]?.getBoundingClientRect();
      if (!R) return;
      const { bottom: sb, top: st } = R;
      if (!sb || !st) return;
      let rectDragRef = dragRef.current?.getBoundingClientRect() ||
      active.rect?.current?.translated ||
      active.rect?.current?.initial ||
      active.rect?.current;
      if (!rectDragRef) return;
      const { top: t, height: h, left: l, right: r, bottom: b,width:w } = rectDragRef;
      const mid = t + h / 2;
      const midX = l + w / 2;
      let checkPosition = true
      if (oldColumnID === newColumnID && oldContainerID === newContainerID) {
        const IDX = layouts.findIndex((l) => l.container.id === oldContainerID);
        const idx = layouts[IDX].columns.findIndex((c) => c.id === oldColumnID);
        if (IDX === -1 || idx === -1) return;
        let oldIndex, newIndex, sidx1, sidx2, msidx1, msidx2, target;
        if (active.data.current.spnID && over.data.current.spnID) {
          sidx1 = layouts[IDX].columns[idx].spans.findIndex(
            (s) => s.id === active.data.current.spnID
          );
          sidx2 = layouts[IDX].columns[idx].spans.findIndex(
            (s) => s.id === over.data.current.spnID
          );
          if (active.data.current.nestID != null) {
            msidx1 = layouts[IDX].columns[idx].spans[sidx1].nestedSpans.findIndex(
              (ms) =>
                String(ms?.id ?? "") === String(active.data.current.nestID)
            );
            if (!Number.isInteger(msidx1) || msidx1 < 0) return;
            oldIndex = layouts[IDX].columns[idx].spans[sidx1].nestedSpans[
              msidx1
            ].elements.findIndex((e) => e.id === active.id);
          } else {
            oldIndex = layouts[IDX].columns[idx].spans[
              sidx1
            ].elements.findIndex((e) => e.id === active.id);
          }
          if (oldIndex === -1) return;
          if (over.data.current.nestID != null) {
            msidx2 = layouts[IDX].columns[idx].spans[sidx2].nestedSpans.findIndex(
              (ms) =>
                String(ms?.id ?? "") === String(over.data.current.nestID)
            );
            if (!Number.isInteger(msidx2) || msidx2 < 0) return;
            target =
              layouts[IDX].columns[idx].spans[sidx2].nestedSpans[msidx2].elements;
          } else {
            target = layouts[IDX].columns[idx].spans[sidx2].elements;
          }
          if (Number.isInteger(msidx1) && Number.isInteger(msidx2) && msidx1 !== msidx2) {
            // mini span -> mini span (same span): avoid live move while dragging.
            // We commit by dropTargetRef on mouse up to prevent stale-frame target.
            return;
          }
          /* same bucket ใน Span/MiniSpan: ให้พฤติกรรมเหมือนคอลัมน์ปกติ
             (ระหว่างลากใช้แค่ visual ของ DND-kit แล้วค่อย commit ตอน drop) */
          const sameSpanBucket =
            Number.isInteger(sidx1) &&
            Number.isInteger(sidx2) &&
            sidx1 === sidx2 &&
            (msidx1 ?? null) === (msidx2 ?? null);
          if (sameSpanBucket) return;
          const checkSIDX = Number.isInteger(sidx1) && Number.isInteger(sidx2)
          const checkMSIDX = Number.isInteger(msidx1) && Number.isInteger(msidx2)
          if(checkSIDX && sidx1 !== sidx2 && !checkMSIDX){
            const span1 = spaned.current[IDX][idx][sidx1]
            const span2 = spaned.current[IDX][idx][sidx2]
            if (!span1 || !span2) return;
            const {top:t1,bottom:b1} = span1.getBoundingClientRect()
            const {top:t2,bottom:b2} = span2.getBoundingClientRect()
            if(sidx1 < sidx2){
              checkPosition = mid > t2
            }else{
              checkPosition = mid <= b2
            }
            
          }
          else if(checkSIDX && sidx1 === sidx2 && checkMSIDX && msidx1 !== msidx2){
            const nestedSpan1 = nestedSpaned.current[IDX][idx][sidx1][msidx1]
            const nestedSpan2 = nestedSpaned.current[IDX][idx][sidx2][msidx2]
            if (!nestedSpan1 || !nestedSpan2) return;
            const {top:t1,bottom:b1,left:l1,right:r1} = nestedSpan1.getBoundingClientRect()
            const {top:t2,bottom:b2,left:l2,right:r2} = nestedSpan2.getBoundingClientRect()
            const isSameRow = !(b1 <= t2 || t1 >= b2)
            if(isSameRow){
              if(msidx1 < msidx2){
                checkPosition = midX > l2 && mid > t2 && mid < b2
              }else{
                checkPosition = midX < r2 && mid > t2 && mid < b2
              }
            }else{
              if(b1 < t2){
                checkPosition = mid > t2 && (midX >= l2 && midX <= r2)
              }else{
                checkPosition = mid < b2 && (midX >= l2 && midX <= r2)
              }
            }
          
          }
          if(!checkPosition) return
          if (target.length === 0) {
            if (blockMinColIfNarrow(IDX, idx, sidx2, msidx2)) return;
            change_element_position(
              oldIndex,
              0,
              IDX,
              idx,
              sidx1,
              sidx2,
              msidx1,
              msidx2
            );
            return;
          } else {
            newIndex = target.findIndex((e) => e.id === over.id);
          }
        } else {
          /* same column, no span → ให้ DND-kit จัดการ visual ผ่าน CSS transform
             position จะถูก commit ใน drop() เหมือน Tab Area */
          return;
        }

        if (blockMinColIfNarrow(IDX, idx, sidx2, msidx2)) return;
        lastEleMoveKeyRef.current = eleMoveKey;
        change_element_position(
          oldIndex,
          newIndex,
          IDX,
          idx,
          sidx1,
          sidx2,
          msidx1,
          msidx2
        );
      } else if (
        oldColumnID !== newColumnID &&
        oldContainerID === newContainerID
      ) {
        const IDX = layouts.findIndex((l) => l.container.id === oldContainerID);
        const idx1 = layouts[IDX].columns.findIndex(
          (c) => c.id === oldColumnID
        );
        const idx2 = layouts[IDX].columns.findIndex(
          (c) => c.id === newColumnID
        );
        if (IDX === -1 || idx1 === -1 || idx2 === -1) return;
        let sidx1, msidx1;
        let sidx2, msidx2;
        let oldIndex;
        let newIndex;
        if (active.data.current.spnID) {
          const { spnID } = active.data.current;
          sidx1 = layouts[IDX].columns[idx1].spans.findIndex(
            (s) => s.id === spnID
          );
          if (active.data.current.nestID != null) {
            const { nestID } = active.data.current;
            msidx1 = layouts[IDX].columns[idx1].spans[
              sidx1
            ].nestedSpans.findIndex(
              (ms) => String(ms?.id ?? "") === String(nestID)
            );
            if (!Number.isInteger(msidx1) || msidx1 < 0) return;
            oldIndex = layouts[IDX].columns[idx1].spans[sidx1].nestedSpans[
              msidx1
            ].elements.findIndex((e) => e.id === active.id);
          } else {
            oldIndex = layouts[IDX].columns[idx1].spans[
              sidx1
            ].elements.findIndex((e) => e.id === active.id);
          }
        } else {
          oldIndex = layouts[IDX].columns[idx1].elements.findIndex(
            (e) => e.id === active.id
          );
        }

        if (oldIndex === -1) return;
        
        

        if (over.data.current.spnID) {
          const { spnID } = over.data.current;
          sidx2 = layouts[IDX].columns[idx2].spans.findIndex(
            (s) => s.id === spnID
          );
          if (over.data.current.nestID != null) {
            const { nestID } = over.data.current;
            msidx2 = layouts[IDX].columns[idx2].spans[
              sidx2
            ].nestedSpans.findIndex(
              (ms) => String(ms?.id ?? "") === String(nestID)
            );
            if (!Number.isInteger(msidx2) || msidx2 < 0) return;
          }
        }

        const targetLength =
          msidx2 >= 0
            ? layouts[IDX].columns[idx2].spans[sidx2].nestedSpans[msidx2].elements
                .length
            : sidx2 >= 0
            ? layouts[IDX].columns[idx2].spans[sidx2].elements.length
            : layouts[IDX].columns[idx2].elements.length;

          const rect = Number.isInteger(msidx2) ? nestedSpaned.current[IDX][idx2][sidx2][msidx2].getBoundingClientRect(): Number.isInteger(sidx2) ? spaned.current[IDX][idx2][sidx2].getBoundingClientRect(): columned.current[IDX][idx2].getBoundingClientRect()
            if(!rect) return

        const {
          bottom: cb,
          top: ct,
          left: cl,
          right: cr,
        } = rect
    
          if (idx2 < idx1) {
            checkPosition = mid > ct && mid < cb && midX < cr;
          } else if (idx2 > idx1) {
            checkPosition = mid > ct && mid < cb && midX > cl;
          }
     

        if (!checkPosition) return;

        positionRef.current = IDX;

        if (targetLength === 0) {
          if (blockMinColIfNarrow(IDX, idx2, sidx2, msidx2)) return;
          lastEleMoveKeyRef.current = eleMoveKey;
          change_element_position_new_column(
            oldIndex,
            0,
            IDX,
            idx1,
            idx2,
            sidx1,
            sidx2,
            msidx1,
            msidx2
          );
          return;
        } else {
          newIndex = findElementIndexForDND(
            IDX,
            idx2,
            newContainerID,
            newColumnID,
            over.id,
            active,
            sidx2,
            msidx2
          );
          if (newIndex === -1) return;
          if (blockMinColIfNarrow(IDX, idx2, sidx2, msidx2)) return;
          lastEleMoveKeyRef.current = eleMoveKey;
          change_element_position_new_column(
            oldIndex,
            newIndex,
            IDX,
            idx1,
            idx2,
            sidx1,
            sidx2,
            msidx1,
            msidx2
          );
        }
      } else if (oldContainerID !== newContainerID) {
        const IDX1 = layouts.findIndex(
          (l) => l.container.id === oldContainerID
        );
        const IDX2 = layouts.findIndex(
          (l) => l.container.id === newContainerID
        );
        const idx1 = layouts[IDX1].columns.findIndex(
          (c) => c.id === oldColumnID
        );
        const idx2 = layouts[IDX2].columns.findIndex(
          (c) => c.id === newColumnID
        );
        if (IDX1 === -1 || IDX2 === -1 || idx1 === -1 || idx2 === -1) return;
        let sidx1, msidx1;
        let sidx2, msidx2;
        let oldIndex;
        let newIndex;
        if (active.data.current.spnID) {
          const { spnID } = active.data.current;
          sidx1 = layouts[IDX1].columns[idx1].spans.findIndex(
            (s) => s.id === spnID
          );
          if (active.data.current.nestID != null) {
            const { nestID } = active.data.current;
            msidx1 = layouts[IDX1].columns[idx1].spans[
              sidx1
            ].nestedSpans.findIndex(
              (ms) => String(ms?.id ?? "") === String(nestID)
            );
            if (!Number.isInteger(msidx1) || msidx1 < 0) return;
            oldIndex = layouts[IDX1].columns[idx1].spans[sidx1].nestedSpans[
              msidx1
            ].elements.findIndex((e) => e.id === active.id);
          } else {
            oldIndex = layouts[IDX1].columns[idx1].spans[
              sidx1
            ].elements.findIndex((e) => e.id === active.id);
          }
        } else {
          oldIndex = layouts[IDX1].columns[idx1].elements.findIndex(
            (e) => e.id === active.id
          );
        }

        if (oldIndex === -1) return;

        if (over.data.current.spnID) {
          const { spnID } = over.data.current;
          sidx2 = layouts[IDX2].columns[idx2].spans.findIndex(
            (s) => s.id === spnID
          );
          if (over.data.current.nestID != null) {
            const nestID = over.data.current.nestID;
            msidx2 = layouts[IDX2].columns[idx2].spans[
              sidx2
            ].nestedSpans.findIndex(
              (ms) => String(ms?.id ?? "") === String(nestID)
            );
            if (!Number.isInteger(msidx2) || msidx2 < 0) return;
          }
        }

        let targetLength;
        if (Number.isInteger(sidx2)) {
          if (Number.isInteger(msidx2)) {
            targetLength =
              layouts[IDX2].columns[idx2].spans[sidx2].nestedSpans[msidx2]
                .elements.length;
          } else {
            targetLength =
              layouts[IDX2].columns[idx2].spans[sidx2].elements.length;
          }
        } else {
          targetLength = layouts[IDX2].columns[idx2].elements.length;
        }

        const rect = Number.isInteger(msidx2) ? nestedSpaned.current[IDX2][idx2][sidx2][msidx2].getBoundingClientRect(): Number.isInteger(sidx2) ? spaned.current[IDX2][idx2][sidx2].getBoundingClientRect(): columned.current[IDX2][idx2].getBoundingClientRect()
        if(!rect) return
        const {
          bottom: cb,
          top: ct,
          left: cl,
          right: cr,
        } = rect
        if (IDX2 > positionRef.current) {
          checkPosition = mid > ct && midX < cr && midX > cl;
        } else if (IDX2 < positionRef.current) {
          checkPosition = mid < cb && midX < cr && midX > cl;
        }

        if (!checkPosition) return;

        positionRef.current = IDX2;
        if (targetLength === 0) {
          if (blockMinColIfNarrow(IDX2, idx2, sidx2, msidx2)) return;
          lastEleMoveKeyRef.current = eleMoveKey;
          change_element_position_new_container(
            oldIndex,
            0,
            IDX1,
            IDX2,
            idx1,
            idx2,
            sidx1,
            sidx2,
            msidx1,
            msidx2
          );
          return;
        } else {
          newIndex = findElementIndexForDND(
            IDX2,
            idx2,
            newContainerID,
            newColumnID,
            over.id,
            active,
            sidx2,
            msidx2
          );
          if (newIndex === -1) return;

          if (blockMinColIfNarrow(IDX2, idx2, sidx2, msidx2)) return;
          lastEleMoveKeyRef.current = eleMoveKey;
          change_element_position_new_container(
            oldIndex,
            newIndex,
            IDX1,
            IDX2,
            idx1,
            idx2,
            sidx1,
            sidx2,
            msidx1,
            msidx2
          );
          return;
        }
      }
    } else if (
      over.data.current.type === "COLUMN" &&
      active.data.current.type === "COLUMN"
    ) {
      if (oldContainerID === newContainerID) {
        /* same-section COLUMN: ระหว่างลากให้ DND-kit จัดการ visual ก่อน
           แล้วค่อย commit จริงใน drop() เพื่อลดอาการกระตุก/สลับแปลก */
        return;
      } else if (oldContainerID !== newContainerID) {
        return;
      }
    }
  };

  const drop = ({ active, over }) => {
    
    if(builderMode !== "Layout Mode") return;
    sidebarPreviewIntentRef.current = { key: "", startedAt: 0, x: 0, y: 0 };
    dragMetaRef.current.dx = null;
    dragMetaRef.current.dy = null;
    lastEleMoveKeyRef.current = null;
    activeInlineDragGroupRef.current = null;
    setDisableColDrag(true);
    setDisableConDrag(true);
    setActiveID(null);
    positionRef.current = null;
    setActiveItem(null);
    setIsDraggingLayout(false);
    if (!active || !active.data?.current) return;
    const normalizeCommittedIndexForSameBucketReorder = (
      rawIndex,
      oldIndex,
      bucketLength
    ) => {
      if (
        !Number.isInteger(rawIndex) ||
        !Number.isInteger(oldIndex) ||
        !Number.isInteger(bucketLength)
      ) {
        return rawIndex;
      }
      const safe = Math.max(0, Math.min(bucketLength, rawIndex));
      // Keep boundary index as-is so drop commit matches preview position.
      return safe;
    };
    const pickFinalBoundaryForCommit = ({
      committedBoundary,
      pointerBoundary,
      oldIndex,
      bucketLength,
    }) => {
      const committedSafe = Number.isInteger(committedBoundary)
        ? Math.max(0, Math.min(bucketLength, committedBoundary))
        : null;
      const pointerSafe = Number.isInteger(pointerBoundary)
        ? Math.max(0, Math.min(bucketLength, pointerBoundary))
        : null;
      // If committed boundary is stale and equals current position,
      // prefer latest pointer boundary so drop does not snap back.
      if (
        committedSafe != null &&
        committedSafe === oldIndex &&
        pointerSafe != null &&
        pointerSafe !== oldIndex
      ) {
        return pointerSafe;
      }
      if (committedSafe != null) return committedSafe;
      if (pointerSafe != null) return pointerSafe;
      return null;
    };
    const resolvePointerBoundaryInBucket = (bucket, overEleId) => {
      if (!Array.isArray(bucket) || !bucket.length) return null;
      const overId = String(overEleId || "");
      if (!overId) return null;
      const overIndex = bucket.findIndex((e) => String(e?.id || "") === overId);
      if (!Number.isInteger(overIndex) || overIndex < 0) return null;
      const pointerY = Number(sectionReorderPointerRef.current?.y);
      if (!Number.isFinite(pointerY)) return null;
      const overNode = findDropElementNodeByEleId(overId);
      if (!overNode) return null;
      const rect = overNode.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      const rawBoundary = overIndex + (pointerY > midY ? 1 : 0);
      return snapInsertOutsideInlineGroup(bucket, rawBoundary);
    };
    const commitSameBucketByPreviewBoundary = () => {
      if (active.data.current.type !== "ELEMENT") return false;
      const cur = dropTargetRef.current;
      if (
        cur?.type !== "ELEMENT" ||
        !cur?.index ||
        !Number.isInteger(cur.index?.conI) ||
        !Number.isInteger(cur.index?.colI) ||
        !Number.isInteger(cur.index?.eleI)
      ) {
        return false;
      }
      const srcConID = active.data.current.conID;
      const srcColID = active.data.current.colID;
      const srcSpnID = active.data.current.spnID ?? null;
      const srcMspnID = active.data.current.nestID ?? null;
      const srcConI = layouts.findIndex((l) => l.container.id === srcConID);
      if (srcConI === -1 || srcConI !== cur.index.conI) return false;
      const srcColI = layouts[srcConI].columns.findIndex((c) => c.id === srcColID);
      if (srcColI === -1 || srcColI !== cur.index.colI) return false;
      let srcSpnI = null;
      let srcMspnI = null;
      if (srcSpnID != null) {
        srcSpnI = layouts[srcConI].columns[srcColI].spans.findIndex((s) => s.id === srcSpnID);
        if (srcSpnI === -1) return false;
      }
      if (srcMspnID != null) {
        if (!Number.isInteger(srcSpnI)) return false;
        srcMspnI = layouts[srcConI].columns[srcColI].spans[srcSpnI].nestedSpans.findIndex(
          (ms) => ms.id === srcMspnID
        );
        if (srcMspnI === -1) return false;
      }
      if ((cur.index?.spnI ?? null) !== (srcSpnI ?? null)) return false;
      if ((cur.index?.nestI ?? null) !== (srcMspnI ?? null)) return false;
      let bucket = layouts[srcConI].columns[srcColI].elements;
      if (Number.isInteger(srcSpnI)) {
        bucket = Number.isInteger(srcMspnI)
          ? layouts[srcConI].columns[srcColI].spans[srcSpnI].nestedSpans[srcMspnI].elements
          : layouts[srcConI].columns[srcColI].spans[srcSpnI].elements;
      }
      if (!Array.isArray(bucket)) return false;
      const oldIndex = bucket.findIndex((e) => e.id === active.id);
      if (oldIndex === -1) return false;
      const boundaryRaw = cur.isLast === true ? bucket.length : cur.index.eleI;
      if (!Number.isInteger(boundaryRaw)) return false;
      const sourceGroup = getInlineRowGroupBounds(bucket, oldIndex);
      const sourceStart = sourceGroup ? sourceGroup.start : oldIndex;
      const sourceEnd = sourceGroup ? sourceGroup.end : oldIndex;
      const blockLen = sourceEnd - sourceStart + 1;
      let boundary = Math.max(0, Math.min(bucket.length, boundaryRaw));
      if (sourceGroup) {
        boundary = snapInsertOutsideInlineGroup(bucket, boundary);
      }
      if (boundary > sourceEnd + 1) {
        boundary -= blockLen;
      } else if (boundary >= sourceStart && boundary <= sourceEnd + 1) {
        boundary = sourceStart;
      }
      const nextLayouts = lodash.cloneDeep(layouts);
      let nextBucket = nextLayouts[srcConI].columns[srcColI].elements;
      if (Number.isInteger(srcSpnI)) {
        nextBucket = Number.isInteger(srcMspnI)
          ? nextLayouts[srcConI].columns[srcColI].spans[srcSpnI].nestedSpans[srcMspnI].elements
          : nextLayouts[srcConI].columns[srcColI].spans[srcSpnI].elements;
      }
      if (!Array.isArray(nextBucket)) return false;
      const moveBlock = nextBucket.splice(sourceStart, blockLen);
      const insertAt = Math.max(0, Math.min(nextBucket.length, boundary));
      nextBucket.splice(insertAt, 0, ...moveBlock);
      stripOrphanInlineRowGroupIds(nextBucket);
      setLayout(nextLayouts);
      return true;
    };
    const commitElementDropByPreviewBoundary = () => {
      if (active.data.current?.type !== "ELEMENT") return false;
      const cur = dropTargetRef.current;
      if (
        cur?.type !== "ELEMENT" ||
        !cur?.index ||
        !Number.isInteger(cur.index?.conI) ||
        !Number.isInteger(cur.index?.colI) ||
        !Number.isInteger(cur.index?.eleI)
      ) {
        return false;
      }
      const nextLayouts = lodash.cloneDeep(layouts);
      const srcLoc = findLayoutElementListIndex(nextLayouts, String(active.id || ""));
      if (!srcLoc || !Array.isArray(srcLoc.list) || !Number.isInteger(srcLoc.ix)) return false;
      const dstBucket = getBucketByDropIndex(
        nextLayouts,
        cur.index.conI,
        cur.index.colI,
        cur.index?.spnI ?? null,
        cur.index?.nestI ?? null
      );
      const dstList = dstBucket?.elements;
      if (!Array.isArray(dstList)) return false;
      const srcList = srcLoc.list;
      const boundaryRaw = cur.isLast === true ? dstList.length : cur.index.eleI;
      if (!Number.isInteger(boundaryRaw)) return false;
      const boundaryClamped = Math.max(0, Math.min(dstList.length, boundaryRaw));

      if (srcList === dstList) {
        if (srcLoc.ix === boundaryClamped || srcLoc.ix + 1 === boundaryClamped) return false;
        const [moved] = srcList.splice(srcLoc.ix, 1);
        if (!moved) return false;
        let boundary = boundaryClamped;
        if (srcLoc.ix < boundary) boundary -= 1;
        boundary = Math.max(0, Math.min(srcList.length, boundary));
        srcList.splice(boundary, 0, moved);
        setLayout(nextLayouts);
        return true;
      }

      const [moved] = srcList.splice(srcLoc.ix, 1);
      if (!moved) return false;
      dstList.splice(boundaryClamped, 0, moved);
      setLayout(nextLayouts);
      return true;
    };
    if (commitElementDropByPreviewBoundary()) return;
    if (commitSameBucketByPreviewBoundary()) return;
    if (!over || !over.data?.current) return;
    const isElementDropPair =
      over?.data?.current?.type === "ELEMENT" &&
      active.data.current.type === "ELEMENT";
    if (over && active.id === over.id && !isElementDropPair) return;
    activeDragRef.current = null;

    /* same-section COLUMN → commit reorder ตอนปล่อย */
    if (
      over.data.current.type === "COLUMN" &&
      active.data.current.type === "COLUMN" &&
      active.data.current.conID === over.data.current.conID
    ) {
      const conID = active.data.current.conID;
      const IDX = layouts.findIndex((l) => l.container.id === conID);
      if (IDX === -1) return;
      const oldIndex = layouts[IDX].columns.findIndex((c) => c.id === active.id);
      const newIndex = layouts[IDX].columns.findIndex((c) => c.id === over.id);
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;
      change_column_position(oldIndex, newIndex, IDX);
      return;
    }

    /* same-column, same-container, no-span ELEMENT → commit ที่นี่ (visual จัดการโดย DND-kit) */
    if (
      over.data.current.type === "ELEMENT" &&
      active.data.current.type === "ELEMENT" &&
      active.data.current.colID === over.data.current.colID &&
      active.data.current.conID === over.data.current.conID &&
      !active.data.current.spnID &&
      !over.data.current.spnID
    ) {
      const conID = active.data.current.conID;
      const colID = active.data.current.colID;
      const IDX = layouts.findIndex((l) => l.container.id === conID);
      if (IDX === -1) return;
      const idx = layouts[IDX].columns.findIndex((c) => c.id === colID);
      if (idx === -1) return;
      const elements = layouts[IDX].columns[idx].elements;
      const oldIndex = elements.findIndex((e) => e.id === active.id);
      const committedDropIndex = (() => {
        const cur = dropTargetRef.current;
        if (
          cur?.type === "ELEMENT" &&
          Number.isInteger(cur?.index?.conI) &&
          Number.isInteger(cur?.index?.colI) &&
          cur.index?.spnI == null &&
          cur.index?.nestI == null &&
          cur.index.conI === IDX &&
          cur.index.colI === idx &&
          Number.isInteger(cur.index.eleI)
        ) {
          if (cur.isLast === true) return elements.length;
          return cur.index.eleI;
        }
        return null;
      })();
      const pointerBoundary = resolvePointerBoundaryInBucket(elements, over.id);
      const effectiveBoundary = pickFinalBoundaryForCommit({
        committedBoundary: committedDropIndex,
        pointerBoundary,
        oldIndex,
        bucketLength: elements.length,
      });
      const newIndex = elements.findIndex((e) => e.id === over.id);
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;
      change_element_position(oldIndex, newIndex, IDX, idx, null, null, null, null);
      return;
    }
    /* same-column, same-container, same-span/minispan ELEMENT
       ใช้พฤติกรรมเดียวกับคอลัมน์ปกติ (reorder ภายใน bucket เดียวกัน) */
    if (
      over.data.current.type === "ELEMENT" &&
      active.data.current.type === "ELEMENT" &&
      active.data.current.colID === over.data.current.colID &&
      active.data.current.conID === over.data.current.conID &&
      active.data.current.spnID &&
      over.data.current.spnID &&
      active.data.current.spnID === over.data.current.spnID &&
      (active.data.current.nestID ?? null) === (over.data.current.nestID ?? null)
    ) {
      const conID = active.data.current.conID;
      const colID = active.data.current.colID;
      const spnID = active.data.current.spnID;
      const nestID = active.data.current.nestID ?? null;
      const IDX = layouts.findIndex((l) => l.container.id === conID);
      if (IDX === -1) return;
      const idx = layouts[IDX].columns.findIndex((c) => c.id === colID);
      if (idx === -1) return;
      const sidx = layouts[IDX].columns[idx].spans.findIndex((s) => s.id === spnID);
      if (sidx === -1) return;
      let bucket = layouts[IDX].columns[idx].spans[sidx].elements;
      let msidx = null;
      if (nestID != null) {
        msidx = layouts[IDX].columns[idx].spans[sidx].nestedSpans.findIndex(
          (ms) => String(ms?.id ?? "") === String(nestID)
        );
        if (msidx === -1) return;
        bucket = layouts[IDX].columns[idx].spans[sidx].nestedSpans[msidx].elements;
      }
      const oldIndex = bucket.findIndex((e) => e.id === active.id);
      const newIndex = bucket.findIndex((e) => e.id === over.id);
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;
      change_element_position(oldIndex, newIndex, IDX, idx, sidx, sidx, msidx, msidx);
      return;
    }

    /* ลำดับ Section / cross-column อัปเดตใน during() แล้ว — drop ไม่ต้องสลับซ้ำ */
    activeDragRef.current = null;
    return;
  };

  function collisionByType(args) {
    const { active, droppableContainers, pointerCoordinates, droppableRects } =
      args;
    const { type } = active.data.current;

    if (pointerCoordinates) {
      sectionReorderPointerRef.current = pointerCoordinates;
    }

    const filtered = droppableContainers.filter((dc) => {
      const t = dc.data.current.type;
      return t === type;
    });

    const subArgs = { ...args, droppableContainers: filtered };

    /* SECTION: closestCenter ทำให้ Section สูง (เช่น Span) มีศูนย์กลางต่ำ — pointer อยู่ด้านบนของมัน
       ยังถูกจับคู่เป็น Section ด้านบน (Split) ทำให้ลาก Split ลงมาด้านล่าง Span ไม่ได้ */
    if (type === "SECTION") {
      const within = pointerWithin(subArgs);
      if (within?.length) return within;
      /* pointer ต่ำกว่ากรอบ Section ทั้งหมด — ให้ over เป็น Section สุดท้าย เพื่อได้ y>mid → วางท้ายสุด */
      if (pointerCoordinates && filtered.length > 0) {
        let maxBottom = -Infinity;
        for (const dc of filtered) {
          const r = droppableRects.get(dc.id);
          if (r && r.bottom > maxBottom) maxBottom = r.bottom;
        }
        if (pointerCoordinates.y > maxBottom + 2) {
          const lastId = containerIds[containerIds.length - 1];
          const lastDc = filtered.find((dc) => String(dc.id) === String(lastId));
          if (lastDc) {
            return [
              {
                id: lastDc.id,
                data: { droppableContainer: lastDc, value: 0 },
              },
            ];
          }
        }
      }
    }

    /* ELEMENT: ใช้ pointerWithin ก่อน เพื่อให้แตะขอบบน/ล่างแล้วตอบสนองทันที
       (ไม่ต้องเล็งกลาง element แบบ closestCenter อย่างเดียว) */
    if (type === "ELEMENT") {
      const within = pointerWithin(subArgs);
      if (within?.length) return within;
    }

    /* COLUMN: ใช้ pointerWithin ก่อนเพื่อให้ลากย้ายใน section เดียวกันติดตามเมาส์
       ได้เป็นธรรมชาติมากขึ้น โดยเฉพาะคอลัมน์กว้างไม่เท่ากัน/อยู่ใกล้ขอบ */
    if (type === "COLUMN") {
      const within = pointerWithin(subArgs);
      if (within?.length) return within;
    }

    return closestCenter(subArgs);
  }

  const addClass = () => document.documentElement.classList.add("dragging");
  const removeClass = () =>
    document.documentElement.classList.remove("dragging");

  function ConfirmModal({ data, close }) {

    if(!data) return <></>;

    const { id, funct } = data;
    
    if(!id || !funct) return <></>;

    const [open, setOpen] = useState(true);

    if (!open) setTimeout(() => close(), 200);

    let elementName;

    if (typeof id === "object") {
      if (id.nestID && id.spnID) {
        elementName = "Mini Span";
      } else if (id.spnID && !id.nestID) {
        elementName = "Span";
      } else {
        elementName = "Column";
      }
    } else {
      const sec = layouts.find(l => l.container?.id === id)
      if(sec?.splitRowId){
        elementName = "Split Section";
      } else if(sec?.columns){
        elementName = "Section";
      }else{
        elementName = "Header";
      }
      
    }



    return (
      <Modal
        open={open}
        onClose={(_, reason) => {
          setOpen(false);
        }}
        aria-labelledby="basic-modal-title"
        aria-describedby="basic-modal-desc"
        slotProps={{ backdrop: { timeout: 200 } }}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
      >
        <Fade in={open} timeout={200} onExited={close}>
          <Box
            sx={{
              position: "relative",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              height: "auto",
              backgroundColor: "white",
              borderRadius: 3,
            }}
            container={document.getElementById("app-root")}
          >
            <div className="flex justify-between px-4 pt-3 pb-1">
              <div className="text-[15px] font-bold">
                <span className="text-red-600 dark:text-emerald-300">
                  Delete
                </span>{" "}
                {elementName}
              </div>
              <div>
                <a onClick={() => setOpen(false)} style={{ cursor: "pointer" }}>
                  X
                </a>
              </div>
            </div>
            <div
              className={`border-b border-dotted border-gray-500/50 flex-1`}
            ></div>
            <div className="flex justify-center mt-4 text-[13px] ">
              คุณต้องการลบ {elementName} นี้ใช่หรือไม่?
            </div>

            <div className="flex justify-center my-4 pb-5">
              <Button
                sx={{
                  backgroundColor: "#B91C1C",
                  color: "white",
                  fontSize: 13,
                  fontWeight: "normal",
                  height: 25,
                  padding: "15px 12px",
                  marginRight: 1,
                }}
                onClick={() => {
                  setOpen(false);
                  setTimeout(() => {
                    close();
                    funct(id);
                  }, 200);
                }}
              >
                ใช่... ฉันต้องการลบ
              </Button>
              <Button
                sx={{
                  backgroundColor: "#333",
                  color: "white",
                  fontSize: 13,
                  fontWeight: "normal",
                  height: 25,
                  padding: "15px 12px",
                  marginLeft: 1,
                }}
                onClick={() => setOpen(false)}
              >
                ยกเลิก
              </Button>
            </div>
          </Box>
        </Fade>
      </Modal>
    );
  }
  function AlertModal() {
    const [open, setOpen] = useState(true);

    if (!open) setTimeout(() => setAlert(false), 200);

    return (
      <Modal
        open={alert}
        onClose={(_, resson) => {
          setOpen(false)
        }}
        aria-labelledby="basic-modal-title"
        aria-describedby="basic-modal-desc"
        slotProps={{ backdrop: { timeout: 200 } }}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
      >
        <Fade in={open} timeout={200} onExited={()=>setAlert(false)}>
          <Box
            sx={{
              position: "relative",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              height: "auto",
              backgroundColor: "white",
              borderRadius: 3,
            }}
            container={document.getElementById("app-root")}
          >
            <div className="flex justify-between px-4 pt-3 pb-1">
              <div className="text-[15px] font-bold">
                <span className="text-red-600 dark:text-emerald-300">
                  คำเตือน !!!
                </span>{" "}
              </div>
              <div>
                <a
                  onClick={(e) => setOpen(false)}
                  style={{ cursor: "pointer" }}
                >
                  X
                </a>
              </div>
            </div>
            <div
              className={`border-b border-dotted border-gray-500/50 flex-1`}
            ></div>
            <div className="pl-4 mt-2 pt-1 pb-4 text-[13px]">
              คอลัมน์ประเภทนี้ ไม่สามารถปรับขนาดของคอลัมน์{" "}
              <span className="text-red-600 dark:text-emerald-300">
                "ให้แคบกว่านี้ได้"
              </span>
            </div>
          </Box>
        </Fade>
      </Modal>
    );
  }


  const sizes = {Tablet:768, Mobile: 375,Desktop: "100%"}; 

  const canvasSize = {width: sizes[device]};


  

  return (
    <main
      className="content-area flex min-h-0 flex-1 flex-col overflow-hidden"
      area="main"
    >
      {isPreview && !previewAuditMode ? (
        <style>{`
          @keyframes previewFeedIn {
            from { transform: translate3d(0, 10px, 0); }
            to { transform: translate3d(0, 0, 0); }
          }
          .preview-feed-in {
            animation: previewFeedIn 240ms cubic-bezier(0.22, 1, 0.36, 1);
            animation-fill-mode: both;
          }
        `}</style>
      ) : null}
      <div
        ref={canvasScrollRef}
        data-preview-scroll={isPreview ? "true" : undefined}
        data-preview-audit={previewAuditMode ? "true" : undefined}
        className={`content-area min-h-0 flex-1 overflow-y-auto overflow-x-hidden ${
          isPreview ? "p-0" : "p-4 sm:p-6"
        }`}
        onDrop={(e) => {
          handleDrop(e);
        }}
        onDragOver={(e) => {
          handleDuring(e);
        }}
        onDragEnterCapture={(e) => {
          e.preventDefault();

          if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
        }}
        onDragOverCapture={(e) => {
          e.preventDefault();

          if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
        }}
        onMouseMove={(e) => {
          scheduleBTNUpdate(e);
          scheduleDND(e);
        }}
        onClickCapture={(e) => {
          if (builderMode !== "Layout Mode") return;
          const target = e.target;
          const targetEl =
            target && typeof target === "object"
              ? target.nodeType === 1
                ? target
                : target.nodeType === 3
                  ? target.parentElement
                  : null
              : null;
          if (!targetEl) return;
          // Keep nested element selection until user clicks the same element again.
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          const stillInsideCanvas = checkGhostPosition(
            e.clientX,
            e.clientY,
            e.currentTarget.getBoundingClientRect()
          );
          if (stillInsideCanvas) return;
          setDrop(null, null);
          setPreview(null);
        }}
      >
        {/* Canvas สำหรับวาง element */}
        <DndContext
        onDragStart={(e) => {
          if (builderMode !== "Layout Mode") return;
          listImageColWarnedRef.current = false;
          setListImageColToastOpen(false);
          carouselColWarnedRef.current = false;
          setCarouselColToastOpen(false);
          postColWarnedRef.current = false;
          setPostColToastOpen(false);
          dataSliderTypeWarnedRef.current = false;
          setDataSliderTypeToastOpen(false);
          postInPostWarnedRef.current = false;
          setPostInPostToastOpen(false);
          addClass();
          drag(e);
          setIsDraggingLayout(true);
        }}
        onDragMove={(e) => {
          if (builderMode !== "Layout Mode") return;
          during(e);
        }}
        onDragEnd={(e) => {
          if (builderMode !== "Layout Mode") return;
          drop(e);
          clearGhost();
          setIsDraggingLayout(false);
          removeClass();
        }}
        onDragCancel={() => {
          clearGhost();
          sidebarPreviewIntentRef.current = { key: "", startedAt: 0, x: 0, y: 0 };
          activeInlineDragGroupRef.current = null;
        }}
        sensors={sensors}
        autoScroll
        measuring={measuring}
        collisionDetection={collisionByType}
      >
        <div className={`w-full flex ${isPreview ? "justify-start" : "justify-center"}`}>

        <div
          className={`content-area min-h-[600px] ${
            isPreview ? "" : "rounded-xl border border-white/10 bg-white/5"
          }`}
          style={isPreview ? { width: "100%" } : canvasSize}
        >
          <SortableContext
            items={containerIds}
            strategy={verticalListSortingStrategy}
            disabled={!isLayoutMode || disableConDrag}
          >
            {layouts.length > 0 ? (
              <>
                {layouts.map((layout, I) => {
                  // ====== SPLIT ROW ======
                  if (layout.splitRowId) {
                    if (layout.splitSide !== "left") return null;
                    const splitRowId = layout.splitRowId;
                    const splitSections = [];
                    for (let si = I; si < layouts.length && layouts[si].splitRowId === splitRowId; si++) {
                      splitSections.push({ layout: layouts[si], I: si });
                    }
                    const lastSplitI = splitSections[splitSections.length - 1].I;

                    const GhostPreviewSplit = () => {
                      if (!preview) return null;
                      if (preview._isSplitGhost) {
                        const SPLIT_MAX = 768;
                        return (
                          <div ref={ghostRef} className="preview opacity-70 flex w-full" data-drop="SECTION" id={preview.container.id}>
                            {preview.sections.map((sec, si) => {
                              const isLeft = si === 0;
                              const splitInner = sec.container.isFluid === false
                                ? { width: `min(100%, ${SPLIT_MAX}px)`, maxWidth: "none", boxSizing: "border-box", marginLeft: isLeft ? "auto" : "0px", marginRight: isLeft ? "0px" : "auto", paddingLeft: isLeft ? "0px" : "14px", paddingRight: isLeft ? "14px" : "0px" }
                                : { paddingLeft: isLeft ? "0px" : "14px", paddingRight: isLeft ? "14px" : "0px" };
                              return (
                                <div key={sec.container.id} style={{ flex: 1 }}>
                                  <ContainerPreview element={sec} id={sec.container.id} innerStyle={splitInner}>
                                    {sec.columns?.map((c) => (
                                      <ColumnPreview
                                        key={c.id}
                                        element={c}
                                        noColumnGap={Boolean(sec.container?.noColumnGap)}
                                        id={{ conID: sec.container.id, colID: c.id }}
                                        hideGhostInColBadge
                                      >
                                        {c.isSpan ? (
                                          <>
                                            {(c.spans || []).map((s) => (
                                              <SpanPreview
                                                key={s.id}
                                                elementData={s}
                                                noColumnGap={Boolean(sec.container?.noColumnGap)}
                                              />
                                            ))}
                                          </>
                                        ) : Array.isArray(c.elements) && c.elements.length > 0 ? (
                                          <div>{c.elements.map((ele) => <ElementPreview key={ele.id} element={ele} />)}</div>
                                        ) : null}
                                      </ColumnPreview>
                                    ))}
                                  </ContainerPreview>
                                </div>
                              );
                            })}
                          </div>
                        );
                      }
                      if (!preview?.container) return null;
                      const ghostNoGap = Boolean(preview?.container?.noColumnGap);
                      return (
                        <div ref={ghostRef} className="preview w-full opacity-70" data-drop="SECTION" id={preview.container.id}>
                          <ContainerPreview element={preview} id={preview.container.id}>
                            {preview?.columns?.map((c) => (
                              <ColumnPreview
                                key={c.id}
                                element={c}
                                noColumnGap={ghostNoGap}
                                id={{ conID: preview.container.id, colID: c.id }}
                              >
                                {c.isSpan ? (
                                  <>
                                    {(c.spans || []).map((s) => (
                                      <SpanPreview key={s.id} elementData={s} noColumnGap={ghostNoGap} />
                                    ))}
                                  </>
                                ) : Array.isArray(c.elements) && c.elements.length > 0 ? (
                                  <div>{c.elements.map((ele) => <ElementPreview key={ele.id} element={ele} />)}</div>
                                ) : null}
                              </ColumnPreview>
                            ))}
                          </ContainerPreview>
                        </div>
                      );
                    };

                    return (
                      <React.Fragment key={splitRowId}>
                        {preview && dropTargetRef.current.type === "SECTION" && dropTargetRef.current.index === I && <GhostPreviewSplit />}
                        <SortableSplitRowItem
                          id={splitRowId}
                          renderChildren={({ listeners: splitListeners, setActivatorNodeRef: splitActivatorRef }) => (
                          <div className="flex w-full">
                          {splitSections.map(({ layout: sec, I: secI }, splitIdx) => {
                            const { container: secCon, columns: secCols } = sec;
                            const secID = secCon.id;
                            const splitShowOption = hover === secID && !activeID && device === "Desktop" && builderMode === "Layout Mode";
                            // standard width: แต่ละ half เป็น independent container
                            // ใช้ 100% (= canvas/2) แทน 100vw เพื่อ match กับ container mx-auto ของ normal section
                            // calc(100% - 640px) = (canvas/2 - 640) = (canvas - 1280)/2 = outer margin ของ normal section
                            const isLeftHalf = splitIdx === 0;
                          
                                const NORMAL_CONTAINER_MAX = 1536;

                                const paddings = { paddingLeft: isLeftHalf  ? "0px" : "14px",
                                  paddingRight: isLeftHalf  ? "14px" : "0px",}

                                const splitInnerStyle = secCon.isFluid === false
                                  ? {
                                      width: `min(100%, ${NORMAL_CONTAINER_MAX / 2}px)`,
                                      maxWidth: "none",
                                      boxSizing: "border-box",

                                      marginLeft: isLeftHalf  ? "auto" : "0px",
                                      marginRight: isLeftHalf  ? "0px" : "auto",

                                     ...paddings
                                    }
                                  : {
                                    ...paddings 
                                  };

                            const borderT = I === 0 ? "border-t" : "border-t-0";
                            const borderR = isLeftHalf ? "border-r-0" : "border-r";
                            return (
                              <div key={secID} data-split-secid={secID} className="flex flex-col" style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                                <Container
                                  elementData={secCon}
                                  className="flex-1"
                                  innerContentStyle={splitInnerStyle}
                                  device={device}
                                    builderMode={builderMode}
                                    setRef={(el) => { contained.current[secI] = el || null; }}
                                  borderT={`${borderT} ${borderR}`}
                                  theme={theme}
                                  handleDuring={handleDuring}
                                  showOption={splitShowOption}
                                  funct={{ clone, remove }}
                                  layouts={layouts}
                                  onUpdate={updateContainer}
                                  modal={openModal}
                                  scheduleDND={scheduleDND}
                                  openOffcavanas={openOffcavanas}
                                  changePosition={changePosition}
                                  sectionDndHandle={null}
                                  onSectionDragEnable={undefined}
                                  onSectionDragDisable={undefined}
                                >
                                  <SortableContext
                                    items={secCols?.map((c) => c.id) || []}
                                    strategy={rectSortingStrategy}
                                    disabled={!isLayoutMode || disableColDrag}
                                  >
                                    {secCols && (
                                      <>
                                        {secCols.map((col, ci) => {
                                          const { id: colId, elements, isSpan, spans = [] } = col;
                                          const eleID = !isSpan ? elements.map((e) => e.id) : [];
                                          const spanID = isSpan ? spans.map((s) => s.id) : [];
                                          return (
                                            <SortableColumnItem key={colId} id={colId} containerId={secID} elementData={col}>
                                              {!isSpan ? (
                                                <SortableContext items={eleID} strategy={verticalListSortingStrategy} disabled={!isLayoutMode}>
                                                  {elements.length > 0 ? (
                                                    <>
                                                      {chunkColumnElementsForInlineRows(
                                                        elements
                                                      ).map((chunk) => {
                                                        if (chunk.kind === "btnRow" || chunk.kind === "iconRow" || chunk.kind === "counterRow" || chunk.kind === "listRow") {
                                                          return (
                                                            <div key={`${chunk.kind}-${chunk.items[0].id}`} dir="ltr" className={`mb-2 flex w-full flex-row ${isDraggingLayout ? "flex-nowrap" : "flex-wrap"} items-center ${inlineChunkRowFlexGapClass(chunk)} last:mb-0`} style={{ justifyContent: inlineRowJustifyFromChunk(chunk) }}>
                                                              {chunk.items.map((ele, localIdx) => {
                                                                const eleI = chunk.startIndex + localIdx;
                                                                return (
                                                                  <React.Fragment key={ele.id}>
                                                                    {false && preview && dropTargetRef.current.type === "ELEMENT" && !dropTargetRef.current.isLast && localIdx === 0 && dropTargetRef.current.index?.conI === secI && dropTargetRef.current.index?.colI === ci && dropTargetRef.current.index?.eleI === eleI && (
                                                                      <div ref={ghostRef} className={`opacity-70 ${ghostInsertAnimClass}`} key={`ghost-sp-inl-${ele.id}`} id={preview.id} onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDrop({ conI: secI, colI: ci, eleI }, "ELEMENT", false); }}><ElementPreview element={preview} /></div>
                                                                    )}
                                                                    <SortableElementItem id={ele.id} containerId={secID} columnId={colId} elementData={ele}>
                                                                      <Element element={ele} openOffcavanas={openOffcavanas} onUpdate={(data) => updateElement(data, { eleID: ele.id })} onDelete={() => deleteElement({ eleID: ele.id })} layouts={layouts} device={device} theme={theme} builderMode={builderMode} modal={openModal} dragRef={dragRef} ids={{ conI: secI, colI: ci, eleI }} colSize={col.size} richTextEditModal={setTextEditModal} isInDnD={isDraggingLayout} onTabElementEdit={(tabElement, tabId) => openTabsNestedElementEditor(ele.id, tabId, tabElement)} renderTabElement={(tabElement, tabElementIndex, tabId) => renderTabsNestedElement(ele.id, tabElement, tabElementIndex, tabId)} tabGhostData={getTabGhostData(ele)} onDataSliderDoubleClick={() => {
                                                                        if (builderMode !== "Layout Mode") return;
                                                                        setSelectID({ ids: {}, status: "" });
                                                                        setPositionElementSetting({ x: null, y: null });
                                                                        openOffcavanas("Data Slider", ele, (next) =>
                                                                          patchLayoutElement(next, { eleID: ele.id })
                                                                        );
                                                                      }} onListBoxEditText={(itemIndex, field) => openListBoxItemTextEdit(ele, itemIndex, field)} onListBoxEditIcon={(itemIndex) => openListBoxItemIconEdit(ele, itemIndex)} onListBoxEditImage={(itemIndex) => openListBoxItemImageEdit(ele, itemIndex)} />
                                                                    </SortableElementItem>
                                                                    {(chunk.kind === "iconRow" || chunk.kind === "counterRow") && localIdx < chunk.items.length - 1 && (
                                                                      <>
                                                                        {(() => {
                                                                          const isCounter = chunk.kind === "counterRow";
                                                                          const divider = isCounter
                                                                            ? inlineCounterRowDividerStyle(ele, theme)
                                                                            : inlineIconRowDividerStyle(ele, theme);
                                                                          const gap = isCounter
                                                                            ? inlineCounterRowGapPx(ele)
                                                                            : inlineIconRowGapPx(ele);
                                                                          return (
                                                                            <div
                                                                              style={{
                                                                                width: gap,
                                                                                alignSelf: "center",
                                                                                flexShrink: 0,
                                                                                pointerEvents: "none",
                                                                                display: "flex",
                                                                                alignItems: "center",
                                                                                justifyContent: "center",
                                                                              }}
                                                                            >
                                                                              {divider.enabled ? (
                                                                                <div
                                                                                  style={{
                                                                                    width: 1,
                                                                                    height: divider.height,
                                                                                    borderLeftWidth: 1,
                                                                                    borderLeftStyle: divider.borderLeftStyle,
                                                                                    borderLeftColor: divider.color,
                                                                                  }}
                                                                                />
                                                                              ) : null}
                                                                            </div>
                                                                          );
                                                                        })()}
                                                                      </>
                                                                    )}
                                                                  </React.Fragment>
                                                                );
                                                              })}
                                                            </div>
                                                          );
                                                        }
                                                        const singleEle = chunk.item;
                                                        const eleI = chunk.startIndex;
                                                        return (
                                                          <React.Fragment key={singleEle.id}>
                                                            {preview && !dropTargetRef.current.isLast && dropTargetRef.current.type === "ELEMENT" && dropTargetRef.current.index?.conI === secI && dropTargetRef.current.index?.colI === ci && dropTargetRef.current.index?.eleI === eleI && (
                                                              <div ref={ghostRef} className={`w-full mb-2 opacity-70 ${ghostInsertAnimClass}`} key={`ghost-sp-ele-${singleEle.id}`} id={preview.id} onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDrop({ conI: secI, colI: ci, eleI }, "ELEMENT", false); }}><ElementPreview element={preview} /></div>
                                                            )}
                                                            <SortableElementItem id={singleEle.id} containerId={secID} columnId={colId} elementData={singleEle}>
                                                              <Element element={singleEle} openOffcavanas={openOffcavanas} onUpdate={(data) => updateElement(data, { eleID: singleEle.id })} onDelete={() => deleteElement({ eleID: singleEle.id })} layouts={layouts} device={device} theme={theme} builderMode={builderMode} modal={openModal} dragRef={dragRef} ids={{ conI: secI, colI: ci, eleI }} colSize={col.size} richTextEditModal={setTextEditModal} isInDnD={isDraggingLayout} onTabElementEdit={(tabElement, tabId) => openTabsNestedElementEditor(singleEle.id, tabId, tabElement)} renderTabElement={(tabElement, tabElementIndex, tabId) => renderTabsNestedElement(singleEle.id, tabElement, tabElementIndex, tabId)} tabGhostData={getTabGhostData(singleEle)} onDataSliderDoubleClick={() => {
                                                                if (builderMode !== "Layout Mode") return;
                                                                setSelectID({ ids: {}, status: "" });
                                                                setPositionElementSetting({ x: null, y: null });
                                                                openOffcavanas("Data Slider", singleEle, (next) =>
                                                                  patchLayoutElement(next, { eleID: singleEle.id })
                                                                );
                                                              }} onListBoxEditText={(itemIndex, field) => openListBoxItemTextEdit(singleEle, itemIndex, field)} onListBoxEditIcon={(itemIndex) => openListBoxItemIconEdit(singleEle, itemIndex)} onListBoxEditImage={(itemIndex) => openListBoxItemImageEdit(singleEle, itemIndex)} />
                                                            </SortableElementItem>
                                                            {preview && dropTargetRef.current.isLast && dropTargetRef.current.type === "ELEMENT" && dropTargetRef.current.index?.conI === secI && dropTargetRef.current.index?.colI === ci && eleI === elements.length - 1 && (
                                                              <div ref={ghostRef} className={`opacity-70 ${ghostInsertAnimClass}`} key={`ghost-sp-end-${singleEle.id}`} id={preview.id} onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDrop({ conI: secI, colI: ci, eleI: eleI + 1 }, "ELEMENT", true); }}><ElementPreview element={preview} /></div>
                                                            )}
                                                          </React.Fragment>
                                                        );
                                                      })}
                                                    </>
                                                  ) : (
                                                    <>
                                                      {preview && dropTargetRef.current.index?.conI === secI && dropTargetRef.current.index?.colI === ci ? (
                                                        <div ref={ghostRef} className={`opacity-70 ${ghostInsertAnimClass}`} key="ghost-sp-empty" id={preview.id} onDragOver={handleDuring}><ElementPreview element={preview} /></div>
                                                      ) : (
                                                        <SortableElementItem id={`ele-${colId}`} containerId={secID} columnId={colId} elementData={{ type: "null", id: "__null__" }} />
                                                      )}
                                                    </>
                                                  )}
                                                </SortableContext>
                                              ) : (
                                                <SortableContext
                                                  items={spanID}
                                                  strategy={verticalListSortingStrategy}
                                                  disabled={!isLayoutMode || disableSpnDrag}
                                                >
                                                  {spans.map((s, o) => {
                                                    const eleSpn = Array.isArray(s?.elements) ? s.elements : [];
                                                    const sid = s?.id;
                                                    if (!sid) return null;
                                                    const eleSpnID = eleSpn.map((e) => e.id);
                                                    return (
                                                      <SortableSpanItem
                                                        key={sid}
                                                        id={sid}
                                                        columnId={colId}
                                                        containerId={secID}
                                                        elementData={s}
                                                      >
                                                        <SortableContext
                                                          items={eleSpnID}
                                                          strategy={verticalListSortingStrategy}
                                                          disabled={!isLayoutMode}
                                                        >
                                                          {eleSpn.length > 0 ? (
                                                            <>
                                                              {eleSpn.map((singleEle, eleI) => (
                                                                <React.Fragment key={singleEle.id}>
                                                                  {preview &&
                                                                  !dropTargetRef.current.isLast &&
                                                                  dropTargetRef.current.type === "ELEMENT" &&
                                                                  dropTargetRef.current.index?.conI === secI &&
                                                                  dropTargetRef.current.index?.colI === ci &&
                                                                  dropTargetRef.current.index?.spnI === o &&
                                                                  dropTargetRef.current.index?.eleI === eleI ? (
                                                                    <div
                                                                      ref={ghostRef}
                                                                      className={`w-full mb-2 opacity-70 ${ghostInsertAnimClass}`}
                                                                      key={`ghost-split-span-${singleEle.id}`}
                                                                      id={preview.id}
                                                                      onDragOver={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        setDrop(
                                                                          { conI: secI, colI: ci, spnI: o, eleI },
                                                                          "ELEMENT",
                                                                          false
                                                                        );
                                                                      }}
                                                                    >
                                                                      <ElementPreview element={preview} />
                                                                    </div>
                                                                  ) : null}
                                                                  <SortableElementItem
                                                                    id={singleEle.id}
                                                                    containerId={secID}
                                                                    columnId={colId}
                                                                    spanId={sid}
                                                                    elementData={singleEle}
                                                                  >
                                                                    <Element
                                                                      element={singleEle}
                                                                      openOffcavanas={openOffcavanas}
                                                                      onUpdate={(data) => updateElement(data, { eleID: singleEle.id })}
                                                                      onDelete={() => deleteElement({ eleID: singleEle.id })}
                                                                      layouts={layouts}
                                                                      device={device}
                                                                      theme={theme}
                                                                      builderMode={builderMode}
                                                                      modal={openModal}
                                                                      dragRef={dragRef}
                                                                      ids={{ conI: secI, colI: ci, spnI: o, eleI }}
                                                                      colSize={col.size}
                                                                      richTextEditModal={setTextEditModal}
                                                                      isInDnD={isDraggingLayout}
                                                                      onTabElementEdit={(tabElement, tabId) =>
                                                                        openTabsNestedElementEditor(singleEle.id, tabId, tabElement)
                                                                      }
                                                                      renderTabElement={(tabElement, tabElementIndex, tabId) =>
                                                                        renderTabsNestedElement(singleEle.id, tabElement, tabElementIndex, tabId)
                                                                      }
                                                                      tabGhostData={getTabGhostData(singleEle)}
                                                                      onDataSliderDoubleClick={() => {
                                                                        if (builderMode !== "Layout Mode") return;
                                                                        setSelectID({ ids: {}, status: "" });
                                                                        setPositionElementSetting({ x: null, y: null });
                                                                        openOffcavanas("Data Slider", singleEle, (next) =>
                                                                          patchLayoutElement(next, { eleID: singleEle.id })
                                                                        );
                                                                      }}
                                                                      onListBoxEditText={(itemIndex, field) =>
                                                                        openListBoxItemTextEdit(singleEle, itemIndex, field)
                                                                      }
                                                                      onListBoxEditIcon={(itemIndex) =>
                                                                        openListBoxItemIconEdit(singleEle, itemIndex)
                                                                      }
                                                                      onListBoxEditImage={(itemIndex) =>
                                                                        openListBoxItemImageEdit(singleEle, itemIndex)
                                                                      }
                                                                    />
                                                                  </SortableElementItem>
                                                                  {preview &&
                                                                  dropTargetRef.current.isLast &&
                                                                  dropTargetRef.current.type === "ELEMENT" &&
                                                                  dropTargetRef.current.index?.conI === secI &&
                                                                  dropTargetRef.current.index?.colI === ci &&
                                                                  dropTargetRef.current.index?.spnI === o &&
                                                                  eleI === eleSpn.length - 1 ? (
                                                                    <div
                                                                      ref={ghostRef}
                                                                      className={`opacity-70 ${ghostInsertAnimClass}`}
                                                                      key={`ghost-split-span-end-${singleEle.id}`}
                                                                      id={preview.id}
                                                                      onDragOver={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        setDrop(
                                                                          { conI: secI, colI: ci, spnI: o, eleI: eleI + 1 },
                                                                          "ELEMENT",
                                                                          true
                                                                        );
                                                                      }}
                                                                    >
                                                                      <ElementPreview element={preview} />
                                                                    </div>
                                                                  ) : null}
                                                                </React.Fragment>
                                                              ))}
                                                            </>
                                                          ) : (
                                                            <>
                                                              {preview &&
                                                              dropTargetRef.current.type === "ELEMENT" &&
                                                              dropTargetRef.current.index?.conI === secI &&
                                                              dropTargetRef.current.index?.colI === ci &&
                                                              dropTargetRef.current.index?.spnI === o ? (
                                                                <div
                                                                  ref={ghostRef}
                                                                  className={`opacity-70 ${ghostInsertAnimClass}`}
                                                                  key={`ghost-split-span-empty-${sid}`}
                                                                  id={preview.id}
                                                                  onDragOver={handleDuring}
                                                                >
                                                                  <ElementPreview element={preview} />
                                                                </div>
                                                              ) : (
                                                                <SortableElementItem
                                                                  id={`ele-${sid}`}
                                                                  containerId={secID}
                                                                  columnId={colId}
                                                                  spanId={sid}
                                                                  elementData={{ type: "null", id: "__null__" }}
                                                                />
                                                              )}
                                                            </>
                                                          )}
                                                        </SortableContext>
                                                      </SortableSpanItem>
                                                    );
                                                  })}
                                                </SortableContext>
                                              )}
                                            </SortableColumnItem>
                                          );
                                        })}
                                      </>
                                    )}
                                  </SortableContext>
                                </Container>
                              </div>
                            );
                          })}
                          </div>
                          )}
                        />
                        {preview && dropTargetRef.current.type === "SECTION" && dropTargetRef.current.isLast && lastSplitI === layouts.length - 1 && <GhostPreviewSplit />}
                      </React.Fragment>
                    );
                  }
                  // ====== END SPLIT ROW ======

                  const { container} = layout;
                  const columns = layout?.columns || null
                  const heros = layout?.heros || null
                  const { id: ID } = container;

                  return (
                    <React.Fragment key={ID}>
                      {preview &&
                        dropTargetRef.current.type === "SECTION" &&
                        dropTargetRef.current.index === I && (
                          preview._isSplitGhost ? (
                            (() => {
                              const SPLIT_MAX = 768;
                              return (
                                <div ref={ghostRef} className="preview opacity-70 flex w-full" key="ghost-split-new" data-drop="SECTION" id={preview.container.id}>
                                  {preview.sections.map((sec, si) => {
                                    const isLeft = si === 0;
                                    const splitInner = sec.container.isFluid === false
                                      ? { width: `min(100%, ${SPLIT_MAX}px)`, maxWidth: "none", boxSizing: "border-box", marginLeft: isLeft ? "auto" : "0px", marginRight: isLeft ? "0px" : "auto", paddingLeft: isLeft ? "0px" : "14px", paddingRight: isLeft ? "14px" : "0px" }
                                      : { paddingLeft: isLeft ? "0px" : "14px", paddingRight: isLeft ? "14px" : "0px" };
                                    return (
                                      <div key={sec.container.id} style={{ flex: 1 }}>
                                        <ContainerPreview element={sec} id={sec.container.id} innerStyle={splitInner}>
                                          {sec.columns?.map((c) => (
                                            <ColumnPreview
                                              key={c.id}
                                              element={c}
                                              noColumnGap={Boolean(sec.container?.noColumnGap)}
                                              id={{ conID: sec.container.id, colID: c.id }}
                                              hideGhostInColBadge
                                            >
                                              {c.isSpan ? (
                                                <>
                                                  {(c.spans || []).map((s) => (
                                                    <SpanPreview
                                                      key={s.id}
                                                      elementData={s}
                                                      noColumnGap={Boolean(sec.container?.noColumnGap)}
                                                    />
                                                  ))}
                                                </>
                                              ) : Array.isArray(c.elements) && c.elements.length > 0 ? (
                                                <div>{c.elements.map((ele) => <ElementPreview key={ele.id} element={ele} />)}</div>
                                              ) : null}
                                            </ColumnPreview>
                                          ))}
                                        </ContainerPreview>
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })()
                          ) : (
                          <div
                            ref={ghostRef}
                            className="preview opacity-70 "
                            key="ghost-end1"
                            data-drop="SECTION"
                            id={preview.container?.id}
                          >
                            <ContainerPreview
                              element={preview}
                              id={preview.container?.id}
                            >
                              {preview?.columns?.map((c, i) => (
                                <ColumnPreview
                                  key={c.id}
                                  element={c}
                                  noColumnGap={Boolean(preview?.container?.noColumnGap)}
                                  id={{ conID: preview.container?.id, colID: c.id }}
                                >
                                  {c.isSpan ? (
                                    <>
                                      {c.spans.map((s) => (
                                        <SpanPreview key={s.id} elementData={s} noColumnGap={Boolean(preview?.container?.noColumnGap)} />
                                      ))}
                                    </>
                                  ) : Array.isArray(c.elements) && c.elements.length > 0 ? (
                                    <div>{c.elements.map((ele) => <ElementPreview key={ele.id} element={ele} />)}</div>
                                  ) : null}
                                </ColumnPreview>
                              ))}
                            </ContainerPreview>
                          </div>
                          )
                        )}

                      <SortableContainerItem
                        key={ID}
                        isColumn={columns}
                        elementData={container}
                        heros={heros}
                        id={ID}
                      >

                        
                        <SortableContext
                          items={columns?.map((c) => c.id)  || ["header"]}
                          strategy={rectSortingStrategy}
                          disabled={!isLayoutMode || disableColDrag}
                        >
                          {columns && (
                            <>
                                {columns.map((col, i) => {
                            const { id, elements, isSpan, spans } = col;
                            let eleID;
                            if (!isSpan) {
                              eleID = elements.map((e) => e.id) ?? ["ele-null"];
                            }
                            const spanID = spans?.map((e) => e.id) ?? [
                              "span-null",
                            ];
                            return (
                              <SortableColumnItem
                                key={id}
                                id={id}
                                containerId={ID}
                                elementData={col}
                              >
                                {isSpan ? (
                                  <SortableContext
                                    items={spanID}
                                    strategy={verticalListSortingStrategy}
                                    disabled={!isLayoutMode || disableSpnDrag}
                                  >
                                    {spans.map((s, o) => {
                                      const {
                                        elements: eleSpn,
                                        id: sid,
                                      } = s;
                                      const eleSpnID = eleSpn.map(
                                        (e) => e.id
                                      ) || ["ele-spn-null"];
                                      return (
                                        <SortableSpanItem
                                          key={sid}
                                          id={sid}
                                          columnId={id}
                                          containerId={ID}
                                          elementData={s}
                                        >
                                          <SortableContext
                                            items={eleSpnID}
                                            strategy={
                                              verticalListSortingStrategy
                                            }
                                            disabled={!isLayoutMode}
                                          >
                                              {eleSpn.length > 0 ? (
                                                <>
                                                  {preview &&
                                                    !dropTargetRef.current
                                                      .isLast &&
                                                    dropTargetRef.current
                                                      .type === "ELEMENT" &&
                                                    dropTargetRef.current.index
                                                      ?.conI === I &&
                                                    dropTargetRef.current.index
                                                      ?.colI === i &&
                                                    dropTargetRef.current.index
                                                      ?.spnI === o &&
                                                    dropTargetRef.current.index
                                                      ?.eleI === 0 && (
                                                      <div
                                                        ref={ghostRef}
                                                        className="w-full mb-2 opacity-70"
                                                        key="ghost-ele-start-spn"
                                                        id={preview.id}
                                                        onDragOver={(e) => {
                                                          e.preventDefault();
                                                          e.stopPropagation();
                                                          setDrop(
                                                            {
                                                              conI: I,
                                                              colI: i,
                                                              spnI: o,
                                                              eleI: 0,
                                                            },
                                                            "ELEMENT",
                                                            false
                                                          );
                                                        }}
                                                      >
                                                        <ElementPreview
                                                          element={preview}
                                                        ></ElementPreview>
                                                      </div>
                                                    )}
                                                  {chunkColumnElementsForInlineRows(
                                                    eleSpn
                                                  ).map((chunk) =>
                                                    chunk.kind === "btnRow" ||
                                                    chunk.kind === "iconRow" ||
                                                    chunk.kind === "counterRow" ||
                                                    chunk.kind === "listRow" ? (
                                                      <div
                                                        key={`${chunk.kind}-${chunk.items[0].id}`}
                                                        dir="ltr"
                                                        className={`mb-2 flex w-full flex-row ${isDraggingLayout ? "flex-nowrap" : "flex-wrap"} items-center ${inlineChunkRowFlexGapClass(chunk)} last:mb-0`}
                                                        onDragOver={(e) => {
                                                          if (
                                                            chunk.kind ===
                                                            "listRow"
                                                          ) {
                                                            const rowRect =
                                                              e.currentTarget.getBoundingClientRect();
                                                            if (
                                                              chunk.startIndex ===
                                                                0 &&
                                                              e.clientY <=
                                                                rowRect.top +
                                                                  18
                                                            ) {
                                                              e.preventDefault();
                                                              e.stopPropagation();
                                                              setDrop(
                                                                {
                                                                  conI: I,
                                                                  colI: i,
                                                                  spnI: o,
                                                                  eleI: 0,
                                                                },
                                                                "ELEMENT",
                                                                false
                                                              );
                                                              return;
                                                            }
                                                            handleDuring(e);
                                                          }
                                                        }}
                                                        style={{
                                                          justifyContent:
                                                            inlineRowJustifyFromChunk(
                                                              chunk
                                                            ),
                                                        }}
                                                      >
                                                        {chunk.items.map(
                                                          (e, localIdx) => {
                                                            const _ =
                                                              chunk.startIndex +
                                                              localIdx;
                                                            return (
                                                              <React.Fragment
                                                                key={e.id}
                                                              >
                                                                {preview &&
                                                                  !dropTargetRef
                                                                    .current
                                                                    .isLast &&
                                                                  dropTargetRef
                                                                    .current
                                                                    .type ===
                                                                    "ELEMENT" &&
                                                                  dropTargetRef
                                                                    .current
                                                                    .index
                                                                    ?.conI ===
                                                                    I &&
                                                                  dropTargetRef
                                                                    .current
                                                                    .index
                                                                    ?.colI ===
                                                                    i &&
                                                                  dropTargetRef
                                                                    .current
                                                                    .index
                                                                    ?.spnI ===
                                                                    o &&
                                                                  dropTargetRef
                                                                    .current
                                                                    .index
                                                                    ?.eleI ===
                                                                    _ &&
                                                                  false && _ > 0 && (
                                                                    <div
                                                                      ref={
                                                                        ghostRef
                                                                      }
                                                                      className="w-full opacity-70"
                                                                      key={`ghost-ele-spn-inline-${e.id}-${_}`}
                                                                      id={
                                                                        preview.id
                                                                      }
                                                                      onDragOver={(
                                                                        e
                                                                      ) => {
                                                                        handleDuring(
                                                                          e
                                                                        );
                                                                      }}
                                                                    >
                                                                      <ElementPreview
                                                                        element={
                                                                          preview
                                                                        }
                                                                      ></ElementPreview>
                                                                    </div>
                                                                  )}

                                                                <SortableElementItem
                                                                  id={`${e.id}`}
                                                                  containerId={
                                                                    ID
                                                                  }
                                                                  columnId={id}
                                                                  spanId={sid}
                                                                  elementData={
                                                                    e
                                                                  }
                                                                  listInlineDividerAfter={
                                                                    chunk.kind ===
                                                                      "listRow" &&
                                                                    localIdx <
                                                                      chunk.items
                                                                        .length -
                                                                        1 &&
                                                                    e.listIconsElement ===
                                                                      true
                                                                  }
                                                                  listInlineRowTrailingClassName={inlineListRowItemTrailingClassName(
                                                                    chunk,
                                                                    localIdx
                                                                  )}
                                                                ></SortableElementItem>
                                                                {(chunk.kind === "iconRow" || chunk.kind === "counterRow") &&
                                                                  localIdx <
                                                                    chunk.items.length - 1 && (
                                                                    <>
                                                                      {(() => {
                                                                        const isCounter =
                                                                          chunk.kind ===
                                                                          "counterRow";
                                                                        const divider = isCounter
                                                                          ? inlineCounterRowDividerStyle(
                                                                              e,
                                                                              theme
                                                                            )
                                                                          : inlineIconRowDividerStyle(
                                                                              e,
                                                                              theme
                                                                            );
                                                                        const gap = isCounter
                                                                          ? inlineCounterRowGapPx(
                                                                              e
                                                                            )
                                                                          : inlineIconRowGapPx(
                                                                              e
                                                                            );
                                                                        return (
                                                                          <div
                                                                            style={{
                                                                              width: gap,
                                                                              alignSelf:
                                                                                "center",
                                                                              flexShrink: 0,
                                                                              pointerEvents:
                                                                                "none",
                                                                              display: "flex",
                                                                              alignItems:
                                                                                "center",
                                                                              justifyContent:
                                                                                "center",
                                                                            }}
                                                                          >
                                                                            {divider.enabled ? (
                                                                              <div
                                                                                style={{
                                                                                  width: 1,
                                                                                  height:
                                                                                    divider.height,
                                                                                  borderLeftWidth: 1,
                                                                                  borderLeftStyle:
                                                                                    divider.borderLeftStyle,
                                                                                  borderLeftColor:
                                                                                    divider.color,
                                                                                }}
                                                                              />
                                                                            ) : null}
                                                                          </div>
                                                                        );
                                                                      })()}
                                                                    </>
                                                                  )}

                                                                {preview &&
                                                                  dropTargetRef
                                                                    .current
                                                                    .isLast &&
                                                                  dropTargetRef
                                                                    .current
                                                                    .type ===
                                                                    "ELEMENT" &&
                                                                  dropTargetRef
                                                                    .current
                                                                    .index
                                                                    ?.conI ===
                                                                    I &&
                                                                  dropTargetRef
                                                                    .current
                                                                    .index
                                                                    ?.colI ===
                                                                    i &&
                                                                  dropTargetRef
                                                                    .current
                                                                    .index
                                                                    ?.spnI ===
                                                                    o &&
                                                                  false && _ ===
                                                                    eleSpn.length -
                                                                      1 && (
                                                                    <div
                                                                      ref={
                                                                        ghostRef
                                                                      }
                                                                      className="w-full opacity-70"
                                                                      key={`ghost-ele-spn-inline-end-${e.id}-${_}`}
                                                                      id={
                                                                        preview.id
                                                                      }
                                                                      onDragOver={(
                                                                        e
                                                                      ) => {
                                                                        handleDuring(
                                                                          e
                                                                        );
                                                                      }}
                                                                    >
                                                                      <ElementPreview
                                                                        element={
                                                                          preview
                                                                        }
                                                                      ></ElementPreview>
                                                                    </div>
                                                                  )}
                                                              </React.Fragment>
                                                            );
                                                          }
                                                        )}
                                                      </div>
                                                    ) : (
                                                      <React.Fragment
                                                        key={chunk.item.id}
                                                      >
                                                        {preview &&
                                                          !dropTargetRef.current
                                                            .isLast &&
                                                          dropTargetRef.current
                                                            .type ===
                                                            "ELEMENT" &&
                                                          dropTargetRef.current
                                                            .index?.conI ===
                                                            I &&
                                                          dropTargetRef.current
                                                            .index?.colI ===
                                                            i &&
                                                          dropTargetRef.current
                                                            .index?.spnI ===
                                                            o &&
                                                          dropTargetRef.current
                                                            .index?.eleI ===
                                                            chunk.startIndex &&
                                                          chunk.startIndex > 0 && (
                                                            <div
                                                              ref={ghostRef}
                                                              className="w-full opacity-70"
                                                              key={`ghost-ele-spn-single-${chunk.item.id}-${chunk.startIndex}`}
                                                              id={preview.id}
                                                              onDragOver={(
                                                                e
                                                              ) => {
                                                                handleDuring(e);
                                                              }}
                                                            >
                                                              <ElementPreview
                                                                element={
                                                                  preview
                                                                }
                                                              ></ElementPreview>
                                                            </div>
                                                          )}

                                                        <SortableElementItem
                                                          id={`${chunk.item.id}`}
                                                          containerId={ID}
                                                          columnId={id}
                                                          spanId={sid}
                                                          elementData={
                                                            chunk.item
                                                          }
                                                        ></SortableElementItem>

                                                        {preview &&
                                                          dropTargetRef.current
                                                            .isLast &&
                                                          dropTargetRef.current
                                                            .type ===
                                                            "ELEMENT" &&
                                                          dropTargetRef.current
                                                            .index?.conI ===
                                                            I &&
                                                          dropTargetRef.current
                                                            .index?.colI ===
                                                            i &&
                                                          dropTargetRef.current
                                                            .index?.spnI ===
                                                            o &&
                                                          chunk.startIndex ===
                                                            eleSpn.length -
                                                              1 && (
                                                            <div
                                                              ref={ghostRef}
                                                              className="w-full opacity-70"
                                                              key={`ghost-ele-spn-single-end-${chunk.item.id}-${chunk.startIndex}`}
                                                              id={preview.id}
                                                              onDragOver={(
                                                                e
                                                              ) => {
                                                                handleDuring(e);
                                                              }}
                                                            >
                                                              <ElementPreview
                                                                element={
                                                                  preview
                                                                }
                                                              ></ElementPreview>
                                                            </div>
                                                          )}
                                                      </React.Fragment>
                                                    )
                                                  )}
                                                </>
                                              ) : (
                                                <React.Fragment>
                                                  {preview &&
                                                  !dropTargetRef.current
                                                    .isLast &&
                                                  dropTargetRef.current.type ===
                                                    "ELEMENT" &&
                                                  dropTargetRef.current.index
                                                    ?.conI === I &&
                                                  dropTargetRef.current.index
                                                    ?.colI === i &&
                                                  dropTargetRef.current.index
                                                    ?.spnI === o ? (
                                                    <div
                                                      ref={ghostRef}
                                                      className="w-full opacity-70"
                                                      key={`ghost-ele-spn-empty-${sid}`}
                                                      id={preview.id}
                                                      onDragOver={(e) => {
                                                        handleDuring(e);
                                                      }}
                                                    >
                                                      <ElementPreview
                                                        element={preview}
                                                      ></ElementPreview>
                                                    </div>
                                                  ) : (
                                                    <SortableElementItem
                                                      key={`ele-${sid}`}
                                                      id={`ele-${sid}`}
                                                      containerId={ID}
                                                      columnId={id}
                                                      spanId={sid}
                                                      elementData={{
                                                        type: "null",
                                                        id: "__null__",
                                                      }}
                                                    />
                                                  )}
                                                </React.Fragment>
                                              )}
                                            </SortableContext>
                                        </SortableSpanItem>
                                      );
                                    })}
                                  </SortableContext>
                                ) : (
                                  <SortableContext
                                    items={eleID}
                                    strategy={verticalListSortingStrategy}
                                    disabled={!isLayoutMode}
                                  >
                                    {elements.length > 0 ? (
                                      <>
                                        <div>
                                          {preview &&
                                            !dropTargetRef.current.isLast &&
                                            dropTargetRef.current.type ===
                                              "ELEMENT" &&
                                            dropTargetRef.current.index
                                              ?.conI === I &&
                                            dropTargetRef.current.index
                                              ?.colI === i &&
                                            dropTargetRef.current.index
                                              ?.eleI === 0 && (
                                              <div
                                                ref={ghostRef}
                                                className="w-full mb-2 opacity-70"
                                                key="ghost-ele-start-col"
                                                id={preview.id}
                                                onDragOver={(e) => {
                                                  e.preventDefault();
                                                  e.stopPropagation();
                                                  setDrop(
                                                    {
                                                      conI: I,
                                                      colI: i,
                                                      eleI: 0,
                                                    },
                                                    "ELEMENT",
                                                    false
                                                  );
                                                }}
                                              >
                                                <ElementPreview
                                                  element={preview}
                                                ></ElementPreview>
                                              </div>
                                            )}
                                          {chunkColumnElementsForInlineRows(
                                            elements
                                          ).map((chunk) =>
                                            chunk.kind === "btnRow" ||
                                            chunk.kind === "iconRow" ||
                                            chunk.kind === "counterRow" ||
                                            chunk.kind === "listRow" ? (
                                              <div
                                                key={`${chunk.kind}-${chunk.items[0].id}`}
                                                dir="ltr"
                                                className={`mb-2 flex w-full flex-row ${isDraggingLayout ? "flex-nowrap" : "flex-wrap"} items-center ${inlineChunkRowFlexGapClass(chunk)} last:mb-0`}
                                                onDragOver={(e) => {
                                                  if (
                                                    chunk.kind === "listRow"
                                                  ) {
                                                    const rowRect =
                                                      e.currentTarget.getBoundingClientRect();
                                                    if (
                                                      chunk.startIndex === 0 &&
                                                      e.clientY <=
                                                        rowRect.top + 18
                                                    ) {
                                                      e.preventDefault();
                                                      e.stopPropagation();
                                                      setDrop(
                                                        {
                                                          conI: I,
                                                          colI: i,
                                                          eleI: 0,
                                                        },
                                                        "ELEMENT",
                                                        false
                                                      );
                                                      return;
                                                    }
                                                    handleDuring(e);
                                                  }
                                                }}
                                                style={{
                                                  justifyContent:
                                                    inlineRowJustifyFromChunk(
                                                      chunk
                                                    ),
                                                }}
                                              >
                                                {chunk.items.map(
                                                  (ele, localIdx) => {
                                                    const o =
                                                      chunk.startIndex +
                                                      localIdx;
                                                    return (
                                                      <React.Fragment
                                                        key={ele.id}
                                                      >
                                                        {preview &&
                                                          dropTargetRef.current
                                                            .type ===
                                                            "ELEMENT" &&
                                                          localIdx === 0 &&
                                                          dropTargetRef.current
                                                            .index?.conI ===
                                                            I &&
                                                          dropTargetRef.current
                                                            .index?.colI ===
                                                            i &&
                                                          dropTargetRef.current
                                                            .index?.eleI ===
                                                            o &&
                                                          false && o > 0 &&
                                                          !dropTargetRef.current
                                                            .isLast && (
                                                            <>
                                                              <div
                                                                ref={ghostRef}
                                                                className="w-full opacity-70"
                                                                key={`ghost-ele-col-inline-${e.id}-${_}`}
                                                                id={
                                                                  preview.id
                                                                }
                                                                onDragOver={(
                                                                  e
                                                                ) => {
                                                                  handleDuring(
                                                                    e
                                                                  );
                                                                }}
                                                              >
                                                                <ElementPreview
                                                                  element={
                                                                    preview
                                                                  }
                                                                ></ElementPreview>
                                                              </div>
                                                            </>
                                                          )}

                                                        <SortableElementItem
                                                          id={ele.id}
                                                          containerId={ID}
                                                          columnId={id}
                                                          elementData={ele}
                                                          listInlineDividerAfter={
                                                            chunk.kind ===
                                                              "listRow" &&
                                                            localIdx <
                                                              chunk.items.length -
                                                                1 &&
                                                            ele.listIconsElement ===
                                                              true
                                                          }
                                                          listInlineRowTrailingClassName={inlineListRowItemTrailingClassName(
                                                            chunk,
                                                            localIdx
                                                          )}
                                                        ></SortableElementItem>
                                                        {(chunk.kind === "iconRow" || chunk.kind === "counterRow") &&
                                                          localIdx <
                                                            chunk.items.length - 1 && (
                                                            <>
                                                              {(() => {
                                                                const isCounter =
                                                                  chunk.kind ===
                                                                  "counterRow";
                                                                const divider = isCounter
                                                                  ? inlineCounterRowDividerStyle(
                                                                      ele,
                                                                      theme
                                                                    )
                                                                  : inlineIconRowDividerStyle(
                                                                      ele,
                                                                      theme
                                                                    );
                                                                const gap = isCounter
                                                                  ? inlineCounterRowGapPx(
                                                                      ele
                                                                    )
                                                                  : inlineIconRowGapPx(
                                                                      ele
                                                                    );
                                                                return (
                                                                  <div
                                                                    style={{
                                                                      width: gap,
                                                                      alignSelf:
                                                                        "center",
                                                                      flexShrink: 0,
                                                                      pointerEvents:
                                                                        "none",
                                                                      display: "flex",
                                                                      alignItems:
                                                                        "center",
                                                                      justifyContent:
                                                                        "center",
                                                                    }}
                                                                  >
                                                                    {divider.enabled ? (
                                                                      <div
                                                                        style={{
                                                                          width: 1,
                                                                          height:
                                                                            divider.height,
                                                                          borderLeftWidth: 1,
                                                                          borderLeftStyle:
                                                                            divider.borderLeftStyle,
                                                                          borderLeftColor:
                                                                            divider.color,
                                                                        }}
                                                                      />
                                                                    ) : null}
                                                                  </div>
                                                                );
                                                              })()}
                                                            </>
                                                          )}

                                                        {preview &&
                                                          dropTargetRef.current
                                                            .type ===
                                                            "ELEMENT" &&
                                                          dropTargetRef.current
                                                            .index?.conI ===
                                                            I &&
                                                          dropTargetRef.current
                                                            .index?.colI ===
                                                            i &&
                                                          false && o ===
                                                            elements.length -
                                                              1 &&
                                                          dropTargetRef.current
                                                            .isLast && (
                                                            <>
                                                              <div
                                                                ref={ghostRef}
                                                                className="w-full opacity-70"
                                                                key={`ghost-ele-col-inline-end-${e.id}-${_}`}
                                                                id={
                                                                  preview.id
                                                                }
                                                                onDragOver={(
                                                                  e
                                                                ) => {
                                                                  handleDuring(
                                                                    e
                                                                  );
                                                                }}
                                                              >
                                                                <ElementPreview
                                                                  element={
                                                                    preview
                                                                  }
                                                                ></ElementPreview>
                                                              </div>
                                                            </>
                                                          )}
                                                      </React.Fragment>
                                                    );
                                                  }
                                                )}
                                              </div>
                                            ) : (
                                              <React.Fragment
                                                key={chunk.item.id}
                                              >
                                                {preview &&
                                                  dropTargetRef.current
                                                    .type === "ELEMENT" &&
                                                  dropTargetRef.current.index
                                                    ?.conI === I &&
                                                  dropTargetRef.current.index
                                                    ?.colI === i &&
                                                  dropTargetRef.current.index
                                                    ?.eleI ===
                                                    chunk.startIndex &&
                                                  chunk.startIndex > 0 &&
                                                  !dropTargetRef.current
                                                    .isLast && (
                                                    <>
                                                      <div
                                                        ref={ghostRef}
                                                        className="w-full opacity-70"
                                                        key={`ghost-ele-col-single-${chunk.item.id}-${chunk.startIndex}`}
                                                        id={preview.id}
                                                        onDragOver={(e) => {
                                                          handleDuring(e);
                                                        }}
                                                      >
                                                        <ElementPreview
                                                          element={preview}
                                                        ></ElementPreview>
                                                      </div>
                                                    </>
                                                  )}

                                                <SortableElementItem
                                                  id={chunk.item.id}
                                                  containerId={ID}
                                                  columnId={id}
                                                  elementData={chunk.item}
                                                ></SortableElementItem>

                                                {preview &&
                                                  dropTargetRef.current
                                                    .type === "ELEMENT" &&
                                                  dropTargetRef.current.index
                                                    ?.conI === I &&
                                                  dropTargetRef.current.index
                                                    ?.colI === i &&
                                                  chunk.startIndex ===
                                                    elements.length - 1 &&
                                                  dropTargetRef.current
                                                    .isLast && (
                                                    <>
                                                      <div
                                                        ref={ghostRef}
                                                        className="w-full opacity-70"
                                                        key={`ghost-ele-col-single-end-${chunk.item.id}-${chunk.startIndex}`}
                                                        id={preview.id}
                                                        onDragOver={(e) => {
                                                          handleDuring(e);
                                                        }}
                                                      >
                                                        <ElementPreview
                                                          element={preview}
                                                        ></ElementPreview>
                                                      </div>
                                                    </>
                                                  )}
                                              </React.Fragment>
                                            )
                                          )}
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        {preview &&
                                        dropTargetRef.current.index?.conI ===
                                          I &&
                                        dropTargetRef.current.index?.colI ===
                                          i ? (
                                          <>
                                            <div
                                              ref={ghostRef}
                                              className="w-full opacity-70"
                                              key="ghost-ele-end-1"
                                              id={preview.id}
                                              onDragOver={(e) => {
                                                handleDuring(e);
                                              }}
                                            >
                                              <ElementPreview
                                                element={preview}
                                              ></ElementPreview>
                                            </div>
                                          </>
                                        ) : (
                                          <>
                                            <SortableElementItem
                                              key={`ele-${id}`}
                                              id={`ele-${id}`}
                                              containerId={ID}
                                              columnId={id}
                                              elementData={{
                                                type: "null",
                                                id: "__null__",
                                              }}
                                            />
                                          </>
                                        )}
                                      </>
                                    )}
                                  </SortableContext>
                                )}
                              </SortableColumnItem>
                            );
                          })}
                            </>
                          )}
                          {heros && heros.map(hero=>{
                            return (
                              <SwiperSlide key={hero}>
                                {hero}
                              </SwiperSlide>

                            )
                          })}
                        </SortableContext>


                      </SortableContainerItem>

                      {preview &&
                        dropTargetRef.current.type === "SECTION" &&
                        dropTargetRef.current.isLast &&
                        I === layouts.length - 1 && (
                          preview._isSplitGhost ? (
                            (() => {
                              const SPLIT_MAX = 768;
                              return (
                                <div ref={ghostRef} className="preview opacity-70 flex w-full" key="ghost-end-split" data-drop="SECTION" id={preview.container.id}>
                                  {preview.sections.map((sec, si) => {
                                    const isLeft = si === 0;
                                    const splitInner = sec.container.isFluid === false
                                      ? { width: `min(100%, ${SPLIT_MAX}px)`, maxWidth: "none", boxSizing: "border-box", marginLeft: isLeft ? "auto" : "0px", marginRight: isLeft ? "0px" : "auto", paddingLeft: isLeft ? "0px" : "14px", paddingRight: isLeft ? "14px" : "0px" }
                                      : { paddingLeft: isLeft ? "0px" : "14px", paddingRight: isLeft ? "14px" : "0px" };
                                    return (
                                      <div key={sec.container.id} style={{ flex: 1 }}>
                                        <ContainerPreview element={sec} id={sec.container.id} innerStyle={splitInner}>
                                          {sec.columns?.map((c) => (
                                            <ColumnPreview
                                              key={c.id}
                                              element={c}
                                              noColumnGap={Boolean(sec.container?.noColumnGap)}
                                              id={{ conID: sec.container.id, colID: c.id }}
                                              hideGhostInColBadge
                                            >
                                              {c.isSpan ? null : Array.isArray(c.elements) && c.elements.length > 0 ? (
                                                <div>{c.elements.map((ele) => <ElementPreview key={ele.id} element={ele} />)}</div>
                                              ) : null}
                                            </ColumnPreview>
                                          ))}
                                        </ContainerPreview>
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })()
                          ) : (
                          <div
                            ref={ghostRef}
                            className="preview opacity-70 "
                            key="ghost-end1"
                            data-drop="SECTION"
                            id={preview.container?.id}
                          >
                            <ContainerPreview element={preview} id={preview.container?.id}>
                              {preview?.columns?.map((c, i) => (
                                <ColumnPreview
                                  key={c.id}
                                  element={c}
                                  noColumnGap={Boolean(preview?.container?.noColumnGap)}
                                  id={{ conID: preview.container?.id, colID: c.id }}
                                >
                                  {c.isSpan ? (
                                    <>{c.spans.map((s) => (
                                      <SpanPreview key={s.id} elementData={s} noColumnGap={Boolean(preview?.container?.noColumnGap)} />
                                    ))}</>
                                  ) : Array.isArray(c.elements) && c.elements.length > 0 ? (
                                    <div>{c.elements.map((ele) => <ElementPreview key={ele.id} element={ele} />)}</div>
                                  ) : null}
                                </ColumnPreview>
                              ))}
                            </ContainerPreview>
                          </div>
                          )
                        )}
                    </React.Fragment>
                  );
                })}
              </>
            ) : (
              <>
                {preview && (
                  preview._isSplitGhost ? (
                    (() => {
                      const SPLIT_MAX = 768;
                      return (
                        <div ref={ghostRef} className="preview opacity-70 flex w-full" key="ghost-empty-split" data-drop="SECTION" id={preview.container.id}>
                          {preview.sections.map((sec, si) => {
                            const isLeft = si === 0;
                            const splitInner = sec.container.isFluid === false
                              ? { width: `min(100%, ${SPLIT_MAX}px)`, maxWidth: "none", boxSizing: "border-box", marginLeft: isLeft ? "auto" : "0px", marginRight: isLeft ? "0px" : "auto", paddingLeft: isLeft ? "0px" : "14px", paddingRight: isLeft ? "14px" : "0px" }
                              : { paddingLeft: isLeft ? "0px" : "14px", paddingRight: isLeft ? "14px" : "0px" };
                            return (
                              <div key={sec.container.id} style={{ flex: 1 }}>
                                <ContainerPreview element={sec} id={sec.container.id} innerStyle={splitInner}>
                                  {sec.columns?.map((c) => (
                                    <ColumnPreview
                                      key={c.id}
                                      element={c}
                                      noColumnGap={Boolean(sec.container?.noColumnGap)}
                                      id={{ conID: sec.container.id, colID: c.id }}
                                      hideGhostInColBadge
                                    >
                                      {c.isSpan ? null : Array.isArray(c.elements) && c.elements.length > 0 ? (
                                        <div>{c.elements.map((ele) => <ElementPreview key={ele.id} element={ele} />)}</div>
                                      ) : null}
                                    </ColumnPreview>
                                  ))}
                                </ContainerPreview>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()
                  ) : (
                  <div
                    ref={ghostRef}
                    className="preview opacity-70 "
                    key="ghost-end1"
                    data-drop="SECTION"
                    id={preview.container?.id}
                  >
                    <ContainerPreview element={preview} id={preview.container?.id}>
                      {preview?.columns?.map((c, i) => (
                        <ColumnPreview
                          key={c.id}
                          element={c}
                          noColumnGap={Boolean(preview?.container?.noColumnGap)}
                          id={{ conID: preview.container?.id, colID: c.id }}
                        >
                          {c.isSpan ? (
                            <>{c.spans.map((s) => (
                              <SpanPreview key={s.id} elementData={s} noColumnGap={Boolean(preview?.container?.noColumnGap)} />
                            ))}</>
                          ) : Array.isArray(c.elements) && c.elements.length > 0 ? (
                            <div>{c.elements.map((ele) => <ElementPreview key={ele.id} element={ele} />)}</div>
                          ) : null}
                        </ColumnPreview>
                      ))}
                    </ContainerPreview>
                  </div>
                  )
                )}
              </>
            )}
          </SortableContext>
          <DragOverlay
           dropAnimation={null}
           adjustScale={false}
           style={{ pointerEvents: "none" }}
          modifiers={activeID?.eleID ? [] : [snapCenterToCursor]}
          >
            {activeID &&
              activeItem &&
              (typeof activeID === "string" ? (
                activeItem?._isSplitGhost ? (
                  <div className="flex w-full">
                    {activeItem.splitLayouts.map((lay, splitIdx) => {
                      const isLeftHalf = splitIdx === 0;
                      const SPLIT_MAX = 768; // 1536 / 2
                      const splitInnerStyleForGhost = lay.container.isFluid === false
                        ? {
                            width: `min(100%, ${SPLIT_MAX}px)`,
                            maxWidth: "none",
                            boxSizing: "border-box",
                            marginLeft: isLeftHalf ? "auto" : "0px",
                            marginRight: isLeftHalf ? "0px" : "auto",
                            paddingLeft: isLeftHalf ? "0px" : "14px",
                            paddingRight: isLeftHalf ? "14px" : "0px",
                          }
                        : {
                            paddingLeft: isLeftHalf ? "0px" : "14px",
                            paddingRight: isLeftHalf ? "14px" : "0px",
                          };
                      return (
                      <div key={lay.container.id} style={{ flex: 1 }}>
                        <ContainerPreview element={lay} id={lay.container.id} innerStyle={splitInnerStyleForGhost}>
                          {lay.columns?.map((c) => (
                            <ColumnPreview
                              key={c.id}
                              element={c}
                              noColumnGap={Boolean(lay.container?.noColumnGap)}
                              id={{ conID: lay.container.id, colID: c.id }}
                              hideGhostInColBadge
                            >
                              {c.isSpan ? (
                                <>
                                  {c.spans.map((s) => (
                                    <SpanPreview elementData={s} key={s.id} noColumnGap={Boolean(lay.container?.noColumnGap)}>
                                      {s.elements?.length ? (
                                        <>{s.elements.map((ele) => <ElementPreview element={ele} key={ele.id} />)}</>
                                      ) : null}
                                    </SpanPreview>
                                  ))}
                                </>
                              ) : (
                                <>
                                  {Array.isArray(c.elements) && c.elements.length > 0 ? (
                                    <div>{c.elements.map((ele) => <ElementPreview element={ele} key={ele.id} />)}</div>
                                  ) : null}
                                </>
                              )}
                            </ColumnPreview>
                          ))}
                        </ContainerPreview>
                      </div>
                      );
                    })}
                  </div>
                ) : (
                  <ContainerPreview element={activeItem} id={activeID}>
                    {activeItem?.columns?.map((c) => (
                      <ColumnPreview
                        key={c.id}
                        element={c}
                        noColumnGap={Boolean(activeItem?.container?.noColumnGap)}
                        id={{ conID: activeID, colID: c.id }}
                      >
                        {c.isSpan ? (
                          <>
                            {c.spans.map((s) => (
                              <SpanPreview elementData={s} key={s.id} noColumnGap={Boolean(activeItem?.container?.noColumnGap)}>
                                {s.elements?.length ? (
                                  <>{s.elements.map((ele) => <ElementPreview element={ele} key={ele.id} />)}</>
                                ) : null}
                              </SpanPreview>
                            ))}
                          </>
                        ) : (
                          <>
                            {Array.isArray(c.elements) && c.elements.length > 0 ? (
                              <div>{c.elements.map((ele) => <ElementPreview element={ele} key={ele.id} />)}</div>
                            ) : null}
                          </>
                        )}
                      </ColumnPreview>
                    ))}
                  </ContainerPreview>
                )
              ) : typeof activeID === "object" && !activeID.eleID && !activeID.spnID ? (
                (() => {
                  const currentCol = activeItem;
                  if (!currentCol) return null;
                  const conID = activeID?.conID;
                  const secI = layouts.findIndex((l) => l?.container?.id === conID);
                  const noColumnGapGhost = Boolean(layouts?.[secI]?.container?.noColumnGap);
                  return (
                    <div>
                      <ColumnPreview
                        element={currentCol}
                        id={activeID}
                        noColumnGap={noColumnGapGhost}
                      >
                        {currentCol.isSpan ? (
                          <>
                            {currentCol.spans.map((s) => (
                              <SpanPreview elementData={s} key={s.id} noColumnGap={noColumnGapGhost}>
                                {s.elements?.length > 0 ? (
                                  <>{s.elements.map((ele) => <ElementPreview element={ele} key={ele.id} />)}</>
                                ) : null}
                              </SpanPreview>
                            ))}
                          </>
                        ) : (
                          <>
                            {Array.isArray(currentCol.elements) && currentCol.elements.length > 0 ? (
                              <div>{currentCol.elements.map((ele) => <ElementPreview element={ele} key={ele.id} />)}</div>
                            ) : null}
                          </>
                        )}
                      </ColumnPreview>
                    </div>
                  );
                })()
              ) : typeof activeID === "object" && activeID.spnID && !activeID.eleID ? (
                <SpanPreview elementData={activeItem}>
                  {activeItem?.elements?.length > 0 && (
                    <div>
                      {activeItem.elements.map((ele) => (
                        <ElementPreview element={ele} key={ele.id} />
                      ))}
                    </div>
                  )}
                </SpanPreview>
              ) : typeof activeID === "object" && activeID.eleID && activeItem ? (
                <div style={{ opacity: 0.37 }}>
                  <ElementPreview element={activeItem} />
                </div>
              ) : null)}
          </DragOverlay>
        </div>
        </div>
        



      </DndContext>
      </div>

      {!isPreview && (
      <footer
        className="flex h-[50px] w-full shrink-0 items-center justify-between gap-4 border-t border-slate-200/80 bg-white px-4 dark:border-white/10 dark:bg-gray-900"
        aria-label="แถบด้านล่างของแคนวาส"
      >
        <div className="flex min-w-0 flex-1 items-center gap-[10px] overflow-hidden">
          <button
            type="button"
            className={`${canvasTotalButtonClass} translate-x-[9px]`}
            aria-live="polite"
            title={`รวม ${canvasLayoutCounts.total} รายการ (โครงสร้าง + น้ำหนักองค์ประกอบ; Carousel/Data Slider/List Box=10, text/heading=1, อื่น=2) — สถานะ: ${canvasTotalTone === "green" ? "เขียว (รวม ≤200, ปกติ)" : canvasTotalTone === "yellow" ? "เหลือง (รวม 201–400, ข้อมูลเยอะ)" : "แดง (รวม ≥401, อันตราย)"}${PREVIEW_CANVAS_FOOTER_BUTTON_TONE ? " — กำลังแสดงสีแบบพรีวิว" : ""} — Section: ${canvasLayoutCounts.sections}, คอลัมน์: ${canvasLayoutCounts.columns}, Span: ${canvasLayoutCounts.spans}, Mini span: ${canvasLayoutCounts.nestedSpans}, องค์ประกอบ (ชิ้น): ${canvasLayoutCounts.elements}, น้ำหนักรวม: ${canvasLayoutCounts.elementsWeighted}`}
          >
            <Info
              className="size-3.5 shrink-0 opacity-95"
              strokeWidth={2.25}
              aria-hidden
            />
            <span className="min-w-0">
              ประมาณข้อมูล{" "}
              <span className="tabular-nums font-semibold">
                {canvasLayoutCounts.total}
              </span>
              {canvasTotalBracketText ? (
                <>
                  {" "}
                  <span className="font-medium opacity-95">
                    {canvasTotalBracketText}
                  </span>
                </>
              ) : null}
            </span>
          </button>
          <span className="min-w-0 truncate text-[12px] text-slate-400 dark:text-white/55 ml-5">
            โครงสร้าง {canvasLayoutCounts.structureTotal} + องค์ประกอบ {" "}
            {canvasLayoutCounts.elements}
          </span>
        </div>
        <span className="shrink-0 text-[12px] text-slate-500 dark:text-white/55">
          Copyright © {new Date().getFullYear()} Web Builder. All rights reserved.
        </span>
      </footer>
      )}

      <RichTextEditorModal
        open={Boolean(textEditModal)}
        onClose={() => setTextEditModal(null)}
        sourceElement={textEditModal?.elementData}
        snapshotKey={textEditSnapshotKey}
        theme={theme}
        onSave={(nextParagraph) => {
          const id = textEditModal?.elementData?.id;
          if (id == null) return;
          const plain = nextParagraph.segments.map((s) => s.text).join("");
          if (textEditModal?.mode === "list-text") {
            const content = plain.replace(/\r\n/g, "\n");
            patchLayoutElement(
              {
                listTextParagraph: serializeParagraphForSave(nextParagraph),
                listText: content,
              },
              { eleID: id }
            );
            setTextEditModal(null);
            return;
          }
          if (textEditModal?.mode === "list-item-text") {
            const ex = textEditModal?.elementData?.__listItemTextEdit;
            const lid = ex?.listElementId;
            const idx = Number(ex?.itemIndex);
            if (lid == null || !Number.isFinite(idx) || idx < 0) {
              setTextEditModal(null);
              return;
            }
            const base = findLayoutElementById(layoutsRef.current, String(lid));
            if (!base || base.type !== "list") {
              setTextEditModal(null);
              return;
            }
            const merged = mergeListElement(base);
            const items = lodash.cloneDeep(merged.listItems || []);
            if (idx >= items.length) {
              setTextEditModal(null);
              return;
            }
            const content = plain.replace(/\r\n/g, "\n");
            items[idx] = {
              ...items[idx],
              listTextParagraph: serializeParagraphForSave(nextParagraph),
              listText: content,
            };
            patchLayoutElement(
              mergeListElement({ ...merged, listItems: items }),
              { eleID: String(lid) }
            );
            setTextEditModal(null);
            return;
          }
          if (textEditModal?.mode === "list-box-item-text") {
            const ex = textEditModal?.elementData?.__listBoxItemTextEdit;
            const bid = ex?.listBoxElementId;
            const idx = Number(ex?.itemIndex);
            const field = ex?.field === "body" ? "body" : "title";
            if (bid == null || !Number.isFinite(idx) || idx < 0) {
              setTextEditModal(null);
              return;
            }
            const base = findLayoutElementById(layoutsRef.current, String(bid));
            if (!base || base.type !== "lstb") {
              setTextEditModal(null);
              return;
            }
            const merged = mergeListBoxElement(base);
            const items = lodash.cloneDeep(merged.listBoxItems || []);
            if (idx >= items.length) {
              setTextEditModal(null);
              return;
            }
            const content = plain.replace(/\r\n/g, "\n");
            const para = serializeParagraphForSave(nextParagraph);
            if (field === "title") {
              items[idx] = {
                ...items[idx],
                title: content,
                titleParagraph: para,
              };
            } else {
              items[idx] = {
                ...items[idx],
                body: content,
                bodyParagraph: para,
              };
            }
            patchLayoutElement(
              mergeListBoxElement({ ...merged, listBoxItems: items }),
              { eleID: String(bid) }
            );
            setTextEditModal(null);
            return;
          }
          if (textEditModal?.mode === "carousel-slide-caption") {
            const ex = textEditModal?.elementData?.__carouselCaptionEdit;
            const cid = ex?.carouselElementId;
            const idx = Number(ex?.slideIndex);
            if (cid == null || !Number.isFinite(idx) || idx < 0) {
              setTextEditModal(null);
              return;
            }
            const idStr = String(cid);
            const base = findLayoutElementById(layoutsRef.current, idStr);
            if (!base || base.type !== "crl") {
              setTextEditModal(null);
              return;
            }
            const merged = mergeCarouselElement(base);
            const slides = lodash.cloneDeep(merged.carouselSlides || []);
            if (idx >= slides.length) {
              setTextEditModal(null);
              return;
            }
            slides[idx] = {
              ...slides[idx],
              captionParagraph: serializeParagraphForSave(nextParagraph),
            };
            patchLayoutElement(
              mergeCarouselElement({ ...merged, carouselSlides: slides }),
              { eleID: idStr }
            );
            setTextEditModal(null);
            return;
          }
          if (textEditModal?.mode === "image-hover-text") {
            patchLayoutElement(
              {
                imageHoverText: plain.replace(/\r\n/g, "\n"),
                imageHoverTextParagraph: serializeParagraphForSave(nextParagraph),
              },
              { eleID: id }
            );
            setTextEditModal(null);
            return;
          }
          if (textEditModal?.mode === "between-text") {
            const ex = textEditModal?.elementData?.__betweenTextEdit;
            const bid = ex?.betweenElementId;
            const side = ex?.side === "right" ? "right" : "left";
            if (bid == null) {
              setTextEditModal(null);
              return;
            }
            const base = findLayoutElementById(layoutsRef.current, String(bid));
            if (!base || base.type !== "btw") {
              setTextEditModal(null);
              return;
            }
            const merged = mergeBetweenElement(base);
            const content = plain.replace(/\r\n/g, "\n");
            const paragraph = serializeParagraphForSave(nextParagraph);
            patchLayoutElement(
              mergeBetweenElement({
                ...merged,
                /* When text is edited via modal, paragraph classes/styles should control emphasis. */
                betweenBold: false,
                ...(side === "right"
                  ? {
                      betweenRightText: content,
                      betweenRightTextParagraph: paragraph,
                    }
                  : {
                      betweenLeftText: content,
                      betweenLeftTextParagraph: paragraph,
                    }),
              }),
              { eleID: String(bid) }
            );
            setTextEditModal(null);
            return;
          }
          if (textEditModal?.mode === "button-special-text") {
            patchLayoutElement(
              {
                buttonSpecialText: plain.replace(/\r\n/g, "\n"),
                buttonSpecialTextParagraph: serializeParagraphForSave(nextParagraph),
              },
              { eleID: id }
            );
            setTextEditModal(null);
            return;
          }
          patchLayoutElement(
            {
              textParagraph: serializeParagraphForSave(nextParagraph),
              label: plain,
            },
            { eleID: id }
          );
          setTextEditModal(null);
        }}
      />
      <Modal
        open={Boolean(columnPresetModal?.open)}
        onClose={(_, reason) => {
          if (reason === "backdropClick") return;
          closeColumnPresetModal();
        }}
        aria-labelledby="column-preset-modal-title"
        aria-describedby="column-preset-modal-desc"
        slotProps={{ backdrop: { timeout: 180 } }}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
      >
        <Fade in={Boolean(columnPresetModal?.open)} timeout={180}>
          <Box
            sx={{
              position: "relative",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 420,
              maxWidth: "calc(100vw - 24px)",
              backgroundColor: "white",
              borderRadius: 3,
              p: 2,
              outline: "none",
            }}
          >
            <div className="mb-3 flex items-center justify-between">
              <div id="column-preset-modal-title" className="text-[15px] font-bold text-[#333333]">
                บันทึก PRESET
              </div>
              <button
                type="button"
                aria-label="ปิด"
                className="inline-flex items-center justify-center text-[13px] font-semibold text-[#6b7280] transition-colors hover:text-[#374151]"
                onClick={closeColumnPresetModal}
              >
                X
              </button>
            </div>
            <input
              autoFocus
              value={columnPresetModal?.name || ""}
              onChange={(e) =>
                setColumnPresetModal((prev) => ({
                  ...prev,
                  name: e.target.value,
                  error: "",
                }))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  saveColumnPresetToLocalStorage();
                }
              }}
              placeholder="ชื่อ PRESET"
              className="mb-2 w-full rounded-md border border-gray-300 px-3 py-2 text-[13px] text-[#333333] placeholder:text-[#333333] outline-none ring-0 focus:border-gray-300 focus:ring-0 focus-visible:ring-0"
            />
            {columnPresetModal?.error ? (
              <div className="mb-2 text-[12px] text-red-600">{columnPresetModal.error}</div>
            ) : null}
            <div className="mt-3 flex justify-end gap-2">
              <Button
                onClick={closeColumnPresetModal}
                sx={{
                  textTransform: "none",
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#6b7280",
                  borderColor: "#e6e7eb",
                  bgcolor: "#e6e7eb",
                  "&:hover": {
                    bgcolor: "#e6e7eb",
                    borderColor: "#e6e7eb",
                  },
                }}
                variant="outlined"
              >
                ยกเลิก
              </Button>
              <Button
                variant="contained"
                onClick={saveColumnPresetToLocalStorage}
                sx={{
                  textTransform: "none",
                  fontSize: 12,
                  fontWeight: 500,
                  bgcolor: "#333333",
                  boxShadow: "none",
                  "&:hover": {
                    bgcolor: "#333333",
                    boxShadow: "none",
                  },
                }}
              >
                บันทึก
              </Button>
            </div>
          </Box>
        </Fade>
      </Modal>
      <Modal
        open={Boolean(columnPresetLoadModal?.open)}
        onClose={(_, reason) => {
          if (reason === "backdropClick") return;
          closeColumnPresetLoadModal();
        }}
        aria-labelledby="column-preset-load-modal-title"
        slotProps={{ backdrop: { timeout: 180 } }}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
      >
        <Fade in={Boolean(columnPresetLoadModal?.open)} timeout={180}>
          <Box
            sx={{
              position: "relative",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 475,
              maxWidth: "calc(100vw - 24px)",
              maxHeight: "min(70vh, 560px)",
              overflow: "hidden",
              backgroundColor: "white",
              borderRadius: 3,
              p: 2,
              outline: "none",
            }}
          >
            <div className="mb-3 flex items-center justify-between">
              <div id="column-preset-load-modal-title" className="text-[15px] font-bold text-[#333333]">
                โหลด PRESET
              </div>
              <button
                type="button"
                aria-label="ปิด"
                className="inline-flex items-center justify-center text-[13px] font-semibold text-[#6b7280] transition-colors hover:text-[#374151]"
                onClick={closeColumnPresetLoadModal}
              >
                X
              </button>
            </div>
            {columnPresetLoadModal?.error ? (
              <div className="mb-2 text-[12px] text-red-600">{columnPresetLoadModal.error}</div>
            ) : null}
            <div className="max-h-[44vh] overflow-y-auto rounded-md border border-gray-200">
              {(columnPresetLoadModal?.presets || []).length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {(columnPresetLoadModal?.presets || []).map((preset) => (
                    <div
                      key={preset?.id || Math.random().toString(36)}
                      className="flex items-center gap-2 pl-2 pr-3 py-1.5 transition-colors hover:bg-gray-50"
                    >
                      <button
                        type="button"
                        className="flex min-w-0 flex-1 items-center justify-between rounded-md pl-1 pr-2 py-1.5 text-left transition-colors hover:bg-gray-100"
                        onClick={() => {
                          setPresetDeleteConfirmId(null);
                          applyColumnPresetToTarget(preset);
                        }}
                      >
                        <span className="min-w-0 flex items-center gap-1.5">
                          <Gem className="size-3.5 shrink-0 text-gray-300" />
                          <span className="truncate text-[13px] text-[#333333]">
                            {formatPresetDisplayName(preset?.name)}
                          </span>
                        </span>
                        <span className="shrink-0 pl-2 text-[11px] text-gray-400">
                          {preset?.updatedAt ? formatPresetUpdatedAt(preset.updatedAt) : ""}
                        </span>
                      </button>
                      {presetDeleteConfirmId === preset?.id ? (
                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            type="button"
                            className="rounded-md border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] text-gray-500 transition-colors hover:bg-gray-50"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setPresetDeleteConfirmId(null);
                            }}
                          >
                            ยกเลิก
                          </button>
                          <button
                            type="button"
                            className="rounded-md border border-[#b81c1c] bg-[#b81c1c] px-1.5 py-0.5 text-[10px] text-white transition-colors hover:bg-[#a61919]"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              deleteColumnPresetFromLocalStorage(preset?.id);
                            }}
                          >
                            ลบ
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          aria-label="ลบ PRESET"
                          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-500"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setPresetDeleteConfirmId(preset?.id || null);
                          }}
                        >
                          <Trash2 className="size-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-3 py-5 text-center text-[12px] text-gray-400">
                  ยังไม่มี PRESET ที่บันทึกไว้
                </div>
              )}
            </div>
            <div className="mt-3 flex justify-end">
              <Button
                onClick={closeColumnPresetLoadModal}
                sx={{
                  textTransform: "none",
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#6b7280",
                  borderColor: "#e6e7eb",
                  bgcolor: "#e6e7eb",
                  "&:hover": { bgcolor: "#e6e7eb", borderColor: "#e6e7eb" },
                }}
                variant="outlined"
              >
                ปิด
              </Button>
            </div>
          </Box>
        </Fade>
      </Modal>
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        open={presetSavedToastOpen}
        autoHideDuration={2400}
        onClose={() => setPresetSavedToastOpen(false)}
        ContentProps={{ elevation: 0 }}
        message={
          <Box
            component="span"
            sx={{
              display: "flex",
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              py: 0.75,
            }}
          >
            <AlertCircle
              className="shrink-0"
              size={20}
              strokeWidth={2.25}
              aria-hidden
            />
            <span>สำเร็จ ..... บันทึก PRESET เรียบร้อยแล้ว</span>
          </Box>
        }
        sx={{
          "& .MuiSnackbarContent-root": {
            backgroundColor: "#05966B",
            color: "#fff",
            fontSize: 13,
            justifyContent: "center",
            alignItems: "center",
            py: 0.75,
            boxShadow: "none",
          },
          "& .MuiSnackbarContent-message": {
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            py: 0.25,
          },
        }}
      />
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        open={presetLoadedToastOpen}
        autoHideDuration={2400}
        onClose={() => setPresetLoadedToastOpen(false)}
        ContentProps={{ elevation: 0 }}
        message={
          <Box
            component="span"
            sx={{
              display: "flex",
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              py: 0.75,
            }}
          >
            <AlertCircle className="shrink-0" size={20} strokeWidth={2.25} aria-hidden />
            <span>สำเร็จ ..... โหลด PRESET เรียบร้อยแล้ว</span>
          </Box>
        }
        sx={{
          "& .MuiSnackbarContent-root": {
            backgroundColor: "#05966B",
            color: "#fff",
            fontSize: 13,
            justifyContent: "center",
            alignItems: "center",
            py: 0.75,
            boxShadow: "none",
          },
          "& .MuiSnackbarContent-message": {
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            py: 0.25,
          },
        }}
      />
      <ConfirmModal data={modal} close={()=>openModal()}/>
      <AlertModal/>
      {!isDraggingLayout ? (
        <ElementSetting id={selectID} x={positionElementSetting.x} y={positionElementSetting.y}/>
      ) : null}
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        open={carouselColToastOpen}
        onClose={() => setCarouselColToastOpen(false)}
        ContentProps={{ elevation: 0 }}
        message={
          <Box
            component="span"
            sx={{
              display: "flex",
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              py: 0.75,
            }}
          >
            <AlertCircle
              className="shrink-0"
              size={20}
              strokeWidth={2.25}
              aria-hidden
            />
            <span>ไม่สำเร็จ ... กรุณาเพิ่มความกว้างของคอลัมน์</span>
          </Box>
        }
        autoHideDuration={4000}
        sx={{
          "& .MuiSnackbarContent-root": {
            backgroundColor: "#b91c1b",
            color: "#fff",
            fontSize: 13,
            justifyContent: "center",
            alignItems: "center",
            py: 0.75,
            boxShadow: "none",
          },
          "& .MuiSnackbarContent-message": {
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            py: 0.25,
          },
        }}
      />
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        open={listImageColToastOpen}
        onClose={() => setListImageColToastOpen(false)}
        ContentProps={{ elevation: 0 }}
        message={
          <Box
            component="span"
            sx={{
              display: "flex",
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              py: 0.75,
            }}
          >
            <AlertCircle
              className="shrink-0"
              size={20}
              strokeWidth={2.25}
              aria-hidden
            />
            <span>ไม่สำเร็จ ... กรุณาเพิ่มความกว้างของคอลัมน์</span>
          </Box>
        }
        autoHideDuration={4000}
        sx={{
          "& .MuiSnackbarContent-root": {
            backgroundColor: "#b91c1b",
            color: "#fff",
            fontSize: 13,
            justifyContent: "center",
            alignItems: "center",
            py: 0.75,
            boxShadow: "none",
          },
          "& .MuiSnackbarContent-message": {
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            py: 0.25,
          },
        }}
      />

      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        open={postColToastOpen}
        onClose={() => setPostColToastOpen(false)}
        ContentProps={{ elevation: 0 }}
        message={
          <Box
            component="span"
            sx={{
              display: "flex",
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              py: 0.75,
            }}
          >
            <AlertCircle
              className="shrink-0"
              size={20}
              strokeWidth={2.25}
              aria-hidden
            />
            <span>ไม่สำเร็จ ... กรุณาเพิ่มความกว้างของคอลัมน์</span>
          </Box>
        }
        autoHideDuration={4000}
        sx={{
          "& .MuiSnackbarContent-root": {
            backgroundColor: "#b91c1b",
            color: "#fff",
            fontSize: 13,
            justifyContent: "center",
            alignItems: "center",
            py: 0.75,
            boxShadow: "none",
          },
          "& .MuiSnackbarContent-message": {
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            py: 0.25,
          },
        }}
      />

      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        open={tabsInTabToastOpen}
        onClose={() => setTabsInTabToastOpen(false)}
        ContentProps={{ elevation: 0 }}
        message={
          <Box
            component="span"
            sx={{
              display: "flex",
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              py: 0.75,
            }}
          >
            <AlertCircle
              className="shrink-0"
              size={20}
              strokeWidth={2.25}
              aria-hidden
            />
            <span>ไม่สามารถใช้งาน Element นี้ได้</span>
          </Box>
        }
        autoHideDuration={4000}
        sx={{
          "& .MuiSnackbarContent-root": {
            backgroundColor: "#b91c1b",
            color: "#fff",
            fontSize: 13,
            justifyContent: "center",
            alignItems: "center",
            py: 0.75,
            boxShadow: "none",
          },
          "& .MuiSnackbarContent-message": {
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            py: 0.25,
          },
        }}
      />

      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        open={postInPostToastOpen}
        onClose={() => setPostInPostToastOpen(false)}
        ContentProps={{ elevation: 0 }}
        message={
          <Box
            component="span"
            sx={{
              display: "flex",
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              py: 0.75,
            }}
          >
            <AlertCircle
              className="shrink-0"
              size={20}
              strokeWidth={2.25}
              aria-hidden
            />
            <span>ไม่สำเร็จ ... ไม่สามารถลากวางได้</span>
          </Box>
        }
        autoHideDuration={4000}
        sx={{
          "& .MuiSnackbarContent-root": {
            backgroundColor: "#b91c1b",
            color: "#fff",
            fontSize: 13,
            justifyContent: "center",
            alignItems: "center",
            py: 0.75,
            boxShadow: "none",
          },
          "& .MuiSnackbarContent-message": {
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            py: 0.25,
          },
        }}
      />
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        open={dataSliderTypeToastOpen}
        onClose={() => setDataSliderTypeToastOpen(false)}
        ContentProps={{ elevation: 0 }}
        message={
          <Box
            component="span"
            sx={{
              display: "flex",
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              py: 0.75,
            }}
          >
            <AlertCircle
              className="shrink-0"
              size={20}
              strokeWidth={2.25}
              aria-hidden
            />
            <span>ไม่สำเร็จ ... ใช้ได้เฉพาะ Elements พื้นฐานเท่านั้น</span>
          </Box>
        }
        autoHideDuration={4000}
        sx={{
          "& .MuiSnackbarContent-root": {
            backgroundColor: "#b91c1b",
            color: "#fff",
            fontSize: 13,
            justifyContent: "center",
            alignItems: "center",
            py: 0.75,
            boxShadow: "none",
          },
          "& .MuiSnackbarContent-message": {
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            py: 0.25,
          },
        }}
      />

      <style>{`

      .mySwiper .swiper-button-prev{
        margin-left:15px;
      }
      .mySwiper .swiper-button-next{
        margin-right:15px;
      }

      .mySwiper .swiper-button-next,
      .mySwiper .swiper-button-prev{
        background-color: var(--swiper-nav-bg, transparent); /* ใช้ตัวแปรที่ประกาศใน style */
        border-radius: 9999px;   
        width: var(--swiper-nav-size, transparent);
        height: var(--swiper-nav-size, transparent);
        padding: var(--swiper-nav-padding, transparent);
        display: flex;
        align-items: center;
        justify-content: center;
        stroke: currentColor;
        stroke-width: 1.5;
      }

      .mySwiper .swiper-pagination-bullet {
        background-color: var(--swiper-pagination-color, #000) !important;
        opacity: 0.5;         /* จุดปกติจางลง */
        width: var(--swiper-pag-size, transparent);
        height: var(--swiper-pag-size, transparent);
      }
      
      .mySwiper .swiper-pagination-bullet-active {
        opacity: 1 !important; /* จุดที่เลือกชัดเต็ม */

      }

      .mySwiper .swiper-pagination {
        bottom: 20px !important;  /* ยิ่งเลขมาก ยิ่งห่างจากขอบล่างมาก (เลื่อนขึ้น) */
      }

                html.dragging, html.dragging * {
                  cursor: grabbing !important;

                }

                .sortable-grab {cursor: grab;}
                .sortable-grab * { cursor: inherit; }


                .column-area:focus{
                  outline: none !important;
                  box-shadow: none !important;
                  border-color: inherit !important;
                }

                .content-area:focus{
                  outline: none !important;
                  box-shadow: none !important;
                  border-color: none !important;
                }

                .container-area:focus{
                  outline: none !important;
                  box-shadow: none !important;
                  border-color: inherit !important;
                }
            `}</style>
    </main>
  );

};

export default Content;
