const router = require("express").Router();
const dataCtrl = require("../controllers/DataController")

router.post("/label", dataCtrl.addLabel)

router.put("/label/:id", dataCtrl.editLabel)

router.get("", dataCtrl.getData)

module.exports = router;