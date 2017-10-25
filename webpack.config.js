const merge = require('webpack-merge');
const base = require('./webpack.base.js');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');


const devClientConfig = {
	watchOptions: {
		ignored: '/node_modules/',
	},
	devtool: 'source-map',
};

const prodClientConfig = {
	plugins: [
		new UglifyJSPlugin(),
	],
};

module.exports = [
	merge(
		base.clientConfig,
		process.env.NODE_ENV === 'production'
			? prodClientConfig
			: devClientConfig
	),
	base.serverConfig,
];
