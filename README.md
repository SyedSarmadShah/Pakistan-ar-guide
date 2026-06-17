# Pakistan Explorer

A single-page tourism platform for Pakistan with:
- Live AR monument recognition
- Smart destination recommendations
- AI travel chat support

## What this app does

- **AR Guide**: Uses your camera to recognize monuments and speak details using the Web Speech API
- **Recommendations**: Loads tourism data, lets you search and filter by province, season, budget, and weather
- **Chatbot**: Connects to a backend AI assistant for travel questions and suggestions

## Quick Setup

### 1. Install dependencies

From the repo root:
```bash
npm install
```

Then install the chatbot backend dependencies:
```bash
cd "recommendation and chatbot"
npm install
cd ..
```

### 2. Start the backend

In a separate terminal:
```bash
cd "recommendation and chatbot"
npm start
```

This runs the chatbot server on `http://localhost:3000`.

### 3. Start the frontend

From the root project folder:
```bash
npm run dev
```

Open the app at:
```bash
http://localhost:5173
```

## App structure

```
pakistan-ar-guide/
├── src/
│   ├── components/
│   │   ├── ARGuide.jsx        # Camera-based monument recognition
│   │   ├── Chatbot.jsx        # AI travel chat interface
│   │   ├── Recommendations.jsx # Tourism destination browser
│   │   ├── HomePage.jsx       # Landing dashboard
│   │   └── ...                # Planner, favorites, checkout, auth UI
│   ├── context/               # Dark mode and auth providers
│   ├── utils/                 # Recommendation, tracking, data helpers
│   ├── App.jsx               # App routes and protected pages
│   └── index.jsx             # React entry point
├── public/
│   ├── test.html              # Camera test page
│   └── images/                # Static asset folder
├── recommendation and chatbot/
│   ├── api/chat.js            # Chat API integration
│   ├── server.js              # Express server for AI chat
│   ├── places_dataset.csv     # Tourism dataset consumed by recommendations
│   ├── .env.example           # Backend env example
│   └── package.json
├── .env.example               # Frontend env example
├── package.json
└── vite.config.js
```

## Main pages

- `/` — Home dashboard with navigation and featured highlights
- `/ar` — AR monument scanner and narration experience
- `/recommendations` — Destination browser with filters and weather-aware ranking
- `/chat` — AI travel assistant chat interface

> Note: The app uses authentication and protected routes for the main pages.

## Required environment variables

Create a root `.env` file from `.env.example` and add:

```env
VITE_WEATHER_API_KEY=your_openweather_api_key
VITE_CHAT_API_URL=http://localhost:3000/api/chat
```

Create `recommendation and chatbot/.env` from `.env.example` and add:

```env
GROQ_API_KEY=your_groq_api_key
PORT=3000
FRONTEND_ORIGIN=http://localhost:5173
```

## Important notes

- The frontend runs on **port 5173** and proxies `/api` calls to the backend.
- The backend serves `/api/chat` and must be started before using the chatbot.
- The AR feature requires camera access and works best over **localhost** or **HTTPS**.

## Troubleshooting

- If the camera fails, confirm browser permission and that you opened the app at `http://localhost:5173`.
- If the chatbot fails, verify `recommendation and chatbot` backend is running and `GROQ_API_KEY` is set.
- If the recommendation page cannot load data, confirm `places_dataset.csv` is accessible.

## Development commands

From the root folder:
```bash
npm run dev
npm run build
npm run preview
```

From `recommendation and chatbot`:
```bash
npm start
```

## Technologies used

- React + Vite
- React Router
- Teachable Machine (`@teachablemachine/image`)
- TensorFlow.js
- Express backend for AI chat
- Groq API
- OpenWeather API
- Web Speech API
- Tailwind-style UI via utility classes
