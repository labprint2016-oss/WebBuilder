import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Button, ButtonGroup, Switch } from "@mui/material";
import { Check, AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import { styled } from "@mui/material/styles";
import lodash from "lodash";
import Field from "../HTML/Field";
import Range from "../HTML/Range";
import { swatchSelectedCheckClassName } from "../Layouts/Elements/swatchCheckClass";
import { THEME_PANEL_BASIC_COLOR_SWATCHES } from "../themePanelBasicColors";

const PostPanelSwitch = styled(Switch, {
  shouldForwardProp: (prop) => prop !== "accentColor",
})(({ theme, accentColor = "#0d9488" }) => ({
  width: 28,
  height: 16,
  padding: 0,
  display: "flex",
  "&:active": {
    "& .MuiSwitch-thumb": { width: 15 },
    "& .MuiSwitch-switchBase.Mui-checked": { transform: "translateX(9px)" },
  },
  "& .MuiSwitch-switchBase": {
    padding: 2,
    "&.Mui-checked": {
      transform: "translateX(12px)",
      color: "#fff",
      "& + .MuiSwitch-track": { opacity: 1, backgroundColor: accentColor },
    },
  },
  "& .MuiSwitch-thumb": {
    boxShadow: "0 2px 4px 0 rgb(0 35 11 / 20%)",
    width: 12,
    height: 12,
    borderRadius: 6,
    transition: theme.transitions.create(["width"], { duration: 200 }),
  },
  "& .MuiSwitch-track": {
    borderRadius: 8,
    opacity: 1,
    backgroundColor: "rgba(0,0,0,.25)",
    boxSizing: "border-box",
    ".dark &": { backgroundColor: "rgba(255,255,255,.25)" },
  },
}));

const chipRootSx = {
  width: "100%",
  boxShadow: "none",
  "& .MuiButton-root": { boxShadow: "none", textTransform: "none", minHeight: 34, fontSize: 11 },
  "& .MuiButtonGroup-grouped": { borderRadius: "0 !important" },
  "& .MuiButtonGroup-grouped:first-of-type": {
    borderTopLeftRadius: "0.375rem !important",
    borderBottomLeftRadius: "0.375rem !important",
  },
  "& .MuiButtonGroup-grouped:last-of-type": {
    borderTopRightRadius: "0.375rem !important",
    borderBottomRightRadius: "0.375rem !important",
  },
  "& .MuiButtonGroup-grouped.MuiButton-outlined": { borderColor: "#e2e8f0 !important" },
  ".dark & .MuiButtonGroup-grouped.MuiButton-outlined": {
    borderColor: "rgba(255,255,255,0.1) !important",
  },
};

const chipBtnSx = (selected, accent = "#0d9488") => ({
  flex: 1,
  py: 0,
  px: 0.5,
  lineHeight: 1.2,
  ...(selected
    ? {
        backgroundColor: accent,
        color: "#fff",
        borderColor: "transparent",
        "&:hover": { backgroundColor: accent, borderColor: "transparent" },
      }
    : {
        color: "#1e293b",
        borderColor: "#e2e8f0 !important",
        backgroundColor: "#ffffff",
        "&:hover": { backgroundColor: "#f8fafc", borderColor: "#e2e8f0 !important" },
        ".dark &": {
          color: "#f1f5f9",
          borderColor: "rgba(255,255,255,0.1) !important",
          backgroundColor: "rgba(30,41,59,0.9)",
          "&:hover": {
            backgroundColor: "rgba(30,41,59,1)",
            borderColor: "rgba(255,255,255,0.1) !important",
          },
        },
      }),
});

const DIVIDER_OPTIONS = [
  { value: "none", label: "ไม่มี" },
  { value: "solid", label: "ตรง" },
  { value: "dashed", label: "ประ" },
  { value: "dotted", label: "จุด" },
];
const ALIGN_OPTIONS = [
  { value: "start", label: "ชิดซ้าย", Icon: AlignLeft },
  { value: "center", label: "ตรงกลาง", Icon: AlignCenter },
  { value: "end", label: "ชิดขวา", Icon: AlignRight },
];
const POST_LAYOUT_OPTIONS = [
  { value: "image_content", label: "รูปภาพ + ข้อมูล" },
  { value: "content_only", label: "ข้อมูลอย่างเดียว" },
];

const mergePostElement = (element) => {
  const base = element && typeof element === "object" ? element : {};
  const resolvePostGap = () => {
    const gap = Number(base.postHeadingGap);
    if (Number.isFinite(gap)) return gap;
    const gapImage = Number(base.postHeadingGapImage);
    if (Number.isFinite(gapImage)) return gapImage;
    const gapContent = Number(base.postHeadingGapContent);
    if (Number.isFinite(gapContent)) return gapContent;
    return base.postLayoutMode === "content_only" ? 10 : 18;
  };
  const resolvePostMarginTop = () => {
    const margin = Number(base.postMarginTop);
    if (Number.isFinite(margin)) return margin;
    return 8;
  };
  const resolvePostMarginBottom = () => {
    const margin = Number(base.postMarginBottom);
    if (Number.isFinite(margin)) return margin;
    return 8;
  };
  return {
    ...base,
    type: "post",
    postLayoutMode:
      base.postLayoutMode === "content_only" ? "content_only" : "image_content",
    postHeadingEnabled:
      base.postLayoutMode === "content_only" ? true : base.postHeadingEnabled !== false,
    postHeading: typeof base.postHeading === "string" ? base.postHeading : "HEADING",
    postHeadingColor:
      base.postHeadingColor && typeof base.postHeadingColor === "object"
        ? base.postHeadingColor
        : { type: "mainColor", index: 0 },
    postHeadingColorOpacity: Math.max(
      0,
      Math.min(255, Number(base.postHeadingColorOpacity) || 255)
    ),
    postHeadingBold: Boolean(base.postHeadingBold),
    postHeadingFontSize: Math.max(
      12,
      Math.min(96, Number(base.postHeadingFontSize) || 20)
    ),
    postHeadingGap: Math.max(
      10,
      Math.min(30, resolvePostGap())
    ),
    postHeadingDisplay: base.postHeadingDisplay === "horizontal" ? "horizontal" : "vertical",
    postDividerEnabled: Boolean(base.postDividerEnabled),
    postDividerStyle:
      base.postDividerStyle === "solid" ||
      base.postDividerStyle === "dashed" ||
      base.postDividerStyle === "dotted"
        ? base.postDividerStyle
        : "dotted",
    postDividerWidth: Math.max(
      1,
      Math.min(10, Number(base.postDividerWidth) || 1)
    ),
    postDividerColor:
      typeof base.postDividerColor === "string" ||
      (base.postDividerColor && typeof base.postDividerColor === "object")
        ? base.postDividerColor
        : "#d8d8d8",
    postDividerColorOpacity: Math.max(
      0,
      Math.min(255, Number(base.postDividerColorOpacity) || 255)
    ),
    postAlign:
      base.postAlign === "start" || base.postAlign === "center" || base.postAlign === "end"
        ? base.postAlign
        : "center",
    postMarginTop: Math.max(
      0,
      Math.min(80, resolvePostMarginTop())
    ),
    postMarginBottom: Math.max(
      0,
      Math.min(80, resolvePostMarginBottom())
    ),
    postElements: Array.isArray(base.postElements) ? base.postElements : [],
  };
};

const PostElementOffcanvas = ({
  element,
  onUpdate,
  close,
  textColor = "#0d9488",
  theme,
}) => {
  const [draft, setDraft] = useState(() => mergePostElement(element));

  useEffect(() => {
    setDraft(mergePostElement(element));
  }, [element]);

  const commit = useCallback(
    (next) => {
      const cleaned = mergePostElement(next);
      onUpdate?.(lodash.cloneDeep(cleaned));
    },
    [onUpdate]
  );

  const patch = (partial) => {
    const next = mergePostElement({ ...draft, ...partial });
    setDraft(next);
    commit(next);
  };

  const allColors = useMemo(() => {
    if (!theme?.mainColor?.length) return [];
    const mc = theme.mainColor.map((_, i) => ({ type: "mainColor", index: i }));
    const tc = (theme.textColor || []).map((_, i) => ({ type: "textColor", index: i }));
    const oc = (theme.otherColor || []).map((_, i) => ({ type: "otherColor", index: i }));
    const basic = THEME_PANEL_BASIC_COLOR_SWATCHES;
    return [...mc, ...tc, ...oc, ...basic];
  }, [theme]);

  const chipSelected = (active, chip) => {
    if (active && typeof active === "object" && chip && typeof chip === "object") {
      return lodash.isEqual(active, chip);
    }
    if (typeof active === "string" && typeof chip === "string") {
      return active.toLowerCase() === chip.toLowerCase();
    }
    return false;
  };
  const contentOnlyMode = draft.postLayoutMode === "content_only";

  return (
    <aside className="flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden bg-white dark:bg-gray-900/80 border-r border-slate-200 dark:border-white/10">
      <div className="shrink-0 px-6 pt-5 pb-3 flex items-center justify-between bg-gray-100 dark:bg-gray-900/50">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 font-bold tracking-wide text-slate-800 dark:text-white/90">Post</span>
          <span className="inline-flex min-w-0 max-w-full items-center rounded-md border border-[#333333] bg-[#333333] px-2 py-0.5 text-[11px] font-mono font-bold leading-none text-white tabular-nums">
            <span className="truncate">{draft?.id}</span>
          </span>
        </div>
        <button
          type="button"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-white/70"
          onClick={() => close(null, null, null)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <path fillRule="evenodd" d="M15.78 4.22a.75.75 0 010 1.06L10.06 11l5.72 5.72a.75.75 0 11-1.06 1.06l-6.25-6.25a.75.75 0 010-1.06l6.25-6.25a.75.75 0 011.06 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain px-4 pb-14 scroll-pb-10 w-full">
        <ul className="mt-4 pl-1 space-y-5">
          <li>
            <div className="mb-2 mt-1 flex items-center gap-2">
              <span className="shrink-0 text-[13px] font-semibold text-slate-700 dark:text-white/80">รูปแบบ</span>
              <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
            </div>
            <ButtonGroup variant="outlined" fullWidth sx={chipRootSx}>
              {POST_LAYOUT_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  color="inherit"
                  sx={chipBtnSx(draft.postLayoutMode === opt.value, textColor)}
                  onClick={() =>
                    patch({
                      postLayoutMode: opt.value,
                      postHeadingGap: opt.value === "content_only" ? 10 : 18,
                    })
                  }
                >
                  {opt.label}
                </Button>
              ))}
            </ButtonGroup>
          </li>

          <li>
            <div className="mb-2 mt-1 flex items-center gap-2">
              <span className="shrink-0 text-[13px] font-semibold text-slate-700 dark:text-white/80">หัวข้อ</span>
              <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
              {!contentOnlyMode && (
                <PostPanelSwitch
                  checked={Boolean(draft.postHeadingEnabled)}
                  onChange={(e) => patch({ postHeadingEnabled: e.target.checked })}
                  accentColor={textColor || "#0d9488"}
                  inputProps={{ "aria-label": "เปิดปิด Heading" }}
                />
              )}
            </div>
            {draft.postHeadingEnabled && (
              <div className="flex items-stretch rounded-md border border-slate-200 dark:border-white/10 overflow-hidden">
                <Field
                  id={`post-heading-${draft?.id}`}
                  type="text"
                  placeholder="หัวข้อ"
                  value={draft.postHeading}
                  handleChange={(e) => patch({ postHeading: String(e.target.value || "") })}
                  className="h-9 min-w-0 flex-1 border-0 bg-white px-2.5 py-0 text-[12px] text-slate-800 outline-none dark:bg-slate-900/60 dark:text-white/90"
                />
                <button
                  type="button"
                  className={`h-9 w-10 shrink-0 border-l border-slate-200 text-[13px] font-bold transition dark:border-white/10 ${
                    draft.postHeadingBold
                      ? "bg-[#333333] text-white"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                  aria-label="เปิดตัวหนา"
                  onClick={() => patch({ postHeadingBold: !draft.postHeadingBold })}
                >
                  B
                </button>
              </div>
            )}
            {draft.postHeadingEnabled && allColors.length > 0 && (
              <div className="mt-2">
                <div className="px-[5px] pb-2">
                  <Range
                    min={0}
                    max={255}
                    step={1}
                    value={draft.postHeadingColorOpacity}
                    handleChange={(e) =>
                      patch({
                        postHeadingColorOpacity: Math.max(0, Math.min(255, Number(e.target.value) || 0)),
                      })
                    }
                    pos={(draft.postHeadingColorOpacity / 255) * 100}
                    color={textColor}
                  />
                </div>
                <div className="grid grid-cols-10 place-items-center gap-y-[6px] px-1 pb-1">
                  {allColors.map((color, i) => {
                    const bgColor =
                      typeof color === "string" ? color : theme?.[color.type]?.[color.index];
                    if (!bgColor) return null;
                    const selected = chipSelected(
                      draft.postHeadingColor ?? { type: "mainColor", index: 0 },
                      color
                    );
                    return (
                      <button
                        key={`post-heading-color-${i}`}
                        type="button"
                        className="flex size-[25px] items-center justify-center rounded-full border border-slate-200 dark:border-white/10"
                        style={{ backgroundColor: bgColor }}
                        aria-label={`สีหัวข้อ ${bgColor}`}
                        onClick={() => patch({ postHeadingColor: color })}
                      >
                        {selected ? (
                          <Check
                            className={swatchSelectedCheckClassName(bgColor)}
                            strokeWidth={4}
                            size={11}
                          />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </li>

          {draft.postHeadingEnabled && (
            <>
              <li>
                <div className="grid grid-cols-2 gap-3 px-0.5">
                  <Box sx={{ width: "100%" }}>
                    <div className="mb-1 mt-1 flex items-center gap-2">
                      <span className="shrink-0 text-[13px] font-semibold text-slate-700 dark:text-white/80">ระยะห่าง</span>
                      <span className="shrink-0 text-[11px] font-medium tabular-nums text-slate-500 dark:text-slate-400">
                        {draft.postHeadingGap}
                      </span>
                      <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
                    </div>
                    <Range
                      min={10}
                      max={30}
                      step={1}
                      value={draft.postHeadingGap}
                      handleChange={(e) =>
                        patch({
                          postHeadingGap: Math.max(10, Math.min(30, Number(e.target.value) || 10)),
                        })
                      }
                      pos={((draft.postHeadingGap - 10) / (30 - 10)) * 100}
                      color={textColor}
                    />
                  </Box>
                  <Box sx={{ width: "100%" }}>
                    <div className="mb-1 mt-1 flex items-center gap-2">
                      <span className="shrink-0 text-[13px] font-semibold text-slate-700 dark:text-white/80">ขนาดตัวอักษร</span>
                      <span className="shrink-0 text-[11px] font-medium tabular-nums text-slate-500 dark:text-slate-400">
                        {draft.postHeadingFontSize}
                      </span>
                      <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
                    </div>
                    <Range
                      min={12}
                      max={20}
                      step={1}
                      value={draft.postHeadingFontSize}
                      handleChange={(e) =>
                        patch({
                          postHeadingFontSize: Math.max(12, Math.min(20, Number(e.target.value) || 12)),
                        })
                      }
                      pos={((draft.postHeadingFontSize - 12) / (20 - 12)) * 100}
                      color={textColor}
                    />
                  </Box>
                </div>
              </li>

            </>
          )}

          {draft.postHeadingEnabled && (
            <>
              <li>
                <div className="mb-2 mt-1 flex items-center gap-2">
                  <span className="shrink-0 text-[13px] font-semibold text-slate-700 dark:text-white/80">เส้นคั่น</span>
                  <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
                </div>
                <ButtonGroup variant="outlined" fullWidth sx={chipRootSx}>
                  {DIVIDER_OPTIONS.map((opt) => (
                    <Button
                      key={opt.value}
                      color="inherit"
                      sx={chipBtnSx(
                        opt.value === "none"
                          ? !draft.postDividerEnabled
                          : draft.postDividerEnabled && draft.postDividerStyle === opt.value,
                        textColor
                      )}
                      onClick={() =>
                        patch({
                          postDividerEnabled: opt.value !== "none",
                          ...(opt.value !== "none" ? { postDividerStyle: opt.value } : {}),
                        })
                      }
                    >
                      {opt.label}
                    </Button>
                  ))}
                </ButtonGroup>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="shrink-0 text-[13px] font-semibold text-slate-700 dark:text-white/80">
                      ขนาดเส้นคั่น
                    </span>
                    <span className="shrink-0 text-[11px] font-medium tabular-nums text-slate-500 dark:text-slate-400">
                      {draft.postDividerWidth}
                    </span>
                    <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
                  </div>
                  <Range
                    min={1}
                    max={10}
                    step={1}
                    value={draft.postDividerWidth}
                    handleChange={(e) =>
                      patch({
                        postDividerWidth: Math.max(1, Math.min(10, Number(e.target.value) || 1)),
                      })
                    }
                    pos={((draft.postDividerWidth - 1) / (10 - 1)) * 100}
                    color={textColor}
                  />
                  <div className="mb-1 mt-1 flex items-center gap-2">
                    <span className="shrink-0 text-[13px] font-semibold text-slate-700 dark:text-white/80">
                      สีเส้นคั่น
                    </span>
                    <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
                  </div>
                  {allColors.length > 0 && (
                    <div>
                      <div className="px-[5px] pb-2">
                        <Range
                          min={0}
                          max={255}
                          step={1}
                          value={draft.postDividerColorOpacity}
                          handleChange={(e) =>
                            patch({
                              postDividerColorOpacity: Math.max(0, Math.min(255, Number(e.target.value) || 0)),
                            })
                          }
                          pos={(draft.postDividerColorOpacity / 255) * 100}
                          color={textColor}
                        />
                      </div>
                      <div className="grid grid-cols-10 place-items-center gap-y-[6px] px-1 pb-1">
                        {allColors.map((color, i) => {
                          const bgColor =
                            typeof color === "string" ? color : theme?.[color.type]?.[color.index];
                          if (!bgColor) return null;
                          const selected = chipSelected(draft.postDividerColor ?? "#d8d8d8", color);
                          return (
                            <button
                              key={`post-divider-color-${i}`}
                              type="button"
                              className="flex size-[25px] items-center justify-center rounded-full border border-slate-200 dark:border-white/10"
                              style={{ backgroundColor: bgColor }}
                              aria-label={`สีเส้นคั่น ${bgColor}`}
                              onClick={() => patch({ postDividerColor: color })}
                            >
                              {selected ? (
                                <Check
                                  className={swatchSelectedCheckClassName(bgColor)}
                                  strokeWidth={4}
                                  size={11}
                                />
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </li>

              <li>
                <div className="mb-2 mt-1 flex items-center gap-2">
                  <span className="shrink-0 text-[13px] font-semibold text-slate-700 dark:text-white/80">การจัดวาง</span>
                  <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
                </div>
                <ButtonGroup variant="outlined" fullWidth sx={chipRootSx}>
                  {ALIGN_OPTIONS.map(({ value, label, Icon }) => (
                    <Button
                      key={value}
                      color="inherit"
                      title={label}
                      sx={chipBtnSx(draft.postAlign === value, textColor)}
                      onClick={() => patch({ postAlign: value })}
                    >
                      <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                        <Icon size={14} strokeWidth={2.8} />
                      </Box>
                    </Button>
                  ))}
                </ButtonGroup>
              </li>
            </>
          )}

          <li>
            <div className="grid w-full grid-cols-2 gap-3 px-0.5">
              <Box sx={{ width: "100%" }}>
                <div className="mb-1 mt-1 flex items-center gap-2">
                  <span className="shrink-0 text-[13px] font-semibold text-slate-700 dark:text-white/80">
                    ระยะด้านบน
                  </span>
                  <span className="shrink-0 text-[11px] font-medium tabular-nums text-slate-500 dark:text-slate-400">
                    {draft.postMarginTop}
                  </span>
                  <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
                </div>
                <Range
                  min={0}
                  max={80}
                  step={1}
                  value={draft.postMarginTop}
                  handleChange={(e) =>
                    patch({
                      postMarginTop: Math.max(0, Math.min(80, Number(e.target.value) || 0)),
                    })
                  }
                  pos={((draft.postMarginTop || 0) / 80) * 100}
                  color={textColor}
                />
              </Box>
              <Box sx={{ width: "100%" }}>
                <div className="mb-1 mt-1 flex items-center gap-2">
                  <span className="shrink-0 text-[13px] font-semibold text-slate-700 dark:text-white/80">
                    ระยะด้านล่าง
                  </span>
                  <span className="shrink-0 text-[11px] font-medium tabular-nums text-slate-500 dark:text-slate-400">
                    {draft.postMarginBottom}
                  </span>
                  <div className="min-w-0 flex-1 border-b border-slate-200 dark:border-white/15" />
                </div>
                <Range
                  min={0}
                  max={80}
                  step={1}
                  value={draft.postMarginBottom}
                  handleChange={(e) =>
                    patch({
                      postMarginBottom: Math.max(0, Math.min(80, Number(e.target.value) || 0)),
                    })
                  }
                  pos={((draft.postMarginBottom || 0) / 80) * 100}
                  color={textColor}
                />
              </Box>
            </div>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default PostElementOffcanvas;
