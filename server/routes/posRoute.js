const express = require("express");
const router = express.Router();
const posController = require("../controllers/posController");
const authenticateToken = require("../middlewares/authMiddleware")

router.get("/", posController.get_pos);
router.post("/", authenticateToken, posController.add_pos);
router.put("/:id", authenticateToken, posController.update_pos);
router.delete("/:id", authenticateToken, posController.delete_pos);

module.exports = router;
