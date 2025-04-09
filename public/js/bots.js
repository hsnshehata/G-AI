const token = localStorage.getItem('token');
const role = localStorage.getItem('role');

const botsTable = document.querySelector('#botsTable tbody');
const createBotForm = document.getElementById('createBotForm');
const createBotError = document.getElementById('createBotError');

// عرض معرف الصفحة عند إدخال Facebook API Key
document.getElementById('facebookApiKey').addEventListener('input', e => {
  document.getElementById('pageIdContainer').style.display = e.target.value.trim() ? 'block' : 'none';
});

// تحميل البوتات
async function fetchBots() {
  try {
    const res = await fetch('/api/bots/create', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();

    botsTable.innerHTML = '';
    if (data.length === 0) {
      botsTable.innerHTML = '<tr><td colspan="3">لا توجد بوتات بعد</td></tr>';
      return;
    }

    data.forEach(bot => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${bot.name}</td>
        <td>${bot.username}</td>
        <td><button onclick="alert('قريبًا: التحكم في البوت')">⚙️</button></td>
      `;
      botsTable.appendChild(row);
    });
  } catch (err) {
    botsTable.innerHTML = '<tr><td colspan="3">خطأ في تحميل البوتات ❌</td></tr>';
  }
}

// إنشاء بوت جديد
createBotForm?.addEventListener('submit', async e => {
  e.preventDefault();

  const body = {
    name: document.getElementById('botName').value.trim(),
    existingUsername: document.getElementById('existingUsersSelect').value,
    newUsername: document.getElementById('newUsername').value.trim(),
    newPassword: document.getElementById('newPassword').value,
    openaiKey: document.getElementById('openaiKey').value.trim(),
    facebookApiKey: document.getElementById('facebookApiKey').value.trim(),
    pageId: document.getElementById('pageId').value.trim()
  };

  try {
    const res = await fetch('/api/bots', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    const result = await res.json();

    if (res.ok) {
      createBotError.textContent = '';
      fetchBots(); // تحديث الجدول
      createBotForm.reset();
      document.getElementById('pageIdContainer').style.display = 'none';
    } else {
      createBotError.textContent = result.message || 'فشل في إنشاء البوت';
    }
  } catch (err) {
    createBotError.textContent = 'خطأ في الاتصال بالسيرفر';
  }
});

fetchBots();
