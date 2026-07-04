import React, { useMemo } from "react";
import { setColor } from "../../function";
import Element from "./Layouts/Element";

const DEFAULT_COL_SIZE = 12;
const DEFAULT_GAP_PX = 22;

const resolveResponsiveGridSpan = (sizeValue, device) => {
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

const toGridSpan = (size) => {
  const n = Number(size);
  return Number.isFinite(n) ? Math.min(12, Math.max(1, Math.round(n))) : DEFAULT_COL_SIZE;
};

const resolveSurfaceBackground = (node, theme) => {
  if (!node) return "transparent";
  const isGradient = node?.isGradient === true;
  if (isGradient) {
    return (
      setColor(
        theme,
        node?.backgroundColorGradient ?? [],
        node?.opacityColorGradient ?? [],
        node?.degrees ?? 90
      ) || "transparent"
    );
  }
  return setColor(theme, node?.backgroundColor, node?.opacityColor ?? 255) || "transparent";
};

const resolveSurfaceBorder = (node, theme) => {
  return setColor(theme, node?.borderColor, node?.borderOpacity ?? 255) || "transparent";
};

const PreviewElement = ({ element, theme, device, ids }) => {
  return (
    <Element
      elementData={element}
      theme={theme}
      device={device}
      builderMode="Preview Mode"
      ids={ids}
      hover={() => {}}
    />
  );
};

const PreviewMiniSpan = ({ miniSpan, theme, device, ids, noColumnGap }) => {
  const bg = resolveSurfaceBackground(miniSpan, theme);
  const borderColor = resolveSurfaceBorder(miniSpan, theme);
  const miniElements = Array.isArray(miniSpan?.elements) ? miniSpan.elements : [];
  const gridSpan = resolveResponsiveGridSpan(miniSpan?.size, device);
  return (
    <div
      className="w-full min-w-0"
      style={{
        gridColumn: `span ${gridSpan} / span ${gridSpan}`,
      }}
    >
      <div
        className="w-full min-w-0"
        style={{
          background: bg,
          borderRadius: Number(miniSpan?.borderRadius) || 0,
          borderWidth: Number(miniSpan?.borderWidth) || 0,
          borderStyle: "solid",
          borderColor,
          padding: `${Number(miniSpan?.paddingY) || 0}px ${Number(miniSpan?.paddingX) || 0}px`,
        }}
      >
        {miniElements.map((element, eleI) => (
          <PreviewElement
            key={element?.id || `mini-el-${eleI}`}
            element={element}
            theme={theme}
            device={device}
            ids={{ ...ids, eleI }}
          />
        ))}
      </div>
    </div>
  );
};

const PreviewSpan = ({ span, theme, device, ids, noColumnGap }) => {
  const bg = resolveSurfaceBackground(span, theme);
  const borderColor = resolveSurfaceBorder(span, theme);
  const spanElements = Array.isArray(span?.elements) ? span.elements : [];
  const nestedSpans = Array.isArray(span?.nestedSpans) ? span.nestedSpans : [];
  const hasNestedSpan = span?.hasNestedSpan === true && nestedSpans.length > 0;
  const gridSpan = resolveResponsiveGridSpan(span?.size, device);
  const gapPx = noColumnGap ? 0 : DEFAULT_GAP_PX;
  return (
    <div
      className="w-full min-w-0"
      style={{
        gridColumn: `span ${gridSpan} / span ${gridSpan}`,
      }}
    >
      <div
        className="w-full min-w-0"
        style={{
          background: bg,
          borderRadius: Number(span?.borderRadius) || 0,
          borderWidth: Number(span?.borderWidth) || 0,
          borderStyle: "solid",
          borderColor,
          padding: `${Number(span?.paddingY) || 0}px ${Number(span?.paddingX) || 0}px`,
        }}
      >
        {hasNestedSpan ? (
          <div
            className="grid w-full min-w-0 grid-cols-12"
            style={{ columnGap: gapPx, rowGap: gapPx }}
          >
            {nestedSpans.map((miniSpan, nestI) => (
              <PreviewMiniSpan
                key={miniSpan?.id || `mini-${nestI}`}
                miniSpan={miniSpan}
                theme={theme}
                device={device}
                ids={{ ...ids, nestI }}
                noColumnGap={noColumnGap}
              />
            ))}
          </div>
        ) : (
          spanElements.map((element, eleI) => (
            <PreviewElement
              key={element?.id || `spn-el-${eleI}`}
              element={element}
              theme={theme}
              device={device}
              ids={{ ...ids, eleI }}
            />
          ))
        )}
      </div>
    </div>
  );
};

const PreviewColumn = ({ column, theme, device, conI, colI, noColumnGap }) => {
  const bg = resolveSurfaceBackground(column, theme);
  const borderColor = resolveSurfaceBorder(column, theme);
  const isSpan = column?.isSpan === true;
  const colElements = Array.isArray(column?.elements) ? column.elements : [];
  const spans = Array.isArray(column?.spans) ? column.spans : [];

  const gridSpan = toGridSpan(resolveResponsiveGridSpan(column?.size, device));
  const gapPx = noColumnGap ? 0 : DEFAULT_GAP_PX;

  return (
    <div
      className="min-w-0"
      style={{
        gridColumn: `span ${gridSpan} / span ${gridSpan}`,
      }}
    >
      {isSpan ? (
        <div
          className="grid w-full min-w-0 grid-cols-12"
          style={{ columnGap: gapPx, rowGap: gapPx }}
        >
          {spans.map((span, spnI) => (
            <PreviewSpan
              key={span?.id || `span-${spnI}`}
              span={span}
              theme={theme}
              device={device}
              ids={{ conI, colI, spnI }}
              noColumnGap={noColumnGap}
            />
          ))}
        </div>
      ) : (
        <div
          className="h-full min-h-0 w-full min-w-0"
          style={{
            background: bg,
            borderRadius: Number(column?.borderRadius) || 0,
            borderWidth: Number(column?.borderWidth) || 0,
            borderStyle: "solid",
            borderColor,
            padding: `${Number(column?.paddingY) || 0}px ${Number(column?.paddingX) || 0}px`,
          }}
        >
          {colElements.map((element, eleI) => (
            <PreviewElement
              key={element?.id || `col-el-${eleI}`}
              element={element}
              theme={theme}
              device={device}
              ids={{ conI, colI, eleI }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const PreviewSection = ({ layout, theme, device, conI }) => {
  const container = layout?.container || {};
  const columns = Array.isArray(layout?.columns) ? layout.columns : [];
  const isFluid = container?.isFluid === true;
  const bg = resolveSurfaceBackground(container, theme);
  const noColumnGap = Boolean(container?.noColumnGap);
  const gapPx = noColumnGap ? 0 : 22;

  return (
    <section
      className="relative w-full"
      style={{
        background: bg,
      }}
    >
      {container?.backgroundImage ? (
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${container.backgroundImage})`, opacity: container?.opacityImage ?? 1 }}
          aria-hidden
        />
      ) : null}
      <div
        className={`${isFluid ? "w-full" : "container"} relative z-[1] mx-auto`}
        style={{
          paddingTop: Number(container?.paddingTop) || 0,
          paddingBottom: Number(container?.paddingBottom) || 0,
        }}
      >
        <div
          className="grid w-full min-w-0 grid-cols-12"
          style={{ columnGap: gapPx, rowGap: gapPx }}
        >
          {columns.map((column, colI) => (
            <PreviewColumn
              key={column?.id || `col-${conI}-${colI}`}
              column={column}
              theme={theme}
              device={device}
              conI={conI}
              colI={colI}
              noColumnGap={noColumnGap}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

function PreviewCanvas({ layouts = [], theme, device = "Desktop", auditMode = false }) {
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

  const renderQueue = useMemo(() => {
    const out = [];
    for (let i = 0; i < layouts.length; i += 1) {
      const item = layouts[i];
      if (!item) continue;
      const splitRowId = item?.splitRowId;
      if (!splitRowId || item?.splitSide !== "left") {
        out.push({ kind: "single", items: [{ layout: item, conI: i }] });
        continue;
      }
      const group = [{ layout: item, conI: i }];
      let j = i + 1;
      while (j < layouts.length && layouts[j]?.splitRowId === splitRowId) {
        group.push({ layout: layouts[j], conI: j });
        j += 1;
      }
      out.push({ kind: "split", items: group });
      i = j - 1;
    }
    return out;
  }, [layouts]);

  return (
    <div
      className="content-area min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-0"
      style={mobileSkeletonStyle}
    >
      <div className="w-full">
        {renderQueue.map((entry, idx) => {
          if (entry.kind === "single") {
            const item = entry.items[0];
            const deferOffscreenStyle =
              item.conI > 0
                ? {
                    contentVisibility: "auto",
                    containIntrinsicSize: "1px 900px",
                  }
                : undefined;
            return (
              <div
                key={`single-${item.layout?.container?.id || idx}`}
                className={!auditMode && item.conI > 0 ? "preview-feed-in" : ""}
                style={deferOffscreenStyle}
              >
                <PreviewSection
                  layout={item.layout}
                  theme={theme}
                  device={device}
                  conI={item.conI}
                />
              </div>
            );
          }
          return (
            <div key={`split-${idx}`} className={!auditMode ? "preview-feed-in" : ""}>
              <div className="flex w-full min-w-0">
                {entry.items.map((item) => (
                  <div
                    key={item.layout?.container?.id || item.conI}
                    className="min-w-0 flex-1"
                    style={
                      item.conI > 0
                        ? {
                            contentVisibility: "auto",
                            containIntrinsicSize: "1px 900px",
                          }
                        : undefined
                    }
                  >
                    <PreviewSection
                      layout={item.layout}
                      theme={theme}
                      device={device}
                      conI={item.conI}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PreviewCanvas;
