const { Chat } = require("@pubnub/chat");
const { createChannel } = require('../utils');
const { simulateMessages } = require('./simulateMessages');
require('dotenv').config();

const lyraSim = async () => {
  let channelId = "all-main-menu";

  console.log("Simulating messages");
  simulateMessages(channelId);
}

module.exports = { lyraSim }