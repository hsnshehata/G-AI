document.addEventListener('DOMContentLoaded', () => {
  // تعريف العناصر
  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const loginSection = document.getElementById("login-section");
  const dashboardSection = document.getElementById("dashboard-section");
  const topTabs = document.querySelector(".top-tabs");
  const loginError = document.getElementById("login-error");
  const tabButtons = document.querySelectorAll("[data-tab]");
  const tabContents = document.querySelectorAll(".tab-section");

  // التحقق من وجود العناصر الأساسية
  if (!loginSection || !dashboardSection) {
    console.error('Login section or dashboard section not found in the DOM');
    return;
  }

  // دالة لتحميل ملف JavaScript ديناميكيًا
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // دالة لإخفاء كل التبويبات
  function hideAllTabs() {
    tabContents.forEach(tab => {
      if (tab) tab.style.display = "none";
    });
  }

  // دالة لعرض تبويب معين
  function showTab(tabId) {
    const activeTab = document.getElementById(tabId);
    if (!activeTab) {
      console.error(`Tab with ID ${tabId} not found in the DOM`);
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
        else console.error('initAddBot is not defined in addBot.js');
      }).catch(err => console.error('Error loading addBot.js:', err));
    } else if (tabId === "rules") {
      loadScript('/js/rules.js').then(() => {
        if (typeof initRules === 'function') initRules();
        else console.error('initRules is not defined in rules.js');
      }).catch(err => console.error('Error loading rules.js:', err));
    }

    tabButtons.forEach(button => {
      button.classList.remove("active");
      if (button.getAttribute("data-tab") === tabId) {
        button.classList.add("active");
      }
    });
  }

  // التحقق من صلاحية دخول محفوظة
  const savedRole = localStorage.getItem("role");
  const savedToken = localStorage.getItem("token");
  if (savedRole && savedToken) {
    loginSection.style.display = "none";
    dashboardSection.style.display = "block";
    const lastTab = localStorage.getItem("currentTab") || "bots";
    showTab(lastTab);
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
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();
      if (!response.ok) {
        loginError.textContent = result.error || 'فشل في تسجيل الدخول';
        return;
      }

      localStorage.setItem("role", result.role);
      localStorage.setItem("username", result.username);
      localStorage.setItem("token", result.token);
      loginSection.style.display = "none";
      dashboardSection.style.display = "block";
      showTab("bots");
    } catch (err) {
      loginError.textContent = 'حدث خطأ أثناء تسجيل الدخول';
      console.error('خطأ في تسجيل الدخول:', err);
    }
  });

  // تسجيل الخروج
  logoutBtn.addEventListener("click", () => {
    localStorage.clear();
    location.reload();
  });

  // إخفاء التبويبات عند التمرير
  window.addEventListener("scroll", () => {
    const currentScroll = window.pageYOffset;
    topTabs.style.top = currentScroll > 10 ? "-60px" : "0";
  });

  // ربط الأزرار بالتبويبات
  tabButtons.forEach(button => {
    button.addEventListener("click", () => {
      const target = button.getAttribute("data-tab");
      showTab(target);
    });
  });

  // التبويب الافتراضي عند أول تحميل
  showTab(localStorage.getItem("currentTab") || "bots");
});
