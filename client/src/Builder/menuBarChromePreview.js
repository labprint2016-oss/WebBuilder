export function applyMenuFluidLayoutDirectly(isFluid) {
  if (typeof document === "undefined") return;
  document.querySelectorAll("[data-builder-menu-inner]").forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    el.classList.toggle("max-w-none", Boolean(isFluid));
    el.classList.toggle("max-w-[1280px]", !isFluid);
    el.classList.toggle("mx-auto", !isFluid);
  });
}

export function applyMenuOverlayDirectly(enabled, top = 0) {
  if (typeof document === "undefined") return;
  const topPx = `${Number(top) || 0}px`;
  document.querySelectorAll("[data-builder-menu-bar]").forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    if (enabled) {
      el.style.position = "absolute";
      el.style.left = "0";
      el.style.right = "0";
      el.style.top = topPx;
      el.style.zIndex = "140";
      el.dataset.builderMenuOverlay = "1";
    } else {
      el.style.position = "relative";
      el.style.left = "";
      el.style.right = "";
      el.style.top = "";
      el.style.zIndex = "";
      el.dataset.builderMenuOverlay = "0";
    }
  });
}
