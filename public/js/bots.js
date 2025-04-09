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
    const res = await fetch('/api/bots', {
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
        <td>${bot.username || '—'}</td>
        <td><button onclick="alert('قريبًا: التحكم في البوت')">⚙️</button></td>
      `;
      botsTable.appendChild(row);
    });
  } catch (err) {
    botsTable.innerHTML = '<tr><td colspan="3">خطأ في تحميل البوتات ❌</td></tr>';
  }
}

// إرسال طلب إنشاء بوت
createBotForm?.addEventListener('submit', async e => {
  e.preventDefault();

  const botName = document.getElementById('botName').value.trim();
  const existingUsername = document.getElementById('existingUsersSelect').value;
  const newUsername = document.getElementById('newUsername').value.trim();
  const newPassword = document.getElementById('newPassword').value;
  const openaiKey = document.getElementById('openaiKey').value.trim();
  const facebookApiKey = document.getElementById('facebookApiKey').value.trim();
  const pageId = document.getElementById('pageId').value.trim();

  let usernameToSend = '';
  let passwordToSend = '';

  if (existingUsername) {
    usernameToSend = existingUsername;
  } else if (newUsername && newPassword) {
    usernameToSend = newUsername;
    passwordToSend = newPassword;
  } else {
    createBotError.textContent = 'يجب اختيار مستخدم موجود أو إدخال اسم مستخدم وكلمة مرور جديدة.';
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
      createBotError.textContent = '';
      fetchBots(); // تحديث الجدول
      createBotForm.reset();
      document.getElementById('pageIdContainer').style.display = 'none';
    } else {
      createBotError.textContent = result.error || 'فشل في إنشاء البوت';
    }
  } catch (err) {
    createBotError.textContent = 'حدث خطأ في الاتصال بالسيرفر';
  }
});

fetchBots();
