import moment from 'moment';
import AbstractModel from './AbstractModel';
import { isString, isBool, isDate } from '../utils/extras';


class Collecting extends AbstractModel {
	/*----------------------------------------------------------------------------
	------------------------------- STATIC METHODS -------------------------------
	----------------------------------------------------------------------------*/

	static create({ props }) {
		const clct = new Collecting(props);
		clct.check();
		return clct;
	}


	/*----------------------------------------------------------------------------
	------------------------------ INSTANCE METHODS ------------------------------
	----------------------------------------------------------------------------*/

	start() {
		this.start = new Date();
	}
}


/*------------------------------------------------------------------------------
----------------------------- PROTOTYPE PROPERTIES -----------------------------
------------------------------------------------------------------------------*/

Collecting.prototype.tableName = 'collecting';

Collecting.prototype.entityName = 'collecting';

Collecting.prototype.props = {
	// values received from client
	stop: { writable: true, readable: true, check: d => d === null || moment(d, 'YYYY-MM-DD', true).isValid() },
	refilling: { writable: true, readable: true, check: isBool },

	// values set by model
	id: { writableOn: 'create', readable: true },
	start: { writableOn: 'create', readable: true, check: isDate },
	shared: { writable: true, readable: true, check: s => s && isString(s) },
};


Object.freeze(Collecting);


export default Collecting;
