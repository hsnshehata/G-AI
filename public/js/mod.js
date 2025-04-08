const mod = (function () {
  function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => {
      tab.style.display = 'none';
    });
    document.getElementById(tabId).style.display = 'block';

    document.querySelectorAll('.tab-button').forEach(button => {
      button.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
  }

  function initializeTabs() {
    // إخفاء كل التبويبات في البداية
    document.querySelectorAll('.tab-content').forEach(tab => {
      tab.style.display = 'none';
    });

    // إظهار أول تبويب افتراضيًا (مثلاً "bots-tab")
    const defaultTab = document.querySelector('.tab-content');
    if (defaultTab) {
      defaultTab.style.display = 'block';
      const defaultTabId = defaultTab.id;
      document.querySelector(`[data-tab="${defaultTabId}"]`).classList.add('active');
    }

    // إضافة event listeners لأزرار التبويبات
    document.querySelectorAll('.tab-button').forEach(button => {
      button.addEventListener('click', () => {
        const tabId = button.getAttribute('data-tab');
        showTab(tabId);
      });
    });
  }

  return {
    showTab: showTab,
    initializeTabs: initializeTabs,
  };
})();
