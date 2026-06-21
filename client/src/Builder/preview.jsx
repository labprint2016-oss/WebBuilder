import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";

const SNAPSHOT_KEY = "wb:preview:snapshot:v1";
const PreviewContent = lazy(() => import("./content"));

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
  const patchElementRef = useRef(null);
  const openListBoxTextEditRef = useRef(null);
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
    } catch (_) {
      setSnapshot(null);
    } finally {
      setIsSnapshotLoading(false);
    }
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
    return <div className="h-full min-h-0 flex-1 bg-white" />;
  }

  if (!snapshot) {
    return (
      <div className="flex h-full min-h-0 flex-1 items-center justify-center p-6">
        <div className="rounded-lg border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600">
          ไม่พบข้อมูล Preview ล่าสุด กรุณากดปุ่มตัวอย่างจากหน้า Builder อีกครั้ง
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-0 flex-1">
      <Suspense fallback={<div className="h-full min-h-0 flex-1 bg-white" />}>
        <PreviewContent
          builderMode="Preview Mode"
          handleDropElement={() => null}
          device={snapshot?.device || "Desktop"}
          openOffcavanas={() => {}}
          offcanvasID={null}
          layouts={snapshot.layouts}
          setLayout={() => {}}
          theme={snapshot.theme}
          setPage={() => {}}
          page={snapshot.page}
          patchElementRef={patchElementRef}
          openListBoxTextEditRef={openListBoxTextEditRef}
          isPreview
        />
      </Suspense>
    </div>
  );
}

export default PreviewRuntime;
