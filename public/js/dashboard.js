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
  // إخفاء كل التبويبات
  document.querySelectorAll('.tab-section').forEach(sec => sec.style.display = 'none');
  document.getElementById(tabId).style.display = 'block';

  // إزالة التحديد من كل الأزرار
  document.querySelectorAll('.dashboard-nav button').forEach(btn => btn.classList.remove('active-tab'));

  // ✅ إضافة التحديد للزر المناسب بدل استخدام event
  const activeBtn = document.querySelector(`[onclick="switchTab('${tabId}')"]`);
  if (activeBtn) activeBtn.classList.add('active-tab');

  // استدعاء دوال التبويبات
  if (tabId === 'bots') loadBotsTab();
}
