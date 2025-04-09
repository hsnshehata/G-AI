window.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) return window.location.href = 'index.html';

  // لو سوبر أدمن أظهر زر إنشاء بوت
  if (role === 'admin') {
    document.getElementById('createBotContainer').style.display = 'block';
  }
});

function logout() {
  localStorage.clear();
  window.location.href = 'index.html';
}
