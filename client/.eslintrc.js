module.exports = {
  settings: {
    'import/resolver': {
      webpack: {
        config: 'development.webpack.js',
      },
    },
  },
  parser: 'babel-eslint',
  env: {
    browser: true,
    es6: true,
  },
  extends: ['react-app', 'plugin:jsx-a11y/recommended', 'plugin:prettier/recommended'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: ['import', 'prettier', 'react', 'react-hooks', 'relay'],
  rules: {
    'no-unused-vars': 'error',
    'import/no-unresolved': 'off',
    'import/prefer-default-export': 'off',
    'react/jsx-filename-extension': 'off',
    eqeqeq: ['warn', 'allow-null'],
  },
};
