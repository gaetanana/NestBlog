// src/theme/theme.ts
import { defaultTheme } from "react-admin";
import { alpha } from "@mui/material/styles";

export const lightTheme = {
  ...defaultTheme,
  palette: {
    primary: {
      main: "#2196f3", // Blue
      light: "#64b5f6",
      dark: "#1976d2",
      contrastText: "#fff",
    },
    secondary: {
      main: "#ff9800", // Orange
      light: "#ffb74d",
      dark: "#f57c00",
      contrastText: "#fff",
    },
    background: {
      default: "#f5f5f5",
      paper: "#fff",
    },
    success: {
      main: "#4caf50",
      light: "#81c784",
      dark: "#388e3c",
      contrastText: "#fff",
    },
    error: {
      main: "#f44336",
      light: "#e57373",
      dark: "#d32f2f",
      contrastText: "#fff",
    },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
      fontSize: "2rem",
    },
    h2: {
      fontWeight: 500,
      fontSize: "1.5rem",
    },
    h3: {
      fontWeight: 500,
      fontSize: "1.25rem",
    },
    h4: {
      fontWeight: 500,
      fontSize: "1.125rem",
    },
    h5: {
      fontWeight: 500,
      fontSize: "1rem",
    },
    h6: {
      fontWeight: 500,
      fontSize: "0.875rem",
    },
    button: {
      textTransform: "none",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        elevation1: {
          boxShadow:
            "0px 2px 1px -1px rgba(0,0,0,0.05), 0px 1px 1px 0px rgba(0,0,0,0.03), 0px 1px 3px 0px rgba(0,0,0,0.05)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow:
            "0px 2px 1px -1px rgba(0,0,0,0.05), 0px 1px 1px 0px rgba(0,0,0,0.03), 0px 1px 3px 0px rgba(0,0,0,0.05)",
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: "16px 24px",
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: "24px",
          "&:last-child": {
            paddingBottom: "24px",
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: "16px 24px",
          borderBottom: "1px solid",
          borderColor: alpha("#000", 0.06),
        },
        head: {
          fontWeight: 600,
          color: alpha("#000", 0.87),
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow:
            "0px 1px 3px 0px rgba(0,0,0,0.04), 0px 1px 2px 0px rgba(0,0,0,0.04)",
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 8,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    RaDatagrid: {
      styleOverrides: {
        root: {
          "& .column-undefined": {
            display: "none",
          },
        },
      },
    },
    RaSidebar: {
      styleOverrides: {
        root: {
          height: "100%",
          borderRight: "1px solid",
          borderColor: alpha("#000", 0.08),
        },
      },
    },
  },
};

// You can create a dark theme version if needed
export const darkTheme = {
  ...defaultTheme,
  palette: {
    mode: "dark",
    primary: {
      main: "#90caf9",
      light: "#e3f2fd",
      dark: "#42a5f5",
      contrastText: "#fff",
    },
    secondary: {
      main: "#ffb74d",
      light: "#ffd95b",
      dark: "#f57c00",
      contrastText: "#fff",
    },
    background: {
      default: "#121212",
      paper: "#1e1e1e",
    },
    success: {
      main: "#81c784",
      light: "#c8e6c9",
      dark: "#4caf50",
      contrastText: "#fff",
    },
    error: {
      main: "#e57373",
      light: "#ffcdd2",
      dark: "#f44336",
      contrastText: "#fff",
    },
  },
};
