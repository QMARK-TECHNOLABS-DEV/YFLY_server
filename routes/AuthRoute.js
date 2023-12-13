const express = require("express");
const router = express.Router();
const authCtrl = require("../controllers/AuthController")

router.post("/login",authCtrl.Login);

module.exports = router;