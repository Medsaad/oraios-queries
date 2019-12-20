const Parser = require('./parser');
const pgConn = require("./lib/connection");

class Query{
	_connection;
	_query = {}; 
	
	constructor(){
		this._connection = pgConn.getConn();
		this._query.select = [];
		this._query.where = '';
	}

	select(select){
		this._query.select = select;
	}

	where(conditions){
		this._conditions = conditions;
	}

	parseConditions(){
		let parser = new Parser();
		let parsed_condition = parser.parseWhere(this._conditions);
		this._query.where = parsed_condition;
	}

	orderBy(sort, sort_by){}
	groupBy(group_list){}
}

module.exports = Query;
