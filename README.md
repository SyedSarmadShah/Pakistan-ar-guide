# Pakistan Explorer

An integrated tourism platform combining AR monument recognition, smart recommendations, and AI chatbot assistance for exploring Pakistan's heritage sites.

## Features

🎯 **AR Monument Guide** - Point your camera at historical monuments and get AI-powered recognition with audio narration  
🗺️ **Smart Recommendations** - Browse 100+ destinations with real-time weather and personalized filters  
💬 **AI Travel Companion** - Chat with an AI assistant powered by Groq for instant travel advice

## Quick Start

### Option 1: One Command (Recommended)

```bash
npm install
cd "recommendation and chatbot" && npm install && cd ..
./start.sh
```

Then open `http://localhost:5173`

### Option 2: Manual Setup

1. **Install Dependencies**
   ```bash
   npm install
   cd "recommendation and chatbot"
   npm install
   cd ..
   ```

2. **Start Backend (Terminal 1)**
   ```bash
   cd "recommendation and chatbot"
   npm start
   ```

3. **Start Frontend (Terminal 2)**
   ```bash
   npm run dev
   ```

4. **Open** `http://localhost:5173`

## Project Structure

```
pakistan-ar-guide/
├── src/
│   ├── components/
│   │   ├── HomePage.jsx       # Landing page with navigation
│   │   ├── ARGuide.jsx        # Camera-based monument recognition
│   │   ├── Recommendations.jsx # Tourism database with filters
│   │   └── Chatbot.jsx        # AI chat interface
│   ├── App.jsx                # Router setup
│   └── index.jsx              # React entry
├── recommendation and chatbot/
│   ├── server.js              # Express backend for chatbot
│   ├── api/chat.js            # Groq AI integration
│   └── places_dataset.csv     # Tourism data
├── .env                       # API keys (auto-created)
└── start.sh                   # Startup script

```

## Technologies

- **Frontend**: React, Vite, React Router, Tailwind CSS
- **AR/CV**: Teachable Machine, TensorFlow.js
- **AI**: Groq API (llama-3.3-70b)
- **APIs**: OpenWeather, Web Speech API
- **Backend**: Express, Node.js

## Usage

1. **Home Page**: Choose from AR Guide, Recommendations, or Chatbot
2. **AR Guide**: Click "Start Camera" and point at monuments (Taxila, Badshahi Mosque, Mohenjo-daro)
3. **Recommendations**: Filter by province, season, search places, view weather
4. **Chatbot**: Ask questions about Pakistan tourism

## Configuration

API keys are in `.env`:
```env
VITE_GROQ_API_KEY=your_groq_key
VITE_WEATHER_API_KEY=your_weather_key
```

## Troubleshooting

- **Camera not working?** Use HTTPS or localhost. Check permissions.
- **Chatbot not responding?** Ensure backend is running on port 3000.
- **Build errors?** Run `npm install` in both root and `recommendation and chatbot/` folders.

## Development

```bash
npm run dev      # Frontend dev server (port 5173)
npm run build    # Production build
npm run preview  # Preview production build
```

## Team Project

Final Year Project combining:
- Computer Vision (AR Monument Recognition)
- Data Visualization (Recommendations System)
- Natural Language Processing (AI Chatbot)
