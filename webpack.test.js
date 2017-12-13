const { serverConfig } = require('./webpack.base.js');

const {
	target,
	context,
	externals,
} = serverConfig;

module.exports = {
	target,
	context,
	externals,
	module: {
		rules: [
			{
				test: /\.js$/,
				use: 'babel-loader',
				exclude: /node_modules|.temp/,
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
};
