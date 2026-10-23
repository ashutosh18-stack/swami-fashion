const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\ASUS\\.gemini\\antigravity-ide\\brain\\ea16dc97-e688-48ba-8589-096c136ee0d2';
const frontUploads = path.join(__dirname, 'frontend', 'public', 'uploads');
const backUploads = path.join(__dirname, 'backend', 'uploads');

fs.mkdirSync(frontUploads, { recursive: true });
fs.mkdirSync(backUploads, { recursive: true });

const mapping = {
  'mens_casual_shirt_1792688316499.jpg': 'mens_casual_shirt.jpg',
  'mens_polo_tshirt_1792688340600.jpg': 'mens_polo_tshirt.jpg',
  'mens_denim_jeans_1792688376731.jpg': 'mens_denim_jeans.jpg',
  'mens_chino_cargo_1792688397612.jpg': 'mens_chino_cargo.jpg',
  'mens_check_shirt_1792688417454.jpg': 'mens_check_shirt.jpg',
  'mens_hero_banner_1792688442947.jpg': 'mens_hero_banner.jpg',
};

for (const [srcName, destName] of Object.entries(mapping)) {
  const srcPath = path.join(srcDir, srcName);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, path.join(frontUploads, destName));
    fs.copyFileSync(srcPath, path.join(backUploads, destName));
    console.log(`Copied ${destName} successfully.`);
  } else {
    console.error(`Missing ${srcPath}`);
  }
}
