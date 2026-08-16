import { memo, useRef } from "react";
import { mergeTableElement } from "./tableElementConfig";
import { setFont } from "../../../../function";
import { usePanelPreview } from "../../panelPreviewStore";

const alignClass = (align) => {
  if (align === "center") return "text-center";
  if (align === "right") return "text-right";
  return "text-left";
};

/** escape HTML entities สำหรับ dangerouslySetInnerHTML */
function escapeHtml(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** แปลง hex (#rrggbb) + opacity (0-255) เป็น #rrggbbaa */
function hexWithOpacity(hex, opacity) {
  if (!hex || typeof hex !== "string" || opacity == null || opacity >= 255) return hex;
  const alpha = Math.max(0, Math.min(255, Math.round(opacity))).toString(16).padStart(2, "0");
  return hex.length === 7 ? `${hex}${alpha}` : hex;
}

const TableElement = ({
  elementData: rawElementData,
  selected,
  hover,
  animationForElement,
  builderMode,
  onUpdate,
  theme,
}) => {
  const panelPreview = usePanelPreview("tbl", rawElementData?.id);
  const elementData = panelPreview
    ? { ...rawElementData, ...panelPreview }
    : rawElementData;
  const data = mergeTableElement(elementData);
  const {
    tableColumns,
    tableRows,
    tableHeaderBg,
    tableHeaderText,
    tableBodyText,
    tableRowBg,
    tableBorderColor,
    tableZebra,
    tableZebraBg,
    tableHeaderBold,
    tableFontSize,
    tableCellPaddingX,
    tableCellPaddingY,
    tableMarginTop,
    tableMarginBottom,
    tableHeaderBgOpacity,
    tableHeaderTextOpacity,
    tableBodyTextOpacity,
    tableRowBgOpacity,
    tableBorderColorOpacity,
    tableZebraBgOpacity,
    tableBorderStyle,
    tableOuterBorder,
  } = data;

  const resolvedHeaderBg     = hexWithOpacity(tableHeaderBg,     tableHeaderBgOpacity);
  const resolvedHeaderText   = hexWithOpacity(tableHeaderText,   tableHeaderTextOpacity);
  const resolvedBodyText     = hexWithOpacity(tableBodyText,     tableBodyTextOpacity);
  const resolvedRowBg        = hexWithOpacity(tableRowBg,        tableRowBgOpacity);
  const resolvedBorderColor  = hexWithOpacity(tableBorderColor,  tableBorderColorOpacity);
  const resolvedZebraBg      = hexWithOpacity(tableZebraBg,      tableZebraBgOpacity);
  const textFontFamily = setFont(theme?.text?.value) || undefined;

  const canInlineEdit = builderMode === "Editor Mode" && typeof onUpdate === "function";
  const useLayoutSelectionFrame = builderMode === "Layout Mode" && selected;
  const originalRef = useRef({});
  // Tracks the latest typed innerText per cell — updated on every input event.
  const draftRef = useRef({});
  // Ref (synchronous) for the currently-editing cell key.
  // Using a ref (not state) ensures any re-render — even ones triggered by
  // hover/parent state changes before React flushes a setState — always sees
  // the correct editingKey and uses draft text, never resetting the DOM.
  const editingKeyRef = useRef(null);

  const normalizeText = (raw) =>
    String(raw ?? "")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/\n+/g, " ");

  const handleFocus = (rowIndex, colIndex, currentText) => {
    const key = `${rowIndex}:${colIndex}`;
    originalRef.current[key] = currentText;
    draftRef.current[key] = currentText;
    editingKeyRef.current = key;
  };

  const handleInput = (e, rowIndex, colIndex) => {
    draftRef.current[`${rowIndex}:${colIndex}`] = e.currentTarget.innerText;
  };

  const handleBlur = (e, rowIndex, colIndex) => {
    if (!canInlineEdit) return;
    const key = `${rowIndex}:${colIndex}`;
    // Read from live DOM first. During IME/composition or fast pointer blur,
    // innerText can be newer than the last onInput-captured draft value.
    const raw = e.currentTarget.innerText ?? draftRef.current[key];
    delete draftRef.current[key];
    editingKeyRef.current = null;
    const nextText = normalizeText(raw);
    const original = originalRef.current[key] ?? "";
    if (nextText === original) return;
    const nextRows = tableRows.map((row, ri) => {
      if (ri !== rowIndex) return row;
      const next = [...row];
      next[colIndex] = nextText;
      return next;
    });
    onUpdate?.({ ...data, tableRows: nextRows });
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = String(e.clipboardData?.getData("text/plain") || "")
      .replace(/\r\n/g, " ")
      .replace(/\r/g, " ")
      .replace(/\n/g, " ");
    document.execCommand("insertText", false, pasted);
  };

  const handleKeyDown = (e, rowIndex, colIndex) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.currentTarget.blur();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      const key = `${rowIndex}:${colIndex}`;
      const original = originalRef.current[key] ?? "";
      // Restore original text in DOM and in draftRef so blur saves the original.
      draftRef.current[key] = original;
      e.currentTarget.innerText = original;
      e.currentTarget.blur();
    }
  };

  const handleMouseLeaveTable = () => {
    if (!canInlineEdit) return;
    const active = document.activeElement;
    if (active && active.isContentEditable) {
      active.blur();
    }
  };

  return (
    <div
      className={`w-full ${animationForElement || ""} ${
        !useLayoutSelectionFrame && selected
          ? "rounded-md border border-dashed border-red-400 bg-red-300/10 p-2"
          : ""
      }`}
      style={{ marginTop: tableMarginTop, marginBottom: tableMarginBottom }}
      onMouseEnter={() => hover?.({ id: data.id })}
      onMouseLeave={handleMouseLeaveTable}
    >
      <div className={useLayoutSelectionFrame ? "relative px-0 py-2" : ""}>
        <div
          className={
            useLayoutSelectionFrame
              ? "origin-center scale-[0.96] transform-gpu transition-transform duration-150"
              : ""
          }
        >
          <div
            className={`w-full overflow-x-auto rounded-md${tableOuterBorder ? " border" : ""}`}
            style={tableOuterBorder ? { borderColor: resolvedBorderColor, borderStyle: tableBorderStyle } : undefined}
          >
            <table
              className="border-separate border-spacing-0"
              style={{
                tableLayout: "fixed",
                width: "100%",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: resolvedHeaderBg }}>
                  {tableColumns.map((col) => (
                    <th
                      key={col.id}
                      className={`${alignClass(col.align)} border-b`}
                      style={{
                        color: resolvedHeaderText,
                        borderColor: resolvedBorderColor,
                        borderStyle: tableBorderStyle === "none" ? "none" : tableBorderStyle,
                        fontWeight: tableHeaderBold ? 700 : 500,
                        fontSize: `${tableFontSize}px`,
                        fontFamily: textFontFamily,
                        width: `${col.width}px`,
                        padding: `${tableCellPaddingY}px ${tableCellPaddingX}px`,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, rowIndex) => (
                  <tr
                    key={`row-${rowIndex}`}
                    style={{
                      backgroundColor:
                        tableZebra && rowIndex % 2 === 1 ? resolvedZebraBg : resolvedRowBg,
                    }}
                  >
                    {tableColumns.map((col, colIndex) => (
                      <td
                        key={`${col.id}-${rowIndex}`}
                        className={`${alignClass(col.align)} border-b`}
                        style={{
                          color: resolvedBodyText,
                          borderColor: resolvedBorderColor,
                          borderStyle: tableBorderStyle === "none" ? "none" : tableBorderStyle,
                          fontSize: `${tableFontSize}px`,
                          fontFamily: textFontFamily,
                          padding: `${tableCellPaddingY}px ${tableCellPaddingX}px`,
                          cursor: canInlineEdit ? "text" : "default",
                          outline: "none",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        contentEditable={canInlineEdit}
                        suppressContentEditableWarning
                        onFocus={() =>
                          handleFocus(rowIndex, colIndex, String(row[colIndex] ?? ""))
                        }
                        onInput={(e) => handleInput(e, rowIndex, colIndex)}
                        onBlur={(e) => handleBlur(e, rowIndex, colIndex)}
                        onPaste={handlePaste}
                        onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                        onMouseDown={(e) => {
                          if (canInlineEdit) e.stopPropagation();
                        }}
                        onClick={(e) => {
                          if (canInlineEdit) e.stopPropagation();
                        }}
                        onDoubleClick={(e) => {
                          if (canInlineEdit) e.stopPropagation();
                        }}
                        // Use dangerouslySetInnerHTML so React compares against
                        // the actual DOM innerHTML. While editing, we pass the
                        // current draft (= what the DOM already shows) so React
                        // never clobbers in-progress keystrokes on any re-render.
                        dangerouslySetInnerHTML={{
                          __html: (() => {
                            const cellKey = `${rowIndex}:${colIndex}`;
                            const isEditing = editingKeyRef.current === cellKey;
                            const text = isEditing
                              ? (draftRef.current[cellKey] ?? (row[colIndex] ?? ""))
                              : (row[colIndex] ?? "");
                            return escapeHtml(text);
                          })(),
                        }}
                      />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {useLayoutSelectionFrame && (
          <>
            <div className="pointer-events-none absolute left-[-2px] right-[-2px] top-[1px] bottom-[1px] rounded-md bg-red-300/10" />
            <span className="pointer-events-none absolute left-[-1px] top-[2px] h-2.5 w-2.5 border-l-2 border-t-2 border-red-400" />
            <span className="pointer-events-none absolute right-[-1px] top-[2px] h-2.5 w-2.5 border-r-2 border-t-2 border-red-400" />
            <span className="pointer-events-none absolute bottom-[2px] left-[-1px] h-2.5 w-2.5 border-b-2 border-l-2 border-red-400" />
            <span className="pointer-events-none absolute bottom-[2px] right-[-1px] h-2.5 w-2.5 border-b-2 border-r-2 border-red-400" />
          </>
        )}
      </div>
    </div>
  );
};

export default memo(TableElement);
