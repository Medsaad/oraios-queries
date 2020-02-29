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

	_exec(connection, queryString, alterProc) {
		return new Promise((resolve, reject) => {
			connection.promise().query(queryString)
				.then((res) => {
					let data = res[0];
					if (data.length > 0) {
						//returning data
						return resolve(data);
					} else if (alterProc) {
						//data altered successfully and no thing to return
						return resolve(true);
					} else {
						//select statement but no data found
						return resolve(false);
					}
				}).catch((err) => {
					reject(err);
				});
		});
	}
}

module.exports = new MysqlDb();