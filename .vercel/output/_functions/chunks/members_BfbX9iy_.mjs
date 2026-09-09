import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { t as fetchActiveMembers } from "./patreon_D8nHdwTC.mjs";
//#region src/pages/api/patreon/members.ts
var members_exports = /* @__PURE__ */ __exportAll({ GET: () => GET });
var cachedMembers = null;
var cacheExpiresAt = 0;
var CACHE_TTL_MS = 216e5;
var GET = async () => {
	const now = Date.now();
	if (cachedMembers && now < cacheExpiresAt) return new Response(JSON.stringify({ members: cachedMembers }), {
		status: 200,
		headers: {
			"Content-Type": "application/json",
			"Cache-Control": "public, s-maxage=21600, stale-while-revalidate=43200"
		}
	});
	try {
		const members = await fetchActiveMembers();
		if (members.length > 0) {
			cachedMembers = members;
			cacheExpiresAt = now + CACHE_TTL_MS;
		}
		return new Response(JSON.stringify({ members: cachedMembers || [] }), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
				"Cache-Control": "public, s-maxage=21600, stale-while-revalidate=43200"
			}
		});
	} catch (err) {
		console.error("Error in patreon members route:", err);
		return new Response(JSON.stringify({ members: cachedMembers || [] }), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/patreon/members@_@ts
var page = () => members_exports;
//#endregion
export { page };
