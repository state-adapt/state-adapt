const appName = process.argv[2];
const fs = require('fs');
const stackblitzJson = fs.readFileSync(`../apps/${appName}/stackblitz.json`, 'utf-8');
const stackblitz = JSON.parse(stackblitzJson || '{}');
const packageJson = fs.readFileSync('../package.json', 'utf-8');
const package = JSON.parse(packageJson);
package.dependencies = (stackblitz.dependencies || [])
  .reduce((dependencies, depName) => ({
    ...dependencies, [depName]: package.dependencies[depName] || 'latest', // For @state-adapt dependencies
  }), {});
package.devDependencies = {};
const newPackageJson = JSON.stringify(package, null, '  ');
fs.writeFileSync('../package.json', newPackageJson);
