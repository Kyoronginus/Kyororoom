import type { APIRoute } from 'astro';
import { getOrIncrementViews } from '../../lib/views';

export const GET: APIRoute = async () => {
  const views = await getOrIncrementViews();
  return new Response(JSON.stringify({ views }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
