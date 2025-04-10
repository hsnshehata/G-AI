const token = localStorage.getItem('token');
const role = localStorage.getItem('role');
let selectedBotId = localStorage.getItem('selectedBotId') || null;

// تفعيل تبويب البوتات تلقائيًا عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  switchTab('bots');
});

function switchTab(tab) {
  document.querySelectorAll('.tab-section').forEach(section => {
    section.style.display = section.id === tab ? 'block' : 'none';
  });

  document.querySelectorAll('.dashboard-nav button').forEach(btn => btn.classList.remove('active-tab'));
  document.querySelector(`.dashboard-nav button[onclick="switchTab('${tab}')"]`)?.classList.add('active-tab');

  if (tab === 'bots' && typeof loadBotsTab === 'function') loadBotsTab();
  if (tab === 'rules' && typeof loadRulesTab === 'function') loadRulesTab();
}

function logout() {
  localStorage.clear();
  window.location.href = '/';
}

window.switchTab = switchTab;
window.logout = logout;
