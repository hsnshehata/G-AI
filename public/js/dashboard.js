window.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const selectedBotId = localStorage.getItem('selectedBotId');

  // نعرّفهم بشكل عام على window علشان باقي الملفات تشوفهم
  window.token = token;
  window.role = role;
  window.selectedBotId = selectedBotId;

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

function switchTab(tab) {
  document.querySelectorAll('.tab-section').forEach(section => {
    if (section.id === tab) {
      section.style.display = 'block';
    } else {
      section.style.display = 'none';
    }
  });

  document.querySelectorAll('.dashboard-nav button').forEach(btn => {
    btn.classList.remove('active-tab');
  });
  document.querySelector(`.dashboard-nav button[onclick="switchTab('${tab}')"]`)?.classList.add('active-tab');

  // تحميل تبويب خاص
  if (tab === 'bots') loadBotsTab?.();
  if (tab === 'rules') loadRulesTab?.();
}
