const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create a router for Google Home integration
const router = express.Router();

// Get the Item model
const Item = mongoose.model('Item');

// Middleware for parsing JSON
router.use(bodyParser.json());

/**
 * Webhook endpoint for Google Assistant
 * This can be integrated with Google Assistant via Dialogflow or IFTTT
 */
router.post('/webhook', async (req, res) => {
  try {
    // Extract the item name from the request
    // The exact structure will depend on your Dialogflow/IFTTT setup
    const itemName = req.body.queryResult?.parameters?.item || 
                    req.body.item || 
                    req.body.queryText;
    
    if (!itemName) {
      return res.status(400).json({
        success: false,
        message: 'No item name provided'
      });
    }
    
    // Create a new item
    const item = new Item({
      name: itemName,
      source: 'google-home'
    });
    
    // Save the item to the database
    await item.save();
    
    // Respond with a success message
    res.json({
      success: true,
      message: `Added "${itemName}" to your shopping list`,
      fulfillmentText: `I've added ${itemName} to your shopping list`
    });
  } catch (error) {
    console.error('Error processing Google Home request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to shopping list',
      error: error.message
    });
  }
});

// Get all items (for testing)
router.get('/items', async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
