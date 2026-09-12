import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

export const prerender = false;

function cleanString(val: unknown): string {
  return typeof val === 'string' ? val.trim() : '';
}

function parseTags(val: unknown): string[] {
  if (typeof val !== 'string') return [];
  return val
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

function formatYamlFrontmatter(data: {
  title: string;
  category: string;
  date: string;
  cover: string;
  tags: string[];
  client?: string;
}): string {
  const lines = [
    '---',
    `title: "${data.title.replace(/"/g, '\\"')}"`,
    `category: "${data.category}"`,
    `date: "${data.date}"`,
    `cover: "${data.cover}"`,
    `tags: [${data.tags.map((t) => `"${t.replace(/"/g, '\\"')}"`).join(', ')}]`,
  ];
  if (data.client) {
    lines.push(`client: "${data.client.replace(/"/g, '\\"')}"`);
  }
  lines.push('---');
  return lines.join('\n');
}

export const POST: APIRoute = async ({ request }) => {
  // Production protection: strictly reject requests outside development
  if (import.meta.env.PROD) {
    return new Response(JSON.stringify({ error: 'Admin is disabled in production.' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const formData = await request.formData();
    const action = cleanString(formData.get('action')) || 'create';
    const autoDeploy = formData.get('autoDeploy') === 'true';

    const logs: string[] = [];
    const log = (msg: string) => logs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);

    if (action === 'create') {
      const file = formData.get('file') as File | null;
      if (!file || !(file instanceof File) || file.size === 0) {
        return new Response(JSON.stringify({ error: 'Artwork image file is required.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const title = cleanString(formData.get('title')) || 'untitled';
      const category = cleanString(formData.get('category')) === 'commission' ? 'commission' : 'personal';
      const folder = cleanString(formData.get('folder')) || (category === 'commission' ? 'commission' : '');
      const rawSlug = cleanString(formData.get('slug'));
      const date = cleanString(formData.get('date')) || new Date().toISOString().split('T')[0];
      const tags = parseTags(formData.get('tags'));
      const client = cleanString(formData.get('client'));
      const description = cleanString(formData.get('description'));

      // Resolve slug / ID
      const targetFolderDir = folder && folder !== 'root' ? path.resolve('src/content/works', folder) : path.resolve('src/content/works');
      if (!fs.existsSync(targetFolderDir)) {
        fs.mkdirSync(targetFolderDir, { recursive: true });
      }

      let slug = rawSlug;
      if (!slug) {
        // Auto-increment numeric ID based on existing files in that folder
        const existing = fs.readdirSync(targetFolderDir)
          .filter((f) => f.endsWith('.md'))
          .map((f) => parseInt(f.replace(/\.md$/, ''), 10))
          .filter((n) => !isNaN(n));
        const nextNum = existing.length > 0 ? Math.max(...existing) + 1 : 1;
        slug = String(nextNum);
      }

      const workId = folder && folder !== 'root' ? `${folder}/${slug}` : slug;
      log(`Resolved work ID: ${workId}`);

      // Save asset
      const ext = path.extname(file.name).toLowerCase() || '.png';
      const assetDir = folder && folder !== 'root' ? path.resolve('src/assets/works', folder) : path.resolve('src/assets/works');
      if (!fs.existsSync(assetDir)) {
        fs.mkdirSync(assetDir, { recursive: true });
      }
      const assetFileName = `${slug}${ext}`;
      const assetPath = path.join(assetDir, assetFileName);
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(assetPath, buffer);
      log(`Saved image asset: ${path.relative(process.cwd(), assetPath)}`);

      // Write content markdown
      const mdPath = path.join(targetFolderDir, `${slug}.md`);
      const relCover = path.relative(path.dirname(mdPath), assetPath).replace(/\\/g, '/');

      const frontmatter = formatYamlFrontmatter({
        title,
        category,
        date,
        cover: relCover,
        tags: tags.length > 0 ? tags : [category],
        client: client || undefined,
      });

      const mdContent = `${frontmatter}\n\n${description}`.trim() + '\n';
      fs.writeFileSync(mdPath, mdContent, 'utf8');
      log(`Created markdown entry: ${path.relative(process.cwd(), mdPath)}`);

      // Regenerate palettes
      try {
        log('Precomputing color palette...');
        execSync('node scripts/generate-palettes.mjs', { encoding: 'utf8' });
        log('Palettes updated in src/data/work-palettes.json');
      } catch (err: any) {
        log(`Warning: Palette generation output: ${err.message}`);
      }

      // Update works-order.json with new workId at the top
      try {
        const orderFilePath = path.resolve('src/data/works-order.json');
        let orderList: string[] = [];
        if (fs.existsSync(orderFilePath)) {
          orderList = JSON.parse(fs.readFileSync(orderFilePath, 'utf8'));
        }
        if (!orderList.includes(workId)) {
          orderList.unshift(workId);
          fs.writeFileSync(orderFilePath, JSON.stringify(orderList, null, 2) + '\n', 'utf8');
          log(`Prepended ${workId} to sequence in src/data/works-order.json`);
        }
      } catch (err: any) {
        log(`Warning: Failed to update works-order.json: ${err.message}`);
      }

      // Optional auto-deploy
      if (autoDeploy) {
        log('Auto-deploying to Git...');
        try {
          execSync('git add src/assets/works src/content/works src/data/work-palettes.json src/data/works-order.json', { encoding: 'utf8' });
          execSync(`git commit -m "content(works): add ${workId}"`, { encoding: 'utf8' });
          log('Committed to local git branch.');
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
          workId,
          message: `Artwork "${title}" (${workId}) created successfully!`,
          logs,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'update') {
      const workId = cleanString(formData.get('workId'));
      if (!workId) {
        return new Response(JSON.stringify({ error: 'workId is required for update.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const mdPath = path.resolve('src/content/works', `${workId}.md`);
      if (!fs.existsSync(mdPath)) {
        return new Response(JSON.stringify({ error: `Artwork file not found at ${mdPath}` }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const currentContent = fs.readFileSync(mdPath, 'utf8');
      const coverMatch = currentContent.match(/cover:\s*["']?([^"'\r\n]+)["']?/);
      let currentCover = coverMatch ? coverMatch[1].trim() : '';

      const file = formData.get('file') as File | null;
      let assetReplaced = false;

      // If user uploaded a new image to replace the cover
      if (file && file instanceof File && file.size > 0) {
        const ext = path.extname(file.name).toLowerCase() || '.png';
        const targetDir = path.dirname(path.resolve(path.dirname(mdPath), currentCover || 'placeholder.png'));
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }
        const newAssetBase = path.basename(mdPath, '.md') + ext;
        const newAssetPath = path.join(targetDir, newAssetBase);
        const buffer = Buffer.from(await file.arrayBuffer());
        fs.writeFileSync(newAssetPath, buffer);
        currentCover = path.relative(path.dirname(mdPath), newAssetPath).replace(/\\/g, '/');
        assetReplaced = true;
        log(`Replaced image asset: ${newAssetBase}`);
      }

      const title = cleanString(formData.get('title')) || 'untitled';
      const category = cleanString(formData.get('category')) === 'commission' ? 'commission' : 'personal';
      const date = cleanString(formData.get('date')) || new Date().toISOString().split('T')[0];
      const tags = parseTags(formData.get('tags'));
      const client = cleanString(formData.get('client'));
      const description = cleanString(formData.get('description'));

      const frontmatter = formatYamlFrontmatter({
        title,
        category,
        date,
        cover: currentCover,
        tags: tags.length > 0 ? tags : [category],
        client: client || undefined,
      });

      const updatedMd = `${frontmatter}\n\n${description}`.trim() + '\n';
      fs.writeFileSync(mdPath, updatedMd, 'utf8');
      log(`Updated markdown file: ${path.relative(process.cwd(), mdPath)}`);

      if (assetReplaced) {
        log('Precomputing updated color palette...');
        execSync('node scripts/generate-palettes.mjs', { encoding: 'utf8' });
        log('Palettes updated.');
      }

      if (autoDeploy) {
        log('Auto-deploying to Git...');
        try {
          execSync('git add src/assets/works src/content/works src/data/work-palettes.json', { encoding: 'utf8' });
          execSync(`git commit -m "content(works): update ${workId}"`, { encoding: 'utf8' });
          log('Committed to local git branch.');
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
          workId,
          message: `Artwork "${title}" (${workId}) updated successfully!`,
          logs,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'reorder') {
      const orderRaw = formData.get('order');
      let orderList: string[] = [];
      if (typeof orderRaw === 'string') {
        try {
          orderList = JSON.parse(orderRaw);
        } catch {
          orderList = orderRaw.split(',').map((s) => s.trim()).filter(Boolean);
        }
      }

      if (!Array.isArray(orderList) || orderList.length === 0) {
        return new Response(JSON.stringify({ error: 'Order array of artwork IDs is required.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const orderFilePath = path.resolve('src/data/works-order.json');
      fs.writeFileSync(orderFilePath, JSON.stringify(orderList, null, 2) + '\n', 'utf8');
      log(`Saved ${orderList.length} artwork IDs into src/data/works-order.json`);

      if (autoDeploy) {
        log('Auto-deploying updated sequence to Git...');
        try {
          execSync('git add src/data/works-order.json', { encoding: 'utf8' });
          execSync('git commit -m "content(works): update gallery sequence"', { encoding: 'utf8' });
          log('Committed sequence change to local git branch.');
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
          message: `Gallery sequence successfully saved (${orderList.length} artworks)!`,
          logs,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({ error: `Unknown action "${action}"` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in /api/admin/works:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
