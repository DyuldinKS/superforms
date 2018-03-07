import fs from 'fs';
import path from 'path';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { Provider } from 'react-redux';
import { AppContainer } from 'react-hot-loader';
import hbs from '../templates/pages';


function getHashedFiles(dirPath, fe, names = []) {
	if(!names.length) {
		return [];
	}

	const dir = fs.readdirSync(path.join(__dirname, dirPath));
	const regExp = new RegExp(`\\w+\\.[\\w\\d]+\\.${fe}`);

	return names.map(name => (
		dir.find(file => (
			file.includes(name) && file.match(regExp)
		))
	));
}

const initialAssets = {
	scripts: [],
	styles: [],
};

function getAssets(assets) {
	assets = {
		...initialAssets,
		...assets,
	};

	if(process.env.NODE_ENV === 'production') {
		return {
			scripts: getHashedFiles('public/scripts', 'js', assets.scripts),
			styles: getHashedFiles('public/styles', 'css', assets.styles),
		};
	}

	return {
		scripts: assets.scripts.map(file => `${file}.js`),
		styles: [],
	};
}

export function renderApp(ReactEntry, assets, state = {}) {
	// Prepare initial state
	const jsonStore = JSON.stringify(state).replace(/</g, '\\u003c');
	const preloadedState = `window.PRELOADED_STATE = ${jsonStore}`;

	// Render react
	const reactHTML = ReactDOMServer.renderToString(
		<AppContainer>
			<ReactEntry {...state} />
		</AppContainer>
	);

	// Read assets
	const { scripts, styles } = getAssets(assets);

	return hbs.mainPage({
		preloadedState,
		reactHTML,
		scripts,
		styles,
	});
}

export function renderAppWithRedux(ReactEntry, assets, store) {
	// Prepare initial state
	const jsonStore = JSON.stringify(store.getState()).replace(/</g, '\\u003c');
	const preloadedState = `window.PRELOADED_STATE = ${jsonStore}`;

	// Render react
	const reactHTML = ReactDOMServer.renderToString(
		<AppContainer>
			<Provider store={store}>
				<ReactEntry />
			</Provider>
		</AppContainer>
	);

	// Read assets
	const { scripts, styles } = getAssets(assets);

	return hbs.mainPage({
		preloadedState,
		reactHTML,
		scripts,
		styles,
	});
}
