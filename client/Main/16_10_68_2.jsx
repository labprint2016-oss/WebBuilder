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
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  pointerWithin,
  DragOverlay,
  MeasuringStrategy,
  closestCorners
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  verticalListSortingStrategy,
  defaultAnimateLayoutChanges,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";





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








    const [layouts,setLayout] = useState([])
    const [element,setElement] = useState(null);
    const [darkMode,setDarkMode] = useState(getMode().mode);
    const [pageName,setPageName] = useState(null)
    const [offcanvas,setOffcanvas] = useState(null);
    const [elementData,setElementData] = useState(null)
    const [darkTextColor,setDarkTextColor] = useState(getMode().color)
    const [dragItem,setDragItem] = useState(null)
    const [dropTarget,setDropTarget] = useState(null)
    const elementFunction = useRef(null)
    const [token,setToken] = useState(0)
    const pointerRef = useRef({x:0,y:0})
    const ghostRef = useRef(null)


    const setGhost = (el)=>{
      ghostRef.current = el
    }


    const updateLayout = (newLayouts)=>{
      setLayout(prev=>{
        return newLayouts
      })
    }



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


   const sensors = useSensors(
    useSensor(PointerSensor,{activationConstraint:{distance:10}})
   )

   const handleDragStart = ({active})=>{
      const data = active.data.current
      if(data.isSidebarElement){
        const {elementType,icon} = data
        setDragItem({label:elementType,icon})
        createElement(elementType)
        .then(res=>setElement(res.data))
        .catch(err=>console.log(err))
      }
   }


   const findSection = (x,y)=>{
    const sections =  document.querySelectorAll("[data-drop='SECTION']")
    for(let section of sections){
      const rect =  section.getBoundingClientRect()
      const {top,bottom,right,left} = rect
      if(y > top && y < bottom && x > left && x < right){
        return section
      }
    }

    return null
   }

   const findColumn = (section,x,y)=>{
    if(!section) return
    const columns =  section?.querySelectorAll("[data-drop='COLUMN']")
    for(let column of columns){
       const rect =  column.getBoundingClientRect()
       const {top,bottom,right,left} = rect
       if(y > top && y < bottom && x > left && x < right){
         return column
       }
    }

    return null
   }


   const handleDragOver = (e)=>{
      const { active} = e
      const {x,y} = pointerRef.current
      if(ghostRef.current){
        const rectG = ghostRef.current.getBoundingClientRect()
        const {top,bottom,left,right} = rectG
        if(x>left&&x<right&&y>top&&y<bottom) return
      }
      if(active.data.current.elementType === "Column"){
        const containerLength = layouts.length
        if(containerLength === 0){

          setDropTarget({index:0,type:"SECTION",isLast:false})
          return
        }else{
          
          
          let nearestSection = findSection(x,y)
          if(!nearestSection){
            setDropTarget({index:layouts.length,type:"SECTION",isLast:true})
            return
          }
          const id = nearestSection.getAttribute("id")
          let index = layouts.findIndex(l => l.container.id === id)
          const rect = nearestSection.getBoundingClientRect()
          const {top,height} = rect
          const mid = top + (height/2)
          index += y > mid?1:0
          setDropTarget({index,type:"SECTION",isLast:index === layouts.length})
          
        }
      }else{
        const {x,y} = pointerRef.current
        let nearestSection = findSection(x,y)
        const nearestColumn = findColumn(nearestSection,x,y)
        if(!nearestColumn){
          setDropTarget(null)
          return
        }
        const [conID,colID] = nearestColumn.getAttribute("id").split("/")
        const IDX = layouts.findIndex(l => l.container.id === conID)
        if(IDX === -1) return
        const idx = layouts[IDX].columns.findIndex(c => c.id === colID)
        if(idx === -1) return
        if(layouts[IDX].columns[idx].elements.length === 0){
          setDropTarget({index:{conI:IDX,colI:idx,eleI:0},type:"ELEMENT",isLast:false})
          return
        }
        
      }

   }


   const handleDrop = ()=>{
    setToken(prev=>prev+1)
   }



   useEffect(()=>{
    const onMove= (e)=>{
      pointerRef.current = {x:e.clientX,y:e.clientY}
    }
    window.addEventListener("pointermove",onMove,{passive:true})
    return () => window.removeEventListener('pointermove', onMove);
   },[])










    return(
        <div className={`${darkMode === "dark" ?"dark":""} h-screen w-full `}>

        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={()=>handleDrop()}>
        <div className="flex h-full w-full bg-slate-50 dark:bg-gray-950   " style={{color:darkTextColor}}>

<Navbar handleDragElement={handleDragElement} isDark={darkMode}/>

<div className="flex-1 flex flex-col min-w-0">
<Header toggleDarkMode={toggleDarkMode} isDark={darkMode} pageName={pageName}/>
<Content handleDropElement={handleDropElement} getPageName={getPageName} openOffcavanas={openOffcavanas} offcanvasID={elementData?.id} layouts={layouts} setLayout={updateLayout} dropTarget={dropTarget} token={token} setGhost={setGhost}/>
</div>
{offcanvas === "Container" && (
<ContainerOffcanvas element={elementData} updateContainer={elementFunction.current} close={openOffcavanas} textColor={darkTextColor}/>
)}
{offcanvas === "Column" && (
<ColumnOffcanvas element={elementData} updateColumn={elementFunction.current} close={openOffcavanas} textColor={darkTextColor}/>
)}



</div>
<DragOverlay>
  {dragItem && (
    <div
      className="pointer-events-none select-none"
      tabIndex={-1}
      onMouseDown={(ev) => ev.preventDefault()}
    >
      <div className="
        bg-gray-50 dark:bg-white/5 rounded-md text-center px-3 py-2
        outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0
      ">
        <span className="material-icons-outlined text-[30px] px-2 dark:text-white/50">
          {dragItem.icon}
        </span>
        <p className="text-[12px] dark:text-white/40 antialiased">
          {dragItem.label}
        </p>
      </div>
    </div>
  )}
</DragOverlay>
        </DndContext>
            
        </div>
    )
}


export default Builder;