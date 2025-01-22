const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/empController");
const authenticateToken = require("../middlewares/authMiddleware");

// ดึงขอมูลพนักงานทั้งหมด
router.get("/", employeeController.get_emp);
// ดึงข้อมูลเฉพาะบุคคล
router.get("/data/:id_card", authenticateToken, employeeController.get_data);
// ดึงเวลาทำงานของพนักงาน
router.get(
  "/workdate/:id_card",
  authenticateToken,
  employeeController.get_workdate
);
// ดึงข้อมูลส่วนตัวของบุคคน
router.get("/:id", authenticateToken, employeeController.get_by_id);
// ดึงข้อมูลแผนกของพนักงาน
router.get("/empdept/:id_card", employeeController.get_dept);
// ดึงข้อมูลพนักงานตำแหน่งนั้นๆ
router.get("/position/:p_id", authenticateToken, employeeController.get_by_pid);
// ดึงข้อมูลพนักงานตำแหน่งนั้นๆ
router.get("/dept/:dept_id", authenticateToken, employeeController.get_by_dept);
// ดึงข้อมูลพนักงานที่อยู่ในแผนกและตำแหน่งนั้น
router.get(
  "/dept/:dept_id/position/:p_id",
  authenticateToken,
  employeeController.get_by_dept_and_position
);

// เพิ่ม ลบ แก้ไข ข้อมูลของพนักงาน
router.post("/", authenticateToken, employeeController.add_emp);
router.put("/:id", authenticateToken, employeeController.update_emp);
router.delete("/:id", authenticateToken, employeeController.delete_emp);
router.put("/permission/:id", employeeController.permission);

// นับจำนวนการมาสายขาดงานเฉพาะเดือนนี้
router.get("/countlate/:id_card", employeeController.count_late);
router.get("/countabsent/:id_card", employeeController.count_absent);

module.exports = router;
