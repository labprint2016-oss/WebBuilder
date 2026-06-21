import {ChevronLeft,ChevronRight} from "lucide-react"

const SelectLine = ({prev,next,value})=>{

    return(     
      <div
      className="flex items-center justify-between gap-0.5 rounded-lg border border-slate-200 bg-white px-0.5 py-0.5 dark:border-white/10 dark:bg-slate-800/90"
    >
      <button
        type="button"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
        onClick={prev}
      >
        <ChevronLeft className="size-4" strokeWidth={2} aria-hidden />
      </button>
  
      <span className="min-w-0 flex-1 truncate text-center text-[11px] font-normal text-slate-800 dark:text-white/90">
        {value}
      </span>
  
      <button
        type="button"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
        onClick={next}
      >
        <ChevronRight className="size-4" strokeWidth={2} aria-hidden />
      </button>
    </div>)
  
  }

export default SelectLine