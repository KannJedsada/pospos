const pool = require("../config/db");

class Unit {
  static async get_unit() {
    const res = await pool.query(`SELECT * FROM units`);
    return res.rows;
  }

  static async add_unit(data) {
    const { name } = data;
    const res = await pool.query(
      `INSERT INTO units(u_name) VALUES($1) RETURNING *`,
      [name]
    );
    return res.rows[0];
  }

  static async edit_unit(id, data) {
    const { name } = data;
    const res = await pool.query(
      `UPDATE units
         SET 
            u_name = $1
         WHERE id = $2
         RETURNING *`,
      [name, id]
    );
    return res.rows[0];
  }

  static async delete_unit(id) {
    const res = await pool.query(
      `DELETE FROM units WHERE id = $1 RETURNING *`,
      [id]
    );
    return res.rows[0];
  }

  static async get_unit_conver() {
    const res = await pool.query(`
    SELECT 
    uc.*, 
    u1.u_name AS from_unit_name, 
    u2.u_name AS to_unit_name
    FROM unit_conversions uc
    INNER JOIN units u1 ON uc.from_unit_id = u1.id
    INNER JOIN units u2 ON uc.to_unit_id = u2.id`);
    return res.rows;
  }

  static async add_unit_conver(data) {
    const { from_unit_id, to_unit_id, conversion_rate } = data;

    const res = await pool.query(
      `INSERT INTO unit_conversions (from_unit_id, to_unit_id, conversion_rate) 
       VALUES ($1, $2, $3) RETURNING *`,
      [from_unit_id, to_unit_id, conversion_rate]
    );

    return res.rows[0];
  }

  static async edit_unit_conver(id, data) {
    const { from_unit_id, to_unit_id, conversion_rate } = data;
    const res = await pool.query(
      `UPDATE unit_conversions 
        SET from_unit_id = $1,
        to_unit_id = $2, conversion_rate = $3
      WHERE id = $4`,
      [from_unit_id, to_unit_id, conversion_rate, id]
    );
    return res.rows[0];
  }

  static async delete_unit_conver(id) {
    const res = await pool.query(`DELETE FROM unit_conversions WHERE id = $1`, [
      id,
    ]);
    return res.rows[0];
  }
}

module.exports = Unit;
