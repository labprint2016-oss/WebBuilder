import { useCallback, useMemo, useState } from "react";
import { Button, ButtonGroup } from "@mui/material";
import { Image } from "lucide-react";
import MainLabel from "../HTML/MainLabel";
import Range from "../HTML/Range";
import SelectLine from "../HTML/SelectLine";
import ServiceColor from "../Services/ServiceColor";
import IconAwsome from "../IconAwsome";
import ServiceIcon from "../ServiceIcon";
import ImageModal from "../imageModal";
import { panelGroupButtonSx } from "../panelControlSx";

const GROUP_BORDER = "#e2e8f0";
const GROUP_BORDER_DARK = "rgba(255, 255, 255, 0.1)";
const GRADIENT_STOP_OPTIONS = [
  { value: "start", label: "จุดเริ่ม" },
  { value: "end", label: "จุดสิ้น" },
];
const FOOTER_ACCENT_COLOR = "var(--dash-panel-accent, #333333)";
const LOGO_POSITION_OPTIONS = [
  { value: "hidden", label: "ไม่แสดง" },
  { value: "left", label: "ซ้าย" },
  { value: "center", label: "กลาง" },
  { value: "right", label: "ขวา" },
];
const INPUT_CLASS =
  "dash-input box-border h-[35px] w-full rounded-md border border-slate-200 bg-white px-3 text-[13px] text-slate-800 outline-none transition dark:border-white/10 dark:bg-[#27272a] dark:text-white/90";
const FOOTER_SIDE_ICON_BTN_CLASS =
  "dash-input footer-side-text-icon-btn flex h-[35px] w-[44px] shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 transition dark:border-white/10 dark:bg-[#27272a] dark:text-white dark:hover:bg-[#323238]";
const FOOTER_EMPTY_ICON = { name: null, type: null };

const GROUP_ROOT_SX = {
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
  "& .MuiButtonGroup-grouped.MuiButton-outlined": {
    borderColor: "var(--dash-panel-btn-group-border, #e2e8f0) !important",
  },
  ".dark & .MuiButtonGroup-grouped.MuiButton-outlined": {
    borderColor: "var(--dash-panel-btn-group-border, #e2e8f0) !important",
  },
};

const groupButtonSx = panelGroupButtonSx;

const toBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1";
  }
  return false;
};

const clamp = (value, min, max, fallback) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(min, Math.min(max, numeric));
};

const normalizeFooterIcon = (icon) => {
  if (!icon || typeof icon !== "object") return { ...FOOTER_EMPTY_ICON };
  return {
    name: icon?.name ?? null,
    type: icon?.type ?? null,
  };
};

const hasVisibleFooterIcon = (icon) =>
  Boolean(icon?.name && icon?.type && icon.name !== "fa0");

const normalizeLogoPosition = (value) => {
  const raw = String(value || "").trim().toLowerCase();
  if (["hidden", "left", "center", "right"].includes(raw)) return raw;
  return "center";
};

const normalizeFooterBar = (input) => {
  const fallback = {
    footerHeight: 46,
    isGradient: false,
    bgColor: "#111827",
    bgOpacity: 255,
    bgColorGradient: [{ type: "mainColor", index: 0 }, { type: "mainColor", index: 1 }],
    bgOpacityGradient: [255, 255],
    bgDegree: 0,
    logo: "",
    logoHeight: 35,
    logoPosition: "center",
    textColor: "#ffffff",
    textOpacity: 255,
    textSize: 13,
    leftText: "© 2026 Domain.com",
    rightText: "All rights reserved.",
    leftIcon: { ...FOOTER_EMPTY_ICON },
    rightIcon: { ...FOOTER_EMPTY_ICON },
    isFluidLayout: false,
  };
  const source = input && typeof input === "object" ? input : {};
  const next = {
    ...fallback,
    ...source,
  };
  next.isGradient = toBoolean(source?.isGradient ?? fallback.isGradient);
  next.isFluidLayout = toBoolean(source?.isFluidLayout ?? fallback.isFluidLayout);
  next.footerHeight = clamp(next.footerHeight, 36, 120, fallback.footerHeight);
  next.bgOpacity = clamp(next.bgOpacity, 0, 255, fallback.bgOpacity);
  next.textOpacity = clamp(next.textOpacity, 0, 255, fallback.textOpacity);
  next.textSize = clamp(next.textSize, 10, 40, fallback.textSize);
  next.logoHeight = clamp(next.logoHeight, 10, 120, fallback.logoHeight);
  next.logoHeight = Math.min(next.logoHeight, next.footerHeight);
  next.logoPosition = normalizeLogoPosition(source?.logoPosition ?? fallback.logoPosition);
  next.bgDegree = clamp(next.bgDegree, 0, 360, fallback.bgDegree);
  next.bgColorGradient = Array.isArray(source?.bgColorGradient)
    ? source.bgColorGradient.slice(0, 2)
    : fallback.bgColorGradient;
  if (next.bgColorGradient.length < 2) {
    next.bgColorGradient = [
      next.bgColorGradient[0] ?? fallback.bgColorGradient[0],
      next.bgColorGradient[1] ?? fallback.bgColorGradient[1],
    ];
  }
  next.bgOpacityGradient = Array.isArray(source?.bgOpacityGradient)
    ? source.bgOpacityGradient.slice(0, 2)
    : fallback.bgOpacityGradient;
  if (next.bgOpacityGradient.length < 2) {
    next.bgOpacityGradient = [
      next.bgOpacityGradient[0] ?? fallback.bgOpacityGradient[0],
      next.bgOpacityGradient[1] ?? fallback.bgOpacityGradient[1],
    ];
  }
  next.bgOpacityGradient = next.bgOpacityGradient.map((value, index) =>
    clamp(value, 0, 255, fallback.bgOpacityGradient[index] ?? 255)
  );
  next.logo = String(next.logo ?? fallback.logo);
  next.leftText = String(next.leftText ?? fallback.leftText);
  next.rightText = String(next.rightText ?? fallback.rightText);
  next.leftIcon = normalizeFooterIcon(source?.leftIcon ?? fallback.leftIcon);
  next.rightIcon = normalizeFooterIcon(source?.rightIcon ?? fallback.rightIcon);
  return next;
};

function FooterBarOffcanvas({
  close,
  footerBar,
  darkMode = "light",
  darkTextColor = "#374151",
  updateFooterBar,
}) {
  const [gradientStop, setGradientStop] = useState("start");
  const [solidColorModeIndex, setSolidColorModeIndex] = useState(0);
  const [openIconTarget, setOpenIconTarget] = useState(null);
  const [openImgModal, setOpenImgModal] = useState(false);
  const data = useMemo(() => normalizeFooterBar(footerBar), [footerBar]);
  const accentColor = darkTextColor || FOOTER_ACCENT_COLOR;
  const gradientIndex = gradientStop === "end" ? 1 : 0;
  const hasFooterLogo = String(data.logo || "").trim() !== "";
  const minLogoHeight = 10;
  const maxLogoHeight = Math.max(minLogoHeight, Number(data.footerHeight) || 36);

  const patchFooterBar = useCallback(
    (patchOrUpdater) => {
      if (typeof updateFooterBar !== "function") return;
      updateFooterBar((prevRaw) => {
        const prev = normalizeFooterBar(prevRaw);
        const next =
          typeof patchOrUpdater === "function"
            ? patchOrUpdater(prev)
            : { ...prev, ...patchOrUpdater };
        return normalizeFooterBar(next);
      });
    },
    [updateFooterBar]
  );

  const solidColorModes = useMemo(
    () => [
      {
        key: "bg",
        label: "สีพื้นหลังแบบสีพื้น",
        color: data.bgColor,
        opacity: data.bgOpacity,
        handleColor: (value) => patchFooterBar({ bgColor: value }),
        handleOpacity: (value) => patchFooterBar({ bgOpacity: value }),
      },
      {
        key: "text",
        label: "สีข้อความ",
        color: data.textColor,
        opacity: data.textOpacity,
        handleColor: (value) => patchFooterBar({ textColor: value }),
        handleOpacity: (value) => patchFooterBar({ textOpacity: value }),
      },
    ],
    [data.bgColor, data.bgOpacity, data.textColor, data.textOpacity, patchFooterBar]
  );
  const activeSolidColorMode =
    solidColorModes[solidColorModeIndex] ?? solidColorModes[0];
  const cycleSolidColorMode = useCallback((step) => {
    setSolidColorModeIndex((prev) => {
      const length = solidColorModes.length || 1;
      return (prev + step + length) % length;
    });
  }, [solidColorModes.length]);

  return (
    <div className="dash-panel sm:block h-full min-h-0 w-full overflow-hidden">
      <div className="shrink-0 flex items-center justify-between border-b border-slate-200 dash-panel-header bg-gray-100 px-6 pt-3 pb-2 dark:border-white/10 dark:bg-slate-800/70">
        <div className="font-semibold tracking-wide">
          ตั้งค่า Footer
        </div>
        <button
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-white/70"
          onClick={() => close(null)}
          type="button"
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

      <nav className="overflow-y-auto h-[calc(100%-64px)] w-full px-4 pb-6">
        <ul className="mt-1 pl-1">
          <li>
            {hasFooterLogo ? (
              <div className="mt-3 cursor-pointer w-full">
                <img
                  src={data.logo}
                  alt="footer-logo"
                  className="h-[45px] object-contain"
                  onClick={() => setOpenImgModal(true)}
                />
              </div>
            ) : (
              <div
                className="relative mb-[5px] mt-3 flex h-[45px] w-[160px] cursor-pointer items-center justify-center rounded-md bg-gray-200 px-2 py-1 text-sm text-zinc-900 dark:bg-zinc-800"
                onClick={() => setOpenImgModal(true)}
              >
                <Image className="absolute text-[12px] text-gray-400 dark:text-gray-500" />
              </div>
            )}

            <div className="mt-[10px] grid grid-cols-2 gap-2">
              <div className="col-span-2">
                <ButtonGroup
                  fullWidth
                  variant="outlined"
                  disableElevation
                  color="inherit"
                  aria-label="ตำแหน่งโลโก้ Footer"
                  sx={{ ...GROUP_ROOT_SX, mb: 1.5 }}
                >
                  {LOGO_POSITION_OPTIONS.map((opt) => {
                    const selected = data.logoPosition === opt.value;
                    return (
                      <Button
                        key={opt.value}
                        color="inherit"
                        onClick={() => patchFooterBar({ logoPosition: opt.value })}
                        sx={groupButtonSx(selected, accentColor)}
                      >
                        {opt.label}
                      </Button>
                    );
                  })}
                </ButtonGroup>
              </div>
              <div className="col-span-1">
                <MainLabel label="ความสูงโลโก้" value={data.logoHeight} mb={1} />
                <div className="px-[5px] mb-[10px]">
                  <Range
                    min={minLogoHeight}
                    max={maxLogoHeight}
                    step={1}
                    value={data.logoHeight}
                    pos={((data.logoHeight - minLogoHeight) / (maxLogoHeight - minLogoHeight || 1)) * 100}
                    color={accentColor}
                    handleChange={(event) =>
                      patchFooterBar({ logoHeight: Number(event.target.value) })
                    }
                  />
                </div>
              </div>
              <div className="col-span-1">
                <MainLabel label="ความสูง Footer" value={data.footerHeight} mb={1} />
                <div className="px-[5px] mb-[10px]">
                  <Range
                    min={36}
                    max={120}
                    step={1}
                    value={data.footerHeight}
                    pos={((data.footerHeight - 36) / (120 - 36)) * 100}
                    color={accentColor}
                    handleChange={(event) =>
                      patchFooterBar({ footerHeight: Number(event.target.value) })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="mt-[5px]">
              <MainLabel
                label={data.isGradient ? "สีพื้นหลังแบบไล่โทน" : "สีพื้นหลังแบบสีพื้น"}
                mb={1}
                checked={data.isGradient}
                color={accentColor}
                typography="สีไล่โทน"
                handleSwitch={() => patchFooterBar((prev) => ({ ...prev, isGradient: !prev.isGradient }))}
              />
            </div>

            {!data.isGradient ? (
              <div className="mt-4">
                <SelectLine
                  prev={() => cycleSolidColorMode(-1)}
                  next={() => cycleSolidColorMode(1)}
                  value={activeSolidColorMode?.label || "สีพื้นหลังแบบสีพื้น"}
                />
                <ServiceColor
                  color={activeSolidColorMode?.color}
                  opacity={activeSolidColorMode?.opacity}
                  handleColor={(value) => activeSolidColorMode?.handleColor?.(value)}
                  handleOpacity={(event) =>
                    activeSolidColorMode?.handleOpacity?.(Number(event.target.value))
                  }
                  rangeColor={accentColor}
                  darkMode={darkMode}
                />
              </div>
            ) : (
              <>
                <ButtonGroup
                  fullWidth
                  variant="outlined"
                  disableElevation
                  color="inherit"
                  aria-label="เลือกจุดไล่โทนพื้นหลัง Footer"
                  sx={{ ...GROUP_ROOT_SX, mb: 0, mt: 0.5 }}
                >
                  {GRADIENT_STOP_OPTIONS.map((opt) => {
                    const selected = gradientStop === opt.value;
                    return (
                      <Button
                        key={opt.value}
                        color="inherit"
                        onClick={() => setGradientStop(opt.value)}
                        sx={groupButtonSx(selected, accentColor)}
                      >
                        {opt.label}
                      </Button>
                    );
                  })}
                </ButtonGroup>
                <ServiceColor
                  color={data.bgColorGradient[gradientIndex]}
                  opacity={data.bgOpacityGradient[gradientIndex]}
                  handleColor={(value) =>
                    patchFooterBar((prev) => {
                      const next = [...prev.bgColorGradient];
                      next[gradientIndex] = value;
                      return { ...prev, bgColorGradient: next };
                    })
                  }
                  handleOpacity={(event) =>
                    patchFooterBar((prev) => {
                      const next = [...prev.bgOpacityGradient];
                      next[gradientIndex] = Number(event.target.value);
                      return { ...prev, bgOpacityGradient: next };
                    })
                  }
                  rangeColor={accentColor}
                  darkMode={darkMode}
                />
                <MainLabel label={`${data.bgDegree} องศา`} mb={1} />
                <div className="px-[5px]">
                  <Range
                    min={0}
                    max={360}
                    step={45}
                    value={data.bgDegree}
                    pos={(data.bgDegree / 360) * 100}
                    color={accentColor}
                    handleChange={(event) =>
                      patchFooterBar({ bgDegree: Number(event.target.value) })
                    }
                  />
                </div>
              </>
            )}

            {data.isGradient ? (
              <>
                <MainLabel label="สีข้อความ" mb={1} />
                <ServiceColor
                  color={data.textColor}
                  opacity={data.textOpacity}
                  handleColor={(value) => patchFooterBar({ textColor: value })}
                  handleOpacity={(event) =>
                    patchFooterBar({ textOpacity: Number(event.target.value) })
                  }
                  rangeColor={accentColor}
                  darkMode={darkMode}
                />
              </>
            ) : null}

            <div className="mt-[10px]">
              <MainLabel label="ข้อความด้านซ้าย" mb="13px" noLine />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className={FOOTER_SIDE_ICON_BTN_CLASS}
                  onClick={() => setOpenIconTarget("left")}
                  aria-label="เลือกไอคอนข้อความซ้าย"
                >
                  {hasVisibleFooterIcon(data.leftIcon) ? (
                    <IconAwsome
                      iconType={data.leftIcon.type}
                      iconName={data.leftIcon.name}
                      style={{ fontSize: 14 }}
                    />
                  ) : (
                    <span className="text-[17px] leading-none">+</span>
                  )}
                </button>
                <input
                  className={INPUT_CLASS}
                  value={data.leftText}
                  onChange={(event) =>
                    patchFooterBar({ leftText: event.target.value })
                  }
                />
              </div>
            </div>

            <div className="mt-[10px]">
              <MainLabel label="ข้อความด้านขวา" mb="13px" noLine />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className={FOOTER_SIDE_ICON_BTN_CLASS}
                  onClick={() => setOpenIconTarget("right")}
                  aria-label="เลือกไอคอนข้อความขวา"
                >
                  {hasVisibleFooterIcon(data.rightIcon) ? (
                    <IconAwsome
                      iconType={data.rightIcon.type}
                      iconName={data.rightIcon.name}
                      style={{ fontSize: 14 }}
                    />
                  ) : (
                    <span className="text-[17px] leading-none">+</span>
                  )}
                </button>
                <input
                  className={INPUT_CLASS}
                  value={data.rightText}
                  onChange={(event) =>
                    patchFooterBar({ rightText: event.target.value })
                  }
                />
              </div>
            </div>

            <div className="mt-[15px]">
              <MainLabel label="ขนาดข้อความ" value={data.textSize} mb={1} />
              <div className="px-[5px]">
                <Range
                  min={10}
                  max={40}
                  step={1}
                  value={data.textSize}
                  pos={((data.textSize - 10) / (40 - 10)) * 100}
                  color={accentColor}
                  handleChange={(event) =>
                    patchFooterBar({ textSize: Number(event.target.value) })
                  }
                />
              </div>
            </div>
          </li>
        </ul>
      </nav>
      <ServiceIcon
        header="ไอคอนข้อความซ้าย"
        icon={data.leftIcon}
        open={openIconTarget === "left"}
        onClose={() => setOpenIconTarget(null)}
        handleChange={(icon) =>
          patchFooterBar({ leftIcon: normalizeFooterIcon(icon) })
        }
        darkColor={darkTextColor}
        darkMode={darkMode}
      />
      <ServiceIcon
        header="ไอคอนข้อความขวา"
        icon={data.rightIcon}
        open={openIconTarget === "right"}
        onClose={() => setOpenIconTarget(null)}
        handleChange={(icon) =>
          patchFooterBar({ rightIcon: normalizeFooterIcon(icon) })
        }
        darkColor={darkTextColor}
        darkMode={darkMode}
      />
      {openImgModal && (
        <ImageModal
          setOpenModal={setOpenImgModal}
          openModal={openImgModal}
          handleChange={(imgPath) => patchFooterBar({ logo: imgPath })}
        />
      )}
    </div>
  );
}

export default FooterBarOffcanvas;
