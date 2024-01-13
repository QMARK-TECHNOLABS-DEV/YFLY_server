const router = require("express").Router();
const authMiddleware = require("../middlewares/authMiddleware");
const adminCheckMiddleware = require("../middlewares/adminCheckMiddleware");
const projectCtrl = require("../controllers/ProjectController");
const employeeChecker = require("../middlewares/employeeChecker");

router.post("/create",authMiddleware,adminCheckMiddleware, projectCtrl.CreateProject)
router.get("/get-all",authMiddleware,adminCheckMiddleware, projectCtrl.GetAllProjects)
router.get("/get/:id",authMiddleware, employeeChecker, projectCtrl.GetProject)
router.put("/update-status",authMiddleware, employeeChecker, projectCtrl.UpdateStatus)
router.delete("/delete/:id",authMiddleware,adminCheckMiddleware, projectCtrl.DeleteProject)


module.exports = router;