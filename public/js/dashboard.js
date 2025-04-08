document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const loginSection = document.getElementById("login-section");
  const dashboardSection = document.getElementById("dashboard-section");
  const topTabs = document.querySelector(".top-tabs");
  const bottomNav = document.querySelector(".bottom-nav");
  const loginError = document.getElementById("login-error");

  // التحقق من وجود صلاحية محفوظة
  const savedRole = localStorage.getItem("role");
  if (savedRole) {
    loginSection.style.display = "none";
    dashboardSection.style.display = "block";
    handleTab(localStorage.getItem("currentTab") || "bots");
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
    handleTab("bots");
  });

  // تسجيل الخروج
  logoutBtn.addEventListener("click", () => {
    localStorage.clear();
    location.reload();
  });

  // إخفاء التبويبات العلوية عند التمرير
  window.addEventListener("scroll", () => {
    const currentScroll = window.pageYOffset;
    topTabs.style.top = currentScroll > 10 ? "-60px" : "0";
  });

  // التبديل بين التبويبات
  document.querySelectorAll("[data-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.getAttribute("data-tab");
      handleTab(tab);
    });
  });

  // التحكم في عرض التبويبات
  function handleTab(tab) {
    document.querySelectorAll("[data-tab]").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-section").forEach((el) => (el.style.display = "none"));
    localStorage.setItem("currentTab", tab);

    if (tab === "bots") {
      import("./addBot.js").then((mod) => mod.initAddBot());
    } else if (tab === "rules") {
      import("./rules.js").then((mod) => mod.initRules());
    } else {
      document.getElementById("main-content").innerHTML = `<p class="text">القسم "${tab}" تحت التطوير.</p>`;
    }

    document.querySelectorAll(`[data-tab="${tab}"]`).forEach((b) => b.classList.add("active"));
  }
});
