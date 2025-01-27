const pool = require("../config/db");

class Tables {
  static async get_table_status() {
    const res = await pool.query(`SELECT * FROM table_status`);
    return res.rows;
  }

  static async add_table_status(data) {
    const { status_name } = data;
    const res = await pool.query(
      `INSERT INTO table_status(status_name) VALUES($1) RETURNING *`,
      [status_name]
    );
    return res.rows[0];
  }

  static async get_tables() {
    const res = await pool.query(`
        SELECT tables.id, tables.t_name, tables.status_id, table_status.status_name 
        FROM tables 
        INNER JOIN table_status 
        ON tables.status_id = table_status.id
        ORDER BY
          REGEXP_REPLACE(tables.t_name, '[^0-9]', '', 'g')::INTEGER, 
          tables.t_name
    `);
    return res.rows;
  }

  static async get_table(id) {
    const res = await pool.query(`SELECT * FROM tables WHERE id = $1`, [id]);
    return res.rows[0];
  }

  static async add_table(data) {
    const { t_name, status_id } = data;

    // Check if the table name already exists
    const checkTableQuery = `SELECT * FROM tables WHERE t_name = $1`;
    const existingTable = await pool.query(checkTableQuery, [t_name]);

    if (existingTable.rows.length > 0) {
      throw new Error("Table name already exists");
    }

    // Insert the new table if the name is unique
    const res = await pool.query(
      `INSERT INTO tables(t_name, status_id) VALUES($1, $2) RETURNING *`,
      [t_name, status_id]
    );

    return res.rows[0];
  }

  static async edit_table(id, data) {
    const { t_name, status_id } = data;
  
    // ตรวจสอบว่า ID มีอยู่จริงหรือไม่
    const checkIdQuery = `SELECT * FROM tables WHERE id = $1`;
    const idExists = await pool.query(checkIdQuery, [id]);
    if (idExists.rows.length === 0) {
      throw new Error("Table ID not found.");
    }
  
    // ตรวจสอบชื่อซ้ำ (ยกเว้น ID ที่กำลังแก้ไข)
    const checkTableQuery = `SELECT * FROM tables WHERE t_name = $1 AND id != $2`;
    const existingTable = await pool.query(checkTableQuery, [t_name, id]);
    if (existingTable.rows.length > 0) {
      throw new Error("Table name already exists.");
    }
  
    // อัปเดตข้อมูลในตาราง
    const updateQuery = `UPDATE tables SET t_name = $1, status_id = $2 WHERE id = $3 RETURNING *`;
    const res = await pool.query(updateQuery, [t_name, status_id, id]);
  
    if (res.rowCount === 0) {
      throw new Error("Table not found or failed to update.");
    }
  
    return res.rows[0];
  }
  
  
  static async change_status(id, data) {
    const { status_id } = data;
    const res = await pool.query(
      `UPDATE tables SET status_id = $1 WHERE id = $2 RETURNING *`,
      [status_id, id]
    );
    res.rows[0];
  }

  static async delete_table(id) {
    const res = await pool.query(
      `DELETE FROM tables WHERE id = $1 RETURNING *`,
      [id]
    );
    return res.rows[0];
  }

  static async get_byname(t_name) {
    const res = await pool.query(`SELECT * FROM tables WHERE t_name = $1`, [
      t_name,
    ]);
    return res.rows[0];
  }
}

module.exports = Tables;
