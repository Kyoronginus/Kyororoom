import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  // Mock Patreon API implementation
  // You will replace this with a call to Patreon's API using PATREON_CREATOR_TOKEN
  const mockPatreonData = [
    { id: 1, title: "New Sketch: Ghost City", type: "free" },
    { id: 2, title: "WIP: Next illustration", type: "patrons_only" },
    { id: 3, title: "Thank you for 100 members!", type: "public" },
  ];

  return new Response(JSON.stringify(mockPatreonData), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      // 'Cache-Control': 's-maxage=3600' // Cache for an hour since patreon doesn't update every second
    }
  });
};
