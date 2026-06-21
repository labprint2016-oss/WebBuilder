import { useRef, useEffect, useCallback } from "react";
import { setColor } from "../../../function";
import ServiceLayout from "../Services/ServiceLayout";
import { resolveSectionOverlapPx } from "./sectionOverlapDevice";

/** หา element ที่เลื่อนได้ (เช่น main ของ builder) — มิติพื้นหลัง (parallax) ต้องฟัง scroll ตรงนี้ ไม่ใช่แค่ window */
function getScrollableAncestor(el) {
  if (!el) return null;
  let node = el.parentElement;
  while (node) {
    const { overflowY, overflow } = getComputedStyle(node);
    const oy = overflowY || overflow;
    if (
      /(auto|scroll|overlay)/.test(oy) &&
      node.scrollHeight > node.clientHeight + 2
    ) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

function Container({
  elementData,
  device,
  builderMode,
  setRef,
  borderT,
  theme,
  handleDuring,
  showOption,
  layouts,
  funct,
  onUpdate,
  modal,
  scheduleDND,
  openOffcavanas,
  changePosition,
  innerContentStyle,
  sectionDndHandle = null,
  onSectionDragEnable,
  onSectionDragDisable,
  className: extraClassName = "",
  children,
}) {
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
    blur,
    id,
    parallaxEnabled,
  } = elementData;

  const overlapPx = resolveSectionOverlapPx(elementData, device);
  const hasOverlap = overlapPx > 0;

  const sectionRootRef = useRef(null);
  const bgParallaxRef = useRef(null);
  const hasParallaxBg =
    parallaxEnabled === true && Boolean(backgroundImage);

  const {
    clone,
    remove,
  }=funct

  const ids = {conID:id,colID:null,spnID:null}

  



  const fluid = isFluid ? "w-full" : "container";

  let color;

  if (isGradient) {
    color = setColor(
      theme,
      backgroundColorGradient,
      opacityColorGradient,
      degrees
    );
  } else if (!isGradient) {
    color = setColor(theme, backgroundColor, opacityColor);
  }

  useEffect(() => {
    const inner = bgParallaxRef.current;
    const outer = sectionRootRef.current;
    if (!hasParallaxBg) {
      if (inner) inner.style.transform = "";
      return;
    }

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduceMotion) {
      return;
    }

    const STRENGTH = 0.2;
    let rafId = 0;
    const scrollRoot = getScrollableAncestor(outer) || window;

    const apply = () => {
      rafId = 0;
      if (!sectionRootRef.current || !bgParallaxRef.current) return;
      const rect = sectionRootRef.current.getBoundingClientRect();
      const y = rect.top * STRENGTH;
      bgParallaxRef.current.style.transform = `translate3d(0, ${y}px, 0)`;
    };

    const schedule = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(apply);
    };

    schedule();
    scrollRoot.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      scrollRoot.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (rafId) cancelAnimationFrame(rafId);
      if (bgParallaxRef.current) bgParallaxRef.current.style.transform = "";
    };
  }, [hasParallaxBg, id, backgroundImage]);

  const BgImage = () => {
    if (backgroundImage) {
      const bleed = hasParallaxBg ? 56 : 0;
      const pad = Math.ceil(blur * 2) + bleed;
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div
            ref={bgParallaxRef}
            className="absolute bg-cover bg-center bg-no-repeat"
            style={{
              top: -pad,
              left: -pad,
              right: -pad,
              bottom: -pad,
              backgroundImage: `url(${backgroundImage})`,
              opacity: opacityImage,
              filter: `blur(${blur}px)`,
              willChange: hasParallaxBg ? "transform, filter" : "filter",
            }}
          />
        </div>
      );
    } else {
      return <></>;
    }
  };

  const setRefPropRef = useRef(setRef);
  setRefPropRef.current = setRef;
  const mergedSectionRef = useCallback((el) => {
    sectionRootRef.current = el;
    setRefPropRef.current?.(el);
  }, []);

  return (
    <div
      className={`${
        device === "Desktop" && builderMode === "Layout Mode"
          ? `border-[1px] ${borderT} border-dashed border-gray-600`
          : ""
      } relative${extraClassName ? ` ${extraClassName}` : ""}`}
      style={{
        background: color,
        ...(hasOverlap ? { overflow: "visible", marginBottom: `-${overlapPx}px` } : {}),
      }}
      ref={mergedSectionRef}
    >
      {showOption && (
 <div className="absolute top-0 left-0 z-[1000] pointer-events-none">
 <div className="pointer-events-auto">
    <ServiceLayout
          layouts={layouts}
          element={elementData}
          clone={clone}
          remove={remove}
          scheduleDND={scheduleDND}
          openOffcavanas={openOffcavanas}
          ids={ids}
          onUpdate={onUpdate}
          modal={modal}
          offcavanas="Container"
          changePosition={changePosition}
          sectionDndHandle={sectionDndHandle}
          onSectionDragEnable={onSectionDragEnable}
          onSectionDragDisable={onSectionDragDisable}
        />
   </div>
   </div>
          
    
      )}

      <BgImage />

      {/* เส้นประแสดงจุดที่ Section ถัดไปเริ่มต้น — แสดงเฉพาะ Layout Mode เมื่อมี overlap */}
      {hasOverlap && device === "Desktop" && builderMode === "Layout Mode" && (
        <div
          className="pointer-events-none absolute left-0 right-0 z-[1] border-t border-dashed border-gray-600"
          style={{ bottom: overlapPx }}
        />
      )}

      <div
        className={`${fluid} mx-auto relative`}
        style={{
          paddingTop: paddingTop,
          paddingBottom: paddingBottom,
          ...(hasOverlap ? { transform: `translateY(-${overlapPx}px)` } : {}),
          ...(innerContentStyle || {}),
        }}
      >
        <div className="grid grid-cols-12" onDragOver={handleDuring}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default Container;
