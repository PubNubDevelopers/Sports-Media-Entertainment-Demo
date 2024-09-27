const { PromiseTimeout, sendBaseSDKMessage, createChannel } = require('../utils');
const { Chat } = require("@pubnub/chat");
require('dotenv').config();

const simulateGameData = async () => {

  // Create a new Chat instance for the current user
  const chat = await Chat.init({
    publishKey: process.env.LYRA_PUBNUB_PUBLISH_KEY,
    subscribeKey: process.env.LYRA_PUBNUB_SUBSCRIBE_KEY,
    secretKey: process.env.LYRA_PUBNUB_SECRET_KEY,
    userId: "player_sim"
  });

  const playerKillsChannelId = "player-kills";
  const leaderBoardUpdatesChannelId = "leader-board-updates";
  const powerUpsChannelId = "power-up-updates";

  // Get or create the channels
  let playerKillsChannel = await chat.getChannel(playerKillsChannelId) || await createChannel(chat, playerKillsChannelId);
  let leaderBoardUpdatesChannel = await chat.getChannel(leaderBoardUpdatesChannelId) || await createChannel(chat, leaderBoardUpdatesChannelId);
  let powerUpsChannel = await chat.getChannel(powerUpsChannelId) || await createChannel(chat, powerUpsChannelId);

  // Function to generate a random delay between 2 and 10 seconds for different event types
  const getRandomDelay = (min = 2000, max = 10000) => Math.floor(Math.random() * (max - min + 1)) + min;

  // List of players and weapons to simulate random eliminations
  const players = ["player123", "player456", "player789", "player101", "player202"];
  const teams = ["teamA", "teamB"];
  const weapons = ["sniper_rifle", "shotgun", "assault_rifle", "pistol"];

  // Main loop to simulate game events continuously
  while (true) {
    try {
      // Simulate Player Elimination Event
      const playerKillEvent = {
        eventType: "elimination",
        timestamp: new Date().toISOString(),
        playerId: players[Math.floor(Math.random() * players.length)],
        eliminatedBy: players[Math.floor(Math.random() * players.length)],
        teamId: teams[Math.floor(Math.random() * teams.length)],
        eliminatedTeamId: teams[Math.floor(Math.random() * teams.length)],
        weaponUsed: weapons[Math.floor(Math.random() * weapons.length)],
        isHeadshot: Math.random() > 0.5
      };
      await sendBaseSDKMessage(playerKillsChannel, playerKillEvent);

      // Delay for next elimination (simulate 2-10 seconds)
      await PromiseTimeout(getRandomDelay());

      // Simulate Score Update Event (based on eliminations)
      const scoreUpdateEvent = {
        eventType: "teamScoreUpdate",
        timestamp: new Date().toISOString(),
        teamId: playerKillEvent.teamId, // Update the team that made the elimination
        currentScore: Math.floor(Math.random() * 100),
        eliminations: Math.floor(Math.random() * 20),
        deaths: Math.floor(Math.random() * 10)
      };
      await sendBaseSDKMessage(leaderBoardUpdatesChannel, scoreUpdateEvent);

      // Delay for next score update (simulate 5-10 seconds)
      await PromiseTimeout(getRandomDelay(5000, 10000));

      // Simulate Power-Up Event (less frequent)
      if (Math.random() > 0.7) { // Power-ups occur ~30% of the time
        const powerUpdateEvent = {
          eventType: "playerStatusUpdate",
          timestamp: new Date().toISOString(),
          playerId: players[Math.floor(Math.random() * players.length)],
          teamId: teams[Math.floor(Math.random() * teams.length)],
          health: Math.floor(Math.random() * 100),
          powerUps: ["speed_boost", "shield", "extra_health"][Math.floor(Math.random() * 3)]
        };
        await sendBaseSDKMessage(powerUpsChannel, powerUpdateEvent);

        // Delay for next power-up (simulate 6-10 seconds)
        await PromiseTimeout(getRandomDelay(6000, 10000));
      }

    } catch (error) {
      console.error("Error in game simulation loop:", error);
    }
  }
};

module.exports = { simulateGameData };