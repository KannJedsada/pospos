const material = require("../models/materialModel");
const path = require("path");
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
    const materials = await material.get_material();
    res.status(200).json({ data: materials });
  } catch (error) {
    console.error("Error fetching materials:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const add_material = async (req, res) => {
  try {
    const { m_name, unit } = req.body;
    const m_img = req.file ? req.file.filename : null; 

    const result = await material.add_material({
      name: m_name,
      img: m_img,
      unit: unit,
    });

    res.status(200).json({ data: result });
  } catch (error) {
    console.error("Error saving material:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const edit_material = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const edit = await material.edit_material(id, data);
    res.status(200).json({ data: edit });
  } catch (error) {
    console.error("Error updating material:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const delete_material = async (req, res) => {
  try {
    const id = req.params.id;
    const deletedMaterial = await material.delete_material(id);
    res.status(200).json({ data: deletedMaterial });
  } catch (error) {
    console.error("Error deleting material:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  get_material,
  add_material,
  edit_material,
  delete_material,
  upload, // Exporting upload middleware to use in routes
};
