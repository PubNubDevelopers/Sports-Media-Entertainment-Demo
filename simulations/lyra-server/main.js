const { simulateMessages } = require('./simulateMessages');
const { simulateGameData } = require('./simulateGameData');
require('dotenv').config();

const lyraSim = async () => {
  let channelId = "all-main-menu";

  console.log("Simulating messages");
  simulateMessages(channelId);
  simulateGameData()
}

module.exports = { lyraSim }