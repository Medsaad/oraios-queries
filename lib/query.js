const WhereParser = require('./parser/where');
const Connection = require("./db/connection");

/**
 * Copyright (c) 2019-2020 Ahmed Saad Zaghloul (ahmedthegicoder@gmail.com)
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * README.md file in the root directory of this source tree.
 */

class QueryBuilder {
	/**
	 * Required Props from a Model
	 * - Table name
	 * - Connectio
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

		let process = {
			isAltered: (!this._query.hasOwnProperty('select')) ? true : false,
		};

		if (process.isAltered) {
			process.type = (queryString.toLowerCase().includes('insert')) ? 'insert' : 'update';
			process.pk = this.primaryKey;
		}

		this._query = {};
		let connectionType = this.connection.getConnectionType(),
			db;

		switch (connectionType) {
			case 'pg':
				db = require('./db/PostgresDb');
				break;
			case 'mysql':
				db = require('./db/MysqlDb');
				break;
			default:
				throw new Error('Undefined connection type');
		}

		return db.exec(this.connection.getConnection(), queryString, process);
	}

	/**
	 * assigns both table name and selected columns
	 * @param array select 
	 * @returns {Query}
	 */
	select(select) {
		if (!Array.isArray(select)) {
			throw new Error(`select() parameter one should be an array ${typeof select} given.`);
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

	join(type, rTable, leftField, rightField) {
		if (!(rTable instanceof QueryBuilder)) {
			throw new Error(`join first parameter should be an object of a certain model ${typeof rTable} given.`);
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

	innerJoin(rTable, leftField, rightField) {
		this.join('INNER', rTable, leftField, rightField);

		return this;
	}

	leftJoin(rTable, leftField, rightField) {
		this.join('LEFT', rTable, leftField, rightField);

		return this;
	}

	rightJoin(rTable, leftField, rightField) {
		this.join('RIGHT', rTable, leftField, rightField);

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
			throw new Error(`orderBy() parameter one should be an array ${typeof orderByList} given.`);
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
	 * @returns {Query} 
	 */
	groupBy(groupList) {
		if (!Array.isArray(groupList)) {
			throw new Error(`groupBy() parameter one should be an array ${typeof groupList} given.`);
		}

		this._query.groupBy = groupList.join(', ');
		return this;
	}

	/**
	 * Update query statement
	 * @param {object} data 
	 */
	set(data) {
		if (typeof data !== 'object') {
			throw new Error(`set() parameter one should be an object ${typeof data} given.`);
		}

		//sanitizing data
		for (const col in data) {
			if (typeof data[col] === 'string') {
				data[col] = data[col].replace(/'/g, "''");
			}
		}

		this._query.values = data;
		return this;
	}
}

module.exports = QueryBuilder;
