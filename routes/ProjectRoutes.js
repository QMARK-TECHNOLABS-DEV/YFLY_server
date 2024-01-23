const router = require("express").Router();
const authMiddleware = require("../middlewares/authMiddleware");
const adminCheckMiddleware = require("../middlewares/adminCheckMiddleware");
const projectCtrl = require("../controllers/ProjectController");
const employeeChecker = require("../middlewares/employeeChecker");

router.post("/create",authMiddleware,adminCheckMiddleware, projectCtrl.CreateProject)
router.get("/get-all",authMiddleware,adminCheckMiddleware, projectCtrl.GetAllProjects)
router.get("/get/:id",authMiddleware, employeeChecker, projectCtrl.GetProject)
router.get("/get-task/:id/:taskid",authMiddleware, employeeChecker, projectCtrl.GetATaskOfAProject)
router.put("/change-task-status",authMiddleware, employeeChecker, projectCtrl.ChangeTaskStatus)
router.delete("/delete/:id",authMiddleware,adminCheckMiddleware, projectCtrl.DeleteProject)

router.post("/add-task", authMiddleware,adminCheckMiddleware, projectCtrl.AddTask)
router.get("/get-all-tasks/:id", authMiddleware,adminCheckMiddleware, projectCtrl.GetAllTasksOfAProject)
router.delete("/delete-task/:id", authMiddleware,adminCheckMiddleware, projectCtrl.DeleteATask)
router.put("/update-task", authMiddleware,adminCheckMiddleware, projectCtrl.UpdateTask)

router.put("/update", authMiddleware, adminCheckMiddleware, projectCtrl.UpdateProject)

module.exports = router;