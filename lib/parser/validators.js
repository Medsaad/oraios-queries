/**
 * Copyright (c) 2019-2020 Ahmed Saad Zaghloul (ahmedthegicoder@gmail.com)
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const escapeHtml = (str) => {
    let tagBody = '(?:[^"\'>]|"[^"]*"|\'[^\']*\')*';

    let tagOrComment = new RegExp(
        '<(?:'
        // Comment body.
        + '!--(?:(?:-*[^->])*--+|-?)'
        // Special "raw text" elements whose content should be elided.
        + '|script\\b' + tagBody + '>[\\s\\S]*?</script\\s*'
        + '|style\\b' + tagBody + '>[\\s\\S]*?</style\\s*'
        // Regular name
        + '|/?[a-z]'
        + tagBody
        + ')>',
        'gi');

    let startStr;
    do {
        startStr = str;
        str = str.replace(tagOrComment, '');
    } while (str !== startStr);
    return str.replace(/</g, '&lt;');
}

/**
 * santize string right before storing it to db
 * @param {string} str 
 * @param {string} key 
 * @param {array} allowedHtml 
 */
const sanitizeString = (str, key, allowedHtml) => {
    if (typeof str === 'string') {
        
        //escape single quotes
        str = str.replace(/'/g, "''");

        if (allowedHtml && allowedHtml.includes(key)) {
            return str;
        }

        //strip html tags
        str = escapeHtml(str);
    }

    return str;
}

module.exports = { escapeHtml, sanitizeString };