const path = require('path');
// Detects language from file extension, adds to markdown code block

const filenameLangMap = {
  '.ts': 'typescript',
  '.tsx': 'tsx',
  '.js': 'javascript',
  '.jsx': 'jsx',
  '.scss': 'scss',
  '.css': 'css',
  '.html': 'html',
};

module.exports = function (source) {
  const uint8array = new TextEncoder().encode(source);
  const str = new TextDecoder().decode(uint8array);
  // Remove jsdoc comments
  const jsdocRegex = /\/\*\*[\s\S]*?\*\//g;
  const strWithoutJsdoc = str.replace(jsdocRegex, '');
  const fileExtension = path.extname(this.resourcePath);
  const lang = filenameLangMap[fileExtension];
  // console.log('\n\nlang', lang);
  const wrapped = `\`\`\`${lang}
${strWithoutJsdoc}\`\`\`
`;
  // console.log('\n\nwrapped', wrapped);
  return wrapped;
};

module.exports.raw = true;
