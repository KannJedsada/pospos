const express = require("express");
const router = express.Router();
const menuController = require("../controllers/menuController");
const authenticateToken = require("../middlewares/authMiddleware");

router.get("/menucategory", menuController.get_menucategory);
router.get("/menuprice", menuController.get_price);
router.get("/menuprice/:id", menuController.get_pricebyid);
router.get("/menus", menuController.get_menu);
router.get("/menu/:id", menuController.get_menu_byid);
router.get("/menustatus", menuController.get_status);

// เพิ่ม
router.post("/addstatus", menuController.add_status);
router.post("/addcategory", menuController.add_category);
router.post("/addmenu", menuController.add_menu);

module.exports = router;
