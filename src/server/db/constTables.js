import * as db from './query.js';
import fs from 'fs';
import tables from './constTables.json';

let constTables = {};
Object.entries(tables)
	.forEach( 
		([tableName, rows], i) => {
			constTables[tableName] = {};
			rows.forEach(row => {
				constTables[tableName][row.name] = row.id;
			})
		}
	)

export default constTables;