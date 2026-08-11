import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, ButtonGroup, Stack, Typography } from "@mui/material";
import Switch from "@mui/material/Switch";
import { styled } from "@mui/material/styles";
import { AppWindowMac, Image, ImagePlus, Link, Sun } from "lucide-react";
import ImageModal from "./imageModal";
import { panelGroupButtonSx } from "./panelControlSx";
import {
  IMAGE_BRIGHTNESS_DEFAULT,
  IMAGE_CORNER_RADIUS_DEFAULT,
  IMAGE_CORNER_RADIUS_MAX_PX,
  imageBrightnessFilterStyle,
  imageCornerRadiusStyle,
} from "./Layouts/Elements/imageAspectConfig";

const POPUP_ANIMATION_OPTIONS = [
  { value: "none", label: "ไม่มี" },
  { value: "fade-in", label: "ค่อยๆ แสดง" },
  { value: "zoom-in", label: "ซูมเข้า" },
  { value: "slide-in-up", label: "เลื่อนจากล่าง" },
  { value: "slide-in-down", label: "เลื่อนจากบน" },
];

export const DEFAULT_PAGE_POPUP = {
  enabled: false,
  src: "",
  brightness: IMAGE_BRIGHTNESS_DEFAULT,
  borderRadius: IMAGE_CORNER_RADIUS_DEFAULT,
  animationType: "fade-in",
  linkUrl: "",
  /** โหลดทับหน้าเดิมอัตโนมัติ */
  linkTarget: "_self",
};

export function normalizePagePopup(raw) {
  const base =
    raw && typeof raw === "object" ? raw : {};
  const brightnessRaw = Number(base.brightness);
  const radiusRaw = Number(base.borderRadius);
  const animationType = POPUP_ANIMATION_OPTIONS.some(
    (o) => o.value === base.animationType
  )
    ? base.animationType
    : DEFAULT_PAGE_POPUP.animationType;
  return {
    enabled: base.enabled === true,
    src: typeof base.src === "string" ? base.src : "",
    brightness: Number.isFinite(brightnessRaw)
      ? Math.max(-100, Math.min(100, brightnessRaw))
      : DEFAULT_PAGE_POPUP.brightness,
    borderRadius: Number.isFinite(radiusRaw)
      ? Math.max(0, Math.min(IMAGE_CORNER_RADIUS_MAX_PX, radiusRaw))
      : DEFAULT_PAGE_POPUP.borderRadius,
    animationType,
    linkUrl: typeof base.linkUrl === "string" ? base.linkUrl : "",
    linkTarget: "_self",
  };
}

const PageSettingsAntSwitch = styled(Switch, {
  shouldForwardProp: (prop) => prop !== "accentColor",
})(({ theme, accentColor = "#0d9488" }) => ({
  width: 28,
  height: 16,
  padding: 0,
  display: "flex",
  "&:active": {
    "& .MuiSwitch-thumb": {
      width: 15,
    },
    "& .MuiSwitch-switchBase.Mui-checked": {
      transform: "translateX(9px)",
    },
  },
  "& .MuiSwitch-switchBase": {
    padding: 2,
    "&.Mui-checked": {
      transform: "translateX(12px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        opacity: 1,
        backgroundColor: accentColor,
      },
    },
  },
  "& .MuiSwitch-thumb": {
    boxShadow: "0 2px 4px 0 rgb(0 35 11 / 20%)",
    width: 12,
    height: 12,
    borderRadius: 6,
    transition: theme.transitions.create(["width"], {
      duration: 200,
    }),
  },
  "& .MuiSwitch-track": {
    borderRadius: 8,
    opacity: 1,
    backgroundColor: "rgba(0,0,0,.25)",
    boxSizing: "border-box",
    ".dark &": { backgroundColor: "rgba(255,255,255,.25)" },
  },
}));

const THEME_RANGE_INPUT_CLASS = `
  w-full cursor-pointer appearance-none h-2 rounded-full
  bg-zinc-200 dark:bg-zinc-700 theme-range-fill-track
  [&::-webkit-slider-runnable-track]:border-0
  [&::-moz-range-track]:border-0
  [&::-webkit-slider-thumb]:cursor-pointer
  [&::-webkit-slider-thumb]:appearance-none
  [&::-webkit-slider-thumb]:h-3.5
  [&::-webkit-slider-thumb]:w-3.5
  [&::-webkit-slider-thumb]:rounded-full
  [&::-webkit-slider-thumb]:bg-white
  [&::-webkit-slider-thumb]:border
  [&::-webkit-slider-thumb]:border-slate-300
  [&::-webkit-slider-thumb]:shadow
  [&::-moz-range-thumb]:h-3.5
  [&::-moz-range-thumb]:w-3.5
  [&::-moz-range-thumb]:rounded-full
  [&::-moz-range-thumb]:bg-white
  [&::-moz-range-thumb]:border
  [&::-moz-range-thumb]:border-slate-300
`;

const PANEL_ACTIVE_BTN_SX = {
  bgcolor: "#333333",
  color: "#fff",
  "&:hover": { bgcolor: "#222222" },
};

const groupButtonSx = panelGroupButtonSx;
const groupRootSx = {
  width: "100%",
  boxShadow: "none",
  "& .MuiButton-root": { boxShadow: "none" },
  "& .MuiButtonGroup-grouped": { borderRadius: "0 !important" },
  "& .MuiButtonGroup-grouped:first-of-type": {
    borderTopLeftRadius: "0.375rem !important",
    borderBottomLeftRadius: "0.375rem !important",
  },
  "& .MuiButtonGroup-grouped:last-of-type": {
    borderTopRightRadius: "0.375rem !important",
    borderBottomRightRadius: "0.375rem !important",
  },
};

function MainLabel({
  label,
  value = NaN,
  mb = 0.75,
  handleSwitch = null,
  checked = "-",
  textColor = null,
  switchLabel = null,
}) {
  const accent = textColor || "#0d9488";
  const valueDisplay = !Number.isNaN(Number(value))
    ? String(Math.round(Number(value)))
    : null;
  return (
    <Typography
      component="div"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        flex: 1,
        fontSize: 13,
        fontWeight: 600,
        color: "var(--dash-panel-heading, #0f172a)",
        mb,
        fontVariantNumeric: "tabular-nums",
        ".dark &": { color: "var(--dash-panel-heading, #f8fafc)" },
      }}
    >
      {label}{" "}
      {valueDisplay != null && (
        <span className="text-slate-400 dark:text-slate-400">{valueDisplay}</span>
      )}
      <div className="dash-heading-rule min-w-0 flex-1 border-b" />
      {checked !== "-" && (
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <PageSettingsAntSwitch
            accentColor={accent}
            inputProps={{ "aria-label": switchLabel || label }}
            checked={Boolean(checked)}
            onChange={handleSwitch}
          />
          {switchLabel ? (
            <Typography sx={{ fontSize: 13 }}>{switchLabel}</Typography>
          ) : null}
        </Stack>
      )}
    </Typography>
  );
}

function PageSettingsPanel({
  isOpen,
  onClose,
  pageOid = "",
  menuPresets = [],
  heroPresets = [],
  pageMenuPresetId = "",
  pageHeroPresetId = "",
  onSelectMenuPreset,
  onSelectHeroPreset,
  isMenuPresetHydrated = true,
  pagePopup = null,
  onUpdatePagePopup = null,
  textColor = "#0d9488",
}) {
  const optionBaseClass =
    "relative w-full min-h-[72px] rounded-lg border px-2 py-2 text-center text-[11px] transition-colors";
  const optionActiveClass =
    "border-transparent bg-[#333333] text-white shadow-sm";
  const optionInactiveClass =
    "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-slate-900/40 dark:text-white/80 dark:hover:bg-white/10";
  const overlayStateClass = isOpen
    ? "pointer-events-auto opacity-100"
    : "pointer-events-none opacity-0";
  const panelStateClass = isOpen ? "translate-x-0" : "translate-x-full";

  const normalizedPopup = useMemo(
    () => normalizePagePopup(pagePopup),
    [pagePopup]
  );
  const [popup, setPopup] = useState(normalizedPopup);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    setPopup(normalizedPopup);
  }, [normalizedPopup, pageOid]);

  const persistPopup = (next) => {
    const normalized = normalizePagePopup(next);
    setPopup(normalized);
    /* โหลดทับค่า PopUp เดิมของหน้าอัตโนมัติ */
    onUpdatePagePopup?.(normalized);
  };

  const patchPopup = (patch) => {
    persistPopup({ ...popup, ...patch });
  };

  const pageIdLabel = (() => {
    const id = String(pageOid || "");
    const maxChars = 15;
    if (!id) return "-";
    return id.length > maxChars ? `${id.slice(0, maxChars)}…` : id;
  })();

  const previewBrightnessStyle = imageBrightnessFilterStyle(popup.brightness);
  const previewCornerStyle = imageCornerRadiusStyle(popup.borderRadius, "auto");

  return (
    <>
      <div
        className={`absolute inset-0 z-[60] bg-black/25 transition-opacity duration-300 ease-in-out ${overlayStateClass}`}
        onClick={() => onClose?.()}
        aria-hidden="true"
      />

      <aside
        className={`dash-panel absolute right-0 top-0 z-[70] flex h-full w-[400px] flex-col overflow-hidden border-l transition-transform duration-300 ease-in-out ${panelStateClass}`}
      >
        <div className="shrink-0 flex items-center justify-between border-b border-slate-200 dash-panel-header bg-gray-100 px-6 pt-3 pb-2 dark:border-white/10 dark:bg-slate-800/70">
          <div className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 font-bold tracking-wide">ตั้งค่าหน้า</span>
            <button
              type="button"
              className="inline-flex shrink-0 items-center rounded-md border border-[#333333] bg-[#333333] px-1.5 py-0.5 text-[11px] font-mono font-bold leading-none text-white tabular-nums dark:border-[#333333] dark:bg-[#333333] dark:text-white"
              title={String(pageOid || "")}
              aria-label={`คัดลอก ID ${String(pageOid || "")}`}
              onClick={() => {
                const id = String(pageOid || "");
                if (!id || typeof navigator?.clipboard?.writeText !== "function")
                  return;
                navigator.clipboard.writeText(id).catch(() => {});
              }}
            >
              {pageIdLabel}
            </button>
          </div>
          <button
            type="button"
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-white/70"
            onClick={onClose}
            aria-label="ปิด panel ตั้งค่า"
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

        <nav className="px-4 pb-6 overflow-y-auto h-[calc(100%-64px)] w-[400px]">
          <ul className="mt-1 pl-1 space-y-1">
            <li>
              <div className="mt-4 mb-4 flex items-center gap-2">
                <span className="shrink-0 text-[13px] font-semibold text-slate-700 dark:text-white/[0.78]">
                  เมนูสำหรับหน้านี้
                </span>
                <div className="dash-heading-rule min-w-0 flex-1 border-b" />
              </div>

              {!isMenuPresetHydrated ? (
                <div className="rounded-md border border-dashed border-slate-300 px-3 py-2 text-[12px] text-slate-500 dark:border-white/20 dark:text-white/50">
                  กำลังโหลดรายการเมนู...
                </div>
              ) : menuPresets.length === 0 ? (
                <div className="rounded-md border border-dashed border-slate-300 px-3 py-2 text-[12px] text-slate-500 dark:border-white/20 dark:text-white/50">
                  ยังไม่มีรายการเมนู
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {menuPresets.map((preset) => {
                    const selected = preset.id === pageMenuPresetId;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => onSelectMenuPreset?.(preset.id)}
                        className={`${optionBaseClass} ${
                          selected ? optionActiveClass : optionInactiveClass
                        }`}
                      >
                        <div className="flex h-full flex-col items-center justify-center gap-2">
                          <AppWindowMac
                            size={20}
                            strokeWidth={2.5}
                            className={`shrink-0 ${
                              selected ? "opacity-100" : "opacity-55"
                            }`}
                          />
                          <span className="w-full truncate text-[10.5px] leading-tight">
                            {preset.name || preset.id}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="mt-5 mb-4 flex items-center gap-2">
                <span className="shrink-0 text-[13px] font-semibold text-slate-700 dark:text-white/[0.78]">
                  Hero สำหรับหน้านี้
                </span>
                <div className="dash-heading-rule min-w-0 flex-1 border-b" />
              </div>

              {heroPresets.length === 0 ? (
                <div className="rounded-md border border-dashed border-slate-300 px-3 py-2 text-[12px] text-slate-500 dark:border-white/20 dark:text-white/50">
                  ยังไม่มีรายการ Hero
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {heroPresets.map((preset) => {
                    const selected = preset.id === pageHeroPresetId;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => onSelectHeroPreset?.(preset.id)}
                        className={`${optionBaseClass} ${
                          selected ? optionActiveClass : optionInactiveClass
                        }`}
                      >
                        <div className="flex h-full flex-col items-center justify-center gap-2">
                          <ImagePlus
                            size={20}
                            strokeWidth={2.5}
                            className={`shrink-0 ${
                              selected ? "opacity-100" : "opacity-55"
                            }`}
                          />
                          <span className="w-full truncate text-[10.5px] leading-tight">
                            {preset.name || preset.id}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="mt-5 mb-3">
                <MainLabel
                  label="สร้าง PopUp"
                  mb={0}
                  textColor={textColor}
                  checked={popup.enabled}
                  handleSwitch={(e) =>
                    patchPopup({ enabled: Boolean(e.target.checked) })
                  }
                  switchLabel={null}
                />
              </div>

              {popup.enabled && (
                <Box sx={{ width: "100%", px: 0.25, mt: 1.5, mb: 2 }}>
                  <Box
                    sx={{
                      bgcolor: "transparent",
                      borderRadius: "5px",
                      width: "100%",
                      height: 150,
                      position: "relative",
                      overflow: "hidden",
                      mb: 1,
                    }}
                  >
                    {popup.src ? (
                      <Box
                        component="img"
                        src={popup.src}
                        alt=""
                        draggable={false}
                        sx={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                          ...previewBrightnessStyle,
                          ...previewCornerStyle,
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#8e94a0",
                          fontSize: 14,
                        }}
                      >
                        ไม่มีรูปภาพ
                      </Box>
                    )}
                  </Box>

                  <Button
                    variant="contained"
                    className="dash-panel-button"
                    fullWidth
                    startIcon={
                      <Image className="h-4 w-4" strokeWidth={2.5} />
                    }
                    onClick={(e) => {
                      e.currentTarget.blur();
                      requestAnimationFrame(() => setPickerOpen(true));
                    }}
                    sx={{
                      ...PANEL_ACTIVE_BTN_SX,
                      fontSize: 12,
                      height: 28,
                      py: 2,
                      textTransform: "none",
                      boxShadow: "none",
                      "&:hover": {
                        ...PANEL_ACTIVE_BTN_SX["&:hover"],
                        boxShadow: "none",
                      },
                    }}
                  >
                    อัปโหลดรูปภาพ
                  </Button>

                  <Box sx={{ width: "100%", mt: "17px" }}>
                    <MainLabel
                      label="ปรับแสงรูปภาพ"
                      value={popup.brightness}
                      textColor={textColor}
                    />
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        px: 0.25,
                      }}
                    >
                      <Sun
                        className="size-4 shrink-0 text-slate-950 dark:text-slate-500"
                        strokeWidth={2}
                        aria-hidden
                      />
                      <div className="min-w-0 flex-1 pt-[2px] pb-[2px] px-[5px]">
                        <input
                          type="range"
                          min={-100}
                          max={100}
                          step={1}
                          value={popup.brightness}
                          onChange={(e) =>
                            patchPopup({
                              brightness: Number(e.target.value) || 0,
                            })
                          }
                          className={THEME_RANGE_INPUT_CLASS}
                          style={{
                            ["--pos"]: `${
                              ((popup.brightness + 100) / 200) * 100
                            }%`,
                            ["--fill"]: textColor || "#0d9488",
                          }}
                          aria-label="ปรับแสงรูปภาพ"
                        />
                      </div>
                      <Sun
                        className="size-4 shrink-0 text-slate-400"
                        strokeWidth={2}
                        aria-hidden
                      />
                    </Box>
                  </Box>

                  <Box sx={{ width: "100%", mt: 2 }}>
                    <MainLabel
                      label="ความโค้งมนรูปภาพ"
                      value={popup.borderRadius}
                      textColor={textColor}
                    />
                    <div className="w-full pt-[2px] pb-[2px] px-[5px]">
                      <input
                        type="range"
                        min={0}
                        max={IMAGE_CORNER_RADIUS_MAX_PX}
                        step={1}
                        value={popup.borderRadius}
                        onChange={(e) =>
                          patchPopup({
                            borderRadius: Number(e.target.value) || 0,
                          })
                        }
                        className={THEME_RANGE_INPUT_CLASS}
                        style={{
                          ["--pos"]: `${
                            (popup.borderRadius / IMAGE_CORNER_RADIUS_MAX_PX) *
                            100
                          }%`,
                          ["--fill"]: textColor || "#0d9488",
                        }}
                        aria-label="ความโค้งมนรูปภาพ"
                      />
                    </div>
                  </Box>

                  <Box sx={{ width: "100%", mt: 2 }}>
                    <MainLabel label="อนิเมชั่น" mb="13px" textColor={textColor} />
                    <ButtonGroup
                      fullWidth
                      variant="outlined"
                      disableElevation
                      color="inherit"
                      aria-label="อนิเมชั่น PopUp"
                      sx={groupRootSx}
                    >
                      {POPUP_ANIMATION_OPTIONS.map((opt) => {
                        const selected = popup.animationType === opt.value;
                        return (
                          <Button
                            key={opt.value}
                            onClick={() =>
                              patchPopup({ animationType: opt.value })
                            }
                            sx={groupButtonSx(selected, textColor)}
                          >
                            {opt.label}
                          </Button>
                        );
                      })}
                    </ButtonGroup>
                  </Box>

                  <Box sx={{ width: "100%", mt: 2, mb: 1 }}>
                    <div className="mb-3 flex items-center gap-2">
                      <MainLabel label="ลิงก์ URL" mb={0} textColor={textColor} />
                    </div>
                    <div className="flex dash-input h-10 items-stretch overflow-hidden rounded-md border border-slate-200 bg-white dark:border-white/10 dark:bg-[#27272a]">
                      <div className="grid w-10 shrink-0 place-items-center border-r border-slate-200 bg-transparent dark:border-white/10">
                        <Link
                          className="size-4"
                          strokeWidth={2.5}
                          color="var(--dash-panel-btn-group-inactive-text, #1e293b)"
                          aria-hidden
                        />
                      </div>
                      <input
                        type="text"
                        inputMode="url"
                        className="w-full bg-transparent px-2.5 py-2 text-[13px] leading-snug text-slate-800 outline-none transition placeholder:text-slate-400 dark:text-white/90 dark:placeholder:text-slate-500"
                        placeholder="https://www.link.com"
                        value={popup.linkUrl}
                        onChange={(e) =>
                          patchPopup({
                            linkUrl: e.target.value,
                            linkTarget: "_self",
                          })
                        }
                        autoComplete="off"
                      />
                    </div>
                    <p className="mt-1.5 text-[11px] leading-snug text-slate-500 dark:text-white/45">
                      โหลดทับหน้าเดิมอัตโนมัติ
                    </p>
                  </Box>
                </Box>
              )}
            </li>
          </ul>
        </nav>
      </aside>

      <ImageModal
        openModal={pickerOpen}
        setOpenModal={setPickerOpen}
        handleChange={(url) => {
          patchPopup({ src: url || "" });
          setPickerOpen(false);
        }}
      />
    </>
  );
}

export default PageSettingsPanel;
