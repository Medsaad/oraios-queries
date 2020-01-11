class PostgresDb{

    constructor(){
    }

    _exec(connection, queryString, alterProc){
        return new Promise((resolve, reject) => {
			connection.query(queryString).then((data) => {
				if (data.rows.length > 0) { 
					//returning data
					return resolve(data.rows);
				}else if(alterProc){ 
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

module.exports = new PostgresDb();