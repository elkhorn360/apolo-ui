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

  // use a function callback so $$ isn't parsed as capture group
  content = content.replace(/>\$\{/g, () => '>LKR ${');
  content = content.replace(/>\$\</g, () => '>LKR <');
  content = content.replace(/\(\$\)/g, () => '(LKR)');
  content = content.replace(/- \$\{/g, () => '- LKR ${');
  content = content.replace(/@ \$\{/g, () => '@ LKR ${');
  content = content.replace(/\$\$\{/g, () => 'LKR ${');
  content = content.replace(/^(\s+)\$\{/gm, (match, p1) => p1 + 'LKR ${');
  content = content.replace(/Unit Cost \(\$\)/g, () => 'Unit Cost (LKR)');
  content = content.replace(/Total \(\$\)/g, () => 'Total (LKR)');
  content = content.replace(/Manual Override \(\$\)/g, () => 'Manual Override (LKR)');
  content = content.replace(/>\$/g, () => '>LKR ');
  content = content.replace(/Base: \$\$\{/g, () => 'Base: LKR ${');
  content = content.replace(/ \$/g, () => ' LKR '); // generic fallback for space$

  fs.writeFileSync(f, content);
});
console.log('Fixed for real');
