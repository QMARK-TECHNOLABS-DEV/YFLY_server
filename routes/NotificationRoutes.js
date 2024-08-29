const express = require('express');
const notifyCtrl = require('../controllers/NotificationController');
const router = express.Router();

router.post('/fcmtoken',  notifyCtrl.saveFCMToken);
router.post('/send', notifyCtrl.notificationSender);
router.post('/multi-send', notifyCtrl.mutipleNotificationsSender);

module.exports = router;
