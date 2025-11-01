import { useState, useEffect } from 'react';

/**
 * A custom hook to check for a CSS media query.
 * @param {string} query The media query string (e.g., "(min-width: 1024px)")
 * @returns {boolean} Whether the query matches
 */
export const useMediaQuery = (query) => {
  // Initialize state with a function to run only on the client
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false; // Default for SSR
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQueryList = window.matchMedia(query);
    const listener = (event) => setMatches(event.matches);

    // Update state on mount just in case
    setMatches(mediaQueryList.matches);

    // Listen for changes
    mediaQueryList.addEventListener('change', listener);
    return () => mediaQueryList.removeEventListener('change', listener);
  }, [query]);

  return matches;
};