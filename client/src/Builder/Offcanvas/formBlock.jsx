import React, { useEffect, useMemo, useState } from "react";
import { MessageCircle } from "lucide-react";
import { getForms } from "../../../Functions/forms";
import Range from "../HTML/Range";

const FORMS_MENU_BAR_ID = "69db17211be82fe7637ea096";
const SPACING_MIN = 0;
const SPACING_MAX = 80;
const DEFAULT_MARGIN_X = 0;
const DEFAULT_MARGIN_Y = 8;

const clampSpacing = (value, fallback) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(SPACING_MIN, Math.min(SPACING_MAX, Math.round(n)));
};

const readMarginX = (element) =>
  clampSpacing(
    element?.formMarginX ?? element?.formGapX,
    DEFAULT_MARGIN_X
  );

const readMarginY = (element) =>
  clampSpacing(
    element?.formMarginY ??
      element?.formGapY ??
      element?.formMarginTop ??
      element?.formMarginBottom,
    DEFAULT_MARGIN_Y
  );

const FormBlockOffcanvas = ({
  element,
  onUpdate,
  close,
  darkMode = "light",
  textColor = "#333333",
}) => {
  const [presets, setPresets] = useState([]);
  const [defaultFormPresetId, setDefaultFormPresetId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getForms(FORMS_MENU_BAR_ID)
      .then((res) => {
        if (!alive) return;
        const list = Array.isArray(res?.data?.formPresets) ? res.data.formPresets : [];
        setPresets(list);
        setDefaultFormPresetId(String(res?.data?.defaultFormPresetId || list[0]?.id || ""));
      })
      .catch(() => {
        if (!alive) return;
        setPresets([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const selectedId = useMemo(() => {
    const raw = String(element?.formPresetId || "").trim();
    if (raw && presets.some((item) => String(item?.id) === raw)) return raw;
    return String(defaultFormPresetId || presets[0]?.id || "");
  }, [element?.formPresetId, presets, defaultFormPresetId]);

  const patch = (partial) => {
    onUpdate?.({ ...(element || {}), ...partial });
  };

  const selectPreset = (presetId) => {
    const nextId = String(presetId || "").trim();
    if (!nextId || nextId === selectedId) return;
    patch({ formPresetId: nextId });
  };

  const marginX = readMarginX(element);
  const marginY = readMarginY(element);
  const accent = textColor || "#333333";

  return (
    <aside className="dash-panel absolute right-0 top-0 z-[80] flex h-full w-[400px] flex-col overflow-hidden">
      <div className="dash-panel-header shrink-0 flex items-center justify-between border-b px-6 pt-5 pb-3">
        <span className="shrink-0 font-bold tracking-wide">ตั้งค่าฟอร์ม</span>
        <button
          type="button"
          className="rounded-lg p-2 transition hover:opacity-70"
          onClick={() => close?.(false)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path
              fillRule="evenodd"
              d="M15.78 4.22a.75.75 0 010 1.06L10.06 11l5.72 5.72a.75.75 0 11-1.06 1.06l-6.25-6.25a.75.75 0 010-1.06l6.25-6.25a.75.75 0 011.06 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      <nav className="h-[calc(100%-64px)] w-[400px] overflow-y-auto px-4 pb-6">
        <div className="mt-4 mb-2 flex items-center gap-2">
          <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
            เลือกฟอร์ม
          </span>
          <div className="dash-heading-rule min-w-0 flex-1 border-b" />
        </div>

        {loading ? (
          <div className="dash-input rounded-md border px-3 py-2 text-[12px] opacity-60">
            กำลังโหลดฟอร์ม...
          </div>
        ) : presets.length === 0 ? (
          <div className="dash-input rounded-md border border-dashed px-3 py-2 text-[12px] opacity-60">
            ยังไม่มีฟอร์มในระบบ
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {presets.map((preset) => {
              const presetId = String(preset?.id || "");
              const active = presetId === selectedId;
              return (
                <button
                  key={presetId || preset.name}
                  type="button"
                  title={preset.name || "Form"}
                  aria-pressed={active}
                  onClick={() => selectPreset(presetId)}
                  className="dash-nav-item flex min-w-0 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border px-1.5 py-2.5 text-center transition hover:opacity-90"
                  style={{
                    background: active
                      ? "var(--dash-panel-btn-group-active, #333333)"
                      : "var(--dash-nav-panel-item-bg)",
                    borderColor: active
                      ? "var(--dash-panel-btn-group-active, #333333)"
                      : "var(--dash-nav-panel-item-border)",
                    color: active
                      ? "var(--dash-panel-btn-group-active-text, #ffffff)"
                      : undefined,
                  }}
                >
                  <MessageCircle
                    size={20}
                    strokeWidth={2}
                    className="shrink-0"
                    style={{
                      color: active
                        ? "var(--dash-panel-btn-group-active-text, #ffffff)"
                        : "var(--dash-nav-panel-icon, #333333)",
                    }}
                  />
                  <span
                    className={`w-full truncate text-[11px] font-medium leading-tight antialiased ${
                      active ? "" : "dash-muted"
                    }`}
                  >
                    {preset.name || "Form"}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-4">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2">
              <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                ระยะห่างแนวนอน
              </span>
              <span
                className="shrink-0 text-[12px] font-medium tabular-nums"
                style={{ color: darkMode === "dark" ? "#94a3b8" : "#64748b" }}
              >
                {marginX}
              </span>
              <div className="dash-heading-rule min-w-0 flex-1 border-b" />
            </div>
            <div className="px-0.5">
              <Range
                min={SPACING_MIN}
                max={SPACING_MAX}
                step={1}
                value={marginX}
                handleChange={(event) => {
                  const next = clampSpacing(event.target.value, DEFAULT_MARGIN_X);
                  patch({ formMarginX: next });
                }}
                pos={(marginX / SPACING_MAX) * 100}
                color={accent}
              />
            </div>
          </div>
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2">
              <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                ระยะห่างแนวตั้ง
              </span>
              <span
                className="shrink-0 text-[12px] font-medium tabular-nums"
                style={{ color: darkMode === "dark" ? "#94a3b8" : "#64748b" }}
              >
                {marginY}
              </span>
              <div className="dash-heading-rule min-w-0 flex-1 border-b" />
            </div>
            <div className="px-0.5">
              <Range
                min={SPACING_MIN}
                max={SPACING_MAX}
                step={1}
                value={marginY}
                handleChange={(event) => {
                  const next = clampSpacing(event.target.value, DEFAULT_MARGIN_Y);
                  patch({
                    formMarginY: next,
                    formMarginTop: next,
                    formMarginBottom: next,
                  });
                }}
                pos={(marginY / SPACING_MAX) * 100}
                color={accent}
              />
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default FormBlockOffcanvas;
