const express = require("express");
const router = express.Router();
const tableController = require("../controllers/tableController");
const authenticateToken = require("../middlewares/authMiddleware");

router.get("/status", tableController.get_table_status);
router.get("/tables", tableController.get_tables);
router.get("/table/:id", tableController.get_table);
router.post("/new_status", tableController.add_table_status);
router.post("/new_table", tableController.add_table);
router.put("/change_status/:id", tableController.change_status);
router.put("/edit_table/:id", tableController.edit_table);
router.delete("/delete_table/:id", tableController.delete_table);

module.exports = router;
