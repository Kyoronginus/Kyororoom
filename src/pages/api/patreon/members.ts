import type { APIRoute } from 'astro';
import { fetchActiveMembers, type PatronMember } from '../../../lib/patreon';

let cachedMembers: PatronMember[] | null = null;
let cacheExpiresAt = 0;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

export const GET: APIRoute = async () => {
  const now = Date.now();
  if (cachedMembers && now < cacheExpiresAt) {
    return new Response(JSON.stringify({ members: cachedMembers }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=43200',
      },
    });
  }

  try {
    const members = await fetchActiveMembers();
    if (members.length > 0) {
      cachedMembers = members;
      cacheExpiresAt = now + CACHE_TTL_MS;
    }
    return new Response(JSON.stringify({ members: cachedMembers || [] }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=43200',
      },
    });
  } catch (err) {
    console.error('Error in patreon members route:', err);
    return new Response(JSON.stringify({ members: cachedMembers || [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

