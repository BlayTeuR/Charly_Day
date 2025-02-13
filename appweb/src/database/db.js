require('dotenv').config({path:__dirname+'/./../.env'});
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});


pool.on('connect', () => {
    console.log('✅ Connecté à PostgreSQL');
});

module.exports = pool;
