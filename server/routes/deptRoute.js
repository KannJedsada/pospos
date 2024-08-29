const express = require("express");
const router = express.Router();
const deptController = require("../controllers/deptController");
const authenticateToken = require("../middlewares/authMiddleware")

router.get('/', authenticateToken, deptController.get_dept);
router.post('/', authenticateToken, deptController.add_dept);

module.exports = router;
