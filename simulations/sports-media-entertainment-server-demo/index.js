const { Chat } = require("@pubnub/chat");
const { simulateGame } = require('./simulateGame');
const { createChannel } = require('../utils'); // assuming createChannel is in utils.js

const main = async () => {
  const chat = await Chat.init({
    publishKey: process.env.SPORTS_PUBNUB_PUBLISH_KEY,  // Loaded from .env
    subscribeKey: process.env.SPORTS_PUBNUB_SUBSCRIBE_KEY,  // Loaded from .env
    secretKey: process.env.SPORTS_PUBNUB_SECRET_KEY,  // Loaded from .env
    userId: "SIM"
  });

  const channelId = 'play-by-play-2023-11-14-OKC-SAS';
  const pollChannelId = 'poll-play-by-play-2023-11-14-OKC-SAS';

  let channel = await chat.getChannel(channelId);
  let pollChannel = await chat.getChannel(pollChannelId);

  if (channel === null) {
    channel = await createChannel(chat, channelId);
  }

  if (pollChannel === null) {
    pollChannel = await createChannel(chat, pollChannelId);
  }

  await simulateGame();
}

main();


