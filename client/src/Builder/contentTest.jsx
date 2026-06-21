import React, { useEffect, useMemo, useState, useRef, use } from "react";
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
  Copy,
  Trash2,
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
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import lodash, { set } from "lodash";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

import { getPage } from "../../Functions/pages";
import { getTheme } from "../../Functions/theme";

const Content = ({
  handleDropElement,
  getPageName,
  openOffcavanas,
  offcanvasID,
}) => {
  const [page, setPage] = useState(null);
  const [theme, setTheme] = useState(null);
  const [layouts, setLayout] = useState([]);
  const [hover, setHover] = useState(null);
 

  const loadPage = () => {
    getPage("68d2af32dd121faca15fdb57").then((res) => {
      setPage(res.data);
      getPageName(res.data.pageName);
    });
  };

  useEffect(() => {
    loadPage();
  }, []);

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

  const opacity_2_hex = (opcy)=>{
    const hex = opcy.toString(16).toUpperCase().padStart(2,0);
    return hex;
  }

  const updateContainer = (data, id) => {

    setLayout((prev)=>{
      const newLayouts = lodash.cloneDeep(prev);
      const idx = newLayouts.findIndex((l) => l.container.id === id);
      newLayouts[idx].container = data;
      return newLayouts;
    })
  };



  

  const cloneContainer = (id) => {

    setLayout((prev)=>{
      
      const idx = layouts.findIndex((l) => l.container.id === id);
      const newLayouts = lodash.cloneDeep(prev);
      const newLayout = lodash.cloneDeep(prev[idx]);
      newLayout.container.id = `Sec-${page.latestID}`;
      newLayout.columns.map((col)=>{
        const colIDPaths = col.id.split("-");
        col.id = `Col-${page.latestID}-${colIDPaths[2]}`;
      })
      newLayouts.splice(idx + 1, 0, newLayout);


      return newLayouts;

      
    })

    page.latestID += 1;
  };

  const deleteContainer = (id) => {


    setLayout((prev)=>{
      const newLayouts = lodash.cloneDeep(prev);
      const idx = newLayouts.findIndex((l) => l.container.id === id);
      newLayouts.splice(idx, 1);
      return newLayouts;
    })
    if (id === offcanvasID) {
      openOffcavanas(null, null, null);
    }

  };


  const change_container_position = (oldIndex,newIndex)=>{

    setLayout((prev)=>{
      const newLayouts = lodash.cloneDeep(prev)
      const [layout] = newLayouts.splice(oldIndex,1)
      newLayouts.splice(newIndex,0,layout)
      return newLayouts
    })
  }

  const drag_drop_container = (result)=>{
    const { destination, source } = result;
    if(!destination) return
    if (destination.index === source.index) return
    
    change_container_position(source.index, destination.index)

  }


  const updateColumn = (data, id) => {

   setLayout((prev)=>{
     const newLayouts = [...prev]
     const IDX = newLayouts.findIndex((l) => l.container.id === `Sec-${id.split("-")[1]}`);
     const newLayout = {...newLayouts[IDX]}
     const newColumns = [...newLayout.columns]
     const idx = newColumns.findIndex(c=>c.id === id)
     const newColumn = {...data}
     newColumns[idx] = newColumn
     console.log(newColumns[idx]);
     newLayout.columns = newColumns
     newLayouts[IDX] = newLayout
     return newLayouts;
   })


  };


  const cloneColumn = (id)=>{


    let IDX

    setLayout((prev)=>{
      const newLayouts = [...prev]
      IDX = newLayouts.findIndex(l=>l.container.id === `Sec-${id.split("-")[1]}`)
    const newLayout = {...newLayouts[IDX]}
    const newColumns = [...newLayout.columns]
    const idx = newColumns.findIndex(c=>c.id === id)
    const newColumn = {...newColumns[idx]}
    const idPaths =  newColumn.id.split("-")
    newColumn.id = `Col-${idPaths[1]}-${newLayout.container.latestColID}`
    newColumns.splice(idx+1,0,newColumn)
    newLayout.columns = newColumns
    newLayouts.splice(IDX,1,newLayout)

    return newLayouts
    })


    layouts[IDX].container.latestColID++

    
  }

  const deleteColumn = (id)=>{
    setLayout((prev)=>{
      const newLayouts = [...prev]
      const IDX = newLayouts.findIndex(l=>l.container.id === `Sec-${id.split("-")[1]}`)
    const newLayout = {...newLayouts[IDX]}
    const newColumns = [...newLayout.columns]
    const idx = newColumns.findIndex(c=>c.id === id)
    newColumns.splice(idx,1)
    newLayout.columns = newColumns
    newLayouts.splice(IDX,1,newLayout)
    return newLayouts
    })
  }



  return (
    <main
      className="flex-1 overflow-y-auto p-4 sm:p-6 "
      onDrop={() => {
        const layout = handleDropElement();
        if (layout.container) {
          layout.container.id += page.latestID;
          for (let i = 0; i < 3; i++) {
            layout.columns[i].id += `${page.latestID}-${i}`;
          }
          page.latestID += 1;
        }
        setLayout([...layouts, layout]);
      }}
      onDragOver={(e) => e.preventDefault()}
    >
      {/* Canvas สำหรับวาง element */}

   
          <div className="min-h-[600px] rounded-xl border border-white/10 bg-white/5" >

          {layouts.length > 0 &&
layouts.map((layout, I) => {
  const { container, columns } = layout;
  const fluid = container.isFluid ? "w-full" : "container";
  const containerTailwind = `${fluid} mx-auto relative z-10`;
  const paddingTop = container.paddingTop ? container.paddingTop : 0;
  const paddingBottom = container.paddingBottom
    ? container.paddingBottom
    : 0;
    let color


    if(container.isGradient){

      const color1 = typeof container.backgroundColorGradient[0] === "string"
      ? container.backgroundColorGradient[0] + opacity_2_hex(container.opacityColorGradient[0])
      : theme[container.backgroundColorGradient[0].type][container.backgroundColorGradient[0].index] + opacity_2_hex(container.opacityColorGradient[0])

      const color2 = typeof container.backgroundColorGradient[1] === "string"
      ? container.backgroundColorGradient[1] + opacity_2_hex(container.opacityColorGradient[1])
      : theme[container.backgroundColorGradient[1].type][container.backgroundColorGradient[1].index] + opacity_2_hex(container.opacityColorGradient[1])

      color = `linear-gradient(${container.degrees}deg, ${color1} 0%, ${color2} 100%)`

    }
    else{
      const opcyColor = opacity_2_hex(container.opacityColor)
      color = typeof container.backgroundColor === "string"
        ? container.backgroundColor
        : theme[container.backgroundColor.type][container.backgroundColor.index];

      color += opcyColor;
    }

    const {backgroundImage,opacityImage} = container

    const BgImage = ()=>{
      if(backgroundImage){
        return(<div className=" absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-0" style={{ backgroundImage:`url(${backgroundImage})`,opacity:opacityImage}}/>)
      }else{
        return(<></>)
      }
    }
 


  return (

       
             
                      <div
          
                      className={`${hover === container.id ?"border-[2px]":"border-[1px]"}  border-dashed border-gray-600 relative`}
                      onMouseEnter={() => setHover(container.id)}
                      onMouseLeave={() => setHover(null)}
                      style={{ background: color}}
                    >
                      {hover === container.id && (
                        <div
                          className="relative z-20"
                          onMouseEnter={() => setHover(container.id)}
                        >
                          <ButtonGroup
                            element={container}
                            clone={cloneContainer}
                            id={container.id}
                            remove={deleteContainer}
                            offcavanas="Container"
                            onUpdate={updateContainer}
                          />
                        </div>
                      )}
                
                      <BgImage/>
                      <div
                        className={containerTailwind}
                        onMouseEnter={() => setHover(container.id)}
                        onMouseLeave={() => setHover(null)}
                        style={{
                          paddingTop: paddingTop,
                          paddingBottom: paddingBottom,
                        }}
                      >
                        
                        <div
                          className={`grid grid-cols-3 py-5 gap-4 justify-center ${
                            hover === container.id ? "pt-[40px]" : ""
                          }`}
                          onMouseEnter={() => setHover(container.id)}
                          onMouseLeave={() => setHover(null)}
                        >
                          {columns.map((col, i) => {

                            let {paddingX,paddingY,borderRadius,borderWidth,borderColor,borderOpacity,backgroundColorGradient,backgroundColor,degrees,opacityColor,opacityColorGradient} = col


                            
                            let color

                            borderColor = typeof borderColor === "object"
                            ? theme[borderColor.type][borderColor.index] + opacity_2_hex(borderOpacity)
                            : borderColor+ opacity_2_hex(borderOpacity)

                            if(col.isGradient){

                              const color1 = typeof backgroundColorGradient[0] === "string"
                              ? backgroundColorGradient[0] + opacity_2_hex(opacityColorGradient[0])
                              : theme[backgroundColorGradient[0].type][backgroundColorGradient[0].index] + opacity_2_hex(opacityColorGradient[0])
                        
                              const color2 = typeof backgroundColorGradient[1] === "string"
                              ? backgroundColorGradient[1] + opacity_2_hex(opacityColorGradient[1])
                              : theme[backgroundColorGradient[1].type][backgroundColorGradient[1].index] + opacity_2_hex(opacityColorGradient[1])
                        
                              color = `linear-gradient(${degrees}deg, ${color1} 0%, ${color2} 100%)`
                        
                            }
                            else{
                              const opcyColor = opacity_2_hex(opacityColor)
                              color = typeof backgroundColor === "string"
                                ? backgroundColor
                                : theme[backgroundColor.type][backgroundColor.index];
                        
                              color += opcyColor;
                            }
                            
                           

                            return(
                              <div
                                key={i}
                                onMouseEnter={() => setHover(col.id)}
                            onMouseLeave={() => setHover(container.id)}
                                className="col col-span-1 border-[1px] hover:border-[2px] border-dashed border-gray-600 flex h-[200px] justify-center items-center text-center relative p-1"
                          
                              >
                                 {hover === col.id && (
                          <div
                            className="z-20"
                            onMouseEnter={() => setHover(col.id)}
                          >
                            <ButtonGroup
                              element={col}
                              clone={cloneColumn}
                              id={col.id}
                              remove={deleteColumn}
                              offcavanas="Column"
                              onUpdate={updateColumn}
                            />
                          </div>
                        )}

                                <div className="w-full h-full flex items-center justify-center" style={{borderRadius:borderRadius,borderWidth:borderWidth,padding:`${paddingX}px ${paddingY}px`,borderColor:borderColor,background:color}}>{col.id}</div>
                                </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
            
       
 
  );
})}



          </div>


      



    </main>
  );

  function ButtonGroup({ element, clone, id, remove ,offcavanas,onUpdate}) {
    return (
      <div className="flex items-center justify-center absolute -top-px -left-px">
        <button
          className=" bg-gray-900  text-white  px-[3px] py-1"
          onClick={() => openOffcavanas(offcavanas, element, onUpdate)}
        >
          <Settings className="size-4 m-[5px]" />
        </button>
        <button className=" bg-gray-900  text-white px-[3px] py-1">
          <Trash2 className="size-4 m-[5px]" onClick={() => remove(id)} />
        </button>
        <button
          className=" bg-gray-900   text-white px-[3px] py-1"
          onClick={() => clone(id)}
        >
          <Copy className="size-4 m-[5px]" />
        </button>
      </div>
    );
  }
};

export default Content;
