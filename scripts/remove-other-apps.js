const appName = process.argv[2];
const fs = require('fs');
const rimraf = require('rimraf');

fs.readdirSync('../apps', {withFileTypes: true})
  .filter(dir => dir.isDirectory() && dir.name !== appName)
  .map(dir => dir.name)
  .forEach(dirName => rimraf('../apps/' + dirName, () => console.log('app removed: ', dirName)));
