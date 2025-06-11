const path = require('path');
const marked = require('marked');
const fs = require('fs');
const routesJson = fs.readFileSync(
  path.resolve(__dirname, './src/app/docs-routes.json'),
  'utf8',
);
const routes = JSON.parse(routesJson).routes;

const renderer = {
  list: (text, ordered, ...rest) => {
    // string, boolean
    const isNested = text.includes('[nested]');
    const orderedClassName = ordered ? 'ordered' : 'unordered';
    const className = isNested ? 'nested' : orderedClassName;
    return `<ul class="cds--list--${className}">${text.replace('[nested]', '')}</ul>`;
  },
  listitem: text => `<li class="cds--list__item">${text}</li>`, // string
  // heading: (text: string, level: number) => text;
  link: (href, title, text) => {
    //(href: string, title: string, text: string)
    const isLocalLink = /^\//.test(href);

    let hrefContent;
    if (isLocalLink) {
      hrefContent = `javascript:document.dispatchEvent(new CustomEvent('routeTo', {detail: '${href}'})); void(0)`;
    } else {
      hrefContent = href;
    }

    return `<a href="${hrefContent}">${text}</a>`;
  },
  image: (href, title, text) => {
    // (href: string, title: string, text: string)
    const [newHref, ...rest] = href.split('|');
    const restAttrs = rest
      .map(attr => {
        const [key, value] = attr.split('=');
        return `${key}="${value}"`;
      })
      .join(' ');
    return `<img src="${newHref}" alt="${text}" ${restAttrs}/>`;
  },
};

marked.use({ renderer });

// This loader will be used on all .md files, but might have includes that point to any file type
// Read file
// Convert to string
// Find all include statements
// For each
//   Read file
//   Convert to string
//   If it's a markdown file, recurse
//   If it's a ts or tsx file, find the jsdoc comment that contains the string enclosed in ``, and if that string matches the token specified in the include statement, recurse on that jsdoc comment
//   Example include statement: <!-- include: ./my-component.tsx#myToken -->
//   Example jsdoc comment: /**
//     * ## ![StateAdapt](https://miro.medium.com/max/4800/1*qgM6mFM2Qj6woo5YxDMSrA.webp|width=14) `myToken`
//     *
//     * This is a description of my component.
//     * ```
//     * <MyComponent />
//     * ```
//     */

module.exports = function (source) {
  const uint8array = new TextEncoder().encode(source);
  const str = new TextDecoder().decode(uint8array);
  const libIncludePath = path.dirname(this.resourcePath);
  const libRelativePath = getLibRelativePath('docs', libIncludePath);
  const included = insertIncludes(str, libIncludePath, libRelativePath);
  const parsed = marked.parse(included);
  return parsed;
};

// Used in comments (for intellisense)
const libsPath = '../libs/';
function getLibRelativePath(libRelativePath, importPath) {
  return importPath.includes(libsPath)
    ? importPath.substring(importPath.indexOf(libsPath) + libsPath.length)
    : libRelativePath;
}

// Used in TS
const stateAdaptPath = '@state-adapt/';
function getStateAdaptRelativePath(libRelativePath, importPath) {
  return importPath.includes(stateAdaptPath)
    ? importPath.substring(importPath.indexOf(stateAdaptPath) + stateAdaptPath.length)
    : libRelativePath;
}

module.exports.raw = true;
/**
 *
 * @param {string} str current docs string
 * @param {string} filePath path to the next file to include
 * @param {string} libRelativePath The relative path of the current file after the libs folder. include: '../../libs/my-lib/adapters' will be 'my-lib/adapters'
 * @returns {string} docs string with includes and links replaced
 */
function insertIncludes(str, filePath, libRelativePath) {
  //       /<!-- include: ($1 .*?)\.($2 md|ts|tsx)($3 #($4 .*?))? -->/;
  const includeRegex = /<!-- include: '(.*?)\.(md|ts|tsx)(#(.*?))?' -->/;
  let match;
  while ((match = includeRegex.exec(str))) {
    const newLibRelativePath = getLibRelativePath(libRelativePath, match[1]);
    const fileName = `${match[1]}.${match[2]}`;
    // console.log('fileName', fileName);
    // console.log('token', match[4]);
    const includeFilePath = path.resolve(filePath, fileName);
    let fileStr = fs.readFileSync(includeFilePath, 'utf8');
    if (match[2] === 'md') {
      str = str.replace(
        match[0],
        () => insertIncludes(fileStr, path.dirname(includeFilePath), newLibRelativePath), // Ignore $
      );
    } else if (['ts', 'tsx'].includes(match[2])) {
      // console.log('ts file');
      const tokensToImportsMap = getTokensToImportPathsMap(fileStr);
      // console.log('tokensToImportsMap', tokensToImportsMap);
      let jsdocResult;
      // Loop through jsdoc comments and find one that contains the token
      // regex that matches comments that start with /** and end with */
      const jsdocRegex = /\/\*\*([\s\S]*?)\*\//;
      let jsdocMatch;
      while ((jsdocMatch = jsdocRegex.exec(fileStr))) {
        // console.log('jsdocMatch', jsdocMatch);
        const jsdocStr = jsdocMatch[1];
        const tokenRegex = /(## )(.*?)`(.*?)`/;
        const tokenMatch = tokenRegex.exec(jsdocStr);
        // This is why we go through all the JSDoc comments
        tokensToImportsMap.set(tokenMatch[3], `./${fileName}`);
        if (tokenMatch && tokenMatch[3] === match[4]) {
          // Found the jsdoc comment that contains the token
          // Replace the include statement with the jsdoc comment
          // Recurse on the new string
          jsdocResult = jsdocStr.replace(tokenRegex, '$1`$3`');
        }
        fileStr = fileStr.replace(jsdocMatch[0], '');
      }
      // console.log('no more jsdoc comments');
      if (!jsdocResult) {
        throw new Error(`Could not find token ${match[4]} in file ${includeFilePath}`);
      }
      const replacementStr = jsdocResult
        ? insertIncludes(jsdocResult, path.dirname(includeFilePath), newLibRelativePath)
        : '';
      const replacementStrWithLinks = replaceLinks(
        replacementStr,
        newLibRelativePath,
        tokensToImportsMap,
      );
      str = str.replace(match[0], () => replacementStrWithLinks); // Ignore $
    }
  }
  return str;
}

/**
 * @param {string} str current docs string
 * @param {string} libRelativePath The relative path of the current file after the libs folder. include: '../../libs/my-lib/adapters' will be 'my-lib/adapters'
 * @param {Map<string, string>} tokensToImportsMap A map of tokens to their import paths
 * @returns {string} docs string with links replaced
 * @example
 * // returns [StateAdapt.adapt](/docs/core#StateAdapt.adapt)
 * replaceLinks('{@link StateAdapt.adapt}', 'core/adapters', new Map([['StateAdapt', '@state-adapt/core']]))
 *
 */
function replaceLinks(str, libRelativePath, tokensToImportsMap) {
  const linkRegex = /{@link (.*?)}/;
  let match;
  while ((match = linkRegex.exec(str))) {
    const token = match[1];
    const tokenParts = token.split('.'); // Like StateAdapt.adapt => stateadaptadapt
    const importPath =
      tokensToImportsMap.get(tokenParts[0]) || tokensToImportsMap.get(token);
    if (importPath) {
      const stateAdaptRelativePath = getStateAdaptRelativePath(
        libRelativePath,
        importPath,
      );
      const linkDocsRoute = routes.find(([libName]) =>
        stateAdaptRelativePath.startsWith(libName),
      )[1];

      const linkPath = `${linkDocsRoute}#${token.toLowerCase().replace(/\./g, '')}`;
      const linkText = getCodeText(match[1]);
      const linkMarkdown = `[${linkText}](${linkPath})`;
      str = str.replace(match[0], linkMarkdown);
    } else {
      str = str.replace(match[0], getCodeText(match[1]));
    }
  }
  return str;
}

function getCodeText(str) {
  return `\`${str}\``;
}

/**
 * Creates a map of tokens and import paths from a TypeScript file.
 *
 * @function
 * @param {string} code - The contents of a TypeScript file as a string.
 * @returns {Map<string, string>} A map with tokens as keys and import paths as values.
 *
 * @example
 * const code = `import { createAdapter, Adapter } from '@state-adapt/core';`;
 * const tokensToImportPaths = mapTokensToImportPaths(code);
 * console.log(tokensToImportPaths);
 * // Output: Map { 'createAdapter' => '@state-adapt/core', 'Adapter' => '@state-adapt/core' }
 */
function getTokensToImportPathsMap(code) {
  const importRegex = /import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]([^'"]+)['"]/g;
  const tokensToImportPaths = new Map();

  let match;
  while ((match = importRegex.exec(code)) !== null) {
    const tokens = match[1].split(',').map(token => token.trim());
    const importPath = match[2];

    tokens.forEach(token => {
      tokensToImportPaths.set(token, importPath);
    });
  }

  return tokensToImportPaths;
}
