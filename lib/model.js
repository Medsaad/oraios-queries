const Query = require('./query');

class Model extends Query{
	_table_name;

	constructor(){
		this._query.table = this._table_name;
	}

	from(){

	}

	exec(){
		
	}
}

module.exports = Model;
