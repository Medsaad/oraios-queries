const Query = require('./query');

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
	exec(){
		return new Promise((resolve, reject) => {
			let queryString = '';
			if(this._query.select !== undefined)
				queryString += "select " + this._query.select;
			else
				queryString += "select *";

			if(this._query.table === undefined)
				throw new Error("Undefined table name");
			else 
				queryString += " from " + this._query.table;

			if(this._query.where !== undefined)
				queryString += " where " + this._query.where;
				
			if(this._query.orderBy !== undefined && this._query.groupBy !== undefined)
				throw new Error("Can not use group by and order by in the same statement!");;

			if(this._query.orderBy !== undefined)
				queryString += " order by " + this._query.orderBy;
				
			if(this._query.groupBy !== undefined)
				queryString += " group by " + this._query.groupBy;

			this._connection.query(queryString).then((data) => {
				if(data.rows.length > 0){
					resolve(data.rows);
				}else{
					return reslove(false);
				}
			}).catch((err) => {
				console.log(err);
				reject(err);
			});
		});
	}

	all(){}

	paginate(perPage){}

	list(){}

	firstOne(){}

	find(id){}

	col(col){}

	chunck(count, callback){}
}

module.exports = Model;
