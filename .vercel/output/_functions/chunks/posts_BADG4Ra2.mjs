import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { n as fetchLatestPosts } from "./patreon_Hbi_VkYZ.mjs";
//#region src/pages/api/patreon/posts.ts
var posts_exports = /* @__PURE__ */ __exportAll({ GET: () => GET });
var cachedPosts = null;
var cacheExpiresAt = 0;
var CACHE_TTL_MS = 36e5;
var GET = async () => {
	const now = Date.now();
	if (cachedPosts && now < cacheExpiresAt) return new Response(JSON.stringify(cachedPosts), {
		status: 200,
		headers: {
			"Content-Type": "application/json",
			"Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600"
		}
	});
	try {
		const posts = await fetchLatestPosts();
		if (posts && posts.length > 0) {
			cachedPosts = posts;
			cacheExpiresAt = now + CACHE_TTL_MS;
			return new Response(JSON.stringify(posts), {
				status: 200,
				headers: {
					"Content-Type": "application/json",
					"Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600"
				}
			});
		}
		return new Response(JSON.stringify(cachedPosts || []), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		console.error("Error in patreon/posts API route:", err);
		return new Response(JSON.stringify(cachedPosts || []), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/patreon/posts@_@ts
var page = () => posts_exports;
//#endregion
export { page };
