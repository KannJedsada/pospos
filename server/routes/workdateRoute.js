const express = require("express");
const router = express.Router();
const workdateController = require("../controllers/workdeteController");
const authenticateToken = require("../middlewares/authMiddleware");

router.get("/workdate", workdateController.get_workdate);
router.get("/", workdateController.get_data);

module.exports = router;