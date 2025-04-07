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

// التحقق من الجلسة
if (localStorage.getItem("loggedIn") === "true") {
  showDashboard();
}

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

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem("loggedIn");
  location.reload();
});

function showDashboard() {
  loginSection.style.display = "none";
  dashboardSection.style.display = "block";
}
