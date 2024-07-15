const { sendNotification } = require("../middlewares/firebaseAdmin");
const Employee = require("../models/EmployeeModel");
const Notification = require("../models/NotificationModel");

const notifyCtrl = {}


notifyCtrl.saveFCMToken = async (req, res) => {
    const { userId, token } = req.body;

    try {
        const user = await Employee.findById(userId);

        if (user) {
            if (!user.fcmTokens.includes(token)) {
                user.fcmTokens.push(token);
                await user.save();
            }
            res.status(200).json({ msg: 'success' });
        } else {
            res.status(404).json({ msg: 'User not found' });
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'Error saving token' });
    }
}

notifyCtrl.notificationSender = async (req, res) => {
    try {
        const { userId, message, notificationType } = req.body;

        const user = await Employee.findById(userId);

        if (!user?.fcmTokens?.length) { return res.status(400).json({ msg: 'FCM Token not found' }); }

        const tokens = user.fcmTokens;

        const payload = {
            notification: {
                title: 'Notification Title',
                body: message,
            },
        };

        const response = await sendNotification(tokens, payload);

        console.log('Successfully sent message:', response);

        const createObj = {
            userId,
            notificationType,
            message,
        }

        const notification = await Notification.create(createObj)

        console.log({'saved notification': notification})

        res.status(200).json({ msg: 'Notification sent successfully' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'Failed to sent Notification' });

    }
}




module.exports = notifyCtrl;