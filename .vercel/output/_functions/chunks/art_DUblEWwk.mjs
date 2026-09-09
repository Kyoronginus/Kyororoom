import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
//#region src/pages/api/art.ts
var art_exports = /* @__PURE__ */ __exportAll({ GET: () => GET });
var API_URL = "https://us-central1-oekakusa.cloudfunctions.net/api/users/NC9InoxB7HdZY6zSiKkNjaOc5Lc2/commits/latest";
var cachedData = null;
var cacheExpiresAt = 0;
var CACHE_TTL_MS = 9e5;
var GET = async () => {
	const now = Date.now();
	if (cachedData && now < cacheExpiresAt) return new Response(JSON.stringify(cachedData), {
		status: 200,
		headers: {
			"Content-Type": "application/json",
			"Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800"
		}
	});
	try {
		const res = await fetch(API_URL);
		if (!res.ok) {
			if (cachedData) return new Response(JSON.stringify(cachedData), {
				status: 200,
				headers: { "Content-Type": "application/json" }
			});
			return new Response(JSON.stringify({ error: "Failed to fetch art commit" }), {
				status: res.status,
				headers: { "Content-Type": "application/json" }
			});
		}
		const data = await res.json();
		cachedData = data;
		cacheExpiresAt = now + CACHE_TTL_MS;
		return new Response(JSON.stringify(data), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
				"Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800"
			}
		});
	} catch (err) {
		console.error("Art API Error:", err);
		if (cachedData) return new Response(JSON.stringify(cachedData), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
		return new Response(JSON.stringify({ error: "Internal Server Error" }), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/art@_@ts
var page = () => art_exports;
//#endregion
export { page };
