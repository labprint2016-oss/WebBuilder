import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const iconPackageByType = {
  fas: "@fortawesome/free-solid-svg-icons",
  fab: "@fortawesome/free-brands-svg-icons",
  far: "@fortawesome/free-regular-svg-icons",
};

const iconCache = new Map();

function getIconCacheKey(iconType, iconName) {
  return `${iconType || "fas"}::${iconName || ""}`;
}

function loadIconDefinition(iconType, iconName) {
  if (!iconName) return Promise.resolve(null);
  const safeType = iconType === "fab" || iconType === "far" ? iconType : "fas";
  const cacheKey = getIconCacheKey(safeType, iconName);
  if (iconCache.has(cacheKey)) return Promise.resolve(iconCache.get(cacheKey));

  const pkg = iconPackageByType[safeType] || iconPackageByType.fas;
  return import(`${pkg}/${iconName}.js`)
    .then((mod) => {
      const iconDef = mod?.[iconName] || mod?.default || null;
      iconCache.set(cacheKey, iconDef);
      return iconDef;
    })
    .catch(() => null);
}

const IconAwsome = ({ iconType, iconName, style }) => {
  const [iconDef, setIconDef] = useState(() => {
    const safeType = iconType === "fab" || iconType === "far" ? iconType : "fas";
    return iconCache.get(getIconCacheKey(safeType, iconName)) || null;
  });

  useEffect(() => {
    let alive = true;
    loadIconDefinition(iconType, iconName).then((resolved) => {
      if (!alive) return;
      setIconDef(resolved);
    });
    return () => {
      alive = false;
    };
  }, [iconType, iconName]);

  if (!iconDef) return null;
  return <FontAwesomeIcon icon={iconDef} style={style} />;
};

export default IconAwsome;