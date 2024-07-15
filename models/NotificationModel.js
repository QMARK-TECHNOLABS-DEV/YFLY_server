const mongoose = require("mongoose")

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    notificationType:{ type: String},
    message: { type: String},
    isRead: { type: Boolean, default: false }
    
  },{timestamps:true});
  

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;