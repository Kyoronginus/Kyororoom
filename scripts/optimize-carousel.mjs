import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SOURCE_DIR = path.resolve('src/assets/hero-carousel');
const OUTPUT_DIR = path.resolve('public/Assets/Hero/Carousel');

// 1. Ensure source directory exists
if (!fs.existsSync(SOURCE_DIR)) {
  fs.mkdirSync(SOURCE_DIR, { recursive: true });
}

// 2. If original raw images are still in public/Assets/Hero/Carousel, move them to src/assets/hero-carousel
if (fs.existsSync(OUTPUT_DIR)) {
  const existingFiles = fs.readdirSync(OUTPUT_DIR);
  for (const file of existingFiles) {
    if (/\.(png|jpe?g)$/i.test(file)) {
      const srcPath = path.join(OUTPUT_DIR, file);
      const destPath = path.join(SOURCE_DIR, file);
      if (!fs.existsSync(destPath)) {
        fs.copyFileSync(srcPath, destPath);
        fs.unlinkSync(srcPath);
        console.log(`Moved raw source: ${file} -> src/assets/hero-carousel/`);
      } else {
        fs.unlinkSync(srcPath);
      }
    }
  }
}

// 3. Process all images from SOURCE_DIR into OUTPUT_DIR as .webp
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const files = fs.readdirSync(SOURCE_DIR).filter((f) => /\.(png|jpe?g|webp)$/i.test(f));

if (files.length === 0) {
  process.exit(0);
}

let totalOriginalBytes = 0;
let totalCompressedBytes = 0;
let optimizedCount = 0;

for (const file of files) {
  const inputPath = path.join(SOURCE_DIR, file);
  const baseName = path.parse(file).name;
  const outputPath = path.join(OUTPUT_DIR, `${baseName}.webp`);

  const inputStat = fs.statSync(inputPath);
  totalOriginalBytes += inputStat.size;

  // Cache check: skip if output exists and is newer than input
  if (fs.existsSync(outputPath)) {
    const outputStat = fs.statSync(outputPath);
    if (outputStat.mtimeMs >= inputStat.mtimeMs) {
      totalCompressedBytes += outputStat.size;
      continue;
    }
  }

  // Optimize with Sharp: max height 800px (retina 2x for 400px carousel), quality 85 webp
  await sharp(inputPath)
    .resize({ height: 800, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(outputPath);

  const outputStat = fs.statSync(outputPath);
  totalCompressedBytes += outputStat.size;
  optimizedCount++;

  const origMB = (inputStat.size / (1024 * 1024)).toFixed(2);
  const compKB = (outputStat.size / 1024).toFixed(1);
  const savedPercent = (((inputStat.size - outputStat.size) / inputStat.size) * 100).toFixed(1);
  console.log(`  ✓ ${file} (${origMB} MB) -> ${baseName}.webp (${compKB} KB, -${savedPercent}%)`);
}

if (optimizedCount > 0) {
  const origTotalMB = (totalOriginalBytes / (1024 * 1024)).toFixed(1);
  const compTotalMB = (totalCompressedBytes / (1024 * 1024)).toFixed(2);
  const totalSavedPercent = (((totalOriginalBytes - totalCompressedBytes) / totalOriginalBytes) * 100).toFixed(1);
  console.log(`[optimize-carousel] Done! ${optimizedCount} images processed: ${origTotalMB} MB -> ${compTotalMB} MB (-${totalSavedPercent}% size reduction)`);
}
