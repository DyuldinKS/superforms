import db from '../db/index';
import Recipient from './Recipient';
import { HTTPError } from '../errors';


class Org extends Recipient {
	// ***************** STATIC METHODS ***************** //

	static findById(id) {
		return db.query('SELECT * FROM get_org($1::int)', [id])
			.then((found) => {
				if(!found) return null;
				return new Org(found);
			});
	}

	// @implements
	save(authorId) {
		const rcpt = new Recipient(this);
		return rcpt.saveIfNotExists(authorId)
			.then(() => {
				if(!rcpt.active || rcpt.type !== 'rcpt') {
					throw new HTTPError(403, 'This email is not available');
				}
				return db.query(
					'SELECT * FROM create_org($1::int, $2::jsonb, $3::int, $4::int)',
					[
						rcpt.id,
						this.info,
						this.parentId,
						authorId,
					],
				);
			})
			.then(org => this.assign(org));
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
		// const searchPattern = search ? `${search}:*` : null;
		return db.query(
			'SELECT * FROM find_subordinate_orgs_with_parents($1::int, $2::jsonb)',
			[this.id, Org.buildFilter(options)],
		);
	}


	findAllUsers(options = {}) {
		return db.query(
			'SELECT * FROM find_users_of_subordinate_orgs($1::int, $2::jsonb)',
			[this.id, Org.buildFilter(options)],
		);
	}
}


// ***************** PROTOTYPE PROPERTIES ***************** //

Org.prototype.tableName = 'organizations';

Org.prototype.entityName = 'org';

const props = {
	...Recipient.prototype.props,
	parentId: { writable: true, enumerable: true },
	info: { writable: true, enumerable: true },
};

Org.prototype.props = props;
Org.prototype.dict = Org.buildPropsDictionary(props);

Object.freeze(Org);


export default Org;
