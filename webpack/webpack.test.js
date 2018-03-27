const path = require('path');
const serverConfig = require('./webpack.server.js');


const {
	target,
	externals,
} = serverConfig;


module.exports = {
	target,
	externals,
	module: serverConfig.module,
	resolve: {
		alias: {
			Client: path.join(__dirname, '../src/client'),
			Server: path.join(__dirname, '../src/server'),
		}
	}
};
