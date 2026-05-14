// Netlify Functions API Client
const API_BASE = '/.netlify/functions/api';

async function registerUserDirect(name, email, password, role) {
    try {
        const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role })
        });
        const data = await response.json();
        if (data.success) {
            localStorage.setItem('user', JSON.stringify(data.user));
            return { success: true, user: data.user };
        }
        return { success: false, error: data.error };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

async function loginUserDirect(email, password) {
    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (data.success) {
            localStorage.setItem('user', JSON.stringify(data.user));
            return { success: true, user: data.user };
        }
        return { success: false, error: data.error };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

window.registerUserDirect = registerUserDirect;
window.loginUserDirect = loginUserDirect;
console.log('✅ Netlify API Client Ready!');
