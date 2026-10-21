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
- Groq SDK and Tavily search for the optional chatbot

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

## Optional chatbot setup

Provider keys stay on the server. The browser sends conversation text to `/api/chat`; the server calls Groq and optionally Tavily. Rendered Markdown is sanitized with DOMPurify.

Copy `.env.example` to `.env.local` and configure these **server-only** variables:

```env
CHAT_ENABLED=true
CHAT_ALLOWED_ORIGIN=http://localhost:3000
GROQ_API_KEY=your_server_key
GROQ_MODEL=llama-3.3-70b-versatile
TAVILY_API_KEY=your_optional_search_key
```

Use [Vercel CLI local development](https://vercel.com/docs/cli/dev) with `npx vercel dev --listen 3000` to run both Vite and the Node function. `npm run dev` and `npm run preview` serve only the dashboard; they do not run `/api/chat`.

For deployment, import this repository into Vercel as a Vite project. Set the same variables in the project's environment settings, set `CHAT_ALLOWED_ORIGIN` to the exact deployed origin (scheme and hostname, no trailing slash), then redeploy. Preview deployments need their own origin value. Other hosts must provide a compatible Node endpoint; static hosting alone cannot run the chatbot.

Delete the old `VITE_GROQ_API_KEY` and `VITE_TAVILY_API_KEY` variables from hosting settings. If either held a real key in a previous deployment, revoke it with the provider and replace it using the server-only names above. Vite public variables are embedded in the downloaded JavaScript. Do not commit `.env.local`.

Chat is disabled unless `CHAT_ENABLED=true`, a Groq key, and the allowed origin are configured. Requests are limited to 12 messages, 2000 characters per message and 12000 characters total. There are per-instance limits of 10 requests per client and 100 overall per minute, plus provider timeouts and bounded output. Origin checks and in-memory limits are not authentication or deployment-wide abuse protection. Add shared rate limiting or access control and provider spending limits before enabling an unrestricted public service.

Conversation text is sent to Groq. Questions containing current-events keywords also go to Tavily when its optional key is configured. Without search results the assistant is told that no live evidence is available.

Run handler tests (they use stubs, without provider calls):

```sh
node --test tests/*.test.js
```

## Project Structure

```text
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
