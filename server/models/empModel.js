const pool = require("../config/db");

class Emp {
  static async get_emp() {
    const res = await pool.query(
      "SELECT * FROM employees AS emp INNER JOIN positions AS p ON emp.p_id = p.id INNER JOIN departments AS dept ON p.dept_id = dept.id"
    );
    return res.rows;
  }

  static async get_by_id(id) {
    const res = await pool.query(
      `SELECT emp.id_card, emp.f_name, emp.l_name, emp.emp_phone, emp.emp_mail, 
      emp.house_number, emp.road, emp.province, emp.district, emp.subdistrict, 
      emp.zipcode, p.p_name, dept.dept_name FROM employees emp 
      LEFT JOIN positions p 
      ON emp.p_id = p.id 
      LEFT JOIN departments dept 
      ON p.dept_id = dept.id 
      WHERE id_card = $1`,
      [id]
    );
    return res.rows[0];
  }

  static async get_by_pid(p_id) {
    const res = await pool.query(
      "SELECT * FROM employees AS emp INNER JOIN positions AS p ON emp.p_id = p.id INNER JOIN departments AS dept ON p.dept_id = dept.id WHERE emp.p_id = $1",
      [p_id]
    );
    return res.rows;
  }

  static async get_by_dept(dept_id) {
    const res = await pool.query(
      "SELECT * FROM employees AS emp INNER JOIN positions AS p ON emp.p_id = p.id INNER JOIN departments AS dept ON p.dept_id = dept.id WHERE p.dept_id = $1",
      [dept_id]
    );
    return res.rows;
  }

  static async get_by_dept_and_position(dept_id, p_id) {
    const res = await pool.query(
      "SELECT * FROM employees AS emp INNER JOIN positions AS p ON emp.p_id = p.id INNER JOIN departments AS dept ON p.dept_id = dept.id WHERE dept.id = $1 AND p.id = $2",
      [dept_id, p_id]
    );
    return res.rows;
  }

  static async add_emp(data) {
    const {
      id_card,
      f_name,
      l_name,
      phone,
      mail,
      h_number,
      road,
      subdistrict,
      district,
      province,
      zipcode,
      p_id,
    } = data;
    const res = await pool.query(
      "INSERT INTO employees(id_card, f_name, l_name, emp_phone, emp_mail, house_number, road, subdistrict, district, province, zipcode, p_id, start_date) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_DATE) RETURNING *",
      [
        id_card,
        f_name,
        l_name,
        phone,
        mail,
        h_number,
        road,
        subdistrict,
        district,
        province,
        zipcode,
        p_id,
      ]
    );
    return res.rows[0];
  }

  static async update_emp(id, data) {
    const {
      f_name,
      l_name,
      phone,
      mail,
      h_number,
      road,
      subdistrict,
      district,
      province,
      zipcode,
      p_id,
    } = data;

    const res = await pool.query(
      `
            UPDATE employees
            SET
                f_name = $1,
                l_name = $2,
                emp_phone = $3,
                emp_mail = $4,
                house_number = $5,
                road = $6,
                subdistrict = $7,
                district = $8,
                province = $9,
                zipcode = $10,
                p_id = $11
            WHERE id_card = $12
            RETURNING *
        `,
      [
        f_name,
        l_name,
        phone,
        mail,
        h_number,
        road,
        subdistrict,
        district,
        province,
        zipcode,
        p_id,
        id,
      ]
    );

    return res.rows[0];
  }

  static async delete_emp(id) {
    const res = await pool.query(
      "DELETE FROM employees WHERE id_card = $1 RETURNING *",
      [id]
    );
    return res.rows;
  }

  static async get_data(id_card) {
    const res = await pool.query(
      `SELECT *
       FROM employees as emp
       LEFT JOIN positions as p ON emp.p_id = p.id
       LEFT JOIN departments AS dept ON p.dept_id = dept.id
       WHERE emp.id_card = $1`,
      [id_card]
    );
    return res.rows;
  }

  static async get_workdate(id_card) {
    const res = await pool.query(
      `SELECT * FROM work_schedules WHERE id_card = $1 AND work_date >= CURRENT_DATE`,
      [id_card]
    );
    return res.rows;
  }

  static async get_dept(id_card) {
    const res = await pool.query(
      `SELECT access
       FROM employees AS emp 
       WHERE emp.id_card = $1`,
      [id_card]
    );
    return res.rows;
  }

  static async count_late(id_card) {
    const res = await pool.query(
      `SELECT COUNT(*) AS countLate 
     FROM employees AS emp 
     INNER JOIN positions AS p ON emp.p_id = p.id 
     INNER JOIN timestamps AS ts ON ts.id_card = emp.id_card 
     WHERE ts.id_card = $1 
       AND ts.check_in > (p.start_time::time + INTERVAL '2 minutes') 
       AND EXTRACT(MONTH FROM ts.work_date) = EXTRACT(MONTH FROM CURRENT_DATE) 
       AND EXTRACT(YEAR FROM ts.work_date) = EXTRACT(YEAR FROM CURRENT_DATE)`,
      [id_card]
    );
    return res.rows;
  }

  static async count_absent(id_card) {
    const res = await pool.query(
      `SELECT COUNT(*) AS absent_count
       FROM work_schedules AS ws
       LEFT JOIN timestamps AS ts
       ON ws.id_card = ts.id_card AND ws.work_date = ts.work_date
       WHERE ws.id_card = $1
         AND ts.id_card IS NULL
         AND EXTRACT(MONTH FROM ws.work_date) = EXTRACT(MONTH FROM CURRENT_DATE)
         AND ws.work_date <= CURRENT_DATE`,
      [id_card]
    );
    return res.rows;
  }

  static async permission(id_card, newAccess) {
    console.log(newAccess);
    console.log(id_card);
    const res = await pool.query(
      `UPDATE employees SET access = $1 WHERE id_card = $2`,
      [newAccess, id_card]
    );
    return res.rows[0];
  }
}

module.exports = Emp;
