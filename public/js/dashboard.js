const token = localStorage.getItem('token');
const role = localStorage.getItem('role');
let selectedBotId = localStorage.getItem('selectedBotId') || null;

// تفعيل تبويب البوتات تلقائيًا عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  switchTab('bots');
});

function switchTab(tab) {
  document.querySelectorAll('.tab-section').forEach(section => {
    section.style.display = section.id === tab ? 'block' : 'none';
  });

  document.querySelectorAll('.dashboard-nav button').forEach(btn => btn.classList.remove('active-tab'));
  document.querySelector(`.dashboard-nav button[onclick="switchTab('${tab}')"]`)?.classList.add('active-tab');

  if (tab === 'bots' && typeof loadBXTab === 'function') loadBXTab();
  if (tab === 'rules' && typeof loadRulesTab === 'function') loadRulesTab();
  if (tab === 'users' && typeof loadUsersTab === 'function') loadUsersTab();
}

function logout() {
  localStorage.clear();
  window.location.href = '/';
}

window.switchTab = switchTab;
window.logout = logout;

// 👥 التعامل مع تبويب المستخدمين

// زر إظهار / إخفاء نموذج المستخدم
document.getElementById('toggleUserForm')?.addEventListener('click', () => {
  const userForm = document.getElementById('bxUserForm');
  userForm.style.display = userForm.style.display === 'none' ? 'block' : 'none';
});

// إرسال نموذج إنشاء مستخدم جديد
document.getElementById('bxUserForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('newUsername').value.trim();
  const password = document.getElementById('newPassword').value.trim();
  const errorElement = document.getElementById('userCreateError');

  if (!username || !password) {
    errorElement.textContent = 'يرجى إدخال اسم المستخدم وكلمة المرور';
    return;
  }

  try {
    const response = await fetch('/api/users/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'حدث خطأ أثناء إنشاء المستخدم');
    }

    alert('تم إنشاء المستخدم بنجاح');

    // ✅ تفريغ النموذج والرسائل بعد الإرسال
    document.getElementById('bxUserForm').reset();
    document.getElementById('bxUserForm').style.display = 'none';
    errorElement.textContent = '';

    // تحديث الجدول
    loadUsersTab();
  } catch (err) {
    errorElement.textContent = err.message;
  }
});

// تحميل جدول المستخدمين
async function loadUsersTab() {
  try {
    const response = await fetch('/api/users');
    const users = await response.json();

    const usersTableBody = document.querySelector('#usersTable tbody');
    usersTableBody.innerHTML = '';

    users.forEach(user => {
      const row = document.createElement('tr');
      row.innerHTML = `<td>${user.username}</td><td>${user.role}</td>`;
      usersTableBody.appendChild(row);
    });
  } catch (err) {
    console.error('فشل في تحميل المستخدمين:', err);
  }
}
