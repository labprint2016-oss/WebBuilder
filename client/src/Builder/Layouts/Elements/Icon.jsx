import { Box } from "@mui/material";
import { ScanEye } from "lucide-react";
import IconAwsome from "../../IconAwsome";
import { resolveImageLinkAttrs } from "./imageAspectConfig";
import {
  ICON_ELEMENT_DEFAULTS,
  ICON_STANDALONE_CONTAINER_MAX,
  ICON_STANDALONE_CONTAINER_MIN,
  mergeIconElement,
  isValidFaIconRef,
  resolveIconBackgroundCss,
  resolveIconGlyphColor,
  resolveIconBorderCss,
  normalizeIconBorderStyle,
  normalizeIconBorderPosition,
  getIconOuterContainerSx,
} from "./iconElementConfig";

/** ระยะว่างระหว่างพื้นหลังไอคอนกับเส้นกรอบ (px) รอบด้าน */
const ICON_BORDER_OUTSET_GAP_PX = 5;

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
  const cs = Number(s.containerSize);
  const containerPx = Number.isFinite(cs)
    ? Math.max(
        ICON_STANDALONE_CONTAINER_MIN,
        Math.min(ICON_STANDALONE_CONTAINER_MAX, cs)
      )
    : ICON_ELEMENT_DEFAULTS.containerSize;
  const fa = s.faIcon;
  const showFa = isValidFaIconRef(fa);
  const shape = s.iconShape === "rounded" ? "rounded" : "circle";
  const r = Number(s.iconCornerRadius);
  const radiusPx = Number.isFinite(r) ? r : 12;
  const borderRadius =
    shape === "circle" ? "50%" : `${Math.min(radiusPx, containerPx / 2)}px`;

  const bw = Number(s.borderWidth);
  const borderWidthPx = Number.isFinite(bw)
    ? Math.max(0, Math.min(6, bw))
    : 0;
  const borderEnabled = s.borderEnabled !== false;
  const borderColorCss =
    borderWidthPx > 0 ? resolveIconBorderCss(elementData, theme) : "transparent";
  const borderStyleCss = normalizeIconBorderStyle(s.borderStyle);
  const borderPos = normalizeIconBorderPosition(s.borderPosition);
  const hasBorder = borderEnabled && borderWidthPx > 0;
  const gap = ICON_BORDER_OUTSET_GAP_PX;
  const borderCss = `${borderWidthPx}px ${borderStyleCss} ${borderColorCss}`;
  /** มุมโค้งของแหวนกรอบด้านใน (ซ้อนใน fill สีพื้นหลัง) */
  const insetRingBorderRadius =
    shape === "circle"
      ? "50%"
      : `${Math.max(
          0,
          Math.min(radiusPx - gap, (containerPx - 2 * gap) / 2)
        )}px`;

  /** ตรงกลาง: ขนาดรวมให้เส้นกรอบคร่อมขอบ fill ครึ่งใน / ครึ่งนอก */
  const centerWrapSize = containerPx + borderWidthPx;
  const centerOuterRingBorderRadius =
    shape === "circle"
      ? "50%"
      : `${Math.min(
          radiusPx + borderWidthPx / 2,
          centerWrapSize / 2
        )}px`;
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
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: 0,
      }}
    >
      {showFa ? (
        <IconAwsome
          iconName={fa.name}
          iconType={fa.type}
          style={{ fontSize: iconSizePx, color: fg }}
        />
      ) : (
        <ScanEye size={iconSizePx} style={{ color: fg }} />
      )}
    </Box>
  );

  const linkAttrs = resolveImageLinkAttrs(elementData);

  return (
    <Box
      component={linkAttrs ? "a" : "div"}
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
              sx={{
                width: containerPx + 2 * gap + 2 * borderWidthPx,
                height: containerPx + 2 * gap + 2 * borderWidthPx,
                minWidth: containerPx + 2 * gap + 2 * borderWidthPx,
                minHeight: containerPx + 2 * gap + 2 * borderWidthPx,
                boxSizing: "border-box",
                border: borderCss,
                borderRadius:
                  shape === "circle"
                    ? "50%"
                    : `${Math.min(
                        radiusPx + gap + borderWidthPx,
                        (containerPx + 2 * gap + 2 * borderWidthPx) / 2
                      )}px`,
                padding: `${gap}px`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box sx={innerBoxSx}>{glyphBox}</Box>
            </Box>
          ) : hasBorder && borderPos === "inside" ? (
            <Box
              sx={{
                ...innerBoxSx,
                position: "relative",
              }}
            >
              {/* แหวนกรอบอยู่ในพื้นที่สี — เว้นขอบจากขอบนอก gap px (เหมือน ref เส้นจุดในวง) */}
              <Box
                aria-hidden
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
            <Box sx={{ ...innerBoxSx }}>{glyphBox}</Box>
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
