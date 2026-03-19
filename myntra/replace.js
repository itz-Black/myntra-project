const fs = require('fs');
const files = [
  'app/orders.tsx', 'app/checkout.tsx', 'app/(tabs)/wishlist.tsx',
  'app/(tabs)/index.tsx', 'app/(tabs)/categories.tsx', 'app/(tabs)/bag.tsx', 'app/(tabs)/profile.tsx'
];
files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    let changed = false;
    
    if (content.includes('http://localhost:5000') || content.includes('https://myntra-clone-xj36.onrender.com')) {
      if (!content.includes('import { LOCAL_API')) {
        content = "import { LOCAL_API, REMOTE_API } from \"@/constants/api\";\n" + content;
      }
      content = content.replace(/http:\/\/localhost:5000/g, '${LOCAL_API}');
      content = content.replace(/https:\/\/myntra-clone-xj36.onrender.com/g, '${REMOTE_API}');
      changed = true;
    }
    
    if (changed) fs.writeFileSync(f, content);
  }
});
console.log('Done replacing api urls');
