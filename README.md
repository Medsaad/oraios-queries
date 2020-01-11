# Node Relational Database Models (NRDBM)
![npm](https://img.shields.io/npm/v/node-db-models)
![GitHub repo size](https://img.shields.io/github/repo-size/Medsaad/node-db-models)
![Mozilla Add-on](https://img.shields.io/amo/dw/node-db-models)

## Summary

NRDBM is a light-weighted project aims to create an ORM for Databases queries (especially Relational Databases that performs complex where statements) to help developers create model classes for tables and query them using functions rather than plain string that is error-prune once the query start to gets a little long.

Currently, it’s only getting tested with postgres package ([node-postgres](https://www.npmjs.com/package/pg)) but will be expanded to [mysql2](https://www.npmjs.com/package/mysql2) very soon.

## New Features
- Supporting insert, update & delete statements.
- Escaping html form inputs with permission to skip this validation through `allowHtml` array of columns in the model class.

## Get Started
1) Install package using npm:
```
$ npm install --save node-db-models
```
- Connect to your database using pg package:
```javascript
const Pg = require("pg");

let pgModConn = new Pg.Pool({
        host: '127.0.0.1',
        user: 'admin',
        database: 'sampledb',
        password: '*******',
        port: 5432
});
```
2) Attach your connection with pg-models:
```javascript
const { Connection, Model } = require('node-db-models');
Connection.attach({
        connection: pgModConn,
        type: 'pg'
});
```
3) Create models for the tables:
```javascript
class Post extends Model {
        table_name = 'posts';
        allowHtml = ['body'];
}
```
4) Create an object of that class and start building queries:
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
- `where(conditions)`: accept an array of query conditions that can be attached by 'AND' and 'OR' relations. Supported with comparisons are `=`, `≠`, `>`, `≥`, `<`, `≤`, `like`, `ilike`, `in` & `not in` where the last 2 - `in` & `not in`- expects to have array in its value `["id", "in", [1, 2,3]]`.
- `orderBy(orderList):` accepts an array of objects where you can add a list of order columns and order directions.
- `groupBy(groupList)`: accepts a list of columns you can group by.
- `set()`: a key value pairs of data that will be inserted or updated.
5) After the query is build, you are expected to chain a method that tells the query execution class how do you want the data to be returned.
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
1) Inserting new row to database:
```javascript
let res = post.set({title: 'blog post', body: '<p>Hello World</p>'}).insert();
res.then((dataInserted) => {
        if(dataInserted){
             //do something
        }
});
```
2) Updating certain rows in database:
```javascript
let res = post.set({title: 'another blog post'}).where(['id', '=', 25]).insert();
res.then((dataUpdated) => {
        if(dataUpdated){
             //do something
        }
});
```
3) Deleting a row in database:
```javascript
let res = post.where(['id', '=', 25]).delete();
res.then((rowDeleted) => {
        if(rowDeleted){
             //do something
        }
});
```
4) find a row by id in database:
```javascript
let res = post.find(25);
res.then((row) => {
        console.log(row);
});
```
5) Select query with conditions using AND & OR with grouping:
```javascript
let post = new Post();
let postResults = post.select(['created_at::date', 'count(*) as posts'])
       .where({
                relation: 'AND',
                cond: [
                        ["created_at::date", ">", "2019-01-01" ],
                        ["author_id", "=", 25 ],
                        {
                                relation: 'OR',
                                cond: [
                                        ['created_at::date', ">", "2019-05-01"],
                                        ['created_at::date', "<", "2019-10-01"],
                                ]
                        }
                ]
        })
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

## Current work on progress

The package is consistently getting enhanced and updated. Your contributions are always welcome. Here are the functionality that is currently getting added:

- Apply table joins.
- Support MySQL.

Copyright (c) 2019-2020 Ahmed Saad Zaghloul (ahmedthegicoder@gmail.com) MIT License