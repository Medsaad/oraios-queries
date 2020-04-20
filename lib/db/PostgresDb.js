/**
 * Copyright (c) 2019-2020 Ahmed Saad Zaghloul (ahmedthegicoder@gmail.com)
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

class PostgresDb {

	constructor() {
	}

	/**
	 * execute query for postgres database
	 * @param {Connection} connection 
	 * @param {string} queryString 
	 * @param {object} process 
	 */
	exec(connection, queryString, process) {
		return new Promise((resolve, reject) => {
			if (process.isAltered && process.type === 'insert') {
				queryString += ` RETURNING ${process.pk}`;
			}

			connection.query(queryString)
				.then((data) => {
					const res = this._handleResponse(data, process);
					resolve(res);
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
		if (!process.isAltered && data.rows.length > 0) {
			//returning data
			return data.rows;
		} else if (process.isAltered) {
			if (process.type == 'insert' && data.rowCount === 1) {
				//return inserted row id
				return data.rows[0].id;
			}
			//data altered successfully - return affected rows
			let affectedRows = data.hasOwnProperty('rowCount') ? data.rowCount : false;
			return affectedRows;
		} else {
			//select statement but no data found
			return false;
		}
	}

}

module.exports = new PostgresDb();