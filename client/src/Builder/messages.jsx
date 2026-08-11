import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Modal, Box, Fade, Backdrop, Button } from "@mui/material";
import {
  Archive,
  Check,
  Inbox,
  Mail,
  MailOpen,
  Loader,
  Minus,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import {
  deleteFormResponse,
  getFormResponses,
  updateFormResponse,
} from "../../Functions/forms";

const FORMS_MENU_BAR_ID = "69db17211be82fe7637ea096";

const notifyMessagesChanged = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("wb:messages-changed"));
};

/** สีจาก Dashboard Settings — สลับ Light/Dark ตาม CSS vars อัตโนมัติ */
const C = {
  bg: "var(--dash-bg, #f8fafc)",
  surface: "var(--dash-header-bg, var(--dash-nav, #ffffff))",
  border: "var(--dash-border, #e2e8f0)",
  text: "var(--dash-text, #334155)",
  textMuted: "var(--dash-text-muted, #64748b)",
  heading: "var(--dash-panel-heading, var(--dash-heading, #0f172a))",
  active: "var(--dash-panel-btn-group-active, var(--dash-panel-accent, #333333))",
  activeText: "var(--dash-panel-btn-group-active-text, #ffffff)",
  panelInactive: "var(--dash-panel-btn-group-inactive, #ffffff)",
  panelBorder:
    "var(--dash-panel-btn-group-border, var(--dash-border, #e2e8f0))",
  activeSoft: "color-mix(in srgb, var(--dash-panel-btn-group-active, #333333) 12%, transparent)",
  activeSofter: "color-mix(in srgb, var(--dash-panel-btn-group-active, #333333) 7%, transparent)",
  unreadRow: "color-mix(in srgb, var(--dash-bg, #f8fafc) 92%, var(--dash-panel-btn-group-active, #333333))",
  mutedFill: "color-mix(in srgb, var(--dash-border, #e2e8f0) 65%, transparent)",
  hairline: "color-mix(in srgb, var(--dash-border, #e2e8f0) 45%, transparent)",
  starIdle:
    "color-mix(in srgb, var(--dash-text-muted, #64748b) 55%, var(--dash-border, #e2e8f0))",
};

function ThemeCheckbox({
  checked = false,
  indeterminate = false,
  disabled = false,
  onChange,
  title,
  ariaLabel,
}) {
  const isOn = checked || indeterminate;
  return (
    <label
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center ${
        disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"
      }`}
      title={title}
      onClick={(event) => event.stopPropagation()}
    >
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        disabled={disabled}
        aria-label={ariaLabel || title}
        ref={(el) => {
          if (el) el.indeterminate = indeterminate;
        }}
        onChange={(event) => onChange?.(event.target.checked)}
      />
      <span
        className="inline-flex size-[18px] items-center justify-center rounded-[4px] border-[1.5px] transition"
        style={{
          borderColor: isOn ? C.active : C.panelBorder,
          background: isOn ? C.active : C.panelInactive,
        }}
        aria-hidden
      >
        {indeterminate ? (
          <Minus size={12} strokeWidth={3} style={{ color: C.activeText }} />
        ) : checked ? (
          <Check size={12} strokeWidth={3} style={{ color: C.activeText }} />
        ) : null}
      </span>
    </label>
  );
}

const formatMessageTime = (raw) => {
  if (!raw) return "";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  if (sameDay) {
    return date.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
    });
  }
  return date.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const answerValueText = (item) => {
  if (Array.isArray(item?.value)) {
    return item.value.filter(Boolean).map(String).join(", ").trim();
  }
  return String(item?.value ?? "").trim();
};

const PRIMARY_LABEL_PATTERNS = [
  /ชื่อลูกค้า/i,
  /ชื่อ[-\s]?นาม/i,
  /^ชื่อ$/i,
  /^name$/i,
  /customer\s*name/i,
  /full\s*name/i,
];

const pickPrimaryAnswerValue = (answers) => {
  if (!Array.isArray(answers) || answers.length === 0) return "";
  const parts = answers
    .map((item) => ({
      label: String(item?.label || "").trim(),
      value: answerValueText(item),
    }))
    .filter((item) => item.value);
  if (parts.length === 0) return "";
  const matched = parts.find((item) =>
    PRIMARY_LABEL_PATTERNS.some((pattern) => pattern.test(item.label))
  );
  return matched?.value || parts[0].value;
};

const answerLineParts = (answers) => {
  if (!Array.isArray(answers) || answers.length === 0) {
    return { primaryTitle: "", preview: "" };
  }
  const parts = answers
    .map((item) => {
      const value = answerValueText(item);
      if (!value) return null;
      const label = String(item?.label || "").trim();
      return { label, value };
    })
    .filter(Boolean);

  if (parts.length === 0) return { primaryTitle: "", preview: "" };

  const primaryTitle = pickPrimaryAnswerValue(answers);
  const preview = parts
    .slice(1)
    .map((item) => (item.label ? `${item.label}: ${item.value}` : item.value))
    .join(" · ");
  return { primaryTitle, preview };
};

const normalizeMessage = (row) => {
  const id = String(row?._id || row?.id || "");
  const answers = Array.isArray(row?.answers) ? row.answers : [];
  const meta = row?.meta && typeof row.meta === "object" ? row.meta : {};
  const formName = String(row?.formName || "").trim() || "ฟอร์ม";
  const { primaryTitle, preview } = answerLineParts(answers);
  return {
    id,
    formPresetId: String(row?.formPresetId || ""),
    formName,
    answers,
    meta,
    read: row?.read === true || meta?.read === true,
    starred: row?.starred === true || meta?.starred === true,
    createdAt: row?.createdAt || null,
    /** ชื่อหลักจากฟิลด์ เช่น ชื่อลูกค้า */
    primaryTitle,
    /** บรรทัดแรกในรายการ: ชื่อหลักเท่านั้น (ไม่รวมชื่อฟอร์ม) */
    title: primaryTitle || formName,
    preview,
  };
};

/** Modal Confirm ธีมเดียวกับ Builder / Media */
function DeleteConfirmModal({ open, title, message, onConfirm, onClose }) {
  const isOpen = Boolean(open);
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="messages-delete-title"
      aria-describedby="messages-delete-desc"
      slotProps={{ backdrop: { timeout: 200 } }}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
    >
      <Fade in={isOpen} timeout={200}>
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
            <div id="messages-delete-title" className="text-[15px] font-bold">
              <span className="text-red-600 dark:text-emerald-300">Delete</span>{" "}
              {title}
            </div>
            <div>
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer bg-transparent p-0 text-[14px]"
              >
                X
              </button>
            </div>
          </div>
          <div className="flex-1 border-b border-dotted border-gray-500/50" />
          <div
            id="messages-delete-desc"
            className="mt-4 flex justify-center text-[13px]"
          >
            {message}
          </div>
          <div className="my-4 flex justify-center pb-5">
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
              onClick={onConfirm}
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
              onClick={onClose}
            >
              ยกเลิก
            </Button>
          </div>
        </Box>
      </Fade>
    </Modal>
  );
}

export default function MessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState("");
  const [folder, setFolder] = useState("all"); // all | unread | read | starred
  const [checkedIds, setCheckedIds] = useState(() => new Set());
  const [deletingChecked, setDeletingChecked] = useState(false);
  /** null | { type: "single", id, label } | { type: "bulk", ids, count } */
  const [pendingDelete, setPendingDelete] = useState(null);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getFormResponses(FORMS_MENU_BAR_ID);
      const rows = Array.isArray(res?.data) ? res.data : [];
      const next = rows.map(normalizeMessage).filter((item) => item.id);
      setMessages(next);
      setCheckedIds(new Set());
      setSelectedId((prev) =>
        prev && next.some((item) => item.id === prev) ? prev : ""
      );
    } catch {
      setMessages([]);
      setCheckedIds(new Set());
      setError("โหลดข้อความไม่สำเร็จ");
    } finally {
      setLoading(false);
      notifyMessagesChanged();
    }
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return messages.filter((item) => {
      if (folder === "unread" && item.read) return false;
      if (folder === "read" && !item.read) return false;
      if (folder === "starred" && !item.starred) return false;
      if (!q) return true;
      const hay = `${item.title} ${item.preview} ${item.formName}`.toLowerCase();
      return hay.includes(q);
    });
  }, [messages, query, folder]);

  const selected = useMemo(
    () => filtered.find((item) => item.id === selectedId) || null,
    [filtered, selectedId]
  );

  const unreadCount = useMemo(
    () => messages.filter((item) => !item.read).length,
    [messages]
  );
  const readCount = useMemo(
    () => messages.filter((item) => item.read).length,
    [messages]
  );
  const starredCount = useMemo(
    () => messages.filter((item) => item.starred).length,
    [messages]
  );

  const selectFolder = (nextFolder) => {
    setFolder(nextFolder);
    setSelectedId("");
    setCheckedIds(new Set());
  };

  const filteredIds = useMemo(
    () => filtered.map((item) => item.id),
    [filtered]
  );
  const allFilteredChecked =
    filteredIds.length > 0 && filteredIds.every((id) => checkedIds.has(id));
  const someFilteredChecked = filteredIds.some((id) => checkedIds.has(id));
  const checkedCount = useMemo(
    () => filteredIds.filter((id) => checkedIds.has(id)).length,
    [filteredIds, checkedIds]
  );

  const toggleChecked = (messageId, nextChecked) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (nextChecked) next.add(messageId);
      else next.delete(messageId);
      return next;
    });
  };

  const toggleCheckAllFiltered = () => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (allFilteredChecked) {
        filteredIds.forEach((id) => next.delete(id));
      } else {
        filteredIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const markRead = async (message) => {
    if (!message?.id || message.read) return;
    setMessages((prev) =>
      prev.map((item) =>
        item.id === message.id ? { ...item, read: true } : item
      )
    );
    try {
      await updateFormResponse(message.id, { read: true });
      notifyMessagesChanged();
    } catch {
      /* keep optimistic UI */
    }
  };

  const toggleStarred = async (message, event) => {
    event?.stopPropagation?.();
    event?.preventDefault?.();
    if (!message?.id) return;
    const nextStarred = !message.starred;
    setMessages((prev) =>
      prev.map((item) =>
        item.id === message.id ? { ...item, starred: nextStarred } : item
      )
    );
    try {
      await updateFormResponse(message.id, { starred: nextStarred });
    } catch {
      setMessages((prev) =>
        prev.map((item) =>
          item.id === message.id ? { ...item, starred: message.starred } : item
        )
      );
    }
  };

  const openMessage = async (message) => {
    setSelectedId(message.id);
    await markRead(message);
  };

  const requestDeleteOne = (message) => {
    if (!message?.id || busyId || deletingChecked) return;
    setPendingDelete({
      type: "single",
      id: message.id,
      label: message.title || message.formName || "ข้อความ",
    });
  };

  const requestDeleteChecked = () => {
    const ids = filteredIds.filter((id) => checkedIds.has(id));
    if (ids.length === 0 || deletingChecked || busyId) return;
    setPendingDelete({
      type: "bulk",
      ids,
      count: ids.length,
    });
  };

  const closeDeleteConfirm = () => {
    if (busyId || deletingChecked) return;
    setPendingDelete(null);
  };

  const confirmPendingDelete = async () => {
    if (!pendingDelete) return;
    if (pendingDelete.type === "single") {
      const messageId = pendingDelete.id;
      setPendingDelete(null);
      if (!messageId) return;
      setBusyId(messageId);
      try {
        await deleteFormResponse(messageId);
        setMessages((prev) => {
          const next = prev.filter((item) => item.id !== messageId);
          setSelectedId((current) => {
            if (current !== messageId) return current;
            return next[0]?.id || "";
          });
          return next;
        });
        setCheckedIds((prev) => {
          const next = new Set(prev);
          next.delete(messageId);
          return next;
        });
      } catch {
        setError("ลบข้อความไม่สำเร็จ");
      } finally {
        setBusyId("");
        notifyMessagesChanged();
      }
      return;
    }

    const ids = Array.isArray(pendingDelete.ids) ? pendingDelete.ids : [];
    setPendingDelete(null);
    if (ids.length === 0 || deletingChecked) return;
    setDeletingChecked(true);
    setError("");
    try {
      await Promise.all(ids.map((id) => deleteFormResponse(id)));
      const removeSet = new Set(ids);
      setMessages((prev) => prev.filter((item) => !removeSet.has(item.id)));
      setSelectedId((current) => (removeSet.has(current) ? "" : current));
      setCheckedIds((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
    } catch {
      setError("ลบข้อความที่เลือกไม่สำเร็จ");
    } finally {
      setDeletingChecked(false);
      notifyMessagesChanged();
    }
  };

  const deleteConfirmTitle =
    pendingDelete?.type === "bulk"
      ? `ข้อความ (${pendingDelete.count})`
      : pendingDelete?.label || "ข้อความ";
  const deleteConfirmMessage =
    pendingDelete?.type === "bulk"
      ? `คุณต้องการลบข้อความที่เลือก ${pendingDelete.count} รายการใช่หรือไม่?`
      : `คุณต้องการลบข้อความนี้ใช่หรือไม่?`;

  return (
    <main
      className="content-area flex min-h-0 flex-1 flex-col overflow-hidden"
      style={{
        background: C.bg,
        color: C.text,
      }}
    >
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Left rail — Gmail-like folders */}
        <aside
          className="hidden w-[220px] shrink-0 flex-col border-r md:flex"
          style={{
            background: C.surface,
            borderColor: C.border,
          }}
        >
          <div
            className="flex h-[52px] shrink-0 items-center gap-2 border-b px-3"
            style={{ borderColor: C.border }}
          >
            <Mail size={18} style={{ color: C.heading }} />
            <span
              className="text-[14px] font-semibold tracking-wide"
              style={{ color: C.heading }}
            >
              กล่องข้อความ
            </span>
          </div>
          <div className="flex flex-col">
            {[
              {
                id: "all",
                label: "ข้อความทั้งหมด",
                icon: Inbox,
                count: messages.length,
              },
              {
                id: "unread",
                label: "ยังไม่ได้อ่าน",
                icon: Mail,
                count: unreadCount,
              },
              {
                id: "read",
                label: "อ่านแล้ว",
                icon: MailOpen,
                count: readCount,
              },
              {
                id: "starred",
                label: "ติดดาว",
                icon: Star,
                count: starredCount,
              },
            ].map((item) => {
              const active = folder === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectFolder(item.id)}
                  className="flex h-[64px] w-full shrink-0 items-center gap-3 border-b px-3 text-left text-[13px] font-medium transition"
                  style={{
                    borderColor: C.border,
                    background: active ? C.activeSoft : "transparent",
                    color: C.heading,
                  }}
                >
                  <Icon size={16} className="shrink-0" />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {item.count > 0 ? (
                    <span
                      className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums leading-none"
                      style={
                        item.id === "unread"
                          ? {
                              background: C.active,
                              color: C.activeText,
                            }
                          : {
                              background: C.mutedFill,
                              color: C.heading,
                            }
                      }
                    >
                      {item.count > 99 ? "99+" : item.count}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Message list */}
        <section
          className={`min-w-0 flex-col border-r md:flex md:w-[360px] lg:w-[400px] ${
            selected ? "hidden md:flex" : "flex w-full"
          }`}
          style={{
            background: C.surface,
            borderColor: C.border,
          }}
        >
          <div
            className="flex h-[52px] shrink-0 items-center gap-2 border-b px-3"
            style={{ borderColor: C.border }}
          >
            <ThemeCheckbox
              checked={allFilteredChecked}
              indeterminate={!allFilteredChecked && someFilteredChecked}
              disabled={filtered.length === 0}
              title={allFilteredChecked ? "ยกเลิกเลือกทั้งหมด" : "เลือกทั้งหมด"}
              ariaLabel={allFilteredChecked ? "ยกเลิกเลือกทั้งหมด" : "เลือกทั้งหมด"}
              onChange={() => toggleCheckAllFiltered()}
            />
            {checkedCount > 0 ? (
              <button
                type="button"
                title="ลบรายการที่เลือก"
                disabled={deletingChecked}
                onClick={requestDeleteChecked}
                className="dash-button inline-flex h-8 items-center gap-1 rounded-md border-0 px-2 text-[11px] font-medium transition hover:opacity-90 disabled:opacity-50"
              >
                <Trash2 size={12} />
                {deletingChecked ? "กำลังลบ..." : `ลบรายการที่เลือก - ${checkedCount}`}
              </button>
            ) : (
              <div
                className="flex h-8 min-w-0 flex-1 items-center gap-1.5 rounded-full px-2.5"
                style={{ background: C.mutedFill }}
              >
                <Search
                  size={12}
                  className="shrink-0"
                  style={{ color: C.textMuted }}
                />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="ค้นหาข้อความ"
                  className="h-full w-full min-w-0 bg-transparent text-[11px] outline-none"
                  style={{ color: C.text }}
                />
              </div>
            )}
            {checkedCount === 0 ? (
              <button
                type="button"
                title="รีเฟรช"
                onClick={loadMessages}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full transition hover:opacity-80"
                style={{ color: C.textMuted }}
              >
                <Loader
                  size={16}
                  strokeWidth={2.5}
                  className={loading ? "animate-spin" : ""}
                />
              </button>
            ) : null}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {loading ? (
              <div
                className="px-4 py-8 text-center text-[13px]"
                style={{ color: C.textMuted }}
              >
                กำลังโหลดข้อความ...
              </div>
            ) : error ? (
              <div className="px-4 py-8 text-center text-[13px] text-red-500">
                {error}
              </div>
            ) : filtered.length === 0 ? (
              <div className="h-full min-h-[120px]" />
            ) : (
              filtered.map((message) => {
                const active = message.id === selectedId;
                const checked = checkedIds.has(message.id);
                return (
                  <div
                    key={message.id}
                    className="flex h-[64px] w-full shrink-0 items-center gap-2 border-b px-3 transition"
                    style={{
                      borderColor: C.border,
                      background: active
                        ? C.activeSoft
                        : checked
                          ? C.activeSofter
                          : message.read
                            ? "transparent"
                            : C.unreadRow,
                    }}
                  >
                    <ThemeCheckbox
                      checked={checked}
                      ariaLabel={`เลือก ${message.title}`}
                      onChange={(nextChecked) =>
                        toggleChecked(message.id, nextChecked)
                      }
                    />
                    <button
                      type="button"
                      onClick={() => openMessage(message)}
                      className="flex min-w-0 flex-1 items-center justify-between gap-2 text-left"
                    >
                      <span
                        className={`min-w-0 truncate text-[13px] ${
                          message.read ? "font-medium" : "font-semibold"
                        }`}
                        style={{ color: C.heading }}
                      >
                        {message.title}
                      </span>
                      <span
                        className="shrink-0 text-[11px] tabular-nums"
                        style={{ color: C.textMuted }}
                      >
                        {formatMessageTime(message.createdAt)}
                      </span>
                    </button>
                    <button
                      type="button"
                      title={message.starred ? "เอาดาวออก" : "ติดดาว"}
                      aria-label={message.starred ? "เอาดาวออก" : "ติดดาว"}
                      aria-pressed={message.starred}
                      onClick={(event) => toggleStarred(message, event)}
                      className="inline-flex h-9 w-8 shrink-0 items-center justify-center rounded-md transition hover:opacity-80"
                    >
                      <Star
                        size={16}
                        strokeWidth={message.starred ? 0 : 2}
                        fill={message.starred ? C.active : "none"}
                        style={{
                          color: message.starred ? C.active : C.starIdle,
                        }}
                      />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Reading pane */}
        <section
          className={`min-w-0 flex-1 flex-col ${
            selected ? "flex" : "hidden md:flex"
          }`}
          style={{ background: C.surface }}
        >
          {!selected ? (
            <>
              <div
                className="flex h-[52px] shrink-0 items-center border-b px-5"
                style={{
                  background: C.surface,
                  borderColor: C.border,
                }}
              />
              <div
                className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 px-6"
                style={{ color: C.textMuted }}
              >
                <Archive size={40} strokeWidth={1.2} className="opacity-40" />
                <p className="text-[13px]">เลือกข้อความเพื่ออ่าน</p>
              </div>
            </>
          ) : (
            <>
              <div
                className="flex h-[52px] shrink-0 items-center justify-between gap-3 border-b px-3 sm:px-5"
                style={{
                  background: C.surface,
                  borderColor: C.border,
                }}
              >
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <button
                    type="button"
                    className="shrink-0 text-[12px] font-medium md:hidden"
                    style={{ color: C.textMuted }}
                    onClick={() => setSelectedId("")}
                  >
                    ←
                  </button>
                  <h2
                    className="flex min-w-0 flex-1 items-center gap-2 truncate text-[14px] font-semibold"
                    style={{ color: C.heading }}
                  >
                    {selected.primaryTitle ? (
                      <span className="min-w-0 truncate">
                        {selected.primaryTitle}
                      </span>
                    ) : null}
                    <span
                      className="inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-[11px] font-bold leading-none"
                      style={{
                        background: C.mutedFill,
                        color: C.heading,
                      }}
                    >
                      {selected.formName}
                    </span>
                    {selected.createdAt ? (
                      <span
                        className="shrink-0 text-[12px] font-medium tabular-nums"
                        style={{ color: C.textMuted }}
                      >
                        {new Date(selected.createdAt).toLocaleString("th-TH", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    ) : null}
                  </h2>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    title={selected.starred ? "เอาดาวออก" : "ติดดาว"}
                    aria-label={selected.starred ? "เอาดาวออก" : "ติดดาว"}
                    aria-pressed={selected.starred}
                    onClick={(event) => toggleStarred(selected, event)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border transition hover:opacity-90"
                    style={{
                      borderColor: C.border,
                      background: C.surface,
                    }}
                  >
                    <Star
                      size={16}
                      strokeWidth={selected.starred ? 0 : 2}
                      fill={selected.starred ? C.active : "none"}
                      style={{
                        color: selected.starred ? C.active : C.starIdle,
                      }}
                    />
                  </button>
                  <button
                    type="button"
                    disabled={busyId === selected.id}
                    onClick={() => requestDeleteOne(selected)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-[12px] font-medium transition hover:opacity-90 disabled:opacity-50"
                    style={{
                      borderColor: C.border,
                      background: C.surface,
                      color: C.text,
                    }}
                  >
                    <Trash2 size={14} />
                    ลบ
                  </button>
                </div>
              </div>
              <div
                className="min-h-0 flex-1 overflow-y-auto"
                style={{ background: C.surface }}
              >
                {selected.answers.length === 0 ? (
                  <p
                    className="px-5 py-4 text-[13px]"
                    style={{ color: C.textMuted }}
                  >
                    ไม่มีข้อมูลในข้อความนี้
                  </p>
                ) : (
                  <dl className="px-5">
                    {selected.answers.map((answer, index) => {
                      const label =
                        String(answer?.label || "").trim() ||
                        `ฟิลด์ ${index + 1}`;
                      const value = Array.isArray(answer?.value)
                        ? answer.value.filter(Boolean).join(", ")
                        : String(answer?.value ?? "").trim();
                      return (
                        <div
                          key={`${selected.id}-${index}-${label}`}
                          className="border-b py-3.5 text-[14px] leading-snug"
                          style={{ borderColor: C.hairline }}
                        >
                          <div
                            className="truncate"
                            title={`${label} : ${value || "—"}`}
                          >
                            <dt
                              className="inline font-medium"
                              style={{ color: C.textMuted }}
                            >
                              {label}
                            </dt>
                            <span
                              className="mx-1.5 font-medium"
                              style={{ color: C.textMuted }}
                            >
                              :
                            </span>
                            <dd
                              className="inline font-normal"
                              style={{ color: C.text }}
                            >
                              {value || "—"}
                            </dd>
                          </div>
                        </div>
                      );
                    })}
                  </dl>
                )}
              </div>
            </>
          )}
        </section>
      </div>

      <DeleteConfirmModal
        open={Boolean(pendingDelete)}
        title={deleteConfirmTitle}
        message={deleteConfirmMessage}
        onConfirm={confirmPendingDelete}
        onClose={closeDeleteConfirm}
      />
    </main>
  );
}
