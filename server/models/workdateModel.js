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
      AND EXTRACT(MONTH FROM ws.work_date) = EXTRACT(MONTH FROM CURRENT_DATE)
      AND ws.work_date >= CURRENT_DATE`
    );
    return res.rows;
  }

//   static async get_ws_currentdate() {
//     const res = await
//   }

  static async add_workdate(data) {
    const { id_card, date } = data;
    const res = await pool.query(
      `INSERT INTO work_schedules(id_card, work_date) VALUES($1, $2) RETURNING *`,
      [id_card, date]
    );
    return res.rows[0];
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
