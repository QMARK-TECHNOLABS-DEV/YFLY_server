const express = require("express");
const router = express.Router();
const studentCtrl = require("../controllers/StudentController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/create", authMiddleware, studentCtrl.CreateStudent)

module.exports = router;