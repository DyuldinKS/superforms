const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
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
	/* context must be the same as client config context
		 to build equal css modules hashes */
	context: __dirname,
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
				include: path.join(SRC_CLIENT_PATH, 'styles'),
				use: ExtractTextPlugin.extract({
					fallback: 'style-loader',
					use: ['css-loader', 'sass-loader'],
				}),
			},
			// build css modules
			{
				test: /\.scss$/,
				include: path.join(SRC_CLIENT_PATH, 'react'),
				use: ExtractTextPlugin.extract({
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
	resolve: Object.assign(
		{},
		clientConfig.resolve,
		{
			alias: Object.assign(
				{},
				clientConfig.resolve.alias,
				{ Webpack: path.join(ROOT_PATH, 'webpack') },
			),
		}
	),
};


module.exports = config;
