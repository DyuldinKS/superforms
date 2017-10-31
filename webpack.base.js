const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');


const definePlugin = new webpack.DefinePlugin({
	'process.env': {
		NODE_ENV: JSON.stringify(process.env.NODE_ENV),
	},
});

// The configuration for the client-side rendering
const clientConfig = {
	name: 'client-side rendering',
	entry: './src/client/index.jsx',
	output: {
		path: path.resolve(__dirname, './dist/public'),
		filename: 'bundle.js',
		chunkFilename: 'chunk-[chunkhash].js',
	},
	plugins: [
		new CleanWebpackPlugin(['dist']),
		new HtmlWebpackPlugin({
			filename: 'index.html',
			template: './src/client/index.html',
		}),
		definePlugin,
	],
	module: {
		rules: [
			{ // scripts
				test: /\.js(x?)$/,
				use: 'babel-loader',
				exclude: /node_modules/,
			},
			{ // styles
				test: /\.css$/,
				use: [
					'style-loader',
					{
						loader: 'css-loader',
						options: { importLoaders: 1 },
					},
					'postcss-loader',
				],
			},
		],
	},
	resolve: {
		extensions: ['.jsx', '.js', '.css'],
	},
};

// The configuration for the server-side rendering
const serverConfig = {
	name: 'server-side rendering',
	entry: './src/server/index.js',
	target: 'node',
	node: { __dirname: false },
	context: __dirname,
	devtool: 'source-map',
	output: {
		path: path.resolve(__dirname, 'dist/'),
		filename: 'server.js',
		libraryTarget: 'commonjs2',
	},
	externals: [nodeExternals()],
	plugins: [definePlugin],
	module: {
		rules: [
			{
				test: /\.js$/,
				use: [
					'babel-loader',
					'eslint-loader',
				],
				exclude: /node_modules/,
			}, {
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
};

module.exports = { clientConfig, serverConfig };
