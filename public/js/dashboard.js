document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logout-btn");
  const botsBtn = document.getElementById("botsBtn");
  const rulesBtn = document.getElementById("rulesBtn");
  const whatsappBtn = document.getElementById("whatsappBtn");
  const usersBtn = document.getElementById("usersBtn"); // زر المستخدمين

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  });

  botsBtn.addEventListener("click", () => {
    window.location.href = "#bots";
    loadBotsPage();
  });

  rulesBtn.addEventListener("click", () => {
    window.location.href = "#rules";
    loadRulesPage();
  });

  whatsappBtn.addEventListener("click", () => {
    window.location.href = "#whatsapp";
    loadWhatsAppPage();
  });

  usersBtn.addEventListener("click", () => {
    window.location.href = "#users";
    loadUsersPage(); // دي لازم تكون موجودة في users.js
  });

  function loadPageBasedOnHash() {
    const hash = window.location.hash;

    if (hash === "#rules") {
      loadRulesPage();
    } else if (hash === "#whatsapp") {
      loadWhatsAppPage();
    } else if (hash === "#users") {
      loadUsersPage(); // نضيف دعم المستخدمين
    } else {
      window.location.href = "#bots";
      loadBotsPage();
    }
  }

  window.addEventListener("hashchange", loadPageBasedOnHash);
  loadPageBasedOnHash();
});
