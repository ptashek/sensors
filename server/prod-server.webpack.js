const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const path = require('path');
const fs = require('fs');

const packageInfo = JSON.parse(fs.readFileSync('./package.json'));

module.exports = {
  context: process.cwd(),
  mode: 'production',
  target: 'node',
  entry: path.resolve(packageInfo.main),

  output: {
    path: path.resolve('./build'),
    filename: 'server.js',
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
    ],
  },

  resolve: {
    modules: ['src'],
  },

  externals: [nodeExternals()],

  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000,
    ignored: /node_modules/,
  }
};
