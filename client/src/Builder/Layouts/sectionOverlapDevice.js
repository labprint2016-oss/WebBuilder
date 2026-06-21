/**
 * ระยะซ้อนทับ Section บน — แยกต่ออุปกรณ์ (Desktop / Tablet / Mobile)
 * รองรับข้อมูลเก่าที่มีแค่ sectionOverlapTop
 */

export function normalizeContainerOverlapFields(container) {
  if (!container || typeof container !== "object") return container;
  const legacy = Number(container.sectionOverlapTop) || 0;
  const missing = (x) => x === undefined || x === null;
  if (
    missing(container.sectionOverlapTopDesktop) &&
    missing(container.sectionOverlapTopTablet) &&
    missing(container.sectionOverlapTopMobile)
  ) {
    return {
      ...container,
      sectionOverlapTopDesktop: legacy,
      sectionOverlapTopTablet: legacy,
      sectionOverlapTopMobile: legacy,
    };
  }
  const desktop = missing(container.sectionOverlapTopDesktop)
    ? legacy
    : Number(container.sectionOverlapTopDesktop) || 0;
  const tablet = missing(container.sectionOverlapTopTablet)
    ? desktop
    : Number(container.sectionOverlapTopTablet) || 0;
  const mobile = missing(container.sectionOverlapTopMobile)
    ? tablet
    : Number(container.sectionOverlapTopMobile) || 0;
  return {
    ...container,
    sectionOverlapTopDesktop: desktop,
    sectionOverlapTopTablet: tablet,
    sectionOverlapTopMobile: mobile,
  };
}

/** ค่า px ที่ใช้บน canvas ตาม device ของ builder */
export function resolveSectionOverlapPx(container, device) {
  const c = normalizeContainerOverlapFields(container);
  if (device === "Tablet") return Number(c.sectionOverlapTopTablet) || 0;
  if (device === "Mobile") return Number(c.sectionOverlapTopMobile) || 0;
  return Number(c.sectionOverlapTopDesktop) || 0;
}

const OVERLAP_KEYS = {
  desktop: "sectionOverlapTopDesktop",
  tablet: "sectionOverlapTopTablet",
  mobile: "sectionOverlapTopMobile",
};

/** ค่าที่แสดงบนสไลด์ใน panel ตามแท็บ (หลัง normalize แล้ว) */
export function overlapSliderResolvedValue(container, tabId) {
  const c = normalizeContainerOverlapFields(container);
  if (tabId === "tablet") return Number(c.sectionOverlapTopTablet) || 0;
  if (tabId === "mobile") return Number(c.sectionOverlapTopMobile) || 0;
  return Number(c.sectionOverlapTopDesktop) || 0;
}

export function overlapFieldKeyForTab(tabId) {
  return OVERLAP_KEYS[tabId] || OVERLAP_KEYS.desktop;
}
