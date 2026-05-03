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

## Optional Chatbot Setup

The dashboard works without chatbot credentials. To enable Hey FIFA locally, create a `.env` file from `.env.example` and add your own local values:

```bash
cp .env.example .env
```

Add API keys from the provider websites:

- Create a Groq API key at `https://console.groq.com/keys`
- Create a Tavily API key at `https://tavily.com/`

Your `.env` file should use Vite environment variable names:

```env
VITE_GROQ_API_KEY=your_groq_api_key
VITE_TAVILY_API_KEY=your_tavily_api_key
```

Restart the dev server after editing `.env` so Vite can load the new values.

No credentials are committed to this repository.

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
