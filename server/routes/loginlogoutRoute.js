const express = require("express");
const router = express.Router();
const loginlogout = require("../controllers/loginlogoutController");
const authenticateToken = require("../middlewares/authMiddleware");

router.post("/login", loginlogout.login);
router.post("/logout",authenticateToken, loginlogout.logout);

module.exports = router;
