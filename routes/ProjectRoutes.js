const router = require("express").Router();
const authMiddleware = require("../middlewares/authMiddleware");
const adminCheckMiddleware = require("../middlewares/adminCheckMiddleware");
const projectCtrl = require("../controllers/ProjectController");
const employeeChecker = require("../middlewares/employeeChecker");

router.post("/create",adminCheckMiddleware, projectCtrl.CreateProject)
router.get("/get-all",employeeChecker, projectCtrl.GetAllProjects)
router.get("/get/:id", employeeChecker, projectCtrl.GetProject)
router.get("/get-task/:id", employeeChecker, projectCtrl.GetATaskOfAProject)
router.put("/change-task-status", employeeChecker, projectCtrl.ChangeTaskStatus)
router.delete("/delete/:id",adminCheckMiddleware, projectCtrl.DeleteProject)

router.post("/add-task", adminCheckMiddleware, projectCtrl.AddTask)
router.get("/get-all-tasks/:id", employeeChecker, projectCtrl.GetAllTasksOfAProject)
router.delete("/delete-task/:id", adminCheckMiddleware, projectCtrl.DeleteATask)
router.put("/update-task/:id", employeeChecker, projectCtrl.UpdateTask)

router.put("/update",  adminCheckMiddleware, projectCtrl.UpdateProject)

router.put("/rework-task/:id",  adminCheckMiddleware, projectCtrl.ReworkTask)


router.get("/get-members/:id",  employeeChecker, projectCtrl.GetMembers)

module.exports = router;