/* eslint-disable */
const baseConfig = require('./development.webpack');
const TerserPlugin = require('terser-webpack-plugin');


module.exports = Object.assign(baseConfig, {
  mode: 'production',

  output: {
    ...baseConfig.output,
    pathinfo: false,
  },

  optimization: {
    ...baseConfig.optimization,
    minimizer: [
      ...baseConfig.optimization.minimizer,
      new TerserPlugin({
        exclude: /\.map\.js$/,
        extractComments: false,
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
});
