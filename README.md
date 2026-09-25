# RepoPilot

**AI Developer Onboarding & Debugging Agent**

> Turn an unfamiliar codebase into an actionable developer workspace.

---

## What is RepoPilot?

RepoPilot analyzes software repositories and creates an intelligent developer workspace. When you join an unfamiliar codebase, RepoPilot eliminates the hours spent manually understanding architecture, environment setup, and contribution paths.

### Core Workflow

```
Unknown Codebase → Understand → Set Up → Debug → Explore → Start Contributing
```

### Features

| Feature | Description |
|---|---|
| Repository Dashboard | File metrics, modules, routes — all at a glance |
| Architecture View | Interactive component relationship map |
| Setup Assistant | Prerequisites validation, env vars, quick-start commands |
| Dependency Audit | Outdated, vulnerable, and unused package detection |
| Debug Agent | AI-powered error analysis with file-level context |
| Codebase Q&A | Ask natural language questions, get file-aware answers |
| Starter Tasks | AI-generated contribution tasks ranked by difficulty |

---

## Technology Stack

### Frontend

- **React 18** + **TypeScript** — UI components
- **Vite** — Build tooling
- **Tailwind CSS 3** — Utility-first styling
- **Framer Motion** — Animation system
- **Lucide React** — Icon system
- **React Router DOM** — Client-side routing

### Backend

- **Node.js** + **Express** — API server
- **TypeScript** — Type-safe server code
- **IBM watsonx.ai** — AI inference (Llama 3 70B)

### Development

- **IBM Bob** — Primary development agent (see `bob_sessions/`)

---

## Getting Started

### Prerequisites

- Node.js ≥ 18.17
- npm or pnpm

### Frontend

```bash
cd frontend
npm install
npm run dev
# App runs at http://localhost:5173
```

### Backend

```bash
cd backend
npm install
# Copy and configure environment
cp .env.example .env
npm run dev
# API runs at http://localhost:3001
```

### Environment Variables (Backend)

```env
PORT=3001
FRONTEND_URL=http://localhost:5173

# IBM watsonx.ai (optional — app runs in demo mode without these)
WATSONX_API_KEY=your_api_key
WATSONX_PROJECT_ID=your_project_id
WATSONX_API_URL=https://us-south.ml.cloud.ibm.com
WATSONX_MODEL=meta-llama/llama-3-70b-instruct
```

Without watsonx credentials, the app runs in demo mode with pre-built representative responses.

---

## Project Structure

```
RepoPilot/
├── frontend/
│   └── src/
│       ├── components/       # Reusable UI components
│       │   └── ui/           # Base components (CodeBlock, CopyButton, StatusBadge)
│       ├── pages/            # Route-level page components
│       ├── layouts/          # Layout wrappers (AppLayout)
│       ├── lib/              # Demo data and utilities
│       └── types/            # TypeScript interfaces
├── backend/
│   └── src/
│       ├── controllers/      # Request handlers
│       ├── routes/           # Express route definitions
│       ├── services/         # IBM watsonx.ai service layer
│       └── types/            # Backend TypeScript types
├── bob_sessions/             # IBM Bob development session summaries
├── data/
│   └── SOURCES.md            # Demo data sources and licensing
└── docs/                     # Additional documentation
```

---

## Demo Flow

The app ships with demo data based on the public [vercel/next.js](https://github.com/vercel/next.js) repository (MIT License). This clearly-labeled demo data demonstrates the full product experience:

1. Open RepoPilot at `localhost:5173`
2. See the landing page with animated product preview
3. Click "Open App" or "Analyze Repository"
4. Explore the Dashboard — metrics, architecture, issues
5. Click Architecture — interactive node inspection
6. Click Setup — environment variable validation
7. Click Debug Agent — paste an error for AI analysis
8. Click Ask Codebase — ask natural language questions
9. Click Starter Tasks — explore recommended contributions

---

## IBM Bob Usage

RepoPilot was built using IBM Bob as the primary development tool throughout the entire project. See `bob_sessions/README.md` for the full session log.

IBM Bob was used for:
- Architecture and design planning
- All component development
- TypeScript interface design
- AI service integration
- Debugging and code review
- Documentation

---

## Data Safety

- No personal, confidential, or client data is used
- No actual secrets or credentials are stored or displayed
- All demo data comes from publicly available open-source repositories
- See `data/SOURCES.md` for full provenance

---

## Hackathon Submission

**Event:** IBM Bob 2.0 Hackathon  
**Category:** Developer Infrastructure / AI Tooling  
**AI Engine:** IBM watsonx.ai (Llama 3 70B Instruct)  
**Development Tool:** IBM Bob  

---

*RepoPilot — Built for the IBM Bob 2.0 Hackathon*
