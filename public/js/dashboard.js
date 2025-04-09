// التأكد من تسجيل الدخول
window.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    window.location.href = 'index.html';
    return;
  }

  // تحميل تبويب البوتات مبدأيًا
  loadBotsTab();
});

// تسجيل الخروج
function logout() {
  localStorage.clear();
  window.location.href = 'index.html';
}

// التبديل بين التبويبات
function switchTab(tabId) {
  document.querySelectorAll('.tab-section').forEach(sec => sec.style.display = 'none');
  document.getElementById(tabId).style.display = 'block';

  document.querySelectorAll('.dashboard-nav button').forEach(btn => btn.classList.remove('active-tab'));
  event.target.classList.add('active-tab');

  if (tabId === 'bots') loadBotsTab();
}

// تحميل تبويب البوتات (placeholder دلوقتي)
function loadBotsTab() {
  document.getElementById('bots').innerHTML = '<p>✅ تم تحميل تبويب البوتات (هنكمل بناءه في الخطوة الجاية)</p>';
}
