import { setColor, setFont } from "../../../../function";
import { Button, ButtonGroup, Box } from "@mui/material";
import { resolveButtonDualSlotLinkAttrs } from "./imageAspectConfig";
import {
  getButtonMuiSx,
  getButtonMuiVariant,
  getButtonOuterContainerSx,
  getButtonGroupOutlinedFrameSx,
  isButtonFullWidthEnabled,
  isButtonLinkIconDefined,
  isButtonSpecialTextEnabled,
  resolveButtonSpecialTextLabel,
  resolveButtonSpecialTextParagraph,
} from "./buttonElementConfig";
import { SegmentedRichTextInner } from "../../richText/SegmentedRichText";
import { normalizeParagraph } from "../../richText/richTextParagraphModel";
import IconAwsome from "../../IconAwsome";

const ButtonGroupElement = ({
  elementData,
  selected,
  hover,
  theme,
  builderMode,
}) => {
  const { id } = elementData;
  const isLayoutMode = builderMode === "Layout Mode";
  const variant = getButtonMuiVariant(elementData);
  const sx1 = getButtonMuiSx(elementData, theme, variant, 1);
  const sx2 = getButtonMuiSx(elementData, theme, variant, 2);
  const full = isButtonFullWidthEnabled(elementData);
  const specialTextOn = isButtonSpecialTextEnabled(elementData);
  const link1 = resolveButtonDualSlotLinkAttrs(elementData, 1);
  const link2 = resolveButtonDualSlotLinkAttrs(elementData, 2);
  const label1 =
    typeof elementData?.label === "string"
      ? elementData.label
      : "Button Click";
  const label2 =
    typeof elementData?.label2 === "string"
      ? elementData.label2
      : "Button Click";
  const lic1 = elementData?.linkIcon;
  const lic2 = elementData?.linkIcon2;
  const showIcon1 = isButtonLinkIconDefined(lic1);
  const showIcon2 = isButtonLinkIconDefined(lic2);

  const childSx1 = {
    ...sx1,
    fontFamily: setFont(theme?.text.value),
    ...(full ? { flex: 1, minWidth: 0 } : {}),
  };
  const childSx2 = {
    ...sx2,
    fontFamily: setFont(theme?.text.value),
    ...(full ? { flex: 1, minWidth: 0 } : {}),
  };

  const inButtonRow =
    typeof elementData?.buttonRowGroupId === "string" &&
    elementData.buttonRowGroupId.trim() !== "";
  /** fit-content เฉพาะในแถวปุ่ม — ตัวเดี่ยวให้กว้างเต็มคอลัมน์เพื่อจัดซ้าย/กลาง/ขวาเหมือนโหมดแก้ไข (เดียวกับ Button.jsx) */
  const hugOuter = !full && inButtonRow && !specialTextOn;
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
        ...(isLayoutMode && hugOuter
          ? { width: "fit-content", maxWidth: "100%" }
          : {}),
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
        className={`relative block ${full ? "w-full max-w-full" : "w-fit max-w-full"}`}
      >
        <Box
          sx={{
            width: full ? "100%" : "fit-content",
            maxWidth: "100%",
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
                flex: "0 1 auto",
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
          <ButtonGroup
            aria-label="ปุ่มคู่"
            disableElevation
            sx={{
              width: full ? "100%" : "auto",
              boxShadow: "none",
              "& .MuiButton-root": { boxShadow: "none" },
              ...getButtonGroupOutlinedFrameSx(elementData, theme),
            }}
          >
            <Button
              component={link1 ? "a" : "button"}
              // href={link1?.href}
              target={link1?.target}
              rel={link1?.rel}
              variant={variant}
              disableElevation
              sx={childSx1}
            >
              {showIcon1 ? (
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
                    iconName={lic1.name}
                    iconType={lic1.type}
                    style={{ fontSize: "1.05em" }}
                  />
                </Box>
              ) : null}
              {label1}
            </Button>
            <Button
              component={link2 ? "a" : "button"}
              // href={link2?.href}
              target={link2?.target}
              rel={link2?.rel}
              variant={variant}
              disableElevation
              sx={childSx2}
            >
              {showIcon2 ? (
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
                    iconName={lic2.name}
                    iconType={lic2.type}
                    style={{ fontSize: "1.05em" }}
                  />
                </Box>
              ) : null}
              {label2}
            </Button>
          </ButtonGroup>
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

export default ButtonGroupElement;
