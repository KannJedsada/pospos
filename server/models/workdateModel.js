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
      WHERE ws.work_date >= CURRENT_DATE
      ORDER BY ws.work_date`
    );
    return res.rows;
  }
  static async get_newdate() {
    const res = await pool.query(
      `SELECT emp.id_card, emp.f_name, emp.l_name, p.p_name, ws.id, ws.work_date FROM employees AS emp 
      INNER JOIN work_schedules AS ws 
      ON emp.id_card = ws.id_card 
      INNER JOIN positions AS p
      ON emp.p_id = p.id
      INNER JOIN departments AS dept
      ON p.dept_id = dept.id
      WHERE ws.work_date > CURRENT_DATE
      ORDER BY ws.work_date`
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

  static async edit_workdate(data) {
    const { id, date } = data;
    console.log(data);
    // Check if the new work date is already assigned
    const existingWorkdate = await pool.query(
      `SELECT *, emp.f_name, emp.l_name FROM work_schedules AS ws
      INNER JOIN employees AS emp 
      ON emp.id_card = ws.id_card
      WHERE ws.id = $1 AND work_date = $2`,
      [id, date]
    );

    if (existingWorkdate.rows.length > 0) {
      throw new Error(
        `Workdate already assigned for this employee ${existingWorkdate.rows[0].f_name} ${existingWorkdate.rows[0].l_name}`
      );
    }

    const res = await pool.query(
      `UPDATE work_schedules SET work_date = $1 WHERE id = $2  RETURNING *`,
      [date, id] // Use formatted old date
    );

    return res.rows[0];
  }

  static async delete_data(id) {
    const res = await pool.query(`DELETE FROM work_schedules WHERE id = $1`, [
      id,
    ]);
    return res.rows[0];
  }

  static async count_workdate() {
    const countRes = await pool.query(
      `SELECT COUNT(*) AS "countworkdate" FROM work_schedules WHERE work_date = CURRENT_DATE GROUP BY work_date`
    );

    const countEmpRes = await pool.query(`
        SELECT COUNT(*) AS "countempworkdate" FROM timestamps ts 
        INNER JOIN work_schedules ws ON ts.id_card = ws.id_card AND ts.work_date = ws.work_date
        WHERE ts.work_date = CURRENT_DATE GROUP BY ts.work_date`);

    const countWd = countRes.rows[0];
    const countEmp = countEmpRes.rows[0];
    return { countWd, countEmp };
  }

  static async check_emp_workdate() {
    const res = await pool.query(
      `SELECT emp.f_name, emp.l_name, ws.*, ts.check_in,ts.check_out, p.p_name, p.start_time FROM employees emp
      INNER JOIN work_schedules ws ON emp.id_card = ws.id_card
      LEFT JOIN timestamps ts ON ws.work_date = ts.work_date AND ts.id_card = emp.id_card
      INNER JOIN positions p ON emp.p_id = p.id
      WHERE ws.work_date = CURRENT_DATE`
    );
    return res.rows;
  }

  static async check_late_arrivals() {
    const res = await pool.query(
      `SELECT * FROM work_schedules ws
      INNER JOIN `
    );
  }
}

module.exports = Workdate;
