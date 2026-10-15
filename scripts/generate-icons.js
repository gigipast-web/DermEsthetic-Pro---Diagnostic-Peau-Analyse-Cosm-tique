import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgPath = path.resolve('public/icon.svg');
const svgBuffer = fs.readFileSync(svgPath);

async function generate() {
  console.log('Generating PWA icons from SVG...');

  // 192x192 standard icon
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile('public/pwa-192x192.png');
  console.log('Created public/pwa-192x192.png');

  // 512x512 standard icon
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile('public/pwa-512x512.png');
  console.log('Created public/pwa-512x512.png');

  // Apple touch icon (180x180)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile('public/apple-touch-icon.png');
  console.log('Created public/apple-touch-icon.png');

  // 512x512 maskable icon with safe-zone margin (central 80%)
  const innerIcon = await sharp(svgBuffer)
    .resize(410, 410)
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 136, g: 19, b: 55, alpha: 1 }, // #881337
    },
  })
    .composite([
      {
        input: innerIcon,
        gravity: 'center',
      },
    ])
    .png()
    .toFile('public/pwa-maskable-512x512.png');
  console.log('Created public/pwa-maskable-512x512.png (maskable with safe zone)');

  console.log('All PWA icons generated successfully!');
}

generate().catch(console.error);
