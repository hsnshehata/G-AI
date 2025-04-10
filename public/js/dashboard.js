const token = localStorage.getItem('token');
const role = localStorage.getItem('role');
let selectedBotId = localStorage.getItem('selectedBotId') || null;

document.addEventListener('DOMContentLoaded', () => {
  // تفعيل تبويب البوتات تلقائيًا
  switchTab('bots');

  // عرض زر "إنشاء مستخدم" فقط للمشرف
  if (role === 'admin') {
    document.getElementById('toggleUserForm')?.style.display = 'inline-block';
  } else {
    document.getElementById('toggleUserForm')?.style.display = 'none';
  }

  // إخفاء النموذج تلقائيًا
  const userForm = document.getElementById('bxUserForm');
  if (userForm) userForm.style.display = 'none';
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

// إنشاء مستخدم جديد
document.getElementById('toggleUserForm')?.addEventListener('click', () => {
  const form = document.getElementById('bxUserForm');
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
});

document.getElementById('bxUserForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('newUsername').value.trim();
  const password = document.getElementById('newPassword').value.trim();
  const errorEl = document.getElementById('userCreateError');

  if (!username || !password) {
    errorEl.textContent = '❌ يرجى إدخال اسم مستخدم وكلمة مرور';
    return;
  }

  try {
    const res = await fetch('/api/users/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'حدث خطأ');
    }

    alert('✅ تم إنشاء المستخدم بنجاح');
    document.getElementById('bxUserForm').reset();
    document.getElementById('bxUserForm').style.display = 'none';

    // تحديث قائمة المستخدمين
    if (typeof loadUsersDropdown === 'function') loadUsersDropdown();
  } catch (err) {
    errorEl.textContent = err.message;
  }
});
