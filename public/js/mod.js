const mod = {
  initializeTabs: function () {
    // هنا ممكن تضيف أي منطق لتهيئة التبويبات
    console.log('Tabs initialized successfully');
  }
};

// نعرف mod في الـ global scope عشان dashboard.js يقدر يستخدمه
window.mod = mod;
