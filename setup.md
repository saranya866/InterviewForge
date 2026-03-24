# InterviewForge — Setup Guide

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18+ |
| MySQL | 8+ |
| npm | 9+ |

---

## Step 1 — Clone

```bash
git clone https://github.com/YOUR_USERNAME/InterviewForge.git
cd InterviewForge
```

---

## Step 2 — Create the database

Log into MySQL and run the schema:

```bash
mysql -u root -p < docs/schema.sql
```

Or open `docs/schema.sql` in MySQL Workbench / phpMyAdmin and execute it.

This creates the `interviewforge` database with:
- `users`
- `interview_sessions`
- `session_questions`
- `xp_events`
- `roadmap_progress`
- `leaderboard` (view)

---

## Step 3 — Configure environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_actual_password
DB_NAME=interviewforge

# Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your_long_random_secret

PORT=3001
FRONTEND_ORIGIN=http://127.0.0.1:5500
```

> ⚠️ Never commit `.env` to git — it's already in `.gitignore`.

---

## Step 4 — Install dependencies & start server

```bash
cd backend        # if not already there
npm install
npm run dev       # development with auto-reload
```

Expected output:
```
✅  MySQL connected successfully
🚀  InterviewForge API running on http://localhost:3001
```

Test the health endpoint:
```bash
curl http://localhost:3001/api/health
# → {"status":"ok","ts":"..."}
```

---

## Step 5 — Open the frontend

Open `frontend/index.html` in VS Code with **Live Server** (default port 5500).

The API client is already embedded in `index.html`. It points to `http://localhost:3001/api` — make sure your backend is running on that port.

---

## Step 6 — Test a registration

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"Test@1234","role":"Undergraduate"}'
```

You should get back a JWT token and user object.

---

## Deploying to production

1. Set `NODE_ENV=production` in your environment
2. Set `FRONTEND_ORIGIN` to your actual frontend domain
3. Use a process manager like PM2: `pm2 start server.js --name interviewforge`
4. Put Nginx or a reverse proxy in front of the Express server
5. Use environment secrets (never hardcode credentials)

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `MySQL connection failed` | Check `DB_HOST`, `DB_USER`, `DB_PASSWORD` in `.env` |
| `CORS error` in browser | Set `FRONTEND_ORIGIN` to match your frontend URL exactly |
| `Invalid token` on every request | Make sure `JWT_SECRET` is the same between restarts |
| Port 3001 already in use | Change `PORT` in `.env` and update `API_BASE` in `index.html` |
