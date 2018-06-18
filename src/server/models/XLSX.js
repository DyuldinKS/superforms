import xlsx from 'xlsx';
import moment from 'moment';


class XLSX {
	static basedate = XLSX.getBaseDate()


	// *************************** STATIC METHODS *************************** //

	static getBaseDate() {
		const origin = new Date(1899, 11, 30, 0, 0, 0);
		const min = 60 * 1000;
		// avoid node.js v10+ timezone bug for year < 1920
		const rounded = Math.round(origin.getTime() / min) * min;
		return rounded + (
			(new Date().getTimezoneOffset() - origin.getTimezoneOffset()) * min
		);
	}


	static datenum(v) {
		return (v - XLSX.basedate) / (24 * 60 * 60 * 1000);
	}


	static getCellConverter(type) {
		// question.type is on of [text, number, select, date, time]
		const converterName = `${type}ToXLSX`;
		return XLSX[converterName] || XLSX.textToXLSX;
	}


	static textToXLSX(question, text) {
		return question && question.datetime
			? XLSX.datetimeToXLSX(question, text) // compatibility with old data
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


	static createDTConverter(inF, outF = 'dd/mm/yy hh:mm') {
		return (question, datetime) => {
			const dt = moment(datetime, inF);
			return dt.isValid()
				? { t: 'n', v: XLSX.datenum(dt.valueOf()), z: outF }
				: null;
		};
	}


	static datetimeToXLSX = XLSX.createDTConverter()

	static dateToXLSX = XLSX.createDTConverter('YYYY-MM-DD', 'dd/m/yy')

	static timeToXLSX = XLSX.createDTConverter('hh:mm:ss', 'hh:mm')


	constructor(form, responses) {
		['title', 'description', 'scheme'].forEach((attr) => {
			this[attr] = form[attr];
		});
		this.responses = responses;
		this.injectSystemCols();
		const ws = this.generateWS();
		this.wb = this.generateWB(ws);
	}


	// ************************** INSTANCE METHODS ************************** //

	injectSystemCols() {
		const { items, order } = this.scheme;
		const sysCols = ['response.created'];
		const sysColTypes = ['datetime'];
		const qstnCols = order.filter(id => (
			items[id].itemType !== 'delimeter'
		));

		this.order = [...sysCols, ...qstnCols];

		// (!)
		// inject system questions with specified types
		this.questions = sysCols.reduce(
			(acc, title, i) => {
				acc[title] = { title, type: sysColTypes[i] };
				return acc;
			},
			items,
		);

		// (!)
		// inject a new prop to each answer
		this.responses = this.responses.map((rsp) => {
			if(!rsp.items) throw new Error(`no items in response ${rsp.id}`);
			rsp.items[sysCols[0]] = rsp.created;
			return rsp;
		});

		// cell converter list
		this.converters = [
			...sysColTypes.map(type => XLSX.getCellConverter(type)),
			...qstnCols.map(qstn => (
				XLSX.getCellConverter((qstn && qstn.type) || 'text')
			)),
		];
	}


	generateWS() {
		const { order, questions, responses } = this;
		let addr; // cell address
		let id; // question id
		let title; // question title
		const ws = { '!cols': [] }; // worksheet
		const textConverter = XLSX.getCellConverter('text');
		let converter; // col data converter
		const headRowNum = 1;
		const widthLimit = 20; // max chars for each column

		for (let c = 0; c < order.length; c += 1) {
			addr = xlsx.utils.encode_cell({ c, r: 0 });
			id = order[c];
			title = questions[id].title || id;

			// fill header
			ws[addr] = textConverter(null, title);

			// fill body
			converter = XLSX.getCellConverter(questions[id].type);
			for (let r = 0; r < responses.length; r += 1) {
				addr = xlsx.utils.encode_cell({ c, r: r + headRowNum });
				ws[addr] = converter(
					questions[id],
					responses[r].items[id],
				) || null;
			}

			// set col width
			ws['!cols'].push({
				wch: title.length < widthLimit ? title.length : widthLimit,
			});
		}

		// set range of cells
		ws['!ref'] = `A0:${addr}`;
		return ws;
	}


	// generate workbook
	generateWB(ws) {
		const { title, description } = this;
		const wb = xlsx.utils.book_new();
		wb.Props = { Title: title, Comments: description };
		xlsx.utils.book_append_sheet(wb, ws, 'List 1');
		return wb;
	}


	write() {
		const wopts = { bookType: 'xlsx', bookSST: false, type: 'buffer' };
		return xlsx.write(this.wb, wopts);
	}


	writeFile(name = 'data.xlsx') {
		xlsx.writeFile(this.wb, name);
	}
}


export default XLSX;
