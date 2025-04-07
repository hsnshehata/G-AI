import initAddBot from './addBot.js';
import initRules from './rules.js';

// عناصر الصفحة
const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const errorMsg = document.getElementById('login-error');

const ADMIN_USERNAME = "hsn";
const ADMIN_PASSWORD = "662015";

// الوضع الليلي
if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.body.classList.add('dark');
}

document.addEventListener('DOMContentLoaded', () => {
  // التحقق من الجلسة
  if (localStorage.getItem("loggedIn") === "true") {
    showDashboard();
    const defaultTab = localStorage.getItem("selectedTab") || 'bots';
    switchTab(defaultTab);
  }

  // زر الدخول
  loginBtn?.addEventListener('click', () => {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    if (user === ADMIN_USERNAME && pass === ADMIN_PASSWORD) {
      localStorage.setItem("loggedIn", "true");
      showDashboard();
      switchTab('bots');
    } else {
      errorMsg.textContent = "بيانات الدخول غير صحيحة!";
    }
  });

  // زر تسجيل الخروج
  logoutBtn?.addEventListener('click', () => {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("selectedTab");
    location.reload();
  });

  // تفعيل أزرار التبويبات (علوي وسفلي)
  document.querySelectorAll('[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      localStorage.setItem("selectedTab", tab);
      switchTab(tab);
    });
  });
});

// التبديل بين الأقسام
function switchTab(tab) {
  // فعّل الزر النشط
  document.querySelectorAll('[data-tab]').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.tab === tab) btn.classList.add('active');
  });

  // حمّل القسم المناسب
  const content = document.getElementById('main-content');
  switch (tab) {
    case 'bots':
      initAddBot();
      break;
    case 'rules':
      initRules();
      break;
    case 'chats':
      content.innerHTML = "<p style='text-align:center;'>قسم المحادثات قادم...</p>";
      break;
    case 'stats':
      content.innerHTML = "<p style='text-align:center;'>قسم الإحصائيات قادم...</p>";
      break;
    default:
      content.innerHTML = "<p style='text-align:center;'>اختر قسمًا من التبويبات</p>";
  }
}

// إظهار الداشبورد وإخفاء تسجيل الدخول
function showDashboard() {
  loginSection.style.display = "none";
  dashboardSection.style.display = "block";
  errorMsg.textContent = "";
}
