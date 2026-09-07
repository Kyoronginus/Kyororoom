import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { kv } from "@vercel/kv";
//#region src/pages/api/views.ts
var views_exports = /* @__PURE__ */ __exportAll({ GET: () => GET });
var GET = async () => {
	try {
		if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) return new Response(JSON.stringify({ views: 42069 }), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
		const views = await kv.incr("visitor_count");
		return new Response(JSON.stringify({ views }), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (error) {
		console.error("KV error", error);
		return new Response(JSON.stringify({
			views: 0,
			error: "Database error"
		}), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/views@_@ts
var page = () => views_exports;
//#endregion
export { page };
