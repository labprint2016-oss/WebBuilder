import {
  SEO_ENTITY_KINDS,
  SEO_ROBOTS_VALUES,
  SEO_TWITTER_CARDS,
} from "./seoConstants";

const text = (value) => String(value ?? "").trim();

const allowed = (value, values, fallback = "") =>
  values.includes(value) ? value : fallback;

const plainObject = (value) =>
  value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};

export const normalizeSeoSlug = (value) =>
  text(value)
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}\-_~]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

export const createSeoEntityKey = ({
  siteId,
  locale,
  entityKind,
  entityId,
}) => {
  const kind = allowed(entityKind, SEO_ENTITY_KINDS);
  const parts = [text(siteId), text(locale), kind, text(entityId)];
  return parts.every(Boolean) ? parts.join(":") : "";
};

export const createSeoSiteKey = (siteId, locale) => {
  const parts = [text(siteId), text(locale)];
  return parts.every(Boolean) ? parts.join(":") : "";
};

export const normalizeSeoMeta = (value = {}) => {
  const openGraph = plainObject(value.openGraph);
  const twitter = plainObject(value.twitter);
  const hreflang = Array.isArray(value.hreflang)
    ? value.hreflang
        .map((entry) => ({
          locale: text(entry?.locale),
          url: text(entry?.url),
          isDefault: entry?.isDefault === true,
        }))
        .filter((entry) => entry.locale && entry.url)
    : [];
  const structuredData = Array.isArray(value.structuredData)
    ? value.structuredData
        .map(plainObject)
        .filter((entry) => Object.keys(entry).length > 0)
    : [];

  return {
    title: text(value.title),
    description: text(value.description),
    canonicalUrl: text(value.canonicalUrl),
    robots: allowed(value.robots, SEO_ROBOTS_VALUES),
    openGraph: {
      title: text(openGraph.title),
      description: text(openGraph.description),
      url: text(openGraph.url),
      type: text(openGraph.type),
      image: text(openGraph.image),
      locale: text(openGraph.locale),
      siteName: text(openGraph.siteName),
    },
    twitter: {
      card: allowed(twitter.card, SEO_TWITTER_CARDS),
      title: text(twitter.title),
      description: text(twitter.description),
      image: text(twitter.image),
      site: text(twitter.site),
      creator: text(twitter.creator),
    },
    hreflang,
    structuredData,
  };
};

export const normalizePageSeo = (value = {}, fallbackTitle = "") => ({
  ...normalizeSeoMeta({
    ...value,
    title: text(value?.title) || text(fallbackTitle),
  }),
  slug: normalizeSeoSlug(
    value?.slug || value?.title || fallbackTitle
  ),
});

const mergeObjectFields = (base, override) =>
  Object.fromEntries(
    Object.keys(base).map((key) => [
      key,
      override[key] === "" || override[key] == null
        ? base[key]
        : override[key],
    ])
  );

export const mergeSeoMeta = (...layers) => {
  const merged = layers.reduce(
    (current, layer) => {
      const next = normalizeSeoMeta(layer);
      return {
        ...mergeObjectFields(current, next),
        openGraph: mergeObjectFields(current.openGraph, next.openGraph),
        twitter: mergeObjectFields(current.twitter, next.twitter),
        hreflang:
          next.hreflang.length > 0 ? next.hreflang : current.hreflang,
        structuredData:
          next.structuredData.length > 0
            ? next.structuredData
            : current.structuredData,
      };
    },
    normalizeSeoMeta()
  );

  return {
    ...merged,
    robots: merged.robots || "index,follow",
    openGraph: {
      ...merged.openGraph,
      title: merged.openGraph.title || merged.title,
      description: merged.openGraph.description || merged.description,
      url: merged.openGraph.url || merged.canonicalUrl,
    },
    twitter: {
      ...merged.twitter,
      card: merged.twitter.card || "summary_large_image",
      title: merged.twitter.title || merged.openGraph.title || merged.title,
      description:
        merged.twitter.description ||
        merged.openGraph.description ||
        merged.description,
      image: merged.twitter.image || merged.openGraph.image,
    },
  };
};
