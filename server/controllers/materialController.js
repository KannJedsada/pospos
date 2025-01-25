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
    const img = req.file ? req.file.filename : null;

    // Fetch the material to be edited
    const materialToEdit = await Material.get_by_id(id);
    if (!materialToEdit) {
      return res.status(404).json({ message: "Material not found" });
    }

    // If a new file is uploaded, use it; otherwise, keep the old image
    const m_img = req.file ? `${img}` : materialToEdit.m_img;
    console.log("new_img",m_img);

    // If a new image is uploaded and there is an old image, delete the old image from Cloudinary
    if (req.file && materialToEdit.m_img) {
      const publicId = materialToEdit.m_img;
      // .split("/").slice(7).join("/").split(".")[0]; // Extract publicId from old image URL
      console.log("img_to_delete",publicId);

      try {
        // Delete the old image from Cloudinary
        await cloudinary.uploader.destroy(publicId);
        console.log("Old image deleted from Cloudinary successfully");
      } catch (err) {
        console.error("Error deleting image from Cloudinary:", err.message);
        return res.status(500).json({ message: "Error deleting image from Cloudinary" });
      }
    }

    // Update the material in the database
    const updatedMaterial = await Material.edit_material(id, {
      m_name,
      unit,
      m_img,
      sub_materials, 
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

    // Delete the image file from Cloudinary if it exists
    if (materialToDelete.m_img) {
      const publicId = materialToDelete.m_img;
      // .split("/").slice(7).join("/").split(".")[0]; // Extract publicId from image URL

      try {
        // Delete the image from Cloudinary
        await cloudinary.uploader.destroy(publicId);
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
