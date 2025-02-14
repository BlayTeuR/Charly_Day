const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes("render.com") ? { rejectUnauthorized: false } : false,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    max: 10,
});

pool.on("connect", () => {
    console.log("✅ Connecté à PostgreSQL");
});

pool.on("error", (err) => {
    console.error("❌ Erreur PostgreSQL:", err);
});

module.exports = pool;
