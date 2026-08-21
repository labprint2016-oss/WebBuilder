import { Box } from "@mui/material";
import { ScanEye } from "lucide-react";
import IconAwsome from "../../IconAwsome";
import { resolveImageLinkAttrs } from "./imageAspectConfig";
import {
  ICON_ELEMENT_DEFAULTS,
  mergeIconElement,
  isValidFaIconRef,
  resolveIconBackgroundCss,
  resolveIconGlyphColor,
  resolveIconBorderCss,
  normalizeIconBorderStyle,
  normalizeIconBorderPosition,
  getIconOuterContainerSx,
  getIconShapeMetrics,
} from "./iconElementConfig";

const Icon = ({ elementData, selected, hover, theme, builderMode }) => {
  const { id } = elementData;
  const isLayoutMode = builderMode === "Layout Mode";
  const inIconRow =
    typeof elementData?.iconRowGroupId === "string" &&
    elementData.iconRowGroupId.trim() !== "";
  const hugOuter = inIconRow;
  const s = mergeIconElement(elementData);
  const marginTopRaw = Number(s.iconMarginTop);
  const marginBottomRaw = Number(s.iconMarginBottom);
  const marginTopPx = Number.isFinite(marginTopRaw)
    ? marginTopRaw
    : ICON_ELEMENT_DEFAULTS.iconMarginTop;
  const marginBottomPx = Number.isFinite(marginBottomRaw)
    ? marginBottomRaw
    : ICON_ELEMENT_DEFAULTS.iconMarginBottom;
  const bg = resolveIconBackgroundCss(elementData, theme);
  const fg = resolveIconGlyphColor(elementData, theme);
  const size = Number(s.iconSize);
  const iconSizePx = Number.isFinite(size) ? size : 28;
  const metrics = getIconShapeMetrics(elementData);
  const {
    containerPx,
    borderWidthPx,
    gap,
    centerWrapSize,
    fillRadius: borderRadius,
    outerRadius,
    insetRadius: insetRingBorderRadius,
    centerOuterRadius: centerOuterRingBorderRadius,
  } = metrics;
  const fa = s.faIcon;
  const showFa = isValidFaIconRef(fa);

  const borderEnabled = s.borderEnabled !== false;
  const borderColorCss =
    borderWidthPx > 0 ? resolveIconBorderCss(elementData, theme) : "transparent";
  const borderStyleCss = normalizeIconBorderStyle(s.borderStyle);
  const borderPos = normalizeIconBorderPosition(s.borderPosition);
  const hasBorder = borderEnabled && borderWidthPx > 0;
  const borderCss = `${borderWidthPx}px ${borderStyleCss} ${borderColorCss}`;
  const centerFillInset = borderWidthPx / 2;

  const innerBoxSx = {
    width: containerPx,
    height: containerPx,
    minWidth: containerPx,
    minHeight: containerPx,
    borderRadius,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: borderEnabled ? bg : "transparent",
    boxSizing: "border-box",
  };

  const useLayoutSelectionFrame = isLayoutMode && selected;
  const useSelectionFrame = Boolean(selected);

  const glyphBox = (
    <Box
      data-icon-glyph-id={id}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: 0,
        width: iconSizePx,
        height: iconSizePx,
        fontSize: iconSizePx,
      }}
    >
      {showFa ? (
        <IconAwsome
          iconName={fa.name}
          iconType={fa.type}
          style={{
            fontSize: "inherit",
            width: "1em",
            height: "1em",
            color: fg,
          }}
        />
      ) : (
        <ScanEye
          style={{ width: "1em", height: "1em", color: fg }}
        />
      )}
    </Box>
  );

  const linkAttrs = resolveImageLinkAttrs(elementData);

  return (
    <Box
      component={linkAttrs ? "a" : "div"}
      data-icon-wrap-id={id}
      href={linkAttrs?.href}
      target={linkAttrs?.target}
      rel={linkAttrs?.rel}
      onMouseEnter={() => hover({ id })}
      onMouseLeave={() => hover(false)}
      sx={{
        ...getIconOuterContainerSx(elementData),
        ...(hugOuter ? { width: "fit-content", maxWidth: "100%" } : {}),
        marginTop: `${marginTopPx}px`,
        marginBottom: `${marginBottomPx}px`,
        textDecoration: "none",
        color: "inherit",
        lineHeight: 0,
        ...(isLayoutMode ? { userSelect: "none" } : {}),
      }}
    >
      <Box
        data-icon-hover-target="true"
        sx={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
      >
        <Box
          sx={
            useLayoutSelectionFrame
              ? {
                  transform: "scale(0.94)",
                  transformOrigin: "center",
                  transition: "transform 150ms",
                }
              : undefined
          }
        >
          {!borderEnabled ? (
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {glyphBox}
            </Box>
          ) : hasBorder && borderPos === "outside" ? (
            <Box
              data-icon-radius-id={id}
              data-icon-radius-kind="outer"
              data-icon-border-id={id}
              sx={{
                width: containerPx + 2 * gap + 2 * borderWidthPx,
                height: containerPx + 2 * gap + 2 * borderWidthPx,
                minWidth: containerPx + 2 * gap + 2 * borderWidthPx,
                minHeight: containerPx + 2 * gap + 2 * borderWidthPx,
                boxSizing: "border-box",
                border: borderCss,
                borderRadius: outerRadius,
                padding: `${gap}px`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                data-icon-fill-id={id}
                data-icon-radius-id={id}
                data-icon-radius-kind="fill"
                sx={innerBoxSx}
              >
                {glyphBox}
              </Box>
            </Box>
          ) : hasBorder && borderPos === "inside" ? (
            <Box
              data-icon-fill-id={id}
              data-icon-radius-id={id}
              data-icon-radius-kind="fill"
              sx={{
                ...innerBoxSx,
                position: "relative",
              }}
            >
              {/* แหวนกรอบอยู่ในพื้นที่สี — เว้นขอบจากขอบนอก gap px (เหมือน ref เส้นจุดในวง) */}
              <Box
                aria-hidden
                data-icon-radius-id={id}
                data-icon-radius-kind="inset"
                data-icon-border-id={id}
                sx={{
                  position: "absolute",
                  inset: `${gap}px`,
                  boxSizing: "border-box",
                  border: borderCss,
                  borderRadius: insetRingBorderRadius,
                  pointerEvents: "none",
                }}
              />
              <Box sx={{ position: "relative", zIndex: 1 }}>{glyphBox}</Box>
            </Box>
          ) : hasBorder && borderPos === "center" ? (
            <Box
              sx={{
                width: centerWrapSize,
                height: centerWrapSize,
                minWidth: centerWrapSize,
                minHeight: centerWrapSize,
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                aria-hidden
                data-icon-radius-id={id}
                data-icon-radius-kind="fill"
                sx={{
                  position: "absolute",
                  inset: `${centerFillInset}px`,
                  borderRadius,
                  backgroundColor: borderEnabled ? bg : "transparent",
                  pointerEvents: "none",
                }}
              />
              <Box
                aria-hidden
                data-icon-radius-id={id}
                data-icon-radius-kind="center-outer"
                data-icon-border-id={id}
                sx={{
                  position: "absolute",
                  inset: 0,
                  boxSizing: "border-box",
                  border: borderCss,
                  borderRadius: centerOuterRingBorderRadius,
                  pointerEvents: "none",
                }}
              />
              <Box sx={{ position: "relative", zIndex: 1 }}>{glyphBox}</Box>
            </Box>
          ) : (
            <Box
              data-icon-fill-id={id}
              data-icon-radius-id={id}
              data-icon-radius-kind="fill"
              sx={{ ...innerBoxSx }}
            >
              {glyphBox}
            </Box>
          )}
        </Box>
        {useSelectionFrame && (
          <>
            <div className="pointer-events-none absolute left-[-8px] right-[-8px] top-[-4px] bottom-[-4px] rounded-md bg-red-300/10" />
            <span className="pointer-events-none absolute left-[-7px] top-[-3px] h-2.5 w-2.5 border-l-2 border-t-2 border-red-400" />
            <span className="pointer-events-none absolute right-[-7px] top-[-3px] h-2.5 w-2.5 border-r-2 border-t-2 border-red-400" />
            <span className="pointer-events-none absolute bottom-[-3px] left-[-7px] h-2.5 w-2.5 border-b-2 border-l-2 border-red-400" />
            <span className="pointer-events-none absolute bottom-[-3px] right-[-7px] h-2.5 w-2.5 border-b-2 border-r-2 border-red-400" />
          </>
        )}
      </Box>
    </Box>
  );
};

export default Icon;
