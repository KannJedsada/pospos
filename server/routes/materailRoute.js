// routes/materialRoute.js
const express = require("express");
const router = express.Router();
const material = require("../controllers/materialController");
const authenticateToken = require("../middlewares/authMiddleware");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary"); 
const multer = require("multer");

// ตั้งค่า Storage ของ Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "upload/material", 
    allowed_formats: ["jpeg", "png", "jpg", "gif"],
  },
});

// สร้าง middleware สำหรับอัปโหลดไฟล์
const upload = multer({ storage });

router.get("/", authenticateToken, material.get_material);
router.get("/:id", authenticateToken, material.get_by_id);
router.get(
  "/material/:id",
  authenticateToken,
  material.get_material_bycategory
);
router.get(
  "/true/:id",
  // authenticateToken,
  material.get_by_idtrue
);
router.post(
  "/add",
  authenticateToken,
  upload.single("m_img"),
  material.add_material
);
router.put(
  "/edit/:id",
  authenticateToken,
  upload.single("m_img"), // Handle file upload
  material.edit_materials // Handle the material editing
);

router.delete("/delete/:id", authenticateToken, material.delete_material);

module.exports = router;
