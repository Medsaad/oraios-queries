/**
 * Copyright (c) 2019-2020 Ahmed Saad Zaghloul (ahmedthegicoder@gmail.com)
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * README.md file in the root directory of this source tree.
 */

class Parser {
    /**
     * list of conditions and relations passed from Query class
     * @var {array}
     */
    _conditions;

    /**
     * list of semi-structured query conditions
     * @var {array}
     */
    _semi_parsed_conditions;

    /**
     * the current level of depth the parser reached into the condition nested array
     * @var {number}
     */
    _level;

    /**
     * the maximum amount of levels that query conditions have
     * @var {number}
     */
    _max_level;

    constructor() {
        this._semi_parsed_conditions = {};
        this._level = 0;
        this._max_level = 1;
    }

    /**
     * high-level method that handles the transformation of the conditions 
     * @param {array} conditions 
     */
    parseWhere(conditions) {
        this.parseConditions(conditions);
        let final_query_conitions = '';
        if (this._semi_parsed_conditions.hasOwnProperty('cond_str')) {
            final_query_conitions = this._semi_parsed_conditions.cond_str;
        } else {
            let condition_string = this.arrayToString(this._semi_parsed_conditions);
            let level_template = this.nestLevels();
            final_query_conitions = level_template;

            for (let lvl = 1; lvl <= this._max_level; lvl++) {
                final_query_conitions = final_query_conitions.replace('#' + lvl + '#', condition_string['l' + lvl]);
            }
        }

        return final_query_conitions;
    }

    /**
     * convert query array to semi-structured query while levels 'l1', 'l2', .. are keys 
     * and the values are a list of querys within that level
     * @param {array} conditions 
     */
    parseConditions(conditions) {
        conditions.forEach(condition => {
            if (condition.hasOwnProperty('relation')) {
                this._level = this._level + 1;
                this._semi_parsed_conditions['l' + this._level] = {
                    relation: condition.relation,
                    level: this._level
                };
                //setting maximum amount of query depth.
                this._max_level = this._level;
                //recurring through inner conditions
                this.parseConditions(condition.cond);
            } else {
                //inner conditions with no relation attribute
                this.readStatement(condition);
            }
        });
        this._level = this._level - 1;
    }

    /**
     * convert query object with attributes like col, op, val to a condition statement.
     * @param {*} condition 
     */
    readStatement(condition) {
        //check condition statement array length
        if (condition.length != 3)
            throw new Error('Condition is corrupted. Condition array should have 3 items [column, operand, value].', condition);

        //type check for condition statement
        if (isNaN(condition[2]) && !Array.isArray(condition[2]) && typeof condition[2] != 'string')
            throw new Error("Unknown condition value data type: " + (typeof condition[2]));
        
        //the IN statement should have array with it and vise versa
        if (
            (Array.isArray(condition[2]) && condition[1].trim().toLowerCase() != 'in') ||
            (!Array.isArray(condition[2]) && condition[1].trim().toLowerCase() == 'in')
            )
            throw new Error("Condition array value should only passed with an 'in'");

        if (typeof condition[2] == 'string')
            condition[2] = "'" + condition[2] + "'";
        if (Array.isArray(condition[2]) && condition[1].trim().toLowerCase() == 'in'){
            if(typeof condition[2][0] == 'string') 
                condition[2] = condition[2].map(item => "'" + item + "'");
            condition[2] = '(' + condition[2].join() + ')';
        }
        
        let condition_string = condition[0] + ' ' + condition[1] + ' ' + condition[2];
        //attaching condition with its level
        if (this._semi_parsed_conditions.hasOwnProperty('l' + this._level)) {
            if (this._semi_parsed_conditions['l' + this._level].hasOwnProperty('cond_str')) {
                this._semi_parsed_conditions['l' + this._level].cond_str.push(condition_string);
            } else {
                this._semi_parsed_conditions['l' + this._level].cond_str = [condition_string];
            }
        } else {
            this._semi_parsed_conditions.cond_str = condition_string;
        }
    }

    /**
     * connect query strings with its own relation
     * @param {*} semi_parsed 
     */
    arrayToString(semi_parsed) {
        let condition_string = {};

        for (let lvl = 1; lvl <= this._max_level; lvl++) {
            let relation = semi_parsed['l' + lvl].relation;
            let condition_counter = 1;
            condition_string['l' + lvl] = '';
            semi_parsed['l' + lvl].cond_str.forEach(cond => {
                condition_string['l' + lvl] += cond;
                if (condition_counter < semi_parsed['l' + lvl].cond_str.length || semi_parsed.hasOwnProperty('l' + (lvl + 1)))
                    condition_string['l' + lvl] += ' ' + relation + ' ';

                condition_counter++;
            });
        }

        return condition_string;
    }

    /**
     * create a template of nested levels to be replaced by the actual conditions 
     * for each level
     * @param {string} level_template 
     * @param {number} level 
     */
    nestLevels(level_template = '', level = 1) {
        level_template += '(';
        level_template += '#' + level + '#';
        if (level < this._max_level)
            level_template = this.nestLevels(level_template, level + 1);
        level_template += ')';

        return level_template;
    }

    parseQueryString(query) {
        let queryString = '';
        if (query.select !== undefined)
            queryString += "select " + query.select;
        else
            queryString += "select *";

        if (query.table === undefined)
            throw new Error("Undefined table name");
        else
            queryString += " from " + query.table;

        if (query.where !== undefined)
            queryString += " where " + query.where;

        if (query.groupBy !== undefined)
            queryString += " group by " + query.groupBy;

        if (query.orderBy !== undefined)
            queryString += " order by " + query.orderBy;

        return queryString;
    }
}

module.exports = Parser;