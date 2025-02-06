const pool = require("../config/db");

class Menu {
  static async get_menucategory() {
    const res = await pool.query(`SELECT * FROM menu_categories`);
    return res.rows;
  }

  static async get_menu_bycategoryone(id) {
    const res = await pool.query(
      `SELECT category_name FROM menu_categories WHERE id = $1`,
      [id]
    );
    return res.rows[0];
  }

  static async get_price() {
    const res = await pool.query(
      `SELECT * FROM menu_price INNER JOIN menus ON menu_price.menu_id = menus.menu_id`
    );
    return res.rows;
  }

  static async get_price_byid(id) {
    const res = await pool.query(
      `SELECT * FROM menu_price 
      INNER JOIN menus 
      ON menu_price.menu_id = menus.menu_id
      WHERE menu_price.menu_id = $1
      ORDER BY menu_price.date_start DESC`,
      [id]
    );
    return res.rows;
  }

  static async get_menu() {
    const res = await pool.query(
      `SELECT menus.*, menu_price.price, menu_price.date_start, menu_price.date_end, menu_status.*, menu_categories.category_name 
      FROM menus 
      LEFT JOIN menu_price 
      ON menus.menu_id = menu_price.menu_id
      INNER JOIN menu_categories 
      ON menus.menu_category = menu_categories.id
      INNER JOIN menu_status
      ON menus.menu_status = menu_status.id
      WHERE (menu_price.date_start <= CURRENT_TIMESTAMP
        AND (menu_price.date_end >= CURRENT_TIMESTAMP OR menu_price.date_end IS NULL))
        OR menu_price.price IS NULL`
    );
    return res.rows;
  }

  static async get_menu_cus() {
    const res = await pool.query(
      `SELECT menus.*, menu_price.price, menu_price.date_start, menu_price.date_end, menu_status.*, menu_categories.category_name 
      FROM menus 
      LEFT JOIN menu_price 
      ON menus.menu_id = menu_price.menu_id
      INNER JOIN menu_categories 
      ON menus.menu_category = menu_categories.id
      INNER JOIN menu_status
      ON menus.menu_status = menu_status.id
      WHERE 
       menu_price.date_start <= CURRENT_TIMESTAMP 
       AND 
       (menu_price.date_end IS NULL OR menu_price.date_end >= CURRENT_TIMESTAMP)`
    );
    return res.rows;
  }

  static async get_menu_id(id) {
    const res = await pool.query(`SELECT * FROM menus WHERE menu_id = $1`, [id]);
    return res.rows[0];
  }

  static async get_menu_byid(id) {
    const res = await pool.query(
      `SELECT 
    m.menu_id,
    m.menu_name,
    m.menu_img,
    m.menu_category,
    m.menu_type,
    mp.price,
    mp.date_start,
    array_agg(
        json_build_object(
            'material_id', mi.material_id,
            'material_name', materials.m_name,
            'quantity_used', mi.quantity_used,
            'unit_id', mi.unit_id,
            'u_name', u.u_name
        )
    ) AS ingredients
FROM menus AS m
LEFT JOIN menu_price AS mp ON m.menu_id = mp.menu_id
LEFT JOIN menu_ingredients AS mi ON m.menu_id = mi.menu_id
INNER JOIN units u ON mi.unit_id = u.id
LEFT JOIN materials ON mi.material_id = materials.id
WHERE m.menu_id = $1
GROUP BY m.menu_id, m.menu_type, mp.price, mp.date_start;
`,
      [id]
    );
    return res.rows[0];
  }

  static async get_menu_bycategory(id) {
    const res = await pool.query(
      `SELECT * 
      FROM menu_price 
      LEFT JOIN menus ON menus.menu_id = menu_price.menu_id
      INNER JOIN menu_categories 
      ON menus.menu_category = menu_categories.id
      INNER JOIN menu_status ON menus.menu_status = menu_status.id
      WHERE 
       menu_price.date_start <= CURRENT_TIMESTAMP 
       AND 
       (menu_price.date_end IS NULL OR menu_price.date_end >= CURRENT_TIMESTAMP)
      AND menus.menu_category = $1`,
      [id]
    );
    return res.rows;
  }

  static async get_status() {
    const res = await pool.query(`SELECT * FROM menu_status`);
    return res.rows;
  }

  static async add_category(data) {
    const { category_name } = data;
    const res = await pool.query(
      `INSERT INTO menu_categories(category_name) VALUES($1) RETURNING *`,
      [category_name]
    );
    return res.rows[0];
  }

  static async add_status(data) {
    const { name } = data;
    const res = await pool.query(
      `INSERT INTO menu_status(status_name) VALUES($1)  RETURNING *`,
      [name]
    );
    return res.rows[0];
  }

  static async add_menu(data) {
    try {
      const { name, img, category, ingredients, menutype } = data;

      if (!name || !category || !menutype) {
        throw new Error("Missing required fields: name, category, or menutype");
      }

      // Insert new menu
      const menuRes = await pool.query(
        `INSERT INTO menus(menu_name, menu_img, menu_category, menu_status, menu_type) 
         VALUES($1, $2, $3, $4, $5) RETURNING *`,
        [name, img || null, category, 1, menutype]
      );

      const menu = menuRes.rows[0];

      // Insert ingredients
      if (Array.isArray(ingredients) && ingredients.length > 0) {
        for (let material of ingredients) {
          const { material_id, quantity_used, unit_id } = material;

          if (!material_id || !quantity_used || !unit_id) {
            console.warn("Skipping invalid ingredient:", material);
            continue;
          }

          await pool.query(
            `INSERT INTO menu_ingredients(menu_id, material_id, quantity_used, unit_id)
             VALUES($1, $2, $3, $4)
             ON CONFLICT (menu_id, material_id) 
             DO UPDATE SET quantity_used = EXCLUDED.quantity_used, unit_id = EXCLUDED.unit_id`,
            [menu.menu_id, material_id, quantity_used, unit_id]
          );
        }
      }

      return { success: true, menu };

    } catch (error) {
      console.error("Error in add_menu:", error.message);
      return { success: false, error: error.message };
    }
  }



  static async edit_menu(id, data) {
    const { name, img, category, ingredients } = data;

    const menuRes = await pool.query(
      `UPDATE menus SET menu_name = $1, menu_img = $2, menu_category = $3 WHERE menu_id = $4 RETURNING *`,
      [name, img, category, id]
    );

    if (ingredients && ingredients.length > 0) {
      const existingIngredientsRes = await pool.query(
        `SELECT material_id FROM menu_ingredients WHERE menu_id = $1`,
        [id]
      );
      const existingIngredients = existingIngredientsRes.rows.map(
        (row) => row.material_id
      );

      // Create a Set of material_id from the new ingredients data
      const newIngredientIds = new Set(
        ingredients.map((ingredient) => ingredient.material_id)
      );

      const removedIngredients = existingIngredients.filter(
        (materialId) => !newIngredientIds.has(materialId)
      );

      if (removedIngredients.length > 0) {
        await pool.query(
          `DELETE FROM menu_ingredients WHERE menu_id = $1 AND material_id = ANY($2::int[])`,
          [id, removedIngredients]
        );
      }

      for (const ingredient of ingredients) {
        const { material_id, quantity_used, unit_id } = ingredient;

        await pool.query(
          `INSERT INTO menu_ingredients(menu_id, material_id, quantity_used, unit_id)
           VALUES($1, $2, $3, $4)
           ON CONFLICT (menu_id, material_id)
           DO UPDATE SET quantity_used = EXCLUDED.quantity_used, unit_id = EXCLUDED.unit_id`,
          [id, material_id, quantity_used, unit_id]
        );
      }
    } else {
      await pool.query(`DELETE FROM menu_ingredients WHERE menu_id = $1`, [id]);
    }

    return { menu: menuRes.rows[0] };
  }

  static async delete_menu(id) {
    const delMenu = await pool.query(
      `DELETE FROM menus WHERE menu_id = $1 RETURNING *`,
      [id]
    );
    return delMenu.rows[0];
  }

  static async get_menu_type() {
    const res = await pool.query(`SELECT * FROM menu_type`);
    return res.rows;
  }

  static async add_menu_type(data) {
    const { typename } = data;
    const res = await pool.query(
      `INSERT INTO menu_type (typename) VALUES ($1)`,
      [typename]
    );
    return res.rows[0];
  }

  static async edit_menu_type(id, data) {
    const { typename } = data;
    const res = await pool.query(
      `UPDATE menu_type SET typename = $1 WHERE id = $2 `,
      [typename, id]
    );
    return res.rows[0];
  }

  static async delete_menu_type(id) {
    const res = await pool.query(`DELETE FROM menu_type WHERE id = $1`, [id]);
    return res.rows[0];
  }

  static async get_cost_menu(menu_id) {
    const menures = await pool.query(
      `SELECT m.m_name, m.id, m.m_img, m.unit, mp.price, mi.quantity_used, mi.unit_id, menus.menu_name, menus.menu_id
       FROM materials m
       INNER JOIN (
         SELECT material_id, price, effective_date
         FROM (
           SELECT *, ROW_NUMBER() OVER (PARTITION BY material_id ORDER BY effective_date DESC) AS rn
           FROM material_prices
         ) subquery
         WHERE rn = 1
       ) mp ON m.id = mp.material_id
       INNER JOIN menu_ingredients mi ON m.id = mi.material_id
       INNER JOIN menus ON menus.menu_id = mi.menu_id
       WHERE menus.menu_id = $1`,
      [menu_id]
    );


    let totalcost = 0;
    const menus = menures.rows;

    for (const menu of menus) {
      let cost = 0;

      const unit_conversion = await pool.query(
        `SELECT conversion_rate FROM unit_conversions WHERE from_unit_id = $1 AND to_unit_id = $2`,
        [menu.unit_id, menu.unit]
      );

      if (unit_conversion.rows.length > 0) {
        const converrate = unit_conversion.rows[0].conversion_rate;
        cost = menu.quantity_used * converrate * parseFloat(menu.price);
      } else {
        cost = menu.quantity_used * parseFloat(menu.price);
      }

      totalcost += cost;
    }
    const menuName = menus[0].menu_name;
    return { menuName, totalcost };
  }

  static async new_price(menu_id, data) {
    const { price, date_start, date_end } = data;

    const old_price = await pool.query(
      `SELECT * FROM menu_price WHERE menu_id = $1 AND date_end IS NULL`,
      [menu_id]
    );
    const menu_old_price = old_price.rows[0];
    if (menu_old_price) {
      await pool.query(`UPDATE menu_price SET date_end = $1 WHERE id = $2`, [
        date_end,
        menu_old_price.id,
      ]);
    }
    const newPrice = await pool.query(
      `INSERT INTO menu_price (menu_id, price, date_start) VALUES ($1, $2, $3)`,
      [menu_id, price, date_start]
    );
    return newPrice.rows[0];
  }

  static async edit_menu_cat(id, data) {
    const { category_name } = data;
    const res = await pool.query(
      `UPDATE menu_categories SET category_name = $1 WHERE id = $2`,
      [category_name, id]
    );
    return res.rows[0];
  }

  static async delete_menu_cat(id) {
    const res = await pool.query(`DELETE FROM menu_categories WHERE id = $1`, [
      id,
    ]);
    return res.rows[0];
  }

  static async get_recommend() {
    const res = await pool.query(
      `SELECT 
          od.menu_id, 
          m.menu_name, 
          mt.typename, 
          SUM(od.qty) AS total_qty, 
          m.menu_img, 
          mp.price,
          m.menu_status
       FROM order_detail od
       INNER JOIN menus m 
       ON m.menu_id = od.menu_id
       INNER JOIN menu_type mt
       ON mt.id = m.menu_type
       LEFT JOIN menu_price mp 
       ON m.menu_id = mp.menu_id
       INNER JOIN menu_status 
       ON m.menu_status = menu_status.id
       WHERE 
          mt.typename != 'เครื่องดื่ม' 
          AND (mp.date_start <= CURRENT_TIMESTAMP OR mp.date_start IS NULL)
          AND (mp.date_end IS NULL OR mp.date_end >= CURRENT_TIMESTAMP)
       GROUP BY 
          od.menu_id, m.menu_name, mt.typename, m.menu_img, mp.price, m.menu_status
       ORDER BY 
          total_qty DESC 
       LIMIT 10`
    );
    return res.rows;
  }
}

module.exports = Menu;
