import { normalizePageSeo } from "../seo/seoContract";

const text = (value, fallback = "") => {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
};
const plainObject = (value) =>
  value && typeof value === "object" && !Array.isArray(value) ? value : {};

export const normalizePageCatalogEntry = (value = {}, siteId = "default") => {
  const id = text(value._id || value.id);
  if (!id) return null;
  const pageName = text(value.pageName);
  return {
    id,
    siteId: text(value.siteId, siteId) || "default",
    pageName,
    isDefault: value.isDefault === true,
    slug: text(value.slug) || normalizePageSeo(value.pageSeo, pageName).slug,
    createdAt: text(value.createdAt),
    updatedAt: text(value.updatedAt),
  };
};

export const normalizePageMetadata = (value = {}, siteId = "default") => {
  const catalogEntry = normalizePageCatalogEntry(value, siteId);
  if (!catalogEntry) return null;
  const latestID = Number(value.latestID);
  return {
    ...catalogEntry,
    latestID: Number.isFinite(latestID) ? latestID : 0,
    menuPresetId: text(value.menuPresetId),
    heroPresetId: text(value.heroPresetId),
    pagePopup: { ...plainObject(value.pagePopup) },
    pageSeo: normalizePageSeo(value.pageSeo, catalogEntry.pageName),
  };
};

export const mergePageMetadata = (
  current = {},
  patch = {},
  siteId = "default"
) =>
  normalizePageMetadata(
    {
      ...current,
      ...patch,
      _id: patch._id || patch.id || current.id,
      pagePopup: Object.prototype.hasOwnProperty.call(patch, "pagePopup")
        ? patch.pagePopup
        : current.pagePopup,
      pageSeo: Object.prototype.hasOwnProperty.call(patch, "pageSeo")
        ? patch.pageSeo
        : current.pageSeo,
    },
    siteId
  );
