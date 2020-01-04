# README

Created: Jan 04, 2020 1:00 PM
Created By: Ahmed saad
Last Edited By: Ahmed saad
Last Edited Time: Jan 04, 2020 1:25 PM

# node-db-models npm package

## Summary

pg-models is a project aims to create an ORM for RDBMS to help developers create model classes for tables and query them using functions rather than plain string that is error-prune once the query start to gets a little long.

Currently, it’s only getting tested with postgres package ([node-postgres](https://www.npmjs.com/package/pg)) but will be expanded to [mysql](https://www.npmjs.com/package/mysql) very soon.

## Get Started

- Connect to your database using pg package:

        const Pg = require("pg");
        
          let pgModConn = new Pg.Pool({
              host: '127.0.0.1',
              user: 'admin',
              database: 'sampledb',
              password: '*******',
              port: 5432
          });

- Attach your connection with pg-models:

        const { Connection, Model } = require('node-db-models');
          Connection.attach({
              connection: pgModConn,
                  type: 'pg'
          });

- Create models for the tables:

        class Post extends Model {
            table_name = 'posts'
          }

- Create an object of that class and start building queries:

        let post = new Post();
        let postResults = post.select(['title', 'body', 'created_at::date'])
               .where([
                  ["created_at", ">", "2019-01-01" ], //also !=, like, ilike
                     ])
               .orderBy([
                   {col: 'id', order: 'desc'}
                     ]);

    You can chain the following methods to your model object:

    - `.select(columns):` passes an array of columns to your query builder.
    - `.where(conditions)`: accept an array of query conditions that can be attached by 'AND' and 'OR' relations.
    - `.orderBy(orderList):` accepts an array of objects where you can add a list of order columns and order directions.
    - `groupBy(groupList)`: accepts a list of columns you can group by.
- After the query is build, you are expected to chain a method that tells the query execution class how do you want the data to be returned.

        postResults.list().then(data => {
            console.log(data);
        });

    All the following functions return a promise:

    - `.list()`: lists all results found in the form of array of objects.
    - `col(column_name)`: returns an array of values of a certain column.
    - `listAfter(offset)`: skip an *offset* amount of  values and then list all values after it.
    - `firstOne()`: returns an object of the first row that meets conditions specified.
    - `find(id)`: returns an object of a certain model using it's *id*
    - `slice(skip, count)`: returns a *count* amount of rows after skipping another amount of rows.
    - `first(count)`: return the first amount of rows that meets conditions specified.
    - `paginate(perPage, currentPage)`: paginate through your results by passing rows per page and your current page.
    - `chunk(count, callback)`: instead of returning all elements in one chunk, you can process them in pieces using this method. You can pass the amount per chunk and the callback function to specify what you want to do for each chunk.

Copyright (c) 2019-2020 Ahmed Saad Zaghloul (ahmedthegicoder@gmail.com) MIT License