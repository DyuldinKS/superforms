import db from '../db/index';
import Recipient from './Recipient';
import { HTTPError } from '../errors';


class Org extends Recipient {
	// ***************** STATIC METHODS ***************** //

	static findById(id) {
		return db.query(
			'SELECT (_found::org_full).* FROM get_org($1::int) _found;',
			[id],
		)
			.then(found => (found ? new Org(found) : null));
	}

	// @implements
	save({ author }) {
		const rcpt = new Recipient(this);

		return rcpt.saveIfNotExists({ author })
			.then(() => {
				if(rcpt.type !== 'rcpt' || !rcpt.active || rcpt.deleted) {
					throw new HTTPError(403, 'This email is not available');
				}

				const writableProps = this.filterProps(this, 'writable');
				return db.query(
					`SELECT (_new::org_full).*
					FROM create_org($1::int, $2::json, $3::int) _new`,
					[rcpt.id, writableProps, author.id],
				);
			})
			.then(user => this.assign(user));
	}


	static buildSearchTemplate(text) {
		if(text && typeof text === 'string') {
			const str = text.trim();
			return str.match(/\s/) // str has whitespace characters
				|| Array.from(str) // str has characters of the russian alphabet
					.map(char => char.charCodeAt())
					.some(code => (
						(code >= 0x0410 && code <= 0x044F)
						|| code === 0x0401 || code === 0x0451
					))
				? { info: `${str.replace(/\s+/g, '&')}:*` }
				: { email: `%${text}%` };
		}
		return null;
	}


	static buildFilter(options) {
		const { search } = options;
		const filter = [
			'role',
			'active',
			'deleted',
			'minDepth',
			'maxDepth',
		].reduce(
			(f, prop) => {
				if(prop in options) f[prop] = options[prop];
				return f;
			},
			{},
		);
		Object.assign(filter, Org.buildSearchTemplate(search));
		return filter;
	}


	findAllOrgs(options = {}) {
		const filter = Org.buildFilter(options);
		if('minDepth' in filter === false) filter.minDepth = 1;

		return db.query(
			'SELECT * FROM find_orgs_in_subtree($1::int, $2::jsonb)',
			[this.id, filter],
		);
	}


	findAllUsers(options = {}) {
		const filter = Org.buildFilter(options);
		if('minDepth' in filter === false) filter.minDepth = 0;

		return db.query(
			'SELECT * FROM find_users_in_subtree($1::int, $2::jsonb)',
			[this.id, filter],
		);
	}
}


// ***************** PROTOTYPE PROPERTIES ***************** //

Org.prototype.tableName = 'organizations';

Org.prototype.entityName = 'org';

Org.prototype.props = {
	...Recipient.prototype.props,
	id: { writable: false, enumerable: true },
	parentId: { writable: true, enumerable: true },
	info: { writable: true, enumerable: true },
};

Object.freeze(Org);


export default Org;
