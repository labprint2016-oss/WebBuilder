const Field = ({value,handleChange,placeholder,id,type,className})=>{
    return(                  <input
      id={id}
      type={type}
      className={className}
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      autoComplete="off"
    />)
  }

export default Field