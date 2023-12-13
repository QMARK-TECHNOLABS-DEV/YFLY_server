const express = require("express");
const router = express.Router();
const employeeCtrl = require("../controllers/EmployeeController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/create", authMiddleware, employeeCtrl.CreateEmployee);

module.exports = router;