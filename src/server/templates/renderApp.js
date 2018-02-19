import fs from 'fs';
import path from 'path';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { Provider } from 'react-redux';
import { AppContainer } from 'react-hot-loader';
import App from 'React/';
import hbs from '../templates/pages';


const REQUIRED_SCRIPTS = ['runtime', 'vendor', 'main'];

function getScriptFilesNames() {
	let getName;

	if(process.env.NODE_ENV === 'production') {
		const scriptsDir = fs.readdirSync(path.join(__dirname, 'public/scripts'));
		getName = name => (
			scriptsDir.find(script => (
				script.includes(name) && script.match(/\w+\.[\w\d]+\.js/)
			))
		);
	} else {
		getName = name => `${name}.js`;
	}

	return REQUIRED_SCRIPTS.map(getName);
}

const scripts = getScriptFilesNames();

export default (store) => {
	const jsonStore = JSON.stringify(store.getState()).replace(/</g, '\\u003c');
	const preloadedState = `window.PRELOADED_STATE = ${jsonStore}`;
	const reactHTML = ReactDOMServer.renderToString(
		<AppContainer>
			<Provider store={store}>
				<App />
			</Provider>
		</AppContainer>
	);

	return hbs.mainPage({ scripts, reactHTML, preloadedState });
};
