const express = require("express");
const router = express.Router();
const menuController = require("../controllers/menuController");
const authenticateToken = require("../middlewares/authMiddleware");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// ตั้งค่า Storage ของ Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "upload/menu",
    allowed_formats: ["jpeg", "png", "jpg", "gif"],
  },
});

// สร้าง middleware สำหรับอัปโหลดไฟล์
const upload = multer({ storage });

// ดึงข้อมูล
router.get("/menucategory", menuController.get_menucategory);
router.get("/menuprice", menuController.get_price);
router.get("/menuprice/:id", menuController.get_pricebyid);
router.get("/menus", menuController.get_menu);
router.get("/menu-cus", menuController.get_menu_cus);
router.get("/menu/:id", menuController.get_menu_byid);
router.get("/menu/category/:id", menuController.get_menu_bycategory);
router.get("/menustatus", menuController.get_status);
router.get("/menucateone/:id", menuController.get_menu_bycategoryone);
router.get("/menutype", menuController.get_menu_type);
router.get("/getcost/:id", menuController.get_cost_menu);
router.get("/menu-recom", menuController.get_recommend);
router.get("/check-menucategory/:name", menuController.check_menucategory);
router.get("/check-menutype/:name", menuController.check_menutype);
router.get("/check-category/:name", menuController.check_category);
router.get("/check-menuname/:name", menuController.check_menuname);
router.get("/max-serve", menuController.max_serve);
// เพิ่ม
router.post("/addstatus", menuController.add_status);
router.post("/addcategory", menuController.add_category);
router.post(
  "/addmenu",
  authenticateToken,
  upload.single("img"),
  menuController.add_menu
);
router.post("/add-menutype", menuController.add_menu_type);
router.post("/new-price/:id", menuController.new_price);

// แก้ไข
router.put("/editmenu/:id", upload.single("img"), menuController.edit_menu);
router.put("/edit-menutype/:id", menuController.edit_menu_type);
router.put("/edit-cat/:id", menuController.edit_menu_cat);

// ลบ
router.delete("/deletemenu/:id", authenticateToken, menuController.delete_menu);
router.delete("/delete-menutype/:id", menuController.delete_menu_type);
router.delete("/delete-cat/:id", menuController.delete_menu_cat);

module.exports = router;
