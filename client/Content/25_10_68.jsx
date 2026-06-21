import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useLayoutEffect,
} from "react";
import { createPortal } from "react-dom";
import {
  Settings,
  Plus,
  Copy,
  Trash2,
  Minus,
  Move,
  MoveUp,
  MoveDown,
  MoveLeft,
  MoveRight,
  ScanEye,
  Play,
  EllipsisVertical,
  Maximize2,
  Minimize2,
  Grid2X2X,
  Grid2X2Plus,
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
import lodash, { isNull, transform } from "lodash";
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

  // ข้อมูลธีม/เพจ
  const [page, setPage] = useState(null); //ข้อมูลหน้า
  const [theme, setTheme] = useState(null); //ข้อมูลธีม
  const [layouts, setLayout] = useState([]); //ข้อมูลLayout
  // การแสดงHTML
  const [hover, setHover] = useState(null); //เก็บค่าidของ con/col เพื่อแสดง Option Button Group ของ con/col
  const [activeID, setActiveID] = useState(null); // เก็บค่าid ของ layout ที่กำลัง Drag&Drop
  const [activeItem, setActiveItem] = useState(null); // เก็บ JSON HTML ของ layout ที่กำลัง Drag&Drop
  const [modal, setModal] = useState(null); // ตัวแปรควบคุมการเปิดปิดของ Confirm Modal
  const [alert, setAlert] = useState(false); // ตัวแปรควบคุมการเปิดปิดของ Confirm Modal
  const [preview, setPreview] = useState(null); // เก็บ JSON HTML ของ layout ใหม่ที่กำลังนำมาวาง
  // Drag&Drop
  const [isDraggingLayout, setIsDraggingLayout] = useState(false); // เก็บค่าสถานะการ Drag&Drop (true = กำลังทำ / false = w,jwfhme)
  // Disable Drag&Drop
  const [disableConDrag, setDisableConDrag] = useState(true); // ตัวแปรควบคุมการ disable Drag&Drop ของ con
  const [disableColDrag, setDisableColDrag] = useState(true); // ตัวแปรควบคุมการ disable Drag&Drop ของ col
  const [disableEleDrag, setDisableEleDrag] = useState(true); // ตัวแปรควบคุมการ disable Drag&Drop ของ ele
  const [disableSpnDrag, setDisableSpnDrag] = useState(true); // ตัวแปรควบคุมการ disable Drag&Drop ของ spn
  const [disableMspnDrag, setDisableMspnDrag] = useState(true); // ตัวแปรควบคุมการ disable Drag&Drop ของ mspn
  // ฟังก์ชันเกี่ยวกับ Layout
  const [deleteID, setDeleteID] = useState(null); // เก็บค่าid ของ ele ที่กำลังจะลบ

  // useRef

  // การแสดงHTML
  const ghostRef = useRef(null); // เก็บ Ref ของ Ghost ที่จำลองตำแหน่งการวาง Layout ใหม่
  const dragRef = useRef(null); // เก็บ Ref ของ Preview ของ element ที่กำลัง Drag&Drop
  const dropTargetRef = useRef({ index: null, type: null, isLast: false }); // เก็บค่า index ประเภท และใช่ตำแหน่งสุดใหม่ไหม ของ Ghost เพื่อใช้เป็นindexสำหรับการวาง Layout ใหม่
  // การควบคุม Hover เพื่อใช้งานฟังก์ชัน
  const hoverRef = useRef(null); // สำหรับควบคุมฟังก์ชัน updateHoverFromPoint(การวาง Layout ใหม่)
  const dndRef = useRef(null); // สำหรับควบคุมฟังก์ชัน updateDND(การ disable Drag&Drop)
  const btnGroupRef = useRef(null); // สำหรับควบคุมฟังก์ชัน updateHoverPosition(การแสดง Option Button Group)
  // การเก็บค่า
  const positionRef = useRef(null); // เก็บตำแหน่งเดิมของ container เมื่อ Drag&Drop ele
  const btnRef = useRef(false); // เก็บว่าเมาสือยู่ในปุ่มใช่หรือไม่
  const dragToken = useRef(0); // เก็บtoken เพื่อสั่งหยุด hoverRef
  // การเก็บ Ref ของ Layout
  const contained = useRef([]); // Ref ของ container
  const columned = useRef([]); // Ref ของ column
  const spaned = useRef([]); // Ref ของ span

  // useEffect

  // ดึงข้อมูลธีม/เพจ
  useEffect(() => {
    loadPage();
  }, []); // ดึงข้อมูลหน้า
  useEffect(() => {
    loadTheme();
  }, []); // ดึงข้อมูลธีม
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
  }, [deleteID]); // ควบคุมการลบ ele
  useEffect(() => {
    if (!preview) return;
    const cancle = () => {
      setTimeout(() => clearGhost(), 0);
    };

    window.addEventListener("dragend", cancle, false);

    return () => {
      window.removeEventListener("dragend", cancle, false);
    };
  }, [preview]); // ยกเลิก Ghost จำลองตำแหน่ง layout ใหม่เมื่อไม่มีการวางเกิดขึ้น
  useEffect(() => {
    if (!preview) return;
    const onDragEnd = (e) => {
      handleDrop(e);
    };
    window.addEventListener("dragend", onDragEnd, { capture: true });
    return () => {
      window.removeEventListener("dragend", onDragEnd, { capture: true });
    };
  }, [layouts, preview]);

  // Function JSX

  // การโหลดข้อมูล
  const loadPage = () => {
    getPage("68d2af32dd121faca15fdb57").then((res) => {
      setPage(res.data);
      getPageName(res.data.pageName);
    });
  }; // โหลดข้อมูลหน้า
  const loadTheme = () => {
    getTheme("68d37327bedb0efab7dacafb")
      .then((res) => {
        setTheme(res.data);
      })
      .catch((err) => console.log(err));
  }; // โหลดข้อมูลธีม

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
  }; // แปลงค่า Opacity ให้เป็น Hex
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
  }; // แปลง Font Tailwind ให้เป็น Font CSS

  const updateHoverPosition = (x, y) => {
    const el = document.elementFromPoint(x, y);
    const column = el?.closest(`[data-drop="COLUMN"]`);
    const section = el?.closest(`[data-drop="SECTION"]`);
    const span = el?.closest(`[data-drop="SPAN"]`);
    const miniSpan = el?.closest(`[data-drop="MINI-SPAN"]`);
    const element = el?.closest(`[data-drop="ELEMENT"]`);

    if (!section && !column && !element) {
      setHover(null);
      return;
    }

    if (miniSpan) {
      let msid = miniSpan.getAttribute("id");
      setHover(msid);
      return "mspn";
    }

    if (span && column) {
      let sid = span.getAttribute("id");
      setHover(sid);
      return "spn";
    } else if (section && column) {
      let [_, id] = column.getAttribute("id").split("/");
      if (!id) {
        id = column.getAttribute("id");
        setHover(id);
        return "col";
      } else {
        setHover(_);
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
    const el = document.elementFromPoint(x, y);
    const section = el?.closest(`[data-drop="SECTION"]`);
    const column = el?.closest(`[data-drop="COLUMN"]`);
    const element = el?.closest(`[data-drop="ELEMENT"]`);
    const span = el?.closest(`[data-drop="SPAN"]`);
    const miniSpan = el?.closest(`[data-drop="MINI-SPAN"]`);

    if (!section) {
      setDisableConDrag(true);
      setDisableEleDrag(true);
      return;
    }

    if (section && !column && !element) {
      setDisableConDrag(false);
      setDisableEleDrag(true);
    } else if (section && column && !element && !span) {
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
        setDisableEleDrag(true);
      }
    } else if (section && column && element) {
      const conID = section.id;
      if (isNull(conID)) return;
      const colID = column.id;
      if (isNull(colID)) return;
      const conI = layouts.findIndex((l) => l.container.id === conID);
      if (conI === -1) return;
      let colI;
      let isHasElements;
      if (span) {
        const [_, colIDPath] = colID.split("/");
        colI = layouts[conI].columns.findIndex((c) => c.id === colIDPath);
        if (colI === -1) return;
        const spnID = span.id;
        if (miniSpan) {
          const [_sec, _col, spnIDPath] = spnID.split("/");
          const spnI = layouts[conI].columns[colI].spans.findIndex(
            (s) => s.id === spnIDPath
          );
          if (spnI === -1) return;
          const mspnID = miniSpan.id;
          const mspnI = layouts[conI].columns[colI].spans[
            spnI
          ].miniSpans.findIndex((ms) => ms.id === mspnID);
          if (mspnI === -1) return;
          isHasElements =
            layouts[conI].columns[colI].spans[spnI].miniSpans[mspnI].elements
              .length > 0;
        } else {
          const spnI = layouts[conI].columns[colI].spans.findIndex(
            (s) => s.id === spnID
          );
          if (spnI === -1) return;
          isHasElements =
            layouts[conI].columns[colI].spans[spnI].elements.length > 0;
        }
      } else {
        colI = layouts[conI].columns.findIndex((c) => c.id === colID);
        if (colI === -1) return;
        isHasElements = layouts[conI].columns[colI].elements.length > 0;
      }
      if (!isHasElements) {
        setDisableConDrag(false);
        setDisableEleDrag(true);
      } else if (isHasElements) {
        setDisableConDrag(true);
        setDisableEleDrag(false);
      }
    } else if (
      (section && column && element && span) ||
      (section && column && element && span && miniSpan)
    ) {
      setDisableConDrag(false);
      setDisableEleDrag(true);
    }
  };

  const scheduleDND = (e) => {
    if (isDraggingLayout) {
      setDisableConDrag(false);
      setDisableEleDrag(false);
      setDisableSpnDrag(false);
      return;
    }
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

  const addNewElement = (element, i1, i2, i3, i4 = null, i5 = null) => {
    setLayout((prev) => {
      const newLayouts = lodash.cloneDeep(prev);
      if (i4 !== null) {
        if (i5 !== null) {
          newLayouts[i1].columns[i2].spans[i4]?.miniSpans[i5].elements.splice(
            i3,
            0,
            element
          );
        } else {
          newLayouts[i1].columns[i2].spans[i4]?.elements.splice(i3, 0, element);
        }
      } else {
        newLayouts[i1].columns[i2].elements.splice(i3, 0, element);
      }

      clearGhost();
      return newLayouts;
    });
  };

  const dropNewElement = () => {
    if (
      !Number.isInteger(dropTargetRef.current?.index?.conI) ||
      !Number.isInteger(dropTargetRef.current?.index?.colI) ||
      !Number.isInteger(dropTargetRef.current?.index?.eleI) ||
      typeof dropTargetRef.current.index !== "object" ||
      dropTargetRef.current.type !== "ELEMENT"
    ) {
      clearGhost();
      return;
    }
    let spnI = null,
      mspnI = null;
    const { conI, colI, eleI } = dropTargetRef.current.index;
    spnI = dropTargetRef.current.index?.spnI ?? null;
    mspnI = dropTargetRef.current.index?.mspnI ?? null;
    const element = handleDropElement();
    if (element.container || isNull(conI) || isNull(colI) || isNull(eleI)) {
      clearGhost();
      return;
    }
    if (!element.id) return;
    element.id += Math.ceil(Math.random() * 1e9).toString(36);
    addNewElement(element, conI, colI, eleI, spnI, mspnI);
  };

  const dropNewSection = () => {
    const layout = handleDropElement();
    if (layout.container) {
      if (
        dropTargetRef.current?.type !== "SECTION" ||
        typeof dropTargetRef.current.index !== "number" ||
        dropTargetRef.current.index === -1
      ) {
        clearGhost();
        return;
      }
      layout.container.id += page.latestID;
      for (let i = 0; i < 3; i++) {
        layout.columns[i].id += `${page.latestID}-${i}`;
        const newID = layout.columns[i].id.replace("Col-", "");
        if (layout.columns[i].isSpan) {
          layout.columns[i].spans.map((s, o) => {
            s.id += `${newID}-${o}`;
            s.miniSpans.map((ms, _) => {
              ms.id += `${page.latestID}-${i}-${o}-${_}`;
            });
          });
        }
      }
      setPage((prev) => {
        return { ...prev, latestID: prev.latestID + 1 };
      });
      const newLayouts = lodash.cloneDeep(layouts);
      newLayouts.splice(dropTargetRef.current.index, 0, layout);
      setLayout((prev) => {
        clearGhost();
        return newLayouts;
      });
    } else {
      clearGhost();
      return;
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
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
  };

  const handleDuring = (e) => {
    e.preventDefault();
    const element = lodash.cloneDeep(handleDropElement());
    if (!element) {
      clearGhost();
      return;
    }
    if (element.container) {
      element.container.id += page.latestID;
      for (let i = 0; i < 3; i++) {
        element.columns[i].id += `${page.latestID}-${i}`;
        if (element.columns[i].isSpan) {
          element.columns[i].spans.map((s, o) => {
            s.id += `${page.latestID}-${i}-${o}`;
            s.miniSpans.map((ms, _) => {
              ms.id += `${page.latestID}-${i}-${o}-${_}`;
            });
          });
        }
      }
      scheduleHoverUpdate(e, "SECTION", element);

      return;
    }
    scheduleHoverUpdate(e, "ELEMENT", element);
  };

  const setDrop = (i, t, b = false) => {
    dropTargetRef.current = { index: i, type: t, isLast: b };
  };

  const checkGhostPosition = (x, y, r) => {
    const isNum = (n) => {
      return typeof n === "number" && !Number.isNaN(n);
    };
    return (
      r &&
      isNum(x) &&
      x >= r.left &&
      x <= r.right &&
      isNum(y) &&
      y >= r.top &&
      y <= r.bottom
    );
  };

  const clearGhost = () => {
    if (hoverRef.current) {
      cancelAnimationFrame(hoverRef.current);
      hoverRef.current = null;
    }

    dragToken.current += 1;

    setPreview(null);
    setDrop(null, null);
  };

  const findColumn = (x, y) => {
    const el = document.elementFromPoint(x, y);
    const nearestNode = el?.closest("[data-drop='COLUMN']");
    if (!nearestNode) return;
    const node = nearestNode?.closest("[data-drop='COLUMN'][id*='/']");
    return node ?? nearestNode;
  };

  const findSpan = (x, y) => {
    const el = document.elementFromPoint(x, y);
    const node = el?.closest('[data-drop="SPAN"]');
    return node ?? null;
  };

  const findMiniSpan = (x, y) => {
    const el = document.elementFromPoint(x, y);
    const node = el?.closest('[data-drop="MINI-SPAN"]');
    return node ?? null;
  };

  const findElement = (x, y) => {
    const el = document.elementFromPoint(x, y);
    const nearestNode = el?.closest("[data-drop='ELEMENT']");
    if (!nearestNode) return;
    const node = nearestNode?.closest("[data-drop='ELEMENT'][id*='/']");
    return node ?? nearestNode;
  };

  const setColRef = (IDX, idx, el) => {
    if (isNull(IDX) || isNull(idx)) return;
    if (!columned.current[IDX]) columned.current[IDX] = [];
    columned.current[IDX][idx] = el || null;
  };

  const setDropForElement = (
    conID,
    colID,
    overCol,
    overSpan,
    overMiniSpan,
    overEl,
    mouseX,
    mouseY,
    element
  ) => {
    const conI = layouts.findIndex((l) => l.container.id === conID);
    if (conI === -1) return null;
    const colI = layouts[conI].columns.findIndex((c) => c.id === colID);
    if (colI === -1) return null;

    const elements = layouts[conI].columns[colI].elements;

    const [_, id] = overCol.getAttribute("id").split("/");
    if (overSpan) {
      const sid = overSpan.getAttribute("id");
      if (overMiniSpan) {
        const [_sec, _col, spnID] = sid.split("/");
        let spnI = layouts[conI].columns[colI].spans.findIndex(
          (s) => s.id === spnID
        );
        const msID = overMiniSpan.getAttribute("id");
        const mspnI = layouts[conI].columns[colI].spans[
          spnI
        ].miniSpans.findIndex((ms) => ms.id === msID);
        const eleMspn =
          layouts[conI].columns[colI].spans[spnI]?.miniSpans[mspnI]?.elements;
        if (!eleMspn) return;
        const rectMspn = overMiniSpan.getBoundingClientRect();
        if (mouseY < rectMspn.top || mouseY > rectMspn.bottom) return;
        setPreview(element);
        if (!eleMspn.length) {
          return {
            index: { conI, colI, spnI, mspnI, eleI: 0 },
            type: "ELEMENT",
            isLast: false,
          };
        }
        if (!overEl) {
          return {
            index: { conI, colI, spnI, mspnI, eleI: eleMspn.length },
            type: "ELEMENT",
            isLast: true,
          };
        }
        const rectEl = overEl.getBoundingClientRect();
        const mid = rectEl.top + rectEl.height / 2;
        const [_0, _1, eleID] = overEl.getAttribute("id").split("/");
        let eleI = eleMspn.findIndex((e) => e.id === eleID);
        if (eleI === -1) {
          return {
            index: { conI, colI, spnI, mspnI, eleI: eleMspn.length },
            type: "ELEMENT",
            isLast: true,
          };
        }
        eleI += mouseY > mid ? 1 : 0;
        return {
          index: { conI, colI, spnI, mspnI, eleI },
          type: "ELEMENT",
          isLast: eleI === eleMspn.length,
        };
      } else {
        let spnI = layouts[conI].columns[colI].spans.findIndex(
          (s) => s.id === sid
        );
        const eleSpn = layouts[conI].columns[colI].spans[spnI]?.elements;
        if (!eleSpn) return;
        const rectSpn = overSpan.getBoundingClientRect();
        if (mouseY < rectSpn.top || mouseY > rectSpn.bottom) return;
        setPreview(element);

        if (!eleSpn.length) {
          return {
            index: { conI, colI, spnI, eleI: 0 },
            type: "ELEMENT",
            isLast: false,
          };
        }

        if (!overEl) {
          return {
            index: { conI, colI, spnI, eleI: eleSpn.length },
            type: "ELEMENT",
            isLast: true,
          };
        }

        const rectEl = overEl.getBoundingClientRect();
        const mid = rectEl.top + rectEl.height / 2;
        const [_0, _1, eleID] = overEl.getAttribute("id").split("/");
        let eleI = eleSpn.findIndex((e) => e.id === eleID);
        if (eleI === -1) {
          return {
            index: { conI, colI, spnI, eleI: eleSpn.length },
            type: "ELEMENT",
            isLast: true,
          };
        }
        eleI += mouseY > mid ? 1 : 0;
        return {
          index: { conI, colI, spnI, eleI },
          type: "ELEMENT",
          isLast: eleI === eleSpn.length,
        };
      }
    } else {
      const column = document.querySelector(`[data-drop="COLUMN"][id="${id}"]`);
      if (!column) return;
      const rectCol = column.getBoundingClientRect();
      const outerCol = overCol.getBoundingClientRect();
      if (mouseY < outerCol.top || mouseY > outerCol.bottom) return;
      const { top, bottom } = rectCol;
      if (mouseY < top || mouseY > bottom) return;

      setPreview(element);

      if (!elements.length) {
        return {
          index: { conI, colI, eleI: 0 },
          type: "ELEMENT",
          isLast: false,
        };
      }

      if (!overEl) {
        return {
          index: { conI, colI, eleI: elements.length },
          type: "ELEMENT",
          isLast: true,
        };
      }

      const rectEl = overEl.getBoundingClientRect();
      const mid = rectEl.top + rectEl.height / 2;
      const [_0, _1, eleID] = overEl.getAttribute("id").split("/");
      const index = elements.findIndex((e) => e.id === eleID);
      if (index === -1) {
        return {
          index: { conI, colI, eleI: elements.length },
          type: "ELEMENT",
          isLast: true,
        };
      }
      const eleI = index + (mouseY > mid ? 1 : 0);
      return {
        index: { conI, colI, eleI },
        type: "ELEMENT",
        isLast: eleI === elements.length,
      };
    }
  };

  const updateHoverFromPoint = (x, y, type, element) => {
    const set_2_null = () => {
      setPreview(null);
      setDrop(null, null);
    };

    if (ghostRef.current) {
      const r = ghostRef.current.getBoundingClientRect();
      const stillOnGhost = checkGhostPosition(x, y, r);
      const hasDropTarget =
        dropTargetRef.current &&
        dropTargetRef.current.type &&
        (dropTargetRef.current.type === "SECTION"
          ? typeof dropTargetRef.current.index === "number"
          : dropTargetRef.current.index &&
            Number.isInteger(dropTargetRef.current.index.conI) &&
            (Number.isInteger(dropTargetRef.current.index.colI) ||
              Array.isArray(dropTargetRef.current.index.colI)) &&
            Number.isInteger(dropTargetRef.current.index.eleI));
      if (stillOnGhost && hasDropTarget) return;
    }

    const el = document.elementFromPoint(x, y);

    if (type === "SECTION") {
      setPreview(element);
      if (!layouts.length) {
        setDrop(0, "SECTION", null);
        return;
      }

      const section = el?.closest('[data-drop="SECTION"]');
      if (!section) {
        setDrop(layouts.length, "SECTION", true);
        return;
      }

      const conR = section.getBoundingClientRect();
      const mid = conR.top + conR.height / 2;
      const id = section?.getAttribute("id");
      let index = layouts.findIndex((l) => l.container.id === id);
      index += y > mid ? 1 : 0;
      setDrop(index, "SECTION", index === layouts.length);
    } else if (type === "ELEMENT") {
      const column = findColumn(x, y);
      if (!column) {
        set_2_null();
        return;
      }
      const idFormCol = column?.getAttribute("id");
      if (!idFormCol) {
        set_2_null();
        return;
      }
      let [conID, colID] = idFormCol.split("/");
      const EL = findElement(x, y);
      const span = findSpan(x, y);
      const miniSpan = findMiniSpan(x, y);
      const dropElement = setDropForElement(
        conID,
        colID,
        column,
        span,
        miniSpan,
        EL,
        x,
        y,
        element
      );
      if (!dropElement) {
        set_2_null();
        return;
      }
      setDrop({ ...dropElement?.index }, dropElement.type, dropElement.isLast);
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
        let latestSpanID = 0;
        if (col.isSpan) {
          col.spans.map((s, i) => {
            const newID = col.id.replace("Col-", "");
            s.id = `Span-${newID}-${latestSpanID}`;
            let latestMiniSpanID = 0;
            s.miniSpans.map((ms) => {
              ms.id = `MS-${newID}-${latestSpanID}-${latestMiniSpanID}`;
              ms.elements.map((e) => {
                e.id =
                  e.id.split("-")[0] +
                  "-" +
                  Math.ceil(Math.random() * 1e9).toString(36);
              });
              latestMiniSpanID += 1;
            });
            s.latestMiniSpanID = latestMiniSpanID;
            s.elements.map((e) => {
              e.id =
                e.id.split("-")[0] +
                "-" +
                Math.ceil(Math.random() * 1e9).toString(36);
            });
            latestSpanID += 1;
          });
          col.latestSpanID = latestSpanID;
        }
        col.elements.map((e) => {
          e.id =
            e.id.split("-")[0] +
            "-" +
            Math.ceil(Math.random() * 1e9).toString(36);
        });
      });
      newLayout.container.latestColID = latestColID;
      newLayouts.splice(idx + 1, 0, newLayout);

      return newLayouts;
    });

    setPage((prev) => {
      return { ...prev, latestID: prev.latestID + 1 };
    });
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
    if (id === offcanvasID) {
      openOffcavanas(null, null, null);
    }
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
    let IDX;
    const newLayouts = lodash.cloneDeep(layouts);
    IDX = newLayouts.findIndex((l) => l.container.id === conID);
    if (IDX === -1) return;
    const newLayout = lodash.cloneDeep(newLayouts[IDX]);
    newLayout.container.latestColID;
    const newColumns = lodash.cloneDeep(newLayout.columns);
    const idx = newColumns.findIndex((c) => c.id === colID);
    const newColumn = lodash.cloneDeep(newColumns[idx]);
    const idPaths = newLayout.container.id.split("-");
    newColumn.id = `Col-${idPaths[1]}-${newLayout.container.latestColID}`;
    if (newColumn.isSpan) {
      newColumn.spans.map((s, i) => {
        s.id = `Span-${idPaths[1]}-${newLayout.container.latestColID}-${i}`;

        s.miniSpans.map((ms, o) => {
          ms.id = `MS-${idPaths[1]}-${newLayout.container.latestColID}-${i}-${o}`;
          ms.elements.map((e) => {
            e.id =
              e.id.split("-")[0] +
              "-" +
              Math.ceil(Math.random() * 1e9).toString(36);
          });
        });

        s.elements.map((e) => {
          e.id =
            e.id.split("-")[0] +
            "-" +
            Math.ceil(Math.random() * 1e9).toString(36);
        });
      });
    } else {
      newColumn.elements.map((e) => {
        e.id =
          e.id.split("-")[0] +
          "-" +
          Math.ceil(Math.random() * 1e9).toString(36);
      });
    }

    newColumns.splice(idx + 1, 0, newColumn);
    newLayout.columns = newColumns;
    newLayouts.splice(IDX, 1, newLayout);
    newLayout.container.latestColID += 1;

    setLayout((prev) => {
      return newLayouts;
    });
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

  const updateSpan = (data, id, conID, colID) => {
    setLayout((prev) => {
      const newLayouts = lodash.cloneDeep(layouts);
      const IDX = newLayouts.findIndex((l) => l.container.id === conID);
      const idx = newLayouts[IDX].columns.findIndex((c) => c.id === colID);
      const sidx = newLayouts[IDX].columns[idx].spans.findIndex(
        (s) => s.id === id
      );
      const newSpans = newLayouts[IDX].columns[idx].spans;
      newSpans[sidx] = data;
      return newLayouts;
    });
  };

  const cloneSpan = (id) => {
    const { conID, colID, spnID } = id;
    const newLayouts = lodash.cloneDeep(layouts);
    const IDX = newLayouts.findIndex((l) => l.container.id === conID);
    const newLayout = newLayouts[IDX];
    const idx = newLayout.columns.findIndex((c) => c.id === colID);
    const newColumn = newLayout.columns[idx];
    const newSpans = newColumn.spans;
    const sidx = newColumn.spans.findIndex((s) => s.id === spnID);
    const newSpan = lodash.cloneDeep(newColumn.spans[sidx]);
    const idPaths = newSpan.id.split("-");
    newSpan.id = `Span-${idPaths[1]}-${idPaths[2]}-${newColumn.latestSpanID}`;
    newSpan.miniSpans.map((ms, i) => {
      ms.id = `MS-${idPaths[1]}-${idPaths[2]}-${newColumn.latestSpanID}-${i}`;
      ms.elements.map((e) => {
        const type = e.id.split("-")[0];
        e.id = `${type}-${Math.ceil(Math.random() * 1e9).toString(36)}`;
      });
    });
    newColumn.latestSpanID += 1;
    newSpan.elements.map((e) => {
      const type = e.id.split("-")[0];
      e.id = `${type}-${Math.ceil(Math.random() * 1e9).toString(36)}`;
    });
    newSpans.splice(sidx + 1, 0, newSpan);
    setLayout((prev) => {
      return newLayouts;
    });
  };

  const deleteSpan = (id) => {
    const { conID, colID, spnID } = id;
    const newLayouts = lodash.cloneDeep(layouts);
    const IDX = newLayouts.findIndex((l) => l.container.id === conID);
    const newLayout = newLayouts[IDX];
    const idx = newLayout.columns.findIndex((c) => c.id === colID);
    const newColumn = newLayout.columns[idx];
    const newSpans = newColumn.spans;
    const sidx = newColumn.spans.findIndex((s) => s.id === spnID);
    newSpans.splice(sidx, 1);
    if (newSpans.length === 1) {
      const lastSpan = newSpans[0];
      if (lastSpan.isMiniSpan) {
        if (lastSpan.miniSpans.length > 1) {
          setLayout((prev) => {
            return newLayouts;
          });
          return;
        }
        const lastMiniSpan = lastSpan.miniSpans[0];
        const {
          backgroundColor,
          backgroundColorGradient,
          borderColor,
          borderOpacity,
          borderRadius,
          borderWidth,
          degrees,
          elements,
          isGradient,
          opacityColor,
          opacityColorGradient,
          paddingX,
          paddingY,
        } = lastMiniSpan;
        const fields = {
          backgroundColor,
          backgroundColorGradient,
          borderColor,
          borderOpacity,
          borderRadius,
          borderWidth,
          degrees,
          elements,
          isGradient,
          opacityColor,
          opacityColorGradient,
          paddingX,
          paddingY,
        };
        for (let field in fields) {
          newColumn[field] = fields[field];
        }
        delete newColumn.spans;
        delete newColumn.latestSpanID;
        newColumn.isSpan = false;
        setLayout((prev) => {
          return newLayouts;
        });
        return;
      }
      const {
        backgroundColor,
        backgroundColorGradient,
        borderColor,
        borderOpacity,
        borderRadius,
        borderWidth,
        degrees,
        elements,
        isGradient,
        opacityColor,
        opacityColorGradient,
        paddingX,
        paddingY,
      } = lastSpan;
      const fields = {
        backgroundColor,
        backgroundColorGradient,
        borderColor,
        borderOpacity,
        borderRadius,
        borderWidth,
        degrees,
        elements,
        isGradient,
        opacityColor,
        opacityColorGradient,
        paddingX,
        paddingY,
      };
      for (let field in fields) {
        newColumn[field] = fields[field];
      }
      delete newColumn.spans;
      delete newColumn.latestSpanID;
      newColumn.isSpan = false;
    }
    setLayout((prev) => {
      return newLayouts;
    });
  };

  const updateMiniSpan = (data, id, conID, colID, spnID) => {
    setLayout((prev) => {
      const newLayouts = lodash.cloneDeep(layouts);
      const IDX = newLayouts.findIndex((l) => l.container.id === conID);
      const idx = newLayouts[IDX].columns.findIndex((c) => c.id === colID);
      const sidx = newLayouts[IDX].columns[idx].spans.findIndex(
        (s) => s.id === spnID
      );
      const msidx = newLayouts[IDX].columns[idx].spans[
        sidx
      ].miniSpans.findIndex((ms) => ms.id === id);
      const newMiniSpans = newLayouts[IDX].columns[idx].spans[sidx].miniSpans;
      newMiniSpans[msidx] = data;
      return newLayouts;
    });
  };

  const deleteMiniSpan = (id) => {
    const { conID, colID, spnID, mspnID } = id;
    const newLayouts = lodash.cloneDeep(layouts);
    const IDX = newLayouts.findIndex((l) => l.container.id === conID);
    const newLayout = newLayouts[IDX];
    const idx = newLayout.columns.findIndex((c) => c.id === colID);
    const newColumn = newLayout.columns[idx];
    const newSpans = newColumn.spans;
    const sidx = newColumn.spans.findIndex((s) => s.id === spnID);
    const newMiniSpans = newSpans[sidx].miniSpans;
    const msidx = newMiniSpans.findIndex((ms) => ms.id === mspnID);
    newMiniSpans.splice(msidx, 1);
    if (newMiniSpans.length === 1 && newSpans.length === 1) {
      const lastMiniSpan = newMiniSpans[0];
      const {
        backgroundColor,
        backgroundColorGradient,
        borderColor,
        borderOpacity,
        borderRadius,
        borderWidth,
        degrees,
        elements,
        isGradient,
        opacityColor,
        opacityColorGradient,
        paddingX,
        paddingY,
      } = lastMiniSpan;
      const fields = {
        backgroundColor,
        backgroundColorGradient,
        borderColor,
        borderOpacity,
        borderRadius,
        borderWidth,
        degrees,
        elements,
        isGradient,
        opacityColor,
        opacityColorGradient,
        paddingX,
        paddingY,
      };
      for (let field in fields) {
        newColumn[field] = fields[field];
      }
      delete newColumn.spans;
      delete newColumn.latestSpanID;
      newColumn.isSpan = false;
    } else if (newMiniSpans.length === 0 && newSpans.length === 2) {
      const lastSpan = newSpans.find((s) => s.isMiniSpan === false);
      const {
        backgroundColor,
        backgroundColorGradient,
        borderColor,
        borderOpacity,
        borderRadius,
        borderWidth,
        degrees,
        elements,
        isGradient,
        opacityColor,
        opacityColorGradient,
        paddingX,
        paddingY,
      } = lastSpan;
      const fields = {
        backgroundColor,
        backgroundColorGradient,
        borderColor,
        borderOpacity,
        borderRadius,
        borderWidth,
        degrees,
        elements,
        isGradient,
        opacityColor,
        opacityColorGradient,
        paddingX,
        paddingY,
      };
      for (let field in fields) {
        newColumn[field] = fields[field];
      }
      delete newColumn.spans;
      delete newColumn.latestSpanID;
      newColumn.isSpan = false;
    }
    setLayout((prev) => {
      return newLayouts;
    });
  };

  const cloneMiniSpan = (id) => {
    const { conID, colID, spnID, mspnID } = id;
    const newLayouts = lodash.cloneDeep(layouts);
    const IDX = newLayouts.findIndex((l) => l.container.id === conID);
    const newLayout = newLayouts[IDX];
    const idx = newLayout.columns.findIndex((c) => c.id === colID);
    const newColumn = newLayout.columns[idx];
    const newSpans = newColumn.spans;
    const sidx = newSpans.findIndex((s) => s.id === spnID);
    const newSpan = newColumn.spans[sidx];
    const newMiniSpans = newSpan.miniSpans;
    const msidx = newSpan.miniSpans.findIndex((ms) => ms.id === mspnID);
    const newMiniSpan = lodash.cloneDeep(newSpan.miniSpans[msidx]);
    const idPaths = newMiniSpan.id.split("-");
    newMiniSpan.id = `MS-${idPaths[1]}-${idPaths[2]}-${idPaths[3]}-${newSpan.latestMiniSpanID}`;
    newSpan.latestMiniSpanID += 1;
    newMiniSpan.elements.map((e) => {
      const type = e.id.split("-")[0];
      e.id = `${type}-${Math.ceil(Math.random() * 1e9).toString(36)}`;
    });
    newMiniSpans.splice(msidx + 1, 0, newMiniSpan);
    setLayout((prev) => {
      return newLayouts;
    });
  };

  const deleteElement = (id) => {
    const { conID, colID, spnID, mspnID, eleID } = id;
    let newElements;
    setLayout((prev) => {
      const newLayouts = lodash.cloneDeep(prev);
      const IDX = newLayouts.findIndex((l) => l.container.id === conID);
      const idx = newLayouts[IDX].columns.findIndex((c) => c.id === colID);
      if (spnID) {
        const sidx = newLayouts[IDX].columns[idx].spans.findIndex(
          (s) => s.id === spnID
        );
        if (mspnID) {
          const msidx = newLayouts[IDX].columns[idx].spans[
            sidx
          ].miniSpans.findIndex((ms) => ms.id === mspnID);
          newElements =
            newLayouts[IDX].columns[idx].spans[sidx].miniSpans[msidx].elements;
        } else {
          newElements = newLayouts[IDX].columns[idx].spans[sidx].elements;
        }
      } else {
        newElements = newLayouts[IDX].columns[idx].elements;
      }
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
    if (symbol === "+" && currentSize < 12) {
      newColumns[idx].size = currentSize + 1;
    } else if (symbol === "-") {
      if (newColumns[idx].isSpan) {
        if (currentSize - 1 < 3) {
          setAlert(true);
        }
        newColumns[idx].size = Math.max(currentSize - 1, 3);
      } else {
        newColumns[idx].size = Math.max(currentSize - 1, 1);
      }
    }
    setLayout((prev) => {
      return newLayouts;
    });
  };

  const changeSizeSpan = (id, symbol) => {
    const { conID, colID, spnID } = id;
    const newLayouts = [...layouts];
    const IDX = newLayouts.findIndex((l) => l.container.id === conID);
    const newColumns = newLayouts[IDX].columns;
    const idx = newColumns.findIndex((c) => c.id === colID);
    const newSpans = newColumns[idx].spans;
    const sidx = newSpans.findIndex((s) => s.id === spnID);
    const currentSize = newSpans[sidx].size;
    if (symbol === "+" && currentSize < 12) {
      newSpans[sidx].size = currentSize + 1;
    } else if (symbol === "-") {
      newSpans[sidx].size = Math.max(currentSize - 1, 1);
    }
    setLayout((prev) => {
      return newLayouts;
    });
  };

  const changeSizeMiniSpan = (id, symbol) => {
    const { conID, colID, spnID, mspnID } = id;
    const newLayouts = [...layouts];
    const IDX = newLayouts.findIndex((l) => l.container.id === conID);
    const newColumns = newLayouts[IDX].columns;
    const idx = newColumns.findIndex((c) => c.id === colID);
    const newSpans = newColumns[idx].spans;
    const sidx = newSpans.findIndex((s) => s.id === spnID);
    const newMiniSpans = newSpans[sidx].miniSpans;
    const msidx = newMiniSpans.findIndex((ms) => ms.id === mspnID);
    const currentSize = newMiniSpans[msidx].size;
    if (symbol === "+" && currentSize < 12) {
      newMiniSpans[msidx].size = currentSize + 1;
    } else if (symbol === "-") {
      newMiniSpans[msidx].size = Math.max(currentSize - 1, 1);
    }
    setLayout((prev) => {
      return newLayouts;
    });
  };

  const SortableContainerItem = ({ id, elementData, children }) => {
    const index = layouts.findIndex((l) => l.container.id == id);

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
      disabled: disableConDrag,
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
          ref={(el) => {
            contained.current[index] = el || null;
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
    const hugeElementType = ["img", "yt", "gly"];

    const IDX = layouts.findIndex((l) => l.container.id === containerId);
    const idx = layouts[IDX].columns.findIndex((c) => c.id === id);
    const {
      attributes,
      listeners,
      setActivatorNodeRef,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id,
      data: { type: "COLUMN", conID: containerId },
      animateLayoutChanges: noLayoutAnimWhileSorting,
      disabled: disableColDrag,
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
      isSpan,
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
        {...(isSpan ? listeners : {})}
        style={style}
        className={`column-area col-span-${size} `}
        id={`${containerId}/${id}`}
        data-drop="COLUMN"
        onMouseMove={(e) => {
          scheduleBTNUpdate(e);
        }}
      >
        {isSpan ? (
          <div
            className="grid grid-flow-row-dense auto-rows-[minmax(40px,auto)] gap-4"
            ref={(el) => {
              setColRef(IDX, idx, el);
            }}
          >
            {children}
          </div>
        ) : (
          <div
            className={`column-area border-[1px]  border-dashed border-gray-600 flex ${
              elementData.elements.length > 0 ||
              (dropTargetRef.current.index?.colI === idx &&
                dropTargetRef.current.index?.conI === IDX &&
                hugeElementType.includes(preview?.type))
                ? "min-h-[40px]"
                : "h-[200px]"
            } justify-center items-center text-center relative p-1`}
            ref={(el) => {
              setColRef(IDX, idx, el);
            }}
            data-drop="COLUMN"
            id={id}
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
                  dndHandleCol={{ listeners, setActivatorNodeRef }}
                  changeSizeColumn={changeSizeColumn}
                  onDragAbleCol={() => setDisableColDrag(false)}
                  onDragDisableCol={() => setDisableColDrag(true)}
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
        )}
      </div>
    );
  };

  const SortableSpanItem = ({
    id,
    containerId,
    columnId,
    elementData,
    children,
  }) => {
    const hugeElementType = ["img", "yt", "gly"];

    const IDX = layouts.findIndex((l) => l.container.id === containerId);
    const idx = layouts[IDX].columns.findIndex((c) => c.id === columnId);
    const sidx = layouts[IDX].columns[idx].spans.findIndex((s) => s.id === id);

    const {
      attributes,
      listeners,
      setNodeRef,
      setActivatorNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id,
      data: {
        type: "SPAN",
        conID: containerId,
        colID: columnId,
      },
      disabled: disableSpnDrag,
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
      isMiniSpan,
    } = elementData;

    const eleLength =
      sidx > -1 ? layouts[IDX].columns[idx].spans[sidx].elements.length : 0;

    const setHeight = () => {
      if (
        eleLength > 0 ||
        (dropTargetRef.current.index?.colI === idx &&
          dropTargetRef.current.index?.spnI === sidx &&
          dropTargetRef.current.index?.conI === IDX &&
          hugeElementType.includes(preview?.type))
      ) {
        return "min-h-[40px]";
      } else {
        return "h-[92px]";
      }
    };

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
        style={style}
        className={`grid grid-cols-12`}
        id={`${containerId}/${columnId}/${id}`}
        data-drop="SPAN"
        onMouseMove={(e) => {
          scheduleBTNUpdate(e);
        }}
      >
        {isMiniSpan ? (
          <div className={`col-span-12`}>
            <div className="grid grid-cols-12 gap-4 w-full">{children}</div>
          </div>
        ) : (
          <div
            className={`border-[1px] ${setHeight()} border-dashed border-gray-600 flex-1 justify-center items-center text-center relative p-1 col-span-12`}
            data-drop="SPAN"
            id={id}
            onDragOver={(e) => {
              handleDuring(e);
            }}
          >
            {hover === id && !activeID && (
              <div
                className="z-[1000] absolute pointer-events-auto"
                onMouseEnter={() => setHover(id)}
              >
                <OptionButtonGroup
                  element={{
                    spnData: elementData,
                    conID: containerId,
                    colID: columnId,
                  }}
                  changeSpanPosition={change_span_position}
                  clone={cloneColumn}
                  cloneSpn={cloneSpan}
                  id={{ conID: containerId, colID: columnId, spnID: id }}
                  remove={deleteColumn}
                  removeSpn={deleteSpan}
                  offcavanas="Span"
                  onUpdate={updateSpan}
                  modal={openModal}
                  changeSizeColumn={changeSizeColumn}
                  changeSizeSpan={changeSizeSpan}
                  dndHandleSpn={{ listeners, setActivatorNodeRef }}
                  onDragAbleCol={() => setDisableColDrag(false)}
                  onDragDisableCol={() => setDisableColDrag(true)}
                  onDragAbleSpn={() => setDisableSpnDrag(false)}
                  onDragDisableSpn={() => setDisableSpnDrag(true)}
                  spnIndex={sidx}
                />
              </div>
            )}

            <div
              className="w-full h-full flex flex-col"
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
        )}
      </div>
    );
  };

  const SortableMiniSpanItem = ({
    id,
    elementData,
    containerId,
    columnId,
    spanId,
    children,
  }) => {
    const hugeElementType = ["img", "yt", "gly"];
    const IDX = layouts.findIndex((l) => l.container.id === containerId);
    const idx = layouts[IDX].columns.findIndex((c) => c.id === columnId);
    const sidx = layouts[IDX].columns[idx].spans.findIndex(
      (s) => s.id === spanId
    );
    const msidx = layouts[IDX].columns[idx].spans[sidx].miniSpans.findIndex(
      (ms) => ms.id === id
    );

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

    const {
      attributes,
      listeners,
      setNodeRef,
      setActivatorNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id,
      data: {
        type: "MINI-SPAN",
        conID: containerId,
        colID: columnId,
        spnID: spanId,
      },
      disabled: disableMspnDrag,
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

    const eleLength =
      sidx > -1
        ? layouts[IDX].columns[idx].spans[sidx].miniSpans[msidx].elements.length
        : 0;

    const setHeight = () => {
      if (
        eleLength > 0 ||
        (dropTargetRef.current.index?.colI === idx &&
          dropTargetRef.current.index?.spnI === sidx &&
          dropTargetRef.current.index?.mspnI === msidx &&
          dropTargetRef.current.index?.conI === IDX &&
          hugeElementType.includes(preview?.type))
      ) {
        return "min-h-[40px]";
      } else {
        return "h-[92px]";
      }
    };

    return (
      <div
        className={`col-span-${size}`}
        ref={setNodeRef}
        {...attributes}
        style={style}
        data-drop="MINI-SPAN"
        id={`${containerId}/${columnId}/${spanId}/${id}`}
      >
        <div
          className={`border-[1px] ${setHeight()} border-dashed border-gray-600 flex-1 justify-center items-center text-center relative p-1 `}
          data-drop="MINI-SPAN"
          id={id}
          onDragOver={(e) => {
            handleDuring(e);
          }}
        >
          {hover === id && !activeID && (
            <div
              className="z-[1000] absolute pointer-events-auto"
              onMouseEnter={() => setHover(id)}
            >
              <OptionButtonGroup
                element={{
                  mspnData: elementData,
                  conID: containerId,
                  colID: columnId,
                  spnID: spanId,
                }}
                clone={cloneColumn}
                cloneSpn={cloneSpan}
                cloneMspn={cloneMiniSpan}
                id={{
                  conID: containerId,
                  colID: columnId,
                  spnID: spanId,
                  mspnID: id,
                }}
                remove={deleteColumn}
                removeSpn={deleteSpan}
                removeMspn={deleteMiniSpan}
                offcavanas="Mini Span"
                onUpdate={updateMiniSpan}
                modal={openModal}
                changeSizeColumn={changeSizeColumn}
                changeSizeSpan={changeSizeSpan}
                changeSpanPosition={change_span_position}
                changeMiniSpanPosition={change_mini_span_position}
                changeSizeMiniSpan={changeSizeMiniSpan}
                dndHandleMspn={{ listeners, setActivatorNodeRef }}
                onDragAbleCol={() => setDisableColDrag(false)}
                onDragDisableCol={() => setDisableColDrag(true)}
                onDragAbleSpn={() => setDisableSpnDrag(false)}
                onDragDisableSpn={() => setDisableSpnDrag(true)}
                onDragAbleMspn={() => setDisableMspnDrag(false)}
                onDragDisableMspn={() => setDisableMspnDrag(true)}
                spnIndex={sidx}
                mspnIndex={msidx}
              />
            </div>
          )}

          <div
            className="w-full h-full flex flex-col"
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
    spanId = null,
    miniSpanId = null,
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
      data: {
        type: "ELEMENT",
        conID: containerId,
        colID: columnId,
        spnID: spanId,
        mspnID: miniSpanId,
      },
      animateLayoutChanges: noLayoutAnimWhileSorting,
      disabled: disableEleDrag,
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
      hoverElement.id === id ? theme?.mainColor[1] : theme?.mainColor[0];
    const opctText =
      hoverElement.id === id ? opacity_2_hex(100) : opacity_2_hex(255);

    const IDX = layouts.findIndex((l) => l.container.id === containerId);
    const idx = layouts[IDX].columns.findIndex((c) => c.id === columnId);
    const isElement = layouts[IDX].columns[idx].elements.length > 1;
    const nextI =
      layouts[IDX].columns[idx].elements.findIndex((e) => e.id === id) + 1;
    const isLastList =
      layouts[IDX].columns[idx].elements[nextI]?.type !== "list";

    useEffect(() => {
      if (isDragging) {
        setDeleteID(null);
      }
    }, [isDragging]);

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

    const animationForElement =
      "transition-all duration-200 ease-in-out will-change-transform";

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
          setDeleteID({
            conID: containerId,
            colID: columnId,
            spnID: spanId,
            mspnID: miniSpanId,
            eleID: id,
          });
        }}
        onMouseMove={(e) => {
          scheduleBTNUpdate(e);
        }}
        sx={{
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {type === "img" && (
          <div className="relative inline-block w-full">
            <img
              draggable={false}
              src={elementData.src}
              onMouseEnter={() => setHoverElement({ id: id })}
              className={`${animationForElement} rounded-[8px]`}
            />
            <div
              className={`rounded-[8px] pointer-events-none absolute inset-0 ${
                deleteID?.eleID === id ? "bg-red-500/50" : "hidden"
              }`}
            ></div>
          </div>
        )}
        {type === "yt" && (
          <div className="relative inline-block w-full">
            <img
              src={elementData.src}
              draggable={false}
              onMouseEnter={() => setHoverElement({ id: id })}
              className={`${animationForElement} rounded-[8px]`}
            />
            <div className="pointer-events-none absolute inset-0 grid place-items-center ">
              <div
                className="rounded-full w-[50px] h-[50px] grid place-items-center"
                style={{
                  backgroundColor: theme?.mainColor[1] + opacity_2_hex(200),
                }}
              >
                <Play
                  className="w-8 h-8 text-white"
                  strokeWidth={0}
                  aria-hidden="true"
                  fill="white"
                />
              </div>
            </div>

            <div
              className={`rounded-[8px] pointer-events-none absolute inset-0 ${
                deleteID?.eleID === id ? "bg-red-500/50" : "hidden"
              }`}
            ></div>
          </div>
        )}

        {type === "gly" && (
          <div className="relative inline-block w-full">
            <img
              src={elementData.src}
              draggable={false}
              onMouseEnter={() => setHoverElement({ id: id })}
              className={`${animationForElement} rounded-[8px]`}
            />
            <div className="pointer-events-none absolute inset-0 grid place-items-center ">
              <div
                className="rounded-full w-[50px] h-[50px] grid place-items-center"
                style={{
                  backgroundColor: theme?.mainColor[1] + opacity_2_hex(200),
                }}
              >
                <Plus
                  className="w-7 h-7 text-white"
                  strokeWidth={5}
                  aria-hidden="true"
                  fill="white"
                />
              </div>
            </div>

            <div
              className={`rounded-[8px] pointer-events-none absolute inset-0 ${
                deleteID?.eleID === id ? "bg-red-500/50" : "hidden"
              }`}
            ></div>
          </div>
        )}
        {type === "text" && (
          <div
            style={{
              color: theme?.textColor[0] + opctText,
              fontSize: 14,
              marginTop: 10,
              marginBottom: 10,
            }}
            className={`${theme?.text.value} ${animationForElement} ${
              deleteID?.eleID === id
                ? " rounded-md border border-red-400 bg-red-300/10 p-2 border-dashed"
                : ""
            }`}
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
            className={`${theme?.textHeading.value} ${animationForElement} ${
              deleteID?.eleID === id
                ? "rounded-md border border-red-400 bg-red-300/10 p-2 border-dashed"
                : ""
            }`}
            onMouseEnter={() => setHoverElement({ id: id })}
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
              className={``}
              variant="contained"
              disableElevation
              sx={{
                marginTop: 1,
                marginBottom: 1,
                boxShadow: "none",
                backgroundColor: theme?.mainColor[1],
                width: 101,
                height: 28,
                border: 0,
                m: 0,
                borderRadius: 2,
                fontSize: 13,
                fontFamily: setFont(theme?.text.value),
                py: 2,
              }}
              onMouseEnter={() => setHoverElement({ id: id })}
              onMouseLeave={() => setHoverElement(false)}
            >
              {elementData.label}
            </Button>
          </Box>
        )}

        {type === "divider" && (
          <div
            className={`${isElement ? "w-full" : "w-[100px]"} h-[0.5px] my-1`}
            style={{ backgroundColor: "#6a6a6a" }}
            onMouseEnter={() => setHoverElement({ id: id })}
            onMouseLeave={() => setHoverElement(false)}
          />
        )}
        {type === "btnG" && (
          <ButtonGroup
            aria-label="Basic button group"
            onMouseEnter={() => setHoverElement({ id: id })}
            onMouseLeave={() => setHoverElement(false)}
            sx={{
              borderRadius: 2,
              borderStyle: deleteID?.eleID === id ? "dashed" : "",
              borderWidth: deleteID?.eleID === id ? 1 : 0,
              borderColor: deleteID?.eleID === id ? "#f87171" : "",
              backgroundColor: deleteID?.eleID === id ? "#fca5a51a" : "",
              display: "inline-block",
              p: 0.5,
              lineHeight: 0,
            }}
          >
            <Button
              variant="contained"
              disableElevation
              sx={{
                marginTop: 1,
                marginBottom: 1,
                boxShadow: "none",
                backgroundColor: theme?.mainColor[1],
                width: 101,
                height: 28,
                border: 0,
                m: 0,
                borderRadius: 2,
                marginRight: 0.25,
                fontSize: 13,
                fontFamily: setFont(theme?.text.value),
                py: 2,
              }}
            >
              Click 1
            </Button>
            <Button
              variant="contained"
              disableElevation
              sx={{
                marginTop: 1,
                marginBottom: 1,
                boxShadow: "none",
                backgroundColor: theme?.mainColor[1],
                width: 101,
                height: 28,
                border: 0,
                m: 0,
                borderRadius: 2,
                marginLeft: 0.25,
                fontSize: 13,
                fontFamily: setFont(theme?.text.value),
                py: 2,
              }}
            >
              Click 2
            </Button>
          </ButtonGroup>
        )}
        {type === "icon" && (
          <div className="w-full flex items-center justify-center ">
            <div
              className="rounded-full size-[70px]  flex items-center justify-center"
              style={{
                borderStyle: deleteID?.eleID === id ? "dashed" : "",
                borderWidth: deleteID?.eleID === id ? 1 : 0,
                borderColor: deleteID?.eleID === id ? "#f87171" : "",
                backgroundColor: deleteID?.eleID === id ? "#fca5a51a" : "",
              }}
            >
              <div
                className="rounded-full size-[60px] p-1 flex items-center justify-center"
                style={{ backgroundColor: theme?.mainColor[0] }}
              >
                <ScanEye className=" text-white" size={38} />
              </div>
            </div>
          </div>
        )}
        {type === "list" && (
          <Box
            sx={{
              width: "100%",
              // กันกรณีพื้นหลังกลืนสี
              mx: 0,
              px: 0,
              py: 0,
              my: 0,
              borderStyle: deleteID?.eleID === id ? "dashed" : "",
              borderWidth: deleteID?.eleID === id ? 1 : 0,
              borderColor: deleteID?.eleID === id ? "#f87171" : "",
              backgroundColor: deleteID?.eleID === id ? "#fca5a51a" : "",
              borderRadius: 2,
            }}
            onMouseEnter={() => setHoverElement({ id })}
            onMouseLeave={() => setHoverElement(false)}
          >
            <List dense sx={{ width: "100%", py: 0, my: 0.5 }}>
              <ListItem disablePadding>
                <ListItemAvatar sx={{ pl: 1 }}>
                  <div
                    className="rounded-full size-[36px] p-1 flex items-center justify-center"
                    style={{ backgroundColor: theme?.mainColor[0] }}
                  >
                    <ScanEye size={20} className="text-white" />
                  </div>
                </ListItemAvatar>
                <ListItemText
                  disableTypography
                  primary={
                    <Typography
                      sx={{
                        fontSize: 15,
                        fontFamily: setFont(theme?.textHeading.value),
                        color: theme?.mainColor[1],
                      }}
                    >
                      What is Lorem Ipsum?
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography
                        sx={{
                          fontSize: 13,
                          fontFamily: setFont(theme?.text.value),
                          color: theme?.textColor[0],
                          fontWeight: 1,
                        }}
                      >
                        Lorem Ipsum is simply dummy text of the typesetting
                        industry.
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            </List>

            {!isLastList && (
              <Divider sx={{ borderStyle: "dotted", borderColor: "grey" }} />
            )}
          </Box>
        )}
      </Box>
    );
  };

  const change_column_position = (oldIndex, newIndex, containerIndex) => {
    setLayout((prev) => {
      const newLayouts = prev.map((l) => ({ ...l, columns: [...l.columns] }));
      const newColumns = newLayouts[containerIndex].columns;
      const [column] = newColumns.splice(oldIndex, 1);
      newColumns.splice(newIndex, 0, column);
      return newLayouts;
    });
  };

  const change_span_position = (index, ids, symbol) => {
    const { conID, colID } = ids;
    const newLayouts = lodash.cloneDeep(layouts);
    const containerIndex = newLayouts.findIndex(
      (l) => l.container.id === conID
    );
    const columnIndex = newLayouts[containerIndex].columns.findIndex(
      (c) => c.id === colID
    );
    const newSpans = newLayouts[containerIndex].columns[columnIndex].spans;
    if (
      (symbol === "-" && index === 0) ||
      (symbol === "+" && index === newSpans.length - 1)
    )
      return;
    const [span] = newSpans.splice(index, 1);
    if (symbol === "-") {
      newSpans.splice(index - 1, 0, span);
    } else if (symbol === "+") {
      newSpans.splice(index + 1, 0, span);
    }
    setLayout((prev) => {
      return newLayouts;
    });
  };

  const change_mini_span_position = (index, ids, symbol) => {
    const { conID, colID, spnID } = ids;
    const newLayouts = lodash.cloneDeep(layouts);
    const containerIndex = newLayouts.findIndex(
      (l) => l.container.id === conID
    );
    const columnIndex = newLayouts[containerIndex].columns.findIndex(
      (c) => c.id === colID
    );
    const spanIndex = newLayouts[containerIndex].columns[
      columnIndex
    ].spans.findIndex((s) => s.id === spnID);
    const newMiniSpans =
      newLayouts[containerIndex].columns[columnIndex].spans[spanIndex]
        .miniSpans;
    if (
      (symbol === "-" && index === 0) ||
      (symbol === "+" && index === newMiniSpans.length - 1)
    )
      return;
    const [miniSpan] = newMiniSpans.splice(index, 1);
    if (symbol === "-") {
      newMiniSpans.splice(index - 1, 0, miniSpan);
    } else if (symbol === "+") {
      newMiniSpans.splice(index + 1, 0, miniSpan);
    }
    setLayout((prev) => {
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

  const change_element_position = (
    oldIndex,
    newIndex,
    containerIndex,
    columnIndex,
    oldSpanIndex = null,
    newSpanIndex = null,
    oldMiniSpanIndex = null,
    newMiniSpanIndex = null
  ) => {
    const newLayouts = [...layouts];
    let newElements;
    if (Number.isInteger(oldSpanIndex) && Number.isInteger(newSpanIndex)) {
      let oldElements, newElements;
      if (Number.isInteger(oldMiniSpanIndex)) {
        oldElements =
          newLayouts[containerIndex].columns[columnIndex].spans[oldSpanIndex]
            .miniSpans[oldMiniSpanIndex].elements;
      } else {
        oldElements =
          newLayouts[containerIndex].columns[columnIndex].spans[oldSpanIndex]
            .elements;
      }

      if (Number.isInteger(newMiniSpanIndex)) {
        newElements =
          newLayouts[containerIndex].columns[columnIndex].spans[newSpanIndex]
            .miniSpans[newMiniSpanIndex].elements;
      } else {
        newElements =
          newLayouts[containerIndex].columns[columnIndex].spans[newSpanIndex]
            .elements;
      }

      const [element] = oldElements.splice(oldIndex, 1);
      newElements.splice(newIndex, 0, element);
    } else {
      newElements = newLayouts[containerIndex].columns[columnIndex].elements;
      const [element] = newElements.splice(oldIndex, 1);
      newElements.splice(newIndex, 0, element);
    }

    setLayout((prev) => {
      return newLayouts;
    });
  };

  const change_element_position_new_column = (
    oldIndex,
    newIndex,
    containerIndex,
    oldColumnIndex,
    newColumnIndex,
    oldSpanIndex = null,
    newSpanIndex = null,
    oldMiniSpanIndex = null,
    newMiniSpanIndex = null
  ) => {
    const newLayouts = [...layouts];
    let oldElements, newElements;
    if (Number.isInteger(oldSpanIndex)) {
      if (Number.isInteger(oldMiniSpanIndex)) {
        oldElements =
          newLayouts[containerIndex].columns[oldColumnIndex].spans[oldSpanIndex]
            .miniSpans[oldMiniSpanIndex].elements;
      } else {
        oldElements =
          newLayouts[containerIndex].columns[oldColumnIndex].spans[oldSpanIndex]
            .elements;
      }
    } else {
      oldElements =
        newLayouts[containerIndex]?.columns[oldColumnIndex].elements;
    }

    if (Number.isInteger(newSpanIndex)) {
      if (Number.isInteger(newMiniSpanIndex)) {
        newElements =
          newLayouts[containerIndex].columns[newColumnIndex].spans[newSpanIndex]
            .miniSpans[newMiniSpanIndex].elements;
      } else {
        newElements =
          newLayouts[containerIndex].columns[newColumnIndex].spans[newSpanIndex]
            .elements;
      }
    } else {
      newElements = newLayouts[containerIndex].columns[newColumnIndex].elements;
    }

    if (!oldElements || !newElements) return;
    const [element] = oldElements.splice(oldIndex, 1);
    newElements.splice(newIndex, 0, element);

    setLayout((prev) => {
      return newLayouts;
    });
  };

  const change_element_position_new_container = (
    oldIndex,
    newIndex,
    oldContainerIndex,
    newContainerIndex,
    oldColumnIndex,
    newColumnIndex,
    oldSpanIndex = null,
    newSpanIndex = null,
    oldMiniSpanIndex = null,
    newMiniSpanIndex = null
  ) => {
    const newLayouts = [...layouts];
    let oldElements, newElements;

    if (Number.isInteger(oldSpanIndex)) {
      if (Number.isInteger(oldMiniSpanIndex)) {
        oldElements =
          newLayouts[oldContainerIndex].columns[oldColumnIndex].spans[
            oldSpanIndex
          ].miniSpans[oldMiniSpanIndex].elements;
      } else {
        oldElements =
          newLayouts[oldContainerIndex].columns[oldColumnIndex].spans[
            oldSpanIndex
          ].elements;
      }
    } else {
      oldElements =
        newLayouts[oldContainerIndex].columns[oldColumnIndex].elements;
    }

    if (Number.isInteger(newSpanIndex)) {
      if (Number.isInteger(newMiniSpanIndex)) {
        newElements =
          newLayouts[newContainerIndex].columns[newColumnIndex].spans[
            newSpanIndex
          ].miniSpans[newMiniSpanIndex].elements;
      } else {
        newElements =
          newLayouts[newContainerIndex].columns[newColumnIndex].spans[
            newSpanIndex
          ].elements;
      }
    } else {
      newElements =
        newLayouts[newContainerIndex].columns[newColumnIndex].elements;
    }

    const [element] = oldElements.splice(oldIndex, 1);
    newElements.splice(newIndex, 0, element);

    setLayout((prev) => {
      return newLayouts;
    });
  };

  const ColumnPreview = ({ element, id, children }) => {
    const { colID } = id;

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
      isSpan,
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
      <div className={`col-span-${size}`}>
        {isSpan ? (
          <div className="grid grid-flow-row-dense auto-rows-[minmax(40px,auto)] gap-4">
            {children}
          </div>
        ) : (
          <div
            className={` border-[1px]  border-dashed border-gray-600 flex ${
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
        )}
      </div>
    );
  };

  const SpanPreview = ({ elementData, children }) => {
    const hugeElementType = ["img", "yt", "gly"];

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
      elements,
      isMiniSpan,
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
      <div className={`grid grid-cols-12`} data-drop="SPAN">
        {isMiniSpan ? (
          <div className={`col-span-12`}>
            <div className="grid grid-cols-12 gap-4 w-full">{children}</div>
          </div>
        ) : (
          <div
            className={`border-[1px] ${
              elements.length > 0 ? "min-h-[40px]" : "h-[92px]"
            } border-dashed border-gray-600 flex-1 justify-center items-center text-center relative p-1 col-span-12`}
            data-drop="SPAN"
          >
            <div
              className="w-full h-full flex flex-col"
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
        )}
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

  const MiniSpanPreview = ({ element, children }) => {
    const {
      size,
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
      <div className={`col-span-${size}`}>
        <div
          className={`border-[1px] ${
            elements.length > 0 ? "min-h-[40px]" : "h-[92px]"
          } border-dashed border-gray-600 flex-1 justify-center items-center text-center relative p-1 `}
        >
          <div
            className="w-full h-full flex flex-col"
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

  const ElementPreview = ({ element }) => {
    return (
      <Box
        style={{ width: "100%", textAlign: "center" }}
        onDragOver={(e) => {
          handleDuring(e);
        }}
      >
        {element.type === "img" && (
          <div className="relative inline-block w-full">
            <img src={element.src} className={` rounded-[8px] `} />
          </div>
        )}

        {element.type === "yt" && (
          <div className="relative inline-block w-full">
            <img src={element.src} className={` rounded-[8px] `} />
            <div className="pointer-events-none absolute inset-0 grid place-items-center ">
              <div
                className="rounded-full w-[50px] h-[50px] grid place-items-center"
                style={{
                  backgroundColor: theme?.mainColor[1] + opacity_2_hex(200),
                }}
              >
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
            <img src={element.src} className={` rounded-[8px] }`} />
            <div className="pointer-events-none absolute inset-0 grid place-items-center ">
              <div
                className="rounded-full w-[50px] h-[50px] grid place-items-center"
                style={{
                  backgroundColor: theme?.mainColor[1] + opacity_2_hex(200),
                }}
              >
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
              color: theme?.textColor[0],
              fontSize: 14,
              marginTop: 10,
              marginBottom: 10,
            }}
            className={`${theme?.text.value} `}
          >
            {element.label}
          </div>
        )}
        {element.type === "heading" && (
          <div
            style={{
              color: theme?.mainColor[0],
              fontSize: 18,
              marginTop: 10,
              marginBottom: 10,
            }}
            className={`${theme?.textHeading.value} `}
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
              backgroundColor: theme?.mainColor[1],
              width: 101,
              height: 28,
              borderRadius: 2,
              fontSize: 13,
              fontFamily: setFont(theme?.text.value),
              py: 2,
            }}
          >
            {element.label}
          </Button>
        )}
        {element.type === "divider" && (
          <>
            <div
              className={`w-[100px] h-[0.5px] bg-red-500 my-1`}
              style={{ backgroundColor: "#6a6a6a" }}
            />
          </>
        )}
        {element.type === "btnG" && (
          <ButtonGroup aria-label="Basic button group" sx={{ borderRadius: 2 }}>
            <Button
              variant="contained"
              disableElevation
              sx={{
                marginTop: 1,
                marginBottom: 1,
                boxShadow: "none",
                backgroundColor: theme?.mainColor[1],
                width: 101,
                height: 28,
                border: 0,
                m: 0,
                borderRadius: 2,
                marginRight: 0.25,
                fontSize: 13,
                fontFamily: setFont(theme?.text.value),
                py: 2,
              }}
            >
              Click 1
            </Button>
            <Button
              variant="contained"
              disableElevation
              sx={{
                marginTop: 1,
                marginBottom: 1,
                boxShadow: "none",
                backgroundColor: theme?.mainColor[1],
                width: 101,
                height: 28,
                border: 0,
                m: 0,
                borderRadius: 2,
                marginLeft: 0.25,
                fontSize: 13,
                fontFamily: setFont(theme?.text.value),
                py: 2,
              }}
            >
              Click 2
            </Button>
          </ButtonGroup>
        )}
        {element.type === "icon" && (
          <div className="w-full flex items-center justify-center">
            <div
              className="rounded-full size-[60px] p-1 flex items-center justify-center"
              style={{ backgroundColor: theme?.mainColor[0] }}
            >
              <ScanEye className=" text-white" size={38} />
            </div>
          </div>
        )}
        {element.type === "list" && (
          <Box
            sx={{
              width: "100%",
              // กันกรณีพื้นหลังกลืนสี
              mx: 0,
              px: 0,
              py: 0,
              my: 0,
              borderRadius: 2,
            }}
          >
            <List dense sx={{ width: "100%", py: 0, my: 0.5 }}>
              <ListItem disablePadding>
                <ListItemAvatar sx={{ pl: 1 }}>
                  <div
                    className="rounded-full size-[36px] p-1 flex items-center justify-center"
                    style={{ backgroundColor: theme?.mainColor[0] }}
                  >
                    <ScanEye size={20} className="text-white" />
                  </div>
                </ListItemAvatar>
                <ListItemText
                  disableTypography
                  primary={
                    <Typography
                      sx={{
                        fontSize: 15,
                        fontFamily: setFont(theme?.textHeading.value),
                        color: theme?.mainColor[1],
                      }}
                    >
                      What is Lorem Ipsum?
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography
                        sx={{
                          fontSize: 13,
                          fontFamily: setFont(theme?.text.value),
                          color: theme?.textColor[0],
                          fontWeight: 1,
                        }}
                      >
                        Lorem Ipsum is simply dummy text of the typesetting
                        industry.
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            </List>
          </Box>
        )}
      </Box>
    );
  };

  const ElementPreviewForDrag_Drop = ({ element }) => {
    const { icon, label } = element?.preview;
    return (
        <div
          className="bg-gray-50 dark:bg-black/50 w-[95.5px] h-[70px] rounded-md text-center px-3 py-2"
          ref={(el) => setDragRef(el)}
        >
          {" "}
          <span className="material-icons-outlined text-[30px] px-2 dark:text-white/50">
            {icon}
          </span>
          <p className="text-[12px] dark:text-white/40 antialiased">{label}</p>
        </div>
    );
  };

  const findElementIndexForDND = (
    conI,
    colI,
    conID,
    colID,
    eleID,
    active,
    spnI = null,
    mspnI = null
  ) => {
    let index;

    if (Number.isInteger(spnI)) {
      if (Number.isInteger(mspnI)) {
        index = layouts[conI].columns[colI].spans[spnI].miniSpans[
          mspnI
        ].elements.findIndex((e) => e.id === eleID);
      } else {
        index = layouts[conI].columns[colI].spans[spnI].elements.findIndex(
          (e) => e.id === eleID
        );
      }
    } else {
      index = layouts[conI].columns[colI].elements.findIndex(
        (e) => e.id === eleID
      );
    }

    const elementNode = document.querySelector(
      `[data-drop="ELEMENT"][id="${conID}/${colID}/${eleID}"]`
    );

    const r = elementNode.getBoundingClientRect();

    const { top, height } = r;

    const { top: topA, height: heightA } = active.rect.current.translated;

    const mid = top + height / 2;

    const midA = topA + heightA / 2;

    let checkCenter = midA > mid ? 1 : 0;

    return index + checkCenter;
  };

  const centerPreviewUnderCursor = ({ transform }) => {
    const el = dragRef.current;
    if (!el) return transform;
    const rect = el.getBoundingClientRect();
    if(!rect) return transform;
    return {
      ...transform,
      x: transform.x - rect.width / 2,
      y: transform.y - rect.height / 2,
    };
  };

  const drag = ({ active }) => {
    const { id, data } = active;
    const { current } = data;
    let section;
    let column;
    let element;
    let span;
    let miniSpan;

    if (id.startsWith("Sec-")) {
      section = layouts.find((l) => l.container.id === id);
      setActiveItem(section);
      setActiveID(id);
    } else if (id.startsWith("Col-")) {
      section = layouts.find((l) => l.container.id === current.conID);
      column = section.columns.find((c) => c.id === id);
      setActiveItem(column);
      setActiveID({ conID: current.conID, colID: id });
    } else if (id.startsWith("Span-")) {
      section = layouts.find((l) => l.container.id === current.conID);
      column = section.columns.find((c) => c.id === current.colID);
      span = column.spans.find((s) => s.id === id);
      setActiveItem(span);
      setActiveID({ conID: current.conID, colID: current.colID, spnID: id });
    } else if (id.startsWith("MS-")) {
      section = layouts.find((l) => l.container.id === current.conID);
      column = section.columns.find((c) => c.id === current.colID);
      span = column.spans.find((s) => s.id === current.spnID);
      miniSpan = span.miniSpans.find((ms) => ms.id === id);
      setActiveItem(miniSpan);
      setActiveID({
        conID: current.conID,
        colID: current.colID,
        spnID: current.spnID,
        mspnID: id,
      });
    } else {
      section = layouts.find((l) => l.container.id === current.conID);
      const si = layouts.findIndex((l) => l.container.id === current.conID);
      column = section.columns.find((c) => c.id === current.colID);
      positionRef.current = si;
      if (column.isSpan) {
        span = column.spans.find((s) => s.id === current.spnID);
        if (span.isMiniSpan) {
          miniSpan = span.miniSpans.find((ms) => ms.id === current.mspnID);
          element = miniSpan.elements.find((e) => e.id === id);
        } else {
          element = span.elements.find((e) => e.id === id);
        }
      } else {
        element = column.elements.find((e) => e.id === id);
      }
      setActiveItem(element);
      setActiveID({
        conID: current.conID,
        colID: current.colID,
        eleID: id,
        spnID: current.spnID ? current.spnID : null,
      });
    }
  };

  const during = ({ active, over }) => {
    if (!over || !active) return;
    if (!over || !active || !over.data?.current || !active.data?.current)
      return;
    if (active.id === over.id) return;

    setIsDraggingLayout(true);

    const types = ["COLUMN", "ELEMENT", "SPAN", "MINI-SPAN"];
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
      const R = contained.current[positionRef.current]?.getBoundingClientRect();
      if (!R) return;
      const { bottom: sb, top: st } = R;
      if (!sb || !st) return;
      let rectDragRef = dragRef.current.getBoundingClientRect();
      if (!rectDragRef) rectDragRef = active?.rect?.current?.translated;
      if (!rectDragRef) return;
      const { top: t, height: h, left: l, right: r, bottom: b } = rectDragRef;
      const mid = t + h / 2;
      let checkPosition;
      if (oldColumnID === newColumnID && oldContainerID === newContainerID) {
        const IDX = layouts.findIndex((l) => l.container.id === oldContainerID);
        const idx = layouts[IDX].columns.findIndex((c) => c.id === oldColumnID);
        if (IDX === -1 || idx === -1) return;
        let oldIndex, newIndex, sidx1, sidx2, msidx1, msidx2, target;
        if (active.data.current.spnID && over.data.current.spnID) {
          sidx1 = layouts[IDX].columns[idx].spans.findIndex(
            (s) => s.id === active.data.current.spnID
          );
          sidx2 = layouts[IDX].columns[idx].spans.findIndex(
            (s) => s.id === over.data.current.spnID
          );
          if (active.data.current.mspnID) {
            msidx1 = layouts[IDX].columns[idx].spans[sidx1].miniSpans.findIndex(
              (ms) => ms.id === active.data.current.mspnID
            );
            oldIndex = layouts[IDX].columns[idx].spans[sidx1].miniSpans[
              msidx1
            ].elements.findIndex((e) => e.id === active.id);
          } else {
            oldIndex = layouts[IDX].columns[idx].spans[
              sidx1
            ].elements.findIndex((e) => e.id === active.id);
          }
          if (oldIndex === -1) return;
          if (over.data.current.mspnID) {
            msidx2 = layouts[IDX].columns[idx].spans[sidx2].miniSpans.findIndex(
              (ms) => ms.id === over.data.current.mspnID
            );
            target =
              layouts[IDX].columns[idx].spans[sidx2].miniSpans[msidx2].elements;
          } else {
            target = layouts[IDX].columns[idx].spans[sidx2].elements;
          }
          let checkPosition = true
          if((sidx1 !== sidx2) && (!msidx1 && !msidx2)){
            const span1 = document.querySelector(`[data-drop="SPAN"][id="${oldContainerID}/${active.data.current.colID}/${active.data.current.spnID}"]`)
            const span2 = document.querySelector(`[data-drop="SPAN"][id="${newContainerID}/${over.data.current.colID}/${over.data.current.spnID}"]`)
            const {top:t1,bottom:b1} = span1.getBoundingClientRect()
            const {top:t2,bottom:b2} = span2.getBoundingClientRect()
            
            if(sidx1 < sidx2){
               checkPosition = b > b1 && b > t2
            }else{
              checkPosition = t < t2 && t < b1
            }
            if(!checkGhostPosition) return
          }
          else if((sidx1 === sidx2) && (msidx1 !== msidx2)){
            const ms1 = document.querySelector(`[data-drop="MINI-SPAN"][id="${oldContainerID}/${active.data.current.colID}/${active.data.current.spnID}/${active.data.current.mspnID}"]`)
            const ms2 = document.querySelector(`[data-drop="MINI-SPAN"][id="${newContainerID}/${over.data.current.colID}/${over.data.current.spnID}/${over.data.current.mspnID}"]`)
            const {top:t1,bottom:b1,left:l1,right:r1} = ms1.getBoundingClientRect()
            const {top:t2,bottom:b2,left:l2,right:r2} = ms2.getBoundingClientRect()
            const dragRect =
    active.rect?.current?.translated ||
    active.rect?.current?.initial ||
    active.rect?.current;
    console.log(dragRect);
            if(msidx1 < msidx2){
               checkPosition = r > r1 && r > l2 && mid > t2 && mid < b2
            }else{
              checkPosition = l < l2 && l < r1&& mid > t1 && mid < b1
            }
            
          }

          if(!checkGhostPosition) return

          if (target.length === 0) {
            change_element_position(
              oldIndex,
              0,
              IDX,
              idx,
              sidx1,
              sidx2,
              msidx1,
              msidx2
            );
            return;
          } else {
            newIndex = target.findIndex((e) => e.id === over.id);
          }
        } else {
          oldIndex = layouts[IDX].columns[idx].elements.findIndex(
            (e) => e.id === active.id
          );
          newIndex = layouts[IDX].columns[idx].elements.findIndex(
            (e) => e.id === over.id
          );
          if (oldIndex === -1 || newIndex === -1) return;
        }

        change_element_position(
          oldIndex,
          newIndex,
          IDX,
          idx,
          sidx1,
          sidx2,
          msidx1,
          msidx2
        );
      } else if (
        oldColumnID !== newColumnID &&
        oldContainerID === newContainerID
      ) {
        const IDX = layouts.findIndex((l) => l.container.id === oldContainerID);
        const idx1 = layouts[IDX].columns.findIndex(
          (c) => c.id === oldColumnID
        );
        const idx2 = layouts[IDX].columns.findIndex(
          (c) => c.id === newColumnID
        );
        if (IDX === -1 || idx1 === -1 || idx2 === -1) return;
        let sidx1, msidx1;
        let sidx2, msidx2;
        let oldIndex;
        let newIndex;
        if (active.data.current.spnID) {
          const { spnID } = active.data.current;
          sidx1 = layouts[IDX].columns[idx1].spans.findIndex(
            (s) => s.id === spnID
          );
          if (active.data.current.mspnID) {
            const { mspnID } = active.data.current;
            msidx1 = layouts[IDX].columns[idx1].spans[
              sidx1
            ].miniSpans.findIndex((ms) => ms.id === mspnID);
            oldIndex = layouts[IDX].columns[idx1].spans[sidx1].miniSpans[
              msidx1
            ].elements.findIndex((e) => e.id === active.id);
          } else {
            oldIndex = layouts[IDX].columns[idx1].spans[
              sidx1
            ].elements.findIndex((e) => e.id === active.id);
          }
        } else {
          oldIndex = layouts[IDX].columns[idx1].elements.findIndex(
            (e) => e.id === active.id
          );
        }

        if (oldIndex === -1) return;

        if (over.data.current.spnID) {
          const { spnID } = over.data.current;
          sidx2 = layouts[IDX].columns[idx2].spans.findIndex(
            (s) => s.id === spnID
          );
          if (over.data.current.mspnID) {
            const { mspnID } = over.data.current;
            msidx2 = layouts[IDX].columns[idx2].spans[
              sidx2
            ].miniSpans.findIndex((ms) => ms.id === mspnID);
          }
        }

        const targetLength =
          msidx2 >= 0
            ? layouts[IDX].columns[idx2].spans[sidx2].miniSpans[msidx2].elements
                .length
            : sidx2 >= 0
            ? layouts[IDX].columns[idx2].spans[sidx2].elements.length
            : layouts[IDX].columns[idx2].elements.length;

        const {
          bottom: cb,
          top: ct,
          left: cl,
          right: cr,
        } = columned.current[IDX][idx2].getBoundingClientRect();

        if (idx2 < idx1) {
          checkPosition = mid > ct && mid < cb && l < cr - 10;
        } else if (idx2 > idx1) {
          checkPosition = mid > ct && mid < cb && r > cl + 10;
        }

        if (!checkPosition) return;

        positionRef.current = IDX;

        if (targetLength === 0) {
          change_element_position_new_column(
            oldIndex,
            0,
            IDX,
            idx1,
            idx2,
            sidx1,
            sidx2,
            msidx1,
            msidx2
          );
          return;
        } else {
          newIndex = findElementIndexForDND(
            IDX,
            idx2,
            newContainerID,
            newColumnID,
            over.id,
            active,
            sidx2,
            msidx2
          );
          if (newIndex === -1) return;
          change_element_position_new_column(
            oldIndex,
            newIndex,
            IDX,
            idx1,
            idx2,
            sidx1,
            sidx2,
            msidx1,
            msidx2
          );
        }
      } else if (oldContainerID !== newContainerID) {
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
        let sidx1, msidx1;
        let sidx2, msidx2;
        let oldIndex;
        let newIndex;
        if (active.data.current.spnID) {
          const { spnID } = active.data.current;
          sidx1 = layouts[IDX1].columns[idx1].spans.findIndex(
            (s) => s.id === spnID
          );
          if (active.data.current.mspnID) {
            const { mspnID } = active.data.current;
            msidx1 = layouts[IDX1].columns[idx1].spans[
              sidx1
            ].miniSpans.findIndex((ms) => ms.id === mspnID);
            oldIndex = layouts[IDX1].columns[idx1].spans[sidx1].miniSpans[
              sidx1
            ].elements.findIndex((e) => e.id === active.id);
          } else {
            oldIndex = layouts[IDX1].columns[idx1].spans[
              sidx1
            ].elements.findIndex((e) => e.id === active.id);
          }
        } else {
          oldIndex = layouts[IDX1].columns[idx1].elements.findIndex(
            (e) => e.id === active.id
          );
        }

        if (oldIndex === -1) return;

        if (over.data.current.spnID) {
          const { spnID } = over.data.current;
          sidx2 = layouts[IDX2].columns[idx2].spans.findIndex(
            (s) => s.id === spnID
          );
          if (over.data.current.mspnID) {
            const mspnID = over.data.current.mspnID;
            msidx2 = layouts[IDX2].columns[idx2].spans[
              sidx2
            ].miniSpans.findIndex((ms) => ms.id === mspnID);
          }
        }

        let targetLength;
        if (Number.isInteger(sidx2)) {
          if (Number.isInteger(msidx2)) {
            targetLength =
              layouts[IDX2].columns[idx2].spans[sidx2].miniSpans[msidx2]
                .elements.length;
          } else {
            targetLength =
              layouts[IDX2].columns[idx2].spans[sidx2].elements.length;
          }
        } else {
          targetLength = layouts[IDX2].columns[idx2].elements.length;
        }

        const {
          bottom: cb,
          top: ct,
          left: cl,
          right: cr,
        } = columned.current[IDX2][idx2].getBoundingClientRect();
        if (IDX2 > positionRef.current) {
          checkPosition = mid > sb && mid > ct && l < cr;
        } else if (IDX2 < positionRef.current) {
          checkPosition = mid < st && mid < cb && l < cr;
        }

        if (!checkPosition) return;

        positionRef.current = IDX2;
        if (targetLength === 0) {
          change_element_position_new_container(
            oldIndex,
            0,
            IDX1,
            IDX2,
            idx1,
            idx2,
            sidx1,
            sidx2,
            msidx1,
            msidx2
          );
          return;
        } else {
          newIndex = findElementIndexForDND(
            IDX2,
            idx2,
            newContainerID,
            newColumnID,
            over.id,
            active,
            sidx2,
            msidx2
          );
          if (newIndex === -1) return;

          change_element_position_new_container(
            oldIndex,
            newIndex,
            IDX1,
            IDX2,
            idx1,
            idx2,
            sidx1,
            sidx2,
            msidx1,
            msidx2
          );
          return;
        }
      }
    } else if (
      over.data.current.type === "COLUMN" &&
      active.data.current.type === "COLUMN"
    ) {
      if (oldContainerID === newContainerID) {
        const IDX = layouts.findIndex((l) => l.container.id === oldContainerID);
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

  const addClass = () => document.documentElement.classList.add("dragging");
  const removeClass = () =>
    document.documentElement.classList.remove("dragging");

  return (
    <main
      className="content-area flex-1 overflow-y-auto p-4 sm:p-6 "
      area="main"
      onDrop={(e) => {
        handleDrop(e);
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
        scheduleDND(e);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setDrop(null, null);
        setPreview(null);
      }}
    >
      {/* Canvas สำหรับวาง element */}
      <DndContext
        onDragStart={(e) => {
          addClass();
          drag(e);
          setIsDraggingLayout(true);
        }}
        onDragMove={(e) => during(e)}
        onDragEnd={(e) => {
          drop(e);
          setIsDraggingLayout(false);
          removeClass();
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
                        dropTargetRef.current.type === "SECTION" &&
                        dropTargetRef.current.index === I && (
                          <div
                            ref={ghostRef}
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
                                    id={{
                                      conID: preview.container.id,
                                      colID: c.id,
                                    }}
                                  >
                                    {c.isSpan ? (
                                      <>
                                        {c.spans.map((s) => (
                                          <SpanPreview
                                            key={s.id}
                                            elementData={s}
                                          >
                                            {s.isMiniSpan ? (
                                              <>
                                                {s.miniSpans.map((ms) => (
                                                  <MiniSpanPreview
                                                    key={ms.id}
                                                    element={ms}
                                                  >
                                                    {ms.id}
                                                  </MiniSpanPreview>
                                                ))}
                                              </>
                                            ) : (
                                              <>{s.id}</>
                                            )}
                                          </SpanPreview>
                                        ))}
                                      </>
                                    ) : (
                                      <>{c.id}</>
                                    )}
                                  </ColumnPreview>
                                );
                              })}
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
                            const { id, elements, isSpan, spans } = col;
                            let eleID;
                            if (!isSpan) {
                              eleID = elements.map((e) => e.id) ?? ["ele-null"];
                            }
                            const spanID = spans?.map((e) => e.id) ?? [
                              "span-null",
                            ];
                            return (
                              <SortableColumnItem
                                key={id}
                                id={id}
                                containerId={ID}
                                elementData={col}
                              >
                                {isSpan ? (
                                  <SortableContext
                                    items={spanID}
                                    strategy={verticalListSortingStrategy}
                                    disabled={true}
                                  >
                                    {spans.map((s, o) => {
                                      const {
                                        elements: eleSpn,
                                        id: sid,
                                        isMiniSpan,
                                        miniSpans,
                                      } = s;
                                      const eleSpnID = eleSpn.map(
                                        (e) => e.id
                                      ) || ["ele-spn-null"];
                                      const minSpnID = miniSpans.map(
                                        (ms) => ms.id
                                      );
                                      return (
                                        <SortableSpanItem
                                          key={sid}
                                          id={sid}
                                          columnId={id}
                                          containerId={ID}
                                          elementData={s}
                                        >
                                          {isMiniSpan ? (
                                            <SortableContext
                                              items={minSpnID}
                                              strategy={rectSortingStrategy}
                                              disabled={true}
                                            >
                                              {miniSpans.map((ms, _) => {
                                                const {
                                                  elements: eleMspn,
                                                  id: msid,
                                                } = ms;
                                                const eleMspnID = eleMspn.map(
                                                  (e) => e.id
                                                ) ?? ["ele-mspn-null"];
                                                return (
                                                  <SortableMiniSpanItem
                                                    containerId={ID}
                                                    columnId={id}
                                                    spanId={sid}
                                                    id={msid}
                                                    key={msid}
                                                    elementData={ms}
                                                  >
                                                    <SortableContext
                                                      items={eleMspnID}
                                                      strategy={
                                                        verticalListSortingStrategy
                                                      }
                                                      disabled={disableEleDrag}
                                                    >
                                                      {eleMspn.length > 0 ? (
                                                        <>
                                                          {eleMspn.map(
                                                            (e, __) => {
                                                              return (
                                                                <React.Fragment
                                                                  key={e.id}
                                                                >
                                                                  {preview &&
                                                                    !dropTargetRef
                                                                      .current
                                                                      .isLast &&
                                                                    dropTargetRef
                                                                      .current
                                                                      .type ===
                                                                      "ELEMENT" &&
                                                                    dropTargetRef
                                                                      .current
                                                                      .index
                                                                      ?.conI ===
                                                                      I &&
                                                                    dropTargetRef
                                                                      .current
                                                                      .index
                                                                      ?.colI ===
                                                                      i &&
                                                                    dropTargetRef
                                                                      .current
                                                                      .index
                                                                      ?.spnI ===
                                                                      o &&
                                                                    dropTargetRef
                                                                      .current
                                                                      .index
                                                                      ?.mspnI ===
                                                                      _ &&
                                                                    dropTargetRef
                                                                      .current
                                                                      .index
                                                                      ?.eleI ===
                                                                      __ && (
                                                                      <div
                                                                        ref={
                                                                          ghostRef
                                                                        }
                                                                        className=" opacity-70 "
                                                                        key="ghost-ele"
                                                                        id={
                                                                          preview.id
                                                                        }
                                                                        onDragOver={(
                                                                          e
                                                                        ) => {
                                                                          handleDuring(
                                                                            e
                                                                          );
                                                                        }}
                                                                      >
                                                                        <ElementPreview
                                                                          element={
                                                                            preview
                                                                          }
                                                                        ></ElementPreview>
                                                                      </div>
                                                                    )}

                                                                  <SortableElementItem
                                                                    id={`${e.id}`}
                                                                    containerId={
                                                                      ID
                                                                    }
                                                                    columnId={
                                                                      id
                                                                    }
                                                                    spanId={sid}
                                                                    miniSpanId={
                                                                      msid
                                                                    }
                                                                    elementData={
                                                                      e
                                                                    }
                                                                  ></SortableElementItem>

                                                                  {preview &&
                                                                    dropTargetRef
                                                                      .current
                                                                      .isLast &&
                                                                    dropTargetRef
                                                                      .current
                                                                      .type ===
                                                                      "ELEMENT" &&
                                                                    dropTargetRef
                                                                      .current
                                                                      .index
                                                                      ?.conI ===
                                                                      I &&
                                                                    dropTargetRef
                                                                      .current
                                                                      .index
                                                                      ?.colI ===
                                                                      i &&
                                                                    dropTargetRef
                                                                      .current
                                                                      .index
                                                                      ?.spnI ===
                                                                      o &&
                                                                    dropTargetRef
                                                                      .current
                                                                      .index
                                                                      ?.mspnI ===
                                                                      _ &&
                                                                    __ ===
                                                                      eleMspn.length -
                                                                        1 && (
                                                                      <div
                                                                        ref={
                                                                          ghostRef
                                                                        }
                                                                        className=" opacity-70 "
                                                                        key="ghost-ele"
                                                                        id={
                                                                          preview.id
                                                                        }
                                                                        onDragOver={(
                                                                          e
                                                                        ) => {
                                                                          handleDuring(
                                                                            e
                                                                          );
                                                                        }}
                                                                      >
                                                                        <ElementPreview
                                                                          element={
                                                                            preview
                                                                          }
                                                                        ></ElementPreview>
                                                                      </div>
                                                                    )}
                                                                </React.Fragment>
                                                              );
                                                            }
                                                          )}
                                                        </>
                                                      ) : (
                                                        <React.Fragment>
                                                          {preview &&
                                                          !dropTargetRef.current
                                                            .isLast &&
                                                          dropTargetRef.current
                                                            .type ===
                                                            "ELEMENT" &&
                                                          dropTargetRef.current
                                                            .index?.conI ===
                                                            I &&
                                                          dropTargetRef.current
                                                            .index?.colI ===
                                                            i &&
                                                          dropTargetRef.current
                                                            .index?.spnI ===
                                                            o &&
                                                          dropTargetRef.current
                                                            .index?.mspnI ===
                                                            _ ? (
                                                            <div
                                                              ref={ghostRef}
                                                              className=" opacity-70 "
                                                              key="ghost-ele"
                                                              id={preview.id}
                                                              onDragOver={(
                                                                e
                                                              ) => {
                                                                handleDuring(e);
                                                              }}
                                                            >
                                                              <ElementPreview
                                                                element={
                                                                  preview
                                                                }
                                                              ></ElementPreview>
                                                            </div>
                                                          ) : (
                                                            <SortableElementItem
                                                              key={`ele-${sid}`}
                                                              id={`ele-${sid}`}
                                                              containerId={ID}
                                                              columnId={id}
                                                              spanId={sid}
                                                              miniSpanId={msid}
                                                              elementData={{
                                                                type: "null",
                                                                id: "__null__",
                                                              }}
                                                            >
                                                              {msid}
                                                            </SortableElementItem>
                                                          )}
                                                        </React.Fragment>
                                                      )}
                                                    </SortableContext>
                                                  </SortableMiniSpanItem>
                                                );
                                              })}
                                            </SortableContext>
                                          ) : (
                                            <SortableContext
                                              items={eleSpnID}
                                              strategy={
                                                verticalListSortingStrategy
                                              }
                                              disabled={disableEleDrag}
                                            >
                                              {eleSpn.length > 0 ? (
                                                <>
                                                  {eleSpn.map((e, _) => {
                                                    return (
                                                      <React.Fragment
                                                        key={e.id}
                                                      >
                                                        {preview &&
                                                          !dropTargetRef.current
                                                            .isLast &&
                                                          dropTargetRef.current
                                                            .type ===
                                                            "ELEMENT" &&
                                                          dropTargetRef.current
                                                            .index?.conI ===
                                                            I &&
                                                          dropTargetRef.current
                                                            .index?.colI ===
                                                            i &&
                                                          dropTargetRef.current
                                                            .index?.spnI ===
                                                            o &&
                                                          dropTargetRef.current
                                                            .index?.eleI ===
                                                            _ && (
                                                            <div
                                                              ref={ghostRef}
                                                              className=" opacity-70 "
                                                              key="ghost-ele"
                                                              id={preview.id}
                                                              onDragOver={(
                                                                e
                                                              ) => {
                                                                handleDuring(e);
                                                              }}
                                                            >
                                                              <ElementPreview
                                                                element={
                                                                  preview
                                                                }
                                                              ></ElementPreview>
                                                            </div>
                                                          )}

                                                        <SortableElementItem
                                                          id={`${e.id}`}
                                                          containerId={ID}
                                                          columnId={id}
                                                          spanId={sid}
                                                          elementData={e}
                                                        ></SortableElementItem>

                                                        {preview &&
                                                          dropTargetRef.current
                                                            .isLast &&
                                                          dropTargetRef.current
                                                            .type ===
                                                            "ELEMENT" &&
                                                          dropTargetRef.current
                                                            .index?.conI ===
                                                            I &&
                                                          dropTargetRef.current
                                                            .index?.colI ===
                                                            i &&
                                                          dropTargetRef.current
                                                            .index?.spnI ===
                                                            o &&
                                                          _ ===
                                                            eleSpn.length -
                                                              1 && (
                                                            <div
                                                              ref={ghostRef}
                                                              className=" opacity-70 "
                                                              key="ghost-ele"
                                                              id={preview.id}
                                                              onDragOver={(
                                                                e
                                                              ) => {
                                                                handleDuring(e);
                                                              }}
                                                            >
                                                              <ElementPreview
                                                                element={
                                                                  preview
                                                                }
                                                              ></ElementPreview>
                                                            </div>
                                                          )}
                                                      </React.Fragment>
                                                    );
                                                  })}
                                                </>
                                              ) : (
                                                <React.Fragment>
                                                  {preview &&
                                                  !dropTargetRef.current
                                                    .isLast &&
                                                  dropTargetRef.current.type ===
                                                    "ELEMENT" &&
                                                  dropTargetRef.current.index
                                                    ?.conI === I &&
                                                  dropTargetRef.current.index
                                                    ?.colI === i &&
                                                  dropTargetRef.current.index
                                                    ?.spnI === o ? (
                                                    <div
                                                      ref={ghostRef}
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
                                                  ) : (
                                                    <SortableElementItem
                                                      key={`ele-${sid}`}
                                                      id={`ele-${sid}`}
                                                      containerId={ID}
                                                      columnId={id}
                                                      spanId={sid}
                                                      elementData={{
                                                        type: "null",
                                                        id: "__null__",
                                                      }}
                                                    >
                                                      {sid}
                                                    </SortableElementItem>
                                                  )}
                                                </React.Fragment>
                                              )}
                                            </SortableContext>
                                          )}
                                        </SortableSpanItem>
                                      );
                                    })}
                                  </SortableContext>
                                ) : (
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
                                                dropTargetRef.current.type ===
                                                  "ELEMENT" &&
                                                dropTargetRef.current.index
                                                  ?.conI === I &&
                                                dropTargetRef.current.index
                                                  ?.colI === i &&
                                                dropTargetRef.current.index
                                                  ?.eleI === o &&
                                                !dropTargetRef.current
                                                  .isLast && (
                                                  <>
                                                    <div
                                                      ref={ghostRef}
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
                                                dropTargetRef.current.type ===
                                                  "ELEMENT" &&
                                                dropTargetRef.current.index
                                                  ?.conI === I &&
                                                dropTargetRef.current.index
                                                  ?.colI === i &&
                                                o === elements.length - 1 &&
                                                dropTargetRef.current
                                                  .isLast && (
                                                  <>
                                                    <div
                                                      ref={ghostRef}
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
                                        dropTargetRef.current.index?.conI ===
                                          I &&
                                        dropTargetRef.current.index?.colI ===
                                          i ? (
                                          <>
                                            <div
                                              ref={ghostRef}
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
                                              elementData={{
                                                type: "null",
                                                id: "__null__",
                                              }}
                                            >
                                              {id}
                                            </SortableElementItem>
                                          </>
                                        )}
                                      </>
                                    )}
                                  </SortableContext>
                                )}
                              </SortableColumnItem>
                            );
                          })}
                        </SortableContext>
                      </SortableContainerItem>

                      {preview &&
                        dropTargetRef.current.type === "SECTION" &&
                        dropTargetRef.current.isLast &&
                        I === layouts.length - 1 && (
                          <div
                            ref={ghostRef}
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
                                    id={{
                                      conID: preview.container.id,
                                      colID: c.id,
                                    }}
                                  >
                                    {c.isSpan ? (
                                      <>
                                        {c.spans.map((s) => (
                                          <SpanPreview
                                            key={s.id}
                                            elementData={s}
                                          >
                                            {s.isMiniSpan ? (
                                              <>
                                                {s.miniSpans.map((ms) => (
                                                  <MiniSpanPreview
                                                    key={ms.id}
                                                    element={ms}
                                                  >
                                                    {ms.id}
                                                  </MiniSpanPreview>
                                                ))}
                                              </>
                                            ) : (
                                              <>{s.id}</>
                                            )}
                                          </SpanPreview>
                                        ))}
                                      </>
                                    ) : (
                                      <>{c.id}</>
                                    )}
                                  </ColumnPreview>
                                );
                              })}
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
                    ref={ghostRef}
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
                            {c.isSpan ? (
                              <>
                                {c.spans.map((s) => (
                                  <SpanPreview key={s.id} elementData={s}>
                                    {s.isMiniSpan ? (
                                      <>
                                        {s.miniSpans.map((ms) => (
                                          <MiniSpanPreview
                                            key={ms.id}
                                            element={ms}
                                          >
                                            {ms.id}
                                          </MiniSpanPreview>
                                        ))}
                                      </>
                                    ) : (
                                      <>{s.id}</>
                                    )}
                                  </SpanPreview>
                                ))}
                              </>
                            ) : (
                              <>{c.id}</>
                            )}
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
           dropAnimation={{ duration: 220, easing: "cubic-bezier(.2,.7,.3,1)" }}
           style={{ pointerEvents: "none" }}        // กัน overlay จับอีเวนต์เมาส์
           modifiers={[centerPreviewUnderCursor]} 
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
                      {c.isSpan ? (
                        <>
                          {c.spans.map((s) => (
                            <SpanPreview elementData={s} key={s.id}>
                              {s.isMiniSpan ? (
                                <>
                                  {s.miniSpans.map((ms) => (
                                    <MiniSpanPreview element={ms} key={ms.id}>
                                      {ms.elements.length > 0 ? (
                                        <>
                                          {ms.elements.map((ele) => (
                                            <ElementPreview
                                              element={ele}
                                              key={ele.id}
                                            ></ElementPreview>
                                          ))}
                                        </>
                                      ) : (
                                        <>{ms.id}</>
                                      )}
                                    </MiniSpanPreview>
                                  ))}
                                </>
                              ) : (
                                <>
                                  {s.elements.length ? (
                                    <>
                                      {s.elements.map((ele) => (
                                        <ElementPreview
                                          element={ele}
                                          key={ele.id}
                                        ></ElementPreview>
                                      ))}
                                    </>
                                  ) : (
                                    <>{s.id}</>
                                  )}
                                </>
                              )}
                            </SpanPreview>
                          ))}
                        </>
                      ) : (
                        <>
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
                        </>
                      )}
                    </ColumnPreview>
                  ))}
                </ContainerPreview>
              )) ||
                (typeof activeID === "object" &&
                  !activeID.eleID &&
                  !activeID.spnID && (
                    <ColumnPreview element={activeItem} id={activeID}>
                      {activeItem.isSpan ? (
                        <>
                          {activeItem.spans.map((s) => (
                            <SpanPreview elementData={s} key={s.id}>
                              {s.isMiniSpan ? (
                                <>
                                  {s.miniSpans.map((ms) => (
                                    <MiniSpanPreview element={ms} key={ms.id}>
                                      {ms.elements.length > 0 ? (
                                        <>
                                          {ms.elements.map((ele) => (
                                            <ElementPreview
                                              element={ele}
                                              key={ele.id}
                                            ></ElementPreview>
                                          ))}
                                        </>
                                      ) : (
                                        <>{ms.id}</>
                                      )}
                                    </MiniSpanPreview>
                                  ))}
                                </>
                              ) : (
                                <>
                                  {s.elements.length ? (
                                    <>
                                      {s.elements.map((ele) => (
                                        <ElementPreview
                                          element={ele}
                                          key={ele.id}
                                        ></ElementPreview>
                                      ))}
                                    </>
                                  ) : (
                                    <>{s.id}</>
                                  )}
                                </>
                              )}
                            </SpanPreview>
                          ))}
                        </>
                      ) : (
                        <>
                          {" "}
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
                        </>
                      )}
                    </ColumnPreview>
                  )) ||
                (typeof activeID === "object" &&
                  activeID.spnID &&
                  !activeID.eleID &&
                  !activeID.mspnID && (
                    <SpanPreview elementData={activeItem}>
                      {activeItem.isMiniSpan ? (
                        <>
                          {activeItem.miniSpans.map((ms) => (
                            <MiniSpanPreview element={ms} key={ms.id}>
                              {ms.elements.length > 0 ? (
                                <>
                                  {ms.elements.map((ele) => (
                                    <ElementPreview
                                      element={ele}
                                      key={ele.id}
                                    ></ElementPreview>
                                  ))}
                                </>
                              ) : (
                                <>{ms.id}</>
                              )}
                            </MiniSpanPreview>
                          ))}
                        </>
                      ) : (
                        <>
                          {activeItem?.elements.length === 0 ? (
                            <>{activeID.spnID}</>
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
                        </>
                      )}
                    </SpanPreview>
                  )) ||
                (typeof activeID === "object" && activeID.eleID && (
                  <ElementPreviewForDrag_Drop
                    element={activeItem}
                  ></ElementPreviewForDrag_Drop>
                )) ||
                (typeof activeID === "object" &&
                  activeID.mspnID &&
                  !activeID.eleID && (
                    <MiniSpanPreview element={activeItem}>
                      {activeItem.elements.length === 0 ? (
                        <>{activeID.mspnID}</>
                      ) : (
                        <>
                          {" "}
                          {activeItem.elements.map((ele) => (
                            <ElementPreview
                              element={ele}
                              key={ele.id}
                            ></ElementPreview>
                          ))}
                        </>
                      )}
                    </MiniSpanPreview>
                  )))}
          </DragOverlay>
        </div>
      </DndContext>

      {modal && <ConfirmModal data={modal} close={openModal} />}
      {alert && <AlertModal />}

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
    changeSizeSpan = null,
    changeSpanPosition = null,
    changeMiniSpanPosition = null,
    changeSizeMiniSpan = null,
    dndHandleCol = null,
    dndHandleSpn = null,
    dndHandleMspn = null,
    onDragAbleCol = null,
    onDragDisableCol = null,
    onDragAbleSpn = null,
    onDragDisableSpn = null,
    onDragAbleMspn = null,
    onDragDisableMspn = null,
    cloneSpn = null,
    removeSpn = null,
    removeMspn = null,
    spnIndex = null,
    mspnIndex = null,
    cloneMspn = null,
  }) {
    const getID = (forSpan = false) => {
      if (
        typeof id === "string" ||
        !id.spnID ||
        forSpan === "MS" ||
        (forSpan === "S" && !id.mspnID)
      ) {
        return id;
      } else if (forSpan === "S" && id.mspnID) {
        const { conID, colID, spnID } = id;
        return { conID, colID, spnID };
      } else {
        const { conID, colID } = id;
        return { conID, colID };
      }
    };

    let [range, setRange] = useState(0);

    const changeRange = (symbol) => {
      if (symbol === "-") {
        setRange((prev) => prev - 1);
      } else if (symbol === "+") {
        setRange((prev) => prev + 1);
      }
    };

    const TRACK_W = 840; // px
    const CLOSED_SCALE = 0.5; // how long the preview bar is when closed (0..1)

    if (["Container", "Column"].includes(offcavanas)) {
      return (
        <div
          className="flex items-center justify-center absolute -top-px -left-px"
          data-drop="COLUMN-BTN"
          onMouseMove={(e) => {
            scheduleDND(e);
          }}
        >
          {offcavanas === "Column" && (
            <button
              className="bg-gray-900  text-white px-[3px] py-1"
              ref={
                offcavanas === "Column" && dndHandleCol
                  ? dndHandleCol.setActivatorNodeRef
                  : null
              }
              {...(offcavanas === "Column" && dndHandleCol
                ? dndHandleCol.listeners
                : {})}
              onMouseEnter={() => {
                onDragAbleCol();
                if (onDragDisableSpn) onDragDisableSpn();
              }}
              onMouseOver={() => {
                onDragAbleCol();
                if (onDragDisableSpn) onDragDisableSpn();
              }}
              onMouseLeave={() => {
                onDragDisableCol();
                if (onDragDisableSpn) onDragDisableSpn();
              }}
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
    } else if (
      (spnIndex === 0 && offcavanas === "Span") ||
      (offcavanas === "Mini Span" && spnIndex === 0 && mspnIndex === 0)
    ) {
      return (
        <div
          className="flex items-center justify-center absolute -top-px -left-px"
          onMouseMove={(e) => {
            scheduleDND(e);
          }}
          data-drop="BTN"
        >
          {range === 0 && (
            <>
              {((offcavanas === "Span" && spnIndex === 0) ||
                (offcavanas === "Mini Span" &&
                  mspnIndex === 0 &&
                  spnIndex === 0)) && (
                <button
                  className="bg-gray-900  text-white px-[3px] py-1"
                  ref={
                    offcavanas === "Column" && dndHandleCol
                      ? dndHandleCol.setActivatorNodeRef
                      : null
                  }
                  {...(offcavanas === "Column" && dndHandleCol
                    ? dndHandleCol.listeners
                    : {})}
                  onMouseEnter={() => {
                    onDragAbleCol();
                    if (onDragDisableSpn) onDragDisableSpn();
                  }}
                  onMouseOver={() => {
                    onDragAbleCol();
                    if (onDragDisableSpn) onDragDisableSpn();
                  }}
                  onMouseLeave={() => {
                    onDragDisableCol();
                    if (onDragDisableSpn) onDragDisableSpn();
                  }}
                >
                  <Move className="size-4 m-[5px]" />
                </button>
              )}
              <button
                type="button"
                className=" bg-gray-900  text-white  px-[3px] py-1"
                draggable={false}
                onClick={(e) => {
                  openOffcavanas(offcavanas, element, onUpdate);
                }}
              >
                <Settings className="size-4 m-[5px]" />
              </button>
              {((offcavanas === "Span" && spnIndex === 0) ||
                (offcavanas === "Mini Span" &&
                  spnIndex === 0 &&
                  mspnIndex === 0)) && (
                <button
                  type="button"
                  className=" bg-gray-900   text-white px-[3px] py-1"
                  draggable={false}
                  onClick={(e) => {
                    clone(getID());
                  }}
                >
                  <Copy className="size-4 m-[5px]" />
                </button>
              )}
              {((offcavanas === "Span" && spnIndex === 0) ||
                (offcavanas === "Mini Span" &&
                  spnIndex === 0 &&
                  mspnIndex === 0)) && (
                <button
                  className=" bg-gray-900  text-white px-[3px] py-1"
                  type="button"
                  draggable={false}
                >
                  <Trash2
                    className="size-4 m-[5px]"
                    onClick={(e) => {
                      modal({ id: getID(), funct: remove });
                    }}
                  />
                </button>
              )}
              <button
                type="button"
                className=" bg-gray-600  text-white  px-[3px] py-1"
                draggable={false}
                onClick={(e) => {
                  changeRange("+");
                }}
              >
                <EllipsisVertical className="size-4 m-[5px]" />
              </button>
            </>
          )}

          <div
            className={[
              " overflow-hidden ml-[2px] ", // visual wrapper
              "transition-[width,opacity] duration-400 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
              range === 1 ? `w-[${TRACK_W}px] opacity-100` : "w-0 opacity-0",
            ].join(" ")}
          >
            <div
               className={[
                 "h-full w-[560px] flex items-center bg-transparent transform-gpu",
                 "transition-transform duration-400 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
                 range === 1
                   ? "origin-left scale-x-100"
                   : "origin-left scale-x-0",
               ].join(" ")}
            >
              {range === 1 && (
                <>
                  {((offcavanas === "Span" && spnIndex === 0) ||
                    (offcavanas === "Mini Span" &&
                      spnIndex === 0 &&
                      mspnIndex === 0)) && (
                    <>
                      <button
                        type="button"
                        className=" bg-gray-600 text-white  px-[3px] py-1"
                        draggable={false}
                        onClick={(e) => {
                          changeRange("-");
                        }}
                      >
                        <EllipsisVertical className="size-4 m-[5px]" />
                      </button>
                      <button
                        type="button"
                        draggable={false}
                        className=" bg-gray-900  text-white px-[3px] py-1"
                        onClick={(e) => {
                          changeSizeColumn(getID(), "-");
                        }}
                      >
                        <Minus className="size-4 m-[5px]" />
                      </button>
                      <button
                        type="button"
                        draggable={false}
                        className=" bg-gray-900  text-white px-[3px] py-1"
                        onClick={(e) => {
                          changeSizeColumn(getID(), "+");
                        }}
                      >
                        <Plus className="size-4 m-[5px]" />
                      </button>
                    </>
                  )}

                  {(offcavanas === "Span" ||
                    (offcavanas === "Mini Span" && mspnIndex === 0)) && (
                    <>
                      <button
                        type="button"
                        draggable={false}
                        className=" bg-gray-900  text-white px-[3px] py-1"
                        onClick={(e) => {
                          changeSpanPosition(spnIndex, getID(), "+");
                        }}
                      >
                        <MoveDown className="size-4 m-[5px]" />
                      </button>
                      <button
                        type="button"
                        draggable={false}
                        className=" bg-gray-900  text-white px-[3px] py-1"
                        onClick={(e) => {
                          changeSpanPosition(spnIndex, getID(), "-");
                        }}
                      >
                        <MoveUp className="size-4 m-[5px]" />
                      </button>
                    </>
                  )}
                  {offcavanas === "Mini Span" && (
                    <>
                      <button
                        type="button"
                        draggable={false}
                        className=" bg-gray-900  text-white px-[3px] py-1"
                        onClick={(e) => {
                          changeMiniSpanPosition(mspnIndex, getID("S"), "-");
                        }}
                      >
                        <MoveLeft className="size-4 m-[5px]" />
                      </button>
                      <button
                        type="button"
                        draggable={false}
                        className=" bg-gray-900  text-white px-[3px] py-1"
                        onClick={(e) => {
                          changeMiniSpanPosition(mspnIndex, getID("S"), "+");
                        }}
                      >
                        <MoveRight className="size-4 m-[5px]" />
                      </button>
                    </>
                  )}
                  {offcavanas === "Mini Span" && (
                    <>
                      <button
                        type="button"
                        draggable={false}
                        className=" bg-gray-900  text-white  px-[3px] py-1"
                        onClick={(e) => {
                          changeSizeMiniSpan(getID("MS"), "-");
                        }}
                      >
                        <Minimize2 className="size-4 m-[5px]" />
                      </button>
                      <button
                        type="button"
                        draggable={false}
                        className=" bg-gray-900  text-white  px-[3px] py-1"
                        onClick={(e) => {
                          changeSizeMiniSpan(getID("MS"), "+");
                        }}
                      >
                        <Maximize2 className="size-4 m-[5px]" />
                      </button>
                    </>
                  )}
                  {offcavanas === "Span" && (
                    <button
                      type="button"
                      className=" bg-gray-900  text-white  px-[3px] py-1"
                      draggable={false}
                      onClick={(e) => {
                        cloneSpn(getID("S"));
                      }}
                    >
                      <Grid2X2Plus className="size-4 m-[5px]" />
                    </button>
                  )}
                  {offcavanas === "Mini Span" && (
                    <button
                      type="button"
                      className=" bg-gray-900  text-white  px-[3px] py-1"
                      draggable={false}
                      onClick={(e) => {
                        cloneMspn(getID("MS"));
                      }}
                    >
                      <Grid2X2Plus className="size-4 m-[5px]" />
                    </button>
                  )}

                  {offcavanas === "Span" && (
                    <button
                      className=" bg-gray-900  text-white  px-[3px] py-1"
                      type="button"
                      draggable={false}
                    >
                      <Grid2X2X
                        className="size-[17px] m-[4.5px]"
                        onClick={(e) => {
                          modal({ id: getID("S"), funct: removeSpn });
                        }}
                      />
                    </button>
                  )}
                  {offcavanas === "Mini Span" && (
                    <button
                      className=" bg-gray-900  text-white  px-[3px] py-1"
                      type="button"
                      draggable={false}
                    >
                      <Grid2X2X
                        className="size-4 m-[5px]"
                        onClick={(e) => {
                          modal({ id: getID("MS"), funct: removeMspn });
                        }}
                      />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        className="flex items-center justify-center absolute -top-px -left-px"
        onMouseMove={(e) => {
          scheduleDND(e);
        }}
        data-drop="BTN"
      >
        <button
          type="button"
          className=" bg-gray-900  text-white  px-[3px] py-1"
          draggable={false}
          onClick={(e) => {
            openOffcavanas(offcavanas, element, onUpdate);
          }}
        >
          <Settings className="size-4 m-[5px]" />
        </button>

        {(offcavanas === "Span" ||
          (offcavanas === "Mini Span" && mspnIndex === 0)) && (
          <>
            <button
              type="button"
              draggable={false}
              className=" bg-gray-900  text-white px-[3px] py-1"
              onClick={(e) => {
                changeSpanPosition(spnIndex, getID(), "+");
              }}
            >
              <MoveDown className="size-4 m-[5px]" />
            </button>
            <button
              type="button"
              draggable={false}
              className=" bg-gray-900  text-white px-[3px] py-1"
              onClick={(e) => {
                changeSpanPosition(spnIndex, getID(), "-");
              }}
            >
              <MoveUp className="size-4 m-[5px]" />
            </button>
          </>
        )}

        {offcavanas === "Mini Span" && (
          <>
            <button
              type="button"
              draggable={false}
              className=" bg-gray-900  text-white  px-[3px] py-1"
              onClick={(e) => {
                changeSizeMiniSpan(getID("MS"), "-");
              }}
            >
              <Minus className="size-4 m-[5px]" />
            </button>
            <button
              type="button"
              draggable={false}
              className=" bg-gray-900  text-white  px-[3px] py-1"
              onClick={(e) => {
                changeSizeMiniSpan(getID("MS"), "+");
              }}
            >
              <Plus className="size-4 m-[5px]" />
            </button>
          </>
        )}
        {offcavanas === "Span" && (
          <button
            type="button"
            className=" bg-gray-900  text-white  px-[3px] py-1"
            draggable={false}
            onClick={(e) => {
              cloneSpn(getID("S"));
            }}
          >
            <Grid2X2Plus className="size-4 m-[5px]" />
          </button>
        )}
        {offcavanas === "Mini Span" && (
          <button
            type="button"
            className=" bg-gray-900  text-white  px-[3px] py-1"
            draggable={false}
            onClick={(e) => {
              cloneMspn(getID("MS"));
            }}
          >
            <Grid2X2Plus className="size-4 m-[5px]" />
          </button>
        )}

        {offcavanas === "Span" && (
          <button
            className=" bg-gray-900  text-white  px-[3px] py-1"
            type="button"
            draggable={false}
          >
            <Grid2X2X
              className="size-[17px] m-[4.5px]"
              onClick={(e) => {
                modal({ id: getID("S"), funct: removeSpn });
              }}
            />
          </button>
        )}
        {offcavanas === "Mini Span" && (
          <button
            className=" bg-gray-900  text-white  px-[3px] py-1"
            type="button"
            draggable={false}
          >
            <Grid2X2X
              className="size-4 m-[5px]"
              onClick={(e) => {
                modal({ id: getID("MS"), funct: removeMspn });
              }}
            />
          </button>
        )}
      </div>
    );
  }

  function ConfirmModal({ data, close }) {
    if (!data) return <></>;

    const { id, funct } = data;

    let elementName;

    if (typeof id === "object") {
      if (id.mspnID && id.spnID) {
        elementName = "Mini Span";
      } else if (id.spnID && !id.mspnID) {
        elementName = "Span";
      } else {
        elementName = "Column";
      }
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

  function AlertModal() {
    const [open, setOpen] = useState(true);

    if (!open) setTimeout(() => setAlert(false), 200);

    return (
      <Modal
        open={alert}
        onClose={(_, resson) => {
          setAlert(false);
        }}
        aria-labelledby="basic-modal-title"
        aria-describedby="basic-modal-desc"
        slotProps={{ backdrop: { timeout: 200 } }}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
      >
        <Fade in={open} timeout={200} onExited={() => setOpen(false)}>
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
                  คำเตือน !!!
                </span>{" "}
              </div>
              <div>
                <a
                  onClick={(e) => setOpen(false)}
                  style={{ cursor: "pointer" }}
                >
                  X
                </a>
              </div>
            </div>
            <div
              className={`border-b border-dotted border-gray-500/50 flex-1`}
            ></div>
            <div className="pl-4 mt-2 pt-1 pb-4 text-[13px]">
              คอลัมน์ประเภทนี้ ไม่สามารถปรับขนาดของคอลัมน์{" "}
              <span className="text-red-600 dark:text-emerald-300">
                "ให้แคบกว่านี้ได้"
              </span>
            </div>
          </Box>
        </Fade>
      </Modal>
    );
  }
};

export default Content;
