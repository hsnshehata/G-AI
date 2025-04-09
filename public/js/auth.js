document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok && data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role); // admin أو user
      window.location.href = 'dashboard.html';
    } else {
      document.getElementById('loginError').textContent = data.message || 'فشل تسجيل الدخول';
    }
  } catch (err) {
    document.getElementById('loginError').textContent = 'حدث خطأ أثناء الاتصال بالسيرفر';
  }
});
