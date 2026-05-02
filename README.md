# FIFA World Cup Analytics

An interactive React dashboard for exploring FIFA Men's World Cup history from 1930 to 2022. The app turns tournament data into focused visual stories about goals, clubs, squads, referees, penalty shootouts, head-to-head records, difficult groups, and Lionel Messi's international arc.

## Features

- Tournament overview with all-time records and title leaders
- Minute-by-minute goal heatmap
- Club dominance analysis across World Cup squads
- Penalty shootout history and conversion trends
- Head-to-head comparison between national teams
- Squad age and performance exploration
- Referee and card distribution audit
- Group of Death ranker where higher scores mean harder groups
- Wonder Wall story page with a light Argentina inspired championship theme
- Optional Hey FIFA chatbot for World Cup questions

## Tech Stack

- React 19
- Vite
- Tailwind CSS
- Recharts
- Papa Parse
- Vercel Functions for the optional chatbot proxy
- Groq and Tavily for chatbot responses and search

## Data

World Cup CSV data is loaded from the open `jfjelstul/worldcup` dataset on GitHub. The frontend fetches and parses the data in the browser.

## Getting Started

Install dependencies:

```bash
npm install
```

Run the app locally:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Optional Chatbot Setup

The dashboard works without chatbot credentials. To enable Hey FIFA locally, create a `.env` file from `.env.example` and add your own server-only values:

```bash
cp .env.example .env
```

Available variables:

```text
GROQ_API_KEY=
TAVILY_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile
CHAT_DAILY_LIMIT=25
CHAT_WINDOW_LIMIT=6
CHAT_WINDOW_MS=600000
```

No credentials are committed to this repository.

## Vercel Deployment

This project can be deployed on Vercel as a Vite app with a serverless chatbot endpoint at `/api/chat`.

Recommended Vercel settings:

- Add `GROQ_API_KEY` and `TAVILY_API_KEY` as encrypted project environment variables.
- Keep chatbot keys server-only. Do not use `VITE_` prefixes for API credentials.
- Set `CHAT_DAILY_LIMIT`, `CHAT_WINDOW_LIMIT`, and `CHAT_WINDOW_MS` to control app-side chatbot usage.
- Add a Vercel WAF rate limit rule for `/api/chat`, such as 6 requests per 10 minutes per IP.
- On a Pro team, enable Spend Management and turn on production pausing at the budget threshold.
- Also set usage or spend limits in Groq and Tavily where your account plan supports them.

The built-in app limit is a lightweight per-instance guard. For a strict global quota across all Vercel regions and function instances, use Vercel WAF, provider-side quotas, or a persistent store such as Redis.

## Project Structure

```text
api/
src/
  components/
    Chatbot/
    Layout/
    PixelArt/
    UI/
  contexts/
  pages/
  assets/
public/
```

## Notes

- The current app is a Vite frontend.
- Generated files, local credentials, Python caches, virtual environments, and archived local experiments are ignored.
