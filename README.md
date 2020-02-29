# Node Relational Database Models (NRDBM)
![npm](https://img.shields.io/npm/v/node-db-models)
![npm](https://img.shields.io/npm/dw/node-db-models)
![NPM](https://img.shields.io/npm/l/node-db-models)

- [Summary](#summary)
- [New & Future Features](#new--future-features)
- [Get Started](#get-started)
- [Code Examples](#code-examples)

## Summary

NRDBM is a light-weighted project aims to create an ORM for Databases queries (especially Relational Databases that performs complex where statements) to help developers create model classes for tables and query them using functions rather than plain string that is error-prune once the query start to gets a little long.

NRDBM supports [postgres](https://www.npmjs.com/package/pg) and [mysql2](https://www.npmjs.com/package/mysql2) packages.

## Current & Future Features
The package is consistently getting enhanced and updated. Your contributions are always welcome. Here are the functionality that are developed/being developed:
- **Insert/Select/Update/Delete** Data from **Postgresql** and **MySQL** with complex nested where conditions.
- Create **class passed models** for your tables.
- **New**: Specify certain fields to be **selectable** by default instead of bringing everything in `SELECT *`.
- Allow **HTML data** to be added in certain fields.
- Extract data in various ways: **list, select one column, first item, slicing, chunking, pagination**.
- Apply **joins** between tables.
- **Soon**: Event Handling. Ex: onInsert(), onUpdate(), onSelect() functions within model classes.

## Get Started
Install package using npm:
```
$ npm install --save node-db-models
```

Connect to your database using [pg](https://www.npmjs.com/package/pg) or [mysql2](https://www.npmjs.com/package/mysql2) package, then attach your connection with node-db-models:
### For Postgres:

```javascript
const Pg = require("pg");
const { Connection, Model } = require('node-db-models');

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
const { Connection, Model } = require('node-db-models');

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
That's it. From now on everything will be the same acros different connections.Lets create models for our databse tables that will extend `Model` class that we imported above:
```javascript
class Post extends Model {
        tableName = 'posts';
        allowHtml = ['body'];
        selectable = ['title', 'body', 'author_id', 'created_at::date'];
        connection = conn; //the object created above
}
```
- `tableName`: the table name in database where you need to apply the connection.
- `allowHtml`: do not strip html for this column.
- `selectable`: select those column by default when not calling select() method.
- `connection`: pass the connection object after initiating `new Connection()`.

Create an object of that class and start building queries:
```javascript
let post = new Post();
let postResults = post.select(['title', 'body', 'created_at::date'])
        .where(["created_at", ">", "2019-01-01" ])
        .orderBy([
                {col: 'id', order: 'desc'}
        ]);
```
You can chain the following methods to your model object:
- `select(columns):` passes an array of columns to your query builder.
- `innerJoin(rightModel, leftField, rightField)`, `leftJoin(rightModel, leftField, rightField)` and `rightJoin(rightModel, leftField, rightField):`: the 3 methods performs inner, left and right joins (respectively) between the current model and another model. The first parameter should be an object from the model that you need join with. The second should be the column from the current model and third parameter should be the column from the model that was added in the first parameter.
- `where(conditions)`: accept an array of query conditions that can be attached by 'AND' and 'OR' relations. Supported with comparisons are `=`, `≠`, `>`, `≥`, `<`, `≤`, `like`, `ilike`, `in` & `not in` where the last 2 - `in` & `not in`- expects to have array in its value `["id", "in", [1, 2,3]]`.
- `orderBy(orderList):` accepts an array of objects where you can add a list of order columns and order directions.
- `groupBy(groupList)`: accepts a list of columns you can group by.
- `set(values)`: a key value pairs of data that will be inserted or updated.

After the query is build, you are expected to chain a method that tells the query execution class how do you want the data to be returned.
```javascript
postResults.list().then(data => {
        console.log(data);
});
```
All the following functions return a promise:
- `list()`: lists all results found in the form of array of objects.
- `col(column_name)`: returns an array of values of a certain column.
- `listAfter(offset)`: skip an *offset* amount of  values and then list all values after it.
- `firstOne()`: returns an object of the first row that meets conditions specified.
- `find(id)`: returns an object of a certain model using it's *id*
- `slice(skip, count)`: returns a *count* amount of rows after skipping another amount of rows.
- `first(count)`: return the first amount of rows that meets conditions specified.
- `paginate(perPage, currentPage)`: paginate through your results by passing rows per page and your current page.
- `chunk(count, callback)`: instead of returning all elements in one chunk, you can process them in pieces using this method. You can pass the amount per chunk and the callback function to specify what you want to do for each chunk.
- `insert()`: get chained after `set(data)` to insert data into database.
- `update()`: get chained after `set(data)` and a group of `where()` conditions to update certain rows in database.
- `delete()`: get chained after a group of `where()` conditions to delete certain rows in database.

## Code Examples
- Inserting new row to database:
```javascript
let res = post.set({title: 'blog post', body: '<p>Hello World</p>'}).insert();
res.then((dataInserted) => {
        if(dataInserted){
             //do something
        }
});
```
- Updating certain rows in database:
```javascript
let res = post.set({title: 'another blog post'}).where(['id', '=', 25]).update();
res.then((dataUpdated) => {
        if(dataUpdated){
             //do something
        }
});
```
- Deleting a row in database:
```javascript
let res = post.where(['id', '=', 25]).delete();
res.then((rowDeleted) => {
        if(rowDeleted){
             //do something
        }
});
```
- find a row by id in database:
```javascript
let res = post.find(25);
res.then((row) => {
        console.log(row);
});
```
- perform a query with joins:
```javascript
let userEmails = user.innerJoin(post, 'id', 'post_author').select(['user_email'])
userEmails.list().then((data) => {
                    console.log(data);
                });
```
- Select query with conditions using AND & OR with grouping:
```javascript
let post = new Post();
let conditions = {
        relation: 'AND',
        cond: []
};
conditions.cond.push(["created_at::date", ">", "2019-01-01" ]);
conditions.cond.push(["author_id", "=", 25 ]);
//include a nested condition
let nestedConditions = {
        relation: 'OR',
        cond: []
};
nestedConditions.cond.push(['created_at::date', ">", "2019-05-01"]);
nestedConditions.cond.push(['created_at::date', "<", "2019-10-01"]);
//add nested condition into the list of conditions
conditions.cond.push(nestedConditions);
let postResults = post.select(['created_at::date', 'count(*) as posts'])
       .where(conditions)
       .groupBy(['created_at::date'])
       .orderBy([{col: 'created_at::date', order: 'desc'}]);
       
postResults.then(data => {
        console.log(data);
}).catch(error => {
        console.log(error);
});
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