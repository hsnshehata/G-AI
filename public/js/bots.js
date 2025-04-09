const botsTable = document.querySelector('#botsTable tbody');
const createBotError = document.getElementById('createBotError');

// زرار إظهار النموذج
document.getElementById('showBotForm')?.addEventListener('click', () => {
  const form = document.getElementById('createBotForm');
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
});

// إظهار خانة الـ Page ID عند إدخال Facebook API Key
document.getElementById('facebookApiKey')?.addEventListener('input', e => {
  document.getElementById('pageIdContainer').style.display = e.target.value.trim() ? 'block' : 'none';
});

// تحميل المستخدمين لاستخدامهم في الربط
async function loadUsersList() {
  try {
    const res = await fetch('/api/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const users = await res.json();
    const select = document.getElementById('existingUsersSelect');
    select.innerHTML = '<option value="">اختر مستخدم موجود</option>';

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

// تحميل البوتات وعرضها
async function fetchBots() {
  try {
    const res = await fetch('/api/bots', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const bots = await res.json();
    botsTable.innerHTML = '';

    if (!bots.length) {
      botsTable.innerHTML = '<tr><td colspan="3">لا توجد بوتات بعد</td></tr>';
      return;
    }

    bots.forEach(bot => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${bot.name}</td>
        <td>${bot.username || 'غير معروف'}</td>
        <td>
          <button onclick="editBot('${bot._id}')">✏️</button>
          <button onclick="deleteBot('${bot._id}')">🗑️</button>
        </td>
      `;

      row.style.cursor = 'pointer';
      row.addEventListener('click', () => {
        document.querySelectorAll('#botsTable tr').forEach(r => r.classList.remove('selected'));
        row.classList.add('selected');
        selectedBotId = bot._id;
        localStorage.setItem('selectedBotId', selectedBotId);
      });

      botsTable.appendChild(row);
    });
  } catch (err) {
    botsTable.innerHTML = '<tr><td colspan="3">حدث خطأ أثناء تحميل البوتات ❌</td></tr>';
    console.error(err);
  }
}

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

  let usernameToSend = '';
  let passwordToSend = '';

  if (existingUsername) {
    usernameToSend = existingUsername;
  } else if (newUsername && newPassword) {
    usernameToSend = newUsername;
    passwordToSend = newPassword;
  } else {
    createBotError.textContent = 'اختر مستخدم أو أنشئ مستخدم جديد بكلمة مرور';
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
      document.getElementById('createBotForm').reset();
      document.getElementById('createBotForm').style.display = 'none';
      document.getElementById('pageIdContainer').style.display = 'none';
      fetchBots();
    } else {
      createBotError.textContent = result.error || 'فشل في إنشاء البوت';
    }
  } catch (err) {
    createBotError.textContent = 'حدث خطأ أثناء إرسال البيانات';
    console.error(err);
  }
});

// الدوال التفاعلية
function editBot(botId) {
  alert('تعديل البوت قادم... ID: ' + botId);
}

function deleteBot(botId) {
  if (confirm('هل أنت متأكد أنك تريد حذف هذا البوت؟')) {
    alert('الحذف سيتم تنفيذه لاحقًا... ID: ' + botId);
  }
}

// تحميل تبويب البوتات
function loadBotsTab() {
  if (role === 'admin') {
    document.getElementById('createBotContainer').style.display = 'block';
    loadUsersList();
  } else {
    document.getElementById('createBotContainer').style.display = 'none';
  }

  fetchBots();
}

window.loadBotsTab = loadBotsTab;
