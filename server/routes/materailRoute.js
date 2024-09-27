// routes/materialRoute.js
const express = require("express");
const router = express.Router();
const material = require("../controllers/materialController");
const authenticateToken = require("../middlewares/authMiddleware");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/material"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.get("/", authenticateToken, material.get_material);
router.get("/:id", authenticateToken, material.get_by_id);
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
