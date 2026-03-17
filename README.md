# 🎬 WhatToWatchNext

A modern movie discovery platform that helps you find your next favorite film. Search for movies, get AI-powered insights, track your watchlist, and discover where to stream — all in one place.

![React](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-blue) ![Vite](https://img.shields.io/badge/Vite-5-purple)

## ✨ Features

- **🔍 Movie Search** — Instantly search any movie by title with real-time results
- **🤖 AI Insights** — Get AI-generated analysis including themes, audience fit, and recommendations
- **📊 Trending Movies** — Browse what's popular right now
- **🎭 Genre Discovery** — Explore movies by genre with curated collections
- **📝 Watchlist** — Save movies to your personal watchlist (requires account)
- **📺 Where to Watch** — See streaming availability across platforms
- **🔗 Similar Movies** — Discover related films based on plot and genre
- **📖 Plot-Based Recommendations** — Find movies with similar storylines using AI
- **🎬 Cast & Crew** — Explore filmographies of actors and directors
- **📈 Analytics Dashboard** — View your search history and activity stats (admin)
- **🌙 Dark/Light Theme** — Toggle between dark and light modes
- **📱 Fully Responsive** — Works beautifully on desktop, tablet, and mobile

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+ (recommended: use [nvm](https://github.com/nvm-sh/nvm))
- npm or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/daksharya1921/whatTowatchnext.git

# Navigate to the project directory
cd whatTowatchnext

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
npm run preview
```

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | React 18 + TypeScript |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS + shadcn/ui |
| Animations | Framer Motion |
| State Management | TanStack React Query |
| Routing | React Router v6 |
| Backend | Lovable Cloud (Supabase) |
| Charts | Recharts |

## 📁 Project Structure

```
src/
├── components/       # Reusable UI components
│   └── ui/           # shadcn/ui primitives
├── contexts/         # React context providers
├── hooks/            # Custom React hooks
├── integrations/     # Backend client & types
├── pages/            # Route-level page components
└── assets/           # Images and static assets
supabase/
└── functions/        # Backend serverless functions
```

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
