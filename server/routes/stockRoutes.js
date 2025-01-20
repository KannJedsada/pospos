const express = require("express");
const router = express.Router();
const stockController = require("../controllers/stockController");
const authenticateToken = require("../middlewares/authMiddleware");

router.get("/category", stockController.get_category);
router.get("/category/:id", stockController.get_categoryby_id);
router.get("/stocks", stockController.get_stocks);
router.get("/stockbycat/:id", stockController.get_stockby_cat);
router.get("/bymaterial/:id", stockController.get_by_material);
router.get("/get-stock", stockController.get_stock);
router.get("/get-stock-detail/:id", stockController.get_stock_detail);
router.get(`/stock-less`, stockController.get_stockless);

router.post("/add_category", stockController.add_category);
router.post("/add_stock", stockController.add_stock);
router.post("/new_stock", stockController.new_stock);

router.put("/edit_category/:id", stockController.edit_category);
router.put("/editmin/:id", stockController.edit_min);

router.delete("/delete_cat/:id", stockController.delete_category);

module.exports = router;
