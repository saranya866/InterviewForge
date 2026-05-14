const { Pool } = require('pg');

// Use environment variable - NOT hardcoded password!
const pool = new Pool({
    connectionString: process.env.NEON_DB_URL,
    ssl: { rejectUnauthorized: false }
});

exports.handler = async (event) => {
    const path = event.path.replace('/.netlify/functions/api', '');
    const method = event.httpMethod;
    
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    };
    
    if (method === 'OPTIONS') {
        return { statusCode: 204, headers, body: '' };
    }
    
    if (path === '/health' && method === 'GET') {
        return { statusCode: 200, headers, body: JSON.stringify({ status: 'ok' }) };
    }
    
    if (path === '/register' && method === 'POST') {
        try {
            const { name, email, password, role } = JSON.parse(event.body);
            const hashedPassword = Buffer.from(password).toString('base64');
            
            const result = await pool.query(
                `INSERT INTO users (name, email, password_hash, role, xp, streak, level) 
                 VALUES ($1, $2, $3, $4, 50, 1, 'Novice') 
                 RETURNING id, name, email, role, xp, streak, level`,
                [name, email, hashedPassword, role || 'Student']
            );
            
            return { statusCode: 200, headers, body: JSON.stringify({ success: true, user: result.rows[0] }) };
        } catch (err) {
            return { statusCode: 400, headers, body: JSON.stringify({ success: false, error: err.message }) };
        }
    }
    
    if (path === '/login' && method === 'POST') {
        try {
            const { email, password } = JSON.parse(event.body);
            const hashedPassword = Buffer.from(password).toString('base64');
            
            const result = await pool.query(
                `SELECT id, name, email, role, xp, streak, level FROM users 
                 WHERE email = $1 AND password_hash = $2`,
                [email, hashedPassword]
            );
            
            if (result.rows.length > 0) {
                return { statusCode: 200, headers, body: JSON.stringify({ success: true, user: result.rows[0] }) };
            } else {
                return { statusCode: 401, headers, body: JSON.stringify({ success: false, error: 'Invalid credentials' }) };
            }
        } catch (err) {
            return { statusCode: 500, headers, body: JSON.stringify({ success: false, error: err.message }) };
        }
    }
    
    return { statusCode: 404, headers, body: JSON.stringify({ error: 'Not found' }) };
};
