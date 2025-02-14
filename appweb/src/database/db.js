const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false, // 🔥 Accepte le certificat auto-signé de Render
    },
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
