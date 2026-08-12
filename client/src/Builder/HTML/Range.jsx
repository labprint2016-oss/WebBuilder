const Range = ({ min, max, step, value, handleChange, onCommit, pos, color }) => {
  const commit = (e, reason) => {
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
      type="range"
      min={min}
      max={max}
      value={value}
      step={step}
      onChange={handleChange}
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
        ["--pos"]: `${pos}%`,
        ["--fill"]: color || "var(--dash-panel-accent, #333333)",
        ["--track"]: "var(--dash-panel-slider-track, #e4e4e7)",
        ["--thumb"]: "var(--dash-panel-slider-thumb, #0f172a)",
        backgroundColor: "var(--track, #e4e4e7)",
      }}
    />
  );
};

export default Range;
