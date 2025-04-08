document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/login.html';
    return;
  }

  // تهيئة التبويبات
  mod.initializeTabs();  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const loginSection = document.getElementById("login-section");
  const dashboardSection = document.getElementById("dashboard-section");
  const topTabs = document.querySelector(".top-tabs");
  const loginError = document.getElementById("login-error");

  // تعريف المتغيرات قبل الدوال
  const tabButtons = document.querySelectorAll("[data-tab]");
  const tabContents = document.querySelectorAll(".tab-section");

  // التحقق من وجود صلاحية محفوظة
  const savedRole = localStorage.getItem("role");
  const savedToken = localStorage.getItem("token");
  if (savedRole && savedToken) {
    loginSection.style.display = "none";
    dashboardSection.style.display = "block";
    showTab(localStorage.getItem("currentTab") || "bots");
  }

  // تسجيل الدخول
  loginBtn?.addEventListener("click", async () => {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    if (!username || !password) {
      loginError.textContent = "من فضلك أدخل البيانات كاملة";
      return;
    }

    try {
      // إرسال طلب تسجيل الدخول للسيرفر
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

      // تخزين البيانات في localStorage
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
  logoutBtn?.addEventListener("click", () => {
    localStorage.clear();
    location.reload();
  });

  // إخفاء التبويبات العلوية عند التمرير
  window.addEventListener("scroll", () => {
    const currentScroll = window.pageYOffset;
    topTabs.style.top = currentScroll > 10 ? "-60px" : "0";
  });

  // دالة لإخفاء كل التبويبات
  function hideAllTabs() {
    tabContents.forEach(tab => {
      tab.style.display = "none";
    });
  }

  // دالة لعرض تبويب معين
  function showTab(tabId) {
    hideAllTabs();
    const activeTab = document.getElementById(tabId);
    if (activeTab) {
      activeTab.style.display = "block";
    }
    localStorage.setItem("currentTab", tabId);

    if (tabId === "bots") {
      import("./addBot.js").then(mod => mod.initAddBot());
    } else if (tabId === "rules") {
      import("./rules.js").then(mod => mod.initRules());
    } else {
      document.getElementById("main-content").innerHTML = `<p class="text">القسم "${tabId}" تحت التطوير.</p>`;
    }

    // تحديث حالة الأزرار
    tabButtons.forEach(button => {
      button.classList.remove("active");
      if (button.getAttribute("data-tab") === tabId) {
        button.classList.add("active");
      }
    });
  }

  // إضافة مستمعي الأحداث للأزرار
  tabButtons.forEach(button => {
    button.addEventListener("click", () => {
      const target = button.getAttribute("data-tab");
      showTab(target);
    });
  });

  // عرض التبويب الأول بشكل افتراضي
  if (tabButtons.length > 0) {
    const firstTab = tabButtons[0].getAttribute("data-tab");
    showTab(firstTab);
  }
});
