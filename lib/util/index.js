/**
 * Copyright (c) 2019-2020 Ahmed Saad Zaghloul (ahmedthegicoder@gmail.com)
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { escapeHtml } = require('../parser/validators');

/**
 * If a part of a query wrapped with this function then 
 * it's query literate
 * @param {string} q 
 */
const raw = (q) => {
    if (typeof q === 'string') {
        return {
            query: escapeHtml(q),
            type: 'RAW_QUERY'
        };
    }

    throw new Error('Unkown Query');
};

/**
 * apply distinct on (col) inside a query
 * @param {string} q 
 */
const distinct = (q) => {
    if (typeof q === 'string') {
        q = escapeHtml(q);
        return {
            query: `DISTINCT ON (${q})`,
            type: 'DISTINCT'
        };
    }

    throw new Error('Unkown Query');
};

/**
 * takes a date object and return a DB timestamp format:
 * YYYY-MM-dd HH:mm:ss
 * @param {Date} date 
 */
const timestamp = (date = new Date()) => {
    if(!(date instanceof Date)){
        throw new Error('timestamp parameter need to be a Date object');
    }
    
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const hour = date.getHours();
    const min = date.getMinutes();
    const sec = date.getSeconds();

    return `${year}-${month}-${day} ${hour}:${min}:${sec}`;
}  

module.exports = { raw, distinct, timestamp }