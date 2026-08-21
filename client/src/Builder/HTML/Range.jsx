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

const Range = ({
  min,
  max,
  step,
  value,
  handleChange,
  onCommit,
  pos,
  color,
  uncontrolled = false,
  inputRef = null,
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
  });

  const change = (e) => {
    draggingRef.current = true;
    applyRangeFillPos(e.currentTarget, min, max);
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
      min={min}
      max={max}
      {...(uncontrolled ? { defaultValue: value } : { value })}
      step={step}
      onPointerDown={() => {
        draggingRef.current = true;
      }}
      onChange={change}
      onPointerUp={onCommit ? (e) => commit(e, "pointerup") : undefined}
      onPointerCancel={
        onCommit ? (e) => commit(e, "pointercancel") : undefined
      }
      onMouseUp={onCommit ? (e) => commit(e, "mouseup") : undefined}
      onTouchEnd={onCommit ? (e) => commit(e, "touchend") : undefined}
      onTouchCancel={
        onCommit ? (e) => commit(e, "touchcancel") : undefined
      }
      onKeyUp={onCommit ? (e) => commit(e, "keyboard") : undefined}
      onBlur={onCommit ? (e) => commit(e, "blur") : undefined}
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
