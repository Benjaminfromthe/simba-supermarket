const { execSync } = require('child_process');
try {
  execSync('git checkout src/data/simba_products.json');
  console.log('Restored');
} catch (e) {
  console.error(e.message);
}
