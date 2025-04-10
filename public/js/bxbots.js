const bxBotsTable = document.querySelector('#bxBotsTable tbody');
const bxCreateForm = document.getElementById('bxCreateForm');
const bxCreateError = document.getElementById('bxCreateError');
const bxUserSelect = document.getElementById('bxUserSelect');
let bxEditingId = null;
let bxBotsList = [];

// زر إظهار/إخفاء النموذج
const showFormBtn = document.getElementById('showBXForm');
if (showFormBtn) {
  showFormBtn.addEventListener('click', () => {
    bxCreateForm.style.display = bxCreateForm.style.display === 'none' ? 'block' : 'none';
  });
}

// تحميل المستخدمين
async function loadBXUsers() {
  try {
    const res = await fetch('/api/users', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const users = await res.json();
    bxUserSelect.innerHTML = '<option value="">اختر مستخدم موجود</option>';
    users.forEach(user => {
      const option = document.createElement('option');
      option.value = user._id;
      option.textContent = user.username;
      bxUserSelect.appendChild(option);
    });
  } catch (err) {
    console.error('فشل تحميل المستخدمين:', err);
  }
}

// إنشاء مستخدم جديد
document.getElementById('bxUserForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const username = document.getElementById('newUsername').value.trim();
  const password = document.getElementById('newPassword').value;

  if (!username || !password) {
    document.getElementById('userCreateError').textContent = 'يرجى إدخال اسم المستخدم وكلمة المرور';
    return;
  }

  try {
    const res = await fetch('/api/users/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ username, password })
    });

    const result = await res.json();
    if (res.ok) {
      document.getElementById('userCreateError').textContent = '';
      document.getElementById('bxUserForm').reset();
      loadBXUsers(); // تحديث القائمة
      alert('✅ تم إنشاء المستخدم بنجاح');
    } else {
      document.getElementById('userCreateError').textContent = result.error || 'فشل في إنشاء المستخدم';
    }
  } catch (err) {
    console.error(err);
    document.getElementById('userCreateError').textContent = 'حدث خطأ أثناء الإرسال';
  }
});

// تحميل البوتات
async function loadBXBots() {
  try {
    const res = await fetch('/api/bxbots', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const bots = await res.json();
    bxBotsList = bots;
    bxBotsTable.innerHTML = '';

    if (!bots.length) {
      bxBotsTable.innerHTML = '<tr><td colspan="3">لا توجد بوتات بعد</td></tr>';
      return;
    }

    bots.forEach(bot => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${bot.bx_name}</td>
        <td>${bot.bx_userRef?.username || 'غير معروف'}</td>
        <td>
          <button onclick="editBXBot('${bot._id}')">✏️</button>
          <button onclick="deleteBXBot('${bot._id}')">🗑️</button>
        </td>
      `;
      bxBotsTable.appendChild(row);
    });
  } catch (err) {
    console.error('خطأ أثناء تحميل BXBots:', err);
  }
}

// إرسال نموذج البوت
bxCreateForm?.addEventListener('submit', async e => {
  e.preventDefault();

  const name = document.getElementById('bxName').value.trim();
  const user = bxUserSelect.value;
  const tokenVal = document.getElementById('bxToken').value.trim();
  const aiKey = document.getElementById('bxAIKey').value.trim();
  const extra = document.getElementById('bxExtra').value.trim();

  if (!name || !user) {
    bxCreateError.textContent = 'الاسم والمستخدم مطلوبان';
    return;
  }

  const body = {
    bx_name: name,
    bx_user: user,
    bx_token: tokenVal,
    bx_ai_key: aiKey,
    bx_extra: extra
  };

  const url = bxEditingId ? `/api/bxbots/${bxEditingId}` : '/api/bxbots/create';
  const method = bxEditingId ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    const result = await res.json();
    if (res.ok) {
      bxCreateError.textContent = '';
      bxCreateForm.reset();
      bxEditingId = null;
      loadBXBots();
    } else {
      bxCreateError.textContent = result.error || 'فشل في الحفظ';
    }
  } catch (err) {
    bxCreateError.textContent = 'حدث خطأ أثناء الإرسال';
    console.error(err);
  }
});

function editBXBot(id) {
  const bot = bxBotsList.find(b => b._id === id);
  if (!bot) return;

  bxEditingId = id;
  document.getElementById('bxName').value = bot.bx_name || '';
  document.getElementById('bxUserSelect').value = bot.bx_userRef?._id || '';
  document.getElementById('bxToken').value = bot.bx_token || '';
  document.getElementById('bxAIKey').value = bot.bx_ai_key || '';
  document.getElementById('bxExtra').value = bot.bx_extra || '';
}

async function deleteBXBot(id) {
  if (!confirm('هل تريد حذف هذا البوت؟')) return;

  try {
    const res = await fetch(`/api/bxbots/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    const result = await res.json();
    if (res.ok) {
      loadBXBots();
    } else {
      alert(result.error || 'فشل في الحذف');
    }
  } catch (err) {
    console.error('خطأ أثناء الحذف:', err);
  }
}

function loadBXTab() {
  loadBXUsers();
  loadBXBots();
}

window.loadBXTab = loadBXTab;
