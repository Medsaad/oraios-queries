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