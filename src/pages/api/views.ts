import type { APIRoute } from 'astro';
import { kv } from '@vercel/kv';

export const GET: APIRoute = async () => {
  try {
    // If kv config is missing (e.g. running locally without Vercel Env Vars), we use a mock
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      return new Response(JSON.stringify({ views: 42069 }), { status: 200, headers: { 'Content-Type': 'application/json' }});
    }

    // Increment view count
    const views = await kv.incr('visitor_count');
    return new Response(JSON.stringify({ views }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  } catch (error) {
    console.error("KV error", error);
    return new Response(JSON.stringify({ views: 0, error: 'Database error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
