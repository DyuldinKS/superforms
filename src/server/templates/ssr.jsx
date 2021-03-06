import fs from 'fs';
import path from 'path';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { Provider } from 'react-redux';
import { AppContainer } from 'react-hot-loader';
import App from '../../client/apps/app/appContainer';
import Auth from '../../client/apps/auth/authContainer';
import Interview from '../../client/apps/interview/interviewContainer';
import hbs from '../templates/pages';


function findAssets(assetsDir, names, ext) {
	let assets = {};

	if(process.env.NODE_ENV === 'production') {
		const dir = fs.readdirSync(path.join(__dirname, 'public', `${assetsDir}`));
		const re = new RegExp(`\\w+\\.[\\w\\d]+\\.${ext}`);
		// find hashed files
		names.forEach((name) => {
			assets[name] = dir.find(
				file => file.startsWith(name) && file.match(re)
			);
		})
	} else {
		names.forEach(name => { assets[name] = `${name}.${ext}`; });
	}

	return assets;
}


const allAssetNames = {
	scripts: ['runtime', 'common', 'app', 'auth', 'interview'],
	styles: ['app', 'auth', 'interview'],
};


const builtAssets = {
	scripts: findAssets('scripts', allAssetNames.scripts, 'js'),
	styles: findAssets('styles', allAssetNames.styles, 'css'),
};


const getAssets = (assetNames) => (
	Object.keys(assetNames).reduce(
		(assets, type) => {
			assets[type] = assetNames[type].map(name => builtAssets[type][name])
			return assets;
		},
		{},
	)
);


function renderApp(ReactEntry, assets, state = {}) {
	// Prepare initial state
	const jsonStore = JSON.stringify(state).replace(/</g, '\\u003c');
	const preloadedState = `window.PRELOADED_STATE = ${jsonStore}`;

	// Render react
	const reactHTML = ReactDOMServer.renderToString(
		<AppContainer>
			<ReactEntry {...state} />
		</AppContainer>
	);

	return hbs.mainPage({
		...getAssets(assets),
		preloadedState,
		reactHTML,
		disableRDT: process.env.NODE_ENV === 'production',
	});
}


function renderAppWithRedux(ReactEntry, assets, store) {
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

	return hbs.mainPage({
		...getAssets(assets),
		preloadedState,
		reactHTML,
		disableRDT: process.env.NODE_ENV === 'production',
	});
}


const render = {
	app(state) {
		const requiredAssetNames = {
			scripts: ['runtime', 'common', 'app'],
			styles: ['app'],
		};
		return renderAppWithRedux(App, requiredAssetNames, state);
	},

	auth(store) {
		const requiredAssetNames = {
			scripts: ['runtime', 'common', 'auth'],
			styles: ['auth'],
		};

		return renderApp(Auth, requiredAssetNames, store);
	},

	interview(store) {
		const requiredAssetNames = {
			scripts: ['runtime', 'common', 'interview'],
			styles: ['interview'],
		};

		return renderApp(Interview, requiredAssetNames, store);
	},
};


export {
	render as default,
	renderApp,
	renderAppWithRedux,
};
