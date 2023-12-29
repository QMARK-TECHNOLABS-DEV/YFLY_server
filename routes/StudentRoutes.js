const express = require("express");
const router = express.Router();
const studentCtrl = require("../controllers/StudentController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminCheckMiddleware = require("../middlewares/adminCheckMiddleware");
const upload = require("../middlewares/multerToS3");

router.post("/create", authMiddleware, adminCheckMiddleware, upload.single('image'), studentCtrl.CreateStudent);
router.get("/get-all", authMiddleware, adminCheckMiddleware, studentCtrl.GetAllStudents )
router.get("/get/:id", authMiddleware, studentCtrl.GetStudent);
router.put("/update", authMiddleware, adminCheckMiddleware, upload.single('image'), studentCtrl.UpdateStudent)
router.put("/change-password", authMiddleware, studentCtrl.ChangePassword);


module.exports = router;