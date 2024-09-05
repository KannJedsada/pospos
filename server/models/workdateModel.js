const pool = require("../config/db");

class Workdate {
  static async get_workdate() {
    const res = await pool.query(`SELECT * FROM work_schedules`);
    return res.rows;
  }

  static async get_data() {
    const res = await pool.query(
      `SELECT * FROM employees AS emp 
      INNER JOIN work_schedules AS ws 
      ON emp.id_card = ws.id_card 
      INNER JOIN positions AS p
      ON emp.p_id = p.id
      INNER JOIN departments AS dept
      ON p.dept_id = dept.id
      WHERE ws.work_date >= CURRENT_DATE`
    );
    return res.rows;
  }
  static async get_newdate() {
    const res = await pool.query(
      `SELECT * FROM employees AS emp 
      INNER JOIN work_schedules AS ws 
      ON emp.id_card = ws.id_card 
      INNER JOIN positions AS p
      ON emp.p_id = p.id
      INNER JOIN departments AS dept
      ON p.dept_id = dept.id
      WHERE ws.work_date > CURRENT_DATE`
    );
    return res.rows;
  }

  static async add_workdate(data) {
    const { id_card, date } = data;

    const existingWorkdate = await pool.query(
      `SELECT *, emp.f_name, emp.l_name FROM work_schedules AS ws
      INNER JOIN employees AS emp 
      ON emp.id_card = ws.id_card
      WHERE ws.id_card = $1 AND ws.work_date = $2`,
      [id_card, date]
    );

    if (existingWorkdate.rows.length > 0) {
      throw new Error(
        `Workdate already assigned for this employee ${existingWorkdate.rows[0].f_name} ${existingWorkdate.rows[0].l_name}`
      );
    }
    const res = await pool.query(
      `INSERT INTO work_schedules(id_card, work_date) VALUES($1, $2) RETURNING *`,
      [id_card, date]
    );

    return res.rows;
  }

  static async edit_workdate(id_card, data) {
    const { date } = data;
    const res = await pool.query(
      `UPDATE SET work_date = $1 WHERE id_card = $2 RETURNING *`,
      [date, id_card]
    );
    return res.rows[0];
  }

  static async delete_data(id_card) {
    const res = await pool.query(
      `DELETE FROM work_schedules WHERE id_card = $1`,
      [id_card]
    );
    return res.rows;
  }
}

module.exports = Workdate;
