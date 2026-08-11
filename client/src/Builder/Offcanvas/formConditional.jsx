import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ArrowDown, ArrowUp, Check, X } from "lucide-react";
import {
  MAX_CONDITIONAL_SELECTS,
  createEmptyConditionalChain,
  fieldIdsUsedByOtherChains,
  findChainByFieldId,
  normalizeConditionalChain,
  normalizeConditionalChains,
} from "../formConditionalSelect";

const selectLabel = (field) => {
  const label =
    typeof field?.label === "string" && field.label.trim()
      ? field.label.trim()
      : "Select";
  return label;
};

/** สีจาก Dashboard Settings — สลับ Light/Dark ตาม CSS vars */
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

/** FLIP animation เมื่อสลับลำดับรายการ (ขึ้น/ลง) — ใช้ offsetTop ไม่ติด transform */
function useSmoothReorder(itemIds) {
  const listRef = useRef(null);
  const prevTopsRef = useRef(new Map());

  useLayoutEffect(() => {
    const root = listRef.current;
    if (!root) return;
    const nodes = Array.from(root.querySelectorAll("[data-order-id]"));

    nodes.forEach((node) => {
      const id = node.getAttribute("data-order-id");
      if (!id) return;
      const nextTop = node.offsetTop;
      const prevTop = prevTopsRef.current.get(id);
      if (prevTop == null) return;
      const dy = prevTop - nextTop;
      if (Math.abs(dy) < 0.5) return;

      node.getAnimations?.().forEach((animation) => animation.cancel());
      node.animate(
        [
          { transform: `translateY(${dy}px)` },
          { transform: "translateY(0px)" },
        ],
        {
          duration: 240,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        }
      );
    });

    const nextMap = new Map();
    nodes.forEach((node) => {
      const id = node.getAttribute("data-order-id");
      if (!id) return;
      nextMap.set(id, node.offsetTop);
    });
    prevTopsRef.current = nextMap;
  }, [itemIds]);

  return listRef;
}

/**
 * Panel เลือก Select ที่ผูกกัน (2–4)
 * ความสัมพันธ์สร้างที่หน้าออกแบบ
 */
export default function FormConditionalPanel({
  open = false,
  onClose,
  currentFieldId = "",
  selectFields = [],
  conditionalChains = [],
  onSaveChains,
  /** Select ที่ถูกใช้ในการคำนวณแล้ว — เลือกไม่ได้ */
  blockedFieldIds = [],
  registerFlushHandler = null,
}) {
  const chains = useMemo(
    () => normalizeConditionalChains(conditionalChains),
    [conditionalChains]
  );
  const selectFieldsById = useMemo(() => {
    const map = {};
    (Array.isArray(selectFields) ? selectFields : []).forEach((field) => {
      if (field?.id) map[field.id] = field;
    });
    return map;
  }, [selectFields]);

  const [draft, setDraft] = useState(() =>
    createEmptyConditionalChain(currentFieldId)
  );
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    const existing = findChainByFieldId(chains, currentFieldId);
    if (existing) {
      setDraft(normalizeConditionalChain(existing));
    } else {
      setDraft(createEmptyConditionalChain(currentFieldId));
    }
    setError("");
  }, [open, currentFieldId, chains]);

  const activeFieldIds = useMemo(
    () =>
      (draft.fieldIds || [])
        .map((id) => String(id || "").trim())
        .filter(Boolean),
    [draft.fieldIds]
  );
  const orderListRef = useSmoothReorder(activeFieldIds.join("|"));

  const blockedByCalculation = useMemo(() => {
    const set = new Set();
    (Array.isArray(blockedFieldIds) ? blockedFieldIds : []).forEach((id) => {
      const safe = String(id || "").trim();
      if (safe) set.add(safe);
    });
    return set;
  }, [blockedFieldIds]);

  const flushDraft = useCallback(() => {
    if (!open) return { ok: true, skipped: true };
    const fieldIds = (draft.fieldIds || [])
      .map((id) => String(id || "").trim())
      .filter(Boolean);
    if (fieldIds.length < 2) return { ok: true, skipped: true };
    const usedElsewhere = fieldIdsUsedByOtherChains(chains, draft.id);
    if (fieldIds.some((id) => usedElsewhere.has(id))) {
      return { ok: false, skipped: true };
    }
    if (fieldIds.some((id) => blockedByCalculation.has(id))) {
      return { ok: false, skipped: true };
    }
    if (fieldIds.some((id) => !selectFieldsById[id])) {
      return { ok: false, skipped: true };
    }

    const existing =
      chains.find((chain) => chain.id === draft.id) ||
      findChainByFieldId(chains, currentFieldId);
    const savedFieldIds = Array.isArray(existing?.fieldIds)
      ? existing.fieldIds.map((id) => String(id || "").trim()).filter(Boolean)
      : [];
    const membershipUnchanged =
      Boolean(existing) &&
      savedFieldIds.length === fieldIds.length &&
      savedFieldIds.every((id, index) => id === fieldIds[index]);
    const hasChanges = existing ? !membershipUnchanged : fieldIds.length >= 2;
    if (!hasChanges) return { ok: true, skipped: true };

    const membershipSame =
      existing &&
      existing.fieldIds.length === fieldIds.length &&
      existing.fieldIds.every((id, index) => id === fieldIds[index]);
    const nextChain = normalizeConditionalChain({
      ...draft,
      fieldIds,
      rules: membershipSame ? draft.rules || existing?.rules || {} : {},
    });
    const without = chains.filter((chain) => chain.id !== nextChain.id);
    const filtered = without.filter(
      (chain) => !chain.fieldIds.some((id) => fieldIds.includes(id))
    );
    onSaveChains?.([...filtered, nextChain]);
    setError("");
    return { ok: true };
  }, [
    open,
    draft,
    chains,
    blockedByCalculation,
    selectFieldsById,
    currentFieldId,
    onSaveChains,
  ]);

  const existingChainForDirty =
    chains.find((chain) => chain.id === draft.id) ||
    findChainByFieldId(chains, currentFieldId);
  const savedFieldIdsForDirty = Array.isArray(existingChainForDirty?.fieldIds)
    ? existingChainForDirty.fieldIds
        .map((id) => String(id || "").trim())
        .filter(Boolean)
    : [];
  const conditionalDraftDirty = (() => {
    if (!open) return false;
    if (activeFieldIds.length < 2) return false;
    if (!existingChainForDirty) return true;
    return !(
      savedFieldIdsForDirty.length === activeFieldIds.length &&
      savedFieldIdsForDirty.every((id, index) => id === activeFieldIds[index])
    );
  })();

  useEffect(() => {
    if (typeof registerFlushHandler !== "function") return undefined;
    if (!open) {
      registerFlushHandler("conditional", null);
      return () => registerFlushHandler("conditional", null);
    }
    registerFlushHandler("conditional", {
      flush: flushDraft,
      isDirty: () => conditionalDraftDirty,
    });
    return () => registerFlushHandler("conditional", null);
  }, [open, flushDraft, conditionalDraftDirty, registerFlushHandler]);

  if (!open) return null;

  const usedElsewhere = fieldIdsUsedByOtherChains(chains, draft.id);
  const atMax = activeFieldIds.length >= MAX_CONDITIONAL_SELECTS;

  const toggleFieldCard = (fieldId) => {
    const id = String(fieldId || "").trim();
    if (!id || usedElsewhere.has(id)) return;
    if (blockedByCalculation.has(id)) {
      setError("Select นี้ใช้อยู่ในการคำนวณ — ล้างค่าการคำนวณก่อน");
      return;
    }
    setError("");
    setDraft((prev) => {
      const current = (prev.fieldIds || [])
        .map((item) => String(item || "").trim())
        .filter(Boolean);
      const checked = current.includes(id);
      let nextIds;
      if (checked) {
        nextIds = current.filter((item) => item !== id);
      } else {
        if (current.length >= MAX_CONDITIONAL_SELECTS) return prev;
        nextIds = [...current, id];
      }
      const membershipChanged =
        nextIds.length !== current.length ||
        nextIds.some((item, index) => item !== current[index]);
      return {
        ...prev,
        fieldIds: nextIds,
        // เปลี่ยนสมาชิกโซ่แล้วรีเซ็ต rules — ไปสร้างใหม่ที่หน้าออกแบบ
        rules: membershipChanged ? {} : prev.rules || {},
      };
    });
  };

  const moveField = (index, direction) => {
    setError("");
    setDraft((prev) => {
      const current = (prev.fieldIds || [])
        .map((item) => String(item || "").trim())
        .filter(Boolean);
      const target = index + direction;
      if (target < 0 || target >= current.length) return prev;
      const nextIds = [...current];
      const [item] = nextIds.splice(index, 1);
      nextIds.splice(target, 0, item);
      return {
        ...prev,
        fieldIds: nextIds,
        rules: {},
      };
    });
  };

  const handleSave = () => {
    const fieldIds = (draft.fieldIds || [])
      .map((id) => String(id || "").trim())
      .filter(Boolean);
    if (fieldIds.length < 2) {
      setError("เลือก Select อย่างน้อย 2 ตัว");
      return;
    }
    if (fieldIds.some((id) => usedElsewhere.has(id))) {
      setError("มี Select ที่ถูกใช้ในโซ่อื่นแล้ว");
      return;
    }
    if (fieldIds.some((id) => blockedByCalculation.has(id))) {
      setError("มี Select ที่ใช้อยู่ในการคำนวณ — ล้างค่าการคำนวณก่อน");
      return;
    }
    if (fieldIds.some((id) => !selectFieldsById[id])) {
      setError("มี Select ที่ไม่พบในฟอร์ม");
      return;
    }
    const result = flushDraft();
    if (result?.ok && !result?.skipped) onClose?.();
  };

  const handleDeleteChain = () => {
    if (
      !findChainByFieldId(chains, currentFieldId) &&
      !chains.some((c) => c.id === draft.id)
    ) {
      onClose?.();
      return;
    }
    const next = chains.filter((chain) => chain.id !== draft.id);
    onSaveChains?.(next);
    onClose?.();
  };

  const availableFields = Array.isArray(selectFields) ? selectFields : [];

  const existingChain =
    chains.find((chain) => chain.id === draft.id) ||
    findChainByFieldId(chains, currentFieldId);
  const savedFieldIds = Array.isArray(existingChain?.fieldIds)
    ? existingChain.fieldIds.map((id) => String(id || "").trim()).filter(Boolean)
    : [];
  const membershipUnchanged =
    Boolean(existingChain) &&
    savedFieldIds.length === activeFieldIds.length &&
    savedFieldIds.every((id, index) => id === activeFieldIds[index]);
  const hasChanges = existingChain
    ? !membershipUnchanged
    : activeFieldIds.length >= 2;
  const canSave = hasChanges && activeFieldIds.length >= 2;

  return (
    <div
      className="absolute inset-0 z-[90] flex flex-col overflow-hidden"
      style={{ background: C.panel, color: C.text }}
    >
      <div className="dash-panel-header flex shrink-0 items-center justify-between border-b px-4 pt-4 pb-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="font-bold tracking-wide">ตั้งค่าความสัมพันธ์</span>
        </div>
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
            เลือกความสัมพันธ์
          </span>
          <span
            className="shrink-0 text-[12px] font-medium tabular-nums"
            style={{ color: C.textMuted }}
          >
            {activeFieldIds.length}/{MAX_CONDITIONAL_SELECTS}
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
            className="rounded-md border border-dashed px-3 py-4 text-center text-[12px]"
            style={{
              borderColor: C.border,
              color: C.textMuted,
              background: C.surface,
            }}
          >
            ยังไม่มี Select ในฟอร์มนี้
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {availableFields.map((field) => {
              const fieldId = String(field?.id || "");
              const orderIndex = activeFieldIds.indexOf(fieldId);
              const checked = orderIndex >= 0;
              const lockedElsewhere = usedElsewhere.has(fieldId);
              const lockedByCalculation = blockedByCalculation.has(fieldId);
              const blockedByMax = !checked && atMax;
              const disabled =
                lockedElsewhere || lockedByCalculation || blockedByMax;

              return (
                <button
                  key={fieldId}
                  type="button"
                  disabled={disabled}
                  title={
                    lockedByCalculation
                      ? "ใช้อยู่ในการคำนวณ — ล้างค่าการคำนวณก่อน"
                      : lockedElsewhere
                        ? "ถูกใช้ในโซ่อื่นแล้ว"
                        : blockedByMax
                          ? `เลือกได้สูงสุด ${MAX_CONDITIONAL_SELECTS} ตัว`
                          : selectLabel(field)
                  }
                  aria-pressed={checked}
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
                  <span
                    className="min-w-0 flex-1 truncate text-[12px] font-semibold"
                    style={{ color: C.heading }}
                  >
                    {selectLabel(field)}
                  </span>
                  {checked ? (
                    <span
                      className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[10px] font-bold tabular-nums"
                      style={{
                        background: C.active,
                        color: C.activeText,
                      }}
                    >
                      {orderIndex + 1}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        )}

        {activeFieldIds.length > 0 ? (
          <div className="mt-5">
            <div className="mb-2 flex items-center gap-2">
              <span
                className="dash-panel-label shrink-0 text-[13px] font-semibold"
                style={{ color: C.heading }}
              >
                ลำดับความสัมพันธ์
              </span>
              <div
                className="dash-heading-rule min-w-0 flex-1 border-b"
                style={{
                  borderColor: `color-mix(in srgb, ${C.heading} 15%, transparent)`,
                }}
              />
            </div>
            <div ref={orderListRef} className="flex flex-col gap-1.5">
              {activeFieldIds.map((fieldId, index) => {
                const field = selectFieldsById[fieldId];
                return (
                  <div
                    key={fieldId}
                    data-order-id={fieldId}
                    className="flex items-center gap-2 rounded-md border px-2 py-1.5 will-change-transform"
                    style={{
                      borderColor: C.surfaceBorder,
                      background: C.surface,
                      color: C.heading,
                    }}
                  >
                    <span
                      className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                      style={{
                        background: C.active,
                        color: C.activeText,
                      }}
                    >
                      {index + 1}
                    </span>
                    <span
                      className="min-w-0 flex-1 truncate text-[12px] font-medium"
                      style={{ color: C.heading }}
                    >
                      {selectLabel(field)}
                    </span>
                    <button
                      type="button"
                      title="เลื่อนขึ้น"
                      disabled={index === 0}
                      onClick={() => moveField(index, -1)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md transition hover:opacity-80 disabled:opacity-30"
                      style={{ color: C.textMuted }}
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      title="เลื่อนลง"
                      disabled={index === activeFieldIds.length - 1}
                      onClick={() => moveField(index, 1)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md transition hover:opacity-80 disabled:opacity-30"
                      style={{ color: C.textMuted }}
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {error ? (
          <p className="mt-4 text-[12px] font-medium text-red-500">{error}</p>
        ) : null}
      </div>

      <div
        className="flex shrink-0 items-center justify-between gap-2 border-t px-4 py-3"
        style={{
          borderColor: C.border,
          background: C.panel,
        }}
      >
        <button
          type="button"
          onClick={handleDeleteChain}
          className="inline-flex h-[30px] items-center rounded-md px-2.5 text-[11px] font-medium transition hover:opacity-90"
          style={{
            background: C.active,
            color: C.activeText,
          }}
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
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="inline-flex h-[30px] items-center rounded-md px-2.5 text-[11px] font-medium transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              background: C.active,
              color: C.activeText,
            }}
          >
            บันทึกความสัมพันธ์
          </button>
        </div>
      </div>
    </div>
  );
}
