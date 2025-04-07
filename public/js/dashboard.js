import initAddBot from './addBot.js';

// عناصر الصفحة
const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const errorMsg = document.getElementById('login-error');

// بيانات الدخول الثابتة (هنربطها بالسيرفر لاحقًا)
const ADMIN_USERNAME = "hsn";
const ADMIN_PASSWORD = "662015";

// تفعيل الوضع الداكن تلقائيًا
if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.body.classList.add('dark');
}

// عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  // التحقق من الجلسة
  if (localStorage.getItem("loggedIn") === "true") {
    showDashboard();
  }

  // زر الدخول
  loginBtn.addEventListener('click', () => {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    if (user === ADMIN_USERNAME && pass === ADMIN_PASSWORD) {
      localStorage.setItem("loggedIn", "true");
      showDashboard();
    } else {
      errorMsg.textContent = "بيانات الدخول غير صحيحة!";
    }
  });

  // زر تسجيل الخروج
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem("loggedIn");
    location.reload();
  });

  // تحميل صفحة إنشاء البوت
  initAddBot();
});

// إظهار الداشبورد وإخفاء صفحة الدخول
function showDashboard() {
  document.body.classList.add('logged-in');
  errorMsg.textContent = ""; // إخفاء الخطأ إن وُجد
}
