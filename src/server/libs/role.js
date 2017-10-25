import { shareableTables } from '../db/initialValues';
import Rights from './rights';

class Role {
	constructor(role) {
		if(typeof role !== 'object') {
			throw new TypeError('Cannot convert undefined or null to role');
		}
		const {
			id, label, info, rights, author_id, created,
		} = role;
		this.label = label;
		this.info = info;
		this.rights = {};
		if(typeof rights === 'object') {
			const categories = Object.keys(rights);
			let categoryRights;
			categories.filter(category => Role.shareable.includes(category))
				.forEach((category) => {
					categoryRights = new Rights(rights[category]);
					if(categoryRights.isValid()) {
						this.rights[category] = categoryRights;
					}
				});
		}
		if(id) this.id = id;
		if(created) this.created = created;
		if(author_id) this.authorId = author_id;
	}

	isValid() {
		const { label, info, rights } = this;
		return typeof label === 'string' && label.length > 0
			&& typeof info === 'object'
			&& Object.keys(rights).length > 0;
	}

	getRights(category) {
		return this.rights[category] || null;
	}

	setRights(category, rights) {
		if(this.shareable.includes(category)) {
			const categoryRights = new Rights(rights);
			if(categoryRights.isValid()) {
				this.category = categoryRights;
			}
		}
	}

	getScope(category, action, mode) {
		return this.rights[category]
			? this.rights[category].getScope(action, mode)
			: null;
	}
}

Role.shareable = shareableTables.values;

export default Role;
