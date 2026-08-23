import React, {
  startTransition,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  useRef,
  useSyncExternalStore,
} from "react";
import { createPortal, flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import {
  Settings,
  Copy,
  Trash2,
  Minus,
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
import lodash, { isNull } from "lodash";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  pointerWithin,
  DragOverlay,
  MeasuringStrategy,
  useDndContext,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  defaultAnimateLayoutChanges,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import IconLucide from "../IconLucide";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Container from "./Layouts/Container"
import Column, { SpanCanvasFill } from "./Layouts/Conlumn";
import {
  completeObservedPanelLayoutCommitsAfterPaint,
  completeScopedLayoutSnapshot,
  hasPendingPanelLayoutCommit,
  isScopedLayoutSnapshot,
  markScopedLayoutSnapshot,
  observePendingPanelLayoutCommits,
  recordBuilderPanelOpenCanvasCommit,
  recordPanelSliderCanvasCommit,
  recordPanelSliderSectionCacheStats,
} from "./panelPreviewStore";
import {
  createStructuralOptionStore,
  structuralOptionKey,
} from "./structuralOptionStore";
import {
  createElementSelectionStore,
  elementSelectionKey,
} from "./elementSelectionStore";
import {
  beginBuilderPerformanceTransaction,
  cancelBuilderPerformanceTransaction,
  finishBuilderPerformanceTransaction,
  finishBuilderPerformanceTransactionAfterPaint,
  isBuilderPerformanceEnabled,
  recordBuilderCanvasCommit,
  setBuilderPerformanceTarget,
  setBuilderPerformanceTransactionTarget,
} from "./performance/builderPerformanceStore";
import { BuilderPerformanceTrigger } from "./performance/BuilderPerformanceMonitor";
import { useBuilderContextStore } from "./store/builderContextStore";
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
  isButtonFullWidthEnabled,
  isButtonLinkIconDefined,
  isButtonSpecialTextEnabled,
  resolveButtonSpecialTextLabel,
} from "./Layouts/Elements/buttonElementConfig";
import IconAwsome from "./IconAwsome";
import {
  mergeIconElement,
} from "./Layouts/Elements/iconElementConfig";
import {
  HEADING_ELEMENT_DEFAULTS,
  mergeHeadingElement,
} from "./Layouts/Elements/headingElementConfig";
import { mergeCounterElement } from "./Layouts/Elements/counterElementConfig";
import { mergeTableElement } from "./Layouts/Elements/tableElementConfig";
import { mergeBetweenElement } from "./Layouts/Elements/betweenElementConfig";
import { mergeDividerElement } from "./Layouts/Elements/dividerElementConfig";
import FormElementPreview from "./Layouts/Elements/FormElement";
import FormBlock from "./Layouts/Elements/FormBlock";
import HeadingDividerTextBlock from "./Layouts/Elements/HeadingDividerTextBlock";
import { setColor } from "../../function";

const INLINE_ROW_GHOST_ENABLED = false;

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
  frmInput: "FrmInput-",
  frmText: "FrmText-",
  frmNum: "FrmNum-",
  frmSum: "FrmSum-",
  frmTextarea: "FrmTextarea-",
  frmSelect: "FrmSelect-",
  frmRadio: "FrmRadio-",
  frmCheckbox: "FrmCheckbox-",
  frmSubmit: "FrmSubmit-",
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
/** ความกว้างขั้นต่ำของ Data Slider (หน่วยแถว 12 คอลัมน์) — ต้อง ≥ Col-4 (ค่าเริ่มต้นคอลัมน์) */
const DATA_SLIDER_MIN_COL_UNITS = 4;
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
const FORM_ELEMENT_TYPES = new Set([
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
const FORM_ROW_GAP_PX = 12;
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
  if (el?.type !== "post" && el?.type !== "ctg") return false;
  const w = getLayoutBucketWidthUnits(layouts, destConI, destColI, destSpnI, destMspnI);
  return !Number.isFinite(w) || w < POST_MIN_COL_UNITS;
}

function shouldBlockDataSliderDrop(layouts, active, destConI, destColI, destSpnI, destMspnI) {
  const el = resolveLayoutElementByDragData(layouts, active);
  if (el?.type !== "dts") return false;
  const w = getLayoutBucketWidthUnits(layouts, destConI, destColI, destSpnI, destMspnI);
  return !Number.isFinite(w) || w < DATA_SLIDER_MIN_COL_UNITS;
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

function isAllowedInDataSliderArea(el) {
  const t = String(el?.type || "");
  return DATA_SLIDER_ALLOWED_ELEMENT_TYPES.has(t);
}

function hasPostMinWidthElementDeep(el) {
  if (!el || typeof el !== "object") return false;
  if (el.type === "post" || el.type === "ctg") return true;
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

function hasDataSliderMinWidthElementDeep(el) {
  if (!el || typeof el !== "object") return false;
  if (el.type === "dts") return true;
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
      if (hasDataSliderMinWidthElementDeep(child)) return true;
    }
  }
  return false;
}

function bucketHasDataSliderMinWidthElement(elements) {
  if (!Array.isArray(elements)) return false;
  for (const el of elements) {
    if (hasDataSliderMinWidthElementDeep(el)) return true;
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
  if (
    bucketHasDataSliderMinWidthElement(column?.elements) &&
    colSize < DATA_SLIDER_MIN_COL_UNITS
  ) {
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
    if (
      bucketHasDataSliderMinWidthElement(span?.elements) &&
      (!Number.isFinite(spanUnits) || spanUnits < DATA_SLIDER_MIN_COL_UNITS)
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
      if (
        bucketHasDataSliderMinWidthElement(mini?.elements) &&
        (!Number.isFinite(miniUnits) || miniUnits < DATA_SLIDER_MIN_COL_UNITS)
      ) {
        return false;
      }
    }
  }
  return true;
}
const INLINE_LIST_DEFAULT_ALIGN = "start";

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
    if (FORM_ELEMENT_TYPES.has(String(e?.type || ""))) {
      const colsRaw = Number(e?.formLayoutColumns);
      const cols = colsRaw === 2 || colsRaw === 3 ? colsRaw : 1;
      if (cols > 1) {
        let j = i + 1;
        while (j < elements.length) {
          const next = elements[j];
          if (!FORM_ELEMENT_TYPES.has(String(next?.type || ""))) break;
          const nextColsRaw = Number(next?.formLayoutColumns);
          const nextCols =
            nextColsRaw === 2 || nextColsRaw === 3 ? nextColsRaw : 1;
          if (nextCols <= 1) break;
          j += 1;
        }
        chunks.push({ kind: "formRow", startIndex: i, items: elements.slice(i, j) });
        i = j;
        continue;
      }
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
  if (chunk.kind === "formRow") return "flex-start";
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
  if (chunk.kind === "formRow") return "gap-x-3 gap-y-2";
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

let dropElementNodeByIdCache = null;
let dropElementRectCache = new WeakMap();

function resetDropElementGeometryCache() {
  dropElementNodeByIdCache = null;
  dropElementRectCache = new WeakMap();
}

function resetDropElementRectCache() {
  dropElementRectCache = new WeakMap();
}

function ensureDropElementNodeCache() {
  if (dropElementNodeByIdCache) return dropElementNodeByIdCache;
  const next = new Map();
  const all = document.querySelectorAll('[data-drop="ELEMENT"]');
  for (let i = 0; i < all.length; i++) {
    const node = all[i];
    const raw = node.getAttribute("id");
    if (!raw) continue;
    const last = raw.includes("/") ? raw.split("/").pop() : raw;
    if (last && !next.has(last)) next.set(last, node);
  }
  dropElementNodeByIdCache = next;
  return next;
}

function getCachedDropElementRect(node) {
  if (!node) return null;
  const cached = dropElementRectCache.get(node);
  if (cached) return cached;
  const rect = node.getBoundingClientRect();
  dropElementRectCache.set(node, rect);
  return rect;
}

function findDropElementNodeByEleId(eleId) {
  if (eleId == null) return null;
  const id = String(eleId);
  const cached = ensureDropElementNodeCache().get(id) ?? null;
  if (!cached || cached.isConnected) return cached;
  // Content ยังมี component ภายในอยู่หลายตัว จึงอาจ remount หลัง target เปลี่ยน
  dropElementNodeByIdCache = null;
  return ensureDropElementNodeCache().get(id) ?? null;
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
  const ra = getCachedDropElementRect(nA);
  const rb = getCachedDropElementRect(nB);
  return (ra.top + rb.bottom) / 2;
}

/** คงฝั่ง snap ในแถบกลางระหว่างหัว/ท้ายก้อน list — ลดกระพริบเมื่อ mouseY อยู่ใกล้ mid */
let listRunSnapState = { runKey: null, side: null };

function resetListRunSnapState() {
  listRunSnapState = { runKey: null, side: null };
}

function resetTabInlineRowSnapState() {}

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
    const r = getCachedDropElementRect(firstNode);
    return r.top;
  }
  if (insertI >= eleBucket.length) {
    const lastNode = findDropElementNodeByEleId(eleBucket[eleBucket.length - 1]?.id);
    if (!lastNode) return null;
    const r = getCachedDropElementRect(lastNode);
    return r.bottom;
  }
  const upNode = findDropElementNodeByEleId(eleBucket[insertI - 1]?.id);
  const dnNode = findDropElementNodeByEleId(eleBucket[insertI]?.id);
  if (!upNode || !dnNode) return null;
  const up = getCachedDropElementRect(upNode);
  const dn = getCachedDropElementRect(dnNode);
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
        const r = getCachedDropElementRect(firstNode);
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
        const r = getCachedDropElementRect(lastNode);
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
    const rect = getCachedDropElementRect(node);
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
const OFFSCREEN_SECTION_BENCHMARK_MIN_WEIGHTED_ITEMS = 401;
const OFFSCREEN_SECTION_BENCHMARK_MIN_SECTIONS = 12;
const OFFSCREEN_SECTION_BENCHMARK_QUERY_PARAM = "builderSectionPerf";
const DATA_SLIDER_PERF_QUERY_PARAM = "dataSliderPerf";
const STRUCTURE_PERF_QUERY_PARAM = "structurePerf";
const CATEGORIES_PERF_QUERY_PARAM = "categoriesPerf";
const TABS_PERF_QUERY_PARAM = "tabsPerf";
const ACCORDION_PERF_QUERY_PARAM = "accordionPerf";
const POST_PERF_QUERY_PARAM = "postPerf";
const LIST_ITEMS_PERF_QUERY_PARAM = "listItemsPerf";
const STABLE_ELEMENT_RENDER_REVISION = Object.freeze({});
const OFFSCREEN_SECTION_FALLBACK_HEIGHT_PX = 600;
const OFFSCREEN_SECTION_UNSAFE_ELEMENT_TYPES = new Set([
  "bnr",
  "crl",
  "dts",
]);

function sectionHasUnsafeOffscreenConfiguration(value, seen = new WeakSet()) {
  if (!value || typeof value !== "object") return false;
  if (seen.has(value)) return false;
  seen.add(value);

  if (
    typeof value.type === "string" &&
    OFFSCREEN_SECTION_UNSAFE_ELEMENT_TYPES.has(value.type.toLowerCase())
  ) {
    return true;
  }

  for (const [rawKey, nestedValue] of Object.entries(value)) {
    const key = rawKey.toLowerCase();
    if (
      key === "parallaxenabled" &&
      nestedValue === true
    ) {
      return true;
    }
    if (
      key.includes("overlap") &&
      Number(nestedValue) > 0
    ) {
      return true;
    }
    if (
      key.includes("sticky") &&
      Boolean(nestedValue)
    ) {
      return true;
    }
    if (
      key.includes("position") &&
      typeof nestedValue === "string" &&
      /^(absolute|fixed|sticky)$/i.test(nestedValue.trim())
    ) {
      return true;
    }
    if (
      typeof nestedValue === "string" &&
      /(?:^|[^\w])[-+]?(?:\d*\.?\d+)(?:dvh|svh|lvh|vh)\b/i.test(nestedValue)
    ) {
      return true;
    }
    if (
      nestedValue &&
      typeof nestedValue === "object" &&
      sectionHasUnsafeOffscreenConfiguration(nestedValue, seen)
    ) {
      return true;
    }
  }
  return false;
}

function isOffscreenSectionEligible(layout) {
  if (!layout?.container) return false;
  if (layout.heros) return false;
  return !sectionHasUnsafeOffscreenConfiguration(layout);
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
  const isValidElement = (item) =>
    item &&
    typeof item === "object" &&
    typeof item.id === "string" &&
    typeof item.type === "string" &&
    item.type !== "null";
  let needsNormalization = false;
  for (const layout of rawLayouts) {
    const cols = Array.isArray(layout?.columns) ? layout.columns : [];
    for (const col of cols) {
      if (
        Array.isArray(col?.elements) &&
        col.elements.some((item) => !isValidElement(item))
      ) {
        needsNormalization = true;
        break;
      }
      if (!col?.isSpan || !Array.isArray(col?.spans)) continue;
      for (const sp of col.spans) {
        if (
          (Array.isArray(sp?.elements) &&
            sp.elements.some((item) => !isValidElement(item))) ||
          (sp?.hasNestedSpan &&
            Array.isArray(sp?.nestedSpans) &&
            sp.nestedSpans.length > 0)
        ) {
          needsNormalization = true;
          break;
        }
      }
      if (needsNormalization) break;
    }
    if (needsNormalization) break;
  }
  if (!needsNormalization) return rawLayouts;

  let changed = false;
  const nextLayouts = lodash.cloneDeep(rawLayouts);
  const sanitizeElements = (list) =>
    Array.isArray(list)
      ? list.filter(isValidElement)
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

const MaybeDndContext = ({ enabled, children, ...props }) => {
  if (!enabled) return <>{children}</>;
  return <DndContext {...props}>{children}</DndContext>;
};

function ScopedElementDragPreview({
  activeItemRef,
  ownerRef,
  ownerKey,
  renderPreview,
}) {
  const { active } = useDndContext();
  const activeId =
    active?.data?.current?.type === "ELEMENT" ? String(active.id || "") : "";
  return React.useMemo(() => {
    if (
      !activeId ||
      !activeItemRef.current ||
      ownerRef.current !== ownerKey
    ) {
      return null;
    }
    return renderPreview(activeItemRef.current);
  }, [activeId, activeItemRef, ownerKey, ownerRef, renderPreview]);
}

/**
 * Content มี renderer ขนาดใหญ่ที่ต้องใช้ closure ล่าสุด แต่ถ้าประกาศ renderer
 * เป็น component ภายในโดยตรง React จะมองเป็น component type ใหม่ทุก render
 * boundary เหล่านี้คง type เดิมไว้ และเรียก renderer ล่าสุดผ่าน ref
 */
const InlineSortableRenderContext = React.createContext(null);
const StructuralRenderRevisionContext = React.createContext(null);
const StructuralOptionStoreContext = React.createContext(null);
const ElementSelectionStoreContext = React.createContext(null);
const EMPTY_STRUCTURAL_OPTION_SNAPSHOT = Object.freeze({
  hovered: false,
  descendantHovered: false,
  pinned: false,
  hoverId: "",
  publishedAt: 0,
});

function useElementSelectionSnapshot(ids) {
  const store = React.useContext(ElementSelectionStoreContext);
  const key = elementSelectionKey(ids);
  const subscribe = React.useCallback(
    (listener) => store?.subscribe(key, listener) || (() => {}),
    [key, store]
  );
  const getSnapshot = React.useCallback(
    () => store?.getSnapshot(key) || false,
    [key, store]
  );
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

const TabNestedElementSelectionBoundary = React.memo(
  function TabNestedElementSelectionBoundary({ ids, children }) {
    const selected = useElementSelectionSnapshot(ids);
    const renderersRef = React.useContext(InlineSortableRenderContext);
    renderersRef?.current?.onElementSelectionBoundaryRender?.();
    return (
      <div className="relative w-full">
        {children}
        {selected && (
          <div className="pointer-events-none absolute inset-0 rounded border border-dashed border-red-400 bg-red-300/10" />
        )}
      </div>
    );
  }
);

function applySortableElementSnapshot(
  node,
  snapshot,
  previousStylesRef,
  previousAttributesRef
) {
  if (!node || !snapshot) return;

  const previousStyles = previousStylesRef.current || {};
  const style = snapshot.style || {};
  Object.keys(previousStyles).forEach((key) => {
    if (!(key in style)) node.style[key] = "";
  });
  Object.keys(style).forEach((key) => {
    const value = style[key];
    node.style[key] = value == null ? "" : value;
  });
  previousStylesRef.current = style;

  const previousAttributes = previousAttributesRef.current || {};
  const attributes = snapshot.attributes || {};
  Object.keys(previousAttributes).forEach((name) => {
    if (!(name in attributes)) {
      node.removeAttribute(name === "tabIndex" ? "tabindex" : name);
    }
  });
  Object.entries(attributes).forEach(([name, value]) => {
    const attributeName = name === "tabIndex" ? "tabindex" : name;
    if (value == null || value === false) {
      node.removeAttribute(attributeName);
    } else {
      node.setAttribute(attributeName, value === true ? "" : String(value));
    }
  });
  previousAttributesRef.current = attributes;
}

function useStructuralDomBridge(kind, props) {
  const renderersRef = React.useContext(InlineSortableRenderContext);
  const renderRevision = React.useContext(StructuralRenderRevisionContext);
  const optionStore = React.useContext(StructuralOptionStoreContext);
  const optionKey = structuralOptionKey(
    kind === "container" ? "section" : kind,
    props.id
  );
  const subscribeToOptionKey = React.useCallback(
    (listener) => optionStore?.subscribe(optionKey, listener) || (() => {}),
    [optionKey, optionStore]
  );
  const getOptionSnapshot = React.useCallback(
    () =>
      optionStore?.getSnapshot(optionKey) || EMPTY_STRUCTURAL_OPTION_SNAPSHOT,
    [optionKey, optionStore]
  );
  const structuralOption = useSyncExternalStore(
    subscribeToOptionKey,
    getOptionSnapshot,
    getOptionSnapshot
  );
  const runtime = renderersRef?.current;
  const bridgeRef = React.useRef(null);

  if (!bridgeRef.current) {
    bridgeRef.current = {
      node: null,
      nodeRef(node) {
        bridgeRef.current.node = node;
      },
    };
  }

  runtime?.onStructuralShellRender?.(kind);

  React.useLayoutEffect(() => {
    const optionTargetVisible =
      structuralOption.hovered ||
      (kind === "splitRow" && Boolean(structuralOption.hoverId));
    if (!optionTargetVisible || !renderRevision?.controlsVisible) return;
    runtime?.onStructuralOptionVisible?.(
      kind,
      props.id,
      structuralOption.publishedAt
    );
  }, [
    kind,
    props.id,
    renderRevision,
    runtime,
    structuralOption.hovered,
    structuralOption.hoverId,
    structuralOption.publishedAt,
  ]);

  React.useLayoutEffect(
    () => () => {
      bridgeRef.current.node = null;
    },
    []
  );

  return {
    bridgeRef,
    renderersRef,
    renderRevision,
    structuralOption,
  };
}

const MemoStructuralBoundary = React.memo(
  function MemoStructuralBoundary({
    kind,
    renderersRef,
    domBridge,
    ...props
  }) {
    renderersRef?.current?.onStructuralHeavyRender?.(kind);
    return (
      renderersRef?.current?.[kind]?.({
        ...props,
        domBridge,
      }) ?? null
    );
  }
);

function StructuralSplitRowShell(props) {
  const { bridgeRef, renderersRef, renderRevision, structuralOption } =
    useStructuralDomBridge("splitRow", props);
  return (
    <MemoStructuralBoundary
      {...props}
      kind="splitRow"
      renderersRef={renderersRef}
      domBridge={bridgeRef}
      renderRevision={renderRevision}
      structuralOption={structuralOption}
    />
  );
}

function StructuralContainerShell(props) {
  const { bridgeRef, renderersRef, renderRevision, structuralOption } =
    useStructuralDomBridge("container", props);
  return (
    <MemoStructuralBoundary
      {...props}
      kind="container"
      renderersRef={renderersRef}
      domBridge={bridgeRef}
      renderRevision={renderRevision}
      structuralOption={structuralOption}
    />
  );
}

function StructuralColumnShell(props) {
  const { bridgeRef, renderersRef, renderRevision, structuralOption } =
    useStructuralDomBridge("column", props);
  return (
    <MemoStructuralBoundary
      {...props}
      kind="column"
      renderersRef={renderersRef}
      domBridge={bridgeRef}
      renderRevision={renderRevision}
      structuralOption={structuralOption}
    />
  );
}

function StructuralSpanShell(props) {
  const { bridgeRef, renderersRef, renderRevision, structuralOption } =
    useStructuralDomBridge("span", props);
  return (
    <MemoStructuralBoundary
      {...props}
      kind="span"
      renderersRef={renderersRef}
      domBridge={bridgeRef}
      renderRevision={renderRevision}
      structuralOption={structuralOption}
    />
  );
}

/**
 * The sortable shell is the only element boundary subscribed to dnd-kit.
 * It keeps the existing outer DOM node and updates its frame-sensitive style
 * imperatively, allowing the large editor renderer below to stay memoized.
 */
function SortableElementShell(props) {
  const renderersRef = React.useContext(InlineSortableRenderContext);
  const runtime = renderersRef?.current;
  const sortableConfig = runtime?.getElementSortableConfig?.(props) || {};
  const sortable = useSortable({
    id: props.id,
    data: {
      type: "ELEMENT",
      conID: props.containerId,
      colID: props.columnId,
      spnID: props.spanId ?? null,
      nestID: props.nestedSpanId ?? null,
    },
    ...sortableConfig,
  });
  const snapshot = runtime?.getElementSortableSnapshot?.(props, sortable);
  const previousStylesRef = React.useRef({});
  const previousAttributesRef = React.useRef({});
  const bridgeRef = React.useRef(null);

  if (!bridgeRef.current) {
    bridgeRef.current = {
      node: null,
      setNodeRef: null,
      nodeRef(node) {
        bridgeRef.current.node = node;
        bridgeRef.current.setNodeRef?.(node);
      },
      snapshot: null,
    };
  }
  bridgeRef.current.setNodeRef = sortable.setNodeRef;
  bridgeRef.current.snapshot = snapshot;

  React.useLayoutEffect(() => {
    applySortableElementSnapshot(
      bridgeRef.current.node,
      snapshot,
      previousStylesRef,
      previousAttributesRef
    );
  }, [snapshot]);

  React.useEffect(() => {
    if (sortable.isDragging) {
      runtime?.onElementSortableDragStart?.();
    }
  }, [runtime, sortable.isDragging]);

  return (
    <MemoSortableElementBoundary
      {...props}
      renderersRef={renderersRef}
      sortableBridge={bridgeRef}
      renderRevision={runtime?.elementRenderRevision}
    />
  );
}

function StructuralSplitRowItem(props) {
  return <StructuralSplitRowShell {...props} />;
}

function StructuralContainerItem(props) {
  return <StructuralContainerShell {...props} />;
}

function StructuralColumnItem(props) {
  return <StructuralColumnShell {...props} />;
}

function StructuralSpanItem(props) {
  return <StructuralSpanShell {...props} />;
}

const MemoSortableElementBoundary = React.memo(
  function MemoSortableElementBoundary({
    renderersRef,
    sortableBridge,
    ...props
  }) {
    const [hoverElement, setHoverElement] = React.useState(false);
    const selected = useElementSelectionSnapshot({
      conID: props.containerId,
      colID: props.columnId,
      spnID: props.spanId,
      nestID: props.nestedSpanId,
      eleID: props.id,
    });
    renderersRef?.current?.onElementSelectionBoundaryRender?.();
    return (
      renderersRef?.current?.element?.({
        ...props,
        sortableBridge,
        selected,
        hoverElement,
        setHoverElement,
      }) ?? null
    );
  }
);

function SortableElementItem(props) {
  return <SortableElementShell {...props} />;
}

function resolveDeleteElementName(id, layouts) {
  if (!id) return "Item";
  if (typeof id === "object") {
    if (id.nestID && id.spnID) return "Mini Span";
    if (id.spnID && !id.nestID) return "Span";
    return "Column";
  }
  const section = Array.isArray(layouts)
    ? layouts.find((l) => l.container?.id === id)
    : null;
  if (section?.splitRowId) return "Split Section";
  if (section?.columns) return "Section";
  return "Header";
}

function BuilderConfirmModal({ data, close, layouts }) {
  const id = data?.id;
  const deleteFn = data?.funct;
  const open = Boolean(id) && typeof deleteFn === "function";
  const elementName = resolveDeleteElementName(id, layouts);

  const closeModal = () => {
    close?.();
  };

  const confirmDelete = () => {
    if (!open) return;
    closeModal();
    deleteFn(id);
  };

  return (
    <Modal
      open={open}
      onClose={closeModal}
      aria-labelledby="basic-modal-title"
      aria-describedby="basic-modal-desc"
      slotProps={{ backdrop: { timeout: 200 } }}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
    >
      <Fade in={open} timeout={200}>
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
              <span className="text-red-600 dark:text-emerald-300">Delete</span>{" "}
              {elementName}
            </div>
            <div>
              <button
                type="button"
                onClick={closeModal}
                className="cursor-pointer bg-transparent p-0 text-[14px]"
              >
                X
              </button>
            </div>
          </div>
          <div className="border-b border-dotted border-gray-500/50 flex-1" />
          <div className="flex justify-center mt-4 text-[13px]">
            คุณต้องการลบ {elementName} นี้ใช่หรือไม่?
          </div>

          <div className="flex justify-center my-4 pb-5">
            <Button
              data-perf-control="ลบ"
              sx={{
                backgroundColor: "#B91C1C",
                color: "white",
                fontSize: 13,
                fontWeight: "normal",
                height: 25,
                padding: "15px 12px",
                marginRight: 1,
              }}
              onClick={confirmDelete}
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
              onClick={closeModal}
            >
              ยกเลิก
            </Button>
          </div>
        </Box>
      </Fade>
    </Modal>
  );
}

const clonePresetElement = (item) => {
  try {
    if (typeof structuredClone === "function") return structuredClone(item);
    return JSON.parse(JSON.stringify(item));
  } catch {
    return lodash.cloneDeep(item);
  }
};

const makePresetElementId = (originalId) => {
  const prefix = String(originalId || "Ele").split("-")[0] || "Ele";
  return `${prefix}-${Math.ceil(Math.random() * 1e9).toString(36)}`;
};

const rewritePresetElementList = (list) =>
  (Array.isArray(list) ? list : [])
    .filter(
      (item) => item && typeof item === "object" && typeof item.type === "string"
    )
    .map((item) => ({
      ...clonePresetElement(item),
      id: makePresetElementId(item?.id),
    }));

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

const ColumnPresetLoadModal = React.memo(function ColumnPresetLoadModal({
  open,
  presets,
  error,
  onClose,
  onLoad,
  onDelete,
}) {
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [list, setList] = useState(presets || []);
  const [localError, setLocalError] = useState("");
  const [visible, setVisible] = useState(Boolean(open));
  const notifyParentOnExitRef = useRef(false);
  useEffect(() => {
    if (open) {
      notifyParentOnExitRef.current = false;
      setVisible(true);
      setDeleteConfirmId(null);
      setList(presets || []);
      setLocalError("");
      return;
    }
    setVisible(false);
  }, [open, presets]);
  const displayError = localError || error;
  const requestClose = () => {
    notifyParentOnExitRef.current = true;
    setVisible(false);
  };
  const handleExited = () => {
    if (!notifyParentOnExitRef.current) return;
    notifyParentOnExitRef.current = false;
    onClose();
  };
  const confirmDelete = (presetId) => {
    const result = onDelete(presetId);
    if (result?.ok) {
      setList(Array.isArray(result.presets) ? result.presets : []);
      setLocalError("");
    } else {
      setLocalError(result?.error || "ลบ PRESET ไม่สำเร็จ กรุณาลองใหม่");
    }
    setDeleteConfirmId(null);
  };
  return (
    <Modal
      open={visible}
      onClose={(_, reason) => {
        if (reason === "backdropClick") return;
        requestClose();
      }}
      aria-labelledby="column-preset-load-modal-title"
      slotProps={{ backdrop: { timeout: 180 } }}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
    >
      <Fade in={visible} timeout={180} onExited={handleExited}>
        <Box
          data-builder-modal="preset-load"
          role="dialog"
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
            <div
              id="column-preset-load-modal-title"
              className="text-[15px] font-bold text-[#333333]"
            >
              โหลด PRESET
            </div>
            <button
              type="button"
              aria-label="ปิด"
              data-perf-control="ปิด"
              className="inline-flex items-center justify-center text-[13px] font-semibold text-[#6b7280] transition-colors hover:text-[#374151]"
              onClick={requestClose}
            >
              X
            </button>
          </div>
          {displayError ? (
            <div className="mb-2 text-[12px] text-red-600">{displayError}</div>
          ) : null}
          <div className="max-h-[44vh] overflow-y-auto rounded-md border border-gray-200">
            {list.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {list.map((preset) => (
                  <div
                    key={preset?.id || Math.random().toString(36)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 transition-colors hover:bg-gray-50"
                  >
                    <button
                      type="button"
                      data-perf-control="โหลด PRESET"
                      className="flex min-w-0 flex-1 items-center justify-between rounded-md pl-1 pr-2 py-1.5 text-left transition-colors hover:bg-gray-100"
                      onClick={() => {
                        setDeleteConfirmId(null);
                        onLoad(preset);
                      }}
                    >
                      <span className="min-w-0 flex items-center gap-1.5">
                        <Gem className="size-3.5 shrink-0 text-gray-300" />
                        <span className="truncate text-[13px] text-[#333333]">
                          {formatPresetDisplayName(preset?.name)}
                        </span>
                      </span>
                      <span className="shrink-0 pl-2 text-[11px] text-gray-400">
                        {preset?.updatedAt
                          ? formatPresetUpdatedAt(preset.updatedAt)
                          : ""}
                      </span>
                    </button>
                    {deleteConfirmId === preset?.id ? (
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          data-perf-control="ยกเลิก"
                          className="rounded-md border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] text-gray-500 transition-colors hover:bg-gray-50"
                          onClick={() => {
                            setDeleteConfirmId(null);
                          }}
                        >
                          ยกเลิก
                        </button>
                        <button
                          type="button"
                          data-perf-control="ยืนยันลบ PRESET"
                          className="rounded-md border border-[#b81c1c] bg-[#b81c1c] px-1.5 py-0.5 text-[10px] text-white transition-colors hover:bg-[#a61919]"
                          onClick={() => {
                            confirmDelete(preset?.id);
                          }}
                        >
                          ลบ
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        aria-label="ลบ PRESET"
                        data-perf-control="ลบ PRESET"
                        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-500"
                        onClick={() => {
                          setDeleteConfirmId(preset?.id || null);
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
              data-perf-control="ปิด"
              onClick={requestClose}
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
  );
});

const ColumnPresetSaveModal = React.memo(function ColumnPresetSaveModal({
  open,
  defaultName,
  error,
  onClose,
  onSave,
}) {
  const [name, setName] = useState(defaultName || "");
  const [localError, setLocalError] = useState("");
  const [visible, setVisible] = useState(Boolean(open));
  const notifyParentOnExitRef = useRef(false);
  useEffect(() => {
    if (open) {
      notifyParentOnExitRef.current = false;
      setVisible(true);
      setName(defaultName || "");
      setLocalError("");
      return;
    }
    setVisible(false);
  }, [open, defaultName]);
  const displayError = localError || error;
  const requestClose = () => {
    notifyParentOnExitRef.current = true;
    setVisible(false);
  };
  const handleExited = () => {
    if (!notifyParentOnExitRef.current) return;
    notifyParentOnExitRef.current = false;
    onClose();
  };
  const submit = () => {
    const trimmed = String(name || "").trim();
    if (!trimmed) {
      setLocalError("กรุณาตั้งชื่อ PRESET");
      return;
    }
    onSave(trimmed);
  };
  return (
    <Modal
      open={visible}
      onClose={(_, reason) => {
        if (reason === "backdropClick") return;
        requestClose();
      }}
      aria-labelledby="column-preset-modal-title"
      aria-describedby="column-preset-modal-desc"
      slotProps={{ backdrop: { timeout: 180 } }}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
    >
      <Fade in={visible} timeout={180} onExited={handleExited}>
        <Box
          data-builder-modal="preset-save"
          role="dialog"
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
            <div
              id="column-preset-modal-title"
              className="text-[15px] font-bold text-[#333333]"
            >
              บันทึก PRESET
            </div>
            <button
              type="button"
              aria-label="ปิด"
              data-perf-control="ปิด"
              className="inline-flex items-center justify-center text-[13px] font-semibold text-[#6b7280] transition-colors hover:text-[#374151]"
              onClick={requestClose}
            >
              X
            </button>
          </div>
          <input
            type="text"
            name="ชื่อ PRESET"
            data-perf-control="ชื่อ PRESET"
            autoFocus
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (localError) setLocalError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="ชื่อ PRESET"
            className="mb-2 w-full rounded-md border border-gray-300 px-3 py-2 text-[13px] text-[#333333] placeholder:text-[#333333] outline-none ring-0 focus:border-gray-300 focus:ring-0 focus-visible:ring-0"
          />
          {displayError ? (
            <div className="mb-2 text-[12px] text-red-600">{displayError}</div>
          ) : null}
          <div className="mt-3 flex justify-end gap-2">
            <Button
              data-perf-control="ยกเลิก"
              onClick={requestClose}
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
              data-perf-control="บันทึก"
              onClick={submit}
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
  );
});

function BuilderAlertModal({ open, onClose }) {
  const isOpen = Boolean(open);
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="basic-modal-title"
      aria-describedby="basic-modal-desc"
      slotProps={{ backdrop: { timeout: 200 } }}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
    >
      <Fade in={isOpen} timeout={200}>
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
              <span className="text-red-600 dark:text-emerald-300">คำเตือน !!!</span>{" "}
            </div>
            <div>
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer bg-transparent p-0 text-[14px]"
              >
                X
              </button>
            </div>
          </div>
          <div className="border-b border-dotted border-gray-500/50 flex-1" />
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

function CanvasLayoutModeFlag() {
  const builderMode = useBuilderContextStore((state) => state.builderMode);
  const device = useBuilderContextStore((state) => state.device);
  useLayoutEffect(() => {
    const canvas = document.querySelector("[data-builder-canvas='true']");
    if (!canvas) return;
    canvas.classList.toggle(
      "is-layout-desktop",
      device === "Desktop" && builderMode === "Layout Mode"
    );
  }, [builderMode, device]);
  return null;
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
  builderMode: builderModeProp,
  patchElementRef,
  openListBoxTextEditRef,
  isPreview = false,
}) => {
  const layouts = useMemo(() => {
    const source = Array.isArray(layoutsProp) ? layoutsProp : [];
    const normalized = normalizeSpanStructure(source);
    if (normalized !== source && isScopedLayoutSnapshot(source)) {
      markScopedLayoutSnapshot(normalized);
    }
    return normalized;
  }, [layoutsProp]);
  const builderMode =
    builderModeProp ?? useBuilderContextStore.getState().builderMode;
  const isLayoutMode = builderMode === "Layout Mode";
  const builderModeRef = useRef(builderMode);
  builderModeRef.current = builderMode;
  useEffect(() => {
    return useBuilderContextStore.subscribe((state) => {
      builderModeRef.current = state.builderMode;
    });
  }, []);
  const isPreviewCleanMode = isPreview;
  const structuralOptionStoreRef = useRef(null);
  if (!structuralOptionStoreRef.current) {
    structuralOptionStoreRef.current = createStructuralOptionStore();
  }
  const elementSelectionStoreRef = useRef(null);
  if (!elementSelectionStoreRef.current) {
    elementSelectionStoreRef.current = createElementSelectionStore();
  }
  const previewAuditMode =
    isPreview &&
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("audit") === "1";

  // useState

  // การแสดงHTML
  const [activeID, setActiveID] = useState(null); // เก็บค่าid ของ layout ที่กำลัง Drag&Drop
  const [activeItem, setActiveItem] = useState(null); // เก็บ JSON HTML ของ layout ที่กำลัง Drag&Drop
  const activeItemRef = useRef(null);
  const scopedColumnDragOwnerRef = useRef("");
  const [modal, setModal] = useState(null); // ตัวแปรควบคุมการเปิดปิดของ Confirm Modal
  const [alert, setAlert] = useState(false); // ตัวแปรควบคุมการเปิดปิดของ Confirm Modal
  const [preview, setPreview] = useState(null); // เก็บ JSON HTML ของ layout ใหม่ที่กำลังนำมาวาง
  const structuralRenderRevision = useMemo(
    () => ({
      controlsVisible: device === "Desktop",
    }),
    [device]
  );
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
  const applyColumnPresetToTargetRef = useRef(null);
  const closeColumnPresetLoadModalRef = useRef(null);
  const deleteColumnPresetFromLocalStorageRef = useRef(null);
  const handleLoadColumnPreset = useCallback((preset) => {
    applyColumnPresetToTargetRef.current?.(preset);
  }, []);
  const handleCloseColumnPresetLoadModal = useCallback(() => {
    closeColumnPresetLoadModalRef.current?.();
  }, []);
  const handleDeleteColumnPreset = useCallback((presetId) => {
    return deleteColumnPresetFromLocalStorageRef.current?.(presetId);
  }, []);
  /** เป้าหมายวาง ELEMENT จาก sidebar — ใช้ซ่อน badge Col/Span/Mini ตอนลากเข้าช่อง */
  const [elementDropHighlight, setElementDropHighlight] = useState(null);
  const [dropRenderKey, setDropRenderKey] = useState("");
  // Drag&Drop
  const [isDraggingLayout, setIsDraggingLayout] = useState(false); // เก็บค่าสถานะการ Drag&Drop (true = กำลังทำ / false = w,jwfhme)
  const [suppressDropMotion, setSuppressDropMotion] = useState(false);
  // ฟังก์ชันเกี่ยวกับ Layout
  const [selectID, commitSelectID] = useState({
    ids:{},
    status:""
  }); // เก็บค่าid ของ ele ที่กำลังจะแก้ไข
  const selectIDRef = useRef(selectID);
  selectIDRef.current = selectID;
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
  const [builderSectionPerfEnabled] = useState(
    () =>
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get(
        OFFSCREEN_SECTION_BENCHMARK_QUERY_PARAM
      ) === "1"
  );
  const [dataSliderPerfEnabled] = useState(
    () =>
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get(
        DATA_SLIDER_PERF_QUERY_PARAM
      ) === "1"
  );
  const [structurePerfEnabled] = useState(
    () =>
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get(
        STRUCTURE_PERF_QUERY_PARAM
      ) === "1"
  );
  const [categoriesPerfEnabled] = useState(
    () =>
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get(
        CATEGORIES_PERF_QUERY_PARAM
      ) === "1"
  );
  const [tabsPerfEnabled] = useState(
    () =>
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get(TABS_PERF_QUERY_PARAM) ===
        "1"
  );
  const [accordionPerfEnabled] = useState(
    () =>
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get(
        ACCORDION_PERF_QUERY_PARAM
      ) === "1"
  );
  const [postPerfEnabled] = useState(
    () =>
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get(POST_PERF_QUERY_PARAM) ===
        "1"
  );
  const [listItemsPerfEnabled] = useState(
    () => {
      if (typeof window === "undefined") return false;
      const params = new URLSearchParams(window.location.search);
      return (
        params.get(LIST_ITEMS_PERF_QUERY_PARAM) === "1" ||
        params.get("listIconsPerf") === "1" ||
        params.get("listImagesPerf") === "1" ||
        params.get("listBoxPerf") === "1" ||
        params.get("carouselPerf") === "1" ||
        params.get("dataTablePerf") === "1" ||
        params.get("betweenPerf") === "1" ||
        params.get("imageHoverPerf") === "1" ||
        params.get("overlayPerf") === "1" ||
        params.get("textPerf") === "1" ||
        params.get("headingPerf") === "1" ||
        params.get("buttonGroupPerf") === "1"
      );
    }
  );
  const [builderHoverPerfEnabled] = useState(
    () =>
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("builderSectionPerf") ===
        "1"
  );
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
  const useScopedColumnDnd = canvasLayoutCounts.elements >= 250;
  const benchmarkOffscreenSections =
    builderSectionPerfEnabled &&
    canvasLayoutCounts.total >= OFFSCREEN_SECTION_BENCHMARK_MIN_WEIGHTED_ITEMS &&
    canvasLayoutCounts.sections >= OFFSCREEN_SECTION_BENCHMARK_MIN_SECTIONS;
  // CSS content-visibility does not skip React reconciliation and changing it
  // around DnD makes section profiling harder to interpret. Keep the normal
  // rendering path unchanged and leave the experiment disabled.
  const offscreenSectionExperimentEnabled = false;
  const offscreenEligibleSectionCount = useMemo(() => {
    if (!offscreenSectionExperimentEnabled) return 0;
    let count = 0;
    for (let index = 0; index < layouts.length; index += 1) {
      const layout = layouts[index];
      if (!layout?.splitRowId) {
        if (isOffscreenSectionEligible(layout)) count += 1;
        continue;
      }
      if (layout.splitSide !== "left") continue;
      const splitRowId = layout.splitRowId;
      const splitLayouts = [];
      for (
        let splitIndex = index;
        splitIndex < layouts.length &&
        layouts[splitIndex]?.splitRowId === splitRowId;
        splitIndex += 1
      ) {
        splitLayouts.push(layouts[splitIndex]);
      }
      if (
        splitLayouts.length > 0 &&
        splitLayouts.every(isOffscreenSectionEligible)
      ) {
        count += 1;
      }
    }
    return count;
  }, [layouts, offscreenSectionExperimentEnabled]);

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
    // สถานะปกติใช้สีเดียวกับปุ่ม Header (CTA)
    if (canvasTotalTone === "green") {
      return `${base}dash-button border-transparent hover:opacity-90 focus-visible:ring-[color-mix(in_srgb,var(--dash-header-button,#374151)_45%,transparent)]`;
    }
    if (canvasTotalTone === "yellow") {
      return `${base}border-yellow-600/90 bg-yellow-400 text-yellow-950 hover:bg-yellow-500 focus-visible:ring-yellow-300/90 dark:border-yellow-500/80 dark:bg-yellow-500 dark:text-yellow-950 dark:hover:bg-yellow-400`;
    }
    return `${base}text-white border-red-700/90 bg-red-600 hover:bg-red-700 focus-visible:ring-red-400/80 dark:border-red-500/80 dark:bg-red-700 dark:hover:bg-red-600`;
  }, [canvasTotalTone]);

 

  // useRef

  // การแสดงHTML
  const ghostRef = useRef(null); // เก็บ Ref ของ Ghost ที่จำลองตำแหน่งการวาง Layout ใหม่
  const sidebarPreviewHostRef = useRef(null);
  const sidebarPreviewRootRef = useRef(null);
  const sidebarPreviewMoveRef = useRef({ frame: null, pending: null });
  const sidebarPortalPreviewRef = useRef(null);
  const clearSidebarPortalPreviewRef = useRef(null);
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
  const sectionOffscreenSyncPausedRef = useRef(false);
  const offscreenSectionNodesRef = useRef(new Map());
  const offscreenSectionKeyByNodeRef = useRef(new WeakMap());
  const offscreenSectionSizeCacheRef = useRef(new Map());
  const offscreenSectionResizeObserverRef = useRef(null);
  // การควบคุม Hover เพื่อใช้งานฟังก์ชัน
  const hoverRef = useRef(null); // สำหรับควบคุมฟังก์ชัน updateHoverFromPoint(การวาง Layout ใหม่)
  const dropHoldUntilRef = useRef(0); // กันหลุด drop target ทันทีเมื่อเมาส์เฉี่ยวขอบ
  const btnGroupRef = useRef(null); // สำหรับควบคุมฟังก์ชัน updateHoverPosition(การแสดง Option Button Group)
  // การเก็บค่า
  const positionRef = useRef(null); // เก็บตำแหน่งเดิมของ container เมื่อ Drag&Drop ele
  const dragToken = useRef(0); // เก็บtoken เพื่อสั่งหยุด hoverRef
  const dropCommitGuardRef = useRef({ token: -1, at: 0 });
  const lastDropHandledAtRef = useRef(0);
  const dropMotionTimerRef = useRef(null);
  const windowDropHandlerRef = useRef(null);
  const lastHandledDragOverEventRef = useRef(null);
  const scopedElementPlaceholderRef = useRef(null);
  const scopedElementPlaceholderTargetKeyRef = useRef("");
  const scopedElementPlaceholderCommitRef = useRef({
    frame: null,
    pending: null,
  });
  const scopedElementFlipRef = useRef({
    states: new WeakMap(),
    activeNodes: new Set(),
  });
  const sidebarNewElementFlipRef = useRef({
    previousConI: null,
    preview: null,
    targetKey: "",
  });
  const sidebarPreviewIdentityRef = useRef({
    ids: new WeakMap(),
    nextId: 1,
  });
  const sidebarNativeDragPerfRef = useRef(null);
  const sidebarNativeDropPerfRef = useRef(null);
  const dataSliderPanelUpdatePerfRef = useRef(null);
  const finishSidebarNativeDragPerfRef = useRef(null);
  useEffect(
    () => () => {
      const commit = scopedElementPlaceholderCommitRef.current;
      if (commit.frame != null) cancelAnimationFrame(commit.frame);
      commit.frame = null;
      commit.pending = null;
      for (const node of [...scopedElementFlipRef.current.activeNodes]) {
        scopedElementFlipRef.current.states.get(node)?.cancel?.();
      }
      const placeholder = scopedElementPlaceholderRef.current;
      if (placeholder?.parentNode) placeholder.parentNode.removeChild(placeholder);
      scopedElementPlaceholderRef.current = null;
      const sidebarMove = sidebarPreviewMoveRef.current;
      if (sidebarMove.frame != null) cancelAnimationFrame(sidebarMove.frame);
      sidebarMove.frame = null;
      sidebarMove.pending = null;
      const sidebarHost = sidebarPreviewHostRef.current;
      const sidebarRoot = sidebarPreviewRootRef.current;
      sidebarPreviewRootRef.current = null;
      sidebarRoot?.unmount();
      if (sidebarHost) {
        sidebarHost.ondragover = null;
        if (sidebarHost.parentNode) {
          sidebarHost.parentNode.removeChild(sidebarHost);
        }
      }
      if (ghostRef.current === sidebarHost) ghostRef.current = null;
      sidebarPreviewHostRef.current = null;
      sidebarPortalPreviewRef.current = null;
    },
    []
  );
  const incomingDragPreviewRef = useRef({
    source: null,
    pageLatestID: null,
    isCanvasElementMove: false,
    preview: null,
    type: null,
  });
  const structureDropIntentRef = useRef(null);
  const blockedDropToastRef = useRef(null);
  const inlineSortableRenderersRef = useRef({
    splitRow: null,
    container: null,
    column: null,
    span: null,
    element: null,
    structuralRenderRevision: null,
    onStructuralShellRender: null,
    onStructuralHeavyRender: null,
    onStructuralOptionVisible: null,
    onElementSelectionBoundaryRender: null,
    elementRenderRevision: null,
    getElementSortableConfig: null,
    getElementSortableSnapshot: null,
    onElementSortableDragStart: null,
    dragActive: false,
  });
  const canvasSectionRenderCacheRef = useRef(new Map());
  const canvasColumnRenderCacheRef = useRef(new Map());
  const canvasSpanRenderCacheRef = useRef(new Map());
  const canvasSectionCacheLayoutsRef = useRef(layouts);
  const canvasSectionRenderEpochRef = useRef(0);
  const canvasSectionCacheStatsRef = useRef(null);
  const elementSelectionCacheTransactionRef = useRef(null);
  const nextElementSelectionTransactionIdRef = useRef(1);
  const elementSelectionPerfSessionsRef = useRef(new Map());
  const elementDeletePerfSessionsRef = useRef(new Map());
  const nextElementDeletePerfSessionIdRef = useRef(1);
  const arrowReorderPerfRef = useRef(null);
  const sizeChangePerfRef = useRef(null);
  const clonePerfRef = useRef(null);
  const deletePerfRef = useRef(null);
  const columnSplitPerfRef = useRef(null);
  const pendingCanvasPerformanceTransactionsRef = useRef(new Set());
  const beginCanvasPerformanceTransaction = useCallback(
    (
      kind,
      {
        label,
        elementType,
        elementId,
        scope,
        skipInitialFrameGap = false,
      }
    ) => {
      if (!isBuilderPerformanceEnabled()) return null;
      setBuilderPerformanceTarget(elementType, elementId);
      const transactionId = beginBuilderPerformanceTransaction(
        kind,
        { label, elementType, elementId, scope },
        { trackFrames: true, skipInitialFrameGap }
      );
      if (transactionId != null) {
        pendingCanvasPerformanceTransactionsRef.current.add(transactionId);
      }
      return transactionId;
    },
    []
  );
  const presetUiCacheRef = useRef({ active: false });
  const confirmModalUiCacheRef = useRef({ active: false });
  const textEditModalUiCacheRef = useRef({ active: false });
  const spanStructurePerfSessionsRef = useRef(new Map());
  const nextSpanStructurePerfSessionIdRef = useRef(1);
  const startSpanStructurePerfSession = (operation, details = {}) => {
    const isClone = operation === "ADD";
    const isDelete =
      operation === "DELETE" || operation === "COLLAPSE_TO_COLUMN";
    if (isClone || isDelete) {
      const targetId =
        details.sourceSpanId || details.targetSpanId || details.removedSpanId;
      beginCanvasPerformanceTransaction(
        isClone ? "canvas-clone" : "canvas-delete",
        {
          label: isClone
            ? `ทำสำเนา Span / ${String(targetId || "")}`
            : `ลบ Span / ${String(targetId || "")}`,
          elementType: "span",
          elementId: targetId,
          scope: [details.containerId, details.columnId, targetId]
            .filter(Boolean)
            .join("/"),
          skipInitialFrameGap: isClone || isDelete,
        }
      );
    }
    if (!builderSectionPerfEnabled) return null;
    const session = {
      id: nextSpanStructurePerfSessionIdRef.current++,
      operation,
      startedAt: performance.now(),
      preparationMs: 0,
      sourceSpanId: null,
      targetSpanId: null,
      createdSpanId: null,
      removedSpanId: null,
      copiedElementCount: 0,
      removedElementCount: 0,
      movedElementCount: 0,
      remainingSpanCount: null,
      canvasCommits: 0,
      canvasActualMs: 0,
      canvasMaxMs: 0,
      cacheHits: 0,
      cacheMisses: 0,
      cacheMissReasons: {},
      ...details,
    };
    spanStructurePerfSessionsRef.current.set(session.id, session);
    return session;
  };
  const presetPerfSessionsRef = useRef(new Map());
  const nextPresetPerfSessionIdRef = useRef(1);
  const markPresetUiInteraction = () => {
    presetUiCacheRef.current.active = true;
  };
  const startPresetPerfSession = (operation, details = {}) => {
    if (!builderSectionPerfEnabled) return null;
    const session = {
      id: nextPresetPerfSessionIdRef.current++,
      operation,
      startedAt: performance.now(),
      preparationMs: 0,
      storageReadMs: 0,
      storageWriteMs: 0,
      serializeMs: 0,
      payloadBytes: 0,
      presetCount: 0,
      loadedElementCount: 0,
      copiedElementCount: 0,
      canvasProfilerCommits: 0,
      canvasProfilerActualMs: 0,
      canvasProfilerMaxMs: 0,
      sectionCacheHits: 0,
      sectionCacheMisses: 0,
      sectionCacheMissReasons: {},
      ...details,
    };
    presetPerfSessionsRef.current.set(session.id, session);
    return session;
  };
  const canvasSectionPreviousDragRef = useRef({
    active: false,
    type: "",
  });
  const contentRenderSignalsRef = useRef(null);
  const contentDndLifecycleRef = useRef({
    phase: "idle",
    dragType: "",
    dragStartedAt: null,
    firstMoveAt: null,
    lastMoveAt: null,
    dropStartedAt: null,
    dropHandlerCompletedAt: null,
    layoutCommitObservedAt: null,
    cleanupAt: null,
  });
  const markContentDndLifecycle = (phase, dragType = "") => {
    if (!builderSectionPerfEnabled) return;
    const now = performance.now();
    const lifecycle = contentDndLifecycleRef.current;
    if (phase === "drag-start") {
      contentDndLifecycleRef.current = {
        phase,
        dragType: String(dragType || "UNKNOWN"),
        dragStartedAt: now,
        firstMoveAt: null,
        lastMoveAt: null,
        dropStartedAt: null,
        dropHandlerCompletedAt: null,
        layoutCommitObservedAt: null,
        cleanupAt: null,
      };
      return;
    }
    lifecycle.phase = phase;
    if (phase === "active-move") {
      if (lifecycle.firstMoveAt == null) lifecycle.firstMoveAt = now;
      lifecycle.lastMoveAt = now;
    } else if (phase === "drop") {
      lifecycle.dropStartedAt = now;
    } else if (phase === "drop-handler-complete") {
      lifecycle.dropHandlerCompletedAt = now;
    } else if (phase === "post-drop-cleanup") {
      lifecycle.cleanupAt = now;
      if (lifecycle.dropStartedAt == null) lifecycle.phase = "cleanup";
    }
  };
  const logicalSectionKeyForElementSelection = useCallback(
    (rawIds) => {
      const ids = rawIds || {};
      let containerId = ids.conID;
      if (containerId == null && ids.tabsHostId != null) {
        const hostLocation = findLayoutElementListIndex(
          layouts,
          ids.tabsHostId
        );
        containerId = layouts[hostLocation?.conI]?.container?.id;
      }
      if (containerId == null) return null;
      const layout = layouts.find(
        (entry) =>
          String(entry?.container?.id ?? "") === String(containerId)
      );
      if (!layout) return null;
      return String(layout.splitRowId || layout.container?.id);
    },
    [layouts]
  );
  const setSelectID = useCallback(
    (update, options = null) => {
      const previous = selectIDRef.current;
      const next =
        typeof update === "function" ? update(previous) : update;
      if (next == null || Object.is(previous, next)) return;
      const selectionIdentity = (selection) => {
        const ids = selection?.ids || {};
        return [
          selection?.status || "",
          ids.conID,
          ids.colID,
          ids.spnID,
          ids.nestID,
          ids.eleID,
          ids.tabsHostId,
          ids.tabId,
        ]
          .map((value) => String(value ?? ""))
          .join("/");
      };
      const previousIdentity = selectionIdentity(previous);
      const nextIdentity = selectionIdentity(next);
      const selectionChanged = previousIdentity !== nextIdentity;
      if (selectionChanged && options?.performanceTransaction !== false) {
        const targetSelection = next?.status ? next : previous;
        const targetIds = targetSelection?.ids || {};
        const elementType = targetIds.eleID
          ? "element"
          : targetIds.nestID
            ? "nested-span"
            : targetIds.spnID
              ? "span"
              : targetIds.colID
                ? "column"
                : targetIds.conID
                  ? "section"
                  : "selection";
        const elementId =
          targetIds.eleID ??
          targetIds.nestID ??
          targetIds.spnID ??
          targetIds.colID ??
          targetIds.conID ??
          "";
        const scope = [
          targetIds.conID,
          targetIds.colID,
          targetIds.spnID,
          targetIds.nestID,
          targetIds.tabsHostId,
          targetIds.tabId,
        ]
          .filter((value) => value != null && value !== "")
          .join("/");
        beginCanvasPerformanceTransaction("canvas-selection", {
          label: next?.status
            ? `เลือกบน Canvas / ${String(elementId || next.status)}`
            : `ยกเลิกการเลือกบน Canvas / ${String(elementId || "")}`,
          elementType,
          elementId,
          scope,
          skipInitialFrameGap: true,
        });
      }
      selectIDRef.current = next;

      const previousSelected =
        previous?.status === "Delete" && previous?.ids?.eleID != null;
      const nextSelected =
        next?.status === "Delete" && next?.ids?.eleID != null;
      const previousSelectionKey = previousSelected
        ? elementSelectionKey(previous.ids)
        : "";
      const nextSelectionKey = nextSelected
        ? elementSelectionKey(next.ids)
        : "";
      if (
        previousSelectionKey !== nextSelectionKey &&
        (previousSelected || nextSelected)
      ) {
        const transactionId =
          nextElementSelectionTransactionIdRef.current++;
        const targetKeys = new Set();
        if (previousSelected) {
          const previousKey = logicalSectionKeyForElementSelection(
            previous.ids
          );
          if (previousKey != null) targetKeys.add(previousKey);
        }
        if (nextSelected) {
          const nextKey = logicalSectionKeyForElementSelection(next.ids);
          if (nextKey != null) targetKeys.add(nextKey);
        }
        elementSelectionCacheTransactionRef.current = {
          id: transactionId,
          targetKeys,
          nextSelection: next,
        };
        if (builderSectionPerfEnabled) {
          elementSelectionPerfSessionsRef.current.set(transactionId, {
            id: transactionId,
            operation:
              previousSelected && nextSelected
                ? "SWITCH"
                : nextSelected
                  ? "SELECT"
                  : "CLEAR",
            previousElementId: previousSelected
              ? previous.ids.eleID
              : null,
            nextElementId: nextSelected ? next.ids.eleID : null,
            previousContainerId: previousSelected
              ? previous.ids.conID ?? previous.ids.tabsHostId ?? null
              : null,
            nextContainerId: nextSelected
              ? next.ids.conID ?? next.ids.tabsHostId ?? null
              : null,
            targetedLogicalSectionCount: targetKeys.size,
            startedAt: performance.now(),
            clickToCommitWallMs: 0,
            canvasCommits: 0,
            canvasActualMs: 0,
            canvasMaxMs: 0,
            cacheHits: 0,
            cacheMisses: 0,
            cacheMissReasons: {},
            selectedBoundaryRenderCount: 0,
          });
        }
      }
      elementSelectionStoreRef.current.publish(previous, next);
      commitSelectID(next);
    },
    [
      builderSectionPerfEnabled,
      beginCanvasPerformanceTransaction,
      commitSelectID,
      logicalSectionKeyForElementSelection,
    ]
  );
  canvasSectionRenderEpochRef.current += 1;
  canvasSectionCacheStatsRef.current = {
    renderEpoch: canvasSectionRenderEpochRef.current,
    cacheHits: 0,
    cacheMisses: 0,
    missReasons: {},
    columnRenderCacheHits: 0,
    columnRenderCacheMisses: 0,
    columnRenderCacheMissReasons: {},
    rebuiltColumnCount: 0,
    layoutsRootChanged: canvasSectionCacheLayoutsRef.current !== layouts,
  };
  const currentDropElement = handleDropElement();
  const inlineDragActive = Boolean(
    inlineSortableRenderersRef.current.dragActive
  );
  const activeDragType = String(
    activeDragRef.current?.data?.current?.type || ""
  );
  const dragRenderActive = Boolean(
    preview ||
      sidebarPortalPreviewRef.current ||
      isDraggingLayout ||
      inlineDragActive
  );
  const elementCanvasDragRenderActive = Boolean(
    dragRenderActive &&
      inlineDragActive &&
      activeDragType === "ELEMENT" &&
      activeDragRef.current
  );
  const sidebarIsolatedSectionPreviewActive = Boolean(
    !activeDragRef.current &&
      dropTargetRef.current?.type === "SECTION" &&
      (sidebarPortalPreviewRef.current ||
        sidebarPreviewHostRef.current ||
        sidebarNewElementFlipRef.current.targetKey)
  );
  const sidebarPreviewRenderActive = Boolean(
    dragRenderActive &&
      inlineDragActive &&
      (sidebarPortalPreviewRef.current ||
        sidebarPreviewHostRef.current ||
        sidebarNewElementFlipRef.current.targetKey) &&
      !sidebarIsolatedSectionPreviewActive
  );
  const sidebarSectionDropRenderActive = Boolean(
    dragRenderActive &&
      (preview || sidebarIsolatedSectionPreviewActive) &&
      dropTargetRef.current?.type === "SECTION" &&
      !activeDragRef.current
  );
  const reusePostElementDropCache = Boolean(
    canvasSectionCacheStatsRef.current.layoutsRootChanged &&
      !dragRenderActive &&
      canvasSectionPreviousDragRef.current.active &&
      canvasSectionPreviousDragRef.current.type === "ELEMENT"
  );
  // The exact marked root is authoritative across React render retries.
  // A prior attempt may already have advanced canvasSectionCacheLayoutsRef,
  // making layoutsRootChanged false before the committed attempt.
  const scopedLayoutSnapshotMatched = isScopedLayoutSnapshot(layouts);
  const scopedLayoutCacheActive = scopedLayoutSnapshotMatched;
  const elementSelectionTransaction =
    elementSelectionCacheTransactionRef.current;
  const elementSelectionCacheActive = Boolean(
    elementSelectionTransaction &&
      !canvasSectionCacheStatsRef.current.layoutsRootChanged &&
      Object.is(elementSelectionTransaction.nextSelection, selectID)
  );
  const presetUiCacheActive =
    (presetUiCacheRef.current.active ||
      columnPresetModal.open ||
      columnPresetLoadModal.open) &&
    !canvasSectionCacheStatsRef.current.layoutsRootChanged;
  const confirmModalUiCacheActive =
    (confirmModalUiCacheRef.current.active || Boolean(modal)) &&
    !canvasSectionCacheStatsRef.current.layoutsRootChanged;
  if (textEditModal) textEditModalUiCacheRef.current.active = true;
  const textEditModalUiCacheActive =
    (textEditModalUiCacheRef.current.active || Boolean(textEditModal)) &&
    !canvasSectionCacheStatsRef.current.layoutsRootChanged;
  const pendingFinalCommitObserved =
    canvasSectionCacheStatsRef.current.layoutsRootChanged &&
    hasPendingPanelLayoutCommit()
    ? observePendingPanelLayoutCommits() > 0
    : false;
  const modeSwitchCacheRef = useRef({
    builderMode,
    device,
    theme,
    isPreview,
    allow: false,
  });
  const modeSwitchExtrasUnchanged =
    modeSwitchCacheRef.current.device === device &&
    modeSwitchCacheRef.current.theme === theme &&
    modeSwitchCacheRef.current.isPreview === isPreview &&
    !canvasSectionCacheStatsRef.current.layoutsRootChanged;
  if (
    modeSwitchCacheRef.current.builderMode !== builderMode &&
    modeSwitchExtrasUnchanged
  ) {
    modeSwitchCacheRef.current.allow = true;
  }
  if (!modeSwitchExtrasUnchanged) {
    modeSwitchCacheRef.current.allow = false;
  }
  modeSwitchCacheRef.current.builderMode = builderMode;
  modeSwitchCacheRef.current.device = device;
  modeSwitchCacheRef.current.theme = theme;
  modeSwitchCacheRef.current.isPreview = isPreview;
  const modeSwitchCacheActive = modeSwitchCacheRef.current.allow;
  const canReuseSectionCache =
    dragRenderActive ||
    reusePostElementDropCache ||
    scopedLayoutCacheActive ||
    elementSelectionCacheActive ||
    presetUiCacheActive ||
    confirmModalUiCacheActive ||
    textEditModalUiCacheActive ||
    modeSwitchCacheActive;
  canvasSectionCacheStatsRef.current.dragRenderActive = dragRenderActive;
  canvasSectionCacheStatsRef.current.activeDragType = activeDragType;
  canvasSectionCacheStatsRef.current.elementCanvasDragRenderActive =
    elementCanvasDragRenderActive;
  canvasSectionCacheStatsRef.current.sidebarPreviewRenderActive =
    sidebarPreviewRenderActive;
  canvasSectionCacheStatsRef.current.sidebarSectionDropRenderActive =
    sidebarSectionDropRenderActive;
  canvasSectionCacheStatsRef.current.reusePostElementDropCache =
    reusePostElementDropCache;
  canvasSectionCacheStatsRef.current.scopedLayoutCacheActive =
    scopedLayoutCacheActive;
  canvasSectionCacheStatsRef.current.elementSelectionCacheActive =
    elementSelectionCacheActive;
  canvasSectionCacheStatsRef.current.presetUiCacheActive =
    presetUiCacheActive;
  canvasSectionCacheStatsRef.current.confirmModalUiCacheActive =
    confirmModalUiCacheActive;
  canvasSectionCacheStatsRef.current.pendingFinalCommitObserved =
    pendingFinalCommitObserved;
  canvasSectionCacheStatsRef.current.scopedLayoutSnapshotMatched =
    scopedLayoutSnapshotMatched;
  canvasSectionCacheStatsRef.current.scopedLayoutSnapshotRoots =
    layouts === layoutsProp ? [layouts] : [layouts, layoutsProp];
  if (builderSectionPerfEnabled) {
    const lifecycle = contentDndLifecycleRef.current;
    const contentRenderAt = performance.now();
    if (
      canvasSectionCacheStatsRef.current.layoutsRootChanged &&
      lifecycle.dropStartedAt != null
    ) {
      lifecycle.layoutCommitObservedAt = contentRenderAt;
    }
    const currentSignals = {
      layouts,
      layoutsProp,
      preview,
      isPreview,
      isDraggingLayout,
      currentDropElement,
      currentDropElementPresent: Boolean(currentDropElement),
      inlineDragActive,
      selectID,
      selectStatus: selectID?.status ?? "",
      selectElementID: selectID?.ids?.eleID ?? null,
      activeID,
      structuralHoverTarget:
        structuralOptionStoreRef.current.getState().hoverTarget,
      pinnedSpanOptionId:
        structuralOptionStoreRef.current.getState().pinnedSpanId,
      pinnedColumnOptionId:
        structuralOptionStoreRef.current.getState().pinnedColumnId,
      positionElementSetting,
      elementDropHighlight,
      dropRenderKey,
      suppressDropMotion,
      activeItemState: activeItem,
      modal,
      alert,
      carouselColToastOpen,
      listImageColToastOpen,
      postColToastOpen,
      tabsInTabToastOpen,
      postInPostToastOpen,
      dataSliderTypeToastOpen,
      device,
      builderMode,
      theme,
      page,
      activeDrag: activeDragRef.current,
      activeDragType: String(
        activeDragRef.current?.data?.current?.type || ""
      ),
      activeItem: activeItemRef.current,
      dropTargetIndex: dropTargetRef.current?.index ?? null,
      dropTargetType: dropTargetRef.current?.type ?? null,
      dragToken: dragToken.current,
      structureDropIntent: structureDropIntentRef.current,
      scopedColumnDragOwner: scopedColumnDragOwnerRef.current,
      blockedDropToast: blockedDropToastRef.current,
      incomingDragSource: incomingDragPreviewRef.current?.source ?? null,
      incomingDragPreview: incomingDragPreviewRef.current?.preview ?? null,
      incomingDragType: incomingDragPreviewRef.current?.type ?? null,
      elementHoverIntentKey: elementHoverIntentRef.current?.key ?? "",
      sidebarPreviewIntentKey: sidebarPreviewIntentRef.current?.key ?? "",
      dndPhase: lifecycle.phase,
      dndDragStartedAt: lifecycle.dragStartedAt,
      dndFirstMoveAt: lifecycle.firstMoveAt,
      dndLastMoveAt: lifecycle.lastMoveAt,
      dndDropStartedAt: lifecycle.dropStartedAt,
      dndDropHandlerCompletedAt: lifecycle.dropHandlerCompletedAt,
      dndLayoutCommitObservedAt: lifecycle.layoutCommitObservedAt,
      dndCleanupAt: lifecycle.cleanupAt,
    };
    const previousSignals = contentRenderSignalsRef.current;
    const comparisonFor = (signal) => {
      const previousValue = previousSignals?.[signal];
      const currentValue = currentSignals[signal];
      const isReference = (value) =>
        value !== null &&
        (typeof value === "object" || typeof value === "function");
      return isReference(previousValue) || isReference(currentValue)
        ? "identity"
        : "value";
    };
    const contentChangeReasons = [];
    if (!previousSignals) {
      contentChangeReasons.push("initial-content-render");
    } else {
      for (const signal of Object.keys(currentSignals)) {
        if (!Object.is(previousSignals[signal], currentSignals[signal])) {
          contentChangeReasons.push(
            `${signal}:${comparisonFor(signal)}`
          );
        }
      }
    }
    const changed = (signal) =>
      contentChangeReasons.includes(
        `${signal}:${comparisonFor(signal)}`
      );
    const observedLayoutCommit = changed("dndLayoutCommitObservedAt");
    const observedCleanup = changed("dndCleanupAt");
    let contentRenderCausePhase = "state-update";
    if (!previousSignals) {
      contentRenderCausePhase = "initial-render";
    } else if (observedLayoutCommit && observedCleanup) {
      contentRenderCausePhase = "drop-layout-commit+cleanup";
    } else if (observedLayoutCommit) {
      contentRenderCausePhase = "drop-layout-commit";
    } else if (observedCleanup) {
      contentRenderCausePhase =
        lifecycle.dropStartedAt == null ? "cleanup" : "post-drop-cleanup";
    } else if (changed("dndDropStartedAt")) {
      contentRenderCausePhase = "drop-start";
    } else if (changed("dndLastMoveAt")) {
      contentRenderCausePhase = "active-move";
    } else if (changed("dndDragStartedAt")) {
      contentRenderCausePhase = "drag-start";
    }
    canvasSectionCacheStatsRef.current.contentChangeReasons =
      contentChangeReasons;
    canvasSectionCacheStatsRef.current.contentRenderCausePhase =
      contentRenderCausePhase;
    canvasSectionCacheStatsRef.current.contentRenderAt = contentRenderAt;
    canvasSectionCacheStatsRef.current.contentDndLifecycle = {
      ...lifecycle,
    };
    contentRenderSignalsRef.current = currentSignals;
  }
  if (canvasSectionCacheLayoutsRef.current !== layouts) {
    // Preserve entries here so per-section reference checks can reuse
    // structurally shared sections and report the exact misses. Entries are
    // overwritten below and removed when their key no longer exists.
    canvasSectionCacheLayoutsRef.current = layouts;
    const liveKeys = new Set(
      layouts.map((layout, index) =>
        String(layout?.splitRowId || layout?.container?.id || index)
      )
    );
    for (const key of canvasSectionRenderCacheRef.current.keys()) {
      if (!liveKeys.has(key)) canvasSectionRenderCacheRef.current.delete(key);
    }
    const liveColumnKeys = new Set();
    layouts.forEach((entry, sectionIndex) => {
      const sectionId = String(entry?.container?.id ?? sectionIndex);
      const branch = entry?.splitRowId ? "split" : "normal";
      (entry?.columns || []).forEach((column) => {
        liveColumnKeys.add(
          `${branch}:${sectionId}:${String(column?.id ?? "")}`
        );
      });
    });
    for (const key of canvasColumnRenderCacheRef.current.keys()) {
      if (!liveColumnKeys.has(key)) {
        canvasColumnRenderCacheRef.current.delete(key);
      }
    }
    const liveSpanKeys = new Set();
    layouts.forEach((entry, sectionIndex) => {
      const sectionId = String(entry?.container?.id ?? sectionIndex);
      const branch = entry?.splitRowId ? "split" : "normal";
      (entry?.columns || []).forEach((column) => {
        (column?.spans || []).forEach((span) => {
          liveSpanKeys.add(
            `${branch}:${sectionId}:${String(column?.id ?? "")}:${String(span?.id ?? "")}`
          );
        });
      });
    });
    for (const key of canvasSpanRenderCacheRef.current.keys()) {
      if (!liveSpanKeys.has(key)) {
        canvasSpanRenderCacheRef.current.delete(key);
      }
    }
  }
  inlineSortableRenderersRef.current.dragActive = dragRenderActive;
  canvasSectionPreviousDragRef.current = {
    active: dragRenderActive,
    type: activeDragType,
  };

  const getSectionColumnVisualCacheKey = (container) =>
    JSON.stringify([
      container?.noColumnGap,
      container?.gridBorder,
      container?.columnDividerStyle,
      container?.columnDividerOpacity,
      container?.columnDividerColor,
      container?.columnDividerVerticalLengthPercent,
    ]);

  const renderCachedColumnSubtree = (
    {
      branch,
      sectionId,
      column,
      sectionVisualKey,
      sectionIndex,
      columnIndex,
      splitIndex = -1,
      splitSide = "",
    },
    render
  ) => {
    const cacheStats = canvasSectionCacheStatsRef.current;
    const cacheKey = `${branch}:${String(sectionId)}:${String(column?.id ?? "")}`;
    const cached = canvasColumnRenderCacheRef.current.get(cacheKey);
    const cacheEnabled =
      (!dragRenderActive || sidebarSectionDropRenderActive) &&
      !isDraggingLayout;
    const canReuseUnchangedColumnDuringSectionDrop =
      sidebarSectionDropRenderActive ||
      (dropTargetRef.current?.type === "SECTION" && !activeDragRef.current);
    let missReason = "no-entry";

    if (!cacheEnabled) {
      missReason = "drag-or-preview-bypass";
      if (
        canReuseUnchangedColumnDuringSectionDrop &&
        cached &&
        cached.elementData === column &&
        cached.device === device &&
        cached.isPreview === isPreview &&
        cached.theme === theme &&
        cached.sectionVisualKey === sectionVisualKey &&
        React.isValidElement(cached.element)
      ) {
        cacheStats.columnRenderCacheHits += 1;
        return cached.element;
      }
    } else if (cached) {
      if (cached.elementData !== column) {
        missReason = "column-reference-changed";
      } else if (cached.sectionIndex !== sectionIndex) {
        missReason = "section-index-changed";
      } else if (cached.columnIndex !== columnIndex) {
        missReason = "column-index-changed";
      } else if (
        cached.splitIndex !== splitIndex ||
        cached.splitSide !== splitSide
      ) {
        missReason = "split-position-changed";
      } else if (cached.device !== device) {
        missReason = "device-changed";
      } else if (cached.isPreview !== isPreview) {
        missReason = "preview-mode-changed";
      } else if (cached.theme !== theme) {
        missReason = "theme-changed";
      } else if (cached.sectionVisualKey !== sectionVisualKey) {
        missReason = "section-column-visual-changed";
      } else {
        cacheStats.columnRenderCacheHits += 1;
        return cached.element;
      }
    }

    cacheStats.columnRenderCacheMisses += 1;
    cacheStats.columnRenderCacheMissReasons[missReason] =
      (cacheStats.columnRenderCacheMissReasons[missReason] || 0) + 1;
    const canReuseCachedChildrenBeforeRender =
      (missReason === "section-column-visual-changed" ||
        missReason === "section-index-changed" ||
        missReason === "column-index-changed" ||
        missReason === "split-position-changed") &&
      React.isValidElement(cached?.element);
    let element;
    if (canReuseCachedChildrenBeforeRender) {
      element = React.cloneElement(
        cached.element,
        {
          positionRevision: `${sectionIndex}:${columnIndex}:${splitIndex}:${splitSide}`,
          sectionVisualKey,
        }
      );
    } else {
      cacheStats.rebuiltColumnCount += 1;
      element = render();
    }
    if (cacheEnabled) {
      canvasColumnRenderCacheRef.current.set(cacheKey, {
        element,
        elementData: column,
        sectionIndex,
        columnIndex,
        splitIndex,
        splitSide,
        device,
        builderMode,
        isPreview,
        theme,
        sectionVisualKey,
        controlsVisible: structuralRenderRevision.controlsVisible,
      });
    }
    return element;
  };

  const renderCachedSpanSubtree = (
    { branch, sectionId, columnId, span, spanIndex },
    render
  ) => {
    const cacheKey = `${branch}:${String(sectionId)}:${String(columnId)}:${String(span?.id ?? "")}:fill1`;
    const cached = canvasSpanRenderCacheRef.current.get(cacheKey);
    const cacheEnabled =
      (!dragRenderActive || sidebarSectionDropRenderActive) &&
      !isDraggingLayout;
    if (
      cacheEnabled &&
      cached &&
      cached.elementData === span &&
      cached.spanIndex === spanIndex &&
      cached.device === device &&
      cached.isPreview === isPreview &&
      cached.theme === theme &&
      React.isValidElement(cached.element)
    ) {
      return cached.element;
    }
    const element = render();
    if (cacheEnabled) {
      canvasSpanRenderCacheRef.current.set(cacheKey, {
        element,
        elementData: span,
        spanIndex,
        device,
        builderMode,
        isPreview,
        theme,
        controlsVisible: structuralRenderRevision.controlsVisible,
      });
    }
    return element;
  };

  const refreshCachedSectionPosition = (element, renderIndex) => {
    let refreshed = false;
    const refreshStructuralRoot = (node) => {
      if (!React.isValidElement(node)) return node;
      if (
        node.type === StructuralContainerItem ||
        node.type === StructuralSplitRowItem
      ) {
        refreshed = true;
        return React.cloneElement(node, {
          positionRevision: `section:${renderIndex}`,
        });
      }
      if (refreshed || node.props?.children == null) return node;
      const children = Array.isArray(node.props.children)
        ? node.props.children.map(refreshStructuralRoot)
        : refreshStructuralRoot(node.props.children);
      if (!refreshed) return node;
      return Array.isArray(children)
        ? React.cloneElement(node, undefined, ...children)
        : React.cloneElement(node, undefined, children);
    };
    return refreshStructuralRoot(element);
  };

  const offscreenIntrinsicSizeForKey = (nodeKey) => {
    const measuredHeight = offscreenSectionSizeCacheRef.current.get(nodeKey);
    const intrinsicHeight =
      Number.isFinite(measuredHeight) && measuredHeight > 0
        ? measuredHeight
        : OFFSCREEN_SECTION_FALLBACK_HEIGHT_PX;
    // Preserve normal inline sizing; only provide a remembered/fallback block size.
    return `none auto ${Math.ceil(intrinsicHeight)}px`;
  };

  const offscreenStyleForSection = (nodeKey, eligible) => {
    if (
      !offscreenSectionExperimentEnabled ||
      !eligible ||
      dragRenderActive
    ) {
      return {};
    }
    return {
      contentVisibility: "auto",
      containIntrinsicSize: offscreenIntrinsicSizeForKey(nodeKey),
    };
  };

  const ensureOffscreenSectionResizeObserver = () => {
    if (
      offscreenSectionResizeObserverRef.current ||
      typeof ResizeObserver === "undefined"
    ) {
      return offscreenSectionResizeObserverRef.current;
    }
    offscreenSectionResizeObserverRef.current = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const node = entry.target;
        const nodeKey = offscreenSectionKeyByNodeRef.current.get(node);
        if (!nodeKey) continue;

        let rendered = true;
        if (typeof node.checkVisibility === "function") {
          try {
            rendered = node.checkVisibility({ contentVisibilityAuto: true });
          } catch {
            rendered = true;
          }
        } else {
          const viewport = canvasScrollRef.current?.getBoundingClientRect?.();
          const rect = node.getBoundingClientRect();
          rendered =
            !viewport ||
            (rect.bottom > viewport.top && rect.top < viewport.bottom);
        }
        if (!rendered) continue;

        const borderBoxSize = Array.isArray(entry.borderBoxSize)
          ? entry.borderBoxSize[0]
          : entry.borderBoxSize;
        const measuredHeight =
          Number(borderBoxSize?.blockSize) || Number(entry.contentRect?.height);
        if (!Number.isFinite(measuredHeight) || measuredHeight <= 0) continue;

        const roundedHeight = Math.ceil(measuredHeight);
        if (
          offscreenSectionSizeCacheRef.current.get(nodeKey) === roundedHeight
        ) {
          continue;
        }
        offscreenSectionSizeCacheRef.current.set(nodeKey, roundedHeight);
        if (node.style.contentVisibility === "auto") {
          node.style.containIntrinsicSize = `none auto ${roundedHeight}px`;
        }
      }
    });
    return offscreenSectionResizeObserverRef.current;
  };

  const registerOffscreenSectionNode = (
    nodeKey,
    node,
    setSortableNodeRef,
    eligible
  ) => {
    setSortableNodeRef(node);
    const previousNode = offscreenSectionNodesRef.current.get(nodeKey);
    if (previousNode && previousNode !== node) {
      offscreenSectionResizeObserverRef.current?.unobserve(previousNode);
      offscreenSectionKeyByNodeRef.current.delete(previousNode);
      offscreenSectionNodesRef.current.delete(nodeKey);
    }
    if (!node || !offscreenSectionExperimentEnabled || !eligible) return;

    offscreenSectionNodesRef.current.set(nodeKey, node);
    offscreenSectionKeyByNodeRef.current.set(node, nodeKey);
    ensureOffscreenSectionResizeObserver()?.observe(node);
  };

  const setOffscreenSectionDndBypass = (active) => {
    if (!offscreenSectionExperimentEnabled) return;
    for (const [nodeKey, node] of offscreenSectionNodesRef.current) {
      if (!node?.isConnected) continue;
      node.style.contentVisibility = active ? "visible" : "auto";
      node.style.containIntrinsicSize = active
        ? ""
        : offscreenIntrinsicSizeForKey(nodeKey);
    }
  };

  useEffect(() => {
    const sectionNodes = offscreenSectionNodesRef.current;
    const sectionSizeCache = offscreenSectionSizeCacheRef.current;
    return () => {
      if (hoverPerfTimerRef.current != null) {
        clearTimeout(hoverPerfTimerRef.current);
        hoverPerfTimerRef.current = null;
      }
      hoverPerfRef.current = null;
      structuralOptionStoreRef.current.setOnPublish(null);
      elementSelectionStoreRef.current.clear();
      offscreenSectionResizeObserverRef.current?.disconnect();
      offscreenSectionResizeObserverRef.current = null;
      sectionNodes.clear();
      sectionSizeCache.clear();
    };
  }, []);

  useEffect(() => {
    if (isPreview) return undefined;
    const scroller = canvasScrollRef.current;
    if (!scroller || typeof IntersectionObserver === "undefined") {
      return undefined;
    }
    const sizeCache = new WeakMap();
    let pending = [];
    let timer = 0;
    const applyPending = () => {
      timer = 0;
      if (sectionOffscreenSyncPausedRef.current) {
        timer = window.setTimeout(applyPending, 48);
        return;
      }
      const batch = pending;
      pending = [];
      for (const entry of batch) {
        const node = entry.target;
        if (!node?.isConnected) continue;
        const inner = node.firstElementChild;
        if (node.style.contentVisibility) node.style.contentVisibility = "";
        if (node.style.containIntrinsicBlockSize) {
          node.style.containIntrinsicBlockSize = "";
        }
        if (entry.isIntersecting) {
          if (inner?.style.contentVisibility) inner.style.contentVisibility = "";
          if (inner?.style.containIntrinsicBlockSize) {
            inner.style.containIntrinsicBlockSize = "";
          }
          continue;
        }
        if (!inner) continue;
        let height = sizeCache.get(node);
        if (!height) {
          const parsed = Number.parseFloat(inner.style.containIntrinsicBlockSize);
          if (Number.isFinite(parsed) && parsed > 0) {
            height = Math.ceil(parsed);
          } else {
            height = Math.ceil(node.getBoundingClientRect().height);
          }
          if (height > 0) sizeCache.set(node, height);
        }
        if (!height) continue;
        const intrinsic = `${height}px`;
        if (inner.style.containIntrinsicBlockSize !== intrinsic) {
          inner.style.containIntrinsicBlockSize = intrinsic;
        }
        if (inner.style.contentVisibility !== "hidden") {
          inner.style.contentVisibility = "hidden";
        }
      }
    };
    const observer = new IntersectionObserver(
      (entries) => {
        pending.push(...entries);
        if (timer) return;
        timer = window.setTimeout(applyPending, 0);
      },
      { root: scroller, rootMargin: "80px 0px", threshold: 0 }
    );
    scroller
      .querySelectorAll("[data-builder-canvas='true'] > .container-area")
      .forEach((node) => observer.observe(node));
    return () => {
      if (timer) window.clearTimeout(timer);
      observer.disconnect();
      scroller
        .querySelectorAll("[data-builder-canvas='true'] > .container-area")
        .forEach((node) => {
          if (node.style.contentVisibility) node.style.contentVisibility = "";
          if (node.style.containIntrinsicBlockSize) {
            node.style.containIntrinsicBlockSize = "";
          }
          const inner = node.firstElementChild;
          if (!inner) return;
          if (inner.style.contentVisibility) inner.style.contentVisibility = "";
          if (inner.style.containIntrinsicBlockSize) {
            inner.style.containIntrinsicBlockSize = "";
          }
        });
    };
  }, [isPreview, layouts.length]);

  const activeInlineDragGroupRef = useRef(null);
  const carouselColWarnedRef = useRef(false);
  const listImageColWarnedRef = useRef(false);
  const postColWarnedRef = useRef(false);
  const toastSpeechVoicesRef = useRef([]);
  const toastSpeechLastRef = useRef({ key: "", at: 0 });
  const toastAudioRef = useRef(null);
  const toastAudioByKeyRef = useRef({});
  /** ใช้ใน during() คำนวณแทรก Section/Split ให้ตรงกับ ghost (y กึ่งกลาง Section) */
  const sectionReorderPointerRef = useRef({ x: 0, y: 0 });
  const layoutDragTargetRef = useRef({ containerId: "", id: "" });
  const dndPerfRef = useRef(null);
  const offscreenSectionPerfRef = useRef({
    commitTime: null,
    phase: "",
    samples: [],
    scheduled: false,
    contentRenderEpoch: 0,
    contentRenderRan: false,
    lastCommitRenderEpoch: 0,
    cacheStats: null,
    structuralRenders: null,
    lastStructuralRenderCounts: {
      shell: {},
      heavy: {},
    },
  });
  const structuralRenderCountsRef = useRef({
    shell: {},
    heavy: {},
  });
  const hoverPerfRef = useRef(null);
  const hoverPerfTimerRef = useRef(null);
  const structuralKinds = ["splitRow", "container", "column", "span"];
  const structuralCountSnapshot = () => ({
    shell: { ...structuralRenderCountsRef.current.shell },
    heavy: { ...structuralRenderCountsRef.current.heavy },
  });
  const structuralCountDelta = (baseline) => ({
    shell: Object.fromEntries(
      structuralKinds.map((kind) => [
        kind,
        (structuralRenderCountsRef.current.shell[kind] || 0) -
          (baseline?.shell?.[kind] || 0),
      ])
    ),
    heavy: Object.fromEntries(
      structuralKinds.map((kind) => [
        kind,
        (structuralRenderCountsRef.current.heavy[kind] || 0) -
          (baseline?.heavy?.[kind] || 0),
      ])
    ),
  });
  const ensureHoverPerfSession = () => {
    if (!builderHoverPerfEnabled) return null;
    if (!hoverPerfRef.current) {
      hoverPerfRef.current = {
        startedAt: performance.now(),
        updateCount: 0,
        updateTotalMs: 0,
        updateMaxMs: 0,
        publishCount: 0,
        publishTotalMs: 0,
        publishMaxMs: 0,
        notifiedKeyTotal: 0,
        notifiedKeyMax: 0,
        canvasCommits: 0,
        canvasActualTotalMs: 0,
        canvasActualMaxMs: 0,
        contentRenderCount: 0,
        lastContentRenderEpoch: canvasSectionRenderEpochRef.current,
        contentRenderCauses: [],
        optionVisibleDelayMaxMs: 0,
        structuralBaseline: structuralCountSnapshot(),
      };
    }
    if (hoverPerfTimerRef.current != null) {
      clearTimeout(hoverPerfTimerRef.current);
    }
    hoverPerfTimerRef.current = setTimeout(() => {
      hoverPerfTimerRef.current = null;
      const perf = hoverPerfRef.current;
      hoverPerfRef.current = null;
      if (!perf) return;
      const round = (value) =>
        Math.round((Number(value) || 0) * 100) / 100;
      const renders = structuralCountDelta(perf.structuralBaseline);
      const summary = {
        durationMs: round(performance.now() - perf.startedAt),
        updateCount: perf.updateCount,
        updateAvgMs: round(perf.updateTotalMs / Math.max(1, perf.updateCount)),
        updateMaxMs: round(perf.updateMaxMs),
        publishCount: perf.publishCount,
        publishAvgMs: round(
          perf.publishTotalMs / Math.max(1, perf.publishCount)
        ),
        publishMaxMs: round(perf.publishMaxMs),
        notifiedKeysAvg: round(
          perf.notifiedKeyTotal / Math.max(1, perf.publishCount)
        ),
        notifiedKeysMax: perf.notifiedKeyMax,
        canvasProfilerCommits: perf.canvasCommits,
        canvasProfilerActualAvgMs: round(
          perf.canvasActualTotalMs / Math.max(1, perf.canvasCommits)
        ),
        canvasProfilerActualMaxMs: round(perf.canvasActualMaxMs),
        contentRenderCount: perf.contentRenderCount,
        contentRenderCauses: perf.contentRenderCauses,
        maxInputToOptionVisibleMs: round(perf.optionVisibleDelayMaxMs),
        structuralShellRenders: renders.shell,
        structuralHeavyRenders: renders.heavy,
      };
      console.groupCollapsed(
        `[Builder Hover Perf] ${summary.updateCount} updates / ${summary.notifiedKeysMax} max keys`
      );
      console.table(summary);
      console.log("Copy this object:", summary);
      console.groupEnd();
    }, 400);
    return hoverPerfRef.current;
  };
  structuralOptionStoreRef.current.setOnPublish(
    builderHoverPerfEnabled
      ? (sample) => {
          if (sample.reason !== "hover") return;
          const perf = ensureHoverPerfSession();
          perf.publishCount += 1;
          perf.publishTotalMs += sample.durationMs;
          perf.publishMaxMs = Math.max(perf.publishMaxMs, sample.durationMs);
          perf.notifiedKeyTotal += sample.notifiedKeyCount;
          perf.notifiedKeyMax = Math.max(
            perf.notifiedKeyMax,
            sample.notifiedKeyCount
          );
        }
      : null
  );
  const collisionContainerCacheRef = useRef({
    byType: new Map(),
    elementBuckets: new Map(),
    byId: new Map(),
    lastFilteredCount: 0,
    lastUsedBucket: false,
  });

  const startSidebarNativeDragPerf = (element) => {
    const elementType = element?.isSplitLayout
      ? "split"
      : element?.container
        ? "column"
        : String(element?.type || "unknown");
    const isStructureDrag = elementType === "column" || elementType === "split";
    const shouldMeasure =
      isBuilderPerformanceEnabled() ||
      builderSectionPerfEnabled ||
      (dataSliderPerfEnabled && elementType === "dts") ||
      (categoriesPerfEnabled && elementType === "ctg") ||
      (tabsPerfEnabled && elementType === "tabs") ||
      (accordionPerfEnabled && elementType === "acc") ||
      (postPerfEnabled && elementType === "post") ||
      (listItemsPerfEnabled &&
        (elementType === "list" ||
          elementType === "lstb" ||
          elementType === "crl" ||
          elementType === "tbl" ||
          elementType === "btw" ||
          elementType === "imgh" ||
          elementType === "imgo" ||
          elementType === "text" ||
          elementType === "heading")) ||
      (structurePerfEnabled && isStructureDrag);
    if (!shouldMeasure || sidebarNativeDragPerfRef.current?.active) {
      return;
    }
    sidebarNativeDragPerfRef.current = {
      active: true,
      elementType,
      listVariant:
        elementType === "text"
          ? "text"
          : elementType === "heading"
          ? "heading"
          : elementType === "imgo"
          ? "overlay"
          : elementType === "imgh"
          ? "imageHover"
          : elementType === "btw"
          ? "between"
          : elementType === "tbl"
          ? "dataTable"
          : elementType === "crl"
          ? "carousel"
          : elementType === "lstb"
          ? "listBox"
          : elementType === "list"
          ? element?.buttonMultiElement
            ? "buttonMulti"
            : element?.listImageElement
              ? "image"
              : element?.listIconsElement
                ? "icons"
                : "items"
          : null,
      startedAt: performance.now(),
      lastAction: "cancel",
      sections: canvasLayoutCounts.sections,
      elements: canvasLayoutCounts.elements,
      dragoverCount: 0,
      dragoverTotalMs: 0,
      dragoverMaxMs: 0,
      previewCacheHits: 0,
      hoverUpdateCount: 0,
      hoverUpdateTotalMs: 0,
      hoverUpdateMaxMs: 0,
      targetChangeCount: 0,
      duplicateTargetSkips: 0,
      flipCaptureCount: 0,
      flipCapturedNodeCount: 0,
      flipCaptureTotalMs: 0,
      flipCaptureMaxMs: 0,
      isolatedPreviewMountCount: 0,
      isolatedPreviewMountTotalMs: 0,
      isolatedPreviewMountMaxMs: 0,
      // Backward-compatible aliases for existing benchmark comparisons.
      portalMountCommitCount: 0,
      portalMountCommitTotalMs: 0,
      portalMountCommitMaxMs: 0,
      previewCommitCount: 0,
      previewCommitTotalMs: 0,
      previewCommitMaxMs: 0,
      hostMoveCount: 0,
      hostMoveTotalMs: 0,
      hostMoveMaxMs: 0,
      hostDetachCount: 0,
      canvasRenderCommits: 0,
      canvasRenderTotalMs: 0,
      canvasRenderMaxMs: 0,
      targetSectionRenderCommits: 0,
      targetSectionRenderTotalMs: 0,
      targetSectionRenderMaxMs: 0,
      firstPreviewDelayMs: null,
      dropValidationMs: 0,
      layoutCloneMs: 0,
      insertMs: 0,
      layoutCommitMs: 0,
      dropHandlerSyncMs: 0,
      sectionCacheHits: 0,
      sectionCacheMisses: 0,
      columnCacheHits: 0,
      columnCacheMisses: 0,
      sectionCacheMissReasons: {},
      performanceTransactionId: beginBuilderPerformanceTransaction(
        "dnd-sidebar",
        {
          label: `ลากจาก Sidebar / ${elementType}`,
          elementType,
          elementId: element?.id,
          scope: "SIDEBAR_TO_CANVAS",
        },
        {
          trackFrames: true,
          skipInitialFrameGap:
            String(elementType || "").toLowerCase() === "split",
        }
      ),
    };
  };

  const finishSidebarNativeDragPerf = (reason = "clear") => {
    const perf = sidebarNativeDragPerfRef.current;
    if (!perf?.active) return;
    perf.active = false;
    sidebarNativeDragPerfRef.current = null;
    if (perf.lastAction === "drop") {
      sidebarNativeDropPerfRef.current = perf;
    }
    requestAnimationFrame(() => {
      const round = (value) => Math.round((Number(value) || 0) * 100) / 100;
      const summary = {
        reason: reason === "clear" ? perf.lastAction : reason,
        elementType: perf.elementType,
        listVariant: perf.listVariant,
        sections: perf.sections,
        elements: perf.elements,
        dragDurationMs: round(performance.now() - perf.startedAt),
        dragoverCount: perf.dragoverCount,
        dragoverAvgMs: round(
          perf.dragoverTotalMs / Math.max(1, perf.dragoverCount)
        ),
        dragoverMaxMs: round(perf.dragoverMaxMs),
        previewCacheHits: perf.previewCacheHits,
        hoverUpdateCount: perf.hoverUpdateCount,
        hoverUpdateAvgMs: round(
          perf.hoverUpdateTotalMs / Math.max(1, perf.hoverUpdateCount)
        ),
        hoverUpdateMaxMs: round(perf.hoverUpdateMaxMs),
        targetChangeCount: perf.targetChangeCount,
        duplicateTargetSkips: perf.duplicateTargetSkips,
        flipCaptureCount: perf.flipCaptureCount,
        flipCapturedNodeCount: perf.flipCapturedNodeCount,
        flipCapturedNodesAvg: round(
          perf.flipCapturedNodeCount / Math.max(1, perf.flipCaptureCount)
        ),
        flipCaptureAvgMs: round(
          perf.flipCaptureTotalMs / Math.max(1, perf.flipCaptureCount)
        ),
        flipCaptureMaxMs: round(perf.flipCaptureMaxMs),
        isolatedPreviewMountCount: perf.isolatedPreviewMountCount,
        isolatedPreviewMountAvgMs: round(
          perf.isolatedPreviewMountTotalMs /
            Math.max(1, perf.isolatedPreviewMountCount)
        ),
        isolatedPreviewMountMaxMs: round(perf.isolatedPreviewMountMaxMs),
        portalMountCommitCount: perf.portalMountCommitCount,
        portalMountCommitAvgMs: round(
          perf.portalMountCommitTotalMs /
            Math.max(1, perf.portalMountCommitCount)
        ),
        portalMountCommitMaxMs: round(perf.portalMountCommitMaxMs),
        previewCommitCount: perf.previewCommitCount,
        previewCommitAvgMs: round(
          perf.previewCommitTotalMs / Math.max(1, perf.previewCommitCount)
        ),
        previewCommitMaxMs: round(perf.previewCommitMaxMs),
        hostMoveCount: perf.hostMoveCount,
        hostMoveAvgMs: round(
          perf.hostMoveTotalMs / Math.max(1, perf.hostMoveCount)
        ),
        hostMoveMaxMs: round(perf.hostMoveMaxMs),
        hostDetachCount: perf.hostDetachCount,
        canvasRenderCommits: perf.canvasRenderCommits,
        canvasRenderAvgMs: round(
          perf.canvasRenderTotalMs / Math.max(1, perf.canvasRenderCommits)
        ),
        canvasRenderMaxMs: round(perf.canvasRenderMaxMs),
        targetSectionRenderCommits: perf.targetSectionRenderCommits,
        targetSectionRenderAvgMs: round(
          perf.targetSectionRenderTotalMs /
            Math.max(1, perf.targetSectionRenderCommits)
        ),
        targetSectionRenderMaxMs: round(perf.targetSectionRenderMaxMs),
        firstPreviewDelayMs: round(perf.firstPreviewDelayMs),
        dropValidationMs: round(perf.dropValidationMs),
        layoutCloneMs: round(perf.layoutCloneMs),
        insertMs: round(perf.insertMs),
        layoutCommitMs: round(perf.layoutCommitMs),
        dropHandlerSyncMs: round(perf.dropHandlerSyncMs),
        sectionCacheHits: perf.sectionCacheHits,
        sectionCacheMisses: perf.sectionCacheMisses,
        columnCacheHits: perf.columnCacheHits,
        columnCacheMisses: perf.columnCacheMisses,
        sectionCacheMissReasons: perf.sectionCacheMissReasons,
      };
      finishBuilderPerformanceTransaction(
        perf.performanceTransactionId,
        {
          dragoverAvgMs: summary.dragoverAvgMs,
          dragoverMaxMs: summary.dragoverMaxMs,
          hoverUpdateAvgMs: summary.hoverUpdateAvgMs,
          hoverUpdateMaxMs: summary.hoverUpdateMaxMs,
          previewCommitMaxMs: summary.previewCommitMaxMs,
          canvasMaxMs: summary.canvasRenderMaxMs,
          renderMaxMs: summary.targetSectionRenderMaxMs,
          dropValidationMs: summary.dropValidationMs,
          layoutCloneMs: summary.layoutCloneMs,
          insertMs: summary.insertMs,
          layoutCommitMs: summary.layoutCommitMs,
          dropCommitMs: summary.dropHandlerSyncMs,
        },
        {
          reason: summary.reason,
          sections: summary.sections,
          elements: summary.elements,
        }
      );
      if (sidebarNativeDropPerfRef.current === perf) {
        sidebarNativeDropPerfRef.current = null;
      }
    });
  };
  finishSidebarNativeDragPerfRef.current = finishSidebarNativeDragPerf;

  useEffect(() => {
    const finishNativeSidebarDrag = () => {
      finishSidebarNativeDragPerfRef.current?.("cancel");
      clearSidebarPortalPreviewRef.current?.();
    };
    window.addEventListener("dragend", finishNativeSidebarDrag, false);
    return () => {
      window.removeEventListener("dragend", finishNativeSidebarDrag, false);
      cancelBuilderPerformanceTransaction(
        sidebarNativeDragPerfRef.current?.performanceTransactionId
      );
      sidebarNativeDragPerfRef.current = null;
      sidebarNativeDropPerfRef.current = null;
    };
  }, []);

  const startDndPerf = (active, dndScope = "CANVAS") => {
    if (isBuilderPerformanceEnabled()) {
      setBuilderPerformanceTarget(active?.data?.current?.type, active?.id);
    }
    markContentDndLifecycle(
      "drag-start",
      active?.data?.current?.type
    );
    collisionContainerCacheRef.current = {
      byType: new Map(),
      elementBuckets: new Map(),
      byId: new Map(),
      lastFilteredCount: 0,
      lastUsedBucket: false,
    };
    dndPerfRef.current = {
      active: true,
      phase: "drag-start",
      type: String(active?.data?.current?.type || "UNKNOWN"),
      dndScope,
      startedAt: performance.now(),
      firstMoveDelayMs: null,
      moveCount: 0,
      moveTotalMs: 0,
      moveMaxMs: 0,
      collisionCount: 0,
      collisionTotalMs: 0,
      collisionMaxMs: 0,
      collisionCandidatesTotal: 0,
      collisionCandidatesMax: 0,
      renderCommits: 0,
      renderTotalMs: 0,
      renderMaxMs: 0,
      baseRenderMaxMs: 0,
      renderSamples: [],
      dragStartRenderCommits: 0,
      dragStartRenderTotalMs: 0,
      dragStartRenderMaxMs: 0,
      bucketCollisionCount: 0,
      fallbackCollisionCount: 0,
      dropCommitMs: 0,
      scopedIntentCount: 0,
      scopedIntentTotalMs: 0,
      scopedIntentMaxMs: 0,
      scopedTargetChanges: 0,
      scopedPlaceholderMounts: 0,
      scopedPlaceholderMoves: 0,
      scopedPlaceholderRemovals: 0,
      scopedPlaceholderSkippedDuplicates: 0,
      scopedPlaceholderResolveTotalMs: 0,
      scopedPlaceholderResolveMaxMs: 0,
      scopedPlaceholderWriteTotalMs: 0,
      scopedPlaceholderWriteMaxMs: 0,
      scopedFlipNodeCount: 0,
      scopedFlipAnimationBatches: 0,
      scopedFlipCaptureCount: 0,
      scopedFlipCaptureTotalMs: 0,
      scopedFlipCaptureMaxMs: 0,
      scopedFlipWriteCount: 0,
      scopedFlipWriteTotalMs: 0,
      scopedFlipWriteMaxMs: 0,
      scopedEventPointerCount: 0,
      scopedCollisionPointerFallbackCount: 0,
      lastAction: "drag-start",
      performanceTransactionId: beginBuilderPerformanceTransaction(
        "dnd",
        {
          label: `ลากวาง / ${String(
            active?.data?.current?.type || "UNKNOWN"
          )}`,
          elementType: active?.data?.current?.type,
          elementId: active?.id,
          scope: dndScope,
        },
        { trackFrames: true }
      ),
    };
  };

  const recordCanvasProfiler = (
    _id,
    _phase,
    actualDuration,
    baseDuration
  ) => {
    const sidebarCommitPerf =
      sidebarNativeDragPerfRef.current || sidebarNativeDropPerfRef.current;
    const commitPhase = sidebarCommitPerf
      ? sidebarCommitPerf.lastAction === "drop"
        ? "sidebar-drop"
        : sidebarSectionDropRenderActive
          ? "sidebar-section-preview"
          : "sidebar-preview"
      : dndPerfRef.current?.phase || "";
    const cacheStats = canvasSectionCacheStatsRef.current;
    recordBuilderCanvasCommit(actualDuration, baseDuration, commitPhase, {
      sectionHits: cacheStats?.cacheHits || 0,
      sectionMisses: cacheStats?.cacheMisses || 0,
      columnHits: cacheStats?.columnRenderCacheHits || 0,
      columnMisses: cacheStats?.columnRenderCacheMisses || 0,
      rebuiltColumns: cacheStats?.rebuiltColumnCount || 0,
      scoped: Boolean(cacheStats?.scopedLayoutCacheActive),
      sectionMissReasons: cacheStats?.missReasons || {},
      columnMissReasons: cacheStats?.columnRenderCacheMissReasons || {},
    });
    if (pendingCanvasPerformanceTransactionsRef.current.size > 0) {
      const committedTransactionIds = [
        ...pendingCanvasPerformanceTransactionsRef.current,
      ];
      pendingCanvasPerformanceTransactionsRef.current.clear();
      committedTransactionIds.forEach((transactionId) => {
        finishBuilderPerformanceTransactionAfterPaint(
          transactionId,
          {},
          { reason: "canvas-paint" }
        );
      });
    }
    recordBuilderPanelOpenCanvasCommit(actualDuration);
    recordPanelSliderCanvasCommit(actualDuration);
    recordPanelSliderSectionCacheStats(canvasSectionCacheStatsRef.current);
    const builderNavPerf =
      typeof window !== "undefined" ? window.__builderNavPerf : null;
    if (builderNavPerf?.active) {
      builderNavPerf.canvasCommits += 1;
      builderNavPerf.canvasActualMs += actualDuration;
      builderNavPerf.canvasMaxMs = Math.max(
        builderNavPerf.canvasMaxMs,
        actualDuration
      );
    }
    const committedElementSelectionTransaction =
      elementSelectionCacheTransactionRef.current;
    const elementSelectionTransactionCommitted = Boolean(
      committedElementSelectionTransaction &&
        Object.is(
          committedElementSelectionTransaction.nextSelection,
          selectID
        )
    );
    if (
      builderSectionPerfEnabled &&
      elementSelectionPerfSessionsRef.current.size > 0 &&
      elementSelectionTransactionCommitted
    ) {
      const cacheStats = canvasSectionCacheStatsRef.current;
      const completedSessions = [
        ...elementSelectionPerfSessionsRef.current.values(),
      ];
      completedSessions.forEach((session) => {
        session.canvasCommits += 1;
        session.canvasActualMs += actualDuration;
        session.canvasMaxMs = Math.max(session.canvasMaxMs, actualDuration);
        session.cacheHits += cacheStats?.cacheHits || 0;
        session.cacheMisses += cacheStats?.cacheMisses || 0;
        Object.entries(cacheStats?.missReasons || {}).forEach(
          ([reason, count]) => {
            session.cacheMissReasons[reason] =
              (session.cacheMissReasons[reason] || 0) + count;
          }
        );
        session.clickToCommitWallMs = performance.now() - session.startedAt;
        elementSelectionPerfSessionsRef.current.delete(session.id);
      });
      queueMicrotask(() => {
        const round = (value) =>
          Math.round((Number(value) || 0) * 100) / 100;
        completedSessions.forEach((session) => {
          console.info("[Builder Element Select Perf]", {
            operation: session.operation,
            previousElementId: session.previousElementId,
            nextElementId: session.nextElementId,
            previousContainerId: session.previousContainerId,
            nextContainerId: session.nextContainerId,
            clickToCommitWallMs: round(session.clickToCommitWallMs),
            canvasCommits: session.canvasCommits,
            canvasActualMs: round(session.canvasActualMs),
            canvasMaxMs: round(session.canvasMaxMs),
            cacheHits: session.cacheHits,
            cacheMisses: session.cacheMisses,
            cacheMissReasons: session.cacheMissReasons,
            targetedLogicalSectionCount:
              session.targetedLogicalSectionCount,
            selectedBoundaryRenderCount:
              session.selectedBoundaryRenderCount,
          });
        });
      });
    }
    if (
      builderSectionPerfEnabled &&
      elementDeletePerfSessionsRef.current.size > 0
    ) {
      const cacheStats = canvasSectionCacheStatsRef.current;
      const completedSessions = [
        ...elementDeletePerfSessionsRef.current.values(),
      ];
      completedSessions.forEach((session) => {
        session.canvasCommits += 1;
        session.canvasActualMs += actualDuration;
        session.canvasMaxMs = Math.max(session.canvasMaxMs, actualDuration);
        session.cacheHits += cacheStats?.cacheHits || 0;
        session.cacheMisses += cacheStats?.cacheMisses || 0;
        session.columnRenderCacheHits +=
          cacheStats?.columnRenderCacheHits || 0;
        session.columnRenderCacheMisses +=
          cacheStats?.columnRenderCacheMisses || 0;
        session.rebuiltColumnCount += cacheStats?.rebuiltColumnCount || 0;
        Object.entries(cacheStats?.missReasons || {}).forEach(
          ([reason, count]) => {
            session.cacheMissReasons[reason] =
              (session.cacheMissReasons[reason] || 0) + count;
          }
        );
        Object.entries(
          cacheStats?.columnRenderCacheMissReasons || {}
        ).forEach(([reason, count]) => {
          session.columnRenderCacheMissReasons[reason] =
            (session.columnRenderCacheMissReasons[reason] || 0) + count;
        });
        session.clickToCommitWallMs = performance.now() - session.startedAt;
        elementDeletePerfSessionsRef.current.delete(session.id);
      });
      queueMicrotask(() => {
        const round = (value) =>
          Math.round((Number(value) || 0) * 100) / 100;
        completedSessions.forEach((session) => {
          console.info("[Builder Element Delete Perf]", {
            targetType: session.targetType,
            targetPath: session.targetPath,
            preparationMs: round(session.preparationMs),
            clickToCommitWallMs: round(session.clickToCommitWallMs),
            canvasCommits: session.canvasCommits,
            canvasActualMs: round(session.canvasActualMs),
            canvasMaxMs: round(session.canvasMaxMs),
            cacheHits: session.cacheHits,
            cacheMisses: session.cacheMisses,
            cacheMissReasons: session.cacheMissReasons,
            columnRenderCacheHits: session.columnRenderCacheHits,
            columnRenderCacheMisses: session.columnRenderCacheMisses,
            columnRenderCacheMissReasons:
              session.columnRenderCacheMissReasons,
            rebuiltColumnCount: session.rebuiltColumnCount,
            bucketSizeBefore: session.bucketSizeBefore,
            bucketSizeAfter: session.bucketSizeAfter,
            orphanGroupCleanupCount: session.orphanGroupCleanupCount,
          });
        });
      });
    }
    if (elementSelectionTransactionCommitted) {
      elementSelectionCacheTransactionRef.current = null;
    }
    if (
      builderSectionPerfEnabled &&
      spanStructurePerfSessionsRef.current.size > 0
    ) {
      const cacheStats = canvasSectionCacheStatsRef.current;
      const completedSessions = [
        ...spanStructurePerfSessionsRef.current.values(),
      ];
      completedSessions.forEach((session) => {
        session.canvasCommits += 1;
        session.canvasActualMs += actualDuration;
        session.canvasMaxMs = Math.max(session.canvasMaxMs, actualDuration);
        session.cacheHits += cacheStats?.cacheHits || 0;
        session.cacheMisses += cacheStats?.cacheMisses || 0;
        Object.entries(cacheStats?.missReasons || {}).forEach(
          ([reason, count]) => {
            session.cacheMissReasons[reason] =
              (session.cacheMissReasons[reason] || 0) + count;
          }
        );
        session.clickToCommitWallMs = performance.now() - session.startedAt;
        spanStructurePerfSessionsRef.current.delete(session.id);
      });
      queueMicrotask(() => {
        const round = (value) =>
          Math.round((Number(value) || 0) * 100) / 100;
        completedSessions.forEach((session) => {
          console.info("[Builder Span Structure Perf]", {
            operation: session.operation,
            sourceSpanId: session.sourceSpanId,
            targetSpanId: session.targetSpanId,
            createdSpanId: session.createdSpanId,
            removedSpanId: session.removedSpanId,
            preparationMs: round(session.preparationMs),
            clickToCommitWallMs: round(session.clickToCommitWallMs),
            canvasCommits: session.canvasCommits,
            canvasActualMs: round(session.canvasActualMs),
            canvasMaxMs: round(session.canvasMaxMs),
            cacheHits: session.cacheHits,
            cacheMisses: session.cacheMisses,
            cacheMissReasons: session.cacheMissReasons,
            copiedElementCount: session.copiedElementCount,
            removedElementCount: session.removedElementCount,
            movedElementCount: session.movedElementCount,
            remainingSpanCount: session.remainingSpanCount,
          });
        });
      });
    }
    if (builderSectionPerfEnabled && presetPerfSessionsRef.current.size > 0) {
      const cacheStats = canvasSectionCacheStatsRef.current;
      const completedSessions = [...presetPerfSessionsRef.current.values()];
      completedSessions.forEach((session) => {
        session.canvasProfilerCommits += 1;
        session.canvasProfilerActualMs += actualDuration;
        session.canvasProfilerMaxMs = Math.max(
          session.canvasProfilerMaxMs,
          actualDuration
        );
        session.sectionCacheHits += cacheStats?.cacheHits || 0;
        session.sectionCacheMisses += cacheStats?.cacheMisses || 0;
        Object.entries(cacheStats?.missReasons || {}).forEach(([reason, count]) => {
          session.sectionCacheMissReasons[reason] =
            (session.sectionCacheMissReasons[reason] || 0) + count;
        });
        session.clickToCommitWallMs = performance.now() - session.startedAt;
        presetPerfSessionsRef.current.delete(session.id);
      });
      queueMicrotask(() => {
        const round = (value) =>
          Math.round((Number(value) || 0) * 100) / 100;
        completedSessions.forEach((session) => {
          console.info("[Builder Preset Perf]", {
            operation: session.operation,
            target: session.target || null,
            source: session.source || null,
            presetId: session.presetId || null,
            preparationMs: round(session.preparationMs),
            storageReadMs: round(session.storageReadMs),
            storageWriteMs: round(session.storageWriteMs),
            serializeMs: round(session.serializeMs),
            payloadBytes: session.payloadBytes || 0,
            presetCount: session.presetCount || 0,
            loadedElementCount: session.loadedElementCount || 0,
            copiedElementCount: session.copiedElementCount || 0,
            clickToCommitWallMs: round(session.clickToCommitWallMs),
            canvasProfilerCommits: session.canvasProfilerCommits,
            canvasProfilerActualMs: round(session.canvasProfilerActualMs),
            canvasProfilerMaxMs: round(session.canvasProfilerMaxMs),
            sectionCacheHits: session.sectionCacheHits,
            sectionCacheMisses: session.sectionCacheMisses,
            sectionCacheMissReasons: session.sectionCacheMissReasons,
            presetUiCacheActive: Boolean(cacheStats?.presetUiCacheActive),
            scopedLayoutCacheActive: Boolean(
              cacheStats?.scopedLayoutCacheActive
            ),
            cacheStatsInterpretation:
              "summed per canvas commit; React dev retries can report cache hits with zero misses",
          });
        });
      });
    }
    presetUiCacheRef.current.active = false;
    confirmModalUiCacheRef.current.active = false;
    textEditModalUiCacheRef.current.active = false;
    canvasSectionCacheStatsRef.current.scopedLayoutSnapshotRoots?.forEach(
      completeScopedLayoutSnapshot
    );
    completeObservedPanelLayoutCommitsAfterPaint();
    const columnSplitPerf = columnSplitPerfRef.current;
    if (builderSectionPerfEnabled && columnSplitPerf) {
      const cacheStats = canvasSectionCacheStatsRef.current;
      columnSplitPerf.canvasCommits += 1;
      columnSplitPerf.canvasActualMs += actualDuration;
      columnSplitPerf.canvasActualMaxMs = Math.max(
        columnSplitPerf.canvasActualMaxMs,
        actualDuration
      );
      columnSplitPerf.cacheHits += cacheStats?.cacheHits || 0;
      columnSplitPerf.cacheMisses += cacheStats?.cacheMisses || 0;
      Object.entries(cacheStats?.missReasons || {}).forEach(([reason, count]) => {
        columnSplitPerf.cacheMissReasons[reason] =
          (columnSplitPerf.cacheMissReasons[reason] || 0) + count;
      });
      columnSplitPerf.clickToCommitWallMs =
        performance.now() - columnSplitPerf.startedAt;
      if (!columnSplitPerf.logScheduled) {
        columnSplitPerf.logScheduled = true;
        queueMicrotask(() => {
          if (columnSplitPerfRef.current !== columnSplitPerf) return;
          columnSplitPerfRef.current = null;
          const round = (value) =>
            Math.round((Number(value) || 0) * 100) / 100;
          console.info("[Builder Cell Split Perf]", {
            operation: columnSplitPerf.operation,
            sourceColumn: columnSplitPerf.sourceColumn,
            targetColumn: columnSplitPerf.targetColumn,
            fromSpanCount: columnSplitPerf.fromSpanCount,
            toSpanCount: columnSplitPerf.toSpanCount,
            movedElementCount: columnSplitPerf.movedElementCount,
            preparationMs: round(columnSplitPerf.preparationMs),
            clickToCommitWallMs: round(
              columnSplitPerf.clickToCommitWallMs
            ),
            canvasProfilerCommits: columnSplitPerf.canvasCommits,
            canvasProfilerActualMs: round(columnSplitPerf.canvasActualMs),
            canvasProfilerMaxMs: round(columnSplitPerf.canvasActualMaxMs),
            sectionCacheHits: columnSplitPerf.cacheHits,
            sectionCacheMisses: columnSplitPerf.cacheMisses,
            sectionCacheMissReasons: columnSplitPerf.cacheMissReasons,
            cacheStatsInterpretation:
              "summed per canvas commit; React dev retries can report cache hits with zero misses",
          });
        });
      }
    }
    const arrowPerf = arrowReorderPerfRef.current;
    if (builderSectionPerfEnabled && arrowPerf) {
      const cacheStats = canvasSectionCacheStatsRef.current;
      arrowPerf.canvasCommits += 1;
      arrowPerf.canvasActualMs += actualDuration;
      arrowPerf.canvasActualMaxMs = Math.max(
        arrowPerf.canvasActualMaxMs,
        actualDuration
      );
      arrowPerf.cacheHits += cacheStats?.cacheHits || 0;
      arrowPerf.cacheMisses += cacheStats?.cacheMisses || 0;
      arrowPerf.scopedLayoutCacheActive ||= Boolean(
        cacheStats?.scopedLayoutCacheActive
      );
      arrowPerf.elementCanvasDragRenderActive ||= Boolean(
        cacheStats?.elementCanvasDragRenderActive
      );
      arrowPerf.sidebarPreviewRenderActive ||= Boolean(
        cacheStats?.sidebarPreviewRenderActive
      );
      Object.entries(cacheStats?.missReasons || {}).forEach(([reason, count]) => {
        arrowPerf.cacheMissReasons[reason] =
          (arrowPerf.cacheMissReasons[reason] || 0) + count;
      });
      arrowPerf.clickToCommitWallMs = performance.now() - arrowPerf.startedAt;
      if (!arrowPerf.logScheduled) {
        arrowPerf.logScheduled = true;
        queueMicrotask(() => {
          if (arrowReorderPerfRef.current !== arrowPerf) return;
          arrowReorderPerfRef.current = null;
          console.info("[Builder Arrow Reorder Perf]", {
            type: arrowPerf.type,
            source: arrowPerf.source,
            target: arrowPerf.target,
            clickToCommitWallMs:
              Math.round(arrowPerf.clickToCommitWallMs * 100) / 100,
            canvasProfilerCommits: arrowPerf.canvasCommits,
            canvasProfilerActualMs:
              Math.round(arrowPerf.canvasActualMs * 100) / 100,
            canvasProfilerMaxMs:
              Math.round(arrowPerf.canvasActualMaxMs * 100) / 100,
            sectionCacheHits: arrowPerf.cacheHits,
            sectionCacheMisses: arrowPerf.cacheMisses,
            sectionCacheMissReasons: arrowPerf.cacheMissReasons,
            scopedLayoutCacheActive: arrowPerf.scopedLayoutCacheActive,
            elementCanvasDragRenderActive:
              arrowPerf.elementCanvasDragRenderActive,
            sidebarPreviewRenderActive: arrowPerf.sidebarPreviewRenderActive,
          });
        });
      }
    }
    const sizePerf = sizeChangePerfRef.current;
    if (builderSectionPerfEnabled && sizePerf) {
      const cacheStats = canvasSectionCacheStatsRef.current;
      sizePerf.canvasCommits += 1;
      sizePerf.canvasActualMs += actualDuration;
      sizePerf.canvasActualMaxMs = Math.max(
        sizePerf.canvasActualMaxMs,
        actualDuration
      );
      sizePerf.cacheHits += cacheStats?.cacheHits || 0;
      sizePerf.cacheMisses += cacheStats?.cacheMisses || 0;
      Object.entries(cacheStats?.missReasons || {}).forEach(([reason, count]) => {
        sizePerf.cacheMissReasons[reason] =
          (sizePerf.cacheMissReasons[reason] || 0) + count;
      });
      sizePerf.clickToCommitWallMs = performance.now() - sizePerf.startedAt;
      if (!sizePerf.logScheduled) {
        sizePerf.logScheduled = true;
        queueMicrotask(() => {
          if (sizeChangePerfRef.current !== sizePerf) return;
          sizeChangePerfRef.current = null;
          const round = (value) =>
            Math.round((Number(value) || 0) * 100) / 100;
          console.info("[Builder Size Change Perf]", {
            type: sizePerf.type,
            target: sizePerf.target,
            fromSize: sizePerf.fromSize,
            toSize: sizePerf.toSize,
            clickToCommitWallMs: round(sizePerf.clickToCommitWallMs),
            canvasProfilerCommits: sizePerf.canvasCommits,
            canvasProfilerActualMs: round(sizePerf.canvasActualMs),
            canvasProfilerMaxMs: round(sizePerf.canvasActualMaxMs),
            sectionCacheHits: sizePerf.cacheHits,
            sectionCacheMisses: sizePerf.cacheMisses,
            sectionCacheMissReasons: sizePerf.cacheMissReasons,
            validationMs: round(sizePerf.validationMs),
          });
        });
      }
    }
    const clonePerf = clonePerfRef.current;
    if (builderSectionPerfEnabled && clonePerf) {
      const cacheStats = canvasSectionCacheStatsRef.current;
      clonePerf.canvasCommits += 1;
      clonePerf.canvasActualMs += actualDuration;
      clonePerf.canvasActualMaxMs = Math.max(
        clonePerf.canvasActualMaxMs,
        actualDuration
      );
      clonePerf.cacheHits += cacheStats?.cacheHits || 0;
      clonePerf.cacheMisses += cacheStats?.cacheMisses || 0;
      Object.entries(cacheStats?.missReasons || {}).forEach(([reason, count]) => {
        clonePerf.cacheMissReasons[reason] =
          (clonePerf.cacheMissReasons[reason] || 0) + count;
      });
      clonePerf.clickToCommitWallMs = performance.now() - clonePerf.startedAt;
      if (!clonePerf.logScheduled) {
        clonePerf.logScheduled = true;
        queueMicrotask(() => {
          if (clonePerfRef.current !== clonePerf) return;
          clonePerfRef.current = null;
          const round = (value) =>
            Math.round((Number(value) || 0) * 100) / 100;
          console.info("[Builder Clone Perf]", {
            type: clonePerf.type,
            source: clonePerf.source,
            createdIds: clonePerf.createdIds,
            sourceElementCount: clonePerf.sourceElementCount,
            weightedCopiedItemCount: clonePerf.weightedCopiedItemCount,
            preparationMs: round(clonePerf.preparationMs),
            clickToCommitWallMs: round(clonePerf.clickToCommitWallMs),
            canvasProfilerCommits: clonePerf.canvasCommits,
            canvasProfilerActualMs: round(clonePerf.canvasActualMs),
            canvasProfilerMaxMs: round(clonePerf.canvasActualMaxMs),
            sectionCacheHits: clonePerf.cacheHits,
            sectionCacheMisses: clonePerf.cacheMisses,
            sectionCacheMissReasons: clonePerf.cacheMissReasons,
            cacheStatsInterpretation:
              "summed per canvas commit; React dev render retries can repeat counts",
          });
        });
      }
    }
    const deletePerf = deletePerfRef.current;
    if (builderSectionPerfEnabled && deletePerf) {
      const cacheStats = canvasSectionCacheStatsRef.current;
      deletePerf.canvasCommits += 1;
      deletePerf.canvasActualMs += actualDuration;
      deletePerf.canvasActualMaxMs = Math.max(
        deletePerf.canvasActualMaxMs,
        actualDuration
      );
      deletePerf.cacheHits += cacheStats?.cacheHits || 0;
      deletePerf.cacheMisses += cacheStats?.cacheMisses || 0;
      Object.entries(cacheStats?.missReasons || {}).forEach(([reason, count]) => {
        deletePerf.cacheMissReasons[reason] =
          (deletePerf.cacheMissReasons[reason] || 0) + count;
      });
      deletePerf.clickToCommitWallMs = performance.now() - deletePerf.startedAt;
      if (!deletePerf.logScheduled) {
        deletePerf.logScheduled = true;
        queueMicrotask(() => {
          if (deletePerfRef.current !== deletePerf) return;
          deletePerfRef.current = null;
          const round = (value) =>
            Math.round((Number(value) || 0) * 100) / 100;
          console.info("[Builder Delete Perf]", {
            type: deletePerf.type,
            source: deletePerf.source,
            removedIds: deletePerf.removedIds,
            removedCounts: deletePerf.removedCounts,
            removedElementCount: deletePerf.removedElementCount,
            weightedRemovedItemCount: deletePerf.weightedRemovedItemCount,
            preparationMs: round(deletePerf.preparationMs),
            clickToCommitWallMs: round(deletePerf.clickToCommitWallMs),
            canvasProfilerCommits: deletePerf.canvasCommits,
            canvasProfilerActualMs: round(deletePerf.canvasActualMs),
            canvasProfilerMaxMs: round(deletePerf.canvasActualMaxMs),
            sectionCacheHits: deletePerf.cacheHits,
            sectionCacheMisses: deletePerf.cacheMisses,
            sectionCacheMissReasons: deletePerf.cacheMissReasons,
            cacheStatsInterpretation:
              "summed per canvas commit; React dev render retries can produce cache hits with zero misses",
          });
        });
      }
    }
    const sidebarPerf =
      sidebarNativeDragPerfRef.current || sidebarNativeDropPerfRef.current;
    if (sidebarPerf?.active || sidebarPerf?.lastAction === "drop") {
      const cacheStats = canvasSectionCacheStatsRef.current;
      sidebarPerf.canvasRenderCommits += 1;
      sidebarPerf.canvasRenderTotalMs += actualDuration;
      sidebarPerf.canvasRenderMaxMs = Math.max(
        sidebarPerf.canvasRenderMaxMs,
        actualDuration
      );
      sidebarPerf.sectionCacheHits += cacheStats?.cacheHits || 0;
      sidebarPerf.sectionCacheMisses += cacheStats?.cacheMisses || 0;
      sidebarPerf.columnCacheHits += cacheStats?.columnRenderCacheHits || 0;
      sidebarPerf.columnCacheMisses += cacheStats?.columnRenderCacheMisses || 0;
      Object.entries(cacheStats?.missReasons || {}).forEach(([reason, count]) => {
        sidebarPerf.sectionCacheMissReasons[reason] =
          (sidebarPerf.sectionCacheMissReasons[reason] || 0) + count;
      });
    }
    const dataSliderPanelPerf = dataSliderPanelUpdatePerfRef.current;
    if (dataSliderPanelPerf) {
      const cacheStats = canvasSectionCacheStatsRef.current;
      dataSliderPanelPerf.canvasCommits += 1;
      dataSliderPanelPerf.canvasActualMs += actualDuration;
      dataSliderPanelPerf.canvasMaxMs = Math.max(
        dataSliderPanelPerf.canvasMaxMs,
        actualDuration
      );
      dataSliderPanelPerf.sectionCacheHits += cacheStats?.cacheHits || 0;
      dataSliderPanelPerf.sectionCacheMisses += cacheStats?.cacheMisses || 0;
      Object.entries(cacheStats?.missReasons || {}).forEach(([reason, count]) => {
        dataSliderPanelPerf.sectionCacheMissReasons[reason] =
          (dataSliderPanelPerf.sectionCacheMissReasons[reason] || 0) + count;
      });
      if (!dataSliderPanelPerf.logScheduled) {
        dataSliderPanelPerf.logScheduled = true;
        requestAnimationFrame(() => {
          if (dataSliderPanelUpdatePerfRef.current === dataSliderPanelPerf) {
            dataSliderPanelUpdatePerfRef.current = null;
          }
          const round = (value) =>
            Math.round((Number(value) || 0) * 100) / 100;
          console.info(`[${dataSliderPanelPerf.panelType} Panel Perf] commit`, {
            target: dataSliderPanelPerf.target,
            fields: dataSliderPanelPerf.fields,
            ...(Number.isFinite(dataSliderPanelPerf.queueMs)
              ? { queueMs: round(dataSliderPanelPerf.queueMs) }
              : {}),
            updateToPaintMs: round(
              performance.now() - dataSliderPanelPerf.startedAt
            ),
            patchMs: round(dataSliderPanelPerf.patchMs),
            canvasProfilerCommits: dataSliderPanelPerf.canvasCommits,
            canvasProfilerActualMs: round(dataSliderPanelPerf.canvasActualMs),
            canvasProfilerMaxMs: round(dataSliderPanelPerf.canvasMaxMs),
            sectionCacheHits: dataSliderPanelPerf.sectionCacheHits,
            sectionCacheMisses: dataSliderPanelPerf.sectionCacheMisses,
            sectionCacheMissReasons:
              dataSliderPanelPerf.sectionCacheMissReasons,
          });
        });
      }
    }
    const hoverPerf = hoverPerfRef.current;
    if (builderHoverPerfEnabled && hoverPerf) {
      hoverPerf.canvasCommits += 1;
      hoverPerf.canvasActualTotalMs += actualDuration;
      hoverPerf.canvasActualMaxMs = Math.max(
        hoverPerf.canvasActualMaxMs,
        actualDuration
      );
      const contentEpoch = canvasSectionRenderEpochRef.current;
      if (contentEpoch !== hoverPerf.lastContentRenderEpoch) {
        hoverPerf.contentRenderCount += Math.max(
          1,
          contentEpoch - hoverPerf.lastContentRenderEpoch
        );
        hoverPerf.lastContentRenderEpoch = contentEpoch;
        const reasons =
          canvasSectionCacheStatsRef.current?.contentChangeReasons || [];
        for (const reason of reasons) {
          if (!hoverPerf.contentRenderCauses.includes(reason)) {
            hoverPerf.contentRenderCauses.push(reason);
          }
        }
      }
    }
    const perf = dndPerfRef.current;
    if (!perf?.active) return;
    perf.renderCommits += 1;
    perf.renderTotalMs += actualDuration;
    perf.renderMaxMs = Math.max(perf.renderMaxMs, actualDuration);
    perf.baseRenderMaxMs = Math.max(perf.baseRenderMaxMs, baseDuration);
    if (perf.phase === "drag-start") {
      perf.dragStartRenderCommits += 1;
      perf.dragStartRenderTotalMs += actualDuration;
      perf.dragStartRenderMaxMs = Math.max(
        perf.dragStartRenderMaxMs,
        actualDuration
      );
    }
    perf.renderSamples.push({
      atMs: Math.round((performance.now() - perf.startedAt) * 100) / 100,
      phase: _phase,
      actualMs: Math.round(actualDuration * 100) / 100,
      baseMs: Math.round(baseDuration * 100) / 100,
      action: perf.lastAction,
    });
    if (actualDuration >= 50) {
      console.warn("[Builder DnD Slow Render]", {
        action: perf.lastAction,
        actualMs: Math.round(actualDuration * 100) / 100,
        cacheSize: canvasSectionRenderCacheRef.current.size,
        source: activeDragRef.current?.data?.current,
        target: dropTargetRef.current,
      });
    }
  };

  const recordOffscreenSectionProfiler = (
    profilerId,
    phase,
    actualDuration,
    baseDuration,
    _startTime,
    commitTime
  ) => {
    const sidebarPerf =
      sidebarNativeDragPerfRef.current || sidebarNativeDropPerfRef.current;
    if (sidebarPerf?.active || sidebarPerf?.lastAction === "drop") {
      const nativeProfilerMatch = /^BuilderSection:(\d+):/.exec(
        String(profilerId || "")
      );
      const sectionIndex = Number(nativeProfilerMatch?.[1]);
      const targetSectionIndex =
        dropTargetRef.current?.type === "ELEMENT" ||
        dropTargetRef.current?.type === "TAB-ELEMENT"
          ? dropTargetRef.current?.index?.conI
          : null;
      if (
        Number.isInteger(sectionIndex) &&
        sectionIndex === targetSectionIndex
      ) {
        sidebarPerf.targetSectionRenderCommits += 1;
        sidebarPerf.targetSectionRenderTotalMs += actualDuration;
        sidebarPerf.targetSectionRenderMaxMs = Math.max(
          sidebarPerf.targetSectionRenderMaxMs,
          actualDuration
        );
      }
    }
    if (!benchmarkOffscreenSections) return;
    const perf = offscreenSectionPerfRef.current;
    if (perf.commitTime !== commitTime) {
      perf.commitTime = commitTime;
      perf.phase = phase;
      perf.samples = [];
      const currentStructuralCounts = structuralRenderCountsRef.current;
      const previousStructuralCounts = perf.lastStructuralRenderCounts;
      const structuralKinds = ["splitRow", "container", "column", "span"];
      perf.structuralRenders = {
        shell: Object.fromEntries(
          structuralKinds.map((kind) => [
            kind,
            (currentStructuralCounts.shell[kind] || 0) -
              (previousStructuralCounts.shell[kind] || 0),
          ])
        ),
        heavy: Object.fromEntries(
          structuralKinds.map((kind) => [
            kind,
            (currentStructuralCounts.heavy[kind] || 0) -
              (previousStructuralCounts.heavy[kind] || 0),
          ])
        ),
      };
      perf.lastStructuralRenderCounts = {
        shell: { ...currentStructuralCounts.shell },
        heavy: { ...currentStructuralCounts.heavy },
      };
      const cacheStats = canvasSectionCacheStatsRef.current;
      const renderEpoch = cacheStats?.renderEpoch || 0;
      perf.contentRenderEpoch = renderEpoch;
      perf.contentRenderRan = perf.lastCommitRenderEpoch !== renderEpoch;
      perf.lastCommitRenderEpoch = renderEpoch;
      perf.cacheStats = cacheStats
        ? {
            ...cacheStats,
            missReasons: { ...cacheStats.missReasons },
          }
        : null;
    }
    const profilerKey = String(profilerId || "");
    const profilerMatch = /^BuilderSection:(\d+):(.*)$/.exec(profilerKey);
    const sectionIndex = Number(profilerMatch?.[1]);
    const rawId = profilerMatch?.[2] || profilerKey;
    perf.samples.push({
      id: rawId,
      index: sectionIndex,
      actualDuration,
      baseDuration,
    });
    if (perf.scheduled) return;
    perf.scheduled = true;
    requestAnimationFrame(() => {
      perf.scheduled = false;
      const scroller = canvasScrollRef.current;
      const samples = perf.samples;
      if (!scroller || samples.length === 0) return;

      const geometryStartedAt = performance.now();
      const viewportRect = scroller.getBoundingClientRect();
      let visibleSections = 0;
      let offscreenSections = 0;
      let visibleActualMs = 0;
      let offscreenActualMs = 0;
      let visibleBaseMs = 0;
      let offscreenBaseMs = 0;
      let unresolvedSections = 0;
      const sectionRows = [];

      for (const sample of samples) {
        const node = scroller.querySelector(
          `[data-drop="SECTION"][data-section-index="${sample.index}"]`
        );
        if (!node || node.getAttribute("data-drop") !== "SECTION") {
          unresolvedSections += 1;
          continue;
        }
        const rect = node.getBoundingClientRect();
        const visible =
          rect.bottom > viewportRect.top && rect.top < viewportRect.bottom;
        if (visible) {
          visibleSections += 1;
          visibleActualMs += sample.actualDuration;
          visibleBaseMs += sample.baseDuration;
        } else {
          offscreenSections += 1;
          offscreenActualMs += sample.actualDuration;
          offscreenBaseMs += sample.baseDuration;
        }
        sectionRows.push({
          index: sample.index,
          id: sample.id,
          visibility: visible ? "visible" : "offscreen",
          actualMs: Math.round(sample.actualDuration * 100) / 100,
          baseMs: Math.round(sample.baseDuration * 100) / 100,
          top: Math.round(rect.top),
          height: Math.round(rect.height),
        });
      }

      const round = (value) =>
        Math.round((Number(value) || 0) * 100) / 100;
      const summary = {
        phase: perf.phase,
        contentRenderEpoch: perf.contentRenderEpoch,
        contentRenderRan: perf.contentRenderRan,
        weightedItems: canvasLayoutCounts.total,
        renderedSections: samples.length,
        cacheHits: perf.cacheStats?.cacheHits || 0,
        cacheMisses: perf.cacheStats?.cacheMisses || 0,
        cacheMissReasons: perf.cacheStats?.missReasons || {},
        layoutsRootChanged: Boolean(perf.cacheStats?.layoutsRootChanged),
        dragRenderActive: Boolean(perf.cacheStats?.dragRenderActive),
        reusePostElementDropCache: Boolean(
          perf.cacheStats?.reusePostElementDropCache
        ),
        contentChangeReasons: perf.cacheStats?.contentChangeReasons || [],
        contentRenderCausePhase:
          perf.cacheStats?.contentRenderCausePhase || "unavailable",
        contentRenderAt: perf.cacheStats?.contentRenderAt ?? null,
        contentDndLifecycle: perf.cacheStats?.contentDndLifecycle || null,
        structuralShellRenders: perf.structuralRenders?.shell || {},
        structuralHeavyRenders: perf.structuralRenders?.heavy || {},
        offscreenExperimentEnabled: offscreenSectionExperimentEnabled,
        offscreenEligibleSections: offscreenEligibleSectionCount,
        visibleSections,
        offscreenSections,
        unresolvedSections,
        visibleActualMs: round(visibleActualMs),
        offscreenActualMs: round(offscreenActualMs),
        visibleBaseMs: round(visibleBaseMs),
        offscreenBaseMs: round(offscreenBaseMs),
        offscreenRenderSharePct: round(
          (offscreenActualMs /
            Math.max(0.001, visibleActualMs + offscreenActualMs)) *
            100
        ),
        geometryReadMs: round(performance.now() - geometryStartedAt),
      };
      console.groupCollapsed(
        `[Builder Section Perf] ${summary.offscreenSections} offscreen / ${summary.renderedSections} rendered`
      );
      console.table(summary);
      console.table(sectionRows);
      console.log("Copy this object:", { summary, sections: sectionRows });
      console.groupEnd();
    });
  };

  const finishDndPerf = (reason) => {
    const perf = dndPerfRef.current;
    if (!perf?.active) return;
    perf.active = false;
    requestAnimationFrame(() => {
      const round = (value) => Math.round((Number(value) || 0) * 100) / 100;
      const durationMs = performance.now() - perf.startedAt;
      const summary = {
        reason,
        type: perf.type,
        dndScope: perf.dndScope,
        sections: canvasLayoutCounts.sections,
        elements: canvasLayoutCounts.elements,
        weightedItems: canvasLayoutCounts.total,
        dragDurationMs: round(durationMs),
        firstMoveDelayMs: round(perf.firstMoveDelayMs),
        moveCount: perf.moveCount,
        moveAvgMs: round(perf.moveTotalMs / Math.max(1, perf.moveCount)),
        moveMaxMs: round(perf.moveMaxMs),
        collisionCount: perf.collisionCount,
        collisionAvgMs: round(
          perf.collisionTotalMs / Math.max(1, perf.collisionCount)
        ),
        collisionMaxMs: round(perf.collisionMaxMs),
        collisionCandidatesAvg: round(
          perf.collisionCandidatesTotal / Math.max(1, perf.collisionCount)
        ),
        collisionCandidatesMax: perf.collisionCandidatesMax,
        renderCommits: perf.renderCommits,
        renderTotalMs: round(perf.renderTotalMs),
        renderAvgMs: round(
          perf.renderTotalMs / Math.max(1, perf.renderCommits)
        ),
        renderMaxMs: round(perf.renderMaxMs),
        baseRenderMaxMs: round(perf.baseRenderMaxMs),
        dragStartCanvasCommits: perf.dragStartRenderCommits,
        dragStartCanvasActualMs: round(perf.dragStartRenderTotalMs),
        dragStartCanvasActualMaxMs: round(perf.dragStartRenderMaxMs),
        bucketCollisionCount: perf.bucketCollisionCount,
        fallbackCollisionCount: perf.fallbackCollisionCount,
        dropCommitMs: round(perf.dropCommitMs),
        scopedIntentCount: perf.scopedIntentCount,
        scopedIntentAvgMs: round(
          perf.scopedIntentTotalMs / Math.max(1, perf.scopedIntentCount)
        ),
        scopedIntentMaxMs: round(perf.scopedIntentMaxMs),
        scopedTargetChanges: perf.scopedTargetChanges,
        scopedPlaceholderMounts: perf.scopedPlaceholderMounts,
        scopedPlaceholderMoves: perf.scopedPlaceholderMoves,
        scopedPlaceholderRemovals: perf.scopedPlaceholderRemovals,
        scopedPlaceholderSkippedDuplicates:
          perf.scopedPlaceholderSkippedDuplicates,
        scopedPlaceholderResolveAvgMs: round(
          perf.scopedPlaceholderResolveTotalMs /
            Math.max(
              1,
              perf.scopedPlaceholderMounts + perf.scopedPlaceholderMoves
            )
        ),
        scopedPlaceholderResolveMaxMs: round(
          perf.scopedPlaceholderResolveMaxMs
        ),
        scopedPlaceholderWriteAvgMs: round(
          perf.scopedPlaceholderWriteTotalMs /
            Math.max(
              1,
              perf.scopedPlaceholderMounts +
                perf.scopedPlaceholderMoves +
                perf.scopedPlaceholderRemovals
            )
        ),
        scopedPlaceholderWriteMaxMs: round(perf.scopedPlaceholderWriteMaxMs),
        scopedFlipNodeCount: perf.scopedFlipNodeCount,
        scopedFlipAnimationBatches: perf.scopedFlipAnimationBatches,
        scopedFlipCaptureAvgMs: round(
          perf.scopedFlipCaptureTotalMs /
            Math.max(1, perf.scopedFlipCaptureCount)
        ),
        scopedFlipCaptureMaxMs: round(perf.scopedFlipCaptureMaxMs),
        scopedFlipWriteAvgMs: round(
          perf.scopedFlipWriteTotalMs / Math.max(1, perf.scopedFlipWriteCount)
        ),
        scopedFlipWriteMaxMs: round(perf.scopedFlipWriteMaxMs),
        scopedEventPointerCount: perf.scopedEventPointerCount,
        scopedCollisionPointerFallbackCount:
          perf.scopedCollisionPointerFallbackCount,
        topRenderCommits: [...perf.renderSamples]
          .sort((a, b) => b.actualMs - a.actualMs)
          .slice(0, 8),
      };
      finishBuilderPerformanceTransaction(
        perf.performanceTransactionId,
        {
          moveAvgMs: summary.moveAvgMs,
          moveMaxMs: summary.moveMaxMs,
          collisionAvgMs: summary.collisionAvgMs,
          collisionMaxMs: summary.collisionMaxMs,
          renderCount: summary.renderCommits,
          renderTotalMs: summary.renderTotalMs,
          renderMaxMs: summary.renderMaxMs,
          dropCommitMs: summary.dropCommitMs,
        },
        {
          reason,
          sections: summary.sections,
          elements: summary.elements,
        }
      );
    });
  };
  // การเก็บ Ref ของ Layout
  const contained = useRef([]); // Ref ของ container
  const columned = useRef([]); // Ref ของ column
  const spaned = useRef([]); // Ref ของ span
  const nestedSpaned = useRef([]); // Ref ของ nestedSpan
  const layoutsRef = useRef(layouts);
  layoutsRef.current = layouts;
  const pendingDeleteRefGridOpsRef = useRef([]);
  useLayoutEffect(() => {
    const canvas = document.querySelector("[data-builder-canvas='true']");
    if (!canvas) return;
    canvas.querySelectorAll(":scope > .container-area").forEach((node, index) => {
      node.classList.toggle("is-first-canvas-section", index === 0);
    });
  }, [layouts]);
  useLayoutEffect(() => {
    const operations = pendingDeleteRefGridOpsRef.current.splice(0);
    const spliceOuterGrid = (gridRef, layoutIndex) => {
      const grid = gridRef?.current;
      if (Array.isArray(grid)) grid.splice(layoutIndex, 1);
    };
    for (const operation of operations) {
      if (operation.removeLayout) {
        spliceOuterGrid(contained, operation.layoutIndex);
        spliceOuterGrid(columned, operation.layoutIndex);
        spliceOuterGrid(spaned, operation.layoutIndex);
        spliceOuterGrid(nestedSpaned, operation.layoutIndex);
        continue;
      }
      if (operation.removeSpan) {
        const spanGrid =
          spaned.current?.[operation.layoutIndex]?.[operation.columnIndex];
        const nestedGrid =
          nestedSpaned.current?.[operation.layoutIndex]?.[operation.columnIndex];
        if (operation.collapseToColumn) {
          if (spaned.current?.[operation.layoutIndex]) {
            spaned.current[operation.layoutIndex][operation.columnIndex] = null;
          }
          if (nestedSpaned.current?.[operation.layoutIndex]) {
            nestedSpaned.current[operation.layoutIndex][operation.columnIndex] =
              null;
          }
        } else {
          if (Array.isArray(spanGrid)) {
            spanGrid.splice(operation.spanIndex, 1);
          }
          if (Array.isArray(nestedGrid)) {
            nestedGrid.splice(operation.spanIndex, 1);
          }
        }
        continue;
      }
      for (const gridRef of [columned, spaned, nestedSpaned]) {
        const sectionGrid = gridRef?.current?.[operation.layoutIndex];
        if (Array.isArray(sectionGrid)) {
          sectionGrid.splice(operation.columnIndex, 1);
        }
      }
    }
  }, [layouts]);
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
    if (builderModeRef.current !== "Editor Mode") return;
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
  }, [builderMode, setSelectID]);

  useEffect(() => {
    if (!openListBoxTextEditRef) return;
    openListBoxTextEditRef.current = openListBoxItemTextEdit;
    return () => {
      openListBoxTextEditRef.current = null;
    };
  }, [openListBoxTextEditRef, openListBoxItemTextEdit]);

  const openListBoxItemIconEdit = useCallback(
    (listBoxEl, itemIndex) => {
      if (builderModeRef.current !== "Editor Mode") return;
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
    [builderMode, openOffcavanas, setSelectID]
  );

  const openListBoxItemImageEdit = useCallback(
    (listBoxEl, itemIndex) => {
      if (builderModeRef.current !== "Editor Mode") return;
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
    [builderMode, openOffcavanas, setSelectID]
  );

  const patchLayoutElement = useCallback(
    (data, ids) => {
      const eleID = ids?.eleID ?? ids?.id;
      if (eleID == null || eleID === "") return;
      const panelUpdatePerf =
        (dataSliderPerfEnabled && data?.type === "dts") ||
        (categoriesPerfEnabled && data?.type === "ctg") ||
        (tabsPerfEnabled && data?.type === "tabs") ||
        (accordionPerfEnabled && data?.type === "acc") ||
        (postPerfEnabled && data?.type === "post") ||
        (listItemsPerfEnabled &&
          (data?.type === "list" ||
            data?.type === "lstb" ||
            data?.type === "crl" ||
            data?.type === "tbl" ||
            data?.type === "btw" ||
            data?.type === "imgh" ||
            data?.type === "imgo" ||
            data?.type === "text" ||
            data?.type === "heading"))
          ? {
              panelType:
                data?.type === "ctg"
                  ? "Categories"
                  : data?.type === "heading"
                    ? "Heading"
                  : data?.type === "text"
                    ? "Text Editor"
                  : data?.type === "imgo"
                    ? "Overlay"
                  : data?.type === "imgh"
                    ? "Image Hover"
                  : data?.type === "btw"
                    ? "Between"
                  : data?.type === "tbl"
                    ? "Data Table"
                  : data?.type === "crl"
                    ? "Carousel"
                  : data?.type === "lstb"
                    ? "List Box"
                  : data?.type === "tabs"
                    ? "Tabs"
                    : data?.type === "acc"
                      ? "Accordion"
                      : data?.type === "post"
                        ? "Post"
                        : data?.type === "list"
                          ? data?.buttonMultiElement
                            ? "Button Group"
                            : data?.listIconsElement
                            ? "List Icons"
                            : data?.listImageElement
                              ? "List Images"
                            : "List Items"
                    : "Data Slider",
              target: String(eleID),
              fields: Array.isArray(ids?.panelChangedFields)
                ? ids.panelChangedFields
                : [],
              startedAt: performance.now(),
              patchMs: 0,
              canvasCommits: 0,
              canvasActualMs: 0,
              canvasMaxMs: 0,
              sectionCacheHits: 0,
              sectionCacheMisses: 0,
              sectionCacheMissReasons: {},
              logScheduled: false,
            }
          : null;
      if (panelUpdatePerf) {
        dataSliderPanelUpdatePerfRef.current = panelUpdatePerf;
      }

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
        if (
          cleaned.buttonSpecialTextParagraph &&
          typeof cleaned.buttonSpecialTextParagraph === "object"
        ) {
          list[i].buttonSpecialTextParagraph = lodash.cloneDeep(
            cleaned.buttonSpecialTextParagraph
          );
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
        if (cleaned.listBoxItems && Array.isArray(cleaned.listBoxItems)) {
          list[i].listBoxItems = lodash.cloneDeep(cleaned.listBoxItems);
        }
        if (cleaned.tableColumns && Array.isArray(cleaned.tableColumns)) {
          list[i].tableColumns = lodash.cloneDeep(cleaned.tableColumns);
        }
        if (cleaned.tableRows && Array.isArray(cleaned.tableRows)) {
          list[i].tableRows = lodash.cloneDeep(cleaned.tableRows);
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
        if (cleaned.catagoriesTabs && Array.isArray(cleaned.catagoriesTabs)) {
          const mergedHost = mergeCatagoriesElement({
            ...list[i],
            catagoriesTabs: cleaned.catagoriesTabs,
          });
          list[i].catagoriesTabs = lodash.cloneDeep(mergedHost.catagoriesTabs);
          list[i].catagoriesActiveCategoryId =
            mergedHost.catagoriesActiveCategoryId;
          list[i].catagoriesItems = lodash.cloneDeep(mergedHost.catagoriesItems);
          list[i].catagoriesItemCount = mergedHost.catagoriesItemCount;
          list[i].catagoriesActiveId = mergedHost.catagoriesActiveId;
        }
        if (cleaned.accordionItems && Array.isArray(cleaned.accordionItems)) {
          list[i].accordionItems = lodash.cloneDeep(cleaned.accordionItems);
        }
        if (cleaned.postElements && Array.isArray(cleaned.postElements)) {
          list[i].postElements = lodash.cloneDeep(cleaned.postElements);
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
        if (cleaned.borderRadius !== undefined) {
          list[i].borderRadius = lodash.cloneDeep(cleaned.borderRadius);
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
        const patchStartedAt = panelUpdatePerf ? performance.now() : 0;
        const finishPanelPatch = (nextLayouts) => {
          if (panelUpdatePerf) {
            panelUpdatePerf.patchMs += performance.now() - patchStartedAt;
          }
          return nextLayouts;
        };
        if (
          data?.type === "dts" ||
          data?.type === "ctg" ||
          data?.type === "tabs" ||
          data?.type === "acc" ||
          data?.type === "post" ||
          data?.type === "list" ||
          data?.type === "lstb" ||
          data?.type === "crl" ||
          data?.type === "tbl" ||
          data?.type === "btw" ||
          data?.type === "imgh" ||
          data?.type === "imgo" ||
          data?.type === "img" ||
          data?.type === "bnr" ||
          data?.type === "vid" ||
          data?.type === "lbx" ||
          data?.type === "text" ||
          data?.type === "heading" ||
          data?.type === "icon" ||
          data?.type === "btn" ||
          data?.type === "btnG" ||
          data?.type === "ctn" ||
          data?.type === "divider" ||
          data?.type === "form"
        ) {
          let targetPath = null;
          for (let conI = 0; conI < prev.length && !targetPath; conI += 1) {
            const columns = prev[conI]?.columns || [];
            for (let colI = 0; colI < columns.length && !targetPath; colI += 1) {
              const column = columns[colI];
              if (
                column?.elements?.some(
                  (item) => String(item?.id || "") === String(eleID)
                )
              ) {
                targetPath = { conI, colI, spnI: null, nestI: null };
                break;
              }
              const spans = column?.spans || [];
              for (let spnI = 0; spnI < spans.length && !targetPath; spnI += 1) {
                const span = spans[spnI];
                if (
                  span?.elements?.some(
                    (item) => String(item?.id || "") === String(eleID)
                  )
                ) {
                  targetPath = { conI, colI, spnI, nestI: null };
                  break;
                }
                const nestedSpans = span?.nestedSpans || [];
                for (
                  let nestI = 0;
                  nestI < nestedSpans.length && !targetPath;
                  nestI += 1
                ) {
                  if (
                    nestedSpans[nestI]?.elements?.some(
                      (item) => String(item?.id || "") === String(eleID)
                    )
                  ) {
                    targetPath = { conI, colI, spnI, nestI };
                  }
                }
              }
            }
          }

          if (targetPath) {
            const { conI, colI, spnI, nestI } = targetPath;
            const nextLayouts = prev.slice();
            const sourceSection = prev[conI];
            const section = {
              ...sourceSection,
              columns: sourceSection.columns.slice(),
            };
            const sourceColumn = sourceSection.columns[colI];
            const column = { ...sourceColumn };
            if (Array.isArray(sourceColumn.spans)) {
              column.spans = sourceColumn.spans.slice();
            }
            nextLayouts[conI] = section;
            section.columns[colI] = column;

            let owner = column;
            if (Number.isInteger(spnI)) {
              const sourceSpan = sourceColumn.spans[spnI];
              const span = { ...sourceSpan };
              if (Array.isArray(sourceSpan.nestedSpans)) {
                span.nestedSpans = sourceSpan.nestedSpans.slice();
              }
              column.spans[spnI] = span;
              owner = span;
              if (Number.isInteger(nestI)) {
                const nestedSpan = { ...sourceSpan.nestedSpans[nestI] };
                span.nestedSpans[nestI] = nestedSpan;
                owner = nestedSpan;
              }
            }

            owner.elements = owner.elements.slice();
            if (!patchList(owner.elements)) return prev;
            markScopedLayoutSnapshot(nextLayouts);
            layoutsRef.current = nextLayouts;
            return finishPanelPatch(nextLayouts);
          }
        }
        const newLayouts = lodash.cloneDeep(prev);
        for (const layout of newLayouts) {
          const cols = layout?.columns;
          if (!cols?.length) continue;
          for (const col of cols) {
            if (patchList(col.elements)) return finishPanelPatch(newLayouts);
            if (patchTabsNestedList(col.elements)) return finishPanelPatch(newLayouts);
            if (!col.spans?.length) continue;
            for (const sp of col.spans) {
              if (patchList(sp.elements)) return finishPanelPatch(newLayouts);
              if (patchTabsNestedList(sp.elements)) return finishPanelPatch(newLayouts);
              if (!sp.nestedSpans?.length) continue;
              for (const ms of sp.nestedSpans) {
                if (patchList(ms.elements)) return finishPanelPatch(newLayouts);
                if (patchTabsNestedList(ms.elements)) return finishPanelPatch(newLayouts);
              }
            }
          }
        }
        if (panelUpdatePerf) {
          dataSliderPanelUpdatePerfRef.current = null;
        }
        return prev;
      });
    },
    [
      accordionPerfEnabled,
      categoriesPerfEnabled,
      dataSliderPerfEnabled,
      listItemsPerfEnabled,
      postPerfEnabled,
      setLayout,
      tabsPerfEnabled,
    ]
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
      if (builderModeRef.current === "Layout Mode") {
        if (FORM_ELEMENT_TYPES.has(type)) {
          return openOffcavanas("Form", tabElementForPanel, onUpdateNested);
        }
        if (type === "imgh") return openOffcavanas("Image Hover", tabElementForPanel, onUpdateNested);
        if (type === "imgo") return openOffcavanas("Overlay", tabElementForPanel, onUpdateNested);
        if (type === "list") return openOffcavanas("List", tabElementForPanel, onUpdateNested);
        if (type === "crl") return openOffcavanas("Carousel", tabElementForPanel, onUpdateNested);
        if (type === "dts") return openOffcavanas("Data Slider", tabElementForPanel, onUpdateNested);
        if (type === "ctg") return openOffcavanas("Catagories", tabElementForPanel, onUpdateNested);
        if (type === "tbl") return openOffcavanas("Table", tabElementForPanel, onUpdateNested);
        if (type === "btw") return openOffcavanas("Between", tabElementForPanel, onUpdateNested);
        if (type === "divider") return openOffcavanas("Divider", tabElementForPanel, onUpdateNested);
        if (type === "form") return openOffcavanas("FormBlock", tabElementForPanel, onUpdateNested);
        if (type === "lstb") return openOffcavanas("List Box", tabElementForPanel, onUpdateNested);
        if (type === "tabs") return openOffcavanas("Tabs", tabElementForPanel, onUpdateNested);
        if (type === "acc") return openOffcavanas("Accordion", tabElementForPanel, onUpdateNested);
        if (type === "post") return openOffcavanas("Post", tabElementForPanel, onUpdateNested);
        return; // text, heading, img, bnr, ctn ฯลฯ — ไม่เปิดใน Layout Mode
      }

      /* Editor Mode */
      if (type === "text" || type === "frmText") {
        setTextEditModal({ elementData: tabElement });
        return;
      }
      if (FORM_ELEMENT_TYPES.has(type)) {
        return openOffcavanas("Form", tabElementForPanel, onUpdateNested);
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
      if (type === "form") return openOffcavanas("FormBlock", tabElementForPanel, onUpdateNested);
      if (type === "tabs") return openOffcavanas("Tabs", tabElementForPanel, onUpdateNested);
      if (type === "acc") return openOffcavanas("Accordion", tabElementForPanel, onUpdateNested);
      if (type === "post") return openOffcavanas("Post", tabElementForPanel, onUpdateNested);
    },
    [builderMode, openOffcavanas, patchTabsNestedElementById]
  );

  const deleteTabNestedElement = useCallback(
    (tabsHostId, tabId, elementId) => {
      const hostLocation = findLayoutElementListIndex(
        layoutsRef.current || [],
        tabsHostId
      );
      const hostElement = hostLocation?.list?.[hostLocation?.ix];
      const nestedElementExists = (() => {
        if (!hostElement) return false;
        if (hostElement.type === "ctg") {
          const mergedHost = mergeCatagoriesElement(hostElement);
          return (mergedHost?.catagoriesTabs || []).some((category) =>
            (category?.items || []).some(
              (item) =>
                String(item?.id || "") === String(tabId || "") &&
                (item?.elements || []).some(
                  (entry) => String(entry?.id || "") === String(elementId || "")
                )
            )
          );
        }
        const hostItems =
          hostElement.type === "tabs"
            ? hostElement.tabsItems
            : hostElement.type === "acc"
              ? hostElement.accordionItems
              : hostElement.type === "post"
                ? [{ id: "post-main", elements: hostElement.postElements }]
                : hostElement.type === "dts"
                  ? hostElement.dataSliderItems
                  : null;
        const targetItem = Array.isArray(hostItems)
          ? hostItems.find((item) => String(item?.id || "") === String(tabId || ""))
          : null;
        return Boolean(
          targetItem?.elements?.some(
            (entry) => String(entry?.id || "") === String(elementId || "")
          )
        );
      })();
      if (nestedElementExists) {
        beginCanvasPerformanceTransaction("canvas-delete", {
          label: `ลบองค์ประกอบซ้อน / ${String(elementId || "")}`,
          elementType: "element",
          elementId,
          scope: `${String(tabsHostId || "")}/${String(tabId || "")}`,
          skipInitialFrameGap: true,
        });
      }
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
      setSelectID(
        (prevSel) => {
          if (String(prevSel?.ids?.eleID || "") !== deletedId) return prevSel;
          return { ids: {}, status: "" };
        },
        { performanceTransaction: false }
      );
      if (String(offcanvasID || "") === deletedId) {
        openOffcavanas(null, null, null);
      }
    },
    [
      beginCanvasPerformanceTransaction,
      setLayout,
      setSelectID,
      offcanvasID,
      openOffcavanas,
    ]
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
      const hostLocation = findLayoutElementListIndex(layouts, tabsHostId);
      const selectionIds = {
        conID: hostLocation?.conID,
        colID: hostLocation?.colID,
        spnID: hostLocation?.spnID,
        nestID: hostLocation?.nestID,
        tabsHostId,
        tabId,
        eleID: tabElement.id,
      };
      const getFresh = () =>
        findLayoutElementById(layouts, String(tabElement.id)) ?? tabElement;
      return (
        <TabNestedElementSelectionBoundary ids={selectionIds}>
          <div
            key={String(tabElement.id || `tab-nested-${tabElementIndex}`)}
            data-tabs-nested-edit-id={String(tabElement.id || "")}
            data-tab-nested-id={String(tabElement.id || "")}
            className="w-full"
            onDoubleClickCapture={(e) => {
              /* Layout Mode: intercept & open element's config panel */
              if (builderModeRef.current !== "Layout Mode") return;
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
              if (builderModeRef.current !== "Editor Mode") return;
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
              if (builderModeRef.current !== "Editor Mode") return;
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
        </TabNestedElementSelectionBoundary>
      );
    },
    [
      builderMode,
      deleteTabNestedElement,
      device,
      dragRef,
      isDraggingLayout,
      layouts,
      openListBoxItemIconEdit,
      openListBoxItemImageEdit,
      openListBoxItemTextEdit,
      openOffcavanas,
      openTabsNestedElementEditor,
      patchTabsNestedElementById,
      setTextEditModal,
      theme,
    ]
  );

  // useEffect
  const clearGhostRef = useRef(null);
  const speakToastRef = useRef(speakToast);
  speakToastRef.current = speakToast;

  useEffect(() => {
   if(builderModeRef.current !== "Layout Mode"){
    setSelectID({status:"",ids:{}});
    setPositionElementSetting({ x: null, y: null });
    // copy/paste element disabled
   }
  }, [builderMode, setSelectID]); // ควบคุมการลบ ele
  useEffect(() => {
    if (builderModeRef.current !== "Editor Mode") return;
    setLayout((prev) => {
      if (!Array.isArray(prev)) return prev;
      const next = lodash.cloneDeep(prev);
      stripOrphanInlineRowGroupsEverywhere(next);
      if (lodash.isEqual(prev, next)) return prev;
      return next;
    });
  }, [builderMode, setLayout]);
  useEffect(() => {
    if(builderModeRef.current !== "Layout Mode"){
      setIsDraggingLayout(false);
      setActiveID(null);
      setActiveItem(null);
      clearGhostRef.current?.();
    }
   }, [builderMode]); // ควบคุมการลบ ele
  useEffect(() => {
    return () => {
      if (dropMotionTimerRef.current) {
        clearTimeout(dropMotionTimerRef.current);
        dropMotionTimerRef.current = null;
      }
    };
  }, []);
  useEffect(() => {
    if (!preview) return;
    const cancle = () => {
      if (Date.now() - (Number(lastDropHandledAtRef.current) || 0) < 260) return;
      setTimeout(() => clearGhostRef.current?.(), 0);
    };

    window.addEventListener("dragend", cancle, false);

    return () => {
      window.removeEventListener("dragend", cancle, false);
    };
  }, [preview]); // ยกเลิก Ghost จำลองตำแหน่ง layout ใหม่เมื่อไม่มีการวางเกิดขึ้น

  useEffect(() => {
    const onDropCapture = (e) => {
      windowDropHandlerRef.current?.(e);
    };
    window.addEventListener("drop", onDropCapture, { capture: true });
    return () => {
      window.removeEventListener("drop", onDropCapture, { capture: true });
    };
  }, []);

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
        } catch {
          /* no-op */
        }
      });
      toastAudioByKeyRef.current = {};
    };
  }, []);

  useEffect(() => {
    if (!carouselColToastOpen) return;
    speakToastRef.current(TOAST_VOICE_MESSAGES.carousel, "carousel");
  }, [carouselColToastOpen]);

  useEffect(() => {
    if (!listImageColToastOpen) return;
    speakToastRef.current(TOAST_VOICE_MESSAGES.listImage, "listImage");
  }, [listImageColToastOpen]);

  useEffect(() => {
    if (!postColToastOpen) return;
    speakToastRef.current(TOAST_VOICE_MESSAGES.post, "post");
  }, [postColToastOpen]);

  useEffect(() => {
    if (!tabsInTabToastOpen) return;
    speakToastRef.current(TOAST_VOICE_MESSAGES.tabsInTab, "tabsInTab");
  }, [tabsInTabToastOpen]);

  useEffect(() => {
    if (!postInPostToastOpen) return;
    speakToastRef.current(TOAST_VOICE_MESSAGES.postInPost, "postInPost");
  }, [postInPostToastOpen]);

  useEffect(() => {
    if (!dataSliderTypeToastOpen) return;
    speakToastRef.current(TOAST_VOICE_MESSAGES.dataSliderType, "dataSliderType");
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
  const getSectionColumnDividerVisual = (
    layouts,
    IDX,
    theme
  ) => {
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

  const updateHoverPosition = (x, y, inputAt = 0) => {
    const updateStartedAt = builderHoverPerfEnabled ? performance.now() : 0;
    const el = document.elementFromPoint(x, y);
    const control = el?.closest(`[data-drop="BTN"],[data-drop="COLUMN-BTN"]`);
    const column = el?.closest(`[data-drop="COLUMN"]`);
    const section = el?.closest(`[data-drop="SECTION"]`);
    const span = el?.closest(`[data-drop="SPAN"]`);
    // MiniSpan ถูกถอดออกแล้ว: กันการจับ SPAN ซ้ำจน logic เข้า nested ผิด
    const nestedSpan = null;
    const element = el?.closest(`[data-drop="ELEMENT"]`);
    const sectionDomId = section?.getAttribute("id") || "";
    const splitHalf = el?.closest("[data-split-secid]");
    const sectionId =
      splitHalf?.getAttribute("data-split-secid") || sectionDomId;
    const splitRowId =
      splitHalf && sectionDomId && sectionDomId !== sectionId
        ? sectionDomId
        : "";
    const columnId = layoutColumnKeyFromDomColumnId(
      column?.getAttribute("id") || ""
    );
    const publish = (target) => {
      const changed = structuralOptionStoreRef.current.publishHover(
        target,
        inputAt
      );
      if (builderHoverPerfEnabled) {
        const perf = ensureHoverPerfSession();
        perf.updateCount += 1;
        const elapsed = performance.now() - updateStartedAt;
        perf.updateTotalMs += elapsed;
        perf.updateMaxMs = Math.max(perf.updateMaxMs, elapsed);
      }
      return changed;
    };

    if (control) {
      const spanOwner = control.closest(`[data-drop="SPAN"]`);
      if (spanOwner) {
        const spanDomId = spanOwner.getAttribute("id");
        publish({
          kind: "span",
          id: spanDomIdToSpanKey(spanDomId) ?? spanDomId?.split("/").pop(),
          columnId,
          sectionId,
          splitRowId,
        });
        return "spn-btn";
      }
      const columnOwner = control.closest(`[data-drop="COLUMN"]`);
      if (columnOwner) {
        const colKey = layoutColumnKeyFromDomColumnId(columnOwner.getAttribute("id"));
        if (colKey) {
          publish({
            kind: "column",
            id: colKey,
            columnId: colKey,
            sectionId,
            splitRowId,
          });
          return "col-btn";
        }
      }
    }

    if (!section && !column && !element) {
      publish(null);
      return;
    }

    if (nestedSpan) {
      let msid = nestedSpan.getAttribute("id");
      publish({
        kind: "span",
        id: nestedSpanDomIdToKey(msid) ?? msid?.split("/").pop(),
        columnId,
        sectionId,
        splitRowId,
      });
      return "mspn";
    }

    if (span && column) {
      // ให้ More Option ของคอลัมน์ที่กดค้างอยู่ต่อได้ ถ้ายังอยู่ในคอลัมน์เดิม
      // และเคลียร์เฉพาะกรณี pointer ไปอยู่ span ของคอลัมน์อื่น
      const spanOwnerColKey = columnId;
      const pinnedColumnOptionId =
        structuralOptionStoreRef.current.getState().pinnedColumnId;
      if (
        pinnedColumnOptionId &&
        spanOwnerColKey &&
        pinnedColumnOptionId !== spanOwnerColKey
      ) {
        structuralOptionStoreRef.current.setPinned("column", null);
      }
      const spanDomId = span.getAttribute("id");
      publish({
        kind: "span",
        id: spanDomIdToSpanKey(spanDomId) ?? spanDomId?.split("/").pop(),
        columnId,
        sectionId,
        splitRowId,
      });
      return "spn";
    } else if (section && column) {
      const colKey = columnId;
      if (colKey) {
        publish({
          kind: "column",
          id: colKey,
          columnId: colKey,
          sectionId,
          splitRowId,
        });
        return "col";
      }
      publish({
        kind: "section",
        id: sectionId,
        sectionId,
        splitRowId,
      });
      return "sec";
    } else if (section && !column && !element) {
      publish({
        kind: "section",
        id: sectionId,
        sectionId,
        splitRowId,
      });
      return "sec";
    }
    publish(null);
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

  const scheduleBTNUpdate = (e) => {
    if (!isLayoutMode) return;
    // ปุ่ม option/hover ไม่ได้ใช้ตัดสิน drop target และมี DOM scan ค่อนข้างหนัก
    if (inlineSortableRenderersRef.current.dragActive) return;
    const { clientX, clientY } = e;
    const inputAt = builderHoverPerfEnabled ? performance.now() : 0;
    if (btnGroupRef.current) return;
    btnGroupRef.current = requestAnimationFrame(() => {
      btnGroupRef.current = null;
      return updateHoverPosition(clientX, clientY, inputAt);
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

  const cloneLayoutsForElementDrop = ({
    sourceLayouts,
    conI,
    colI,
    spnI = null,
    nestI = null,
    eleI,
    dropType = "ELEMENT",
    tabEleID = null,
  }) => {
    if (!Array.isArray(sourceLayouts)) return null;
    const sourceSection = sourceLayouts[conI];
    const sourceColumn = sourceSection?.columns?.[colI];
    if (!sourceSection || !sourceColumn) return null;

    const nextLayouts = sourceLayouts.slice();
    const section = {
      ...sourceSection,
      columns: sourceSection.columns.slice(),
    };
    const column = { ...sourceColumn };
    if (Array.isArray(sourceColumn.spans)) {
      column.spans = sourceColumn.spans.slice();
    }
    nextLayouts[conI] = section;
    section.columns[colI] = column;

    let owner = column;
    if (Number.isInteger(spnI)) {
      const sourceSpan = sourceColumn.spans?.[spnI];
      if (!sourceSpan || !Array.isArray(column.spans)) return null;
      const span = { ...sourceSpan };
      if (Array.isArray(sourceSpan.nestedSpans)) {
        span.nestedSpans = sourceSpan.nestedSpans.slice();
      }
      column.spans[spnI] = span;
      owner = span;

      if (Number.isInteger(nestI)) {
        const sourceNestedSpan = sourceSpan.nestedSpans?.[nestI];
        if (!sourceNestedSpan || !Array.isArray(span.nestedSpans)) return null;
        const nestedSpan = { ...sourceNestedSpan };
        span.nestedSpans[nestI] = nestedSpan;
        owner = nestedSpan;
      }
    }

    if (!Array.isArray(owner.elements)) return null;
    owner.elements = owner.elements.slice();

    if (dropType === "TAB-ELEMENT") {
      const hostIndexById = owner.elements.findIndex(
        (candidate) => String(candidate?.id || "") === String(tabEleID || "")
      );
      const hostIndex =
        hostIndexById >= 0
          ? hostIndexById
          : Number.isInteger(eleI)
            ? eleI
            : -1;
      if (hostIndex < 0 || !owner.elements[hostIndex]) return null;
      // Nested drops mutate the host's tab/slide arrays. Clone only that host,
      // while preserving every unrelated section and column reference.
      owner.elements[hostIndex] = lodash.cloneDeep(owner.elements[hostIndex]);
    }

    return nextLayouts;
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
    const dropPerf = sidebarNativeDragPerfRef.current;
    const sourceLayouts = layoutsRef.current || layouts;
    const isCanvasElementMove =
      activeDragRef.current?.data?.current?.type === "ELEMENT";
    const measureDroppedElement = (droppedElement) => {
      if (
        !dropPerf ||
        !isBuilderPerformanceEnabled() ||
        !droppedElement?.id
      ) {
        return;
      }
      setBuilderPerformanceTarget(droppedElement.type, droppedElement.id);
      setBuilderPerformanceTransactionTarget(
        dropPerf.performanceTransactionId,
        droppedElement.type,
        droppedElement.id
      );
    };
    const commitElementDrop = (nextLayouts) => {
      const commitStartedAt = dropPerf ? performance.now() : 0;
      markScopedLayoutSnapshot(nextLayouts);
      layoutsRef.current = nextLayouts;
      if (isCanvasElementMove) {
        flushSync(() => {
          setLayout(nextLayouts);
          clearGhost();
        });
      } else {
        clearGhost({ deferSidebarPreviewUnmount: true });
        setLayout(nextLayouts);
      }
      if (dropPerf) {
        dropPerf.layoutCommitMs += performance.now() - commitStartedAt;
      }
    };
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
    const element = isCanvasElementMove
      ? rawElement
      : stripIncomingInlineRowGroupIds(rawElement);
    if (element.container || isNull(conI) || isNull(colI) || isNull(eleI)) {
      clearGhost();
      return;
    }
    if (element?.type === "post" || element?.type === "ctg") {
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
    if (element?.type === "dts") {
      const w = getLayoutBucketWidthUnits(layouts, conI, colI, spnI, nestI);
      if (!Number.isFinite(w) || w < DATA_SLIDER_MIN_COL_UNITS) {
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
      if(spnI !== null){
        if(nestI !== null){

          data = sourceLayouts[conI].columns[colI].spans[spnI].nestedSpans[nestI]
          id = data.id.replace("Span-","")
        }else{
          data = sourceLayouts[conI].columns[colI].spans[spnI]

          id = data.id.replace("Span-","")

        }
      }else{
        data = sourceLayouts[conI].columns[colI]
        id = data.id.replace("Col-","")
      }
      latestEleID = data.latestEleID
    }
    getID();

    const makeDropUniqueSuffix = () =>
      `${Date.now().toString(36)}-${Math.ceil(Math.random() * 1e9).toString(36)}`;

    const bundle = element?.listIconsBundleDefaults;
    if (
      element.type === "list" &&
      Array.isArray(bundle) &&
      bundle.length > 1 &&
      !Array.isArray(element?.listItems)
    ) {
      const newLayouts = cloneLayoutsForElementDrop({
        sourceLayouts,
        conI,
        colI,
        spnI,
        nestI,
        eleI,
        dropType,
        tabEleID,
      });
      if (!newLayouts) {
        clearGhost();
        return;
      }
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
        id: `List-${id}-${lid0 + i}-${makeDropUniqueSuffix()}`,
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
      measureDroppedElement(rows[0]);
      commitElementDrop(newLayouts);
      return;
    }

    if (!isCanvasElementMove) {
      element.id += `${id}-${latestEleID}-${makeDropUniqueSuffix()}`;
      measureDroppedElement(element);
    }
    const cloneStartedAt = dropPerf ? performance.now() : 0;
    const newLayouts = cloneLayoutsForElementDrop({
      sourceLayouts,
      conI,
      colI,
      spnI,
      nestI,
      eleI,
      dropType,
      tabEleID,
    });
    if (dropPerf) {
      dropPerf.layoutCloneMs += performance.now() - cloneStartedAt;
    }
    if (!newLayouts) {
      clearGhost();
      return;
    }
    const insertStartedAt = dropPerf ? performance.now() : 0;
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
    if (dropPerf) {
      dropPerf.insertMs += performance.now() - insertStartedAt;
    }
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
    commitElementDrop(newLayouts);
  };

  const dropNewSection = () => {
    const dropPerf = sidebarNativeDragPerfRef.current;
    const sourceLayouts = layoutsRef.current || layouts;
    const commitSectionDrop = (nextLayouts) => {
      const commitStartedAt = dropPerf ? performance.now() : 0;
      markScopedLayoutSnapshot(nextLayouts);
      layoutsRef.current = nextLayouts;
      // Clear the isolated sidebar preview before the layout commit so the
      // canvas can reuse section/column caches instead of rebuilding the
      // drop-target section.
      clearGhost({ deferSidebarPreviewUnmount: true });
      setLayout(nextLayouts);
      if (dropPerf) {
        dropPerf.layoutCommitMs += performance.now() - commitStartedAt;
      }
    };
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
      const cloneStartedAt = dropPerf ? performance.now() : 0;
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
      const newLayouts = sourceLayouts.slice();
      if (dropPerf) {
        dropPerf.layoutCloneMs += performance.now() - cloneStartedAt;
      }
      const insertStartedAt = dropPerf ? performance.now() : 0;
      newLayouts.splice(dropTargetRef.current.index, 0, ...sectionsToInsert);
      if (dropPerf) {
        dropPerf.insertMs += performance.now() - insertStartedAt;
      }
      setPage((prev) => ({ ...prev, latestID: prev.latestID + 1 }));
      commitSectionDrop(newLayouts);
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
      const cloneStartedAt = dropPerf ? performance.now() : 0;
      const newLayouts = sourceLayouts.slice();
      if (dropPerf) {
        dropPerf.layoutCloneMs += performance.now() - cloneStartedAt;
      }
      const insertStartedAt = dropPerf ? performance.now() : 0;
      newLayouts.splice(dropTargetRef.current.index, 0, layout);
      if (dropPerf) {
        dropPerf.insertMs += performance.now() - insertStartedAt;
      }
      commitSectionDrop(newLayouts);
    } else {
      clearGhost();
      return;
    }
  };

  const handleDrop = (e) => {
    const dropHandlerStartedAt = performance.now();
    e.preventDefault();
    e.stopPropagation();
    const now = Date.now();
    lastDropHandledAtRef.current = now;
    if (
      dropCommitGuardRef.current.token === dragToken.current &&
      now - (Number(dropCommitGuardRef.current.at) || 0) < 220
    ) {
      return;
    }
    setSuppressDropMotion(true);
    if (dropMotionTimerRef.current) clearTimeout(dropMotionTimerRef.current);
    dropMotionTimerRef.current = setTimeout(() => {
      setSuppressDropMotion(false);
      dropMotionTimerRef.current = null;
    }, 180);
    dropCommitGuardRef.current = { token: dragToken.current, at: now };
    if (sidebarNativeDragPerfRef.current?.active) {
      sidebarNativeDragPerfRef.current.lastAction = "drop";
    }

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

    const dropPerf = sidebarNativeDragPerfRef.current;
    if (dropPerf) {
      dropPerf.dropValidationMs += performance.now() - dropHandlerStartedAt;
    }
    if (dropTargetRef.current.type === "SECTION") dropNewSection();
    else dropNewElement();
    if (dropPerf) {
      dropPerf.dropHandlerSyncMs += performance.now() - dropHandlerStartedAt;
    }
  };
  windowDropHandlerRef.current =
    (preview || sidebarPortalPreviewRef.current) && handleDropElement()
      ? handleDrop
      : null;

  const handleDuring = (e) => {
    if (!isLayoutMode) return;
    e.preventDefault();
    const nativeEvent = e?.nativeEvent ?? e;
    if (lastHandledDragOverEventRef.current === nativeEvent) return;
    lastHandledDragOverEventRef.current = nativeEvent;
    const dragoverStartedAt = performance.now();
    autoScrollCanvasForPointer(e.clientY);
    const isCanvasElementMove =
      activeDragRef.current?.data?.current?.type === "ELEMENT";
    const rawElement = handleDropElement();
    if (!isCanvasElementMove && rawElement) {
      startSidebarNativeDragPerf(rawElement);
      const activePerf = sidebarNativeDragPerfRef.current;
      if (activePerf?.dragoverCount === 0) {
        activePerf.startedAt = dragoverStartedAt;
      }
    }
    const finishDragoverMeasurement = ({ cacheHit = false } = {}) => {
      const perf = sidebarNativeDragPerfRef.current;
      if (!perf?.active) return;
      const elapsed = performance.now() - dragoverStartedAt;
      perf.dragoverCount += 1;
      perf.dragoverTotalMs += elapsed;
      perf.dragoverMaxMs = Math.max(perf.dragoverMaxMs, elapsed);
      if (cacheHit) perf.previewCacheHits += 1;
    };
    const cached = incomingDragPreviewRef.current;
    if (
      cached.source === rawElement &&
      cached.pageLatestID === page.latestID &&
      cached.isCanvasElementMove === isCanvasElementMove &&
      cached.preview
    ) {
      scheduleHoverUpdate(e, cached.type, cached.preview);
      finishDragoverMeasurement({ cacheHit: true });
      return;
    }
    const element = isCanvasElementMove
      ? lodash.cloneDeep(rawElement)
      : stripIncomingInlineRowGroupIds(rawElement);
    if (!element || typeof element !== "object") {
      finishDragoverMeasurement();
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
      incomingDragPreviewRef.current = {
        source: rawElement,
        pageLatestID: page.latestID,
        isCanvasElementMove,
        preview: ghostSec,
        type: "SECTION",
      };
      scheduleHoverUpdate(e, "SECTION", ghostSec);
      finishDragoverMeasurement();
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
      incomingDragPreviewRef.current = {
        source: rawElement,
        pageLatestID: page.latestID,
        isCanvasElementMove,
        preview: element,
        type: "SECTION",
      };
      scheduleHoverUpdate(e, "SECTION", element);

      finishDragoverMeasurement();
      return;
    }
    incomingDragPreviewRef.current = {
      source: rawElement,
      pageLatestID: page.latestID,
      isCanvasElementMove,
      preview: element,
      type: "ELEMENT",
    };
    scheduleHoverUpdate(e, "ELEMENT", element);
    finishDragoverMeasurement();
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

  const setDrop = (
    i,
    t,
    b = false,
    { immediateRender = false } = {}
  ) => {
    const safeIndex =
      t === "ELEMENT" && i && typeof i === "object"
        ? sanitizeElementDropIndex(i)
        : i;
    dropTargetRef.current = { index: safeIndex, type: t, isLast: b };
    const nextRenderKey =
      safeIndex && typeof safeIndex === "object"
        ? [
            t,
            safeIndex.conI,
            safeIndex.colI,
            safeIndex.spnI ?? "",
            safeIndex.nestI ?? "",
            safeIndex.eleI ?? "",
            safeIndex.tabEleID ?? "",
            safeIndex.tabId ?? "",
            safeIndex.tabEleI ?? "",
            b ? 1 : 0,
          ].join(":")
        : `${t ?? ""}:${safeIndex ?? ""}:${b ? 1 : 0}`;
    const updateDropRenderState = () => {
      setDropRenderKey((prev) => (prev === nextRenderKey ? prev : nextRenderKey));
    };
    const isScopedElementMove =
      useScopedColumnDnd &&
      activeDragRef.current?.data?.current?.type === "ELEMENT";
    if (immediateRender || t == null || isScopedElementMove) {
      updateDropRenderState();
    }
    else startTransition(updateDropRenderState);
    if (t === "ELEMENT" && i && typeof i === "object") {
      const updateHighlight = () => setElementDropHighlight((prev) => {
        const next = {
          conI: safeIndex.conI,
          colI: safeIndex.colI,
          spnI: safeIndex.spnI ?? null,
          nestI: safeIndex.nestI ?? null,
        };
        return prev?.conI === next.conI &&
          prev?.colI === next.colI &&
          prev?.spnI === next.spnI &&
          prev?.nestI === next.nestI
          ? prev
          : next;
      });
      if (isScopedElementMove) updateHighlight();
      else startTransition(updateHighlight);
    } else {
      setElementDropHighlight((prev) => (prev === null ? prev : null));
    }
    if (t === "ELEMENT") {
      dropHoldUntilRef.current = Date.now() + 180;
    }
    if (t !== "ELEMENT") {
      resetEleInsertSnapState();
      resetTabInlineRowSnapState();
    }
  };

  const scopedElementTargetKey = (dropElement) => {
    const index = dropElement?.index;
    if (
      dropElement?.type !== "ELEMENT" ||
      !Number.isInteger(index?.conI) ||
      !Number.isInteger(index?.colI) ||
      !Number.isInteger(index?.eleI)
    ) {
      return "";
    }
    return [
      index.conI,
      index.colI,
      index.spnI ?? "",
      index.nestI ?? "",
      index.eleI,
    ].join(":");
  };

  const cancelScopedElementFlipNode = (node) => {
    const registry = scopedElementFlipRef.current;
    const state = registry.states.get(node);
    if (!state) return;
    state.cancel();
  };

  const cancelAllScopedElementFlipAnimations = () => {
    const activeNodes = [...scopedElementFlipRef.current.activeNodes];
    for (const node of activeNodes) cancelScopedElementFlipNode(node);
  };

  const scopedElementFlipSiblings = (parents) => {
    const nodes = new Set();
    const activeElementId = String(
      activeDragRef.current?.data?.current?.element?.id ||
        activeDragRef.current?.id ||
        ""
    );
    for (const parent of parents) {
      if (parent?.nodeType !== 1) continue;
      for (const node of parent.children) {
        if (
          node?.nodeType !== 1 ||
          node === scopedElementPlaceholderRef.current ||
          node === ghostRef.current ||
          node.hasAttribute("data-scoped-element-placeholder") ||
          node.getAttribute("data-drop") !== "ELEMENT" ||
          node.classList.contains("column-area")
        ) {
          continue;
        }
        const rawId = node.getAttribute("id") || "";
        const elementId = rawId.split("/").pop() || "";
        if (
          !elementId ||
          elementId === "__null__" ||
          elementId.startsWith("ele-") ||
          (activeElementId && elementId === activeElementId)
        ) {
          continue;
        }
        nodes.add(node);
      }
    }
    return nodes;
  };

  const captureScopedElementFlipRects = (parents) => {
    const startedAt = performance.now();
    const rects = new Map();
    for (const node of scopedElementFlipSiblings(parents)) {
      rects.set(node, node.getBoundingClientRect());
    }
    return {
      rects,
      elapsed: performance.now() - startedAt,
    };
  };

  const animateScopedElementFlip = (beforeRects, afterRects) => {
    const changed = [];
    for (const [node, before] of beforeRects) {
      const after = afterRects.get(node);
      if (!after || !node.isConnected) continue;
      const x = before.left - after.left;
      const y = before.top - after.top;
      if (Math.abs(x) < 0.5 && Math.abs(y) < 0.5) continue;
      changed.push({ node, before, x, y });
    }
    if (changed.length === 0) return { nodeCount: 0, writeMs: 0 };

    const writeStartedAt = performance.now();
    const registry = scopedElementFlipRef.current;
    const prepared = [];
    for (const item of changed) {
      const { node, before } = item;
      const inlineTranslate = node.style.translate;
      const inlineTransition = node.style.transition;

      // Individual `translate` is independent from dnd-kit's `transform`.
      // Account for any element-owned translate while deriving the inverse.
      node.style.transition = "none";
      const computedTranslate = getComputedStyle(node).translate;
      let x = item.x;
      let y = item.y;
      if (computedTranslate && computedTranslate !== "none") {
        node.style.translate = "none";
        const untranslated = node.getBoundingClientRect();
        x = before.left - untranslated.left;
        y = before.top - untranslated.top;
      }
      node.style.translate = `${x}px ${y}px`;
      prepared.push({
        node,
        inlineTranslate,
        inlineTransition,
      });
    }

    // Commit every inverse first, then flush once so the transitions start
    // together even when two different columns/sections are affected.
    prepared[0]?.node.getBoundingClientRect();

    for (const item of prepared) {
      const { node, inlineTranslate, inlineTransition } = item;
      const flipTransition =
        "translate 180ms cubic-bezier(0.2, 0, 0, 1)";
      node.style.transition =
        inlineTransition && inlineTransition !== "none"
          ? `${inlineTransition}, ${flipTransition}`
          : flipTransition;
      node.style.translate = inlineTranslate;

      let timer = null;
      const finish = (restoreFromCurrentVisual = false) => {
        if (registry.states.get(node)?.finish !== finish) return;
        node.removeEventListener("transitionend", onTransitionEnd);
        if (timer != null) clearTimeout(timer);
        if (restoreFromCurrentVisual) {
          node.style.transition = "none";
          node.style.translate = inlineTranslate;
          // Ensure restoring the prior transition cannot animate stale FLIP.
          node.getBoundingClientRect();
        }
        node.style.transition = inlineTransition;
        registry.states.delete(node);
        registry.activeNodes.delete(node);
      };
      const onTransitionEnd = (event) => {
        if (event.target === node && event.propertyName === "translate") {
          finish(false);
        }
      };
      const cancel = () => finish(true);
      timer = setTimeout(() => finish(false), 240);
      node.addEventListener("transitionend", onTransitionEnd);
      registry.states.set(node, { cancel, finish });
      registry.activeNodes.add(node);
    }

    return {
      nodeCount: prepared.length,
      writeMs: performance.now() - writeStartedAt,
    };
  };

  const mutateScopedElementPlaceholderWithFlip = (
    parents,
    mutate,
    animate = true
  ) => {
    const uniqueParents = [...new Set(parents.filter(Boolean))];
    if (!animate) {
      cancelAllScopedElementFlipAnimations();
      const writeStartedAt = performance.now();
      mutate();
      return performance.now() - writeStartedAt;
    }

    const beforeCapture = captureScopedElementFlipRects(uniqueParents);
    for (const node of beforeCapture.rects.keys()) {
      cancelScopedElementFlipNode(node);
    }

    const mutationStartedAt = performance.now();
    mutate();
    const mutationWriteMs = performance.now() - mutationStartedAt;
    const afterCapture = captureScopedElementFlipRects(uniqueParents);
    const animation = animateScopedElementFlip(
      beforeCapture.rects,
      afterCapture.rects
    );

    const perf = dndPerfRef.current;
    if (perf?.active) {
      const captureMs = beforeCapture.elapsed + afterCapture.elapsed;
      const flipWriteMs = mutationWriteMs + animation.writeMs;
      perf.scopedFlipCaptureCount += 2;
      perf.scopedFlipCaptureTotalMs += captureMs;
      perf.scopedFlipCaptureMaxMs = Math.max(
        perf.scopedFlipCaptureMaxMs,
        beforeCapture.elapsed,
        afterCapture.elapsed
      );
      perf.scopedFlipWriteCount += 1;
      perf.scopedFlipWriteTotalMs += flipWriteMs;
      perf.scopedFlipWriteMaxMs = Math.max(
        perf.scopedFlipWriteMaxMs,
        flipWriteMs
      );
      if (animation.nodeCount > 0) {
        perf.scopedFlipAnimationBatches += 1;
        perf.scopedFlipNodeCount += animation.nodeCount;
      }
    }
    return mutationWriteMs;
  };

  const clearScopedElementPlaceholder = ({ animate = true } = {}) => {
    const commit = scopedElementPlaceholderCommitRef.current;
    if (commit.frame != null) {
      cancelAnimationFrame(commit.frame);
      commit.frame = null;
    }
    commit.pending = null;
    if (!animate) cancelAllScopedElementFlipAnimations();
    scopedElementPlaceholderTargetKeyRef.current = "";
    const node = scopedElementPlaceholderRef.current;
    if (node?.parentNode) {
      const oldParent = node.parentNode;
      const writeMs = mutateScopedElementPlaceholderWithFlip(
        [oldParent],
        () => oldParent.removeChild(node),
        animate
      );
      const perf = dndPerfRef.current;
      if (perf?.active) {
        perf.scopedPlaceholderRemovals += 1;
        perf.scopedPlaceholderWriteTotalMs += writeMs;
        perf.scopedPlaceholderWriteMaxMs = Math.max(
          perf.scopedPlaceholderWriteMaxMs,
          writeMs
        );
      }
    }
    scopedElementPlaceholderRef.current = null;
  };

  const findExactElementBucketMarker = (rawId) => {
    if (typeof document === "undefined" || !rawId) return null;
    const id = String(rawId);
    const escaped =
      typeof CSS !== "undefined" && typeof CSS.escape === "function"
        ? CSS.escape(id)
        : id.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    // Split columns can duplicate this id on their structural COLUMN shell.
    // Constrain by data-drop so insertion always targets the element bucket.
    return document.querySelector(
      `[data-drop="ELEMENT"][id="${escaped}"]`
    );
  };

  const renderScopedElementPlaceholder = (dropElement) => {
    if (typeof document === "undefined") return;
    const targetKey = scopedElementTargetKey(dropElement);
    if (!targetKey) {
      clearScopedElementPlaceholder();
      return;
    }

    const commit = scopedElementPlaceholderCommitRef.current;
    const node = scopedElementPlaceholderRef.current;
    if (
      targetKey === scopedElementPlaceholderTargetKeyRef.current &&
      node?.isConnected &&
      commit.pending == null
    ) {
      const perf = dndPerfRef.current;
      if (perf?.active) perf.scopedPlaceholderSkippedDuplicates += 1;
      return;
    }

    // Keep only the newest visual commit. dropTargetRef is updated synchronously
    // by the caller, so a release before this frame still drops at the latest intent.
    commit.pending = {
      dropElement: {
        type: dropElement.type,
        index: { ...dropElement.index },
        isLast: Boolean(dropElement.isLast),
      },
      targetKey,
    };
    if (commit.frame != null) return;

    commit.frame = requestAnimationFrame(() => {
      commit.frame = null;
      const pending = commit.pending;
      commit.pending = null;
      if (!pending) return;

      const latestTargetKey = scopedElementTargetKey(dropTargetRef.current);
      if (!latestTargetKey || latestTargetKey !== pending.targetKey) return;
      const currentNode = scopedElementPlaceholderRef.current;
      if (
        pending.targetKey === scopedElementPlaceholderTargetKeyRef.current &&
        currentNode?.isConnected
      ) {
        const perf = dndPerfRef.current;
        if (perf?.active) perf.scopedPlaceholderSkippedDuplicates += 1;
        return;
      }

      const resolveStartedAt = performance.now();
      const index = pending.dropElement.index;
      const bucketInfo = getBucketByDropIndex(
        layoutsRef.current,
        index.conI,
        index.colI,
        index?.spnI ?? null,
        index?.nestI ?? null
      );
      const bucket = bucketInfo?.elements;
      if (!Array.isArray(bucket)) return;

      const boundary = Math.max(0, Math.min(bucket.length, index.eleI));
      const beforeNode =
        boundary < bucket.length
          ? findDropElementNodeByEleId(bucket[boundary]?.id)
          : null;
      const afterNode =
        boundary > 0
          ? findDropElementNodeByEleId(bucket[boundary - 1]?.id)
          : null;

      // Empty buckets render a synthetic sortable marker. It provides the exact
      // insertion parent without guessing at column/span wrapper structure.
      const section = layoutsRef.current[index.conI];
      const column = section?.columns?.[index.colI];
      const span = Number.isInteger(index?.spnI)
        ? column?.spans?.[index.spnI]
        : null;
      const nestedSpan =
        span && Number.isInteger(index?.nestI)
          ? span?.nestedSpans?.[index.nestI]
          : null;
      const emptyMarkerId = [
        section?.container?.id,
        column?.id,
        span?.id,
        nestedSpan?.id,
      ]
        .filter(Boolean)
        .join("/");
      const emptyMarker =
        bucket.length === 0 && emptyMarkerId
          ? findExactElementBucketMarker(emptyMarkerId)
          : null;
      const parent =
        beforeNode?.parentNode ||
        afterNode?.parentNode ||
        emptyMarker?.parentNode ||
        null;
      const referenceNode =
        beforeNode || afterNode?.nextSibling || emptyMarker || null;
      const resolveMs = performance.now() - resolveStartedAt;
      if (!parent) return;

      let placeholder = currentNode;
      const isMount = !placeholder;
      if (!placeholder) {
        const activeRect =
          activeDragRef.current?.rect?.current?.initial ||
          activeDragRef.current?.rect?.current?.translated;
        const height = Math.max(
          44,
          Math.min(180, Number(activeRect?.height) || 44)
        );
        placeholder = document.createElement("div");
        placeholder.setAttribute("data-scoped-element-placeholder", "true");
        placeholder.setAttribute("aria-hidden", "true");
        Object.assign(placeholder.style, {
          width: "100%",
          height: `${height}px`,
          minHeight: `${height}px`,
          marginBottom: "8px",
          boxSizing: "border-box",
          border: "0",
          background: "transparent",
          pointerEvents: "none",
          flexShrink: "0",
        });
      }

      const oldParent = placeholder.parentNode;
      const writeMs = mutateScopedElementPlaceholderWithFlip(
        [oldParent, parent],
        () => parent.insertBefore(placeholder, referenceNode),
        true
      );
      scopedElementPlaceholderRef.current = placeholder;
      scopedElementPlaceholderTargetKeyRef.current = pending.targetKey;

      const perf = dndPerfRef.current;
      if (perf?.active) {
        if (isMount) perf.scopedPlaceholderMounts += 1;
        else perf.scopedPlaceholderMoves += 1;
        perf.scopedPlaceholderResolveTotalMs += resolveMs;
        perf.scopedPlaceholderResolveMaxMs = Math.max(
          perf.scopedPlaceholderResolveMaxMs,
          resolveMs
        );
        perf.scopedPlaceholderWriteTotalMs += writeMs;
        perf.scopedPlaceholderWriteMaxMs = Math.max(
          perf.scopedPlaceholderWriteMaxMs,
          writeMs
        );
      }
    });
  };

  const sidebarPreviewIdentity = (previewValue) => {
    if (!previewValue || typeof previewValue !== "object") return "none";
    const identities = sidebarPreviewIdentityRef.current;
    let id = identities.ids.get(previewValue);
    if (!id) {
      id = identities.nextId++;
      identities.ids.set(previewValue, id);
    }
    return id;
  };

  const sidebarNewElementTargetKey = (dropElement, previewValue = null) => {
    const index = dropElement?.index;
    if (
      (dropElement?.type !== "ELEMENT" &&
        dropElement?.type !== "TAB-ELEMENT") ||
      !index ||
      !Number.isInteger(index.conI) ||
      !Number.isInteger(index.colI) ||
      !Number.isInteger(index.eleI)
    ) {
      return "";
    }
    return [
      dropElement.type,
      index.conI,
      index.colI,
      index.spnI ?? "",
      index.nestI ?? "",
      index.eleI,
      index.tabEleID ?? "",
      index.tabId ?? "",
      index.tabEleI ?? "",
      index.inlineRowId ?? "",
      index.inlineGroupId ?? "",
      index.inlineRowStart ?? "",
      index.inlineRowEnd ?? "",
      dropElement.isLast ? 1 : 0,
      sidebarPreviewIdentity(previewValue),
    ].join(":");
  };

  const getSidebarNewElementTargetBucket = (dropElement) => {
    const index = dropElement?.index;
    if (!index) return null;
    const bucketInfo = getBucketByDropIndex(
      layoutsRef.current,
      index.conI,
      index.colI,
      index?.spnI ?? null,
      index?.nestI ?? null
    );
    const outerElements = bucketInfo?.elements;
    if (!Array.isArray(outerElements)) return null;
    if (dropElement.type !== "TAB-ELEMENT") {
      return { elements: outerElements, boundary: index.eleI };
    }
    const tabHost =
      outerElements.find((item) => item?.id === index.tabEleID) ||
      outerElements[index.eleI];
    const tabItems =
      tabHost?.type === "tabs"
        ? tabHost.tabsItems
        : tabHost?.type === "acc"
          ? tabHost.accordionItems
          : tabHost?.type === "post"
            ? [{ id: "post-main", elements: tabHost.postElements }]
            : tabHost?.type === "dts"
              ? tabHost.dataSliderItems
              : tabHost?.type === "ctg"
                ? mergeCatagoriesElement(tabHost).catagoriesItems
                : null;
    const tab = Array.isArray(tabItems)
      ? tabItems.find((item) => String(item?.id) === String(index.tabId))
      : null;
    return Array.isArray(tab?.elements)
      ? { elements: tab.elements, boundary: index.tabEleI }
      : null;
  };

  const resolveSidebarNewElementTargetLocation = (dropElement) => {
    const target = getSidebarNewElementTargetBucket(dropElement);
    if (!target) return null;
    const boundary = Math.max(
      0,
      Math.min(target.elements.length, Number(target.boundary) || 0)
    );
    const chunks = chunkColumnElementsForInlineRows(target.elements);
    const resolveChunkNode = (chunk) => {
      if (!chunk) return null;
      if (chunk.kind === "single") {
        return findDropElementNodeByEleId(chunk.item?.id);
      }
      const nodes = chunk.items
        .map((item) => findDropElementNodeByEleId(item?.id))
        .filter(Boolean);
      if (nodes.length === 0) return null;
      const sharedParent = nodes[0].parentElement;
      return sharedParent && nodes.every((node) => node.parentElement === sharedParent)
        ? sharedParent
        : nodes[0];
    };
    const beforeChunk = chunks.find((chunk) => chunk.startIndex === boundary);
    const afterChunk = [...chunks]
      .reverse()
      .find((chunk) => {
        const length = chunk.kind === "single" ? 1 : chunk.items.length;
        return chunk.startIndex + length === boundary;
      });
    const beforeNode =
      resolveChunkNode(beforeChunk) ||
      (boundary < target.elements.length
        ? findDropElementNodeByEleId(target.elements[boundary]?.id)
        : null);
    const afterNode =
      resolveChunkNode(afterChunk) ||
      (boundary > 0
        ? findDropElementNodeByEleId(target.elements[boundary - 1]?.id)
        : null);
    const neighborParent = beforeNode?.parentElement || afterNode?.parentElement;
    if (neighborParent) {
      return {
        parent: neighborParent,
        referenceNode: beforeNode || afterNode?.nextSibling || null,
      };
    }

    const index = dropElement?.index;
    if (dropElement?.type === "TAB-ELEMENT") {
      const hostNode = findDropElementNodeByEleId(index?.tabEleID);
      const tabContents = hostNode?.querySelectorAll?.(
        '[data-drop="TAB-CONTENT"]'
      );
      for (const node of tabContents || []) {
        if (
          String(node.getAttribute("data-tab-element-id") || "") ===
            String(index.tabEleID) &&
          String(node.getAttribute("data-tab-id") || "") === String(index.tabId)
        ) {
          const parent = node.firstElementChild || node;
          return { parent, referenceNode: null };
        }
      }
      return null;
    }

    const section = layoutsRef.current[index?.conI];
    const column = section?.columns?.[index?.colI];
    const span = Number.isInteger(index?.spnI)
      ? column?.spans?.[index.spnI]
      : null;
    const nestedSpan =
      span && Number.isInteger(index?.nestI)
        ? span.nestedSpans?.[index.nestI]
        : null;
    const emptyMarkerId = [
      section?.container?.id,
      column?.id,
      span?.id,
      nestedSpan?.id,
    ]
      .filter(Boolean)
      .join("/");
    const emptyMarker = emptyMarkerId
      ? findExactElementBucketMarker(emptyMarkerId)
      : null;
    return emptyMarker?.parentElement
      ? { parent: emptyMarker.parentElement, referenceNode: emptyMarker }
      : null;
  };

  const captureSidebarNewElementFlipRects = (
    parents,
    fallbackSectionIndexes = []
  ) => {
    const startedAt = performance.now();
    const rects = new Map();
    for (const node of scopedElementFlipSiblings(
      [...new Set(parents.filter(Boolean))]
    )) {
      rects.set(node, node.getBoundingClientRect());
    }

    // A missing bucket parent is unusual (typically an empty custom tab
    // renderer). Preserve animation correctness there with the old section
    // scan instead of making the common path pay for all section descendants.
    const roots = new Set();
    for (const sectionIndex of fallbackSectionIndexes) {
      if (!Number.isInteger(sectionIndex)) continue;
      const sectionId = layoutsRef.current?.[sectionIndex]?.container?.id;
      const sectionNode = sectionId ? document.getElementById(sectionId) : null;
      const root =
        sectionNode?.closest?.('[data-drop="SECTION"]') ||
        sectionNode ||
        contained.current?.[sectionIndex] ||
        null;
      if (root) roots.add(root);
    }
    for (const root of roots) {
      const nodes = [];
      if (root?.matches?.('[data-drop="ELEMENT"]')) nodes.push(root);
      root
        ?.querySelectorAll?.('[data-drop="ELEMENT"]')
        .forEach((node) => nodes.push(node));
      for (const node of nodes) {
        if (
          !node?.isConnected ||
          node === ghostRef.current ||
          ghostRef.current?.contains?.(node) ||
          node.classList?.contains("preview") ||
          node.classList?.contains("column-area") ||
          node.hasAttribute?.("data-scoped-element-placeholder")
        ) {
          continue;
        }
        const rawId = node.getAttribute?.("id") || "";
        const elementId = rawId.split("/").pop() || "";
        if (
          !elementId ||
          elementId === "__null__" ||
          elementId.startsWith("ele-")
        ) {
          continue;
        }
        rects.set(node, node.getBoundingClientRect());
      }
    }
    return {
      rects,
      elapsed: performance.now() - startedAt,
    };
  };

  const ensureSidebarPreviewHost = (previewValue) => {
    if (typeof document === "undefined") return null;
    let host = sidebarPreviewHostRef.current;
    if (!host) {
      host = document.createElement("div");
      host.setAttribute("data-sidebar-element-preview-host", "true");
      host.className = `w-full mb-2 opacity-70 ${ghostInsertAnimClass}`.trim();
      host.ondragover = preventNativeSidebarPreviewDragOver;
      sidebarPreviewHostRef.current = host;
    }
    host.id = String(previewValue?.container?.id || previewValue?.id || "");
    ghostRef.current = host;
    return host;
  };

  function preventNativeSidebarPreviewDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const commitSidebarPreviewHostMove = (pending) => {
    if (!pending) return;
    const host = sidebarPreviewHostRef.current;
    if (!host) return;
    const previousConI = Number.isInteger(pending.previousDrop?.index?.conI)
      ? pending.previousDrop.index.conI
      : null;
    const nextConI = Number.isInteger(pending.dropElement?.index?.conI)
      ? pending.dropElement.index.conI
      : null;
    const oldParent = host.parentElement;
    const location = pending.dropElement
      ? resolveSidebarNewElementTargetLocation(pending.dropElement)
      : null;
    const nextParent = location?.parent || null;
    const fallbackSections = [];
    if (previousConI != null && !oldParent) fallbackSections.push(previousConI);
    if (nextConI != null && !nextParent) fallbackSections.push(nextConI);
    const beforeCapture = captureSidebarNewElementFlipRects(
      [oldParent, nextParent],
      fallbackSections
    );
    for (const node of beforeCapture.rects.keys()) {
      cancelScopedElementFlipNode(node);
    }

    const moveStartedAt = performance.now();
    if (nextParent) {
      const referenceNode =
        location.referenceNode?.parentNode === nextParent
          ? location.referenceNode
          : null;
      nextParent.insertBefore(host, referenceNode);
    } else if (host.parentNode) {
      host.parentNode.removeChild(host);
    }
    const moveMs = performance.now() - moveStartedAt;
    const newParent = host.parentElement;
    const afterCapture = captureSidebarNewElementFlipRects(
      [oldParent, nextParent, newParent],
      fallbackSections
    );
    animateScopedElementFlip(beforeCapture.rects, afterCapture.rects);

    const perf = sidebarNativeDragPerfRef.current;
    if (perf?.active) {
      perf.flipCaptureCount += 2;
      perf.flipCapturedNodeCount +=
        beforeCapture.rects.size + afterCapture.rects.size;
      perf.flipCaptureTotalMs += beforeCapture.elapsed + afterCapture.elapsed;
      perf.flipCaptureMaxMs = Math.max(
        perf.flipCaptureMaxMs,
        beforeCapture.elapsed,
        afterCapture.elapsed
      );
      if (nextParent) {
        perf.hostMoveCount += 1;
        perf.hostMoveTotalMs += moveMs;
        perf.hostMoveMaxMs = Math.max(perf.hostMoveMaxMs, moveMs);
      } else if (oldParent) {
        perf.hostDetachCount += 1;
      }
    }
  };

  const scheduleSidebarPreviewHostMove = (dropElement, previousDrop, sync = false) => {
    const commit = sidebarPreviewMoveRef.current;
    commit.pending = {
      dropElement: dropElement
        ? {
            type: dropElement.type,
            index: { ...dropElement.index },
            isLast: Boolean(dropElement.isLast),
          }
        : null,
      previousDrop,
    };
    if (sync) {
      if (commit.frame != null) cancelAnimationFrame(commit.frame);
      commit.frame = null;
      const pending = commit.pending;
      commit.pending = null;
      commitSidebarPreviewHostMove(pending);
      return;
    }
    if (commit.frame != null) return;
    commit.frame = requestAnimationFrame(() => {
      commit.frame = null;
      const pending = commit.pending;
      commit.pending = null;
      if (!pending) return;
      const pendingKey = sidebarNewElementTargetKey(pending.dropElement, null);
      if (pendingKey !== sidebarNewElementFlipRef.current.targetKey) return;
      commitSidebarPreviewHostMove(pending);
    });
  };

  const clearSidebarPortalPreview = ({
    deferUnmount = false,
  } = {}) => {
    const commit = sidebarPreviewMoveRef.current;
    if (commit.frame != null) cancelAnimationFrame(commit.frame);
    commit.frame = null;
    commit.pending = null;
    const host = sidebarPreviewHostRef.current;
    const root = sidebarPreviewRootRef.current;
    sidebarPreviewRootRef.current = null;
    const unmountPreview = () => {
      root?.unmount();
      if (host) {
        host.ondragover = null;
        if (host.parentNode) host.parentNode.removeChild(host);
      }
    };
    if (deferUnmount) queueMicrotask(unmountPreview);
    else unmountPreview();
    if (ghostRef.current === host) ghostRef.current = null;
    sidebarPreviewHostRef.current = null;
    sidebarPortalPreviewRef.current = null;
    sidebarNewElementFlipRef.current.previousConI = null;
    sidebarNewElementFlipRef.current.preview = null;
    sidebarNewElementFlipRef.current.targetKey = "";
    windowDropHandlerRef.current = null;
    inlineSortableRenderersRef.current.dragActive = false;
  };
  clearSidebarPortalPreviewRef.current = clearSidebarPortalPreview;

  const renderSidebarColumnSectionPreview = (sectionPreview, innerStyle) => (
    <ContainerPreview
      element={sectionPreview}
      id={sectionPreview?.container?.id}
      innerStyle={innerStyle}
    >
      {sectionPreview?.columns?.map((column) => (
        <ColumnPreview
          key={column.id}
          element={column}
          noColumnGap={Boolean(sectionPreview?.container?.noColumnGap)}
          id={{
            conID: sectionPreview?.container?.id,
            colID: column.id,
          }}
        >
          {column.isSpan ? (
            <>
              {(column.spans || []).map((span) => (
                <SpanPreview
                  key={span.id}
                  elementData={span}
                  noColumnGap={Boolean(sectionPreview?.container?.noColumnGap)}
                />
              ))}
            </>
          ) : Array.isArray(column.elements) && column.elements.length > 0 ? (
            <div>
              {column.elements.map((element) => (
                <ElementPreview key={element.id} element={element} />
              ))}
            </div>
          ) : null}
        </ColumnPreview>
      ))}
    </ContainerPreview>
  );

  const renderSidebarSplitSectionPreview = (splitPreview) => {
    const SPLIT_MAX = 768;
    return (
      <>
        {(splitPreview?.sections || []).map((sec, si) => {
          const isLeft = si === 0;
          const splitInner =
            sec.container?.isFluid === false
              ? {
                  width: `min(100%, ${SPLIT_MAX}px)`,
                  maxWidth: "none",
                  boxSizing: "border-box",
                  marginLeft: isLeft ? "auto" : "0px",
                  marginRight: isLeft ? "0px" : "auto",
                  paddingLeft: isLeft ? "0px" : "14px",
                  paddingRight: isLeft ? "14px" : "0px",
                }
              : {
                  paddingLeft: isLeft ? "0px" : "14px",
                  paddingRight: isLeft ? "14px" : "0px",
                };
          return (
            <div key={sec.container?.id || si} style={{ flex: 1 }}>
              {renderSidebarColumnSectionPreview(sec, splitInner)}
            </div>
          );
        })}
      </>
    );
  };

  const commitSidebarColumnSectionPreview = (
    nextPreview,
    index,
    isLast = false
  ) => {
    const state = sidebarNewElementFlipRef.current;
    const targetKey = [
      "SECTION",
      index,
      isLast ? 1 : 0,
      sidebarPreviewIdentity(nextPreview),
    ].join(":");
    const previewChanged =
      Boolean(nextPreview) && sidebarPortalPreviewRef.current !== nextPreview;
    if (!previewChanged && state.targetKey === targetKey) {
      const perf = sidebarNativeDragPerfRef.current;
      if (perf?.active) perf.duplicateTargetSkips += 1;
      return;
    }

    dropTargetRef.current = {
      index,
      type: "SECTION",
      isLast: Boolean(isLast),
    };
    state.preview = nextPreview;
    state.targetKey = targetKey;

    const host = ensureSidebarPreviewHost(nextPreview);
    if (!host) return;
    const isSplitPreview = Boolean(nextPreview?._isSplitGhost);
    host.className = isSplitPreview
      ? "preview opacity-70 flex w-full"
      : "preview opacity-70";
    host.setAttribute("data-drop", "SECTION");

    if (previewChanged) {
      let root = sidebarPreviewRootRef.current;
      if (!root) {
        root = createRoot(host);
        sidebarPreviewRootRef.current = root;
      }
      sidebarPortalPreviewRef.current = nextPreview;
      flushSync(() => {
        root.render(
          <React.Profiler
            id="SidebarColumnSectionPreview"
            onRender={(_id, phase, actualDuration, baseDuration) => {
              recordBuilderCanvasCommit(
                actualDuration,
                baseDuration,
                "sidebar-section-preview",
                {
                  sectionHits: 0,
                  sectionMisses: 0,
                  columnHits: 0,
                  columnMisses: 0,
                  rebuiltColumns: 0,
                  scoped: true,
                  isolatedPreview: true,
                  phase,
                }
              );
            }}
          >
            {isSplitPreview
              ? renderSidebarSplitSectionPreview(nextPreview)
              : renderSidebarColumnSectionPreview(nextPreview)}
          </React.Profiler>
        );
      });
    }

    const canvas = document.querySelector("[data-builder-canvas='true']");
    const targetLayout = layoutsRef.current?.[index];
    const targetId =
      targetLayout?.splitRowId || targetLayout?.container?.id || "";
    const targetNode = targetId ? document.getElementById(targetId) : null;
    const referenceNode =
      !isLast && targetNode?.parentElement === canvas ? targetNode : null;
    if (canvas) canvas.insertBefore(host, referenceNode);

    windowDropHandlerRef.current = handleDropElement() ? handleDrop : null;
    inlineSortableRenderersRef.current.dragActive = true;
    const perf = sidebarNativeDragPerfRef.current;
    if (perf?.active) {
      perf.targetChangeCount += 1;
      if (perf.firstPreviewDelayMs == null) {
        perf.firstPreviewDelayMs = performance.now() - perf.startedAt;
      }
    }
  };

  const commitSidebarNewElementPreview = (nextPreview, dropElement = null) => {
    const state = sidebarNewElementFlipRef.current;
    const previousDrop = dropTargetRef.current;
    const nextTargetKey = sidebarNewElementTargetKey(dropElement, null);
    const previewChanged =
      Boolean(nextPreview) && sidebarPortalPreviewRef.current !== nextPreview;
    if (!previewChanged && state.targetKey === nextTargetKey) {
      const perf = sidebarNativeDragPerfRef.current;
      if (perf?.active) perf.duplicateTargetSkips += 1;
      return;
    }

    // Drop semantics never wait for the visual rAF.
    dropTargetRef.current = dropElement
      ? {
          index:
            dropElement.type === "ELEMENT"
              ? sanitizeElementDropIndex({ ...dropElement.index })
              : { ...dropElement.index },
          type: dropElement.type,
          isLast: Boolean(dropElement.isLast),
        }
      : { index: null, type: null, isLast: false };
    if (dropElement?.type === "ELEMENT") {
      dropHoldUntilRef.current = Date.now() + 180;
    } else if (!dropElement) {
      dropHoldUntilRef.current = 0;
      resetEleInsertSnapState();
      resetTabInlineRowSnapState();
    }

    state.previousConI = Number.isInteger(previousDrop?.index?.conI)
      ? previousDrop.index.conI
      : null;
    state.preview = nextPreview || state.preview;
    state.targetKey = nextTargetKey;

    if (!nextPreview) {
      scheduleSidebarPreviewHostMove(null, previousDrop);
      return;
    }

    const host = ensureSidebarPreviewHost(nextPreview);
    if (!host) return;
    const isFirstMount = sidebarPreviewRootRef.current == null;

    if (previewChanged) {
      const commitStartedAt = performance.now();
      let root = sidebarPreviewRootRef.current;
      if (!root) {
        root = createRoot(host);
        sidebarPreviewRootRef.current = root;
      }
      sidebarPortalPreviewRef.current = nextPreview;
      flushSync(() => {
        root.render(
          <ElementPreview
            element={nextPreview}
            isSidebarPortalPreview
          />
        );
      });
      const commitMs = performance.now() - commitStartedAt;
      const perf = sidebarNativeDragPerfRef.current;
      if (perf?.active) {
        if (isFirstMount) {
          perf.isolatedPreviewMountCount += 1;
          perf.isolatedPreviewMountTotalMs += commitMs;
          perf.isolatedPreviewMountMaxMs = Math.max(
            perf.isolatedPreviewMountMaxMs,
            commitMs
          );
          perf.portalMountCommitCount += 1;
          perf.portalMountCommitTotalMs += commitMs;
          perf.portalMountCommitMaxMs = Math.max(
            perf.portalMountCommitMaxMs,
            commitMs
          );
        } else {
          perf.previewCommitCount += 1;
          perf.previewCommitTotalMs += commitMs;
          perf.previewCommitMaxMs = Math.max(perf.previewCommitMaxMs, commitMs);
        }
        if (perf.firstPreviewDelayMs == null) {
          perf.firstPreviewDelayMs = performance.now() - perf.startedAt;
        }
      }
    }
    windowDropHandlerRef.current = handleDropElement() ? handleDrop : null;
    inlineSortableRenderersRef.current.dragActive = true;
    scheduleSidebarPreviewHostMove(
      dropTargetRef.current,
      previousDrop,
      isFirstMount
    );
    const perf = sidebarNativeDragPerfRef.current;
    if (perf?.active) perf.targetChangeCount += 1;
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

  const clearGhost = ({ deferSidebarPreviewUnmount = false } = {}) => {
    markContentDndLifecycle("post-drop-cleanup");
    finishSidebarNativeDragPerf("clear");
    // The palette template ref can outlive native dragend; it is drop data,
    // not proof that a drag is still active.
    inlineSortableRenderersRef.current.dragActive = false;
    structuralOptionStoreRef.current.setSuppressed(false);
    clearScopedElementPlaceholder({ animate: false });
    if (hoverRef.current) {
      cancelAnimationFrame(hoverRef.current);
      hoverRef.current = null;
    }

    dragToken.current += 1;

    clearSidebarPortalPreview({
      deferUnmount: deferSidebarPreviewUnmount,
    });
    setPreview(null);
    sidebarNewElementFlipRef.current.previousConI = null;
    sidebarNewElementFlipRef.current.preview = null;
    sidebarNewElementFlipRef.current.targetKey = "";
    const isScopedElementCleanup =
      useScopedColumnDnd &&
      activeDragRef.current?.data?.current?.type === "ELEMENT";
    if (isScopedElementCleanup) {
      // Cross-column intent is ref/DOM driven. Updating dropRenderKey here
      // forces an otherwise unchanged 35-section canvas to render after drop.
      dropTargetRef.current = { index: null, type: null, isLast: false };
      dropHoldUntilRef.current = 0;
      setElementDropHighlight((prev) => (prev === null ? prev : null));
      resetEleInsertSnapState();
      resetTabInlineRowSnapState();
    } else {
      setDrop(null, null);
    }
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
    activeItemRef.current = null;
    resetListRunSnapState();
    resetEleInsertSnapState();
    resetTabInlineRowSnapState();
    elementHoverIntentRef.current = { key: "", startedAt: 0 };
    sidebarPreviewIntentRef.current = { key: "", startedAt: 0, x: 0, y: 0 };
    incomingDragPreviewRef.current = {
      source: null,
      pageLatestID: null,
      isCanvasElementMove: false,
      preview: null,
      type: null,
    };
    lastHandledDragOverEventRef.current = null;
    resetDropElementGeometryCache();
  };
  clearGhostRef.current = clearGhost;

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
    element,
    previewCollector = null
  ) => {
    const blockedTabDropTarget = { blocked: true };
    blockedDropToastRef.current = null;
    const queuePreview = (value) => {
      if (previewCollector) {
        previewCollector.hasValue = true;
        previewCollector.value = value;
        return;
      }
      setPreview(value);
    };
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

    if (element?.type === "post" || element?.type === "ctg") {
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

    if (element?.type === "dts") {
      const w = readCarouselTargetWidthUnits(
        conI,
        colI,
        overSpan,
        overMiniSpan
      );
      if (!Number.isFinite(w) || w < DATA_SLIDER_MIN_COL_UNITS) {
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
            queuePreview(element);
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
      queuePreview(element);
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
        queuePreview(element);
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
            const firstRect = getCachedDropElementRect(firstNode);
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
        queuePreview(element);

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
            const firstRect = getCachedDropElementRect(firstNode);
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
      queuePreview(element);

      if (!elements.length) {
        return {
          index: { conI, colI, eleI: 0 },
          type: "ELEMENT",
          isLast: false,
        };
      }

      /* ช่วยให้ "วางบนสุด" ง่ายขึ้นเฉพาะตอนลาก element ใหม่จาก sidebar */
      if (!isCanvasElementMove) {
        const colTopInsertAssistPx = Math.min(
          56,
          Math.max(28, rectCol.height * 0.22)
        );
        if (mouseY <= rectCol.top + colTopInsertAssistPx) {
          return {
            index: { conI, colI, eleI: 0 },
            type: "ELEMENT",
            isLast: false,
          };
        }
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
          const firstRect = getCachedDropElementRect(firstNode);
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

  const updateHoverFromPointImpl = (x, y, type, element) => {
    // Rect เปลี่ยนได้จาก ghost/scroll แต่ node map ใช้ต่อได้จน DOM remount
    resetDropElementRectCache();
    const set_2_null = () => {
      if (type === "ELEMENT" && Date.now() < dropHoldUntilRef.current) return;
      const isSidebarNewElement =
        type === "ELEMENT" &&
        activeDragRef.current?.data?.current?.type !== "ELEMENT";
      if (isSidebarNewElement) {
        commitSidebarNewElementPreview(null);
        return;
      }
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
      const useIsolatedSectionPreview =
        !activeDragRef.current &&
        (Boolean(element?._isSplitGhost) || Boolean(element?.container));
      if (!useIsolatedSectionPreview) setPreview(element);
      if (!layouts.length) {
        if (useIsolatedSectionPreview) {
          commitSidebarColumnSectionPreview(element, 0, true);
        } else {
          setDrop(0, "SECTION", null);
        }
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
        if (useIsolatedSectionPreview) {
          commitSidebarColumnSectionPreview(element, layouts.length, true);
        } else {
          setDrop(layouts.length, "SECTION", true);
        }
        return;
      }

      const conR = section.getBoundingClientRect();
      const id = section?.getAttribute("id");
      const index = computeSectionPhysicalInsertIndex(layouts, id, conR, y);
      if (useIsolatedSectionPreview) {
        commitSidebarColumnSectionPreview(
          element,
          index,
          index === layouts.length
        );
      } else {
        setDrop(index, "SECTION", index === layouts.length);
      }
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
      const previewCollector = {};
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
        element,
        previewCollector
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
            commitSidebarNewElementPreview(null);
            // Sidebar pass-through phase: do not keep/commit any drop target,
            // otherwise mini span can expand while no preview is shown.
            return;
          }
        } else {
          setPreview(null);
        }
      }
      if (
        isSidebarElementDrag &&
        dropElement?.type === "ELEMENT" &&
        !shouldCommitElementDropTarget(dropElement.index, x, y)
      ) {
        commitSidebarNewElementPreview(null);
        return;
      }
      if (isSidebarElementDrag) {
        commitSidebarNewElementPreview(
          previewCollector?.hasValue ? previewCollector.value : element,
          dropElement
        );
      } else {
        if (previewCollector?.hasValue) {
          setPreview(previewCollector.value);
        }
        setDrop({ ...dropElement?.index }, dropElement.type, dropElement.isLast);
      }
    }
  };

  const updateHoverFromPoint = (x, y, type, element) => {
    const perf = sidebarNativeDragPerfRef.current;
    const isMeasuredSidebarType = type === "ELEMENT" || type === "SECTION";
    if (!perf?.active || !isMeasuredSidebarType) {
      return updateHoverFromPointImpl(x, y, type, element);
    }
    const startedAt = performance.now();
    const perfTargetKey = (target) =>
      target?.type === "SECTION"
        ? `SECTION:${target.index ?? ""}:${target.isLast ? 1 : 0}`
        : sidebarNewElementTargetKey(target, null);
    const previousTargetKey = perfTargetKey(dropTargetRef.current);
    try {
      return updateHoverFromPointImpl(x, y, type, element);
    } finally {
      const elapsed = performance.now() - startedAt;
      perf.hoverUpdateCount += 1;
      perf.hoverUpdateTotalMs += elapsed;
      perf.hoverUpdateMaxMs = Math.max(perf.hoverUpdateMaxMs, elapsed);
      const nextTargetKey = perfTargetKey(dropTargetRef.current);
      if (
        type === "SECTION" &&
        perf.firstPreviewDelayMs == null &&
        dropTargetRef.current?.type === "SECTION"
      ) {
        perf.firstPreviewDelayMs = performance.now() - perf.startedAt;
      }
      // Preview commits count target transitions. This additionally catches
      // target ref changes made by blocked/pass-through branches.
      if (
        nextTargetKey !== previousTargetKey &&
        sidebarNewElementFlipRef.current.targetKey !== nextTargetKey
      ) {
        perf.targetChangeCount += 1;
      }
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

  const updateScopedElementIntentFromPoint = (x, y, element) => {
    const intentStartedAt = performance.now();
    const perf = dndPerfRef.current;
    const previousTargetKey = scopedElementTargetKey(dropTargetRef.current);
    const finishIntentMeasurement = () => {
      if (!perf?.active) return;
      const elapsed = performance.now() - intentStartedAt;
      perf.scopedIntentCount += 1;
      perf.scopedIntentTotalMs += elapsed;
      perf.scopedIntentMaxMs = Math.max(perf.scopedIntentMaxMs, elapsed);
    };
    resetDropElementRectCache();
    const column = findColumnFromStack(x, y) || findColumn(x, y);
    const resolvedColPath = resolveLayoutColumnPathFromDom(column);
    if (!column || !resolvedColPath?.conID || !resolvedColPath?.colID) {
      dropTargetRef.current = { index: null, type: null, isLast: false };
      if (perf?.active && previousTargetKey) perf.scopedTargetChanges += 1;
      clearScopedElementPlaceholder();
      finishIntentMeasurement();
      return false;
    }
    const previewCollector = {};
    const dropElement = setDropForElement(
      resolvedColPath.conID,
      resolvedColPath.colID,
      column,
      findSpan(x, y),
      findMiniSpan(x, y),
      findElement(x, y),
      findTabContent(x, y),
      findTabNestedItem(x, y),
      x,
      y,
      element,
      previewCollector
    );
    if (
      !dropElement ||
      dropElement?.blocked ||
      dropElement?.type !== "ELEMENT"
    ) {
      dropTargetRef.current = { index: null, type: null, isLast: false };
      if (perf?.active && previousTargetKey) perf.scopedTargetChanges += 1;
      clearScopedElementPlaceholder();
      finishIntentMeasurement();
      return false;
    }
    dropTargetRef.current = {
      index: sanitizeElementDropIndex({ ...dropElement.index }),
      type: dropElement.type,
      isLast: Boolean(dropElement.isLast),
    };
    const nextTargetKey = scopedElementTargetKey(dropTargetRef.current);
    if (perf?.active && nextTargetKey !== previousTargetKey) {
      perf.scopedTargetChanges += 1;
    }
    renderScopedElementPlaceholder(dropTargetRef.current);
    finishIntentMeasurement();
    return true;
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 2 } }) // ตอบสนองไวขึ้น แต่ยังกันคลิกพลาด
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

  const measuring = useMemo(
    () => ({
      droppable: {
        strategy: MeasuringStrategy.WhileDragging,
      },
    }),
    []
  );

  const openModal = (data = null) => {
    const startedAt = builderSectionPerfEnabled ? performance.now() : 0;
    confirmModalUiCacheRef.current.active = true;
    if (data) {
      const { id, funct } = data;
      if (
        builderSectionPerfEnabled &&
        id?.spnID &&
        !id?.nestID &&
        !id?.eleID
      ) {
        const currentLayouts = layoutsRef.current;
        const targetLayout = Array.isArray(currentLayouts)
          ? currentLayouts.find(
              (layout) => layout?.container?.id === id.conID
            )
          : null;
        const targetColumn = targetLayout?.columns?.find(
          (column) => column?.id === id.colID
        );
        const perf = startSpanStructurePerfSession("OPEN_DELETE", {
          startedAt,
          sourceSpanId: id.spnID,
          targetSpanId: id.spnID,
          remainingSpanCount: Array.isArray(targetColumn?.spans)
            ? targetColumn.spans.length
            : null,
        });
        if (perf) perf.preparationMs = performance.now() - startedAt;
      }
      setModal({ id, funct });
    } else {
      setModal(null);
    }
  };

  const PRESET_STORAGE_KEY = "wb:col-presets:v1";
  const countPresetColumnElements = (column) => {
    if (!column || typeof column !== "object") return 0;
    const directCount = Array.isArray(column.elements)
      ? column.elements.length
      : 0;
    const spanCount = Array.isArray(column.spans)
      ? column.spans.reduce(
          (total, span) =>
            total + (Array.isArray(span?.elements) ? span.elements.length : 0),
          0
        )
      : 0;
    return directCount + spanCount;
  };
  const presetPayloadBytes = (value) => {
    if (!builderSectionPerfEnabled || !value) return 0;
    if (typeof TextEncoder === "function") {
      return new TextEncoder().encode(value).byteLength;
    }
    return value.length;
  };

  const openColumnPresetModal = (payload) => {
    markPresetUiInteraction();
    const perf = startPresetPerfSession("OPEN_SAVE", {
      source: payload?.source?.colID || null,
      target: payload?.source?.conID || null,
    });
    const startedAt = perf ? performance.now() : 0;
    const capturedColumn =
      payload?.column && typeof payload.column === "object"
        ? lodash.cloneDeep(payload.column)
        : null;
    if (perf) {
      perf.preparationMs = performance.now() - startedAt;
      perf.copiedElementCount = countPresetColumnElements(capturedColumn);
    }
    setColumnPresetModal({
      open: true,
      name: String(payload?.defaultName || "PRESET Column"),
      error: "",
      payload: payload
        ? {
            ...payload,
            column: capturedColumn,
            source: payload.source ? { ...payload.source } : null,
          }
        : null,
    });
  };

  const closeColumnPresetModal = () => {
    markPresetUiInteraction();
    startTransition(() => {
      setColumnPresetModal((prev) => ({
        ...prev,
        open: false,
        error: "",
        payload: null,
      }));
      structuralOptionStoreRef.current.setPinned("column", null);
    });
  };

  const saveColumnPresetToLocalStorage = (nameOverride) => {
    markPresetUiInteraction();
    const modalPayload = columnPresetModal?.payload;
    const currentColumn = modalPayload?.column;
    const perf = startPresetPerfSession("SAVE", {
      source: modalPayload?.source?.colID || null,
      target: modalPayload?.source?.conID || null,
    });
    const preparationStartedAt = perf ? performance.now() : 0;
    if (perf) {
      perf.copiedElementCount = countPresetColumnElements(currentColumn);
    }
    if (!currentColumn || typeof currentColumn !== "object") {
      setColumnPresetModal((prev) => ({ ...prev, error: "ไม่พบข้อมูลคอลัมน์" }));
      return;
    }
    const trimmedName = String(
      nameOverride ?? columnPresetModal?.name ?? ""
    ).trim();
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
        column: currentColumn,
      },
    };
    if (perf) perf.preparationMs = performance.now() - preparationStartedAt;
    try {
      const readStartedAt = perf ? performance.now() : 0;
      const raw = localStorage.getItem(PRESET_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (perf) perf.storageReadMs = performance.now() - readStartedAt;
      const next = {
        version: 1,
        presets: Array.isArray(parsed?.presets)
          ? [...parsed.presets, presetRecord]
          : [presetRecord],
      };
      const serializeStartedAt = perf ? performance.now() : 0;
      const serialized = JSON.stringify(next);
      if (perf) {
        perf.serializeMs = performance.now() - serializeStartedAt;
        perf.payloadBytes = presetPayloadBytes(serialized);
        perf.presetCount = next.presets.length;
        perf.presetId = presetRecord.id;
      }
      const writeStartedAt = perf ? performance.now() : 0;
      localStorage.setItem(PRESET_STORAGE_KEY, serialized);
      if (perf) perf.storageWriteMs = performance.now() - writeStartedAt;
      startTransition(() => {
        closeColumnPresetModal();
        setPresetSavedToastOpen(true);
      });
    } catch {
      setColumnPresetModal((prev) => ({ ...prev, error: "บันทึกไม่สำเร็จ กรุณาลองใหม่" }));
    }
  };

  const readColumnPresetsFromStorage = (perf = null) => {
    try {
      const startedAt = perf ? performance.now() : 0;
      const raw = localStorage.getItem(PRESET_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      const list = Array.isArray(parsed?.presets) ? parsed.presets : [];
      if (perf) {
        perf.storageReadMs = performance.now() - startedAt;
        perf.payloadBytes = presetPayloadBytes(raw);
        perf.presetCount = list.length;
      }
      return list;
    } catch {
      return [];
    }
  };
  const openColumnPresetLoadModal = (payload) => {
    markPresetUiInteraction();
    const perf = startPresetPerfSession("OPEN_LOAD", {
      source: payload?.source?.colID || null,
      target: payload?.source?.spnID || payload?.source?.conID || null,
    });
    const startedAt = perf ? performance.now() : 0;
    const presets = readColumnPresetsFromStorage(perf);
    if (perf) {
      perf.preparationMs = Math.max(
        0,
        performance.now() - startedAt - perf.storageReadMs
      );
    }
    setColumnPresetLoadModal({
      open: true,
      source: payload?.source || null,
      presets,
      error: "",
    });
  };
  const deleteColumnPresetFromLocalStorage = (presetId) => {
    const targetId = String(presetId || "").trim();
    if (!targetId) {
      return { ok: false, error: "ไม่พบ PRESET" };
    }
    const perf = startPresetPerfSession("DELETE_PRESET", {
      presetId: targetId,
      target: columnPresetLoadModal?.source?.spnID ||
        columnPresetLoadModal?.source?.colID ||
        null,
    });
    try {
      const readStartedAt = perf ? performance.now() : 0;
      const raw = localStorage.getItem(PRESET_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (perf) perf.storageReadMs = performance.now() - readStartedAt;
      const current = Array.isArray(parsed?.presets) ? parsed.presets : [];
      const nextPresets = current.filter(
        (preset) => String(preset?.id || "") !== targetId
      );
      const serializeStartedAt = perf ? performance.now() : 0;
      const serialized = JSON.stringify({
        version: 1,
        presets: nextPresets,
      });
      if (perf) {
        perf.serializeMs = performance.now() - serializeStartedAt;
        perf.payloadBytes = presetPayloadBytes(serialized);
        perf.presetCount = nextPresets.length;
      }
      const writeStartedAt = perf ? performance.now() : 0;
      localStorage.setItem(PRESET_STORAGE_KEY, serialized);
      if (perf) perf.storageWriteMs = performance.now() - writeStartedAt;
      return { ok: true, presets: nextPresets };
    } catch {
      return { ok: false, error: "ลบ PRESET ไม่สำเร็จ กรุณาลองใหม่" };
    }
  };

  const closeColumnPresetLoadModal = () => {
    markPresetUiInteraction();
    startTransition(() => {
      setColumnPresetLoadModal({
        open: false,
        source: null,
        presets: [],
        error: "",
      });
      structuralOptionStoreRef.current.setPinned("column", null);
    });
  };
  closeColumnPresetLoadModalRef.current = closeColumnPresetLoadModal;
  deleteColumnPresetFromLocalStorageRef.current =
    deleteColumnPresetFromLocalStorage;

  const extractPresetElementsForSpanTarget = (presetRecord) => {
    const presetColumn = presetRecord?.payload?.column;
    if (!presetColumn || typeof presetColumn !== "object") return [];

    if (Array.isArray(presetColumn.elements) && presetColumn.elements.length > 0) {
      return rewritePresetElementList(presetColumn.elements);
    }
    if (presetColumn.isSpan && Array.isArray(presetColumn.spans)) {
      const merged = [];
      presetColumn.spans.forEach((sp) => {
        if (Array.isArray(sp?.elements) && sp.elements.length > 0) {
          merged.push(...sp.elements);
        }
      });
      return rewritePresetElementList(merged);
    }
    return [];
  };

  const applyColumnPresetToTarget = (presetRecord) => {
    markPresetUiInteraction();
    const src = columnPresetLoadModal?.source;
    const isSpanTarget = Boolean(src?.spnID);
    const perf = startPresetPerfSession(
      isSpanTarget ? "APPLY_SPAN" : "APPLY_COLUMN",
      {
        source: presetRecord?.source?.colID || null,
        target: src?.spnID || src?.colID || null,
        presetId: presetRecord?.id || null,
      }
    );
    const preparationStartedAt = perf ? performance.now() : 0;
    if (!src?.conID || !src?.colID) {
      setColumnPresetLoadModal((prev) => ({ ...prev, error: "ไม่พบคอลัมน์เป้าหมาย" }));
      return;
    }
    const currentLayouts = layoutsRef.current;
    const secI = currentLayouts.findIndex(
      (l) => String(l?.container?.id || "") === String(src.conID)
    );
    if (secI === -1) {
      setColumnPresetLoadModal((prev) => ({ ...prev, error: "ไม่พบ Section เป้าหมาย" }));
      return;
    }
    const targetSection = currentLayouts[secI];
    const colI = targetSection?.columns?.findIndex(
      (c) => String(c?.id || "") === String(src.colID)
    );
    if (!Number.isInteger(colI) || colI < 0) {
      setColumnPresetLoadModal((prev) => ({ ...prev, error: "ไม่พบ Column เป้าหมาย" }));
      return;
    }
    const targetColumn = targetSection.columns[colI];
    if (src?.spnID) {
      const spnI = targetColumn?.spans?.findIndex(
        (s) => String(s?.id || "") === String(src.spnID)
      );
      if (!Number.isInteger(spnI) || spnI < 0) {
        setColumnPresetLoadModal((prev) => ({ ...prev, error: "ไม่พบ Span เป้าหมาย" }));
        return;
      }
      const elements = extractPresetElementsForSpanTarget(presetRecord);
      const targetSpan = targetColumn.spans[spnI];
      const nextSpan = {
        ...targetSpan,
        elements,
        latestEleID: elements.length,
      };
      const nextSpans = [...targetColumn.spans];
      nextSpans[spnI] = nextSpan;
      const nextColumn = { ...targetColumn, spans: nextSpans };
      const nextColumns = [...targetSection.columns];
      nextColumns[colI] = nextColumn;
      const nextSection = { ...targetSection, columns: nextColumns };
      const nextLayouts = [...currentLayouts];
      nextLayouts[secI] = nextSection;
      if (perf) {
        perf.preparationMs = performance.now() - preparationStartedAt;
        perf.loadedElementCount = elements.length;
      }
      markScopedLayoutSnapshot(nextLayouts);
      layoutsRef.current = nextLayouts;
      setLayout(nextLayouts);
      startTransition(() => {
        closeColumnPresetLoadModal();
        setPresetLoadedToastOpen(true);
      });
      return;
    }
    const presetColumn = presetRecord?.payload?.column;
    if (!presetColumn || typeof presetColumn !== "object") {
      setColumnPresetLoadModal((prev) => ({ ...prev, error: "Preset ไม่ถูกต้อง" }));
      return;
    }

    if (!targetColumn || typeof targetColumn !== "object") {
      setColumnPresetLoadModal((prev) => ({ ...prev, error: "ไม่พบ Column เป้าหมาย" }));
      return;
    }

    // โหลดเฉพาะ element ของ preset และคงค่า size/โครงสร้างของคอลัมน์เป้าหมายเดิม
    let nextColumn;
    let loadedElementCount = 0;
    if (targetColumn.isSpan && Array.isArray(targetColumn.spans)) {
      const presetSpans = Array.isArray(presetColumn?.spans) ? presetColumn.spans : [];
      const fallbackElements = rewritePresetElementList(presetColumn?.elements);
      const nextSpans = targetColumn.spans.map((sp, idx) => {
        const byIndexElements = rewritePresetElementList(presetSpans?.[idx]?.elements);
        const nextElements = byIndexElements.length
          ? byIndexElements
          : idx === 0
            ? fallbackElements
            : [];
        loadedElementCount += nextElements.length;
        return {
          ...sp,
          elements: nextElements,
          latestEleID: nextElements.length,
        };
      });
      nextColumn = {
        ...targetColumn,
        spans: nextSpans,
        latestEleID: 0,
        elements: [],
      };
    } else {
      const mergedElements = rewritePresetElementList(
        Array.isArray(presetColumn?.elements) && presetColumn.elements.length
          ? presetColumn.elements
          : Array.isArray(presetColumn?.spans)
            ? presetColumn.spans.flatMap((sp) =>
                Array.isArray(sp?.elements) ? sp.elements : []
              )
            : []
      );
      loadedElementCount = mergedElements.length;
      nextColumn = {
        ...targetColumn,
        elements: mergedElements,
        latestEleID: mergedElements.length,
        latestSpanID: 0,
      };
      delete nextColumn.spans;
    }

    const nextColumns = [...targetSection.columns];
    nextColumns[colI] = nextColumn;
    const nextSection = { ...targetSection, columns: nextColumns };
    const nextLayouts = [...currentLayouts];
    nextLayouts[secI] = nextSection;
    if (perf) {
      perf.preparationMs = performance.now() - preparationStartedAt;
      perf.loadedElementCount = loadedElementCount;
    }
    markScopedLayoutSnapshot(nextLayouts);
    layoutsRef.current = nextLayouts;
    setLayout(nextLayouts);
    startTransition(() => {
      closeColumnPresetLoadModal();
      setPresetLoadedToastOpen(true);
    });
  };
  applyColumnPresetToTargetRef.current = applyColumnPresetToTarget;

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

  const updateContainer = (data, id, options = null) => {
    const queuedAt = structurePerfEnabled ? performance.now() : 0;
    /* ต้องใช้ updater — ถ้าใช้ layouts จาก closure จะทับ layout ล่าสุด (เช่น หลังโคลนคอลัมน์) เมื่อแผง Section ยิง onUpdate จาก setData sync */
    setLayout((prev) => {
      const patchStartedAt = structurePerfEnabled ? performance.now() : 0;
      const idx = prev.findIndex((l) => l.container.id === id);
      if (idx === -1) return prev;
      const newLayouts = [...prev];
      const currentLayout = prev[idx];
      const merged = { ...currentLayout.container, ...data };
      newLayouts[idx] = {
        ...currentLayout,
        container: syncContainerLatestColId(merged, currentLayout.columns),
      };

      // sync paddingTop/paddingBottom/overlap ไปยัง paired split section
      const splitRowId = currentLayout.splitRowId;
      if (splitRowId) {
        const syncKeys = [
          "paddingTop", "paddingBottom","isFluid",
          "sectionOverlapTop", "sectionOverlapTopDesktop",
          "sectionOverlapTopTablet", "sectionOverlapTopMobile",
        ];
        const syncFields = {};
        syncKeys.forEach((k) => { if (k in data) syncFields[k] = data[k]; });
        if (Object.keys(syncFields).length > 0) {
          prev.forEach((l, i) => {
            if (i !== idx && l.splitRowId === splitRowId) {
              newLayouts[i] = {
                ...l,
                container: { ...l.container, ...syncFields },
              };
            }
          });
        }
      }

      const panelChangedFields = Array.isArray(options?.panelChangedFields)
        ? options.panelChangedFields
        : null;
      if (structurePerfEnabled && panelChangedFields) {
        dataSliderPanelUpdatePerfRef.current = {
          panelType: "Section",
          target: String(id || ""),
          fields: panelChangedFields,
          startedAt: queuedAt,
          queueMs: patchStartedAt - queuedAt,
          patchMs: performance.now() - patchStartedAt,
          canvasCommits: 0,
          canvasActualMs: 0,
          canvasMaxMs: 0,
          sectionCacheHits: 0,
          sectionCacheMisses: 0,
          sectionCacheMissReasons: {},
          logScheduled: false,
        };
      }
      const visualOnlyDividerFields = new Set([
        "columnDividerStyle",
        "columnDividerColor",
        "columnDividerOpacity",
        "columnDividerVerticalLengthPercent",
      ]);
      const skipSectionCacheInvalidation =
        Array.isArray(panelChangedFields) &&
        panelChangedFields.length > 0 &&
        panelChangedFields.every((field) =>
          visualOnlyDividerFields.has(field)
        );
      if (!skipSectionCacheInvalidation) {
        canvasSectionRenderCacheRef.current.delete(
          String(currentLayout?.splitRowId || currentLayout?.container?.id || id)
        );
      }
      markScopedLayoutSnapshot(newLayouts);
      return newLayouts;
    });
  };

  const cloneContainer = (id) => {
    const startedAt = builderSectionPerfEnabled ? performance.now() : 0;
    if (typeof id !== "string" || !id) return;
    const currentLayouts = layoutsRef.current;
    if (!Array.isArray(currentLayouts)) return;
    const targetIndex = currentLayouts.findIndex(
      (layout) => layout?.container?.id === id
    );
    if (targetIndex === -1) return;
    const targetLayout = currentLayouts[targetIndex];
    const nextSectionId = page.latestID;
    if (targetLayout?.splitRowId) {
      // Clone all sections of the split row as a group
      const splitRowId = targetLayout.splitRowId;
      const splitSections = currentLayouts.filter(
        (layout) => layout?.splitRowId === splitRowId
      );
      const lastIdx = currentLayouts.findLastIndex(
        (layout) => layout?.splitRowId === splitRowId
      );
      if (splitSections.length === 0) return;
      if (lastIdx === -1) return;
      const newSplitRowId = `SplitRow-${nextSectionId}`;
      const clonedSections = splitSections.map((sec, si) => {
        const newSec = lodash.cloneDeep(sec);
        const suffix = si === 0 ? "L" : si === 1 ? "R" : `R${si}`;
        newSec.container.id = `Sec-${nextSectionId}${suffix}`;
        newSec.splitRowId = newSplitRowId;
        let latestColID = 0;
        newSec.columns?.forEach((col) => {
          col.id = `Col-${nextSectionId}${suffix}-${latestColID++}`;
          col.elements?.forEach((e) => {
            e.id = e.id.split("-")[0] + "-" + Math.ceil(Math.random() * 1e9).toString(36);
          });
        });
        newSec.container.latestColID = latestColID;
        return newSec;
      });
      const newLayouts = [...currentLayouts];
      newLayouts.splice(lastIdx + 1, 0, ...clonedSections);
      beginCanvasPerformanceTransaction("canvas-clone", {
        label: `ทำสำเนา Split Section / ${String(splitRowId)}`,
        elementType: "split",
        elementId: splitRowId,
        scope: String(splitRowId),
        skipInitialFrameGap: true,
      });
      if (builderSectionPerfEnabled) {
        const copiedCounts =
          countCanvasLayoutStructureAndElements(splitSections);
        clonePerfRef.current = {
          type: "SPLIT",
          source: String(splitRowId),
          createdIds: {
            splitRowId: newSplitRowId,
            sectionIds: clonedSections.map((sec) => sec.container.id),
            columnIds: clonedSections.flatMap((sec) =>
              (sec.columns || []).map((col) => col.id)
            ),
          },
          sourceElementCount: copiedCounts.elements,
          weightedCopiedItemCount: copiedCounts.total,
          preparationMs: performance.now() - startedAt,
          startedAt,
          clickToCommitWallMs: 0,
          canvasCommits: 0,
          canvasActualMs: 0,
          canvasActualMaxMs: 0,
          cacheHits: 0,
          cacheMisses: 0,
          cacheMissReasons: {},
          logScheduled: false,
        };
      }
      layoutsRef.current = newLayouts;
      markScopedLayoutSnapshot(newLayouts);
      setLayout(newLayouts);
      setPage((prev) => ({ ...prev, latestID: prev.latestID + 1 }));
      return;
    }
    const newLayout = lodash.cloneDeep(targetLayout);
    newLayout.container.id = `Sec-${nextSectionId}`;
    if(newLayout?.columns){
      let latestColID = 0;
      newLayout.columns.map((col) => {
        col.id = `Col-${nextSectionId}-${latestColID++}`;
        let latestSpanID = 0;
        if (col.isSpan) {
          col.spans.map((s) => {
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
    const newLayouts = [...currentLayouts];
    newLayouts.splice(targetIndex + 1, 0, newLayout);
    beginCanvasPerformanceTransaction("canvas-clone", {
      label: `ทำสำเนา Section / ${String(id)}`,
      elementType: "section",
      elementId: id,
      scope: String(id),
      skipInitialFrameGap: true,
    });
    if (builderSectionPerfEnabled) {
      const copiedCounts = countCanvasLayoutStructureAndElements([targetLayout]);
      clonePerfRef.current = {
        type: "SECTION",
        source: id,
        createdIds: {
          sectionIds: [newLayout.container.id],
          columnIds: (newLayout.columns || []).map((col) => col.id),
        },
        sourceElementCount: copiedCounts.elements,
        weightedCopiedItemCount: copiedCounts.total,
        preparationMs: performance.now() - startedAt,
        startedAt,
        clickToCommitWallMs: 0,
        canvasCommits: 0,
        canvasActualMs: 0,
        canvasActualMaxMs: 0,
        cacheHits: 0,
        cacheMisses: 0,
        cacheMissReasons: {},
        logScheduled: false,
      };
    }
    layoutsRef.current = newLayouts;
    markScopedLayoutSnapshot(newLayouts);
    setLayout(newLayouts);

    setPage((prev) => {
      return { ...prev, latestID: prev.latestID + 1 };
    });
  };

  const collectDeletedStructureIds = (removedLayouts, includeElementIds) => {
    const sectionIds = [];
    const splitRowIds = new Set();
    const columnIds = [];
    const spanIds = [];
    const elementIds = [];
    for (const layout of removedLayouts) {
      if (layout?.container?.id) sectionIds.push(String(layout.container.id));
      if (layout?.splitRowId) splitRowIds.add(String(layout.splitRowId));
      const columns = Array.isArray(layout?.columns) ? layout.columns : [];
      for (const column of columns) {
        if (column?.id) columnIds.push(String(column.id));
        if (includeElementIds) {
          const elements = Array.isArray(column?.elements) ? column.elements : [];
          for (const element of elements) {
            if (element?.id) elementIds.push(String(element.id));
          }
        }
        const spans = Array.isArray(column?.spans) ? column.spans : [];
        for (const span of spans) {
          if (span?.id) spanIds.push(String(span.id));
          if (includeElementIds) {
            const elements = Array.isArray(span?.elements) ? span.elements : [];
            for (const element of elements) {
              if (element?.id) elementIds.push(String(element.id));
            }
          }
          const nestedSpans = Array.isArray(span?.nestedSpans)
            ? span.nestedSpans
            : [];
          for (const nestedSpan of nestedSpans) {
            if (nestedSpan?.id) spanIds.push(String(nestedSpan.id));
            if (includeElementIds) {
              const elements = Array.isArray(nestedSpan?.elements)
                ? nestedSpan.elements
                : [];
              for (const element of elements) {
                if (element?.id) elementIds.push(String(element.id));
              }
            }
          }
        }
      }
    }
    return {
      sectionIds,
      splitRowIds: [...splitRowIds],
      columnIds,
      spanIds,
      elementIds,
    };
  };

  const clearDeletedStructuralOptions = (removedIds) => {
    const optionState = structuralOptionStoreRef.current.getState();
    const sectionIds = new Set(removedIds.sectionIds);
    const splitRowIds = new Set(removedIds.splitRowIds);
    const columnIds = new Set(removedIds.columnIds);
    const spanIds = new Set(removedIds.spanIds);
    const hoverTarget = optionState.hoverTarget;
    if (
      sectionIds.has(String(hoverTarget?.id || "")) ||
      sectionIds.has(String(hoverTarget?.sectionId || "")) ||
      splitRowIds.has(String(hoverTarget?.id || "")) ||
      splitRowIds.has(String(hoverTarget?.splitRowId || "")) ||
      columnIds.has(String(hoverTarget?.id || "")) ||
      columnIds.has(String(hoverTarget?.columnId || "")) ||
      spanIds.has(String(hoverTarget?.id || ""))
    ) {
      structuralOptionStoreRef.current.publishHover(null);
    }
    if (columnIds.has(String(optionState.pinnedColumnId || ""))) {
      structuralOptionStoreRef.current.setPinned("column", null);
    }
    if (spanIds.has(String(optionState.pinnedSpanId || ""))) {
      structuralOptionStoreRef.current.setPinned("span", null);
    }
  };

  const beginDeletePerf = (
    type,
    source,
    removedLayouts,
    removedIds,
    startedAt,
    includesRemovedSection = true
  ) => {
    const normalizedType = String(type || "STRUCTURE").toLowerCase();
    beginCanvasPerformanceTransaction("canvas-delete", {
      label: `ลบโครงสร้าง ${type} / ${String(source)}`,
      elementType: normalizedType,
      elementId: source,
      scope: String(source),
      skipInitialFrameGap: true,
    });
    if (!builderSectionPerfEnabled) return;
    const counts = countCanvasLayoutStructureAndElements(removedLayouts);
    const syntheticSectionCount =
      type === "COLUMN" && !includesRemovedSection ? counts.sections : 0;
    deletePerfRef.current = {
      type,
      source: String(source),
      removedIds,
      removedCounts: {
        sections: counts.sections - syntheticSectionCount,
        columns: counts.columns,
        spans: counts.spans,
        nestedSpans: counts.nestedSpans,
        elements: counts.elements,
      },
      removedElementCount: counts.elements,
      weightedRemovedItemCount: counts.total - syntheticSectionCount,
      preparationMs: performance.now() - startedAt,
      startedAt,
      clickToCommitWallMs: 0,
      canvasCommits: 0,
      canvasActualMs: 0,
      canvasActualMaxMs: 0,
      cacheHits: 0,
      cacheMisses: 0,
      cacheMissReasons: {},
      logScheduled: false,
    };
  };

  const deleteContainer = (id) => {
    const startedAt = builderSectionPerfEnabled ? performance.now() : 0;
    if (typeof id !== "string" || !id) return;
    const currentLayouts = layoutsRef.current;
    if (!Array.isArray(currentLayouts)) return;
    const targetIndex = currentLayouts.findIndex(
      (layout) => layout?.container?.id === id
    );
    if (targetIndex === -1) return;
    const targetLayout = currentLayouts[targetIndex];
    const splitRowId = targetLayout?.splitRowId;
    let nextLayouts;
    let removedLayouts;
    let deleteType;
    let source;
    if (splitRowId) {
      removedLayouts = currentLayouts.filter(
        (layout) => layout?.splitRowId === splitRowId
      );
      if (removedLayouts.length === 0) return;
      nextLayouts = currentLayouts.filter(
        (layout) => layout?.splitRowId !== splitRowId
      );
      deleteType = "SPLIT";
      source = splitRowId;
    } else {
      removedLayouts = [targetLayout];
      nextLayouts = [...currentLayouts];
      nextLayouts.splice(targetIndex, 1);
      deleteType = "SECTION";
      source = id;
    }
    if (nextLayouts.length === currentLayouts.length) return;
    const removedIds = collectDeletedStructureIds(
      removedLayouts,
      builderSectionPerfEnabled
    );
    clearDeletedStructuralOptions(removedIds);
    const removedIndexes = [];
    currentLayouts.forEach((layout, index) => {
      if (
        splitRowId
          ? layout?.splitRowId === splitRowId
          : index === targetIndex
      ) {
        removedIndexes.push(index);
      }
    });
    for (let index = removedIndexes.length - 1; index >= 0; index -= 1) {
      pendingDeleteRefGridOpsRef.current.push({
        removeLayout: true,
        layoutIndex: removedIndexes[index],
      });
    }
    beginDeletePerf(
      deleteType,
      source,
      removedLayouts,
      removedIds,
      startedAt
    );
    layoutsRef.current = nextLayouts;
    markScopedLayoutSnapshot(nextLayouts);
    setLayout(nextLayouts);
    if (id === offcanvasID) {
      openOffcavanas(null, null, null);
    }
  };

  const updateColumn = (data, id, conID, options = null) => {
    const startedAt =
      builderSectionPerfEnabled || structurePerfEnabled ? performance.now() : 0;
    const currentLayouts = layoutsRef.current;
    if (!Array.isArray(currentLayouts)) return;
    const IDX = currentLayouts.findIndex(
      (layout) => layout?.container?.id === conID
    );
    if (IDX === -1) return;
    const currentLayout = currentLayouts[IDX];
    if (!Array.isArray(currentLayout?.columns)) return;
    const idx = currentLayout.columns.findIndex((column) => column?.id === id);
    if (idx === -1) return;
    const prevColumn = currentLayout.columns[idx];
    if (!prevColumn || typeof prevColumn !== "object") return;
    const isSplitToggle = options?.columnSplitToggle === true;
    const requestedIsSpan = Boolean(data?.isSpan);
    const isShapeUpdate =
      requestedIsSpan !== Boolean(prevColumn.isSpan);
    if (isSplitToggle && !isShapeUpdate) return;
    const newColumn = isSplitToggle
      ? { ...prevColumn, isSpan: requestedIsSpan }
      : { ...data };
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

    if (isShapeUpdate && newColumn?.isSpan === true) {
      if (isSplitToggle) {
        const seeded = sanitizeElementsForLayout(
          lodash.cloneDeep(prevColumn.elements)
        );
        newColumn.spans = [
          makeSpanShell(`Span-${colKey}-0`, seeded),
          makeSpanShell(`Span-${colKey}-1`, []),
          makeSpanShell(`Span-${colKey}-2`, []),
          makeSpanShell(`Span-${colKey}-3`, []),
        ];
        newColumn.latestSpanID = 4;
      } else if (
        Array.isArray(newColumn.spans) &&
        newColumn.spans.length > 0
      ) {
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
      } else {
        const seeded = sanitizeElementsForLayout(
          lodash.cloneDeep(prevColumn.elements)
        );
        newColumn.spans = [
          makeSpanShell(`Span-${colKey}-0`, seeded),
          makeSpanShell(`Span-${colKey}-1`, []),
          makeSpanShell(`Span-${colKey}-2`, []),
          makeSpanShell(`Span-${colKey}-3`, []),
        ];
        newColumn.latestSpanID = 4;
      }
      newColumn.elements = [];
      newColumn.latestEleID = 0;
    } else if (
      isShapeUpdate &&
      prevColumn?.isSpan &&
      Array.isArray(isSplitToggle ? prevColumn.spans : newColumn?.spans)
    ) {
      const mergedElements = [];
      const sourceSpans = isSplitToggle ? prevColumn.spans : newColumn.spans;
      for (const sp of sourceSpans) {
        if (Array.isArray(sp?.elements) && sp.elements.length > 0) {
          mergedElements.push(
            ...sanitizeElementsForLayout(lodash.cloneDeep(sp.elements))
          );
        }
      }
      newColumn.elements = mergedElements;
      newColumn.latestEleID = mergedElements.length;
      delete newColumn.spans;
      newColumn.latestSpanID = 0;
    }
    if (
      isShapeUpdate &&
      newColumn?.isSpan === true &&
      Array.isArray(newColumn?.spans)
    ) {
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
    if (
      !isShapeUpdate &&
      newColumn &&
      typeof newColumn === "object"
    ) {
      const nextKeys = Object.keys(newColumn);
      const previousKeys = Object.keys(prevColumn);
      if (
        nextKeys.length === previousKeys.length &&
        nextKeys.every((key) => Object.is(newColumn[key], prevColumn[key]))
      ) {
        return;
      }
    }
    const panelChangedFields = Array.isArray(options?.panelChangedFields)
      ? options.panelChangedFields
      : null;
    if (structurePerfEnabled && panelChangedFields) {
      dataSliderPanelUpdatePerfRef.current = {
        panelType: "Column",
        target: String(id || ""),
        fields: panelChangedFields,
        startedAt,
        patchMs: performance.now() - startedAt,
        canvasCommits: 0,
        canvasActualMs: 0,
        canvasMaxMs: 0,
        sectionCacheHits: 0,
        sectionCacheMisses: 0,
        sectionCacheMissReasons: {},
        logScheduled: false,
      };
    }
    const newColumns = [...currentLayout.columns];
    newColumns[idx] = newColumn;
    const newLayout = { ...currentLayout, columns: newColumns };
    const newLayouts = [...currentLayouts];
    newLayouts[IDX] = newLayout;
    if (dataSliderPanelUpdatePerfRef.current?.panelType === "Column") {
      dataSliderPanelUpdatePerfRef.current.patchMs =
        performance.now() - startedAt;
    }
    if (isSplitToggle) {
      beginCanvasPerformanceTransaction("canvas-column-split", {
        label: newColumn.isSpan
          ? `แยก Column เป็น Span / ${String(id)}`
          : `รวม Span กลับเป็น Column / ${String(id)}`,
        elementType: "column",
        elementId: id,
        scope: `${conID}/${id}`,
        skipInitialFrameGap: true,
      });
    }
    if (builderSectionPerfEnabled && isSplitToggle) {
      const fromSpanCount = Array.isArray(prevColumn.spans)
        ? prevColumn.spans.length
        : 0;
      const toSpanCount = Array.isArray(newColumn.spans)
        ? newColumn.spans.length
        : 0;
      const movedElementCount = newColumn.isSpan
        ? newColumn.spans?.[0]?.elements?.length || 0
        : newColumn.elements?.length || 0;
      columnSplitPerfRef.current = {
        operation: newColumn.isSpan ? "SPLIT" : "UNSPLIT",
        sourceColumn: { containerId: conID, columnId: id },
        targetColumn: { containerId: conID, columnId: id },
        fromSpanCount,
        toSpanCount,
        movedElementCount,
        preparationMs: performance.now() - startedAt,
        startedAt,
        clickToCommitWallMs: 0,
        canvasCommits: 0,
        canvasActualMs: 0,
        canvasActualMaxMs: 0,
        cacheHits: 0,
        cacheMisses: 0,
        cacheMissReasons: {},
        logScheduled: false,
      };
    }
    layoutsRef.current = newLayouts;
    markScopedLayoutSnapshot(newLayouts);
    setLayout(newLayouts);
  };

  const cloneColumn = (id) => {
    const startedAt = builderSectionPerfEnabled ? performance.now() : 0;
    const { conID, colID } = id || {};
    if (!conID || !colID) return;
    const currentLayouts = layoutsRef.current;
    if (!Array.isArray(currentLayouts)) return;
    const IDX = currentLayouts.findIndex(
      (layout) => layout?.container?.id === conID
    );
    if (IDX === -1) return;
    const currentLayout = currentLayouts[IDX];
    if (!Array.isArray(currentLayout?.columns)) return;
    const idx = currentLayout.columns.findIndex((column) => column?.id == colID);
    if (idx === -1) return;
    const sourceColumn = currentLayout.columns[idx];
    if (!sourceColumn || typeof sourceColumn !== "object") return;
    const newColumn = lodash.cloneDeep(sourceColumn);
    const newColumns = [...currentLayout.columns];
    const idPaths = String(currentLayout.container?.id || "").split("-");
    const sectionKey = idPaths[1];
    if (!sectionKey) return;
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
    const newLayout = {
      ...currentLayout,
      columns: newColumns,
      container: syncContainerLatestColId(currentLayout.container, newColumns),
    };
    const newLayouts = [...currentLayouts];
    newLayouts[IDX] = newLayout;

    /* ให้ ref grid ตรงกับคอลัมน์หลังแทรก — ไม่งั้น index เยื้อง (deleteColumn มี splice แต่ clone ไม่มี คอลัมน์ใหม่จะหาย/ทับ ref) */
    if (!columned.current[IDX]) columned.current[IDX] = [];
    columned.current[IDX].splice(idx + 1, 0, null);
    if (!spaned.current[IDX]) spaned.current[IDX] = [];
    spaned.current[IDX].splice(idx + 1, 0, []);
    if (!nestedSpaned.current[IDX]) nestedSpaned.current[IDX] = [];
    nestedSpaned.current[IDX].splice(idx + 1, 0, []);

    beginCanvasPerformanceTransaction("canvas-clone", {
      label: `ทำสำเนา Column / ${String(colID)}`,
      elementType: "column",
      elementId: colID,
      scope: `${conID}/${colID}`,
      skipInitialFrameGap: true,
    });
    if (builderSectionPerfEnabled) {
      const copiedCounts = countCanvasLayoutStructureAndElements([
        { columns: [sourceColumn] },
      ]);
      clonePerfRef.current = {
        type: "COLUMN",
        source: `${conID}/${colID}`,
        createdIds: {
          columnIds: [newColumn.id],
          spanIds: (newColumn.spans || []).map((span) => span.id),
        },
        sourceElementCount: copiedCounts.elements,
        weightedCopiedItemCount:
          copiedCounts.total - copiedCounts.sections,
        preparationMs: performance.now() - startedAt,
        startedAt,
        clickToCommitWallMs: 0,
        canvasCommits: 0,
        canvasActualMs: 0,
        canvasActualMaxMs: 0,
        cacheHits: 0,
        cacheMisses: 0,
        cacheMissReasons: {},
        logScheduled: false,
      };
    }
    layoutsRef.current = newLayouts;
    markScopedLayoutSnapshot(newLayouts);
    setLayout(newLayouts);
  };

  const deleteColumn = (id) => {
    const startedAt = builderSectionPerfEnabled ? performance.now() : 0;
    const { conID, colID } = id || {};
    if (!conID || !colID) return;
    const currentLayouts = layoutsRef.current;
    if (!Array.isArray(currentLayouts)) return;
    const layoutIndex = currentLayouts.findIndex(
      (layout) => layout?.container?.id === conID
    );
    if (layoutIndex === -1) return;
    const currentLayout = currentLayouts[layoutIndex];
    if (!Array.isArray(currentLayout?.columns)) return;
    const columnIndex = currentLayout.columns.findIndex(
      (column) => column?.id === colID
    );
    if (columnIndex === -1) return;
    const removedColumn = currentLayout.columns[columnIndex];
    const nextColumns = [...currentLayout.columns];
    nextColumns.splice(columnIndex, 1);
    const nextLayout = { ...currentLayout, columns: nextColumns };
    const nextLayouts = [...currentLayouts];
    const removesWholeSection = nextColumns.length === 0;
    if (removesWholeSection) {
      // Preserve the established split behavior: remove only this half.
      nextLayouts.splice(layoutIndex, 1);
    } else {
      nextLayouts[layoutIndex] = nextLayout;
    }
    const removedLayouts = removesWholeSection
      ? [currentLayout]
      : [{ columns: [removedColumn] }];
    const removedIds = collectDeletedStructureIds(
      removedLayouts,
      builderSectionPerfEnabled
    );
    clearDeletedStructuralOptions(removedIds);
    pendingDeleteRefGridOpsRef.current.push({
      removeLayout: removesWholeSection,
      layoutIndex,
      columnIndex,
    });
    beginDeletePerf(
      "COLUMN",
      `${conID}/${colID}`,
      removedLayouts,
      removedIds,
      startedAt,
      removesWholeSection
    );

    layoutsRef.current = nextLayouts;
    markScopedLayoutSnapshot(nextLayouts);
    setLayout(nextLayouts);
  };

  const updateSpan = (data, id, conID, colID) => {
    const newLayouts = [...layouts];
    const IDX = newLayouts.findIndex((l) => l.container.id === conID);
    if (IDX === -1) return;
    const currentLayout = newLayouts[IDX];
    const idx = currentLayout.columns.findIndex((c) => c.id === colID);
    if (idx === -1) return;
    const currentColumn = currentLayout.columns[idx];
    const sidx = currentColumn.spans.findIndex((s) => s.id === id);
    if (sidx === -1) return;
    const newSpans = [...currentColumn.spans];
    newSpans[sidx] = data;
    const newColumns = [...currentLayout.columns];
    newColumns[idx] = { ...currentColumn, spans: newSpans };
    newLayouts[IDX] = { ...currentLayout, columns: newColumns };
    markScopedLayoutSnapshot(newLayouts);
    setLayout(newLayouts);
  };

  const cloneSpan = (id) => {
    const startedAt = builderSectionPerfEnabled ? performance.now() : 0;
    const { conID, colID, spnID } = id || {};
    if (!conID || !colID || !spnID) return;
    const currentLayouts = layoutsRef.current;
    if (!Array.isArray(currentLayouts)) return;
    const layoutIndex = currentLayouts.findIndex(
      (layout) => layout?.container?.id === conID
    );
    if (layoutIndex === -1) return;
    const currentLayout = currentLayouts[layoutIndex];
    if (!Array.isArray(currentLayout?.columns)) return;
    const columnIndex = currentLayout.columns.findIndex(
      (column) => column?.id === colID
    );
    if (columnIndex === -1) return;
    const currentColumn = currentLayout.columns[columnIndex];
    if (!Array.isArray(currentColumn?.spans)) return;
    const spanIndex = currentColumn.spans.findIndex(
      (span) => span?.id === spnID
    );
    if (spanIndex === -1) return;
    const sourceSpan = currentColumn.spans[spanIndex];
    const newSpan = lodash.cloneDeep(sourceSpan);
    const sourceId = String(sourceSpan.id);
    const sourceSuffixMatch = sourceId.match(/^(.*)-(\d+)$/);
    const spanIdPrefix = sourceSuffixMatch
      ? sourceSuffixMatch[1]
      : `Span-${String(currentColumn.id).replace(/^Col-/, "")}`;
    const usedSpanIds = new Set(
      currentColumn.spans.map((span) => String(span?.id || ""))
    );
    let maxUsedSuffix = -1;
    currentColumn.spans.forEach((span) => {
      const match = String(span?.id || "").match(/^(.*)-(\d+)$/);
      if (match?.[1] === spanIdPrefix) {
        maxUsedSuffix = Math.max(maxUsedSuffix, Number(match[2]));
      }
    });
    let nextSpanCounter = Math.max(
      Number.isFinite(Number(currentColumn.latestSpanID))
        ? Number(currentColumn.latestSpanID)
        : 0,
      maxUsedSuffix + 1
    );
    let nextSpanId = `${spanIdPrefix}-${nextSpanCounter}`;
    while (usedSpanIds.has(nextSpanId)) {
      nextSpanCounter += 1;
      nextSpanId = `${spanIdPrefix}-${nextSpanCounter}`;
    }
    newSpan.id = nextSpanId;
    newSpan.hasNestedSpan = false;
    newSpan.nestedSpans = [];
    newSpan.latestNestedSpanID = 0;
    const copiedElements = Array.isArray(newSpan.elements)
      ? newSpan.elements
      : [];
    newSpan.elements = copiedElements;
    newSpan.latestEleID = copiedElements.length;
    copiedElements.forEach((e, i) => {
      const type = e.id.split("-")[0];
      e.id = `${type}-${newSpan.id.replace("Span-","")}-${i}`;
    });
    const nextSpans = [...currentColumn.spans];
    nextSpans.splice(spanIndex + 1, 0, newSpan);
    const nextColumn = {
      ...currentColumn,
      spans: nextSpans,
      latestSpanID: nextSpanCounter + 1,
    };
    const nextColumns = [...currentLayout.columns];
    nextColumns[columnIndex] = nextColumn;
    const nextLayouts = [...currentLayouts];
    nextLayouts[layoutIndex] = { ...currentLayout, columns: nextColumns };
    if (!spaned.current[layoutIndex]) spaned.current[layoutIndex] = [];
    if (!Array.isArray(spaned.current[layoutIndex][columnIndex])) {
      spaned.current[layoutIndex][columnIndex] = [];
    }
    spaned.current[layoutIndex][columnIndex].splice(spanIndex + 1, 0, null);
    if (!nestedSpaned.current[layoutIndex]) {
      nestedSpaned.current[layoutIndex] = [];
    }
    if (!Array.isArray(nestedSpaned.current[layoutIndex][columnIndex])) {
      nestedSpaned.current[layoutIndex][columnIndex] = [];
    }
    nestedSpaned.current[layoutIndex][columnIndex].splice(
      spanIndex + 1,
      0,
      []
    );
    const perf = startSpanStructurePerfSession("ADD", {
      startedAt,
      containerId: conID,
      columnId: colID,
      sourceSpanId: spnID,
      targetSpanId: spnID,
      createdSpanId: newSpan.id,
      copiedElementCount: copiedElements.length,
      remainingSpanCount: nextSpans.length,
    });
    if (perf) perf.preparationMs = performance.now() - startedAt;
    layoutsRef.current = nextLayouts;
    markScopedLayoutSnapshot(nextLayouts);
    setLayout(nextLayouts);
  };

  const deleteSpan = (id) => {
    const startedAt = builderSectionPerfEnabled ? performance.now() : 0;
    const { conID, colID, spnID } = id || {};
    if (!conID || !colID || !spnID) return;
    const currentLayouts = layoutsRef.current;
    if (!Array.isArray(currentLayouts)) return;
    const layoutIndex = currentLayouts.findIndex(
      (layout) => layout?.container?.id === conID
    );
    if (layoutIndex === -1) return;
    const currentLayout = currentLayouts[layoutIndex];
    if (!Array.isArray(currentLayout?.columns)) return;
    const columnIndex = currentLayout.columns.findIndex(
      (column) => column?.id === colID
    );
    if (columnIndex === -1) return;
    const currentColumn = currentLayout.columns[columnIndex];
    if (!Array.isArray(currentColumn?.spans)) return;
    const spanIndex = currentColumn.spans.findIndex(
      (span) => span?.id === spnID
    );
    if (spanIndex === -1) return;
    const removedSpan = currentColumn.spans[spanIndex];
    const nextSpans = currentColumn.spans.filter(
      (_, index) => index !== spanIndex
    );
    if (nextSpans.length === 0) return;
    const collapseToColumn = nextSpans.length === 1;
    let nextColumn;
    let movedElementCount = 0;
    if (collapseToColumn) {
      const lastSpan = nextSpans[0];
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
      nextColumn = {
        ...currentColumn,
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
        isSpan: false,
      };
      delete nextColumn.spans;
      delete nextColumn.latestSpanID;
      movedElementCount = Array.isArray(elements) ? elements.length : 0;
    } else {
      nextColumn = { ...currentColumn, spans: nextSpans };
    }
    const nextColumns = [...currentLayout.columns];
    nextColumns[columnIndex] = nextColumn;
    const nextLayouts = [...currentLayouts];
    nextLayouts[layoutIndex] = { ...currentLayout, columns: nextColumns };
    const removedSpanIds = collapseToColumn
      ? [spnID, nextSpans[0]?.id].filter(Boolean)
      : [spnID];
    clearDeletedStructuralOptions({
      sectionIds: [],
      splitRowIds: [],
      columnIds: [],
      spanIds: removedSpanIds,
      elementIds: [],
    });
    pendingDeleteRefGridOpsRef.current.push({
      removeSpan: true,
      collapseToColumn,
      layoutIndex,
      columnIndex,
      spanIndex,
    });
    const perf = startSpanStructurePerfSession(
      collapseToColumn ? "COLLAPSE_TO_COLUMN" : "DELETE",
      {
        startedAt,
        containerId: conID,
        columnId: colID,
        sourceSpanId: spnID,
        targetSpanId: spnID,
        removedSpanId: spnID,
        removedElementCount: Array.isArray(removedSpan?.elements)
          ? removedSpan.elements.length
          : 0,
        movedElementCount,
        remainingSpanCount: nextSpans.length,
      }
    );
    if (perf) perf.preparationMs = performance.now() - startedAt;
    layoutsRef.current = nextLayouts;
    markScopedLayoutSnapshot(nextLayouts);
    setLayout(nextLayouts);
  };


  const deleteElement = useCallback(
    (id) => {
      const startedAt = builderSectionPerfEnabled ? performance.now() : 0;
      const layoutSnap = layoutsRef.current;
      if (!id || !Array.isArray(layoutSnap) || layoutSnap.length === 0) return;
      const { conID, colID, spnID, nestID, eleID } = id;
      if (conID == null || colID == null || eleID == null) return;

      const matchesId = (entry, targetId) => {
        const target = String(targetId);
        return (
          (entry?.id != null && String(entry.id) === target) ||
          (entry?._id != null && String(entry._id) === target)
        );
      };
      const IDX = layoutSnap.findIndex(
        (layout) =>
          matchesId(layout?.container, conID) || matchesId(layout, conID)
      );
      if (IDX === -1) return;
      const layout = layoutSnap[IDX];
      const cols = layout?.columns;
      if (!Array.isArray(cols) || cols.length === 0) return;
      const idx = cols.findIndex((column) => matchesId(column, colID));
      if (idx === -1) return;

      const currentColumn = cols[idx];
      let currentElements;
      let targetType = "COLUMN";
      let nextColumn;
      if (spnID != null) {
        const spans = currentColumn.spans;
        if (!Array.isArray(spans)) return;
        const sidx = spans.findIndex((span) => matchesId(span, spnID));
        if (sidx === -1) return;
        const currentSpan = spans[sidx];
        if (nestID != null) {
          const nestedSpans = currentSpan.nestedSpans;
          if (!Array.isArray(nestedSpans)) return;
          const msidx = nestedSpans.findIndex(
            (nestedSpan) => matchesId(nestedSpan, nestID)
          );
          if (msidx === -1) return;
          currentElements = nestedSpans[msidx].elements;
          if (!Array.isArray(currentElements)) return;
          targetType = "NESTED_SPAN";
          nextColumn = {
            ...currentColumn,
            spans: [...spans],
          };
          const nextSpan = {
            ...currentSpan,
            nestedSpans: [...nestedSpans],
          };
          nextColumn.spans[sidx] = nextSpan;
          nextSpan.nestedSpans[msidx] = {
            ...nestedSpans[msidx],
          };
        } else {
          currentElements = currentSpan.elements;
          if (!Array.isArray(currentElements)) return;
          targetType = "SPAN";
          nextColumn = {
            ...currentColumn,
            spans: [...spans],
          };
          nextColumn.spans[sidx] = { ...currentSpan };
        }
      } else {
        currentElements = currentColumn.elements;
        if (!Array.isArray(currentElements)) return;
        nextColumn = { ...currentColumn };
      }

      const i = currentElements.findIndex((element) =>
        matchesId(element, eleID)
      );
      if (i === -1) return;

      const groupKeys = [
        "buttonRowGroupId",
        "iconRowGroupId",
        "listRowGroupId",
        "counterRowGroupId",
      ];
      // The orphan cleanup helper deletes properties, so every surviving
      // element must be a new object even though nested element data is shared.
      const newElements = currentElements
        .filter((_, elementIndex) => elementIndex !== i)
        .map((element) => ({ ...element }));
      const beforeGroupPropertyCount = newElements.reduce(
        (count, element) =>
          count +
          groupKeys.reduce(
            (keyCount, key) =>
              keyCount + (element?.[key] != null ? 1 : 0),
            0
          ),
        0
      );
      stripOrphanInlineRowGroupIds(newElements);
      const afterGroupPropertyCount = newElements.reduce(
        (count, element) =>
          count +
          groupKeys.reduce(
            (keyCount, key) =>
              keyCount + (element?.[key] != null ? 1 : 0),
            0
          ),
        0
      );

      if (targetType === "NESTED_SPAN") {
        const nextSpans = nextColumn.spans;
        const nextSpan = nextSpans.find((span) => matchesId(span, spnID));
        const nextNestedSpan = nextSpan.nestedSpans.find((nestedSpan) =>
          matchesId(nestedSpan, nestID)
        );
        nextNestedSpan.elements = newElements;
      } else if (targetType === "SPAN") {
        const nextSpan = nextColumn.spans.find((span) =>
          matchesId(span, spnID)
        );
        nextSpan.elements = newElements;
      } else {
        nextColumn.elements = newElements;
      }

      const nextColumns = [...cols];
      nextColumns[idx] = nextColumn;
      const nextLayouts = [...layoutSnap];
      nextLayouts[IDX] = { ...layout, columns: nextColumns };
      beginCanvasPerformanceTransaction("canvas-delete", {
        label: `ลบองค์ประกอบ / ${String(eleID)}`,
        elementType: "element",
        elementId: eleID,
        scope: [conID, colID, spnID, nestID]
          .filter((value) => value != null && value !== "")
          .join("/"),
        skipInitialFrameGap: true,
      });
      if (builderSectionPerfEnabled) {
        const sessionId = nextElementDeletePerfSessionIdRef.current++;
        elementDeletePerfSessionsRef.current.set(sessionId, {
          id: sessionId,
          targetType,
          targetPath: {
            containerId: conID,
            columnId: colID,
            spanId: spnID ?? null,
            nestedSpanId: nestID ?? null,
            elementId: eleID,
          },
          preparationMs: performance.now() - startedAt,
          startedAt,
          clickToCommitWallMs: 0,
          canvasCommits: 0,
          canvasActualMs: 0,
          canvasMaxMs: 0,
          cacheHits: 0,
          cacheMisses: 0,
          cacheMissReasons: {},
          columnRenderCacheHits: 0,
          columnRenderCacheMisses: 0,
          columnRenderCacheMissReasons: {},
          rebuiltColumnCount: 0,
          bucketSizeBefore: currentElements.length,
          bucketSizeAfter: newElements.length,
          orphanGroupCleanupCount: Math.max(
            0,
            beforeGroupPropertyCount - afterGroupPropertyCount
          ),
        });
      }
      layoutsRef.current = nextLayouts;
      markScopedLayoutSnapshot(nextLayouts);
      setLayout(nextLayouts);
      setSelectID(
        (previous) =>
          previous?.status || previous?.ids?.eleID != null
            ? { status: "", ids: {} }
            : previous,
        {
          elementSelectionCache: true,
          performanceTransaction: false,
        }
      );
      if (eleID === offcanvasID) {
        openOffcavanas(null, null, null);
      }
    },
    [
      builderSectionPerfEnabled,
      beginCanvasPerformanceTransaction,
      setLayout,
      setSelectID,
      offcanvasID,
      openOffcavanas,
    ]
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
    setSelectID,
  ]);

  const beginSizeChangePerf = (
    type,
    target,
    fromSize,
    toSize,
    startedAt,
    validationMs
  ) => {
    const normalizedType = String(type || "structure").toLowerCase();
    const targetId = String(target || "").split("/").filter(Boolean).pop() || "";
    beginCanvasPerformanceTransaction("canvas-resize", {
      label: `ปรับขนาด ${type} ${fromSize} → ${toSize} / ${targetId}`,
      elementType: normalizedType,
      elementId: targetId,
      scope: String(target || ""),
      skipInitialFrameGap:
        normalizedType === "column" || normalizedType === "span",
    });
    if (!builderSectionPerfEnabled) return;
    sizeChangePerfRef.current = {
      type,
      target,
      fromSize,
      toSize,
      startedAt,
      validationMs,
      clickToCommitWallMs: 0,
      canvasCommits: 0,
      canvasActualMs: 0,
      canvasActualMaxMs: 0,
      cacheHits: 0,
      cacheMisses: 0,
      cacheMissReasons: {},
      logScheduled: false,
    };
  };

  const changeSizeColumn = (id, symbol) => {
    const startedAt = builderSectionPerfEnabled ? performance.now() : 0;
    const { conID, colID } = id || {};
    if (!conID || !colID) return;
    if (symbol !== "+" && symbol !== "-") return;
    const currentLayouts = layoutsRef.current;
    if (!Array.isArray(currentLayouts)) return;
    const containerIndex = currentLayouts.findIndex(
      (layout) => layout?.container?.id === conID
    );
    if (containerIndex < 0) return;
    const currentSection = currentLayouts[containerIndex];
    const currentColumns = currentSection?.columns;
    if (!Array.isArray(currentColumns)) return;
    const columnIndex = currentColumns.findIndex(
      (column) => column?.id === colID
    );
    if (columnIndex < 0) return;
    const currentColumn = currentColumns[columnIndex];
    const currentSize = Number(currentColumn?.size);
    if (
      !Number.isInteger(currentSize) ||
      currentSize < 1 ||
      currentSize > 12
    ) {
      return;
    }
    let nextSize = currentSize;
    if (symbol === "+" && currentSize < 12) {
      nextSize = currentSize + 1;
      postColWarnedRef.current = false;
      setPostColToastOpen(false);
    } else if (symbol === "-") {
      if (currentColumn.isSpan) {
        if (currentSize - 1 < 3) {
          setAlert(true);
        }
        nextSize = Math.max(currentSize - 1, 3);
      } else {
        nextSize = Math.max(currentSize - 1, 1);
      }
      if (!canColumnSizeContainListImageMinWidthElements(currentColumn, nextSize)) {
        listImageColWarnedRef.current = false;
        setListImageColToastOpen(false);
        requestAnimationFrame(() => setListImageColToastOpen(true));
        return;
      }
      if (!canColumnSizeContainImageHoverMinWidthElements(currentColumn, nextSize)) {
        carouselColWarnedRef.current = false;
        setCarouselColToastOpen(false);
        requestAnimationFrame(() => setCarouselColToastOpen(true));
        return;
      }
      if (!canColumnSizeContainAccordionMinWidthElements(currentColumn, nextSize)) {
        carouselColWarnedRef.current = false;
        setCarouselColToastOpen(false);
        requestAnimationFrame(() => setCarouselColToastOpen(true));
        return;
      }
      if (!canColumnSizeContainTabsMinWidthElements(currentColumn, nextSize)) {
        postColWarnedRef.current = false;
        setPostColToastOpen(false);
        requestAnimationFrame(() => setPostColToastOpen(true));
        return;
      }
      if (!canColumnSizeContainBetweenMinWidthElements(currentColumn, nextSize)) {
        carouselColWarnedRef.current = false;
        setCarouselColToastOpen(false);
        requestAnimationFrame(() => setCarouselColToastOpen(true));
        return;
      }
      if (!canColumnSizeContainTableMinWidthElements(currentColumn, nextSize)) {
        carouselColWarnedRef.current = false;
        setCarouselColToastOpen(false);
        requestAnimationFrame(() => setCarouselColToastOpen(true));
        return;
      }
      if (!canColumnSizeContainCarouselMinWidthElements(currentColumn, nextSize)) {
        carouselColWarnedRef.current = false;
        setCarouselColToastOpen(false);
        requestAnimationFrame(() => setCarouselColToastOpen(true));
        return;
      }
      if (!canColumnSizeContainPostMinWidthElements(currentColumn, nextSize)) {
        postColWarnedRef.current = false;
        setPostColToastOpen(false);
        requestAnimationFrame(() => setPostColToastOpen(true));
        return;
      }
      postColWarnedRef.current = false;
      setPostColToastOpen(false);
    }
    if (nextSize === currentSize) return;

    const validationMs = builderSectionPerfEnabled
      ? performance.now() - startedAt
      : 0;
    const nextColumns = [...currentColumns];
    nextColumns[columnIndex] = { ...currentColumn, size: nextSize };
    const nextLayouts = [...currentLayouts];
    nextLayouts[containerIndex] = {
      ...currentSection,
      columns: nextColumns,
    };
    beginSizeChangePerf(
      "COLUMN",
      `${conID}/${colID}`,
      currentSize,
      nextSize,
      startedAt,
      validationMs
    );
    layoutsRef.current = nextLayouts;
    markScopedLayoutSnapshot(nextLayouts);
    setLayout(nextLayouts);
  };

  const changeSizeSpan = (id, symbol) => {
    const startedAt = builderSectionPerfEnabled ? performance.now() : 0;
    const { conID, colID, spnID } = id || {};
    if (!conID || !colID || !spnID) return;
    if (symbol !== "+" && symbol !== "-") return;
    const currentLayouts = layoutsRef.current;
    if (!Array.isArray(currentLayouts)) return;
    const containerIndex = currentLayouts.findIndex(
      (layout) => layout?.container?.id === conID
    );
    if (containerIndex < 0) return;
    const currentSection = currentLayouts[containerIndex];
    const currentColumns = currentSection?.columns;
    if (!Array.isArray(currentColumns)) return;
    const columnIndex = currentColumns.findIndex(
      (column) => column?.id === colID
    );
    if (columnIndex < 0) return;
    const currentColumn = currentColumns[columnIndex];
    const currentSpans = currentColumn?.spans;
    if (!Array.isArray(currentSpans) || currentSpans.length === 0) return;
    const spanIndex = currentSpans.findIndex((span) => span?.id === spnID);
    if (spanIndex < 0) return;
    const currentSpan = currentSpans[spanIndex];
    const currentSize = Number(currentSpan?.size);
    if (
      !Number.isInteger(currentSize) ||
      currentSize < 1 ||
      currentSize > 12
    ) {
      return;
    }
    const nextSize =
      symbol === "+"
        ? Math.min(currentSize + 1, 12)
        : Math.max(currentSize - 1, 1);
    if (nextSize === currentSize) return;

    const validationMs = builderSectionPerfEnabled
      ? performance.now() - startedAt
      : 0;
    const nextSpans = [...currentSpans];
    nextSpans[spanIndex] = { ...currentSpan, size: nextSize };
    const nextColumns = [...currentColumns];
    nextColumns[columnIndex] = { ...currentColumn, spans: nextSpans };
    const nextLayouts = [...currentLayouts];
    nextLayouts[containerIndex] = {
      ...currentSection,
      columns: nextColumns,
    };
    beginSizeChangePerf(
      "SPAN",
      `${conID}/${colID}/${spnID}`,
      currentSize,
      nextSize,
      startedAt,
      validationMs
    );
    layoutsRef.current = nextLayouts;
    markScopedLayoutSnapshot(nextLayouts);
    setLayout(nextLayouts);
  };


  const ElementSetting = ({x,y})=>{


    if(x === null || y === null) return

    return (
      <div style={{position: "fixed",left: x,top: y,width:200,height:200,backgroundColor:"white"}} onContextMenu={(e)=>{
        e.preventDefault()
      }}>
          รรรร
      </div>
    )
  }

  const beginArrowReorderPerf = (type, source, target, startedAt) => {
    beginCanvasPerformanceTransaction("canvas-reorder", {
      label: `ย้ายลำดับ ${type} / ${String(source ?? "")}`,
      elementType: String(type || "structure").toLowerCase(),
      elementId: source,
      scope: `${String(source ?? "")}/${String(target ?? "")}`,
      skipInitialFrameGap:
        type === "SECTION" ||
        type === "SPLIT" ||
        type === "COLUMN" ||
        type === "SPAN",
    });
    if (!builderSectionPerfEnabled) return;
    arrowReorderPerfRef.current = {
      type,
      source: String(source ?? ""),
      target: String(target ?? ""),
      startedAt,
      clickToCommitWallMs: 0,
      canvasCommits: 0,
      canvasActualMs: 0,
      canvasActualMaxMs: 0,
      cacheHits: 0,
      cacheMisses: 0,
      cacheMissReasons: {},
      scopedLayoutCacheActive: false,
      elementCanvasDragRenderActive: false,
      sidebarPreviewRenderActive: false,
      logScheduled: false,
    };
  };

  const changeSpanPosition = (_index, ids, symbol) => {
    const startedAt = builderSectionPerfEnabled ? performance.now() : 0;
    const { conID, colID, spnID } = ids || {};
    if (!conID || !colID || !spnID) return;
    if (symbol !== "-" && symbol !== "+") return;
    const currentLayouts = layoutsRef.current;
    if (!Array.isArray(currentLayouts)) return;
    const containerIndex = currentLayouts.findIndex(
      (layout) => layout?.container?.id === conID
    );
    if (containerIndex < 0) return;
    const currentSection = currentLayouts[containerIndex];
    const currentColumns = currentSection?.columns;
    if (!Array.isArray(currentColumns)) return;
    const columnIndex = currentColumns.findIndex(
      (column) => column?.id === colID
    );
    if (columnIndex < 0) return;
    const currentColumn = currentColumns[columnIndex];
    const currentSpans = currentColumn?.spans;
    if (!Array.isArray(currentSpans) || currentSpans.length <= 1) return;
    const requestedIndex = Number(_index);
    const spanIndex =
      Number.isInteger(requestedIndex) &&
      requestedIndex >= 0 &&
      requestedIndex < currentSpans.length &&
      currentSpans[requestedIndex]?.id === spnID
        ? requestedIndex
        : currentSpans.findIndex((span) => span?.id === spnID);
    if (spanIndex < 0) return;
    const targetIndex = symbol === "-" ? spanIndex - 1 : spanIndex + 1;
    if (targetIndex < 0 || targetIndex >= currentSpans.length) return;

    const nextSpans = [...currentSpans];
    [nextSpans[spanIndex], nextSpans[targetIndex]] = [
      nextSpans[targetIndex],
      nextSpans[spanIndex],
    ];
    const nextColumns = [...currentColumns];
    nextColumns[columnIndex] = { ...currentColumn, spans: nextSpans };
    const nextLayouts = [...currentLayouts];
    nextLayouts[containerIndex] = { ...currentSection, columns: nextColumns };
    beginArrowReorderPerf(
      "SPAN",
      spnID,
      currentSpans[targetIndex]?.id,
      startedAt
    );
    layoutsRef.current = nextLayouts;
    markScopedLayoutSnapshot(nextLayouts);
    setLayout(nextLayouts);
  };


  const changeColumnPositionByArrow = (ids, symbol) => {
    const startedAt = builderSectionPerfEnabled ? performance.now() : 0;
    const { conID, colID } = ids || {};
    if (!conID || !colID) return;
    if (symbol !== "-" && symbol !== "+") return;
    const currentLayouts = layoutsRef.current;
    if (!Array.isArray(currentLayouts)) return;
    const containerIndex = currentLayouts.findIndex(
      (layout) => layout?.container?.id === conID
    );
    if (containerIndex === -1) return;
    const currentSection = currentLayouts[containerIndex];
    const cols = currentSection?.columns;
    if (!Array.isArray(cols) || cols.length <= 1) return;
    const index = cols.findIndex((column) => column?.id === colID);
    if (index === -1) return;
    const targetIndex = symbol === "-" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= cols.length) return;

    const nextColumns = [...cols];
    [nextColumns[index], nextColumns[targetIndex]] = [
      nextColumns[targetIndex],
      nextColumns[index],
    ];
    const nextLayouts = [...currentLayouts];
    nextLayouts[containerIndex] = {
      ...currentSection,
      columns: nextColumns,
    };
    beginArrowReorderPerf(
      "COLUMN",
      colID,
      cols[targetIndex]?.id,
      startedAt
    );
    markScopedLayoutSnapshot(nextLayouts);
    setLayout(nextLayouts);
  };

  const changeContainerPositionByArrow = (id, symbol) => {
    const startedAt = builderSectionPerfEnabled ? performance.now() : 0;
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
    const rowIdentity = (row) =>
      row?.kind === "split"
        ? row.sid
        : row?.items?.[0]?.container?.id;
    beginArrowReorderPerf(
      moved.kind === "split" ? "SPLIT" : "SECTION",
      rowIdentity(moved),
      rowIdentity(rows[targetIndex]),
      startedAt
    );
    layoutsRef.current = nextLayouts;
    markScopedLayoutSnapshot(nextLayouts);
    sectionOffscreenSyncPausedRef.current = true;
    setLayout(nextLayouts);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.setTimeout(() => {
          sectionOffscreenSyncPausedRef.current = false;
        }, 0);
      });
    });
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

  const renderStructuralSplitRowItem = ({
    id,
    renderChildren,
    domBridge,
    structuralOption,
  }) => {
    const sectionIndex = layouts.findIndex((layout) => layout?.splitRowId === id);
    const splitNodeKey = `split:${id}`;
    const splitLayouts = layouts.filter((layout) => layout?.splitRowId === id);
    const offscreenEligible =
      offscreenSectionExperimentEnabled &&
      splitLayouts.length > 0 &&
      splitLayouts.every(isOffscreenSectionEligible);
    const bridge = domBridge.current;
    return (
      <div
        ref={
          offscreenSectionExperimentEnabled && offscreenEligible
            ? (node) =>
                registerOffscreenSectionNode(
                  splitNodeKey,
                  node,
                  bridge.nodeRef,
                  offscreenEligible
                )
            : bridge.nodeRef
        }
        style={offscreenStyleForSection(splitNodeKey, offscreenEligible)}
        data-drop="SECTION"
        data-section-index={sectionIndex}
        id={id}
        className="container-area relative flex w-full"
      >
        {renderChildren({ structuralOption })}
      </div>
    );
  };
  inlineSortableRenderersRef.current.splitRow = renderStructuralSplitRowItem;

  const columnPathAtPointer = (pointer) => {
    const x = Number(pointer?.x);
    const y = Number(pointer?.y);
    if (
      typeof document === "undefined" ||
      !Number.isFinite(x) ||
      !Number.isFinite(y)
    ) {
      return null;
    }
    const column = findColumnFromStack(x, y) || findColumn(x, y);
    return resolveLayoutColumnPathFromDom(column);
  };

  const pointerFromScopedDragMove = (event) => {
    const startX = Number(dragMetaRef.current?.startX);
    const startY = Number(dragMetaRef.current?.startY);
    const deltaX = Number(event?.delta?.x);
    const deltaY = Number(event?.delta?.y);
    if (
      Number.isFinite(startX) &&
      Number.isFinite(startY) &&
      Number.isFinite(deltaX) &&
      Number.isFinite(deltaY)
    ) {
      return { x: startX + deltaX, y: startY + deltaY };
    }
    return sectionReorderPointerRef.current;
  };

  const scopedColumnCollisionDetection = (args) => {
    const pointer = args?.pointerCoordinates;
    if (pointer) sectionReorderPointerRef.current = pointer;
    const sourceData = args?.active?.data?.current;
    if (sourceData?.type === "ELEMENT" && pointer) {
      const pointedColumn = columnPathAtPointer(pointer);
      if (
        pointedColumn?.conID !== String(sourceData.conID || "") ||
        pointedColumn?.colID !== String(sourceData.colID || "")
      ) {
        // A column context owns only its own element/span subtree.
        // Cross-column targeting is resolved imperatively from the pointer.
        return [];
      }
    }
    return collisionByType(args);
  };

  const beginDragInteraction = () => {
    inlineSortableRenderersRef.current.dragActive = true;
    structuralOptionStoreRef.current.setSuppressed(true);
  };

  const renderScopedColumnDnd = (containerId, columnId, children) => {
    if (!useScopedColumnDnd) return children;
    const ownerLayout = layouts.find(
      (layout) => layout?.container?.id === containerId
    );
    const ownerColumn = ownerLayout?.columns?.find(
      (column) => column?.id === columnId
    );
    const hasScopedDndItems =
      (Array.isArray(ownerColumn?.elements) &&
        ownerColumn.elements.length > 0) ||
      (Array.isArray(ownerColumn?.spans) &&
        ownerColumn.spans.some(
          (span) =>
            (Array.isArray(span?.elements) && span.elements.length > 0) ||
            (Array.isArray(span?.nestedSpans) &&
              span.nestedSpans.some(
                (nested) =>
                  Array.isArray(nested?.elements) && nested.elements.length > 0
              ))
        ));
    if (!hasScopedDndItems) return children;
    const ownerKey = `${containerId}/${columnId}`;
    return (
      <DndContext
        sensors={sensors}
        autoScroll
        measuring={measuring}
        collisionDetection={scopedColumnCollisionDetection}
        onDragStart={(e) => {
          if (builderModeRef.current !== "Layout Mode") return;
          const isElementDrag = e.active?.data?.current?.type === "ELEMENT";
          startDndPerf(e.active, isElementDrag ? "COLUMN" : "CANVAS");
          beginDragInteraction(e.active);
          scopedColumnDragOwnerRef.current = isElementDrag ? ownerKey : "";
          addClass();
          drag(e);
          if (!isElementDrag) setIsDraggingLayout(true);
        }}
        onDragMove={(e) => {
          if (builderModeRef.current !== "Layout Mode") return;
          markContentDndLifecycle("active-move");
          const moveStartedAt = performance.now();
          const perf = dndPerfRef.current;
          if (perf?.active && perf.firstMoveDelayMs == null) {
            perf.firstMoveDelayMs = moveStartedAt - perf.startedAt;
          }
          if (perf?.active) perf.phase = "active-move";

          const sourceData = e.active?.data?.current;
          const pointer = pointerFromScopedDragMove(e);
          const usedEventPointer = pointer !== sectionReorderPointerRef.current;
          if (usedEventPointer) {
            // Collision detection is not guaranteed to run before every move
            // callback once this context returns no cross-column collisions.
            sectionReorderPointerRef.current = pointer;
          }
          const pointerX = Number(pointer?.x);
          const pointerY = Number(pointer?.y);
          const pointedColumn = columnPathAtPointer(pointer);
          const isElementDrag = sourceData?.type === "ELEMENT";
          if (perf?.active && isElementDrag) {
            if (usedEventPointer) perf.scopedEventPointerCount += 1;
            else perf.scopedCollisionPointerFallbackCount += 1;
          }
          const isInsideSourceColumn =
            pointedColumn?.conID === String(sourceData?.conID || "") &&
            pointedColumn?.colID === String(sourceData?.colID || "");

          if (
            isElementDrag &&
            !isInsideSourceColumn &&
            activeItemRef.current &&
            Number.isFinite(pointerX) &&
            Number.isFinite(pointerY)
          ) {
            if (perf?.active) perf.lastAction = "cross-column-intent";
            updateScopedElementIntentFromPoint(
              pointerX,
              pointerY,
              activeItemRef.current
            );
          } else {
            if (perf?.active) {
              perf.lastAction = isElementDrag
                ? "within-column-move"
                : "structure-move";
            }
            clearScopedElementPlaceholder();
            if (isElementDrag && dropTargetRef.current?.type === "ELEMENT") {
              dropTargetRef.current = {
                index: null,
                type: null,
                isLast: false,
              };
            }
            during(e);
          }

          if (perf?.active) {
            const elapsed = performance.now() - moveStartedAt;
            perf.moveCount += 1;
            perf.moveTotalMs += elapsed;
            perf.moveMaxMs = Math.max(perf.moveMaxMs, elapsed);
          }
        }}
        onDragEnd={(e) => {
          if (builderModeRef.current !== "Layout Mode") return;
          markContentDndLifecycle("drop");
          if (dndPerfRef.current?.active) {
            dndPerfRef.current.lastAction = "drop";
          }
          const dropStartedAt = performance.now();
          drop(e);
          if (dndPerfRef.current?.active) {
            dndPerfRef.current.dropCommitMs =
              performance.now() - dropStartedAt;
          }
          markContentDndLifecycle("drop-handler-complete");
          clearGhost();
          scopedColumnDragOwnerRef.current = "";
          inlineSortableRenderersRef.current.dragActive = false;
          setIsDraggingLayout(false);
          removeClass();
          finishDndPerf("drop");
        }}
        onDragCancel={() => {
          clearGhost();
          scopedColumnDragOwnerRef.current = "";
          activeInlineDragGroupRef.current = null;
          inlineSortableRenderersRef.current.dragActive = false;
          setIsDraggingLayout(false);
          removeClass();
          finishDndPerf("cancel");
        }}
      >
        {children}
        {typeof document !== "undefined"
          ? createPortal(
              <DragOverlay
                dropAnimation={null}
                adjustScale={false}
                style={{ pointerEvents: "none" }}
              >
                <ScopedElementDragPreview
                  activeItemRef={activeItemRef}
                  ownerRef={scopedColumnDragOwnerRef}
                  ownerKey={ownerKey}
                  renderPreview={(element) => (
                    <div style={{ opacity: 0.37 }}>
                      <ElementPreview element={element} isDragOverlay />
                    </div>
                  )}
                />
              </DragOverlay>,
              document.body
            )
          : null}
      </DndContext>
    );
  };

  const renderStructuralContainerItem = ({
    id,
    elementData,
    heros,
    children,
    domBridge,
    structuralOption,
  }) => {
    const index = layouts.findIndex((l) => l.container?.id == id);
    const layout = layouts[index];
    const sectionNodeKey = `section:${id}`;
    const offscreenEligible =
      offscreenSectionExperimentEnabled && isOffscreenSectionEligible(layout);
    const bridge = domBridge.current;

    


    if(heros){
      const {
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
        ref={
          offscreenSectionExperimentEnabled && offscreenEligible
            ? (node) =>
                registerOffscreenSectionNode(
                  sectionNodeKey,
                  node,
                  bridge.nodeRef,
                  offscreenEligible
                )
            : bridge.nodeRef
        }
        style={offscreenStyleForSection(sectionNodeKey, offscreenEligible)}
        data-drop="SECTION"
        data-section-index={index}
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
            
             {structuralOption?.hovered && (
              <div data-layout-controls="" className="relative z-20">
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
        structuralOption?.hovered || structuralOption?.pinned;





      return (
        <div
          ref={
            offscreenSectionExperimentEnabled && offscreenEligible
              ? (node) =>
                  registerOffscreenSectionNode(
                    sectionNodeKey,
                    node,
                    bridge.nodeRef,
                    offscreenEligible
                  )
              : bridge.nodeRef
          }
          style={offscreenStyleForSection(sectionNodeKey, offscreenEligible)}
          data-drop="SECTION"
          data-section-index={index}
          id={id}
          className={`container-area ${
            isPreview && !previewAuditMode && index > 0 ? "preview-feed-in" : ""
          }`}
        >
          <Container elementData={elementData} device={device} builderMode={builderMode} setRef={(el) => {
              contained.current[index] = el || null;
            }} borderT={layouts.length > 1 && index !== 0 && !(preview && dropTargetRef.current?.type === "SECTION" && dropTargetRef.current?.index === index) ?"border-t-[0px]" :""} theme={theme}  handleDuring={(e)=>{
              handleDuring(e)
            }} showOption={showOption} funct={{clone,remove}} layouts={layouts} onUpdate={updateContainer} modal={openModal} openOffcavanas={openOffcavanas} changePosition={changePosition}
            >
              {children}
            </Container> 
        </div>
      );
    }

    
  };
  inlineSortableRenderersRef.current.container = renderStructuralContainerItem;

  const sectionColumnRenderMetaCache = new Map();
  const responsiveColumnSize = (size) => {
    if (device === "Desktop") return size;
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
    return size;
  };
  const getSectionColumnRenderMeta = (sectionIndex) => {
    const cached = sectionColumnRenderMetaCache.get(sectionIndex);
    if (cached) return cached;
    const columns = layouts[sectionIndex]?.columns || [];
    const columnRows = [];
    const columnSizes = [];
    let used = 0;
    let row = 0;
    for (const column of columns) {
      const size = responsiveColumnSize(column.size);
      columnSizes.push(size);
      if (used > 0 && used + size > 12) {
        row += 1;
        used = size;
      } else {
        used += size;
      }
      columnRows.push(row);
      if (used >= 12) {
        row += 1;
        used = 0;
      }
    }
    const gridBorders = computeGridBorderStringsFromSizes(columnSizes);
    while (gridBorders.length < columns.length) gridBorders.push("border-0");
    const meta = {
      columns,
      columnRows,
      gridBorders,
      divider: getSectionColumnDividerVisual(layouts, sectionIndex, theme),
    };
    sectionColumnRenderMetaCache.set(sectionIndex, meta);
    return meta;
  };

  const renderStructuralColumnItem = ({
    id,
    containerId,
    elementData,
    children,
    domBridge,
    structuralOption,
  }) => {
    const IDX = layouts.findIndex((l) => l.container.id === containerId);
    const idx = layouts[IDX].columns.findIndex((c) => c.id == id);
    const columnRenderMeta = getSectionColumnRenderMeta(IDX);
    const {
      gridBorder,
      noColumnGap,
      columnDividerBorderStyleClass,
      columnDividerColorStyle,
      verticalDividerColor,
      verticalDividerBorderStyle,
      columnDividerVerticalLengthPct,
    } = columnRenderMeta.divider;
    const bridge = domBridge.current;
    const scopedColumnChildren = renderScopedColumnDnd(
      containerId,
      id,
      children
    );

    const { size } = elementData;



    const cols = columnRenderMeta.columns;
    const colRows = columnRenderMeta.columnRows;
    const colRowIndex = colRows[idx] ?? 0;
    // First col in its row (isColumnRowStart) — used to decide removeLeftBorder
    const isColumnRowStart = idx === 0 || colRows[idx] > colRows[idx - 1];
    // Right neighbor is in the same row AND is a Span → cut right border
    const rightNeighborIsSpan = (() => {
      if (!noColumnGap) return false;
      if (idx + 1 >= cols.length) return false;
      return colRows[idx + 1] === colRows[idx] && Boolean(cols[idx + 1]?.isSpan);
    })();

    const gridBorders = columnRenderMeta.gridBorders;
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
    // Use full column height as the divider reference.
    // If we subtract top/bottom inset first, a 95% setting appears visually shorter.
    const colDividerTopInsetPx = 0;
    const colDividerBottomInsetPx = 0;

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


      const hoverInsideThisColumn = Boolean(
        structuralOption?.descendantHovered
      );
      const isPinnedThisColumn = Boolean(structuralOption?.pinned);
      const showOption =
        (structuralOption?.hovered || isPinnedThisColumn) &&
        (!hoverInsideThisColumn || isPinnedThisColumn);
      const elevateColumnLayer = showOption || hoverInsideThisColumn;

    const cellShellClass = (() => {
      let c = `column-area min-w-0 col-span-${responsiveColumnSize(size)}`;
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
        ref={bridge.nodeRef}
        style={{
          ...columnDividerColorStyle,
          ...(gridBorder && !useCustomEdgeLines
            ? {
                borderStyle: `var(--section-divider-style, ${verticalDividerBorderStyle})`,
              }
            : {}),
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
                  data-section-divider-line=""
                  style={{
                    height: `var(--section-divider-length, ${columnDividerVerticalLengthPct}%)`,
                    width: 0,
                    borderRightWidth: 1,
                    borderRightStyle: `var(--section-divider-style, ${verticalDividerBorderStyle})`,
                    borderRightColor: `var(--section-divider-color, ${verticalDividerColor})`,
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
                  data-section-divider-line=""
                  style={{
                    width: `var(--section-divider-length, ${columnDividerVerticalLengthPct}%)`,
                    height: 0,
                    borderBottomWidth: 1,
                    borderBottomStyle: `var(--section-divider-style, ${verticalDividerBorderStyle})`,
                    borderBottomColor: `var(--section-divider-color, ${verticalDividerColor})`,
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
                openOffcavanas={openOffcavanas}
                changeSize={changeSize}
                changePosition={changePosition}
                isColumnPresetModalPinned={isPinnedThisColumn}
                onColumnPresetModalToggle={(isOpen) => {
                  const pinnedId =
                    structuralOptionStoreRef.current.getState().pinnedColumnId;
                  structuralOptionStoreRef.current.setPinned(
                    "column",
                    isOpen ? id : pinnedId === id ? null : pinnedId
                  );
                }}
                onOpenPresetModal={openColumnPresetModal}
                onOpenPresetLoadModal={openColumnPresetLoadModal}
                noColumnGap={noColumnGap}
                hideIdBadge={droppingIntoThisColumn}
                removeTopBorder={noColumnGap && colRowIndex > 0}
                removeLeftBorder={noColumnGap && !isColumnRowStart}
                removeRightBorder={noColumnGap && rightNeighborIsSpan}
              >
                {scopedColumnChildren}
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
            openOffcavanas={openOffcavanas}
            changeSize={changeSize}
            changePosition={changePosition}
            isColumnPresetModalPinned={isPinnedThisColumn}
            onColumnPresetModalToggle={(isOpen) => {
              const pinnedId =
                structuralOptionStoreRef.current.getState().pinnedColumnId;
              structuralOptionStoreRef.current.setPinned(
                "column",
                isOpen ? id : pinnedId === id ? null : pinnedId
              );
            }}
            onOpenPresetModal={openColumnPresetModal}
            onOpenPresetLoadModal={openColumnPresetLoadModal}
            noColumnGap={noColumnGap}
            hideIdBadge={droppingIntoThisColumn}
            removeTopBorder={noColumnGap && colRowIndex > 0}
            removeLeftBorder={noColumnGap && !isColumnRowStart}
            removeRightBorder={noColumnGap && rightNeighborIsSpan}
          >
            {scopedColumnChildren}
          </Column>
        )}
      </div>
    );
  };
  inlineSortableRenderersRef.current.column = renderStructuralColumnItem;

  const renderStructuralSpanItem = ({
    id,
    containerId,
    columnId,
    elementData,
    children,
    domBridge,
    structuralOption,
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
    const { noColumnGap } = sectionDividerMeta;
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

    const bridge = domBridge.current;

    const eleLength =
      sidx > -1 ? layouts[IDX].columns[idx].spans[sidx].elements.length : 0;
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

          const showOption =
            structuralOption?.hovered || structuralOption?.pinned;
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
            eleLength === 0 &&
            !droppingIntoThisSpan;

    return (
      <div
        ref={bridge.nodeRef}
        style={{
          ...(showOption ? { zIndex: 100 } : {}),
        }}
        className={`w-full min-w-0 ${spanSizeClass}`}
        id={`${containerId}/${columnId}/${id}`}
        data-drop="SPAN"
        onMouseMove={(e) => {
          if (isPreview) return;
          scheduleBTNUpdate(e);
        }}
        onMouseLeave={(e) => {
          const next = e.relatedTarget;
          const stillInsideThisSpan =
            Boolean(next) &&
            typeof next === "object" &&
            typeof next.nodeType === "number" &&
            e.currentTarget.contains(next);
          if (stillInsideThisSpan) return;
          const optionState = structuralOptionStoreRef.current.getState();
          if (
            optionState.hoverTarget?.kind === "span" &&
            optionState.hoverTarget?.id === id
          ) {
            structuralOptionStoreRef.current.publishHover(null);
          }
          if (optionState.pinnedSpanId === id) {
            structuralOptionStoreRef.current.setPinned("span", null);
          }
        }}
      >
        <div
          data-layout-outline=""
          className={`relative w-full min-w-0 ${setHeight()} ${device === "Desktop" ? `border-[1px] border-dashed border-gray-600${removeSpanTopBorder ? " border-t-0" : ""}` : ""}`}
          ref={(el) => setRef(el, 1)}
          onDragOver={(e) => {
            handleDuring(e);
          }}
        >
          {showOption && (
            <div
              data-layout-controls=""
              className="absolute top-0 left-0 z-[1000] pointer-events-none"
            >
              <div className="pointer-events-auto">
                <ServiceLayout
                  layouts={layouts}
                  element={{ spanData: elementData, conID: containerId, colID: columnId }}
                  clone={clone}
                  remove={remove}
                  openOffcavanas={openOffcavanas}
                  ids={ids}
                  onUpdate={updateSpan}
                  modal={openModal}
                  offcavanas="Span"
                  changeSize={changeSize}
                  changePosition={changePosition}
                  isSpanMorePinned={Boolean(structuralOption?.pinned)}
                  onOpenPresetLoadModal={openColumnPresetLoadModal}
                  onSpanMoreToggle={(isOpen) => {
                    const pinnedId =
                      structuralOptionStoreRef.current.getState().pinnedSpanId;
                    structuralOptionStoreRef.current.setPinned(
                      "span",
                      isOpen ? id : pinnedId === id ? null : pinnedId
                    );
                  }}
                />
              </div>
            </div>
          )}
          {showSpanIdBadge ? (
            <div
              data-layout-badge=""
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
          <SpanCanvasFill
            elementData={elementData}
            theme={theme}
            onDragOver={handleDuring}
          >
            {children}
          </SpanCanvasFill>
        </div>
      </div>
    );
  };
  inlineSortableRenderersRef.current.span = renderStructuralSpanItem;

  inlineSortableRenderersRef.current.onStructuralShellRender = (kind) => {
    if (!builderSectionPerfEnabled && !builderHoverPerfEnabled) return;
    const counts = structuralRenderCountsRef.current.shell;
    counts[kind] = (counts[kind] || 0) + 1;
  };
  inlineSortableRenderersRef.current.onStructuralHeavyRender = (kind) => {
    if (!builderSectionPerfEnabled && !builderHoverPerfEnabled) return;
    const counts = structuralRenderCountsRef.current.heavy;
    counts[kind] = (counts[kind] || 0) + 1;
  };
  inlineSortableRenderersRef.current.onStructuralOptionVisible = (
    _kind,
    _id,
    publishedAt
  ) => {
    const perf = hoverPerfRef.current;
    if (!builderHoverPerfEnabled || !perf || !publishedAt) return;
    perf.optionVisibleDelayMaxMs = Math.max(
      perf.optionVisibleDelayMaxMs,
      performance.now() - publishedAt
    );
  };
  inlineSortableRenderersRef.current.onElementSelectionBoundaryRender = () => {
    if (!builderSectionPerfEnabled) return;
    elementSelectionPerfSessionsRef.current.forEach((session) => {
      session.selectedBoundaryRenderCount += 1;
    });
  };
  inlineSortableRenderersRef.current.structuralRenderRevision =
    structuralRenderRevision;

  const preserveElementRevisionForSidebarColumn = Boolean(
    !activeDragRef.current &&
      (
        sidebarNativeDragPerfRef.current ||
        sidebarNativeDropPerfRef.current
      )?.elementType === "column"
  );
  if (
    inlineSortableRenderersRef.current.dragActive &&
    !preserveElementRevisionForSidebarColumn
  ) {
    if (
      !inlineSortableRenderersRef.current.elementRenderRevision ||
      inlineSortableRenderersRef.current.elementRenderRevision ===
        STABLE_ELEMENT_RENDER_REVISION
    ) {
      inlineSortableRenderersRef.current.elementRenderRevision = {};
    }
  } else {
    inlineSortableRenderersRef.current.elementRenderRevision =
      STABLE_ELEMENT_RENDER_REVISION;
  }
  inlineSortableRenderersRef.current.getElementSortableConfig = ({
    containerId,
  }) => {
    const splitTransition =
      layouts.find((l) => l?.container?.id === containerId)?.splitRowId
        ? { duration: 200, easing: "ease" }
        : undefined;
    return {
      // Keep element DnD active in Layout Mode.
      animateLayoutChanges: noLayoutAnimWhileSorting,
      disabled: builderModeRef.current !== "Layout Mode",
      transition: splitTransition,
    };
  };
  inlineSortableRenderersRef.current.onElementSortableDragStart = () => {
    if (selectID.status && selectID.ids?.eleID) {
      setSelectID({ ids: {}, status: "" });
    }
  };
  inlineSortableRenderersRef.current.getElementSortableSnapshot = (
    {
      id,
      containerId,
      columnId,
      elementData,
      spanId = null,
      nestedSpanId = null,
    },
    { attributes, listeners, transform, transition, isDragging }
  ) => {
    const splitTransition =
      layouts.find((l) => l?.container?.id === containerId)?.splitRowId
        ? { duration: 200, easing: "ease" }
        : undefined;
    const splitTransitionCss = splitTransition
      ? `transform ${splitTransition.duration}ms ${splitTransition.easing}`
      : undefined;
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
    const formLayoutColsRaw = Number(elementData?.formLayoutColumns);
    const formLayoutCols =
      formLayoutColsRaw === 2 || formLayoutColsRaw === 3 ? formLayoutColsRaw : 1;
    const inFormRowGroup = FORM_ELEMENT_TYPES.has(type) && formLayoutCols > 1;
    const formRowWidthStyle =
      formLayoutCols === 2
        ? `calc((100% - ${FORM_ROW_GAP_PX}px) / 2)`
        : formLayoutCols === 3
          ? `calc((100% - ${FORM_ROW_GAP_PX * 2}px) / 3)`
          : "100%";
    const inListRowGroup =
      type === "list" &&
      typeof elementData?.listRowGroupId === "string" &&
      elementData.listRowGroupId.trim() !== "";
    const tightSortableWidth =
      ((type === "btn" || type === "btnG") &&
        !btnFullCol &&
        inButtonRowGroup) ||
      (type === "icon" && inIconRowGroup) ||
      (type === "ctn" && inCounterRowGroup) ||
      (type === "list" && inListRowGroup) ||
      inFormRowGroup;

    const IDX = layouts.findIndex((l) => l.container.id === containerId);
    const idx = layouts[IDX].columns.findIndex((c) => c.id === columnId);
    let sidx;
    let msidx;
    if (spanId) {
      sidx = layouts[IDX].columns[idx].spans.findIndex((s) => s.id === spanId);
    }
    if (nestedSpanId) {
      msidx = layouts[IDX].columns[idx].spans[sidx].nestedSpans.findIndex(
        (ms) => ms.id === nestedSpanId
      );
    }
    const eleBucket = nestedSpanId
      ? layouts[IDX].columns[idx].spans[sidx].nestedSpans[msidx].elements
      : spanId
        ? layouts[IDX].columns[idx].spans[sidx].elements
        : layouts[IDX].columns[idx].elements;
    const curIx = eleBucket.findIndex((e) => e.id === id);
    const hasActiveElementDrag =
      Boolean(activeID?.eleID) ||
      (useScopedColumnDnd &&
        activeDragRef.current?.data?.current?.type === "ELEMENT");
    const elementDragLayoutActive =
      isDraggingLayout ||
      (useScopedColumnDnd &&
        inlineSortableRenderersRef.current.dragActive);
    const dragDropIndex = dropTargetRef.current?.index;
    const isElementDropPreview =
      hasActiveElementDrag &&
      elementDragLayoutActive &&
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
    const previewShiftDown =
      samePreviewBucket &&
      !isDragging &&
      Number.isInteger(curIx) &&
      !dropTargetRef.current?.isLast &&
      Number.isInteger(previewInsertAt) &&
      !inlineGroupBounds &&
      curIx >= previewInsertAt;
    const previewShiftPx = previewShiftDown ? 56 : 0;
    const isInlineGroupDrag = false;
    const suppressSortableTransform =
      hasActiveElementDrag &&
      elementDragLayoutActive &&
      Boolean(preview) &&
      !isInlineGroupDrag;
    const hideSourceWhileDragging =
      builderMode === "Layout Mode" &&
      elementDragLayoutActive &&
      isDragging &&
      hasActiveElementDrag;
    const isInlineGroupedDragMember = false;
    const collapseDraggingSlot =
      hideSourceWhileDragging && samePreviewBucket;
    const baseTransform =
      !suppressSortableTransform && transform
        ? CSS.Transform.toString(transform)
        : undefined;
    const previewOffsetY =
      !collapseDraggingSlot && previewShiftPx > 0 ? previewShiftPx : 0;
    const splitPreviewTransform = suppressSortableTransform
      ? `translate3d(0, ${previewOffsetY}px, 0)`
      : undefined;
    const composedTransform = baseTransform ?? splitPreviewTransform;
    const splitPreviewTransition =
      !isDragging && suppressSortableTransform
        ? "transform 200ms ease, opacity 200ms ease"
        : undefined;
    const sortableTransition = suppressDropMotion
      ? undefined
      : isDragging
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
      zIndex:
        isDragging
          ? 1200
          : builderMode === "Layout Mode" && isDraggingLayout && curIx >= 0
            ? curIx + 1
            : undefined,
      width: tightSortableWidth ? "auto" : "100%",
      maxWidth: tightSortableWidth ? "100%" : undefined,
      flexShrink: tightSortableWidth ? 0 : undefined,
      ...(inFormRowGroup
        ? {
            width: formRowWidthStyle,
            maxWidth: formRowWidthStyle,
            flexBasis: formRowWidthStyle,
            flexShrink: 0,
          }
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
        : {
            height: undefined,
            minHeight: undefined,
            margin: undefined,
            padding: undefined,
            border: undefined,
            overflow: undefined,
            pointerEvents: undefined,
            minWidth: undefined,
            flexBasis: inFormRowGroup ? formRowWidthStyle : undefined,
          }),
    };

    return {
      attributes: isLayoutMode ? attributes : {},
      listeners: isLayoutMode ? listeners : {},
      sortableBindings: isLayoutMode ? { ...attributes, ...listeners } : {},
      style,
    };
  };

  const renderSortableElementItem = ({
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
    sortableBridge,
    selected,
    hoverElement,
    setHoverElement,
  }) => {
    const { type } = elementData;
    const inCounterRowGroup =
      type === "ctn" &&
      typeof elementData?.counterRowGroupId === "string" &&
      elementData.counterRowGroupId.trim() !== "";
    const IDX = layouts.findIndex((l) => l.container.id === containerId);
    const idx = layouts[IDX].columns.findIndex((c) => c.id === columnId);
    let sidx,msidx
    if(spanId){
      sidx = layouts[IDX].columns[idx].spans.findIndex((s) => s.id === spanId);
    }if(nestedSpanId){
      msidx = layouts[IDX].columns[idx].spans[sidx].nestedSpans.findIndex((ms) => ms.id === nestedSpanId);
    }
    const eleBucket = nestedSpanId
      ? layouts[IDX].columns[idx].spans[sidx].nestedSpans[msidx].elements
      : spanId
        ? layouts[IDX].columns[idx].spans[sidx].elements
        : layouts[IDX].columns[idx].elements;
    const curIx = eleBucket.findIndex((e) => e.id === id);
    const nextEl = curIx >= 0 ? eleBucket[curIx + 1] : undefined;

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
    const {
      style = {},
      sortableBindings = {},
    } = sortableBridge?.current?.snapshot || {};
    const setNodeRef = sortableBridge?.current?.nodeRef;



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
        if(builderModeRef.current !== "Editor Mode"){
          e.preventDefault();
        }else{
          return;
        }
        const currentSelection = selectIDRef.current;
        const isCurrentSelection =
          status === "Delete"
            ? selected
            : currentSelection?.ids?.eleID === id &&
              currentSelection?.status === status;
        if (isCurrentSelection) {
          setSelectID(
            { ids: {}, status: "" },
            { elementSelectionCache: status === "Delete" }
          );
          if(status === "Edit"){
            setPositionElementSetting({x:null,y:null})
          }
          return;
        }
        setSelectID(
          {
            ids:{...ids,eleID:id},
            status
          },
          { elementSelectionCache: status === "Delete" }
        );
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
          if (inlineSortableRenderersRef.current.dragActive) return;
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
          if (builderModeRef.current !== "Editor Mode") return;
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
          if (builderModeRef.current === "Editor Mode" && (type === "tbl" || type === "btw")) return;
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
              type === "post" ||
              FORM_ELEMENT_TYPES.has(type)) &&
            e.detail === 2
          )
            return;
          click(e, "Delete");
        }}
        onDoubleClickCapture={(e) => {
          if (
            builderModeRef.current === "Layout Mode" &&
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
          if (builderModeRef.current === "Editor Mode" && !isNativeEditableTarget) {
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

            if (builderModeRef.current === "Layout Mode") {
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
            if (builderModeRef.current === "Editor Mode") {
              const found = getNestedEl();
              if (found?.el) {
                const nt = found.el.type;
                const needsOuterHandler =
                  nt === "text" || nt === "heading" || nt === "img" || nt === "bnr" ||
                  nt === "lbx" || nt === "vid" || nt === "btn" || nt === "btnG" || nt === "icon" || nt === "acc" || nt === "post" || nt === "imgh" || nt === "imgo" || nt === "tbl" || nt === "btw" || nt === "divider" ||
                  nt === "ctn" || nt === "list" || nt === "crl" || nt === "lstb" || FORM_ELEMENT_TYPES.has(nt);
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
          if (builderModeRef.current === "Layout Mode" && type === "list") {
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
          if (builderModeRef.current === "Layout Mode" && type === "crl") {
            e.preventDefault();
            e.stopPropagation();
            setSelectID({ ids: {}, status: "" });
            setPositionElementSetting({ x: null, y: null });
            openOffcavanas("Carousel", elementData, (next) =>
              patchLayoutElement(next, { eleID: elementData.id })
            );
            return;
          }
          if (builderModeRef.current === "Layout Mode" && type === "dts") {
            e.preventDefault();
            e.stopPropagation();
            setSelectID({ ids: {}, status: "" });
            setPositionElementSetting({ x: null, y: null });
            openOffcavanas("Data Slider", elementData, (next) =>
              patchLayoutElement(next, { eleID: elementData.id })
            );
            return;
          }
          if (builderModeRef.current === "Layout Mode" && type === "ctg") {
            e.preventDefault();
            e.stopPropagation();
            setSelectID({ ids: {}, status: "" });
            setPositionElementSetting({ x: null, y: null });
            openOffcavanas("Catagories", elementData, (next) =>
              patchLayoutElement(next, { eleID: elementData.id })
            );
            return;
          }
          if (builderModeRef.current === "Layout Mode" && type === "lstb") {
            e.preventDefault();
            e.stopPropagation();
            setSelectID({ ids: {}, status: "" });
            setPositionElementSetting({ x: null, y: null });
            openOffcavanas("List Box", elementData, (next) =>
              patchLayoutElement(next, { eleID: elementData.id })
            );
            return;
          }
          if (builderModeRef.current === "Layout Mode" && type === "tbl") {
            e.preventDefault();
            e.stopPropagation();
            setSelectID({ ids: {}, status: "" });
            setPositionElementSetting({ x: null, y: null });
            openOffcavanas("Table", elementData, (next) =>
              patchLayoutElement(next, { eleID: elementData.id })
            );
            return;
          }
          if (builderModeRef.current === "Layout Mode" && type === "btw") {
            e.preventDefault();
            e.stopPropagation();
            setSelectID({ ids: {}, status: "" });
            setPositionElementSetting({ x: null, y: null });
            openOffcavanas("Between", elementData, (next) =>
              patchLayoutElement(next, { eleID: elementData.id })
            );
            return;
          }
          if (builderModeRef.current === "Layout Mode" && type === "acc") {
            e.preventDefault();
            e.stopPropagation();
            setSelectID({ ids: {}, status: "" });
            setPositionElementSetting({ x: null, y: null });
            openOffcavanas("Accordion", elementData, (next) =>
              patchLayoutElement(next, { eleID: elementData.id })
            );
            return;
          }
          if (builderModeRef.current === "Layout Mode" && type === "post") {
            e.preventDefault();
            e.stopPropagation();
            setSelectID({ ids: {}, status: "" });
            setPositionElementSetting({ x: null, y: null });
            openOffcavanas("Post", elementData, (next) =>
              patchLayoutElement(next, { eleID: elementData.id })
            );
            return;
          }
          if (builderModeRef.current === "Layout Mode" && type === "imgh") {
            e.preventDefault();
            e.stopPropagation();
            setSelectID({ ids: {}, status: "" });
            setPositionElementSetting({ x: null, y: null });
            openOffcavanas("Image Hover", elementData, (next) =>
              patchLayoutElement(next, { eleID: elementData.id })
            );
            return;
          }
          if (builderModeRef.current === "Layout Mode" && type === "imgo") {
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
          if (builderModeRef.current === "Layout Mode" && type === "divider") {
            e.preventDefault();
            e.stopPropagation();
            setSelectID({ ids: {}, status: "" });
            setPositionElementSetting({ x: null, y: null });
            openOffcavanas("Divider", elementData, (next) =>
              patchLayoutElement(next, { eleID: elementData.id })
            );
            return;
          }
          if (builderModeRef.current === "Layout Mode" && type === "form") {
            e.preventDefault();
            e.stopPropagation();
            setSelectID({ ids: {}, status: "" });
            setPositionElementSetting({ x: null, y: null });
            openOffcavanas("FormBlock", elementData, (next) =>
              patchLayoutElement(next, { eleID: elementData.id })
            );
            return;
          }
          if (builderModeRef.current === "Layout Mode" && FORM_ELEMENT_TYPES.has(type)) {
            e.preventDefault();
            e.stopPropagation();
            setSelectID({ ids: {}, status: "" });
            setPositionElementSetting({ x: null, y: null });
            openOffcavanas("Form", elementData, (next) =>
              patchLayoutElement(next, { eleID: elementData.id })
            );
            return;
          }
          if (builderModeRef.current !== "Editor Mode") return;
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
                  type: elementData.type === "btnG" ? "btnG" : "btn",
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
          if (type === "text" || type === "frmText") {
            e.preventDefault();
            e.stopPropagation();
            setSelectID({ ids: {}, status: "" });
            setPositionElementSetting({ x: null, y: null });
            if (
              type === "text" &&
              new URLSearchParams(window.location.search).get("textPerf") ===
              "1"
            ) {
              window.__textEditorOpenPerf = {
                target: String(elementData?.id || ""),
                startedAt: performance.now(),
              };
              window.__textEditorRenderPerf = {
                commits: 0,
                totalMs: 0,
                maxMs: 0,
                maxCommitLatencyMs: 0,
              };
            }
            const openTransactionId = isBuilderPerformanceEnabled()
              ? beginBuilderPerformanceTransaction(
                  "text-editor-open",
                  {
                    label: "เปิด Modal แก้ไขข้อความ",
                    elementType: type,
                    elementId: String(elementData?.id || ""),
                  },
                  { trackFrames: true, skipInitialFrameGap: true }
                )
              : null;
            if (openTransactionId != null) {
              pendingCanvasPerformanceTransactionsRef.current.add(
                openTransactionId
              );
            }
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
          if (type === "form") {
            e.preventDefault();
            e.stopPropagation();
            setSelectID({ ids: {}, status: "" });
            setPositionElementSetting({ x: null, y: null });
            openOffcavanas("FormBlock", elementData, (next) =>
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
            if (builderModeRef.current === "Editor Mode") {
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
            if (builderModeRef.current !== "Editor Mode") return;
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
            if (builderModeRef.current !== "Editor Mode") return;
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
              const currentSelection = selectIDRef.current;
              if (
                currentSelection?.ids?.tabsHostId === elementData.id &&
                currentSelection?.status === "Delete"
              ) {
                setSelectID(
                  { ids: {}, status: "" },
                  { elementSelectionCache: true }
                );
              } else if (
                currentSelection?.ids?.eleID === elementData.id &&
                currentSelection?.status === "Delete"
              ) {
                setSelectID(
                  { ids: {}, status: "" },
                  { elementSelectionCache: true }
                );
              } else {
                setSelectID(
                  {
                    ids: { ...ids, eleID: elementData.id },
                    status: "Delete",
                  },
                  { elementSelectionCache: true }
                );
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
              const nestedSelection = {
                ids: {
                  ...ids,
                  eleID: tabEl.id,
                  tabsHostId: elementData.id,
                  tabId,
                },
                status: "Delete",
              };
              const nestedKey = elementSelectionKey(nestedSelection.ids);
              setSelectID(
                elementSelectionStoreRef.current.getSelectedKey() === nestedKey
                  ? { ids: {}, status: "" }
                  : nestedSelection,
                { elementSelectionCache: true }
              );
            }
          }}
          tabSelectedElId={null}
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
  inlineSortableRenderersRef.current.element = renderSortableElementItem;

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
    const sourceLayout = layouts[containerIndex];
    const sourceColumn = sourceLayout?.columns?.[columnIndex];
    const sourceSpans = sourceColumn?.spans;
    if (!sourceLayout || !sourceColumn || !sourceSpans?.length) return;
    const spans = [...sourceSpans];
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
    const columns = [...sourceLayout.columns];
    columns[columnIndex] = { ...sourceColumn, spans };
    const newLayouts = [...layouts];
    newLayouts[containerIndex] = { ...sourceLayout, columns };
    setLayout(newLayouts);
  };


  const change_container_position = (oldIndex, newIndex) => {
    // Reorder เปลี่ยนเฉพาะ array ชั้นบน ไม่ต้อง clone Section/Element ทั้งหน้า
    const newLayouts = [...layouts];
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

  const cloneElementBucketsForMove = (sourcePath, targetPath) => {
    const nextLayouts = layouts.slice();
    const sectionCopies = new Map();
    const columnCopies = new Map();
    const spanCopies = new Map();
    const nestedSpanCopies = new Map();
    const bucketCopies = new Map();

    const cloneBucket = ({ conI, colI, spnI = null, nestI = null }) => {
      const bucketKey = `${conI}:${colI}:${spnI ?? "-"}:${nestI ?? "-"}`;
      if (bucketCopies.has(bucketKey)) return bucketCopies.get(bucketKey);

      let section = sectionCopies.get(conI);
      if (!section) {
        const sourceSection = layouts[conI];
        if (!sourceSection || !Array.isArray(sourceSection.columns)) return null;
        section = {
          ...sourceSection,
          columns: sourceSection.columns.slice(),
        };
        sectionCopies.set(conI, section);
        nextLayouts[conI] = section;
      }

      const columnKey = `${conI}:${colI}`;
      let column = columnCopies.get(columnKey);
      if (!column) {
        const sourceColumn = section.columns[colI];
        if (!sourceColumn) return null;
        column = { ...sourceColumn };
        if (Array.isArray(sourceColumn.spans)) {
          column.spans = sourceColumn.spans.slice();
        }
        section.columns[colI] = column;
        columnCopies.set(columnKey, column);
      }

      let owner = column;
      if (Number.isInteger(spnI)) {
        const spanKey = `${conI}:${colI}:${spnI}`;
        let span = spanCopies.get(spanKey);
        if (!span) {
          const sourceSpan = column.spans?.[spnI];
          if (!sourceSpan) return null;
          span = { ...sourceSpan };
          if (Array.isArray(sourceSpan.nestedSpans)) {
            span.nestedSpans = sourceSpan.nestedSpans.slice();
          }
          column.spans[spnI] = span;
          spanCopies.set(spanKey, span);
        }
        owner = span;

        if (Number.isInteger(nestI)) {
          const nestedKey = `${spanKey}:${nestI}`;
          let nestedSpan = nestedSpanCopies.get(nestedKey);
          if (!nestedSpan) {
            const sourceNestedSpan = span.nestedSpans?.[nestI];
            if (!sourceNestedSpan) return null;
            nestedSpan = { ...sourceNestedSpan };
            span.nestedSpans[nestI] = nestedSpan;
            nestedSpanCopies.set(nestedKey, nestedSpan);
          }
          owner = nestedSpan;
        }
      }

      if (!Array.isArray(owner.elements)) return null;
      owner.elements = owner.elements.slice();
      bucketCopies.set(bucketKey, owner.elements);
      return owner.elements;
    };

    const oldElements = cloneBucket(sourcePath);
    const newElements = cloneBucket(targetPath);
    return { nextLayouts, oldElements, newElements };
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
    const {
      nextLayouts: newLayouts,
      oldElements,
      newElements,
    } = cloneElementBucketsForMove(
      {
        conI: containerIndex,
        colI: columnIndex,
        spnI: oldSpanIndex,
        nestI: oldMiniSpanIndex,
      },
      {
        conI: containerIndex,
        colI: columnIndex,
        spnI: newSpanIndex,
        nestI: newMiniSpanIndex,
      }
    );
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
    const {
      nextLayouts: newLayouts,
      oldElements,
      newElements,
    } = cloneElementBucketsForMove(
      {
        conI: containerIndex,
        colI: oldColumnIndex,
        spnI: oldSpanIndex,
        nestI: oldMiniSpanIndex,
      },
      {
        conI: containerIndex,
        colI: newColumnIndex,
        spnI: newSpanIndex,
        nestI: newMiniSpanIndex,
      }
    );

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
    const {
      nextLayouts: newLayouts,
      oldElements,
      newElements,
    } = cloneElementBucketsForMove(
      {
        conI: oldContainerIndex,
        colI: oldColumnIndex,
        spnI: oldSpanIndex,
        nestI: oldMiniSpanIndex,
      },
      {
        conI: newContainerIndex,
        colI: newColumnIndex,
        spnI: newSpanIndex,
        nestI: newMiniSpanIndex,
      }
    );

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
    const opacityByte = (value, fallback = 255) => {
      const n = Number(value);
      return Number.isFinite(n) ? Math.max(0, Math.min(255, n)) : fallback;
    };
    const fillIsOpaque = isGradient
      ? opacityByte(opacityColorGradient?.[0]) >= 255 &&
        opacityByte(opacityColorGradient?.[1]) >= 255
      : opacityByte(opacityColor) >= 255;
    const useBorderRing = bw > 0 && fillIsOpaque;

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

  const SpanPreview = ({ elementData, children }) => {
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

  const ContainerPreview = ({ element, children, innerStyle }) => {
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
        className="preview pointer-events-none border border-dashed border-gray-600 relative"
        aria-hidden
        style={{ background: color }}
        onDragOver={(e) => {
          handleDuring(e);
        }}
      >
        <BgImage />
        <div
          className={`${fluid} mx-auto relative z-10`}
          style={{
            paddingTop: paddingTop,
            paddingBottom: paddingBottom,
            ...(innerStyle || {}),
          }}
        >
          <div
            className={`grid grid-cols-12 py-5 ${preview?.container?.noColumnGap ? "gap-0" : "gap-[22px]"}`}
          >
            {children}
          </div>
        </div>
      </div>
    );
  };

  const ElementPreview = ({
    element,
    isDragOverlay = false,
    isSidebarPortalPreview = false,
  }) => {
    const layoutPreviewPe = isLayoutMode ? " pointer-events-none" : "";
    const isCanvasElementDrag =
      activeDragRef.current?.data?.current?.type === "ELEMENT";
    const isElementGhostPlaceholder =
      isCanvasElementDrag &&
      !isDragOverlay &&
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

    const isFormElementType = FORM_ELEMENT_TYPES.has(String(element?.type || ""));
    // ลาก Form Element จาก panel เข้า Col → Ghost แบบการ์ดไอคอนเดิม
    // ไม่ใช้ FormElement เต็มแบบหน้าออกแบบฟอร์ม
    const isFormPaletteGhost =
      isFormElementType &&
      (preview || isSidebarPortalPreview) &&
      String(element?.id || "") !== "" &&
      (isSidebarPortalPreview ||
        String(element?.id || "") === String(preview?.id || "")) &&
      !isCanvasElementDrag;
    if (isFormPaletteGhost) {
      const {
        icon,
        label,
        lucideIcon,
        lucideStrokeWidth,
        lucideSize,
      } = element?.preview || {};
      const previewIconSize = Number(lucideSize);
      const previewStrokeWidth = Number(lucideStrokeWidth);
      return (
        <div className="bg-gray-50 dark:bg-black/50 w-[95.5px] h-[70px] rounded-md text-center px-3 py-2">
          {lucideIcon ? (
            <span className="inline-flex h-[30px] w-full items-center justify-center px-2 text-slate-600 dark:text-white/50 [&>svg]:shrink-0">
              <IconLucide
                iconName={lucideIcon}
                size={Number.isFinite(previewIconSize) ? previewIconSize : 30}
                strokeWidth={
                  Number.isFinite(previewStrokeWidth) ? previewStrokeWidth : 1.75
                }
              />
            </span>
          ) : (
            <span className="material-symbols-outlined text-[30px] px-2 dark:text-white/50">
              {icon}
            </span>
          )}
          <p className="text-[12px] dark:text-white/40 antialiased">
            {label}
          </p>
        </div>
      );
    }

    const imagePreviewLike =
      element.type === "img" ||
      element.type === "imgh" ||
      element.type === "imgo" ||
      element.type === "bnr" ||
      element.type === "lbx" ||
      element.type === "vid";
    const isFormElementPreview = isFormElementType;
    const rawFormCols = Number(element?.formLayoutColumns);
    const formCols = rawFormCols === 2 || rawFormCols === 3 ? rawFormCols : 1;
    const formWidthPct = formCols === 2 ? 50 : formCols === 3 ? 33.333333 : 100;
    const previewWrapperStyle = isFormElementPreview
      ? {
          width: `${formWidthPct}%`,
          maxWidth: `${formWidthPct}%`,
          textAlign: "left",
          display: formCols === 1 ? "block" : "inline-block",
          verticalAlign: "top",
        }
      : { width: "100%", textAlign: "center" };
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
        style={previewWrapperStyle}
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
        {(element.type === "frmInput" ||
          element.type === "frmText" ||
          element.type === "frmNum" ||
          element.type === "frmSum" ||
          element.type === "frmTextarea" ||
          element.type === "frmSelect" ||
          element.type === "frmRadio" ||
          element.type === "frmCheckbox" ||
          element.type === "frmSubmit") && (
          <FormElementPreview
            elementData={element}
            theme={theme}
            builderMode={builderMode}
          />
        )}
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
        {element.type === "form" && (
          <FormBlock
            elementData={element}
            selected={false}
            hover={() => {}}
            theme={theme}
            builderMode={builderMode}
            lite
          />
        )}
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
    const nativeSidebarPreview = sidebarPortalPreviewRef.current;
    const tabPreview = nativeSidebarPreview || preview;
    if (!ele || (ele.type !== "tabs" && ele.type !== "acc" && ele.type !== "post" && ele.type !== "dts" && ele.type !== "ctg") || !tabPreview) return null;
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
      ghostEl: nativeSidebarPreview ? null : (
        <div
          ref={ghostRef}
          className={`w-full ${isCanvasElementMove ? "mb-0 opacity-100" : "mb-2 opacity-70"} ${ghostInsertAnimClass}`}
          id={String(tabPreview.id || "")}
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
            <ElementPreview element={tabPreview} />
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

  const drag = ({ active,activatorEvent }) => {
    if(builderModeRef.current !== "Layout Mode") return;
    layoutDragTargetRef.current = { containerId: "", id: "" };
    structureDropIntentRef.current = null;
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
      activeItemRef.current = element;
      if (!useScopedColumnDnd) {
        setActiveItem(element);
        setActiveID({
          conID: current.conID,
          colID: current.colID,
          eleID: id,
          spnID: current.spnID ? current.spnID : null,
        });
      }
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
      } catch {
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
    if(builderModeRef.current !== "Layout Mode") return;
    if (!over || !active) return;
    if (!active || !active.data?.current) return;
    if (active.id === over.id) return;
    layoutDragTargetRef.current = {
      containerId: String(over.data?.current?.conID || ""),
      id: String(over.id || ""),
    };

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
      const activeData = active.data.current;
      const overData = over.data.current;
      const isSameBucket =
        activeData.conID === overData.conID &&
        activeData.colID === overData.colID &&
        (activeData.spnID ?? null) === (overData.spnID ?? null) &&
        (activeData.nestID ?? null) === (overData.nestID ?? null);
      if (isSameBucket) {
        // dnd-kit จัดการ transform และ drop() commit อยู่แล้ว
        return;
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
      structureDropIntentRef.current = {
        type: "SPAN",
        oldIndex,
        newIndex,
        containerIndex: IDX,
        columnIndex: colIdx,
      };
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
      structureDropIntentRef.current = {
        type: "SECTION",
        oldIndex,
        newIndex,
      };
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
            ) &&
            !shouldBlockDataSliderDrop(
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
      const { top: t, height: h, left: l, width:w } = rectDragRef;
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
            span1.getBoundingClientRect()
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
            const {top:t1,bottom:b1} = nestedSpan1.getBoundingClientRect()
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
    
    if(builderModeRef.current !== "Layout Mode") return;
    resetDropElementGeometryCache();
    layoutDragTargetRef.current = { containerId: "", id: "" };
    sidebarPreviewIntentRef.current = { key: "", startedAt: 0, x: 0, y: 0 };
    dragMetaRef.current.dx = null;
    dragMetaRef.current.dy = null;
    lastEleMoveKeyRef.current = null;
    activeInlineDragGroupRef.current = null;
    setActiveID(null);
    positionRef.current = null;
    setActiveItem(null);
    setIsDraggingLayout(false);
    if (!active || !active.data?.current) return;
    const structureIntent = structureDropIntentRef.current;
    structureDropIntentRef.current = null;
    if (
      active.data.current.type === "SECTION" &&
      structureIntent?.type === "SECTION"
    ) {
      change_container_position(
        structureIntent.oldIndex,
        structureIntent.newIndex
      );
      activeDragRef.current = null;
      return;
    }
    if (
      active.data.current.type === "SPAN" &&
      structureIntent?.type === "SPAN"
    ) {
      change_span_order(
        structureIntent.oldIndex,
        structureIntent.newIndex,
        structureIntent.containerIndex,
        structureIntent.columnIndex
      );
      activeDragRef.current = null;
      return;
    }
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
      const rect = getCachedDropElementRect(overNode);
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
      const sourcePath = {
        conI: srcConI,
        colI: srcColI,
        spnI: srcSpnI,
        nestI: srcMspnI,
      };
      const {
        nextLayouts,
        oldElements: nextBucket,
      } = cloneElementBucketsForMove(sourcePath, sourcePath);
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
      let nextLayouts;
      let srcLoc = findLayoutElementListIndex(layouts, String(active.id || ""));
      if (!srcLoc || !Array.isArray(srcLoc.list) || !Number.isInteger(srcLoc.ix)) return false;
      let srcList;
      let dstList;
      const directSourceBucket = getBucketByDropIndex(
        layouts,
        srcLoc.conI,
        srcLoc.colI,
        srcLoc.spnI ?? null,
        srcLoc.nestI ?? null
      );
      if (directSourceBucket?.elements === srcLoc.list) {
        const cloned = cloneElementBucketsForMove(
          {
            conI: srcLoc.conI,
            colI: srcLoc.colI,
            spnI: srcLoc.spnI ?? null,
            nestI: srcLoc.nestI ?? null,
          },
          {
            conI: cur.index.conI,
            colI: cur.index.colI,
            spnI: cur.index?.spnI ?? null,
            nestI: cur.index?.nestI ?? null,
          }
        );
        nextLayouts = cloned.nextLayouts;
        srcList = cloned.oldElements;
        dstList = cloned.newElements;
      } else {
        // Nested Tab/Accordion/Post items need their host path cloned as well.
        nextLayouts = lodash.cloneDeep(layouts);
        srcLoc = findLayoutElementListIndex(nextLayouts, String(active.id || ""));
        const dstBucket = getBucketByDropIndex(
          nextLayouts,
          cur.index.conI,
          cur.index.colI,
          cur.index?.spnI ?? null,
          cur.index?.nestI ?? null
        );
        srcList = srcLoc?.list;
        dstList = dstBucket?.elements;
      }
      if (!Array.isArray(srcList)) return false;
      if (!Array.isArray(dstList)) return false;
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
      pickFinalBoundaryForCommit({
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

  function collisionByTypeRaw(args) {
    const { active, droppableContainers, pointerCoordinates, droppableRects } =
      args;
    const { type } = active.data.current;

    if (pointerCoordinates) {
      sectionReorderPointerRef.current = pointerCoordinates;
    }

    const collisionCache = collisionContainerCacheRef.current;
    if (collisionCache.byType.size === 0) {
      const allContainers = droppableContainers.filter(() => true);
      for (const dc of allContainers) {
        const data = dc.data.current;
        const containerType = data.type;
        if (!collisionCache.byType.has(containerType)) {
          collisionCache.byType.set(containerType, []);
        }
        collisionCache.byType.get(containerType).push(dc);
        collisionCache.byId.set(String(dc.id), dc);
        if (containerType === "ELEMENT") {
          const bucketKey = [
            data.conID,
            data.colID,
            data.spnID ?? "",
            data.nestID ?? "",
          ].join(":");
          if (!collisionCache.elementBuckets.has(bucketKey)) {
            collisionCache.elementBuckets.set(bucketKey, []);
          }
          collisionCache.elementBuckets.get(bucketKey).push(dc);
        }
      }
    }
    let filtered = collisionCache.byType.get(type) || [];

    if (type === "ELEMENT" && pointerCoordinates && filtered.length > 1) {
      const pointerNode = document.elementFromPoint(
        pointerCoordinates.x,
        pointerCoordinates.y
      );
      const hitElementNode = pointerNode?.closest?.('[data-drop="ELEMENT"]');
      const hitElementId = String(
        hitElementNode?.getAttribute?.("id") || ""
      )
        .split("/")
        .pop();
      const hitContainer = hitElementId
        ? collisionCache.byId.get(hitElementId)
        : null;
      const hitData = hitContainer?.data?.current;
      if (hitData) {
        const bucketKey = [
          hitData.conID,
          hitData.colID,
          hitData.spnID ?? "",
          hitData.nestID ?? "",
        ].join(":");
        const sameBucket =
          collisionCache.elementBuckets.get(bucketKey) || [];
        if (sameBucket.length > 0) filtered = sameBucket;
      }
    }

    collisionCache.lastFilteredCount = filtered.length;
    collisionCache.lastUsedBucket =
      type === "ELEMENT" &&
      filtered.length <
        (collisionCache.byType.get("ELEMENT") || []).length;
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

  function collisionByType(args) {
    const startedAt = performance.now();
    const result = collisionByTypeRaw(args);
    const perf = dndPerfRef.current;
    if (perf?.active) {
      const elapsed = performance.now() - startedAt;
      const candidates =
        collisionContainerCacheRef.current.lastFilteredCount || 0;
      perf.collisionCount += 1;
      perf.collisionTotalMs += elapsed;
      perf.collisionMaxMs = Math.max(perf.collisionMaxMs, elapsed);
      perf.collisionCandidatesTotal += candidates;
      perf.collisionCandidatesMax = Math.max(
        perf.collisionCandidatesMax,
        candidates
      );
      if (collisionContainerCacheRef.current.lastUsedBucket) {
        perf.bucketCollisionCount += 1;
      } else {
        perf.fallbackCollisionCount += 1;
      }
    }
    return result;
  }

  const addClass = () => {
    document.documentElement.classList.add("dragging");
    setOffscreenSectionDndBypass(true);
  };
  const removeClass = () => {
    document.documentElement.classList.remove("dragging");
    setOffscreenSectionDndBypass(false);
  };

  const sizes = { Tablet: 768, Mobile: 375, Desktop: "100%" };
  const canvasSize = { width: sizes[device] };
  const mobileSkeletonSvg = `
<svg xmlns='http://www.w3.org/2000/svg' width='375' height='1320' viewBox='0 0 375 1320'>
  <rect width='375' height='1320' fill='#f5f5f6'/>

  <rect x='16' y='16' width='170' height='30' rx='15' fill='#d6d6d9'/>
  <rect x='196' y='16' width='80' height='30' rx='15' fill='#d8d8db'/>
  <rect x='286' y='16' width='73' height='30' rx='15' fill='#d6d6d9'/>

  <rect x='16' y='62' width='343' height='210' rx='5' fill='#d2d2d6'/>
  <rect x='16' y='288' width='220' height='16' rx='5' fill='#d5d5d8'/>
  <rect x='16' y='316' width='120' height='16' rx='5' fill='#d7d7da'/>
  <rect x='16' y='352' width='250' height='16' rx='5' fill='#d4d4d8'/>
  <rect x='274' y='352' width='85' height='16' rx='5' fill='#d6d6d9'/>
  <rect x='0' y='400' width='375' height='2' fill='#c9c9cd'/>

  <rect x='16' y='430' width='160' height='16' rx='5' fill='#d5d5d8'/>
  <rect x='186' y='430' width='90' height='16' rx='5' fill='#d7d7da'/>
  <rect x='286' y='430' width='73' height='16' rx='5' fill='#d5d5d8'/>
  <rect x='16' y='460' width='343' height='170' rx='5' fill='#d3d3d7'/>
  <rect x='16' y='646' width='120' height='16' rx='5' fill='#d5d5d8'/>
  <rect x='16' y='674' width='200' height='16' rx='5' fill='#d7d7da'/>
  <rect x='224' y='674' width='135' height='16' rx='5' fill='#d6d6d9'/>
  <rect x='0' y='714' width='375' height='2' fill='#c9c9cd'/>

  <rect x='16' y='744' width='343' height='120' rx='5' fill='#d2d2d6'/>
  <rect x='16' y='880' width='180' height='14' rx='5' fill='#d6d6d9'/>
  <rect x='16' y='906' width='95' height='14' rx='5' fill='#d8d8db'/>
  <rect x='16' y='932' width='250' height='14' rx='5' fill='#d6d6d9'/>
  <rect x='16' y='958' width='145' height='14' rx='5' fill='#d8d8db'/>
  <rect x='0' y='988' width='375' height='2' fill='#c9c9cd'/>

  <rect x='16' y='1020' width='105' height='16' rx='5' fill='#d5d5d8'/>
  <rect x='131' y='1020' width='120' height='16' rx='5' fill='#d7d7da'/>
  <rect x='261' y='1020' width='98' height='16' rx='5' fill='#d5d5d8'/>
  <rect x='16' y='1052' width='343' height='220' rx='5' fill='#d2d2d6'/>
</svg>
`.trim();
  const mobileSkeletonStyle = device === "Mobile"
    ? {
        backgroundColor: "#f5f5f6",
        backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(mobileSkeletonSvg)}")`,
        backgroundSize: "375px 1320px",
        backgroundPosition: "0 0",
        backgroundRepeat: "repeat-y",
      }
    : {};


  

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
        onDrop={
          isPreviewCleanMode
            ? undefined
            : (e) => {
                handleDrop(e);
              }
        }
        onDragOver={
          isPreviewCleanMode
            ? undefined
            : (e) => {
                handleDuring(e);
              }
        }
        onDragEnterCapture={
          isPreviewCleanMode
            ? undefined
            : (e) => {
                e.preventDefault();

                if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
              }
        }
        onDragOverCapture={
          isPreviewCleanMode
            ? undefined
            : (e) => {
                e.preventDefault();

                if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
              }
        }
        onMouseMove={
          isPreviewCleanMode
            ? undefined
            : (e) => {
                scheduleBTNUpdate(e);
              }
        }
        onClickCapture={(e) => {
          if (builderModeRef.current !== "Layout Mode") return;
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
        onDragLeave={
          isPreviewCleanMode
            ? undefined
            : (e) => {
                e.preventDefault();
                const stillInsideCanvas = checkGhostPosition(
                  e.clientX,
                  e.clientY,
                  e.currentTarget.getBoundingClientRect()
                );
                if (stillInsideCanvas) return;
                setDrop(null, null);
                setPreview(null);
              }
        }
      >
        {/* Canvas สำหรับวาง element */}
        <React.Profiler id="BuilderCanvas" onRender={recordCanvasProfiler}>
        <InlineSortableRenderContext.Provider value={inlineSortableRenderersRef}>
        <ElementSelectionStoreContext.Provider value={elementSelectionStoreRef.current}>
        <StructuralOptionStoreContext.Provider value={structuralOptionStoreRef.current}>
        <StructuralRenderRevisionContext.Provider value={structuralRenderRevision}>
        <MaybeDndContext
        enabled={!isPreviewCleanMode}
        onDragStart={(e) => {
          if (builderModeRef.current !== "Layout Mode") return;
          startDndPerf(e.active);
          beginDragInteraction(e.active);
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
          if (builderModeRef.current !== "Layout Mode") return;
          markContentDndLifecycle("active-move");
          const moveStartedAt = performance.now();
          const perf = dndPerfRef.current;
          if (perf?.active && perf.firstMoveDelayMs == null) {
            perf.firstMoveDelayMs = moveStartedAt - perf.startedAt;
          }
          if (perf?.active) {
            perf.phase = "active-move";
            perf.lastAction = "active-move";
          }
          during(e);
          if (perf?.active) {
            const elapsed = performance.now() - moveStartedAt;
            perf.moveCount += 1;
            perf.moveTotalMs += elapsed;
            perf.moveMaxMs = Math.max(perf.moveMaxMs, elapsed);
          }
        }}
        onDragEnd={(e) => {
          if (builderModeRef.current !== "Layout Mode") return;
          markContentDndLifecycle("drop");
          drop(e);
          markContentDndLifecycle("drop-handler-complete");
          clearGhost();
          setIsDraggingLayout(false);
          removeClass();
          finishDndPerf("drop");
        }}
        onDragCancel={() => {
          clearGhost();
          sidebarPreviewIntentRef.current = { key: "", startedAt: 0, x: 0, y: 0 };
          activeInlineDragGroupRef.current = null;
          setOffscreenSectionDndBypass(false);
          finishDndPerf("cancel");
        }}
        sensors={sensors}
        autoScroll
        measuring={measuring}
        collisionDetection={collisionByType}
      >
        <div className={`w-full flex ${isPreview ? "justify-start" : "justify-center"}`}>

        <div
          data-builder-canvas="true"
          className={`content-area relative min-h-[600px] ${
            isPreview ? "" : "rounded-xl border border-white/10 bg-white/5"
          }${
            device === "Desktop" && builderMode === "Layout Mode"
              ? " is-layout-desktop"
              : ""
          }`}
          style={{
            ...(isPreview ? { width: "100%" } : canvasSize),
            ...mobileSkeletonStyle,
          }}
        >
          <CanvasLayoutModeFlag />
            {layouts.length > 0 ? (
              <>
                {layouts.map((layout, I) => {
                  const cacheKey = String(
                    layout?.splitRowId || layout?.container?.id || I
                  );
                  // Only the left entry renders a split row. Do not let the
                  // right placeholder overwrite the shared row cache.
                  if (layout?.splitRowId && layout.splitSide !== "left") {
                    return null;
                  }
                  const sectionLayoutRefs = layout?.splitRowId
                    ? layouts.filter(
                        (entry) => entry?.splitRowId === layout.splitRowId
                      )
                    : [layout];
                  const requiresDragTargetRender =
                    elementCanvasDragRenderActive ||
                    sidebarPreviewRenderActive ||
                    sidebarSectionDropRenderActive;
                  let targetRenderIndex = -1;
                  if (requiresDragTargetRender) {
                    let rawTargetIndex =
                      dropTargetRef.current?.type === "SECTION"
                        ? dropTargetRef.current?.index
                        : dropTargetRef.current?.index?.conI;
                    if (!Number.isInteger(rawTargetIndex)) {
                      const internalTarget = layoutDragTargetRef.current;
                      rawTargetIndex = layouts.findIndex(
                        (entry) =>
                          (internalTarget.containerId &&
                            entry?.container?.id ===
                              internalTarget.containerId) ||
                          (internalTarget.id &&
                            (entry?.container?.id === internalTarget.id ||
                              entry?.splitRowId === internalTarget.id))
                      );
                    }
                    targetRenderIndex = Number.isInteger(rawTargetIndex)
                      ? Math.max(
                          0,
                          Math.min(
                            rawTargetIndex,
                            Math.max(0, layouts.length - 1)
                          )
                        )
                      : -1;
                    const targetLayout = layouts[targetRenderIndex];
                    if (targetLayout?.splitRowId) {
                      const targetSplitId = targetLayout.splitRowId;
                      while (
                        targetRenderIndex > 0 &&
                        layouts[targetRenderIndex - 1]?.splitRowId ===
                          targetSplitId
                      ) {
                        targetRenderIndex -= 1;
                      }
                    }
                  }
                  const activeDragData = elementCanvasDragRenderActive
                    ? activeDragRef.current?.data?.current
                    : null;
                  const sidebarPreviousTargetIndex =
                    sidebarPreviewRenderActive
                      ? sidebarNewElementFlipRef.current.previousConI
                      : -1;
                  const activeContainerId = activeDragData?.conID || "";
                  let sourceRenderIndex = activeContainerId
                    ? layouts.findIndex(
                        (entry) =>
                          entry?.container?.id === activeContainerId ||
                          entry?.splitRowId === activeContainerId
                      )
                    : -1;
                  const sourceLayout = layouts[sourceRenderIndex];
                  if (sourceLayout?.splitRowId) {
                    const sourceSplitId = sourceLayout.splitRowId;
                    while (
                      sourceRenderIndex > 0 &&
                      layouts[sourceRenderIndex - 1]?.splitRowId ===
                        sourceSplitId
                    ) {
                      sourceRenderIndex -= 1;
                    }
                  }
                  const cachedSection =
                    canvasSectionRenderCacheRef.current.get(cacheKey);
                  const cachedLayoutRefs = cachedSection?.layouts;
                  const cacheLayoutMatches =
                    Array.isArray(cachedLayoutRefs) &&
                    cachedLayoutRefs.length === sectionLayoutRefs.length &&
                    cachedLayoutRefs.every(
                      (entry, index) => entry === sectionLayoutRefs[index]
                    );
                  const cacheStats = canvasSectionCacheStatsRef.current;
                  const recordCacheMiss = (reason) => {
                    cacheStats.cacheMisses += 1;
                    cacheStats.missReasons[reason] =
                      (cacheStats.missReasons[reason] || 0) + 1;
                  };
                  const forceDragTargetRender =
                    requiresDragTargetRender && targetRenderIndex === I;
                  const forceDragSourceRender =
                    elementCanvasDragRenderActive && sourceRenderIndex === I;
                  if (
                    canReuseSectionCache &&
                    scopedLayoutCacheActive &&
                    !dragRenderActive &&
                    !forceDragTargetRender &&
                    !forceDragSourceRender &&
                    cachedSection?.renderIndex !== I &&
                    cacheLayoutMatches &&
                    React.isValidElement(cachedSection?.element)
                  ) {
                    cacheStats.cacheHits += 1;
                    const refreshedElement = refreshCachedSectionPosition(
                      cachedSection.element,
                      I
                    );
                    canvasSectionRenderCacheRef.current.set(cacheKey, {
                      layouts: sectionLayoutRefs,
                      renderIndex: I,
                      element: refreshedElement,
                    });
                    return refreshedElement;
                  }
                  if (
                    canReuseSectionCache &&
                    !forceDragTargetRender &&
                    !forceDragSourceRender &&
                    sidebarPreviousTargetIndex !== I &&
                    cachedSection?.renderIndex === I &&
                    cacheLayoutMatches
                  ) {
                    cacheStats.cacheHits += 1;
                    return cachedSection.element;
                  }
                  if (!cachedSection) {
                    recordCacheMiss("no-entry");
                  } else if (!cacheLayoutMatches) {
                    recordCacheMiss("layout-reference-changed");
                  } else if (cachedSection.renderIndex !== I) {
                    recordCacheMiss("section-index-changed");
                  } else if (!canReuseSectionCache) {
                    recordCacheMiss("drag-inactive-bypass");
                  } else if (forceDragTargetRender) {
                    recordCacheMiss("drag-target");
                  } else if (forceDragSourceRender) {
                    recordCacheMiss("drag-source");
                  } else if (sidebarPreviousTargetIndex === I) {
                    recordCacheMiss("sidebar-previous-target");
                  } else {
                    recordCacheMiss("unknown");
                  }
                  const renderedSection = (() => {
                  // ====== SPLIT ROW ======
                  if (layout.splitRowId) {
                    // Split halves share one sortable row but have independent containers.
                    // Keep their element trees on the global context until the split renderer
                    // can expose a stable per-half section boundary without changing row drag.
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
                        <StructuralSplitRowItem
                          id={splitRowId}
                          renderChildren={({ structuralOption: splitStructuralOption }) => (
                          <div className="flex w-full">
                          {splitSections.map(({ layout: sec, I: secI }, splitIdx) => {
                            const { container: secCon, columns: secCols } = sec;
                            const secID = secCon.id;
                            const splitShowOption =
                              splitStructuralOption?.hoverId === secID;
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
                              <div
                                key={secID}
                                id={secID}
                                data-split-secid={secID}
                                className="split-section-half relative flex flex-col"
                                style={{
                                  flex: 1,
                                  minWidth: 0,
                                  overflow:
                                    builderMode === "Layout Mode"
                                      ? "visible"
                                      : "hidden",
                                  zIndex: splitShowOption ? 20 : undefined,
                                }}
                              >
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
                                  openOffcavanas={openOffcavanas}
                                  changePosition={changePosition}
                                >
                                    {secCols && (
                                      <>
                                        {secCols.map((col, ci) =>
                                          renderCachedColumnSubtree(
                                            {
                                              branch: "split",
                                              sectionId: secID,
                                              column: col,
                                              sectionVisualKey:
                                                getSectionColumnVisualCacheKey(
                                                  sec?.container
                                                ),
                                              sectionIndex: secI,
                                              columnIndex: ci,
                                              splitIndex: splitIdx,
                                              splitSide: sec.splitSide || "",
                                            },
                                            () => {
                                          const { id: colId, elements, isSpan, spans = [] } = col;
                                          const eleID = !isSpan ? elements.map((e) => e.id) : [];
                                          return (
                                            <StructuralColumnItem
                                              key={colId}
                                              id={colId}
                                              containerId={secID}
                                              elementData={col}
                                              positionRevision={`${secI}:${ci}`}
                                              sectionVisualKey={getSectionColumnVisualCacheKey(
                                                sec?.container
                                              )}
                                            >
                                              {!isSpan ? (
                                                <SortableContext items={eleID} strategy={verticalListSortingStrategy} disabled={!isLayoutMode}>
                                                  {elements.length > 0 ? (
                                                    <>
                                                      {chunkColumnElementsForInlineRows(
                                                        elements
                                                      ).map((chunk) => {
                                                        if (chunk.kind === "btnRow" || chunk.kind === "iconRow" || chunk.kind === "counterRow" || chunk.kind === "listRow" || chunk.kind === "formRow") {
                                                          return (
                                                            <div key={`${chunk.kind}-${chunk.items[0].id}`} dir="ltr" className={`mb-2 flex w-full flex-row ${isDraggingLayout ? "flex-nowrap" : "flex-wrap"} ${chunk.kind === "formRow" ? "items-start" : "items-center"} ${inlineChunkRowFlexGapClass(chunk)} last:mb-0`} style={{ justifyContent: inlineRowJustifyFromChunk(chunk) }}>
                                                              {chunk.items.map((ele, localIdx) => {
                                                                const eleI = chunk.startIndex + localIdx;
                                                                return (
                                                                  <React.Fragment key={ele.id}>
                                                                    {INLINE_ROW_GHOST_ENABLED && preview && dropTargetRef.current.type === "ELEMENT" && !dropTargetRef.current.isLast && localIdx === 0 && dropTargetRef.current.index?.conI === secI && dropTargetRef.current.index?.colI === ci && dropTargetRef.current.index?.eleI === eleI && (
                                                                      <div ref={ghostRef} className={`opacity-70 ${ghostInsertAnimClass}`} key={`ghost-sp-inl-${ele.id}`} id={preview.id} onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDrop({ conI: secI, colI: ci, eleI }, "ELEMENT", false); }}><ElementPreview element={preview} /></div>
                                                                    )}
                                                                    <SortableElementItem id={ele.id} containerId={secID} columnId={colId} elementData={ele}>
                                                                      <Element element={ele} openOffcavanas={openOffcavanas} onUpdate={(data) => patchLayoutElement(data, { eleID: ele.id })} onDelete={() => deleteElement({ eleID: ele.id })} layouts={layouts} device={device} theme={theme} builderMode={builderMode} modal={openModal} dragRef={dragRef} ids={{ conI: secI, colI: ci, eleI }} colSize={col.size} richTextEditModal={setTextEditModal} isInDnD={isDraggingLayout} onTabElementEdit={(tabElement, tabId) => openTabsNestedElementEditor(ele.id, tabId, tabElement)} renderTabElement={(tabElement, tabElementIndex, tabId) => renderTabsNestedElement(ele.id, tabElement, tabElementIndex, tabId)} tabGhostData={getTabGhostData(ele)} onDataSliderDoubleClick={() => {
                                                                        if (builderModeRef.current !== "Layout Mode") return;
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
                                                              <Element element={singleEle} openOffcavanas={openOffcavanas} onUpdate={(data) => patchLayoutElement(data, { eleID: singleEle.id })} onDelete={() => deleteElement({ eleID: singleEle.id })} layouts={layouts} device={device} theme={theme} builderMode={builderMode} modal={openModal} dragRef={dragRef} ids={{ conI: secI, colI: ci, eleI }} colSize={col.size} richTextEditModal={setTextEditModal} isInDnD={isDraggingLayout} onTabElementEdit={(tabElement, tabId) => openTabsNestedElementEditor(singleEle.id, tabId, tabElement)} renderTabElement={(tabElement, tabElementIndex, tabId) => renderTabsNestedElement(singleEle.id, tabElement, tabElementIndex, tabId)} tabGhostData={getTabGhostData(singleEle)} onDataSliderDoubleClick={() => {
                                                                if (builderModeRef.current !== "Layout Mode") return;
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
                                                <>
                                                  {spans.map((s, o) => {
                                                    const eleSpn = Array.isArray(s?.elements) ? s.elements : [];
                                                    const sid = s?.id;
                                                    if (!sid) return null;
                                                    const eleSpnID = eleSpn.map((e) => e.id);
                                                    return renderCachedSpanSubtree(
                                                      {
                                                        branch: "split",
                                                        sectionId: secID,
                                                        columnId: colId,
                                                        span: s,
                                                        spanIndex: o,
                                                      },
                                                      () => (
                                                      <StructuralSpanItem
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
                                                                      onUpdate={(data) => patchLayoutElement(data, { eleID: singleEle.id })}
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
                                                                        if (builderModeRef.current !== "Layout Mode") return;
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
                                                      </StructuralSpanItem>
                                                      )
                                                    );
                                                  })}
                                                </>
                                              )}
                                            </StructuralColumnItem>
                                          );
                                            }
                                          )
                                        )}
                                      </>
                                    )}
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
                              {preview?.columns?.map((c) => (
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

                      <StructuralContainerItem
                        key={ID}
                        isColumn={columns}
                        elementData={container}
                        heros={heros}
                        id={ID}
                      >

                        
                          {columns && (
                            <>
                                {columns.map((col, i) =>
                                  renderCachedColumnSubtree(
                                    {
                                      branch: "normal",
                                      sectionId: ID,
                                      column: col,
                                      sectionVisualKey:
                                        getSectionColumnVisualCacheKey(
                                          layout?.container
                                        ),
                                      sectionIndex: I,
                                      columnIndex: i,
                                    },
                                    () => {
                            const { id, elements, isSpan, spans } = col;
                            let eleID;
                            if (!isSpan) {
                              eleID = elements.map((e) => e.id) ?? ["ele-null"];
                            }
                            return (
                              <StructuralColumnItem
                                key={id}
                                id={id}
                                containerId={ID}
                                elementData={col}
                                positionRevision={`${I}:${i}`}
                                sectionVisualKey={getSectionColumnVisualCacheKey(
                                  layout?.container
                                )}
                              >
                                {isSpan ? (
                                  <>
                                    {spans.map((s, o) => {
                                      const {
                                        elements: eleSpn,
                                        id: sid,
                                      } = s;
                                      const eleSpnID = eleSpn.map(
                                        (e) => e.id
                                      ) || ["ele-spn-null"];
                                      return renderCachedSpanSubtree(
                                        {
                                          branch: "normal",
                                          sectionId: ID,
                                          columnId: id,
                                          span: s,
                                          spanIndex: o,
                                        },
                                        () => (
                                        <StructuralSpanItem
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
                                                    chunk.kind === "listRow" ||
                                                    chunk.kind === "formRow" ? (
                                                      <div
                                                        key={`${chunk.kind}-${chunk.items[0].id}`}
                                                        dir="ltr"
                                                        className={`mb-2 flex w-full flex-row ${isDraggingLayout ? "flex-nowrap" : "flex-wrap"} ${chunk.kind === "formRow" ? "items-start" : "items-center"} ${inlineChunkRowFlexGapClass(chunk)} last:mb-0`}
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
                                                          } else if (
                                                            chunk.kind ===
                                                            "formRow"
                                                          ) {
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
                                                                  INLINE_ROW_GHOST_ENABLED && _ > 0 && (
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
                                                                  INLINE_ROW_GHOST_ENABLED && _ ===
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
                                        </StructuralSpanItem>
                                        )
                                      );
                                    })}
                                  </>
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
                                            chunk.kind === "listRow" ||
                                            chunk.kind === "formRow" ? (
                                              <div
                                                key={`${chunk.kind}-${chunk.items[0].id}`}
                                                dir="ltr"
                                                className={`mb-2 flex w-full flex-row ${isDraggingLayout ? "flex-nowrap" : "flex-wrap"} ${chunk.kind === "formRow" ? "items-start" : "items-center"} ${inlineChunkRowFlexGapClass(chunk)} last:mb-0`}
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
                                                  } else if (
                                                    chunk.kind === "formRow"
                                                  ) {
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
                                                          INLINE_ROW_GHOST_ENABLED && o > 0 &&
                                                          !dropTargetRef.current
                                                            .isLast && (
                                                            <>
                                                              <div
                                                                ref={ghostRef}
                                                                className="w-full opacity-70"
                                                                key={`ghost-ele-col-inline-${ele.id}-${localIdx}`}
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
                                                          INLINE_ROW_GHOST_ENABLED && o ===
                                                            elements.length -
                                                              1 &&
                                                          dropTargetRef.current
                                                            .isLast && (
                                                            <>
                                                              <div
                                                                ref={ghostRef}
                                                                className="w-full opacity-70"
                                                                key={`ghost-ele-col-inline-end-${ele.id}-${localIdx}`}
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
                              </StructuralColumnItem>
                            );
                                    }
                                  )
                                )}
                            </>
                          )}
                          {heros && heros.map(hero=>{
                            return (
                              <SwiperSlide key={hero}>
                                {hero}
                              </SwiperSlide>

                            )
                          })}
                      </StructuralContainerItem>

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
                              {preview?.columns?.map((c) => (
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
                  })();
                  const profiledSection =
                    benchmarkOffscreenSections && renderedSection ? (
                      <React.Profiler
                        key={cacheKey}
                        id={`BuilderSection:${I}:${cacheKey}`}
                        onRender={recordOffscreenSectionProfiler}
                      >
                        {renderedSection}
                      </React.Profiler>
                    ) : (
                      renderedSection
                    );
                  if (
                    !dragRenderActive ||
                    (targetRenderIndex !== I && sourceRenderIndex !== I)
                  ) {
                    canvasSectionRenderCacheRef.current.set(cacheKey, {
                      layouts: sectionLayoutRefs,
                      renderIndex: I,
                      element: profiledSection,
                    });
                  }
                  return profiledSection;
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
                      {preview?.columns?.map((c) => (
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
                  <ElementPreview element={activeItem} isDragOverlay />
                </div>
              ) : null)}
          </DragOverlay>
        </div>
        </div>
        



      </MaybeDndContext>
      </StructuralRenderRevisionContext.Provider>
      </StructuralOptionStoreContext.Provider>
      </ElementSelectionStoreContext.Provider>
      </InlineSortableRenderContext.Provider>
      </React.Profiler>
      </div>

      {!isPreview && (
      <footer
        className="dash-header flex h-[50px] w-full shrink-0 items-center justify-between gap-4 border-t px-4"
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
          <span className="ml-5 min-w-0 truncate text-[12px]">
            โครงสร้าง {canvasLayoutCounts.structureTotal} + องค์ประกอบ {" "}
            {canvasLayoutCounts.elements}
          </span>
          <BuilderPerformanceTrigger />
        </div>
        <span className="shrink-0 text-[12px]">
          Copyright © {new Date().getFullYear()} Web Builder. All rights reserved.
        </span>
      </footer>
      )}

      <React.Profiler
        id="text-editor"
        onRender={(
          _id,
          phase,
          actualDuration,
          baseDuration,
          startTime,
          commitTime
        ) => {
          if (
            textEditModal?.elementData?.type !== "text" ||
            new URLSearchParams(window.location.search).get("textPerf") !== "1"
          ) {
            return;
          }
          const renderPerf = window.__textEditorRenderPerf;
          if (!renderPerf) return;
          const commitLatencyMs = commitTime - startTime;
          renderPerf.commits += 1;
          renderPerf.totalMs += actualDuration;
          renderPerf.maxMs = Math.max(renderPerf.maxMs, actualDuration);
          renderPerf.maxCommitLatencyMs = Math.max(
            renderPerf.maxCommitLatencyMs,
            commitLatencyMs
          );
        }}
      >
        <RichTextEditorModal
        open={Boolean(textEditModal)}
        onClose={() => setTextEditModal(null)}
        sourceElement={textEditModal?.elementData}
        snapshotKey={textEditSnapshotKey}
        theme={theme}
        onSave={(nextParagraph) => {
          const id = textEditModal?.elementData?.id;
          if (id == null) return;
          const saveTransactionId = isBuilderPerformanceEnabled()
            ? beginBuilderPerformanceTransaction(
                "text-editor-save",
                {
                  label: "บันทึกลงหน้า / แก้ไขข้อความ",
                  elementType: textEditModal?.elementData?.type || "text",
                  elementId: String(id),
                },
                { trackFrames: true, skipInitialFrameGap: true }
              )
            : null;
          if (saveTransactionId != null) {
            pendingCanvasPerformanceTransactionsRef.current.add(
              saveTransactionId
            );
          }
          const closeTextEditor = () => {
            startTransition(() => setTextEditModal(null));
          };
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
            closeTextEditor();
            return;
          }
          if (textEditModal?.mode === "list-item-text") {
            const ex = textEditModal?.elementData?.__listItemTextEdit;
            const lid = ex?.listElementId;
            const idx = Number(ex?.itemIndex);
            if (lid == null || !Number.isFinite(idx) || idx < 0) {
              closeTextEditor();
              return;
            }
            const base = findLayoutElementById(layoutsRef.current, String(lid));
            if (!base || base.type !== "list") {
              closeTextEditor();
              return;
            }
            const merged = mergeListElement(base);
            const items = lodash.cloneDeep(merged.listItems || []);
            if (idx >= items.length) {
              closeTextEditor();
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
            closeTextEditor();
            return;
          }
          if (textEditModal?.mode === "list-box-item-text") {
            const ex = textEditModal?.elementData?.__listBoxItemTextEdit;
            const bid = ex?.listBoxElementId;
            const idx = Number(ex?.itemIndex);
            const field = ex?.field === "body" ? "body" : "title";
            if (bid == null || !Number.isFinite(idx) || idx < 0) {
              closeTextEditor();
              return;
            }
            const base = findLayoutElementById(layoutsRef.current, String(bid));
            if (!base || base.type !== "lstb") {
              closeTextEditor();
              return;
            }
            const merged = mergeListBoxElement(base);
            const items = lodash.cloneDeep(merged.listBoxItems || []);
            if (idx >= items.length) {
              closeTextEditor();
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
            closeTextEditor();
            return;
          }
          if (textEditModal?.mode === "carousel-slide-caption") {
            const ex = textEditModal?.elementData?.__carouselCaptionEdit;
            const cid = ex?.carouselElementId;
            const idx = Number(ex?.slideIndex);
            if (cid == null || !Number.isFinite(idx) || idx < 0) {
              closeTextEditor();
              return;
            }
            const idStr = String(cid);
            const base = findLayoutElementById(layoutsRef.current, idStr);
            if (!base || base.type !== "crl") {
              closeTextEditor();
              return;
            }
            const merged = mergeCarouselElement(base);
            const slides = lodash.cloneDeep(merged.carouselSlides || []);
            if (idx >= slides.length) {
              closeTextEditor();
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
            closeTextEditor();
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
            closeTextEditor();
            return;
          }
          if (textEditModal?.mode === "between-text") {
            const ex = textEditModal?.elementData?.__betweenTextEdit;
            const bid = ex?.betweenElementId;
            const side = ex?.side === "right" ? "right" : "left";
            if (bid == null) {
              closeTextEditor();
              return;
            }
            const base = findLayoutElementById(layoutsRef.current, String(bid));
            if (!base || base.type !== "btw") {
              closeTextEditor();
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
            closeTextEditor();
            return;
          }
          if (textEditModal?.mode === "button-special-text") {
            const base = findLayoutElementById(layoutsRef.current, String(id));
            const buttonType =
              base?.type === "btnG" ||
              textEditModal?.elementData?.type === "btnG"
                ? "btnG"
                : "btn";
            patchLayoutElement(
              {
                type: buttonType,
                buttonSpecialText: plain.replace(/\r\n/g, "\n"),
                buttonSpecialTextParagraph:
                  serializeParagraphForSave(nextParagraph),
              },
              { eleID: id }
            );
            closeTextEditor();
            return;
          }
          const saveStartedAt = performance.now();
          patchLayoutElement(
            {
              id,
              type: "text",
              textParagraph: serializeParagraphForSave(nextParagraph),
              label: plain,
            },
            {
              eleID: id,
              panelChangedFields: ["textParagraph", "label"],
            }
          );
          if (
            new URLSearchParams(window.location.search).get("textPerf") === "1"
          ) {
            const renderPerf = window.__textEditorRenderPerf;
            console.info("[Text Editor Perf] save", {
              target: String(id),
              saveSyncMs: Number(
                (performance.now() - saveStartedAt).toFixed(1)
              ),
              characters: plain.length,
              segments: nextParagraph?.segments?.length || 0,
              editorRenderCommits: renderPerf?.commits || 0,
              editorRenderAvgMs: renderPerf?.commits
                ? Number(
                    (renderPerf.totalMs / renderPerf.commits).toFixed(1)
                  )
                : 0,
              editorRenderMaxMs: Number(
                (renderPerf?.maxMs || 0).toFixed(1)
              ),
              editorCommitLatencyMaxMs: Number(
                (renderPerf?.maxCommitLatencyMs || 0).toFixed(1)
              ),
            });
            window.__textEditorRenderPerf = null;
          }
          closeTextEditor();
        }}
        />
      </React.Profiler>
      <ColumnPresetSaveModal
        open={Boolean(columnPresetModal?.open)}
        defaultName={columnPresetModal?.name || ""}
        error={columnPresetModal?.error || ""}
        onClose={closeColumnPresetModal}
        onSave={saveColumnPresetToLocalStorage}
      />
      <ColumnPresetLoadModal
        open={Boolean(columnPresetLoadModal?.open)}
        presets={columnPresetLoadModal?.presets || []}
        error={columnPresetLoadModal?.error || ""}
        onClose={handleCloseColumnPresetLoadModal}
        onLoad={handleLoadColumnPreset}
        onDelete={handleDeleteColumnPreset}
      />
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        open={presetSavedToastOpen}
        autoHideDuration={2400}
        onClose={() => {
          markPresetUiInteraction();
          setPresetSavedToastOpen(false);
        }}
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
        onClose={() => {
          markPresetUiInteraction();
          setPresetLoadedToastOpen(false);
        }}
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
      <BuilderConfirmModal
        data={modal}
        close={() => openModal()}
        layouts={layouts}
      />
      <BuilderAlertModal open={alert} onClose={() => setAlert(false)} />
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

                .container-area {
                  contain: layout style;
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

export default React.memo(Content);
