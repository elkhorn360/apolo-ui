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

  // Replace >$</span> with >LKR</span>
  content = content.replace(/>\$\</g, '>LKR <');

  // Replace ($) with (LKR)
  content = content.replace(/\(\$\)/g, '(LKR)');

  // Replace - ${ with - LKR ${
  content = content.replace(/- \$\{/g, '- LKR ${');

  // Replace @ ${ with @ LKR ${
  content = content.replace(/@ \$\{/g, '@ LKR ${');

  // Replace $${ with LKR ${
  content = content.replace(/\$\$\{/g, 'LKR ${');

  // Replace leading spaces then ${ with spaces then LKR ${
  content = content.replace(/^(\s+)\$\{/gm, '$1LKR ${');

  // Edge cases
  content = content.replace(/Override \(\$\)/g, 'Override (LKR)');
  content = content.replace(/Unit Cost \(\$\)/g, 'Unit Cost (LKR)');
  content = content.replace(/Total \(\$\)/g, 'Total (LKR)');

  fs.writeFileSync(f, content);
});
console.log('Fixed');
