import { useState } from "react";
import {
  Settings,
  Save,
  Plus,
  Copy,
  Trash2,
  Minus,
  MoveUp,
  MoveDown,
  MoveLeft,
  MoveRight,
  Gem,
  Play,
  EllipsisVertical,
  Maximize2,
  Minimize2,
  Grid2X2X,
  Grid2X2Plus,
} from "lucide-react";
import Tooltip from "@mui/material/Tooltip";

function ServiceLayout({
    layouts,
    element,
    clone,
    openOffcavanas,
    ids,
    remove,
    offcavanas,
    onUpdate,
    modal,
    changeSize=null,
    changePosition=null,
    isSpanMorePinned=false,
    onSpanMoreToggle=null,
    isColumnPresetModalPinned=false,
    onColumnPresetModalToggle=null,
    onOpenPresetModal=null,
    onOpenPresetLoadModal=null,
  }) {

    
    const {conID,colID,spnID} = ids
    let changeSizeColumn,changeSizeSpan,
         changeSpanPosition,changeColumnPosition,changeContainerPosition
    if(changeSize){
        changeSizeColumn = changeSize.changeSizeColumn
        changeSizeSpan = changeSize.changeSizeSpan
    }if(changePosition){
        changeContainerPosition = changePosition.changeContainerPosition
        changeSpanPosition = changePosition.changeSpanPosition
        changeColumnPosition = changePosition.changeColumnPosition
    }
    

    const {cloneCon,cloneCol,cloneSpn} = clone
    const {removeCon,removeCol,removeSpn} = remove


    let IDX,idx,sidx
    IDX = layouts.findIndex((l) => l.container.id === conID);
    // สำหรับ split section ใช้ index ต่ำสุดของ split row เพื่อตัดสินว่าเป็น first section หรือไม่
    const _splitRowId = layouts[IDX]?.splitRowId;
    const effectiveIDX = _splitRowId
      ? Math.min(...layouts.map((l, i) => (l.splitRowId === _splitRowId ? i : Infinity)))
      : IDX;
    if(offcavanas !== "Container"){
        idx = layouts[IDX]?.columns.findIndex((c) => c.id === colID)
    } if(!["Container","Column"].includes(offcavanas)){
        
        sidx = layouts[IDX]?.columns?.[idx]?.spans.findIndex((s) =>s.id === spnID)
          
    }
    let [range, setRange] = useState(0);
    const columnMoreOpen =
      offcavanas === "Column" ? Boolean(isColumnPresetModalPinned) : false;
    const openColumnMore = () => {
      onColumnPresetModalToggle?.(true);
    };
    const closeColumnMore = () => {
      onColumnPresetModalToggle?.(false);
    };


    const changeRange = (symbol) => {
      if (symbol === "-") {
        setRange(0);
        onSpanMoreToggle?.(false);
      } else if (symbol === "+") {
        setRange(1);
        onSpanMoreToggle?.(true);
      }
    };
    const isFirstSpanMoreOpen =
      offcavanas === "Span" && sidx === 0 && (range === 1 || isSpanMorePinned);

    const resizeSpan = (symbol) => {
      if (offcavanas !== "Span") return;
      const spanId = getID();
      if (changeSizeSpan) {
        changeSizeSpan(spanId, symbol);
        return;
      }
      // fallback: keep previous behavior if span-size handler is not passed
      changeSizeColumn?.({ conID: spanId?.conID, colID: spanId?.colID }, symbol);
    };

    const TRACK_W = 840; // px
    const COLUMN_TRACK_W = 360; // px
    const CLOSED_SCALE = 0.5; // how long the preview bar is when closed (0..1)
    const TOOLTIP_BUTTON_CLASS = "group relative";
    const SMALL_TOOLTIP_PROPS = {
      arrow: true,
      placement: "top",
      slotProps: {
        popper: {
          modifiers: [
            {
              name: "offset",
              options: {
                offset: [0, -6],
              },
            },
          ],
        },
        arrow: {
          sx: {
            fontSize: "7px",
            color: "#4d5461",
          },
        },
        tooltip: {
          sx: {
            fontSize: "10px",
            lineHeight: 1.1,
            px: "6px",
            py: "6px",
            minWidth: "45px",
            bgcolor: "#4d5461",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          },
        },
      },
    };

    const getID = ()=>{
        if(offcavanas === "Container"){
            return conID
        }else if(offcavanas === "Column"){
            return {conID,colID}
        }else if(offcavanas === "Span"){
          return {conID,colID,spnID}
        }
        
      }

    const splitColumnCells = () => {
      if (offcavanas !== "Column") return;
      const fromElement = element?.colData && typeof element.colData === "object"
        ? element.colData
        : null;
      const fromLayout =
        Number.isInteger(IDX) &&
        Number.isInteger(idx) &&
        IDX >= 0 &&
        idx >= 0 &&
        layouts?.[IDX]?.columns?.[idx]
          ? layouts[IDX].columns[idx]
          : null;
      const current = fromElement || fromLayout;
      if (!current?.id || current.isSpan) return;
      onUpdate?.(
        { isSpan: true },
        current.id,
        conID,
        { columnSplitToggle: true }
      );
    };

    const openSpanSettingsAsColumnPanel = () => {
      if (offcavanas !== "Span") {
        openOffcavanas(offcavanas, element, onUpdate);
        return;
      }
      const spanData =
        element?.spanData && typeof element.spanData === "object"
          ? element.spanData
          : null;
      if (!spanData?.id || !conID || !colID) {
        openOffcavanas(offcavanas, element, onUpdate);
        return;
      }
      const columnPanelElement = { colData: spanData, conID };
      const bridgeUpdate = (data, id, targetConID) => {
        onUpdate?.(data, id, targetConID, colID);
      };
      openOffcavanas("Column", columnPanelElement, bridgeUpdate);
    };

    const getCurrentColumnForPreset = () => {
      if (offcavanas !== "Column") return null;
      const fromElement =
        element?.colData && typeof element.colData === "object"
          ? element.colData
          : null;
      const fromLayout =
        Number.isInteger(IDX) &&
        Number.isInteger(idx) &&
        IDX >= 0 &&
        idx >= 0 &&
        layouts?.[IDX]?.columns?.[idx]
          ? layouts[IDX].columns[idx]
          : null;
      return fromElement || fromLayout || null;
    };

    const openSavePresetModal = () => {
      const currentColumn = getCurrentColumnForPreset();
      if (!currentColumn) return;
      const fallbackName = currentColumn?.id
        ? `Preset ${currentColumn.id}`
        : "Preset Column";
      onColumnPresetModalToggle?.(true);
      onOpenPresetModal?.({
        defaultName: fallbackName,
        column: currentColumn,
        source: {
          conID,
          colID,
          isSpan: Boolean(currentColumn?.isSpan),
          size: Number(currentColumn?.size ?? 12),
        },
      });
    };
    const openLoadPresetModal = () => {
      if (offcavanas === "Column") {
        const currentColumn = getCurrentColumnForPreset();
        if (!currentColumn) return;
        onOpenPresetLoadModal?.({
          source: {
            conID,
            colID,
            isSpan: Boolean(currentColumn?.isSpan),
            size: Number(currentColumn?.size ?? 12),
          },
        });
        return;
      }
      if (offcavanas === "Span") {
        const spanData =
          element?.spanData && typeof element.spanData === "object"
            ? element.spanData
            : layouts?.[IDX]?.columns?.[idx]?.spans?.[sidx] || null;
        if (!spanData?.id) return;
        onOpenPresetLoadModal?.({
          source: {
            conID,
            colID,
            spnID: spanData.id,
          },
        });
      }
    };
    const hasPresetElementsInColumn = (() => {
      const currentColumn = getCurrentColumnForPreset();
      if (!currentColumn || typeof currentColumn !== "object") return false;
      if (Array.isArray(currentColumn.elements) && currentColumn.elements.length > 0) {
        return true;
      }
      if (currentColumn.isSpan && Array.isArray(currentColumn.spans)) {
        return currentColumn.spans.some(
          (sp) => Array.isArray(sp?.elements) && sp.elements.length > 0
        );
      }
      return false;
    })();


    if(offcavanas === "Container"){
        return (
        <div
        className="flex items-center justify-center absolute -top-px -left-px"
        data-drop="COLUMN-BTN"
      >
        <Tooltip title="ขึ้น" {...SMALL_TOOLTIP_PROPS}>
          <button
            type="button"
            className=" bg-gray-900 text-white px-[3px] py-1"
            onClick={() => changeContainerPosition?.(getID(), "-")}
            aria-label="ขึ้น"
          >
            <MoveUp className="size-4 m-[5px]" />
          </button>
        </Tooltip>
        <Tooltip title="ลง" {...SMALL_TOOLTIP_PROPS}>
          <button
            type="button"
            className=" bg-gray-900 text-white px-[3px] py-1"
            onClick={() => changeContainerPosition?.(getID(), "+")}
            aria-label="ลง"
          >
            <MoveDown className="size-4 m-[5px]" />
          </button>
        </Tooltip>
        <Tooltip title="ตั้งค่า" {...SMALL_TOOLTIP_PROPS}>
          <button
            className=" bg-gray-900  text-white  px-[3px] py-1"
            onClick={() =>
              openOffcavanas(
                offcavanas,
                {
                  ...element,
                  _sectionIndex: effectiveIDX,
                  _isSplitSection: Boolean(_splitRowId),
                  _previewTargetIds: _splitRowId
                    ? layouts
                        .filter((layout) => layout?.splitRowId === _splitRowId)
                        .map((layout) => layout?.container?.id)
                        .filter(Boolean)
                    : [element?.id],
                },
                onUpdate
              )
            }
          >
            <Settings className="size-4 m-[5px]" />
          </button>
        </Tooltip>
        <Tooltip title="คัดลอก" {...SMALL_TOOLTIP_PROPS}>
          <button
            className=" bg-gray-900   text-white px-[3px] py-1"
            onClick={() => cloneCon(getID())}
          >
            <Copy className="size-4 m-[5px]" />
          </button>
        </Tooltip>
        <Tooltip title="ลบ" {...SMALL_TOOLTIP_PROPS}>
          <button
            className=" bg-gray-900  text-white px-[3px] py-1"
            onClick={() => modal({ id: getID(), funct: removeCon })}
          >
            <Trash2 className="size-4 m-[5px]" />
          </button>
        </Tooltip>
      </div>)
    }

    else if(offcavanas === "Column"){
        return (
            <>
            <div
            className="flex items-center justify-center absolute -top-px -left-px"
              data-drop="COLUMN-BTN"
              onMouseLeave={(e) => {
                const columnHost = e.currentTarget.closest?.('[data-drop="COLUMN"]');
                const nextTarget = e.relatedTarget;
                const NodeConstructor =
                  columnHost?.ownerDocument?.defaultView?.Node;
                const stillInsideColumn =
                  Boolean(columnHost) &&
                  Boolean(NodeConstructor) &&
                  nextTarget instanceof NodeConstructor &&
                  columnHost.contains(nextTarget);
                if (stillInsideColumn) return;
                // ปล่อยให้ root ของ Column เป็นผู้จัดการการปิด pin/unpin หลัก
                // เพื่อลดอาการเปิด More Option แล้วหลุดเองแบบสุ่ม
              }}
            >
              {!columnMoreOpen && (
                <>
                  <Tooltip title="ก่อนหน้า" {...SMALL_TOOLTIP_PROPS}>
                    <button
                      className=" bg-gray-900  text-white  px-[3px] py-1"
                      onClick={() => changeColumnPosition?.(getID(), "-")}
                      aria-label="ก่อนหน้า"
                    >
                      <MoveLeft className="size-4 m-[5px]" />
                    </button>
                  </Tooltip>
                  <Tooltip title="ถัดไป" {...SMALL_TOOLTIP_PROPS}>
                    <button
                      className=" bg-gray-900  text-white  px-[3px] py-1"
                      onClick={() => changeColumnPosition?.(getID(), "+")}
                      aria-label="ถัดไป"
                    >
                      <MoveRight className="size-4 m-[5px]" />
                    </button>
                  </Tooltip>
                  <Tooltip title="ตั้งค่า" {...SMALL_TOOLTIP_PROPS}>
                    <button
                      className=" bg-gray-900  text-white  px-[3px] py-1"
                      onClick={() => openOffcavanas(offcavanas, element, onUpdate)}
                    >
                      <Settings className="size-4 m-[5px]" />
                    </button>
                  </Tooltip>
                  <Tooltip title="คัดลอก" {...SMALL_TOOLTIP_PROPS}>
                    <button
                      className=" bg-gray-900  text-white  px-[3px] py-1"
                      onClick={() => cloneCol(getID())}
                    >
                      <Copy className="size-4 m-[5px]" />
                    </button>
                  </Tooltip>
                  <Tooltip title="ย่อ" {...SMALL_TOOLTIP_PROPS}>
                    <button
                      className=" bg-gray-900  text-white  px-[3px] py-1"
                      onClick={() => changeSizeColumn(getID(), "-")}
                    >
                      <Minus className="size-4 m-[5px]" />
                    </button>
                  </Tooltip>
                  <Tooltip title="ขยาย" {...SMALL_TOOLTIP_PROPS}>
                    <button
                      className=" bg-gray-900  text-white  px-[3px] py-1"
                      onClick={() => changeSizeColumn(getID(), "+")}
                    >
                      <Plus className="size-4 m-[5px]" />
                    </button>
                  </Tooltip>
                  <Tooltip title="ลบ" {...SMALL_TOOLTIP_PROPS}>
                    <button
                      className=" bg-gray-900  text-white px-[3px] py-1"
                      onClick={() => modal({ id: getID(), funct: removeCol })}
                    >
                      <Trash2 className="size-4 m-[5px]" />
                    </button>
                  </Tooltip>
                  <Tooltip title="เพิ่มเติม" {...SMALL_TOOLTIP_PROPS}>
                    <button
                      type="button"
                      draggable={false}
                      className="bg-gray-600 text-white px-[3px] py-1"
                      onPointerDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openColumnMore();
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openColumnMore();
                      }}
                    >
                      <EllipsisVertical className="size-4 m-[5px]" />
                    </button>
                  </Tooltip>
                </>
              )}
              <div
                className={[
                  "overflow-x-hidden overflow-y-visible",
                  "transition-[width,opacity] duration-400 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
                  columnMoreOpen ? "opacity-100" : "opacity-0",
                ].join(" ")}
                style={{ width: columnMoreOpen ? `${COLUMN_TRACK_W}px` : "0px" }}
              >
                <div
                  className={[
                    "h-full flex items-center bg-transparent transform-gpu",
                    "transition-transform duration-400 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
                    columnMoreOpen ? "origin-left scale-x-100" : "origin-left scale-x-0",
                  ].join(" ")}
                  style={{ width: `${COLUMN_TRACK_W}px` }}
                >
                  {columnMoreOpen && (
                    <>
                      <Tooltip title="ปิด More Option" {...SMALL_TOOLTIP_PROPS}>
                        <button
                          type="button"
                          draggable={false}
                          className="bg-gray-600 text-white px-[3px] py-1"
                          onClick={closeColumnMore}
                        >
                          <EllipsisVertical className="size-4 m-[5px]" />
                        </button>
                      </Tooltip>
                      {!element?.colData?.isSpan && (
                        <Tooltip title="แยกเซลล์" {...SMALL_TOOLTIP_PROPS}>
                          <button
                            className="bg-gray-900 px-[3px] py-1 text-white"
                            data-builder-performance-owned="canvas-column-split"
                            onClick={splitColumnCells}
                            aria-label="แยกเซลล์"
                          >
                            <Grid2X2Plus className="size-4 m-[5px]" />
                          </button>
                        </Tooltip>
                      )}
                      {hasPresetElementsInColumn ? (
                        <Tooltip title="บันทึก Preset" {...SMALL_TOOLTIP_PROPS}>
                          <button
                            type="button"
                            draggable={false}
                            className="bg-gray-900 text-white px-[3px] py-1"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              openSavePresetModal();
                            }}
                          >
                            <Save className="size-4 m-[5px]" />
                          </button>
                        </Tooltip>
                      ) : null}
                      <Tooltip title="โหลด Preset" {...SMALL_TOOLTIP_PROPS}>
                        <button
                          type="button"
                          draggable={false}
                          className="bg-gray-900 text-white px-[3px] py-1"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            openLoadPresetModal();
                          }}
                        >
                          <Gem className="size-4 m-[5px]" />
                        </button>
                      </Tooltip>
                    </>
                  )}
                </div>
              </div>
            </div>
            </>
          );
    }

    else if(offcavanas === "Span"){


      if(sidx === 0){
        return (
          <div
            className="flex items-center justify-center absolute -top-px -left-px"
            data-drop="BTN"
          >
            {!isFirstSpanMoreOpen && (
              <>
                <Tooltip title="ตั้งค่า" {...SMALL_TOOLTIP_PROPS}>
                  <button
                    type="button"
                    className=" bg-gray-900  text-white  px-[3px] py-1"
                    draggable={false}
                    onClick={() => {
                      openSpanSettingsAsColumnPanel();
                    }}
                  >
                    <Settings className="size-4 m-[5px]" />
                  </button>
                </Tooltip>
                <Tooltip title="ก่อนหน้า" {...SMALL_TOOLTIP_PROPS}>
                  <button
                    type="button"
                    className=" bg-gray-900  text-white  px-[3px] py-1"
                    onClick={() => changeColumnPosition?.(getID(), "-")}
                    aria-label="ก่อนหน้า"
                  >
                    <MoveLeft className="size-4 m-[5px]" />
                  </button>
                </Tooltip>
                <Tooltip title="ถัดไป" {...SMALL_TOOLTIP_PROPS}>
                  <button
                    type="button"
                    className=" bg-gray-900  text-white  px-[3px] py-1"
                    onClick={() => changeColumnPosition?.(getID(), "+")}
                    aria-label="ถัดไป"
                  >
                    <MoveRight className="size-4 m-[5px]" />
                  </button>
                </Tooltip>
                <Tooltip title="คัดลอก" {...SMALL_TOOLTIP_PROPS}>
                  <button
                    type="button"
                    className=" bg-gray-900  text-white  px-[3px] py-1"
                    draggable={false}
                    onClick={() => {
                      cloneCol(getID());
                    }}
                  >
                    <Copy className="size-4 m-[5px]" />
                  </button>
                </Tooltip>
                <Tooltip title="ลบ" {...SMALL_TOOLTIP_PROPS}>
                  <button
                    className=" bg-gray-900  text-white px-[3px] py-1"
                    type="button"
                    draggable={false}
                    onClick={() => {
                      modal({ id: getID(), funct: removeCol });
                    }}
                  >
                    <Trash2 className="size-4 m-[5px]" />
                  </button>
                </Tooltip>
                <Tooltip title="ย่อ" {...SMALL_TOOLTIP_PROPS}>
                  <button
                    type="button"
                    draggable={false}
                    className=" bg-gray-900  text-white  px-[3px] py-1"
                    onClick={() => {
                      changeSizeColumn?.(getID(), "-");
                    }}
                    aria-label="ย่อ Column"
                  >
                    <Minus className="size-4 m-[5px]" />
                  </button>
                </Tooltip>
                <Tooltip title="ขยาย" {...SMALL_TOOLTIP_PROPS}>
                  <button
                    type="button"
                    draggable={false}
                    className=" bg-gray-900  text-white  px-[3px] py-1"
                    onClick={() => {
                      changeSizeColumn?.(getID(), "+");
                    }}
                    aria-label="ขยาย Column"
                  >
                    <Plus className="size-4 m-[5px]" />
                  </button>
                </Tooltip>
                <Tooltip title="เพิ่มเติม" {...SMALL_TOOLTIP_PROPS}>
                  <button
                    type="button"
                    className=" bg-gray-600  text-white  px-[3px] py-1"
                    draggable={false}
                    onClick={() => {
                      changeRange("+");
                    }}
                  >
                    <EllipsisVertical className="size-4 m-[5px]" />
                  </button>
                </Tooltip>
              </>
            )}

            <div
              className={[
                " overflow-x-hidden overflow-y-visible ",
                "transition-[width,opacity] duration-400 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
                isFirstSpanMoreOpen ? "opacity-100" : "opacity-0",
              ].join(" ")}
              style={{ width: isFirstSpanMoreOpen ? `${TRACK_W}px` : "0px" }}
            >
              <div
                className={[
                  "h-full flex items-center bg-transparent transform-gpu",
                  "transition-transform duration-400 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
                  isFirstSpanMoreOpen ? "origin-left scale-x-100" : "origin-left scale-x-0",
                ].join(" ")}
                style={{ width: `${TRACK_W}px` }}
              >
                {isFirstSpanMoreOpen && (
                  <>
                    <Tooltip title="ปิด More Option" {...SMALL_TOOLTIP_PROPS}>
                      <button
                        type="button"
                        className=" bg-gray-600  text-white  px-[3px] py-1"
                        draggable={false}
                        onClick={() => {
                          changeRange("-");
                        }}
                      >
                        <EllipsisVertical className="size-4 m-[5px]" />
                      </button>
                    </Tooltip>
                    <Tooltip title="ก่อนหน้า" {...SMALL_TOOLTIP_PROPS}>
                      <button
                        type="button"
                        draggable={false}
                        className=" bg-gray-900  text-white  px-[3px] py-1"
                        onClick={() => {
                          changeSpanPosition(sidx, getID(), "-");
                        }}
                        aria-label="ก่อนหน้า"
                      >
                        <MoveLeft className="size-4 m-[5px]" />
                      </button>
                    </Tooltip>
                    <Tooltip title="ถัดไป" {...SMALL_TOOLTIP_PROPS}>
                      <button
                        type="button"
                        draggable={false}
                        className=" bg-gray-900  text-white  px-[3px] py-1"
                        onClick={() => {
                          changeSpanPosition(sidx, getID(), "+");
                        }}
                        aria-label="ถัดไป"
                      >
                        <MoveRight className="size-4 m-[5px]" />
                      </button>
                    </Tooltip>
                    <Tooltip title="เพิ่ม" {...SMALL_TOOLTIP_PROPS}>
                      <button
                        type="button"
                        className=" bg-gray-900  text-white  px-[3px] py-1"
                        draggable={false}
                        data-builder-performance-owned="canvas-clone-span"
                        onClick={() => {
                          cloneSpn(getID("S"));
                        }}
                      >
                        <Grid2X2Plus className="size-[17px] m-[4.5px]" />
                      </button>
                    </Tooltip>
                    <Tooltip title="ลบ" {...SMALL_TOOLTIP_PROPS}>
                      <button
                        className=" bg-gray-900  text-white  px-[3px] py-1"
                        type="button"
                        draggable={false}
                        onClick={() => {
                          modal({ id: getID("S"), funct: removeSpn });
                        }}
                      >
                        <Grid2X2X className="size-[17px] m-[4.5px]" />
                      </button>
                    </Tooltip>
                    <Tooltip title="ย่อ" {...SMALL_TOOLTIP_PROPS}>
                      <button
                        type="button"
                        draggable={false}
                        className=" bg-gray-900  text-white  px-[3px] py-1"
                        onClick={() => {
                          resizeSpan("-");
                        }}
                        aria-label="ย่อ Span"
                      >
                        <Minimize2 className="size-4 m-[5px]" />
                      </button>
                    </Tooltip>
                    <Tooltip title="ขยาย" {...SMALL_TOOLTIP_PROPS}>
                      <button
                        type="button"
                        draggable={false}
                        className=" bg-gray-900  text-white  px-[3px] py-1"
                        onClick={() => {
                          resizeSpan("+");
                        }}
                        aria-label="ขยาย Span"
                      >
                        <Maximize2 className="size-4 m-[5px]" />
                      </button>
                    </Tooltip>
                    <Tooltip title="โหลด Preset" {...SMALL_TOOLTIP_PROPS}>
                      <button
                        type="button"
                        draggable={false}
                        className=" bg-gray-900  text-white  px-[3px] py-1"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openLoadPresetModal();
                        }}
                      >
                        <Gem className="size-4 m-[5px]" />
                      </button>
                    </Tooltip>
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
          data-drop="BTN"
        >
          {range === 0 && (
            <>
              <Tooltip title="ตั้งค่า" {...SMALL_TOOLTIP_PROPS}>
                <button
                  type="button"
                  className=" bg-gray-900  text-white  px-[3px] py-1"
                  draggable={false}
                  onClick={() => { openSpanSettingsAsColumnPanel(); }}
                >
                  <Settings className="size-4 m-[5px]" />
                </button>
              </Tooltip>
              <Tooltip title="เพิ่ม" {...SMALL_TOOLTIP_PROPS}>
                <button
                  type="button"
                  className=" bg-gray-900  text-white  px-[3px] py-1"
                  draggable={false}
                  data-builder-performance-owned="canvas-clone-span"
                  onClick={() => { cloneSpn(getID()); }}
                >
                  <Grid2X2Plus className="size-[17px] m-[4.5px]" />
                </button>
              </Tooltip>
              <Tooltip title="ลบ" {...SMALL_TOOLTIP_PROPS}>
                <button
                  className=" bg-gray-900  text-white  px-[3px] py-1"
                  type="button"
                  draggable={false}
                  onClick={() => { modal({ id: getID(), funct: removeSpn }); }}
                >
                  <Grid2X2X className="size-[17px] m-[4.5px]" />
                </button>
              </Tooltip>
              <Tooltip title="ก่อนหน้า" {...SMALL_TOOLTIP_PROPS}>
                <button
                  type="button"
                  draggable={false}
                  className=" bg-gray-900  text-white  px-[3px] py-1"
                  onClick={() => { changeSpanPosition(sidx, getID(), "-"); }}
                  aria-label="ก่อนหน้า"
                >
                  <MoveLeft className="size-4 m-[5px]" />
                </button>
              </Tooltip>
              <Tooltip title="ถัดไป" {...SMALL_TOOLTIP_PROPS}>
                <button
                  type="button"
                  draggable={false}
                  className=" bg-gray-900  text-white  px-[3px] py-1"
                  onClick={() => { changeSpanPosition(sidx, getID(), "+"); }}
                  aria-label="ถัดไป"
                >
                  <MoveRight className="size-4 m-[5px]" />
                </button>
              </Tooltip>
              <Tooltip title="ย่อ" {...SMALL_TOOLTIP_PROPS}>
                <button
                  type="button"
                  draggable={false}
                  className=" bg-gray-900  text-white  px-[3px] py-1"
                  onClick={() => {
                    resizeSpan("-");
                  }}
                  aria-label="ย่อ Span"
                >
                  <Minimize2 className="size-4 m-[5px]" />
                </button>
              </Tooltip>
              <Tooltip title="ขยาย" {...SMALL_TOOLTIP_PROPS}>
                <button
                  type="button"
                  draggable={false}
                  className=" bg-gray-900  text-white  px-[3px] py-1"
                  onClick={() => {
                    resizeSpan("+");
                  }}
                  aria-label="ขยาย Span"
                >
                  <Maximize2 className="size-4 m-[5px]" />
                </button>
              </Tooltip>
              <Tooltip title="โหลด Preset" {...SMALL_TOOLTIP_PROPS}>
                <button
                  type="button"
                  draggable={false}
                  className=" bg-gray-900  text-white  px-[3px] py-1"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openLoadPresetModal();
                  }}
                >
                  <Gem className="size-4 m-[5px]" />
                </button>
              </Tooltip>
            </>
          )}
        </div>
      );
    }

  }

export default ServiceLayout