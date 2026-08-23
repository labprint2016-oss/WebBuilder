import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createFormResponse } from "../../../../Functions/forms";
import {
  findChainByFieldId,
  getCascadedOptions,
  getDescendantFieldIds,
  isCascadedFieldUnlocked,
  normalizeConditionalChains,
} from "../../formConditionalSelect";
import {
  computeFormSumTotal,
  normalizeCalculations,
} from "../../formCalculations";
import FormElement from "./FormElement";
import {
  FORM_SUBMIT_ERROR_GENERIC,
  FORM_SUBMIT_ERROR_RATE_LIMIT,
} from "../../formSubmitMessages";
import { getFormsCacheSnapshot, loadFormsCached } from "./formsCache";
import { usePanelPreview } from "../../panelPreviewStore";

const FORMS_MENU_BAR_ID = "69db17211be82fe7637ea096";
const FORM_SUCCESS_MESSAGE_DURATION_MS = 2500;
const ANSWER_FIELD_TYPES = new Set([
  "frmInput",
  "frmNum",
  "frmTextarea",
  "frmSelect",
  "frmRadio",
  "frmCheckbox",
]);

function FormBlockLite({ marginTop = 8, marginBottom = 8, marginX = 0 }) {
  return (
    <div
      className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed px-3 py-5 text-[12px] text-slate-500"
      style={{
        marginTop,
        marginBottom,
        marginLeft: marginX,
        marginRight: marginX,
        borderColor: "rgba(148,163,184,0.65)",
        background: "rgba(148,163,184,0.06)",
      }}
    >
      <span className="material-icons-outlined text-[18px] opacity-70">send</span>
      <span>Form</span>
    </div>
  );
}

function collectFields(rows) {
  const fields = [];
  (Array.isArray(rows) ? rows : []).forEach((row) => {
    const rowGrid = Number.isFinite(Number(row?.grid))
      ? Math.max(1, Math.round(Number(row.grid)))
      : 1;
    for (let columnIndex = 0; columnIndex < rowGrid; columnIndex += 1) {
      const column = Array.isArray(row?.columns?.[columnIndex])
        ? row.columns[columnIndex]
        : [];
      column.forEach((field) => {
        if (field?.id) fields.push(field);
      });
    }
  });
  return fields;
}

function isRequiredFieldEmpty(field, answersRef, fieldValues, conditionalChains) {
  if (field?.formRequired !== true) return false;
  const chain = findChainByFieldId(conditionalChains, field.id);
  if (chain && !isCascadedFieldUnlocked(chain, fieldValues, field.id)) {
    return false;
  }
  const saved = answersRef.current[field.id];
  const value = saved?.value;
  if (Array.isArray(value)) return value.length === 0;
  return String(value ?? "").trim() === "";
}

function collectInvalidRequiredFieldIds(fields, answersRef, fieldValues, conditionalChains) {
  return fields
    .filter((field) => isRequiredFieldEmpty(field, answersRef, fieldValues, conditionalChains))
    .map((field) => field.id)
    .filter(Boolean);
}

function FormBlock({
  elementData,
  selected,
  hover,
  theme,
  builderMode,
  lite = false,
}) {
  const previewData = usePanelPreview("form", elementData?.id);
  const liveElementData = previewData || elementData;
  const marginTopRaw = Number(
    liveElementData?.formMarginTop ?? liveElementData?.formMarginY
  );
  const marginBottomRaw = Number(
    liveElementData?.formMarginBottom ?? liveElementData?.formMarginY
  );
  const marginXRaw = Number(elementData?.formMarginX);
  const marginTop = Number.isFinite(marginTopRaw)
    ? Math.max(0, Math.min(80, marginTopRaw))
    : 8;
  const marginBottom = Number.isFinite(marginBottomRaw)
    ? Math.max(0, Math.min(80, marginBottomRaw))
    : 8;
  const marginX = Number.isFinite(marginXRaw)
    ? Math.max(0, Math.min(80, marginXRaw))
    : 0;

  const [presets, setPresets] = useState(
    () => getFormsCacheSnapshot()?.presets || []
  );
  const [defaultFormPresetId, setDefaultFormPresetId] = useState(
    () => getFormsCacheSnapshot()?.defaultFormPresetId || ""
  );
  const [loadError, setLoadError] = useState("");
  const [ready, setReady] = useState(() => Boolean(getFormsCacheSnapshot()));
  const [submitPending, setSubmitPending] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitMessageKind, setSubmitMessageKind] = useState("");
  const [formKey, setFormKey] = useState(0);
  const [fieldValues, setFieldValues] = useState({});
  const [invalidFieldIds, setInvalidFieldIds] = useState(() => new Set());
  const [selectResetKeys, setSelectResetKeys] = useState({});
  const answersRef = useRef({});
  const formLoadedAtRef = useRef(null);
  const submitMessageTimerRef = useRef(null);
  const [honeypot, setHoneypot] = useState("");

  const clearSubmitMessageTimer = useCallback(() => {
    if (submitMessageTimerRef.current != null) {
      clearTimeout(submitMessageTimerRef.current);
      submitMessageTimerRef.current = null;
    }
  }, []);

  useEffect(() => () => clearSubmitMessageTimer(), [clearSubmitMessageTimer]);

  useEffect(() => {
    if (lite) return undefined;
    let alive = true;
    const formsCache = getFormsCacheSnapshot();
    if (formsCache) {
      setPresets(formsCache.presets);
      setDefaultFormPresetId(formsCache.defaultFormPresetId);
      setReady(true);
      setLoadError("");
      return undefined;
    }
    loadFormsCached()
      .then((data) => {
        if (!alive) return;
        setPresets(data.presets);
        setDefaultFormPresetId(data.defaultFormPresetId);
        setReady(true);
        setLoadError("");
      })
      .catch(() => {
        if (!alive) return;
        setPresets([]);
        setReady(true);
        setLoadError("โหลดฟอร์มไม่สำเร็จ");
      });
    return () => {
      alive = false;
    };
  }, [lite]);

  const selectedPresetId = useMemo(() => {
    const raw = String(elementData?.formPresetId || "").trim();
    if (raw && presets.some((item) => item?.id === raw)) return raw;
    if (
      defaultFormPresetId &&
      presets.some((item) => item?.id === defaultFormPresetId)
    ) {
      return defaultFormPresetId;
    }
    return presets[0]?.id || "";
  }, [elementData?.formPresetId, presets, defaultFormPresetId]);

  const preset = useMemo(
    () => presets.find((item) => item?.id === selectedPresetId) || null,
    [presets, selectedPresetId]
  );

  const rows = useMemo(
    () => (Array.isArray(preset?.gridRows) ? preset.gridRows : []),
    [preset?.gridRows]
  );
  const presetId = preset?.id;
  const isInteractive =
    builderMode === "Preview Mode" || builderMode === "Editor Mode";
  const useLayoutSelectionFrame = builderMode === "Layout Mode" && selected;

  useEffect(() => {
    clearSubmitMessageTimer();
    answersRef.current = {};
    setFieldValues({});
    setInvalidFieldIds(new Set());
    setSelectResetKeys({});
    setSubmitMessage("");
    setSubmitMessageKind("");
    setSubmitPending(false);
    setHoneypot("");
    formLoadedAtRef.current = null;
  }, [selectedPresetId, preset?.id, clearSubmitMessageTimer]);

  useEffect(() => {
    if (!isInteractive || !presetId || rows.length === 0) {
      formLoadedAtRef.current = null;
      return;
    }
    if (formLoadedAtRef.current == null) {
      formLoadedAtRef.current = Date.now();
    }
  }, [isInteractive, presetId, rows.length]);

  const conditionalChains = useMemo(
    () => normalizeConditionalChains(preset?.conditionalChains),
    [preset?.conditionalChains]
  );
  const calculations = useMemo(
    () => normalizeCalculations(preset?.calculations),
    [preset?.calculations]
  );

  const allFields = useMemo(() => collectFields(rows), [rows]);

  const fieldsById = useMemo(() => {
    const map = {};
    allFields.forEach((field) => {
      if (field?.id) map[field.id] = field;
    });
    return map;
  }, [allFields]);

  const sumDisplayByFieldId = useMemo(() => {
    const map = {};
    allFields.forEach((field) => {
      if (String(field?.type || "") !== "frmSum") return;
      const sum = computeFormSumTotal(
        calculations,
        field,
        allFields,
        fieldValues
      );
      map[field.id] =
        sum == null || !Number.isFinite(sum) ? "" : String(sum);
    });
    return map;
  }, [allFields, calculations, fieldValues]);

  const handleFieldChange = (entry) => {
    if (!entry?.fieldId) return;
    answersRef.current[entry.fieldId] = entry;
    setInvalidFieldIds((prev) => {
      if (!prev.has(entry.fieldId)) return prev;
      const next = new Set(prev);
      next.delete(entry.fieldId);
      return next;
    });
    const nextValue =
      entry.type === "frmCheckbox"
        ? entry.value
        : String(entry?.value ?? "");
    setFieldValues((prev) => {
      const next = { ...prev, [entry.fieldId]: nextValue };
      const chain = findChainByFieldId(conditionalChains, entry.fieldId);
      if (chain) {
        getDescendantFieldIds(chain, entry.fieldId).forEach((childId) => {
          next[childId] = "";
          delete answersRef.current[childId];
        });
      }
      return next;
    });
    const chain = findChainByFieldId(conditionalChains, entry.fieldId);
    if (chain) {
      const descendants = getDescendantFieldIds(chain, entry.fieldId);
      if (descendants.length > 0) {
        setSelectResetKeys((prev) => {
          const next = { ...prev };
          descendants.forEach((childId) => {
            next[childId] = (next[childId] || 0) + 1;
          });
          return next;
        });
      }
    }
  };

  const handleSubmit = async () => {
    if (!isInteractive || submitPending || !preset?.id) return;
    const fields = collectFields(rows).filter((field) =>
      ANSWER_FIELD_TYPES.has(String(field?.type || ""))
    );
    const answers = fields.map((field) => {
      const saved = answersRef.current[field.id];
      const label =
        typeof field?.label === "string" && field.label.trim()
          ? field.label.trim()
          : "Field";
      if (saved) return saved;
      return {
        fieldId: field.id,
        type: field.type,
        label,
        value: field.type === "frmCheckbox" ? [] : "",
      };
    });

    const invalidIds = collectInvalidRequiredFieldIds(
      fields,
      answersRef,
      fieldValues,
      conditionalChains
    );
    if (invalidIds.length > 0) {
      setInvalidFieldIds(new Set(invalidIds));
      return;
    }
    setInvalidFieldIds(new Set());

    setSubmitPending(true);
    clearSubmitMessageTimer();
    setSubmitMessage("");
    setSubmitMessageKind("");
    const submitField = allFields.find(
      (field) => String(field?.type || "") === "frmSubmit"
    );
    const successText =
      typeof submitField?.formSuccessMessage === "string" &&
      submitField.formSuccessMessage.trim()
        ? submitField.formSuccessMessage.trim()
        : "ส่งข้อความเรียบร้อยแล้ว ขอบคุณมากค่ะ";
    try {
      await createFormResponse({
        menuBarId: FORMS_MENU_BAR_ID,
        formPresetId: String(preset.id),
        formName: String(preset.name || "Form"),
        answers,
        _hp: honeypot,
        meta: {
          href: typeof window !== "undefined" ? window.location.href : "",
          submittedAt: new Date().toISOString(),
          _formLoadedAt: formLoadedAtRef.current,
        },
      });
      answersRef.current = {};
      setInvalidFieldIds(new Set());
      setFormKey((key) => key + 1);
      setSubmitMessage(successText);
      setSubmitMessageKind("success");
      submitMessageTimerRef.current = setTimeout(() => {
        setSubmitMessage("");
        setSubmitMessageKind("");
        submitMessageTimerRef.current = null;
      }, FORM_SUCCESS_MESSAGE_DURATION_MS);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("wb:messages-changed"));
      }
    } catch (error) {
      const status = error?.response?.status;
      if (status === 429) {
        setSubmitMessage(FORM_SUBMIT_ERROR_RATE_LIMIT);
      } else {
        setSubmitMessage(FORM_SUBMIT_ERROR_GENERIC);
      }
      setSubmitMessageKind("error");
    } finally {
      setSubmitPending(false);
    }
  };

  if (lite) {
    return (
      <FormBlockLite
        marginTop={marginTop}
        marginBottom={marginBottom}
        marginX={marginX}
      />
    );
  }

  return (
    <div
      className="w-full"
      style={{
        marginTop,
        marginBottom,
        marginLeft: marginX,
        marginRight: marginX,
      }}
      onMouseEnter={() => hover?.({ id: elementData?.id })}
      onMouseLeave={() => hover?.(false)}
    >
      <div className={useLayoutSelectionFrame ? "relative" : ""}>
        {!ready ? (
          <FormBlockLite marginTop={0} marginBottom={0} />
        ) : loadError ? (
          <div className="rounded-md border border-dashed px-3 py-4 text-center text-[12px] text-slate-500">
            {loadError}
          </div>
        ) : !preset ? (
          <div className="rounded-md border border-dashed px-3 py-4 text-center text-[12px] text-slate-500">
            ยังไม่มีฟอร์ม — ไปที่เมนู Forms เพื่อสร้างฟอร์มก่อน
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-md border border-dashed px-3 py-4 text-center text-[12px] text-slate-500">
            ฟอร์ม “{preset.name || "Form"}” ยังไม่มีองค์ประกอบ
          </div>
        ) : (
          <div key={formKey} className="relative flex w-full flex-col gap-3">
            {isInteractive ? (
              <input
                type="text"
                name="_hp_confirm"
                value={honeypot}
                onChange={(event) => setHoneypot(event.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="pointer-events-none absolute left-[-9999px] top-auto h-px w-px overflow-hidden opacity-0"
              />
            ) : null}
            {rows.map((row, rowIndex) => {
              const rowGrid = Number.isFinite(Number(row?.grid))
                ? Math.max(1, Math.round(Number(row.grid)))
                : 1;
              return (
                <div
                  key={row?.id || `form-row-${rowIndex}`}
                  className="grid items-start gap-2"
                  style={{
                    gridTemplateColumns: `repeat(${rowGrid}, minmax(0, 1fr))`,
                  }}
                >
                  {Array.from({ length: rowGrid }, (_, columnIndex) => {
                    const column = Array.isArray(row?.columns?.[columnIndex])
                      ? row.columns[columnIndex]
                      : [];
                    return (
                      <div
                        key={`${row?.id || `row-${rowIndex}`}-col-${columnIndex}`}
                        className="flex min-w-0 flex-col items-stretch gap-3"
                      >
                        {column.map((field, fieldIndex) => {
                          const fieldType = String(field?.type || "");
                          const isSubmit = fieldType === "frmSubmit";
                          const chain =
                            fieldType === "frmSelect"
                              ? findChainByFieldId(conditionalChains, field?.id)
                              : null;
                          const unlocked = chain
                            ? isCascadedFieldUnlocked(
                                chain,
                                fieldValues,
                                field?.id
                              )
                            : true;
                          const cascadedOptions = chain
                            ? getCascadedOptions(
                                chain,
                                fieldsById,
                                fieldValues,
                                field?.id
                              )
                            : null;
                          return (
                            <FormElement
                              key={
                                field?.id ||
                                `${row?.id || rowIndex}-${columnIndex}-${fieldIndex}`
                              }
                              elementData={field}
                              selected={false}
                              hover={() => {}}
                              theme={theme}
                              builderMode={
                                isInteractive ? "Preview Mode" : "Layout Mode"
                              }
                              outerSpacing={false}
                              interactive={isInteractive}
                              onFieldChange={
                                isInteractive ? handleFieldChange : null
                              }
                              onSubmitClick={
                                isInteractive && isSubmit ? handleSubmit : null
                              }
                              submitPending={isSubmit ? submitPending : false}
                              submitMessage={isSubmit ? submitMessage : ""}
                              submitMessageKind={isSubmit ? submitMessageKind : ""}
                              selectDisabled={
                                isInteractive && Boolean(chain) && !unlocked
                              }
                              selectOptions={
                                chain
                                  ? unlocked
                                    ? cascadedOptions
                                    : []
                                  : null
                              }
                              selectResetKey={
                                selectResetKeys[field?.id] || 0
                              }
                              controlledValue={
                                fieldType === "frmSum"
                                  ? sumDisplayByFieldId[field?.id] ?? ""
                                  : undefined
                              }
                              fieldInvalid={
                                isInteractive && invalidFieldIds.has(field?.id)
                              }
                            />
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
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

export default FormBlock;
