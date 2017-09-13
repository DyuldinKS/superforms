const fs = require('fs');
const path = require( 'path' );
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');


const definePlugin = new webpack.DefinePlugin({
	"process.env": {
		NODE_ENV: JSON.stringify(process.env.NODE_ENV),
	}
});

// The configuration for the client-side rendering
const clientConfig = {
	name: 'client-side rendering',
	entry: './src/client/index.jsx',
	output: {
		path: path.resolve( __dirname, './dist/public' ),
		filename: 'bundle.js',
		chunkFilename: 'chunk-[chunkhash].js',
	},
	plugins: [
		new CleanWebpackPlugin(['dist']),
		new HtmlWebpackPlugin({
				filename: 'index.html',
				template: './src/client/index.html'
		}),
		definePlugin, 
	],
	module: {
		rules: [
			{ // scripts
				test:  /\.js(x?)$/,
				exclude: /node_modules/,
				use: 'babel-loader', 
			}, 
			{ // styles
				test: /\.css$/,
				use: [
					'style-loader',
					{ 
						loader: 'css-loader', 
						options: { importLoaders: 1 } 
					},
					'postcss-loader'
				]
			},
		],
	},
	resolve: {
		 extensions: ['.jsx', '.js', '.css']
	},
};


// externals for server side
const nodeModules = Object.keys(
	JSON.parse(
		fs.readFileSync('package.json')
	).dependencies
)


// The configuration for the server-side rendering
const serverConfig = {
	name: 'server-side rendering',
	entry:  './src/server/index.js',
	target: 'node',
	node: {
		__dirname: false 
	},
	context: __dirname,
	devtool: 'source-map',
	output: {
		path: path.resolve( __dirname, 'dist/' ),
		filename: 'server.js',
		libraryTarget: "commonjs2"
	},
	externals: nodeModules,
	plugins: [ definePlugin ],
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /(node_modules|bower_components)/,
				use: 'babel-loader',
			},
      {
        test: /\.json$/,
        loader: 'json-loader'
      }
		]
	}
}


module.exports = { clientConfig, serverConfig };