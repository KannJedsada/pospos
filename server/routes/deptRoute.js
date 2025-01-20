const express = require("express");
const router = express.Router();
const deptController = require("../controllers/deptController");
const authenticateToken = require("../middlewares/authMiddleware");

router.get("/", authenticateToken, deptController.get_dept);
router.get("/:id", deptController.get_by_id);
router.get("/pos/:id", deptController.get_position);
router.post("/", authenticateToken, deptController.add_dept);
router.put(
  "/edit/:id",
  // authenticateToken,
  deptController.edit_dept
);
router.delete(
  "/delete/:id",
  // authenticateToken,
  deptController.delete_dept
);

module.exports = router;
