import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
//#region src/pages/api/spotify.ts
var spotify_exports = /* @__PURE__ */ __exportAll({ GET: () => GET });
var GET = async () => {
	return new Response(JSON.stringify({
		isPlaying: true,
		title: "Ghost City Tokyo",
		artist: "Ayase, Hatsune Miku",
		albumImageUrl: "https://i.scdn.co/image/ab67616d0000b27341e31d6ea1d493dd7793365b",
		songUrl: "https://open.spotify.com/track/5n2q6C4T33W8kO3aP6k4R9"
	}), {
		status: 200,
		headers: { "Content-Type": "application/json" }
	});
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/spotify@_@ts
var page = () => spotify_exports;
//#endregion
export { page };
