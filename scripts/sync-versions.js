const fs = require('fs');
const path = require('path');

// Take the version from the command line arguments
const newVersion = process.argv[2];
if (!newVersion) {
  console.error('Please provide a version number.');
  process.exit(1);
}

const libsDir = path.join(process.cwd(), 'libs');
const packages = fs.readdirSync(libsDir);

packages.forEach(pkg => {
  const pkgPath = path.join(libsDir, pkg, 'package.json');
  if (fs.existsSync(pkgPath)) {
    let fileContent = fs.readFileSync(pkgPath, 'utf-8');
    let lines = fileContent.split('\n');

    // Update the version for lines containing `@state-adapt/`
    lines = lines.map(line => {
      if (line.includes('@state-adapt/')) {
        return line.replace(
          /"@state-adapt\/([^:]+)": "[^"]+"/,
          `"@state-adapt/$1": "${newVersion}"`,
        );
      }
      return line;
    });

    // Join the lines back into a single string
    fileContent = lines.join('\n');

    // Write the updated content back to the package.json
    fs.writeFileSync(pkgPath, fileContent, 'utf-8');
    console.log(`Updated ${pkgPath}`);
  }
});
