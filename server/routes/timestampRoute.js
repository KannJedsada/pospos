const express = require("express");
const router = express.Router();
const tsController = require("../controllers/timestampController");
const authenticateToken = require("../middlewares/authMiddleware");

router.get("/", authenticateToken, tsController.get_timestamp);
router.post("/checkin", authenticateToken, tsController.check_in);
router.put("/checkout", authenticateToken, tsController.check_out);
router.get("/late", authenticateToken, tsController.check_late);

module.exports = router;
