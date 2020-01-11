const { escapeHtml } = require('./validators');
/**
 * Copyright (c) 2019-2020 Ahmed Saad Zaghloul (ahmedthegicoder@gmail.com)
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * README.md file in the root directory of this source tree.
 */

class QueryParser {
    /**
     * converting _query object into string select statement
     * @param {object} query 
     */
    parseQueryString(query) {
        let queryString = '';
        if (query.select !== undefined)
            queryString += "SELECt " + query.select;
        else
            queryString += "SELECt *";

        if (query.table === undefined)
            throw new Error("Undefined table name");
        else
            queryString += " FROM " + query.table;

        if (query.where !== undefined)
            queryString += " WHERE " + query.where;

        if (query.groupBy !== undefined)
            queryString += " GROUP BY " + query.groupBy;

        if (query.orderBy !== undefined)
            queryString += " ORDER BY " + query.orderBy;

        return queryString;
    }

    /**
     * convert query object along with an action (insert | update) to a sql statement
     * @param {object} query 
     * @param {string} action 
     */
    parseValues(query, action){
        let queryString = '';
        switch(action){
            case 'update':
                if (query.table === undefined)
                    throw new Error("Undefined table name");
                
                queryString += "UPDATE " + query.table + " SET ";

                if (query.values === undefined)
                    throw new Error("Undefined update values");
                let updates = [];
                for (const key in query.values) {
                    let value = query.values[key];
                    if (typeof value == 'string')
                        value = "'" + escapeHtml(value) + "'";
                    updates.push(" " + key + " = " + value); 
                }
                
                queryString += updates.join(", ");

                if (query.where !== undefined)
                    queryString += " where " + query.where;

                break;
            case 'insert':
                if (query.table === undefined)
                    throw new Error("Undefined table name");
                
                queryString += "INSERT INTO " + query.table + " ";

                if (query.values === undefined)
                    throw new Error("Undefined update values");
                let columns = [];
                let values = [];
                for (const key in query.values) {
                    let value = query.values[key];
                    if (typeof value == 'string')
                        value = "'" + escapeHtml(value) + "'";
                    columns.push(key); 
                    values.push(value);
                }
                
                queryString += "(" + columns.join(", ") + ")  VALUES  (" + values.join(", ") + ")";
                break;
            default:
                throw new Error('Undefined action ' + action);
        }
        return queryString;
    }

    /**
     * build a delete sql statement from query object
     * @param {object} query
     */
    parseDelete(query){
        let queryString = '';
        queryString += "DELETE FROM " + query.table + " ";

        if (query.where !== undefined)
            queryString += " WHERE " + query.where;

        return queryString;
    }
}

module.exports = QueryParser;