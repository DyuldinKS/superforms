const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const ROOT_PATH = path.join(__dirname, '../');
const SRC_PATH = path.join(ROOT_PATH, 'src/client');
const PUBLIC_PATH = path.join(ROOT_PATH, 'dist/public');

const entries = ['app', 'auth', 'interview'];

function handleEntries(entries) {
  return entries.reduce((acc, key) => ({
    ...acc,
    [key]: [
      'babel-polyfill',
      path.join(SRC_PATH, `apps/${key}/boot/entry.jsx`),
    ],
  }), {});
}

// Base config
const base = {
  entry: {
    ...handleEntries(entries),
  },
  output: {
    path: path.join(PUBLIC_PATH, 'scripts'),
    filename: '[name].js',
  },
  module: {
    rules: [
      // javascript
      {
        test: /\.jsx?$/,
        include: SRC_PATH,
        loader: 'babel-loader',
      },
      // styles
      {
        test: /\.scss$/,
        include: path.join(SRC_PATH),
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'sass-loader'],
        }),
      },
    ],
  },
  resolve: {
    modules: [SRC_PATH, "node_modules"],
    extensions: ['.js', '.jsx'],
    alias: {
      Locales: path.join(ROOT_PATH, 'src/server/locales'),
    },
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'common',
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'runtime',
    }),
  ],
};

// Development config
const dev = merge(base, {
  output: {
    publicPath: '/scripts/',
  },
  devtool: 'eval-source-map',
  plugins: [
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new ExtractTextPlugin({
      disable: true,
    }),
  ],
});

entries.forEach(key => {
  dev.entry[key] = [
    'webpack-hot-middleware/client',
    'react-hot-loader/patch',
    ...dev.entry[key],
  ];
});

dev.module.rules[0].options = {
  plugins: ['react-hot-loader/babel'],
};

// Production config
const prod = merge(base, {
  output: {
    filename: '[name].[chunkhash].js',
    publicPath: './scripts/',
  },
  // devtool: 'source-map',
  plugins: [
    new CleanWebpackPlugin(['scripts', 'styles'], {
      root: PUBLIC_PATH,
    }),
    new webpack.HashedModuleIdsPlugin(),
    new UglifyJSPlugin({
      sourceMap: true,
    }),
    new ExtractTextPlugin({
      filename: '../styles/[name].[chunkhash].css',
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    }),
  ],
});

const config = process.env.NODE_ENV === 'production'
  ? prod
  : dev;

module.exports = config;
