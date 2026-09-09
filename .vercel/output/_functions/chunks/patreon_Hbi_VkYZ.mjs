//#region src/lib/patreon.ts
var PATREON_TOKEN_URL = "https://www.patreon.com/api/oauth2/token";
var PATREON_API_BASE = "https://www.patreon.com/api/oauth2/v2";
var cachedAccessToken = process.env.PATREON_CREATOR_ACCESS_TOKEN || "jv6ooolbCjcllaT_lqSUhKFUAPl2kLcORV1IDS0pmB0";
var tokenExpiresAt = 0;
var currentRefreshToken = process.env.PATREON_REFRESH_TOKEN || "RaEXrl-hoXk7WhbjJHqZSL7VpTUGiH0Ab-BST41NkKo";
var cachedCampaignId = process.env.PATREON_CAMPAIGN_ID || null;
async function getPatreonAccessToken(forceRefresh = false) {
	const now = Date.now();
	if (!forceRefresh && cachedAccessToken && (tokenExpiresAt === 0 || now < tokenExpiresAt)) return cachedAccessToken;
	const clientId = process.env.PATREON_CLIENT_ID || "fuUsVtCpAEHGo3B5r5vwt0cYEa53CQBcwVYpsnTXtSSUqyQoJvXlIYyYc5WeN1Zn";
	const clientSecret = process.env.PATREON_CLIENT_SECRET || "pQnltNIYq-YpRnBrC3VlAkengAnGGdAw0iUNfTDEU-XVXsNvF54VC_ZziUAJgart";
	const refreshToken = currentRefreshToken || process.env.PATREON_REFRESH_TOKEN || "RaEXrl-hoXk7WhbjJHqZSL7VpTUGiH0Ab-BST41NkKo";
	if (!clientId || !clientSecret || !refreshToken) return cachedAccessToken;
	try {
		const res = await fetch(PATREON_TOKEN_URL, {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: new URLSearchParams({
				grant_type: "refresh_token",
				refresh_token: refreshToken,
				client_id: clientId,
				client_secret: clientSecret
			})
		});
		if (res.ok) {
			const data = await res.json();
			if (data.access_token) {
				cachedAccessToken = data.access_token;
				tokenExpiresAt = now + ((typeof data.expires_in === "number" ? data.expires_in : 2592e3) - 300) * 1e3;
				if (data.refresh_token) currentRefreshToken = data.refresh_token;
				return cachedAccessToken;
			}
		} else console.error("Failed to refresh Patreon access token, status:", res.status, await res.text());
	} catch (err) {
		console.error("Error in Patreon token refresh:", err);
	}
	return cachedAccessToken;
}
async function getPatreonCampaignId(token) {
	if (cachedCampaignId) return cachedCampaignId;
	try {
		const res = await fetch(`${PATREON_API_BASE}/campaigns`, { headers: { Authorization: `Bearer ${token}` } });
		if (res.ok) {
			const id = (await res.json()).data?.[0]?.id;
			if (id) {
				cachedCampaignId = id;
				return id;
			}
		}
	} catch (err) {
		console.error("Failed to get Patreon campaign ID:", err);
	}
	return null;
}
async function fetchWithPatreonAuth(url) {
	let token = await getPatreonAccessToken();
	if (!token) return null;
	let res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
	if (res.status === 401) {
		token = await getPatreonAccessToken(true);
		if (token) res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
	}
	return res;
}
async function fetchLatestPosts() {
	const token = await getPatreonAccessToken();
	if (!token) return [];
	const campaignId = await getPatreonCampaignId(token);
	if (!campaignId) return [];
	const res = await fetchWithPatreonAuth(`${PATREON_API_BASE}/campaigns/${campaignId}/posts?page[count]=100&fields[post]=title,content,published_at,url,is_public,embed_data`);
	if (!res || !res.ok) return [];
	const latestThree = ((await res.json()).data || []).sort((a, b) => {
		const timeA = new Date(a.attributes?.published_at || 0).getTime();
		return new Date(b.attributes?.published_at || 0).getTime() - timeA;
	}).slice(0, 3);
	return await Promise.all(latestThree.map(async (p) => {
		const attrs = p.attributes || {};
		const d = attrs.published_at ? new Date(attrs.published_at) : /* @__PURE__ */ new Date();
		const dateStr = `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
		const postUrl = attrs.url ? attrs.url.startsWith("http") ? attrs.url : `https://www.patreon.com${attrs.url}` : "https://www.patreon.com";
		let thumb = null;
		try {
			const detailRes = await fetchWithPatreonAuth(`https://www.patreon.com/api/posts/${p.id}`);
			if (detailRes && detailRes.ok) {
				const detailAttrs = (await detailRes.json()).data?.attributes;
				thumb = detailAttrs?.thumbnail?.default || detailAttrs?.image?.thumb_url || detailAttrs?.image?.url || null;
			}
		} catch (err) {
			console.error("Error fetching post details for thumb:", err);
		}
		if (!thumb) thumb = attrs.embed_data?.image_url || attrs.content?.match(/<img[^>]+src=["']([^"']+)["']/)?.[1]?.replace(/&amp;/g, "&") || null;
		if (thumb) thumb = thumb.replace(/&amp;/g, "&");
		return {
			id: p.id,
			title: attrs.title || "Untitled Post",
			date: dateStr,
			url: postUrl,
			thumbnail: thumb,
			is_public: attrs.is_public ?? true
		};
	}));
}
async function fetchActiveMembers() {
	const token = await getPatreonAccessToken();
	if (!token) return [];
	const campaignId = await getPatreonCampaignId(token);
	if (!campaignId) return [];
	const res = await fetchWithPatreonAuth(`${PATREON_API_BASE}/campaigns/${campaignId}/members?include=user&fields[member]=patron_status,full_name&fields[user]=full_name,vanity&filter[is_active]=true`);
	if (!res || !res.ok) return [];
	const json = await res.json();
	const activeMembers = [];
	(json.data || []).forEach((m) => {
		const name = m.attributes?.full_name;
		const isPaid = m.attributes?.patron_status === "active_patron";
		if (name && name.trim()) activeMembers.push({
			name: name.trim(),
			isPaid
		});
	});
	return activeMembers;
}
//#endregion
export { fetchLatestPosts as n, fetchActiveMembers as t };
