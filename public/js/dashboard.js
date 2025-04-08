document.addEventListener("DOMContentLoaded", () => {
  const loginSection = document.getElementById("loginSection");
  const dashboardSection = document.getElementById("dashboardSection");
  const logoutBtn = document.getElementById("logoutBtn");
  const topTabs = document.querySelector(".top-tabs");
  const bottomNav = document.querySelector(".bottom-nav");
  const createBotBtn = document.getElementById("createBotBtn");
  const tabButtons = document.querySelectorAll("[data-tab]");

  // التحقق من تسجيل الدخول
  const savedRole = localStorage.getItem("role");
  if (savedRole) {
    loginSection.style.display = "none";
    dashboardSection.style.display = "block";
    handleTab(localStorage.getItem("currentTab") || "bots");
    toggleCreateBotBtn(savedRole);
  }

  document.getElementById("loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("usernameInput").value;
    const password = document.getElementById("passwordInput").value;

    if (username === "hsn" && password === "662015") {
      localStorage.setItem("role", "admin");
    } else {
      localStorage.setItem("role", "user");
    }

    loginSection.style.display = "none";
    dashboardSection.style.display = "block";
    handleTab("bots");
    toggleCreateBotBtn(localStorage.getItem("role"));
  });

  logoutBtn.addEventListener("click", () => {
    localStorage.clear();
    location.reload();
  });

  window.addEventListener("scroll", () => {
    const currentScroll = window.pageYOffset;
    topTabs.style.top = currentScroll > 10 ? "-60px" : "0";
  });

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.getAttribute("data-tab");
      handleTab(tab);
    });
  });

  function handleTab(tab) {
    tabButtons.forEach((btn) => btn.classList.remove("active"));
    document.querySelectorAll(".tab-section").forEach((el) => {
      el.style.display = "none";
    });

    document.getElementById(tab + "Section").style.display = "block";
    document
      .querySelectorAll(`[data-tab="${tab}"]`)
      .forEach((btn) => btn.classList.add("active"));

    localStorage.setItem("currentTab", tab);

    if (tab === "bots") {
      initAddBot(); // ستعرض البوتات حسب الدور بداخل addBot.js
    } else if (tab === "rules") {
      initRules();
    }
  }

  function toggleCreateBotBtn(role) {
    if (role === "admin") {
      createBotBtn.style.display = "inline-block";
    } else {
      createBotBtn.style.display = "none";
    }
  }
});
