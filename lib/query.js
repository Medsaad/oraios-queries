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
		 * This object holds all query parts: table_name, select, where, order_by, and group_by
		 */
		this._query = {};
	}


	/**
	 * executing query after all essential query params is set
	 * @param string
	 */
	_exec(queryString) {
		if(!this.connection)
			throw new Error('No Connection for the model.');
		let alterProc = (!this._query.hasOwnProperty('select')) ? true : false;
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

		return db._exec(this.connection.getConnection(), queryString, alterProc);
	}

	/**
	 * assigns both table name and selected columns
	 * @param array select 
	 * @returns {Query}
	 */
	select(select) {
		this._query.table = this.table_name;
		this._query.select = select.join(', ');
		return this;
	}

	join(type, rTable, leftField, rightField){
		let rightTable = rTable.table_name;
		if(!rightTable){
			throw new Error('Joined model table name not found', rTable);
		}

		this._query.join = {
			type,
			rightTable,
			leftField,
			rightField,
		};
	}

	innerJoin(rTable, leftField, rightField){
		this.join('INNER', rTable, leftField, rightField);

		return this;
	}

	leftJoin(rTable, leftField, rightField){
		this.join('LEFT', rTable, leftField, rightField);

		return this;
	}

	rightJoin(rTable, leftField, rightField){
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
		this._query.groupBy = groupList.join(', ');
		return this;
	}

	/**
	 * Update query statement
	 * @param {object} data 
	 */
	set(data) {
		this._query.values = data;
		return this;
	}
}

module.exports = QueryBuilder;
