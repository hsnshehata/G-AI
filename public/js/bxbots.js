const botsTable = document.querySelector('#bxBotsTable tbody');
const createBotError = document.getElementById('bxCreateError');
let botsList = [];
let editingBotId = null;

// تحميل المستخدمين لقائمة الاختيار
async function loadUsersDropdown() {
  try {
    const res = await fetch('/api/users');
    const users = await res.json();
    const select = document.getElementById('bxUserSelect');
    select.innerHTML = '<option value="">اختر مستخدم</option>';
    users.forEach(user => {
      const opt = document.createElement('option');
      opt.value = user.username;
      opt.textContent = user.username;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error('❌ فشل في تحميل المستخدمين:', err);
  }
}

// تحميل البوتات
async function loadBXTab() {
  loadUsersDropdown(); // تحميل المستخدمين أولاً
  try {
    const res = await fetch('/api/bxbots');
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
        <td>${bot.username}</td>
        <td>
          <button onclick="editBot('${bot._id}')">✏️</button>
          <button onclick="deleteBot('${bot._id}')">🗑️</button>
        </td>
      `;
      row.style.cursor = 'pointer';
      row.addEventListener('click', () => {
        document.querySelectorAll('#bxBotsTable tr').forEach(r => r.classList.remove('selected'));
        row.classList.add('selected');
        selectedBotId = bot._id;
        localStorage.setItem('selectedBotId', selectedBotId);
      });

      botsTable.appendChild(row);
    });
  } catch (err) {
    botsTable.innerHTML = '<tr><td colspan="3">حدث خطأ أثناء تحميل البوتات</td></tr>';
    console.error(err);
  }
}

// إرسال النموذج
document.getElementById('bxCreateForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('bxName').value.trim();
  const username = document.getElementById('bxUserSelect').value;
  const fbToken = document.getElementById('bxToken').value.trim();
  const openaiKey = document.getElementById('bxAIKey').value.trim();
  const notes = document.getElementById('bxExtra').value.trim();

  if (!name || !username) {
    createBotError.textContent = '❌ اسم البوت واسم المستخدم مطلوبان';
    return;
  }

  const body = { name, username, fbToken, openaiKey, notes };
  const url = editingBotId ? `/api/bxbots/${editingBotId}` : '/api/bxbots/create';
  const method = editingBotId ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const result = await res.json();

    if (res.ok) {
      createBotError.textContent = '';
      document.getElementById('bxCreateForm').reset();
      editingBotId = null;
      loadBXTab();
    } else {
      createBotError.textContent = result.error || 'فشل في الحفظ';
    }
  } catch (err) {
    console.error(err);
    createBotError.textContent = 'حدث خطأ في إرسال البيانات';
  }
});

function editBot(id) {
  const bot = botsList.find(b => b._id === id);
  if (!bot) return;

  editingBotId = bot._id;
  document.getElementById('bxName').value = bot.name;
  document.getElementById('bxUserSelect').value = bot.username;
  document.getElementById('bxToken').value = bot.fbToken || '';
  document.getElementById('bxAIKey').value = bot.openaiKey || '';
  document.getElementById('bxExtra').value = bot.notes || '';
}

async function deleteBot(id) {
  if (!confirm('هل أنت متأكد أنك تريد حذف هذا البوت؟')) return;
  try {
    const res = await fetch(`/api/bxbots/${id}`, {
      method: 'DELETE'
    });

    const result = await res.json();

    if (res.ok) {
      loadBXTab();
    } else {
      alert(result.error || 'فشل في الحذف');
    }
  } catch (err) {
    console.error(err);
    alert('حدث خطأ في الحذف');
  }
}

window.loadBXTab = loadBXTab;
window.loadUsersDropdown = loadUsersDropdown;
