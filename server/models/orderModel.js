const pool = require("../config/db");

class Order {
  static async get_order() {
    const res = await pool.query(
      `SELECT * FROM orders WHERE payment_status_id = 1`
    );
    return res.rows;
  }

  static async get_ordered() {
    const res = await pool.query(
      `SELECT od.*, m.*, d.status_name, t.t_name, o.time_ordered, mt.typename
      FROM order_detail od
      INNER JOIN orders o ON od.order_id = o.id
      INNER JOIN menus m ON od.menu_id = m.menu_id
      INNER JOIN dish_status d ON d.id = od.dish_status
      INNER JOIN tables t ON t.id = od.table_id
      INNER JOIN menu_type mt ON mt.id = m.menu_type
      WHERE od.dish_status != 3`
    );

    return res.rows;
  }

  static async get_order_detail(table_id) {
    const res = await pool.query(
      `SELECT od.*, m.*, d.status_name
      FROM order_detail od
      INNER JOIN orders o ON od.order_id = o.id
      INNER JOIN menus m ON od.menu_id = m.menu_id
      INNER JOIN dish_status d ON d.id = od.dish_status
      WHERE od.table_id = $1 AND o.payment_status_id = 1`,
      [table_id]
    );
    return res.rows;
  }

  static async add_order(data) {
    const { order_detail } = data;
    const orders_res = await pool.query(
      `INSERT INTO orders(total_qty, total_price, time_ordered) VALUES(0,0, NOW()) RETURNING id`
    );

    const order_res_id = orders_res.rows[0].id;
    let total_qty = 0;
    let total_price = 0;

    const added_order = [];
    const insufficient_items = [];

    for (let i = 0; i < order_detail.length; i++) {
      const detail = order_detail[i];
      const { cart_id, menu_id, qty, table_id, price } = detail;

      const menu_ingredients_res = await pool.query(
        `SELECT mi.*, m.menu_name 
         FROM menu_ingredients mi 
         INNER JOIN menus m ON mi.menu_id = m.menu_id
         WHERE mi.menu_id = $1`,
        [menu_id]
      );

      const menu_ingredients = menu_ingredients_res.rows;
      let isSufficient = true;

      for (let ingredient of menu_ingredients) {
        const {
          material_id: mat_id,
          quantity_used: mat_qty,
          unit_id: mat_unit,
          menu_name,
        } = ingredient;

        const total_use_qty = mat_qty * qty;

        const stock_check = await pool.query(
          `SELECT * FROM stocks WHERE material_id = $1`,
          [mat_id]
        );

        const material_unit_res = await pool.query(
          `SELECT unit FROM materials WHERE id = $1`,
          [mat_id]
        );

        const convert_unit_res = await pool.query(
          `SELECT *
           FROM unit_conversions 
           WHERE from_unit_id = $1 AND to_unit_id = $2`,
          [mat_unit, material_unit_res.rows[0].unit]
        );

        let check_material;

        if (convert_unit_res.rows.length > 0) {
          const conversion_factor = convert_unit_res.rows[0].conversion_rate;
          check_material = total_use_qty * conversion_factor;
        } else {
          check_material = total_use_qty;
        }

        if (check_material > stock_check.rows[0].qty) {
          insufficient_items.push({
            menu_id,
            menu_name,
            qty,
          });
          await pool.query(
            `UPDATE menus SET menu_status = 2 WHERE menu_id = $1`,
            [menu_id]
          );
          isSufficient = false;
          break;
        }

        if (!isSufficient) {
          continue;
        }

        const update_stocks = await pool.query(
          `UPDATE stocks SET qty = qty - $1 WHERE material_id = $2 RETURNING qty`,
          [check_material, mat_id]
        );

        if (update_stocks.rows[0].qty < check_material) {
          await pool.query(
            `UPDATE menus SET menu_status = 2 WHERE menu_id = $1`,
            [menu_id]
          );
        }

        await pool.query(`UPDATE carts SET cart_status = 2 WHERE id = $1`, [
          cart_id,
        ]);
      }

      if (isSufficient) {
        const detail_order = await pool.query(
          `INSERT INTO order_detail(order_id, menu_id, qty, table_id, price)
          VALUES($1, $2, $3, $4, $5) RETURNING *`,
          [order_res_id, menu_id, qty, table_id, price]
        );

        total_qty += Number(qty);
        total_price += Number(price);
        added_order.push(detail_order.rows[0]);
      }
    }

    await pool.query(
      `UPDATE orders SET total_qty = $1, total_price = $2 WHERE id = $3`,
      [total_qty, total_price, order_res_id]
    );

    return { order_res_id, added_order, insufficient_items };
  }

  // static async add_order(data) {
  //   const { order_detail } = data;
  //   const order_res_id = await this.createOrder();
  //   let total_qty = 0, total_price = 0;
  //   const added_order = [], insufficient_items = [];

  //   for (const detail of order_detail) {
  //     const { cart_id, menu_id, qty, table_id, price } = detail;
  //     if (!(await this.checkAndUpdateStock(menu_id, qty, insufficient_items))) {
  //       continue;
  //     }

  //     const detail_order = await pool.query(
  //       `INSERT INTO order_detail(order_id, menu_id, qty, table_id, price)
  //        VALUES($1, $2, $3, $4, $5) RETURNING *`,
  //       [order_res_id, menu_id, qty, table_id, price]
  //     );

  //     total_qty += Number(qty);
  //     total_price += Number(price);
  //     added_order.push(detail_order.rows[0]);

  //     await pool.query(`UPDATE carts SET cart_status = 2 WHERE id = $1`, [cart_id]);
  //   }

  //   await pool.query(`UPDATE orders SET total_qty = $1, total_price = $2 WHERE id = $3`,
  //     [total_qty, total_price, order_res_id]);

  //   return { order_res_id, added_order, insufficient_items };
  // }

  // static async add_order(data) {
  //   const { order_detail } = data;

  //   // สร้างคำสั่งซื้อใหม่
  //   const orders_res = await pool.query(
  //     `INSERT INTO orders(total_qty, total_price, time_ordered) VALUES(0,0, NOW()) RETURNING id`
  //   );
  //   const order_res_id = orders_res.rows[0].id;

  //   let total_qty = 0, total_price = 0;
  //   const added_order = [], insufficient_items = [];

  //   for (const { cart_id, menu_id, qty, table_id, price } of order_detail) {
  //     const menu_ingredients = await pool.query(
  //       `SELECT mi.*, m.menu_name
  //        FROM menu_ingredients mi
  //        INNER JOIN menus m ON mi.menu_id = m.menu_id
  //        WHERE mi.menu_id = $1`,
  //       [menu_id]
  //     );

  //     let isSufficient = true;

  //     for (const ingredient of menu_ingredients.rows) {
  //       const { material_id: mat_id, quantity_used: mat_qty, unit_id: mat_unit, menu_name } = ingredient;
  //       const total_use_qty = mat_qty * qty;

  //       // ตรวจสอบจำนวนสต็อก
  //       const stock = await pool.query(`SELECT qty FROM stocks WHERE material_id = $1`, [mat_id]);
  //       const material_unit = await pool.query(`SELECT unit FROM materials WHERE id = $1`, [mat_id]);
  //       const conversion = await pool.query(
  //         `SELECT conversion_rate
  //          FROM unit_conversions
  //          WHERE from_unit_id = $1 AND to_unit_id = $2`,
  //         [mat_unit, material_unit.rows[0].unit]
  //       );

  //       const check_material = conversion.rows.length > 0
  //         ? total_use_qty * conversion.rows[0].conversion_rate
  //         : total_use_qty;

  //       if (check_material > stock.rows[0].qty) {
  //         insufficient_items.push({ menu_id, menu_name, qty });
  //         await pool.query(`UPDATE menus SET menu_status = 2 WHERE menu_id = $1`, [menu_id]);
  //         isSufficient = false;
  //         break;
  //       }

  //       // อัปเดตสต็อก
  //       await pool.query(
  //         `UPDATE stocks SET qty = qty - $1 WHERE material_id = $2 RETURNING qty`,
  //         [check_material, mat_id]
  //       );
  //       await pool.query(`UPDATE carts SET cart_status = 2 WHERE id = $1`, [cart_id]);
  //     }

  //     // เพิ่มข้อมูลลงคำสั่งซื้อถ้าส่วนประกอบเพียงพอ
  //     if (isSufficient) {
  //       const detail_order = await pool.query(
  //         `INSERT INTO order_detail(order_id, menu_id, qty, table_id, price)
  //          VALUES($1, $2, $3, $4, $5) RETURNING *`,
  //         [order_res_id, menu_id, qty, table_id, price]
  //       );

  //       total_qty += Number(qty);
  //       total_price += Number(price);
  //       added_order.push(detail_order.rows[0]);
  //     }
  //   }

  //   // อัปเดตรายละเอียดคำสั่งซื้อ
  //   await pool.query(
  //     `UPDATE orders SET total_qty = $1, total_price = $2 WHERE id = $3`,
  //     [total_qty, total_price, order_res_id]
  //   );

  //   return { order_res_id, added_order, insufficient_items };
  // }

  static async decrease_qty(order_detail_id, data) {
    const { qty: qty_to_decrease } = data;

    const order_detail_res = await pool.query(
      `SELECT * FROM order_detail WHERE id = $1`,
      [order_detail_id]
    );
    const order_detail = order_detail_res.rows[0];
    console.log(order_detail.menu_id);
    await pool.query(`UPDATE menus SET menu_status = 1 WHERE menu_id = $1`, [
      order_detail.menu_id,
    ]);

    if (!order_detail) {
      throw new Error(`Order detail not found for ID ${order_detail_id}`);
    }

    if (!order_detail.qty || order_detail.qty <= 0) {
      throw new Error(`Invalid quantity in order detail: ${order_detail.qty}`);
    }

    const new_qty = order_detail.qty - qty_to_decrease;
    const price_per_item = order_detail.price / order_detail.qty;
    const price_to_reduce = price_per_item * qty_to_decrease;
    const new_price = order_detail.price - price_to_reduce;

    const menu_ingredients_res = await pool.query(
      `SELECT mi.*, m.menu_name FROM menu_ingredients mi
       INNER JOIN menus m ON mi.menu_id = m.menu_id
       WHERE mi.menu_id = $1`,
      [order_detail.menu_id]
    );
    const menu_ingredients = menu_ingredients_res.rows;

    for (let ingredient of menu_ingredients) {
      const {
        material_id: mat_id,
        quantity_used: mat_qty,
        unit_id: mat_unit,
      } = ingredient;

      if (!mat_id || !mat_qty || !mat_unit) {
        throw new Error(
          `Invalid menu ingredient data: ${JSON.stringify(ingredient)}`
        );
      }

      const total_return_qty = mat_qty * qty_to_decrease;

      const material_unit_res = await pool.query(
        `SELECT unit FROM materials WHERE id = $1`,
        [mat_id]
      );

      const convert_unit_res = await pool.query(
        `SELECT conversion_rate
         FROM unit_conversions 
         WHERE from_unit_id = $1 AND to_unit_id = $2`,
        [mat_unit, material_unit_res.rows[0]?.unit]
      );
      let return_qty;
      if (convert_unit_res.rows[0]) {
        const conversion_factor = convert_unit_res.rows[0].conversion_rate;
        return_qty = total_return_qty * conversion_factor;
      } else {
        return_qty = total_return_qty;
      }

      await pool.query(
        `UPDATE stocks SET qty = qty + $1 WHERE material_id = $2`,
        [return_qty, mat_id]
      );
    }

    if (new_qty === 0) {
      await pool.query(`DELETE FROM order_detail WHERE id = $1`, [
        order_detail_id,
      ]);
    } else {
      await pool.query(
        `UPDATE order_detail SET qty = $1, price = $2 WHERE id = $3`,
        [new_qty, new_price, order_detail_id]
      );
    }

    const update_order = await pool.query(
      `UPDATE orders SET total_qty = total_qty - $1, total_price = total_price - $2 WHERE id = $3 RETURNING *`,
      [qty_to_decrease, price_to_reduce, order_detail.order_id]
    );

    const order = update_order.rows[0];
    if (order.total_qty == 0) {
      await pool.query(`DELETE FROM orders WHERE id = $1`, [
        order_detail.order_id,
      ]);
      return { success: true, message: "Order deleted" };
    }

    return { success: true, update_order };
  }

  static async change_dish_status(order_id, new_status) {
    const res = await pool.query(
      `UPDATE order_detail SET dish_status = $1 WHERE id = $2 RETURNING *`,
      [new_status, order_id]
    );
    return res.rows;
  }

  static async get_carts(table_id) {
    const res = await pool.query(
      `SELECT * FROM carts
      INNER JOIN menus ON menus.menu_id = carts.menu_id
      WHERE cart_status = 1 AND table_id = $1`,
      [table_id]
    );
    return res.rows;
  }

  static async add_to_cart(data) {
    const { menu_id, qty, price, table_id } = data;
    const res = await pool.query(
      `INSERT INTO carts (menu_id, qty, price, table_id) VALUES ($1, $2, $3, $4)`,
      [menu_id, qty, price, table_id]
    );
    return res.rows[0];
  }

  static async remove_from_cart(cart_id) {
    const res = await pool.query(`DELETE FROM carts WHERE id = $1`, [cart_id]);
    return res.rows[0];
  }
}

module.exports = Order;
