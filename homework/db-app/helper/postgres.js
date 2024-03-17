const { Pool } = require('pg');

const connection = new Pool({
  user: 'postgres_user',
  host: 'postgres_db',
  database: 'ozlemgizem',
  password: 'postgres_password',
  port: "5432", // PostgreSQL'un default port number'i 5432'ymiş.
});

module.exports = connection;

  