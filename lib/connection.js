const Pg = require("pg");

/**
 * Copyright (c) 2019-2020 Ahmed Saad Zaghloul (ahmedthegicoder@gmail.com)
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * README.md file in the root directory of this source tree.
 */

class Connection{
	/**
	 * connection property used within lib
	 */
	static _connection;

	/**
	 * connect to database using node-postgres pool
	 * @param {*} dbConfig 
	 */
	static connect(dbConfig){
		if(dbConfig.user && dbConfig.host && dbConfig.database && dbConfig.password && dbConfig.port){
			this._dbConfig = dbConfig;
		}else{
			throw new Error("Missing some configuration parameters");
		}

		let pgModConn = new Pg.Pool(this._dbConfig);
		this._connection = pgModConn;
	}

	/**
	 * returns the current connection
	 */
	static getConnection(){
		if(this._connection !== undefined)
			return this._connection;
		else
			throw new Error('No connection has been established yet!');
	}
}

module.exports = Connection;
