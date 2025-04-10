const botsTable = document.querySelector('#botsTable tbody');
const createBotError = document.getElementById('createBotError');
let botsList = [];
let editingBotId = null;


// زرار إظهار النموذج
document.getElementById('showBotForm')?.addEventListener('click', () => {
  const form = document.getElementById('createBotForm');
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
});

// إظهار خانة الـ Page ID عند إدخال Facebook API Key
document.getElementById('facebookApiKey')?.addEventListener('input', e => {
  document.getElementById('pageIdContainer').style.display = e.target.value.trim() ? 'block' : 'none';
});

// تحميل المستخدمين
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

// تحميل البوتات
async function fetchBots() {
  try {
    const res = await fetch('/api/bots', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const bots = await res.json();
    botsList = bots;
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

// إرسال البيانات لإنشاء أو تعديل بوت
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
  let passwordToSend;

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
    ...(passwordToSend && { password: passwordToSend }),
    ...(openaiKey && { openaiKey }),
    ...(facebookApiKey && { fbToken: facebookApiKey }),
    ...(pageId && { pageId })
  };

  const url = editingBotId ? `/api/bots/${editingBotId}` : '/api/bots/create';
  const method = editingBotId ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
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
      document.getElementById('showBotForm').textContent = '+ إنشاء بوت جديد';
      editingBotId = null;
      fetchBots();
    } else {
      createBotError.textContent = result.error || 'فشل في حفظ التعديلات';
    }
  } catch (err) {
    createBotError.textContent = 'حدث خطأ أثناء إرسال البيانات';
    console.error(err);
  }
});

// تعبئة النموذج للتعديل
function editBot(botId) {
  const bot = botsList.find(b => b._id === botId);
  if (!bot) return;

  editingBotId = botId;
  document.getElementById('botName').value = bot.name || '';
  document.getElementById('existingUsersSelect').value = bot.username || '';
  document.getElementById('newUsername').value = '';
  document.getElementById('newPassword').value = '';
  document.getElementById('openaiKey').value = bot.openaiKey || '';
  document.getElementById('facebookApiKey').value = bot.fbToken || '';
  document.getElementById('pageId').value = bot.pageId || '';
  document.getElementById('pageIdContainer').style.display = bot.fbToken ? 'block' : 'none';

  document.getElementById('createBotForm').style.display = 'block';
  document.getElementById('showBotForm').textContent = 'تعديل البوت';
}

// حذف البوت فعليًا
async function deleteBot(botId) {
  if (!confirm('هل أنت متأكد أنك تريد حذف هذا البوت؟')) return;

  try {
    const res = await fetch(`/api/bots/${botId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await res.json();

    if (res.ok) {
      fetchBots(); // إعادة تحميل القائمة بعد الحذف
    } else {
      alert(result.error || 'فشل في حذف البوت.');
    }
  } catch (err) {
    console.error('خطأ أثناء الحذف:', err);
    alert('حدث خطأ أثناء الحذف.');
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
