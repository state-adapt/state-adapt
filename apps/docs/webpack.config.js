const path = require('path');

module.exports = {
  module: {
    rules: [
      {
        test: /\.md$/i,
        use: ['raw-loader', 'md-loader'],
      },
    ],
  },
  resolveLoader: {
    alias: {
      'md-loader': path.resolve(__dirname, './md-loader.js'),
      'snippet-loader': path.resolve(__dirname, './snippet-loader.js'),
    },
  },
};
