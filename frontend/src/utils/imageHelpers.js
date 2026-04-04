/**
 * Transforms ImageKit URLs to include resize parameters for optimized delivery.
 * This reduces bandwidth and improves load times by serving appropriately sized images.
 *
 * @param {string} url - The original ImageKit URL
 * @param {number} size - Target width/height in pixels (default: 100)
 * @returns {string} - Transformed URL with resize parameters
 *
 * @example
 * // Returns: https://ik.imagekit.io/ptms/tr:w-100,h-100/avatars/photo.jpg
 * getOptimizedAvatarUrl("https://ik.imagekit.io/ptms/avatars/photo.jpg", 100)
 */
export const getOptimizedAvatarUrl = (url, size = 100) => {
  if (!url) return null
  if (!url.includes("ik.imagekit.io")) return url

  // Insert transformation parameters before the file path
  return url.replace(/(ik\.imagekit\.io\/[^/]+)\//, `$1/tr:w-${size},h-${size},c-at_max/`)
}
