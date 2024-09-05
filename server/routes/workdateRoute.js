const express = require("express");
const router = express.Router();
const workdateController = require("../controllers/workdeteController");
const authenticateToken = require("../middlewares/authMiddleware");

router.get("/workdate", authenticateToken, workdateController.get_workdate);
router.get("/", authenticateToken, workdateController.get_data);
router.get("/newdate", authenticateToken, workdateController.get_newdate);
router.post("/add", authenticateToken, workdateController.add_workdate);

module.exports = router;
