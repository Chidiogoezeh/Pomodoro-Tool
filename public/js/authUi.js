// Declare ONCE at the top
const API_URL = '/api/v1/auth';

// Helper function to display messages on the page instead of alerts
function showMessage(text, isError = true) {
    const messageBox = document.getElementById('auth-message');
    if (!messageBox) return;

    messageBox.textContent = text;
    messageBox.className = `message-box ${isError ? 'message-error' : 'message-success'}`;
    messageBox.classList.remove('hidden');
}

// --- REGISTRATION LOGIC ---
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;

        try {
            const res = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();

            if (data.success) {
                localStorage.setItem('token', data.token);
                showMessage('Registration successful! Redirecting...', false);
                setTimeout(() => window.location.href = 'index.html', 1500);
            } else {
                showMessage(data.error || 'Registration failed');
            }
        } catch (err) {
            console.error('Registration Error:', err);
            showMessage('Connection error. Is the server running?');
        }
    });
}

// --- LOGIN LOGIC ---
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const res = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (data.success) {
                localStorage.setItem('token', data.token);
                showMessage('Login successful! Redirecting...', false);
                setTimeout(() => window.location.href = 'index.html', 1000); 
            } else {
                showMessage(data.error || 'Invalid Credentials');
            }
        } catch (err) {
            console.error('Login Error:', err);
            showMessage('Server connection failed.');
        }
    });
}