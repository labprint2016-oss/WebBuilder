import { resolveTemplateId } from "./templateContract";

const catalogEntry = (preset, kind, source, scope = "site") => ({
  id: preset?.id,
  name: preset?.name,
  kind,
  source,
  scope,
  status: "published",
  version: "1",
  updatedAt: preset?.updatedAt,
});

export const templatesFromMenuBar = (menuBar = {}) => ({
  menu: {
    entries: Array.isArray(menuBar.menuPresets)
      ? menuBar.menuPresets.map((preset) =>
          catalogEntry(preset, "menu", "menubar")
        )
      : [],
    binding: {
      activeId: menuBar.activeMenuPresetId,
      defaultId: menuBar.defaultMenuPresetId,
      hydrated: true,
      updatedAt: menuBar.updatedAt,
    },
  },
  hero: {
    entries: Array.isArray(menuBar.heroPresets)
      ? menuBar.heroPresets.map((preset) =>
          catalogEntry(preset, "hero", "menubar", "section")
        )
      : [],
    binding: {
      activeId: menuBar.activeHeroPresetId,
      defaultId: menuBar.defaultHeroPresetId,
      hydrated: true,
      updatedAt: menuBar.updatedAt,
    },
  },
});

export const templatesFromForms = (forms = {}) => ({
  entries: Array.isArray(forms.formPresets)
    ? forms.formPresets.map((preset) =>
        catalogEntry(preset, "form", "forms", "component")
      )
    : [],
  binding: {
    activeId: forms.activeFormPresetId,
    defaultId: forms.defaultFormPresetId,
    hydrated: true,
    updatedAt: forms.updatedAt,
  },
});

export const templateOverridesFromPage = (page = {}) => ({
  menu: page?.menuPresetId,
  hero: page?.heroPresetId,
});

export const resolvePageTemplateIds = (page = {}, menuBar = {}) => ({
  menu: resolveTemplateId({
    pageOverrideId: page?.menuPresetId,
    defaultId: menuBar?.defaultMenuPresetId,
    activeId: menuBar?.activeMenuPresetId,
  }),
  hero: resolveTemplateId({
    pageOverrideId: page?.heroPresetId,
    defaultId: menuBar?.defaultHeroPresetId,
    activeId: menuBar?.activeHeroPresetId,
  }),
});
