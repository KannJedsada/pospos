const express = require("express");
const router = express.Router();
const promoController = require("../controllers/promoController");
const authenticateToken = require("../middlewares/authMiddleware");

router.get("/promotions", promoController.get_promotions);
router.get("/get-promo", promoController.get_promo);
router.post("/new_promotion", promoController.new_promotion);
router.put("/edit_promotion/:id", promoController.edit_promotion);
router.delete("/delete_promotion/:id", promoController.delete_promotion);

module.exports = router;
