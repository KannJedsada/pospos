const pool = require("../config/db");

class Material {
  static async get_material() {
    try {
      const res = await pool.query(
        `SELECT m.*,u.u_name FROM materials AS m INNER JOIN units AS u ON m.unit = u.id`
      );
      return res.rows;
    } catch (error) {
      console.error("Error fetching materials:", error);
      throw new Error("Unable to fetch materials");
    }
  }

  static async add_material(data) {
    try {
      const { name, img, unit } = data;
      const res = await pool.query(
        `INSERT INTO materials(m_name, m_img, unit) VALUES($1, $2, $3) RETURNING *`,
        [name, img, unit]
      );
      return res.rows[0];
    } catch (error) {
      console.error("Error adding material:", error);
      throw new Error("Unable to add material");
    }
  }

  static async edit_material(id, data) {
    try {
      const { name, img, unit } = data;
      const res = await pool.query(
        `UPDATE materials
           SET 
              m_name = $1,
              m_img = $2,
              unit = $3
           WHERE id = $4
           RETURNING *`,
        [name, img, unit, id]
      );
      return res.rows[0];
    } catch (error) {
      console.error("Error updating material:", error);
      throw new Error("Unable to update material");
    }
  }

  static async delete_material(id) {
    try {
      const res = await pool.query(
        `DELETE FROM materials WHERE id = $1 RETURNING *`,
        [id]
      );
      return res.rows[0];
    } catch (error) {
      console.error("Error deleting material:", error);
      throw new Error("Unable to delete material");
    }
  }
}

module.exports = Material;
