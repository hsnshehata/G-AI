const botsTable = document.querySelector('#bxBotsTable tbody');
const createBotError = document.getElementById('bxCreateError');
let botsList = [];
let editingBotId = null;

// تحميل قائمة المستخدمين
async function loadUsersDropdown() {
  try {
    const res = await fetch('/api/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const users = await res.json();
    const select = document.getElementById('bxUserSelect');
    select.innerHTML = '<option value="">اختر مستخدم</option>';
    users.forEach(user => {
      const option = document.createElement('option');
      option.value = user.username;
      option.textContent = user.username;
      select.appendChild(option);
    });
  } catch (err) {
    console.error('فشل في تحميل المستخدمين:', err);
  }
}

// إرسال بيانات البوت (إنشاء أو تعديل)
document.getElementById('bxCreateForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('bxName').value.trim();
  const username = document.getElementById('bxUserSelect').value.trim();
  const fbToken = document.getElementById('bxToken').value.trim();
  const openaiKey = document.getElementById('bxAIKey').value.trim();
  const notes = document.getElementById('bxExtra').value.trim();

  if (!name || !username) {
    createBotError.textContent = 'يرجى إدخال اسم البوت واختيار مستخدم';
    return;
  }

  const body = { name, username };
  if (fbToken) body.fbToken = fbToken;
  if (openaiKey) body.openaiKey = openaiKey;
  if (notes) body.notes = notes;

  const url = editingBotId ? `/api/bxbots/${editingBotId}` : '/api/bxbots/create';
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
      document.getElementById('bxCreateForm').reset();
      editingBotId = null;
      loadBXBots(); // تحديث القائمة
    } else {
      createBotError.textContent = result.error || 'فشل حفظ البيانات';
    }
  } catch (err) {
    console.error('فشل في الإرسال:', err);
    createBotError.textContent = 'حدث خطأ أثناء إرسال البيانات';
  }
});

// تحميل البوتات
async function loadBXBots() {
  try {
    const res = await fetch('/api/bxbots', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const bots = await res.json();
    botsList = bots;
    botsTable.innerHTML = '';

    if (!bots.length) {
      botsTable.innerHTML = '<tr><td colspan="3">لا توجد بوتات</td></tr>';
      return;
    }

    bots.forEach(bot => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${bot.name}</td>
        <td>${bot.username || 'غير معروف'}</td>
        <td>
          <button onclick="editBXBot('${bot._id}')">✏️</button>
          <button onclick="deleteBXBot('${bot._id}')">🗑️</button>
        </td>
      `;

      row.addEventListener('click', () => {
        document.querySelectorAll('#bxBotsTable tr').forEach(r => r.classList.remove('selected'));
        row.classList.add('selected');
        selectedBotId = bot._id;
        localStorage.setItem('selectedBotId', selectedBotId);
      });

      botsTable.appendChild(row);
    });
  } catch (err) {
    console.error('فشل تحميل البوتات:', err);
    botsTable.innerHTML = '<tr><td colspan="3">⚠️ خطأ في تحميل البيانات</td></tr>';
  }
}

function editBXBot(botId) {
  const bot = botsList.find(b => b._id === botId);
  if (!bot) return;

  editingBotId = botId;
  document.getElementById('bxName').value = bot.name || '';
  document.getElementById('bxUserSelect').value = bot.username || '';
  document.getElementById('bxToken').value = bot.fbToken || '';
  document.getElementById('bxAIKey').value = bot.openaiKey || '';
  document.getElementById('bxExtra').value = bot.notes || '';
}

async function deleteBXBot(botId) {
  if (!confirm('هل أنت متأكد من حذف البوت؟')) return;

  try {
    const res = await fetch(`/api/bxbots/${botId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const result = await res.json();
    if (res.ok) {
      loadBXBots();
    } else {
      alert(result.error || 'فشل في الحذف');
    }
  } catch (err) {
    console.error('فشل الحذف:', err);
    alert('حدث خطأ أثناء الحذف');
  }
}

// تحميل تبويب البوتات
function loadBXTab() {
  loadBXBots();
  loadUsersDropdown();
}

window.loadBXTab = loadBXTab;
window.loadUsersDropdown = loadUsersDropdown;
