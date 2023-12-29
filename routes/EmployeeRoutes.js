const express = require("express");
const router = express.Router();
const employeeCtrl = require("../controllers/EmployeeController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminCheckMiddleware = require("../middlewares/adminCheckMiddleware");
const upload = require("../middlewares/multerToS3");

router.post("/create", authMiddleware, adminCheckMiddleware, upload.single('image'), employeeCtrl.CreateEmployee);
router.get("/get-all", authMiddleware, adminCheckMiddleware, employeeCtrl.GetAllEmployees )
router.get("/get/:id", authMiddleware, employeeCtrl.GetEmployee);
router.put("/update", authMiddleware, adminCheckMiddleware, upload.single('image'), employeeCtrl.UpdateEmployee)
router.put("/change-password", authMiddleware, employeeCtrl.ChangePassword);
router.put("/deactivate", authMiddleware, adminCheckMiddleware, employeeCtrl.DeactivateEmployee)

router.get("/get-assigned-works/:id", authMiddleware, employeeCtrl.GetAssignedWorks)

module.exports = router;