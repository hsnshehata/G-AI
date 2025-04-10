const token = localStorage.getItem('token');
const role = localStorage.getItem('role');
let selectedBotId = localStorage.getItem('selectedBotId') || null;

// تشغيل تبويب البوتات تلقائيًا عند فتح الصفحة
document.addEventListener('DOMContentLoaded', () => {
  switchTab('bots');
  if (role === 'admin') {
    const userSection = document.getElementById('userCreationSection');
    if (userSection) userSection.style.display = 'block';
  }
});

function switchTab(tab) {
  document.querySelectorAll('.tab-section').forEach(section => {
    section.style.display = section.id === tab ? 'block' : 'none';
  });

  document.querySelectorAll('.dashboard-nav button').forEach(btn => btn.classList.remove('active-tab'));
  document.querySelector(`.dashboard-nav button[onclick="switchTab('${tab}')"]`)?.classList.add('active-tab');

  if (tab === 'bots' && typeof loadBXTab === 'function') loadBXTab();
  if (tab === 'rules' && typeof loadRulesTab === 'function') loadRulesTab();
}

function logout() {
  localStorage.clear();
  window.location.href = '/';
}

window.switchTab = switchTab;
window.logout = logout;

// نموذج إنشاء مستخدم جديد (للسوبر أدمن فقط)
document.getElementById('userForm')?.addEventListener('submit', async (e) => {
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
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'حدث خطأ أثناء إنشاء المستخدم');
    }

    alert('✅ تم إنشاء المستخدم بنجاح');
    document.getElementById('userForm').reset();
    if (typeof loadUsersDropdown === 'function') loadUsersDropdown(); // تحديث القائمة في bxbots.js
  } catch (err) {
    console.error('خطأ في إنشاء المستخدم:', err);
    errorElement.textContent = err.message || 'فشل غير متوقع';
  }
});
