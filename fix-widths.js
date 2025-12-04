const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  // Replace any p-* or px-*/py-* padding with generous responsive padding
  // Only target the main container divs (ones with w-full)
  
  content = content.replace(
    /className="([^"]*w-full[^"]*?)(?:p-\d+|px-\d+|py-\d+)([^"]*)"/g,
    (match, before, after) => {
      // Remove all padding classes
      let cleaned = (before + after)
        .replace(/\bp-\d+\b/g, '')
        .replace(/\bpx-\d+\b/g, '')
        .replace(/\bpy-\d+\b/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      // Add generous responsive padding
      return `className="${cleaned} px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24 2xl:px-32 py-10"`;
    }
  );
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated padding: ${filePath}`);
    return true;
  }
  
  return false;
}

function walkDir(dir, level = 0) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      console.log(`${'  '.repeat(level)}📁 ${file}/`);
      walkDir(filePath, level + 1);
    } else if (file.endsWith('.tsx')) {
      const changed = processFile(filePath);
      if (changed) {
        console.log(`${'  '.repeat(level)}  ✅ ${file}`);
      }
    }
  });
}

console.log('🔧 Replacing p-6 with GENEROUS responsive padding...\n');
console.log('📂 Processing src/pages/');
walkDir(path.join(__dirname, 'src', 'pages'));
console.log('\n✅ Done! Replaced all p-* with px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24 2xl:px-32 py-10');