const pool = require("../config/db");

class Timestamp {
  static async get_timestamp() {
    const res = await pool.query(`SELECT * FROM timestamps`);
    return res.rows;
  }

  static async checkin(data) {
    const { id_card } = data;

    const existing_checkin = await pool.query(
      `SELECT * FROM timestamps 
       WHERE id_card = $1 
       AND work_date = CURRENT_DATE`,
      [id_card]
    );

    if (existing_checkin.rows.length > 0) {
      throw new Error("Already checked in today.");
    }

    const starttime_res = await pool.query(
      `SELECT p.start_time 
       FROM employees AS emp 
       INNER JOIN positions AS p 
       ON emp.p_id = p.id 
       WHERE emp.id_card = $1`,
      [id_card]
    );
    const start_time = starttime_res.rows[0].start_time;

    const checkin_res = await pool.query(
      `INSERT INTO timestamps(id_card, check_in, work_date)
         VALUES ($1, CURRENT_TIME, CURRENT_DATE)
         RETURNING *`,
      [id_card]
    );

    const checkin_time = checkin_res.rows[0].check_in;
    const time_difference_seconds = Math.floor(
      (new Date(`1970-01-01T${checkin_time}Z`) -
        new Date(`1970-01-01T${start_time}Z`)) /
        1000
    );

    const is_late = time_difference_seconds > 120;

    return {
      ...checkin_res.rows[0],
      is_late,
    };
  }

  static async checkout(data) {
    const { id_card } = data;

    const check_time = await pool.query(
      `SELECT * FROM timestamps 
       WHERE id_card = $1 
       AND work_date = CURRENT_DATE`,
      [id_card]
    );

    if (check_time.rows.length === 0) {
      throw new Error("User has not checked in today.");
    }

    const existing_checkout = await pool.query(
      `SELECT * FROM timestamps 
       WHERE id_card = $1 
       AND work_date = CURRENT_DATE 
       AND check_out IS NOT NULL`,
      [id_card]
    );

    if (existing_checkout.rows.length > 0) {
      throw new Error("User has already checked out today.");
    }

    const check_out_res = await pool.query(
      `UPDATE timestamps
       SET check_out = CURRENT_TIME
       WHERE id_card = $1 
       AND work_date = CURRENT_DATE 
       RETURNING *`,
      [id_card]
    );

    return check_out_res.rows[0];
  }

  static async check_late() {
    const res = await pool.query(
      `SELECT emp.*, p.start_time, ts.check_in, 
            p.start_time::time AS start_time, 
            ts.check_in::time AS check_in, 
            EXTRACT(EPOCH FROM (ts.check_in::time - p.start_time::time)) AS late_seconds 
     FROM employees AS emp 
     INNER JOIN positions AS p ON emp.p_id = p.id 
     INNER JOIN timestamps AS ts ON emp.id_card = ts.id_card 
     WHERE EXTRACT(EPOCH FROM (ts.check_in::time - p.start_time::time)) > 120
     AND EXTRACT(MONTH FROM ts.work_date) = EXTRACT(MONTH FROM CURRENT_DATE)`
    );
    return res.rows;
  }

  static async count_late() {
    const lateRes = await pool.query(
      `SELECT 
      COUNT(*) AS late_count
      FROM employees AS emp
      INNER JOIN positions AS p ON emp.p_id = p.id
      INNER JOIN timestamps AS ts ON emp.id_card = ts.id_card
      WHERE 
      EXTRACT(EPOCH FROM (ts.check_in::time - p.start_time::time)) > 300 
      AND ts.work_date = CURRENT_DATE`
    );

    const absentRes = await pool.query(
      `SELECT 
      COUNT(*) AS absent_count
      FROM employees AS emp
      INNER JOIN positions AS p ON emp.p_id = p.id
      INNER JOIN timestamps AS ts ON emp.id_card = ts.id_card
      WHERE 
      EXTRACT(EPOCH FROM (ts.check_in::time - p.start_time::time)) > 3600
      AND ts.work_date = CURRENT_DATE`
    );
    const countlate = lateRes.rows[0];
    const absent = absentRes.rows[0];
    return {countlate, absent};
  }
}

module.exports = Timestamp;
