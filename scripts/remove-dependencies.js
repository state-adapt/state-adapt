const fs = require('fs');
const packageJson = fs.readFileSync('../package.json', 'utf-8');
const package = JSON.parse(packageJson);
package.dependencies = {};
package.devDependencies = {};
const newPackageJson = JSON.stringify(package, null, '  ');
fs.writeFileSync('../package.json', newPackageJson);
