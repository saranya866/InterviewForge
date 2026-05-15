# 🔥 InterviewForge — AI-Powered Interview Preparation Platform

<div align="center">

*"Your Future Starts with the Next Question"*

A full-stack interview training platform with real MySQL database, JWT authentication, live leaderboard, and proctored exam simulator.

![InterviewForge](https://img.shields.io/badge/InterviewForge-v2.0-red?style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=flat-square)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue?style=flat-square)
![Render](https://img.shields.io/badge/Render-Deployed-purple?style=flat-square)
![Netlify](https://img.shields.io/badge/Netlify-Live-brightgreen?style=flat-square)
![License](https://img.shields.io/badge/License-All%20Rights%20Reserved-red?style=flat-square)

### 🚀 Live Demo

| Component | URL |
|-----------|-----|
| **Frontend** | [https://interviewforgebysaranyak.netlify.app](https://interviewforgebysaranyak.netlify.app) |
| **Backend API** | [https://interviewforge-4lvh.onrender.com](https://interviewforge-4lvh.onrender.com) |
| **Health Check** | [https://interviewforge-4lvh.onrender.com/api/health](https://interviewforge-4lvh.onrender.com/api/health) |

**Test Credentials:**  
Email: `test@example.com` | Password: `Test@123456`

</div>

---

## 📋 Table of Contents

1. [What is InterviewForge?](#-what-is-interviewforge)
2. [Features](#-features)
3. [Tech Stack](#-tech-stack)
4. [Live Demo](#-live-demo)
5. [How to Use](#-how-to-use)
6. [Project Structure](#-project-structure)
7. [Deployment](#-deployment)
8. [API Endpoints](#-api-endpoints)
9. [Database Schema](#-database-schema)
10. [Environment Variables](#-environment-variables)
11. [Screenshots](#-screenshots)
12. [Roadmap](#-roadmap)
13. [Privacy & Security](#-privacy--security)
14. [License](#-license)
15. [Contact](#-contact)

---

## 💡 What is InterviewForge?

**InterviewForge** is a full-stack web application for interview preparation. Unlike static frontend-only platforms, this version includes:

| Feature | Description |
|---------|-------------|
| **MySQL Database** | All user data, XP, streaks, and leaderboard rankings persist in the cloud |
| **JWT Authentication** | Secure login/register with bcrypt password hashing (12 salt rounds) |
| **Live Leaderboard** | Real-time rankings across all registered users |
| **Proctored Exam** | Anti-cheat detection with tab switching, copy/paste blocking, and integrity scoring |
| **XP & Streaks** | Saved to database, survives browser refresh and device changes |
| **Cloud Deployment** | Frontend on Netlify, Backend on Render, Database on Aiven |

### Who is it for?

| Audience | Use Case |
|----------|----------|
| 🎓 B.Tech / BCA / MCA Students | Campus placement preparation |
| 💼 Job Seekers | FAANG and product company interviews |
| 🔁 Working Professionals | Role switches and upskilling |
| 🏫 Colleges & Bootcamps | Internal placement portal deployment |

---

## ✨ Features

### 🧠 1000+ Interview Questions
Curated Q&A across 40+ categories including Java, DSA, Algorithms, System Design, SQL, OS, Networking, Python, Spring Boot, Design Patterns, and Behavioral. Questions come in two formats:

| Format | Description |
|--------|-------------|
| **MCQ** | 4 options, instant feedback, correct answer revealed on submission |
| **Open-ended** | Text answer, model answer shown after submission |

### 💻 Coding Challenges
8 real LeetCode-style problems with full problem descriptions, examples, hints, and editorial solutions:

| Problem | Difficulty | XP |
|---------|-----------|-----|
| Two Sum | Easy | +20 |
| Reverse Linked List | Easy | +20 |
| Valid Parentheses | Easy | +20 |
| Maximum Subarray | Medium | +35 |
| Binary Search | Easy | +20 |
| Climbing Stairs | Easy | +25 |
| Merge Intervals | Medium | +35 |
| LRU Cache | Hard | +60 |

### 📝 Topic-wise Tests
Timed, auto-graded subject tests on Java, DSA, SQL, OS, Networking, and System Design. Grades scale A+ to D. XP awarded is proportional to your final score.

### 🎮 Skill Games

| Game | Description | XP |
|------|-------------|-----|
| 🃏 Tech Flashcards | Flip through 50 key CS concepts | +15 |
| ⚡ Quiz Blitz | 10 MCQs against the clock | Up to +30 |
| 🐛 Bug Hunt | Find and fix bugs in code snippets | +10 per round |
| 📚 Term Sprint | Match CS terms to definitions | +20 |

### 🎯 Mock Interview
Simulate a real interview with configurable category, difficulty, and question count. Timed, scored, with model answers.

### 🔒 Proctored Exam
Full anti-cheat suite with:

| Detection | Behaviour |
|-----------|-----------|
| Tab switch | Warning issued; exam terminates after 3 violations |
| Copy / paste | Ctrl+C, Ctrl+V, Ctrl+X all blocked |
| Context menu | Right-click disabled during exam |
| Keyboard shortcuts | F12, Ctrl+Shift+I, DevTools access blocked |
| Fullscreen exit | Warning issued; fullscreen re-requested automatically |

**Integrity Score Formula:**
Integrity = 100 - (tabSwitches × 15) - (fullscreenExits × 10) - (pasteAttempts × 8)


### 🏆 XP & Level System

| Level | XP Required |
|-------|-------------|
| 🌱 Novice | 0 |
| 🔵 Apprentice | 500 |
| 🟡 Practitioner | 1,500 |
| 🟠 Expert | 3,500 |
| 🔴 Master | 7,500 |
| 👑 Grandmaster | 15,000 |

### 💼 Job Board
12 curated listings from top companies with direct links to official career pages and stipend/salary ranges:

- Google, Amazon, Microsoft, Meta
- Flipkart, Swiggy, Razorpay, PhonePe
- TCS, Infosys, Zomato, Wipro

### 🏅 Weekly Competitions
Live coding contests and quiz battles every week. Join live events to earn XP multipliers and exclusive Champion badges.

### 🔥 Streaks & Badges
Daily login streaks with milestone XP rewards. 12 unlockable achievement badges at 3, 7, 14, 30, 60, and 100 days.

### 🗺️ 10-Week Learning Roadmap

| Phase | Weeks | Topics |
|-------|-------|--------|
| Phase 1 | 1-2 | Foundations: Big O, Arrays, Linked Lists, Stacks |
| Phase 2 | 3-5 | Core DSA: Trees, Graphs, DP, Sorting |
| Phase 3 | 6-7 | System Design: Scalability, Caching, API Design |
| Phase 4 | 8-9 | Tech Stack: Java, SQL/NoSQL, OS, Cloud |
| Phase 5 | 10 | Soft Skills: STAR Method, HR Questions, Salary Negotiation |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) – single file |
| **Backend** | Node.js 18+, Express 4 |
| **Database** | MySQL 8+ (Aiven / TiDB Cloud / local) |
| **Authentication** | JWT + bcryptjs (12 salt rounds) |
| **Hosting** | Netlify (frontend), Render (backend), Aiven (database) |
| **Fonts** | Geist, Geist Mono (Google Fonts) |
| **Theming** | CSS custom properties — Dark / Light / System |

---

## 🚀 How to Use

### For Users (No setup required)

1. Open the live frontend: [https://interviewforgebysaranyak.netlify.app](https://interviewforgebysaranyak.netlify.app)
2. Click **Get Started** → Create an account
3. Login and start practicing
4. Your XP, streaks, and leaderboard rank are saved in the cloud database

### For Developers (Local Setup)

```bash
# 1. Clone the repository
git clone https://github.com/saranya866/InterviewForge.git
cd InterviewForge

# 2. Install backend dependencies
npm install

# 3. Create MySQL database and run schema
mysql -u root -p < schema.sql

# 4. Create .env file (see Environment Variables section)

# 5. Start backend
node server.js

# 6. Open frontend with Live Server
# Open index.html → Right-click → Open with Live Server
```

📁 PROJECT STRUCTURE:

InterviewForge/
├── index.html              # Complete frontend (HTML/CSS/JS)
├── server.js               # Express backend with API routes
├── package.json            # Node dependencies
├── package-lock.json       # Dependency lock file
├── schema.sql              # MySQL database schema
├── fix-db.js               # Database reset utility
├── .env                    # Environment variables (not committed)
└── README.md               # This file


