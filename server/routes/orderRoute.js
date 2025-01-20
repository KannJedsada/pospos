const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const authenticateToken = require("../middlewares/authMiddleware");

router.get("/orders", orderController.get_order);
router.get("/ordered", orderController.get_ordered);
router.get("/orderdetail/:table_id", orderController.get_order_detail);
router.post("/addorder", orderController.add_order);
router.put("/decreaseqty/:id", orderController.decrease_qty);
router.put("/change_dish", orderController.change_dish_status);
router.get("/getcarts/:id", orderController.get_carts);
router.post("/addtocarts", orderController.add_to_cart);
router.delete("/removecart/:id", orderController.remove_from_cart);

module.exports = router;
