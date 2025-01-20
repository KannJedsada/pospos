const pool = require("../config/db");

class Position {
  static async get_pos() {
    const res = await pool.query("SELECT * FROM positions");
    return res.rows;
  }

  static async add_pos(data) {
    const { p_name, dept_id, start_time, end_time } = data;
    const res = await pool.query(
      "INSERT INTO positions(p_name, dept_id, start_time, end_time) VALUES($1, $2, $3, $4) RETURNING *",
      [p_name, dept_id, start_time, end_time]
    );
    return res.rows[0];
  }

  static async delete_pos(id) {
    const res = await pool.query(
      "DELETE FROM positions WHERE id = $1 RETURNING *",
      [id]
    );
    return res.rows[0];
  }

  static async update_pos(id, data) {
    const { p_name, start_time, end_time } = data;
    const res = await pool.query(
      "UPDATE positions SET p_name = $1, start_time = $2, end_time = $3 WHERE id = $4 RETURNING *",
      [p_name, start_time, end_time, id]
    );
    return res.rows[0];
  }

  static async get_pos_byid(id) {
    const res = await pool.query(`SELECT * FROM positions WHERE id = $1`, [
      id,
    ]);
    return res.rows[0];
  }
}

module.exports = Position;
