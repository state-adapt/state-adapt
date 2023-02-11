// Calls aggregate-cheat-sheet.js for each library in dist/ folder if it has a cheat sheet.
const { execSync } = require('child_process');
const { readdirSync, existsSync } = require('fs');
const { join } = require('path');

const libs = readdirSync(join(__dirname, '../dist/libs'));

libs.forEach(lib => {
  const cheatSheetPath = join(__dirname, `../dist/libs/${lib}/cheat-sheet.const.d.ts`);
  if (existsSync(cheatSheetPath)) {
    execSync(`node scripts/aggregate-cheat-sheet.js ${lib}`);
  } else {
    console.log(`Skipping ${lib} because it doesn't have a cheat sheet.`);
  }
});
