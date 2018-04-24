import db from '../db/index';
import Recipient from './Recipient';
import { HTTPError } from '../errors';


class Org extends Recipient {
	// ***************** STATIC METHODS ***************** //

	static findById(id) {
		return db.query(
			'SELECT _org.* FROM to_org_full(get_org($1::int)) _org;',
			[id],
		)
			.then(found => (found ? new Org(found) : null));
	}


	static isParent(parentId, childId) {
		return db.query(
			'SELECT distance FROM org_links WHERE parent_id = $1 AND org_id = $2',
			[parentId, childId],
		)
			.then(link => Boolean(link));
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


	// ***************** INSTANCE METHODS ***************** //

	async loadDependincies() {
		if(this.parentOrgIds) return;
		if(!this.id && !this.parent_id) throw new Error('org.id is not specified');

		const result = await db.query(
			`SELECT json_agg(parent_id ORDER BY distance) AS "parentIds"
			FROM org_links
			WHERE org_id = $1;`,
			[this.id || this.parentId],
		);

		this.parentOrgIds = result ? result.parentIds : null;
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
					`SELECT _new.* FROM to_org_full(
						create_org($1::int, $2::json, $3::int)
					) _new`,
					[rcpt.id, writableProps, author.id],
				);
			})
			.then(user => this.assign(user));
	}


	findOrgsInSubtree(options = {}) {
		const filter = Org.buildFilter(options);
		if('minDepth' in filter === false) filter.minDepth = 1;

		return db.query(
			'SELECT * FROM find_orgs_in_subtree($1::int, $2::jsonb)',
			[this.id, filter],
		);
	}


	findUsersInSubtree(options = {}) {
		const filter = Org.buildFilter(options);
		if('minDepth' in filter === false) filter.minDepth = 0;

		return db.query(
			'SELECT * FROM find_users_in_subtree($1::int, $2::jsonb)',
			[this.id, filter],
		);
	}


	findForms(options = {}) {
		const filter = Org.buildFilter(options);

		return db.query(
			'SELECT * FROM find_forms_in_org($1::int, $2::jsonb)',
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
