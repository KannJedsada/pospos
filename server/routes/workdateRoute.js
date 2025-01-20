const express = require("express");
const router = express.Router();
const workdateController = require("../controllers/workdeteController");
const authenticateToken = require("../middlewares/authMiddleware");

router.get("/workdate", authenticateToken, workdateController.get_workdate);
router.get("/", authenticateToken, workdateController.get_data);
router.get(
  "/newdate",
  //  authenticateToken,
  workdateController.get_newdate
);
router.get("/count-workdate", workdateController.count_workdate);
router.get("/check-empworkdate", workdateController.check_emp_workdate);
router.post("/add", authenticateToken, workdateController.add_workdate);
router.put(
  "/edit_workdate",
  authenticateToken,
  workdateController.edit_workdate
);
router.delete(
  "/delete_workdate/:id",
  authenticateToken,
  workdateController.delete_date
);

module.exports = router;
