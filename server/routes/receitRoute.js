const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authMiddleware");
const receiptController = require("../controllers/receiptController");

router.get("/get-receipts", receiptController.get_receipts);
router.get("/get-receipt/:id", receiptController.get_receipt);
router.get("/get-receipt-table/:id", receiptController.get_receipt_bytable);
router.get("/get-receipt-detail/:id", receiptController.get_receipt_detail);
router.get("/get-rept-id/:id", receiptController.get_receiptbyid);
router.get("/get-rept-detail/:id", receiptController.get_rept_detail);
router.get("/get-cost-profit", receiptController.get_cost_profit);
router.get(`/get-data`, receiptController.get_data);
router.post("/get-costprofit-bydate", receiptController.get_cost_profit_bydata);
router.post("/create-receipt", receiptController.create_receipt);
router.put("/payment-receipt/:id", receiptController.payment_receipt);
router.delete(`/delete-rept/:id`, receiptController.delete_receipt);

module.exports = router;
