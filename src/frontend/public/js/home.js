// src/frontend/public/js/home.js
document.addEventListener('DOMContentLoaded', async () => {
    // Intentar obtener el nombre de usuario desde una API de sesión (opcional)
    // O usar el valor guardado en localStorage tras el login
    const username = localStorage.getItem('app_username') || 'Investigador';
    document.getElementById('display-username').innerText = username;

    // Manejo del Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        // En una MPA, redirigimos al endpoint de logout del servidor
        window.location.href = '/api/auth/logout'; 
        // Nota: El servidor debe destruir la sesión y redirigir a /login
    });
});