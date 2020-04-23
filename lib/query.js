/**
 * Copyright (c) 2019-2020 Ahmed Saad Zaghloul (ahmedthegicoder@gmail.com)
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const WhereParser = require('./parser/where');
const { sanitizeString } = require('./parser/validators');
const dbInit = require('./db');

class QueryBuilder {
	/**
	 * the type of the operation (select, update, insert, delete)
	 * @var {string}
	 */
	opType = 'select';

	/**
	 * Required Props from a Model
	 * - Table name
	 * - Connection
	 */
	constructor() {
		/**
		 * This object holds all query parts: tableName, select, where, order_by, and group_by
		 */
		this._query = {};
	}


	/**
	 * executing query after all essential query params is set
	 * @param string
	 */
	_exec(queryString) {
		if (!this.connection) {
			throw new Error('No Connection for the model.');
		}

		let operation = {
			isAltered: (this.opType !== 'select') ? true : false,
			type: this.opType,
			pk: this.primaryKey
		};

		//reset query object
		this._query = {};

		const connectionType = this.connection.getConnectionType();
		const db = dbInit(connectionType);

		return db.exec(this.connection.getConnection(), queryString, operation);
	}

	/**
	 * assigns both table name and selected columns
	 * @param array select 
	 * @returns {Query}
	 */
	select(select) {
		if (!Array.isArray(select)) {
			throw new Error(`select() parameter 1 should be an array, ${typeof select} given.`);
		}

		this._query.select = '';
		let distinctAdded = false;
		//validating select fields
		for (let index = 0; index < select.length; index++) {
			let field = select[index];
			if (typeof field === 'string') {
				continue;
			} else if (typeof field === 'object' && field.type === 'DISTINCT' && !distinctAdded) {
				this._query.select += field.query;
				select.splice(index, 1);
				distinctAdded = true;
			} else {
				throw new Error('Unknown data type select field', field);
			}
		};

		this._query.select += select.join(', ');
		return this;
	}

	/**
	 * register join details into query object
	 * @param {string} type 
	 * @param {Model} rTable 
	 * @param {string} leftField 
	 * @param {string} rightField 
	 */
	_join(type, rTable, leftField, rightField) {
		if (!(rTable instanceof QueryBuilder)) {
			throw new Error(`join parameter 1 should be an object of a certain model, ${typeof rTable} given.`);
		}

		let rightTable = rTable.tableName;
		if (!rightTable) {
			throw new Error('Joined model table name not found', rTable);
		}

		this._query.join = {
			type,
			rightTable,
			leftField,
			rightField,
		};
	}

	/**
	 * apply inner join to query
	 * @param {Model} rTable 
	 * @param {string} leftField 
	 * @param {string} rightField 
	 */
	innerJoin(rTable, leftField, rightField) {
		this._join('INNER', rTable, leftField, rightField);

		return this;
	}

	/**
	 * apply left join to query
	 * @param {Model} rTable 
	 * @param {string} leftField 
	 * @param {string} rightField 
	 */
	leftJoin(rTable, leftField, rightField) {
		this._join('LEFT', rTable, leftField, rightField);

		return this;
	}

	/**
	 * apply right join to query
	 * @param {Model} rTable 
	 * @param {string} leftField 
	 * @param {string} rightField 
	 */
	rightJoin(rTable, leftField, rightField) {
		this._join('RIGHT', rTable, leftField, rightField);

		return this;
	}

	/**
	 * parses all query conditions and its relations using Parser class
	 * @param {array} conditions 
	 * @returns {Query}
	 */
	where(conditions) {
		this._conditions = conditions;

		let parser = new WhereParser({ allowHtml: this.allowHtml });
		let parsed_condition = parser.parseWhere(this._conditions);

		this._query.where = parsed_condition;

		return this;
	}

	/**
	 * assigns multiple order by columns as well as its directions
	 * @param {array} orderByList 
	 * @returns {Query}
	 */
	orderBy(orderByList) {
		if (!Array.isArray(orderByList)) {
			throw new Error(`orderBy() parameter 1 should be an array, ${typeof orderByList} given.`);
		}

		let orderByParsedList = [];
		orderByList.forEach(orderBy => {
			orderByParsedList.push(orderBy.col + ' ' + orderBy.order);
		});
		this._query.orderBy = orderByParsedList.join(', ');
		return this;
	}

	/**
	 * assigns multiple group by columns
	 * @param {array} groupList
	 */
	groupBy(groupList) {
		if (!Array.isArray(groupList)) {
			throw new Error(`groupBy() parameter 1 should be an array, ${typeof groupList} given.`);
		}

		this._query.groupBy = groupList.join(', ');
		return this;
	}

	/**
	 * set a key value pairs of data that will be inserted or updated. Used only with insert and update.
	 * @param {object} data 
	 */
	set(data) {
		if (typeof data !== 'object') {
			throw new Error(`set() parameter 1 should be an object, ${typeof data} given.`);
		}

		//sanitizing data
		for (const col in data) {
			if (data[col] === undefined) {
				throw new Error(`Value for column ${col} can not be undefined.`);
			}

			data[col] = sanitizeString(data[col], col, this.allowHtml);
		}

		this._query.values = data;
		return this;
	}

	/**
	 * Insert multiple rows at a time query statement
	 * @param {object} data 
	 */
	setMany(data) {
		if (!Array.isArray(data)) {
			throw new Error(`setMany() parameter 1 should be an array, ${typeof data} given.`);
		}

		//sanitizing data
		data.map((row) => {
			for (const col in row) {
				if (row[col] === undefined) {
					throw new Error(`Value for column ${col} can not be undefined.`);
				}

				row[col] = sanitizeString(row[col], col, this.allowHtml);
			}
		})

		this._query.values = data;
		return this;
	}
}

module.exports = QueryBuilder;
