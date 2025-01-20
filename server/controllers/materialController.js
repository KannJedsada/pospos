const Material = require("../models/materialModel");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/material"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

const get_material = async (req, res) => {
  try {
    const materials = await Material.get_material();
    res.status(200).json({ data: materials });
  } catch (error) {
    console.error("Error fetching materials:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const get_material_bycategory = async (req, res) => {
  try {
    const id = req.params.id;
    const material = await Material.get_material_bycategory(id);
    res.status(200).json({ data: material });
  } catch (error) {
    console.error("Error fetching materials:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const add_material = async (req, res) => {
  try {
    const { m_name, unit, composite, composition, category } = req.body;
    const m_img = req.file ? req.file.filename : null;

    console.log("Request body:", {
      m_name,
      unit,
      composite,
      composition,
      category,
    });

    // ตรวจสอบประเภทของ composition
    let parsedComposition;
    if (typeof composition === "string") {
      parsedComposition = JSON.parse(composition); // ถ้าเป็น string ให้แปลงเป็น array
    } else {
      parsedComposition = composition; // ถ้าเป็น object หรือ array แล้วก็ใช้ได้เลย
    }

    const result = await Material.add_material({
      m_name: m_name,
      m_img: m_img,
      unit: unit,
      composite: composite === "true" || composite === true, // แปลง composite เป็น boolean
      composition: parsedComposition || [], // ใช้ array ที่แปลงแล้ว หรือ array ว่างหากไม่มีข้อมูล
      category: category,
    });

    res.status(200).json({ data: result });
  } catch (error) {
    console.error("Error saving material:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const edit_materials = async (req, res) => {
  try {
    const id = req.params.id;
    const { m_name, unit, sub_materials, category } = req.body;

    // Fetch the material to be edited
    const materialToEdit = await Material.get_by_id(id);
    if (!materialToEdit) {
      return res.status(404).json({ message: "Material not found" });
    }

    // If a new file is uploaded, use it; otherwise, keep the old image
    const m_img = req.file ? req.file.filename : materialToEdit.m_img;

    // Delete the old image file if a new one is provided
    if (req.file && materialToEdit.m_img) {
      const filePath = path.join(
        __dirname,
        "../uploads/material",
        materialToEdit.m_img
      );
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Error deleting old file:", err);
        } else {
          console.log("Old file deleted successfully");
        }
      });
    }

    // Update the material in the database
    const updatedMaterial = await Material.edit_material(id, {
      m_name,
      unit,
      m_img,
      sub_materials, // ส่ง sub_materials
      category,
    });

    // Respond with the updated data
    res.status(200).json({ data: updatedMaterial });
  } catch (error) {
    console.error("Error updating material:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const delete_material = async (req, res) => {
  try {
    const id = req.params.id;

    // Fetch the material from the database to get the image file name
    const materialToDelete = await Material.get_by_id(id);
    if (!materialToDelete) {
      return res.status(404).json({ message: "Material not found" });
    }

    // Delete the material record
    await Material.delete_material(id);

    // Delete the image file if it exists
    if (materialToDelete.m_img) {
      const filePath = path.join(
        __dirname,
        "../uploads/material",
        materialToDelete.m_img
      );
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
        } else {
          console.log("File deleted successfully");
        }
      });
    }

    res.status(200).json({ message: "Material deleted successfully" });
  } catch (error) {
    console.error("Error deleting material:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const get_by_id = async (req, res) => {
  try {
    const id = req.params.id;
    const material_id = await Material.get_by_id(id);
    res.status(200).json({ data: material_id });
  } catch (error) {
    console.error("Error deleting material:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const get_by_idtrue = async (req, res) => {
  try {
    const id = req.params.id;
    const material_id = await Material.get_by_idtrue(id);
    res.status(200).json({ data: material_id });
  } catch (error) {
    console.error("Error deleting material:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  get_material,
  get_material_bycategory,
  add_material,
  edit_materials,
  delete_material,
  get_by_id,
  upload,
  get_by_idtrue,
};
