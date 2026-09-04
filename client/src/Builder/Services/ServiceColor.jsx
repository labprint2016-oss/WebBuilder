import { memo, useEffect, useMemo, useState } from "react";
import { getTheme } from "../../../Functions/theme";
import Range from "../HTML/Range";
import { Check } from "lucide-react";
import lodash from "lodash";
import { swatchSelectedCheckClassName } from "../Layouts/Elements/swatchCheckClass";
import { THEME_PANEL_BASIC_COLOR_SWATCHES } from "../themePanelBasicColors";

let cachedTheme = null;
export const getCachedPanelTheme = () => cachedTheme;
let themeFetchPromise = null;

const loadSharedTheme = () => {
  if (cachedTheme) return Promise.resolve(cachedTheme);
  if (themeFetchPromise) return themeFetchPromise;
  themeFetchPromise = getTheme("68d37327bedb0efab7dacafb")
    .then((res) => {
      cachedTheme = res?.data || null;
      return cachedTheme;
    })
    .catch((err) => {
      themeFetchPromise = null;
      console.log(err);
      return null;
    });
  return themeFetchPromise;
};

const buildColorSwatches = (theme) => {
  if (!theme?.mainColor?.length) return [...THEME_PANEL_BASIC_COLOR_SWATCHES];
  const mc = theme.mainColor.map((_, i) => ({ type: "mainColor", index: i }));
  const tc = (theme.textColor || []).map((_, i) => ({
    type: "textColor",
    index: i,
  }));
  const oc = (theme.otherColor || []).map((_, i) => ({
    type: "otherColor",
    index: i,
  }));
  return [...mc, ...tc, ...oc, ...THEME_PANEL_BASIC_COLOR_SWATCHES];
};

const ServiceColor = ({
  color,
  opacity,
  handleColor,
  handleOpacity,
  onCommit,
  rangeColor,
  compact = false,
  hideOpacity = false,
  theme: themeProp = null,
}) => {
  const normalizeColorString = (value) =>
    typeof value === "string" ? value.trim().toLowerCase() : value;
  const safeOpacity = Number.isFinite(Number(opacity)) ? Number(opacity) : 255;
  const [fetchedTheme, setFetchedTheme] = useState(cachedTheme);

  useEffect(() => {
    if (themeProp || fetchedTheme) return undefined;
    let cancelled = false;
    loadSharedTheme().then((next) => {
      if (!cancelled && next) setFetchedTheme(next);
    });
    return () => {
      cancelled = true;
    };
  }, [fetchedTheme, themeProp]);

  const theme = themeProp || fetchedTheme;
  const allColors = useMemo(() => buildColorSwatches(theme), [theme]);

  return (
    <div
      className={`${compact ? "mt-0" : "mt-2"} dash-card w-full rounded-md bg-white px-[0px] pb-[5px] pt-[2px] dark:bg-zinc-800`}
    >
      {!hideOpacity && (
        <div className="px-[5px] pb-2">
          <Range
            name="opacity"
            controlLabel="ความโปร่งใส"
            min={0}
            max={255}
            step={1}
            value={safeOpacity}
            pos={(safeOpacity / 255) * 100}
            handleChange={handleOpacity}
            onCommit={onCommit}
            color={rangeColor}
            uncontrolled
          />
        </div>
      )}
      <div
        data-color-swatches="true"
        className="grid grid-cols-10 place-items-center gap-x-0 gap-y-[6px]"
      >
        {allColors.map((c, i) => {
          const bgColor =
            typeof c === "string" ? c : theme?.[c.type]?.[c.index];
          const value = c;
          const selected =
            (typeof value === "string" && typeof color === "string"
              ? normalizeColorString(value) === normalizeColorString(color)
              : false) ||
            value === color ||
            lodash.isEqual(value, color);
          let margin = "";
          if (i % 8 !== 0 && (i + 1) % 8 !== 0) {
            margin += "mx-[65.75px] ";
          }
          return (
            <div className={`${margin}`} key={`bd-${i}`}>
              <button
                type="button"
                className="flex size-[25px] items-center justify-center rounded-full border"
                style={{ backgroundColor: bgColor }}
                onClick={(event) => {
                  const root = event.currentTarget.closest("[data-color-swatches]");
                  root
                    ?.querySelectorAll("[data-swatch-check]")
                    .forEach((node) => {
                      node.hidden = true;
                    });
                  const check = event.currentTarget.querySelector(
                    "[data-swatch-check]"
                  );
                  if (check) check.hidden = false;
                  handleColor(c);
                }}
                aria-label={`เลือกสีกรอบ ${bgColor}`}
              >
                <span data-swatch-check hidden={!selected}>
                  <Check
                    className={swatchSelectedCheckClassName(bgColor)}
                    strokeWidth={4}
                  />
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default memo(ServiceColor, (prev, next) => (
  prev.opacity === next.opacity &&
  prev.rangeColor === next.rangeColor &&
  prev.darkMode === next.darkMode &&
  prev.compact === next.compact &&
  prev.hideOpacity === next.hideOpacity &&
  prev.theme === next.theme &&
  (prev.color === next.color || lodash.isEqual(prev.color, next.color))
));
