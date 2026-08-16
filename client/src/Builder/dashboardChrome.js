export const DASHBOARD_CHROME_STORAGE_KEY = "wb:dashboard-chrome:v1";

export const DASHBOARD_CHROME_PRESET = {
  DEFAULT: "default",
  CUSTOM: "custom",
};

export const DASHBOARD_CHROME_TOKEN_GROUPS = [
  {
    id: "nav",
    label: "Nav",
    description: "แถบไอคอนซ้ายและแผงเมนู",
    tokens: [
      { key: "nav", label: "พื้นหลัง" },
      { key: "icon", label: "สีไอคอน" },
      { key: "navActive", label: "ไอคอน Active" },
      { key: "navBorder", label: "เส้นกรอบพื้นหลัง" },
      { key: "navPanel", label: "พื้นหลัง Panel" },
      { key: "navPanelHeading", label: "สีหัวข้อแบ่งประเภท" },
      { key: "navPanelItemBg", label: "พื้นหลังเมนู" },
      { key: "navPanelItemBorder", label: "กรอบเมนู" },
      { key: "navPanelText", label: "สีข้อความ" },
      { key: "navPanelIcon", label: "สีไอคอน" },
    ],
  },
  {
    id: "header",
    label: "Header",
    description: "แถบด้านบนของ Dashboard",
    tokens: [
      { key: "headerBg", label: "พื้นหลัง" },
      { key: "headerText", label: "สีข้อความ" },
      { key: "headerButton", label: "สีปุ่มหลัก" },
      { key: "headerButtonText", label: "สีข้อความปุ่มหลัก" },
      { key: "headerBtnGroupActive", label: "สีปุ่ม Active [Btn Group]" },
      { key: "headerBtnGroupActiveText", label: "สีข้อความปุ่ม Active" },
      { key: "headerBtnGroupInactive", label: "สีปุ่ม [Btn Group]" },
      { key: "headerBtnGroupInactiveText", label: "สีข้อความ [Btn Group]" },
      { key: "headerBtnGroupBorder", label: "สีกรอบ" },
    ],
  },
  {
    id: "panel",
    label: "Panel",
    description: "แผงตั้งค่า รวมปุ่ม Switch และ Slider",
    tokens: [
      { key: "panel", label: "พื้นหลัง [Body]" },
      { key: "panelHeader", label: "พื้นหลัง [Header]" },
      { key: "panelHeading", label: "สีข้อความ [Header]" },
      { key: "panelBtnGroupActive", label: "สีปุ่ม Active" },
      { key: "panelBtnGroupActiveText", label: "สีข้อความปุ่ม Active" },
      { key: "panelBtnGroupInactive", label: "สีปุ่ม [Btn Group]" },
      { key: "panelBtnGroupInactiveText", label: "สีข้อความ [Btn Group]" },
      { key: "panelBtnGroupBorder", label: "สีกรอบ" },
      { key: "panelSwitchOn", label: "สี Switch Active" },
      { key: "panelSwitchOff", label: "สี Switch" },
      { key: "panelAccent", label: "สี Slider Active" },
      { key: "panelSliderTrack", label: "สี Slider" },
      { key: "panelSliderThumb", label: "สีตำแหน่ง Slider" },
    ],
  },
  {
    id: "body",
    label: "Body",
    description: "พื้นที่หลักของ Dashboard",
    tokens: [
      { key: "bg", label: "พื้นหลัง" },
      { key: "border", label: "เส้นขอบ" },
    ],
  },
];

export const DEFAULT_DASHBOARD_CHROME = {
  light: {
    bg: "#f8fafc",
    border: "#e2e8f0",
    heading: "#0f172a",
    text: "#334155",
    textMuted: "#64748b",
    nav: "#ffffff",
    navBorder: "#e2e8f0",
    navActive: "#334155",
    icon: "#475569",
    navPanel: "#ffffff",
    navPanelBorder: "#e2e8f0",
    navPanelHeading: "#0f172a",
    navPanelItemBg: "#f8fafc",
    navPanelItemBorder: "#e2e8f0",
    navPanelText: "#64748b",
    navPanelIcon: "#333333",
    headerBg: "#ffffff",
    headerText: "#0f172a",
    headerButton: "#374151",
    headerButtonText: "#ffffff",
    headerBtnGroupActive: "#374151",
    headerBtnGroupActiveText: "#ffffff",
    headerBtnGroupInactive: "#e6e7eb",
    headerBtnGroupInactiveText: "#64748b",
    headerBtnGroupBorder: "#e2e8f0",
    panel: "#f8fafc",
    panelHeader: "#f3f4f6",
    panelHeading: "#0f172a",
    panelButton: "#374151",
    panelButtonText: "#ffffff",
    panelBtnGroupActive: "#333333",
    panelBtnGroupActiveText: "#ffffff",
    panelBtnGroupInactive: "#ffffff",
    panelBtnGroupInactiveText: "#1e293b",
    panelBtnGroupBorder: "#e2e8f0",
    panelSwitchOn: "#333333",
    panelSwitchOff: "rgba(0,0,0,0.25)",
    panelAccent: "#333333",
    panelSliderTrack: "#e4e4e7",
    panelSliderThumb: "#0f172a",
  },
  dark: {
    bg: "#030712",
    border: "rgba(255,255,255,0.10)",
    heading: "#f8fafc",
    text: "#e2e8f0",
    textMuted: "rgba(255,255,255,0.55)",
    nav: "rgba(3,7,18,0.70)",
    navBorder: "rgba(255,255,255,0.10)",
    navActive: "#29b7a5",
    icon: "rgba(255,255,255,0.70)",
    navPanel: "rgba(17,24,39,0.80)",
    navPanelBorder: "rgba(255,255,255,0.10)",
    navPanelHeading: "#f8fafc",
    navPanelItemBg: "rgba(15,23,42,0.40)",
    navPanelItemBorder: "rgba(255,255,255,0.10)",
    navPanelText: "rgba(255,255,255,0.55)",
    navPanelIcon: "#e2e8f0",
    headerBg: "rgba(17,24,39,0.80)",
    headerText: "#f8fafc",
    headerButton: "#29b7a5",
    headerButtonText: "#ffffff",
    headerBtnGroupActive: "#29b7a5",
    headerBtnGroupActiveText: "#ffffff",
    headerBtnGroupInactive: "#3d434e",
    headerBtnGroupInactiveText: "rgba(255,255,255,0.55)",
    headerBtnGroupBorder: "rgba(255,255,255,0.10)",
    panel: "rgba(15,23,42,0.40)",
    panelHeader: "rgba(30,41,59,0.70)",
    panelHeading: "#f8fafc",
    panelButton: "#29b7a5",
    panelButtonText: "#ffffff",
    panelBtnGroupActive: "#29b7a5",
    panelBtnGroupActiveText: "#ffffff",
    panelBtnGroupInactive: "rgba(30, 41, 59, 0.9)",
    panelBtnGroupInactiveText: "#f1f5f9",
    panelBtnGroupBorder: "rgba(255,255,255,0.10)",
    panelSwitchOn: "#29b7a5",
    panelSwitchOff: "rgba(255,255,255,0.25)",
    panelAccent: "#29b7a5",
    panelSliderTrack: "#3f3f46",
    panelSliderThumb: "#e2e8f0",
  },
};

const TOKEN_KEYS = Object.keys(DEFAULT_DASHBOARD_CHROME.light);

const isHexOrRgba = (value) => {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(trimmed)) return true;
  if (/^rgba?\(/i.test(trimmed)) return true;
  return false;
};

export const normalizeDashboardChrome = (input) => {
  const next = {
    light: { ...DEFAULT_DASHBOARD_CHROME.light },
    dark: { ...DEFAULT_DASHBOARD_CHROME.dark },
  };
  ["light", "dark"].forEach((mode) => {
    const source = input?.[mode] && typeof input[mode] === "object" ? input[mode] : {};
    TOKEN_KEYS.forEach((key) => {
      if (isHexOrRgba(source[key])) {
        next[mode][key] = source[key].trim();
      }
    });

    // migrate ค่าเก่า
    if (!isHexOrRgba(source.headerBg) && isHexOrRgba(source.navPanel)) {
      next[mode].headerBg = source.navPanel.trim();
    }
    if (!isHexOrRgba(source.headerText) && isHexOrRgba(source.heading)) {
      next[mode].headerText = source.heading.trim();
    }
    if (!isHexOrRgba(source.headerButton) && isHexOrRgba(source.button)) {
      next[mode].headerButton = source.button.trim();
    }
    if (!isHexOrRgba(source.headerButtonText) && isHexOrRgba(source.buttonText)) {
      next[mode].headerButtonText = source.buttonText.trim();
    }
    if (!isHexOrRgba(source.headerBtnGroupActive)) {
      if (isHexOrRgba(source.headerButton)) {
        next[mode].headerBtnGroupActive = source.headerButton.trim();
      } else if (isHexOrRgba(source.panelBtnGroupActive)) {
        next[mode].headerBtnGroupActive = source.panelBtnGroupActive.trim();
      }
    }
    if (!isHexOrRgba(source.headerBtnGroupActiveText)) {
      if (isHexOrRgba(source.headerButtonText)) {
        next[mode].headerBtnGroupActiveText = source.headerButtonText.trim();
      } else if (isHexOrRgba(source.panelBtnGroupActiveText)) {
        next[mode].headerBtnGroupActiveText = source.panelBtnGroupActiveText.trim();
      }
    }
    if (!isHexOrRgba(source.headerBtnGroupInactive) && isHexOrRgba(source.panelBtnGroupInactive)) {
      next[mode].headerBtnGroupInactive = source.panelBtnGroupInactive.trim();
    }
    if (!isHexOrRgba(source.headerBtnGroupInactiveText) && isHexOrRgba(source.panelBtnGroupInactiveText)) {
      next[mode].headerBtnGroupInactiveText = source.panelBtnGroupInactiveText.trim();
    }
    if (!isHexOrRgba(source.headerBtnGroupBorder)) {
      if (isHexOrRgba(source.panelBtnGroupBorder)) {
        next[mode].headerBtnGroupBorder = source.panelBtnGroupBorder.trim();
      } else if (isHexOrRgba(source.border)) {
        next[mode].headerBtnGroupBorder = source.border.trim();
      }
    }
    if (!isHexOrRgba(source.panelAccent) && isHexOrRgba(source.accent)) {
      next[mode].panelAccent = source.accent.trim();
    }
    if (!isHexOrRgba(source.panelSwitchOn)) {
      if (isHexOrRgba(source.panelAccent)) next[mode].panelSwitchOn = source.panelAccent.trim();
      else if (isHexOrRgba(source.accent)) next[mode].panelSwitchOn = source.accent.trim();
    }
    if (!isHexOrRgba(source.panelBtnGroupActive)) {
      if (isHexOrRgba(source.panelButton)) next[mode].panelBtnGroupActive = source.panelButton.trim();
      else if (isHexOrRgba(source.panelAccent)) next[mode].panelBtnGroupActive = source.panelAccent.trim();
      else if (isHexOrRgba(source.accent)) next[mode].panelBtnGroupActive = source.accent.trim();
    }
    if (!isHexOrRgba(source.panelBtnGroupActiveText) && isHexOrRgba(source.panelButtonText)) {
      next[mode].panelBtnGroupActiveText = source.panelButtonText.trim();
    }
    // ปุ่มธรรมดา = ปุ่ม Active
    next[mode].panelButton = next[mode].panelBtnGroupActive;
    next[mode].panelButtonText = next[mode].panelBtnGroupActiveText;
    if (!isHexOrRgba(source.panelBtnGroupBorder) && isHexOrRgba(source.border)) {
      next[mode].panelBtnGroupBorder = source.border.trim();
    }
    if (!isHexOrRgba(source.navBorder) && isHexOrRgba(source.border)) {
      next[mode].navBorder = source.border.trim();
    }
    // กรอบแผงเมนูใช้สีเดียวกับเส้นกรอบพื้นหลัง
    next[mode].navPanelBorder = next[mode].navBorder;
    if (!isHexOrRgba(source.navPanelHeading)) {
      if (isHexOrRgba(source.panelHeading)) next[mode].navPanelHeading = source.panelHeading.trim();
      else if (isHexOrRgba(source.heading)) next[mode].navPanelHeading = source.heading.trim();
    }
    if (!isHexOrRgba(source.navPanelItemBg) && isHexOrRgba(source.panel)) {
      next[mode].navPanelItemBg = source.panel.trim();
    }
    if (!isHexOrRgba(source.navPanelItemBorder) && isHexOrRgba(source.border)) {
      next[mode].navPanelItemBorder = source.border.trim();
    }
    if (!isHexOrRgba(source.navPanelText) && isHexOrRgba(source.textMuted)) {
      next[mode].navPanelText = source.textMuted.trim();
    }
    if (!isHexOrRgba(source.navPanelIcon) && isHexOrRgba(source.icon)) {
      next[mode].navPanelIcon = source.icon.trim();
    }
  });
  return next;
};

/** ชุดโรงงาน (seed) — ไม่ใช่ค่าที่ผู้ใช้แก้ในแท็บ "ค่าเริ่มต้น" */
export const cloneFactoryChrome = () => ({
  light: { ...DEFAULT_DASHBOARD_CHROME.light },
  dark: { ...DEFAULT_DASHBOARD_CHROME.dark },
});

export const normalizeDashboardChromeState = (input) => {
  // รูปแบบเก่า: { light, dark } โดยไม่มี preset / custom / default
  const looksLikeLegacyPalette =
    input &&
    typeof input === "object" &&
    (input.light || input.dark) &&
    input.preset == null &&
    input.custom == null &&
    input.default == null;

  if (looksLikeLegacyPalette) {
    return {
      preset: DASHBOARD_CHROME_PRESET.CUSTOM,
      default: normalizeDashboardChrome(cloneFactoryChrome()),
      custom: normalizeDashboardChrome(input),
    };
  }

  const preset =
    input?.preset === DASHBOARD_CHROME_PRESET.CUSTOM
      ? DASHBOARD_CHROME_PRESET.CUSTOM
      : DASHBOARD_CHROME_PRESET.DEFAULT;

  const defaultSource =
    input?.default && typeof input.default === "object"
      ? input.default
      : cloneFactoryChrome();

  const customSource =
    input?.custom && typeof input.custom === "object"
      ? input.custom
      : cloneFactoryChrome();

  return {
    preset,
    default: normalizeDashboardChrome(defaultSource),
    custom: normalizeDashboardChrome(customSource),
  };
};

/** ค่าสีที่ใช้อยู่จริงตาม preset ที่เลือก */
export const resolveDashboardChrome = (state) => {
  const normalized = normalizeDashboardChromeState(state);
  if (normalized.preset === DASHBOARD_CHROME_PRESET.DEFAULT) {
    return normalized.default;
  }
  return normalized.custom;
};

export const loadDashboardChromeState = () => {
  if (typeof window === "undefined") {
    return normalizeDashboardChromeState({
      preset: DASHBOARD_CHROME_PRESET.DEFAULT,
      default: cloneFactoryChrome(),
      custom: cloneFactoryChrome(),
    });
  }
  try {
    const raw = localStorage.getItem(DASHBOARD_CHROME_STORAGE_KEY);
    if (!raw) {
      return normalizeDashboardChromeState({
        preset: DASHBOARD_CHROME_PRESET.DEFAULT,
        default: cloneFactoryChrome(),
        custom: cloneFactoryChrome(),
      });
    }
    return normalizeDashboardChromeState(JSON.parse(raw));
  } catch {
    return normalizeDashboardChromeState({
      preset: DASHBOARD_CHROME_PRESET.DEFAULT,
      default: cloneFactoryChrome(),
      custom: cloneFactoryChrome(),
    });
  }
};

export const saveDashboardChromeState = (state) => {
  if (typeof window === "undefined") return;
  const normalized = normalizeDashboardChromeState(state);
  localStorage.setItem(DASHBOARD_CHROME_STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
};

/** @deprecated ใช้ loadDashboardChromeState + resolveDashboardChrome */
export const loadDashboardChrome = () => resolveDashboardChrome(loadDashboardChromeState());

/** @deprecated ใช้ saveDashboardChromeState */
export const saveDashboardChrome = (chrome) => {
  const state = loadDashboardChromeState();
  return saveDashboardChromeState({
    ...state,
    preset: DASHBOARD_CHROME_PRESET.CUSTOM,
    custom: normalizeDashboardChrome(chrome),
  });
};

export const dashboardChromeToCssVars = (palette) => {
  const safe = palette && typeof palette === "object" ? palette : DEFAULT_DASHBOARD_CHROME.light;
  return {
    "--dash-bg": safe.bg,
    "--dash-border": safe.border,
    "--dash-heading": safe.heading,
    "--dash-text": safe.text,
    "--dash-text-muted": safe.textMuted,
    "--dash-nav": safe.nav,
    "--dash-nav-border": safe.navBorder,
    "--dash-nav-active": safe.navActive,
    "--dash-icon": safe.icon,
    "--dash-nav-panel": safe.navPanel,
    "--dash-nav-panel-border": safe.navBorder,
    "--dash-nav-panel-heading": safe.navPanelHeading,
    "--dash-nav-panel-item-bg": safe.navPanelItemBg,
    "--dash-nav-panel-item-border": safe.navPanelItemBorder,
    "--dash-nav-panel-text": safe.navPanelText,
    "--dash-nav-panel-icon": safe.navPanelIcon,
    "--dash-header-bg": safe.headerBg,
    "--dash-header-text": safe.headerText,
    "--dash-header-button": safe.headerButton,
    "--dash-header-button-text": safe.headerButtonText,
    "--dash-header-btn-group-active": safe.headerBtnGroupActive,
    "--dash-header-btn-group-active-text": safe.headerBtnGroupActiveText,
    "--dash-header-btn-group-inactive": safe.headerBtnGroupInactive,
    "--dash-header-btn-group-inactive-text": safe.headerBtnGroupInactiveText,
    "--dash-header-btn-group-border": safe.headerBtnGroupBorder,
    "--dash-panel": safe.panel,
    "--dash-panel-header": safe.panelHeader,
    "--dash-panel-heading": safe.panelHeading,
    // ปุ่มธรรมดาใน Panel ใช้ชุดเดียวกับปุ่ม Active
    "--dash-panel-button": safe.panelBtnGroupActive,
    "--dash-panel-button-text": safe.panelBtnGroupActiveText,
    "--dash-panel-btn-group-active": safe.panelBtnGroupActive,
    "--dash-panel-btn-group-active-text": safe.panelBtnGroupActiveText,
    "--dash-panel-btn-group-inactive": safe.panelBtnGroupInactive,
    "--dash-panel-btn-group-inactive-text": safe.panelBtnGroupInactiveText,
    "--dash-panel-btn-group-border": safe.panelBtnGroupBorder,
    "--dash-panel-input-border": safe.panelBtnGroupBorder,
    "--dash-panel-switch-on": safe.panelSwitchOn,
    "--dash-panel-switch-off": safe.panelSwitchOff,
    "--dash-panel-accent": safe.panelAccent,
    "--dash-panel-slider-track": safe.panelSliderTrack,
    "--dash-panel-slider-thumb": safe.panelSliderThumb,
    // ปุ่ม Header ใช้ชุด header*
    "--dash-button": safe.headerButton,
    "--dash-button-text": safe.headerButtonText,
    "--dash-accent": safe.panelAccent,
  };
};

export const getChromeAccent = (chromeOrState, mode) => {
  // รองรับทั้ง state {preset,custom} และ palette {light,dark}
  const resolved =
    chromeOrState?.custom != null || chromeOrState?.preset != null
      ? resolveDashboardChrome(chromeOrState)
      : normalizeDashboardChrome(chromeOrState);
  const palette = resolved[mode === "dark" ? "dark" : "light"];
  return (
    palette.panelAccent ||
    DEFAULT_DASHBOARD_CHROME[mode === "dark" ? "dark" : "light"].panelAccent
  );
};
