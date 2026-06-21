import { setColor, setFont } from "../../../../function";
import { Button, Box } from "@mui/material";
import { resolveImageLinkAttrs } from "./imageAspectConfig";
import {
  getButtonMuiSx,
  getButtonMuiVariant,
  getButtonOuterContainerSx,
  isButtonFullWidthEnabled,
  isButtonLinkIconDefined,
  isButtonSpecialTextEnabled,
  resolveButtonSpecialTextLabel,
  resolveButtonSpecialTextParagraph,
} from "./buttonElementConfig";
import { SegmentedRichTextInner } from "../../richText/SegmentedRichText";
import { normalizeParagraph } from "../../richText/richTextParagraphModel";
import IconAwsome from "../../IconAwsome";

const ButtonElement = ({ elementData, selected, hover, theme, builderMode }) => {
  const { id } = elementData;
  const label =
    typeof elementData?.label === "string" ? elementData.label : "Button Click";
  const isLayoutMode = builderMode === "Layout Mode";
  const variant = getButtonMuiVariant(elementData);
  const sx = getButtonMuiSx(elementData, theme, variant);
  const linkAttrs = resolveImageLinkAttrs(elementData);
  const lic = elementData?.linkIcon;
  const showLinkFaIcon = isButtonLinkIconDefined(lic);

  const fullW = isButtonFullWidthEnabled(elementData);
  const specialTextOn = isButtonSpecialTextEnabled(elementData);
  const inButtonRow =
    typeof elementData?.buttonRowGroupId === "string" &&
    elementData.buttonRowGroupId.trim() !== "";
  /** fit-content เฉพาะในแถว — โหมดออกแบบตัวเดี่ยวต้องกว้างเต็มคอลัมน์ถึงจะจัดซ้าย/กลาง/ขวาได้เหมือนโหมดแก้ไข */
  const hugOuter = !fullW && inButtonRow && !specialTextOn;
  const useLayoutSelectionFrame = isLayoutMode && selected;
  const specialTextFs = Number.isFinite(Number(elementData?.buttonFontSize))
    ? Number(elementData.buttonFontSize)
    : 14;
  const specialTextColor = setColor(theme, theme?.textColor?.[0], 255);
  const specialTextLabel = resolveButtonSpecialTextLabel(elementData);
  const specialTextParagraphRaw = resolveButtonSpecialTextParagraph(elementData);
  const specialTextParagraph =
    specialTextParagraphRaw &&
    Array.isArray(specialTextParagraphRaw.segments) &&
    specialTextParagraphRaw.segments.length > 0
      ? normalizeParagraph(specialTextParagraphRaw)
      : normalizeParagraph({
          type: "paragraph",
          alignClass: "text-start",
          segments: [
            { text: String(specialTextLabel ?? ""), classes: [], style: {} },
          ],
        });
  return (
    <Box
      sx={{
        ...getButtonOuterContainerSx(elementData),
        ...(hugOuter ? { width: "fit-content", maxWidth: "100%" } : {}),
        p: 0.5,
        lineHeight: specialTextOn ? 1.25 : 0,
        borderRadius: 2,
        boxSizing: "border-box",
        ...(isLayoutMode ? { userSelect: "none" } : {}),
      }}
      onMouseDownCapture={(e) => {
        if (!isLayoutMode) return;
        e.preventDefault();
      }}
      onMouseEnter={() => hover({ id })}
      onMouseLeave={() => hover(false)}
    >
      <Box
        className={`relative block ${specialTextOn || fullW ? "w-full max-w-full" : "w-fit max-w-full"}`}
      >
        <Box
          sx={{
            width: specialTextOn || fullW ? "100%" : "fit-content",
            maxWidth: "100%",
            ...(specialTextOn
              ? {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  columnGap: "12px",
                }
              : {}),
            ...(useLayoutSelectionFrame
              ? {
                  transform: "scale(0.94)",
                  transformOrigin: "center",
                  transition: "transform 150ms",
                }
              : {}),
          }}
        >
          {specialTextOn ? (
            <Box
              component="span"
              data-button-special-text="true"
              sx={{
                flex: "1 1 auto",
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                ...(!isLayoutMode ? { cursor: "pointer" } : {}),
              }}
            >
              <SegmentedRichTextInner
                paragraph={specialTextParagraph}
                baseStyle={{
                  color: specialTextColor,
                  fontSize: `${specialTextFs}px`,
                  fontFamily: setFont(theme?.text?.value),
                  fontWeight: 500,
                  lineHeight: 1.25,
                  margin: 0,
                }}
              />
            </Box>
          ) : null}
          <Button
            component={linkAttrs ? "a" : "button"}
            // href={linkAttrs?.href}
            target={linkAttrs?.target}
            rel={linkAttrs?.rel}
            variant={variant}
            disableElevation
            sx={{
              ...sx,
              flexShrink: 0,
              ...(specialTextOn ? { ml: "auto" } : {}),
              fontFamily: setFont(theme?.text.value),
              ...(isLayoutMode ? { pointerEvents: "none", userSelect: "none" } : {}),
            }}
          >
            {showLinkFaIcon ? (
              <Box
                component="span"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  verticalAlign: "middle",
                  mr: 0.75,
                  lineHeight: 0,
                }}
              >
                <IconAwsome
                  iconName={lic.name}
                  iconType={lic.type}
                  style={{ fontSize: "1.05em" }}
                />
              </Box>
            ) : null}
            {label}
          </Button>
        </Box>
        {useLayoutSelectionFrame && (
          <>
            <div className="pointer-events-none absolute left-[-6px] right-[-6px] top-[-10px] bottom-[-10px] rounded-md bg-red-300/10" />
            <span className="pointer-events-none absolute left-[-5px] top-[-9px] h-2.5 w-2.5 border-l-2 border-t-2 border-red-400" />
            <span className="pointer-events-none absolute right-[-5px] top-[-9px] h-2.5 w-2.5 border-r-2 border-t-2 border-red-400" />
            <span className="pointer-events-none absolute bottom-[-9px] left-[-5px] h-2.5 w-2.5 border-b-2 border-l-2 border-red-400" />
            <span className="pointer-events-none absolute bottom-[-9px] right-[-5px] h-2.5 w-2.5 border-b-2 border-r-2 border-red-400" />
          </>
        )}
      </Box>
    </Box>
  );
};

export default ButtonElement;
