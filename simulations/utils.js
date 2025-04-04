const PubNub = require('pubnub');
require('dotenv').config();

const pubnub = new PubNub({
  publishKey: process.env.SPORTS_PUBNUB_PUBLISH_KEY,  // Loaded from .env
  subscribeKey: process.env.SPORTS_PUBNUB_SUBSCRIBE_KEY,  // Loaded from .env
  secretKey: process.env.SPORTS_PUBNUB_SECRET_KEY,  // Loaded from .env
  userId: "SIM"
});

const pubnubSales = new PubNub({
  publishKey: process.env.SPORTS_SALES_PUBLISH_KEY,
  subscribeKey: process.env.SPORTS_SALES_SUBSCRIBE_KEY,
  userId: "SIM"
})

const lyraPubNub = new PubNub({
  publishKey: process.env.LYRA_PUBNUB_PUBLISH_KEY,  // Loaded from .env
  subscribeKey: process.env.LYRA_PUBNUB_SUBSCRIBE_KEY,  // Loaded from .env
  secretKey: process.env.LYRA_PUBNUB_SECRET_KEY,  // Loaded from .env
  userId: "player_sim"
})

function PromiseTimeout(delayms) {
  return new Promise(function (resolve, reject) {
    setTimeout(resolve, delayms);
  });
}

const sendMessage = async (channel, message) => {
  try {
    await pubnub.publish({
      channel: channel.id, // the channel name
      message: message,
      storeInHistory: true // option to store the message in history
    });
    await pubnubSales.publish({
      channel: channel.id,
      message: message,
      storeInHistory: true
    });
    await channel.sendText(JSON.stringify(message), {
      storeInHistory: true
    });
  } catch (error) {
    console.log("Publish failed: ", error);
  }
};

const sendTextMessage = async (channel, textMessage) => {
  try {
    await channel.sendText(textMessage), {
      storeInHistory: true
    };
  }
  catch(e){
    console.log("Publish failed: ", e);
  }
}

const sendBaseSDKMessage = async (channel, message) => {
  try{
    await lyraPubNub.publish({
      channel: channel.id,
      message: message,
      storeInHistory: true
    });
  }
  catch(error){
    console.log("Publish failed: ", error);
  }

}

const createChannel = async (chat, id) => {
  try {
    channel = await chat.createPublicConversation({ channelId: id });
  } catch (error) {
    console.log("Channel already exists or error creating:", error);
    channel = await chat.getChannel(id);
  }

  return channel;
}

module.exports = { PromiseTimeout, sendMessage, sendTextMessage, createChannel, sendBaseSDKMessage };