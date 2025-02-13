const db = require('../config/db');

const createBesoin = async ({ nomClient, libelle, competence }) => {
    const query = `
    INSERT INTO besoins (nom_client, libelle, competence)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
    const values = [nomClient, libelle, competence];
    const { rows } = await db.query(query, values);
    return rows[0];
};

module.exports = { createBesoin };
