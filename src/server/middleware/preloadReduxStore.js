import createStore from '../../client/apps/app/boot/createStore';
import { actions as routerActions } from '../../client/shared/router/redux';
import { actions as sessionActions } from '../../client/apps/app/shared/redux/session';

// load common ssr redux data to store
export default (req, res, next) => {
	const store = createStore();
	const user = req.author;

	try {
		store.dispatch(routerActions.init(req.url));
		store.dispatch(sessionActions.init(
			`${user.id}`,
			`${user.org.id}`,
			user.toStore(),
			user.org.toStore(),
		));
	} catch (error) {
		throw error;
	}

	req.reduxStore = store;
	next();
};
