const { Expo } = require("expo-server-sdk");

// Create a new Expo SDK client
let expo = new Expo();

const sendPushNotification = async (somePushTokens, message) => {
  let messages = [];
  for (let pushToken of somePushTokens) {
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      continue;
    }

    messages.push({
      to: pushToken,
      sound: "default",
      title: message.title,
      body: message.body,
      data: message.data || {},
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
  return tickets;
};

module.exports = {
  sendPushNotification,
};
