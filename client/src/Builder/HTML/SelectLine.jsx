import { ChevronLeft, ChevronRight } from "lucide-react";

const FIELD_SURFACE =
  "dash-select-line-field box-border flex h-[35px] shrink-0 items-center justify-center rounded-md border bg-white text-slate-600";

const SelectLine = ({
  prev,
  next,
  value,
  valueRef = null,
  prevControl = "ก่อนหน้า",
  nextControl = "ถัดไป",
}) => {
  return (
    <div className="flex w-full items-center gap-1">
      <button
        type="button"
        className={`${FIELD_SURFACE} w-[35px] hover:bg-slate-50`}
        onClick={prev}
        aria-label={prevControl}
        data-perf-control={prevControl}
      >
        <ChevronLeft className="size-4" strokeWidth={2} aria-hidden />
      </button>

      <div className={`${FIELD_SURFACE} min-w-0 flex-1 px-2`}>
        <span
          ref={valueRef}
          className="dash-select-line-value min-w-0 truncate text-center text-[11px] font-normal text-slate-800"
        >
          {value}
        </span>
      </div>

      <button
        type="button"
        className={`${FIELD_SURFACE} w-[35px] hover:bg-slate-50`}
        onClick={next}
        aria-label={nextControl}
        data-perf-control={nextControl}
      >
        <ChevronRight className="size-4" strokeWidth={2} aria-hidden />
      </button>
    </div>
  );
};

export default SelectLine;
