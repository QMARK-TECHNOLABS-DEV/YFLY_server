const { isValidObjectId } = require("mongoose");
const { sendNotification } = require("../middlewares/firebaseAdmin");
const Admin = require("../models/AdminModel");
const Employee = require("../models/EmployeeModel");
const Notification = require("../models/NotificationModel");

const notifyCtrl = {}


notifyCtrl.saveFCMToken = async (req, res) => {
    try {
        const { userId, token } = req.body;
        console.log(req.body);

        if (!token?.trim()) {
            return res.status(400).json({ msg: "Invalid token" });
        }

        const admin = await Admin.findById(userId);
        const employee = await Employee.findById(userId);

        let user;

        if (admin) {
            user = admin;
        } else if (employee) {
            user = employee;
        } else {
            return res.status(404).json({ msg: "User not found" });
        }

        if (user) {
            if (!Array.isArray(user.fcmTokens)) {
                user.fcmTokens = [];
            }

            if (!user.fcmTokens.includes(token)) {
                user.fcmTokens.push(token);
                await user.save();
            }
            res.status(200).json({ msg: 'Success' });
        } else {
            res.status(404).json({ msg: 'User not found' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Error saving token' });
    }
};


notifyCtrl.notificationSender = async (req, res) => {
    try {
        const { userId, title, body, notificationType, route } = req.body;
        console.log(req.body)

        const admin = await Admin.findById(userId);
        const employee = await Employee.findById(userId);

        let user;

        if (admin) {
            user = admin;
        } else if (employee) {
            user = employee;
        } else {
            return res.status(404).json({ msg: "User not found" })
        }

        
        const createObj = {
            userId,
            notificationType,
            title: title,
            body: body,
            route
        }

        const notification = await Notification.create(createObj)

        console.log({ 'saved notification': notification })

        if(!notification) {return res.status(500).json({ msg: 'Failed to save notification' });}


        // Live Notification sending part
        const tokens = user?.fcmTokens ;
        if (!(Array.isArray(tokens) && tokens?.length)) { return res.status(400).json({ msg: 'FCM Token not found' }); }

        const payload = {
            notification: {
                title: title,
                body: body,
            },
            data: {
                docId: String(notification?._id),
                userId,
                notificationType,
                route
            },
            token: tokens[tokens.length - 1],
        };


        const response = await sendNotification(tokens, payload);

        if(response){
            console.log('Successfully sent message:', response);
    
            res.status(200).json({ msg: 'Notification sent successfully' });

        }else{
            res.status(500).json({ msg: 'Failed to sent the Notification' });
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'Failed to sent Notification' });

    }
}


notifyCtrl.getSingleNotification = async(req,res)=>{
    try {
        const {id} = req.params;
        if(!isValidObjectId(id)) return res.status(400).json({ msg: 'Invalid Id' })

        const notification = await Notification.findById(id)
        
        if(!notification){ return res.status(404).json({ msg: 'Notification not found' })}

        res.status(200).json({notification, msg:'success'})
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'Failed to fetch' });
    }
}

notifyCtrl.getUserNotifications = async(req,res)=>{
    try {
        const {id} = req.params;
        if(!isValidObjectId(id)) return res.status(400).json({ msg: 'Invalid Id' })

        const filters = {userId: id}

        const {readStatus, notificationType} = req.query;

        if(readStatus){
            if(readStatus === 'read'){
                filters.isRead = true;
            }
            else if(readStatus === 'unread'){
                filters.isRead = false;
            }
        }

        if(notificationType){
            filters.notificationType = notificationType;
        }

        const notifications = await Notification.find(filters)
        
        res.status(200).json({notification: notifications, msg:'success'})
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'Failed to fetch' });
    }
}

notifyCtrl.alterReadStatus = async(req,res)=>{
    try {
        const {selected, status, userId} = req.body;

        if(!Array.isArray(selected)){return res.status(400).json({ msg: 'Selected not an array' })}

        const validArray = selected?.length && selected.every(item=> isValidObjectId(item))
        if(!validArray) {return res.status(400).json({ msg: 'Invalid Id/s' })}

        if(!['read', 'unread']?.includes(status)){return res.status(400).json({ msg: 'Invalid status' })}

        const filter = {}
        if(status === 'read'){ filter.isRead = true}
        else if(status === 'unread'){ filter.isRead = false}

        const updatedDocuments = await Notification.updateMany({_id:{$in: selected}}, 
            {$set: filter}, {new: true}
        )

        console.log({updatedDocuments})
        if(!updatedDocuments?.modifiedCount){ return res.status(409).json({ msg: 'Unable to update status' })}

        const notifications = await Notification.find({userId})
        
        res.status(200).json({notification: notifications, msg:'success'})
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'Something went wrong' });
    }
}


// send multiple notifications
notifyCtrl.mutipleNotificationsSender = async (req, res) => {
    try {
        const { userIdList, title, body, notificationType, route } = req.body;
        console.log(req.body);

        if (!Array.isArray(userIdList) || !userIdList.length) {
            return res.status(400).json({ msg: "userIdList is required and should be a non-empty array" });
        }

        const users = await Promise.all([
            Admin.find({ _id: { $in: userIdList } }),
            Employee.find({ _id: { $in: userIdList } })
        ]);

        const allUsers = [...users[0], ...users[1]];
        const notifications = [];
        const failedUsers = [];

        for (const user of allUsers) {
            const createObj = {
                userId: user._id,
                notificationType,
                title: title,
                body: body,
                route
            };

            const notification = await Notification.create(createObj);
            notifications.push(notification);

            if (!notification) {
                failedUsers.push(user._id);
                continue;
            }

            const tokens = user?.fcmTokens;
            if (!(Array.isArray(tokens) && tokens.length)) {
                failedUsers.push(user._id);
                continue;
            }

            // Send notifications to all tokens for the user
            const payload = {
                notification: {
                    title: title,
                    body: body,
                },
                data: {
                    docId: String(notification?._id),
                    userId: String(user._id),
                    notificationType,
                    route
                }
            };

            const sendPromises = tokens.map(token => 
                sendNotification(token, { ...payload, token })
            );

            const responses = await Promise.all(sendPromises);

            responses.forEach((response, index) => {
                if (!response) {
                    console.log(`Failed to send notification to token: ${tokens[index]} for user ID: ${user._id}`);
                } else {
                    console.log(`Successfully sent message to token: ${tokens[index]} for user ID: ${user._id}`, response);
                }
            });
        }

        if (failedUsers.length) {
            console.log(`Failed to process notifications for user IDs: ${failedUsers.join(', ')}`);
        }

        res.status(200).json({ 
            msg: 'Notifications processed successfully', 
            failedUsers 
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Failed to process notifications' });
    }
};


module.exports = notifyCtrl;