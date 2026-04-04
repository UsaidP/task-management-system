import { createRoot } from "react-dom/client"
import { Toaster } from "react-hot-toast"
import App from "./App.jsx"
import ErrorBoundary from "./components/ErrorBoundary.jsx"
import "./index.css"
import { AppThemeProvider } from "./theme/ThemeContext.jsx"

// Register service worker for offline support
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("SW registered: ", registration)
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError)
      })
  })
}

createRoot(document.getElementById("root")).render(
  <AppThemeProvider>
    <ErrorBoundary>
      <App />
      <Toaster position="bottom-right" />
    </ErrorBoundary>
  </AppThemeProvider>
)
