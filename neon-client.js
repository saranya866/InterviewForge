// ============================================
// InterviewForge - Backend API Client
// Uses your Render backend to connect to Neon
// ============================================

// YOUR RENDER BACKEND URL
const API_URL = 'https://interviewforgebysaranya.onrender.com';

// Register a new user
async function registerUserDirect(name, email, password, role) {
    console.log("Registering user:", email);
    
    try {
        const response = await fetch(`${API_URL}/api/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                email: email,
                password: password,
                role: role || 'Undergraduate'
            })
        });
        
        const data = await response.json();
        console.log("Register response:", data);
        
        if (data.success) {
            // Save user to localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            return { success: true, user: data.user };
        } else {
            return { success: false, error: data.error };
        }
    } catch (error) {
        console.error("Register error:", error);
        return { success: false, error: error.message };
    }
}

// Login user
async function loginUserDirect(email, password) {
    console.log("Logging in user:", email);
    
    try {
        const response = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        
        const data = await response.json();
        console.log("Login response:", data);
        
        if (data.success) {
            // Save user to localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            return { success: true, user: data.user };
        } else {
            return { success: false, error: data.error };
        }
    } catch (error) {
        console.error("Login error:", error);
        return { success: false, error: error.message };
    }
}

// Make functions available globally
window.registerUserDirect = registerUserDirect;
window.loginUserDirect = loginUserDirect;

console.log('✅ API Client Ready! Backend:', API_URL);
