const pool = require("../config/db");

class Receipt {
  static async get_receipts() {
    const res = await pool.query(`
      SELECT r.*, emp.f_name, emp,l_name, ps.status_name FROM receipts r 
      INNER JOIN employees emp 
      ON r.id_card = emp.id_card
      INNER JOIN payment_status ps 
      ON ps.id = r.payment_status
      ORDER BY id DESC`);
    return res.rows;
  }

  static async get_receipt(table_id) {
    const res = await pool.query(
      `SELECT r.*, emp.f_name, emp,l_name, t.t_name,p.promo_name FROM receipts r 
      INNER JOIN employees emp 
      ON r.id_card = emp.id_card
      INNER JOIN tables t
      ON t.id = $1
      LEFT JOIN promotions p
      ON r.promo_id = p.id
      WHERE table_id = $1 AND payment_status = 1`,
      [table_id]
    );
    return res.rows[0];
  }

  static async get_receiptbyid(id) {
    const res = await pool.query(
      `SELECT r.*, emp.f_name, emp,l_name, t.t_name, p.promo_name FROM receipts r 
      INNER JOIN employees emp 
      ON r.id_card = emp.id_card
      INNER JOIN tables t
      ON r.table_id = t.id
      LEFT JOIN promotions p
      ON r.promo_id = p.id
      WHERE r.id = $1`,
      [id]
    );
    return res.rows[0];
  }

  static async get_receipt_bytable(table_id) {
    const res = await pool.query(
      `SELECT * FROM receipts r 
      INNER JOIN receipt_items ri
      ON r.id = ri.receipt_id
      WHERE receipt_status = 1 AND table_id = $1`,
      [table_id]
    );
    return res.rows;
  }

  static async get_receipt_detail(table_id) {
    const res = await pool.query(
      `SELECT od.*, r.discount, r.final_price, r.promo_id, m.menu_name, od.price, t.t_name FROM receipts r 
      INNER JOIN receipt_items ri
      ON r.id = ri.receipt_id
      INNER JOIN order_detail od
      ON ri.order_id = od.order_id
      INNER JOIN menus m 
      ON od.menu_id = m.menu_id
      INNER JOIN tables t
      ON t.id = od.table_id  
      WHERE r.payment_status = 1 AND r.table_id = $1`,
      [table_id]
    );
    return res.rows;
  }

  static async get_rept_detail(id) {
    const res = await pool.query(
      `SELECT od.*, m.menu_name, emp.f_name, emp.l_name, p.promo_name, r.discount, r.final_price, r.amount_paid, r.change_amount, r.created_at
      FROM receipts r 
      INNER JOIN receipt_items ri
      ON r.id = ri.receipt_id
      INNER JOIN order_detail od
      ON ri.order_id = od.order_id
      INNER JOIN menus m 
      ON m.menu_id = od.menu_id
      INNER JOIN employees emp
      ON emp.id_card = r.id_card
      LEFT JOIN promotions p 
      ON r.promo_id = p.id
      WHERE r.id = $1`,
      [id]
    );
    return res.rows;
  }
  static async create_receipt(data) {
    const {
      table_id,
      id_card,
      total_price,
      discount,
      final_price,
      promo_id,
      order_id,
    } = data;

    if (!Array.isArray(order_id) || order_id.length === 0) {
      throw new Error("Invalid order_id: Must be a non-empty array");
    }

    const new_receipt = await pool.query(
      `INSERT INTO receipts(table_id, id_card, total_price, discount, final_price, promo_id, created_at)
         VALUES($1, $2, $3, $4, $5, $6, NOW()) RETURNING id`,
      [table_id, id_card, total_price, discount, final_price, promo_id]
    );

    const receipt = new_receipt.rows[0];
    const receipt_items = [];

    for (let i = 0; i < order_id.length; i++) {
      const new_receipt_item = await pool.query(
        `INSERT INTO receipt_items (receipt_id, order_id) VALUES ($1, $2) RETURNING *`,
        [receipt.id, order_id[i]]
      );
      receipt_items.push(new_receipt_item.rows[0]);
    }

    await pool.query(
      `UPDATE qr_code_url SET qr_status = false WHERE table_id = $1`,
      [table_id]
    );

    return { receipt, receipt_items };
  }

  static async payment_receipt(id, data) {
    const { amount_paid, change_amount, table_id, order_id } = data;

    if (!Array.isArray(order_id)) {
      throw new Error("Invalid order_id: Expected an array.");
    }

    const res = await pool.query(
      `UPDATE receipts SET amount_paid = $1, change_amount = $2, updated_at = NOW(), payment_status = 2 WHERE id = $3 AND table_id = $4`,
      [amount_paid, change_amount, id, table_id]
    );

    await pool.query(`UPDATE tables SET status_id = 2 WHERE id = $1`, [
      table_id,
    ]);

    for (let i = 0; i < order_id.length; i++) {
      await pool.query(
        `UPDATE orders SET payment_status_id = 2 WHERE id = $1`,
        [order_id[i]]
      );
    }

    await pool.query(`UPDATE tables SET status_id = 2 WHERE id = $1`, [
      table_id,
    ]);

    return res.rows[0];
  }

  static async delete_receipt(id) {
    const res = await pool.query(`DELETE FROM receipts WHERE id = $1`, [id]);
    return res.rows[0];
  }

  static async get_cost_profit() {
    const cost_profitcurrDate = await pool.query(`WITH menu_costs AS (
    SELECT
        menus.menu_id,
        menus.menu_name,
        SUM(
            mi.quantity_used * COALESCE(
                (
                    SELECT
                        conversion_rate
                    FROM
                        unit_conversions
                    WHERE
                        from_unit_id = mi.unit_id
                        AND to_unit_id = m.unit
                ),
                1
            ) * mp.price
        ) AS total_cost_per_menu
    FROM
        menus
        JOIN menu_ingredients mi ON menus.menu_id = mi.menu_id
        JOIN materials m ON mi.material_id = m.id
        JOIN material_prices mp ON m.id = mp.material_id
    WHERE
        mp.effective_date = (
            SELECT
                MAX(effective_date)
            FROM
                material_prices
            WHERE
                material_id = mp.material_id
        )
    GROUP BY
        menus.menu_id,
        menus.menu_name
),
discount_data AS (
    SELECT
        r.id AS receipt_id,
        r.total_price,
        r.discount,
        od.menu_id,
        m.menu_name,
        SUM(od.price) AS total_price_per_menu,
        SUM((r.discount / r.total_price) * od.price) AS discount_per_menu,
        SUM(od.price - (r.discount / r.total_price * od.price)) AS net_total,
        SUM(mc.total_cost_per_menu) AS total_per_menu1
    FROM
        receipts r
        JOIN receipt_items ri ON r.id = ri.receipt_id
        JOIN orders o ON o.id = ri.order_id
        JOIN order_detail od ON o.id = od.order_id
        JOIN menus m ON od.menu_id = m.menu_id
        JOIN menu_costs mc ON mc.menu_id = od.menu_id
    WHERE
        DATE(r.updated_at) = CURRENT_DATE
    GROUP BY
        r.id,
        r.total_price,
        r.discount,
        od.menu_id,
        m.menu_name
)
SELECT
    mc.menu_id,
    mc.menu_name,
    dd.total_price_per_menu,
    dd.discount_per_menu,
    dd.net_total,
    ROUND(CAST(dd.net_total - dd.total_per_menu1 AS numeric), 3) AS profit,
    ROUND(CAST(dd.total_per_menu1 AS numeric), 3) As total_cost_per_menu
FROM
    menu_costs mc
    JOIN discount_data dd ON mc.menu_id = dd.menu_id
ORDER BY
    mc.menu_name`);

    const cost_profitcurrMonth = await pool.query(`WITH menu_costs AS (
    SELECT
        menus.menu_id,
        menus.menu_name,
        SUM(
            mi.quantity_used * COALESCE(
                (
                    SELECT
                        conversion_rate
                    FROM
                        unit_conversions
                    WHERE
                        from_unit_id = mi.unit_id
                        AND to_unit_id = m.unit
                ),
                1
            ) * mp.price
        ) AS total_cost_per_menu
    FROM
        menus
        JOIN menu_ingredients mi ON menus.menu_id = mi.menu_id
        JOIN materials m ON mi.material_id = m.id
        JOIN material_prices mp ON m.id = mp.material_id
    WHERE
        mp.effective_date = (
            SELECT
                MAX(effective_date)
            FROM
                material_prices
            WHERE
                material_id = mp.material_id
        )
    GROUP BY
        menus.menu_id,
        menus.menu_name
),
discount_data AS (
    SELECT
        r.id AS receipt_id,
        r.total_price,
        r.discount,
        r.updated_at,
        od.menu_id,
        m.menu_name,
        SUM(od.price) AS total_price_per_menu,
        SUM((r.discount / r.total_price) * od.price) AS discount_per_menu,
        SUM(od.price - (r.discount / r.total_price * od.price)) AS net_total,
        SUM(mc.total_cost_per_menu) AS total_per_menu1
    FROM
        receipts r
        JOIN receipt_items ri ON r.id = ri.receipt_id
        JOIN orders o ON o.id = ri.order_id
        JOIN order_detail od ON o.id = od.order_id
        JOIN menus m ON od.menu_id = m.menu_id
        JOIN menu_costs mc ON mc.menu_id = od.menu_id
    WHERE
        DATE_TRUNC('month', r.updated_at) = DATE_TRUNC('month', CURRENT_DATE)
    GROUP BY
        r.id,
        r.total_price,
        r.discount,
        r.updated_at,
        od.menu_id,
        m.menu_name
)
SELECT
    DATE(dd.updated_at),
    mc.menu_id,
    mc.menu_name,
    dd.total_price_per_menu,
    dd.discount_per_menu,
    dd.net_total,
    ROUND(CAST(dd.net_total - dd.total_per_menu1 AS numeric), 3) AS profit,
    ROUND(CAST(dd.total_per_menu1 AS numeric), 3) As total_cost_per_menu
FROM
    menu_costs mc
    JOIN discount_data dd ON mc.menu_id = dd.menu_id
ORDER BY
    mc.menu_name`);

    const total_revenuecurrdate = await pool.query(
      `SELECT SUM(total_price) AS total_price, SUM(discount) AS discount, SUM(final_price) AS total_revenue FROM receipts r WHERE date(r.updated_at) = CURRENT_DATE`
    );

    const total_revenuecurrmonth = await pool.query(
      `SELECT SUM(total_price) AS total_price, SUM(discount) AS discount, SUM(final_price) AS total_revenue FROM receipts r WHERE  DATE_TRUNC('month', r.updated_at) = DATE_TRUNC('month', CURRENT_DATE)`
    );

    const costprofitcurrdate = cost_profitcurrDate.rows;
    const costprofitcurrmonth = cost_profitcurrMonth.rows;
    const revenuecurrdate = total_revenuecurrdate.rows;
    const revenuecurrmonth = total_revenuecurrmonth.rows;

    return {
      costprofitcurrdate,
      costprofitcurrmonth,
      revenuecurrdate,
      revenuecurrmonth,
    };
  }

  static async get_cost_profit_bydata(data) {
    const { currdate, currmonth } = data;

    let cost_profitcurrDate;
    let cost_profitcurrMonth;
    let total_revenuecurrdate;
    let total_revenuecurrmonth;
    if (currdate) {
      // Query for specific date (currdate)
      cost_profitcurrDate = await pool.query(
        `
        WITH menu_costs AS (
          SELECT
              menus.menu_id,
              menus.menu_name,
              SUM(
                  mi.quantity_used * COALESCE(
                      (
                          SELECT
                              conversion_rate
                          FROM
                              unit_conversions
                          WHERE
                              from_unit_id = mi.unit_id
                              AND to_unit_id = m.unit
                      ),
                      1
                  ) * mp.price
              ) AS total_cost_per_menu
          FROM
              menus
              JOIN menu_ingredients mi ON menus.menu_id = mi.menu_id
              JOIN materials m ON mi.material_id = m.id
              JOIN material_prices mp ON m.id = mp.material_id
          WHERE
              mp.effective_date = (
                  SELECT
                      MAX(effective_date)
                  FROM
                      material_prices
                  WHERE
                      material_id = mp.material_id
              )
          GROUP BY
              menus.menu_id,
              menus.menu_name
        ),
        discount_data AS (
          SELECT
              r.id AS receipt_id,
              r.total_price,
              r.discount,
              od.menu_id,
              m.menu_name,
              SUM(od.price) AS total_price_per_menu,
              SUM((r.discount / r.total_price) * od.price) AS discount_per_menu,
              SUM(od.price - (r.discount / r.total_price * od.price)) AS net_total,
              SUM(mc.total_cost_per_menu) AS total_per_menu1
          FROM
              receipts r
              JOIN receipt_items ri ON r.id = ri.receipt_id
              JOIN orders o ON o.id = ri.order_id
              JOIN order_detail od ON o.id = od.order_id
              JOIN menus m ON od.menu_id = m.menu_id
              JOIN menu_costs mc ON mc.menu_id = od.menu_id
          WHERE
              DATE(r.updated_at) = $1
          GROUP BY
              r.id,
              r.total_price,
              r.discount,
              od.menu_id,
              m.menu_name
        )
        SELECT
            mc.menu_id,
            mc.menu_name,
            dd.total_price_per_menu,
            dd.discount_per_menu,
            dd.net_total,
            ROUND(CAST(dd.net_total - dd.total_per_menu1 AS numeric), 3) AS profit,
            ROUND(CAST(dd.total_per_menu1 AS numeric), 3) As total_cost_per_menu
        FROM
            menu_costs mc
            JOIN discount_data dd ON mc.menu_id = dd.menu_id
        ORDER BY
            mc.menu_name
        `,
        [currdate]
      );

      // Query for daily total revenue (total_revenuecurrdate)
      total_revenuecurrdate = await pool.query(
        `SELECT SUM(total_price) AS total_price, SUM(discount) AS discount, SUM(final_price) AS total_revenue 
          FROM receipts r 
          WHERE date(r.updated_at) = $1`,
        [currdate]
      );
    }

    if (currmonth) {
      // Query for the current month (currmonth)
      cost_profitcurrMonth = await pool.query(
        `
        WITH menu_costs AS (
          SELECT
              menus.menu_id,
              menus.menu_name,
              SUM(
                  mi.quantity_used * COALESCE(
                      (
                          SELECT
                              conversion_rate
                          FROM
                              unit_conversions
                          WHERE
                              from_unit_id = mi.unit_id
                              AND to_unit_id = m.unit
                      ),
                      1
                  ) * mp.price
              ) AS total_cost_per_menu
          FROM
              menus
              JOIN menu_ingredients mi ON menus.menu_id = mi.menu_id
              JOIN materials m ON mi.material_id = m.id
              JOIN material_prices mp ON m.id = mp.material_id
          WHERE
              mp.effective_date = (
                  SELECT
                      MAX(effective_date)
                  FROM
                      material_prices
                  WHERE
                      material_id = mp.material_id
              )
          GROUP BY
              menus.menu_id,
              menus.menu_name
        ),
        discount_data AS (
          SELECT
              r.id AS receipt_id,
              r.total_price,
              r.discount,
              r.updated_at,
              od.menu_id,
              m.menu_name,
              SUM(od.price) AS total_price_per_menu,
              SUM((r.discount / r.total_price) * od.price) AS discount_per_menu,
              SUM(od.price - (r.discount / r.total_price * od.price)) AS net_total,
              SUM(mc.total_cost_per_menu) AS total_per_menu1
          FROM
              receipts r
              JOIN receipt_items ri ON r.id = ri.receipt_id
              JOIN orders o ON o.id = ri.order_id
              JOIN order_detail od ON o.id = od.order_id
              JOIN menus m ON od.menu_id = m.menu_id
              JOIN menu_costs mc ON mc.menu_id = od.menu_id
          WHERE
              DATE_TRUNC('month', r.updated_at) = DATE_TRUNC('month', $1::DATE)
          GROUP BY
              r.id,
              r.total_price,
              r.discount,
              r.updated_at,
              od.menu_id,
              m.menu_name
        )
        SELECT
          DATE(dd.updated_at),
          mc.menu_id,
          mc.menu_name,
          dd.total_price_per_menu,
          dd.discount_per_menu,
          dd.net_total,
          ROUND(CAST(dd.net_total - dd.total_per_menu1 AS numeric), 3) AS profit,
          ROUND(CAST(dd.total_per_menu1 AS numeric), 3) AS total_cost_per_menu
        FROM
          menu_costs mc
          JOIN discount_data dd ON mc.menu_id = dd.menu_id
        ORDER BY
          mc.menu_name
        `,
        [currmonth + "-01"]
      );

      // Query for monthly total revenue (total_revenuecurrmonth)
      total_revenuecurrmonth = await pool.query(
        `SELECT SUM(total_price) AS total_price, SUM(discount) AS discount, SUM(final_price) AS total_revenue 
          FROM receipts r 
          WHERE DATE_TRUNC('month', r.updated_at) = DATE_TRUNC('month', $1::DATE)`,
        [currmonth + "-01"]
      );
    }

    const costprofitcurrdate = cost_profitcurrDate?.rows || [];
    const costprofitcurrmonth = cost_profitcurrMonth?.rows || [];
    const revenuecurrdate = total_revenuecurrdate?.rows || [];
    const revenuecurrmonth = total_revenuecurrmonth?.rows || [];

    return {
      costprofitcurrdate,
      costprofitcurrmonth,
      revenuecurrdate,
      revenuecurrmonth,
    };
  }

  static async get_data() {
    const res = await pool.query(
      `WITH material_use AS (
    SELECT
        r.id,
        r.updated_at,
        m.menu_id,
        m.menu_name,
        mat.id AS "mat_id",
        mat.m_name,
        mi.unit_id AS "from_unit",
        mat.unit AS "to_unit",
        (mi.quantity_used * od.qty) AS "qty_use_per_mat"
    FROM
        receipts r
        INNER JOIN receipt_items ri ON r.id = ri.receipt_id
        INNER JOIN orders o ON ri.order_id = o.id
        INNER JOIN order_detail od ON o.id = od.order_id
        INNER JOIN menus m ON m.menu_id = od.menu_id
        INNER JOIN menu_ingredients mi ON mi.menu_id = m.menu_id
        INNER JOIN materials mat ON mi.material_id = mat.id
    WHERE r.updated_at IS NOT NULL 
),
unit_conver AS (
    SELECT
        uc.from_unit_id,
        uc.to_unit_id,
        uc.conversion_rate
    FROM
        unit_conversions uc
)
SELECT
    mu.id,
    mu.updated_at,
    mu.menu_id,
    mu.menu_name,
    mu.mat_id,
    mu.m_name,
    mu.from_unit,
    mu.to_unit,
    mu.qty_use_per_mat,
    mu.qty_use_per_mat * COALESCE(uc.conversion_rate, 1) AS "qty_use_conver",
    units.u_name
FROM
    material_use mu
    LEFT JOIN unit_conver uc ON mu.from_unit = uc.from_unit_id
    INNER JOIN units ON mu.to_unit = units.id
    AND mu.to_unit = uc.to_unit_id`
    );

    return res.rows;
  }
}

module.exports = Receipt;
