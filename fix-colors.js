const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  // Replace white headings (h1, h2, h3) with pink
  // Look for patterns like <h1 className="...text-white..." or text-gray-100
  
  // Pattern 1: Headings with text-white
  content = content.replace(
    /(<h[1-3][^>]*className="[^"]*?)text-white([^"]*?")/g,
    '$1text-pink-400$2'
  );
  
  // Pattern 2: Headings with text-gray-100
  content = content.replace(
    /(<h[1-3][^>]*className="[^"]*?)text-gray-100([^"]*?")/g,
    '$1text-pink-400$2'
  );
  
  // Pattern 3: Large text that's white (likely titles)
  content = content.replace(
    /(text-\d+xl[^"]*?)text-white/g,
    '$1text-pink-400'
  );
  
  content = content.replace(
    /(text-\d+xl[^"]*?)text-gray-100/g,
    '$1text-pink-400'
  );
  
  // Pattern 4: font-bold text that's white (likely section titles)
  content = content.replace(
    /(font-bold[^"]*?)text-white/g,
    '$1text-pink-400'
  );
  
  content = content.replace(
    /(font-bold[^"]*?)text-gray-100/g,
    '$1text-pink-400'
  );
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Made headings pink: ${filePath}`);
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

console.log('🎨 Making all headings and titles PINK...\n');
console.log('📂 Processing src/pages/writing/');
walkDir(path.join(__dirname, 'src', 'pages', 'writing'));
console.log('\n✅ Done! All titles are now pink 💖');