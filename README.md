# pg-models for node.js

## Summary

pg-models is a project aims to create an ORM for RDBMS to help developers create model classes for tables and query them using functions rather than plain string that is error-prune once the query start to gets a little long.

Currently, it's only getting tested with postgres package ([node-postgres](https://www.npmjs.com/package/pg)) but will be expanded to [mysql](https://www.npmjs.com/package/mysql) very soon.

## Get Started

- Connect to your database using pg package:

        const Pg = require("pg");
        const { Connection, Model } = require('pg-models');
        
        let pgModConn = new Pg.Pool({
        	host: '127.0.0.1',
        	user: 'admin',
        	database: 'sampledb',
        	password: '*******',
        	port: 5432
        });

- Attach your connection with pg-models:

        Connection.attach({
        	connection: pgModConn,
          type: 'pg'
        });

- Create models for the tables:

        class Post extends Model {
          table_name = 'posts'
        }

- Create an object of that class and start building queries:

        let page = new Page();
        let postResults = page.select(['title', 'body', 'created_at::date'])
             .where([
        								["created_at", ">", "2019-01-01" ], //also !=, like, ilike
                   ])
              .orderBy([
                 {col: 'id', order: 'desc'});

Copyright (c) 2019-2020 Ahmed Saad Zaghloul (ahmedthegicoder@gmail.com)
MIT License