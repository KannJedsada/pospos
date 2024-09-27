const pool = require("../config/db");

class Menu {
  static async get_menucategory() {
    const res = await pool.query(`SELECT * FROM menu_categories`);
    return res.rows;
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
      WHERE menu_price.id = $1`,
      [id]
    );
    return res.rows[0];
  }

  static async get_menu() {
    const res = await pool.query(
      `SELECT * FROM menus 
      INNER JOIN menu_price 
      ON menus.menu_id = menu_price.menu_id
      INNER JOIN menu_categories 
      ON menus.menu_category = menu_categories.id
      INNER JOIN menu_status
      ON menus.menu_status = menu_status.id`
    );
    return res.rows;
  }

  static async get_menu_byid(id) {
    const res = await pool.query(
      `SELECT 
          m.menu_id,
          m.menu_name,
          m.menu_img,
          m.menu_category,
          mp.price,
          mp.date_start,
          array_agg(
            json_build_object(
              'material_id', mi.material_id,
              'material_name', materials.m_name,
              'quantity_used', mi.quantity_used,
              'unit_id', mi.unit_id
            )
          ) AS ingredients
        FROM menus AS m
        INNER JOIN menu_price AS mp ON m.menu_id = mp.menu_id
        LEFT JOIN menu_ingredients AS mi ON m.menu_id = mi.menu_id
        LEFT JOIN materials ON mi.material_id = materials.id
        WHERE m.menu_id = $1
        GROUP BY m.menu_id, mp.price, mp.date_start`,
      [id]
    );
    return res.rows[0];
  }

  static async get_menu_bycategory(id) {
    const res = await pool.query(
      `SELECT * FROM menus 
      INNER JOIN menu_price 
      ON menus.menu_id = menu_price.menu_id
      INNER JOIN menu_categories 
      ON menus.menu_category = menu_categories.id
      WHERE menus.menu_category = $1`,
      [id]
    );
    return res.rows;
  }

  static async get_status() {
    const res = await pool.query(`SELECT * FROM menu_status`);
    return res.rows;
  }

  static async add_category(data) {
    const { name } = data;
    const res = await pool.query(
      `INSERT INTO menu_categories(category_name) VALUES($1) RETURNING *`,
      [name]
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
    const { name, img, category, price, ingredients } = data; // ingedients is an array of {material_id, quantity_used, unit_id}

    // Insert the new menu
    const menuRes = await pool.query(
      `INSERT INTO menus(menu_name, menu_img, menu_category, menu_status) 
       VALUES($1, $2, $3, $4) RETURNING *`,
      [name, img, category, 1] // Use 1 as the default status
    );

    const menu = menuRes.rows[0]; // Get the inserted menu

    // Insert price information
    const priceRes = await pool.query(
      `INSERT INTO menu_price(menu_id, price, date_start) VALUES($1, $2, CURRENT_DATE) RETURNING *`,
      [menu.menu_id, price]
    );

    // Insert the related ingedients into menu_ingredients
    if (ingredients && ingredients.length > 0) {
      for (let material of ingredients) {
        const { material_id, quantity_used, unit_id } = material;
        await pool.query(
          `INSERT INTO menu_ingredients(menu_id, material_id, quantity_used, unit_id)
           VALUES($1, $2, $3, $4)
           ON CONFLICT (menu_id, material_id) 
           DO UPDATE SET quantity_used = EXCLUDED.quantity_used, unit_id = EXCLUDED.unit_id`,
          [menu.menu_id, material_id, quantity_used, unit_id]
        );
      }
    }

    return { menu, price: priceRes.rows[0] };
  }

  static async edit_menu(id, data) {
    const { name, img, category, ingredients } = data;

    // Update menu details
    const menuRes = await pool.query(
      `UPDATE menus SET menu_name = $1, menu_img = $2, menu_category = $3 WHERE menu_id = $4 RETURNING *`,
      [name, img, category, id]
    );

    if (ingredients && ingredients.length > 0) {
      // Retrieve existing ingredients
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

      // Identify removed ingredients
      const removedIngredients = existingIngredients.filter(
        (materialId) => !newIngredientIds.has(materialId)
      );

      // Remove ingredients that no longer exist in the updated list
      if (removedIngredients.length > 0) {
        await pool.query(
          `DELETE FROM menu_ingredients WHERE menu_id = $1 AND material_id = ANY($2::int[])`,
          [id, removedIngredients]
        );
      }

      // Update or insert new ingredients
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
      // Remove all ingredients if no new ingredients are provided
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
}

module.exports = Menu;
