import { createTheme } from "@mui/material/styles";

// Olive Green Health Insurance Theme
const oliveColors = {
  // Primary Olive Green
  primary: {
    main: "#556B2F",
    light: "#7B8B5E",
    dark: "#3D4F23",
    contrastText: "#FFFFFF",
  },
  // Secondary Sage Green
  secondary: {
    main: "#8B9A46",
    light: "#A8B56B",
    dark: "#6B7A32",
    contrastText: "#FFFFFF",
  },
  // Accent Colors
  accent: {
    gold: "#C9A646",
    goldLight: "#DDB85C",
    cream: "#F5F5DC",
    ivory: "#FFFFF0",
    warmWhite: "#FAF8F5",
  },
  // Text Colors - Olive-complementary colors (no gray)
  text: {
    primary: "#1a1a1a",      // Near black for maximum readability
    secondary: "#3d4f3d",    // Dark olive-green for secondary text
    disabled: "#6B7B6B",     // Muted olive-green instead of gray
    hint: "#4A5D4A",         // Olive hint text
    inverse: "#FFFFFF",
  },
};

const lightPalette = {
  mode: "light",
  primary: oliveColors.primary,
  secondary: oliveColors.secondary,
  background: {
    default: "#FAF8F5",
    paper: "#FFFFFF",
    elevated: "#F5F5DC",
  },
  text: {
    primary: oliveColors.text.primary,
    secondary: oliveColors.text.secondary,
    disabled: oliveColors.text.disabled,
    hint: oliveColors.text.hint,
  },
  error: {
    main: "#E53935",
    light: "#FF6659",
    dark: "#C62828",
  },
  warning: {
    main: "#FF9800",
    light: "#FFB74D",
    dark: "#F57C00",
  },
  success: {
    main: "#4CAF50",
    light: "#81C784",
    dark: "#388E3C",
  },
  info: {
    main: "#2196F3",
    light: "#64B5F6",
    dark: "#1976D2",
  },
};

const darkPalette = {
  mode: "dark",
  primary: {
    main: "#7B8B5E",
    light: "#A8B56B",
    dark: "#556B2F",
    contrastText: "#FFFFFF",
  },
  secondary: {
    main: "#A8B56B",
    light: "#C9D49A",
    dark: "#8B9A46",
    contrastText: "#000000",
  },
  background: {
    default: "#1A2418",
    paper: "#2E3B2D",
    elevated: "#3D4F3C",
  },
  text: {
    primary: "#FFFFFF",
    secondary: "#D4E0CC",     // Lighter olive-tinted for dark mode
    disabled: "#A8B8A0",      // Muted olive for dark mode disabled
    hint: "#B8C8B0",          // Olive hint for dark mode
  },
  error: {
    main: "#FF6659",
    light: "#FF8A80",
    dark: "#E53935",
  },
  warning: {
    main: "#FFB74D",
    light: "#FFD180",
    dark: "#FF9800",
  },
  success: {
    main: "#81C784",
    light: "#A5D6A7",
    dark: "#4CAF50",
  },
  info: {
    main: "#64B5F6",
    light: "#90CAF9",
    dark: "#2196F3",
  },
};

// Theme Factory
const theme = (mode = "light") =>
  createTheme({
    palette: mode === "light" ? lightPalette : darkPalette,
    // Custom Design Tokens
    custom: {
      // Gradient Definitions
      gradients: {
        // Sidebar gradient
        sidebar: "linear-gradient(180deg, #556B2F 0%, #3D4F23 100%)",
        sidebarAlt: "linear-gradient(180deg, #6B7B4F 0%, #4A5A2F 100%)",
        // Header/Filter gradient
        header: "linear-gradient(90deg, #556B2F 0%, #7B8B5E 100%)",
        // Button gradients
        primary: "linear-gradient(90deg, #556B2F 0%, #7B8B5E 100%)",
        primaryHover: "linear-gradient(90deg, #3D4F23 0%, #556B2F 100%)",
        secondary: "linear-gradient(90deg, #8B9A46 0%, #A8B56B 100%)",
        // Auth card gradient
        authCard: "linear-gradient(145deg, #FFFFFF 0%, #E8EDE0 100%)",
        // Stat card gradients
        statPrimary: "linear-gradient(135deg, #556B2F 0%, #7B8B5E 100%)",
        statSecondary: "linear-gradient(135deg, #8B9A46 0%, #A8B56B 100%)",
        statAccent: "linear-gradient(135deg, #6B7A32 0%, #8B9A46 100%)",
        statGold: "linear-gradient(135deg, #C9A646 0%, #DDB85C 100%)",
        // Welcome card gradient
        welcome: "linear-gradient(135deg, #556B2F 0%, #7B8B5E 50%, #8B9A46 100%)",
        // Hero section
        hero: "linear-gradient(135deg, #3D4F23 0%, #556B2F 50%, #7B8B5E 100%)",
      },
      // Olive color tokens for direct access
      olive: oliveColors,
      // Box shadows
      shadows: {
        card: "0 4px 12px rgba(46, 59, 45, 0.08)",
        cardHover: "0 8px 24px rgba(85, 107, 47, 0.15)",
        elevated: "0 8px 24px rgba(46, 59, 45, 0.12)",
        button: "0 4px 12px rgba(85, 107, 47, 0.2)",
      },
    },
    typography: {
      fontFamily: "'Inter', 'Roboto', 'Arial', sans-serif",
      h1: {
        fontWeight: 700,
        fontSize: "2.5rem",
        color: oliveColors.text.primary,
        letterSpacing: "-0.02em",
      },
      h2: {
        fontWeight: 600,
        fontSize: "2rem",
        color: oliveColors.text.primary,
        letterSpacing: "-0.01em",
      },
      h3: {
        fontWeight: 600,
        fontSize: "1.5rem",
        color: oliveColors.text.primary,
      },
      h4: {
        fontWeight: 500,
        fontSize: "1.25rem",
        color: oliveColors.text.primary,
      },
      h5: {
        fontWeight: 500,
        fontSize: "1.1rem",
        color: oliveColors.text.primary,
      },
      h6: {
        fontWeight: 500,
        fontSize: "1rem",
        color: oliveColors.text.primary,
      },
      body1: {
        fontSize: "1rem",
        lineHeight: 1.6,
      },
      body2: {
        fontSize: "0.875rem",
        lineHeight: 1.5,
      },
      caption: {
        fontSize: "0.75rem",
      },
      button: {
        fontWeight: 600,
        textTransform: "none",
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: "10px",
            textTransform: "none",
            padding: "10px 24px",
            fontWeight: 600,
            boxShadow: "none",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              boxShadow: "0 4px 12px rgba(85, 107, 47, 0.2)",
              transform: "translateY(-1px)",
            },
          },
          contained: {
            background: "linear-gradient(90deg, #556B2F 0%, #7B8B5E 100%)",
            "&:hover": {
              background: "linear-gradient(90deg, #3D4F23 0%, #556B2F 100%)",
            },
          },
          outlined: {
            borderColor: "#556B2F",
            color: "#556B2F",
            borderWidth: "2px",
            "&:hover": {
              borderWidth: "2px",
              borderColor: "#3D4F23",
              backgroundColor: "rgba(85, 107, 47, 0.08)",
            },
          },
          text: {
            color: "#556B2F",
            "&:hover": {
              backgroundColor: "rgba(85, 107, 47, 0.08)",
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: "16px",
            boxShadow: "0 4px 12px rgba(46, 59, 45, 0.08)",
          },
          elevation1: {
            boxShadow: "0 2px 8px rgba(46, 59, 45, 0.06)",
          },
          elevation2: {
            boxShadow: "0 4px 12px rgba(46, 59, 45, 0.08)",
          },
          elevation3: {
            boxShadow: "0 8px 24px rgba(46, 59, 45, 0.12)",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: "16px",
            border: "1px solid #E8EDE0",
            boxShadow: "0 4px 12px rgba(46, 59, 45, 0.08)",
            transition: "all 0.3s ease",
            "&:hover": {
              borderColor: "#556B2F",
              boxShadow: "0 8px 24px rgba(85, 107, 47, 0.15)",
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
              "& fieldset": {
                borderColor: "#C8D4C0",
                borderWidth: "1.5px",
              },
              "&:hover fieldset": {
                borderColor: "#7B8B5E",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#556B2F",
                borderWidth: "2px",
              },
            },
            "& .MuiInputAdornment-root .MuiSvgIcon-root": {
              color: "#7B8B5E",
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: "8px",
            fontWeight: 500,
          },
          filled: {
            backgroundColor: "#E8EDE0",
            color: "#556B2F",
            "&:hover": {
              backgroundColor: "#D4DEC8",
            },
          },
          outlined: {
            borderColor: "#7B8B5E",
            color: "#556B2F",
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            backgroundColor: "#556B2F",
            color: "#FFFFFF",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: "#FFFFFF",
            color: "#2E3B2D",
            boxShadow: "0 2px 8px rgba(46, 59, 45, 0.06)",
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            background: "linear-gradient(180deg, #556B2F 0%, #3D4F23 100%)",
            color: "#FFFFFF",
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: "10px",
            margin: "4px 8px",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            },
            "&.Mui-selected": {
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.2)",
              },
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: "16px",
            boxShadow: "0 24px 48px rgba(46, 59, 45, 0.2)",
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            backgroundColor: "#F5F5DC",
            color: "#556B2F",
            fontWeight: 600,
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            backgroundColor: "#556B2F",
            height: "3px",
            borderRadius: "3px 3px 0 0",
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 500,
            color: "#3d4f3d",        // Dark olive-green for unselected tabs
            "&.Mui-selected": {
              color: "#556B2F",
              fontWeight: 600,
            },
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          standardSuccess: {
            backgroundColor: "#E8F5E9",
            color: "#2E7D32",
          },
          standardError: {
            backgroundColor: "#FFEBEE",
            color: "#C62828",
          },
          standardWarning: {
            backgroundColor: "#FFF3E0",
            color: "#E65100",
          },
          standardInfo: {
            backgroundColor: "#E3F2FD",
            color: "#1565C0",
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: "#2E3B2D",
            color: "#FFFFFF",
            fontSize: "0.75rem",
            borderRadius: "8px",
          },
        },
      },
      MuiFab: {
        styleOverrides: {
          primary: {
            background: "linear-gradient(135deg, #556B2F 0%, #7B8B5E 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #3D4F23 0%, #556B2F 100%)",
            },
          },
        },
      },
    },
  });

export default theme;
