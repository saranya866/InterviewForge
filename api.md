# InterviewForge API Reference

Base URL: `http://localhost:3001/api`

All protected routes require the header:
```
Authorization: Bearer <jwt_token>
```

---

## Auth

### POST `/auth/register`
Create a new account. Returns a JWT and user object.

**Body**
```json
{
  "name": "Ravi Sharma",
  "email": "ravi@example.com",
  "password": "Secret@123",
  "role": "Undergraduate"
}
```

**Response 201**
```json
{
  "token": "eyJ...",
  "user": { "id": 1, "name": "Ravi Sharma", "email": "...", "xp": 50, "level": "Novice", ... }
}
```

---

### POST `/auth/login`
Login. Automatically updates streak.

**Body**
```json
{ "email": "ravi@example.com", "password": "Secret@123" }
```

**Response 200**
```json
{ "token": "eyJ...", "user": { ... } }
```

---

## Users _(JWT required)_

### GET `/users/me`
Returns the full profile of the logged-in user.

**Response 200**
```json
{
  "id": 1, "name": "Ravi", "email": "ravi@example.com",
  "role": "Undergraduate", "xp": 550, "streak": 4,
  "level": "Apprentice", "questions_answered": 32,
  "average_score": 76.50, "last_active": "2026-03-25"
}
```

---

### PATCH `/users/me`
Update display name or role.

**Body** _(all fields optional)_
```json
{ "name": "Ravi K.", "role": "Working Professional" }
```

---

### POST `/users/xp`
Award XP to the current user. Automatically recomputes level.

**Body**
```json
{ "amount": 20, "reason": "Flashcard complete" }
```

**Response 200**
```json
{ "xp": 570, "level": "Apprentice" }
```

---

### GET `/users/roadmap`
Returns an array of completed roadmap topics.

**Response 200**
```json
[
  { "phase_index": 0, "topic_index": 0 },
  { "phase_index": 0, "topic_index": 1 }
]
```

---

### POST `/users/roadmap`
Mark a roadmap topic as complete.

**Body**
```json
{ "phase_index": 0, "topic_index": 2 }
```

---

## Sessions _(JWT required)_

### POST `/sessions`
Save a completed interview session. Updates the user's aggregate stats.

**Body**
```json
{
  "category": "Java",
  "difficulty": "Medium",
  "score": 80.0,
  "questions_count": 10,
  "duration_secs": 540,
  "xp_earned": 45,
  "questions": [
    {
      "question_text": "What is JVM?",
      "user_answer": "Java Virtual Machine...",
      "ai_feedback": "Good answer.",
      "score": 90.0
    }
  ]
}
```

**Response 201**
```json
{ "session_id": 7 }
```

---

### GET `/sessions?limit=20`
List the current user's recent sessions (newest first).

**Response 200**
```json
[
  {
    "id": 7, "category": "Java", "difficulty": "Medium",
    "score": 80, "questions_count": 10,
    "duration_secs": 540, "xp_earned": 45,
    "completed_at": "2026-03-25T10:45:00.000Z"
  }
]
```

---

### GET `/sessions/:id`
Get a single session with all question records.

**Response 200**
```json
{
  "id": 7, "category": "Java",
  "questions": [
    { "id": 1, "question_text": "...", "user_answer": "...", "score": 90 }
  ]
}
```

---

## Leaderboard _(public)_

### GET `/leaderboard?limit=50`
Top users ranked by XP.

**Response 200**
```json
[
  { "rank": 1, "name": "Anjali M.", "email": "...", "xp": 3200, "streak": 14, "level": "Expert", "questions_answered": 180 },
  { "rank": 2, "name": "Ravi S.",  "email": "...", "xp": 1850, "streak": 7,  "level": "Practitioner", "questions_answered": 95 }
]
```

---

## Health

### GET `/health`
```json
{ "status": "ok", "ts": "2026-03-25T10:00:00.000Z" }
```

---

## Error format

All errors follow:
```json
{ "error": "Human-readable message" }
```

| Code | Meaning |
|------|---------|
| 400  | Bad request / missing fields |
| 401  | Missing or invalid JWT |
| 404  | Resource not found |
| 409  | Conflict (e.g. email already exists) |
| 500  | Internal server error |
