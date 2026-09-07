import type { APIRoute } from 'astro';

const client_id = import.meta.env.SPOTIFY_CLIENT_ID;
const client_secret = import.meta.env.SPOTIFY_CLIENT_SECRET;
const refresh_token = import.meta.env.SPOTIFY_REFRESH_TOKEN;

const basic = btoa(`${client_id}:${client_secret}`);
const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;
const NOW_PLAYING_ENDPOINT = `https://api.spotify.com/v1/me/player/currently-playing`;

const getAccessToken = async () => {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refresh_token || '',
    }),
  });

  return response.json();
};

export const GET: APIRoute = async () => {
  if (!client_id || !client_secret || !refresh_token) {
    return new Response(JSON.stringify({ 
      isPlaying: false, 
      title: "Spotify Not Configured", 
      artist: "Waiting for API keys" 
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const { access_token } = await getAccessToken();

    const response = await fetch(NOW_PLAYING_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (response.status === 204 || response.status > 400) {
      return new Response(JSON.stringify({ isPlaying: false }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const song = await response.json();

    if (song.item === null) {
      return new Response(JSON.stringify({ isPlaying: false }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const isPlaying = song.is_playing;
    const title = song.item.name;
    const artist = song.item.artists.map((_artist: any) => _artist.name).join(', ');
    const albumImageUrl = song.item.album.images[0].url;
    const songUrl = song.item.external_urls.spotify;

    const spotifyData = {
      isPlaying,
      title,
      artist,
      albumImageUrl,
      songUrl,
    };

    return new Response(JSON.stringify(spotifyData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=5',
      },
    });
  } catch (err) {
    console.error("Spotify API Error:", err);
    return new Response(JSON.stringify({ isPlaying: false, title: "Error loading Spotify", artist: "" }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
