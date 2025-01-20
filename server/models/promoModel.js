const pool = require("../config/db");

class Promotion {
  static async get_promotions() {
    const res = await pool.query(`SELECT * FROM promotions ORDER BY id DESC`);
    return res.rows;
  }

  static async get_promo() {
    const res = await pool.query(
      `SELECT * FROM promotions WHERE start_promo <= CURRENT_DATE AND end_promo >= CURRENT_DATE`
    );
    return res.rows;
  }

  static async new_promotion(data) {
    const { promo_name, promo_discount, start_promo, end_promo, promo_type } =
      data;
    const res = await pool.query(
      `INSERT INTO promotions(promo_name, promo_discount, start_promo, end_promo, promo_type) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [promo_name, promo_discount, start_promo, end_promo, promo_type]
    );
    return res.rows[0];
  }

  static async edit_promotion(id, data) {
    const { promo_name, promo_discount, start_promo, end_promo } = data;
    const res = await pool.query(
      `UPDATE promotions SET promo_name = $1, promo_discount = $2, start_promo = $3, end_promo = $4 WHERE id = $5 RETURNING *`,
      [promo_name, promo_discount, start_promo, end_promo, id]
    );
    return res.rows[0];
  }

  static async delete_promotion(id) {
    const res = await pool.query(
      `DELETE FROM promotions WHERE id = $1 RETURNING *`,
      [id]
    );
    return res.rows[0];
  }

  // static async get_promo() {
  //   const res = await pool.query(
  //     `SELECT * FROM promotions WHERE end_promo <= CURRENT_TIMESTAMP`
  //   );
  //   return res.rows;
  // }
}

module.exports = Promotion;
