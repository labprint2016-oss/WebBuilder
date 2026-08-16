import { useState } from "react";
import { createPage } from "../../Functions/pages";
import { usePageDocumentStore } from "./store/pageDocument";

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
  import { Minus, Plus,Check,Palette,ImageOff,Trash2} from "lucide-react";
  import Switch from '@mui/material/Switch';
  import Stack from '@mui/material/Stack';



const COMMON_FIELD_SX = (darkMode,error) => {
    const isDark = darkMode === "dark";


  const borderColor = isDark ? "#494d54" : "#e7e7e7";
  const textColor = isDark ? "#ffffff" : "#18181b";
  const bgcolor = "none" // เหมือน SocialList
  const dangerColor = darkMode === "dark" ? "#cc0000" : "#ea9999";

  const borderColorValidate = error ? dangerColor : borderColor

  const outlineStyle = {
    borderColor:borderColorValidate,
    borderWidth: 1,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
    borderLeftWidth: 0,
  };
  
    return {
        "& .MuiOutlinedInput-root": {
          height:35,
          backgroundColor: bgcolor,
          alignItems: "center",
          padding: 0,
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
          borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
          overflow: "hidden",
    
          "& fieldset": outlineStyle,
          "&:hover fieldset": outlineStyle,
          "&.Mui-focused fieldset": outlineStyle,
          "&.Mui-error fieldset": outlineStyle,
        },
    
        "& .MuiOutlinedInput-input": {
          fontSize:13,
          color: textColor,
          padding: "0 12px",
          height: "100%",
          boxSizing: "border-box",
          backgroundColor: bgcolor,
          WebkitTextFillColor: textColor,
    
          "&:-webkit-autofill": {
            WebkitBoxShadow: `0 0 0 1000px ${bgcolor} inset`,
            WebkitTextFillColor: textColor,
            caretColor: textColor,
            borderRadius: 0,
            transition: "background-color 9999s ease-out 0s",
          },
          "&:-webkit-autofill:hover": {
            WebkitBoxShadow: `0 0 0 1000px ${bgcolor} inset`,
            WebkitTextFillColor: textColor,
          },
          "&:-webkit-autofill:focus": {
            WebkitBoxShadow: `0 0 0 1000px ${bgcolor} inset`,
            WebkitTextFillColor: textColor,
          },
        },
      };
  };

const ServicePage = ({open,onClose,darkMode,complete,onCreated=null})=>{

    const primaryColor = darkMode === "dark" ? "#3d85c6" : "#3677b2";
    const secondaryColor = darkMode === "dark" ? "#3d85c6" : "#18354f";
    const textSecondaryColor = darkMode === "dark" ? "#bebebe" : "#555555";
    const fifthColor = darkMode === "dark" ? "#494d55" : "#e0e0e0";

    const textColor = darkMode === "dark" ? "#ffffff" : "#202020";
   
    const [data,setData] = useState({pageName:""})
    const [error,setError] = useState("")
    const [validating,setValidating] = useState(false)


    const validatePageName = (pageName) => {
        const trimmedPageName = String(pageName || "").trim();
        if(trimmedPageName.length < 3){
            return "กรุณากรอกชื่อหน้าให้ถูกต้อง";
        }
        return "";
    };

    const validation = (pageName)=>{
        const nextError = validatePageName(pageName);
        setError(nextError);
        return !nextError;
    }

    const handleClose = ()=>{
        setData({...data,pageName:""})
        setValidating(false)
        setError("")
        onClose()
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
              width: 450,
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
            <div className="text-[15px] flex items-center gap-6">
              <span className="font-extrabold" style={{ color: primaryColor }}>
                เพิ่มหน้าใหม่
              </span>
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
              <div className="w-full rounded-md POPPER px-[10px] pt-[12px] pb-[14px] pt-[20px] flex gap-3">

     
                <FormControl fullWidth>
                
                <Box sx={{ display: "flex", width: "100%" }}>
                <Box
  sx={{
    display: "flex",
    fontSize: 12,
    bgcolor: fifthColor,
    color: textSecondaryColor,
    height: 35,
    width: 80,
    alignItems: "center",
    justifyContent: "center",
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
    textAlign: "center",
  }}
>
  ชื่อหน้า
</Box>
                  <TextField
                    sx={COMMON_FIELD_SX( darkMode,error)}
                    fullWidth
                    name="pageName"
                 value={data.pageName}
                 onChange={(e)=>{
                    e.preventDefault()
                    const {name,value} = e.target
                    if(validating) {
                      const nextError = validatePageName(value);
                      setError(nextError);
                    }
                    setData({...data,[name]:value})
                 }}
                    type="text"
                  />
                </Box>
              </FormControl>
</div>
             
            </Box>
    
            <div className="flex justify-between gap-2 my-[-1px] pb-5 shrink-0 px-4">
                <div className="ml-1 pt-2 text-red-500/50">
                    {error && (
                        <span style={{fontSize:12}}>{error}</span>
                    )}
                </div>
                <div className="flex gap-2">
                <Button sx={{
                    color: textSecondaryColor,
                    backgroundColor: fifthColor,
                    fontSize:12,
                    fontWeight:400,

                }} onClick={()=>{
                    handleClose()
                }}>
                    ยกเลิก
                </Button>
                <Button sx={{
                    color:"#ffffff",
                    backgroundColor: secondaryColor,
                    fontSize:12,
                    paddingX: 2,
                    fontWeight:400,

                }} onClick={()=>{
                    const trimmedPageName = String(data.pageName || "").trim();
                    setValidating(true)
                    const isValid = validation(trimmedPageName)
                    if(!isValid) return
                    createPage({pageName:trimmedPageName})
                    .then((res)=>{
                        if (res?.data) {
                          usePageDocumentStore
                            .getState()
                            .hydrateServerPage(res.data)
                        }
                        complete?.()
                        onCreated?.(res?.data || null)
                        handleClose()
                    })
                    .catch((err)=>{
                        
                        console.log(err);
                        if(err.response.data === "Page already exists"){
                            setError("มีชื่อหน้านี้แล้ว")
                        }
                    })
                }}>
                    บันทึกข้อมูล
                </Button>
                </div>

            </div>
          </Box>
        </Box>
      </Zoom>
    </Modal>
      )


}


export default ServicePage