const API_URL = '/api/v1/auth';

const registerForm = document.getElementById('register-form');

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Getting values from the UI
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;

        try {
            console.log("Attempting to register...");
            const res = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await res.json();

            if (data.success) {
                localStorage.setItem('token', data.token);
                alert('Registration successful!');
                window.location.href = 'index.html';
            } else {
                // This will show you exactly what went wrong (e.g., "User already exists")
                alert('Error: ' + (data.error || 'Registration failed'));
            }
        } catch (err) {
            console.error('Registration Error:', err);
            alert('Could not connect to the server. Is it running?');
        }
    });
}