const Material = require("../models/materialModel");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");

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
    const m_img = req.file ? req.file.path : null; // ใช้ req.file.path สำหรับ URL

    // console.log("Request body:", { m_name, unit, composite, composition, category });

    let parsedComposition;
    if (typeof composition === "string") {
      parsedComposition = JSON.parse(composition);
    } else {
      parsedComposition = composition;
    }

    const result = await Material.add_material({
      m_name,
      m_img, // เก็บ URL ของ Cloudinary
      unit,
      composite: composite === "true" || composite === true,
      composition: parsedComposition || [],
      category,
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
    const newImgUrl = req.file ? req.file.path : null; // ใช้ req.file.path สำหรับ URL

    const materialToEdit = await Material.get_by_id(id);
    if (!materialToEdit) {
      return res.status(404).json({ message: "Material not found" });
    }

    const m_img = newImgUrl || materialToEdit.m_img;
    console.log(m_img);
    console.log(newImgUrl);

    if (newImgUrl && materialToEdit.m_img) {
      const publicId = materialToEdit.m_img.split("/").slice(7).join("/").split(".")[0];
      console.log(publicId);
      try {
        await cloudinary.uploader.destroy(publicId); // ลบรูปภาพเก่า
        console.log("Old image deleted from Cloudinary successfully");
      } catch (err) {
        console.error("Error deleting image from Cloudinary:", err.message);
        return res.status(500).json({ message: "Error deleting image from Cloudinary" });
      }
    }

    const updatedMaterial = await Material.edit_material(id, {
      m_name,
      unit,
      m_img,
      sub_materials,
      category,
    });

    res.status(200).json({ data: updatedMaterial });
  } catch (error) {
    console.error("Error updating material:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const delete_material = async (req, res) => {
  try {
    const id = req.params.id;

    const materialToDelete = await Material.get_by_id(id);
    if (!materialToDelete) {
      return res.status(404).json({ message: "Material not found" });
    }

    await Material.delete_material(id);

    if (materialToDelete.m_img) {
      const publicId = materialToDelete.m_img.split("/").slice(7).join("/").split(".")[0]; // ดึง public_id จาก URL
      console.log(publicId);
      try {
        await cloudinary.uploader.destroy(publicId); // ลบรูปภาพ
        console.log("Image deleted from Cloudinary successfully");
      } catch (err) {
        console.error("Error deleting image from Cloudinary:", err.message);
        return res.status(500).json({ message: "Error deleting image from Cloudinary" });
      }
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
  get_by_idtrue,
};
