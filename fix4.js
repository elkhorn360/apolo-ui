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

  // Replace literal dollars:
  content = content.replace(/>\$/g, '>LKR ');
  content = content.replace(/\(\$\)/g, '(LKR)');
  content = content.replace(/\- \$/g, '- LKR ');
  content = content.replace(/@ \$/g, '@ LKR ');
  content = content.replace(/ \$/g, ' LKR ');
  
  // Replace $ followed by {
  // We want to KEEP the { but replace the $ with LKR
  // so $ { -> LKR { 
  // Wait, in JS template literals it is ${, but in JSX it is {
  // No, in JSX it is literally >${value} -> >LKR {value} ? No, wait.
  // In JSX, interpolation is {value}. 
  // If the user wrote `>${value.toFixed(2)}`, they meant literal '$' then JS variable `value.toFixed(2)`.
  // So replacing `>${` with `>LKR {` is perfectly correct for JSX!
  content = content.replace(/>\$\{/g, '>LKR {');
  
  // Same for @ ${ -> @ LKR {
  content = content.replace(/@ \$\{/g, '@ LKR {');
  
  // Same for spaces then ${
  content = content.replace(/(\s+)\$\{/g, '$1LKR {');

  // Same for - ${
  content = content.replace(/- \$\{/g, '- LKR {');

  // But for template literals like `Base: $${val}`
  // > `Base: $${val}` means literal `$` then interpolated `${val}`.
  // We want `Base: LKR ${val}`. E.g. replace `$${` with `LKR ${`.
  content = content.replace(/\$\$\{/g, 'LKR ${');

  // But some of them are already `>LKR ${` (if partially modified)
  // Let's just do a brute force search and replace for literal patterns seen in grep:
  
  fs.writeFileSync(f, content);
});
console.log('Fixed brute');
