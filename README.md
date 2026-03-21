🎬 Pocket Productions
The SAG-AFTRA Rate-Aware Budget & Creative Powerhouse
A unified film production platform that bridges the gap between creative development and union-compliant logistics.

Public URL: https://pocket-productions.vercel.app

🚀 View Live Demo

📌 The Problem
Independent filmmakers (sub-$5M tier) currently juggle a fragmented "Frankenstein" stack: Final Draft for scripts, Google Sheets for budgets, and Notion for logistics.

The result? Costly human error. Producers frequently forget 21% P&H fringes or meal penalties, leading to massive budget overruns and union compliance issues.

🚀 The Solution
Pocket Productions is the first integrated platform where creative tools (Storyboards, Character Studios) are data-linked to a professional budget engine. It enforces SAG-AFTRA theatrical agreements at the data layer—making it impossible to under-budget by accident.

✨ Key Features
💊 Union-Compliant Budgeting: Auto-calculates SAG minimums, 21% P&H fringes, and meal penalty ladders based on the latest 2025-2026 theatrical tiers.

⭐ AI-Powered Creative Suite: Integrated Claude (Anthropic) API for generating storyboards from scripts and drafting character backstories.

⚡ Real-Time Budget Delta: A "Union vs. Non-Union" toggle that instantly shows the financial impact of going SAG across all departments.

📅 Production Gantt: A 22-week timeline where changing a shoot day automatically updates crew costs and burn rates in real-time.

📱 Mobile-First PWA: Designed for the producer on the move—fully installable as a Progressive Web App for on-set logistics.

🛠 Tech Stack & Intelligence Layer
This project uses a deliberate split-AI architecture to balance reasoning quality with real-time speed.

Frontend: React / Next.js (Deployed on Vercel)

AI - Claude (Sonnet 3.5): Handles deep creative reasoning, storyboard shot generation, and complex multi-scenario budget analysis.

AI - Groq (Llama 3.3 70B): Powers near-instant budget anomaly detection and natural language queries (e.g., "What happens to the budget if I add 2 shoot days?").

Deterministic Logic: All SAG math is handled via server-side Node.js logic (not AI) to ensure 100% compliance accuracy.

📋 Features & Roadmap
[x] Phase 1: SAG Rate-Aware Budget Engine & P&H Auto-calc.

[x] Phase 2: AI Storyboard Studio & Character Archetypes.

[x] Phase 3: Production Gantt & Location Scout Integration.

[ ] Phase 4: Residuals Tracking & Streaming Agreement Tiers (Upcoming v2.0).

⚙️ Installation & Setup
Clone the repo:

Bash
git clone https://github.com/Pamf1973/Pocket_Productions.git
Install dependencies:

Bash
npm install
Set up environment variables:
Create a .env file and add your CLAUDE_API_KEY and GROQ_API_KEY.

Run the development server:

Bash
npm run dev
👤 Author
[Your Name / Pamf1973] Product-focused Developer specializing in Fintech & Production Logistics.
