import type { APIRoute } from 'astro';

export const prerender = false;

function isAllowedHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return (
    host === 'patreonusercontent.com' ||
    host.endsWith('.patreonusercontent.com') ||
    host === 'patreon.com' ||
    host.endsWith('.patreon.com')
  );
}

export const GET: APIRoute = async ({ request }) => {
  const requestUrl = new URL(request.url);
  const target = requestUrl.searchParams.get('url');

  if (!target) {
    return new Response('Missing url parameter', { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return new Response('Invalid target URL', { status: 400 });
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return new Response('Invalid protocol', { status: 400 });
  }

  if (!isAllowedHost(parsed.hostname)) {
    return new Response('Forbidden host', { status: 403 });
  }

  try {
    const upstreamRes = await fetch(parsed.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Kyororoom/1.0)',
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
    });

    if (!upstreamRes.ok) {
      return new Response('Upstream image error', { status: upstreamRes.status });
    }

    const contentType = upstreamRes.headers.get('content-type') || 'image/png';
    const buffer = await upstreamRes.arrayBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
      },
    });
  } catch (err) {
    console.error('Error in patreon image proxy:', err);
    return new Response('Internal proxy error', { status: 500 });
  }
};
