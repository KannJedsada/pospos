const pool = require("../config/db");

class Material {
  static async get_material() {
    try {
      const res = await pool.query(
        `SELECT m.*, u.u_name 
         FROM materials AS m 
         INNER JOIN units AS u ON m.unit = u.id`
      );
      return res.rows;
    } catch (error) {
      console.error("Error fetching materials:", error);
      throw new Error("Unable to fetch materials");
    }
  }

  static async add_material(data) {
    try {
      const { m_name, m_img, unit, composite, composition } = data;
      console.log("Data received:", {
        m_name,
        m_img,
        unit,
        composite,
        composition,
      });

      const res = await pool.query(
        `INSERT INTO materials(m_name, m_img, unit, is_composite) 
         VALUES($1, $2, $3, $4) 
         RETURNING *`,
        [m_name, m_img, unit, composite]
      );
      const material = res.rows[0];
      console.log("Material insertion result:", material);

      let compositionResults = [];

      if (composite && composition && Array.isArray(composition)) {
        for (const comp of composition) {
          const { material_id, quantity_used, unit_id } = comp;
          const resComp = await pool.query(
            `INSERT INTO material_composition(composite_material_id, material_id, quantity_used, unit_id) 
             VALUES($1, $2, $3, $4) 
             RETURNING *`,
            [material.id, material_id, quantity_used, unit_id]
          );
          compositionResults.push(resComp.rows[0]);
          console.log(
            "Material composition insertion result:",
            resComp.rows[0]
          );
        }
      }

      return { material, composition: compositionResults };
    } catch (error) {
      console.error("Error adding material:", error);
      throw new Error("Unable to add material");
    }
  }

  static async edit_material(id, data) {
    try {
      const { m_name, m_img, unit, composition } = data;

      // อัปเดตวัสดุ
      const resMaterial = await pool.query(
        `UPDATE materials
           SET 
              m_name = COALESCE($1, m_name),
              m_img = COALESCE($2, m_img),
              unit = COALESCE($3, unit)
           WHERE id = $4
           RETURNING *`,
        [m_name, m_img, unit, id]
      );
      const updatedMaterial = resMaterial.rows[0];

      // อัปเดตหรือเพิ่ม composition
      if (composition && Array.isArray(composition)) {
        for (const comp of composition) {
          const { material_id, quantity_used, unit_id } = comp;

          // ตรวจสอบว่ามีการเปลี่ยนแปลงหรือไม่
          const resCompCheck = await pool.query(
            `SELECT * FROM material_composition 
             WHERE composite_material_id = $1 AND material_id = $2`,
            [id, material_id]
          );

          if (resCompCheck.rows.length > 0) {
            // อัปเดต composition
            await pool.query(
              `UPDATE material_composition
                 SET quantity_used = $1, unit_id = $2
                 WHERE composite_material_id = $3 AND material_id = $4`,
              [quantity_used, unit_id, id, material_id]
            );
          } else {
            // เพิ่ม composition ใหม่
            await pool.query(
              `INSERT INTO material_composition(composite_material_id, material_id, quantity_used, unit_id) 
               VALUES($1, $2, $3, $4)`,
              [id, material_id, quantity_used, unit_id]
            );
          }
        }
      }

      return { material: updatedMaterial };
    } catch (error) {
      console.error("Error updating material:", error);
      throw new Error("Unable to update material");
    }
  }

  static async delete_material(id) {
    try {
      // ลบ composition ที่เกี่ยวข้องก่อน
      await pool.query(
        `DELETE FROM material_composition WHERE composite_material_id = $1`,
        [id]
      );
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

  static async get_by_id(id) {
    try {
      const res = await pool.query(
        `SELECT m.id, m.m_name, m.m_img, m.unit, m.is_composite,
          CASE 
              WHEN m.is_composite THEN
                  array_agg(json_build_object(
                      'sub_material', m2.id,
                      'quantity_used', mc.quantity_used,
                      'u_id', mc.unit_id
                  ))
              ELSE
                  NULL
          END AS sub_materials
          FROM materials AS m
          LEFT JOIN units AS u ON m.unit = u.id
          LEFT JOIN material_composition AS mc ON m.id = mc.composite_material_id
          LEFT JOIN materials AS m2 ON m2.id = mc.material_id
          WHERE m.id = $1
          GROUP BY m.id, m.m_name, m.m_img, m.unit, m.is_composite;`,
        [id]
      );
      return res.rows;
    } catch (error) {
      console.error("Error fetching material:", error);
      throw new Error("Unable to fetch material");
    }
  }
}

module.exports = Material;
