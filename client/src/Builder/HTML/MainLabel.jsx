import { Stack, Typography, Switch } from "@mui/material";
import { styled } from "@mui/material/styles";

/** Switch แบบ Section «เส้นคั่นคอลัมน์» — Offcanvas/container.jsx AntSwitch */
const PanelAntSwitch = styled(Switch, {
  shouldForwardProp: (prop) => prop !== "accentColor",
})(({ theme, accentColor = "#0d9488" }) => ({
  width: 28,
  height: 16,
  padding: 0,
  display: "flex",
  "&:active": {
    "& .MuiSwitch-thumb": {
      width: 15,
    },
    "& .MuiSwitch-switchBase.Mui-checked": {
      transform: "translateX(9px)",
    },
  },
  "& .MuiSwitch-switchBase": {
    padding: 2,
    "&.Mui-checked": {
      transform: "translateX(12px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        opacity: 1,
        backgroundColor: accentColor,
      },
    },
  },
  "& .MuiSwitch-thumb": {
    boxShadow: "0 2px 4px 0 rgb(0 35 11 / 20%)",
    width: 12,
    height: 12,
    borderRadius: 6,
    transition: theme.transitions.create(["width"], {
      duration: 200,
    }),
  },
  "& .MuiSwitch-track": {
    borderRadius: 8,
    opacity: 1,
    backgroundColor: "rgba(0,0,0,.25)",
    boxSizing: "border-box",
    ".dark &": { backgroundColor: "rgba(255,255,255,.25)" },
  },
}));

const MainLabel = ({
  label,
  value = NaN,
  mb = 0.75,
  handleSwitch = null,
  checked = "-",
  color = null,
  typography = null,
  noLine = false,
  fontWeight = 600,
  valueRef = null,
}) => {
  const accent = color || "#0d9488";
  return (
    <Typography
      component="div"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        flex: 1,
        fontSize: 13,
        fontWeight,
        color: "var(--dash-panel-heading, #0f172a)",
        mb,
        fontVariantNumeric: "tabular-nums",
        ".dark &": { color: "var(--dash-panel-heading, #f8fafc)" },
      }}
    >
      {label}{" "}
      {!isNaN(value) && (
        <span ref={valueRef} className="text-slate-400 dark:text-slate-400">
          {Math.round(value)}
        </span>
      )}
      {!noLine && (
        <div className="dash-heading-rule min-w-0 flex-1 border-b" />
      )}

      {checked !== "-" && (
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <PanelAntSwitch
            accentColor={accent}
            checked={Boolean(checked)}
            onChange={handleSwitch}
            inputProps={{
              "aria-label": typography || label,
            }}
          />
          {typography ? (
            <Typography sx={{ fontSize: 12 }}>{typography}</Typography>
          ) : null}
        </Stack>
      )}
    </Typography>
  );
};

export default MainLabel;
