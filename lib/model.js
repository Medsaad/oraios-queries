const QueryBuilder = require('./query');
const QueryParser = require('./parser/query');

/**
 * Copyright (c) 2019-2020 Ahmed Saad Zaghloul (ahmedthegicoder@gmail.com)
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * README.md file in the root directory of this source tree.
 */

class Model extends QueryBuilder {
	/**
	 * create a parser instance on load
	 * @var {Parser}
	 */
	parser;

	/**
	 * a list of columns where you can pass html to
	 * @var {array}
	 */
	allowHtml = [];

	/**
	 * those fields can not be inserted to or updated
	 * @var {array}
	 */
	selectable = [];

	constructor() {
		super();
		this.parser = new QueryParser({});
	}

	/**
	 * fetch all rows from a certain table
	 */
	all() {
		if (this._query.values !== undefined)
			console.log("Warning: Setting values in select statement will be ignored");

		if (this._query.where !== undefined || this._query.groupBy !== undefined || this._query.orderBy !== undefined)
			throw new Error("Can not pass conditions, group, or order with all(). Use list() instead.");

		this._query.table = this.table_name;

		let queryString = this.parser.parseQueryString(this._query);
		return this._exec(queryString);
	}

	/**
	 * list selected columns under certain conditions
	 */
	list() {
		if (this._query.values !== undefined)
			console.log("Warning: Setting values in select statement will be ignored");

		this._query.table = this.table_name;

		this.parser.setOptions({ allowHtml: this.allowHtml, selectable: this.selectable });
		let queryString = this.parser.parseQueryString(this._query);
		return this._exec(queryString);
	}

	/**
	 * extracting a certain column in an array
	 * @param {string} col
	 */
	async col(col) {
		if (this._query.values !== undefined)
			console.log("Warning: Setting values in select statement will be ignored");

		this._query.table = this.table_name;
		this.parser.setOptions({ allowHtml: this.allowHtml, selectable: this.selectable });

		let queryString = this.parser.parseQueryString(this._query);
		try {
			let data = await this._exec(queryString)
			return new Promise(resolve => {
				resolve(data.map(row => row[col]));
			});
		} catch (error) {
			throw new Error(error);
		}
	}

	/**
	 * skip an amount of rows and grab the next rows
	 * @param {number} offset 
	 */
	listAfter(offset) {
		if (this._query.values !== undefined)
			console.log("Warning: Setting values in select statement will be ignored");

		this._query.table = this.table_name;
		this.parser.setOptions({ allowHtml: this.allowHtml, selectable: this.selectable });

		let queryString = this.parser.parseQueryString(this._query);
		queryString = queryString + ' offset ' + offset;
		return this._exec(queryString)
	}

	/**
	 * fetch the first row found under certain conditions
	 */
	async firstOne() {
		if (this._query.values !== undefined)
			console.log("Warning: Setting values in select statement will be ignored");

		this._query.table = this.table_name;
		this.parser.setOptions({ allowHtml: this.allowHtml, selectable: this.selectable });

		let queryString = this.parser.parseQueryString(this._query);

		queryString = queryString + ' limit 1';

		try {
			let data = await this._exec(queryString)
			return new Promise(resolve => {
				resolve(data[0]);
			});
		} catch (error) {
			throw new Error(error);
		}
	}

	/**
	 * find a certain row by id
	 * @param {number} id 
	 */
	async find(id) {
		if (this._query.values !== undefined)
			console.log("Warning: Setting values in select statement will be ignored");

		if (this._query.values !== undefined || this._query.where !== undefined || this._query.groupBy !== undefined || this._query.orderBy !== undefined)
			throw new Error("Can not pass conditions, group, or order to find(id).");

		this._query.where = ' id = ' + id;
		this._query.table = this.table_name;

		this.parser.setOptions({ allowHtml: this.allowHtml, selectable: this.selectable });
		let queryString = this.parser.parseQueryString(this._query);

		try {
			let data = await this._exec(queryString)
			return new Promise(resolve => {
				if (data.length > 0) {
					let row = data[0];
					resolve(row);
				}
				else
					resolve(false);
			});
		} catch (error) {
			throw new Error(error);
		}
	}

	/**
	 * skip a certain amount of rows and start counting another amount to fetch after
	 * @param {number} skip 
	 * @param {number} count 
	 */
	slice(skip, count) {
		if (this._query.values !== undefined)
			console.log("Warning: Setting values in select statement will be ignored");

		this._query.table = this.table_name;
		this.parser.setOptions({ allowHtml: this.allowHtml, selectable: this.selectable });

		let queryString = this.parser.parseQueryString(this._query);
		queryString = queryString + ' offset ' + skip + ' limit ' + count;
		return this._exec(queryString);
	}

	/**
	 * fetch first amount of rows
	 * @param {number} count 
	 */
	first(count) {
		if (this._query.values !== undefined)
			console.log("Warning: Setting values in select statement will be ignored");

		return this.slice(0, count);
	}

	/**
	 * paginate through a certain query
	 * @param {number} perPage 
	 * @param {number} page 
	 */
	paginate(perPage, page) {
		if (this._query.values !== undefined)
			console.log("Warning: Setting values in select statement will be ignored");

		let offset = (page == 1) ? 0 : (perPage * (page - 1));
		return this.slice(offset, perPage)
	}

	/**
	 * return the query results to be processed in chunks
	 * @param {number} count 
	 * @param {function} callback 
	 */
	async chunk(count, callback) {
		if (this._query.values !== undefined)
			console.log("Warning: Setting values in select statement will be ignored");

		this._query.table = this.table_name;
		this.parser.setOptions({ allowHtml: this.allowHtml, selectable: this.selectable });

		let queryString = this.parser.parseQueryString(this._query);
		try {
			let data = await this._exec(queryString);
			let rowCount = data.length;
			let chunkCount = Math.ceil(rowCount / count);
			for (let index = 0; index < chunkCount; index++) {
				let dataSlice = data.slice(count * index, count * (index + 1));
				callback(dataSlice);
			}
		} catch (error) {
			throw new Error(error);
		}
	}

	async update() {
		if (this._query.groupBy !== undefined || this._query.orderBy !== undefined)
			throw new Error("Can not pass group or order to update statement.");

		this._query.table = this.table_name;

		this.parser.setOptions({ allowHtml: this.allowHtml, selectable: this.selectable });
		let queryString = this.parser.parseValues(this._query, 'update');
		return this._exec(queryString);
	}

	async insert() {
		if (this._query.where !== undefined || this._query.groupBy !== undefined || this._query.orderBy !== undefined)
			throw new Error("Can not pass conditions, group, or order to insert statement.");

		this._query.table = this.table_name;

		this.parser.setOptions({ allowHtml: this.allowHtml, selectable: this.selectable });
		let queryString = this.parser.parseValues(this._query, 'insert');
		return this._exec(queryString);
	}

	async delete() {
		if (this._query.values !== undefined)
			throw new Error("Can not set values in a delete statement.");

		this._query.table = this.table_name;

		this.parser.setOptions({ allowHtml: this.allowHtml, selectable: this.selectable });
		let queryString = this.parser.parseDelete(this._query);
		return this._exec(queryString);
	}
}

module.exports = Model;
