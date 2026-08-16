import React, { Suspense, lazy, useEffect, useMemo, useState } from "react";

const SNAPSHOT_KEY = "wb:preview:snapshot:v1";
const PreviewCanvas = lazy(() => import("./PreviewCanvas"));
const PreviewSiteChrome = lazy(() => import("./PreviewSiteChrome"));
const PagePopupOverlay = lazy(() => import("./PagePopupOverlay"));

const IMAGE_TYPES = new Set(["img", "imgh", "imgo", "bnr", "post"]);

const extractSrcFromElement = (element) => {
  if (!element || typeof element !== "object") return "";
  if (!IMAGE_TYPES.has(String(element.type || ""))) return "";
  const src = typeof element.src === "string" ? element.src.trim() : "";
  return src;
};

const findFirstImageSrc = (layouts) => {
  if (!Array.isArray(layouts)) return "";
  for (const layout of layouts) {
    const columns = Array.isArray(layout?.columns) ? layout.columns : [];
    for (const column of columns) {
      const colElements = Array.isArray(column?.elements) ? column.elements : [];
      for (const element of colElements) {
        const src = extractSrcFromElement(element);
        if (src) return src;
      }
      const spans = Array.isArray(column?.spans) ? column.spans : [];
      for (const span of spans) {
        const spanElements = Array.isArray(span?.elements) ? span.elements : [];
        for (const element of spanElements) {
          const src = extractSrcFromElement(element);
          if (src) return src;
        }
      }
    }
  }
  return "";
};

function PreviewRuntime() {
  const [snapshot, setSnapshot] = useState(null);
  const [isSnapshotLoading, setIsSnapshotLoading] = useState(true);
  const auditMode = useMemo(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("audit") === "1";
  }, []);
  const firstImageSrc = useMemo(
    () => findFirstImageSrc(snapshot?.layouts),
    [snapshot?.layouts]
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SNAPSHOT_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed && parsed.layouts && parsed.page && parsed.theme) {
        setSnapshot(parsed);
      }
    } catch {
      setSnapshot(null);
    } finally {
      setIsSnapshotLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handleStorage = (event) => {
      if (event.key !== SNAPSHOT_KEY) return;
      try {
        const parsed = event.newValue ? JSON.parse(event.newValue) : null;
        if (parsed && parsed.layouts && parsed.page && parsed.theme) {
          setSnapshot(parsed);
          return;
        }
        setSnapshot(null);
      } catch {
        setSnapshot(null);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => {
    if (!firstImageSrc || typeof document === "undefined") return undefined;
    const preload = document.createElement("link");
    preload.rel = "preload";
    preload.as = "image";
    preload.href = firstImageSrc;
    preload.setAttribute("fetchpriority", "high");
    document.head.appendChild(preload);
    return () => {
      if (preload.parentNode) preload.parentNode.removeChild(preload);
    };
  }, [firstImageSrc]);

  if (isSnapshotLoading) {
    return <div className="min-h-screen w-full bg-white" />;
  }

  if (!snapshot) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-6">
        <div className="rounded-lg border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600">
          ไม่พบข้อมูล Preview ล่าสุด กรุณากดปุ่มตัวอย่างจากหน้า Builder อีกครั้ง
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen">
      {!auditMode ? (
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
      {snapshot?.siteChrome ? (
        <Suspense fallback={<div className="h-[120px] w-full bg-white" />}>
          <PreviewSiteChrome
            siteChrome={snapshot.siteChrome}
            theme={snapshot.theme}
            device={snapshot?.device || "Desktop"}
          />
        </Suspense>
      ) : null}
      <Suspense fallback={<div className="min-h-[240px] w-full bg-white" />}>
        <PreviewCanvas
          device={snapshot?.device || "Desktop"}
          layouts={snapshot.layouts}
          theme={snapshot.theme}
          auditMode={auditMode}
        />
      </Suspense>
      <Suspense fallback={null}>
        <PagePopupOverlay
          pagePopup={snapshot?.page?.pagePopup}
          pageId={String(snapshot?.page?._id || "preview")}
        />
      </Suspense>
    </div>
  );
}

export default PreviewRuntime;
