const express = require("express");
const router = express.Router();
const menuController = require("../controllers/menuController");
const authenticateToken = require("../middlewares/authMiddleware");
const multer = require("multer");
const path = require("path");

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/menu"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Initialize multer with the storage configuration
const upload = multer({ storage });

// ดึงข้อมูล
router.get("/menucategory", menuController.get_menucategory);
router.get("/menuprice", menuController.get_price);
router.get("/menuprice/:id", menuController.get_pricebyid);
router.get("/menus", menuController.get_menu);
router.get("/menu/:id", menuController.get_menu_byid);
router.get("/menu/category/:id", menuController.get_menu_bycategory);
router.get("/menustatus", menuController.get_status);

// เพิ่ม
router.post("/addstatus", menuController.add_status);
router.post("/addcategory", menuController.add_category);
router.post(
  "/addmenu",
  authenticateToken,
  upload.single("img"),
  menuController.add_menu
);

// แก้ไข
router.put("/editmenu/:id", upload.single("img"), menuController.edit_menu);

// ลบ
router.delete("/deletemenu/:id", authenticateToken, menuController.delete_menu);

module.exports = router;
