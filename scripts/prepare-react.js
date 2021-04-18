const appName = process.argv[2];
const fs = require('fs');
const rimraf = require('rimraf');

if (appName.includes('react')) {
  // Experimental React preparation
  rimraf('../angular.json', () => console.log('angular.json removed'));
  const appSrc = `../apps/${appName}/src`;
  const appSrcFiles = fs.readdirSync(appSrc).map(dir => dir.name);
  appSrcFiles.forEach(file => {
    const oldPath = `${appSrc}/${file}`;
    const newPath = `../${file}`;
    fs.rename(oldPath, newPath, () => console.log(`Moved ${oldPath} => ${newPath}`));
  })
}
