import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

async function extractAccent(imagePath) {
  const { data } = await sharp(imagePath)
    .resize(32, 32, { fit: 'inside' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const buckets = {};
  let fallbackR = 0;
  let fallbackG = 0;
  let fallbackB = 0;
  const pixelCount = data.length / 3;

  for (let i = 0; i < data.length; i += 3) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    fallbackR += r;
    fallbackG += g;
    fallbackB += b;

    const [h, s, l] = rgbToHsl(r, g, b);

    // Exclude near-white (backgrounds), near-black, and washed out grays
    if (l > 88 || l < 12 || s < 18) continue;

    // Group into color buckets (20deg hue x 25% saturation)
    const hBucket = Math.floor(h / 20);
    const sBucket = Math.floor(s / 25);
    const key = `${hBucket}_${sBucket}`;

    if (!buckets[key]) {
      buckets[key] = { r: 0, g: 0, b: 0, count: 0, sSum: 0 };
    }
    buckets[key].r += r;
    buckets[key].g += g;
    buckets[key].b += b;
    buckets[key].sSum += s;
    buckets[key].count++;
  }

  let bestBucket = null;
  let maxScore = -1;

  for (const key in buckets) {
    const b = buckets[key];
    const avgS = b.sSum / b.count;
    const score = b.count * Math.pow(avgS, 1.25);
    if (score > maxScore) {
      maxScore = score;
      bestBucket = b;
    }
  }

  let r, g, b;
  if (bestBucket) {
    r = Math.round(bestBucket.r / bestBucket.count);
    g = Math.round(bestBucket.g / bestBucket.count);
    b = Math.round(bestBucket.b / bestBucket.count);
  } else {
    r = Math.round(fallbackR / pixelCount);
    g = Math.round(fallbackG / pixelCount);
    b = Math.round(fallbackB / pixelCount);
  }

  // Ensure contrast: if too light, darken slightly for visibility against white
  const [, , l] = rgbToHsl(r, g, b);
  if (l > 75) {
    r = Math.round(r * 0.75);
    g = Math.round(g * 0.75);
    b = Math.round(b * 0.75);
  }

  return {
    accent: `rgb(${r}, ${g}, ${b})`,
    glow: `rgba(${r}, ${g}, ${b}, 0.22)`,
  };
}

function findMarkdownFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(findMarkdownFiles(fullPath));
    } else if (file.endsWith('.md')) {
      results.push(fullPath);
    }
  }
  return results;
}

async function main() {
  const contentDir = path.resolve('src/content/works');
  const mdFiles = findMarkdownFiles(contentDir);
  const palettes = {};

  for (const mdPath of mdFiles) {
    const rel = path.relative(contentDir, mdPath);
    const workId = rel.replace(/\.md$/, '');

    const content = fs.readFileSync(mdPath, 'utf8');
    const match = content.match(/cover:\s*["']?([^"'\r\n]+)["']?/);
    if (!match) continue;

    const imagePath = path.resolve(path.dirname(mdPath), match[1].trim());
    if (!fs.existsSync(imagePath)) {
      console.warn(`[palette] Image not found for ${workId}: ${imagePath}`);
      continue;
    }

    try {
      const palette = await extractAccent(imagePath);
      palettes[workId] = palette;
      console.log(`[palette] ${workId} -> ${palette.accent}`);
    } catch (err) {
      console.error(`[palette] Error extracting ${workId}:`, err);
    }
  }

  const outDir = path.resolve('src/data');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outFile = path.join(outDir, 'work-palettes.json');
  fs.writeFileSync(outFile, JSON.stringify(palettes, null, 2), 'utf8');
  console.log(`[palette] Successfully generated ${Object.keys(palettes).length} palettes at ${outFile}`);
}

main();
