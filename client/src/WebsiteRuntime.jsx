import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import { ChevronUp } from "lucide-react";
import { getTheme } from "../Functions/theme";
import { getMenuBar } from "../Functions/menuBar";
import { getPage, listPages } from "../Functions/pages";
import { useLocation, useParams } from "react-router-dom";

const PreviewCanvas = lazy(() => import("./Builder/PreviewCanvas"));
const PreviewSiteChrome = lazy(() => import("./Builder/PreviewSiteChrome"));
const PreviewFooterBar = lazy(() =>
  import("./Builder/PreviewSiteChrome").then((module) => ({
    default: module.PreviewFooterBar,
  }))
);
const PagePopupOverlay = lazy(() => import("./Builder/PagePopupOverlay"));

const MENU_BAR_ID = "69db17211be82fe7637ea096";
const THEME_ID = "68d37327bedb0efab7dacafb";

const resolveDeviceFromWidth = (width) => {
  if (!Number.isFinite(width)) return "Desktop";
  if (width <= 767) return "Mobile";
  if (width <= 1024) return "Tablet";
  return "Desktop";
};

const pickPageFromList = (pages, requestedPageId = "") => {
  if (!Array.isArray(pages) || pages.length === 0) return null;
  const normalizedRequestedId = String(requestedPageId || "");
  if (normalizedRequestedId) {
    const matched = pages.find(
      (pageItem) => String(pageItem?._id || "") === normalizedRequestedId
    );
    if (matched) return matched;
  }
  return pages.find((pageItem) => pageItem?.isDefault === true) || pages[0];
};

const normalizeHeroSection = (value) => {
  if (!value || typeof value !== "object") return null;
  return Object.keys(value).length > 0 ? value : null;
};

const normalizePageLookupKey = (value) =>
  String(value || "").trim().toLowerCase();

const createPageSlug = (pageName) =>
  String(pageName || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizeWebsiteUrl = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (
    raw.startsWith("/") ||
    raw.startsWith("#") ||
    raw.startsWith("?") ||
    /^(https?:\/\/)/i.test(raw)
  ) {
    return raw;
  }
  return `https://${raw}`;
};

function WebsiteRuntime() {
  const location = useLocation();
  const { pageSlug = "" } = useParams();
  const topAnchorRef = useRef(null);
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);
  const [device, setDevice] = useState(() =>
    typeof window === "undefined"
      ? "Desktop"
      : resolveDeviceFromWidth(window.innerWidth)
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [runtimeData, setRuntimeData] = useState({
    page: null,
    pages: [],
    layouts: [],
    theme: null,
    siteChrome: null,
  });

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handleResize = () => {
      setDevice(resolveDeviceFromWidth(window.innerWidth));
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return undefined;
    }

    const getTrackedScrollElements = () => {
      const seen = new Set();
      const targets = [];
      const push = (target) => {
        if (!target || seen.has(target)) return;
        seen.add(target);
        targets.push(target);
      };

      push(window);
      push(document);
      push(document.scrollingElement);
      push(document.documentElement);
      push(document.body);
      document
        .querySelectorAll(".content-area, [data-scroll-container='true']")
        .forEach((element) => push(element));

      return targets;
    };

    const getScrollMetrics = () => {
      let maxScrollTop = Number(window.scrollY || window.pageYOffset || 0);
      const docScrollTop = Number(
        document.scrollingElement?.scrollTop ||
          document.documentElement?.scrollTop ||
          document.body?.scrollTop ||
          0
      );
      maxScrollTop = Math.max(maxScrollTop, docScrollTop);
      let maxScrollable = Math.max(
        Number(document.scrollingElement?.scrollHeight || 0) -
          Number(document.scrollingElement?.clientHeight || 0),
        Number(document.documentElement?.scrollHeight || 0) -
          Number(window.innerHeight || 0),
        0
      );

      const allElements = Array.from(document.querySelectorAll("*"));
      allElements.forEach((element) => {
        const localTop = Number(element?.scrollTop || 0);
        const localScrollable =
          Number(element?.scrollHeight || 0) - Number(element?.clientHeight || 0);
        if (localScrollable > 2) {
          maxScrollable = Math.max(maxScrollable, localScrollable);
          maxScrollTop = Math.max(maxScrollTop, localTop);
        }
      });

      document
        .querySelectorAll(".content-area, [data-scroll-container='true']")
        .forEach((element) => {
          maxScrollTop = Math.max(maxScrollTop, Number(element?.scrollTop || 0));
          const localScrollable =
            Number(element?.scrollHeight || 0) - Number(element?.clientHeight || 0);
          maxScrollable = Math.max(maxScrollable, localScrollable);
        });

      return {
        currentTop: maxScrollTop,
        maxScrollable,
      };
    };

    const updateButtonVisibility = () => {
      const { currentTop, maxScrollable } = getScrollMetrics();
      const viewportHeight = Math.max(Number(window.innerHeight || 0), 1);
      if (maxScrollable <= 0) {
        setShowScrollTopButton(false);
        return;
      }
      const viewportBasedThreshold = viewportHeight * 0.7; // แสดงเมื่อเลื่อนเกิน ~70% ของจอแรก
      const scrollableBasedThreshold = maxScrollable * 0.6; // หน้าเตี้ยให้แสดงเมื่อเลื่อนเกิน ~60% ของระยะที่เลื่อนได้จริง
      const showThreshold = Math.max(
        8,
        Math.min(viewportBasedThreshold, scrollableBasedThreshold)
      );
      const hideThreshold = Math.max(4, showThreshold * 0.55);
      setShowScrollTopButton((prev) =>
        prev ? currentTop > hideThreshold : currentTop >= showThreshold
      );
    };

    const trackedTargets = getTrackedScrollElements();
    updateButtonVisibility();
    trackedTargets.forEach((target) => {
      target.addEventListener("scroll", updateButtonVisibility, {
        passive: true,
      });
    });
    window.addEventListener("resize", updateButtonVisibility, { passive: true });
    const visibilityTimer = window.setInterval(updateButtonVisibility, 160);
    return () => {
      trackedTargets.forEach((target) => {
        target.removeEventListener("scroll", updateButtonVisibility);
      });
      window.removeEventListener("resize", updateButtonVisibility);
      window.clearInterval(visibilityTimer);
    };
  }, [runtimeData?.layouts, runtimeData?.siteChrome]);


  useEffect(() => {
    let isMounted = true;
    const loadRuntime = async () => {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const requestedPageId =
          new URLSearchParams(location.search).get("pageId") || "";
        const requestedPageName =
          new URLSearchParams(location.search).get("page") || "";
        const requestedPageSlug = normalizePageLookupKey(pageSlug);

        const [pagesResponse, menuBarResponse, themeResponse] = await Promise.all([
          listPages(),
          getMenuBar(MENU_BAR_ID),
          getTheme(THEME_ID),
        ]);

        const pagesList = Array.isArray(pagesResponse?.data) ? pagesResponse.data : [];
        const requestedPageBySlug = requestedPageSlug
          ? pagesList.find(
              (pageItem) =>
                normalizePageLookupKey(createPageSlug(pageItem?.pageName)) ===
                requestedPageSlug
            )
          : null;
        const requestedPageByName = requestedPageName
          ? pagesList.find(
              (pageItem) =>
                normalizePageLookupKey(pageItem?.pageName) ===
                normalizePageLookupKey(requestedPageName)
            )
          : null;
        const selectedPageSummary = pickPageFromList(
          pagesList,
          requestedPageId || requestedPageBySlug?._id || requestedPageByName?._id || ""
        );
        if (!selectedPageSummary?._id) {
          throw new Error("ไม่พบข้อมูลหน้าเว็บ กรุณาสร้างหน้าใน Builder ก่อน");
        }
        if (requestedPageSlug && !requestedPageBySlug && !requestedPageId) {
          throw new Error("ไม่พบหน้าตามลิงก์ที่ระบุ");
        }

        const pageResponse = await getPage(selectedPageSummary._id);
        const page =
          pageResponse?.data && typeof pageResponse.data === "object"
            ? pageResponse.data
            : selectedPageSummary;

        const layouts = Array.isArray(page?.layouts) ? page.layouts : [];
        const theme =
          themeResponse?.data && typeof themeResponse.data === "object"
            ? themeResponse.data
            : {};
        const menuBarData =
          menuBarResponse?.data && typeof menuBarResponse.data === "object"
            ? menuBarResponse.data
            : {};

        const menuPresets = Array.isArray(menuBarData?.menuPresets)
          ? menuBarData.menuPresets
          : [];
        const resolvedMenuPresetId =
          page?.menuPresetId ||
          menuBarData?.defaultMenuPresetId ||
          menuBarData?.activeMenuPresetId ||
          "";
        const selectedMenuPreset =
          menuPresets.find((preset) => preset?.id === resolvedMenuPresetId) ||
          menuPresets.find(
            (preset) => preset?.id === menuBarData?.defaultMenuPresetId
          ) ||
          menuPresets[0] ||
          null;

        const menus = Array.isArray(selectedMenuPreset?.items)
          ? selectedMenuPreset.items
          : [];
        const menuBarDesktop =
          selectedMenuPreset?.menuBarDesktop || menuBarData?.menuBarDesktop || {};
        const topBar = selectedMenuPreset?.topBar || menuBarData?.topBar || {};
        const footerBar =
          selectedMenuPreset?.footerBar || menuBarData?.footerBar || {};

        const resolvedHeroPresetId =
          page?.heroPresetId ||
          menuBarData?.defaultHeroPresetId ||
          menuBarData?.activeHeroPresetId ||
          "";
        const heroSectionsByPreset =
          menuBarData?.heroSections && typeof menuBarData.heroSections === "object"
            ? menuBarData.heroSections
            : {};
        const heroSectionFromPreset = heroSectionsByPreset[resolvedHeroPresetId];
        const fallbackHeroSection =
          menuBarData?.heroSection && typeof menuBarData.heroSection === "object"
            ? menuBarData.heroSection
            : null;
        const heroSection =
          normalizeHeroSection(heroSectionFromPreset) ??
          normalizeHeroSection(fallbackHeroSection);

        if (!isMounted) return;
        setRuntimeData({
          page,
          pages: pagesList,
          layouts,
          theme,
          siteChrome: {
            menus,
            menuBarDesktop,
            topBar,
            footerBar,
            heroSection,
            heroPresetId: resolvedHeroPresetId,
          },
        });
      } catch (error) {
        if (!isMounted) return;
        const fallback = "ไม่สามารถโหลดข้อมูลหน้าเว็บได้";
        const nextMessage =
          typeof error?.message === "string" && error.message.trim()
            ? error.message.trim()
            : fallback;
        setErrorMessage(nextMessage);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadRuntime();
    return () => {
      isMounted = false;
    };
  }, [location.search, pageSlug]);

  const hasContent = useMemo(() => {
    const menus = Array.isArray(runtimeData?.siteChrome?.menus)
      ? runtimeData.siteChrome.menus
      : [];
    const hasHero = Boolean(normalizeHeroSection(runtimeData?.siteChrome?.heroSection));
    const hasFooter =
      runtimeData?.siteChrome?.footerBar &&
      typeof runtimeData.siteChrome.footerBar === "object" &&
      Object.keys(runtimeData.siteChrome.footerBar).length > 0;
    const hasLayouts = Array.isArray(runtimeData?.layouts) && runtimeData.layouts.length > 0;
    return hasLayouts || menus.length > 0 || hasHero || hasFooter;
  }, [runtimeData]);

  const runtimeFooterBar = useMemo(
    () => runtimeData?.siteChrome?.footerBar || {},
    [runtimeData?.siteChrome?.footerBar]
  );

  const hasRuntimeFooter = useMemo(
    () =>
      runtimeFooterBar &&
      typeof runtimeFooterBar === "object" &&
      Object.keys(runtimeFooterBar).length > 0,
    [runtimeFooterBar]
  );

  const siteChromeWithoutFooter = useMemo(() => {
    const chrome = runtimeData?.siteChrome;
    if (!chrome || typeof chrome !== "object") return null;
    return {
      ...chrome,
      footerBar: null,
    };
  }, [runtimeData?.siteChrome]);

  const resolveMenuLink = useMemo(() => {
    const pages = Array.isArray(runtimeData?.pages) ? runtimeData.pages : [];
    return (menuItem) => {
      const type = String(menuItem?.type || "").toLowerCase();
      const target = menuItem?.target === "_blank" ? "_blank" : "_self";
      const urlValue = normalizeWebsiteUrl(menuItem?.url);
      if (type === "url" || (!type && urlValue)) {
        if (!urlValue) return { href: "#", target, disabled: true };
        return { href: urlValue, target, disabled: false };
      }

      const pageRef = String(menuItem?.page || menuItem?.link || "").trim();
      if (!pageRef) return { href: "#", target: "_self", disabled: true };
      const matchedPage = pages.find(
        (pageItem) =>
          String(pageItem?._id || "") === pageRef ||
          normalizePageLookupKey(pageItem?.pageName) ===
            normalizePageLookupKey(pageRef)
      );
      if (!matchedPage?._id) return { href: "#", target: "_self", disabled: true };
      const slug = createPageSlug(matchedPage?.pageName);
      if (!slug) return { href: "#", target: "_self", disabled: true };
      return {
        href: `/${encodeURIComponent(slug)}`,
        target,
        disabled: false,
      };
    };
  }, [runtimeData?.pages]);

  const primaryThemeColor = useMemo(() => {
    const theme = runtimeData?.theme;
    const palette = Array.isArray(theme?.mainColor) ? theme.mainColor : [];
    const primaryFromPalette = palette.find(
      (color) => typeof color === "string" && color.trim() !== ""
    );
    if (primaryFromPalette) return primaryFromPalette;
    const fallbackCandidates = [
      theme?.primaryColor,
      theme?.primary,
      theme?.accentColor,
    ];
    const fallback = fallbackCandidates.find(
      (color) => typeof color === "string" && color.trim() !== ""
    );
    return fallback || "#333333";
  }, [runtimeData?.theme]);

  if (isLoading) {
    return <div className="min-h-screen w-full bg-white" />;
  }

  if (errorMessage) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-6">
        <div className="rounded-lg border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600">
          <div>{errorMessage}</div>
          <a
            href="/builder"
            className="mt-3 inline-flex items-center rounded-md bg-[#333333] px-3 py-1.5 text-xs font-medium text-white"
          >
            เปิดหน้า Builder
          </a>
        </div>
      </div>
    );
  }

  if (!hasContent) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-6">
        <div className="rounded-lg border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600">
          ยังไม่มีข้อมูลสำหรับแสดงหน้าเว็บ
        </div>
      </div>
    );
  }

  const handleScrollToTop = () => {
    if (typeof window === "undefined" || typeof document === "undefined") return;
    const seen = new Set();
    const elementTargets = [];
    const pushTarget = (target) => {
      if (!target || seen.has(target)) return;
      seen.add(target);
      elementTargets.push(target);
    };

    const rootCandidates = [
      document.scrollingElement,
      document.documentElement,
      document.body,
    ];
    rootCandidates.forEach((target) => pushTarget(target));

    Array.from(document.querySelectorAll("*")).forEach((element) => {
      const style = window.getComputedStyle(element);
      const overflowY = String(style?.overflowY || "").toLowerCase();
      const canScroll =
        ["auto", "scroll", "overlay"].includes(overflowY) &&
        Number(element.scrollHeight || 0) - Number(element.clientHeight || 0) > 2;
      if (canScroll) pushTarget(element);
    });

    const isRootTarget = (target) =>
      target === document.scrollingElement ||
      target === document.documentElement ||
      target === document.body;

    const rootStartTop = Number(
      window.scrollY ||
        window.pageYOffset ||
        document.documentElement?.scrollTop ||
        document.body?.scrollTop ||
        0
    );

    const customTargets = elementTargets
      .filter((target) => !isRootTarget(target))
      .map((target) => ({
        target,
        startTop: Number(target.scrollTop || 0),
      }))
      .filter((item) => item.startTop > 0.5);

    if (rootStartTop <= 0.5 && customTargets.length === 0) return;

    const durationMs = 980;
    const startTimestamp = performance.now();
    const easeInOutCubic = (t) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const animateStep = (now) => {
      const rawProgress = (now - startTimestamp) / durationMs;
      const progress = Math.min(Math.max(rawProgress, 0), 1);
      const eased = easeInOutCubic(progress);

      if (rootStartTop > 0.5) {
        const nextTop = Math.max(0, rootStartTop * (1 - eased));
        window.scrollTo({ top: nextTop, left: 0, behavior: "auto" });
      }

      customTargets.forEach(({ target, startTop }) => {
        if (!target) return;
        const nextTop = Math.max(0, startTop * (1 - eased));
        target.scrollTop = nextTop;
      });

      if (progress < 1) {
        window.requestAnimationFrame(animateStep);
        return;
      }

      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      customTargets.forEach(({ target }) => {
        if (!target) return;
        target.scrollTop = 0;
      });
      if (topAnchorRef.current && typeof topAnchorRef.current.scrollIntoView === "function") {
        topAnchorRef.current.scrollIntoView({ behavior: "auto", block: "start" });
      }
    };

    window.requestAnimationFrame(animateStep);
  };

  return (
    <div className="relative w-full min-h-screen">
      <div ref={topAnchorRef} aria-hidden className="pointer-events-none absolute top-0 left-0 h-0 w-0" />
      {siteChromeWithoutFooter ? (
        <Suspense fallback={<div className="h-[120px] w-full bg-white" />}>
          <PreviewSiteChrome
            siteChrome={siteChromeWithoutFooter}
            theme={runtimeData.theme || {}}
            device={device}
            menuLinksEnabled
            resolveMenuLink={resolveMenuLink}
          />
        </Suspense>
      ) : null}
      <Suspense fallback={<div className="min-h-[240px] w-full bg-white" />}>
        <PreviewCanvas
          layouts={runtimeData.layouts}
          theme={runtimeData.theme || {}}
          device={device}
        />
      </Suspense>
      {hasRuntimeFooter ? (
        <Suspense fallback={<div className="h-[70px] w-full bg-white" />}>
          <PreviewFooterBar
            footerBar={runtimeFooterBar}
            theme={runtimeData.theme || {}}
            device={device}
          />
        </Suspense>
      ) : null}
      {showScrollTopButton ? (
        <button
          type="button"
          aria-label="เลื่อนขึ้นบนสุด"
          onClick={handleScrollToTop}
          className="fixed bottom-8 right-8 z-[260] flex h-11 w-11 items-center justify-center rounded-full shadow-lg transition-opacity duration-200 hover:opacity-90 sm:bottom-10 sm:right-10"
          style={{ backgroundColor: primaryThemeColor }}
        >
          <ChevronUp size={20} color="#ffffff" strokeWidth={2.5} />
        </button>
      ) : null}
      <Suspense fallback={null}>
        <PagePopupOverlay
          pagePopup={runtimeData?.page?.pagePopup}
          pageId={String(runtimeData?.page?._id || "")}
        />
      </Suspense>
    </div>
  );
}

export default WebsiteRuntime;
