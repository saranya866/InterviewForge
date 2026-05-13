const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_thGbLaTdsw70@ep-damp-lake-aoefz1w4.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
    ssl: { rejectUnauthorized: false }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Register endpoint
app.post('/api/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    const hashedPassword = Buffer.from(password).toString('base64');
    
    try {
        const result = await pool.query(
            `INSERT INTO users (name, email, password_hash, role, xp, streak, level) 
             VALUES ($1, $2, $3, $4, 50, 1, 'Novice') 
             RETURNING id, name, email, role, xp, streak, level`,
            [name, email, hashedPassword, role || 'Student']
        );
        res.json({ success: true, user: result.rows[0] });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = Buffer.from(password).toString('base64');
    
    try {
        const result = await pool.query(
            `SELECT id, name, email, role, xp, streak, level FROM users 
             WHERE email = $1 AND password_hash = $2`,
            [email, hashedPassword]
        );
        if (result.rows.length > 0) {
            res.json({ success: true, user: result.rows[0] });
        } else {
            res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = app;
