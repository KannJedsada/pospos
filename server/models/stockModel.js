const pool = require("../config/db");

class Stocks {
  static async get_category() {
    const res = await pool.query(`SELECT * FROM categories`);
    return res.rows;
  }

  static async get_categoryby_id(id) {
    const res = await pool.query(`SELECT * FROM categories WHERE id = $1`, [
      id,
    ]);
    return res.rows[0];
  }

  static async add_category(data) {
    const { category_name } = data;
    const res = await pool.query(
      `INSERT INTO categories(category_name) VALUES($1) RETURNING *`,
      [category_name]
    );
    return res.rows[0];
  }

  static async edit_category(id, data) {
    const { category_name } = data;
    const res = await pool.query(
      `UPDATE categories SET category_name = $1 WHERE id = $2 RETURNING *`,
      [category_name, id]
    );
    return res.rows[0];
  }

  static async delete_category(id) {
    const res = await pool.query(`DELETE FROM categories WHERE id = $1`, [id]);
    return res.rows[0];
  }

  static async get_stocks() {
    const res = await pool.query(
      `SELECT s.*, m.m_name, u.u_name, c.category_name, mp.price
       FROM stocks AS s
       INNER JOIN materials AS m ON s.material_id = m.id
       INNER JOIN units AS u ON u.id = m.unit
       INNER JOIN categories AS c ON c.id = s.category_id
       LEFT JOIN (
         SELECT mp.material_id, mp.price
         FROM material_prices AS mp
         INNER JOIN (
           SELECT material_id, MAX(effective_date) AS latest_price_date
           FROM material_prices
           GROUP BY material_id
         ) AS latest_prices 
         ON mp.material_id = latest_prices.material_id 
         AND mp.effective_date = latest_prices.latest_price_date
       ) AS mp ON mp.material_id = s.material_id`
    );
    return res.rows;
  }

  static async get_stockby_cat(id) {
    const res = await pool.query(
      `SELECT s.*, m.m_name, u.u_name, c.category_name, mp.price
       FROM stocks AS s
       INNER JOIN materials AS m ON s.material_id = m.id
       INNER JOIN units AS u ON u.id = m.unit
       INNER JOIN categories AS c ON c.id = s.category_id
       LEFT JOIN (
         SELECT mp.material_id, mp.price
         FROM material_prices AS mp
         INNER JOIN (
           SELECT material_id, MAX(effective_date) AS latest_price_date
           FROM material_prices
           GROUP BY material_id
         ) AS latest_prices 
         ON mp.material_id = latest_prices.material_id 
         AND mp.effective_date = latest_prices.latest_price_date
       ) AS mp ON mp.material_id = s.material_id
      WHERE category_id = $1`,
      [id]
    );
    return res.rows;
  }

  static async add_stock() {
    const res =
      await pool.query(`INSERT INTO stocks (material_id, qty, min_qty, unit_id, category_id)
SELECT 
    id,     
    0,   
    0,    
    1,   
    1       
FROM materials;`);
    return res.rows;
  }

  static async new_stock(data) {
    const { stock_detail } = data;

    if (!stock_detail || !Array.isArray(stock_detail)) {
      throw new Error("stock_detail must be a non-empty array");
    }

    const stock_at_res = await pool.query(
      `INSERT INTO stock_at(timestamps, total_qty, total_price) 
         VALUES(NOW(), 0, 0) 
         RETURNING id`
    );

    const stock_at_id = stock_at_res.rows[0].id;
    const check_materialmenu = new Set();
    const insufficient_items = [];
    let total_qty = 0;
    let total_price = 0;
    const added_details = [];
    const mat_price = [];

    for (let i = 0; i < stock_detail.length; i++) {
      const detail = stock_detail[i];
      const { material_id, qty, unit_id, price, category_id } = detail;

      const check_composition = await pool.query(
        `SELECT * FROM materials WHERE id = $1`,
        [material_id]
      );

      if (check_composition.rows[0].is_composite === true) {

        const composite = await pool.query(
          `SELECT * FROM material_composition WHERE composite_material_id = $1`,
          [material_id]
        );

        let canProduce = true;
        let rollbackList = [];

        for (let comp of composite.rows) {
          const { material_id: comp_mat_id, quantity_used: comp_qty, unit_id } = comp;
          const unitResult = await pool.query('SELECT unit FROM materials WHERE id = $1', [comp_mat_id]);
          const unit = unitResult.rows[0]?.unit;

          const converUnitRes = await pool.query(
            `SELECT conversion_rate FROM unit_conversions WHERE from_unit_id = $1 AND to_unit_id = $2`,
            [unit_id, unit]
          );

          const converUnit = converUnitRes.rows[0]?.conversion_rate;
          let qty_comp = converUnit ? comp_qty * qty * converUnit : comp_qty * qty;

          const stockRes = await pool.query(
            `SELECT qty FROM stocks WHERE material_id = $1`,
            [comp_mat_id]
          );

          const compMatName = await pool.query(`SELECT m_name FROM materials WHERE id = $1`, [comp_mat_id]);

          const current_qty = stockRes.rows[0]?.qty || 0;
          if (current_qty < qty_comp) {
            insufficient_items.push({
              compositeMaterial: check_composition.rows[0]?.m_name,
              componentMaterial: compMatName.rows[0]?.m_name,
              current_qty,
              required_qty: qty_comp
            });
            canProduce = false;
            continue; // หยุดการทำงานของลูป เพราะวัตถุดิบไม่พอ
          }

          await pool.query(
            `UPDATE stocks SET qty = qty - $1 WHERE material_id = $2`,
            [qty_comp, comp_mat_id]
          );
          rollbackList.push({ comp_mat_id, qty_comp }); // เก็บข้อมูลเพื่อ rollback หากจำเป็น
        }

        if (!canProduce) {
          // คืนค่าวัตถุดิบที่ถูกตัดไปแล้ว
          for (let rollback of rollbackList) {
            await pool.query(
              `UPDATE stocks SET qty = qty + $1 WHERE material_id = $2`,
              [rollback.qty_comp, rollback.comp_mat_id]
            );
          }
          continue; // ข้ามการเพิ่มสต็อกวัสดุผสม
        }

        if (insufficient_items.length === 0) {
          total_qty += Number(qty);
          total_price += Number(price);
        }

        await pool.query(
          `UPDATE stocks SET qty = qty + $1 WHERE material_id = $2`,
          [qty, material_id]
        );

        const material_price = price / qty;
        await pool.query(
          `INSERT INTO material_prices(material_id, price, effective_date) VALUES($1, $2, NOW()) RETURNING *`,
          [material_id, material_price]
        );
      } else {
        total_qty += Number(qty);
        total_price += Number(price);

        await pool.query(
          `UPDATE stocks SET qty = qty + $1 WHERE material_id = $2`,
          [qty, material_id]
        );

        const material_price = price / qty;
        const m_price = await pool.query(
          `INSERT INTO material_prices(material_id, price, effective_date)
                 VALUES($1, $2, NOW()) RETURNING price`,
          [material_id, material_price]
        );
        mat_price.push(m_price.rows[0]);
      }

      const detail_stock = await pool.query(
        `INSERT INTO stock_at_detail(stock_at_id, material_id, qty, unit_id, price, category_id)
             VALUES($1, $2, $3, $4, $5, $6) RETURNING *`,
        [stock_at_id, material_id, qty, unit_id, price, category_id]
      );
      added_details.push(detail_stock.rows[0]);

      const material_unit_res = await pool.query(
        `SELECT unit FROM materials WHERE id = $1`,
        [material_id]
      );

      const convert_unit_res = await pool.query(
        `SELECT *
             FROM unit_conversions 
             WHERE from_unit_id = $1 AND to_unit_id = $2`,
        [material_id, material_unit_res.rows[0].unit]
      );

      let converted_quantity_used;
      if (convert_unit_res.rows.length > 0) {
        const conversion_factor = convert_unit_res.rows[0].conversion_rate;
        converted_quantity_used = qty * conversion_factor;
      } else {
        converted_quantity_used = qty;
      }

      const menu_ingredient = await pool.query(
        `SELECT * FROM menu_ingredients WHERE material_id = $1 AND quantity_used <= $2`,
        [material_id, converted_quantity_used]
      );

      menu_ingredient.rows.forEach((ingredient) => {
        check_materialmenu.add(ingredient.menu_id);
      });
    }

    for (const menu_id of check_materialmenu) {
      await pool.query(`UPDATE menus SET menu_status = 1 WHERE menu_id = $1`, [
        menu_id,
      ]);
    }

    await pool.query(
      `UPDATE stock_at SET total_qty = $1, total_price = $2 WHERE id = $3`,
      [total_qty, total_price, stock_at_id]
    );

    if (insufficient_items.length > 0) {
      return { error: "INSUFFICIENT_STOCK", insufficient_items };
    }

    return { added_details, mat_price, total_price, total_qty };
  }

  static async edit_min(id, data) {
    const { min_qty } = data;
    const min_stock = await pool.query(
      `
      UPDATE stocks SET min_qty = $1 WHERE material_id = $2`,
      [min_qty, id]
    );
    return min_stock.rows[0];
  }

  static async get_by_material(id) {
    const res = await pool.query(
      `
      SELECT s.material_id, s.min_qty, m.m_name, u.u_name FROM stocks AS s 
      INNER JOIN materials AS m ON s.material_id = m.id 
      INNER JOIN units u ON m.unit = u.id
      WHERE material_id = $1`,
      [id]
    );
    return res.rows[0];
  }

  static async get_stock() {
    const res = await pool.query(`SELECT * FROM stock_at ORDER BY id DESC`);
    return res.rows;
  }

  static async get_stock_detail(id) {
    const res = await pool.query(
      `SELECT sd.*, m.m_name, u.u_name FROM stock_at_detail sd
      INNER JOIN materials m ON sd.material_id = m.id
      INNER JOIN units u ON sd.unit_id = u.id
      WHERE stock_at_id = $1`,
      [id]
    );
    return res.rows;
  }

  static async get_stockless() {
    const res = await pool.query(
      `SELECT s.id, s.qty, s.min_qty, m.m_name, u.u_name FROM stocks s
      INNER JOIN materials m 
      ON s.material_id = m.id
      INNER JOIN units u 
      ON m.unit = u.id
      WHERE qty <= min_qty`
    );
    return res.rows;
  }
}

module.exports = Stocks;
