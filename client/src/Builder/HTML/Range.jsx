const Range = ({ min, max, step, value, handleChange, onCommit, pos, color }) => {
  const THEME_RANGE_INPUT_CLASS = `
  w-full cursor-pointer appearance-none h-2 rounded-full
  bg-zinc-200
  dark:bg-zinc-700

  theme-range-fill-track

  [&::-webkit-slider-runnable-track]:border-0
  [&::-moz-range-track]:border-0

  [&::-webkit-slider-thumb]:cursor-pointer
  [&::-webkit-slider-thumb]:appearance-none
  [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
  [&::-webkit-slider-thumb]:rounded-full
  [&::-webkit-slider-thumb]:bg-emerald-300
  dark:[&::-webkit-slider-thumb]:bg-emerald-300
  [&::-webkit-slider-thumb]:bg-slate-900
  [&::-webkit-slider-thumb]:border-0

  [&::-moz-range-thumb]:cursor-pointer
  [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4
  [&::-moz-range-thumb]:rounded-full
  [&::-moz-range-thumb]:bg-emerald-300
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
      onPointerUp={
        onCommit
          ? (e) => {
              const n = Number(e.target.value);
              onCommit(Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : value);
            }
          : undefined
      }
      className={THEME_RANGE_INPUT_CLASS}
      style={{
        ["--pos"]: `${pos}%`,
        ["--fill"]: color || "#0d9488",
      }}
    />
  );
};

export default Range;
