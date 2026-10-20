import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generateScreenshots() {
  console.log('Generating PWA screenshots...');

  // Desktop screenshot (wide, 1280x720)
  const desktopSvg = `
  <svg width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">
    <rect width="1280" height="720" fill="#faf9f6"/>
    <!-- Top header -->
    <rect width="1280" height="80" fill="#ffffff"/>
    <line x1="0" y1="80" x2="1280" y2="80" stroke="#e7e5e4" stroke-width="1"/>
    <!-- Logo badge -->
    <rect x="40" y="16" width="48" height="48" rx="14" fill="#881337"/>
    <text x="104" y="44" font-family="serif" font-size="22" font-weight="bold" fill="#1c1917">DermEsthetic <tspan font-family="sans-serif" font-size="14" fill="#881337" font-weight="600">PRO</tspan></text>
    <text x="104" y="62" font-family="sans-serif" font-size="12" fill="#78716c">Diagnostic Clinique Visage &amp; Corps · Toxicologie INCI</text>
    <!-- Nav tabs -->
    <rect x="460" y="20" width="480" height="40" rx="12" fill="#f5f5f4"/>
    <rect x="464" y="24" width="150" height="32" rx="8" fill="#ffffff"/>
    <text x="480" y="45" font-family="sans-serif" font-size="12" font-weight="bold" fill="#1c1917">Scanner &amp; INCI</text>
    <text x="635" y="45" font-family="sans-serif" font-size="12" fill="#78716c">Diagnostic Peau</text>
    <text x="765" y="45" font-family="sans-serif" font-size="12" fill="#78716c">Guide Actifs</text>
    <text x="860" y="45" font-family="sans-serif" font-size="12" fill="#78716c">Clientes</text>
    <!-- Main content card -->
    <rect x="40" y="110" width="1200" height="570" rx="20" fill="#ffffff" stroke="#e7e5e4" stroke-width="1"/>
    <rect x="70" y="140" width="360" height="510" rx="16" fill="#fcfbf9" stroke="#f5f5f4" stroke-width="1"/>
    <!-- Camera view simulation -->
    <rect x="90" y="160" width="320" height="240" rx="12" fill="#1c1917"/>
    <line x1="110" y1="280" x2="390" y2="280" stroke="#f43f5e" stroke-width="2"/>
    <text x="190" y="270" font-family="sans-serif" font-size="12" fill="#ffffff" font-weight="bold">SCAN DU CODE-BARRE</text>
    <!-- Right side analysis -->
    <rect x="460" y="140" width="750" height="510" rx="16" fill="#ffffff"/>
    <text x="470" y="180" font-family="serif" font-size="28" font-weight="bold" fill="#1c1917">Sérum Éclat &amp; Régénération Barrière</text>
    <rect x="470" y="200" width="110" height="26" rx="13" fill="#ecfdf5"/>
    <text x="485" y="218" font-family="sans-serif" font-size="12" font-weight="bold" fill="#047857">SCORE : 94/100 (SÛR)</text>
    <rect x="470" y="245" width="730" height="120" rx="12" fill="#fdf2f8" stroke="#fbcfe8" stroke-width="1"/>
    <text x="490" y="280" font-family="sans-serif" font-size="15" font-weight="bold" fill="#881337">Actifs Clés Identifiés : Niacinamide 5%, Acide Hyaluronique, Centella</text>
    <text x="490" y="310" font-family="sans-serif" font-size="13" fill="#701a75">0 perturbateur endocrinien détecté · Convient aux femmes enceintes et peaux sensibles</text>
  </svg>
  `;

  await sharp(Buffer.from(desktopSvg))
    .png()
    .toFile('public/screenshot-desktop.png');
  console.log('Created public/screenshot-desktop.png');

  // Mobile screenshot (narrow, 720x1280)
  const mobileSvg = `
  <svg width="720" height="1280" viewBox="0 0 720 1280" xmlns="http://www.w3.org/2000/svg">
    <rect width="720" height="1280" fill="#faf9f6"/>
    <!-- Top Bar -->
    <rect width="720" height="90" fill="#ffffff"/>
    <line x1="0" y1="90" x2="720" y2="90" stroke="#e7e5e4" stroke-width="1"/>
    <rect x="24" y="20" width="50" height="50" rx="14" fill="#881337"/>
    <text x="90" y="52" font-family="serif" font-size="22" font-weight="bold" fill="#1c1917">DermEsthetic <tspan font-family="sans-serif" font-size="14" fill="#881337" font-weight="600">PRO</tspan></text>
    <!-- Card Scanner -->
    <rect x="24" y="120" width="672" height="420" rx="20" fill="#1c1917"/>
    <line x1="60" y1="330" x2="660" y2="330" stroke="#f43f5e" stroke-width="3"/>
    <text x="240" y="315" font-family="sans-serif" font-size="16" fill="#ffffff" font-weight="bold">SCANNER LE CODE-BARRE</text>
    <!-- Result Card -->
    <rect x="24" y="560" width="672" height="680" rx="20" fill="#ffffff" stroke="#e7e5e4" stroke-width="1"/>
    <text x="50" y="615" font-family="serif" font-size="24" font-weight="bold" fill="#1c1917">Bilan Peau &amp; Toxicologie INCI</text>
    <rect x="50" y="640" width="140" height="32" rx="16" fill="#ecfdf5"/>
    <text x="70" y="662" font-family="sans-serif" font-size="14" font-weight="bold" fill="#047857">Formule Propre</text>
    <rect x="50" y="700" width="620" height="150" rx="14" fill="#fdf2f8" stroke="#fbcfe8" stroke-width="1"/>
    <text x="70" y="740" font-family="sans-serif" font-size="16" font-weight="bold" fill="#881337">Diagnostic Cabine Automatisé</text>
    <text x="70" y="775" font-family="sans-serif" font-size="13" fill="#701a75">Protocoles de soins visage et corps adaptés au type de peau.</text>
  </svg>
  `;

  await sharp(Buffer.from(mobileSvg))
    .png()
    .toFile('public/screenshot-mobile.png');
  console.log('Created public/screenshot-mobile.png');
}

generateScreenshots().catch(console.error);
