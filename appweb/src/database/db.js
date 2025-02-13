require('dotenv').config({path:__dirname+'/./../.env'});
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false, // Obligatoire pour Render
    },
});


pool.on('connect', () => {
    console.log('✅ Connecté à PostgreSQL');
});

module.exports = pool;
