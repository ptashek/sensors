
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const path = require('path');
const fs = require('fs');
const baseConfig = require('./development.webpack');

const packageInfo = JSON.parse(fs.readFileSync('./package.json'));

module.exports = Object.assign(baseConfig, { mode: 'production', });
