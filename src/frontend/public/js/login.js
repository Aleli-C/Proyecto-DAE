// src/frontend/public/js/login.js (Actualizado)
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const userEl = document.getElementById('user');
    const passEl = document.getElementById('pass');
    const btn = document.getElementById('loginBtn');
    const msgObj = document.getElementById('msg');
    const card = document.querySelector('.login-card');

    // Estado de carga
    btn.disabled = true;
    msgObj.classList.remove('visible');

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user: userEl.value, pass: passEl.value })
        });

        const data = await res.json();

        if (res.ok && data.success) {
            window.location.href = '/home';
        } else {
            throw new Error(data.error || 'Credenciales incorrectas');
            window.location.href = '/login'
        }
    } catch (err) {
        // 1. Asignamos el texto (usamos un fallback por si err.message viene vacío)
        msgObj.innerText = err.message || 'Usuario o contraseña incorrectos.';
        
        // 2. Activamos la clase CSS
        msgObj.classList.add('visible');
        
        // 3. Respaldo forzado de estilos en línea (por si el CSS falla)
        msgObj.style.visibility = "visible";
        msgObj.style.opacity = "1";
        
        // 4. Forzar reflow para la animación de sacudida (Shake)
        card.classList.remove('shake');
        void card.offsetWidth; 
        card.classList.add('shake');

        // 5. Reinicio de campos por seguridad
        document.getElementById('pass').value = ''; 
        btn.disabled = false;
        document.getElementById('user').focus();
    }
});