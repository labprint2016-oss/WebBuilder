import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as solidIcons from "@fortawesome/free-solid-svg-icons";
import * as brandIcons from "@fortawesome/free-brands-svg-icons";
import * as regularIcons from "@fortawesome/free-regular-svg-icons";

const iconPackByType = {
  fas: solidIcons,
  fab: brandIcons,
  far: regularIcons,
};

const IconAwsome = ({ iconType, iconName, style }) => {
  const safeType = iconType === "fab" || iconType === "far" ? iconType : "fas";
  const iconPack = iconPackByType[safeType] || solidIcons;
  const resolvedIcon = iconName ? iconPack?.[iconName] : null;
  const fallbackIcon = solidIcons?.faCircleQuestion || null;

  if (!resolvedIcon && !fallbackIcon) return null;
  return <FontAwesomeIcon icon={resolvedIcon || fallbackIcon} style={style} />;
};

export default IconAwsome;