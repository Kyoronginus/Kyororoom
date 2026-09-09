import type { APIRoute } from 'astro';
import { fetchLatestPosts, type PatreonPost } from '../../../lib/patreon';

let cachedPosts: PatreonPost[] | null = null;
let cacheExpiresAt = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export const GET: APIRoute = async () => {
  const now = Date.now();
  if (cachedPosts && now < cacheExpiresAt) {
    return new Response(JSON.stringify(cachedPosts), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      },
    });
  }

  try {
    const posts = await fetchLatestPosts();
    if (posts && posts.length > 0) {
      cachedPosts = posts;
      cacheExpiresAt = now + CACHE_TTL_MS;
      return new Response(JSON.stringify(posts), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
        },
      });
    }

    return new Response(JSON.stringify(cachedPosts || []), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error in patreon/posts API route:', err);
    return new Response(JSON.stringify(cachedPosts || []), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
