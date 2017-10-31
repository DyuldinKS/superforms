import pool from './pool';
import { PgError } from '../libs/errors';

export default {

	queryAll(queryString, values) {
		if(process.env.NODE_ENV === 'development') {
			console.log(queryString, values);
		}
		return pool.query(queryString, values)
			.then(result => result.rows)
			.catch((err) => {
				throw new PgError(err);
			});
	},

	query(queryString, values) {
		return this.queryAll(queryString, values)
			.then(result => result[0]);
	},

	genIndexesArray(length, start = 0) {
		return Array.from(Array(length), (e, i) => `$${i + start}`);
	},

	genCondition({ col, val }, counter) {
		if(!col && val === undefined) return null; // no 'where' clauses
		if(typeof val === 'object') {
			if(val.length > 0) {
				const indexes = this.genIndexesArray(val.length, counter.val);
				counter.val += val.length;
				return `${col} IN (${indexes.join(',')})`;
			}
			return null;
		}
		return `${col} = $${counter.val++}`;
	},

	genWhereConditions({ where, operator = 'AND' }, counter) {
		if(where && (typeof where === 'object')) {
			return `WHERE ${(
				where.length
					? where.map(col => this.genCondition(col, counter))
						.filter(condition => condition !== null)
						.join(` ${operator} `)
					: this.genCondition(where, counter)
			) || true}`;
		}
		return '';
	},

	genWherePartValues({ where }) {
		if(!(where && typeof where === 'object')) return [];
		if(where.length) {
			return where.reduce(
				(prev, { val }) => (
					(val !== undefined) ? prev.concat(val) : prev
				),
				[],
			);
		}
		return where.val ? [].concat(where.val) : [];
	},

	/*
	search: {
		where: [{ col: @string, val: @any || [@any] }],
		operator: 'AND' || 'OR'
	}
	*/
	select(table, search = {}) {
		const counter = { val: 1 };
		return this.queryAll(
			`SELECT * FROM ${table} ${this.genWhereConditions(search, counter)};`,
			this.genWherePartValues(search)
		);
	},

	insert(table, fields, values, onConflict = '') {
		if(!(table && fields && values)) {
			return Promise.reject(new Error('invalid insert query params'));
		}
		if(!(fields.length > 0 && values.length > 0)) {
			return Promise.resolve([]);
		}
		let i = 1;
		const genOnConflictPart = (str) => {
			let upsert;
			if(str && typeof str !== 'string') {
				upsert = str.toUpperCase();
				if(upsert === 'ON CONFLICT DO NOTHING'
					|| upsert === 'ON CONFLICT DO UPDATE') {
					return upsert;
				}
			}
			return '';
		};
		const genValuesPart = valuesRow => (
			`(${valuesRow.map(() => `$${i++}`).join(', ')})`
		);
		const valuesPart = values.map(genValuesPart).join(', ');
		const valuesList = values.reduce(
			(prev, curr) => prev.concat(curr),
			[],
		);
		return this.query(
			`INSERT INTO ${table}(${fields.join(', ')}) VALUES${valuesPart} 
			${genOnConflictPart(onConflict)} RETURNING *;`,
			valuesList
		);
	},

	genUpdatePart(updated, counter = { val: 1 }) {
		return updated.length
			? updated.map(({ col }) => (
				`${col} = $${counter.val++}`
			)).join(',')
			: `${updated.col} = $${counter.val++}`;
	},

	genUpdatedValues(updated) {
		if(!(updated && typeof updated === 'object')) return [];
		if(updated.length) {
			return updated.map(({ val }) => val).filter(v => v !== undefined);
		}
		return updated.val ? [updated.val] : [];
	},

	/*
	updated: { col: @string, val: @any }
		|| [{ col: @string, val: @any }[, ...]],
	search: {
		where: { col: @string, val: @any || [@any] }
			|| [{ col: @string, val: @any || [@any] }[, ...]],
		operator: 'AND' || 'OR'
	}
	*/
	update(table, updated, search) {
		const counter = { val: 1 };
		const values = this.genUpdatedValues(updated)
			.concat(this.genWherePartValues(search));

		return this.query(
			`UPDATE ${table} SET ${this.genUpdatePart(updated, counter)}
			${this.genWhereConditions(search, counter)} RETURNING *;`,
			values
		);
	},

};
