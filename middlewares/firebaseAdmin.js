const admin = require('firebase-admin');
const serviceAccount = require('../configs/firebase-adminsdk-config.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const sendNotification = async (tokens, payload) => {
    try {
        const response = await admin.messaging().send(tokens, payload)
        return response;
    } catch (error) {
        console.log(error)
    }
    
};

module.exports = { sendNotification };
