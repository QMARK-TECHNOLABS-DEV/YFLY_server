const router = require("express").Router();
const authMiddleware = require("../middlewares/authMiddleware");
const employeeChecker = require("../middlewares/employeeChecker");
const stepCtrl = require("../controllers/StepperController");

router.post("/create", authMiddleware, employeeChecker, stepCtrl.CreateAStepper)
router.get("/get/:id", authMiddleware, employeeChecker, stepCtrl.GetSingleStepper)
router.get("/get-all/:id", authMiddleware, employeeChecker, stepCtrl.GetAllSteppers)
router.put("/update", authMiddleware, employeeChecker, stepCtrl.updateStepper)
router.delete("/delete/:id", authMiddleware, employeeChecker, stepCtrl.DeleteAStepper)

module.exports = router;