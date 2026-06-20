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

  // Replace >${ with >LKR ${
  content = content.replace(/>\$\{/g, '>LKR ${');
  content = content.replace(/>\$\</g, '>LKR <');
  content = content.replace(/\(\$\)/g, '(LKR)');
  content = content.replace(/- \$\{/g, '- LKR ${');
  content = content.replace(/@ \$\{/g, '@ LKR ${');
  content = content.replace(/\$\$\{/g, 'LKR ${');
  content = content.replace(/ \$\{/g, ' LKR ${');
  content = content.replace(/'\$(.*?)'/g, "'LKR $1'");

  // Fix up specific items in CostConfig / Estimation
  content = content.replace(/Unit Cost \(\$\)/g, 'Unit Cost (LKR)');
  content = content.replace(/Total \(\$\)/g, 'Total (LKR)');
  content = content.replace(/Manual Override \(\$\)/g, 'Manual Override (LKR)');
  content = content.replace(/>\$/g, '>LKR ');

  fs.writeFileSync(f, content);
});
console.log('Fixed twice');
