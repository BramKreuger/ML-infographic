/**
 * Image Compression Script
 * Compresses all BMP images (with .png extension) to optimized JPEGs
 * Uses Jimp v1.x which supports BMP format
 */

const { Jimp } = require('jimp');
const fs = require('fs');
const path = require('path');

const INPUT_DIR = path.join(__dirname, '../public/data_v2.xlsx.files');
const OUTPUT_DIR = INPUT_DIR;
const MAX_WIDTH = 1200;
const JPEG_QUALITY = 85;

async function compressImages() {
  console.log('🖼️  Starting image compression with Jimp...\n');
  console.log('Note: Files are BMP images with .png extension (Excel export)\n');

  const files = fs.readdirSync(INPUT_DIR).filter(f => f.endsWith('.png'));
  console.log(`Found ${files.length} image files to compress\n`);

  let totalOriginal = 0;
  let totalCompressed = 0;
  let processed = 0;
  let errors = 0;

  for (const file of files) {
    const inputPath = path.join(INPUT_DIR, file);
    const outputPath = path.join(OUTPUT_DIR, file.replace('.png', '.jpg'));

    try {
      const originalStats = fs.statSync(inputPath);
      totalOriginal += originalStats.size;

      // Read with Jimp v1.x
      const image = await Jimp.read(inputPath);

      // Resize if too large
      if (image.width > MAX_WIDTH) {
        image.resize({ w: MAX_WIDTH });
      }

      // Save as JPEG
      await image.write(outputPath);

      const compressedStats = fs.statSync(outputPath);
      totalCompressed += compressedStats.size;
      processed++;

      if (processed % 20 === 0) {
        const savedSoFar = ((totalOriginal - totalCompressed) / 1024 / 1024).toFixed(1);
        console.log(`✅ Processed ${processed}/${files.length} files... (saved ${savedSoFar}MB so far)`);
      }

    } catch (err) {
      errors++;
      if (errors <= 5) {
        console.error(`❌ Error processing ${file}:`, err.message);
      }
    }
  }

  if (errors > 5) {
    console.log(`... and ${errors - 5} more errors`);
  }

  console.log('\n' + '═'.repeat(50));
  console.log(`\n📊 TOTAL RESULTS:`);
  console.log(`   Files processed: ${processed}/${files.length}`);
  console.log(`   Errors: ${errors}`);
  console.log(`   Original:   ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Compressed: ${(totalCompressed / 1024 / 1024).toFixed(2)} MB`);
  if (totalCompressed > 0) {
    console.log(`   Saved:      ${((totalOriginal - totalCompressed) / 1024 / 1024).toFixed(2)} MB (${((1 - totalCompressed / totalOriginal) * 100).toFixed(1)}%)`);
  }
  console.log('\n✨ Done! Now you can:');
  console.log('   1. Delete the old .png files');
  console.log('   2. Update code to use .jpg extension');
  console.log('   3. Remove from Git LFS and commit normally');
}

compressImages().catch(console.error);
