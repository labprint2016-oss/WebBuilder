import { getHeadingDividerSpec } from "./headingDividerStyles";

function FullWidthGrowLine({ lineStroke, wrapperStyle }) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        alignItems: "center",
        alignSelf: "stretch",
        ...wrapperStyle,
      }}
      role="presentation"
      aria-hidden
    >
      <div style={lineStroke} />
    </div>
  );
}

/**
 * ข้อความหัวข้อ + เส้นคั่น (ความกว้างเส้น / จัดวางสอดคล้องกับชิดซ้าย-กลาง-ขวา)
 */
export default function HeadingDividerTextBlock({
  theme,
  elementData,
  colorStyle,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  label,
}) {
  const spec = getHeadingDividerSpec(theme, elementData);
  const typo = {
    ...colorStyle,
    fontSize,
    fontWeight,
    lineHeight,
    letterSpacing: `${letterSpacing}px`,
  };

  if (spec.variant === "none") {
    return <div style={typo}>{label}</div>;
  }

  if (spec.variant === "bottom") {
    return (
      <div style={spec.bottomOuterStyle}>
        <div style={spec.bottomInnerWrapStyle}>
          <div style={{ ...typo, ...spec.textBlockStyle }}>{label}</div>
          <div style={spec.underlineTrackStyle}>
            <div style={spec.lineStroke} />
          </div>
        </div>
      </div>
    );
  }

  if (spec.variant === "sides-grid") {
    return (
      <div style={spec.gridStyle}>
        <div style={spec.leftCellOuter}>
          <div style={spec.barInnerStyle}>
            <div style={spec.lineStroke} />
          </div>
        </div>
        <span
          style={{
            ...typo,
            ...spec.midSpanStyle,
            textAlign: spec.textAlign,
          }}
        >
          {label}
        </span>
        <div style={spec.rightCellOuter}>
          <div style={spec.barInnerStyle}>
            <div style={spec.lineStroke} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={spec.rowStyle}>
      {spec.showBefore ? (
        <FullWidthGrowLine
          lineStroke={spec.lineStroke}
          wrapperStyle={spec.lineWrapperStyle}
        />
      ) : null}
      <span
        style={{
          ...typo,
          flexShrink: 0,
          minWidth: 0,
          textAlign: spec.textAlign,
        }}
      >
        {label}
      </span>
      {spec.showAfter ? (
        <FullWidthGrowLine
          lineStroke={spec.lineStroke}
          wrapperStyle={spec.lineWrapperStyle}
        />
      ) : null}
    </div>
  );
}
