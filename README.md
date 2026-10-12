# 🔥 Fire Drill — AI Code Reliability Simulator

> **"Scan. Understand. Prompt. Fix. Verify."**

Fire Drill is an AI-powered code reliability simulator that analyzes GitHub repositories, identifies reliability and security risks with evidence, generates a reliability score, and creates actionable fix prompts for AI coding agents.

Modern developers increasingly build software using AI coding assistants such as **Google Antigravity**, **Cursor**, and **Claude Code**. While AI accelerates code creation, it frequently introduces subtle concurrency race conditions, secret leaks, missing validation, and architectural regressions. Fire Drill acts as the autonomous reliability engineer that discovers these issues with forensic proof and generates precision prompts to fix them.

---

## ⚡ Features

- **GitHub Repository Scanning**: Ingests public repositories via GitHub REST API with intelligent file prioritization, AST analysis, and automatic token budget management.
- **Static + AI Reliability Analysis**: Hybrid engine combining static deterministic rules with Google Gemini 2.5 Flash for deep semantic reasoning.
- **Evidence-backed Bug Hunt**: Discovers issues with exact file paths, line numbers, code snippets, root cause explanations, and reproducible test cases without hallucinations.
- **Deterministic Reliability Score (0–100)**: Quantitative health metric weighted by critical, high, and medium severity findings and test coverage gaps.
- **Fire Drill AI Copilot**: Grounded conversational assistant that explains findings, priority rankings, forensic evidence, and blast radius.
- **Master Fix Prompt (Hero Feature)**: Synthesizes high-context, single-copy prompts tailored for AI coding agents (Antigravity, Cursor, Claude Code) to repair all discovered defects at once.
- **Re-Scan & Delta Verification**: Evaluates remediated code to calculate score improvements (e.g., 63 → 91) and verify that root causes were solved without regressions.
- **Disaster Drill** *(Planned / P1)*: Outage and chaos simulation modeling database failures, API timeouts, and failure propagation.
- **Architecture Map** *(Planned / P1)*: Living interactive topology graph with single-point-of-failure (SPOF) detection.
- **AI Fix Audit** *(Planned / P2)*: Forensic diff evaluation verifying whether AI-generated fixes actually remediated root causes.
- **Comprehensive Product Roadmap**: Structured development plan spanning P0 (Live), P1 (Next), P2 (Upcoming), and P3 (Advanced Reliability Intelligence).

---

## 🏗️ Architecture

```
GitHub Repository
       ↓
Fire Drill Backend (Express API)
       ↓
File Prioritization + Secret Redaction Guard
       ↓
Static Analysis (AST & Heuristics) + Google Gemini 2.5 Flash
       ↓
Reliability Engine & Deterministic Health Score (0–100)
       ↓
Bug Hunt & Forensic Workspace + Fire Drill AI Copilot
       ↓
Master Fix Prompt Synthesizer
       ↓
Developer / AI Coding Agent (Antigravity / Cursor / Claude Code)
       ↓
Re-Scan & Delta Verification Ledger
```

---

## 🔒 Security & Privacy Guardrails

- **Zero Secret Ingestion**: Client-side and server-side redactor filters scrub API keys (`sk-`, `AIzaSy`), GitHub tokens (`ghp_`, `github_pat_`), JWTs, AWS credentials, and `.env` files before analysis.
- **Server-Side Only Credentials**: API keys and GitHub tokens are strictly confined to the backend server and are never exposed to the frontend browser bundle.
- **Health Verification**: Server health and configuration endpoints return safe booleans only (`geminiConfigured: true`, `githubTokenConfigured: true`), never raw secret values.

---

## 🚀 Local Setup & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/trinayan06/fire-drill.git
cd fire-drill
```

### 2. Install Dependencies
Install all root, backend, and frontend dependencies:
```bash
# Using root helper:
npm run install:all

# Or manually:
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..
```

### 3. Configure Environment Variables
Create your local environment file for the backend server:

```bash
cp server/.env.example server/.env
```

Open `server/.env` and add your configuration credentials:

```env
PORT=3001
GITHUB_TOKEN=your_github_token_here
GEMINI_API_KEY=your_gemini_api_key_here
```

> **Security Note:** API keys and GitHub credentials are server-side only and should **never** be committed to the repository. The `.gitignore` file strictly excludes all `.env` files.

#### Environment Variables Reference
| Variable | Required | Description |
|---|---|---|
| `PORT` | Optional (default: `3001`) | Backend HTTP port |
| `GITHUB_TOKEN` | Recommended | GitHub Personal Access Token (increases API rate limit from 60 to 5,000 req/hr) |
| `GEMINI_API_KEY` | Recommended | Google Gemini API Key from Google AI Studio for deep LLM reasoning |

*Note: If API credentials are not provided, Fire Drill includes high-fidelity demo presets (`quickbite-food-app`, `auth-engine`) and deterministic static fallbacks so the complete end-to-end evaluation remains 100% operational.*

---

## 🏃 Running the Project

### Option A: Separate Terminals (Recommended)

**Terminal 1 — Backend API Server:**
```bash
npm run server
# Server starts at http://localhost:3001
```

**Terminal 2 — Frontend Application:**
```bash
npm run client
# Vite client starts at http://localhost:5173
```

### Option B: Build for Production
To build the production-ready client bundle:
```bash
npm run build
```

---

## 🗺️ Product Roadmap

- **P0 — Live Baseline**: GitHub scan, AST analysis, Bug Hunt, Health score, Copilot, Master Fix Prompt, Re-Scan.
- **P1 — Next**: Disaster Drill chaos simulation & interactive Architecture Map.
- **P2 — Upcoming**: AI Fix Audit, Scan History timeline, GitHub PR Reliability Bot, Advanced Drill Suites (Security, Performance, Testing, Dependency).
- **P3 — Future / Exploring**: Reliability Memory, Predictive Bug Detection, Pre-Deployment Gate, Production Observability, Autonomous Fix Verification, Autonomous Chaos Engine, Repository Digital Twin, Team Reliability Intelligence.

---

## 📄 License
MIT License © 2026 Fire Drill. "Scan. Understand. Prompt. Fix. Verify."
