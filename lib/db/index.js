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