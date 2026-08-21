import { useEffect, useMemo, useState } from "react";
import { getTheme } from "../../../Functions/theme";
import Range from "../HTML/Range";
import { Check } from "lucide-react";
import lodash from "lodash";
import { swatchSelectedCheckClassName } from "../Layouts/Elements/swatchCheckClass";
import { THEME_PANEL_BASIC_COLOR_SWATCHES } from "../themePanelBasicColors";

let cachedTheme = null;
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
            min={0}
            max={255}
            step={1}
            value={safeOpacity}
            pos={(safeOpacity / 255) * 100}
            handleChange={handleOpacity}
            color={rangeColor}
            uncontrolled
          />
        </div>
      )}
      <div className="grid grid-cols-10 place-items-center gap-x-0 gap-y-[6px]">
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
                onClick={() => handleColor(c)}
                aria-label={`เลือกสีกรอบ ${bgColor}`}
              >
                {selected && (
                  <Check
                    className={swatchSelectedCheckClassName(bgColor)}
                    strokeWidth={4}
                  />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ServiceColor;
