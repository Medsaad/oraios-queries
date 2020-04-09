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

module.exports = { raw, distinct }