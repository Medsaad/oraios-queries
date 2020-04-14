# Oraios Queries
![npm](https://img.shields.io/npm/v/oraios-queries)
![npm](https://img.shields.io/npm/dw/oraios-queries)
![NPM](https://img.shields.io/npm/l/oraios-queries)

Oraios Queries (formerly [node-db-models](https://www.npmjs.com/package/node-db-models)) is a light-weighted project aims to provide class-based table representation and flexible query experience to help developers to avoid plain string queries that are error-prune.

### [Visit Documentation](https://medsaad.github.io/oraios-queries/index.html)

- [Features](#features)
- [Get Started](#get-started)
- [Code Examples](#code-examples)

Oraios Queries supports [postgres](https://www.npmjs.com/package/pg) and [mysql2](https://www.npmjs.com/package/mysql2) packages.

## Features
The package is consistently getting enhanced and updated. Your contributions are always welcome. Here are the functionality that are developed/being developed:
- **CRUD Ops**: Insert/Select/Update/Delete Data from Postgresql and MySQL with complex nested where conditions.
- **ORM**: Create class-based models for your tables with built-in features.
- **Flexible Queries**: Designed to perform complex and nested where statements, ordering and grouping.
- **Many Options**: Specify certain fields to be selectable by default, allow HTML tags to be stored in database for certain fields.
- **Pre-defined Query Executers**: Extract data in various ways: list, select one column, first item, slicing, chunking, pagination and more.
- **Light Weighted**: This package is light and can be added on APIs, web workers, .. etc.

## Get Started
Install package using npm:
```
$ npm install --save oraios-queries
```

Connect to your database using [pg](https://www.npmjs.com/package/pg) or [mysql2](https://www.npmjs.com/package/mysql2) package, then attach your connection with oraios-queries:
### For Postgres:

```javascript
const Pg = require("pg");
const { Connection, Model } = require('oraios-queries');

let pgModConn = new Pg.Pool({
        host: '127.0.0.1',
        user: 'admin',
        database: 'sampledb',
        password: '*******',
        port: 5432
});

let conn = new Connection({
        connection: pgModConn,
        type: 'pg'
});
```

### For MySQL:
```javascript

const mysql = require('mysql2');
const { Connection, Model } = require('oraios-queries');

const mysqlConn = mysql.createPool({
        host: '127.0.0.1',
        user: 'admin',
        password: '*****',
        database: 'sampledb',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
});

let conn = new Connection({
        connection: mysqlConn,
        type: 'mysql'
});
```
That's it. From now on everything will be the same across different connections.n rows in database.

### [Visit Documentation](https://medsaad.github.io/oraios-queries/doc.html)

## Code Examples
- Create a Model:
```javascript
const { Model, Util } = require('oraios-queries');

class Post extends Model {
        tableName = 'posts';
        allowHtml = ['body'];
        selectable = ['title', 'body', 'author_id', 'created_at::date'];
        
        //optional, default value is 'id'
        primaryKey = 'uuid';

        //the object created above
        connection = conn;
        
        //optional defaul value setup
        defaultValue = {
                onInsert: {
                        created_at: Util.timestamp(),
                        updated_at: Util.timestamp()
                },
                onUpdate: {
                        updated_at: Util.timestamp()
                }
        }
}
```
- Inserting new row to database:
```javascript
let insertedId = await post.set({title: 'blog post', body: '<p>Hello World</p>'}).insert();
if(insertedId){
        //success
}
```
- Updating certain rows in database:
```javascript
let affectedRows = await post.set({title: 'another blog post'}).where(['id', '=', 25]).update();
if(affectedRows !== 0){
        //update successful
}
```
- Deleting a row in database:
```javascript
let rowDeleted = await post.where(['id', '=', 25]).delete();
if(rowDeleted !== 0){
        //delete successful
}
```
- Find a row by id in database:
```javascript
let row = await post.find(25);
```
- Perform a query with joins:
```javascript
let userJoinQuery = user.innerJoin(post, 'id', 'post_author').select(['user_email']);
let userEmails = await userJoinQuery.list();
```
- Select query with conditions using AND & OR with grouping:
```javascript
let post = new Post();
let conditions = nestedConditions = { cond: [] };

conditions.relation = 'AND';
conditions.cond.push(["created_at::date", ">", "2019-01-01" ]);
conditions.cond.push(["author_id", "=", 25 ]);

//include a nested condition
nestedConditions.relation = 'OR';
nestedConditions.cond.push(['created_at::date', ">", "2019-05-01"]);
nestedConditions.cond.push(['created_at::date', "<", "2019-10-01"]);

//add nested condition into the list of conditions
conditions.cond.push(nestedConditions);
let postQuery = post.select(['created_at::date', 'count(*) as posts'])
        .where(conditions)
        .groupBy(['created_at::date'])
        .orderBy([{col: 'created_at::date', order: 'desc'}]);
        
let postRes = await postQuery.list();
```
The previous statement will produce a query like this:
```sql
SELECT created_at::date, count(*) as posts 
FROM posts 
WHERE (
        created_at::date > "2019-01-01" AND 
        author_id, "=", 25 AND
        (
                created_at::date > "2019-05-01" OR
                created_at::date < "2019-10-01"
        )
) 
GROUP BY created_at::date 
ORDER BY created_at::date desc;
```

Copyright (c) 2019-2020 Ahmed Saad Zaghloul (ahmedthegicoder@gmail.com) MIT License