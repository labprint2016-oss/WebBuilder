import { useCallback, useEffect, useState } from "react";
import {
  listPages,
  editPage,
  createPage,
  deletePage,
  setDefaultPage,
} from "../../Functions/pages";
import { Box, Modal, Zoom, Backdrop } from "@mui/material";
import {
  FileText,
  FilePenLine,
  Copy,
  Trash2,
  Star,
} from "lucide-react";

const normalizePageName = (value) => String(value || "").trim().toLowerCase();

const ServiceSelectPage = ({
  open,
  onClose,
  darkMode,
  activePageId = "",
  defaultPageId = "",
  onSelectPage = null,
  onPagesChanged = null,
}) => {
  const textColor = darkMode === "dark" ? "#ffffff" : "#202020";
  const [pages, setPages] = useState([]);
  const [editingPageId, setEditingPageId] = useState(null);
  const [editingPageName, setEditingPageName] = useState("");
  const [pageFooterMessage, setPageFooterMessage] = useState("");

  const loadPages = useCallback(() => {
    return listPages()
      .then((res) => {
        const nextPages = Array.isArray(res?.data) ? res.data : [];
        setPages(nextPages);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  useEffect(() => {
    if (!open) return;
    loadPages();
  }, [open, loadPages]);

  const handleClose = () => {
    setEditingPageId(null);
    setEditingPageName("");
    setPageFooterMessage("");
    onClose?.();
  };

  const notifyPagesChanged = (payload = {}) => {
    onPagesChanged?.(payload);
  };

  const copyPage = (id) => {
    const source = pages.find((page) => page._id === id);
    if (!source) return;
    const nextName = `${source.pageName || "Page"} - ${(Math.random() * 1e9).toString(16)}`;
    setPageFooterMessage("");
    createPage({ pageName: nextName })
      .then((res) => {
        const nextId = res?.data?._id || "";
        loadPages().then(() => {
          notifyPagesChanged({ reason: "copy", preferredPageId: nextId || activePageId });
        });
      })
      .catch((err) => console.log(err));
  };

  const removePage = (id) => {
    setPageFooterMessage("");
    deletePage(id)
      .then(() => {
        if (editingPageId === id) {
          setEditingPageId(null);
          setEditingPageName("");
        }
        loadPages().then(() => {
          notifyPagesChanged({ reason: "delete" });
        });
      })
      .catch((err) => console.log(err));
  };

  const markDefaultPage = (id) => {
    setPageFooterMessage("");
    setDefaultPage(id)
      .then(() => {
        loadPages().then(() => {
          notifyPagesChanged({ reason: "set_default", preferredPageId: id });
        });
      })
      .catch((err) => console.log(err));
  };

  const commitRenamePage = (id, nextName) => {
    const trimmedName = String(nextName || "").trim();
    if (trimmedName.length < 3) {
      setPageFooterMessage("ชื่อหน้าต้องอย่างน้อย 3 ตัวอักษร");
      return;
    }
    const hasDuplicate = pages.some(
      (item) =>
        item?._id !== id &&
        normalizePageName(item?.pageName) === normalizePageName(trimmedName)
    );
    if (hasDuplicate) {
      setPageFooterMessage("มีชื่อหน้านี้แล้ว");
      return;
    }

    editPage({ pageName: trimmedName }, id)
      .then(() => {
        setEditingPageId(null);
        setEditingPageName("");
        setPageFooterMessage("");
        loadPages().then(() => {
          notifyPagesChanged({ reason: "rename", preferredPageId: id });
        });
      })
      .catch((err) => {
        console.log(err);
        const serverMessage =
          typeof err?.response?.data === "string" && err.response.data.trim()
            ? err.response.data.trim()
            : "";
        setPageFooterMessage(serverMessage || "แก้ไขชื่อหน้าไม่สำเร็จ");
      });
  };

  const selectPage = (id) => {
    const page = pages.find((item) => item._id === id);
    if (!page) return;
    onSelectPage?.(id, page);
    handleClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="basic-modal-title"
      aria-describedby="basic-modal-desc"
      slotProps={{ backdrop: { timeout: 200 } }}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
    >
      <Zoom in={open} timeout={200}>
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 2,
            pointerEvents: "none",
            overflowY: "auto",
          }}
        >
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{
              pointerEvents: "auto",
              width: 620,
              maxWidth: "95vw",
              maxHeight: 360,
              backgroundColor: darkMode === "dark" ? "#27272a" : "#ffffff",
              borderRadius: 3,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div className="flex justify-between px-4 pt-3 pb-1 shrink-0">
              <div className="flex items-center gap-[20px]">
                <span className="text-[15px] font-extrabold" style={{ color: "#333333" }}>
                  เลือกหน้า
                </span>
                {pageFooterMessage ? (
                  <span className="text-left text-[13px]" style={{ color: "#b91c1b" }}>
                    {pageFooterMessage}
                  </span>
                ) : null}
              </div>
              <button
                type="button"
                className="text-[13px]"
                style={{ color: darkMode === "dark" ? "#ffffff" : "#202020" }}
                onClick={handleClose}
              >
                X
              </button>
            </div>
            <div className="mt-1 border-b-[5px] border-solid border-[#e5e7eb]" />

            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                px: 1.5,
              }}
            >
              <div className="w-full rounded-md px-[10px] pt-[4px] pb-[4px]">
                {pages.map((page) => {
                  const { _id: id, pageName } = page;
                  const isEditing = editingPageId === id;
                  const isActive = activePageId === id;
                  const isDefault = page?.isDefault === true || defaultPageId === id;
                  return (
                    <div
                      key={id}
                      className={`border-b last:border-0 ${
                        darkMode === "dark" ? "border-b-[#a9a8a81c]" : ""
                      } flex justify-between py-2`}
                      style={{ color: textColor }}
                    >
                      <div
                        className={`flex min-w-0 items-center gap-[10px] text-left ${
                          isEditing ? "cursor-default" : "cursor-pointer"
                        }`}
                        onClick={() => {
                          if (isEditing) return;
                          selectPage(id);
                        }}
                      >
                        <FileText
                          size={14}
                          strokeWidth={2.5}
                          style={{ opacity: 0.45, color: "#9ca3af", flexShrink: 0 }}
                        />
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              value={editingPageName}
                              onChange={(e) => {
                                setEditingPageName(e.target.value);
                                if (pageFooterMessage) {
                                  setPageFooterMessage("");
                                }
                              }}
                              className="h-[30px] min-w-[180px] rounded-md border border-[#e7e7e7] bg-transparent px-2 text-[13.5px] outline-none dark:border-[#494d54]"
                              autoFocus
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  commitRenamePage(id, editingPageName);
                                }
                                if (e.key === "Escape") {
                                  setEditingPageId(null);
                                  setEditingPageName("");
                                  setPageFooterMessage("");
                                }
                              }}
                            />
                            <button
                              type="button"
                              className="h-[30px] rounded-md bg-[#333333] px-3 text-[12px] text-white"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                commitRenamePage(id, editingPageName);
                              }}
                            >
                              บันทึก
                            </button>
                          </div>
                        ) : (
                          <span className={`truncate text-[13.5px] ${isActive ? "font-semibold" : ""}`}>
                            {pageName}
                          </span>
                        )}
                        {isDefault && (
                          <span className="ml-1 inline-flex items-center rounded-full bg-yellow-200 px-2 py-[1px] text-[10px] font-semibold text-yellow-900">
                            ค่าเริ่มต้น
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <div
                          className={`flex items-center justify-center pr-2 border-r last:border-0 cursor-pointer ${
                            darkMode === "dark" ? "border-r-[#a9a8a852]" : "border-r-slate-200"
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setEditingPageId(id);
                            setEditingPageName(pageName || "");
                            setPageFooterMessage("");
                          }}
                        >
                          <FilePenLine size={14} style={{ opacity: 0.6 }} className="mx-2" />
                        </div>
                        <div
                          className={`flex items-center justify-center pr-2 border-r last:border-0 cursor-pointer ${
                            darkMode === "dark" ? "border-r-[#a9a8a852]" : "border-r-slate-200"
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            copyPage(id);
                          }}
                        >
                          <Copy size={14} style={{ opacity: 0.6 }} className="mx-2" />
                        </div>
                        <div
                          className={`flex items-center justify-center pr-2 border-r last:border-0 cursor-pointer ${
                            darkMode === "dark" ? "border-r-[#a9a8a852]" : "border-r-slate-200"
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            markDefaultPage(id);
                          }}
                        >
                          <Star
                            size={14}
                            className="mx-2"
                            style={{ opacity: isDefault ? 1 : 0.6 }}
                            fill={isDefault ? "currentColor" : "none"}
                          />
                        </div>
                        <div
                          className={`flex items-center justify-center pr-2 border-r last:border-0 cursor-pointer ${
                            darkMode === "dark" ? "border-r-[#a9a8a852]" : "border-r-slate-200"
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removePage(id);
                          }}
                        >
                          <Trash2 size={14} style={{ opacity: 0.6 }} className="mx-2" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Box>
          </Box>
        </Box>
      </Zoom>
    </Modal>
  );
};

export default ServiceSelectPage;