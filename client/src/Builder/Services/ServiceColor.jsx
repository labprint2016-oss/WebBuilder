import { useEffect, useState,useRef } from "react";
import { getTheme } from "../../../Functions/theme";
import Range from "../HTML/Range";
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
    TextField
  
  
  
  } from "@mui/material";
  import lodash, { isNull, set } from "lodash";
  import {setColor} from "../../../function";

  import { Minus, Plus,Check,Palette,ImageOff,Trash2} from "lucide-react";
  import { swatchSelectedCheckClassName } from "../Layouts/Elements/swatchCheckClass";
  import { THEME_PANEL_BASIC_COLOR_SWATCHES } from "../themePanelBasicColors";






const ServiceColor = ({color,opacity,handleColor,handleOpacity,rangeColor,darkMode="light"})=>{
    const [theme, setTheme] = useState(null);

    const loadTheme = () => {
        getTheme("68d37327bedb0efab7dacafb")
          .then((res) => {

            setTheme(res.data);
    
          })
          .catch((err) => console.log(err));
      };
    
      useEffect(() => {
        loadTheme();
      },[]);

      const [allColors,setAllColors] = useState([])
    const basicColors = THEME_PANEL_BASIC_COLOR_SWATCHES

    useEffect(()=>{
        if(allColors.length === 0 && theme){
          theme?.mainColor.map((color,i)=>{
            setAllColors(prev=>{
              return [...prev,{type:"mainColor",index:i}]
            })
          })
          theme?.textColor.map((color,i)=>{
            setAllColors(prev=>{
              return [...prev,{type:"textColor",index:i}]
            })
          })
          theme?.otherColor.map((color,i)=>{
            setAllColors(prev=>{
              return [...prev,{type:"otherColor",index:i}]
            })
          })
          basicColors.map((color)=>{
            setAllColors(prev=>{
              return [...prev,color]
            })
          })
  
  
        }else return
        
    },[theme])





    return(   
        <div className="mt-2 w-full rounded-md bg-white px-[0px] pb-[5px] pt-[2px] dark:bg-zinc-800">
        <div className="px-[5px] pb-2">
            <Range min={0} max={255} step={1} value={opacity} pos={(opacity / 255) * 100} handleChange={handleOpacity} color={rangeColor}/>
        </div>
        <div className="grid grid-cols-10 place-items-center gap-x-0 gap-y-[6px]">
          {allColors.map((c, i) => {
             const bgColor =
            typeof c === "string"
              ? c
              : theme?.[c.type]?.[c.index];
            const value = c;
            const selected = value === color || lodash.isEqual(value,color)
            let margin = "";
            if (i % 8 !== 0 && (i + 1) % 8 !== 0) {
              margin += "mx-[65.75px] ";
            }
            return (
              <div className={`${margin}`} key={`bd-${i}`}>
                <button
                  type="button"
                  className="flex size-[25px] items-center justify-center rounded-full border"
                  style={{ backgroundColor: bgColor }}
                  onClick={()=>handleColor(c)}
                  aria-label={`เลือกสีกรอบ ${bgColor}`}
                >
                  {selected && (
                    <Check
                      className={swatchSelectedCheckClassName(bgColor)}
                      strokeWidth={4}
                    />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>)


}


export default ServiceColor