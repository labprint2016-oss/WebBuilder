import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, Moon, RotateCcw, Save, Sun } from "lucide-react";
import { Snackbar } from "@mui/material";
import {
  DASHBOARD_CHROME_PRESET,
  DASHBOARD_CHROME_TOKEN_GROUPS,
  DEFAULT_DASHBOARD_CHROME,
  normalizeDashboardChrome,
  normalizeDashboardChromeState,
} from "./dashboardChrome";

/** สี UI หน้า Settings คงที่ — ไม่ตามค่า Dashboard chrome ที่กำลังแก้ */
const UI = {
  text: "#334155",
  textMuted: "#64748b",
  heading: "#0f172a",
  border: "#e2e8f0",
  surface: "#ffffff",
  surfaceMuted: "#f8fafc",
  activeBg: "#334155",
  activeText: "#ffffff",
  focus: "#64748b",
};

function ColorRow({ label, value, onChange }) {
  const isHex = typeof value === "string" && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim());
  const pickerValue = isHex ? value.trim() : "#333333";

  return (
    <div className="flex min-w-0 items-center gap-2.5 py-2.5 sm:gap-3">
      <div className="min-w-0 flex-1 text-[13px]" style={{ color: UI.text }}>
        {label}
      </div>
      <input
        type="text"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        className="h-8 w-[96px] shrink-0 rounded-md border bg-white px-2 text-[11px] outline-none sm:w-[118px]"
        style={{ borderColor: UI.border, color: UI.text }}
      />
      <label
        className="relative h-8 w-8 shrink-0 cursor-pointer overflow-hidden rounded-md border"
        style={{ borderColor: UI.border }}
        title="เลือกสี"
      >
        <span className="absolute inset-0" style={{ background: value || pickerValue }} />
        <input
          type="color"
          value={pickerValue}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
          aria-label={label}
        />
      </label>
    </div>
  );
}

export default function SettingsPage({
  darkMode = "light",
  chromeState,
  isDirty = false,
  isSaving = false,
  onChangeDashboardChrome,
  onChangeDashboardChromePreset,
  onResetDashboardChrome,
  onSaveDashboardChrome,
}) {
  const [editMode, setEditMode] = useState(darkMode === "dark" ? "dark" : "light");
  const [activeSection, setActiveSection] = useState(DASHBOARD_CHROME_TOKEN_GROUPS[0].id);
  const [saveToastOpen, setSaveToastOpen] = useState(false);
  const state = useMemo(
    () => normalizeDashboardChromeState(chromeState),
    [chromeState]
  );
  const customChrome = useMemo(
    () => normalizeDashboardChrome(state.custom),
    [state.custom]
  );
  const defaultChrome = useMemo(
    () => normalizeDashboardChrome(state.default),
    [state.default]
  );
  const isCustomPreset = state.preset === DASHBOARD_CHROME_PRESET.CUSTOM;
  const activeChrome = isCustomPreset ? customChrome : defaultChrome;
  // แก้/แสดงชุดของ preset ที่เลือกอยู่ — ค่าเริ่มต้นกับ Custom แยกกัน
  const displayPalette =
    activeChrome[editMode] || DEFAULT_DASHBOARD_CHROME[editMode] || DEFAULT_DASHBOARD_CHROME.light;
  const isEditingCurrentMode = editMode === darkMode;
  const currentGroup =
    DASHBOARD_CHROME_TOKEN_GROUPS.find((group) => group.id === activeSection) ||
    DASHBOARD_CHROME_TOKEN_GROUPS[0];

  useEffect(() => {
    setEditMode(darkMode === "dark" ? "dark" : "light");
  }, [darkMode]);

  const updateToken = (key, value) => {
    const basePalette =
      activeChrome[editMode] || DEFAULT_DASHBOARD_CHROME[editMode];
    onChangeDashboardChrome?.({
      ...activeChrome,
      [editMode]: {
        ...basePalette,
        [key]: value,
      },
    });
  };

  const handleSave = async () => {
    const ok = await onSaveDashboardChrome?.();
    if (ok) setSaveToastOpen(true);
  };

  return (
    <main
      className="content-area flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden"
      style={{ background: UI.surfaceMuted, color: UI.text }}
    >
      <div className="mx-auto w-full max-w-[1100px] px-4 py-6 sm:px-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1
              className="text-[18px] font-semibold tracking-tight"
              style={{ color: UI.heading }}
            >
              ตั้งค่าสี Dashboard
            </h1>
            <p className="mt-1 text-[13px]" style={{ color: UI.textMuted }}>
              แก้และบันทึกได้ทั้งชุด Custom และค่าเริ่มต้น — กดบันทึกเมื่อต้องการลงฐานข้อมูล
            </p>
            {isDirty && (
              <p className="mt-1 text-[12px] font-medium" style={{ color: "#b45309" }}>
                มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div
              className="inline-flex rounded-lg border p-0.5"
              style={{ borderColor: UI.border, background: UI.surface }}
            >
              <button
                type="button"
                onClick={() =>
                  onChangeDashboardChromePreset?.(DASHBOARD_CHROME_PRESET.CUSTOM)
                }
                className="rounded-md px-3 py-1.5 text-[12px] font-medium"
                style={
                  isCustomPreset
                    ? { background: UI.activeBg, color: UI.activeText }
                    : { color: UI.textMuted }
                }
              >
                Custom
              </button>
              <button
                type="button"
                onClick={() =>
                  onChangeDashboardChromePreset?.(DASHBOARD_CHROME_PRESET.DEFAULT)
                }
                className="rounded-md px-3 py-1.5 text-[12px] font-medium"
                style={
                  !isCustomPreset
                    ? { background: UI.activeBg, color: UI.activeText }
                    : { color: UI.textMuted }
                }
              >
                ค่าเริ่มต้น
              </button>
            </div>

            <div
              className="inline-flex rounded-lg border p-0.5"
              style={{ borderColor: UI.border, background: UI.surface }}
            >
              <button
                type="button"
                onClick={() => setEditMode("light")}
                className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium"
                style={
                  editMode === "light"
                    ? { background: UI.activeBg, color: UI.activeText }
                    : { color: UI.textMuted }
                }
              >
                <Sun size={14} />
                Light
              </button>
              <button
                type="button"
                onClick={() => setEditMode("dark")}
                className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium"
                style={
                  editMode === "dark"
                    ? { background: UI.activeBg, color: UI.activeText }
                    : { color: UI.textMuted }
                }
              >
                <Moon size={14} />
                Dark
              </button>
            </div>
            <button
              type="button"
              onClick={() => onResetDashboardChrome?.(editMode)}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border bg-white px-3 text-[12px] hover:bg-slate-50"
              style={{ borderColor: UI.border, color: UI.text }}
              title={
                isCustomPreset
                  ? "รีเซ็ตชุด Custom ของโหมดนี้กลับเป็นค่าโรงงาน"
                  : "รีเซ็ตชุดค่าเริ่มต้นของโหมดนี้กลับเป็นค่าโรงงาน"
              }
            >
              <RotateCcw size={13} />
              {isCustomPreset ? "รีเซ็ต Custom" : "รีเซ็ตค่าเริ่มต้น"}
            </button>
            <button
              type="button"
              disabled={!isDirty || isSaving}
              onClick={handleSave}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[12px] font-medium disabled:cursor-not-allowed disabled:opacity-50"
              style={
                isDirty && !isSaving
                  ? { background: UI.activeBg, color: UI.activeText }
                  : {
                      background: UI.surface,
                      color: UI.textMuted,
                      border: `1px solid ${UI.border}`,
                    }
              }
              title="บันทึกสี Dashboard ลงฐานข้อมูล"
            >
              <Save size={13} />
              {isSaving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
            </button>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {DASHBOARD_CHROME_TOKEN_GROUPS.map((group) => {
            const active = group.id === activeSection;
            return (
              <button
                key={group.id}
                type="button"
                onClick={() => setActiveSection(group.id)}
                className="rounded-lg border px-3.5 py-2 text-left transition-colors"
                style={
                  active
                    ? {
                        background: UI.activeBg,
                        color: UI.activeText,
                        borderColor: UI.activeBg,
                      }
                    : {
                        background: UI.surface,
                        color: UI.text,
                        borderColor: UI.border,
                      }
                }
              >
                <div className="text-[13px] font-semibold">{group.label}</div>
                <div
                  className="mt-0.5 text-[11px]"
                  style={{ color: active ? "rgba(255,255,255,0.75)" : UI.textMuted }}
                >
                  {group.description}
                </div>
              </button>
            );
          })}
        </div>

        {!isEditingCurrentMode && (
          <div className="mb-3">
            <p className="text-[11px] leading-relaxed" style={{ color: UI.textMuted }}>
              กำลังแก้โหมดที่ยังไม่เปิดใช้ สลับ Light/Dark เพื่อดูผลจริง
            </p>
          </div>
        )}

        <section
          className="overflow-hidden rounded-xl border bg-white"
          style={{ borderColor: UI.border }}
        >
          <div
            className="border-b px-3.5 py-2.5"
            style={{ background: UI.surfaceMuted, borderColor: UI.border }}
          >
            <div className="text-[14px] font-semibold" style={{ color: UI.heading }}>
              {currentGroup.label}
              <span
                className="ml-2 text-[12px] font-medium"
                style={{ color: UI.textMuted }}
              >
                ({isCustomPreset ? "Custom" : "ค่าเริ่มต้น"})
              </span>
            </div>
            <div className="mt-0.5 text-[12px]" style={{ color: UI.textMuted }}>
              {currentGroup.description}
            </div>
          </div>
          <div className="grid sm:grid-cols-2">
            {currentGroup.tokens.map((token, index) => (
              <div
                key={`${editMode}-${isCustomPreset ? "custom" : "default"}-${currentGroup.id}-${token.key}`}
                className={`border-b px-3.5 ${index % 2 === 0 ? "sm:border-r" : ""}`}
                style={{ borderColor: UI.border }}
              >
                <ColorRow
                  label={token.label}
                  value={displayPalette[token.key]}
                  onChange={(next) => updateToken(token.key, next)}
                />
              </div>
            ))}
          </div>
        </section>
      </div>

      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        open={saveToastOpen}
        onClose={() => setSaveToastOpen(false)}
        ContentProps={{ elevation: 0 }}
        message={
          <div
            style={{
              display: "flex",
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              paddingTop: 6,
              paddingBottom: 6,
            }}
          >
            <AlertCircle size={20} strokeWidth={2.25} aria-hidden />
            <span>สำเร็จ.....บันทึกข้อมูลเรียบร้อยแล้ว</span>
          </div>
        }
        autoHideDuration={2400}
        sx={{
          "& .MuiSnackbarContent-root": {
            backgroundColor: "#05966B",
            color: "#fff",
            fontSize: 13,
            justifyContent: "center",
            alignItems: "center",
            py: 0.75,
            boxShadow: "none",
          },
          "& .MuiSnackbarContent-message": {
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            py: 0.25,
          },
        }}
      />
    </main>
  );
}
