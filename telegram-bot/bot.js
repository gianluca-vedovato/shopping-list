const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const https = require('https');
const { promisify } = require('util');
const speech = require('@google-cloud/speech');
const ffmpeg = require('fluent-ffmpeg');
const { exec } = require('child_process');

// Load environment variables
dotenv.config();

// Handle Google Cloud credentials from environment variable
if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  // If the credentials are provided as a JSON string (for Render deployment)
  const credentialsPath = path.join(__dirname, 'google-credentials.json');
  fs.writeFileSync(credentialsPath, process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
  process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;
  console.log('Google Cloud credentials set from environment variable');
}

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
    bot.sendMessage(chatId, 'Benvenuto nel tuo Bot Lista della Spesa! Usa /add [prodotto] per aggiungere prodotti alla tua lista.');
  } else {
    bot.sendMessage(chatId, 'Benvenuto nel tuo Bot Lista della Spesa! Inviami prodotti da aggiungere alla tua lista o usa /add [prodotto].');
  }
});

// Help command
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const isGroup = msg.chat.type === 'group' || msg.chat.type === 'supergroup';
  
  let helpText = 'Comandi del Bot Lista della Spesa:\n' +
    '/start - Avvia il bot\n' +
    '/list - Mostra la tua lista della spesa\n' +
    '/clear - Cancella tutti gli elementi completati\n';
  
  if (isGroup) {
    helpText += '/add [prodotto] - Aggiungi un prodotto alla tua lista\n';
  } else {
    helpText += 'Invia semplicemente un testo per aggiungere un prodotto alla lista!\n' +
    'Puoi anche inviare messaggi vocali per aggiungere prodotti\n';
  }
  
  bot.sendMessage(chatId, helpText);
});

// List command - show current shopping list
bot.onText(/\/list/, async (msg) => {
  const chatId = msg.chat.id;
  
  if (!isAuthorized(msg.from.id)) {
    return bot.sendMessage(chatId, 'Non sei autorizzato ad utilizzare questo bot.');
  }
  
  try {
    const response = await axios.get(`${API_URL}/items`);
    const items = response.data;
    
    if (items.length === 0) {
      return bot.sendMessage(chatId, 'La tua lista della spesa è vuota.');
    }
    
    const activeItems = items.filter(item => !item.completed);
    const completedItems = items.filter(item => item.completed);
    
    let message = '🛒 *La tua Lista della Spesa*\n\n';
    
    if (activeItems.length > 0) {
      message += '*Prodotti da comprare:*\n';
      activeItems.forEach((item, index) => {
        message += `${index + 1}. ${item.name}\n`;
      });
    }
    
    if (completedItems.length > 0) {
      message += '\n*Prodotti completati:*\n';
      completedItems.forEach((item, index) => {
        message += `✅ ${item.name}\n`;
      });
    }
    
    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Error fetching shopping list:', error);
    bot.sendMessage(chatId, 'Impossibile recuperare la tua lista della spesa. Riprova più tardi.');
  }
});

// Clear command - remove all completed items
bot.onText(/\/clear/, async (msg) => {
  const chatId = msg.chat.id;
  
  if (!isAuthorized(msg.from.id)) {
    return bot.sendMessage(chatId, 'Non sei autorizzato ad utilizzare questo bot.');
  }
  
  try {
    const response = await axios.get(`${API_URL}/items`);
    const completedItems = response.data.filter(item => item.completed);
    
    if (completedItems.length === 0) {
      return bot.sendMessage(chatId, 'Non ci sono prodotti completati da cancellare.');
    }
    
    // Delete all completed items
    await Promise.all(completedItems.map(item => 
      axios.delete(`${API_URL}/items/${item._id}`)
    ));
    
    bot.sendMessage(chatId, `Cancellati ${completedItems.length} prodotti completati dalla tua lista della spesa.`);
  } catch (error) {
    console.error('Error clearing completed items:', error);
    bot.sendMessage(chatId, 'Impossibile cancellare i prodotti completati. Riprova più tardi.');
  }
});

// Command to add an item to the shopping list
bot.onText(/\/add (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const itemText = match[1].trim();
  
  if (!isAuthorized(msg.from.id)) {
    return bot.sendMessage(chatId, 'Non sei autorizzato ad utilizzare questo bot.');
  }
  
  try {
    // Add the item to the shopping list
    await axios.post(`${API_URL}/items`, {
      name: itemText,
      source: 'telegram'
    });
    
    bot.sendMessage(chatId, `Aggiunto "${itemText}" alla tua lista della spesa! 🛒`);
  } catch (error) {
    console.error('Error adding item to shopping list:', error);
    bot.sendMessage(chatId, 'Impossibile aggiungere il prodotto alla lista. Riprova più tardi.');
  }
});

// Handle any text message as an item to add to the shopping list (in private chats only)
bot.on('message', async (msg) => {
  // Skip commands and group messages
  if ((msg.text && msg.text.startsWith('/')) || msg.chat.type !== 'private') return;
  
  const chatId = msg.chat.id;
  
  if (!isAuthorized(msg.from.id)) {
    return bot.sendMessage(chatId, 'Non sei autorizzato ad utilizzare questo bot.');
  }
  
  // Handle text messages
  if (msg.text) {
    const itemText = msg.text.trim();
    try {
      // Add the item to the shopping list
      await axios.post(`${API_URL}/items`, {
        name: itemText,
        source: 'telegram'
      });
      
      bot.sendMessage(chatId, `Aggiunto "${itemText}" alla tua lista della spesa! 🛒`);
    } catch (error) {
      console.error('Error adding item to shopping list:', error);
      bot.sendMessage(chatId, 'Impossibile aggiungere il prodotto alla lista. Riprova più tardi.');
    }
  }
  // Handle voice messages
  else if (msg.voice) {
    try {
      bot.sendMessage(chatId, 'Sto elaborando il tuo messaggio vocale...');
      
      // Get voice file from Telegram
      const fileId = msg.voice.file_id;
      const file = await bot.getFile(fileId);
      const fileUrl = `https://api.telegram.org/file/bot${token}/${file.file_path}`;
      
      // Create temp directory if it doesn't exist
      const tempDir = path.join(__dirname, 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }
      
      // Download the voice file
      const voiceFilePath = path.join(tempDir, `${fileId}.oga`);
      await downloadFile(fileUrl, voiceFilePath);
      
      // Convert voice to text using Google Cloud Speech-to-Text
      const transcribedText = await convertSpeechToText(voiceFilePath);
      
      // Add the transcribed text to the shopping list
      await axios.post(`${API_URL}/items`, {
        name: transcribedText,
        source: 'telegram-voice'
      });
      
      // Clean up the temporary file
      fs.unlinkSync(voiceFilePath);
      
      bot.sendMessage(chatId, `Aggiunto "${transcribedText}" alla tua lista della spesa! 🛒`);
    } catch (error) {
      console.error('Error processing voice message:', error);
      bot.sendMessage(chatId, 'Impossibile elaborare il tuo messaggio vocale. Riprova più tardi.');
    }
  }
});

// Helper function to download a file
function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {}); // Delete the file if there's an error
      reject(err);
    });
  });
}

// Function to convert speech to text using Google Cloud Speech-to-Text
async function convertSpeechToText(filePath) {
  try {
    // Convert OGA to WAV (Google Speech API works better with WAV)
    const wavFile = filePath.replace('.oga', '.wav');
    
    // Use ffmpeg to convert the file
    await new Promise((resolve, reject) => {
      ffmpeg(filePath)
        .outputFormat('wav')
        .audioFrequency(16000)
        .audioChannels(1)
        .on('error', (err) => {
          console.error('Error converting audio:', err);
          reject(err);
        })
        .on('end', () => {
          resolve();
        })
        .save(wavFile);
    });
    
    // Read the audio file
    const audioBytes = fs.readFileSync(wavFile).toString('base64');
    
    // Configure the request to the Google Cloud Speech-to-Text API
    const client = new speech.SpeechClient();
    const audio = {
      content: audioBytes
    };
    const config = {
      languageCode: 'it-IT', // Italian language
      encoding: 'LINEAR16',
      sampleRateHertz: 16000,
      audioChannelCount: 1
    };
    
    const request = {
      audio: audio,
      config: config
    };
    
    // Perform the speech recognition
    const [response] = await client.recognize(request);
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');
    
    // Clean up the temporary WAV file
    fs.unlinkSync(wavFile);
    
    return transcription || "Nota vocale";
  } catch (error) {
    console.error('Speech-to-text error:', error);
    return "Nota vocale"; // Fallback in case of error
  }
}

// Function to convert speech to text using Google Cloud Speech-to-Text
async function convertSpeechToText(filePath) {
  try {
    // Convert OGA to WAV (Google Speech API works better with WAV)
    const wavFile = filePath.replace('.oga', '.wav');
    
    // Use ffmpeg to convert the file
    await new Promise((resolve, reject) => {
      ffmpeg(filePath)
        .outputFormat('wav')
        .audioFrequency(16000)
        .audioChannels(1)
        .on('error', (err) => {
          console.error('Error converting audio:', err);
          reject(err);
        })
        .on('end', () => {
          resolve();
        })
        .save(wavFile);
    });
    
    // Read the audio file
    const audioBytes = fs.readFileSync(wavFile).toString('base64');
    
    // Configure the request to the Google Cloud Speech-to-Text API
    const client = new speech.SpeechClient();
    const audio = {
      content: audioBytes
    };
    const config = {
      languageCode: 'it-IT', // Italian language
      encoding: 'LINEAR16',
      sampleRateHertz: 16000,
      audioChannelCount: 1
    };
    
    const request = {
      audio: audio,
      config: config
    };
    
    // Perform the speech recognition
    const [response] = await client.recognize(request);
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');
    
    // Clean up the temporary WAV file
    fs.unlinkSync(wavFile);
    
    return transcription || "Nota vocale";
  } catch (error) {
    console.error('Speech-to-text error:', error);
    return "Nota vocale"; // Fallback in case of error
  }
}

console.log('Telegram bot is running...');
