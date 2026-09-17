import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

export const prerender = false;

const COMMISSIONS_FILE = path.resolve('src/data/commissions.json');

function readCommissions() {
  if (fs.existsSync(COMMISSIONS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(COMMISSIONS_FILE, 'utf8'));
    } catch {
      // fallback
    }
  }
  return {
    isOpen: true,
    statusLabel: 'OPEN',
    formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSdlij7_gfc9gt1PeVf7we4nzIGEvwi5f6pdD3JWp8cpL_AlzA/viewform?usp=sharing&ouid=101127023819410763660',
    email: 'kyoronginus@gmail.com',
  };
}

export const GET: APIRoute = async () => {
  if (import.meta.env.PROD) {
    return new Response(JSON.stringify({ error: 'Admin is disabled in production.' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const data = readCommissions();
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request }) => {
  if (import.meta.env.PROD) {
    return new Response(JSON.stringify({ error: 'Admin is disabled in production.' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const logs: string[] = [];
  const log = (msg: string) => logs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);

  try {
    const body = await request.json();
    const current = readCommissions();

    const isOpen = typeof body.isOpen === 'boolean' ? body.isOpen : body.isOpen === 'true';
    const statusLabel = (body.statusLabel ? String(body.statusLabel).trim() : (isOpen ? 'OPEN' : 'CLOSED')).toUpperCase();
    const formUrl = body.formUrl ? String(body.formUrl).trim() : current.formUrl;
    const email = body.email ? String(body.email).trim() : current.email;
    const autoDeploy = body.autoDeploy === true || body.autoDeploy === 'true';

    const updated = {
      isOpen,
      statusLabel,
      formUrl,
      email,
    };

    // Ensure data directory exists
    const dir = path.dirname(COMMISSIONS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(COMMISSIONS_FILE, JSON.stringify(updated, null, 2) + '\n', 'utf8');
    log(`Commission status saved: ${statusLabel} (${isOpen ? 'Accepting requests' : 'Paused'})`);

    if (autoDeploy) {
      log('Auto-deploying commission status change to Git...');
      try {
        execSync('git add src/data/commissions.json', { encoding: 'utf8' });
        execSync(`git commit -m "chore(config): update commission status to ${statusLabel}"`, { encoding: 'utf8' });
        log('Committed status change to local git branch.');
        const pushOut = execSync('git push origin master', { encoding: 'utf8' });
        log(`Pushed to origin/master: ${pushOut.trim()}`);
        log('Vercel deployment triggered automatically!');
      } catch (gitErr: any) {
        log(`Git error: ${gitErr.stderr || gitErr.stdout || gitErr.message}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Commission status successfully updated to ${statusLabel}!`,
        commissions: updated,
        logs,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('Error updating commission status:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error', logs }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
