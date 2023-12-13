const express = require("express");
const router = express.Router();
const authCtrl = require("../controllers/AuthController")

router.post("/login", authCtrl.Login);
router.get("/refresh-token", authCtrl.regenerateAccessToken);
router.get("/logout", authCtrl.Logout);

module.exports = router;