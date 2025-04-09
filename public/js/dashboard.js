window.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    window.location.href = 'index.html';
    return;
  }

  // فتح تبويب البوتات تلقائيًا
  switchTab('bots');
});

function logout() {
  localStorage.clear();
  window.location.href = 'index.html';
}

function switchTab(tabId) {
  document.querySelectorAll('.tab-section').forEach(sec => sec.style.display = 'none');
  document.getElementById(tabId).style.display = 'block';

  document.querySelectorAll('.dashboard-nav button').forEach(btn => btn.classList.remove('active-tab'));
  event.target.classList.add('active-tab');

  if (tabId === 'bots') loadBotsTab();
}
