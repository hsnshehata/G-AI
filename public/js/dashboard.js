document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const loginSection = document.getElementById("login-section");
  const dashboardSection = document.getElementById("dashboard-section");
  const topTabs = document.querySelector(".top-tabs");
  const loginError = document.getElementById("login-error");
  const tabButtons = document.querySelectorAll("[data-tab]");
  const tabContents = document.querySelectorAll(".tab-section");

  if (!loginSection || !dashboardSection) {
    console.error('Login or Dashboard section missing');
    return;
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function hideAllTabs() {
    tabContents.forEach(tab => {
      if (tab) tab.style.display = "none";
    });
  }

  function showTab(tabId) {
    const activeTab = document.getElementById(tabId);
    if (!activeTab) {
      console.warn(`Tab with ID ${tabId} not found in the DOM`);
      const mainContent = document.getElementById("main-content");
      if (mainContent) {
        mainContent.innerHTML = `<p class="text">القسم "${tabId}" غير موجود.</p>`;
      }
      return;
    }

    hideAllTabs();
    activeTab.style.display = "block";
    localStorage.setItem("currentTab", tabId);

    if (tabId === "bots") {
      loadScript('/js/addBot.js').then(() => {
        if (typeof initAddBot === 'function') initAddBot();
      });
    } else if (tabId === "rules") {
      loadScript('/js/rules.js').then(() => {
        if (typeof initRules === 'function') initRules();
      });
    }

    tabButtons.forEach(button => {
      button.classList.remove("active");
      if (button.dataset.tab === tabId) button.classList.add("active");
    });
  }

  // تسجيل الدخول
  loginBtn.addEventListener("click", async () => {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    if (!username || !password) {
      loginError.textContent = "من فضلك أدخل البيانات كاملة";
      return;
    }

    try {
      const res = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const result = await res.json();

      if (!res.ok) {
        loginError.textContent = result.error || "فشل تسجيل الدخول";
        return;
      }

      localStorage.setItem("token", result.token);
      localStorage.setItem("username", result.username);
      localStorage.setItem("role", result.role);

      loginSection.style.display = "none";
      dashboardSection.style.display = "block";

      const lastTab = localStorage.getItem("currentTab") || "bots";
      if (document.getElementById(lastTab)) showTab(lastTab);

    } catch (err) {
      loginError.textContent = "حدث خطأ أثناء تسجيل الدخول";
    }
  });

  logoutBtn.addEventListener("click", () => {
    localStorage.clear();
    location.reload();
  });

  window.addEventListener("scroll", () => {
    const currentScroll = window.pageYOffset;
    topTabs.style.top = currentScroll > 10 ? "-60px" : "0";
  });

  tabButtons.forEach(button => {
    button.addEventListener("click", () => {
      const target = button.dataset.tab;
      showTab(target);
    });
  });

  // تحقق من دخول محفوظ
  const savedRole = localStorage.getItem("role");
  const savedToken = localStorage.getItem("token");
  if (savedRole && savedToken) {
    loginSection.style.display = "none";
    dashboardSection.style.display = "block";
    const lastTab = localStorage.getItem("currentTab") || "bots";
    if (document.getElementById(lastTab)) showTab(lastTab);
  }
});
