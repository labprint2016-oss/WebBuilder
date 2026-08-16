import { useEffect, useRef, useState } from "react";

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
  import { isNull } from "lodash";

  import { Minus, Plus,Check,Palette,ImageOff,Trash2} from "lucide-react";
  import IconAwsome from "./IconAwsome";
import ICON_LIST from "./IconList.jsx";

  import { styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import Stack from '@mui/material/Stack';






const ServiceIcon = ({header,icon:icn,open,onClose,handleChange,darkColor,darkMode})=>{
    const modalContentRef = useRef(null);
    const icons = ICON_LIST;
    const [searchKeyword, setSearchKeyword] = useState("");
    const lastSelectedIconRef = useRef(null);

    const iconValue =
      icn && typeof icn === "object"
        ? {
            name: icn?.name ?? null,
            type: icn?.type ?? null,
          }
        : { name: null, type: null };

    useEffect(() => {
      if (!isNull(iconValue.name) && !isNull(iconValue.type)) {
        lastSelectedIconRef.current = {
          name: iconValue.name,
          type: iconValue.type,
        };
      }
    }, [iconValue.name, iconValue.type]);

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
      const keyword = searchKeyword.trim().toLowerCase();
      const filteredIcons = icons.filter((item) => {
        if (!keyword) return true;
        const name = String(item?.name || "").toLowerCase();
        const type = String(item?.type || "").toLowerCase();
        return name.includes(keyword) || type.includes(keyword);
      });

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
              width: 760,
              maxWidth: "95vw",
              maxHeight: 380,
              backgroundColor: darkMode === "dark" ? "#27272a" : "#ffffff",
              borderRadius: 2,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              outline: "none",
            }}
          >
            <div className="flex items-center justify-between px-4 py-4 shrink-0 min-h-[64px]">
              <div className="text-[15px] font-bold flex items-center gap-6">
                <span className={`${textColor}`}>{header}</span>
                <div className="flex items-center gap-2">
                  <AntSwitch
                    checked={isNull(iconValue.name) && isNull(iconValue.type)}
                    onChange={() => {
                      const isHidden =
                        isNull(iconValue.name) && isNull(iconValue.type);

                      if (isHidden) {
                        const fallbackIcon =
                          lastSelectedIconRef.current ||
                          icons.find((item) => item?.name && item?.type) ||
                          { name: "faHouse", type: "fas" };
                        handleChange({
                          name: fallbackIcon.name,
                          type: fallbackIcon.type,
                        });
                        return;
                      }

                      handleChange({ name: null, type: null });
                    }}
                  />
                  <span className={`${textColor} font-normal text-[12px]`}>
                    ไม่แสดงไอคอน
                  </span>
                  <TextField
                    size="small"
                    placeholder="ค้นหาไอคอน..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    sx={{
                      ml: 2,
                      minWidth: 220,
                      "& .MuiOutlinedInput-root": {
                        height: 32,
                        fontSize: 12,
                        backgroundColor: darkMode === "dark" ? "#1f2937" : "#ffffff",
                        color: darkMode === "dark" ? "#ffffff" : "#111827",
                        boxShadow: "none",
                        "& fieldset": { borderColor: darkMode === "dark" ? "#4b5563" : "#d1d5db", borderWidth: 1 },
                        "&:hover fieldset": { borderColor: darkMode === "dark" ? "#4b5563" : "#d1d5db", borderWidth: 1 },
                        "&.Mui-focused fieldset": { borderColor: darkMode === "dark" ? "#4b5563" : "#d1d5db", borderWidth: 1 },
                        "&.Mui-focused": { boxShadow: "none" },
                      },
                    }}
                  />
                </div>
              </div>
    
              <div>
                <a onClick={onClose} style={{ cursor: "pointer", color: textColor }}>
                  X
                </a>
              </div>
            </div>
    
            <div
              className="border-b-[5px] border-solid shrink-0"
              style={{
                borderColor: darkMode === "dark" ? "rgba(255,255,255,0.12)" : "#e5e7eb",
              }}
            ></div>
    
            {/* ✅ ส่วนนี้ scroll */}
            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                px: 3,
              }}
            >
              <div className="w-full rounded-md POPPER px-[8px] pt-[12px] pb-[12px] flex flex-col gap-3">
                <div className="grid grid-cols-[repeat(10,minmax(56px,1fr))]">
                  {filteredIcons.map((icon, i) => {
                    const name = icon?.name;
                    const type = icon?.type;
                    const isSame =
                      iconValue.name === name && iconValue.type === type;
                    const colCount = 10;
                    const rowCount = Math.ceil(filteredIcons.length / colCount);
                    const row = Math.floor(i / colCount);
                    const col = i % colCount;
                    const isLastCol = col === colCount - 1;
                    const isLastRow = row === rowCount - 1;
                    const dividerColor =
                      darkMode === "dark" ? "rgba(255,255,255,0.12)" : "#e5e7eb";

    
                    const iconColor =
                      darkMode === "dark"
                        ? isSame
                          ? darkColor
                          : "#ffffff"
                        : isSame
                          ? "#111827"
                          : "#374151";
    
                    return (
                      <div
                        className="col-span-1 flex items-center justify-center py-[10px]"
                        key={i}
                        style={{
                          backgroundColor: isSame ? dividerColor : "transparent",
                          borderRight: isLastCol ? "none" : `1px solid ${dividerColor}`,
                          borderBottom: isLastRow ? "none" : `1px solid ${dividerColor}`,
                        }}
                      >
                        <button
                          className="size-[52px] flex items-center justify-center"
                          onClick={() => {
                            handleChange({ name, type });
                            // onClose();
                          }}
                        >
                          <IconAwsome
                            iconName={name}
                            iconType={type}
                            style={{
                              color: iconColor,
                              fontSize: 28,
                            }}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
                {filteredIcons.length === 0 && (
                  <div className={`${textColor} text-center text-[12px] py-3`}>
                    ไม่พบไอคอนที่ค้นหา
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