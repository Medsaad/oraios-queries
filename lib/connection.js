/**
 * Copyright (c) 2019-2020 Ahmed Saad Zaghloul (ahmedthegicoder@gmail.com)
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * README.md file in the root directory of this source tree.
 */

class Connection {
	/**
	 * connection property used within lib
	 */
	static _connection;

	/**
	 * connect to database using node-postgres pool
	 * @param {*} connection 
	 */
	static attach(connection) {
		this._connection = connection;
	}

	/**
	 * returns the current connection
	 */
	static getConnection() {
		if (this._connection !== undefined)
			return this._connection.connection;
		else
			throw new Error('No connection has been established yet!');
	}
}

module.exports = Connection;
