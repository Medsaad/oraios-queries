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
	 * a list of columns where you can pass html to
	 * @var {array}
	 */
    allowedHtml = [];

    /**
	 * a list of columns that are allowed to be selected.
	 * @var {array}
	 */
    selectable = [];

    /**
	 * assign values to be added by default for certain columns in case of insert and update
	 * @var {object}
	 */
    defaultValue = {};
    constructor(options) {
        this.setOptions(options);
    }

    setOptions(options) {
        if ('allowHtml' in options && options.allowHtml.length > 0) {
            this.allowedHtml = options.allowHtml;
        }

        if ('selectable' in options && options.selectable.length > 0) {
            this.selectable = options.selectable;
        }

        if ('defaultValue' in options) {
            this.defaultValue = options.defaultValue;
        }
    }

    /**
     * converting _query object into string select statement
     * @param {object} query 
     */
    parseQueryString(query) {
        let queryString = '';
        if (query.select !== undefined) {
            queryString += "SELECT " + query.select;
        } else {
            if (this.selectable.length > 0) {
                let selectableColumns = this.selectable.join(', ');
                queryString += `SELECT ${selectableColumns}`;
            } else {
                queryString += "SELECT *";
            }
        }

        if (query.table === undefined)
            throw new Error("Undefined table name");
        else
            queryString += " FROM " + query.table;

        if (query.join !== undefined) {
            queryString += " " + query.join.type + " JOIN " + query.join.rightTable;
            queryString += " ON " + query.table + "." + query.join.leftField + " = " + query.join.rightTable + "." + query.join.rightField;
        }

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
    parseValues(query, action) {
        let queryString = '';

        //check if a table exists
        if (query.table === undefined)
            throw new Error("Undefined table name");

        //parse query statement according to action
        switch (action) {
            case 'update':
                queryString = this.update(query);
                break;
            case 'insert':
                queryString = this.insert(query);
                break;
            default:
                throw new Error('Undefined action ' + action);
        }
        return queryString;
    }

    /**
     * build update query string
     * @param {*} query 
     */
    update(query) {
        let queryString = '';
        //parse update statement
        queryString += "UPDATE " + query.table + " SET ";

        //check if there are values to update
        if (query.values === undefined)
            throw new Error("Undefined update values");
        let updates = [];

        //append default values if exists
        console.log('default', this.defaultValue);
        if('onUpdate' in this.defaultValue){
            query.values = {
                ...this.defaultValue.onUpdate,
                ...query.values
            };
        }

        //santize and stringify values
        for (const key in query.values) {
            let value = query.values[key];
            if (typeof value == 'string')
                if (this.allowedHtml.includes(key)) value = "'" + value + "'";
                else value = "'" + escapeHtml(value) + "'";
            updates.push(" " + key + " = " + value);
        }

        //append it to query string
        queryString += updates.join(", ");

        //check if there are condition to the update
        if (query.where !== undefined)
            queryString += " where " + query.where;

        return queryString;
    }

    /**
     * build insert query string
     * @param {*} query 
     */
    insert(query) {
        let queryString = '';
        //parse insert statement
        queryString += "INSERT INTO " + query.table + " ";

        //check if there are values to insert (return error if not)
        if (query.values === undefined)
            throw new Error("Undefined update values");

        //append default values if exists
        if('onInsert' in this.defaultValue){
            query.values = {
                ...this.defaultValue.onInsert,
                ...query.values
            };
        }

        let columns = [];
        let values = [];
        //santize and stringify values
        for (const key in query.values) {
            let value = query.values[key];
            if (typeof value == 'string')
                if (this.allowedHtml.includes(key)) value = "'" + value + "'";
                else value = "'" + escapeHtml(value) + "'";
            columns.push(key);
            values.push(value);
        }
        //append it to query string
        queryString += "(" + columns.join(", ") + ")  VALUES  (" + values.join(", ") + ")";
        return queryString;
    }

    /**
     * build a delete sql statement from query object
     * @param {object} query
     */
    parseDelete(query) {
        let queryString = '';
        queryString += "DELETE FROM " + query.table + " ";

        if (query.where !== undefined)
            queryString += " WHERE " + query.where;

        return queryString;
    }
}

module.exports = QueryParser;