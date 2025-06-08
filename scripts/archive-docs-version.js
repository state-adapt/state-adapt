const fs = require('fs-extra');
const path = require('path');

const version = process.argv[2];
if (!version) {
  console.error('Please provide a version number.');
  process.exit(1);
}

const versionDashed = version.replace(/\./g, '-');
const srcPath = path.resolve(__dirname, '../../state-adapt.github.io');
const destPath = path.resolve(srcPath, `./versions/${versionDashed}`);

// Ensure the destination directory exists
fs.ensureDirSync(destPath);

// Move files from source to destination
fs.readdirSync(srcPath)
  .filter(file => !file.startsWith('.') && !['versions'].includes(file))
  .forEach(file => {
    fs.moveSync(path.join(srcPath, file), path.join(destPath, file), { overwrite: true });
  });

console.log(`Moved files to ${destPath}`);

// Replace <base href="/"> with <base href="/versions/${versionDashed}/">
const indexHtmlPath = path.join(destPath, 'index.html');
const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
fs.writeFileSync(
  indexHtmlPath,
  indexHtml.replace('<base href="/">', `<base href="/versions/${versionDashed}/">`),
);

console.log(`Updated ${indexHtmlPath} with new base href`);

// Add version to /versions/index.csv
const versionsIndexPath = path.join(destPath, '../index.csv');
const versionsIndex = fs.readFileSync(versionsIndexPath, 'utf8');
fs.writeFileSync(versionsIndexPath, versionsIndex + `\n${version},${versionDashed}`);

console.log(`Updated ${versionsIndexPath} with new version ${version},${versionDashed}`);
