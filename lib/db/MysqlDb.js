/**
 * Copyright (c) 2019-2020 Ahmed Saad Zaghloul (ahmedthegicoder@gmail.com)
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * README.md file in the root directory of this source tree.
 */

class MysqlDb {

	constructor() {
	}

	exec(connection, queryString, process) {
		return new Promise((resolve, reject) => {
			connection.promise().query(queryString)
				.then((res) => {
					const data = res[0];
					const resp = this._handleResponse(connection, data, process);
					resolve(resp);
				}).catch((err) => {
					reject(err);
				});
		});
	}

	_handleResponse(connection, data, process) {
		if (data.length > 0) {
			//returning data
			return data;
		} else if (process.isAltered) {
			if (process.type === 'insert') {
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