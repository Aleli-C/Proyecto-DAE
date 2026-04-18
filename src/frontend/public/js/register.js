// src/frontend/public/js/register.js
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const user = document.getElementById('reg-user').value;
    const pass = document.getElementById('reg-pass').value;
    const confirm = document.getElementById('reg-pass-confirm').value;
    const msgObj = document.getElementById('reg-msg');

    if (pass !== confirm) {
        msgObj.innerText = "Las contraseñas no coinciden";
        msgObj.classList.add('visible');
        return;
    }

    try {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user, pass })
        });

        const data = await res.json();

        if (res.ok) {
            msgObj.style.color = "#10b981";
            msgObj.innerText = "¡Registro exitoso! Redirigiendo...";
            msgObj.classList.add('visible');
            setTimeout(() => window.location.href = '/login', 1500);
        } else {
            throw new Error(data.error);
        }
    } catch (err) {
        msgObj.style.color = "var(--error)";
        msgObj.innerText = err.message;
        msgObj.classList.add('visible');
    }
});