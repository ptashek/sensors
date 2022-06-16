/* eslint-disable */
const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

const packageInfo = JSON.parse(fs.readFileSync('./package.json'));
const supportedLocales = ['en'];

module.exports = {
  target: 'web',
  context: process.cwd(),
  mode: 'development',
  devtool: 'source-map',
  entry: path.resolve(packageInfo.main),

  output: {
    path: path.resolve('../server/build/ui'),
    publicPath: '/',
    filename: '[name].[contenthash].js',
    pathinfo: true,
    sourceMapFilename: '[name].[contenthash].map.js',
    assetModuleFilename: 'assets/[contenthash][ext][query]'
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: [/\.(ttf|eot|woff|otf)$/, /\.txt$/],
        loader: 'null-loader',
      },
      {
        test: /\.woff2?$/i,
        type: 'asset/resource',
        dependency: { not: ['url'] },
      },
      {
        test: /\.(png|jpe?g|gif|svg|webp)$/,
        type: 'asset/resource',
        dependency: { not: ['url'] },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },

  resolve: {
    modules: ['src', 'images', 'styles', 'node_modules'],
  },

  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
      minChunks: 1,
      maxInitialRequests: 4,
      maxAsyncRequests: 6,
    },
    minimizer: [
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: [
            'default',
            {
              discardComments: { removeAll: true },
            },
          ],
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
    })
  ],
};
