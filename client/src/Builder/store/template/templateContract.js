import {
  TEMPLATE_KINDS,
  TEMPLATE_SCOPES,
  TEMPLATE_SOURCES,
  TEMPLATE_STATUSES,
} from "./templateConstants";

const text = (value, fallback = "") => {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
};

const allowedValue = (value, allowed, fallback) =>
  allowed.includes(value) ? value : fallback;

export const createTemplateKey = (kind, id) => {
  const normalizedKind = text(kind);
  const normalizedId = text(id);
  return normalizedKind && normalizedId
    ? `${normalizedKind}:${normalizedId}`
    : "";
};

export const normalizeTemplateRef = (value = {}) => {
  const kind = allowedValue(value.kind, TEMPLATE_KINDS, "");
  const id = text(value.id);
  if (!kind || !id) return null;

  return {
    id,
    kind,
    scope: allowedValue(value.scope, TEMPLATE_SCOPES, "site"),
    version: text(value.version, "1"),
    source: allowedValue(value.source, TEMPLATE_SOURCES, "local"),
  };
};

export const normalizeTemplateCatalogEntry = (
  value = {},
  fallbackKind = ""
) => {
  const templateRef = normalizeTemplateRef({
    ...value,
    kind: value.kind || fallbackKind,
  });
  if (!templateRef) return null;

  return {
    ...templateRef,
    key: createTemplateKey(templateRef.kind, templateRef.id),
    name: text(value.name, templateRef.id),
    description: text(value.description),
    status: allowedValue(value.status, TEMPLATE_STATUSES, "draft"),
    siteId: text(value.siteId, "default"),
    thumbnailUrl: text(value.thumbnailUrl),
    updatedAt: text(value.updatedAt),
  };
};

export const normalizeTemplateBinding = (value = {}) => ({
  activeId: text(value.activeId),
  defaultId: text(value.defaultId),
  pageOverrideId: text(value.pageOverrideId),
  hydrated: value.hydrated === true,
  updatedAt: text(value.updatedAt),
});

export const resolveTemplateId = (binding = {}) => {
  const normalized = normalizeTemplateBinding(binding);
  return (
    normalized.pageOverrideId ||
    normalized.defaultId ||
    normalized.activeId ||
    ""
  );
};
