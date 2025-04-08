document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const loginSection = document.getElementById("login-section");
  const dashboardSection = document.getElementById("dashboard-section");
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".tab-section");
  const loginError = document.getElementById("login-error");

  // التحقق من وجود صلاحية محفوظة
  const savedRole = localStorage.getItem("role");
  if (savedRole) {
    loginSection.style.display = "none";
    dashboardSection.style.display = "block";
    showTab(localStorage.getItem("currentTab") || "bots");
  }

  // تسجيل الدخول
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

  // تسجيل الخروج
  logoutBtn?.addEventListener("click", () => {
    localStorage.clear();
    location.reload();
  });

  // التحكم في عرض التبويبات
  function hideAllTabs() {
    tabContents.forEach(tab => {
      tab.style.display = "none";
    });
  }

  function showTab(tabId) {
    hideAllTabs();
    const activeTab = document.getElementById(tabId);
    if (activeTab) {
      activeTab.style.display = "block";
    }
    localStorage.setItem("currentTab", tabId);

    // تحميل المحتوى الديناميكي بناءً على التبويب
    switch (tabId) {
      case "bots":
        import("./addBot.js").then((mod) => mod.initAddBot());
        break;
      case "rules":
        import("./rules.js").then((mod) => mod.initRules());
        break;
      // أضف حالات أخرى للتبويبات الجديدة هنا
      default:
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
