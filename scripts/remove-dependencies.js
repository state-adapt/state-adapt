const fs = require('fs');
const packageJson = fs.readFileSync('../package.json', 'utf-8');
const package = JSON.parse(packageJson);
package.dependencies = {
  '@angular/animations': '^11.2.10',
  '@angular/common': '^11.2.10',
  '@angular/compiler': '^11.2.10',
  '@angular/core': '^11.2.10',
  '@angular/forms': '^11.2.10',
  '@angular/platform-browser': '^11.2.10',
  '@angular/platform-browser-dynamic': '^11.2.10',
  '@angular/router': '^11.2.10',
  '@carbon/icons-angular': '^12.0.0',
  '@state-adapt/core': '^0.35.0',
  'carbon-components': '^10.33.0',
  'carbon-components-angular': '^4.48.1',
  'lodash': '^4.17.21',
  'reselect': '^4.0.0',
  'rxjs': '^6.6.7',
  'zone.js': '^0.11.4',
};
package.devDependencies = {};
const newPackageJson = JSON.stringify(package, null, '  ');
fs.writeFileSync('../package.json', newPackageJson);
