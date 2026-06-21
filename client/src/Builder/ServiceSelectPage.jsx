import { useEffect, useState,useRef } from "react";
import { listPages ,editPage,createPage,deletePage} from "../../Functions/pages";

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    Input,
    InputAdornment,
    Box,
    Slider,
    Typography,
    Select,
    MenuItem,
    ListItemText,
    OutlinedInput,
    Grow,
    Slide,
    Popper,
    TextField,
    Modal,
    
    Fade,Zoom,Collapse,Backdrop

  
  
  
  } from "@mui/material";
  import lodash, { first, isNull, set } from "lodash";

  import { Minus, Plus,Check,Palette,ImageOff,Trash2, FileText,FilePenLine,Copy,CircleX,CircleCheckBig} from "lucide-react";

  import { styled } from '@mui/material/styles';
  import Switch from '@mui/material/Switch';
  import Stack from '@mui/material/Stack';
  import { text } from "@fortawesome/fontawesome-svg-core";

const COMMON_FIELD_SX = (darkMode,error) => {
  const isDark = darkMode === "dark";

  const textColor = isDark ? "#ffffff" : "#202020";

  return {
    width: "auto",
    minWidth: 120,

    "& .MuiOutlinedInput-root": {
      height: "auto",
      backgroundColor: "transparent",
      padding: 0,
      borderRadius: 0,

      "& fieldset": {
        border: "none",
      },
      "&:hover fieldset": {
        border: "none",
      },
      "&.Mui-focused fieldset": {
        border: "none",
      },
    },

    "& .MuiOutlinedInput-input": {
      padding: 0,
      fontSize: "14px",
      lineHeight: 1.4,
      color: textColor,
      WebkitTextFillColor: textColor,
    },
  };
};


function Field ({value,id,handleChange,darkMode,error}){
  return(
    <TextField name="pageName" value={value} id={id} onChange={handleChange} sx={COMMON_FIELD_SX(darkMode,error)}/>
  )
}




const ServiceSelectPage = ({open,onClose,darkMode})=>{

    const textColor = darkMode === "dark" ? "#ffffff" : "#202020";
    const cencelColor = darkMode === "dark" ? "gray" : "gray";
    const bgColor = darkMode === "dark" ? "#494d54" : "#A1A1AA"
   


   const [pages,setPages] = useState([])
   const [editPages,setEditPages] = useState([])
   const [selectedID,setSelectedID] = useState([])


   const loadPages = ()=>{
    listPages()
    .then(res=>{setPages(res.data);setEditPages(lodash.cloneDeep(res.data))})
    .catch(err => console.log(err))
   }

   useEffect(()=>{
    loadPages()
   },[open])

   useEffect(()=>{
    console.log(pages);
   },[pages])






    const handleClose = ()=>{
      setSelectedID([])
        onClose()
    }


    const cancle = (id)=>{
      setEditPages(prev=>{
        const next = [...prev]
        const i = next.findIndex(n => n._id === id)
        next[i].pageName = lodash.cloneDeep(pages[i]).pageName
        return next
      })
      setSelectedID(prev=>{
        const next  = [...prev].filter(p => p !== id)
        return next
      })
    }

    const copy = (id)=>{
      const i = pages.findIndex(n => n._id === id)
      const clone = lodash.cloneDeep(pages[i])
      clone.pageName += ` - ${(Math.random() * 1e9).toString(16)}`
      createPage(clone)
      .then(res=>{
        loadPages()
      })
      .catch(err=>console.log(err.respose))
      
    }

    const remove = (id)=>{
     deletePage(id)
      .then(res=>{
        loadPages()
      })
      .catch(err=>console.log(err.respose))
      
    }

    const handleSubmit = (id)=>{
      const i = editPages.findIndex(p => p._id === id)
      console.log(editPages[i]);
      editPage(lodash.cloneDeep(editPages[i]),id)
      .then(res=>{
        cancle(id)
        loadPages()
      })
      .catch(err=>console.log(err))
    }



    const OptionBtns = [
      {Icon:FilePenLine,funct:(id)=>{
        setSelectedID([...selectedID,id])
      }},
      {Icon:Copy,funct:(id)=>{
        copy(id)
      }},
      {Icon:Trash2,funct:(id)=>{
        remove(id)
      }},
    ]

    const EditBtns = [
      {Icon:CircleX,funct:(id)=>{
        cancle(id)
      }},
      {Icon:CircleCheckBig,funct:(id)=>{
        handleSubmit(id)
      }},
    ]
    const handleChange = (e)=>{
      const {value,id} = e.target
      setEditPages(prev=>{
        const next = [...prev]
        const i = next.findIndex(n => n._id === id)
        next[i].pageName = value
        return next
      })
    }

    
    return(  
      <Modal
      open={open}
      onClose={()=>{
        handleClose()
      }}
      aria-labelledby="basic-modal-title"
      aria-describedby="basic-modal-desc"
      slotProps={{ backdrop: { timeout: 200 } }}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
    >
      <Zoom in={open} timeout={200}>
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 2,
            pointerEvents: "none",
            overflowY: "auto", // ✅ ให้ modal ทั้งก้อนเลื่อนได้ถ้าจอเตี้ย
          }}
        >
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{
              pointerEvents: "auto",
              width: 600,
              maxWidth: "95vw",
              maxHeight: 300, // ✅ เพิ่มความสูง
              backgroundColor: darkMode === "dark" ? "#27272a" : "#ffffff",
              borderRadius: 3,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div className="flex justify-between px-4 pt-3 pb-1 shrink-0">
              <div className="text-[15px] font-bold flex items-center gap-6">
                <span style={{color:textColor}}>เพิ่มหน้าใหม่</span>
              </div>
              <div>
                <a onClick={()=>{
                    handleClose()
                }} style={{ cursor: "pointer", color: textColor }}>
                  X
                </a>
              </div>
            </div>
    
            <div className="border-b border-dotted border-gray-500/50 shrink-0 mt-1"></div>
    
            {/* ✅ ส่วนนี้ scroll */}
            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                px: 1,
              }}
            >
              <div className="w-full rounded-md POPPER px-[10px] pt-[12px] pb-[12px]">

     
                {pages.map((page,i)=>{
                  const {_id:id,pageName} = page
                  const pageNameEdit = editPages[i].pageName

                  
                  return(
                    <div key={id} className={`border-b last:border-0 ${darkMode == "dark"?"border-b-[#a9a8a81c]":""} flex  justify-between  py-2`} style={{color:textColor}}>
         
                        <div className="flex items-center gap-2">
                        < FileText size={14} style={{opacity:0.6}}/>
                        {selectedID.includes(id) ? (
                          <Field value={pageNameEdit} id={id} handleChange={handleChange} error="" darkMode={darkMode}/>
                        ):( <span className="text-[14px]" >{pageName}</span> )}
                    
                        </div>

                      <div className="flex items-center gap-2">
                      {selectedID.includes(id) ? (
                          <>
                           {EditBtns.map((btn, i) => {
    const { Icon,funct } = btn;
    return (
      <div
        key={i}
        className={`flex items-center justify-center pr-2 border-r last:border-0 cursor-pointer ${
          darkMode == "dark" ? "border-r-[#a9a8a852]" : ""
        }`}
      onClick={()=>funct(id)}>
        <Icon size={14} style={{ opacity: 0.6 }} className="mx-2"/>
      </div>
    );
  })}
                          </>
                        ):( <> {OptionBtns.map((btn, i) => {
                          const { Icon,funct } = btn;
                          return (
                            <div
                              key={i}
                              className={`flex items-center justify-center pr-2 border-r last:border-0 cursor-pointer ${
                                darkMode == "dark" ? "border-r-[#a9a8a852]" : ""
                              }`}
                            onClick={()=>funct(id)}>
                              <Icon size={14} style={{ opacity: 0.6 }} className="mx-2"/>
                            </div>
                          );
                        })}</> )}
 
</div>
                  
                  
                    </div>
                  )
                })}
</div>
             
          

       
            </Box>
    
            <div className="flex justify-between gap-2 my-[-1px] pb-5 shrink-0 px-4">
             

            </div>
          </Box>
        </Box>
      </Zoom>
    </Modal>
      )


}


export default ServiceSelectPage