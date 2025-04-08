document.addEventListener('DOMContentLoaded', () => {
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

  // تحميل mod.js
  loadScript('/js/mod.js')
    .then(() => {
      if (typeof mod !== 'undefined' && typeof mod.initializeTabs === 'function') {
        mod.initializeTabs();
      } else {
        console.error('mod.initializeTabs is not defined in mod.js');
      }

      // تعريف العناصر
      const loginBtn = document.getElementById("login-btn");
      const logoutBtn = document.getElementById("logout-btn");
      const loginSection = document.getElementById("login-section");
      const dashboardSection = document.getElementById("dashboard-section");
      const topTabs = document.querySelector(".top-tabs");
      const loginError = document.getElementById("login-error");
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
        } else {
          console.error(`Tab with ID ${tabId} not found`);
          return;
        }
        localStorage.setItem("currentTab", tabId);

        if (tabId === "bots") {
          loadScript('/js/addBot.js')
            .then(() => {
              if (typeof initAddBot === 'function') {
                initAddBot();
              } else {
                console.error('initAddBot is not defined in addBot.js');
              }
            })
            .catch(err => console.error('Error loading addBot.js:', err));
        } else if (tabId === "rules") {
          loadScript('/js/rules.js')
            .then(() => {
              if (typeof initRules === 'function') {
                initRules();
              } else {
                console.error('initRules is not defined in rules.js');
              }
            })
            .catch(err => console.error('Error loading rules.js:', err));
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
      showTab("bots");
    })
    .catch(err => console.error('Error loading mod.js:', err));
});
