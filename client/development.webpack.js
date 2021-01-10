/* eslint-disable */
const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const packageInfo = JSON.parse(fs.readFileSync('./package.json'));
const supportedLocales = ['en'];

module.exports = {
  context: process.cwd(),
  mode: 'development',
  devtool: 'source-map',
  entry: path.resolve(packageInfo.main),

  output: {
    path: path.resolve('../server/build/ui'),
    publicPath: '/',
    filename: '[name].[hash].js',
    pathinfo: true,
    sourceMapFilename: '[name].[hash].map.js',
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          publicPath: './',
          useRelativePath: false,
          name: '[name].[ext]',
        },
      },
      {
        test: [/roboto.*[179]00(italic)?\.(ttf|woff2?)$/, /\.eot$/, /\.txt$/],
        loader: 'null-loader',
      },
      {
        test: /\.(ttf|woff2?)$/,
        loader: 'file-loader',
        options: {
          publicPath: './',
          useRelativePath: false,
          name: '[name].[ext]',
        },
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },

  resolve: {
    modules: ['src', 'images', 'styles', 'node_modules'],
  },

  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'async',
      minChunks: 1,
      maxInitialRequests: 4,
      maxAsyncRequests: 6,
    },
    minimizer: [
      new OptimizeCSSAssetsPlugin({
        cssProcessorOptions: {
          discardComments: {
            removeAll: true,
          },
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
      title: `${packageInfo.title} (dev)`,
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
    // new BundleAnalyzerPlugin(),
  ],
};
