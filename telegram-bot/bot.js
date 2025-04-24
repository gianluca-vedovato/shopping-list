const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Telegram bot token from BotFather
const token = process.env.TELEGRAM_BOT_TOKEN;
// Your backend API URL
const API_URL = process.env.API_URL || 'http://localhost:3000/api';
// Authorized user IDs (for security)
const AUTHORIZED_USERS = process.env.AUTHORIZED_USERS ? process.env.AUTHORIZED_USERS.split(',').map(id => parseInt(id.trim())) : [];

// Create a bot instance
const bot = new TelegramBot(token, { polling: true });

// Helper function to check if user is authorized
const isAuthorized = (userId) => {
  if (AUTHORIZED_USERS.length === 0) return true; // If no authorized users specified, allow all
  return AUTHORIZED_USERS.includes(userId);
};

// Start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const isGroup = msg.chat.type === 'group' || msg.chat.type === 'supergroup';
  
  if (isGroup) {
    bot.sendMessage(chatId, 'Welcome to your Shopping List Bot! Use /add [item] to add items to your shopping list.');
  } else {
    bot.sendMessage(chatId, 'Welcome to your Shopping List Bot! Send me items to add to your shopping list or use /add [item].');
  }
});

// Help command
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const isGroup = msg.chat.type === 'group' || msg.chat.type === 'supergroup';
  
  let helpText = 'Shopping List Bot Commands:\n' +
    '/start - Start the bot\n' +
    '/list - Show your current shopping list\n' +
    '/clear - Clear all completed items\n';
  
  if (isGroup) {
    helpText += '/add [item] - Add an item to your shopping list\n';
  } else {
    helpText += 'Just send any text to add it to your shopping list!\n';
  }
  
  bot.sendMessage(chatId, helpText);
});

// List command - show current shopping list
bot.onText(/\/list/, async (msg) => {
  const chatId = msg.chat.id;
  
  if (!isAuthorized(msg.from.id)) {
    return bot.sendMessage(chatId, 'You are not authorized to use this bot.');
  }
  
  try {
    const response = await axios.get(`${API_URL}/items`);
    const items = response.data;
    
    if (items.length === 0) {
      return bot.sendMessage(chatId, 'Your shopping list is empty.');
    }
    
    const activeItems = items.filter(item => !item.completed);
    const completedItems = items.filter(item => item.completed);
    
    let message = '🛒 *Your Shopping List*\n\n';
    
    if (activeItems.length > 0) {
      message += '*Items to buy:*\n';
      activeItems.forEach((item, index) => {
        message += `${index + 1}. ${item.name}\n`;
      });
    }
    
    if (completedItems.length > 0) {
      message += '\n*Completed items:*\n';
      completedItems.forEach((item, index) => {
        message += `✅ ${item.name}\n`;
      });
    }
    
    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Error fetching shopping list:', error);
    bot.sendMessage(chatId, 'Failed to fetch your shopping list. Please try again later.');
  }
});

// Clear command - remove all completed items
bot.onText(/\/clear/, async (msg) => {
  const chatId = msg.chat.id;
  
  if (!isAuthorized(msg.from.id)) {
    return bot.sendMessage(chatId, 'You are not authorized to use this bot.');
  }
  
  try {
    const response = await axios.get(`${API_URL}/items`);
    const completedItems = response.data.filter(item => item.completed);
    
    if (completedItems.length === 0) {
      return bot.sendMessage(chatId, 'No completed items to clear.');
    }
    
    // Delete all completed items
    await Promise.all(completedItems.map(item => 
      axios.delete(`${API_URL}/items/${item._id}`)
    ));
    
    bot.sendMessage(chatId, `Cleared ${completedItems.length} completed items from your shopping list.`);
  } catch (error) {
    console.error('Error clearing completed items:', error);
    bot.sendMessage(chatId, 'Failed to clear completed items. Please try again later.');
  }
});

// Command to add an item to the shopping list
bot.onText(/\/add (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const itemText = match[1].trim();
  
  if (!isAuthorized(msg.from.id)) {
    return bot.sendMessage(chatId, 'You are not authorized to use this bot.');
  }
  
  try {
    // Add the item to the shopping list
    await axios.post(`${API_URL}/items`, {
      name: itemText,
      source: 'telegram'
    });
    
    bot.sendMessage(chatId, `Added "${itemText}" to your shopping list! 🛒`);
  } catch (error) {
    console.error('Error adding item to shopping list:', error);
    bot.sendMessage(chatId, 'Failed to add item to your shopping list. Please try again later.');
  }
});

// Handle any text message as an item to add to the shopping list (in private chats only)
bot.on('message', async (msg) => {
  // Skip commands, non-text messages, and group messages
  if (msg.text.startsWith('/') || !msg.text || msg.chat.type !== 'private') return;
  
  const chatId = msg.chat.id;
  const itemText = msg.text.trim();
  
  if (!isAuthorized(msg.from.id)) {
    return bot.sendMessage(chatId, 'You are not authorized to use this bot.');
  }
  
  try {
    // Add the item to the shopping list
    await axios.post(`${API_URL}/items`, {
      name: itemText,
      source: 'telegram'
    });
    
    bot.sendMessage(chatId, `Added "${itemText}" to your shopping list! 🛒`);
  } catch (error) {
    console.error('Error adding item to shopping list:', error);
    bot.sendMessage(chatId, 'Failed to add item to your shopping list. Please try again later.');
  }
});

console.log('Telegram bot is running...');
