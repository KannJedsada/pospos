const express = require("express");
const router = express.Router();
const qrController = require("../controllers/qrController");
const authenticateToken = require("../middlewares/authMiddleware");

router.get("/", qrController.get_qr);
router.post("/new_qr", qrController.new_qr);
router.put("/change_qr/:id", qrController.change_status);
router.post("/get_by_url", qrController.get_by_url);
router.get("/get_by_table/:id", qrController.get_by_table);

module.exports = router;
