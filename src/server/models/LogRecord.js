import db from '../db';
import AbstractModel from './AbstractModel';


class LogRecord extends AbstractModel {
	constructor(operation, entity, record, authorId) {
		super();
		this.assign({
			record,
			entity,
			authorId,
			operation: operation.slice(0, 1).toUpperCase(),
		});
	}

	save() {
		return db.query(
			`INSERT INTO logs(operation, entity, record, author_id)
			VALUES($1, $2, $3::json, $4::int)
			RETURNING *;`,
			[
				this.operation,
				this.entity,
				this.record,
				this.authorId,
			],
		)
			.then(log => this.assign(log));
	}
}

LogRecord.prototype.tableName = 'logs';

LogRecord.prototype.props = new Set([
	'id',
	'operation',
	'entity',
	'record',
	'time',
	'authorId',
]);


export default LogRecord;
