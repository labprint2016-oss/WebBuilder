import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Check, AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import lodash from "lodash";
import Field from "../HTML/Field";
import Range from "../HTML/Range";
import { swatchSelectedCheckClassName } from "../Layouts/Elements/swatchCheckClass";
import { THEME_PANEL_BASIC_COLOR_SWATCHES } from "../themePanelBasicColors";
import { panelGroupButtonSx } from "../panelControlSx";
import {
  getBuilderPanelOpenStartedAt,
  markBuilderPanelMounted,
  usePanelSliderPreview,
} from "../panelPreviewStore";

const postPanelPerfEnabled =
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).get("postPerf") === "1";

const Box = ({ component: Component = "div", sx: _sx, ...props }) => (
  <Component {...props} />
);

const ButtonGroup = ({
  children,
  sx: _sx,
  fullWidth: _fullWidth,
  variant: _variant,
  ...props
}) => (
  <div
    {...props}
    className={`flex h-[34px] w-full overflow-hidden rounded-md ${props.className || ""}`}
    style={{
      border: "1px solid var(--dash-panel-btn-group-border, #e2e8f0)",
      ...props.style,
    }}
  >
    {children}
  </div>
);

const Button = ({ children, sx, color: _color, ...props }) => (
  <button
    type="button"
    {...props}
    className={`inline-flex h-[34px] min-w-0 flex-1 items-center justify-center border-0 border-r px-1 text-[11px] font-normal leading-tight last:border-r-0 hover:opacity-90 ${
      props.className || ""
    }`}
    style={{
      backgroundColor: sx?.backgroundColor,
      color: sx?.color,
      borderColor: "var(--dash-panel-btn-group-border, #e2e8f0)",
      ...props.style,
    }}
  >
    {children}
  </button>
);

const PostPanelSwitch = ({
  checked,
  onChange,
  accentColor = "#0d9488",
  inputProps,
}) => (
  <label className="relative inline-flex h-4 w-7 shrink-0 cursor-pointer items-center">
    <input
      type="checkbox"
      className="peer sr-only"
      checked={Boolean(checked)}
      onChange={onChange}
      {...inputProps}
    />
    <span
      className="absolute inset-0 rounded-full bg-black/25 transition-colors dark:bg-white/25"
      style={checked ? { backgroundColor: accentColor } : undefined}
    />
    <span
      className={`relative ml-0.5 size-3 rounded-full bg-white shadow-sm transition-transform ${
        checked ? "translate-x-3" : "translate-x-0"
      }`}
    />
  </label>
);

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
  "& .MuiButtonGroup-grouped.MuiButton-outlined": { borderColor: "var(--dash-panel-btn-group-border, #e2e8f0) !important" },
  ".dark & .MuiButtonGroup-grouped.MuiButton-outlined": {
    borderColor: "var(--dash-panel-btn-group-border, #e2e8f0) !important",
  },
};

const chipBtnSx = panelGroupButtonSx;

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
      Math.min(
        255,
        Number.isFinite(Number(base.postHeadingColorOpacity))
          ? Number(base.postHeadingColorOpacity)
          : 255
      )
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
      Math.min(
        255,
        Number.isFinite(Number(base.postDividerColorOpacity))
          ? Number(base.postDividerColorOpacity)
          : 255
      )
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
  const initialRenderStartedAtRef = useRef(
    postPanelPerfEnabled ? performance.now() : 0
  );
  const layoutSyncScheduledRef = useRef(false);
  const layoutSyncGenerationRef = useRef(0);
  const pendingLayoutRef = useRef(null);
  const elementRef = useRef(element);
  elementRef.current = element;
  const [draft, setDraft] = useState(() => mergePostElement(element));
  const panelTargetId = element?.id;
  const panelOpenStartedAtRef = useRef(
    getBuilderPanelOpenStartedAt("Post", panelTargetId) ??
      window.__postPanelOpenPerf?.startedAt ??
      null
  );
  const mountBreakdownLoggedRef = useRef(false);

  useEffect(() => {
    setDraft(mergePostElement(element));
  }, [element]);

  const scheduleLayoutSync = useCallback(
    (next) => {
      const base = elementRef.current || {};
      const merged = {
        ...base,
        ...next,
        type: "post",
        id: next?.id != null ? next.id : base?.id,
      };
      const changedFields = Object.keys(next || {}).filter(
        (key) => !Object.is(base?.[key], merged?.[key])
      );
      pendingLayoutRef.current = {
        snapshot: merged,
        changedFields,
        queuedAt: postPanelPerfEnabled ? performance.now() : 0,
      };
      if (layoutSyncScheduledRef.current) return;
      layoutSyncScheduledRef.current = true;
      const generation = layoutSyncGenerationRef.current;
      queueMicrotask(() => {
        if (generation !== layoutSyncGenerationRef.current) return;
        layoutSyncScheduledRef.current = false;
        const pending = pendingLayoutRef.current;
        pendingLayoutRef.current = null;
        if (!pending?.snapshot) return;
        const updateStartedAt = postPanelPerfEnabled ? performance.now() : 0;
        onUpdate?.(pending.snapshot, {
          changedFields: pending.changedFields,
        });
        if (postPanelPerfEnabled) {
          console.info("[Post Panel Perf] update", {
            target: pending.snapshot?.id,
            fields: pending.changedFields,
            queueMs:
              Math.round((updateStartedAt - pending.queuedAt) * 100) / 100,
            updateDispatchMs:
              Math.round((performance.now() - updateStartedAt) * 100) / 100,
          });
        }
      });
    },
    [onUpdate]
  );

  const { updateSlider, commitSlider } = usePanelSliderPreview({
    type: "post",
    targetIds: [panelTargetId],
    data: draft,
    setData: setDraft,
    onCommit: (latest) => scheduleLayoutSync(latest),
  });
  const updateRangeField = (field, value) => {
    updateSlider((prev) => mergePostElement({ ...prev, [field]: value }));
  };
  const commitRangeField = (_value, reason) => {
    commitSlider(reason || "range-commit");
  };

  useLayoutEffect(() => {
    if (!mountBreakdownLoggedRef.current) {
      mountBreakdownLoggedRef.current = true;
      if (postPanelPerfEnabled) {
        const now = performance.now();
        console.info("[Post Panel Mount Breakdown]", {
          target: String(panelTargetId || ""),
          openToPanelCommitMs: panelOpenStartedAtRef.current
            ? Math.round((now - panelOpenStartedAtRef.current) * 100) / 100
            : null,
          panelRenderToCommitMs:
            Math.round((now - initialRenderStartedAtRef.current) * 100) / 100,
          nestedElementCount: Array.isArray(draft?.postElements)
            ? draft.postElements.length
            : 0,
        });
      }
    }
    markBuilderPanelMounted("Post", panelTargetId);
  }, [panelTargetId]);

  useEffect(
    () => () => {
      layoutSyncGenerationRef.current += 1;
      layoutSyncScheduledRef.current = false;
      pendingLayoutRef.current = null;
    },
    []
  );

  const patch = (partial) => {
    setDraft((prev) => {
      const next = mergePostElement({ ...prev, ...partial });
      scheduleLayoutSync(next);
      return next;
    });
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
    <aside className="dash-panel flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden border-r border-slate-200 dark:border-white/10">
      <div className="shrink-0 px-6 pt-5 pb-3 flex items-center justify-between dash-panel-header bg-gray-100 dark:bg-gray-900/50">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 font-bold tracking-wide">Post</span>
          <button
            type="button"
            className="inline-flex shrink-0 items-center rounded-md border border-[#333333] bg-[#333333] px-1.5 py-0.5 text-[11px] font-mono font-bold leading-none text-white tabular-nums dark:border-[#333333] dark:bg-[#333333] dark:text-white"
            title={String(draft?.id ?? "")}
            aria-label={`คัดลอก ID ${String(draft?.id ?? "")}`}
            onClick={() => {
              const id = String(draft?.id ?? "");
              if (!id || typeof navigator?.clipboard?.writeText !== "function") return;
              navigator.clipboard.writeText(id).catch(() => {});
            }}
          >
            {(() => {
              const id = String(draft?.id ?? "");
              const maxChars = 15;
              return id.length > maxChars ? `${id.slice(0, maxChars)}…` : id;
            })()}
          </button>
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
            <div className="mb-[13px] mt-1 flex items-center gap-2">
              <span className="dash-panel-label shrink-0 text-[13px] font-semibold">รูปแบบ</span>
              <div className="dash-heading-rule min-w-0 flex-1 border-b" />
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
            <div className="mb-[13px] mt-1 flex items-center gap-2">
              <span className="dash-panel-label shrink-0 text-[13px] font-semibold">หัวข้อ</span>
              <div className="dash-heading-rule min-w-0 flex-1 border-b" />
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
              <div className="flex dash-input h-9 w-full items-stretch overflow-hidden rounded-md border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-800/90">
                <Field
                  id={`post-heading-${draft?.id}`}
                  type="text"
                  placeholder="หัวข้อ"
                  value={draft.postHeading}
                  handleChange={(e) => patch({ postHeading: String(e.target.value || "") })}
                  className="h-9 min-w-0 flex-1 border-0 bg-transparent px-2.5 py-0 text-[12px] leading-snug text-slate-800 outline-none ring-0 placeholder:text-slate-400 focus:outline-none focus:ring-0 dark:text-white/90 dark:placeholder:text-white/40"
                />
                <button
                  type="button"
                  className={`h-9 w-10 shrink-0 border-l border-slate-200 text-[13px] font-bold transition dark:border-white/10 ${
                    draft.postHeadingBold
                      ? "bg-[#333333] text-white"
                      : "bg-transparent text-slate-600 hover:opacity-80 dark:text-slate-300"
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
                      updateRangeField(
                        "postHeadingColorOpacity",
                        Math.max(0, Math.min(255, Number(e.target.value) || 0))
                      )
                    }
                    onCommit={commitRangeField}
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
                      <span className="dash-panel-label shrink-0 text-[13px] font-semibold">ระยะห่าง</span>
                      <span className="shrink-0 text-[11px] font-medium tabular-nums text-slate-500 dark:text-slate-400">
                        {draft.postHeadingGap}
                      </span>
                      <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                    </div>
                    <Range
                      min={10}
                      max={30}
                      step={1}
                      value={draft.postHeadingGap}
                      handleChange={(e) =>
                        updateRangeField(
                          "postHeadingGap",
                          Math.max(10, Math.min(30, Number(e.target.value) || 10))
                        )
                      }
                      onCommit={commitRangeField}
                      pos={((draft.postHeadingGap - 10) / (30 - 10)) * 100}
                      color={textColor}
                    />
                  </Box>
                  <Box sx={{ width: "100%" }}>
                    <div className="mb-1 mt-1 flex items-center gap-2">
                      <span className="dash-panel-label shrink-0 text-[13px] font-semibold">ขนาดตัวอักษร</span>
                      <span className="shrink-0 text-[11px] font-medium tabular-nums text-slate-500 dark:text-slate-400">
                        {draft.postHeadingFontSize}
                      </span>
                      <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                    </div>
                    <Range
                      min={12}
                      max={20}
                      step={1}
                      value={draft.postHeadingFontSize}
                      handleChange={(e) =>
                        updateRangeField(
                          "postHeadingFontSize",
                          Math.max(12, Math.min(20, Number(e.target.value) || 12))
                        )
                      }
                      onCommit={commitRangeField}
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
                <div className="mb-[13px] mt-1 flex items-center gap-2">
                  <span className="dash-panel-label shrink-0 text-[13px] font-semibold">เส้นคั่น</span>
                  <div className="dash-heading-rule min-w-0 flex-1 border-b" />
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
                  <div className="mb-[5px] flex items-center gap-2">
                    <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                      ขนาดเส้นคั่น
                    </span>
                    <span className="shrink-0 text-[11px] font-medium tabular-nums text-slate-500 dark:text-slate-400">
                      {draft.postDividerWidth}
                    </span>
                    <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                  </div>
                  <Range
                    min={1}
                    max={10}
                    step={1}
                    value={draft.postDividerWidth}
                    handleChange={(e) =>
                      updateRangeField(
                        "postDividerWidth",
                        Math.max(1, Math.min(10, Number(e.target.value) || 1))
                      )
                    }
                    onCommit={commitRangeField}
                    pos={((draft.postDividerWidth - 1) / (10 - 1)) * 100}
                    color={textColor}
                  />
                  <div className="mb-1 mt-1 flex items-center gap-2">
                    <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                      สีเส้นคั่น
                    </span>
                    <div className="dash-heading-rule min-w-0 flex-1 border-b" />
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
                            updateRangeField(
                              "postDividerColorOpacity",
                              Math.max(0, Math.min(255, Number(e.target.value) || 0))
                            )
                          }
                          onCommit={commitRangeField}
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
                <div className="mb-[13px] mt-1 flex items-center gap-2">
                  <span className="dash-panel-label shrink-0 text-[13px] font-semibold">การจัดวาง</span>
                  <div className="dash-heading-rule min-w-0 flex-1 border-b" />
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
                <div className="mb-[9px] mt-1 flex items-center gap-2">
                  <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                    ระยะด้านบน
                  </span>
                  <span className="shrink-0 text-[11px] font-medium tabular-nums text-slate-500 dark:text-slate-400">
                    {draft.postMarginTop}
                  </span>
                  <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                </div>
                <Range
                  min={0}
                  max={80}
                  step={1}
                  value={draft.postMarginTop}
                  handleChange={(e) =>
                    updateRangeField(
                      "postMarginTop",
                      Math.max(0, Math.min(80, Number(e.target.value) || 0))
                    )
                  }
                  onCommit={commitRangeField}
                  pos={((draft.postMarginTop || 0) / 80) * 100}
                  color={textColor}
                />
              </Box>
              <Box sx={{ width: "100%" }}>
                <div className="mb-[9px] mt-1 flex items-center gap-2">
                  <span className="dash-panel-label shrink-0 text-[13px] font-semibold">
                    ระยะด้านล่าง
                  </span>
                  <span className="shrink-0 text-[11px] font-medium tabular-nums text-slate-500 dark:text-slate-400">
                    {draft.postMarginBottom}
                  </span>
                  <div className="dash-heading-rule min-w-0 flex-1 border-b" />
                </div>
                <Range
                  min={0}
                  max={80}
                  step={1}
                  value={draft.postMarginBottom}
                  handleChange={(e) =>
                    updateRangeField(
                      "postMarginBottom",
                      Math.max(0, Math.min(80, Number(e.target.value) || 0))
                    )
                  }
                  onCommit={commitRangeField}
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
