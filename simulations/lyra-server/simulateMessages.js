const { PromiseTimeout, sendMessage, sendTextMessage } = require('../utils');
const { Chat } = require("@pubnub/chat");
const PubNub = require('pubnub');
const AWS = require('aws-sdk');
const { createChannel } = require('../utils');
require('dotenv').config();
const fs = require('fs');

// Configure AWS Translate
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION, // E.g., "us-west-2"
});

// Initialize AWS Translate
const translate = new AWS.Translate();

const pubnub = new PubNub({
  publishKey: process.env.LYRA_PUBNUB_PUBLISH_KEY,
  subscribeKey: process.env.LYRA_PUBNUB_SUBSCRIBE_KEY,
  secretKey: process.env.LYRA_PUBNUB_SECRET_KEY,
  userId: "Subscriber" // Use the userId from the message
});

// Variable to store the current language
let currentLanguage = 'en'; // Default language

// Subscribe to the "language-change" channel
pubnub.subscribe({
  channels: ['language-change']
});

// Listen for messages on the channel
pubnub.addListener({
  message: function (event) {
    // Check the channel of the incoming message and direct it to the appropriate handler
    if (event.channel === 'language-change') {
      handleLanguageChangeMessage(event.message);
    }
  },
  status: function (statusEvent) {
    if (statusEvent.category === "PNConnectedCategory") {
      console.log('Subscribed to channels: "language-change"');
    }
  }
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

// Function to handle incoming messages on the "language-change" channel
const handleLanguageChangeMessage = (message) => {
  console.log("RECEIVED MESSAGE OBJECT: ", message);

  // Update the current language based on the incoming message
  currentLanguage = message;
  console.log(`Language changed to: ${currentLanguage}`);
};

// Function to translate a message using AWS Translate
const translateMessage = async (message, targetLanguage) => {
  const params = {
    SourceLanguageCode: 'auto', // Automatically detect the source language
    TargetLanguageCode: targetLanguage, // Use the target language from the event
    Text: message
  };

  try {
    const data = await translate.translateText(params).promise();
    return data.TranslatedText;
  } catch (error) {
    console.error("Error translating message:", error);
    return message; // Return the original message in case of an error
  }
};

// Function to simulate sending messages from JSON file
const simulateMessages = async (channelId) => {

  const messages = loadMessages();

  if (messages.length === 0) {
    console.error("No messages found in JSON file.");
    return;
  }

  // Infinite loop to simulate continuous chat
  let index = 0;
  while (true) {

    try {
      const messageData = messages[index];

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
        channel = await createChannel(chat, channelId); // Create the channel if it doesn't exist
      }

      // Translate the message based on the current language
      const translatedMessage = await translateMessage(messageData.message, currentLanguage);

      // Send the translated message to the channel
      await sendTextMessage(channel, translatedMessage);

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