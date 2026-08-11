import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronRight, X } from "lucide-react";
import {
  MAX_CALCULATION_SELECTS,
  buildAllPathKeys,
  createEmptyCalculation,
  findCalculationByFieldId,
  findCalculationById,
  normalizeCalculation,
  normalizeCalculations,
  splitPathKey,
} from "../formCalculations";

const NAME_REQUIRED_MSG = "กรุณาตั้งชื่อการคำนวณ";

const C = {
  panel: "var(--dash-panel, #f8fafc)",
  border: "var(--dash-border, #e2e8f0)",
  heading: "var(--dash-panel-heading, #0f172a)",
  text: "var(--dash-text, #334155)",
  textMuted: "var(--dash-text-muted, #64748b)",
  surface: "var(--dash-panel-btn-group-inactive, #ffffff)",
  surfaceBorder: "var(--dash-panel-btn-group-border, #e2e8f0)",
  surfaceText: "var(--dash-panel-btn-group-inactive-text, #1e293b)",
  active: "var(--dash-panel-btn-group-active, #333333)",
  activeText: "var(--dash-panel-btn-group-active-text, #ffffff)",
  activeBorder:
    "color-mix(in srgb, var(--dash-panel-btn-group-active, #333333) 50%, transparent)",
};

const selectLabel = (field) => {
  const label =
    typeof field?.label === "string" && field.label.trim()
      ? field.label.trim()
      : "Select";
  return label;
};

/**
 * Panel ตั้งค่าการคำนวณ
 * - เปิดจาก Select: ถ้ายังไม่อยู่ในสูตร → สร้างใหม่ / ถ้าอยู่แล้ว → แก้สูตรนั้น
 * - ตั้งชื่อ + เลือก Select ≤ 3 + กรอก Value
 */
export default function FormCalculationPanel({
  open = false,
  onClose,
  currentFieldId = "",
  selectFields = [],
  calculations = [],
  onSaveCalculations,
  /** Select ที่ถูกใช้ใน Conditional แล้ว — เลือกไม่ได้ */
  blockedFieldIds = [],
  registerFlushHandler = null,
}) {
  const list = useMemo(
    () => normalizeCalculations(calculations),
    [calculations]
  );
  const selectFieldsById = useMemo(() => {
    const map = {};
    (Array.isArray(selectFields) ? selectFields : []).forEach((field) => {
      if (field?.id) map[field.id] = field;
    });
    return map;
  }, [selectFields]);

  const [draft, setDraft] = useState(() => createEmptyCalculation());
  const [editingId, setEditingId] = useState("");
  const [error, setError] = useState("");
  const [nameInvalid, setNameInvalid] = useState(false);
  const nameInputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const seedId = String(currentFieldId || "").trim();
    const existing = findCalculationByFieldId(list, seedId);
    if (existing) {
      setEditingId(existing.id);
      setDraft(normalizeCalculation(existing));
    } else {
      const empty = createEmptyCalculation();
      setEditingId("");
      setDraft({
        ...empty,
        fieldIds: seedId ? [seedId] : [],
      });
    }
    setError("");
    setNameInvalid(false);
    // โหลดตาม Select ที่เปิดมา — ไม่รีเซ็ตหลังบันทึก
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentFieldId]);

  const activeFieldIds = useMemo(() => {
    const selected = new Set(
      (draft.fieldIds || [])
        .map((id) => String(id || "").trim())
        .filter(Boolean)
    );
    // ลำดับตามที่อยู่ในฟอร์ม — ไม่มีจัดลำดับมือ
    return (Array.isArray(selectFields) ? selectFields : [])
      .map((field) => String(field?.id || "").trim())
      .filter((id) => id && selected.has(id));
  }, [draft.fieldIds, selectFields]);

  const selectedFields = useMemo(
    () =>
      activeFieldIds
        .map((id) => selectFieldsById[id])
        .filter(Boolean),
    [activeFieldIds, selectFieldsById]
  );

  const pathKeys = useMemo(
    () => buildAllPathKeys(selectedFields),
    [selectedFields]
  );

  const existingCalc = useMemo(() => {
    const id = String(editingId || draft.id || "").trim();
    return findCalculationById(list, id);
  }, [list, editingId, draft.id]);

  useEffect(() => {
    if (!open) return;
    // ครั้งแรกที่เปิดแผง draft ยังว่าง → pathKeys ว่างชั่วคราว
    // ห้าม sync ตอนนั้น ไม่งั้นจะล้าง Value ที่โหลดจากฐานข้อมูล
    if (pathKeys.length === 0) return;
    setDraft((prev) => {
      const prevValues =
        prev.values && typeof prev.values === "object" ? prev.values : {};
      const saved =
        findCalculationById(list, prev.id) ||
        findCalculationById(list, editingId);
      const savedValues =
        saved?.values && typeof saved.values === "object" ? saved.values : {};
      const nextValues = {};
      let changed = false;
      pathKeys.forEach((key) => {
        if (prevValues[key] !== undefined) {
          // คงค่าที่กำลังพิมพ์ไว้ (รวมสตริงว่าง) — อย่าบังคับเป็น 0
          nextValues[key] = prevValues[key];
          return;
        }
        if (savedValues[key] !== undefined) {
          const n = Number(savedValues[key]);
          const safe = Number.isFinite(n) ? Math.max(0, n) : 0;
          // 0 แสดงเป็นช่องว่าง เพื่อไม่ให้มี 0 ค้างตอนพิมพ์
          nextValues[key] = safe === 0 ? "" : String(safe);
        } else {
          nextValues[key] = "";
        }
        changed = true;
      });
      if (!changed && Object.keys(prevValues).length === pathKeys.length) {
        return prev;
      }
      return { ...prev, values: nextValues };
    });
  }, [open, pathKeys.join("|"), list, editingId]);

  const hasChanges = useMemo(() => {
    const name = String(draft.name || "").trim();
    const safeName =
      nameInvalid && name === NAME_REQUIRED_MSG ? "" : name;
    const draftValues =
      draft.values && typeof draft.values === "object" ? draft.values : {};
    if (!existingCalc) {
      return safeName.length > 0 || activeFieldIds.length > 0;
    }
    const saved = normalizeCalculation(existingCalc);
    if (safeName !== String(saved.name || "").trim()) return true;
    if (activeFieldIds.length !== saved.fieldIds.length) return true;
    if (activeFieldIds.some((id, index) => id !== saved.fieldIds[index])) {
      return true;
    }
    const savedValues = saved.values || {};
    const allKeys = new Set([
      ...Object.keys(draftValues),
      ...Object.keys(savedValues),
    ]);
    for (const key of allKeys) {
      const a = Number(draftValues[key] ?? 0);
      const b = Number(savedValues[key] ?? 0);
      if ((Number.isFinite(a) ? a : 0) !== (Number.isFinite(b) ? b : 0)) {
        return true;
      }
    }
    return false;
  }, [
    existingCalc,
    draft.name,
    draft.values,
    activeFieldIds,
    nameInvalid,
  ]);

  const canSave = hasChanges;

  const blockedIds = useMemo(() => {
    const set = new Set();
    (Array.isArray(blockedFieldIds) ? blockedFieldIds : []).forEach((id) => {
      const safe = String(id || "").trim();
      if (safe) set.add(safe);
    });
    // Select ที่ใช้อยู่ในสูตรอื่นแล้ว
    const currentId = String(editingId || draft.id || "").trim();
    list.forEach((calc) => {
      if (calc?.id === currentId) return;
      (Array.isArray(calc?.fieldIds) ? calc.fieldIds : []).forEach((id) => {
        const safe = String(id || "").trim();
        if (safe) set.add(safe);
      });
    });
    return set;
  }, [blockedFieldIds, list, editingId, draft.id]);

  const showNameRequired = useCallback(() => {
    setNameInvalid(true);
    setError("");
    setDraft((prev) => ({ ...prev, name: NAME_REQUIRED_MSG }));
    requestAnimationFrame(() => {
      const el = nameInputRef.current;
      if (!el) return;
      el.focus();
      el.select();
    });
  }, []);

  const flushDraft = useCallback(() => {
    if (!open || !hasChanges) return { ok: true, skipped: true };
    const rawName = String(draft.name || "").trim();
    const name =
      nameInvalid && rawName === NAME_REQUIRED_MSG ? "" : rawName;
    if (name.length < 1) {
      showNameRequired();
      return {
        ok: false,
        block: true,
        message: NAME_REQUIRED_MSG,
      };
    }
    if (activeFieldIds.length < 1) {
      return {
        ok: false,
        block: true,
        message: "เลือก Select อย่างน้อย 1 ตัว",
      };
    }
    if (activeFieldIds.some((id) => !selectFieldsById[id])) {
      return {
        ok: false,
        block: true,
        message: "มี Select ที่ไม่พบในฟอร์ม",
      };
    }
    if (activeFieldIds.some((id) => blockedIds.has(id))) {
      return {
        ok: false,
        block: true,
        message:
          "มี Select ที่ถูกใช้แล้ว (Conditional หรือสูตรการคำนวณอื่น) — ล้างค่าก่อน",
      };
    }
    const duplicateName = list.some(
      (item) =>
        item.id !== (editingId || draft.id) &&
        String(item.name || "").trim() === name
    );
    if (duplicateName) {
      return {
        ok: false,
        block: true,
        message: "ชื่อการคำนวณนี้มีอยู่แล้ว",
      };
    }

    const nextCalc = normalizeCalculation({
      ...draft,
      id: editingId || draft.id,
      name,
      fieldIds: activeFieldIds,
      values: draft.values,
    });
    const without = list.filter((item) => item.id !== nextCalc.id);
    onSaveCalculations?.([...without, nextCalc]);
    setEditingId(nextCalc.id);
    setDraft(nextCalc);
    setError("");
    setNameInvalid(false);
    return { ok: true };
  }, [
    open,
    hasChanges,
    draft,
    nameInvalid,
    activeFieldIds,
    selectFieldsById,
    blockedIds,
    list,
    editingId,
    onSaveCalculations,
    showNameRequired,
  ]);

  useEffect(() => {
    if (typeof registerFlushHandler !== "function") return undefined;
    if (!open) {
      registerFlushHandler("calculation", null);
      return () => registerFlushHandler("calculation", null);
    }
    registerFlushHandler("calculation", {
      flush: flushDraft,
      isDirty: () => hasChanges,
    });
    return () => registerFlushHandler("calculation", null);
  }, [open, flushDraft, hasChanges, registerFlushHandler]);

  if (!open) return null;

  const atMax = activeFieldIds.length >= MAX_CALCULATION_SELECTS;
  const availableFields = Array.isArray(selectFields) ? selectFields : [];

  const resetDraft = () => {
    const seedId = String(currentFieldId || "").trim();
    const empty = createEmptyCalculation();
    setEditingId("");
    setDraft({
      ...empty,
      fieldIds: seedId ? [seedId] : [],
    });
    setError("");
    setNameInvalid(false);
  };

  const toggleFieldCard = (fieldId) => {
    const id = String(fieldId || "").trim();
    if (!id) return;
    if (blockedIds.has(id)) {
      setError(
        "Select นี้ถูกใช้แล้ว (Conditional หรือสูตรการคำนวณอื่น) — ล้างค่าก่อน"
      );
      return;
    }
    setError("");
    setDraft((prev) => {
      const current = (prev.fieldIds || [])
        .map((item) => String(item || "").trim())
        .filter(Boolean);
      if (current.includes(id)) {
        return { ...prev, fieldIds: current.filter((item) => item !== id) };
      }
      if (current.length >= MAX_CALCULATION_SELECTS) return prev;
      return { ...prev, fieldIds: [...current, id] };
    });
  };

  const setPathValue = (pathKey, raw) => {
    const text = String(raw ?? "");
    // เก็บเป็นข้อความตอนพิมพ์ — ว่างได้ ไม่บังคับเป็น 0 ทันที
    if (text !== "" && !/^\d*\.?\d*$/.test(text)) return;
    setDraft((prev) => ({
      ...prev,
      values: { ...(prev.values || {}), [pathKey]: text },
    }));
  };

  const handleSave = () => {
    const result = flushDraft();
    if (result?.ok) return;
    if (result?.message && result.message !== NAME_REQUIRED_MSG) {
      setError(result.message);
    }
  };

  const handleDelete = () => {
    const id = editingId || draft.id;
    if (!findCalculationById(list, id)) {
      resetDraft();
      return;
    }
    onSaveCalculations?.(list.filter((item) => item.id !== id));
    resetDraft();
  };

  return (
    <div
      className="absolute inset-0 z-[90] flex flex-col overflow-hidden"
      style={{ background: C.panel, color: C.text }}
    >
      <div className="dash-panel-header flex shrink-0 items-center justify-between border-b px-4 pt-4 pb-3">
        <span className="font-bold tracking-wide">ตั้งค่าการคำนวณ</span>
        <button
          type="button"
          className="rounded-lg p-2 transition hover:opacity-70"
          onClick={onClose}
          aria-label="ปิด"
          style={{ color: C.heading }}
        >
          <X size={16} />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="mb-2 flex items-center gap-2">
          <span
            className="dash-panel-label shrink-0 text-[13px] font-semibold"
            style={{ color: C.heading }}
          >
            ชื่อการคำนวณ
          </span>
          <div
            className="dash-heading-rule min-w-0 flex-1 border-b"
            style={{
              borderColor: `color-mix(in srgb, ${C.heading} 15%, transparent)`,
            }}
          />
        </div>
        <input
          ref={nameInputRef}
          type="text"
          className={[
            "dash-input calc-name-input mb-4 h-[34px] w-full rounded-md border px-2.5 text-[12px] outline-none",
            nameInvalid ? "calc-name-invalid" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          style={{
            color: nameInvalid ? "rgba(239, 68, 68, 0.85)" : C.surfaceText,
          }}
          value={draft.name || ""}
          placeholder="เช่น ค่าบริการ"
          aria-invalid={nameInvalid || undefined}
          onFocus={() => {
            if (
              nameInvalid &&
              String(draft.name || "").trim() === NAME_REQUIRED_MSG
            ) {
              setDraft((prev) => ({ ...prev, name: "" }));
            }
          }}
          onChange={(event) => {
            if (nameInvalid) setNameInvalid(false);
            setDraft((prev) => ({ ...prev, name: event.target.value }));
          }}
        />

        <div className="mb-2 flex items-center gap-2">
          <span
            className="dash-panel-label shrink-0 text-[13px] font-semibold"
            style={{ color: C.heading }}
          >
            เลือกความสัมพันธ์
          </span>
          <span
            className="shrink-0 text-[12px] font-medium tabular-nums"
            style={{ color: C.textMuted }}
          >
            {activeFieldIds.length}/{MAX_CALCULATION_SELECTS}
          </span>
          <div
            className="dash-heading-rule min-w-0 flex-1 border-b"
            style={{
              borderColor: `color-mix(in srgb, ${C.heading} 15%, transparent)`,
            }}
          />
        </div>

        {availableFields.length === 0 ? (
          <div
            className="mb-4 rounded-md border border-dashed px-3 py-4 text-center text-[12px]"
            style={{
              borderColor: C.border,
              color: C.textMuted,
              background: C.surface,
            }}
          >
            ยังไม่มี Select ในฟอร์มนี้
          </div>
        ) : (
          <div className="mb-4 grid grid-cols-2 gap-2">
            {availableFields.map((field) => {
              const fieldId = String(field?.id || "");
              const checked = activeFieldIds.includes(fieldId);
              const lockedElsewhere = blockedIds.has(fieldId);
              const disabled = lockedElsewhere || (!checked && atMax);
              return (
                <button
                  key={fieldId}
                  type="button"
                  disabled={disabled}
                  title={
                    lockedElsewhere
                      ? "ถูกใช้แล้ว (Conditional หรือสูตรอื่น) — ล้างค่าก่อน"
                      : !checked && atMax
                        ? `เลือกได้สูงสุด ${MAX_CALCULATION_SELECTS} ตัว`
                        : selectLabel(field)
                  }
                  onClick={() => toggleFieldCard(fieldId)}
                  className={`relative flex h-[36px] items-center gap-2 rounded-md border px-2.5 text-left transition ${
                    disabled
                      ? "cursor-not-allowed opacity-45"
                      : "cursor-pointer hover:opacity-90"
                  }`}
                  style={{
                    background: C.surface,
                    borderColor: checked ? C.activeBorder : C.surfaceBorder,
                    color: C.heading,
                  }}
                  >
                  <span
                    className="inline-flex size-[18px] shrink-0 items-center justify-center rounded-[4px] border-[1.5px]"
                    style={{
                      borderColor: checked ? C.active : C.surfaceBorder,
                      background: checked ? C.active : "transparent",
                    }}
                    aria-hidden
                  >
                    {checked ? (
                      <Check
                        size={12}
                        strokeWidth={3}
                        style={{ color: C.activeText }}
                      />
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[12px] font-semibold">
                    {selectLabel(field)}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {pathKeys.length > 0 ? (
          <>
            <div className="mb-2 flex items-center gap-2">
              <span
                className="dash-panel-label shrink-0 text-[13px] font-semibold"
                style={{ color: C.heading }}
              >
                ค่าความสัมพันธ์
              </span>
              <span
                className="shrink-0 text-[12px] font-medium tabular-nums"
                style={{ color: C.textMuted }}
              >
                {pathKeys.length}
              </span>
              <div
                className="dash-heading-rule min-w-0 flex-1 border-b"
                style={{
                  borderColor: `color-mix(in srgb, ${C.heading} 15%, transparent)`,
                }}
              />
            </div>
            <div
              className="overflow-hidden rounded-md border"
              style={{
                borderColor: C.surfaceBorder,
                background: C.surface,
              }}
            >
              <ul>
                {pathKeys.map((pathKey, rowIndex) => {
                  const parts = splitPathKey(pathKey);
                  const raw = draft.values?.[pathKey];
                  const display =
                    raw === undefined || raw === null || raw === 0
                      ? ""
                      : String(raw);
                  const pathTitle = parts.join(" → ");
                  return (
                    <li
                      key={pathKey}
                      className="flex items-center gap-2 px-2.5 py-2"
                      style={{
                        borderTop:
                          rowIndex === 0
                            ? "none"
                            : `1px solid ${C.surfaceBorder}`,
                        background:
                          rowIndex % 2 === 1
                            ? "color-mix(in srgb, var(--dash-panel-btn-group-border, #e2e8f0) 35%, transparent)"
                            : "transparent",
                      }}
                    >
                      <div
                        className="flex min-w-0 flex-1 flex-wrap items-center gap-x-0.5 gap-y-1"
                        title={pathTitle}
                      >
                        {parts.map((part, partIndex) => (
                          <span
                            key={`${pathKey}-${partIndex}`}
                            className="inline-flex min-w-0 max-w-full items-center"
                          >
                            {partIndex > 0 ? (
                              <ChevronRight
                                className="mx-0.5 h-3 w-3 shrink-0 opacity-45"
                                strokeWidth={2.25}
                                style={{ color: C.textMuted }}
                                aria-hidden
                              />
                            ) : null}
                            <span
                              className="inline-block max-w-[9.5rem] truncate rounded px-1.5 py-0.5 text-[11px] font-medium leading-snug"
                              style={{
                                background:
                                  "color-mix(in srgb, var(--dash-panel-btn-group-active, #333333) 8%, transparent)",
                                color: C.heading,
                              }}
                            >
                              {part}
                            </span>
                          </span>
                        ))}
                      </div>
                      <input
                        type="text"
                        inputMode="decimal"
                        className="dash-input h-[28px] w-[72px] shrink-0 rounded-md border px-1.5 text-center text-[12px] tabular-nums outline-none"
                        style={{ color: C.surfaceText }}
                        value={display}
                        placeholder="0"
                        aria-label={`ค่า ${pathTitle}`}
                        onChange={(event) =>
                          setPathValue(pathKey, event.target.value)
                        }
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          </>
        ) : activeFieldIds.length > 0 ? (
          <p className="text-[12px]" style={{ color: C.textMuted }}>
            Select ที่เลือกยังไม่มีตัวเลือก — ไปตั้งค่า options ก่อน
          </p>
        ) : null}

        {error ? (
          <p className="mt-4 text-[12px] font-medium text-red-500">{error}</p>
        ) : null}
      </div>

      <div
        className="flex shrink-0 items-center justify-between gap-2 border-t px-4 py-3"
        style={{ borderColor: C.border, background: C.panel }}
      >
        <button
          type="button"
          onClick={handleDelete}
          className="inline-flex h-[30px] items-center rounded-md px-2.5 text-[11px] font-medium transition hover:opacity-90"
          style={{ background: C.active, color: C.activeText }}
        >
          ล้างค่า
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-[30px] items-center rounded-md border px-2.5 text-[11px] font-medium transition hover:opacity-90"
            style={{
              borderColor: C.surfaceBorder,
              background: C.surface,
              color: C.surfaceText,
            }}
          >
            ปิด
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="inline-flex h-[30px] items-center rounded-md px-2.5 text-[11px] font-medium transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            style={{ background: C.active, color: C.activeText }}
          >
            บันทึกการคำนวณ
          </button>
        </div>
      </div>
    </div>
  );
}
