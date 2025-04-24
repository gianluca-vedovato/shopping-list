const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// Configure CORS to allow requests from your Netlify domain
app.use(cors({
  origin: ['https://alioncingianni-shoppinglist.netlify.app', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  optionsSuccessStatus: 204
}));

// Add pre-flight OPTIONS handling
app.options('*', cors());

app.use(bodyParser.json());

// Connect to MongoDB with improved options
const connectWithRetry = () => {
  console.log('Attempting to connect to MongoDB...');
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping-list', {
    serverSelectionTimeoutMS: 15000, // Timeout after 15 seconds instead of 30
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    connectTimeoutMS: 15000, // Give up initial connection after 15 seconds
    maxPoolSize: 10, // Maintain up to 10 socket connections
  })
  .then(() => {
    console.log('Successfully connected to MongoDB');
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB...', err);
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectWithRetry, 5000); // Retry after 5 seconds
  });
};

// Initial connection with retry
connectWithRetry();

// Define shopping item schema
const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  source: {
    type: String,
    enum: ['telegram', 'telegram-voice', 'web', 'google-home'],
    default: 'web'
  }
});

const Item = mongoose.model('Item', itemSchema);

// API Routes
app.get('/api/items', async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/items', async (req, res) => {
  try {
    const item = new Item({
      name: req.body.name,
      source: req.body.source || 'web'
    });
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/items/:id', async (req, res) => {
  try {
    // Prepare update object
    const updateData = { 
      completed: req.body.completed,
      name: req.body.name
    };
    
    // Set completedAt timestamp when marking as completed
    if (req.body.completed === true) {
      updateData.completedAt = new Date();
    } else {
      updateData.completedAt = null; // Reset if unmarked
    }
    
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/items/:id', async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Import Google Home integration routes
const googleHomeRoutes = require('./google-home');

// Use Google Home routes
app.use('/api/google-home', googleHomeRoutes);

// Function to clean up completed items older than 1 day
async function cleanupCompletedItems() {
  try {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const result = await Item.deleteMany({
      completed: true,
      completedAt: { $lt: oneDayAgo }
    });
    
    if (result.deletedCount > 0) {
      console.log(`Cleaned up ${result.deletedCount} completed items older than 1 day`);
    }
  } catch (err) {
    console.error('Error cleaning up completed items:', err);
  }
}

// Run cleanup on server start and then every hour
cleanupCompletedItems();
setInterval(cleanupCompletedItems, 60 * 60 * 1000); // Every hour

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Google Home webhook available at: http://localhost:${PORT}/api/google-home/webhook`);
});
