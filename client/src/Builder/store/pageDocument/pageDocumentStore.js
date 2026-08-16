import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { useBuilderContextStore } from "../builderContextStore";
import {
  mergePageMetadata,
  normalizePageCatalogEntry,
  normalizePageMetadata,
} from "./pageDocumentContract";

const emptyOperation = () => ({
  list: { loading: false, error: "" },
  detail: { pageId: "", loading: false, error: "" },
  save: { pageId: "", saving: false, error: "" },
});

const createInitialState = () => ({
  catalogIds: [],
  catalogById: {},
  metadataById: {},
  revisionById: {},
  metadataVersionById: {},
  dirtyMetadataById: {},
  layoutVersionById: {},
  savedLayoutVersionById: {},
  dirtyLayoutById: {},
  catalogStaleBySiteId: {},
  operationBySiteId: {},
});

const currentSiteId = () =>
  useBuilderContextStore.getState().siteId || "default";

const upsertCatalogEntry = (catalogById, catalogIds, entry) => {
  if (!entry) return;
  catalogById[entry.id] = entry;
  if (!catalogIds.includes(entry.id)) catalogIds.push(entry.id);
};

export const usePageDocumentStore = create((set, get) => ({
  ...createInitialState(),

  activateServerPage: (page = {}, defaultPageId = "") => {
    const metadata = normalizePageMetadata(page, currentSiteId());
    const activePageId = metadata?.id || "";
    const resolvedDefaultPageId = String(
      defaultPageId || (metadata?.isDefault === true ? activePageId : "")
    ).trim();

    if (metadata) {
      get().hydrateServerPage(page);
      get().hydrateLayoutBaseline(activePageId);
    }

    const builderContext = useBuilderContextStore.getState();
    builderContext.setActivePageId(activePageId);
    builderContext.setDefaultPageId(resolvedDefaultPageId);
    return metadata;
  },

  hydrateCatalog: (pages = [], requestedSiteId) => {
    const siteId = requestedSiteId || currentSiteId();
    const entries = (Array.isArray(pages) ? pages : [])
      .map((page) => normalizePageCatalogEntry(page, siteId))
      .filter(Boolean);
    set((state) => {
      const currentOperation =
        state.operationBySiteId[siteId] || emptyOperation();
      const retainedCatalogIds = state.catalogIds.filter(
        (id) => state.catalogById[id]?.siteId !== siteId
      );
      const retainedCatalogById = Object.fromEntries(
        Object.entries(state.catalogById).filter(
          ([, entry]) => entry?.siteId !== siteId
        )
      );
      return {
        catalogIds: [
          ...retainedCatalogIds,
          ...entries.map((entry) => entry.id),
        ],
        catalogById: {
          ...retainedCatalogById,
          ...Object.fromEntries(entries.map((entry) => [entry.id, entry])),
        },
        catalogStaleBySiteId: {
          ...state.catalogStaleBySiteId,
          [siteId]: false,
        },
        operationBySiteId: {
          ...state.operationBySiteId,
          [siteId]: {
            ...currentOperation,
            list: { loading: false, error: "" },
          },
        },
      };
    });
  },

  hydrateServerPage: (page = {}, requestedSiteId) => {
    const metadata = normalizePageMetadata(
      page,
      requestedSiteId || currentSiteId()
    );
    if (!metadata) return;
    set((state) => {
      const catalogById = { ...state.catalogById };
      const catalogIds = [...state.catalogIds];
      upsertCatalogEntry(catalogById, catalogIds, metadata);
      return {
        catalogById,
        catalogIds,
        metadataById: {
          ...state.metadataById,
          [metadata.id]: metadata,
        },
        revisionById: {
          ...state.revisionById,
          [metadata.id]: metadata.updatedAt,
        },
        metadataVersionById: {
          ...state.metadataVersionById,
          [metadata.id]: 0,
        },
        dirtyMetadataById: {
          ...state.dirtyMetadataById,
          [metadata.id]: false,
        },
      };
    });
  },

  patchLocalMetadata: (pageId, patch = {}) => {
    const id = String(pageId || "").trim();
    if (!id) return;
    let nextVersion = 0;
    set((state) => {
      const current =
        state.metadataById[id] ||
        state.catalogById[id] ||
        { id, _id: id };
      const metadata = mergePageMetadata(current, patch, currentSiteId());
      if (!metadata) return state;
      nextVersion = (state.metadataVersionById[id] || 0) + 1;
      const catalogById = { ...state.catalogById };
      const catalogIds = [...state.catalogIds];
      upsertCatalogEntry(catalogById, catalogIds, metadata);
      return {
        catalogById,
        catalogIds,
        metadataById: {
          ...state.metadataById,
          [id]: metadata,
        },
        metadataVersionById: {
          ...state.metadataVersionById,
          [id]: nextVersion,
        },
        dirtyMetadataById: {
          ...state.dirtyMetadataById,
          [id]: true,
        },
      };
    });
    return nextVersion;
  },

  applySavedPage: (page = {}, options = {}) => {
    const metadata = normalizePageMetadata(
      page,
      options.siteId || currentSiteId()
    );
    if (!metadata) return;
    set((state) => {
      const expectedVersion = Number(options.expectedVersion);
      const hasExpectedVersion = Number.isFinite(expectedVersion);
      const currentVersion = state.metadataVersionById[metadata.id] || 0;
      const canMarkClean =
        !hasExpectedVersion || currentVersion === expectedVersion;
      const metadataToStore = canMarkClean
        ? metadata
        : state.metadataById[metadata.id] || metadata;
      const catalogById = { ...state.catalogById };
      const catalogIds = [...state.catalogIds];
      upsertCatalogEntry(catalogById, catalogIds, metadataToStore);
      return {
        catalogById,
        catalogIds,
        metadataById: {
          ...state.metadataById,
          [metadata.id]: metadataToStore,
        },
        revisionById: {
          ...state.revisionById,
          [metadata.id]: metadata.updatedAt,
        },
        dirtyMetadataById: {
          ...state.dirtyMetadataById,
          [metadata.id]: canMarkClean
            ? false
            : state.dirtyMetadataById[metadata.id],
        },
      };
    });
  },

  getMetadataVersion: (pageId) =>
    get().metadataVersionById[String(pageId || "").trim()] || 0,

  getActivePageMetadata: () => {
    const { activePageId, siteId } = useBuilderContextStore.getState();
    const id = String(activePageId || "").trim();
    if (!id) return null;
    const state = get();
    const metadata = state.metadataById[id] || state.catalogById[id] || null;
    return metadata?.siteId === siteId ? metadata : null;
  },

  hydrateLayoutBaseline: (pageId) => {
    const id = String(pageId || "").trim();
    if (!id) return;
    set((state) => ({
      layoutVersionById: {
        ...state.layoutVersionById,
        [id]: 0,
      },
      savedLayoutVersionById: {
        ...state.savedLayoutVersionById,
        [id]: 0,
      },
      dirtyLayoutById: {
        ...state.dirtyLayoutById,
        [id]: false,
      },
    }));
  },

  markLayoutChanged: (pageId) => {
    const id = String(pageId || "").trim();
    if (!id) return 0;
    let nextVersion = 0;
    set((state) => {
      nextVersion = (state.layoutVersionById[id] || 0) + 1;
      return {
        layoutVersionById: {
          ...state.layoutVersionById,
          [id]: nextVersion,
        },
        dirtyLayoutById: {
          ...state.dirtyLayoutById,
          [id]: true,
        },
      };
    });
    return nextVersion;
  },

  getLayoutVersion: (pageId) =>
    get().layoutVersionById[String(pageId || "").trim()] || 0,

  getPageDirtyState: (pageId) => {
    const id = String(pageId || "").trim();
    const state = get();
    const metadata = state.dirtyMetadataById[id] === true;
    const layout = state.dirtyLayoutById[id] === true;
    return { metadata, layout, dirty: metadata || layout };
  },

  markLayoutSaved: (pageId, expectedVersion) => {
    const id = String(pageId || "").trim();
    if (!id) return;
    const savedVersion = Number(expectedVersion);
    if (!Number.isFinite(savedVersion)) return;
    set((state) => {
      const currentVersion = state.layoutVersionById[id] || 0;
      const nextSavedVersion = Math.max(
        state.savedLayoutVersionById[id] || 0,
        savedVersion
      );
      return {
        savedLayoutVersionById: {
          ...state.savedLayoutVersionById,
          [id]: nextSavedVersion,
        },
        dirtyLayoutById: {
          ...state.dirtyLayoutById,
          [id]: currentVersion !== nextSavedVersion,
        },
      };
    });
  },

  getCatalogSnapshot: (requestedSiteId) => {
    const siteId = requestedSiteId || currentSiteId();
    const state = get();
    return state.catalogIds
      .map((id) => state.catalogById[id])
      .filter((entry) => entry?.siteId === siteId);
  },

  isCatalogStale: (requestedSiteId) => {
    const siteId = requestedSiteId || currentSiteId();
    return get().catalogStaleBySiteId[siteId] !== false;
  },

  markCatalogStale: (requestedSiteId) => {
    const siteId = requestedSiteId || currentSiteId();
    set((state) =>
      state.catalogStaleBySiteId[siteId] === true
        ? state
        : {
            catalogStaleBySiteId: {
              ...state.catalogStaleBySiteId,
              [siteId]: true,
            },
          }
    );
  },

  getOperation: (kind, requestedSiteId) => {
    const siteId = requestedSiteId || currentSiteId();
    return get().operationBySiteId[siteId]?.[kind] || emptyOperation()[kind];
  },

  setOperation: (kind, operation = {}, requestedSiteId) => {
    if (!["list", "detail", "save"].includes(kind)) return;
    const siteId = requestedSiteId || currentSiteId();
    set((state) => {
      const currentOperation =
        state.operationBySiteId[siteId] || emptyOperation();
      return {
        operationBySiteId: {
          ...state.operationBySiteId,
          [siteId]: {
            ...currentOperation,
            [kind]: {
              ...currentOperation[kind],
              ...operation,
              error: Object.prototype.hasOwnProperty.call(operation, "error")
                ? String(operation.error || "")
                : currentOperation[kind].error,
            },
          },
        },
      };
    });
  },

  resetPageDocumentDomain: () => set(createInitialState()),
}));

export const usePageCatalog = () => {
  const siteId = useBuilderContextStore((state) => state.siteId);
  return usePageDocumentStore(
    useShallow((state) =>
      state.catalogIds
        .map((id) => state.catalogById[id])
        .filter((entry) => entry?.siteId === siteId)
    )
  );
};

export const usePageDirty = (pageId) => {
  const id = String(pageId || "").trim();
  return usePageDocumentStore(
    (state) =>
      state.dirtyMetadataById[id] === true ||
      state.dirtyLayoutById[id] === true
  );
};

export const useActivePageMetadata = () => {
  const siteId = useBuilderContextStore((state) => state.siteId);
  const activePageId = useBuilderContextStore((state) => state.activePageId);
  return usePageDocumentStore((state) => {
    const metadata =
      state.metadataById[activePageId] ||
      state.catalogById[activePageId] ||
      null;
    return metadata?.siteId === siteId ? metadata : null;
  });
};
