/* eslint-disable */
const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const baseConfig = require('./development.webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const packageInfo = JSON.parse(fs.readFileSync('./package.json'));
const supportedLocales = ['en'];

module.exports = Object.assign(baseConfig, {
  mode: 'production',

  output: {
    ...baseConfig.output,
    pathinfo: false,
  },

  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: 'all',
        parallel: true,
        terserOptions: {
          ecma: 8,
          safari10: false,
          ie8: false,
          mangle: true,
          module: true,
        },
      }),
    ],
  },

  plugins: [
    new webpack.ContextReplacementPlugin(
      /date\-fns[\/\\]/,
      new RegExp(/[\/\\](${supportedLocales.join('|')})[\/\\]/),
    ),
    new HtmlWebpackPlugin({
      title: packageInfo.title,
      filename: path.resolve('../server/build/ui/index.html'),
      template: path.resolve('./src/index.html'),
      xhtml: true,
      meta: {
        viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no',
        description: packageInfo.description,
      },
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[hash].css',
    }),
  ],
});
