const Parser = require('./parser');
const pgConn = require("./db/connection");

/**
 * Copyright (c) 2019-2020 Ahmed Saad Zaghloul (ahmedthegicoder@gmail.com)
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * README.md file in the root directory of this source tree.
 */

class QueryBuilder {
	/**
	 * an established connections passed to this property
	 */
	_connection;

	/**
	 * This object holds all query parts: table_name, select, where, order_by, and group_by
	 */
	_query = {};

	constructor() {
		this._connection = pgConn.getConnection();
	}


	/**
	 * executing query after all essential query params is set
	 * @param string
	 */
	async _exec(queryString) {
		let finalQueryString = queryString,
			alterProc = (!this._query.hasOwnProperty('select'))? true : false,
			connectionType = pgConn.getConnectionType(), 
			db;

		this._query = {};

		switch(connectionType){
			case 'pg':
				db = require('./db/PostgresDb');
				break;
			default:
				throw new Error ('Undefined connection type');
		}

		return await db._exec(this._connection, finalQueryString, alterProc);
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

	/**
	 * parses all query conditions and its relations using Parser class
	 * @param {array} conditions 
	 * @returns {Query}
	 */
	where(conditions) {
		this._conditions = conditions;
		let parser = new Parser();
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
	set(data){
		this._query.values = data;
		return this;
	}
}

module.exports = QueryBuilder;
