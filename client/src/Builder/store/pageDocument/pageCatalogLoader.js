import { listPages } from "../../../../Functions/pages";
import { useBuilderContextStore } from "../builderContextStore";
import { usePageDocumentStore } from "./pageDocumentStore";

const catalogRequestsBySiteId = new Map();

export const ensurePageCatalogLoaded = (force = false) => {
  const siteId = useBuilderContextStore.getState().siteId || "default";
  const store = usePageDocumentStore.getState();
  if (force) store.markCatalogStale(siteId);
  const cached = store.getCatalogSnapshot(siteId);
  if (!force && !store.isCatalogStale(siteId) && cached.length > 0) {
    return Promise.resolve(cached);
  }
  const pendingRequest = catalogRequestsBySiteId.get(siteId);
  if (!force && pendingRequest) return pendingRequest;

  store.setOperation("list", { loading: true, error: "" }, siteId);
  const request = listPages()
    .then((response) => {
      const pages = Array.isArray(response?.data) ? response.data : [];
      usePageDocumentStore.getState().hydrateCatalog(pages, siteId);
      return usePageDocumentStore.getState().getCatalogSnapshot(siteId);
    })
    .catch((error) => {
      usePageDocumentStore.getState().setOperation("list", {
        loading: false,
        error: error?.message || "ไม่สามารถโหลดรายการหน้าได้",
      }, siteId);
      return [];
    })
    .finally(() => {
      if (catalogRequestsBySiteId.get(siteId) === request) {
        catalogRequestsBySiteId.delete(siteId);
      }
    });

  catalogRequestsBySiteId.set(siteId, request);
  return request;
};
