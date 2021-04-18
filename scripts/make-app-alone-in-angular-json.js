const appName = process.argv[2];
const fs = require('fs');
console.log(`Making ${appName} alone in angular.json`);
const angularJson = fs.readFileSync('../angular.json', 'utf-8');
const angular = JSON.parse(angularJson);
angular.defaultProject = appName;
const appProject = angular.projects[appName];
angular.projects = {[appName]: appProject};
const newAngularJson = JSON.stringify(angular, null, '  ');
const originalPathRegex = new RegExp(`apps/${appName}/src/`, 'g')
const newAngularJsonWithWeirdPaths = newAngularJson.replace(originalPathRegex, 'src/')
fs.writeFileSync('../angular.json', newAngularJsonWithWeirdPaths);
