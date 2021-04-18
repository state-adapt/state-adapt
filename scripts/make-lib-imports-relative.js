const appName = process.argv[2];
const fs = require('fs');

const libsPath = '../libs';
const libNames = getChildFolderNames(libsPath);

libNames.forEach(libName => {
  const mainLibFolderName = `${libsPath}/${libName}/src/lib`;
  const fileNames = getChildFileNames(mainLibFolderName);
  replaceGlobalImports(mainLibFolderName, fileNames, 4)
});

const appSrc = `../apps/${appName}/src`;
const appSrcFileNames = getChildFileNames(appSrc);
replaceGlobalImports(appSrc, appSrcFileNames, 3);

const appSrcApp = `${appSrc}/app`;
const appSrcAppFileNames = getChildFileNames(appSrcApp);
replaceGlobalImports(appSrcApp, appSrcAppFileNames, 4);

function replaceGlobalImports(basePath, fileNames, importDepth) {
  fileNames.forEach(fileName => {
    const filePath = `${basePath}/${fileName}`;
    const fileContents = fs.readFileSync(filePath, 'utf-8');
    const backoutStr = new Array(importDepth).fill('../').join('');
    const newFileContents = fileContents.replace(/@state-adapt\/(.*)'/g, backoutStr + "libs/$1/src'")
    if (newFileContents !== fileContents) {
      fs.writeFile(filePath, newFileContents, () => console.log('Made imports relative in ' + filePath));
    }
  })
}

function getChildFileNames(path) {
  return fs.readdirSync(path, {withFileTypes: true})
  .filter(dir => dir.isFile())
  .map(dir => dir.name);
}

function getChildFolderNames(path) {
  return fs.readdirSync(libsPath, {withFileTypes: true})
    .filter(dir => dir.isDirectory())
    .map(dir => dir.name);
}
