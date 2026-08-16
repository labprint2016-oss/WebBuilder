import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import {
  CALC_KIND_FORMULA,
  createEmptyFormula,
  findCalculationById,
  findFormFormula,
  formatFormulaTokens,
  normalizeCalculation,
  normalizeCalculations,
  sanitizeFormulaTokens,
  selectHasFilledOptionValues,
} from "../formCalculations";

const NAME_REQUIRED_MSG = "กรุณาตั้งชื่อสูตรคำนวณ";

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
};

const OP_BUTTONS = [
  { label: "+", value: "+", type: "op" },
  { label: "−", value: "-", type: "op" },
  { label: "×", value: "*", type: "op" },
  { label: "÷", value: "/", type: "op" },
  { label: "(", value: "(", type: "paren" },
  { label: ")", value: ")", type: "paren" },
];

const selectLabel = (field) => {
  const label =
    typeof field?.label === "string" && field.label.trim()
      ? field.label.trim()
      : "Select";
  return label;
};

const tokenChipLabel = (token, fieldsById) => {
  if (token?.type === "num") return String(token.value ?? "");
  if (token?.type === "op") {
    if (token.value === "*") return "×";
    if (token.value === "/") return "÷";
    if (token.value === "-") return "−";
    return String(token.value);
  }
  if (token?.type === "paren") return String(token.value);
  if (token?.type === "field") {
    return selectLabel(fieldsById?.[token.fieldId]);
  }
  return "";
};

/**
 * Panel สูตรคำนวณ — 1 สูตรต่อฟอร์ม
 * สร้าง expression (+ − × ÷ () + ตัวเลข + ค่า Select) แล้วให้ Sum เลือกชื่อสูตรได้
 */
export default function FormFormulaPanel({
  open = false,
  onClose,
  selectFields = [],
  calculations = [],
  onSaveCalculations,
  registerFlushHandler = null,
}) {
  const list = useMemo(
    () => normalizeCalculations(calculations),
    [calculations]
  );
  const fieldsById = useMemo(() => {
    const map = {};
    (Array.isArray(selectFields) ? selectFields : []).forEach((field) => {
      if (field?.id) map[field.id] = field;
    });
    return map;
  }, [selectFields]);

  const usableSelects = useMemo(
    () =>
      (Array.isArray(selectFields) ? selectFields : []).filter((field) =>
        selectHasFilledOptionValues(field)
      ),
    [selectFields]
  );

  const [editingId, setEditingId] = useState("");
  const [draft, setDraft] = useState(() => createEmptyFormula());
  const [error, setError] = useState("");
  const [nameInvalid, setNameInvalid] = useState(false);
  const [numberDraft, setNumberDraft] = useState("");
  const nameInputRef = useRef(null);

  const showNameRequired = useCallback(() => {
    setNameInvalid(true);
    setDraft((prev) => ({ ...prev, name: NAME_REQUIRED_MSG }));
    requestAnimationFrame(() => {
      nameInputRef.current?.focus?.();
      nameInputRef.current?.select?.();
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    // 1 สูตรต่อฟอร์ม — เปิดจาก Select ใดก็แก้สูตรเดียวกัน
    const existing = findFormFormula(list);
    if (existing) {
      setEditingId(existing.id);
      setDraft(normalizeCalculation(existing));
    } else {
      setEditingId("");
      setDraft(createEmptyFormula());
    }
    setError("");
    setNameInvalid(false);
    setNumberDraft("");
  }, [open, list]);

  const tokens = useMemo(
    () => sanitizeFormulaTokens(draft.tokens),
    [draft.tokens]
  );

  const existingCalc = useMemo(() => {
    const id = String(editingId || draft.id || "").trim();
    return findCalculationById(list, id) || findFormFormula(list);
  }, [list, editingId, draft.id]);

  const hasChanges = useMemo(() => {
    const name = String(draft.name || "").trim();
    const safeName =
      nameInvalid && name === NAME_REQUIRED_MSG ? "" : name;
    if (!existingCalc || existingCalc.kind !== CALC_KIND_FORMULA) {
      return safeName.length > 0 || tokens.length > 0;
    }
    const saved = normalizeCalculation(existingCalc);
    if (safeName !== String(saved.name || "").trim()) return true;
    const savedTokens = sanitizeFormulaTokens(saved.tokens);
    if (tokens.length !== savedTokens.length) return true;
    return tokens.some((token, index) => {
      const other = savedTokens[index];
      if (!other || token.type !== other.type) return true;
      if (token.type === "field") {
        return token.fieldId !== other.fieldId;
      }
      return String(token.value) !== String(other.value);
    });
  }, [existingCalc, draft.name, tokens, nameInvalid]);

  const pushToken = (token) => {
    setError("");
    setDraft((prev) => ({
      ...prev,
      tokens: [...sanitizeFormulaTokens(prev.tokens), token],
    }));
  };

  const popToken = () => {
    setError("");
    setDraft((prev) => {
      const next = sanitizeFormulaTokens(prev.tokens);
      if (next.length === 0) return prev;
      return { ...prev, tokens: next.slice(0, -1) };
    });
  };

  const insertNumber = () => {
    const text = String(numberDraft || "").trim();
    if (text === "" || !/^\d*\.?\d+$/.test(text)) {
      setError("กรอกตัวเลขก่อนใส่ในสูตร");
      return;
    }
    const n = Number(text);
    if (!Number.isFinite(n)) {
      setError("ตัวเลขไม่ถูกต้อง");
      return;
    }
    pushToken({ type: "num", value: String(n) });
    setNumberDraft("");
  };

  const flushDraft = useCallback(() => {
    if (!open) return { ok: true, skipped: true };
    if (!hasChanges) return { ok: true, skipped: true };

    let name = String(draft.name || "").trim();
    if (nameInvalid && name === NAME_REQUIRED_MSG) name = "";
    if (!name) {
      showNameRequired();
      return {
        ok: false,
        block: true,
        message: NAME_REQUIRED_MSG,
      };
    }
    if (tokens.length === 0) {
      setError("สร้างสูตรอย่างน้อย 1 ตัวก่อนบันทึก");
      return {
        ok: false,
        block: true,
        message: "สร้างสูตรอย่างน้อย 1 ตัวก่อนบันทึก",
      };
    }
    if (usableSelects.length === 0) {
      setError("เปิดกำหนดค่าและกรอกค่าตัวเลือก Select อย่างน้อย 1 ตัวก่อน");
      return {
        ok: false,
        block: true,
        message: "เปิดกำหนดค่าและกรอกค่าตัวเลือก Select อย่างน้อย 1 ตัวก่อน",
      };
    }

    const keepId =
      String(editingId || draft.id || findFormFormula(list)?.id || "").trim() ||
      draft.id;
    const nextCalc = normalizeCalculation({
      ...draft,
      kind: CALC_KIND_FORMULA,
      id: keepId,
      name,
      tokens,
    });
    // 1 สูตรต่อฟอร์ม — ลบสูตรอื่นทั้งหมด เหลืออันนี้
    const withoutFormulas = list.filter(
      (item) => item.kind !== CALC_KIND_FORMULA
    );
    onSaveCalculations?.([...withoutFormulas, nextCalc]);
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
    tokens,
    usableSelects,
    list,
    editingId,
    onSaveCalculations,
    showNameRequired,
  ]);

  useEffect(() => {
    if (typeof registerFlushHandler !== "function") return undefined;
    if (!open) {
      registerFlushHandler("formula", null);
      return () => registerFlushHandler("formula", null);
    }
    registerFlushHandler("formula", {
      flush: flushDraft,
      isDirty: () => hasChanges,
    });
    return () => registerFlushHandler("formula", null);
  }, [open, flushDraft, hasChanges, registerFlushHandler]);

  if (!open) return null;

  const handleSave = () => {
    const result = flushDraft();
    if (result?.ok) return;
    if (result?.message && result.message !== NAME_REQUIRED_MSG) {
      setError(result.message);
    }
  };

  const handleDelete = () => {
    const id = editingId || draft.id || findFormFormula(list)?.id;
    if (!id || !findCalculationById(list, id)) {
      setDraft(createEmptyFormula());
      setEditingId("");
      setError("");
      setNameInvalid(false);
      setNumberDraft("");
      return;
    }
    onSaveCalculations?.(
      list.filter((item) => item.kind !== CALC_KIND_FORMULA)
    );
    setDraft(createEmptyFormula());
    setEditingId("");
    setError("");
    setNameInvalid(false);
    setNumberDraft("");
  };

  const preview = formatFormulaTokens(tokens, fieldsById);

  return (
    <div
      className="absolute inset-0 z-[90] flex flex-col overflow-hidden"
      style={{ background: C.panel, color: C.text }}
    >
      <div className="dash-panel-header flex shrink-0 items-center justify-between border-b px-4 pt-4 pb-3">
        <span className="font-bold tracking-wide">ตั้งค่าสูตรคำนวณ</span>
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
            ชื่อสูตร
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
            "dash-input formula-name-input mb-4 h-[34px] w-full rounded-md border px-2.5 text-[12px] outline-none",
            nameInvalid ? "calc-name-invalid" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          style={{
            color: nameInvalid ? "rgba(239, 68, 68, 0.85)" : C.surfaceText,
          }}
          value={draft.name || ""}
          placeholder="ชื่อสูตรคำนวณ"
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

        {usableSelects.length === 0 ? (
          <p className="mb-3 text-[12px]" style={{ color: C.textMuted }}>
            ไม่มี Select ที่เปิดกำหนดค่าและกรอกตัวเลขแล้ว
          </p>
        ) : (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {usableSelects.map((field) => (
              <button
                key={field.id}
                type="button"
                className="inline-flex h-[30px] max-w-full items-center rounded-md border px-2.5 text-[12px] font-semibold transition hover:opacity-90"
                style={{
                  background: C.surface,
                  borderColor: C.surfaceBorder,
                  color: C.heading,
                }}
                title="ใส่ค่า Select นี้ในสูตร"
                onClick={() =>
                  pushToken({ type: "field", fieldId: field.id })
                }
              >
                <span className="truncate">{selectLabel(field)}</span>
              </button>
            ))}
          </div>
        )}

        <div className="mb-4 flex items-stretch gap-2">
          <input
            type="text"
            inputMode="decimal"
            className="dash-input formula-num-input h-[30px] min-w-0 flex-1 rounded-md border px-2.5 text-[12px] outline-none"
            style={{ color: C.surfaceText }}
            value={numberDraft}
            placeholder="ใส่ตัวเลข"
            onChange={(event) => {
              const raw = String(event.target.value ?? "");
              if (raw !== "" && !/^\d*\.?\d*$/.test(raw)) return;
              setNumberDraft(raw);
              setError("");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                insertNumber();
              }
            }}
          />
          <button
            type="button"
            className="inline-flex h-[30px] shrink-0 items-center rounded-md px-3 text-[12px] font-semibold transition hover:opacity-90"
            style={{ background: C.active, color: C.activeText }}
            onClick={insertNumber}
          >
            เพิ่มค่าคำนวณ
          </button>
        </div>

        <div
          className="flex items-center gap-2"
          style={{ paddingBottom: 10 }}
        >
          <span
            className="dash-panel-label shrink-0 text-[13px] font-semibold"
            style={{ color: C.heading }}
          >
            สร้างสูตร
          </span>
          <div
            className="dash-heading-rule min-w-0 flex-1 border-b"
            style={{
              borderColor: `color-mix(in srgb, ${C.heading} 15%, transparent)`,
            }}
          />
        </div>

        <div
          className={`mb-3 min-h-[72px] rounded-md border px-2.5 py-2 ${
            tokens.length === 0 ? "flex items-center justify-center" : ""
          }`}
          style={{
            borderColor: C.surfaceBorder,
            background: C.surface,
          }}
        >
          {tokens.length === 0 ? (
            <p
              className="text-center text-[12px]"
              style={{ color: C.textMuted }}
            >
              ยังไม่มีสูตร
            </p>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-1.5">
                {tokens.map((token, index) => (
                  <span
                    key={`${token.type}-${index}-${token.value || token.fieldId}`}
                    className="inline-flex items-center rounded-md px-2 py-1 text-[12px] font-semibold"
                    style={{
                      background:
                        token.type === "field"
                          ? "color-mix(in srgb, var(--dash-panel-btn-group-active, #333333) 12%, transparent)"
                          : token.type === "num"
                            ? "color-mix(in srgb, var(--dash-panel-btn-group-active, #333333) 7%, transparent)"
                            : "transparent",
                      border:
                        token.type === "op" || token.type === "paren"
                          ? `1px solid ${C.surfaceBorder}`
                          : "1px solid transparent",
                      color: C.heading,
                    }}
                  >
                    {tokenChipLabel(token, fieldsById)}
                  </span>
                ))}
              </div>
              {preview ? (
                <p
                  className="mt-2 border-t pt-2 text-[11px] tabular-nums"
                  style={{ borderColor: C.surfaceBorder, color: C.textMuted }}
                >
                  {preview}
                </p>
              ) : null}
            </>
          )}
        </div>

        <div className="mb-3 flex w-full items-center gap-1">
          {OP_BUTTONS.map((item) => (
            <button
              key={item.label}
              type="button"
              className="inline-flex h-[28px] min-w-0 flex-1 items-center justify-center rounded-md text-[12px] font-semibold transition hover:opacity-90"
              style={{ background: C.active, color: C.activeText }}
              onClick={() =>
                pushToken(
                  item.type === "paren"
                    ? { type: "paren", value: item.value }
                    : { type: "op", value: item.value }
                )
              }
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            className="inline-flex h-[28px] min-w-0 flex-[1.6] items-center justify-center whitespace-nowrap rounded-md border px-1 text-[11px] font-medium transition hover:opacity-90 disabled:opacity-40"
            style={{
              borderColor: C.surfaceBorder,
              background: C.surface,
              color: C.surfaceText,
            }}
            onClick={popToken}
            disabled={tokens.length === 0}
          >
            ลบจากท้ายสุด
          </button>
        </div>

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
            disabled={!hasChanges}
            className="inline-flex h-[30px] items-center rounded-md px-2.5 text-[11px] font-medium transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            style={{ background: C.active, color: C.activeText }}
          >
            บันทึกสูตรคำนวณ
          </button>
        </div>
      </div>
    </div>
  );
}
