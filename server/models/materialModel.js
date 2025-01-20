const pool = require("../config/db");

class Material {
  static async get_material() {
    try {
      const res = await pool.query(
        `SELECT m.*, u.u_name ,c.category_name
         FROM materials AS m 
         INNER JOIN units AS u ON m.unit = u.id
         LEFT JOIN categories AS c ON c.id = m.material_category
         ORDER BY "id" asc`
      );
      return res.rows;
    } catch (error) {
      console.error("Error fetching materials:", error);
      throw new Error("Unable to fetch materials");
    }
  }

  static async get_material_bycategory(id) {
    try {
      const res = await pool.query(
        `SELECT m.*, u.u_name ,c.category_name
         FROM materials AS m 
         INNER JOIN units AS u ON m.unit = u.id
         LEFT JOIN categories AS c ON c.id = m.material_category
         WHERE c.id = $1
         ORDER BY "id" asc`,
        [id]
      );
      return res.rows;
    } catch (error) {
      console.error("Error fetching materials:", error);
      throw new Error("Unable to fetch materials");
    }
  }

  static async add_material(data) {
    try {
      const { m_name, m_img, unit, category, composite, composition } = data;
      // Insert material data into materials table
      const res = await pool.query(
        `INSERT INTO materials(m_name, m_img, unit, is_composite, material_category) 
             VALUES($1, $2, $3, $4, $5) 
             RETURNING *`,
        [m_name, m_img, unit, composite, category]
      );
      const material = res.rows[0];
      // console.log("Material insertion result:", material);

      let compositionResults = [];

      // Insert composition data into material_composition table if composite
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
        }
      }

      // Insert the new material data into the stocks table
      const resStock = await pool.query(
        `INSERT INTO stocks(material_id, qty, min_qty, category_id)
             VALUES($1, $2, $3, $4)
             RETURNING *`,
        [material.id, 0, 0, category] // Add appropriate values for qty and min_qty
      );
      // console.log("Stock insertion result:", resStock.rows[0]);

      return {
        material,
        composition: compositionResults,
        stock: resStock.rows[0],
      };
    } catch (error) {
      console.error("Error adding material:", error);
      throw new Error("Unable to add material");
    }
  }

  static async edit_material(id, data) {
    const { m_name, m_img, unit, sub_materials, category, composite } = data; // Ensure composite is included here

    const resMaterial = await pool.query(
      `UPDATE materials
        SET 
          m_name = COALESCE($1, m_name),
          m_img = COALESCE($2, m_img),
          unit = COALESCE($3, unit),
          material_category = COALESCE($4, material_category),
          is_composite = COALESCE($5, is_composite)
        WHERE id = $6
        RETURNING *`,
      [m_name, m_img, unit, category, composite, id] // Ensure composite is passed here
    );

    const updatedMaterial = resMaterial.rows[0];

    // Retrieve existing compositions for the material
    const resExistingCompositions = await pool.query(
      `SELECT material_id FROM material_composition WHERE composite_material_id = $1`,
      [id]
    );
    const existingCompositions = resExistingCompositions.rows.map(
      (row) => row.material_id
    );
    if (updatedMaterial.is_composite == true) {
    }
    // Create a Set of material_id from the new composition data
    const newCompositionIds = new Set(
      sub_materials ? sub_materials.map((comp) => comp.material_id) : []
    );

    // Identify removed compositions (those in the database but not in the new composition)
    const removedCompositions = existingCompositions.filter(
      (materialId) => !newCompositionIds.has(materialId)
    );

    // Remove compositions that no longer exist in the updated composition list
    if (removedCompositions.length > 0) {
      await pool.query(
        `DELETE FROM material_composition WHERE composite_material_id = $1 AND material_id = ANY($2::int[])`,
        [id, removedCompositions]
      );
    }

    // Update or insert new compositions
    if (Array.isArray(sub_materials)) {
      for (const comp of sub_materials) {
        const { material_id, quantity_used, unit_id } = comp;

        // Check if the composition already exists
        const resCompCheck = await pool.query(
          `SELECT * FROM material_composition 
           WHERE composite_material_id = $1 AND material_id = $2`,
          [id, material_id]
        );

        if (resCompCheck.rows.length > 0) {
          // Update existing composition
          await pool.query(
            `UPDATE material_composition
              SET quantity_used = $1, unit_id = $2
              WHERE composite_material_id = $3 AND material_id = $4`,
            [quantity_used, unit_id, id, material_id]
          );
        } else {
          // Insert new composition
          await pool.query(
            `INSERT INTO material_composition(composite_material_id, material_id, quantity_used, unit_id) 
              VALUES($1, $2, $3, $4)`,
            [id, material_id, quantity_used, unit_id]
          );
        }
      }
    }

    // Retrieve updated compositions for the material
    const resUpdatedCompositions = await pool.query(
      `SELECT mc.material_id, mc.quantity_used, mc.unit_id, m.m_name AS material_name
       FROM material_composition AS mc
       INNER JOIN materials AS m ON mc.material_id = m.id
       WHERE mc.composite_material_id = $1`,
      [id]
    );
    const updatedCompositions = resUpdatedCompositions.rows;

    // Combine updated material and sub_materials
    updatedMaterial.sub_materials = updatedCompositions;

    // console.log("Updated Material:", updatedMaterial);
    return updatedMaterial;
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
        `SELECT 
            m.id, 
            m.m_name, 
            m.m_img, 
            m.unit, 
            m.is_composite, 
            m.material_category,
            CASE 
                WHEN m.is_composite THEN
                    json_agg(json_build_object(
                        'sub_material', m2.id,
                        'quantity_used', mc.quantity_used,
                        'u_id', mc.unit_id
                    ))
                ELSE
                    NULL
            END AS sub_materials
        FROM 
            materials AS m
        LEFT JOIN 
            material_composition AS mc ON m.id = mc.composite_material_id
        LEFT JOIN 
            materials AS m2 ON m2.id = mc.material_id
        WHERE 
            m.id = $1
        GROUP BY 
            m.id, m.m_name, m.m_img, m.unit, m.is_composite, m.material_category;`,
        [id]
      );
      return res.rows;
    } catch (error) {
      console.error("Error fetching material:", error);
      throw new Error("Unable to fetch material");
    }
  }

  static async get_by_idtrue(id) {
    try {
      const res = await pool.query(
        `SELECT mc.material_id, mc.quantity_used, mp.price
            FROM material_composition AS mc 
            LEFT JOIN (
                SELECT material_id, price
                FROM material_prices
                WHERE (material_id, effective_date) IN (
                    SELECT material_id, MAX(effective_date)
                    FROM material_prices
                    GROUP BY material_id
                )
            ) AS mp ON mc.material_id = mp.material_id
            WHERE mc.composite_material_id = $1`,
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
