import type { APIRoute } from 'astro';
import { siteConfig } from '../../config/site';
import { fetchLatestPosts, type PatreonPost } from '../../lib/patreon';

export interface TickerResponse {
  commission: {
    isOpen: boolean;
    statusLabel: string;
  };
  latestPost: {
    id: string;
    title: string;
    url: string;
    date: string;
  } | null;
  announcements: string[];
}

export const GET: APIRoute = async () => {
  let latestPost: TickerResponse['latestPost'] = null;

  try {
    const posts: PatreonPost[] = await fetchLatestPosts();
    if (posts && posts.length > 0) {
      const top = posts[0];
      latestPost = {
        id: top.id,
        title: top.title,
        url: top.url,
        date: top.date,
      };
    }
  } catch (err) {
    console.error('Failed to fetch latest post for ticker:', err);
  }

  const responseData: TickerResponse = {
    commission: {
      isOpen: siteConfig.commissions.isOpen,
      statusLabel: siteConfig.commissions.statusLabel,
    },
    latestPost,
    announcements: siteConfig.announcements,
  };

  return new Response(JSON.stringify(responseData), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
};
