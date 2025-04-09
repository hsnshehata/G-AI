const token = localStorage.getItem('token');
const role = localStorage.getItem('role');

// تحميل البوتات
async function fetchBots() {
  try {
    const res = await fetch('/api/bots', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();

    const botsTable = document.querySelector('#botsTable tbody');
    botsTable.innerHTML = '';

    if (data.length === 0) {
      botsTable.innerHTML = '<tr><td colspan="3">لا توجد بوتات بعد</td></tr>';
      return;
    }

    data.forEach(bot => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${bot.name}</td>
        <td>${bot.username || '—'}</td>
        <td><button onclick="alert('قريبًا: التحكم في البوت')">⚙️</button></td>
      `;
      botsTable.appendChild(row);
    });
  } catch (err) {
    console.error('فشل تحميل البوتات:', err);
  }
}

// تحميل المستخدمين لقائمة الاختيار
async function loadUsersList() {
  try {
    const res = await fetch('/api/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const users = await res.json();
    const select = document.getElementById('existingUsersSelect');

    users.forEach(user => {
      const option = document.createElement('option');
      option.value = user.username;
      option.textContent = user.username;
      select.appendChild(option);
    });
  } catch (err) {
    console.error('فشل تحميل المستخدمين:', err);
  }
}

// عند إدخال Facebook API Key → أظهر حقل Page ID
document.getElementById('facebookApiKey')?.addEventListener('input', e => {
  document.getElementById('pageIdContainer').style.display = e.target.value.trim() ? 'block' : 'none';
});

// إنشاء بوت جديد
document.getElementById('createBotForm')?.addEventListener('submit', async e => {
  e.preventDefault();

  const botName = document.getElementById('botName').value.trim();
  const existingUsername = document.getElementById('existingUsersSelect').value;
  const newUsername = document.getElementById('newUsername').value.trim();
  const newPassword = document.getElementById('newPassword').value;
  const openaiKey = document.getElementById('openaiKey').value.trim();
  const facebookApiKey = document.getElementById('facebookApiKey').value.trim();
  const pageId = document.getElementById('pageId').value.trim();
  const errorEl = document.getElementById('createBotError');

  let usernameToSend = '';
  let passwordToSend = '';

  if (existingUsername) {
    usernameToSend = existingUsername;
  } else if (newUsername && newPassword) {
    usernameToSend = newUsername;
    passwordToSend = newPassword;
  } else {
    errorEl.textContent = 'اختر مستخدم أو أنشئ واحدًا جديدًا';
    return;
  }

  const body = {
    name: botName,
    username: usernameToSend,
    password: passwordToSend,
    openaiKey,
    fbToken: facebookApiKey,
    pageId
  };

  try {
    const res = await fetch('/api/bots/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    const result = await res.json();

    if (res.ok) {
      errorEl.textContent = '';
      document.getElementById('createBotForm').reset();
      document.getElementById('pageIdContainer').style.display = 'none';
      fetchBots(); // تحديث
    } else {
      errorEl.textContent = result.error || 'فشل في إنشاء البوت';
    }
  } catch (err) {
    errorEl.textContent = 'حدث خطأ أثناء إرسال البيانات';
  }
});

function initBotsTab() {
  if (role === 'admin') {
    document.getElementById('createBotContainer').style.display = 'block';
    loadUsersList();
  }
  fetchBots();
}

// استدعاء داخل dashboard.js عند التبويب
window.loadBotsTab = initBotsTab;
