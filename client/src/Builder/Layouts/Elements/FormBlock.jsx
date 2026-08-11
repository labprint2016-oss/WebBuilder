import React, { useEffect, useMemo, useRef, useState } from "react";
import { createFormResponse, getForms } from "../../../../Functions/forms";
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

const FORMS_MENU_BAR_ID = "69db17211be82fe7637ea096";
const ANSWER_FIELD_TYPES = new Set([
  "frmInput",
  "frmNum",
  "frmTextarea",
  "frmSelect",
  "frmRadio",
  "frmCheckbox",
]);

let formsCache = null;
let formsCachePromise = null;

const loadFormsCached = () => {
  if (formsCache) return Promise.resolve(formsCache);
  if (formsCachePromise) return formsCachePromise;
  formsCachePromise = getForms(FORMS_MENU_BAR_ID)
    .then((res) => {
      const list = Array.isArray(res?.data?.formPresets) ? res.data.formPresets : [];
      formsCache = {
        presets: list,
        defaultFormPresetId: String(
          res?.data?.defaultFormPresetId || list[0]?.id || ""
        ),
      };
      return formsCache;
    })
    .catch((error) => {
      formsCachePromise = null;
      throw error;
    });
  return formsCachePromise;
};

export const invalidateFormsCache = () => {
  formsCache = null;
  formsCachePromise = null;
};

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

function FormBlock({
  elementData,
  selected,
  hover,
  theme,
  builderMode,
  lite = false,
}) {
  const marginYRaw = Number(
    elementData?.formMarginY ??
      elementData?.formMarginTop ??
      elementData?.formMarginBottom
  );
  const marginXRaw = Number(elementData?.formMarginX);
  const marginY = Number.isFinite(marginYRaw)
    ? Math.max(0, Math.min(80, marginYRaw))
    : 8;
  const marginX = Number.isFinite(marginXRaw)
    ? Math.max(0, Math.min(80, marginXRaw))
    : 0;
  const marginTop = marginY;
  const marginBottom = marginY;

  const [presets, setPresets] = useState(() => formsCache?.presets || []);
  const [defaultFormPresetId, setDefaultFormPresetId] = useState(
    () => formsCache?.defaultFormPresetId || ""
  );
  const [loadError, setLoadError] = useState("");
  const [ready, setReady] = useState(() => Boolean(formsCache));
  const [submitPending, setSubmitPending] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [formKey, setFormKey] = useState(0);
  const [fieldValues, setFieldValues] = useState({});
  const [selectResetKeys, setSelectResetKeys] = useState({});
  const answersRef = useRef({});

  useEffect(() => {
    if (lite) return undefined;
    let alive = true;
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

  const rows = Array.isArray(preset?.gridRows) ? preset.gridRows : [];
  const isInteractive =
    builderMode === "Preview Mode" || builderMode === "Editor Mode";
  const useLayoutSelectionFrame = builderMode === "Layout Mode" && selected;

  useEffect(() => {
    answersRef.current = {};
    setFieldValues({});
    setSelectResetKeys({});
    setSubmitMessage("");
    setSubmitPending(false);
  }, [selectedPresetId, preset?.id]);

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

    const missingRequired = fields.find((field) => {
      if (field?.formRequired !== true) return false;
      // Select ในโซ่ที่ยังเลือกชั้นบนกไม่ได้ — ยังไม่บังคับ
      const chain = findChainByFieldId(conditionalChains, field.id);
      if (
        chain &&
        !isCascadedFieldUnlocked(chain, fieldValues, field.id)
      ) {
        return false;
      }
      const saved = answersRef.current[field.id];
      const value = saved?.value;
      if (Array.isArray(value)) return value.length === 0;
      return String(value ?? "").trim() === "";
    });
    if (missingRequired) {
      setSubmitMessage(
        missingRequired.formRequiredMessage || "กรุณากรอกข้อมูลให้ครบ"
      );
      return;
    }

    setSubmitPending(true);
    setSubmitMessage("");
    try {
      await createFormResponse({
        menuBarId: FORMS_MENU_BAR_ID,
        formPresetId: String(preset.id),
        formName: String(preset.name || "Form"),
        answers,
        meta: {
          href: typeof window !== "undefined" ? window.location.href : "",
          submittedAt: new Date().toISOString(),
        },
      });
      answersRef.current = {};
      setFormKey((key) => key + 1);
      setSubmitMessage("ส่งแล้ว — ข้อความเข้า Inbox แล้ว");
    } catch {
      setSubmitMessage("ส่งไม่สำเร็จ กรุณาลองอีกครั้ง");
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
          <div key={formKey} className="flex w-full flex-col gap-3">
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
