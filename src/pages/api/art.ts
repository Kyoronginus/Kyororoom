import type { APIRoute } from 'astro';

const USER_ID = import.meta.env.OEKAKUSA_USER_ID;
const API_URL = import.meta.env.OEKAKUSA_API_URL;

let cachedData: any = null;
let cacheExpiresAt = 0;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes server-side memory cache

export const GET: APIRoute = async () => {
  const now = Date.now();
  if (cachedData && now < cacheExpiresAt) {
    return new Response(JSON.stringify(cachedData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
      },
    });
  }

  try {
    const res = await fetch(API_URL);
    if (!res.ok) {
      if (cachedData) {
        return new Response(JSON.stringify(cachedData), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ error: 'Failed to fetch art commit' }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await res.json();
    cachedData = data;
    cacheExpiresAt = now + CACHE_TTL_MS;

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
      },
    });
  } catch (err) {
    console.error('Art API Error:', err);
    if (cachedData) {
      return new Response(JSON.stringify(cachedData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
