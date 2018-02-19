const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const ROOT_PATH = path.join(__dirname, '../');
const SRC_PATH = path.join(ROOT_PATH, 'src/client');
const PUBLIC_PATH = path.join(ROOT_PATH, 'dist/public');

// Base config
const base = {
  /* context must be the same as server config context
     to build equal css modules hashes */
  // context: __dirname,
  entry: {
    main: [
      'babel-polyfill',
      path.join(SRC_PATH, 'index.jsx'),
    ],
    vendor: [
      'react',
      'react-dom',
      'react-redux',
      'redux',
      'redux-thunk',
      'babel-polyfill',
      'prop-types',
      'classnames',
      'throttle-debounce',
      'faker',
      'reactstrap',
    ],
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
        include: path.join(SRC_PATH, 'styles'),
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'sass-loader'],
        }),
      },
      {
        test: /\.scss$/,
        include: path.join(SRC_PATH, 'react'),
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                context: __dirname,
                modules: true,
                localIdentName: '[name]__[local]--[hash:base64:5]',
              },
            },
            {
              loader: 'sass-loader',
            },
          ]
        })
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      Lib: path.join(SRC_PATH, 'lib'),
      React: path.join(SRC_PATH, 'react'),
      Redux: path.join(SRC_PATH, 'redux'),
      Styles: path.join(SRC_PATH, 'styles'),
      Locales: path.join(ROOT_PATH, 'src/server/locales'),
    },
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendor', 'runtime'],
    }),
    new ExtractTextPlugin({
      filename: '../styles/styles.css',
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
  ],
});

dev.entry.main = [
  'webpack-hot-middleware/client',
  'react-hot-loader/patch',
  ...dev.entry.main,
];

dev.module.rules[0].options = {
  plugins: ['react-hot-loader/babel'],
};

// Production config
const prod = merge(base, {
  output: {
    filename: '[name].[chunkhash].js',
    publicPath: './scripts/',
  },
  devtool: 'source-map',
  plugins: [
    new CleanWebpackPlugin(['scripts', 'styles'], {
      root: PUBLIC_PATH,
    }),
    new webpack.HashedModuleIdsPlugin(),
    new UglifyJSPlugin({
      sourceMap: true,
    }),
    // new webpack.DefinePlugin({
    //   'process.env': {
    //     NODE_ENV: JSON.stringify('production'),
    //   },
    // }),
  ],
});

const config = process.env.NODE_ENV === 'production'
  ? prod
  : dev;

// console.log(config);

module.exports = config;
