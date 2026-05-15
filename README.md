# 🔥 InterviewForge — AI-Powered Interview Preparation Platform

<div align="center">

*"Your Future Starts with the Next Question"*

A full-stack interview training platform with real MySQL database, JWT authentication, live leaderboard, and proctored exam simulator.

![InterviewForge](https://img.shields.io/badge/InterviewForge-v2.0-red?style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=flat-square)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue?style=flat-square)
![Express](https://img.shields.io/badge/Express-4.x-lightgrey?style=flat-square)
![JWT](https://img.shields.io/badge/Auth-JWT-orange?style=flat-square)
![Render](https://img.shields.io/badge/Backend-Render-purple?style=flat-square)
![Netlify](https://img.shields.io/badge/Frontend-Netlify-brightgreen?style=flat-square)
![Aiven](https://img.shields.io/badge/Database-Aiven-red?style=flat-square)
![License](https://img.shields.io/badge/License-All%20Rights%20Reserved-red?style=flat-square)

</div>

---

## 🚀 Live Demo

🌐 **[https://interviewforgebysaranyak.netlify.app](https://interviewforgebysaranyak.netlify.app/)**
 
> 🔐 **Test Credentials:** Email: `test@example.com` | Password: `Test@123456`

---

## 📋 Table of Contents

1. [What is InterviewForge?](#-what-is-interviewforge)
2. [Features](#-features)
3. [Tech Stack](#-tech-stack)
4. [How to Use](#-how-to-use)
5. [Project Structure](#-project-structure)
6. [Deployment Guide](#-deployment-guide)
7. [API Endpoints](#-api-endpoints)
8. [XP & Level System](#-xp--level-system)
9. [Roadmap](#-roadmap)
10. [Privacy & Security](#-privacy--security)
11. [License](#-license)
12. [Contact](#-contact)

---

## 💡 What is InterviewForge?

**InterviewForge** is a production-grade, full-stack web application built for interview preparation. Unlike static frontend-only platforms, InterviewForge features persistent cloud storage, real authentication, and a live competitive leaderboard.
 
| Feature | Description |
|---------|-------------|
| 🗄️ **MySQL Database** | All user data, XP, streaks, and leaderboard rankings persist in the cloud |
| 🔐 **JWT Authentication** | Secure login/register with bcrypt password hashing (12 salt rounds) |
| 🏆 **Live Leaderboard** | Real-time rankings across all registered users |
| 🔒 **Proctored Exam** | Anti-cheat detection with tab switching, copy/paste blocking, and integrity scoring |
| 🔥 **XP & Streaks** | Saved to database — survives browser refresh and device changes |
| ☁️ **Cloud Deployment** | Frontend on Netlify, Backend on Render, Database on Aiven |

### Who is it for?

### Who is it for?
 
| Audience | Pain Point | How InterviewForge Helps |
|----------|------------|--------------------------|
| 🎓 **B.Tech / BCA / MCA Students** | Campus placements are competitive, syllabus is vast | Topic-wise tests, DSA coding challenges, and a 10-week structured roadmap to cover everything before D-Day |
| 💼 **Freshers & Job Seekers** | Don't know what FAANG actually asks | 1000+ curated real-world questions, mock interviews with model answers, and a proctored exam simulator |
| 🔁 **Working Professionals** | Switching roles after years in industry | Targeted practice by category (System Design, SQL, OS) with XP-based progress tracking to stay motivated |
| 🏫 **Colleges & Bootcamps** | Need an internal placement prep portal | Deployable with your own database — leaderboard, streaks, and badges keep students engaged and competitive |
| 🌍 **Self-Learners** | No structure, no accountability | Daily streaks, milestone badges, weekly competitions, and a live leaderboard to keep the habit going |
---

## ✨ Features

### 🧠 1000+ Interview Questions
Curated Q&A across 40+ categories including Java, DSA, Algorithms, System Design, SQL, OS, Networking, Python, Spring Boot, Design Patterns, and Behavioral.
 
| Format | Description |
|--------|-------------|
| **MCQ** | 4 options, instant feedback, correct answer revealed on submission |
| **Open-ended** | Text answer, model answer shown after submission |
---

### 💻 Coding Challenges
8 real LeetCode-style problems with full descriptions, examples, hints, and editorial solutions:

| Problem | Difficulty | XP Reward |
|---------|------------|-----------|
| Two Sum | 🟢 Easy | +20 XP |
| Reverse Linked List | 🟢 Easy | +20 XP |
| Valid Parentheses | 🟢 Easy | +20 XP |
| Binary Search | 🟢 Easy | +20 XP |
| Climbing Stairs | 🟢 Easy | +25 XP |
| Maximum Subarray | 🟡 Medium | +35 XP |
| Merge Intervals | 🟡 Medium | +35 XP |
| LRU Cache | 🔴 Hard | +60 XP |

---

### 📝 Topic-wise Tests
Timed, auto-graded subject tests on Java, DSA, SQL, OS, Networking, and System Design. Grades scale from A+ to D. XP awarded is proportional to your final score.

---

### 🎮 Skill Games

| Game | Description | XP Reward |
|------|-------------|-----------|
| 🃏 Tech Flashcards | Flip through 50 key CS concepts | +15 XP |
| ⚡ Quiz Blitz | 10 MCQs against the clock | Up to +30 XP |
| 🐛 Bug Hunt | Find and fix bugs in code snippets | +10 XP/round |
| 📚 Term Sprint | Match CS terms to definitions | +20 XP |

---

### 🎯 Mock Interview
Simulate a real interview with configurable category, difficulty, and question count. Timed, scored, with model answers revealed after each question.

---

### 🔒 Proctored Exam
Full anti-cheat suite to simulate real exam conditions:

| Detection | Behaviour |
|-----------|-----------|
| Tab switch | Warning issued; exam terminates after 3 violations |
| Copy / Paste | Ctrl+C, Ctrl+V, Ctrl+X all blocked |
| Context menu | Right-click disabled during exam |
| Keyboard shortcuts | F12, Ctrl+Shift+I, DevTools access blocked |
| Fullscreen exit | Warning issued; fullscreen re-requested automatically |

**Integrity Score Formula:**
```
Integrity = 100 - (tabSwitches × 15) - (fullscreenExits × 10) - (pasteAttempts × 8)
```

---

### 🗺️ 10-Week Learning Roadmap

| Phase | Weeks | Topics |
|-------|-------|--------|
| Phase 1 | 1–2 | Foundations: Big O, Arrays, Linked Lists, Stacks |
| Phase 2 | 3–5 | Core DSA: Trees, Graphs, DP, Sorting |
| Phase 3 | 6–7 | System Design: Scalability, Caching, API Design |
| Phase 4 | 8–9 | Tech Stack: Java, SQL/NoSQL, OS, Cloud |
| Phase 5 | 10 | Soft Skills: STAR Method, HR Questions, Salary Negotiation |

---

### 💼 Job Board
12 curated listings from top companies with direct links to official career pages and salary ranges:

`Google` · `Amazon` · `Microsoft` · `Meta` · `Flipkart` · `Swiggy` · `Razorpay` · `PhonePe` · `TCS` · `Infosys` · `Zomato` · `Wipro`

---

### 🏅 Weekly Competitions
Live coding contests and quiz battles every week. Join live events to earn XP multipliers and exclusive Champion badges.

---

### 🔥 Streaks & Badges
Daily login streaks with milestone XP rewards. 12 unlockable achievement badges at 3, 7, 14, 30, 60, and 100 day milestones.

---

## 🏆 XP & Level System

| Level | Title | XP Required |
|-------|-------|-------------|
| 🌱 | Novice | 0 |
| 🔵 | Apprentice | 500 |
| 🟡 | Practitioner | 1,500 |
| 🟠 | Expert | 3,500 |
| 🔴 | Master | 7,500 |
| 👑 | Grandmaster | 15,000 |

---

## 🛠️ Tech Stack
 
| Layer | Technology | Link |
|-------|-----------|------|
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) — single file SPA | [MDN Web Docs](https://developer.mozilla.org) |
| **Backend** | Node.js 18+, Express 4 | [nodejs.org](https://nodejs.org) · [expressjs.com](https://expressjs.com) |
| **Database** | MySQL 8+ | [mysql.com](https://www.mysql.com) |
| **Authentication** | JWT + bcryptjs (12 salt rounds) | [jwt.io](https://jwt.io) · [npmjs: bcryptjs](https://www.npmjs.com/package/bcryptjs) |
| **Frontend Hosting** | Netlify | [netlify.com](https://www.netlify.com) |
| **Backend Hosting** | Render | [render.com](https://render.com) |
| **Database Hosting** | Aiven (MySQL Cloud) | [aiven.io](https://aiven.io) |
| **Fonts** | Geist, Geist Mono | [Google Fonts](https://fonts.google.com) |
| **Theming** | CSS Custom Properties — Dark / Light / System | [MDN: CSS Variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties) |
 
---

## 🚀 How to Use

### For Users (No Setup Required)

1. Open the live site: [https://interviewforgebysaranyak.netlify.app](https://interviewforgebysaranyak.netlify.app)
2. Click **Get Started** → Create your account
3. Login and start practicing
4. Your XP, streaks, and leaderboard rank are saved in the cloud — access from any device

---

## 📁 Project Structure

```
InterviewForge/
├── index.html              # Complete frontend (HTML + CSS + JS, single file)
├── server.js               # Express backend with all API routes
├── package.json            # Node.js dependencies
├── package-lock.json       # Dependency lock file
├── schema.sql              # MySQL database schema & seed data
├── fix-db.js               # Database reset / repair utility
├── .env                    # Environment variables (NOT committed to git)
└── README.md               # This file
```

---

## 🚢 Deployment Guide

### Architecture Overview

| Component | Service | Free Tier | Purpose |
|-----------|---------|-----------|---------|
| **Frontend** | Netlify | Unlimited bandwidth | Hosts HTML/CSS/JS |
| **Backend** | Render | 750 hours/month | Runs Node.js/Express API |
| **Database** | Aiven | 5GB free | MySQL cloud database |

> No credit card required for any of these services.

---

### Step 1 — Database Setup (Aiven)

1. Go to [https://aiven.io](https://aiven.io) and sign in with GitHub
2. Click **"Create Service"** → Select **MySQL**
3. Choose **"Free – Hobbyist"** plan ($0/month)
4. Select region:

| Region | Location |
|--------|----------|
| `ap-south-1` | Mumbai, India *(recommended for Indian users)* |
| `ap-southeast-1` | Singapore |
| `us-east-1` | Virginia, USA |
| `eu-central-1` | Frankfurt, Germany |

5. Click **"Create"** and wait 1–2 minutes
6. Click on your service → **"Connection Information"** tab
7. Copy: `host`, `port`, `user`, `password`, `database name`
8. In the **"Databases"** tab, run `schema.sql` via the query console or a MySQL client

---

### Step 2 — Backend Deployment (Render)

1. Go to [https://render.com](https://render.com) and sign in with GitHub
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo: `saranya866/InterviewForge`
4. Configure:

| Setting | Value |
|---------|-------|
| **Environment** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |

5. Add all Environment Variables (see section below)
6. Click **"Create Web Service"**
7. Copy your Render URL: `https://interviewforge-4lvh.onrender.com`

---

### Step 3 — Frontend Deployment (Netlify)

1. Go to [https://netlify.com](https://netlify.com) and sign in with GitHub
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect your GitHub repo: `saranya866/InterviewForge`
4. Configure:

| Setting | Value |
|---------|-------|
| **Publish directory** | `/` (root) |
| **Build command** | *(leave empty)* |

5. In `index.html`, update the API base URL to your Render backend URL
6. Click **"Deploy site"**

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive JWT token |
| `GET` | `/api/auth/me` | Get current user profile (auth required) |

### User Data
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/user/stats` | Get XP, streaks, level, badges |
| `POST` | `/api/user/xp` | Award XP to current user |
| `POST` | `/api/user/streak` | Update daily streak |

### Leaderboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/leaderboard` | Get top 50 users by XP |
| `GET` | `/api/leaderboard/rank` | Get current user's rank |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Server + database health check |

> 🔐 All `/api/user/*` routes require `Authorization: Bearer <token>` header.

---

## 🗄️ Database Schema

```sql
-- Users table
CREATE TABLE users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100)        NOT NULL,
  email       VARCHAR(150) UNIQUE NOT NULL,
  password    VARCHAR(255)        NOT NULL,  -- bcrypt hashed
  xp          INT     DEFAULT 0,
  level       VARCHAR(50) DEFAULT 'Novice',
  streak      INT     DEFAULT 0,
  last_login  DATE,
  badges      JSON,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leaderboard view
CREATE VIEW leaderboard AS
  SELECT id, name, xp, level, streak
  FROM users
  ORDER BY xp DESC
  LIMIT 50;
```

---

## 🔐 Environment Variables

Create a `.env` file in the project root:

```env
# Server
PORT=5000
NODE_ENV=production

# MySQL Database (Aiven)
DB_HOST=your-aiven-host.aivencloud.com
DB_PORT=your-port
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=defaultdb
DB_SSL=true

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this

# Frontend URL (for CORS)
FRONTEND_URL=https://interviewforgebysaranyak.netlify.app
```

> ⚠️ **Never commit your `.env` file.** It is already listed in `.gitignore`.

---

## 🗺️ Roadmap

- [ ] AI-generated feedback on open-ended answers (GPT integration)
- [ ] Resume builder with ATS scoring
- [ ] Voice-based mock interview mode
- [ ] Company-specific question banks (Google, Amazon, etc.)
- [ ] Mobile app (React Native)
- [ ] College/bootcamp admin portal
- [ ] Interview room — peer-to-peer mock sessions
- [ ] Dark mode polish and PWA support

---

## 🔒 Privacy & Security

- Passwords hashed with **bcryptjs** (12 salt rounds) — never stored in plain text
- **JWT tokens** expire and are validated server-side on every protected request
- **CORS** is configured to allow only the registered frontend origin
- **SSL/TLS** enforced on all Aiven database connections
- No third-party trackers or analytics on user data
- User data is stored only in your own Aiven MySQL instance

---

## 📄 License

```
© 2024 SARANYA KIT.
 All Rights Reserved.

This project and its source code are proprietary.
Unauthorized copying, distribution, or use of this
software, in whole or in part, is strictly prohibited
without explicit written permission from the author.
```

---

## 👩‍💻 Contact

**Saranya K**

[![GitHub](https://img.shields.io/badge/GitHub-saranya866-black?style=flat-square&logo=github)](https://github.com/saranya866)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?style=flat-square&logo=linkedin)](https://in.linkedin.com/in/saranya-kit-6a6360324)

> Built with ❤️ for every student who ever panicked before an interview.

---

<div align="center">

⭐ **If this project helped you, please star the repo!** ⭐

[🌐 Live Demo](https://interviewforgebysaranyak.netlify.app) · [🐛 Report Bug](https://github.com/saranya866/InterviewForge/issues) · [💡 Request Feature](https://github.com/saranya866/InterviewForge/issues)

</div>
