const { PromiseTimeout, sendMessage, sendTextMessage } = require('../utils');
const OpenAI = require('openai');
const { Chat } = require("@pubnub/chat");
require('dotenv').config();
const fs = require('fs');

// Initialize OpenAI with GPT-4
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure API key is loaded from .env
});

// File to store messages
const MESSAGES_FILE = 'messages.json';

// Function to load messages from JSON file (if it exists)
const loadMessages = () => {
  if (fs.existsSync(MESSAGES_FILE)) {
    const rawData = fs.readFileSync(MESSAGES_FILE);
    return JSON.parse(rawData);
  }
  return [];
};

// Function to simulate sending messages from JSON file
const simulateMessages = async (channelId) => {
  console.log("Loading messages from JSON");

  const messages = loadMessages();

  if (messages.length === 0) {
    console.error("No messages found in JSON file.");
    return;
  }

  // Infinite loop to simulate continuous chat
  let index = 0;
  while (true) {
    console.log("Looping through saved messages");

    try {
      const messageData = messages[index];

      console.log(`Sending message from user: ${messageData.userId}`);

      // Create a new Chat instance for the current user
      const chat = await Chat.init({
        publishKey: process.env.LYRA_PUBNUB_PUBLISH_KEY,
        subscribeKey: process.env.LYRA_PUBNUB_SUBSCRIBE_KEY,
        secretKey: process.env.LYRA_PUBNUB_SECRET_KEY,
        userId: messageData.userId // Use the userId from the message
      });

      // Get the channel object
      let channel = await chat.getChannel(channelId);

      if (!channel) {
        console.log("Creating new channel");
        channel = await createChannel(chat, channelId); // Create the channel if it doesn't exist
      }

      // Send the message to the channel
      await sendTextMessage(channel, messageData.message);
      console.log(`Message sent by ${messageData.name}: ${messageData.message}`);

      // Introduce random delay between messages to simulate natural chat behavior
      const randomDelay = Math.floor(Math.random() * 5000) + 2000; // Random delay between 2-7 seconds
      await PromiseTimeout(randomDelay);

      // Move to the next message, or loop back to the beginning if at the end
      index = (index + 1) % messages.length;

    } catch (error) {
      console.error("Error in message loop:", error);
    }
  }
};

module.exports = { simulateMessages };