/**
 * Copyright (c) 2019-2020 Ahmed Saad Zaghloul (ahmedthegicoder@gmail.com)
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */


module.exports = (connectionType) => {
    let db;
    switch (connectionType) {
    case 'pg':
        db = require('./PostgresDb');
        break;
    case 'mysql':
        db = require('./MysqlDb');
        break;
    default:
        throw new Error('Undefined connection type');
    }

    return db;
};
