const { escapeHtml } = require('../parser/validators');

/**
 * If a part of a query wrapped with this function then 
 * it's query literate
 * @param {string} q 
 */
export const raw = (q) => {
    if (typeof q === 'string') {
        return escapeHtml(q);
    }

    throw new Error('Unkown Query');
};