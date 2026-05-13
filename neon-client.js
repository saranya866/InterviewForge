// Neon Database Connection
const NEON_CONFIG = {
    apiKey: 'napi_ltit3gzzmggbjygdsrzr445dg0z6r0b1rp8bme3jla1t6ku9ui5hv25r55vj55zs',
    projectId: 'billowing-art-37743061',
    branchId: 'br-broad-feather-aorlkd87'
};

async function executeQuery(sql) {
    const url = `https://console.neon.tech/api/v2/projects/${NEON_CONFIG.projectId}/branches/${NEON_CONFIG.branchId}/query`;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NEON_CONFIG.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: sql })
        });
        const data = await response.json();
        return data.rows || [];
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

async function registerUserDirect(name, email, password, role) {
    try {
        const passwordHash = btoa(password);
        const safeName = name.replace(/'/g, "''");
        
        const checkSql = `SELECT email FROM users WHERE email = '${email}'`;
        const existing = await executeQuery(checkSql);
        
        if (existing.length > 0) {
            return { success: false, error: 'Email already exists' };
        }
        
        const insertSql = `
            INSERT INTO users (name, email, password_hash, role, xp, streak, level)
            VALUES ('${safeName}', '${email}', '${passwordHash}', '${role || 'Student'}', 100, 1, 'Beginner')
            RETURNING id, name, email, role, xp, streak, level
        `;
        
        const result = await executeQuery(insertSql);
        
        if (result && result.length > 0) {
            localStorage.setItem('user', JSON.stringify(result[0]));
            return { success: true, user: result[0] };
        }
        return { success: false, error: 'Registration failed' };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function loginUserDirect(email, password) {
    try {
        const passwordHash = btoa(password);
        const sql = `SELECT id, name, email, role, xp, streak, level FROM users WHERE email = '${email}' AND password_hash = '${passwordHash}'`;
        const result = await executeQuery(sql);
        
        if (result && result.length > 0) {
            localStorage.setItem('user', JSON.stringify(result[0]));
            return { success: true, user: result[0] };
        }
        return { success: false, error: 'Invalid email or password' };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

window.registerUserDirect = registerUserDirect;
window.loginUserDirect = loginUserDirect;
console.log('Neon ready!');