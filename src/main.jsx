
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import App from "./App";
import { CssBaseline, ThemeProvider } from "@mui/material";
import theme from "./theme";
import { queryClient } from "./config/queryClient";
import ErrorBoundary from "./components/ErrorBoundary";
import { LanguageProvider } from "./context/LanguageContext";
import "./index.css";
 
function Root() {
  const [mode, setMode] = useState("light");

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <BrowserRouter>
            <ThemeProvider theme={theme(mode)}>
              <CssBaseline />
              <App mode={mode} setMode={setMode} />
            </ThemeProvider>
          </BrowserRouter>
        </LanguageProvider>
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

// ✅ استخدام createRoot مباشرة بدل ReactDOM.createRoot
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
