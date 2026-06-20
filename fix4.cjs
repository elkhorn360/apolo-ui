const fs = require('fs');
const files = [
  'src/pages/UtilityRates.jsx',
  'src/pages/RawMaterials.jsx',
  'src/pages/ManpowerConfig.jsx',
  'src/pages/CostEstimation.jsx',
  'src/pages/CostConfig.jsx'
];
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');

  // JSX variable substitution {value} with a literal $ in front translates to >${value}
  // To replace $ with LKR, >${value} becomes >LKR {value}
  content = content.replace(/>\$\{/g, '>LKR {');
  content = content.replace(/ \$\{/g, ' LKR {');
  content = content.replace(/- \$\{/g, '- LKR {');
  content = content.replace(/@ \$\{/g, '@ LKR {');
  content = content.replace(/(\s+)\$\{/g, '$1LKR {');
  
  // Template Literal string interpolation `Base: $${val}` becomes `Base: LKR ${val}`
  content = content.replace(/\$\$\{/g, 'LKR ${');
  
  // Literal labels
  content = content.replace(/>\$\</g, '>LKR <');
  content = content.replace(/ \$/g, ' LKR ');
  content = content.replace(/>\$/g, '>LKR ');

  content = content.replace(/\(\$\)/g, '(LKR)');
  content = content.replace(/- \$/g, '- LKR ');
  content = content.replace(/@ \$/g, '@ LKR ');

  fs.writeFileSync(f, content);
});
console.log('Fixed for real real');
