const Module = require('node:module');
const path = require('node:path');

const resolveFilename = Module._resolveFilename;
Module._resolveFilename = function (request, parent, isMain, options) {
  if (request === '@state-adapt/spaghetti-core')
    return path.resolve('dist/libs/spaghetti-core/src/index.js');
  return resolveFilename.call(this, request, parent, isMain, options);
};
