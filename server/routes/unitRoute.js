const express = require("express");
const router = express.Router();
const unit = require("../controllers/unitController");
const authenticateToken = require("../middlewares/authMiddleware");

router.get("/", unit.get_unit);
router.post("/add", unit.add_unit);
router.put("/edit/:id", unit.edit_unit);
router.delete("/delete/:id", unit.delete_unit);

module.exports = router;
