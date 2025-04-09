const token = localStorage.getItem('token');
const role = localStorage.getItem('role');
const botsTable = document.querySelector('#botsTable tbody');
const createBotError = document.getElementById('createBotError');
let editingBotId = null;

// إظهار النموذج عند الضغط على الزر
document.getElementById('showBotForm')?.addEventListener('click', () => {
  const form = document.getElementById('createBotForm');
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
  resetForm(); // كل مرة بنفتحه نرجع الوضع الطبيعي
});

// إظهار حقل معرف الصفحة عند إدخال Facebook API Key
document.getElementById('facebookApiKey')?.addEventListener('input', e => {
  document.getElementById('pageIdContainer').style.display = e.target.value.trim() ? 'block' : 'none';
});

// تحميل المستخدمين لاستخدامهم في ربط البوت
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

// تحميل البوتات من السيرفر
async function fetchBots() {
  try {
    const res = await fetch('/api/bots', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const bots = await res.json();
    botsTable.innerHTML = '';

    if (bots.length === 0) {
      botsTable.innerHTML = '<tr><td colspan="3">لا توجد بوتات بعد</td></tr>';
      return;
    }

    bots.forEach(bot => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${bot.name}</td>
        <td>${bot.username || 'غير معروف'}</td>
        <td>
          <button onclick="editBot('${bot._id}', '${bot.name}', '${bot.username}')">✏️</button>
          <button onclick="deleteBot('${bot._id}')">🗑️</button>
        </td>
      `;

      row.style.cursor = 'pointer';
      row.addEventListener('click', () => {
        document.querySelectorAll('#botsTable tr').forEach(r => r.classList.remove('selected'));
        row.classList.add('selected');
      });

      botsTable.appendChild(row);
    });
  } catch (err) {
    botsTable.innerHTML = '<tr><td colspan="3">حدث خطأ أثناء تحميل البوتات ❌</td></tr>';
  }
}

// إرسال البيانات (إنشاء أو تعديل)
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
    createBotError.textContent = 'اختر مستخدم موجود أو أنشئ مستخدم جديد مع كلمة مرور';
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
      resetForm();
      fetchBots();
    } else {
      createBotError.textContent = result.error || 'فشل في إرسال البيانات';
    }
  } catch (err) {
    createBotError.textContent = 'حدث خطأ أثناء إرسال البيانات';
  }
});

// تهيئة التبويب
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

// تفعيل زر تعديل البوت
function editBot(botId, botName, username) {
  editingBotId = botId;

  document.getElementById('botName').value = botName;
  document.getElementById('existingUsersSelect').value = username;
  document.getElementById('createBotForm').style.display = 'block';
  document.querySelector('#createBotForm button[type="submit"]').textContent = 'تحديث';
}

// تفعيل زر حذف البوت
function deleteBot(botId) {
  if (!confirm('هل تريد حذف هذا البوت نهائيًا؟')) return;

  fetch(`/api/bots/${botId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(() => fetchBots())
    .catch(err => {
      console.error('خطأ أثناء الحذف:', err);
      alert('فشل في الحذف');
    });
}

// إعادة تعيين النموذج
function resetForm() {
  document.getElementById('createBotForm').reset();
  document.getElementById('createBotForm').style.display = 'none';
  document.getElementById('pageIdContainer').style.display = 'none';
  document.querySelector('#createBotForm button[type="submit"]').textContent = 'إنشاء';
  editingBotId = null;
  createBotError.textContent = '';
}
