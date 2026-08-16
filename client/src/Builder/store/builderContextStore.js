import { create } from "zustand";

export const TEMPLATE_SCOPES = Object.freeze([
  "site",
  "page",
  "section",
  "component",
  "commerce",
]);

const envValue = (value, fallback) => {
  const normalized = String(value || "").trim();
  return normalized || fallback;
};

const defaultSiteId = envValue(import.meta.env.VITE_SITE_ID, "default");
const defaultLocale = envValue(
  import.meta.env.VITE_DEFAULT_LOCALE,
  "th-TH"
);
const defaultMenuBarId = envValue(
  import.meta.env.VITE_MENU_BAR_ID,
  "69db17211be82fe7637ea096"
);

export const BUILDER_CONTEXT_DEFAULTS = Object.freeze({
  siteId: defaultSiteId,
  siteKey: defaultSiteId,
  themeId: envValue(
    import.meta.env.VITE_THEME_ID,
    "68d37327bedb0efab7dacafb"
  ),
  menuBarId: defaultMenuBarId,
  formsMenuBarId: envValue(
    import.meta.env.VITE_FORMS_MENU_BAR_ID,
    defaultMenuBarId
  ),
  locale: defaultLocale,
  defaultLocale,
  locales: Object.freeze([defaultLocale]),
  direction: "ltr",
  currencyCode: envValue(import.meta.env.VITE_DEFAULT_CURRENCY, "THB"),
  currencySymbol: envValue(
    import.meta.env.VITE_DEFAULT_CURRENCY_SYMBOL,
    "฿"
  ),
  currencyDecimals: 2,
  templateId: "",
  templateVersion: "",
  templateScope: "site",
  templateSource: "",
  multisiteEnabled: false,
  multilanguageEnabled: false,
  ecommerceEnabled: false,
  templatesEnabled: false,
  seoEnabled: false,
});

const BUILDER_SHELL_DEFAULTS = Object.freeze({
  pathname: "",
  builderSection: "",
  activePageId: "",
  defaultPageId: "",
  pageName: "",
  device: "Desktop",
  colorMode: "light",
  builderMode: "Layout Mode",
  navOpen: false,
  railExpanded: false,
  activePanel: null,
  pageSettingsPanelOpen: false,
  selectedElementData: null,
});

const normalizeText = (value, fallback = "") => {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
};

const hasOwn = (value, key) =>
  Object.prototype.hasOwnProperty.call(value, key);

const getInitialColorMode = () => {
  if (typeof window === "undefined") return BUILDER_SHELL_DEFAULTS.colorMode;
  const savedMode = window.localStorage.getItem("darkMode");
  if (savedMode === "dark" || savedMode === "light") return savedMode;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : BUILDER_SHELL_DEFAULTS.colorMode;
};

const getInitialBuilderSection = () => {
  if (typeof window === "undefined") return BUILDER_SHELL_DEFAULTS.builderSection;
  return normalizeText(
    window.localStorage.getItem("page"),
    BUILDER_SHELL_DEFAULTS.builderSection
  );
};

const getInitialRailExpanded = () => {
  if (typeof window === "undefined") return BUILDER_SHELL_DEFAULTS.railExpanded;
  try {
    return window.localStorage.getItem("dash-nav-rail-expanded") === "1";
  } catch {
    return BUILDER_SHELL_DEFAULTS.railExpanded;
  }
};

const createInitialState = () => ({
  ...BUILDER_CONTEXT_DEFAULTS,
  ...BUILDER_SHELL_DEFAULTS,
  builderSection: getInitialBuilderSection(),
  colorMode: getInitialColorMode(),
  railExpanded: getInitialRailExpanded(),
});

export const useBuilderContextStore = create((set) => ({
  ...createInitialState(),

  setSiteContext: (nextContext = {}) => {
    set((state) => {
      const nextSiteId = normalizeText(nextContext.siteId, state.siteId);
      const patch = {
        siteId: nextSiteId,
        siteKey: normalizeText(
          nextContext.siteKey,
          hasOwn(nextContext, "siteId") ? nextSiteId : state.siteKey
        ),
        themeId: normalizeText(nextContext.themeId, state.themeId),
        menuBarId: normalizeText(nextContext.menuBarId, state.menuBarId),
        formsMenuBarId: normalizeText(
          nextContext.formsMenuBarId,
          state.formsMenuBarId
        ),
        locale: normalizeText(nextContext.locale, state.locale),
        defaultLocale: normalizeText(
          nextContext.defaultLocale,
          state.defaultLocale
        ),
        direction: hasOwn(nextContext, "direction")
          ? nextContext.direction === "rtl"
            ? "rtl"
            : "ltr"
          : state.direction,
        currencyCode: normalizeText(
          nextContext.currencyCode,
          state.currencyCode
        ),
        currencySymbol: normalizeText(
          nextContext.currencySymbol,
          state.currencySymbol
        ),
        currencyDecimals: Number.isInteger(nextContext.currencyDecimals)
          ? Math.max(0, nextContext.currencyDecimals)
          : state.currencyDecimals,
        templateId: hasOwn(nextContext, "templateId")
          ? normalizeText(nextContext.templateId)
          : state.templateId,
        templateVersion: hasOwn(nextContext, "templateVersion")
          ? normalizeText(nextContext.templateVersion)
          : state.templateVersion,
        templateScope: TEMPLATE_SCOPES.includes(nextContext.templateScope)
          ? nextContext.templateScope
          : state.templateScope,
        templateSource: hasOwn(nextContext, "templateSource")
          ? normalizeText(nextContext.templateSource)
          : state.templateSource,
        multisiteEnabled: hasOwn(nextContext, "multisiteEnabled")
          ? nextContext.multisiteEnabled === true
          : state.multisiteEnabled,
        multilanguageEnabled: hasOwn(nextContext, "multilanguageEnabled")
          ? nextContext.multilanguageEnabled === true
          : state.multilanguageEnabled,
        ecommerceEnabled: hasOwn(nextContext, "ecommerceEnabled")
          ? nextContext.ecommerceEnabled === true
          : state.ecommerceEnabled,
        templatesEnabled: hasOwn(nextContext, "templatesEnabled")
          ? nextContext.templatesEnabled === true
          : state.templatesEnabled,
        seoEnabled: hasOwn(nextContext, "seoEnabled")
          ? nextContext.seoEnabled === true
          : state.seoEnabled,
      };

      if (Array.isArray(nextContext.locales) && nextContext.locales.length > 0) {
        const locales = [
          ...new Set(
            nextContext.locales
              .map((locale) => normalizeText(locale))
              .filter(Boolean)
          ),
        ];
        if (
          locales.length > 0 &&
          (locales.length !== state.locales.length ||
            locales.some((locale, index) => locale !== state.locales[index]))
        ) {
          patch.locales = locales;
        }
      }

      const changed = Object.entries(patch).some(
        ([key, value]) => state[key] !== value
      );
      return changed ? patch : state;
    });
  },

  syncBuilderShell: (nextShell = {}) => {
    set((state) => {
      const patch = {
        pathname: normalizeText(nextShell.pathname),
        builderSection: normalizeText(nextShell.builderSection),
        activePageId: normalizeText(nextShell.activePageId),
        defaultPageId: normalizeText(nextShell.defaultPageId),
        pageName: normalizeText(nextShell.pageName),
        device: normalizeText(nextShell.device, "Desktop"),
        colorMode: normalizeText(nextShell.colorMode, "light"),
        builderMode: normalizeText(nextShell.builderMode, "Layout Mode"),
      };
      const changed = Object.entries(patch).some(
        ([key, value]) => state[key] !== value
      );
      return changed ? patch : state;
    });
  },

  setActivePageId: (activePageId) =>
    set((state) => {
      const nextActivePageId = normalizeText(activePageId);
      return state.activePageId === nextActivePageId
        ? state
        : { activePageId: nextActivePageId };
    }),

  setDefaultPageId: (defaultPageId) =>
    set((state) => {
      const nextDefaultPageId = normalizeText(defaultPageId);
      return state.defaultPageId === nextDefaultPageId
        ? state
        : { defaultPageId: nextDefaultPageId };
    }),

  setDevice: (device) =>
    set((state) => {
      const nextDevice = normalizeText(device, "Desktop");
      return state.device === nextDevice
        ? state
        : { device: nextDevice };
    }),

  setBuilderMode: (builderMode) =>
    set((state) => {
      const nextBuilderMode = normalizeText(builderMode, "Layout Mode");
      return state.builderMode === nextBuilderMode
        ? state
        : { builderMode: nextBuilderMode };
    }),

  setColorMode: (colorMode) =>
    set((state) => {
      const nextColorMode = normalizeText(colorMode, "light");
      return state.colorMode === nextColorMode
        ? state
        : { colorMode: nextColorMode };
    }),

  setBuilderSection: (builderSection) =>
    set((state) => {
      const resolvedBuilderSection =
        typeof builderSection === "function"
          ? builderSection(state.builderSection)
          : builderSection;
      const nextBuilderSection = normalizeText(resolvedBuilderSection);
      return state.builderSection === nextBuilderSection
        ? state
        : { builderSection: nextBuilderSection };
    }),

  setNavOpen: (navOpen) =>
    set((state) => {
      const resolvedNavOpen =
        typeof navOpen === "function" ? navOpen(state.navOpen) : navOpen;
      const nextNavOpen = Boolean(resolvedNavOpen);
      return state.navOpen === nextNavOpen
        ? state
        : { navOpen: nextNavOpen };
    }),

  setRailExpanded: (railExpanded) =>
    set((state) => {
      const resolvedRailExpanded =
        typeof railExpanded === "function"
          ? railExpanded(state.railExpanded)
          : railExpanded;
      const nextRailExpanded = Boolean(resolvedRailExpanded);
      return state.railExpanded === nextRailExpanded
        ? state
        : { railExpanded: nextRailExpanded };
    }),

  setActivePanel: (activePanel) =>
    set((state) => {
      const nextActivePanel =
        typeof activePanel === "function"
          ? activePanel(state.activePanel)
          : activePanel;
      return Object.is(state.activePanel, nextActivePanel)
        ? state
        : { activePanel: nextActivePanel };
    }),

  setPageSettingsPanelOpen: (pageSettingsPanelOpen) =>
    set((state) => {
      const resolvedPageSettingsPanelOpen =
        typeof pageSettingsPanelOpen === "function"
          ? pageSettingsPanelOpen(state.pageSettingsPanelOpen)
          : pageSettingsPanelOpen;
      const nextPageSettingsPanelOpen = Boolean(
        resolvedPageSettingsPanelOpen
      );
      return state.pageSettingsPanelOpen === nextPageSettingsPanelOpen
        ? state
        : { pageSettingsPanelOpen: nextPageSettingsPanelOpen };
    }),

  setSelectedElementData: (selectedElementData) =>
    set((state) => {
      const nextSelectedElementData =
        typeof selectedElementData === "function"
          ? selectedElementData(state.selectedElementData)
          : selectedElementData;
      return Object.is(state.selectedElementData, nextSelectedElementData)
        ? state
        : { selectedElementData: nextSelectedElementData };
    }),

  resetBuilderContext: () => set(createInitialState()),
}));
