import React, { useState } from "react";
import { createRoot } from "react-dom/client"; // ✅ استيراد createRoot مباشرة
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { CssBaseline, ThemeProvider } from "@mui/material";
import theme from "./theme";
import "./index.css"; // ✅ ملف إصلاح السكروول

function Root() {
  const [mode, setMode] = useState("light");

  return (
    <BrowserRouter>
      <ThemeProvider theme={theme(mode)}>
        <CssBaseline />
        <App mode={mode} setMode={setMode} />
      </ThemeProvider>
    </BrowserRouter>
  );
}

// ✅ استخدام createRoot مباشرة بدل ReactDOM.createRoot
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
