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
import lodash, { isNull} from "lodash";
import { getPage } from "../../Functions/pages";





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








    const [layouts,setLayouts] = useState([])
    const [page,setPage] = useState(null)
    const [element,setElement] = useState(null);
    const [darkMode,setDarkMode] = useState(getMode().mode);
    const [pageName,setPageName] = useState(null)
    const [offcanvas,setOffcanvas] = useState(null);
    const [elementData,setElementData] = useState(null)
    const [darkTextColor,setDarkTextColor] = useState(getMode().color)
    const elementFunction = useRef(null)
    const [dropTarget,setDropTarget] = useState(null)
    const pointerRef = useRef({x:0,y:0})
    const ghostRef = useRef(null)
    const token = useRef(0)

    const loadPage = () => {
      getPage("68d2af32dd121faca15fdb57").then((res) => {
        setPage(res.data);
        getPageName(res.data.pageName);
      });
    }

    useEffect(()=>{
      loadPage()
    },[])
    


    const added = ()=>{
      token.current +=1
    }



    useEffect(()=>{
      if(!token.current) return
      const newElement = lodash.cloneDeep(draggingElement())
      if(newElement.container){
        newElement.container.id += page.latestID
        for(let i = 0 ; i < 3; i++){
          newElement.columns[i].id += `${page.latestID}-${i}`
        }
        const newLayouts = lodash.cloneDeep(layouts)
        newLayouts.splice(dropTarget.index,0,newElement)
        updateLayout(newLayouts)
      }

      setPage(prev=>{
        return {...prev,latestID:prev.latestID+1}
      })
      
      
    },[token.current])


    const setGhostRef = (el)=>{
      ghostRef.current = el || null
    }


    const openOffcavanas = (type,data,funct)=>{
      setOffcanvas(type)
      setElementData(data)
      elementFunction.current = funct;
    }


    useEffect(()=>{
      const onMove = (e)=>{
        const {clientX:x,clientY:y} = e
        pointerRef.current = {x,y}
      }
      window.addEventListener("dragover",onMove,{passive:true})
      return ()=>{
        window.removeEventListener("dragover",onMove)
      }
    },[])



    const updateLayout = (newLayouts)=>{
      setLayouts(prev=>{
        return newLayouts
      })
    }

    const findSection = (x,y)=>{
      const sections = document.querySelectorAll("[data-drop='SECTION']")
      for(let section of sections){
        const rect = section.getBoundingClientRect()
        const {top,bottom,left,right} = rect
        if(x > left && x < right && y > top && y < bottom){
            return section
        }
      }
      return null
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



  
    const handleDuringElement = ()=>{
      const {x,y} = pointerRef.current


      
     
      const newElement = lodash.cloneDeep(draggingElement())
      if(newElement?.container){

        if(layouts.length === 0){
          setDropTarget({index:0,type:"SECTION",isLast:false})
          return
        }
        if(ghostRef.current){
          const r = ghostRef.current.getBoundingClientRect()
          const {top,bottom,left,right} = r
          if(x > left && x < right && y > top && y < bottom){
            setDropTarget({...dropTarget})
            console.log("ojfhi");
            return 
          }
        }
        const section = findSection(x,y)
        if(!section){
          setDropTarget({index:layouts.length,type:"SECTION",isLast:true})
          return
        }
        const id = section?.getAttribute("id")
        const r = section.getBoundingClientRect()
        const {top,height} = r
        const mid = top + (height/2)
        let index = layouts.findIndex(l => l.container.id === id)
        index += y > mid?1:0
        setDropTarget({index,type:"SECTION",isLast:index === layouts.length})
        
      }
      
      
    }


    const handleDropElement = ()=>{

      console.log(1);
    }




    

    
   const draggingElement = ()=>{
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

        
             <div className="flex h-full w-full bg-slate-50 dark:bg-gray-950   " style={{color:darkTextColor}} onDragOver={handleDuringElement} onDrop={handleDropElement}>

                <Navbar handleDragElement={handleDragElement} isDark={darkMode}/>

             <div className="flex-1 flex flex-col min-w-0">
                <Header toggleDarkMode={toggleDarkMode} isDark={darkMode} pageName={pageName}/>
                <Content draggingElement={draggingElement()} getPageName={getPageName} openOffcavanas={openOffcavanas} offcanvasID={elementData?.id} layouts={layouts} setLayout={updateLayout} added={added} setGhostRef={setGhostRef} dropTarget={dropTarget} />
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