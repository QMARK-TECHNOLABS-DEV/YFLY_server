const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const commentCtrl = require("../controllers/CommentController");
const employeeChecker = require("../middlewares/employeeChecker");

router.get("/get-all/:type/:id", authMiddleware, employeeChecker, commentCtrl.GetComments)
router.post("/add", authMiddleware, employeeChecker, commentCtrl.AddComment)


module.exports = router;