const pool = require("../config/db");

class Qrcode {
  static async get_qr() {
    const res = await pool.query(`SELECT * FROM qr_code_url`);
    return res.rows;
  }

  static async new_qr(qr_url, table_id) {
    const res = await pool.query(
      `INSERT INTO qr_code_url(qr_url, date_create, table_id) VALUES($1, NOW(), $2) RETURNING *`,
      [qr_url, table_id]
    );
    await pool.query(`UPDATE tables SET status_id = 3 WHERE id = $1`, [
      table_id,
    ]);
    return res.rows[0];
  }

  static async change_status(id) {
    const res = await pool.query(
      `UPDATE qr_code_url SET qr_status = false WHERE id = $1 RETURNING *`,
      [id]
    );

    await pool.query(`UPDATE tables SET status_id = 2 WHERE id = $1`, [
      res.rows[0].table_id,
    ]);
    return res.rows[0];
  }

  static async get_by_url(data) {
    const { url } = data;
    const res = await pool.query(
      `SELECT * FROM qr_code_url WHERE qr_url = $1`,
      [url]
    );
    return res.rows[0];
  }

  static async get_by_table(table_id) {
    const res = await pool.query(
      `SELECT * FROM qr_code_url WHERE table_id = $1 AND qr_status = true`,
      [table_id]
    );
    return res.rows[0];
  }
}

module.exports = Qrcode;
