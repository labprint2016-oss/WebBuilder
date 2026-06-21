import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import {
  Home,
  SwatchBook,
  FileText,
  Bell,
  Users,
  Settings,
  Gift,
  BarChart3,
  Layers,
  Database,
  Grid3X3,
  MapPin,
  ChevronRight,
  Menu,
  LogOut,
  Plus,
  Download,
  SlidersHorizontal,
  RefreshCw,
  Sun,
  Moon,
  Container,
} from "lucide-react";
import TextField from "@mui/material/TextField";
import {
  Card,
  CardContent,
  Typography,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  ButtonGroup,
} from "@mui/material";
import {
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/16/solid";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {createElement} from "../../Functions/pages";
import Navbar from "./navbar"
import Content from "./content"
import Header from "./header"
import ContainerOffcanvas from "./Offcanvas/container"
import ColumnOffcanvas from "./Offcanvas/column"
import { DndContext } from "@dnd-kit/core";





const Builder = ()=>{


  


  const getMode = ()=>{
    let mode
    let color
    if(typeof window === "undefined"){
      mode = "light"
      color = "#374151"
      
    }
    const savedMode = localStorage.getItem("darkMode")
    const savedColor = localStorage.getItem("darkTextColor")
    if(savedMode === "dark"|| savedMode === "light" || savedColor === "#4fc4b4" || savedColor === "#374151"){
      mode = savedMode
      color = savedColor
      
    }else{
      const osMode = window.matchMedia("(prefers-color-scheme: dark)").matches
    if(osMode){
      mode = "dark"
      color = "#4fc4b4"
    }else{
      mode = "light"
      color = "#374151"
    }
    }
    





    return {mode,color}

  }









    const [element,setElement] = useState(null);
    const [darkMode,setDarkMode] = useState(getMode().mode);
    const [pageName,setPageName] = useState(null)
    const [offcanvas,setOffcanvas] = useState(null);
    const [elementData,setElementData] = useState(null)
    const [darkTextColor,setDarkTextColor] = useState(getMode().color)
    const elementFunction = useRef(null)


    const openOffcavanas = (type,data,funct)=>{
      setOffcanvas(type)
      setElementData(data)
      elementFunction.current = funct;
    }










    const handleDragElement = (newElement)=>{
      createElement(newElement)
      .then(res=>{
        setElement(res.data);
      })
      .catch(err=>{
        console.log(err);
      })
    }

    
   const handleDropElement = ()=>{
     return element;
   }

   const toggleDarkMode = ()=>{
    let mode
    let color 
    if(darkMode === "dark"){
      mode = "light"
      color = "#374151"
    }else{
      mode = "dark"
      color = "#4fc4b4"
      
      
    }

    localStorage.setItem("darkMode",mode);
    localStorage.setItem("darkTextColor",color)
    setDarkMode(mode)
    setDarkTextColor(color)
    
   }


   const getPageName = (pageName)=>{
    setPageName(pageName);
   }



    return(
        <div className={`${darkMode === "dark" ?"dark":""} h-screen w-full `}>

        
             <div className="flex h-full w-full bg-slate-50 dark:bg-gray-950   " style={{color:darkTextColor}}>

                <Navbar handleDragElement={handleDragElement} isDark={darkMode}/>

             <div className="flex-1 flex flex-col min-w-0">
                <Header toggleDarkMode={toggleDarkMode} isDark={darkMode} pageName={pageName}/>
                <Content handleDropElement={handleDropElement} getPageName={getPageName} openOffcavanas={openOffcavanas} offcanvasID={elementData?.id}/>
             </div>
             {offcanvas === "Container" && (
              <ContainerOffcanvas element={elementData} updateContainer={elementFunction.current} close={openOffcavanas} textColor={darkTextColor}/>
             )}
              {offcanvas === "Column" && (
              <ColumnOffcanvas element={elementData} updateColumn={elementFunction.current} close={openOffcavanas} textColor={darkTextColor}/>
             )}
             


             </div>
        </div>
    )
}


export default Builder;