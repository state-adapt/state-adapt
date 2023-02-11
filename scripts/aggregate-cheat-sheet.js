// Description: This script aggregates the examples from the JSDoc comments
// in the library's source files and writes them to the cheat sheet file.
//
// Usage: node scripts/aggregate-cheat-sheet.js <lib-name>
// Example: node scripts/aggregate-cheat-sheet.js core

const fs = require('fs');
const path = require('path');

// get the library name from the arguments
const libName = process.argv[2];

// get the library's index.ts file
// Example: libs/core/src/index.ts
const libIndexFile = path.join(__dirname, `../libs/${libName}/src/index.ts`);
// read the file
const libIndexFileContents = fs.readFileSync(libIndexFile, 'utf8');
// get the exports
const exportPaths = getExportPaths(libIndexFileContents);
// aggregate each export's file contents into a single string
const examples =
  '```' +
  exportPaths
    .map(exportPath => {
      // get the export's file path
      // Example: libs/core/src/lib/adapters/create-adapter.function.ts
      const exportFilePath = path.join(
        __dirname,
        `../libs/${libName}/src`,
        `${exportPath}.ts`,
      );
      // read the file
      const exportFileContents = fs.readFileSync(exportFilePath, 'utf8');
      return getExamplesFromJSDocComments(exportFileContents);
    })
    .filter(str => str)
    .join('\n') +
  '```';

// write the examples to the cheat sheet declaration file's jsdoc comment
// Example: dist/libs/core/src/cheat-sheet.const.d.ts
const cheatSheetFilePath = path.join(
  __dirname,
  `../dist/libs/${libName}/cheat-sheet.const.d.ts`,
);
// read the file
const cheatSheetFileContents = fs.readFileSync(cheatSheetFilePath, 'utf8');
// replace the examples in the file
const newCheatSheetFileContents = cheatSheetFileContents.replace(
  /\/\*\*([\s\S]*?)\*\//,
  () => `/**\n${examples}\n*/`,
);
// write the file
fs.writeFileSync(cheatSheetFilePath, newCheatSheetFileContents);

// implmentation of getExportPaths
function getExportPaths(libIndexFileContents) {
  // get the exports
  let exports = libIndexFileContents
    // split the file into lines
    .split('\n')
    // filter out the lines that don't export anything
    .filter(line => line.includes('export'))
    // map the lines to the exported names
    .map(line => {
      // get the export path
      // Example: export * from './lib/adapters/create-adapter.function';
      const exportPath = line.match(/from '(.*)'/)[1];
      return exportPath;
    });
  return exports;
}

// implementation of getExamplesFromJSDocComments
function getExamplesFromJSDocComments(exportFileContents) {
  // get the examples from jsdoc comments
  // Example:
  // #### Example: Here's an example
  // ```ts
  // const adapter = createAdapter();
  // ```
  const regex = /#### Example:[\s\S]*?```(?<lang>\w+)([\s\S]*?)```/;
  let examples = '';
  let match;
  while ((match = regex.exec(exportFileContents))) {
    // get the example snippet
    const example = match[2];
    examples += example;
    // remove the example from the file contents
    exportFileContents = exportFileContents.replace(match[0], '');
  }

  return examples;
}
