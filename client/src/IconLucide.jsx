import {
  AppWindowMac,
  BadgeJapaneseYenIcon,
  Bluetooth,
  Brush,
  CirclePower,
  CircleFadingPlus,
  GalleryThumbnails,
  Github,
  Grid2x2,
  Hand,
  HardDrive,
  Image,
  ImagePlus,
  ImageUp,
  Layers2,
  LayoutGrid,
  LayoutList,
  Moon,
  PaintRoller,
  Palette,
  Projector,
  SquareChevronDown,
  SquareSplitHorizontal,
  SunMoon,
  TableProperties,
  Tags,
  Telescope,
  Wifi,
} from "lucide-react";

const ICON_REGISTRY = {
  AppWindowMac,
  BadgeJapaneseYenIcon,
  Bluetooth,
  Brush,
  CirclePower,
  CircleFadingPlus,
  GalleryThumbnails,
  Github,
  Grid2x2,
  Hand,
  HardDrive,
  Image,
  ImagePlus,
  ImageUp,
  Layers2,
  LayoutGrid,
  LayoutList,
  Moon,
  PaintRoller,
  Palette,
  Projector,
  SquareChevronDown,
  SquareSplitHorizontal,
  SunMoon,
  TableProperties,
  Tags,
  Telescope,
  Wifi,
};

const IconLucide = ({ iconName, color, className, size = null, strokeWidth = null }) => {
  const safeName = typeof iconName === "string" ? iconName.trim() : "";
  const Icon = safeName ? ICON_REGISTRY[safeName] : null;
  if (!Icon) return null;
  return (
    <Icon
      color={color}
      className={className}
      size={size ? size : 20}
      strokeWidth={strokeWidth ? strokeWidth : 2}
    />
  );
};

export default IconLucide;