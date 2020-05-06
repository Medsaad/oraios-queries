/**
 * Copyright (c) 2019-2020 Ahmed Saad Zaghloul (ahmedthegicoder@gmail.com)
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

class Connection {
    /**
	 * connection property used within lib
	 */
    // static _connection;
    constructor(connection) {
        this._connection = connection;
    }

    /**
	 * connect to database using node-postgres pool
	 * @param {*} connection
	 */
    /* static attach(connection) {
		this._connection = connection;
	} */

    /**
	 * returns the current connection
	 */
    getConnection() {
        if (this._connection !== undefined) return this._connection.connection;
        throw new Error('No connection has been established yet!');
    }

    /**
	 * returns the current connection type
	 */
    getConnectionType() {
        if (this._connection !== undefined) return this._connection.type;
        throw new Error('No connection has been established yet!');
    }
}

module.exports = Connection;
