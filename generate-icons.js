const sharp = require('./shohnaat-backend/node_modules/sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'frontend', 'public');

// SVG template for Shohnaat Icon
const createSvgIcon = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2563eb"/>
      <stop offset="100%" stop-color="#1d4ed8"/>
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#60a5fa"/>
      <stop offset="100%" stop-color="#93c5fd"/>
    </linearGradient>
  </defs>
  <!-- Background with rounded corners -->
  <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="url(#blueGrad)"/>
  
  <!-- Sleek Package & Fast Wing Glyph -->
  <g transform="translate(${size * 0.2}, ${size * 0.2}) scale(${size / 100 * 0.6})">
    <!-- Isometric Cube / Fast Parcel -->
    <path d="M 50 15 L 85 33 L 50 51 L 15 33 Z" fill="url(#accentGrad)" opacity="0.95"/>
    <path d="M 15 33 L 50 51 L 50 85 L 15 67 Z" fill="#ffffff" opacity="0.85"/>
    <path d="M 85 33 L 50 51 L 50 85 L 85 67 Z" fill="#ffffff" opacity="0.95"/>
    <!-- Velocity lines -->
    <path d="M 10 45 L 2 45 M 8 55 L 0 55 M 12 65 L 4 65" stroke="#93c5fd" stroke-width="4" stroke-linecap="round"/>
  </g>
</svg>
`;

// SVG for OG Image (1200x630)
const createOgSvg = () => `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#1d4ed8"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bgGrad)"/>
  
  <!-- Glow effect -->
  <circle cx="950" cy="200" r="300" fill="#2563eb" opacity="0.15" filter="blur(60px)"/>
  <circle cx="200" cy="450" r="250" fill="#38bdf8" opacity="0.1" filter="blur(60px)"/>

  <!-- Logo Mark -->
  <g transform="translate(100, 140)">
    <rect width="90" height="90" rx="20" fill="url(#blueGrad)"/>
    <path d="M 45 22 L 70 35 L 45 48 L 20 35 Z" fill="#93c5fd"/>
    <path d="M 20 35 L 45 48 L 45 72 L 20 59 Z" fill="#ffffff" opacity="0.85"/>
    <path d="M 70 35 L 45 48 L 45 72 L 70 59 Z" fill="#ffffff"/>
  </g>

  <!-- Brand Typography -->
  <text x="210" y="200" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="52" fill="#ffffff" letter-spacing="-1">
    SHOHNAAT
  </text>
  <text x="510" y="200" font-family="system-ui, -apple-system, sans-serif" font-weight="400" font-size="52" fill="#60a5fa" letter-spacing="-1">
    LOGISTICS
  </text>

  <!-- Tagline -->
  <text x="100" y="320" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="44" fill="#f8fafc">
    International Courier &amp; Multi-Tenant Logistics Platform
  </text>
  
  <text x="100" y="380" font-family="system-ui, -apple-system, sans-serif" font-weight="400" font-size="24" fill="#94a3b8">
    Automated COD settlements, dynamic rate calculation, and live GPS parcel tracking.
  </text>

  <!-- Pills -->
  <g transform="translate(100, 440)">
    <rect width="200" height="46" rx="23" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
    <text x="100" y="29" font-family="system-ui, sans-serif" font-weight="700" font-size="16" fill="#38bdf8" text-anchor="middle">
      ✓ Real-Time Tracking
    </text>
  </g>
  <g transform="translate(320, 440)">
    <rect width="180" height="46" rx="23" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
    <text x="90" y="29" font-family="system-ui, sans-serif" font-weight="700" font-size="16" fill="#34d399" text-anchor="middle">
      ✓ USD ($) Ledger
    </text>
  </g>
  <g transform="translate(520, 440)">
    <rect width="200" height="46" rx="23" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
    <text x="100" y="29" font-family="system-ui, sans-serif" font-weight="700" font-size="16" fill="#fbbf24" text-anchor="middle">
      ✓ Field Rider PWA
    </text>
  </g>
</svg>
`;

async function generate() {
  console.log('🎨 Generating high-res brand icons...');

  // 1. icon-192.png
  await sharp(Buffer.from(createSvgIcon(192)))
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'));
  console.log('✓ Created icon-192.png');

  // 2. icon-512.png
  await sharp(Buffer.from(createSvgIcon(512)))
    .png()
    .toFile(path.join(publicDir, 'icon-512.png'));
  console.log('✓ Created icon-512.png');

  // 3. apple-touch-icon.png
  await sharp(Buffer.from(createSvgIcon(180)))
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✓ Created apple-touch-icon.png');

  // 4. favicon.ico / favicon.png
  await sharp(Buffer.from(createSvgIcon(32)))
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));
  console.log('✓ Created favicon.ico');

  // 5. og-image.png
  await sharp(Buffer.from(createOgSvg()))
    .png()
    .toFile(path.join(publicDir, 'og-image.png'));
  console.log('✓ Created og-image.png');

  console.log('🎉 All icons and open graph assets generated successfully!');
}

generate().catch(console.error);
