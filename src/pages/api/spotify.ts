import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  // This is a mock API implementation. 
  // You will need to replace this with actual Spotify API calls using your keys.
  // Spotify API requires OAuth token refresh flow.
  const mockSpotifyData = {
    isPlaying: true,
    title: "Ghost City Tokyo",
    artist: "Ayase, Hatsune Miku",
    albumImageUrl: "https://i.scdn.co/image/ab67616d0000b27341e31d6ea1d493dd7793365b",
    songUrl: "https://open.spotify.com/track/5n2q6C4T33W8kO3aP6k4R9"
  };

  return new Response(JSON.stringify(mockSpotifyData), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      // 'Cache-Control': 's-maxage=60, stale-while-revalidate'
    }
  });
};
