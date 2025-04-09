// تعريف global مرة واحدة فقط
const token = localStorage.getItem('token');
const role = localStorage.getItem('role');
let selectedBotId = localStorage.getItem('selectedBotId') || null;

// التنقل بين التبويبات
function switchTab(tab) {
  document.querySelectorAll('.tab-section').forEach(section => {
    section.style.display = section.id === tab ? 'block' : 'none';
  });

  document.querySelectorAll('.dashboard-nav button').forEach(btn => btn.classList.remove('active-tab'));
  document.querySelector(`.dashboard-nav button[onclick="switchTab('${tab}')"]`)?.classList.add('active-tab');

  if (tab === 'bots') loadBotsTab?.();
  if (tab === 'rules') loadRulesTab?.();
}

// تسجيل الخروج
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('selectedBotId');
  window.location.href = 'index.html';
}

window.switchTab = switchTab;
window.logout = logout;
