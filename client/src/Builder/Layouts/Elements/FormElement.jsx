import React, { useEffect, useRef, useState } from "react";
import { AlertCircle, Check } from "lucide-react";
import { setColor, setFont } from "../../../../function";
import IconAwsome from "../../IconAwsome";
import { usePanelPreview } from "../../panelPreviewStore";
import { isValidFaIconRef } from "./iconElementConfig";
import {
  DEFAULT_TEL_PLACEHOLDER,
  formatThaiPhoneDisplay,
} from "../../formPhoneValidation";

const renderOptions = (options, fallbackPrefix) => {
  if (Array.isArray(options) && options.length > 0) return options;
  return [`${fallbackPrefix} 1`, `${fallbackPrefix} 2`];
};
const clampOpacity = (raw, fallback = 255) => {
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(255, Math.round(n)));
};
const normalizeColorRef = (raw, fallback) => {
  if (typeof raw === "string" && raw.trim()) return raw;
  if (
    raw &&
    typeof raw === "object" &&
    typeof raw.type === "string" &&
    Number.isFinite(Number(raw.index))
  ) {
    return { type: raw.type, index: Number(raw.index) };
  }
  return fallback;
};

function FormElement(props) {
  const preview = usePanelPreview(
    "FormElement",
    String(props.elementData?.id || "form-element")
  );
  if (!props?.elementData) return null;
  return (
    <FormElementView
      {...props}
      elementData={preview || props.elementData}
    />
  );
}

function FormElementView({
  elementData,
  selected,
  hover,
  theme,
  builderMode,
  outerSpacing = true,
  interactive = false,
  onFieldChange = null,
  onSubmitClick = null,
  submitPending = false,
  submitMessage = "",
  submitMessageKind = "",
  /** Override options for cascading Select */
  selectOptions = null,
  /** Force Select disabled (design cascade) */
  selectDisabled = false,
  /** Hide entire field (website cascade) */
  fieldHidden = false,
  /** Controlled clear signal for cascaded resets */
  selectResetKey = 0,
  /** Design-page: show checkboxes to link options into conditional rules */
  selectRelationEdit = false,
  /** Currently linked option labels (relation edit) */
  linkedSelectOptions = null,
  /** (option, enabled) => void */
  onToggleLinkedOption = null,
  /** Controlled display value (e.g. computed Sum) */
  controlledValue = undefined,
  /** Website form: required field empty after submit attempt */
  fieldInvalid = false,
}) {
  const { id } = elementData;
  const type = String(elementData?.type || "");
  const isInteractive = interactive === true;
  const [textValue, setTextValue] = useState("");
  const [selectValue, setSelectValue] = useState("");
  const [selectOpen, setSelectOpen] = useState(false);
  const [selectHoverIndex, setSelectHoverIndex] = useState(null);
  const [radioValue, setRadioValue] = useState("");
  const [checkboxValues, setCheckboxValues] = useState({});
  const selectRootRef = useRef(null);
  const onFieldChangeRef = useRef(onFieldChange);
  onFieldChangeRef.current = onFieldChange;

  const emitFieldChange = (value) => {
    if (typeof onFieldChangeRef.current !== "function") return;
    onFieldChangeRef.current({
      fieldId: id,
      type,
      label:
        typeof elementData?.label === "string" && elementData.label.trim()
          ? elementData.label.trim()
          : "Field",
      value,
    });
  };

  useEffect(() => {
    setTextValue("");
    setSelectValue("");
    setSelectOpen(false);
    setSelectHoverIndex(null);
    setRadioValue("");
    setCheckboxValues({});
  }, [id, isInteractive]);

  useEffect(() => {
    if (type !== "frmSelect") return;
    setSelectValue("");
    setSelectOpen(false);
    setSelectHoverIndex(null);
  }, [selectResetKey, type]);

  useEffect(() => {
    if (type !== "frmSelect" || !selectValue) return;
    const options = Array.isArray(selectOptions)
      ? selectOptions
      : renderOptions(elementData?.options, "Option");
    if (!options.includes(selectValue)) {
      setSelectValue("");
      setSelectOpen(false);
      if (typeof onFieldChangeRef.current === "function") {
        onFieldChangeRef.current({
          fieldId: id,
          type,
          label:
            typeof elementData?.label === "string" && elementData.label.trim()
              ? elementData.label.trim()
              : "Field",
          value: "",
        });
      }
    }
  }, [selectOptions, type, selectValue, id, elementData?.label, elementData?.options]);

  useEffect(() => {
    if (!selectOpen) return undefined;
    const onPointerDown = (event) => {
      if (!selectRootRef.current?.contains(event.target)) {
        setSelectOpen(false);
        setSelectHoverIndex(null);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectOpen(false);
        setSelectHoverIndex(null);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [selectOpen]);

  const label =
    typeof elementData?.label === "string" && elementData.label.trim()
      ? elementData.label
      : "Field Label";
  const isNumberInput = type === "frmNum" || type === "frmSum";
  const isSumReadOnly = type === "frmSum";
  const validationType =
    type === "frmInput" ? String(elementData?.formValidationType || "none") : "none";
  const isTelValidation = type === "frmInput" && validationType === "tel";
  const sumUnit =
    typeof elementData?.placeholder === "string"
      ? elementData.placeholder.trim()
      : "";
  const inputPlaceholder =
    typeof elementData?.placeholder === "string" && elementData.placeholder.trim()
      ? elementData.placeholder
      : isSumReadOnly
        ? "Unit"
        : isNumberInput
          ? "0"
          : isTelValidation
            ? DEFAULT_TEL_PLACEHOLDER
            : "Type your message...";
  const sumDisplayValue = (() => {
    if (!isSumReadOnly) return "";
    const raw =
      controlledValue != null && String(controlledValue).trim() !== ""
        ? String(controlledValue).trim()
        : "";
    if (raw && sumUnit) return `${raw} ${sumUnit}`;
    if (raw) return raw;
    return sumUnit;
  })();
  const textareaPlaceholder =
    typeof elementData?.placeholder === "string"
      ? elementData.placeholder
      : "Type your message...";
  const selectPlaceholder =
    typeof elementData?.placeholder === "string"
      ? elementData.placeholder
      : "Select an option";
  const labelIcon = isValidFaIconRef(elementData?.labelIcon) ? elementData.labelIcon : null;
  const isRequired = elementData?.formRequired === true;
  const isLayoutMode = builderMode === "Layout Mode";
  // โหมดออกแบบ: อย่าใส่ pointer-events-none ทั้งก้อน — ไม่งั้น double-click ทะลุไปที่ Col
  // ใช้ select-none ที่เปลือก และกัน interaction ที่ตัวควบคุมแทน
  const shellClass =
    isLayoutMode && !isInteractive ? "select-none" : "";
  const controlsPeClass =
    isLayoutMode && !isInteractive ? "pointer-events-none" : "";
  const labelColorRef = normalizeColorRef(
    elementData?.formLabelColor,
    theme?.textColor?.[0] ?? "#334155"
  );
  const placeholderColorRef = normalizeColorRef(
    elementData?.formPlaceholderColor,
    "#94a3b8"
  );
  const iconColorRef = normalizeColorRef(elementData?.formIconColor, "#94a3b8");
  const backgroundColorRef = normalizeColorRef(elementData?.formBackgroundColor, "#ffffff");
  const borderColorRef = normalizeColorRef(elementData?.formBorderColor, "#94a3b8");
  const labelColor =
    setColor(theme, labelColorRef, clampOpacity(elementData?.formLabelColorOpacity, 255)) ||
    "#334155";
  const placeholderColor =
    setColor(
      theme,
      placeholderColorRef,
      clampOpacity(elementData?.formPlaceholderColorOpacity, 255)
    ) || "#94a3b8";
  const iconColor =
    setColor(theme, iconColorRef, clampOpacity(elementData?.formIconColorOpacity, 255)) ||
    "#94a3b8";
  const fieldBackgroundColor =
    setColor(
      theme,
      backgroundColorRef,
      clampOpacity(
        elementData?.formBackgroundColorOpacity,
        type === "frmSubmit" || type === "frmSelect" ? 255 : 230
      )
    ) || "rgba(255,255,255,0.9)";
  const borderColor =
    setColor(
      theme,
      borderColorRef,
      clampOpacity(elementData?.formBorderColorOpacity, type === "frmSubmit" ? 255 : 140)
    ) || "rgba(148,163,184,0.55)";
  const submitBg =
    fieldBackgroundColor ||
    setColor(theme, theme?.mainColor?.[1], 255) ||
    "#334155";
  const submitTextColor = labelColor || "#ffffff";
  const submitIconColor = borderColor || "#ffffff";
  const optionColorRef = normalizeColorRef(
    elementData?.formOptionColor,
    theme?.mainColor?.[0] ?? theme?.mainColor?.[1] ?? "#334155"
  );
  const optionAccentColor =
    setColor(
      theme,
      optionColorRef,
      clampOpacity(elementData?.formOptionColorOpacity, 255)
    ) ||
    setColor(theme, theme?.mainColor?.[0] ?? theme?.mainColor?.[1], 255) ||
    borderColor ||
    "#334155";
  const optionTextColorRef = normalizeColorRef(
    elementData?.formOptionTextColor,
    elementData?.formLabelColor ?? theme?.textColor?.[0] ?? "#334155"
  );
  const optionTextColor =
    setColor(
      theme,
      optionTextColorRef,
      clampOpacity(elementData?.formOptionTextColorOpacity, 255)
    ) || labelColor;
  const optionHoverColorRef = normalizeColorRef(
    elementData?.formOptionHoverColor,
    elementData?.formOptionColor ??
      theme?.mainColor?.[0] ??
      theme?.mainColor?.[1] ??
      "#334155"
  );
  const optionHoverColor =
    setColor(
      theme,
      optionHoverColorRef,
      clampOpacity(elementData?.formOptionHoverColorOpacity, 40)
    ) ||
    `color-mix(in srgb, ${optionAccentColor} 10%, transparent)`;
  const optionActiveColorRef = normalizeColorRef(
    elementData?.formOptionActiveColor,
    elementData?.formOptionColor ??
      theme?.mainColor?.[0] ??
      theme?.mainColor?.[1] ??
      "#334155"
  );
  const optionActiveColor =
    setColor(
      theme,
      optionActiveColorRef,
      clampOpacity(elementData?.formOptionActiveColorOpacity, 56)
    ) ||
    `color-mix(in srgb, ${optionAccentColor} 18%, transparent)`;
  const themeTextClass =
    typeof theme?.text?.value === "string" && theme.text.value.trim()
      ? theme.text.value.trim()
      : typeof theme?.text === "string" && theme.text.trim()
        ? theme.text.trim()
        : "";
  const inputFont = setFont(themeTextClass || theme?.text?.value) || undefined;
  const labelFontSize = Number.isFinite(Number(elementData?.formLabelFontSize))
    ? Math.max(10, Math.min(36, Math.round(Number(elementData.formLabelFontSize))))
    : 12;
  const placeholderFontSize = Number.isFinite(Number(elementData?.formPlaceholderFontSize))
    ? Math.max(10, Math.min(36, Math.round(Number(elementData.formPlaceholderFontSize))))
    : 12;
  const formFieldSpacingClass = outerSpacing === false ? "my-0" : "my-2";
  const themeTextStyle = {
    fontFamily: inputFont,
  };
  const useLayoutSelectionFrame = isLayoutMode && selected;
  const shellSelectionFrameClass = useLayoutSelectionFrame
    ? "relative block w-full max-w-full"
    : "relative block w-full";
  const selectedContentScaleClass = useLayoutSelectionFrame
    ? "origin-center scale-[0.94] transform-gpu transition-transform duration-150"
    : "";
  const selectedFrameInnerBottomSpaceClass = useLayoutSelectionFrame ? "pb-[6px]" : "";

  if (fieldHidden) return null;

  if (type === "frmText") {
    const textShellClass =
      outerSpacing === false
        ? `w-full ${formFieldSpacingClass} ${shellClass}`
        : `flex h-full min-h-full w-full flex-1 items-center ${formFieldSpacingClass} ${shellClass}`;
    const spacingTop = Number.isFinite(Number(elementData?.formTextSpacingTop))
      ? Math.max(0, Math.min(48, Math.round(Number(elementData.formTextSpacingTop))))
      : 0;
    const spacingBottom = Number.isFinite(Number(elementData?.formTextSpacingBottom))
      ? Math.max(0, Math.min(48, Math.round(Number(elementData.formTextSpacingBottom))))
      : 0;
    const showTextDivider = elementData?.formTextDivider === true;
    const textDividerStyle = ["solid", "dashed", "dotted"].includes(
      String(elementData?.formTextDividerStyle || "")
    )
      ? String(elementData.formTextDividerStyle)
      : "solid";
    return (
      <div
        className={textShellClass}
        onMouseEnter={() => hover?.({ id })}
        onMouseLeave={() => hover?.(false)}
      >
        <div className={`${shellSelectionFrameClass} w-full`}>
          <div className={`${selectedContentScaleClass} ${selectedFrameInnerBottomSpaceClass}`}>
            <div
              className={`flex w-full items-center ${themeTextClass}`}
              style={{
                ...themeTextStyle,
                color: labelColor,
                paddingTop: `${spacingTop}px`,
                paddingBottom: `${spacingBottom}px`,
              }}
            >
              <span
                className="shrink-0 text-left leading-snug"
                style={{
                  color: "inherit",
                  fontSize: `${labelFontSize}px`,
                }}
              >
                {label || "ข้อความ"}
              </span>
              {showTextDivider ? (
                <div
                  className="ml-2 h-0 min-w-0 flex-1 border-b"
                  style={{
                    borderBottomWidth: "1px",
                    borderBottomStyle: textDividerStyle,
                    borderBottomColor: "currentColor",
                  }}
                />
              ) : null}
            </div>
          </div>
          {useLayoutSelectionFrame && (
            <>
              <div className="pointer-events-none absolute left-[-7px] right-[-7px] top-[-6px] bottom-[-6px] rounded-md bg-red-300/10" />
              <span className="pointer-events-none absolute left-[-5px] top-[-5px] h-2.5 w-2.5 border-l-2 border-t-2 border-red-400" />
              <span className="pointer-events-none absolute right-[-5px] top-[-5px] h-2.5 w-2.5 border-r-2 border-t-2 border-red-400" />
              <span className="pointer-events-none absolute bottom-[-5px] left-[-5px] h-2.5 w-2.5 border-b-2 border-l-2 border-red-400" />
              <span className="pointer-events-none absolute bottom-[-5px] right-[-5px] h-2.5 w-2.5 border-b-2 border-r-2 border-red-400" />
            </>
          )}
        </div>
      </div>
    );
  }

  if (type === "frmSubmit") {
    const submitScaleClass = useLayoutSelectionFrame
      ? "origin-left scale-[0.94] transform-gpu transition-transform duration-150"
      : "";
    const successIcon = isValidFaIconRef(elementData?.formSuccessIcon)
      ? elementData.formSuccessIcon
      : null;
    const successLabelColorRef = normalizeColorRef(
      elementData?.formSuccessLabelColor,
      "#059669"
    );
    const successIconColorRef = normalizeColorRef(
      elementData?.formSuccessIconColor,
      "#059669"
    );
    const successBackgroundColorRef = normalizeColorRef(
      elementData?.formSuccessBackgroundColor,
      "#ecfdf5"
    );
    const successTextColor =
      setColor(
        theme,
        successLabelColorRef,
        clampOpacity(elementData?.formSuccessLabelColorOpacity, 255)
      ) || "#059669";
    const successIconColor =
      setColor(
        theme,
        successIconColorRef,
        clampOpacity(elementData?.formSuccessIconColorOpacity, 255)
      ) || successTextColor;
    const successBackgroundColor =
      setColor(
        theme,
        successBackgroundColorRef,
        clampOpacity(elementData?.formSuccessBackgroundColorOpacity, 255)
      ) || "#ecfdf5";
    const configuredSuccessMessage =
      typeof elementData?.formSuccessMessage === "string" &&
      elementData.formSuccessMessage.trim()
        ? elementData.formSuccessMessage.trim()
        : "ส่งข้อความเรียบร้อยแล้ว ขอบคุณมากค่ะ";
    const showSuccessPreview =
      isLayoutMode &&
      !submitMessage &&
      elementData?.formSuccessPreview === true;
    const showSuccessMessage =
      submitMessageKind === "success" && Boolean(submitMessage);
    const successDisplayText = showSuccessMessage
      ? submitMessage
      : showSuccessPreview
        ? configuredSuccessMessage
        : "";
    const renderSubmitErrorBanner = (message) => (
      <div
        role="alert"
        className={`form-error-message-enter mt-2 flex w-full items-start gap-2 rounded-md border px-3 py-2.5 ${themeTextClass}`}
        style={{
          ...themeTextStyle,
          color: "#b91c1c",
          backgroundColor: "#fef2f2",
          borderColor: "rgba(239, 68, 68, 0.28)",
          fontSize: `${labelFontSize}px`,
        }}
      >
        <AlertCircle
          size={Math.max(15, labelFontSize + 1)}
          strokeWidth={2.25}
          className="mt-0.5 shrink-0"
          style={{ color: "#dc2626" }}
          aria-hidden
        />
        <span className="min-w-0 flex-1 leading-snug">{message}</span>
      </div>
    );
    return (
      <div
        className={`flex w-full justify-start text-left ${formFieldSpacingClass} ${shellClass}`}
        onMouseEnter={() => hover?.({ id })}
        onMouseLeave={() => hover?.(false)}
      >
        <div className="relative w-full">
          <div
            className={`${submitScaleClass} ${selectedFrameInnerBottomSpaceClass} ${controlsPeClass} flex w-full flex-col items-stretch`}
          >
            <button
              type="button"
              disabled={!isInteractive || submitPending}
              onClick={() => {
                if (!isInteractive || submitPending) return;
                onSubmitClick?.();
              }}
              className={`inline-flex min-h-[40px] min-w-[140px] w-auto shrink-0 self-start items-center justify-center gap-2 rounded-md px-4 py-2 font-semibold ${themeTextClass} ${
                !isInteractive || submitPending ? "opacity-70" : ""
              }`}
              style={{
                ...themeTextStyle,
                backgroundColor: submitBg,
                color: submitTextColor,
                fontSize: `${labelFontSize}px`,
              }}
            >
              {labelIcon ? (
                <IconAwsome
                  iconName={labelIcon.name}
                  iconType={labelIcon.type}
                  style={{ fontSize: Math.max(14, labelFontSize + 2), color: submitIconColor }}
                />
              ) : null}
              {submitPending ? "กำลังส่ง..." : label || "Submit"}
            </button>
            {successDisplayText ? (
              <div
                className={`form-success-message-enter mt-2 flex w-full items-center gap-2 rounded-md px-3 py-2 ${themeTextClass}`}
                style={{
                  ...themeTextStyle,
                  color: successTextColor,
                  backgroundColor: successBackgroundColor,
                  fontSize: `${labelFontSize}px`,
                }}
              >
                {successIcon ? (
                  <IconAwsome
                    iconName={successIcon.name}
                    iconType={successIcon.type}
                    style={{
                      fontSize: Math.max(13, labelFontSize),
                      color: successIconColor,
                    }}
                  />
                ) : null}
                <span>{successDisplayText}</span>
              </div>
            ) : null}
            {submitMessageKind === "error" && submitMessage
              ? renderSubmitErrorBanner(submitMessage)
              : null}
          </div>
        {useLayoutSelectionFrame && (
          <>
            <div className="pointer-events-none absolute left-[-7px] right-[-7px] top-[-6px] bottom-[-6px] rounded-md bg-red-300/10" />
            <span className="pointer-events-none absolute left-[-5px] top-[-5px] h-2.5 w-2.5 border-l-2 border-t-2 border-red-400" />
            <span className="pointer-events-none absolute right-[-5px] top-[-5px] h-2.5 w-2.5 border-r-2 border-t-2 border-red-400" />
            <span className="pointer-events-none absolute bottom-[-5px] left-[-5px] h-2.5 w-2.5 border-b-2 border-l-2 border-red-400" />
            <span className="pointer-events-none absolute bottom-[-5px] right-[-5px] h-2.5 w-2.5 border-b-2 border-r-2 border-red-400" />
          </>
        )}
        </div>
      </div>
    );
  }

  const baseFieldClass =
    `w-full rounded-md border px-3 text-[13px] outline-none transition-colors [&::placeholder]:text-[var(--form-placeholder-color)] ${themeTextClass}`.trim();
  const fieldControlHeightPx = 38;
  const invalidBorderColor = "rgba(239, 68, 68, 0.5)";
  const effectiveBorderColor = fieldInvalid ? invalidBorderColor : borderColor;
  const baseInputStyle = {
    borderColor: effectiveBorderColor,
    color: labelColor,
    ...themeTextStyle,
  };
  const choiceGroupInvalidClass = fieldInvalid
    ? "rounded-md border border-[rgba(239,68,68,0.5)] px-2 py-2"
    : "";

  return (
    <div
      className={`w-full ${formFieldSpacingClass} ${shellClass}`}
      onMouseEnter={() => hover?.({ id })}
      onMouseLeave={() => hover?.(false)}
    >
      <div className={shellSelectionFrameClass}>
        <div className={`${selectedContentScaleClass} ${selectedFrameInnerBottomSpaceClass}`}>
          <div
            className={`mb-[6px] text-left font-medium leading-snug ${themeTextClass}`}
            style={{
              ...themeTextStyle,
              color: labelColor,
              fontSize: `${labelFontSize}px`,
            }}
          >
            {label}
            {isRequired ? (
              <span className="ml-0.5 font-semibold text-[#ef4444]" aria-hidden>
                *
              </span>
            ) : null}
          </div>
          {(type === "frmInput" || type === "frmNum" || type === "frmSum") && (
            <div className={`relative ${controlsPeClass}`}>
              {labelIcon ? (
                <span className="pointer-events-none absolute inset-y-0 left-2 inline-flex items-center">
                  <IconAwsome
                    iconName={labelIcon.name}
                    iconType={labelIcon.type}
                    style={{ fontSize: 16, color: iconColor }}
                  />
                </span>
              ) : null}
              <input
                type={isSumReadOnly ? "text" : isNumberInput ? "number" : isTelValidation ? "tel" : "text"}
                step={!isSumReadOnly && isNumberInput ? "any" : undefined}
                inputMode={
                  isTelValidation
                    ? "numeric"
                    : isNumberInput && !isSumReadOnly
                      ? "decimal"
                      : undefined
                }
                readOnly={isSumReadOnly}
                aria-readonly={isSumReadOnly || undefined}
                tabIndex={isSumReadOnly ? -1 : undefined}
                disabled={!isInteractive && !isSumReadOnly}
                value={
                  isSumReadOnly
                    ? sumDisplayValue
                    : isInteractive
                      ? textValue
                      : ""
                }
                onChange={
                  isInteractive && !isSumReadOnly
                    ? (event) => {
                        const raw = event.target.value;
                        const next = isTelValidation ? formatThaiPhoneDisplay(raw) : raw;
                        setTextValue(next);
                        emitFieldChange(next);
                      }
                    : undefined
                }
                onKeyDown={
                  isInteractive && isTelValidation
                    ? (event) => {
                        if (event.ctrlKey || event.metaKey || event.altKey) return;
                        const allowed = [
                          "Backspace",
                          "Delete",
                          "Tab",
                          "ArrowLeft",
                          "ArrowRight",
                          "Home",
                          "End",
                        ];
                        if (allowed.includes(event.key)) return;
                        if (/^\d$/.test(event.key)) return;
                        event.preventDefault();
                      }
                    : undefined
                }
                placeholder={isSumReadOnly ? "" : inputPlaceholder}
                className={`${baseFieldClass} py-2 ${labelIcon ? "pl-9" : ""} ${
                  isSumReadOnly ? "cursor-default" : ""
                }`.trim()}
                style={{
                  ...baseInputStyle,
                  backgroundColor: fieldBackgroundColor,
                  fontSize: `${placeholderFontSize}px`,
                  height: fieldControlHeightPx,
                  boxSizing: "border-box",
                  ["--form-placeholder-color"]: placeholderColor,
                }}
              />
            </div>
          )}
          {type === "frmTextarea" && (
            <div className={controlsPeClass}>
              <textarea
                disabled={!isInteractive}
                rows={Math.max(2, Number(elementData?.rows) || 4)}
                value={isInteractive ? textValue : ""}
                onChange={
                  isInteractive
                    ? (event) => {
                        const next = event.target.value;
                        setTextValue(next);
                        emitFieldChange(next);
                      }
                    : undefined
                }
                placeholder={textareaPlaceholder}
                className={`${baseFieldClass} py-2`}
                style={{
                  ...baseInputStyle,
                  minHeight: 96,
                  resize: "none",
                  backgroundColor: fieldBackgroundColor,
                  fontSize: `${placeholderFontSize}px`,
                  ["--form-placeholder-color"]: placeholderColor,
                }}
              />
            </div>
          )}
          {type === "frmSelect" && (
            <div className={`relative ${controlsPeClass}`} ref={selectRootRef}>
              <button
                type="button"
                disabled={!isInteractive || selectDisabled}
                aria-haspopup="listbox"
                aria-expanded={selectOpen}
                aria-disabled={!isInteractive || selectDisabled}
                onClick={() => {
                  if (!isInteractive || selectDisabled) return;
                  setSelectOpen((open) => !open);
                }}
                className={`${baseFieldClass} flex items-center justify-between gap-2 py-2 pr-3 text-left ${
                  isInteractive && !selectDisabled
                    ? "cursor-pointer"
                    : "cursor-default"
                } ${selectOpen ? "rounded-b-none" : ""} ${
                  selectDisabled ? "opacity-55" : ""
                }`}
                style={{
                  ...baseInputStyle,
                  backgroundColor: fieldBackgroundColor,
                  color: optionTextColor,
                  fontSize: `${placeholderFontSize}px`,
                  height: fieldControlHeightPx,
                  boxSizing: "border-box",
                }}
              >
                <span className="min-w-0 flex-1 truncate">
                  {selectDisabled
                    ? selectPlaceholder
                    : selectValue || selectPlaceholder}
                </span>
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden
                  className="size-4 shrink-0 transition-transform duration-150"
                  style={{
                    color: optionTextColor,
                    transform: selectOpen ? "rotate(180deg)" : "none",
                  }}
                >
                  <path
                    d="M5 7.5L10 12.5L15 7.5"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {selectOpen && isInteractive && !selectDisabled ? (
                <ul
                  role="listbox"
                  className="absolute left-0 right-0 top-full z-40 max-h-48 overflow-y-auto rounded-md rounded-t-none border border-t-0 py-1"
                  style={{
                    backgroundColor: fieldBackgroundColor,
                    borderColor: effectiveBorderColor,
                    fontFamily: inputFont,
                  }}
                >
                  {(() => {
                    const optionList = Array.isArray(selectOptions)
                      ? selectOptions
                      : renderOptions(elementData?.options, "Option");
                    const linkedSet = new Set(
                      Array.isArray(linkedSelectOptions)
                        ? linkedSelectOptions.map(String)
                        : []
                    );
                    if (optionList.length === 0) {
                      return (
                        <li
                          className="px-3 py-2 text-[12px] opacity-60"
                          style={{ color: optionTextColor }}
                        >
                          ยังไม่มีตัวเลือก
                        </li>
                      );
                    }
                    return optionList.map((item, index) => {
                      const selected = selectValue === item;
                      const hovered = selectHoverIndex === index;
                      const linked = linkedSet.has(String(item));
                      const optionBg = selected
                        ? optionActiveColor
                        : hovered
                          ? optionHoverColor
                          : "transparent";
                      if (selectRelationEdit) {
                        return (
                          <li
                            key={`frm-select-opt-${index}`}
                            role="presentation"
                            className="flex items-center gap-1 px-2 py-0.5"
                            style={{ backgroundColor: optionBg }}
                            onMouseEnter={() => setSelectHoverIndex(index)}
                            onMouseLeave={() => setSelectHoverIndex(null)}
                          >
                            <label
                              className="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center"
                              onClick={(event) => event.stopPropagation()}
                              title={linked ? "เอาออกจากความสัมพันธ์" : "ผูกความสัมพันธ์"}
                            >
                              <input
                                type="checkbox"
                                className="sr-only"
                                checked={linked}
                                onChange={(event) => {
                                  const checked = event.target.checked;
                                  onToggleLinkedOption?.(item, checked);
                                  if (checked) {
                                    if (!String(selectValue || "").trim()) {
                                      setSelectValue(item);
                                      emitFieldChange(item);
                                    }
                                  } else if (selectValue === item) {
                                    const remaining = optionList.filter(
                                      (opt) =>
                                        opt !== item && linkedSet.has(String(opt))
                                    );
                                    const next = remaining[0] ?? "";
                                    setSelectValue(next);
                                    emitFieldChange(next);
                                  }
                                }}
                              />
                              <span
                                className="inline-flex size-4 items-center justify-center rounded-[3px] border-[1.5px]"
                                style={{
                                  borderColor: optionTextColor,
                                  backgroundColor: linked
                                    ? optionTextColor
                                    : "transparent",
                                }}
                                aria-hidden
                              >
                                {linked ? (
                                  <Check
                                    size={10}
                                    strokeWidth={4.5}
                                    style={{
                                      color: fieldBackgroundColor,
                                    }}
                                  />
                                ) : null}
                              </span>
                            </label>
                            <button
                              type="button"
                              role="option"
                              aria-selected={selected}
                              disabled={!linked}
                              className={`flex min-w-0 flex-1 items-center gap-2 px-1 py-1 text-left outline-none transition-colors ${
                                linked ? "cursor-pointer" : "cursor-default opacity-45"
                              }`}
                              style={{
                                color: optionTextColor,
                                fontSize: `${placeholderFontSize}px`,
                                fontWeight: selected ? 600 : 400,
                              }}
                              onClick={() => {
                                if (!linked) return;
                                setSelectValue(item);
                                setSelectOpen(false);
                                setSelectHoverIndex(null);
                                emitFieldChange(item);
                              }}
                            >
                              <span className="min-w-0 flex-1 truncate">{item}</span>
                            </button>
                          </li>
                        );
                      }
                      return (
                        <li key={`frm-select-opt-${index}`} role="presentation">
                          <button
                            type="button"
                            role="option"
                            aria-selected={selected}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left outline-none transition-colors"
                            style={{
                              backgroundColor: optionBg,
                              color: optionTextColor,
                              fontSize: `${placeholderFontSize}px`,
                              fontWeight: selected ? 600 : 400,
                              borderLeft: selected
                                ? `3px solid ${optionTextColor}`
                                : "3px solid transparent",
                            }}
                            onMouseEnter={() => setSelectHoverIndex(index)}
                            onMouseLeave={() => setSelectHoverIndex(null)}
                            onClick={() => {
                              setSelectValue(item);
                              setSelectOpen(false);
                              setSelectHoverIndex(null);
                              emitFieldChange(item);
                            }}
                          >
                            <span className="min-w-0 flex-1 truncate">{item}</span>
                            {selected ? (
                              <svg
                                viewBox="0 0 16 16"
                                className="size-3.5 shrink-0"
                                fill="none"
                                aria-hidden
                                style={{ color: optionTextColor }}
                              >
                                <path
                                  d="M3.5 8.2L6.4 11.1L12.5 4.5"
                                  stroke="currentColor"
                                  strokeWidth="2.25"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            ) : null}
                          </button>
                        </li>
                      );
                    });
                  })()}
                </ul>
              ) : null}
            </div>
          )}
          {type === "frmRadio" && (
            <div
              className={`flex flex-row flex-wrap items-center gap-x-4 gap-y-2 ${controlsPeClass} ${choiceGroupInvalidClass}`}
            >
              {renderOptions(elementData?.options, "Option").map((item, index) => {
                const isChecked = isInteractive
                  ? radioValue === String(item)
                  : index === 0;
                return (
                  <label
                    key={`frm-radio-opt-${index}`}
                    className={`inline-flex items-center gap-2 ${
                      isInteractive ? "cursor-pointer" : ""
                    } ${themeTextClass}`}
                    style={{
                      ...themeTextStyle,
                      color: optionTextColor,
                      fontSize: `${placeholderFontSize}px`,
                    }}
                  >
                    <span
                      className="relative inline-flex size-[18px] shrink-0 items-center justify-center rounded-full border-[1.5px]"
                      style={{
                        borderColor: isChecked
                          ? optionAccentColor
                          : fieldInvalid
                            ? invalidBorderColor
                            : borderColor,
                        backgroundColor: fieldBackgroundColor,
                      }}
                      aria-hidden
                    >
                      {isChecked ? (
                        <span
                          className="block size-[8px] rounded-full"
                          style={{ backgroundColor: optionAccentColor }}
                        />
                      ) : null}
                    </span>
                    <input
                      type="radio"
                      disabled={!isInteractive}
                          {...(isInteractive
                        ? {
                            checked: isChecked,
                            onChange: () => {
                              const next = String(item);
                              setRadioValue(next);
                              emitFieldChange(next);
                            },
                          }
                        : { defaultChecked: isChecked })}
                      name={`frm-radio-${elementData?.id || "demo"}`}
                      className="sr-only"
                      tabIndex={isInteractive ? 0 : -1}
                    />
                    <span>{item}</span>
                  </label>
                );
              })}
            </div>
          )}
          {type === "frmCheckbox" && (
            <div
              className={`flex flex-row flex-wrap items-center gap-x-4 gap-y-2 ${controlsPeClass} ${choiceGroupInvalidClass}`}
            >
              {renderOptions(elementData?.options, "Option").map((item, index) => {
                const isChecked = isInteractive
                  ? checkboxValues[index] === true
                  : index === 0;
                return (
                  <label
                    key={`frm-checkbox-opt-${index}`}
                    className={`inline-flex items-center gap-2 ${
                      isInteractive ? "cursor-pointer" : ""
                    } ${themeTextClass}`}
                    style={{
                      ...themeTextStyle,
                      color: optionTextColor,
                      fontSize: `${placeholderFontSize}px`,
                    }}
                  >
                    <span
                      className="relative inline-flex size-[18px] shrink-0 items-center justify-center rounded-[4px] border-[1.5px]"
                      style={{
                        borderColor: isChecked
                          ? optionAccentColor
                          : fieldInvalid
                            ? invalidBorderColor
                            : borderColor,
                        backgroundColor: isChecked
                          ? optionAccentColor
                          : fieldBackgroundColor,
                      }}
                      aria-hidden
                    >
                      {isChecked ? (
                        <svg
                          viewBox="0 0 16 16"
                          className="size-[11px]"
                          fill="none"
                          aria-hidden
                        >
                          <path
                            d="M3.5 8.2L6.4 11.1L12.5 4.5"
                            stroke="#ffffff"
                            strokeWidth="3.25"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : null}
                    </span>
                    <input
                      type="checkbox"
                      disabled={!isInteractive}
                      {...(isInteractive
                        ? {
                            checked: isChecked,
                            onChange: () =>
                              setCheckboxValues((prev) => {
                                const next = {
                                  ...prev,
                                  [index]: !prev[index],
                                };
                                const options = renderOptions(
                                  elementData?.options,
                                  "Option"
                                );
                                const selectedLabels = options.filter(
                                  (_, optIndex) => next[optIndex] === true
                                );
                                emitFieldChange(selectedLabels);
                                return next;
                              }),
                          }
                        : { defaultChecked: isChecked })}
                      className="sr-only"
                      tabIndex={isInteractive ? 0 : -1}
                    />
                    <span>{item}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
        {useLayoutSelectionFrame && (
          <>
            <div className="pointer-events-none absolute left-[-7px] right-[-7px] top-[-4px] bottom-[-4px] rounded-md bg-red-300/10" />
            <span className="pointer-events-none absolute left-[-5px] top-[-3px] h-2.5 w-2.5 border-l-2 border-t-2 border-red-400" />
            <span className="pointer-events-none absolute right-[-5px] top-[-3px] h-2.5 w-2.5 border-r-2 border-t-2 border-red-400" />
            <span className="pointer-events-none absolute bottom-[-3px] left-[-5px] h-2.5 w-2.5 border-b-2 border-l-2 border-red-400" />
            <span className="pointer-events-none absolute bottom-[-3px] right-[-5px] h-2.5 w-2.5 border-b-2 border-r-2 border-red-400" />
          </>
        )}
      </div>
    </div>
  );
}

export default React.memo(FormElement);
