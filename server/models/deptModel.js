const pool = require("../config/db");

class Dept {
  static async get_dept() {
    const res = await pool.query("SELECT * FROM departments");
    return res.rows;
  }

  static async add_dept(data) {
    const { dept_name } = data;
    const res = await pool.query(
      "INSERT INTO departments(dept_name) VALUES($1) RETURNING *",
      [dept_name]
    );
    return res.rows[0];
  }

  static async get_by_id(id) {
    const res = await pool.query(`SELECT * FROM departments WHERE id = $1`, [
      id,
    ]);
    return res.rows[0];
  }

  static async edit_dept(id, data) {
    const { dept_name } = data;
    const res = await pool.query(
      `UPDATE departments
      SET dept_name = $1
      WHERE id = $2
      RETURNING *`,
      [dept_name, id]
    );
    return res.rows[0];
  }

  static async delete_dept(id) {
    const res = await pool.query(
      `DELETE FROM departments WHERE id = $1 RETURNING *`,
      [id]
    );
    return res.rows[0];
  }

  static async get_position(id) {
    const res = await pool.query(
      `
      SELECT p.*, COUNT(emp.id_card) AS total_employees
      FROM positions AS p
      LEFT JOIN employees AS emp ON emp.p_id = p.id
      WHERE p.dept_id = $1
      GROUP BY p.id
    `,
      [id]
    );

    return res.rows;
  }
}

module.exports = Dept;
