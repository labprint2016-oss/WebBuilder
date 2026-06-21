import React, { useEffect, useMemo, useState, useRef} from "react";
import {
  Settings,
  Plus,
  Copy,
  Trash2,
  Minus,
  Move,
  ScanEye,
 Play
} from "lucide-react";
import {
  Typography,
  Button,
  ButtonGroup,
  Modal,
  Box,
  Fade,
  Backdrop,
  Divider,
  ListItem,
  List,
  ListItemText,
  ListItemAvatar,
} from "@mui/material";
import lodash, { isNull} from "lodash";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverlay,
  MeasuringStrategy,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  verticalListSortingStrategy,
  defaultAnimateLayoutChanges,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getPage } from "../../Functions/pages";
import { getTheme } from "../../Functions/theme";

const Content = ({
  handleDropElement,
  getPageName,
  openOffcavanas,
  offcanvasID,
  layouts,
  setLayout,
  dropTarget,
  token,
  setGhost
}) => {

  // useState

    // ข้อมูลธีม/เพจ
      const [page, setPage] = useState(null); //ข้อมูลหน้า
      const [theme, setTheme] = useState(null); //ข้อมูลธีม
    // การแสดงHTML
      const [hover, setHover] = useState(null); //เก็บค่าidของ con/col เพื่อแสดง Option Button Group ของ con/col
      const [activeID, setActiveID] = useState(null); // เก็บค่าid ของ layout ที่กำลัง Drag&Drop
      const [activeItem, setActiveItem] = useState(null); // เก็บ JSON HTML ของ layout ที่กำลัง Drag&Drop
      const [modal, setModal] = useState(null); // ตัวแปรควบคุมการเปิดปิดของ Confirm Modal
      const [preview, setPreview] = useState(null); // เก็บ JSON HTML ของ layout ใหม่ที่กำลังนำมาวาง
    // Drag&Drop
      const [isDraggingLayout,setIsDraggingLayout] = useState(false) // เก็บค่าสถานะการ Drag&Drop (true = กำลังทำ / false = w,jwfhme)
    // Disable Drag&Drop
      const [disableConDrag,setDisableConDrag] = useState(true) // ตัวแปรควบคุมการ disable Drag&Drop ของ con
      const [disableColDrag,setDisableColDrag] = useState(true) // ตัวแปรควบคุมการ disable Drag&Drop ของ col
      const [disableEleDrag,setDisableEleDrag] = useState(true) // ตัวแปรควบคุมการ disable Drag&Drop ของ ele
    // ฟังก์ชันเกี่ยวกับ Layout
      const [deleteID, setDeleteID] = useState(null); // เก็บค่าid ของ ele ที่กำลังจะลบ


  // useRef

    // การแสดงHTML
      const ghostRef = useRef(null); // เก็บ Ref ของ Ghost ที่จำลองตำแหน่งการวาง Layout ใหม่ 
      const dragRef = useRef(null) // เก็บ Ref ของ Preview ของ element ที่กำลัง Drag&Drop
      // const dropTargetRef = useRef({ index: null, type: null, isLast: false }); // เก็บค่า index ประเภท และใช่ตำแหน่งสุดใหม่ไหม ของ Ghost เพื่อใช้เป็นindexสำหรับการวาง Layout ใหม่
    // การควบคุม Hover เพื่อใช้งานฟังก์ชัน
      const hoverRef = useRef(null); // สำหรับควบคุมฟังก์ชัน updateHoverFromPoint(การวาง Layout ใหม่)
      const dndRef = useRef(null) // สำหรับควบคุมฟังก์ชัน updateDND(การ disable Drag&Drop)
      const btnGroupRef = useRef(null);// สำหรับควบคุมฟังก์ชัน updateHoverPosition(การแสดง Option Button Group)
    // การเก็บค่า
      const positionRef = useRef(null)// เก็บตำแหน่งเดิมของ container เมื่อ Drag&Drop ele
      const dragToken = useRef(0);// เก็บtoke เพื่อสั่งหยุด hoverRef
    // การเก็บ Ref ของ Layout
      const contained = useRef([]) // Ref ของ container
      const columned = useRef([]) // Ref ของ column


  // useEffect

    // ดึงข้อมูลธีม/เพจ 
      useEffect(() => {
        loadPage();
      }, []);// ดึงข้อมูลหน้า
      useEffect(() => {
        loadTheme();
      }, []);// ดึงข้อมูลธีม
    useEffect(() => {
        const handleDeleteElement = (e) => {
          const { key } = e;
          if (key === "Delete" || key === "Backspace") {
            if (!deleteID) return;
            deleteElement(deleteID);
          }
        };
        window.addEventListener("keydown", handleDeleteElement);
        return () => {
          window.removeEventListener("keydown", handleDeleteElement);
        };
    }, [deleteID]);// ควบคุมการลบ ele
    useEffect(() => {
      if (!preview) return;
      const cancle = () => {
        setTimeout(()=>clearGhost(),0)
      }
    
  
      window.addEventListener("dragend", cancle, false);
  
      return () => {
        window.removeEventListener("dragend", cancle, false);
      };
    }, [preview]); // ยกเลิก Ghost จำลองตำแหน่ง layout ใหม่เมื่อไม่มีการวางเกิดขึ้น


  // Function JSX
    
    // การโหลดข้อมูล
    const loadPage = () => {
      getPage("68d2af32dd121faca15fdb57").then((res) => {
        setPage(res.data);
        getPageName(res.data.pageName);
      });
    };// โหลดข้อมูลหน้า
    const loadTheme = () => {
      getTheme("68d37327bedb0efab7dacafb")
        .then((res) => {
          setTheme(res.data);
        })
        .catch((err) => console.log(err));
    };// โหลดข้อมูลธีม

    // การเพิ่ม Layout ใหม่

    // ควบคุม Ref สำหรับควบคุมฟังก์ชัน

    // ควบคุม Container

    // Container HTML

    // ควบคุม Column

     // Column HTML

     // ควบคุม Element

     // Element HTML

     // การใช้งานข้อมูลในบางกรณี
        const opacity_2_hex = (opcy) => {
          const hex = opcy.toString(16).toUpperCase().padStart(2, 0);
          return hex;
        };// แปลงค่า Opacity ให้เป็น Hex
        const setFont = (font)=>{

          let isFirst = false
          const cutFont_ = font.replace("font-","")
          let newFont = ""
          for(let i = 0; i < cutFont_.length ; i++){
            if(cutFont_[i] === "-" && !isFirst){
              newFont += " "
              isFirst = true
            }
            else if(cutFont_[i] === "-" && isFirst){
              newFont += ""
            }
            else if((cutFont_[i] !== "-" && isFirst) || i === 0 ){
              newFont += cutFont_[i].toUpperCase()
              isFirst = false
            }else{
              newFont += cutFont_[i]
            }
          }
          return newFont
         
        }// แปลง Font Tailwind ให้เป็น Font CSS

   
  

  const updateHoverPosition = (x, y) => {
    const el = document.elementFromPoint(x, y);
    const column = el?.closest(`[data-drop="COLUMN"]`);
    const section = el?.closest(`[data-drop="SECTION"]`);
    const element = el?.closest(`[data-drop="ELEMENT"]`);
    if(!section && !column && !element){
      setHover(null);
      return
    }
    

    if (section && ( column || element)) {
      if(column){
        let [_, id] = column.getAttribute("id").split("/");
        if(!id){
          id = column.getAttribute("id")
          setHover(id);
        }else{
          setHover(_);
        }
        return "col";
      }
     else{
      const id =section.getAttribute("id")
      setHover(id)
      return "sec";
     }
    }
    
    else if(section && !column && !element){
      const id = section.getAttribute("id");
      setHover(id);
      return "sec";
    }
    
   
  };


  const setDragRef = (el)=>{
    if(preview) return
    dragRef.current = el || null
  }

  const updateDND = (x, y) => {
    if(isDraggingLayout) {
      setDisableConDrag(false)
      setDisableEleDrag(false)
      return
    }
    const el = document.elementFromPoint(x, y);
    const section = el?.closest(`[data-drop="SECTION"]`);
    const column = el?.closest(`[data-drop="COLUMN"]`);
    const element = el?.closest(`[data-drop="ELEMENT"]`);

    if(!section){
      setDisableConDrag(true)
      setDisableEleDrag(true)
      return
    }

   

    if(section && !column && !element){
      
        setDisableConDrag(false)
        setDisableEleDrag(true)

    }

   else if(section && column && !element){
      const conID = section.id
      if(isNull(conID)) return
      const colID = column.id
      if(isNull(colID)) return
      const conI = layouts.findIndex(l => l.container.id === conID)
      if(conI === -1) return
      const colI = layouts[conI].columns.findIndex(c => c.id === colID)
      if(colI === -1) return
      const isHasElements = layouts[conI].columns[colI].elements.length > 0
      if(!isHasElements){
          setDisableConDrag(false)
          setDisableEleDrag(true)
      }else if(isHasElements){
        const id = column.getAttribute("id")
        if(id.startsWith("Sec-")){
          console.log(true);
          setDisableConDrag(false)
          setDisableEleDrag(true)
        }else{
          setDisableConDrag(true)
          setDisableEleDrag(true)
        }
        
      }
    }

    else if(section && column && element){

      const conID = section.id
      if(isNull(conID)) return
      const colID = column.id
      if(isNull(colID)) return
      const conI = layouts.findIndex(l => l.container.id === conID)
      if(conI === -1) return
      const colI = layouts[conI].columns.findIndex(c => c.id === colID)
      if(colI === -1) return
      const isHasElements = layouts[conI].columns[colI].elements.length > 0
      if(!isHasElements){
        setDisableConDrag(false)
        setDisableEleDrag(true)
      }else if(isHasElements){
        setDisableConDrag(true)
        setDisableEleDrag(false)
      }

    } 

    
    
   
  };


  


  useEffect(()=>{
    let newElement = lodash.cloneDeep(handleDropElement())
    if(!newElement) return
    if(dropTarget?.type === "SECTION" && newElement.container){
      newElement.container.id += page.latestID
      for(let i = 0; i< 3;i++){
        newElement.columns[i].id += `${page.latestID}-${i}`
      }
      setPreview(newElement)
    }
    else if(dropTarget?.type === "ELEMENT"){
      setPreview(newElement)
    }
    else{
      return
    }
  },[dropTarget])


  useEffect(()=>{
    let newElement = lodash.cloneDeep(handleDropElement())
    if(!newElement) return
    if(dropTarget?.type === "SECTION"){
      dropNewSection()
    }
    else if(dropTarget?.type === "ELEMENT"){
      dropNewElement()
    }
  },[token])



  const scheduleDND = (e)=>{
    const {clientX,clientY} = e
    if(dndRef.current)  return
    dndRef.current = requestAnimationFrame(()=>{
      dndRef.current = null
      updateDND(clientX,clientY)
    })
  }

  



  const scheduleBTNUpdate = (e) => {
    const { clientX, clientY } = e;
    if (btnGroupRef.current) return;
    btnGroupRef.current = requestAnimationFrame(() => {
      btnGroupRef.current = null;
      return updateHoverPosition(clientX, clientY);
    });
  };


  const addNewElement = (element,i1,i2,i3) => {
    const newLayouts = lodash.cloneDeep(layouts);
    newLayouts[i1].columns[i2].elements.splice(i3, 0, element);
    clearGhost();
    setLayout(newLayouts)
  };

  const dropNewElement = () => {
   
    if( !Number.isInteger(dropTarget?.index?.conI) || !Number.isInteger(dropTarget?.index?.colI) || !Number.isInteger(dropTarget?.index?.eleI) || typeof dropTarget.index !== "object" || dropTarget.type !== "ELEMENT") {
      clearGhost()
      return
    }
    const {conI,colI,eleI} = dropTarget.index
    const element = handleDropElement()
    if (element.container || ( isNull(conI) || isNull(colI) || isNull(eleI))){
      clearGhost()
      return
    }
    if(!element.id) return
    element.id += Math.ceil(Math.random() * 1e9).toString(36);
    addNewElement(element,conI,colI,eleI);
  };

  const dropNewSection = () => {
    
    const layout = handleDropElement();
    if (layout.container) {
      if (
        dropTarget?.type !== "SECTION" ||
        typeof dropTarget.index !== "number" ||
        dropTarget.index === -1
      ) {
        clearGhost();
        return;
      }
      layout.container.id += page.latestID;
      for (let i = 0; i < 3; i++) {
        layout.columns[i].id += `${page.latestID}-${i}`;
      }
      setPage(prev =>{
        return {...prev,latestID:prev.latestID+1}
      })
      const newLayouts = lodash.cloneDeep(layouts);
      newLayouts.splice(dropTarget.index, 0, layout);
      setLayout(newLayouts);
      clearGhost();
    } else {
      clearGhost();
      return;
    }
  };

  const handleDrop = (e)=>{
    e.preventDefault()
    e.stopPropagation()
    if (!dropTargetRef.current?.type) {
      const elem = lodash.cloneDeep(handleDropElement());
      const type = elem?.container ? "SECTION" : "ELEMENT";
      updateHoverFromPoint(e.clientX, e.clientY, type, elem);
    }

    if (hoverRef.current) {
    cancelAnimationFrame(hoverRef.current);
    hoverRef.current = null;
  }
  
    if (dropTargetRef.current.type === "SECTION") dropNewSection();
    else dropNewElement();
  }

  const handleDuring = (e) => {
    e.preventDefault();
    const element = lodash.cloneDeep(handleDropElement());
    if(!element){
      clearGhost()
      return
    }
    if (element.container) {
      element.container.id += page.latestID;
      for (let i = 0; i < 3; i++) {
        element.columns[i].id += `${page.latestID}-${i}`;
      }
      scheduleHoverUpdate(e, "SECTION", element);
  
      return;
    }
    scheduleHoverUpdate(e, "ELEMENT", element);
 
  };


 

  const checkGhostPosition = (x, y, r) => {
    const isNum = (n)=>{
      return typeof n === "number" && !Number.isNaN(n)
    }
    return (
      r && isNum(x) && x >= r.left && x <= r.right && isNum(y) && y >= r.top && y <= r.bottom
    );
  };

  const clearGhost = () => {
    if (hoverRef.current) {
      cancelAnimationFrame(hoverRef.current);
      hoverRef.current = null;
    }

    dragToken.current += 1;

    setPreview(null);

  };


  const findColumn = (x,y)=>{
    const el = document.elementFromPoint(x,y)
    const nearestNode = el?.closest("[data-drop='COLUMN']")
    if(!nearestNode) return
    const node = nearestNode?.closest("[data-drop='COLUMN'][id*='/']")
    return node ?? nearestNode
  }


  const findElement = (x,y)=>{
    const el = document.elementFromPoint(x,y)
    const nearestNode = el?.closest("[data-drop='ELEMENT']")
    if(!nearestNode) return
    const node = nearestNode?.closest("[data-drop='ELEMENT'][id*='/']")
    return node ?? nearestNode
    

    
    
  }



  const setColRef = (IDX,idx,el)=>{
    if(isNull(IDX) || isNull(idx)) return
    if(!columned.current[IDX]) columned.current[IDX] = []
    columned.current[IDX][idx] = el || null
    if(columned.current[IDX][idx] === null){
      columned.current[IDX].splice(idx,1)
    }

  }

  const setDropForElement = (conID, colID,overCol, overEl,mouseX,mouseY,element)=>{

    const conI = layouts.findIndex(l => l.container.id === conID);
    if (conI === -1) return null;
    const colI = layouts[conI].columns.findIndex(c => c.id === colID);
    if (colI === -1) return null;
  
    const elements = layouts[conI].columns[colI].elements;
    


    const [_,id] = overCol.getAttribute("id").split("/")
    const column = document.querySelector(`[data-drop="COLUMN"][id="${id}"]`)
    const rectCol = column.getBoundingClientRect()
    const outerCol = overCol.getBoundingClientRect()
    if(mouseY < outerCol.top || mouseY > outerCol.bottom ) return
    const {top,bottom} = rectCol
    if(mouseY < top || mouseY > bottom ) return

    setPreview(element);



    if(!elements.length){
      return {index:{conI,colI,eleI:0},type:"ELEMENT",isLast:false}
    }

    if(!overEl){
      return {index:{conI,colI,eleI:elements.length},type:"ELEMENT",isLast:true}
    }

    const rectEl = overEl.getBoundingClientRect()
    const mid = rectEl.top + (rectEl.height / 2)
    const [_0,_1,eleID] = overEl.getAttribute("id").split("/");
    const index = elements.findIndex(e => e.id === eleID)
    if(index === -1){
      return {index:{conI,colI,eleI:elements.length},type:"ELEMENT",isLast:true}
    }
    const eleI = index + (mouseY > mid ? 1:0)
    return { index: { conI, colI, eleI },type:"ELEMENT", isLast: eleI === elements.length };

  }
  
  

  const updateHoverFromPoint = (x, y, type, element) => {

    const set_2_null = ()=>{
      setPreview(null);
      setDrop(null, null);
    }

    if (ghostRef.current) {
      const r = ghostRef.current.getBoundingClientRect();
      const stillOnGhost = checkGhostPosition(x, y, r)
      const hasDropTarget = dropTargetRef.current && dropTargetRef.current.type && (dropTargetRef.current.type === "SECTION" 
      ? typeof dropTargetRef.current.index === "number"
      : dropTargetRef.current.index && Number.isInteger(dropTargetRef.current.index.conI) && Number.isInteger(dropTargetRef.current.index.colI) && Number.isInteger(dropTargetRef.current.index.eleI)
    )
      if(stillOnGhost && hasDropTarget) return
    }

    const el = document.elementFromPoint(x, y);


    if (type === "SECTION") {
      setPreview(element);
      if (!layouts.length) {
        setDrop(0, "SECTION",null);
        return;
      }


      const section = el?.closest('[data-drop="SECTION"]');
      if (!section) {
        setDrop(layouts.length, "SECTION", true);
        return;
      }

      
      const conR = section.getBoundingClientRect()
      const mid = conR.top + (conR.height / 2)
      const id = section?.getAttribute("id");
      let index = layouts.findIndex((l) => l.container.id === id); 
      index += (y > mid ? 1 : 0)
      setDrop(index, "SECTION", index === layouts.length);

    } else if (type === "ELEMENT") {
      
      const column = findColumn(x,y)
      if(!column){
        set_2_null()
        return
      }
      const idFormCol = column?.getAttribute("id")
      if(!idFormCol){
        set_2_null()
        return
      }
      let [conID,colID] = idFormCol.split("/")
      const EL = findElement(x,y)
      const dropElement = setDropForElement(conID,colID,column,EL,x,y,element)
      if(!dropElement){
        set_2_null()
        return
      }
      setDrop({...dropElement?.index},dropElement.type,dropElement.isLast)
      
      
    }
  };

  const scheduleHoverUpdate = (e, type, element) => {
    const { clientX, clientY } = e;
    const token = dragToken.current;
    if (hoverRef.current) cancelAnimationFrame(hoverRef.current);
    hoverRef.current = requestAnimationFrame(() => {
      hoverRef.current = null;
      if (token !== dragToken.current) return;
      updateHoverFromPoint(clientX, clientY, type, element);
    
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }) // กันคลิกพลาด
  );
  const containerIds = useMemo(
    () => layouts.map((l) => String(l.container.id)),
    [layouts]
  );
  const measuring = {
    droppable: {
      strategy: MeasuringStrategy.Always, // ช่วยให้คำนวณตำแหน่งสด ใหม่ ลื่นขึ้น
    },
  };

  const openModal = (data = null) => {
    if (data) {
      const { id, funct } = data;
      setModal({ id, funct });
    } else {
      setModal(null);
    }
  };

  const noLayoutAnimWhileSorting = (args) => {
    if (args.isSorting || args.wasDragging) return false;
    return defaultAnimateLayoutChanges(args);
  };

  const updateContainer = (data, id) => {
    const newLayouts = lodash.cloneDeep(layouts);
      const idx = newLayouts.findIndex((l) => l.container.id === id);
      newLayouts[idx].container = data;
    setLayout(newLayouts)
  };

  const cloneContainer = (id) => {
    const idx = layouts.findIndex((l) => l.container.id === id);
      const newLayouts = lodash.cloneDeep(layouts);
      const newLayout = lodash.cloneDeep(layouts[idx]);
      newLayout.container.id = `Sec-${page.latestID}`;
      let latestColID = 0;
      newLayout.columns.map((col) => {
        col.id = `Col-${page.latestID}-${latestColID++}`;
        col.elements.map((e) => {
          e.id =
            e.id.split("-")[0] +
            "-" +
            Math.ceil(Math.random() * 1e9).toString(36);
        });
      });
      newLayout.container.latestColID = latestColID;
      newLayouts.splice(idx + 1, 0, newLayout);
    setLayout(newLayouts)

    setPage(prev =>{
      return {...prev,latestID: prev.latestID +1}
    })
  };

  const deleteContainer = (id) => {
    const idx = layouts.findIndex((l) => l.container.id === id);
    if(idx === -1) return
    if (Array.isArray(columned.current)) {
      columned.current.splice(idx, 1);
    }
    contained.current.splice(idx,1)
    const newLayouts = lodash.cloneDeep(layouts);
    newLayouts.splice(idx, 1);
    setLayout(newLayouts)
    if (id === offcanvasID) {
      openOffcavanas(null, null, null);
    }
  };


  const updateColumn = (data, id, conID) => {
    const newLayouts = [...layouts];
    const IDX = newLayouts.findIndex((l) => l.container.id === conID);
    const newLayout = { ...newLayouts[IDX] };
    const newColumns = [...newLayout.columns];
    const idx = newColumns.findIndex((c) => c.id === id);
    const newColumn = { ...data };
    newColumns[idx] = newColumn;
    newLayout.columns = newColumns;
    newLayouts[IDX] = newLayout;
    setLayout(newLayouts);
  };

  const cloneColumn = (id) => {
    const { conID, colID } = id;
    let IDX;
    const newLayouts = lodash.cloneDeep(layouts);
    IDX = newLayouts.findIndex((l) => l.container.id === conID);
    if (IDX === -1) return
    const newLayout = lodash.cloneDeep(newLayouts[IDX]);
    newLayout.container.latestColID += 1;
    const newColumns = lodash.cloneDeep(newLayout.columns);
    const idx = newColumns.findIndex((c) => c.id === colID);
    const newColumn = lodash.cloneDeep(newColumns[idx]);
    const idPaths = newLayout.container.id.split("-");
    newColumn.id = `Col-${idPaths[1]}-${newLayout.container.latestColID}`;
    newColumn.elements.map((e) => {
      e.id =
        e.id.split("-")[0] + "-" + Math.ceil(Math.random() * 1e9).toString(36);
    });
    newColumns.splice(idx + 1, 0, newColumn);
    newLayout.columns = newColumns;
    newLayouts.splice(IDX, 1, newLayout);

    setLayout(newLayouts);
  };

  const deleteColumn = (id) => {
    const { conID, colID } = id;
    const newLayouts = [...layouts];
    const IDX = newLayouts.findIndex((l) => l.container.id === conID);
    const newLayout = { ...newLayouts[IDX] };
    const newColumns = [...newLayout.columns];
    const idx = newColumns.findIndex((c) => c.id === colID);
    newColumns.splice(idx, 1);
    columned.current[IDX].splice(idx,1)
    if (newColumns.length === 0) {
      newLayouts.splice(IDX, 1);
    } else {
      newLayout.columns = newColumns;
      newLayouts.splice(IDX, 1, newLayout);
    }


    setLayout(newLayouts);
  };

  const deleteElement = (id) => {
    const { conID, colID, eleID } = id;
    const newLayouts = lodash.cloneDeep(layouts);
    const IDX = newLayouts.findIndex((l) => l.container.id === conID);
    const idx = newLayouts[IDX].columns.findIndex((c) => c.id === colID);
    const newElements = newLayouts[IDX].columns[idx].elements;
    const i = newElements.findIndex((e) => e.id === eleID);
    newElements.splice(i, 1);
    setLayout(newLayouts);

    setDeleteID(null);
  };

 

  const changeSizeColumn = (id, symbol) => {
    const { conID, colID } = id;
    const newLayouts = [...layouts];
    const IDX = newLayouts.findIndex((l) => l.container.id === conID);
    const newColumns = newLayouts[IDX].columns;
    const idx = newColumns.findIndex((c) => c.id === colID);
    const currentSize = newColumns[idx].size;
    if (symbol === "+" && currentSize < 12) {
      newColumns[idx].size = currentSize + 1;
    } else if (symbol === "-" && currentSize > 1) {
      newColumns[idx].size = currentSize - 1;
    }
    setLayout(newLayouts);
  };



  const SortableContainerItem = ({ id, elementData, children }) => {
    const index = layouts.findIndex((l)=> l.container.id == id)


    const {
      setNodeRef,
      attributes,
      listeners,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id,
      data: { type: "SECTION" },
      animateLayoutChanges: noLayoutAnimWhileSorting,
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition: isDragging ? undefined : transition,
      opacity: isDragging ? 0.7 : 1,
      willChange: "transform",
      touchAction: "none",
      cursor: "grab",
    };

    const {
      isFluid,
      paddingTop,
      paddingBottom,
      isGradient,
      opacityImage,
      opacityColor,
      opacityColorGradient,
      backgroundColor,
      backgroundColorGradient,
      backgroundImage,
      degrees,
    } = elementData;

    const fluid = isFluid ? "w-full" : "container";

    let color;

    if (isGradient) {
      const color1 =
        typeof backgroundColorGradient[0] === "string"
          ? backgroundColorGradient[0] + opacity_2_hex(opacityColorGradient[0])
          : theme[backgroundColorGradient[0].type][
              backgroundColorGradient[0].index
            ] + opacity_2_hex(opacityColorGradient[0]);
      const color2 =
        typeof backgroundColorGradient[1] === "string"
          ? backgroundColorGradient[1] + opacity_2_hex(opacityColorGradient[1])
          : theme[backgroundColorGradient[1].type][
              backgroundColorGradient[1].index
            ] + opacity_2_hex(opacityColorGradient[1]);
      color = `linear-gradient(${degrees}deg, ${color1} 0%, ${color2} 100%)`;
    } else if (!isGradient) {
      color =
        typeof backgroundColor === "string"
          ? backgroundColor + opacity_2_hex(opacityColor)
          : theme[backgroundColor.type][backgroundColor.index] +
            opacity_2_hex(opacityColor);
    }

    const BgImage = () => {
      if (backgroundImage) {
        return (
          <div
            className=" absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-0"
            style={{
              backgroundImage: `url(${backgroundImage})`,
              opacity: opacityImage,
            }}
          />
        );
      } else {
        return <></>;
      }
    };

    return (
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        style={style}
        data-drop="SECTION"
        id={id}
        
       
        className="container-area"
      >
        <div
          className={`${"border-[1px]"}  border-dashed border-gray-600 relative`}
          style={{ background: color }}
          ref={(el)=>{
           contained.current[index] = el || null
          }}
        >
          {hover === id && !activeID && (
            <div className="relative z-20" onMouseEnter={() => setHover(id)}>
              <OptionButtonGroup
                element={elementData}
                clone={cloneContainer}
                id={id}
                remove={deleteContainer}
                offcavanas="Container"
                onUpdate={updateContainer}
                modal={openModal}
              />
            </div>
          )}

          <BgImage />
          <div
            className={`${fluid} mx-auto relative z-10`}
            style={{
              paddingTop: paddingTop,
              paddingBottom: paddingBottom,
            }}
          >
            <div
              className={`grid grid-cols-12 gap-4 `}
             
              onDragOver={(e) => {
                handleDuring(e);
            }}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SortableColumnItem = ({ id, containerId, elementData, children }) => {


    const hugeElementType = ["img","yt","gly"]

    const IDX = layouts.findIndex(l => l.container.id === containerId)
    const idx = layouts[IDX].columns.findIndex(c => c.id === id)
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id,
      data: { type: "COLUMN", conID: containerId },
      animateLayoutChanges: noLayoutAnimWhileSorting,
    });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition: isDragging ? undefined : transition,
      opacity: isDragging ? 0.7 : 1,
      willChange: "transform",
      touchAction: "none",
      cursor: "grab",
    };

    const {
      paddingX,
      paddingY,
      backgroundColor,
      backgroundColorGradient,
      borderColor,
      borderOpacity,
      borderRadius,
      borderWidth,
      degrees,
      isGradient,
      opacityColor,
      opacityColorGradient,
      size,
    } = elementData;

    let color;

    if (isGradient) {
      const color1 =
        typeof backgroundColorGradient[0] === "string"
          ? backgroundColorGradient[0] + opacity_2_hex(opacityColorGradient[0])
          : theme[backgroundColorGradient[0].type][
              backgroundColorGradient[0].index
            ] + opacity_2_hex(opacityColorGradient[0]);
      const color2 =
        typeof backgroundColorGradient[1] === "string"
          ? backgroundColorGradient[1] + opacity_2_hex(opacityColorGradient[1])
          : theme[backgroundColorGradient[1].type][
              backgroundColorGradient[1].index
            ] + opacity_2_hex(opacityColorGradient[1]);
      color = `linear-gradient(${degrees}deg, ${color1} 0%, ${color2} 100%)`;
    } else if (!isGradient) {
      color =
        typeof backgroundColor === "string"
          ? backgroundColor + opacity_2_hex(opacityColor)
          : theme[backgroundColor.type][backgroundColor.index] +
            opacity_2_hex(opacityColor);
    }

    const brColor =
      typeof borderColor === "string"
        ? borderColor + opacity_2_hex(borderOpacity)
        : theme[borderColor.type][borderColor.index] +
          opacity_2_hex(borderOpacity);


      

    return (
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        style={style}
        className={`column-area col-span-${size} `}
    
        
      

        onMouseMove={(e) => {
          scheduleBTNUpdate(e);
        }}
        


      >
        <div
          // className={`column-area border-[1px]  border-dashed border-gray-600 flex ${
          //   elementData.elements.length > 0 || (dropTarget.index?.colI === idx && dropTarget.index?.conI === IDX && hugeElementType.includes(preview?.type))?"min-h-[40px]":"min-h-[200px]"
          // } justify-center items-center text-center relative p-1`}
          className={`column-area border-[1px]  border-dashed border-gray-600 flex 
            h-[200px]
           justify-center items-center text-center relative p-1`}
          ref={(el)=>{
            setColRef(IDX,idx,el)
          }}
          data-drop="COLUMN"
          id={`${containerId}/${id}`}
          onDragOver={(e) => {
            handleDuring(e);
          }}
        
         
        >
          {hover === id && !activeID && (
            <div className="z-20" onMouseEnter={() => setHover(id)}>
              <OptionButtonGroup
                element={{ colData: elementData, conID: containerId }}
                clone={cloneColumn}
                id={{ conID: containerId, colID: id }}
                remove={deleteColumn}
                offcavanas="Column"
                onUpdate={updateColumn}
                modal={openModal}
                changeSizeColumn={changeSizeColumn}
              />
            </div>
          )}

          <div
            className="disable-container-area w-full h-full flex flex-col"
            onDragOver={(e) => {
              handleDuring(e);
            }}
           
            style={{
              borderRadius: borderRadius,
              borderWidth: borderWidth,
              padding: `${paddingY}px ${paddingX}px`,
              borderColor: brColor,
              background: color,
            }}
        
          
          >
            {children}
          </div>
        </div>
      </div>
    );
  };

  const SortableElementItem = ({
    id,
    containerId,
    columnId,
    elementData,
    children,
  }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id,
      data: { type: "ELEMENT", conID: containerId, colID: columnId },
      animateLayoutChanges: noLayoutAnimWhileSorting,
    });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition: isDragging ? undefined : transition,
      opacity: isDragging ? 0.7 : 1,
      willChange: "transform",
      touchAction: "none",
      cursor: "grab",
      width: "100%",
    };

    const { type } = elementData;

    const [hoverElement, setHoverElement] = useState(false);

    const headingColor =
      hoverElement.id === id ? theme.mainColor[1] : theme.mainColor[0];
    const opctText =
      hoverElement.id === id ? opacity_2_hex(100) : opacity_2_hex(255);

   const IDX = layouts.findIndex(l => l.container.id === containerId)
   const idx = layouts[IDX].columns.findIndex(c => c.id === columnId)
   const isElement = layouts[IDX].columns[idx].elements.length > 1
   const nextI = layouts[IDX].columns[idx].elements.findIndex(e => e.id === id) +1
   const isLastList = layouts[IDX].columns[idx].elements[nextI]?.type !== "list"


   useEffect(()=>{
    if(isDragging){
      setDeleteID(null)
    }
   },[isDragging])





    

    if (type === "null") {
      return (
        <Box
          ref={setNodeRef}
          {...attributes}
          {...listeners}
          style={style}
          id={`${containerId}/${columnId}`}
          data-drop="ELEMENT"
          className="column-area"
          onMouseMove={(e) => {
            scheduleBTNUpdate(e);
          }}
          
       
          onDragOver={(e) => {
            handleDuring(e);
          }}
        
        >
          {children}
        </Box>
      );
    }



    const animationForElement = "transition-all duration-200 ease-in-out will-change-transform";

    return (
      <Box
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        style={style}
        id={`${containerId}/${columnId}/${id}`}
        data-drop="ELEMENT"

       
        onDragOver={(e) => {
          handleDuring(e);
        }}
      
       
        onClick={(e) => {
          e.preventDefault();
          if (deleteID?.eleID === id) {
            setDeleteID(null);
            return;
          }
          setDeleteID({ conID: containerId, colID: columnId, eleID: id });
        }}

        onMouseMove={(e) => {
          scheduleBTNUpdate(e);
        }}

        sx={{
          alignItems:'center',
          justifyContent:"center",
        }}

      >
      
        {type === "img" && (

          <div className="relative inline-block w-full" >
                      <img
                src={elementData.src}
                onMouseEnter={() => setHoverElement({ id: id })}
                className={`${animationForElement} rounded-[8px]`}/>
          </div>
 
 
)}
        {type === "yt" && (

<div className="relative inline-block w-full">
<img
      src={elementData.src}
      onMouseEnter={() => setHoverElement({ id: id })}
      className={`${animationForElement} rounded-[8px]`}
    />
           <div className="pointer-events-none absolute inset-0 grid place-items-center ">
        <div className="rounded-full w-[50px] h-[50px] grid place-items-center" style={{backgroundColor:theme.mainColor[1]+opacity_2_hex(200)}}>
        <Play
      className="w-8 h-8 text-white"
      strokeWidth={0}
      aria-hidden="true"
      fill="white"
    /> 
        </div>
        
    
  
  
            </div>
        
    <div className={`rounded-[8px] pointer-events-none absolute inset-0 ${deleteID?.eleID === id? "bg-red-500/50":"hidden"}`}>

    </div>
</div>


)}

{type === "gly" && (
     <div className="relative inline-block w-full">
     <img
           src={elementData.src}
           onMouseEnter={() => setHoverElement({ id: id })}
           className={`${animationForElement} rounded-[8px]`}
         />
                <div className="pointer-events-none absolute inset-0 grid place-items-center ">
             <div className="rounded-full w-[50px] h-[50px] grid place-items-center" style={{backgroundColor:theme.mainColor[1]+opacity_2_hex(200)}}>
             <Plus
           className="w-7 h-7 text-white"
           strokeWidth={5}
           aria-hidden="true"
           fill="white"
         /> 
             </div>
             
         
       
       
                 </div>
             
         <div className={`rounded-[8px] pointer-events-none absolute inset-0 ${deleteID?.eleID === id? "bg-red-500/50":"hidden"}`}>
     
         </div>
     </div>
        )}
{type === "text" && (
 <div
   style={{
     color: theme.textColor[0] + opctText,
     fontSize: 14,
     marginTop: 10,
     marginBottom: 10,
   }}
   className={`${theme.text.value} ${animationForElement} ${deleteID?.eleID === id? " rounded-md border border-red-400 bg-red-300/10 p-2 border-dashed":""}`}
   onMouseEnter={() => setHoverElement({ id: id })}
   onMouseLeave={() => setHoverElement(false)}
   
 >
   {elementData.label}
 </div>
)}
{type === "heading" && (
 <div
   style={{
     color: headingColor,
     fontSize: 18,
     marginTop: 10,
     marginBottom: 10,
   }}
   className={`${theme.textHeading.value} ${animationForElement} ${deleteID?.eleID === id? "rounded-md border border-red-400 bg-red-300/10 p-2 border-dashed":""}`}
   onMouseEnter={() => setHoverElement({ id: id })}
   onMouseLeave={() => setHoverElement(false)}
 >
   {elementData.label}
 </div>
)}
{type === "btn" && (
  <Box sx={{ borderStyle:deleteID?.eleID === id? "dashed" :"",
  borderWidth:deleteID?.eleID === id? 1 :0,
  borderColor: deleteID?.eleID === id? "#f87171":"",
  backgroundColor:deleteID?.eleID === id? "#fca5a51a":"",
  display:"inline-block",p:0.5,lineHeight: 0,borderRadius:2}}>

<Button
   className={``}
   variant="contained"
   disableElevation
   sx={{
     marginTop: 1,
     marginBottom: 1,
     boxShadow: "none",
     backgroundColor: theme.mainColor[1],
     width: 101,
     height: 28,
     border: 0,
     m: 0,
     borderRadius:2,
     fontSize:13,
     fontFamily:setFont(theme.text.value),
     py:2

    
     
   }}
   onMouseEnter={() => setHoverElement({ id: id })}
   onMouseLeave={() => setHoverElement(false)}

 >

   {elementData.label}
 </Button>
    </Box>
 
)}

{type === "divider" && (
  <div className={`${isElement?"w-full":"w-[100px]"} h-[0.5px] my-1`} style={{backgroundColor:"#6a6a6a" }} onMouseEnter={() => setHoverElement({ id: id })}
  onMouseLeave={() => setHoverElement(false)}/>
  
)}
{type === "btnG" && (
  <ButtonGroup aria-label="Basic button group" onMouseEnter={() => setHoverElement({ id: id })}
  onMouseLeave={() => setHoverElement(false)} sx={{borderRadius:2,borderStyle:deleteID?.eleID === id? "dashed" :"",
  borderWidth:deleteID?.eleID === id? 1 :0,
  borderColor: deleteID?.eleID === id? "#f87171":"",
  backgroundColor:deleteID?.eleID === id? "#fca5a51a":"",display:"inline-block",p:0.5,lineHeight: 0}}>
  <Button variant="contained"
   disableElevation
   sx={{
     marginTop: 1,
     marginBottom: 1,
     boxShadow: "none",
     backgroundColor: theme.mainColor[1],
     width: 101,
     height: 28,
     border: 0,
     m: 0,
     borderRadius:2,
    marginRight:0.25,
    fontSize:13,
    fontFamily:setFont(theme.text.value),
    py:2
     

    
     
   }}>Click 1</Button>
  <Button variant="contained"
   disableElevation
   sx={{
     marginTop: 1,
     marginBottom: 1,
     boxShadow: "none",
     backgroundColor: theme.mainColor[1],
     width: 101,
     height: 28,
     border: 0,
     m: 0,
     borderRadius:2,
     marginLeft:0.25,
     fontSize:13,
     fontFamily:setFont(theme.text.value),
     py:2

    
     
   }}>Click 2</Button>
</ButtonGroup>
)}{type === "icon" && (
  <div className="w-full flex items-center justify-center ">
     <div className="rounded-full size-[70px]  flex items-center justify-center" style={{borderStyle:deleteID?.eleID === id? "dashed" :"",
  borderWidth:deleteID?.eleID === id? 1 :0,
  borderColor: deleteID?.eleID === id? "#f87171":"",
  backgroundColor:deleteID?.eleID === id? "#fca5a51a":"",}}>
      <div className="rounded-full size-[60px] p-1 flex items-center justify-center" style={{backgroundColor:theme.mainColor[0],}}>
            <ScanEye className=" text-white" size={38}/>
      </div>
  </div>
  </div>
)}{type === "list" && (
  <Box
    sx={{
      width: "100%",
      // กันกรณีพื้นหลังกลืนสี
      mx:0,px:0,py:0,my:0,
      borderStyle: deleteID?.eleID === id ? "dashed" : "",
      borderWidth: deleteID?.eleID === id ? 1 : 0,
      borderColor: deleteID?.eleID === id ? "#f87171" : "",
      backgroundColor: deleteID?.eleID === id ? "#fca5a51a" : "",
      borderRadius: 2,
   
      
    }}
    onMouseEnter={() => setHoverElement({ id })}
    onMouseLeave={() => setHoverElement(false)}
  >

<List dense sx={{ width: '100%',py:0,my:0.5}}>
          <ListItem
            disablePadding
          >
              <ListItemAvatar sx={{pl:1}}>
  
    
      <div className="rounded-full size-[36px] p-1 flex items-center justify-center" style={{backgroundColor:theme.mainColor[0],}}>
      <ScanEye size={20} className="text-white"/>
  
  </div>
               
              </ListItemAvatar>
              <ListItemText disableTypography  primary={(
                <Typography sx={{fontSize:15,fontFamily:setFont(theme.textHeading.value),color:theme.mainColor[1]}}>What is Lorem Ipsum?</Typography>
              )} secondary={(
                <>
                <Typography sx={{fontSize:13,fontFamily:setFont(theme.text.value),color:theme.textColor[0],fontWeight:1}}>Lorem Ipsum is simply dummy text of the typesetting industry.</Typography>
                </>
              )}/>

          </ListItem>
    </List>

    {!isLastList && (
      <Divider sx={{borderStyle:"dotted",borderColor:"grey"}}/>
    )}
    

  </Box>
)}
         
        
      </Box>
    );
  };

  const change_column_position = (oldIndex, newIndex, containerIndex) => {
    const newLayouts = layouts.map((l) => ({ ...l, columns: [...l.columns] }));
    const newColumns = newLayouts[containerIndex].columns;
    const [column] = newColumns.splice(oldIndex, 1);
    newColumns.splice(newIndex, 0, column);
    setLayout(newLayouts);
  };


  const change_container_position = (oldIndex, newIndex) => {
    const newLayouts = lodash.cloneDeep(layouts);
    const [layout] = newLayouts.splice(oldIndex, 1);
    newLayouts.splice(newIndex, 0, layout);
    setLayout(newLayouts);
  };

  const change_element_position = (
    oldIndex,
    newIndex,
    containerIndex,
    columnIndex
  ) => {
    const newLayouts = [...layouts];
    const newElements =
      newLayouts[containerIndex].columns[columnIndex].elements;
    const [element] = newElements.splice(oldIndex, 1);
    newElements.splice(newIndex, 0, element);

    setLayout(newLayouts);
  };

  const change_element_position_new_column = (
    oldIndex,
    newIndex,
    containerIndex,
    oldColumnIndex,
    newColumnIndex
  ) => {
    const newLayouts = [...layouts];
    const oldElements =
      newLayouts[containerIndex].columns[oldColumnIndex].elements;
    const newElements =
      newLayouts[containerIndex].columns[newColumnIndex].elements;
    const [element] = oldElements.splice(oldIndex, 1);
    newElements.splice(newIndex, 0, element);

    setLayout(newLayouts);
  };

  const change_element_position_new_container = (
    oldIndex,
    newIndex,
    oldContainerIndex,
    newContainerIndex,
    oldColumnIndex,
    newColumnIndex
  ) => {
    const newLayouts = [...layouts];
    const oldElements =
      newLayouts[oldContainerIndex].columns[oldColumnIndex].elements;
    const newElements =
      newLayouts[newContainerIndex].columns[newColumnIndex].elements;
    const [element] = oldElements.splice(oldIndex, 1);
    newElements.splice(newIndex, 0, element);

    setLayout(newLayouts);

  };

  

  const ColumnPreview = ({ element, id, children }) => {
    const {  colID } = id;

    const {
      paddingX,
      paddingY,
      backgroundColor,
      backgroundColorGradient,
      borderColor,
      borderOpacity,
      borderRadius,
      borderWidth,
      degrees,
      isGradient,
      opacityColor,
      opacityColorGradient,
      size,
      elements,
    } = element;

    let color;

    if (isGradient) {
      const color1 =
        typeof backgroundColorGradient[0] === "string"
          ? backgroundColorGradient[0] + opacity_2_hex(opacityColorGradient[0])
          : theme[backgroundColorGradient[0].type][
              backgroundColorGradient[0].index
            ] + opacity_2_hex(opacityColorGradient[0]);
      const color2 =
        typeof backgroundColorGradient[1] === "string"
          ? backgroundColorGradient[1] + opacity_2_hex(opacityColorGradient[1])
          : theme[backgroundColorGradient[1].type][
              backgroundColorGradient[1].index
            ] + opacity_2_hex(opacityColorGradient[1]);
      color = `linear-gradient(${degrees}deg, ${color1} 0%, ${color2} 100%)`;
    } else if (!isGradient) {
      color =
        typeof backgroundColor === "string"
          ? backgroundColor + opacity_2_hex(opacityColor)
          : theme[backgroundColor.type][backgroundColor.index] +
            opacity_2_hex(opacityColor);
    }

    const brColor =
      typeof borderColor === "string"
        ? borderColor + opacity_2_hex(borderOpacity)
        : theme[borderColor.type][borderColor.index] +
          opacity_2_hex(borderOpacity);

    return (
      <div
        className={`col-span-${size} border-[1px]  border-dashed border-gray-600 flex ${
          elements.length === 0 ? "h-[200px]" : "h-auto"
        } justify-center items-center text-center relative p-1`}
      
        onDragOver={(e) => {
        
            handleDuring(e);
          
        }}
      >
        <div
          className="w-full h-full flex items-center justify-center"
          style={{
            borderRadius: borderRadius,
            borderWidth: borderWidth,
            padding: `${paddingY}px ${paddingX}px`,
            borderColor: brColor,
            background: color,
          }}
        >
          {children}
        </div>
      </div>
    );
  };

  const ContainerPreview = ({ element, id, children }) => {
    const { container } = element;
    const {
      isFluid,
      paddingTop,
      paddingBottom,
      isGradient,
      opacityImage,
      opacityColor,
      opacityColorGradient,
      backgroundColor,
      backgroundColorGradient,
      backgroundImage,
      degrees,
    } = container;

    const fluid = isFluid ? "w-full" : "container";

    let color;

    if (isGradient) {
      const color1 =
        typeof backgroundColorGradient[0] === "string"
          ? backgroundColorGradient[0] + opacity_2_hex(opacityColorGradient[0])
          : theme[backgroundColorGradient[0].type][
              backgroundColorGradient[0].index
            ] + opacity_2_hex(opacityColorGradient[0]);
      const color2 =
        typeof backgroundColorGradient[1] === "string"
          ? backgroundColorGradient[1] + opacity_2_hex(opacityColorGradient[1])
          : theme[backgroundColorGradient[1].type][
              backgroundColorGradient[1].index
            ] + opacity_2_hex(opacityColorGradient[1]);
      color = `linear-gradient(${degrees}deg, ${color1} 0%, ${color2} 100%)`;
    } else {
      color =
        typeof backgroundColor === "string"
          ? backgroundColor + opacity_2_hex(opacityColor)
          : theme[backgroundColor?.type][backgroundColor?.index] +
            opacity_2_hex(opacityColor);
    }

    const BgImage = () => {
      if (backgroundImage) {
        return (
          <div
            className=" absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-0"
            style={{
              backgroundImage: `url(${backgroundImage})`,
              opacity: opacityImage,
            }}
          />
        );
      } else {
        return <></>;
      }
    };

    return (
      <div
        className="preview pointer-events-none border-dashed border-gray-600 relative"
        aria-hidden
        style={{ background: color }}
       
        onDragOver={(e) => {
        
            handleDuring(e);
          
        }}
      >
        <BgImage />
        <div
          className={`${fluid} mx-auto relative z-10`}
          onMouseEnter={() => setHover(id)}
          onMouseLeave={() => setHover(null)}
          style={{
            paddingTop: paddingTop,
            paddingBottom: paddingBottom,
          }}
        >
          <div
            className={`grid grid-cols-12 py-5 gap-4 `}
            onMouseEnter={() => setHover(id)}
            onMouseLeave={() => setHover(null)}
          >
            {children}
          </div>
        </div>
      </div>
    );
  };

  const ElementPreview = ({ element }) => {



    return (
      <Box style={{ width: "100%", textAlign: "center"}} 
     
      onDragOver={(e) => {
      
          handleDuring(e);
        
      }}>
        
        {element.type === "img" && (

<div className="relative inline-block w-full">
<img
src={element.src}
className={` rounded-[8px] `}
/>
</div>

        )}

        {element.type === "yt" && (
         <div className="relative inline-block w-full">
         <img
               src={element.src}
               className={` rounded-[8px] `}
             />
                    <div className="pointer-events-none absolute inset-0 grid place-items-center ">
                 <div className="rounded-full w-[50px] h-[50px] grid place-items-center" style={{backgroundColor:theme.mainColor[1]+opacity_2_hex(200)}}>
                 <Play
               className="w-8 h-8 text-white"
               strokeWidth={0}
               aria-hidden="true"
               fill="white"
             /> 
                 </div>
                 
             
           
           
                     </div>
     
         </div>
        )}
          {element.type === "gly" && (
           <div className="relative inline-block w-full">
           <img
                 src={element.src}
                 className={` rounded-[8px] }`}
               />
                      <div className="pointer-events-none absolute inset-0 grid place-items-center ">
                   <div className="rounded-full w-[50px] h-[50px] grid place-items-center" style={{backgroundColor:theme.mainColor[1]+opacity_2_hex(200)}}>
                   <Plus
                className="w-7 h-7 text-white"
                strokeWidth={5}
                aria-hidden="true"
                fill="white"
               /> 
                   </div>
                   
               
             
             
                       </div>
                   
        
           </div>
        )}
        {element.type === "text" && (
          <div
          
        
            style={{
              color: theme.textColor[0],
              fontSize: 14,
              marginTop: 10,
              marginBottom: 10,
                           
             }}
            className={`${theme.text.value} `}
          >
            {element.label}
          </div>
        )}
        {element.type === "heading" && (
          <div
        
            style={{
              color: theme.mainColor[0],
              fontSize: 18,
              marginTop: 10,
              marginBottom: 10,
            }}
            className={`${theme.textHeading.value} `}
          >
            {element.label}
          </div>
        )}
        {element.type === "btn" && (
          <Button
        
            variant="contained"
            disableElevation
            sx={{
              marginTop: 1,
              marginBottom: 1,
              boxShadow: "none",
              backgroundColor: theme.mainColor[1],
              width: 101,
              height: 28,
              borderRadius:2,
              fontSize:13,
              fontFamily:setFont(theme.text.value),
              py:2
            }}
          >
            {element.label}
          </Button>
        )}
        {element.type === "divider" && (
  <> 
      <div className={`w-[100px] h-[0.5px] bg-red-500 my-1`} style={{backgroundColor:"#6a6a6a" }}/>
  </>
)}
{element.type === "btnG" && (
  <ButtonGroup aria-label="Basic button group"  sx={{borderRadius:2}}>
  <Button variant="contained"
   disableElevation
   sx={{
     marginTop: 1,
     marginBottom: 1,
     boxShadow: "none",
     backgroundColor: theme.mainColor[1],
     width: 101,
     height: 28,
     border: 0,
     m: 0,
     borderRadius:2,
    marginRight:0.25,
    fontSize:13,
    fontFamily:setFont(theme.text.value),
    py:2
    
     

    
     
   }}>Click 1</Button>
  <Button variant="contained"
   disableElevation
   sx={{
     marginTop: 1,
     marginBottom: 1,
     boxShadow: "none",
     backgroundColor: theme.mainColor[1],
     width: 101,
     height: 28,
     border: 0,
     m: 0,
     borderRadius:2,
     marginLeft:0.25,
     fontSize:13,
     fontFamily:setFont(theme.text.value),
     py:2

    
     
   }}>Click 2</Button>
</ButtonGroup>
)}{element.type === "icon" && (
  <div className="w-full flex items-center justify-center">

   <div className="rounded-full size-[60px] p-1 flex items-center justify-center" style={{backgroundColor:theme.mainColor[0],}}>
         <ScanEye className=" text-white" size={38}/>

</div>
</div>
)}
{element.type === "list" && (
  <Box
    sx={{
      width: "100%",
      // กันกรณีพื้นหลังกลืนสี
      mx:0,px:0,py:0,my:0,
      borderRadius: 2,
  
      
    }}

  >

<List dense sx={{ width: '100%',py:0,my:0.5}}>
          <ListItem
            disablePadding
          >
              <ListItemAvatar sx={{pl:1}}>
  
    
      <div className="rounded-full size-[36px] p-1 flex items-center justify-center" style={{backgroundColor:theme.mainColor[0],}}>
      <ScanEye size={20} className="text-white"/>
  
  </div>
               
              </ListItemAvatar>
              <ListItemText disableTypography  primary={(
                <Typography sx={{fontSize:15,fontFamily:setFont(theme.textHeading.value),color:theme.mainColor[1]}}>What is Lorem Ipsum?</Typography>
              )} secondary={(
                <>
                <Typography sx={{fontSize:13,fontFamily:setFont(theme.text.value),color:theme.textColor[0],fontWeight:1}}>Lorem Ipsum is simply dummy text of the typesetting industry.</Typography>
                </>
              )}/>

          </ListItem>
    </List>

  </Box>
)}
      </Box>
    );
  };

  const ElementPreviewForDrag_Drop =({ element })=>{


    return (
      <Box style={{ width: "100%", textAlign: "center"}} 
     
      onDragOver={(e) => {
      
          handleDuring(e);
        
      }}>
        
        {element.type === "img" && (

<div className="relative inline-block w-full" ref={(el)=>setDragRef(el)}>
<img
src={element.src}
className={` rounded-[8px]`}
/>
</div>

        )}

        {element.type === "yt" && (
         <div className="relative inline-block w-full" ref={(el)=>setDragRef(el)}>
         <img
               src={element.src}
               className={` rounded-[8px]`}
             />
                    <div className="pointer-events-none absolute inset-0 grid place-items-center ">
                 <div className="rounded-full w-[50px] h-[50px] grid place-items-center" style={{backgroundColor:theme.mainColor[1]+opacity_2_hex(200)}}>
                 <Play
               className="w-8 h-8 text-white"
               strokeWidth={0}
               aria-hidden="true"
               fill="white"
             /> 
                 </div>
                 
             
           
           
                     </div>
     
         </div>
        )}
          {element.type === "gly" && (
           <div className="relative inline-block w-full" ref={(el)=>setDragRef(el)}>
           <img
                 src={element.src}
                 className={` rounded-[8px] `}
               />
                      <div className="pointer-events-none absolute inset-0 grid place-items-center ">
                   <div className="rounded-full w-[50px] h-[50px] grid place-items-center" style={{backgroundColor:theme.mainColor[1]+opacity_2_hex(200)}}>
                   <Plus
                className="w-7 h-7 text-white"
                strokeWidth={5}
                aria-hidden="true"
                fill="white"
               /> 
                   </div>
                   
               
             
             
                       </div>
                   
        
           </div>
        )}
        {element.type === "text" && (
          <div
          
          ref={(el)=>setDragRef(el)}
            style={{
              color: theme.textColor[0],
              fontSize: 14,
              marginTop: 10,
              marginBottom: 10,
                           
             }}
            className={`${theme.text.value} `}
          >
            {element.label}
          </div>
        )}
        {element.type === "heading" && (
          <div
          ref={(el)=>setDragRef(el)}
            style={{
              color: theme.mainColor[0],
              fontSize: 18,
              marginTop: 10,
              marginBottom: 10,
            }}
            className={`${theme.textHeading.value} `}
          >
            {element.label}
          </div>
        )}
        {element.type === "btn" && (
          <Button
          ref={(el)=>setDragRef(el)}
            variant="contained"
            disableElevation
            sx={{
              marginTop: 1,
              marginBottom: 1,
              boxShadow: "none",
              backgroundColor: theme.mainColor[1],
              width: 101,
              height: 28,
              borderRadius:2,
              fontSize:13,
              fontFamily:setFont(theme.text.value),
              py:2
            }}
          >
            {element.label}
          </Button>
        )}
        {element.type === "divider" && (
  <> 
      <div className={`w-[100px] h-[0.5px] bg-red-500 my-1`} style={{backgroundColor:"#6a6a6a" }}/>
  </>
)}
{element.type === "btnG" && (
  <ButtonGroup aria-label="Basic button group"  sx={{borderRadius:2}} ref={(el)=>setDragRef(el)}>
  <Button variant="contained"
   disableElevation
   sx={{
     marginTop: 1,
     marginBottom: 1,
     boxShadow: "none",
     backgroundColor: theme.mainColor[1],
     width: 101,
     height: 28,
     border: 0,
     m: 0,
     borderRadius:2,
    marginRight:0.25,
    fontSize:13,
    fontFamily:setFont(theme.text.value),
    py:2
    
     

    
     
   }}>Click 1</Button>
  <Button variant="contained"
   disableElevation
   sx={{
     marginTop: 1,
     marginBottom: 1,
     boxShadow: "none",
     backgroundColor: theme.mainColor[1],
     width: 101,
     height: 28,
     border: 0,
     m: 0,
     borderRadius:2,
     marginLeft:0.25,
     fontSize:13,
     fontFamily:setFont(theme.text.value),
     py:2

    
     
   }}>Click 2</Button>
</ButtonGroup>
)}{element.type === "icon" && (
  <div className="w-full flex items-center justify-center">

   <div className="rounded-full size-[60px] p-1 flex items-center justify-center" style={{backgroundColor:theme.mainColor[0],}} ref={(el)=>setDragRef(el)}>
         <ScanEye className=" text-white" size={38}/>

</div>
</div>
)}
{element.type === "list" && (
  <Box
    sx={{
      width: "100%",
      // กันกรณีพื้นหลังกลืนสี
      mx:0,px:0,py:0,my:0,
      borderRadius: 2,
  
      
    }}

  >

<List dense sx={{ width: '100%',py:0,my:0.5}} ref={(el)=>setDragRef(el)}>
          <ListItem
            disablePadding
          >
              <ListItemAvatar sx={{pl:1}}>
  
    
      <div className="rounded-full size-[36px] p-1 flex items-center justify-center" style={{backgroundColor:theme.mainColor[0],}}>
      <ScanEye size={20} className="text-white"/>
  
  </div>
               
              </ListItemAvatar>
              <ListItemText disableTypography  primary={(
                <Typography sx={{fontSize:15,fontFamily:setFont(theme.textHeading.value),color:theme.mainColor[1]}}>What is Lorem Ipsum?</Typography>
              )} secondary={(
                <>
                <Typography sx={{fontSize:13,fontFamily:setFont(theme.text.value),color:theme.textColor[0],fontWeight:1}}>Lorem Ipsum is simply dummy text of the typesetting industry.</Typography>
                </>
              )}/>

          </ListItem>
    </List>

  </Box>
)}
      </Box>
    );
  }

  const findElementIndexForDND = (conI,colI,conID,colID,eleID,active)=>{

    let index = layouts[conI].columns[colI].elements.findIndex(e => e.id === eleID)

    const elementNode = document.querySelector(`[data-drop="ELEMENT"][id="${conID}/${colID}/${eleID}"]`)

     const r = elementNode.getBoundingClientRect()

    const {top,height} = r

    const {top:topA,height:heightA} = active.rect.current.translated

    const mid = top + (height/2)

    const midA = topA + (heightA/2)

    let checkCenter = midA > mid ? 1 : 0

    return index + checkCenter



  }

  const drag = ({ active }) => {
    const { id, data } = active;
    const { current } = data;
    let section;
    let column;



    if (id.startsWith("Sec-")) {
      section = layouts.find((l) => l.container.id === id);
      setActiveItem(section);
      setActiveID(id);
    } else if (id.startsWith("Col-")) {
      section = layouts.find((l) => l.container.id === current.conID);
      column = section.columns.find((c) => c.id === id);
      setActiveItem(column);
      setActiveID({ conID: current.conID, colID: id });
    } else {
      section = layouts.find((l) => l.container.id === current.conID);
      const si = layouts.findIndex((l) => l.container.id === current.conID);
      column = section.columns.find((c) => c.id === current.colID);
      positionRef.current = si
      const element = column.elements.find((e) => e.id === id);
      setActiveItem(element);
      setActiveID({ conID: current.conID, colID: current.colID, eleID: id });
    }
  };

  const during = ({ active, over }) => {
    if (!over || !active) return;
    if (!over || !active || !over.data?.current || !active.data?.current)
      return;
    if (active.id === over.id) return;

    setIsDraggingLayout(true)

    
    const types = ["COLUMN", "ELEMENT"];
    if (
      !types.includes(over.data.current.type) ||
      !types.includes(active.data.current.type)
    )
      return;


      const oldContainerID = active.data.current.conID;
      const newContainerID = over.data.current.conID;
     
    
      

      if (
        over.data.current.type === "ELEMENT" &&
        active.data.current.type === "ELEMENT"
      ) {
        const oldColumnID = active.data.current.colID;
        const newColumnID = over.data.current.colID;
        const R = contained.current[positionRef.current]?.getBoundingClientRect()
        if(!R)  return
        const {bottom:sb,top:st} = R
        if(!sb || !st) return
        const {top:t,height:h,left:l,right:r,bottom:b} = dragRef.current.getBoundingClientRect()
        const mid = t + (h/2)
        let checkPosition
        if (oldColumnID === newColumnID && oldContainerID === newContainerID) {
         
          const IDX = layouts.findIndex(
            (l) => l.container.id === oldContainerID
          );
          const idx = layouts[IDX].columns.findIndex(
            (c) => c.id === oldColumnID
          );
          if (IDX === -1 || idx === -1) return;
          const oldIndex = layouts[IDX].columns[idx].elements.findIndex(
            (e) => e.id === active.id
          );
          const newIndex = layouts[IDX].columns[idx].elements.findIndex(
            (e) => e.id === over.id
          );
          if (oldIndex === -1 || newIndex === -1) return;
          change_element_position(oldIndex, newIndex, IDX, idx);
        } else if (
          oldColumnID !== newColumnID &&
          oldContainerID === newContainerID
        ) {
          const IDX = layouts.findIndex(
            (l) => l.container.id === oldContainerID
          );
          const idx1 = layouts[IDX].columns.findIndex(
            (c) => c.id === oldColumnID
          );
          const idx2 = layouts[IDX].columns.findIndex(
            (c) => c.id === newColumnID
          );
          if (IDX === -1 || idx1 === -1 || idx2 === -1) return;
          const oldIndex = layouts[IDX].columns[idx1].elements.findIndex(
            (e) => e.id === active.id
          );
          if (oldIndex === -1) return;

          const {bottom:cb,top:ct,left:cl,right:cr} = columned.current[IDX][idx2].getBoundingClientRect()
          
          if(idx2 < idx1){
            console.log(1);
            checkPosition = mid > ct &&  mid < cb && l < cr - 10
            
          }else if(idx2 > idx1){
            checkPosition = mid > ct  && mid < cb && r > cl + 10
            
          }
          

          if(!checkPosition)return

          positionRef.current = IDX
         
          if (layouts[IDX].columns[idx2].elements.length === 0) {

            change_element_position_new_column(oldIndex, 0, IDX, idx1, idx2); return
          } else {
            const newIndex = findElementIndexForDND(IDX,idx2,newContainerID,newColumnID,over.id,active)

            if (newIndex === -1) return;
            change_element_position_new_column(
              oldIndex,
              newIndex,
              IDX,
              idx1,
              idx2
            );
          }
        } else if (oldContainerID !== newContainerID ) {
          const IDX1 = layouts.findIndex(
            (l) => l.container.id === oldContainerID
          );
          const IDX2 = layouts.findIndex(
            (l) => l.container.id === newContainerID
          );
          const idx1 = layouts[IDX1].columns.findIndex(
            (c) => c.id === oldColumnID
          );
          const idx2 = layouts[IDX2].columns.findIndex(
            (c) => c.id === newColumnID
          );
          if (IDX1 === -1 || IDX2 === -1 || idx1 === -1 || idx2 === -1) return;
          const oldIndex = layouts[IDX1].columns[idx1].elements.findIndex(
            (e) => e.id === active.id
          );
          if (oldIndex === -1) return;
          
          const {bottom:cb,top:ct,left:cl,right:cr} = columned.current[IDX2][idx2].getBoundingClientRect()
          if(IDX2 > positionRef.current){
            checkPosition = mid > sb && mid > ct && l < cr 
          }else if(IDX2 < positionRef.current){
            checkPosition = mid < st && mid < cb  && l < cr 
          }

          if(!checkPosition)return

          positionRef.current = IDX2
          if (layouts[IDX2].columns[idx2].elements.length === 0) {
            change_element_position_new_container(
              oldIndex,
              0,
              IDX1,
              IDX2,
              idx1,
              idx2
            );
            return
          } else {
            const newIndex = findElementIndexForDND(IDX2,idx2,newContainerID,newColumnID,over.id,active)
            if (newIndex === -1) return;
        

            change_element_position_new_container(
              oldIndex,
              newIndex,
              IDX1,
              IDX2,
              idx1,
              idx2
            );
            return
          }
        }
      } else if (
        over.data.current.type === "COLUMN" &&
        active.data.current.type === "COLUMN"
      ) {
        if (oldContainerID === newContainerID) {
          const IDX = layouts.findIndex(
            (l) => l.container.id === oldContainerID
          );
          if (IDX === -1) return;
          const oldIndex = layouts[IDX].columns.findIndex(
            (c) => c.id === active.id
          );
          const newIndex = layouts[IDX].columns.findIndex(
            (c) => c.id === over.id
          );
          if (oldIndex === -1 || newIndex === -1) return;
          if (oldIndex === newIndex) return;
          change_column_position(oldIndex, newIndex, IDX);
          return;
        } else if (oldContainerID !== newContainerID) {
            return
        }
      }
    ;
  };

  const drop = ({ active, over }) => {
    setDisableColDrag(true)
    setActiveID(null);
    positionRef.current =null
    setActiveItem(null);
    setIsDraggingLayout(false)
    if (!over || !active || !over.data?.current || !active.data?.current)
      return;
    if (!over || !active) return;
    if (active.id === over.id) return;
    if (
      over.data.current.type === "SECTION" &&
      active.data.current.type === "SECTION"
    ) {
      const oldIndex = layouts.findIndex((l) => l.container.id === active.id);
      const newIndex = layouts.findIndex((l) => l.container.id === over.id);
      change_container_position(oldIndex, newIndex);
    } else {
      return;
    }
  };

  function collisionByType(args) {
    const { active, droppableContainers } = args;
    const { type } = active.data.current;

    const filtered = droppableContainers.filter((dc) => {
      const t = dc.data.current.type;
      return t === type;
    });

    return closestCenter({
      ...args,
      droppableContainers: filtered,
    });
  }




  const addClass = ()=>document.documentElement.classList.add("dragging")
  const removeClass = ()=>document.documentElement.classList.remove("dragging")

  return (
    <main
      className="content-area flex-1 overflow-y-auto p-4 sm:p-6 "
      area="main"
      onDrop={(e) => {
        handleDrop(e)
      }}
      onDragOver={(e) => {
          handleDuring(e);
      }}
      onDragEnterCapture={(e) => {
        e.preventDefault();

        if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
      }}
      onDragOverCapture={(e) => {
        e.preventDefault();

        if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
      }}
      onMouseMove={(e) => {
        scheduleBTNUpdate(e);
        scheduleDND(e)
      }}
    >


     
      {/* Canvas สำหรับวาง element */}
      <DndContext
        onDragStart={(e)=> {
          addClass();
          drag(e)
          setIsDraggingLayout(true)
        }}
        onDragMove={(e)=> during(e)} 
        onDragEnd={(e)=>{
          drop(e)
          setIsDraggingLayout(false)
          ;removeClass()
        }}
        sensors={sensors}
        autoScroll
        measuring={measuring}
        collisionDetection={collisionByType}
      >
        <div className="content-area min-h-[600px] rounded-xl border border-white/10 bg-white/5">
          <SortableContext
            items={containerIds}
            strategy={verticalListSortingStrategy}
            disabled={disableConDrag}
          >
            {layouts.length > 0 ? (
              <>
                {layouts.map((layout, I) => {
                  const { container, columns } = layout;
                  const { id: ID } = container;

                  return (
                    <React.Fragment key={ID}>
                      {preview &&
                        dropTarget?.type === "SECTION" &&
                        dropTarget?.index === I && (
                          <div
                            ref={(el)=>setGhost(el)}
                            className=" opacity-70 "
                            key="ghost"
                            data-drop="SECTION"
                            id={preview.container.id}
                          >
                            <ContainerPreview
                              element={preview}
                              id={preview.container.id}
                            >
                              {preview.columns.map((c, i) => (
                                <ColumnPreview
                                  key={c.id}
                                  element={c}
                                  id={{
                                    conID: preview.container.id,
                                    colID: c.id,
                                  }}
                                >
                                  {c.id}
                                </ColumnPreview>
                              ))}
                            </ContainerPreview>
                          </div>
                        )}

                      <SortableContainerItem
                        key={ID}
                        elementData={container}
                        id={ID}
                      >
                        <SortableContext
                          items={columns.map((c) => c.id)}
                          strategy={rectSortingStrategy}
                          disabled={disableColDrag}
                        >
                          {columns.map((col, i) => {
                            const { id, elements } = col;
                            const eleID = elements.map((e) => e.id) ?? [
                              "ele-null",
                            ];
                            return (
                              <SortableColumnItem
                                key={id}
                                id={id}
                                containerId={ID}
                                elementData={col}
                              >
                                <SortableContext
                                  items={eleID}
                                  strategy={verticalListSortingStrategy}
                                  disabled={disableEleDrag}
                                >
                                  {elements.length > 0 ? (
                                    <>
                                      <div>
                                        {elements.map((ele, o) => (
                                          <React.Fragment key={ele.id}>
                                            {preview &&
                                              dropTarget?.type ===
                                                "ELEMENT" &&
                                              dropTarget?.index
                                                ?.conI === I &&
                                              dropTarget?.index
                                                ?.colI === i &&
                                              dropTarget?.index
                                                ?.eleI === o &&
                                              !dropTarget?.isLast && (
                                                <>
                                                  <div
                                                    ref={(el)=>setGhost(el)}
                                                    className=" opacity-70 "
                                                    key="ghost-ele"
                                                    
                                                    id={preview.id}
                                                    onDragOver={(e) => {
                                                      handleDuring(e);
                                                    }}
                                                 
                                                  >
                                                    <ElementPreview
                                                      element={preview}
                                                    ></ElementPreview>
                                                  </div>
                                                </>
                                              )}

                                            <SortableElementItem
                                              id={ele.id}
                                              containerId={ID}
                                              columnId={id}
                                              elementData={ele}
                                            ></SortableElementItem>

                                            {preview &&
                                              dropTarget.type ===
                                                "ELEMENT" &&
                                              dropTarget.index
                                                ?.conI === I &&
                                              dropTarget.index
                                                ?.colI === i &&
                                              o === elements.length - 1 &&
                                              dropTarget.isLast && (
                                                <>
                                                  <div
                                                    ref={(el)=>setGhost(el)}
                                                    className=" opacity-70 "
                                                    key="ghost-ele"
                                             
                                                    id={preview.id}
                                                    onDragOver={(e) => {
                                                      handleDuring(e);
                                                    }}
                                                   
                                                  >
                                                    <ElementPreview
                                                      element={preview}
                                                    ></ElementPreview>
                                                  </div>
                                                </>
                                              )}
                                          </React.Fragment>
                                        ))}
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      {preview &&
                                      dropTarget.index?.conI === I &&
                                      dropTarget.index?.colI ===
                                        i ? (
                                        <>
                                          <div
                                            ref={(el)=>setGhost(el)}
                                            className=" opacity-70 "
                                            key="ghost-ele-end-1"
                                          
                                            id={preview.id}
                                            onDragOver={(e) => {
                                              handleDuring(e);
                                            }}
                                         
                                          >
                                            <ElementPreview
                                              element={preview}
                                            ></ElementPreview>
                                          </div>
                                        </>
                                      ) : (
                                        <>
                                          <SortableElementItem
                                            key={`ele-${id}`}
                                            id={`ele-${id}`}
                                            containerId={ID}
                                            columnId={id}
                                            elementData={{ type: "null",id:"__null__" }}
                                          >
                                            {id}
                                          </SortableElementItem>
                                        </>
                                      )}
                                    </>
                                  )}
                                </SortableContext>
                              </SortableColumnItem>
                            );
                          })}
                        </SortableContext>
                      </SortableContainerItem>

                      {preview &&
                        dropTarget.type === "SECTION" &&
                        dropTarget.isLast &&
                        I === layouts.length - 1 && (
                          <div
                          ref={(el)=>setGhost(el)}
                            className=" opacity-70 "
                            key="ghost"
                            data-drop="SECTION"
                            id={preview.container.id}
                          >
                            <ContainerPreview
                              element={preview}
                              id={preview.container.id}
                            >
                              {preview.columns.map((c, i) => (
                                <ColumnPreview
                                  key={c.id}
                                  element={c}
                                  id={{
                                    conID: preview.container.id,
                                    colID: c.id,
                                  }}
                                >
                                  {c.id}
                                </ColumnPreview>
                              ))}
                            </ContainerPreview>
                          </div>
                        )}
                    </React.Fragment>
                  );
                })}
              </>
            ) : (
              <>
                {preview && (
                  <div
                  ref={(el)=>setGhost(el)}
                    className="preview opacity-70 "
                    key="ghost-end1"
                    data-drop="SECTION"
                    id={preview.container.id}
                  >
                    <ContainerPreview
                      element={preview}
                      id={preview.container.id}
                    >
                      {preview.columns.map((c, i) => {
                        return (
                          <ColumnPreview
                            key={c.id}
                            element={c}
                            id={{ conID: preview.container.id, colID: c.id }}
                          >
                            {c.id}
                          </ColumnPreview>
                        );
                      })}
                    </ContainerPreview>
                  </div>
                )}
              </>
            )}
          </SortableContext>
          <DragOverlay
            dropAnimation={{
              duration: 220,
              easing: "cubic-bezier(.2,.7,.3,1)",
            }}
          >
            {activeID &&
              activeItem &&
              ((typeof activeID === "string" && (
                <ContainerPreview element={activeItem} id={activeID}>
                  {activeItem.columns.map((c) => (
                    <ColumnPreview
                      key={c.id}
                      element={c}
                      id={{ conID: activeID, colID: c.id }}
                    >
                      {c.elements.length === 0 ? (
                        <>{c.id}</>
                      ) : (
                        <div>
                          {c.elements.map((ele) => (
                            <ElementPreview
                              element={ele}
                              key={ele.id}
                            ></ElementPreview>
                          ))}
                        </div>
                      )}
                    </ColumnPreview>
                  ))}
                </ContainerPreview>
              )) ||
                (typeof activeID === "object" && !activeID.eleID && (
                  <ColumnPreview element={activeItem} id={activeID}>
                    {activeItem.elements.length === 0 ? (
                      <>{activeID.colID}</>
                    ) : (
                      <div>
                        {activeItem.elements.map((ele) => (
                          <ElementPreview
                            element={ele}
                            key={ele.id}
                          ></ElementPreview>
                        ))}
                      </div>
                    )}
                  </ColumnPreview>
                )) ||
                (typeof activeID === "object" && activeID.eleID && (
                  <ElementPreviewForDrag_Drop element={activeItem}></ElementPreviewForDrag_Drop>
                )))}
          </DragOverlay>
        </div>
      </DndContext>

      {modal && <ConfirmModal data={modal} close={openModal} />}

      <style>{`
                html.dragging, html.dragging * {
                  cursor: grabbing !important;

                }

                .sortable-grab {cursor: grab;}
                .sortable-grab * { cursor: inherit; }


                .column-area:focus{
                  outline: none !important;
                  box-shadow: none !important;
                  border-color: inherit !important;
                }

                .content-area:focus{
                  outline: none !important;
                  box-shadow: none !important;
                  border-color: none !important;
                }

                .container-area:focus{
                  outline: none !important;
                  box-shadow: none !important;
                  border-color: inherit !important;
                }
            `}</style>
    </main>
  );


  function OptionButtonGroup({
    element,
    clone,
    id,
    remove,
    offcavanas,
    onUpdate,
    modal,
    changeSizeColumn = null,
  }) {
    return (
      <div className="flex items-center justify-center absolute -top-px -left-px" data-drop="COLUMN-BTN" onMouseMove={(e)=>{
        scheduleDND(e)
      }}>
        {offcavanas === "Column" && (
          <button
            className="bg-gray-900  text-white px-[3px] py-1"
            onMouseEnter={() => setDisableColDrag(false)}
            onMouseOver={() => setDisableColDrag(false)}
            onMouseLeave={() => setDisableColDrag(true)}
          >
            <Move className="size-4 m-[5px]" />
          </button>
        )}
        <button
          className=" bg-gray-900  text-white  px-[3px] py-1"
          onClick={() => openOffcavanas(offcavanas, element, onUpdate)}
        >
          <Settings className="size-4 m-[5px]" />
        </button>

        <button
          className=" bg-gray-900   text-white px-[3px] py-1"
          onClick={() => clone(id)}
        >
          <Copy className="size-4 m-[5px]" />
        </button>
        {offcavanas === "Column" && (
          <>
            <button
              className=" bg-gray-900  text-white px-[3px] py-1"
              onClick={() => changeSizeColumn(id, "-")}
            >
              <Minus className="size-4 m-[5px]" />
            </button>
            <button
              className=" bg-gray-900  text-white px-[3px] py-1"
              onClick={() => changeSizeColumn(id, "+")}
            >
              <Plus className="size-4 m-[5px]" />
            </button>
          </>
        )}
        <button className=" bg-gray-900  text-white px-[3px] py-1">
          <Trash2
            className="size-4 m-[5px]"
            onClick={() => modal({ id: id, funct: remove })}
          />
        </button>
      </div>
    );
  }

  function ConfirmModal({ data, close }) {
    if (!data) return <></>;

    const { id, funct } = data;

    let elementName;

    if (typeof id === "object") {
      elementName = "Element";

      elementName = "Column";
    } else {
      elementName = "Section";
    }

    const [open, setOpen] = useState(true);

    if (!open) setTimeout(() => close(), 200);

    return (
      <Modal
        open={open}
        onClose={(_, resson) => {
          setOpen(false);
        }}
        aria-labelledby="basic-modal-title"
        aria-describedby="basic-modal-desc"
        slotProps={{ backdrop: { timeout: 200 } }}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
      >
        <Fade in={open} timeout={200} onExited={close}>
          <Box
            sx={{
              position: "relative",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              height: "auto",
              backgroundColor: "white",
              borderRadius: 3,
            }}
            container={document.getElementById("app-root")}
          >
            <div className="flex justify-between px-4 pt-3 pb-1">
              <div className="text-[15px] font-bold">
                <span className="text-red-600 dark:text-emerald-300">
                  Delete
                </span>{" "}
                {elementName}
              </div>
              <div>
                <a onClick={() => setOpen(false)} style={{ cursor: "pointer" }}>
                  X
                </a>
              </div>
            </div>
            <div
              className={`border-b border-dotted border-gray-500/50 flex-1`}
            ></div>
            <div className="flex justify-center mt-4 text-[13px] ">
              คุณต้องการลบ {elementName} นี้ใช่หรือไม่?
            </div>

            <div className="flex justify-center my-4 pb-5">
              <Button
                sx={{
                  backgroundColor: "#B91C1C",
                  color: "white",
                  fontSize: 13,
                  fontWeight: "normal",
                  height: 25,
                  padding: "15px 12px",
                  marginRight: 1,
                }}
                onClick={() => {
                  setTimeout(() => {
                    funct(id);
                  }, 200);
                  setOpen(false);
                }}
              >
                ใช่... ฉันต้องการลบ
              </Button>
              <Button
                sx={{
                  backgroundColor: "#333",
                  color: "white",
                  fontSize: 13,
                  fontWeight: "normal",
                  height: 25,
                  padding: "15px 12px",
                  marginLeft: 1,
                }}
                onClick={() => setOpen(false)}
              >
                ยกเลิก
              </Button>
            </div>
          </Box>
        </Fade>
      </Modal>
    );
  }
};

export default Content;
