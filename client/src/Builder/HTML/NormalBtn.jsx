const NormalBtn = ({handleClick,btnClass,style,label=null,icon=null,})=>{

    const Icon = icon?.Icon
    const iconClass = icon?.className
    const strokeWidth = icon?.strokeWidth
  
    return( <button
      type="button"
      onClick={handleClick}
      className={btnClass}
      style={style}
      aria-label={
        typeof label === "string" && label.trim() !== "" ? label : undefined
      }
    >
       {icon && (
        <Icon className={iconClass} strokeWidth={strokeWidth}/>
      )}
      {label && (
        <>{label}</>
      )}
     
      
    </button>)
  }
export default NormalBtn