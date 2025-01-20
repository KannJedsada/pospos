const express = require("express");
const router = express.Router();
const unit = require("../controllers/unitController");
const authenticateToken = require("../middlewares/authMiddleware");

router.get("/", unit.get_unit);
router.post("/add", unit.add_unit);
router.put("/edit/:id", unit.edit_unit);
router.delete("/delete/:id", unit.delete_unit);

router.get("/get-conver", unit.get_unit_conver);
router.post("/add-conver", unit.add_unit_conver);
router.put("/edit-conver/:id", unit.edit_unit_conver);
router.delete("/delete-conver/:id", unit.delete_unit_conver);

module.exports = router;
