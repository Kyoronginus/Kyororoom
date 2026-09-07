import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
//#region src/pages/api/patreon.ts
var patreon_exports = /* @__PURE__ */ __exportAll({ GET: () => GET });
var GET = async () => {
	return new Response(JSON.stringify([
		{
			id: 1,
			title: "New Sketch: Ghost City",
			type: "free"
		},
		{
			id: 2,
			title: "WIP: Next illustration",
			type: "patrons_only"
		},
		{
			id: 3,
			title: "Thank you for 100 members!",
			type: "public"
		}
	]), {
		status: 200,
		headers: { "Content-Type": "application/json" }
	});
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/patreon@_@ts
var page = () => patreon_exports;
//#endregion
export { page };
