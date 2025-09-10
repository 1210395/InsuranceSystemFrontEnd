import { createTheme } from "@mui/material/styles";

const lightPalette = {
  mode: "light",
  primary: {
    main: "#006400", // ✅ Primary Green
  },
  secondary: {
    main: "#C9A646", // ✅ Accent Gold
  },
  background: {
    default: "#F5F7FA", // ✅ Light Background
    paper: "#FFFFFF",
  },
  text: {
    primary: "#2E2E2E", // ✅ Dark text
    secondary: "#555555",
  },
  error: {
    main: "#E53935", // ✅ Danger Red
  },
};

const darkPalette = {
  mode: "dark",
  primary: {
    main: "#006400",
  },
  secondary: {
    main: "#C9A646",
  },
  background: {
    default: "#0F172A", // ✅ Dark Background
    paper: "#1E293B",
  },
  text: {
    primary: "#FFFFFF", // ✅ Light text
    secondary: "#CCCCCC",
  },
  error: {
    main: "#E53935",
  },
};

// ✅ Factory
const theme = (mode = "light") =>
  createTheme({
    palette: mode === "light" ? lightPalette : darkPalette,
    custom: {
      gradientLight: "linear-gradient(135deg, #A78BFA 0%, #60A5FA 100%)",
      gradientDark: "linear-gradient(135deg, #3730A3 0%, #1E3A8A 100%)",
    },
    typography: {
      fontFamily: "Roboto, Arial, sans-serif",
      h1: { fontWeight: 600, fontSize: "2rem" },
      h2: { fontWeight: 500, fontSize: "1.75rem" },
      h3: { fontWeight: 500, fontSize: "1.5rem" },
      body1: { fontSize: "1rem" },
      body2: { fontSize: "0.875rem" },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: "10px",
            textTransform: "none",
            padding: "10px 20px",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: "16px",
          },
        },
      },
    },
  });

export default theme;
