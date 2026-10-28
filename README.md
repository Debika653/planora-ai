# Planora AI — Smart Celebration & Event Planner

> **Tagline:** Your celebration, perfectly planned.  
> **Challenge:** PromptWars Challenge 5: Celebration & Event Planner.

---

## 1. Problem Statement
People planning weddings, milestone birthdays, anniversaries, college festivals, and community celebrations struggle with:
- Preparing and maintaining realistic budgets without arithmetic errors or forgotten expenses.
- Creating chronologically sequenced milestone preparation timelines.
- Formulating actionable vendor requirement briefs and interview questions.
- Managing and filtering tasks across disparate channels.
- Formulating personalized themes, menus, and contingency arrangements for adverse weather or unexpected surges.

**Planora AI** resolves these challenges by coupling generative intelligence with deterministic financial calculation engines and an interactive workspace.

---

## 2. Solution Overview
Planora AI collects structured event parameters (budget, attendee headcount, date, style, venue criteria, dietary and accessibility requirements) through a 5-step validated wizard.

The system routes requests through a secure server-side Node.js/Express proxy that interfaces with Google's **Gemini 3.8 Flash** model (`@google/genai`). Output is validated and passed through a deterministic arithmetic engine that verifies budget sums, calculates remaining reserves, and eliminates language model calculation hallucinations.

Users then manage their celebration through a 7-tab workspace featuring interactive checklists, vendor briefs, timeline milestones, contingency plans, and an event-aware AI assistant.

---

## 3. Key Features

1. **Deterministic Budget Breakdown Engine**
   - Eliminates AI math hallucinations.
   - Mathematically enforces: `Estimated Total == Sum(Categories)`.
   - Derives accurate remaining budget and percentage allocations.
   - Flags overspending and alerts if costs exceed limits.
   - Supports USD, INR, EUR, GBP, CAD, AUD with localization.

2. **Dynamic Chronological Milestone Timeline**
   - Automatically computes milestones spaced before the celebration date.
   - Tracks action-due deadlines and milestone completion states.

3. **Multi-Category Celebration Support**
   - Weddings & Receptions
   - Milestone Birthdays
   - Anniversaries
   - College & Corporate Fests
   - Community Gatherings
   - Bespoke Custom Celebrations

4. **Interactive Task & Vendor Management**
   - Full CRUD operations: create, edit, delete, toggle completion.
   - Filter by category, priority, and text search.
   - Track vendor selection workflows (Uncontacted → Shortlisted → Contacted → Booked) and log quotes.

5. **Context-Aware AI Celebration Assistant**
   - Assistant has full context on the active celebration (guests, venue, budget, style).
   - Instant quick prompts (budget cuts, weather backups, vegetarian menu creation).
   - "Apply to Plan" triggers to directly inject recommended tasks into the active event workspace.

6. **Executive Export & Printing**
   - Clean `@media print` print stylesheet for day-of runs-of-show.
   - One-click export to Markdown (`.md`) and raw JSON backup.
   - Clipboard summary formatting.

7. **Security & Privacy by Design**
   - Zero private API keys exposed to frontend code or client bundles.
   - In-memory rate limiting and request payload validation/sanitization.
   - Synchronized workspace storage with transparent zero-cloud leakage.

---

## 4. Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React.
- **Backend:** Node.js, Express.js (`server.ts` with Vite middlewares in dev).
- **AI Engine:** Google Gemini API (`@google/genai` with model `gemini-3.8-flash`).
- **Testing:** Vitest for deterministic unit and validation test suites.
- **Storage:** Synchronized Local & Server In-Memory Repository with immediate starter templates.

---

## 5. Folder Structure

```
├── .env.example                     # Environment variables template
├── metadata.json                    # AI Studio metadata configuration
├── index.html                       # Application HTML entry point
├── package.json                     # Dependencies, scripts, and engine configs
├── tsconfig.json                    # TypeScript compiler options
├── vite.config.ts                   # Vite build and plugin setup
├── server.ts                        # Full-stack Express server with Vite middleware
├── server/
│   ├── middleware/
│   │   └── rateLimiter.ts           # Sliding-window IP rate limiting
│   ├── repositories/
│   │   └── eventRepository.ts       # Backend data persistence store
│   ├── routes/
│   │   └── eventRoutes.ts           # /api/events and /api/health endpoints
│   ├── services/
│   │   └── geminiService.ts         # Gemini 3.8 Flash SDK integration + fallback
│   └── validators/
│       └── eventValidator.ts        # Server request validation & sanitization
├── src/
│   ├── components/
│   │   ├── AiAssistantDrawer.tsx    # Context-aware chat assistant drawer
│   │   ├── DashboardView.tsx        # Metrics, saved events, and empty state
│   │   ├── EventWizard.tsx          # 5-step event creation wizard
│   │   ├── EventWorkspace.tsx       # 7-tab event management workspace
│   │   ├── ExportModal.tsx          # Print, Markdown, and JSON export dialog
│   │   ├── Footer.tsx               # Application footer
│   │   ├── Header.tsx               # Navigation and brand header
│   │   ├── LandingPage.tsx          # Landing hero, categories, and preview
│   │   └── SettingsModal.tsx        # Storage and data reset controls
│   ├── data/
│   │   └── sampleEvents.ts          # Starter wedding & birthday plans
│   ├── services/
│   │   └── storageService.ts        # Client-side cache, sync, and CRUD ops
│   ├── types/
│   │   └── index.ts                 # TypeScript types and interfaces
│   ├── utils/
│   │   ├── budgetCalculations.ts    # Deterministic budget arithmetic engine
│   │   └── validation.ts            # Form and date validation utilities
│   ├── App.tsx                      # Root application component
│   ├── index.css                    # Tailwind CSS v4 imports, fonts, & print styles
│   └── main.tsx                     # React DOM entry point
└── tests/
    ├── budgetCalculations.test.ts   # Unit tests for financial math & overspend
    ├── validation.test.ts           # Unit tests for date and form validations
    └── deterministicPlanner.test.ts # Unit tests for event planning logic
```

---

## 6. Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

---

## 7. Installation & Setup

1. **Clone or navigate to the directory**:
   ```bash
   cd planora-ai
   ```

2. **Install all dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your Google Gemini API key:
   ```env
   GEMINI_API_KEY="your_actual_gemini_api_key_here"
   PORT=3000
   ```
   *(Note: Planora includes a domain-specific deterministic planning engine, ensuring full functionality for demonstration and evaluation even if an API key is not immediately configured).*

---

## 8. Available Commands

- **Start Development Server** (Full-stack Express + Vite on port 3000):
  ```bash
  npm run dev
  ```

- **Run Automated Tests** (Vitest):
  ```bash
  npm test
  ```

- **Compile and Type-Check**:
  ```bash
  npm run lint
  ```

- **Build Production Bundle**:
  ```bash
  npm run build
  ```

- **Start Production Server**:
  ```bash
  npm start
  ```

---

## 9. Security Considerations

- **Server-Side API Key Boundary**: Gemini API keys are only accessed server-side via `process.env.GEMINI_API_KEY`. No secrets are packaged into client bundles.
- **Rate Limiting**: AI endpoints are rate-limited per client IP to safeguard against abuse.
- **Request Sanitization**: All incoming form strings are stripped of HTML tags and bounded to safe character limits.
- **Deterministic Math**: Calculations are never evaluated dynamically using `eval()` or unvalidated AI strings.

---

## 10. Accessibility (WCAG 2.2 AA)

- Semantic HTML (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`, `<dialog>`, `<table>`).
- Visible focus rings (`focus:ring-2 focus:ring-[#E06D53]`) on all interactive controls.
- Keyboard navigation reachable via Tab and Shift+Tab with Escape key support on modals.
- Screen-reader accessible names, status announcements (`aria-live="polite"`), and color-independent badges.
