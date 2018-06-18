import xlsx from 'xlsx';
import moment from 'moment';
import db from '../db/index';
import AbstractModel from './AbstractModel';
import deepFind from '../utils/deepFind';


const basedate = new Date(1899, 11, 30, 0, 0, 0);
const min = 60 * 1000;
const day = 24 * 60 * min;
// avoid node.js v10+ timezone bug for year < 1920
const rounded = Math.round(basedate.getTime() / min) * min;
const dnthresh = rounded + (
	(new Date().getTimezoneOffset() - basedate.getTimezoneOffset()) * 60000
);
const datenum = v => (v - dnthresh) / day;


class Form extends AbstractModel {
	// ***************** STATIC METHODS ***************** //

	static findById(id) {
		return db.query('SELECT * FROM to_form_full(get_form($1)) form;', [id])
			.then(found => (found ? new Form(found) : null));
	}


	static buildTableScheme(formScheme) {
		const { items, order } = formScheme;
		// question ids of the forms
		const questionIds = order.filter(id => (
			items[id].itemType !== 'delimeter'
		));
		// cell creator list
		const creators = questionIds.map(id => (
			Form.getCellCreator(items[id].type)
		));

		return { questionIds, creators };
	}


	static getCellCreator(type) {
		// question.type is on of [text, number, select, date, time]
		const converterName = `${type}ToXLSX`;
		return Form[converterName] || Form.textToXLSX;
	}


	static textToXLSX(question, text) {
		return question && question.datetime
			? Form.datetimeToXLSX(question, text) // compatibility with old data
			: { t: 's', v: text };
	}


	static numberToXLSX(question, num) {
		const cell = { t: 'n', v: num };
		if(!question.integer) cell.z = '0.00';
		return cell;
	}


	static selectToXLSX(question, selectedOpts) {
		return {
			t: 's',
			v: question.options
				.map((opt, i) => selectedOpts && selectedOpts[i] && opt)
				.filter(val => val)
				.join('; '),
		};
	}


	static createDTConverter(inF, outF = 'd/m/yy hh:mm') {
		return (question, datetime) => {
			const dt = moment(datetime, inF);
			return dt.isValid()
				? { t: 'n', v: datenum(dt.valueOf()), z: outF }
				: null;
		};
	}


	static datetimeToXLSX = Form.createDTConverter()

	static dateToXLSX = Form.createDTConverter('YYYY-MM-DD', 'dd/m/yy')

	static timeToXLSX = Form.createDTConverter('hh:mm:ss', 'hh:mm')


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


	fill() {
		const {
			tableScheme: { questionIds, creators },
			scheme,
			responses,
		} = this;

		let addr;

		// header

		const headRowsNum = 1;
		const sysCols = ['datetime'];
		let creator = Form.getCellCreator('text');
		const header = [
			...sysCols,
			...questionIds.map(id => scheme.items[id].title),
		];

		header.forEach((name, c) => {
			addr = xlsx.utils.encode_cell({ c, r: 0 });
			this.ws[addr] = creator(null, name);
		});

		// system values

		const rMin = headRowsNum;
		for (let r = 0; r < responses.length; r += 1) {
			addr = xlsx.utils.encode_cell({ c: 0, r: r + headRowsNum });
			this.ws[addr] = Form.datetimeToXLSX(null, responses[r].created);
		}

		// questions and answers

		const cMin = sysCols.length;
		const cMax = cMin + questionIds.length;
		let id;
		creator = Form.getCellCreator('text');

		const rMax = rMin + responses.length;
		let cOrigin;
		// console.log(responses[0])
		for (let c = cMin; c < cMax; c += 1) {
			cOrigin = c - sysCols.length;
			creator = creators[cOrigin];
			for (let r = rMin; r < rMax; r += 1) {
				addr = xlsx.utils.encode_cell({ c, r });
				// console.log(r, c, addr);
				id = questionIds[cOrigin];
				this.ws[addr] = creator(
					scheme.items[id],
					responses[r - rMin].items[id],
				) || null;
			}
		}

		this.ws['!ref'] = `A0:${addr}`;
		const widthLimit = 20; // max chars for each column
		this.ws['!cols'] = header.map(colName => (
			{ wch: colName.length < widthLimit ? colName.length : widthLimit }
		));
	}


	generateXLSX() {
		const { title, description, scheme } = this;
		const wb = xlsx.utils.book_new();
		wb.Props = { Title: title, Comments: description };

		this.tableScheme = Form.buildTableScheme(scheme);
		this.ws = {};
		this.fill();
		xlsx.utils.book_append_sheet(wb, this.ws, 'List 1');

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
