import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { useBuilderContextStore } from "../builderContextStore";
import { TEMPLATE_KINDS } from "./templateConstants";
import {
  createTemplateKey,
  normalizeTemplateBinding,
  normalizeTemplateCatalogEntry,
  normalizeTemplateRef,
  resolveTemplateId,
} from "./templateContract";

const emptyCatalogIds = () =>
  Object.fromEntries(TEMPLATE_KINDS.map((kind) => [kind, []]));

const emptyCatalog = () => ({
  templatesByKey: {},
  catalogIdsByKind: emptyCatalogIds(),
});

const emptyDocumentsByKind = () =>
  Object.fromEntries(TEMPLATE_KINDS.map((kind) => [kind, {}]));

const EMPTY_TEMPLATE_DOCUMENTS = Object.freeze({});

const emptyOperationsByKind = () =>
  Object.fromEntries(
    TEMPLATE_KINDS.map((kind) => [
      kind,
      { loading: false, saving: false, error: "" },
    ])
  );

const EMPTY_TEMPLATE_OPERATION = Object.freeze({
  loading: false,
  saving: false,
  error: "",
});

const emptyBindings = () => {
  const bindings = Object.fromEntries(
    TEMPLATE_KINDS.map((kind) => [kind, normalizeTemplateBinding()])
  );
  bindings.menu = normalizeTemplateBinding({
    defaultId: "menu-preset-1",
  });
  bindings.hero = normalizeTemplateBinding({
    defaultId: "hero-preset-1",
  });
  bindings.form = normalizeTemplateBinding({
    defaultId: "form-preset-1",
  });
  return bindings;
};

const DEFAULT_BINDINGS_BY_KIND = emptyBindings();
const EMPTY_TEMPLATE_BINDING = Object.freeze(normalizeTemplateBinding());
const TEMPLATE_BINDING_FIELDS = Object.freeze([
  "activeId",
  "defaultId",
  "pageOverrideId",
  "hydrated",
  "updatedAt",
]);
const areTemplateBindingsEqual = (left, right) =>
  TEMPLATE_BINDING_FIELDS.every((field) => left?.[field] === right?.[field]);

const createInitialCatalog = () => {
  const siteId = useBuilderContextStore.getState().siteId || "default";
  const entries = [
    normalizeTemplateCatalogEntry({
      id: "menu-preset-1",
      name: "Menu 1",
      kind: "menu",
      scope: "site",
      source: "menubar",
      status: "published",
      siteId,
    }),
    normalizeTemplateCatalogEntry({
      id: "hero-preset-1",
      name: "Hero 1",
      kind: "hero",
      scope: "section",
      source: "menubar",
      status: "published",
      siteId,
    }),
    normalizeTemplateCatalogEntry({
      id: "form-preset-1",
      name: "Form 1",
      kind: "form",
      scope: "component",
      source: "forms",
      status: "published",
      siteId,
    }),
  ].filter(Boolean);
  const templatesByKey = Object.fromEntries(
    entries.map((entry) => [entry.key, entry])
  );
  const catalogIdsByKind = emptyCatalogIds();
  entries.forEach((entry) => {
    catalogIdsByKind[entry.kind].push(entry.key);
  });
  return { templatesByKey, catalogIdsByKind };
};

const createInitialState = () => {
  const initialCatalog = createInitialCatalog();
  const siteId = useBuilderContextStore.getState().siteId || "default";
  return {
    catalogBySiteId: {
      [siteId]: initialCatalog,
    },
    bindingsBySiteId: {
      [siteId]: emptyBindings(),
    },
    documentsBySiteId: {
      [siteId]: emptyDocumentsByKind(),
    },
    operationsBySiteId: {
      [siteId]: emptyOperationsByKind(),
    },
    selectedTemplateKeyBySiteId: {
      [siteId]: "",
    },
  };
};

const validKind = (kind) => TEMPLATE_KINDS.includes(kind);

export const useTemplateStore = create((set, get) => ({
  ...createInitialState(),

  hydrateCatalog: (kind, entries = [], binding = {}) => {
    if (!validKind(kind)) return;
    const siteId = useBuilderContextStore.getState().siteId || "default";
    const normalizedEntries = (Array.isArray(entries) ? entries : [])
      .map((entry) =>
        normalizeTemplateCatalogEntry(
          { ...entry, siteId: entry?.siteId || siteId },
          kind
        )
      )
      .filter(Boolean);

    set((state) => {
      const siteBindings = state.bindingsBySiteId[siteId] || emptyBindings();
      const siteCatalog = state.catalogBySiteId[siteId] || emptyCatalog();
      const siteOperations =
        state.operationsBySiteId[siteId] || emptyOperationsByKind();
      const templatesByKey = Object.fromEntries(
        Object.entries(siteCatalog.templatesByKey).filter(
          ([, entry]) => entry.kind !== kind
        )
      );
      normalizedEntries.forEach((entry) => {
        templatesByKey[entry.key] = entry;
      });

      return {
        catalogBySiteId: {
          ...state.catalogBySiteId,
          [siteId]: {
            templatesByKey,
            catalogIdsByKind: {
              ...siteCatalog.catalogIdsByKind,
              [kind]: normalizedEntries.map((entry) => entry.key),
            },
          },
        },
        bindingsBySiteId: {
          ...state.bindingsBySiteId,
          [siteId]: {
            ...siteBindings,
            [kind]: normalizeTemplateBinding({
              ...siteBindings[kind],
              ...binding,
            }),
          },
        },
        operationsBySiteId: {
          ...state.operationsBySiteId,
          [siteId]: {
            ...siteOperations,
            [kind]: { ...siteOperations[kind], loading: false, error: "" },
          },
        },
      };
    });
  },

  replaceCatalog: (kind, entries = []) => {
    if (!validKind(kind)) return;
    const siteId = useBuilderContextStore.getState().siteId || "default";
    const normalizedEntries = (Array.isArray(entries) ? entries : [])
      .map((entry) =>
        normalizeTemplateCatalogEntry(
          { ...entry, siteId: entry?.siteId || siteId },
          kind
        )
      )
      .filter(Boolean);
    set((state) => {
      const siteCatalog = state.catalogBySiteId[siteId] || emptyCatalog();
      const templatesByKey = Object.fromEntries(
        Object.entries(siteCatalog.templatesByKey).filter(
          ([, entry]) => entry.kind !== kind
        )
      );
      normalizedEntries.forEach((entry) => {
        templatesByKey[entry.key] = entry;
      });
      return {
        catalogBySiteId: {
          ...state.catalogBySiteId,
          [siteId]: {
            templatesByKey,
            catalogIdsByKind: {
              ...siteCatalog.catalogIdsByKind,
              [kind]: normalizedEntries.map((entry) => entry.key),
            },
          },
        },
      };
    });
  },

  replacePresetCollection: (kind, nextPresets, entryDefaults = {}) => {
    if (!validKind(kind)) return;
    const siteId = useBuilderContextStore.getState().siteId || "default";
    set((state) => {
      const siteCatalog = state.catalogBySiteId[siteId] || emptyCatalog();
      const siteDocuments =
        state.documentsBySiteId[siteId] || emptyDocumentsByKind();
      const currentPresets = siteCatalog.catalogIdsByKind[kind]
        .map((key) => {
          const entry = siteCatalog.templatesByKey[key];
          return siteDocuments[kind][entry?.id] || entry;
        })
        .filter(Boolean);
      const resolvedPresets =
        typeof nextPresets === "function"
          ? nextPresets(currentPresets)
          : nextPresets;
      if (!Array.isArray(resolvedPresets)) return state;

      const normalizedEntries = resolvedPresets
        .map((preset) =>
          normalizeTemplateCatalogEntry(
            {
              ...entryDefaults,
              ...preset,
              siteId: preset?.siteId || siteId,
            },
            kind
          )
        )
        .filter(Boolean);
      const presetById = Object.fromEntries(
        resolvedPresets
          .filter((preset) => preset?.id != null)
          .map((preset) => [String(preset.id), preset])
      );
      const documents = Object.fromEntries(
        normalizedEntries.map((entry) => [
          entry.id,
          presetById[entry.id] || entry,
        ])
      );
      const templatesByKey = Object.fromEntries(
        Object.entries(siteCatalog.templatesByKey).filter(
          ([, entry]) => entry.kind !== kind
        )
      );
      normalizedEntries.forEach((entry) => {
        templatesByKey[entry.key] = entry;
      });

      return {
        catalogBySiteId: {
          ...state.catalogBySiteId,
          [siteId]: {
            templatesByKey,
            catalogIdsByKind: {
              ...siteCatalog.catalogIdsByKind,
              [kind]: normalizedEntries.map((entry) => entry.key),
            },
          },
        },
        documentsBySiteId: {
          ...state.documentsBySiteId,
          [siteId]: {
            ...siteDocuments,
            [kind]: documents,
          },
        },
      };
    });
  },

  setTemplateBinding: (kind, binding = {}) => {
    if (!validKind(kind)) return;
    const siteId = useBuilderContextStore.getState().siteId || "default";
    set((state) => {
      const siteBindings = state.bindingsBySiteId[siteId] || emptyBindings();
      const currentBinding = siteBindings[kind];
      const nextBinding = normalizeTemplateBinding({
        ...currentBinding,
        ...binding,
      });
      if (areTemplateBindingsEqual(currentBinding, nextBinding)) return state;
      return {
        bindingsBySiteId: {
          ...state.bindingsBySiteId,
          [siteId]: {
            ...siteBindings,
            [kind]: nextBinding,
          },
        },
      };
    });
  },

  setPageTemplateOverrides: (overrides = {}) => {
    const siteId = useBuilderContextStore.getState().siteId || "default";
    set((state) => {
      const bindingsByKind = {
        ...(state.bindingsBySiteId[siteId] || emptyBindings()),
      };
      let changed = false;
      ["menu", "hero"].forEach((kind) => {
        const nextBinding = normalizeTemplateBinding({
          ...bindingsByKind[kind],
          pageOverrideId: overrides[kind],
        });
        if (!areTemplateBindingsEqual(bindingsByKind[kind], nextBinding)) {
          bindingsByKind[kind] = nextBinding;
          changed = true;
        }
      });
      if (!changed) return state;
      return {
        bindingsBySiteId: {
          ...state.bindingsBySiteId,
          [siteId]: bindingsByKind,
        },
      };
    });
  },

  setTemplateOperation: (kind, operation = {}) => {
    if (!validKind(kind)) return;
    const siteId = useBuilderContextStore.getState().siteId || "default";
    set((state) => {
      const siteOperations =
        state.operationsBySiteId[siteId] || emptyOperationsByKind();
      const currentOperation = siteOperations[kind];
      const nextOperation = {
        loading:
          typeof operation.loading === "boolean"
            ? operation.loading
            : currentOperation.loading,
        saving:
          typeof operation.saving === "boolean"
            ? operation.saving
            : currentOperation.saving,
        error: Object.prototype.hasOwnProperty.call(operation, "error")
          ? String(operation.error || "")
          : currentOperation.error,
      };
      if (
        currentOperation.loading === nextOperation.loading &&
        currentOperation.saving === nextOperation.saving &&
        currentOperation.error === nextOperation.error
      ) {
        return state;
      }
      return {
        operationsBySiteId: {
          ...state.operationsBySiteId,
          [siteId]: {
            ...siteOperations,
            [kind]: nextOperation,
          },
        },
      };
    });
  },

  setSelectedTemplateRef: (value) => {
    const templateRef = normalizeTemplateRef(value);
    const selectedTemplateKey = templateRef
      ? createTemplateKey(templateRef.kind, templateRef.id)
      : "";
    const siteId = useBuilderContextStore.getState().siteId || "default";
    set((state) =>
      state.selectedTemplateKeyBySiteId[siteId] === selectedTemplateKey
        ? state
        : {
            selectedTemplateKeyBySiteId: {
              ...state.selectedTemplateKeyBySiteId,
              [siteId]: selectedTemplateKey,
            },
          }
    );
    useBuilderContextStore.getState().setSiteContext({
      templateId: templateRef?.id || "",
      templateVersion: templateRef?.version || "",
      templateScope: templateRef?.scope || "site",
      templateSource: templateRef?.source || "",
    });
  },

  getResolvedTemplateId: (kind) =>
    validKind(kind)
      ? resolveTemplateId(
          (
            get().bindingsBySiteId[
              useBuilderContextStore.getState().siteId || "default"
            ] || emptyBindings()
          )[kind]
        )
      : "",

  setTemplateDocuments: (kind, nextDocuments) => {
    if (!validKind(kind)) return;
    const siteId = useBuilderContextStore.getState().siteId || "default";
    set((state) => {
      const siteDocuments =
        state.documentsBySiteId[siteId] || emptyDocumentsByKind();
      const currentDocuments = siteDocuments[kind];
      const resolvedDocuments =
        typeof nextDocuments === "function"
          ? nextDocuments(currentDocuments)
          : nextDocuments;
      const documents =
        resolvedDocuments &&
        typeof resolvedDocuments === "object" &&
        !Array.isArray(resolvedDocuments)
          ? resolvedDocuments
          : {};
      return Object.is(currentDocuments, documents)
        ? state
        : {
            documentsBySiteId: {
              ...state.documentsBySiteId,
              [siteId]: {
                ...siteDocuments,
                [kind]: documents,
              },
            },
          };
    });
  },

  resetTemplateDomain: () => {
    set(createInitialState());
    useBuilderContextStore.getState().setSiteContext({
      templateId: "",
      templateVersion: "",
      templateScope: "site",
      templateSource: "",
    });
  },
}));

export const getTemplateCatalog = (kind) => {
  if (!validKind(kind)) return [];
  const state = useTemplateStore.getState();
  const siteId = useBuilderContextStore.getState().siteId || "default";
  const siteCatalog = state.catalogBySiteId[siteId];
  if (!siteCatalog) return [];
  return siteCatalog.catalogIdsByKind[kind]
    .map((key) => siteCatalog.templatesByKey[key])
    .filter(Boolean);
};

export const useTemplateCatalog = (kind) => {
  const siteId = useBuilderContextStore((state) => state.siteId);
  return useTemplateStore(
    useShallow((state) =>
      validKind(kind)
        ? (state.catalogBySiteId[siteId]?.catalogIdsByKind[kind] || [])
            .map((key) => state.catalogBySiteId[siteId]?.templatesByKey[key])
            .filter(Boolean)
        : []
    )
  );
};

export const getTemplateDocuments = (kind, requestedSiteId) => {
  if (!validKind(kind)) return EMPTY_TEMPLATE_DOCUMENTS;
  const siteId =
    String(
      requestedSiteId ||
        useBuilderContextStore.getState().siteId ||
        "default"
    ).trim() || "default";
  return (
    useTemplateStore.getState().documentsBySiteId[siteId]?.[kind] ||
    EMPTY_TEMPLATE_DOCUMENTS
  );
};

export const useTemplateDocuments = (kind) => {
  const siteId = useBuilderContextStore((state) => state.siteId);
  return useTemplateStore((state) =>
    validKind(kind)
      ? state.documentsBySiteId[siteId]?.[kind] || EMPTY_TEMPLATE_DOCUMENTS
      : EMPTY_TEMPLATE_DOCUMENTS
  );
};

export const getTemplateOperation = (kind, requestedSiteId) => {
  if (!validKind(kind)) return EMPTY_TEMPLATE_OPERATION;
  const siteId =
    String(
      requestedSiteId ||
        useBuilderContextStore.getState().siteId ||
        "default"
    ).trim() || "default";
  return (
    useTemplateStore.getState().operationsBySiteId[siteId]?.[kind] ||
    EMPTY_TEMPLATE_OPERATION
  );
};

export const getSelectedTemplateKey = (requestedSiteId) => {
  const siteId =
    String(
      requestedSiteId ||
        useBuilderContextStore.getState().siteId ||
        "default"
    ).trim() || "default";
  return (
    useTemplateStore.getState().selectedTemplateKeyBySiteId[siteId] || ""
  );
};

export const useSelectedTemplateKey = () => {
  const siteId = useBuilderContextStore((state) => state.siteId);
  return useTemplateStore(
    (state) => state.selectedTemplateKeyBySiteId[siteId] || ""
  );
};

export const useTemplateOperation = (kind) => {
  const siteId = useBuilderContextStore((state) => state.siteId);
  return useTemplateStore((state) =>
    validKind(kind)
      ? state.operationsBySiteId[siteId]?.[kind] || EMPTY_TEMPLATE_OPERATION
      : EMPTY_TEMPLATE_OPERATION
  );
};

export const getTemplateBinding = (kind, requestedSiteId) => {
  if (!validKind(kind)) return normalizeTemplateBinding();
  const siteId =
    String(
      requestedSiteId ||
        useBuilderContextStore.getState().siteId ||
        "default"
    ).trim() || "default";
  return (
    useTemplateStore.getState().bindingsBySiteId[siteId]?.[kind] ||
    DEFAULT_BINDINGS_BY_KIND[kind]
  );
};

export const useTemplateBinding = (kind) => {
  const siteId = useBuilderContextStore((state) => state.siteId);
  return useTemplateStore((state) =>
    validKind(kind)
      ? state.bindingsBySiteId[siteId]?.[kind] || DEFAULT_BINDINGS_BY_KIND[kind]
      : EMPTY_TEMPLATE_BINDING
  );
};

export const useResolvedTemplateId = (kind) => {
  const binding = useTemplateBinding(kind);
  return validKind(kind) ? resolveTemplateId(binding) : "";
};
