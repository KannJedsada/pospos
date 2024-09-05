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
}

module.exports = Unit;
