import constants from '../db/constants';
import Rights from './rights';

class Role {
	constructor({
		id,
		label,
		info,
		rights,
		authorId,
		created,
	}) {
		this.label = label;
		this.info = info;
		this.rights = {};
		if(typeof rights === 'object') {
			const categories = Object.keys(rights);
			let categoryRights;
			categories.filter(category => (category in Role.shareable))
				.forEach((category) => {
					categoryRights = new Rights(rights[category]);
					if(categoryRights.isValid()) {
						this.rights[category] = categoryRights;
					}
				});
		}
		if(id) this.id = id;
		if(created) this.created = created;
		if(authorId) this.authorId = authorId;
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

Role.shareable = constants.shareableTables.values;

export default Role;
