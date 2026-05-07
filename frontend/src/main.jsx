import { createRoot } from "react-dom/client"
import { Analytics } from "@vercel/analytics/react"
import App from "./App.jsx"
import ErrorBoundary from "./components/ErrorBoundary.jsx"
import "./index.css"
import { AppThemeProvider } from "./theme/ThemeContext.jsx"

createRoot(document.getElementById("root")).render(
  <AppThemeProvider>
    <ErrorBoundary>
      <App />
      <Analytics />
    </ErrorBoundary>
  </AppThemeProvider>
)
