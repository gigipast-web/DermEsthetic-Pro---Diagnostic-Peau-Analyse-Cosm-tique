import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '..', 'public');

// Master SVG for Standard & Google Play Store Icon (512x512)
const masterSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="38%" r="68%">
      <stop offset="0%" stop-color="#9f1239" />
      <stop offset="60%" stop-color="#881337" />
      <stop offset="100%" stop-color="#4c0519" />
    </radialGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="45%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>
    <linearGradient id="roseGlow" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fecdd3" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#f43f5e" stop-opacity="0.4" />
    </linearGradient>
    <filter id="subtleShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#000000" flood-opacity="0.35"/>
    </filter>
  </defs>

  <!-- Solid Background (Full-bleed square, Google Play applies round corners automatically) -->
  <rect width="512" height="512" fill="url(#bgGrad)"/>

  <!-- Delicate Gold Double Rim -->
  <rect x="20" y="20" width="472" height="472" rx="90" fill="none" stroke="url(#goldGrad)" stroke-width="2.5" opacity="0.45"/>
  <rect x="28" y="28" width="456" height="456" rx="82" fill="none" stroke="#fef08a" stroke-width="1" opacity="0.25"/>

  <!-- Central Botanical Emblem & Radiance -->
  <g transform="translate(256, 222)" filter="url(#subtleShadow)">
    <!-- Aura drop -->
    <path d="M0 -105 C50 -35 85 25 85 80 C85 125 45 160 0 160 C-45 160 -85 125 -85 80 C-85 25 -50 -35 0 -105 Z"
          fill="url(#roseGlow)" opacity="0.35"/>

    <!-- Lotus Petal Center -->
    <path d="M0 -90 C40 -25 68 25 68 75 C68 112 36 140 0 140 C-36 140 -68 112 -68 75 C-68 25 -40 -25 0 -90 Z"
          fill="none" stroke="url(#goldGrad)" stroke-width="8" stroke-linecap="round"/>

    <!-- Left Lotus Petal -->
    <path d="M-12 40 C-65 15 -105 48 -118 95 C-88 112 -52 106 -18 82 Z"
          fill="url(#goldGrad)" opacity="0.95"/>

    <!-- Right Lotus Petal -->
    <path d="M12 40 C65 15 105 48 118 95 C88 112 52 106 18 82 Z"
          fill="url(#goldGrad)" opacity="0.95"/>

    <!-- Inner Core Drop of Serum / Botanical Essence -->
    <path d="M0 -30 C18 -2 28 22 28 42 C28 58 15 72 0 72 C-15 72 -28 58 -28 42 C-28 22 -18 -2 0 -30 Z"
          fill="url(#goldGrad)"/>

    <!-- Star of Excellence Sparkle -->
    <path d="M0 -55 Q0 -35 20 -35 Q0 -35 0 -15 Q0 -35 -20 -35 Q0 -35 0 -55 Z"
          fill="#ffffff"/>
    <circle cx="0" cy="-35" r="3.5" fill="#fef08a"/>
  </g>

  <!-- Brand Typography -->
  <text x="256" y="415" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Playfair Display', Georgia, serif"
        font-size="32" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="4">
    DERMESTHETIC
  </text>
  <text x="256" y="446" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        font-size="15" font-weight="700" fill="#fef08a" text-anchor="middle" letter-spacing="7">
    PRO · CLINICAL
  </text>
</svg>
`;

// Maskable SVG: Guaranteed 100% full bleed square background + Safe Zone (76% circle)
const maskableSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="maskBg" cx="50%" cy="45%" r="70%">
      <stop offset="0%" stop-color="#9f1239" />
      <stop offset="65%" stop-color="#881337" />
      <stop offset="100%" stop-color="#4c0519" />
    </radialGradient>
    <linearGradient id="maskGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="45%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>
    <linearGradient id="maskRose" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fecdd3" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#f43f5e" stop-opacity="0.4" />
    </linearGradient>
  </defs>

  <rect width="512" height="512" fill="url(#maskBg)"/>
  <circle cx="256" cy="256" r="175" fill="none" stroke="url(#maskGold)" stroke-width="1.5" opacity="0.3"/>

  <g transform="translate(256, 222) scale(0.92)">
    <path d="M0 -105 C50 -35 85 25 85 80 C85 125 45 160 0 160 C-45 160 -85 125 -85 80 C-85 25 -50 -35 0 -105 Z"
          fill="url(#maskRose)" opacity="0.3"/>

    <path d="M0 -90 C40 -25 68 25 68 75 C68 112 36 140 0 140 C-36 140 -68 112 -68 75 C-68 25 -40 -25 0 -90 Z"
          fill="none" stroke="url(#maskGold)" stroke-width="8" stroke-linecap="round"/>

    <path d="M-12 40 C-65 15 -105 48 -118 95 C-88 112 -52 106 -18 82 Z"
          fill="url(#maskGold)" opacity="0.95"/>
    <path d="M12 40 C65 15 105 48 118 95 C88 112 52 106 18 82 Z"
          fill="url(#maskGold)" opacity="0.95"/>

    <path d="M0 -30 C18 -2 28 22 28 42 C28 58 15 72 0 72 C-15 72 -28 58 -28 42 C-28 22 -18 -2 0 -30 Z"
          fill="url(#maskGold)"/>

    <path d="M0 -55 Q0 -35 20 -35 Q0 -35 0 -15 Q0 -35 -20 -35 Q0 -35 0 -55 Z" fill="#ffffff"/>
    <circle cx="0" cy="-35" r="3.5" fill="#fef08a"/>
  </g>

  <text x="256" y="380" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        font-size="28" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="3.5">
    DERMESTHETIC
  </text>
  <text x="256" y="408" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        font-size="14" font-weight="700" fill="#fef08a" text-anchor="middle" letter-spacing="6">
    PRO
  </text>
</svg>
`;

// Google Play Feature Graphic SVG (1024x500 px, mandatory on Google Play Console)
const featureGraphicSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 500" width="1024" height="500">
  <defs>
    <radialGradient id="featBg" cx="30%" cy="40%" r="90%">
      <stop offset="0%" stop-color="#9f1239" />
      <stop offset="45%" stop-color="#881337" />
      <stop offset="85%" stop-color="#4c0519" />
      <stop offset="100%" stop-color="#1c1917" />
    </radialGradient>
    <linearGradient id="featGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="40%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
    <linearGradient id="badgeBg" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.12" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.04" />
    </linearGradient>
    <filter id="featGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="10" stdDeviation="15" flood-color="#000000" flood-opacity="0.4"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1024" height="500" fill="url(#featBg)"/>

  <!-- Decorative Fine Lines & Rings -->
  <circle cx="200" cy="250" r="180" fill="none" stroke="url(#featGold)" stroke-width="1.5" opacity="0.25"/>
  <circle cx="200" cy="250" r="140" fill="none" stroke="#fef08a" stroke-width="1" opacity="0.15" stroke-dasharray="6,6"/>
  <circle cx="950" cy="50" r="240" fill="none" stroke="url(#featGold)" stroke-width="1" opacity="0.15"/>

  <!-- Left Side: Large Emblem -->
  <g transform="translate(200, 250) scale(1.35)" filter="url(#featGlow)">
    <!-- Aura -->
    <path d="M0 -90 C45 -30 75 25 75 75 C75 116 41 150 0 150 C-41 150 -75 116 -75 75 C-75 25 -45 -30 0 -90 Z"
          fill="#fda4af" opacity="0.28"/>

    <!-- Center Lotus Line -->
    <path d="M0 -75 C35 -20 60 25 60 65 C60 98 33 125 0 125 C-33 125 -60 98 -60 65 C-60 25 -35 -20 0 -75 Z"
          fill="none" stroke="url(#featGold)" stroke-width="7" stroke-linecap="round"/>

    <!-- Left Petal -->
    <path d="M-12 35 C-55 15 -90 42 -100 82 C-75 96 -45 92 -15 72 Z"
          fill="url(#featGold)" opacity="0.95"/>

    <!-- Right Petal -->
    <path d="M12 35 C55 15 90 42 100 82 C75 96 45 92 15 72 Z"
          fill="url(#featGold)" opacity="0.95"/>

    <!-- Center drop -->
    <path d="M0 -25 C15 -2 24 18 24 35 C24 48 13 60 0 60 C-13 60 -24 48 -24 35 C-24 18 -15 -2 0 -25 Z"
          fill="url(#featGold)"/>

    <!-- Sparkle -->
    <path d="M0 -45 Q0 -28 17 -28 Q0 -28 0 -11 Q0 -28 -17 -28 Q0 -28 0 -45 Z" fill="#ffffff"/>
    <circle cx="0" cy="-28" r="3" fill="#fef08a"/>
  </g>

  <!-- Right Side: Content & Badges -->
  <g transform="translate(430, 80)">
    <!-- Category Badge -->
    <rect x="0" y="20" width="310" height="32" rx="16" fill="url(#badgeBg)" stroke="rgba(254, 240, 138, 0.4)" stroke-width="1"/>
    <text x="18" y="41" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          font-size="12" font-weight="700" fill="#fef08a" letter-spacing="2">
      ✦ APPLICATION CABINE & EXPERTISE
    </text>

    <!-- Main Title -->
    <text x="0" y="112" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Georgia, serif"
          font-size="52" font-weight="800" fill="#ffffff" letter-spacing="3">
      DERMESTHETIC <tspan fill="url(#featGold)">PRO</tspan>
    </text>

    <!-- Subtitle -->
    <text x="0" y="152" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          font-size="20" font-weight="600" fill="#fecdd3" letter-spacing="0.5">
      Diagnostic Peau & Analyse Cosmétique INCI
    </text>

    <!-- Divider Line -->
    <line x1="0" y1="180" x2="520" y2="180" stroke="url(#featGold)" stroke-width="1.5" opacity="0.5"/>

    <!-- 3 Features List -->
    <g transform="translate(0, 215)">
      <circle cx="10" cy="-4" r="5" fill="#f59e0b"/>
      <text x="26" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            font-size="16" font-weight="500" fill="#ffffff">
        Scanner de codes-barres & détection perturbateurs / allergènes
      </text>

      <circle cx="10" cy="36" r="5" fill="#f59e0b"/>
      <text x="26" y="40" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            font-size="16" font-weight="500" fill="#ffffff">
        Diagnostic cutané clinique multimodal Visage & Corps par IA
      </text>

      <circle cx="10" cy="76" r="5" fill="#f59e0b"/>
      <text x="26" y="80" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            font-size="16" font-weight="500" fill="#ffffff">
        Protocoles cabine sur-mesure & ordonnances beauté imprimables
      </text>
    </g>

    <!-- Footer Note -->
    <text x="0" y="360" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          font-size="13" font-weight="600" fill="rgba(254, 240, 138, 0.85)" letter-spacing="1">
      CONFORME RÈGLEMENTATION EUROPÉENNE CE 1223/2009 & COSING
    </text>
  </g>
</svg>
`;

async function generateAll() {
  console.log('Generating complete icon & store assets for DermEsthetic Pro...');

  // 1. Vector SVG master
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), masterSvg.trim(), 'utf8');
  console.log('✓ public/icon.svg saved');

  // 2. Google Play Icon 512x512 (Strict 32-bit RGBA without palette)
  await sharp(Buffer.from(masterSvg))
    .resize(512, 512)
    .png({ quality: 100, compressionLevel: 8, palette: false })
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  
  // Also save explicit alias google-play-icon-512x512.png
  fs.copyFileSync(path.join(publicDir, 'pwa-512x512.png'), path.join(publicDir, 'google-play-icon-512x512.png'));
  console.log('✓ public/pwa-512x512.png and google-play-icon-512x512.png generated (32-bit RGBA)');

  // 3. Google Play Feature Graphic 1024x500 (Mandatory in Google Play Console)
  await sharp(Buffer.from(featureGraphicSvg))
    .resize(1024, 500)
    .png({ quality: 100, compressionLevel: 8, palette: false })
    .toFile(path.join(publicDir, 'google-play-feature-graphic.png'));
  console.log('✓ public/google-play-feature-graphic.png generated (1024x500 PNG)');

  // 4. PWA 192x192
  await sharp(Buffer.from(masterSvg))
    .resize(192, 192)
    .png({ quality: 100, compressionLevel: 8, palette: false })
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('✓ public/pwa-192x192.png generated');

  // 5. Maskable 512x512
  await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png({ quality: 100, compressionLevel: 8, palette: false })
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('✓ public/pwa-maskable-512x512.png generated');

  // 6. Apple Touch Icon 180x180
  await sharp(Buffer.from(masterSvg))
    .resize(180, 180)
    .png({ quality: 100, compressionLevel: 8, palette: false })
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✓ public/apple-touch-icon.png generated');

  console.log('All image assets generated successfully!');
}

generateAll().catch((err) => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
