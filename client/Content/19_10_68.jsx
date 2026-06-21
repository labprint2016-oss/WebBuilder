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
import lodash, { isNull } from "lodash";
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
}) => {
  // useState
  const [page, setPage] = useState(null);
  const [theme, setTheme] = useState(null);
  const [layouts, setLayout] = useState([]);

  // UI
  const [hover, setHover] = useState(null);
  const [activeID, setActiveID] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [modal, setModal] = useState(null);
  const [preview, setPreview] = useState(null);

  // DnD / disable
  const [isDraggingLayout, setIsDraggingLayout] = useState(false);
  const [disableConDrag, setDisableConDrag] = useState(true);
  const [disableColDrag, setDisableColDrag] = useState(true);
  const [disableEleDrag, setDisableEleDrag] = useState(true);

  // for delete
  const [deleteID, setDeleteID] = useState(null);

  // Refs
  const ghostRef = useRef(null);
  const dragRef = useRef(null);

  const [dropTarget, setDropTarget] = useState(null);
  const dropTargetRef = useRef(null);

  const hoverRef = useRef(null);
  const dndRef = useRef(null);
  const btnGroupRef = useRef(null);

  const positionRef = useRef(null);
  const dragToken = useRef(0);

  const contained = useRef([]);
  const columned = useRef([]);

  // กันซ้ำ
  const droppingRef = useRef(false);
  const committingRef = useRef(false);

  const setDrop = (value) => {
    dropTargetRef.current = value;
    setDropTarget(value);
  };

  // effects
  useEffect(() => {
    loadPage();
  }, []);
  useEffect(() => {
    loadTheme();
  }, []);

  useEffect(() => {
    const handleDeleteElementKey = (e) => {
      const { key } = e;
      if ((key === "Delete" || key === "Backspace") && deleteID) {
        deleteElement(deleteID);
      }
    };
    window.addEventListener("keydown", handleDeleteElementKey);
    return () => window.removeEventListener("keydown", handleDeleteElementKey);
  }, [deleteID]);

  // ถ้า drag จบ แต่ drop ไม่มา ให้ commit ถ้าเงื่อนไขครบ
  useEffect(() => {
    if (!preview) return;
    const onDragEnd = () => {
      commitIfPossible();
    };
    window.addEventListener("dragend", onDragEnd, { capture: true });
    return () => window.removeEventListener("dragend", onDragEnd, { capture: true });
  }, [preview, layouts, page]);

  // loaders
  const loadPage = () => {
    getPage("68d2af32dd121faca15fdb57").then((res) => {
      setPage(res.data);
      getPageName(res.data.pageName);
    });
  };
  const loadTheme = () => {
    getTheme("68d37327bedb0efab7dacafb")
      .then((res) => setTheme(res.data))
      .catch((err) => console.log(err));
  };

  // utils
  const opacity_2_hex = (opcy) => opcy.toString(16).toUpperCase().padStart(2, 0);
  const setFont = (font) => {
    let isFirst = false;
    const cutFont_ = font.replace("font-", "");
    let newFont = "";
    for (let i = 0; i < cutFont_.length; i++) {
      if (cutFont_[i] === "-" && !isFirst) {
        newFont += " ";
        isFirst = true;
      } else if (cutFont_[i] === "-" && isFirst) {
        newFont += "";
      } else if ((cutFont_[i] !== "-" && isFirst) || i === 0) {
        newFont += cutFont_[i].toUpperCase();
        isFirst = false;
      } else {
        newFont += cutFont_[i];
      }
    }
    return newFont;
  };

  const updateHoverPosition = (x, y) => {
    const el = document.elementFromPoint(x, y);
    const column = el?.closest(`[data-drop="COLUMN"]`);
    const section = el?.closest(`[data-drop="SECTION"]`);
    const element = el?.closest(`[data-drop="ELEMENT"]`);
    if (!section && !column && !element) {
      setHover(null);
      return;
    }
    if (section && (column || element)) {
      if (column) {
        let [_, id] = column.getAttribute("id").split("/");
        if (!id) {
          id = column.getAttribute("id");
          setHover(id);
        } else {
          setHover(_);
        }
        return "col";
      } else {
        const id = section.getAttribute("id");
        setHover(id);
        return "sec";
      }
    } else if (section && !column && !element) {
      const id = section.getAttribute("id");
      setHover(id);
      return "sec";
    }
  };

  const setDragRef = (el) => {
    if (preview) return;
    dragRef.current = el || null;
  };

  const updateDND = (x, y) => {
    if (isDraggingLayout) {
      setDisableConDrag(false);
      setDisableEleDrag(false);
      return;
    }
    const el = document.elementFromPoint(x, y);
    const section = el?.closest(`[data-drop="SECTION"]`);
    const column = el?.closest(`[data-drop="COLUMN"]`);
    const element = el?.closest(`[data-drop="ELEMENT"]`);

    if (!section) {
      setDisableConDrag(true);
      setDisableEleDrag(true);
      return;
    }

    if (section && !column && !element) {
      setDisableConDrag(false);
      setDisableEleDrag(true);
    } else if (section && column && !element) {
      const conID = section.id;
      if (isNull(conID)) return;
      const colID = column.id;
      if (isNull(colID)) return;
      const conI = layouts.findIndex((l) => l.container.id === conID);
      if (conI === -1) return;
      const colI = layouts[conI].columns.findIndex((c) => c.id === colID);
      if (colI === -1) return;
      const isHasElements = layouts[conI].columns[colI].elements.length > 0;
      if (!isHasElements) {
        setDisableConDrag(false);
        setDisableEleDrag(true);
      } else if (isHasElements) {
        const id = column.getAttribute("id");
        if (id.startsWith("Sec-")) {
          setDisableConDrag(false);
          setDisableEleDrag(true);
        } else {
          setDisableConDrag(true);
          setDisableEleDrag(true);
        }
      }
    } else if (section && column && element) {
      const conID = section.id;
      if (isNull(conID)) return;
      const colID = column.id;
      if (isNull(colID)) return;
      const conI = layouts.findIndex((l) => l.container.id === conID);
      if (conI === -1) return;
      const colI = layouts[conI].columns.findIndex((c) => c.id === colID);
      if (colI === -1) return;
      const isHasElements = layouts[conI].columns[colI].elements.length > 0;
      if (!isHasElements) {
        setDisableConDrag(false);
        setDisableEleDrag(true);
      } else if (isHasElements) {
        setDisableConDrag(true);
        setDisableEleDrag(false);
      }
    }
  };

  const scheduleDND = (e) => {
    const { clientX, clientY } = e;
    if (dndRef.current) return;
    dndRef.current = requestAnimationFrame(() => {
      dndRef.current = null;
      updateDND(clientX, clientY);
    });
  };

  const scheduleBTNUpdate = (e) => {
    const { clientX, clientY } = e;
    if (btnGroupRef.current) return;
    btnGroupRef.current = requestAnimationFrame(() => {
      btnGroupRef.current = null;
      return updateHoverPosition(clientX, clientY);
    });
  };

  // ====== COMMIT HELPERS (สำคัญสุดสำหรับ “วางไม่ติด”) ======
  const commitIfPossible = () => {
    if (committingRef.current) return;
    if (!preview || !dropTargetRef.current) return;

    const target = dropTargetRef.current;
    const incoming = handleDropElement?.();
    if (!incoming) {
      clearGhost();
      return;
    }

    committingRef.current = true;
    try {
      const newLayouts = lodash.cloneDeep(layouts);

      if (target.type === "SECTION" && incoming.container) {
        const newContainer = lodash.cloneDeep(incoming);
        newContainer.container.id += page.latestID;
        for (let i = 0; i < 3; i++) {
          newContainer.columns[i].id += `${page.latestID}-${i}`;
        }
        newLayouts.splice(target.index, 0, newContainer);
        setPage((prev) => ({ ...prev, latestID: prev.latestID + 1 }));
        setLayout(newLayouts);
        clearGhost();
        return;
      }

      if (target.type === "ELEMENT" && !incoming.container) {
        const newElement = lodash.cloneDeep(incoming);
        newElement.id += Math.ceil(Math.random() * 1e9).toString(36);
        const { conI, colI, eleI } = target.index || {};
        if (
          Number.isInteger(conI) &&
          Number.isInteger(colI) &&
          Number.isInteger(eleI)
        ) {
          newLayouts[conI].columns[colI].elements.splice(eleI, 0, newElement);
          setLayout(newLayouts);
          clearGhost();
          return;
        }
      }
    } finally {
      // ป้องกันค้าง
      setTimeout(() => {
        committingRef.current = false;
        droppingRef.current = false;
      }, 0);
    }
  };
  // ===========================================================

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (droppingRef.current) return;

    droppingRef.current = true;
    commitIfPossible();
  };

  const handleDuring = (e, dataDrop = null) => {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
    if (!dataDrop) return;

    const incoming = handleDropElement?.();
    if (!incoming) return;

    let newPreview = null;

    if (dataDrop?.type === "SECTION") {
      if (!incoming.container) {
        setDrop(null);
        setPreview(null);
        return;
      }
      newPreview = lodash.cloneDeep(incoming);
      newPreview.container.id += page?.latestID ?? 0;
      for (let i = 0; i < 3; i++) {
        newPreview.columns[i].id += `${page?.latestID ?? 0}-${i}`;
      }
    }

    if (dataDrop?.type === "ELEMENT") {
      if (incoming.container) {
        setDrop(null);
        setPreview(null);
        return;
      }
      newPreview = lodash.cloneDeep(incoming);
    }

    setDrop(dataDrop);
    setPreview(newPreview);
  };

  const clearGhost = () => {
    if (hoverRef.current) {
      cancelAnimationFrame(hoverRef.current);
      hoverRef.current = null;
    }
    dragToken.current += 1;
    setPreview(null);
    setDrop(null);
    dropTargetRef.current = null;
  };

  const setColRef = (IDX, idx, el) => {
    if (isNull(IDX) || isNull(idx)) return;
    if (!columned.current[IDX]) columned.current[IDX] = [];
    columned.current[IDX][idx] = el || null;
    if (columned.current[IDX][idx] === null) {
      columned.current[IDX].splice(idx, 1);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  const containerIds = useMemo(
    () => layouts.map((l) => String(l.container.id)),
    [layouts]
  );

  const measuring = {
    droppable: {
      strategy: MeasuringStrategy.Always,
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

  // update/clone/delete container/column/element … (คงเดิม)
  const updateContainer = (data, id) => {
    setLayout((prev) => {
      const newLayouts = lodash.cloneDeep(prev);
      const idx = newLayouts.findIndex((l) => l.container.id === id);
      newLayouts[idx].container = data;
      return newLayouts;
    });
  };

  const cloneContainer = (id) => {
    setLayout((prev) => {
      const idx = layouts.findIndex((l) => l.container.id === id);
      const newLayouts = lodash.cloneDeep(prev);
      const newLayout = lodash.cloneDeep(prev[idx]);
      newLayout.container.id = `Sec-${page.latestID}`;
      let latestColID = 0;
      newLayout.columns.map((col) => {
        col.id = `Col-${page.latestID}-${latestColID++}`;
        col.elements.map((e) => {
          e.id = e.id.split("-")[0] + "-" + Math.ceil(Math.random() * 1e9).toString(36);
        });
      });
      newLayout.container.latestColID = latestColID;
      newLayouts.splice(idx + 1, 0, newLayout);
      return newLayouts;
    });

    setPage((prev) => ({ ...prev, latestID: prev.latestID + 1 }));
  };

  const deleteContainer = (id) => {
    const idx = layouts.findIndex((l) => l.container.id === id);
    if (idx === -1) return;
    if (Array.isArray(columned.current)) {
      columned.current.splice(idx, 1);
    }
    contained.current.splice(idx, 1);

    setLayout((prev) => {
      const newLayouts = lodash.cloneDeep(prev);
      newLayouts.splice(idx, 1);
      return newLayouts;
    });
    if (id === offcanvasID) openOffcavanas(null, null, null);
  };

  const updateColumn = (data, id, conID) => {
    setLayout((prev) => {
      const newLayouts = [...prev];
      const IDX = newLayouts.findIndex((l) => l.container.id === conID);
      const newLayout = { ...newLayouts[IDX] };
      const newColumns = [...newLayout.columns];
      const idx = newColumns.findIndex((c) => c.id === id);
      const newColumn = { ...data };
      newColumns[idx] = newColumn;
      newLayout.columns = newColumns;
      newLayouts[IDX] = newLayout;
      return newLayouts;
    });
  };

  const cloneColumn = (id) => {
    const { conID, colID } = id;
    const newLayouts = lodash.cloneDeep(layouts);
    const IDX = newLayouts.findIndex((l) => l.container.id === conID);
    if (IDX === -1) return;
    const newLayout = lodash.cloneDeep(newLayouts[IDX]);
    newLayout.container.latestColID += 1;
    const newColumns = lodash.cloneDeep(newLayout.columns);
    const idx = newColumns.findIndex((c) => c.id === colID);
    const newColumn = lodash.cloneDeep(newColumns[idx]);
    const idPaths = newLayout.container.id.split("-");
    newColumn.id = `Col-${idPaths[1]}-${newLayout.container.latestColID}`;
    newColumn.elements.map((e) => {
      e.id = e.id.split("-")[0] + "-" + Math.ceil(Math.random() * 1e9).toString(36);
    });
    newColumns.splice(idx + 1, 0, newColumn);
    newLayout.columns = newColumns;
    newLayouts.splice(IDX, 1, newLayout);
    setLayout(newLayouts);
  };

  const deleteColumn = (id) => {
    const { conID, colID } = id;
    setLayout((prev) => {
      const newLayouts = [...prev];
      const IDX = newLayouts.findIndex((l) => l.container.id === conID);
      const newLayout = { ...newLayouts[IDX] };
      const newColumns = [...newLayout.columns];
      const idx = newColumns.findIndex((c) => c.id === colID);
      newColumns.splice(idx, 1);
      columned.current[IDX].splice(idx, 1);
      if (newColumns.length === 0) {
        newLayouts.splice(IDX, 1);
      } else {
        newLayout.columns = newColumns;
        newLayouts.splice(IDX, 1, newLayout);
      }
      return newLayouts;
    });
  };

  const deleteElement = (id) => {
    const { conID, colID, eleID } = id;
    setLayout((prev) => {
      const newLayouts = lodash.cloneDeep(prev);
      const IDX = newLayouts.findIndex((l) => l.container.id === conID);
      const idx = newLayouts[IDX].columns.findIndex((c) => c.id === colID);
      const newElements = newLayouts[IDX].columns[idx].elements;
      const i = newElements.findIndex((e) => e.id === eleID);
      newElements.splice(i, 1);
      return newLayouts;
    });
    setDeleteID(null);
  };

  const changeSizeColumn = (id, symbol) => {
    const { conID, colID } = id;
    const newLayouts = [...layouts];
    const IDX = newLayouts.findIndex((l) => l.container.id === conID);
    const newColumns = newLayouts[IDX].columns;
    const idx = newColumns.findIndex((c) => c.id === colID);
    const currentSize = newColumns[idx].size;
    if (symbol === "+" && currentSize < 12) newColumns[idx].size = currentSize + 1;
    else if (symbol === "-" && currentSize > 1) newColumns[idx].size = currentSize - 1;
    setLayout(newLayouts);
  };

  // ===== Sortables =====
  const SortableContainerItem = ({ id, elementData, children }) => {
    const index = layouts.findIndex((l) => l.container.id == id);
    const { setNodeRef, attributes, listeners, transform, transition, isDragging } =
      useSortable({ id, data: { type: "SECTION" }, animateLayoutChanges: noLayoutAnimWhileSorting });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition: isDragging ? undefined : transition,
      opacity: isDragging ? 0.7 : 1,
      willChange: "transform",
      touchAction: "none",
      cursor: "grab",
    };

    const {
      isFluid, paddingTop, paddingBottom, isGradient,
      opacityImage, opacityColor, opacityColorGradient,
      backgroundColor, backgroundColorGradient, backgroundImage,
      degrees,
    } = elementData;

    const fluid = isFluid ? "w-full" : "container";

    let color;
    if (isGradient) {
      const color1 =
        typeof backgroundColorGradient[0] === "string"
          ? backgroundColorGradient[0] + opacity_2_hex(opacityColorGradient[0])
          : theme[backgroundColorGradient[0].type][backgroundColorGradient[0].index] + opacity_2_hex(opacityColorGradient[0]);
      const color2 =
        typeof backgroundColorGradient[1] === "string"
          ? backgroundColorGradient[1] + opacity_2_hex(opacityColorGradient[1])
          : theme[backgroundColorGradient[1].type][backgroundColorGradient[1].index] + opacity_2_hex(opacityColorGradient[1]);
      color = `linear-gradient(${degrees}deg, ${color1} 0%, ${color2} 100%)`;
    } else {
      color =
        typeof backgroundColor === "string"
          ? backgroundColor + opacity_2_hex(opacityColor)
          : theme[backgroundColor.type][backgroundColor.index] + opacity_2_hex(opacityColor);
    }

    const BgImage = () =>
      backgroundImage ? (
        <div
          className=" absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-0"
          style={{ backgroundImage: `url(${backgroundImage})`, opacity: opacityImage }}
        />
      ) : null;

    return (
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        style={style}
        data-drop="SECTION"
        id={id}
        className="container-area"
        onPointerUp={commitIfPossible}
      >
        <div
          className={`border-[1px] border-dashed border-gray-600 relative`}
          style={{ background: color }}
          ref={(el) => { contained.current[index] = el || null; }}
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
          <div className={`${fluid} mx-auto relative z-10`} style={{ paddingTop, paddingBottom }}>
            <div
              className={`grid grid-cols-12 gap-4 `}
              onDragOver={(e) => { e.preventDefault(); handleDuring(e); }}
              onPointerUp={commitIfPossible}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SortableColumnItem = ({ id, containerId, elementData, children }) => {
    const hugeElementType = ["img", "yt", "gly"];
    const IDX = layouts.findIndex((l) => l.container.id === containerId);
    const idx = layouts[IDX].columns.findIndex((c) => c.id === id);

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
      useSortable({ id, data: { type: "COLUMN", conID: containerId }, animateLayoutChanges: noLayoutAnimWhileSorting });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition: isDragging ? undefined : transition,
      opacity: isDragging ? 0.7 : 1,
      willChange: "transform",
      touchAction: "none",
      cursor: "grab",
    };

    const {
      paddingX, paddingY, backgroundColor, backgroundColorGradient, borderColor,
      borderOpacity, borderRadius, borderWidth, degrees, isGradient,
      opacityColor, opacityColorGradient, size, elements,
    } = elementData;

    let color;
    if (isGradient) {
      const color1 =
        typeof backgroundColorGradient[0] === "string"
          ? backgroundColorGradient[0] + opacity_2_hex(opacityColorGradient[0])
          : theme[backgroundColorGradient[0].type][backgroundColorGradient[0].index] + opacity_2_hex(opacityColorGradient[0]);
      const color2 =
        typeof backgroundColorGradient[1] === "string"
          ? backgroundColorGradient[1] + opacity_2_hex(opacityColorGradient[1])
          : theme[backgroundColorGradient[1].type][backgroundColorGradient[1].index] + opacity_2_hex(opacityColorGradient[1]);
      color = `linear-gradient(${degrees}deg, ${color1} 0%, ${color2} 100%)`;
    } else {
      color =
        typeof backgroundColor === "string"
          ? backgroundColor + opacity_2_hex(opacityColor)
          : theme[backgroundColor.type][backgroundColor.index] + opacity_2_hex(opacityColor);
    }

    const brColor =
      typeof borderColor === "string"
        ? borderColor + opacity_2_hex(borderOpacity)
        : theme[borderColor.type][borderColor.index] + opacity_2_hex(borderOpacity);

    return (
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        style={style}
        className={`column-area col-span-${size}`}
        id={`${containerId}/${id}`}
        data-drop="COLUMN"
        onMouseMove={scheduleBTNUpdate}
        onPointerUp={commitIfPossible}
      >
        <div
          className={`column-area border-[1px] border-dashed border-gray-600 flex ${
            elementData.elements.length > 0 ||
            (dropTarget?.index?.colI === idx &&
              dropTarget?.index?.conI === IDX &&
              hugeElementType.includes(preview?.type))
              ? "min-h-[40px]"
              : "min-h-[200px]"
          } justify-center items-center text-center relative p-1`}
          ref={(el) => setColRef(IDX, idx, el)}
          data-drop="COLUMN"
          id={id}
          onDragOverCapture={(e) => {
            e.preventDefault();
            if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
            const incoming = handleDropElement?.();
            if (!incoming) { e.stopPropagation(); return; }
            if (incoming.container) { setDrop(null); setPreview(null); e.stopPropagation(); return; }
            if (elements.length === 0) {
              handleDuring(e, { index: { conI: IDX, colI: idx, eleI: 0 }, type: "ELEMENT" });
            }
          }}
          onPointerUp={commitIfPossible}
          onDragLeave={(e) => {
            const { clientX: x, clientY: y } = e;
            const r = e.currentTarget.getBoundingClientRect();
            const inside = r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
            if (!inside) { setDrop(null); setPreview(null); }
          }}
          onDropCapture={(e) => { handleDrop(e); e.stopPropagation(); }}
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
            onDragOver={(e) => { e.stopPropagation(); }}
            style={{
              borderRadius, borderWidth, padding: `${paddingY}px ${paddingX}px`,
              borderColor: brColor, background: color,
            }}
          >
            {children}
          </div>
        </div>
      </div>
    );
  };

  const SortableElementItem = ({
    id, containerId, columnId, elementData, children,
  }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
      useSortable({ id, data: { type: "ELEMENT", conID: containerId, colID: columnId }, animateLayoutChanges: noLayoutAnimWhileSorting });
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

    const headingColor = hoverElement.id === id ? theme.mainColor[1] : theme.mainColor[0];
    const opctText = hoverElement.id === id ? opacity_2_hex(100) : opacity_2_hex(255);

    const IDX = layouts.findIndex((l) => l.container.id === containerId);
    const idx = layouts[IDX].columns.findIndex((c) => c.id === columnId);
    const isElement = layouts[IDX].columns[idx].elements.length > 1;
    const nextI = layouts[IDX].columns[idx].elements.findIndex((e) => e.id === id) + 1;
    const isLastList = layouts[IDX].columns[idx].elements[nextI]?.type !== "list";

    useEffect(() => { if (isDragging) setDeleteID(null); }, [isDragging]);

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
          onMouseMove={scheduleBTNUpdate}
          onDragOver={(e) => { e.preventDefault(); handleDuring(e); }}
          onPointerUp={commitIfPossible}
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
        onDragOver={(e) => { e.preventDefault(); handleDuring(e); }}
        onPointerUp={commitIfPossible}
        onClick={(e) => {
          e.preventDefault();
          if (deleteID?.eleID === id) { setDeleteID(null); return; }
          setDeleteID({ conID: containerId, colID: columnId, eleID: id });
        }}
        onMouseMove={scheduleBTNUpdate}
        sx={{ alignItems: "center", justifyContent: "center" }}
      >
        {type === "img" && (
          <div className="relative inline-block w-full">
            <img
              src={elementData.src}
              onMouseEnter={() => setHoverElement({ id })}
              className={`${animationForElement} rounded-[8px]`}
            />
            <div className={`rounded-[8px] pointer-events-none absolute inset-0 ${deleteID?.eleID === id ? "bg-red-500/50" : "hidden"}`} />
          </div>
        )}
        {type === "yt" && (
          <div className="relative inline-block w-full">
            <img
              src={elementData.src}
              onMouseEnter={() => setHoverElement({ id })}
              className={`${animationForElement} rounded-[8px]`}
            />
            <div className="pointer-events-none absolute inset-0 grid place-items-center ">
              <div className="rounded-full w-[50px] h-[50px] grid place-items-center" style={{ backgroundColor: theme.mainColor[1] + opacity_2_hex(200) }}>
                <Play className="w-8 h-8 text-white" strokeWidth={0} aria-hidden="true" fill="white" />
              </div>
            </div>
            <div className={`rounded-[8px] pointer-events-none absolute inset-0 ${deleteID?.eleID === id ? "bg-red-500/50" : "hidden"}`} />
          </div>
        )}
        {type === "gly" && (
          <div className="relative inline-block w-full">
            <img
              src={elementData.src}
              onMouseEnter={() => setHoverElement({ id })}
              className={`${animationForElement} rounded-[8px]`}
            />
            <div className="pointer-events-none absolute inset-0 grid place-items-center ">
              <div className="rounded-full w-[50px] h-[50px] grid place-items-center" style={{ backgroundColor: theme.mainColor[1] + opacity_2_hex(200) }}>
                <Plus className="w-7 h-7 text-white" strokeWidth={5} aria-hidden="true" fill="white" />
              </div>
            </div>
            <div className={`rounded-[8px] pointer-events-none absolute inset-0 ${deleteID?.eleID === id ? "bg-red-500/50" : "hidden"}`} />
          </div>
        )}
        {type === "text" && (
          <div
            style={{ color: theme.textColor[0] + opctText, fontSize: 14, marginTop: 10, marginBottom: 10 }}
            className={`${theme.text.value} ${animationForElement} ${deleteID?.eleID === id ? " rounded-md border border-red-400 bg-red-300/10 p-2 border-dashed" : ""}`}
            onMouseEnter={() => setHoverElement({ id })}
            onMouseLeave={() => setHoverElement(false)}
          >
            {elementData.label}
          </div>
        )}
        {type === "heading" && (
          <div
            style={{ color: hoverElement.id === id ? theme.mainColor[1] : theme.mainColor[0], fontSize: 18, marginTop: 10, marginBottom: 10 }}
            className={`${theme.textHeading.value} ${animationForElement} ${deleteID?.eleID === id ? "rounded-md border border-red-400 bg-red-300/10 p-2 border-dashed" : ""}`}
            onMouseEnter={() => setHoverElement({ id })}
            onMouseLeave={() => setHoverElement(false)}
          >
            {elementData.label}
          </div>
        )}
        {type === "btn" && (
          <Box
            sx={{
              borderStyle: deleteID?.eleID === id ? "dashed" : "",
              borderWidth: deleteID?.eleID === id ? 1 : 0,
              borderColor: deleteID?.eleID === id ? "#f87171" : "",
              backgroundColor: deleteID?.eleID === id ? "#fca5a51a" : "",
              display: "inline-block",
              p: 0.5,
              lineHeight: 0,
              borderRadius: 2,
            }}
          >
            <Button
              variant="contained"
              disableElevation
              sx={{
                mt: 1, mb: 1, boxShadow: "none", backgroundColor: theme.mainColor[1],
                width: 101, height: 28, border: 0, m: 0, borderRadius: 2,
                fontSize: 13, fontFamily: setFont(theme.text.value), py: 2
              }}
              onMouseEnter={() => setHoverElement({ id })}
              onMouseLeave={() => setHoverElement(false)}
            >
              {elementData.label}
            </Button>
          </Box>
        )}
        {type === "divider" && (
          <div className={`${isElement ? "w-full" : "w-[100px]"} h-[0.5px] my-1`} style={{ backgroundColor: "#6a6a6a" }}
            onMouseEnter={() => setHoverElement({ id })}
            onMouseLeave={() => setHoverElement(false)}
          />
        )}
        {type === "btnG" && (
          <ButtonGroup
            aria-label="Basic button group"
            onMouseEnter={() => setHoverElement({ id })}
            onMouseLeave={() => setHoverElement(false)}
            sx={{
              borderRadius: 2,
              borderStyle: deleteID?.eleID === id ? "dashed" : "",
              borderWidth: deleteID?.eleID === id ? 1 : 0,
              borderColor: deleteID?.eleID === id ? "#f87171" : "",
              backgroundColor: deleteID?.eleID === id ? "#fca5a51a" : "",
              display: "inline-block", p: 0.5, lineHeight: 0
            }}
          >
            <Button variant="contained" disableElevation sx={{ mt: 1, mb: 1, boxShadow: "none", backgroundColor: theme.mainColor[1], width: 101, height: 28, border: 0, m: 0, borderRadius: 2, mr: 0.25, fontSize: 13, fontFamily: setFont(theme.text.value), py: 2 }}>Click 1</Button>
            <Button variant="contained" disableElevation sx={{ mt: 1, mb: 1, boxShadow: "none", backgroundColor: theme.mainColor[1], width: 101, height: 28, border: 0, m: 0, borderRadius: 2, ml: 0.25, fontSize: 13, fontFamily: setFont(theme.text.value), py: 2 }}>Click 2</Button>
          </ButtonGroup>
        )}
        {type === "icon" && (
          <div className="w-full flex items-center justify-center ">
            <div className="rounded-full size-[70px] flex items-center justify-center"
              style={{
                borderStyle: deleteID?.eleID === id ? "dashed" : "",
                borderWidth: deleteID?.eleID === id ? 1 : 0,
                borderColor: deleteID?.eleID === id ? "#f87171" : "",
                backgroundColor: deleteID?.eleID === id ? "#fca5a51a" : "",
              }}
            >
              <div className="rounded-full size-[60px] p-1 flex items-center justify-center" style={{ backgroundColor: theme.mainColor[0] }}>
                <ScanEye className=" text-white" size={38} />
              </div>
            </div>
          </div>
        )}
        {type === "list" && (
          <Box
            sx={{
              width: "100%", mx: 0, px: 0, py: 0, my: 0,
              borderStyle: deleteID?.eleID === id ? "dashed" : "",
              borderWidth: deleteID?.eleID === id ? 1 : 0,
              borderColor: deleteID?.eleID === id ? "#f87171" : "",
              backgroundColor: deleteID?.eleID === id ? "#fca5a51a" : "",
              borderRadius: 2
            }}
            onMouseEnter={() => setHoverElement({ id })}
            onMouseLeave={() => setHoverElement(false)}
          >
            <List dense sx={{ width: "100%", py: 0, my: 0.5 }}>
              <ListItem disablePadding>
                <ListItemAvatar sx={{ pl: 1 }}>
                  <div className="rounded-full size-[36px] p-1 flex items-center justify-center" style={{ backgroundColor: theme.mainColor[0] }}>
                    <ScanEye size={20} className="text-white" />
                  </div>
                </ListItemAvatar>
                <ListItemText
                  disableTypography
                  primary={<Typography sx={{ fontSize: 15, fontFamily: setFont(theme.textHeading.value), color: theme.mainColor[1] }}>What is Lorem Ipsum?</Typography>}
                  secondary={<Typography sx={{ fontSize: 13, fontFamily: setFont(theme.text.value), color: theme.textColor[0], fontWeight: 1 }}>Lorem Ipsum is simply dummy text of the typesetting industry.</Typography>}
                />
              </ListItem>
            </List>
            {(() => {
              const nextI = layouts[IDX].columns[idx].elements.findIndex((e) => e.id === id) + 1;
              const isLastList = layouts[IDX].columns[idx].elements[nextI]?.type !== "list";
              return !isLastList ? <Divider sx={{ borderStyle: "dotted", borderColor: "grey" }} /> : null;
            })()}
          </Box>
        )}
      </Box>
    );
  };

  // position helpers
  const change_column_position = (oldIndex, newIndex, containerIndex) => {
    setLayout((prev) => {
      const newLayouts = prev.map((l) => ({ ...l, columns: [...l.columns] }));
      const newColumns = newLayouts[containerIndex].columns;
      const [column] = newColumns.splice(oldIndex, 1);
      newColumns.splice(newIndex, 0, column);
      return newLayouts;
    });
  };

  const change_container_position = (oldIndex, newIndex) => {
    setLayout((prev) => {
      const newLayouts = lodash.cloneDeep(prev);
      const [layout] = newLayouts.splice(oldIndex, 1);
      newLayouts.splice(newIndex, 0, layout);
      return newLayouts;
    });
  };

  const change_element_position = (oldIndex, newIndex, containerIndex, columnIndex) => {
    const newLayouts = [...layouts];
    const newElements = newLayouts[containerIndex].columns[columnIndex].elements;
    const [element] = newElements.splice(oldIndex, 1);
    newElements.splice(newIndex, 0, element);
    setLayout(newLayouts);
  };

  const change_element_position_new_column = (oldIndex, newIndex, containerIndex, oldColumnIndex, newColumnIndex) => {
    const newLayouts = [...layouts];
    const oldElements = newLayouts[containerIndex].columns[oldColumnIndex].elements;
    const newElements = newLayouts[containerIndex].columns[newColumnIndex].elements;
    const [element] = oldElements.splice(oldIndex, 1);
    newElements.splice(newIndex, 0, element);
    setLayout(newLayouts);
  };

  const change_element_position_new_container = (oldIndex, newIndex, oldContainerIndex, newContainerIndex, oldColumnIndex, newColumnIndex) => {
    const newLayouts = [...layouts];
    const oldElements = newLayouts[oldContainerIndex].columns[oldColumnIndex].elements;
    const newElements = newLayouts[newContainerIndex].columns[newColumnIndex].elements;
    const [element] = oldElements.splice(oldIndex, 1);
    newElements.splice(newIndex, 0, element);
    setLayout(newLayouts);
  };

  // previews
  const ColumnPreview = ({ element, id, children }) => {
    const { paddingX, paddingY, backgroundColor, backgroundColorGradient, borderColor, borderOpacity, borderRadius, borderWidth, degrees, isGradient, opacityColor, opacityColorGradient, size, elements } = element;

    let color;
    if (isGradient) {
      const color1 =
        typeof backgroundColorGradient[0] === "string"
          ? backgroundColorGradient[0] + opacity_2_hex(opacityColorGradient[0])
          : theme[backgroundColorGradient[0].type][backgroundColorGradient[0].index] + opacity_2_hex(opacityColorGradient[0]);
      const color2 =
        typeof backgroundColorGradient[1] === "string"
          ? backgroundColorGradient[1] + opacity_2_hex(opacityColorGradient[1])
          : theme[backgroundColorGradient[1].type][backgroundColorGradient[1].index] + opacity_2_hex(opacityColorGradient[1]);
      color = `linear-gradient(${degrees}deg, ${color1} 0%, ${color2} 100%)`;
    } else {
      color =
        typeof backgroundColor === "string"
          ? backgroundColor + opacity_2_hex(opacityColor)
          : theme[backgroundColor.type][backgroundColor.index] + opacity_2_hex(opacityColor);
    }

    const brColor =
      typeof borderColor === "string"
        ? borderColor + opacity_2_hex(borderOpacity)
        : theme[borderColor.type][borderColor.index] + opacity_2_hex(borderOpacity);

    return (
      <div
        className={`col-span-${size} border-[1px] border-dashed border-gray-600 flex ${elements.length === 0 ? "h-[200px]" : "h-auto"} justify-center items-center text-center relative p-1`}
        onDragOver={(e) => { e.preventDefault(); handleDuring(e); }}
        onPointerUp={commitIfPossible}
      >
        <div
          className="w-full h-full flex items-center justify-center"
          style={{
            borderRadius, borderWidth, padding: `${paddingY}px ${paddingX}px`,
            borderColor: brColor, background: color,
          }}
        >
          {children}
        </div>
      </div>
    );
  };

  const ContainerPreview = ({ element, id, children }) => {
    const { container } = element;
    const { isFluid, paddingTop, paddingBottom, isGradient, opacityImage, opacityColor, opacityColorGradient, backgroundColor, backgroundColorGradient, backgroundImage, degrees } = container;

    const fluid = isFluid ? "w-full" : "container";

    let color;
    if (isGradient) {
      const color1 =
        typeof backgroundColorGradient[0] === "string"
          ? backgroundColorGradient[0] + opacity_2_hex(opacityColorGradient[0])
          : theme[backgroundColorGradient[0].type][backgroundColorGradient[0].index] + opacity_2_hex(opacityColorGradient[0]);
      const color2 =
        typeof backgroundColorGradient[1] === "string"
          ? backgroundColorGradient[1] + opacity_2_hex(opacityColorGradient[1])
          : theme[backgroundColorGradient[1].type][backgroundColorGradient[1].index] + opacity_2_hex(opacityColorGradient[1]);
      color = `linear-gradient(${degrees}deg, ${color1} 0%, ${color2} 100%)`;
    } else {
      color =
        typeof backgroundColor === "string"
          ? backgroundColor + opacity_2_hex(opacityColor)
          : theme[backgroundColor?.type][backgroundColor?.index] + opacity_2_hex(opacityColor);
    }

    const BgImage = () =>
      backgroundImage ? (
        <div className=" absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-0"
          style={{ backgroundImage: `url(${backgroundImage})`, opacity: opacityImage }} />
      ) : null;

    return (
      <div className="preview pointer-events-none border-dashed border-gray-600 relative" aria-hidden style={{ background: color }}
        onDragOver={(e) => { e.preventDefault(); handleDuring(e); }}
        onPointerUp={commitIfPossible}
      >
        <BgImage />
        <div className={`${fluid} mx-auto relative z-10`} onMouseEnter={() => setHover(id)} onMouseLeave={() => setHover(null)} style={{ paddingTop, paddingBottom }}>
          <div className={`grid grid-cols-12 py-5 gap-4 `} onMouseEnter={() => setHover(id)} onMouseLeave={() => setHover(null)}>
            {children}
          </div>
        </div>
      </div>
    );
  };

  const ElementPreview = ({ element }) => (
    <Box style={{ width: "100%", textAlign: "center" }}>
      {element.type === "img" && (
        <div className="relative inline-block w-full" ref={ghostRef}><img src={element.src} className="rounded-[8px]" /></div>
      )}
      {element.type === "yt" && (
        <div className="relative inline-block w-full" ref={ghostRef}>
          <img src={element.src} className="rounded-[8px]" />
          <div className="pointer-events-none absolute inset-0 grid place-items-center ">
            <div className="rounded-full w-[50px] h-[50px] grid place-items-center" style={{ backgroundColor: theme.mainColor[1] + opacity_2_hex(200) }}>
              <Play className="w-8 h-8 text-white" strokeWidth={0} aria-hidden="true" fill="white" />
            </div>
          </div>
        </div>
      )}
      {element.type === "gly" && (
        <div className="relative inline-block w-full" ref={ghostRef}>
          <img src={element.src} className="rounded-[8px]" />
          <div className="pointer-events-none absolute inset-0 grid place-items-center ">
            <div className="rounded-full w-[50px] h-[50px] grid place-items-center" style={{ backgroundColor: theme.mainColor[1] + opacity_2_hex(200) }}>
              <Plus className="w-7 h-7 text-white" strokeWidth={5} aria-hidden="true" fill="white" />
            </div>
          </div>
        </div>
      )}
      {element.type === "text" && (
        <div ref={ghostRef} style={{ color: theme.textColor[0], fontSize: 14, marginTop: 10, marginBottom: 10 }} className={`${theme.text.value}`}>{element.label}</div>
      )}
      {element.type === "heading" && (
        <div ref={ghostRef} style={{ color: theme.mainColor[0], fontSize: 18, marginTop: 10, marginBottom: 10 }} className={`${theme.textHeading.value}`}>{element.label}</div>
      )}
      {element.type === "btn" && (
        <Button ref={ghostRef} variant="contained" disableElevation sx={{ mt: 1, mb: 1, boxShadow: "none", backgroundColor: theme.mainColor[1], width: 101, height: 28, borderRadius: 2, fontSize: 13, fontFamily: setFont(theme.text.value), py: 2 }}>{element.label}</Button>
      )}
      {element.type === "divider" && (<div className="w-[100px] h-[0.5px] my-1" style={{ backgroundColor: "#6a6a6a" }} />)}
      {element.type === "btnG" && (
        <ButtonGroup aria-label="Basic button group" sx={{ borderRadius: 2 }} ref={ghostRef}>
          <Button variant="contained" disableElevation sx={{ mt: 1, mb: 1, boxShadow: "none", backgroundColor: theme.mainColor[1], width: 101, height: 28, border: 0, m: 0, borderRadius: 2, mr: 0.25, fontSize: 13, fontFamily: setFont(theme.text.value), py: 2 }}>Click 1</Button>
          <Button variant="contained" disableElevation sx={{ mt: 1, mb: 1, boxShadow: "none", backgroundColor: theme.mainColor[1], width: 101, height: 28, border: 0, m: 0, borderRadius: 2, ml: 0.25, fontSize: 13, fontFamily: setFont(theme.text.value), py: 2 }}>Click 2</Button>
        </ButtonGroup>
      )}
      {element.type === "icon" && (
        <div className="w-full flex items-center justify-center">
          <div className="rounded-full size-[60px] p-1 flex items-center justify-center" style={{ backgroundColor: theme.mainColor[0] }} ref={ghostRef}>
            <ScanEye className=" text-white" size={38} />
          </div>
        </div>
      )}
      {element.type === "list" && (
        <Box sx={{ width: "100%", mx: 0, px: 0, py: 0, my: 0, borderRadius: 2 }}>
          <List dense sx={{ width: "100%", py: 0, my: 0.5 }} ref={ghostRef}>
            <ListItem disablePadding>
              <ListItemAvatar sx={{ pl: 1 }}>
                <div className="rounded-full size-[36px] p-1 flex items-center justify-center" style={{ backgroundColor: theme.mainColor[0] }}>
                  <ScanEye size={20} className="text-white" />
                </div>
              </ListItemAvatar>
              <ListItemText
                disableTypography
                primary={<Typography sx={{ fontSize: 15, fontFamily: setFont(theme.textHeading.value), color: theme.mainColor[1] }}>What is Lorem Ipsum?</Typography>}
                secondary={<Typography sx={{ fontSize: 13, fontFamily: setFont(theme.text.value), color: theme.textColor[0], fontWeight: 1 }}>Lorem Ipsum is simply dummy text of the typesetting industry.</Typography>}
              />
            </ListItem>
          </List>
        </Box>
      )}
    </Box>
  );

  const ElementPreviewForDrag_Drop = ({ element }) => (
    <Box style={{ width: "100%", textAlign: "center" }}>
      {element.type === "img" && (
        <div className="relative inline-block w-full" ref={(el) => setDragRef(el)}><img src={element.src} className="rounded-[8px]" /></div>
      )}
      {element.type === "yt" && (
        <div className="relative inline-block w-full" ref={(el) => setDragRef(el)}>
          <img src={element.src} className="rounded-[8px]" />
          <div className="pointer-events-none absolute inset-0 grid place-items-center ">
            <div className="rounded-full w-[50px] h-[50px] grid place-items-center" style={{ backgroundColor: theme.mainColor[1] + opacity_2_hex(200) }}>
              <Play className="w-8 h-8 text-white" strokeWidth={0} aria-hidden="true" fill="white" />
            </div>
          </div>
        </div>
      )}
      {element.type === "gly" && (
        <div className="relative inline-block w-full" ref={(el) => setDragRef(el)}>
          <img src={element.src} className="rounded-[8px]" />
          <div className="pointer-events-none absolute inset-0 grid place-items-center ">
            <div className="rounded-full w-[50px] h-[50px] grid place-items-center" style={{ backgroundColor: theme.mainColor[1] + opacity_2_hex(200) }}>
              <Plus className="w-7 h-7 text-white" strokeWidth={5} aria-hidden="true" fill="white" />
            </div>
          </div>
        </div>
      )}
      {element.type === "text" && (
        <div ref={(el) => setDragRef(el)} style={{ color: theme.textColor[0], fontSize: 14, marginTop: 10, marginBottom: 10 }} className={`${theme.text.value}`}>{element.label}</div>
      )}
      {element.type === "heading" && (
        <div ref={(el) => setDragRef(el)} style={{ color: theme.mainColor[0], fontSize: 18, marginTop: 10, marginBottom: 10 }} className={`${theme.textHeading.value}`}>{element.label}</div>
      )}
      {element.type === "btn" && (
        <Button ref={(el) => setDragRef(el)} variant="contained" disableElevation sx={{ mt: 1, mb: 1, boxShadow: "none", backgroundColor: theme.mainColor[1], width: 101, height: 28, borderRadius: 2, fontSize: 13, fontFamily: setFont(theme.text.value), py: 2 }}>{element.label}</Button>
      )}
      {element.type === "divider" && (<div className="w-[100px] h-[0.5px] my-1" style={{ backgroundColor: "#6a6a6a" }} />)}
      {element.type === "btnG" && (
        <ButtonGroup aria-label="Basic button group" sx={{ borderRadius: 2 }} ref={(el) => setDragRef(el)}>
          <Button variant="contained" disableElevation sx={{ mt: 1, mb: 1, boxShadow: "none", backgroundColor: theme.mainColor[1], width: 101, height: 28, border: 0, m: 0, borderRadius: 2, mr: 0.25, fontSize: 13, fontFamily: setFont(theme.text.value), py: 2 }}>Click 1</Button>
          <Button variant="contained" disableElevation sx={{ mt: 1, mb: 1, boxShadow: "none", backgroundColor: theme.mainColor[1], width: 101, height: 28, border: 0, m: 0, borderRadius: 2, ml: 0.25, fontSize: 13, fontFamily: setFont(theme.text.value), py: 2 }}>Click 2</Button>
        </ButtonGroup>
      )}
      {element.type === "icon" && (
        <div className="w-full flex items-center justify-center">
          <div className="rounded-full size-[60px] p-1 flex items-center justify-center" style={{ backgroundColor: theme.mainColor[0] }} ref={(el) => setDragRef(el)}>
            <ScanEye className=" text-white" size={38} />
          </div>
        </div>
      )}
      {element.type === "list" && (
        <Box sx={{ width: "100%", mx: 0, px: 0, py: 0, my: 0, borderRadius: 2 }}>
          <List dense sx={{ width: "100%", py: 0, my: 0.5 }} ref={(el) => setDragRef(el)}>
            <ListItem disablePadding>
              <ListItemAvatar sx={{ pl: 1 }}>
                <div className="rounded-full size-[36px] p-1 flex items-center justify-center" style={{ backgroundColor: theme.mainColor[0] }}>
                  <ScanEye size={20} className="text-white" />
                </div>
              </ListItemAvatar>
              <ListItemText
                disableTypography
                primary={<Typography sx={{ fontSize: 15, fontFamily: setFont(theme.textHeading.value), color: theme.mainColor[1] }}>What is Lorem Ipsum?</Typography>}
                secondary={<Typography sx={{ fontSize: 13, fontFamily: setFont(theme.text.value), color: theme.textColor[0], fontWeight: 1 }}>Lorem Ipsum is simply dummy text of the typesetting industry.</Typography>}
              />
            </ListItem>
          </List>
        </Box>
      )}
    </Box>
  );

  // index helper (คงเดิม)
  const findElementIndexForDND = (conI, colI, conID, colID, eleID, active) => {
    let index = layouts[conI].columns[colI].elements.findIndex((e) => e.id === eleID);
    const elementNode = document.querySelector(`[data-drop="ELEMENT"][id="${conID}/${colID}/${eleID}"]`);
    if (!elementNode || !active?.rect?.current?.translated) return index;
    const r = elementNode.getBoundingClientRect();
    const { top, height } = r;
    const { top: topA, height: heightA } = active.rect.current.translated;
    const mid = top + height / 2;
    const midA = topA + heightA / 2;
    return index + (midA > mid ? 1 : 0);
  };

  // dnd-kit handlers (คงเดิม ยกเว้น onDragEnd เรียก commitIfPossible ใน window.useEffect แล้ว)
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
      positionRef.current = si;
      const element = column.elements.find((e) => e.id === id);
      setActiveItem(element);
      setActiveID({ conID: current.conID, colID: current.colID, eleID: id });
    }
  };

  const during = ({ active, over }) => {
    if (!over || !active) return;
    if (!over?.data?.current || !active?.data?.current) return;
    if (active.id === over.id) return;

    setIsDraggingLayout(true);

    const types = ["COLUMN", "ELEMENT"];
    if (!types.includes(over.data.current.type) || !types.includes(active.data.current.type)) return;

    const oldContainerID = active.data.current.conID;
    const newContainerID = over.data.current.conID;

    if (over.data.current.type === "ELEMENT" && active.data.current.type === "ELEMENT") {
      const oldColumnID = active.data.current.colID;
      const newColumnID = over.data.current.colID;
      const R = contained.current[positionRef.current]?.getBoundingClientRect();
      if (!R) return;
      const { bottom: sb, top: st } = R;
      if (!sb || !st) return;

      if (!dragRef.current) return;
      const { top: t, height: h, left: l, right: r } = dragRef.current.getBoundingClientRect();
      const mid = t + h / 2;

      if (oldColumnID === newColumnID && oldContainerID === newContainerID) {
        const IDX = layouts.findIndex((l) => l.container.id === oldContainerID);
        const idx = layouts[IDX].columns.findIndex((c) => c.id === oldColumnID);
        if (IDX === -1 || idx === -1) return;
        const oldIndex = layouts[IDX].columns[idx].elements.findIndex((e) => e.id === active.id);
        const newIndex = layouts[IDX].columns[idx].elements.findIndex((e) => e.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return;
        change_element_position(oldIndex, newIndex, IDX, idx);
      } else if (oldColumnID !== newColumnID && oldContainerID === newContainerID) {
        const IDX = layouts.findIndex((l) => l.container.id === oldContainerID);
        const idx1 = layouts[IDX].columns.findIndex((c) => c.id === oldColumnID);
        const idx2 = layouts[IDX].columns.findIndex((c) => c.id === newColumnID);
        if (IDX === -1 || idx1 === -1 || idx2 === -1) return;

        const oldIndex = layouts[IDX].columns[idx1].elements.findIndex((e) => e.id === active.id);
        if (oldIndex === -1) return;

        const rect2 = columned.current[IDX][idx2]?.getBoundingClientRect();
        if (!rect2) return;
        const { bottom: cb, top: ct, left: cl, right: cr } = rect2;

        let ok;
        if (idx2 < idx1) ok = mid > ct && mid < cb && l < cr - 10;
        else ok = mid > ct && mid < cb && r > cl + 10;
        if (!ok) return;

        positionRef.current = IDX;

        if (layouts[IDX].columns[idx2].elements.length === 0) {
          change_element_position_new_column(oldIndex, 0, IDX, idx1, idx2);
        } else {
          const newIndex = findElementIndexForDND(IDX, idx2, newContainerID, newColumnID, over.id, active);
          if (newIndex === -1) return;
          change_element_position_new_column(oldIndex, newIndex, IDX, idx1, idx2);
        }
      } else if (oldContainerID !== newContainerID) {
        const IDX1 = layouts.findIndex((l) => l.container.id === oldContainerID);
        const IDX2 = layouts.findIndex((l) => l.container.id === newContainerID);
        const idx1 = layouts[IDX1].columns.findIndex((c) => c.id === oldColumnID);
        const idx2 = layouts[IDX2].columns.findIndex((c) => c.id === newColumnID);
        if (IDX1 === -1 || IDX2 === -1 || idx1 === -1 || idx2 === -1) return;

        const oldIndex = layouts[IDX1].columns[idx1].elements.findIndex((e) => e.id === active.id);
        if (oldIndex === -1) return;

        const rect2 = columned.current[IDX2][idx2]?.getBoundingClientRect();
        if (!rect2) return;
        const { bottom: cb, top: ct, left: cl, right: cr } = rect2;

        let ok;
        const mid = (dragRef.current.getBoundingClientRect().top + dragRef.current.getBoundingClientRect().height / 2);
        if (IDX2 > positionRef.current) ok = mid > sb && mid > ct && dragRef.current.getBoundingClientRect().left < cr;
        else ok = mid < st && mid < cb && dragRef.current.getBoundingClientRect().left < cr;
        if (!ok) return;

        positionRef.current = IDX2;

        if (layouts[IDX2].columns[idx2].elements.length === 0) {
          change_element_position_new_container(oldIndex, 0, IDX1, IDX2, idx1, idx2);
        } else {
          const newIndex = findElementIndexForDND(IDX2, idx2, newContainerID, newColumnID, over.id, active);
          if (newIndex === -1) return;
          change_element_position_new_container(oldIndex, newIndex, IDX1, IDX2, idx1, idx2);
        }
      }
    } else if (over.data.current.type === "COLUMN" && active.data.current.type === "COLUMN") {
      if (oldContainerID === newContainerID) {
        const IDX = layouts.findIndex((l) => l.container.id === oldContainerID);
        if (IDX === -1) return;
        const oldIndex = layouts[IDX].columns.findIndex((c) => c.id === active.id);
        const newIndex = layouts[IDX].columns.findIndex((c) => c.id === over.id);
        if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;
        change_column_position(oldIndex, newIndex, IDX);
      } else {
        return;
      }
    }
  };

  const drop = ({ active, over }) => {
    setDisableColDrag(true);
    setActiveID(null);
    positionRef.current = null;
    setActiveItem(null);
    setIsDraggingLayout(false);

    if (!over || !active || !over.data?.current || !active.data?.current) return;
    if (active.id === over.id) return;

    if (over.data.current.type === "SECTION" && active.data.current.type === "SECTION") {
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
    const filtered = droppableContainers.filter((dc) => dc.data.current.type === type);
    return closestCenter({ ...args, droppableContainers: filtered });
  }

  const addClass = () => document.documentElement.classList.add("dragging");
  const removeClass = () => document.documentElement.classList.remove("dragging");

  return (
    <main
      className="content-area flex-1 overflow-y-auto p-4 sm:p-6 "
      area="main"
      onDragLeave={(e) => {
        const { clientX: x, clientY: y } = e;
        const r = e.currentTarget.getBoundingClientRect();
        const inside = r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
        if (!inside) { setDrop(null); setPreview(null); }
      }}
      onDrop={(e) => { if (dropTargetRef.current?.type === "SECTION") handleDrop(e); e.stopPropagation(); }}
      onDragOver={(e) => {
        e.preventDefault();
        let drop = null;
        if (layouts.length === 0) drop = { index: 0, type: "SECTION" };
        handleDuring(e, drop);
        e.stopPropagation();
      }}
      onDragEnterCapture={(e) => { e.preventDefault(); if (e.dataTransfer) e.dataTransfer.dropEffect = "copy"; }}
      onDragOverCapture={(e) => { e.preventDefault(); if (e.dataTransfer) e.dataTransfer.dropEffect = "copy"; }}
      onMouseMove={(e) => { scheduleBTNUpdate(e); scheduleDND(e); }}
      onPointerUp={commitIfPossible}
    >
      <DndContext
        onDragStart={(e) => { addClass(); drag(e); setIsDraggingLayout(true); }}
        onDragMove={during}
        onDragEnd={(e) => { drop(e); setIsDraggingLayout(false); removeClass(); /* commit fallback ใน window 'dragend' effect */ }}
        sensors={sensors}
        autoScroll
        measuring={measuring}
        collisionDetection={collisionByType}
      >
        <div className="content-area min-h-[600px] rounded-xl border border-white/10 bg-white/5">
          <SortableContext items={containerIds} strategy={verticalListSortingStrategy} disabled={disableConDrag}>
            {handleDropElement?.() && handleDropElement().container && (
              <div
                className="h-[262px]"
                onDragLeave={(e) => {
                  const { clientX: x, clientY: y } = e;
                  const r = e.currentTarget.getBoundingClientRect();
                  const inside = r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
                  if (!inside) { setDrop(null); setPreview(null); }
                }}
                onDragOver={(e) => { e.preventDefault(); handleDuring(e, { index: 0, type: "SECTION" }); }}
                onDrop={handleDrop}
                onPointerUp={commitIfPossible}
              >
                {dropTarget?.index === 0 && dropTargetRef.current?.type === "SECTION" && (
                  <div ref={ghostRef} className="preview opacity-70 pointer-events-none" key="ghost-start" data-drop="SECTION" id={preview?.container?.id}>
                    <ContainerPreview element={preview} id={preview?.container?.id}>
                      {preview?.columns?.map((c) => (
                        <ColumnPreview key={c.id} element={c} id={{ conID: preview?.container?.id, colID: c.id }}>
                          {c.id}
                        </ColumnPreview>
                      ))}
                    </ContainerPreview>
                  </div>
                )}
              </div>
            )}

            {layouts.length > 0 && (
              <>
                {layouts.map((layout, I) => {
                  const { container, columns } = layout;
                  const { id: ID } = container;

                  return (
                    <React.Fragment key={ID}>
                      <SortableContainerItem elementData={container} id={ID}>
                        <SortableContext items={columns.map((c) => c.id)} strategy={rectSortingStrategy} disabled={disableColDrag}>
                          {columns.map((col, i) => {
                            const { id, elements } = col;
                            const eleID = elements.map((e) => e.id) ?? ["ele-null"];
                            return (
                              <SortableColumnItem key={id} id={id} containerId={ID} elementData={col}>
                                <SortableContext items={eleID} strategy={verticalListSortingStrategy} disabled={disableEleDrag}>
                                  {handleDropElement?.() && handleDropElement().type && (
                                    <div
                                      className={`${elements.length > 0 ? "h-[100px]" : dropTarget?.index?.conI === I && dropTarget?.index?.colI === i && dropTarget?.index?.eleI === 0 && dropTarget?.type === "ELEMENT" ? "h-auto" : ""}`}
                                      onDragLeave={(e) => {
                                        const { clientX: x, clientY: y } = e;
                                        const r = e.currentTarget.getBoundingClientRect();
                                        const inside = r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
                                        if (!inside) { setDrop(null); setPreview(null); }
                                      }}
                                      onDragOver={(e) => { e.preventDefault(); handleDuring(e, { index: { conI: I, colI: i, eleI: 0 }, type: "ELEMENT" }); }}
                                      onDrop={handleDrop}
                                      onPointerUp={commitIfPossible}
                                    >
                                      {dropTarget?.index?.conI === I &&
                                        dropTarget?.index?.colI === i &&
                                        dropTarget?.index?.eleI === 0 &&
                                        dropTarget?.type === "ELEMENT" && (
                                          <div className="preview opacity-70 pointer-events-none" key="ghost-ele-first" data-drop="ELEMENT" id={preview?.id}>
                                            <ElementPreview element={preview} />
                                          </div>
                                        )}
                                    </div>
                                  )}

                                  {elements.length > 0 ? (
                                    <div>
                                      {elements.map((ele, o) => (
                                        <React.Fragment key={ele.id}>
                                          <SortableElementItem id={ele.id} containerId={ID} columnId={id} elementData={ele} />
                                          {handleDropElement?.() && handleDropElement().type && (
                                            <div
                                              className={`${elements.length > 0 ? "h-[100px]" : dropTarget?.index?.conI === I && dropTarget?.index?.colI === i && dropTarget?.index?.eleI === o + 1 && dropTarget?.type === "ELEMENT" ? "h-auto" : ""}`}
                                              onDragLeave={(e) => {
                                                const { clientX: x, clientY: y } = e;
                                                const r = e.currentTarget.getBoundingClientRect();
                                                const inside = r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
                                                if (!inside) { setDrop(null); setPreview(null); }
                                              }}
                                              onDragOver={(e) => { e.preventDefault(); handleDuring(e, { index: { conI: I, colI: i, eleI: o + 1 }, type: "ELEMENT" }); }}
                                              onDrop={handleDrop}
                                              onPointerUp={commitIfPossible}
                                            >
                                              {dropTarget?.index?.conI === I &&
                                                dropTarget?.index?.colI === i &&
                                                dropTarget?.index?.eleI === o + 1 &&
                                                dropTarget?.type === "ELEMENT" && (
                                                  <div className="preview opacity-70 pointer-events-none" key="ghost-ele-gap" data-drop="ELEMENT" id={preview?.id}>
                                                    <ElementPreview element={preview} />
                                                  </div>
                                                )}
                                            </div>
                                          )}
                                        </React.Fragment>
                                      ))}
                                    </div>
                                  ) : (
                                    <>
                                      {dropTarget?.type === "ELEMENT" && dropTarget?.index?.conI === I && dropTarget?.index?.colI === i ? null : (
                                        <SortableElementItem
                                          key={`ele-${id}`}
                                          id={`ele-${id}`}
                                          containerId={ID}
                                          columnId={id}
                                          elementData={{ type: "null", id: "__null__" }}
                                          onDrop={handleDrop}
                                        >
                                          {id}
                                        </SortableElementItem>
                                      )}
                                    </>
                                  )}
                                </SortableContext>
                              </SortableColumnItem>
                            );
                          })}
                        </SortableContext>
                      </SortableContainerItem>

                      {handleDropElement?.() && handleDropElement().container && (
                        <div
                          className="h-[262px] bg-transparent"
                          onDragLeave={(e) => {
                            const { clientX: x, clientY: y } = e;
                            const r = e.currentTarget.getBoundingClientRect();
                            const inside = r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
                            if (!inside) { setDrop(null); setPreview(null); }
                          }}
                          onDragOver={(e) => { e.preventDefault(); handleDuring(e, { index: I + 1, type: "SECTION" }); }}
                          onDrop={handleDrop}
                          onPointerUp={commitIfPossible}
                        >
                          {dropTarget?.index === I + 1 && dropTarget?.type === "SECTION" && (
                            <div ref={ghostRef} className="preview opacity-70 pointer-events-none" key="ghost-end" data-drop="SECTION" id={preview?.container?.id}>
                              <ContainerPreview element={preview} id={preview?.container?.id}>
                                {preview?.columns?.map((c) => (
                                  <ColumnPreview key={c.id} element={c} id={{ conID: preview?.container?.id, colID: c.id }}>
                                    {c.id}
                                  </ColumnPreview>
                                ))}
                              </ContainerPreview>
                            </div>
                          )}
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </>
            )}
          </SortableContext>

          <DragOverlay
            dropAnimation={{ duration: 220, easing: "cubic-bezier(.2,.7,.3,1)" }}
          >
            {activeID && activeItem &&
              ((typeof activeID === "string" && (
                <ContainerPreview element={activeItem} id={activeID}>
                  {activeItem.columns.map((c) => (
                    <ColumnPreview key={c.id} element={c} id={{ conID: activeID, colID: c.id }}>
                      {c.elements.length === 0 ? c.id : (
                        <div>{c.elements.map((ele) => <ElementPreview element={ele} key={ele.id} />)}</div>
                      )}
                    </ColumnPreview>
                  ))}
                </ContainerPreview>
              )) ||
                (typeof activeID === "object" && !activeID.eleID && (
                  <ColumnPreview element={activeItem} id={activeID}>
                    {activeItem.elements.length === 0 ? activeID.colID : (
                      <div>{activeItem.elements.map((ele) => <ElementPreview element={ele} key={ele.id} />)}</div>
                    )}
                  </ColumnPreview>
                )) ||
                (typeof activeID === "object" && activeID.eleID && (
                  <ElementPreviewForDrag_Drop element={activeItem} />
                )))}
          </DragOverlay>
        </div>
      </DndContext>

      {modal && <ConfirmModal data={modal} close={openModal} />}

      <style>{`
        html.dragging, html.dragging * { cursor: grabbing !important; }
        .sortable-grab {cursor: grab;}
        .sortable-grab * { cursor: inherit; }
        .column-area:focus, .content-area:focus, .container-area:focus { outline: none !important; box-shadow: none !important; border-color: inherit !important; }
        .preview { pointer-events: none; }
      `}</style>
    </main>
  );

  // ===== Option buttons & Modal (เหมือนเดิม) =====
  function OptionButtonGroup({
    element, clone, id, remove, offcavanas, onUpdate, modal, changeSizeColumn = null,
  }) {
    return (
      <div className="flex items-center justify-center absolute -top-px -left-px" data-drop="COLUMN-BTN" onMouseMove={scheduleDND}>
        {offcavanas === "Column" && (
          <button className="bg-gray-900 text-white px-[3px] py-1" onMouseEnter={() => setDisableColDrag(false)} onMouseOver={() => setDisableColDrag(false)} onMouseLeave={() => setDisableColDrag(true)}>
            <Move className="size-4 m-[5px]" />
          </button>
        )}
        <button className="bg-gray-900 text-white px-[3px] py-1" onClick={() => openOffcavanas(offcavanas, element, onUpdate)}>
          <Settings className="size-4 m-[5px]" />
        </button>
        <button className="bg-gray-900 text-white px-[3px] py-1" onClick={() => clone(id)}>
          <Copy className="size-4 m-[5px]" />
        </button>
        {offcavanas === "Column" && (
          <>
            <button className="bg-gray-900 text-white px-[3px] py-1" onClick={() => changeSizeColumn(id, "-")}><Minus className="size-4 m-[5px]" /></button>
            <button className="bg-gray-900 text-white px-[3px] py-1" onClick={() => changeSizeColumn(id, "+")}><Plus className="size-4 m-[5px]" /></button>
          </>
        )}
        <button className="bg-gray-900 text-white px-[3px] py-1">
          <Trash2 className="size-4 m-[5px]" onClick={() => modal({ id, funct: remove })} />
        </button>
      </div>
    );
  }

  function ConfirmModal({ data, close }) {
    if (!data) return null;
    const { id, funct } = data;
    const elementName = typeof id === "object" ? "Column" : "Section";
    const [open, setOpen] = useState(true);
    if (!open) setTimeout(() => close(), 200);

    return (
      <Modal open={open} onClose={() => setOpen(false)} slotProps={{ backdrop: { timeout: 200 } }} closeAfterTransition slots={{ backdrop: Backdrop }}>
        <Fade in={open} timeout={200} onExited={close}>
          <Box sx={{ position: "relative", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 400, backgroundColor: "white", borderRadius: 3 }}
               container={document.getElementById("app-root")}>
            <div className="flex justify-between px-4 pt-3 pb-1">
              <div className="text-[15px] font-bold"><span className="text-red-600 dark:text-emerald-300">Delete</span> {elementName}</div>
              <div><a onClick={() => setOpen(false)} style={{ cursor: "pointer" }}>X</a></div>
            </div>
            <div className="border-b border-dotted border-gray-500/50 flex-1"></div>
            <div className="flex justify-center mt-4 text-[13px] ">คุณต้องการลบ {elementName} นี้ใช่หรือไม่?</div>
            <div className="flex justify-center my-4 pb-5">
              <Button sx={{ backgroundColor: "#B91C1C", color: "white", fontSize: 13, height: 25, px: 1.5, mr: 1 }}
                onClick={() => { setTimeout(() => { funct(id); }, 200); setOpen(false); }}>
                ใช่... ฉันต้องการลบ
              </Button>
              <Button sx={{ backgroundColor: "#333", color: "white", fontSize: 13, height: 25, px: 1.5, ml: 1 }} onClick={() => setOpen(false)}>
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
