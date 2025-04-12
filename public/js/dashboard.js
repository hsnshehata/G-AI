document.addEventListener("DOMContentLoaded", () => {
  const dashboardSection = document.getElementById("dashboard-section");
  const botsBtn = document.getElementById("botsBtn");
  const rulesBtn = document.getElementById("rulesBtn");
  const whatsappBtn = document.getElementById("whatsappBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  // زر الخروج
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  });

  // كل زر يحمّل الصفحة المرتبطة به
  botsBtn.addEventListener("click", () => {
    window.location.hash = "#bots";
    loadBotsPage();
  });

  rulesBtn.addEventListener("click", () => {
    window.location.hash = "#rules";
    loadRulesPage();
  });

  whatsappBtn.addEventListener("click", () => {
    window.location.hash = "#whatsapp";
    loadWhatsAppPage();
  });

  // تحميل الصفحة بناءً على الهاش عند الفتح أو التغيير
  function loadPageBasedOnHash() {
    const hash = window.location.hash;

    if (hash === "#rules") {
      loadRulesPage();
    } else if (hash === "#whatsapp") {
      loadWhatsAppPage();
    } else {
      // افتراضيًا: تحميل البوتات
      loadBotsPage();
    }
  }

  // تحديث المحتوى عند تغيير التبويب
  window.addEventListener("hashchange", loadPageBasedOnHash);

  // تحميل الصفحة المناسبة عند أول فتح
  loadPageBasedOnHash();
});
