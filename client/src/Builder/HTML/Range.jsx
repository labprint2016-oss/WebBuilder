import { useLayoutEffect, useRef } from "react";

export function applyRangeFillPos(el, min, max) {
  if (!el) return;
  const next = Number(el.value);
  if (!Number.isFinite(next) || Number(max) === Number(min)) return;
  const nextPos = ((next - Number(min)) / (Number(max) - Number(min))) * 100;
  el.style.setProperty(
    "--pos",
    `${Math.max(0, Math.min(100, nextPos))}%`
  );
}

export function applyRangeValue(el, value, min, max) {
  if (!el) return;
  if (Number.isFinite(Number(min))) el.min = String(min);
  if (Number.isFinite(Number(max))) el.max = String(max);
  if (Number.isFinite(Number(value))) el.value = String(value);
  applyRangeFillPos(el, min, max);
}

const Range = ({
  min,
  max,
  step,
  value,
  handleChange,
  onCommit,
  pos,
  color,
  name,
  controlLabel,
  uncontrolled = false,
  inputRef = null,
  liveValueLabel = false,
}) => {
  const localRef = useRef(null);
  const draggingRef = useRef(false);
  const lastValueRef = useRef(value);
  const assignRef = (node) => {
    localRef.current = node;
    if (typeof inputRef === "function") inputRef(node);
    else if (inputRef) inputRef.current = node;
  };

  useLayoutEffect(() => {
    const el = localRef.current;
    if (!el) return;
    const valueChanged = lastValueRef.current !== value;
    lastValueRef.current = value;
    if (
      uncontrolled &&
      valueChanged &&
      !draggingRef.current &&
      Number.isFinite(Number(value))
    ) {
      el.value = String(value);
    }
  }, [uncontrolled, value]);

  useLayoutEffect(() => {
    applyRangeFillPos(localRef.current, min, max);
  }, [min, max, value]);

  const updateLiveValueLabel = (input, nextValue) => {
    if (!liveValueLabel || !input || !Number.isFinite(nextValue)) return;
    let scope = input.parentElement;
    for (let depth = 0; scope && depth < 4; depth += 1, scope = scope.parentElement) {
      const labels = [...scope.querySelectorAll(".tabular-nums")].filter(
        (label) =>
          label !== input &&
          Boolean(
            label.compareDocumentPosition(input) &
              Node.DOCUMENT_POSITION_FOLLOWING
          )
      );
      const label = labels.at(-1);
      if (!label) continue;
      const previousText = String(label.textContent || "").trim();
      const decimals =
        Number(step) > 0 && Number(step) < 1
          ? Math.max(0, String(step).split(".")[1]?.length || 0)
          : 0;
      const formatted = decimals > 0 ? nextValue.toFixed(decimals) : String(Math.round(nextValue));
      label.textContent = previousText.endsWith("ms")
        ? `${formatted} ms`
        : previousText.endsWith("%")
          ? `${formatted}%`
          : formatted;
      return;
    }
  };

  const change = (e) => {
    draggingRef.current = true;
    applyRangeFillPos(e.currentTarget, min, max);
    updateLiveValueLabel(e.currentTarget, Number(e.currentTarget.value));
    handleChange?.(e);
  };
  const commit = (e, reason) => {
    draggingRef.current = false;
    if (!onCommit) return;
    const n = Number(e.currentTarget.value);
    onCommit(
      Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : value,
      reason
    );
  };
  const THEME_RANGE_INPUT_CLASS = `
  w-full cursor-pointer appearance-none h-2 rounded-full

  theme-range-fill-track

  [&::-webkit-slider-runnable-track]:border-0
  [&::-moz-range-track]:border-0

  [&::-webkit-slider-thumb]:cursor-pointer
  [&::-webkit-slider-thumb]:appearance-none
  [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
  [&::-webkit-slider-thumb]:rounded-full
  [&::-webkit-slider-thumb]:border-0

  [&::-moz-range-thumb]:cursor-pointer
  [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4
  [&::-moz-range-thumb]:rounded-full
  [&::-moz-range-thumb]:border-0
`;
  return (
    <input
      ref={assignRef}
      type="range"
      name={name}
      data-perf-control={controlLabel || name}
      aria-label={controlLabel || name}
      min={min}
      max={max}
      {...(uncontrolled ? { defaultValue: value } : { value })}
      step={step}
      onPointerDown={() => {
        draggingRef.current = true;
      }}
      onChange={change}
      onPointerUp={(e) => commit(e, "pointerup")}
      onPointerCancel={(e) => commit(e, "pointercancel")}
      onMouseUp={(e) => commit(e, "mouseup")}
      onTouchEnd={(e) => commit(e, "touchend")}
      onTouchCancel={(e) => commit(e, "touchcancel")}
      onKeyUp={(e) => commit(e, "keyboard")}
      onBlur={(e) => commit(e, "blur")}
      className={THEME_RANGE_INPUT_CLASS}
      style={{
        ["--fill"]: color || "var(--dash-panel-accent, #333333)",
        ["--track"]: "var(--dash-panel-slider-track, #e4e4e7)",
        ["--thumb"]: "var(--dash-panel-slider-thumb, #0f172a)",
        backgroundColor: "var(--track, #e4e4e7)",
      }}
    />
  );
};

export default Range;
