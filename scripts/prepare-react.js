const appName = process.argv[2];
const fs = require('fs');
const rimraf = require('rimraf');

if (appName.includes('react')) {
  // Experimental React preparation
  rimraf('../angular.json', () => console.log('angular.json removed'));
  // rimraf('../package.json', () => console.log('package.json removed'));
}
