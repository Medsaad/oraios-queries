const pgConn = require("pg");
const Model = require('./model');

class Connection{
	static _connection;
	static connect(dbConfig){
		if(dbConfig.user && dbConfig.host && dbConfig.database && dbConfig.password && dbConfig.port){
			this._dbConfig = dbConfig;
		}else{
			throw console.error("Missing some configuration parameters");
		}

		let pgModConn = new pgConn.Pool(this._dbConfig);
		this._connection = pgModConn;
	}

	static getConnection(){
		return this._connection;
	}
}

module.exports = Connection;
