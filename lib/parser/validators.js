/**
 * Copyright (c) 2019-2020 Ahmed Saad Zaghloul (ahmedthegicoder@gmail.com)
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * README.md file in the root directory of this source tree.
 */

 const escapeHtml = function(str){
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

module.exports = { escapeHtml };