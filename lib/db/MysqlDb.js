/**
 * Copyright (c) 2019-2020 Ahmed Saad Zaghloul (ahmedthegicoder@gmail.com)
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

class MysqlDb {

	constructor() {
	}

	/**
	 * execute query for mysql database
	 * @param {Connection} connection 
	 * @param {string} queryString 
	 * @param {object} process 
	 */
	exec(connection, queryString, process) {
		return new Promise((resolve, reject) => {
			connection.promise().query(queryString)
				.then((res) => {
					const data = res[0];
					const resp = this._handleResponse(data, process);
					resolve(resp);
				}).catch((err) => {
					reject(err);
				});
		});
	}

	/**
	 * handle query response depending on query operation type
	 * @param {array} data 
	 * @param {object} process 
	 */
	_handleResponse(data, process) {
		if (data.length > 0) {
			//returning data
			return data;
		} else if (process.isAltered) {
			if (process.type === 'insert' && data.affectedRows === 1) {
				return data.insertId;
			}
			//data altered successfully and no thing to return
			let affectedRows = data.hasOwnProperty('affectedRows') ? data.affectedRows : false;
			return affectedRows;
		} else {
			//select statement but no data found
			return false;
		}
	}
}

module.exports = new MysqlDb();