const fs = require('fs');
const path = require('path');

// Icon sizes for PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create placeholder PNG icons (base64 encoded 1x1 pixel)
const createPlaceholderIcon = (size) => {
  // Simple colored square as placeholder
  const canvas = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="#3b82f6"/>
    <circle cx="${size/2}" cy="${size/2}" r="${size/3}" fill="#ffffff"/>
    <text x="${size/2}" y="${size/2 + size/8}" font-family="Arial" font-size="${size/8}" fill="#3b82f6" text-anchor="middle" font-weight="bold">Q</text>
  </svg>`;
  
  return canvas;
};

// Generate icons
iconSizes.forEach(size => {
  const iconContent = createPlaceholderIcon(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(__dirname, '..', 'public', 'icons', filename);
  
  fs.writeFileSync(filepath, iconContent);
  console.log(`Generated ${filename}`);
});

// Create shortcut icons
const shortcuts = [
  { name: 'book', color: '#10b981', text: '📝' },
  { name: 'bookings', color: '#f59e0b', text: '📋' },
  { name: 'dashboard', color: '#8b5cf6', text: '📊' }
];

shortcuts.forEach(shortcut => {
  const iconContent = `<svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
    <rect width="96" height="96" fill="${shortcut.color}" rx="16"/>
    <text x="48" y="60" font-size="32" text-anchor="middle">${shortcut.text}</text>
  </svg>`;
  
  const filename = `shortcut-${shortcut.name}.svg`;
  const filepath = path.join(__dirname, '..', 'public', 'icons', filename);
  
  fs.writeFileSync(filepath, iconContent);
  console.log(`Generated ${filename}`);
});

console.log('✅ All PWA icons generated successfully!');
console.log('📝 Note: These are SVG placeholders. For production, convert to PNG using:');
console.log('   - ImageMagick: convert icon.svg -resize 192x192 icon-192x192.png');
console.log('   - Online tools: https://convertio.co/svg-png/');
console.log('   - Design tools: Figma, Sketch, or Canva');
