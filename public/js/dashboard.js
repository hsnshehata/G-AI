document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logout-btn");
  const botsBtn = document.getElementById("botsBtn");

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  });

  botsBtn.addEventListener("click", () => {
    window.location.href = "#bots";
    loadBotsPage();
  });

  function loadPageBasedOnHash() {
    const hash = window.location.hash;
    if (hash === "#bots") {
      loadBotsPage();
    } else {
      window.location.href = "#bots";
      loadBotsPage();
    }
  }

  window.addEventListener("hashchange", loadPageBasedOnHash);
  loadPageBasedOnHash();
});
