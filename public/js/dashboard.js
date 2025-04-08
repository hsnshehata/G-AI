// public/js/dashboard.js

document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const loginSection = document.getElementById("login-section");
  const dashboardSection = document.getElementById("dashboard-section");
  const topTabs = document.querySelector(".top-tabs");
  const loginError = document.getElementById("login-error");

  const savedRole = localStorage.getItem("role");
  if (savedRole) {
    loginSection.style.display = "none";
    dashboardSection.style.display = "block";
    showTab(localStorage.getItem("currentTab") || "bots");
  }

  loginBtn?.addEventListener("click", () => {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    if (!username || !password) {
      loginError.textContent = "من فضلك أدخل البيانات كاملة";
      return;
    }
    if (username === "hsn" && password === "662015") {
      localStorage.setItem("role", "admin");
    } else {
      localStorage.setItem("role", "user");
    }
    localStorage.setItem("username", username);
    loginSection.style.display = "none";
    dashboardSection.style.display = "block";
    showTab("bots");
  });

  logoutBtn?.addEventListener("click", () => {
    localStorage.clear();
    location.reload();
  });

  const tabButtons = document.querySelectorAll("[data-tab]");
  const tabContents = document.querySelectorAll(".tab-section");

  function hideAllTabs() {
    tabContents.forEach(tab => tab.style.display = "none");
  }

  function showTab(tabId) {
    hideAllTabs();
    const activeTab = document.getElementById(tabId);
    if (activeTab) activeTab.style.display = "block";
    localStorage.setItem("currentTab", tabId);

    if (tabId === "bots") {
      import("./addBot.js").then(mod => mod.initAddBot());
    } else if (tabId === "rules") {
      import("./rules.js").then(mod => mod.initRules());
    } else {
      document.getElementById("main-content").innerHTML = `<p class="text">القسم "${tabId}" تحت التطوير.</p>`;
    }

    tabButtons.forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-tab") === tabId);
    });
  }

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-tab");
      showTab(target);
    });
  });

  if (tabButtons.length > 0) {
    const firstTab = tabButtons[0].getAttribute("data-tab");
    showTab(firstTab);
  }
});
