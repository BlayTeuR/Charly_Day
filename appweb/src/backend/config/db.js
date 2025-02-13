const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // définie dans le .env
    // éventuellement d'autres options de configuration
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};
