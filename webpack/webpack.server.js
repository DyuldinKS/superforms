const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const MakeDirPlugin = require('make-dir-webpack-plugin');
const clientConfig = require('./webpack.client.js');

const ROOT_PATH = path.join(__dirname, '../');
const SRC_PATH = path.join(ROOT_PATH, 'src');
const SRC_SERVER_PATH = path.join(ROOT_PATH, 'src/server');
const SRC_CLIENT_PATH = path.join(ROOT_PATH, 'src/client');
const DIST_PATH = path.join(ROOT_PATH, 'dist');


// The configuration for the server-side rendering
const config = {
	name: 'server-side rendering',
	entry: SRC_SERVER_PATH,
	target: 'node',
	node: { __dirname: false },
	devtool: 'source-map',
	output: {
		path: DIST_PATH,
		filename: 'server.js',
		libraryTarget: 'commonjs2',
	},
	externals: [nodeExternals()],
	plugins: [
		new webpack.optimize.ModuleConcatenationPlugin(),
		new ExtractTextPlugin({
			filename: 'public/styles/styles.css',
		}),
		new MakeDirPlugin({
			dirs: [{ path: path.join(ROOT_PATH, 'logs') }],
		}),
	],
	module: {
		rules: [
			{
				test: /\.jsx?$/,
				include: SRC_PATH,
				loader: 'babel-loader',
			},
			// build global css
			{
				test: /\.scss$/,
				include: path.join(SRC_CLIENT_PATH),
				use: ExtractTextPlugin.extract({
					fallback: 'style-loader',
					use: ['css-loader', 'sass-loader'],
				}),
			},
			{
				test: /\.json$/,
				loader: 'json-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.hbs$/,
				loader: 'handlebars-loader',
				exclude: /node_modules/,
			},
		],
	},
	resolve: {
		...clientConfig.resolve,
		alias: {
			...clientConfig.resolve.alias,
			 Webpack: path.join(ROOT_PATH, 'webpack'),
		}
	},
};


module.exports = config;
