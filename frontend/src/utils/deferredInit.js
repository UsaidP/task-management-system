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
 * Unregister any existing service workers from previous deployments
 * This prevents cached asset references from breaking after new deploys
 */
const unregisterServiceWorkers = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations()
      for (const registration of registrations) {
        await registration.unregister()
        console.log('[TaskFlow] Service worker unregistered successfully')
      }
    } catch (error) {
      console.warn('[TaskFlow] Failed to unregister service worker:', error)
    }
  }
}

/**
 * Load optional features that aren't needed for initial render
 */
const loadOptionalFeatures = async () => {
  // Unregister old service workers to prevent caching issues
  await unregisterServiceWorkers()
  
  // Load premium features, integrations, etc.
  // that aren't needed for initial render
  // Note: Service workers are currently disabled to avoid asset caching issues
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
