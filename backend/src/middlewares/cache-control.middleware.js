/**
 * Cache-Control middleware for GET requests.
 * Sets appropriate cache headers based on the endpoint type.
 */
export const cacheControl = (maxAge = 60) => {
	return (req, res, next) => {
		// Only cache GET requests
		if (req.method === "GET") {
			// private: only the browser can cache; no-store: don't cache on shared proxies
			res.setHeader("Cache-Control", `private, max-age=${maxAge}, stale-while-revalidate=300`)
		} else {
			// Never cache mutations
			res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
			res.setHeader("Pragma", "no-cache")
			res.setHeader("Expires", "0")
		}
		next()
	}
}
