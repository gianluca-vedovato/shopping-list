# Shopping List Application

A complete shopping list application with Telegram bot integration and Google Home support. This project allows you to manage your shopping list from multiple interfaces:

- Web app (Vue.js)
- Telegram bot
- Google Home/Assistant

## Project Structure

The project is organized into three main components:

```
shopping-list/
├── backend/          # Express.js API server
├── frontend/         # Vue.js web application
└── telegram-bot/     # Telegram bot integration
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Telegram Bot Token (from BotFather)
- Google Home/Assistant setup (optional)

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure environment variables by editing the `.env` file:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/shopping-list
   ```

4. Start the server:
   ```
   npm run dev
   ```

The backend server will run on http://localhost:3000

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure environment variables by editing the `.env` file:
   ```
   VITE_API_URL=http://localhost:3000/api
   ```

4. Start the development server:
   ```
   npm run dev
   ```

The frontend will be available at http://localhost:5173

### Telegram Bot Setup

1. Create a new Telegram bot using BotFather (https://t.me/botfather)
2. Note down the bot token

3. Navigate to the telegram-bot directory:
   ```
   cd telegram-bot
   ```

4. Install dependencies:
   ```
   npm install
   ```

5. Configure environment variables by editing the `.env` file:
   ```
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
   API_URL=http://localhost:3000/api
   AUTHORIZED_USERS=your_telegram_user_id
   ```

6. Start the bot:
   ```
   npm run dev
   ```

## Google Home Integration

The application includes a webhook endpoint for Google Home/Assistant integration. You can connect it using:

1. Dialogflow: Create an agent and configure a webhook to point to:
   ```
   http://your-server-address/api/google-home/webhook
   ```

2. IFTTT: Create an applet with Google Assistant as the trigger and a webhook as the action.

## Mobile App Installation

The web application is designed as a Progressive Web App (PWA) which can be installed on mobile devices:

1. Open the web app in your mobile browser
2. Add to Home Screen / Install App (depends on your browser)
3. The app will be available as a standalone application with an icon

## Features

- Add, update, and delete shopping list items
- Mark items as completed
- Clear completed items
- Add items via Telegram bot
- Add items via Google Home/Assistant
- Mobile-friendly interface
- Installable as a PWA on mobile devices

## Development

### Building for Production

#### Frontend
```
cd frontend
npm run build
```

#### Backend
```
cd backend
npm start
```

#### Telegram Bot
```
cd telegram-bot
npm start
```

## License

MIT
