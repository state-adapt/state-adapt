const appName = process.argv[2];
const fs = require('fs');

const styles = fs.readFileSync(`../dist/apps/${appName}/styles.css`, 'utf-8');
fs.writeFileSync(`../apps/${appName}/src/styles.scss`, styles);
