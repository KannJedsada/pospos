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
}

module.exports = Dept;
