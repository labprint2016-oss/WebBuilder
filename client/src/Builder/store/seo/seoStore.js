import { create } from "zustand";
import { BUILDER_CONTEXT_DEFAULTS } from "../builderContextStore";
import { SEO_ENTITY_KINDS } from "./seoConstants";
import {
  createSeoEntityKey,
  createSeoSiteKey,
  mergeSeoMeta,
  normalizeSeoMeta,
  normalizeSeoSlug,
} from "./seoContract";

const createInitialState = () => ({
  siteId: BUILDER_CONTEXT_DEFAULTS.siteId,
  locale: BUILDER_CONTEXT_DEFAULTS.locale,
  defaultLocale: BUILDER_CONTEXT_DEFAULTS.defaultLocale,
  locales: [...BUILDER_CONTEXT_DEFAULTS.locales],
  siteDefaultsByKey: {},
  entriesByKey: {},
  templateEntriesByKey: {},
  fallbacksByKey: {},
  slugsByKey: {},
  sitemap: {
    enabled: true,
    changeFrequency: "weekly",
    priority: 0.5,
    excludedEntityKeys: [],
    lastBuiltAt: "",
  },
  operation: { loading: false, saving: false, error: "" },
});

const validEntityKind = (kind) => SEO_ENTITY_KINDS.includes(kind);

export const useSeoStore = create((set, get) => ({
  ...createInitialState(),

  setSeoContext: (context = {}) => {
    set((state) => ({
      siteId: String(context.siteId || state.siteId),
      locale: String(context.locale || state.locale),
      defaultLocale: String(context.defaultLocale || state.defaultLocale),
      locales:
        Array.isArray(context.locales) && context.locales.length > 0
          ? [...new Set(context.locales.map(String).filter(Boolean))]
          : state.locales,
    }));
  },

  upsertSiteDefault: ({ siteId, locale, meta } = {}) => {
    const key = createSeoSiteKey(siteId, locale);
    if (!key) return;
    set((state) => ({
      siteDefaultsByKey: {
        ...state.siteDefaultsByKey,
        [key]: normalizeSeoMeta(meta),
      },
    }));
  },

  upsertEntitySeo: ({ siteId, locale, entityKind, entityId, meta } = {}) => {
    const key = createSeoEntityKey({
      siteId,
      locale,
      entityKind,
      entityId,
    });
    if (!key) return;
    set((state) => ({
      entriesByKey: {
        ...state.entriesByKey,
        [key]: normalizeSeoMeta(meta),
      },
    }));
  },

  upsertTemplateSeo: ({ siteId, locale, templateId, meta } = {}) => {
    const key = createSeoEntityKey({
      siteId,
      locale,
      entityKind: "template",
      entityId: templateId,
    });
    if (!key) return;
    set((state) => ({
      templateEntriesByKey: {
        ...state.templateEntriesByKey,
        [key]: normalizeSeoMeta(meta),
      },
    }));
  },

  hydrateEntityFallback: ({
    siteId,
    locale,
    entityKind,
    entityId,
    title,
    slug,
  } = {}) => {
    const key = createSeoEntityKey({
      siteId,
      locale,
      entityKind,
      entityId,
    });
    if (!key) return;
    set((state) => ({
      fallbacksByKey: {
        ...state.fallbacksByKey,
        [key]: normalizeSeoMeta({ title }),
      },
      slugsByKey: {
        ...state.slugsByKey,
        [key]: normalizeSeoSlug(slug || title),
      },
    }));
  },

  setSlug: ({ siteId, locale, entityKind, entityId, slug } = {}) => {
    const key = createSeoEntityKey({
      siteId,
      locale,
      entityKind,
      entityId,
    });
    if (!key) return;
    set((state) => ({
      slugsByKey: {
        ...state.slugsByKey,
        [key]: normalizeSeoSlug(slug),
      },
    }));
  },

  resolveSeo: ({
    siteId,
    locale,
    defaultLocale,
    entityKind,
    entityId,
    templateId,
  } = {}) => {
    if (!validEntityKind(entityKind)) return null;
    const state = get();
    const resolvedSiteId = String(siteId || state.siteId);
    const resolvedLocale = String(locale || state.locale);
    const resolvedDefaultLocale = String(
      defaultLocale || state.defaultLocale
    );
    const entityKey = createSeoEntityKey({
      siteId: resolvedSiteId,
      locale: resolvedLocale,
      entityKind,
      entityId,
    });
    if (!entityKey) return null;
    const templateKey = templateId
      ? createSeoEntityKey({
          siteId: resolvedSiteId,
          locale: resolvedLocale,
          entityKind: "template",
          entityId: templateId,
        })
      : "";

    const meta = mergeSeoMeta(
      state.fallbacksByKey[entityKey],
      state.siteDefaultsByKey[
        createSeoSiteKey(resolvedSiteId, resolvedDefaultLocale)
      ],
      state.siteDefaultsByKey[
        createSeoSiteKey(resolvedSiteId, resolvedLocale)
      ],
      state.templateEntriesByKey[templateKey],
      state.entriesByKey[entityKey]
    );

    return {
      key: entityKey,
      siteId: resolvedSiteId,
      locale: resolvedLocale,
      entityKind,
      entityId: String(entityId || ""),
      slug: state.slugsByKey[entityKey] || "",
      ...meta,
    };
  },

  setSeoOperation: (operation = {}) => {
    set((state) => ({
      operation: {
        loading:
          typeof operation.loading === "boolean"
            ? operation.loading
            : state.operation.loading,
        saving:
          typeof operation.saving === "boolean"
            ? operation.saving
            : state.operation.saving,
        error: Object.prototype.hasOwnProperty.call(operation, "error")
          ? String(operation.error || "")
          : state.operation.error,
      },
    }));
  },

  resetSeoDomain: () => set(createInitialState()),
}));
