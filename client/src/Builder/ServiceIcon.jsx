import { useEffect, useRef, useState } from "react";
import { getTheme } from "../../Functions/theme";

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

  import { Minus, Plus,Check,Palette,ImageOff,Trash2} from "lucide-react";
  import IconAwsome from "./IconAwsome";

  import { styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import Stack from '@mui/material/Stack';






const ServiceIcon = ({header,icon:icn,open,onClose,handleChange,darkColor,darkMode})=>{
    const modalContentRef = useRef(null);
    const [icons, setIcons] = useState([]);
    const [iconsLoaded, setIconsLoaded] = useState(false);

    const iconValue =
      icn && typeof icn === "object"
        ? {
            name: icn?.name ?? null,
            type: icn?.type ?? null,
          }
        : { name: null, type: null };

    const AntSwitch = styled(Switch)(({ theme }) => ({
        width: 28,
        height: 16,
        padding: 0,
        display: 'flex',
        '&:active': {
          '& .MuiSwitch-thumb': {
            width: 15,
            
          },
          '& .MuiSwitch-switchBase.Mui-checked': {
            transform: 'translateX(9px)',
            
          },
        },
        '& .MuiSwitch-switchBase': {
          padding: 2,
          '&.Mui-checked': {
            transform: 'translateX(12px)',
            
            color: '#fff',
            '& + .MuiSwitch-track': {
              opacity: 1,
              backgroundColor: darkMode === "dark"?darkColor:"#000000",
             
            },
          },
        },
        '& .MuiSwitch-thumb': {
          boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
          width: 12,
          height: 12,
          borderRadius: 6,
          transition: theme.transitions.create(['width'], {
            duration: 200,
          }),
          
        },
        '& .MuiSwitch-track': {
          borderRadius: 16 / 2,
          opacity: 1,
          backgroundColor: 'rgba(0,0,0,.25)',
          boxSizing: 'border-box',
          ".dark &":{backgroundColor: 'rgba(255,255,255,.25)'},
          
        },
      }));


      const textColor = darkMode === "dark"?"text-white":"text-[#333]"

      useEffect(() => {
        if (!open || iconsLoaded) return;
        let alive = true;
        import("./IconList")
          .then((mod) => {
            if (!alive) return;
            const nextIcons = Array.isArray(mod?.default) ? mod.default : [];
            setIcons(nextIcons);
            setIconsLoaded(true);
          })
          .catch(() => {
            if (!alive) return;
            setIcons([]);
            setIconsLoaded(true);
          });
        return () => {
          alive = false;
        };
      }, [open, iconsLoaded]);





    return(  
      <Modal
      open={open}
      onClose={onClose}
      disableAutoFocus={false}
      aria-labelledby="basic-modal-title"
      aria-describedby="basic-modal-desc"
      slotProps={{ backdrop: { timeout: 200 } }}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      onTransitionEnter={() => {
        const el = document.activeElement;
        const root = document.getElementById("root");
        if (el instanceof HTMLElement && root?.contains(el)) {
          el.blur();
        }
      }}
    >
      <Zoom
        in={open}
        timeout={200}
        onEntered={() => {
          modalContentRef.current?.focus({ preventScroll: true });
        }}
      >
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
            ref={modalContentRef}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            sx={{
              pointerEvents: "auto",
              width: 650,
              maxWidth: "95vw",
              maxHeight: 300, // ✅ เพิ่มความสูง
              backgroundColor: darkMode === "dark" ? "#27272a" : "#ffffff",
              borderRadius: 3,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              outline: "none",
            }}
          >
            <div className="flex justify-between px-4 pt-3 pb-1 shrink-0">
              <div className="text-[15px] font-bold flex items-center gap-6">
                <span className={`${textColor}`}>{header}</span>
                <div className="flex gap-2">
                  <AntSwitch
                    checked={isNull(iconValue.name) && isNull(iconValue.type)}
                    onChange={() => {
                      if (isNull(iconValue.name) && isNull(iconValue.type)) return;
                      handleChange({ name: null, type: null });
                      // onClose();
                    }}
                  />
                  <span className={`${textColor} font-normal text-[12px]`}>
                    ไม่มีไอคอน
                  </span>
                </div>
              </div>
    
              <div>
                <a onClick={onClose} style={{ cursor: "pointer", color: textColor }}>
                  X
                </a>
              </div>
            </div>
    
            <div className="border-b border-dotted border-gray-500/50 shrink-0"></div>
    
            {/* ✅ ส่วนนี้ scroll */}
            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                px: 2,
              }}
            >
              <div className="w-full rounded-md POPPER px-[10px] pt-[12px] pb-[12px] flex flex-col gap-3">
                <div className="grid grid-cols-[repeat(15,minmax(0,1fr))] justify-items-center gap-x-[10px] gap-y-[10px]">
                  {icons.map((icon, i) => {
                    const name = icon?.name;
                    const type = icon?.type;
                    const isSame =
                      iconValue.name === name && iconValue.type === type;

    
                    const bgIcon =
                      darkMode === "dark"
                        ? isSame
                          ? darkColor
                          : "#ffffff5e"
                        : isSame
                        ? "#333"
                        : "#8080802b";
    
                    return (
                      <div className="col-span-1" key={i}>
                        <button
                          className="size-[30px] rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor: bgIcon,
                          }}
                          onClick={() => {
                            handleChange({ name, type });
                            // onClose();
                          }}
                        >
                          <IconAwsome
                            iconName={name}
                            iconType={type}
                            style={{
                              color: isSame && darkMode === "light" ? "white" : "black",
                              fontSize: 16,
                            }}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
                {!iconsLoaded && (
                  <div className={`pt-3 text-center text-[12px] ${textColor}`}>
                    กำลังโหลดไอคอน...
                  </div>
                )}
              </div>
            </Box>
    
            <div className="flex justify-center my-[-4px] pb-5 shrink-0"></div>
          </Box>
        </Box>
      </Zoom>
    </Modal>
      )


}


export default ServiceIcon