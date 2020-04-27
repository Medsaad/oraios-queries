/**
 * Copyright (c) 2019-2020 Ahmed Saad Zaghloul (ahmedthegicoder@gmail.com)
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { escapeHtml } = require('./validators');

class WhereParser {
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

    /**
	 * a list of columns where you can pass html to
	 * @var {array}
	 */
    allowedHtml = [];

    constructor(options) {
        if (options.allowHtml.length > 0) {
            this.allowedHtml = options.allowHtml;
        }
        this._semi_parsed_conditions = {};
        this._level = 0;
        this._max_level = 1;
    }

    /**
     * high-level method that handles the transformation of the conditions 
     * @param {array} conditions 
     */
    parseWhere(conditions) {
        this._parseConditions(conditions);
        let final_query_conitions = '';
        if (this._semi_parsed_conditions.hasOwnProperty('cond_str')) {
            final_query_conitions = this._semi_parsed_conditions.cond_str;
        } else {
            let condition_string = this._arrayToString(this._semi_parsed_conditions);
            let level_template = this._nestLevels();
            final_query_conitions = level_template;

            for (let lvl = 1; lvl <= this._max_level; lvl++) {
                final_query_conitions = final_query_conitions.replace('#' + lvl + '#', condition_string['l' + lvl]);
            }
        }

        //reseting values for next query
        this._semi_parsed_conditions = {};
        this._level = 0;
        this._max_level = 1;

        return final_query_conitions;
    }

    /**
     * convert query array to semi-structured query while levels 'l1', 'l2', .. are keys 
     * and the values are a list of querys within that level
     * @param {array} conditions 
     */
    _parseConditions(conditions) {
        //if the condition contains relation
        if (typeof conditions == 'object') {
            this._nestedCondition(conditions);
        }//if it's a single condition
        else if (Array.isArray(conditions) && typeof conditions[0] == 'string') {
            this._readStatement(conditions);
        }//if it's inside a nested relation .cond array
        else if (Array.isArray(conditions)) {
            conditions.forEach(condition => {
                this._nestedCondition(condition);
            });
        } else {
            throw new Error("Unknown condition type for where: " + typeof conditions);
        }
    }

    /**
     * parsing through nested Condition
     * @param {array} condition 
     */
    _nestedCondition(condition) {
        //parsing AND & OR relations
        if (condition.hasOwnProperty('relation')) {
            this._level = this._level + 1;
            this._semi_parsed_conditions['l' + this._level] = {
                relation: condition.relation,
                level: this._level
            };
            //setting maximum amount of query depth.
            this._max_level = this._level;
            //recurring through inner conditions
            this._parseConditions(condition.cond);
            this._level = this._level - 1;
        }//parsing single queries
        else if (typeof condition[0] == 'string') {
            //inner conditions with no relation attribute
            this._readStatement(condition);
        }//parsing inner queries .cond
        else {
            condition.forEach(cond => {
                this._parseConditions(cond);
            });
        }
    }

    /**
     * convert query object with attributes like col, op, val to a condition statement.
     * @param {array} condition 
     */
    _readStatement(condition) {
        condition = this._validateContition(condition);

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
     * validate conitions values
     * @param {array} condition 
     */
    _validateContition(condition) {
        //check condition statement array length
        if (condition.length != 3) {
            throw new Error('Condition is corrupted. Condition array should have 3 items [column, operand, value].', condition);
        }

        //type check for condition statement
        if (isNaN(condition[2]) && !Array.isArray(condition[2]) && typeof condition[2] !== 'string' && typeof condition[2] !== 'object') {
            throw new Error("Unknown condition value data type: " + (typeof condition[2]));
        }

        //the IN statement should have array with it and vise versa
        let operand = condition[1].trim().toLowerCase();
        if (['in', 'not in'].includes(operand) && !Array.isArray(condition[2])) {
            throw new Error("Condition array value should only passed with an 'in'");
        }

        if (!['in', 'not in'].includes(operand) && Array.isArray(condition[2])) {
            throw new Error(`Invalid input passed with operand: ${operand}`);
        }

        if (typeof condition[2] === 'string' && condition[2] !== 'null') {
            //santize string
            condition[2] = condition[2].replace(/'/g, "''");

            //wrap string values in single quotes
            if (this.allowedHtml.includes(condition[0])) {
                condition[2] = "'" + condition[2] + "'";
            } else {
                condition[2] = "'" + escapeHtml(condition[2]) + "'";
            }
        }

        if (Array.isArray(condition[2]) && ['in', 'not in'].includes(operand)) {
            if (typeof condition[2][0] == 'string')
                condition[2] = condition[2].map(item => "'" + item + "'");
            condition[2] = '(' + condition[2].join() + ')';
        }

        if (typeof condition[2] === 'object' && condition[2].type === 'RAW_QUERY') {
            condition[2] = condition[2].query;
        }

        return condition;
    }

    /**
     * connect query strings with its own relation
     * @param {array} semi_parsed 
     */
    _arrayToString(semi_parsed) {
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
    _nestLevels(level_template = '', level = 1) {
        level_template += '(';
        level_template += '#' + level + '#';
        if (level < this._max_level)
            level_template = this._nestLevels(level_template, level + 1);
        level_template += ')';

        return level_template;
    }
}

module.exports = WhereParser;