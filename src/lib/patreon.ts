const PATREON_TOKEN_URL = 'https://www.patreon.com/api/oauth2/token';
export const PATREON_API_BASE = 'https://www.patreon.com/api/oauth2/v2';

export type PatreonPost = {
  id: string;
  title: string;
  date: string;
  url: string;
  thumbnail: string | null;
  is_public: boolean;
};

export type PatronMember = {
  name: string;
  isPaid: boolean;
};


let cachedAccessToken: string | null =
  process.env.PATREON_CREATOR_ACCESS_TOKEN ||
  import.meta.env.PATREON_CREATOR_ACCESS_TOKEN ||
  null;
let tokenExpiresAt: number = 0;
let currentRefreshToken: string | null =
  process.env.PATREON_REFRESH_TOKEN ||
  import.meta.env.PATREON_REFRESH_TOKEN ||
  null;
let cachedCampaignId: string | null =
  process.env.PATREON_CAMPAIGN_ID ||
  import.meta.env.PATREON_CAMPAIGN_ID ||
  null;

export async function getPatreonAccessToken(forceRefresh = false): Promise<string | null> {
  const now = Date.now();

  if (!forceRefresh && cachedAccessToken && (tokenExpiresAt === 0 || now < tokenExpiresAt)) {
    return cachedAccessToken;
  }

  const clientId = process.env.PATREON_CLIENT_ID || import.meta.env.PATREON_CLIENT_ID;
  const clientSecret = process.env.PATREON_CLIENT_SECRET || import.meta.env.PATREON_CLIENT_SECRET;
  const refreshToken = currentRefreshToken || process.env.PATREON_REFRESH_TOKEN || import.meta.env.PATREON_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return cachedAccessToken;
  }

  try {
    const res = await fetch(PATREON_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.access_token) {
        cachedAccessToken = data.access_token;
        const expiresInSec = typeof data.expires_in === 'number' ? data.expires_in : 2592000;
        tokenExpiresAt = now + (expiresInSec - 300) * 1000;

        if (data.refresh_token) {
          currentRefreshToken = data.refresh_token;
        }
        return cachedAccessToken;
      }
    } else {
      console.error('Failed to refresh Patreon access token, status:', res.status, await res.text());
    }
  } catch (err) {
    console.error('Error in Patreon token refresh:', err);
  }

  return cachedAccessToken;
}

export async function getPatreonCampaignId(token: string): Promise<string | null> {
  if (cachedCampaignId) return cachedCampaignId;

  try {
    const res = await fetch(`${PATREON_API_BASE}/campaigns`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const json = await res.json();
      const id = json.data?.[0]?.id;
      if (id) {
        cachedCampaignId = id;
        return id;
      }
    }
  } catch (err) {
    console.error('Failed to get Patreon campaign ID:', err);
  }

  return null;
}

export async function fetchWithPatreonAuth(url: string): Promise<Response | null> {
  let token = await getPatreonAccessToken();
  if (!token) return null;

  let res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    token = await getPatreonAccessToken(true);
    if (token) {
      res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  }

  return res;
}

export async function fetchLatestPosts(): Promise<PatreonPost[]> {
  const token = await getPatreonAccessToken();
  if (!token) return [];

  const campaignId = await getPatreonCampaignId(token);
  if (!campaignId) return [];

  // Patreon API v2 returns posts in ascending (oldest-first) order and ignores sort parameters.
  // We fetch up to 100 posts, then sort descending by published_at in code.
  const postsUrl = `${PATREON_API_BASE}/campaigns/${campaignId}/posts?page[count]=100&fields[post]=title,content,published_at,url,is_public,embed_data`;
  const res = await fetchWithPatreonAuth(postsUrl);
  if (!res || !res.ok) return [];

  const json = await res.json();
  const allPosts = json.data || [];

  // Sort descending to get the newest posts first
  const sortedPosts = allPosts.sort((a: any, b: any) => {
    const timeA = new Date(a.attributes?.published_at || 0).getTime();
    const timeB = new Date(b.attributes?.published_at || 0).getTime();
    return timeB - timeA;
  });

  const latestThree = sortedPosts.slice(0, 3);

  const posts: PatreonPost[] = await Promise.all(
    latestThree.map(async (p: any) => {
      const attrs = p.attributes || {};
      const d = attrs.published_at ? new Date(attrs.published_at) : new Date();
      const dateStr = `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
      const postUrl = attrs.url
        ? attrs.url.startsWith('http')
          ? attrs.url
          : `https://www.patreon.com${attrs.url}`
        : 'https://www.patreon.com';

      let thumb: string | null = null;

      // 1. Query post details for high-res cover / thumbnail
      try {
        const detailRes = await fetchWithPatreonAuth(`https://www.patreon.com/api/posts/${p.id}`);
        if (detailRes && detailRes.ok) {
          const detailData = await detailRes.json();
          const detailAttrs = detailData.data?.attributes;
          thumb =
            detailAttrs?.thumbnail?.default ||
            detailAttrs?.image?.thumb_url ||
            detailAttrs?.image?.url ||
            null;
        }
      } catch (err) {
        console.error('Error fetching post details for thumb:', err);
      }

      // 2. Fallback to inline image or embed data
      if (!thumb) {
        thumb =
          attrs.embed_data?.image_url ||
          attrs.content?.match(/<img[^>]+src=["']([^"']+)["']/)?.[1]?.replace(/&amp;/g, '&') ||
          null;
      }

      // Ensure &amp; is cleaned from URL query strings
      if (thumb) {
        thumb = thumb.replace(/&amp;/g, '&');
      }

      return {
        id: p.id,
        title: attrs.title || 'Untitled Post',
        date: dateStr,
        url: postUrl,
        thumbnail: thumb,
        is_public: attrs.is_public ?? true,
      };
    })
  );

  return posts;
}

export async function fetchActiveMembers(): Promise<PatronMember[]> {
  const token = await getPatreonAccessToken();
  if (!token) return [];

  const campaignId = await getPatreonCampaignId(token);
  if (!campaignId) return [];

  const membersUrl = `${PATREON_API_BASE}/campaigns/${campaignId}/members?page[count]=100&include=user&fields[member]=patron_status,full_name&fields[user]=full_name,vanity&filter[is_active]=true`;

  const res = await fetchWithPatreonAuth(membersUrl);
  if (!res || !res.ok) return [];

  const json = await res.json();
  const activeMembers: PatronMember[] = [];
  
  (json.data || []).forEach((m: any) => {
    const name = m.attributes?.full_name;
    const isPaid = m.attributes?.patron_status === 'active_patron';
    if (name && name.trim()) {
      activeMembers.push({ name: name.trim(), isPaid });
    }
  });

  return activeMembers;
}
