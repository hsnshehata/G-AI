const botsTable = document.querySelector('#bxBotsTable tbody');
const createBotError = document.getElementById('bxCreateError');
let botsList = [];
let editingBotId = null;

// زر إظهار / إخفاء النموذج
document.getElementById('showBXForm')?.addEventListener('click', () => {
  const form = document.getElementById('bxCreateForm');
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
});

// تحميل المستخدمين في السلكت
async function loadUsersDropdown() {
  try {
    const res = await fetch('/api/users');
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
    console.error('فشل تحميل المستخدمين:', err);
  }
}

// تحميل البوتات
async function fetchBots() {
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
        <td>${bot.username || '—'}</td>
        <td>
          <button onclick="editBot('${bot._id}')">✏️</button>
          <button onclick="deleteBot('${bot._id}')">🗑️</button>
        </td>
      `;
      row.addEventListener('click', () => {
        document.querySelectorAll('#bxBotsTable tr').forEach(r => r.classList.remove('selected'));
        row.classList.add('selected');
        localStorage.setItem('selectedBotId', bot._id);
      });
      botsTable.appendChild(row);
    });
  } catch (err) {
    console.error('فشل تحميل البوتات:', err);
    botsTable.innerHTML = '<tr><td colspan="3">فشل في التحميل</td></tr>';
  }
}

// إنشاء أو تعديل بوت
document.getElementById('bxCreateForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('bxName').value.trim();
  const username = document.getElementById('bxUserSelect').value;
  const fbToken = document.getElementById('bxToken').value.trim();
  const openaiKey = document.getElementById('bxAIKey').value.trim();
  const extra = document.getElementById('bxExtra').value.trim();

  if (!name || !username) {
    createBotError.textContent = 'يرجى إدخال اسم البوت والمستخدم';
    return;
  }

  const body = { name, username, fbToken, openaiKey, extra };
  const url = editingBotId ? `/api/bxbots/${editingBotId}` : '/api/bxbots/create';
  const method = editingBotId ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'خطأ في إنشاء البوت');

    document.getElementById('bxCreateForm').reset();
    document.getElementById('bxCreateForm').style.display = 'none';
    createBotError.textContent = '';
    editingBotId = null;
    fetchBots();
  } catch (err) {
    createBotError.textContent = err.message;
  }
});

function editBot(id) {
  const bot = botsList.find(b => b._id === id);
  if (!bot) return;

  editingBotId = id;
  document.getElementById('bxName').value = bot.name;
  document.getElementById('bxUserSelect').value = bot.username;
  document.getElementById('bxToken').value = bot.fbToken || '';
  document.getElementById('bxAIKey').value = bot.openaiKey || '';
  document.getElementById('bxExtra').value = bot.extra || '';
  document.getElementById('bxCreateForm').style.display = 'block';
}

async function deleteBot(id) {
  if (!confirm('هل تريد حذف هذا البوت؟')) return;

  try {
    const res = await fetch(`/api/bxbots/${id}`, { method: 'DELETE' });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'فشل في حذف البوت');
    fetchBots();
  } catch (err) {
    alert(err.message);
  }
}

function loadBXTab() {
  loadUsersDropdown();
  fetchBots();
}

window.loadBXTab = loadBXTab;
