document.addEventListener('DOMContentLoaded', () => {
  const role = localStorage.getItem('role');
  if (!localStorage.getItem('token')) {
    window.location.href = '/';
    return;
  }

  document.getElementById('botsBtn').addEventListener('click', () => {
    window.location.href = '#bots';
    loadBotsPage();
  });

  document.getElementById('rulesBtn').addEventListener('click', () => {
    window.location.href = '#rules';
    loadRulesPage();
  });

  // Load bots page by default
  loadBotsPage();
});

// استدعاء الدوال من الملفات الأخرى
const {
  loadBotsPage,
  populateBotSelect,
  selectBot,
  fetchUsers,
  showCreateBotForm,
  editBot,
  deleteBot,
  getSelectedBotId,
  setSelectedBotId,
} = require('./bots.js');

const {
  loadRulesPage,
  populateBotSelectRules,
  fetchRules,
  showCreateGlobalRuleForm,
  showCreateGeneralRuleForm,
  showCreateProductRuleForm,
  showCreateQARuleForm,
  showCreateStoreRuleForm,
  createRule,
  editRule,
  editProductRule,
  editQARule,
  editStoreRule,
  deleteRule,
} = require('./rules.js');

const {
  showCreateUserForm,
  editUser,
  deleteUser,
} = require('./users.js');
