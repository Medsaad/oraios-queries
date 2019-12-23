const Query = require('./query');
const Parser = require('./parser');

/**
 * Copyright (c) 2019-2020 Ahmed Saad Zaghloul (ahmedthegicoder@gmail.com)
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * README.md file in the root directory of this source tree.
 */

class Model extends Query{
	/**
	 * table name property will be set by the client after extending Model class
	 */
	_table_name;

	constructor(){
		super();
	}

	/**
	 * Executing query after all essential query params is set
	 */
	_exec(queryString){
		return new Promise((resolve, reject) => {
			this._connection.query(queryString).then((data) => {
				if(data.rows.length > 0){
					resolve(data.rows);
				}else{
					return reslove(false);
				}
			}).catch((err) => {
				reject(err);
			});
		});
	}

	all(){
		if(this._query.where !== undefined || this._query.groupBy !== undefined || this._query.orderBy !== undefined)
			throw new Error("Error: Can not pass conditions, group, or order with all(). Use list() instead.");

		let parser = new Parser();
		let queryString = parser.parseQueryString(this._query);
		this._exec(queryString).then((data) => {
			return data;
		}).catch((error) => {
			throw new Error(error);
		});
	}
	
	list(){
		let parser = new Parser();
		let queryString = parser.parseQueryString(this._query);
		this._exec(queryString).then((data) => {
			return data;
		}).catch((error) => {
			throw new Error(error);
		});
	}
	
	firstOne(){
		let parser = new Parser();
		let queryString = parser.parseQueryString(this._query);

		let queryString = queryString + ' limit 1';
		this._exec(queryString).then((data) => {
			if(data.length > 0)
				return data[0];
			else 
				return false;
		}).catch((error) => {
			throw new Error(error);
		});
	}
	
	find(id){
		if(this._query.where !== undefined || this._query.groupBy !== undefined || this._query.orderBy !== undefined)
			throw new Error("Error: Can not pass conditions, group, or order with find(id).");

		this._query.where = ' id = ' + id;

		let parser = new Parser();
		let queryString = parser.parseQueryString(this._query);

		this._exec(queryString).then((data) => {
			if(data.length > 0)
				return data[0];
			else 
				return false;
		}).catch((error) => {
			throw new Error(error);
		});
	}
	
	col(col){}
	
	paginate(perPage){}

	chunck(count, callback){}
}

module.exports = Model;
