import initAddBot from './addBot.js';
import initRules from './rules.js';

const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const errorMsg = document.getElementById('login-error');
const mainContent = document.getElementById('main-content');
const topTabs = document.querySelector('.top-tabs');

// بيانات دخول السوبر أدمن
const ADMIN_USERNAME = "hsn";
const ADMIN_PASSWORD = "662015";

// مراقبة السكرول لإخفاء التبويبات العلوية
let lastScrollY = window.scrollY;
window.addEventListener('scroll', () => {
  const currentScroll = window.scrollY;
  if (currentScroll > lastScrollY) {
    topTabs.classList.add('hidden'); // لأعلى = اختفاء
  } else {
    topTabs.classList.remove('hidden'); // لأسفل = ظهور
  }
  lastScrollY = currentScroll;
});

// تشغيل أولي
document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem("loggedIn") === "true") {
    showDashboard();
    const defaultTab = localStorage.getItem("selectedTab") || "bots";
    switchTab(defaultTab);
  }

  loginBtn?.addEventListener('click', handleLogin);
  logoutBtn?.addEventListener('click', handleLogout);

  document.querySelectorAll('[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      localStorage.setItem('selectedTab', tab);
      switchTab(tab);
    });
  });
});

// تسجيل الدخول
function handleLogin() {
  const user = document.getElementById('username').value;
  const pass = document.getElementById('password').value;

  if (user === ADMIN_USERNAME && pass === ADMIN_PASSWORD) {
    localStorage.setItem('loggedIn', 'true');
    showDashboard();
    switchTab('bots');
  } else {
    errorMsg.textContent = "بيانات الدخول غير صحيحة!";
  }
}

// تسجيل الخروج
function handleLogout() {
  localStorage.removeItem('loggedIn');
  localStorage.removeItem('selectedTab');
  location.reload();
}

// عرض الداشبورد
function showDashboard() {
  loginSection.style.display = "none";
  dashboardSection.style.display = "block";
  errorMsg.textContent = "";
}

// التبديل بين التبويبات
function switchTab(tab) {
  // تفعيل الزر النشط
  document.querySelectorAll('[data-tab]').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.tab === tab) btn.classList.add('active');
  });

  // تحميل القسم
  mainContent.innerHTML = '<p style="text-align:center;">جارٍ التحميل...</p>';
  switch (tab) {
    case 'bots':
      initAddBot();
      break;
    case 'rules':
      initRules();
      break;
    case 'chats':
      mainContent.innerHTML = "<p style='text-align:center;'>قسم المحادثات قادم قريبًا 💬</p>";
      break;
    case 'stats':
      mainContent.innerHTML = "<p style='text-align:center;'>قسم الإحصائيات قيد الإنشاء 📊</p>";
      break;
    default:
      mainContent.innerHTML = "<p style='text-align:center;'>قسم غير معروف 🤔</p>";
  }
}
