import React, { useState } from 'react'

import "./DropArea.css";
const DropArea = ({onDrop}) => {
    const [showDrop,setShowDrop] = useState(false)
  return (
    <section onDragEnter={()=>setShowDrop(true)}  onDragOver={(e)=>{
        e.preventDefault()
    }} onDragLeave={()=>setShowDrop(false)} onDrop={()=>{
        onDrop();
        setShowDrop(false);
    }} className={`${showDrop?"drop_area":"hide_drop"}`}>Drap Here</section>
  )
}


export default DropArea;