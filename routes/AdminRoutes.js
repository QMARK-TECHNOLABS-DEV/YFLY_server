const express = require("express");
const router = express.Router();
const adminCtrl = require("../controllers/AdminController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminCheckMiddleware = require("../middlewares/adminCheckMiddleware");

router.get("/get/:id", adminCheckMiddleware, adminCtrl.GetAdmin);
router.put("/update", adminCheckMiddleware, adminCtrl.UpdateAdmin);
router.put("/change-password", adminCheckMiddleware, adminCtrl.ChangePassword);
router.get("/get-application-metrics",  adminCheckMiddleware, adminCtrl.GetApplicationMetrics);

module.exports = router;