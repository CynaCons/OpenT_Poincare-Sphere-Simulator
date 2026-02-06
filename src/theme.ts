import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#3794ff" },
    secondary: { main: "#b76e79" },
    background: {
      default: "#1e1e1e",
      paper: "#252526",
    },
    text: {
      primary: "#e7e7e7",
      secondary: "#a0a0a0",
    },
    divider: "#333333",
    action: {
      hover: "rgba(255, 255, 255, 0.08)",
      selected: "rgba(255, 255, 255, 0.12)",
    },
  },
  typography: {
    fontFamily: '"JetBrains Mono", "Segoe UI", "Inter", monospace',
    fontSize: 12,
    button: { textTransform: "none", fontWeight: 600, fontSize: 12 },
    h6: { fontSize: "1rem", fontWeight: 600, letterSpacing: 0.5 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 4 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: "#202020",
          border: "1px solid #454545",
          fontSize: 11,
          fontFamily: '"JetBrains Mono", monospace',
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: { height: 4 },
        thumb: { width: 14, height: 14 },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: { fontSize: 12 },
      },
    },
  },
});

export default theme;
