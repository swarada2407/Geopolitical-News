# GeoIntelX - Geopolitical Intelligence Hub

Your source for the latest world news, military insights, and strategic analysis.

## Features
- **Real-time News**: Fetches top stories from global sources.
- **AI Summarization**: Get quick insights from long articles using Google Gemini AI.
- **Military Map**: Interactive map with strategic military data.
- **Secure Auth**: Login, Register, and Google OAuth integration.
- **Admin Dashboard**: Manage users and military data.

## Tech Stack
- **Frontend**: React, Vite, Axios, React Icons, Leaflet.
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT.
- **Deployment**: Prepared for Vercel.

## Setup Instructions

### Backend
1. Navigate to `server` directory.
2. Install dependencies: `npm install`
3. Create a `.env` file based on `env_sample.env`.
4. Start the server: `npm run dev`

### Frontend
1. Navigate to `client` directory.
2. Install dependencies: `npm install`
3. Create a `.env` file and set `VITE_API_URL`.
4. Start the development server: `npm run dev`

## Environment Variables

### Backend (`server/.env`)
- `PORT`: Server port (default 5000)
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for token signing
- `NEWS_API_KEY`: API key from newsapi.org
- `GEMINI_API_KEY`: API key for AI summaries
- `GOOGLE_CLIENT_ID`: Google OAuth client ID

### Frontend (`client/.env`)
- `VITE_API_URL`: Backend API URL
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth client ID

## Vercel Deployment
The project is configured with a `vercel.json` file in the root for full-stack deployment. Ensure all environment variables are set in the Vercel dashboard.
