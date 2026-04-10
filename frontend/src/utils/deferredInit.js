/**
 * Run initialization tasks after page is interactive
 * Doesn't block LCP (Largest Contentful Paint) or FCP (First Contentful Paint)
 */

/**
 * Initialize analytics after page loads
 * Replace with your actual analytics setup
 */
const initializeAnalytics = () => {
  // Load Google Analytics, Mixpanel, or other analytics tools
  // This doesn't block rendering anymore
  if (window.gtag) {
    // Example: window.gtag('config', 'GA_ID');
    // Add your analytics initialization here
  }
}

/**
 * Prefetch resources for likely-next pages
 */
const prefetchResources = () => {
  // Example: Prefetch overview page since users often navigate there after login
  const link = document.createElement("link")
  link.rel = "prefetch"
  link.href = "/overview"
  document.head.appendChild(link)
}

/**
 * Load optional features that aren't needed for initial render
 */
const loadOptionalFeatures = async () => {
  // Load service workers, premium features, integrations, etc.
  // that aren't needed for initial render
  // Example: Register service worker for PWA
  // if ('serviceWorker' in navigator) {
  //   await navigator.serviceWorker.register('/sw.js');
  // }
}

/**
 * Main deferred initialization function
 * Uses requestIdleCallback when available, falls back to setTimeout
 */
export const deferInitialization = async () => {
  const runInitTasks = () => {
    initializeAnalytics()
    prefetchResources()
    loadOptionalFeatures()
  }

  // Use requestIdleCallback if available (modern browsers)
  if ("requestIdleCallback" in window) {
    requestIdleCallback(runInitTasks)
  } else {
    // Fallback for older browsers: defer with setTimeout
    setTimeout(runInitTasks, 2000)
  }
}
