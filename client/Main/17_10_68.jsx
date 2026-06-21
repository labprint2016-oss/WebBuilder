import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import {createElement} from "../../Functions/pages";
import Navbar from "./navbar"
import Content from "./content"
import Header from "./header"
import ContainerOffcanvas from "./Offcanvas/container"
import ColumnOffcanvas from "./Offcanvas/column"
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
    const draggingRef = useRef(null)

    const loadPage = () => {
      getPage("68d2af32dd121faca15fdb57").then((res) => {
        setPage(res.data);
        getPageName(res.data.pageName);
      });
    }

    useEffect(()=>{
      loadPage()
    },[])


    
    








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
        const rect  = section.getBoundingClientRect()
        const {top,bottom,left,right} = rect
        if(x > left && x < right && y > top && y < bottom){
            return section
        }
      }
      return null
    }


    const findColumn = (section,x,y)=>{
      const columns = section.querySelectorAll("[data-drop='COLUMN']")
      for(let column of columns){
        const rect = column.getBoundingClientRect()
        const {top,bottom,left,right} = rect
        if(x > left && x < right && y > top && y < bottom){
            return column
        }
      }
      return null
    }

    const findElement = (column,x,y)=>{
      const elements = column.querySelectorAll("[data-drop='ELEMENT']")
      for(let element of elements){
        const rect = element.getBoundingClientRect()
        const {top,bottom,left,right} = rect
        if(x > left && x < right && y > top && y < bottom){
            return element
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



  
    const handleDuringElement = (e)=>{

      e.preventDefault()
      

      if(draggingRef.current) return
      draggingRef.current = requestAnimationFrame(()=>{
        draggingRef.current = null
        const {x,y} = pointerRef.current
        const dragged = draggingElement()
        if(!dragged) return
        const newElement = lodash.cloneDeep(dragged)
        if(newElement?.container){
  
          if(layouts.length === 0){
            setDropTarget({index:0,type:"SECTION",isLast:false})
            return
          }
          if(ghostRef.current){
            const r = ghostRef.current.getBoundingClientRect()
            const {top,bottom,left,right} = r
            
            if(x > left && x < right && y > top && y < bottom){
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
          
        }else{
          const section = findSection(x,y)
          if(!section){
            setDropTarget(null)
            return
          }
          const column = findColumn(section,x,y)
          if(!column){
            setDropTarget(null)
            return
          }
          const IDX = layouts.findIndex(l => l.container.id === section.id)
          if(IDX === -1) return
          const [_,colID] =  column.id.split("/")
          const innerColumn = column.querySelector(`[id="${colID}"]`)
          const {top:t,bottom:b,right:r,left:l} = innerColumn.getBoundingClientRect()
          if( x < l || x> r || y < t || y > b){
            setDropTarget(null)
            return
          }
          const idx = layouts[IDX].columns.findIndex(c => c.id === colID)
          if(idx === -1) return
          if(layouts[IDX].columns[idx].elements.length === 0){
            setDropTarget({index:{conI:IDX,colI:idx,eleI:0},type:"ELEMENT",isLast:false})
            return
          }
          if(ghostRef.current){
            const r = ghostRef.current.getBoundingClientRect()
            const {top,bottom,left,right} = r
            if(x > left && x < right && y > top && y < bottom){
              return 
            }
          }
          const element = findElement(column,x,y)
          if(!element){
            setDropTarget({ index:{ conI:IDX, colI:idx,eleI:layouts[IDX].columns[idx].elements.length }, type:"ELEMENT", isLast:true })
            return
          }
          const [_1,_2,eleID] = element.id.split("/")
          if(!eleID) return
          let index = layouts[IDX].columns[idx].elements.findIndex(e => e.id === eleID)
          if(index === -1) return
          const rect = element.getBoundingClientRect()
          const {top,height} = rect
          const mid = top + (height/2)
          index += y > mid?1:0
          setDropTarget({index:{conI:IDX,colI:idx,eleI:index},type:"ELEMENT",isLast:index === layouts[IDX].columns[idx].elements.length})
  
  
          
          
        }
      })
     
      
      
    }


    const handleDropElement = (e)=>{
      e.preventDefault()

      const  newLayouts = lodash.cloneDeep(layouts)
      if(!element) return
      if(element.container){
        if(!dropTarget || dropTarget.type !== "SECTION" || typeof dropTarget.index !== "number"){
          return
        }
        element.container.id += page.latestID
        for(let i = 0; i< 3;i++){
          element.columns[i].id += `${page.latestID}-${i}`
        }
        newLayouts.splice(dropTarget?.index,0,element)
      updateLayout(newLayouts)
      setPage(prev=>{
        return {...prev,latestID:prev.latestID+1}
      })
      setElement(null); setDropTarget(null); setGhostRef(null); console.log('success')
      }else{
        if(!dropTarget || dropTarget.type !== "ELEMENT" || !dropTarget.index){
          return
        }
      if(layouts.length === 0)return
       const {conI,colI,eleI} = dropTarget?.index
       if(![conI,colI,eleI].every(n => Number.isInteger(n))) return
       element.id += Math.ceil(Math.random() * 1e9).toString(36);
       newLayouts[conI].columns[colI].elements.splice(eleI,0,element)
       updateLayout(newLayouts)
       setElement(null); setDropTarget(null); setGhostRef(null); console.log('success')
      }


  


    

      
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

        
             <div className="flex h-full w-full bg-slate-50 dark:bg-gray-950   " style={{color:darkTextColor}} onDragOver={handleDuringElement} onDrop={(e)=>{ handleDropElement(e)}}>

                <Navbar handleDragElement={handleDragElement} isDark={darkMode}/>

             <div className="flex-1 flex flex-col min-w-0">
                <Header toggleDarkMode={toggleDarkMode} isDark={darkMode} pageName={pageName}/>
                <Content page={page} setPage={setPage} draggingElement={draggingElement} getPageName={getPageName} openOffcavanas={openOffcavanas} offcanvasID={elementData?.id} layouts={layouts} setLayout={updateLayout} handleDropElement={handleDropElement} setGhostRef={setGhostRef} dropTarget={dropTarget} />
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