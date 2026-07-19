# 🍳 Recipe Hut

**Recipe Hut** is a full-stack, AI-powered recipe discovery and cooking platform built as a complete Agentic AI application. Beyond standard CRUD and content browsing, it integrates **two distinct agentic AI systems** — a context-aware conversational assistant and a reasoning-driven pantry agent — that go beyond simple text generation to demonstrate memory, tool use, and decision-making.

> Discover recipes, track nutrition, upload your own creations, and let AI help you decide what's for dinner — from a chat conversation or straight from what's in your fridge.

---

## 🔗 Live Demo

- **Live URL:** _[paste your deployment link here]_
- **Demo credentials:** Available via the "Try Demo Account" button on the login page (auto-fills credentials)

---

## 📸 Preview

_[Add screenshots or a short GIF/demo video here]_

---

## ✨ Key Features

### Core Platform
- 🔍 **Explore Page** — full-text search, multi-field filtering (category + cuisine), sorting (newest, rating, calories), and pagination
- 📖 **Recipe Details** — overview, ingredients, step-by-step instructions, nutrition breakdown, related recipes
- 📊 **Nutrition Visualization** — interactive Recharts donut chart showing calorie/macro breakdown per recipe
- 🔐 **Authentication** — email/password + Google OAuth via Better Auth, with a one-click demo login
- 📝 **Full CRUD for Recipes** — logged-in users can create, edit, and delete their own recipes (`/items/add`, `/items/manage`, `/items/edit/[id]`)
- 👤 **Profile Management** — update name and avatar
- 🎨 **Consistent Design System** — single warm, professional color palette (terracotta / olive / mustard + warm neutrals), no theme-flash, fully responsive across mobile/tablet/desktop
- 🎬 **GSAP Animations** — scroll-triggered reveals, staggered card entrances, animated counters, page transitions

### 🤖 Agentic AI Features (2 distinct systems)

This project implements **two separate agentic AI features**, each powered by a different LLM provider, chosen deliberately to demonstrate multi-provider integration and to isolate rate limits between features.

---

#### 1. AI Chat Assistant (Groq — Llama 3.3 70B)

A persistent, context-aware conversational assistant available site-wide via a floating chat button (bottom-right), opening into a large modal-style panel with a blurred backdrop.

**What it does:**
- Answers cooking, ingredient, and nutrition-related questions
- Performs a live keyword search against the recipe database mid-conversation and surfaces relevant recipes as clickable cards — directly inside the chat
- Understands full conversation history and reasons over follow-up questions (e.g. "what about a vegan version of that?")
- Suggests 2–3 contextual follow-up prompts after every response, generated dynamically based on what was just discussed
- Streams responses token-by-token with a typing indicator while "thinking"

**Memory & persistence:**
- Conversation history is stored in the browser's `localStorage`, so refreshing the page restores the full conversation (marked with a "Previous messages" divider) instead of resetting

**How to use it:** Click the chat icon in the bottom-right corner of any page. Available to all users, logged in or not.

---

#### 2. AI Chef — Pantry Agent (Google Gemini 1.5 Flash)

A reasoning agent at `/ai-chef` that decides what you can cook based on ingredients you already have — not a simple filter, but a multi-step pipeline combining deterministic ranking with LLM-driven reasoning.

**How it works (agent pipeline):**
1. **Tool use:** Queries the full recipes database and normalizes ingredient lists
2. **Decision-making:** Calculates a match percentage for every recipe based on ingredient overlap, ranks all candidates, and filters to the top matches
3. **LLM reasoning (single Gemini call):** For the top 3 ranked recipes, Gemini generates:
   - A per-recipe explanation of *why* it's a strong match given the user's exact ingredients
   - Realistic ingredient substitution suggestions for anything missing
   - A "Best Pick" designation on the single strongest overall choice (factoring in more than just match %, e.g. prep time)
   - A combined comparison summary discussing all three finalists together

**Experience:** Designed to feel conversational rather than transactional — the user's ingredient list appears as a sent chat message, a typing indicator plays while the agent "thinks," and the AI's guidance types out word-by-word before the ranked recipe cards reveal in sequence.

**Access:** Publicly viewable, but **requires login to run a query** — logged-out users see the interface and are prompted to log in when they try to submit.

**How to use it:** Navigate to **AI Chef** in the navbar, add the ingredients you have on hand (type + Enter, or use quick-add chips), and submit.

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose |
|---|---|
| Next.js (App Router) | Framework, routing, SSR/API routes |
| TypeScript | Type safety across the entire codebase |
| Tailwind CSS | Styling via a centralized design-token system |
| GSAP + `@gsap/react` | Scroll-triggered and entrance animations |
| Recharts | Nutrition data visualization |

### Backend
| Technology | Purpose |
|---|---|
| Next.js API Routes | Backend logic (serverless functions) |
| MongoDB Atlas | Primary database |
| Better Auth | Authentication (email/password + Google OAuth, session management) |
| Zod | Request/schema validation |

> **Architecture note:** The backend is implemented using Next.js API routes rather than a standalone Express server. Routing, middleware, and request handling are fully implemented within this layer, fulfilling the same responsibilities an Express backend would.

### AI Integration
| Provider | Model | Used For |
|---|---|---|
| Groq | Llama 3.3 70B Versatile | AI Chat Assistant (streaming conversational agent) |
| Google Gemini | Gemini 1.5 Flash | AI Chef (pantry reasoning agent) |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── about/
│   ├── ai-chef/                  # Pantry reasoning agent (Gemini)
│   ├── api/
│   │   ├── auth/[...all]/        # Better Auth handler
│   │   ├── auth/demo-seed/       # Ensures demo account exists
│   │   ├── chat/                 # AI Chat Assistant (Groq, streaming)
│   │   ├── contact/
│   │   ├── pantry-agent/         # AI Chef backend (Gemini)
│   │   ├── recipes/
│   │   │   ├── route.ts          # GET (list/search/filter), POST (create)
│   │   │   ├── [id]/route.ts     # GET, PATCH (update), DELETE
│   │   │   └── mine/route.ts     # GET - current user's recipes
│   │   └── user/profile/route.ts # PATCH - update profile
│   ├── contact/
│   ├── explore/
│   ├── items/
│   │   ├── add/
│   │   ├── edit/[id]/
│   │   └── manage/
│   ├── profile/
│   ├── recipes/[id]/
│   ├── error.tsx
│   ├── loading.tsx
│   ├── not-found.tsx
│   ├── layout.tsx
│   ├── page.tsx                  # Home
│   └── globals.css               # Design tokens (colors)
├── components/
│   ├── chat/                     # Chat Assistant widget
│   ├── forms/                    # Shared recipe form (Add/Edit)
│   ├── layout/                   # Navbar, Footer
│   └── ui/                       # RecipeCard, skeletons, NutritionChart, UserAvatar
├── lib/
│   ├── auth.ts                   # Better Auth server config
│   ├── auth-client.ts            # Better Auth client instance
│   ├── db.ts                     # MongoDB connection utility
│   ├── session.ts                # getServerSession() helper
│   └── validations/recipe.ts     # Zod schemas
└── types/
    └── recipe.ts
```

---

## 🔌 API Routes

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/recipes` | Public | List recipes — supports `search`, `category`, `cuisine`, `sort`, `page`, `limit` |
| POST | `/api/recipes` | Required | Create a new recipe |
| GET | `/api/recipes/[id]` | Public | Get a single recipe |
| PATCH | `/api/recipes/[id]` | Required (owner only) | Update a recipe |
| DELETE | `/api/recipes/[id]` | Required (owner only) | Delete a recipe |
| GET | `/api/recipes/mine` | Required | Get the logged-in user's own recipes |
| POST | `/api/chat` | Public | Streaming AI Chat Assistant (Groq) |
| POST | `/api/pantry-agent` | Required | AI Chef pantry reasoning agent (Gemini) |
| PATCH | `/api/user/profile` | Required | Update name/avatar |
| POST | `/api/contact` | Public | Submit contact form |
| POST | `/api/auth/demo-seed` | Public | Ensures the demo account exists |
| * | `/api/auth/[...all]` | — | Better Auth handler (login, register, session, OAuth callback) |

---

## 🔐 Authentication

- Email/password and Google OAuth via **Better Auth**
- Session-based auth checked server-side via `getServerSession()`
- Protected routes (`/items/add`, `/items/manage`, `/items/edit/[id]`, `/profile`) redirect unauthenticated users to `/login`
- **Demo login:** click "Try Demo Account" on the login page to auto-fill working demo credentials — the demo account is created automatically on first use if it doesn't already exist

---

## ⚙️ Environment Variables

Copy `.env.local.example` to `.env.local` and fill in real values:

```env
MONGODB_URI=
MONGODB_DB=recipe-hut

BETTER_AUTH_SECRET=      # generate with: openssl rand -base64 32
BETTER_AUTH_URL=http://localhost:3000

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

GROQ_API_KEY=            # used by the AI Chat Assistant
GEMINI_API_KEY=          # used by AI Chef
```

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# then fill in the values above

# Run the development server
npm run dev
```

Visit `http://localhost:3000`.

---

## 🎨 Design System

- **Primary:** Terracotta `#C1502E`
- **Secondary:** Olive `#5B6B4A`
- **Accent:** Mustard `#E0A458`
- **Neutrals:** Warm off-white background, warm near-black text (no pure black/white) for a consistent, premium, easy-on-the-eyes look
- Single, consistent theme (light) — no theme toggle, no flash-of-unstyled-theme on load
- All cards share identical dimensions, border-radius, and layout via a shared `RecipeCard` component with `line-clamp` and fixed-height layout to prevent inconsistent sizing

---

## 🧠 Why This Counts as "Agentic" AI

Both AI features go beyond single-shot text generation:

- **Chat Assistant:** maintains conversational memory, dynamically queries the recipe database mid-conversation to ground its answers, and reasons over follow-up context rather than treating each message in isolation.
- **AI Chef:** runs a multi-step pipeline — database retrieval → deterministic ranking/decision-making → targeted LLM reasoning only on the highest-value candidates — producing an explainable, justified recommendation rather than a single generated response.

---

## 📄 License

This project was built for educational/portfolio purposes.