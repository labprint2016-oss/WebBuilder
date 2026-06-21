import React, { useMemo } from "react";
import { setColor } from "../../function";
import Element from "./Layouts/Element";

const DEFAULT_COL_SIZE = 12;

const toPercent = (size) => {
  const n = Number(size);
  const safe = Number.isFinite(n) ? Math.min(12, Math.max(1, n)) : DEFAULT_COL_SIZE;
  return `${(safe / 12) * 100}%`;
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

const PreviewSpan = ({ span, theme, device, ids, noColumnGap }) => {
  const bg = resolveSurfaceBackground(span, theme);
  const borderColor = resolveSurfaceBorder(span, theme);
  const spanElements = Array.isArray(span?.elements) ? span.elements : [];
  return (
    <div className="w-full min-w-0">
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
        {spanElements.map((element, eleI) => (
          <PreviewElement
            key={element?.id || `spn-el-${eleI}`}
            element={element}
            theme={theme}
            device={device}
            ids={{ ...ids, eleI }}
          />
        ))}
      </div>
      {!noColumnGap && <div className="h-[22px]" aria-hidden />}
    </div>
  );
};

const PreviewColumn = ({ column, theme, device, conI, colI, noColumnGap }) => {
  const bg = resolveSurfaceBackground(column, theme);
  const borderColor = resolveSurfaceBorder(column, theme);
  const isSpan = column?.isSpan === true;
  const colElements = Array.isArray(column?.elements) ? column.elements : [];
  const spans = Array.isArray(column?.spans) ? column.spans : [];

  return (
    <div
      className="min-w-0"
      style={{
        width: toPercent(column?.size),
        flex: `0 0 ${toPercent(column?.size)}`,
      }}
    >
      {isSpan ? (
        <div className={`min-h-[40px] ${noColumnGap ? "space-y-0" : "space-y-0"}`}>
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
        <div className="flex w-full min-w-0 flex-wrap" style={{ columnGap: gapPx, rowGap: gapPx }}>
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
    <div className="content-area min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-0">
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
