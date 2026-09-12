import { kv } from '@vercel/kv';

export async function getOrIncrementViews(): Promise<number> {
  const url = process.env.KV_REST_API_URL || import.meta.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN || import.meta.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    return 42069;
  }

  try {
    const views = await kv.incr('visitor_count');
    return views;
  } catch (err) {
    console.error('KV visitor count error:', err);
    return 42069;
  }
}
