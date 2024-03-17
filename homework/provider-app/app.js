const { Pool } = require('pg')
const pool = new Pool({
    host: 'db',
    port: 5432,
    user: 'postgres_user',
    password: 'postgres_password',
    database: 'ozlemgizem'
})

module.exports = pool