import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import "./index.css";
import { AppThemeProvider } from "./theme/ThemeContext.jsx";

createRoot(document.getElementById("root")).render(
  <AppThemeProvider>
    <ErrorBoundary>
      <App />
      <Toaster position="bottom-right" />
    </ErrorBoundary>
  </AppThemeProvider>
);
