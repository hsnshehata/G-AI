const mod = {
  initializeTabs: function () {
    console.log('Tabs initialized successfully');
    // هنا ممكن تضيف أي منطق إضافي لتهيئة التبويبات
  }
};

// نعرف mod في الـ global scope عشان dashboard.js يقدر يستخدمه
window.mod = mod;
