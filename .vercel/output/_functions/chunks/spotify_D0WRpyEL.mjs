import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
//#region src/pages/api/spotify.ts
var spotify_exports = /* @__PURE__ */ __exportAll({ GET: () => GET });
var client_id = "180be42f758d46e8872adf52bdc3cc20";
var client_secret = "113b4266340c4e34a7ad10332dc17608";
var refresh_token = "AQCz9SLnqiB9uVU-psET4dd99RsdpsUsxk46pObVb0NsvgJqOJX36Te66X8K21onqTpMLLgwE11JkPCG9BwEfE676i14iNi7mC0vxUbHXAvNtkTwcjQT5XlmLq3bw44GOhI";
var basic = btoa(`${client_id}:${client_secret}`);
var TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;
var NOW_PLAYING_ENDPOINT = `https://api.spotify.com/v1/me/player/currently-playing`;
var RECENTLY_PLAYED_ENDPOINT = `https://api.spotify.com/v1/me/player/recently-played?limit=1`;
var lastPlayedTrack = null;
var getAccessToken = async () => {
	return (await fetch(TOKEN_ENDPOINT, {
		method: "POST",
		headers: {
			Authorization: `Basic ${basic}`,
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: new URLSearchParams({
			grant_type: "refresh_token",
			refresh_token
		})
	})).json();
};
var GET = async () => {
	try {
		const { access_token } = await getAccessToken();
		const response = await fetch(NOW_PLAYING_ENDPOINT, { headers: { Authorization: `Bearer ${access_token}` } });
		if (response.status === 200) {
			const song = await response.json();
			if (song && song.item && song.is_playing) {
				const spotifyData = {
					isPlaying: true,
					title: song.item.name,
					artist: song.item.artists.map((_artist) => _artist.name).join(", "),
					albumImageUrl: song.item.album.images[0]?.url || "",
					songUrl: song.item.external_urls.spotify,
					timestamp: Math.floor(Date.now() / 1e3)
				};
				lastPlayedTrack = spotifyData;
				return new Response(JSON.stringify(spotifyData), {
					status: 200,
					headers: {
						"Content-Type": "application/json",
						"Cache-Control": "public, s-maxage=10, stale-while-revalidate=5"
					}
				});
			}
		}
		try {
			const recentRes = await fetch(RECENTLY_PLAYED_ENDPOINT, { headers: { Authorization: `Bearer ${access_token}` } });
			if (recentRes.ok) {
				const recentData = await recentRes.json();
				if (recentData.items && recentData.items.length > 0) {
					const item = recentData.items[0];
					const playedAt = Math.floor(new Date(item.played_at).getTime() / 1e3);
					const recentTrack = {
						isPlaying: false,
						title: item.track.name,
						artist: item.track.artists.map((_artist) => _artist.name).join(", "),
						albumImageUrl: item.track.album.images[0]?.url || "",
						songUrl: item.track.external_urls.spotify,
						timestamp: playedAt
					};
					lastPlayedTrack = recentTrack;
					return new Response(JSON.stringify(recentTrack), {
						status: 200,
						headers: {
							"Content-Type": "application/json",
							"Cache-Control": "public, s-maxage=15, stale-while-revalidate=10"
						}
					});
				}
			}
		} catch {}
		if (lastPlayedTrack) return new Response(JSON.stringify({
			...lastPlayedTrack,
			isPlaying: false
		}), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
				"Cache-Control": "public, s-maxage=15, stale-while-revalidate=10"
			}
		});
		return new Response(JSON.stringify({ isPlaying: false }), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		console.error("Spotify API Error:", err);
		return new Response(JSON.stringify({
			isPlaying: false,
			title: "Error loading Spotify",
			artist: ""
		}), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/spotify@_@ts
var page = () => spotify_exports;
//#endregion
export { page };
