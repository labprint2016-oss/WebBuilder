import React, {
    Suspense,
    lazy,
  } from "react";

const Image = lazy(() => import("./Elements/Image"));
const Video = lazy(() => import("./Elements/Video"));
const Lightbox = lazy(() => import("./Elements/Lightbox"));
const Text = lazy(() => import("./Elements/Text"));
const Heading = lazy(() => import("./Elements/Heading"));
const ButtonElement = lazy(() => import("./Elements/Button"));
const ButtonGroupElement = lazy(() => import("./Elements/ButtonGroup"));
import { isButtonFullWidthEnabled } from "./Elements/buttonElementConfig"
const Icon = lazy(() => import("./Elements/Icon"));
const ListElement = lazy(() => import("./Elements/List"));
const Carousel = lazy(() => import("./Elements/Carousel"));
const ListBox = lazy(() => import("./Elements/ListBox"));
const Counter = lazy(() => import("./Elements/Counter"));
const Tabs = lazy(() => import("./Elements/Tabs"));
const AccordionElement = lazy(() => import("./Elements/Accordion"));
const PostElement = lazy(() => import("./Elements/Post"));
const TableElement = lazy(() => import("./Elements/Table"));
const BetweenElement = lazy(() => import("./Elements/Between"));
const DividerElement = lazy(() => import("./Elements/Divider"));
const DataSlider = lazy(() => import("./Elements/DataSlider"));
const Catagories = lazy(() => import("./Elements/Catagories"));


const Element = ({
  elementData: elementDataProp,
  element,
  ids,
  theme,
  selected,
  hover,
  isLastList,
  listInlineDividerAfter = false,
  isHover,
  isPanelOpen = false,
  isHoverLocked = false,
  editorHoverMeta,
  onListEditIcon,
  onListEditText,
  onListBoxEditText,
  onListBoxEditIcon,
  onListBoxEditImage,
  onTabElementEdit,
  renderTabElement,
  onTabElementSelect,
  onTabElementsReorder,
  tabGhostData,
  tabSelectedElId,
  onDataSliderDoubleClick,
  onUpdate,
  builderMode,
  device = "Desktop",
}) => {
    const elementData = elementDataProp ?? element;
    if (!elementData) return null;

  const { type } = elementData;
  const isPreviewMode = builderMode === "Preview Mode";
  const previewAuditMode =
    isPreviewMode &&
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("audit") === "1";
  const sectionIndex = Number(ids?.conI);
  const columnIndex = Number(ids?.colI);
  const elementIndex = Number(ids?.eleI);
  // Prioritize only likely above-the-fold media in preview.
  // In audit mode, keep it limited (first 2 sections, first element per column)
  // to avoid flooding mobile bandwidth and hurting Lighthouse scores.
  const isLikelyAboveFoldInAudit =
    Number.isFinite(sectionIndex) &&
    Number.isFinite(elementIndex) &&
    sectionIndex >= 0 &&
    sectionIndex <= 1 &&
    elementIndex === 0;
  const prioritizeImageLoad =
    isPreviewMode &&
    (previewAuditMode
      ? isLikelyAboveFoldInAudit
      : Number.isFinite(sectionIndex) &&
        Number.isFinite(columnIndex) &&
        Number.isFinite(elementIndex) &&
        sectionIndex === 0 &&
        columnIndex === 0 &&
        elementIndex === 0);

    const previewFallback = isPreviewMode ? (
      (() => {
        const rawAspect =
          typeof elementData?.aspectRatio === "string"
            ? elementData.aspectRatio.trim()
            : "";
        const aspectRatio = rawAspect && rawAspect !== "auto" ? rawAspect : "16/9";
        const mediaTypes = new Set(["img", "imgh", "imgo", "bnr", "vid", "lbx"]);
        const contentHeavyTypes = new Set([
          "crl",
          "lstb",
          "tabs",
          "acc",
          "post",
          "tbl",
          "dts",
          "ctg",
        ]);

        if (mediaTypes.has(type)) {
          return (
            <div
              className="w-full rounded-sm bg-slate-100"
              style={{ aspectRatio }}
              aria-hidden
            />
          );
        }

        if (contentHeavyTypes.has(type)) {
          return (
            <div className="w-full rounded-sm bg-slate-50" style={{ minHeight: 220 }} aria-hidden />
          );
        }

        if (type === "text" || type === "heading") {
          return <div className="w-full bg-slate-50" style={{ minHeight: 32 }} aria-hidden />;
        }

        return <div className="w-full bg-slate-50" style={{ minHeight: 24 }} aria-hidden />;
      })()
    ) : null;

    const animationForElement =
    "transition-all duration-200 ease-in-out will-change-transform";

    const isBtnOrG = type === "btn" || type === "btnG";
    const inButtonRowGroup =
      isBtnOrG &&
      typeof elementData?.buttonRowGroupId === "string" &&
      elementData.buttonRowGroupId.trim() !== "";
    const btnFullCol = isBtnOrG && isButtonFullWidthEnabled(elementData);
    const layoutTightBtn =
      builderMode === "Layout Mode" &&
      isBtnOrG &&
      !btnFullCol &&
      inButtonRowGroup;
    const isIcon = type === "icon";
    const inIconRowGroup =
      isIcon &&
      typeof elementData?.iconRowGroupId === "string" &&
      elementData.iconRowGroupId.trim() !== "";
    const layoutTightIcon =
      builderMode === "Layout Mode" && isIcon && inIconRowGroup;

    const isImageLike =
      type === "img" ||
      type === "imgh" ||
      type === "imgo" ||
      type === "bnr" ||
      type === "vid" ||
      type === "lbx" ||
      type === "ctn" ||
      type === "tabs" ||
      type === "acc" ||
      type === "post" ||
      type === "dts" ||
      type === "ctg";
    const isList = type === "list";
    const isButtonMulti = isList && elementData?.buttonMultiElement === true;
    const inListRowGroup =
      isList &&
      typeof elementData?.listRowGroupId === "string" &&
      elementData.listRowGroupId.trim() !== "";
    const layoutTightList =
      builderMode === "Layout Mode" && isList && inListRowGroup;
    const isCounter = type === "ctn";
    const inCounterRowGroup =
      isCounter &&
      typeof elementData?.counterRowGroupId === "string" &&
      elementData.counterRowGroupId.trim() !== "";

    let wrapClass = isImageLike
      ? type === "ctn"
        ? "relative block w-full self-start"
        : "relative block w-full"
      : "relative inline-block w-full";
    if (isBtnOrG) {
      if (btnFullCol) {
        wrapClass = "relative block w-full min-w-0 max-w-full";
      } else if (inButtonRowGroup) {
        wrapClass = "relative inline-block max-w-full shrink-0";
      } else if (layoutTightBtn) {
        wrapClass = "relative inline-block w-fit max-w-full";
      }
    } else if (isIcon) {
      if (inIconRowGroup) {
        wrapClass = "relative inline-block max-w-full shrink-0";
      } else if (layoutTightIcon) {
        wrapClass = "relative inline-block w-fit max-w-full";
      }
    } else if (isList) {
      const listIcons = elementData?.listIconsElement === true || isButtonMulti;
      if (inListRowGroup) {
        /* List iCons แถวแนวนอน: ต้อง min-w-0 + shrink ได้ ไม่ล้นแท็บเล็ต/มือถือใน listRow */
        wrapClass = listIcons
          ? "relative inline-block min-w-0 max-w-full shrink"
          : "relative inline-block max-w-full shrink-0";
      } else if (layoutTightList) {
        wrapClass = listIcons
          ? "relative inline-block w-fit max-w-full min-w-0 shrink"
          : "relative inline-block w-fit max-w-full";
      } else if (listIcons) {
        wrapClass = "relative inline-block w-full min-w-0 max-w-full";
      }
    } else if (isCounter) {
      if (inCounterRowGroup) {
        wrapClass = "relative inline-block max-w-full shrink-0";
      }
    }

    const elementZIndex =
      builderMode !== "Layout Mode"
        ? type === "btn" || type === "btnG" || type === "icon"
          ? 30
          : type === "text" || type === "heading"
            ? 10
            : undefined
        : undefined;

    return ( 
    <div className={wrapClass} style={elementZIndex ? { zIndex: elementZIndex } : undefined}>
            <Suspense fallback={previewFallback}>
            {(type === "img" || type === "imgh" || type === "imgo" || type === "bnr") && (
        <Image
          elementData={elementData}
          selected={selected}
          hover={hover}
          animationForElement={animationForElement}
          theme={theme}
          builderMode={builderMode}
          isPanelOpen={isPanelOpen}
          isHoverLocked={isHoverLocked}
          prioritizeLoad={prioritizeImageLoad}
        />
        )}
         {type === "vid" && (
           <Video
             elementData={elementData}
             selected={selected}
             hover={hover}
             animationForElement={animationForElement}
             theme={theme}
             builderMode={builderMode}
           />
        )}
         {type === "lbx" && (
           <Lightbox
             elementData={elementData}
             selected={selected}
             hover={hover}
             animationForElement={animationForElement}
             theme={theme}
             builderMode={builderMode}
           />
        )}
           {type === "text" && (
          <Text
            isHover={isHover}
            elementData={elementData}
            selected={selected}
            hover={hover}
            animationForElement={animationForElement}
            theme={theme}
            builderMode={builderMode}
            renderSignature={`${JSON.stringify(elementData?.textParagraph ?? null)}|${
              elementData?.label ?? ""
            }`}
          />
        )}
         {type === "heading" && (
          <Heading
            elementData={elementData}
            selected={selected}
            hover={hover}
            animationForElement={animationForElement}
            theme={theme}
            builderMode={builderMode}
          />
        )} {type === "btn" && (
            <ButtonElement builderMode={builderMode} elementData={elementData} selected={selected} hover={hover} theme={theme}/>
          )}
          {type === "btnG" && (
            <ButtonGroupElement
              builderMode={builderMode}
              elementData={elementData}
              selected={selected}
              hover={hover}
              theme={theme}
            />
          )}
          {type === "icon" && (
            <Icon
              builderMode={builderMode}
              elementData={elementData}
              selected={selected}
              hover={hover}
              theme={theme}
            />
          )}
          {type === "list" && (
            <ListElement
              builderMode={builderMode}
              isLastList={isLastList}
              listInlineDividerAfter={listInlineDividerAfter}
              hover={hover}
              elementData={elementData}
              selected={selected}
              theme={theme}
              onEditIcon={onListEditIcon}
              onEditText={onListEditText}
            />
          )}
          {type === "crl" && (
            <Carousel
              builderMode={builderMode}
              elementData={elementData}
              selected={selected}
              hover={hover}
              device={device}
              allowAutoplay={false}
              theme={theme}
              animationForElement={animationForElement}
              editorHoverMeta={editorHoverMeta}
            />
          )}
          {type === "lstb" && (
            <ListBox
              builderMode={builderMode}
              elementData={elementData}
              selected={selected}
              hover={hover}
              device={device}
              theme={theme}
              onListBoxEditText={onListBoxEditText}
              onListBoxEditIcon={onListBoxEditIcon}
              onListBoxEditImage={onListBoxEditImage}
              animationForElement={animationForElement}
            />
          )}
          {type === "ctn" && (
            <Counter
              elementData={elementData}
              selected={selected}
              isHover={isHover}
              isPanelOpen={isPanelOpen}
              hover={hover}
              theme={theme}
              builderMode={builderMode}
              animationForElement={animationForElement}
            />
          )}
          {type === "tabs" && (
            <Tabs
              elementData={elementData}
              selected={selected}
              animationForElement={animationForElement}
              builderMode={builderMode}
              onTabElementEdit={onTabElementEdit}
              renderTabElement={renderTabElement}
              onTabElementSelect={onTabElementSelect}
              onTabElementsReorder={onTabElementsReorder}
              tabGhostData={tabGhostData}
              tabSelectedElId={tabSelectedElId}
              onHostDoubleClick={onDataSliderDoubleClick}
              theme={theme}
            />
          )}
          {type === "dts" && (
            <DataSlider
              elementData={elementData}
              selected={selected}
              animationForElement={animationForElement}
              builderMode={builderMode}
              device={device}
              onUpdate={onUpdate}
              onTabElementEdit={onTabElementEdit}
              renderTabElement={renderTabElement}
              onTabElementSelect={onTabElementSelect}
              onTabElementsReorder={onTabElementsReorder}
              tabGhostData={tabGhostData}
              tabSelectedElId={tabSelectedElId}
              theme={theme}
            />
          )}
          {type === "ctg" && (
            <Catagories
              elementData={elementData}
              selected={selected}
              animationForElement={animationForElement}
              builderMode={builderMode}
              device={device}
              onUpdate={onUpdate}
              onTabElementEdit={onTabElementEdit}
              renderTabElement={renderTabElement}
              onTabElementSelect={onTabElementSelect}
              onTabElementsReorder={onTabElementsReorder}
              tabGhostData={tabGhostData}
              tabSelectedElId={tabSelectedElId}
              theme={theme}
            />
          )}
          {type === "acc" && (
            <AccordionElement
              elementData={elementData}
              selected={selected}
              animationForElement={animationForElement}
              builderMode={builderMode}
              onTabElementEdit={onTabElementEdit}
              renderTabElement={renderTabElement}
              onTabElementSelect={onTabElementSelect}
              onTabElementsReorder={onTabElementsReorder}
              tabGhostData={tabGhostData}
              tabSelectedElId={tabSelectedElId}
              theme={theme}
            />
          )}
          {type === "post" && (
            <PostElement
              elementData={elementData}
              selected={selected}
              animationForElement={animationForElement}
              builderMode={builderMode}
              prioritizeImageLoad={prioritizeImageLoad}
              onTabElementEdit={onTabElementEdit}
              renderTabElement={renderTabElement}
              onTabElementSelect={onTabElementSelect}
              onTabElementsReorder={onTabElementsReorder}
              tabGhostData={tabGhostData}
              tabSelectedElId={tabSelectedElId}
              theme={theme}
            />
          )}
          {type === "tbl" && (
            <TableElement
              elementData={elementData}
              selected={selected}
              hover={hover}
              animationForElement={animationForElement}
              builderMode={builderMode}
              onUpdate={onUpdate}
              theme={theme}
            />
          )}
          {type === "btw" && (
            <BetweenElement
              elementData={elementData}
              selected={selected}
              hover={hover}
              animationForElement={animationForElement}
              builderMode={builderMode}
              theme={theme}
            />
          )}
          {type === "divider" && (
            <DividerElement
              elementData={elementData}
              selected={selected}
              hover={hover}
              animationForElement={animationForElement}
              theme={theme}
              builderMode={builderMode}
            />
          )}
          </Suspense>
    </div>
    )

}

export default Element