/** สีปุ่ม ButtonGroup ใน Panel — ตั้งค่าได้ที่ Settings > Panel */
export const PANEL_BTN_GROUP = {
  active: "var(--dash-panel-btn-group-active, #333333)",
  activeText: "var(--dash-panel-btn-group-active-text, #ffffff)",
  inactive: "var(--dash-panel-btn-group-inactive, #ffffff)",
  inactiveText: "var(--dash-panel-btn-group-inactive-text, #1e293b)",
  inactiveHover: "var(--dash-panel-btn-group-inactive, #f8fafc)",
  border: "var(--dash-panel-btn-group-border, var(--dash-panel-input-border, #e2e8f0))",
};

/** ใช้กับ sx ของ ButtonGroup root — ให้กรอบตาม Settings */
export const panelGroupRootBorderSx = {
  "& .MuiButtonGroup-grouped.MuiButton-outlined": {
    borderColor: `${PANEL_BTN_GROUP.border} !important`,
  },
  "& .MuiButtonGroup-grouped.MuiButton-outlined:not(:last-of-type)": {
    borderColor: `${PANEL_BTN_GROUP.border} !important`,
  },
  ".dark & .MuiButtonGroup-grouped.MuiButton-outlined": {
    borderColor: `${PANEL_BTN_GROUP.border} !important`,
  },
  ".dark & .MuiButtonGroup-grouped.MuiButton-outlined:not(:last-of-type)": {
    borderColor: `${PANEL_BTN_GROUP.border} !important`,
  },
};

export const panelGroupButtonSx = (selected, _accentIgnored) => ({
  flex: 1,
  fontSize: 11,
  height: 34,
  minHeight: 34,
  maxHeight: 34,
  py: 0,
  px: 0.5,
  textTransform: "none",
  lineHeight: 1.25,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  boxShadow: "none",
  borderWidth: 1,
  borderStyle: "solid",
  ...(selected
    ? {
        backgroundColor: PANEL_BTN_GROUP.active,
        color: PANEL_BTN_GROUP.activeText,
        borderColor: `${PANEL_BTN_GROUP.border} !important`,
        "&:hover": {
          backgroundColor: PANEL_BTN_GROUP.active,
          borderColor: `${PANEL_BTN_GROUP.border} !important`,
          boxShadow: "none",
        },
      }
    : {
        color: PANEL_BTN_GROUP.inactiveText,
        borderColor: `${PANEL_BTN_GROUP.border} !important`,
        backgroundColor: PANEL_BTN_GROUP.inactive,
        "&:hover": {
          borderColor: `${PANEL_BTN_GROUP.border} !important`,
          backgroundColor: PANEL_BTN_GROUP.inactiveHover,
          boxShadow: "none",
        },
        ".dark &": {
          color: PANEL_BTN_GROUP.inactiveText,
          borderColor: `${PANEL_BTN_GROUP.border} !important`,
          backgroundColor: PANEL_BTN_GROUP.inactive,
          "&:hover": {
            borderColor: `${PANEL_BTN_GROUP.border} !important`,
            backgroundColor: PANEL_BTN_GROUP.inactive,
            boxShadow: "none",
          },
        },
      }),
});
