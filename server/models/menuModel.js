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
      `SELECT * FROM menus 
        INNER JOIN menu_price 
        ON menus.menu_id = menu_price.menu_id
        INNER JOIN menu_categories 
        ON menus.menu_category = menu_categories.id
        INNER JOIN menu_status
        ON menus.menu_status = menu_status.id
        INNER JOIN menu_ingredients AS mi
        ON menus.menu_id = mi.menu_id
        INNER JOIN materials 
        ON mi.material_id = materials.id
        WHERE menus.menu_id = $1`,
      [id]
    );
    return res.rows[0];
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
    const { name, img, category, status } = data;
    const res = await pool.query(
      `INSERT INTO menus(menu_name,menu_img,menu_category,menu_status) 
      VALUES($1, $2, $3, $4)  RETURNING *`,
      [name, img, category, status]
    );
    return res.rows[0];
  }
}

module.exports = Menu;
