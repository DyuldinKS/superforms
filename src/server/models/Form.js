import xlsx from 'xlsx';
import db from '../db/index';
import AbstractModel from './AbstractModel';
import deepFind from '../utils/deepFind';


class Form extends AbstractModel {
	// ***************** STATIC METHODS ***************** //

	static findById(id) {
		return db.query('SELECT * FROM to_form_full(get_form($1)) form;', [id])
			.then(found => (found ? new Form(found) : null));
	}


	static buildTableScheme(formScheme) {
		// system info
		const system = {
			questions: ['datetime'],
			items: {
				// object paths relative to response object
				datetime: { title: 'date & time', path: 'created' },
				// ip: { title: 'ip', path: 'respondent.ip' },
			},
		};

		const { items, order } = formScheme;
		// question ids of the forms
		const questions = order.filter(id => items[id].itemType !== 'delimeter');
		// column type cast
		const handlers = questions.map(id => Form.defineColHandler(items[id]));

		return { system, questions, handlers };
	}


	static defineColHandler(question) {
		const baseHandler = val => val;
		switch (question.type) {
		case 'select': {
			return selected => (
				question.options
					.map((opt, i) => selected && selected[i] && opt)
					.filter(val => val)
					.join('; ')
			);
		}
		case 'time': // fall through
		case 'date': {
			return val => new Date(val);
		}
		case 'text': {
			return question.datetime ? val => new Date(val) : baseHandler;
		}
		default: return baseHandler;
		}
	}


	// ***************** INSTANCE METHODS ***************** //

	// @implements
	save({ author }) {
		this.ownerId = author.id;

		return super.save({ author });
	}

	// get responses in short(default) or full form
	getResponses(mode) {
		const cast = `to_response_${mode === 'full' ? 'full' : 'short'}`;
		return db.queryAll(
			`SELECT resp_short.* FROM get_responses_by_form($1) resp,
				${cast}(resp) resp_short;`,
			[this.id],
		)
			.then((responses) => {
				this.responses = responses;
				return responses;
			});
	}


	fillHeader() {
		const { tableScheme, scheme: formScheme } = this;
		const { system, questions } = tableScheme;

		this.table.push([
			...system.questions.map(key => key && system.items[key].title),
			...questions.map(id => id && formScheme.items[id].title),
		]);
	}


	fillBody() {
		const {
			tableScheme: { system, questions, handlers },
			responses,
		} = this;

		let row;
		return responses.forEach((response) => {
			row = [];
			system.questions.forEach((key) => {
				row.push(key && deepFind(response, system.items[key].path));
			});
			questions.forEach((id, i) => row.push(handlers[i](response.items[id])));
			this.table.push(row);
		});
	}


	generateXLSX() {
		const { title, description, scheme } = this;
		const wb = xlsx.utils.book_new();
		wb.Props = { Title: title, Comments: description };

		this.tableScheme = Form.buildTableScheme(scheme);
		this.table = [];
		this.fillHeader();
		this.fillBody();
		const ws = xlsx.utils.aoa_to_sheet(this.table);

		const widthLimit = 20; // max chars for each column
		ws['!cols'] = this.table[0].map(question => (
			{ wch: question.length < widthLimit ? question.length : widthLimit }
		));

		xlsx.utils.book_append_sheet(wb, ws, 'List 1');

		const wopts = { bookType: 'xlsx', bookSST: false, type: 'buffer' };
		return xlsx.write(wb, wopts);
	}
}


Form.prototype.tableName = 'forms';

Form.prototype.entityName = 'form';

Form.prototype.props = {
	id: { writable: false, enumerable: true },
	title: { writable: true, enumerable: true },
	description: { writable: true, enumerable: true },
	scheme: { writable: true, enumerable: true },
	collecting: { writable: true, enumerable: true },
	ownerId: { writable: true, enumerable: true },
	created: { writable: false, enumerable: true },
	updated: { writable: false, enumerable: true },
	deleted: { writable: true, enumerable: true },
	authorId: { writable: false, enumerable: true },
	questionCount: { writable: false, enumerable: true },
	responseCount: { writable: false, enumerable: true },
};

Object.freeze(Form);


export default Form;
