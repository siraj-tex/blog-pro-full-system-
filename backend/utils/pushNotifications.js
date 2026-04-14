const { Expo } = require('expo-server-sdk');
const User = require('../models/User');

const expo = new Expo();

const sendPushNotification = async (title, body, data = {}) => {
  try {
    // Get all users who have a push token
    const users = await User.find({ expoPushToken: { $exists: true, $ne: '' } });
    
    if (users.length === 0) return;

    let messages = [];
    for (let user of users) {
      if (!Expo.isExpoPushToken(user.expoPushToken)) {
        console.error(`Push token ${user.expoPushToken} is not a valid Expo push token`);
        continue;
      }

      messages.push({
        to: user.expoPushToken,
        sound: 'default',
        title: title,
        body: body,
        data: data,
      });
    }

    let chunks = expo.chunkPushNotifications(messages);
    let tickets = [];
    
    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error(error);
      }
    }
    
    console.log(`Sent ${messages.length} push notifications`);
    return tickets;
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
};

module.exports = {
  sendPushNotification
};
