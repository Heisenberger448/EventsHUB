const fs = require('fs');
const code = fs.readFileSync('app/(org-admin)/[orgSlug]/layout.tsx', 'utf8');
const lines = code.split('\n');

// Look for useState< type patterns that SWC might misparse as JSX
for (let i = 87; i < 443; i++) {
  const line = lines[i];
  if (line.includes('<') && !line.trim().startsWith('<') && !line.trim().startsWith('{') && !line.trim().startsWith('//')) {
    if (line.includes('useState<') || line.includes('=>') || line.includes('<=')) continue;
    console.log('Line ' + (i+1) + ': ' + line.trim().substring(0, 120));
  }
}

// Also look for any issues with string escaping or template literals
console.log('\n--- Checking for template literals ---');
for (let i = 87; i < 443; i++) {
  if (lines[i].includes('`')) {
    console.log('Line ' + (i+1) + ': ' + lines[i].trim().substring(0, 120));
  }
}

// Check for type assertions/casts with < that SWC might parse as JSX
console.log('\n--- Checking for type assertions ---');
for (let i = 87; i < 443; i++) {
  const match = lines[i].match(/[^<]<[A-Z]/);
  if (match && !lines[i].includes('useState') && !lines[i].includes('//')) {
    console.log('Line ' + (i+1) + ': ' + lines[i].trim().substring(0, 120));
  }
}
